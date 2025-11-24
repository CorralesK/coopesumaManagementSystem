# Database Scripts - CoopeSuma Management System

This folder contains the complete database schema for the CoopeSuma Management System.

## Execution Order

Execute scripts in numerical order:

```bash
psql -U postgres -d cooplinkcr -f 01_create_functions.sql
psql -U postgres -d cooplinkcr -f 02_create_tables.sql
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql
```

## Scripts Overview

### 01_create_functions.sql
**Purpose**: Creates all utility functions used by the system

**Functions included:**
- `update_updated_at_column()` - Auto-updates updated_at timestamps
- `deactivate_other_assemblies()` - Ensures only one active assembly
- `get_fiscal_year(DATE)` - Calculates fiscal year (Oct 1 - Sep 30)
- `is_fiscal_year_closed(INTEGER)` - Checks if fiscal year is closed
- `calculate_account_balance(INTEGER)` - Computes account balance from transactions
- `validate_sufficient_balance(INTEGER, NUMERIC)` - Validates withdrawal amounts
- `get_member_contribution_total(INTEGER, INTEGER)` - Gets member contributions by fiscal year
- `generate_receipt_number(INTEGER)` - Generates sequential receipt numbers

### 02_create_tables.sql
**Purpose**: Creates all database tables with constraints

**Tables created (17 total):**

**Core Tables:**
1. `schools` - Schools using the CoopLink system
2. `cooperatives` - Student cooperatives
3. `users` - System users (OAuth authentication)

**Member Catalog Tables:**
4. `member_qualities` - Catalog of member types (student, staff)
5. `member_levels` - Catalog of educational levels (grades 1-6, transition, materno, N/A)

**Member Table:**
6. `members` - Cooperative members with quality and educational level

**Attendance Module (Module 1):**
5. `assemblies` - Cooperative assemblies
6. `attendance_records` - Member attendance tracking

**Financial Module (Module 2):**
7. `account_types` - Catalog of account types (savings, contributions, surplus, affiliation)
8. `accounts` - Individual member accounts
9. `transactions` - Financial transactions
10. `contribution_periods` - Contribution periods (3 tracts per fiscal year)
11. `surplus_distributions` - Annual surplus distributions
12. `withdrawal_requests` - Member withdrawal requests
13. `liquidations` - Member liquidations (every 6 years or on exit)
14. `receipts` - Transaction receipts
15. `notifications` - Admin notifications

**Key Features:**
- All tables include `created_at` and `updated_at` timestamps
- Foreign key constraints with appropriate ON DELETE actions
- CHECK constraints for data validation
- UNIQUE constraints to prevent duplicates
- Table comments explaining purpose
- Column comments for complex/important fields

### 03_create_indexes.sql
**Purpose**: Creates indexes for query optimization

**Index Categories:**
- Primary lookups (IDs, emails, identification numbers)
- Foreign key relationships (JOIN optimization)
- Search fields (names, dates, statuses)
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., active records only)

**Total indexes**: 50+ indexes across all tables

### 04_create_triggers.sql
**Purpose**: Creates triggers for automation and business rules

**Trigger Categories:**

1. **Timestamp Triggers** (11 tables)
   - Auto-update `updated_at` on all tables with this column

2. **Business Logic Triggers:**
   - `ensure_single_active_assembly` - Only one active assembly per cooperative
   - `set_transaction_fiscal_year_trigger` - Auto-calculate fiscal year from date
   - `update_account_balance_trigger` - Auto-update account balances after transactions
   - `validate_fiscal_year_trigger` - Prevent transactions in closed fiscal years
   - `create_withdrawal_notification_trigger` - Notify admins of withdrawal requests

## Database Schema Summary

### Fiscal Year Logic
- Fiscal year runs from **October 1 to September 30** of the following year
- Example: Fiscal Year 2024 = October 1, 2024 to September 30, 2025
- Calculated automatically by `get_fiscal_year()` function
- Closed fiscal years cannot accept new transactions

### Account Types
1. **Savings** - Voluntary savings deposits and withdrawals
2. **Contributions** - Required capital contributions (₡900/year in 3 tracts of ₡300 each)
3. **Surplus** - Annual surplus distributions based on contribution percentage
4. **Affiliation** - Internal account (not visible to members)

### Transaction Types
- `deposit` - Money in
- `withdrawal` - Money out
- `adjustment` - Accounting adjustment
- `transfer_in` / `transfer_out` - Transfers between accounts
- `surplus_distribution` - Annual surplus allocation
- `liquidation` - Settlement on exit or every 6 years

### Key Business Rules
1. Only one assembly can be active at a time per cooperative
2. Account balances must be non-negative (enforced by CHECK constraint)
3. Transactions in closed fiscal years are blocked
4. Withdrawal requests require admin approval
5. Liquidations occur every 6 years or when member exits
6. Receipt numbers are sequential per cooperative per year (YYYY-NNNN format)

## Notes

- All scripts include `COMMENT ON` statements for documentation
- Scripts are idempotent where possible (use `CREATE OR REPLACE` for functions)
- All monetary values use `NUMERIC(12,2)` for precision
- Timestamps use PostgreSQL's `TIMESTAMP` type with automatic timezone handling
- Foreign keys use `RESTRICT` to prevent accidental cascading deletes

## See Also

- `../init-scripts/01_init.sql` - Initial database setup (extensions)
- `../../migration/` - Data migration scripts for historical data import
