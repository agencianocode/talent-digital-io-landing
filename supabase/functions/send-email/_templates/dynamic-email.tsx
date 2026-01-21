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

interface DynamicEmailProps {
  actionUrl: string
  userEmail: string
  content: {
    title?: string
    heading?: string
    preview?: string
    greeting?: string
    intro?: string
    button_text?: string
    link_instruction?: string
    security_notice?: string
    expiry_notice?: string
    footer_text?: string
    footer_link_text?: string
    // For welcome/signup emails
    benefits_title?: string
    benefits?: string[]
    steps_title?: string
    steps?: Array<{ icon?: string; title?: string; description?: string }>
    help_text?: string
    signature?: string
  }
}

export const DynamicEmail = ({
  actionUrl,
  userEmail,
  content,
}: DynamicEmailProps) => {
  const {
    title = '🚀 TalentoDigital',
    heading = 'TalentoDigital',
    preview = 'TalentoDigital',
    greeting = 'Hola,',
    intro = '',
    button_text = 'Continuar',
    link_instruction = 'O copia y pega este enlace en tu navegador:',
    security_notice = '',
    expiry_notice = '',
    footer_text = '© 2025 TalentoDigital',
    footer_link_text = 'Visita nuestra plataforma',
    benefits_title,
    benefits,
    steps_title,
    steps,
    help_text,
    signature,
  } = content

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>{title}</Heading>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={h2}>{heading}</Heading>
            <Text style={text}>{greeting}</Text>
            
            {intro && (
              <Text style={text}>
                {intro} {userEmail && <strong>{userEmail}</strong>}
              </Text>
            )}
            
            {/* Benefits section for signup emails */}
            {benefits_title && benefits && benefits.length > 0 && (
              <>
                <Text style={text}><strong>{benefits_title}</strong></Text>
                {benefits.map((benefit, index) => (
                  <Text key={index} style={benefitItem}>✓ {benefit}</Text>
                ))}
              </>
            )}
            
            {/* Steps section for welcome emails */}
            {steps_title && steps && steps.length > 0 && (
              <>
                <Text style={{ ...text, fontWeight: 'bold', marginTop: '24px' }}>{steps_title}</Text>
                {steps.map((step, index) => (
                  <Section key={index} style={stepContainer}>
                    <Text style={stepIcon}>{step.icon || '•'}</Text>
                    <Text style={stepTitle}>{step.title}</Text>
                    <Text style={stepDescription}>{step.description}</Text>
                  </Section>
                ))}
              </>
            )}
            
            <Section style={buttonContainer}>
              <Button href={actionUrl} style={button}>
                {button_text}
              </Button>
            </Section>
            
            {link_instruction && (
              <>
                <Text style={text}>{link_instruction}</Text>
                <Text style={linkText}>{actionUrl}</Text>
              </>
            )}
            
            {security_notice && (
              <Text style={smallText}>{security_notice}</Text>
            )}
            
            {expiry_notice && (
              <Text style={smallText}>{expiry_notice}</Text>
            )}
            
            {help_text && (
              <Text style={smallText}>{help_text}</Text>
            )}
            
            {signature && (
              <Text style={{ ...text, whiteSpace: 'pre-line', marginTop: '24px' }}>{signature}</Text>
            )}
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>{footer_text}</Text>
            {footer_link_text && (
              <Text style={footerText}>
                <Link href="https://app.talentodigital.io" style={footerLink}>
                  {footer_link_text}
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default DynamicEmail

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

const contentSection = {
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

const benefitItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '4px 0',
  paddingLeft: '8px',
}

const stepContainer = {
  marginBottom: '16px',
  paddingLeft: '8px',
}

const stepIcon = {
  color: '#667eea',
  fontSize: '18px',
  margin: '0',
  display: 'inline',
}

const stepTitle = {
  color: '#1f2937',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '4px 0',
}

const stepDescription = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
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
