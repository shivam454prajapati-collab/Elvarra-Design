// ============================================================
// Orders.jsx — User's order history (Protected Route)
// ============================================================
// 🔌 BACKEND: GET /orders  (Bearer token required)
//    Returns: { orders: [{ id, orderNumber, status, items, total, createdAt }] }
// ============================================================

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetOrders } from '../services/api.js'
import './Orders.css'

const STATUS_MAP = {
  pending:    { label: 'Pending',     color: '#f39c12' },
  confirmed:  { label: 'Confirmed',   color: '#3498db' },
  printing:   { label: 'Printing',    color: '#9b59b6' },
  shipped:    { label: 'Shipped',     color: '#2ecc71' },
  delivered:  { label: 'Delivered',   color: '#27ae60' },
  cancelled:  { label: 'Cancelled',   color: '#e74c3c' },
}

// Mock orders for UI while backend isn't live
const MOCK_ORDERS = [
  {
    id: 'ord_001', orderNumber: 'ELV-482910', status: 'delivered',
    total: 1598, createdAt: new Date(Date.now() - 8 * 24*60*60*1000).toISOString(),
    items: [{ name: 'Classic Crew Tee', qty: 2, size: 'L', price: 699, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=60' }],
  },
  {
    id: 'ord_002', orderNumber: 'ELV-391827', status: 'shipped',
    total: 899, createdAt: new Date(Date.now() - 2 * 24*60*60*1000).toISOString(),
    items: [{ name: 'Oversized Drop Shoulder', qty: 1, size: 'M', price: 899, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=100&q=60' }],
  },
]

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiGetOrders()
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders)
        } else {
          setOrders([])
        }
      } catch (e) {
        console.error('Error fetching orders:', e)
        setError('Failed to load orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">My Orders</h1>
        <div className="orders-loading">
          {[1,2,3].map(i => <div key={i} className="order-skeleton"></div>)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <button className="btn-outline" onClick={() => navigate('/shop')} style={{fontSize:13}}>Continue Shopping</button>
        </div>

        {error && <div className="orders-error">{error}</div>}

        {orders.length === 0 && !error ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Once you place an order, it will appear here.</p>
            <button className="btn-primary" onClick={() => navigate('/shop')}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const orderId = order._id || order.id
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
              return (
                <div className="order-card" key={orderId}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-number">{order.orderNumber}</span>
                      <span className="order-date">{date}</span>
                    </div>
                    <span className="order-status" style={{ color: statusInfo.color, background: statusInfo.color + '18' }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <img src={item.image} alt={item.name} />
                        <div className="order-item-info">
                          <p>{item.name}</p>
                          <small>Size: {item.selectedSize || item.size} {item.selectedColor ? `· Color: ${item.selectedColor}` : ''} · Qty: {item.qty}</small>
                        </div>
                        <span>₹{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-card-footer">
                    <span className="order-total">Total: <strong>₹{order.total.toLocaleString()}</strong></span>
                    <div className="order-actions">
                      {/* 🔌 Link to /orders/:id for full order detail page */}
                      <button className="btn-outline" style={{fontSize:12,padding:'7px 14px'}}
                        onClick={() => navigate(`/orders/${orderId}`)}>
                        View Details
                      </button>
                      {order.status === 'delivered' && (
                        <button className="btn-primary" style={{fontSize:12,padding:'7px 14px'}}
                          onClick={() => navigate('/shop')}>
                          Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
