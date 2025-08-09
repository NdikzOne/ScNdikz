const handler = async (m, {
    args,
    command
}) => {
    const pertanyaan = args.join(' ')
    if (!pertanyaan) {
        return m.reply(`🔮 *Penggunaan:*\n.${command} [pertanyaan]\n\n*Contoh:*\n.${command} saya menjadi presiden?`)
    }

    const jawaban = [
        'Bisa',
        'Gak Bisa',
        'Gak Bisa Ajg 😂',
        'TENTU PASTI KAMU BISA!!!! 💪',
        'Bisa sih, tapi kayaknya enggak deh 😅',
        'Coba tanya ke diri sendiri dulu 🗿',
        'Gak bakal bisa kecuali kamu usaha dulu',
        '99% Gagal tapi 1% adalah MUKJIZAT ✨'
    ]

    const hasil = jawaban[Math.floor(Math.random() * jawaban.length)]

    return m.reply(`🤔 *Pertanyaan:* Bisakah ${pertanyaan}\n✅ *Jawaban:* ${hasil}`)
}

handler.command = ['bisakah']
handler.category = 'fun'
handler.description = 'Menjawab pertanyaan "Bisakah..." secara acak'

module.exports = handler