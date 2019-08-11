const sparkly = require('sparkly')
const stripIndent = str => str.split('\n').map(s => s.trim()).join('\n')
const got = require('got') // todo: use http/https instead
const temperatureMoistureHistory = require('./temperature-moisture-history')

const { stringify } = require('querystring')
const { env: { OPEN_WEATHER_MAP_API_KEY } } = process

function kelvinToCelsius (k) {
  return k - 273.15
}

function iso (date, tz = 0) {
  return new Date(date).toISOString() + tz * 1000 + 1000 * 60 * 60
}
function charts (data) {
  const localMaxTemperature = Math.max(...data.map(d => d.temperature))
  const localMinTemperature = Math.min(...data.map(d => d.temperature))
  const localMaxHumidity = Math.max(...data.map(d => d.humidity))
  const localMinHumidity = Math.min(...data.map(d => d.humidity))
  const temperatureChart = sparkly(data.map((d, i) => (d.temperature - localMinTemperature) / localMaxTemperature * 10))
  const humidityChart = sparkly(data.map((d, i) => (d.humidity - localMinHumidity) / localMaxHumidity * 10))
  return {temperatureChart, humidityChart}
}

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
        weather: [{
          description
        }] = [{ description: String.prototype }],
        main: {
          temp: temperature,
          temp_min: minTemperature,
          temp_max: maxTemperature,
          pressure,
          humidity
        },
        dt: time,
        sys: {
          sunrise,
          sunset
        }
      }
    }) => {
      const { temperature: relativeTemperature, humidity: relativeHumidity } = history[history.length - 1]
      const last2h = history.splice(history.length - 24, history.length)
      const {temperatureChart, humidityChart} = charts(last2h)

      return stripIndent(`
        🌡 Temperature ${relativeTemperature}ºC (last 2h)
        ${temperatureChart}
        💦 Moisture ${relativeHumidity}% (last 2h)
        ${humidityChart}
        🌦 Weather (last updated ${iso(time * 1000, 2)})
        Condition: ${description}}
        Sunrise ${iso(sunrise * 1000, 2)}
        Sunset ${iso(sunset * 1000, 2)}
        📝 Nearest station
        Temperature: ${(kelvinToCelsius(temperature)).toFixed(1)}°C (min ${(kelvinToCelsius(minTemperature)).toFixed(1)}°C, max ${(kelvinToCelsius(maxTemperature)).toFixed(1)}°C)
        Pressure: ${pressure}
        Humidity${humidity}
      `)
    })
}
