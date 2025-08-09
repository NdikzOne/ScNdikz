const axios = require('axios');

const timeout = 30000;
const tiketcoin = 1;

const handler = async (m, {
    conn
}) => {
    const id = m.sender;
    conn.susunkata = conn.susunkata || {};

    if (id in conn.susunkata) {
        return m.reply('🚫 Masih ada soal yang belum kamu jawab!');
    }

    const res = await axios.get('https://raw.githubusercontent.com/NdikzOne/Game/main/susunkata.json');
    const data = res.data;
    const json = data[Math.floor(Math.random() * data.length)];
    const poin = Math.floor(Math.random() * 5000);

    const caption = `
🎮 *Susun Kata*
📜 Soal: ${json.soal}
📁 Tipe: ${json.tipe}
⏱ Timeout: ${(timeout / 1000)} detik
💡 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟 Tiketcoin: +${tiketcoin}
`.trim();

    const msg = await conn.sendMessage(m.chat, {
        text: caption
    }, {
        quoted: m
    });

    conn.susunkata[id] = [
        msg,
        json,
        poin,
        setTimeout(() => {
            if (conn.susunkata[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n🧠 Jawabannya: *${json.jawaban}*`, msg);
                delete conn.susunkata[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['susunkata'];
handler.tags = ['game'];
handler.limit = true;
handler.group = false;
handler.category = 'game';
handler.description = 'Susun kata dari soal yang diberikan';

module.exports = handler;