if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(function (err) {
      console.error(err)
      process.exit(1)
    })
}

async function main () {
  console.log('temperature running')
}
