import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Ruler, Home } from "lucide-react";


interface FacilityPlanProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const FACILITY_TYPES = [
  { 
    id: 'build', 
    label: 'Build New Facility', 
    description: 'Construct from ground up',
    icon: '🏗️'
  },
  { 
    id: 'buy', 
    label: 'Buy Existing Building', 
    description: 'Purchase and renovate',
    icon: '🏢'
  },
  { 
    id: 'lease', 
    label: 'Lease Space', 
    description: 'Rent and improve',
    icon: '📋'
  },
];

const CLEAR_HEIGHTS = [
  { value: '18', label: '18 feet - Basic indoor sports' },
  { value: '20', label: '20 feet - Standard recommendation' },
  { value: '22', label: '22 feet - High-level competition' },
  { value: '24', label: '24+ feet - Premium facility' },
];

const FacilityPlan = ({ data, onUpdate, onNext, onPrevious, allData }: FacilityPlanProps) => {
  const [formData, setFormData] = useState({
    facilityType: data.facilityType || '',
    clearHeight: data.clearHeight || '20',
    totalSquareFootage: data.totalSquareFootage || '',
    recommendSquareFootage: data.recommendSquareFootage || false,
    numberOfCourts: data.numberOfCourts || '',
    numberOfFields: data.numberOfFields || '',
    numberOfCages: data.numberOfCages || '',
    amenities: data.amenities || [],
    ...data
  });

  const selectedSports = allData[1]?.selectedSports || allData[3]?.selectedSports || [];

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a: string) => a !== amenity)
      : [...formData.amenities, amenity];
    
    handleInputChange('amenities', newAmenities);
  };

  const getRecommendedSize = () => {
    const baseSizes = {
      basketball: 5000,
      volleyball: 4000,
      baseball: 8000,
      pickleball: 2000,
      soccer: 10000,
      football: 12000,
      lacrosse: 8000,
      multisport: 6000,
    };

    let totalSize = 0;
    selectedSports.forEach((sport: string) => {
      totalSize += baseSizes[sport as keyof typeof baseSizes] || 5000;
    });

    // Add common areas (30% of sports area)
    totalSize *= 1.3;
    
    return Math.round(totalSize);
  };

  const recommendedSize = getRecommendedSize();

  const AMENITIES = [
    { id: 'locker-rooms', label: 'Locker Rooms' },
    { id: 'concessions', label: 'Concession Stand' },
    { id: 'pro-shop', label: 'Pro Shop / Retail' },
    { id: 'party-rooms', label: 'Party/Event Rooms' },
    { id: 'offices', label: 'Administrative Offices' },
    { id: 'storage', label: 'Equipment Storage' },
    { id: 'spectator-seating', label: 'Spectator Seating' },
    { id: 'parking', label: 'Parking Lot' },
    { id: 'fitness-area', label: 'Fitness/Training Area' },
    { id: 'meeting-rooms', label: 'Meeting/Classroom' },
  ];

  const isValid = formData.facilityType && (formData.totalSquareFootage || formData.recommendSquareFootage);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Design Your Facility</h2>
        <p className="text-muted-foreground">
          Let's plan the size and features of your sports facility
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary" />
            Facility Type
          </CardTitle>
          <CardDescription>How will you acquire your facility?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {FACILITY_TYPES.map((type) => (
              <div
                key={type.id}
                className={`border rounded-lg p-4 cursor-pointer transition-smooth hover:shadow-custom-md ${
                  formData.facilityType === type.id
                    ? 'border-primary bg-primary/5 shadow-custom-sm'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleInputChange('facilityType', type.id)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <h3 className="font-medium mb-1">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ruler className="h-5 w-5 mr-2 text-secondary" />
              Space Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Clear Height (ceiling height)</Label>
              <Select value={formData.clearHeight} onValueChange={(value) => handleInputChange('clearHeight', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLEAR_HEIGHTS.map((height) => (
                    <SelectItem key={height.value} value={height.value}>
                      {height.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recommend"
                  checked={formData.recommendSquareFootage}
                  onChange={(e) => handleInputChange('recommendSquareFootage', e.target.checked)}
                  className="w-4 h-4 text-primary"
                />
                <Label htmlFor="recommend" className="text-sm">
                  Recommend square footage for me
                </Label>
              </div>

              {formData.recommendSquareFootage ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Recommended Size:</span>
                    <span className="text-xl font-bold text-primary">
                      {recommendedSize.toLocaleString()} sq ft
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on your selected sports: {selectedSports.join(', ')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="sqft">Total Square Footage</Label>
                  <Input
                    id="sqft"
                    type="number"
                    placeholder="e.g., 25000"
                    value={formData.totalSquareFootage}
                    onChange={(e) => handleInputChange('totalSquareFootage', e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courts/Fields/Cages</CardTitle>
            <CardDescription>How many playing areas do you need?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Always show at least one input field for playing areas */}
            {selectedSports.includes('basketball') || selectedSports.includes('volleyball') || selectedSports.includes('pickleball') || formData.numberOfCourts ? (
              <div className="space-y-2">
                <Label htmlFor="courts">Number of Courts</Label>
                <Input
                  id="courts"
                  type="number"
                  placeholder="e.g., 4"
                  value={formData.numberOfCourts}
                  onChange={(e) => handleInputChange('numberOfCourts', e.target.value)}
                />
              </div>
            ) : null}

            {selectedSports.includes('soccer') || selectedSports.includes('football') || selectedSports.includes('lacrosse') || formData.numberOfFields ? (
              <div className="space-y-2">
                <Label htmlFor="fields">Number of Fields</Label>
                <Input
                  id="fields"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.numberOfFields}
                  onChange={(e) => handleInputChange('numberOfFields', e.target.value)}
                />
              </div>
            ) : null}

            {selectedSports.includes('baseball') || formData.numberOfCages ? (
              <div className="space-y-2">
                <Label htmlFor="cages">Number of Batting Cages/Tunnels</Label>
                <Input
                  id="cages"
                  type="number"
                  placeholder="e.g., 6"
                  value={formData.numberOfCages}
                  onChange={(e) => handleInputChange('numberOfCages', e.target.value)}
                />
              </div>
            ) : null}

            {/* Show a generic playing areas input if no specific sport fields are shown */}
            {!formData.numberOfCourts && !formData.numberOfFields && !formData.numberOfCages && selectedSports.length === 0 && (
              <div className="space-y-2">
                <Label htmlFor="playingAreas">Number of Playing Areas</Label>
                <Input
                  id="playingAreas"
                  type="number"
                  placeholder="e.g., 4"
                  value={formData.numberOfCourts || formData.numberOfFields || formData.numberOfCages}
                  onChange={(e) => handleInputChange('numberOfCourts', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-accent" />
            Amenities & Features
          </CardTitle>
          <CardDescription>Select additional features for your facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AMENITIES.map((amenity) => (
              <div
                key={amenity.id}
                className={`border rounded-lg p-3 cursor-pointer transition-smooth hover:shadow-custom-sm ${
                  formData.amenities.includes(amenity.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAmenityToggle(amenity.id)}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity.id)}
                    readOnly
                    className="w-4 h-4 text-primary"
                  />
                  <Label className="text-sm font-medium cursor-pointer">
                    {amenity.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          variant="hero" 
          onClick={onNext}
          disabled={!isValid}
        >
          Continue to Equipment
        </Button>
      </div>
    </div>
  );
};

export default FacilityPlan;