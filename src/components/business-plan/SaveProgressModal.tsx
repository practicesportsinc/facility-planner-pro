import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2, CheckCircle2, Mail } from 'lucide-react';

interface SaveProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (email: string, name: string) => Promise<void>;
  defaultEmail?: string;
  defaultName?: string;
}

export default function SaveProgressModal({
  isOpen,
  onClose,
  onSave,
  defaultEmail = '',
  defaultName = '',
}: SaveProgressModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await onSave(email, name);
      setIsSaved(true);
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
        setIsSaved(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setIsSaved(false);
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSaved ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Save className="w-5 h-5 text-primary" />
                Save Your Progress
              </DialogTitle>
              <DialogDescription>
                Enter your email to receive a link that lets you return and continue where you left off.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Send Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="mb-2">Progress Saved!</DialogTitle>
            <DialogDescription className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Check your email for the resume link
            </DialogDescription>
            <p className="text-xs text-muted-foreground mt-4">
              The link expires in 30 days
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
