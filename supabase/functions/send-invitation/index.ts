import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from 'npm:resend@2.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { CompanyInvitation } from './_templates/company-invitation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  company_id: string;
  invited_by: string;
  invitation_id: string;
  redirect_base?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for RESEND_API_KEY
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY configuration" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, role, company_id, invited_by, invitation_id, redirect_base }: InvitationRequest = await req.json();

    console.log(`📧 Sending invitation to ${email} for role ${role}`);
    console.log(`📋 Invitation ID: ${invitation_id}`);
    console.log(`👤 Invited by: ${invited_by}`);
    console.log(`🌐 Redirect base: ${redirect_base || 'not provided'}`);

    // Build accept/decline URLs
    const redirectParam = redirect_base ? `&redirect=${encodeURIComponent(redirect_base)}` : '';
    const acceptUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/accept-invitation?id=${invitation_id}${redirectParam}`;
    const declineUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/decline-invitation?id=${invitation_id}${redirectParam}`;

    // Initialize Supabase client to fetch template content
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get custom template content from database
    let dbContent: Record<string, any> | null = null;
    let customSubject: string | null = null;

    try {
      const { data: dbTemplate } = await supabase
        .from('email_templates')
        .select('content, subject, is_active')
        .eq('id', 'company-invitation')
        .single();

      if (dbTemplate && dbTemplate.is_active) {
        dbContent = dbTemplate.content as Record<string, any>;
        customSubject = dbTemplate.subject;
        console.log('📄 Using custom template from database: company-invitation');
      }
    } catch (dbError) {
      console.log('⚠️ No custom template found, using defaults:', dbError);
    }

    // Build template props
    const roleDisplay = role === 'admin' ? 'Administrador' : 'Miembro';
    const templateProps: any = {
      email,
      role,
      invitedBy: invited_by,
      acceptUrl,
      declineUrl,
    };

    // Merge database content with template props (DB overrides defaults)
    if (dbContent) {
      Object.assign(templateProps, dbContent);
    }

    // Render the React Email template
    const html = await renderAsync(
      React.createElement(CompanyInvitation, templateProps)
    );

    // Build subject - replace placeholders
    let emailSubject = customSubject || `Invitación para unirte a la empresa como ${roleDisplay}`;
    emailSubject = emailSubject.replace('{{role}}', roleDisplay);

    const emailResponse = await resend.emails.send({
      from: 'TalentoDigital Invitaciones <invitaciones@app.talentodigital.io>',
      to: [email],
      subject: emailSubject,
      html,
    });

    console.log("✅ Email sent successfully via Resend");
    console.log("📨 Resend response:", JSON.stringify(emailResponse));

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
