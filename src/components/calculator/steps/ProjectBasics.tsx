import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Calendar, DollarSign, Target } from "lucide-react";
import { StageSelector } from "@/components/ui/stage-selector";

interface ProjectBasicsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData?: any;
}

const SPORTS_OPTIONS = [
  { id: 'baseball', label: 'Baseball/Softball', icon: '⚾' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'pickleball', label: 'Pickleball', icon: '🏓' },
  { id: 'soccer', label: 'Soccer', icon: '⚽' },
  { id: 'football', label: 'Football', icon: '🏈' },
  { id: 'lacrosse', label: 'Lacrosse', icon: '🥍' },
  { id: 'multisport', label: 'Multi-sport', icon: '🏟️' },
];

const BUSINESS_MODELS = [
  { id: 'membership', label: 'Membership-based Club' },
  { id: 'rental', label: 'Court/Field Rental' },
  { id: 'training', label: 'Training & Lessons' },
  { id: 'mixed', label: 'Mixed Revenue Model' },
];

const ProjectBasics = ({ data, onUpdate, onNext }: ProjectBasicsProps) => {
  const [formData, setFormData] = useState({
    projectName: data.projectName || '',
    location: data.location || 'Omaha, NE, United States',
    currency: data.currency || 'USD',
    targetOpeningDate: data.targetOpeningDate || '',
    selectedSports: data.selectedSports || [],
    businessModel: data.businessModel || '',
    stage: data.stage || 'R&D',
    ...data
  });

  const handleSportToggle = (sportId: string) => {
    const newSports = formData.selectedSports.includes(sportId)
      ? formData.selectedSports.filter((id: string) => id !== sportId)
      : [...formData.selectedSports, sportId];
    
    const newData = { ...formData, selectedSports: newSports };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const isValid = formData.projectName && formData.location && formData.selectedSports.length > 0 && formData.businessModel && formData.stage;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Let's Start with Your Project Basics</h2>
        <p className="text-muted-foreground">
          Tell us about your facility vision and we'll help you build a comprehensive plan
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Elite Baseball Training Center"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    className="pl-10"
                    placeholder="Omaha, NE, United States"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <DollarSign className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Opening</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetDate"
                    type="date"
                    className="pl-10"
                    value={formData.targetOpeningDate}
                    onChange={(e) => handleInputChange('targetOpeningDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <StageSelector 
                value={formData.stage}
                onChange={(value) => handleInputChange('stage', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Model</CardTitle>
            <CardDescription>How do you plan to generate revenue?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {BUSINESS_MODELS.map((model) => (
              <div key={model.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={model.id}
                  name="businessModel"
                  value={model.id}
                  checked={formData.businessModel === model.id}
                  onChange={(e) => handleInputChange('businessModel', e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <Label htmlFor={model.id} className="font-normal">
                  {model.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sports & Activities</CardTitle>
          <CardDescription>Select all sports you plan to offer (you can select multiple)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPORTS_OPTIONS.map((sport) => (
              <div
                key={sport.id}
                className={`border rounded-lg p-4 cursor-pointer transition-smooth hover:shadow-custom-md ${
                  formData.selectedSports.includes(sport.id)
                    ? 'border-primary bg-primary/5 shadow-custom-sm'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSportToggle(sport.id)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={sport.id}
                    checked={formData.selectedSports.includes(sport.id)}
                  />
                  <div>
                    <div className="text-2xl mb-1">{sport.icon}</div>
                    <Label htmlFor={sport.id} className="text-sm font-medium cursor-pointer">
                      {sport.label}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="hero" 
          onClick={onNext}
          disabled={!isValid}
        >
          Continue to Facility Plan
        </Button>
      </div>
    </div>
  );
};

export default ProjectBasics;