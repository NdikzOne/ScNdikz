const fetch = require('node-fetch');
const timeout = 30000;
const tiketcoin = 1;

let handler = async (m, {
    conn
}) => {
    conn.logo = conn.logo || {};
    const id = m.sender;

    if (id in conn.logo) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.logo[id][0]);
    }

    const res = await fetch('https://raw.githubusercontent.com/NdikzOne/Game/refs/heads/main/Logo.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];
    const poin = 1000;

    const caption = `
🏷️ *Tebak Logo*
${json.deskripsi}

⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 TiketCoin: +${tiketcoin}
`.trim();

    const msg = await conn.sendFile(m.chat, json.img, 'logo.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    conn.logo[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.logo[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.logo[id][0]);
                delete conn.logo[id];
            }
        }, timeout),
        msg.key,
        poin
    ];
};

handler.command = ['tebaklogo'];
handler.tags = ['game'];
handler.help = ['tebaklogo'];
handler.category = 'game';
handler.limit = true;
handler.group = false;

module.exports = handler;