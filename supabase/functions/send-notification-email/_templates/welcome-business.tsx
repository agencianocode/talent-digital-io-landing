import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { Section, Text } from 'npm:@react-email/components@0.0.22';

interface WelcomeBusinessProps {
  userName: string;
  // Dynamic content from database
  greeting?: string;
  intro?: string;
  steps_title?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
  button_text?: string;
  closing?: string;
  signature?: string;
}

export const WelcomeBusiness = ({ 
  userName,
  greeting = '¡Bienvenido a TalentoDigital! 🚀',
  intro = 'Estamos encantados de que tu empresa se una a nuestra plataforma para encontrar el mejor talento digital.',
  steps_title = '¿Qué puedes hacer ahora?',
  step1 = 'Completa el perfil de tu empresa: Añade información, logo y cultura empresarial',
  step2 = 'Publica oportunidades: Crea ofertas de trabajo y recibe aplicaciones de talento calificado',
  step3 = 'Busca talento: Explora perfiles de profesionales y contacta directamente',
  step4 = 'Gestiona tu equipo: Invita a miembros de tu empresa para colaborar en la contratación',
  step5 = 'Accede al marketplace: Encuentra servicios especializados para tus proyectos',
  button_text = 'Iniciar sesión y completar perfil',
  closing = 'Nuestro equipo está disponible para ayudarte a sacar el máximo provecho de la plataforma.',
  signature = '¡Éxito en tu búsqueda de talento!\nEl equipo de TalentoDigital',
}: WelcomeBusinessProps) => (
  <Layout preview="¡Bienvenido a TalentoDigital!">
    <Header userName={userName} />
    <Section style={contentSection}>
      <Text style={text}>{greeting}</Text>
      <Text style={text}>{intro}</Text>
      <Text style={textBold}>{steps_title}</Text>
      <Text style={listItem}>✓ <strong>{step1.split(':')[0]}:</strong>{step1.includes(':') ? step1.split(':').slice(1).join(':') : ''}</Text>
      <Text style={listItem}>✓ <strong>{step2.split(':')[0]}:</strong>{step2.includes(':') ? step2.split(':').slice(1).join(':') : ''}</Text>
      <Text style={listItem}>✓ <strong>{step3.split(':')[0]}:</strong>{step3.includes(':') ? step3.split(':').slice(1).join(':') : ''}</Text>
      <Text style={listItem}>✓ <strong>{step4.split(':')[0]}:</strong>{step4.includes(':') ? step4.split(':').slice(1).join(':') : ''}</Text>
      <Text style={listItem}>✓ <strong>{step5.split(':')[0]}:</strong>{step5.includes(':') ? step5.split(':').slice(1).join(':') : ''}</Text>
      <NotificationButton 
        href="https://app.talentodigital.io/" 
        text={button_text}
      />
      <Text style={text}>{closing}</Text>
      <Text style={signatureStyle}>
        {signature.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < signature.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </Text>
    </Section>
    <Footer />
  </Layout>
);

const contentSection = {
  padding: '20px 30px',
};

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const textBold = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  fontWeight: 'bold',
  margin: '24px 0 12px 0',
};

const listItem = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const signatureStyle = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
  fontWeight: '500',
};
