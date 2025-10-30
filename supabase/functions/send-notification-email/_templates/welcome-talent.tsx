import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { Section, Text } from 'npm:@react-email/components@0.0.22';

interface WelcomeTalentProps {
  userName: string;
}

export const WelcomeTalent = ({ userName }: WelcomeTalentProps) => (
  <Layout preview="¡Bienvenido a TalentoDigital!">
    <Header userName={userName} />
    <Section style={contentSection}>
      <Text style={text}>
        ¡Nos emociona tenerte en TalentoDigital! 🎉
      </Text>
      <Text style={text}>
        Has dado el primer paso para conectar con las mejores oportunidades laborales del mercado digital.
      </Text>
      <Text style={textBold}>
        ¿Qué puedes hacer ahora?
      </Text>
      <Text style={listItem}>
        ✓ <strong>Completa tu perfil:</strong> Agrega tu experiencia, habilidades y portafolio para destacar
      </Text>
      <Text style={listItem}>
        ✓ <strong>Explora oportunidades:</strong> Descubre ofertas de trabajo que se ajusten a tu perfil
      </Text>
      <Text style={listItem}>
        ✓ <strong>Conecta con empresas:</strong> Las mejores empresas podrán encontrarte y contactarte
      </Text>
      <Text style={listItem}>
        ✓ <strong>Publica tus servicios:</strong> Ofrece tus servicios en nuestro marketplace
      </Text>
      <NotificationButton 
        href="https://app.talentodigital.io/" 
        text="Iniciar sesión y completar perfil"
      />
      <Text style={text}>
        Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
      </Text>
      <Text style={signature}>
        ¡Éxito en tu búsqueda!<br />
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
