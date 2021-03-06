const { promises: { read } } = require('node-dht-sensor')
const HI = require('heat-index')

exports.read = (model = 11, gpio = 17) => {
  return read(model, gpio)
    .then(({ temperature, humidity }) => {
      const date = new Date().toISOString()
      const heatIndex = HI.heatIndex({ temperature, humidity })
      return { date, temperature, humidity, heatIndex }
    })
}
