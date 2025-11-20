# 🔧 PASOS PARA CORREGIR EL SISTEMA DE NOTIFICACIONES

## ✅ CORRECCIONES YA APLICADAS

He corregido automáticamente estos problemas críticos:

1. ✅ **Parámetro incorrecto en send-push-notification** - Corregido `user_id` → `userId`
2. ✅ **Guardado incompleto de suscripciones push** - Ahora guarda el objeto completo
3. ✅ **Columna incorrecta en process-pending-notifications** - Corregido `is_read` → `read`

---

## 📋 PASOS QUE DEBES SEGUIR AHORA

### PASO 1: Desplegar las Edge Functions corregidas

**Acción:** Desplegar las funciones actualizadas a Supabase

```bash
# Desde la terminal, en el directorio del proyecto
cd supabase/functions

# Desplegar process-notification
supabase functions deploy process-notification

# Desplegar send-push-notification  
supabase functions deploy send-push-notification

# Desplegar process-pending-notifications
supabase functions deploy process-pending-notifications
```

**Verificación:** 
- Ve al dashboard de Supabase → Edge Functions
- Verifica que las 3 funciones estén desplegadas y activas

---

### PASO 2: Actualizar suscripciones push existentes (si hay alguna)

**Problema:** Las suscripciones antiguas tienen solo las keys, no el endpoint completo.

**Acción:** Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Ver suscripciones actuales
SELECT 
  id,
  user_id,
  endpoint,
  subscription,
  created_at
FROM push_subscriptions
ORDER BY created_at DESC;

-- Si hay suscripciones, necesitarás que los usuarios se vuelvan a suscribir
-- O puedes intentar reconstruir el objeto (solo si endpoint existe):
UPDATE push_subscriptions
SET subscription = jsonb_build_object(
  'endpoint', endpoint,
  'keys', subscription
)
WHERE endpoint IS NOT NULL 
  AND subscription IS NOT NULL
  AND subscription->>'endpoint' IS NULL;
```

**Nota:** Es más seguro pedir a los usuarios que se vuelvan a suscribir desde la app.

---

### PASO 3: Configurar cron job para process-pending-notifications

**Problema:** Las notificaciones solo se procesan si hay usuarios conectados. Necesitamos un backup automático.

**Acción:** Configura un cron job en Supabase:

1. Ve a Supabase Dashboard → Database → Cron Jobs
2. Crea un nuevo cron job con esta configuración:

```sql
-- Nombre: process_pending_notifications
-- Schedule: */15 * * * * (cada 15 minutos)
-- SQL Command:
SELECT net.http_post(
  url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/process-pending-notifications',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
  ),
  body := '{}'::jsonb
);
```

**Alternativa más simple:** Usa pg_cron directamente:

```sql
-- Habilitar pg_cron si no está habilitado
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear función helper para llamar a la edge function
CREATE OR REPLACE FUNCTION call_process_pending_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta función será llamada por el cron
  -- Por ahora, solo registramos que debería ejecutarse
  -- La implementación real requiere pg_net o HTTP extension
  RAISE NOTICE 'Process pending notifications should run here';
END;
$$;

-- Programar el cron (cada 15 minutos)
SELECT cron.schedule(
  'process-pending-notifications',
  '*/15 * * * *',
  $$SELECT call_process_pending_notifications()$$
);
```

**Nota:** Si pg_net no está disponible, considera usar Supabase Scheduled Functions o un servicio externo como GitHub Actions.

---

### PASO 4: Probar el sistema completo

**Acción:** Sigue estos pasos para verificar que todo funciona:

1. **Activa Push Notifications:**
   - Abre la app en el navegador
   - Ve a Configuración → Notificaciones
   - Activa "Notificaciones Push"
   - Permite notificaciones cuando el navegador lo pida

2. **Verifica que se guardó:**
   ```sql
   SELECT 
     ps.id,
     u.email,
     ps.endpoint,
     ps.subscription->>'endpoint' as subscription_endpoint,
     ps.created_at
   FROM push_subscriptions ps
   LEFT JOIN auth.users u ON u.id = ps.user_id
   ORDER BY ps.created_at DESC
   LIMIT 5;
   ```
   
   Debes ver tu suscripción con `endpoint` y `subscription` completo.

3. **Crea una notificación de prueba:**
   ```sql
   -- Obtener tu user_id
   SELECT id, email FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com';
   
   -- Crear notificación de prueba (reemplaza TU_USER_ID)
   INSERT INTO notifications (
     user_id, 
     type, 
     title, 
     message, 
     action_url,
     read
   )
   VALUES (
     'TU_USER_ID_AQUI'::uuid,
     'application',
     '🧪 Prueba de Notificación',
     'Esta es una notificación de prueba del sistema corregido.',
     '/dashboard',
     false
   );
   ```

4. **Verifica que recibiste:**
   - ✅ Notificación aparece en tiempo real en el frontend
   - ✅ Contador de notificaciones se actualiza
   - ✅ Email se envía (si RESEND_API_KEY está configurado)
   - ✅ Push notification aparece en el navegador (si activaste push)

---

### PASO 5: Verificar logs de Edge Functions

**Acción:** Revisa los logs para asegurar que no hay errores:

1. Ve a Supabase Dashboard → Edge Functions → process-notification → Logs
2. Busca errores recientes
3. Verifica que las notificaciones se procesen correctamente

**Qué buscar:**
- ✅ "Processing notification: [id]"
- ✅ "Notification config: [config]"
- ✅ "Email sent successfully" (si email está habilitado)
- ✅ "Push notification sent successfully" (si push está habilitado)
- ❌ NO deberías ver errores de "userId is required" o "subscription not found"

---

### PASO 6: (Opcional) Limpiar notificaciones antiguas

**Acción:** Si tienes muchas notificaciones antiguas sin leer:

```sql
-- Ver notificaciones antiguas
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE read = false) as no_leidas,
  COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days') as mas_30_dias
FROM notifications;

-- Marcar como leídas las muy antiguas (>7 días)
UPDATE notifications
SET read = true,
    read_at = NOW()
WHERE read = false 
  AND created_at < NOW() - INTERVAL '7 days';

-- Eliminar notificaciones leídas muy antiguas (>30 días)
DELETE FROM notifications
WHERE read = true 
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## ✅ CHECKLIST FINAL

Antes de considerar que todo está funcionando:

- [ ] Edge Functions desplegadas (process-notification, send-push-notification, process-pending-notifications)
- [ ] Push notifications activadas desde la app
- [ ] Suscripción guardada correctamente en `push_subscriptions` (con endpoint completo)
- [ ] Notificación de prueba creada y recibida
- [ ] Email se envía (si está configurado)
- [ ] Push notification aparece en el navegador
- [ ] Logs de Edge Functions sin errores críticos
- [ ] (Opcional) Cron job configurado para procesar notificaciones pendientes

---

## 🚨 SI ALGO NO FUNCIONA

### Push notifications no aparecen:
1. Verifica que activaste push desde la app
2. Verifica permisos del navegador (Configuración → Notificaciones)
3. Revisa logs de `send-push-notification` en Supabase
4. Verifica que VAPID keys estén configuradas en Supabase Secrets

### Emails no se envían:
1. Verifica que RESEND_API_KEY esté configurado en Supabase Secrets
2. Revisa logs de `send-notification-email` en Supabase
3. Verifica que el tipo de notificación esté habilitado en admin settings

### Notificaciones no aparecen en tiempo real:
1. Abre la consola del navegador (F12)
2. Busca mensajes de `[useNotifications]`
3. Verifica que Realtime esté conectado
4. Verifica que la suscripción a `notifications_channel` esté activa

---

## 📞 PRÓXIMOS PASOS (Opcional - Mejoras Futuras)

Estos problemas requieren refactorización más profunda:

1. **Unificar tipos de notificaciones** - Mapear correctamente tipos reales con IDs de configuración
2. **Refactorizar inserts directos** - Usar `sendNotification()` en lugar de inserts directos
3. **Sincronizar NotificationsContext** - Conectar con la tabla real de Supabase
4. **Automatizar limpieza** - Crear cron job para limpiar notificaciones antiguas
5. **Parametrizar dominio** - Usar variable de entorno para el dominio en emails

Pero por ahora, con estos pasos, el sistema básico debería funcionar correctamente.


