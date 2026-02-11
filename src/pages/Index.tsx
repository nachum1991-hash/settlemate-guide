import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, MapPin, Users } from "lucide-react";
import PhaseCard from "@/components/PhaseCard";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { IntroVideoModal } from "@/components/IntroVideoModal";
import jsPDF from 'jspdf';
import { toast } from "sonner";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleStartJourney = () => {
    navigate('/home-country');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SettleMate - Complete Relocation Checklist', 20, 20);
    
    // Phase 1
    doc.setFontSize(16);
    doc.text('Phase 1: From Home Country', 20, 40);
    doc.setFontSize(12);
    const phase1Items = [
      '[] Complete visa application',
      '[] Book flights',
      '[] Translate documents',
      '[] Arrange airport pickup',
      '[] Prepare emergency contacts'
    ];
    phase1Items.forEach((item, i) => {
      doc.text(item, 25, 50 + (i * 7));
    });

    // Phase 2
    doc.setFontSize(16);
    doc.text('Phase 2: Arrival in Italy', 20, 100);
    doc.setFontSize(12);
    const phase2Items = [
      '[] Get Codice Fiscale',
      '[] Purchase SIM card',
      '[] Get ATM Metro card',
      '[] Apply for Residence Permit',
      '[] Open bank account'
    ];
    phase2Items.forEach((item, i) => {
      doc.text(item, 25, 110 + (i * 7));
    });

    // Phase 3
    doc.setFontSize(16);
    doc.text('Phase 3: Social Integration', 20, 160);
    doc.setFontSize(12);
    const phase3Items = [
      '[] Join student groups',
      '[] Find a buddy',
      '[] Attend orientation events',
      '[] Explore local community'
    ];
    phase3Items.forEach((item, i) => {
      doc.text(item, 25, 170 + (i * 7));
    });

    doc.save('settlemate-checklist.pdf');
    toast.success('Checklist downloaded successfully!');
  };

  const handlePhaseClick = (phaseId: number) => {
    switch (phaseId) {
      case 1:
        navigate('/home-country');
        break;
      case 2:
        navigate('/arrival-italy');
        break;
      case 3:
        navigate('/social-integration');
        break;
    }
  };

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
      status: "active"
    },
    {
      id: 3,
      title: "Social Integration",
      icon: Users,
      description: "Build your community and settle into Italian life",
      color: "accent",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
              <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 shadow-elevated hover:scale-105 transition-transform w-full sm:w-auto" onClick={handleStartJourney}>
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto" onClick={() => setVideoModalOpen(true)}>
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
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isActive={false}
                onClick={() => handlePhaseClick(phase.id)}
                delay={index * 100}
              />
            ))}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-elevated hover:scale-105 transition-transform w-full sm:w-auto px-8" onClick={handleStartJourney}>
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" onClick={generatePDF}>
              Download PDF Checklist
            </Button>
          </div>
        </div>
      </section>

      <IntroVideoModal open={videoModalOpen} onOpenChange={setVideoModalOpen} />
    </div>
  );
};

export default Index;
