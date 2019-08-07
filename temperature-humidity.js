#!/usr/bin/env node

// const { promises: { read } } = require('node-dht-sensor')
const pm2 = require('pm2')

setInterval(main, 10000)

function main () {
  pm2.connect((errConnect) => {
    if (errConnect) return console.error(errConnect)
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
            data: {
              temperature: 30,
              humidity: 50
            },
            topic: 'temperature-humidity'
          })
        }
      })
    } catch (err) {
      console.log(err)
    }
  })
}

process.on('unhandledRejection', (err) => console.error(err))
process.on('uncaughtException', (err) => console.error(err))
