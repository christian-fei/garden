/* eslint camelcase: 0 */

require('dotenv').config()

const Telegram = require('node-telegram-bot-api')

const { env: { TELEGRAM_TOKEN } } = process
const { gatherIP } = require('../lib/ip') // todo rename takeIp
const { takePhoto, takeVideo } = require('../lib/camera')
const { gatherReport } = require('../lib/report')

const bot = new Telegram(TELEGRAM_TOKEN, { polling: true })

// todo: make something that accepts messages only from garden group

process.on('message', ({ topic, data, chat: { id: chat_id } }) => {
  if (topic === 'dht11') {
    bot.sendMessage(chat_id, 'Temperature ' + data.temperature + '°C\nHumidity ' + data.humidity + '%')
  }
})

bot.onText(/\/ip/, async ({ chat: { id: chat_id } }) => {
  try {
    const address = await gatherIP()
    console.log('/ip', address)
    bot.sendMessage(chat_id, `Public DMZ IP is ${address} 🌍`)
  } catch (err) {
    console.error(err)
    bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
  }
})

bot.onText(/\/report/, async ({ chat: { id: chat_id } }) => {
  try {
    bot.sendMessage(chat_id, await gatherReport())
  } catch (err) {
    console.error(err)
    bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
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

bot.onText(/\/camera/, ({ chat: { id: chat_id } }) => {
  console.log('/camera [...awaiting choice]')
  bot.sendMessage(chat_id, 'How may i help you?', { reply_markup: { inline_keyboard: [[{ text: 'take photo', callback_data: 'take_photo' }], [{ text: 'take video', callback_data: 'take_video' }]] } })
})

bot.on('callback_query', async ({ id, data, message: { message_id, chat: { id: chat_id } } }) => {
  console.log('/callback_query', data)

  if (data === 'take_photo') {
    try {
      bot.answerCallbackQuery(id, { text: 'Taking photo, might take a while!' })
      bot.editMessageText('Taking photo...', { chat_id, message_id, reply_markup: { inline_keyboard: [] } })
      await bot.sendPhoto(chat_id, await takePhoto(), {}, { contentType: 'image/jpeg' })
      bot.deleteMessage(chat_id, message_id)
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }

  if (data === 'take_video') {
    try {
      bot.answerCallbackQuery(id, { text: 'Taking video, might take a while!' })
      bot.editMessageText('Taking video...', { chat_id, message_id, reply_markup: { inline_keyboard: [] } })
      await bot.sendVideo(chat_id, await takeVideo({ timeout: 5000 }), {}, { contentType: 'video/mp4' })
      bot.deleteMessage(chat_id, message_id)
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }
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
