import React, { useState, useEffect, useRef } from 'react'
import {
  apiGetProducts,
  apiAdminCreateProduct,
  apiAdminDeleteProduct,
  apiAdminUploadImage,
  apiAdminGetOrders,
  apiAdminUpdateOrderStatus,
  apiAdminGetCustomOrders,
  apiAdminUpdateCustomOrder,
} from '../services/api.js'
import './Admin.css'

const CATEGORIES = [
  { id: 'crew-neck', label: 'Crew Neck' },
  { id: 'oversized', label: 'Oversized' },
  { id: 'polo', label: 'Polo' },
  { id: 'v-neck', label: 'V-Neck' },
  { id: 'henley', label: 'Henley' },
]

const COLOR_PRESETS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#2C2C2C' },
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Navy', hex: '#1A3A5C' },
  { name: 'Burgundy', hex: '#8B0000' },
  { name: 'Olive', hex: '#2F4F4F' },
  { name: 'Beige', hex: '#F5F0E8' },
]

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const BADGES = ['', 'Bestseller', 'New', 'Limited', 'Sale']

export default function Admin() {
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders' | 'custom'

  // ── Products State ──
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productError, setProductError] = useState('')
  const [productSuccess, setProductSuccess] = useState('')

  // Add Product Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'crew-neck',
    colors: ['#FFFFFF', '#2C2C2C'],
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: '',
    badge: '',
    stock: 50,
  })

  // ── Orders State ──
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // ── Custom Orders State ──
  const [customOrders, setCustomOrders] = useState([])
  const [loadingCustom, setLoadingCustom] = useState(false)

  const fileInputRef = useRef()

  // ── Initial Load ──
  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (activeTab === 'orders') loadOrders()
    if (activeTab === 'custom') loadCustomOrders()
  }, [activeTab])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const data = await apiGetProducts({ limit: 100 })
      setProducts(data?.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await apiAdminGetOrders()
      setOrders(data?.orders || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadCustomOrders = async () => {
    setLoadingCustom(true)
    try {
      const data = await apiAdminGetCustomOrders()
      setCustomOrders(data?.orders || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCustom(false)
    }
  }

  // ── Image Upload Handler ──
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    setProductError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await apiAdminUploadImage(fd)
      if (res.imageUrl) {
        setForm(f => ({ ...f, imageUrl: res.imageUrl }))
      }
    } catch (err) {
      setProductError(err.message || 'Image upload failed.')
    } finally {
      setUploadingImage(false)
    }
  }

  const toggleColor = (hex) => {
    setForm(f => {
      const exists = f.colors.includes(hex)
      return {
        ...f,
        colors: exists ? f.colors.filter(c => c !== hex) : [...f.colors, hex],
      }
    })
  }

  const toggleSize = (size) => {
    setForm(f => {
      const exists = f.sizes.includes(size)
      return {
        ...f,
        sizes: exists ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
      }
    })
  }

  // ── Save Product ──
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setProductError('')
    setProductSuccess('')

    if (!form.name.trim()) return setProductError('Product name is required.')
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return setProductError('Valid price is required.')
    if (!form.imageUrl) return setProductError('Product image is required (upload or provide URL).')
    if (form.colors.length === 0) return setProductError('Select at least one color.')
    if (form.sizes.length === 0) return setProductError('Select at least one size.')

    setSavingProduct(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || 'Premium quality cotton t-shirt with durable print.',
        price: Number(form.price),
        category: form.category,
        colors: form.colors,
        sizes: form.sizes,
        images: [form.imageUrl],
        badge: form.badge || undefined,
        stock: Number(form.stock) || 50,
      }

      await apiAdminCreateProduct(payload)
      setProductSuccess('Product added successfully!')
      setShowAddModal(false)
      setForm({
        name: '',
        description: '',
        price: '',
        category: 'crew-neck',
        colors: ['#FFFFFF', '#2C2C2C'],
        sizes: ['S', 'M', 'L', 'XL'],
        imageUrl: '',
        badge: '',
        stock: 50,
      })
      await loadProducts()
    } catch (err) {
      setProductError(err.message || 'Failed to add product.')
    } finally {
      setSavingProduct(false)
    }
  }

  // ── Delete Product ──
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from store listings?`)) return
    try {
      await apiAdminDeleteProduct(id)
      await loadProducts()
    } catch (err) {
      alert(err.message || 'Failed to delete product')
    }
  }

  // ── Update Order Status ──
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await apiAdminUpdateOrderStatus(orderId, { status: newStatus })
      await loadOrders()
    } catch (err) {
      alert(err.message || 'Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <div className="admin-badge">Admin Dashboard</div>
            <h1 className="admin-title">Store Management</h1>
            <p className="admin-sub">Manage products, customer orders, and custom print requests in real-time.</p>
          </div>

          {activeTab === 'products' && (
            <button className="btn-primary" onClick={() => { setShowAddModal(true); setProductError(''); setProductSuccess('') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New T-Shirt
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            👕 Products ({products.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Customer Orders ({orders.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            🎨 Custom Prints ({customOrders.length})
          </button>
        </div>

        {/* ─── TAB 1: PRODUCTS ─── */}
        {activeTab === 'products' && (
          <div className="admin-content-section">
            {loadingProducts ? (
              <div className="admin-loading">Loading catalog...</div>
            ) : products.length === 0 ? (
              <div className="admin-empty">
                <p>No products listed yet.</p>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>Add Your First T-Shirt</button>
              </div>
            ) : (
              <div className="admin-products-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Colors</th>
                      <th>Sizes</th>
                      <th>Badge</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image || p.images?.[0]} alt={p.name} className="admin-product-thumb" />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <span className="admin-cat-pill">{p.category}</span>
                        </td>
                        <td>
                          <strong>₹{p.price}</strong>
                        </td>
                        <td>{p.stock ?? 50} pcs</td>
                        <td>
                          <div className="admin-color-dots">
                            {(p.colors || []).map(c => (
                              <span key={c} className="admin-color-dot" style={{ background: c }} />
                            ))}
                          </div>
                        </td>
                        <td>
                          <small>{(p.sizes || []).join(', ')}</small>
                        </td>
                        <td>
                          {p.badge && <span className="admin-badge-tag">{p.badge}</span>}
                        </td>
                        <td>
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Remove from store"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: ORDERS ─── */}
        {activeTab === 'orders' && (
          <div className="admin-content-section">
            {loadingOrders ? (
              <div className="admin-loading">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="admin-empty">No customer orders placed yet.</div>
            ) : (
              <div className="admin-products-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id || o.id}>
                        <td>
                          <strong>{o.orderNumber}</strong>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div><strong>{o.shippingAddress?.name || o.user?.name}</strong></div>
                          <small style={{ color: '#888' }}>{o.shippingAddress?.phone}</small>
                        </td>
                        <td>
                          {o.items?.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '12px' }}>
                              {item.name} ({item.selectedSize || item.size}) × {item.qty}
                            </div>
                          ))}
                        </td>
                        <td>
                          <strong>₹{o.total}</strong>
                        </td>
                        <td>
                          <span className={`admin-pay-badge ${o.paymentStatus}`}>
                            {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                          </span>
                        </td>
                        <td>
                          <select
                            className="admin-status-select"
                            value={o.status}
                            disabled={updatingOrderId === (o._id || o.id)}
                            onChange={(e) => handleOrderStatusChange(o._id || o.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="printing">Printing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: CUSTOM PRINTS ─── */}
        {activeTab === 'custom' && (
          <div className="admin-content-section">
            {loadingCustom ? (
              <div className="admin-loading">Loading custom prints...</div>
            ) : customOrders.length === 0 ? (
              <div className="admin-empty">No custom print design requests received yet.</div>
            ) : (
              <div className="admin-products-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Customer</th>
                      <th>T-Shirt Details</th>
                      <th>Artwork</th>
                      <th>Qty</th>
                      <th>Print Method</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customOrders.map(co => (
                      <tr key={co._id || co.id}>
                        <td><strong>{co.orderId}</strong></td>
                        <td>
                          <div><strong>{co.customerName}</strong></div>
                          <small>{co.customerEmail}</small><br/>
                          <small>{co.customerPhone}</small>
                        </td>
                        <td>
                          {co.tshirtType} · Size {co.size}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span className="admin-color-dot" style={{ background: co.color }} />
                            <small>{co.color}</small>
                          </div>
                        </td>
                        <td>
                          {co.designFileUrl ? (
                            <a href={co.designFileUrl} target="_blank" rel="noopener noreferrer" className="admin-artwork-link">
                              <img src={co.designFileUrl} alt="Design preview" className="admin-product-thumb" />
                              <span>View Full Artwork ↗</span>
                            </a>
                          ) : 'No file'}
                        </td>
                        <td>{co.qty} pcs</td>
                        <td><span className="admin-cat-pill">{co.printMethod}</span></td>
                        <td><small>{co.notes || '—'}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── ADD PRODUCT MODAL ─── */}
        {showAddModal && (
          <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Add New T-Shirt / Product</h2>
                <button className="admin-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveProduct} className="admin-form">
                {productError && <div className="admin-form-error">{productError}</div>}
                {productSuccess && <div className="admin-form-success">{productSuccess}</div>}

                <div className="admin-form-row">
                  <div className="fg">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Classic Oversized Heavyweight Tee"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="fg">
                    <label>Category *</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="fg">
                    <label>Price (₹ INR) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 799"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="fg">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={form.stock}
                      onChange={e => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label>Badge</label>
                    <select
                      value={form.badge}
                      onChange={e => setForm({ ...form, badge: e.target.value })}
                    >
                      {BADGES.map(b => (
                        <option key={b} value={b}>{b || 'None'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload / URL */}
                <div className="fg">
                  <label>Product Image *</label>
                  <div className="admin-image-upload-wrap">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageFileChange}
                    />
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingImage ? 'Uploading to Cloudinary…' : '📁 Upload Image File'}
                    </button>
                    <span style={{ fontSize: '13px', color: '#888' }}>or paste Image URL:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>

                  {form.imageUrl && (
                    <div className="admin-preview-box">
                      <img src={form.imageUrl} alt="Preview" />
                      <span>Image loaded</span>
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="fg">
                  <label>Available Colors</label>
                  <div className="admin-colors-picker">
                    {COLOR_PRESETS.map(c => {
                      const selected = form.colors.includes(c.hex)
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          className={`admin-swatch-btn ${selected ? 'active' : ''}`}
                          style={{ background: c.hex, border: c.hex === '#FFFFFF' ? '1px solid #ccc' : 'none' }}
                          onClick={() => toggleColor(c.hex)}
                          title={c.name}
                        >
                          {selected && <span style={{ color: c.hex === '#FFFFFF' ? '#000' : '#fff' }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div className="fg">
                  <label>Available Sizes</label>
                  <div className="admin-sizes-picker">
                    {ALL_SIZES.map(s => {
                      const selected = form.sizes.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`admin-size-toggle ${selected ? 'active' : ''}`}
                          onClick={() => toggleSize(s)}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="fg">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about fabric, GSM, fit, and care instructions."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={savingProduct || uploadingImage}>
                    {savingProduct ? 'Saving Product…' : 'Publish Product to Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
