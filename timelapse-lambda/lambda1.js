'use strict'
const fs = require('fs')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)

const inputTempFileName = '/tmp/in_HelloWorld_Temp.wav'
const outputTempFileName = '/tmp/out_HelloWorld_Temp.wav'

exports.handler = function (event, context, cb) {
  ffmpeg(inputTempFileName)
    .withAudioChannels(1)
    .withAudioFrequency(16000)
    .withAudioQuality(5)
    .withOutputFormat('wav')
    .on('start', (commandLine) => {
      console.log('ffmpeg conversion start: ', commandLine)
    })
    .on('progress', function (progress) {
      // console.log("Processing: " + progress.percent + "% done");
    })
    .on('stderr', function (stderrLine) {
      // console.log("Stderr output: " + stderrLine);
    })
    .on('codecData', function (data) {
      // console.log("Input is " + data.audio + " audio " + "with " + data.video + " video");
    })
    .on('end', () => {
      console.log('ffmpeg file has been locally converted successfully!...')
      fnDeletefilesFromlocalStorage(inputTempFileName)
      fnDeletefilesFromlocalStorage(outputTempFileName)
      console.timeEnd('time:')
      cb(null, 'Done')
    })
    .on('error', (error) => {
      console.timeEnd('time:')
      console.log('ffmpeg Error: ', error)
    })
    .pipe(fs.createWriteStream(outputTempFileName), { end: true })
}

function fnDeletefilesFromlocalStorage (filename) {
  try {
    fs.unlink(filename, (error) => {
      if (error) {
        console.error(`delet ${filename} file ERROR:`, error)
      } else {
        console.log(`${filename} file deleted.`)
      }
    })
  } catch (error) {
    console.error('fnDeletefilesFromlocalStorage() > ERROR:', error)
  }
}
