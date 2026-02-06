import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CityProvider } from "@/contexts/CityContext";
import { InstallPrompt } from "@/components/InstallPrompt";
import Index from "./pages/Index";
import VisaWizard from "./pages/VisaWizard";
import PreDepartureChecklist from "./pages/PreDepartureChecklist";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomeCountry from "./pages/HomeCountry";
import ArrivalItaly from "./pages/ArrivalItaly";
import SocialIntegration from "./pages/SocialIntegration";
import Install from "./pages/Install";
import ProtectedRoute from "./components/ProtectedRoute";


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
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              <Route path="/home-country" element={<ProtectedRoute><HomeCountry /></ProtectedRoute>} />
              <Route path="/arrival-italy" element={<ProtectedRoute><ArrivalItaly /></ProtectedRoute>} />
              <Route path="/social-integration" element={<ProtectedRoute><SocialIntegration /></ProtectedRoute>} />
              <Route path="/visa-wizard" element={<ProtectedRoute><VisaWizard /></ProtectedRoute>} />
              <Route path="/pre-departure" element={<ProtectedRoute><PreDepartureChecklist /></ProtectedRoute>} />
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
