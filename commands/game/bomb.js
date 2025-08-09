const util = require('util');

const handler = async (m, {
    conn,
    db
}) => {
    const id = m.sender;
    const timeout = 180000;
    const user = db.get("user", id);
    conn.bomb = conn.bomb || {};

    if (id in conn.bomb) {
        return conn.reply(m.chat, '*💣 Sesi bomb belum selesai!*', conn.bomb[id][0]);
    }

    const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
    const angka = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const kotak = bom.map((v, i) => ({
        emot: v,
        number: angka[i],
        position: i + 1,
        state: false
    }));

    let teks = `乂  *B O M B*\n\nKetik angka *1* - *9* untuk membuka kotak:\n\n`;
    for (let i = 0; i < kotak.length; i += 3) {
        teks += kotak.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
    }
    teks += `\n🕒 Timeout: *${timeout / 60000} menit*\nKetik *suren* untuk menyerah.`;

    const msg = await conn.reply(m.chat, teks, m);
    const reward = randomInt(100, 800);

    conn.bomb[id] = [
        msg,
        kotak,
        setTimeout(() => {
            const bomPos = kotak.find(v => v.emot === '💥');
            conn.reply(m.chat, `⏰ *Waktu habis!* 💣 ada di kotak ${bomPos.number}`, msg);
            delete conn.bomb[id];
        }, timeout),
        reward
    ];
};

// Middleware (before)
handler.before = async (m, {
    conn,
    db
}) => {
    try {
        conn.bomb = conn.bomb || {};
        const id = m.sender;
        const user = db.get("user", id);
        if (!user || !(id in conn.bomb)) return;

        const body = (typeof m.text === 'string' ? m.text.trim() : '');
        const [msg, kotak, timeout, reward] = conn.bomb[id];

        if (/^(suren)$/i.test(body)) {
            clearTimeout(timeout);
            delete conn.bomb[id];
            return conn.reply(m.chat, '🚩 Menyerah. Game dibatalkan.', m);
        }

        const angka = parseInt(body);
        if (!angka || angka < 1 || angka > 9) return;

        const pilih = kotak.find(v => v.position === angka);
        if (!pilih) return;

        if (pilih.state) {
            return conn.reply(m.chat, `❗ Kotak ${pilih.number} sudah dibuka. Pilih yang lain.`, m);
        }

        pilih.state = true;

        const tampilKotak = () => {
            let teks = '';
            for (let i = 0; i < kotak.length; i += 3) {
                teks += kotak.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
            }
            return teks;
        };

        if (pilih.emot === '💥') {
            user.exp = Math.max(0, (user.exp || 0) - reward);
            clearTimeout(timeout);
            delete conn.bomb[id];
            return conn.reply(m.chat,
                `乂  *B O M B*\n\n${tampilKotak()}\n💥 *BOOM!* Kamu kena bom!\n❌ EXP dikurangi -${formatNumber(reward)}`, m);
        }

        const terbuka = kotak.filter(v => v.state && v.emot !== '💥').length;
        if (terbuka >= 8) {
            user.exp = (user.exp || 0) + reward;
            clearTimeout(timeout);
            delete conn.bomb[id];
            return conn.reply(m.chat,
                `乂  *B O M B*\n\n${tampilKotak()}\n🎉 *Selamat!* Semua aman terbuka.\n✅ EXP bertambah +${formatNumber(reward)}`, m);
        }

        conn.reply(m.chat,
            `乂  *B O M B*\n\n${tampilKotak()}\nSilakan lanjut buka kotak.\nKetik *suren* untuk menyerah.`, m);

    } catch (e) {
        return conn.reply(m.chat, util.format(e), m);
    }
};

handler.command = ['bomb'];
handler.category = 'game';
handler.description = 'Main petak bomb (hindari bom)';
handler.exp = 0;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(n) {
    return n.toLocaleString();
}

module.exports = handler;