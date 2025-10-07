# Configuración de Notificaciones Automáticas Diarias

Este documento explica cómo activar las notificaciones automáticas de oportunidades que se ejecutan diariamente.

## Opción 1: Usar Supabase Cron (Recomendado)

Supabase permite configurar cron jobs directamente desde el dashboard.

### Pasos:

1. **Ve a tu proyecto en Supabase Dashboard**
2. **Ve a Database → Cron Jobs** (o usa la extensión pg_cron)
3. **Haz clic en "Create a new cron job"**
4. **Configura el cron job:**

```sql
-- Ejecutar diariamente a las 9:00 AM (hora del servidor)
SELECT cron.schedule(
  'daily-opportunity-notifications',  -- nombre del job
  '0 9 * * *',                        -- cron expression: 9:00 AM todos los días
  $$
    -- Notificar oportunidades por vencer
    SELECT notify_expiring_opportunities();
    
    -- Notificar oportunidades sin actividad
    SELECT notify_inactive_opportunities();
  $$
);
```

5. **Verifica que el job está activo:**

```sql
SELECT * FROM cron.job;
```

### Cron Expression Reference:
- `0 9 * * *` - Todos los días a las 9:00 AM
- `0 */6 * * *` - Cada 6 horas
- `0 0 * * *` - Todos los días a medianoche
- `0 12 * * 1` - Todos los lunes a las 12:00 PM

---

## Opción 2: Usar Supabase Edge Functions con Cron

Si prefieres usar Edge Functions, puedes configurar un cron job externo que llame a la función.

### 1. Desplegar la Edge Function:

```bash
# Desde la raíz del proyecto
supabase functions deploy daily-opportunity-notifications
```

### 2. Obtener la URL de la función:

La URL será algo como:
```
https://[tu-proyecto-id].supabase.co/functions/v1/daily-opportunity-notifications
```

### 3. Configurar un cron externo:

**Opción A: Usar cron-job.org (Gratis)**

1. Ve a https://cron-job.org
2. Crea una cuenta
3. Crea un nuevo cron job:
   - URL: `https://[tu-proyecto-id].supabase.co/functions/v1/daily-opportunity-notifications`
   - Schedule: `0 9 * * *` (9:00 AM diario)
   - Headers:
     - `Authorization: Bearer [TU_ANON_KEY]`
     - `Content-Type: application/json`

**Opción B: Usar GitHub Actions (Si usas GitHub)**

Crea `.github/workflows/daily-notifications.yml`:

```yaml
name: Daily Opportunity Notifications

on:
  schedule:
    # Ejecutar diariamente a las 9:00 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Permite ejecución manual

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://[tu-proyecto-id].supabase.co/functions/v1/daily-opportunity-notifications
```

**Opción C: Usar EasyCron (Gratis hasta 20 jobs)**

1. Ve a https://www.easycron.com
2. Registra una cuenta gratuita
3. Crea un nuevo cron job con la URL de la Edge Function

---

## Opción 3: Ejecutar Manualmente (Para Testing)

Puedes llamar a las funciones SQL directamente desde el SQL Editor:

```sql
-- Ejecutar manualmente
SELECT notify_expiring_opportunities();
SELECT notify_inactive_opportunities();
```

O probar la Edge Function:

```bash
# Desde terminal (reemplaza con tus valores)
curl -X POST \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://TU_PROYECTO_ID.supabase.co/functions/v1/daily-opportunity-notifications
```

---

## Verificar que funciona

Después de configurar el cron, puedes verificar que está funcionando:

1. **Crear una oportunidad de prueba que vence pronto:**

```sql
-- Crear oportunidad que vence en 7 días
INSERT INTO opportunities (title, description, company_id, status, expires_at)
VALUES (
  'Test - Vence en 7 días',
  'Oportunidad de prueba',
  (SELECT id FROM companies LIMIT 1),
  'active',
  NOW() + INTERVAL '7 days'
);
```

2. **Ejecutar manualmente la función:**

```sql
SELECT notify_expiring_opportunities();
```

3. **Verificar que se creó la notificación:**

```sql
SELECT * FROM notifications 
WHERE type = 'opportunity' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Troubleshooting

### El cron no se ejecuta:

1. **Verifica que pg_cron está instalado:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

2. **Si no está instalado, instálalo:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

3. **Verifica los logs del cron:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-opportunity-notifications')
ORDER BY start_time DESC
LIMIT 10;
```

### Las notificaciones no se crean:

1. **Verifica que las funciones existen:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('notify_expiring_opportunities', 'notify_inactive_opportunities');
```

2. **Ejecuta manualmente y revisa errores:**
```sql
DO $$
BEGIN
  PERFORM notify_expiring_opportunities();
  RAISE NOTICE 'Expiring opportunities notified';
  
  PERFORM notify_inactive_opportunities();
  RAISE NOTICE 'Inactive opportunities notified';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error: %', SQLERRM;
END $$;
```

---

## Recomendación

Para producción, usa **Opción 1 (Supabase Cron con pg_cron)** ya que es nativo, confiable y no requiere servicios externos.

Para desarrollo/testing, puedes usar ejecución manual o GitHub Actions.

