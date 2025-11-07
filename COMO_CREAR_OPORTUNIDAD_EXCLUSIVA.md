# 🎓 Cómo Crear una Oportunidad Exclusiva de Academia

## ✅ **IMPLEMENTADO EXITOSAMENTE**

El checkbox para marcar oportunidades como exclusivas **YA ESTÁ DISPONIBLE** en el formulario de creación de oportunidades.

---

## 📍 **Ubicación del Checkbox en el Formulario**

### **Ruta:**
`/business-dashboard/opportunities/new`

### **Paso 1 del Formulario (Detalles del trabajo)**

Al final del **Paso 1**, después de completar todos los campos (categoría, título, descripción, habilidades, etc.), verás:

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Fecha límite *                                          │
│  [Seleccionar fecha]                                        │
│  La oportunidad se cerrará automáticamente cuando pase...   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Visibilidad de la oportunidad                         │ │
│  │                                                       │ │
│  │  ☐ 🎓 Exclusiva para estudiantes de mi academia      │ │
│  │     Solo tus estudiantes y graduados podrán ver      │ │
│  │     y aplicar a esta oportunidad                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Características visuales:**
- ✨ Fondo color morado claro (`bg-purple-50/30`)
- 🎨 Borde morado (`border-purple-200`)
- 📝 Texto descriptivo claro
- 🎓 Icono de graduación

---

## 🔧 **Cómo Usarlo**

### **Para Crear una Oportunidad EXCLUSIVA:**

1. Ve a `/business-dashboard/opportunities/new`
2. Completa el **Paso 1** (Detalles del trabajo):
   - Categoría
   - Título
   - Descripción
   - Tipo de contrato
   - Habilidades
   - Niveles de experiencia
   - Modalidad de trabajo
   - Fecha límite
3. **✅ MARCA el checkbox**: `🎓 Exclusiva para estudiantes de mi academia`
4. Continúa con el **Paso 2** (Presupuesto y duración)
5. Publica la oportunidad

**Resultado:**
- ✅ Solo tus estudiantes/graduados la ven
- ✅ Badge morado "🎓 Exclusiva para Graduados"
- ✅ Aparece en `/business-dashboard/academy` → TAB Oportunidades
- ✅ Control de acceso automático

---

### **Para Crear una Oportunidad PÚBLICA:**

1. Ve a `/business-dashboard/opportunities/new`
2. Completa el **Paso 1** y **Paso 2**
3. **⬜ DEJA el checkbox SIN marcar**
4. Publica la oportunidad

**Resultado:**
- ✅ TODOS los talentos la ven
- ✅ Sin badge especial
- ✅ Mayor alcance

---

## 🎯 **Diferencias entre Oportunidades**

| Característica | Pública | Exclusiva |
|----------------|---------|-----------|
| **Visibilidad** | Todos los talentos | Solo estudiantes/graduados |
| **Badge** | Sin badge | 🎓 "Exclusiva para Graduados" |
| **Estilo** | Estándar | Borde morado + fondo degradado |
| **Acceso por URL** | Abierto | Bloqueado con mensaje |
| **TAB Academia** | No aparece | Sí aparece |
| **Alcance** | Máximo | Limitado a tu academia |

---

## 📊 **Cuándo Usar Cada Tipo**

### **✅ Usa EXCLUSIVAS cuando:**
- 🎓 Quieres dar ventaja competitiva a tus graduados
- 💼 Es una posición de alto valor o prestigio
- 🤝 Tienes acuerdos especiales con la empresa contratante
- 🎯 Quieres asegurar candidatos de calidad certificada
- 🏆 Es un beneficio premium para graduados

### **✅ Usa PÚBLICAS cuando:**
- 📢 Necesitas máximo alcance de candidatos
- 🌍 La posición requiere muchos aplicantes
- ⚡ Urge llenar la vacante rápidamente
- 🆓 Es una posición junior o entry-level
- 💰 El presupuesto es limitado y necesitas opciones

---

## 🔄 **Editar Oportunidad Existente**

Si ya creaste una oportunidad y quieres cambiarla:

1. Ve a `/business-dashboard/opportunities`
2. Encuentra la oportunidad
3. Click en **"Editar"** (icono de lápiz)
4. En el **Paso 1**, marca o desmarca el checkbox
5. Guarda los cambios

**Nota:** Los cambios se aplican inmediatamente. Si cambias de pública a exclusiva, solo tus estudiantes podrán verla a partir de ese momento.

---

## 🎨 **Vista Previa del Checkbox**

```
╔═══════════════════════════════════════════════════════════╗
║ Visibilidad de la oportunidad                            ║
║                                                           ║
║  ☑️ 🎓 Exclusiva para estudiantes de mi academia         ║
║     Solo tus estudiantes y graduados podrán ver          ║
║     y aplicar a esta oportunidad                         ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🐛 **Solución de Problemas**

### **"No veo el checkbox"**
- ✅ Asegúrate de estar en el **Paso 1** del formulario
- ✅ Haz scroll hasta el **final** del Paso 1 (después de Fecha límite)
- ✅ Verifica que los cambios estén sincronizados (hacer pull de Git)

### **"Marqué el checkbox pero todos pueden verla"**
- ✅ Verifica que guardaste/publicaste correctamente
- ✅ Revisa en la base de datos: `is_academy_exclusive` debe ser `true`
- ✅ Ejecuta el SQL del archivo `SQL_MARCAR_OPORTUNIDADES_EXCLUSIVAS.sql`

### **"¿Cómo sé si funcionó?"**
1. Ve a `/business-dashboard/academy` → TAB "Oportunidades"
2. Deberías ver la oportunidad listada allí
3. Como talento NO estudiante, no debería aparecer en `/talent-dashboard/opportunities`

---

## 📝 **Recordatorio: SQL para Oportunidades Existentes**

Si creaste oportunidades **ANTES** de esta implementación y quieres marcarlas como exclusivas:

```sql
-- Ejecutar en Supabase SQL Editor
UPDATE opportunities
SET is_academy_exclusive = true
WHERE company_id = '1a36ae8f-d716-4cb1-a9f6-e09b804ce30d'
  AND status = 'active';
```

Ver archivo: `SQL_MARCAR_OPORTUNIDADES_EXCLUSIVAS.sql`

---

## ✨ **¡Listo para Usar!**

El sistema está completamente implementado y funcionando. Solo necesitas:

1. ✅ Marcar el checkbox al crear nuevas oportunidades
2. ✅ (Opcional) Ejecutar el SQL para oportunidades antiguas
3. ✅ ¡Disfruta del control total sobre quién ve tus oportunidades!

---

**¿Dudas o problemas?** Revisa los archivos:
- 📄 `FIX_OPORTUNIDADES_ACADEMY.md` - Documentación técnica completa
- 📄 `SQL_MARCAR_OPORTUNIDADES_EXCLUSIVAS.sql` - SQL para oportunidades existentes

