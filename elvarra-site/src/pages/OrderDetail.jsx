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

        {/* ── PRINT-ONLY INVOICE HEADER ── */}
        <div className="print-invoice-header print-only">
          <div className="print-header-top">
            <div className="print-brand-left">
              <div className="print-brand-title-wrap">
                <img src="/logo.webp" alt="Elvarra Logo" className="print-brand-logo" />
                <div>
                  <span className="print-brand-name">ELVARRA</span>
                  <span className="print-brand-sub">Premium Custom Apparel</span>
                </div>
              </div>
              <p className="print-company-info">
                Elvarra Apparel India Private Limited<br />
                hello@elvarra.com · www.elvarra.com · +91 98765 43210
              </p>
            </div>

            <div className="print-invoice-meta">
              <h2 className="print-doc-title">TAX INVOICE / RECEIPT</h2>
              <div className="print-meta-grid">
                <div>
                  <span>Order Number:</span>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div>
                  <span>Order Date:</span>
                  <strong>{orderDate}</strong>
                </div>
                <div>
                  <span>Payment Mode:</span>
                  <strong style={{ textTransform: 'uppercase' }}>
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                  </strong>
                </div>
                <div>
                  <span>Payment Status:</span>
                  <span className={`print-status-stamp ${order.paymentStatus}`}>
                    {order.paymentStatus === 'paid' ? '✓ PAID' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="print-billing-grid">
            <div className="print-bill-box">
              <h4>Billed & Shipped To:</h4>
              <p className="print-name">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}
                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} — {order.shippingAddress?.pincode}
              </p>
              <p>Phone: {order.shippingAddress?.phone}</p>
              <p>Email: {order.shippingAddress?.email}</p>
            </div>
            <div className="print-bill-box seller-box">
              <h4>Sold & Dispatched By:</h4>
              <p><strong>Elvarra India Hub</strong></p>
              <p>Textile & Custom Print Park, Sector 4</p>
              <p>Mumbai, Maharashtra — 400069, India</p>
              <p>GSTIN: 27AABCE1234F1Z5</p>
              <p>Support: support@elvarra.com</p>
            </div>
          </div>
        </div>

        {/* Top Header (Web only) */}
        <div className="order-detail-header no-print">
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

        {/* Progress Tracker (Web only) */}
        {order.status !== 'cancelled' && (
          <div className="order-tracker-card no-print">
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
            <div className="order-items-card-header">
              <h3>Items in this Order</h3>
              <span className="items-count-badge">{order.items?.length || 0} product{order.items?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="order-items-list">
              {order.items?.map((item, idx) => (
                <div className="order-item-row-detailed" key={idx}>
                  <div className="order-item-img-wrap">
                    <img src={item.image || '/logo.webp'} alt={item.name} className="order-item-img" />
                    <span className="item-qty-badge">×{item.qty}</span>
                  </div>

                  <div className="order-item-main">
                    <h4>{item.name}</h4>
                    <div className="order-item-tags">
                      <span className="order-tag size-tag">
                        Size: <strong>{item.selectedSize || item.size}</strong>
                      </span>
                      {item.selectedColor && (
                        <span className="order-tag color-tag">
                          Color:
                          <span className="color-swatch-circle" style={{ background: item.selectedColor }} />
                          <strong>{item.selectedColor}</strong>
                        </span>
                      )}
                      <span className="order-tag unit-price-tag">
                        ₹{item.price.toLocaleString()} / pc
                      </span>
                    </div>
                  </div>

                  <div className="order-item-pricing-box">
                    <span className="item-subtotal-label">Item Total</span>
                    <span className="order-item-subtotal">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </span>
                    <small className="item-breakdown-text">({item.qty} × ₹{item.price.toLocaleString()})</small>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Right Column: Address + Payment Summary */}
          <div className="order-sidebar-col">
            {/* Delivery Address (Web only, in print it's in header) */}
            <div className="order-card-section no-print">
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
            <div className="order-card-section print-summary-section">
              <h3>Payment & Order Summary</h3>
              <div className="payment-method-row">
                <span>Payment Method:</span>
                <strong style={{ textTransform: 'uppercase' }}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                </strong>
              </div>
              <div className="payment-method-row">
                <span>Payment Status:</span>
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
                  <span>Total Amount</span>
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

        {/* ── PRINT-ONLY INVOICE FOOTER ── */}
        <div className="print-invoice-footer print-only">
          <div className="print-footer-notes">
            <p><strong>Customer Notes & Return Policy:</strong></p>
            <p>• Thank you for shopping with Elvarra! Returns or replacements are accepted within 7 days of delivery.</p>
            <p>• For any inquiries, please contact <strong>hello@elvarra.com</strong> mentioning your Order ID <strong>#{order.orderNumber}</strong>.</p>
            <p>• This is a computer-generated official tax invoice and requires no physical signature.</p>
          </div>
          <div className="print-auth-sig">
            <div className="sig-line"></div>
            <p><strong>Authorized Signatory</strong></p>
            <p className="sig-brand">Elvarra Apparel</p>
          </div>
        </div>
      </div>
    </div>
  )
}

