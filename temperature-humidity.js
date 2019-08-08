#!/usr/bin/env node

const { broadcast } = require('./lib/ipc')

setImmediate(async function main (model, gpio) {
  try {
    const { temperature, humidity } = await read(model, gpio)
    console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)
    await broadcast('dht11', { temperature, humidity })
  } catch (err) {
    console.log(err)
  } finally {
    setTimeout(main, seconds(5), model, gpio)
  }
}, 11, 4)

async function read () {
  const temperature = 10 + 45 * Math.random()
  const humidity = 30 + 40 * Math.random()
  return { temperature, humidity }
}

function seconds (s) {
  return s * 1000
}
