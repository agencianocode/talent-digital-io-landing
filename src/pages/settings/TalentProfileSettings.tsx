import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Bell, GraduationCap, BellRing } from 'lucide-react';
import PrivacySettings from './PrivacySettings';
import UserNotificationSettings from '@/components/UserNotificationSettings';
import { GraduatePrivacySettings } from '@/components/academy/GraduatePrivacySettings';
import { useAcademyInvitation } from '@/hooks/useAcademyInvitation';
import { PushNotificationToggle } from '@/components/notifications/PushNotificationToggle';

const TalentProfileSettings = () => {
  const navigate = useNavigate();
  const { isAcademyStudent } = useAcademyInvitation();

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

      <section className="space-y-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <BellRing className="h-5 w-5 text-primary mt-1" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Activa tus notificaciones push</p>
            <p className="text-sm text-muted-foreground">
              Primero autoriza tu navegador usando el siguiente control. Luego, en la pestaña
              <strong> Notificaciones</strong> podrás elegir qué alertas recibir (email, web o push).
            </p>
          </div>
        </div>
        <PushNotificationToggle />
      </section>

      <Tabs defaultValue="privacy" className="w-full">
        <TabsList className={`grid w-full ${isAcademyStudent ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
          {isAcademyStudent && (
            <TabsTrigger value="academy" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academia
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings />
        </TabsContent>

        {isAcademyStudent && (
          <TabsContent value="academy" className="mt-6">
            <GraduatePrivacySettings />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="mt-6">
          <UserNotificationSettings userType="talent" />
        </TabsContent>
      </Tabs>
    </div>;
};
export default TalentProfileSettings;