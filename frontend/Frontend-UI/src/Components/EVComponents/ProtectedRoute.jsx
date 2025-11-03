import React from 'react'
import { Navigate } from 'react-router-dom'
import { getValidToken } from '../../utils/tokenUtils'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const token = getValidToken()
  
  // No token = not authenticated
  if (!token) {
    console.warn('🔒 ProtectedRoute: No valid token found, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If a specific role is required, check it
  if (requiredRole) {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (!user || user.role !== requiredRole) {
        console.warn(`🔒 ProtectedRoute: User role "${user?.role}" does not match required role "${requiredRole}"`)
        return <Navigate to="/login" replace />
      }
    } catch (error) {
      console.error('❌ ProtectedRoute: Error checking user role:', error)
      return <Navigate to="/login" replace />
    }
  }

  // All checks passed, render the protected component
  return children
}

export default ProtectedRoute