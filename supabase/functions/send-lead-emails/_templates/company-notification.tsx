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

interface MarketAnalysisData {
  location: string;
  marketScore: number;
  marketVerdict: string;
  demographics: {
    population10Min: number;
    population15Min: number;
    population20Min: number;
    medianIncome: number;
    youthPercentage: number;
    populationGrowthRate: number;
  };
  sportDemand: Array<{ sport: string; score: number }>;
  competitionScore?: number;
  marketGaps?: Array<{ sport: string; opportunity: number; reason: string }>;
  revenuePotential: {
    totalLow: number;
    totalHigh: number;
    topSports: Array<{ sport: string; revenueLow: number; revenueHigh: number; participants: number }>;
  };
  nearbyFacilities?: Array<{ name: string; vicinity: string }>;
  insights?: string[];
}

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
  equipmentItems?: EquipmentCategory[];
  equipmentTotals?: {
    equipment: number;
    flooring: number;
    installation: number;
    grandTotal: number;
  };
  buildingLineItems?: EquipmentCategory[];
  buildingTotals?: {
    subtotal: number;
    softCosts: number;
    contingency: number;
    grandTotal: number;
  };
  marketAnalysis?: MarketAnalysisData;
  source: string;
  timestamp: string;
}
export const CompanyNotificationEmail = ({
  leadData,
  facilityDetails,
  estimates,
  equipmentItems,
  equipmentTotals,
  buildingLineItems,
  buildingTotals,
  marketAnalysis,
  source,
  timestamp,
}: CompanyNotificationEmailProps) => {
  const location = leadData.location || 
    (leadData.city && leadData.state ? `${leadData.city}, ${leadData.state}` : null);
  const formatNum = (n: number) => n.toLocaleString();
  const formatCurrency = (n: number) => '$' + n.toLocaleString();
  const formatRevenue = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

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

          {/* Market Analysis Section */}
          {marketAnalysis && (
            <>
              <Section style={section}>
                <Heading style={h2}>📊 Market Analysis Report</Heading>
                <Text style={{ fontSize: '14px', color: '#666', margin: '0 0 12px 0' }}>
                  Location: <strong>{marketAnalysis.location}</strong>
                </Text>
                <table style={infoTable}>
                  <tbody>
                    <tr>
                      <td style={labelCell}><strong>Market Score:</strong></td>
                      <td style={valueCell}>
                        <span style={{ color: getScoreColor(marketAnalysis.marketScore), fontWeight: 'bold' as const }}>
                          {marketAnalysis.marketScore}/100 — {marketAnalysis.marketVerdict}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={labelCell}><strong>Population (15 min):</strong></td>
                      <td style={valueCell}>{formatNum(marketAnalysis.demographics.population15Min)}</td>
                    </tr>
                    <tr>
                      <td style={labelCell}><strong>Median Income:</strong></td>
                      <td style={valueCell}>{formatCurrency(marketAnalysis.demographics.medianIncome)}</td>
                    </tr>
                    <tr>
                      <td style={labelCell}><strong>Youth %:</strong></td>
                      <td style={valueCell}>{marketAnalysis.demographics.youthPercentage.toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td style={labelCell}><strong>Growth Rate:</strong></td>
                      <td style={valueCell}>{marketAnalysis.demographics.populationGrowthRate.toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td style={labelCell}><strong>Revenue Potential:</strong></td>
                      <td style={valueCell}>
                        <strong>{formatRevenue(marketAnalysis.revenuePotential.totalLow)} – {formatRevenue(marketAnalysis.revenuePotential.totalHigh)}</strong> /year
                      </td>
                    </tr>
                    {marketAnalysis.competitionScore != null && (
                      <tr>
                        <td style={labelCell}><strong>Competition Score:</strong></td>
                        <td style={valueCell}>{marketAnalysis.competitionScore}/100</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Top Sports */}
                <Text style={{ ...categoryHeader, marginTop: '16px' }}>Top Sports by Demand</Text>
                <table style={infoTable}>
                  <tbody>
                    {marketAnalysis.sportDemand.slice(0, 5).map((s, i) => (
                      <tr key={i}>
                        <td style={labelCell}>{s.sport.charAt(0).toUpperCase() + s.sport.slice(1)}</td>
                        <td style={valueCell}><strong style={{ color: getScoreColor(s.score) }}>{s.score}</strong>/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Revenue by Sport */}
                <Text style={{ ...categoryHeader, marginTop: '16px' }}>Revenue by Sport</Text>
                <table style={infoTable}>
                  <tbody>
                    {marketAnalysis.revenuePotential.topSports.map((s, i) => (
                      <tr key={i}>
                        <td style={labelCell}>{s.sport}</td>
                        <td style={valueCell}>{formatRevenue(s.revenueLow)} – {formatRevenue(s.revenueHigh)} ({formatNum(s.participants)} participants)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Market Gaps */}
                {marketAnalysis.marketGaps && marketAnalysis.marketGaps.length > 0 && (
                  <>
                    <Text style={{ ...categoryHeader, marginTop: '16px' }}>Market Gaps</Text>
                    {marketAnalysis.marketGaps.map((g, i) => (
                      <Text key={i} style={{ fontSize: '13px', color: '#333', margin: '4px 0' }}>
                        <strong>{g.sport}:</strong> {g.reason} (opportunity: {g.opportunity})
                      </Text>
                    ))}
                  </>
                )}

                {/* Nearby Facilities */}
                {marketAnalysis.nearbyFacilities && marketAnalysis.nearbyFacilities.length > 0 && (
                  <>
                    <Text style={{ ...categoryHeader, marginTop: '16px' }}>Nearby Facilities</Text>
                    {marketAnalysis.nearbyFacilities.map((f, i) => (
                      <Text key={i} style={{ fontSize: '13px', color: '#333', margin: '4px 0' }}>
                        <strong>{f.name}</strong> — {f.vicinity}
                      </Text>
                    ))}
                  </>
                )}
              </Section>
              <Hr style={hr} />
            </>
          )}

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

          {equipmentItems && equipmentItems.length > 0 && (
            <>
              <Section style={section}>
                <Heading style={h2}>📦 Equipment Quote Details</Heading>
                {equipmentItems.map((category, catIndex) => (
                  <React.Fragment key={catIndex}>
                    <Text style={categoryHeader}>{category.category}</Text>
                    <table style={equipmentTable}>
                      <thead>
                        <tr>
                          <th style={eqTableHeaderCell}>Item</th>
                          <th style={eqTableHeaderCellRight}>Qty</th>
                          <th style={eqTableHeaderCellRight}>Unit</th>
                          <th style={eqTableHeaderCellRight}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td style={eqTableCell}>{item.name}</td>
                            <td style={eqTableCellRight}>{item.quantity}</td>
                            <td style={eqTableCellRight}>${item.unitCost.toLocaleString()}</td>
                            <td style={eqTableCellRight}>${item.totalCost.toLocaleString()}</td>
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
                )}
              </Section>
              <Hr style={hr} />
            </>
          )}

          {buildingLineItems && buildingLineItems.length > 0 && (
            <>
              <Section style={section}>
                <Heading style={h2}>🏗️ Building Estimate Details</Heading>
                {buildingLineItems.map((category, catIndex) => (
                  <React.Fragment key={catIndex}>
                    <Text style={categoryHeader}>{category.category}</Text>
                    <table style={equipmentTable}>
                      <thead>
                        <tr>
                          <th style={eqTableHeaderCell}>Item</th>
                          <th style={eqTableHeaderCellRight}>Qty</th>
                          <th style={eqTableHeaderCellRight}>Unit</th>
                          <th style={eqTableHeaderCellRight}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td style={eqTableCell}>{item.name}</td>
                            <td style={eqTableCellRight}>{item.quantity}</td>
                            <td style={eqTableCellRight}>${item.unitCost.toLocaleString()}</td>
                            <td style={eqTableCellRight}>${item.totalCost.toLocaleString()}</td>
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
                  <table style={totalsTable}>
                    <tbody>
                      <tr>
                        <td style={totalsLabel}>Building Subtotal:</td>
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
                        <td style={grandTotalLabel}>Grand Total:</td>
                        <td style={grandTotalValue}>${buildingTotals.grandTotal.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </Section>
              <Hr style={hr} />
            </>
          )}

          {estimates && Object.keys(estimates).length > 0 && !equipmentTotals && (
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
  fontSize: '12px',
  marginBottom: '8px',
};

const eqTableHeaderCell = {
  textAlign: 'left' as const,
  padding: '4px',
  borderBottom: '1px solid #d1d5db',
  color: '#6b7280',
  fontWeight: 'bold' as const,
  fontSize: '11px',
};

const eqTableHeaderCellRight = {
  ...eqTableHeaderCell,
  textAlign: 'right' as const,
};

const eqTableCell = {
  padding: '4px',
  borderBottom: '1px solid #f3f4f6',
  color: '#333',
  fontSize: '12px',
};

const eqTableCellRight = {
  ...eqTableCell,
  textAlign: 'right' as const,
};

const subtotalText = {
  textAlign: 'right' as const,
  fontSize: '12px',
  color: '#4b5563',
  fontWeight: 'bold' as const,
  margin: '4px 0 16px 0',
};

const totalsTable = {
  width: '100%',
  fontSize: '13px',
  marginTop: '12px',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '12px',
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
  fontSize: '14px',
  borderTop: '2px solid #333',
};

const grandTotalValue = {
  padding: '8px 0 4px 0',
  textAlign: 'right' as const,
  color: '#333',
  fontWeight: 'bold' as const,
  fontSize: '14px',
  borderTop: '2px solid #333',
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
