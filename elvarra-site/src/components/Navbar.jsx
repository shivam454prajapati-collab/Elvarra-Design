import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const { count } = useCart()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleSignOut = () => {
    signOut()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner container">
        <Link to="/" className="nav-logo">
          <img src="/logo.webp" alt="Elvarra" />
          <span>ELVARRA</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link></li>
          <li><Link to="/custom" className={location.pathname === '/custom' ? 'active' : ''}>Custom Print</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
        </ul>

        <div className="nav-actions">
          <button className="nav-icon-btn" onClick={() => navigate('/cart')} aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>

          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="nav-user-btn"
                type="button"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <span className="avatar">{user.name[0].toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown" role="menu">
                  {user.role === 'admin' && (
                    <Link to="/admin" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      👑 Admin Panel
                    </Link>
                  )}
                  <Link to="/orders">My Orders</Link>
                  <Link to="/profile">Profile</Link>
                  <button onClick={handleSignOut} type="button">Sign Out</button>
                </div>
              )}

            </div>
          ) : (
            <Link to="/signin" className="btn-primary nav-signin">Sign In</Link>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? 'x' : ''}></span>
            <span className={menuOpen ? 'x' : ''}></span>
            <span className={menuOpen ? 'x' : ''}></span>
          </button>
        </div>
      </div>
    </nav>
  )
}
