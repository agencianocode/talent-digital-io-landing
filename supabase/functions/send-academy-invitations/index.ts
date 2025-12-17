import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface InvitationRequest {
  emails: string[];
  academyId: string;
  academyName: string;
  customMessage?: string;
}

interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Process emails in batches to avoid rate limiting
async function sendEmailBatch(
  emails: string[],
  academy: { name: string; brand_color: string | null },
  academyName: string,
  customMessage: string | undefined,
  inviteLink: string
): Promise<EmailResult[]> {
  const results: EmailResult[] = []
  const BATCH_SIZE = 10
  const DELAY_BETWEEN_BATCHES = 1000 // 1 second delay between batches

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(emails.length / BATCH_SIZE)
    
    console.log(`📧 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`)

    // Process batch with Promise.allSettled to handle partial failures
    const batchPromises = batch.map(async (email): Promise<EmailResult> => {
      try {
        const htmlContent = generateEmailHtml(academy, academyName, customMessage, inviteLink)

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
          return { email, success: false, error: result.message || 'Error desconocido' }
        }

        console.log(`✅ Email enviado a ${email}`)
        return { email, success: true }
      } catch (error: any) {
        console.error(`❌ Exception enviando email a ${email}:`, error)
        return { email, success: false, error: error.message || 'Error desconocido' }
      }
    })

    const batchResults = await Promise.allSettled(batchPromises)
    
    // Process settled results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        // This shouldn't happen since we catch errors inside, but handle it anyway
        results.push({ email: 'unknown', success: false, error: result.reason?.message || 'Unknown error' })
      }
    }

    // Add delay between batches (except for the last batch)
    if (i + BATCH_SIZE < emails.length) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`)
      await delay(DELAY_BETWEEN_BATCHES)
    }
  }

  return results
}

function generateEmailHtml(
  academy: { name: string; brand_color: string | null },
  academyName: string,
  customMessage: string | undefined,
  inviteLink: string
): string {
  return `
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validEmails = emails.filter(email => emailRegex.test(email.trim()))
    const invalidEmails = emails.filter(email => !emailRegex.test(email.trim()))

    if (invalidEmails.length > 0) {
      console.warn(`⚠️ ${invalidEmails.length} emails con formato inválido:`, invalidEmails.slice(0, 5))
    }

    if (validEmails.length === 0) {
      throw new Error('No se encontraron emails con formato válido')
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
    
    console.log(`📧 Procesando ${validEmails.length} invitaciones para ${academy?.name || academyName}`)
    
    // Send emails in batches
    const results = await sendEmailBatch(
      validEmails,
      academy || { name: academyName, brand_color: null },
      academyName,
      customMessage,
      inviteLink
    )

    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length
    const failedEmails = results.filter(r => !r.success).map(r => r.email)

    console.log(`📊 Resultados: ${successCount} enviados, ${failedCount} fallidos`)

    if (failedCount > 0) {
      console.log(`❌ Emails fallidos:`, failedEmails.slice(0, 10))
    }

    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        total: validEmails.length,
        sent: successCount,
        failed: failedCount,
        failedEmails: failedEmails.slice(0, 20), // Limit to first 20 failed emails
        invalidEmails: invalidEmails.slice(0, 20), // Emails with invalid format
        message: successCount === validEmails.length 
          ? `${successCount} email(s) enviado(s) exitosamente`
          : `${successCount}/${validEmails.length} email(s) enviado(s). ${failedCount} fallaron.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
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
