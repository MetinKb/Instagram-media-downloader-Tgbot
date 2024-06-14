import axios from 'axios'
import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import path from 'path'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.command('reels', async ctx => {
    try {
        const chatType = ctx.chat.type
        if (chatType !== 'private') {
            bot.telegram.sendMessage(
                ctx.chat.id,
                'This feature is not suitable for group use. Please try from private messages'
            )
            return
        }
        
        const reelsLink = ctx.message.text.split(' ')[1]
        const reelsFolderPath = './reels'
        const options = {
            method: 'GET',
            url: 'process.env.API_URL',
            params: {
                url: reelsLink,
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                'X-RapidAPI-Host': 'process.env.API_HOST',
            },
        }

        const response = await axios(options)
        const videoUrl = response.data.media
        const outputFilePath = path.join(reelsFolderPath, `${ctx.botInfo.username}.mp4`)
        const outputStream = fs.createWriteStream(outputFilePath)

        const mediaResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
        })

        mediaResponse.data.pipe(outputStream)
        const downloadingMessage = await ctx.reply('The video is downloading...')

        outputStream.once('finish', async () => {
            bot.telegram.deleteMessage(ctx.chat.id, downloadingMessage.message_id)
            const sendingMessage = await ctx.reply('The video is sending...')

            bot.telegram
                .sendVideo(ctx.message.chat.id, { source: outputFilePath })
                .then(() => {
                    fs.unlink(outputFilePath, error => {
                        if (error) {
                            console.error('Error occurred while deleting file', error)
                        } else {
                            console.log('File deleted', outputFilePath)
                        }
                    })
                })
                .catch(error => {
                    console.error('Error occurred while sending teh video', error)
                })
                .finally(() => {
                    bot.telegram.deleteMessage(ctx.chat.id, sendingMessage.message_id)
                    ctx.reply('Video sent')
                })
        })

        outputStream.on('error', error => {
            console.error(error)
            bot.telegram.deleteMessage(ctx.chat.id, downloadingMessage.message_id)
            ctx.reply('An error occurred while downloading the video.')
        })
    } catch (error) {
        ctx.reply('Please enter a valid real link.')
        throw error
    }
})

console.log('Bot is working')
bot.launch()
