import React, { useState, useEffect } from 'react'
import { apiGetProducts } from '../services/api.js'
import ProductCard from '../components/ProductCard.jsx'
import './Shop.css'

const CATEGORIES = ['All', 'Crew Neck', 'Oversized', 'Polo', 'V-Neck']
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'asc' },
  { label: 'Price: High to Low', value: 'desc' },
]

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [search, setSearch] = useState('')
  const [productsList, setProductsList] = useState([])

  useEffect(() => {
    let active = true
    apiGetProducts({ limit: 100 }).then(res => {
      if (active && res && res.products) {
        setProductsList(res.products)
      }
    }).catch(console.error)
    return () => { active = false }
  }, [])

  const filtered = productsList
    .filter(p => activeCategory === 'All' || p.category === activeCategory.toLowerCase().replace(' ', '-'))
    .filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'asc') return a.price - b.price
      if (sort === 'desc') return b.price - a.price
      return 0
    })

  return (
    <div className="shop-page">
      <div className="shop-hero">
        <div className="container">
          <p className="section-label">Our Collection</p>
          <h1 className="section-title">Shop All Products</h1>
          <div className="gold-divider"></div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px' }}>
            Premium quality t-shirts crafted with care. Find your perfect fit or upload your own design.
          </p>
        </div>
      </div>

      <div className="container shop-body">
        <div className="shop-toolbar">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <div className="cat-filters">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`cat-btn ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >{c}</button>
            ))}
          </div>

          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="results-count">
          Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <p>No products found for "<strong>{search}</strong>"</p>
            <button className="btn-outline" onClick={() => setSearch('')}>Clear Search</button>
          </div>
        ) : (
          <div className="shop-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
