import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Shield, 
  Cog,
  HelpCircle,
  Settings
} from 'lucide-react';
import AdminSystemSettings from '@/components/admin/settings/AdminSystemSettings';
import AdminNotificationSettings from '@/components/admin/settings/AdminNotificationSettings';
import AdminSecuritySettings from '@/components/admin/settings/AdminSecuritySettings';
import AdminHelpSettings from '@/components/admin/settings/AdminHelpSettings';
import AdminCustomizationSettings from '@/components/admin/settings/AdminCustomizationSettings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("system");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground">
          Configuración avanzada del panel administrativo y la plataforma
        </p>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Personalización
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Ayuda
          </TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="mt-6">
          <AdminSystemSettings />
        </TabsContent>

        {/* Customization Settings */}
        <TabsContent value="customization" className="mt-6">
          <AdminCustomizationSettings />
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6">
          <AdminNotificationSettings />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <AdminSecuritySettings />
        </TabsContent>

        {/* Help Settings */}
        <TabsContent value="help" className="mt-6">
          <AdminHelpSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
