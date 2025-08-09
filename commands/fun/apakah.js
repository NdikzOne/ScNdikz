const handler = async (m, {
    args,
    command
}) => {
    const pertanyaan = args.join(' ')
    if (!pertanyaan) {
        return m.reply(`🔮 *Penggunaan:*\n.${command} [pertanyaan]\n\n*Contoh:*\n.${command} saya ganteng?`)
    }

    const jawaban = [
        'Iya',
        'Tidak',
        'Bisa jadi',
        'Betul',
        'Kagak tau gw 🗿',
        'Kenapa tanya gw? 🗿',
        'Maleslah, mau makan dulu 🍜',
        'Nanti aja tanya ke mama kamu 😒',
        'Tentu saja!',
        'Ngimpi lu bang'
    ]

    const hasil = jawaban[Math.floor(Math.random() * jawaban.length)]

    return m.reply(`❓ *Pertanyaan:* Apakah ${pertanyaan}\n✅ *Jawaban:* ${hasil}`)
}

handler.command = ['apakah']
handler.category = 'fun'
handler.description = 'Menjawab pertanyaan secara acak (iya/tidak dll)'

module.exports = handler