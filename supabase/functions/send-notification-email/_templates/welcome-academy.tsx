import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { Section, Text } from 'npm:@react-email/components@0.0.22';

interface WelcomeAcademyProps {
  userName: string;
}

export const WelcomeAcademy = ({ userName }: WelcomeAcademyProps) => (
  <Layout preview="¡Bienvenido a TalentoDigital!">
    <Header userName={userName} />
    <Section style={contentSection}>
      <Text style={text}>
        ¡Bienvenido a TalentoDigital! 🎓
      </Text>
      <Text style={text}>
        Nos alegra que tu academia se una a nuestra plataforma para conectar a tus estudiantes con oportunidades profesionales.
      </Text>
      <Text style={textBold}>
        ¿Qué puedes hacer ahora?
      </Text>
      <Text style={listItem}>
        ✓ <strong>Configura tu academia:</strong> Completa la información institucional y añade tu logo
      </Text>
      <Text style={listItem}>
        ✓ <strong>Invita a tus estudiantes:</strong> Crea invitaciones para que se unan a tu directorio privado
      </Text>
      <Text style={listItem}>
        ✓ <strong>Gestiona tu directorio:</strong> Administra el perfil de tus estudiantes y graduados
      </Text>
      <Text style={listItem}>
        ✓ <strong>Publica oportunidades exclusivas:</strong> Comparte ofertas laborales solo para tu comunidad
      </Text>
      <Text style={listItem}>
        ✓ <strong>Conecta con empresas:</strong> Facilita la conexión entre tus estudiantes y empleadores
      </Text>
      <NotificationButton 
        href="https://app.talentodigital.io/" 
        text="Iniciar sesión en mi academia"
      />
      <Text style={text}>
        Estamos aquí para ayudarte a potenciar la empleabilidad de tus estudiantes.
      </Text>
      <Text style={signature}>
        ¡Éxito con tu academia!<br />
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
