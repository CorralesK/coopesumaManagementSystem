# 🔌 REST API Documentation

<div align="center">

**Complete API Reference for CoopLink CR Management System**

[![REST](https://img.shields.io/badge/REST-API-green?style=for-the-badge)](.)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](.)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](.)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Base URL](#-base-url)
- [Authentication](#-authentication)
- [Request/Response Format](#-requestresponse-format)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Members](#members-endpoints)
  - [Assemblies](#assemblies-endpoints)
  - [Attendance](#attendance-endpoints)
  - [Savings](#savings-endpoints)
  - [Contributions](#contributions-endpoints)
  - [Surplus](#surplus-endpoints)
  - [Withdrawal Requests](#withdrawal-requests-endpoints)
  - [Liquidations](#liquidations-endpoints)
  - [Receipts](#receipts-endpoints)
  - [Notifications](#notifications-endpoints)
  - [Catalogs](#catalogs-endpoints)
  - [Reports](#reports-endpoints)
  - [Push Notifications](#push-notifications-endpoints)
  - [Cooperatives](#cooperatives-endpoints)
- [Webhooks](#-webhooks)

---

## 🎯 Overview

The CoopLink CR API is a RESTful service providing complete functionality for cooperative management. Built with Express.js, it follows REST conventions and uses JWT for authentication.

### API Characteristics

| Feature | Description |
|---------|-------------|
| **Protocol** | HTTPS (HTTP in development) |
| **Format** | JSON |
| **Authentication** | JWT Bearer Token |
| **Versioning** | URL-based (current: v1, implicit) |
| **Character Encoding** | UTF-8 |
| **Date Format** | ISO 8601 |
| **Timezone** | UTC |

### Module Summary

| Module | Base Path | Description |
|--------|-----------|-------------|
| Authentication | `/api/auth` | Microsoft OAuth & JWT |
| Users | `/api/users` | System user management |
| Members | `/api/members` | Cooperative member management |
| Assemblies | `/api/assemblies` | Assembly management |
| Attendance | `/api/attendance` | Attendance tracking |
| Savings | `/api/savings` | Savings account operations |
| Contributions | `/api/contributions` | Capital contribution management |
| Surplus | `/api/surplus` | Surplus distribution |
| Withdrawal Requests | `/api/withdrawal-requests` | Withdrawal workflow |
| Liquidations | `/api/liquidations` | Member liquidation |
| Receipts | `/api/receipts` | Receipt management |
| Notifications | `/api/notifications` | System notifications |
| Catalogs | `/api/catalogs` | Reference data |
| Reports | `/api/reports` | Report generation |
| Push | `/api/push` | Push notifications |
| Cooperatives | `/api/cooperatives` | Cooperative configuration |

---

## 🌐 Base URL

```
# Development
http://localhost:5000/api

# Production
https://your-backend-domain.com/api
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "environment": "production"
}
```

---

## 🔐 Authentication

### JWT Bearer Token

All protected endpoints require a valid JWT token in the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Token Lifecycle

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Login    │────>│  Microsoft OAuth │────>│  JWT Generated  │
│   (Frontend)    │     │    (Backend)     │     │   (24h valid)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                              ┌─────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Token sent in  │
                    │  Authorization  │
                    │     Header      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │   Valid Token   │           │  Invalid/Expired │
    │   → Process     │           │   → 401 Error   │
    └─────────────────┘           └─────────────────┘
```

### Role-Based Access

| Role | Access Level |
|------|--------------|
| `administrator` | Full access to all endpoints |
| `registrar` | Attendance registration only |
| `manager` | Financial operations |
| `member` | Own data only |

---

## 📋 Request/Response Format

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
```

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description for user",
  "error": "ERROR_CODE",
  "details": { ... }  // Optional validation errors
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Status | Usage |
|------|--------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, invalid input |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable Entity | Business rule violation |
| `500` | Internal Server Error | Server error |

### Error Codes Reference

#### Authentication Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | No valid token provided | 401 |
| `TOKEN_EXPIRED` | JWT token has expired | 401 |
| `TOKEN_INVALID` | JWT token is malformed | 401 |
| `USER_INACTIVE` | User account is deactivated | 401 |
| `FORBIDDEN` | User lacks required permissions | 403 |

#### Resource Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `USER_NOT_FOUND` | User does not exist | 404 |
| `MEMBER_NOT_FOUND` | Member does not exist | 404 |
| `ASSEMBLY_NOT_FOUND` | Assembly does not exist | 404 |
| `ACCOUNT_NOT_FOUND` | Account does not exist | 404 |
| `TRANSACTION_NOT_FOUND` | Transaction does not exist | 404 |
| `REQUEST_NOT_FOUND` | Withdrawal request not found | 404 |

#### Business Logic Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `NO_ACTIVE_ASSEMBLY` | No assembly is currently active | 400 |
| `ATTENDANCE_ALREADY_REGISTERED` | Member already registered | 400 |
| `INVALID_QR_CODE` | QR code is invalid | 400 |
| `INSUFFICIENT_BALANCE` | Not enough funds | 422 |
| `FISCAL_YEAR_CLOSED` | Cannot modify closed fiscal year | 422 |
| `DUPLICATE_IDENTIFICATION` | ID number already exists | 409 |
| `DUPLICATE_EMAIL` | Email already registered | 409 |

#### Validation Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `INVALID_AMOUNT` | Amount must be positive | 400 |
| `INVALID_DATE_RANGE` | End date before start date | 400 |

---

## ⏱️ Rate Limiting

Currently, rate limiting is not implemented. For production, consider adding:

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 10 requests/minute |
| Regular API | 100 requests/minute |
| Reports | 10 requests/minute |

---

## 📡 API Endpoints

### Authentication Endpoints

#### `GET /api/auth/microsoft`

Initiates Microsoft OAuth 2.0 login flow.

| Property | Value |
|----------|-------|
| **Access** | 🌍 Public |
| **Response** | Redirect to Microsoft login |

---

#### `GET /api/auth/callback`

Microsoft OAuth callback handler.

| Property | Value |
|----------|-------|
| **Access** | 🌍 Public |
| **Query Params** | `code` - Authorization code |
| **Response** | Redirect to frontend with token |

**Success Redirect:**
```
{frontend}/auth/callback?token={jwt_token}
```

**Error Redirect:**
```
{frontend}/auth/callback?error={error_code}
```

---

#### `POST /api/auth/verify`

Verifies JWT token and returns user data.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Protected |

**Response:**
```json
{
  "success": true,
  "message": "Token valid",
  "data": {
    "userId": 1,
    "cooperativeId": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "administrator",
    "isActive": true
  }
}
```

---

#### `POST /api/auth/logout`

Logs out user (audit trail).

| Property | Value |
|----------|-------|
| **Access** | 🔒 Protected |

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Users Endpoints

#### `GET /api/users`

Get all users with optional filtering.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | No | Filter by role |
| `isActive` | boolean | No | Filter by status |
| `search` | string | No | Search by name/email |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "administrator",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/users/:id`

Get user by ID.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `POST /api/users`

Create a new user.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | string | ✅ | 3-100 characters |
| `email` | string | ❌ | Valid email format |
| `role` | string | ✅ | administrator, registrar, manager, member |
| `microsoftId` | string | ❌ | Microsoft OAuth ID |

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "role": "registrar"
}
```

**Response:** `201 Created`

---

#### `PUT /api/users/:id`

Update a user.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `POST /api/users/:id/activate`

Activate a user.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `POST /api/users/:id/deactivate`

Deactivate a user (soft delete).

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

> ⚠️ Cannot deactivate the last active administrator.

---

### Members Endpoints

#### `GET /api/members`

Get all members with filtering and pagination.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | — | Search by name/ID |
| `qualityId` | number | No | — | Filter by quality |
| `levelId` | number | No | — | Filter by level |
| `gender` | string | No | — | Filter by gender (M/F/O) |
| `isActive` | boolean | No | — | Filter by status |
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 50 | Items per page (max: 100) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "memberId": 1,
      "fullName": "Student Name",
      "identification": "123456789",
      "memberCode": "001-2025",
      "gender": "M",
      "qualityId": 1,
      "qualityName": "Estudiante",
      "levelId": 1,
      "levelName": "Primer Grado",
      "photoUrl": "https://cloudinary.com/...",
      "isActive": true,
      "affiliationDate": "2025-01-01"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

#### `GET /api/members/:id`

Get member by ID with full details including accounts.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Response:**
```json
{
  "success": true,
  "data": {
    "memberId": 1,
    "fullName": "Student Name",
    "identification": "123456789",
    "gender": "M",
    "memberCode": "001-2025",
    "qualityId": 1,
    "qualityName": "Estudiante",
    "levelId": 1,
    "levelName": "Primer Grado",
    "institutionalEmail": "student@school.edu",
    "photoUrl": "https://cloudinary.com/...",
    "qrHash": "abc123xyz...",
    "affiliationDate": "2025-01-01",
    "lastLiquidationDate": null,
    "isActive": true,
    "accounts": [
      {
        "accountId": 1,
        "accountType": "savings",
        "displayName": "Ahorros",
        "currentBalance": 5000.00
      },
      {
        "accountId": 2,
        "accountType": "contributions",
        "displayName": "Aportaciones",
        "currentBalance": 2700.00
      },
      {
        "accountId": 3,
        "accountType": "surplus",
        "displayName": "Excedentes",
        "currentBalance": 150.00
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### `POST /api/members/affiliate`

Affiliate a new member (includes automatic affiliation fee of ₡500).

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |
| **Content-Type** | `multipart/form-data` |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | string | ✅ | 3-100 characters |
| `identification` | string | ✅ | Unique, numeric/dash format |
| `gender` | string | ❌ | M, F, or O |
| `qualityId` | number | ✅ | Valid quality ID |
| `levelId` | number | ❌ | Valid level ID (matches quality) |
| `institutionalEmail` | string | ❌ | Valid email format |
| `photo` | file | ❌ | jpg, png (max 5MB) |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Member affiliated successfully",
  "data": {
    "member": {
      "memberId": 1,
      "memberCode": "001-2025",
      "qrHash": "abc123xyz...",
      ...
    },
    "affiliationReceipt": {
      "receiptId": 1,
      "receiptNumber": "2025-0001",
      "amount": 500.00,
      "receiptType": "deposit"
    }
  }
}
```

---

#### `POST /api/members`

Create a new member without affiliation fee.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |
| **Content-Type** | `multipart/form-data` |

---

#### `PUT /api/members/:id`

Update a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |
| **Content-Type** | `multipart/form-data` |

---

#### `DELETE /api/members/:id`

Soft delete a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `GET /api/members/:id/qr`

Generate QR code for a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Response:**
```json
{
  "success": true,
  "data": {
    "memberId": 1,
    "memberCode": "001-2025",
    "fullName": "Student Name",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

---

#### `POST /api/members/qr/batch`

Generate QR codes for multiple members.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Request Body:**
```json
{
  "memberIds": [1, 2, 3, 4, 5]
}
```

---

#### `POST /api/members/qr/verify`

Verify member by QR hash.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator, Registrar |

**Request Body:**
```json
{
  "qrHash": "abc123xyz..."
}
```

---

#### `GET /api/members/verify`

Public verification of member by QR hash.

| Property | Value |
|----------|-------|
| **Access** | 🌍 Public |

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `hash` | string | ✅ |

---

### Assemblies Endpoints

#### `GET /api/assemblies`

Get all assemblies.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assemblyId": 1,
      "title": "Monthly Assembly - January",
      "scheduledDate": "2025-01-15",
      "startTime": "09:00:00",
      "endTime": "12:00:00",
      "isActive": false,
      "concludedAt": "2025-01-15T12:15:00.000Z",
      "attendanceCount": 75,
      "createdBy": 1,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/assemblies/active`

Get currently active assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Response:** Single assembly object or `404` if none active.

---

#### `GET /api/assemblies/:id`

Get assembly by ID.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

#### `POST /api/assemblies`

Create a new assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | ✅ | 3-150 characters |
| `scheduledDate` | date | ✅ | ISO 8601 date |
| `startTime` | time | ❌ | HH:mm format |
| `endTime` | time | ❌ | HH:mm, must be after startTime |

```json
{
  "title": "Monthly Assembly - February",
  "scheduledDate": "2025-02-15",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

---

#### `PUT /api/assemblies/:id`

Update an assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `DELETE /api/assemblies/:id`

Delete an assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

> ⚠️ Cannot delete an active assembly.

---

#### `POST /api/assemblies/:id/activate`

Activate an assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

> ⚠️ Only one assembly can be active at a time. Activating one automatically deactivates others.

---

#### `POST /api/assemblies/:id/deactivate`

Deactivate an assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

### Attendance Endpoints

#### `POST /api/attendance/scan`

Register attendance by QR code scan.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator, Registrar |

**Request Body:**
```json
{
  "qrHash": "abc123xyz..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance registered successfully",
  "data": {
    "attendanceId": 1,
    "member": {
      "memberId": 1,
      "fullName": "Student Name",
      "memberCode": "001-2025",
      "photoUrl": "https://cloudinary.com/...",
      "levelName": "Primer Grado"
    },
    "assembly": {
      "assemblyId": 1,
      "title": "Monthly Assembly"
    },
    "registeredAt": "2025-01-15T09:30:00.000Z",
    "registrationMethod": "qr_scan"
  }
}
```

---

#### `POST /api/attendance/manual`

Register attendance manually.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator, Registrar |

**Request Body:**
```json
{
  "memberId": 1,
  "notes": "QR code damaged"
}
```

---

#### `GET /api/attendance`

Get all attendance records with filtering.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `assemblyId` | number | Filter by assembly |
| `memberId` | number | Filter by member |
| `registrationMethod` | string | `qr_scan` or `manual` |
| `fromDate` | string | Start date (ISO) |
| `toDate` | string | End date (ISO) |
| `page` | number | Page number |
| `limit` | number | Items per page |

---

#### `GET /api/attendance/assembly/:assemblyId`

Get attendance for specific assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

#### `GET /api/attendance/assembly/:assemblyId/stats`

Get attendance statistics for assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 75,
    "byMethod": {
      "qr_scan": 70,
      "manual": 5
    },
    "byLevel": {
      "materno": 5,
      "transicion": 8,
      "grade_1": 12,
      "grade_2": 10,
      "grade_3": 15,
      "grade_4": 10,
      "grade_5": 8,
      "grade_6": 5,
      "not_applicable": 2
    },
    "byGender": {
      "M": 40,
      "F": 35
    }
  }
}
```

---

#### `DELETE /api/attendance/:id`

Delete attendance record.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

### Savings Endpoints

#### `POST /api/savings/deposits`

Register a savings deposit.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `memberId` | number | ✅ | Valid member ID |
| `amount` | number | ✅ | Positive number |
| `description` | string | ❌ | Max 500 characters |

```json
{
  "memberId": 1,
  "amount": 1000.00,
  "description": "Monthly deposit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit registered successfully",
  "data": {
    "transaction": {
      "transactionId": 1,
      "amount": 1000.00,
      "transactionType": "deposit",
      "transactionDate": "2025-01-15",
      "fiscalYear": 2024
    },
    "receipt": {
      "receiptNumber": "2025-0002",
      "amount": 1000.00
    },
    "newBalance": 6000.00
  }
}
```

---

#### `POST /api/savings/withdrawals`

Register a savings withdrawal.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Request Body:**
```json
{
  "memberId": 1,
  "amount": 500.00,
  "description": "Approved withdrawal request #123"
}
```

---

#### `GET /api/savings/inventory/:fiscalYear`

Get savings inventory for a fiscal year.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Response:**
```json
{
  "success": true,
  "data": {
    "fiscalYear": 2024,
    "months": [
      {
        "month": 10,
        "year": 2024,
        "totalDeposits": 50000.00,
        "totalWithdrawals": 10000.00,
        "netMovement": 40000.00,
        "transactionCount": 45,
        "memberCount": 35
      }
    ],
    "totals": {
      "deposits": 150000.00,
      "withdrawals": 30000.00,
      "netMovement": 120000.00
    }
  }
}
```

---

#### `GET /api/savings/:memberId`

Get savings account for a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

---

#### `GET /api/savings/:memberId/transactions`

Get savings transactions for a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fiscalYear` | number | Filter by fiscal year |
| `page` | number | Page number |
| `limit` | number | Items per page |

---

### Contributions Endpoints

#### `POST /api/contributions/deposits`

Register a contribution payment.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Request Body:**
```json
{
  "memberId": 1,
  "amount": 300.00,
  "tractNumber": 1,
  "description": "First tract payment"
}
```

---

#### `GET /api/contributions/:memberId`

Get contributions account for a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

---

#### `GET /api/contributions/:memberId/status/:fiscalYear`

Get contribution status for member in fiscal year.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

**Response:**
```json
{
  "success": true,
  "data": {
    "fiscalYear": 2024,
    "requiredAmount": 900.00,
    "paidAmount": 600.00,
    "pendingAmount": 300.00,
    "tracts": [
      {
        "tractNumber": 1,
        "requiredAmount": 300.00,
        "paidAmount": 300.00,
        "status": "paid"
      },
      {
        "tractNumber": 2,
        "requiredAmount": 300.00,
        "paidAmount": 300.00,
        "status": "paid"
      },
      {
        "tractNumber": 3,
        "requiredAmount": 300.00,
        "paidAmount": 0.00,
        "status": "pending"
      }
    ]
  }
}
```

---

### Surplus Endpoints

#### `POST /api/surplus/distribute`

Create and execute surplus distribution.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Request Body:**
```json
{
  "fiscalYear": 2024,
  "totalDistributableAmount": 50000.00,
  "notes": "Annual surplus distribution 2024"
}
```

---

#### `GET /api/surplus/distributions`

Get all surplus distributions.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `GET /api/surplus/distributions/:id`

Get surplus distribution by ID.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `GET /api/surplus/:memberId`

Get surplus account for a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

---

### Withdrawal Requests Endpoints

#### `POST /api/withdrawal-requests`

Create a withdrawal request.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own) |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `accountType` | string | ✅ | savings, surplus |
| `amount` | number | ✅ | Positive, ≤ balance |
| `requestNotes` | string | ❌ | Max 500 chars |

```json
{
  "accountType": "savings",
  "amount": 500.00,
  "requestNotes": "Need funds for school supplies"
}
```

---

#### `GET /api/withdrawal-requests`

Get all withdrawal requests.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | pending, approved, rejected, completed, cancelled |
| `memberId` | number | Filter by member |
| `accountType` | string | Filter by account type |

---

#### `GET /api/withdrawal-requests/:requestId`

Get withdrawal request by ID.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

---

#### `PATCH /api/withdrawal-requests/:requestId/approve`

Approve a withdrawal request.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Request Body:**
```json
{
  "adminNotes": "Approved - valid request"
}
```

---

#### `PATCH /api/withdrawal-requests/:requestId/reject`

Reject a withdrawal request.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Request Body:**
```json
{
  "adminNotes": "Rejected - insufficient documentation"
}
```

---

#### `PATCH /api/withdrawal-requests/:requestId/cancel`

Cancel a withdrawal request (by member).

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own) |

---

### Liquidations Endpoints

#### `GET /api/liquidations/pending`

Get members pending liquidation (6+ years since affiliation or last liquidation).

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "memberId": 1,
      "fullName": "Student Name",
      "memberCode": "001-2019",
      "affiliationDate": "2019-01-15",
      "lastLiquidationDate": null,
      "yearsSinceEligible": 6.5,
      "totalBalance": 15900.00
    }
  ]
}
```

---

#### `GET /api/liquidations/preview/:memberId`

Get liquidation preview for a member.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Response:**
```json
{
  "success": true,
  "data": {
    "member": {
      "memberId": 1,
      "fullName": "Student Name",
      "memberCode": "001-2019"
    },
    "accounts": {
      "savings": 10000.00,
      "contributions": 5400.00,
      "surplus": 500.00
    },
    "totalAmount": 15900.00,
    "affiliationDate": "2019-01-15",
    "lastLiquidationDate": null,
    "yearsAsMember": 6
  }
}
```

---

#### `POST /api/liquidations/execute`

Execute liquidation for members.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `memberIds` | number[] | ✅ | Array of member IDs |
| `liquidationType` | string | ✅ | periodic or exit |
| `memberContinues` | boolean | ✅ | Member continues after |
| `notes` | string | ❌ | Additional notes |

```json
{
  "memberIds": [1, 2, 3],
  "liquidationType": "periodic",
  "memberContinues": true,
  "notes": "Six-year periodic liquidation 2025"
}
```

---

#### `GET /api/liquidations/history`

Get liquidation history.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `memberId` | number | Filter by member |
| `liquidationType` | string | periodic or exit |
| `fromDate` | string | Start date |
| `toDate` | string | End date |

---

### Receipts Endpoints

#### `GET /api/receipts`

Get all receipts with filtering.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Manager, Administrator |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `memberId` | number | Filter by member |
| `receiptType` | string | Filter by type |
| `fromDate` | string | Start date |
| `toDate` | string | End date |

---

#### `GET /api/receipts/:id`

Get receipt by ID.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |

---

#### `GET /api/receipts/:id/pdf`

Get receipt PDF.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Member (own), Manager, Administrator |
| **Response** | `application/pdf` |

---

### Notifications Endpoints

#### `GET /api/notifications`

Get notifications for current user.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isRead` | boolean | — | Filter by read status |
| `limit` | number | 50 | Max notifications |

---

#### `GET /api/notifications/unread-count`

Get unread notification count.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

#### `POST /api/notifications/:id/read`

Mark notification as read.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

#### `POST /api/notifications/read-all`

Mark all notifications as read.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

### Catalogs Endpoints

#### `GET /api/catalogs/qualities`

Get member quality options.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "qualityId": 1,
      "qualityCode": "student",
      "qualityName": "Estudiante",
      "description": "Active student member"
    },
    {
      "qualityId": 2,
      "qualityCode": "staff",
      "qualityName": "Funcionario",
      "description": "School staff member"
    }
  ]
}
```

---

#### `GET /api/catalogs/levels`

Get educational level options.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `qualityCode` | string | Filter by quality (student, staff) |

---

#### `GET /api/catalogs/account-types`

Get account type options.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

### Reports Endpoints

#### `GET /api/reports/attendance/:assemblyId`

Generate attendance report for assembly.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |
| **Response** | `application/pdf` |

---

#### `GET /api/reports/attendance/:assemblyId/excel`

Generate attendance report in Excel format.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |
| **Response** | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

---

#### `GET /api/reports/savings/:fiscalYear`

Generate savings report for fiscal year.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator, Manager |
| **Response** | `application/pdf` |

---

#### `GET /api/reports/members`

Generate members report.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | pdf or excel |
| `isActive` | boolean | Filter by status |
| `qualityId` | number | Filter by quality |

---

### Push Notifications Endpoints

#### `POST /api/push/subscribe`

Subscribe to push notifications.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

---

#### `POST /api/push/unsubscribe`

Unsubscribe from push notifications.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

#### `GET /api/push/vapid-public-key`

Get VAPID public key for push subscription.

| Property | Value |
|----------|-------|
| **Access** | 🌍 Public |

---

### Cooperatives Endpoints

#### `GET /api/cooperatives`

Get all cooperatives.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

#### `GET /api/cooperatives/:id`

Get cooperative by ID.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Authenticated |

---

#### `PUT /api/cooperatives/:id`

Update cooperative details.

| Property | Value |
|----------|-------|
| **Access** | 🔒 Administrator |

---

## 🔗 Webhooks

Currently, webhooks are not implemented. Future versions may include:

| Event | Trigger |
|-------|---------|
| `member.created` | New member affiliated |
| `withdrawal.approved` | Withdrawal request approved |
| `liquidation.completed` | Liquidation processed |

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture |
| [02-DATA-MODEL.md](./02-DATA-MODEL.md) | Database schema |
| [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) | Authentication details |
| [06-BUSINESS-FLOWS.md](./06-BUSINESS-FLOWS.md) | Business processes |

---

<div align="center">

**[⬆ Back to Top](#-rest-api-documentation)**

</div>
