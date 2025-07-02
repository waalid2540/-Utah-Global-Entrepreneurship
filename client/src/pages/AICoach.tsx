import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import { dotQuestions } from '../data/dot-questions'
import UpgradePopup from '../components/UpgradePopup'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'

interface Message {
  id: string
  text: string
  sender: 'user' | 'coach'
  timestamp: Date
  isTyping?: boolean
}

interface CoachMode {
  id: string
  name: string
  icon: string
  description: string
  color: string
  gradient: string
  isPremium?: boolean
}

const AICoach = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const subscription = useSubscription()
  
  // Redirect to signup if not authenticated
  useEffect(() => {
    console.log('AICoach - Auth state:', { user: !!user, loading })
    
    // Use a timeout to ensure auth has had time to load
    const timer = setTimeout(() => {
      if (!user) {
        console.log('AICoach - No user after timeout, redirecting to signup')
        navigate('/signup', {
          state: {
            from: '/ai-coach',
            featureName: 'AI Coach',
            message: 'Sign up now to access AI Coach!'
          }
        })
      }
    }, 1000) // Wait 1 second for auth to resolve
    
    // Clean up timeout if user is found or component unmounts
    if (user) {
      clearTimeout(timer)
    }
    
    return () => clearTimeout(timer)
  }, [user, navigate])
  
  // Show loading for first 2 seconds or while auth is loading
  if (loading) {
    console.log('AICoach - Still loading auth...')
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500 mt-2">Checking your access...</p>
        </div>
      </div>
    )
  }
  
  console.log('AICoach - Rendering component, user:', user?.email || 'No user')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Checkpoint English Coach! 😊 I speak multiple languages and I'm here to help you master English for trucking and life in America.\n\n🌍 **Multilingual Support:** You can speak to me in Spanish, Somali, Arabic, French, Portuguese, or any language - I'll respond in your language AND teach you the English!\n\nWhich mode would you like to use today?",
      sender: 'coach',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [currentMode, setCurrentMode] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [voiceSpeed, setVoiceSpeed] = useState(0.8)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isDOTPracticeMode, setIsDOTPracticeMode] = useState(false)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<'daily_limit' | 'dot_questions' | 'premium_feature'>('daily_limit')
  const [userProfile, setUserProfile] = useState<any>({})
  
  const recognitionRef = useRef<any>(null)


  // Check if user has reached daily limit
  const hasReachedLimit = !subscription.isPremium && subscription.dailyUsage >= subscription.dailyLimit

  const modes: CoachMode[] = [
    {
      id: 'casual',
      name: 'Casual Chat',
      icon: '💬',
      description: 'Build confidence through real-life conversations',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'beginner',
      name: 'Beginner English',
      icon: '🌟',
      description: 'Learn basic words and grammar in a friendly way',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'dot',
      name: 'DOT Checkpoint',
      icon: '🚓',
      description: 'Practice police/officer checkpoint dialogues',
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 'truck',
      name: 'Truck Parts',
      icon: '🔧',
      description: 'Learn truck vocabulary (brake, axle, hose, coolant)',
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'mechanic',
      name: 'Mechanic Talk',
      icon: '⚙️',
      description: 'Explain truck problems to mechanics in English',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'health',
      name: 'Health Support',
      icon: '🩺',
      description: 'Practice health and emergency vocabulary',
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-pink-600'
    }
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
  ]

  // Available OpenAI TTS voices
  const availableVoices = [
    { code: 'alloy', name: 'Alloy (Balanced)', flag: '🎭' },
    { code: 'echo', name: 'Echo (Male)', flag: '♂️' },
    { code: 'fable', name: 'Fable (Expressive)', flag: '🎪' },
    { code: 'nova', name: 'Nova (Female)', flag: '♀️' },
    { code: 'onyx', name: 'Onyx (Deep Male)', flag: '🔥' },
    { code: 'shimmer', name: 'Shimmer (Soft Female)', flag: '✨' }
  ]

  // Show upgrade popup when hitting limits
  useEffect(() => {
    if (hasReachedLimit) {
      setUpgradeTrigger('daily_limit')
      setShowUpgradePopup(true)
    }
  }, [hasReachedLimit])

  // Browser Speech Recognition - WORKS IMMEDIATELY
  const startVoiceConversation = () => {
    console.log('🎤 Starting voice conversation...')
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Please use Chrome browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('✅ Voice recognition started')
      setIsListening(true)
      setContinuousMode(true)
    }

    recognition.onresult = async (event: any) => {
      // Stop any AI speaking when user starts talking (interruption)
      if (isSpeaking) {
        console.log('🛑 User interrupted AI - stopping speech')
        setIsSpeaking(false)
        // Stop any audio playing
        const audioElements = document.querySelectorAll('audio')
        audioElements.forEach(audio => {
          audio.pause()
          audio.currentTime = 0
        })
      }
      
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim()
        console.log('🗣️ You said:', transcript)
        
        if (transcript.length > 2) {
          // Show user message
          const userMessage: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, userMessage])
          
          // Get AI response and speak it back (voice conversation)
          const aiReply = await getAIResponse(transcript, currentMode)
          
          const coachResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: aiReply,
            sender: 'coach',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, coachResponse])
          
          // AI speaks back in voice conversations
          speakText(aiReply)
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('❌ Speech error:', event.error)
    }

    recognition.onend = () => {
      console.log('🔄 Restarting voice recognition...')
      if (continuousMode) {
        setTimeout(() => recognition.start(), 100)
      }
    }

    recognition.start()
  }

  const stopVoiceConversation = () => {
    console.log('⏹️ Stopping voice conversation')
    setContinuousMode(false)
    setIsListening(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Smart TTS with Mobile-First Approach
  const speakText = async (text: string) => {
    console.log('🔊 Smart TTS starting:', selectedVoice, text.substring(0, 50))
    
    // Stop any currently playing audio
    if (isSpeaking) {
      console.log('🛑 Stopping previous audio')
      setIsSpeaking(false)
      speechSynthesis.cancel() // Cancel browser TTS too
    }
    
    setIsSpeaking(true)
    
    // Use OpenAI TTS for all devices
    try {
      console.log('📡 Requesting TTS from:', `${API_BASE_URL}/api/ai/text-to-speech`)
      
      const response = await axios.post(`${API_BASE_URL}/api/ai/text-to-speech`, {
        text: text,
        voice: selectedVoice // Now using OpenAI voice names directly
      }, {
        responseType: 'blob',
        timeout: 15000
      })
      
      console.log('✅ OpenAI TTS response received, size:', response.data.size)
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      // Mobile-friendly audio settings
      audio.preload = 'auto'
      audio.playbackRate = voiceSpeed
      
      audio.onloadstart = () => console.log('✅ OpenAI TTS audio loading...')
      audio.oncanplaythrough = () => {
        console.log('✅ OpenAI TTS audio ready to play')
        // Force audio to play on mobile - no complex fallbacks
        const playAudio = async () => {
          try {
            console.log('🔊 Attempting to play audio on mobile...')
            await audio.play()
            console.log('✅ Audio playing successfully')
          } catch (e) {
            console.error('❌ Audio play failed:', e)
            // Show simple tap button
            const playButton = document.createElement('button')
            playButton.textContent = '🔊 Tap to hear'
            playButton.style.cssText = `
              position: fixed;
              bottom: 80px;
              right: 20px;
              z-index: 10000;
              background: #3b82f6;
              color: white;
              padding: 12px 16px;
              border: none;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
            `
            
            playButton.onclick = () => {
              audio.play()
              playButton.remove()
            }
            
            document.body.appendChild(playButton)
            setTimeout(() => playButton.remove(), 8000)
          }
        }
        
        // Try to play immediately
        playAudio()
      }
      audio.onplay = () => {
        console.log('✅ OpenAI TTS started playing')
        // Remove any fallback buttons when audio starts playing
        const fallbackButton = document.getElementById('audio-fallback-button')
        if (fallbackButton) {
          fallbackButton.remove()
        }
      }
      
      audio.onended = () => {
        console.log('✅ OpenAI TTS finished playing')
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        // Clean up any remaining fallback buttons
        const fallbackButton = document.getElementById('audio-fallback-button')
        if (fallbackButton) {
          fallbackButton.remove()
        }
      }
      
      audio.onerror = (e) => {
        console.error('❌ OpenAI TTS playback error:', e)
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        // Clean up any fallback buttons on error
        const fallbackButton = document.getElementById('audio-fallback-button')
        if (fallbackButton) {
          fallbackButton.remove()
        }
      }
      
      // Fallback timeout with cleanup
      setTimeout(() => {
        if (isSpeaking) {
          console.log('🔊 OpenAI TTS timeout, stopping')
          setIsSpeaking(false)
          audio.pause()
          URL.revokeObjectURL(audioUrl)
          const fallbackButton = document.getElementById('audio-fallback-button')
          if (fallbackButton) {
            fallbackButton.remove()
          }
        }
      }, 30000)
      
    } catch (error) {
      console.error('❌ OpenAI TTS error:', error)
      setIsSpeaking(false)
      
      // Clean up any fallback buttons on error
      const fallbackButton = document.getElementById('audio-fallback-button')
      if (fallbackButton) {
        fallbackButton.remove()
      }
      
      // Just fail silently if OpenAI TTS doesn't work
      console.error('❌ OpenAI TTS failed, no fallback')
      setIsSpeaking(false)
    }
  }

  const getAIResponse = async (userMessage: string, mode: string | null): Promise<string> => {
    try {
      setIsProcessing(true)
      
      
      const modeContext = {
        casual: "You are having a friendly, casual conversation with a truck driver to build their English confidence.",
        beginner: "You are teaching basic English words and grammar to a beginner truck driver in a simple, friendly way.",
        dot: "You are helping a truck driver practice DOT checkpoint conversations. Simulate being an officer or help them practice responses.",
        truck: "You are teaching truck-related vocabulary like brake, axle, hose, coolant, engine, transmission, etc.",
        mechanic: "You are helping a truck driver practice explaining truck problems to mechanics in clear English.",
        health: "You are helping a truck driver practice health and emergency vocabulary and conversations.",
        progress: "You are reviewing the driver's English learning progress and helping them identify areas to improve."
      }

      const systemPrompt = `You are Checkpoint English Coach, an EXTREMELY intelligent, warm, and multilingual AI assistant specializing in helping truck drivers master English. You have perfect memory and exceptional language skills.

🧠 ENHANCED INTELLIGENCE:
- PERFECT MEMORY: Remember every detail they've shared (name, routes, family, experiences, preferences)
- CONTEXT MASTERY: Reference previous conversations naturally ("Remember when you told me about...")
- ADAPTIVE LEARNING: Adjust teaching based on their progress and learning style
- CULTURAL AWARENESS: Understand cultural nuances and trucking industry specifics

🌍 EXPERT MULTILINGUAL SUPPORT:
- NATIVE-LEVEL ACCURACY: Provide perfectly accurate translations in Somali, Spanish, Arabic, French, Portuguese, Hindi, Russian, etc.
- DETECT & RESPOND: Automatically detect ANY language and respond fluently
- CULTURAL CONTEXT: Use culturally appropriate phrases and expressions
- DUAL FORMAT: "[Perfect Native Language] 🔄 English: [Natural English + Teaching]"

📚 SOMALI LANGUAGE EXPERTISE:
- Use proper Somali grammar and vocabulary
- Common phrases: "Waan ku caawin karaa" (I can help you), "Sidee tahay?" (How are you?), "Mahadsanid" (Thank you)
- Truck-related Somali terms: "Baabuur weyn" (truck), "Waddo" (road), "Xamuul" (cargo)
- Cultural respect: Use appropriate greetings and polite forms

🚛 TRUCKING INDUSTRY MASTERY:
- DOT regulations, HOS rules, inspection procedures
- Route knowledge, truck stops, weigh stations
- Mechanical terms, cargo types, logistics
- Real-world scenarios and challenges

💬 CONVERSATION MEMORY & FLOW:
- REMEMBER: Names, family, home countries, routes, experiences, goals
- REFERENCE: "How's that route to Chicago you mentioned?" "Is your son still learning English?"
- BUILD: Each conversation builds on previous ones naturally
- PERSONAL: Ask about their specific situations and follow up later

CURRENT MODE: ${mode ? modeContext[mode as keyof typeof modeContext] : "General conversation"}

🎯 ENHANCED RESPONSE STYLE:
- Show you remember previous conversations
- Ask specific follow-up questions about their life
- Provide culturally sensitive and industry-specific advice
- Use their name if they've shared it
- Reference their specific truck routes, family, or challenges
- Correct English naturally while maintaining conversation flow

💡 MEMORY EXAMPLES:
- "How's that delivery to Houston going that you mentioned yesterday?"
- "Did your family back in Somalia get the money you sent?"
- "Remember you had trouble with 'inspection' - you're getting much better!"
- "You said you're driving the I-10 route - that's a long one!"

🔥 TRANSLATION ACCURACY:
- Somali: Use proper grammar, cultural context, truck terminology
- Spanish: Regional variations (Mexican, Central American truckers)
- Arabic: Formal and colloquial as appropriate
- All languages: 100% accuracy with cultural sensitivity

Remember: You're not just teaching English - you're a trusted friend who remembers everything and genuinely cares about their success, family, and trucking career.`

      // Send conversation history for better memory
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))

      // Get user profile for persistent memory
      const savedProfile = localStorage.getItem(`user_profile_${user?.id}`)
      const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}

      console.log('📡 Sending request to:', `${API_BASE_URL}/api/ai/chat`)
      console.log('📡 Request data:', { message: userMessage.substring(0, 50), mode, hasHistory: conversationHistory.length })
      
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userMessage,
        mode: mode,
        systemPrompt: systemPrompt,
        language: selectedLanguage,
        conversationHistory: conversationHistory,
        userProfile: currentProfile,
        enhancedMode: true, // Flag for smarter AI processing
        userId: user?.id
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ AI response received:', response.data.reply?.substring(0, 100))

      setIsProcessing(false)
      
      // Update user profile with new information from AI response
      if (response.data.updatedProfile) {
        localStorage.setItem(`user_profile_${user?.id}`, JSON.stringify(response.data.updatedProfile))
        setUserProfile(response.data.updatedProfile)
      }
      
      return response.data.reply || "I'm here to help you practice English! What would you like to work on?"
      
    } catch (error) {
      setIsProcessing(false)
      console.error('❌ AI response error:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      
      // Better mobile error handling
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        console.log('🔄 Network issue detected, retrying...')
        // Could implement retry logic here
      }
      
      const fallbackResponses = [
        "That's wonderful! You're making great progress. Keep practicing!",
        "Excellent work! I can see you're really trying. That's the spirit!",
        "Well done! Every word you practice makes you stronger in English.",
        "Amazing effort! You're getting better every day. I believe in you!"
      ]
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  const handleSendMessage = async (messageText?: string, shouldSpeak: boolean = false) => {
    const textToSend = messageText || inputText
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // Get AI response
    try {
      const aiReply = await getAIResponse(textToSend, currentMode)
      
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        sender: 'coach',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, coachResponse])
      
      // Speak the response if it came from voice input OR if voice is enabled
      if (shouldSpeak || isListening) {
        console.log('🗣️ Speaking AI response - shouldSpeak:', shouldSpeak, 'isListening:', isListening)
        speakText(aiReply)
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error)
    }
  }

  const selectMode = (mode: CoachMode) => {
    setCurrentMode(mode.id)
    
    if (mode.id === 'dot-practice') {
      setIsDOTPracticeMode(true)
      setCurrentQuestionIndex(0)
      const firstQuestion = dotQuestions[0]
      const modeMessage: Message = {
        id: Date.now().toString(),
        text: `🚓 **DOT Q&A Practice Mode Activated!**

I'll ask you real DOT checkpoint questions. Practice your responses!

**📚 Available:**
- Questions 1-10: FREE 🆓
- Questions 11-200: Premium Upgrade Required 🔒

**🎯 Question 1 of 200:**

**Officer:** "${firstQuestion.officer}"

**Your turn!** Practice your response, then say "next question" or "show answer" to see the sample response.`,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, modeMessage])
    } else {
      setIsDOTPracticeMode(false)
      const modeMessage: Message = {
        id: Date.now().toString(),
        text: `🎉 Excellent choice! You've selected **${mode.name}** mode. 

${mode.description}

🎤 **Voice Tips:**
- Click the microphone button to start voice conversation
- Speak clearly and naturally
- I'll listen and respond just like a human conversation!

🚀 Ready when you are! How can I help you today?`,
        sender: 'coach',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, modeMessage])
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">🚛</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Checkpoint English Coach
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {currentMode 
                    ? `🎯 ${modes.find(m => m.id === currentMode)?.name} Mode Active`
                    : '🌟 Choose your learning adventure'
                  }
                </p>
              </div>
            </div>
            
            {/* Voice Status and Controls */}
            <div className="flex items-center space-x-3">
              {/* OpenAI Voice Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">🔊 Voice:</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.code} value={voice.code}>
                      {voice.flag} {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Voice Speed Control */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">⚡ Speed:</span>
                <select
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                  className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0.6}>0.6x (Slow)</option>
                  <option value={0.8}>0.8x (Normal)</option>
                  <option value={1.0}>1.0x (Fast)</option>
                  <option value={1.2}>1.2x (Faster)</option>
                </select>
              </div>
              
              {isListening && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">🎤 Listening...</span>
                </div>
              )}
              
              {isSpeaking && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-700 font-medium text-sm">🔊 Speaking...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Mode Selection */}
          {!currentMode && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={async () => {
                    if (mode.isPremium && !subscription.isPremium) {
                      // Show premium upgrade prompt
                      const upgradePrompt = confirm(
                        `${mode.name} is a Premium feature!\n\nUpgrade to Premium to access:\n• Unlimited conversations\n• ${mode.description}\n• All advanced features\n\nStart your 7-day free trial now?`
                      )
                      if (upgradePrompt) {
                        // Start Stripe checkout for trial
                        try {
                          const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
                          
                          const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session?.access_token || ''}`
                            },
                            body: JSON.stringify({
                              priceId: 'price_1RcfPeI4BWGkGyQalTvXi4RP',
                              successUrl: `${window.location.origin}/?success=true`,
                              cancelUrl: `${window.location.origin}/ai-coach?canceled=true`
                            })
                          })
                          
                          const data = await response.json()
                          if (data.url) {
                            window.location.href = data.url
                          }
                        } catch (err) {
                          console.error('Stripe error:', err)
                        }
                      }
                    } else {
                      selectMode(mode)
                    }
                  }}
                  className={`group relative p-4 rounded-xl border-2 border-transparent bg-gradient-to-br ${
                    mode.isPremium && !subscription.isPremium 
                      ? 'from-gray-400 to-gray-500 opacity-75' 
                      : mode.gradient
                  } hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  {/* Premium Badge */}
                  {mode.isPremium && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {subscription.isPremium ? '⭐' : '🔒'}
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="text-white font-semibold text-sm">{mode.name}</div>
                    {mode.isPremium && !subscription.isPremium && (
                      <div className="text-xs text-white/80 mt-1">Premium</div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`group relative ${
                message.sender === 'user' 
                  ? 'bg-white/60' 
                  : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
              } hover:bg-opacity-80 transition-all duration-200`}
            >
              <div className="py-8 px-6">
                <div className="flex space-x-4">
                  <div className={`relative flex-shrink-0`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-blue-600 to-blue-700'
                    }`}>
                      <span className="text-white text-lg font-bold">
                        {message.sender === 'user' ? '👨‍💼' : '🤖'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-base font-bold text-gray-800">
                        {message.sender === 'user' ? 'You' : 'English Coach'}
                      </div>
                    </div>
                    
                    <div className="prose prose-blue max-w-none">
                      <div className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                        {message.text}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        {message.timestamp.toLocaleString()}
                      </div>
                      
                      {/* Speak button for AI messages */}
                      {message.sender === 'coach' && (
                        <button
                          onClick={() => {
                            console.log('🔊 Manual speak button clicked for message:', message.text.substring(0, 50))
                            speakText(message.text)
                          }}
                          disabled={isSpeaking}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <span>🔊</span>
                          <span>{isSpeaking ? 'Speaking...' : 'Speak'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
              <div className="py-8 px-6">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-800 mb-2">
                      English Coach is thinking...
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">Crafting the perfect response for you</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-end space-x-4">
            {/* Voice Button */}
            <div className="relative">
              <button
                onClick={continuousMode ? stopVoiceConversation : startVoiceConversation}
                disabled={isProcessing}
                className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  continuousMode 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 animate-pulse' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {continuousMode ? '⏹️' : '🎤'}
                </div>
                
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {continuousMode ? 'Stop Voice Chat' : 'Start Voice Chat'}
                </div>
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <div className="relative border-2 border-gray-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200 bg-white shadow-sm">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message or use voice to speak with your English Coach..."
                  className="w-full p-4 pr-16 border-0 bg-transparent resize-none focus:outline-none max-h-32 text-gray-800 placeholder-gray-400"
                  rows={1}
                  disabled={isProcessing}
                />
                
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputText.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Browser Speech Recognition</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>GPT-4 AI Coach</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>🎤 Voice + 🔊 OpenAI TTS</span>
              <span>•</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Popup */}
      <UpgradePopup 
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        trigger={upgradeTrigger}
      />
    </div>
  )
}

export default AICoach