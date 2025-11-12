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
  Hr,
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface CompanyNotificationEmailProps {
  leadData: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    location?: string;
    allowOutreach?: boolean;
  };
  facilityDetails?: {
    sport?: string;
    projectType?: string;
    size?: string;
    buildMode?: string;
    sports?: string[];
  };
  estimates?: {
    totalInvestment?: number;
    annualRevenue?: number;
    monthlyRevenue?: number;
    roi?: number;
    paybackPeriod?: number | string;
    breakEven?: number | string;
  };
  source: string;
  timestamp: string;
}

export const CompanyNotificationEmail = ({
  leadData,
  facilityDetails,
  estimates,
  source,
  timestamp,
}: CompanyNotificationEmailProps) => {
  const location = leadData.location || 
    (leadData.city && leadData.state ? `${leadData.city}, ${leadData.state}` : null);

  return (
    <Html>
      <Head />
      <Preview>New Lead: {leadData.name} - {facilityDetails?.projectType || 'Sports Facility'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>🎯 New Lead Captured!</Heading>
            <Text style={metaText}>
              Source: <strong>{source}</strong> | Time: {new Date(timestamp).toLocaleString()}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading style={h2}>📋 Contact Information</Heading>
            <table style={infoTable}>
              <tbody>
                <tr>
                  <td style={labelCell}><strong>Name:</strong></td>
                  <td style={valueCell}>{leadData.name}</td>
                </tr>
                <tr>
                  <td style={labelCell}><strong>Email:</strong></td>
                  <td style={valueCell}>
                    <a href={`mailto:${leadData.email}`} style={link}>{leadData.email}</a>
                  </td>
                </tr>
                {leadData.phone && (
                  <tr>
                    <td style={labelCell}><strong>Phone:</strong></td>
                    <td style={valueCell}>
                      <a href={`tel:${leadData.phone}`} style={link}>{leadData.phone}</a>
                    </td>
                  </tr>
                )}
                {location && (
                  <tr>
                    <td style={labelCell}><strong>Location:</strong></td>
                    <td style={valueCell}>{location}</td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}><strong>Supplier Outreach:</strong></td>
                  <td style={valueCell}>
                    <span style={leadData.allowOutreach ? yesTag : noTag}>
                      {leadData.allowOutreach ? 'YES ✓' : 'NO'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          {facilityDetails && (
            <>
              <Section style={section}>
                <Heading style={h2}>🏟️ Facility Details</Heading>
                <table style={infoTable}>
                  <tbody>
                    {facilityDetails.projectType && (
                      <tr>
                        <td style={labelCell}><strong>Project Type:</strong></td>
                        <td style={valueCell}>{facilityDetails.projectType}</td>
                      </tr>
                    )}
                    {facilityDetails.sport && (
                      <tr>
                        <td style={labelCell}><strong>Sport:</strong></td>
                        <td style={valueCell}>{facilityDetails.sport}</td>
                      </tr>
                    )}
                    {facilityDetails.sports && facilityDetails.sports.length > 0 && (
                      <tr>
                        <td style={labelCell}><strong>Sports:</strong></td>
                        <td style={valueCell}>{facilityDetails.sports.join(', ')}</td>
                      </tr>
                    )}
                    {facilityDetails.size && (
                      <tr>
                        <td style={labelCell}><strong>Size:</strong></td>
                        <td style={valueCell}>{facilityDetails.size}</td>
                      </tr>
                    )}
                    {facilityDetails.buildMode && (
                      <tr>
                        <td style={labelCell}><strong>Build Mode:</strong></td>
                        <td style={valueCell}>{facilityDetails.buildMode}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Section>
              <Hr style={hr} />
            </>
          )}

          {estimates && Object.keys(estimates).length > 0 && (
            <>
              <Section style={section}>
                <Heading style={h2}>💰 Financial Estimates</Heading>
                <table style={infoTable}>
                  <tbody>
                    {estimates.totalInvestment && (
                      <tr>
                        <td style={labelCell}><strong>Total Investment:</strong></td>
                        <td style={valueCell}>${estimates.totalInvestment.toLocaleString()}</td>
                      </tr>
                    )}
                    {estimates.annualRevenue && (
                      <tr>
                        <td style={labelCell}><strong>Annual Revenue:</strong></td>
                        <td style={valueCell}>${estimates.annualRevenue.toLocaleString()}</td>
                      </tr>
                    )}
                    {estimates.monthlyRevenue && (
                      <tr>
                        <td style={labelCell}><strong>Monthly Revenue:</strong></td>
                        <td style={valueCell}>${estimates.monthlyRevenue.toLocaleString()}</td>
                      </tr>
                    )}
                    {estimates.roi && (
                      <tr>
                        <td style={labelCell}><strong>ROI:</strong></td>
                        <td style={valueCell}>{estimates.roi.toFixed(1)}%</td>
                      </tr>
                    )}
                    {(estimates.paybackPeriod || estimates.breakEven) && (
                      <tr>
                        <td style={labelCell}><strong>Payback Period:</strong></td>
                        <td style={valueCell}>{estimates.paybackPeriod || estimates.breakEven} months</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Section>
              <Hr style={hr} />
            </>
          )}

          <Section style={ctaSection}>
            <Button
              href={`mailto:${leadData.email}`}
              style={button}
            >
              Reply to {leadData.name}
            </Button>
          </Section>

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
            {' | '}
            <Link href="tel:402-592-2000" style={link}>
              402-592-2000
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CompanyNotificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const headerSection = {
  backgroundColor: '#3b82f6',
  padding: '20px',
  borderRadius: '8px 8px 0 0',
  marginBottom: '0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
};

const metaText = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '0',
};

const section = {
  padding: '20px 0',
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  padding: '8px 0',
  width: '40%',
  color: '#666',
  fontSize: '14px',
  verticalAlign: 'top' as const,
};

const valueCell = {
  padding: '8px 0',
  color: '#333',
  fontSize: '14px',
  verticalAlign: 'top' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const yesTag = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '4px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  display: 'inline-block',
};

const noTag = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '4px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  display: 'inline-block',
};

const ctaSection = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '20px',
  textAlign: 'center' as const,
};
