# Elvarra — Premium Custom Print & E-Commerce Platform

Elvarra is a full-stack e-commerce web platform for premium apparel and custom printed t-shirts, built with a modern React frontend and a scalable Node.js/Express backend with MongoDB, Razorpay payment gateway integration, and Cloudinary media uploads.

## Project Structure

```
├── elvarra-site/       # React + Vite frontend application
├── elvarra-backend/    # Node.js + Express + MongoDB backend API
└── README.md
```

## Quick Start

### 1. Backend Setup
```bash
cd elvarra-backend
npm install
cp .env.example .env    # Configure your MongoDB, JWT, Cloudinary & Razorpay keys
npm run seed            # Seed initial products, coupons & admin user
npm run dev             # Starts backend API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd elvarra-site
npm install
cp .env.example .env    # Set VITE_API_URL and VITE_RAZORPAY_KEY_ID
npm run dev             # Starts frontend Vite dev server on http://localhost:5173
```

## Features
- **Dynamic Catalog**: Full product browsing, category filtering, search, and detail views.
- **Custom Print Studio**: 3-step design submission wizard with direct Cloudinary uploads.
- **Authentication**: JWT-based customer and admin authentication.
- **Checkout & Payments**: Integrated with Razorpay & Cash on Delivery (COD).
- **Order Management**: Real-time order tracking and admin order status updates.
- **Coupons & Discounts**: Server-validated promo codes.
