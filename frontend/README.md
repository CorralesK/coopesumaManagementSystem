# CoopeSuma Frontend - React + Vite + Tailwind CSS

Frontend application for the CoopeSuma Management System (Phase 1 - Attendance Control).

---

## 🚀 Tech Stack

- **React 18+** - UI Library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **PropTypes** - Runtime type checking for React props

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

### Build

```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Linting

```bash
npm run lint         # Run ESLint
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

**Frontend Setup**: ✅ **COMPLETED**

- [x] Vite project created
- [x] React configured
- [x] Tailwind CSS installed and configured
- [x] Project structure created
- [x] Base utilities created (API client, constants)
- [x] Environment variables configured

**Next Steps**:

1. Implement AuthContext and authentication flow
2. Create LoginPage component
3. Implement protected routes
4. Build components for each module (in order)

---

## 👤 Developer

**Student**: Kimberly Stacy Corrales Vega
**Institution**: Universidad Técnica Nacional - Sede San Carlos
**Project**: Práctica Profesional Supervisada
**Period**: September - December 2025

---

**Frontend initialized and ready for development** 🚀
