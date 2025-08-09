const fetch = require('node-fetch');

const timeout = 30000;
const poin = 1000;
const tiketcoin = 1;

let handler = async (m, {
    conn
}) => {
    conn.jkt48 = conn.jkt48 || {};
    const id = m.sender;

    if (id in conn.jkt48) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.jkt48[id][0]);
    }

    const res = await fetch('https://raw.githubusercontent.com/NdikzOne/Game/refs/heads/main/Jkt48.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🧠 *Tebak Member JKT48*
⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 TiketCoin: +${tiketcoin}
    `.trim();

    const msg = await conn.sendFile(m.chat, json.img, 'tebakjkt48.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    conn.jkt48[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.jkt48[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawabannya adalah *${json.jawaban}*`, conn.jkt48[id][0]);
                delete conn.jkt48[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['tebakjkt48'];
handler.tags = ['game'];
handler.category = 'game';
handler.help = ['tebakjkt48'];
handler.limit = true;
handler.group = false;

module.exports = handler;