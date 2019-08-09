#!/usr/bin/env node

const { basename } = require('path')
const { promises: { read } } = require('node-dht-sensor')
const { broadcast } = require('../lib/ipc')

let previous = {
  temperature: undefined,
  humidity: undefined
}

setImmediate(async function main (model, gpio, { assign } = Object) {
  try {
    const { temperature, humidity } = await read(model, gpio)
    console.log('%s | GPIO=%d Temperature=%d°C Humidity=%d%', new Date().toISOString(), gpio, temperature, humidity)
    if (previous.temperature !== temperature || previous.humidity !== humidity) {
      await broadcast(basename(__filename), { temperature, humidity })
      assign(previous, { temperature, humidity })
    }
  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(main, 2500, model, gpio)
  }
}, 11, 4)
