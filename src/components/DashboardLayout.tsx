import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Briefcase, MessageSquare, User, Settings, Building, Menu, X, ChevronDown, Search, HelpCircle, GraduationCap, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import CompanySwitcher from "@/components/CompanySwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = () => {
  const { user, signOut, profile } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { to: "/business-dashboard", icon: Home, label: "Dashboard" },
    { to: "/business-dashboard/opportunities", icon: Briefcase, label: "Mis Oportunidades" },
    { to: "/business-dashboard/talent", icon: Search, label: "Buscar Talento" },
    { to: "/business-dashboard/marketplace", icon: Building, label: "Marketplace" },
    { to: "/business-dashboard/academy", icon: GraduationCap, label: "Mi Academia" },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-lg font-semibold">TalentoDigital.io</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={closeMobileMenu}>
          <div className="fixed left-0 top-0 h-full w-80 bg-card border-r" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">TalentoDigital.io</h2>
                <Button variant="ghost" size="sm" onClick={closeMobileMenu} className="p-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CompanySwitcher />
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-3 rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t mt-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { navigate('/settings/profile'); closeMobileMenu(); }}>
                  <User className="h-4 w-4 mr-2" />
                  Mi Perfil
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { navigate('/settings/company'); closeMobileMenu(); }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-col min-h-screen">
        {/* Header with Logo and Company */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">TalentoDigital.io</h2>
            <Button variant="ghost" size="sm" className="p-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
          <CompanySwitcher showCreateButton />
        </div>
        
        {/* Navigation - Flexible space */}
        <nav className="p-4 flex-1">
          {/* Main Navigation - Recuadro rojo superior */}
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section - Bottom - Pegado al fondo */}
        <div className="p-4 border-t flex-shrink-0">
          {/* Bottom Navigation - Recuadro rojo inferior (junto con el perfil) */}
          <div className="space-y-1 mb-4">
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              <MessageSquare className="h-4 w-4" />
              <span>Mensajes</span>
              <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                1
              </span>
            </NavLink>

            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
              <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                3
              </span>
            </NavLink>

            <NavLink
              to="/help"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              <HelpCircle className="h-4 w-4" />
              <span>Ayuda / Feedback</span>
            </NavLink>
          </div>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/company')}>
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex border-b p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Volver al Sitio
              </Button>
              {activeCompany && (
                <span className="text-sm text-muted-foreground">
                  Empresa actual: <span className="font-medium">{activeCompany.name}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
