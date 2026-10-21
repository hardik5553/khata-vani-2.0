# StockSprint API Reference

Base URL: `http://localhost:3000/api/v1`

All request/response bodies are JSON unless otherwise noted.

---

## 1. Health Check

### GET /health
### GET /api/v1/health

Returns service status and version.

**Response (200):**
```json
{
  "status": "ok",
  "service": "stocksprint-backend",
  "version": "1.0.0",
  "timestamp": "2026-10-21T06:40:40.990Z"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

## 2. Products

### GET /api/v1/products

List products with optional search and low-stock filter.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Case-insensitive search by product name |
| `lowStock` | boolean | Filter to products at/below reorder threshold |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 50, max: 100) |

**Response (200):**
```json
{
  "products": [
    {
      "id": "ec56b04a-de79-4b25-acf3-ccb24370e882",
      "name": "Biscuit Packets",
      "category": "Snacks",
      "unit": "packet",
      "quantity": 15,
      "reorderThreshold": 10,
      "purchaseCost": 8.0,
      "sellingPrice": 12.0,
      "supplierId": null,
      "expiryDate": null,
      "lowStock": false,
      "createdAt": "2026-10-21T06:40:40.923Z",
      "updatedAt": "2026-10-21T06:40:40.923Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Example:**
```bash
# List all products
curl http://localhost:3000/api/v1/products

# Search by name
curl "http://localhost:3000/api/v1/products?search=biscuit"

# Low stock only
curl "http://localhost:3000/api/v1/products?lowStock=true"
```

### POST /api/v1/products

Create a new product.

**Request Body:**
```json
{
  "name": "Biscuit Packets",
  "category": "Snacks",
  "unit": "packet",
  "quantity": 15,
  "reorderThreshold": 10,
  "purchaseCost": 8.0,
  "sellingPrice": 12.0,
  "supplierId": "optional-supplier-id",
  "expiryDate": "2026-12-31T00:00:00Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name |
| `category` | string | No | Product category |
| `unit` | string | No | `piece`, `packet`, `kg`, or `litre` (default: `piece`) |
| `quantity` | number | No | Stock quantity, decimal-capable (default: 0) |
| `reorderThreshold` | number | No | Low-stock alert threshold (default: 0) |
| `purchaseCost` | number | No | Cost price |
| `sellingPrice` | number | No | Selling price |
| `supplierId` | string | No | Supplier reference |
| `expiryDate` | string | No | ISO-8601 datetime |

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Biscuit Packets",
  "category": "Snacks",
  "unit": "packet",
  "quantity": 15,
  "reorderThreshold": 10,
  "purchaseCost": 8.0,
  "sellingPrice": 12.0,
  "supplierId": null,
  "expiryDate": null,
  "lowStock": false,
  "createdAt": "2026-10-21T06:40:40.923Z",
  "updatedAt": "2026-10-21T06:40:40.923Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Rice","unit":"kg","quantity":20,"reorderThreshold":5,"purchaseCost":45,"sellingPrice":60}'
```

### GET /api/v1/products/:id

Get a single product by ID with recent transactions.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Biscuit Packets",
  ...
  "lowStock": false,
  "transactions": [
    {
      "id": "uuid",
      "type": "stock-in",
      "quantity": 15,
      "timestamp": "2026-10-21T06:40:40.923Z",
      "unitPrice": 8.0,
      "note": "Initial stock"
    }
  ]
}
```

**Response (404):** Product not found.

**Example:**
```bash
curl http://localhost:3000/api/v1/products/<product-id>
```

### PATCH /api/v1/products/:id

Partially update a product.

**Request Body:** Any subset of product fields (same as create).

**Response (200):** Updated product object.

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/products/<product-id> \
  -H "Content-Type: application/json" \
  -d '{"quantity": 12, "reorderThreshold": 8}'
```

### DELETE /api/v1/products/:id

Delete a product and all its transactions.

**Response (200):**
```json
{ "message": "Product deleted successfully" }
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/products/<product-id>
```

---

## 3. Sales & Stock Transactions

### POST /api/v1/transactions/sales

Record a sale. Atomically validates stock, decrements quantity, and creates a transaction record. Rejects overselling.

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 3,
  "soldPrice": 12.0,
  "timestamp": "2026-10-21T10:00:00Z",
  "note": "Cash sale"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | string | Yes | Product UUID |
| `quantity` | number | Yes | Must be > 0 and <= available stock |
| `soldPrice` | number | No | Price at which item was sold |
| `timestamp` | string | No | ISO-8601 datetime (default: now) |
| `note` | string | No | Optional note |

**Response (201):**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "sale",
    "quantity": 3,
    "timestamp": "2026-10-21T10:00:00Z",
    "unitPrice": 12.0,
    "note": "Cash sale"
  },
  "product": {
    "id": "uuid",
    "name": "Biscuit Packets",
    "quantity": 12,
    "unit": "packet"
  }
}
```

**Errors:**
- `409 INSUFFICIENT_STOCK` - Quantity exceeds available stock
  ```json
  {
    "error": {
      "code": "INSUFFICIENT_STOCK",
      "message": "Not enough stock available.",
      "details": { "available": 5, "requested": 10 }
    }
  }
  ```
- `404 PRODUCT_NOT_FOUND` - Product does not exist
- `400 VALIDATION_ERROR` - Invalid input

**Example:**
```bash
# Sell 3 biscuit packets from 15 (expect stock = 12)
curl -X POST http://localhost:3000/api/v1/transactions/sales \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-id>","quantity":3,"soldPrice":12}'
```

### POST /api/v1/transactions/stock-in

Record incoming stock. Atomically increments product quantity and creates a transaction.

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 10,
  "unitCost": 45.0,
  "supplier": "Wholesale Supplier",
  "timestamp": "2026-10-21T10:00:00Z",
  "note": "Monthly restock"
}
```

**Response (201):**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "stock-in",
    "quantity": 10,
    "timestamp": "2026-10-21T10:00:00Z",
    "unitPrice": 45.0,
    "note": "Supplier: Wholesale Supplier. Monthly restock"
  },
  "product": {
    "id": "uuid",
    "name": "Rice",
    "quantity": 30,
    "unit": "kg"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/transactions/stock-in \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-id>","quantity":10,"unitCost":45,"supplier":"Test Supplier"}'
```

### POST /api/v1/transactions/adjustments

Record a stock adjustment (positive or negative). Rejects adjustments that would result in negative stock.

**Request Body:**
```json
{
  "productId": "uuid",
  "delta": 5,
  "reason": "Found extra stock",
  "timestamp": "2026-10-21T10:00:00Z",
  "note": "Correction"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | string | Yes | Product UUID |
| `delta` | number | Yes | Positive or negative stock change (not zero) |
| `reason` | string | Yes | Reason for adjustment |
| `timestamp` | string | No | ISO-8601 datetime |
| `note` | string | No | Optional note |

**Response (201):**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "adjustment",
    "quantity": 5,
    "timestamp": "2026-10-21T10:00:00Z",
    "note": "Found extra stock"
  },
  "product": {
    "id": "uuid",
    "name": "Test Product",
    "quantity": 15,
    "unit": "piece"
  }
}
```

**Errors:**
- `409 NEGATIVE_STOCK` - Adjustment would result in negative stock
- `400 VALIDATION_ERROR` - Missing reason or zero delta

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/transactions/adjustments \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-id>","delta":-3,"reason":"Damaged goods"}'
```

### GET /api/v1/transactions

Get transaction history with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | ISO-8601 start date |
| `to` | string | ISO-8601 end date |
| `type` | string | `sale`, `stock-in`, `adjustment`, or `reversal` |
| `productId` | string | Filter by product UUID |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 50, max: 100) |

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Biscuit Packets",
      "productUnit": "packet",
      "type": "sale",
      "quantity": 3,
      "timestamp": "2026-10-21T10:00:00Z",
      "unitPrice": 12.0,
      "note": "Cash sale"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Example:**
```bash
# All transactions
curl http://localhost:3000/api/v1/transactions

# Only sales
curl "http://localhost:3000/api/v1/transactions?type=sale"

# Date range
curl "http://localhost:3000/api/v1/transactions?from=2026-10-01T00:00:00Z&to=2026-10-31T23:59:59Z"
```

---

## 4. Reorder Suggestions

### GET /api/v1/reorder-suggestions

Returns reorder recommendations for all products.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lookbackDays` | integer | 30 | Days of sales history to analyze |
| `leadTimeDays` | integer | 7 | Supplier lead time in days |
| `safetyStock` | number | 0 | Safety stock buffer |

**Response (200):**
```json
{
  "suggestions": [
    {
      "productId": "uuid",
      "productName": "Soap",
      "currentStock": 2,
      "unit": "piece",
      "reorderPoint": 7,
      "averageDailySales": 0.1,
      "leadTimeDays": 7,
      "safetyStock": 0,
      "suggestedOrderQty": 5,
      "reason": "Based on 2 units sold over 30 days (avg 0.07/day). Reorder point = 0.07 × 7 days + 0 safety stock.",
      "dataConfidence": "low",
      "fallbackUsed": false
    }
  ]
}
```

- `dataConfidence`: `high`, `medium`, or `low` based on sales history availability
- `fallbackUsed`: `true` when insufficient history exists and user-set threshold is used instead
- Items needing reorder (current stock <= reorder point) are listed first

**Example:**
```bash
curl "http://localhost:3000/api/v1/reorder-suggestions?lookbackDays=30&leadTimeDays=7&safetyStock=0"
```

---

## 5. Reports

### GET /api/v1/reports/summary

Sales and inventory summary for a date range.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | ISO-8601 start date (default: 7 days ago) |
| `to` | string | ISO-8601 end date (default: now) |

**Response (200):**
```json
{
  "period": { "from": "2026-10-14", "to": "2026-10-21" },
  "totalProducts": 3,
  "lowStockCount": 1,
  "totalSales": 3,
  "totalSalesCount": 1,
  "estimatedStockValue": 735.0,
  "estimatedGrossMargin": 15.0,
  "costDataAvailable": true,
  "fastMovingProducts": [
    { "productId": "uuid", "productName": "Biscuit Packets", "quantitySold": 3, "unit": "packet" }
  ],
  "dailySales": [
    { "date": "2026-10-21", "sales": 3, "count": 1 }
  ],
  "note": "Estimated gross margin calculated using available purchase cost data."
}
```

- `estimatedGrossMargin` is only calculated when purchase cost data exists
- `costDataAvailable` is `false` when cost data is missing for products
- `note` explains when margin cannot be estimated

**Example:**
```bash
curl "http://localhost:3000/api/v1/reports/summary?from=2026-10-01&to=2026-10-31"
```

---

## 6. Backup

### GET /api/v1/reports/export

Export all product and transaction data as JSON or CSV.

**Query Parameters:**
| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| `format` | string | `json` or `csv` | `json` |

**Response (JSON, 200):**
```json
{
  "schemaVersion": "1.0.0",
  "exportedAt": "2026-10-21T06:40:40.923Z",
  "products": [
    {
      "id": "uuid",
      "name": "Rice",
      "category": "Staple",
      "unit": "kg",
      "quantity": 20,
      "reorderThreshold": 5,
      "purchaseCost": 45.0,
      "sellingPrice": 60.0,
      "supplierId": null,
      "expiryDate": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "transactions": [
    {
      "id": "uuid",
      "productId": "uuid",
      "type": "stock-in",
      "quantity": 20,
      "timestamp": "...",
      "unitPrice": 45.0,
      "note": "Initial stock"
    }
  ]
}
```

**Response (CSV, 200):** `text/csv` with `Content-Disposition: attachment`

**Example:**
```bash
# JSON export
curl http://localhost:3000/api/v1/reports/export?format=json -o backup.json

# CSV export
curl http://localhost:3000/api/v1/reports/export?format=csv -o backup.csv
```

### POST /api/v1/reports/import/validate

Validate a backup JSON before import. Does not modify data.

**Request Body:**
```json
{
  "jsonData": "{ \"schemaVersion\": \"1.0.0\", ... }"
}
```

**Response (200):**
```json
{
  "valid": true,
  "errors": [],
  "productCount": 3,
  "transactionCount": 5
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/reports/import/validate \
  -H "Content-Type: application/json" \
  -d '{"jsonData":"{...}"}'
```

---

## 7. Error Format

All errors use a consistent JSON envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... },
    "requestId": "uuid"
  }
}
```

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request input |
| 404 | `NOT_FOUND` / `PRODUCT_NOT_FOUND` | Resource not found |
| 409 | `INSUFFICIENT_STOCK` | Sale exceeds available stock |
| 409 | `NEGATIVE_STOCK` | Adjustment would make stock negative |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

**Example:**
```bash
# Overselling attempt returns 409
curl -s -w "\nHTTP: %{http_code}" -X POST http://localhost:3000/api/v1/transactions/sales \
  -H "Content-Type: application/json" \
  -d '{"productId":"<id>","quantity":999}'
```

---

## 8. Sample Seed Data

After running `npm run prisma:seed`:

| Product | Quantity | Unit | Purchase Cost | Selling Price | Reorder Threshold |
|---------|----------|------|---------------|---------------|-------------------|
| Rice | 20 | kg | 45.0 | 60.0 | 5 |
| Biscuit Packets | 15 | packet | 8.0 | 12.0 | 10 |
| Soap | 8 | piece | 15.0 | 25.0 | 5 |

**Acceptance test:** Sell 3 biscuit packets from 15 → stock = 12.

```bash
curl -X POST http://localhost:3000/api/v1/transactions/sales \
  -H "Content-Type: application/json" \
  -d '{"productId":"<biscuit-product-id>","quantity":3,"soldPrice":12}'
# Response: product.quantity = 12
```
