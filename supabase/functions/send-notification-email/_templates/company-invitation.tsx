import { Section, Text, Button, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Footer } from './Footer.tsx';

interface CompanyInvitationProps {
  email?: string;
  role: string;
  invitedBy: string;
  acceptUrl: string;
  declineUrl: string;
  // Editable content from database
  greeting?: string;
  intro?: string;
  admin_title?: string;
  admin_intro?: string;
  admin_capabilities?: string[];
  member_title?: string;
  member_intro?: string;
  member_limitations?: string[];
  member_capabilities?: string[];
  button_accept_text?: string;
  button_decline_text?: string;
  help_title?: string;
  help_text?: string;
  footer_text?: string;
}

export const CompanyInvitation = ({
  email,
  role,
  invitedBy,
  acceptUrl,
  declineUrl,
  greeting = '¡Has sido invitado!',
  intro = '{{invited_by}} te ha invitado a unirte a su empresa en TalentoDigital con el rol de {{role}}.',
  admin_title = '¿Qué puedes hacer como Administrador?',
  admin_intro = 'Tendrás acceso completo, incluyendo:',
  admin_capabilities = [
    'Crear y gestionar oportunidades de trabajo',
    'Revisar y gestionar aplicaciones',
    'Remover miembros del equipo',
    'Editar permisos de otros usuarios',
    'Gestionar configuraciones de la empresa',
    'Acceder a reportes y análisis',
  ],
  member_title = '¿Qué puedes hacer como Miembro?',
  member_intro = 'Tendrás acceso para ver y gestionar aplicaciones, pero no podrás:',
  member_limitations = [
    'Remover miembros del equipo',
    'Editar permisos de otros usuarios',
    'Crear nuevas oportunidades de trabajo',
  ],
  member_capabilities = [
    'Ver oportunidades',
    'Revisar aplicaciones',
    'Acceder a reportes',
  ],
  button_accept_text = 'Aceptar Invitación',
  button_decline_text = 'Rechazar',
  help_title = '¿Necesitas ayuda?',
  help_text = 'Si tienes problemas para aceptar la invitación o tienes preguntas sobre tu rol, contacta a {{invited_by}} directamente.',
  footer_text = 'Esta invitación fue enviada desde TalentoDigital. Si no esperabas esta invitación, puedes ignorar este email.',
}: CompanyInvitationProps) => {
  const isAdmin = role === 'admin';
  const roleDisplay = isAdmin ? 'Administrador' : 'Miembro';
  
  // Replace placeholders
  const processedIntro = intro
    .replace('{{invited_by}}', invitedBy)
    .replace('{{role}}', roleDisplay);
  const processedHelpText = help_text.replace('{{invited_by}}', invitedBy);
  const capabilitiesTitle = isAdmin ? admin_title : member_title;
  const capabilitiesIntro = isAdmin ? admin_intro : member_intro;
  const capabilities = isAdmin ? admin_capabilities : member_limitations;

  return (
    <Layout preview={`Invitación para unirte como ${roleDisplay}`}>
      {/* Custom Header with gradient */}
      <Section style={headerSection}>
        <Text style={headerTitle}>{greeting}</Text>
        <Text style={headerSubtitle}>TalentoDigital - Plataforma de Gestión de Talento</Text>
      </Section>

      <Section style={content}>
        <Text style={roleHeading}>
          Invitación para unirte como {roleDisplay.toUpperCase()}
        </Text>
        
        <Text style={paragraph}>Hola,</Text>
        <Text style={paragraph}>
          <strong>{invitedBy}</strong> {processedIntro.replace(`${invitedBy} `, '')}
        </Text>
        
        {/* Capabilities Box */}
        <div style={capabilitiesBox}>
          <Text style={capabilitiesHeading}>{capabilitiesTitle}</Text>
          <Text style={capabilitiesText}>{capabilitiesIntro}</Text>
          <ul style={list}>
            {capabilities.map((item, index) => (
              <li key={index} style={listItem}>{item}</li>
            ))}
          </ul>
          {!isAdmin && member_capabilities && member_capabilities.length > 0 && (
            <>
              <Text style={{ ...capabilitiesText, marginTop: '10px' }}>
                <strong>Sí podrás:</strong> {member_capabilities.join(', ')}.
              </Text>
            </>
          )}
        </div>

        {/* Buttons */}
        <div style={buttonsContainer}>
          <Button style={acceptButton} href={acceptUrl}>
            {button_accept_text}
          </Button>
          <Button style={declineButton} href={declineUrl}>
            {button_decline_text}
          </Button>
        </div>

        <Hr style={divider} />

        {/* Help Section */}
        <Text style={helpTitleStyle}>{help_title}</Text>
        <Text style={helpTextStyle}>{processedHelpText}</Text>
        <Text style={footerNote}>{footer_text}</Text>
      </Section>

      <Footer />
    </Layout>
  );
};

const headerSection = {
  background: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
};

const headerTitle = {
  color: 'white',
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
};

const headerSubtitle = {
  color: 'rgba(255,255,255,0.9)',
  margin: '10px 0 0 0',
  fontSize: '16px',
};

const content = {
  padding: '40px 30px',
  backgroundColor: 'white',
};

const roleHeading = {
  color: '#333',
  marginTop: '0',
  marginBottom: '20px',
  fontSize: '20px',
  fontWeight: 'bold',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555',
  margin: '0 0 16px 0',
};

const capabilitiesBox = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  borderLeft: '4px solid #8B5CF6',
};

const capabilitiesHeading = {
  marginTop: '0',
  marginBottom: '12px',
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
};

const capabilitiesText = {
  margin: '0',
  color: '#555',
  fontSize: '14px',
};

const list = {
  margin: '10px 0 0 0',
  paddingLeft: '20px',
  color: '#555',
};

const listItem = {
  marginBottom: '4px',
  fontSize: '14px',
};

const buttonsContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
};

const acceptButton = {
  display: 'inline-block',
  backgroundColor: '#8B5CF6',
  color: 'white',
  padding: '15px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  marginRight: '10px',
};

const declineButton = {
  display: 'inline-block',
  backgroundColor: '#6c757d',
  color: 'white',
  padding: '15px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
};

const divider = {
  marginTop: '40px',
  borderTop: '1px solid #e9ecef',
};

const helpTitleStyle = {
  marginTop: '20px',
  marginBottom: '8px',
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#6c757d',
};

const helpTextStyle = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: '#6c757d',
};

const footerNote = {
  marginTop: '20px',
  fontSize: '12px',
  color: '#999',
};

export default CompanyInvitation;
