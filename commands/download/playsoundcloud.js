const fetch = require('node-fetch');

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const text = args.join(' ');
    if (!text) return m.reply(`Masukkan judul lagu.\nContoh: .${command} where we are`);

    try {
        await m.reply('🔍 Mencari lagu di SoundCloud...');

        const search = await fetch(`https://zenz.biz.id/search/SoundCloud?query=${encodeURIComponent(text)}`);
        const result = await search.json();

        if (!result.status || !result.result || !result.result[0])
            return m.reply('❌ Lagu tidak ditemukan.');

        const url = result.result[0].url;
        const res = await fetch(`https://zenz.biz.id/downloader/SoundCloud?url=${encodeURIComponent(url)}`);
        const json = await res.json();

        if (!json.status || !json.audio_url)
            return m.reply('❌ Gagal mengunduh lagu.');

        const {
            title,
            author,
            duration,
            audio_url,
            thumbnail,
            source_url
        } = json;

        await conn.sendMessage(m.chat, {
            audio: {
                url: audio_url
            },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title,
                    body: author,
                    thumbnailUrl: thumbnail,
                    mediaType: 2,
                    mediaUrl: source_url,
                    sourceUrl: source_url,
                    renderLargerThumbnail: true
                }
            }
        }, {
            quoted: m
        });

    } catch (err) {
        console.error('[SOUNDCLOUD ERROR]', err);
        m.reply('❌ Terjadi kesalahan saat mengambil lagu. Coba lagi nanti.');
    }
};

handler.command = ['playsoundcloud', 'scdl', 'sc'];
handler.category = 'downloader';
handler.description = 'Download lagu dari SoundCloud via judul';

module.exports = handler;