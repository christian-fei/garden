const { Gpio } = require('onoff')

const relay = new Gpio(21, 'out')

process.on('SIGINT', async (code) => {
  console.log('-- sigint teardown start...')
  await relay.unexport()
  console.log('-- sigint teardown complete!')
})

process.on('beforeExit', async (code) => {
  console.log('-- before-exit teardown start...')
  await relay.unexport()
  console.log('-- before-exit teardown complete!')
})

process.on('exit', async (code) => {
  console.log('-- exit')
})

exports.forceOff = ({ delay }) => {
  return wait(delay)
    .then(() => relay.write(0))

  function wait (delay) {
    if (delay === 0) return Promise.resolve()
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

exports.forceOn = ({ timeout }) => {
}
