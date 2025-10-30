import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { Section, Text } from 'npm:@react-email/components@0.0.22';

interface WelcomeBusinessProps {
  userName: string;
}

export const WelcomeBusiness = ({ userName }: WelcomeBusinessProps) => (
  <Layout preview="¡Bienvenido a TalentoDigital!">
    <Header userName={userName} />
    <Section style={contentSection}>
      <Text style={text}>
        ¡Bienvenido a TalentoDigital! 🚀
      </Text>
      <Text style={text}>
        Estamos encantados de que tu empresa se una a nuestra plataforma para encontrar el mejor talento digital.
      </Text>
      <Text style={textBold}>
        ¿Qué puedes hacer ahora?
      </Text>
      <Text style={listItem}>
        ✓ <strong>Completa el perfil de tu empresa:</strong> Añade información, logo y cultura empresarial
      </Text>
      <Text style={listItem}>
        ✓ <strong>Publica oportunidades:</strong> Crea ofertas de trabajo y recibe aplicaciones de talento calificado
      </Text>
      <Text style={listItem}>
        ✓ <strong>Busca talento:</strong> Explora perfiles de profesionales y contacta directamente
      </Text>
      <Text style={listItem}>
        ✓ <strong>Gestiona tu equipo:</strong> Invita a miembros de tu empresa para colaborar en la contratación
      </Text>
      <Text style={listItem}>
        ✓ <strong>Accede al marketplace:</strong> Encuentra servicios especializados para tus proyectos
      </Text>
      <NotificationButton 
        href="https://app.talentodigital.io/" 
        text="Iniciar sesión y completar perfil"
      />
      <Text style={text}>
        Nuestro equipo está disponible para ayudarte a sacar el máximo provecho de la plataforma.
      </Text>
      <Text style={signature}>
        ¡Éxito en tu búsqueda de talento!<br />
        El equipo de TalentoDigital
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

const signature = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
  fontWeight: '500',
};
