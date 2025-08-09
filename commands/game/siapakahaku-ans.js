const similarity = require('similarity');

const threshold = 0.72;

const handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    const id = m.sender;
    const text = typeof m.text === 'string' ? m.text.trim() : '';
    if (!text) return;

    const users = db.get('user', id); // pastikan db.get bisa akses user data
    conn.siapakahaku = conn.siapakahaku || {};

    if (!(id in conn.siapakahaku)) return;

    const [msg, json, timeoutId] = conn.siapakahaku[id];

    // Hint command
    if (/^hint$/i.test(text)) {
        const clue = json.jawaban.replace(/[aiueo]/gi, '_');
        return conn.reply(m.chat, `💡 Hint:\n\`\`\`${clue}\`\`\``, msg);
    }

    // Surrender command
    if (/^suren$/i.test(text)) {
        clearTimeout(timeoutId);
        delete conn.siapakahaku[id];
        return conn.reply(m.chat, `🏳️ Menyerah!\n🧠 Jawaban: *${json.jawaban}*`, msg);
    }

    // Check correct answer
    if (text.toLowerCase() === json.jawaban.toLowerCase().trim()) {
        users.exp += 1000;
        users.tiketcoin = (users.tiketcoin || 0) + 1;

        await conn.reply(m.chat, `✅ *Jawaban benar!*\n🎁 +1000 XP\n🎟 +1 Tiketcoin`, msg);
        clearTimeout(timeoutId);
        delete conn.siapakahaku[id];
    }
    // Check similarity
    else if (similarity(text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
        await conn.reply(m.chat, `🤏 *Hampir benar! Teruskan!*`, msg);
    }
    // Wrong answer
    else {
        await conn.reply(m.chat, `❌ *Salah! Coba lagi.*`, msg);
    }
};

module.exports = handler;