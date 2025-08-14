import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Users, FileText } from "lucide-react";

interface SourcingPlanProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData?: any;
}

type Preference = "supplier_outreach" | "self_research" | "undecided";

const SUPPLIER_CATEGORIES = [
  "Turf & Flooring", "Nets/Cages", "Hoops/Standards", "Volleyball Systems",
  "Lighting", "HVAC", "Security/IT", "Scoreboards", "Insurance", "Financing", "General Contractor"
];

const SourcingPlan = ({ data, onUpdate, onNext, onPrevious }: SourcingPlanProps) => {
  const [formData, setFormData] = useState({
    outreach_preference: data.outreach_preference || "undecided" as Preference,
    supplier_categories: data.supplier_categories || [],
    supplier_region_pref: data.supplier_region_pref || "no_preference",
    contact_channel_pref: data.contact_channel_pref || "email",
    contact_time_window: data.contact_time_window || "",
    share_project_summary: data.share_project_summary || false,
    research_kit_sent: data.research_kit_sent || false,
    ...data
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleCategory = (category: string) => {
    const current = formData.supplier_categories;
    const updated = current.includes(category)
      ? current.filter((c: string) => c !== category)
      : [...current, category];
    handleChange('supplier_categories', updated);
  };

  const handleDownloadKit = () => {
    // Simulate download and mark as sent
    handleChange('research_kit_sent', true);
    // In real implementation, trigger download here
    console.log('Downloading DIY Research Kit...');
  };

  const handleEmailKit = () => {
    // Simulate email sending and mark as sent
    handleChange('research_kit_sent', true);
    // In real implementation, send email here
    console.log('Emailing DIY Research Kit...');
  };

  const isValid = () => {
    if (formData.outreach_preference === "supplier_outreach") {
      return formData.supplier_categories.length > 0 && formData.share_project_summary;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Sourcing Plan</h2>
        <p className="text-muted-foreground">
          How would you like to move forward with finding vendors and suppliers?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Vendor Preference
          </CardTitle>
          <CardDescription>Choose how you'd like to handle supplier research</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.outreach_preference}
            onValueChange={(value) => handleChange('outreach_preference', value as Preference)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supplier_outreach" id="supplier_outreach" />
              <Label htmlFor="supplier_outreach" className="font-medium">
                Connect me with vetted suppliers
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="self_research" id="self_research" />
              <Label htmlFor="self_research" className="font-medium">
                I'll do my own research
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="undecided" id="undecided" />
              <Label htmlFor="undecided" className="font-medium">
                Not sure yet
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {formData.outreach_preference === "supplier_outreach" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Categories</CardTitle>
              <CardDescription>Select the categories you need help with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPLIER_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`p-3 text-sm rounded-lg border transition-smooth text-left ${
                      formData.supplier_categories.includes(category)
                        ? "bg-primary text-primary-foreground border-primary shadow-custom-sm"
                        : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Region Preference</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={formData.supplier_region_pref} 
                  onValueChange={(value) => handleChange('supplier_region_pref', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_preference">No preference</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={formData.contact_channel_pref} 
                  onValueChange={(value) => handleChange('contact_channel_pref', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.contact_time_window}
                  onChange={(e) => handleChange('contact_time_window', e.target.value)}
                  placeholder="Weekdays 2–5pm CT"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="share_consent"
                  checked={formData.share_project_summary}
                  onCheckedChange={(checked) => handleChange('share_project_summary', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="share_consent" className="font-medium">
                    Project Summary Consent *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    I agree to share my project summary with selected suppliers for outreach purposes.
                    This helps them provide more accurate quotes and recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {formData.outreach_preference === "self_research" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-accent" />
              DIY Research Kit
            </CardTitle>
            <CardDescription>
              Get our comprehensive toolkit for researching and evaluating suppliers on your own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our Research Kit includes RFP templates, comparison spreadsheets, vendor checklists, 
              and evaluation criteria to help you find the right suppliers independently.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleDownloadKit}>
                <Download className="h-4 w-4 mr-2" />
                Download Kit
              </Button>
              <Button variant="secondary" onClick={handleEmailKit}>
                Email Me the Kit
              </Button>
            </div>
            {formData.research_kit_sent && (
              <p className="text-sm text-success mt-2">
                ✓ Research kit has been sent to you
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          variant="hero" 
          onClick={onNext}
          disabled={!isValid()}
        >
          Continue to Contact Info
        </Button>
      </div>
    </div>
  );
};

export default SourcingPlan;