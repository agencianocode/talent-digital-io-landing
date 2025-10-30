# Guía de Pruebas - Sistema de Academia

## Implementación Completa ✅

Se ha completado la implementación del plan completo para el sistema de Academia. A continuación se detalla todo lo implementado y cómo probarlo.

---

## 📋 Resumen de Cambios Implementados

### ✅ FASE 1: URLs y Enlaces Públicos

**Archivos Modificados:**
- `src/components/academy/PublicDirectory.tsx`
  - URLs corregidas para usar `window.location.origin` y academy_slug
  - Función `handleViewPublic` implementada con validación de slug
  - Conexión con datos reales de graduados via RPC `get_public_academy_directory`

- `src/components/academy/AcademyBrandingSettings.tsx`
  - URL de vista previa corregida para usar `window.location.origin`

**URLs Generadas:**
- Directorio público: `{origin}/academy/{academy_slug}`
- Invitación activos: `{origin}/accept-academy-invitation?academy={id}&status=enrolled`
- Invitación graduados: `{origin}/accept-academy-invitation?academy={id}&status=graduated`

### ✅ FASE 2: Botones del Header

**Archivo Creado:**
- `src/components/academy/ShareAcademyModal.tsx`
  - Modal completo con 3 tabs: Directorio, Activos, Graduados
  - Función de copiar al portapapeles
  - Enlaces generados dinámicamente

**Archivo Modificado:**
- `src/pages/AcademyDashboard.tsx`
  - Botón "Compartir" ahora abre ShareAcademyModal
  - Botón "Configuración" navega a tab de branding
  - Botón "Invitar Estudiantes" mantiene funcionalidad

### ✅ FASE 3: Sistema de Invitaciones

**Archivo Creado:**
- `src/pages/AcceptAcademyInvitation.tsx`
  - Maneja invitaciones para usuarios autenticados y no autenticados
  - Inserta registro en `academy_students` automáticamente
  - Guarda invitación pendiente en localStorage si no está autenticado
  - Redirige a dashboard de talento después de aceptar

**Archivo Modificado:**
- `src/components/academy/InvitationManager.tsx`
  - Conectado con base de datos real
  - Función `handleSendInvitations` inserta en `academy_students`
  - Lista de invitaciones carga desde base de datos
  - Función `handleCancelInvitation` elimina estudiantes
  - URLs corregidas para usar `/accept-academy-invitation`

**Rutas Agregadas:**
- `/accept-academy-invitation` en `src/App.tsx`

### ✅ FASE 4: Datos Reales

**Conexiones Implementadas:**
- `PublicDirectory`: Usa RPC `get_public_academy_directory`
- `InvitationManager`: Lee de `academy_students` table
- `StudentDirectory`: Ya usaba datos reales via `useAcademyData`

---

## 🧪 Plan de Pruebas

### 1. Configuración Inicial de Academia

#### Paso 1.1: Crear Academia
```
1. Navegar a /register-academy
2. Completar formulario de registro
3. Verificar email
4. Completar onboarding si es necesario
```

#### Paso 1.2: Configurar Branding
```
1. Ir a /business-dashboard/academy
2. Click en tab "Branding"
3. Configurar:
   - Color principal
   - Color secundario
   - Lema de la academia
   - Slug (ej: "mi-academia")
   - Habilitar directorio público
4. Guardar cambios
```

### 2. Sistema de Invitaciones

#### Paso 2.1: Invitación por Link (Estudiante Activo)
```
1. En /business-dashboard/academy
2. Click en tab "Invitaciones"
3. En la sección "Links de Invitación"
4. Tab "Estudiante Activo"
5. Copiar el link
6. Compartir link con estudiante

ESTUDIANTE:
7. Abrir link en navegador
8. Si no está autenticado:
   - Ver información de la academia
   - Click en "Registrarme como Talento"
   - Completar registro
   - Automáticamente se une a la academia
9. Si está autenticado:
   - Automáticamente se procesa la invitación
   - Redirige a /talent-dashboard
```

#### Paso 2.2: Invitación por Link (Graduado)
```
Similar al 2.1 pero usar tab "Graduado"
El estudiante será marcado como "graduated" en lugar de "enrolled"
```

#### Paso 2.3: Invitación por Email
```
1. En tab "Invitaciones"
2. En "Enviar Invitaciones por Email"
3. Ingresar emails (uno por línea o separados por comas):
   estudiante1@example.com
   estudiante2@example.com
4. (Opcional) Agregar mensaje personalizado
5. Click "Enviar Invitaciones"
6. Verificar que aparezcan en la lista de "Estudiantes Invitados"
```

#### Paso 2.4: Cancelar Invitación
```
1. En lista de "Estudiantes Invitados"
2. Para un estudiante con status "Activo"
3. Click en botón "Eliminar"
4. Confirmar eliminación
5. Verificar que desaparece de la lista
```

### 3. Directorio Público

#### Paso 3.1: Configurar Directorio
```
1. Ir a tab "Directorio"
2. Configurar:
   - Toggle "Mostrar logo de la academia"
   - Toggle "Mostrar descripción de la academia"
3. Ver vista previa del directorio
```

#### Paso 3.2: Acceder al Directorio Público
```
1. Click en botón "Ver Público" o "Copiar Link"
2. Abrir link en navegador (puede ser incógnito)
3. Verificar que muestra:
   - Logo (si está habilitado)
   - Descripción (si está habilitada)
   - Lista de graduados
```

#### Paso 3.3: Graduado en Directorio
```
REQUISITOS para aparecer en directorio público:
- Status = 'graduated'
- Privacy setting: show_in_directory = true (default)

Para cambiar un estudiante a graduado:
1. En tab "Estudiantes"
2. Buscar estudiante activo
3. [Funcionalidad por implementar: cambiar status a graduated]

ALTERNATIVA: Usar invitación de graduado directamente
```

### 4. Compartir Academia

#### Paso 4.1: Usar Modal de Compartir
```
1. En /business-dashboard/academy
2. Click en botón "Compartir" (header)
3. Ver 3 tabs disponibles:
   - Directorio: Link público del directorio
   - Activos: Link de invitación para estudiantes activos
   - Graduados: Link de invitación para graduados
4. Copiar cualquier link
5. Verificar toast de confirmación
```

#### Paso 4.2: Abrir en Nueva Pestaña
```
1. En modal de compartir, tab "Directorio"
2. Click en "Abrir en nueva pestaña"
3. Verificar que abre correctamente
```

### 5. Verificación de Datos

#### Paso 5.1: Verificar en Base de Datos
```sql
-- Ver estudiantes de una academia
SELECT * FROM academy_students 
WHERE academy_id = 'tu-academy-id'
ORDER BY created_at DESC;

-- Ver graduados públicos
SELECT * FROM get_public_academy_directory('tu-academy-id');

-- Ver configuración de academia
SELECT 
  name,
  academy_slug,
  brand_color,
  secondary_color,
  academy_tagline,
  public_directory_enabled,
  directory_settings
FROM companies 
WHERE id = 'tu-academy-id';
```

### 6. Flujos Completos

#### Flujo 6.1: Estudiante Activo → Graduado → Directorio Público
```
1. Crear invitación de estudiante activo
2. Estudiante acepta invitación
3. Verificar aparece en tab "Estudiantes"
4. [Cambiar status a graduated - por implementar UI]
5. Verificar aparece en Directorio Público
```

#### Flujo 6.2: Graduado Directo
```
1. Crear invitación de graduado
2. Estudiante acepta invitación
3. Verificar aparece directamente como graduado
4. Verificar aparece en Directorio Público
```

---

## 🚨 Problemas Conocidos y Soluciones

### Problema 1: Academy Slug No Configurado
**Síntoma:** Error al ver directorio público o compartir
**Solución:** 
1. Ir a tab "Branding"
2. Configurar el campo "URL del Directorio Público"
3. Guardar cambios

### Problema 2: Directorio Público Vacío
**Síntoma:** No aparecen graduados en directorio público
**Posibles causas:**
- No hay estudiantes con status "graduated"
- Privacy settings: show_in_directory = false
- public_directory_enabled = false en la academia

**Solución:**
1. Verificar configuración en tab "Branding"
2. Verificar estudiantes en tab "Estudiantes"
3. Verificar privacy settings de graduados

### Problema 3: Invitación No Funciona
**Síntoma:** Al abrir link de invitación, no pasa nada
**Solución:**
1. Verificar que el link incluye el academyId correcto
2. Verificar que la academia existe en la base de datos
3. Si es estudiante no autenticado, debe registrarse primero

---

## 📊 Métricas y Estadísticas

Las estadísticas en el dashboard muestran:
- **Estudiantes**: Número total de estudiantes activos
- **Invitaciones**: Número de estudiantes en la base de datos (todos)
- **Aplicaciones**: Por implementar
- **Oportunidades**: Oportunidades exclusivas de la academia

---

## 🔐 Seguridad y Permisos

### RLS Policies Requeridas
```sql
-- academy_students table
- Owners can manage students
- Students can view their own data

-- companies table (academies)
- Public can read basic info for directory
- Owners can update settings
```

---

## 🎯 Próximos Pasos Sugeridos

### Alta Prioridad
1. **UI para cambiar status de estudiante**: Botón en StudentDirectory para cambiar de "enrolled" → "graduated"
2. **Email notifications**: Enviar emails cuando se crean invitaciones
3. **Verificación de emails**: Validar que emails sean válidos antes de agregar

### Media Prioridad
1. **Bulk upload mejorado**: CSV import con validación
2. **Certificados**: Generar y subir certificados para graduados
3. **Analytics**: Tracking de clicks en directorio público

### Baja Prioridad
1. **Personalización avanzada**: Más opciones de branding
2. **Exportación**: Exportar lista de estudiantes a CSV
3. **Integración con LMS**: Sincronizar con plataformas de aprendizaje

---

## 📝 Notas Adicionales

- Todos los enlaces generados son dinámicos y se actualizan automáticamente
- Los datos se sincronizan en tiempo real con la base de datos
- El sistema es compatible con múltiples academias (multi-tenant)
- La privacidad de graduados se respeta automáticamente
- El directorio público solo muestra graduados que han dado permiso

---

## 🔗 Enlaces Útiles

- Dashboard de Academia: `/business-dashboard/academy`
- Directorio Público: `/academy/{academy_slug}`
- Aceptar Invitación: `/accept-academy-invitation?academy={id}&status={status}`
- Documentación de Features: `ACADEMY_FEATURES_DOCUMENTATION.md`
