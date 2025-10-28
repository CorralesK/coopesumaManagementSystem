# Phase 1 Database Scripts - CoopeSuma Management System

Scripts SQL para la creación de la base de datos de **Phase 1: Control de Asistencia**

---

## 📋 Contenido

Este directorio contiene los scripts SQL divididos por función:

1. **01_create_functions.sql** - Funciones de utilidad
2. **02_create_tables.sql** - Tablas principales
3. **03_create_indexes.sql** - Índices para optimización
4. **04_create_triggers.sql** - Triggers para automatización
5. **05_seed_data.sql** - Datos de prueba (opcional)
6. **99_rollback.sql** - Rollback completo (elimina todo)

---

## 🚀 Instalación

### Pre-requisitos

- PostgreSQL 14+
- Usuario con permisos de creación de tablas
- Base de datos `cooplinkcr` creada

### Paso 1: Crear la base de datos (si no existe)

```bash
# Opción A: Usando createdb (recomendado)
createdb cooplinkcr

# Opción B: Usando psql
psql -U postgres -c "CREATE DATABASE cooplinkcr WITH ENCODING='UTF8';"
```

### Paso 2: Ejecutar scripts en orden

```bash
cd database/scripts/phase_1

# Ejecutar cada script en orden
psql -U postgres -d cooplinkcr -f 01_create_functions.sql
psql -U postgres -d cooplinkcr -f 02_create_tables.sql
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql

# Opcional: Solo para testing/desarrollo
psql -U postgres -d cooplinkcr -f 05_seed_data.sql
```

### Paso 3: Verificar instalación

```bash
# Conectar a la base de datos
psql -U postgres -d cooplinkcr

# Verificar tablas
\dt

# Verificar funciones
\df

# Verificar triggers
\dg

# Salir
\q
```

---

## 📁 Descripción de Scripts

### 01_create_functions.sql

**Funciones creadas:**
- `update_updated_at_column()` - Actualiza automáticamente el campo `updated_at`
- `deactivate_other_assemblies()` - Garantiza solo una asamblea activa

### 02_create_tables.sql

**Tablas creadas:**
- `users` - Usuarios del sistema (Microsoft OAuth)
- `members` - Miembros estudiantes de la cooperativa
- `assemblies` - Asambleas mensuales
- `attendance_records` - Registros de asistencia

**Características importantes:**
- Constraints de integridad referencial
- Check constraints para validación de datos
- Unique constraints para evitar duplicados
- Foreign keys con cascadas apropiadas

### 03_create_indexes.sql

**Índices creados:** 22 en total
- **users**: 4 índices (email, microsoft_id, role, is_active)
- **members**: 5 índices (identification, qr_hash, grade+section, is_active, full_name)
- **assemblies**: 4 índices (scheduled_date, is_active, single_active, created_by)
- **attendance_records**: 5 índices (member_id, assembly_id, registered_at, registered_by, method)

**Índice especial:**
- `idx_assemblies_single_active` - Índice único parcial que garantiza a nivel de base de datos que solo una asamblea puede estar activa

### 04_create_triggers.sql

**Triggers creados:** 4 en total
- `update_users_updated_at` - Auto-actualiza updated_at en users
- `update_members_updated_at` - Auto-actualiza updated_at en members
- `update_assemblies_updated_at` - Auto-actualiza updated_at en assemblies
- `ensure_single_active_assembly` - **CRÍTICO**: Desactiva otras asambleas al activar una nueva

### 05_seed_data.sql (Opcional)

**Datos de prueba insertados:**
- 3 usuarios (administrator, registrar, treasurer)
- 19 miembros (18 activos, 1 inactivo)
  - Distribuidos en grados 1-6 y secciones A-B
- 4 asambleas (1 activa, 3 inactivas)
- 20 registros de asistencia

**⚠️ IMPORTANTE:** Solo usar en desarrollo/testing, NO en producción.

### 99_rollback.sql

Script de rollback completo que elimina:
- Todas las tablas
- Todos los índices
- Todos los triggers
- Todas las funciones

**⚠️ ADVERTENCIA:** Este script es DESTRUCTIVO y elimina TODOS LOS DATOS de forma IRREVERSIBLE.

---

## 🔧 Comandos Útiles

### Ejecutar todos los scripts en una línea

```bash
# Con datos de prueba
psql -U postgres -d cooplinkcr -f 01_create_functions.sql && \
psql -U postgres -d cooplinkcr -f 02_create_tables.sql && \
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql && \
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql && \
psql -U postgres -d cooplinkcr -f 05_seed_data.sql

# Sin datos de prueba (producción)
psql -U postgres -d cooplinkcr -f 01_create_functions.sql && \
psql -U postgres -d cooplinkcr -f 02_create_tables.sql && \
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql && \
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql
```

### Rollback y recreación

```bash
# Eliminar todo
psql -U postgres -d cooplinkcr -f 99_rollback.sql

# Recrear estructura
psql -U postgres -d cooplinkcr -f 01_create_functions.sql && \
psql -U postgres -d cooplinkcr -f 02_create_tables.sql && \
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql && \
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql
```

---

## ✅ Checklist de Verificación

Después de ejecutar los scripts, verificar:

- [ ] Todas las funciones creadas (2)
- [ ] Todas las tablas creadas (4)
- [ ] Todos los índices creados (22)
- [ ] Todos los triggers creados (4)
- [ ] Constraints funcionando correctamente
- [ ] Solo una asamblea puede estar activa
- [ ] No se pueden registrar miembros duplicados en una asamblea
- [ ] Timestamps updated_at se actualizan automáticamente
- [ ] Foreign keys previenen registros huérfanos

### Comandos de verificación

```sql
-- Verificar funciones
SELECT proname, pronargs FROM pg_proc WHERE proname LIKE '%update%' OR proname LIKE '%deactivate%';

-- Verificar tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar índices
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Verificar triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Verificar constraint de asamblea única activa
SELECT COUNT(*) FROM assemblies WHERE is_active = true;  -- Debe ser 0 o 1
```

---

## 🚨 Reglas de Negocio Implementadas

### 1. Solo una asamblea activa
- Implementado con índice único parcial + trigger
- Cuando se activa una asamblea, todas las demás se desactivan automáticamente

### 2. Asistencia única por miembro/asamblea
- Implementado con constraint UNIQUE (member_id, assembly_id)
- Un miembro solo puede registrar asistencia una vez por asamblea

### 3. Usuarios solo por Microsoft OAuth
- Tabla users NO tiene campo password_hash
- Autenticación únicamente por Microsoft Azure AD

### 4. Soft Deletes
- Miembros y usuarios usan flag is_active
- No se eliminan registros físicamente, solo se desactivan

---

## 📝 Notas Importantes

1. **Orden de ejecución**: Los scripts DEBEN ejecutarse en orden numérico (01, 02, 03, 04, 05)

2. **Datos de prueba**: El script 05_seed_data.sql es OPCIONAL y solo debe usarse en desarrollo

3. **Producción**: En producción, los usuarios se crean automáticamente al autenticarse con Microsoft OAuth

4. **Backup**: Siempre hacer backup antes de ejecutar 99_rollback.sql

5. **Encoding**: La base de datos debe usar UTF-8 encoding

6. **Timezone**: Todos los timestamps se almacenan en UTC

---

## 🔗 Estructura de Base de Datos

### Diagrama de Relaciones

```
users
  ↓
  ├─→ assemblies (created_by)
  ├─→ attendance_records (registered_by)

members
  ↓
  └─→ attendance_records (member_id)

assemblies
  ↓
  └─→ attendance_records (assembly_id)
```

### Tablas y Campos Clave

**users**
- PK: `user_id`
- UK: `email`, `microsoft_id`

**members**
- PK: `member_id`
- UK: `identification`, `qr_hash`

**assemblies**
- PK: `assembly_id`
- FK: `created_by` → users(user_id)

**attendance_records**
- PK: `attendance_id`
- FK: `member_id` → members(member_id)
- FK: `assembly_id` → assemblies(assembly_id)
- FK: `registered_by` → users(user_id)
- UK: (member_id, assembly_id)

---

## 🆘 Troubleshooting

### Error: "database does not exist"
```bash
# Crear la base de datos primero
createdb cooplinkcr
```

### Error: "relation already exists"
```bash
# Ejecutar rollback primero
psql -U postgres -d cooplinkcr -f 99_rollback.sql
```

### Error: "permission denied"
```bash
# Asegurarse de tener permisos
psql -U postgres -d postgres
GRANT ALL PRIVILEGES ON DATABASE cooplinkcr TO your_user;
```

### Error: "function does not exist" al crear triggers
```bash
# Ejecutar 01_create_functions.sql primero
psql -U postgres -d cooplinkcr -f 01_create_functions.sql
```

---

## 📚 Recursos Adicionales

- [Documentación completa del proyecto](../../../docs/specs/01_database_specification.md)
- [Convenciones del proyecto](../../../docs/specs/conventions.md)
- [Contexto del proyecto](../../../docs/specs/00_project_context.md)

---

**Desarrollado con ❤️ para CoopeSuma**
