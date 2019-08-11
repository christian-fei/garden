const sparkly = require('sparkly')
const got = require('got') // todo: use http/https instead
const temperatureMoistureHistory = require('./temperature-moisture-history')

const { stringify } = require('querystring')
const { env: { OPEN_WEATHER_MAP_API_KEY } } = process

exports.gatherReport = (chat) => {
  const history = temperatureMoistureHistory.read()
  if (history.length < 4) return

  const query = stringify({
    lat: 46.1008181,
    lon: 11.1105323,
    appid: OPEN_WEATHER_MAP_API_KEY
  })
  return got(`https://api.openweathermap.org/data/2.5/weather?${query}`, { json: true })
    .then(({
      body: {
        weatherData: {
          weather: [{
            description
          }] = [{ description: String.prototype }],
          main: {
            temp: temperature,
            temp_min: minTemperature,
            temp_max: maxTemperature
          },
          dt: time,
          sys: {
            sunrise,
            sunset
          }
        }
      }
    }) => {
      const { temperature: relativeTemperature, humidity: relativeHumidity } = history[history.length - 1]

      const last2h = history.splice(history.length - 24, history.length)
      const temperatureChart = sparkly(last2h.map((d, i) => d.temperature))
      const humidityChart = sparkly(last2h.map((d, i) => d.humidity))
      return `🌡 Temperature ${
        relativeTemperature
      }ºC (last 2h)\n${
        temperatureChart
      }\n💦 Moisture ${
        relativeHumidity
      }% (last 2h)\n${
        humidityChart
      }\n🌦 Weather (last updated ${
        new Date(time * 1000 + 1000 * 60 * 60 * 2).toISOString()
      })\nCondition: ${
        description
      }}\nSunrise ${
        new Date(sunrise * 1000 + 1000 * 60 * 60 * 2).toISOString()
      }\nSunset ${
        new Date(sunset * 1000 + 1000 * 60 * 60 * 2).toISOString()
      }\nTemperature: ${
        (temperature - 273.15).toFixed(1)
      } (min ${
        (minTemperature - 273.15).toFixed(1)
      } - ${
        (maxTemperature - 273.15).toFixed(1)
      })`
    })
}
