'use strict'

const { promisify } = require('util')
const fs = require('fs')
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const listObjects = promisify(S3.listObjects).bind(S3)
const getObject = promisify(S3.getObject).bind(S3)
const putObject = promisify(S3.putObject).bind(S3)

const ffmpeg = require('fluent-ffmpeg')
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
// ffmpeg.setFfmpegPath(ffmpegPath)

exports.handler = function (event, context, cb) {
  const instance = ffmpeg()
  const outFilePath = `/tmp/out.mp4`

  listObjects({
    Bucket: event.Bucket
  })
    .then(data => {
      const amount = Number.isFinite(event.Amount) ? event.Amount : 10
      const files = data.Contents.filter((d, i) => i > (data.Contents.length - 1 - amount)).map(d => d.Key)

      return Promise.all(files.map(file => {
        var params = {
          Bucket: event.Bucket,
          Key: file
        }
        return getObject(params)
      }))
    })
    .then(results => {
      results.forEach((r, i) => {
        const tmpFilePath = `/tmp/${i}.jpg`
        fs.writeFileSync(tmpFilePath, r.Body)
        instance.addInput(tmpFilePath)
      })

      return new Promise((resolve, reject) => {
        instance
          .on('end', function () {
            console.log('Processing finished !')
            resolve()
          })
          .save(outFilePath, { end: true })
      })
    })
    .then(() => {
      var params = {
        // ACL: 'authenticated-read',
        Body: fs.readFileSync(outFilePath),
        Bucket: event.Bucket,
        Key: 'timelapse.mp4'
      }
      S3.putObject(params, function (err, data) {
        cb(err, data)
        // cb(null, { success: true, file: outFilePath })
      })
    })
    .catch(err => {
      cb(err)
    })
}
