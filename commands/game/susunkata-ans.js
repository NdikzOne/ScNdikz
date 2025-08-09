const similarity = require('similarity');
const util = require('util');

const threshold = 0.75;

let handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    try {
        const id = m.sender;
        const text = typeof m.text === 'string' ? m.text : '';
        const users = db.get('user', id);
        conn.susunkata = conn.susunkata || {};

        if (!(id in conn.susunkata)) return;

        const [msg, json, timeoutId] = conn.susunkata[id];

        if (/^hint$/i.test(text)) {
            const clue = json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_'); // Hilangkan konsonan
            return conn.reply(m.chat, `🧩 Hint:\n\`\`\`${clue}\`\`\``, msg);
        }

        if (/^suren$/i.test(text)) {
            await conn.reply(m.chat, `🏳️ Menyerah!\n🧠 Jawabannya: *${json.jawaban}*`, msg);
            clearTimeout(timeoutId);
            delete conn.susunkata[id];
            return;
        }

        if (text.toLowerCase() === json.jawaban.toLowerCase().trim()) {
            users.exp += 1000;
            users.tiketcoin = (users.tiketcoin || 0) + 1;
            await conn.reply(m.chat, `✅ *Jawaban benar!*\n+1000 XP\n+1 Tiketcoin`, msg);
            clearTimeout(timeoutId);
            delete conn.susunkata[id];
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