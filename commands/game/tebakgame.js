const axios = require('axios');

const timeout = 30000; // 3 menit
const poin = 1000;
const tiketcoin = 1;

const handler = async (m, {
    conn,
    db
}) => {
    const id = m.sender;
    conn.tebakgame = conn.tebakgame || {};

    if (id in conn.tebakgame) {
        return m.reply('🚫 Masih ada soal yang belum kamu jawab!');
    }

    const res = await axios.get('https://raw.githubusercontent.com/qisyana/scrape/main/tebakgame.json');
    const data = res.data;
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🎮 *Tebak Game*
⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 Tiketcoin: +${tiketcoin}
    `.trim();

    const msg = await conn.sendFile(m.chat, json.img, 'tebakgame.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    conn.tebakgame[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebakgame[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawaban: *${json.jawaban}*`, msg);
                delete conn.tebakgame[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['tebakgame'];
handler.tags = ['game'];
handler.limit = true;
handler.group = false;
handler.category = 'game';
handler.description = 'Tebak gambar karakter game dari gambar';

module.exports = handler;