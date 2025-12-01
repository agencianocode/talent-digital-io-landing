import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Bell } from 'lucide-react';
import PrivacySettings from './PrivacySettings';
import UserNotificationSettings from '@/components/UserNotificationSettings';

const CompanySettings = () => {
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Configuración Avanzada</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Configuraciones técnicas y administrativas</p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-4 sm:mt-6">
          <UserNotificationSettings userType="business" hideTitle={true} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-4 sm:mt-6">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;