import axios from 'axios'
import FormData from 'form-data'

class IllariaUpscaler {
    constructor() {
        this.api_url = 'https://thestinger-ilaria-upscaler.hf.space/gradio_api'
        this.file_url = 'https://thestinger-ilaria-upscaler.hf.space/gradio_api/file='
    }
    
    generateSession() {
        return Math.random().toString(36).substring(2)
    }
    
    async upload(buffer) {
        const upload_id = this.generateSession()
        const orig_name = `rynn_${Date.now()}.jpg`
        const form = new FormData()
        form.append('files', buffer, orig_name)
        const { data } = await axios.post(`${this.api_url}/upload?upload_id=${upload_id}`, form, {
            headers: form.getHeaders()
        })
        
        return {
            orig_name,
            path: data[0],
            url: `${this.file_url}${data[0]}`
        }
    }
    
    async process(buffer, options = {}) {
        const {
            model = 'RealESRGAN_x4plus',
            denoice_strength = 0.5,
            resolution = 4,
            fase_enhancement = false
        } = options
        
        const _model = ['RealESRGAN_x4plus', 'RealESRNet_x4plus', 'RealESRGAN_x4plus_anime_6B', 'RealESRGAN_x2plus', 'realesr-general-x4v3']
        
        if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required')
        if (!_model.includes(model)) throw new Error(`Available models: ${_model.join(', ')}`)
        if (denoice_strength > 1) throw new Error('Max denoice strength: 1')
        if (resolution > 6) throw new Error('Max resolution: 6')
        if (typeof fase_enhancement !== 'boolean') throw new Error('Fase enhancement must be boolean')
        
        const image_url = await this.upload(buffer)
        const session_hash = this.generateSession()
        
        await axios.post(`${this.api_url}/queue/join?`, {
            data: [
                {
                    path: image_url.path,
                    url: image_url.url,
                    orig_name: image_url.orig_name,
                    size: buffer.length,
                    mime_type: 'image/jpeg',
                    meta: { _type: 'gradio.FileData' }
                },
                model,
                denoice_strength,
                fase_enhancement,
                resolution
            ],
            event_data: null,
            fn_index: 1,
            trigger_id: 20,
            session_hash: session_hash
        })
        
        const { data } = await axios.get(`${this.api_url}/queue/data?session_hash=${session_hash}`)
        
        const lines = data.split('\n\n')
        for (const line of lines) {
            if (line.startsWith('data:')) {
                const d = JSON.parse(line.substring(6))
                if (d.msg === 'process_completed') return d.output.data[0].url
            }
        }
        
        throw new Error('Process failed')
    }
}

let handler = async (m, { conn }) => {
    try {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''
        
        if (!mime.startsWith('image/')) return m.reply('Mna Gamabr Nya')
        
        m.reply('Wait...')
        
        const media = await q.download()
        const upscaler = new IllariaUpscaler()
        const result = await upscaler.process(media, {
            model: 'RealESRGAN_x4plus',
            denoice_strength: 0.5,
            resolution: 4,
            fase_enhancement: true
        })       
        
        await conn.sendMessage(m.chat, { 
            image: { url: result }, 
        }, { quoted: m })
        
    } catch (e) {
        m.reply(e.message)
    }
}

handler.help = ['hd']
handler.command = ['hd']
handler.tags = ['tools']

export default handler