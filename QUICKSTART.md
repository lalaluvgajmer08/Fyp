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

Creates the admin account and three sample news articles.

```bash
cd server
npm run seed
```

**Expected output:**
```
MongoDB connected: 127.0.0.1/jewelry_management
Admin created: admin@aureliajewels.com / Admin@12345
News seeded: Gold holds near record...
News seeded: Silver eases...
News seeded: Hallmarking rules tighten...
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
- Rate board (shows placeholder data until the rates API is built)

**Click "News" in the nav** → http://localhost:5173/news
- Grid of all published articles
- Click any card → full article page

**Admin console:**
1. Visit http://localhost:5173/login
2. Sign in with the seeded account:
   - Email: `admin@aureliajewels.com`
   - Password: `Admin@12345`
3. Lands on `/admin` — dashboard with stats and recent articles
4. Sidebar: "News & updates" → full admin table with filters

---

## Troubleshooting

### "Cannot GET /api/v1/news" or news page shows error state

**Backend isn't running.** Check Terminal 1. If it crashed, read the error:
- `MongoServerSelectionError` → MongoDB isn't running
- `EADDRINUSE` → port 5000 is taken; kill the other process or change `PORT` in `server/.env`

### News page loads but shows "No articles match these filters"

**Database is empty.** Run `npm run seed` in the server directory.

### Login redirects back to /login immediately

**Backend isn't running** or returned 401. Check the browser console (F12) → Network tab for the failing request.

### Changes to code don't appear

**Frontend:** Vite hot-reloads automatically. Hard refresh (Ctrl+F5) if stuck.

**Backend:** nodemon restarts on save. If it didn't, check Terminal 1 for syntax errors.

---

## What's complete

- ✅ All 11 pages (Home, Collection, Rates, Exchange, Visit, Cart, News, NewsDetail, Login, Dashboard, NewsList, NewsCreate, NewsEdit)
- ✅ News CRUD (admin can create/edit/archive articles)
- ✅ Auth flow (login, session restore, protected routes)
- ✅ Full routing (public storefront, login, admin console)
- ✅ Context providers mounted (Auth, Toast, React Query)
- ✅ Backend API (auth, news endpoints)
- ✅ Seed script (admin + sample articles)

## What's placeholder (works, but shows static data)

- Collection, Rates, Exchange, Visit, Cart — render a "coming soon" message using `PlaceholderPage`
- Rate board on homepage — shows fallback data from `client/src/data/fallbackRates.js` because the `/rates` endpoint doesn't exist yet

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
- Collections: `users`, `news`
- Seeded by `npm run seed` in the server directory

---

## Next steps

1. **Build the rates endpoint** — `GET /api/v1/rates` so the homepage shows live gold/silver prices
2. **Inventory module** — products, categories, stock
3. **Orders & exchanges** — customer transactions
4. **File upload** — images for news articles and products (already has an `uploads/` directory)
5. **Deploy** — change `JWT_SECRET` before pushing to production
