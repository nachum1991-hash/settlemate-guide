import { 
  MapPin, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  if (lowerDoc.includes("admission") || lowerDoc.includes("certificate") || lowerDoc.includes("polimi")) {
    return admissionImg;
  }
  if (lowerDoc.includes("insurance")) {
    return insuranceImg;
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
  
  // Default: no image
  return null;
};

interface StepDetails {
  location: string;
  documents: string[];
  process: string[];
  cost: string;
  tips: string;
}

interface Step {
  id: string;
  title: string;
  details: StepDetails;
}

interface BureaucracyDetailProps {
  step: Step;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

const BureaucracyDetail = ({ step, isCompleted, onToggleComplete }: BureaucracyDetailProps) => {
  return (
    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <Separator />
      
      {/* Location */}
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-sm text-foreground mb-1">Location</h5>
          <p className="text-sm text-muted-foreground">{step.details.location}</p>
        </div>
      </div>

      {/* Documents needed */}
      <div className="flex items-start gap-3">
        <FileText className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h5 className="font-semibold text-sm text-foreground mb-3">Documents Needed</h5>
          <ul className="space-y-2">
            {step.details.documents.map((doc, idx) => {
              const docImage = getDocumentImage(doc);
              return (
                <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  {docImage ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background">
                      <img 
                        src={docImage} 
                        alt={doc}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-secondary" />
                    </div>
                  )}
                  <span className="text-sm text-foreground font-medium">{doc}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Process */}
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h5 className="font-semibold text-sm text-foreground mb-2">Step-by-Step Process</h5>
          <ol className="space-y-2">
            {step.details.process.map((processStep, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="font-medium text-accent flex-shrink-0">{idx + 1}.</span>
                <span>{processStep}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Cost */}
      <div className="flex items-start gap-3">
        <DollarSign className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-sm text-foreground mb-1">Cost</h5>
          <p className="text-sm font-medium text-warning">{step.details.cost}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-sm text-foreground mb-1">Pro Tips</h5>
            <p className="text-sm text-muted-foreground">{step.details.tips}</p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <Button 
        onClick={onToggleComplete}
        variant={isCompleted ? "outline" : "default"}
        className="w-full"
      >
        {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
      </Button>
    </div>
  );
};

export default BureaucracyDetail;
