/* eslint camelcase: 0 */

require('dotenv').config()

const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = process.env

const express = require('express')
const basicAuth = require('express-basic-auth')
const { takePhoto } = require('../lib/camera')

const app = express()
app.listen(3000)
// app.use(basicAuth({
//   users: {
//     [BASIC_AUTH_USERNAME]: BASIC_AUTH_PASSWORD
//   }
// }))

app.get('/photo', async (req, res) => {
  const buffer = await takePhoto()

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Content-Length': buffer.length
  })

  res.end(buffer)
})
