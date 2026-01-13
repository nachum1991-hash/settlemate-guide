import { 
  MapPin, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Lightbulb,
  ExternalLink,
  Globe,
  Building,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskChat } from "./TaskChat";
import { TaskFAQ } from "./TaskFAQ";
import type { Step, OfficialResource, Partner } from "./BureaucracyTimeline";
import { useCity } from "@/contexts/CityContext";

// Import document images
import passportImg from "@/assets/documents/passport.png";
import codiceFiscaleImg from "@/assets/documents/codice-fiscale.png";
import admissionImg from "@/assets/documents/admission-letter.png";
import insuranceImg from "@/assets/documents/insurance.png";
import accommodationImg from "@/assets/documents/accommodation.png";
import photosImg from "@/assets/documents/photos.png";
import yellowKitImg from "@/assets/documents/yellow-kit.png";
import marcaBolloImg from "@/assets/documents/marca-bollo.png";
import permessoImg from "@/assets/documents/permesso.png";

// Helper function to get appropriate image for each document type
const getDocumentImage = (docName: string): string | null => {
  const lowerDoc = docName.toLowerCase();
  
  if (lowerDoc.includes("passport") && !lowerDoc.includes("photo")) {
    return passportImg;
  }
  if (lowerDoc.includes("codice fiscale")) {
    return codiceFiscaleImg;
  }
  if (lowerDoc.includes("admission") || lowerDoc.includes("certificate") || lowerDoc.includes("polimi") || lowerDoc.includes("enrollment")) {
    return admissionImg;
  }
  if (lowerDoc.includes("insurance")) {
    return insuranceImg;
  }
  if (lowerDoc.includes("financial") || lowerDoc.includes("bank statement") || lowerDoc.includes("scholarship")) {
    return null;
  }
  if (lowerDoc.includes("rental") || lowerDoc.includes("contract") || lowerDoc.includes("cessione") || lowerDoc.includes("fabbricato")) {
    return accommodationImg;
  }
  if (lowerDoc.includes("photo")) {
    return photosImg;
  }
  if (lowerDoc.includes("kit") || lowerDoc.includes("modulo")) {
    return yellowKitImg;
  }
  if (lowerDoc.includes("marca") || lowerDoc.includes("stamp") || lowerDoc.includes("bollo")) {
    return marcaBolloImg;
  }
  if (lowerDoc.includes("permit") || lowerDoc.includes("permesso")) {
    return permessoImg;
  }
  
  return null;
};

// Community groups for each step - verified links to official resources and real Facebook groups
const communityGroups: Record<string, { name: string; url: string; platform: string }[]> = {
  codice: [
    { name: "PoliNetwork Student Hub", url: "https://linktr.ee/polinetwork", platform: "Multi-platform" },
    { name: "Expats Living in Italy", url: "https://www.facebook.com/groups/expatslivinginitaly", platform: "Facebook" }
  ],
  sim: [
    { name: "Expats in Milano", url: "https://www.facebook.com/groups/expatsinmilano", platform: "Facebook" }
  ],
  permesso: [
    { name: "Portale Immigrazione (Official)", url: "https://www.portaleimmigrazione.it/", platform: "Website" },
    { name: "Expats Living in Italy", url: "https://www.facebook.com/groups/expatslivinginitaly", platform: "Facebook" }
  ],
  atm: [
    { name: "ATM Milano Official", url: "https://www.atm.it/", platform: "Website" }
  ],
  bank: [
    { name: "Expats in Milano", url: "https://www.facebook.com/groups/expatsinmilano", platform: "Facebook" }
  ],
  housing: [
    { name: "Milan Housing - Expats", url: "https://www.facebook.com/groups/expatsinmilano", platform: "Facebook" },
    { name: "PoliNetwork Groups", url: "https://linktr.ee/polinetwork", platform: "Multi-platform" }
  ]
};

interface BureaucracyDetailProps {
  step: Step;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

const BureaucracyDetail = ({ step, isCompleted, onToggleComplete }: BureaucracyDetailProps) => {
  const { selectedCity } = useCity();
  const groups = communityGroups[step.id] || [];

  return (
    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <Separator />
      
      {/* Location */}
      <div className="flex items-start gap-2 sm:gap-3">
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1">Location</h5>
          <p className="text-xs sm:text-sm text-muted-foreground">{step.details.location}</p>
        </div>
      </div>

      {/* Documents needed */}
      <div className="flex items-start gap-2 sm:gap-3">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-2 sm:mb-3">Documents Needed</h5>
          <ul className="space-y-2 sm:space-y-3">
            {step.details.documents.map((doc, idx) => {
              const docImage = getDocumentImage(doc);
              return (
                <li key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  {docImage ? (
                    <div className="w-full sm:w-12 h-32 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background">
                      <img 
                        src={docImage} 
                        alt={doc}
                        className="w-full h-full object-contain sm:object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-12 h-32 sm:h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 sm:w-6 sm:h-6 text-secondary" />
                    </div>
                  )}
                  <span className="text-sm sm:text-sm text-foreground font-medium break-words w-full pl-0 sm:pl-0">{doc}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Process */}
      <div className="flex items-start gap-2 sm:gap-3">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2">Step-by-Step Process</h5>
          <ol className="space-y-1.5 sm:space-y-2">
            {step.details.process.map((processStep, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                <span className="font-medium text-accent flex-shrink-0 text-xs sm:text-sm">{idx + 1}.</span>
                <span className="break-words">{processStep}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Cost */}
      <div className="flex items-start gap-2 sm:gap-3">
        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1">Cost</h5>
          <p className="text-xs sm:text-sm font-medium text-warning">{step.details.cost}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1">Pro Tips</h5>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">{step.details.tips}</p>
          </div>
        </div>
      </div>

      {/* Official Resources */}
      {step.details.officialResources && step.details.officialResources.length > 0 && (
        <div className="p-3 sm:p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-2 sm:mb-3">Official Resources</h5>
              <ul className="space-y-2">
                {step.details.officialResources.map((resource, idx) => (
                  <li key={idx}>
                    <a 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-secondary/10 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5 group-hover:text-secondary/80" />
                      <div>
                        <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors">{resource.name}</span>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Partners */}
      {step.details.partners && step.details.partners.length > 0 && (
        <div className="p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-2 sm:mb-3">Recommended Partners</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {step.details.partners.map((partner, idx) => (
                  <a 
                    key={idx}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-3 rounded-lg bg-background/50 hover:bg-background transition-colors border border-border/50 hover:border-accent/30 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{partner.name}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-accent" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full w-fit mb-1">{partner.category}</span>
                    <p className="text-xs text-muted-foreground">{partner.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action button */}
      <Button 
        onClick={onToggleComplete}
        variant={isCompleted ? "outline" : "default"}
        className="w-full text-sm sm:text-base"
      >
        {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
      </Button>

      {/* FAQ and Chat Tabs */}
      <Tabs defaultValue="faq" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="chat">Community Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="faq" className="mt-4">
          <TaskFAQ taskId={`${step.id}-${selectedCity}`} phase="phase-2" />
        </TabsContent>
        <TabsContent value="chat" className="mt-4">
          {/* External community groups */}
          {groups.length > 0 && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Join External Groups</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groups.map((group, idx) => (
                  <a
                    key={idx}
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-full transition-colors"
                  >
                    {group.name}
                    <span className="text-[10px] text-primary/70">({group.platform})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                These are community-run groups. Please follow their rules.
              </p>
            </div>
          )}
          <TaskChat taskId={`${step.id}-${selectedCity}`} phase="phase-2" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BureaucracyDetail;
