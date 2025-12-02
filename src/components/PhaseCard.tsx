import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Phase {
  id: number;
  title: string;
  icon: LucideIcon;
  description: string;
  color: string;
  status: string;
}

interface PhaseCardProps {
  phase: Phase;
  isActive: boolean;
  onClick: () => void;
  delay?: number;
}

const PhaseCard = ({ phase, isActive, onClick, delay = 0 }: PhaseCardProps) => {
  const Icon = phase.icon;
  
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/30",
    secondary: "bg-secondary/10 text-secondary border-secondary/30",
    accent: "bg-accent/10 text-accent border-accent/30"
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4",
        isActive ? "shadow-elevated border-2" : "shadow-soft hover:shadow-elevated border",
        isActive ? colorClasses[phase.color as keyof typeof colorClasses] : "border-border bg-card"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn(
          "p-4 rounded-2xl transition-all duration-300",
          isActive ? colorClasses[phase.color as keyof typeof colorClasses] : "bg-muted/50"
        )}>
          <Icon className={cn(
            "w-8 h-8 transition-colors duration-300",
            isActive ? "" : "text-muted-foreground"
          )} />
        </div>
        
        <div>
          <h3 className={cn(
            "text-lg font-bold mb-2 transition-colors duration-300",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}>
            {phase.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {phase.description}
          </p>
        </div>

        {phase.status === "locked" && !isActive && (
          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
            Coming Soon
          </span>
        )}
      </div>
    </Card>
  );
};

export default PhaseCard;
