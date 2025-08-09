const axios = require('axios');

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const text = args.join(' ')
    if (!text) {
        return m.reply(`📌 Kirim link Pinterest!\nContoh: .${command} https://id.pinterest.com/pin/16044142417873989/`)
    }

    await conn.sendMessage(m.chat, {
        react: {
            text: '⏳',
            key: m.key
        }
    })

    try {
        const res = await pinterestDL(text)

        if (!res.success || !res.media.length) {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })
            return m.reply('❌ Gagal mengunduh media. Pastikan link valid dan publik.')
        }

        const media = res.media[0]
        const type = media.extension === 'jpg' ? 'image' : 'video'

        await conn.sendMessage(m.chat, {
            [type]: {
                url: media.url
            },
            caption: `✅ *Pinterest Downloader*\n\n🎞️ *Tipe:* ${media.extension.toUpperCase()}\n📦 *Ukuran:* ${media.size ? (media.size / 1024).toFixed(2) + ' KB' : '-'}\n🔗 *Kualitas:* ${media.quality || 'default'}`
        }, {
            quoted: m
        })

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (err) {
        console.error('[PINDL ERROR]', err)
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        })
        await m.reply(`❌ Terjadi kesalahan: ${err.message}`)
    }
}

handler.command = ['pindl', 'pinterestdl']
handler.category = 'downloader'
handler.description = 'Download media dari Pinterest (gambar/video)'

module.exports = handler

// Fungsi scraper Pinterest
async function pinterestDL(url) {
    try {
        const res = await axios.get(`https://pinterestdownloader.io/frontendService/DownloaderService?url=${url}`, {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Origin': 'https://pinterestdownloader.io',
                'Referer': 'https://pinterestdownloader.io/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        })

        const data = res.data
        if (!data?.medias) throw new Error('Media tidak ditemukan.')

        const mediaList = []

        for (const media of data.medias) {
            mediaList.push(media)

            if (media.extension === 'jpg' && media.url.includes('i.pinimg.com/')) {
                const originalUrl = media.url.replace(/\/\d+x\//, '/originals/')
                mediaList.push({
                    ...media,
                    url: originalUrl,
                    quality: 'original'
                })
            }
        }

        // Urutkan berdasarkan ukuran terbesar
        const sorted = mediaList.sort((a, b) => (b.size || 0) - (a.size || 0))

        return {
            success: true,
            media: sorted
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
}