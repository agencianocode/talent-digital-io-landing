import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmSignupEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  userEmail: string
}

export const ConfirmSignupEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  userEmail,
}: ConfirmSignupEmailProps) => {
  const confirmUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a TalentFlow! Confirma tu cuenta para empezar</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🚀 TalentFlow</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={h2}>¡Bienvenido a TalentFlow!</Heading>
            <Text style={text}>
              ¡Hola y bienvenido a bordo!
            </Text>
            <Text style={text}>
              Gracias por unirte a TalentFlow con el email <strong>{userEmail}</strong>. 
              Estás a un paso de descubrir increíbles oportunidades de talento.
            </Text>
            
            <Text style={text}>
              Para activar tu cuenta y comenzar, simplemente confirma tu email haciendo clic en el botón de abajo:
            </Text>
            
            <Section style={buttonContainer}>
              <Button href={confirmUrl} style={button}>
                Confirmar mi cuenta
              </Button>
            </Section>
            
            <Text style={text}>
              O copia y pega este enlace en tu navegador:
            </Text>
            <Text style={linkText}>
              {confirmUrl}
            </Text>
            
            <Section style={welcomeBox}>
              <Text style={welcomeTitle}>¿Qué puedes hacer en TalentFlow?</Text>
              <Text style={welcomeItem}>✨ Descubrir oportunidades perfectas para tu perfil</Text>
              <Text style={welcomeItem}>🎯 Conectar con empresas que buscan tu talento</Text>
              <Text style={welcomeItem}>🚀 Hacer crecer tu carrera profesional</Text>
              <Text style={welcomeItem}>💼 Gestionar todas tus aplicaciones en un solo lugar</Text>
            </Section>
            
            <Text style={smallText}>
              Si no creaste esta cuenta, puedes ignorar este email de forma segura.
            </Text>
            
            <Text style={smallText}>
              Este enlace expirará en 24 horas por seguridad.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 TalentFlow - Conectamos talento con oportunidades
            </Text>
            <Text style={footerText}>
              ¿Necesitas ayuda? Responde a este email y te ayudaremos.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ConfirmSignupEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#0f172a',
}

const content = {
  padding: '24px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const linkText = {
  color: '#3b82f6',
  fontSize: '14px',
  backgroundColor: '#f1f5f9',
  padding: '12px',
  borderRadius: '4px',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
}

const welcomeBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
}

const welcomeTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
}

const welcomeItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 8px 0',
  paddingLeft: '8px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 0 0',
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 8px 0',
}