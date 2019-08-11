const { createReadStream } = require('fs')
const { file } = require('tmp')
const { StillCamera } = require('pi-camera-connect')

const ffmpeg = require('fluent-ffmpeg')
const raspivid = require('raspivid')

exports.takePhoto = (options) => {
  console.log('/camera/take_photo', options)
  const camera = new StillCamera(options)
  return camera.takeImage()
}

exports.takeVideo = (options) => {
  return new Promise((resolve, reject) => {
    file({ postfix: '.mp4' }, (err, path, _, cleanup) => {
      if (err) return reject(err)
      console.log('/camera/take_video', options, path)
      const settings = Object.assign({ timeout: 5000 }, options)
      const video = raspivid(settings)
      ffmpeg(video)
        .outputOptions('-c:v', 'copy')
        .on('end', () => {
          const stream = createReadStream(path).on('close', cleanup)
          resolve(stream) // stream allows to clean up tmp files
        })
        .save(path)
    })
  })
}
