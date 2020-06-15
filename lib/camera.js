const { createReadStream, readFileSync } = require('fs')
const path = require('path')
const { file } = require('tmp')
const { promisify } = require('util')
const { StillCamera } = require('pi-camera-connect')
const AWS = require('aws-sdk')

// const { Readable } = require('stream')
const ffmpeg = require('fluent-ffmpeg')
const raspivid = require('raspivid')

exports.takePhoto = (options) => {
  console.log('/photo', options)
  const camera = new StillCamera(options)
  return camera.takeImage()
}
exports.lastPhoto = (options) => {
  console.log('/photo/last', options)
  return readFileSync(path.resolve('/home/pi/snapshots/last.jpg'))
}

exports.takeVideo = (options) => {
  return new Promise((resolve, reject) => {
    file({ postfix: '.mp4' }, (err, path, _, cleanup) => {
      if (err) return reject(err)
      console.log('/video', options, path)
      const settings = Object.assign({
        timeout: 10000,
        width: 1640,
        height: 1232
      }, options)
      const video = raspivid(settings)
      ffmpeg(video)
        .outputOptions('-c:v', 'copy')
        .on('end', () => {
          resolve(path)
          const stream = createReadStream(path).on('close', cleanup)
          resolve(stream) // stream allows to clean up tmp files
        })
        .save(path)
    })
  })
}

exports.takeTimelapse = ({ name = 'timelapse.mp4', bucket = 'garden-snapshots', amount = 48, fps = 6 } = {}) => {
  const region = 'us-east-1'
  const apiVersion = 'latest'
  const lambda = new AWS.Lambda({ apiVersion, region })
  const invokeParams = {
    FunctionName: 'GardenTimelapse',
    Payload: JSON.stringify({ bucket, name, amount, fps })
  }

  return new Promise((resolve, reject) => {
    lambda.invoke(invokeParams, async (err, result) => {
      if (err) return reject(err)
      const S3 = new AWS.S3()
      const getObject = promisify(S3.getObject).bind(S3)
      const { Body: buffer } = await getObject({ Bucket: bucket, Key: name })
      resolve(buffer)
      // const readable = new Readable()
      // readable._read = () => {} // _read is required but you can noop it
      // readable.push(buffer)
      // readable.push(null)
      // resolve(readable)
    })
  })
}
