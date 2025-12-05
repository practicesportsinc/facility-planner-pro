import React, { useState } from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Users, TrendingUp, DollarSign, Baby, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CUSTOMER_SEGMENTS = [
  { id: 'travel_teams', label: 'Travel Teams', description: 'Competitive youth teams' },
  { id: 'individual_athletes', label: 'Individual Athletes', description: 'Personal training clients' },
  { id: 'recreational_youth', label: 'Recreational Youth', description: 'Casual youth players' },
  { id: 'high_school', label: 'High School', description: 'HS teams and players' },
  { id: 'adult_recreational', label: 'Adult Recreational', description: 'Adult leagues and training' },
  { id: 'birthday_parties', label: 'Birthday Parties', description: 'Event hosting' },
  { id: 'camps_clinics', label: 'Camps & Clinics', description: 'Seasonal programs' },
  { id: 'corporate_events', label: 'Corporate Events', description: 'Team building events' },
];

export default function MarketAnalysisStep() {
  const { data, updateData } = useBusinessPlan();
  const { marketAnalysis, projectOverview } = data;
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSegmentToggle = (segmentId: string) => {
    const current = marketAnalysis.customerSegments;
    const updated = current.includes(segmentId)
      ? current.filter(s => s !== segmentId)
      : [...current, segmentId];
    updateData('marketAnalysis', { customerSegments: updated });
  };

  const analyzeLocation = async () => {
    if (!projectOverview.zipCode && !projectOverview.city) {
      toast.error('Please enter a ZIP code or city in Step 1');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('analyze-location', {
        body: {
          zipCode: projectOverview.zipCode,
          city: projectOverview.city,
          state: projectOverview.state,
          radius: marketAnalysis.tradeAreaRadius,
        },
      });

      if (error) throw error;

      if (result) {
        updateData('marketAnalysis', {
          population10Min: result.population10Min || 0,
          population15Min: result.population15Min || 0,
          population20Min: result.population20Min || 0,
          medianHouseholdIncome: result.medianHouseholdIncome || 0,
          youthPopulation: result.youthPopulation || 0,
          familiesWithChildren: result.familiesWithChildren || 0,
          populationGrowthRate: result.populationGrowthRate || 0,
        });
        toast.success('Market data loaded successfully');
      }
    } catch (error) {
      console.error('Location analysis error:', error);
      toast.error('Could not analyze location. Using estimated data.');
      // Set estimated defaults
      updateData('marketAnalysis', {
        population10Min: 75000,
        population15Min: 150000,
        population20Min: 250000,
        medianHouseholdIncome: 85000,
        youthPopulation: 22,
        familiesWithChildren: 35,
        populationGrowthRate: 2.5,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Market & Demographics</h2>
        <p className="text-muted-foreground">Analyze your target market and customer base</p>
      </div>

      {/* Trade Area Radius */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Trade Area Radius: {marketAnalysis.tradeAreaRadius} minutes</Label>
        <Slider
          value={[marketAnalysis.tradeAreaRadius]}
          onValueChange={([v]) => updateData('marketAnalysis', { tradeAreaRadius: v })}
          min={5}
          max={30}
          step={5}
          className="max-w-md"
        />
        <p className="text-sm text-muted-foreground">Define how far customers will typically travel to your facility</p>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={analyzeLocation}
        disabled={isAnalyzing}
        className="flex items-center gap-2"
      >
        {isAnalyzing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {isAnalyzing ? 'Analyzing...' : 'Analyze Location'}
      </Button>

      {/* Demographics Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Population (10 min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketAnalysis.population10Min.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Population (15 min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketAnalysis.population15Min.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Median Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${marketAnalysis.medianHouseholdIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketAnalysis.populationGrowthRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Baby className="w-4 h-4" />
              Youth Population
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketAnalysis.youthPopulation}%
            </div>
            <div className="text-sm text-muted-foreground">Ages 5-18</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Families w/ Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketAnalysis.familiesWithChildren}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Override */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Manual Adjustments (Optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pop10" className="text-sm">Population (10 min)</Label>
            <Input
              id="pop10"
              type="number"
              value={marketAnalysis.population10Min || ''}
              onChange={(e) => updateData('marketAnalysis', { population10Min: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="income" className="text-sm">Median Income ($)</Label>
            <Input
              id="income"
              type="number"
              value={marketAnalysis.medianHouseholdIncome || ''}
              onChange={(e) => updateData('marketAnalysis', { medianHouseholdIncome: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youth" className="text-sm">Youth % (5-18)</Label>
            <Input
              id="youth"
              type="number"
              value={marketAnalysis.youthPopulation || ''}
              onChange={(e) => updateData('marketAnalysis', { youthPopulation: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="growth" className="text-sm">Growth Rate %</Label>
            <Input
              id="growth"
              type="number"
              step="0.1"
              value={marketAnalysis.populationGrowthRate || ''}
              onChange={(e) => updateData('marketAnalysis', { populationGrowthRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Target Customer Segments</Label>
        <p className="text-sm text-muted-foreground">Select all segments you plan to serve</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CUSTOMER_SEGMENTS.map((segment) => (
            <Card
              key={segment.id}
              className={`cursor-pointer transition-all ${
                marketAnalysis.customerSegments.includes(segment.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => handleSegmentToggle(segment.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={marketAnalysis.customerSegments.includes(segment.id)}
                  className="pointer-events-none"
                />
                <div>
                  <div className="font-medium text-foreground">{segment.label}</div>
                  <div className="text-sm text-muted-foreground">{segment.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
