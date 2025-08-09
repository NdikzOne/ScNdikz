import axios from 'axios'

let handler = async (m, {
    conn,
    text
}) => {
    conn.autoAI = conn.autoAI ?? false
    conn.autoAISession = conn.autoAISession ?? null

    if (!text) throw `.autoai on atau off`

    if (text === 'on') {
        if (conn.autoAI && conn.autoAISession) return m.reply('Auto AI sudah aktif')

        try {
            let role = `Nama kamu adalah Zenzz AI, kamu memakai bahasa yang tidak baku.` // sesuaikan sesuai gaya AI kamu
            let createRes = await axios.get(`https://zenzxz.dpdns.org/ai/chatai/create`, {
                params: {
                    role
                }
            })

            if (createRes.data?.success && createRes.data?.sessionId) {
                conn.autoAI = true
                conn.autoAISession = createRes.data.sessionId
                return m.reply('✅ Auto AI aktif')
            } else {
                return m.reply('Gagal mengaktifkan Auto AI:\n' + JSON.stringify(createRes.data, null, 2))
            }
        } catch (e) {
            let err = e.response?.data || e
            return m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
        }

    } else if (text === 'off') {
        if (!conn.autoAI || !conn.autoAISession) return m.reply('Auto AI sudah nonaktif')

        try {
            await axios.get(`https://zenzxz.dpdns.org/ai/chatai/delete`, {
                params: {
                    sessionId: conn.autoAISession
                }
            })
            conn.autoAI = false
            conn.autoAISession = null
            return m.reply('❎ Auto AI dimatikan')
        } catch (e) {
            let err = e.response?.data || e
            return m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
        }
    } else {
        return m.reply('Format salah. Gunakan:\n.autoai on\n.autoai off')
    }
}

// ✅ BEFORE handler untuk memproses otomatis chat masuk
handler.before = async (m, {
    conn
}) => {
    if (!conn.autoAI || !conn.autoAISession) return;
    if (!m.text) return;
    if (m.isBaileys && m.fromMe) return;
    if (/^[.\#!\/\\]/.test(m.text)) return; // abaikan perintah

    try {
        let chatRes = await axios.get(`https://zenzxz.dpdns.org/ai/chatai/chat`, {
            params: {
                sessionId: conn.autoAISession,
                text: m.text
            }
        })

        if (chatRes.data?.result) {
            m.reply(chatRes.data.result)
            return true // hentikan handler lain (jika perlu)
        }
    } catch (e) {
        let err = e.response?.data || e
        m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
    }
}

// 🔧 Metadata Plugin
handler.command = ['autoai']
handler.tags = ['ai']
handler.help = ['autoai on', 'autoai off']
handler.limit = false

export default handler