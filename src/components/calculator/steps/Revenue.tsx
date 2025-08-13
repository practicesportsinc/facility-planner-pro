import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Trophy, Calendar } from "lucide-react";

interface RevenueProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const Revenue = ({ data, onUpdate, onNext, onPrevious, allData }: RevenueProps) => {
  const selectedSports = allData[1]?.selectedSports || [];
  const businessModel = allData[1]?.businessModel || '';

  const [formData, setFormData] = useState({
    // Memberships
    membershipBasic: data.membershipBasic || '89',
    membershipBasicCount: data.membershipBasicCount || '150',
    membershipPremium: data.membershipPremium || '149',
    membershipPremiumCount: data.membershipPremiumCount || '100',
    membershipFamily: data.membershipFamily || '199',
    membershipFamilyCount: data.membershipFamilyCount || '75',
    
    // Court/Field Rentals
    courtRentalRate: data.courtRentalRate || '60',
    courtUtilization: data.courtUtilization || '65',
    fieldRentalRate: data.fieldRentalRate || '100',
    fieldUtilization: data.fieldUtilization || '70',
    
    // Lessons & Training
    privateLessonRate: data.privateLessonRate || '75',
    privateLessonsPerWeek: data.privateLessonsPerWeek || '40',
    groupLessonRate: data.groupLessonRate || '25',
    groupLessonsPerWeek: data.groupLessonsPerWeek || '60',
    
    // Camps & Clinics
    summerCampWeeks: data.summerCampWeeks || '8',
    summerCampPrice: data.summerCampPrice || '225',
    summerCampCapacity: data.summerCampCapacity || '40',
    clinicsPerMonth: data.clinicsPerMonth || '6',
    clinicPrice: data.clinicPrice || '45',
    clinicCapacity: data.clinicCapacity || '15',
    
    // Leagues & Tournaments
    leaguesPerSeason: data.leaguesPerSeason || '4',
    leagueEntryFee: data.leagueEntryFee || '125',
    leagueTeams: data.leagueTeams || '12',
    tournamentsPerYear: data.tournamentsPerYear || '6',
    tournamentEntryFee: data.tournamentEntryFee || '85',
    tournamentTeams: data.tournamentTeams || '20',
    
    // Parties & Events
    partiesPerMonth: data.partiesPerMonth || '8',
    partyRate: data.partyRate || '350',
    corporateEventsPerMonth: data.corporateEventsPerMonth || '2',
    corporateEventRate: data.corporateEventRate || '750',
    
    // Pro Shop
    proShopMonthlyRevenue: data.proShopMonthlyRevenue || '1500',
    
    // Concessions
    concessionsPerMember: data.concessionsPerMember || '8',
    
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Calculate monthly revenue
  const monthlyMemberships = 
    (Number(formData.membershipBasic) * Number(formData.membershipBasicCount)) +
    (Number(formData.membershipPremium) * Number(formData.membershipPremiumCount)) +
    (Number(formData.membershipFamily) * Number(formData.membershipFamilyCount));

  const monthlyRentals = 
    (Number(formData.courtRentalRate) * Number(formData.courtUtilization) * 30 / 100) +
    (Number(formData.fieldRentalRate) * Number(formData.fieldUtilization) * 30 / 100);

  const monthlyLessons = 
    (Number(formData.privateLessonRate) * Number(formData.privateLessonsPerWeek) * 4.33) +
    (Number(formData.groupLessonRate) * Number(formData.groupLessonsPerWeek) * 4.33);

  const monthlyCamps = 
    (Number(formData.summerCampWeeks) * Number(formData.summerCampPrice) * Number(formData.summerCampCapacity) / 12) +
    (Number(formData.clinicsPerMonth) * Number(formData.clinicPrice) * Number(formData.clinicCapacity));

  const monthlyLeagues = 
    (Number(formData.leaguesPerSeason) * Number(formData.leagueEntryFee) * Number(formData.leagueTeams) / 12) +
    (Number(formData.tournamentsPerYear) * Number(formData.tournamentEntryFee) * Number(formData.tournamentTeams) / 12);

  const monthlyEvents = 
    (Number(formData.partiesPerMonth) * Number(formData.partyRate)) +
    (Number(formData.corporateEventsPerMonth) * Number(formData.corporateEventRate));

  const monthlyRetail = 
    Number(formData.proShopMonthlyRevenue) +
    (Number(formData.concessionsPerMember) * (Number(formData.membershipBasicCount) + Number(formData.membershipPremiumCount) + Number(formData.membershipFamilyCount)));

  const totalMonthlyRevenue = monthlyMemberships + monthlyRentals + monthlyLessons + monthlyCamps + monthlyLeagues + monthlyEvents + monthlyRetail;
  const annualRevenue = totalMonthlyRevenue * 12;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Revenue Programs</h2>
        <p className="text-muted-foreground">
          Define your revenue streams and pricing strategy
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Memberships */}
          {(businessModel === 'membership' || businessModel === 'mixed') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Membership Programs
                </CardTitle>
                <CardDescription>Monthly membership pricing and member counts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Basic Membership</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={formData.membershipBasic}
                        onChange={(e) => handleInputChange('membershipBasic', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Members"
                        value={formData.membershipBasicCount}
                        onChange={(e) => handleInputChange('membershipBasicCount', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Premium Membership</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={formData.membershipPremium}
                        onChange={(e) => handleInputChange('membershipPremium', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Members"
                        value={formData.membershipPremiumCount}
                        onChange={(e) => handleInputChange('membershipPremiumCount', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Family Membership</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={formData.membershipFamily}
                        onChange={(e) => handleInputChange('membershipFamily', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Members"
                        value={formData.membershipFamilyCount}
                        onChange={(e) => handleInputChange('membershipFamilyCount', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rentals */}
          {(businessModel === 'rental' || businessModel === 'mixed') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-secondary" />
                  Court & Field Rentals
                </CardTitle>
                <CardDescription>Hourly rental rates and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courtRate">Court Rental Rate/Hour</Label>
                    <Input
                      id="courtRate"
                      type="number"
                      value={formData.courtRentalRate}
                      onChange={(e) => handleInputChange('courtRentalRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courtUtil">Court Utilization %</Label>
                    <Select value={formData.courtUtilization} onValueChange={(value) => handleInputChange('courtUtilization', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">40% - Conservative</SelectItem>
                        <SelectItem value="55">55% - Moderate</SelectItem>
                        <SelectItem value="65">65% - Good</SelectItem>
                        <SelectItem value="75">75% - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedSports.some((sport: string) => ['soccer', 'football', 'lacrosse'].includes(sport)) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldRate">Field Rental Rate/Hour</Label>
                      <Input
                        id="fieldRate"
                        type="number"
                        value={formData.fieldRentalRate}
                        onChange={(e) => handleInputChange('fieldRentalRate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fieldUtil">Field Utilization %</Label>
                      <Select value={formData.fieldUtilization} onValueChange={(value) => handleInputChange('fieldUtilization', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50% - Conservative</SelectItem>
                          <SelectItem value="60">60% - Moderate</SelectItem>
                          <SelectItem value="70">70% - Good</SelectItem>
                          <SelectItem value="80">80% - Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lessons */}
          {(businessModel === 'training' || businessModel === 'mixed') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-accent" />
                  Lessons & Training
                </CardTitle>
                <CardDescription>Private and group lesson programs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="privateRate">Private Lesson Rate</Label>
                    <Input
                      id="privateRate"
                      type="number"
                      value={formData.privateLessonRate}
                      onChange={(e) => handleInputChange('privateLessonRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privateWeek">Private Lessons/Week</Label>
                    <Input
                      id="privateWeek"
                      type="number"
                      value={formData.privateLessonsPerWeek}
                      onChange={(e) => handleInputChange('privateLessonsPerWeek', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupRate">Group Lesson Rate</Label>
                    <Input
                      id="groupRate"
                      type="number"
                      value={formData.groupLessonRate}
                      onChange={(e) => handleInputChange('groupLessonRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupWeek">Group Lessons/Week</Label>
                    <Input
                      id="groupWeek"
                      type="number"
                      value={formData.groupLessonsPerWeek}
                      onChange={(e) => handleInputChange('groupLessonsPerWeek', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camps & Clinics */}
          <Card>
            <CardHeader>
              <CardTitle>Camps & Clinics</CardTitle>
              <CardDescription>Seasonal camps and skill clinics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campWeeks">Summer Camp Weeks</Label>
                  <Input
                    id="campWeeks"
                    type="number"
                    value={formData.summerCampWeeks}
                    onChange={(e) => handleInputChange('summerCampWeeks', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campPrice">Price per Week</Label>
                  <Input
                    id="campPrice"
                    type="number"
                    value={formData.summerCampPrice}
                    onChange={(e) => handleInputChange('summerCampPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campCapacity">Weekly Capacity</Label>
                  <Input
                    id="campCapacity"
                    type="number"
                    value={formData.summerCampCapacity}
                    onChange={(e) => handleInputChange('summerCampCapacity', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicsMonth">Clinics per Month</Label>
                  <Input
                    id="clinicsMonth"
                    type="number"
                    value={formData.clinicsPerMonth}
                    onChange={(e) => handleInputChange('clinicsPerMonth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicPrice">Clinic Price</Label>
                  <Input
                    id="clinicPrice"
                    type="number"
                    value={formData.clinicPrice}
                    onChange={(e) => handleInputChange('clinicPrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicCapacity">Clinic Capacity</Label>
                  <Input
                    id="clinicCapacity"
                    type="number"
                    value={formData.clinicCapacity}
                    onChange={(e) => handleInputChange('clinicCapacity', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leagues & Events */}
          <Card>
            <CardHeader>
              <CardTitle>Leagues & Tournaments</CardTitle>
              <CardDescription>Competitive leagues and tournament events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaguesSeason">Leagues per Season</Label>
                  <Input
                    id="leaguesSeason"
                    type="number"
                    value={formData.leaguesPerSeason}
                    onChange={(e) => handleInputChange('leaguesPerSeason', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leagueEntry">League Entry Fee</Label>
                  <Input
                    id="leagueEntry"
                    type="number"
                    value={formData.leagueEntryFee}
                    onChange={(e) => handleInputChange('leagueEntryFee', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leagueTeams">Teams per League</Label>
                  <Input
                    id="leagueTeams"
                    type="number"
                    value={formData.leagueTeams}
                    onChange={(e) => handleInputChange('leagueTeams', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tournamentsYear">Tournaments per Year</Label>
                  <Input
                    id="tournamentsYear"
                    type="number"
                    value={formData.tournamentsPerYear}
                    onChange={(e) => handleInputChange('tournamentsPerYear', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournamentEntry">Tournament Entry</Label>
                  <Input
                    id="tournamentEntry"
                    type="number"
                    value={formData.tournamentEntryFee}
                    onChange={(e) => handleInputChange('tournamentEntryFee', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournamentTeams">Teams per Tournament</Label>
                  <Input
                    id="tournamentTeams"
                    type="number"
                    value={formData.tournamentTeams}
                    onChange={(e) => handleInputChange('tournamentTeams', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events & Retail */}
          <Card>
            <CardHeader>
              <CardTitle>Events & Retail</CardTitle>
              <CardDescription>Parties, corporate events, and retail sales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partiesMonth">Birthday Parties/Month</Label>
                  <Input
                    id="partiesMonth"
                    type="number"
                    value={formData.partiesPerMonth}
                    onChange={(e) => handleInputChange('partiesPerMonth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partyRate">Party Package Rate</Label>
                  <Input
                    id="partyRate"
                    type="number"
                    value={formData.partyRate}
                    onChange={(e) => handleInputChange('partyRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="corporateMonth">Corporate Events/Month</Label>
                  <Input
                    id="corporateMonth"
                    type="number"
                    value={formData.corporateEventsPerMonth}
                    onChange={(e) => handleInputChange('corporateEventsPerMonth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corporateRate">Corporate Event Rate</Label>
                  <Input
                    id="corporateRate"
                    type="number"
                    value={formData.corporateEventRate}
                    onChange={(e) => handleInputChange('corporateEventRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proShop">Pro Shop Monthly Revenue</Label>
                  <Input
                    id="proShop"
                    type="number"
                    value={formData.proShopMonthlyRevenue}
                    onChange={(e) => handleInputChange('proShopMonthlyRevenue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concessions">Concessions per Member/Month</Label>
                  <Input
                    id="concessions"
                    type="number"
                    value={formData.concessionsPerMember}
                    onChange={(e) => handleInputChange('concessionsPerMember', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memberships:</span>
                    <span>${monthlyMemberships.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rentals:</span>
                    <span>${monthlyRentals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lessons:</span>
                    <span>${monthlyLessons.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Camps:</span>
                    <span>${monthlyCamps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leagues:</span>
                    <span>${monthlyLeagues.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events:</span>
                    <span>${monthlyEvents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail:</span>
                    <span>${monthlyRetail.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Monthly Total:</span>
                    <span className="text-xl font-bold text-primary">
                      ${totalMonthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Annual Total:</span>
                    <span className="font-bold">
                      ${annualRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  💡 Consider seasonal variations and ramp-up time in your first year
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

export default Revenue;