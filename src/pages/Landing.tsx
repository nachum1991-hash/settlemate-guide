import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, MapPin, Users, CheckCircle2, ShieldCheck, MessageSquare, Loader2, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { IntroVideoModal } from "@/components/IntroVideoModal";

const Landing = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Logged-in users go straight to their dashboard.
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Public top bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">SettleMate</Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth?mode=signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent py-16 sm:py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight mb-4 sm:mb-6">
            Move to Italy without the bureaucratic headache.
          </h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            SettleMate is the step-by-step guide for international students relocating to Italy —
            from your visa application at home to your first weeks on the ground.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary" className="shadow-elevated">
              <Link to="/auth?mode=signup">Get Started — Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/auth">I already have an account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setVideoOpen(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Introduction
            </Button>
          </div>
        </div>
      </section>

      <IntroVideoModal open={videoOpen} onOpenChange={setVideoOpen} />

      {/* 3 Phases */}
      <section className="py-14 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">Your journey, in 3 phases</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for non-EU students. Every step has verified links, real addresses, and city-specific info.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Plane,
                title: "Visa from home",
                desc: "A country-specific wizard for the Italian Type D student visa — documents, embassy links, and timeline.",
              },
              {
                icon: MapPin,
                title: "Arrival in Italy",
                desc: "Codice Fiscale and Residence Permit — what to bring, where to go, what to expect. Localized for your city.",
              },
              {
                icon: Users,
                title: "Social integration",
                desc: "University groups, buddy matching, events, and a community chat with other students in your country and city.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6 hover:shadow-elevated transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why SettleMate */}
      <section className="py-14 sm:py-20 px-4 bg-muted/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">Why students choose SettleMate</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, title: "Verified official links", desc: "Embassy pages, VFS centers, prenotaonline, university portals — no broken or outdated links." },
              { icon: ShieldCheck, title: "Your data stays yours", desc: "GDPR-compliant, EU-hosted. Documents you upload are private and encrypted." },
              { icon: MessageSquare, title: "Real community", desc: "Chat with other students in your country and city — not a generic forum." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">Start your move today</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            Create a free account and get a personalized checklist in under a minute.
          </p>
          <Button asChild size="lg" className="shadow-elevated">
            <Link to="/auth?mode=signup">Create my account</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
