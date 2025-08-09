const axios = require('axios');

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const url = args[0];

    if (!url || !/^https?:\/\/(www\.)?facebook\.com\/.+/.test(url)) {
        return m.reply(`📌 Masukkan link Facebook yang valid!\nContoh: .${command} https://www.facebook.com/watch/?v=1234567890`);
    }

    try {
        await m.reply('⏳ Mengambil video dari Facebook...');

        const res = await axios.post(
            'https://kithubs.com/api/video/facebook/download', {
                url
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': '*/*',
                    'Referer': 'https://kithubs.com/facebook-video-downloader',
                },
            }
        );

        const {
            sd_url,
            hd_url,
            title
        } = res.data.data || {};
        if (!sd_url && !hd_url) {
            return m.reply('❌ Gagal mengambil video. Pastikan link bersifat publik atau tidak error.');
        }

        const download = hd_url || sd_url;
        const caption = `📥 *Berhasil mengambil video Facebook!*\n\n🎬 *Judul:* ${title || 'Tanpa Judul'}\n📺 *Resolusi:* ${hd_url ? 'HD' : 'SD'}`;

        await conn.sendMessage(m.chat, {
            video: {
                url: download
            },
            caption
        }, {
            quoted: m
        });

    } catch (err) {
        console.error('[FACEBOOK ERROR]', err);
        return m.reply(`❌ Terjadi kesalahan saat mengambil video.\n${err?.response?.data?.message || err.message}`);
    }
};

handler.command = ['facebook', 'fb'];
handler.category = 'downloader';
handler.description = 'Download video dari Facebook (Reel/Post publik)';

module.exports = handler;