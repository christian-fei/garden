const got = require('got')

exports.gatherIP = () => {
  return got.get('https://ipconfig.io/json', {json: true}).then(({ip}) => ip)
}
