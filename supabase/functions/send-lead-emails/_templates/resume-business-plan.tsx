import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ResumeBusinessPlanEmailProps {
  customerName: string;
  resumeUrl: string;
  facilityName: string;
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  expiresAt: string;
}

export const ResumeBusinessPlanEmail = ({
  customerName,
  resumeUrl,
  facilityName,
  currentStep,
  totalSteps,
  stepLabel,
  expiresAt,
}: ResumeBusinessPlanEmailProps) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Continue Your Sports Facility Business Plan</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Progress Has Been Saved</Heading>

          <Text style={text}>
            Hi {customerName},
          </Text>

          <Text style={text}>
            Your business plan progress has been saved. Click the button below to continue
            where you left off:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resumeUrl}>
              Resume Your Business Plan
            </Button>
          </Section>

          <Section style={summaryBox}>
            <Heading as="h2" style={h2}>Progress Summary</Heading>
            <Text style={summaryItem}>
              <strong>Facility:</strong> {facilityName || 'Untitled'}
            </Text>
            <Text style={summaryItem}>
              <strong>Step:</strong> {currentStep} of {totalSteps} ({stepLabel})
            </Text>
            <Text style={summaryItem}>
              <strong>Progress:</strong> {Math.round((currentStep / totalSteps) * 100)}% complete
            </Text>
          </Section>

          <Text style={expirationText}>
            ⏰ This link expires on {expirationDate} (30 days from save).
          </Text>

          <Text style={text}>
            If you have any questions or need assistance, feel free to reply to this email.
          </Text>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              <strong>SportsFacility.ai</strong>
              <br />
              Practice Sports, Inc.
              <br />
              <em>Building the future of modern sports facilities</em>
            </Text>
            <Text style={footerLinks}>
              <Link href="https://practicesports.com" style={link}>
                Website
              </Link>
              {' • '}
              <Link href="mailto:info@practicesports.com" style={link}>
                info@practicesports.com
              </Link>
              {' • '}
              <Link href="tel:402-592-2000" style={link}>
                402-592-2000
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResumeBusinessPlanEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const summaryBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const summaryItem = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const expirationText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'none',
};
