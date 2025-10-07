import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VAPID_CONFIG } from '@/config/vapid-keys';

// Convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useSupabaseAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if Push Notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check subscription status
  useEffect(() => {
    if (!isSupported || !user) return;

    checkSubscription();
  }, [isSupported, user]);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (error) {
      console.error('[usePushNotifications] Error checking subscription:', error);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Las notificaciones push no están soportadas en este navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas!');
        return true;
      } else if (permission === 'denied') {
        toast.error('Notificaciones bloqueadas. Actualiza los permisos en tu navegador.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('[usePushNotifications] Error requesting permission:', error);
      toast.error('Error al solicitar permisos de notificación');
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) return false;

    setIsLoading(true);
    
    try {
      // Request permission first
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return false;
        }
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // VAPID public key (real key generated)
      const vapidPublicKey = VAPID_CONFIG.publicKey;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert({
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          endpoint: subscription.endpoint,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('¡Notificaciones push activadas!');
      return true;

    } catch (error) {
      console.error('[usePushNotifications] Error subscribing:', error);
      toast.error('Error al activar notificaciones push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, permission, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast.success('Notificaciones push desactivadas');
      return true;

    } catch (error) {
      console.error('[usePushNotifications] Error unsubscribing:', error);
      toast.error('Error al desactivar notificaciones push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Test notification
  const sendTestNotification = useCallback(() => {
    if (permission === 'granted') {
      new Notification('Talent Digital', {
        body: '¡Las notificaciones están funcionando!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
    }
  }, [permission]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
    checkSubscription
  };
};

