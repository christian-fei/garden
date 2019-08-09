#!/usr/bin/env node

const { basename } = require('path')
const { promises: { read } } = require('node-dht-sensor')
const { broadcast } = require('../lib/ipc')

const topicName = filename => basename(filename).replace('.js', '')

const SENSOR_READ_INTERVAL = 1000 * 60

const previous = { temperature: undefined, humidity: undefined }
setImmediate(async function main (model, gpio, { assign } = Object) {
  try {
    const { temperature, humidity } = await read(model, gpio)
    setTimeout(main, SENSOR_READ_INTERVAL, model, gpio)
    if (previous.temperature !== temperature || previous.humidity !== humidity) {
      await broadcast(topicName(__filename), { temperature, humidity })
      assign(previous, { temperature, humidity })
    }
  } catch (err) {
    console.error(err)
  }
}, 11, 4)

process.on('beforeExit', (code) => console.log('-- beforeExit with code: ', code))
process.on('disconnect', () => console.log('-- disconnet'))
process.on('exit', (code) => console.log('-- exit with code: ', code))
process.on('message', (message) => console.log('-- message', message))
process.on('multipleResolves', (type, promise, reason) => {
  console.error('-- multipleResolves', type, promise, reason)
  setImmediate(() => process.exit(1))
})
process.on('rejectionHandled', (promise) => console.log('-- rejectionHandled', promise))
process.on('uncaughtException', (err, origin) => console.log('-- uncaughtException', err, origin))
process.on('unhandledRejection', (reason, promise) => console.log('-- unhandledRejection', promise, reason))
process.on('warning', (warning) => console.log('-- warning', warning))
