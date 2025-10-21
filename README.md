# CoopeSuma Management System

Student Cooperative Attendance Control and Management System

---

## Project Information

**Name**: ATTENDANCE CONTROL AND STUDENT COOPERATIVE MANAGEMENT SYSTEM - COOPESUMA

**Academic Context**: Final Graduation Project to obtain the Bachelor's Degree in Software Engineering

**University**: Universidad Técnica Nacional, San Carlos Campus

**Student**: Kimberly Stacy Corrales Vega

**Period**: September - December 2025

---

## Description

CoopeSuma is an elementary school student cooperative backed by the financial entity Coocique. This system digitalizes and modernizes the cooperative's main processes, including:

1. **Attendance Control** (Phase 1): Quick registration via QR codes at monthly assemblies
2. **Savings Management** (Phase 2): Administration of deposits, withdrawals and balance inquiries
3. **Voting System** (Phase 3 - Optional): Internal electronic voting

---

## Technologies

### Frontend
- React.js 19+ with Vite 7
- React Router DOM 7
- Tailwind CSS 4
- Axios for HTTP communication
- PropTypes for validation

### Backend
- Node.js 18+ with Express
- PostgreSQL 14+
- JWT for authentication
- Microsoft OAuth 2.0 for user authentication
- Joi for validation
- Helmet for security

### Tools
- Git / GitHub
- jsPDF / SheetJS for reports
- Render / Railway for deployment

---

## Project Structure

```
coopesumaManagementSystem/
├── frontend/           # React PWA Application
├── backend/            # REST API with Node.js
├── database/           # SQL Scripts
├── .gitignore
└── README.md
```

---

## Initial Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# Git
git --version
```

### Clone Repository

```bash
git clone <https://github.com/cooplinkcr/cooplinkcr.git>
cd coopesumaManagementSystem
```

### Setup Database

```bash
# 1. Create database
createdb coopesuma_db

# 2. Execute scripts in order
cd database/scripts/phase_1
psql -d coopesuma_db -f 01_create_functions.sql
psql -d coopesuma_db -f 02_create_tables.sql
psql -d coopesuma_db -f 03_create_indexes.sql
psql -d coopesuma_db -f 04_create_triggers.sql
psql -d coopesuma_db -f 05_seed_initial_data.sql
```

### Setup Backend

```bash
cd backend
npm install

# Copy configuration file
cp .env.example .env

# Edit .env with your values
nano .env
```

### Setup Frontend

```bash
cd frontend
npm install

# Copy configuration file
cp .env.example .env

# Edit .env with your values
nano .env
```

---

## Development Execution

### Backend
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# Application running on http://localhost:5173
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/coopesuma_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CoopeSuma
```

---

## Roles and Permissions

| Functionality | Administrator | Registrar | Treasurer |
|---------------|---------------|-----------|-----------|
| Start/close assembly | ✅ | ❌ | ❌ |
| Scan QR | ✅ | ✅ | ❌ |
| Manage members | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Generate reports | ✅ | ❌ | ❌ |
| Manage savings | ✅ | ❌ | ✅ |

---

## Development Phases

### Phase 1: Attendance Control (Weeks 1-10)
- ✅ Database (PostgreSQL with complete schema)
- ✅ Authentication (Microsoft OAuth 2.0)
- ✅ User management (CRUD + role-based access)
- ✅ Member management (CRUD + QR codes)
- ✅ Assembly management (CRUD + activation/deactivation)
- ✅ Attendance registration (QR scanner + manual)
- ✅ Real-time attendance list
- ✅ Attendance reports (printable PDF)
- ✅ Public member verification page

### Phase 2: Savings Management (Weeks 11-14)
- ⏳ Savings transactions
- ⏳ Balance inquiry
- ⏳ Savings reports
- ⏳ Excel data migration

### Phase 3: Voting (Optional - Future)
- ⏳ Voting system
- ⏳ Proposal management
- ⏳ Real-time results

---

## Available Scripts

### Backend
```bash
npm start        # Production
npm run dev      # Development with nodemon
npm test         # Run tests
npm run lint     # Check code
```

### Frontend
```bash
npm run dev      # Development
npm run build    # Build for production
npm run preview  # Preview build
npm test         # Run tests
npm run lint     # Check code
```

---

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## Deployment

### Preparation
1. Complete production environment variables
2. Run frontend build: `npm run build`
3. Setup database on Railway/Render
4. Execute SQL scripts on production database

### Railway / Render
Configure the production environment variables and deploy both frontend and backend services.

---

## Contribution

### Git Workflow

1. Create feature branch
```bash
git checkout -b feature/module-name
```

2. Make descriptive commits
```bash
git commit -m "feat(members): add QR generation"
```

3. Push and create Pull Request
```bash
git push origin feature/module-name
```

### Commit Conventions

```
feat(scope): description     # New feature
fix(scope): description      # Bug fix
docs(scope): description     # Documentation changes
refactor(scope): description # Refactoring
test(scope): description     # Add tests
```

---

## Authentication

The system uses **Microsoft OAuth 2.0** exclusively for user authentication. There is no traditional username/password login.

### How Authentication Works

1. Users must be registered in the `users` table in the database by an administrator
2. When a user attempts to login via Microsoft OAuth:
   - The system verifies their Microsoft account
   - Checks if the user exists in the database (by Microsoft ID or email)
   - If the user exists and is active, they are granted access
   - If the user doesn't exist, access is denied

### Adding New Users

Only administrators can create new users through:
- The user management interface in the frontend
- The API endpoint: `POST /api/users`

Required fields when creating a user:
- Full name
- Username
- Email
- Microsoft ID (obtained from their Microsoft account)
- Role (administrator, registrar, or treasurer)

---

## Security Features

### SQL Injection Protection
- ✅ Parameterized queries throughout the system
- ✅ No string concatenation in SQL statements
- ✅ PostgreSQL native escaping

### Input Validation
- ✅ Backend validation with Joi schemas
- ✅ Frontend validation on all forms
- ✅ Length limits and format validation
- ✅ Role-based access control

### XSS Protection
- ✅ React automatic escaping
- ✅ No use of dangerouslySetInnerHTML
- ✅ No eval() usage

### HTTP Security
- ✅ Helmet.js middleware
- ✅ CORS configuration
- ✅ JWT token authentication
- ✅ Microsoft OAuth 2.0 authentication

---

## License

This project is developed as a Final Graduation Project for Universidad Técnica Nacional.

---

## Project Status

**Last updated**: October 2025

**Current phase**: Phase 1 - Attendance Control (COMPLETED ✅)

**Progress**: 95% Phase 1 Complete

**Completed Modules**:
- ✅ Database schema and migrations
- ✅ Authentication (Microsoft OAuth 2.0)
- ✅ User management with role-based access
- ✅ Member management with QR code generation
- ✅ Assembly management with activation control
- ✅ Attendance recording (QR scan + manual)
- ✅ Real-time attendance tracking
- ✅ Printable attendance reports
- ✅ Public member verification
- ✅ Security implementation (SQL injection, XSS, CORS)

**Next Steps**: Phase 2 - Savings Management

---

## Setup Checklist

To verify everything is configured correctly:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Database `coopesuma_db` created
- [ ] SQL scripts executed successfully
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Admin user can login
- [ ] Documentation read and understood

---

## User Interface Features

### Alerts System
- ✅ Auto-close success messages (5 seconds)
- ✅ Auto-close error messages (5 seconds)
- ✅ Manual close option for all alerts
- ✅ Customizable duration

### Form Validation
- ✅ Real-time validation
- ✅ Clear error messages in Spanish
- ✅ Length limits enforced
- ✅ Email format validation

### User Management
- ✅ CRUD operations for users
- ✅ Role-based access control
- ✅ Activate/Deactivate users
- ✅ Paginated user list
- ✅ Search and filter functionality
