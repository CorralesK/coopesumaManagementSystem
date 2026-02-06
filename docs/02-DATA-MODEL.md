# 📊 Data Model

<div align="center">

**Complete Database Schema Documentation**

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tables](https://img.shields.io/badge/Tables-17-green?style=for-the-badge)](.)
[![Triggers](https://img.shields.io/badge/Triggers-15+-blue?style=for-the-badge)](.)
[![Functions](https://img.shields.io/badge/Functions-10+-orange?style=for-the-badge)](.)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Entity-Relationship Diagram](#-entity-relationship-diagram)
- [Schema Organization](#-schema-organization)
- [Core Tables](#-core-tables)
  - [Schools & Cooperatives](#1-organizational-hierarchy)
  - [Users & Members](#2-users--members)
  - [Catalogs](#3-catalogs)
- [Module Tables](#-module-tables)
  - [Attendance Module](#attendance-module)
  - [Financial Module](#financial-module)
- [Functions](#-functions)
- [Triggers](#-triggers)
- [Indexes](#-indexes)
- [Constraints Reference](#-constraints-reference)
- [Database Configuration](#-database-configuration)

---

## 🎯 Overview

The CoopLink CR Management System uses **PostgreSQL 14+** as its relational database. The schema is designed following these principles:

| Principle | Implementation |
|-----------|----------------|
| **Referential Integrity** | Foreign keys with appropriate `ON DELETE` actions |
| **Data Validation** | CHECK constraints at database level |
| **Audit Trail** | `created_at` and `updated_at` timestamps on all tables |
| **Normalization** | Third Normal Form (3NF) with strategic denormalization |
| **Performance** | Strategic indexes for common query patterns |
| **Automation** | Triggers for business logic enforcement |

### Database Statistics

| Metric | Count |
|--------|-------|
| Tables | 17 |
| Functions | 10 |
| Triggers | 15+ |
| Indexes | 50+ |
| Check Constraints | 25+ |
| Foreign Keys | 30+ |

---

## 📐 Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ENTITY RELATIONSHIP DIAGRAM                          │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │     schools      │
                              │    (1 record)    │
                              └────────┬─────────┘
                                       │ 1
                                       │
                                       │ N
                              ┌────────▼─────────┐
                              │   cooperatives   │
                              │   (1 per school) │
                              └────────┬─────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │ 1                      │ 1                      │ 1
              │                        │                        │
              │ N                      │ N                      │ N
     ┌────────▼─────────┐    ┌────────▼─────────┐    ┌─────────▼────────┐
     │      users       │    │     members      │    │    assemblies    │
     │ (system access)  │    │  (coop members)  │    │    (meetings)    │
     └────────┬─────────┘    └────────┬─────────┘    └─────────┬────────┘
              │                       │                        │
              │              ┌────────┴────────┐               │
              │              │                 │               │
              │ N            │ N               │ 4             │ N
              │    ┌─────────▼──────┐  ┌───────▼───────┐       │
              │    │   attendance   │  │   accounts    │       │
              │    │    _records    │  │  (per member) │       │
              │    └────────────────┘  └───────┬───────┘       │
              │                                │               │
              │                                │ N             │
              │                       ┌────────▼───────┐       │
              │                       │  transactions  │       │
              │                       │  (movements)   │       │
              │                       └────────┬───────┘       │
              │                                │               │
              └────────────────────────────────┴───────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
     ┌────────▼─────────┐    ┌────────▼─────────┐    ┌─────────▼────────┐
     │     receipts     │    │   liquidations   │    │   withdrawal     │
     │   (documents)    │    │ (every 6 years)  │    │    _requests     │
     └──────────────────┘    └──────────────────┘    └──────────────────┘

                           CATALOG TABLES (Reference)
              ┌──────────────────┬──────────────────┬──────────────────┐
              │ member_qualities │  member_levels   │  account_types   │
              │  (student/staff) │ (grade 1-6, etc) │ (savings/contrib)│
              └──────────────────┴──────────────────┴──────────────────┘
```

### Relationship Summary

| Parent Table | Child Table | Relationship | ON DELETE |
|--------------|-------------|--------------|-----------|
| `schools` | `cooperatives` | 1:N | RESTRICT |
| `cooperatives` | `users` | 1:N | RESTRICT |
| `cooperatives` | `members` | 1:N | RESTRICT |
| `cooperatives` | `assemblies` | 1:N | RESTRICT |
| `users` | `members` | 1:1 (optional) | SET NULL |
| `members` | `accounts` | 1:4 | RESTRICT |
| `members` | `attendance_records` | 1:N | CASCADE |
| `accounts` | `transactions` | 1:N | RESTRICT |
| `member_qualities` | `members` | 1:N | RESTRICT |
| `member_levels` | `members` | 1:N | RESTRICT |

---

## 📂 Schema Organization

The database schema is organized into logical modules:

```
DATABASE SCHEMA
│
├── 🏢 ORGANIZATIONAL
│   ├── schools              → Educational institutions
│   └── cooperatives         → Student cooperatives
│
├── 👥 IDENTITY
│   ├── users                → System users (OAuth)
│   ├── members              → Cooperative members
│   ├── member_qualities     → Member type catalog
│   └── member_levels        → Educational levels catalog
│
├── 📋 ATTENDANCE MODULE
│   ├── assemblies           → Cooperative meetings
│   └── attendance_records   → Attendance tracking
│
├── 💰 FINANCIAL MODULE
│   ├── account_types        → Account type catalog
│   ├── accounts             → Member accounts (4 per member)
│   ├── transactions         → Financial movements
│   ├── contribution_periods → Contribution schedule
│   ├── surplus_distributions→ Annual surplus distribution
│   ├── withdrawal_requests  → Withdrawal workflow
│   ├── liquidations         → 6-year liquidations
│   └── receipts             → Transaction receipts
│
└── 🔔 SYSTEM
    └── notifications        → Admin notifications
```

---

## 🗄️ Core Tables

### 1. Organizational Hierarchy

#### 📍 `schools`

Stores information about schools using the CoopLink system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `school_id` | `SERIAL` | `PRIMARY KEY` | Unique school identifier |
| `name` | `VARCHAR(200)` | `NOT NULL` | School name |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record update timestamp |

**Constraints:**
```sql
CONSTRAINT chk_school_name_not_empty CHECK (TRIM(name) != '')
```

---

#### 📍 `cooperatives`

Stores student cooperatives associated with schools.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `cooperative_id` | `SERIAL` | `PRIMARY KEY` | Unique cooperative identifier |
| `school_id` | `INTEGER` | `NOT NULL, FK → schools` | Associated school |
| `trade_name` | `VARCHAR(150)` | `NOT NULL` | Commercial/trade name |
| `legal_name` | `VARCHAR(255)` | `NOT NULL` | Legal registered name |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record update timestamp |

**Constraints:**
```sql
CONSTRAINT chk_trade_name_not_empty CHECK (TRIM(trade_name) != '')
CONSTRAINT chk_legal_name_not_empty CHECK (TRIM(legal_name) != '')
FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE RESTRICT
```

---

### 2. Users & Members

#### 👤 `users`

System users authenticated via Microsoft OAuth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `SERIAL` | `PRIMARY KEY` | Unique user identifier |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK → cooperatives` | Associated cooperative |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | User's full name |
| `email` | `VARCHAR(255)` | `UNIQUE` | User email address |
| `microsoft_id` | `VARCHAR(255)` | `UNIQUE` | Microsoft OAuth ID |
| `role` | `VARCHAR(20)` | `NOT NULL` | User role |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | Active status |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record update timestamp |

**Role Values:**

| Role | Description | Access Level |
|------|-------------|--------------|
| `administrator` | Full system access | All modules |
| `registrar` | Attendance scanning | Attendance only |
| `manager` | Financial operations | Financial module |
| `member` | Cooperative member | Own data only |

**Constraints:**
```sql
CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != '')
CONSTRAINT chk_email_format CHECK (
    email IS NULL OR
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
)
CHECK (role IN ('administrator', 'registrar', 'manager', 'member'))
```

---

#### 👥 `members`

Cooperative members (students and staff).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `member_id` | `SERIAL` | `PRIMARY KEY` | Unique member identifier |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK → cooperatives` | Associated cooperative |
| `user_id` | `INTEGER` | `FK → users, NULL` | Optional system user link |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Member's full name |
| `identification` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | ID number (cédula) |
| `gender` | `CHAR(1)` | `CHECK (M, F, O)` | Gender |
| `member_code` | `VARCHAR(20)` | `UNIQUE` | Member code (NNN-YYYY) |
| `quality_id` | `INTEGER` | `NOT NULL, FK → member_qualities` | Member type |
| `level_id` | `INTEGER` | `FK → member_levels` | Educational level |
| `institutional_email` | `VARCHAR(255)` | `UNIQUE` | Institutional email |
| `photo_url` | `VARCHAR(255)` | — | Cloudinary photo URL |
| `qr_hash` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | QR code hash |
| `affiliation_date` | `DATE` | `NOT NULL DEFAULT TODAY` | Affiliation date |
| `last_liquidation_date` | `DATE` | — | Last liquidation date |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | Active status |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record creation |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Record update |

**Gender Values:**

| Code | Description |
|------|-------------|
| `M` | Male (Masculino) |
| `F` | Female (Femenino) |
| `O` | Other (Otro) |

**Member Code Format:** `NNN-YYYY` (e.g., `001-2025`)
- `NNN` = Sequential number (001-999)
- `YYYY` = Year of affiliation

---

### 3. Catalogs

#### 📋 `member_qualities`

Catalog of member quality types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `quality_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `quality_code` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Quality code |
| `quality_name` | `VARCHAR(50)` | `NOT NULL` | Display name |
| `description` | `TEXT` | — | Description |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Predefined Values:**

| quality_id | quality_code | quality_name | Description |
|------------|--------------|--------------|-------------|
| 1 | `student` | Estudiante | Active student member |
| 2 | `staff` | Funcionario | School staff member |

---

#### 📋 `member_levels`

Catalog of educational levels (grades).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `level_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `level_code` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Level code |
| `level_name` | `VARCHAR(50)` | `NOT NULL` | Display name |
| `applies_to_quality_code` | `VARCHAR(20)` | `NOT NULL, FK` | Applicable quality |
| `display_order` | `INTEGER` | `NOT NULL` | Sort order |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Predefined Values:**

| level_id | level_code | level_name | applies_to | display_order |
|----------|------------|------------|------------|---------------|
| 9 | `materno` | Materno | student | -1 |
| 8 | `transicion` | Transición | student | 0 |
| 1 | `grade_1` | Primer Grado | student | 1 |
| 2 | `grade_2` | Segundo Grado | student | 2 |
| 3 | `grade_3` | Tercer Grado | student | 3 |
| 4 | `grade_4` | Cuarto Grado | student | 4 |
| 5 | `grade_5` | Quinto Grado | student | 5 |
| 6 | `grade_6` | Sexto Grado | student | 6 |
| 7 | `not_applicable` | No Aplica | staff | 99 |

---

## 📦 Module Tables

### Attendance Module

#### 🗓️ `assemblies`

Cooperative assemblies for attendance tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `assembly_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK` | Associated cooperative |
| `title` | `VARCHAR(150)` | `NOT NULL` | Assembly title |
| `scheduled_date` | `DATE` | `NOT NULL` | Scheduled date |
| `start_time` | `TIME` | — | Start time |
| `end_time` | `TIME` | — | End time |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT false` | Active status |
| `concluded_at` | `TIMESTAMP` | — | Conclusion timestamp |
| `created_by` | `INTEGER` | `NOT NULL, FK → users` | Creator |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Business Rules:**
- ⚠️ **Only ONE assembly can be active** at a time per cooperative
- Enforced by unique partial index and trigger

**Constraints:**
```sql
CONSTRAINT chk_title_not_empty CHECK (TRIM(title) != '')
CONSTRAINT chk_time_range CHECK (
    end_time IS NULL OR start_time IS NULL OR end_time > start_time
)
```

---

#### ✓ `attendance_records`

Attendance records for assemblies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `attendance_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `member_id` | `INTEGER` | `NOT NULL, FK → members` | Attending member |
| `assembly_id` | `INTEGER` | `NOT NULL, FK → assemblies` | Assembly attended |
| `registered_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Registration time |
| `registered_by` | `INTEGER` | `NOT NULL, FK → users` | Registering user |
| `registration_method` | `VARCHAR(20)` | `NOT NULL DEFAULT 'qr_scan'` | Method used |
| `notes` | `TEXT` | — | Additional notes |

**Registration Methods:**

| Method | Description |
|--------|-------------|
| `qr_scan` | QR code scan (preferred) |
| `manual` | Manual entry (backup) |

**Constraints:**
```sql
CONSTRAINT unique_attendance UNIQUE (member_id, assembly_id)
CHECK (registration_method IN ('qr_scan', 'manual'))
```

---

### Financial Module

#### 💳 `account_types`

Catalog of account types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `account_type_code` | `VARCHAR(20)` | `PRIMARY KEY` | Account type code |
| `display_name` | `VARCHAR(50)` | `NOT NULL` | Display name |
| `description` | `TEXT` | — | Description |
| `is_visible_to_member` | `BOOLEAN` | `NOT NULL DEFAULT true` | Visible in portal |
| `display_order` | `INTEGER` | `NOT NULL` | Sort order |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |

**Predefined Values:**

| Code | Display Name | Visible | Order | Description |
|------|--------------|---------|-------|-------------|
| `savings` | Ahorros | ✅ Yes | 1 | Voluntary savings |
| `contributions` | Aportaciones | ✅ Yes | 2 | Social capital (₡900/year) |
| `surplus` | Excedentes | ✅ Yes | 3 | Annual surplus distribution |
| `affiliation` | Afiliación | ❌ No | 4 | Affiliation fee (internal) |

---

#### 💰 `accounts`

Individual member accounts (4 per member).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `account_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `member_id` | `INTEGER` | `NOT NULL, FK → members` | Account owner |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK` | Associated cooperative |
| `account_type` | `VARCHAR(20)` | `NOT NULL, FK → account_types` | Account type |
| `current_balance` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 0.00` | Current balance |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Business Rules:**
- Each member gets exactly **4 accounts** upon affiliation
- Balance is automatically calculated via trigger

**Constraints:**
```sql
CONSTRAINT unique_member_account_type UNIQUE (member_id, account_type)
CONSTRAINT chk_balance_non_negative CHECK (current_balance >= 0.00)
```

---

#### 📊 `transactions`

Financial transactions on accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `transaction_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `account_id` | `INTEGER` | `NOT NULL, FK → accounts` | Associated account |
| `transaction_type` | `VARCHAR(30)` | `NOT NULL` | Transaction type |
| `amount` | `NUMERIC(12,2)` | `NOT NULL, > 0` | Transaction amount |
| `transaction_date` | `DATE` | `NOT NULL DEFAULT TODAY` | Transaction date |
| `fiscal_year` | `INTEGER` | `NOT NULL` | Fiscal year (auto-calculated) |
| `receipt_number` | `VARCHAR(50)` | — | Receipt number |
| `description` | `TEXT` | — | Transaction description |
| `related_transaction_id` | `INTEGER` | `FK → transactions` | Related transaction |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'completed'` | Status |
| `created_by` | `INTEGER` | `NOT NULL, FK → users` | Creator |
| `approved_by` | `INTEGER` | `FK → users` | Approver |
| `approved_at` | `TIMESTAMP` | — | Approval timestamp |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Transaction Types:**

| Type | Direction | Description |
|------|-----------|-------------|
| `deposit` | ➕ Credit | Regular deposit |
| `withdrawal` | ➖ Debit | Money withdrawal |
| `adjustment` | ➕/➖ | Accounting adjustment |
| `transfer_in` | ➕ Credit | Incoming transfer |
| `transfer_out` | ➖ Debit | Outgoing transfer |
| `surplus_distribution` | ➕ Credit | Annual surplus |
| `liquidation` | ➖ Debit | Account liquidation |

**Transaction Status:**

| Status | Description |
|--------|-------------|
| `pending` | Awaiting approval |
| `completed` | Successfully processed |
| `cancelled` | Cancelled transaction |

**Fiscal Year Calculation:**
- Fiscal year runs from **October 1** to **September 30**
- January-September → Previous year
- October-December → Current year

---

#### 📅 `contribution_periods`

Contribution periods (3 tracts per year).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `period_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK` | Associated cooperative |
| `fiscal_year` | `INTEGER` | `NOT NULL` | Fiscal year |
| `tract_number` | `INTEGER` | `NOT NULL, CHECK (1,2,3)` | Tract number |
| `start_date` | `DATE` | `NOT NULL` | Period start |
| `end_date` | `DATE` | `NOT NULL` | Period end |
| `required_amount` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 300.00` | Required amount |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Contribution Schedule:**
- **Annual Total:** ₡900 per member
- **Per Tract:** ₡300 × 3 tracts = ₡900

| Tract | Approximate Period |
|-------|-------------------|
| 1 | October - January |
| 2 | February - May |
| 3 | June - September |

---

#### 📈 `surplus_distributions`

Annual surplus distributions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `distribution_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK` | Associated cooperative |
| `fiscal_year` | `INTEGER` | `NOT NULL` | Fiscal year |
| `total_distributable_amount` | `NUMERIC(12,2)` | `NOT NULL, > 0` | Total to distribute |
| `total_contributions` | `NUMERIC(12,2)` | `NOT NULL, > 0` | Total contributions |
| `distribution_date` | `DATE` | `NOT NULL` | Distribution date |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'pending'` | Status |
| `notes` | `TEXT` | — | Additional notes |
| `created_by` | `INTEGER` | `NOT NULL, FK → users` | Creator |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Distribution Formula:**
```
Member Surplus = (Member Contributions / Total Contributions) × Distributable Amount
```

---

#### 📤 `withdrawal_requests`

Withdrawal requests initiated by members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `request_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `member_id` | `INTEGER` | `NOT NULL, FK → members` | Requesting member |
| `account_id` | `INTEGER` | `NOT NULL, FK → accounts` | Source account |
| `requested_amount` | `NUMERIC(12,2)` | `NOT NULL, > 0` | Requested amount |
| `request_type` | `VARCHAR(30)` | `NOT NULL` | Request type |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'pending'` | Request status |
| `request_notes` | `TEXT` | — | Member notes |
| `admin_notes` | `TEXT` | — | Admin notes |
| `requested_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Request timestamp |
| `reviewed_by` | `INTEGER` | `FK → users` | Reviewer |
| `reviewed_at` | `TIMESTAMP` | — | Review timestamp |
| `completed_transaction_id` | `INTEGER` | `FK → transactions` | Completed transaction |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Request Types:**

| Type | Description |
|------|-------------|
| `withdrawal` | Money withdrawal from account |
| `surplus_to_savings` | Transfer surplus to savings |

**Status Flow:**
```
pending → approved → completed
       ↘ rejected
       ↘ cancelled
```

---

#### 💼 `liquidations`

Member liquidations (every 6 years or on exit).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `liquidation_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `member_id` | `INTEGER` | `NOT NULL, FK → members` | Liquidated member |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK` | Associated cooperative |
| `liquidation_type` | `VARCHAR(20)` | `NOT NULL` | Liquidation type |
| `liquidation_date` | `DATE` | `NOT NULL` | Liquidation date |
| `total_savings` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 0.00` | Savings liquidated |
| `total_contributions` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 0.00` | Contributions liquidated |
| `total_surplus` | `NUMERIC(12,2)` | `NOT NULL DEFAULT 0.00` | Surplus liquidated |
| `total_amount` | `NUMERIC(12,2)` | `NOT NULL` | Total amount |
| `member_continues` | `BOOLEAN` | `NOT NULL` | Member continues |
| `notes` | `TEXT` | — | Additional notes |
| `processed_by` | `INTEGER` | `NOT NULL, FK → users` | Processor |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Liquidation Types:**

| Type | Description | Member Status After |
|------|-------------|---------------------|
| `periodic` | Every 6 years | Continues active |
| `exit` | Leaving cooperative | Deactivated |

**Constraints:**
```sql
CONSTRAINT chk_total_amount CHECK (
    total_amount = total_savings + total_contributions + total_surplus
)
```

---

#### 🧾 `receipts`

Receipts generated for transactions and liquidations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `receipt_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `cooperative_id` | `INTEGER` | `NOT NULL, FK` | Associated cooperative |
| `transaction_id` | `INTEGER` | `FK → transactions` | Associated transaction |
| `liquidation_id` | `INTEGER` | `FK → liquidations` | Associated liquidation |
| `receipt_number` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Receipt number |
| `receipt_type` | `VARCHAR(30)` | `NOT NULL` | Receipt type |
| `member_id` | `INTEGER` | `NOT NULL, FK → members` | Associated member |
| `amount` | `NUMERIC(12,2)` | `NOT NULL, > 0` | Receipt amount |
| `pdf_url` | `VARCHAR(500)` | — | PDF URL |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |

**Receipt Number Format:** `YYYY-NNNN` (e.g., `2025-0001`)

**Receipt Types:**

| Type | Description |
|------|-------------|
| `deposit` | Savings deposit |
| `withdrawal` | Money withdrawal |
| `contribution` | Contribution payment |
| `surplus_distribution` | Surplus distribution |
| `liquidation` | Account liquidation |
| `transfer` | Account transfer |

**Constraints:**
```sql
CONSTRAINT chk_has_reference CHECK (
    (transaction_id IS NOT NULL AND liquidation_id IS NULL) OR
    (transaction_id IS NULL AND liquidation_id IS NOT NULL)
)
```

---

#### 🔔 `notifications`

System notifications for administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `notification_id` | `SERIAL` | `PRIMARY KEY` | Unique identifier |
| `user_id` | `INTEGER` | `NOT NULL, FK → users` | Target user |
| `notification_type` | `VARCHAR(30)` | `NOT NULL` | Notification type |
| `title` | `VARCHAR(200)` | `NOT NULL` | Notification title |
| `message` | `TEXT` | `NOT NULL` | Notification message |
| `related_entity_type` | `VARCHAR(30)` | — | Related entity type |
| `related_entity_id` | `INTEGER` | — | Related entity ID |
| `is_read` | `BOOLEAN` | `NOT NULL DEFAULT false` | Read status |
| `read_at` | `TIMESTAMP` | — | Read timestamp |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Creation timestamp |

**Notification Types:**

| Type | Trigger | Recipients |
|------|---------|------------|
| `withdrawal_request` | New withdrawal request | Administrators |
| `transfer_request` | New transfer request | Administrators |
| `liquidation_due` | Member reaches 6 years | Administrators |
| `contribution_overdue` | Missing tract payment | Administrators |
| `system_alert` | System events | Administrators |

---

## ⚙️ Functions

### Utility Functions

#### `update_updated_at_column()`

Automatically updates `updated_at` timestamp on record modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

#### `get_fiscal_year(transaction_date DATE)`

Calculates fiscal year based on transaction date.

```sql
CREATE OR REPLACE FUNCTION get_fiscal_year(transaction_date DATE)
RETURNS INTEGER AS $$
BEGIN
    -- Fiscal year runs October 1 - September 30
    IF EXTRACT(MONTH FROM transaction_date) <= 9 THEN
        RETURN EXTRACT(YEAR FROM transaction_date) - 1;
    ELSE
        RETURN EXTRACT(YEAR FROM transaction_date);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Examples:**
| Date | Fiscal Year |
|------|-------------|
| 2025-01-15 | 2024 |
| 2025-09-30 | 2024 |
| 2025-10-01 | 2025 |
| 2025-12-31 | 2025 |

---

#### `is_fiscal_year_closed(fiscal_year INTEGER)`

Checks if a fiscal year is closed (past September 30).

```sql
CREATE OR REPLACE FUNCTION is_fiscal_year_closed(fiscal_year INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN CURRENT_DATE > make_date(fiscal_year + 1, 9, 30);
END;
$$ LANGUAGE plpgsql STABLE;
```

---

#### `calculate_account_balance(p_account_id INTEGER)`

Calculates current balance for an account from all completed transactions.

```sql
CREATE OR REPLACE FUNCTION calculate_account_balance(p_account_id INTEGER)
RETURNS NUMERIC(12,2) AS $$
DECLARE
    v_balance NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(
        CASE
            WHEN transaction_type IN ('deposit', 'transfer_in', 'surplus_distribution')
                THEN amount
            WHEN transaction_type IN ('withdrawal', 'transfer_out', 'liquidation')
                THEN -amount
            WHEN transaction_type = 'adjustment'
                THEN amount
            ELSE 0
        END
    ), 0.00) INTO v_balance
    FROM transactions
    WHERE account_id = p_account_id
    AND status = 'completed';

    RETURN v_balance;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

#### `validate_sufficient_balance(p_account_id, p_amount)`

Checks if account has sufficient balance for withdrawal.

```sql
CREATE OR REPLACE FUNCTION validate_sufficient_balance(
    p_account_id INTEGER,
    p_amount NUMERIC(12,2)
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN calculate_account_balance(p_account_id) >= p_amount;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

#### `generate_receipt_number(p_cooperative_id INTEGER)`

Generates sequential receipt number for cooperative.

```sql
CREATE OR REPLACE FUNCTION generate_receipt_number(p_cooperative_id INTEGER)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_year INTEGER;
    v_sequence INTEGER;
BEGIN
    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(receipt_number FROM POSITION('-' IN receipt_number) + 1) AS INTEGER)
    ), 0) + 1 INTO v_sequence
    FROM receipts
    WHERE cooperative_id = p_cooperative_id
    AND EXTRACT(YEAR FROM created_at) = v_year;

    RETURN v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;
```

**Output Format:** `YYYY-NNNN` (e.g., `2025-0001`, `2025-0002`)

---

#### `deactivate_other_assemblies()`

Ensures only one assembly can be active at a time.

```sql
CREATE OR REPLACE FUNCTION deactivate_other_assemblies()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE assemblies
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE cooperative_id = NEW.cooperative_id
    AND assembly_id != NEW.assembly_id
    AND is_active = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Triggers

### Timestamp Triggers

Applied to all tables with `updated_at` column:

| Table | Trigger Name |
|-------|--------------|
| `schools` | `update_schools_updated_at` |
| `cooperatives` | `update_cooperatives_updated_at` |
| `users` | `update_users_updated_at` |
| `members` | `update_members_updated_at` |
| `member_qualities` | `update_member_qualities_updated_at` |
| `member_levels` | `update_member_levels_updated_at` |
| `assemblies` | `update_assemblies_updated_at` |
| `accounts` | `update_accounts_updated_at` |
| `transactions` | `update_transactions_updated_at` |
| `contribution_periods` | `update_contribution_periods_updated_at` |
| `surplus_distributions` | `update_surplus_distributions_updated_at` |
| `withdrawal_requests` | `update_withdrawal_requests_updated_at` |
| `liquidations` | `update_liquidations_updated_at` |

---

### Business Logic Triggers

#### Assembly Single Active Enforcement

```sql
CREATE TRIGGER ensure_single_active_assembly
    BEFORE INSERT OR UPDATE ON assemblies
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION deactivate_other_assemblies();
```

---

#### Member Level-Quality Validation

```sql
CREATE TRIGGER validate_member_level_quality_trigger
    BEFORE INSERT OR UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION validate_member_level_quality();
```

Ensures:
- Students can only have student-applicable levels (grade_1-6, materno, transicion)
- Staff can only have `not_applicable` level

---

#### Transaction Fiscal Year Auto-Set

```sql
CREATE TRIGGER set_transaction_fiscal_year_trigger
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_fiscal_year();
```

---

#### Fiscal Year Closed Validation

```sql
CREATE TRIGGER validate_fiscal_year_trigger
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_fiscal_year_not_closed();
```

Prevents transactions in closed fiscal years.

---

#### Account Balance Auto-Update

```sql
CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance_after_transaction();
```

Recalculates account balance after each completed transaction.

---

#### Withdrawal Request Notification

```sql
CREATE TRIGGER create_withdrawal_notification_trigger
    AFTER INSERT ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_withdrawal_notification();
```

Creates notifications for administrators when new withdrawal requests are submitted.

---

## 📇 Indexes

### Performance Indexes Summary

#### Primary Query Patterns

| Table | Index | Purpose |
|-------|-------|---------|
| `members` | `idx_members_qr_hash` | QR code scanning |
| `members` | `idx_members_identification` | ID lookup |
| `members` | `idx_members_cooperative_id` | Cooperative filtering |
| `users` | `idx_users_microsoft_id` | OAuth authentication |
| `users` | `idx_users_email` | Email login |
| `assemblies` | `idx_assemblies_single_active` | Single active enforcement |
| `attendance_records` | `idx_attendance_assembly_id` | Assembly attendance list |
| `transactions` | `idx_transactions_account_date` | Account history |
| `notifications` | `idx_notifications_unread` | Unread notifications |

---

### Complete Index List

<details>
<summary><strong>Click to expand full index list</strong></summary>

#### Schools & Cooperatives
```sql
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_cooperatives_school_id ON cooperatives(school_id);
CREATE INDEX idx_cooperatives_trade_name ON cooperatives(trade_name);
```

#### Users
```sql
CREATE INDEX idx_users_cooperative_id ON users(cooperative_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### Members
```sql
CREATE INDEX idx_members_cooperative_id ON members(cooperative_id);
CREATE INDEX idx_members_identification ON members(identification);
CREATE INDEX idx_members_qr_hash ON members(qr_hash);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_members_full_name ON members(full_name);
CREATE INDEX idx_members_institutional_email ON members(institutional_email) WHERE institutional_email IS NOT NULL;
CREATE INDEX idx_members_affiliation_date ON members(affiliation_date);
CREATE INDEX idx_members_member_code ON members(member_code);
CREATE INDEX idx_members_quality_id ON members(quality_id);
CREATE INDEX idx_members_level_id ON members(level_id);
CREATE INDEX idx_members_gender ON members(gender);
CREATE INDEX idx_members_user_id ON members(user_id);
```

#### Assemblies & Attendance
```sql
CREATE INDEX idx_assemblies_cooperative_id ON assemblies(cooperative_id);
CREATE INDEX idx_assemblies_scheduled_date ON assemblies(scheduled_date);
CREATE INDEX idx_assemblies_is_active ON assemblies(is_active);
CREATE UNIQUE INDEX idx_assemblies_single_active ON assemblies(cooperative_id, is_active) WHERE is_active = true;
CREATE INDEX idx_assemblies_created_by ON assemblies(created_by);
CREATE INDEX idx_attendance_member_id ON attendance_records(member_id);
CREATE INDEX idx_attendance_assembly_id ON attendance_records(assembly_id);
CREATE INDEX idx_attendance_registered_at ON attendance_records(registered_at);
CREATE INDEX idx_attendance_registered_by ON attendance_records(registered_by);
CREATE INDEX idx_attendance_method ON attendance_records(registration_method);
```

#### Financial Tables
```sql
CREATE INDEX idx_accounts_member_id ON accounts(member_id);
CREATE INDEX idx_accounts_cooperative_id ON accounts(cooperative_id);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_member_type ON accounts(member_id, account_type);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_fiscal_year ON transactions(fiscal_year);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date);
CREATE INDEX idx_transactions_fiscal_account ON transactions(fiscal_year, account_id);
CREATE INDEX idx_transactions_receipt_number ON transactions(receipt_number) WHERE receipt_number IS NOT NULL;
```

#### Withdrawal & Liquidations
```sql
CREATE INDEX idx_withdrawal_requests_member_id ON withdrawal_requests(member_id);
CREATE INDEX idx_withdrawal_requests_account_id ON withdrawal_requests(account_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at);
CREATE INDEX idx_withdrawal_requests_reviewed_by ON withdrawal_requests(reviewed_by);
CREATE INDEX idx_withdrawal_requests_pending ON withdrawal_requests(status, requested_at) WHERE status = 'pending';
CREATE INDEX idx_liquidations_member_id ON liquidations(member_id);
CREATE INDEX idx_liquidations_cooperative_id ON liquidations(cooperative_id);
CREATE INDEX idx_liquidations_type ON liquidations(liquidation_type);
CREATE INDEX idx_liquidations_date ON liquidations(liquidation_date);
CREATE INDEX idx_liquidations_processed_by ON liquidations(processed_by);
```

#### Receipts & Notifications
```sql
CREATE INDEX idx_receipts_cooperative_id ON receipts(cooperative_id);
CREATE INDEX idx_receipts_transaction_id ON receipts(transaction_id);
CREATE INDEX idx_receipts_liquidation_id ON receipts(liquidation_id);
CREATE INDEX idx_receipts_member_id ON receipts(member_id);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);
CREATE INDEX idx_receipts_type_date ON receipts(receipt_type, created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at) WHERE is_read = false;
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
```

</details>

---

## 🔒 Constraints Reference

### Check Constraints Summary

| Table | Constraint | Rule |
|-------|------------|------|
| `schools` | `chk_school_name_not_empty` | `TRIM(name) != ''` |
| `cooperatives` | `chk_trade_name_not_empty` | `TRIM(trade_name) != ''` |
| `users` | `chk_email_format` | Valid email regex |
| `users` | Role check | `IN ('administrator', 'registrar', 'manager', 'member')` |
| `members` | `chk_identification_format` | `identification ~ '^[0-9-]+$'` |
| `members` | Gender check | `IN ('M', 'F', 'O')` |
| `assemblies` | `chk_time_range` | `end_time > start_time` |
| `accounts` | `chk_balance_non_negative` | `current_balance >= 0.00` |
| `transactions` | `chk_amount_positive` | `amount > 0.00` |
| `contribution_periods` | Tract check | `tract_number IN (1, 2, 3)` |
| `liquidations` | `chk_total_amount` | Sum validation |
| `receipts` | `chk_has_reference` | XOR on transaction/liquidation |

---

## ⚙️ Database Configuration

### Connection String

```env
DATABASE_URL=postgresql://user:password@host:5432/cooplinkcr?sslmode=require
```

### Recommended PostgreSQL Settings

```ini
# postgresql.conf

# Connection Settings
max_connections = 100
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
work_mem = 16MB

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on

# Autovacuum
autovacuum = on
autovacuum_max_workers = 3
```

### Script Execution Order

```bash
# Execute in this order for fresh installation
psql -d cooplinkcr -f 01_create_functions.sql
psql -d cooplinkcr -f 02_create_tables.sql
psql -d cooplinkcr -f 03_create_indexes.sql
psql -d cooplinkcr -f 04_create_triggers.sql
```

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture |
| [03-API-REST.md](./03-API-REST.md) | API endpoints |
| [06-BUSINESS-FLOWS.md](./06-BUSINESS-FLOWS.md) | Business processes |
| [07-INSTALLATION.md](./07-INSTALLATION.md) | Installation guide |

---

<div align="center">

**[⬆ Back to Top](#-data-model)**

</div>
