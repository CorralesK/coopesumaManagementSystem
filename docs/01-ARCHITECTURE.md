# System Architecture

> **Document Version:** 1.0
> **Last Updated:** February 2025
> **Audience:** Software Architects, Senior Developers, Technical Leads

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. High-Level Architecture](#2-high-level-architecture)
- [3. Backend Architecture](#3-backend-architecture)
- [4. Frontend Architecture](#4-frontend-architecture)
- [5. Data Flow](#5-data-flow)
- [6. Security Architecture](#6-security-architecture)
- [7. Design Patterns](#7-design-patterns)
- [8. Directory Structure](#8-directory-structure)

---

## 1. Overview

### 1.1 System Description

CoopLink CR is a **full-stack web application** designed to manage student cooperatives in elementary schools. The system follows a **client-server architecture** with clear separation of concerns between the presentation layer (React), business logic layer (Node.js/Express), and data layer (PostgreSQL).

### 1.2 Key Architectural Decisions

| Decision | Rationale |
|:---------|:----------|
| **Monolithic Backend** | Simplicity for a small team; easier deployment and debugging |
| **REST API** | Industry standard; stateless; easy to consume from any client |
| **React SPA** | Rich user experience; component reusability; large ecosystem |
| **PostgreSQL** | ACID compliance; complex queries; data integrity for financial data |
| **Microsoft OAuth** | Enterprise-grade security; no password management overhead |

### 1.3 Quality Attributes

| Attribute | Implementation |
|:----------|:---------------|
| **Security** | OAuth 2.0, JWT, RBAC, parameterized queries, HTTPS |
| **Maintainability** | Modular architecture, separation of concerns, consistent patterns |
| **Scalability** | Stateless API, connection pooling, indexed queries |
| **Reliability** | Database triggers for data integrity, transaction support |
| **Usability** | PWA support, responsive design, Spanish UI localization |

---

## 2. High-Level Architecture

### 2.1 System Context Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SYSTEMS                                    │
│                                                                                  │
│    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │
│    │   Microsoft     │    │   Cloudinary    │    │    Browser      │           │
│    │   Azure AD      │    │   (Images)      │    │    (Client)     │           │
│    └────────┬────────┘    └────────┬────────┘    └────────┬────────┘           │
│             │                      │                      │                     │
└─────────────┼──────────────────────┼──────────────────────┼─────────────────────┘
              │                      │                      │
              │ OAuth 2.0            │ REST API             │ HTTPS
              │                      │                      │
              ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COOPLINK CR SYSTEM                                     │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         PRESENTATION LAYER                                 │  │
│  │                                                                            │  │
│  │   React 19 + Vite 7 + Tailwind CSS                                        │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │   │  Pages   │ │Components│ │  Hooks   │ │ Context  │ │ Services │       │  │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                           │
│                                      │ REST API (JSON)                           │
│                                      ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                          BUSINESS LAYER                                    │  │
│  │                                                                            │  │
│  │   Node.js 18+ + Express 4                                                 │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │   │  Routes  │→│Controller│→│ Service  │→│Repository│→│   Utils  │       │  │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                           │
│                                      │ SQL (pg driver)                           │
│                                      ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                           DATA LAYER                                       │  │
│  │                                                                            │  │
│  │   PostgreSQL 14+                                                          │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │  │
│  │   │  Tables  │ │ Indexes  │ │ Triggers │ │Functions │                    │  │
│  │   │   (17)   │ │  (12+)   │ │   (5+)   │ │   (3+)   │                    │  │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘                    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Presentation** | React | 19.1.1 | UI components and state management |
| | Vite | 7.1.7 | Build tool and development server |
| | Tailwind CSS | 4.1.14 | Utility-first styling |
| | React Router | 7.9.4 | Client-side routing |
| | Axios | 1.12.2 | HTTP client |
| **Business** | Node.js | 18+ | JavaScript runtime |
| | Express | 4.18.2 | Web framework |
| | Joi | 17.11.0 | Schema validation |
| | jsonwebtoken | 9.0.2 | JWT handling |
| | helmet | 7.1.0 | Security headers |
| **Data** | PostgreSQL | 14+ | Relational database |
| | pg | 8.11.3 | PostgreSQL driver |

---

## 3. Backend Architecture

### 3.1 Modular Architecture Pattern

The backend follows a **feature-based modular architecture** where each business domain is encapsulated in its own module with consistent internal structure.

```text
backend/src/modules/
│
├── auth/                           # Authentication Module
│   ├── authController.js           # HTTP request handling
│   ├── authRoutes.js               # Route definitions
│   └── authService.js              # Business logic
│
├── members/                        # Member Management Module
│   ├── memberController.js         # HTTP request handling
│   ├── memberRoutes.js             # Route definitions
│   ├── memberService.js            # Business logic
│   ├── memberRepository.js         # Data access layer
│   └── memberValidation.js         # Joi validation schemas
│
├── assemblies/                     # Assembly Management Module
├── attendance/                     # Attendance Tracking Module
├── savings/                        # Savings Operations Module
├── contributions/                  # Contributions Module
├── liquidations/                   # Liquidations Module
├── withdrawalRequests/             # Withdrawal Requests Module
├── surplus/                        # Surplus Distribution Module
├── receipts/                       # Receipt Generation Module
├── notifications/                  # Notifications Module
├── reports/                        # Reporting Module
├── catalogs/                       # Catalog Data Module
├── cooperatives/                   # Cooperative Management Module
├── users/                          # User Management Module
└── push/                           # Push Notifications Module
```

### 3.2 Layer Responsibilities

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTES LAYER                                        │
│                                                                                  │
│  Responsibilities:                                                              │
│  • Define HTTP endpoints (GET, POST, PUT, DELETE)                               │
│  • Apply middleware chain (auth, validation, permissions)                       │
│  • Map URLs to controller methods                                               │
│                                                                                  │
│  Example:                                                                        │
│  router.post('/members', authMiddleware, validate(schema), controller.create)  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CONTROLLER LAYER                                      │
│                                                                                  │
│  Responsibilities:                                                              │
│  • Extract and validate request parameters                                      │
│  • Call appropriate service methods                                             │
│  • Format and send HTTP responses                                               │
│  • Handle HTTP-specific concerns (status codes, headers)                        │
│                                                                                  │
│  Example:                                                                        │
│  async createMember(req, res) {                                                 │
│    const member = await memberService.create(req.body, req.user);               │
│    return successResponse(res, member, 'Created', 201);                         │
│  }                                                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             SERVICE LAYER                                        │
│                                                                                  │
│  Responsibilities:                                                              │
│  • Implement business logic and rules                                           │
│  • Orchestrate calls to repositories                                            │
│  • Handle business-level validation                                             │
│  • Manage transactions when needed                                              │
│                                                                                  │
│  Example:                                                                        │
│  async create(data, user) {                                                     │
│    const qrHash = await generateQrHash();                                       │
│    const memberCode = await generateMemberCode();                               │
│    return memberRepository.create({ ...data, qrHash, memberCode });             │
│  }                                                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            REPOSITORY LAYER                                      │
│                                                                                  │
│  Responsibilities:                                                              │
│  • Execute database queries                                                     │
│  • Map database results to domain objects                                       │
│  • Handle database-specific concerns                                            │
│  • Provide data access abstraction                                              │
│                                                                                  │
│  Example:                                                                        │
│  async create(data) {                                                           │
│    const query = 'INSERT INTO members (...) VALUES (...) RETURNING *';         │
│    const result = await db.query(query, [data.fullName, ...]);                  │
│    return toCamelCase(result.rows[0]);                                          │
│  }                                                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Middleware Pipeline

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST PIPELINE                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

    HTTP Request
         │
         ▼
┌─────────────────┐
│     helmet      │ ─── Security headers (XSS, CSP, etc.)
└────────┬────────┘
         ▼
┌─────────────────┐
│      cors       │ ─── Cross-origin resource sharing
└────────┬────────┘
         ▼
┌─────────────────┐
│  express.json   │ ─── Parse JSON body
└────────┬────────┘
         ▼
┌─────────────────┐
│ requestLogger   │ ─── Log request details (dev only)
└────────┬────────┘
         ▼
┌─────────────────┐
│ authMiddleware  │ ─── Verify JWT token
└────────┬────────┘     │
         │              └─── 401 Unauthorized
         ▼
┌─────────────────┐
│ roleMiddleware  │ ─── Check user role permissions
└────────┬────────┘     │
         │              └─── 403 Forbidden
         ▼
┌─────────────────┐
│   validation    │ ─── Validate request body/query
└────────┬────────┘     │
         │              └─── 400 Bad Request
         ▼
┌─────────────────┐
│   Controller    │ ─── Handle business logic
└────────┬────────┘
         ▼
┌─────────────────┐
│  errorHandler   │ ─── Catch and format errors
└────────┬────────┘
         ▼
    HTTP Response
```

### 3.4 Middleware Details

| Middleware | File | Purpose |
|:-----------|:-----|:--------|
| `authMiddleware` | `authMiddleware.js` | Validates JWT token, fetches user from DB, attaches to `req.user` |
| `roleMiddleware` | `roleMiddleware.js` | Checks if user has required role(s) |
| `permissionMiddleware` | `permissionMiddleware.js` | Checks specific permissions (fine-grained access) |
| `ownershipMiddleware` | `ownershipMiddleware.js` | Verifies user owns the requested resource |
| `validationMiddleware` | `validationMiddleware.js` | Validates body/query against Joi schemas |
| `uploadMiddleware` | `uploadMiddleware.js` | Handles multipart file uploads (Multer + Cloudinary) |
| `errorHandler` | `errorHandler.js` | Centralizes error handling and response formatting |
| `requestLogger` | `requestLogger.js` | Logs incoming requests (development mode) |

---

## 4. Frontend Architecture

### 4.1 Component Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CONTEXT LAYER                                       │
│                                                                                  │
│   AuthContext                          CooperativeContext                       │
│   ┌─────────────────────────┐         ┌─────────────────────────┐              │
│   │ • user                  │         │ • cooperative           │              │
│   │ • token                 │         │ • loading               │              │
│   │ • isAuthenticated       │         │                         │              │
│   │ • login()               │         │                         │              │
│   │ • logout()              │         │                         │              │
│   │ • hasRole()             │         │                         │              │
│   └─────────────────────────┘         └─────────────────────────┘              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               HOOKS LAYER                                        │
│                                                                                  │
│   useMembers        useAssemblies      useSavings        useAttendance         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │ • members    │  │ • assemblies │  │ • savings    │  │ • attendance │       │
│   │ • loading    │  │ • active     │  │ • deposit()  │  │ • register() │       │
│   │ • fetch()    │  │ • activate() │  │ • withdraw() │  │ • scan()     │       │
│   │ • create()   │  │ • deactivate │  │              │  │              │       │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                  │
│   useQrScanner      useLiquidations    useWithdrawals    useDebounce           │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │ • scanning   │  │ • pending    │  │ • requests   │  │ • debounced  │       │
│   │ • start()    │  │ • execute()  │  │ • approve()  │  │   value      │       │
│   │ • stop()     │  │ • preview()  │  │ • reject()   │  │              │       │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             PAGES LAYER                                          │
│                                                                                  │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│   │ Dashboard  │ │  Members   │ │ Assemblies │ │  Savings   │ │   Users    │   │
│   │   Page     │ │   Pages    │ │   Pages    │ │   Pages    │ │   Pages    │   │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                                  │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│   │ Attendance │ │ Withdrawal │ │  Reports   │ │   Login    │ │   Public   │   │
│   │   Pages    │ │   Pages    │ │   Pages    │ │   Pages    │ │   Pages    │   │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENTS LAYER                                       │
│                                                                                  │
│   Common Components                                                              │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│   │  Alert  │ │ Button  │ │  Card   │ │  Input  │ │  Modal  │ │  Table  │      │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                                                  │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│   │ Select  │ │Pagination│ │ Loading │ │ Layout  │ │Protected│                  │
│   │         │ │         │ │         │ │         │ │  Route  │                  │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                  │
│                                                                                  │
│   Domain Components                                                              │
│   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                      │
│   │   MemberCard   │ │ SavingsDeposit │ │AttendanceList  │                      │
│   │   BatchQrModal │ │   Modal        │ │    Print       │                      │
│   └────────────────┘ └────────────────┘ └────────────────┘                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SERVICES LAYER                                        │
│                                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │     api      │  │ authService  │  │memberService │  │savingsService│       │
│   │   (axios)    │  │              │  │              │  │              │       │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 State Management Strategy

| State Type | Solution | Use Case |
|:-----------|:---------|:---------|
| **Global Auth State** | React Context (`AuthContext`) | User session, token, role |
| **Server State** | Custom Hooks + useState | API data (members, assemblies, etc.) |
| **UI State** | Component useState | Forms, modals, loading indicators |
| **URL State** | React Router | Current page, route params |

### 4.3 Routing Architecture

```javascript
// Route Protection Hierarchy

<Routes>
  {/* PUBLIC ROUTES - No authentication required */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/auth/callback" element={<AuthCallbackPage />} />
  <Route path="/verify" element={<MemberVerifyPage />} />  {/* QR verification */}

  {/* MEMBER ROUTES - Requires 'member' role */}
  <Route path="/my-dashboard" element={
    <ProtectedRoute requiredRole="member">
      <MemberDashboardPage />
    </ProtectedRoute>
  } />

  {/* ADMIN ROUTES - Requires 'administrator' role */}
  <Route path="/dashboard" element={
    <ProtectedRoute requiredRole="administrator">
      <DashboardPage />
    </ProtectedRoute>
  } />

  {/* MULTI-ROLE ROUTES - Requires any of the specified roles */}
  <Route path="/savings" element={
    <ProtectedRoute requiredRole={['administrator', 'manager']}>
      <SavingsManagementPage />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 5. Data Flow

### 5.1 Request-Response Flow

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE REQUEST FLOW EXAMPLE                             │
│                        (Create Member with Photo)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

User Action                          Frontend                              Backend
     │                                   │                                     │
     │ 1. Fill form + upload photo       │                                     │
     ├──────────────────────────────────>│                                     │
     │                                   │                                     │
     │                                   │ 2. Create FormData                  │
     │                                   │    + append fields                  │
     │                                   │    + append photo file              │
     │                                   │                                     │
     │                                   │ 3. POST /api/members/affiliate      │
     │                                   │    Authorization: Bearer <token>    │
     │                                   │    Content-Type: multipart/form-data│
     │                                   ├────────────────────────────────────>│
     │                                   │                                     │
     │                                   │                    4. authMiddleware
     │                                   │                       - Verify JWT
     │                                   │                       - Fetch user
     │                                   │                       - Attach to req
     │                                   │                                     │
     │                                   │                    5. roleMiddleware
     │                                   │                       - Check 'admin'
     │                                   │                                     │
     │                                   │                    6. uploadMiddleware
     │                                   │                       - Parse multipart
     │                                   │                       - Upload to Cloudinary
     │                                   │                       - Attach URL to req
     │                                   │                                     │
     │                                   │                    7. validationMiddleware
     │                                   │                       - Validate with Joi
     │                                   │                                     │
     │                                   │                    8. memberController
     │                                   │                       - Call service
     │                                   │                                     │
     │                                   │                    9. memberService
     │                                   │                       - Generate QR hash
     │                                   │                       - Generate member code
     │                                   │                       - Create 4 accounts
     │                                   │                       - Register affiliation
     │                                   │                       - Generate receipt
     │                                   │                                     │
     │                                   │                   10. memberRepository
     │                                   │                       - INSERT member
     │                                   │                       - Trigger: update
     │                                   │                         updated_at
     │                                   │                                     │
     │                                   │ 11. Response (201 Created)          │
     │                                   │     { success: true,                │
     │                                   │       data: { member, receipt } }   │
     │                                   │<────────────────────────────────────┤
     │                                   │                                     │
     │ 12. Show success toast            │                                     │
     │     Navigate to member list       │                                     │
     │<──────────────────────────────────┤                                     │
     │                                   │                                     │
```

### 5.2 API Response Contract

```typescript
// Standard Success Response
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

// Paginated Response
interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Response
interface ErrorResponse {
  success: false;
  message: string;
  error: string;  // Error code (e.g., 'VALIDATION_ERROR')
  details?: object;  // Additional error details
}
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MICROSOFT OAUTH 2.0 FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

     Browser              Frontend           Backend            Microsoft
        │                    │                  │                   │
        │ 1. Click Login     │                  │                   │
        ├───────────────────>│                  │                   │
        │                    │                  │                   │
        │ 2. Redirect        │                  │                   │
        │<───────────────────┤                  │                   │
        │                    │                  │                   │
        │ 3. GET /api/auth/microsoft            │                   │
        ├──────────────────────────────────────>│                   │
        │                    │                  │                   │
        │ 4. 302 Redirect to Microsoft          │                   │
        │<──────────────────────────────────────┤                   │
        │                    │                  │                   │
        │ 5. Navigate to Microsoft login        │                   │
        ├──────────────────────────────────────────────────────────>│
        │                    │                  │                   │
        │ 6. User authenticates                 │                   │
        │<──────────────────────────────────────────────────────────┤
        │                    │                  │                   │
        │ 7. Redirect with authorization code   │                   │
        ├──────────────────────────────────────>│                   │
        │                    │                  │                   │
        │                    │                  │ 8. Exchange code  │
        │                    │                  │    for tokens     │
        │                    │                  ├──────────────────>│
        │                    │                  │                   │
        │                    │                  │ 9. Access token   │
        │                    │                  │<──────────────────┤
        │                    │                  │                   │
        │                    │                  │ 10. Get user info │
        │                    │                  ├──────────────────>│
        │                    │                  │                   │
        │                    │                  │ 11. User profile  │
        │                    │                  │<──────────────────┤
        │                    │                  │                   │
        │                    │                  │ 12. Verify user   │
        │                    │                  │     in database   │
        │                    │                  │                   │
        │                    │                  │ 13. Generate JWT  │
        │                    │                  │                   │
        │ 14. Redirect to frontend/auth/callback?token=<jwt>        │
        │<──────────────────────────────────────┤                   │
        │                    │                  │                   │
        │ 15. Store token    │                  │                   │
        ├───────────────────>│                  │                   │
        │                    │                  │                   │
```

### 6.2 Authorization Model (RBAC)

```javascript
const ROLE_PERMISSIONS = {
  administrator: [
    // User Management
    'manage_users',

    // Member Management
    'manage_members',
    'view_qr_codes',
    'generate_qr_codes',

    // Assembly Management
    'manage_assemblies',
    'scan_attendance',

    // Financial Operations
    'manage_savings',
    'manage_contributions',
    'approve_withdrawals',
    'manage_surplus',
    'execute_liquidations',
    'generate_receipts',

    // Reporting
    'generate_reports',
    'view_all_data',

    // Notifications
    'broadcast_notifications'
  ],

  registrar: [
    'scan_attendance',
    'view_active_assembly'
  ],

  manager: [
    'manage_savings',
    'manage_contributions',
    'approve_withdrawals',
    'view_savings_reports',
    'view_member_balances',
    'generate_receipts',
    'manage_surplus',
    'execute_liquidations'
  ],

  member: [
    'view_own_dashboard',
    'view_own_accounts',
    'view_own_transactions',
    'request_withdrawal'
  ]
};
```

### 6.3 Security Controls

| Control | Implementation |
|:--------|:---------------|
| **SQL Injection** | Parameterized queries with `pg` driver |
| **XSS** | React auto-escaping + Helmet.js CSP |
| **CSRF** | SameSite cookies + CORS restrictions |
| **Authentication** | Microsoft OAuth 2.0 |
| **Session** | JWT with 24h expiration |
| **Data Access** | Role-based + ownership checks |
| **Transport** | HTTPS enforced in production |
| **Headers** | Helmet.js security headers |

---

## 7. Design Patterns

### 7.1 Backend Patterns

| Pattern | Usage | Example |
|:--------|:------|:--------|
| **Repository** | Data access abstraction | `memberRepository.findById(id)` |
| **Service Layer** | Business logic encapsulation | `memberService.affiliate(data)` |
| **Factory** | Response formatting | `successResponse(res, data, msg)` |
| **Middleware Chain** | Request processing pipeline | `auth → role → validate → controller` |
| **Singleton** | Database connection pool | `db.query()` (single pool instance) |

### 7.2 Frontend Patterns

| Pattern | Usage | Example |
|:--------|:------|:--------|
| **Context Provider** | Global state management | `AuthContext`, `CooperativeContext` |
| **Custom Hooks** | Reusable stateful logic | `useMembers()`, `useSavings()` |
| **Compound Components** | Complex UI composition | `Modal + Modal.Header + Modal.Body` |
| **Render Props** | Flexible rendering | `ProtectedRoute` with children |
| **Container/Presenter** | Logic/UI separation | Pages (container) / Components (presenter) |

---

## 8. Directory Structure

### 8.1 Complete Project Structure

```text
coopesumaManagementSystem/
│
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── 📄 app.js                    # Express app configuration
│   │   ├── 📄 server.js                 # Server entry point
│   │   │
│   │   ├── 📂 config/
│   │   │   ├── 📄 database.js           # PostgreSQL connection pool
│   │   │   ├── 📄 environment.js        # Environment variables
│   │   │   ├── 📄 corsConfig.js         # CORS configuration
│   │   │   ├── 📄 microsoftConfig.js    # OAuth configuration
│   │   │   └── 📄 cloudinary.js         # Cloudinary configuration
│   │   │
│   │   ├── 📂 constants/
│   │   │   ├── 📄 roles.js              # User roles & permissions
│   │   │   ├── 📄 errorCodes.js         # Error code definitions
│   │   │   └── 📄 messages.js           # Response messages
│   │   │
│   │   ├── 📂 middlewares/
│   │   │   ├── 📄 authMiddleware.js     # JWT verification
│   │   │   ├── 📄 roleMiddleware.js     # Role-based access control
│   │   │   ├── 📄 permissionMiddleware.js
│   │   │   ├── 📄 ownershipMiddleware.js
│   │   │   ├── 📄 validationMiddleware.js
│   │   │   ├── 📄 uploadMiddleware.js   # File upload (Multer)
│   │   │   ├── 📄 errorHandler.js       # Global error handler
│   │   │   └── 📄 requestLogger.js      # Request logging
│   │   │
│   │   ├── 📂 modules/
│   │   │   ├── 📂 auth/
│   │   │   │   ├── 📄 authController.js
│   │   │   │   ├── 📄 authRoutes.js
│   │   │   │   └── 📄 authService.js
│   │   │   │
│   │   │   ├── 📂 members/
│   │   │   │   ├── 📄 memberController.js
│   │   │   │   ├── 📄 memberRoutes.js
│   │   │   │   ├── 📄 memberService.js
│   │   │   │   ├── 📄 memberRepository.js
│   │   │   │   └── 📄 memberValidation.js
│   │   │   │
│   │   │   ├── 📂 assemblies/           # Same structure
│   │   │   ├── 📂 attendance/
│   │   │   ├── 📂 users/
│   │   │   ├── 📂 savings/
│   │   │   ├── 📂 contributions/
│   │   │   ├── 📂 withdrawalRequests/
│   │   │   ├── 📂 liquidations/
│   │   │   ├── 📂 surplus/
│   │   │   ├── 📂 receipts/
│   │   │   ├── 📂 notifications/
│   │   │   ├── 📂 reports/
│   │   │   ├── 📂 catalogs/
│   │   │   ├── 📂 cooperatives/
│   │   │   └── 📂 push/
│   │   │
│   │   └── 📂 utils/
│   │       ├── 📄 jwtUtils.js           # JWT helper functions
│   │       ├── 📄 qrUtils.js            # QR code generation
│   │       ├── 📄 pdfUtils.js           # PDF generation
│   │       ├── 📄 dateUtils.js          # Date formatting
│   │       ├── 📄 caseConverter.js      # snake_case ↔ camelCase
│   │       ├── 📄 responseFormatter.js  # Response helpers
│   │       ├── 📄 logger.js             # Winston logger
│   │       └── 📄 microsoftOAuthUtils.js
│   │
│   ├── 📂 tests/
│   ├── 📄 package.json
│   ├── 📄 jest.config.js
│   └── 📄 .env.example
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📄 App.jsx                   # Root component + routes
│   │   ├── 📄 main.jsx                  # Application entry
│   │   ├── 📄 index.css                 # Global styles
│   │   │
│   │   ├── 📂 components/
│   │   │   ├── 📂 common/               # Reusable UI components
│   │   │   │   ├── 📄 Alert.jsx
│   │   │   │   ├── 📄 Button.jsx
│   │   │   │   ├── 📄 Card.jsx
│   │   │   │   ├── 📄 Input.jsx
│   │   │   │   ├── 📄 Select.jsx
│   │   │   │   ├── 📄 Modal.jsx
│   │   │   │   ├── 📄 Table.jsx
│   │   │   │   ├── 📄 Pagination.jsx
│   │   │   │   ├── 📄 Loading.jsx
│   │   │   │   ├── 📄 Layout.jsx
│   │   │   │   ├── 📄 ProtectedRoute.jsx
│   │   │   │   └── 📄 UserDropdown.jsx
│   │   │   │
│   │   │   ├── 📂 members/
│   │   │   ├── 📂 savings/
│   │   │   ├── 📂 print/
│   │   │   └── 📂 reports/
│   │   │
│   │   ├── 📂 context/
│   │   │   ├── 📄 AuthContext.jsx
│   │   │   └── 📄 CooperativeContext.jsx
│   │   │
│   │   ├── 📂 hooks/
│   │   │   ├── 📄 index.js              # Hook exports
│   │   │   ├── 📄 useApi.js
│   │   │   ├── 📄 useMembers.js
│   │   │   ├── 📄 useAssemblies.js
│   │   │   ├── 📄 useAttendance.js
│   │   │   ├── 📄 useSavings.js
│   │   │   ├── 📄 useLiquidations.js
│   │   │   ├── 📄 useWithdrawalRequests.js
│   │   │   ├── 📄 useQrScanner.js
│   │   │   ├── 📄 useDebounce.js
│   │   │   └── 📄 usePermissions.js
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── 📄 LoginPage.jsx
│   │   │   ├── 📄 DashboardPage.jsx
│   │   │   ├── 📄 AuthCallbackPage.jsx
│   │   │   ├── 📄 UnauthorizedPage.jsx
│   │   │   ├── 📄 NotFoundPage.jsx
│   │   │   │
│   │   │   ├── 📂 members/
│   │   │   ├── 📂 assemblies/
│   │   │   ├── 📂 attendance/
│   │   │   ├── 📂 users/
│   │   │   ├── 📂 savings/
│   │   │   ├── 📂 withdrawals/
│   │   │   ├── 📂 reports/
│   │   │   ├── 📂 notifications/
│   │   │   └── 📂 public/
│   │   │
│   │   ├── 📂 services/
│   │   │   ├── 📄 api.js                # Axios instance
│   │   │   ├── 📄 index.js              # Service exports
│   │   │   ├── 📄 authService.js
│   │   │   ├── 📄 memberService.js
│   │   │   ├── 📄 assemblyService.js
│   │   │   ├── 📄 attendanceService.js
│   │   │   ├── 📄 savingsService.js
│   │   │   └── 📄 ...
│   │   │
│   │   └── 📂 utils/
│   │       ├── 📄 constants.js          # Application constants
│   │       ├── 📄 formatters.js         # Data formatters
│   │       ├── 📄 errorTranslations.js  # Error messages
│   │       └── 📄 printUtils.js         # Print helpers
│   │
│   ├── 📂 public/
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   └── 📄 .env.example
│
├── 📂 database/
│   ├── 📂 scripts/
│   │   ├── 📄 01_create_functions.sql
│   │   ├── 📄 02_create_tables.sql
│   │   ├── 📄 03_create_indexes.sql
│   │   └── 📄 04_create_triggers.sql
│   └── 📂 backups/
│
├── 📂 docs/                             # You are here!
│
├── 📂 migration/                        # Data migration scripts
│
├── 📄 README.md
└── 📄 .gitignore
```

---

## References

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Design Patterns](https://reactpatterns.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Microsoft OAuth 2.0](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

---

> **Next:** [02-DATA-MODEL.md](./02-DATA-MODEL.md) - Database Schema and Entity Relationships
