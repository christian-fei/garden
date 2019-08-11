const { Gpio } = require('onoff')

const relay = new Gpio(21, 'out')

process.once('beforeExit', async (code) => {
  console.log('-- before-exit teardown start...')
  await relay.unexport()
  console.log('-- before-exit teardown complete!')
})

exports.forceOff = ({ delay }) => {
  return wait(delay)
    .then(() => relay.read())

  function wait (delay) {
    if delay === 0 return Promise.resolve()
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

exports.forceOn = ({ timeout }) => {
}
