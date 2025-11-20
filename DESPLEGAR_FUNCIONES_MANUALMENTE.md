# 🚀 DESPLEGAR FUNCIONES MANUALMENTE (Sin CLI)

Como el CLI de Supabase no está instalado, puedes desplegar las funciones desde el Dashboard web.

## 📋 PASOS PARA DESPLEGAR

### 1. Ve al Dashboard de Supabase

1. Abre: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a la sección **"Edge Functions"** en el menú lateral

---

### 2. Desplegar `process-notification`

1. Busca la función `process-notification` en la lista
2. Haz clic en ella
3. Haz clic en el botón **"Deploy"** o **"Redeploy"**
4. Espera a que termine el despliegue

**O si la función no existe:**
1. Haz clic en **"Create a new function"**
2. Nombre: `process-notification`
3. Copia el contenido de: `supabase/functions/process-notification/index.ts`
4. Pega en el editor
5. Haz clic en **"Deploy"**

---

### 3. Desplegar `send-push-notification`

1. Busca la función `send-push-notification` en la lista
2. Haz clic en ella
3. Haz clic en el botón **"Deploy"** o **"Redeploy"**
4. Espera a que termine el despliegue

**O si la función no existe:**
1. Haz clic en **"Create a new function"**
2. Nombre: `send-push-notification`
3. Copia el contenido de: `supabase/functions/send-push-notification/index.ts`
4. Pega en el editor
5. Haz clic en **"Deploy"**

---

### 4. Desplegar `process-pending-notifications`

1. Busca la función `process-pending-notifications` en la lista
2. Haz clic en ella
3. Haz clic en el botón **"Deploy"** o **"Redeploy"**
4. Espera a que termine el despliegue

**O si la función no existe:**
1. Haz clic en **"Create a new function"**
2. Nombre: `process-pending-notifications`
3. Copia el contenido de: `supabase/functions/process-pending-notifications/index.ts`
4. Pega en el editor
5. Haz clic en **"Deploy"**

---

## ✅ VERIFICACIÓN

Después de desplegar las 3 funciones:

1. Ve a **Edge Functions** en el dashboard
2. Verifica que las 3 funciones aparezcan con estado **"Active"** o **"Deployed"**
3. Haz clic en cada una y verifica que no haya errores en los logs

---

## 🔍 VERIFICAR QUE LOS CAMBIOS SE APLICARON

Para verificar que las correcciones están en las funciones desplegadas:

### Verificar `process-notification`:
1. Abre la función en el dashboard
2. Busca en el código la línea que dice: `userId: notification.user_id`
3. Debe decir `userId` (no `user_id`)

### Verificar `send-push-notification`:
1. Abre la función en el dashboard
2. Busca la línea que verifica el endpoint: `if (!subscription.endpoint && sub.endpoint)`
3. Debe estar presente

### Verificar `process-pending-notifications`:
1. Abre la función en el dashboard
2. Busca la línea: `.eq('read', false)`
3. Debe decir `read` (no `is_read`)

---

## 📝 NOTA IMPORTANTE

Si las funciones ya existían, el dashboard puede mostrar una versión antigua. Asegúrate de:
- Copiar el contenido actualizado de los archivos locales
- Pegarlo completamente en el editor del dashboard
- Guardar y desplegar

Los archivos actualizados están en:
- `supabase/functions/process-notification/index.ts`
- `supabase/functions/send-push-notification/index.ts`
- `supabase/functions/process-pending-notifications/index.ts`


