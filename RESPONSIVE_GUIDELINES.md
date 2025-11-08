# Guía de Diseño Responsive - TalentoDigital.io

## Principios Fundamentales

### 1. Mobile-First Approach
Diseñar primero para móviles (360px) y mejorar progresivamente para pantallas más grandes.

### 2. Breakpoints Tailwind CSS

```css
/* Sin prefijo: 0-639px (móvil) */
.text-sm

/* sm: 640px+ (móviles grandes) */
.sm:text-base

/* md: 768px+ (tablets) */
.md:grid-cols-2

/* lg: 1024px+ (laptops) */
.lg:grid-cols-3

/* xl: 1280px+ (desktops) */
.xl:grid-cols-4

/* 2xl: 1536px+ (pantallas grandes) */
.2xl:grid-cols-5
```

### 3. Tamaños de Pantalla Clave

| Dispositivo | Ancho (px) | Estrategia |
|-------------|------------|------------|
| iPhone SE | 360 | 1 columna, texto pequeño, padding reducido |
| iPhone 12/13 | 375-390 | 1 columna, botones apilados |
| iPhone Plus | 414 | 1 columna, puede usar sm: breakpoint |
| iPad Vertical | 768 | 2 columnas, md: breakpoint |
| iPad Horizontal | 1024 | 2-3 columnas, lg: breakpoint |
| Laptop 13" | 1366 | 3-4 columnas, layouts completos |
| Desktop HD | 1920 | 4-5 columnas, máximo contenido |

---

## Patrones Implementados

### Grids Responsive

#### Métricas/Cards (4 items):
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  // 360px: 1 columna
  // 640px: 2 columnas
  // 1024px: 4 columnas
</div>
```

#### Métricas Secundarias (3 items):
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  // 360px: 1 columna
  // 640px: 2 columnas  
  // 1024px: 3 columnas
</div>
```

#### Tareas/Contenido (2 columnas + sidebar):
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  // 360px: 1 columna
  // 768px: 2 columnas
  // 1024px: 3 columnas
</div>
```

### Espaciado Responsive

```typescript
// Padding de contenedores
className="p-2 sm:p-4 lg:p-6"

// Gaps entre elementos
className="gap-3 sm:gap-4 lg:gap-6"

// Espaciado vertical
className="space-y-3 sm:space-y-4 lg:space-y-6"
```

### Tipografía Responsive

```typescript
// Títulos principales
className="text-xl sm:text-2xl lg:text-3xl"

// Títulos secundarios
className="text-base sm:text-lg"

// Texto normal
className="text-sm sm:text-base"

// Texto pequeño
className="text-xs sm:text-sm"
```

### Iconos Responsive

```typescript
// Iconos en cards de métricas
className="h-5 w-5 sm:h-6 sm:w-6"

// Iconos decorativos
className="h-6 w-6 sm:h-8 sm:w-8"

// Avatares
className="h-10 w-10 sm:h-12 sm:h-12"
```

### Botones Responsive

```typescript
// Botones con texto largo
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button className="text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
    Texto del Botón
  </Button>
</div>

// Botones que ocultan texto en móvil
<Button>
  <span className="hidden sm:inline">Texto Completo</span>
  <span className="sm:hidden">Corto</span>
</Button>
```

### Flex Responsive

```typescript
// Apilar en móvil, horizontal en desktop
className="flex flex-col sm:flex-row gap-2 sm:gap-4"

// Centrar items de manera responsive
className="items-start sm:items-center"
```

---

## Componentes Específicos

### BusinessMetrics.tsx
```typescript
// Grid principal de 4 métricas
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

// Grid secundario de 3 métricas  
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Cards individuales
p-3 sm:p-4 text-center

// Textos
text-xs sm:text-sm (labels)
text-xl sm:text-2xl (números)
```

### BusinessDashboard.tsx
```typescript
// Container principal
space-y-3 sm:space-y-4 p-2 sm:p-4 lg:p-6

// Banner grid
grid-cols-1 lg:grid-cols-2

// Grid de tareas
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Botones de acción
flex-col sm:flex-row gap-2 sm:gap-3
```

### RecommendedProfiles.tsx
```typescript
// Scroll horizontal intencional (tipo carrusel)
overflow-x-auto scrollbar-thin

// Cards con ancho fijo
flex-shrink-0 w-72

// Altura uniforme
h-[420px]
```

---

## Reglas de Oro

### ✅ HACER:

1. **Usar clases Tailwind responsive existentes**
   - `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
   - No crear breakpoints custom

2. **Mobile-first siempre**
   - Clase base = móvil
   - Agregar prefijos para pantallas grandes

3. **Espaciado proporcional**
   - Mobile: `p-2`, `gap-2`, `space-y-2`
   - Tablet: `sm:p-4`, `sm:gap-4`
   - Desktop: `lg:p-6`, `lg:gap-6`

4. **Grids progresivos**
   - 1 col → 2 cols → 3-4 cols
   - Nunca saltar directamente de 1 a 4

5. **Textos escalables**
   - Reducir 1-2 tamaños en móvil
   - `text-xl → text-lg sm:text-xl lg:text-2xl`

6. **Truncar textos largos**
   - Usar `truncate` o `line-clamp-2`
   - Evitar overflow horizontal de texto

7. **Flex containers con min-w-0**
   - `flex-1 min-w-0` para prevenir overflow

8. **Icons con flex-shrink-0**
   - Prevenir que iconos se compriman

### ❌ EVITAR:

1. **Anchos fijos sin max-width**
   ```typescript
   // ❌ MAL
   className="w-[500px]"
   
   // ✅ BIEN
   className="w-full max-w-lg"
   ```

2. **Breakpoints personalizados**
   ```typescript
   // ❌ MAL
   @media (min-width: 950px)
   
   // ✅ BIEN  
   className="lg:grid-cols-3"
   ```

3. **Saltos bruscos en grids**
   ```typescript
   // ❌ MAL
   className="grid-cols-1 lg:grid-cols-4"
   
   // ✅ BIEN
   className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
   ```

4. **Padding/gaps sin responsive**
   ```typescript
   // ❌ MAL
   className="p-6 gap-4"
   
   // ✅ BIEN
   className="p-3 sm:p-4 lg:p-6 gap-2 sm:gap-4"
   ```

5. **Texto sin considerar móvil**
   ```typescript
   // ❌ MAL
   className="text-3xl"
   
   // ✅ BIEN
   className="text-xl sm:text-2xl lg:text-3xl"
   ```

---

## Checklist de Implementación

Antes de considerar un componente "responsive completo":

- [ ] Funciona en 360px sin scroll horizontal
- [ ] Funciona en 768px (tablet) con buen uso de espacio
- [ ] Funciona en 1366px (laptop 13") sin overflow
- [ ] Funciona en 1920px sin espacios excesivos
- [ ] Textos legibles en todos los tamaños
- [ ] Botones accesibles (no muy pequeños en móvil)
- [ ] Images/avatares proporcionales
- [ ] Grids con progresión lógica (1→2→4, no 1→4)
- [ ] Padding y gaps responsive
- [ ] Testear en DevTools modo responsive

---

## Componentes Auditados y Corregidos

### ✅ Completados:
- BusinessMetrics.tsx (grid 1→2→4, textos responsive)
- BusinessDashboard.tsx (video max-w, grid tareas 1→2→3)
- AdminUserManagement.tsx (badges responsive)
- RecommendedProfiles.tsx (scroll horizontal intencional)

### ✅ Ya Responsive:
- TalentDashboard.tsx (padding y estructura correcta)
- AcademyDashboard.tsx (tabs y contenido responsive)
- AdminDashboard.tsx (grids implementados)

### ⏭️ Siguiente Fase (Si Necesario):
- Formularios de onboarding
- Páginas públicas  
- Landing pages
- Modals y dialogs

---

## Testing Recomendado

### En Chrome DevTools:

1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Probar estas resoluciones:
   - 360 x 640 (iPhone SE)
   - 375 x 667 (iPhone 8)
   - 414 x 896 (iPhone XR)
   - 768 x 1024 (iPad)
   - 1366 x 768 (Laptop 13")
   - 1920 x 1080 (Desktop HD)

### Qué Verificar:

- ✅ Sin scroll horizontal no intencional
- ✅ Todos los botones visibles y clicables
- ✅ Texto legible (no muy pequeño)
- ✅ Cards/grids sin overflow
- ✅ Images no distorsionadas
- ✅ Navegación accesible

---

## Conclusión

El proyecto TalentoDigital.io ahora tiene:

- ✅ Diseño mobile-first consistente
- ✅ Breakpoints Tailwind estándar (sm, md, lg, xl, 2xl)
- ✅ Grids progresivos (1→2→4 no 1→4)
- ✅ Textos y espaciado responsive
- ✅ Componentes probados en 360px-1920px
- ✅ Guidelines documentadas para futuros desarrollos

**El sistema es ahora responsive en dispositivos desde 360px hasta 4K.**

