import React from 'react'
import { Link } from 'react-router-dom'
import './Legal.css'

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <nav className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="current">Terms of Service</span>
          </nav>
          <h1>Terms of Service</h1>
          <p className="legal-subtitle">Last updated: August 28, 2026</p>
        </div>

        <div className="legal-card">
          <div className="legal-content">
            <section>
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing, browsing, or using the website <strong>www.elvarra.com</strong> (the "Site") operated by 
                <strong> Elvarra Apparel India Pvt. Ltd.</strong>, you agree to be bound by these Terms of Service ("Terms") 
                and all applicable laws and regulations of India. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2>2. User Accounts & Registration</h2>
              <p>
                When creating an account with Elvarra, you must provide accurate, complete, and current information. 
                You are responsible for safeguarding your password and account security. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2>3. Products & Pricing</h2>
              <ul>
                <li><strong>Catalog Representation:</strong> We make every effort to display the colors, fabrics, and designs of our apparel as accurately as possible. Slight variations in monitor color rendering or print dye batches may occur.</li>
                <li><strong>Pricing & Taxes:</strong> All prices displayed on the website are in Indian National Rupees (INR ₹) inclusive of applicable GST unless explicitly stated otherwise.</li>
                <li><strong>Price Adjustments:</strong> Elvarra reserves the right to modify prices, discontinue products, or update discounts without prior notice.</li>
              </ul>
            </section>

            <section>
              <h2>4. Custom Print Orders & Content Guidelines</h2>
              <p>
                Elvarra provides custom t-shirt printing and tailoring services. By uploading designs, graphics, or text to our customizer, you warrant and agree that:
              </p>
              <ul>
                <li>You own or possess the legal authorization and licenses for the artwork, logos, and trademarks submitted.</li>
                <li>Your submitted content is not defamatory, obscene, pornographic, offensive, or infringing on any third-party intellectual property rights.</li>
                <li>Elvarra reserves the right to decline or cancel any custom print request that violates our content standards or community guidelines.</li>
              </ul>
            </section>

            <section>
              <h2>5. Payment & Verification</h2>
              <p>
                We accept major online payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking via <strong>Razorpay</strong>, and Cash on Delivery (COD) on eligible pin codes.
              </p>
              <p>
                All orders are subject to automated verification and security clearance. We reserve the right to cancel orders with unverified or fraudulent billing details.
              </p>
            </section>

            <section>
              <h2>6. Shipping & Delivery</h2>
              <ul>
                <li><strong>Standard Processing Time:</strong> In-stock apparel is dispatched within 24–48 hours. Custom printed apparel requires 2–4 business days for precision printing and quality control.</li>
                <li><strong>Transit Duration:</strong> Standard delivery takes 3–7 business days depending on your delivery location and pincode across India.</li>
                <li><strong>Tracking:</strong> Real-time tracking numbers are provided on your <Link to="/orders" className="legal-inline-link">My Orders</Link> dashboard and sent via email upon dispatch.</li>
              </ul>
            </section>

            <section>
              <h2>7. Returns, Refunds & Cancellations</h2>
              <p>
                We strive for 100% customer satisfaction. Our standard return policy is structured as follows:
              </p>
              <ul>
                <li><strong>Catalog Apparel:</strong> Unworn items with original tags and packaging can be returned or exchanged within <strong>7 days</strong> of delivery.</li>
                <li><strong>Custom Printed Orders:</strong> Because custom printed apparel is tailored specifically to your unique specifications, custom prints are eligible for replacement or refund only in cases of manufacturing defects, print misalignments, or transit damages.</li>
                <li><strong>Refund Timeline:</strong> Approved refunds will be credited back to your original payment method (or bank account for COD) within 5–7 business days.</li>
              </ul>
            </section>

            <section>
              <h2>8. Limitation of Liability</h2>
              <p>
                In no event shall Elvarra, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use our services or products.
              </p>
            </section>

            <section>
              <h2>9. Governing Law & Jurisdiction</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
              </p>
            </section>

            <section>
              <h2>10. Contact Information</h2>
              <p>
                For questions concerning our Terms of Service or to resolve an issue with an order, please reach out to us:
              </p>
              <div className="legal-contact-box">
                <p><strong>Elvarra Customer Experience Team</strong></p>
                <p>Email: <a href="mailto:legal@elvarra.com">legal@elvarra.com</a> | <a href="mailto:support@elvarra.com">support@elvarra.com</a></p>
                <p>Helpline: +91 98765 43210 (Mon – Sat, 10:00 AM – 7:00 PM IST)</p>
                <p>Address: Sector 4, Textile & Custom Print Park, Mumbai 400069, Maharashtra, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
