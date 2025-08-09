const similarity = require('similarity');
const util = require('util');

const threshold = 0.72;

const handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    const id = m.sender;
    const text = typeof m.text === 'string' ? m.text : '';
    const users = db.get('user', id);

    conn.tebakgame = conn.tebakgame || {};

    if (!(id in conn.tebakgame)) return;

    const [msg, json, timeoutId] = conn.tebakgame[id];

    if (/^hint$/i.test(text)) {
        const clue = json.jawaban.replace(/[aiueo]/gi, '_');
        return conn.reply(m.chat, `🧩 Hint:\n\`\`\`${clue}\`\`\``, msg);
    }

    if (/^suren$/i.test(text)) {
        await conn.reply(m.chat, `🏳️ Menyerah!\n🧠 Jawaban: *${json.jawaban}*`, msg);
        clearTimeout(timeoutId);
        delete conn.tebakgame[id];
        return;
    }

    if (text.toLowerCase() === json.jawaban.toLowerCase().trim()) {
        users.exp += 1000;
        users.tiketcoin = (users.tiketcoin || 0) + 1;
        await conn.reply(m.chat, `✅ *Jawaban benar!*\n+1000 XP\n+1 Tiketcoin`, msg);
        clearTimeout(timeoutId);
        delete conn.tebakgame[id];
    } else if (similarity(text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
        await conn.reply(m.chat, `🤏 *Dikit lagi!*`, msg);
    } else {
        await conn.reply(m.chat, `❌ *Salah!*`, msg);
    }
};

module.exports = handler;