const { Gpio } = require('onoff')
const { takeVideo } = require('../lib/camera')

const relay = new Gpio(21, 'out')

process.on('SIGINT', async function () {
  try {
    console.log('-- sigint teardown start...')
    await relay.write(0)
    await relay.unexport()
    console.log('-- sigint teardown complete!')
    process.exit(0)
  } catch (err) {
    process.exit(1)
  }
})
process.on('exit', async (code) => {
  console.log('-- exit, bye')
})

exports.forceOff = ({ delay }) => {
  return wait(delay)
    .then(() => relay.write(0))
}

exports.forceOn = (settings) => {
  return Promise.all([relay.write(1), takeVideo(settings)])
    .then(([, video]) => relay.write(0).then(() => video))
}

function wait (delay) {
  if (delay === 0) return Promise.resolve()
  return new Promise(resolve => setTimeout(resolve, delay))
}
