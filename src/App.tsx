import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CityProvider } from "@/contexts/CityContext";
import { InstallPrompt } from "@/components/InstallPrompt";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import VisaWizard from "./pages/VisaWizard";
import PreDepartureChecklist from "./pages/PreDepartureChecklist";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import HomeCountry from "./pages/HomeCountry";
import ArrivalItaly from "./pages/ArrivalItaly";
import SocialIntegration from "./pages/SocialIntegration";
import Install from "./pages/Install";
import Onboarding from "./pages/Onboarding";
import OnboardingGate from "./components/OnboardingGate";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public marketing landing — redirects authed users to /dashboard */}
              <Route path="/" element={<Landing />} />

              {/* Public pages */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/install" element={<Install />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />

              {/* Authed-only */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<OnboardingGate><Index /></OnboardingGate>} />
              <Route path="/home-country" element={<OnboardingGate><HomeCountry /></OnboardingGate>} />
              <Route path="/arrival-italy" element={<OnboardingGate><ArrivalItaly /></OnboardingGate>} />
              <Route path="/social-integration" element={<OnboardingGate><SocialIntegration /></OnboardingGate>} />
              <Route path="/visa-wizard" element={<OnboardingGate><VisaWizard /></OnboardingGate>} />
              <Route path="/pre-departure" element={<OnboardingGate><PreDepartureChecklist /></OnboardingGate>} />
              <Route path="/verify" element={<OnboardingGate><Verify /></OnboardingGate>} />

              {/* Admin-only */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <InstallPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </CityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
