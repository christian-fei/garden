const { read } = require('../lib/dht11')

setImmediate(async function probe (model = 11, gpio = 4) {
  try {
    const { date, temperature, humidity, heatIndex } = await read(model, gpio)
    console.log({ date, temperature, humidity, heatIndex })
  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(probe, 2500, model, gpio)
  }
})
