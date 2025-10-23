import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

// Initialize with better error handling
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')

if (!resendApiKey) {
  console.error('RESEND_API_KEY is not configured')
  throw new Error('RESEND_API_KEY is not configured')
}

if (!hookSecret) {
  console.error('SEND_EMAIL_HOOK_SECRET is not configured')
  throw new Error('SEND_EMAIL_HOOK_SECRET is not configured')
}

// Use fetch for email sending instead of Resend SDK
const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TalentoDigital Auth <auth@app.talentodigital.io>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email sending failed: ${error}`);
  }

  return response.json();
};

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Email function started')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Processing email request...')
    
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    
    console.log('Verifying webhook payload...')
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log(`Processing ${email_action_type} email for ${user.email}`)

    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email processing timeout')), 3000)
    })

    // Generate and send email with race condition for timeout
    const emailProcess = async () => {
      let html: string
      let subject: string

      console.log('Generating email template...')

      // Generate appropriate email based on type
      switch (email_action_type) {
        case 'signup':
          html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Confirma tu cuenta - TalentFlow</title>
              <meta charset="utf-8">
            </head>
            <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; text-align: center;">
                <h1 style="color: #333;">¡Bienvenido a TalentFlow!</h1>
                <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
                <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Confirmar Cuenta
                </a>
                <p style="color: #666; font-size: 14px;">Si no solicitaste esta cuenta, puedes ignorar este email.</p>
              </div>
            </body>
            </html>
          `
          subject = '¡Bienvenido a TalentFlow! Confirma tu cuenta'
          break

        case 'magiclink':
          html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Enlace de acceso - TalentFlow</title>
              <meta charset="utf-8">
            </head>
            <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; text-align: center;">
                <h1 style="color: #333;">Accede a TalentFlow</h1>
                <p>Haz clic en el siguiente enlace para acceder a tu cuenta:</p>
                <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Acceder
                </a>
                <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
              </div>
            </body>
            </html>
          `
          subject = 'Accede a TalentFlow con tu enlace mágico'
          break

        case 'recovery':
          html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Restablece tu contraseña - TalentFlow</title>
              <meta charset="utf-8">
            </head>
            <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; text-align: center;">
                <h1 style="color: #333;">Restablece tu contraseña</h1>
                <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
                   style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Restablecer Contraseña
                </a>
                <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este email.</p>
              </div>
            </body>
            </html>
          `
          subject = 'Restablece tu contraseña en TalentFlow'
          break

        default:
          html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Acceso a TalentFlow</title>
              <meta charset="utf-8">
            </head>
            <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; text-align: center;">
                <h1 style="color: #333;">Acceso a TalentFlow</h1>
                <p>Haz clic en el siguiente enlace:</p>
                <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Continuar
                </a>
              </div>
            </body>
            </html>
          `
          subject = 'Acceso a TalentFlow'
      }

      console.log('Sending email via Resend...')

      await sendEmail(user.email, subject, html);

      console.log(`${email_action_type} email sent successfully to ${user.email}`)
      return { success: true }
    }

    // Race between email process and timeout
    await Promise.race([emailProcess(), timeoutPromise])

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN_ERROR'
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

serve(handler);