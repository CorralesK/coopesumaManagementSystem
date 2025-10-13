# CoopeSuma Management System

Sistema de Control de Asistencia y Gestión Cooperativa Estudiantil

---

## Información del Proyecto

**Nombre**: SISTEMA DE CONTROL DE ASISTENCIA Y GESTIÓN COOPERATIVA ESTUDIANTIL - COOPESUMA

**Contexto Académico**: Proyecto Final de Graduación para optar por el grado de Bachiller en Ingeniería del Software

**Universidad**: Universidad Técnica Nacional, Sede San Carlos

**Estudiante**: Kimberly Stacy Corrales Vega

**Período**: Septiembre - Diciembre 2025

---

## Descripción

CoopeSuma es una cooperativa estudiantil de primaria respaldada por la entidad financiera Coocique. Este sistema digitaliza y moderniza los principales procesos de la cooperativa, incluyendo:

1. **Control de Asistencia** (Fase 1): Registro rápido mediante códigos QR en asambleas mensuales
2. **Gestión de Ahorros** (Fase 2): Administración de depósitos, retiros y consulta de saldos
3. **Sistema de Votaciones** (Fase 3 - Opcional): Votaciones electrónicas internas

---

## Tecnologías

### Frontend
- React.js 19+ con Vite 7
- React Router DOM 7
- Tailwind CSS 4
- Axios para comunicación HTTP
- PropTypes para validación

### Backend
- Node.js 18+ con Express
- PostgreSQL 14+
- JWT para autenticación
- Bcrypt para encriptación

### Herramientas
- Git / GitHub
- jsPDF / SheetJS para reportes
- Render / Railway para despliegue

---

## Estructura del Proyecto

```
coopesumaManagementSystem/
├── frontend/           # Aplicación React PWA
├── backend/            # API REST con Node.js
├── database/           # Scripts SQL
├── docs/               # Documentación completa
│   ├── specs/         # Especificaciones técnicas
│   ├── weekly_reports/ # Bitácoras semanales
│   └── ...
├── .gitignore
└── README.md
```

---

## Documentación Importante

### Para Desarrolladores / IA

**DEBE LEER ESTOS DOCUMENTOS ANTES DE ESCRIBIR CÓDIGO:**

1. **[docs/specs/00_project_context.md](docs/specs/00_project_context.md)**
   - Contexto completo del proyecto
   - Arquitectura del sistema
   - Plan de desarrollo por fases
   - Reglas de negocio críticas

2. **[docs/specs/conventions.md](docs/specs/conventions.md)**
   - Convenciones de nombres
   - Estándares de código
   - Patrones de diseño
   - Buenas prácticas

3. **[docs/specs/01_database_specification.md](docs/specs/01_database_specification.md)**
   - Esquema completo de base de datos
   - Reglas de integridad
   - Scripts de creación

### Documentación por Módulo

Cada módulo tiene su propio documento de especificación en `docs/specs/`:
- `02_auth_module_spec.md` - Autenticación
- `03_members_module_spec.md` - Gestión de Miembros
- `04_assemblies_module_spec.md` - Gestión de Asambleas
- `05_attendance_module_spec.md` - Control de Asistencia
- `06_users_module_spec.md` - Gestión de Usuarios
- `07_reports_module_spec.md` - Generación de Reportes

---

## Configuración Inicial

### Pre-requisitos

```bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# Git
git --version
```

### Clonar Repositorio

```bash
git clone <repository-url>
cd coopesumaManagementSystem
```

### Configurar Base de Datos

```bash
# 1. Crear base de datos
createdb coopesuma_db

# 2. Ejecutar scripts en orden
cd database/scripts/phase_1
psql -d coopesuma_db -f 01_create_functions.sql
psql -d coopesuma_db -f 02_create_tables.sql
psql -d coopesuma_db -f 03_create_indexes.sql
psql -d coopesuma_db -f 04_create_triggers.sql
psql -d coopesuma_db -f 05_seed_initial_data.sql
```

### Configurar Backend

```bash
cd backend
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus valores
nano .env
```

### Configurar Frontend

```bash
cd frontend
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus valores
nano .env
```

---

## Ejecución en Desarrollo

### Backend
```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# Aplicación corriendo en http://localhost:5173
```

---

## Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/coopesuma_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CoopeSuma
```

---

## Roles y Permisos

| Funcionalidad | Administrador | Registrador | Tesorera |
|---------------|---------------|-------------|----------|
| Iniciar/cerrar asamblea | ✅ | ❌ | ❌ |
| Escanear QR | ✅ | ✅ | ❌ |
| Administrar miembros | ✅ | ❌ | ❌ |
| Administrar usuarios | ✅ | ❌ | ❌ |
| Generar reportes | ✅ | ❌ | ❌ |
| Gestionar ahorros | ✅ | ❌ | ✅ |

---

## Desarrollo por Fases

### Fase 1: Control de Asistencia (Semanas 1-10)
- ✅ Base de datos
- ✅ Autenticación (Microsoft OAuth 2.0)
- ✅ Gestión de miembros (CRUD + QR codes)
- 🔄 Gestión de asambleas
- 🔄 Registro de asistencia (QR scanner)
- 🔄 Reportes PDF

### Fase 2: Gestión de Ahorros (Semanas 11-14)
- ⏳ Transacciones de ahorro
- ⏳ Consulta de saldos
- ⏳ Reportes de ahorros
- ⏳ Migración de datos Excel

### Fase 3: Votaciones (Opcional - Futuro)
- ⏳ Sistema de votaciones
- ⏳ Gestión de propuestas
- ⏳ Resultados en tiempo real

---

## Scripts Disponibles

### Backend
```bash
npm start        # Producción
npm run dev      # Desarrollo con nodemon
npm test         # Ejecutar tests
npm run lint     # Verificar código
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm test         # Ejecutar tests
npm run lint     # Verificar código
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

## Despliegue

### Preparación
1. Completar variables de entorno de producción
2. Ejecutar build del frontend: `npm run build`
3. Configurar base de datos en Railway/Render
4. Ejecutar scripts SQL en base de datos de producción

### Railway / Render
Seguir la guía en `docs/guides/deployment_guide.md`

---

## Contribución

### Workflow de Git

1. Crear rama feature
```bash
git checkout -b feature/module-name
```

2. Hacer commits descriptivos
```bash
git commit -m "feat(members): add QR generation"
```

3. Push y crear Pull Request
```bash
git push origin feature/module-name
```

### Convenciones de Commits

```
feat(scope): descripción     # Nueva funcionalidad
fix(scope): descripción      # Corrección de bug
docs(scope): descripción     # Cambios en documentación
refactor(scope): descripción # Refactorización
test(scope): descripción     # Agregar tests
```

---

## Reglas Críticas del Proyecto

### Para Desarrolladores y Asistentes IA:

1. **LEER DOCUMENTACIÓN PRIMERO**: Siempre revisar `docs/specs/` antes de escribir código
2. **Inglés para código**: Variables, funciones, clases, archivos
3. **Español para usuarios**: Mensajes de error, UI, notificaciones
4. **Database-first**: Escribir scripts SQL, NO usar migraciones ORM
5. **Backend primero**: Completar lógica backend antes de frontend
6. **Módulo por módulo**: No intentar hacer todo a la vez
7. **Nunca localStorage**: Usar React state o sesiones backend
8. **Documentar cambios**: Actualizar `development_log.md` después de cada cambio significativo

---

## Autenticación

El sistema utiliza **Microsoft OAuth 2.0** exclusivamente. No hay login tradicional con usuario/contraseña.

### Usuarios Autorizados

Los usuarios autorizados se configuran en `backend/src/config/authorizedUsers.js`:

```javascript
{
  email: 'kicorralesve@est.utn.ac.cr',
  role: 'administrator',
  fullName: 'Kimberly Corrales'
}
```

Solo los emails en esta whitelist pueden autenticarse en el sistema.

---

## Soporte y Contacto

Para preguntas sobre el proyecto:
- Revisar documentación en `docs/`
- Consultar especificaciones en `docs/specs/`
- Ver bitácoras en `docs/weekly_reports/`

---

## Licencia

Este proyecto es desarrollado como Proyecto Final de Graduación para la Universidad Técnica Nacional.

---

## Estado del Proyecto

**Última actualización**: Octubre 2025

**Fase actual**: Fase 1 - Desarrollo de Control de Asistencia

**Progreso**: 40% (Base de datos + Autenticación + Módulo Members completo)

---

## Checklist de Configuración

Para verificar que todo está configurado correctamente:

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado y corriendo
- [ ] Base de datos `coopesuma_db` creada
- [ ] Scripts SQL ejecutados exitosamente
- [ ] Backend `.env` configurado
- [ ] Frontend `.env` configurado
- [ ] Dependencias de backend instaladas (`npm install`)
- [ ] Dependencias de frontend instaladas (`npm install`)
- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 5173
- [ ] Usuario admin puede hacer login
- [ ] Documentación leída y comprendida

---

**Desarrollado con ❤️ para CoopeSuma**