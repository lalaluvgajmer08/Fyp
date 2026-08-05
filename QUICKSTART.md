# Quick Start Guide

Your code is complete. This guide gets both sides running.

## Prerequisites

1. **Node.js** — already installed (you're running this)
2. **MongoDB** — must be running locally

### Start MongoDB

If MongoDB isn't running, the server will crash at startup with `MongoServerSelectionError`.

**Option A: MongoDB as a Windows Service**
```bash
# Check if running
sc query MongoDB

# Start it
net start MongoDB
```

**Option B: Manual start** (if not installed as a service)
```bash
mongod --dbpath="C:\data\db"
```

If MongoDB isn't installed yet:
- Download from https://www.mongodb.com/try/download/community
- Or install via `winget install MongoDB.Server`
- Create the data directory: `mkdir C:\data\db`

---

## 1. Install dependencies (one-time)

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

---

## 2. Seed the database (one-time)

Creates the admin account, sample news articles, metal rates, and products.

```bash
cd server
npm run seed
```

**Expected output:**
```
MongoDB connected: 127.0.0.1/jewelry_management
Admin created: admin@aureliajewels.com / Admin@12345
Rates seeded: 4 rates published
News seeded: 3 articles
Products seeded: 8 products
Seed complete
```

If it fails with `MongoServerSelectionError`, MongoDB isn't running (see Prerequisites above).

---

## 3. Run both servers

Open **two terminals** in the project root.

### Terminal 1 — Backend
```bash
cd server
npm run dev
```

**Expected output:**
```
Server running in development mode on http://localhost:5000
MongoDB connected: 127.0.0.1/jewelry_management
```

If you see `Missing required environment variable: MONGO_URI`, the `.env` file is missing — it already exists, so this shouldn't happen.

### Terminal 2 — Frontend
```bash
cd client
npm run dev
```

**Expected output:**
```
VITE v5.4.8  ready in 423 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 4. Open the app

Visit **http://localhost:5173** in your browser.

### What you should see

**Home page:**
- Hero section
- News strip with 3 articles (the seeded ones)
- Rate board with live daily rates (gold and silver prices)

**Click "Collection" in the nav** → http://localhost:5173/collection
- Browse all products with filters (category, metal)
- Sort by price, weight, or newest
- Click any product → detailed page with transparent price breakdown

**Click "News" in the nav** → http://localhost:5173/news
- Grid of all published articles
- Click any card → full article page

**Admin console:**
1. Visit http://localhost:5173/login
2. Sign in with the seeded account:
   - Email: `admin@aureliajewels.com`
   - Password: `Admin@12345`
3. Lands on `/admin` — dashboard with stats and recent content
4. Sidebar navigation:
   - **Products** → manage catalogue, create/edit products with live price preview
   - **Metal rates** → publish daily rates, view history
   - **News & updates** → full admin table with filters

---

## Troubleshooting

### "Cannot GET /api/v1/news" or news page shows error state

**Backend isn't running.** Check Terminal 1. If it crashed, read the error:
- `MongoServerSelectionError` → MongoDB isn't running
- `EADDRINUSE` → port 5000 is taken; kill the other process or change `PORT` in `server/.env`

### News page loads but shows "No articles match these filters"

**Database is empty.** Run `npm run seed` in the server directory.

### Products show "Price on request" instead of a price

**No rate published for that purity.** Every product's `purity` must have a
matching rate `category` on the board. Sign in as admin → "Metal rates" →
publish a rate for that category, then refresh the catalogue.

### Login redirects back to /login immediately

**Backend isn't running** or returned 401. Check the browser console (F12) → Network tab for the failing request.

### Changes to code don't appear

**Frontend:** Vite hot-reloads automatically. Hard refresh (Ctrl+F5) if stuck.

**Backend:** nodemon restarts on save. If it didn't, check Terminal 1 for syntax errors.

---

## What's complete

- ✅ Product catalogue — public browse with filters, sort, pagination, detail pages
- ✅ Product CRUD (admin/staff create, edit, discontinue with live price preview)
- ✅ Live pricing engine — prices computed per request from the rate board
- ✅ Metal rates (publish daily rates, automatic day-on-day change calculation, history)
- ✅ News CRUD (admin can create/edit/archive articles)
- ✅ Auth flow (login, session restore, protected routes, role-based access)
- ✅ Full routing (public storefront, login, admin console)
- ✅ Context providers mounted (Auth, Toast, React Query)
- ✅ Backend API (auth, products, rates, news endpoints)
- ✅ Seed script (admin + rates + articles + products)

## What's still placeholder

- Exchange, Visit, Cart — render a "coming soon" message using `PlaceholderPage`
- Inventory and Orders — sidebar links are disabled, modules not built yet
- Product images — `coverImage` accepts a URL, but there's no upload flow yet

---

## Default credentials

**Admin account** (created by seed):
- Email: `admin@aureliajewels.com`
- Password: `Admin@12345`

To add more users, insert them directly into MongoDB or build the `/users` endpoint.

---

## Architecture

**Frontend:** React 18 + Vite + Tailwind CSS 4 + React Router 6 + React Query
- `client/src/routes/router.jsx` — all routes
- `client/src/main.jsx` — providers wrap the app
- `client/src/services/` — API calls
- `client/src/components/` — reusable UI components

**Backend:** Express + MongoDB + Mongoose + JWT auth
- `server/src/server.js` — entry point
- `server/src/app.js` — middleware stack
- `server/src/routes/` — API routes
- `server/src/controllers/` — business logic
- `server/src/models/` — Mongoose schemas

**Database:** MongoDB (`jewelry_management`)
- Collections: `users`, `rates`, `products`, `news`
- Seeded by `npm run seed` in the server directory

---

## Further reading

- `README.md` — feature overview and pricing model
- `docs/API.md` — full endpoint reference with request/response examples
- `docs/REPORT.md` — architecture, schemas, and design decisions for the report

---

## Next steps

1. **Orders module** — customer reservations, staff order processing
2. **Inventory tracking** — stock alerts, audit trail
3. **Image upload** — Cloudinary/S3 integration for product photos
4. **Exchange & Visit pages** — complete the placeholder pages
5. **Deploy** — change `JWT_SECRET` before pushing to production
