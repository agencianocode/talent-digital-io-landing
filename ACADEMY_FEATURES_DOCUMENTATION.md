# 🎓 Sistema Completo de Academias - Documentación

## Resumen General

El sistema de academias ha sido implementado en 3 fases, proporcionando una solución completa para que academias y mentorías gestionen sus estudiantes, mejoren la empleabilidad y creen valor agregado para sus graduados.

---

## ✅ FASE 1: Fundamentos y Branding

### 1.1 Personalización de Marca (Academy Branding)

**Ubicación:** `/business-dashboard/academy` → Tab "Branding"

**Características:**
- ✅ Configuración de colores corporativos (primario y secundario)
- ✅ Lema/tagline personalizado de la academia
- ✅ Generación automática de slug único para URL pública
- ✅ Control de visibilidad del directorio público

**Componente:** `src/components/academy/AcademyBrandingSettings.tsx`

**Base de datos:**
- Campos agregados a `companies`:
  - `brand_color` (TEXT): Color principal
  - `secondary_color` (TEXT): Color secundario
  - `academy_tagline` (TEXT): Lema
  - `academy_slug` (TEXT UNIQUE): URL amigable
  - `public_directory_enabled` (BOOLEAN): Visibilidad del directorio

### 1.2 Badges de Certificación

**Características:**
- ✅ Badge visual "🎓 Certificado por [Academia X]"
- ✅ Usa colores de branding de la academia
- ✅ Muestra programa y fecha de certificación

**Componentes:**
- `src/components/academy/AcademyCertificationBadge.tsx`
- `src/components/academy/AcademyCertificationList.tsx`

**Base de datos:**
- Campo agregado a `talent_profiles`:
  - `academy_certifications` (JSONB): Array de certificaciones con estructura:
    ```json
    [{
      "academy_id": "uuid",
      "academy_name": "Nombre Academia",
      "certification_date": "2024-01-01",
      "program": "Desarrollo Web Full Stack",
      "badge_color": "#1976d2"
    }]
    ```

### 1.3 Página Pública del Directorio de Graduados

**URL:** `/academy/[slug]` (ej: `/academy/bootcamp-tech-2024`)

**Características:**
- ✅ Hero section con branding personalizado (logo, colores, tagline)
- ✅ Listado de graduados con fotos y ubicación
- ✅ Información de programas cursados
- ✅ Links a certificados de graduación
- ✅ Diseño responsive y profesional

**Componente:** `src/pages/PublicAcademyDirectory.tsx`

**Base de datos:**
- Función `generate_academy_slug()`: Auto-genera slug único al crear academia
- Función `get_public_academy_directory()`: Retorna graduados que optaron por aparecer (respeta privacidad)

### 1.4 Importación Masiva de Estudiantes (CSV)

**Ubicación:** `/business-dashboard/academy` → Tab "Estudiantes" → Botón "Importar CSV"

**Características:**
- ✅ Upload de archivo CSV con múltiples estudiantes
- ✅ Vista previa antes de importar
- ✅ Validación de emails en tiempo real
- ✅ Feedback visual de éxito/error por cada estudiante
- ✅ Programa por defecto configurable

**Formato CSV esperado:**
```
email,nombre,programa,fecha_ingreso
juan@email.com,Juan Pérez,Desarrollo Web,2024-01-01
maria@email.com,Maria López,Diseño UX,2024-01-15
```

**Componente:** `src/components/academy/BulkInviteModal.tsx`

### 1.5 Premium Automático para Graduados

**Características:**
- ✅ Al cambiar status a "graduated", se otorgan 3 meses de premium automáticamente
- ✅ Función `has_academy_premium(user_id)` para verificar acceso
- ✅ Campo `premium_until` en `academy_students`

**Base de datos:**
- Trigger `grant_graduate_premium_trigger`: Otorga premium al graduarse
- Función `has_academy_premium()`: Verifica si tiene premium activo

---

## ✅ FASE 2: Estadísticas y Tracking

### 2.1 Estadísticas de Empleabilidad

**Ubicación:** `/business-dashboard/academy` → Tab "Dashboard"

**Métricas mostradas:**
- ✅ Total de graduados
- ✅ Graduados empleados (aceptados/contratados)
- ✅ Tasa de empleo (%)
- ✅ Días promedio hasta contratación
- ✅ Total de aplicaciones
- ✅ Top 5 empresas que contratan graduados

**Componente:** `src/components/academy/AcademyEmployabilityStats.tsx`

### 2.2 Notificaciones Automáticas para Oportunidades Exclusivas

**Características:**
- ✅ Cuando se publica una oportunidad exclusiva (`is_academy_exclusive = true`), se notifica automáticamente a TODOS los graduados
- ✅ Notificación personalizada: "🎓 Oportunidad Exclusiva para Ti"
- ✅ Incluye título de la oportunidad y link directo
- ✅ Solo se envía cuando la oportunidad pasa a estado "active"

**Base de datos:**
- Función `notify_academy_graduates_exclusive_opportunity()`: Envía notificaciones
- Trigger `notify_graduates_exclusive_opportunity`: Se ejecuta al crear/actualizar oportunidad

### 2.3 Tracking de Aplicaciones de Graduados

**Ubicación:** `/business-dashboard/academy` → Tab "Actividad"

**Características:**
- ✅ Vista completa de todas las aplicaciones de graduados
- ✅ Muestra: graduado, programa, oportunidad, empresa, estado, fecha
- ✅ Estados visuales con colores (Pendiente, Entrevistando, Aceptado, etc.)
- ✅ Respeta configuración de privacidad del graduado
- ✅ Ordenado por fecha de aplicación (más recientes primero)

**Componente:** `src/components/academy/GraduateApplicationsTracking.tsx`

**Base de datos:**
- Función `get_academy_graduate_applications()`: Retorna aplicaciones respetando privacidad

### 2.4 Badges Visuales para Oportunidades Exclusivas

**Características:**
- ✅ Badge "🎓 Exclusiva para Graduados" con diseño distintivo
- ✅ Borde morado y fondo con degradado sutil
- ✅ Destacado visual en listados de oportunidades
- ✅ 3 variantes: small, medium, large
- ✅ Modo "prominent" para hero sections

**Componentes:**
- `src/components/opportunity/ExclusiveOpportunityBadge.tsx`
- `src/components/opportunity/ExclusiveOpportunityCard.tsx`
- `src/components/opportunity/OpportunityCardWithExclusive.tsx`

### 2.5 Mejoras en Dashboard de Oportunidades Exclusivas

**Ubicación:** `/business-dashboard/academy` → Tab "Oportunidades"

**Características:**
- ✅ Carga dinámica desde base de datos (no mock data)
- ✅ Contador de aplicaciones en tiempo real
- ✅ Navegación a edición y vista de aplicantes
- ✅ Diseño mejorado con badges exclusivos
- ✅ Estados visuales claros

**Componente actualizado:** `src/components/academy/ExclusiveOpportunities.tsx`

---

## ✅ FASE 3: Features Avanzados

### 3.1 Marketplace de Cursos de Academias

**Ubicación Admin:** `/business-dashboard/academy` → Tab "Cursos"
**Ubicación Pública:** `/talent-dashboard/marketplace` (sección superior)

**Características para Academias:**
- ✅ Publicar cursos en el marketplace
- ✅ Configurar: título, descripción, duración, precio, nivel, categoría
- ✅ Marcar cursos como "destacados" (aparecen en página principal)
- ✅ Activar/desactivar visibilidad de cursos
- ✅ Agregar link de inscripción
- ✅ Fecha de inicio y capacidad máxima
- ✅ Contador de estudiantes inscritos
- ✅ Tags personalizados

**Características para Talento:**
- ✅ Ver cursos destacados en marketplace
- ✅ Información completa: precio, duración, nivel
- ✅ Logo y nombre de la academia
- ✅ Botón directo para inscribirse
- ✅ Contador de estudiantes

**Componentes:**
- `src/components/academy/AcademyCoursesManager.tsx` (Admin)
- `src/components/marketplace/AcademyCoursesSection.tsx` (Público)

**Base de datos:**
- Tabla `academy_courses` creada con campos completos
- RLS policies configuradas
- Función `get_featured_academy_courses()`: Retorna cursos destacados

### 3.2 Sistema de Privacidad para Graduados

**Ubicación:** `/talent-dashboard/settings` → Tab "Academia"

**Configuraciones disponibles:**
- ✅ **Compartir Aplicaciones:** Academia puede ver oportunidades aplicadas y estados
- ✅ **Aparecer en Directorio Público:** Perfil visible en página pública de graduados
- ✅ **Compartir Progreso Profesional:** Academia ve estadísticas generales

**Respeto a la privacidad:**
- ✅ Directorio público solo muestra graduados con `show_in_directory = true`
- ✅ Tracking de aplicaciones solo incluye graduados con `share_applications = true`
- ✅ Valores por defecto: todo habilitado (opt-out)

**Componente:** `src/components/academy/GraduatePrivacySettings.tsx`

**Base de datos:**
- Campo `privacy_settings` (JSONB) agregado a `academy_students`:
  ```json
  {
    "share_progress": true,
    "show_in_directory": true,
    "share_applications": true
  }
  ```
- Función `graduate_shares_data()`: Verifica permisos de privacidad
- Funciones actualizadas para respetar configuración

### 3.3 Hook para Estado de Graduado

**Uso:**
```typescript
import { useAcademyGraduateStatus } from '@/hooks/useAcademyGraduateStatus';

const { 
  isGraduate, 
  academyName, 
  programName, 
  hasPremium, 
  premiumUntil,
  loading 
} = useAcademyGraduateStatus();
```

**Retorna:**
- `isGraduate`: Si el usuario es graduado de alguna academia
- `academyId`, `academyName`: Info de la academia
- `programName`: Programa cursado
- `graduationDate`: Fecha de graduación
- `hasPremium`: Si tiene acceso premium por graduación
- `premiumUntil`: Fecha hasta la cual tiene premium
- `certificateUrl`: URL del certificado

**Archivo:** `src/hooks/useAcademyGraduateStatus.ts`

---

## 🎯 Flujos Completos Implementados

### Flujo 1: Academia Crea su Presencia

1. Academia configura branding en tab "Branding"
2. Define colores, tagline y habilita directorio público
3. Se auto-genera slug único (ej: `bootcamp-tech-2024`)
4. Página pública disponible en `/academy/bootcamp-tech-2024`

### Flujo 2: Academia Importa Estudiantes

1. Academia va a tab "Estudiantes" → "Importar CSV"
2. Sube archivo con emails, nombres, programas
3. Vista previa y confirmación
4. Estudiantes quedan registrados con status "enrolled"

### Flujo 3: Estudiante se Gradúa

1. Academia cambia status a "graduated" en el panel
2. **Automáticamente:**
   - Se otorgan 3 meses de premium
   - Queda habilitado para directorio público (si configuración permite)
   - Puede recibir notificaciones de oportunidades exclusivas

### Flujo 4: Academia Publica Oportunidad Exclusiva

1. Academia crea oportunidad marcando `is_academy_exclusive = true`
2. Al activar la oportunidad:
   - **Automáticamente** se notifica a todos los graduados
   - Notificación: "🎓 Oportunidad Exclusiva para Ti"
3. Graduados ven la oportunidad destacada con badge especial
4. Academia puede ver aplicaciones en tab "Actividad"

### Flujo 5: Academia Publica Curso en Marketplace

1. Academia va a tab "Cursos" → "Nuevo Curso"
2. Completa formulario con detalles
3. Marca como "Destacado" si quiere visibilidad principal
4. Curso aparece en `/talent-dashboard/marketplace`
5. Talento puede ver y inscribirse directamente

### Flujo 6: Graduado Controla su Privacidad

1. Graduado va a `/talent-dashboard/settings` → Tab "Academia"
2. Configura qué datos comparte:
   - Aplicaciones y su estado
   - Aparecer en directorio público
   - Progreso profesional general
3. Academia solo ve datos según configuración del graduado

---

## 📊 Estadísticas y Métricas Disponibles

### Para Academia (Dashboard)

**Tab "Dashboard":**
- Total de graduados
- Tasa de empleo (%)
- Días promedio hasta contratación
- Total de aplicaciones de graduados
- Top 5 empresas contratando

**Tab "Actividad":**
- Listado completo de aplicaciones
- Estados actualizados
- Información de empresa y rol
- Filtros por programa

### Para Graduados

- Badge visible en su perfil
- Notificaciones de oportunidades exclusivas
- 3 meses de premium al graduarse
- Acceso prioritario a oportunidades

---

## 🎨 Componentes Creados

### Dashboard de Academia
- `AcademyBrandingSettings.tsx` - Configuración de marca
- `AcademyEmployabilityStats.tsx` - Estadísticas de empleo
- `GraduateApplicationsTracking.tsx` - Tracking de aplicaciones
- `AcademyCoursesManager.tsx` - Gestión de cursos
- `BulkInviteModal.tsx` - Importación CSV

### Público
- `PublicAcademyDirectory.tsx` - Página pública de graduados
- `AcademyCoursesSection.tsx` - Cursos en marketplace

### Badges y Visual
- `AcademyCertificationBadge.tsx` - Badge de certificación
- `ExclusiveOpportunityBadge.tsx` - Badge de oportunidad exclusiva
- `OpportunityCardWithExclusive.tsx` - Card con destacado exclusivo

### Configuración y Privacy
- `GraduatePrivacySettings.tsx` - Control de privacidad
- `useAcademyGraduateStatus.ts` - Hook para info de graduado
- `useAcademyInvitation.ts` - Hook para invitaciones (ya existía)

---

## 🔧 Funciones de Base de Datos

### Triggers Automáticos
1. `generate_academy_slug_trigger`: Auto-genera slug único
2. `grant_graduate_premium_trigger`: Otorga 3 meses premium al graduarse
3. `notify_graduates_exclusive_opportunity`: Notifica oportunidades exclusivas

### Funciones de Consulta
1. `has_academy_premium(user_id)`: Verifica si tiene premium por academia
2. `get_academy_graduate_applications(academy_id)`: Aplicaciones con privacidad
3. `get_public_academy_directory(academy_id)`: Directorio respetando privacidad
4. `get_featured_academy_courses(limit)`: Cursos destacados para marketplace
5. `graduate_shares_data(email, data_type)`: Verifica permisos de privacidad

---

## 🎁 Propuesta de Valor para Academias

### Lo que obtienen:

1. **Portal de Empleo Exclusivo (Gratis)**
   - Página personalizada con su branding
   - Directorio público de graduados
   - URL única para compartir

2. **Herramientas de Seguimiento**
   - Estadísticas de empleabilidad
   - Tracking de aplicaciones
   - Métricas de éxito por programa

3. **Visibilidad y Reconocimiento**
   - Badge "Certificado por [Academia]" en perfiles
   - Oportunidades exclusivas para sus graduados
   - Presencia en marketplace

4. **Marketplace de Cursos**
   - Publicar cursos con visibilidad destacada
   - Link directo a inscripciones
   - Tracking de interés

5. **Beneficios para Graduados**
   - 3 meses de premium automático
   - Acceso a oportunidades exclusivas
   - Notificaciones prioritarias

### Mensaje de Venta:

> "Creamos tu propio portal de empleo exclusivo para tus alumnos, gratis y sin que tengas que montar nada técnico. Obtén estadísticas reales de empleabilidad, publica oportunidades exclusivas y destaca tus cursos en nuestra plataforma."

---

## 🚀 Cómo Usar (Guía Rápida)

### Para Academias:

1. **Configurar Branding** → Tab "Branding"
   - Elige colores y tagline
   - Tu URL será generada automáticamente

2. **Importar Estudiantes** → Tab "Estudiantes"
   - Click "Importar CSV"
   - Sube archivo con formato correcto
   - Confirma importación

3. **Publicar Oportunidades Exclusivas** → Tab "Oportunidades"
   - Click "Agregar Oportunidad"
   - Marca checkbox "Exclusiva para graduados"
   - Al activarla, todos los graduados son notificados

4. **Ver Estadísticas** → Tab "Dashboard"
   - Tasa de empleo
   - Top empresas
   - Progreso de graduados

5. **Publicar Cursos** → Tab "Cursos"
   - Click "Nuevo Curso"
   - Completa información
   - Marca "Destacado" para visibilidad principal

### Para Graduados:

1. **Ver Badge en Perfil**
   - Aparece automáticamente si academy_certifications está configurado

2. **Configurar Privacidad** → `/talent-dashboard/settings` → Tab "Academia"
   - Elige qué compartir con tu academia
   - Controla visibilidad en directorio

3. **Acceder a Oportunidades Exclusivas**
   - Recibes notificación cuando se publican
   - Badge especial en listados
   - Acceso prioritario

4. **Ver Cursos de Academias** → `/talent-dashboard/marketplace`
   - Cursos destacados en sección superior
   - Inscripción directa con un click

---

## 📈 Próximas Mejoras Sugeridas

1. **Auto-agregar certificación al perfil del talento** al graduarse
2. **Email template** específico para oportunidades exclusivas
3. **Estadísticas de salarios** para graduados (si datos públicos)
4. **Filtro por academia** en búsqueda de talento para empresas
5. **API pública** del directorio de graduados
6. **Widgets embebibles** para web de la academia
7. **Certificados digitales** verificables con blockchain
8. **Sistema de referidos** para que graduados inviten a otros

---

## 🔐 Seguridad y Privacidad

### Implementado:
- ✅ RLS en todas las tablas nuevas
- ✅ Respeto a configuración de privacidad del graduado
- ✅ Security definer con search_path en funciones
- ✅ Validación de permisos en queries
- ✅ Datos sensibles protegidos

### Configuraciones de Privacidad:
- Por defecto, todo habilitado (share_progress, show_in_directory, share_applications)
- Graduado puede deshabilitar cualquier opción
- Academia solo ve lo que graduado permite

---

## 🎨 Diseño y UX

### Paleta de Colores para Academia:
- **Branding personalizable:** Cada academia define sus colores
- **Badges exclusivos:** Morado (#9333ea) para oportunidades exclusivas
- **Badges de certificación:** Usa color de branding de la academia
- **Degradados suaves:** Purple-blue para elementos premium

### Componentes UI Nuevos:
- Progress bar (Radix UI)
- Table component (shadcn)
- Badges especializados
- Cards con efectos hover
- Diseño responsive en todo

---

## 📝 Notas Técnicas

### Nuevas Tablas:
1. `academy_courses` - Cursos de academias

### Campos Nuevos en Tablas Existentes:

**companies:**
- `brand_color`, `secondary_color`, `academy_tagline`, `academy_slug`, `public_directory_enabled`

**academy_students:**
- `premium_until`, `certificate_url`, `privacy_settings`

**talent_profiles:**
- `academy_certifications`

### Índices Creados:
- `idx_companies_academy_slug`: Búsqueda rápida por slug
- `idx_academy_students_premium`: Graduados con premium
- `idx_academy_courses_active`: Cursos activos
- `idx_academy_courses_featured`: Cursos destacados

---

## ✅ Estado Final: TODAS LAS FASES COMPLETADAS

- ✅ **Fase 1:** Branding, badges, directorio público, importación CSV
- ✅ **Fase 2:** Estadísticas, notificaciones, tracking, badges visuales
- ✅ **Fase 3:** Marketplace cursos, sistema privacidad, hooks avanzados

**🎉 Sistema completo de academias listo para producción!**
