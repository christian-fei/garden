const { createReadStream, readFileSync } = require('fs')
const path = require('path')
const { file } = require('tmp')
const ffmpeg = require('fluent-ffmpeg')
const raspivid = require('raspivid')

exports.takePhoto = (options) => {
  console.log('/photo', options)
  return readFileSync(path.resolve('/home/pi/snapshots/last.jpg'))
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
