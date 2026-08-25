// ============================================================
// Contact.jsx — Contact form with real API submission
// ============================================================
// 🔌 BACKEND: POST /contact
//    Body: { name, email, subject, message }
//    Returns: { message: 'Sent' }
//    Backend: send email via Nodemailer / SendGrid / Resend
// ============================================================

import React, { useState } from 'react'
import { apiSendContact } from '../services/api.js'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.'
    if (!form.message.trim() || form.message.trim().length < 10) return 'Message must be at least 10 characters.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setSending(true)
    try {
      // 🔌 POST /contact → backend sends email notification
      await apiSendContact({
        name: form.name.trim(),
        email: form.email.toLowerCase(),
        subject: form.subject.trim() || 'General Enquiry',
        message: form.message.trim(),
      })
      setSent(true)
    } catch (e) {
      setError(e.message || 'Failed to send. Please try again or email us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <p className="section-label">Get in Touch</p>
          <h1 className="section-title">We'd Love to Hear From You</h1>
          <div className="gold-divider"></div>
        </div>
      </div>

      <div className="container contact-body">
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="info-items">
              {[
                { icon: '📧', label: 'Email', value: 'hello@elvarra.com', href: 'mailto:hello@elvarra.com' },
                { icon: '📞', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: '📍', label: 'Address', value: 'Mumbai, Maharashtra, India' },
                { icon: '⏰', label: 'Working Hours', value: 'Mon–Sat, 10am–7pm IST' },
              ].map(i => (
                <div className="info-item" key={i.label}>
                  <span className="info-icon">{i.icon}</span>
                  <div>
                    <small>{i.label}</small>
                    {i.href
                      ? <a href={i.href} className="info-link"><strong>{i.value}</strong></a>
                      : <strong>{i.value}</strong>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="faq-quick">
              <h4>Quick Answers</h4>
              {[
                { q: 'How long does shipping take?', a: '5–7 business days pan India.' },
                { q: 'What file formats for custom prints?', a: 'PNG, JPG, SVG, PDF (min 300 DPI recommended).' },
                { q: 'Minimum order for custom printing?', a: 'Just 1 piece — no minimums!' },
                { q: 'Can I return a custom printed item?', a: 'We accept returns only for manufacturing defects.' },
              ].map(f => (
                <div className="faq-item" key={f.q}>
                  <strong>{f.q}</strong>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-wrap">
            {sent ? (
              <div className="sent-success">
                <div className="sent-icon">✓</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn-outline" onClick={() => { setSent(false); setForm({ name:'',email:'',subject:'',message:'' }) }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3>Send a Message</h3>
                <div className="contact-form">
                  <div className="form-row-2">
                    <div className="fg"><label>Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" /></div>
                    <div className="fg"><label>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></div>
                  </div>
                  <div className="fg"><label>Subject</label><input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Order issue, Custom print query, etc." /></div>
                  <div className="fg"><label>Message * <small style={{fontWeight:400,color:'var(--text-secondary)'}}>min 10 characters</small></label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={5} placeholder="Tell us how we can help…" />
                  </div>

                  {error && <div className="contact-error" role="alert">{error}</div>}

                  <button className="btn-primary" onClick={handleSubmit} disabled={sending || !form.name || !form.email || !form.message}>
                    {sending ? <><span className="btn-spinner"></span> Sending…</> : 'Send Message →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
