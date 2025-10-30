import { Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';

interface ModerationNotificationProps {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export const ModerationNotification = ({
  userName,
  title,
  message,
  actionUrl,
  actionText,
}: ModerationNotificationProps) => (
  <Layout preview={title}>
    <Header userName={userName} />
    <Section style={content}>
      <div style={badge}>
        <span style={badgeText}>⚠️ MODERACIÓN</span>
      </div>
      <Text style={heading}>{title}</Text>
      <Text style={paragraph}>{message}</Text>
      {actionUrl && (
        <NotificationButton 
          href={actionUrl} 
          text={actionText || 'Ver detalles'} 
        />
      )}
      <Text style={warning}>
        ⚠️ <strong>Importante:</strong> Esta es una notificación de moderación. Por favor, revisa el contenido lo antes posible.
      </Text>
    </Section>
    <Footer />
  </Layout>
);

const content = {
  padding: '30px',
};

const badge = {
  display: 'inline-block',
  padding: '6px 12px',
  backgroundColor: '#fff3cd',
  borderRadius: '12px',
  marginBottom: '16px',
};

const badgeText = {
  color: '#856404',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555',
  margin: '0 0 16px 0',
};

const warning = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#856404',
  backgroundColor: '#fff3cd',
  padding: '12px',
  borderRadius: '6px',
  borderLeft: '4px solid #ffc107',
  margin: '20px 0 0 0',
};
