import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from 'npm:resend@2.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { UnifiedEmail } from './_templates/unified-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailRequest {
  to: string;
  userName: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  missingItems?: string[];
  reminderType?: 'first' | 'second';
  // Additional data for variable substitution
  data?: {
    opportunityTitle?: string;
    candidateName?: string;
    companyName?: string;
    senderName?: string;
    applicationStatus?: string;
    messagePreview?: string;
    // Marketplace view
    viewer_name?: string;
    viewerName?: string;
    service_title?: string;
    serviceTitle?: string;
    // Profile view
    profile_name?: string;
    profileName?: string;
    // Premium
    user_type?: string;
    userType?: string;
    // Opportunity tracking
    tracking_type?: string;
    views_count?: string;
    applications_count?: string;
    deadline_date?: string;
    // Support & Feedback
    report_title?: string;
    report_description?: string;
    reporter_name?: string;
    suggestion_title?: string;
    suggestion_description?: string;
    suggester_name?: string;
    comment_preview?: string;
    new_status?: string;
    status_label?: string;
  };
}

// Map notification types to template IDs in database
const getTemplateId = (type: string): string => {
  const mapping: Record<string, string> = {
    // Application notifications
    'application': 'new-application',
    'application_reviewed': 'application-reviewed',
    'application_accepted': 'application-accepted',
    'application_rejected': 'application-rejected',
    'application_hired': 'application-hired',
    'application_status': 'application-status',
    
    // Opportunity notifications
    'opportunity': 'new-opportunity',
    'opportunity_status': 'opportunity-status',
    'opportunity_closed': 'opportunity-closed-auto',
    'opportunity_closed_auto': 'opportunity-closed-auto',
    'opportunity_closed_manual': 'opportunity-closed-manual',
    'academy-exclusive': 'new-opportunity',
    
    // Milestone notifications
    'milestone': 'milestone',
    
    // Message notifications (unified)
    'message': 'new-message',
    'new_message': 'new-message',
    'contact_request': 'new-message',
    
    // Team/Membership notifications
    'team': 'membership-request',
    'company-invitation': 'company-invitation',
    'company_invitation': 'company-invitation',
    'membership-approved': 'membership-approved',
    'membership_approved': 'membership-approved',
    
    // Profile notifications
    'profile-view': 'profile-view',
    'profile_view': 'profile-view',
    
    // Marketplace notifications
    'marketplace': 'marketplace-request',
    'marketplace_request': 'marketplace-request',
    'marketplace_view': 'marketplace-view',
    'marketplace-view': 'marketplace-view',
    
    // Opportunity tracking notifications
    'opportunity_tracking': 'opportunity-14-days-active',
    
    // Moderation notifications
    'moderation': 'moderation',
    
    // Welcome/Onboarding notifications
    'welcome-talent': 'welcome-talent',
    'welcome-business': 'welcome-business',
    'welcome-academy': 'welcome-academy',
    'complete-profile-reminder': 'onboarding-reminder',
    
    // Admin notifications
    'new_user_registration': 'admin-new-user',
    'new_company_registration': 'admin-new-company',
    'company_upgrade_request': 'admin-upgrade-request',
    'opportunity_reports': 'admin-report',
    'marketplace_reports': 'admin-report',
    'user_reports': 'admin-report',
    'content_approval': 'admin-report',
    'system_errors': 'admin-system-error',
    'security_alerts': 'admin-security-alert',
    'publishing_request': 'admin-publishing-request',
    
    // Premium approved notifications
    'premium-approved': 'premium-approved',
    'premium_approved': 'premium-approved',
    
    // Support & Feedback notifications
    'new_bug_report': 'admin-new-bug-report',
    'new_bug_report_comment_admin': 'admin-bug-report-comment',
    'bug_report_status_change': 'bug-report-status',
    'bug_report_new_comment': 'bug-report-comment',
    'new_feedback': 'admin-new-feedback',
    'new_feedback_comment_admin': 'admin-new-feedback',
    'feedback_status_change': 'feedback-status',
    'feedback_new_comment': 'feedback-comment',
  };
  return mapping[type] || type;
};

// Default template fallback (UnifiedContent format)
const getDefaultTemplate = (type: string, title: string, message: string): Record<string, any> => {
  return {
    header_enabled: true,
    header_title: '🚀 TalentoDigital',
    body_content: `<p>Hola <strong>{{first_name}}</strong>,</p><p>${message}</p>`,
    button_enabled: true,
    button_text: 'Ver más',
    button_link: '{{action_url}}',
    secondary_enabled: false,
    secondary_content: '',
    footer_content: '<p>© 2025 TalentoDigital - Conectamos talento con oportunidades</p>',
  };
};

// Substitute variables in content
const substituteVariables = (text: string, variables: Record<string, string>): string => {
  if (!text) return '';
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    result = result.replace(regex, value || '');
  });
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add random delay to avoid rate limiting when multiple emails are sent simultaneously
  const randomDelay = Math.floor(Math.random() * 500) + 100; // 100-600ms
  await new Promise(resolve => setTimeout(resolve, randomDelay));

  try {
    const { to, userName, type, title, message, actionUrl, actionText, missingItems, reminderType, data }: NotificationEmailRequest =
      await req.json();

    console.log('📧 Sending notification email:', { to, type, title });
    console.log('📊 Data received:', data);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load global styles from admin_customization
    let globalStyles = {
      buttonColor: '#667eea',
      buttonTextColor: '#ffffff',
      headerColor1: '#667eea',
      headerColor2: '#764ba2',
      headerTextColor: 'white',
    };

    try {
      const { data: customization } = await supabase
        .from('admin_customization')
        .select('email_header_color1, email_header_color2, email_button_color, email_button_text_color, email_header_text_color')
        .single();

      if (customization) {
        globalStyles = {
          buttonColor: customization.email_button_color || globalStyles.buttonColor,
          buttonTextColor: customization.email_button_text_color || globalStyles.buttonTextColor,
          headerColor1: customization.email_header_color1 || globalStyles.headerColor1,
          headerColor2: customization.email_header_color2 || globalStyles.headerColor2,
          headerTextColor: customization.email_header_text_color || globalStyles.headerTextColor,
        };
        console.log('🎨 Loaded global styles from admin_customization');
      }
    } catch (styleError) {
      console.log('⚠️ Using default global styles');
    }

    // Try to get custom template content from database
    let templateId = getTemplateId(type);
    
    // For opportunity_tracking, select template based on tracking_type
    if (type === 'opportunity_tracking' && data?.tracking_type) {
      const trackingTemplateMap: Record<string, string> = {
        '14_days_active': 'opportunity-14-days-active',
        '7_days_expiring': 'opportunity-7-days-expiring',
        'expired': 'opportunity-expired',
      };
      templateId = trackingTemplateMap[data.tracking_type] || templateId;
      console.log('📋 Opportunity tracking template selected:', templateId, 'for type:', data.tracking_type);
    }
    
    console.log('📋 Looking for template:', templateId);
    
    let dbContent: Record<string, any> | null = null;
    let customSubject: string | null = null;

    try {
      const { data: dbTemplate, error: templateError } = await supabase
        .from('email_templates')
        .select('content, subject, is_active')
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.log('⚠️ Template fetch error:', templateError.message);
      } else if (dbTemplate && dbTemplate.is_active) {
        dbContent = dbTemplate.content as Record<string, any>;
        customSubject = dbTemplate.subject;
        console.log('✅ Using custom template from database:', templateId);
      }
    } catch (dbError) {
      console.log('⚠️ No custom template found, using defaults');
    }

    // Use default template if no database template found
    if (!dbContent) {
      console.log('📝 Using default template for type:', type);
      dbContent = getDefaultTemplate(type, title, message);
    }

    // Build variables for substitution
    const fullActionUrl = actionUrl 
      ? (actionUrl.startsWith('http') ? actionUrl : `https://app.talentodigital.io${actionUrl}`)
      : 'https://app.talentodigital.io';
    const firstName = userName?.split(' ')[0] || userName || '';
    
    // Status translation map for Spanish display (fallback if process-notification didn't translate)
    const translateStatus = (status: string | undefined): string => {
      if (!status) return '';
      const statusMap: Record<string, string> = {
        'pending': 'Pendiente',
        'reviewed': 'En revisión',
        'accepted': 'Aceptada',
        'rejected': 'Rechazada',
        'hired': 'Contratado',
        'interview': 'En entrevista',
        'shortlisted': 'Preseleccionado'
      };
      // If already translated or not in map, return as-is with first letter capitalized
      return statusMap[status.toLowerCase()] || (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase());
    };

    // Support & Feedback status translation
    const translateSupportStatus = (status: string | undefined): string => {
      if (!status) return '';
      const statusMap: Record<string, string> = {
        // Bug report statuses
        'open': 'Abierto',
        'in_review': 'En revisión',
        'in_progress': 'En progreso',
        'resolved': 'Resuelto',
        'closed': 'Cerrado',
        // Feedback statuses
        'new': 'Nueva',
        'planned': 'Planeada',
        'in_development': 'En desarrollo',
        'implemented': 'Implementada',
        'rejected': 'Rechazada'
      };
      return statusMap[status.toLowerCase()] || (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase());
    };

    const variables: Record<string, string> = {
      first_name: firstName,
      last_name: userName?.split(' ').slice(1).join(' ') || '',
      full_name: userName || '',
      user_name: userName || '',
      company_name: data?.companyName || '',
      opportunity_title: data?.opportunityTitle || '',
      candidate_name: data?.candidateName || userName || '',
      sender_name: data?.senderName || '',
      application_status: translateStatus(data?.applicationStatus),
      message_preview: data?.messagePreview || message || '',
      action_url: fullActionUrl,
      // Marketplace view variables
      viewer_name: data?.viewer_name || data?.viewerName || '',
      service_title: data?.service_title || data?.serviceTitle || '',
      // Profile view variables
      profile_name: data?.profile_name || data?.profileName || '',
      // Premium approved variables
      user_type: data?.user_type || data?.userType || '',
      // Opportunity tracking variables
      views_count: data?.views_count || '0',
      applications_count: data?.applications_count || '0',
      deadline_date: data?.deadline_date || '',
      // Support & Feedback variables
      report_title: data?.report_title || '',
      report_description: data?.report_description || '',
      reporter_name: data?.reporter_name || '',
      suggestion_title: data?.suggestion_title || '',
      suggestion_description: data?.suggestion_description || '',
      suggester_name: data?.suggester_name || '',
      comment_preview: data?.comment_preview || '',
      new_status: data?.status_label || translateSupportStatus(data?.new_status) || '',
    };

    console.log('🔧 Variables prepared for template:', variables);

    // Process content with variable substitution
    const processedContent = {
      header_enabled: dbContent.header_enabled ?? true,
      header_title: substituteVariables(dbContent.header_title || '🚀 TalentoDigital', variables),
      body_content: substituteVariables(dbContent.body_content || message, variables),
      button_enabled: dbContent.button_enabled ?? true,
      button_text: substituteVariables(dbContent.button_text || actionText || 'Ver más', variables),
      button_link: substituteVariables(dbContent.button_link || fullActionUrl, variables),
      secondary_enabled: dbContent.secondary_enabled ?? false,
      secondary_content: substituteVariables(dbContent.secondary_content || '', variables),
      footer_content: substituteVariables(dbContent.footer_content || '', variables),
    };

    console.log('📄 Processed content:', {
      header_title: processedContent.header_title,
      body_preview: processedContent.body_content.substring(0, 100) + '...',
      button_text: processedContent.button_text,
    });

    // Render the unified template - ALL emails use UnifiedEmail now
    const html = await renderAsync(
      React.createElement(UnifiedEmail, {
        userName,
        subject: customSubject || title,
        content: processedContent,
        globalStyles,
      })
    );

    // Use custom subject from DB if available, otherwise use provided title
    const emailSubject = substituteVariables(customSubject || title, variables);

    const emailResponse = await resend.emails.send({
      from: 'TalentoDigital Notificaciones <notificaciones@app.talentodigital.io>',
      to: [to],
      subject: emailSubject,
      html,
    });

    console.log('✅ Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('❌ Error in send-notification-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
