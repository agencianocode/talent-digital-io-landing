# 🔧 Normalizar Roles de Talentos - Solución Completa

## 📋 Problema
Los usuarios registrados como talentos tienen rol `'talent'` en lugar de `'freemium_talent'`, causando que no aparezcan en el filtro "Talento Freemium" en `/admin`.

---

## ✅ Solución en 2 pasos

### **PASO 1: Actualizar roles existentes**

Ejecuta este SQL en **Supabase SQL Editor**:

```sql
-- Actualizar todos los usuarios con rol 'talent' a 'freemium_talent'
UPDATE user_roles
SET role = 'freemium_talent'
WHERE role = 'talent';

-- Actualizar todos los usuarios con rol 'business' a 'freemium_business'
UPDATE user_roles
SET role = 'freemium_business'
WHERE role = 'business';

-- Verificar el resultado
SELECT 
  au.email,
  p.full_name,
  ur.role
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
WHERE ur.role IN ('freemium_talent', 'freemium_business')
ORDER BY p.created_at DESC
LIMIT 20;
```

---

### **PASO 2: Actualizar el trigger para nuevos registros**

Ejecuta este SQL en **Supabase SQL Editor** (ya actualizado en el archivo del proyecto):

```sql
-- Actualizar función del trigger para asignar roles correctos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_type TEXT;
BEGIN
  -- Get user_type from metadata or default to 'talent'
  user_type := COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'talent');
  
  -- Log for debugging
  RAISE NOTICE 'Creating user with type: %', user_type;
  
  -- Insert into profiles first
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert role based on user_type, ensuring it's a valid enum value
  IF user_type = 'business' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'freemium_business'::user_role)
    ON CONFLICT (user_id) DO UPDATE SET role = 'freemium_business'::user_role;
    
    RAISE NOTICE 'Assigned freemium_business role to user: %', NEW.id;
  ELSE
    -- Default to freemium_talent for any other case (talentos)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'freemium_talent'::user_role)
    ON CONFLICT (user_id) DO UPDATE SET role = 'freemium_talent'::user_role;
    
    RAISE NOTICE 'Assigned freemium_talent role to user: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 Resultado

### **Usuarios existentes:**
- ✅ Todos los roles `'talent'` → `'freemium_talent'`
- ✅ Todos los roles `'business'` → `'freemium_business'`
- ✅ Ahora aparecen correctamente en filtros de `/admin`

### **Nuevos registros:**
- ✅ Talentos se registran directamente con `'freemium_talent'`
- ✅ Empresas se registran directamente con `'freemium_business'`
- ✅ No más conversiones necesarias

---

## ✨ Beneficios

1. ✅ **Consistencia:** BD y frontend usan los mismos nombres de roles
2. ✅ **Filtros funcionan:** Todos los talentos freemium ahora aparecen
3. ✅ **Menos bugs:** No más mapeos confusos
4. ✅ **Claridad:** Los roles son explícitos

---

## 📝 Orden de ejecución

1. **Ejecutar PASO 1** (actualizar roles existentes)
2. **Ejecutar PASO 2** (actualizar trigger)
3. **Verificar** que los nuevos registros tengan `'freemium_talent'`
4. **Commit y push** del código actualizado

---

**Ejecuta PASO 1 y PASO 2 en Supabase SQL Editor ahora.**

