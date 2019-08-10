const http = require('http')

module.exports = {
  publicIP
}

async function publicIP () {
  let content = ''
  return new Promise((resolve, reject) => {
    http.get('http://ipconfig.io/json', (res) => {
      if (res.statusCode === 200) {
        res.on('data', (data) => {
          content += data
        })
        res.on('end', () => {
          const {ip} = JSON.parse(content)
          resolve(ip)
        })
        res.on('error', (err) => reject(err))
      }
    })
  })
}
