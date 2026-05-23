import { Navbar } from "@/components/Navbar";
import { Footer, SUPPORT_EMAIL } from "@/components/Footer";
import { Plane, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">About SettleMate</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
          SettleMate is a step-by-step guide built for non-EU students moving to Italy. We turn an
          intimidating bureaucratic maze — visa applications, Codice Fiscale, Residence Permit, finding
          a community — into clear, actionable checklists with verified local resources.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Plane, title: "From your home country", desc: "Visa wizard with country-specific embassy and document links." },
            { icon: MapPin, title: "Arrival in Italy", desc: "Codice Fiscale, Residence Permit, and city-specific guidance." },
            { icon: Users, title: "Social integration", desc: "Student groups, buddy matching, events, and community chat." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5">
              <Icon className="w-7 h-7 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">Our promise</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
          We link only to verified, official sources. We never sell your data. And we're transparent
          that this is informational guidance, not legal advice — you should always confirm details
          with the Italian embassy or consulate that handles your case.
        </p>

        <h2 className="text-2xl font-bold text-foreground mb-3">Get in touch</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Have feedback or a question? Reach us at{" "}
          <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default About;
