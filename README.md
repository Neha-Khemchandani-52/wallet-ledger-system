# wallet-ledger-system
A full-stack financial system built with Laravel (backend), React (frontend), and MySQL (database). Implements account management, atomic money transfers, deposit functionality, and transaction history with a ledger-based architecture.

---
# Features
- Create Account with Opening Balance
- Deposit Money (Ledger-based credit entry)
- Transfer Funds (Atomic & Idempotent)
- Transaction History
- Balance Calculation (Derived from ledger entries)
- API Security using Token-based Authentication
- Input Validation with User-Friendly Messages
- Dockerized Setup (PHP, MySQL, Nginx)

---
# Tech Stack
Backend:
- Laravel 12+
- MySQL 8
- REST APIs

Frontend:
- React (Vite)
- React Query
- Axios

DevOps:
- Docker + Docker Compose

---
## Project Structute

wallet-ledger-system/
│
├── backend/ → Laravel API
├── frontend/ → React UI
└── README.md

---
## Setup Instructions

### Prerequisites
- PHP >= 8.2, Composer
- Node.js >= 18, npm
- MySQL 8

### Clone Repository

```bash
git clone https://github.com/your-username/wallet-ledger-system.git
cd wallet-ledger-system

### Backend Setup(PHP Laravel)
cd backend

# Install dependencies
composer install

# Copy env
cp .env.example .env

# Generate app key
php artisan key:generate

# Setup DB (update .env accordingly)

# Set API token in .env
# API_TOKEN=secret-token-here (dummy token is given in .env.example file for testing that you can use as it is in .env for testing wallet-ledger-system app, because it's not sensitive one, that's why added in .env.example file)

# Run migrations
php artisan migrate

# Run migrations and seed test data
php artisan migrate --seed

# Start the server
php artisan serve
# Backend runs at: http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

## Copy `.env.example` to `.env` and update values before running the app.

# Set VITE_API_URL=http://localhost:8000/api/v1

# Set VITE_API_KEY=secret-token-here (dummy token is given in backend/.env.example file for testing that you can use as it is in .env for testing wallet-ledger-system app, because it's not sensitive one, that's why added in .env.example file)  ← must match backend API_TOKEN

# Start dev server
npm run dev
# Frontend runs on: http://localhost:5173
```

---
## API Documentation

All endpoints require the header:
```
X-API-KEY: secret-token-here
```

Base URL: `http://localhost:8000/api/v1`

---

### 1. List All Accounts
```
GET /accounts
```
**Response:**
```json
{
  "status": "success",
  "data": [
    { "account_id": "ACC001", "name": "Alice Johnson" }
  ]
}
```

---

### 2. Create Account
```
POST /accounts
```
**Request:**
```json
{
  "account_id": "ACC004",
  "name": "Diana Prince",
  "opening_balance": 1000.00
}
```
**Rules:**
- `account_id`: required, alphanumeric, must contain at least one number, max 50 chars
- `name`: required, letters and spaces only, 2–100 chars
- `opening_balance`: optional, min 0 — creates initial credit ledger entry if > 0

**Response `201`:**
```json
{
  "status": "success",
  "message": "Account created successfully",
  "data": {
    "account_id": "ACC004",
    "name": "Diana Prince",
    "opening_balance": 1000.00,
    "created_at": "2026-05-01T10:00:00Z"
  }
}
```

---

### 3. Get Balance
```
GET /accounts/{accountId}/balance
```
**Response:**
```json
{
  "status": "success",
  "account_id": "ACC001",
  "name": "Alice Johnson",
  "balance": "4500.00",
  "currency": "USD"
}
```
> Balance is always derived from `SUM(amount)` in `ledger_entries` — never stored directly.

---

### 4. Transfer Funds
```
POST /transfers
```
**Request:**
```json
{
  "from_account_id": "ACC001",
  "to_account_id": "ACC002",
  "amount": 500.00,
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Rules:**
- `transaction_id`: client-generated UUID — enables safe retries (idempotent)
- `amount`: max 2 decimal places, must be > 0
- Sender must have sufficient balance

**Response `200`:**
```json
{
  "status": "success",
  "message": "Transfer completed successfully"
}
```

**Error responses:**

Status | 409  | Duplicate `transaction_id` — already processed |
Status | 422    | Insufficient funds / invalid accounts / validation failure |

---
### 5. Deposit Funds
```
POST /accounts/{accountId}/deposit
```
**Request:**
```json
{
  "amount": 250.00
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Amount deposited successfully"
}
```
---
### 6. Transaction History
```
GET /accounts/{accountId}/transactions?page=1&per_page=10
```
**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "debit",
      "amount": "500.00",
      "description": "Transfer to ACC002",
      "created_at": "2026-05-01T10:05:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

---

## Design Decisions

Brief :

Why Ledger Instead of Balance Column?
    -Avoids inconsistency
    -Ensures auditability
    -Supports financial correctness

Why UUID for Transactions?
    -Enables idempotency
    -Prevents duplicate processing

Why DB Transactions?
    -Guarantees atomic operations

Details : 

### 1. Ledger-based balance (no stored balance column)
Balance is always computed as `SUM(amount)` from `ledger_entries`. This means:
- The ledger is an immutable audit trail — nothing is ever updated or deleted
- Balance can never drift from the transaction history

### 2. DECIMAL(19,4) for amounts
`FLOAT` has binary rounding errors — in floating point. `DECIMAL(19,4)` stores exact decimal values, which is mandatory for financial data.

### 3. Atomic transfers with DB::transaction() + lockForUpdate()
Both the debit and credit ledger entries are written inside a single `DB::transaction()`. If anything fails, both are rolled back — money is never debited without being credited.

`lockForUpdate()` acquires a row-level exclusive lock before reading balance, preventing two concurrent transfers from the same account both passing the balance check simultaneously (race condition / overdraft prevention).

### 4. Deadlock prevention via consistent lock ordering
When locking two accounts simultaneously, they are always locked in alphabetical order of `account_id`. This ensures A→B and B→A concurrent transfers acquire locks in the same order and cannot deadlock each other.

### 5. Client-side idempotency keys
The React frontend generates a UUID before each transfer request. If the network drops after the server processes the transfer but before the response arrives, the client can safely retry with the same UUID — the server returns a 409 without creating a duplicate entry. The `UNIQUE(transaction_id, account_id)` database constraint provides a second layer of protection.

### 6. API Token Middleware
A static `X-API-KEY` header protects all endpoints. In production this would be replaced with Laravel Sanctum (per-user tokens), with account-level authorisation so users can only access their own accounts.

---
## Trade-offs

| Trade-off | Decision | Production Alternative |
|-----------|----------|------------------------|
| Auth | Static API token | Laravel Sanctum per user |
| Balance computation | `SUM()` on every request | Cached balance with invalidation on write |
| Currency | Single USD | Multi-currency with conversion rates table |

## Security Considerations

- All endpoints protected by `X-API-KEY` middleware
- Rate limiting: `throttle:60,1` (60 requests/minute) on all routes
- Input validation via Laravel FormRequest with custom error messages
- Eloquent ORM prevents SQL injection
- `account_id` normalised to uppercase on creation (`strtoupper()`)

---
## Assumptions
Account ID is unique and alphanumeric
Opening balance is optional (default: 0)
Ledger is source of truth (no balance column)
Currency assumed as USD

---
## Docker Setup (Bonus) 
cd backend
docker-compose up -d

---
## Deployment (Optional)
Backend: Railway
Frontend: Vercel

---
## Author
Neha Khemchandani
Senior Full-Stack Software Engineer


