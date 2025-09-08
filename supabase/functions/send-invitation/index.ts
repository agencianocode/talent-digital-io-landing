import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, company_id, invited_by, invitation_id }: InvitationRequest = await req.json();

    console.log(`Sending invitation to ${email} for role ${role}`);

    const acceptUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/accept-invitation?id=${invitation_id}`;
    const declineUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/decline-invitation?id=${invitation_id}`;

    const emailResponse = await resend.emails.send({
      from: "TalentFlow <onboarding@resend.dev>",
      to: [email],
      subject: `Invitación para unirte a la empresa como ${role}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitación a TalentFlow</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Has sido invitado!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">TalentFlow - Plataforma de Gestión de Talento</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Invitación para unirte como ${role.toUpperCase()}</h2>
            
            <p>Hola,</p>
            <p><strong>${invited_by}</strong> te ha invitado a unirte a su empresa en TalentFlow con el rol de <strong>${role}</strong>.</p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">¿Qué puedes hacer como ${role}?</h3>
              ${role === 'admin' ? `
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Crear y gestionar oportunidades de trabajo</li>
                  <li>Revisar y gestionar aplicaciones</li>
                  <li>Acceder a reportes y análisis</li>
                  <li>Gestionar configuraciones de la empresa</li>
                </ul>
              ` : `
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Ver oportunidades de trabajo publicadas</li>
                  <li>Revisar aplicaciones recibidas</li>
                  <li>Acceder a reportes básicos</li>
                </ul>
              `}
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${acceptUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Aceptar Invitación</a>
              <a href="${declineUrl}" style="display: inline-block; background: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Rechazar</a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d;">
              <p><strong>¿Necesitas ayuda?</strong></p>
              <p>Si tienes problemas para aceptar la invitación o tienes preguntas sobre tu rol, contacta a ${invited_by} directamente.</p>
              <p style="margin-top: 20px;">
                <small>Esta invitación fue enviada desde TalentFlow. Si no esperabas esta invitación, puedes ignorar este email.</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

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