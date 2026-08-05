# API Documentation

Base URL: `http://localhost:5000/api/v1` (development)

All endpoints return JSON with this structure:

```json
{
  "success": true,
  "message": "Description of the result",
  "data": { /* response payload */ },
  "meta": { /* pagination metadata (optional) */ }
}
```

---

## Authentication

### Register

**POST** `/auth/register`

Create a new user account.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+977-1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login

**POST** `/auth/login`

Authenticate and receive a JWT token.

**Request body:**
```json
{
  "email": "admin@aureliajewels.com",
  "password": "Admin@12345"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Store Admin",
      "email": "admin@aureliajewels.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

The token can be sent in:
- Authorization header: `Bearer <token>`
- Cookie: `token=<token>`

---

### Get Current User

**GET** `/auth/me`

Fetch the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User fetched",
  "data": {
    "_id": "...",
    "name": "Store Admin",
    "email": "admin@aureliajewels.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
}
```

---

### Logout

**POST** `/auth/logout`

Clears the token cookie (client should also delete localStorage token).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Products

### List Products

**GET** `/products`

Paginated product list with filters. Public users see only `available` and `reserved` products; staff see all statuses.

**Query parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12, max: 50)
- `category` (ring | necklace | bracelet | earring | pendant | chain | bangle | set)
- `metal` (gold | silver)
- `purity` (FINE_GOLD_9999 | TEJABI_GOLD | HALLMARK_GOLD | SILVER)
- `status` (available | reserved | sold | discontinued | all) — staff only
- `search` (text search on name and description)
- `featured` (true | false)
- `sort` (newest | price_asc | price_desc | weight_asc | weight_desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Products fetched",
  "data": [
    {
      "_id": "...",
      "name": "Classic Hallmark Wedding Band",
      "slug": "classic-hallmark-wedding-band-msfv0qzz",
      "description": "A plain, comfortable-fit band in 22K hallmark gold...",
      "category": "ring",
      "metal": "gold",
      "purity": "HALLMARK_GOLD",
      "grossWeight": 6.2,
      "netWeight": 6.2,
      "makingCharge": 4500,
      "stoneWeight": 0,
      "stoneValue": 0,
      "sku": "JMS-RNG-001",
      "stockQuantity": 8,
      "coverImage": "",
      "craftNotes": "Hand-finished and polished. Sizing included.",
      "hallmarkId": "",
      "status": "available",
      "isFeatured": true,
      "pricing": {
        "ratePerTola": 261400,
        "ratePerGram": 22411,
        "metalValue": 138949,
        "makingCharge": 4500,
        "stoneValue": 0,
        "totalPrice": 143449,
        "pricedAt": "2026-08-04T18:15:00.000Z"
      },
      "createdAt": "2026-08-05T09:03:31.230Z",
      "updatedAt": "2026-08-05T09:03:31.230Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 8,
    "totalPages": 1
  }
}
```

**Pricing note:** The `pricing` block is computed per request from the current rate board. If no rate has been published for the product's purity, all price fields are `null`.

---

### Featured Products

**GET** `/products/featured`

Small payload for the home page widget.

**Query parameters:**
- `limit` (number, default: 4, max: 12)

**Response:** `200 OK` — same structure as `/products`, but only featured items.

---

### Single Product

**GET** `/products/:slug`

Fetch one product by its slug (or ObjectId for admin editing).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product fetched",
  "data": {
    "_id": "...",
    "name": "Classic Hallmark Wedding Band",
    "slug": "classic-hallmark-wedding-band-msfv0qzz",
    "description": "A plain, comfortable-fit band in 22K hallmark gold...",
    "category": "ring",
    "metal": "gold",
    "purity": "HALLMARK_GOLD",
    "grossWeight": 6.2,
    "netWeight": 6.2,
    "makingCharge": 4500,
    "stoneWeight": 0,
    "stoneValue": 0,
    "sku": "JMS-RNG-001",
    "stockQuantity": 8,
    "coverImage": "",
    "craftNotes": "Hand-finished and polished. Sizing included.",
    "hallmarkId": "",
    "status": "available",
    "isFeatured": true,
    "pricing": {
      "ratePerTola": 261400,
      "ratePerGram": 22411,
      "metalValue": 138949,
      "makingCharge": 4500,
      "stoneValue": 0,
      "totalPrice": 143449,
      "pricedAt": "2026-08-04T18:15:00.000Z"
    },
    "createdBy": {
      "_id": "...",
      "name": "Store Admin"
    },
    "createdAt": "2026-08-05T09:03:31.230Z",
    "updatedAt": "2026-08-05T09:03:31.230Z"
  }
}
```

---

### Create Product

**POST** `/products`

**Auth required:** Admin or Staff

**Request body:**
```json
{
  "name": "Classic Hallmark Wedding Band",
  "description": "A plain, comfortable-fit band in 22K hallmark gold...",
  "category": "ring",
  "metal": "gold",
  "purity": "HALLMARK_GOLD",
  "grossWeight": 6.2,
  "netWeight": 6.2,
  "makingCharge": 4500,
  "stoneWeight": 0,
  "stoneValue": 0,
  "stockQuantity": 8,
  "sku": "JMS-RNG-001",
  "coverImage": "",
  "craftNotes": "Hand-finished and polished. Sizing included.",
  "hallmarkId": "",
  "status": "available",
  "isFeatured": true
}
```

**Required fields:** `name`, `category`, `metal`, `purity`, `grossWeight`, `netWeight`, `makingCharge`

**Response:** `201 Created` — returns the created product with pricing.

---

### Update Product

**PUT** `/products/:id`

**Auth required:** Admin or Staff

**Request body:** Same as create, but all fields are optional.

**Response:** `200 OK` — returns the updated product with pricing.

---

### Delete Product

**DELETE** `/products/:id?permanent=false`

**Auth required:** Admin

By default, marks the product as `discontinued`. Pass `?permanent=true` to hard-delete.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product discontinued"
}
```

---

## Rates

### Today's Rates

**GET** `/rates/today`

Returns the most recent rate for each purity category. Used by the home page board.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Rates fetched",
  "data": [
    {
      "_id": "...",
      "metal": "gold",
      "category": "FINE_GOLD_9999",
      "label": "Fine gold",
      "purityLabel": "9999 · 24K",
      "ratePerTola": 285000,
      "changeAmount": 1000,
      "changePercent": 0.35,
      "currency": "NPR",
      "effectiveDate": "2026-08-05T00:00:00.000Z",
      "source": "seed",
      "publishedBy": "...",
      "createdAt": "2026-08-05T09:03:31.195Z"
    },
    {
      "_id": "...",
      "metal": "gold",
      "category": "HALLMARK_GOLD",
      "label": "Hallmark gold",
      "purityLabel": "916 · 22K",
      "ratePerTola": 261400,
      "changeAmount": 900,
      "changePercent": 0.35,
      "currency": "NPR",
      "effectiveDate": "2026-08-05T00:00:00.000Z",
      "source": "seed"
    },
    {
      "_id": "...",
      "metal": "silver",
      "category": "SILVER",
      "label": "Silver",
      "purityLabel": "Fine silver",
      "ratePerTola": 3520,
      "changeAmount": -15,
      "changePercent": -0.42,
      "currency": "NPR",
      "effectiveDate": "2026-08-05T00:00:00.000Z"
    }
  ]
}
```

---

### Rate History

**GET** `/rates/history`

Paginated history for the admin table.

**Query parameters:**
- `page`, `limit`
- `metal` (gold | silver)
- `category` (FINE_GOLD_9999 | TEJABI_GOLD | HALLMARK_GOLD | SILVER)
- `from`, `to` (ISO date strings for effectiveDate range)

**Response:** `200 OK` — paginated list with `meta`.

---

### Upsert Rate

**POST** `/rates`

**Auth required:** Admin or Staff

Publishes or updates a rate. Upserts by `(category, effectiveDate)` so republishing the same day overwrites rather than duplicating. The `changeAmount` and `changePercent` are computed automatically from the previous day's rate.

**Request body:**
```json
{
  "metal": "gold",
  "category": "HALLMARK_GOLD",
  "label": "Hallmark gold",
  "purityLabel": "916 · 22K",
  "ratePerTola": 261400,
  "effectiveDate": "2026-08-05",
  "source": "FENEGOSIDA"
}
```

**Required fields:** `metal`, `category`, `ratePerTola`

**Response:** `200 OK` — returns the saved rate.

---

### Update Rate

**PUT** `/rates/:id`

**Auth required:** Admin or Staff

Edit an existing rate entry. Allowed fields: `label`, `purityLabel`, `ratePerTola`, `source`. If `ratePerTola` changes, the change values are recomputed.

**Response:** `200 OK`

---

### Delete Rate

**DELETE** `/rates/:id`

**Auth required:** Admin

Hard-deletes a rate entry.

**Response:** `200 OK`

---

## News

### List News

**GET** `/news`

Paginated news list. Public users see only `published` articles; staff see all statuses.

**Query parameters:**
- `page`, `limit`
- `category` (gold_market | silver_market | industry | shop_update | general)
- `language` (en | ne)
- `tag` (any tag string)
- `search` (text search on title and summary)
- `featured` (true | false)
- `status` (draft | published | archived | all) — staff only

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "News fetched",
  "data": [
    {
      "_id": "...",
      "title": "Gold holds near record as festive demand builds",
      "slug": "gold-holds-near-record-as-festive-demand-builds-...",
      "summary": "Fine gold closed steady this week...",
      "category": "gold_market",
      "language": "en",
      "tags": ["gold", "fenegosida"],
      "coverImage": "",
      "status": "published",
      "isFeatured": true,
      "publishedAt": "2026-08-05T09:03:31.186Z",
      "views": 0,
      "author": {
        "_id": "...",
        "name": "Store Admin"
      },
      "createdAt": "2026-08-05T09:03:31.186Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### Latest News

**GET** `/news/latest?limit=3`

Small payload for the home page strip.

**Response:** `200 OK` — array of the newest published articles (title, slug, summary, category, coverImage, publishedAt).

---

### Single Article

**GET** `/news/:slug`

Fetch one article by slug (or ObjectId). Increments the view count if the article is published.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "News article fetched",
  "data": {
    "_id": "...",
    "title": "Gold holds near record as festive demand builds",
    "slug": "gold-holds-near-record-as-festive-demand-builds-...",
    "summary": "Fine gold closed steady this week...",
    "content": "Fine gold has held close to its record level...",
    "category": "gold_market",
    "language": "en",
    "tags": ["gold", "fenegosida"],
    "coverImage": "",
    "source": "",
    "status": "published",
    "isFeatured": true,
    "publishedAt": "2026-08-05T09:03:31.186Z",
    "views": 1,
    "author": {
      "_id": "...",
      "name": "Store Admin"
    },
    "createdAt": "2026-08-05T09:03:31.186Z",
    "updatedAt": "2026-08-05T09:03:31.186Z"
  }
}
```

---

### Create Article

**POST** `/news`

**Auth required:** Admin

**Request body:**
```json
{
  "title": "Gold holds near record as festive demand builds",
  "summary": "Fine gold closed steady this week...",
  "content": "Fine gold has held close to its record level...",
  "category": "gold_market",
  "language": "en",
  "tags": ["gold", "fenegosida"],
  "coverImage": "",
  "source": "",
  "status": "published",
  "isFeatured": true
}
```

**Required fields:** `title`, `summary`, `content`

**Response:** `201 Created` — returns the created article.

---

### Update Article

**PUT** `/news/:id`

**Auth required:** Admin

**Request body:** Same as create, but all fields are optional.

**Response:** `200 OK` — returns the updated article.

---

### Delete Article

**DELETE** `/news/:id?permanent=false`

**Auth required:** Admin

By default, archives the article. Pass `?permanent=true` to hard-delete.

**Response:** `200 OK`

---

## Error Responses

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

**Common status codes:**
- `400 Bad Request` — validation error, missing required fields
- `401 Unauthorized` — authentication required or token invalid
- `403 Forbidden` — insufficient permissions
- `404 Not Found` — resource not found
- `409 Conflict` — duplicate SKU, email, etc.
- `500 Internal Server Error` — unexpected server error

---

## Notes

- **1 tola = 11.6638 grams**. Rates are per tola; products are weighed in grams.
- **All dates** are ISO 8601 strings in UTC.
- **Prices are in NPR** (Nepalese Rupees), no decimals.
- **Product prices are never stored** — they are computed per request from the rate board.
