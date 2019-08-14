/* eslint camelcase: 0 */

require('dotenv').config()

const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = process.env
console.log('BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD', BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD)

const express = require('express')
const basicAuth = require('express-basic-auth')
const { takePhoto } = require('../lib/camera')

const app = express()
app.listen(3000)
app.use(basicAuth({
  users: {
    [BASIC_AUTH_USERNAME]: BASIC_AUTH_PASSWORD
  },
  challenge: true,
  realm: 'Imb4T3st4pp'
}))

app.get('/photo', async (req, res) => {
  const buffer = await takePhoto()

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Content-Length': buffer.length
  })

  res.end(buffer)
})