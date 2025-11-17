# 🔔 ACTIVAR NOTIFICACIONES - GUÍA PASO A PASO

## 📋 Resumen del Problema

Las notificaciones no se están viendo porque:
1. Puede faltar configuración en Supabase (secretos, triggers)
2. El frontend necesita estar abierto para procesar notificaciones
3. Pueden faltar Edge Functions desplegadas

---

## ✅ PASO 1: VERIFICAR ESTADO ACTUAL

### 1.1 Ejecutar Diagnóstico

En **Supabase SQL Editor**, ejecuta:

```sql
-- Archivo: DIAGNOSTICO_NOTIFICACIONES.sql
```

Este script te mostrará:
- ✅ Estado de las tablas
- ✅ Funciones SQL existentes
- ✅ Triggers activos
- ✅ Notificaciones existentes
- ✅ Suscripciones push
- ✅ Configuración de admin

**Resultado esperado:**
- Debes ver las tablas `notifications` y `push_subscriptions`
- Debes ver funciones como `notify_new_team_member`, etc.
- Puede que NO veas triggers activos (eso lo arreglaremos)

---

## ✅ PASO 2: VERIFICAR EDGE FUNCTIONS

### 2.1 Verificar Edge Functions Desplegadas

En tu terminal:

```bash
# Si tienes Supabase CLI configurado
supabase functions list

# O verifica en Supabase Dashboard:
# Dashboard → Edge Functions → Ver lista de funciones
```

**Debes tener estas funciones:**
- ✅ `process-notification` (CRÍTICA - procesa notificaciones)
- ✅ `send-notification-email` (envía emails)
- ✅ `send-push-notification` (envía push notifications)
- ✅ `send-email` (emails de auth)
- ✅ `send-invitation` (invitaciones)

**Si falta alguna:**
```bash
# Desplegar process-notification (la más importante)
supabase functions deploy process-notification

# Desplegar las demás
supabase functions deploy send-notification-email
supabase functions deploy send-push-notification
```

---

## ✅ PASO 3: VERIFICAR SECRETOS

### 3.1 Verificar Secretos Configurados

En tu terminal:

```bash
supabase secrets list
```

**Debes tener:**
- ✅ `RESEND_API_KEY` (para emails)
- ✅ `VAPID_PUBLIC_KEY` (para push)
- ✅ `VAPID_PRIVATE_KEY` (para push)
- ✅ `VAPID_SUBJECT` (para push)

**Si falta algún secreto:**

```bash
# Configurar RESEND_API_KEY (obtén la key de https://resend.com)
supabase secrets set RESEND_API_KEY=tu-resend-api-key

# Configurar VAPID keys (ya están en el código como fallback)
supabase secrets set VAPID_PUBLIC_KEY=BOEKW3QP-LfleNFqh2ug5Ax1hniociI7C3ZHZifBljNwVYj4nWtUlliSQrL2hDoi7dgNYuon-CA0caVLecMCebI
supabase secrets set VAPID_PRIVATE_KEY=2oRKfbj19zWW6wB1BlhhLv56NRnhJM_XgNyVcrpVYd8
supabase secrets set VAPID_SUBJECT=mailto:support@talentdigital.io
```

---

## ✅ PASO 4: ACTIVAR TRIGGERS SQL

### 4.1 Ejecutar Script de Activación

En **Supabase SQL Editor**, ejecuta:

```sql
-- Archivo: ACTIVAR_NOTIFICACIONES_COMPLETO.sql
```

Este script:
- ✅ Crea/activa triggers para procesar notificaciones
- ✅ Activa triggers de push notifications
- ✅ Verifica que todo está activo

**Resultado esperado:**
- Debes ver "✅ Trigger activado" para cada trigger
- Debes ver triggers listados en el resultado final

---

## ✅ PASO 5: VERIFICAR MIGRACIONES SQL

### 5.1 Verificar que las Migraciones Estén Ejecutadas

En **Supabase SQL Editor**, ejecuta:

```sql
-- Verificar funciones de notificaciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%'
ORDER BY routine_name;
```

**Debes tener estas funciones:**
- `notify_new_team_member`
- `notify_access_request`
- `notify_opportunity_removed`
- `notify_company_warning`
- `notify_service_inquiry`
- `send_push_notification_trigger`
- `trigger_process_notification`
- `trigger_send_notifications`

**Si faltan funciones:**

En **Supabase SQL Editor**, ejecuta:

```sql
-- Archivo: supabase/migrations/20251007_ALL_NOTIFICATIONS.sql
```

---

## ✅ PASO 6: VERIFICAR REALTIME ESTÁ HABILITADO

### 6.1 Habilitar Realtime en Supabase

1. Ve a **Supabase Dashboard** → **Database** → **Replication**
2. Busca la tabla `notifications`
3. Verifica que tenga Realtime habilitado ✅

**Si no está habilitado:**
1. Click en la tabla `notifications`
2. Activa el toggle de Realtime
3. Guarda los cambios

---

## ✅ PASO 7: PROBAR NOTIFICACIONES

### 7.1 Prueba Simple (SQL)

En **Supabase SQL Editor**, ejecuta:

```sql
-- Archivo: PRUEBA_NOTIFICACIONES_SIMPLE.sql
```

**Pasos:**
1. Obtén tu `user_id` (PASO 1 del script)
2. Crea una notificación de prueba (PASO 2)
3. Verifica que se creó (PASO 3)

### 7.2 Verificar desde el Frontend

1. **Abre la aplicación** en el navegador
2. **Inicia sesión** con tu cuenta
3. **Abre la consola del navegador** (F12 → Console)
4. Deberías ver logs como: `[useNotifications] Setting up Realtime subscription...`

5. **Ejecuta el PASO 2** del script SQL para crear una notificación

6. **Deberías ver en la consola:**
   ```
   [useNotifications] New notification received via Realtime: {...}
   [useNotifications] Auto-processing notification: uuid-aqui
   [useNotifications] Notification processed successfully
   ```

7. **Verifica:**
   - ✅ El contador de notificaciones se actualiza
   - ✅ La notificación aparece en el centro de notificaciones
   - ✅ Si está configurado, recibes un email
   - ✅ Si está configurado, recibes una push notification

---

## ✅ PASO 8: VERIFICAR PROCESAMIENTO AUTOMÁTICO

### 8.1 Verificar Logs de Edge Functions

1. Ve a **Supabase Dashboard** → **Edge Functions** → **process-notification** → **Logs**
2. Deberías ver logs cuando se procesan notificaciones:
   ```
   Processing notification: uuid-aqui
   Notification details: {...}
   Sending email notification...
   Email sent successfully
   ```

**Si no hay logs:**
- El frontend no está llamando a `process-notification`
- Verifica que el hook `useNotifications` esté activo
- Verifica la consola del navegador por errores

---

## ✅ PASO 9: CONFIGURAR NOTIFICACIONES EN EL ADMIN

### 9.1 Configurar Notificaciones desde el Panel

1. Ve a `/admin` → **Configuración del Sistema** → **Tab Notificaciones**
2. Verifica que las notificaciones estén habilitadas
3. Selecciona canales (Email, Push) para cada tipo
4. Guarda la configuración

### 9.2 Configurar Preferencias de Usuario

1. Ve a `/talent-dashboard/settings` o `/business-dashboard/settings`
2. Ve a la sección **Notificaciones**
3. Activa los tipos de notificaciones que quieres recibir
4. Selecciona canales (Email, Push)
5. Guarda las preferencias

---

## ✅ PASO 10: VERIFICAR PUSH NOTIFICATIONS

### 10.1 Activar Push Notifications

1. Ve a `/talent-dashboard/settings` o `/business-dashboard/settings`
2. Busca la sección **Notificaciones Push** o **Push Notifications**
3. Activa el switch/toggle
4. El navegador pedirá permiso → **Permitir**

### 10.2 Verificar Suscripción

En **Supabase SQL Editor**:

```sql
SELECT 
  ps.user_id,
  p.email,
  ps.endpoint,
  ps.created_at
FROM push_subscriptions ps
JOIN auth.users u ON u.id = ps.user_id
JOIN profiles p ON p.user_id = u.id
ORDER BY ps.created_at DESC;
```

**Debes ver tu suscripción listada**

### 10.3 Probar Push Notification

Ejecuta el **PASO 2** de `PRUEBA_NOTIFICACIONES_SIMPLE.sql` para crear una notificación.

**Deberías recibir:**
- ✅ Notificación push del navegador
- ✅ Email (si está habilitado)
- ✅ Notificación in-app

---

## ❌ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "No veo notificaciones en el frontend"

**Solución:**
1. Verifica que Realtime esté habilitado en Supabase
2. Verifica que el hook `useNotifications` esté activo (consola del navegador)
3. Verifica que estés autenticado
4. Crea una notificación nueva y verifica en tiempo real

### Problema 2: "No recibo emails"

**Solución:**
1. Verifica `RESEND_API_KEY` en Supabase Secrets
2. Verifica logs de `send-notification-email` en Supabase Dashboard
3. Revisa la carpeta de spam
4. Verifica configuración de admin (notificaciones habilitadas)

### Problema 3: "No recibo push notifications"

**Solución:**
1. Verifica VAPID keys en Supabase Secrets
2. Verifica que hayas dado permisos al navegador
3. Verifica que `send-push-notification` esté desplegada
4. Verifica suscripciones en la base de datos
5. Verifica Service Worker registrado (DevTools → Application → Service Workers)

### Problema 4: "Las notificaciones no se procesan automáticamente"

**Solución:**
1. El frontend debe estar abierto para procesar notificaciones
2. Verifica que el hook `useNotifications` esté escuchando Realtime
3. Puedes procesar manualmente:
   ```typescript
   await supabase.functions.invoke('process-notification', {
     body: { notification_id: 'uuid-aqui' }
   })
   ```

---

## ✅ CHECKLIST FINAL

Antes de decir que está funcionando, verifica:

- [ ] Tablas `notifications` y `push_subscriptions` existen
- [ ] Edge Functions desplegadas (process-notification, send-notification-email, etc.)
- [ ] Secretos configurados (RESEND_API_KEY, VAPID keys)
- [ ] Triggers SQL activos (verificado con DIAGNOSTICO_NOTIFICACIONES.sql)
- [ ] Realtime habilitado para tabla `notifications`
- [ ] Frontend abierto y escuchando Realtime (logs en consola)
- [ ] Notificación de prueba se crea correctamente
- [ ] Notificación aparece en el frontend en tiempo real
- [ ] Email se envía (si está habilitado)
- [ ] Push notification se envía (si está habilitado)
- [ ] Logs de Edge Functions muestran procesamiento exitoso

---

## 🎯 PRÓXIMOS PASOS

Una vez que todo esté funcionando:

1. **Configurar notificaciones en producción:**
   - Usar VAPID keys reales (generar nuevas si es necesario)
   - Configurar email real en `VAPID_SUBJECT`
   - Configurar dominio de email en Resend

2. **Monitorear el sistema:**
   - Revisar logs de Edge Functions regularmente
   - Verificar que las notificaciones se procesen correctamente
   - Ajustar configuración según necesidad

3. **Optimizar:**
   - Implementar cola de procesamiento si hay muchas notificaciones
   - Agregar retry logic para notificaciones fallidas
   - Implementar notificaciones agrupadas/digest

---

## 📞 SOPORTE

Si después de seguir estos pasos aún no funciona:

1. Ejecuta `DIAGNOSTICO_NOTIFICACIONES.sql` y comparte los resultados
2. Revisa logs de Edge Functions en Supabase Dashboard
3. Revisa consola del navegador por errores
4. Verifica que todos los pasos se completaron correctamente

