import React, { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Briefcase, Users, MessageSquare, User, Settings, Building, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import CompanySwitcher from "@/components/CompanySwitcher";

const DashboardLayout = () => {
  const { user, signOut, profile } = useSupabaseAuth();
  const { activeCompany, canManageUsers } = useCompany();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { to: "/business-dashboard", icon: Home, label: "Dashboard" },
    { to: "/business-dashboard/opportunities", icon: Briefcase, label: "Oportunidades" },
    { to: "/business-dashboard/applications", icon: Users, label: "Aplicaciones" },
    { to: "/business-dashboard/talent", icon: Users, label: "Buscar Talento" },
    ...(canManageUsers() ? [{ to: "/business-dashboard/users", icon: Building, label: "Usuarios" }] : []),
    { to: "/messages", icon: MessageSquare, label: "Mensajes" },
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
            <h2 className="text-lg font-semibold">Panel Empresarial</h2>
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
                <h2 className="text-lg font-semibold">Panel Empresarial</h2>
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
      <aside className="hidden lg:block w-64 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Panel Empresarial</h2>
          <CompanySwitcher showCreateButton />
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/settings/profile')}>
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/settings/company')}>
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
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
