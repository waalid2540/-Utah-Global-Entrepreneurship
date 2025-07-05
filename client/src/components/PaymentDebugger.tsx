import React, { useState } from 'react'

const PaymentDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const testPaymentFlow = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-checkpoint-app.onrender.com'
    
    const debugData = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      envApiUrl: import.meta.env.VITE_API_BASE_URL,
      finalApiUrl: API_BASE_URL,
      timestamp: new Date().toISOString()
    }
    
    console.log('🔍 Payment Debug Info:', debugData)
    setDebugInfo(debugData)
    
    // Test API connection
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`)
      const health = await response.json()
      setDebugInfo(prev => ({ ...prev, apiHealth: health, apiStatus: response.status }))
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, apiError: error.message }))
    }
  }

  // Only show on localhost or if there's a debug param
  const shouldShow = window.location.hostname === 'localhost' || 
                     new URLSearchParams(window.location.search).get('debug') === 'true'

  if (!shouldShow) return null

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-sm z-50">
      <h4 className="font-bold text-yellow-800 mb-2">🔍 Payment Debug</h4>
      <button 
        onClick={testPaymentFlow}
        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm mb-2"
      >
        Test Payment Flow
      </button>
      
      {debugInfo && (
        <div className="text-xs text-yellow-700 space-y-1">
          <div><strong>API URL:</strong> {debugInfo.finalApiUrl}</div>
          <div><strong>Current:</strong> {debugInfo.currentUrl}</div>
          {debugInfo.apiHealth && <div><strong>API:</strong> ✅ Connected</div>}
          {debugInfo.apiError && <div><strong>API:</strong> ❌ {debugInfo.apiError}</div>}
        </div>
      )}
    </div>
  )
}

export default PaymentDebugger