const axios = require('axios');

const timeout = 30000;
const poin = 1000;
const tiketcoin = 1;

const handler = async (m, {
    conn
}) => {
    const id = m.sender;
    conn.siapakahaku = conn.siapakahaku || {};

    if (id in conn.siapakahaku) {
        return m.reply('🚫 Masih ada soal *Siapakah Aku* yang belum kamu jawab!');
    }

    const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/siapakahaku.json');
    const data = res.data;
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🧠 *Siapakah Aku?*
${json.soal}

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

    conn.siapakahaku[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.siapakahaku[id]) {
                conn.reply(m.chat, `⏰ Waktu habis!\n📌 Jawabannya adalah: *${json.jawaban}*`, msg);
                delete conn.siapakahaku[id];
            }
        }, timeout),
        msg.key
    ];
};

handler.command = ['siapakahaku'];
handler.tags = ['game'];
handler.limit = true;
handler.group = false;
handler.category = 'game';
handler.description = 'Tebak siapakah aku dari deskripsi';

module.exports = handler;