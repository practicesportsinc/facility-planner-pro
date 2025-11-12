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

interface CustomerConfirmationEmailProps {
  customerName: string;
  facilityDetails?: {
    sport?: string;
    size?: string;
    location?: string;
  };
  estimates?: {
    totalInvestment?: number;
    monthlyRevenue?: number;
    breakEven?: number | string;
    roi?: number;
  };
}

export const CustomerConfirmationEmail = ({
  customerName,
  facilityDetails,
  estimates,
}: CustomerConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your interest in building a sports facility</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You, {customerName}!</Heading>
        
        <Text style={text}>
          We've received your facility planning request and are excited to help you bring your vision to life.
        </Text>

        {facilityDetails && (
          <Section style={summaryBox}>
            <Heading style={h2}>Your Facility Summary</Heading>
            {facilityDetails.sport && (
              <Text style={summaryText}>
                <strong>Sport/Activity:</strong> {facilityDetails.sport}
              </Text>
            )}
            {facilityDetails.size && (
              <Text style={summaryText}>
                <strong>Facility Size:</strong> {facilityDetails.size}
              </Text>
            )}
            {facilityDetails.location && (
              <Text style={summaryText}>
                <strong>Location:</strong> {facilityDetails.location}
              </Text>
            )}
          </Section>
        )}

        {estimates && (
          <Section style={estimatesBox}>
            <Heading style={h2}>Financial Estimates</Heading>
            {estimates.totalInvestment && (
              <Text style={estimateText}>
                <strong>Estimated Investment:</strong> ${estimates.totalInvestment.toLocaleString()}
              </Text>
            )}
            {estimates.monthlyRevenue && (
              <Text style={estimateText}>
                <strong>Projected Monthly Revenue:</strong> ${estimates.monthlyRevenue.toLocaleString()}
              </Text>
            )}
            {estimates.breakEven && (
              <Text style={estimateText}>
                <strong>Break-Even Period:</strong> {estimates.breakEven} months
              </Text>
            )}
            {estimates.roi && (
              <Text style={estimateText}>
                <strong>Annual ROI:</strong> {estimates.roi.toFixed(1)}%
              </Text>
            )}
          </Section>
        )}

        <Section style={ctaSection}>
          <Heading style={h2}>What's Next?</Heading>
          <Text style={text}>
            Our team will review your information and reach out within 24-48 hours to discuss:
          </Text>
          <ul style={list}>
            <li style={listItem}>Detailed financial projections</li>
            <li style={listItem}>Equipment and supplier recommendations</li>
            <li style={listItem}>Site planning and layout options</li>
            <li style={listItem}>Financing and partnership opportunities</li>
          </ul>
        </Section>

        <Section style={ctaSection}>
          <Button
            href="https://practicesportsinc.setmore.com/"
            style={button}
          >
            Schedule a Consultation
          </Button>
        </Section>

        <Text style={footer}>
          <strong>Practice Sports</strong>
          <br />
          Building the future of sports facilities
          <br />
          <Link href="mailto:info@practicesports.com" style={link}>
            info@practicesports.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default CustomerConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const estimatesBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
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

const estimateText = {
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
