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

        conn.tebaklirik = conn.tebaklirik || {};
        if (!(id in conn.tebaklirik)) return;

        const [msg, json, timeoutId, , poin] = conn.tebaklirik[id];
        const answer = json.jawaban;

        if (/^hint$/i.test(text)) {
            const clue = answer.replace(/[aiueo]/gi, '_');
            return conn.reply(m.chat, `💡 Hint:\n\`\`\`${clue}\`\`\``, msg);
        }

        if (/^suren$/i.test(text)) {
            await conn.reply(m.chat, `🏳️ Menyerah!\n🧠 Jawaban: *${answer}*`, msg);
            clearTimeout(timeoutId);
            delete conn.tebaklirik[id];
            return;
        }

        if (text.toLowerCase() === answer.toLowerCase().trim()) {
            users.exp += poin;
            users.tiketcoin = (users.tiketcoin || 0) + 1;
            await conn.reply(m.chat, `✅ *Jawaban benar!*\n+${poin} XP\n+1 Tiketcoin`, msg);
            clearTimeout(timeoutId);
            delete conn.tebaklirik[id];
        } else if (similarity(text.toLowerCase(), answer.toLowerCase().trim()) >= threshold) {
            await conn.reply(m.chat, `🤏 *Dikit lagi!*`, msg);
        } else {
            await conn.reply(m.chat, `❌ *Salah!*`, msg);
        }
    } catch (e) {
        conn.reply(m.chat, util.format(e), m);
    }

    return true;
};

module.exports = handler;