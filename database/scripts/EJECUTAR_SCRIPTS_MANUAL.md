# Guía de Ejecución de Scripts de Base de Datos - Phase 1

## ⚠️ IMPORTANTE
Esta guía debe ejecutarse **MANUALMENTE** por el usuario, ya que `psql` no está disponible en el entorno actual de Git Bash.

---

## Prerrequisitos

1. PostgreSQL 14+ instalado
2. Base de datos `coopesuma_db` creada
3. Usuario de PostgreSQL configurado (por defecto: `postgres`)
4. Contraseña del usuario conocida (desde `.env`: `Admin12345`)

---

## Opción 1: Ejecutar scripts desde línea de comandos (CMD/PowerShell)

### Paso 1: Abrir CMD o PowerShell como Administrador

### Paso 2: Navegar al directorio de scripts
```cmd
cd "C:\Users\kimco\OneDrive\Practica Profesional\Practica\coopesumaManagementSystem\database\scripts\phase_1"
```

### Paso 3: Ejecutar scripts en orden

```cmd
REM Script 1: Crear funciones
psql -U postgres -d coopesuma_db -f 01_create_functions.sql

REM Script 2: Crear tablas
psql -U postgres -d coopesuma_db -f 02_create_tables.sql

REM Script 3: Crear índices
psql -U postgres -d coopesuma_db -f 03_create_indexes.sql

REM Script 4: Crear triggers
psql -U postgres -d coopesuma_db -f 04_create_triggers.sql

REM Script 5: Seed inicial (usuario admin)
psql -U postgres -d coopesuma_db -f 05_seed_initial_data.sql

REM Script 6: Agregar columnas de Microsoft OAuth
psql -U postgres -d coopesuma_db -f 06_add_microsoft_oauth_columns.sql
```

### Paso 4: Verificar ejecución
```cmd
psql -U postgres -d coopesuma_db -c "\dt"
psql -U postgres -d coopesuma_db -c "SELECT * FROM users;"
```

---

## Opción 2: Ejecutar desde pgAdmin

### Paso 1: Abrir pgAdmin
1. Iniciar pgAdmin 4
2. Conectar al servidor PostgreSQL local

### Paso 2: Seleccionar base de datos
1. Expandir "Servers" → "PostgreSQL" → "Databases"
2. Click derecho en `coopesuma_db` → "Query Tool"

### Paso 3: Ejecutar cada script
Para cada archivo SQL (en orden):

1. Abrir el archivo en un editor de texto
2. Copiar todo el contenido
3. Pegarlo en el Query Tool de pgAdmin
4. Click en "Execute/Play" (▶️) o presionar F5
5. Verificar que la salida sea exitosa

**Orden de ejecución:**
1. `01_create_functions.sql`
2. `02_create_tables.sql`
3. `03_create_indexes.sql`
4. `04_create_triggers.sql`
5. `05_seed_initial_data.sql`
6. `06_add_microsoft_oauth_columns.sql`

### Paso 4: Verificar tablas creadas
Ejecutar en Query Tool:
```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Ver estructura de users
\d users;

-- Ver usuario admin creado
SELECT user_id, full_name, username, role, microsoft_id, email
FROM users;
```

---

## Opción 3: Ejecutar desde DBeaver/DataGrip

### Paso 1: Conectar a coopesuma_db
1. Abrir DBeaver/DataGrip
2. Crear/seleccionar conexión a PostgreSQL
3. Database: `coopesuma_db`
4. User: `postgres`
5. Password: `Admin12345`

### Paso 2: Abrir SQL Console

### Paso 3: Ejecutar scripts
Para cada script:
1. File → Open → Seleccionar script SQL
2. Ejecutar con Ctrl+Enter o botón "Execute"
3. Verificar resultados

**Orden de ejecución:**
1. `01_create_functions.sql`
2. `02_create_tables.sql`
3. `03_create_indexes.sql`
4. `04_create_triggers.sql`
5. `05_seed_initial_data.sql`
6. `06_add_microsoft_oauth_columns.sql`

---

## Verificación Final

Después de ejecutar todos los scripts, verificar:

### 1. Tablas creadas correctamente
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:**
- assemblies
- attendance_records
- members
- users

### 2. Funciones creadas
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public';
```

**Resultado esperado:**
- deactivate_other_assemblies
- update_updated_at_column

### 3. Triggers creados
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Resultado esperado:**
- ensure_single_active_assembly (assemblies)
- update_assemblies_updated_at (assemblies)
- update_members_updated_at (members)
- update_users_updated_at (users)

### 4. Usuario administrador creado
```sql
SELECT user_id, full_name, username, role, is_active, email, microsoft_id
FROM users;
```

**Resultado esperado:**
- user_id: 1
- full_name: Administrator
- username: admin
- role: administrator
- is_active: true
- email: NULL (se llenará con OAuth)
- microsoft_id: NULL (se llenará con OAuth)

### 5. Columnas de Microsoft OAuth añadidas
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Verificar que existan:**
- microsoft_id (VARCHAR, YES)
- email (VARCHAR, YES)
- password_hash (VARCHAR, YES) ← Ahora es nullable

---

## Rollback (En caso de error)

Si algo sale mal y necesitas empezar de nuevo:

```cmd
psql -U postgres -d coopesuma_db -f 99_rollback_phase1.sql
```

Luego volver a ejecutar los scripts desde el paso 1.

---

## Problemas Comunes

### 1. Error: "database does not exist"
**Solución:** Crear la base de datos primero:
```sql
CREATE DATABASE coopesuma_db
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';
```

### 2. Error: "permission denied"
**Solución:** Ejecutar como superusuario o otorgar permisos:
```sql
GRANT ALL PRIVILEGES ON DATABASE coopesuma_db TO postgres;
```

### 3. Error: "relation already exists"
**Solución:** Ejecutar rollback primero:
```cmd
psql -U postgres -d coopesuma_db -f 99_rollback_phase1.sql
```

### 4. Error: "password authentication failed"
**Solución:** Verificar contraseña en `.env` y actualizar comando:
```cmd
set PGPASSWORD=Admin12345
psql -U postgres -d coopesuma_db -f script.sql
```

---

## Siguiente Paso

Una vez ejecutados todos los scripts exitosamente, el backend podrá conectarse a la base de datos.

**Verificar conexión del backend:**
```cmd
cd backend
npm run dev
```

Deberías ver:
```
✅ Database connection test successful
🚀 Server started successfully
```

---

## Resumen de Scripts

| Script | Descripción | Estado |
|--------|-------------|--------|
| 01_create_functions.sql | Funciones comunes (update_updated_at, deactivate_other_assemblies) | ✅ |
| 02_create_tables.sql | Tablas (users, members, assemblies, attendance_records) | ✅ |
| 03_create_indexes.sql | Índices para optimización | ✅ |
| 04_create_triggers.sql | Triggers automáticos | ✅ |
| 05_seed_initial_data.sql | Usuario admin inicial | ✅ |
| 06_add_microsoft_oauth_columns.sql | Columnas para Microsoft OAuth | ✅ |

---

**¡Importante!** Marcar como completado después de ejecutar todos los scripts manualmente.
