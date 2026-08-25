// ============================================================
// SignIn.jsx — Production auth page (Sign In + Register)
// ============================================================
// 🔌 WHAT'S WIRED:
//   - signIn()   → POST /auth/login   (see AuthContext + api.js)
//   - signUp()   → POST /auth/register
//   - signInWithGoogle() → POST /auth/google  (needs Google SDK setup)
//   - After login, redirects to the page the user was trying to visit
//   - Form validation with real error display
//   - Loading states on submit button
//
// 🔌 TO ENABLE GOOGLE SIGN-IN:
//   1. Add to index.html <head>:
//      <script src="https://accounts.google.com/gsi/client" async defer></script>
//   2. Set VITE_GOOGLE_CLIENT_ID=your_client_id in .env
//   3. Uncomment the Google button handler below
// ============================================================

import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiForgotPassword } from '../services/api.js'
import './Auth.css'

export default function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const returnTo = location.state?.from || '/'

  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ─── Client-side validation ───────────────────────────────
  const validate = () => {
    if (!form.email) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.'
    if (!form.password) return 'Password is required.'
    if (mode === 'signup') {
      if (!form.name.trim()) return 'Full name is required.'
      if (form.password.length < 8) return 'Password must be at least 8 characters.'
      if (!/(?=.*[0-9])/.test(form.password)) return 'Password must contain at least one number.'
      if (form.password !== form.confirm) return 'Passwords do not match.'
    }
    return null
  }

  // ─── Submit handler ───────────────────────────────────────
  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        // 🔌 Calls POST /auth/register → sets JWT in localStorage
        await signUp(form.name.trim(), form.email.toLowerCase(), form.password)
      } else {
        // 🔌 Calls POST /auth/login → sets JWT in localStorage
        await signIn(form.email.toLowerCase(), form.password)
      }
      navigate(returnTo, { replace: true })
    } catch (e) {
      // 🔌 Backend should return { message: 'Invalid credentials' } on 401
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Google Auth handler ──────────────────────────────────
  const handleGoogleClick = async () => {
    // 🔌 REAL IMPLEMENTATION:
    // setGoogleLoading(true)
    // try {
    //   // Trigger Google One Tap or popup
    //   window.google.accounts.id.initialize({
    //     client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    //     callback: async ({ credential }) => {
    //       await signInWithGoogle(credential)
    //       navigate(returnTo, { replace: true })
    //       setGoogleLoading(false)
    //     }
    //   })
    //   window.google.accounts.id.prompt()
    // } catch (e) {
    //   setError('Google sign-in failed. Please try again.')
    //   setGoogleLoading(false)
    // }

    // MOCK — remove after setting up Google OAuth
    setGoogleLoading(true)
    try {
      await signIn('demo@elvarra.com', 'demo123')
      navigate(returnTo, { replace: true })
    } finally {
      setGoogleLoading(false)
    }
  }

  // ─── Forgot password ──────────────────────────────────────
  const handleForgot = async () => {
    if (!form.email) { setError('Enter your email address first.'); return }
    setLoading(true)
    try {
      // 🔌 Calls POST /auth/forgot-password → sends reset email
      await apiForgotPassword(form.email)
      setForgotSent(true)
      setError('')
    } catch (e) {
      setError(e.message || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Keyboard submit ─────────────────────────────────────
  const onKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  if (forgotSent) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><img src="/logo.webp" alt="Elvarra" /><span>ELVARRA</span></div>
        <div className="forgot-sent">
          <div className="sent-circle">✉</div>
          <h3>Check your inbox</h3>
          <p>We've sent a password reset link to <strong>{form.email}</strong>.</p>
          <button className="btn-primary auth-btn" onClick={() => { setForgotMode(false); setForgotSent(false) }}>
            Back to Sign In
          </button>
        </div>
      </div>
      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80" alt="Fashion" />
        <div className="auth-visual-overlay"><blockquote>"Wear your story with pride."</blockquote><p>— Elvarra</p></div>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/logo.webp" alt="Elvarra" />
          <span>ELVARRA</span>
        </Link>

        {!forgotMode ? (
          <>
            <div className="auth-tabs">
              <button className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError('') }}>Sign In</button>
              <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError('') }}>Create Account</button>
            </div>

            <div className="auth-form">
              {mode === 'signup' && (
                <div className="fg">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" onKeyDown={onKeyDown} autoComplete="name" />
                </div>
              )}
              <div className="fg">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" onKeyDown={onKeyDown} autoComplete="email" />
              </div>
              <div className="fg">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={mode === 'signup' ? 'Min 8 chars, include a number' : '••••••••'} onKeyDown={onKeyDown} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              </div>
              {mode === 'signup' && (
                <div className="fg">
                  <label>Confirm Password</label>
                  <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Re-enter password" onKeyDown={onKeyDown} autoComplete="new-password" />
                </div>
              )}

              {error && <div className="auth-error" role="alert">{error}</div>}

              {mode === 'signin' && (
                <div style={{ textAlign: 'right', marginTop: -8 }}>
                  <button style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'underline' }} onClick={() => { setForgotMode(true); setError('') }}>
                    Forgot password?
                  </button>
                </div>
              )}

              <button className="btn-primary auth-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>

              <div className="auth-divider"><span>or continue with</span></div>

              <button className="google-btn" onClick={handleGoogleClick} disabled={googleLoading}>
                {googleLoading ? <span className="btn-spinner dark"></span> : (
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                {googleLoading ? 'Signing in…' : 'Continue with Google'}
              </button>
            </div>
          </>
        ) : (
          <div className="forgot-form">
            <h3>Reset Password</h3>
            <p>Enter your account email and we'll send a reset link.</p>
            <div className="fg" style={{ marginTop: 20 }}>
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handleForgot()} />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div className="forgot-actions">
              <button className="btn-outline" onClick={() => { setForgotMode(false); setError('') }}>← Back</button>
              <button className="btn-primary" onClick={handleForgot} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Send Reset Link'}
              </button>
            </div>
          </div>
        )}

        <p className="auth-footer">
          By continuing, you agree to Elvarra's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>

      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80" alt="Fashion" />
        <div className="auth-visual-overlay">
          <blockquote>"Wear your story with pride."</blockquote>
          <p>— Elvarra</p>
        </div>
      </div>
    </div>
  )
}
