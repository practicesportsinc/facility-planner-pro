import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface B2BConfirmationEmailProps {
  customerName: string;
  partnershipType?: string;
  message?: string;
}

export const B2BConfirmationEmail = ({
  customerName,
  partnershipType,
  message,
}: B2BConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your B2B partnership inquiry</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You, {customerName}!</Heading>
        
        <Text style={text}>
          We've received your B2B partnership inquiry and are excited to explore collaboration 
          opportunities with you.
        </Text>

        {partnershipType && (
          <Section style={summaryBox}>
            <Heading style={h2}>Your Inquiry</Heading>
            <Text style={summaryText}>
              <strong>Partnership Interest:</strong> {partnershipType}
            </Text>
            {message && (
              <Text style={summaryText}>
                <strong>Message:</strong> {message}
              </Text>
            )}
          </Section>
        )}

        <Section style={ctaSection}>
          <Heading style={h2}>What's Next?</Heading>
          <Text style={text}>
            Our B2B team will review your inquiry and reach out within 1 business day to discuss:
          </Text>
          <ul style={list}>
            <li style={listItem}>Partnership opportunities tailored to your business</li>
            <li style={listItem}>Revenue sharing and referral programs</li>
            <li style={listItem}>White-label solutions and co-branding options</li>
            <li style={listItem}>Integration and technical requirements</li>
            <li style={listItem}>Pricing and custom packages</li>
          </ul>
        </Section>

        <Section style={ctaSection}>
          <Button
            href="https://practicesportsinc.setmore.com/"
            style={button}
          >
            Schedule a B2B Consultation
          </Button>
        </Section>

        <Text style={text}>
          In the meantime, feel free to explore our B2B resources:
        </Text>
        <ul style={list}>
          <li style={listItem}>
            <Link href="https://sportsfacility.ai/b2b/partnerships" style={link}>
              Partnership Opportunities
            </Link>
          </li>
          <li style={listItem}>
            <Link href="https://sportsfacility.ai/b2b/pricing" style={link}>
              B2B Pricing & Plans
            </Link>
          </li>
        </ul>

        <Text style={footer}>
          <strong>SportsFacility.ai</strong>
          <br />
          Practice Sports, Inc.
          <br />
          Building the future of modern sports facilities
          <br />
          <Link href="https://practicesports.com" style={link}>
            practicesports.com
          </Link>
          {' | '}
          <Link href="mailto:info@practicesports.com" style={link}>
            info@practicesports.com
          </Link>
          <br />
          <Link href="tel:402-592-2000" style={link}>
            402-592-2000
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default B2BConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0 15px',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 20px',
};

const summaryBox = {
  backgroundColor: '#f0f7ff',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 20px',
};

const summaryText = {
  color: '#333',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '20px',
};

const ctaSection = {
  padding: '0 20px',
  margin: '20px 0',
};

const list = {
  paddingLeft: '20px',
  margin: '16px 0',
};

const listItem = {
  marginBottom: '8px',
  color: '#333',
  fontSize: '14px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '20px 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 20px',
  marginTop: '40px',
  textAlign: 'center' as const,
};
