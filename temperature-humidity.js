#!/usr/bin/env node

// const { promises: { read } } = require('node-dht-sensor')
const pm2 = require('pm2')

if (require.main === module) {
  pm2.connect((err) => {
    if (err) return console.error(err)

    main()
  })
} else {
  module.exports = main
}

async function main (type = 11, gpio = 4) {
  console.log('temperature / humidity running')

  try {
    // const { temperature, humidity } = await read(type, gpio)
    // console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)
    console.log('running')
    pm2.list((err, processes) => {
      if (err) { return console.error(err) }
      console.log('processes', processes)
      for (const p of processes) {
        pm2.sendDataToProcessId(p.pm_id, {
          type: 'temperature',
          temperature: 30,
          humidity: 50
        })
      }
    })
    setTimeout(main, 10000, type, gpio)
  } catch (err) {
    console.log(err)
  }
}

process.on('unhandledRejection', (err) => console.error(err))
process.on('uncaughtException', (err) => console.error(err))
