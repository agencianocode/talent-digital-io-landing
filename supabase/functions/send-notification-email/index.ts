import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { ApplicationNotification } from './_templates/application-notification.tsx';
import { OpportunityNotification } from './_templates/opportunity-notification.tsx';
import { MessageNotification } from './_templates/message-notification.tsx';
import { TeamNotification } from './_templates/team-notification.tsx';
import { MarketplaceNotification } from './_templates/marketplace-notification.tsx';
import { ModerationNotification } from './_templates/moderation-notification.tsx';
import { WelcomeTalent } from './_templates/welcome-talent.tsx';
import { WelcomeBusiness } from './_templates/welcome-business.tsx';
import { WelcomeAcademy } from './_templates/welcome-academy.tsx';
import { AcademyExclusiveOpportunityEmail } from './_templates/academy-exclusive-opportunity.tsx';
import { MarketplaceRequest } from './_templates/marketplace-request.tsx';
import { CompleteProfileReminder } from './_templates/complete-profile-reminder.tsx';

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
}

// Map notification types to template IDs in database
const getTemplateId = (type: string): string => {
  const mapping: Record<string, string> = {
    'application': 'new-application',
    'opportunity': 'new-opportunity',
    'academy-exclusive': 'new-opportunity',
    'message': 'new-message',
    'team': 'membership-request',
    'marketplace': 'new-message',
    'marketplace_request': 'new-message',
    'moderation': 'new-message',
    'welcome-talent': 'welcome-talent',
    'welcome-business': 'welcome-business',
    'welcome-academy': 'welcome-business',
    'complete-profile-reminder': 'onboarding-reminder',
  };
  return mapping[type] || type;
};

const getTemplateComponent = (type: string) => {
  switch (type) {
    case 'application':
      return ApplicationNotification;
    case 'opportunity':
      return OpportunityNotification;
    case 'academy-exclusive':
      return AcademyExclusiveOpportunityEmail;
    case 'message':
      return MessageNotification;
    case 'team':
      return TeamNotification;
    case 'marketplace':
      return MarketplaceNotification;
    case 'marketplace_request':
      return MarketplaceRequest;
    case 'moderation':
      return ModerationNotification;
    case 'welcome-talent':
      return WelcomeTalent;
    case 'welcome-business':
      return WelcomeBusiness;
    case 'welcome-academy':
      return WelcomeAcademy;
    case 'complete-profile-reminder':
      return CompleteProfileReminder;
    default:
      return ApplicationNotification;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userName, type, title, message, actionUrl, actionText, missingItems, reminderType }: NotificationEmailRequest =
      await req.json();

    console.log('Sending notification email:', { to, type, title });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get custom template content from database
    const templateId = getTemplateId(type);
    let dbContent: Record<string, string> | null = null;
    let customSubject: string | null = null;

    try {
      const { data: dbTemplate } = await supabase
        .from('email_templates')
        .select('content, subject, is_active')
        .eq('id', templateId)
        .single();

      if (dbTemplate && dbTemplate.is_active) {
        dbContent = dbTemplate.content as Record<string, string>;
        customSubject = dbTemplate.subject;
        console.log('Using custom template from database:', templateId);
      }
    } catch (dbError) {
      console.log('No custom template found, using defaults:', dbError);
    }

    // Get the appropriate template component
    const TemplateComponent = getTemplateComponent(type);

    // Build props based on template type
    let templateProps: any = {
      userName,
      title,
      message,
      actionUrl: actionUrl ? `https://app.talentodigital.io${actionUrl}` : undefined,
      actionText,
    };

    // Add specific props for complete-profile-reminder
    if (type === 'complete-profile-reminder') {
      templateProps = {
        userName,
        missingItems: missingItems || [],
        reminderType: reminderType || 'first',
      };
    }

    // Merge database content with template props (DB overrides defaults)
    if (dbContent) {
      templateProps = { ...templateProps, ...dbContent };
    }

    // Render the React Email template
    const html = await renderAsync(
      React.createElement(TemplateComponent, templateProps)
    );

    // Use custom subject from DB if available, otherwise use provided title
    const emailSubject = customSubject || title;

    const emailResponse = await resend.emails.send({
      from: 'TalentoDigital Notificaciones <notificaciones@app.talentodigital.io>',
      to: [to],
      subject: emailSubject,
      html,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-notification-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
