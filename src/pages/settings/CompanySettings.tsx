import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Bell } from 'lucide-react';
import PrivacySettings from './PrivacySettings';
import NotificationSettingsForm from '@/components/NotificationSettingsForm';

const CompanySettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración Avanzada</h2>
        <p className="text-muted-foreground">Configuraciones técnicas y administrativas</p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;