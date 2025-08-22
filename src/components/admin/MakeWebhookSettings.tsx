import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Webhook, ExternalLink, TestTube } from "lucide-react";
import { getWebhookSettings, saveWebhookSettings, testWebhook, type WebhookSettings } from "@/services/leadDispatch";

export const MakeWebhookSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WebhookSettings>({ enabled: false });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSettings = getWebhookSettings();
    setSettings(savedSettings);
    setWebhookUrl(savedSettings.makeWebhookUrl || "");
  }, []);

  const handleSaveSettings = () => {
    const newSettings: WebhookSettings = {
      enabled: settings.enabled,
      makeWebhookUrl: webhookUrl.trim() || undefined,
    };

    saveWebhookSettings(newSettings);
    setSettings(newSettings);
    
    toast({
      title: "Settings Saved",
      description: "Make.com webhook settings have been updated.",
    });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Temporarily save settings for test
    const testSettings: WebhookSettings = {
      enabled: true,
      makeWebhookUrl: webhookUrl.trim(),
    };
    saveWebhookSettings(testSettings);

    try {
      const success = await testWebhook();
      
      if (success) {
        toast({
          title: "Test Sent",
          description: "Test lead data was sent to Make.com. Check your scenario's execution history.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Failed to send test data. Please check your webhook URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "An error occurred while testing the webhook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Make.com Integration
        </CardTitle>
        <CardDescription>
          Automatically send lead data to Make.com when users submit their information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Enable Make.com Integration</label>
            <p className="text-xs text-muted-foreground">
              Send lead data to Make.com when users submit forms
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
          />
        </div>

        {/* Webhook URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Make.com Webhook URL</label>
          <Input
            type="url"
            placeholder="https://hook.make.com/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            disabled={!settings.enabled}
          />
          <p className="text-xs text-muted-foreground">
            Copy the webhook URL from your Make.com scenario
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSaveSettings} variant="default">
            Save Settings
          </Button>
          <Button 
            onClick={handleTestWebhook} 
            variant="outline"
            disabled={!settings.enabled || !webhookUrl.trim() || isLoading}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isLoading ? "Testing..." : "Test Webhook"}
          </Button>
        </div>

        {/* Setup Instructions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Setup Instructions:</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Log into your Make.com account</li>
            <li>Create a new scenario</li>
            <li>Add a "Webhooks" → "Custom webhook" trigger</li>
            <li>Copy the webhook URL and paste it above</li>
            <li>Add your desired actions (Google Sheets, email, etc.)</li>
            <li>Enable the integration and test it</li>
          </ol>
          
          <div className="mt-4">
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://www.make.com/en/help/scenarios/webhooks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Make.com Webhook Documentation
              </a>
            </Button>
          </div>
        </div>

        {/* Data Structure Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Lead Data Structure:</h4>
          <div className="bg-muted p-3 rounded-md">
            <pre className="text-xs">
{`{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "555-0123",
  "city": "New York",
  "state": "NY",
  "projectType": "Baseball Facility",
  "totalInvestment": 2500000,
  "annualRevenue": 800000,
  "source": "quick-estimate",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};