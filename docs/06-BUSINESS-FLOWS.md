<p align="center">
  <img src="https://img.shields.io/badge/Document-Business_Flows-blue?style=for-the-badge" alt="Business Flows" />
  <img src="https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Complete-success?style=for-the-badge" alt="Status" />
</p>

# 📊 Business Flows Documentation

> Comprehensive documentation of all business processes, workflows, and operational flows implemented in the CoopLink CR Management System.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Flow Categories](#flow-categories)
- [1. Member Affiliation Flow](#1-member-affiliation-flow)
- [2. Attendance Registration Flow](#2-attendance-registration-flow)
- [3. Financial Transaction Flows](#3-financial-transaction-flows)
  - [3.1 Savings Deposit](#31-savings-deposit)
  - [3.2 Savings Withdrawal](#32-savings-withdrawal)
  - [3.3 Contribution Payment](#33-contribution-payment)
- [4. Withdrawal Request Flow](#4-withdrawal-request-flow)
- [5. Liquidation Flow](#5-liquidation-flow)
- [6. Assembly Management Flow](#6-assembly-management-flow)
- [7. Surplus Distribution Flow](#7-surplus-distribution-flow)
- [8. Report Generation Flow](#8-report-generation-flow)
- [9. Notification Flow](#9-notification-flow)
- [10. User Management Flow](#10-user-management-flow)
- [State Machines](#state-machines)
- [Error Handling](#error-handling)
- [Related Documentation](#related-documentation)

---

## Overview

This document describes all business processes implemented in the CoopLink CR Management System. Each flow includes:

- **Visual diagram** showing the process steps
- **Actors involved** and their responsibilities
- **Business rules** that govern the process
- **API endpoints** for implementation reference
- **Data structures** showing inputs and outputs
- **Error scenarios** and handling strategies

### Flow Legend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DIAGRAM LEGEND                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐                                                                 │
│  │ Process │  Rectangle = Process or Action                                  │
│  └─────────┘                                                                 │
│                                                                              │
│  ◇           Diamond = Decision Point                                        │
│                                                                              │
│  ───────>    Arrow = Flow Direction                                          │
│                                                                              │
│  │          Vertical Line = Actor Swimlane                                   │
│                                                                              │
│  ●          Circle = Start/End Point                                         │
│                                                                              │
│  ═══════    Double Line = Database Operation                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow Categories

| Category | Flows | Description |
|----------|-------|-------------|
| **Member Management** | Affiliation, Liquidation | Member lifecycle operations |
| **Financial** | Deposits, Withdrawals, Contributions | Money movement operations |
| **Assembly** | Creation, Activation, Attendance | Meeting management |
| **Administrative** | Users, Reports, Notifications | System administration |
| **Approval** | Withdrawal Requests | Multi-step approval workflows |

---

## 1. Member Affiliation Flow

The complete process of registering a new cooperative member, including account creation and fee collection.

### Process Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MEMBER AFFILIATION FLOW                              │
│                                                                              │
│  Roles: Administrator, Registrar                                             │
│  Trigger: Manual initiation by authorized user                               │
└─────────────────────────────────────────────────────────────────────────────┘

     ACTOR                         SYSTEM                          DATABASE
       │                              │                                │
       │  ●──── START                 │                                │
       │                              │                                │
       │  1. Navigate to              │                                │
       │     Members → Affiliate      │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │  2. Fill registration form   │                                │
       │     - Full name              │                                │
       │     - Identification         │                                │
       │     - Gender                 │                                │
       │     - Quality (student/etc)  │                                │
       │     - Level (grade)          │                                │
       │     - Email (optional)       │                                │
       │     - Photo (optional)       │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  3. Validate identification     │
       │                              │     uniqueness                  │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │         ◇ Exists?              │
       │                              │        ╱ ╲                     │
       │                              │       ╱   ╲                    │
       │                              │      YES   NO                  │
       │                              │       │     │                  │
       │                              │       │     ▼                  │
       │                              │       │  4. Generate member    │
       │  [ERROR: ID exists]          │       │     code (NNN-YYYY)    │
       │<─────────────────────────────┤<──────┘                        │
       │                              │                                │
       │                              │  5. Generate unique QR hash    │
       │                              │     (SHA-256)                  │
       │                              │                                │
       │                              │  6. Upload photo to            │
       │                              │     Cloudinary (if provided)   │
       │                              │     ────────────────────>      │
       │                              │     <────────────────────      │
       │                              │     (receive photo_url)        │
       │                              │                                │
       │                              │  7. Create member record       │
       │                              ├═══════════════════════════════>│
       │                              │     INSERT INTO members        │
       │                              │                                │
       │                              │  8. Create 4 financial         │
       │                              │     accounts:                  │
       │                              │     • savings (1)              │
       │                              │     • contributions (2)        │
       │                              │     • surplus (3)              │
       │                              │     • affiliation (4)          │
       │                              ├═══════════════════════════════>│
       │                              │     INSERT INTO accounts (x4)  │
       │                              │                                │
       │                              │  9. Register affiliation fee   │
       │                              │     transaction (₡500)         │
       │                              ├═══════════════════════════════>│
       │                              │     INSERT INTO transactions   │
       │                              │                                │
       │                              │  10. Generate receipt          │
       │                              │      (YYYY-NNNN format)        │
       │                              ├═══════════════════════════════>│
       │                              │      INSERT INTO receipts      │
       │                              │                                │
       │  11. Display confirmation    │                                │
       │      + Member card           │                                │
       │      + Receipt (printable)   │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  ●──── END                   │                                │
       │                              │                                │
```

### Business Rules

| Rule ID | Rule | Validation |
|---------|------|------------|
| **AF-001** | Identification must be unique | Database constraint + service validation |
| **AF-002** | Member code format: `NNN-YYYY` | Sequential number per year (e.g., 001-2025) |
| **AF-003** | QR hash must be unique | SHA-256 hash of `identification + timestamp` |
| **AF-004** | Affiliation fee is ₡500 | Automatic transaction on creation |
| **AF-005** | Four accounts are mandatory | Created atomically in transaction |
| **AF-006** | Photo stored in Cloudinary | Max 5MB, JPEG/PNG formats |
| **AF-007** | Email format validation | Valid email format if provided |

### API Endpoint

```http
POST /api/members/affiliate
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### Request/Response

```javascript
// Request Body (FormData)
{
  fullName: "María García López",      // Required: string, 2-100 chars
  identification: "123456789",          // Required: string, unique
  gender: "F",                          // Required: "M" | "F"
  qualityId: 1,                         // Required: FK to member_qualities
  levelId: 3,                           // Required: FK to member_levels
  institutionalEmail: "maria@school.edu", // Optional: valid email
  photo: File                           // Optional: image file
}

// Success Response (201 Created)
{
  "success": true,
  "data": {
    "member": {
      "memberId": 42,
      "memberCode": "015-2025",
      "fullName": "María García López",
      "identification": "123456789",
      "qrHash": "a1b2c3d4e5f6...",
      "photoUrl": "https://res.cloudinary.com/...",
      "isActive": true,
      "affiliationDate": "2025-01-15T10:30:00Z"
    },
    "accounts": [
      { "accountId": 165, "accountType": "savings", "balance": 0 },
      { "accountId": 166, "accountType": "contributions", "balance": 0 },
      { "accountId": 167, "accountType": "surplus", "balance": 0 },
      { "accountId": 168, "accountType": "affiliation", "balance": 500 }
    ],
    "affiliationReceipt": {
      "receiptId": 89,
      "receiptNumber": "2025-0089",
      "amount": 500,
      "concept": "Affiliation Fee"
    }
  }
}
```

### Error Scenarios

| Error Code | Scenario | HTTP Status |
|------------|----------|-------------|
| `DUPLICATE_ID` | Identification already exists | 409 Conflict |
| `INVALID_QUALITY` | Quality ID not found | 400 Bad Request |
| `INVALID_LEVEL` | Level ID not found | 400 Bad Request |
| `UPLOAD_FAILED` | Photo upload to Cloudinary failed | 500 Internal Error |
| `TRANSACTION_FAILED` | Database transaction rollback | 500 Internal Error |

---

## 2. Attendance Registration Flow

The process of recording member attendance at cooperative assemblies using QR scanning or manual entry.

### Process Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ATTENDANCE REGISTRATION FLOW                           │
│                                                                              │
│  Roles: Administrator, Registrar                                             │
│  Precondition: Active assembly must exist                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                          ●──── START
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Check for active   │
                    │  assembly           │
                    └──────────┬──────────┘
                               │
                        ◇ Active assembly?
                       ╱ ╲
                      ╱   ╲
                    NO     YES
                     │       │
                     ▼       ▼
              ┌──────────┐  ┌────────────────────────────────────────┐
              │ ERROR:   │  │         SELECT REGISTRATION METHOD      │
              │ No active│  └─────────────────┬──────────────────────┘
              │ assembly │                    │
              └──────────┘           ┌────────┴────────┐
                                     │                 │
                                     ▼                 ▼
                          ┌─────────────────┐ ┌─────────────────┐
                          │   QR SCAN       │ │   MANUAL        │
                          │   METHOD        │ │   METHOD        │
                          └────────┬────────┘ └────────┬────────┘
                                   │                   │
                                   ▼                   ▼
                          ┌─────────────────┐ ┌─────────────────┐
                          │ Open camera     │ │ Search member   │
                          │ for scanning    │ │ by name/ID      │
                          └────────┬────────┘ └────────┬────────┘
                                   │                   │
                                   ▼                   ▼
                          ┌─────────────────┐ ┌─────────────────┐
                          │ Scan QR code    │ │ Display search  │
                          │ from member     │ │ results         │
                          │ card            │ └────────┬────────┘
                          └────────┬────────┘          │
                                   │                   ▼
                                   │          ┌─────────────────┐
                                   │          │ Select member   │
                                   │          │ from list       │
                                   │          └────────┬────────┘
                                   │                   │
                                   ▼                   ▼
                          ┌─────────────────┐ ┌─────────────────┐
                          │ Decode QR hash  │ │ Confirm member  │
                          │                 │ │ identity        │
                          └────────┬────────┘ └────────┬────────┘
                                   │                   │
                                   └─────────┬─────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │  Lookup member by   │
                                  │  QR hash / ID       │
                                  └──────────┬──────────┘
                                             │
                                      ◇ Member found?
                                     ╱ ╲
                                   NO   YES
                                    │     │
                                    ▼     ▼
                             ┌─────────┐ ┌─────────────────────┐
                             │ ERROR:  │ │  Check member       │
                             │ Invalid │ │  is active          │
                             │ member  │ └──────────┬──────────┘
                             └─────────┘            │
                                             ◇ Is active?
                                            ╱ ╲
                                          NO   YES
                                           │     │
                                           ▼     ▼
                                    ┌─────────┐ ┌─────────────────────┐
                                    │ ERROR:  │ │  Check not already  │
                                    │ Inactive│ │  registered         │
                                    │ member  │ └──────────┬──────────┘
                                    └─────────┘            │
                                                    ◇ Already registered?
                                                   ╱ ╲
                                                 YES  NO
                                                  │     │
                                                  ▼     ▼
                                           ┌─────────┐ ┌─────────────────────┐
                                           │ WARNING:│ │  Create attendance  │
                                           │ Already │ │  record             │
                                           │ present │ └──────────┬──────────┘
                                           └─────────┘            │
                                                                  ▼
                                                       ┌─────────────────────┐
                                                       │  Display member     │
                                                       │  confirmation card  │
                                                       │  with photo & name  │
                                                       └──────────┬──────────┘
                                                                  │
                                                                  ▼
                                                            ●──── END
```

### Registration Methods Comparison

| Feature | QR Scan | Manual Entry |
|---------|---------|--------------|
| **Speed** | ~2 seconds | ~10-15 seconds |
| **Accuracy** | High (no typos) | Moderate |
| **Equipment** | Camera required | None |
| **Offline** | No | Possible with cache |
| **Audit Trail** | `registration_method: 'qr'` | `registration_method: 'manual'` |

### Business Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **AT-001** | Active assembly required | Cannot register without active assembly |
| **AT-002** | One registration per assembly | Prevents duplicate attendance |
| **AT-003** | Member must be active | Inactive members cannot attend |
| **AT-004** | Method is recorded | QR or manual for audit purposes |
| **AT-005** | Timestamp is server-side | Prevents client time manipulation |
| **AT-006** | Real-time updates | Attendance list refreshes instantly |

### API Endpoints

```http
# QR Scan Registration
POST /api/attendance/scan
Content-Type: application/json
Authorization: Bearer <token>

{
  "qrHash": "a1b2c3d4e5f6..."
}

# Manual Registration
POST /api/attendance/manual
Content-Type: application/json
Authorization: Bearer <token>

{
  "memberId": 42
}
```

### Response Format

```javascript
// Success Response (201 Created)
{
  "success": true,
  "data": {
    "attendanceId": 156,
    "assemblyId": 5,
    "memberId": 42,
    "memberName": "María García López",
    "memberCode": "015-2025",
    "photoUrl": "https://res.cloudinary.com/...",
    "registeredAt": "2025-01-20T14:30:00Z",
    "registrationMethod": "qr",
    "registeredBy": "admin@school.edu"
  }
}

// Already Registered (200 OK with warning)
{
  "success": true,
  "data": {
    "alreadyRegistered": true,
    "memberName": "María García López",
    "registeredAt": "2025-01-20T14:25:00Z"
  }
}
```

---

## 3. Financial Transaction Flows

### 3.1 Savings Deposit

The process of recording a member's savings deposit.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SAVINGS DEPOSIT FLOW                               │
│                                                                              │
│  Roles: Administrator, Manager                                               │
│  Account Type: savings (1)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

     ACTOR                         SYSTEM                          DATABASE
       │                              │                                │
       │  1. Search/Select member     │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  2. Fetch member details       │
       │                              │     + savings account          │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  3. View current balance     │                                │
       │<─────────────────────────────┤                                │
       │     [Balance: ₡5,000]        │                                │
       │                              │                                │
       │  4. Enter deposit amount     │                                │
       │     [₡2,500]                 │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  5. Validate amount > 0        │
       │                              │                                │
       │                              │  6. Create transaction record  │
       │                              │     type: 'deposit'            │
       │                              │     amount: 2500               │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │  7. TRIGGER: Update balance    │
       │                              │     balance = balance + amount │
       │                              │     [5000 + 2500 = 7500]       │
       │                              │                                │
       │                              │  8. Generate receipt           │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  9. Show confirmation        │                                │
       │     New balance: ₡7,500      │                                │
       │     Receipt: 2025-0156       │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
```

### 3.2 Savings Withdrawal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SAVINGS WITHDRAWAL FLOW                             │
│                                                                              │
│  Roles: Administrator, Manager                                               │
│  Note: For approved withdrawal requests only                                 │
└─────────────────────────────────────────────────────────────────────────────┘

     ACTOR                         SYSTEM                          DATABASE
       │                              │                                │
       │  1. View approved requests   │                                │
       │     or select member         │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  2. Fetch member + account     │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  3. Enter withdrawal amount  │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  4. Validate:                  │
       │                              │     amount > 0                 │
       │                              │     amount <= balance          │
       │                              │                                │
       │                        ◇ Sufficient balance?                  │
       │                       ╱ ╲                                     │
       │                     NO   YES                                  │
       │                      │     │                                  │
       │  [ERROR: Insufficient│     ▼                                  │
       │   funds]             │  5. Create transaction                 │
       │<─────────────────────┤     type: 'withdrawal'                 │
       │                      │     amount: -X                         │
       │                      │  ├═══════════════════════════════════>│
       │                      │                                        │
       │                      │  6. TRIGGER: Update balance            │
       │                      │     balance = balance - amount         │
       │                      │                                        │
       │                      │  7. Generate receipt                   │
       │                      │  ├═══════════════════════════════════>│
       │                      │                                        │
       │  8. Show confirmation│                                        │
       │<─────────────────────┤                                        │
       │                              │                                │
```

### 3.3 Contribution Payment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTRIBUTION PAYMENT FLOW                             │
│                                                                              │
│  Roles: Administrator, Manager                                               │
│  Account Type: contributions (2)                                             │
│  Context: Monthly/periodic contribution payments                             │
└─────────────────────────────────────────────────────────────────────────────┘

     ACTOR                         SYSTEM                          DATABASE
       │                              │                                │
       │  1. Access contributions     │                                │
       │     module                   │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  2. Fetch contribution         │
       │                              │     periods                    │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  3. Select period or         │                                │
       │     create new               │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │  4. Select members for       │                                │
       │     batch payment            │                                │
       │     [Multiple selection]     │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  5. For each member:           │
       │                              │     - Create transaction       │
       │                              │     - Update balance           │
       │                              │     - Link to period           │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  6. Show batch results       │                                │
       │     [15 members processed]   │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
```

### Transaction Types Reference

| Type | Direction | Account Types | Description |
|------|-----------|---------------|-------------|
| `deposit` | Credit (+) | savings, contributions, surplus | Money into account |
| `withdrawal` | Debit (-) | savings, contributions, surplus | Money out of account |
| `transfer` | Both | Any | Move between accounts |
| `adjustment` | Both | Any | Administrative correction |
| `distribution` | Credit (+) | surplus | Surplus allocation |
| `liquidation` | Debit (-) | All | Complete account withdrawal |

### API Endpoints

```http
# Savings Operations
POST /api/savings/deposits
POST /api/savings/withdrawals
GET  /api/savings/members/:memberId/balance
GET  /api/savings/inventory

# Contribution Operations
POST /api/contributions/payments
GET  /api/contributions/periods
POST /api/contributions/periods
```

---

## 4. Withdrawal Request Flow

The approval workflow for member withdrawal requests.

### Process Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WITHDRAWAL REQUEST FLOW                               │
│                                                                              │
│  This is a multi-stage approval workflow                                     │
│  Actors: Member (requester), Manager/Admin (approver)                        │
└─────────────────────────────────────────────────────────────────────────────┘

    MEMBER                      SYSTEM                      MANAGER/ADMIN
       │                           │                              │
       │                           │                              │
   ════════════════════════════════════════════════════════════════════════
   │                    STAGE 1: REQUEST CREATION                         │
   ════════════════════════════════════════════════════════════════════════
       │                           │                              │
       │  1. Access "My Account"   │                              │
       ├──────────────────────────>│                              │
       │                           │                              │
       │  2. View current balance  │                              │
       │<──────────────────────────┤                              │
       │     [Balance: ₡10,000]    │                              │
       │                           │                              │
       │  3. Create withdrawal     │                              │
       │     request               │                              │
       │     - Amount: ₡5,000      │                              │
       │     - Reason: "..."       │                              │
       ├──────────────────────────>│                              │
       │                           │                              │
       │                           │  4. Validate:                │
       │                           │     amount > 0               │
       │                           │     amount <= balance        │
       │                           │                              │
       │                           │  5. Create request record    │
       │                           │     status: 'pending'        │
       │                           │                              │
       │                           │  6. Create notification      │
       │                           │     for approvers            │
       │                           ├─────────────────────────────>│
       │                           │                              │
       │  7. Confirmation:         │                              │
       │     "Request submitted"   │                              │
       │<──────────────────────────┤                              │
       │                           │                              │
   ════════════════════════════════════════════════════════════════════════
   │                    STAGE 2: APPROVAL PROCESS                         │
   ════════════════════════════════════════════════════════════════════════
       │                           │                              │
       │                           │  8. Approver sees            │
       │                           │     notification badge       │
       │                           │                              │
       │                           │  9. View pending requests    │
       │                           │<─────────────────────────────┤
       │                           │                              │
       │                           │ 10. Show request details     │
       │                           ├─────────────────────────────>│
       │                           │                              │
       │                           │                              │
       │                           │      ◇ Decision?             │
       │                           │     ╱    │    ╲              │
       │                           │    ╱     │     ╲             │
       │                           │ APPROVE  │   REJECT          │
       │                           │    │     │      │            │
       │                           │    ▼     │      ▼            │
       │                           │ ┌─────┐  │  ┌─────┐          │
       │                           │ │ 11a │  │  │ 11b │          │
       │                           │ └──┬──┘  │  └──┬──┘          │
       │                           │    │     │     │             │
   ════════════════════════════════════════════════════════════════════════
   │                    STAGE 3a: APPROVAL PATH                           │
   ════════════════════════════════════════════════════════════════════════
       │                           │    │                         │
       │                           │    ▼                         │
       │                           │ Update status: 'approved'    │
       │                           │                              │
       │                           │ Create withdrawal            │
       │                           │ transaction                  │
       │                           │                              │
       │                           │ Update account balance       │
       │                           │                              │
       │                           │ Generate receipt             │
       │                           │                              │
       │  12. Notify: "Approved"   │                              │
       │<──────────────────────────┤                              │
       │                           │                              │
   ════════════════════════════════════════════════════════════════════════
   │                    STAGE 3b: REJECTION PATH                          │
   ════════════════════════════════════════════════════════════════════════
       │                           │          │                   │
       │                           │          ▼                   │
       │                           │ Update status: 'rejected'    │
       │                           │ Record rejection_reason      │
       │                           │                              │
       │ 12. Notify: "Rejected"    │                              │
       │    + reason               │                              │
       │<──────────────────────────┤                              │
       │                           │                              │
```

### Request Status State Machine

```
                              ┌─────────────────┐
                              │                 │
                    ┌────────>│    PENDING      │<────────┐
                    │         │                 │         │
                    │         └────────┬────────┘         │
                    │                  │                  │
                    │         ┌────────┴────────┐         │
                    │         │                 │         │
                    │         ▼                 ▼         │
              ┌─────────────────┐       ┌─────────────────┐
              │                 │       │                 │
              │    APPROVED     │       │    REJECTED     │
              │                 │       │                 │
              └────────┬────────┘       └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐       ┌─────────────────┐
              │                 │       │                 │
              │   COMPLETED     │       │   CANCELLED     │
              │                 │       │  (by requester) │
              └─────────────────┘       └─────────────────┘
```

### Business Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **WR-001** | Amount cannot exceed balance | Validated at creation time |
| **WR-002** | Only pending requests can be approved/rejected | Status check required |
| **WR-003** | Rejection requires reason | `rejection_reason` is mandatory |
| **WR-004** | Approval creates immediate transaction | No additional confirmation |
| **WR-005** | Requester can cancel pending requests | Self-service cancellation |
| **WR-006** | Notifications sent on status change | Real-time notification system |

### Request Types

| Type | From Account | To | Description |
|------|--------------|-----|-------------|
| `withdrawal` | savings | External | Cash withdrawal |
| `transfer` | surplus | savings | Move surplus to savings |

### API Endpoints

```http
# Create Request (Member/Admin)
POST /api/withdrawal-requests

# List Requests
GET /api/withdrawal-requests
GET /api/withdrawal-requests/pending

# Approve Request (Manager/Admin)
PATCH /api/withdrawal-requests/:id/approve

# Reject Request (Manager/Admin)
PATCH /api/withdrawal-requests/:id/reject
{
  "rejectionReason": "Insufficient documentation provided"
}

# Cancel Request (Requester only)
DELETE /api/withdrawal-requests/:id
```

---

## 5. Liquidation Flow

The process of liquidating member accounts (every 6 years or upon cooperative exit).

### Process Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIQUIDATION FLOW                                   │
│                                                                              │
│  Roles: Administrator only                                                   │
│  Trigger: 6-year cycle OR member exit request                                │
└─────────────────────────────────────────────────────────────────────────────┘

     ADMIN                         SYSTEM                          DATABASE
       │                              │                                │
       │  1. Access Liquidations      │                                │
       │     module                   │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  2. Calculate eligible         │
       │                              │     members:                   │
       │                              │     (NOW - affiliation_date    │
       │                              │      OR last_liquidation_date) │
       │                              │     >= 6 years                 │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  3. View pending list        │                                │
       │     [15 members eligible]    │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  4. Select member to         │                                │
       │     liquidate                │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  5. Calculate liquidation      │
       │                              │     preview:                   │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  6. View breakdown:          │                                │
       │     ┌─────────────────────┐  │                                │
       │     │ Savings:    ₡15,000 │  │                                │
       │     │ Contrib:    ₡12,000 │  │                                │
       │     │ Surplus:     ₡3,500 │  │                                │
       │     │ ─────────────────── │  │                                │
       │     │ TOTAL:      ₡30,500 │  │                                │
       │     └─────────────────────┘  │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  7. Select liquidation type  │                                │
       │     and confirm:             │                                │
       │     □ Periodic (continues)   │                                │
       │     □ Exit (leaves coop)     │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  8. BEGIN TRANSACTION          │
       │                              │                                │
       │                              │  9. Create liquidation record  │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │ 10. For each account:          │
       │                              │     Create withdrawal txn      │
       │                              │     (savings, contrib, surplus)│
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │ 11. Reset account balances     │
       │                              │     to zero                    │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │      ◇ Liquidation type?       │
       │                              │     ╱ ╲                        │
       │                              │ PERIODIC  EXIT                 │
       │                              │    │        │                  │
       │                              │    ▼        ▼                  │
       │                              │ Update   Deactivate            │
       │                              │ last_    member                │
       │                              │ liquid.  (is_active=false)     │
       │                              │ date                           │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │ 12. Generate liquidation       │
       │                              │     receipt                    │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │ 13. COMMIT TRANSACTION         │
       │                              │                                │
       │ 14. Show confirmation        │                                │
       │     + Printable receipt      │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
```

### Liquidation Types

| Type | Description | Member Status After | Accounts After |
|------|-------------|--------------------|-----------------|
| **Periodic** | Regular 6-year cycle | Active | Reset to zero, continue |
| **Exit** | Member leaves cooperative | Inactive | Closed |

### Calculation Formula

```
Total Liquidation Amount =
    Savings Account Balance
  + Contributions Account Balance
  + Surplus Account Balance
  ─────────────────────────────────
  = Total Payout to Member
```

### Business Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **LQ-001** | 6-year eligibility | From affiliation OR last liquidation |
| **LQ-002** | All accounts liquidated | Savings + Contributions + Surplus |
| **LQ-003** | Atomic transaction | All or nothing (rollback on failure) |
| **LQ-004** | Receipt required | Detailed breakdown for member |
| **LQ-005** | Date tracking | `last_liquidation_date` updated |
| **LQ-006** | Exit deactivates | Member becomes inactive |
| **LQ-007** | Zero balance allowed | Can liquidate with ₡0 balance |

### API Endpoints

```http
# List pending liquidations
GET /api/liquidations/pending

# Preview liquidation amounts
GET /api/liquidations/preview/:memberId

# Execute liquidation
POST /api/liquidations/execute
{
  "memberId": 42,
  "liquidationType": "periodic",  // or "exit"
  "notes": "Regular 6-year liquidation"
}

# Get liquidation history
GET /api/liquidations
GET /api/liquidations/:id
```

---

## 6. Assembly Management Flow

The lifecycle of cooperative assemblies (meetings).

### Assembly Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ASSEMBLY LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                         ●──── START
                              │
                              ▼
                    ┌─────────────────┐
                    │     CREATED     │ ◄── Initial state
                    │   (is_active:   │     Details can be edited
                    │     false)      │
                    └────────┬────────┘
                              │
                              │ POST /:id/activate
                              ▼
                    ┌─────────────────┐
                    │     ACTIVE      │ ◄── Only ONE at a time
                    │   (is_active:   │     Attendance registration open
                    │     true)       │     Cannot be deleted
                    └────────┬────────┘
                              │
                              │ POST /:id/deactivate
                              ▼
                    ┌─────────────────┐
                    │   CONCLUDED     │ ◄── concluded_at timestamp set
                    │   (is_active:   │     Attendance locked
                    │     false)      │     Can generate reports
                    └────────┬────────┘
                              │
                              │ DELETE /:id (optional)
                              ▼
                    ┌─────────────────┐
                    │    ARCHIVED     │ ◄── Soft delete
                    │   (deleted_at   │     Data preserved
                    │     set)        │
                    └─────────────────┘
```

### Assembly Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ASSEMBLY MANAGEMENT FLOW                                │
│                                                                              │
│  Roles: Administrator                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

  ADMINISTRATOR                    SYSTEM                          DATABASE
       │                              │                                │
   ═══════════════════════════════════════════════════════════════════════
   │                         CREATE ASSEMBLY                              │
   ═══════════════════════════════════════════════════════════════════════
       │                              │                                │
       │  1. Fill assembly form:      │                                │
       │     - Title                  │                                │
       │     - Date                   │                                │
       │     - Start time             │                                │
       │     - Location (optional)    │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  2. Create assembly record     │
       │                              │     is_active: false           │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  3. Assembly created         │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
   ═══════════════════════════════════════════════════════════════════════
   │                        ACTIVATE ASSEMBLY                             │
   ═══════════════════════════════════════════════════════════════════════
       │                              │                                │
       │  4. Click "Activate"         │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  5. Check for other active     │
       │                              │     assemblies                 │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │      ◇ Other active exists?    │
       │                              │     ╱ ╲                        │
       │                              │   YES  NO                      │
       │                              │    │    │                      │
       │                              │    ▼    │                      │
       │                              │ Deactivate │                   │
       │                              │ other    │                     │
       │                              │    │     │                     │
       │                              │    └──┬──┘                     │
       │                              │       │                        │
       │                              │       ▼                        │
       │                              │  6. Activate this assembly     │
       │                              │     is_active: true            │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  7. Assembly now active      │                                │
       │     Attendance open          │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
   ═══════════════════════════════════════════════════════════════════════
   │                       DEACTIVATE ASSEMBLY                            │
   ═══════════════════════════════════════════════════════════════════════
       │                              │                                │
       │  8. Click "Conclude"         │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  9. Set is_active: false       │
       │                              │     Set concluded_at: NOW()    │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │ 10. Assembly concluded       │                                │
       │     Report available         │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
```

### Business Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **AS-001** | Single active assembly | Only one can be active at a time |
| **AS-002** | Auto-deactivation | Activating one deactivates others |
| **AS-003** | Cannot delete active | Must deactivate first |
| **AS-004** | Attendance linked | Records tied to specific assembly |
| **AS-005** | Conclusion timestamp | Set when deactivated |
| **AS-006** | Edit restrictions | Cannot edit concluded assemblies |

### API Endpoints

```http
# CRUD Operations
POST   /api/assemblies              # Create
GET    /api/assemblies              # List all
GET    /api/assemblies/:id          # Get one
PUT    /api/assemblies/:id          # Update
DELETE /api/assemblies/:id          # Delete

# State Transitions
POST   /api/assemblies/:id/activate
POST   /api/assemblies/:id/deactivate

# Related Data
GET    /api/assemblies/:id/attendance
GET    /api/assemblies/active       # Get current active
```

---

## 7. Surplus Distribution Flow

The process of distributing cooperative surplus to members.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SURPLUS DISTRIBUTION FLOW                              │
│                                                                              │
│  Roles: Administrator                                                        │
│  Timing: Annual (end of fiscal year)                                         │
└─────────────────────────────────────────────────────────────────────────────┘

  ADMINISTRATOR                    SYSTEM                          DATABASE
       │                              │                                │
       │  1. Access Surplus           │                                │
       │     Distribution module      │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  2. Calculate total            │
       │                              │     distributable surplus      │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  3. View surplus summary:    │                                │
       │     Total: ₡500,000          │                                │
       │     Members: 100             │                                │
       │     Per capita: ₡5,000       │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  4. Configure distribution:  │                                │
       │     - Fixed amount per member│                                │
       │     - OR proportional to     │                                │
       │       contributions          │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  5. Preview distribution:      │
       │                              │     Member A: ₡5,200           │
       │                              │     Member B: ₡4,800           │
       │                              │     ...                        │
       │                              │                                │
       │  6. Review and confirm       │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  7. BEGIN TRANSACTION          │
       │                              │                                │
       │                              │  8. Create distribution record │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │  9. For each member:           │
       │                              │     - Create surplus txn       │
       │                              │     - Update surplus balance   │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │ 10. COMMIT TRANSACTION         │
       │                              │                                │
       │ 11. Distribution complete    │                                │
       │     [100 members credited]   │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
```

### Distribution Methods

| Method | Formula | Use Case |
|--------|---------|----------|
| **Equal** | `total / member_count` | Simple, fair distribution |
| **Proportional** | `(member_contrib / total_contrib) * total` | Rewards higher contributors |
| **Tiered** | Different rates by level | Incentivize seniority |

### API Endpoints

```http
# Surplus Distribution
GET  /api/surplus/summary
POST /api/surplus/calculate-preview
POST /api/surplus/distribute

# Member Surplus
GET  /api/surplus/members/:memberId
```

---

## 8. Report Generation Flow

The process of generating various system reports.

### Report Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AVAILABLE REPORTS                                    │
├──────────────────────┬──────────────────────────────────────────────────────┤
│  REPORT TYPE         │  DESCRIPTION                                         │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Attendance Report   │  Assembly attendance with member details             │
│  Savings Inventory   │  Monthly/annual savings summary by member            │
│  Contributions       │  Contribution payments by period                     │
│  Member Directory    │  Active members with contact info                    │
│  Financial Summary   │  Overall cooperative financial health                │
│  Liquidation Report  │  Pending and completed liquidations                  │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

### Report Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REPORT GENERATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  USER                             SYSTEM                          OUTPUT
    │                                │                                │
    │  1. Select report type         │                                │
    ├───────────────────────────────>│                                │
    │                                │                                │
    │  2. Configure parameters:      │                                │
    │     - Date range               │                                │
    │     - Filters (level, etc)     │                                │
    │     - Format (PDF/Excel)       │                                │
    ├───────────────────────────────>│                                │
    │                                │                                │
    │                                │  3. Query database             │
    │                                │     with parameters            │
    │                                │                                │
    │                                │  4. Aggregate and              │
    │                                │     format data                │
    │                                │                                │
    │                                │  5. Generate document          │
    │                                ├───────────────────────────────>│
    │                                │                                │
    │  6. Download/Print             │                                │
    │<───────────────────────────────┤                                │
    │                                │                                │
```

### Attendance Report Contents

| Section | Data Included |
|---------|---------------|
| **Header** | Assembly title, date, time, location |
| **Summary** | Total attendance, percentage |
| **By Level** | Breakdown by grade/level |
| **By Method** | QR vs Manual count |
| **Detail List** | Member name, code, time, method |

### API Endpoints

```http
# Attendance Reports
GET /api/reports/attendance/:assemblyId
GET /api/reports/attendance/:assemblyId/export?format=pdf

# Savings Reports
GET /api/reports/savings/inventory
GET /api/reports/savings/by-member/:memberId

# General Reports
GET /api/reports/members
GET /api/reports/financial-summary
```

---

## 9. Notification Flow

The system notification workflow for important events.

### Notification Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              TRIGGER EVENTS
                                    │
         ┌──────────────┬───────────┼───────────┬──────────────┐
         │              │           │           │              │
         ▼              ▼           ▼           ▼              ▼
   ┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │Withdrawal│  │ Transfer │ │Liquidation│ │Contrib. │ │  System  │
   │ Request  │  │ Request  │ │   Due    │ │ Overdue │ │  Alert   │
   └────┬─────┘  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
        │             │            │            │             │
        └──────┬──────┴─────┬──────┴──────┬─────┴──────┬──────┘
               │            │             │            │
               ▼            ▼             ▼            ▼
         ┌─────────────────────────────────────────────────────┐
         │              NOTIFICATION SERVICE                    │
         │                                                      │
         │  • Determine recipients based on notification type   │
         │  • Create notification records                       │
         │  • Update unread count                               │
         │  • Trigger push notification (if enabled)            │
         └─────────────────────┬───────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ In-App   │    │  Email   │    │   Push   │
        │ Badge    │    │ (future) │    │ (future) │
        └──────────┘    └──────────┘    └──────────┘
```

### Notification Types & Recipients

| Type | Trigger Event | Recipients | Priority |
|------|---------------|------------|----------|
| `withdrawal_request` | New withdrawal request created | Manager, Administrator | High |
| `transfer_request` | New transfer request created | Manager, Administrator | High |
| `request_approved` | Withdrawal request approved | Requester | Medium |
| `request_rejected` | Withdrawal request rejected | Requester | Medium |
| `liquidation_due` | Member reaches 6-year mark | Administrator | Low |
| `contribution_overdue` | Missing contribution payment | Administrator | Medium |
| `system_alert` | System events (backup, etc.) | Administrator | Varies |

### Notification Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│   CREATED    │────>│   UNREAD     │────>│    READ      │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            │ (optional)
                            ▼
                     ┌──────────────┐
                     │              │
                     │  DISMISSED   │
                     │              │
                     └──────────────┘
```

### API Endpoints

```http
# Get Notifications
GET /api/notifications
GET /api/notifications/unread-count

# Mark as Read
POST /api/notifications/:id/read
POST /api/notifications/mark-all-read

# Push Subscription (Web Push)
POST /api/push/subscribe
DELETE /api/push/unsubscribe
```

---

## 10. User Management Flow

The process of managing system users (not members).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER MANAGEMENT FLOW                                  │
│                                                                              │
│  Roles: Administrator only                                                   │
│  Note: Users are cooperative staff, not members                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ADMINISTRATOR                    SYSTEM                          DATABASE
       │                              │                                │
   ═══════════════════════════════════════════════════════════════════════
   │                         CREATE USER                                  │
   ═══════════════════════════════════════════════════════════════════════
       │                              │                                │
       │  1. Access Settings > Users  │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │  2. Click "Add User"         │                                │
       │     - Full name              │                                │
       │     - Microsoft email        │                                │
       │     - Role (admin/manager/   │                                │
       │            registrar)        │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  3. Validate email format      │
       │                              │                                │
       │                              │  4. Check email not exists     │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │                              │  5. Create user record         │
       │                              │     is_active: true            │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  6. User created             │                                │
       │     (Can now login with      │                                │
       │      Microsoft account)      │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
   ═══════════════════════════════════════════════════════════════════════
   │                      DEACTIVATE USER                                 │
   ═══════════════════════════════════════════════════════════════════════
       │                              │                                │
       │  7. Click "Deactivate"       │                                │
       │     on user row              │                                │
       ├─────────────────────────────>│                                │
       │                              │                                │
       │                              │  8. Set is_active: false       │
       │                              ├═══════════════════════════════>│
       │                              │                                │
       │  9. User deactivated         │                                │
       │     (Cannot login anymore)   │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
```

### User Roles Summary

| Role | Permissions |
|------|-------------|
| **administrator** | Full access to all modules |
| **manager** | Financial operations, reports, withdrawal approvals |
| **registrar** | Member management, attendance registration |

---

## State Machines

### Member Status

```
                    ┌─────────────────┐
                    │                 │
        ┌──────────>│     ACTIVE      │<──────────┐
        │           │                 │           │
        │           └────────┬────────┘           │
        │                    │                    │
        │           Liquidation (exit)       Reactivate
        │                    │                    │
        │                    ▼                    │
        │           ┌─────────────────┐           │
   Affiliate        │                 │           │
        │           │    INACTIVE     │───────────┘
        │           │                 │
        │           └─────────────────┘
        │
   ┌────┴────┐
   │         │
   │  START  │
   │         │
   └─────────┘
```

### Withdrawal Request Status

```
┌─────────┐     ┌─────────┐     ┌───────────┐
│ PENDING │────>│APPROVED │────>│ COMPLETED │
└────┬────┘     └─────────┘     └───────────┘
     │
     ├─────────>┌─────────┐
     │          │REJECTED │
     │          └─────────┘
     │
     └─────────>┌─────────┐
                │CANCELLED│
                └─────────┘
```

### Assembly Status

```
┌─────────┐     ┌────────┐     ┌───────────┐
│ CREATED │────>│ ACTIVE │────>│ CONCLUDED │
└─────────┘     └────────┘     └─────┬─────┘
                                     │
                                     ▼
                               ┌───────────┐
                               │ ARCHIVED  │
                               └───────────┘
```

---

## Error Handling

### Common Error Patterns

| Error Type | HTTP Code | User Message | System Action |
|------------|-----------|--------------|---------------|
| Validation Error | 400 | Field-specific message | Return validation errors |
| Duplicate Entry | 409 | "Record already exists" | No database change |
| Not Found | 404 | "Resource not found" | Log warning |
| Insufficient Funds | 400 | "Insufficient balance" | No transaction created |
| Unauthorized | 401 | "Please login" | Redirect to login |
| Forbidden | 403 | "Access denied" | Log security event |
| Server Error | 500 | "Internal error" | Log error, alert admin |

### Transaction Rollback Scenarios

All multi-step operations use database transactions:

1. **Member Affiliation**: Rollback if any account creation fails
2. **Liquidation**: Rollback if any withdrawal transaction fails
3. **Surplus Distribution**: Rollback if any member credit fails

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture overview |
| [02-DATA-MODEL.md](./02-DATA-MODEL.md) | Database schema and relationships |
| [03-API-REST.md](./03-API-REST.md) | Complete API reference |
| [04-FRONTEND.md](./04-FRONTEND.md) | Frontend components and hooks |
| [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) | Auth flow and security |
| [07-INSTALLATION.md](./07-INSTALLATION.md) | Setup instructions |
| [08-DEPLOYMENT.md](./08-DEPLOYMENT.md) | Production deployment |

---

<p align="center">
  <sub>Last updated: 2025</sub>
</p>
