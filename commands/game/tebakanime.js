const axios = require('axios');

const timeout = 120000; // 2 menit
const poin = 500;
const tiketcoin = 1;

const handler = async (m, {
    conn,
    db
}) => {
    const id = m.sender;
    conn.tebakanime = conn.tebakanime || {};

    if (id in conn.tebakanime) {
        return m.reply('🚫 Masih ada soal yang belum kamu jawab!');
    }

    const res = await axios.get('https://raw.githubusercontent.com/NdikzOne/Game/main/tebakanime.json');
    const data = res.data;
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🎌 *Tebak Anime*
⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 Tiketcoin: +${tiketcoin}
`.trim();

    const msg = await conn.sendFile(m.chat, json.img, 'tebakanime.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    conn.tebakanime[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebakanime[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawaban: *${json.jawaban}*`, msg);
                delete conn.tebakanime[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['tebakanime'];
handler.tags = ['game'];
handler.limit = true;
handler.group = false;
handler.category = 'game';
handler.description = 'Tebak gambar karakter anime dari gambar';

module.exports = handler;