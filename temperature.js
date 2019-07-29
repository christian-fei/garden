if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(function (err) {
      console.error(err)
      process.exit(1)
    })
}

async function main () {
  setTimeout(() => {
    console.log('temperature running')
  }, 1000 * 60 * 5)
}
