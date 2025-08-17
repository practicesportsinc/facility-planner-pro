import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { X, Mail, Phone, MapPin, Calendar } from "lucide-react";

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
  const [formData, setFormData] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    city: defaultCity,
    state: defaultState,
    outreach: 'supplier_outreach'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof LeadData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Lead submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.name.trim() && formData.email.trim();

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          />
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
          />
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
              />
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
              />
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
        >
          No thanks, keep exploring
        </Button>
      </div>
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