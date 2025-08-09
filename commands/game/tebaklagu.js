const fetch = require('node-fetch');
const env = require("../../settings.js");

let handler = async (m, {
    conn,
    db
}) => {
    conn.tebaklagu = conn.tebaklagu || {};
    const id = m.sender;
    const timeout = 180000;
    const poin = Math.floor(Math.random() * 5000);
    const tiketcoin = 1;

    if (id in conn.tebaklagu) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.tebaklagu[id][0]);
    }

    const res = await fetch('https://raw.githubusercontent.com/Aiinne/scrape/main/tebaklagu.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];

    const teks = `
🎵 *TEBAK JUDUL LAGU*
👤 Artis: ${json.artis}
🎶 Judul: _____

⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 TiketCoin: +${tiketcoin}
`.trim();

    // Kirim deskripsi soal
    await conn.reply(m.chat, teks, m);

    // Kirim audio pakai sendMessage langsung
    const msg = await conn.sendMessage(m.chat, {
        audio: {
            url: json.lagu
        },
        mimetype: 'audio/mpeg',
        ptt: false
    }, {
        quoted: m
    });

    conn.tebaklagu[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebaklagu[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\nJawabannya adalah *${json.judul}*`, conn.tebaklagu[id][0]);
                delete conn.tebaklagu[id];
            }
        }, timeout),
        msg.key,
        poin
    ];
};

handler.command = ['tebaklagu'];
handler.tags = ['game'];
handler.help = ['tebaklagu'];
handler.category = 'game';
handler.limit = true;
handler.group = false;

module.exports = handler;