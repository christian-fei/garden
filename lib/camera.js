const { StillCamera } = require('pi-camera-connect')

exports.takePhoto = ({ width, height, rotation, flip, delay }) => {
  const camera = new StillCamera({ width, height, rotation, flip, delay })
  return camera.takeImage()
}
