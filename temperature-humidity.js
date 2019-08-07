#!/usr/bin/env node

const pm2 = require('pm2')

pm2.connect(onceConnected)

function onceConnected (err) {
  if (err) {
    console.error('pm2 connection failure', err)
    return
  }

  // const { temperature, humidity } = await read(type, gpio)
  // console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)

  const temperature = 50
  const humidity = 50

  setTimeout(onceConnected, 5000)

  pm2.list((err, procs) => {
    if (err) {
      console.error('pm2 procs error', err)
      return
    }
    procs.forEach(({ pm_id: id }) => {
      pm2.sendDataToProcessId({
        type: 'process:msg',
        topic: 'dht11', // can be anything
        data: { temperature, humidity },
        id
      }, (err, res) => {
        if (err) {
          console.error('pm2 send failure', err)
          return
        }
        console.log('pm2 send res', res)
      })
    })
  })
}
