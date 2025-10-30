import { Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';

interface MarketplaceNotificationProps {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export const MarketplaceNotification = ({
  userName,
  title,
  message,
  actionUrl,
  actionText,
}: MarketplaceNotificationProps) => (
  <Layout preview={title}>
    <Header userName={userName} />
    <Section style={content}>
      <div style={badge}>
        <span style={badgeText}>🛍️ MARKETPLACE</span>
      </div>
      <Text style={heading}>{title}</Text>
      <Text style={paragraph}>{message}</Text>
      {actionUrl && (
        <NotificationButton 
          href={actionUrl} 
          text={actionText || 'Ver servicio'} 
        />
      )}
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
  backgroundColor: '#fce4ec',
  borderRadius: '12px',
  marginBottom: '16px',
};

const badgeText = {
  color: '#c2185b',
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
