import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Shield, 
  Cog,
  HelpCircle,
  Settings,
  Monitor
} from 'lucide-react';
import AdminSystemSettings from '@/components/admin/settings/AdminSystemSettings';
import AdminNotificationSettings from '@/components/admin/settings/AdminNotificationSettings';
import AdminSecuritySettings from '@/components/admin/settings/AdminSecuritySettings';
import AdminHelpSettings from '@/components/admin/settings/AdminHelpSettings';
import AdminCustomizationSettings from '@/components/admin/settings/AdminCustomizationSettings';
import AdminBannerSettings from '@/components/admin/settings/AdminBannerSettings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("system");

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configuración avanzada del panel administrativo y la plataforma
        </p>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto sm:h-10 gap-0.5 sm:gap-0">
          <TabsTrigger 
            value="system" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5"
          >
            <Cog className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Sistema</span>
          </TabsTrigger>
          <TabsTrigger 
            value="customization" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Personalización</span>
          </TabsTrigger>
          <TabsTrigger 
            value="banner" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5"
          >
            <Monitor className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Banner</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5"
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5"
          >
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger 
            value="help" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5"
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Ayuda</span>
          </TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="mt-4 sm:mt-6">
          <AdminSystemSettings />
        </TabsContent>

        {/* Customization Settings */}
        <TabsContent value="customization" className="mt-4 sm:mt-6">
          <AdminCustomizationSettings />
        </TabsContent>

        {/* Banner Settings */}
        <TabsContent value="banner" className="mt-4 sm:mt-6">
          <AdminBannerSettings />
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-4 sm:mt-6">
          <AdminNotificationSettings />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-4 sm:mt-6">
          <AdminSecuritySettings />
        </TabsContent>

        {/* Help Settings */}
        <TabsContent value="help" className="mt-4 sm:mt-6">
          <AdminHelpSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
