import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { Section, Text } from 'npm:@react-email/components@0.0.22';

interface CompleteProfileReminderProps {
  userName: string;
  missingItems: string[];
  reminderType: 'first' | 'second';
}

export const CompleteProfileReminder = ({ 
  userName, 
  missingItems,
  reminderType 
}: CompleteProfileReminderProps) => (
  <Layout preview="¡Tu perfil está casi listo!">
    <Header userName={userName} />
    <Section style={contentSection}>
      <Text style={text}>
        {reminderType === 'first' 
          ? '¡Hola! Notamos que te registraste en TalentoDigital pero aún no completaste tu perfil. 👋'
          : '¡Hola de nuevo! Tu perfil en TalentoDigital sigue incompleto. No te pierdas las oportunidades que te esperan. 🌟'
        }
      </Text>
      
      <Text style={textBold}>
        Solo te faltan estos pasos:
      </Text>
      
      {missingItems.map((item, index) => (
        <Text key={index} style={listItem}>
          ⚠️ {item}
        </Text>
      ))}

      <Text style={highlightBox}>
        <strong>¿Por qué es importante?</strong><br />
        Un perfil completo te ayuda a:<br />
        ✓ Ser descubierto por empresas que buscan talento como tú<br />
        ✓ Postularte a las mejores oportunidades laborales<br />
        ✓ Conectar con academias y recibir certificaciones
      </Text>

      <NotificationButton 
        href="https://app.talentodigital.io/talent-onboarding" 
        text="Completar mi perfil ahora"
      />

      <Text style={subtext}>
        Solo toma 2 minutos completar tu perfil. ¡Hazlo ahora y empieza a destacar!
      </Text>

      <Text style={signature}>
        ¡Te esperamos!<br />
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
  color: '#dc2626',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
  paddingLeft: '8px',
};

const highlightBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #0ea5e9',
  borderRadius: '8px',
  padding: '16px',
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '20px 0',
};

const subtext = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  fontStyle: 'italic',
};

const signature = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
  fontWeight: '500',
};
