const fs = require('fs')

module.exports = {
  read,
  write
}

const jsonPath = '/home/pi/temperature-moisture-history.json'

function read () {
  try {
    const contents = fs.readFileSync(jsonPath, {encoding: 'utf8'})
    return JSON.parse(contents)
  } catch (err) {
    console.error(err)
  }
  return []
}

function write (history) {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(history))
  } catch (err) {
    console.error(err)
  }
  return history
}
