# 📁 Carpeta de Datos - Archivos Excel

## Instrucciones

Colocar los 3 archivos Excel en esta carpeta antes de ejecutar la migración:

### 1. Lista de Asociados
**Nombre del archivo**: `Lista_asociados__madre_y_depurada__2025.xlsx`

**Contenido**:
- Hoja: "LISTA DE ASOCIADOS"
- ~120 miembros
- Datos: Código, nombre, identificación, género, fecha de ingreso

### 2. Control de Ahorros
**Nombre del archivo**: `CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx`

**Contenido**:
- Hojas mensuales: FEBRERO, MARZO, ABRIL, MAYO, JUNIO, JULIO, AGOSTO, SETIEMBRE, OCTUBRE, NOVIEMBRE, DICIEMBRE
- ~800-900 transacciones de ahorro
- Datos: Código de asociado, múltiples depósitos por mes

### 3. Registro de Aportaciones
**Nombre del archivo**: `Registro_de_Aportaciones_2022_al_2025_CORREGIDO_LISTO_IMPRIMIR.xlsm`

**Contenido**:
- Hojas: APORT. 2022, APORT. 2023, APORT. 2024, APORT. 2025
- ~300-400 transacciones de aportaciones
- Datos: Código de asociado, 3 tractos por año con montos y fechas

## ⚠️ Importante

- **NO** renombrar los archivos
- **NO** modificar la estructura interna de las hojas
- **NO** subir estos archivos a Git (están en .gitignore por seguridad)
- Asegurarse de que los archivos estén completos y sin errores

## 🔒 Seguridad

Esta carpeta está excluida de Git mediante `.gitignore` para proteger los datos sensibles de los miembros.

---

Una vez colocados los archivos, ejecutar:
```bash
npm run test:connection  # Verificar conexión
npm run migrate:dry      # Migración en modo prueba
npm run migrate          # Migración real
```
