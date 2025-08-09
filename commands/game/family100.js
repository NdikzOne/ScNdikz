const axios = require('axios');
const winScore = 1000;
const timeout = 180000; // 3 menit

const handler = async (m, {
    conn,
    db
}) => {
    conn.family100 = conn.family100 || {};
    const id = 'family100_' + m.chat;

    if (id in conn.family100) {
        return conn.reply(m.chat, '❗ Masih ada kuis Family100 yang belum selesai di chat ini.', conn.family100[id].msg);
    }

    const res = await axios.get('https://raw.githubusercontent.com/NdikzOne/Game/refs/heads/main/family100.json');
    const data = res.data;
    const json = data[Math.floor(Math.random() * data.length)];

    const caption = `
🎯 *Family 100*
📢 *Soal:* ${json.soal}

❓ Jawaban: *${json.jawaban.length}* buah
${json.jawaban.find(v => v.includes(' ')) ? '(Beberapa jawaban mengandung spasi)' : ''}

⏰ Timeout: ${(timeout / 1000 / 60)} menit
💰 +${winScore} Money tiap jawaban benar
Ketik jawaban atau ketik *suren* untuk menyerah.
`.trim();

    const msg = await m.reply(caption);

    conn.family100[id] = {
        id,
        msg,
        ...json,
        terjawab: Array.from(json.jawaban, () => false),
        winScore,
        expReward: 150,
        timeout: setTimeout(() => {
            if (conn.family100[id]) {
                const text = `⏱️ Waktu habis!\nJawaban: ${json.jawaban.map(j => `• ${j}`).join(', ')}`;
                conn.reply(m.chat, text, conn.family100[id].msg);
                delete conn.family100[id];
            }
        }, timeout),
    };
};

handler.command = ['family100'];
handler.tags = ['game'];
handler.category = 'game';
handler.description = 'Main Family100 dengan jawaban banyak';
handler.limit = true;
handler.group = false;

module.exports = handler;