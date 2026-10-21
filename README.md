# StockSprint Backend

StockSprint backend - offline-first inventory and sales API for Indian kirana stores.
Built with Node.js, TypeScript, Express.js, Prisma ORM, and SQLite.

## Architecture Decisions

- **Offline-first**: Backend is optional for core sales. The frontend (PWA + IndexedDB) works offline; the backend handles online persistence, reporting, and multi-device sync.
- **Not a single point of failure**: Core offline sales work without backend connectivity.
- **Deterministic calculations**: Stock math and reorder logic are computed in application code, never by AI.
- **Nemotron AI**: Optional, advisory-only integration behind a provider interface. Core app functions without it.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js LTS |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | SQLite (dev), PostgreSQL (deployed) |
| Validation | Zod |
| Testing | Vitest |
| API Docs | OpenAPI/Swagger (see `API_DOCS.md`) |

## Project Structure

```
stocksprint-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data (rice, biscuit packets, soap)
├── src/
│   ├── config/env.ts      # Environment variable validation
│   ├── lib/prisma.ts      # Prisma client singleton
│   ├── middleware/
│   │   ├── async-handler.ts   # Wraps async route handlers
│   │   ├── error-handler.ts   # Centralized error handling
│   │   └── request-id.ts      # Request ID for diagnostics
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── products.routes.ts
│   │   ├── transactions.routes.ts
│   │   ├── reorder.routes.ts
│   │   └── reports.routes.ts
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   ├── product.controller.ts
│   │   ├── transaction.controller.ts
│   │   └── reorder.controller.ts
│   ├── services/
│   │   ├── product.service.ts
│   │   ├── transaction.service.ts
│   │   ├── reorder.service.ts
│   │   ├── report.service.ts
│   │   └── backup.service.ts
│   ├── ai/
│   │   └── nemotron-provider.ts   # Optional Nemotron AI integration
│   ├── schemas/           # Zod validation schemas
│   ├── app.ts             # Express app factory
│   └── server.ts          # Entry point
├── tests/
│   └── api.test.ts        # 33 automated backend tests
├── .env.example           # Environment variable template
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Setup & Installation

### Prerequisites

- Node.js 20 or higher
- npm

### Install Dependencies

```bash
cd stocksprint-backend
npm install
```

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Set Up Environment

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - SQLite path (default: `file:./dev.db`)
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Frontend origin (default: `http://localhost:5173`)
- `NEMOTRON_*` - Optional, only if using Nemotron AI

### Initialize Database

```bash
npm run prisma:db-push
```

This creates the SQLite database file and applies the schema.

### Seed Database (Optional but Recommended)

Seed with sample data as specified in the TRD:

```bash
npm run prisma:seed
```

Seed data: Rice (20 kg), Biscuit Packets (15 packet), Soap (8 piece).

### Run Development Server

```bash
npm run dev
```

Server starts on `http://localhost:3000` (or the port configured in `.env`).

### Build for Production

```bash
npm run build
npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with ts-node |
| `npm start` | Start production server (requires `npm run build` first) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:db-push` | Push schema to database (create tables) |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:seed` | Seed database with sample data |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm test` | Run automated backend tests |
| `npm run test:watch` | Run tests in watch mode |

## API Documentation

Full API reference with request/response formats and example `curl` calls is in [`API_DOCS.md`](API_DOCS.md).

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/health` | Health check (versioned) |
| GET | `/api/v1/products` | List products (supports `?search=`, `?lowStock=true`) |
| POST | `/api/v1/products` | Create product |
| GET | `/api/v1/products/:id` | Get product by ID |
| PATCH | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |
| POST | `/api/v1/transactions/sales` | Record sale (atomic stock decrement) |
| POST | `/api/v1/transactions/stock-in` | Record stock-in (atomic stock increment) |
| POST | `/api/v1/transactions/adjustments` | Record stock adjustment |
| GET | `/api/v1/transactions` | Transaction history (supports `?from=`, `?to=`, `?type=`) |
| GET | `/api/v1/reorder-suggestions` | Low-stock and reorder recommendations |
| GET | `/api/v1/reports/summary` | Sales and inventory summary |
| GET | `/api/v1/reports/export` | Backup export (JSON or CSV) |
| POST | `/api/v1/reports/import/validate` | Validate backup import JSON |

## Sample Data

After seeding, the database contains:

| Product | Quantity | Unit | Reorder Threshold |
|---------|----------|------|-------------------|
| Rice | 20 | kg | 5 |
| Biscuit Packets | 15 | packet | 10 |
| Soap | 8 | piece | 5 |

Example acceptance test: Sell 3 biscuit packets from 15 → stock = 12.

## Testing

```bash
npm test
```

Test coverage includes:
- Product CRUD (create, read, update, delete, list, search, low-stock filter)
- Sales (atomic stock decrement, overselling rejection, invalid quantity)
- Stock-in (atomic stock increment)
- Adjustments (positive/negative, negative stock rejection)
- Transaction history (list, filter by type)
- Reorder suggestions (explanation, confidence, fallback)
- Reports (sales summary, cost data availability)
- Backup export (JSON, CSV)
- Health checks

## Error Handling

All errors follow a consistent JSON envelope:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Not enough stock available.",
    "details": { "available": 2, "requested": 3 },
    "requestId": "uuid"
  }
}
```

HTTP status codes:
- `400` - Invalid input (validation error)
- `404` - Resource not found
- `409` - Conflict (insufficient stock, negative stock)
- `500` - Internal server error (no stack trace in production)

## Nemotron AI Integration (Optional)

Nemotron is an optional coding assistant and can provide explainable reorder suggestions. It is NOT the backend and is NOT used for stock writes.

To enable:
1. Set `NEMOTRON_BASE_URL`, `NEMOTRON_API_KEY`, and `NEMOTRON_MODEL` in `.env`
2. Call `POST /api/v1/reports/explain` with `{ context, question }`

The AI response is advisory only. Core calculations (reorder math, stock writes) are performed by tested application code.

## Security

- API keys and database credentials stored in environment variables only (`.env`, never committed)
- `.env.example` committed with placeholders only
- All inputs validated on the server with Zod schemas
- Parameterized queries via Prisma ORM (no raw SQL from user input)
- Consistent error messages without stack traces in production
- CORS restricted to configured origin
- No secrets in repository

## Features Implemented

| Feature | Status |
|---------|--------|
| Product CRUD | Implemented |
| Stock list with search | Implemented |
| Low-stock alerts | Implemented |
| Sales with atomic stock validation | Implemented |
| Stock-in with atomic increment | Implemented |
| Adjustments with audit trail | Implemented |
| Transaction history | Implemented |
| Reorder suggestions (explainable) | Implemented |
| Sales reports and summary | Implemented |
| Backup export (JSON/CSV) | Implemented |
| Health check | Implemented |
| Input validation (Zod) | Implemented |
| Consistent error handling | Implemented |
| Automated tests (33 tests) | Implemented |
| Nemotron AI integration | Optional, not configured by default |
