// ============================================================
// ProtectedRoute.jsx — Guards routes that require authentication
// ============================================================
// Usage in App.jsx:
//   <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
//
// Behaviour:
//   - While session is restoring (loading=true): show spinner
//   - If not logged in: redirect to /signin with return URL
//   - If logged in: render children
// ============================================================

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './ProtectedRoute.css'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner"></div>
        <p>Restoring session…</p>
      </div>
    )
  }

  if (!user) {
    // Redirect to sign in, preserving the intended destination
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }

  // 🔌 ADMIN GUARD — verify admin role
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

