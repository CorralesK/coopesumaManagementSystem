<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-14%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/License-Academic-blue?style=for-the-badge" alt="License">
</p>

<h1 align="center">CoopLink CR</h1>

<p align="center">
  <strong>Technical Documentation</strong><br>
  <em>Student Cooperative Attendance Control and Financial Management System</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation-index">Documentation</a> •
  <a href="#-architecture-overview">Architecture</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a>
</p>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Documentation Index](#-documentation-index)
- [Architecture Overview](#-architecture-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [System Modules](#-system-modules)
- [User Roles & Permissions](#-user-roles--permissions)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/cooplinkcr/cooplinkcr.git
cd coopesumaManagementSystem

# Setup Backend
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev

# Setup Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

> 📖 For detailed installation instructions, see [07-INSTALLATION.md](./07-INSTALLATION.md)

---

## 📚 Documentation Index

### Core Documentation

| # | Document | Description | Audience |
|:-:|:---------|:------------|:---------|
| 01 | **[Architecture](./01-ARCHITECTURE.md)** | System design, patterns, and component structure | Architects, Senior Devs |
| 02 | **[Data Model](./02-DATA-MODEL.md)** | Database schema, ERD, tables, and relationships | Backend Devs, DBAs |
| 03 | **[REST API](./03-API-REST.md)** | Complete API reference with examples | All Developers |
| 04 | **[Frontend](./04-FRONTEND.md)** | React components, hooks, and state management | Frontend Devs |
| 05 | **[Authentication](./05-AUTHENTICATION.md)** | OAuth 2.0 flow, JWT, and security | Security, Backend Devs |
| 06 | **[Business Flows](./06-BUSINESS-FLOWS.md)** | Core business processes and workflows | All Team Members |
| 07 | **[Installation](./07-INSTALLATION.md)** | Local development setup guide | New Developers |
| 08 | **[Deployment](./08-DEPLOYMENT.md)** | Production deployment guide | DevOps, Senior Devs |

### Diagrams

| Diagram | Format | Description |
|:--------|:-------|:------------|
| `arquitectura_fisica_sistema.drawio` | Draw.io | Physical architecture diagram |
| `arquitectura_logica_sistema.drawio` | Draw.io | Logical architecture diagram |
| `diagrama_clases_backend.drawio.xml` | Draw.io | Backend class diagram |
| `diagrama_clases_frontend.drawio.xml` | Draw.io | Frontend class diagram |
| `diagrama_clases_sistema.puml` | PlantUML | System class diagram |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     React 19 + Vite 7 (PWA)                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Context   │  │    Hooks    │  │    Pages    │  │ Components  │  │  │
│  │  │   (State)   │  │   (Logic)   │  │   (Views)   │  │    (UI)     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS / REST API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Express 4 + Node.js 18+                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Routes    │──▶│ Controllers │──▶│  Services   │──▶│ Repositories│  │  │
│  │  │ (Endpoints) │  │  (Request)  │  │  (Business) │  │   (Data)    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ TCP/IP
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        PostgreSQL 14+                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Tables    │  │   Indexes   │  │  Triggers   │  │  Functions  │  │  │
│  │  │    (17)     │  │  (Optimized)│  │ (Auto-calc) │  │  (Helpers)  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

> 📖 For detailed architecture documentation, see [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)

---

## 💻 Technology Stack

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | 19.1.1 | UI Framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 7.1.7 | Build Tool & Dev Server |
| ![React Router](https://img.shields.io/badge/-React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white) | 7.9.4 | Client-side Routing |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 4.1.14 | Utility-first CSS |
| ![Axios](https://img.shields.io/badge/-Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | 1.12.2 | HTTP Client |

### Backend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | 18+ | Runtime Environment |
| ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) | 4.18.2 | Web Framework |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) | 14+ | Relational Database |
| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white) | 9.0.2 | Authentication Tokens |
| ![Joi](https://img.shields.io/badge/-Joi-0080FF?style=flat-square) | 17.11.0 | Schema Validation |

### External Services

| Service | Purpose |
|:--------|:--------|
| ![Microsoft](https://img.shields.io/badge/-Microsoft_Azure_AD-0078D4?style=flat-square&logo=microsoft-azure&logoColor=white) | OAuth 2.0 Authentication |
| ![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white) | Image Storage & CDN |

---

## 📁 Project Structure

```
coopesumaManagementSystem/
│
├── 📂 backend/                          # Node.js REST API
│   ├── 📂 src/
│   │   ├── 📄 app.js                    # Express configuration
│   │   ├── 📄 server.js                 # Server entry point
│   │   ├── 📂 config/                   # Configuration files
│   │   │   ├── 📄 database.js           # PostgreSQL connection
│   │   │   ├── 📄 corsConfig.js         # CORS settings
│   │   │   └── 📄 microsoftConfig.js    # OAuth configuration
│   │   ├── 📂 constants/                # Application constants
│   │   │   ├── 📄 roles.js              # User roles & permissions
│   │   │   ├── 📄 errorCodes.js         # Error code definitions
│   │   │   └── 📄 messages.js           # Response messages
│   │   ├── 📂 middlewares/              # Express middlewares
│   │   │   ├── 📄 authMiddleware.js     # JWT verification
│   │   │   ├── 📄 roleMiddleware.js     # Role-based access
│   │   │   └── 📄 validationMiddleware.js
│   │   ├── 📂 modules/                  # Feature modules
│   │   │   ├── 📂 auth/                 # Authentication
│   │   │   ├── 📂 members/              # Member management
│   │   │   ├── 📂 assemblies/           # Assembly management
│   │   │   ├── 📂 attendance/           # Attendance tracking
│   │   │   ├── 📂 savings/              # Savings operations
│   │   │   ├── 📂 liquidations/         # Member liquidations
│   │   │   └── 📂 ...                   # Other modules
│   │   └── 📂 utils/                    # Utility functions
│   │       ├── 📄 jwtUtils.js           # JWT helpers
│   │       ├── 📄 qrUtils.js            # QR code generation
│   │       └── 📄 pdfUtils.js           # PDF generation
│   ├── 📂 tests/                        # Test suites
│   └── 📄 package.json
│
├── 📂 frontend/                         # React PWA Application
│   ├── 📂 src/
│   │   ├── 📄 App.jsx                   # Root component + routing
│   │   ├── 📄 main.jsx                  # Application entry
│   │   ├── 📂 components/               # Reusable components
│   │   │   ├── 📂 common/               # Generic UI components
│   │   │   ├── 📂 members/              # Member-specific
│   │   │   ├── 📂 savings/              # Savings-specific
│   │   │   └── 📂 print/                # Print templates
│   │   ├── 📂 context/                  # React contexts
│   │   │   └── 📄 AuthContext.jsx       # Authentication state
│   │   ├── 📂 hooks/                    # Custom hooks
│   │   │   ├── 📄 useMembers.js
│   │   │   ├── 📄 useSavings.js
│   │   │   └── 📄 ...
│   │   ├── 📂 pages/                    # Page components
│   │   ├── 📂 services/                 # API service layer
│   │   └── 📂 utils/                    # Utilities
│   └── 📄 package.json
│
├── 📂 database/                         # Database scripts
│   ├── 📂 scripts/
│   │   ├── 📄 01_create_functions.sql
│   │   ├── 📄 02_create_tables.sql
│   │   ├── 📄 03_create_indexes.sql
│   │   └── 📄 04_create_triggers.sql
│   └── 📂 backups/
│
├── 📂 docs/                             # Documentation (You are here!)
│
└── 📄 README.md                         # Project overview
```

---

## 🎯 System Modules

### Phase 1: Attendance Control ✅

| Module | Status | Description |
|:-------|:------:|:------------|
| Member Management | ✅ Complete | CRUD operations, QR code generation, photo upload |
| Assembly Management | ✅ Complete | Create, activate, deactivate assemblies |
| QR Attendance | ✅ Complete | Scan QR codes for instant registration |
| Manual Attendance | ✅ Complete | Fallback for damaged QR codes |
| Attendance Reports | ✅ Complete | PDF generation with statistics |

### Phase 2: Financial Management ✅

| Module | Status | Description |
|:-------|:------:|:------------|
| Savings Management | ✅ Complete | Deposits, withdrawals, balance tracking |
| Contributions | ✅ Complete | Annual contribution tracking (₡900/year) |
| Withdrawal Requests | ✅ Complete | Member-initiated, admin-approved |
| Liquidations | ✅ Complete | 6-year cycle or exit liquidations |
| Receipts | ✅ Complete | Auto-generated for all transactions |

### Phase 3: Voting System 🔮

| Module | Status | Description |
|:-------|:------:|:------------|
| Proposal Management | 🔮 Future | Create and manage proposals |
| Electronic Voting | 🔮 Future | Secure member voting |
| Real-time Results | 🔮 Future | Live vote counting |

---

## 👥 User Roles & Permissions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROLE HIERARCHY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │                        ADMINISTRATOR                                 │
    │  ▸ Full system access                                               │
    │  ▸ User management                                                  │
    │  ▸ Member management                                                │
    │  ▸ Assembly management                                              │
    │  ▸ Financial operations                                             │
    │  ▸ Reports & analytics                                              │
    └─────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   REGISTRAR   │       │    MANAGER    │       │    MEMBER     │
    │               │       │               │       │               │
    │ ▸ QR scanning │       │ ▸ Savings ops │       │ ▸ View own    │
    │ ▸ Manual      │       │ ▸ Withdrawals │       │   dashboard   │
    │   attendance  │       │ ▸ Liquidations│       │ ▸ View own    │
    │ ▸ View active │       │ ▸ Financial   │       │   transactions│
    │   assembly    │       │   reports     │       │ ▸ Request     │
    │               │       │               │       │   withdrawals │
    └───────────────┘       └───────────────┘       └───────────────┘
```

### Permission Matrix

| Permission | Administrator | Manager | Registrar | Member |
|:-----------|:-------------:|:-------:|:---------:|:------:|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ❌ | ❌ | ❌ |
| Manage Assemblies | ✅ | ❌ | ❌ | ❌ |
| Scan Attendance | ✅ | ❌ | ✅ | ❌ |
| View All Data | ✅ | ❌ | ❌ | ❌ |
| Manage Savings | ✅ | ✅ | ❌ | ❌ |
| Approve Withdrawals | ✅ | ✅ | ❌ | ❌ |
| Execute Liquidations | ✅ | ✅ | ❌ | ❌ |
| Generate Reports | ✅ | ✅ | ❌ | ❌ |
| View Own Dashboard | ✅ | ✅ | ✅ | ✅ |
| Request Withdrawal | ❌ | ❌ | ❌ | ✅ |

---

## 🔒 Security Features

### Authentication & Authorization

- ✅ **Microsoft OAuth 2.0** - Enterprise-grade SSO
- ✅ **JWT Tokens** - Stateless authentication with 24h expiration
- ✅ **Role-Based Access Control (RBAC)** - Granular permissions
- ✅ **Session Management** - Secure session storage

### Data Protection

- ✅ **SQL Injection Prevention** - Parameterized queries throughout
- ✅ **XSS Protection** - React auto-escaping + Helmet.js
- ✅ **CORS Configuration** - Strict origin validation
- ✅ **Input Validation** - Joi schema validation on all endpoints

### Infrastructure

- ✅ **HTTPS Only** - TLS encryption in production
- ✅ **Secure Headers** - Helmet.js middleware
- ✅ **Environment Variables** - Secrets never in code

---

## 🤝 Contributing

### Branch Naming Convention

```
feature/module-name     # New features
fix/bug-description     # Bug fixes
docs/update-section     # Documentation
refactor/component      # Code refactoring
```

### Commit Message Format

```
type(scope): description

feat(members): add QR code batch generation
fix(auth): resolve token expiration issue
docs(api): update endpoint documentation
refactor(savings): improve calculation logic
```

### Code Style

- **Backend**: ESLint configuration
- **Frontend**: ESLint + React Hooks rules
- **SQL**: Lowercase keywords, snake_case naming

---

## 📄 License

This project was developed as a **Final Graduation Project** for obtaining the Bachelor's Degree in Software Engineering at **Universidad Técnica Nacional, San Carlos Campus**.

**Author:** Kimberly Stacy Corrales Vega
**Period:** September - December 2025

---

<p align="center">
  <sub>Built with ❤️ for CoopLink CR student cooperative</sub>
</p>
