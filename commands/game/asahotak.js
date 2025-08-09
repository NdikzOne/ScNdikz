const fetch = require('node-fetch');
const env = require('../../settings.js');

const timeout = 80000;

let handler = async (m, {
    conn
}) => {
    conn.asahotak = conn.asahotak || {};
    const id = m.sender;

    if (id in conn.asahotak) {
        return conn.reply(m.chat, '🚫 Masih ada soal yang belum kamu jawab!', conn.asahotak[id][0]);
    }

    const res = await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/asahotak.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];

    const poin = Math.floor(Math.random() * 5000);
    const tiketcoin = 1;

    const teks = `
🧠 *Asah Otak*
Soal: ${json.soal}

⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 TiketCoin: +${tiketcoin}
`.trim();

    const msg = await conn.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            externalAdReply: {
                title: 'Game Asah Otak',
                body: env.wm,
                thumbnailUrl: env.thumb,
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, {
        quoted: m
    });

    conn.asahotak[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.asahotak[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.asahotak[id][0]);
                delete conn.asahotak[id];
            }
        }, timeout),
        msg.key,
        poin
    ];
};

handler.command = ['asahotak'];
handler.tags = ['game'];
handler.help = ['asahotak'];
handler.category = 'game';
handler.limit = true;
handler.group = true;

module.exports = handler;