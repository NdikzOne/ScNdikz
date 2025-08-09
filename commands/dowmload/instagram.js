const {
    igdl
} = require("btch-downloader");
const axios = require("axios");

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const url = args[0];

    if (!url) return m.reply(`📌 Masukkan URL Instagram!\nContoh: .${command} https://www.instagram.com/reel/xxxxxx`);
    if (!url.includes('instagram.com')) return m.reply(`❌ URL tidak valid! Harus mengandung "instagram.com"`);

    try {
        const media = await igdl(url);
        if (!media || !media.length) return m.reply("❌ Tidak dapat mengambil media dari URL tersebut.");

        const mediaUrl = media[0].url;
        const res = await axios.head(mediaUrl);
        const contentType = res.headers['content-type'];

        if (contentType.startsWith('image/')) {
            await conn.sendMessage(m.chat, {
                image: {
                    url: mediaUrl
                }
            }, {
                quoted: m
            });
        } else {
            await conn.sendMessage(m.chat, {
                video: {
                    url: mediaUrl
                }
            }, {
                quoted: m
            });
        }

    } catch (err) {
        console.error('[INSTAGRAM ERROR]', err);
        m.reply(`❌ Gagal mendownload media Instagram.\n\nLog: ${err.message}`);
    }
};

handler.command = ['instagram', 'ig'];
handler.category = 'downloader';
handler.description = 'Download video atau foto dari Instagram Reels/Post';

module.exports = handler;