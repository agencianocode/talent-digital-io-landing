# 🔔 Activar Notificaciones Automáticas de Oportunidades

## ✅ Estado Actual

Las funciones de notificaciones automáticas YA ESTÁN IMPLEMENTADAS. Solo necesitan ser activadas con un cron job.

**Notificaciones implementadas:**
- ⏰ Oportunidades que vencen en 7 días
- 🚨 Oportunidades que vencen mañana
- 📊 Oportunidades sin postulantes después de 5 días
- 🎯 Milestones de postulantes (5, 10, 25, 50, 100) - **YA ACTIVO**

---

## 🚀 Instrucciones Rápidas

### Opción 1: Usar pg_cron (Recomendado) ⭐

**1. Ve a Supabase Dashboard → SQL Editor**

**2. Ejecuta este script:**

```sql
-- Instalar pg_cron si no está instalado
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear el cron job diario a las 9:00 AM
SELECT cron.schedule(
  'daily-opportunity-notifications',
  '0 9 * * *',
  $$
    SELECT notify_expiring_opportunities();
    SELECT notify_inactive_opportunities();
  $$
);

-- Verificar que se creó
SELECT * FROM cron.job WHERE jobname = 'daily-opportunity-notifications';
```

**3. ¡Listo!** Las notificaciones se ejecutarán automáticamente todos los días a las 9:00 AM.

---

### Opción 2: Si pg_cron no está disponible

**Usa un servicio de cron externo gratuito:**

#### A) Usando cron-job.org (Gratis, sin registro requerido)

1. Ve a https://cron-job.org
2. Crea cuenta gratuita
3. Crea nuevo cron job:
   - **URL:** `https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/daily-opportunity-notifications`
   - **Horario:** `0 9 * * *` (9:00 AM diario)
   - **Headers:**
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cmllZXRlYmZ6bWdmZnhlY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NjE3NDQsImV4cCI6MjA0ODEzNzc0NH0.z7vAVGmziwCAuGVH-hd-o8Wqq0nVStQJU0xkjW1fRPc
     Content-Type: application/json
     ```

#### B) Usando GitHub Actions (Si tu código está en GitHub)

Crea `.github/workflows/daily-notifications.yml`:

```yaml
name: Daily Opportunity Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # 9:00 AM UTC diario
  workflow_dispatch: # Permite ejecución manual

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Notifications
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/daily-opportunity-notifications
```

---

## 🧪 Probar que Funciona

**1. Ejecuta el script de prueba en SQL Editor:**

```bash
# Copia el contenido de:
supabase/migrations/test_opportunity_notifications.sql
```

O ejecuta manualmente:

```sql
-- Crear oportunidad de prueba que vence en 7 días
INSERT INTO opportunities (title, description, company_id, status, expires_at)
VALUES (
  'TEST - Vence en 7 días',
  'Prueba',
  (SELECT id FROM companies LIMIT 1),
  'active',
  NOW() + INTERVAL '7 days'
);

-- Ejecutar función
SELECT notify_expiring_opportunities();

-- Ver notificación creada
SELECT * FROM notifications 
WHERE type = 'opportunity' 
ORDER BY created_at DESC 
LIMIT 1;
```

**2. Verifica en la app:**
- Ve a `/business-dashboard/notifications`
- Deberías ver la notificación de prueba

**3. Limpia los datos de prueba:**
```sql
DELETE FROM opportunities WHERE title LIKE 'TEST%';
DELETE FROM notifications WHERE message LIKE '%TEST%';
```

---

## 📊 Monitoreo

### Ver historial del cron job:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-opportunity-notifications')
ORDER BY start_time DESC
LIMIT 10;
```

### Ver notificaciones recientes:

```sql
SELECT 
  type,
  title,
  message,
  created_at,
  read
FROM notifications
WHERE type = 'opportunity'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🔧 Troubleshooting

### El cron no aparece en `cron.job`:
- **Problema:** pg_cron no está disponible en tu plan de Supabase
- **Solución:** Usa Opción 2 (cron externo)

### Las notificaciones no se crean:
```sql
-- Verificar que las funciones existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('notify_expiring_opportunities', 'notify_inactive_opportunities');

-- Si no aparecen, ejecuta:
-- supabase/migrations/20251007_opportunity_notifications.sql
```

### Cambiar horario del cron:
```sql
-- Eliminar job actual
SELECT cron.unschedule('daily-opportunity-notifications');

-- Crear con nuevo horario (ejemplo: 2:00 PM)
SELECT cron.schedule(
  'daily-opportunity-notifications',
  '0 14 * * *',  -- 2:00 PM
  $$ SELECT notify_expiring_opportunities(); SELECT notify_inactive_opportunities(); $$
);
```

---

## 📅 Próximos Pasos

Una vez activadas estas notificaciones, continuaremos con:

1. ✅ **Notificaciones de equipo/empresa**
   - Nuevo miembro se une
   - Solicitud de acceso pendiente

2. ✅ **Notificaciones de moderación**
   - Oportunidad dada de baja

3. ✅ **Notificaciones de servicios marketplace**
   - Consulta sobre servicio

4. ✅ **Web Push Notifications**
   - Notificaciones fuera de la app

---

## 📝 Archivos Relevantes

- `/supabase/migrations/20251007_opportunity_notifications.sql` - Funciones SQL
- `/supabase/migrations/20251007_setup_cron_notifications.sql` - Setup del cron
- `/supabase/functions/daily-opportunity-notifications/index.ts` - Edge Function
- `/supabase/CRON_SETUP.md` - Documentación completa
- `/supabase/migrations/test_opportunity_notifications.sql` - Script de prueba

