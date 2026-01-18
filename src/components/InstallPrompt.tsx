import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (hasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a delay for better UX
    const timer = setTimeout(() => {
      if ((isInstallable || isIOS) && !isInstalled) {
        setShowPrompt(true);
      }
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowPrompt(false);
    }
  };

  if (!showPrompt || dismissed || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-coral" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Install SettleMate</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isIOS
                ? "Tap Share, then 'Add to Home Screen' for quick access"
                : "Install the app for offline access and a better experience"}
            </p>
            <div className="flex gap-2 mt-3">
              {isIOS ? (
                <Button size="sm" variant="outline" className="gap-2">
                  <Share className="w-4 h-4" />
                  How to Install
                </Button>
              ) : (
                <Button size="sm" onClick={handleInstall} className="gap-2 bg-coral hover:bg-coral/90">
                  <Download className="w-4 h-4" />
                  Install
                </Button>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
