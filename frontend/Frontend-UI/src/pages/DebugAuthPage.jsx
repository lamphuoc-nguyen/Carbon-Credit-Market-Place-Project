import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getValidToken, decodeJWTPayload } from '../utils/tokenUtils'

/**
 * Debug Page - Shows authentication status and token information
 */
function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getValidToken()
    const localToken = localStorage.getItem('authToken')
    const sessionToken = sessionStorage.getItem('authToken')
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    
    let user = null
    let decodedToken = null
    
    if (token) {
      decodedToken = decodeJWTPayload(token)
    }
    
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (e) {
        console.error('Failed to parse user:', e)
      }
    }

    setAuthInfo({
      hasValidToken: !!token,
      hasLocalToken: !!localToken,
      hasSessionToken: !!sessionToken,
      tokenPreview: token ? token.substring(0, 500)  : 'None',
      decodedToken,
      user,
      localStorage: {
        authToken: localToken ? 'Present' : 'Missing',
        user: localStorage.getItem('user') ? 'Present' : 'Missing',
      },
      sessionStorage: {
        authToken: sessionToken ? 'Present' : 'Missing',
        user: sessionStorage.getItem('user') ? 'Present' : 'Missing',
      }
    })
  }, [])

  const handleClearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    alert('Storage cleared!')
    window.location.reload()
  }

  if (!authInfo) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Token Status</h2>
          <div className="space-y-2">
            <p className={`flex items-center gap-2 ${authInfo.hasValidToken ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-semibold">Has Valid Token:</span> 
              {authInfo.hasValidToken ? '✅ Yes' : '❌ No'}
            </p>
            <p>
              <span className="font-semibold">Token Preview:</span> 
              <code className="text-xs bg-gray-100 p-1 rounded ml-2">{authInfo.tokenPreview}</code>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Decoded Token</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(authInfo.decodedToken, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">User Object</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(authInfo.user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Storage Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">localStorage</h3>
              <p>authToken: {authInfo.localStorage.authToken}</p>
              <p>user: {authInfo.localStorage.user}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">sessionStorage</h3>
              <p>authToken: {authInfo.sessionStorage.authToken}</p>
              <p>user: {authInfo.sessionStorage.user}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
          
          {authInfo.hasValidToken && authInfo.user?.role === 'EV_OWNER' && (
            <button
              onClick={() => navigate('/ev-dashboard')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to EV Dashboard
            </button>
          )}

          <button
            onClick={handleClearStorage}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Storage
          </button>
        </div>
      </div>
    </div>
  )
}

export default DebugAuthPage
