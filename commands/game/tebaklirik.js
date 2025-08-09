const fetch = require('node-fetch');
const env = require('../../settings.js'); // pastikan path ini sesuai

const timeout = 180000;
const tiketcoin = 1;

let handler = async (m, {
    conn
}) => {
    conn.tebaklirik = conn.tebaklirik || {};
    const id = m.sender;

    if (id in conn.tebaklirik) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.tebaklirik[id][0]);
    }

    const res = await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebaklirik.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];
    const poin = Math.floor(Math.random() * 5000);

    const caption = `
🎵 *Tebak Lirik Lagu!*
📖 Lirik: 
${json.soal}

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
                title: "Game Tebak Lirik",
                body: "Coba tebak judul lagu dari potongan lirik berikut!",
                thumbnailUrl: env.thumb,
                sourceUrl: "",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, {
        quoted: m
    });

    conn.tebaklirik[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebaklirik[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebaklirik[id][0]);
                delete conn.tebaklirik[id];
            }
        }, timeout),
        msg.key,
        poin
    ];
};

handler.command = ['tebaklirik'];
handler.tags = ['game'];
handler.category = 'game';
handler.help = ['tebaklirik'];
handler.limit = true;
handler.group = false;

module.exports = handler;