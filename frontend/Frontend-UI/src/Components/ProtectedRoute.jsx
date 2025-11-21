import React from 'react'
import { Navigate } from 'react-router-dom'
import { getValidToken } from '../utils/tokenUtils'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Supports multiple roles for cross-functional access
 */
function ProtectedRoute({ children, requiredRole = null, allowedRoles = null }) {
  const token = getValidToken()
  
  // No token = not authenticated
  if (!token) {
    console.warn('🔒 ProtectedRoute: No valid token found, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If specific role(s) are required, check them
  if (requiredRole || allowedRoles) {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (!user || !user.role) {
        console.warn('🔒 ProtectedRoute: No user role found')
        return <Navigate to="/login" replace />
      }

      // Check single required role (legacy support)
      if (requiredRole && !allowedRoles) {
        if (user.role !== requiredRole) {
          console.warn(`🔒 ProtectedRoute: User role "${user.role}" does not match required role "${requiredRole}"`)
          return <Navigate to="/login" replace />
        }
      }

      // Check multiple allowed roles (new functionality)
      if (allowedRoles) {
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
        if (!rolesArray.includes(user.role)) {
          console.warn(`🔒 ProtectedRoute: User role "${user.role}" not in allowed roles: [${rolesArray.join(', ')}]`)
          return <Navigate to="/login" replace />
        }
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
