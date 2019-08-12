const { promises: { read } } = require('node-dht-sensor')
const HI = require('heat-index')

const gpio = 17
const model = 11

exports.read = (gpio = 17, model = 11) => {
  return read(model, gpio)
    .then(({ temperature, humidity }) => {
      const date = new Date().toISOString()
      const heatIndex = HI.heatIndex({ temperature, humidity })
      return { date, temperature, humidity, heatIndex }
    })
}