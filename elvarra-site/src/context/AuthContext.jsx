// ============================================================
// AuthContext.jsx — Production-ready auth with JWT persistence
// ============================================================
// What this handles:
//   ✅ JWT stored in localStorage (survives page refresh)
//   ✅ Session restored on app boot via GET /auth/me
//   ✅ Loading state so app doesn't flash login screen
//   ✅ Automatic token injection (done in api.js request())
//   ✅ Auto logout on 401 (handled in api.js request())
//
// 🔌 BACKEND REQUIREMENTS:
//   POST /auth/register  → { user, token }
//   POST /auth/login     → { user, token }
//   GET  /auth/me        → { user }           (Bearer token required)
//   POST /auth/google    → { user, token }
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiLogin, apiRegister, apiGetMe, apiGoogleAuth, getToken, setToken, removeToken } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ─── Restore session on app boot ──────────────────────────
  // 🔌 Calls GET /auth/me with token from localStorage.
  //    Backend verifies JWT, returns fresh user object.
  //    If 401 → api.js removes token automatically.
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken()
      if (!token) { setLoading(false); return }
      try {
        const data = await apiGetMe()
        if (data?.user) setUser(data.user)
        else removeToken()
      } catch {
        removeToken()
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  // ─── Sign In ───────────────────────────────────────────────
  // 🔌 POST /auth/login → { user, token }
  const signIn = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  // ─── Sign Up ───────────────────────────────────────────────
  // 🔌 POST /auth/register → { user, token }
  const signUp = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  // ─── Google Auth ───────────────────────────────────────────
  // 🔌 SETUP: Add Google Identity SDK to index.html, get credential token,
  //    pass to this function → POST /auth/google → { user, token }
  const signInWithGoogle = useCallback(async (googleToken) => {
    const data = await apiGoogleAuth(googleToken)
    if (!data) throw new Error('Google auth not configured yet')
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  // ─── Sign Out ──────────────────────────────────────────────
  const signOut = useCallback(() => {
    removeToken()
    setUser(null)
    // 🔌 Optional: POST /auth/logout to invalidate refresh token on server
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
