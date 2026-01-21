import { supabase } from '@/integrations/supabase/client';

/**
 * Notification type mapping for configuration
 */
export const NOTIFICATION_TYPES = {
  NEW_USER: 'new_user_registration',
  EMAIL_VERIFICATION: 'user_email_verification',
  PROFILE_COMPLETION: 'user_profile_completion',
  NEW_COMPANY: 'new_company_registration',
  COMPANY_UPGRADE: 'company_upgrade_request',
  COMPANY_VERIFICATION: 'company_verification',
  OPPORTUNITY_REPORTS: 'opportunity_reports',
  MARKETPLACE_REPORTS: 'marketplace_reports',
  USER_REPORTS: 'user_reports',
  CONTENT_APPROVAL: 'content_approval',
  SYSTEM_ERRORS: 'system_errors',
  PERFORMANCE_ISSUES: 'performance_issues',
  SECURITY_ALERTS: 'security_alerts',
  BACKUP_STATUS: 'backup_status',
} as const;

/**
 * Notification channels
 */
export type NotificationChannel = 'email' | 'sms' | 'push';

/**
 * Send a notification with multi-channel support
 * This will automatically respect the admin notification settings
 */
export async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}) {
  try {
    // Call the database function to create notification
    // This will automatically check if notifications are enabled
    const { data, error } = await supabase.rpc('send_notification', {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_action_url: params.actionUrl || undefined,
      p_data: params.data ? JSON.stringify(params.data) : undefined,
    });

    if (error) {
      console.error('[sendNotification] Error creating notification:', error);
      return { success: false, error };
    }

    // If notification was created, process it for multi-channel delivery
    if (data) {
      console.log('[sendNotification] Notification created:', data, 'Type:', params.type);
      
      // The database trigger will automatically call process-notification edge function via pg_net
      // But we also call it explicitly for immediate processing
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-notification', {
        body: { notification_id: data },
      });

      if (processError) {
        console.error('[sendNotification] Error invoking process-notification:', processError);
        // El trigger de BD debería procesarlo como respaldo via pg_net
      } else {
        console.log('[sendNotification] Process result:', processResult);
      }
    }

    return { success: true, notificationId: data };
  } catch (error) {
    console.error('Exception sending notification:', error);
    return { success: false, error };
  }
}

/**
 * Check if a specific notification type is enabled
 */
export async function isNotificationEnabled(notificationType: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('should_send_notification', {
      notification_type: notificationType,
      channel: 'all',
    });

    if (error) {
      console.error('Error checking notification status:', error);
      return true; // Default to enabled if we can't check
    }

    return data as boolean;
  } catch (error) {
    console.error('Exception checking notification status:', error);
    return true; // Default to enabled
  }
}

/**
 * Check if a specific channel is enabled for a notification type
 */
export async function isChannelEnabled(
  notificationType: string,
  channel: NotificationChannel
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('should_send_notification', {
      notification_type: notificationType,
      channel: channel,
    });

    if (error) {
      console.error('Error checking channel status:', error);
      return true; // Default to enabled if we can't check
    }

    return data as boolean;
  } catch (error) {
    console.error('Exception checking channel status:', error);
    return true; // Default to enabled
  }
}

/**
 * Get notification configuration for admin panel
 */
export async function getNotificationConfig() {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('category', 'notifications')
      .eq('key', 'notifications')
      .single();

    if (error) {
      console.error('Error fetching notification config:', error);
      return null;
    }

    return data?.value ? JSON.parse(data.value) : null;
  } catch (error) {
    console.error('Exception fetching notification config:', error);
    return null;
  }
}

/**
 * Example usage:
 * 
 * // Send a notification
 * await sendNotification({
 *   userId: 'user-uuid',
 *   type: 'application',
 *   title: 'Nueva aplicación',
 *   message: 'Has recibido una nueva aplicación',
 *   actionUrl: '/applications/123',
 *   data: { applicationId: '123' }
 * });
 * 
 * // Check if notifications are enabled
 * const enabled = await isNotificationEnabled(NOTIFICATION_TYPES.NEW_USER);
 * 
 * // Check if email is enabled for a notification type
 * const emailEnabled = await isChannelEnabled(NOTIFICATION_TYPES.NEW_USER, 'email');
 */
