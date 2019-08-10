const http = require('http')

module.exports = {
  publicIP
}

async function publicIP () {
  let content = ''
  return new Promise((resolve, reject) => {
    http.get('http://ipconfig.io', (res) => {
      if (res.statusCode === 200) {
        res.on('data', (data) => {
          content += data
          console.log('content++', content)
        })
        res.on('end', () => {
          console.log('content end', content)
          resolve(content)
        })
        res.on('error', (err) => reject(error))
      }
    })
  })
}
