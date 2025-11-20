import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_VAPID_PUBLIC_KEY =
  'BOEKW3QP-LfleNFqh2ug5Ax1hniociI7C3ZHZifBljNwVYj4nWtUlliSQrL2hDoi7dgNYuon-CA0caVLecMCebI';

const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY && import.meta.env.VITE_VAPID_PUBLIC_KEY.trim().length > 0
    ? import.meta.env.VITE_VAPID_PUBLIC_KEY
    : DEFAULT_VAPID_PUBLIC_KEY;

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub.toJSON() as PushSubscriptionData);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'No soportado',
        description: 'Tu navegador no soporta notificaciones push',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        toast({
          title: 'Permisos concedidos',
          description: 'Ahora recibirás notificaciones',
        });
        return true;
      } else {
        toast({
          title: 'Permisos denegados',
          description: 'No podrás recibir notificaciones',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const subData = sub.toJSON() as PushSubscriptionData;
      setSubscription(subData);
      setIsSubscribed(true);

      // Guardar subscripción en la base de datos
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      // Guardar el objeto completo de suscripción (endpoint + keys) para webpush
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subData.endpoint,
        subscription: subData, // Guardar el objeto completo con endpoint y keys
      } as any);

      toast({
        title: '¡Suscrito!',
        description: 'Recibirás notificaciones push',
      });

      return true;
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: 'No se pudo activar las notificaciones',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        await sub.unsubscribe();
        
        // Eliminar de la base de datos
        const { data: { user } } = await supabase.auth.getUser();
        if (user && subscription) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }

        setSubscription(null);
        setIsSubscribed(false);

        toast({
          title: 'Desuscrito',
          description: 'Ya no recibirás notificaciones push',
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desactivar las notificaciones',
        variant: 'destructive',
      });
      return false;
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      new Notification('¡Notificación de prueba!', {
        body: 'Las notificaciones están funcionando correctamente',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
  };
};

// Helper function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
