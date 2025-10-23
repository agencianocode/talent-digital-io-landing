import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Bell, Target } from 'lucide-react';
import PrivacySettings from './PrivacySettings';
import UserNotificationSettings from '@/components/UserNotificationSettings';
import ProfessionalPreferences from './ProfessionalPreferences';

const TalentProfileSettings = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    startTransition(() => {
      navigate('/talent-dashboard');
    });
  };
  return <div className="space-y-6 mx-[20px] my-[20px] px-[20px] py-[20px]">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuración de Talento</h2>
          <p className="text-muted-foreground">Personaliza tu experiencia profesional y privacidad</p>
        </div>
      </div>

      <Tabs defaultValue="privacy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <UserNotificationSettings userType="talent" />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <ProfessionalPreferences />
        </TabsContent>
      </Tabs>
    </div>;
};
export default TalentProfileSettings;