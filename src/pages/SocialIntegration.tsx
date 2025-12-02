import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, Circle } from "lucide-react";

const SocialIntegration = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-accent/20">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-accent/10 rounded-xl">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Phase 3: Social Integration</h1>
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

export default SocialIntegration;
