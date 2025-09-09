import React, { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Bell, Cog } from 'lucide-react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import PrivacySettings from './PrivacySettings';
import NotificationSettingsForm from '@/components/NotificationSettingsForm';

const CompanySettings = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();

  const handleBackClick = () => {
    startTransition(() => {
      const dashboardPath = isTalentRole(userRole) ? '/talent-dashboard' : '/business-dashboard';
      navigate(dashboardPath);
    });
  };

  return (
    <div className="space-y-6 mx-[20px] my-[20px] px-[20px] py-[20px]">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuración Avanzada</h2>
          <p className="text-muted-foreground">Configuraciones técnicas y administrativas</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="text-center space-y-4 p-8 border border-dashed border-muted rounded-lg">
            <Cog className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Configuración del Sistema</h3>
              <p className="text-muted-foreground">
                Configuraciones avanzadas del sistema, integraciones y API
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;