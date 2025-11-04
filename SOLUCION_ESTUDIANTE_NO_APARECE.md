# Problema: Estudiante Graduado No Aparece en Dashboard de Academia

## Resumen del Problema

**Estudiante:** wewoted570@fergetic.com  
**Academia ID:** 1a36ae8f-d716-4cb1-a9f6-e09b804ce30d  
**Link usado:** https://app.talentodigital.io/accept-academy-invitation?academy=1a36ae8f-d716-4cb1-a9f6-e09b804ce30d&status=graduated  
**Síntoma:** El estudiante se registró pero no aparece en `/business-dashboard/academy`

## Flujo Esperado

1. **Usuario hace clic en el link de invitación** → Va a `/accept-academy-invitation?academy={id}&status=graduated`
2. **Si no está autenticado** → Se le pide que se registre como talento o inicie sesión
3. **Después de autenticarse** → El componente `AcceptAcademyInvitation` automáticamente:
   - Verifica que el usuario tiene un perfil de talento
   - Inserta un registro en la tabla `academy_students` con:
     - `academy_id`: ID de la academia
     - `student_email`: Email del usuario autenticado
     - `student_name`: Nombre completo o email
     - `status`: `'graduated'` (según el parámetro del link)
     - `enrollment_date`: Fecha actual
     - `graduation_date`: Fecha actual (solo para graduados)
4. **Redirige a `/talent-dashboard`**

## Posibles Causas

### 🔍 Causa 1: El estudiante no completó el proceso de registro
**Síntoma:** No existe registro en `academy_students`

**Posibles razones:**
- El estudiante no confirmó su email
- El estudiante cerró la pestaña antes de que se procesara la invitación
- Error de JavaScript en el navegador que interrumpió el proceso
- El estudiante no tenía un perfil de talento al momento del registro

**Verificar:**
```sql
-- ¿Existe en auth.users?
SELECT * FROM auth.users WHERE email = 'wewoted570@fergetic.com';

-- ¿Tiene perfil de talento?
SELECT tp.* FROM talent_profiles tp
JOIN auth.users au ON tp.user_id = au.id
WHERE au.email = 'wewoted570@fergetic.com';

-- ¿Se creó el registro en academy_students?
SELECT * FROM academy_students 
WHERE student_email = 'wewoted570@fergetic.com';
```

### 🔍 Causa 2: El registro existe pero con datos incorrectos
**Síntoma:** Existe en `academy_students` pero no se muestra en el dashboard

**Posibles razones:**
- El `academy_id` no coincide
- El `status` está mal escrito (ej: "Graduated" en vez de "graduated")
- El registro fue eliminado accidentalmente

**Verificar:**
```sql
SELECT * FROM academy_students 
WHERE student_email = 'wewoted570@fergetic.com';
```

### 🔍 Causa 3: Problema de permisos RLS (Row Level Security)
**Síntoma:** El registro existe pero no es visible para el usuario de la academia

**Posibles razones:**
- Las políticas RLS de `academy_students` no permiten que el administrador vea el registro
- El usuario no tiene los permisos correctos en `company_user_roles`

**Verificar:**
```sql
-- Ver políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'academy_students';

-- Ver roles del usuario administrador
SELECT * FROM company_user_roles 
WHERE company_id = '1a36ae8f-d716-4cb1-a9f6-e09b804ce30d';
```

## Pasos de Diagnóstico

### 1. Ejecutar el script de diagnóstico

Ejecuta el archivo `DIAGNOSTICO_ESTUDIANTE_ACADEMIA.sql` en Supabase SQL Editor para obtener información completa del problema.

### 2. Revisar los resultados

#### ✅ Si el estudiante NO existe en `academy_students`:
→ Usa **SOLUCIÓN A** (crear el registro manualmente)

#### ✅ Si el estudiante existe pero con status incorrecto:
→ Usa **SOLUCIÓN B** (actualizar el status)

#### ✅ Si el estudiante no tiene perfil de talento:
→ Usa **SOLUCIÓN C** (crear perfil de talento) y luego **SOLUCIÓN A**

## Soluciones

### SOLUCIÓN A: Crear el registro manualmente

```sql
INSERT INTO academy_students (
    academy_id,
    student_email,
    student_name,
    status,
    enrollment_date,
    graduation_date
)
SELECT 
    '1a36ae8f-d716-4cb1-a9f6-e09b804ce30d'::uuid,
    'wewoted570@fergetic.com',
    COALESCE(raw_user_meta_data->>'full_name', 'wewoted570@fergetic.com'),
    'graduated',
    CURRENT_DATE,
    CURRENT_DATE
FROM auth.users
WHERE email = 'wewoted570@fergetic.com'
  AND NOT EXISTS (
    SELECT 1 FROM academy_students 
    WHERE student_email = 'wewoted570@fergetic.com' 
      AND academy_id = '1a36ae8f-d716-4cb1-a9f6-e09b804ce30d'
  );
```

### SOLUCIÓN B: Actualizar el status

```sql
UPDATE academy_students
SET 
    status = 'graduated',
    graduation_date = CURRENT_DATE
WHERE student_email = 'wewoted570@fergetic.com'
  AND academy_id = '1a36ae8f-d716-4cb1-a9f6-e09b804ce30d';
```

### SOLUCIÓN C: Crear perfil de talento

```sql
INSERT INTO talent_profiles (user_id)
SELECT id FROM auth.users 
WHERE email = 'wewoted570@fergetic.com'
  AND NOT EXISTS (
    SELECT 1 FROM talent_profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users WHERE email = 'wewoted570@fergetic.com'
    )
  );
```

## Prevención Futura

### Mejorar el componente AcceptAcademyInvitation

Para evitar que esto vuelva a suceder, se podría mejorar el componente para:

1. **Mostrar mensajes de error más claros** si algo falla
2. **Verificar la inserción antes de redirigir**
3. **Registrar logs** de los errores que ocurran
4. **Crear el perfil de talento automáticamente** si no existe
5. **Enviar notificación** al administrador cuando un estudiante se une

### Código sugerido para mejora:

```typescript
// En AcceptAcademyInvitation.tsx, línea 103-115
const { error: insertError } = await supabase
  .from('academy_students')
  .insert({
    academy_id: academyId,
    student_email: user.email,
    student_name: user.user_metadata?.full_name || user.email,
    status: status === 'graduated' ? 'graduated' : 'enrolled',
    enrollment_date: new Date().toISOString().split('T')[0],
    ...(status === 'graduated' && {
      graduation_date: new Date().toISOString().split('T')[0]
    })
  });

if (insertError) {
  console.error('Error detallado al insertar estudiante:', insertError);
  throw insertError;
}

// AGREGAR VERIFICACIÓN:
const { data: verifyStudent } = await supabase
  .from('academy_students')
  .select('id')
  .eq('academy_id', academyId)
  .eq('student_email', user.email)
  .single();

if (!verifyStudent) {
  throw new Error('No se pudo verificar la creación del registro');
}
```

## Contacto

Si el problema persiste después de ejecutar las soluciones, verifica:
- Los logs del navegador (Console)
- Los logs de Supabase (Database > Logs)
- Las políticas RLS de la tabla `academy_students`

