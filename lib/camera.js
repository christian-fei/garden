// if (data === 'take_photo') {
//   try {
//     bot.answerCallbackQuery(id, { text: 'Taking picture!' })
//     bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id, message_id })
//     bot.sendPhoto(chat_id, await photoFor())
//   } catch (err) {
//     bot.sendMessage(TELEGRAM_CHAT_ID, 'Something went wrong, please try again later...')
//   }
// }
const { StillCamera } = require('pi-camera-connect')

exports.takePhoto = ({ width, height, rotation, flip, delay }) => {
  const camera = new StillCamera({ width, height, rotation, flip, delay })
  return camera.takeImage()
}
