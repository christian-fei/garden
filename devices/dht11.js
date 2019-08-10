#!/usr/bin/env node

const { basename } = require('path')
const { promises: { read } } = require('node-dht-sensor')
const { broadcast } = require('../lib/ipc')
const schedule = require('node-schedule')
const sparkly = require('sparkly')
const temperatureMoistureHistory = require('../lib/temperature-moisture-history')
const topicName = filename => basename(filename).replace('.js', '')
const model = 11
const gpio = 4
const history = temperatureMoistureHistory.read()
const previous = { temperature: undefined, humidity: undefined }

schedule.scheduleJob('*/5 * * * *', async function () {
  try {
    const { temperature, humidity } = await read(model, gpio)
    if (previous.temperature !== temperature || previous.humidity !== humidity) {
      await broadcast(topicName(__filename), { temperature, humidity })
      Object.assign(previous, { temperature, humidity })
    }
    history.push({ temperature, humidity, date: new Date().toISOString() })
    temperatureMoistureHistory.write(history)
    if (history.length > 3) {
      const temperatureChart = sparkly(history.map((d, i) => d.temperature))
      const humidityChart = sparkly(history.map((d, i) => d.humidity))
      process.stdout.write(`\n${temperatureChart}\n`)
      process.stdout.write(`\n${humidityChart}\n`)
      await broadcast('temperature-history', temperatureChart)
      await broadcast('humidity-history', humidityChart)
    }
  } catch (err) {
    console.error(err)
  }
})

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
