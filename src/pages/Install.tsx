import { Download, Share, Smartphone, Wifi, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Navbar } from "@/components/Navbar";

export default function Install() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstall = async () => {
    await install();
  };

  const benefits = [
    {
      icon: Smartphone,
      title: "Works Like a Native App",
      description: "Full-screen experience with no browser UI",
    },
    {
      icon: Wifi,
      title: "Offline Access",
      description: "Access your relocation guides even without internet",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Loads instantly from your home screen",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Hero */}
          <div className="mb-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-coral to-peach flex items-center justify-center shadow-lg">
              <Download className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Install SettleMate
            </h1>
            <p className="text-lg text-muted-foreground">
              Add SettleMate to your home screen for the best experience
            </p>
          </div>

          {/* Benefits */}
          <div className="grid gap-4 mb-12">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Install Section */}
          {isInstalled ? (
            <div className="p-6 bg-mint/10 rounded-2xl border border-mint/20">
              <CheckCircle2 className="w-12 h-12 text-mint mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Already Installed!
              </h2>
              <p className="text-muted-foreground">
                SettleMate is installed on your device. Find it on your home screen.
              </p>
            </div>
          ) : isIOS ? (
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                How to Install on iOS
              </h2>
              <ol className="text-left space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for <Share className="w-4 h-4 inline" /> at the bottom of Safari
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Scroll down and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground">
                      You may need to scroll to find this option
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">
                      SettleMate will appear on your home screen
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          ) : isInstallable ? (
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Ready to Install
              </h2>
              <p className="text-muted-foreground mb-6">
                Click the button below to add SettleMate to your home screen.
              </p>
              <Button
                size="lg"
                onClick={handleInstall}
                className="gap-2 bg-coral hover:bg-coral/90"
              >
                <Download className="w-5 h-5" />
                Install SettleMate
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-muted/50 rounded-2xl border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Installation Not Available
              </h2>
              <p className="text-muted-foreground">
                App installation is not supported in this browser. Try opening this page in Chrome, Edge, or Safari.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
