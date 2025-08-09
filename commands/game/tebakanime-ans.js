const similarity = require('similarity');
const util = require('util');

const threshold = 0.72;

let handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    try {
        const id = m.sender;
        const text = typeof m.text === 'string' ? m.text : '';
        const users = db.get('user', id);
        conn.tebakanime = conn.tebakanime || {};

        if (!(id in conn.tebakanime)) return;

        const [msg, json, timeoutId] = conn.tebakanime[id];

        if (/^hint$/i.test(text)) {
            const clue = json.jawaban.replace(/[aeiou]/gi, '_');
            return conn.reply(m.chat, `🧩 Hint:\n\`\`\`${clue}\`\`\``, msg);
        }

        if (/^suren$/i.test(text)) {
            await conn.reply(m.chat, `🏳️ Menyerah!\n🧠 Jawaban: *${json.jawaban}*`, msg);
            clearTimeout(timeoutId);
            delete conn.tebakanime[id];
            return;
        }

        if (text.toLowerCase() === json.jawaban.toLowerCase().trim()) {
            users.exp += 500;
            users.tiketcoin = (users.tiketcoin || 0) + 1;
            await conn.reply(m.chat, `✅ *Jawaban benar!*\n+500 XP\n+1 Tiketcoin`, msg);
            clearTimeout(timeoutId);
            delete conn.tebakanime[id];
        } else if (similarity(text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
            await conn.reply(m.chat, `🤏 *Dikit lagi!*`, msg);
        } else {
            await conn.reply(m.chat, `❌ *Salah!*`, msg);
        }
    } catch (e) {
        return conn.reply(m.chat, util.format(e), m);
    }

    return true;
};

module.exports = handler;