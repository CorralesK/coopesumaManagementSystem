# Guía de Testing - CoopeSuma Backend API

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor

```bash
cd backend
npm run dev
```

El servidor estará disponible en: `http://localhost:5000`

### 2. Verificar Estado del Servidor

```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2025-01-11T18:46:56.827Z",
  "environment": "development"
}
```

## 📋 Testing por Módulo

### Módulo 1: Autenticación

#### 1.1 Login Tradicional (Fallback)

```bash
# Crear usuario de prueba primero (requiere admin token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

#### 1.2 Microsoft OAuth Flow

```bash
# Paso 1: Abrir en navegador
http://localhost:5000/api/auth/microsoft

# Paso 2: Después del login, serás redirigido con un token
# Copiar el token de la URL
```

#### 1.3 Obtener Usuario Actual

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Módulo 2: Members

#### 2.1 Crear Miembro

```bash
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "María González Pérez",
    "identification": "1-2345-6789",
    "grade": "5",
    "section": "A",
    "birthDate": "2010-05-15",
    "contactPhone": "8888-8888",
    "parentName": "Ana Pérez",
    "parentContact": "7777-7777",
    "address": "San Carlos, Alajuela"
  }'
```

#### 2.2 Listar Miembros

```bash
curl http://localhost:5000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2.3 Obtener Miembro por ID

```bash
curl http://localhost:5000/api/members/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2.4 Actualizar Miembro

```bash
curl -X PUT http://localhost:5000/api/members/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "María González Pérez Actualizada",
    "grade": "6"
  }'
```

#### 2.5 Obtener QR del Miembro

```bash
curl http://localhost:5000/api/members/1/qr \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2.6 Regenerar QR

```bash
curl -X POST http://localhost:5000/api/members/1/regenerate-qr \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2.7 Verificar QR

```bash
curl -X POST http://localhost:5000/api/members/verify-qr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrHash": "COOPESUMA-1-abc123def456"
  }'
```

### Módulo 3: Assemblies

#### 3.1 Crear Asamblea

```bash
curl -X POST http://localhost:5000/api/assemblies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Asamblea Mensual Enero 2025",
    "description": "Asamblea ordinaria del mes de enero",
    "scheduledDate": "2025-01-20",
    "startTime": "14:00:00",
    "endTime": "15:30:00",
    "location": "Salón Multiusos"
  }'
```

#### 3.2 Listar Asambleas

```bash
curl http://localhost:5000/api/assemblies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.3 Obtener Asamblea Activa

```bash
curl http://localhost:5000/api/assemblies/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.4 Activar Asamblea

```bash
curl -X POST http://localhost:5000/api/assemblies/1/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.5 Desactivar Asamblea

```bash
curl -X POST http://localhost:5000/api/assemblies/1/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Módulo 4: Attendance

#### 4.1 Registrar Asistencia por QR

```bash
# Asegúrate de tener una asamblea activa primero
curl -X POST http://localhost:5000/api/attendance/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrHash": "COOPESUMA-1-abc123def456"
  }'
```

#### 4.2 Registrar Asistencia Manual

```bash
curl -X POST http://localhost:5000/api/attendance/manual \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "notes": "Código QR dañado, registro manual"
  }'
```

#### 4.3 Listar Asistencias

```bash
curl "http://localhost:5000/api/attendance?assemblyId=1&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.4 Obtener Estadísticas de Asamblea

```bash
curl http://localhost:5000/api/attendance/assembly/1/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.5 Obtener Historial de Miembro

```bash
curl "http://localhost:5000/api/attendance/member/1/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.6 Eliminar Registro de Asistencia

```bash
curl -X DELETE http://localhost:5000/api/attendance/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Módulo 5: Users

#### 5.1 Listar Usuarios

```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5.2 Crear Usuario

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nuevo Registrador",
    "username": "registrador1",
    "password": "Registro123!",
    "email": "registrador1@escuela.ed.cr",
    "role": "registrar"
  }'
```

#### 5.3 Actualizar Usuario

```bash
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Registrador Actualizado"
  }'
```

#### 5.4 Desactivar Usuario

```bash
curl -X POST http://localhost:5000/api/users/2/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5.5 Activar Usuario

```bash
curl -X POST http://localhost:5000/api/users/2/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5.6 Cambiar Contraseña

```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }'
```

### Módulo 6: Reports

#### 6.1 Generar Reporte de Asistencia (PDF)

```bash
# Descarga el PDF
curl http://localhost:5000/api/reports/attendance/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o asistencia.pdf
```

#### 6.2 Generar Reporte de Estadísticas (PDF)

```bash
# Descarga el PDF
curl http://localhost:5000/api/reports/attendance-stats/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o estadisticas.pdf
```

#### 6.3 Obtener Estadísticas (JSON)

```bash
curl http://localhost:5000/api/reports/stats/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Pruebas de Validación

### Validación de Campos Requeridos

```bash
# Intentar crear miembro sin nombre (debe fallar)
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identification": "1-1111-1111"
  }'
```

### Validación de Duplicados

```bash
# Intentar crear miembro con identificación duplicada (debe fallar)
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test",
    "identification": "1-2345-6789",
    "grade": "5",
    "section": "A"
  }'
```

### Validación de Asistencia Duplicada

```bash
# Intentar registrar asistencia dos veces (debe fallar la segunda vez)
curl -X POST http://localhost:5000/api/attendance/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrHash": "COOPESUMA-1-abc123def456"
  }'
```

## 🧪 Flujo Completo de Testing

### Escenario: Registro de Asistencia a Asamblea

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' \
  | jq -r '.data.token')

# 2. Crear miembro
MEMBER_ID=$(curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "identification": "9-9999-9999",
    "grade": "5",
    "section": "A"
  }' | jq -r '.data.memberId')

# 3. Obtener QR del miembro
QR_HASH=$(curl http://localhost:5000/api/members/$MEMBER_ID/qr \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data.qrHash')

# 4. Crear asamblea
ASSEMBLY_ID=$(curl -X POST http://localhost:5000/api/assemblies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assembly",
    "scheduledDate": "2025-01-25",
    "startTime": "14:00:00",
    "endTime": "15:00:00"
  }' | jq -r '.data.assemblyId')

# 5. Activar asamblea
curl -X POST http://localhost:5000/api/assemblies/$ASSEMBLY_ID/activate \
  -H "Authorization: Bearer $TOKEN"

# 6. Registrar asistencia
curl -X POST http://localhost:5000/api/attendance/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"qrHash\":\"$QR_HASH\"}"

# 7. Ver estadísticas
curl http://localhost:5000/api/reports/stats/$ASSEMBLY_ID \
  -H "Authorization: Bearer $TOKEN"

# 8. Generar reporte PDF
curl http://localhost:5000/api/reports/attendance/$ASSEMBLY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -o test-report.pdf

echo "✅ Flujo completo ejecutado. Revisar test-report.pdf"
```

## 📊 Postman Collection

Para facilitar el testing, puedes importar esta colección en Postman:

1. Crear una nueva colección "CoopeSuma API"
2. Agregar variable de entorno `baseUrl`: `http://localhost:5000`
3. Agregar variable de entorno `token`: (se llenará después del login)
4. Importar los endpoints anteriores

## ✅ Checklist de Testing

### Autenticación
- [ ] Login tradicional funciona
- [ ] Microsoft OAuth funciona
- [ ] Token JWT es válido
- [ ] Middleware de autenticación bloquea sin token
- [ ] Middleware de roles funciona correctamente

### Members
- [ ] Crear miembro genera QR automáticamente
- [ ] No permite identificación duplicada
- [ ] Actualizar miembro funciona
- [ ] Desactivar miembro funciona (soft delete)
- [ ] Regenerar QR cambia el hash
- [ ] Verificar QR encuentra el miembro correcto

### Assemblies
- [ ] Crear asamblea funciona
- [ ] Solo una asamblea puede estar activa
- [ ] Activar asamblea desactiva las demás
- [ ] No se puede eliminar asamblea activa

### Attendance
- [ ] Requiere asamblea activa
- [ ] No permite asistencia duplicada
- [ ] Registro por QR funciona
- [ ] Registro manual funciona
- [ ] Estadísticas son correctas

### Users
- [ ] No se puede desactivar último admin
- [ ] Username debe ser único
- [ ] Cambiar contraseña valida la actual

### Reports
- [ ] PDF se genera correctamente
- [ ] Incluye espacios para firmas
- [ ] Estadísticas son correctas
- [ ] JSON stats coincide con PDF

## 🐛 Debugging

### Ver logs del servidor

Los logs se muestran en la consola donde iniciaste el servidor.

### Ver errores de base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres -d coopesuma_db

# Ver últimas inserciones
SELECT * FROM members ORDER BY created_at DESC LIMIT 5;
SELECT * FROM assemblies ORDER BY created_at DESC LIMIT 5;
SELECT * FROM attendance_records ORDER BY registered_at DESC LIMIT 5;
```

## 📝 Notas

- Todos los endpoints (excepto auth) requieren autenticación
- Los roles se validan según la especificación
- Los errores retornan códigos HTTP apropiados
- Las validaciones están implementadas con Joi
- Los reportes PDF se generan con PDFKit

---

**¡El backend está listo para testing!** 🎉
