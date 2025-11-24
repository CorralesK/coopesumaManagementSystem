# 🚀 Quick Start Guide - CoopeSuma Migration

## Quick Steps to Run the Migration

### 1️⃣ Preparation (5 minutes)

```bash
# 1. Go to the migration folder
cd migration

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 2️⃣ Place Excel Files

Copy the 3 Excel files to the `data/` folder:

```
migration/data/
├── Lista_asociados__madre_y_depurada__2025.xlsx
├── CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx
└── Registro_de_Aportaciones_2022_al_2025_CORREGIDO_LISTO_IMPRIMIR.xlsm
```

### 3️⃣ Backup the Database

```bash
# ⚠️ VERY IMPORTANT - Backup BEFORE migrating
pg_dump -U postgres cooplinkcr > backup_pre_migration.sql
```

### 4️⃣ Verify Connection

```bash
npm run test:connection
```

**Should display:**
- ✅ Connection successful
- ✅ All critical tables exist
- ✅ Cooperatives found
- ✅ Admin users found

### 5️⃣ Run Migration in Test Mode (DRY RUN)

```bash
npm run migrate:dry
```

**Review carefully:**
- ✅ Number of members read
- ✅ Number of transactions processed
- ✅ Validation report without errors
- ✅ Final insertion report

### 6️⃣ Run Real Migration

```bash
npm run migrate
```

### 7️⃣ Verify Data in the Database

```bash
# Option 1: Use psql
psql -U postgres -d cooplinkcr -f verify-migration.sql

# Option 2: Connect with SQL client and run:
SELECT COUNT(*) FROM members;
SELECT account_type, COUNT(*), SUM(current_balance) FROM accounts GROUP BY account_type;
```

## 🎯 Useful Commands

```bash
# View help
npm run --help

# Test connection
npm run test:connection

# Migration in test mode (does not save)
npm run migrate:dry

# Real migration
npm run migrate

# Migration skipping validations (dangerous!)
SKIP_VALIDATION=true npm run migrate
```

## ⚠️ Pre-Migration Checklist

- [ ] Database backup completed
- [ ] Excel files placed in `data/` folder
- [ ] `.env` file configured correctly
- [ ] Database connection verified
- [ ] DRY RUN executed and reviewed
- [ ] Validation report without critical errors

## ✅ Post-Migration Checklist

- [ ] Verify total members: `SELECT COUNT(*) FROM members;`
- [ ] Verify accounts created: `SELECT COUNT(*) FROM accounts;`
- [ ] Verify transactions: `SELECT COUNT(*) FROM transactions;`
- [ ] Verify positive balances: Run `verify-migration.sql`
- [ ] Assign member grades manually
- [ ] Assign institutional emails manually

## 🆘 Quick Troubleshooting

### ❌ Error: "No cooperatives found"

```sql
-- Create cooperative
INSERT INTO schools (name) VALUES ('Example School');
INSERT INTO cooperatives (school_id, trade_name, legal_name)
VALUES (1, 'CoopeSuma', 'Cooperativa CoopeSuma R.L.');
```

### ❌ Error: "No admin users found"

```sql
-- Create admin user
INSERT INTO users (cooperative_id, full_name, email, role)
VALUES (1, 'Admin Migration', 'admin@example.com', 'administrator');
```

### ❌ Error: "Connection timeout"

1. Verify that PostgreSQL is running
2. Verify credentials in `.env`
3. Verify database name

### ❌ Error: "File not found"

Verify that Excel files are in `migration/data/`

## 📊 Expected Numbers (Approximate)

- **Members**: ~122
- **Accounts**: ~366 (3 per member: savings + contributions + surplus)
- **Savings**: ~171 transactions
- **Initial contribution balances**: ~50 transactions
- **Contributions**: ~735 transactions
- **Surplus distributions**: ~257 transactions
- **Surplus withdrawals**: ~257 transactions
- **Total transactions**: ~1,470

## 🔄 What to Do if Something Goes Wrong?

### During migration (before COMMIT)

The script automatically does ROLLBACK. Nothing is saved.

### After COMMIT

```bash
# 1. Restore the backup
psql -U postgres -d cooplinkcr < backup_pre_migration.sql

# 2. Fix the problem

# 3. Run the migration again
npm run migrate:dry  # First in test mode
npm run migrate      # Then the real migration
```

## 📞 Complete Documentation

See `README.md` for detailed documentation.

---

**Important!**: Never run the migration more than once without restoring the backup, as it will create duplicate data.
