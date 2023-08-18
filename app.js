import axios from 'axios'
import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import path from 'path'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.command('/reels', async ctx => {
    try {
        /* We do chat/group control because we don't want +18 posts 
        to be downloaded and posted to the group using bots. 
        If the command is run in group it will send the warning message below. */
        const chatType = ctx.chat.type
        if (chatType !== 'private') {
            bot.telegram.sendMessage(
                ctx.chat.id,
                'This feature is not suitable for group use. Please try from private messages'
            )
            return
        }

        /* We get the video link to be sent with the /reels command
        and we define the folder where the videos will be downloaded and sent. */
        const reelsLink = ctx.message.text.split(' ')[1]
        const reelsFolderPath = './reels'
        console.log(reelsLink)
        /* I used an api from the Rapid API site. You may have to make minor changes in the code according 
        to the response data returned by the API you will use. You will need a API key for these operations. */
        const options = {
            method: 'GET',
            url: 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index',
            params: {
                url: reelsLink,
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
            },
        }

        /* We take the video from the response data returned with the axios library 
        and save it as mp4 in the reels folder. And we send the message to the user that 
        the video is downloading until the video is downloaded. */
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

        /* Delete 'Downloading video...' and send 'Sending video...' when video is downloaded
        codes that will run when the file is successfully downloaded */
        outputStream.once('finish', async () => {
            bot.telegram.deleteMessage(ctx.chat.id, downloadingMessage.message_id)
            const sendingMessage = await ctx.reply('The video is sending...')

            //  We send the video to the user and delete the video after sending.
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

        /* If an error occurs while downloading the video, we delete the 'video downloading...' message 
        and send the message 'An error occurred while downloading the video*/
        outputStream.on('error', error => {
            console.error(error)
            bot.telegram.deleteMessage(ctx.chat.id, downloadingMessage.message_id)
            ctx.reply('An error occurred while downloading the video.')
        })
        // if reels link is not entered, give a warning
    } catch (error) {
        ctx.reply('Please enter a valid real link.')
        throw error
    }
})

console.log('Bot is working')
bot.launch()
