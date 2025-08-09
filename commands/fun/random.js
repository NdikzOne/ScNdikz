const handler = async (m, {
    conn,
    command
}) => {
    if (!m.isGroup) {
        return m.reply('❌ Fitur ini hanya bisa digunakan di grup!')
    }

    const metadata = await conn.groupMetadata(m.chat)
    const participants = metadata.participants || []

    const botId = conn.user?.id || conn.user?.jid || ''
    const memberIds = participants
        .map(p => p.id)
        .filter(id => id !== botId)

    if (!memberIds.length) {
        return m.reply('👀 Tidak ada member lain di grup ini selain bot.')
    }

    const randomId = memberIds[Math.floor(Math.random() * memberIds.length)]
    const mention = `@${randomId.split('@')[0]}`

    return conn.sendMessage(m.chat, {
        text: `🌀 Orang yang paling *${command}* di grup ini adalah ${mention}`,
        mentions: [randomId]
    }, {
        quoted: m
    })
}

handler.command = [
    'chindo', 'cina', 'china', 'papua', 'jawa', 'sunda', 'bego', 'goblok',
    'janda', 'perawan', 'babi', 'ganteng', 'tolol', 'cantik', 'duda', 'pinter',
    'pintar', 'asu', 'bodoh', 'gay', 'lesby', 'bajingan', 'jancok', 'anjing',
    'ngentod', 'ngentot', 'monyet', 'mastah', 'newbie', 'nolep', 'lesbi',
    'bangsat', 'bangke', 'sange', 'sangean', 'dakjal', 'horny', 'wibu',
    'yapit', 'anj', 'puki', 'peak', 'pantex', 'pantek', 'setan', 'iblis',
    'cacat', 'yatim', 'piatu'
]

handler.category = 'fun'
handler.description = 'Menunjuk member acak berdasarkan kata command'

module.exports = handler