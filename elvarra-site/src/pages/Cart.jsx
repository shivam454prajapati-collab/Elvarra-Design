import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import './Cart.css'

export default function Cart() {
  const { cart, removeFromCart, updateQty, total } = useCart()
  const navigate = useNavigate()

  if (cart.length === 0) return (
    <div className="cart-empty">
      <div className="container" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: 24 }}>Browse Products</button>
      </div>
    </div>
  )

  const shipping = total >= 999 ? 0 : 99
  const grandTotal = total + shipping

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Your Cart <span>({cart.length} item{cart.length !== 1 ? 's' : ''})</span></h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.map(item => (
              <div className="cart-item" key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}>
                <div className="cart-item-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <div className="cart-item-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      Color: <span style={{ width: 14, height: 14, borderRadius: '50%', background: item.selectedColor, display: 'inline-block', border: '1px solid #ddd' }}></span>
                    </span>
                    <span>Size: <strong>{item.selectedSize}</strong></span>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="qty-mini">
                      <button onClick={() => updateQty(item.id, item.selectedColor, item.selectedSize, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.selectedColor, item.selectedSize, item.qty + 1)}>+</button>
                    </div>
                    <p className="cart-item-price">₹{(item.price * item.qty).toLocaleString()}</p>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: 'green', fontWeight: 600 }}>Free</span> : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="free-shipping-hint">Add ₹{(999 - total).toLocaleString()} more for free shipping</p>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="coupon-row">
              <input type="text" placeholder="Enter coupon code" />
              <button className="btn-outline" style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontSize: '13px' }}>Apply</button>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }}
              onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
            <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
              onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>

            <div className="secure-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Secure 256-bit SSL checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
