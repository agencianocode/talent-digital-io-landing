import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const invitationId = url.searchParams.get('id');
  const redirectBase = url.searchParams.get('redirect');

  if (!invitationId) {
    return new Response('Invitation ID is required', { status: 400 });
  }

  try {
    // Get invitation details (support both id and legacy invitation_token)
    const { data: invitation, error: fetchError } = await supabase
      .from('company_user_roles')
      .select('*')
      .or(`id.eq.${invitationId},invitation_token.eq.${invitationId}`)
      .limit(1)
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.status !== 'pending') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invitación ya procesada</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .container { background: #f8f9fa; padding: 40px; border-radius: 10px; }
            .warning { color: #856404; background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Invitación ya procesada</h1>
            <div class="warning">
              <p>Esta invitación ya ha sido ${invitation.status === 'accepted' ? 'aceptada' : 'rechazada'} anteriormente.</p>
            </div>
            <p><a href="/">Ir a TalentFlow</a></p>
          </div>
        </body>
        </html>
      `, { 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('company_user_roles')
      .update({ status: 'declined' })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    // Calculate redirect URL
    const appUrl = redirectBase || Deno.env.get('APP_BASE_URL') || 'https://talent-digital-io-landing.lovable.app';

    console.log(`❌ Invitation declined, redirecting to: ${appUrl}`);

    // Return HTTP 302 redirect
    return new Response(null, {
      status: 302,
      headers: {
        'Location': appUrl,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    console.error('Error declining invitation:', error);
    const appUrl = redirectBase || Deno.env.get('APP_BASE_URL') || 'https://talent-digital-io-landing.lovable.app';
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { background: #f8d7da; color: #721c24; padding: 40px; border-radius: 10px; border: 1px solid #f5c6cb; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Error</h1>
          <p>No se pudo procesar la invitación: ${error.message}</p>
          <p><a href="${appUrl}">Ir a TalentFlow</a></p>
        </div>
      </body>
      </html>
    `, { 
      headers: { 'Content-Type': 'text/html' },
      status: 500
    });
  }
};

serve(handler);