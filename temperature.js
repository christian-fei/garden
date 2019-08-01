#!/usr/bin/env node

const { promises: { read } } = require('node-dht-sensor')

if (require.main === module) {
  setImmediate(main, 11, 4)
} else {
  module.exports = main
}

async function main (type = 11, gpio = 4) {
  console.log('temperature running')

  try {
    const { temperature, humidity } = await read(type, gpio)
    console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)
  } catch (err) {
    console.error(err)
  }

  setTimeout(main, 10000, type, gpio)
}
