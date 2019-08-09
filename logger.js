process.on('message', packet => {
  console.log('%s |', new Date().toISOString(), packet)
})
