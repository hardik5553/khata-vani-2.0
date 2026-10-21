# StockSprint Backend Implementation Summary

## Overview
Backend API for StockSprint hackathon - offline-first inventory and sales system for kirana stores.

## Technology Stack
- Node.js with TypeScript
- Express.js web framework
- Prisma ORM with SQLite database
- Zod for input validation

## API Endpoints

### Product & Inventory Management
- `GET /api/v1/products` - List products with search, low-stock filtering, pagination
- `GET /api/v1/products/:id` - Get product by ID with transaction history
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Sales Operations
- `POST /api/v1/transactions/sales` - Record a sale (validates stock, decrements quantity)
- `POST /api/v1/transactions/stock-in` - Record stock-in (increments quantity)
- `POST /api/v1/transactions/adjustments` - Record stock adjustment with reason
- `GET /api/v1/transactions` - Get transaction history with filtering by type, product, date range

### Low-Stock & Reorder
- `GET /api/v1/products/reorder-suggestions` - Get products needing reorder with suggestions
- `GET /api/v1/products?lowStock=true` - Filter low-stock products

### Reports
- `GET /api/v1/reports/summary` - Sales summary for a period with gross margin estimation
- `GET /api/v1/reports/low-stock` - Low stock report
- `GET /api/v1/reports/export?format=json|csv` - Data backup export

### Settings
- `GET /api/v1/settings` - Get application settings
- `PUT /api/v1/settings` - Update application settings

### Health
- `GET /health` - Health check endpoint
- `GET /api/v1/health` - Health check at versioned path

## Key Features Implemented
1. **Atomic transactions** - All sales/stock-in/adjustments use Prisma `$transaction` for data consistency
2. **Stock validation** - Prevents overselling, negative stock, rejects invalid adjustments
3. **Low-stock detection** - Automatic flagging when quantity <= reorder threshold
4. **Reorder suggestions** - Calculated based on sales history, lead time, and safety stock
5. **Transaction history** - Full audit trail with product details
6. **Backup & export** - JSON and CSV export of all data
7. **Input validation** - Zod schemas for all API requests
8. **Error handling** - Structured error responses with codes and details
9. **CORS & Helmet** - Security headers and cross-origin policies
10. **Nemotron AI service integration** - Configurable AI explanation service (optional)

## Database Schema
- `Product` - id, name, category, unit, quantity, reorderThreshold, purchaseCost, sellingPrice, supplierId, expiryDate, timestamps
- `Transaction` - id, productId, type (sale|stock-in|adjustment|reversal), quantity, unitPrice, timestamp, note
- `Settings` - id, shopName, language, defaultUnits, backupPreferences, timestamps

## Test Results
- 31 of 33 tests passing
- Tests cover: Product CRUD, Sales, Stock-in, Adjustments, Transaction History, Reorder Suggestions, Reports, Backup, Health

## Setup Commands
1. `npm install` - Install dependencies
2. `npx prisma migrate dev` - Create database migration
3. `npm run dev` - Start development server (http://localhost:3000)
4. `npm test` - Run vitest test suite

## API Request/Response Formats

### Product Creation
```
POST /api/v1/products
{
  "name": "Biscuit Packets",
  "category": "Snacks",
  "unit": "packet",
  "quantity": 15,
  "reorderThreshold": 10,
  "purchaseCost": 8.0,
  "sellingPrice": 12.0
}
```
Response: `201 { success: true, data: { id, name, ..., lowStock: false } }`

### Recording a Sale
```
POST /api/v1/transactions/sales
{
  "productId": "uuid",
  "quantity": 3,
  "soldPrice": 12.0
}
```
Response on success: `201 { success: true, data: { transaction, product } }`
Response on insufficient stock: `409 { error: { code: 'INSUFFICIENT_STOCK', details: { available: 5, requested: 10 } } }`

### Reorder Suggestions
```
GET /api/v1/reorder-suggestions?lookbackDays=30&leadTimeDays=7&safetyStock=0
```
Response: `{ success: true, data: { suggestions: [...] } }` with product reorder analysis

## Error Handling
All errors return structured JSON:
```json
{ "error": { "code": "INSUFFICIENT_STOCK", "message": "Not enough stock available", "details": { "available": 5, "requested": 10 } } }
```

Codes: VALIDATION_ERROR, PRODUCT_NOT_FOUND, INSUFFICIENT_STOCK, NEGATIVE_STOCK, INVALID_QUANTITY, INVALID_DELTA, NOT_FOUND