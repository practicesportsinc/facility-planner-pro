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
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface EquipmentLineItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface EquipmentCategory {
  category: string;
  items: EquipmentLineItem[];
  subtotal: number;
}

interface BuildingTotals {
  subtotal: number;
  softCosts: number;
  contingency: number;
  grandTotal: number;
}

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
  equipmentItems?: EquipmentCategory[];
  equipmentTotals?: {
    equipment: number;
    flooring: number;
    installation: number;
    grandTotal: number;
  };
  buildingLineItems?: EquipmentCategory[];
  buildingTotals?: BuildingTotals;
}

export const CustomerConfirmationEmail = ({
  customerName,
  facilityDetails,
  estimates,
  equipmentItems,
  equipmentTotals,
  buildingLineItems,
  buildingTotals,
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

        {buildingLineItems && buildingLineItems.length > 0 && (
          <Section style={buildingBox}>
            <Heading style={h2}>🏗️ Your Building Estimate</Heading>
            {buildingLineItems.map((category, catIndex) => (
              <React.Fragment key={catIndex}>
                <Text style={categoryHeader}>{category.category}</Text>
                <table style={equipmentTable}>
                  <thead>
                    <tr>
                      <th style={tableHeaderCell}>Item</th>
                      <th style={tableHeaderCellRight}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td style={tableCell}>{item.name}</td>
                        <td style={tableCellRight}>${item.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Text style={subtotalText}>
                  Subtotal: ${category.subtotal.toLocaleString()}
                </Text>
              </React.Fragment>
            ))}
            
            {buildingTotals && (
              <>
                <Hr style={hr} />
                <table style={totalsTable}>
                  <tbody>
                    <tr>
                      <td style={totalsLabel}>Construction Subtotal:</td>
                      <td style={totalsValue}>${buildingTotals.subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={totalsLabel}>Soft Costs (8%):</td>
                      <td style={totalsValue}>${buildingTotals.softCosts.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={totalsLabel}>Contingency (10%):</td>
                      <td style={totalsValue}>${buildingTotals.contingency.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={grandTotalLabel}>Total Investment:</td>
                      <td style={grandTotalValue}>${buildingTotals.grandTotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Section>
        )}

        {equipmentItems && equipmentItems.length > 0 && (
          <Section style={equipmentBox}>
            <Heading style={h2}>📦 Your Equipment Quote</Heading>
            {equipmentItems.map((category, catIndex) => (
              <React.Fragment key={catIndex}>
                <Text style={categoryHeader}>{category.category}</Text>
                <table style={equipmentTable}>
                  <thead>
                    <tr>
                      <th style={tableHeaderCell}>Item</th>
                      <th style={tableHeaderCellRight}>Qty</th>
                      <th style={tableHeaderCellRight}>Unit Cost</th>
                      <th style={tableHeaderCellRight}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td style={tableCell}>{item.name}</td>
                        <td style={tableCellRight}>{item.quantity}</td>
                        <td style={tableCellRight}>${item.unitCost.toLocaleString()}</td>
                        <td style={tableCellRight}>${item.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Text style={subtotalText}>
                  Subtotal: ${category.subtotal.toLocaleString()}
                </Text>
              </React.Fragment>
            ))}
            
            {equipmentTotals && (
              <>
                <Hr style={hr} />
                <table style={totalsTable}>
                  <tbody>
                    <tr>
                      <td style={totalsLabel}>Equipment:</td>
                      <td style={totalsValue}>${equipmentTotals.equipment.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={totalsLabel}>Flooring & Surfaces:</td>
                      <td style={totalsValue}>${equipmentTotals.flooring.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={totalsLabel}>Installation (50%):</td>
                      <td style={totalsValue}>${equipmentTotals.installation.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={grandTotalLabel}>Grand Total:</td>
                      <td style={grandTotalValue}>${equipmentTotals.grandTotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Section>
        )}

        {estimates && !equipmentTotals && (
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

const buildingBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #d97706',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 20px',
};

const equipmentBox = {
  backgroundColor: '#fefce8',
  border: '2px solid #eab308',
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

const categoryHeader = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  margin: '16px 0 8px 0',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '4px',
};

const equipmentTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: '13px',
  marginBottom: '8px',
};

const tableHeaderCell = {
  textAlign: 'left' as const,
  padding: '6px 4px',
  borderBottom: '1px solid #d1d5db',
  color: '#6b7280',
  fontWeight: 'bold' as const,
  fontSize: '12px',
};

const tableHeaderCellRight = {
  ...tableHeaderCell,
  textAlign: 'right' as const,
};

const tableCell = {
  padding: '6px 4px',
  borderBottom: '1px solid #f3f4f6',
  color: '#333',
};

const tableCellRight = {
  ...tableCell,
  textAlign: 'right' as const,
};

const subtotalText = {
  textAlign: 'right' as const,
  fontSize: '13px',
  color: '#4b5563',
  fontWeight: 'bold' as const,
  margin: '4px 0 16px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const totalsTable = {
  width: '100%',
  fontSize: '14px',
};

const totalsLabel = {
  padding: '4px 0',
  color: '#4b5563',
};

const totalsValue = {
  padding: '4px 0',
  textAlign: 'right' as const,
  color: '#333',
};

const grandTotalLabel = {
  padding: '8px 0 4px 0',
  color: '#333',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  borderTop: '2px solid #333',
};

const grandTotalValue = {
  padding: '8px 0 4px 0',
  textAlign: 'right' as const,
  color: '#333',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  borderTop: '2px solid #333',
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
