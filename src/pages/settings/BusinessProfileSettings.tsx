import React, { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Bell, Building, Settings } from 'lucide-react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import PrivacySettings from './PrivacySettings';
import NotificationSettings from './NotificationSettings';
import { CompanyProfileWizard } from '@/components/wizard/CompanyProfileWizard';

const BusinessProfileSettings = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();

  const handleBackClick = () => {
    startTransition(() => {
      navigate('/settings/profile');
    });
  };

  const handleAdvancedSettings = () => {
    navigate('/settings/company');
  };

  return (
    <div className="space-y-6 mx-[20px] my-[20px] px-[20px] py-[20px]">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuración Empresarial</h2>
          <p className="text-muted-foreground">Gestiona tu perfil corporativo y configuración</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Avanzado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <CompanyProfileWizard />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <div className="text-center space-y-4 p-8 border border-dashed border-muted rounded-lg">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Configuración Avanzada</h3>
              <p className="text-muted-foreground mb-4">
                Accede a configuraciones corporativas completas, gestión de equipo y multimedia
              </p>
              <Button onClick={handleAdvancedSettings}>
                Ir a Configuración Corporativa
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessProfileSettings;