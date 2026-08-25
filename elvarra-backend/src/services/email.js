const nodemailer = require('nodemailer')

// ── Create transporter ────────────────────────────────────────
// 🔌 For production: replace with SendGrid/Resend/AWS SES transporter
//    Example SendGrid:
//    const sgMail = require('@sendgrid/mail')
//    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    return nodemailer.createTransport({ jsonTransport: true })
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const transporter = createTransporter()

// ── Base HTML wrapper ─────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f4f2; color: #2c2c2c; }
    .wrapper { max-width: 580px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #2c2c2c; padding: 28px 36px; text-align: center; }
    .logo-text { color: #C9A84C; font-size: 22px; font-weight: 700; letter-spacing: 0.14em; }
    .body { padding: 36px; }
    h2 { font-size: 22px; margin: 0 0 16px; color: #2c2c2c; }
    p { font-size: 14px; line-height: 1.7; color: #555; margin: 0 0 14px; }
    .btn { display: inline-block; background: #C9A84C; color: white; padding: 13px 28px; border-radius: 4px; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: 0.06em; margin: 8px 0 20px; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
    .order-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .total-row { font-weight: 700; font-size: 15px; padding: 10px 0; }
    .footer { background: #f5f4f2; padding: 20px 36px; text-align: center; font-size: 12px; color: #888; }
    .footer a { color: #C9A84C; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><div class="logo-text">ELVARRA</div></div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Elvarra. All rights reserved.</p>
      <p><a href="${process.env.FRONTEND_URL}">elvarra.com</a> · Mumbai, India</p>
    </div>
  </div>
</body>
</html>
`

// ── Send helper ────────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your@gmail.com') {
    // Email not configured — log to console in dev
    console.log(`\n📧 [EMAIL MOCK]\n  To: ${to}\n  Subject: ${subject}\n`)
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Elvarra" <no-reply@elvarra.com>',
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('Email send failed:', err.message)
    // Don't throw — email failure should not break the API response
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

/**
 * Welcome email after registration
 */
const sendWelcomeEmail = async ({ name, email }) => {
  await sendMail({
    to: email,
    subject: 'Welcome to Elvarra 🎉',
    html: baseTemplate(`
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for creating an account with Elvarra. We're excited to have you.</p>
      <p>Explore our premium custom-printed t-shirts and bring your designs to life.</p>
      <a href="${process.env.FRONTEND_URL}/shop" class="btn">Start Shopping</a>
      <div class="divider"></div>
      <p style="font-size:12px;color:#aaa;">If you didn't create this account, you can safely ignore this email.</p>
    `),
  })
}

/**
 * Password reset email
 */
const sendPasswordResetEmail = async ({ name, email, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
  await sendMail({
    to: email,
    subject: 'Reset your Elvarra password',
    html: baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <div class="divider"></div>
      <p style="font-size:12px;color:#aaa;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      <p style="font-size:12px;color:#aaa;">If the button doesn't work, copy this link: ${resetUrl}</p>
    `),
  })
}

/**
 * Order confirmation email
 */
const sendOrderConfirmationEmail = async ({ name, email, order }) => {
  const itemRows = order.items.map(item => `
    <div class="order-row">
      <span>${item.name} (${item.selectedSize}) × ${item.qty}</span>
      <span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
    </div>
  `).join('')

  await sendMail({
    to: email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: baseTemplate(`
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully and is being processed.</p>
      <div class="divider"></div>
      <h3 style="font-size:15px;margin:0 0 12px;">Order Summary</h3>
      ${itemRows}
      <div class="order-row">
        <span>Shipping</span>
        <span>${order.shipping === 0 ? 'Free' : '₹' + order.shipping}</span>
      </div>
      ${order.discount > 0 ? `<div class="order-row"><span>Discount</span><span style="color:green">−₹${order.discount}</span></div>` : ''}
      <div class="order-row total-row">
        <span>Total</span>
        <span>₹${order.total.toLocaleString('en-IN')}</span>
      </div>
      <div class="divider"></div>
      <p><strong>Shipping to:</strong><br/>
        ${order.shippingAddress.address}, ${order.shippingAddress.city}<br/>
        ${order.shippingAddress.state} — ${order.shippingAddress.pincode}
      </p>
      <p>Estimated delivery: <strong>5–7 business days</strong></p>
      <a href="${process.env.FRONTEND_URL}/orders" class="btn">Track Order</a>
    `),
  })
}

/**
 * Order status update email
 */
const sendOrderStatusEmail = async ({ name, email, orderNumber, status, trackingNumber }) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    printing: 'Great news! Your custom design is currently being printed.',
    shipped: `Your order is on its way!${trackingNumber ? ` Tracking: <strong>${trackingNumber}</strong>` : ''}`,
    delivered: 'Your order has been delivered. We hope you love it!',
    cancelled: 'Your order has been cancelled. A refund will be processed in 5–7 business days.',
  }

  await sendMail({
    to: email,
    subject: `Order Update — ${orderNumber}`,
    html: baseTemplate(`
      <h2>Order Update</h2>
      <p>Hi ${name},</p>
      <p>Your order <strong>${orderNumber}</strong> status has been updated to <strong style="color:#C9A84C;">${status.toUpperCase()}</strong>.</p>
      <p>${statusMessages[status] || 'Your order has been updated.'}</p>
      <a href="${process.env.FRONTEND_URL}/orders" class="btn">View Order</a>
    `),
  })
}

/**
 * Custom order received email (for customer)
 */
const sendCustomOrderEmail = async ({ name, email, orderId, tshirtType, qty }) => {
  await sendMail({
    to: email,
    subject: `Custom Print Request Received — ${orderId}`,
    html: baseTemplate(`
      <h2>We've Received Your Design!</h2>
      <p>Hi ${name},</p>
      <p>Your custom print request for <strong>${qty} × ${tshirtType}</strong> has been received. Our team will review your design and send you a quote within <strong>24 hours</strong>.</p>
      <p><strong>Reference ID:</strong> ${orderId}</p>
      <div class="divider"></div>
      <p>In the meantime, if you have any questions, feel free to contact us at <a href="mailto:hello@elvarra.com">hello@elvarra.com</a>.</p>
      <a href="${process.env.FRONTEND_URL}/contact" class="btn">Contact Us</a>
    `),
  })
}

/**
 * Custom order notification email (for admin/team)
 */
const sendCustomOrderAdminEmail = async ({ orderId, name, email, phone, tshirtType, qty, printMethod, designUrl }) => {
  await sendMail({
    to: process.env.EMAIL_USER,
    subject: `New Custom Print Request — ${orderId}`,
    html: baseTemplate(`
      <h2>New Custom Order</h2>
      <p><strong>Ref:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${name} (${email}, ${phone})</p>
      <p><strong>Product:</strong> ${qty} × ${tshirtType}</p>
      <p><strong>Print Method:</strong> ${printMethod}</p>
      ${designUrl ? `<p><strong>Design File:</strong> <a href="${designUrl}">${designUrl}</a></p>` : ''}
      <a href="${process.env.FRONTEND_URL}/admin/custom-orders" class="btn">View in Admin</a>
    `),
  })
}

/**
 * Contact form notification
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  await sendMail({
    to: process.env.EMAIL_USER,
    subject: `Contact Form: ${subject || 'General Enquiry'}`,
    html: baseTemplate(`
      <h2>New Contact Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject || 'General Enquiry'}</p>
      <div class="divider"></div>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `),
  })

  // Auto-reply to sender
  await sendMail({
    to: email,
    subject: 'We received your message — Elvarra',
    html: baseTemplate(`
      <h2>Thanks for reaching out!</h2>
      <p>Hi ${name},</p>
      <p>We've received your message and will get back to you within <strong>24 hours</strong>.</p>
      <p>Your message: <em>"${message.substring(0, 120)}${message.length > 120 ? '...' : ''}"</em></p>
    `),
  })
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendCustomOrderEmail,
  sendCustomOrderAdminEmail,
  sendContactEmail,
}
