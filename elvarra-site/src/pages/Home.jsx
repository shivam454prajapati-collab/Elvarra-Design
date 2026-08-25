import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGetProducts } from '../services/api.js'
import ProductCard from '../components/ProductCard.jsx'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [productsList, setProductsList] = useState([])

  useEffect(() => {
    let active = true
    apiGetProducts().then(res => {
      if (active && res && res.products) {
        setProductsList(res.products)
      }
    }).catch(console.error)
    return () => { active = false }
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80" alt="Hero" />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <p className="section-label" style={{color:'var(--gold-light)'}}>Premium Custom Printing</p>
          <h1 className="hero-title">Wear Your<br /><span className="gold-text">Story.</span></h1>
          <p className="hero-sub">Hand-crafted t-shirts with precision printing. Choose from our collection or bring your own design — we'll make it perfect.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Shop Collection
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline hero-outline" onClick={() => navigate('/custom')}>
              Upload Your Design
            </button>
          </div>
          <div className="hero-stats">
            <div><strong>5000+</strong><span>Happy Customers</span></div>
            <div><strong>100%</strong><span>Premium Cotton</span></div>
            <div><strong>7 Days</strong><span>Delivery</span></div>
          </div>
        </div>
        <div className="hero-scroll">
          <span></span>
        </div>
      </section>

      {/* Features strip */}
      <section className="features-strip">
        <div className="container features-grid">
          {[
            { icon: '✦', label: 'Premium Fabric', sub: '100% BCI cotton' },
            { icon: '⬟', label: 'Custom Printing', sub: 'DTF, Screen & more' },
            { icon: '◈', label: 'Fast Delivery', sub: 'Pan India, 5 days' },
            { icon: '◉', label: 'Easy Returns', sub: '7-day hassle free' },
          ].map(f => (
            <div className="feature-item" key={f.label}>
              <span className="feature-icon">{f.icon}</span>
              <div>
                <strong>{f.label}</strong>
                <small>{f.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Our Collection</p>
              <h2 className="section-title">Bestselling Styles</h2>
              <div className="gold-divider"></div>
            </div>
            <Link to="/shop" className="btn-outline">View All</Link>
          </div>
          <div className="products-grid">
            {productsList.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Custom CTA Banner */}
      <section className="custom-banner">
        <div className="container custom-banner-inner">
          <div className="custom-banner-text">
            <p className="section-label" style={{color:'var(--gold-light)'}}>Your Vision</p>
            <h2 style={{fontFamily:'Playfair Display, serif',fontSize:'clamp(28px,4vw,44px)',color:'white',marginBottom:'16px'}}>
              Got a Design in Mind?
            </h2>
            <p style={{color:'rgba(255,255,255,0.7)',maxWidth:'420px',lineHeight:'1.7',marginBottom:'28px'}}>
              Upload your artwork and we'll print it with professional precision. Perfect for personal use, events, and brand merchandise.
            </p>
            <button className="btn-primary" onClick={() => navigate('/custom')}>
              Start Designing
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="custom-banner-img">
            <img src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80" alt="Custom printing" />
          </div>
        </div>
      </section>

      {/* More products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Fresh Drops</p>
              <h2 className="section-title">New Arrivals</h2>
              <div className="gold-divider"></div>
            </div>
          </div>
          <div className="products-grid">
            {productsList.slice(4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <p className="section-label" style={{textAlign:'center'}}>Customer Love</p>
          <h2 className="section-title" style={{textAlign:'center',marginBottom:'8px'}}>What People Say</h2>
          <div className="gold-divider" style={{margin:'0 auto 40px'}}></div>
          <div className="testimonials-grid">
            {[
              { name: 'Arjun S.', city: 'Mumbai', text: 'Ordered 20 custom tees for our startup. Quality was exceptional and delivery was right on time!', rating: 5 },
              { name: 'Priya M.', city: 'Bangalore', text: 'The fabric is so soft and the print is incredibly crisp. Best custom print service I\'ve used.', rating: 5 },
              { name: 'Rahul K.', city: 'Delhi', text: 'Elvarra delivered exactly what I envisioned. The color accuracy on my design was spot on.', rating: 5 },
            ].map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.city}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
