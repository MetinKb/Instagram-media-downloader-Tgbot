## Buraya kadar geldiysen hadi başlayalaım!

### Öncelikle README.md dosyasını okumanı ve gerekli bilgilendirmeyi almanı istiyorum. Eğer okuduysan bundan sonraki süreç için başarılar diliyorum.

Öncelikle kodları [Visual Studio Code](https://code.visualstudio.com/) kullanarak yazacağız. Daha sonra kodları yazacağımız bir klasöre ihtiyacımız var. Terminalden veya masaüstünden bir adet dosya oluşturmalısınız. Ben dosyamın ismini 'ig-downloader' koydum. Dosyayı tercih etmiş olduğunuz editörden açın ve terminalde aşağıdaki komutu alıştırarak npm'i projeye dahil edin. <br><br>
`npm init -y` <br><br>
npm'i projeye dahil ettikten sonra ***package.json*** isminde bir dosyaya sahip olacağız. Dosyanın içeriği başlangıçta aşağıdaki gibi olacak. Daha sonra birkaç değişiklik yapacağız. <br><br>

![1](https://github.com/MetinKb/Instagram-media-downloader-Tgbot/assets/114526516/08fb0fb4-e7da-410c-81fe-8fc9140418f5)

`app` isimli bir adet JavaScript dosyası oluşuyoruz. Botumuzu burada kodlayacağız.<br>
Bu değişikliklerden sonra aşağıdaki gibi bir görüntüye sahip olmamız gerekiyor. <br>
_Eğer module yapısını kullanmayacaksanız `"type": "module"` kısmını atlayabilirsiniz._ <br><br>

![2](https://github.com/MetinKb/Instagram-media-downloader-Tgbot/assets/114526516/aabb45ce-5998-42b6-9c8b-08507b5af25a)

Normal şartlarda kodlarımızı çalıştırabilmemiz için terminale `node app.js` yazmamız gerekiyor fakat **package.json** dosyasında start komutuna *node app.js* değerini atıyoruz. Bu sayede terminalde sadece `npm start` komutunu işleterek kodlarımızı çalıştırabileceğiz. <br>
Şimdi de sırada botumuzu kodlarken kullanacağımız kütüphaneleri dosyamıza eklemek var. Aşağıdaki kodu terminalde çalıştırarak [telegraf](https://telegraf.js.org/), [dotenv](https://www.dotenv.org/) ve [axios](https://axios-http.com/docs/intro) kütüphanelerini dosyamıza kuracağız. <br>
`npm i telegraf dotenv axios` <br>
**telegraf** kütüphanesini bota bağlanmak için, **axios** kütüphanesini API'ye istek atmak ve dönen cevabı almak için, **dotenv** kütüphanesini de API key ve bot token gibi ortam değişkenlerimizi (environment variables)  gizli tutmak için kullanacağız. Eğer bot tokenınız yoksa almak için Telegram uygulamasından [botfather](https://t.me/botfather)a gidebilirsiniz.
Dotenv kütüphanesi için `.env` isminde bir dosya oluşturuyoruz. Bu dosyada API keyimizi ve bot tokenimizi tanımlayacağız. Eğer klasörünüzü Github'a yüklemek istiyorsanız ek olarak `.gitignore` isminde bir dosya daha oluşturmanız ve bu dosyanın içerisine _.env_ yazmanız gerekiyor. Böylece klasör Github'a pushlarken Github .env dosyası içerisinde bulunan dosyaları görmezden gelecek. Eğer bu işlemleri gerçekleştirdiyseniz aşağıdaki gibi bir görüntüye sahip olmalısınız. Kütüphane sürümleri değişkenlik gösterebilir. Ben bu repoyu oluştururken en yüksek sürümler aşağıdaki gibiydi.<br><br>

![3](https://github.com/MetinKb/Instagram-media-downloader-Tgbot/assets/114526516/aee95ba3-8d01-45dd-ba43-57a9cfc7afb6)<br><br>

.env dosyasının içerisinde değişken tanımlarını aşağıdaki şekilde yapacağız. API key ve bot tokenlerınızı değişkenlere atayın. Ben Rapid API'dan bulduğum bir API kullandım. Kullandığınız API'nin response'una göre kodda birkaç değişiklik yapmanız gerekebilir.<br><br>

![4](https://github.com/MetinKb/Instagram-media-downloader-Tgbot/assets/114526516/b9e428e0-0194-42ab-b9c6-9dbcc722a037)

### Şimdi botumuzu kodlamak için her şeye hazırız! O zaman app.js dosyasına geçelim ve başlayalım.<br>
Yazımızın başında module yapısından bahsetmiştim. Eğer module yapısını kullandıysanız indirdiğimiz NodeJS kütüphanelerini app.js dosyasına aşağıdaki gibi dahil edeceğiz.<br>

<pre>
<code class="language-javascript">
import axios from 'axios'
import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import path from 'path'
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

Eğer module yapısını kullanmadıysanız indirdiğimiz kütüphaneleri app.js dosyasına şu şekilde dahil edebilirsiniz;
<pre>
    
<code class="language-javascript">
const axios = require('axios')
const { Telegraf } = require('telegraf')
const dotenv = require('dotenv')
dotenv.config()
const fs = require('fs')
const path = require('path')
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

`dotenv.config()` fonksiyonu ile .env dosyasında tanımladığımız değişkenlere erişim sağlayabiliyoruz. [fs](https://nodejs.org/api/fs.html) ve [path](https://nodejs.org/api/path.html) kütüphaneleri node ile beraber geldiği için onları indirmeye ihtiyaç duymuyoruz.

<pre>
<code class="language-javascript">
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

`bot` isminde bir sabit tanımlıyoruz ve `process.env.TELEGRAM_BOT_TOKEN` ile **.env** dosyasında oluşturduğumuz bot token değişkenine erişiyoruz. `new Telegraf` instance'ı ile de Telegram botumuza obje olarak erişiyoruz. <br>
Kullanıcıdan video linkini alacağımız komutu belirliyoruz. Eğer botunuza birden fazla işlev eklemeyecekseniz komuta dayalı çalıştırmayabilirsiniz. Kullanıcı mesajlarını dinlersiniz ve link gelirse işlem yaparsınız fakat ben çok işlevli bir bot olabileceği açısından komut üzerinden ilerleyeceğim. Video linkini **/reels** komutu ile alacağız. 

<pre>
<code class="language-javascript">
bot.command('/reels', async ctx => {})
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

Yukarıda `bot` sabitine obje olarak eriştiğimizi söylemiştim. Şimdi bot objesinin `command` metodunu kullanarak **/reels** komutunu algılayacağız. Bu komut algılandığında gerçekleşecek işlemleri asenkron bir arrow function ile gerçekleştireceğiz.

<pre>
<code class="language-javascript">
bot.command('/reels', async ctx => {
    const chatType = ctx.chat.type
    try {
        if (chatType !== 'private') {
            bot.telegram.sendMessage(
                ctx.chat.id,
                'Bu özellik grup kullanımı için uygun değildir. Lütfen özel mesajdan yeniden deneyin.'
            )
            return
        }
    } catch (error) {
        ctx.reply('Lütfen geçerli bir video linki gönderin.')
        throw error
    }
})
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

Objedeki değerlere erişebilmek için `'context'` yani `ctx` bağlam nesnesini kullanacağız. `try - catch` ile hata ayıklamayı kolaylaştıracağız. `ctx` nesnesini kullanarak sohbet türünün grup mu yoksa özel mi olduğunu tutuyoruz. `if` koşulu ile sohbet türünün kontrolünü yapıyoruz, eğer grupsa `return` ile diğer işlemleri durduruyoruz çünkü kullanıcı herhangi bir +18 içeriği gruba bot aracılığıyla indirip gönderebilir.
Eğer herhangi bir link gönderilmeden komut kullanılırsa kullanıcıya uyarı mesajı gönderiyoruz. Eğer link gönderildiyse ve sohbet türü grup değilse `try` bloğunda yazacağımız kodlar çalışacak. Haydi gelin `try` bloğunda kalan işlemlerimize beraber devam edelim.

<pre>
<code class="language-javascript">
const reelsLink = ctx.message.text.split(' ')[1]
const reelsFolderPath = './reels'
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

`ctx` nesnesi ile kullanıcının gönderdiği mesajı alıyoruz. Fakat ihtiyacımız olan sadece video linki. Bu yüzden `split` ile gönderilen mesajı boşluktan ayırıp bir diziye dönüştürüyoruz. Elimizdeki dizi artık 
şu şekilde; <br>
`['/reels','Reels linki']`
 `split` ile oluşturduğumuz dizinin 1. indexinde ihtiyacımız olan video linkine erişiyoruz ve `reelsLink` sabitine atıyoruz. `reelsFolderPath` sabitinde ise oluşturacağımız reels klasörünün pathini belirtiyoruz. Video bu klasöre indirilecek ve bu klasörden gönderilecek. Artık axios'u kullanmaya başlayabiliriz.
 
<pre>
<code class="language-javascript">
const options = {
            method: 'GET',
            url: 'URL to request',
            params: {
                url: reelsLink,
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                'X-RapidAPI-Host': 'host url',
            },
        }
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

API'ye istekte bulunmak için gereken yapıyı `options` sabiti ile yapacağız. Veri alacağımız için metodumuz `'GET'` ve ilk url istekte bulunacağınız API adresi, `params` altında bulunan `url` ise videonun linkinin atandığı değişkendir. Headers kısmını kullandığınız API'ye göre değiştirmelisiniz.

<pre>
<code class="language-javascript">
const response = await axios(options)
        const videoUrl = response.data.media
        const outputFilePath = path.join(reelsFolderPath, 'video.mp4')
        const outputStream = fs.createWriteStream(outputFilePath)

        const mediaResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
        })

        mediaResponse.data.pipe(outputStream)
        const downloadingMessage = await ctx.reply('Video yükleniyor...')
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

`options` sabitine göre dönen `response`'u axios kütüphanesini kullanarak alıyoruz ve `response` sabitine atıyoruz. `Await` ile yanıtın tamamlanmasını bekliyoruz ve dönen yanıt nesnesinin mediasını yani linkini `videoUrl` sabitine atıyoruz. 'Hey! Bir dakika. Biz zaten video linkini en başta almadık mı?' diyebilirsiniz. `reelsLink` sabiti kullanıcıdan aldığımız Instagram videosunun linkiydi fakat `videoUrl` API'nin `response` olarak döndürdüğü video linki. Yani videoyu indirmemiz için gereken link diyebilirim. `outoutFilePath` sabitinde videonun indirileceği yeri, hangi isim ve formatla indirileceğini belirtiyoruz. `path.join()` ile dosya yolunu belirtiyoruz. `fs.createWriteStream()` ile belirttiğimiz dosya yoluna API'den dönen veriyi yazmak için bir veri akışı (stream) oluşturuyoruz. Artık videoyu indimek için gereken her şeye sahibiz. `mediaResponse` sabiti ile axios kütüphanesini kullanarak video indirme isteğini gerçekleştiriyoruz. `mediaResponse.data.pipe(outputStream)` ile indirilen video akışını `(mediaResponse.data)` dosya yazma akışına `(outputStream)` yönlendiriiyoruz ve kullanıcıya videonun indirildiğine dair bir bilgilendirme mesajı gönderiyoruz. Bu mesajın video indirilmeye başlandıktan sonra gönderilmesi için await kullandık.

<pre>
<code class="language-javascript">
outputStream.once('finish', async () => {
            bot.telegram.deleteMessage(ctx.chat.id, downloadingMessage.message_id)
            const sendingMessage = await ctx.reply('Video gönderiliyor..')

            bot.telegram
                .sendVideo(ctx.message.chat.id, { source: outputFilePath })
                .then(() => {
                    fs.unlink(outputFilePath, error => {
                        if (error) {
                            console.error('Dosya silinirken bir hata oluştu', error)
                        } else {
                            console.log('Dosya silindi', outputFilePath)
                        }
                    })
                })
                .catch((error) => {
                    console.error('Video gönderilirken bir hata meydana geldi', error)
                })
                .finally(() => {
                    bot.telegram.deleteMessage(ctx.chat.id, sendingMessage.message_id)
                    ctx.reply('Video gönderildi')
                })
        })
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

`outputStream` sabitine dosya yazma akışını yönlendirmiştik. Şimdi buradaki akışın bitişini `'finish'` eventi ile dinleyeceğiz. Eğer indirme işlemi biterse kullanıcıya gönderdiğimiz 'Video indiriliyor...' mesajını `message_id` ile siliyoruz ve 'Video gönderiliyor...' mesajını gönderiyoruz. `bot`nesnesninin `sendVideo()` metoduna `ctx` nesnesi üzerinden videoyu talep eden kullanıcının chat id değerine erişerek parametre olarak veriyoruz ve `outputFilePath` parametresi ile de gönderilecek medyanın kaynağını yani nereden gönderileceğini belirtiyoruz. `then()` metodu ile medya gönderme işlemi başarılı olduğunda gerçekleşecek komutları belirtiyoruz. Eğer video gönderme işlemi başarılı bir şekilde gerçekleşirse gönderilen videoyu siliyoruz. `catch()` metodu ile medya gönderme işlemi sırasında meydana gelebilecek hataları yakalıyoruz. `finally()` metodu ile medyan gönderme işleminden sonra yapılacak komutları belirtiyoruz. `bot` nesnesinin `deleteMessage()` metodu ile gönderilen 'Video indiriliyor...' mesajını siliyoruz ve `ctx` nesnesinin `reply()` metodu ile 'Video gönderildi' mesajını gönderiyoruz.

<pre>
<code class="language-javascript">
outputStream.on('error', error => {
    consoleçlog(error)
            bot.telegram.deleteMessage(ctx.chat.id, downloadingMessage.message_id)
            ctx.reply('Video indirilirken bir hata meydana geldi.')
        })
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>
`on('error')` metodu ile dosya yazma akışında hata meydana gelirse çalışacak kodları belirtiyoruz. Eğer dosya yazma işlemi hata ile sonuçlanırsa 'Video gönderiliyor...' mesajını sileceğiz ve `ctx` nesnesinin `reply()` metodu ile kullanıcıya video indirme sırasında bir hata ile karşılaştığımıza dair bilgilendirme mesajı göndereceğiz. Hata yönetimini `console.log()` metodu ile ele alacağız.

Son olarak botumuzu başlatmak ve çalışıp çalışmadığını kontrol etmek için; 

<pre>
<code class="language-javascript">
bot.launch()
</code>
</pre>
<button class="btn" data-clipboard-target="#code"></button>

`bot` nesnesinin `launch()` metodunun kullanıyoruz. 

Kodların tamamına tek parça halinde ulaşmak isterseniz repoya göz atabilirsiniz.
