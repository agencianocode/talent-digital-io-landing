import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface InvitationRequest {
  emails: string[];
  academyId: string;
  academyName: string;
  customMessage?: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emails, academyId, academyName, customMessage }: InvitationRequest = await req.json()
    
    if (!emails || emails.length === 0) {
      throw new Error('No se proporcionaron emails')
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no configurada')
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Obtener datos de la academia
    const { data: academy } = await supabaseClient
      .from('companies')
      .select('name, brand_color')
      .eq('id', academyId)
      .single()

    const appUrl = Deno.env.get('APP_URL') || 'https://app.talentodigital.io'
    const inviteLink = `${appUrl}/accept-academy-invitation?academy=${academyId}&status=enrolled`
    
    console.log(`📧 Enviando ${emails.length} invitaciones para ${academy?.name || academyName}`)
    
    // Enviar emails usando Resend
    const emailPromises = emails.map(async (email: string) => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${academy?.brand_color || '#7c3aed'} 0%, ${academy?.brand_color || '#6d28d9'} 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                🎓 Invitación a ${academy?.name || academyName}
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                ¡Hola!
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                Has sido invitado a unirte a <strong>${academy?.name || academyName}</strong> en TalentoDigital.io
              </p>
              
              ${customMessage ? `
              <div style="background-color: #f9fafb; border-left: 4px solid ${academy?.brand_color || '#7c3aed'}; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #555;">
                  ${customMessage}
                </p>
              </div>
              ` : ''}
              
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                Haz clic en el botón de abajo para aceptar la invitación y comenzar tu registro:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="
                  display: inline-block;
                  padding: 16px 32px;
                  background-color: ${academy?.brand_color || '#7c3aed'};
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  font-size: 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                  Aceptar Invitación
                </a>
              </div>
              
              <!-- Alternative Link -->
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <p style="font-size: 13px; color: #666; margin-bottom: 10px;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>
                <p style="font-size: 12px; color: #999; word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
                  ${inviteLink}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © ${new Date().getFullYear()} TalentoDigital.io - Todos los derechos reservados
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'TalentoDigital <invitaciones@app.talentodigital.io>',
          to: [email],
          subject: `🎓 Invitación a ${academy?.name || academyName}`,
          html: htmlContent
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error(`❌ Error enviando email a ${email}:`, result)
        throw new Error(`Error enviando email: ${result.message || 'Unknown error'}`)
      }
      
      console.log(`✅ Email enviado a ${email}`)
      return result
    })

    const results = await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: emails.length,
        message: `${emails.length} email(s) enviado(s) exitosamente`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ Error en send-academy-invitations:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error desconocido',
        success: false
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

