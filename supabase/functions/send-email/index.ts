import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { DynamicEmail } from './_templates/dynamic-email.tsx'

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
const normalizedHookSecret = hookSecret.trim()
  .replace(/^Bearer\s+/i, '')
  .replace(/^v\d+,/, '')

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://wyrieetebfzmgffxecpz.supabase.co'
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Map email_action_type to template IDs in database
const getTemplateId = (emailActionType: string): string => {
  switch (emailActionType) {
    case 'signup':
      return 'confirm-signup'
    case 'magiclink':
      return 'magic-link'
    case 'recovery':
      return 'reset-password'
    default:
      return 'magic-link'
  }
}

// Default templates as fallback
const getDefaultTemplate = (emailActionType: string) => {
  switch (emailActionType) {
    case 'signup':
      return {
        subject: '¡Bienvenido a TalentoDigital! Confirma tu cuenta',
        content: {
          title: '🚀 TalentoDigital',
          heading: '¡Bienvenido a TalentoDigital!',
          preview: 'Confirma tu cuenta en TalentoDigital',
          greeting: 'Hola,',
          intro: 'Gracias por registrarte en TalentoDigital. Solo falta un paso para activar tu cuenta.',
          button_text: 'Confirmar mi cuenta',
          link_instruction: 'O copia y pega este enlace en tu navegador:',
          security_notice: 'Si no creaste esta cuenta, puedes ignorar este email.',
          expiry_notice: 'Este enlace expirará en 24 horas.',
          footer_text: '© 2025 TalentoDigital - Conectamos talento con oportunidades',
        }
      }
    case 'magiclink':
      return {
        subject: 'Accede a TalentoDigital con tu enlace mágico',
        content: {
          title: '🚀 TalentoDigital',
          heading: '¡Accede a tu cuenta!',
          preview: 'Accede a TalentoDigital con tu enlace de acceso',
          greeting: 'Hola,',
          intro: 'Hemos recibido una solicitud para acceder a tu cuenta de TalentoDigital usando tu email',
          button_text: 'Acceder a TalentoDigital',
          link_instruction: 'O copia y pega este enlace en tu navegador:',
          security_notice: 'Si no solicitaste este acceso, puedes ignorar este email de forma segura.',
          expiry_notice: 'Este enlace expirará en 1 hora por seguridad.',
          footer_text: '© 2025 TalentoDigital - Conectamos talento con oportunidades',
          footer_link_text: 'Visita nuestra plataforma',
        }
      }
    case 'recovery':
      return {
        subject: 'Restablece tu contraseña en TalentoDigital',
        content: {
          title: '🚀 TalentoDigital',
          heading: 'Restablecer contraseña',
          preview: 'Restablece tu contraseña en TalentoDigital',
          greeting: 'Hola,',
          intro: 'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TalentoDigital.',
          button_text: 'Restablecer contraseña',
          link_instruction: 'O copia y pega este enlace en tu navegador:',
          security_notice: 'Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.',
          expiry_notice: 'Este enlace expirará en 1 hora por seguridad.',
          footer_text: '© 2025 TalentoDigital - Conectamos talento con oportunidades',
        }
      }
    default:
      return {
        subject: 'TalentoDigital',
        content: {
          title: '🚀 TalentoDigital',
          heading: 'TalentoDigital',
          preview: 'TalentoDigital',
          greeting: 'Hola,',
          intro: '',
          button_text: 'Continuar',
          footer_text: '© 2025 TalentoDigital',
        }
      }
  }
}

// Use fetch for email sending
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

    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email processing timeout')), 10000)
    })

    // Generate and send email
    const emailProcess = async () => {
      let subject: string
      let emailContent: Record<string, any>
      
      // Try to fetch template from database
      const templateId = getTemplateId(email_action_type)
      console.log(`Looking for template: ${templateId}`)
      
      if (SUPABASE_SERVICE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
          
          const { data: template, error } = await supabase
            .from('email_templates')
            .select('subject, content')
            .eq('id', templateId)
            .eq('is_active', true)
            .single()
          
          if (error) {
            console.log(`Template fetch error: ${error.message}, using default`)
          }
          
          if (template) {
            console.log(`Using database template: ${templateId}`)
            subject = template.subject
            emailContent = template.content as Record<string, any>
          } else {
            console.log(`Template ${templateId} not found, using default`)
            const defaultTemplate = getDefaultTemplate(email_action_type)
            subject = defaultTemplate.subject
            emailContent = defaultTemplate.content
          }
        } catch (dbError) {
          console.error('Database error, using default template:', dbError)
          const defaultTemplate = getDefaultTemplate(email_action_type)
          subject = defaultTemplate.subject
          emailContent = defaultTemplate.content
        }
      } else {
        console.log('No service key, using default template')
        const defaultTemplate = getDefaultTemplate(email_action_type)
        subject = defaultTemplate.subject
        emailContent = defaultTemplate.content
      }

      // Build the action URL
      const actionUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
      
      console.log('Generating email template...')

      const html = await renderAsync(
        React.createElement(DynamicEmail, {
          actionUrl,
          userEmail: user.email,
          content: emailContent,
        })
      )

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
