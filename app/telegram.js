/* eslint camelcase: 0 */

require('dotenv').config()

const Telegram = require('node-telegram-bot-api')

const { env: { TELEGRAM_CHAT_ID, TELEGRAM_TOKEN } } = process
const { gatherIP } = require('../lib/ip') // todo rename takeIp
const { takePhoto, takeVideo } = require('../lib/camera')
const { gatherReport } = require('../lib/report')
const { forceOff, forceOn } = require('../lib/pump')

const bot = new Telegram(TELEGRAM_TOKEN, { polling: true })

// todo: make something that accepts messages only from garden group

process.on('message', ({ topic, data }) => {
  if (topic === 'dht11') {
    bot.sendMessage(TELEGRAM_CHAT_ID, 'Temperature ' + data.temperature + '°C\nHumidity ' + data.humidity + '%')
  }
})

bot.onText(/\/ip/, async ({ chat: { id: chat_id } }) => {
  try {
    const address = await gatherIP()
    console.log('/ip', address)
    bot.sendMessage(chat_id, `Public DMZ IP is ${address} 🌍`)
  } catch (err) {
    console.error(err)
    bot.sendMessage(chat_id, `Something went wrong, please try again later.\n${err}`)
  }
})

bot.onText(/\/report/, async ({ chat: { id: chat_id } }) => {
  try {
    bot.sendMessage(chat_id, await gatherReport())
  } catch (err) {
    console.error(err)
    bot.sendMessage(chat_id, `Something went wrong, please try again later.\n${err}`)
  }
})

bot.onText(/\/garden/, ({ chat: { id: chat_id } }) => {
  console.log('/garden [...awaiting choice]')
  bot.sendMessage(chat_id, `Its currently ${'20'}°C at ${'65'}% humidity outside.\nHow may i help you?`, { reply_markup: { inline_keyboard: [[{ text: 'Photo', callback_data: 'photo' }], [{ text: 'Video', callback_data: 'video' }], [{ text: 'Pump', callback_data: 'pump' }]] } })
})

bot.on('callback_query', async ({ id, data, message: { message_id, chat: { id: chat_id } } }) => {
  console.log('/callback_query', data)

  if (data === 'photo') {
    try {
      bot.answerCallbackQuery(id, { text: 'Shooting photo, might take a while!' })
      bot.editMessageText('Shooting photo...', { chat_id, message_id, reply_markup: { inline_keyboard: [] } })
      await bot.sendPhoto(chat_id, await takePhoto(), {}, { contentType: 'image/jpeg' })
      bot.deleteMessage(chat_id, message_id)
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, `Something went wrong, please try again later.\n${err}`)
    }
  }

  if (data === 'video') {
    try {
      bot.answerCallbackQuery(id, { text: 'Shooting video, might take a while!' })
      bot.editMessageText('Shooting video...', { chat_id, message_id, reply_markup: { inline_keyboard: [] } })
      await bot.sendVideo(chat_id, await takeVideo({ timeout: 5000 }), {}, { contentType: 'video/mp4' })
      bot.deleteMessage(chat_id, message_id)
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, `Something went wrong, please try again later.\n${err}`)
    }
  }

  if (data === 'pump') {
    try {
      bot.answerCallbackQuery(id, { text: 'Connecting to pump, might take a while!' })
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
      bot.sendMessage(chat_id, `Last watering was ${'yesterday'} at ${'06:30'}. Next scheduled watering time is ${'tomorrow'} at ${'6:30'}. Would you like to adjust water manually?`, { reply_markup: { inline_keyboard: [[{ text: 'Stop Pump', callback_data: 'pump_off' }], [{ text: 'Start Pump 30s', callback_data: 'pump_on_30s' }], [{ text: 'Start Pump 1m', callback_data: 'pump_on_1m' }], [{ text: 'Start Pump 2m', callback_data: 'pump_on_2m' }], [{ text: 'Start Pump 5m', callback_data: 'pump_on_5m' }], [{ text: 'Cancel', callback_data: 'cancel' }]] } })
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }

  if (data === 'pump_off') {
    try {
      bot.answerCallbackQuery(id, { text: 'Connecting to pump, might take a while!' })
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
      await forceOff({ delay: 0 })
      bot.sendMessage(chat_id, `Pump has been successfuly turned off. `)
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }

  if (data === 'pump_on_30s') {
    try {
      bot.answerCallbackQuery(id, { text: 'Connecting to pump, might take a while!' })
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
      const message = await bot.sendMessage(chat_id, `Pump has been successfuly turned on and will be switched off in 30 seconds unless you stop pump manually.`, { reply_markup: { inline_keyboard: [[{ text: 'Stop Pump', callback_data: 'pump_off' }], [{ text: 'Cancel', callback_data: 'cancel' }]] } })
      ;(async (bot, chat_id) => {
        bot.sendVideo(chat_id, await takeVideo({ timeout: 5000 }), {}, { contentType: 'video/mp4' })
      })(bot, chat_id)
      ;(async (chat_id) => {
        await new Promise(resolve => setTimeout(resolve, 27000))
        bot.sendVideo(chat_id, await takeVideo({ timeout: 5000 }), {}, { contentType: 'video/mp4' })
      })(bot, chat_id)
      await forceOn({ timeout: 30000, framerate: 10 })
      bot.editMessageText('Pump has been successfuly turned on and has been running 30 seconds!', { chat_id, message_id: message.message_id, reply_markup: { inline_keyboard: [] } })
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }

  if (data === 'pump_on_1m') {
    try {
      bot.answerCallbackQuery(id, { text: 'Connecting to pump, might take a while!' })
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
      await forceOn({ timeout: 60000 })
      bot.sendMessage(chat_id, `Pump has been successfuly turned on and will be switched off in 1 minute. Do you need to stop pump earlier than that?`, { reply_markup: { inline_keyboard: [[{ text: 'Stop Pump', callback_data: 'pump_off' }], [{ text: 'Cancel', callback_data: 'cancel' }]] } })
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }

  if (data === 'pump_on_2m') {
    try {
      bot.answerCallbackQuery(id, { text: 'Connecting to pump, might take a while!' })
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
      await forceOn({ timeout: await forceOn({ timeout: 120000 }) })
      bot.sendMessage(chat_id, `Pump has been successfuly turned on and will be switched off in 2 minutes. Do you need to stop pump earlier than that?`, { reply_markup: { inline_keyboard: [[{ text: 'Stop Pump', callback_data: 'pump_off' }], [{ text: 'Cancel', callback_data: 'cancel' }]] } })
    } catch (err) {
      console.error(err)
      bot.sendMessage(chat_id, 'Something went wrong, please try again later.')
    }
  }

  if (data === 'cancel') {
    bot.answerCallbackQuery(id, { text: 'Canceled!' })
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
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
