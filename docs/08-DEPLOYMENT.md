<p align="center">
  <img src="https://img.shields.io/badge/Document-Deployment_Guide-blue?style=for-the-badge" alt="Deployment Guide" />
  <img src="https://img.shields.io/badge/Environment-Production-red?style=for-the-badge" alt="Production" />
  <img src="https://img.shields.io/badge/Platforms-Railway_|_Render-green?style=for-the-badge" alt="Platforms" />
</p>

# 🚀 Deployment Guide

> Complete guide for deploying CoopLink CR Management System to production environments using Railway, Render, or other cloud platforms.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Production Architecture](#production-architecture)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Option 1: Railway Deployment](#option-1-railway-deployment)
- [Option 2: Render Deployment](#option-2-render-deployment)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Microsoft OAuth Production Setup](#microsoft-oauth-production-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Domain Configuration](#domain-configuration)
- [Database Migrations](#database-migrations)
- [Backup Strategy](#backup-strategy)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Security Checklist](#security-checklist)
- [CI/CD Pipeline](#cicd-pipeline)
- [Rollback Procedures](#rollback-procedures)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers deploying the CoopLink CR Management System to production. The recommended platforms are:

| Platform | Best For | Pricing |
|----------|----------|---------|
| **Railway** | Full-stack apps with database | Free tier available, $5/month hobby |
| **Render** | Static sites + APIs | Free tier available |
| **Vercel** | Frontend only | Free tier available |
| **Netlify** | Frontend only | Free tier available |

### Deployment Components

| Component | Recommended Platform | Alternative |
|-----------|---------------------|-------------|
| **Backend API** | Railway / Render | Heroku, DigitalOcean |
| **Frontend** | Vercel / Netlify | Railway, Render |
| **Database** | Railway PostgreSQL | Supabase, Neon |
| **Images** | Cloudinary | AWS S3 |
| **DNS/CDN** | Cloudflare | AWS CloudFront |

---

## Production Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

                         INTERNET
                             │
                             ▼
                    ┌─────────────────┐
                    │   Cloudflare    │ ◄── DNS, CDN, DDoS Protection
                    │   (Optional)    │
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │    Frontend     │               │     Backend     │
   │                 │               │                 │
   │  ┌───────────┐  │               │  ┌───────────┐  │
   │  │  Vercel   │  │   HTTPS API   │  │  Railway  │  │
   │  │  Netlify  │  │ ─────────────>│  │  Render   │  │
   │  └───────────┘  │               │  └───────────┘  │
   │                 │               │                 │
   │  React + Vite   │               │  Express.js     │
   │  Static Files   │               │  Node.js        │
   └─────────────────┘               └────────┬────────┘
                                              │
                              ┌───────────────┴───────────────┐
                              │                               │
                              ▼                               ▼
                     ┌─────────────────┐             ┌─────────────────┐
                     │   PostgreSQL    │             │   Cloudinary    │
                     │                 │             │                 │
                     │  Railway DB     │             │  Image Storage  │
                     │  Supabase       │             │  CDN            │
                     │  Neon           │             │                 │
                     └─────────────────┘             └─────────────────┘

                              │
                              ▼
                     ┌─────────────────┐
                     │  Microsoft      │
                     │  Azure AD       │ ◄── OAuth Provider
                     │                 │
                     └─────────────────┘
```

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Preparation

- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Environment variables externalized (no hardcoded secrets)
- [ ] Error handling implemented
- [ ] Input validation on all endpoints
- [ ] CORS configured for production domains

### Security

- [ ] Strong JWT secret generated (64+ characters)
- [ ] HTTPS enforced
- [ ] Helmet.js middleware enabled
- [ ] Rate limiting configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention

### Configuration

- [ ] Production database created
- [ ] Azure AD app configured for production URLs
- [ ] Cloudinary account ready
- [ ] Domain names purchased/configured

---

## Option 1: Railway Deployment

Railway provides an easy way to deploy full-stack applications with integrated PostgreSQL.

### 1.1 Create Railway Account

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 1.2 Deploy PostgreSQL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RAILWAY DATABASE SETUP                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Railway Dashboard
           │
           ▼
    ┌─────────────┐
    │ New Project │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ + New       │
    │ Service     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Database    │
    │ PostgreSQL  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │ Copy DATABASE_URL from Variables tab    │
    │ postgresql://user:pass@host:port/db     │
    └─────────────────────────────────────────┘
```

1. In your Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Wait for provisioning
4. Go to **Variables** tab
5. Copy `DATABASE_URL`

### 1.3 Initialize Database

Connect to Railway PostgreSQL and run setup scripts:

```bash
# Option A: Using Railway CLI
npm install -g @railway/cli
railway login
railway connect postgres

# Option B: Using psql with connection string
psql "postgresql://user:pass@host:port/railway"

# Run scripts in order
\i database/scripts/01_create_functions.sql
\i database/scripts/02_create_tables.sql
\i database/scripts/03_create_indexes.sql
\i database/scripts/04_create_triggers.sql

# Create initial data (school, cooperative, admin user)
-- See Step 7 in Installation Guide
```

### 1.4 Deploy Backend

1. In Railway project, click **+ New** → **GitHub Repo**
2. Select your repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

4. Add environment variables (see [Environment Variables](#environment-variables))
5. Deploy

### 1.5 Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add environment variables:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=CoopLink CR
```

5. Deploy

---

## Option 2: Render Deployment

Render offers free tiers and easy deployment.

### 2.1 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub

### 2.2 Deploy PostgreSQL

1. Click **New** → **PostgreSQL**
2. Configure:

| Setting | Value |
|---------|-------|
| **Name** | coopesuma-db |
| **Database** | cooplinkcr |
| **User** | coopesuma |
| **Region** | Choose nearest |
| **Plan** | Free / Starter |

3. Copy **External Database URL**

### 2.3 Initialize Database

```bash
# Connect using External URL
psql "postgresql://user:pass@host/cooplinkcr"

# Run setup scripts
\i database/scripts/01_create_functions.sql
\i database/scripts/02_create_tables.sql
\i database/scripts/03_create_indexes.sql
\i database/scripts/04_create_triggers.sql
```

### 2.4 Deploy Backend

1. Click **New** → **Web Service**
2. Connect GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | coopesuma-api |
| **Root Directory** | `backend` |
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free / Starter |

4. Add environment variables
5. Deploy

### 2.5 Deploy Frontend

1. Click **New** → **Static Site**
2. Connect GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | coopesuma-app |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add environment variables
5. Deploy

---

## Database Configuration

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

### Production Database Settings

```sql
-- Recommended settings for production
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '768MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.7;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

### Connection Pooling

For high-traffic applications, consider using PgBouncer:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │────>│  PgBouncer  │────>│  PostgreSQL │
│   (Pool)    │     │  (Pooler)   │     │  (Database) │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Environment Variables

### Backend Production Variables

```env
# ═══════════════════════════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
NODE_ENV=production
PORT=5000

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Include ?sslmode=require for cloud databases
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# ═══════════════════════════════════════════════════════════════════════════
# JWT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Generate: openssl rand -base64 64
# MUST be at least 64 characters for production
JWT_SECRET=<64-character-random-string-unique-to-production>
JWT_EXPIRES_IN=24h

# ═══════════════════════════════════════════════════════════════════════════
# CORS CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Multiple origins separated by comma
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# ═══════════════════════════════════════════════════════════════════════════
# MICROSOFT OAUTH CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
# Use production app registration
MICROSOFT_CLIENT_ID=<production-azure-client-id>
MICROSOFT_CLIENT_SECRET=<production-azure-client-secret>
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=https://your-backend-domain.com/api/auth/callback

# ═══════════════════════════════════════════════════════════════════════════
# FRONTEND URL
# ═══════════════════════════════════════════════════════════════════════════
FRONTEND_URL=https://your-frontend-domain.com

# ═══════════════════════════════════════════════════════════════════════════
# CLOUDINARY CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# ═══════════════════════════════════════════════════════════════════════════
# WEB PUSH CONFIGURATION (optional)
# ═══════════════════════════════════════════════════════════════════════════
VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

### Frontend Production Variables

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=CoopLink CR
```

### Environment Variable Security

| Variable | Sensitivity | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | 🔴 Critical | Contains database credentials |
| `JWT_SECRET` | 🔴 Critical | Used to sign all tokens |
| `MICROSOFT_CLIENT_SECRET` | 🔴 Critical | OAuth secret |
| `CLOUDINARY_API_SECRET` | 🟡 High | Image upload access |
| `VAPID_PRIVATE_KEY` | 🟡 High | Push notification signing |
| `CORS_ORIGIN` | 🟢 Low | Public information |
| `NODE_ENV` | 🟢 Low | Environment flag |

---

## Microsoft OAuth Production Setup

### Update Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your application

### Add Production Redirect URIs

1. Go to **Authentication**
2. Add new redirect URI:
   ```
   https://your-backend-domain.com/api/auth/callback
   ```
3. Save

### Create Production Client Secret

1. Go to **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `CoopLink CR Production`
4. Expiration: `24 months`
5. Copy the **Value** immediately
6. Update `MICROSOFT_CLIENT_SECRET` in production environment

### Recommended: Separate App Registrations

For better security, use separate app registrations:

| Environment | App Registration | Redirect URI |
|-------------|------------------|--------------|
| Development | CoopLink CR Dev | `http://localhost:5000/api/auth/callback` |
| Staging | CoopLink CR Staging | `https://staging-api.example.com/api/auth/callback` |
| Production | CoopLink CR Prod | `https://api.example.com/api/auth/callback` |

---

## SSL/HTTPS Configuration

### Automatic SSL (Recommended)

Railway, Render, Vercel, and Netlify provide automatic SSL certificates.

**No configuration needed** - HTTPS is enabled by default.

### Force HTTPS in Backend

The backend already includes HTTPS enforcement via Helmet:

```javascript
// Already configured in src/app.js
app.use(helmet());
```

### Verify HTTPS

After deployment, verify:

1. All URLs use `https://`
2. `CORS_ORIGIN` uses `https://`
3. `MICROSOFT_REDIRECT_URI` uses `https://`
4. `FRONTEND_URL` uses `https://`

---

## Domain Configuration

### Custom Domain Setup

#### Vercel (Frontend)

1. Go to Project Settings → Domains
2. Add your domain: `app.yourdomain.com`
3. Configure DNS:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

#### Railway (Backend)

1. Go to Service Settings → Networking
2. Add custom domain: `api.yourdomain.com`
3. Configure DNS:

```
Type: CNAME
Name: api
Value: <your-service>.railway.app
```

### Recommended Domain Structure

| Subdomain | Service | Example |
|-----------|---------|---------|
| `app` | Frontend | `app.coopesuma.com` |
| `api` | Backend | `api.coopesuma.com` |
| `www` | Redirect to app | `www.coopesuma.com` → `app.coopesuma.com` |

### Cloudflare Setup (Optional)

For additional security and performance:

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Configure DNS records
4. Enable:
   - SSL/TLS: Full (strict)
   - Always Use HTTPS: On
   - Automatic HTTPS Rewrites: On
   - Brotli: On
   - Minify: HTML, CSS, JS

---

## Database Migrations

### Migration Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MIGRATION WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Development                    Staging                     Production
         │                            │                             │
         ▼                            ▼                             ▼
   ┌───────────┐               ┌───────────┐                 ┌───────────┐
   │  Create   │               │   Test    │                 │  Deploy   │
   │ Migration │──────────────>│ Migration │────────────────>│ Migration │
   │           │               │           │                 │           │
   └───────────┘               └───────────┘                 └───────────┘
```

### Creating Migrations

Create migration files in `database/migrations/`:

```sql
-- migrations/001_add_member_phone.sql
-- Description: Add phone number field to members table
-- Date: 2025-01-20
-- Author: developer@example.com

BEGIN;

-- Add column
ALTER TABLE members
ADD COLUMN phone_number VARCHAR(20);

-- Add index if frequently queried
CREATE INDEX idx_members_phone ON members(phone_number);

COMMIT;
```

### Running Migrations

```bash
# Connect to production database
psql $DATABASE_URL

# Run migration in transaction
\i migrations/001_add_member_phone.sql

# Verify
\d members
```

### Migration Best Practices

1. **Always use transactions**
   ```sql
   BEGIN;
   -- migration statements
   COMMIT;
   ```

2. **Create rollback scripts**
   ```sql
   -- migrations/001_add_member_phone_rollback.sql
   BEGIN;
   ALTER TABLE members DROP COLUMN phone_number;
   COMMIT;
   ```

3. **Test in staging first**

4. **Backup before migration**
   ```bash
   pg_dump $DATABASE_URL > backup_before_migration.sql
   ```

---

## Backup Strategy

### Automated Backups

Railway and Render provide automated daily backups for PostgreSQL.

### Manual Backup

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Specific tables only
pg_dump $DATABASE_URL -t members -t accounts > members_backup.sql
```

### Restore from Backup

```bash
# Full restore
psql $DATABASE_URL < backup_20250120_120000.sql

# From compressed
gunzip -c backup_20250120_120000.sql.gz | psql $DATABASE_URL
```

### Backup Schedule Recommendation

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Full backup | Daily | 30 days |
| Transaction log | Continuous | 7 days |
| Monthly archive | Monthly | 1 year |

### Backup Verification

Periodically test backup restoration:

```bash
# Create test database
createdb cooplinkcr_test

# Restore backup
psql cooplinkcr_test < backup.sql

# Verify data integrity
psql cooplinkcr_test -c "SELECT COUNT(*) FROM members;"

# Cleanup
dropdb cooplinkcr_test
```

---

## Monitoring & Logging

### Health Check Endpoint

The backend provides a health check endpoint:

```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-20T12:00:00.000Z",
  "environment": "production"
}
```

### Configure Health Checks

#### Railway
- Automatic health checks enabled

#### Render
1. Go to Service Settings
2. Health Check Path: `/health`
3. Health Check Timeout: 10 seconds

### Logging

The backend uses Winston for logging:

```javascript
// Logs are written to:
// - Console (captured by platform)
// - logs/app.log (if file logging enabled)
```

### View Logs

```bash
# Railway
railway logs

# Render
# View in Render dashboard → Logs

# Railway CLI (streaming)
railway logs --follow
```

### Recommended Monitoring Tools

| Tool | Purpose | Pricing |
|------|---------|---------|
| **UptimeRobot** | Uptime monitoring | Free tier |
| **Sentry** | Error tracking | Free tier |
| **LogDNA/Logtail** | Log aggregation | Free tier |
| **New Relic** | APM | Free tier |

### Setting Up UptimeRobot

1. Create account at [UptimeRobot](https://uptimerobot.com)
2. Add new monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: CoopLink CR API
   - URL: `https://api.yourdomain.com/health`
   - Monitoring Interval: 5 minutes
3. Configure alert contacts

---

## Performance Optimization

### Backend Optimization

1. **Enable Compression**
   ```javascript
   // Already in app.js
   app.use(compression());
   ```

2. **Connection Pooling**
   ```javascript
   // Already configured in database.js
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000
   });
   ```

3. **Response Caching** (consider adding)
   ```javascript
   // Cache headers for static data
   app.use('/api/catalogs', (req, res, next) => {
     res.set('Cache-Control', 'public, max-age=3600');
     next();
   });
   ```

### Frontend Optimization

1. **Build Optimization** (automatic with Vite)
   - Tree shaking
   - Code splitting
   - Minification

2. **Image Optimization** (Cloudinary)
   - Automatic format selection
   - Lazy loading
   - Responsive images

3. **CDN Configuration**
   - Vercel Edge Network (automatic)
   - Cloudflare CDN (if configured)

### Database Optimization

1. **Indexes** (already created)
   ```sql
   -- Verify indexes exist
   SELECT indexname FROM pg_indexes WHERE tablename = 'members';
   ```

2. **Query Analysis**
   ```sql
   -- Analyze slow queries
   EXPLAIN ANALYZE SELECT * FROM members WHERE is_active = true;
   ```

3. **Vacuum**
   ```sql
   -- Run periodically (usually automatic)
   VACUUM ANALYZE;
   ```

---

## Security Checklist

### Before Going Live

- [ ] **JWT Secret**: 64+ random characters, unique to production
- [ ] **HTTPS**: Enforced on all endpoints
- [ ] **CORS**: Restricted to frontend domain only
- [ ] **Microsoft OAuth**: Production app registration with correct redirect URIs
- [ ] **Database SSL**: `?sslmode=require` in connection string
- [ ] **Environment Variables**: All secrets in platform's env vars, not in code
- [ ] **Helmet.js**: Enabled (sets security headers)
- [ ] **Rate Limiting**: Configured (recommended for production)
- [ ] **Input Validation**: All endpoints validate input
- [ ] **SQL Injection**: Parameterized queries only
- [ ] **XSS Prevention**: React handles by default
- [ ] **No Debug Endpoints**: Removed or protected

### Security Headers (via Helmet)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: ...
```

### Rate Limiting (Recommended)

Add rate limiting to protect against abuse:

```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Backend Dependencies
        run: cd backend && npm ci

      - name: Run Backend Tests
        run: cd backend && npm test

      - name: Install Frontend Dependencies
        run: cd frontend && npm ci

      - name: Build Frontend
        run: cd frontend && npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
```

### Required Secrets

Add these secrets to your GitHub repository:

| Secret | Source |
|--------|--------|
| `RAILWAY_TOKEN` | Railway Dashboard → Account Settings → Tokens |
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project settings |

---

## Rollback Procedures

### Application Rollback

#### Railway

1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click **Redeploy**

#### Render

1. Go to **Events** tab
2. Find previous successful deploy
3. Click **Rollback to this deploy**

#### Vercel

1. Go to **Deployments**
2. Find previous deployment
3. Click **...** → **Promote to Production**

### Database Rollback

```bash
# 1. Stop application (prevent new writes)
# Railway: Go to service → Settings → Disable

# 2. Restore from backup
psql $DATABASE_URL < backup_previous.sql

# 3. Restart application
```

### Emergency Procedures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EMERGENCY ROLLBACK PROCEDURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

    Issue Detected
          │
          ▼
    ┌─────────────┐
    │ Assess      │ Is it a critical issue affecting users?
    │ Severity    │
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
   Minor      Critical
     │           │
     ▼           ▼
  Schedule    Immediate
  Fix for     Rollback
  Next Deploy    │
                 ▼
           ┌─────────────┐
           │ 1. Notify   │ Alert team via Slack/Discord
           │    Team     │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │ 2. Rollback │ Use platform rollback feature
           │    App      │
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │ 3. Rollback │ If needed, restore database
           │    Database │ from backup
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │ 4. Verify   │ Check health endpoint
           │    Recovery │ Test critical flows
           └──────┬──────┘
                  │
                  ▼
           ┌─────────────┐
           │ 5. Post-    │ Document incident
           │    Mortem   │ Identify root cause
           └─────────────┘
```

---

## Maintenance

### Regular Tasks

| Frequency | Task | Description |
|-----------|------|-------------|
| **Daily** | Monitor logs | Check for errors and unusual patterns |
| **Weekly** | Review metrics | Check performance, response times |
| **Monthly** | Update dependencies | `npm audit`, `npm update` |
| **Monthly** | Rotate secrets | Update client secrets if expiring |
| **Quarterly** | Security audit | Review access, permissions |
| **Annually** | SSL certificate | Usually auto-renewed |

### Dependency Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update

# Test thoroughly before deploying!
npm test
```

### Rotating Secrets

1. Generate new secret
2. Update in platform environment variables
3. Redeploy application
4. Revoke old secret (if applicable)

---

## Troubleshooting

### Application Won't Start

**Symptoms:** Deployment fails or crashes immediately

**Solutions:**

1. Check logs for error messages
   ```bash
   railway logs  # or view in dashboard
   ```

2. Verify all environment variables are set

3. Check database connection
   ```bash
   # Test connection string
   psql $DATABASE_URL -c "SELECT 1"
   ```

4. Verify Node.js version compatibility

### Database Connection Issues

**Error:** `no pg_hba.conf entry for host`

**Solution:** Add `?sslmode=require` to DATABASE_URL

```
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```

### CORS Errors

**Error:** `Access-Control-Allow-Origin missing`

**Solutions:**

1. Verify `CORS_ORIGIN` exactly matches frontend URL
2. Include `https://`
3. No trailing slash
4. Check for typos

```env
# Correct
CORS_ORIGIN=https://app.yourdomain.com

# Wrong
CORS_ORIGIN=http://app.yourdomain.com     # Wrong protocol
CORS_ORIGIN=https://app.yourdomain.com/   # Trailing slash
```

### OAuth Redirect Errors

**Error:** `redirect_uri_mismatch`

**Solutions:**

1. Go to Azure Portal → App registrations
2. Authentication → Redirect URIs
3. Add production URL exactly as configured
4. Wait 5 minutes for propagation

### Performance Issues

**Symptoms:** Slow response times

**Solutions:**

1. Check database query performance
   ```sql
   EXPLAIN ANALYZE SELECT * FROM your_query;
   ```

2. Verify indexes exist
   ```sql
   \di
   ```

3. Check connection pool settings

4. Review memory limits in hosting platform

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture |
| [02-DATA-MODEL.md](./02-DATA-MODEL.md) | Database schema |
| [03-API-REST.md](./03-API-REST.md) | API documentation |
| [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) | OAuth & security |
| [07-INSTALLATION.md](./07-INSTALLATION.md) | Development setup |

---

<p align="center">
  <sub>Last updated: 2025</sub>
</p>
