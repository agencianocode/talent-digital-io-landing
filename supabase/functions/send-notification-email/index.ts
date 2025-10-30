import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
}

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
    case 'moderation':
      return ModerationNotification;
    case 'welcome-talent':
      return WelcomeTalent;
    case 'welcome-business':
      return WelcomeBusiness;
    case 'welcome-academy':
      return WelcomeAcademy;
    default:
      return ApplicationNotification; // Fallback
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userName, type, title, message, actionUrl, actionText }: NotificationEmailRequest =
      await req.json();

    console.log('Sending notification email:', { to, type, title });

    // Get the appropriate template component
    const TemplateComponent = getTemplateComponent(type);

    // Render the React Email template
    const html = await renderAsync(
      React.createElement(TemplateComponent, {
        userName,
        title,
        message,
        actionUrl: actionUrl ? `https://app.talentodigital.io${actionUrl}` : undefined,
        actionText,
      })
    );

    const emailResponse = await resend.emails.send({
      from: 'TalentoDigital Notificaciones <onboarding@resend.dev>',
      to: [to],
      subject: title,
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
