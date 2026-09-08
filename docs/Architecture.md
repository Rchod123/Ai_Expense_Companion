# AI Expense Companion

# System Architecture

**Document:** `ARCHITECTURE.md`
**Version:** 1.0
**Status:** Draft
**Last Updated:** September 2026

---

# 1. Architecture Overview

AI Expense Companion follows a **modular, offline-first, AI-assisted architecture**.

The system consists of four primary layers:

```text
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                       │
│                                                             │
│              React Native + TypeScript                      │
│                                                             │
│   UI → Zustand → Repository → SQLite → Sync Engine          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTPS / REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                             │
│                                                             │
│                  Node.js + Express                          │
│                                                             │
│ Auth │ Expenses │ Income │ Analytics │ Goals │ Debts │ AI   │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌─────────────────────────┐       ┌───────────────────────────┐
│       PostgreSQL        │       │       AI PLATFORM         │
│                         │       │                           │
│ Users                   │       │ Python                    │
│ Expenses                │       │ PyTorch                   │
│ Income                  │       │ LLM                       │
│ Goals                   │       │ Embeddings                │
│ Debts                   │       │ Classifiers               │
│ Categories              │       │ RAG                       │
└─────────────────────────┘       └───────────────────────────┘
```

The architecture is designed around one important principle:

> **The application owns the financial truth. AI explains and analyzes the financial data; AI does not become the source of truth.**

---

# 2. Architectural Principles

## 2.1 Offline First

Core expense-management functionality should work without an internet connection.

```text
User
 │
 ▼
React Native
 │
 ▼
SQLite
 │
 ├── Offline → Continue working
 │
 └── Online
       │
       ▼
   Sync Engine
       │
       ▼
   REST API
```

---

## 2.2 Local First, Cloud When Required

Data required for immediate application functionality should be available locally.

Examples:

* Recent expenses
* Recent income
* Categories
* Cached dashboard
* Pending synchronization
* Basic calculations

Cloud services should primarily provide:

* Cross-device synchronization
* Long-term storage
* AI processing
* Advanced analytics
* Backup

---

# 3. High-Level System

```text
                              USER
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React Native     │
                    │      Mobile App     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Presentation      │
                    │       Layer         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Zustand Store     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Repository       │
                    │       Layer         │
                    └───────┬───────┬─────┘
                            │       │
                       Local│       │Remote
                            │       │
                            ▼       ▼
                         SQLite    REST API
                                    │
                                    ▼
                              Node.js API
                               │       │
                         ┌─────┘       └─────┐
                         ▼                   ▼
                    PostgreSQL           AI Service
                                             │
                                    ┌────────┼────────┐
                                    ▼        ▼        ▼
                                   LLM   Classifier RAG
```

---

# 4. System Components

The system is divided into:

```text
AI Expense Companion
│
├── Mobile Application
│   ├── UI
│   ├── State Management
│   ├── Local Database
│   ├── Repository Layer
│   ├── Sync Engine
│   └── Native Modules
│
├── Backend
│   ├── API Gateway
│   ├── Authentication
│   ├── Business Logic
│   ├── Financial Calculations
│   ├── Analytics
│   └── AI Gateway
│
├── Database
│   └── PostgreSQL
│
├── AI Platform
│   ├── LLM
│   ├── Classifier
│   ├── Embeddings
│   ├── RAG
│   └── Model Evaluation
│
└── Wearables
    ├── Apple Watch
    └── Wear OS
```

---

# 5. Mobile Architecture

The mobile application follows a layered architecture.

```text
┌───────────────────────────────┐
│          Screens/UI            │
├───────────────────────────────┤
│        Presentation            │
├───────────────────────────────┤
│       Zustand Stores           │
├───────────────────────────────┤
│       Domain / Services        │
├───────────────────────────────┤
│       Repository Layer         │
├───────────────────────┬───────┤
│       SQLite          │ REST  │
└───────────────────────┴───────┘
```

---

# 6. Mobile Presentation Layer

Technology:

* React Native
* TypeScript
* React Navigation

Responsibilities:

* Render UI
* Handle user interaction
* Navigation
* Form validation
* Loading/error states
* Display financial information

Example:

```text
DashboardScreen
      │
      ├── SummaryCard
      ├── CashFlowCard
      ├── SpendingChart
      ├── RecentTransactions
      └── AIInsightCard
```

UI components should not directly access SQLite or REST APIs.

---

# 7. State Management

Technology:

**Zustand**

Zustand stores should contain application state rather than becoming a replacement for the database.

Example:

```text
stores/
├── authStore.ts
├── expenseStore.ts
├── incomeStore.ts
├── dashboardStore.ts
├── goalStore.ts
├── debtStore.ts
├── aiStore.ts
└── syncStore.ts
```

Example state:

```typescript
type ExpenseState = {
  expenses: Expense[];
  loading: boolean;
  error?: string;

  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
};
```

---

# 8. Repository Pattern

The UI should not directly communicate with SQLite or HTTP.

Instead:

```text
Screen
  │
  ▼
Zustand
  │
  ▼
Repository
  │
  ├── SQLite
  │
  └── REST API
```

Example:

```typescript
interface ExpenseRepository {
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense>;
  createExpense(expense: Expense): Promise<Expense>;
  updateExpense(expense: Expense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
}
```

This abstraction makes the application easier to:

* Test
* Maintain
* Replace data sources
* Support offline mode

---

# 9. SQLite Architecture

SQLite is the primary local database.

It stores:

* Expenses
* Income
* Categories
* Goals
* Debts
* Cached analytics
* Sync queue
* User/session metadata

Example:

```text
SQLite
│
├── users
├── expenses
├── income
├── categories
├── goals
├── debts
├── recurring_transactions
├── sync_queue
└── app_metadata
```

---

# 10. Offline Expense Creation

When the user creates an expense offline:

```text
User
 │
 ▼
Add Expense
 │
 ▼
Zustand
 │
 ▼
Expense Repository
 │
 ▼
SQLite
 │
 ├── expense record
 │
 └── sync_queue record
```

The user should immediately see the expense.

No network request should be required.

---

# 11. Synchronization Architecture

The Sync Engine is responsible for synchronizing local data with the backend.

```text
                 SQLite
                    │
                    ▼
              Sync Queue
                    │
                    ▼
             Network Check
                    │
              ┌─────┴─────┐
              │           │
            Offline      Online
              │           │
              │           ▼
              │       REST API
              │           │
              │           ▼
              │       PostgreSQL
              │
              └── Retry Later
```

---

# 12. Sync Queue

Each pending operation should contain:

```text
sync_queue
├── id
├── entity_type
├── entity_id
├── operation
├── payload
├── retry_count
├── status
├── created_at
└── updated_at
```

Example:

```json
{
  "entityType": "expense",
  "entityId": "exp_123",
  "operation": "CREATE",
  "status": "pending"
}
```

---

# 13. Sync Conflict Resolution

Possible conflict:

```text
Device A
Expense = ₹500

Device B
Expense = ₹700
```

Recommended strategy:

```text
Server timestamp
        +
updated_at
        +
version number
```

Each synchronized entity should contain:

```text
version
updated_at
device_id
```

The initial implementation should use **last-write-wins** for simplicity.

More advanced conflict resolution can be introduced later.

---

# 14. Backend Architecture

The backend follows a modular layered architecture.

```text
                    REST Request
                         │
                         ▼
                  Route / Router
                         │
                         ▼
                    Middleware
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
        Auth        Validation       Logging
          │              │
          └──────────────┼──────────────┘
                         ▼
                     Controller
                         │
                         ▼
                      Service
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          Repository   AI Gateway  Calculator
              │          │
              ▼          ▼
         PostgreSQL   AI Service
```

---

# 15. Backend Modules

Recommended structure:

```text
backend/src/

├── config/
│
├── routes/
│   ├── auth.routes.ts
│   ├── expense.routes.ts
│   ├── income.routes.ts
│   ├── dashboard.routes.ts
│   ├── analytics.routes.ts
│   ├── goals.routes.ts
│   ├── debts.routes.ts
│   └── ai.routes.ts
│
├── controllers/
│
├── services/
│   ├── auth.service.ts
│   ├── expense.service.ts
│   ├── income.service.ts
│   ├── analytics.service.ts
│   ├── goal.service.ts
│   ├── debt.service.ts
│   └── ai.service.ts
│
├── repositories/
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── rateLimit.middleware.ts
│
├── calculators/
│   ├── cashflow.calculator.ts
│   ├── savings.calculator.ts
│   ├── debt.calculator.ts
│   └── emergencyFund.calculator.ts
│
├── validators/
│
├── types/
│
└── app.ts
```

---

# 16. Controller Layer

Controllers should remain thin.

Responsibilities:

* Read request
* Validate input
* Call service
* Return response

Example:

```text
HTTP Request
     │
     ▼
ExpenseController
     │
     ▼
ExpenseService
     │
     ▼
ExpenseRepository
     │
     ▼
PostgreSQL
```

Controllers should not contain complex business logic.

---

# 17. Service Layer

Services contain business logic.

Example:

```text
ExpenseService
│
├── createExpense()
├── updateExpense()
├── deleteExpense()
├── categorizeExpense()
└── validateExpense()
```

The service layer can coordinate multiple repositories and external services.

---

# 18. Financial Calculation Layer

Financial calculations must be deterministic.

```text
Expense Data
     │
     ▼
Financial Calculator
     │
     ├── Total Expenses
     ├── Total Income
     ├── Savings
     ├── Savings Rate
     ├── Debt Ratio
     └── Emergency Fund
```

Example:

```typescript
const savings = income - expenses;

const savingsRate =
  income > 0
    ? (savings / income) * 100
    : 0;
```

The LLM should not be responsible for this calculation.

---

# 19. Analytics Architecture

Analytics should be calculated by backend services.

```text
PostgreSQL
     │
     ▼
Analytics Service
     │
     ├── Spending Analysis
     ├── Category Analysis
     ├── Cash Flow
     ├── Trends
     └── Savings Analysis
             │
             ▼
         API Response
             │
             ▼
       React Native
```

---

# 20. AI Architecture

AI is an independent subsystem.

```text
                    Node.js
                       │
                       ▼
                   AI Gateway
                       │
                       ▼
                  Python AI API
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
  Classifier          LLM          Embeddings
       │               │                │
       │               │                ▼
       │               │            Vector Store
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                  AI Response
```

---

# 21. AI Gateway

The Node.js backend should communicate with the AI service through an AI Gateway.

```text
Mobile
  │
  ▼
Node.js
  │
  ▼
AI Gateway
  │
  ▼
Python AI Service
```

Benefits:

* Authentication remains in Node.js
* User authorization remains in Node.js
* AI services remain isolated
* AI providers can be changed later
* AI API keys are never exposed to the mobile application

---

# 22. AI Service

Recommended structure:

```text
ai/

├── api/
│   └── main.py
│
├── models/
│
├── classifiers/
│   └── transaction_classifier.py
│
├── embeddings/
│
├── rag/
│   ├── ingestion.py
│   ├── retrieval.py
│   └── prompt_builder.py
│
├── inference/
│
├── prompts/
│
├── evaluation/
│
├── training/
│
└── requirements.txt
```

---

# 23. AI Request Flow

Example:

> "Why did I spend more this month?"

```text
User
 │
 ▼
React Native
 │
 ▼
POST /api/ai/chat
 │
 ▼
Node.js
 │
 ├── Authenticate user
 ├── Validate request
 ├── Retrieve financial context
 │
 ▼
AI Gateway
 │
 ▼
Python AI Service
 │
 ├── Context processing
 ├── Financial calculations
 ├── Relevant data retrieval
 ├── LLM
 │
 ▼
AI Response
 │
 ▼
Node.js
 │
 ▼
React Native
```

---

# 24. AI Context Construction

The AI should not receive the entire database.

Instead, the backend should construct a minimal context.

```text
User Question
      │
      ▼
Intent Detection
      │
      ▼
Relevant Financial Data
      │
      ├── Current month expenses
      ├── Previous month expenses
      ├── Categories
      └── Income
      │
      ▼
Context Builder
      │
      ▼
LLM
```

Example:

```json
{
  "income": 100000,
  "currentMonthExpenses": 64200,
  "previousMonthExpenses": 58100,
  "topCategories": [
    {
      "name": "Food",
      "amount": 10200
    }
  ]
}
```

---

# 25. AI Transaction Classification

Transaction classification should follow:

```text
Transaction
     │
     ▼
Preprocessing
     │
     ▼
Merchant normalization
     │
     ▼
Classifier
     │
     ▼
Category + Confidence
```

Example:

```json
{
  "merchant": "SWIGGY",
  "amount": 450,
  "category": "Food",
  "subCategory": "Delivery",
  "confidence": 0.96
}
```

If confidence is below a configured threshold:

```text
confidence < threshold
        │
        ▼
Ask user
        │
        ▼
User correction
        │
        ▼
Store corrected category
```

User corrections can later be used to improve personalization.

---

# 26. RAG Architecture

The financial education system can use RAG.

```text
                 Knowledge Documents
                        │
                        ▼
                   Chunking
                        │
                        ▼
                   Embeddings
                        │
                        ▼
                  Vector Store
                        │
                        │
User Question ──────────┤
                        ▼
                   Retrieval
                        │
                        ▼
                Context Builder
                        │
                        ▼
                       LLM
                        │
                        ▼
                     Answer
```

RAG should primarily be used for:

* Financial education
* Definitions
* Explanations
* Application knowledge
* Financial concepts

---

# 27. AI + Deterministic Data

The AI architecture must separate:

### Deterministic Layer

Responsible for:

* Calculations
* Totals
* Percentages
* Debt balances
* Cash flow
* Savings rate
* Goal progress

### AI Layer

Responsible for:

* Explanation
* Interpretation
* Natural language
* Education
* Summarization
* Conversational interaction

```text
Financial Data
      │
      ▼
Deterministic Engine
      │
      ├── ₹64,200 expenses
      ├── ₹35,800 savings
      └── 35.8% savings rate
                │
                ▼
            AI / LLM
                │
                ▼
"Your savings rate is 35.8%..."
```

---

# 28. Edge AI Architecture

ExecuTorch can be introduced for lightweight models.

```text
React Native
     │
     ▼
Native AI Module
     │
     ▼
ExecuTorch
     │
     ▼
Local Model
     │
     ▼
Prediction
```

Good candidates:

* Transaction classification
* Merchant classification
* Simple anomaly detection

Not recommended initially:

* Large LLM
* Complex financial reasoning
* Large RAG workloads

---

# 29. Native Architecture

## iOS

```text
React Native
      │
      ▼
Native Module
      │
      ▼
Swift
      │
      ▼
Apple APIs
```

Apple Watch:

```text
iPhone
  │
  ▼
WatchConnectivity
  │
  ▼
Apple Watch
  │
  ▼
SwiftUI
```

---

# 30. Android

```text
React Native
      │
      ▼
Native Module
      │
      ▼
Kotlin
      │
      ▼
Android APIs
```

Wear OS:

```text
Android
   │
   ▼
Data Layer
   │
   ▼
Wear OS
   │
   ▼
Jetpack Compose
```

---

# 31. Authentication Architecture

Authentication uses:

```text
Access Token
+
Refresh Token
```

Flow:

```text
Login
 │
 ▼
Node.js
 │
 ▼
Validate credentials
 │
 ▼
Generate tokens
 │
 ├── Access Token
 │
 └── Refresh Token
```

Access tokens should be short-lived.

Refresh tokens should be securely stored and managed.

---

# 32. API Authentication

Every protected API request:

```text
Mobile
 │
 ▼
Authorization: Bearer <access_token>
 │
 ▼
Auth Middleware
 │
 ▼
Validate JWT
 │
 ▼
Extract userId
 │
 ▼
Controller
```

The backend must never trust a user ID supplied directly by the client.

---

# 33. Database Architecture

PostgreSQL is the authoritative server-side database.

```text
PostgreSQL
│
├── users
├── sessions
├── expenses
├── income
├── categories
├── recurring_transactions
├── goals
├── debts
├── financial_snapshots
├── ai_insights
└── sync_metadata
```

---

# 34. Data Ownership

Every user-owned record should contain:

```text
user_id
```

Example:

```text
expenses
├── id
├── user_id
├── amount
├── category_id
└── created_at
```

Queries must always scope data by authenticated `user_id`.

---

# 35. Data Flow — Add Expense

```text
User
 │
 ▼
Add Expense Screen
 │
 ▼
Zustand
 │
 ▼
Expense Repository
 │
 ▼
SQLite
 │
 ├── Save locally
 │
 └── Add sync job
       │
       ▼
   Network Available?
       │
      YES
       │
       ▼
    REST API
       │
       ▼
   Node.js
       │
       ▼
Expense Service
       │
       ▼
 PostgreSQL
       │
       ▼
 Sync Confirmation
       │
       ▼
 SQLite
```

---

# 36. Data Flow — AI Insight

```text
Scheduled Job / User Request
             │
             ▼
       Node.js Backend
             │
             ▼
     Analytics Service
             │
             ▼
       Financial Data
             │
             ▼
     Deterministic Metrics
             │
             ▼
        AI Gateway
             │
             ▼
       Python AI Service
             │
             ▼
            LLM
             │
             ▼
       AI Insight
             │
             ▼
        PostgreSQL
             │
             ▼
        Mobile App
```

---

# 37. Data Flow — Monthly Report

```text
Month End
    │
    ▼
Report Generator
    │
    ▼
Financial Calculations
    │
    ├── Income
    ├── Expenses
    ├── Savings
    ├── Categories
    ├── Trends
    └── Goals
    │
    ▼
AI Summary
    │
    ▼
Monthly Report
    │
    ▼
PostgreSQL
    │
    ▼
Mobile Application
```

---

# 38. Caching Architecture

Caching should exist at multiple levels.

```text
Mobile
 │
 ├── SQLite cache
 │
 ▼
Backend
 │
 ├── Application cache
 │
 ▼
PostgreSQL
```

The first implementation can rely primarily on SQLite + PostgreSQL.

A dedicated Redis layer can be introduced later if required.

---

# 39. Background Processing

Long-running operations should not block API requests.

Potential background jobs:

* Monthly reports
* AI insights
* Recurring expense detection
* Anomaly detection
* Notification generation
* Data aggregation

Architecture:

```text
API / Scheduler
      │
      ▼
Job Queue
      │
      ▼
Worker
      │
      ├── Analytics
      ├── AI
      └── Notifications
```

A queue system can be introduced when the application grows.

---

# 40. Security Architecture

```text
                  HTTPS
                    │
                    ▼
               API Gateway
                    │
              Authentication
                    │
              Authorization
                    │
             Input Validation
                    │
              Business Logic
                    │
              Data Access
                    │
                 Database
```

Security requirements:

* HTTPS
* JWT authentication
* Refresh token rotation
* Password hashing
* Input validation
* Rate limiting
* Secure headers
* SQL injection protection
* Authorization checks
* Secure local token storage

---

# 41. AI Privacy Architecture

Sensitive financial information should be minimized before sending it to AI services.

Instead of:

```text
Full User Database
       │
       ▼
      LLM
```

Use:

```text
User Database
     │
     ▼
Relevant Data Selection
     │
     ▼
Data Minimization
     │
     ▼
Context Builder
     │
     ▼
LLM
```

Example:

Instead of sending every transaction, send:

```json
{
  "currentMonth": {
    "income": 100000,
    "expenses": 64200,
    "savings": 35800
  },
  "topCategories": [
    {
      "category": "Food",
      "amount": 10200
    }
  ]
}
```

---

# 42. Error Handling Architecture

Errors should flow through standardized layers.

```text
Error
 │
 ▼
Service
 │
 ▼
Controller
 │
 ▼
Global Error Middleware
 │
 ▼
Standard API Response
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "EXPENSE_NOT_FOUND",
    "message": "Expense not found"
  }
}
```

The mobile application should convert backend errors into user-friendly messages.

---

# 43. Observability

The backend should eventually support:

* Structured logging
* Error tracking
* API latency monitoring
* AI latency monitoring
* Database performance monitoring
* Sync failure monitoring

Example:

```text
Request
 │
 ├── request_id
 ├── user_id
 ├── endpoint
 ├── duration
 └── status
```

---

# 44. Configuration Management

Environment variables should be used.

Example:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
AI_SERVICE_URL
AI_API_KEY
```

Secrets must never be committed to Git.

Use:

```text
.env
.env.example
```

`.env` should be included in `.gitignore`.

---

# 45. Deployment Architecture

Initial deployment:

```text
                  Internet
                     │
                     ▼
               HTTPS / Domain
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      Node.js API          Python AI API
          │                     │
          ▼                     ▼
     PostgreSQL             AI Models
```

The mobile application communicates only with the public backend API.

The AI service should preferably remain private and accessible only by the backend.

---

# 46. Production Architecture

Future production architecture:

```text
                         Internet
                            │
                            ▼
                       Load Balancer
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          Node API       Node API      Node API
              │             │             │
              └─────────────┼─────────────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
             PostgreSQL             Redis
                 │                     │
                 │                 Cache/Queue
                 │                     │
                 ▼                     ▼
             Read Replica           Workers
                                       │
                                       ▼
                                  AI Service
                                       │
                            ┌──────────┼─────────┐
                            ▼          ▼         ▼
                           LLM      RAG       ML Models
```

---

# 47. Mobile-to-Backend Boundary

The mobile application should never directly access:

* PostgreSQL
* AI provider APIs
* AI API keys
* Internal services

Correct:

```text
Mobile → Node.js → PostgreSQL
Mobile → Node.js → AI Service
```

Incorrect:

```text
Mobile → PostgreSQL
Mobile → AI Provider
```

---

# 48. Backend-to-AI Boundary

Node.js acts as the **security and orchestration boundary**.

```text
                   Node.js
                      │
              ┌───────┴────────┐
              │                │
        Financial Data      AI Request
              │                │
              └───────┬────────┘
                      ▼
                  AI Gateway
                      │
                      ▼
                Python AI API
```

The AI service should not independently retrieve arbitrary user database data.

---

# 49. API Versioning

REST APIs should be versioned.

Example:

```text
/api/v1/auth
/api/v1/expenses
/api/v1/income
/api/v1/analytics
/api/v1/goals
/api/v1/debts
/api/v1/ai
```

Future:

```text
/api/v2/...
```

This allows API evolution without breaking older mobile versions.

---

# 50. Architecture Decision Records

Important architectural decisions should be documented.

Recommended directory:

```text
docs/
└── architecture/
    ├── ADR-001-react-native.md
    ├── ADR-002-offline-first.md
    ├── ADR-003-zustand.md
    ├── ADR-004-sqlite.md
    ├── ADR-005-postgresql.md
    ├── ADR-006-ai-service.md
    └── ADR-007-rag.md
```

Example:

```text
ADR-002

Decision:
Use an offline-first architecture.

Reason:
Expense entry should work without network connectivity.

Trade-off:
Requires synchronization and conflict resolution.
```

---

# 51. Testing Architecture

Testing should exist at every layer.

```text
                 Testing
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
     Mobile       Backend        AI
       │            │            │
     Jest        Jest/Supertest  PyTest
       │            │            │
       ▼            ▼            ▼
 Components       APIs         Models
 Stores            Services    Prompts
 Repositories      DB          RAG
```

---

# 52. CI/CD Architecture

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Lint
    ├── Type Check
    ├── Unit Tests
    ├── API Tests
    ├── AI Tests
    ├── Build
    └── Security Checks
    │
    ▼
Deployment
```

---

# 53. Recommended Development Phases

## Phase 1 — Foundation

```text
React Native
TypeScript
Navigation
Zustand
SQLite
```

Deliver:

* App shell
* Navigation
* Local database
* Expense CRUD
* Income CRUD

---

## Phase 2 — Backend

```text
Node.js
Express
PostgreSQL
JWT
REST API
```

Deliver:

* Authentication
* Expense API
* Income API
* Sync API

---

## Phase 3 — Offline Sync

```text
SQLite
     │
     ▼
Sync Queue
     │
     ▼
REST
     │
     ▼
PostgreSQL
```

Deliver:

* Offline creation
* Background synchronization
* Retry
* Conflict handling

---

## Phase 4 — Analytics

Deliver:

* Cash flow
* Spending trends
* Category analysis
* Savings rate
* Monthly reports

---

## Phase 5 — AI

Deliver:

* Transaction classifier
* AI insights
* AI chat
* Financial summaries

---

## Phase 6 — RAG

Deliver:

* Knowledge ingestion
* Embeddings
* Retrieval
* Financial education assistant

---

## Phase 7 — Edge AI

Deliver:

* PyTorch models
* ExecuTorch conversion
* On-device classification
* Offline AI capabilities

---

## Phase 8 — Wearables

Deliver:

* Apple Watch
* Wear OS
* Quick expense entry
* Spending notifications
* Goal progress

---

# 54. Architecture Evolution

The architecture should evolve gradually.

### MVP

```text
React Native
      │
      ▼
Node.js
      │
      ▼
PostgreSQL
```

### AI Version

```text
React Native
      │
      ▼
Node.js
   │     │
   ▼     ▼
Postgres AI
```

### Scalable Version

```text
React Native
      │
      ▼
API Gateway
      │
 ┌────┼─────┐
 ▼    ▼     ▼
API  AI   Workers
 │    │     │
 ▼    ▼     ▼
DB   Models Queue
```

The system should **not introduce microservices prematurely**.

Start as a modular monolith for the backend and split services only when scale or deployment requirements justify it.

---

# 55. Key Architectural Decisions

| Decision     | Choice                     | Reason                       |
| ------------ | -------------------------- | ---------------------------- |
| Mobile       | React Native               | Cross-platform               |
| Language     | TypeScript                 | Type safety                  |
| State        | Zustand                    | Lightweight state management |
| Local DB     | SQLite                     | Offline-first                |
| Backend      | Node.js + Express          | Familiar REST backend        |
| Database     | PostgreSQL                 | Reliable relational storage  |
| API          | REST                       | Simple and portable          |
| Auth         | JWT + Refresh Token        | Stateless API authentication |
| AI           | Separate Python service    | ML ecosystem                 |
| ML           | PyTorch                    | Model development            |
| Edge AI      | ExecuTorch                 | On-device inference          |
| AI Knowledge | RAG                        | Grounded education           |
| Wearables    | Native platforms           | Better device integration    |
| CI/CD        | GitHub Actions             | Automation                   |
| Architecture | Modular monolith initially | Simpler development          |

---

# 56. Golden Rules

The following rules should be followed throughout development.

### Rule 1

**SQLite is the source of truth while offline.**

### Rule 2

**PostgreSQL is the server-side source of truth.**

### Rule 3

**The LLM is never the source of truth for financial calculations.**

### Rule 4

**The backend owns authentication and authorization.**

### Rule 5

**The mobile application never directly accesses PostgreSQL.**

### Rule 6

**The mobile application never exposes AI API keys.**

### Rule 7

**Financial calculations must be deterministic and testable.**

### Rule 8

**AI should receive only the minimum required financial context.**

### Rule 9

**Every user-owned database record must be scoped to the authenticated user.**

### Rule 10

**Start simple; introduce distributed infrastructure only when required.**

---

# 57. Final Architecture

```text
                           AI EXPENSE COMPANION
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
       React Native             Backend                   AI
        Mobile App            Node.js/Express          Python
             │                      │                      │
       ┌─────┼─────┐          ┌─────┼──────┐        ┌────┼────┐
       │     │     │          │     │      │        │    │    │
       ▼     ▼     ▼          ▼     ▼      ▼        ▼    ▼    ▼
      UI   Zustand SQLite    Auth  Logic Analytics  LLM Class RAG
             │                  │     │      │       │    │    │
             │                  └─────┼──────┘       │    │    │
             │                        │              │    │    │
             └──────── REST ─────────┘              │    │    │
                                      │              │    │    │
                                      ▼              └────┼────┘
                                 PostgreSQL                │
                                      │                    │
                                      └──── AI Gateway ────┘
```

---

# 58. Architecture Objective

The final system should achieve the following:

```text
             RAW FINANCIAL DATA
                     │
                     ▼
               TRACK EXPENSES
                     │
                     ▼
              STORE LOCALLY
                     │
                     ▼
               SYNCHRONIZE
                     │
                     ▼
             ANALYZE FINANCES
                     │
                     ▼
              AI UNDERSTANDS
                     │
                     ▼
             EXPLAIN TO USER
                     │
                     ▼
             EDUCATE THE USER
                     │
                     ▼
              IMPROVE HABITS
                     │
                     ▼
             ACHIEVE FINANCIAL
                   GOALS
```

> **The architecture is designed so that AI is an intelligent layer on top of a reliable financial data platform—not a replacement for the financial data platform itself.**
