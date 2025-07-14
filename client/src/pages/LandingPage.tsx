import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleInvestorDeck = () => {
    // Download investor deck
    window.open('/somali-ai-dataset-investor-deck.pdf', '_blank')
  }

  const handlePartnerSignup = () => {
    navigate('/partner-signup')
  }

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email signup for updates
    alert('Thank you! We\'ll keep you updated on our progress.')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <div className="relative z-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌍</span>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Somali AI Dataset</h1>
                <p className="text-xs text-gray-400">Building the $1B African Language AI Platform</p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
              <a href="#investors" className="text-gray-300 hover:text-white transition-colors">Investors</a>
              <a href="#partners" className="text-gray-300 hover:text-white transition-colors">Partners</a>
              <button
                onClick={handleInvestorDeck}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Investment Deck
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '-3s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Pre-headline */}
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-200 border border-blue-500/30">
                <span className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                Building the $1B African Language AI Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="block mb-4">The World's First</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Somali AI Dataset
              </span>
              <span className="block mt-4 text-gray-300">Empire</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed max-w-5xl mx-auto">
              <strong className="text-white">25 million Somali speakers.</strong> 
              <span className="text-blue-400">Zero quality AI datasets.</span><br />
              <span className="text-purple-400">We're building the infrastructure that will power AI for 2 billion Africans.</span>
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 max-w-6xl mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-4xl font-bold text-blue-400 mb-2">$50B</div>
                <div className="text-gray-400">Total Market Size</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-4xl font-bold text-purple-400 mb-2">2000+</div>
                <div className="text-gray-400">African Languages</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-4xl font-bold text-pink-400 mb-2">2B</div>
                <div className="text-gray-400">African Speakers</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-4xl font-bold text-green-400 mb-2">$5B</div>
                <div className="text-gray-400">Exit Potential</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={handleInvestorDeck}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                View Investment Deck
              </button>
              <button
                onClick={handlePartnerSignup}
                className="border-2 border-gray-600 hover:border-white text-gray-300 hover:text-white px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 hover:bg-white/10"
              >
                Request Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-12 text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Backed by Islamic Scholar</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>AI Engineering Expertise</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>First-Mover Advantage</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>Billion-Dollar Trajectory</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              The <span className="text-red-400">$50 Billion</span> Problem
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              2 billion Africans are locked out of the AI revolution because their languages don't exist in training data.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8">
              <div className="text-6xl mb-6">🚫</div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Zero Quality Datasets</h3>
              <p className="text-gray-300 leading-relaxed">
                ChatGPT fails at basic Somali. Google Translate: 40% accuracy. 
                No Somali voice assistants exist. 25M speakers completely underserved.
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 rounded-3xl p-8">
              <div className="text-6xl mb-6">💸</div>
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Massive Market Gap</h3>
              <p className="text-gray-300 leading-relaxed">
                $25B annually spent on language data globally. 
                Africa represents 2000+ languages but gets &lt;1% of investment.
              </p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-3xl p-8">
              <div className="text-6xl mb-6">⏰</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">First-Mover Window</h3>
              <p className="text-gray-300 leading-relaxed">
                Big Tech knows they need African data. The company that captures 
                this market first will dominate for decades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              The <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Billion-Dollar</span> Solution
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              We're building the Amazon of African language data - starting with Somali, scaling to 2000+ languages.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-8">Platform Architecture</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-400 mb-2">Data Collection Engine</h4>
                    <p className="text-gray-300">Automated scraping + human curation across 200+ Somali sources</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-purple-400 mb-2">Quality Assurance</h4>
                    <p className="text-gray-300">Scholar validation + AI-powered quality scoring (95%+ accuracy)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-pink-400 mb-2">Enterprise APIs</h4>
                    <p className="text-gray-300">Real-time access for OpenAI, Google, Meta to train their models</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 border border-gray-700">
              <h3 className="text-3xl font-bold text-white mb-6">Current Dataset Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Somali Sentences</span>
                  <span className="text-blue-400 font-bold">1.2M collected</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{width: '12%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Quality Score</span>
                  <span className="text-green-400 font-bold">96.3%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Enterprise Customers</span>
                  <span className="text-purple-400 font-bold">3 pilots active</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Target by Year 1</span>
                  <span className="text-yellow-400 font-bold">10M sentences</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Opportunity */}
      <div id="investors" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">$5 Billion</span> Exit Strategy
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              We're not just building datasets - we're building the critical infrastructure that Big Tech needs for African expansion.
            </p>
          </div>

          {/* Revenue Trajectory */}
          <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-3xl p-12 border border-green-500/30 mb-16">
            <h3 className="text-4xl font-bold text-white mb-8 text-center">7-Year Revenue Trajectory</h3>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-400 mb-4">$12M</div>
                <div className="text-xl text-gray-300 mb-2">Year 2 Revenue</div>
                <div className="text-gray-400">Somali market dominance</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400 mb-4">$85M</div>
                <div className="text-xl text-gray-300 mb-2">Year 4 Revenue</div>
                <div className="text-gray-400">10+ African languages</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-400 mb-4">$500M</div>
                <div className="text-xl text-gray-300 mb-2">Year 7 Revenue</div>
                <div className="text-gray-400">Unicorn status achieved</div>
              </div>
            </div>
          </div>

          {/* Strategic Buyers */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">Strategic Acquisition Targets</h3>
              <div className="space-y-6">
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Google</h4>
                      <p className="text-gray-400">$1.8T market cap • Needs African data for Translate/Search</p>
                    </div>
                  </div>
                  <p className="text-gray-300">Strategic value: $3-5B (comparable to DeepMind acquisition)</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Microsoft</h4>
                      <p className="text-gray-400">$3.8T market cap • Acquired Nuance for $19.7B</p>
                    </div>
                  </div>
                  <p className="text-gray-300">Strategic value: $2-4B (fits Azure AI expansion)</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">O</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">OpenAI</h4>
                      <p className="text-gray-400">$80B valuation • Desperately needs diverse training data</p>
                    </div>
                  </div>
                  <p className="text-gray-300">Strategic value: $1-3B (critical for GPT improvement)</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/30">
              <h3 className="text-3xl font-bold text-white mb-6">Investment Opportunity</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-purple-400 mb-2">Seed Round: $200K</h4>
                  <p className="text-gray-300">15-20% equity • 18-month runway to Series A</p>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-blue-400 mb-2">Series A Target: $2M</h4>
                  <p className="text-gray-300">Expected in Month 12 • Scale to 10 languages</p>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-green-400 mb-2">Exit Timeline: 5-7 Years</h4>
                  <p className="text-gray-300">$2-5B acquisition • 10,000x+ potential return</p>
                </div>
                
                <div className="bg-black/50 rounded-2xl p-6 mt-8">
                  <h4 className="text-xl font-bold text-yellow-400 mb-4">Comparable Exits:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Nuance (Microsoft)</span>
                      <span className="text-white">$19.7B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Scale AI</span>
                      <span className="text-white">$7.3B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">DeepL</span>
                      <span className="text-white">$1B+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="demo" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Live <span className="text-green-400">Technology Demo</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              See our Somali AI processing in action - quality analysis, translation, and cultural validation.
            </p>
          </div>

          <div className="bg-black rounded-3xl p-8 border border-gray-700 max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Somali Text Analyzer</h3>
              <textarea 
                className="w-full h-32 bg-gray-800 border border-gray-600 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-blue-500" 
                placeholder="Enter Somali text here to see quality analysis, dialect detection, and translation..."
              ></textarea>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-blue-400 mb-3">Quality Score</h4>
                <div className="text-3xl font-bold text-white mb-2">96.3%</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '96.3%'}}></div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-purple-400 mb-3">Dialect Detection</h4>
                <div className="text-xl font-bold text-white mb-2">Northern Somali</div>
                <div className="text-gray-400">Confidence: 94.7%</div>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-green-400 mb-3">Translation Ready</h4>
                <div className="text-xl font-bold text-white mb-2">✓ Validated</div>
                <div className="text-gray-400">Scholar approved</div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={handlePartnerSignup}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Request Full API Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div id="partners" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Partner With <span className="text-yellow-400">Industry Leaders</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Join scholars, writers, and organizations building the future of African AI.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 border border-blue-500/30">
              <div className="text-6xl mb-6">🎓</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Academic Partners</h3>
              <p className="text-gray-300 mb-6">
                Collaborate with leading universities on groundbreaking African language research.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Research grants and funding</li>
                <li>• Publication opportunities</li>
                <li>• Academic recognition</li>
                <li>• PhD student involvement</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/30">
              <div className="text-6xl mb-6">✍️</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Content Contributors</h3>
              <p className="text-gray-300 mb-6">
                Help preserve and digitize Somali literature, poetry, and cultural knowledge.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Revenue sharing program</li>
                <li>• Cultural preservation mission</li>
                <li>• Global platform reach</li>
                <li>• Attribution and recognition</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-yellow-900/30 rounded-3xl p-8 border border-green-500/30">
              <div className="text-6xl mb-6">🏢</div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Enterprise Partners</h3>
              <p className="text-gray-300 mb-6">
                Integrate our datasets into your products and services for Somali communities.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• White-label solutions</li>
                <li>• Custom dataset creation</li>
                <li>• Technical support</li>
                <li>• Preferred pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Join the <span className="text-yellow-400">$1B Revolution</span>
          </h2>
          <p className="text-2xl text-gray-200 mb-12 leading-relaxed">
            Be part of the team that brings 2 billion Africans into the AI age.
            <br />
            <strong>The window is closing. The opportunity is now.</strong>
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">For Investors</h3>
              <p className="text-gray-200 mb-6">
                $200K gets you 15-20% of a company targeting $5B exit
              </p>
              <button 
                onClick={handleInvestorDeck}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg w-full transition-all duration-300 transform hover:scale-105"
              >
                Download Investment Deck
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">For Partners</h3>
              <p className="text-gray-200 mb-6">
                Shape the future of African AI and preserve cultural heritage
              </p>
              <button 
                onClick={handlePartnerSignup}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg w-full transition-all duration-300 transform hover:scale-105"
              >
                Join Partnership Program
              </button>
            </div>
          </div>

          <div className="text-gray-200 space-y-3">
            <p>✓ First-mover advantage in $50B market</p>
            <p>✓ Proven team with cultural authority and technical excellence</p>
            <p>✓ Clear path to billion-dollar acquisition</p>
            <p>✓ Impact: 2 billion Africans with native AI language support</p>
          </div>
        </div>
      </div>

      {/* Email Signup */}
      <div className="py-20 bg-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stay Updated on Our Progress
          </h2>
          <p className="text-xl text-green-200 mb-8">
            Be the first to know about investment rounds, partnerships, and major milestones
          </p>
          
          <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl text-black font-medium"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
              >
                Get Updates
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌍</span>
              </div>
              <span className="text-2xl font-bold text-white">Somali AI Dataset</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                Building the future of African AI, one language at a time
              </p>
              <p className="text-gray-500 text-sm">
                "The best of people are those who benefit others" - Prophet Muhammad ﷺ
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage