import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValuePill } from '@/components/ui/value-pill';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Building, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { PricingDisclaimer } from '@/components/ui/pricing-disclaimer';

export default function SharedReport() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('wizard_submissions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Report Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'This report could not be found or may have been removed.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-2">
            {report.facility_type || 'Sports Facility'} Report
          </Badge>
          <h1 className="text-4xl font-bold">{report.lead_business || 'Facility Estimate'}</h1>
          <p className="text-xl text-muted-foreground">
            {report.lead_name} • {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatMoney(report.total_investment || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatMoney(report.monthly_revenue || 0)}/mo
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Break-Even
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {report.break_even_months || 'N/A'} {report.break_even_months && 'months'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Facility Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.total_square_footage?.toLocaleString() || 'N/A'} SF
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facility Details */}
        <Card>
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.selected_sports && (
              <div>
                <h3 className="font-semibold mb-2">Sports</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(report.selected_sports) 
                    ? report.selected_sports.map((sport: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{sport}</Badge>
                      ))
                    : <Badge variant="secondary">{report.selected_sports}</Badge>
                  }
                </div>
              </div>
            )}

            {report.facility_size && (
              <div>
                <h3 className="font-semibold mb-2">Size Category</h3>
                <p className="text-muted-foreground">{report.facility_size}</p>
              </div>
            )}

            {report.location_type && (
              <div>
                <h3 className="font-semibold mb-2">Location Type</h3>
                <p className="text-muted-foreground">{report.location_type}</p>
              </div>
            )}

            {report.business_model && (
              <div>
                <h3 className="font-semibold mb-2">Business Model</h3>
                <p className="text-muted-foreground">{report.business_model}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Total Investment (CapEx)</span>
                <span className="font-semibold">{formatMoney(report.total_investment || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Monthly Revenue</span>
                <span className="font-semibold text-green-600">{formatMoney(report.monthly_revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Monthly OpEx</span>
                <span className="font-semibold text-orange-600">{formatMoney(report.monthly_opex || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Monthly EBITDA</span>
                <span className="font-semibold">
                  {formatMoney((report.monthly_revenue || 0) - (report.monthly_opex || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Annual Revenue</span>
                <span className="font-semibold">{formatMoney((report.monthly_revenue || 0) * 12)}</span>
              </div>
              {report.roi_percentage && (
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-semibold">{report.roi_percentage.toFixed(1)}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Break-Even Period</span>
                <span className="font-semibold">{report.break_even_months || 'N/A'} months</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Disclaimer */}
        <PricingDisclaimer className="mb-6" />

        {/* Recommendations */}
        {report.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {typeof report.recommendations === 'string' 
                  ? <p>{report.recommendations}</p>
                  : JSON.stringify(report.recommendations, null, 2)
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Generated by SportsFacility.ai</p>
          <p className="mt-1">
            Report ID: {report.id}
          </p>
        </div>
      </div>
    </div>
  );
}
