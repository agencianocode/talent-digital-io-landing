# TalentoDigital.io - Plataforma de Conectores de Talento

## Project info

**URL**: https://lovable.dev/projects/899b083e-2899-4a3a-b80a-8eda4ce47f6b
**Demo Local**: http://localhost:8080/
**Demo Red**: http://192.168.1.7:8080/

## Descripción del Proyecto

TalentoDigital.io es una plataforma completa para conectar empresas con talento especializado en ventas, marketing digital y más. La aplicación incluye:

### 🎯 Funcionalidades Principales

- **Landing Pages Específicas**: Para talento digital y empresas
- **Sistema de Autenticación**: Registro e inicio de sesión
- **Dashboards Separados**: 
  - Dashboard para Empresas (business-dashboard)
  - Dashboard para Talento (talent-dashboard)
- **Gestión de Oportunidades**: Crear, editar, compartir y gestionar
- **Sistema de Aplicaciones**: Para talentos aplicar a oportunidades
- **Perfiles Complejos**: Para talentos y empresas
- **Sistema de Mensajería**: Comunicación entre usuarios
- **Configuraciones Avanzadas**: Personalización de dashboards
- **Sistema de Configuraciones**: Notificaciones, preferencias profesionales y privacidad
- **TypeScript Estricto**: Configuración robusta para mejor mantenibilidad
- **Logging Optimizado**: Sistema de logs centralizado y eficiente

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/899b083e-2899-4a3a-b80a-8eda4ce47f6b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático con configuración estricta
- **React 18** - Framework de UI con hooks modernos
- **shadcn/ui** - Componentes UI accesibles
- **Tailwind CSS** - Framework de estilos utilitarios
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Real-time)
- **React Query** - Gestión de estado del servidor
- **Zod** - Validación de esquemas
- **React Hook Form** - Manejo de formularios

## 🚀 Mejoras Técnicas Implementadas

### ✅ TypeScript Estricto
- Configuración estricta habilitada (`strict: true`)
- Eliminación de tipos `any` en favor de tipos específicos
- Mejora de type safety en toda la aplicación

### ✅ Sistema de Configuraciones Completo
- **Notificaciones**: Email, push e in-app notifications
- **Preferencias Profesionales**: Modalidad de trabajo, salarios, disponibilidad
- **Privacidad**: Control de visibilidad y datos personales

### ✅ Logging Optimizado
- Sistema de logging centralizado con `logger`
- Logs de debug solo en desarrollo
- Mejor manejo de errores en producción

### ✅ Arquitectura Robusta
- Error boundaries para manejo de errores
- Lazy loading de componentes
- Optimizaciones de rendimiento
- Sistema de caché inteligente

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/899b083e-2899-4a3a-b80a-8eda4ce47f6b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
