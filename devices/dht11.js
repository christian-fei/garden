#!/usr/bin/env node

const { broadcast } = require('../lib/ipc')
const schedule = require('node-schedule')
const temperatureMoistureHistory = require('../lib/temperature-moisture-history')
const {read} = require('../lib/dht11')
const history = temperatureMoistureHistory.read()
const previous = { temperature: undefined, humidity: undefined }

schedule.scheduleJob('*/5 * * * *', async function () {
  const sample = await read()
  Object.assign(previous, sample)
  history.push(sample)
  if (history.length > 10000) {
    history.splice(history.length - 10000, history.length)
  }
  temperatureMoistureHistory.write(history)
})

schedule.scheduleJob('0 * * * *', async function () {
  await broadcast('dht11', previous)
})
schedule.scheduleJob('30 * * * *', async function () {
  await broadcast('dht11', previous)
})

process.on('beforeExit', (code) => console.log('-- beforeExit with code: ', code))
process.on('disconnect', () => console.log('-- disconnet'))
process.on('exit', (code) => console.log('-- exit with code: ', code))
// process.on('message', (message) => console.log('-- message', message))
// process.on('multipleResolves', (type, promise, reason) => {
//   console.error('-- multipleResolves', type, promise, reason)
//   setImmediate(() => process.exit(1))
// })
process.on('rejectionHandled', (promise) => console.log('-- rejectionHandled', promise))
process.on('uncaughtException', (err, origin) => console.log('-- uncaughtException', err, origin))
process.on('unhandledRejection', (reason, promise) => console.log('-- unhandledRejection', promise, reason))
process.on('warning', (warning) => console.log('-- warning', warning))
