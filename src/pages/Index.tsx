import { useState } from "react";
import { Plane, MapPin, Users, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PhaseCard from "@/components/PhaseCard";
import BureaucracyTimeline from "@/components/BureaucracyTimeline";
import { Link } from "react-router-dom";

const Index = () => {
  const [currentPhase, setCurrentPhase] = useState<number>(1);

  const phases = [
    {
      id: 1,
      title: "From Home Country",
      icon: Plane,
      description: "Prepare your visa and documents before departure",
      color: "primary",
      status: "active"
    },
    {
      id: 2,
      title: "Arrival in Italy",
      icon: MapPin,
      description: "Complete essential bureaucracy within 1-4 weeks",
      color: "secondary",
      status: "locked"
    },
    {
      id: 3,
      title: "Social Integration",
      icon: Users,
      description: "Build your community and settle into Italian life",
      color: "accent",
      status: "locked"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent py-12 sm:py-16 md:py-20 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight px-2">
              Welcome to SettleMate
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed px-4">
              Your personal guide through every step of relocating to Italy as an international student
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8 px-4">
              <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 shadow-elevated hover:scale-105 transition-transform w-full sm:w-auto">
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">
                Watch Introduction
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Navigation */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Your Relocation Journey
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Follow this roadmap to navigate your move to Italy with confidence
            </p>
          </div>

          {/* Phase Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isActive={currentPhase === phase.id}
                onClick={() => setCurrentPhase(phase.id)}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Phase Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {currentPhase === 1 && (
              <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-primary/20">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                    <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Phase 1: From Home Country</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Complete these steps before you leave</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Link to="/visa-wizard">
                    <ChecklistItem completed title="Visa Application Wizard" description="Step-by-step guidance for Italian D-Visa process" />
                  </Link>
                  <ChecklistItem title="Pre-Departure Checklist" description="Book flights, translate documents, prepare essentials" />
                  <ChecklistItem title="Watch Orientation Video" description="Learn what to expect when you arrive in Italy" />
                </div>

                <Link to="/visa-wizard">
                  <Button className="w-full mt-6" size="lg">
                    Start Visa Application
                  </Button>
                </Link>
              </Card>
            )}

            {currentPhase === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-secondary/20">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-secondary/10 rounded-xl">
                      <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Phase 2: Arrival in Italy</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">Essential bureaucracy steps - complete within 1-4 weeks</p>
                    </div>
                  </div>
                  
                  <BureaucracyTimeline />
                </Card>
              </div>
            )}

            {currentPhase === 3 && (
              <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-accent/20">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-accent/10 rounded-xl">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Phase 3: Social Integration</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Build your community and feel at home</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <ChecklistItem title="Join Telegram/WhatsApp Groups" description="Connect with students from your university and country" />
                  <ChecklistItem title="Find a Buddy" description="Match with someone who shares your interests" />
                  <ChecklistItem title="Explore Local Events" description="Discover ESN activities, student clubs, and cultural events" />
                </div>

                <Button className="w-full mt-6" size="lg">
                  Explore Community
                </Button>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
            Create your personalized timeline and never miss a deadline
          </p>
          <Button size="lg" className="shadow-elevated hover:scale-105 transition-transform w-full sm:w-auto px-8">
            Create Free Account
          </Button>
        </div>
      </section>
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

export default Index;
