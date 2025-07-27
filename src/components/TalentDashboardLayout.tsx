
import React, { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Briefcase, Search, Heart, MessageSquare, User, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const TalentDashboardLayout = () => {
  const { user, signOut, profile } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { to: "/talent-dashboard", icon: Home, label: "Dashboard" },
    { to: "/talent-dashboard/opportunities", icon: Briefcase, label: "Mis Aplicaciones" },
    { to: "/talent-dashboard/marketplace", icon: Search, label: "Buscar Oportunidades" },
    { to: "/talent-dashboard/saved", icon: Heart, label: "Oportunidades Guardadas" },
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
            <h2 className="text-lg font-semibold">Talento Digital</h2>
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Talento Digital</h2>
                <Button variant="ghost" size="sm" onClick={closeMobileMenu} className="p-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium shadow-sm">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start hover:bg-muted/50 transition-colors" 
                  onClick={() => { navigate('/settings/profile'); closeMobileMenu(); }}
                >
                  <User className="h-4 w-4 mr-3" />
                  Mi Perfil
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start hover:bg-muted/50 transition-colors" 
                  onClick={() => { navigate('/settings/talent-profile'); closeMobileMenu(); }}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Configuración
                </Button>
                <div className="border-t my-2"></div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                  onClick={() => { handleLogout(); closeMobileMenu(); }}
                >
                  <LogOut className="h-4 w-4 mr-3" />
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
          <h2 className="text-lg font-semibold">Talento Digital</h2>
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
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium shadow-sm">
              {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start hover:bg-muted/50 transition-colors" 
              onClick={() => navigate('/settings/profile')}
            >
              <User className="h-4 w-4 mr-3" />
              Mi Perfil
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start hover:bg-muted/50 transition-colors" 
              onClick={() => navigate('/settings/talent-profile')}
            >
              <Settings className="h-4 w-4 mr-3" />
              Configuración
            </Button>
            <div className="border-t my-2"></div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
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

export default TalentDashboardLayout;
