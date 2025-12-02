import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import VisaWizard from "./pages/VisaWizard";
import PreDepartureChecklist from "./pages/PreDepartureChecklist";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomeCountry from "./pages/HomeCountry";
import ArrivalItaly from "./pages/ArrivalItaly";
import SocialIntegration from "./pages/SocialIntegration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home-country" element={<HomeCountry />} />
            <Route path="/arrival-italy" element={<ArrivalItaly />} />
            <Route path="/social-integration" element={<SocialIntegration />} />
            <Route path="/visa-wizard" element={<VisaWizard />} />
            <Route path="/pre-departure" element={<PreDepartureChecklist />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
