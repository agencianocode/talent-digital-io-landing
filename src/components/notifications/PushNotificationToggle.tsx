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
    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base">Notificaciones Push</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {permission === 'denied'
                ? 'Bloqueadas por el navegador'
                : isSubscribed
                ? 'Recibiendo notificaciones'
                : 'Activar notificaciones en tiempo real'}
            </p>
          </div>
        </div>
        <div className="switch-mobile-oval flex-shrink-0">
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>
      </div>

      {isSubscribed && (
        <Button
          variant="outline"
          size="default"
          onClick={sendTestNotification}
          className="w-full text-sm sm:text-sm py-3 sm:py-2"
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
