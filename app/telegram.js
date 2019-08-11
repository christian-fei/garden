process.env.NTBA_FIX_319 = 1

require('dotenv').config()
const { env: { TELEGRAM_CHAT_ID, TELEGRAM_TOKEN } } = process

const TelegramBot = require('node-telegram-bot-api')
const got = require('got')
const temperatureMoistureHistory = require('../lib/temperature-moisture-history')
const sparkly = require('sparkly')

const { StillCamera } = require('pi-camera-connect')

const { publicIP } = require('../lib/ip')
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

process.on('message', ({ topic, data }) => {
  if (topic === 'dht11') {
    bot.sendMessage(TELEGRAM_CHAT_ID, 'Temperature ' + data.temperature + '°C\nHumidity ' + data.humidity + '%')
  }
})

bot.onText(/\/ip/, async function onIP ({ chat }) {
  const address = await publicIP()
  bot.sendMessage(TELEGRAM_CHAT_ID, `DMZ Public IP is ${address} 🌍`)
})

bot.onText(/\/camera/, ({ chat }) => {
  console.log('/camera awaiting full command...')
  bot.sendMessage(TELEGRAM_CHAT_ID, 'How may i help you?', {
    reply_markup: {
      inline_keyboard: [[{
        text: 'take picture',
        callback_data: 'take_picture'
      }, {
        text: 'take video (30s)',
        callback_data: 'take_video_30s'
      }, {
        text: 'take video (1m)',
        callback_data: 'take_video_1m'
      }]]
    }
  })
})

bot.on('callback_query', async (query) => {
  const { id, data, message } = query
  console.log('/callback_query', data, query)

  if (data === 'take_picture') {
    bot.answerCallbackQuery(id, { text: 'Taking picture!' })
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: message.chat.id, message_id: message.message_id })
    // keyboard = [[InlineKeyboardButton('UnAck', callback_data = '1')]]
    // reply_markup = InlineKeyboardMarkup(keyboard)

    const buffer = await new StillCamera().takeImage()
    bot.sendPhoto(TELEGRAM_CHAT_ID, buffer)
    // } catch (e) {
    // bot.answerCallbackQuery(id, 'something went wrong, please try again later...')
    // }
  }
})

bot.onText(/\/report/, async function onIP ({ chat }) {
  const history = temperatureMoistureHistory.read()
  if (history.length > 3) {
    const { body: weatherData } = await got(`https://api.openweathermap.org/data/2.5/weather?lat=46.1008181&lon=11.1105323&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`, { json: true })
    const last = history[history.length - 1]
    const last2h = history.splice(history.length - 24, history.length)
    const temperatureChart = sparkly(last2h.map((d, i) => d.temperature))
    const humidityChart = sparkly(last2h.map((d, i) => d.humidity))
    const text = `🌡 Temperature (last 2h)
${temperatureChart}
${last && `${last.temperature}º`}
💦 Moisture (last 2h)
${humidityChart}
${last && `${last.humidity}%`}
🌦 Weather (last updated ${new Date(weatherData.dt * 1000 + 1000 * 60 * 60 * 2).toISOString()})
Condition: ${weatherData.weather[0] && weatherData.weather[0].description}
Sunrise ${new Date(weatherData.sys.sunrise * 1000 + 1000 * 60 * 60 * 2).toISOString()}
Sunset ${new Date(weatherData.sys.sunset * 1000 + 1000 * 60 * 60 * 2).toISOString()}
Temp station: ${(weatherData.main.temp - 273.15).toFixed(1)} (min ${(weatherData.main.temp_min - 273.15).toFixed(1)} - ${(weatherData.main.temp_max - 273.15).toFixed(1)})`
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text)
  }
/*

  Daily Followup
  ---
  Currently {description}, temperature is {temperature}°C with relative
  humidity of about {humidity}%.

  Last watering started (today|yesterday|2019-05-10) at (9:00|18:00) and
  lasted {5 minutes}. Reservoir is filled up {50%} and water temperature
  is {22°C}. if [water < 50%] -> This could be a good time to top up the
  tank with fresh water. It looks like there's enough water for at least
  {2 days} according to schedule.

  Today was {quite hot} you might consider water again manually.
  Today was {quite wet|cold} you might consider skip water tomorrow.

  Garden Watering Report
  ---
  Last watering started (today|yesterday|2019-05-10) at (9:00|18:00) and
  lasted {5 minutes}. According to watering schedule next watering
  is (tomorrow|2019-05-12 at 9:00|18:00).
*/
})

// bot.on('message', (...args) => console.log('message', ...args))
// bot.on('text', (...args) => console.log('text', ...args))
// bot.on('audio', (...args) => console.log('audio', ...args))
// bot.on('document', (...args) => console.log('document', ...args))
// bot.on('photo', (...args) => console.log('photo', ...args))
// bot.on('sticker', (...args) => console.log('sticker', ...args))
// bot.on('video', (...args) => console.log('video', ...args))
// bot.on('voice', (...args) => console.log('voice', ...args))
// bot.on('contact', (...args) => console.log('contact', ...args))
// bot.on('location', (...args) => console.log('location', ...args))
// bot.on('new_chat_members', (...args) => console.log('new_chat_members', ...args))
// bot.on('left_chat_member', (...args) => console.log('left_chat_member', ...args))
// bot.on('new_chat_title', (...args) => console.log('new_chat_title', ...args))
// bot.on('new_chat_photo', (...args) => console.log('new_chat_photo', ...args))
// bot.on('delete_chat_photo', (...args) => console.log('delete_chat_photo', ...args))
// bot.on('group_chat_created', (...args) => console.log('group_chat_created', ...args))
// bot.on('game', (...args) => console.log('game', ...args))
// bot.on('pinned_message', (...args) => console.log('pinned_message', ...args))
// bot.on('poll', (...args) => console.log('poll', ...args))
// bot.on('migrate_from_chat_id', (...args) => console.log('migrate_from_chat_id', ...args))
// bot.on('migrate_to_chat_id', (...args) => console.log('migrate_to_chat_id', ...args))
// bot.on('channel_chat_created', (...args) => console.log('channel_chat_created', ...args))
// bot.on('supergroup_chat_created', (...args) => console.log('supergroup_chat_created', ...args))
// bot.on('successful_payment', (...args) => console.log('successful_payment', ...args))
// bot.on('invoice', (...args) => console.log('invoice', ...args))
// bot.on('video_note', (...args) => console.log('video_note', ...args))
// bot.on('callback_query', (...args) => console.log('callback_query', ...args))
// bot.on('inline_query', (...args) => console.log('inline_query', ...args))
// bot.on('chosen_inline_result', (...args) => console.log('chosen_inline_result', ...args))
// bot.on('channel_post', (...args) => console.log('channel_post', ...args))
// bot.on('edited_message', (...args) => console.log('edited_message', ...args))
// bot.on('edited_message_text', (...args) => console.log('edited_message_text', ...args))
// bot.on('edited_message_caption', (...args) => console.log('edited_message_caption', ...args))
// bot.on('edited_channel_post', (...args) => console.log('edited_channel_post', ...args))
// bot.on('edited_channel_post_text', (...args) => console.log('edited_channel_post_text', ...args))
// bot.on('edited_channel_post_caption', (...args) => console.log('edited_channel_post_caption', ...args))
// bot.on('shipping_query', (...args) => console.log('shipping_query', ...args))
// bot.on('pre_checkout_query', (...args) => console.log('pre_checkout_query', ...args))
// bot.on('poll', (...args) => console.log('poll', ...args))
// bot.on('polling_error', (...args) => console.log('polling_error', ...args))
// bot.on('webhook_error', (...args) => console.log('webhook_error', ...args))
// bot.on('error', (...args) => console.log('error', ...args))
