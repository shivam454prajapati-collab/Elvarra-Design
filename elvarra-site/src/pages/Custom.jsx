// ============================================================
// Custom.jsx — 3-step custom print order wizard
// ============================================================
// 🔌 BACKEND INTEGRATION:
//   - On submit: POST /custom-orders (multipart/form-data)
//     Fields: tshirtType, color, size, qty, printMethod, printArea,
//             notes, name, email, phone, designFile (binary)
//   - Backend: use Multer to parse file → upload to Cloudinary/S3
//     → save order in DB → send confirmation email
//   - See apiCreateCustomOrder() in services/api.js for the fetch call
//
// 🔌 FILE UPLOAD:
//   - designFile is sent as FormData (not JSON)
//   - Max size enforced client-side (20MB) + backend Multer limit
//   - Accepted: PNG, JPG, SVG, PDF (min 300 DPI recommended)
// ============================================================

import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiCreateCustomOrder } from '../services/api.js'
import './Custom.css'

const TSHIRT_TYPES = ['Crew Neck', 'Oversized', 'Polo', 'V-Neck', 'Henley']
const BASE_COLORS = ['#FFFFFF', '#2C2C2C', '#C9A84C', '#1A3A5C', '#8B0000', '#2F4F4F', '#F5F0E8']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const PRINT_METHODS = [
  { id: 'dtf', label: 'DTF Printing', desc: 'Best for detailed multi-color designs', price: 299 },
  { id: 'screen', label: 'Screen Printing', desc: 'Ideal for bulk orders & solid colors', price: 199 },
  { id: 'embroidery', label: 'Embroidery', desc: 'Premium raised texture for logos & text', price: 499 },
]
const PRINT_AREAS = ['Front', 'Back', 'Front + Back', 'Left Chest', 'Sleeve']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export default function Custom() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const [form, setForm] = useState({
    tshirtType: '',
    color: '#FFFFFF',
    size: '',
    qty: 1,
    printMethod: '',
    printArea: 'Front',
    designFile: null,
    notes: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [preview, setPreview] = useState(null)
  const [fileError, setFileError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedMethod = PRINT_METHODS.find(m => m.id === form.printMethod)
  const basePrice = 799
  const totalPrice = form.qty * (basePrice + (selectedMethod?.price || 0))

  // ─── File handling ────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return
    setFileError('')
    if (file.size > MAX_FILE_SIZE) { setFileError('File too large. Maximum size is 20MB.'); return }
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
    if (!allowed.includes(file.type)) { setFileError('Unsupported file type. Use PNG, JPG, SVG or PDF.'); return }
    set('designFile', file)
    if (file.type !== 'application/pdf') {
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setPreview('pdf')
    }
  }

  const onFileInput = (e) => handleFile(e.target.files[0])
  const onDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }
  const clearFile = (e) => { e.stopPropagation(); set('designFile', null); setPreview(null); setFileError('') }

  // ─── Step validation ──────────────────────────────────────
  const step1Valid = form.tshirtType && form.size && form.qty >= 1
  const step2Valid = form.printMethod && form.designFile && !fileError
  const step3Valid = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && /^[6-9]\d{9}$/.test(form.phone.replace(/\D/g,''))

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      // 🔌 Build FormData for multipart upload
      // See apiCreateCustomOrder() in services/api.js
      const fd = new FormData()
      fd.append('tshirtType', form.tshirtType)
      fd.append('color', form.color)
      fd.append('size', form.size)
      fd.append('qty', form.qty)
      fd.append('printMethod', form.printMethod)
      fd.append('printArea', form.printArea)
      fd.append('notes', form.notes)
      fd.append('name', form.name.trim())
      fd.append('email', form.email.toLowerCase())
      fd.append('phone', form.phone.replace(/\D/g,''))
      fd.append('designFile', form.designFile) // 🔌 Binary file — backend uses Multer

      const { customOrder } = await apiCreateCustomOrder(fd)
      setOrderId(customOrder?.id || 'CO-' + Date.now())
      setSubmitted(true)
    } catch (e) {
      setSubmitError(e.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success screen ───────────────────────────────────────
  if (submitted) return (
    <div className="custom-page">
      <div className="container success-wrap">
        <div className="success-icon">✓</div>
        <h2>Order Request Received!</h2>
        <p>
          Thank you <strong>{form.name}</strong>! We'll review your design and contact you at{' '}
          <strong>{form.email}</strong> within 24 hours with a confirmation and final pricing.
        </p>
        {orderId && <div className="order-ref">Ref: {orderId}</div>}
        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          <button className="btn-outline" onClick={() => {
            setSubmitted(false); setStep(1); setPreview(null); setOrderId(null)
            setForm({ tshirtType:'',color:'#FFFFFF',size:'',qty:1,printMethod:'',printArea:'Front',designFile:null,notes:'',name:user?.name||'',email:user?.email||'',phone:'' })
          }}>Place Another Order</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="custom-page">
      <div className="custom-hero">
        <div className="container">
          <p className="section-label">Custom Printing</p>
          <h1 className="section-title">Your Design, Our Craft</h1>
          <div className="gold-divider"></div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480 }}>
            Upload your artwork and configure your order. We print with professional precision and deliver pan India.
          </p>
        </div>
      </div>

      <div className="container custom-body">
        {/* Steps indicator */}
        <div className="steps-bar">
          {['T-Shirt Details', 'Your Design', 'Contact Info'].map((label, i) => (
            <div key={i} className={`step-item ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <div className="step-num">{step > i+1 ? '✓' : i+1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="custom-layout">
          <div className="custom-form">

            {/* ── STEP 1: T-Shirt Details ── */}
            {step === 1 && (
              <div className="form-step">
                <h3>Choose Your T-Shirt</h3>
                <div className="form-group">
                  <label>Style *</label>
                  <div className="option-pills">
                    {TSHIRT_TYPES.map(t => (
                      <button key={t} className={`pill ${form.tshirtType === t ? 'active' : ''}`} onClick={() => set('tshirtType', t)}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Base Color</label>
                  <div className="color-row">
                    {BASE_COLORS.map(c => (
                      <button key={c} className={`swatch-lg ${form.color === c ? 'active' : ''}`}
                        style={{ background: c, border: c === '#FFFFFF' ? '1.5px solid #ddd' : 'none' }}
                        onClick={() => set('color', c)} title={c} />
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Size *</label>
                    <div className="option-pills">
                      {SIZES.map(s => (
                        <button key={s} className={`pill ${form.size === s ? 'active' : ''}`} onClick={() => set('size', s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ maxWidth: 180 }}>
                    <label>Quantity *</label>
                    <div className="qty-mini-custom">
                      <button onClick={() => set('qty', Math.max(1, form.qty - 1))}>−</button>
                      <span>{form.qty}</span>
                      <button onClick={() => set('qty', Math.min(500, form.qty + 1))}>+</button>
                    </div>
                    <small className="hint">1–500 pieces per order</small>
                  </div>
                </div>
                <button className="btn-primary step-next" disabled={!step1Valid} onClick={() => setStep(2)}>
                  Next: Upload Design →
                </button>
              </div>
            )}

            {/* ── STEP 2: Design Upload ── */}
            {step === 2 && (
              <div className="form-step">
                <h3>Upload Your Design</h3>
                <div className="form-group">
                  <label>Print Method *</label>
                  <div className="print-methods">
                    {PRINT_METHODS.map(m => (
                      <button key={m.id} className={`method-card ${form.printMethod === m.id ? 'active' : ''}`} onClick={() => set('printMethod', m.id)}>
                        <strong>{m.label}</strong>
                        <small>{m.desc}</small>
                        <span className="method-price">+₹{m.price}/pc</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Print Area</label>
                  <div className="option-pills">
                    {PRINT_AREAS.map(a => (
                      <button key={a} className={`pill ${form.printArea === a ? 'active' : ''}`} onClick={() => set('printArea', a)}>{a}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Design File * <small style={{fontWeight:400,color:'var(--text-secondary)'}}>PNG, JPG, SVG, PDF · Max 20MB · Min 300 DPI</small></label>
                  {/* 🔌 This file is sent as FormData to POST /custom-orders */}
                  <div
                    className={`drop-zone ${preview ? 'has-file' : ''} ${fileError ? 'has-error' : ''}`}
                    onDrop={onDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current.click()}
                  >
                    {preview === 'pdf' ? (
                      <div className="preview-wrap">
                        <div style={{ fontSize: 48 }}>📄</div>
                        <p><strong>{form.designFile.name}</strong></p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{(form.designFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={clearFile}>Change File</button>
                      </div>
                    ) : preview ? (
                      <div className="preview-wrap">
                        <img src={preview} alt="Design preview" />
                        <p><strong>{form.designFile.name}</strong></p>
                        <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={clearFile}>Change File</button>
                      </div>
                    ) : (
                      <>
                        <div className="drop-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <p><strong>Drag & drop your design here</strong></p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>or click to browse</p>
                        <small>PNG, JPG, SVG, PDF · Max 20MB</small>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/png,image/jpeg,image/svg+xml,application/pdf" onChange={onFileInput} />
                  {fileError && <p className="file-err">{fileError}</p>}
                </div>
                <div className="form-group">
                  <label>Special Instructions <small style={{fontWeight:400,color:'var(--text-secondary)'}}>(optional)</small></label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                    placeholder="Color preferences, placement details, reference links, or any other notes for our team…" />
                </div>
                <div className="step-nav">
                  <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" disabled={!step2Valid} onClick={() => setStep(3)}>Next: Contact Info →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Contact Info ── */}
            {step === 3 && (
              <div className="form-step">
                <h3>Your Contact Details</h3>
                {user && (
                  <div className="prefill-notice">✓ Prefilled from your account — confirm before submitting</div>
                )}
                <div className="form-group">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" autoComplete="name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && <span className="file-err">Enter a valid email address</span>}
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit mobile number" autoComplete="tel" />
                  {form.phone && !/^[6-9]\d{9}$/.test(form.phone) && <span className="file-err">Enter a valid 10-digit mobile number</span>}
                </div>

                {/* Order summary card */}
                <div className="order-summary-card">
                  <h4>Order Recap</h4>
                  <div className="summary-line"><span>Style</span><strong>{form.tshirtType}</strong></div>
                  <div className="summary-line"><span>Color</span>
                    <strong style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:14,height:14,borderRadius:'50%',background:form.color,display:'inline-block',border:'1px solid #ddd' }}></span>
                      {form.color}
                    </strong>
                  </div>
                  <div className="summary-line"><span>Size × Qty</span><strong>{form.size} × {form.qty}</strong></div>
                  <div className="summary-line"><span>Print Method</span><strong>{selectedMethod?.label}</strong></div>
                  <div className="summary-line"><span>Print Area</span><strong>{form.printArea}</strong></div>
                  <div className="summary-line"><span>Design File</span><strong style={{color:'#27ae60'}}>✓ {form.designFile?.name}</strong></div>
                  <div className="summary-divider"></div>
                  <div className="summary-line total-line"><span>Est. Total</span><strong>₹{totalPrice.toLocaleString()}</strong></div>
                  <small>Final price confirmed after our team reviews your design</small>
                </div>

                {submitError && <div className="pay-error">⚠ {submitError}</div>}

                <div className="step-nav">
                  <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn-primary" disabled={!step3Valid || submitting} onClick={handleSubmit}>
                    {submitting ? <><span className="btn-spinner"></span> Submitting…</> : 'Submit Order Request ✓'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Live Preview Panel ── */}
          <div className="custom-preview-panel">
            <div className="preview-panel-card">
              <h4>Live Preview</h4>
              <div className="tshirt-mock" style={{ background: form.color }}>
                {preview && preview !== 'pdf'
                  ? <img src={preview} alt="Design" className="design-on-shirt" />
                  : <div className="shirt-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={form.color === '#FFFFFF' ? '#ccc' : 'rgba(255,255,255,0.3)'} strokeWidth="1.2">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-14l8 4m-8-4v10l8 4"/>
                      </svg>
                      <span style={{ color: form.color === '#FFFFFF' ? '#bbb' : 'rgba(255,255,255,0.35)', fontSize: 11 }}>Your design here</span>
                    </div>
                }
              </div>
              <div className="preview-details">
                {form.tshirtType && <div className="pd-row"><span>Style</span><strong>{form.tshirtType}</strong></div>}
                {form.size && <div className="pd-row"><span>Size</span><strong>{form.size}</strong></div>}
                {form.qty > 0 && <div className="pd-row"><span>Quantity</span><strong>{form.qty} pc{form.qty>1?'s':''}</strong></div>}
                {form.printMethod && <div className="pd-row"><span>Print</span><strong>{selectedMethod?.label}</strong></div>}
                {form.printArea !== 'Front' && <div className="pd-row"><span>Area</span><strong>{form.printArea}</strong></div>}
                {form.designFile && <div className="pd-row" style={{color:'#27ae60'}}><span>Design</span><strong>✓ Uploaded</strong></div>}
                {selectedMethod && (
                  <div className="pd-total">
                    <span>Est. Total</span>
                    <strong>₹{totalPrice.toLocaleString()}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
