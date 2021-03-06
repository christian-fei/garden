const pm2 = require('pm2')

exports.broadcast = (topic, data) => {
  return new Promise((resolve, reject) => {
    pm2.connect(function (err) {
      if (err) return reject(err)
      console.log('ipc connected')
      pm2.list(function (err, list) {
        if (err) return reject(err)
        console.log('ipc got list')

        const queue = list.filter(isNeighbor).map(toResponse)

        if (queue.length === 0) {
          console.log('ipc no neigbors')
          pm2.disconnect()
          return resolve()
        }

        Promise.all(queue).then(resolve).catch(reject).then(pm2.disconnect.bind(pm2))
      })
    })
  })

  function isNeighbor (item) {
    return process.env.pm_id !== item.pm_id
  }

  function toResponse (item) {
    return new Promise((resolve, reject) => {
      pm2.sendDataToProcessId({ id: item.pm_id, topic, data, type: 'process:msg' }, (err, res) => {
        if (err) reject(err)
        resolve(res)
      })
    })
  }
}
