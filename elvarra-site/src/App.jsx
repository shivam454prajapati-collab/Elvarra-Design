// ============================================================
// App.jsx — Root with routing, auth, cart, protected routes
// ============================================================
// 🔌 PROTECTED ROUTES: wrap any page in <ProtectedRoute> to
//    require login. The user is redirected back after sign-in.
//
// 🔌 ADMIN ROUTES (future): add adminOnly prop:
//    <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
// ============================================================

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Pages
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Custom from './pages/Custom.jsx'
import Checkout from './pages/Checkout.jsx'
import SignIn from './pages/SignIn.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Orders from './pages/Orders.jsx'
import Profile from './pages/Profile.jsx'

import { useCart } from './context/CartContext.jsx'

function Toast() {
  const { toast } = useCart()
  if (!toast) return null
  return <div className="toast"><span>✓</span>{toast}</div>
}

function Layout({ children, hideFooter }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public */}
            <Route path="/"        element={<Layout><Home /></Layout>} />
            <Route path="/shop"    element={<Layout><Shop /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/cart"    element={<Layout><Cart /></Layout>} />
            <Route path="/custom"  element={<Layout><Custom /></Layout>} />
            <Route path="/about"   element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/signin"  element={<Layout hideFooter><SignIn /></Layout>} />

            {/* Protected — require login */}
            <Route path="/checkout" element={
              <Layout hideFooter>
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/orders" element={
              <Layout>
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Layout>
            } />

            {/* 404 */}
            <Route path="*" element={
              <Layout>
                <div style={{ padding: '140px 24px', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 56, color: 'var(--gray-200)', marginBottom: 8 }}>404</h2>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--charcoal)', marginBottom: 12 }}>Page not found</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary" style={{ display: 'inline-flex' }}>Back to Home</a>
                </div>
              </Layout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
