import { Section, Text, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { NotificationButton } from './NotificationButton.tsx';

interface MarketplaceRequestProps {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  serviceType?: string;
  description?: string;
}

const infoBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #8b5cf6',
  padding: '16px',
  marginTop: '20px',
  marginBottom: '20px',
  borderRadius: '4px',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
  marginTop: '12px',
};

const infoValue = {
  fontSize: '14px',
  color: '#111827',
  marginTop: '0',
  marginBottom: '0',
};

const badge = {
  display: 'inline-block',
  backgroundColor: '#8b5cf6',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '20px',
};

const badgeText = {
  margin: '0',
  padding: '0',
};

const heading = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  marginTop: '0',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  marginTop: '0',
  marginBottom: '16px',
};

export const MarketplaceRequest = ({
  userName,
  title,
  message,
  actionUrl,
  actionText = "Ver solicitud en el panel de admin",
  contactName,
  contactEmail,
  companyName,
  serviceType,
  description
}: MarketplaceRequestProps) => (
  <Layout preview={title}>
    <Header userName={userName} />
    <Section style={{ padding: '32px' }}>
      <div style={badge}>
        <span style={badgeText}>🛍️ SOLICITUD DE PUBLICACIÓN</span>
      </div>
      <Text style={heading}>{title}</Text>
      <Text style={paragraph}>{message}</Text>
      
      {(contactName || contactEmail || companyName || serviceType || description) && (
        <div style={infoBox}>
          {contactName && (
            <>
              <Text style={infoLabel}>Contacto:</Text>
              <Text style={infoValue}>{contactName}</Text>
            </>
          )}
          
          {contactEmail && (
            <>
              <Text style={infoLabel}>Email:</Text>
              <Text style={infoValue}>{contactEmail}</Text>
            </>
          )}
          
          {companyName && (
            <>
              <Text style={infoLabel}>Empresa/Nombre:</Text>
              <Text style={infoValue}>{companyName}</Text>
            </>
          )}
          
          {serviceType && (
            <>
              <Text style={infoLabel}>Tipo de Servicio:</Text>
              <Text style={infoValue}>{serviceType}</Text>
            </>
          )}
          
          {description && (
            <>
              <Text style={infoLabel}>Descripción:</Text>
              <Text style={infoValue}>{description}</Text>
            </>
          )}
        </div>
      )}
      
      {actionUrl && (
        <NotificationButton 
          href={actionUrl} 
          text={actionText} 
        />
      )}
    </Section>
    <Footer />
  </Layout>
);