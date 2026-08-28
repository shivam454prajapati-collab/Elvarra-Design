import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiSubscribe } from '../services/api.js'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubscribe = async () => {
    setError('')
    setStatus('')
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.')
      return
    }

    setSending(true)
    try {
      const response = await apiSubscribe(trimmed)
      setStatus(response.message || 'Subscribed successfully!')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Subscription failed. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.webp" alt="Elvarra" />
              <span>ELVARRA</span>
            </div>
            <p>Premium custom printed t-shirts crafted with care. Your design, our quality.</p>
            <div className="socials">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?cat=tees">T-Shirts</Link></li>
              <li><Link to="/shop?cat=polo">Polo Shirts</Link></li>
              <li><Link to="/custom">Custom Print</Link></li>
              <li><Link to="/shop?cat=new">New Arrivals</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns & Refunds</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Stay Updated</h4>
            <p style={{fontSize:'13px',color:'#888',marginBottom:'14px'}}>Get exclusive offers and updates.</p>
            <div className="newsletter">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                disabled={sending}
              />
              <button
                className="btn-primary"
                style={{ padding: '12px 18px', fontSize: '13px' }}
                type="button"
                onClick={handleSubscribe}
                disabled={sending}
              >
                →
              </button>
            </div>
            {(status || error) && (
              <p className={`newsletter-message ${error ? 'error' : 'success'}`}>
                {error || status}
              </p>
            )}
            <div className="payment-icons">
              <span>We accept:</span>
              <div className="payment-badges">
                <div className="pay-badge">Razorpay</div>
                <div className="pay-badge">UPI</div>
                <div className="pay-badge">Cards</div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Elvarra. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>

  )
}
