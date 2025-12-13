import { Hr, Link, Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

export const Footer = () => (
  <>
    <Hr style={hr} />
    <Section style={footerSection}>
      <Text style={footerText}>
        Este es un correo automático de notificación de TalentoDigital.
      </Text>
      <Text style={footerText}>
        Puedes gestionar tus preferencias de notificación en{' '}
        <Link href="https://app.talentodigital.io/settings/notifications" style={link}>
          Configuración
        </Link>
      </Text>
      <Text style={footerCopyright}>
        © {new Date().getFullYear()} TalentoDigital. Todos los derechos reservados.
      </Text>
    </Section>
  </>
);

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerSection = {
  padding: '0 30px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px 0',
};

const footerCopyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '12px',
};

const link = {
  color: '#1976d2',
  textDecoration: 'underline',
};
