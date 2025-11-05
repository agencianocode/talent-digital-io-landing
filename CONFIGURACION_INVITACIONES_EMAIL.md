# 📧 Configuración de Invitaciones por Email

## 🎯 Problema Resuelto

Las invitaciones enviadas desde `/business-dashboard/academy` en la sección "Enviar Invitaciones por Email" no estaban llegando porque el código solo insertaba registros en la base de datos pero **no enviaba emails reales**.

---

## ✅ Solución Implementada

Se creó una **Edge Function** en Supabase que:
1. Recibe los emails y el mensaje personalizado
2. Envía emails HTML profesionales usando Resend
3. Incluye el link de invitación en cada email
4. Personaliza el email con los colores y nombre de la academia

---

## 🔧 Configuración Requerida

### **Paso 1: Desplegar la Edge Function**

La función ya está creada en:
```
supabase/functions/send-academy-invitations/index.ts
```

Para desplegarla en Supabase:

```bash
# Navegar al directorio de funciones
cd supabase/functions

# Desplegar la función
supabase functions deploy send-academy-invitations
```

O desde el dashboard de Supabase:
1. Ve a **Edge Functions**
2. Click en **"New Function"**
3. Sube el archivo `send-academy-invitations/index.ts`

---

### **Paso 2: Configurar Variables de Entorno**

En el **Dashboard de Supabase** → **Edge Functions** → **Settings** → **Secrets**, agrega:

#### **Variables Requeridas:**

1. **`RESEND_API_KEY`** (Requerido)
   - Obtén tu API key en: https://resend.com
   - Crea una cuenta gratuita (100 emails/día gratis)
   - Ve a **API Keys** y crea una nueva
   - Ejemplo: `re_123abc456def789ghi012jkl345mno678`

2. **`APP_URL`** (Requerido)
   - La URL de tu aplicación en producción
   - Ejemplo: `https://app.talentodigital.io`
   - Se usa para generar los links de invitación

3. **`SUPABASE_URL`** (Automática)
   - Ya está configurada por Supabase
   - No necesitas agregarla manualmente

4. **`SUPABASE_ANON_KEY`** (Automática)
   - Ya está configurada por Supabase
   - No necesitas agregarla manualmente

---

### **Paso 3: Configurar el Dominio de Email en Resend**

1. Ve a https://resend.com/domains
2. Agrega tu dominio (ej: `talentodigital.io`)
3. Configura los registros DNS que te proporcionen:
   - SPF
   - DKIM
   - DMARC
4. Espera la verificación (puede tardar hasta 24 horas)

**Mientras tanto**, puedes usar el dominio de prueba de Resend:
- Solo podrás enviar emails a direcciones que agregues como "verified emails"
- Ve a **Settings** → **Verified Emails** en Resend

---

## 📝 Cómo Usar

### **En la Aplicación:**

1. Ve a `/business-dashboard/academy`
2. Navega a la sección **"Enviar Invitaciones por Email"**
3. Ingresa los emails separados por comas:
   ```
   estudiante1@example.com, estudiante2@example.com
   estudiante3@example.com
   ```
4. (Opcional) Agrega un mensaje personalizado
5. Click en **"Enviar Invitaciones"**

### **Lo que sucede:**

1. ✅ Los estudiantes se agregan a la base de datos
2. ✅ Se envía un email HTML profesional a cada uno
3. ✅ El email incluye:
   - Nombre y colores de la academia
   - Mensaje personalizado (si se proporcionó)
   - Botón para aceptar la invitación
   - Link alternativo en texto plano

---

## 📧 Ejemplo de Email Enviado

```html
🎓 Invitación a [Nombre de la Academia]

¡Hola!

Has sido invitado a unirte a [Academia] en TalentoDigital.io

[Mensaje personalizado si existe]

[Botón: Aceptar Invitación]

Si el botón no funciona, copia y pega este enlace:
https://app.talentodigital.io/accept-academy-invitation?academy=...
```

---

## 🔍 Verificar que Funciona

### **Logs en Supabase:**

1. Ve a **Edge Functions** → **send-academy-invitations**
2. Click en **"Logs"**
3. Deberías ver:
   ```
   📧 Enviando 3 invitaciones para [Academia]
   ✅ Email enviado a estudiante1@example.com
   ✅ Email enviado a estudiante2@example.com
   ✅ Email enviado a estudiante3@example.com
   ```

### **En Resend Dashboard:**

1. Ve a https://resend.com/emails
2. Deberías ver los emails enviados con estado "Delivered"

---

## ⚠️ Troubleshooting

### **Error: "RESEND_API_KEY no configurada"**
- Verifica que agregaste la variable en Supabase Edge Functions Secrets
- Redespliega la función después de agregar las variables

### **Error: "Error enviando email"**
- Verifica que tu dominio esté verificado en Resend
- Si usas el dominio de prueba, asegúrate de que los emails estén en "Verified Emails"

### **Los emails llegan a spam:**
- Verifica la configuración DNS (SPF, DKIM, DMARC)
- Usa un dominio verificado y propio
- Evita palabras spam en el asunto/mensaje

### **"Estudiantes agregados pero error al enviar emails"**
- Los estudiantes se guardaron correctamente en la BD
- El error solo afectó el envío de emails
- Revisa los logs de la Edge Function para más detalles

---

## 📊 Límites de Resend

### **Plan Gratuito:**
- 100 emails/día
- 3,000 emails/mes
- Dominio de prueba incluido

### **Plan de Pago:**
- Desde $20/mes por 50,000 emails
- Dominios ilimitados
- Soporte prioritario

---

## 🔐 Seguridad

- ✅ La Edge Function usa CORS para permitir solo tu dominio
- ✅ Los emails se envían de forma asíncrona (no bloquean la UI)
- ✅ Se valida que los emails sean válidos antes de enviar
- ✅ Los errores se manejan gracefully (los estudiantes se guardan aunque falle el email)

---

## 📝 Archivos Modificados

1. **`supabase/functions/send-academy-invitations/index.ts`** (NUEVO)
   - Edge Function que envía los emails

2. **`src/components/academy/InvitationManager.tsx`** (MODIFICADO)
   - Actualizado para llamar a la Edge Function
   - Muestra mensajes de error más claros
   - Maneja el mensaje personalizado

---

## 🎉 Resultado

Ahora cuando envíes invitaciones:
- ✅ Los estudiantes recibirán un email profesional
- ✅ El mensaje personalizado se incluirá en el email
- ✅ Los emails tendrán los colores de la academia
- ✅ Incluirán un link directo para aceptar la invitación

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la Edge Function en Supabase
2. Verifica la configuración de Resend
3. Asegúrate de que las variables de entorno estén correctas

