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
    if (previous.temperature === temperature && previous.humidity === humidity) return
    // notify only if value changed
    await broadcast(basename(__filename), { temperature, humidity })
    assign({ previous, { temperature, humidity })
    console.log('%s | ipc broadcast', new Date().toISOString())
  } catch (err) {
    console.log('%s | ', new Date().toISOString(), err)
  } finally {
    setTimeout(main, 2500, model, gpio)
    console.log('%s | sleep %dms', new Date().toISOString(), 2500)
  }
}, 11, 4)
