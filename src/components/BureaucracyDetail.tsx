import { 
  MapPin, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Lightbulb,
  IdCard,
  GraduationCap,
  Hash,
  FileEdit,
  Copy,
  Heart,
  Home,
  Camera,
  Receipt,
  Shield,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Helper function to get appropriate icon for each document type
const getDocumentIcon = (docName: string) => {
  const lowerDoc = docName.toLowerCase();
  
  if (lowerDoc.includes("passport") && !lowerDoc.includes("photo")) {
    return IdCard;
  }
  if (lowerDoc.includes("admission") || lowerDoc.includes("enrollment") || lowerDoc.includes("certificate")) {
    return GraduationCap;
  }
  if (lowerDoc.includes("codice fiscale")) {
    return Hash;
  }
  if (lowerDoc.includes("modulo") || lowerDoc.includes("form")) {
    return FileEdit;
  }
  if (lowerDoc.includes("copies") || lowerDoc.includes("copy")) {
    return Copy;
  }
  if (lowerDoc.includes("insurance")) {
    return Heart;
  }
  if (lowerDoc.includes("rental") || lowerDoc.includes("contract") || lowerDoc.includes("cessione") || lowerDoc.includes("residence")) {
    return Home;
  }
  if (lowerDoc.includes("photo")) {
    return Camera;
  }
  if (lowerDoc.includes("marca") || lowerDoc.includes("stamp") || lowerDoc.includes("receipt")) {
    return Receipt;
  }
  if (lowerDoc.includes("permit")) {
    return FileCheck;
  }
  if (lowerDoc.includes("proof")) {
    return Shield;
  }
  
  // Default icon
  return FileText;
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
              const DocIcon = getDocumentIcon(doc);
              return (
                <li key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <DocIcon className="w-4 h-4 text-secondary" />
                  </div>
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
