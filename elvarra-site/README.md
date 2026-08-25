# Elvarra — Premium Custom T-Shirt Store

## Quick Start

```bash
cp .env.example .env     # fill in your values
npm install
npm run dev              # http://localhost:5173
```

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Pages & Routes
| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/shop` | Product listing | No |
| `/product/:id` | Product detail | No |
| `/cart` | Shopping cart | No |
| `/custom` | Custom print wizard | No |
| `/checkout` | Checkout + payment | **Yes** |
| `/orders` | Order history | **Yes** |
| `/profile` | Account settings | **Yes** |
| `/signin` | Sign in / Register | No |
| `/about` | About page | No |
| `/contact` | Contact form | No |

## Backend Integration

All API calls are in **`src/services/api.js`**. Every function has:
- The exact endpoint, method, and payload documented
- A `// 🔌 REAL:` comment showing the real fetch call
- A `// MOCK` block that runs until your backend is live

### To go live:
1. Build your Node.js/Express backend (routes match `api.js`)
2. Set `VITE_API_URL` in `.env`
3. In each function, uncomment the `// 🔌 REAL:` line and delete the mock block

### Razorpay
1. Add to `index.html`: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
2. Set `VITE_RAZORPAY_KEY_ID` in `.env`
3. Uncomment the `openRazorpay()` implementation in `api.js`

### Google OAuth
1. Create OAuth credentials at console.cloud.google.com
2. Set `VITE_GOOGLE_CLIENT_ID` in `.env`
3. Add Google Identity SDK to `index.html`
4. Uncomment the `handleGoogleClick` handler in `SignIn.jsx`

## Tech Stack
- React 18 + Vite
- React Router v7
- Context API (Auth + Cart)
- CSS Modules (per-component)
- localStorage for cart & JWT persistence
