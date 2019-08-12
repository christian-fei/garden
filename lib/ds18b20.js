const { readSimpleC } = require('ds18b20-raspi')

exports.read = () => {
  return new Promise((resolve, reject) => {
    readSimpleC(3, (err, temperature) => {
      if (err) reject(err)
      const date = new Date().toISOString()
      resolve({ date, temperature })
    })
  })
}

setInterval(function () {
  exports.read().then(console.log)
}, 2000)
