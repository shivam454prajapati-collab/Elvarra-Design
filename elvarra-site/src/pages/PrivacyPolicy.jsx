import React from 'react'
import { Link } from 'react-router-dom'
import './Legal.css'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <nav className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="current">Privacy Policy</span>
          </nav>
          <h1>Privacy Policy</h1>
          <p className="legal-subtitle">Last updated: August 28, 2026</p>
        </div>

        <div className="legal-card">
          <div className="legal-content">
            <section>
              <h2>1. Introduction</h2>
              <p>
                Welcome to <strong>Elvarra</strong> ("we," "our," or "us"). At Elvarra, accessible from 
                <strong> www.elvarra.com</strong>, we are committed to protecting your privacy and ensuring 
                that your personal information is handled in a safe, transparent, and responsible manner. 
                This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website 
                or make a purchase from our custom print apparel catalog.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li><strong>Personal Identity:</strong> Your full name, email address, phone number, and account credentials.</li>
                <li><strong>Shipping & Billing:</strong> Delivery addresses, city, state, postal pincode, and contact numbers.</li>
                <li><strong>Custom Print Artwork:</strong> High-resolution images, designs, logos, and print specifications you upload to customize your apparel.</li>
                <li><strong>Transaction Records:</strong> Purchase history, order numbers, payment confirmation tokens, and communication history.</li>
              </ul>
              <div className="legal-alert">
                <strong>🔒 Payment Security:</strong> We do <em>not</em> store your credit/debit card numbers, CVVs, or NetBanking PINs. All payment transactions are processed securely through our RBI-compliant payment partner <strong>Razorpay</strong> via 256-bit SSL encryption.
              </div>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>We utilize the collected data for the following legitimate commercial purposes:</p>
              <ul>
                <li>Processing, tailoring, printing, and delivering your custom apparel orders.</li>
                <li>Sending automated order confirmations, real-time shipment tracking, and delivery updates.</li>
                <li>Providing customer support and responding to design inquiries or customization requests.</li>
                <li>Preventing fraudulent transactions and ensuring the security of our platform.</li>
                <li>Sending promotional newsletters and exclusive seasonal offers (only with your explicit opt-in consent).</li>
              </ul>
            </section>

            <section>
              <h2>4. Sharing of Information</h2>
              <p>
                We respect your privacy and <strong>never sell, rent, or trade</strong> your personal data to third parties. We only share necessary data with trusted service partners under strict confidentiality:
              </p>
              <ul>
                <li><strong>Logistics & Courier Partners:</strong> Delivery carriers (e.g., BlueDart, Delhivery) to fulfill doorstep shipments.</li>
                <li><strong>Payment Processors:</strong> Razorpay for seamless and secure payment authorization.</li>
                <li><strong>Cloud Infrastructure:</strong> Cloudinary and AWS for securely hosting uploaded design assets and product imagery.</li>
                <li><strong>Legal Compliance:</strong> When required by Indian law, law enforcement, or statutory authorities to comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2>5. Custom Print Copyright & Intellectual Property</h2>
              <p>
                When you upload graphics or artwork to Elvarra for custom printing, you retain full ownership and intellectual property rights to your designs. You grant Elvarra a limited, non-exclusive license solely to print, process, and deliver your customized merchandise.
              </p>
            </section>

            <section>
              <h2>6. Cookies & Tracking Technologies</h2>
              <p>
                We use essential cookies and session storage to maintain your shopping cart, remember your login session, and provide an enhanced browsing experience. You may configure your browser to reject cookies, though certain shopping features may be limited.
              </p>
            </section>

            <section>
              <h2>7. Data Retention & Security</h2>
              <p>
                We implement industry-standard administrative, technical, and physical safeguards to protect your personal information against unauthorized access, loss, or alteration. Your data is retained only as long as necessary to fulfill orders and comply with statutory tax and accounting regulations.
              </p>
            </section>

            <section>
              <h2>8. Your Rights</h2>
              <p>
                You have the right to access, update, or request deletion of your personal account data at any time. You can manage your profile directly in your 
                <Link to="/profile" className="legal-inline-link"> Account Settings</Link> or by contacting our Data Protection Team.
              </p>
            </section>

            <section>
              <h2>9. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:
              </p>
              <div className="legal-contact-box">
                <p><strong>Elvarra Apparel India Pvt. Ltd.</strong></p>
                <p>Email: <a href="mailto:privacy@elvarra.com">privacy@elvarra.com</a> | <a href="mailto:hello@elvarra.com">hello@elvarra.com</a></p>
                <p>Address: Sector 4, Textile & Custom Hub, Mumbai, Maharashtra 400069, India</p>
                <p>Phone: +91 98765 43210</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
