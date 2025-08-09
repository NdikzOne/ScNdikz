const axios = require('axios');
const cheerio = require('cheerio');

const handler = async (m, {
    conn,
    args,
    command
}) => {
    const link = args[0];

    if (!link) {
        return m.reply(`📦 Kirimkan link MediaFire!\nContoh: .${command} https://www.mediafire.com/file/xxxx/file.zip`);
    }

    if (!/^https?:\/\/(www\.)?mediafire\.com/.test(link)) {
        return m.reply('❌ Link MediaFire tidak valid!');
    }

    try {
        await m.reply('⏳ Mengambil data dari MediaFire...');

        const res = await axios.get(link);
        const $ = cheerio.load(res.data);

        const downloadLink = $('#downloadButton').attr('href');
        const fileName = $('.dl-btn-label').text().trim();
        const fileSize = $('.fileInfo span').eq(1).text().trim();

        if (!downloadLink || !fileName) {
            return m.reply('❌ Gagal mengambil data dari MediaFire.');
        }

        const caption = `📥 *MEDIAFIRE DOWNLOADER*\n\n📄 *Nama:* ${fileName}\n📦 *Ukuran:* ${fileSize}\n🔗 *Link:* ${downloadLink}\n\n_Mengirim file..._`;

        await conn.sendMessage(m.chat, {
            document: {
                url: downloadLink
            },
            fileName,
            mimetype: 'application/octet-stream'
        }, {
            quoted: m
        });

        // Optional: reply caption
        await m.reply(caption);

    } catch (e) {
        console.error('[MEDIAFIRE ERROR]', e);
        return m.reply(`⚠️ Terjadi kesalahan saat mengakses MediaFire. Mungkin file-nya tidak publik atau server error. ${e}`);
    }
};

handler.command = ['mediafire', 'mf'];
handler.category = 'downloader';
handler.description = 'Download file dari MediaFire menggunakan scrape';

module.exports = handler;