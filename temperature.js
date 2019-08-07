#!/usr/bin/env node

// const { promises: { read } } = require('node-dht-sensor')

if (require.main === module) {
  main()
} else {
  module.exports = main
}

async function main (type = 11, gpio = 4) {
  console.log('temperature running')

  try {
    // const { temperature, humidity } = await read(type, gpio)
    // console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)
    console.log('running')
    setTimeout(main, 10000, type, gpio)
  } catch (err) {
    console.log(err)
  }
}

process.on('unhandledRejection', (err) => console.error(err))
process.on('uncaughtException', (err) => console.error(err))
