# AI Expense Companion

# Database Design

**Document:** `DATABASE.md`
**Version:** 1.0
**Status:** Draft

---

# 1. Database Architecture

AI Expense Companion uses two databases:

```text
                    AI EXPENSE COMPANION
                            │
             ┌──────────────┴──────────────┐
             │                             │
        Mobile Database               Cloud Database
             │                             │
           SQLite                      PostgreSQL
             │                             │
        Offline-first                 Source of truth
             │                             │
             └──────────────┬──────────────┘
                            │
                         Sync API
```

## Responsibilities

### SQLite

Used for:

* Offline transaction creation
* Offline transaction editing
* Local dashboard data
* Cached analytics
* Local AI context
* Pending synchronization
* Fast application queries

### PostgreSQL

Used for:

* Permanent cloud storage
* Cross-device synchronization
* Server-side analytics
* User authentication
* AI data processing
* Backup and recovery
* Central source of truth

---

# 2. Database Principles

The database should follow these principles:

1. UUID-based primary keys.
2. Every user-owned table contains `user_id`.
3. PostgreSQL is the cloud source of truth.
4. SQLite mirrors the core transaction model.
5. Transactions must be stored using exact decimal-safe monetary values.
6. Financial calculations should not depend on LLM output.
7. Soft deletion should be used for synchronized entities.
8. Every synchronized entity should have version information.
9. Every synchronized entity should have `created_at` and `updated_at`.
10. Sync operations must be idempotent.
11. Foreign keys should be enforced.
12. Appropriate indexes should be created for common financial queries.

---

# 3. Entity Relationship Overview

```text
                           users
                             │
          ┌──────────────────┼───────────────────┐
          │                  │                   │
          ▼                  ▼                   ▼
       accounts          categories          devices
          │                  │
          │          ┌───────┴────────┐
          │          │                │
          ▼          ▼                ▼
    transactions   expenses        income
          │
          │
    ┌─────┼──────────┬───────────┐
    │     │          │           │
    ▼     ▼          ▼           ▼
  goals  debts   recurring   attachments
                            

users
 │
 ├── financial_goals
 ├── debts
 ├── notifications
 ├── AI conversations
 │       │
 │       └── AI messages
 │
 └── sync_operations
```

---

# 4. Core Tables

The primary PostgreSQL tables are:

```text
users
devices

accounts
categories
transactions
expenses
income

recurring_transactions

financial_goals
goal_contributions

debts
debt_payments

notifications

ai_conversations
ai_messages
ai_insights
ai_feedback

sync_operations
```

---

# 5. Users

Stores application users.

## Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    default_currency CHAR(3) NOT NULL DEFAULT 'INR',

    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Important Fields

| Field            | Purpose            |
| ---------------- | ------------------ |
| id               | User identifier    |
| name             | Display name       |
| email            | Login email        |
| password_hash    | Hashed password    |
| default_currency | Default currency   |
| timezone         | User timezone      |
| is_active        | Account status     |
| created_at       | Creation timestamp |
| updated_at       | Last update        |

---

# 6. Refresh Tokens

Refresh tokens should be stored separately.

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL,

    device_id UUID,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Never store raw refresh tokens.

Store a secure hash instead.

---

# 7. Devices

A user can have multiple devices.

Example:

```text
User
 │
 ├── iPhone
 ├── Android Phone
 └── Tablet
```

## Table

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    device_identifier VARCHAR(255) NOT NULL,

    device_name VARCHAR(100),

    platform VARCHAR(20) NOT NULL,

    app_version VARCHAR(30),

    last_sync_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, device_identifier)
);
```

Platform:

```text
ios
android
```

---

# 8. Accounts

Accounts represent financial sources.

Examples:

```text
Salary Account
Savings Account
Credit Card
Cash
UPI Wallet
Investment Account
```

## Table

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    account_type VARCHAR(30) NOT NULL,

    institution_name VARCHAR(150),

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,

    current_balance NUMERIC(18,2) NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);
```

Account types:

```text
cash
bank
credit_card
wallet
investment
other
```

---

# 9. Categories

Categories classify expenses and income.

## Table

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    type VARCHAR(20) NOT NULL,

    parent_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    icon VARCHAR(50),

    color VARCHAR(20),

    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);
```

`user_id` can be NULL for system categories.

Example:

```text
Food
 ├── Restaurants
 ├── Groceries
 ├── Delivery
 └── Coffee

Transport
 ├── Fuel
 ├── Taxi
 └── Public Transport
```

---

# 10. Default Categories

System categories can include:

### Expenses

```text
Food
Transport
Housing
Utilities
Shopping
Entertainment
Healthcare
Education
Travel
Subscriptions
Insurance
Personal Care
Debt Payment
Other
```

### Income

```text
Salary
Business
Freelance
Rental Income
Interest
Dividend
Bonus
Other
```

---

# 11. Transactions

A unified transaction table is recommended.

Instead of completely separating every financial event, the system maintains a common transaction record.

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    account_id UUID
        REFERENCES accounts(id)
        ON DELETE SET NULL,

    category_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    transaction_type VARCHAR(20) NOT NULL,

    amount NUMERIC(18,2) NOT NULL,

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    merchant VARCHAR(200),

    description TEXT,

    transaction_date DATE NOT NULL,

    payment_method VARCHAR(30),

    source VARCHAR(30) NOT NULL DEFAULT 'manual',

    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,

    client_id UUID,

    version INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);
```

Transaction types:

```text
expense
income
transfer
```

Sources:

```text
manual
import
ai
sync
bank
```

---

# 12. Why Use NUMERIC?

Never store financial amounts as floating-point values.

Bad:

```sql
amount DOUBLE PRECISION
```

Recommended:

```sql
amount NUMERIC(18,2)
```

This avoids floating-point precision problems.

Example:

```text
₹10.10 + ₹20.20
```

should remain:

```text
₹30.30
```

---

# 13. Expenses

For the first version, expenses can be represented directly through `transactions`.

However, if expense-specific metadata becomes necessary, use a dedicated table.

```sql
CREATE TABLE expenses (
    transaction_id UUID PRIMARY KEY
        REFERENCES transactions(id)
        ON DELETE CASCADE,

    expense_type VARCHAR(30),

    necessity VARCHAR(20),

    ai_category_confidence NUMERIC(5,4),

    ai_categorized BOOLEAN NOT NULL DEFAULT FALSE,

    notes TEXT
);
```

Necessity:

```text
essential
discretionary
luxury
unknown
```

This becomes useful for AI financial education.

---

# 14. Income

```sql
CREATE TABLE income (
    transaction_id UUID PRIMARY KEY
        REFERENCES transactions(id)
        ON DELETE CASCADE,

    income_source VARCHAR(100),

    is_salary BOOLEAN NOT NULL DEFAULT FALSE,

    notes TEXT
);
```

---

# 15. Transaction Attachments

Optional receipts or invoice images.

```sql
CREATE TABLE transaction_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID NOT NULL
        REFERENCES transactions(id)
        ON DELETE CASCADE,

    file_url TEXT NOT NULL,

    file_name VARCHAR(255),

    mime_type VARCHAR(100),

    file_size BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Actual files should be stored in object storage rather than PostgreSQL.

---

# 16. Recurring Transactions

Used for:

* Salary
* Rent
* EMIs
* Subscriptions
* Insurance
* SIPs
* Utility bills

## Table

```sql
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    account_id UUID
        REFERENCES accounts(id)
        ON DELETE SET NULL,

    category_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    type VARCHAR(20) NOT NULL,

    name VARCHAR(150) NOT NULL,

    amount NUMERIC(18,2) NOT NULL,

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    frequency VARCHAR(30) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE,

    next_occurrence DATE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);
```

Frequency:

```text
daily
weekly
monthly
quarterly
yearly
```

---

# 17. Financial Goals

Examples:

```text
Emergency Fund
House
Car
Vacation
₹1 Crore Corpus
Debt Free
```

## Table

```sql
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    target_amount NUMERIC(18,2) NOT NULL,

    current_amount NUMERIC(18,2) NOT NULL DEFAULT 0,

    currency CHAR(3) NOT NULL DEFAULT 'INR',

    target_date DATE,

    priority VARCHAR(20) DEFAULT 'medium',

    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);
```

---

# 18. Goal Contributions

Track progress separately.

```sql
CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    goal_id UUID NOT NULL
        REFERENCES financial_goals(id)
        ON DELETE CASCADE,

    amount NUMERIC(18,2) NOT NULL,

    contribution_date DATE NOT NULL,

    source VARCHAR(30),

    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Example:

```text
Emergency Fund
     │
     ├── ₹10,000 — September
     ├── ₹15,000 — October
     └── ₹20,000 — November
```

---

# 19. Debts

Debt tracking is an important feature.

## Table

```sql
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    lender VARCHAR(150),

    debt_type VARCHAR(30),

    principal_amount NUMERIC(18,2) NOT NULL,

    outstanding_amount NUMERIC(18,2) NOT NULL,

    interest_rate NUMERIC(7,4),

    emi_amount NUMERIC(18,2),

    start_date DATE,

    expected_end_date DATE,

    payment_frequency VARCHAR(30) DEFAULT 'monthly',

    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);
```

Debt types:

```text
home_loan
personal_loan
car_loan
education_loan
credit_card
p2p
other
```

---

# 20. Debt Payments

```sql
CREATE TABLE debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    debt_id UUID NOT NULL
        REFERENCES debts(id)
        ON DELETE CASCADE,

    amount NUMERIC(18,2) NOT NULL,

    principal_component NUMERIC(18,2),

    interest_component NUMERIC(18,2),

    payment_date DATE NOT NULL,

    transaction_id UUID
        REFERENCES transactions(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

This allows the application to explain:

```text
EMI = ₹30,253

Principal = ₹15,700
Interest = ₹14,553
```

---

# 21. Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    data JSONB,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    read_at TIMESTAMPTZ
);
```

Examples:

```text
Unusual spending detected
EMI due tomorrow
You are close to your food budget
Monthly report available
Goal progress update
```

---

# 22. AI Conversations

AI conversations should be stored separately from financial transactions.

```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title VARCHAR(200),

    context_type VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Context types:

```text
general
expense_analysis
budget
debt
goal
education
monthly_report
```

---

# 23. AI Messages

```sql
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL
        REFERENCES ai_conversations(id)
        ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL,

    content TEXT NOT NULL,

    model VARCHAR(100),

    token_count INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Roles:

```text
user
assistant
system
```

---

# 24. AI Insights

Insights should be persisted so the same analysis does not need to be generated repeatedly.

```sql
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    insight_type VARCHAR(50) NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    severity VARCHAR(20),

    category_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    period_start DATE,

    period_end DATE,

    confidence NUMERIC(5,4),

    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ
);
```

Example:

```json
{
  "percentageIncrease": 22,
  "previousAverage": 4500,
  "currentAmount": 5490
}
```

---

# 25. AI Feedback

```sql
CREATE TABLE ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    message_id UUID NOT NULL
        REFERENCES ai_messages(id)
        ON DELETE CASCADE,

    rating VARCHAR(20) NOT NULL,

    reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 26. Sync Operations

The sync system requires an operation log.

```sql
CREATE TABLE sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    device_id UUID
        REFERENCES devices(id)
        ON DELETE SET NULL,

    entity_type VARCHAR(50) NOT NULL,

    entity_id UUID NOT NULL,

    operation VARCHAR(20) NOT NULL,

    version INTEGER,

    payload JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    processed_at TIMESTAMPTZ
);
```

Operations:

```text
CREATE
UPDATE
DELETE
```

---

# 27. Synchronization Metadata

Every offline-syncable table should contain:

```text
id
user_id
created_at
updated_at
deleted_at
version
```

Example:

```sql
version INTEGER NOT NULL DEFAULT 1
```

This enables optimistic synchronization.

---

# 28. Sync Strategy

The mobile application works offline.

```text
                  MOBILE
                    │
              ┌─────┴─────┐
              │           │
            SQLite      Network
              │           │
              │           ▼
              │       REST API
              │           │
              │           ▼
              │      PostgreSQL
              │
              ▼
        Pending Changes
```

---

# 29. Offline Expense Creation

Example:

User creates:

```text
Swiggy
₹450
Food
```

while offline.

SQLite:

```text
id = local UUID
sync_status = pending
version = 1
```

When network becomes available:

```text
SQLite
   │
   ▼
Sync Queue
   │
   ▼
POST /sync
   │
   ▼
PostgreSQL
   │
   ▼
serverId
   │
   ▼
SQLite updated
```

---

# 30. SQLite Sync Metadata

SQLite should additionally maintain:

```sql
sync_status TEXT NOT NULL DEFAULT 'pending'
```

Possible values:

```text
synced
pending
failed
conflict
deleted
```

PostgreSQL does not necessarily need `sync_status`; it represents the cloud source of truth.

---

# 31. SQLite Database

The mobile SQLite database should contain the most important tables:

```text
users
accounts
categories
transactions
expenses
income
recurring_transactions
financial_goals
goal_contributions
debts
debt_payments
notifications
ai_insights
sync_queue
```

The mobile database does not need to mirror every backend table.

For example:

```text
AI conversations
AI messages
refresh tokens
server sync logs
```

can remain primarily server-side.

---

# 32. SQLite Sync Queue

```sql
CREATE TABLE sync_queue (
    id TEXT PRIMARY KEY,

    entity_type TEXT NOT NULL,

    entity_id TEXT NOT NULL,

    operation TEXT NOT NULL,

    payload TEXT NOT NULL,

    retry_count INTEGER NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'pending',

    created_at TEXT NOT NULL,

    last_attempt_at TEXT,

    error_message TEXT
);
```

---

# 33. Important Indexes

Indexes are extremely important for an expense application.

## Transactions

```sql
CREATE INDEX idx_transactions_user_date
ON transactions(user_id, transaction_date DESC);
```

## Category

```sql
CREATE INDEX idx_transactions_user_category
ON transactions(user_id, category_id);
```

## Account

```sql
CREATE INDEX idx_transactions_account
ON transactions(account_id);
```

## Updated Records

```sql
CREATE INDEX idx_transactions_updated
ON transactions(user_id, updated_at);
```

## Recurring

```sql
CREATE INDEX idx_recurring_user_next
ON recurring_transactions(user_id, next_occurrence);
```

## Goals

```sql
CREATE INDEX idx_goals_user
ON financial_goals(user_id);
```

## Debts

```sql
CREATE INDEX idx_debts_user_status
ON debts(user_id, status);
```

## AI Insights

```sql
CREATE INDEX idx_ai_insights_user_created
ON ai_insights(user_id, created_at DESC);
```

---

# 34. User Data Isolation

Every query involving user data must include `user_id`.

Correct:

```sql
SELECT *
FROM transactions
WHERE user_id = $1
AND id = $2;
```

Incorrect:

```sql
SELECT *
FROM transactions
WHERE id = $1;
```

This prevents cross-user data access.

---

# 35. PostgreSQL Row-Level Security

For additional protection, PostgreSQL Row-Level Security can eventually be enabled.

Conceptually:

```text
User A
   │
   ▼
Can access
WHERE user_id = User A

User B
   │
   ▼
Can access
WHERE user_id = User B
```

This creates a second layer of protection beyond application-level authorization.

---

# 36. Financial Calculation Model

The database stores raw financial facts.

Example:

```text
Income
₹100,000

Expenses
₹64,200

Debt EMI
₹20,000
```

The backend calculates:

```text
Net Cash Flow
= Income - Expenses

= ₹100,000 - ₹64,200

= ₹35,800
```

The AI should explain the result rather than become the source of the calculation.

---

# 37. Dashboard Queries

Example monthly expense:

```sql
SELECT
    COALESCE(SUM(amount), 0) AS total_expense
FROM transactions
WHERE user_id = $1
AND transaction_type = 'expense'
AND transaction_date >= $2
AND transaction_date < $3
AND deleted_at IS NULL;
```

---

# 38. Category Spending

```sql
SELECT
    category_id,
    SUM(amount) AS total
FROM transactions
WHERE user_id = $1
AND transaction_type = 'expense'
AND transaction_date BETWEEN $2 AND $3
AND deleted_at IS NULL
GROUP BY category_id
ORDER BY total DESC;
```

This powers:

```text
Food       ₹12,000
Housing    ₹20,000
Transport   ₹5,500
Shopping    ₹4,200
```

---

# 39. Monthly Cash Flow

```sql
SELECT
    DATE_TRUNC('month', transaction_date) AS month,

    SUM(
        CASE
            WHEN transaction_type = 'income'
            THEN amount
            ELSE 0
        END
    ) AS income,

    SUM(
        CASE
            WHEN transaction_type = 'expense'
            THEN amount
            ELSE 0
        END
    ) AS expenses

FROM transactions

WHERE user_id = $1

GROUP BY DATE_TRUNC('month', transaction_date)

ORDER BY month;
```

---

# 40. Financial Health Data

The database should provide the raw inputs for financial health scoring.

Example:

```text
Income
Expenses
Savings
Debt
EMIs
Emergency Fund
Goal Progress
Spending Consistency
```

The backend calculator converts these into:

```text
Financial Health Score
```

Example:

```text
Savings             80/100
Debt                65/100
Emergency Fund      70/100
Spending            82/100
Consistency         90/100

Overall             77/100
```

---

# 41. JSONB Usage

PostgreSQL `JSONB` should be used only for flexible metadata.

Good:

```json
{
  "source": "ai",
  "confidence": 0.92,
  "reason": "Merchant matched grocery pattern"
}
```

Avoid storing core financial data inside JSONB.

Bad:

```json
{
  "amount": 450,
  "category": "Food",
  "date": "2026-09-08"
}
```

Core searchable financial fields should remain normal columns.

---

# 42. Audit Strategy

For sensitive financial operations, consider an audit table.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    entity_type VARCHAR(50),

    entity_id UUID,

    action VARCHAR(30),

    old_data JSONB,

    new_data JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Possible actions:

```text
CREATE
UPDATE
DELETE
LOGIN
LOGOUT
SYNC
```

---

# 43. Database Relationship Diagram

```text
                              ┌─────────────┐
                              │    users    │
                              └──────┬──────┘
                                     │
            ┌────────────────────────┼─────────────────────────┐
            │                        │                         │
            ▼                        ▼                         ▼
       ┌──────────┐           ┌────────────┐            ┌───────────┐
       │ accounts │           │ categories │            │  devices  │
       └────┬─────┘           └──────┬─────┘            └───────────┘
            │                        │
            │             ┌──────────┴──────────┐
            │             │                     │
            └─────────────┴──────┐              │
                                 ▼              ▼
                           ┌──────────────┐
                           │ transactions │
                           └──────┬───────┘
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                    ┌──────────┐      ┌────────┐
                    │ expenses │      │ income │
                    └──────────┘      └────────┘


 users
   │
   ├───────────────► financial_goals
   │                      │
   │                      ▼
   │               goal_contributions
   │
   ├───────────────► debts
   │                   │
   │                   ▼
   │              debt_payments
   │
   ├───────────────► recurring_transactions
   │
   ├───────────────► notifications
   │
   └───────────────► ai_conversations
                           │
                           ▼
                       ai_messages
                           │
                           ▼
                       ai_feedback
```

---

# 44. Recommended PostgreSQL Extensions

Recommended:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

This enables:

```sql
gen_random_uuid()
```

For future semantic search/RAG:

```text
pgvector
```

can be considered.

---

# 45. Future AI/RAG Tables

If the application later provides financial education using RAG:

```text
documents
document_chunks
embeddings
```

Example:

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,

    source TEXT,

    content TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

With pgvector:

```text
document_chunks
        │
        ▼
embedding vector
        │
        ▼
Similarity Search
        │
        ▼
Relevant Financial Knowledge
        │
        ▼
LLM
```

The user's financial data and educational knowledge base should remain logically separated.

---

# 46. Data Retention

Recommended approach:

### Transactions

Keep indefinitely unless the user explicitly deletes them.

### AI conversations

Allow users to delete them.

### AI insights

Can expire automatically.

### Notifications

Can be archived/deleted after a configurable period.

### Audit logs

Retain according to security/compliance requirements.

---

# 47. Backup Strategy

PostgreSQL should have:

```text
Daily automated backup
+
Point-in-time recovery
+
Periodic restore testing
```

The application should never depend on SQLite as the only copy of important financial data.

---

# 48. Database Migration Strategy

Use a migration framework rather than manually changing production databases.

Recommended Node.js options:

```text
Prisma Migrate
Drizzle Kit
Knex migrations
node-pg-migrate
```

The selected migration tool should provide:

```text
migration files
version tracking
rollback strategy
CI/CD integration
```

---

# 49. Recommended Initial Migration Order

```text
001_create_users
        ↓
002_create_refresh_tokens
        ↓
003_create_devices
        ↓
004_create_accounts
        ↓
005_create_categories
        ↓
006_create_transactions
        ↓
007_create_expenses
        ↓
008_create_income
        ↓
009_create_recurring_transactions
        ↓
010_create_goals
        ↓
011_create_goal_contributions
        ↓
012_create_debts
        ↓
013_create_debt_payments
        ↓
014_create_notifications
        ↓
015_create_ai_conversations
        ↓
016_create_ai_messages
        ↓
017_create_ai_insights
        ↓
018_create_ai_feedback
        ↓
019_create_sync_operations
        ↓
020_create_audit_logs
        ↓
021_create_indexes
```

---

# 50. Database Folder Structure

Recommended backend structure:

```text
backend/
│
├── src/
│   ├── db/
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── queries/
│   │   └── repositories/
│   │
│   └── ...
│
└── prisma/
    └── schema.prisma
```

If Prisma is selected:

```text
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

---

# 51. Mobile Database Structure

Recommended:

```text
mobile/
└── src/
    └── database/
        ├── migrations/
        ├── schema/
        ├── repositories/
        ├── queries/
        ├── sync/
        │   ├── syncManager.ts
        │   ├── syncQueue.ts
        │   └── conflictResolver.ts
        └── database.ts
```

---

# 52. Offline Conflict Resolution

For most financial transactions:

```text
Server wins
```

should not automatically be the only strategy.

Recommended rules:

### CREATE

```text
Client CREATE
      ↓
No server record
      ↓
Accept
```

### UPDATE

Use:

```text
version
+
updated_at
```

Example:

```text
Server version = 5
Client version = 4
```

The client is outdated.

Result:

```text
CONFLICT
```

### DELETE

Soft-delete first:

```text
deleted_at = timestamp
```

This prevents a deleted record from reappearing during synchronization.

---

# 53. Transaction ID Strategy

Use UUIDs generated on the device.

Example:

```text
mobile creates:

id = 550e8400-e29b-41d4-a716-446655440000
```

The same ID is sent to the server.

This is preferable to:

```text
mobile ID → server generates completely different ID
```

because it makes offline synchronization and idempotency easier.

---

# 54. Database Security

Never store:

```text
plain-text passwords
raw refresh tokens
AI provider API keys
bank passwords
UPI PINs
credit/debit card CVV
```

Passwords:

```text
Argon2id
```

or a strong bcrypt configuration.

Sensitive credentials should never enter the application's financial database.

---

# 55. AI Data Privacy

Before sending information to the AI service, construct a minimal context.

Instead of:

```text
Entire database
```

send:

```json
{
  "monthlyIncome": 100000,
  "monthlyExpenses": 64200,
  "topCategories": [
    {
      "name": "Food",
      "amount": 12000
    }
  ],
  "previousMonthExpenses": 58000
}
```

This reduces:

* Privacy exposure
* Token usage
* AI hallucination
* Processing cost

---

# 56. Source of Truth

The application follows this hierarchy:

```text
                    PostgreSQL
                   Cloud Truth
                       ▲
                       │
                     Sync
                       │
                       ▼
                    SQLite
                  Local Cache
```

However, while offline:

```text
SQLite
   │
   ▼
Temporary Local Truth
   │
   ▼
Sync
   │
   ▼
PostgreSQL
```

---

# 57. Complete Database Architecture

```text
                         AI EXPENSE COMPANION
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
             React Native                      Backend
                 │                                 │
              SQLite                         Node.js/Express
                 │                                 │
        ┌────────┼────────┐                       │
        │        │        │                       │
   Transactions Goals    Debts                     │
        │        │        │                       │
        └────────┼────────┘                       │
                 │                                 │
             Sync Queue ──────────────────────────►│
                                                   │
                                                   ▼
                                             PostgreSQL
                                                   │
                         ┌─────────────────────────┼────────────────────┐
                         │                         │                    │
                         ▼                         ▼                    ▼
                    Financial Data             Analytics             AI Gateway
                         │                         │                    │
                         │                         │                    ▼
                         │                         │               Python AI
                         │                         │                    │
                         │                         │             ┌──────┼──────┐
                         │                         │             ▼      ▼      ▼
                         │                         │            LLM     ML    RAG
                         │                         │
                         └─────────────────────────┴─────────────────────────┘
```

---

# 58. Final Design Decision

The most important architectural decision for AI Expense Companion is:

```text
                 FINANCIAL DATA
                       │
                       ▼
                 PostgreSQL
                       │
                       ▼
               Deterministic Logic
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
       Analytics                  AI
          │                         │
          │                    Explanation
          │                    Education
          │                    Insights
          │                    Recommendations
          │                         │
          └────────────┬────────────┘
                       ▼
                  User Decision
```

**The AI is not the financial source of truth.**

The database + deterministic backend calculations are the source of truth.

The AI's job is to:

* Explain financial information.
* Identify patterns.
* Educate the user.
* Generate personalized insights.
* Answer financial questions.
* Help users understand their own behavior.

This separation is critical for building a trustworthy financial application.
