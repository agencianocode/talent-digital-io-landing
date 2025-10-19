import { 
  LayoutDashboard, 
  UserCog, 
  Building2, 
  Briefcase, 
  ShoppingBag, 
  MessageSquare, 
  User,
  CheckSquare,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useSupabaseMessages } from "@/contexts/SupabaseMessagesContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { title: "Solicitudes Upgrade", value: "upgrade-requests", icon: CheckSquare },
  { title: "Usuarios", value: "users", icon: UserCog },
  { title: "Empresas", value: "companies", icon: Building2 },
  { title: "Oportunidades", value: "opportunities", icon: Briefcase },
  { title: "Marketplace", value: "marketplace", icon: ShoppingBag },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, profile, signOut } = useSupabaseAuth();
  const { conversations } = useSupabaseMessages();
  const { unreadCount: unreadNotificationsCount } = useNotifications();
  const navigate = useNavigate();

  // Calculate unread messages count
  const unreadMessagesCount = conversations?.filter(c => (c.unread_count ?? 0) > 0).length || 0;

  const getInitials = (name: string) => {
    if (!name) return "A";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar className={cn(collapsed ? "w-14" : "w-64", "bg-background border-r")} collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b p-4 bg-background">
        <div className="flex items-center gap-2 mb-3">
          {!collapsed && <h2 className="text-lg font-semibold text-foreground">TalentoDigital.io</h2>}
          {!collapsed && (
            <Button variant="ghost" size="sm" className="p-1 h-auto">
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {!collapsed && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {getInitials(profile?.full_name || user?.email || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">
                  {profile?.full_name || user?.email || "Admin"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!collapsed && (
          <p className="text-xs text-muted-foreground mt-3 font-medium">Panel Administrativo</p>
        )}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.value)}
                      isActive={isActive}
                      className={cn(
                        "cursor-pointer px-3 py-2.5 rounded-md transition-colors w-full",
                        isActive
                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-4 bg-background">
        {/* Bottom navigation: Mensajes y Notificaciones */}
        <div className="space-y-2 mb-4">
          <SidebarMenuButton
            onClick={() => onTabChange("chat")}
            isActive={activeTab === "chat"}
            className={cn(
              "cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
              activeTab === "chat"
                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">Mensajes</span>
                {unreadMessagesCount > 0 && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </Badge>
                )}
              </>
            )}
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() => onTabChange("notifications")}
            isActive={activeTab === "notifications"}
            className={cn(
              "cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
              activeTab === "notifications"
                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Bell className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">Notificaciones</span>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </Badge>
                )}
              </>
            )}
          </SidebarMenuButton>
        </div>

        {/* User Profile Dropdown */}
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2.5 h-auto hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(profile?.full_name || user?.email || "Admin")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {profile?.full_name || user?.email || "Admin"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={() => onTabChange("admin-profile")}>
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTabChange("settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Collapsed state: Solo iconos */}
        {collapsed && (
          <div className="flex flex-col items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => onTabChange("admin-profile")}
            >
              <User className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
