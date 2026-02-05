import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface PremiumRouteProps {
  children: React.ReactNode;
}

const PremiumRoute = ({ children }: PremiumRouteProps) => {
  const { user, loading } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(true);

  // For now, always show the payment modal (no premium check)
  const hasPremiumAccess = false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have premium access, show the payment modal
  if (!hasPremiumAccess) {
    return (
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={(open) => {
          setShowPaymentModal(open);
        }}
      />
    );
  }

  return <>{children}</>;
};

export default PremiumRoute;
