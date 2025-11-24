# 🔄 Script de Migración de Datos - CoopeSuma

Script profesional para migrar datos históricos de CoopeSuma desde archivos Excel a PostgreSQL.

## 📋 Descripción

Este script migra tres tipos de datos históricos:
1. **Miembros** - Lista de asociados con información de afiliación
2. **Ahorros** - Transacciones mensuales de ahorro (Feb-Dic 2025)
3. **Aportaciones** - Transacciones anuales de capital social (2022-2025)

## 📁 Estructura del Proyecto

```
migration/
├── migrate.js              # Script principal de migración
├── test-connection.js      # Prueba de conexión a base de datos
├── package.json
├── .env.example            # Ejemplo de configuración
├── README.md
│
├── config/
│   └── database.js         # Configuración de PostgreSQL
│
├── readers/
│   ├── members.reader.js        # Lee archivo de miembros
│   ├── savings.reader.js        # Lee archivo de ahorros
│   └── contributions.reader.js  # Lee archivo de aportaciones
│
├── services/
│   ├── member.service.js        # Operaciones de miembros
│   ├── account.service.js       # Operaciones de cuentas
│   └── transaction.service.js   # Operaciones de transacciones
│
├── utils/
│   ├── normalizer.js       # Normalización de datos
│   ├── validator.js        # Validación de datos
│   └── logger.js           # Utilidades de logging
│
└── data/                   # Carpeta para archivos Excel
    ├── Lista_asociados__madre_y_depurada__2025.xlsx
    ├── CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx
    └── Registro_de_Aportaciones_2022_al_2025_CORREGIDO_LISTO_IMPRIMIR.xlsm
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd migration
npm install
```

### 2. Configurar Variables de Entorno

Copiar el archivo de ejemplo y editarlo con tus credenciales:

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Base de datos (usar las MISMAS credenciales del proyecto principal)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cooplinkcr
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password_aqui

# ID del admin que ejecuta la migración
ADMIN_USER_ID=1

# ID de la cooperativa
COOPERATIVE_ID=1

# Modo de ejecución
DRY_RUN=false
SKIP_VALIDATION=false

# Rutas de archivos Excel
EXCEL_MEMBERS=./data/Lista_asociados__madre_y_depurada__2025.xlsx
EXCEL_SAVINGS=./data/CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx
EXCEL_CONTRIBUTIONS=./data/Registro_de_Aportaciones_2022_al_2025_CORREGIDO_LISTO_IMPRIMIR.xlsm
```

### 3. Colocar Archivos Excel

Crear la carpeta `data` y copiar los 3 archivos Excel:

```bash
mkdir data
# Copiar los archivos Excel a la carpeta data/
```

### 4. Verificar Conexión

Probar que la conexión a la base de datos funciona correctamente:

```bash
npm run test:connection
```

Esto verificará:
- ✅ Conexión a PostgreSQL exitosa
- ✅ Tablas necesarias existen
- ✅ Cooperativa existe
- ✅ Usuario administrador existe

## 📊 Uso del Script

### Modo DRY RUN (Recomendado Primero)

Ejecutar en modo de prueba SIN guardar datos:

```bash
npm run migrate:dry
```

O con variable de entorno:

```bash
DRY_RUN=true node migrate.js
```

**Beneficios del DRY RUN:**
- ✅ Lee y procesa todos los archivos Excel
- ✅ Valida todos los datos
- ✅ Simula la inserción en la base de datos
- ✅ Genera reporte completo
- ❌ NO guarda nada (hace ROLLBACK)

### Migración Real

Una vez verificado el DRY RUN, ejecutar la migración real:

```bash
npm run migrate
```

O directamente:

```bash
node migrate.js
```

## 🔍 Proceso de Migración

El script ejecuta las siguientes fases:

### **FASE 1: Lectura de Archivos Excel**
- Lee los 3 archivos Excel
- Normaliza datos (identificaciones, fechas, montos)
- Reporta filas leídas y omitidas

### **FASE 2: Validación de Datos**
- Valida identificaciones únicas
- Valida formatos de fechas
- Valida montos positivos
- Genera reporte de errores y advertencias

### **FASE 3: Migración a Base de Datos**
1. **Inserta miembros** en tabla `members`
2. **Crea cuentas** (ahorros y aportaciones) en tabla `accounts`
3. **Inserta ahorros** en tabla `transactions`
4. **Inserta aportaciones** en tabla `transactions`

### **FASE 4: Finalización**
- **DRY RUN**: Hace ROLLBACK (no guarda nada)
- **Normal**: Hace COMMIT (guarda todo)

### **FASE 5: Verificación y Resumen**
- Muestra saldos por tipo de cuenta
- Genera reporte final con estadísticas

## 📈 Ejemplo de Salida

```
================================================================================
🚀 INICIANDO MIGRACIÓN DE DATOS - COOPESUMA
================================================================================

Configuración:
  Cooperative ID: 1
  Admin User ID: 1
  DRY RUN: true
  Skip Validation: false

================================================================================
📖 FASE 1: LECTURA DE ARCHIVOS EXCEL
================================================================================

📖 Leyendo archivo de miembros...
ℹ️  Encontradas 120 filas en Excel
✅ 118 miembros procesados correctamente
⚠️  2 filas omitidas

📖 Leyendo archivo de ahorros...
ℹ️  Procesando hoja: FEBRERO
ℹ️  Procesando hoja: MARZO
...
✅ 856 transacciones de ahorro procesadas

📖 Leyendo archivo de aportaciones...
ℹ️  Procesando hoja: APORT. 2022 (Año fiscal: 2022)
...
✅ 354 transacciones de aportaciones procesadas

✅ Archivos leídos correctamente:
   Miembros: 118
   Transacciones de ahorro: 856
   Transacciones de aportaciones: 354

================================================================================
✅ FASE 2: VALIDACIÓN DE DATOS
================================================================================

✅ Miembros: Sin errores
✅ Ahorros: Sin errores
✅ Aportaciones: Sin errores

================================================================================
💾 FASE 3: MIGRACIÓN A BASE DE DATOS
================================================================================

💾 Insertando miembros en la base de datos...
Insertando miembros: ████████████████████████████████████████████████ 100% (118/118)
✅ 118 miembros insertados correctamente

🏦 Creando cuentas para los miembros...
Creando cuentas: ████████████████████████████████████████████████ 100% (118/118)
✅ 236 cuentas creadas correctamente

💰 Insertando transacciones de ahorros...
Insertando ahorros: ████████████████████████████████████████████████ 100% (856/856)
✅ 856 transacciones de ahorro insertadas

📊 Insertando transacciones de aportaciones...
Insertando aportaciones: ████████████████████████████████████████████████ 100% (354/354)
✅ 354 transacciones de aportaciones insertadas

================================================================================
🔒 FASE 4: FINALIZACIÓN
================================================================================

⚠️  DRY RUN: Transacción revertida - Nada fue guardado

================================================================================
📊 RESUMEN DE MIGRACIÓN
================================================================================

✅ DATOS INSERTADOS:
   Miembros:              118 registros
   Cuentas creadas:       236 cuentas
   Ahorros:               856 transacciones
   Aportaciones:          354 transacciones
   Total transacciones:   1210

✅ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!

⚠️  Recuerda: Esto fue un DRY RUN. Para guardar los datos, ejecuta:
   node migrate.js
```

## ⚠️ Consideraciones Importantes

### ANTES de Ejecutar la Migración

1. **HACER RESPALDO** completo de la base de datos:
   ```bash
   pg_dump -U postgres cooplinkcr > backup_antes_migracion.sql
   ```

2. **Verificar que existe:**
   - Al menos una cooperativa en la tabla `cooperatives`
   - Al menos un usuario administrador en la tabla `users`

3. **SIEMPRE ejecutar primero en DRY_RUN**

### DESPUÉS de la Migración

1. **Verificar datos en la base de datos:**
   ```sql
   -- Contar miembros
   SELECT COUNT(*) FROM members;

   -- Contar cuentas por tipo
   SELECT account_type, COUNT(*)
   FROM accounts
   GROUP BY account_type;

   -- Verificar transacciones
   SELECT transaction_type, COUNT(*), SUM(amount)
   FROM transactions
   GROUP BY transaction_type;

   -- Ver saldos
   SELECT m.full_name, a.account_type, a.current_balance
   FROM members m
   JOIN accounts a ON m.member_id = a.member_id
   WHERE a.current_balance > 0
   ORDER BY m.full_name, a.account_type;
   ```

2. **Asignar datos faltantes manualmente:**
   - Grados de los miembros (campo `grade`)
   - Correos institucionales (campo `institutional_email`)

3. **Verificar saldos** contra archivos Excel originales

4. **NO ejecutar el script dos veces** (verificar duplicados)

## 🐛 Solución de Problemas

### Error: "No cooperatives found"

Crear una cooperativa primero:
```sql
INSERT INTO schools (name) VALUES ('Escuela Ejemplo');
INSERT INTO cooperatives (school_id, trade_name, legal_name)
VALUES (1, 'CoopeSuma', 'Cooperativa de Ahorro y Crédito CoopeSuma R.L.');
```

### Error: "No admin users found"

Crear un usuario administrador:
```sql
INSERT INTO users (cooperative_id, full_name, email, role)
VALUES (1, 'Admin Migration', 'admin@example.com', 'administrator');
```

### Error: "Identificación duplicada"

Revisar el archivo Excel de miembros y eliminar duplicados.

### Error: "Connection timeout"

Verificar que PostgreSQL está corriendo y las credenciales son correctas.

## 📝 Datos Procesados

### Normalizaciones Aplicadas

#### Identificaciones
```javascript
// Input:  205750128.0 (float de Excel)
// Output: "2-0575-0128"
```

#### Fechas
```javascript
// Input:  2022-03-22 00:00:00 (datetime de Excel)
// Output: "2022-03-22" (ISO string)
```

#### Nombres
```javascript
// Input:  "JUAN PÉREZ LÓPEZ"
// Output: "Juan Pérez López"
```

#### Montos
```javascript
// Input:  "1500.5"
// Output: 1500.50 (rounded to 2 decimals)
```

### Año Fiscal

El año fiscal se calcula automáticamente según la fecha:
- **Oct-Dic**: Año fiscal = año actual
- **Ene-Sep**: Año fiscal = año anterior

Ejemplos:
- `2024-10-15` → Año fiscal: 2024
- `2025-03-15` → Año fiscal: 2024
- `2025-10-15` → Año fiscal: 2025

## 🔐 Seguridad

- Todas las operaciones se ejecutan dentro de una **transacción SQL**
- Si ocurre cualquier error, se hace **ROLLBACK** automático
- Las contraseñas nunca se registran en logs
- Los QR hashes se generan de forma segura con SHA-256

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs detallados en la consola
2. Verifica el reporte de validación
3. Ejecuta en modo DRY_RUN para depurar
4. Revisa que los archivos Excel tienen el formato esperado

## 📄 Licencia

Este script es parte del proyecto CoopeSuma Management System.

---

**Desarrollado por**: CoopeSuma Team
**Versión**: 1.0.0
**Última actualización**: 2025
