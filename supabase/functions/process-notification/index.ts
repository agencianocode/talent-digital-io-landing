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

    // Prevent duplicate processing - check if already processed
    if (notification.processed) {
      console.log('Notification already processed, skipping:', notification_id);
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Notification details:', notification);

    // Get user details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
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
      'application': 'new_application',
      'team': 'team_member_added',
      'marketplace': 'marketplace_reports',
      'opportunity': 'opportunity_reports',
      'moderation': 'content_approval',
      'system': 'system_errors',
      'security': 'security_alerts',
      'membership': 'membership_request',
      'welcome-talent': 'new_user_registration',
      'welcome-business': 'new_company_registration',
      'welcome-academy': 'new_user_registration',
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

    // Get user's personal preferences
    const { data: userPrefs, error: userPrefsError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', notification.user_id)
      .eq('notification_type', configId)
      .single();

    if (userPrefsError && userPrefsError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', userPrefsError);
    }

    // If user has disabled this notification type, skip
    if (userPrefs && !userPrefs.enabled) {
      console.log('User has disabled this notification type:', configId);
      return new Response(
        JSON.stringify({ success: true, message: 'Notification disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User preferences:', userPrefs);

    const results = {
      email: false,
      sms: false,
      push: false,
    };

    // Send email notification if enabled (check both config and user prefs)
    const emailEnabled = config.email && (!userPrefs || userPrefs.email);
    if (emailEnabled) {
      try {
        console.log('Sending email notification...');
        
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          notification.user_id
        );

        if (userError || !userData?.user?.email) {
          console.error('Error getting user email:', userError);
          throw new Error('User email not found');
        }

        const userEmail = userData.user.email;
        const userName = profile?.full_name || userEmail.split('@')[0];

        console.log('Sending email to:', userEmail);

        // Extract additional data for variable substitution
        let additionalData: Record<string, string> = {};

        // For application notifications, get candidate name and opportunity title
        if (notification.type === 'application') {
          // Try to extract from message first (format: "Nombre aplicó a \"Título\"")
          const messageMatch = notification.message.match(/^(.+?) aplicó a "(.+)"$/);
          if (messageMatch) {
            additionalData.candidateName = messageMatch[1];
            additionalData.opportunityTitle = messageMatch[2];
          }

          // Also try to get from database using IDs in notification.data
          if (notification.data?.opportunity_id) {
            const { data: opportunity } = await supabase
              .from('opportunities')
              .select('title, companies(name)')
              .eq('id', notification.data.opportunity_id)
              .single();
            
            if (opportunity) {
              additionalData.opportunityTitle = opportunity.title;
              additionalData.companyName = (opportunity.companies as any)?.name || '';
            }
          }

          if (notification.data?.application_id) {
            const { data: application } = await supabase
              .from('applications')
              .select('user_id')
              .eq('id', notification.data.application_id)
              .single();
            
            if (application?.user_id) {
              const { data: applicantProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', application.user_id)
                .single();
              
              if (applicantProfile?.full_name) {
                additionalData.candidateName = applicantProfile.full_name;
              }
            }
          }
        }

        // For opportunity notifications
        if (notification.type === 'opportunity' && notification.data?.opportunity_id) {
          const { data: opportunity } = await supabase
            .from('opportunities')
            .select('title, companies(name)')
            .eq('id', notification.data.opportunity_id)
            .single();
          
          if (opportunity) {
            additionalData.opportunityTitle = opportunity.title;
            additionalData.companyName = (opportunity.companies as any)?.name || '';
          }
        }

        // For message notifications, get sender name
        if (notification.type === 'message') {
          // Try to extract from message (format: "Nombre te envió un mensaje")
          const messageMatch = notification.message.match(/^(.+?) te envió/);
          if (messageMatch) {
            additionalData.senderName = messageMatch[1];
          }
          
          // Also try from notification.data if it has sender_id
          if (notification.data?.sender_id) {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', notification.data.sender_id)
              .single();
            
            if (senderProfile?.full_name) {
              additionalData.senderName = senderProfile.full_name;
            }
          }
        }

        // For team/membership notifications, get company name
        if (['team', 'membership', 'membership_request'].includes(notification.type)) {
          if (notification.data?.company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', notification.data.company_id)
              .single();
            
            if (company?.name) {
              additionalData.companyName = company.name;
            }
          }
          
          // Also extract from message if has format "Nombre solicitó unirse a Empresa"
          const companyMatch = notification.message.match(/unirse a (.+)$/);
          if (companyMatch) {
            additionalData.companyName = companyMatch[1];
          }
        }

        // For moderation notifications
        if (notification.type === 'moderation') {
          // Extract opportunity title from message if present
          const oppMatch = notification.message.match(/"(.+?)"/);
          if (oppMatch) {
            additionalData.opportunityTitle = oppMatch[1];
          }
          
          if (notification.data?.opportunity_id) {
            const { data: opportunity } = await supabase
              .from('opportunities')
              .select('title, companies(name)')
              .eq('id', notification.data.opportunity_id)
              .single();
            
            if (opportunity) {
              additionalData.opportunityTitle = opportunity.title;
              additionalData.companyName = (opportunity.companies as any)?.name || '';
            }
          }
        }

        // For application_status notifications, extract status label
        if (notification.type === 'application_status') {
          // Try to get status from notification.data
          if (notification.data?.applicationStatus) {
            additionalData.applicationStatus = notification.data.applicationStatus;
          }
          
          // Also try to extract from title (format: "Tu aplicación fue aceptada")
          const statusMatch = notification.title.match(/(enviada|en revisión|aceptada|rechazada|contratado)/i);
          if (statusMatch && !additionalData.applicationStatus) {
            additionalData.applicationStatus = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
          }
          
          // Get opportunity info if available
          if (notification.data?.opportunity_id) {
            const { data: opportunity } = await supabase
              .from('opportunities')
              .select('title, companies(name)')
              .eq('id', notification.data.opportunity_id)
              .single();
            
            if (opportunity) {
              additionalData.opportunityTitle = opportunity.title;
              additionalData.companyName = (opportunity.companies as any)?.name || '';
            }
          }
        }

        console.log('Additional data for email variables:', additionalData);

        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-notification-email',
          {
            body: {
              to: userEmail,
              userName: userName,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              actionUrl: notification.action_url,
              actionText: 'Ver detalles',
              // Include enriched data for variable substitution
              data: {
                candidateName: additionalData.candidateName,
                opportunityTitle: additionalData.opportunityTitle,
                companyName: additionalData.companyName,
                senderName: additionalData.senderName,
                applicationStatus: additionalData.applicationStatus,
              },
              // Include marketplace request data if present
              ...(notification.type === 'marketplace' && notification.data ? {
                contactName: notification.data.contact_name,
                contactEmail: notification.data.contact_email,
                contactPhone: notification.data.contact_phone,
                companyName: notification.data.company_name,
                serviceType: notification.data.service_type,
                description: notification.data.description,
                budget: notification.data.budget,
                timeline: notification.data.timeline,
              } : {})
            },
          }
        );

        if (emailError) {
          console.error('Error sending email:', emailError);
        } else {
          results.email = true;
          console.log('Email sent successfully:', emailData);
        }
      } catch (error) {
        console.error('Email notification error:', error);
      }
    }

    // Send SMS notification if enabled (check both config and user prefs)
    const smsEnabled = config.sms && (!userPrefs || userPrefs.sms);
    if (smsEnabled) {
      console.log('SMS notifications not yet implemented');
      // TODO: Implement SMS sending via Twilio or similar
      // For now, just log that it would be sent
      results.sms = false;
    }

    // Send push notification if enabled (check both config and user prefs)
    const pushEnabled = config.push && (!userPrefs || userPrefs.push);
    if (pushEnabled) {
      try {
        console.log('Sending push notification...');
        
        const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            userId: notification.user_id,
            title: notification.title,
            message: notification.message,
            actionUrl: notification.action_url,
            notificationId: notification.id,
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

    // Marcar la notificación como procesada para evitar reenvíos
    const anyChannelSent = results.email || results.push || results.sms;
    if (anyChannelSent) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ processed: true })
        .eq('id', notification_id);

      if (updateError) {
        console.error('Error marking notification as processed:', updateError);
      } else {
        console.log('Notification marked as processed');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification_id,
        channels_sent: results,
        processed: anyChannelSent,
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
