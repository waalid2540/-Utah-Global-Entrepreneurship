import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If route requires auth but user is not logged in
  if (requireAuth && !user) {
    return <Navigate 
      to="/login" 
      state={{ from: location.pathname }} 
      replace 
    />
  }

  // Render the protected content
  return <>{children}</>
}

export default RouteGuard