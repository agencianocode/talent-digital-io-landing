import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Home, LogOut, Briefcase, MessageSquare, User, Settings, Menu, X, ChevronDown, Search, GraduationCap, Bell, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import CompanySwitcher from "@/components/CompanySwitcher";
import HelpFeedbackModal from "@/components/HelpFeedbackModal";
import NotificationCenter from "@/components/NotificationCenter";
import { useSupabaseMessages } from "@/contexts/SupabaseMessagesContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const DashboardLayout = () => {
  const {
    user,
    signOut,
    profile,
    userRole
  } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const {
    unreadCount
  } = useSupabaseMessages();
  const { activeCompany } = useCompany();
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  const baseNavigationItems = [{
    to: "/business-dashboard",
    icon: Home,
    label: "Dashboard"
  }, {
    to: "/business-dashboard/opportunities",
    icon: Briefcase,
    label: "Mis Oportunidades"
  }, {
    to: "/business-dashboard/talent-discovery",
    icon: Search,
    label: "Buscar Talento"
  }, {
    to: "/business-dashboard/marketplace",
    icon: Store,
    label: "Marketplace"
  }];

  // Mostrar Mi Academia si el usuario tiene rol academy_premium O si la empresa activa es de tipo academy
  const showAcademyMenu = userRole === 'academy_premium' || activeCompany?.business_type === 'academy';
  const navigationItems = showAcademyMenu ? [...baseNavigationItems, {
    to: "/business-dashboard/academy",
    icon: GraduationCap,
    label: "Mi Academia"
  }] : baseNavigationItems;
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  return <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
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
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={closeMobileMenu}>
          <div className="fixed left-0 top-0 h-full w-80 bg-card border-r" onClick={e => e.stopPropagation()}>
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
                {navigationItems.map(item => <li key={item.to}>
                    <NavLink to={item.to} onClick={closeMobileMenu} className={({
                isActive
              }) => cn("flex items-center gap-3 px-3 py-3 rounded-md transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                      <item.icon className="h-5 w-5" />
                      {item.label}
                      {item.label === "Mi Academia" && <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0 h-4">
                          Pro
                        </Badge>}
                    </NavLink>
                  </li>)}
              </ul>
            </nav>

            <div className="p-4 border-t mt-auto">
              <div className="flex items-center gap-3 mb-4">
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? <img src={profile?.avatar_url || user?.user_metadata?.avatar_url || ''} alt={profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {(profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').split(' ').map((n: string) => n[0]).join('')}
                  </div>}
                <div>
                  <p className="text-sm font-medium">{profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
              navigate('/business-dashboard/profile');
              closeMobileMenu();
            }}>
                  <User className="h-4 w-4 mr-2" />
                  Mi Perfil
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
              navigate('/business-dashboard/settings/company');
              closeMobileMenu();
            }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-col h-screen sticky top-0">
        {/* Header with Logo and Company */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">TalentoDigital.io</h2>
            
          </div>
          <CompanySwitcher showCreateButton />
        </div>
        
        {/* Navigation - Flexible space */}
        <nav className="p-4 flex-1">
          {/* Main Navigation - Recuadro rojo superior */}
          <ul className="space-y-2">
            {navigationItems.map(item => <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/business-dashboard"} className={({
              isActive
            }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors", isActive ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}>
                  <item.icon className="h-4 w-4" />
                  <span style={{
                fontSize: '16px'
              }}>{item.label}</span>
                  {item.label === "Mi Academia" && <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0 h-4">
                      Pro
                    </Badge>}
                </NavLink>
              </li>)}
          </ul>
        </nav>

        {/* User Profile Section - Bottom - Pegado al fondo */}
        <div className="p-4 border-t flex-shrink-0">
          {/* Bottom Navigation - Recuadro rojo inferior (junto con el perfil) */}
          <div className="space-y-2 mb-4">
            <NavLink to="/business-dashboard/messages" className={({
            isActive
          }) => cn("flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-sm", isActive ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}>
              <MessageSquare className="h-4 w-4" />
              <span style={{
              fontSize: '16px'
            }}>Mensajes</span>
              {unreadCount > 0 && <Badge variant="destructive" className="ml-auto text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>}
            </NavLink>

            <NavLink to="/business-dashboard/notifications" className={({
            isActive
          }) => cn("flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-sm", isActive ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}>
              <Bell className="h-4 w-4" />
              <span style={{
              fontSize: '16px'
            }}>Notificaciones</span>
              <NotificationCenter />
            </NavLink>

          </div>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2.5 h-auto hover:bg-purple-50 hover:text-slate-900">
                <div className="flex items-center gap-3 w-full">
                  {profile?.avatar_url || user?.user_metadata?.avatar_url ? <img src={profile?.avatar_url || user?.user_metadata?.avatar_url || ''} alt={profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {(profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').split(' ').map((n: string) => n[0]).join('')}
                    </div>}
                  <div className="flex-1 text-left">
                    <p className="font-medium" style={{
                    fontSize: '16px'
                  }}>{profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/business-dashboard/profile')}>
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/business-dashboard/settings/company')}>
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
          
          {/* Feedback Card */}
          <div className="mt-4">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">¿Cómo podemos mejorar?</h4>
                    <p className="text-xs text-gray-600">Tu feedback nos ayuda a crecer</p>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3 bg-purple-600 hover:bg-purple-700" onClick={() => setIsHelpModalOpen(true)}>
                  Enviar feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden">
          <div className="p-4 lg:p-6 w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Help & Feedback Modal */}
      <HelpFeedbackModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>;
};
export default DashboardLayout;