import { useState } from "react";
import { 
  FileText, 
  Smartphone, 
  Fingerprint, 
  CreditCard, 
  Building2,
  Home,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BureaucracyDetail from "./BureaucracyDetail";
import { useUserProgress } from "@/hooks/useUserProgress";
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

const steps: Step[] = [
  {
    id: "codice",
    title: "Codice Fiscale",
    icon: FileText,
    color: "primary",
    duration: "1-2 days",
    description: "Get your Italian tax code - required for everything",
    details: {
      location: "Agenzia delle Entrate",
      documents: ["Passport", "University admission letter"],
      process: [
        "Visit local Agenzia delle Entrate office",
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
    id: "sim",
    title: "SIM Card",
    icon: Smartphone,
    color: "secondary",
    duration: "Same day",
    description: "Get connected with an Italian phone number",
    details: {
      location: "Mobile provider stores (Iliad, TIM, WindTre, Vodafone)",
      documents: ["Passport", "Codice Fiscale"],
      process: [
        "Compare providers: Iliad (€7.99/month), TIM (€9.99/month), WindTre (€8.99/month)",
        "Visit store or kiosk with documents",
        "Choose plan and activate SIM",
        "SIM activates within hours"
      ],
      cost: "€5-15 for SIM + monthly plan",
      tips: "Iliad offers great value with no contract. TIM has best coverage in rural areas.",
      officialResources: [
        {
          name: "AGCOM",
          url: "https://www.agcom.it/",
          description: "Italian telecom regulator - compare rates and coverage"
        }
      ],
      partners: [
        {
          name: "Iliad",
          url: "https://www.iliad.it/",
          description: "Best value plans from €7.99/month, no contract",
          category: "Mobile Provider"
        },
        {
          name: "TIM",
          url: "https://www.tim.it/",
          description: "Best coverage nationwide, student offers available",
          category: "Mobile Provider"
        },
        {
          name: "WindTre",
          url: "https://www.windtre.it/",
          description: "Competitive student plans, good urban coverage",
          category: "Mobile Provider"
        },
        {
          name: "Vodafone",
          url: "https://www.vodafone.it/",
          description: "Premium network, international roaming options",
          category: "Mobile Provider"
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
      location: "Poste Italiane (Sportello Amico) → Questura",
      documents: [
        "Modulo 1 (filled in black ink)",
        "Passport copies (data page, visa, entry stamp)",
        "Codice Fiscale copy",
        "Polimi admission certificate",
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
        "Attend fingerprinting with all original documents",
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
          name: "Questura di Milano",
          url: "https://questure.poliziadistato.it/Milano",
          description: "Milan immigration office - appointments and info"
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
  {
    id: "atm",
    title: "ATM Metro Card",
    icon: CreditCard,
    color: "primary",
    duration: "3-7 days",
    description: "Get student discount on Milan public transport",
    details: {
      location: "ATM website/app or ATM Points",
      documents: ["Passport photo", "Codice Fiscale", "Proof of enrollment"],
      process: [
        "Register on ATM Milano app or website",
        "Upload documents and photo",
        "Select student rate (under 27 years)",
        "Pay for annual/monthly pass",
        "Receive card by mail or pick up at ATM Point (Duomo, Centrale)"
      ],
      cost: "€200/year (under 27) or €22/month",
      tips: "Annual pass is best value. You can recharge at any metro station yellow machines.",
      officialResources: [
        {
          name: "ATM Milano",
          url: "https://www.atm.it/",
          description: "Official Milan transport - buy passes online"
        },
        {
          name: "ATM Student Pass",
          url: "https://www.atm.it/it/ViasperATM/Abbonamenti/Pagine/Under27.aspx",
          description: "Under 27 student discounts information"
        }
      ],
      partners: [
        {
          name: "ATM Point Duomo",
          url: "https://www.atm.it/it/AtmInforma/Pagine/AtmPoint.aspx",
          description: "Pick up your card in person",
          category: "Service Point"
        }
      ]
    }
  },
  {
    id: "bank",
    title: "Bank Account",
    icon: Building2,
    color: "secondary",
    duration: "1-2 weeks",
    description: "Open account for rent payments and daily expenses",
    details: {
      location: "Bank branches or online (N26, Revolut)",
      documents: [
        "Passport",
        "Codice Fiscale",
        "Proof of residence (Polimi letter or rental)",
        "Residence permit receipt"
      ],
      process: [
        "Choose: Traditional (Intesa, Unicredit) or Online (N26, Revolut)",
        "Book appointment or sign up online",
        "Bring all documents",
        "Wait for approval (faster with online banks)",
        "Activate account and receive card"
      ],
      cost: "€0-5/month depending on bank",
      tips: "N26 and Revolut are fastest. Traditional banks may require your residence permit receipt.",
      officialResources: [
        {
          name: "Bank of Italy",
          url: "https://www.bancaditalia.it/",
          description: "Italian banking regulations and consumer rights"
        }
      ],
      partners: [
        {
          name: "N26",
          url: "https://n26.com/",
          description: "Free digital bank, instant signup, no Italian required",
          category: "Digital Bank"
        },
        {
          name: "Revolut",
          url: "https://www.revolut.com/",
          description: "Multi-currency account, great for international students",
          category: "Digital Bank"
        },
        {
          name: "UniCredit",
          url: "https://www.unicredit.it/",
          description: "Major Italian bank with student accounts",
          category: "Traditional Bank"
        },
        {
          name: "Intesa Sanpaolo",
          url: "https://www.intesasanpaolo.com/",
          description: "Largest Italian bank, XME Conto under 35",
          category: "Traditional Bank"
        }
      ]
    }
  },
  {
    id: "housing",
    title: "Find Accommodation",
    icon: Home,
    color: "accent",
    duration: "1-2 weeks",
    description: "Secure permanent housing and get your rental contract",
    details: {
      location: "Online platforms (Spotahome, HousingAnywhere, Immobiliare.it) + Real estate agencies",
      documents: [
        "Passport with visa",
        "University enrollment proof",
        "Codice Fiscale",
        "Proof of financial means (bank statement or scholarship letter)"
      ],
      process: [
        "Start searching using Spotahome, HousingAnywhere, or Immobiliare.it",
        "Join Facebook groups for student housing in your city",
        "Schedule viewings for your first weeks in Italy",
        "ALWAYS visit in person before signing or paying anything",
        "Sign rental contract (contratto transitorio is common for students)",
        "Pay deposit (usually 1-3 months rent)",
        "Request Cessione di fabbricato from landlord (needed for residence permit)"
      ],
      cost: "€400-800/month (shared room), €800-1500/month (studio in Milan)",
      tips: "Never pay before visiting! Beware of scams - if it seems too good to be true, it probably is. Always get a proper contract and Cessione di fabbricato for your residence permit.",
      officialResources: [
        {
          name: "Comune di Milano Housing",
          url: "https://www.comune.milano.it/servizi/casa",
          description: "Official city housing resources and tenant rights"
        },
        {
          name: "SUNIA (Tenants Union)",
          url: "https://www.sunia.it/",
          description: "Tenant rights organization - free legal advice"
        }
      ],
      partners: [
        {
          name: "Spotahome",
          url: "https://www.spotahome.com/",
          description: "Verified listings, book online before arrival",
          category: "Housing Platform"
        },
        {
          name: "HousingAnywhere",
          url: "https://housinganywhere.com/",
          description: "Student-focused platform, secure payments",
          category: "Housing Platform"
        },
        {
          name: "Immobiliare.it",
          url: "https://www.immobiliare.it/",
          description: "Italy's largest real estate portal",
          category: "Housing Platform"
        },
        {
          name: "Idealista",
          url: "https://www.idealista.it/",
          description: "Popular rental listings, map-based search",
          category: "Housing Platform"
        }
      ]
    }
  }
];

const BureaucracyTimeline = () => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const { progress, toggleProgress, getCompletionPercentage, loading } = useUserProgress('phase-2');

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
                        <ChevronRight className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-300",
                          isSelected && "rotate-90"
                        )} />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      {step.description}
                    </p>

                    {/* Expanded details */}
                    {isSelected && (
                      <BureaucracyDetail 
                        step={step} 
                        isCompleted={isCompleted}
                        onToggleComplete={() => toggleProgress(step.id)}
                      />
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
