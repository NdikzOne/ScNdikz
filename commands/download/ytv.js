const axios = require("axios");

const handler = async (m, {
    conn,
    text,
    command
}) => {
    if (!text) return m.reply(`Contoh:\n.${command} https://youtu.be/WK-PlNz52FM`);
    if (!text.includes("youtube.com") && !text.includes("youtu.be"))
        return m.reply(`❌ URL YouTube tidak valid.`);

    const youtubeUrl = text.trim();

    const ytmp3mobi = async (youtubeUrl, format = "mp4") => {
        const regYoutubeId =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/;
        const videoId = youtubeUrl.match(regYoutubeId)?.[1];
        if (!videoId) throw Error("❌ Gagal mengambil ID video YouTube.");

        const urlParam = {
            v: videoId,
            f: format,
            _: Math.random(),
        };

        const headers = {
            Referer: "https://id.ytmp3.mobi/",
        };

        const fetchJson = async (url, info) => {
            const res = await axios.get(url, {
                headers
            });
            if (res.status !== 200) throw Error(`Gagal fetch ${info} (${res.status})`);
            return res.data;
        };

        const {
            convertURL
        } = await fetchJson(
            "https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random(),
            "convertURL"
        );

        const {
            progressURL,
            downloadURL
        } = await fetchJson(
            `${convertURL}&${new URLSearchParams(urlParam).toString()}`,
            "progressURL"
        );

        let error, progress, title;
        while (progress != 3) {
            const result = await fetchJson(progressURL, "progress check");
            error = result.error;
            progress = result.progress;
            title = result.title;
            if (error) throw Error(`Gagal konversi: ${error}`);
        }

        return {
            title,
            downloadURL
        };
    };

    try {
        await m.reply("⏳ Memproses video...");

        const {
            title,
            downloadURL
        } = await ytmp3mobi(youtubeUrl, "mp4");

        await conn.sendMessage(
            m.chat, {
                video: {
                    url: downloadURL
                },
                mimetype: "video/mp4",
                fileName: `${title}.mp4`,
            }, {
                quoted: m
            }
        );
    } catch (e) {
        console.error("[YTMP4 ERROR]", e);
        await m.reply(`❌ Gagal:\n${e.message}`);
    }
};

handler.command = ["ytmp4", "ytv"];
handler.category = "downloader";
handler.description = "Download video dari YouTube";

module.exports = handler;