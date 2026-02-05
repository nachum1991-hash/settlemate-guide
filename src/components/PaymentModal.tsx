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

const benefits = [
  'Complete arrival guide with step-by-step bureaucracy',
  'Verified service providers (SIM, banks, accommodation)',
  'City-specific community chats',
];

const PaymentModal = ({ open, onOpenChange }: PaymentModalProps) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    toast({
      title: 'Coming Soon!',
      description: 'Payment integration will be available soon.',
    });
  };

  const handleMaybeLater = () => {
    onOpenChange(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Unlock Premium Access</DialogTitle>
          <DialogDescription className="text-base">
            Get full access to your Italy settlement journey
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
          <div className="text-4xl font-bold text-primary">€20</div>
          <div className="text-muted-foreground">per year</div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="font-medium text-foreground">What you get:</p>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={handleSubscribe} size="lg" className="w-full">
            <Crown className="mr-2 h-4 w-4" />
            Subscribe Now
          </Button>
          <Button
            variant="ghost"
            onClick={handleMaybeLater}
            className="w-full text-muted-foreground"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
