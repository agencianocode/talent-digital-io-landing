# 📚 **MARKETPLACE - Documentación Completa**

## 🎯 **Resumen del Sistema**

El Marketplace de TalentoDigital.io es un sistema completo que permite a talentos ofrecer servicios y a empresas contratarlos. Está dividido en dos interfaces principales:

- **Marketplace para Empresas**: Catálogo de servicios disponibles
- **Marketplace para Talentos**: Gestión de servicios propios

---

## 🏗️ **Arquitectura del Sistema**

### **Estructura de Archivos**
```
src/
├── lib/
│   └── marketplace-categories.ts          # Categorías de servicios
├── hooks/
│   ├── useMarketplaceServices.ts          # Hook para empresas
│   └── useTalentServices.ts              # Hook para talentos
├── components/
│   └── marketplace/
│       ├── ServiceCard.tsx               # Card de servicio (empresas)
│       ├── ServiceFilters.tsx            # Filtros de búsqueda
│       ├── ServiceForm.tsx               # Formulario de servicios
│       ├── ServiceRequestModal.tsx       # Modal de solicitud
│       ├── TalentServiceCard.tsx         # Card de servicio (talentos)
│       └── ServiceRequestsList.tsx       # Lista de solicitudes
└── pages/
    ├── BusinessMarketplace.tsx           # Vista para empresas
    └── TalentMarketplace.tsx             # Vista para talentos
```

### **Base de Datos**
```sql
-- Tabla principal de servicios
talent_services:
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- title (VARCHAR)
- description (TEXT)
- category (VARCHAR)
- price (DECIMAL)
- currency (VARCHAR)
- delivery_time (VARCHAR)
- location (VARCHAR)
- is_available (BOOLEAN)
- status (ENUM: active, paused, draft, sold)
- portfolio_url (VARCHAR, nullable)
- demo_url (VARCHAR, nullable)
- tags (JSON)
- views_count (INTEGER, default 0)
- requests_count (INTEGER, default 0)
- rating (DECIMAL, nullable)
- reviews_count (INTEGER, default 0)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

-- Tabla de solicitudes (futura implementación)
service_requests:
- id (UUID, PK)
- service_id (UUID, FK to talent_services)
- requester_id (UUID, FK to auth.users)
- requester_name (VARCHAR)
- requester_email (VARCHAR)
- requester_phone (VARCHAR, nullable)
- company_name (VARCHAR, nullable)
- message (TEXT)
- budget_range (VARCHAR)
- timeline (VARCHAR)
- project_type (VARCHAR)
- status (ENUM: pending, accepted, declined, completed)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🎨 **Componentes Principales**

### **1. ServiceCard (Para Empresas)**
**Ubicación**: `src/components/marketplace/ServiceCard.tsx`

**Props**:
```typescript
interface ServiceCardProps {
  service: MarketplaceService;
  onRequestService: (service: MarketplaceService) => void;
  onViewPortfolio?: (service: MarketplaceService) => void;
}
```

**Funcionalidades**:
- Muestra información completa del servicio
- Botón para solicitar servicio
- Enlace al portfolio del proveedor
- Estadísticas (vistas, solicitudes, rating)
- Tags y categoría visual

### **2. ServiceForm (Para Talentos)**
**Ubicación**: `src/components/marketplace/ServiceForm.tsx`

**Props**:
```typescript
interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<boolean>;
  initialData?: Partial<ServiceFormData>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}
```

**Funcionalidades**:
- Formulario completo de creación/edición
- Validación de campos en tiempo real
- Vista previa del servicio
- Gestión de etiquetas
- Configuración de disponibilidad

### **3. ServiceFilters (Para Empresas)**
**Ubicación**: `src/components/marketplace/ServiceFilters.tsx`

**Funcionalidades**:
- Búsqueda por texto
- Filtros por categoría, precio, ubicación
- Filtros activos visibles
- Botón para limpiar filtros
- Contador de resultados

### **4. TalentServiceCard (Para Talentos)**
**Ubicación**: `src/components/marketplace/TalentServiceCard.tsx`

**Funcionalidades**:
- Vista detallada del servicio propio
- Menú de acciones (editar, duplicar, eliminar)
- Toggle de estado (activo/pausado)
- Estadísticas de rendimiento
- Estados visuales claros

### **5. ServiceRequestsList (Para Talentos)**
**Ubicación**: `src/components/marketplace/ServiceRequestsList.tsx`

**Funcionalidades**:
- Lista de solicitudes recibidas
- Modal de detalles completo
- Acciones de aceptar/rechazar
- Información del solicitante
- Estados de solicitud

---

## 🔧 **Hooks Personalizados**

### **1. useMarketplaceServices**
**Ubicación**: `src/hooks/useMarketplaceServices.ts`

**Funcionalidades**:
- Carga de servicios disponibles
- Sistema de filtros avanzado
- Paginación
- Búsqueda en tiempo real
- Manejo de errores

**Retorna**:
```typescript
{
  services: MarketplaceService[];
  allServices: MarketplaceService[];
  isLoading: boolean;
  error: string | null;
  filters: ServiceFilters;
  updateFilters: (filters: Partial<ServiceFilters>) => void;
  currentPage: number;
  totalPages: number;
  servicesPerPage: number;
  setCurrentPage: (page: number) => void;
  refreshServices: () => void;
}
```

### **2. useTalentServices**
**Ubicación**: `src/hooks/useTalentServices.ts`

**Funcionalidades**:
- CRUD completo de servicios
- Gestión de solicitudes
- Estadísticas y métricas
- Estados de servicios

**Retorna**:
```typescript
{
  services: TalentService[];
  requests: ServiceRequest[];
  servicesByStatus: {
    active: TalentService[];
    paused: TalentService[];
    draft: TalentService[];
    sold: TalentService[];
  };
  pendingRequests: ServiceRequest[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  totalViews: number;
  totalRequests: number;
  averageRating: number;
  createService: (data: ServiceFormData) => Promise<boolean>;
  updateService: (id: string, data: Partial<ServiceFormData>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  updateRequestStatus: (id: string, status: string) => Promise<boolean>;
  duplicateService: (id: string) => Promise<boolean>;
  refreshServices: () => void;
  refreshRequests: () => void;
}
```

---

## 📱 **Páginas Principales**

### **1. BusinessMarketplace**
**Ruta**: `/business-dashboard/marketplace`

**Funcionalidades**:
- Dashboard con estadísticas
- Grid de servicios con filtros
- Modal de solicitud de servicios
- Paginación
- Estados de carga y error

### **2. TalentMarketplace**
**Ruta**: `/talent-dashboard/marketplace`

**Funcionalidades**:
- Dashboard con métricas personales
- Tabs para servicios y solicitudes
- Gestión completa de servicios
- Lista de solicitudes recibidas
- Formulario de creación/edición

---

## 🎨 **Categorías de Servicios**

### **Categorías Disponibles**
1. **🎨 Diseño Gráfico** - Logos, branding, material gráfico
2. **💻 Desarrollo Web** - Sitios web, aplicaciones, e-commerce
3. **📱 Marketing Digital** - Redes sociales, SEO, publicidad
4. **✍️ Contenido** - Copywriting, blogs, videos
5. **💡 Consultoría** - Estrategia, procesos, optimización
6. **🌍 Traducción** - Idiomas, localización, interpretación
7. **📸 Fotografía** - Productos, eventos, retratos
8. **🎬 Video** - Edición, animación, motion graphics
9. **🎵 Audio** - Podcasts, música, sonido
10. **💰 Ventas** - Closers, telemarketing, CRM
11. **🔧 Soporte Técnico** - Help desk, mantenimiento, soporte
12. **🔮 Otros** - Servicios diversos y especializados

---

## 🔄 **Flujos de Usuario**

### **Flujo para Empresas**
1. **Acceso**: Navegar a `/business-dashboard/marketplace`
2. **Exploración**: Ver servicios disponibles con filtros
3. **Búsqueda**: Usar search bar y filtros avanzados
4. **Solicitud**: Hacer clic en "Solicitar Servicio"
5. **Formulario**: Completar datos de contacto y proyecto
6. **Envío**: Enviar solicitud al proveedor

### **Flujo para Talentos**
1. **Acceso**: Navegar a `/talent-dashboard/marketplace`
2. **Creación**: Hacer clic en "Crear Servicio"
3. **Formulario**: Completar información del servicio
4. **Publicación**: Activar servicio para que sea visible
5. **Gestión**: Recibir y responder solicitudes
6. **Seguimiento**: Ver estadísticas de rendimiento

---

## 🚀 **Optimizaciones Implementadas**

### **1. Lazy Loading**
- Componentes cargados bajo demanda
- Reducción del bundle inicial
- Mejor tiempo de carga

### **2. Mock Data**
- Funcionalidad completa sin base de datos
- Datos de ejemplo realistas
- Fácil testing y desarrollo

### **3. TypeScript**
- Tipado completo y seguro
- Mejor experiencia de desarrollo
- Detección temprana de errores

### **4. Responsive Design**
- Funciona en móvil y desktop
- Grid adaptativo
- Navegación móvil optimizada

### **5. Estados de Carga**
- Skeletons durante carga
- Spinners para acciones
- Feedback visual claro

---

## 🧪 **Testing y Validación**

### **Casos de Prueba Implementados**
1. **Carga de Servicios**: Verificar que se cargan correctamente
2. **Filtros**: Probar todos los filtros disponibles
3. **Búsqueda**: Validar búsqueda por texto
4. **Formularios**: Verificar validación de campos
5. **Estados**: Probar cambios de estado de servicios
6. **Responsive**: Verificar en diferentes tamaños de pantalla

### **Datos de Prueba**
- 3 servicios de ejemplo
- 2 solicitudes de ejemplo
- Categorías completas
- Usuarios de prueba

---

## 🔮 **Próximas Implementaciones**

### **Fase 4: Integración Real**
1. **Base de Datos**: Conectar con Supabase real
2. **Autenticación**: Integrar con sistema de usuarios
3. **Notificaciones**: Sistema de notificaciones en tiempo real
4. **Pagos**: Integración con sistema de pagos

### **Fase 5: Funcionalidades Avanzadas**
1. **Reviews**: Sistema de reseñas y calificaciones
2. **Chat**: Comunicación directa entre partes
3. **Contratos**: Generación automática de contratos
4. **Analytics**: Dashboard de analytics avanzado

---

## 📞 **Soporte y Mantenimiento**

### **Archivos Clave para Modificaciones**
- `src/lib/marketplace-categories.ts` - Agregar nuevas categorías
- `src/hooks/useMarketplaceServices.ts` - Modificar lógica de filtros
- `src/components/marketplace/ServiceForm.tsx` - Cambiar campos del formulario
- `src/pages/BusinessMarketplace.tsx` - Modificar vista de empresas
- `src/pages/TalentMarketplace.tsx` - Modificar vista de talentos

### **Debugging**
- Usar `console.log` en hooks para debugging
- Verificar errores en DevTools
- Revisar Network tab para requests fallidos
- Validar datos en React DevTools

---

## ✅ **Checklist de Implementación**

- [x] Estructura de archivos creada
- [x] Componentes principales implementados
- [x] Hooks personalizados funcionando
- [x] Páginas principales creadas
- [x] Navegación integrada
- [x] Mock data implementado
- [x] TypeScript configurado
- [x] Responsive design
- [x] Estados de carga
- [x] Manejo de errores
- [x] Documentación completa
- [ ] Testing automatizado
- [ ] Integración con base de datos real
- [ ] Sistema de notificaciones
- [ ] Optimizaciones de rendimiento

---

**Última actualización**: Enero 2024  
**Versión**: 1.0.0  
**Estado**: Implementación completa con mock data
