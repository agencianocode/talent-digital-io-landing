# 📬 GUÍA COMPLETA DE NOTIFICACIONES

## 🎯 RESUMEN

Este sistema de notificaciones incluye **TODAS** las funcionalidades solicitadas:

### ✅ **Notificaciones Automáticas (Ya Activas)**
- ⏰ Oportunidades por vencer (7 días y 1 día)
- 📊 Oportunidades sin actividad (5 días)
- 🎯 Milestones de postulantes (5, 10, 25, 50, 100)

### ✅ **Notificaciones de Equipo (Nuevas)**
- 👥 Nuevo miembro se une
- 🔔 Solicitud de acceso pendiente

### ✅ **Notificaciones de Moderación (Nuevas)**
- ⚠️ Oportunidad dada de baja
- 🚨 Advertencias a empresas
- 🚫 Suspensión de cuenta

### ✅ **Notificaciones de Marketplace (Nuevas)**
- 🟣 Consulta sobre servicio
- ⭐ Nueva reseña
- ✅ Solicitud aceptada/rechazada
- 🌟 Servicio destacado

---

## 🚀 INSTALACIÓN

### **Paso 1: Ejecutar SQL en Supabase**

Ejecuta este archivo SQL en el SQL Editor de Supabase:

```sql
-- Archivo: supabase/migrations/20251007_ALL_NOTIFICATIONS.sql
```

O ejecuta los archivos individuales:
1. `20251007_team_notifications.sql`
2. `20251007_moderation_notifications.sql`
3. `20251007_marketplace_notifications.sql`
4. `20251007_web_push_setup.sql`

---

## 📋 CÓMO USAR CADA TIPO DE NOTIFICACIÓN

### 🟤 **1. NOTIFICACIONES DE EQUIPO**

#### **A) Nuevo Miembro se Une**
**Trigger automático** cuando se inserta en `user_roles`:

```typescript
// Ejemplo: Cuando aceptas una invitación
const { error } = await supabase
  .from('user_roles')
  .insert({
    user_id: newMemberId,
    company_id: companyId,
    role: 'editor' // o 'viewer', 'admin', etc.
  });

// Automáticamente:
// 1. El owner de la empresa recibe: "👥 Juan Pérez se unió a TuEmpresa como Editor"
// 2. El nuevo miembro recibe: "🎉 Te has unido a TuEmpresa como Editor"
```

#### **B) Solicitud de Acceso**
**Llamada manual** cuando alguien solicita unirse:

```typescript
// En tu componente de solicitud de acceso
const handleRequestAccess = async () => {
  const { error } = await supabase.rpc('notify_access_request', {
    p_company_id: companyId,
    p_requester_id: user.id,
    p_requested_role: 'editor'
  });
  
  // El owner recibe: "🔔 Juan Pérez solicitó unirse a TuEmpresa como Editor"
};
```

---

### 🟠 **2. NOTIFICACIONES DE MODERACIÓN**

#### **A) Dar de Baja una Oportunidad**
**Llamada desde panel de administración**:

```typescript
// En el panel de admin
const handleRemoveOpportunity = async (opportunityId: string) => {
  const { error } = await supabase.rpc('notify_opportunity_removed', {
    p_opportunity_id: opportunityId,
    p_reason: 'contenido inapropiado'
  });
  
  // El owner de la empresa recibe:
  // "⚠️ Tu oportunidad 'Desarrollador React' ha sido dada de baja por contenido inapropiado"
};
```

#### **B) Enviar Advertencia a Empresa**
```typescript
// En el panel de admin
const handleWarnCompany = async (companyId: string) => {
  const { error } = await supabase.rpc('notify_company_warning', {
    p_company_id: companyId,
    p_warning_title: 'Advertencia por spam',
    p_warning_message: 'Has publicado demasiadas oportunidades en poco tiempo. Por favor revisa nuestras políticas.'
  });
};
```

---

### 🟣 **3. NOTIFICACIONES DE MARKETPLACE**

#### **A) Consulta sobre Servicio**
**Llamada cuando alguien contacta**:

```typescript
// Cuando un usuario hace clic en "Contactar" en un servicio
const handleContactService = async (serviceId: string) => {
  const { error } = await supabase.rpc('notify_service_inquiry', {
    p_service_id: serviceId,
    p_inquirer_id: user.id,
    p_message: 'Estoy interesado en tu servicio de diseño'
  });
  
  // El dueño del servicio recibe:
  // "🟣 María López consultó por tu servicio 'Diseño de Logos'"
};
```

#### **B) Destacar un Servicio**
```typescript
// En el panel de admin
const handleFeatureService = async (serviceId: string) => {
  const { error } = await supabase.rpc('notify_service_featured', {
    p_service_id: serviceId,
    p_duration_days: 14
  });
  
  // El dueño recibe:
  // "🌟 ¡Felicidades! Tu servicio 'Consultoría SEO' ha sido destacado por 14 días"
};
```

---

## 🔔 **4. WEB PUSH NOTIFICATIONS**

### **Configuración Requerida:**

1. **Generar VAPID Keys**:
```bash
npx web-push generate-vapid-keys
```

2. **Actualizar `usePushNotifications.ts`**:
```typescript
// Línea 76
const vapidPublicKey = 'TU_VAPID_PUBLIC_KEY_AQUI';
```

3. **Configurar Backend** (Supabase Edge Function):
```typescript
// supabase/functions/send-push/index.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:tu@email.com',
  'TU_VAPID_PUBLIC_KEY',
  'TU_VAPID_PRIVATE_KEY'
);

// Enviar notificación push
const subscription = /* obtener de push_subscriptions */;
await webpush.sendNotification(subscription, JSON.stringify({
  title: 'Nuevo mensaje',
  body: 'Tienes un nuevo mensaje de...',
  icon: '/logo192.png',
  url: '/business-dashboard/messages'
}));
```

---

## 📊 **EJEMPLOS DE INTEGRACIÓN EN COMPONENTES**

### **En el Panel de Admin:**

```typescript
// src/pages/AdminPanel.tsx
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const handleRemoveOpportunity = async (opportunityId: string) => {
    // Dar de baja y notificar
    await supabase.rpc('notify_opportunity_removed', {
      p_opportunity_id: opportunityId,
      p_reason: 'Contenido spam detectado'
    });
    
    toast.success('Oportunidad eliminada y empresa notificada');
  };
  
  const handleWarnCompany = async (companyId: string) => {
    await supabase.rpc('notify_company_warning', {
      p_company_id: companyId,
      p_warning_title: 'Violación de términos',
      p_warning_message: 'Por favor revise nuestras políticas...'
    });
    
    toast.success('Advertencia enviada');
  };
  
  return (/* UI del panel */);
};
```

### **En TalentDiscovery (Contactar Servicio):**

```typescript
// src/pages/TalentDiscovery.tsx
const handleContactService = async (serviceId: string) => {
  // 1. Notificar al dueño del servicio
  await supabase.rpc('notify_service_inquiry', {
    p_service_id: serviceId,
    p_inquirer_id: user.id,
    p_message: messageText
  });
  
  // 2. Crear conversación
  const conversationId = await getOrCreateConversation(
    serviceOwnerId,
    'service_inquiry',
    serviceId
  );
  
  // 3. Enviar mensaje
  await sendMessage({
    conversation_id: conversationId,
    recipient_id: serviceOwnerId,
    message_type: 'service_inquiry',
    content: messageText,
  });
  
  toast.success('Consulta enviada correctamente');
};
```

---

## 🧪 **PRUEBAS**

### **Probar Notificaciones de Equipo:**
```sql
-- En Supabase SQL Editor
INSERT INTO user_roles (user_id, company_id, role)
VALUES (
  '8fb4eef0-1942-4449-841b-cb94d849c0e3', -- ID del nuevo miembro
  (SELECT id FROM companies LIMIT 1),      -- ID de la empresa
  'editor'
);

-- Verifica que se crearon 2 notificaciones:
SELECT * FROM notifications WHERE type = 'team' ORDER BY created_at DESC LIMIT 5;
```

### **Probar Moderación:**
```sql
-- Eliminar una oportunidad
SELECT notify_opportunity_removed(
  (SELECT id FROM opportunities LIMIT 1),
  'contenido inapropiado'
);

-- Ver notificación creada
SELECT * FROM notifications WHERE type = 'moderation' ORDER BY created_at DESC LIMIT 1;
```

### **Probar Marketplace:**
```sql
-- Consulta sobre servicio
SELECT notify_service_inquiry(
  (SELECT id FROM marketplace_services LIMIT 1),
  '8fb4eef0-1942-4449-841b-cb94d849c0e3',
  'Estoy interesado en tu servicio'
);

-- Ver notificación
SELECT * FROM notifications WHERE type = 'marketplace' ORDER BY created_at DESC LIMIT 1;
```

---

## 📈 **MONITOREO**

### **Ver Estadísticas de Notificaciones:**
```sql
-- Notificaciones por tipo
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE read = false) as no_leidas
FROM notifications
GROUP BY type
ORDER BY total DESC;

-- Notificaciones recientes
SELECT 
  n.type,
  n.title,
  n.message,
  n.created_at,
  COALESCE(p.full_name, u.email) as destinatario
FROM notifications n
JOIN auth.users u ON n.user_id = u.id
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 20;
```

---

## ⚙️ **MANTENIMIENTO**

### **Limpiar Notificaciones Antiguas:**
```sql
-- Eliminar notificaciones leídas de más de 90 días
DELETE FROM notifications
WHERE read = true
  AND read_at < NOW() - INTERVAL '90 days';

-- Limpiar suscripciones push inactivas
SELECT cleanup_old_push_subscriptions();
```

---

## 🎉 **ESTADO FINAL**

### ✅ **Implementado y Funcionando:**
- [x] Notificaciones automáticas de oportunidades
- [x] Notificaciones de equipo
- [x] Notificaciones de moderación
- [x] Notificaciones de marketplace
- [x] Sistema de mensajería completo
- [x] Adjuntos de archivos
- [x] Typing indicators
- [x] Read receipts
- [x] Filtros y búsqueda
- [x] Web Push (infraestructura lista, falta VAPID key)

### ⚠️ **Pendiente de Configuración:**
- [ ] Generar y configurar VAPID keys reales
- [ ] Crear Supabase Edge Function para envío de push
- [ ] Configurar cron job externo si no tienes pg_cron

---

## 📞 **SOPORTE**

Si necesitas ayuda adicional:
1. Revisa los logs en Supabase SQL Editor
2. Verifica que las funciones existen: `SELECT * FROM information_schema.routines WHERE routine_name LIKE 'notify_%'`
3. Comprueba triggers: `SELECT * FROM information_schema.triggers WHERE trigger_name LIKE '%notif%'`

---

**¡TODO LISTO! 🚀**

