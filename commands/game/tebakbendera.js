const axios = require('axios');

const timeout = 120000; // 2 menit
const poin = 1000;
const tiketcoin = 1;

let handler = async (m, {
    conn,
    db
}) => {
    const id = m.sender;
    conn.tebakbendera = conn.tebakbendera || {};

    if (id in conn.tebakbendera) {
        return m.reply('🚫 Masih ada soal yang belum kamu jawab!');
    }

    const res = await axios.get('https://raw.githubusercontent.com/qisyana/scrape/main/flag.json');
    const data = res.data;
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🚩 *Tebak Bendera*
⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 Tiketcoin: +${tiketcoin}
`.trim();

    const msg = await conn.sendFile(m.chat, json.img, 'tebakbendera.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    conn.tebakbendera[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebakbendera[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawaban: *${json.name}*`, msg);
                delete conn.tebakbendera[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['tebakbendera'];
handler.tags = ['game'];
handler.limit = true;
handler.group = false;
handler.category = 'game';
handler.description = 'Tebak nama negara dari gambar bendera';

module.exports = handler;