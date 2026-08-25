// ============================================================
// CartContext.jsx — Production cart with localStorage persistence
// ============================================================
// 🔌 BACKEND INTEGRATION POINTS:
//   - After login: call apiSyncCart(items) to push local cart to server
//   - On login: call apiGetCart() to merge server cart with local cart
//   - On order placed: call clearCart() + apiSyncCart([])
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiSyncCart, apiGetCart } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

const CART_KEY = 'elvarra_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] }
  catch { return [] }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart)
  const [toast, setToast] = useState(null)
  const { user } = useAuth?.() || {}

  // Persist cart to localStorage on every change
  useEffect(() => { saveCart(cart) }, [cart])

  // 🔌 When user logs in, merge their server cart with local cart
  useEffect(() => {
    if (!user) return
    const syncOnLogin = async () => {
      try {
        // 🔌 REAL: fetch server cart and merge
        // const { items: serverItems } = await apiGetCart()
        // setCart(prev => mergeCartItems(prev, serverItems))
        
        // Then push the merged cart back to server
        // await apiSyncCart(cart.map(i => ({ productId: i.id, qty: i.qty, selectedColor: i.selectedColor, selectedSize: i.selectedSize })))
      } catch (e) {
        console.warn('Cart sync failed:', e.message)
      }
    }
    syncOnLogin()
  }, [user])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(i =>
        i.id === item.id &&
        i.selectedColor === item.selectedColor &&
        i.selectedSize === item.selectedSize
      )
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.selectedColor === item.selectedColor && i.selectedSize === item.selectedSize
            ? { ...i, qty: i.qty + (item.qty || 1) }
            : i
        )
      }
      return [...prev, { ...item, qty: item.qty || 1 }]
    })
    showToast(`${item.name} added to cart`)
  }, [showToast])

  const removeFromCart = useCallback((id, color, size) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedColor === color && i.selectedSize === size)))
  }, [])

  const updateQty = useCallback((id, color, size, qty) => {
    if (qty < 1) { removeFromCart(id, color, size); return }
    setCart(prev => prev.map(i =>
      i.id === id && i.selectedColor === color && i.selectedSize === size ? { ...i, qty } : i
    ))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
    localStorage.removeItem(CART_KEY)
  }, [])

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count, toast }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
