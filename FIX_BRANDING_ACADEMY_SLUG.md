# 🔧 FIX: Error al guardar configuración de Branding

## 🐛 Problema

Al intentar guardar cambios de colores en `/business-dashboard/academy` → Tab Branding, aparece error:
```
Error al guardar la configuración
duplicate key value violates unique constraint "companies_academy_slug_key"
```

## 🔍 Causa

Hay un registro con `academy_slug = ''` (empty string) que causa conflicto.
El constraint considera que empty string es un valor duplicable.

## ✅ Solución

### Paso 1: Limpiar registros existentes (EJECUTAR UNA VEZ)

Ve a Supabase SQL Editor y ejecuta:

```sql
-- Convertir empty strings a NULL
UPDATE companies
SET academy_slug = NULL
WHERE academy_slug = '';
```

Deberías ver: `UPDATE 1` (o el número de registros actualizados)

### Paso 2: Sincronizar en Lovable

El código ya está actualizado para enviar `NULL` en lugar de `''` cuando el campo está vacío.

Después de sincronizar:
- ✅ Podrás guardar colores sin problemas
- ✅ Los slugs vacíos se guardarán como NULL
- ✅ No habrá más errores de duplicados

## 🎯 Resultado

Después de ejecutar el SQL y sincronizar:
1. Ve a `/business-dashboard/academy` → Tab "Branding"
2. Cambia los colores que quieras
3. Haz clic en "Guardar Cambios"
4. ✅ Debería guardar exitosamente

## 📁 Archivos modificados

- `src/components/academy/AcademyBrandingSettings.tsx` - Fix en código
- `supabase/migrations/fix_empty_academy_slugs.sql` - SQL para limpiar DB

## 🚀 Commits

- `f6dfd5e` - Fix de código (ya pusheado)
- `a65e9c2` - SQL migration (ya pusheado)

