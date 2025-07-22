import { NavLink, useLocation, Outlet } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
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

const TalentAppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const navigationItems = [
    { title: "Dashboard", url: "/talent-dashboard", icon: null },
    { title: "Mis Oportunidades", url: "/talent-dashboard/opportunities", icon: null },
    { title: "Explorar Talento", url: "/talent-dashboard/explore", icon: null },
    { title: "Marketplace", url: "/talent-dashboard/marketplace", icon: null },
  ];

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar className="w-64 border-r border-border bg-card">
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">TalentoDigital.io</h1>
          <LogOut className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground" />
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
                {userData.name || 'Usuario Talento'}
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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <TalentAppSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TalentDashboardLayout;