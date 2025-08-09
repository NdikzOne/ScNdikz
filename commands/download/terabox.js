const axios = require('axios');

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const link = args[0];

    if (!link) return m.reply(`📌 Masukkan link Terabox!\nContoh: .${command} https://terabox.com/s/xxxxxxxx`);
    if (!/^https:\/\/(1024)?terabox\.com\/s\//.test(link)) {
        return m.reply('❌ Link tidak valid! Harus dari *terabox.com* atau *1024terabox.com*');
    }

    try {
        await m.reply('⏳ Mengambil data dari Terabox...');

        const res = await axios.post('https://teraboxdownloader.online/api.php', {
            url: link
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://teraboxdownloader.online',
                'Referer': 'https://teraboxdownloader.online/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': '*/*'
            }
        });

        const data = res.data;
        if (!data?.direct_link) {
            return m.reply('❌ Tidak ada link download ditemukan. Coba pastikan file-nya publik.');
        }

        const {
            file_name,
            size,
            direct_link,
            thumb
        } = data;

        const caption = `📦 *Terabox Downloader*
📁 *Nama:* ${file_name}
📏 *Ukuran:* ${size}
🔗 *Link:* ${direct_link}`;

        if (thumb) {
            await conn.sendMessage(m.chat, {
                image: {
                    url: thumb
                },
                caption
            }, {
                quoted: m
            });
        } else {
            await m.reply(caption);
        }

    } catch (err) {
        console.error('[TERABOX ERROR]', err);
        m.reply('❌ Gagal mengambil data dari Terabox. Mungkin file private atau server down.');
    }
};

handler.command = ['terabox'];
handler.category = 'downloader';
handler.description = 'Download file dari link Terabox';

module.exports = handler;