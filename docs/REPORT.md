# Final Year Project Report Material

## Jewelry Management System

---

## 1. System Overview

The Jewelry Management System is a full-stack web application designed for jewelry retail businesses in Nepal. It provides a customer-facing storefront for browsing products and reading market updates, plus an administrative console for managing inventory, publishing metal rates, and creating content.

**Key innovation:** The system uses a live pricing architecture where product prices are computed per-request from daily metal rates rather than stored in the database. This ensures prices always reflect the current market without manual updates to every product.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Storefront   │  │  News Pages │  │  Admin Console  │  │
│  │  (Collection,  │  │  (Browse,   │  │  (Products,     │  │
│  │   Product      │  │   Detail)   │  │   Rates, News)  │  │
│  │   Detail)      │  │             │  │                 │  │
│  └────────────────┘  └─────────────┘  └─────────────────┘  │
│            React 18 + Vite + Tailwind CSS 4                 │
└─────────────────────────────────────────────────────────────┘
                              ↕
                     HTTPS / REST API
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Auth         │  │  Products   │  │  Rates & News   │  │
│  │  Controllers   │  │  Controller │  │  Controllers    │  │
│  └────────────────┘  └─────────────┘  └─────────────────┘  │
│                                                              │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Auth         │  │  Error      │  │  Pricing        │  │
│  │  Middleware    │  │  Handler    │  │  Utility        │  │
│  └────────────────┘  └─────────────┘  └─────────────────┘  │
│               Node.js + Express.js                          │
└─────────────────────────────────────────────────────────────┘
                              ↕
                       Mongoose ODM
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │     Users      │  │   Products  │  │     Rates       │  │
│  │   Collection   │  │  Collection │  │   Collection    │  │
│  └────────────────┘  └─────────────┘  └─────────────────┘  │
│                                                              │
│  ┌────────────────┐                                         │
│  │     News       │                                         │
│  │   Collection   │                                         │
│  └────────────────┘                                         │
│                      MongoDB                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

**Public Product Browse:**
1. Client requests `/api/v1/products?category=ring&metal=gold`
2. `attachUser` middleware checks for optional auth
3. Controller queries products with access-level filtering
4. For each product, `priceProduct()` computes live pricing from rate board
5. Response includes products with embedded `pricing` object
6. Client renders catalogue with current prices

**Admin Rate Publish:**
1. Staff logs in, receives JWT token
2. Client sends `POST /api/v1/rates` with new rate
3. `protect` middleware validates JWT
4. `authorize(['admin', 'staff'])` checks role
5. Controller upserts rate by `(category, effectiveDate)`
6. Pre-save hook computes `changeAmount` and `changePercent` from previous day
7. Response returns saved rate
8. All subsequent product requests use the new rate

---

## 3. Database Schema

### 3.1 User Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, indexed),
  password: String (required, bcrypt hashed),
  phone: String,
  role: Enum['customer', 'staff', 'admin'] (default: 'customer'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email: 1` (unique)

**Business rules:**
- Passwords hashed with bcrypt (10 rounds) via pre-save hook
- Email validation via regex pattern
- Default role is `customer`; admins are seeded

---

### 3.2 Product Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  slug: String (unique, indexed),
  description: String,
  category: Enum[ring, necklace, bracelet, earring, pendant, chain, bangle, set] (required),
  metal: Enum[gold, silver] (required),
  purity: Enum[FINE_GOLD_9999, TEJABI_GOLD, HALLMARK_GOLD, SILVER] (required),
  grossWeight: Number (grams, required),
  netWeight: Number (grams, required),
  stoneWeight: Number (grams, default: 0),
  makingCharge: Number (NPR, required),
  stoneValue: Number (NPR, default: 0),
  sku: String,
  stockQuantity: Number (default: 0),
  coverImage: String,
  craftNotes: String,
  hallmarkId: String,
  status: Enum[available, reserved, sold, discontinued] (default: 'available'),
  isFeatured: Boolean (default: false),
  createdBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug: 1` (unique)
- `category: 1, metal: 1, status: 1`
- `isFeatured: 1, status: 1`

**Business rules:**
- Slug auto-generated from name + 8-char timestamp suffix via pre-save hook
- `netWeight` must be ≤ `grossWeight`
- **No price field** — prices computed per-request from `purity` → rate lookup

**Virtual field:**
- `pricing` (not stored) — computed by `priceProduct()` utility

---

### 3.3 Rate Schema

```javascript
{
  _id: ObjectId,
  metal: Enum[gold, silver] (required),
  category: Enum[FINE_GOLD_9999, TEJABI_GOLD, HALLMARK_GOLD, SILVER] (required),
  label: String,
  purityLabel: String,
  ratePerTola: Number (NPR, required),
  changeAmount: Number (NPR),
  changePercent: Number,
  currency: String (default: 'NPR'),
  effectiveDate: Date (required, indexed),
  source: String,
  publishedBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `category: 1, effectiveDate: -1` (compound, unique)
- `metal: 1, effectiveDate: -1`

**Business rules:**
- Upsert by `(category, effectiveDate)` to prevent duplicates per day
- Pre-save hook fetches previous day's rate and computes `changeAmount` and `changePercent`
- 1 tola = 11.6638 grams (constant)

---

### 3.4 News Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (unique, indexed),
  summary: String (required),
  content: String (required),
  category: Enum[gold_market, silver_market, industry, shop_update, general],
  language: Enum[en, ne] (default: 'en'),
  tags: [String],
  coverImage: String,
  source: String,
  status: Enum[draft, published, archived] (default: 'draft'),
  isFeatured: Boolean (default: false),
  publishedAt: Date,
  views: Number (default: 0),
  author: ObjectId → User (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug: 1` (unique)
- `status: 1, publishedAt: -1`
- `category: 1, status: 1`

**Business rules:**
- Slug auto-generated from title + timestamp suffix
- `publishedAt` set to now when status changes to `published`
- View count incremented on each read (published articles only)

---

## 4. Core Modules

### 4.1 Authentication Module

**Files:**
- `server/src/controllers/auth.controller.js`
- `server/src/middleware/auth.js`

**Features:**
- JWT-based authentication
- Role-based access control (customer, staff, admin)
- Bcrypt password hashing
- Token delivery via cookie + response body
- Session restore via `/auth/me`

**Flow:**
1. User submits email + password
2. Controller finds user, compares password with bcrypt
3. Signs JWT with user ID and role (7-day expiry)
4. Sets HTTP-only cookie + returns token in body
5. Client stores token in localStorage as fallback
6. Subsequent requests include `Authorization: Bearer <token>`
7. `protect` middleware verifies token, attaches `req.user`
8. `authorize([roles])` middleware checks `req.user.role`

---

### 4.2 Product Module

**Files:**
- `server/src/controllers/product.controller.js`
- `server/src/models/Product.js`
- `server/src/utils/pricing.js`

**Features:**
- Live pricing from rate board
- Public catalogue with filters (category, metal, purity, search)
- Admin CRUD with role gates
- Soft-delete (discontinue) by default

**Live Pricing Algorithm:**

```javascript
function priceProduct(product, rateMap) {
  const rate = rateMap[product.purity];
  if (!rate?.ratePerTola) return { /* all null */ };
  
  const ratePerGram = rate.ratePerTola / TOLA_IN_GRAMS; // 11.6638
  const metalValue = ratePerGram * product.netWeight;
  const totalPrice = metalValue + product.makingCharge + product.stoneValue;
  
  return {
    ratePerTola: rate.ratePerTola,
    ratePerGram: Math.round(ratePerGram),
    metalValue: Math.round(metalValue),
    makingCharge: product.makingCharge,
    stoneValue: product.stoneValue,
    totalPrice: Math.round(totalPrice),
    pricedAt: rate.effectiveDate,
  };
}
```

**Why this design:**
- Jewelry stores publish new metal rates every morning
- Storing prices would require batch-updating every product daily
- Computed prices are always current and reflect market movements
- Transparent breakdown builds customer trust

**Query optimization:**
- Rate board fetched once per request and converted to a map
- Products queried with compound indexes
- Price sorting done in-memory after attachment (cannot sort in DB)

---

### 4.3 Rate Module

**Files:**
- `server/src/controllers/rate.controller.js`
- `server/src/models/Rate.js`

**Features:**
- Daily rate publishing by admin/staff
- Automatic change calculation from previous day
- History view with date-range filters
- `/rates/today` endpoint for public homepage widget

**Change Calculation (Pre-save Hook):**

```javascript
rateSchema.pre('save', async function(next) {
  if (!this.isModified('ratePerTola')) return next();
  
  const yesterday = new Date(this.effectiveDate);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const prevRate = await Rate.findOne({
    category: this.category,
    effectiveDate: { $lte: yesterday },
  }).sort({ effectiveDate: -1 });
  
  if (prevRate) {
    this.changeAmount = this.ratePerTola - prevRate.ratePerTola;
    this.changePercent = (this.changeAmount / prevRate.ratePerTola) * 100;
  }
  
  next();
});
```

---

### 4.4 News Module

**Files:**
- `server/src/controllers/news.controller.js`
- `server/src/models/News.js`

**Features:**
- Article publishing with draft/published/archived workflow
- Public users see only published articles
- Staff see all statuses for management
- View tracking
- Multi-language support (English, Nepali)
- Category filtering (gold market, silver market, shop updates)

---

## 5. Frontend Architecture

### 5.1 Technology Stack

- **React 18** — component framework
- **Vite** — build tool + dev server
- **React Router 6** — client-side routing
- **TanStack Query (React Query)** — server state management
- **Tailwind CSS 4** — utility-first styling
- **Axios** — HTTP client

### 5.2 State Management Strategy

**Server state (TanStack Query):**
- Products, rates, news fetched via `useQuery`
- Mutations (`useMutation`) for create/update/delete
- Automatic cache invalidation on mutations
- `placeholderData: keepPreviousData` for smooth pagination

**Client state (React Context):**
- `AuthContext` — user session, login/logout
- `ToastContext` — success/error notifications

**Form state:**
- `useState` for controlled inputs
- No form library — simple validation in submit handlers

### 5.3 Key Pages

**Public:**
- `/` — Home (featured products, latest rates, news strip)
- `/collection` — Product catalogue with filters
- `/collection/:slug` — Product detail with price breakdown
- `/rates` — Rate board with historical chart
- `/news` — News list
- `/news/:slug` — Article detail

**Admin:**
- `/admin` — Dashboard with stats
- `/admin/products` — Product table with filters
- `/admin/products/new` — Create product form
- `/admin/products/:id/edit` — Edit product form
- `/admin/rates` — Rate publishing table
- `/admin/news` — News management

### 5.4 Routing & Protection

```javascript
<Route path="/admin" element={
  <ProtectedRoute roles={['admin', 'staff']}>
    <DashboardLayout />
  </ProtectedRoute>
}>
  {/* admin children inherit the gate */}
</Route>
```

`ProtectedRoute` checks `AuthContext` and redirects to `/login` if:
- No user session exists
- User role not in allowed roles

---

## 6. API Design

**REST principles:**
- Resources mapped to endpoints (`/products`, `/rates`, `/news`)
- HTTP verbs for actions (GET, POST, PUT, DELETE)
- Status codes (200, 201, 400, 401, 403, 404, 500)
- Pagination via `?page=1&limit=12`

**Response envelope:**

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": { /* payload */ },
  "meta": { /* pagination */ }
}
```

**Error envelope:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error details"]
}
```

**Authentication:**
- JWT in `Authorization: Bearer <token>` header
- Fallback: `token` cookie

---

## 7. Security Features

### 7.1 Authentication & Authorization

- Passwords hashed with bcrypt (cost factor 10)
- JWT signed with `HS256` algorithm
- Token expiry enforced (7 days)
- HTTP-only cookies prevent XSS token theft
- Role-based middleware gates admin routes

### 7.2 Input Validation

- Mongoose schema validation (required fields, enums, min/max)
- Email regex validation
- Mongoose unique indexes prevent duplicates
- Weight constraints (`netWeight ≤ grossWeight`)

### 7.3 Error Handling

- Centralized error middleware
- `ApiError` class for controlled exceptions
- Stack traces only in development
- Generic 500 messages in production

### 7.4 CORS

- Configured in `server.js` with explicit `CLIENT_URL` origin
- Credentials allowed for cookie transmission

---

## 8. Deployment Considerations

### 8.1 Environment Variables

**Development:**
```env
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/jewelry_management
JWT_SECRET=dev_only_secret_change_before_deploying
```

**Production:**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/jewelry_prod
JWT_SECRET=<strong-random-256-bit-secret>
CLIENT_URL=https://yourdomain.com
```

### 8.2 Build & Serve

1. Build frontend: `cd client && npm run build`
2. Serve `client/dist/` as static files (Nginx, Vercel, Netlify)
3. Run backend with `npm start` (or PM2, Docker)
4. Use reverse proxy to route `/api` to backend

### 8.3 Database

- Use MongoDB Atlas or hosted instance
- Enable authentication
- Whitelist application server IPs
- Regular backups

### 8.4 Additional Security (Production)

- Rate limiting (express-rate-limit)
- Helmet.js for security headers
- HTTPS only
- Environment variable validation on startup
- Rotate JWT secret periodically

---

## 9. Testing Strategy

### 9.1 Manual Testing Performed

- User registration and login flows
- Product CRUD via admin console
- Live price calculation verified against manual computation
- Rate publishing and change calculation
- Filtering and pagination on all list pages
- Role-based access (staff cannot access admin-only routes)
- Slug uniqueness enforcement

### 9.2 Recommended Automated Testing

**Unit tests:**
- `priceProduct()` utility with various rate scenarios
- Bcrypt password hashing/comparison
- Slug generation uniqueness

**Integration tests:**
- Auth flow (register → login → protected route)
- Product creation → fetch with pricing
- Rate upsert → duplicate prevention

**E2E tests (Playwright/Cypress):**
- Customer browses catalogue → views product
- Admin logs in → publishes rate → creates product → sees updated price
- News article creation → publish → public view

---

## 10. Future Enhancements

### 10.1 Planned Features

- **Orders module** — customers reserve products, staff process orders
- **Inventory tracking** — stock alerts, audit trail
- **Image upload** — Cloudinary/S3 integration for product photos
- **Customer accounts** — order history, saved items
- **Search improvements** — Algolia or Elasticsearch for fuzzy search
- **Rate history chart** — visual trend on `/rates` page
- **Multi-currency** — USD pricing for international customers

### 10.2 Performance Optimizations

- Redis cache for rate board (reduce DB queries)
- CDN for static assets
- Image optimization (WebP, responsive sizes)
- Database read replicas for public queries

### 10.3 Business Logic Extensions

- **Dynamic making charges** — percentage-based instead of flat fee
- **Discounts and promotions** — seasonal pricing rules
- **Custom orders** — customer submits design, staff quotes
- **Hallmark verification** — BIS API integration

---

## 11. Lessons Learned

### 11.1 Design Decisions

**Live pricing over stored prices:**
- Initially considered storing prices and running a daily batch update
- Rejected: batch jobs can fail, prices could be stale mid-day
- Chosen: compute per-request for guaranteed accuracy
- Trade-off: cannot sort by price in database (acceptable for small catalogue)

**Slug generation with timestamps:**
- Product names are not unique (multiple sizes of same design)
- Appending 8-char timestamp ensures uniqueness
- Human-readable URLs preserved

**Soft-delete by default:**
- Hard-deleting products breaks order history
- Discontinue status hides from public but preserves records
- Admin can hard-delete with `?permanent=true` flag

### 11.2 Challenges Overcome

**Challenge:** Price sorting performance
- Problem: Cannot use MongoDB index on computed field
- Solution: Sort in-memory after pricing attachment; limit page size to 50

**Challenge:** Rate change calculation
- Problem: Finding "previous day" rate when rates are published irregularly
- Solution: Query `effectiveDate <= yesterday` sorted descending, take first

**Challenge:** Role-based rendering
- Problem: Some UI elements visible only to staff
- Solution: `AuthContext` exposes `hasRole(role)` helper used in JSX

---

## 12. References

- MongoDB Documentation: https://docs.mongodb.com/
- Express.js Guide: https://expressjs.com/
- React Documentation: https://react.dev/
- JWT Introduction: https://jwt.io/introduction
- Nepal Gold/Silver Market: FENEGOSIDA (Federation of Nepal Gold and Silver Dealers' Association)

---

## Appendix A: Sample Data

**Sample Product:**
```json
{
  "name": "Classic Hallmark Wedding Band",
  "category": "ring",
  "metal": "gold",
  "purity": "HALLMARK_GOLD",
  "grossWeight": 6.2,
  "netWeight": 6.2,
  "makingCharge": 4500,
  "stoneWeight": 0,
  "stoneValue": 0,
  "sku": "JMS-RNG-001"
}
```

**Sample Rate:**
```json
{
  "metal": "gold",
  "category": "HALLMARK_GOLD",
  "label": "Hallmark gold",
  "purityLabel": "916 · 22K",
  "ratePerTola": 261400,
  "effectiveDate": "2026-08-05T00:00:00.000Z",
  "source": "FENEGOSIDA"
}
```

**Computed Pricing:**
```json
{
  "ratePerTola": 261400,
  "ratePerGram": 22411,
  "metalValue": 138949,
  "makingCharge": 4500,
  "stoneValue": 0,
  "totalPrice": 143449,
  "pricedAt": "2026-08-05T00:00:00.000Z"
}
```

**Calculation:**
- Rate per gram = 261400 / 11.6638 = 22411
- Metal value = 22411 × 6.2 = 138949
- Total price = 138949 + 4500 + 0 = 143449 NPR

---

## Appendix B: File Structure

```
Final-Year-Project/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Button, Card, Input, Table
│   │   │   ├── layout/          # Navbar, Footer, Sidebar
│   │   │   └── products/        # ProductForm, ProductCard
│   │   ├── pages/
│   │   │   ├── admin/           # Admin pages
│   │   │   ├── Home.jsx
│   │   │   ├── Collection.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── router.jsx       # Route definitions
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/            # API clients
│   │   ├── context/             # Auth, Toast contexts
│   │   ├── hooks/               # useAuth, useToast
│   │   ├── config/              # Constants, options
│   │   ├── utils/               # formatters, validators
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routes
│   │   ├── middleware/          # auth, error handlers
│   │   ├── utils/               # pricing, ApiError
│   │   ├── seed/                # Database seeder
│   │   ├── config/              # db.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── docs/
│   ├── API.md                   # API reference
│   └── REPORT.md                # This file
│
├── README.md
├── QUICKSTART.md
└── .gitignore
```
