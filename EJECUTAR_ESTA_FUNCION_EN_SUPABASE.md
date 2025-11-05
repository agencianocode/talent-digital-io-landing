# ⚠️ EJECUTAR ESTA FUNCIÓN EN SUPABASE URGENTE

## 🚨 Problema

Los talentos ya aparecen de nuevo en `/business-dashboard/talent-discovery`, pero los **badges de Academia NO funcionarán** hasta que ejecutes esta función SQL en Supabase.

## ✅ Solución: Ejecutar función RPC

### Paso 1: Ir a Supabase SQL Editor

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### Paso 2: Ejecutar este SQL

Copia y pega este código SQL completo:

```sql
-- Función RPC para obtener emails de usuarios por sus IDs
-- Esta función permite acceder a auth.users desde el cliente de manera segura

CREATE OR REPLACE FUNCTION get_user_emails_by_ids(user_ids UUID[])
RETURNS TABLE (user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email as email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails_by_ids(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_emails_by_ids(UUID[]) TO anon;
```

### Paso 3: Hacer clic en RUN

Presiona el botón **RUN** o `Ctrl+Enter` para ejecutar la función.

### Paso 4: Verificar

Deberías ver un mensaje de éxito: `Success. No rows returned`

## ✅ Resultado

Después de ejecutar esto:
- ✅ Los talentos seguirán apareciendo en talent-discovery
- ✅ Los badges de Academia ahora SÍ funcionarán
- ✅ Los nombres completos aparecerán en actividad de Academy Dashboard

## 🔍 ¿Qué hace esta función?

Esta función permite que el frontend acceda de forma **segura** a los emails almacenados en `auth.users`, que normalmente no son accesibles desde el cliente por razones de seguridad.

La función:
1. Recibe una lista de `user_ids`
2. Busca los emails correspondientes en `auth.users`
3. Devuelve `user_id` + `email` de forma segura

## 📁 Archivo SQL

También puedes encontrar el archivo SQL en:
`supabase/migrations/get_user_emails_by_ids.sql`

