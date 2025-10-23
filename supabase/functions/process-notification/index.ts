import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  data?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { notification_id } = await req.json();

    if (!notification_id) {
      throw new Error('notification_id is required');
    }

    console.log('Processing notification:', notification_id);

    // Get notification details
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .single();

    if (notificationError || !notification) {
      throw new Error(`Notification not found: ${notificationError?.message}`);
    }

    console.log('Notification details:', notification);

    // Get user details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', notification.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Get notification settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('category', 'notifications')
      .eq('key', 'notifications')
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
    }

    // Parse notification configurations
    let notificationConfigs: NotificationConfig[] = [];
    if (settingsData?.value) {
      try {
        notificationConfigs = JSON.parse(settingsData.value);
      } catch (e) {
        console.error('Error parsing notification configs:', e);
      }
    }

    // Map notification type to config ID
    const typeToConfigMap: Record<string, string> = {
      'application': 'new_user_registration',
      'team': 'company_upgrade_request',
      'marketplace': 'marketplace_reports',
      'opportunity': 'opportunity_reports',
      'moderation': 'content_approval',
      'system': 'system_errors',
    };

    const configId = typeToConfigMap[notification.type] || notification.type;
    const config = notificationConfigs.find((c) => c.id === configId);

    // If no config or notification disabled, skip
    if (!config || !config.enabled) {
      console.log('Notification type disabled or not configured:', configId);
      return new Response(
        JSON.stringify({ success: true, message: 'Notification disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Notification config:', config);

    const results = {
      email: false,
      sms: false,
      push: false,
    };

    // Send email notification if enabled
    if (config.email) {
      try {
        console.log('Sending email notification...');
        
        // Get admin email for notifications
        const { data: adminEmailSetting } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('category', 'notifications')
          .eq('key', 'admin_email')
          .single();

        const adminEmail = adminEmailSetting?.value || 'admin@talentodigital.com';

        const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
          body: {
            to: profile?.email || notification.user_id,
            subject: notification.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${notification.title}</h2>
                <p style="color: #666; line-height: 1.6;">${notification.message}</p>
                ${notification.action_url ? `
                  <a href="${notification.action_url}" 
                     style="display: inline-block; padding: 12px 24px; background-color: #0066cc; 
                            color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
                    Ver detalles
                  </a>
                ` : ''}
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Este es un mensaje automático de TalentoDigital. 
                  Para gestionar tus preferencias de notificaciones, 
                  <a href="/settings/notifications">haz clic aquí</a>.
                </p>
              </div>
            `,
          },
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
        } else {
          results.email = true;
          console.log('Email sent successfully');
        }
      } catch (error) {
        console.error('Email notification error:', error);
      }
    }

    // Send SMS notification if enabled (placeholder)
    if (config.sms) {
      console.log('SMS notifications not yet implemented');
      // TODO: Implement SMS sending via Twilio or similar
      // For now, just log that it would be sent
      results.sms = false;
    }

    // Send push notification if enabled
    if (config.push) {
      try {
        console.log('Sending push notification...');
        
        const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: notification.user_id,
            title: notification.title,
            body: notification.message,
            data: {
              url: notification.action_url,
              notification_id: notification.id,
              ...notification.data,
            },
          },
        });

        if (pushError) {
          console.error('Error sending push notification:', pushError);
        } else {
          results.push = true;
          console.log('Push notification sent successfully');
        }
      } catch (error) {
        console.error('Push notification error:', error);
      }
    }

    console.log('Notification processing results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        notification_id,
        channels_sent: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
