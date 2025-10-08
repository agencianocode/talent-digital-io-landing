import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationToggle = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <BellOff className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">Notificaciones Push</p>
            <p className="text-sm text-muted-foreground">
              Tu navegador no soporta notificaciones push
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5" />
          <div>
            <p className="font-medium">Notificaciones Push</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'denied'
                ? 'Bloqueadas por el navegador'
                : isSubscribed
                ? 'Recibiendo notificaciones'
                : 'Activar notificaciones en tiempo real'}
            </p>
          </div>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={permission === 'denied'}
        />
      </div>

      {isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          onClick={sendTestNotification}
          className="w-full"
        >
          Enviar notificación de prueba
        </Button>
      )}

      {permission === 'denied' && (
        <p className="text-sm text-destructive">
          Las notificaciones están bloqueadas. Por favor, actívalas en la configuración de tu
          navegador.
        </p>
      )}
    </Card>
  );
};
