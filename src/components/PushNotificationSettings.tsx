import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, TestTube2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PushNotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Tu navegador no soporta notificaciones push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Las notificaciones push no están disponibles en este navegador.
              Intenta usar Chrome, Firefox, Edge o Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Push
        </CardTitle>
        <CardDescription>
          Recibe notificaciones incluso cuando no estés usando la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Has bloqueado las notificaciones. Para activarlas, actualiza los permisos en la configuración de tu navegador.
            </AlertDescription>
          </Alert>
        )}

        {/* Toggle */}
        <div className="flex items-center justify-between space-x-2 py-4 border-b">
          <div className="space-y-1">
            <Label htmlFor="push-notifications" className="text-base font-medium">
              Activar notificaciones push
            </Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? '✓ Las notificaciones están activadas' 
                : 'Recibe alertas de mensajes y actualizaciones'}
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={(checked) => {
              if (checked) {
                subscribe();
              } else {
                unsubscribe();
              }
            }}
            disabled={permission === 'denied'}
          />
        </div>

        {/* Test Button */}
        {isSubscribed && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              disabled={permission !== 'granted'}
            >
              <TestTube2 className="h-4 w-4 mr-2" />
              Enviar notificación de prueba
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="text-sm text-muted-foreground space-y-2 pt-4">
          <p className="font-medium">¿Qué recibirás?</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Nuevos mensajes de conversaciones</li>
            <li>Postulantes a tus oportunidades</li>
            <li>Actualizaciones importantes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;

