import { useNavigate } from 'react-router-dom';
import { Crown, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JourneyFeature {
  label: string;
  freeAccess: boolean;
}

const journeyFeatures: JourneyFeature[] = [
  // Phase 1 - Free
  { label: 'Complete visa application wizard', freeAccess: true },
  { label: 'Step-by-step document guidance', freeAccess: true },
  { label: 'Country-specific resources', freeAccess: true },
  // Phase 2 - Premium
  { label: 'Arrival guide with bureaucracy steps', freeAccess: false },
  { label: 'Verified SIM & bank providers', freeAccess: false },
  { label: 'Accommodation recommendations', freeAccess: false },
  // Phase 3 - Premium
  { label: 'University groups finder', freeAccess: false },
  { label: 'Find a Buddy matching program', freeAccess: false },
  { label: 'Events & communities calendar', freeAccess: false },
  { label: 'City-specific community chat', freeAccess: false },
];

const PaymentModal = ({ open, onOpenChange }: PaymentModalProps) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    toast({
      title: 'Coming Soon!',
      description: 'Payment integration will be available soon.',
    });
  };

  const handleStartFree = () => {
    onOpenChange(false);
    navigate('/home-country');
  };

  const handleMaybeLater = () => {
    onOpenChange(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Start Your Italy Journey</DialogTitle>
          <DialogDescription className="text-base">
            Choose the plan that fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Free Plan */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-foreground">Visa Journey</div>
              <div className="text-3xl font-bold text-foreground mt-2">€0</div>
              <div className="text-sm text-muted-foreground">Free forever</div>
            </div>

            <div className="space-y-2.5 mb-5">
              {journeyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  {feature.freeAccess ? (
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-2.5 w-2.5 text-green-600" />
                    </div>
                  ) : (
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                      <X className="h-2.5 w-2.5 text-destructive" />
                    </div>
                  )}
                  <span className={`text-sm ${feature.freeAccess ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleStartFree}
              className="w-full"
            >
              Start Free
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Recommended
              </span>
            </div>

            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-foreground">Full Access</span>
              </div>
              <div className="text-3xl font-bold text-primary mt-2">€20</div>
              <div className="text-sm text-muted-foreground">per year</div>
            </div>

            <div className="space-y-2.5 mb-5">
              {journeyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>

            <Button onClick={handleSubscribe} className="w-full">
              <Crown className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={handleMaybeLater}
            className="text-muted-foreground"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
