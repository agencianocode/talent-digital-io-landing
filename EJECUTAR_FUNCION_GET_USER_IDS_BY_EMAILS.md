# ⚠️ EJECUTAR ESTA FUNCIÓN EN SUPABASE

## 🚨 Problema

En `/business-dashboard/academy`:
- ❌ Carlos Martinez aparece como `mipiy41446@fergetic.com` en lugar de su nombre
- ❌ No se ven las fotos de perfil de los estudiantes

## ✅ Solución: Ejecutar función RPC

### Paso 1: Ir a Supabase SQL Editor

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Ejecutar este SQL

```sql
-- Primero eliminar la función existente (si ya existe)
DROP FUNCTION IF EXISTS get_user_ids_by_emails(TEXT[]);

-- Crear la función con el nuevo tipo de retorno
CREATE OR REPLACE FUNCTION get_user_ids_by_emails(user_emails TEXT[])
RETURNS TABLE (
  email VARCHAR,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email as email,
    au.id as user_id,
    p.full_name as full_name,
    p.avatar_url as avatar_url
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  WHERE au.email = ANY(user_emails);
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_ids_by_emails(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_ids_by_emails(TEXT[]) TO anon;
```

### Paso 3: Hacer clic en RUN

Presiona **RUN** o `Ctrl+Enter`.

### Paso 4: Verificar que funciona

Ejecuta esta query de prueba:

```sql
SELECT * 
FROM get_user_ids_by_emails(
  ARRAY['mipiy41446@fergetic.com', 'nomod53729@filipx.com']
);
```

**Deberías ver:**
```
email                      | user_id      | full_name      | avatar_url
mipiy41446@fergetic.com   | 790140ba...  | Carlos Martinez| https://...
nomod53729@filipx.com     | b57fab0a...  | Milena Cano    | https://...
```

## ✅ Resultado después de ejecutar:

1. ✅ **Carlos Martinez** aparecerá con su nombre completo (no solo email)
2. ✅ **Las fotos de perfil** de los estudiantes se verán en el directorio
3. ✅ **Dashboard de actividad** mostrará nombres completos

## 📁 Archivo SQL

`supabase/migrations/get_user_ids_by_emails.sql`

