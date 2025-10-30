import { Heading, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface HeaderProps {
  userName: string;
}

export const Header = ({ userName }: HeaderProps) => (
  <Section style={headerSection}>
    <Heading style={h1}>TalentoDigital</Heading>
    <Heading style={h2}>Hola {userName},</Heading>
  </Section>
);

const headerSection = {
  padding: '20px 30px',
  borderBottom: '2px solid #f0f0f0',
};

const h1 = {
  color: '#1976d2',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
  padding: '0',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0',
  padding: '0',
};
