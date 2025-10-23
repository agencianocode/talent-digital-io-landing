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

interface ResetPasswordEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  userEmail: string
}

export const ResetPasswordEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  userEmail,
}: ResetPasswordEmailProps) => {
  const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <Html>
      <Head />
      <Preview>Restablece tu contraseña de TalentoDigital</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🔐 TalentoDigital</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={h2}>Restablece tu contraseña</Heading>
            <Text style={text}>
              Hola,
            </Text>
            <Text style={text}>
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de TalentoDigital 
              asociada al email <strong>{userEmail}</strong>.
            </Text>
            
            <Text style={text}>
              Si fuiste tú quien solicitó el cambio, haz clic en el botón de abajo para crear una nueva contraseña:
            </Text>
            
            <Section style={buttonContainer}>
              <Button href={resetUrl} style={button}>
                Restablecer contraseña
              </Button>
            </Section>
            
            <Text style={text}>
              O copia y pega este enlace en tu navegador:
            </Text>
            <Text style={linkText}>
              {resetUrl}
            </Text>
            
            <Section style={securityBox}>
              <Text style={securityTitle}>🔒 Importante - Seguridad</Text>
              <Text style={securityItem}>• Este enlace expirará en 1 hora</Text>
              <Text style={securityItem}>• Solo puede usarse una vez</Text>
              <Text style={securityItem}>• Si no solicitaste este cambio, ignora este email</Text>
              <Text style={securityItem}>• Tu contraseña actual sigue siendo válida hasta que la cambies</Text>
            </Section>
            
            <Text style={smallText}>
              Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura. 
              Tu cuenta permanecerá segura.
            </Text>
            
            <Text style={smallText}>
              ¿Problemas para restablecer tu contraseña? Responde a este email y te ayudaremos.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 TalentoDigital - Conectamos talento con oportunidades
            </Text>
            <Text style={footerText}>
              <Link href="https://app.talentodigital.io" style={footerLink}>
                Visita nuestra plataforma
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ResetPasswordEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#dc2626',
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
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const linkText = {
  color: '#dc2626',
  fontSize: '13px',
  backgroundColor: '#fee2e2',
  padding: '12px',
  borderRadius: '6px',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
}

const securityBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #fecaca',
}

const securityTitle = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const securityItem = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 4px 0',
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
  margin: '8px 0',
}

const footerLink = {
  color: '#667eea',
  textDecoration: 'none',
}