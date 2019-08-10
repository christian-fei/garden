const execa = require('execa')
const fs = require('fs')

module.exports = {
  takeCurrentSnapshot,
  readCurrentSnapshot
}

async function takeCurrentSnapshot () {
  return execa('/home/pi/garden/current/take-current-snapshot')
}
async function readCurrentSnapshot () {
  return fs.readFileSync('/home/pi/snapshots/current.jpg')
}
