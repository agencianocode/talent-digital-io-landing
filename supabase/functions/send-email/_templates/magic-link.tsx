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

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  userEmail: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  userEmail,
}: MagicLinkEmailProps) => {
  const loginUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <Html>
      <Head />
      <Preview>Accede a TalentoDigital con tu enlace de acceso</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🚀 TalentoDigital</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={h2}>¡Accede a tu cuenta!</Heading>
            <Text style={text}>
              Hola,
            </Text>
            <Text style={text}>
              Hemos recibido una solicitud para acceder a tu cuenta de TalentoDigital usando tu email <strong>{userEmail}</strong>.
            </Text>
            
            <Section style={buttonContainer}>
              <Button href={loginUrl} style={button}>
                Acceder a TalentoDigital
              </Button>
            </Section>
            
            <Text style={text}>
              O copia y pega este enlace en tu navegador:
            </Text>
            <Text style={linkText}>
              {loginUrl}
            </Text>
            
            <Text style={smallText}>
              Si no solicitaste este acceso, puedes ignorar este email de forma segura.
            </Text>
            
            <Text style={smallText}>
              Este enlace expirará en 1 hora por seguridad.
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

export default MagicLinkEmail

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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}

const content = {
  padding: '32px 24px',
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
  backgroundColor: '#667eea',
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
  color: '#667eea',
  fontSize: '13px',
  backgroundColor: '#f1f5f9',
  padding: '12px',
  borderRadius: '6px',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
  margin: '8px 0',
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