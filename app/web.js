require('dotenv').config()

const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = process.env
console.log('BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD', BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD)

const express = require('express')
const basicAuth = require('express-basic-auth')
const { takePhoto, takeVideo } = require('../lib/camera')
const { gatherIP } = require('../lib/ip')
const { gatherReport } = require('../lib/report')

const app = express()
app.listen(3000)
app.use(basicAuth({
  users: {
    [BASIC_AUTH_USERNAME]: BASIC_AUTH_PASSWORD
  },
  challenge: true,
  realm: 'Imb4T3st4pp'
}))

app.get('/ip', async (req, res) => {
  res.end(await gatherIP())
})
app.get('/', async (req, res) => {
  res.end(await gatherReport())
})
app.get('/report', async (req, res) => {
  res.end(await gatherReport())
})
app.get('/photo', async (req, res) => {
  const buffer = await takePhoto()

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Content-Length': buffer.length
  })

  res.end(buffer)
})
app.get('/video', async (req, res) => {
  const buffer = await takeVideo()

  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': buffer.length
  })

  res.end(buffer)
})
