const axios = require("axios");

const handler = async (m, { text, command }) => {
    if (!text) return m.reply(`Masukkan kata kunci pencarian.\nContoh: .${command} lathi`);

    try {
        const { data } = await axios.get(`https://flowfalcon.dpdns.org/search/youtube?q=${encodeURIComponent(text)}`);
        const list = data.result;

        if (!list || !list.length) return m.reply("Hasil tidak ditemukan.");

        let replyText = `*🔎 Hasil Pencarian untuk "${text}"*\n\n`;
        for (let i = 0; i < Math.min(list.length, 10); i++) {
            const vid = list[i];
            replyText += `*${i + 1}. ${vid.title}*\n`;
            replyText += `↳ *Channel:* ${vid.channel}\n`;
            replyText += `↳ *Durasi:* ${vid.duration}\n`;
            replyText += `↳ *Link:* ${vid.link}\n\n`;
        }

        m.reply(replyText.trim());
    } catch (e) {
        console.error(e);
        m.reply("Gagal melakukan pencarian.");
    }
};

handler.command = ["yts", "youtubesearch"];
handler.category = "downloader";
handler.description = "Mencari video di YouTube.";
handler.limit = 1;

module.exports = handler;
