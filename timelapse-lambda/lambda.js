'use strict'

const { promisify } = require('util')
const fs = require('fs')
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const getObject = promisify(S3.getObject).bind(S3)

// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
// ffmpeg.setFfmpegPath(ffmpegPath)

exports.handler = function (event, context, cb) {
  S3.listObjects({
    Bucket: event.Bucket
  }, function (err, data) {
    if (err) {
      console.error(err)
      return cb(err)
    }

    const amount = Number.isFinite(event.Amount) ? event.Amount : 10
    const files = data.Contents.filter((d, i) => i > data.Contents.length - 1 - amount).map(d => d.Key)

    const instance = ffmpeg()
    // console.log('ffmpegPath', ffmpegPath)
    // cb(null, ffmpegPath)
    // cb(null, JSON.stringify(instance))

    const outFilename = `/tmp/out.mp4`

    Promise.all(files.map(file => {
      var params = {
        Bucket: event.Bucket,
        Key: file
      }
      return getObject(params)
    }))
      .then(results => {
        // cb(null, results.map(r => JSON.stringify(r)))
        results.forEach((r, i) => {
          const tmpFilePath = `/tmp/${i}.jpg`
          console.log(r)
          fs.writeFileSync(tmpFilePath, r.Body)
          instance.addInput(tmpFilePath)
        })
        instance
          .on('end', function () {
            console.log('Processing finished !')
            cb(null, { files: results.length, cwd: process.cwd(), out: fs.readFileSync(outFilename) })
          })
          .save(outFilename, { end: true })
      })
      .catch(err => {
        cb(err)
      })
  })
}
