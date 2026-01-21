import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { UnifiedEmail } from './_templates/unified-email.tsx'

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

// Default templates as fallback (UnifiedContent format)
const getDefaultTemplate = (emailActionType: string) => {
  switch (emailActionType) {
    case 'signup':
      return {
        subject: '¡Bienvenido a TalentoDigital! Confirma tu cuenta',
        content: {
          header_enabled: true,
          header_title: '🚀 ¡Bienvenido a TalentoDigital!',
          body_content: '<p>Hola,</p><p>¡Gracias por registrarte en TalentoDigital!</p><p>Solo falta un paso para activar tu cuenta y comenzar a explorar las mejores oportunidades.</p>',
          button_enabled: true,
          button_text: 'Confirmar mi cuenta',
          button_link: '{{action_url}}',
          secondary_enabled: true,
          secondary_content: '<p>Si no creaste esta cuenta, puedes ignorar este email.</p><p>Este enlace expirará en 24 horas.</p>',
          footer_content: '<p>© 2025 TalentoDigital - Conectamos talento con oportunidades</p>',
        }
      }
    case 'magiclink':
      return {
        subject: 'Accede a TalentoDigital con tu enlace mágico',
        content: {
          header_enabled: true,
          header_title: '🚀 TalentoDigital',
          body_content: '<p>Hola,</p><p>Hemos recibido una solicitud para acceder a tu cuenta de TalentoDigital.</p><p>Haz clic en el botón de abajo para iniciar sesión de forma segura.</p>',
          button_enabled: true,
          button_text: 'Acceder a TalentoDigital',
          button_link: '{{action_url}}',
          secondary_enabled: true,
          secondary_content: '<p>Si no solicitaste este acceso, puedes ignorar este email de forma segura.</p><p>Este enlace expirará en 1 hora por seguridad.</p>',
          footer_content: '<p>© 2025 TalentoDigital - Conectamos talento con oportunidades</p>',
        }
      }
    case 'recovery':
      return {
        subject: 'Restablece tu contraseña en TalentoDigital',
        content: {
          header_enabled: true,
          header_title: '🔐 Restablecer Contraseña',
          body_content: '<p>Hola,</p><p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TalentoDigital.</p><p>Haz clic en el botón de abajo para crear una nueva contraseña.</p>',
          button_enabled: true,
          button_text: 'Restablecer contraseña',
          button_link: '{{action_url}}',
          secondary_enabled: true,
          secondary_content: '<p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p><p>Este enlace expirará en 1 hora por seguridad.</p>',
          footer_content: '<p>© 2025 TalentoDigital - Conectamos talento con oportunidades</p>',
        }
      }
    default:
      return {
        subject: 'TalentoDigital',
        content: {
          header_enabled: true,
          header_title: '🚀 TalentoDigital',
          body_content: '<p>Hola,</p><p>Gracias por usar TalentoDigital.</p>',
          button_enabled: true,
          button_text: 'Continuar',
          button_link: '{{action_url}}',
          secondary_enabled: false,
          secondary_content: '',
          footer_content: '<p>© 2025 TalentoDigital</p>',
        }
      }
  }
}

// Substitute variables in content
const substituteVariables = (text: string, variables: Record<string, string>): string => {
  if (!text) return '';
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    result = result.replace(regex, value || '');
  });
  return result;
};

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
  console.log('📧 Email function started')
  
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
      console.log(`📋 Looking for template: ${templateId}`)
      
      // Load global styles from admin_customization
      let globalStyles = {
        buttonColor: '#667eea',
        buttonTextColor: '#ffffff',
        headerColor1: '#667eea',
        headerColor2: '#764ba2',
        headerTextColor: 'white',
      };
      
      if (SUPABASE_SERVICE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
          
          // Load global styles
          const { data: customization } = await supabase
            .from('admin_customization')
            .select('email_header_color1, email_header_color2, email_button_color, email_button_text_color, email_header_text_color')
            .single();

          if (customization) {
            globalStyles = {
              buttonColor: customization.email_button_color || globalStyles.buttonColor,
              buttonTextColor: customization.email_button_text_color || globalStyles.buttonTextColor,
              headerColor1: customization.email_header_color1 || globalStyles.headerColor1,
              headerColor2: customization.email_header_color2 || globalStyles.headerColor2,
              headerTextColor: customization.email_header_text_color || globalStyles.headerTextColor,
            };
            console.log('🎨 Loaded global styles from admin_customization');
          }
          
          const { data: template, error } = await supabase
            .from('email_templates')
            .select('subject, content')
            .eq('id', templateId)
            .eq('is_active', true)
            .single()
          
          if (error) {
            console.log(`⚠️ Template fetch error: ${error.message}, using default`)
          }
          
          if (template) {
            console.log(`✅ Using database template: ${templateId}`)
            subject = template.subject
            emailContent = template.content as Record<string, any>
          } else {
            console.log(`📝 Template ${templateId} not found, using default`)
            const defaultTemplate = getDefaultTemplate(email_action_type)
            subject = defaultTemplate.subject
            emailContent = defaultTemplate.content
          }
        } catch (dbError) {
          console.error('⚠️ Database error, using default template:', dbError)
          const defaultTemplate = getDefaultTemplate(email_action_type)
          subject = defaultTemplate.subject
          emailContent = defaultTemplate.content
        }
      } else {
        console.log('⚠️ No service key, using default template')
        const defaultTemplate = getDefaultTemplate(email_action_type)
        subject = defaultTemplate.subject
        emailContent = defaultTemplate.content
      }

      // Build the action URL
      const actionUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
      
      // Variables for substitution
      const variables: Record<string, string> = {
        action_url: actionUrl,
        user_email: user.email,
      };
      
      // Process content with variable substitution
      const processedContent = {
        header_enabled: emailContent.header_enabled ?? true,
        header_title: substituteVariables(emailContent.header_title || '🚀 TalentoDigital', variables),
        body_content: substituteVariables(emailContent.body_content || '', variables),
        button_enabled: emailContent.button_enabled ?? true,
        button_text: substituteVariables(emailContent.button_text || 'Continuar', variables),
        button_link: substituteVariables(emailContent.button_link || actionUrl, variables),
        secondary_enabled: emailContent.secondary_enabled ?? false,
        secondary_content: substituteVariables(emailContent.secondary_content || '', variables),
        footer_content: substituteVariables(emailContent.footer_content || '', variables),
      };
      
      console.log('📄 Generating email template...')

      // ALL auth emails now use UnifiedEmail
      const html = await renderAsync(
        React.createElement(UnifiedEmail, {
          userName: user.email,
          subject,
          content: processedContent,
          globalStyles,
        })
      )

      console.log('📤 Sending email via Resend...')

      await sendEmail(user.email, subject, html);

      console.log(`✅ ${email_action_type} email sent successfully to ${user.email}`)
      return { success: true }
    }

    // Race between email process and timeout
    await Promise.race([emailProcess(), timeoutPromise])

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('❌ Error in send-email function:', error)
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
