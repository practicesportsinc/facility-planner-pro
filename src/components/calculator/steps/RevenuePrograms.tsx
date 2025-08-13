import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Calendar, Trophy, PartyPopper, TrendingUp } from "lucide-react";

interface RevenueProgramsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData?: any;
}

const RevenuePrograms = ({ data, onUpdate, onNext, onPrevious }: RevenueProgramsProps) => {
  const [formData, setFormData] = useState({
    // Memberships
    individualPrice: data.individualPrice || '59',
    individualCount: data.individualCount || '300',
    familyPrice: data.familyPrice || '99',
    familyCount: data.familyCount || '120',
    
    // Court/Field Rentals
    rentalRate: data.rentalRate || '35',
    rentalHoursWeek: data.rentalHoursWeek || '40',
    rentalUtilization: data.rentalUtilization || '70',
    
    // Lessons
    lessonCoaches: data.lessonCoaches || '3',
    lessonRate: data.lessonRate || '70',
    lessonHoursWeek: data.lessonHoursWeek || '15',
    lessonUtilization: data.lessonUtilization || '70',
    
    // Camps/Clinics
    campsPerYear: data.campsPerYear || '12',
    campPrice: data.campPrice || '199',
    campCapacity: data.campCapacity || '30',
    campFillRate: data.campFillRate || '70',
    
    // Leagues/Tournaments
    leaguesPerYear: data.leaguesPerYear || '8',
    teamsPerLeague: data.teamsPerLeague || '12',
    teamFee: data.teamFee || '450',
    leagueMargin: data.leagueMargin || '40',
    
    // Parties/Events
    partiesPerMonth: data.partiesPerMonth || '6',
    averagePartyNet: data.averagePartyNet || '225',
    
    // Seasonality (12 months)
    jan: data.jan || '85',
    feb: data.feb || '90',
    mar: data.mar || '100',
    apr: data.apr || '110',
    may: data.may || '115',
    jun: data.jun || '120',
    jul: data.jul || '115',
    aug: data.aug || '105',
    sep: data.sep || '110',
    oct: data.oct || '105',
    nov: data.nov || '95',
    dec: data.dec || '80',
    
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Calculate monthly revenue
  const membershipRevenue = (Number(formData.individualPrice) * Number(formData.individualCount)) + 
                           (Number(formData.familyPrice) * Number(formData.familyCount));
  
  const rentalRevenue = (Number(formData.rentalRate) * Number(formData.rentalHoursWeek) * 
                        (Number(formData.rentalUtilization) / 100) * 4.33);
  
  const lessonRevenue = (Number(formData.lessonCoaches) * Number(formData.lessonRate) * 
                        Number(formData.lessonHoursWeek) * (Number(formData.lessonUtilization) / 100) * 4.33);
  
  const campRevenue = (Number(formData.campsPerYear) * Number(formData.campPrice) * 
                      Number(formData.campCapacity) * (Number(formData.campFillRate) / 100)) / 12;
  
  const leagueRevenue = (Number(formData.leaguesPerYear) * Number(formData.teamsPerLeague) * 
                        Number(formData.teamFee) * (Number(formData.leagueMargin) / 100)) / 12;
  
  const partyRevenue = Number(formData.partiesPerMonth) * Number(formData.averagePartyNet);
  
  const baseMonthlyRevenue = membershipRevenue + rentalRevenue + lessonRevenue + campRevenue + leagueRevenue + partyRevenue;

  const seasonalityAvg = (Number(formData.jan) + Number(formData.feb) + Number(formData.mar) + 
                         Number(formData.apr) + Number(formData.may) + Number(formData.jun) +
                         Number(formData.jul) + Number(formData.aug) + Number(formData.sep) +
                         Number(formData.oct) + Number(formData.nov) + Number(formData.dec)) / 12;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Revenue Programs</h2>
        <p className="text-muted-foreground">
          Configure your revenue streams and pricing
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Memberships
              </CardTitle>
              <CardDescription>Monthly membership pricing and counts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="individualPrice">Individual Monthly ($)</Label>
                  <Input
                    id="individualPrice"
                    type="number"
                    placeholder="59"
                    value={formData.individualPrice}
                    onChange={(e) => handleInputChange('individualPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="individualCount">Individual Members</Label>
                  <Input
                    id="individualCount"
                    type="number"
                    placeholder="300"
                    value={formData.individualCount}
                    onChange={(e) => handleInputChange('individualCount', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familyPrice">Family Monthly ($)</Label>
                  <Input
                    id="familyPrice"
                    type="number"
                    placeholder="99"
                    value={formData.familyPrice}
                    onChange={(e) => handleInputChange('familyPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyCount">Family Members</Label>
                  <Input
                    id="familyCount"
                    type="number"
                    placeholder="120"
                    value={formData.familyCount}
                    onChange={(e) => handleInputChange('familyCount', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Monthly Membership Revenue: ${membershipRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Court/Field Rentals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-secondary" />
                Court/Field Rentals
              </CardTitle>
              <CardDescription>Hourly rentals based on facility capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentalRate">Rate ($/hour)</Label>
                  <Input
                    id="rentalRate"
                    type="number"
                    placeholder="35"
                    value={formData.rentalRate}
                    onChange={(e) => handleInputChange('rentalRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalHoursWeek">Available Hours/Week</Label>
                  <Input
                    id="rentalHoursWeek"
                    type="number"
                    placeholder="40"
                    value={formData.rentalHoursWeek}
                    onChange={(e) => handleInputChange('rentalHoursWeek', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalUtilization">Utilization (%)</Label>
                  <Input
                    id="rentalUtilization"
                    type="number"
                    placeholder="70"
                    value={formData.rentalUtilization}
                    onChange={(e) => handleInputChange('rentalUtilization', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Monthly Rental Revenue: ${rentalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                Lessons & Instruction
              </CardTitle>
              <CardDescription>Private and group lessons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonCoaches">Coaches</Label>
                  <Input
                    id="lessonCoaches"
                    type="number"
                    placeholder="3"
                    value={formData.lessonCoaches}
                    onChange={(e) => handleInputChange('lessonCoaches', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonRate">Rate ($/hour)</Label>
                  <Input
                    id="lessonRate"
                    type="number"
                    placeholder="70"
                    value={formData.lessonRate}
                    onChange={(e) => handleInputChange('lessonRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonHoursWeek">Hours/Week</Label>
                  <Input
                    id="lessonHoursWeek"
                    type="number"
                    placeholder="15"
                    value={formData.lessonHoursWeek}
                    onChange={(e) => handleInputChange('lessonHoursWeek', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonUtilization">Utilization (%)</Label>
                  <Input
                    id="lessonUtilization"
                    type="number"
                    placeholder="70"
                    value={formData.lessonUtilization}
                    onChange={(e) => handleInputChange('lessonUtilization', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Monthly Lesson Revenue: ${lessonRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Camps & Clinics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-success" />
                Camps & Clinics
              </CardTitle>
              <CardDescription>Seasonal camps and training clinics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campsPerYear">Camps/Year</Label>
                  <Input
                    id="campsPerYear"
                    type="number"
                    placeholder="12"
                    value={formData.campsPerYear}
                    onChange={(e) => handleInputChange('campsPerYear', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campPrice">Price ($)</Label>
                  <Input
                    id="campPrice"
                    type="number"
                    placeholder="199"
                    value={formData.campPrice}
                    onChange={(e) => handleInputChange('campPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campCapacity">Capacity</Label>
                  <Input
                    id="campCapacity"
                    type="number"
                    placeholder="30"
                    value={formData.campCapacity}
                    onChange={(e) => handleInputChange('campCapacity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campFillRate">Fill Rate (%)</Label>
                  <Input
                    id="campFillRate"
                    type="number"
                    placeholder="70"
                    value={formData.campFillRate}
                    onChange={(e) => handleInputChange('campFillRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Monthly Camp Revenue: ${campRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Leagues & Tournaments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-warning" />
                Leagues & Tournaments
              </CardTitle>
              <CardDescription>Organized competitive play</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaguesPerYear">Leagues/Year</Label>
                  <Input
                    id="leaguesPerYear"
                    type="number"
                    placeholder="8"
                    value={formData.leaguesPerYear}
                    onChange={(e) => handleInputChange('leaguesPerYear', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamsPerLeague">Teams/League</Label>
                  <Input
                    id="teamsPerLeague"
                    type="number"
                    placeholder="12"
                    value={formData.teamsPerLeague}
                    onChange={(e) => handleInputChange('teamsPerLeague', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamFee">Team Fee ($)</Label>
                  <Input
                    id="teamFee"
                    type="number"
                    placeholder="450"
                    value={formData.teamFee}
                    onChange={(e) => handleInputChange('teamFee', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leagueMargin">Net Margin (%)</Label>
                  <Input
                    id="leagueMargin"
                    type="number"
                    placeholder="40"
                    value={formData.leagueMargin}
                    onChange={(e) => handleInputChange('leagueMargin', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Monthly League Revenue: ${leagueRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Parties & Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PartyPopper className="h-5 w-5 mr-2 text-info" />
                Parties & Events
              </CardTitle>
              <CardDescription>Birthday parties and special events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partiesPerMonth">Parties/Month</Label>
                  <Input
                    id="partiesPerMonth"
                    type="number"
                    placeholder="6"
                    value={formData.partiesPerMonth}
                    onChange={(e) => handleInputChange('partiesPerMonth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averagePartyNet">Average Net ($)</Label>
                  <Input
                    id="averagePartyNet"
                    type="number"
                    placeholder="225"
                    value={formData.averagePartyNet}
                    onChange={(e) => handleInputChange('averagePartyNet', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Monthly Party Revenue: ${partyRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Seasonality */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonality Factors</CardTitle>
              <CardDescription>Monthly revenue adjustments (% of base, 70-120% typical)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-6 gap-2">
                {[
                  { month: 'Jan', field: 'jan' },
                  { month: 'Feb', field: 'feb' },
                  { month: 'Mar', field: 'mar' },
                  { month: 'Apr', field: 'apr' },
                  { month: 'May', field: 'may' },
                  { month: 'Jun', field: 'jun' },
                  { month: 'Jul', field: 'jul' },
                  { month: 'Aug', field: 'aug' },
                  { month: 'Sep', field: 'sep' },
                  { month: 'Oct', field: 'oct' },
                  { month: 'Nov', field: 'nov' },
                  { month: 'Dec', field: 'dec' }
                ].map((item) => (
                  <div key={item.field} className="space-y-1">
                    <Label className="text-xs">{item.month}</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData[item.field]}
                      onChange={(e) => handleInputChange(item.field, e.target.value)}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                Average Seasonality: {seasonalityAvg.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Revenue Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memberships:</span>
                    <span>${membershipRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rentals:</span>
                    <span>${rentalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lessons:</span>
                    <span>${lessonRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Camps:</span>
                    <span>${campRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Leagues:</span>
                    <span>${leagueRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Parties:</span>
                    <span>${partyRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Base Monthly Revenue:</span>
                    <span className="text-xl font-bold text-primary">
                      ${baseMonthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Annual (before seasonality): ${(baseMonthlyRevenue * 12).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded">
                  <strong>Note:</strong> All figures are planning estimates. Actual revenue varies by market conditions, competition, and execution.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={onNext}>
          Continue to Financing
        </Button>
      </div>
    </div>
  );
};

export default RevenuePrograms;