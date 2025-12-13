import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { Section, Text } from 'npm:@react-email/components@0.0.22';

interface WelcomeTalentProps {
  userName: string;
  // Dynamic content from database
  greeting?: string;
  intro?: string;
  steps_title?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  button_text?: string;
  closing?: string;
  signature?: string;
}

export const WelcomeTalent = ({ 
  userName,
  greeting = '¡Bienvenido a TalentoDigital! 🎉',
  intro = 'Estamos emocionados de tenerte con nosotros. Tu perfil profesional ahora es visible para empresas que buscan talento como tú.',
  steps_title = '¿Qué puedes hacer ahora?',
  step1 = 'Completa tu perfil profesional con tu experiencia y habilidades',
  step2 = 'Explora oportunidades de trabajo que coincidan con tu perfil',
  step3 = 'Conecta con empresas líderes en el mundo digital',
  step4 = 'Mantente actualizado con las últimas ofertas en tu área',
  button_text = 'Completar mi perfil',
  closing = 'Nuestro equipo está aquí para ayudarte a encontrar la oportunidad perfecta.',
  signature = '¡Éxito en tu búsqueda!\nEl equipo de TalentoDigital',
}: WelcomeTalentProps) => (
  <Layout preview="¡Bienvenido a TalentoDigital!">
    <Header userName={userName} />
    <Section style={contentSection}>
      <Text style={text}>{greeting}</Text>
      <Text style={text}>{intro}</Text>
      <Text style={textBold}>{steps_title}</Text>
      <Text style={listItem}>✓ {step1}</Text>
      <Text style={listItem}>✓ {step2}</Text>
      <Text style={listItem}>✓ {step3}</Text>
      <Text style={listItem}>✓ {step4}</Text>
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
