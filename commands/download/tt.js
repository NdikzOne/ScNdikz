const axios = require('axios');
const moment = require('moment-timezone');

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const url = args[0];

    if (!url) return m.reply(`📌 Masukkan URL TikTok!\nContoh: .${command} https://vt.tiktok.com/xxxxxx`);
    if (!url.includes('tiktok')) return m.reply('❌ URL tidak valid! Harus mengandung "tiktok".');

    global.db = global.db || {};
    global.db.data = global.db.data || {};
    global.db.data.temp = global.db.data.temp || {};
    if (global.db.data.temp[m.id]) return;
    global.db.data.temp[m.id] = true;

    const proses = await m.reply('⏳ Mengambil data dari TikTok...');

    try {
        const {
            data
        } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
        if (!data || !data.data) throw new Error("Gagal mengambil data TikTok.");

        const result = data.data;
        const time = moment.unix(result.create_time).tz('Asia/Jakarta').format('dddd, D MMMM YYYY, HH:mm:ss');

        const caption = `🎬 *Video TikTok*

📍 *Region:* ${result.region}
⏱️ *Durasi:* ${result.duration}s
📅 *Waktu:* ${time}

📊 *Statistik:*
👁️ Views: ${result.play_count}
❤️ Likes: ${result.digg_count}
💬 Komentar: ${result.comment_count}
🔁 Share: ${result.share_count}
⬇️ Download: ${result.download_count}

👤 *Author:* @${result.author?.unique_id || '-'}
🎵 *Musik:* ${result.music_info?.title || '-'} - ${result.music_info?.author || '-'}
📝 *Caption:* ${result.title || 'Tanpa caption'}
`;

        if (result.images && result.images.length > 0) {
            await m.reply('📸 Deteksi slide TikTok. Mengirim gambar...');
            for (const image of result.images) {
                await conn.sendMessage(m.chat, {
                    image: {
                        url: image
                    }
                }, {
                    quoted: m
                });
            }
        }

        if (result.play) {
            await conn.sendMessage(m.chat, {
                video: {
                    url: result.play
                },
                caption
            }, {
                quoted: m
            });
        }

        if (result.music) {
            await conn.sendMessage(m.chat, {
                audio: {
                    url: result.music
                },
                mimetype: 'audio/mpeg',
                fileName: `${result.title || 'tiktok_audio'}.mp3`
            }, {
                quoted: m
            });
        }

    } catch (e) {
        console.error('[TIKTOK]', e);
        m.reply(`❌ Gagal mendownload TikTok.\n\nLog: ${e.message}`);
    } finally {
        delete global.db.data.temp[m.id];
        if (proses?.key) await conn.sendMessage(m.chat, {
            delete: proses.key
        });
    }
};

handler.command = ['tiktok', 'tt'];
handler.category = 'downloader';
handler.description = 'Download video atau slide TikTok';
handler.limit = 5;

module.exports = handler;