# CoopeSuma Frontend - React + Vite + Tailwind CSS

Frontend application for the Coopesuma Management System (Phase 1 - Attendance Control).

---

## 🚀 Tech Stack

- **React 19.1** - UI Library with latest features
- **Vite 7.1** - Next-generation build tool and dev server
- **Tailwind CSS 4.1** - Utility-first CSS framework (v4 syntax)
- **React Router DOM 7.9** - Client-side routing with data APIs
- **Axios 1.12** - HTTP client for API communication
- **PropTypes 15.8** - Runtime type checking for React props

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Shared components (Button, Modal, etc.)
│   │   ├── auth/          # Authentication components
│   │   ├── members/       # Member management components
│   │   ├── assemblies/    # Assembly management components
│   │   ├── attendance/    # Attendance recording components
│   │   ├── users/         # User management components
│   │   └── reports/       # Reports components
│   ├── pages/             # Page components (routes)
│   ├── services/          # API service modules
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions and constants
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles (Tailwind directives)
├── .env                   # Environment variables
├── .env.example           # Environment variables template
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies and scripts
```

---

## ⚙️ Installation

### Prerequisites

- Node.js 18+ and npm installed
- Backend API running on `http://localhost:5000`

### Steps

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Environment variables are already configured in `.env`

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

---

## 📜 Available Scripts

### Development

```bash
npm run dev          # Start development server with hot reload
```
---

## 🔐 Authentication Flow

The application uses **Microsoft OAuth 2.0** for authentication:

1. User clicks "Login with Microsoft" button
2. Frontend redirects to backend: `GET /api/auth/microsoft`
3. Backend redirects to Microsoft login page
4. User authenticates with Microsoft
5. Microsoft redirects to backend callback: `GET /api/auth/callback?code=...`
6. Backend validates, generates JWT, and redirects to: `/auth/success?token=<jwt>`
7. Frontend stores token in React state/context (NOT localStorage)
8. User is authenticated and can access protected routes

---

## 🚧 Current Status

**Phase 1 - Attendance Control**: 🔄 **IN PROGRESS** (40% Complete)

### ✅ Completed

**Setup & Configuration**
- [x] Vite 7 + React 19 project created
- [x] Tailwind CSS 4 configured with v4 syntax
- [x] React Router DOM 7 configured
- [x] Project structure created
- [x] API client with Axios configured
- [x] Environment variables configured

**Authentication System**
- [x] AuthContext implemented
- [x] Microsoft OAuth 2.0 integration
- [x] LoginPage with responsive design
- [x] AuthCallbackPage with error handling
- [x] Protected routes with role-based access control

**Common Components** (9 components)
- [x] Button (7 variants, 3 sizes)
- [x] Input (with validation & errors)
- [x] Select (dropdown with validation)
- [x] Modal (with ESC & overlay close)
- [x] Card (with header, footer, padding options)
- [x] Alert (4 types: success, error, warning, info)
- [x] Loading (with fullScreen option)
- [x] Table (with custom render functions)
- [x] Pagination (with ellipsis)

**Layout & Navigation**
- [x] Layout component with sidebar
- [x] Role-based navigation menu
- [x] DashboardPage with statistics
- [x] UnauthorizedPage
- [x] NotFoundPage

**Members Module** (COMPLETE)
- [x] MembersListPage - List with filters, search, pagination
- [x] MemberFormPage - Create/edit with validation
- [x] MemberDetailPage - Detail with QR code management
- [x] QR code display, download, print, regenerate

### 🔄 In Progress / Pending

**Assemblies Module**
- [ ] AssembliesListPage - List with filters
- [ ] AssemblyFormPage - Create/edit assembly
- [ ] Activate/deactivate assembly functionality

**Attendance Module**
- [ ] AttendanceScanPage - QR scanner integration
- [ ] Visual verification modal
- [ ] Manual registration fallback
- [ ] Duplicate prevention

**Users Module**
- [ ] UsersListPage - User management
- [ ] UserFormPage - Create/edit users
- [ ] Role assignment

**Reports Module**
- [ ] ReportsPage - PDF generation
- [ ] Signature spaces for physical signatures
- [ ] Statistics by grade/section/method

---

## 👤 Developer

**Student**: Kimberly Stacy Corrales Vega
**Institution**: Universidad Técnica Nacional - Sede San Carlos
**Project**: Práctica Profesional Supervisada
**Period**: September - December 2025

---

**Frontend initialized and ready for development** 🚀
