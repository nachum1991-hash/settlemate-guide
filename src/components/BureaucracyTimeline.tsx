import { useState, useMemo } from "react";
import { 
  FileText, 
  Fingerprint, 
  ChevronRight,
  CheckCircle2,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BureaucracyDetail from "./BureaucracyDetail";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useCity } from "@/contexts/CityContext";
import { cityData } from "@/data/cityData";
import jsPDF from 'jspdf';

export interface OfficialResource {
  name: string;
  url: string;
  description: string;
}

export interface Partner {
  name: string;
  url: string;
  description: string;
  category: string;
}

export interface StepDetails {
  location: string;
  documents: string[];
  process: string[];
  cost: string;
  tips: string;
  officialResources: OfficialResource[];
  partners: Partner[];
}

export interface Step {
  id: string;
  title: string;
  icon: typeof FileText;
  color: string;
  duration: string;
  description: string;
  details: StepDetails;
}

// Steps are now generated dynamically inside the component based on selected city

const BureaucracyTimeline = () => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const { progress, toggleProgress, getCompletionPercentage, loading } = useUserProgress('phase-2');
  const { selectedCity, cityInfo } = useCity();
  const currentCityData = cityData[selectedCity];

  // Generate city-specific steps
  const steps: Step[] = useMemo(() => [
    {
      id: "codice",
      title: "Codice Fiscale",
      icon: FileText,
      color: "primary",
      duration: "1-2 days",
      description: "Get your Italian tax code - required for everything",
      details: {
        location: `Agenzia delle Entrate - ${currentCityData.agenziaEntrate.address}`,
        documents: ["Passport", "University admission letter"],
        process: [
          `Visit ${currentCityData.agenziaEntrate.address}`,
          `Hours: ${currentCityData.agenziaEntrate.hours}`,
          "Bring passport and admission letter",
          "Fill out simple form",
          "Receive printed tax code immediately or within 1-2 days"
        ],
        cost: "Free",
        tips: "Go early in the morning to avoid queues. You can also get it at CAF offices.",
        officialResources: [
          {
            name: "Agenzia delle Entrate",
            url: "https://www.agenziaentrate.gov.it/portale/web/guest/servizi/istanze-e-richieste/richiesta-di-attribuzione-del-codice-fiscale",
            description: "Official tax agency - apply online or find office locations"
          },
          {
            name: "Find Nearest Office",
            url: "https://www.agenziaentrate.gov.it/portale/web/guest/contatta/assistenza-fiscale/cerca-un-ufficio",
            description: "Locate the nearest Agenzia delle Entrate office"
          }
        ],
        partners: [
          {
            name: "CAF ACLI",
            url: "https://www.caf.acli.it/",
            description: "Tax assistance center - can help with Codice Fiscale",
            category: "Tax Assistance"
          },
          {
            name: "Patronato INCA",
            url: "https://www.inca.it/",
            description: "Free assistance for immigrants",
            category: "Support Services"
          }
        ]
      }
    },
    {
      id: "permesso",
      title: "Residence Permit",
      icon: Fingerprint,
      color: "accent",
      duration: "2-4 weeks",
      description: "Essential permit - start this within 8 days of arrival",
      details: {
        location: `Poste Italiane (Sportello Amico) → ${currentCityData.questura.name}`,
        documents: [
          "Modulo 1 (filled in black ink)",
          "Passport copies (data page, visa, entry stamp)",
          "Codice Fiscale copy",
          "University admission certificate",
          "Health insurance proof",
          "Rental contract or Cessione di fabbricato",
          "4 passport photos",
          "€16 marca da bollo (revenue stamp)"
        ],
        process: [
          "Buy Yellow Kit at post office",
          "Pay: €70.46 (permit card) + €31 (postal) + €16 (marca) + €30 (service fee)",
          "Submit kit at Sportello Amico - receive barcode receipt",
          "Wait for Questura appointment (via SMS)",
          `Attend fingerprinting at ${currentCityData.questura.address}`,
          "Track status at portaleimmigrazione.it"
        ],
        cost: "€147.46 total",
        tips: "Start immediately - you must apply within 8 days! Bring copies of everything.",
        officialResources: [
          {
            name: "Portale Immigrazione",
            url: "https://www.portaleimmigrazione.it/",
            description: "Track your permit application status"
          },
          {
            name: "Polizia di Stato",
            url: "https://www.poliziadistato.it/articolo/10930",
            description: "Official residence permit information"
          },
          {
            name: currentCityData.questura.name,
            url: currentCityData.questura.website,
            description: `${cityInfo.name} immigration office - appointments and info`
          }
        ],
        partners: [
          {
            name: "Poste Italiane",
            url: "https://www.poste.it/sportello-amico.html",
            description: "Submit your Yellow Kit here",
            category: "Post Office"
          }
        ]
      }
    },
  ], [selectedCity, cityInfo, currentCityData]);

  const completionPercentage = getCompletionPercentage(steps.length);

  if (loading) {
    return <div className="text-center py-8">Loading your progress...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Progress indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
        <div className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
          Progress: {Object.values(progress).filter(Boolean).length}/{steps.length}
        </div>
        <div className="flex-1 w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = progress[step.id] || false;
          const isSelected = selectedStep === step.id;

          return (
            <Card
              key={step.id}
              className={cn(
                "transition-all duration-300 hover:shadow-elevated cursor-pointer",
                isSelected && "shadow-elevated border-2",
                isCompleted && "bg-success/5 border-success/30"
              )}
            >
              <div
                onClick={() => setSelectedStep(isSelected ? null : step.id)}
                className="p-3 sm:p-4 md:p-6"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Step number & icon */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2 flex-shrink-0 min-w-[44px]">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
                      isCompleted ? "bg-success text-success-foreground" : "bg-muted"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
                      <h4 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h4>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                          {step.duration}
                        </span>
                        {isSelected ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStep(null);
                            }}
                            className="w-11 h-11 min-h-[44px] min-w-[44px] lg:w-9 lg:h-9 lg:min-h-0 lg:min-w-0 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                            aria-label="Close"
                          >
                            <X className="w-5 h-5 lg:w-5 lg:h-5 text-muted-foreground" />
                          </button>
                        ) : (
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      {step.description}
                    </p>

                    {/* Expanded details */}
                    {isSelected && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <BureaucracyDetail 
                          step={step} 
                          isCompleted={isCompleted}
                          onToggleComplete={() => toggleProgress(step.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="pt-3 sm:pt-4">
        <Button className="w-full text-sm sm:text-base" size="lg" onClick={() => {
          const doc = new jsPDF();
          doc.setFontSize(20);
          doc.text('Phase 2: Arrival Checklist', 20, 20);
          steps.forEach((step, i) => {
            doc.setFontSize(14);
            doc.text(`${i + 1}. ${step.title}`, 20, 40 + (i * 20));
          });
          doc.save('phase2-checklist.pdf');
        }}>
          Download Complete Checklist
        </Button>
      </div>
    </div>
  );
};

export default BureaucracyTimeline;
