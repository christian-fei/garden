'use strict'

const { promisify } = require('util')
const fs = require('fs')
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const listObjects = promisify(S3.listObjects).bind(S3)
const getObject = promisify(S3.getObject).bind(S3)
const putObject = promisify(S3.putObject).bind(S3)

const ffmpeg = require('fluent-ffmpeg')

exports.handler = function ({ Bucket = 'garden-snapshots', Amount = 96, Fps = 6 }, context, cb) {
  const timelapsePath = `/tmp/timelapse.mp4`

  downloadS3Images({ Bucket })
    .then(createTimelapse)
    .then(saveTimelapseToS3)
    .then((data) => cb(null, { success: true, data }))
    .catch(err => cb(err))

  function downloadS3Images ({ Bucket } = {}) {
    if (!Bucket) throw new Error('Bucket missing')
    return listObjects({ Bucket })
      .then(data => {
        const files = data.Contents
          .filter(d => d.Key.startsWith('201'))
          .filter((d, i) => i > (data.Contents.length - 1 - Amount)).map(d => d.Key)

        const tasks = files.map(Key => getObject({ Bucket, Key }))

        return Promise.all(tasks)
      })
      .then(results => {
        results.forEach((r, i) => fs.writeFileSync(`/tmp/${i}.jpg`, r.Body))
      })
  }

  function createTimelapse () {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .addInput('/tmp/%01d.jpg')
        .noAudio()
        .outputOptions(`-r ${Fps}`)
        .videoCodec('libx264')
        .on('error', (err) => {
          reject(err)
        })
        .on('end', () => {
          console.log('Processing finished !')
          resolve()
        })
        .save(timelapsePath, { end: true })
    })
  }

  function saveTimelapseToS3 () {
    return putObject({
      // ACL: 'authenticated-read',
      Body: fs.readFileSync(timelapsePath),
      Bucket: Bucket,
      Key: 'timelapse.mp4'
    })
  }
}
