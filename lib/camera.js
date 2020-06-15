const { readFileSync } = require('fs')
const path = require('path')

exports.takePhoto = (options) => {
  console.log('/photo', options)
  return readFileSync(path.resolve('/home/pi/snapshots/last.jpg'))
}
