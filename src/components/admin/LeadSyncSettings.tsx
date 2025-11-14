import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Check, Play, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function LeadSyncSettings() {
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string>('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [testingSync, setTestingSync] = useState(false);

  const fetchServiceAccountEmail = async () => {
    try {
      setLoadingEmail(true);
      // We can't actually read secrets from the client, so we'll show instructions instead
      toast.info('Service account email is configured in Supabase secrets');
      setServiceAccountEmail('See Supabase Functions settings for the service account email');
    } catch (error) {
      console.error('Error fetching service account email:', error);
      toast.error('Failed to fetch service account email');
    } finally {
      setLoadingEmail(false);
    }
  };

  const copyToClipboard = () => {
    if (serviceAccountEmail) {
      navigator.clipboard.writeText(serviceAccountEmail);
      setEmailCopied(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const runTestSync = async () => {
    try {
      setTestingSync(true);

      const testData = {
        name: "Test Lead",
        email: `test-${Date.now()}@example.com`,
        phone: "555-0100",
        business: "Test Business Inc",
        city: "Test City",
        state: "TS",
        facilityType: "Multi-Sport Complex",
        facilitySize: "30,000 sq ft",
        sports: "Basketball, Soccer",
        estimatedSquareFootage: 30000,
        estimatedBudget: 750000,
        estimatedMonthlyRevenue: 60000,
        estimatedROI: 18,
        source: "admin-test",
        userAgent: "Admin Test Tool",
        referrer: "direct"
      };

      const { data, error } = await supabase.functions.invoke('sync-lead-to-sheets', {
        body: testData
      });

      if (error) throw error;

      if (data.success) {
        toast.success('✅ Test sync successful! Check your Google Sheet for the test lead.');
      } else {
        toast.error('❌ Test sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Test sync error:', error);
      toast.error('Test sync failed: ' + (error.message || 'Unknown error'));
    } finally {
      setTestingSync(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Connection</CardTitle>
          <CardDescription>
            Test and manage your Google Sheets integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Service Account Email</h4>
            <p className="text-sm text-muted-foreground">
              Share your Google Sheet with this email address as an Editor
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchServiceAccountEmail}
                disabled={loadingEmail}
              >
                {loadingEmail ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  'Show Email'
                )}
              </Button>
              {serviceAccountEmail && (
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={!serviceAccountEmail}
                >
                  {emailCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {serviceAccountEmail && (
              <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
                {serviceAccountEmail}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Connection Health Check</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Send a test lead to verify your Google Sheets sync is working correctly
            </p>
            <Button
              onClick={runTestSync}
              disabled={testingSync}
            >
              {testingSync ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test Sync
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            How to configure Google Sheets integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">1. Share your Google Sheet</h4>
            <p className="text-muted-foreground">
              Open your Google Sheet and click "Share" in the top-right corner. Add the service account email (found above) and grant it "Editor" access.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">2. Verify Sheet ID and Tab Name</h4>
            <p className="text-muted-foreground">
              The Sheet ID is in your Google Sheet URL: <code className="bg-muted px-1 py-0.5 rounded">docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit</code>
            </p>
            <p className="text-muted-foreground">
              The Tab Name is the exact name shown at the bottom of your sheet (case-sensitive).
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">3. Configure Secrets in Supabase</h4>
            <p className="text-muted-foreground">
              Go to your Supabase Dashboard → Edge Functions → Settings and ensure these secrets are set:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_SERVICE_ACCOUNT_JSON</code></li>
              <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_SHEET_ID</code></li>
              <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_SHEET_TAB</code></li>
            </ul>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://supabase.com/dashboard/project/apdxtdarwacdcuhvtaag/settings/functions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Open Supabase Functions Settings
              </a>
            </Button>
          </div>

          <div className="space-y-2 text-sm border-t pt-3">
            <h4 className="font-medium">Common Issues</h4>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>403 Permission Denied: Sheet not shared with service account</li>
              <li>400 Bad Request: Wrong Sheet ID or Tab Name</li>
              <li>Check Edge Function logs for detailed error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
