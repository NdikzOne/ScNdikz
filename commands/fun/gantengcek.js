const handler = async (m, {
    conn,
    args,
    command
}) => {
    const nama = args.join(' ')
    if (!nama) {
        return m.reply(`🪞 *Penggunaan:*\n.${command} [nama]\n\n*Contoh:*\n.${command} Owner`)
    }

    const hasilList = [
        '10% banyak-banyak perawatan ya bang 🤣',
        '20% semangat ya bang 👍',
        '30% semangat bang merawat dirinya ><',
        '40% wahh bang ><',
        '50% abang ganteng deh ><',
        '60% hai ganteng 🐊',
        '62% bang ganteng ><',
        '70% hai ganteng 🐊',
        '74% abang ni ganteng deh ><',
        '75% hai bang ganteng 💖',
        '82% wihh abang pasti sering perawatan kan?? 💅',
        '83% love you abang ><',
        '94% hai ganteng ><',
        '97% Assalamualaikum ganteng 🐊',
        '100% bang pake susuk ya?? 🤔',
        '41% semangat :)',
        '39% lebih semangat 🐊',
        '29% semangat bang :)'
    ]

    const hasil = hasilList[Math.floor(Math.random() * hasilList.length)]

    const teks = `📋 *Nama:* ${nama}\n🧠 *Persentase Ganteng:* ${hasil}`
    await conn.sendMessage(m.chat, {
        text: teks
    }, {
        quoted: m
    })
}

handler.command = ['gantengcek', 'cekganteng']
handler.category = 'fun'
handler.description = 'Cek seberapa ganteng seseorang secara acak'

module.exports = handler