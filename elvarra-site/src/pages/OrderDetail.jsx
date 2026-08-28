import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiGetOrder } from '../services/api.js'
import './OrderDetail.css'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'printing', label: 'Printing & Quality Check' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const STATUS_MAP = {
  pending: { label: 'Pending Payment', color: '#f39c12' },
  confirmed: { label: 'Order Confirmed', color: '#3498db' },
  printing: { label: 'Printing & Tailoring', color: '#9b59b6' },
  shipped: { label: 'Out for Delivery', color: '#2ecc71' },
  delivered: { label: 'Delivered', color: '#27ae60' },
  cancelled: { label: 'Cancelled', color: '#e74c3c' },
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    apiGetOrder(id)
      .then((res) => {
        if (active && res && res.order) {
          setOrder(res.order)
        } else if (active) {
          setError('Order details not found.')
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load order details.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-detail-loading">
            <div className="order-detail-spinner"></div>
            <h2>Loading order details...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="order-detail-error-icon">⚠️</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {error || "We couldn't retrieve the details for this order."}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/orders')}>
              Back to My Orders
            </button>
            <button className="btn-outline" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Calculate current step index
  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const currentStep = stepIndex >= 0 ? stepIndex : 0

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="order-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/orders">My Orders</Link>
          <span>/</span>
          <span className="current">{order.orderNumber}</span>
        </nav>

        {/* Top Header */}
        <div className="order-detail-header">
          <div>
            <div className="order-number-title">
              <h1>Order #{order.orderNumber}</h1>
              <span
                className="order-detail-badge"
                style={{ color: statusInfo.color, background: statusInfo.color + '18', borderColor: statusInfo.color + '40' }}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="order-placed-time">Placed on {orderDate}</p>
          </div>

          <div className="order-header-actions">
            <button className="btn-outline no-print" onClick={() => window.print()}>
              🖨️ Print Invoice
            </button>
            <button className="btn-primary no-print" onClick={() => navigate('/shop')}>
              Shop Again
            </button>
          </div>
        </div>

        {/* Progress Tracker (only if not cancelled) */}
        {order.status !== 'cancelled' && (
          <div className="order-tracker-card">
            <div className="tracker-steps">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep
                const isCurrent = idx === currentStep
                return (
                  <div key={step.key} className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="tracker-dot">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className="tracker-label">{step.label}</span>
                  </div>
                )
              })}
            </div>
            {order.trackingNumber && (
              <div className="tracking-number-banner">
                <span>📦 Courier Tracking Number:</span>
                <strong>{order.trackingNumber}</strong>
              </div>
            )}
          </div>
        )}

        {/* Main Grid: Left Items + Right Summary */}
        <div className="order-detail-grid">
          {/* Left Column: Items */}
          <div className="order-items-card">
            <h3>Items in this Order ({order.items?.length || 0})</h3>
            <div className="order-items-list">
              {order.items?.map((item, idx) => (
                <div className="order-item-row-detailed" key={idx}>
                  <img src={item.image || '/logo.webp'} alt={item.name} className="order-item-img" />
                  <div className="order-item-main">
                    <h4>{item.name}</h4>
                    <div className="order-item-specs">
                      <span>Size: <strong>{item.selectedSize || item.size}</strong></span>
                      {item.selectedColor && (
                        <span className="order-color-pill">
                          Color:
                          <span className="color-swatch-circle" style={{ background: item.selectedColor }} />
                          <small>{item.selectedColor}</small>
                        </span>
                      )}
                    </div>
                    <div className="order-item-pricing">
                      <span>₹{item.price.toLocaleString()} × {item.qty}</span>
                    </div>
                  </div>
                  <div className="order-item-subtotal">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Address + Payment Summary */}
          <div className="order-sidebar-col">
            {/* Delivery Address */}
            <div className="order-card-section">
              <h3>Delivery Address</h3>
              <div className="address-content">
                <p className="recipient-name"><strong>{order.shippingAddress?.name}</strong></p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}
                  {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} — {order.shippingAddress?.pincode}
                </p>
                <p className="contact-line">📞 {order.shippingAddress?.phone}</p>
                <p className="contact-line">✉️ {order.shippingAddress?.email}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="order-card-section">
              <h3>Payment Details</h3>
              <div className="payment-method-row">
                <span>Method:</span>
                <strong style={{ textTransform: 'uppercase' }}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                </strong>
              </div>
              <div className="payment-method-row">
                <span>Status:</span>
                <span className={`payment-status-tag ${order.paymentStatus}`}>
                  {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
                </span>
              </div>

              <div className="order-cost-breakdown">
                <div className="cost-row">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString() || order.total?.toLocaleString()}</span>
                </div>
                <div className="cost-row">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? <strong style={{ color: '#27ae60' }}>FREE</strong> : `₹${order.shipping}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="cost-row discount">
                    <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    <span>−₹{order.discount}</span>
                  </div>
                )}
                {order.codFee > 0 && (
                  <div className="cost-row">
                    <span>COD Fee</span>
                    <span>₹{order.codFee}</span>
                  </div>
                )}
                <div className="cost-divider"></div>
                <div className="cost-row grand-total">
                  <span>Total Paid</span>
                  <span>₹{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="order-help-box no-print">
              <p>Need assistance with this order?</p>
              <button className="btn-outline" onClick={() => navigate('/contact')} style={{ width: '100%', fontSize: '13px' }}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
