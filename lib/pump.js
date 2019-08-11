const { Gpio } = require('onoff')

const relay = new Gpio(21, 'out')

exports.forceOff = ({ delay }) => {
  return relay.read()
    .then(status => status !== 0 && wait(delay))
    .then(status => status !== 0 && relay.write(0))
    .then(() => relay.read())

  function wait (delay) {
    if delay === 0 return Promise.resolve()
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

exports.forceOn = ({ timeout }) => {
}

process.once('beforeExit', async (code) => {
  console.log('-- before-exit -> teardown start...')
  await relay.unexport()
  console.log('-- before-exit -> teardown complete!')
})
