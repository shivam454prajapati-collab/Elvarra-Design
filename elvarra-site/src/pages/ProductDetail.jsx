import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGetProduct, apiGetProducts } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    apiGetProduct(id).then(res => {
      if (active && res && res.product) {
        setProduct(res.product)
        setSelectedColor(res.product.colors[0] || '')
        setSelectedSize('')
        setQty(1)
        setSizeError(false)

        // Load related products
        apiGetProducts({ limit: 100 }).then(pRes => {
          if (active && pRes && pRes.products) {
            setRelated(pRes.products.filter(p => p.id !== res.product.id).slice(0, 4))
          }
        })
      }
      if (active) setLoading(false)
    }).catch(err => {
      console.error(err)
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [id])

  if (loading) return (
    <div style={{ padding: '160px 24px', textAlign: 'center' }}>
      <h2>Loading Product Details...</h2>
    </div>
  )

  if (!product) return (
    <div style={{ padding: '160px 24px', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: 20 }}>Back to Shop</button>
    </div>
  )

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return }
    setSizeError(false)
    addToCart({ ...product, selectedColor, selectedSize, qty })
    navigate('/cart')
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')}>Shop</button>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="detail-grid">
          {/* Image */}
          <div className="detail-image">
            <img src={product.image} alt={product.name} />
            {product.badge && <span className="product-badge">{product.badge}</span>}
          </div>

          {/* Info */}
          <div className="detail-info">
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-price">₹{product.price.toLocaleString()}</p>
            <div className="gold-divider" style={{ marginBottom: 20 }}></div>
            <p className="detail-desc">{product.description}</p>

            {/* Color */}
            <div className="option-group">
              <label>Color <span className="selected-label">{selectedColor}</span></label>
              <div className="color-options">
                {product.colors.map(c => (
                  <button
                    key={c}
                    className={`color-swatch ${selectedColor === c ? 'active' : ''}`}
                    style={{ background: c, border: c === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                    onClick={() => setSelectedColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="option-group">
              <label>Size {selectedSize && <span className="selected-label">— {selectedSize}</span>}</label>
              <div className="size-options">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => { setSelectedSize(s); setSizeError(false) }}
                  >{s}</button>
                ))}
              </div>
              {sizeError && <p className="size-error">Please select a size to continue.</p>}
            </div>

            {/* Qty */}
            <div className="option-group">
              <label>Quantity</label>
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAddToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Add to Cart
              </button>
              <button className="btn-dark" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { if (!selectedSize) { setSizeError(true); return } navigate('/checkout') }}>
                Buy Now
              </button>
            </div>

            {/* Info pills */}
            <div className="info-pills">
              <span>✓ Free shipping above ₹999</span>
              <span>✓ 7-day easy returns</span>
              <span>✓ Premium quality</span>
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="related-section">
          <p className="section-label">You May Also Like</p>
          <h2 className="section-title">Related Products</h2>
          <div className="gold-divider"></div>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
