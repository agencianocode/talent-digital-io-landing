# Verificar y Fix Edge Function admin-delete-user

## Problema
No se pueden eliminar usuarios desde `/admin`

## Causa Probable
1. Edge Function `admin-delete-user` no está desplegada
2. Error en CORS
3. Permisos insuficientes

## Solución

### PASO 1: Verificar si la función está desplegada

```bash
# En terminal de Supabase
supabase functions list
```

Debe aparecer: `admin-delete-user`

### PASO 2: Desplegar la función

```bash
# Desde la raíz del proyecto
supabase functions deploy admin-delete-user
```

### PASO 3: Verificar que funciona

En Supabase Dashboard:
1. Ve a **Edge Functions**
2. Busca `admin-delete-user`
3. Verifica que esté "deployed" y "active"

### PASO 4: Si sigue sin funcionar, revisar logs

```bash
supabase functions logs admin-delete-user
```

## Alternativa: Eliminar desde SQL

Si la Edge Function no funciona, puedes eliminar usuarios directamente desde SQL:

```sql
-- PRECAUCIÓN: Esto elimina PERMANENTEMENTE al usuario

-- Paso 1: Ver datos del usuario
SELECT id, email, created_at
FROM auth.users
WHERE email = 'lowis15854@bialode.com';

-- Paso 2: Eliminar datos relacionados (opcional, se puede hacer manualmente)
-- Nota: Las tablas con ON DELETE CASCADE se limpiarán automáticamente

-- Paso 3: Eliminar usuario
-- IMPORTANTE: Esto requiere permisos de Service Role
DELETE FROM auth.users
WHERE email = 'lowis15854@bialode.com';
```

## Verificar CORS

La Edge Function tiene configurado:
```typescript
'Access-Control-Allow-Origin': 'https://app.talentodigital.io'
```

Si estás en desarrollo local (localhost), necesitas agregar:
```typescript
'Access-Control-Allow-Origin': '*' // Solo para desarrollo
```

