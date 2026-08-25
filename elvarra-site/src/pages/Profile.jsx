// ============================================================
// Profile.jsx — User profile editor (Protected Route)
// ============================================================
// 🔌 BACKEND: PUT /users/me  (Bearer token required)
//    Body: { name, phone, address }
//    Returns: { user }
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiUpdateProfile } from '../services/api.js'
import './Profile.css'

export default function Profile() {
  const { user, signOut, updateUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setError('')
    setSaved(false)
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      // 🔌 PUT /users/me → returns updated user object
      const { user: updated } = await apiUpdateProfile({
        name: form.name.trim(),
        phone: form.phone,
        address: form.address,
      })
      updateUser(updated)   // update AuthContext state
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar-big">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            <nav className="profile-nav">
              <a href="/orders" className="profile-nav-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                My Orders
              </a>
              <a href="/profile" className="profile-nav-item active">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </a>
              <button className="profile-nav-item signout" onClick={handleSignOut}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </nav>
          </div>

          {/* Form */}
          <div className="profile-content">
            <h2>Account Details</h2>
            <p className="profile-sub">Update your personal information below.</p>

            <div className="profile-form">
              <div className="form-row-2">
                <div className="fg">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
                </div>
                <div className="fg">
                  <label>Email <span className="readonly-badge">Read-only</span></label>
                  <input value={form.email} disabled style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }} />
                  {/* 🔌 Email change requires re-verification: separate POST /auth/change-email flow */}
                </div>
              </div>
              <div className="fg">
                <label>Phone Number</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit mobile number" />
              </div>
              <div className="fg">
                <label>Default Shipping Address</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={3}
                  placeholder="House no, Street, Area, City, Pincode" />
                {/* 🔌 This pre-fills the shipping form on Checkout */}
              </div>

              {error && <div className="profile-error">{error}</div>}
              {saved && <div className="profile-success">✓ Profile updated successfully!</div>}

              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="btn-spinner"></span> Saving…</> : 'Save Changes'}
              </button>
            </div>

            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <p>Permanently delete your account and all associated data.</p>
              {/* 🔌 DELETE /users/me → backend soft-deletes, sends confirmation email */}
              <button className="btn-danger" onClick={() => alert('Contact support to delete your account.')}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
