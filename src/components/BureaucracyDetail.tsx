import { MapPin, FileText, CheckCircle2, DollarSign, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
          <h5 className="font-semibold text-sm text-foreground mb-2">Documents Needed</h5>
          <ul className="space-y-1">
            {step.details.documents.map((doc, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
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
