import { Html, Head, Body, Container, Section, Text, Heading } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { NotificationButton } from './NotificationButton.tsx';

interface AcademyExclusiveOpportunityEmailProps {
  userName: string;
  academyName: string;
  opportunityTitle: string;
  opportunityDescription: string;
  companyName: string;
  opportunityUrl: string;
}

export const AcademyExclusiveOpportunityEmail = ({
  userName = 'Graduado',
  academyName = 'tu academia',
  opportunityTitle = 'Oportunidad laboral',
  opportunityDescription = '',
  companyName = 'una empresa',
  opportunityUrl = 'https://app.talentodigital.io',
}: AcademyExclusiveOpportunityEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Layout>
          <Container style={container}>
            <Heading style={h1}>
              🎓 Oportunidad Exclusiva para Ti
            </Heading>
            
            <Text style={text}>
              Hola <strong>{userName}</strong>,
            </Text>
            
            <Text style={text}>
              Como graduado de <strong>{academyName}</strong>, tienes acceso exclusivo a una nueva oportunidad laboral:
            </Text>
            
            <Section style={opportunityBox}>
              <Heading style={h2}>{opportunityTitle}</Heading>
              <Text style={companyText}>
                📍 <strong>{companyName}</strong>
              </Text>
              {opportunityDescription && (
                <Text style={description}>
                  {opportunityDescription}
                </Text>
              )}
            </Section>
            
            <Text style={highlight}>
              ⭐ Esta oportunidad está disponible <strong>únicamente</strong> para graduados de {academyName}.
            </Text>
            
            <NotificationButton 
              href={opportunityUrl}
              text="Ver Oportunidad Completa"
            />
            
            <Text style={text}>
              Recuerda que tienes acceso premium por tiempo limitado, lo que te da ventajas adicionales en tu búsqueda laboral.
            </Text>
            
            <Text style={footer}>
              Si no deseas recibir notificaciones de oportunidades exclusivas, puedes ajustar tus preferencias en la configuración de tu perfil.
            </Text>
            
            <Text style={footer}>
              Éxito en tu postulación,<br />
              Equipo TalentoDigital
            </Text>
          </Container>
        </Layout>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1976d2',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const companyText = {
  color: '#666',
  fontSize: '14px',
  margin: '5px 0',
};

const description = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '10px 0',
};

const opportunityBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #9333ea',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const highlight = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '16px',
  color: '#856404',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

export default AcademyExclusiveOpportunityEmail;
