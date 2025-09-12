import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { showNotificationToast } from '@/components/ui/notification-toast';
import { toast } from 'sonner';

interface UseRealTimeNotificationsProps {
  onNewApplication?: (application: any) => void;
  onApplicationUpdate?: (application: any) => void;
  enableSound?: boolean;
}

export const useRealTimeNotifications = ({
  onNewApplication,
  onApplicationUpdate,
  enableSound = true
}: UseRealTimeNotificationsProps = {}) => {
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();

  const playNotificationSound = useCallback(() => {
    if (!enableSound) return;
    
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, [enableSound]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  const showBrowserNotification = useCallback((title: string, options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'talent-digital-notification',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  }, []);

  const handleNewApplication = useCallback(async (payload: any) => {
    console.log('New application received:', payload);
    
    try {
      // Get application details with proper error handling
      const { data: applicationData, error } = await supabase
        .from('applications')
        .select(`
          id,
          opportunity_id,
          user_id,
          status,
          created_at
        `)
        .eq('id', payload.new.id)
        .single();

      if (error || !applicationData) {
        console.error('Error fetching application details:', error);
        return;
      }

      // Get profile and opportunity data separately
      const [profileResult, opportunityResult] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', applicationData.user_id).single(),
        supabase.from('opportunities').select('title, company_id').eq('id', applicationData.opportunity_id).single()
      ]);

      // Check if this application is for our company
      if (!opportunityResult.data?.company_id || 
          opportunityResult.data.company_id !== activeCompany?.id) {
        return;
      }

      const applicantName = profileResult.data?.full_name || 'Un candidato';
      const opportunityTitle = opportunityResult.data?.title || 'una oportunidad';

    // Play sound
    playNotificationSound();

    // Show in-app notification
    showNotificationToast({
      type: 'application',
      title: '¡Nueva aplicación recibida!',
      message: `${applicantName} se ha postulado para ${opportunityTitle}`,
      actionText: 'Ver aplicación',
      onAction: () => {
        window.open(`/business-dashboard/applications?application=${payload.new.id}`, '_blank');
      }
    });

    // Show browser notification
    showBrowserNotification('¡Nueva aplicación recibida!', {
      body: `${applicantName} se ha postulado para ${opportunityTitle}`,
      icon: '/favicon.ico'
    });

      // Call custom handler
      if (onNewApplication) {
        onNewApplication(applicationData);
      }
    } catch (error) {
      console.error('Error handling new application notification:', error);
    }
  }, [activeCompany, playNotificationSound, onNewApplication]);

  const handleApplicationUpdate = useCallback(async (payload: any) => {
    console.log('Application updated:', payload);
    
    try {
      // Get application details with proper error handling
      const { data: applicationData, error } = await supabase
        .from('applications')
        .select(`
          id,
          opportunity_id,
          user_id,
          status,
          created_at
        `)
        .eq('id', payload.new.id)
        .single();

      if (error || !applicationData) {
        console.error('Error fetching application details:', error);
        return;
      }

      // Get profile and opportunity data separately
      const [profileResult, opportunityResult] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', applicationData.user_id).single(),
        supabase.from('opportunities').select('title, company_id').eq('id', applicationData.opportunity_id).single()
      ]);

      // Check if this application is for our company
      if (!opportunityResult.data?.company_id || 
          opportunityResult.data.company_id !== activeCompany?.id) {
        return;
      }

      // Only notify for significant status changes
      const oldStatus = payload.old.status;
      const newStatus = payload.new.status;
      
      if (oldStatus === newStatus) return;

      const applicantName = profileResult.data?.full_name || 'Un candidato';
      const statusText = newStatus === 'accepted' ? 'aceptada' : 
                        newStatus === 'rejected' ? 'rechazada' : 
                        newStatus === 'reviewed' ? 'revisada' : newStatus;

      // Show update notification (less intrusive)
      toast.success(`Aplicación ${statusText}: ${applicantName}`, {
        duration: 4000,
        position: 'bottom-right'
      });

      // Call custom handler
      if (onApplicationUpdate) {
        onApplicationUpdate(applicationData);
      }
    } catch (error) {
      console.error('Error handling application update notification:', error);
    }
  }, [activeCompany, onApplicationUpdate]);

  useEffect(() => {
    if (!user || !activeCompany) return;

    // Request notification permission on mount
    requestNotificationPermission();

    console.log('Setting up real-time notifications for company:', activeCompany.id);

    // Subscribe to new applications
    const applicationsChannel = supabase
      .channel('applications-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications'
        },
        handleNewApplication
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications'
        },
        handleApplicationUpdate
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time notifications');
      supabase.removeChannel(applicationsChannel);
    };
  }, [user, activeCompany, handleNewApplication, handleApplicationUpdate, requestNotificationPermission]);

  return {
    requestNotificationPermission,
    playNotificationSound
  };
};