import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import BureaucracyTimeline from "@/components/BureaucracyTimeline";
import CitySelector from "@/components/CitySelector";

const ArrivalItaly = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-secondary/20 w-full">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-secondary/10 rounded-xl">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Phase 2: Arrival in Italy</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Essential bureaucracy steps - complete within 1-4 weeks</p>
              </div>
            </div>
            
            <CitySelector />
            <BureaucracyTimeline />
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ArrivalItaly;
