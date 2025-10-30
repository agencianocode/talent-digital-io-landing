import { Button } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface NotificationButtonProps {
  href: string;
  text: string;
}

export const NotificationButton = ({ href, text }: NotificationButtonProps) => (
  <Button href={href} style={button}>
    {text}
  </Button>
);

const button = {
  backgroundColor: '#1976d2',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 30px',
  marginTop: '20px',
  marginBottom: '20px',
};
