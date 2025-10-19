import { 
  LayoutDashboard, 
  UserCog, 
  Building2, 
  Briefcase, 
  ShoppingBag, 
  MessageSquare, 
  User,
  CheckSquare
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { title: "Solicitudes Upgrade", value: "upgrade-requests", icon: CheckSquare },
  { title: "Usuarios", value: "users", icon: UserCog },
  { title: "Empresas", value: "companies", icon: Building2 },
  { title: "Oportunidades", value: "opportunities", icon: Briefcase },
  { title: "Marketplace", value: "marketplace", icon: ShoppingBag },
  { title: "Chats", value: "chat", icon: MessageSquare },
  { title: "Mi Perfil", value: "admin-profile", icon: User },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleNavigation = (value: string) => {
    onTabChange(value);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Panel Administrativo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.value)}
                      isActive={isActive}
                      className="cursor-pointer"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
