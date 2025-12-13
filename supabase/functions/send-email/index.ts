import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmSignupEmail } from './_templates/confirm-signup.tsx'
import { MagicLinkEmail } from './_templates/magic-link.tsx'
import { ResetPasswordEmail } from './_templates/reset-password.tsx'

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

// Normalize Supabase Auth Hook secret formats
// Accepts values like: "Bearer <...>", "v1,whsec_..." or plain "whsec_..."
const normalizedHookSecret = hookSecret.trim()
  .replace(/^Bearer\s+/i, '')
  .replace(/^v\d+,/, '')

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://wyrieetebfzmgffxecpz.supabase.co'

// Use fetch for email sending instead of Resend SDK
const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TalentoDigital <auth@app.talentodigital.io>',
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
    const wh = new Webhook(normalizedHookSecret)
    
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

    // Add timeout protection (increased for React Email rendering)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email processing timeout')), 8000)
    })

    // Generate and send email with race condition for timeout
    const emailProcess = async () => {
      let html: string
      let subject: string

      console.log('Generating email template...')

      // Generate appropriate email based on type using React Email templates
      switch (email_action_type) {
        case 'signup':
          html = await renderAsync(
            React.createElement(ConfirmSignupEmail, {
              supabase_url: SUPABASE_URL,
              token,
              token_hash,
              redirect_to,
              email_action_type,
              userEmail: user.email,
            })
          )
          subject = '¡Bienvenido a TalentoDigital! Confirma tu cuenta'
          break

        case 'magiclink':
          html = await renderAsync(
            React.createElement(MagicLinkEmail, {
              supabase_url: SUPABASE_URL,
              token,
              token_hash,
              redirect_to,
              email_action_type,
              userEmail: user.email,
            })
          )
          subject = 'Accede a TalentoDigital con tu enlace mágico'
          break

        case 'recovery':
          html = await renderAsync(
            React.createElement(ResetPasswordEmail, {
              supabase_url: SUPABASE_URL,
              token,
              token_hash,
              redirect_to,
              email_action_type,
              userEmail: user.email,
            })
          )
          subject = 'Restablece tu contraseña en TalentoDigital'
          break

        default:
          // Fallback for unknown types - use magic link template
          html = await renderAsync(
            React.createElement(MagicLinkEmail, {
              supabase_url: SUPABASE_URL,
              token,
              token_hash,
              redirect_to,
              email_action_type,
              userEmail: user.email,
            })
          )
          subject = 'Acceso a TalentoDigital'
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
