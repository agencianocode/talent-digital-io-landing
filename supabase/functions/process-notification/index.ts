import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Map notification type to config ID (CORRECTED MAPPINGS)
    const typeToConfigMap: Record<string, string> = {
      // Application status notifications → application_status
      'application_status': 'application_status',
      'application_reviewed': 'application_status',
      'application_accepted': 'application_status',
      'application_rejected': 'application_status',
      'application_hired': 'application_status',
      'opportunity_closed_auto': 'application_status',
      'opportunity_closed_manual': 'application_status',
      // New application notifications → new_application
      'application': 'new_application',
      'new_applicant': 'new_application',
      // Message notifications → new_message
      'message': 'new_message',
      'new_message': 'new_message',
      // Milestone notifications → application_milestone
      'milestone': 'application_milestone',
      // Profile and Marketplace view notifications
      'profile_view': 'profile_view',
      'marketplace_view': 'marketplace_view',
      // Opportunity tracking notifications
      'opportunity_tracking': 'opportunity_expiring',
      // Other mappings
      'team': 'team_member_added',
      'marketplace': 'marketplace_reports',
      'marketplace_request': 'marketplace_reports',
      'opportunity': 'opportunity_reports',
      'moderation': 'content_approval',
      'system': 'system_errors',
      'security': 'security_alerts',
      'membership': 'membership_request',
      'welcome-talent': 'new_user_registration',
      'welcome-business': 'new_company_registration',
      'welcome-academy': 'new_user_registration',
      // Premium approved
      'premium_approved': 'premium_approved',
      'premium-approved': 'premium_approved',
      
      // ===== SUPPORT & FEEDBACK NOTIFICATIONS =====
      // Bug Report notifications (to users)
      'bug_report_new_comment': 'bug_report_new_comment',
      'bug_report_status_change': 'bug_report_status_change',
      // Bug Report notifications (to admins)
      'new_bug_report': 'new_bug_report',
      'new_bug_report_comment_admin': 'new_bug_report_comment_admin',
      // Feedback notifications (to users)
      'feedback_new_comment': 'feedback_new_comment',
      'feedback_status_change': 'feedback_status_change',
      // Feedback notifications (to admins)
      'new_feedback': 'new_feedback',
      'new_feedback_comment_admin': 'new_feedback_comment_admin',
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

    // Define legacy preference mappings for backwards compatibility
    const legacyPreferenceMap: Record<string, string[]> = {
      'application_status': ['application_status', 'application_updates'],
      'new_message': ['new_message', 'messages'],
      'new_application': ['new_application', 'new_applications'],
      'application_milestone': ['application_milestone', 'opportunity_milestones'],
      'team_member_added': ['team_member_added', 'team_requests'],
    };

    // Get preference types to check (including legacy fallbacks)
    const preferenceTypesToCheck = legacyPreferenceMap[configId] || [configId];
    
    console.log('Checking user preferences for types:', preferenceTypesToCheck);

    // Get user's personal preferences - check all possible preference type names
    const { data: userPrefsArray, error: userPrefsError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', notification.user_id)
      .in('notification_type', preferenceTypesToCheck);

    if (userPrefsError) {
      console.error('Error fetching user preferences:', userPrefsError);
    }

    // Use the first matching preference found
    const userPrefs = userPrefsArray && userPrefsArray.length > 0 ? userPrefsArray[0] : null;

    // Determine channel preferences independently
    // userPrefs.enabled controls Web App (in-app) visibility
    // userPrefs.email controls email delivery
    // userPrefs.push controls push notifications
    const webAppEnabled = !userPrefs || userPrefs.enabled;
    const emailPrefsEnabled = !userPrefs || userPrefs.email;
    const pushPrefsEnabled = !userPrefs || userPrefs.push;

    console.log('User channel preferences:', {
      configId,
      preferenceType: userPrefs?.notification_type || 'none (defaults apply)',
      webApp: webAppEnabled,
      email: emailPrefsEnabled,
      push: pushPrefsEnabled,
    });

    // Check if ALL channels are disabled - only then skip entirely
    const allChannelsDisabled = !webAppEnabled && !emailPrefsEnabled && !pushPrefsEnabled;
    if (allChannelsDisabled) {
      console.log('All channels disabled for this notification type:', configId);
      // Mark as processed to prevent re-processing
      await supabase.from('notifications').update({ processed: true }).eq('id', notification_id);
      return new Response(
        JSON.stringify({ success: true, message: 'All channels disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      email: false,
      sms: false,
      push: false,
    };

    // Send email notification if enabled (check both admin config AND user email preference)
    const emailEnabled = config.email && emailPrefsEnabled;
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

        // For milestone notifications (business user milestones)
        if (notification.type === 'milestone' && notification.data?.opportunity_id) {
          const { data: opportunity } = await supabase
            .from('opportunities')
            .select('title, companies(name)')
            .eq('id', notification.data.opportunity_id)
            .single();
          
          if (opportunity) {
            additionalData.opportunityTitle = opportunity.title;
            additionalData.companyName = (opportunity.companies as any)?.name || '';
          }
          // Also include milestone count if available
          if (notification.data?.milestone) {
            additionalData.milestoneCount = String(notification.data.milestone);
          }
        }

        // For message notifications, get sender name and message preview
        // Support both 'message' (legacy) and 'new_message' (current trigger)
        if (notification.type === 'message' || notification.type === 'new_message') {
          // Try from notification.data if it has sender_name directly
          if (notification.data?.sender_name) {
            additionalData.senderName = notification.data.sender_name;
          }
          
          // If message_preview is explicitly in data, use it
          if (notification.data?.message_preview) {
            additionalData.messagePreview = notification.data.message_preview;
          }
          
          // Try from notification.data if it has sender_id
          if (notification.data?.sender_id && !additionalData.senderName) {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', notification.data.sender_id)
              .single();
            
            if (senderProfile?.full_name) {
              additionalData.senderName = senderProfile.full_name;
            }
          }
          
          // If data is empty or incomplete, try to get from most recent message
          if (!additionalData.senderName || !additionalData.messagePreview) {
            console.log('Missing message data, attempting to fetch from messages table...');
            
            // Get the most recent unread message to this user (within last hour to be safe)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { data: recentMessage, error: msgError } = await supabase
              .from('messages')
              .select('content, sender_id')
              .eq('recipient_id', notification.user_id)
              .gte('created_at', oneHourAgo)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (recentMessage && !msgError) {
              // Get sender's name
              if (!additionalData.senderName && recentMessage.sender_id) {
                const { data: senderProfile } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('user_id', recentMessage.sender_id)
                  .single();
                
                if (senderProfile?.full_name) {
                  additionalData.senderName = senderProfile.full_name;
                  console.log('Found sender name from messages table:', senderProfile.full_name);
                }
              }
              
              // Get message preview (truncate to 150 chars)
              if (!additionalData.messagePreview && recentMessage.content) {
                additionalData.messagePreview = recentMessage.content.substring(0, 150);
                if (recentMessage.content.length > 150) {
                  additionalData.messagePreview += '...';
                }
                console.log('Found message preview from messages table');
              }
            } else {
              console.log('Could not fetch recent message:', msgError?.message);
            }
          }
          
          // Try to extract sender name from message (format: "Nombre te envió un mensaje")
          if (!additionalData.senderName) {
            const messageMatch = notification.message.match(/^(.+?) te envió/);
            if (messageMatch) {
              additionalData.senderName = messageMatch[1];
            }
          }
          
          // Fallback: use notification.message as preview if still empty
          if (!additionalData.messagePreview) {
            additionalData.messagePreview = notification.message || '';
          }
          
          // If we still don't have senderName, try to get company name from context
          if (!additionalData.senderName && notification.data?.company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', notification.data.company_id)
              .single();
            
            if (company?.name) {
              additionalData.senderName = company.name;
            }
          }
          
          // Final fallback for sender name
          if (!additionalData.senderName) {
            additionalData.senderName = 'Alguien';
            console.log('Using fallback sender name: Alguien');
          }
          
          console.log('Final message notification data:', {
            senderName: additionalData.senderName,
            messagePreviewLength: additionalData.messagePreview?.length || 0
          });
        }

        // For marketplace_view notifications, extract viewer and service info
        if (notification.type === 'marketplace_view') {
          if (notification.data?.viewer_name) {
            additionalData.viewer_name = notification.data.viewer_name;
          }
          if (notification.data?.service_title) {
            additionalData.service_title = notification.data.service_title;
          }
          console.log('Marketplace view additional data:', additionalData);
        }

        // For opportunity_tracking notifications, extract all data from notification.data
        if (notification.type === 'opportunity_tracking') {
          additionalData.opportunityTitle = notification.data?.opportunity_title || '';
          additionalData.views_count = notification.data?.views_count?.toString() || '0';
          additionalData.applications_count = notification.data?.applications_count?.toString() || '0';
          additionalData.deadline_date = notification.data?.deadline_date || '';
          additionalData.tracking_type = notification.data?.tracking_type || '';
          console.log('Opportunity tracking additional data:', additionalData);
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

        // For application_status and specific status notifications, extract status label
        const applicationStatusTypes = ['application_status', 'application_reviewed', 'application_accepted', 'application_rejected', 'application_hired', 'opportunity_closed_auto', 'opportunity_closed_manual'];
        if (applicationStatusTypes.includes(notification.type)) {
          // SECURITY: Validate user role - these notifications are only for talent
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', notification.user_id)
            .single();
          
          if (userRole?.role && ['freemium_business', 'premium_business', 'academy_premium'].includes(userRole.role)) {
            console.log('BLOCKED: Talent notification sent to business user:', {
              notification_id: notification.id,
              type: notification.type,
              user_role: userRole.role,
              user_id: notification.user_id
            });
            // Mark as processed but don't send email
            await supabase
              .from('notifications')
              .update({ processed: true })
              .eq('id', notification_id);
            return new Response(
              JSON.stringify({ success: true, message: 'Blocked: talent notification to business user', skipped: true }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // For application status notifications TO TALENT, candidateName is the recipient
          additionalData.candidateName = userName;
          
          // Status translation map for Spanish display
          const statusTranslationMap: Record<string, string> = {
            'pending': 'Pendiente',
            'reviewed': 'En revisión',
            'accepted': 'Aceptada',
            'rejected': 'Rechazada',
            'hired': 'Contratado',
            'interview': 'En entrevista',
            'shortlisted': 'Preseleccionado'
          };
          
          // Try to get status from notification.data - check multiple possible field names
          const rawStatus = notification.data?.new_status || notification.data?.applicationStatus || notification.data?.status;
          if (rawStatus) {
            // Translate status to Spanish if in map, otherwise capitalize
            additionalData.applicationStatus = statusTranslationMap[rawStatus.toLowerCase()] || 
              (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase());
            console.log('Mapped application status:', rawStatus, '->', additionalData.applicationStatus);
          }
          
          // Also try to extract from title (format: "Tu aplicación fue aceptada")
          const statusMatch = notification.title.match(/(enviada|en revisión|aceptada|rechazada|contratado)/i);
          if (statusMatch && !additionalData.applicationStatus) {
            additionalData.applicationStatus = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
          }
          
          // Try to get opportunity info from notification.data FIRST (for test notifications or pre-populated data)
          if (notification.data?.opportunity_title) {
            additionalData.opportunityTitle = notification.data.opportunity_title;
          }
          if (notification.data?.company_name) {
            additionalData.companyName = notification.data.company_name;
          }
          
          // If not in data, try to fetch from DB using opportunity_id
          if (notification.data?.opportunity_id && (!additionalData.opportunityTitle || !additionalData.companyName)) {
            const { data: opportunity } = await supabase
              .from('opportunities')
              .select('title, companies(name)')
              .eq('id', notification.data.opportunity_id)
              .single();
            
            if (opportunity) {
              if (!additionalData.opportunityTitle) {
                additionalData.opportunityTitle = opportunity.title;
              }
              if (!additionalData.companyName) {
                additionalData.companyName = (opportunity.companies as any)?.name || '';
              }
            }
          }
          
          // VALIDATION: Check required data for these notification types
          if (!additionalData.opportunityTitle || !additionalData.companyName) {
            console.warn('Missing required data for application status email:', {
              notification_id: notification.id,
              type: notification.type,
              opportunityTitle: additionalData.opportunityTitle,
              companyName: additionalData.companyName
            });
            // Still proceed but log warning - the template will show empty values
          }
        }

        // ===== SUPPORT & FEEDBACK NOTIFICATIONS =====
        const supportNotificationTypes = [
          'bug_report_new_comment', 'bug_report_status_change', 'new_bug_report', 'new_bug_report_comment_admin',
          'feedback_new_comment', 'feedback_status_change', 'new_feedback', 'new_feedback_comment_admin'
        ];
        
        if (supportNotificationTypes.includes(notification.type)) {
          // Status translation map for support tickets
          const supportStatusTranslationMap: Record<string, string> = {
            'open': 'Abierto',
            'in_review': 'En revisión',
            'in_progress': 'En progreso',
            'resolved': 'Resuelto',
            'closed': 'Cerrado',
            'planned': 'Planeado',
            'implemented': 'Implementado',
            'rejected': 'Rechazado'
          };
          
          // Extract data from notification.data
          if (notification.data?.report_title) {
            additionalData.report_title = notification.data.report_title;
          }
          if (notification.data?.suggestion_title) {
            additionalData.suggestion_title = notification.data.suggestion_title;
          }
          if (notification.data?.new_status) {
            const rawStatus = notification.data.new_status;
            additionalData.new_status = supportStatusTranslationMap[rawStatus] || rawStatus;
          }
          if (notification.data?.comment_preview) {
            additionalData.comment_preview = notification.data.comment_preview;
          }
          if (notification.data?.commenter_name) {
            additionalData.commenter_name = notification.data.commenter_name;
          }
          
          console.log('Support notification additional data:', additionalData);
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
                messagePreview: additionalData.messagePreview,
                viewer_name: additionalData.viewer_name,
                service_title: additionalData.service_title,
                views_count: additionalData.views_count,
                applications_count: additionalData.applications_count,
                deadline_date: additionalData.deadline_date,
                tracking_type: additionalData.tracking_type,
                // Support & Feedback data
                report_title: additionalData.report_title,
                suggestion_title: additionalData.suggestion_title,
                new_status: additionalData.new_status,
                comment_preview: additionalData.comment_preview,
                commenter_name: additionalData.commenter_name,
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

    // Send SMS notification if enabled (check both admin config AND user sms preference)
    const smsEnabled = config.sms && (!userPrefs || userPrefs.sms);
    if (smsEnabled) {
      console.log('SMS notifications not yet implemented');
      // TODO: Implement SMS sending via Twilio or similar
      // For now, just log that it would be sent
      results.sms = false;
    }

    // Send push notification if enabled (check both admin config AND user push preference)
    const pushEnabled = config.push && pushPrefsEnabled;
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
