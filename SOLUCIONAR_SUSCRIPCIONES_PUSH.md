# 🔧 SOLUCIONAR: Suscripciones Push Activas = 0

## 📋 Problema Identificado

El diagnóstico muestra: **Suscripciones push activas: 0**

Esto significa que **ningún usuario se ha suscrito a las notificaciones push**, por lo que no se pueden enviar push notifications.

---

## ✅ SOLUCIÓN: Activar Suscripciones Push

### Paso 1: Verificar que el Frontend Esté Configurado

El código ya está listo:
- ✅ `src/hooks/usePushNotifications.ts` - Hook para suscripciones
- ✅ `src/components/PushNotificationSettings.tsx` - Componente UI
- ✅ `public/sw.js` - Service Worker

### Paso 2: Activar Push Notifications desde la Aplicación

1. **Abre la aplicación** en el navegador
2. **Inicia sesión** con tu cuenta
3. Ve a **Configuración**:
   - Talent: `/talent-dashboard/settings`
   - Business: `/business-dashboard/settings`
4. Busca la sección **"Notificaciones Push"** o **"Push Notifications"**
5. **Activa el switch/toggle** de notificaciones push
6. El navegador pedirá permiso → **Permitir notificaciones**
7. Deberías ver un mensaje de éxito

### Paso 3: Verificar que se Guardó la Suscripción

Ejecuta en **Supabase SQL Editor**:

```sql
SELECT 
  ps.id,
  ps.user_id,
  p.email,
  p.full_name,
  ps.endpoint,
  ps.created_at
FROM push_subscriptions ps
LEFT JOIN auth.users u ON u.id = ps.user_id
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY ps.created_at DESC;
```

**Deberías ver tu suscripción listada**

### Paso 4: Probar Push Notification

Ejecuta en **Supabase SQL Editor**:

```sql
-- Obtén tu user_id
SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- Crea una notificación de prueba (reemplaza TU_USER_ID)
INSERT INTO notifications (
  user_id, 
  type, 
  title, 
  message, 
  action_url
)
VALUES (
  'TU_USER_ID_AQUI'::uuid,
  'system',
  '🔔 Prueba de Push Notification',
  'Si ves esta notificación push, ¡está funcionando!',
  '/dashboard'
);
```

**Deberías recibir:**
- ✅ Notificación push del navegador
- ✅ Notificación in-app
- ✅ Email (si está habilitado)

---

## 🔍 Verificar Service Worker

### Paso 1: Verificar en DevTools

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Application**
3. Click en **Service Workers**
4. Deberías ver: `/sw.js` (activated and running)

**Si no aparece:**
- Verifica que `public/sw.js` existe
- Recarga la página
- Verifica la consola por errores

### Paso 2: Verificar Permisos del Navegador

1. En **DevTools** → **Application** → **Notifications**
2. Verifica que el permiso esté en **"Allow"**

O verifica en la configuración del navegador:
- Chrome: `chrome://settings/content/notifications`
- Firefox: `about:preferences#privacy`
- Edge: `edge://settings/content/notifications`

---

## 🚨 Si No Aparece la Opción de Push Notifications

### Verificar que el Componente Esté en la Página de Configuración

Busca en el código:
- `src/pages/settings/NotificationSettings.tsx`
- `src/components/PushNotificationSettings.tsx`

**Si no está visible:**
1. Verifica que el componente esté importado
2. Verifica que esté renderizado en la página de settings
3. Verifica que no esté oculto por alguna condición

---

## 📝 Verificar VAPID Keys

### Paso 1: Verificar en Supabase Secrets

```bash
supabase secrets list
```

**Debes tener:**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

### Paso 2: Verificar en el Frontend

El código tiene fallback, pero verifica:
- Variable de entorno: `VITE_VAPID_PUBLIC_KEY`
- O el fallback en `src/hooks/usePushNotifications.ts`

---

## ✅ Checklist para Activar Push Notifications

- [ ] Service Worker registrado (`public/sw.js` existe y está activo)
- [ ] Permisos del navegador otorgados (Allow notifications)
- [ ] Componente de configuración visible en settings
- [ ] Usuario activa el switch de push notifications
- [ ] Suscripción guardada en `push_subscriptions` (verificar con SQL)
- [ ] VAPID keys configuradas en Supabase Secrets
- [ ] Edge Function `send-push-notification` desplegada
- [ ] Probar con notificación de prueba

---

## 🎯 Próximos Pasos

Una vez que tengas al menos 1 suscripción push activa:

1. **Probar notificación push:**
   - Crear notificación desde SQL
   - Verificar que se recibe push notification

2. **Verificar procesamiento automático:**
   - El frontend debe procesar automáticamente
   - Ver logs en Supabase Dashboard → Edge Functions → `send-push-notification`

3. **Activar para más usuarios:**
   - Los usuarios deben activar push notifications desde su configuración
   - Cada usuario que active creará una suscripción en `push_subscriptions`

