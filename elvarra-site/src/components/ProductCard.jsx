import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [hovering, setHovering] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart({ ...product, selectedColor, selectedSize: product.sizes[2] || product.sizes[0] })
  }

  return (
    <div
      className={`product-card ${hovering ? 'hovered' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <div className="product-overlay">
          <button className="btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-colors">
          {product.colors.map(c => (
            <button
              key={c}
              className={`color-dot ${selectedColor === c ? 'active' : ''}`}
              style={{ background: c, border: c === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
              onClick={e => { e.stopPropagation(); setSelectedColor(c) }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price.toLocaleString()}</p>
      </div>
    </div>
  )
}
