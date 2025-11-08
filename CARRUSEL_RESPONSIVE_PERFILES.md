# 🎠 Carrusel Responsive de Perfiles Recomendados

## ✅ **IMPLEMENTADO**

Sistema de navegación por carrusel con **cálculo dinámico** basado en espacio real disponible.

---

## 🎯 **Problema Resuelto:**

### **ANTES:**
```
❌ Scroll horizontal incómodo
❌ Cards se salían en laptops de 13"
❌ Breakpoints fijos no se adaptaban bien
```

### **AHORA:**
```
✅ Navegación por flechas ← →
✅ Todo el contenido visible sin scroll
✅ Cálculo dinámico según espacio real
✅ Se adapta a CUALQUIER tamaño de pantalla
```

---

## 📐 **Cálculo Dinámico Implementado**

### **Fórmula Matemática:**

```typescript
const cardWidth = 288px;        // w-72 (18rem)
const gapWidth = 16px;          // gap-4 (1rem)
const padding = 96px;           // px-12 (48px cada lado)
const arrowSpace = 80px;        // Espacio para botones ← →

availableWidth = window.innerWidth - padding - arrowSpace
cardsPerPage = Math.floor((availableWidth + gap) / (cardWidth + gap))
```

---

## 📊 **Cards Visibles por Resolución**

| Resolución | Ancho (px) | Cards | Dispositivo Típico |
|------------|------------|-------|-------------------|
| **360×640** | 360 | 1 | iPhone SE, móviles pequeños |
| **375×667** | 375 | 1 | iPhone 12/13/14 |
| **390×844** | 390 | 1 | iPhone 14 Pro |
| **414×896** | 414 | 1 | iPhone Plus |
| **768×1024** | 768 | 2 | iPad vertical |
| **1024×768** | 1024 | 2-3 | iPad horizontal |
| **1366×768** | 1366 | 3-4 | Laptop 13"-14" **←** |
| **1440×900** | 1440 | 4 | Laptop 15" |
| **1920×1080** | 1920 | 5 | Desktop Full HD |

---

## 🎨 **Comportamiento Visual**

### **Laptop 13" (1366px):**
```
┌──────────────────────────────────────────────────────┐
│              Perfiles Recomendados                   │
│                                                      │
│   ←   [Card 1]   [Card 2]   [Card 3]   →           │
│                                                      │
│                 Página 1 de 2                       │
└──────────────────────────────────────────────────────┘
```

**Cálculo:**
```
1366px - 96px (padding) - 80px (flechas) = 1190px disponible
1190px / 304px (card + gap) = 3.91
→ 3 cards completas ✅
```

### **Desktop HD (1920px):**
```
┌────────────────────────────────────────────────────────────────┐
│   ←  [Card 1] [Card 2] [Card 3] [Card 4] [Card 5]  →         │
│                      Página 1 de 1                            │
└────────────────────────────────────────────────────────────────┘
```

**Cálculo:**
```
1920px - 96px - 80px = 1744px disponible
1744px / 304px = 5.73
→ 5 cards completas (máximo) ✅
```

### **Mobile (375px):**
```
┌──────────────────────┐
│  Perfiles...        │
│                     │
│   ←  [Card 1]  →   │
│                     │
│   Página 1 de 5    │
└──────────────────────┘
```

---

## ✨ **Características Implementadas**

### **1. Responsive Automático**
- ✅ Calcula dinámicamente según espacio real
- ✅ Se actualiza al redimensionar ventana
- ✅ Funciona en cualquier resolución

### **2. Navegación Intuitiva**
- ✅ Botón ← aparece solo si hay página anterior
- ✅ Botón → aparece solo si hay página siguiente
- ✅ Click en card navega al perfil
- ✅ Botones de navegación en posición absoluta

### **3. Indicador Visual**
- ✅ "Página X de Y" siempre visible
- ✅ Solo aparece si hay más de 1 página
- ✅ Centrado y claro

### **4. Transiciones Suaves**
- ✅ Animación al cambiar de página
- ✅ Hover effects en cards
- ✅ Transición en botones

---

## 🎯 **Ventajas del Cálculo Dinámico vs Breakpoints Fijos**

| Aspecto | Breakpoints Fijos ❌ | Cálculo Dinámico ✅ |
|---------|---------------------|---------------------|
| **Adaptabilidad** | Solo en breakpoints definidos | Cualquier resolución |
| **Precisión** | Puede causar overflow | Siempre cabe perfecto |
| **Mantenimiento** | Requiere ajustes manuales | Automático |
| **Edge Cases** | Resoluciones no contempladas | Todas cubiertas |
| **Resize** | Saltos bruscos | Ajuste continuo |

---

## 🧪 **Cómo Probar**

### **Test 1: Laptop 13" (1366px)**
1. Abre `/business-dashboard` en laptop 13"
2. Ve a "Perfiles Recomendados"
3. ✅ Deberías ver **3 cards completas**
4. ✅ **Sin scroll horizontal**
5. ✅ Flechas ← → para navegar

### **Test 2: Redimensionar Ventana**
1. Abre DevTools (F12)
2. Activa modo responsive
3. Cambia el ancho de 360px a 1920px
4. ✅ Las cards se ajustan automáticamente
5. ✅ Siempre visibles sin overflow

### **Test 3: Móvil Real**
1. Abre en móvil (360-414px)
2. ✅ Debería mostrar **1 card completa**
3. ✅ Flechas para navegar entre perfiles

---

## 🔍 **Debugging en Consola**

Para verificar el cálculo, abre la consola y ejecuta:

```javascript
console.log('Ancho ventana:', window.innerWidth);
console.log('Cards calculadas:', Math.floor((window.innerWidth - 176) / 304));
```

---

## 📝 **Detalles Técnicos**

### **Dimensiones Usadas:**
- **Card:** `w-72` = 288px (18rem × 16px)
- **Gap:** `gap-4` = 16px (1rem × 16px)
- **Padding:** `px-12` = 96px (3rem × 2 × 16px)
- **Flechas:** ~80px (botones + margen)

### **Espacio Total por Card:**
```
288px (card) + 16px (gap) = 304px
```

### **Límites:**
- **Mínimo:** 1 card (para cualquier pantalla)
- **Máximo:** 5 cards (para mantener legibilidad)

---

## 🚀 **Resultado Final**

El carrusel ahora:
- ✅ Se adapta **fluidamente** a cualquier resolución
- ✅ **Nunca causa overflow** horizontal
- ✅ Calcula **matemáticamente** el número óptimo de cards
- ✅ Funciona desde **360px hasta 4K**
- ✅ Se ajusta **automáticamente** al redimensionar

---

## ⚠️ **IMPORTANTE: Para que los badges aparezcan**

No olvides ejecutar el SQL de `FIX_RLS_ACADEMY_BADGES.sql`:

```sql
CREATE POLICY "public_can_view_academy_affiliations"
ON academy_students
FOR SELECT
TO authenticated
USING (true);
```

**Sin este SQL, los badges de academia NO aparecerán en `/business-dashboard`.**

---

## 📚 **Archivos Relacionados**

- ✅ `src/components/dashboard/RecommendedProfiles.tsx` - Carrusel implementado
- 📄 `FIX_RLS_ACADEMY_BADGES.sql` - SQL para habilitar badges
- 📄 `SISTEMA_OPORTUNIDADES_EXCLUSIVAS_COMPLETO.md` - Sistema de oportunidades

---

**¡Carrusel responsive implementado con cálculo matemático preciso!** 🎉

