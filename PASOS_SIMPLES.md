# 📋 PASOS SIMPLES - PASO A PASO

## ✅ PASO 1: Verificar que las funciones tienen el código corregido

### ¿Qué hacer?
Ir al Dashboard de Supabase y revisar cada función para ver si tiene el código actualizado.

### ¿Cómo hacerlo?

1. **Abre tu navegador**
2. **Ve a:** https://supabase.com/dashboard
3. **Selecciona tu proyecto**
4. **Haz clic en "Edge Functions"** (en el menú lateral izquierdo)

---

### Verificar función 1: `process-notification`

1. **Haz clic en** `process-notification`
2. **Haz clic en "View Code"** o "Edit" (depende de la versión)
3. **Busca esta línea** (usa Ctrl+F y busca "send-push-notification"):
   ```typescript
   userId: notification.user_id,
   ```
4. **¿Qué ves?**
   - ✅ Si ves `userId:` → Está correcto, pasa al siguiente paso
   - ❌ Si ves `user_id:` → Necesitas actualizar (te explico después)

---

### Verificar función 2: `send-push-notification`

1. **Haz clic en** `send-push-notification`
2. **Haz clic en "View Code"** o "Edit"
3. **Busca esta línea** (usa Ctrl+F y busca "subscription.endpoint"):
   ```typescript
   if (!subscription.endpoint && sub.endpoint) {
   ```
4. **¿Qué ves?**
   - ✅ Si ves esa línea → Está correcto, pasa al siguiente paso
   - ❌ Si NO la ves → Necesitas actualizar (te explico después)

---

### Verificar función 3: `process-pending-notifications`

1. **Haz clic en** `process-pending-notifications`
2. **Haz clic en "View Code"** o "Edit"
3. **Busca esta línea** (usa Ctrl+F y busca ".eq"):
   ```typescript
   .eq('read', false)
   ```
4. **¿Qué ves?**
   - ✅ Si ves `.eq('read', false)` → Está correcto
   - ❌ Si ves `.eq('is_read', false)` → Necesitas actualizar

---

## 🔧 Si alguna función NO está actualizada:

### Opción A: Actualizar desde el Dashboard

1. **Abre la función** que necesita actualización
2. **Haz clic en "Edit"** o "View Code"
3. **Borra TODO el código** que está ahí
4. **Abre el archivo local** en tu computadora:
   - Para `process-notification`: `supabase/functions/process-notification/index.ts`
   - Para `send-push-notification`: `supabase/functions/send-push-notification/index.ts`
   - Para `process-pending-notifications`: `supabase/functions/process-pending-notifications/index.ts`
5. **Copia TODO el contenido** del archivo (Ctrl+A, Ctrl+C)
6. **Pega en el editor** del Dashboard (Ctrl+V)
7. **Haz clic en "Save"** o "Deploy"

---

## ✅ PASO 2: Activar Push Notifications en la app

### ¿Qué hacer?
Activar las notificaciones push desde la aplicación web.

### ¿Cómo hacerlo?

1. **Abre tu aplicación** en el navegador (la URL donde está tu app)
2. **Inicia sesión** con tu cuenta
3. **Ve a Configuración:**
   - Si eres Talent: busca "Configuración" o "Settings"
   - Si eres Business: busca "Configuración" o "Settings"
4. **Busca la sección "Notificaciones"** o "Notifications"
5. **Busca el switch o botón** que dice "Notificaciones Push" o "Push Notifications"
6. **Actívalo** (haz clic para que quede en ON)
7. **El navegador te preguntará:** "¿Permitir notificaciones?"
8. **Haz clic en "Permitir"** o "Allow"

### ¿Cómo verificar que funcionó?

Ejecuta este SQL en Supabase SQL Editor:

```sql
SELECT 
  ps.id,
  u.email,
  ps.endpoint,
  ps.created_at
FROM push_subscriptions ps
LEFT JOIN auth.users u ON u.id = ps.user_id
ORDER BY ps.created_at DESC
LIMIT 5;
```

**Si ves tu email en los resultados** → ✅ Push notifications activadas correctamente
**Si NO ves nada** → ❌ Necesitas volver a activar desde la app

---

## ✅ PASO 3: Crear una notificación de prueba

### ¿Qué hacer?
Crear una notificación de prueba para verificar que todo funciona.

### ¿Cómo hacerlo?

#### 3.1. Obtener tu user_id

1. **Abre Supabase SQL Editor**
2. **Copia y pega este SQL** (reemplaza con tu email):
```sql
SELECT id, email FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com';
```
3. **Ejecuta el SQL** (botón "Run" o F5)
4. **Copia el `id`** que aparece (es un UUID largo, algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

#### 3.2. Crear la notificación

1. **Copia y pega este SQL** (reemplaza `TU_USER_ID_AQUI` con el id que copiaste):
```sql
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
2. **Ejecuta el SQL**
3. **Deberías ver:** "Success. 1 row inserted"

---

## ✅ PASO 4: Verificar que recibiste la notificación

### ¿Qué debería pasar?

Después de crear la notificación, deberías ver:

1. **En la aplicación web:**
   - ✅ Aparece una notificación en tiempo real
   - ✅ El contador de notificaciones se actualiza (número rojo en el ícono de campana)
   - ✅ Puedes hacer clic y ver la notificación

2. **En el navegador:**
   - ✅ Aparece una notificación del navegador (si activaste push)
   - ✅ Puedes hacer clic en ella

3. **En el email:**
   - ✅ Recibes un email (si está configurado RESEND_API_KEY)

### ¿Cómo verificar?

#### Verificar en la app:
1. **Mira la esquina superior derecha** de tu aplicación
2. **Busca el ícono de campana** 🔔
3. **Deberías ver un número rojo** indicando notificaciones sin leer
4. **Haz clic en el ícono** para ver las notificaciones

#### Verificar en los logs:
1. **Ve a Supabase Dashboard**
2. **Edge Functions** → `process-notification` → **Logs**
3. **Busca entradas recientes** que digan:
   - "Processing notification: [id]"
   - "Push notification sent successfully" (si push está activo)
   - "Email sent successfully" (si email está configurado)

---

## ❌ Si algo no funciona

### Problema: No aparece la notificación en la app

**Solución:**
1. **Abre la consola del navegador** (F12 → pestaña "Console")
2. **Busca mensajes** que digan `[useNotifications]`
3. **Verifica que no haya errores** en rojo
4. **Recarga la página** (F5)

### Problema: No aparece push notification

**Solución:**
1. **Verifica que activaste push** desde la app (Paso 2)
2. **Verifica permisos del navegador:**
   - Chrome: Configuración → Privacidad y seguridad → Notificaciones
   - Firefox: Configuración → Privacidad y seguridad → Permisos → Notificaciones
3. **Verifica que la suscripción se guardó** (ejecuta el SQL del Paso 2)

### Problema: No se envía email

**Solución:**
1. **Verifica que RESEND_API_KEY esté configurado:**
   - Supabase Dashboard → Settings → Edge Functions → Secrets
   - Debe existir `RESEND_API_KEY`
2. **Si no existe, agrégalo:**
   - Ve a https://resend.com y crea una cuenta
   - Obtén tu API key
   - Agrégalo en Supabase Secrets

---

## ✅ RESUMEN - Checklist

Marca cada paso cuando lo completes:

- [ ] Paso 1: Verifiqué que las 3 funciones tienen el código actualizado
- [ ] Paso 2: Activé push notifications desde la app
- [ ] Paso 3.1: Obtuve mi user_id con el SQL
- [ ] Paso 3.2: Creé una notificación de prueba
- [ ] Paso 4: Verifiqué que recibí la notificación en la app
- [ ] (Opcional) Verifiqué que recibí push notification en el navegador
- [ ] (Opcional) Verifiqué que recibí email

---

## 🆘 ¿Necesitas ayuda?

Si te quedas atascado en algún paso:
1. **Dime en qué paso estás**
2. **Dime qué error ves** (si hay alguno)
3. **Dime qué resultado obtuviste**

Te ayudo a resolverlo paso a paso.


