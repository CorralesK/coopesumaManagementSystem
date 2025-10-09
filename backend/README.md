# CoopeSuma Backend API

Backend API para el Sistema de Gestión Cooperativa CoopeSuma

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus valores
nano .env
```

## Configuración

Editar `.env` con los valores correctos para tu entorno:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=coopesuma_db
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=24h

# Bcrypt
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

## Base de Datos

Antes de iniciar el servidor, asegúrate de tener la base de datos configurada:

```bash
# Crear base de datos
createdb coopesuma_db

# Ejecutar scripts SQL en orden
cd ../database/scripts/phase_1
psql -U postgres -d coopesuma_db -f 01_create_functions.sql
psql -U postgres -d coopesuma_db -f 02_create_tables.sql
psql -U postgres -d coopesuma_db -f 03_create_indexes.sql
psql -U postgres -d coopesuma_db -f 04_create_triggers.sql
psql -U postgres -d coopesuma_db -f 05_seed_initial_data.sql
```

## Scripts Disponibles

```bash
npm start        # Iniciar en producción
npm run dev      # Iniciar en desarrollo (con nodemon)
npm test         # Ejecutar tests
npm run lint     # Verificar código
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (database, environment, CORS)
│   ├── constants/       # Constantes (roles, errorCodes, messages)
│   ├── middlewares/     # Middlewares (auth, validation, errorHandler)
│   ├── modules/         # Módulos por funcionalidad
│   │   ├── auth/        # Autenticación
│   │   ├── members/     # Gestión de miembros
│   │   ├── assemblies/  # Gestión de asambleas
│   │   ├── attendance/  # Control de asistencia
│   │   ├── users/       # Gestión de usuarios
│   │   └── reports/     # Generación de reportes
│   ├── utils/           # Utilidades (JWT, password, QR, logger)
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── tests/
│   ├── unit/            # Tests unitarios
│   └── integration/     # Tests de integración
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── package.json         # Dependencias y scripts
└── README.md            # Este archivo
```

## Arquitectura de Módulos

Cada módulo sigue una arquitectura de 3 capas:

1. **Controller** (`*Controller.js`): Maneja requests HTTP
2. **Service** (`*Service.js`): Contiene lógica de negocio
3. **Repository** (`*Repository.js`): Interactúa con la base de datos

Adicionalmente:
- **Routes** (`*Routes.js`): Define las rutas del módulo
- **Validation** (`*Validation.js`): Esquemas de validación con Joi

## API Endpoints

### Health Check
```
GET /health
```

### Autenticación (Próximamente)
```
POST /api/auth/login
POST /api/auth/logout
```

### Módulos (En desarrollo)
Los endpoints de los módulos se documentarán aquí conforme se implementen.

## Respuestas de la API

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Mensaje en español",
  "data": { ... }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Mensaje de error en español",
  "error": "ERROR_CODE",
  "details": { ... }
}
```

## Manejo de Errores

El sistema incluye manejo global de errores que captura:
- Errores operacionales (esperados)
- Errores de base de datos
- Errores de JWT
- Errores de validación

## Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación mediante JWT
- CORS configurado
- Helmet para headers de seguridad
- Validación de entrada con Joi
- Rate limiting (pendiente de implementar)

## Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm test -- --coverage

# Ejecutar tests en modo watch
npm test -- --watch
```

## Desarrollo

### Agregar un Nuevo Módulo

1. Crear carpeta en `src/modules/nombre-modulo/`
2. Crear archivos:
   - `nombreModuloController.js`
   - `nombreModuloService.js`
   - `nombreModuloRepository.js`
   - `nombreModuloRoutes.js`
   - `nombreModuloValidation.js`
3. Registrar rutas en `src/app.js`

### Convenciones de Código

- **Nombres técnicos**: Inglés
- **Mensajes de usuario**: Español
- **Archivos/funciones**: camelCase
- **Clases**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Database**: snake_case

## Variables de Entorno Requeridas

En producción, asegúrate de configurar:
- `JWT_SECRET`: Clave secreta para JWT
- `DATABASE_PASSWORD`: Contraseña de la base de datos
- `NODE_ENV`: Debe ser "production"
- `CORS_ORIGIN`: Origen del frontend en producción

## Troubleshooting

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `coopesuma_db` exista

### Error al iniciar el servidor
- Verifica que el puerto 5000 esté disponible
- Verifica que todas las dependencias estén instaladas
- Revisa los logs para más detalles

### Error de JWT
- Verifica que `JWT_SECRET` esté configurado en `.env`
- Verifica que el token no haya expirado

## Licencia

ISC

## Autor

Kimberly Corrales - Proyecto de Graduación UTN 2025