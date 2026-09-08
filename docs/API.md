# AI Expense Companion

# API Specification

**Document:** `API.md`
**Version:** 1.0
**Status:** Draft
**Base URL:** `/api/v1`

---

# 1. API Overview

AI Expense Companion exposes a REST API for:

* Authentication
* User management
* Expenses
* Income
* Categories
* Dashboard
* Analytics
* Financial goals
* Debts
* Recurring transactions
* Synchronization
* AI
* Notifications

The API follows REST principles and returns JSON responses.

```text
React Native
     │
     │ HTTPS
     ▼
Node.js + Express
     │
     ├── Authentication
     ├── Business Logic
     ├── Financial Calculations
     ├── AI Gateway
     │
     ▼
PostgreSQL
```

---

# 2. Base URL

Development:

```text
http://localhost:5000/api/v1
```

Production:

```text
https://api.example.com/api/v1
```

---

# 3. API Standards

## Request Format

```http
Content-Type: application/json
```

## Response Format

All API responses should follow a consistent structure.

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "EXPENSE_NOT_FOUND",
    "message": "Expense not found"
  }
}
```

---

# 4. Authentication

Protected endpoints require:

```http
Authorization: Bearer <access_token>
```

Authentication uses:

* JWT access token
* Refresh token

---

# 5. Authentication APIs

## 5.1 Register

```http
POST /auth/register
```

### Request

```json
{
  "name": "Rajesh",
  "email": "user@example.com",
  "password": "StrongPassword123",
  "currency": "INR"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "name": "Rajesh",
      "email": "user@example.com",
      "currency": "INR"
    }
  },
  "message": "Registration successful"
}
```

---

# 6. Login

```http
POST /auth/login
```

### Request

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "refresh_token",
    "expiresIn": 900,
    "user": {
      "id": "usr_123",
      "name": "Rajesh",
      "email": "user@example.com"
    }
  }
}
```

---

# 7. Refresh Token

```http
POST /auth/refresh
```

### Request

```json
{
  "refreshToken": "refresh_token"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 900
  }
}
```

---

# 8. Logout

```http
POST /auth/logout
```

Authentication required.

### Request

```json
{
  "refreshToken": "refresh_token"
}
```

### Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

# 9. Current User

```http
GET /auth/me
```

Authentication required.

### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "name": "Rajesh",
    "email": "user@example.com",
    "currency": "INR"
  }
}
```

---

# 10. User APIs

## Get Profile

```http
GET /users/me
```

## Update Profile

```http
PUT /users/me
```

### Request

```json
{
  "name": "Rajesh",
  "currency": "INR"
}
```

---

# 11. Expense APIs

## 11.1 Get Expenses

```http
GET /expenses
```

### Query Parameters

```text
page
limit
startDate
endDate
category
paymentMethod
search
sort
```

Example:

```text
GET /expenses?page=1&limit=20&category=food
```

### Response

```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "exp_001",
        "amount": 450,
        "currency": "INR",
        "category": "Food",
        "subCategory": "Delivery",
        "merchant": "Swiggy",
        "paymentMethod": "UPI",
        "date": "2026-09-08",
        "note": "Dinner",
        "isRecurring": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

# 12. Get Single Expense

```http
GET /expenses/:id
```

Example:

```text
GET /expenses/exp_001
```

---

# 13. Create Expense

```http
POST /expenses
```

### Request

```json
{
  "amount": 450,
  "currency": "INR",
  "categoryId": "cat_food",
  "subCategory": "Delivery",
  "merchant": "Swiggy",
  "paymentMethod": "UPI",
  "date": "2026-09-08",
  "note": "Dinner",
  "isRecurring": false
}
```

### Response

```json
{
  "success": true,
  "data": {
    "expense": {
      "id": "exp_001",
      "amount": 450,
      "category": "Food",
      "merchant": "Swiggy",
      "date": "2026-09-08"
    }
  },
  "message": "Expense created successfully"
}
```

---

# 14. Update Expense

```http
PUT /expenses/:id
```

### Request

```json
{
  "amount": 500,
  "categoryId": "cat_food",
  "note": "Dinner with friends"
}
```

---

# 15. Delete Expense

```http
DELETE /expenses/:id
```

### Response

```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

# 16. Bulk Expense Synchronization

Used by the mobile offline sync engine.

```http
POST /expenses/sync
```

### Request

```json
{
  "deviceId": "device_123",
  "operations": [
    {
      "operation": "CREATE",
      "clientId": "local_exp_001",
      "amount": 450,
      "currency": "INR",
      "categoryId": "cat_food",
      "merchant": "Swiggy",
      "date": "2026-09-08",
      "updatedAt": "2026-09-08T10:30:00Z"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "clientId": "local_exp_001",
        "serverId": "exp_001",
        "status": "synced"
      }
    ]
  }
}
```

---

# 17. Income APIs

## Get Income

```http
GET /income
```

## Get Single Income

```http
GET /income/:id
```

## Create Income

```http
POST /income
```

### Request

```json
{
  "amount": 100000,
  "currency": "INR",
  "source": "Salary",
  "date": "2026-09-01",
  "isRecurring": true
}
```

## Update Income

```http
PUT /income/:id
```

## Delete Income

```http
DELETE /income/:id
```

---

# 18. Income Sync

```http
POST /income/sync
```

The request/response format follows the same synchronization model as expenses.

---

# 19. Category APIs

## Get Categories

```http
GET /categories
```

### Query

```text
GET /categories?type=expense
```

### Response

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_food",
        "name": "Food",
        "type": "expense",
        "subCategories": [
          "Groceries",
          "Restaurants",
          "Delivery",
          "Coffee"
        ]
      }
    ]
  }
}
```

---

# 20. Create Category

```http
POST /categories
```

### Request

```json
{
  "name": "Pets",
  "type": "expense"
}
```

---

# 21. Update Category

```http
PUT /categories/:id
```

---

# 22. Delete Category

```http
DELETE /categories/:id
```

System categories should not be deleted by users.

---

# 23. Dashboard API

## Get Dashboard

```http
GET /dashboard
```

### Query

```text
GET /dashboard?month=2026-09
```

### Response

```json
{
  "success": true,
  "data": {
    "period": "2026-09",
    "income": 100000,
    "expenses": 64200,
    "savings": 35800,
    "savingsRate": 35.8,
    "topCategory": {
      "name": "Housing",
      "amount": 20000
    },
    "recentTransactions": [],
    "upcomingPayments": [],
    "aiInsights": []
  }
}
```

---

# 24. Analytics APIs

## Spending Analysis

```http
GET /analytics/spending
```

### Query

```text
GET /analytics/spending?startDate=2026-01-01&endDate=2026-09-08
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 512000,
    "averageMonthly": 56888,
    "categories": [
      {
        "category": "Food",
        "amount": 85000,
        "percentage": 16.6
      }
    ]
  }
}
```

---

# 25. Category Analytics

```http
GET /analytics/categories
```

### Query

```text
GET /analytics/categories?month=2026-09
```

---

# 26. Cash Flow Analytics

```http
GET /analytics/cashflow
```

### Response

```json
{
  "success": true,
  "data": {
    "income": 100000,
    "expenses": 64200,
    "netCashFlow": 35800,
    "savingsRate": 35.8
  }
}
```

---

# 27. Spending Trends

```http
GET /analytics/trends
```

### Response

```json
{
  "success": true,
  "data": {
    "monthly": [
      {
        "month": "2026-06",
        "income": 100000,
        "expenses": 58000,
        "savings": 42000
      },
      {
        "month": "2026-07",
        "income": 100000,
        "expenses": 61000,
        "savings": 39000
      },
      {
        "month": "2026-08",
        "income": 100000,
        "expenses": 64200,
        "savings": 35800
      }
    ]
  }
}
```

---

# 28. Financial Health API

```http
GET /analytics/financial-health
```

### Response

```json
{
  "success": true,
  "data": {
    "score": 74,
    "factors": {
      "savings": 80,
      "debt": 60,
      "emergencyFund": 70,
      "spending": 80,
      "consistency": 90
    },
    "changes": [
      {
        "factor": "spending",
        "impact": -4,
        "reason": "Discretionary spending increased"
      }
    ]
  }
}
```

The score calculation must be deterministic.

---

# 29. Financial Goals APIs

## Get Goals

```http
GET /goals
```

## Get Goal

```http
GET /goals/:id
```

## Create Goal

```http
POST /goals
```

### Request

```json
{
  "name": "Emergency Fund",
  "targetAmount": 300000,
  "currentAmount": 80000,
  "targetDate": "2027-12-31",
  "priority": "high"
}
```

---

# 30. Update Goal

```http
PUT /goals/:id
```

---

# 31. Delete Goal

```http
DELETE /goals/:id
```

---

# 32. Goal Progress

```http
GET /goals/:id/progress
```

### Response

```json
{
  "success": true,
  "data": {
    "targetAmount": 300000,
    "currentAmount": 80000,
    "remainingAmount": 220000,
    "percentage": 26.67,
    "monthlyRequired": 15714
  }
}
```

---

# 33. Debt APIs

## Get Debts

```http
GET /debts
```

## Get Debt

```http
GET /debts/:id
```

## Create Debt

```http
POST /debts
```

### Request

```json
{
  "lender": "Example Bank",
  "principal": 1000000,
  "outstandingAmount": 850000,
  "interestRate": 8.5,
  "emi": 12500,
  "startDate": "2026-01-01",
  "endDate": "2031-01-01"
}
```

---

# 34. Update Debt

```http
PUT /debts/:id
```

---

# 35. Delete Debt

```http
DELETE /debts/:id
```

---

# 36. Debt Analysis

```http
GET /debts/:id/analysis
```

### Response

```json
{
  "success": true,
  "data": {
    "outstandingAmount": 850000,
    "emi": 12500,
    "interestRate": 8.5,
    "estimatedInterestRemaining": 125000,
    "estimatedMonthsRemaining": 48
  }
}
```

---

# 37. Debt Summary

```http
GET /analytics/debt
```

### Response

```json
{
  "success": true,
  "data": {
    "totalDebt": 1250000,
    "monthlyEMI": 32500,
    "debtToIncomeRatio": 32.5
  }
}
```

---

# 38. Recurring Transaction APIs

## Get Recurring Transactions

```http
GET /recurring
```

## Create Recurring Transaction

```http
POST /recurring
```

### Request

```json
{
  "type": "expense",
  "name": "Netflix",
  "amount": 649,
  "frequency": "monthly",
  "nextDate": "2026-10-01",
  "categoryId": "cat_subscription"
}
```

---

# 39. Update Recurring Transaction

```http
PUT /recurring/:id
```

---

# 40. Delete Recurring Transaction

```http
DELETE /recurring/:id
```

---

# 41. AI APIs

AI endpoints are accessed through the Node.js backend.

The mobile application should **never communicate directly with the AI provider**.

```text
React Native
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

---

# 42. AI Chat

```http
POST /ai/chat
```

### Request

```json
{
  "message": "Why did I spend more this month?",
  "conversationId": "conv_123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123",
    "message": {
      "role": "assistant",
      "content": "Your spending increased by 14% compared with last month. Food and shopping were the main contributors."
    }
  }
}
```

---

# 43. AI Chat Context

The backend should construct the financial context.

```text
User Question
      │
      ▼
Node.js
      │
      ▼
Determine Relevant Data
      │
      ├── Income
      ├── Expenses
      ├── Categories
      ├── Goals
      └── Debts
      │
      ▼
AI Context
      │
      ▼
Python AI Service
```

The complete database should never be blindly sent to the LLM.

---

# 44. AI Transaction Categorization

```http
POST /ai/categorize
```

### Request

```json
{
  "merchant": "SWIGGY",
  "description": "SWIGGY INSTAMART",
  "amount": 850
}
```

### Response

```json
{
  "success": true,
  "data": {
    "category": "Food",
    "subCategory": "Groceries",
    "confidence": 0.94
  }
}
```

---

# 45. AI Bulk Categorization

```http
POST /ai/categorize/bulk
```

### Request

```json
{
  "transactions": [
    {
      "id": "local_001",
      "merchant": "SWIGGY",
      "amount": 450
    },
    {
      "id": "local_002",
      "merchant": "AMAZON",
      "amount": 2500
    }
  ]
}
```

---

# 46. AI Spending Analysis

```http
POST /ai/analyze
```

### Request

```json
{
  "period": {
    "startDate": "2026-09-01",
    "endDate": "2026-09-30"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "summary": "Your spending increased compared with the previous month.",
    "insights": [
      {
        "type": "spending_increase",
        "category": "Food",
        "amount": 1800,
        "message": "Food spending increased by ₹1,800."
      }
    ]
  }
}
```

---

# 47. AI Insights

```http
GET /ai/insights
```

### Query

```text
GET /ai/insights?month=2026-09
```

### Response

```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "id": "ins_001",
        "type": "unusual_spending",
        "title": "Food spending increased",
        "description": "Your food expenses are 22% higher than your usual average.",
        "severity": "medium"
      }
    ]
  }
}
```

---

# 48. Monthly AI Report

```http
GET /ai/monthly-report
```

### Query

```text
GET /ai/monthly-report?month=2026-09
```

### Response

```json
{
  "success": true,
  "data": {
    "month": "2026-09",
    "summary": "You saved 35.8% of your income this month.",
    "highlights": [
      "Food spending increased by ₹1,800.",
      "Shopping decreased by ₹2,300."
    ],
    "recommendations": [
      "Review recurring subscriptions.",
      "Monitor restaurant spending."
    ],
    "financialLesson": {
      "topic": "Savings Rate",
      "explanation": "Savings rate represents the percentage of income remaining after expenses."
    }
  }
}
```

---

# 49. Financial Education API

```http
POST /ai/education
```

### Request

```json
{
  "question": "What is an emergency fund?"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "topic": "Emergency Fund",
    "answer": "An emergency fund is money kept aside for unexpected expenses.",
    "personalizedContext": {
      "monthlyEssentialExpenses": 35000,
      "recommendedRange": {
        "threeMonths": 105000,
        "sixMonths": 210000
      }
    }
  }
}
```

---

# 50. RAG Search API

```http
POST /ai/education/search
```

### Request

```json
{
  "query": "How does compound interest work?"
}
```

### Internal flow

```text
Question
   │
   ▼
Embedding
   │
   ▼
Vector Search
   │
   ▼
Relevant Documents
   │
   ▼
LLM
   │
   ▼
Answer
```

---

# 51. AI Feedback

Users should be able to provide feedback on AI responses.

```http
POST /ai/feedback
```

### Request

```json
{
  "messageId": "msg_123",
  "rating": "positive",
  "reason": "Helpful explanation"
}
```

Possible ratings:

```text
positive
negative
```

---

# 52. Sync APIs

Offline-first synchronization is a core part of the application.

## Sync Status

```http
GET /sync/status
```

### Response

```json
{
  "success": true,
  "data": {
    "lastSyncAt": "2026-09-08T10:30:00Z",
    "serverVersion": 124,
    "pendingChanges": 0
  }
}
```

---

# 53. Full Sync

```http
POST /sync
```

### Request

```json
{
  "deviceId": "device_123",
  "lastSyncAt": "2026-09-08T10:00:00Z",
  "changes": [
    {
      "entity": "expense",
      "operation": "CREATE",
      "clientId": "local_123",
      "data": {
        "amount": 450,
        "categoryId": "cat_food"
      }
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "accepted": [
      {
        "clientId": "local_123",
        "serverId": "exp_456"
      }
    ],
    "updated": [],
    "conflicts": [],
    "deleted": [],
    "serverTimestamp": "2026-09-08T10:35:00Z"
  }
}
```

---

# 54. Sync Conflict Response

Example:

```json
{
  "success": true,
  "data": {
    "conflicts": [
      {
        "entity": "expense",
        "entityId": "exp_123",
        "clientVersion": 4,
        "serverVersion": 5,
        "resolution": "server_wins"
      }
    ]
  }
}
```

---

# 55. Notification APIs

## Get Notifications

```http
GET /notifications
```

## Mark as Read

```http
PUT /notifications/:id/read
```

## Mark All as Read

```http
PUT /notifications/read-all
```

---

# 56. API Pagination

List endpoints should use pagination.

```text
?page=1&limit=20
```

Response:

```json
{
  "page": 1,
  "limit": 20,
  "total": 152,
  "totalPages": 8
}
```

Default:

```text
page = 1
limit = 20
```

Maximum:

```text
limit = 100
```

---

# 57. Filtering

Example:

```text
GET /expenses?
startDate=2026-09-01
&endDate=2026-09-30
&category=Food
&paymentMethod=UPI
```

---

# 58. Sorting

Example:

```text
GET /expenses?sort=date_desc
```

Supported:

```text
date_asc
date_desc
amount_asc
amount_desc
created_asc
created_desc
```

---

# 59. Search

```text
GET /expenses?search=swiggy
```

Search can match:

* Merchant
* Description
* Notes

---

# 60. Date Format

All API dates should use ISO 8601.

Example:

```text
2026-09-08
```

Datetime:

```text
2026-09-08T10:30:00Z
```

The backend should store timestamps consistently in UTC.

---

# 61. Currency

The API should use ISO 4217 currency codes.

Examples:

```text
INR
USD
EUR
GBP
```

Amount values should be represented as numeric values.

---

# 62. Idempotency

Create/sync APIs should support idempotency.

Example:

```http
Idempotency-Key: 8f7c2a91-1234
```

This prevents duplicate transactions when a mobile device retries a request.

Example:

```text
Offline request
     │
     ▼
API request
     │
     X Network failure
     │
     ▼
Retry
     │
     ▼
Same Idempotency-Key
     │
     ▼
Server recognizes request
     │
     ▼
No duplicate transaction
```

---

# 63. Error Codes

Standard error codes:

| Code               | Meaning                  |
| ------------------ | ------------------------ |
| INVALID_REQUEST    | Invalid request          |
| VALIDATION_ERROR   | Validation failed        |
| UNAUTHORIZED       | Authentication required  |
| INVALID_TOKEN      | Invalid JWT              |
| TOKEN_EXPIRED      | Access token expired     |
| FORBIDDEN          | Permission denied        |
| USER_NOT_FOUND     | User not found           |
| EXPENSE_NOT_FOUND  | Expense not found        |
| INCOME_NOT_FOUND   | Income not found         |
| GOAL_NOT_FOUND     | Goal not found           |
| DEBT_NOT_FOUND     | Debt not found           |
| CATEGORY_NOT_FOUND | Category not found       |
| SYNC_CONFLICT      | Synchronization conflict |
| AI_UNAVAILABLE     | AI service unavailable   |
| AI_TIMEOUT         | AI request timed out     |
| INTERNAL_ERROR     | Internal server error    |

---

# 64. HTTP Status Codes

| Status | Usage                          |
| ------ | ------------------------------ |
| 200    | Successful request             |
| 201    | Resource created               |
| 204    | Successful deletion/no content |
| 400    | Bad request                    |
| 401    | Unauthorized                   |
| 403    | Forbidden                      |
| 404    | Resource not found             |
| 409    | Conflict                       |
| 422    | Validation error               |
| 429    | Rate limit exceeded            |
| 500    | Server error                   |
| 503    | Service unavailable            |

---

# 65. API Rate Limiting

Rate limiting should be applied to:

* Login
* Registration
* AI endpoints
* Public APIs

AI endpoints should have stricter limits.

Example:

```text
Normal API:
100 requests/minute

AI API:
20 requests/minute
```

Exact production limits should be configured based on infrastructure and usage.

---

# 66. AI Timeout Strategy

AI requests should have a timeout.

```text
Mobile
  │
  ▼
Node.js
  │
  ▼
AI Service
  │
  ├── Success → Response
  │
  └── Timeout
          │
          ▼
      AI_TIMEOUT
```

The financial application itself should continue working even if AI is unavailable.

---

# 67. API Security

All protected endpoints must:

1. Validate JWT.
2. Extract authenticated user ID.
3. Validate request body.
4. Validate resource ownership.
5. Execute business logic.
6. Return sanitized response.

Example:

```text
GET /expenses/exp_123

JWT
 │
 ▼
userId = usr_001
 │
 ▼
SELECT *
FROM expenses
WHERE id = 'exp_123'
AND user_id = 'usr_001'
```

Never perform:

```text
SELECT *
FROM expenses
WHERE id = 'exp_123'
```

without checking ownership.

---

# 68. API Architecture

```text
                    HTTP Request
                         │
                         ▼
                    Express Router
                         │
                         ▼
                    Middleware
                    /    |    \
                   /     |     \
                Auth Validation RateLimit
                   \     |     /
                    ▼    ▼    ▼
                     Controller
                         │
                         ▼
                       Service
                         │
              ┌──────────┼───────────┐
              ▼          ▼           ▼
         Repository   Calculator   AI Gateway
              │          │           │
              ▼          │           ▼
         PostgreSQL      │       Python AI
                         │
                         ▼
                    API Response
```

---

# 69. Mobile API Client

React Native should have a centralized API client.

Recommended structure:

```text
mobile/src/services/

├── apiClient.ts
├── authApi.ts
├── expenseApi.ts
├── incomeApi.ts
├── categoryApi.ts
├── dashboardApi.ts
├── analyticsApi.ts
├── goalApi.ts
├── debtApi.ts
├── aiApi.ts
├── syncApi.ts
└── notificationApi.ts
```

---

# 70. API Client Responsibilities

`apiClient.ts` should handle:

* Base URL
* Authorization header
* Refresh token
* JSON serialization
* Common errors
* Timeouts
* Request IDs
* Retry logic where appropriate

Example:

```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

---

# 71. Token Refresh Flow

```text
Request
  │
  ▼
Access Token
  │
  ▼
Backend
  │
  X
401 TOKEN_EXPIRED
  │
  ▼
Refresh Token
  │
  ▼
POST /auth/refresh
  │
  ▼
New Access Token
  │
  ▼
Retry Original Request
```

If refresh fails:

```text
Refresh Failed
      │
      ▼
Clear Session
      │
      ▼
Navigate to Login
```

---

# 72. Offline API Behavior

The API client should know whether the operation can be performed offline.

### Offline-supported

```text
Create Expense
Update Expense
Delete Expense
View Expenses
Create Income
View Dashboard Cache
```

### Online-required

```text
AI Chat
AI RAG
Cloud Sync
Server-side reports
```

---

# 73. API + SQLite Repository

```text
ExpenseScreen
      │
      ▼
Zustand
      │
      ▼
ExpenseRepository
      │
      ├───────────────┐
      ▼               ▼
SQLite            API Client
      │               │
      ▼               ▼
Local Data       REST API
```

The repository decides which source should be used.

---

# 74. API Versioning

Current:

```text
/api/v1
```

Future:

```text
/api/v2
```

Versioning allows the backend to evolve without immediately breaking older mobile applications.

---

# 75. API Documentation

The API should eventually be represented using OpenAPI.

Recommended file:

```text
docs/
└── openapi.yaml
```

The OpenAPI specification can later be used to generate:

* API documentation
* TypeScript API types
* Client SDKs
* API testing
* Mock servers

---

# 76. Recommended Backend Structure

```text
backend/
└── src/
    │
    ├── app.ts
    ├── server.ts
    │
    ├── config/
    │
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── expenses.routes.ts
    │   ├── income.routes.ts
    │   ├── categories.routes.ts
    │   ├── dashboard.routes.ts
    │   ├── analytics.routes.ts
    │   ├── goals.routes.ts
    │   ├── debts.routes.ts
    │   ├── recurring.routes.ts
    │   ├── sync.routes.ts
    │   └── ai.routes.ts
    │
    ├── controllers/
    │
    ├── services/
    │
    ├── repositories/
    │
    ├── calculators/
    │
    ├── middleware/
    │
    ├── validators/
    │
    └── types/
```

---

# 77. API Development Priority

The recommended implementation order is:

```text
1. Health Check
       ↓
2. Authentication
       ↓
3. Users
       ↓
4. Categories
       ↓
5. Expenses
       ↓
6. Income
       ↓
7. Dashboard
       ↓
8. Analytics
       ↓
9. Goals
       ↓
10. Debts
       ↓
11. Recurring Transactions
       ↓
12. Sync
       ↓
13. AI Categorization
       ↓
14. AI Chat
       ↓
15. AI Insights
       ↓
16. RAG Education
       ↓
17. Notifications
```

---

# 78. Health Check

The first backend endpoint should be:

```http
GET /health
```

Response:

```json
{
  "success": true,
  "status": "healthy",
  "service": "ai-expense-companion-api",
  "version": "1.0.0"
}
```

This endpoint should not require authentication.

---

# 79. Complete Endpoint Summary

```text
AUTH
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

USERS
GET    /users/me
PUT    /users/me

EXPENSES
GET    /expenses
GET    /expenses/:id
POST   /expenses
PUT    /expenses/:id
DELETE /expenses/:id
POST   /expenses/sync

INCOME
GET    /income
GET    /income/:id
POST   /income
PUT    /income/:id
DELETE /income/:id
POST   /income/sync

CATEGORIES
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id

DASHBOARD
GET    /dashboard

ANALYTICS
GET    /analytics/spending
GET    /analytics/categories
GET    /analytics/cashflow
GET    /analytics/trends
GET    /analytics/financial-health
GET    /analytics/debt

GOALS
GET    /goals
GET    /goals/:id
POST   /goals
PUT    /goals/:id
DELETE /goals/:id
GET    /goals/:id/progress

DEBTS
GET    /debts
GET    /debts/:id
POST   /debts
PUT    /debts/:id
DELETE /debts/:id
GET    /debts/:id/analysis

RECURRING
GET    /recurring
POST   /recurring
PUT    /recurring/:id
DELETE /recurring/:id

SYNC
GET    /sync/status
POST   /sync

AI
POST   /ai/chat
POST   /ai/categorize
POST   /ai/categorize/bulk
POST   /ai/analyze
GET    /ai/insights
GET    /ai/monthly-report
POST   /ai/education
POST   /ai/education/search
POST   /ai/feedback

NOTIFICATIONS
GET    /notifications
PUT    /notifications/:id/read
PUT    /notifications/read-all

SYSTEM
GET    /health
```

---

# 80. API Design Principles

The following principles are mandatory for the initial implementation:

1. **All protected endpoints require authentication.**
2. **Every user-owned resource must be scoped to the authenticated user.**
3. **Financial calculations must be deterministic.**
4. **AI should explain and analyze data, not replace the calculation engine.**
5. **AI API keys must never reach the mobile application.**
6. **Offline operations must be supported for core transaction management.**
7. **Sync operations must be idempotent.**
8. **API responses should follow a consistent format.**
9. **Errors must use standardized error codes.**
10. **API versioning must be used from the beginning.**
11. **Pagination must be used for large collections.**
12. **Sensitive financial information should be minimized before AI processing.**
13. **Long-running AI operations should not block the financial transaction system.**
14. **The backend should remain usable even if the AI service is unavailable.**
15. **The API contract should eventually be formalized using OpenAPI.**

---

# 81. Final API Architecture

```text
                         MOBILE APP
                             │
                             │ HTTPS
                             ▼
                    ┌──────────────────┐
                    │   API / v1       │
                    │ Node + Express   │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
      Business           Financial           AI Gateway
       Services         Calculators              │
          │                  │                   ▼
          │                  │              Python AI
          │                  │                   │
          ▼                  ▼            ┌──────┼──────┐
      PostgreSQL        Deterministic     │      │      │
                          Results         LLM   ML     RAG
```

The core philosophy is:

```text
             API
              │
      ┌───────┴────────┐
      │                │
 Financial Truth       AI
      │                │
 Calculations       Explanation
 Analytics          Education
 Data               Insights
      │                │
      └───────┬────────┘
              ▼
       Better Decisions
```

> **The API is the boundary between the mobile application, the financial data platform, and the AI platform. It should keep authentication, authorization, financial calculations, synchronization, and AI orchestration clearly separated.**
