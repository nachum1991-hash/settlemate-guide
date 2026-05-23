import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  variant?: "banner" | "inline";
  className?: string;
}

export const DISCLAIMER_TEXT =
  "SettleMate provides informational guidance only and is not official legal or immigration advice. Rules, fees, and processing times change — always confirm with official Italian government sources and your local Italian embassy or consulate.";

export const Disclaimer = ({ variant = "banner", className }: DisclaimerProps) => {
  if (variant === "inline") {
    return (
      <p className={cn("text-xs text-muted-foreground leading-relaxed", className)}>
        {DISCLAIMER_TEXT}
      </p>
    );
  }
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50",
        className,
      )}
      role="note"
    >
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
        <span className="font-semibold">Informational only.</span> {DISCLAIMER_TEXT.replace("SettleMate provides informational guidance only and is not ", "This is not ")}
      </p>
    </div>
  );
};

export default Disclaimer;
