const handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    const id = 'family100_' + m.chat;
    conn.family100 = conn.family100 || {};
    if (!(id in conn.family100)) return;

    const game = conn.family100[id];
    const user = db.get("user", m.sender);
    const text = (m.text || '').toLowerCase().trim();

    // Menyerah
    if (/^suren$/i.test(text)) {
        clearTimeout(game.timeout);
        const jawaban = game.jawaban.map(j => `• ${j}`).join('\n');
        await conn.reply(m.chat, `🚩 Menyerah!\nJawaban:\n${jawaban}`, game.msg);
        delete conn.family100[id];
        return true;
    }

    let benar = false;

    game.jawaban.forEach((jwb, i) => {
        if (text === jwb.toLowerCase() && !game.terjawab[i]) {
            game.terjawab[i] = m.sender;
            user.money = (user.money || 0) + game.winScore;
            user.exp = (user.exp || 0) + game.expReward;
            benar = true;
            conn.reply(m.chat, `✅ *Benar!*\n+${game.winScore} Money\n+${game.expReward} XP`, m);
        }
    });

    if (game.terjawab.every(Boolean)) {
        clearTimeout(game.timeout);
        const hasil = game.jawaban.map((j, i) => {
            const u = game.terjawab[i];
            return `• *${j}* — ${u ? '@' + u.split('@')[0] : '(belum dijawab)'}`;
        }).join('\n');

        await conn.reply(m.chat, `🎉 Semua jawaban ditemukan!\n\n${hasil}`, game.msg, {
            mentions: game.terjawab.filter(Boolean)
        });
        delete conn.family100[id];
    }

    if (!benar && !/^hint|suren/i.test(text)) {
        m.reply('❌ Salah!');
    }

    return true;
};

module.exports = handler;