const fetch = require('node-fetch');

const timeout = 180000;
const poin = 1000;
const tiketcoin = 1;

let handler = async (m, {
    conn
}) => {
    conn.mlbb = conn.mlbb || {};
    const id = m.sender;

    if (id in conn.mlbb) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.mlbb[id][0]);
    }

    let res = await fetch('https://raw.githubusercontent.com/NdikzOne/Game/refs/heads/main/Ml.json');
    let data = await res.json();
    let json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🧠 *Tebak Hero MLBB*
📜 Deskripsi: ${json.deskripsi}

⏱ Timeout: ${(timeout / 1000)} detik
💡 *hint* untuk bantuan
🏳️ *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 Tiketcoin: +${tiketcoin}
    `.trim();

    let msg = await conn.sendFile(m.chat, json.img, 'heroml.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    conn.mlbb[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.mlbb[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawaban: *${json.jawaban}*`, conn.mlbb[id][0]);
                delete conn.mlbb[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['tebakheroml'];
handler.tags = ['game'];
handler.limit = true;
handler.group = false;
handler.category = 'game';
handler.description = 'Tebak hero Mobile Legends dari gambar dan deskripsi';

module.exports = handler;