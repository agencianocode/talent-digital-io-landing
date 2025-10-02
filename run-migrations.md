# Ejecutar Migraciones de Perfil de Talento

## Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "SQL Editor" en el menú lateral
3. Click en "New Query"
4. Copia y pega el contenido de cada archivo en el siguiente orden:

### 1. Portfolios
Archivo: `supabase/migrations/20240101000001_create_talent_portfolios.sql`

### 2. Experiencias
Archivo: `supabase/migrations/20240101000002_create_talent_experiences.sql`

### 3. Educación
Archivo: `supabase/migrations/20240101000003_create_talent_education.sql`

### 4. Redes Sociales
Archivo: `supabase/migrations/20240101000004_create_talent_social_links.sql`

5. Click en "Run" para ejecutar cada migración

## Opción 2: Desde CLI de Supabase

```bash
# Asegúrate de estar logueado
supabase login

# Link tu proyecto
supabase link --project-ref TU_PROJECT_REF

# Ejecuta las migraciones
supabase db push
```

## Verificar que funcionó

Después de ejecutar las migraciones, verifica en el SQL Editor:

```sql
-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'talent_%';
```

Deberías ver:
- talent_portfolios
- talent_experiences
- talent_education
- talent_social_links
