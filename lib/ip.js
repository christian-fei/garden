const http = require('http')

publicIP()
  .then(console.log)
  .catch(console.error)

module.exports = {
  publicIP
}

async function publicIP () {
  return new Promise((resolve, reject) => {
    http.get('http://ipconfig.io/json', res => {
      if (res.statusCode !== 200) return
      parseJson(res)
        .then(({ ip }) => resolve(ip))
        .catch(reject)
    })
  })

  function parseJson (readable, buffer = []) {
    return new Promise((resolve, reject) => {
      readable.on('error', reject)
      readable.on('data', buffer.push.bind(buffer))
      readable.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(buffer)))
        } catch (err) {
          reject(err)
        }
      })
    })
  }
}
