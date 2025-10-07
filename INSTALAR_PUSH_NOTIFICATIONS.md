# 🚀 INSTALAR WEB PUSH NOTIFICATIONS - GUÍA RÁPIDA

## ✅ **YA ESTÁ IMPLEMENTADO EN EL CÓDIGO**

Todo el código frontend ya está listo. Solo necesitas configurar el backend.

---

## 📋 **PASOS PARA ACTIVAR (5 minutos)**

### **PASO 1: Instalar Supabase CLI** (si no lo tienes)

```bash
npm install -g supabase
```

### **PASO 2: Login a Supabase**

```bash
supabase login
```

### **PASO 3: Enlazar tu proyecto**

```bash
supabase link --project-ref [tu-project-ref]
```

Obtén tu `project-ref` desde: https://supabase.com/dashboard → Settings → General

### **PASO 4: Configurar secretos**

```bash
supabase secrets set VAPID_PUBLIC_KEY=BOEKW3QP-LfleNFqh2ug5Ax1hniociI7C3ZHZifBljNwVYj4nWtUlliSQrL2hDoi7dgNYuon-CA0caVLecMCebI

supabase secrets set VAPID_PRIVATE_KEY=2oRKfbj19zWW6wB1BlhhLv56NRnhJM_XgNyVcrpVYd8

supabase secrets set VAPID_SUBJECT=mailto:tu-email@ejemplo.com
```

### **PASO 5: Desplegar Edge Function**

```bash
supabase functions deploy send-push-notification
```

### **PASO 6: Ejecutar migración SQL**

Abre Supabase SQL Editor y ejecuta:

```
supabase/migrations/20251007_push_notification_trigger.sql
```

---

## 🧪 **PROBAR INMEDIATAMENTE**

### **1. En la aplicación:**

1. Inicia sesión
2. Ve a tu dashboard
3. Busca "Configuración" o "Settings"
4. Encuentra la sección "Notificaciones Push"
5. Activa el switch
6. Permite notificaciones en el navegador
7. Click en "Enviar notificación de prueba"

✅ ¡Deberías recibir una notificación!

### **2. Desde Supabase SQL Editor:**

```sql
-- Crear una notificación (se enviará push automático si activas el trigger)
INSERT INTO notifications (user_id, type, title, message, action_url, read)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com'),
  'system',
  '🔔 Push Notification Test',
  'Si ves esto, ¡funciona!',
  '/business-dashboard',
  false
);
```

---

## ⚡ **ACTIVAR PUSH AUTOMÁTICAS (Opcional)**

Si quieres que TODAS las notificaciones envíen push automáticamente:

```sql
-- Ejecutar en Supabase SQL Editor
DROP TRIGGER IF EXISTS trigger_send_push_notification ON notifications;
CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT ON notifications
  FOR EACH ROW
  WHEN (NEW.read = false)
  EXECUTE FUNCTION send_push_notification_trigger();
```

---

## 🔍 **VERIFICAR QUE ESTÁ FUNCIONANDO**

### **Método 1: Verificar suscripciones**

```sql
SELECT 
  COUNT(*) as total_suscripciones,
  COUNT(DISTINCT user_id) as usuarios_suscritos
FROM push_subscriptions
WHERE updated_at > NOW() - INTERVAL '30 days';
```

### **Método 2: Ver en DevTools**

1. Abre DevTools (F12)
2. Tab "Application"
3. Click "Service Workers"
4. Deberías ver: `/sw.js` (activated and running)

### **Método 3: Verificar Edge Function**

```bash
supabase functions list
```

Deberías ver: `send-push-notification` (deployed)

---

## ❌ **SI ALGO FALLA**

### **Error: "Service Worker failed to register"**

```bash
# Verificar que el archivo existe
ls public/sw.js

# Si no existe, ya está creado en el código, solo reinicia el servidor
npm run dev
```

### **Error: "Edge Function not found"**

```bash
# Re-desplegar
supabase functions deploy send-push-notification --no-verify-jwt
```

### **Error: "Permission denied"**

El usuario debe permitir notificaciones en su navegador.

Chrome: `chrome://settings/content/notifications`

---

## 📊 **COMANDOS ÚTILES**

```bash
# Ver logs de Edge Function
supabase functions logs send-push-notification

# Ver secretos configurados
supabase secrets list

# Re-desplegar función
supabase functions deploy send-push-notification

# Ver estado del proyecto
supabase status
```

---

## 🎯 **RESUMEN DE LO QUE YA ESTÁ LISTO**

✅ Service Worker (`public/sw.js`)
✅ Hook React (`usePushNotifications`)
✅ Componente UI (`PushNotificationSettings`)
✅ VAPID Keys generadas
✅ Edge Function creada
✅ Migraciones SQL
✅ Tabla `push_subscriptions`
✅ RLS policies
✅ Trigger function

**Solo falta: Desplegar y probar!** 🚀

---

## 📞 **¿NECESITAS AYUDA?**

### **Ver documentación completa:**
```
WEB_PUSH_SETUP.md
```

### **Verificar implementación:**
```
VERIFICACION_FINAL_MENSAJERIA.md
```

---

## ⏱️ **TIEMPO ESTIMADO: 5-10 minutos**

Si sigues estos pasos, en menos de 10 minutos tendrás push notifications funcionando! 🎉

