const fetch = require('node-fetch');

const timeout = 80000;
const poin = 1000;
const tiketcoin = 1;

let handler = async (m, {
    conn
}) => {
    conn.tebakkata = conn.tebakkata || {};
    const id = m.sender;

    if (id in conn.tebakkata) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.tebakkata[id][0]);
    }

    const res = await fetch('https://raw.githubusercontent.com/NdikzOne/Game/refs/heads/main/tebakkata.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🧠 *Tebak Kata*
📌 Soal: ${json.soal}
⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 TiketCoin: +${tiketcoin}
    `.trim();

    const msg = await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            externalAdReply: {
                title: "Game Tebak Kata",
                body: "Tebak kata dari soal yang diberikan!",
                thumbnailUrl: '', // Tambahkan thumbnail jika ada
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, {
        quoted: m
    });

    conn.tebakkata[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebakkata[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawabannya adalah *${json.jawaban}*`, conn.tebakkata[id][0]);
                delete conn.tebakkata[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['tebakkata'];
handler.tags = ['game'];
handler.help = ['tebakkata'];
handler.category = 'game';
handler.limit = true;
handler.group = false;

module.exports = handler;