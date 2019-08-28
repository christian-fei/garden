'use strict'

const { promisify } = require('util')
const fs = require('fs')
const writeFilePromise = promisify(fs.writeFile).bind(fs)
const ffmpeg = require('fluent-ffmpeg')
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const listObjects = promisify(S3.listObjects).bind(S3)
const getObject = promisify(S3.getObject).bind(S3)
const putObject = promisify(S3.putObject).bind(S3)

exports.handler = function ({ bucket = 'snapshots', name = 'timelapse.mp4', amount = 24, fps = 6 }, context, cb) {
  downloadS3Images({ bucket })
    .then(() => createTimelapse({ name, fps }))
    .then(() => saveTimelapseToS3({ bucket, name }))
    .then((data) => cb(null, { success: true, data, bucket, name, amount, fps }))
    .catch(err => cb(err))

  function timelapsePathFor (name) { return `/tmp/${name}` }

  function downloadS3Images ({ bucket } = {}) {
    if (!bucket) throw new Error('bucket missing')
    return listObjects({ Bucket: bucket })
      .then(data => {
        const files = data.Contents
          .filter(d => d.Key.startsWith('201'))
          .filter((d, i) => i > (data.Contents.length - 1 - amount)).map(d => d.Key)

        return Promise.all(files.map(file => getObject({ Bucket: bucket, Key: file })))
      })
      .then(files => Promise.all(files.map((file, i) => writeFilePromise(`/tmp/${i}.jpg`, file.Body))))
  }

  function createTimelapse ({ name, fps } = {}) {
    const timelapsePath = timelapsePathFor(name)
    return new Promise((resolve, reject) => {
      ffmpeg().addInput('/tmp/%01d.jpg').noAudio().outputOptions(`-r ${fps}`).videoCodec('libx264')
        .on('error', (err) => { console.error('Error during processing', err); reject(err) })
        .on('end', () => { console.log('Processing finished !'); resolve() })
        .save(timelapsePath, { end: true })
    })
  }

  function saveTimelapseToS3 ({ bucket, name }) {
    const timelapsePath = timelapsePathFor(name)
    return putObject({ Body: fs.readFileSync(timelapsePath), Bucket: bucket, Key: name })
  }
}
