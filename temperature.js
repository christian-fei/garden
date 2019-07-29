#!/usr/bin/env node

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(function (err) {
      console.error(err)
      process.exit(1)
    })
} else {
  module.exports = main
}

async function main () {
  return new Promise(() => setInterval(() => {
    console.log('temperature running')
  }, 1000 * 60 * 5))
}
