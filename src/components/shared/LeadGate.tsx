import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Mail, Phone, MapPin, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { leadSchema, checkRateLimit, recordSubmission, sanitizeLeadData, type LeadFormData } from "@/utils/leadValidation";
import { z } from "zod";

interface LeadGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: LeadData) => void;
  title?: string;
  description?: string;
  mode?: 'modal' | 'inline';
  defaultCity?: string;
  defaultState?: string;
  showOptionalFields?: boolean;
}

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  outreach: 'supplier_outreach' | 'self_research';
}

const LeadGate = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Send this to your inbox + unlock pro features",
  description = "Get your complete analysis and unlock advanced features",
  mode = 'modal',
  defaultCity = '',
  defaultState = '',
  showOptionalFields = true
}: LeadGateProps) => {
  const [formData, setFormData] = useState<LeadData & { website?: string }>({
    name: '',
    email: '',
    phone: '',
    city: defaultCity,
    state: defaultState,
    outreach: 'supplier_outreach',
    website: '' // Honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime?.toLocaleTimeString();
      toast({
        variant: "destructive",
        title: "Too many submissions",
        description: `You've reached the submission limit. Please try again after ${resetTime}.`,
      });
      return;
    }

    // Honeypot check - if website field is filled, it's likely a bot
    if (formData.website && formData.website.trim() !== '') {
      console.log('Bot detected via honeypot field');
      // Silently reject without feedback to bot
      onClose();
      return;
    }

    // Validate form data
    try {
      const validatedData = leadSchema.parse({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        business_name: '', // Not collected in LeadGate
        city: formData.city,
        state: formData.state,
        website: formData.website,
      });

      // Sanitize data
      const sanitized = sanitizeLeadData(validatedData);

      setIsSubmitting(true);
      
      try {
        // Record submission for rate limiting
        recordSubmission();
        
        // Submit with sanitized data
        await onSubmit({
          name: sanitized.name,
          email: sanitized.email,
          phone: sanitized.phone,
          city: sanitized.city,
          state: sanitized.state,
          outreach: formData.outreach,
        });

        const remaining = rateLimit.remainingSubmissions;
        if (remaining <= 1) {
          toast({
            title: "Submission recorded",
            description: `You have ${remaining} submission${remaining !== 1 ? 's' : ''} remaining in the next hour.`,
          });
        }

        onClose();
      } catch (error) {
        console.error('Lead submission failed:', error);
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: "There was an error submitting your information. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });
        setValidationErrors(errors);
        
        toast({
          variant: "destructive",
          title: "Validation error",
          description: "Please check your input and try again.",
        });
      }
      setIsSubmitting(false);
    }
  };

  const isValid = formData.name.trim() && formData.email.trim();

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="text"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your full name"
            required
            className={validationErrors.name ? 'border-destructive' : ''}
          />
          {validationErrors.name && (
            <p className="text-sm text-destructive">{validationErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            required
            className={validationErrors.email ? 'border-destructive' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-destructive">{validationErrors.email}</p>
          )}
        </div>
      </div>

      {showOptionalFields && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={validationErrors.phone ? 'border-destructive' : ''}
              />
              {validationErrors.phone && (
                <p className="text-sm text-destructive">{validationErrors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
                className={validationErrors.city ? 'border-destructive' : ''}
              />
              {validationErrors.city && (
                <p className="text-sm text-destructive">{validationErrors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                State
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
                className={validationErrors.state ? 'border-destructive' : ''}
              />
              {validationErrors.state && (
                <p className="text-sm text-destructive">{validationErrors.state}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="outreach" className="font-medium">Supplier Outreach</Label>
              <p className="text-sm text-muted-foreground">
                {formData.outreach === 'supplier_outreach' 
                  ? 'We can connect you with equipment suppliers' 
                  : 'I prefer to research suppliers myself'
                }
              </p>
            </div>
            <Switch
              id="outreach"
              checked={formData.outreach === 'supplier_outreach'}
              onCheckedChange={(checked) => 
                handleInputChange('outreach', checked ? 'supplier_outreach' : 'self_research')
              }
            />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="ps-btn primary flex-1"
        >
          {isSubmitting ? 'Sending...' : 'Email me this plan'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="flex-1"
          disabled={isSubmitting}
        >
          No thanks, keep exploring
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Your information is secure and will only be used to provide you with facility planning resources. 
          We respect your privacy and will never sell your data.
        </AlertDescription>
      </Alert>
    </form>
  );

  if (mode === 'inline') {
    return (
      <Card className="ps-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="px-6 pb-6">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadGate;