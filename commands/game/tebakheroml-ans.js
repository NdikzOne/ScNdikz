const similarity = require('similarity');
const util = require('util');

const threshold = 0.72;

let handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    try {
        let id = m.sender;
        let text = typeof m.text === 'string' ? m.text : '';
        let users = db.get('user', id);
        conn.mlbb = conn.mlbb || {};

        if (!(id in conn.mlbb)) return;

        let [msg, json, timeoutId] = conn.mlbb[id];
        let jawab = json.jawaban;

        if (/^hint$/i.test(text)) {
            let clue = jawab.replace(/[aeiou]/gi, '_');
            return conn.reply(m.chat, `💡 Hint:\n\`\`\`${clue}\`\`\``, msg);
        }

        if (/^suren$/i.test(text)) {
            await conn.reply(m.chat, `🏳️ Menyerah!\n🧠 Jawaban: *${jawab}*`, msg);
            clearTimeout(timeoutId);
            delete conn.mlbb[id];
            return;
        }

        if (text.toLowerCase() === jawab.toLowerCase().trim()) {
            users.exp += 1000;
            users.tiketcoin = (users.tiketcoin || 0) + 1;
            await conn.reply(m.chat, `✅ *Jawaban benar!*\n+1000 XP\n+1 Tiketcoin`, msg);
            clearTimeout(timeoutId);
            delete conn.mlbb[id];
        } else if (similarity(text.toLowerCase(), jawab.toLowerCase().trim()) >= threshold) {
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