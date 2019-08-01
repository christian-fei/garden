#!/usr/bin/env node

const { promises: { read } } = require('node-dht-sensor')

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(function (err) {
      console.error(err)
      process.exit(1)
    })
} else {
  module.exports = main
}

async function main (type = 11, gpio = 4) {
  console.log('temperature running')

  const { temperature, humidity } = await read(type, gpio)
  console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)

  setTimeout(main, 10000, type, gpio)
}
