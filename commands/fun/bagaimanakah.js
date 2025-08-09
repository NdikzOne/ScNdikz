const handler = async (m, {
    args,
    command
}) => {
    const pertanyaan = args.join(' ')
    if (!pertanyaan) {
        return m.reply(`🧠 *Penggunaan:*\n.${command} [pertanyaan]\n\n*Contoh:*\n.${command} cara mengatasi sakit hati`)
    }

    const jawaban = [
        'Gak gimana-gimana 😅',
        'Sulit itu bro 😔',
        'Maaf, bot tidak bisa menjawab itu 🥲',
        'Coba deh cari di Google dulu 🔍',
        'Astaghfirullah... beneran??? 😳',
        'Pusing ah mikirin itu 🤯',
        'Owhh begitu ya... 😢',
        'Gimana yaa... coba tanya orang lain 🫠'
    ]

    const hasil = jawaban[Math.floor(Math.random() * jawaban.length)]

    return m.reply(`🗯️ *Pertanyaan:* Bagaimanakah ${pertanyaan}?\n🧾 *Jawaban:* ${hasil}`)
}

handler.command = ['bagaimanakah']
handler.category = 'fun'
handler.description = 'Menjawab pertanyaan "Bagaimanakah..." secara acak'

module.exports = handler