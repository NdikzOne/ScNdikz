const similarity = require('similarity');
const util = require('util');

const THRESHOLD = 0.75;

const handler = m => m;

handler.before = async function(m, {
    db,
    conn
}) {
    try {
        const id = m.sender;
        const text = typeof m.text === 'string' ? m.text : '';
        const users = db.get('user', id);

        conn.tebakgambar = conn.tebakgambar || {};

        if (!(id in conn.tebakgambar)) return;

        const [msg, json, timeoutId] = conn.tebakgambar[id];

        if (/^hint$/i.test(text)) {
            const answer = json.jawaban.trim();
            const clue = answer.replace(/[AIUEOaiueo]/gi, '_');
            await conn.reply(m.chat, `🧩 Hint:\n\`\`\`${clue}\`\`\``, msg);
            return;
        }

        if (/^suren$/i.test(text)) {
            await conn.reply(m.chat, `🚩 Kamu menyerah!\n📌 Jawaban: *${json.jawaban}*`, msg);
            clearTimeout(timeoutId);
            delete conn.tebakgambar[id];
            return;
        }

        const userAnswer = text.toLowerCase();
        const correctAnswer = json.jawaban.toLowerCase().trim();

        if (userAnswer === correctAnswer) {
            users.exp += 500;
            users.tiketcoin = (users.tiketcoin || 0) + 1;

            await conn.reply(m.chat, `🎉 *Jawaban benar!*\n+500 XP\n+1 Tiketcoin`, msg);
            clearTimeout(timeoutId);
            delete conn.tebakgambar[id];
        } else if (similarity(userAnswer, correctAnswer) >= THRESHOLD) {
            await conn.reply(m.chat, `💡 *Dikit lagi!*`, msg);
        } else {
            await conn.reply(m.chat, `❌ *Jawaban salah!*`, msg);
        }

    } catch (err) {
        return conn.reply(m.chat, util.format(err), m);
    }

    return true;
};

handler.exp = 0;

module.exports = handler;