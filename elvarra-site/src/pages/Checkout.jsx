// ============================================================
// Checkout.jsx — Production checkout with Razorpay integration
// ============================================================
// 🔌 PAYMENT FLOW:
//   1. User fills shipping → clicks "Proceed to Payment"
//   2. apiCreateOrder() → backend creates Razorpay order → returns razorpayOrderId
//   3. openRazorpay() → opens Razorpay modal
//   4. On success → apiVerifyPayment() → backend verifies HMAC → marks order paid
//   5. clearCart() → show success screen with real order number
//
// 🔌 COUPON FLOW:
//   - apiValidateCoupon(code, total) → { valid, discount, type }
//   - Discount applied client-side for UX; backend re-validates on order creation
//
// 🔌 RAZORPAY SETUP (index.html):
//   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
//   .env: VITE_RAZORPAY_KEY_ID=rzp_live_xxxx
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiCreateOrder, apiVerifyPayment, apiValidateCoupon, openRazorpay } from '../services/api.js'
import './Checkout.css'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    payMethod: 'razorpay',
  })
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)   // { valid, discount, type, message }
  const [couponLoading, setCouponLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)   // { orderNumber } on success

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ─── Price calculations ───────────────────────────────────
  const shipping = total >= 999 ? 0 : 99
  const discountAmount = coupon?.valid
    ? coupon.type === 'percent'
      ? Math.round(total * coupon.discount / 100)
      : coupon.discount
    : 0
  const grand = total + shipping - discountAmount

  // ─── Form validation ──────────────────────────────────────
  const step1Valid = form.name && form.email && form.phone && form.address && form.city && form.pincode
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const phoneValid = /^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))
  const pincodeValid = /^\d{6}$/.test(form.pincode)

  // ─── Apply coupon ─────────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      // 🔌 Calls POST /coupons/validate → { valid, discount, type, message }
      const result = await apiValidateCoupon(couponCode.trim(), total)
      setCoupon(result)
    } catch (e) {
      setCoupon({ valid: false, message: 'Could not validate coupon.' })
    } finally {
      setCouponLoading(false)
    }
  }

  // ─── Place Order ──────────────────────────────────────────
  const placeOrder = async () => {
    setPayError('')
    setPayLoading(true)

    try {
      // Step 1: Create order on backend
      // 🔌 POST /orders → returns { order: { id, orderNumber, amount, razorpayOrderId } }
      const { order } = await apiCreateOrder({
        items: cart.map(i => ({
          productId: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
        })),
        shippingAddress: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        paymentMethod: form.payMethod,
        couponCode: coupon?.valid ? couponCode : undefined,
        amount: grand * 100, // paise for Razorpay
      })

      if (form.payMethod === 'cod') {
        // Cash on delivery — no payment gateway needed
        clearCart()
        setPlacedOrder(order)
        setPayLoading(false)
        return
      }

      // Step 2: Open Razorpay modal
      // 🔌 openRazorpay() is in services/api.js — see that file for full setup
      openRazorpay({
        orderId: order.razorpayOrderId,
        amount: grand * 100,           // paise
        name: form.name,
        email: form.email,
        phone: form.phone,
        description: `Elvarra Order ${order.orderNumber}`,
        onSuccess: async (razorpayResponse) => {
          try {
            // Step 3: Verify payment on backend
            // 🔌 POST /orders/verify-payment → backend checks HMAC signature
            await apiVerifyPayment(razorpayResponse)
            clearCart()
            setPlacedOrder(order)
          } catch (err) {
            setPayError(err.message || 'Payment verification failed.')
          } finally {
            setPayLoading(false)
          }
        },
        onFailure: (reason) => {
          setPayError(reason === 'Payment cancelled by user' ? 'Payment was cancelled.' : (reason || 'Payment failed. Please try again.'))
          setPayLoading(false)
        },
      })
    } catch (e) {
      setPayError(e.message || 'Something went wrong. Please try again.')
      setPayLoading(false)
    }
  }


  // ─── Empty cart guard ─────────────────────────────────────
  if (cart.length === 0 && !placedOrder) return (
    <div style={{ padding: '140px 24px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Nothing to checkout</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Add some products first.</p>
      <button className="btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
    </div>
  )

  // ─── Success screen ───────────────────────────────────────
  if (placedOrder) return (
    <div className="checkout-page">
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="order-success-icon">✓</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 32, margin: '20px 0 12px' }}>Order Placed!</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 10px', lineHeight: 1.7 }}>
          Thank you, <strong>{form.name}</strong>! Your order has been confirmed.
          A confirmation will be sent to <strong>{form.email}</strong>.
        </p>
        <div className="order-id">{placedOrder.orderNumber}</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, marginBottom: 32 }}>
          Estimated delivery: 5–7 business days
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          <button className="btn-outline" onClick={() => navigate('/orders')}>View Orders</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-layout">
          <div className="checkout-form">

            {/* ── STEP 1: Shipping ── */}
            <div className="checkout-section">
              <div className="section-heading" onClick={() => step > 1 && setStep(1)}>
                <div className={`section-num ${step > 1 ? 'done' : ''}`}>{step > 1 ? '✓' : '1'}</div>
                <h3>Shipping Information</h3>
              </div>

              {step === 1 && (
                <div className="section-body">
                  <div className="form-row-2">
                    <div className="fg">
                      <label>Full Name *</label>
                      <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" autoComplete="name" />
                    </div>
                    <div className="fg">
                      <label>Phone * <small style={{fontWeight:400,color:'var(--text-secondary)'}}>10-digit mobile</small></label>
                      <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="98765 43210" autoComplete="tel" maxLength={10} />
                      {form.phone && !phoneValid && <span className="field-err">Enter a valid 10-digit mobile number</span>}
                    </div>
                  </div>
                  <div className="fg">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                    {form.email && !emailValid && <span className="field-err">Enter a valid email address</span>}
                  </div>
                  <div className="fg">
                    <label>Full Address *</label>
                    <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="House no, Street, Area / Locality" autoComplete="street-address" />
                  </div>
                  <div className="form-row-3">
                    <div className="fg">
                      <label>City *</label>
                      <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" autoComplete="address-level2" />
                    </div>
                    <div className="fg">
                      <label>State</label>
                      <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" autoComplete="address-level1" />
                    </div>
                    <div className="fg">
                      <label>Pincode *</label>
                      <input value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="400001" autoComplete="postal-code" maxLength={6} />
                      {form.pincode && !pincodeValid && <span className="field-err">Enter a valid 6-digit pincode</span>}
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    disabled={!(step1Valid && emailValid && phoneValid && pincodeValid)}
                    onClick={() => setStep(2)}
                    style={{ marginTop: 8 }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {step > 1 && (
                <div className="section-summary">
                  <p><strong>{form.name}</strong> · {form.phone}</p>
                  <p>{form.address}, {form.city}{form.state ? `, ${form.state}` : ''} — {form.pincode}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{form.email}</p>
                  <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                </div>
              )}
            </div>

            {/* ── STEP 2: Payment ── */}
            {step >= 2 && (
              <div className="checkout-section">
                <div className="section-heading">
                  <div className="section-num">2</div>
                  <h3>Payment Method</h3>
                </div>
                <div className="section-body">
                  <div className="pay-options">
                    {[
                      { id: 'razorpay', label: 'Razorpay', sub: 'Cards, UPI, Net Banking, Wallets', icon: '💳' },
                      { id: 'upi', label: 'UPI Direct', sub: 'Google Pay, PhonePe, Paytm', icon: '📱' },
                      { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive (+₹50 COD fee)', icon: '💵' },
                    ].map(p => (
                      <label key={p.id} className={`pay-option ${form.payMethod === p.id ? 'active' : ''}`}>
                        <input type="radio" name="pay" value={p.id} checked={form.payMethod === p.id} onChange={() => set('payMethod', p.id)} />
                        <span className="pay-icon">{p.icon}</span>
                        <div>
                          <strong>{p.label}</strong>
                          <small>{p.sub}</small>
                        </div>
                      </label>
                    ))}
                  </div>

                  {form.payMethod === 'upi' && (
                    <div className="fg upi-field">
                      <label>UPI ID</label>
                      <input placeholder="yourname@paytm" autoComplete="off" />
                      {/* 🔌 Validate UPI ID format before submitting */}
                    </div>
                  )}

                  {payError && <div className="pay-error" role="alert">⚠ {payError}</div>}

                  <div className="secure-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Payments are 256-bit SSL encrypted via Razorpay
                  </div>

                  <button
                    className="btn-primary pay-btn"
                    onClick={placeOrder}
                    disabled={payLoading}
                  >
                    {payLoading
                      ? <><span className="btn-spinner"></span> Processing…</>
                      : form.payMethod === 'cod'
                        ? `Place Order · ₹${(grand + 50).toLocaleString()}`
                        : `Pay ₹${grand.toLocaleString()} →`
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order Summary Panel ── */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map(item => (
                <div className="summary-item" key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}>
                  <div className="summary-item-img">
                    <img src={item.image} alt={item.name} />
                    <span className="item-qty-badge">{item.qty}</span>
                  </div>
                  <div className="summary-item-info">
                    <p>{item.name}</p>
                    <small>{item.selectedSize} · <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background: item.selectedColor, border:'1px solid #ddd', verticalAlign:'middle' }}></span></small>
                  </div>
                  <span className="summary-item-price">₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="coupon-row">
              <input
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null) }}
                placeholder="Coupon code"
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              />
              <button className="btn-outline coupon-btn" onClick={applyCoupon} disabled={couponLoading}>
                {couponLoading ? '…' : 'Apply'}
              </button>
            </div>
            {coupon && (
              <p className={`coupon-msg ${coupon.valid ? 'valid' : 'invalid'}`}>
                {coupon.valid ? '✓ ' : '✗ '}{coupon.message}
              </p>
            )}

            <div className="summary-totals">
              <div className="sum-row"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              <div className="sum-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{color:'#27ae60',fontWeight:600}}>Free</span> : `₹${shipping}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="sum-row" style={{color:'#27ae60'}}>
                  <span>Discount ({coupon.discount}{coupon.type === 'percent' ? '%' : '₹'} off)</span>
                  <span>−₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {form.payMethod === 'cod' && (
                <div className="sum-row"><span>COD Fee</span><span>₹50</span></div>
              )}
              <div className="sum-divider"></div>
              <div className="sum-row sum-total">
                <span>Total</span>
                <span>₹{(grand + (form.payMethod === 'cod' ? 50 : 0)).toLocaleString()}</span>
              </div>
            </div>

            <div className="checkout-badges">
              <span>🔒 Secure Checkout</span>
              <span>📦 7-day Returns</span>
              <span>🚚 Pan India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
