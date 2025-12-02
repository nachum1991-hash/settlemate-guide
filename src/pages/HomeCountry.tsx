import { Link } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, CheckCircle2, Circle } from "lucide-react";
import { IntroVideoModal } from "@/components/IntroVideoModal";

const HomeCountry = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Phase 1: From Home Country</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Complete these steps before you leave</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link to="/visa-wizard">
                <ChecklistItem completed title="Visa Application Wizard" description="Step-by-step guidance for Italian D-Visa process" />
              </Link>
              <Link to="/pre-departure">
                <ChecklistItem title="Pre-Departure Checklist" description="Book flights, translate documents, prepare essentials" />
              </Link>
              <div onClick={() => setVideoModalOpen(true)} className="cursor-pointer">
                <ChecklistItem title="Watch Orientation Video" description="Learn what to expect when you arrive in Italy" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Link to="/visa-wizard" className="w-full">
                <Button className="w-full" size="lg" variant="default">
                  Start Visa Application
                </Button>
              </Link>
              <Link to="/pre-departure" className="w-full">
                <Button className="w-full" size="lg" variant="outline">
                  View Checklist
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <IntroVideoModal open={videoModalOpen} onOpenChange={setVideoModalOpen} />
    </div>
  );
};

const ChecklistItem = ({ 
  title, 
  description, 
  completed = false 
}: { 
  title: string; 
  description: string; 
  completed?: boolean;
}) => (
  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer min-h-[44px]">
    <div className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0">
      {completed ? (
        <CheckCircle2 className="w-6 h-6 sm:w-6 sm:h-6 text-success flex-shrink-0" />
      ) : (
        <Circle className="w-6 h-6 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default HomeCountry;
