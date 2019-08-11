const sparkly = require('sparkly')
const got = require('got') // todo: use http/https instead
const temperatureMoistureHistory = require('./temperature-moisture-history')

const { stringify } = require('querystring')
const { env: { OPEN_WEATHER_MAP_API_KEY } } = process

exports.gatherReport = () => {
  const history = temperatureMoistureHistory.read()
  if (history.length < 4) return
  const query = stringify({ lat: 46.1008181, lon: 11.1105323, appid: OPEN_WEATHER_MAP_API_KEY })
  console.log(`https://api.openweathermap.org/data/2.5/weather?${query}`)
  return got(`https://api.openweathermap.org/data/2.5/weather?${query}`, { json: true })
    .then(({ body: { weatherData } }) => {
      const last = history[history.length - 1]
      const last2h = history.splice(history.length - 24, history.length)
      const temperatureChart = sparkly(last2h.map((d, i) => d.temperature))
      const humidityChart = sparkly(last2h.map((d, i) => d.humidity))

      return `🌡 Temperature ${
        last && last.temperature
      }ºC (last 2h)\n${
        temperatureChart
      }\n💦 Moisture ${
        last && last.humidity
      }% (last 2h)\n${
        humidityChart
      }\n🌦 Weather (last updated ${
        new Date(weatherData.dt * 1000 + 1000 * 60 * 60 * 2).toISOString()
      })\nCondition: ${
        weatherData.weather[0] && weatherData.weather[0].description
      }}\nSunrise ${
        new Date(weatherData.sys.sunrise * 1000 + 1000 * 60 * 60 * 2).toISOString()
      }\nSunset ${
        new Date(weatherData.sys.sunset * 1000 + 1000 * 60 * 60 * 2).toISOString()
      }\nTemperature: ${
        (weatherData.main.temperature - 273.15).toFixed(1)
      }°C (min ${
        (weatherData.main.minTemperature - 273.15).toFixed(1)
      }°C, max ${
        (weatherData.main.maxTemperature - 273.15).toFixed(1)
      }°C)\nPressure: ${
        weatherData.main.pressure
      }\nHumidity${
        weatherData.main.humidity
      }`
    })
}
