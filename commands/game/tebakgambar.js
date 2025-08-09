const fetch = require('node-fetch');

const timeout = 180000; // 3 menit
const poin = 500;

const handler = async (m, {
    conn,
    db
}) => {
    conn.tebakgambar = conn.tebakgambar || {};
    const id = m.sender;

    // Cek apakah user sudah bermain
    if (id in conn.tebakgambar) {
        return conn.reply(m.chat, '❗ Masih ada soal belum dijawab!', conn.tebakgambar[id][0]);
    }

    // Ambil soal
    const res = await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json');
    const data = await res.json();
    const json = data[Math.floor(Math.random() * data.length)];

    // Buat caption
    const caption = `
🖼️ *Tebak Gambar*
${json.deskripsi}

⏳ Timeout: *${(timeout / 1000).toFixed(0)} detik*
💬 Ketik *hint* untuk bantuan
🏳️ Ketik *suren* untuk menyerah
🎁 Bonus: +${poin} XP
🎟️ Tiketcoin: 1
`.trim();

    // Kirim gambar soal
    const msg = await conn.sendFile(m.chat, json.img, 'tebakgambar.jpg', caption, m, false, {
        thumbnail: Buffer.alloc(0)
    });

    const {
        key
    } = msg;

    // Simpan ke sesi
    conn.tebakgambar[id] = [
        msg,
        json,
        setTimeout(() => {
            if (conn.tebakgambar[id]) {
                conn.reply(m.chat, `⏰ *Waktu habis!*\n📌 Jawaban: *${json.jawaban}*`, conn.tebakgambar[id][0]);
                delete conn.tebakgambar[id];
            }
        }, timeout),
        key
    ];
};

handler.command = ['tebakgambar'];
handler.tags = ['game'];
handler.category = 'game';
handler.limit = true;
handler.group = false;
handler.description = 'Main tebak gambar';

module.exports = handler;