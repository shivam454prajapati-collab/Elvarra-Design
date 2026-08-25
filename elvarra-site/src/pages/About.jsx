import React from 'react'
import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <p className="section-label">Our Story</p>
          <h1 className="section-title">Crafted with Purpose</h1>
          <div className="gold-divider"></div>
          <p>Born from a passion for quality fashion and personal expression, Elvarra brings premium custom printed t-shirts to every doorstep in India.</p>
        </div>
      </div>

      <div className="container about-body">
        <div className="about-grid">
          <div className="about-img">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80" alt="About Elvarra" />
          </div>
          <div className="about-text">
            <p className="section-label">Who We Are</p>
            <h2 className="section-title">Premium Printing,<br />Personal Touch</h2>
            <div className="gold-divider"></div>
            <p>Elvarra was founded with a single mission: to make premium custom t-shirts accessible to everyone. We combine the finest cotton fabrics with state-of-the-art printing technology to deliver garments that look great and feel even better.</p>
            <p style={{ marginTop: 16 }}>Whether you're ordering a single custom piece or bulk merchandise for your brand, every order receives the same level of care and craftsmanship.</p>
            <div className="about-stats">
              <div><strong>5000+</strong><span>Happy Customers</span></div>
              <div><strong>3</strong><span>Print Technologies</span></div>
              <div><strong>Pan India</strong><span>Delivery</span></div>
            </div>
          </div>
        </div>

        <div className="values-section">
          <p className="section-label" style={{textAlign:'center'}}>Our Values</p>
          <h2 className="section-title" style={{textAlign:'center',marginBottom:8}}>What Drives Us</h2>
          <div className="gold-divider" style={{margin:'0 auto 48px'}}></div>
          <div className="values-grid">
            {[
              { icon: '◈', title: 'Quality First', desc: 'We source only the finest BCI cotton and use premium inks that stay vibrant wash after wash.' },
              { icon: '✦', title: 'Your Vision', desc: 'Your design deserves the best canvas. We work with you to ensure every detail is perfect.' },
              { icon: '⬟', title: 'Sustainability', desc: 'We\'re committed to eco-friendly practices and responsible sourcing across our supply chain.' },
              { icon: '◉', title: 'Community', desc: 'Supporting local artists, designers, and small businesses is at the heart of what we do.' },
            ].map(v => (
              <div className="value-card" key={v.title}>
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
