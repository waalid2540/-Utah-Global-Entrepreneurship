// ElevenLabs Text-to-Speech Service
// Professional AI voices for DOT training and pronunciation

interface ElevenLabsConfig {
  apiKey: string
  voiceId: string
  baseUrl: string
}

class ElevenLabsService {
  private config: ElevenLabsConfig

  constructor(apiKey: string, voiceId: string) {
    this.config = {
      apiKey,
      voiceId,
      baseUrl: 'https://api.elevenlabs.io/v1'
    }
  }

  // Add natural pauses to text for slower, clearer speech
  private addNaturalPauses(text: string): string {
    return text
      // Add longer pauses after periods and question marks for slower speech
      .replace(/\./g, '. . .')
      .replace(/\?/g, '? . . .')
      // Add pauses after commas for slower speech
      .replace(/,/g, ', . ')
      // Add pauses between words for very slow speech
      .replace(/\s+/g, ' . ')
  }

  async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      // Process text for educational clarity
      const processedText = this.addNaturalPauses(text)
      
      console.log(`🎵 ElevenLabs: Generating speech for: "${text.substring(0, 50)}..."`)
      console.log(`🔗 API URL: ${this.config.baseUrl}/text-to-speech/${this.config.voiceId}`)
      
      const response = await fetch(`${this.config.baseUrl}/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.7,        // Higher stability for clearer speech
            similarity_boost: 0.8, // Higher similarity for consistent voice
            style: 0.2,            // Slight style for more natural speech
            use_speaker_boost: true
          }
        })
      })

      console.log(`📡 ElevenLabs response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ ElevenLabs API error: ${response.status} - ${errorText}`)
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log(`✅ Generated audio: ${arrayBuffer.byteLength} bytes`)
      return arrayBuffer
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error)
      throw error
    }
  }

  async playText(text: string): Promise<void> {
    try {
      const audioBuffer = await this.generateSpeech(text)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      
      // Mobile browser audio settings
      audio.preload = 'auto'
      audio.volume = 1.0
      
      return new Promise((resolve, reject) => {
        let hasResolved = false
        
        const cleanup = () => {
          URL.revokeObjectURL(audioUrl)
          audio.removeEventListener('ended', onEnded)
          audio.removeEventListener('error', onError)
          audio.removeEventListener('canplaythrough', onCanPlay)
        }
        
        const onEnded = () => {
          if (!hasResolved) {
            hasResolved = true
            cleanup()
            console.log('✅ Audio playback completed')
            resolve()
          }
        }
        
        const onError = (error: any) => {
          if (!hasResolved) {
            hasResolved = true
            cleanup()
            console.error('❌ Audio playback error:', error)
            reject(new Error('Audio playback failed'))
          }
        }
        
        const onCanPlay = async () => {
          try {
            console.log('🎵 Starting audio playback...')
            await audio.play()
          } catch (playError) {
            console.error('❌ Play error:', playError)
            if (!hasResolved) {
              hasResolved = true
              cleanup()
              reject(new Error('Failed to start audio playback'))
            }
          }
        }
        
        audio.addEventListener('ended', onEnded)
        audio.addEventListener('error', onError)
        audio.addEventListener('canplaythrough', onCanPlay)
        
        // Fallback timeout for mobile browsers
        setTimeout(() => {
          if (!hasResolved) {
            console.warn('⚠️ Audio playback timeout')
            hasResolved = true
            cleanup()
            resolve() // Don't fail, just continue
          }
        }, 30000) // 30 second timeout
        
        // Load the audio
        audio.load()
      })
    } catch (error) {
      console.error('Failed to play audio:', error)
      throw error
    }
  }

  // Batch generate multiple audio clips for conversations
  async generateConversationAudio(conversation: { officer: string; driver: string }[]): Promise<{
    officerAudio: ArrayBuffer[]
    driverAudio: ArrayBuffer[]
  }> {
    const officerPromises = conversation.map(item => this.generateSpeech(item.officer))
    const driverPromises = conversation.map(item => this.generateSpeech(item.driver))

    const [officerAudio, driverAudio] = await Promise.all([
      Promise.all(officerPromises),
      Promise.all(driverPromises)
    ])

    return { officerAudio, driverAudio }
  }
}

// Factory function to create ElevenLabs service with environment variables
export const createElevenLabsService = (): ElevenLabsService => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID
  
  console.log('🔍 ElevenLabs Debug:')
  console.log('  API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING')
  console.log('  Voice ID:', voiceId || 'MISSING')
  console.log('  Environment vars loaded:', Object.keys(import.meta.env))
  
  if (!apiKey || !voiceId) {
    console.error('❌ ElevenLabs configuration missing')
    throw new Error('ElevenLabs API key and Voice ID must be configured in environment variables')
  }
  
  return new ElevenLabsService(apiKey, voiceId)
}

// Default export
export default ElevenLabsService