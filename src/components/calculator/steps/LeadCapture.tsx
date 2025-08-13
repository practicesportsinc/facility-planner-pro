import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

interface LeadCaptureProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const LeadCapture = ({ data, onUpdate, onNext, onPrevious, allData }: LeadCaptureProps) => {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    title: data.title || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zipCode: data.zipCode || '',
    
    // Project specifics
    timeline: data.timeline || '',
    budget: data.budget || '',
    experience: data.experience || '',
    
    // Additional info
    additionalComments: data.additionalComments || '',
    hearAboutUs: data.hearAboutUs || '',
    
    // Consent
    emailConsent: data.emailConsent || false,
    phoneConsent: data.phoneConsent || false,
    marketingConsent: data.marketingConsent || false,
    
    ...data
  });

  const projectName = allData[1]?.projectName || 'Sports Facility Project';

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleSubmit = () => {
    // Here we would typically send the data to a backend
    console.log('Lead data:', { ...allData, leadCapture: formData });
    onNext();
  };

  const isValid = formData.firstName && formData.lastName && formData.email && 
                 formData.phone && formData.emailConsent;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Almost There!</h2>
        <p className="text-muted-foreground">
          Provide your contact information to receive your detailed facility analysis and connect with our experts
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="ABC Sports LLC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title/Role</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Owner, Manager, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-secondary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Anytown"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Help us understand your project better</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Timeline</Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (0-6 months)</SelectItem>
                        <SelectItem value="short">Short-term (6-12 months)</SelectItem>
                        <SelectItem value="medium">Medium-term (1-2 years)</SelectItem>
                        <SelectItem value="long">Long-term (2+ years)</SelectItem>
                        <SelectItem value="research">Research phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Investment Budget Range</Label>
                    <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500k">Under $500K</SelectItem>
                        <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                        <SelectItem value="2m-5m">$2M - $5M</SelectItem>
                        <SelectItem value="over-5m">Over $5M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sports Business Experience</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-time">First-time facility owner</SelectItem>
                      <SelectItem value="sports-background">Sports background, new to business</SelectItem>
                      <SelectItem value="business-background">Business background, new to sports</SelectItem>
                      <SelectItem value="experienced">Experienced facility owner</SelectItem>
                      <SelectItem value="consultant">Industry consultant/advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
                  <Select value={formData.hearAboutUs} onValueChange={(value) => handleInputChange('hearAboutUs', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google search</SelectItem>
                      <SelectItem value="referral">Referral from colleague</SelectItem>
                      <SelectItem value="social-media">Social media</SelectItem>
                      <SelectItem value="industry-event">Industry event/conference</SelectItem>
                      <SelectItem value="existing-customer">Existing PracticeSports customer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-accent" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="comments">Questions or additional details about your project</Label>
                  <Textarea
                    id="comments"
                    value={formData.additionalComments}
                    onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                    placeholder="Tell us more about your specific needs, challenges, or questions..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Consent */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>How would you like us to contact you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="emailConsent"
                    checked={formData.emailConsent}
                    onCheckedChange={(checked) => handleInputChange('emailConsent', checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="emailConsent" className="font-medium">
                      Email Communication *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Yes, I want to receive my facility analysis report and follow-up information via email.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="phoneConsent"
                    checked={formData.phoneConsent}
                    onCheckedChange={(checked) => handleInputChange('phoneConsent', checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="phoneConsent" className="font-medium">
                      Phone Communication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      I'm open to a phone consultation with a PracticeSports facility expert.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="marketingConsent" className="font-medium">
                      Marketing Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      I'd like to receive occasional updates about industry trends, new tools, and facility success stories.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  By providing your information, you agree to our Privacy Policy and Terms of Service. 
                  You can unsubscribe at any time.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Instant Report</h3>
                      <p className="text-sm text-muted-foreground">
                        Get your detailed facility analysis immediately
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Expert Review</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews your project within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Consultation</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule a free consultation to discuss your specific needs
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h3 className="font-medium mb-2">Your Project Summary</h3>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Project:</span> {projectName}</div>
                      <div><span className="font-medium">Sports:</span> {allData[1]?.selectedSports?.join(', ') || 'Not specified'}</div>
                      <div><span className="font-medium">Location:</span> {allData[1]?.location || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button 
            variant="hero" 
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Get My Facility Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadCapture;