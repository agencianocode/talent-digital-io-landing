# 🔧 FIX: Filtro de Experiencia en Oportunidades

## 📋 **Problema Identificado**

El filtro de experiencia muestra siempre la misma oportunidad ("Closer de Ventas SalesXcelerator") sin importar qué nivel se seleccione.

### **Causa Raíz:**

De las 3 oportunidades activas en la base de datos:

| Oportunidad | experience_levels | Estado |
|------------|-------------------|---------|
| Closer de Ventas SalesXcelerator | `{principiante,intermedio,avanzado,experto}` | ✅ Tiene TODOS los niveles |
| Closer de Ventas | `NULL` | ❌ No aparece en filtros |
| Media Buyer | `NULL` | ❌ No aparece en filtros |

**Resultado:** Solo 1 oportunidad tiene `experience_levels` definido, y como tiene TODOS los niveles, aparece siempre.

---

## 🛠️ **Solución**

Asignar niveles de experiencia específicos a cada oportunidad usando SQL.

### **Paso 1: Acceder al SQL Editor**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/wyrieetebfzmgffxecpz/sql)
2. Click en "SQL Editor" (menú lateral izquierdo)
3. Click en "+ New query"

---

### **Paso 2: Elegir una Opción**

#### **OPCIÓN A: Niveles Específicos (Recomendado)** 🎯

Esta opción permite un filtrado más preciso. Las oportunidades junior solo aparecerán para principiantes/intermedios, y las senior solo para avanzados/expertos.

```sql
-- "Closer de Ventas" → Solo para principiantes e intermedios
UPDATE opportunities
SET experience_levels = ARRAY['principiante', 'intermedio']::text[]
WHERE title = 'Closer de Ventas'
  AND experience_levels IS NULL;

-- "Media Buyer" → Para niveles intermedios a expertos
UPDATE opportunities
SET experience_levels = ARRAY['intermedio', 'avanzado', 'experto']::text[]
WHERE title = 'Media Buyer'
  AND experience_levels IS NULL;
```

**Resultado después:**
- Filtro **"Principiante"** → Muestra: "Closer de Ventas" y "Closer SalesXcelerator"
- Filtro **"Intermedio"** → Muestra: Las 3 oportunidades
- Filtro **"Avanzado"** → Muestra: "Media Buyer" y "Closer SalesXcelerator"
- Filtro **"Experto"** → Muestra: "Media Buyer" y "Closer SalesXcelerator"

---

#### **OPCIÓN B: Todos los Niveles (Más Simple)**

Esta opción asigna todos los niveles a todas las oportunidades. Todas aparecerán sin importar el filtro.

```sql
-- Actualizar todas las oportunidades con NULL
UPDATE opportunities
SET experience_levels = ARRAY['principiante', 'intermedio', 'avanzado', 'experto']::text[]
WHERE experience_levels IS NULL
  AND status = 'active';
```

**Resultado después:**
- Cualquier filtro de experiencia → Muestra las 3 oportunidades

---

### **Paso 3: Verificar los Cambios**

Ejecuta esta query para confirmar:

```sql
SELECT 
    title,
    experience_levels::text as niveles
FROM opportunities
WHERE status = 'active'
ORDER BY created_at DESC;
```

**Resultado esperado:**
```
Closer de Ventas SalesXcelerator | {principiante,intermedio,avanzado,experto}
Closer de Ventas                 | {principiante,intermedio}
Media Buyer                      | {intermedio,avanzado,experto}
```

---

## ✅ **Validación en la Aplicación**

1. Ve a `/talent-dashboard/opportunities`
2. Abre el filtro de "Experiencia"
3. Selecciona **"Principiante"**
   - ✅ Deberían aparecer: "Closer de Ventas" y "Closer SalesXcelerator"
   - ❌ NO debería aparecer: "Media Buyer"
4. Selecciona **"Experto"**
   - ✅ Deberían aparecer: "Media Buyer" y "Closer SalesXcelerator"
   - ❌ NO debería aparecer: "Closer de Ventas"

---

## 🎯 **Recomendación Final**

**Usar OPCIÓN A** para mejor experiencia de usuario:
- Los talentos junior no verán oportunidades senior que no pueden aplicar
- Los talentos expertos no verán oportunidades junior que no les interesan
- Mejora la relevancia de los resultados

---

## 📝 **Notas Importantes**

1. **Sincronización con Lovable**: Estos cambios son solo en la base de datos, no requieren push/pull
2. **Nuevas Oportunidades**: Al crear nuevas oportunidades, asegúrate de asignar `experience_levels` desde el formulario
3. **Validación**: El filtro ahora excluye oportunidades con `experience_levels = NULL` para evitar resultados inconsistentes

---

## 📂 **Archivo SQL**

El SQL completo con ambas opciones está en:
```
supabase/migrations/update_experience_levels_opportunities.sql
```

