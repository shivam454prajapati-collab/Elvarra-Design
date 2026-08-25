# Elvarra Backend — Production API

Node.js + Express + MongoDB REST API for the Elvarra custom t-shirt store.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env
# → Fill in MongoDB URI, JWT secret, Razorpay keys, email config

# 3. Seed database with products, coupons, and admin user
npm run seed

# 4. Start development server
npm run dev         # http://localhost:5000
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Sign in → returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Public | Reset with token |
| PUT | `/api/auth/change-password` | Bearer | Change password |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | Public | List products (search, filter, sort, paginate) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete |

**GET /api/products query params:**
- `search` — full text search
- `category` — crew-neck, oversized, polo, v-neck, henley
- `sort` — asc, desc, newest, popular, featured
- `page`, `limit` — pagination

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Bearer | Create order → returns razorpayOrderId |
| POST | `/api/orders/verify-payment` | Bearer | Verify Razorpay HMAC → confirms order |
| GET | `/api/orders` | Bearer | My orders |
| GET | `/api/orders/:id` | Bearer | Single order |
| GET | `/api/orders/admin/all` | Admin | All orders |
| PUT | `/api/orders/admin/:id/status` | Admin | Update status, tracking |

### Custom Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/custom-orders` | Optional | Submit custom print request (multipart) |
| GET | `/api/custom-orders` | Admin | All custom orders |
| PUT | `/api/custom-orders/:id` | Admin | Update status/price |

**POST /api/custom-orders body** (multipart/form-data):
- `tshirtType`, `color`, `size`, `qty`, `printMethod`, `printArea`
- `name`, `email`, `phone`, `notes`
- `designFile` — PNG/JPG/SVG/PDF (max 20MB)

### Coupons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/coupons/validate` | Public | Validate coupon code |
| POST | `/api/coupons` | Admin | Create coupon |
| GET | `/api/coupons` | Admin | List all coupons |
| DELETE | `/api/coupons/:id` | Admin | Deactivate coupon |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Bearer | Get profile |
| PUT | `/api/users/me` | Bearer | Update name/phone/address |
| DELETE | `/api/users/me` | Bearer | Deactivate account |
| GET | `/api/users` | Admin | All users |

### Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | Public | Send contact message |

---

## Razorpay Payment Flow

```
1. Frontend → POST /api/orders
   ← { razorpayOrderId, orderNumber, amount }

2. Frontend opens Razorpay modal with razorpayOrderId

3. User pays → Razorpay returns:
   { razorpay_order_id, razorpay_payment_id, razorpay_signature }

4. Frontend → POST /api/orders/verify-payment
   Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
   ← { success: true, order: { orderNumber } }
```

---

## Default Seed Data

After `npm run seed`:
- **6 products** (all categories)
- **3 coupons**: `ELVARRA10` (10% off), `FLAT100` (₹100 off), `NEWUSER` (15% off)
- **Admin user**: `admin@elvarra.com` / `Admin@123`

---

## Deployment

### Railway / Render / Heroku
```bash
# Set env vars in dashboard, then:
npm start
```

### Environment Variables Required for Production
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64 random chars>
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=https://elvarra.com
```

### MongoDB Atlas
1. Create cluster at mongodb.com/atlas
2. Whitelist your server IP (or 0.0.0.0/0 for dev)
3. Create DB user → paste connection string into `MONGODB_URI`

### Cloudinary (design file uploads)
1. Create account at cloudinary.com
2. Copy cloud name, API key, API secret → paste into `.env`
3. Files upload automatically on custom order submission

### Email (Nodemailer / Gmail)
1. Enable 2FA on Gmail
2. Generate App Password → paste as `EMAIL_PASS`
3. For high volume: use SendGrid or Resend (update `EMAIL_HOST`, `EMAIL_PORT`)

---

## Project Structure

```
src/
├── server.js           Entry point
├── app.js              Express setup, middleware, routes
├── config/
│   ├── db.js           MongoDB connection
│   └── cloudinary.js   Cloudinary + Multer
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── CustomOrder.js
│   └── Coupon.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── customOrderController.js
│   └── userController.js   (+ coupons + contact)
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── otherRoutes.js
├── middleware/
│   ├── auth.js         JWT protect, adminOnly, optionalAuth
│   ├── errorHandler.js Global error handler + asyncHandler
│   └── validators.js   express-validator rules
├── services/
│   └── email.js        All transactional emails
└── utils/
    └── seed.js         DB seeder
```
