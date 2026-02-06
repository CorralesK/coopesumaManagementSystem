<p align="center">
  <img src="https://img.shields.io/badge/Document-Installation_Guide-blue?style=for-the-badge" alt="Installation Guide" />
  <img src="https://img.shields.io/badge/Difficulty-Intermediate-yellow?style=for-the-badge" alt="Difficulty" />
  <img src="https://img.shields.io/badge/Time-30_minutes-green?style=for-the-badge" alt="Time" />
</p>

# 🛠️ Installation Guide

> Complete step-by-step guide for setting up the CoopLink CR Management System development environment.

---

## 📑 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Step 1: Clone Repository](#step-1-clone-repository)
- [Step 2: Database Setup](#step-2-database-setup)
- [Step 3: Backend Setup](#step-3-backend-setup)
- [Step 4: Frontend Setup](#step-4-frontend-setup)
- [Step 5: Microsoft OAuth Setup](#step-5-microsoft-oauth-setup)
- [Step 6: Cloudinary Setup](#step-6-cloudinary-setup)
- [Step 7: First User Creation](#step-7-first-user-creation)
- [Verification Checklist](#verification-checklist)
- [Development Scripts](#development-scripts)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Check Command |
|----------|-----------------|-------------|---------------|
| **Node.js** | 18.0.0 | 20.x LTS | `node --version` |
| **npm** | 9.0.0 | 10.x | `npm --version` |
| **PostgreSQL** | 14.0 | 16.x | `psql --version` |
| **Git** | 2.0 | Latest | `git --version` |

### Optional Software

| Software | Purpose | Installation |
|----------|---------|--------------|
| **pgAdmin** | Database GUI management | [pgAdmin Download](https://www.pgadmin.org/download/) |
| **VS Code** | Recommended IDE | [VS Code Download](https://code.visualstudio.com/) |
| **Postman** | API testing | [Postman Download](https://www.postman.com/downloads/) |

### System Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MINIMUM SYSTEM REQUIREMENTS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  CPU:     Dual-core processor                                                │
│  RAM:     4 GB (8 GB recommended)                                            │
│  Storage: 2 GB free space                                                    │
│  OS:      Windows 10+, macOS 10.15+, or Ubuntu 20.04+                       │
│  Network: Internet connection for OAuth and dependencies                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Verify Prerequisites

Run these commands to verify your environment:

```bash
# Check Node.js
node --version
# Expected: v18.0.0 or higher

# Check npm
npm --version
# Expected: 9.0.0 or higher

# Check PostgreSQL
psql --version
# Expected: psql (PostgreSQL) 14.0 or higher

# Check Git
git --version
# Expected: git version 2.0 or higher
```

---

## Quick Start

For experienced developers, here's the condensed setup:

```bash
# 1. Clone and enter directory
git clone https://github.com/cooplinkcr/cooplinkcr.git
cd coopesumaManagementSystem

# 2. Database setup
createdb -U postgres cooplinkcr
cd database/scripts
psql -U postgres -d cooplinkcr -f 01_create_functions.sql
psql -U postgres -d cooplinkcr -f 02_create_tables.sql
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql

# 3. Backend setup
cd ../../backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev

# 4. Frontend setup (new terminal)
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev

# 5. Open http://localhost:5173
```

For detailed instructions, continue reading below.

---

## Step 1: Clone Repository

### 1.1 Clone the Project

```bash
# HTTPS (recommended)
git clone https://github.com/cooplinkcr/cooplinkcr.git

# Or SSH (if configured)
git clone git@github.com:cooplinkcr/cooplinkcr.git

# Enter project directory
cd coopesumaManagementSystem
```

### 1.2 Project Structure Overview

After cloning, you'll see this structure:

```
coopesumaManagementSystem/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic layer
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── services/       # API service layer
│   ├── .env.example        # Environment template
│   └── package.json
│
├── database/               # Database scripts
│   └── scripts/            # SQL setup scripts
│
└── docs/                   # Documentation
```

---

## Step 2: Database Setup

### 2.1 Start PostgreSQL Service

**Windows:**
```powershell
# Using Services
net start postgresql-x64-16

# Or using pg_ctl
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start
```

**macOS:**
```bash
# Using Homebrew
brew services start postgresql@16

# Or using pg_ctl
pg_ctl -D /usr/local/var/postgresql@16 start
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Auto-start on boot
```

### 2.2 Create Database

**Option A: Using psql**
```bash
# Connect as postgres user
psql -U postgres

# In PostgreSQL prompt
CREATE DATABASE cooplinkcr;

# Verify creation
\l

# Exit
\q
```

**Option B: Using createdb**
```bash
createdb -U postgres cooplinkcr
```

**Option C: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases"
3. Create → Database
4. Name: `cooplinkcr`
5. Save

### 2.3 Execute SQL Scripts

Run the scripts in the correct order:

```bash
# Navigate to scripts directory
cd database/scripts

# 1. Create helper functions
psql -U postgres -d cooplinkcr -f 01_create_functions.sql

# 2. Create tables (depends on functions)
psql -U postgres -d cooplinkcr -f 02_create_tables.sql

# 3. Create indexes (depends on tables)
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql

# 4. Create triggers (depends on tables and functions)
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql
```

**Execution Order Diagram:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SETUP ORDER                                  │
└─────────────────────────────────────────────────────────────────────────────┘

   01_create_functions.sql
            │
            │  Functions used by triggers and tables
            ▼
   02_create_tables.sql
            │
            │  Tables reference functions (defaults)
            ▼
   03_create_indexes.sql
            │
            │  Indexes created on existing tables
            ▼
   04_create_triggers.sql
            │
            │  Triggers use functions and tables
            ▼
        ✓ COMPLETE
```

### 2.4 Verify Database Installation

```bash
# Connect to database
psql -U postgres -d cooplinkcr

# List all tables
\dt

# Expected output:
#               List of relations
#  Schema |         Name          | Type  |  Owner
# --------+-----------------------+-------+----------
#  public | account_types         | table | postgres
#  public | accounts              | table | postgres
#  public | assemblies            | table | postgres
#  public | attendance_records    | table | postgres
#  public | contribution_periods  | table | postgres
#  public | cooperatives          | table | postgres
#  public | liquidations          | table | postgres
#  public | member_levels         | table | postgres
#  public | member_qualities      | table | postgres
#  public | members               | table | postgres
#  public | notifications         | table | postgres
#  public | receipts              | table | postgres
#  public | schools               | table | postgres
#  public | surplus_distributions | table | postgres
#  public | transactions          | table | postgres
#  public | users                 | table | postgres
#  public | withdrawal_requests   | table | postgres
# (17 rows)

# List functions
\df

# List triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers;

# Exit
\q
```

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install all required packages defined in `package.json`.

### 3.3 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# ═══════════════════════════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
NODE_ENV=development
PORT=5000

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cooplinkcr

# ═══════════════════════════════════════════════════════════════════════════
# JWT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Generate a strong secret: openssl rand -base64 64
JWT_SECRET=your-super-secret-key-here-minimum-32-characters-recommended-64
JWT_EXPIRES_IN=24h

# ═══════════════════════════════════════════════════════════════════════════
# CORS CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
CORS_ORIGIN=http://localhost:5173

# ═══════════════════════════════════════════════════════════════════════════
# MICROSOFT OAUTH CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Get these from Azure Portal (see Step 5)
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/callback

# ═══════════════════════════════════════════════════════════════════════════
# FRONTEND URL (for OAuth redirects)
# ═══════════════════════════════════════════════════════════════════════════
FRONTEND_URL=http://localhost:5173

# ═══════════════════════════════════════════════════════════════════════════
# CLOUDINARY CONFIGURATION (for image uploads)
# ═══════════════════════════════════════════════════════════════════════════
# Get these from Cloudinary Dashboard (see Step 6)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ═══════════════════════════════════════════════════════════════════════════
# WEB PUSH CONFIGURATION (optional)
# ═══════════════════════════════════════════════════════════════════════════
# Generate using: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@example.com
```

### 3.4 Generate JWT Secret

**Linux/macOS:**
```bash
openssl rand -base64 64
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 3.5 Start Backend Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 3.6 Verify Backend

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## Step 4: Frontend Setup

### 4.1 Open New Terminal

Keep the backend running and open a new terminal window.

### 4.2 Navigate to Frontend

```bash
cd frontend
```

### 4.3 Install Dependencies

```bash
npm install
```

### 4.4 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env`:

```env
# ═══════════════════════════════════════════════════════════════════════════
# API CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
VITE_API_URL=http://localhost:5000/api

# ═══════════════════════════════════════════════════════════════════════════
# APPLICATION CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
VITE_APP_NAME=CoopLink CR
```

### 4.5 Start Frontend Server

```bash
npm run dev
```

### 4.6 Verify Frontend

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the login page.

---

## Step 5: Microsoft OAuth Setup

### 5.1 Access Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account

### 5.2 Register Application

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     AZURE AD APP REGISTRATION                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Azure Portal
         │
         ▼
┌─────────────────┐
│ Azure Active    │
│ Directory       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ App             │
│ registrations   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ + New           │
│   registration  │
└────────┬────────┘
         │
         ▼
    Fill Form
```

**Registration Form:**

| Field | Value |
|-------|-------|
| **Name** | CoopLink CR Management System |
| **Supported account types** | Accounts in any organizational directory and personal Microsoft accounts |
| **Redirect URI (Web)** | `http://localhost:5000/api/auth/callback` |

Click **Register**.

### 5.3 Get Application IDs

After registration, note these values from the **Overview** page:

| Value | Location | Use In |
|-------|----------|--------|
| **Application (client) ID** | Overview → Application (client) ID | `MICROSOFT_CLIENT_ID` |
| **Directory (tenant) ID** | Overview → Directory (tenant) ID | Usually `common` for multi-tenant |

### 5.4 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **+ New client secret**
3. Add description: `CoopLink CR Development`
4. Select expiration: `24 months`
5. Click **Add**
6. **IMPORTANT:** Copy the **Value** immediately (shown only once)
7. Use this value for `MICROSOFT_CLIENT_SECRET`

### 5.5 Configure API Permissions

1. Go to **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

### 5.6 Update Backend Environment

Update your backend `.env` file:

```env
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=your_secret_value_here
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

---

## Step 6: Cloudinary Setup

Cloudinary is used for storing member photos. This step is **optional** but recommended.

### 6.1 Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Click **Sign Up Free**
3. Complete registration

### 6.2 Get API Credentials

1. Go to **Dashboard**
2. Find the **Account Details** section
3. Copy these values:

| Dashboard Value | Environment Variable |
|-----------------|---------------------|
| Cloud Name | `CLOUDINARY_CLOUD_NAME` |
| API Key | `CLOUDINARY_API_KEY` |
| API Secret | `CLOUDINARY_API_SECRET` |

### 6.3 Update Backend Environment

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here
```

### 6.4 Configure Upload Preset (Optional)

For additional security, create an upload preset:

1. Go to **Settings** → **Upload**
2. Click **Add upload preset**
3. Configure:
   - **Name**: `coopesuma_members`
   - **Signing Mode**: `Signed`
   - **Folder**: `members`

---

## Step 7: First User Creation

Since the system uses Microsoft OAuth, you must manually create the first administrator user.

### 7.1 Connect to Database

```bash
psql -U postgres -d cooplinkcr
```

### 7.2 Create Initial Data

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Create School
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO schools (name)
VALUES ('My School Name');

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Create Cooperative
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO cooperatives (school_id, trade_name, legal_name)
VALUES (
    1,                                    -- school_id (from step 1)
    'CoopLink CR',                          -- trade_name (display name)
    'Cooperativa Estudiantil CoopLink CR'   -- legal_name (full legal name)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Create Administrator User
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO users (
    cooperative_id,
    full_name,
    email,
    role,
    is_active
) VALUES (
    1,                          -- cooperative_id (from step 2)
    'Administrator Name',       -- full_name
    'your-microsoft@email.com', -- email (MUST match Microsoft account)
    'administrator',            -- role (administrator/manager/registrar)
    true                        -- is_active
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY CREATION
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
    u.user_id,
    u.full_name,
    u.email,
    u.role,
    c.trade_name as cooperative,
    s.name as school
FROM users u
JOIN cooperatives c ON u.cooperative_id = c.cooperative_id
JOIN schools s ON c.school_id = s.school_id;
```

### 7.3 Exit Database

```sql
\q
```

---

## Verification Checklist

Use this checklist to verify your installation:

### Database

- [ ] PostgreSQL service is running
- [ ] Database `cooplinkcr` exists
- [ ] All 17 tables created
- [ ] Functions created
- [ ] Triggers created
- [ ] Indexes created
- [ ] Initial school created
- [ ] Initial cooperative created
- [ ] Administrator user created

### Backend

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file configured
- [ ] `DATABASE_URL` is correct
- [ ] `JWT_SECRET` is set (32+ characters)
- [ ] `MICROSOFT_CLIENT_ID` is set
- [ ] `MICROSOFT_CLIENT_SECRET` is set
- [ ] Server starts without errors
- [ ] Health check returns `{"status":"OK"}`

### Frontend

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file configured
- [ ] `VITE_API_URL` points to backend
- [ ] Server starts without errors
- [ ] Login page loads at `http://localhost:5173`

### Authentication

- [ ] Azure AD app registered
- [ ] Redirect URI configured correctly
- [ ] API permissions granted
- [ ] Can initiate Microsoft login
- [ ] OAuth callback works
- [ ] JWT token received after login

### Optional Services

- [ ] Cloudinary account created (for photos)
- [ ] Cloudinary credentials configured
- [ ] VAPID keys generated (for push notifications)

---

## Development Scripts

### Backend Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix
```

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Type check (if using TypeScript)
npm run type-check
```

### Database Scripts

```bash
# Connect to database
psql -U postgres -d cooplinkcr

# Run a SQL file
psql -U postgres -d cooplinkcr -f script.sql

# Backup database
pg_dump -U postgres cooplinkcr > backup.sql

# Restore database
psql -U postgres -d cooplinkcr < backup.sql
```

---

## Troubleshooting

### Database Issues

#### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** Start PostgreSQL service

```bash
# Windows
net start postgresql-x64-16

# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql
```

#### Authentication Failed

```
Error: password authentication failed for user "postgres"
```

**Solution:** Check your password in `DATABASE_URL` or reset PostgreSQL password:

```bash
# Linux/macOS
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'newpassword';"

# Windows
psql -U postgres -c "ALTER USER postgres PASSWORD 'newpassword';"
```

#### Database Does Not Exist

```
Error: database "cooplinkcr" does not exist
```

**Solution:** Create the database:

```bash
createdb -U postgres cooplinkcr
```

---

### Backend Issues

#### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Kill the process or change port

```bash
# Find process (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Find process (Linux/macOS)
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

#### JWT Secret Error

```
Error: secretOrPrivateKey must have a value
```

**Solution:** Set `JWT_SECRET` in `.env` (minimum 32 characters)

#### Module Not Found

```
Error: Cannot find module 'express'
```

**Solution:** Install dependencies

```bash
cd backend
rm -rf node_modules
npm install
```

---

### Frontend Issues

#### API Connection Failed

```
Error: Network Error / CORS Error
```

**Solutions:**

1. Verify backend is running on port 5000
2. Check `VITE_API_URL` in frontend `.env`
3. Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

#### Blank Page After Build

**Solution:** Check browser console for errors and verify:

1. `VITE_API_URL` doesn't have trailing slash
2. All environment variables are set

---

### OAuth Issues

#### Redirect URI Mismatch

```
AADSTS50011: The reply URL specified in the request does not match
```

**Solution:**

1. Go to Azure Portal → App registrations → Your app
2. Authentication → Add redirect URI
3. Add: `http://localhost:5000/api/auth/callback`
4. Save

#### User Not Found After Login

**Solution:** Ensure the email in the `users` table matches your Microsoft account email exactly (case-insensitive but must be valid).

#### Invalid Client Secret

```
AADSTS7000215: Invalid client secret provided
```

**Solution:**

1. Go to Azure Portal → Certificates & secrets
2. Create new client secret
3. Update `MICROSOFT_CLIENT_SECRET` in backend `.env`
4. Restart backend

---

## Next Steps

After successful installation:

### 1. Create Additional Users

Login as administrator and go to **Settings → Users** to add:
- Managers (financial operations)
- Registrars (attendance, member registration)

### 2. Configure Cooperative Settings

Set up your cooperative details in **Settings**.

### 3. Register Members

Start registering cooperative members in the **Members** section.

### 4. Create Your First Assembly

Create an assembly in **Assemblies** to start tracking attendance.

### 5. Explore Documentation

| Document | Purpose |
|----------|---------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | Understand system design |
| [02-DATA-MODEL.md](./02-DATA-MODEL.md) | Database reference |
| [03-API-REST.md](./03-API-REST.md) | API documentation |
| [04-FRONTEND.md](./04-FRONTEND.md) | Frontend components |
| [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) | Auth implementation |
| [06-BUSINESS-FLOWS.md](./06-BUSINESS-FLOWS.md) | Business processes |
| [08-DEPLOYMENT.md](./08-DEPLOYMENT.md) | Production deployment |

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs (`npm run dev` output)
3. Check GitHub Issues for similar problems
4. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

<p align="center">
  <sub>Last updated: 2025</sub>
</p>
