// ============================================================
// 🔌 API SERVICE LAYER — elvarra/src/services/api.js
// ============================================================
// This is the SINGLE file you edit to wire up your real backend.
//
// HOW TO USE:
//   1. Set your backend URL in .env:
//        VITE_API_URL=https://api.elvarra.com
//   2. Each function below shows exactly what endpoint to hit,
//      what to send, and what you'll get back.
//   3. Replace the mock return values (marked // MOCK) with the
//      real fetch calls (shown in the comment above each mock).
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Token helpers ───────────────────────────────────────────
export const getToken = () => localStorage.getItem('elvarra_token')
export const setToken = (t) => localStorage.setItem('elvarra_token', t)
export const removeToken = () => localStorage.removeItem('elvarra_token')

// ─── Core fetch wrapper ──────────────────────────────────────
// ─── Core fetch wrapper ──────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (res.status === 401) { removeToken(); window.location.href = '/signin'; return }
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Request failed') }
  return res.json()
}

// ============================================================
// AUTH ENDPOINTS
// ============================================================

/**
 * POST /auth/register
 * Body: { name, email, password }
 * Returns: { user: { id, name, email, role }, token }
 */
export async function apiRegister(name, email, password) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
}

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { user: { id, name, email, role }, token }
 */
export async function apiLogin(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

/**
 * GET /auth/me  (requires Bearer token)
 * Returns: { user: { id, name, email, role, phone, address } }
 * Called on app boot to restore session from localStorage token.
 */
export async function apiGetMe() {
  return request('/auth/me')
}

/**
 * POST /auth/google
 * Body: { googleToken }  (ID token from Google Sign-In)
 * Returns: { user, token }
 */
export async function apiGoogleAuth(googleToken) {
  return request('/auth/google', { method: 'POST', body: JSON.stringify({ googleToken }) })
}

/**
 * POST /auth/forgot-password
 * Body: { email }
 * Returns: { message }
 */
export async function apiForgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
}

/**
 * POST /auth/reset-password
 * Body: { token, newPassword }
 * Returns: { message }
 */
export async function apiResetPassword(token, newPassword) {
  return request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) })
}

// ============================================================
// PRODUCT ENDPOINTS
// ============================================================

/**
 * GET /products?category=&sort=&search=&page=&limit=
 * Returns: { products: [...], total, page, pages }
 */
export async function apiGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await request(`/products?${qs}`)
  if (data && data.products) {
    data.products = data.products.map(p => ({
      ...p,
      id: p._id,
      image: p.images?.[0] || '',
    }))
  }
  return data
}

/**
 * GET /products/:id
 * Returns: { product }
 */
export async function apiGetProduct(id) {
  const data = await request(`/products/${id}`)
  if (data && data.product) {
    data.product = {
      ...data.product,
      id: data.product._id,
      image: data.product.images?.[0] || '',
    }
  }
  return data
}

// ============================================================
// CART ENDPOINTS  (optional — sync cart to backend for logged-in users)
// ============================================================

/**
 * GET /cart  (requires auth)
 * Returns: { items: [{ productId, qty, selectedColor, selectedSize, product }] }
 */
export async function apiGetCart() {
  return { items: [] } // MOCK — cart is managed client-side in CartContext
}

/**
 * POST /cart/sync  (requires auth)
 * Body: { items: [{ productId, qty, selectedColor, selectedSize }] }
 */
export async function apiSyncCart(items) {
  return { success: true } // MOCK
}

// ============================================================
// ORDER ENDPOINTS
// ============================================================

/**
 * POST /orders
 * Body: { items, shippingAddress, paymentMethod, couponCode? }
 * Returns: { order: { id, orderNumber, amount, razorpayOrderId? } }
 */
export async function apiCreateOrder(orderData) {
  return request('/orders', { method: 'POST', body: JSON.stringify(orderData) })
}

/**
 * POST /orders/verify-payment
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * Returns: { success, order }
 */
export async function apiVerifyPayment(paymentData) {
  return request('/orders/verify-payment', { method: 'POST', body: JSON.stringify(paymentData) })
}

/**
 * GET /orders  (requires auth)
 * Returns: { orders: [...] }
 */
export async function apiGetOrders() {
  return request('/orders')
}

/**
 * GET /orders/:id  (requires auth)
 * Returns: { order }
 */
export async function apiGetOrder(id) {
  return request(`/orders/${id}`)
}

// ============================================================
// CUSTOM PRINT ORDER ENDPOINTS
// ============================================================

/**
 * POST /custom-orders  (multipart/form-data)
 * FormData fields: { tshirtType, color, size, qty, printMethod, printArea, notes, name, email, phone, designFile }
 * Returns: { customOrder: { id, status, estimatedPrice } }
 */
export async function apiCreateCustomOrder(formData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/custom-orders`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,  // DO NOT set Content-Type — browser sets multipart boundary
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Upload failed')
  }
  return res.json()
}

// ============================================================
// COUPON ENDPOINTS
// ============================================================

/**
 * POST /coupons/validate
 * Body: { code, cartTotal }
 * Returns: { valid, discount, type: 'percent'|'flat', message }
 */
export async function apiValidateCoupon(code, cartTotal) {
  return request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cartTotal }) })
}

// ============================================================
// PROFILE ENDPOINTS
// ============================================================

/**
 * PUT /users/me
 * Body: { name, phone, address }
 * Returns: { user }
 */
export async function apiUpdateProfile(data) {
  return request('/users/me', { method: 'PUT', body: JSON.stringify(data) })
}

// ============================================================
// CONTACT / SUPPORT
// ============================================================

/**
 * POST /contact
 * Body: { name, email, subject, message }
 * Returns: { message }
 */
export async function apiSendContact(data) {
  return request('/contact', { method: 'POST', body: JSON.stringify(data) })
}

/**
 * POST /newsletter/subscribe
 * Body: { email }
 * Returns: { message }
 */
export async function apiSubscribe(email) {
  return request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
}

// ============================================================
// RAZORPAY INTEGRATION HELPER
// ============================================================

/**
 * Opens the Razorpay payment modal.
 * @param {Object} opts - { orderId, amount (paise), name, email, phone, description, onSuccess, onFailure }
 */
export function openRazorpay({ orderId, amount, name, email, phone, description = 'Elvarra Order', onSuccess, onFailure }) {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID

  if (!keyId || keyId.includes('XXXX') || typeof window.Razorpay === 'undefined') {
    console.warn('[RAZORPAY DEV FALLBACK] Key is placeholder or SDK not loaded. Simulating success...');
    setTimeout(() => {
      onSuccess?.({ orderNumber: 'ELV-' + Math.floor(100000 + Math.random() * 900000), status: 'confirmed' })
    }, 1000)
    return
  }


  try {
    const options = {
      key: keyId,
      amount,                     // in paise (multiply ₹ by 100)
      currency: 'INR',
      name: 'Elvarra',
      description,
      prefill: { name, email, contact: phone },
      theme: { color: '#C9A84C' },
      handler: async (response) => {
        // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        try {
          const result = await apiVerifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          if (result.success) onSuccess?.(result.order)
          else onFailure?.('Payment verification failed on server')
        } catch (e) {
          onFailure?.(e.message || 'Payment verification failed')
        }
      },
      modal: {
        ondismiss: () => onFailure?.('Payment cancelled by user'),
      },
    }

    if (orderId) {
      options.order_id = orderId
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      onFailure?.(response.error?.description || 'Payment failed')
    })
    rzp.open()
  } catch (err) {
    console.error('Error opening Razorpay modal:', err)
    onFailure?.(err.message || 'Failed to open payment gateway')
  }
}


// ============================================================
// ADMIN ENDPOINTS
// ============================================================

export async function apiAdminCreateProduct(productData) {
  return request('/products', { method: 'POST', body: JSON.stringify(productData) })
}

export async function apiAdminUpdateProduct(id, productData) {
  return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) })
}

export async function apiAdminDeleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' })
}

export async function apiAdminUploadImage(formData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/products/upload-image`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Image upload failed')
  }
  return res.json()
}

export async function apiAdminGetOrders(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/orders/admin/all?${qs}`)
}

export async function apiAdminUpdateOrderStatus(id, statusData) {
  return request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) })
}

export async function apiAdminGetCustomOrders(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/custom-orders?${qs}`)
}

export async function apiAdminUpdateCustomOrder(id, data) {
  return request(`/custom-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

