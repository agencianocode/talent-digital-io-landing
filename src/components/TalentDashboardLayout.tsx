import { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { User, Settings, Menu, MessageCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/contexts/AuthContextEnhanced";

const TalentAppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const navigationItems = [
    { title: "Dashboard", url: "/talent-dashboard", icon: null },
    { title: "Mis Oportunidades", url: "/talent-dashboard/opportunities", icon: null },
    { title: "Explorar Talento", url: "/talent-dashboard/explore", icon: null },
    { title: "Marketplace", url: "/talent-dashboard/marketplace", icon: null },
    { title: "Mensajes", url: "/messages", icon: MessageCircle },
  ];

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar className="w-64 border-r border-border bg-card">
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">TalentoDigital.io</h1>
          <LogoutButton />
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive: navIsActive }) => 
                          `flex items-center w-full p-3 rounded-md text-left ${
                            navIsActive || isActive(item.url)
                              ? 'bg-secondary text-foreground font-medium' 
                              : 'text-foreground hover:bg-secondary/50'
                          }`
                        }
                      >
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {user?.name || 'Usuario Talento'}
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <button className="text-xs text-muted-foreground hover:text-foreground w-full text-left">
              Perfil / Settings
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const TalentDashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">TalentoDigital.io</h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <TalentAppSidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <TalentAppSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-0 pt-16 md:pt-0">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TalentDashboardLayout;
