import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface UnifiedEmailProps {
  userName: string;
  subject: string;
  content: {
    header_enabled?: boolean;
    header_title?: string;
    body_content?: string;
    button_enabled?: boolean;
    button_text?: string;
    button_link?: string;
    secondary_enabled?: boolean;
    secondary_content?: string;
    footer_content?: string;
  };
  globalStyles: {
    buttonColor: string;
    buttonTextColor: string;
    headerColor1: string;
    headerColor2: string;
    headerTextColor: string;
  };
}

export const UnifiedEmail = ({
  userName,
  subject,
  content,
  globalStyles,
}: UnifiedEmailProps) => {
  const {
    header_enabled = true,
    header_title = '🚀 TalentoDigital',
    body_content = '',
    button_enabled = false,
    button_text = 'Ver más',
    button_link = 'https://app.talentodigital.io',
    secondary_enabled = false,
    secondary_content = '',
    footer_content = '',
  } = content;

  const {
    buttonColor = '#667eea',
    buttonTextColor = '#ffffff',
    headerColor1 = '#667eea',
    headerColor2 = '#764ba2',
    headerTextColor = 'white',
  } = globalStyles;

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          {header_enabled && (
            <Section
              style={{
                ...headerStyle,
                background: `linear-gradient(135deg, ${headerColor1}, ${headerColor2})`,
              }}
            >
              <Heading
                style={{
                  ...headerText,
                  color: headerTextColor === 'black' ? '#000000' : '#ffffff',
                }}
              >
                {header_title}
              </Heading>
            </Section>
          )}

          {/* Main content */}
          <Section style={contentSection}>
            {/* Body content - rendered as HTML */}
            {body_content && (
              <div
                style={bodyStyle}
                dangerouslySetInnerHTML={{ __html: processHtml(body_content) }}
              />
            )}

            {/* CTA Button */}
            {button_enabled && button_text && button_link && (
              <Section style={buttonContainer}>
                <Link
                  href={button_link}
                  style={{
                    ...buttonStyle,
                    backgroundColor: buttonColor,
                    color: buttonTextColor,
                  }}
                >
                  {button_text}
                </Link>
              </Section>
            )}

            {/* Secondary content */}
            {secondary_enabled && secondary_content && (
              <Section style={secondarySection}>
                <div
                  style={secondaryStyle}
                  dangerouslySetInnerHTML={{ __html: processHtml(secondary_content) }}
                />
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            {footer_content ? (
              <div
                style={footerStyle}
                dangerouslySetInnerHTML={{ __html: processFooterHtml(footer_content) }}
              />
            ) : (
              <Text style={footerText}>
                © {new Date().getFullYear()} TalentoDigital. Todos los derechos reservados.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Helper to process HTML content for email compatibility
const processHtml = (html: string): string => {
  if (!html) return '';
  
  // Add inline styles for common elements
  let processed = html
    // Style paragraphs
    .replace(/<p>/g, '<p style="margin: 0 0 16px 0; line-height: 1.6; color: #333333;">')
    // Style links
    .replace(/<a /g, '<a style="color: #667eea; text-decoration: underline;" ')
    // Style strong/bold
    .replace(/<strong>/g, '<strong style="font-weight: 600; color: #1a1a1a;">')
    // Style emphasis
    .replace(/<em>/g, '<em style="font-style: italic;">');
  
  return processed;
};

// Helper to process footer HTML with smaller text
const processFooterHtml = (html: string): string => {
  if (!html) return '';
  
  let processed = html
    .replace(/<p>/g, '<p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.4; color: #666666;">')
    .replace(/<a /g, '<a style="color: #667eea; text-decoration: underline; font-size: 12px;" ');
  
  return processed;
};

export default UnifiedEmail;

// Styles
const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const headerStyle = {
  padding: '32px 40px',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const headerText = {
  margin: '0',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '32px 40px',
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const bodyStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#333333',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '16px',
};

const buttonStyle = {
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const secondarySection = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e5e5',
};

const secondaryStyle = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666666',
};

const footerSection = {
  marginTop: '24px',
  textAlign: 'center' as const,
};

const footerStyle = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#666666',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#666666',
  margin: '0',
};
