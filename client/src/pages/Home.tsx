import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import FeatureAccess from '../components/FeatureAccess'

const Home = () => {
  const { user } = useAuth()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      console.log('🎉 Payment successful! User should have premium access now')
      
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-6 rounded-xl shadow-lg z-50 max-w-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-bold">Payment Successful!</h3>
              <p className="text-sm">You now have unlimited access to all features!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="hero-section text-white py-20 px-6 rounded-3xl mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            Master English for
            <span className="block text-yellow-300">Truck Driving</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Professional English training designed specifically for truck drivers. 
            Practice conversations, learn DOT regulations, and communicate confidently on the road.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FeatureAccess 
              featureName="DOT Practice Training"
              targetPath="/qa-training"
              className="btn-primary text-lg px-8 py-4 cursor-pointer text-center"
            >
              🚔 Start DOT Practice {!user && '(Free Trial)'}
            </FeatureAccess>
            <Link
              to="/settings"
              className="glass-effect text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 cursor-pointer text-center"
            >
              ⚙️ Settings & Profile
            </Link>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-300/20 rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-full animate-pulse-slow delay-2000"></div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Everything You Need to <span className="gradient-text">Succeed</span>
        </h2>
        
        <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {/* Enhanced DOT Training Feature */}
          <FeatureAccess 
            featureName="DOT Practice Training"
            targetPath="/qa-training"
            className="card-feature group cursor-pointer"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🚔</div>
            <h3 className="text-3xl font-bold mb-4 text-gray-800">Enhanced DOT Practice Training</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Master English for truck driving with 200+ real DOT scenarios. Now featuring:
              pronunciation training, speed quizzes, offline mode, and multi-language support.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600 font-semibold text-sm">🎯 Pronunciation Trainer</div>
                <div className="text-xs text-gray-600">Record & compare your voice</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 font-semibold text-sm">⚡ Speed Quiz Mode</div>
                <div className="text-xs text-gray-600">Quick reaction training</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-purple-600 font-semibold text-sm">📱 Offline Mode</div>
                <div className="text-xs text-gray-600">Practice without internet</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-orange-600 font-semibold text-sm">🌍 Multi-Language</div>
                <div className="text-xs text-gray-600">Somali, Arabic, Spanish</div>
              </div>
            </div>
            
            {!user && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-lg mb-4 text-sm font-semibold border border-green-200">
                ✨ Sign up for FREE - Get 10 questions + all new features!
              </div>
            )}
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 text-lg">
              {user ? 'Continue Enhanced Training' : 'Get Free Access'}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </FeatureAccess>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 px-8 rounded-3xl text-center">
        <h2 className="text-3xl font-bold mb-12">Trusted by Truck Drivers Worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl font-bold mb-2">20,000+</div>
            <div className="text-blue-100">Active Users</div>
          </div>
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl font-bold mb-2">200+</div>
            <div className="text-blue-100">Practice Questions</div>
          </div>
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl font-bold mb-2">Multiple</div>
            <div className="text-blue-100">Languages</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-6 text-gray-800">
          Ready to Improve Your English?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of truck drivers who have improved their communication skills 
          and confidence on the road.
        </p>
        <FeatureAccess 
          featureName="DOT Practice Training"
          targetPath="/qa-training"
          className="btn-primary text-lg px-10 py-4 inline-flex items-center cursor-pointer"
        >
          {user ? 'Continue Learning' : 'Start Free Account'}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </FeatureAccess>
      </section>
    </div>
  )
}

export default Home