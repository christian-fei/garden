process.on('message', ({ topic, data }) => {
  console.log('%s | %s : ', new Date().toISOString(), topic, data)
})
