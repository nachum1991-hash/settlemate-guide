import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  ExternalLink, 
  UserPlus,
  Globe,
  GraduationCap,
  Flag,
  Heart,
  MapPin,
  Clock,
  CheckCircle2
} from "lucide-react";

// University groups data
const universityGroups = [
  {
    university: "Politecnico di Milano",
    groups: [
      { name: "Polimi International Students", url: "https://t.me/polimiinternational", platform: "Telegram", members: "5k+" },
      { name: "Polimi Housing", url: "https://www.facebook.com/groups/polimihousing", platform: "Facebook", members: "12k+" },
      { name: "Polimi Erasmus", url: "https://t.me/polimierasmus", platform: "Telegram", members: "2k+" }
    ]
  },
  {
    university: "University of Milano",
    groups: [
      { name: "UniMi International", url: "https://t.me/unimiinternational", platform: "Telegram", members: "3k+" },
      { name: "UniMi Students", url: "https://www.facebook.com/groups/unimistudents", platform: "Facebook", members: "8k+" }
    ]
  },
  {
    university: "Bocconi University",
    groups: [
      { name: "Bocconi International", url: "https://t.me/bocconiint", platform: "Telegram", members: "4k+" },
      { name: "Bocconi Housing", url: "https://www.facebook.com/groups/bocconihousing", platform: "Facebook", members: "6k+" }
    ]
  }
];

// Nationality groups
const nationalityGroups = [
  { name: "Israeli Students Italy", url: "https://t.me/israelistudentsitaly", platform: "Telegram", flag: "🇮🇱" },
  { name: "Indian Students Milan", url: "https://t.me/indianstudentsmilan", platform: "Telegram", flag: "🇮🇳" },
  { name: "Iranian Students Italy", url: "https://t.me/iranianstudentsitaly", platform: "Telegram", flag: "🇮🇷" },
  { name: "Turkish Students Milan", url: "https://t.me/turkishstudentsmilan", platform: "Telegram", flag: "🇹🇷" },
  { name: "Chinese Students Italy", url: "https://t.me/chinesestudentsitaly", platform: "Telegram", flag: "🇨🇳" },
  { name: "Brazilian Students Italy", url: "https://t.me/brazilianstudentsitaly", platform: "Telegram", flag: "🇧🇷" }
];

// Events data
const upcomingEvents = [
  {
    name: "ESN Welcome Week Milan",
    date: "September 2024",
    location: "Various locations, Milan",
    type: "Social",
    free: true,
    url: "https://milan.esn.it/",
    description: "Welcome activities, city tours, and parties for new international students"
  },
  {
    name: "International Students Aperitivo",
    date: "Every Thursday",
    location: "Navigli, Milan",
    type: "Social",
    free: false,
    url: "https://milan.esn.it/events",
    description: "Weekly social meetup with ESN - €5 includes drink"
  },
  {
    name: "Italian Language Tandem",
    date: "Every Tuesday",
    location: "Online / Cafés",
    type: "Language",
    free: true,
    url: "https://www.tandemexchange.com/",
    description: "Practice Italian with native speakers who want to learn your language"
  },
  {
    name: "Polimi International Welcome Day",
    date: "Start of each semester",
    location: "Politecnico di Milano",
    type: "Academic",
    free: true,
    url: "https://www.polimi.it/en/international-prospective-students/",
    description: "Official orientation for new international students"
  },
  {
    name: "Milan Free Walking Tour",
    date: "Daily",
    location: "Piazza Duomo, Milan",
    type: "Cultural",
    free: true,
    url: "https://www.neweuropetours.eu/milan/",
    description: "Discover Milan's history and landmarks with local guides"
  }
];

const SocialIntegration = () => {
  const [buddyForm, setBuddyForm] = useState({
    name: "",
    email: "",
    university: "",
    program: "",
    languages: "",
    interests: ""
  });
  const [buddySubmitted, setBuddySubmitted] = useState(false);

  const handleBuddySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBuddySubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-4 sm:p-6 md:p-8 shadow-elevated border-2 border-accent/20">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-accent/10 rounded-xl">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Social Integration</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Build your community and feel at home in Italy</p>
              </div>
            </div>
            
            <Tabs defaultValue="groups" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="groups" className="text-xs sm:text-sm">
                  <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Groups</span>
                </TabsTrigger>
                <TabsTrigger value="buddy" className="text-xs sm:text-sm">
                  <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Find a Buddy</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
              </TabsList>

              {/* Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                {/* University Groups */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">University Groups</h3>
                  </div>
                  <div className="space-y-4">
                    {universityGroups.map((uni, idx) => (
                      <Card key={idx} className="p-4">
                        <h4 className="font-medium text-foreground mb-3">{uni.university}</h4>
                        <div className="flex flex-wrap gap-2">
                          {uni.groups.map((group, gIdx) => (
                            <a
                              key={gIdx}
                              href={group.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>{group.name}</span>
                              <span className="text-xs text-primary/70">({group.members})</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Nationality Groups */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Flag className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-semibold text-foreground">Nationality-Based Groups</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nationalityGroups.map((group, idx) => (
                      <a
                        key={idx}
                        href={group.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 rounded-lg transition-colors group"
                      >
                        <span className="text-2xl">{group.flag}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors block truncate">{group.name}</span>
                          <span className="text-xs text-muted-foreground">{group.platform}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* General Groups */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">General Student Communities</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://milan.esn.it/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground group-hover:text-accent transition-colors">ESN Milano</span>
                        <p className="text-xs text-muted-foreground">Erasmus Student Network - events, trips, support</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                    </a>
                    <a
                      href="https://www.facebook.com/groups/expatsinmilan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground group-hover:text-accent transition-colors">Expats in Milan</span>
                        <p className="text-xs text-muted-foreground">Large community of internationals in Milan</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                    </a>
                  </div>
                </div>
              </TabsContent>

              {/* Buddy Tab */}
              <TabsContent value="buddy" className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Find Your Study Buddy</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Get matched with another student who shares your interests, program, or language. 
                    Navigate your Italian adventure together!
                  </p>
                </div>

                {buddySubmitted ? (
                  <Card className="p-6 bg-success/5 border-success/30 text-center">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">You're on the list!</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll match you with compatible buddies and send introductions to your email within 48 hours.
                    </p>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <form onSubmit={handleBuddySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buddy-name">Full Name</Label>
                          <Input
                            id="buddy-name"
                            placeholder="Your name"
                            value={buddyForm.name}
                            onChange={(e) => setBuddyForm({ ...buddyForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buddy-email">Email</Label>
                          <Input
                            id="buddy-email"
                            type="email"
                            placeholder="your@email.com"
                            value={buddyForm.email}
                            onChange={(e) => setBuddyForm({ ...buddyForm, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buddy-university">University</Label>
                          <Input
                            id="buddy-university"
                            placeholder="e.g., Politecnico di Milano"
                            value={buddyForm.university}
                            onChange={(e) => setBuddyForm({ ...buddyForm, university: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buddy-program">Program/Major</Label>
                          <Input
                            id="buddy-program"
                            placeholder="e.g., Computer Engineering"
                            value={buddyForm.program}
                            onChange={(e) => setBuddyForm({ ...buddyForm, program: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buddy-languages">Languages You Speak</Label>
                        <Input
                          id="buddy-languages"
                          placeholder="e.g., English, Hebrew, some Italian"
                          value={buddyForm.languages}
                          onChange={(e) => setBuddyForm({ ...buddyForm, languages: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buddy-interests">Interests & Hobbies</Label>
                        <Input
                          id="buddy-interests"
                          placeholder="e.g., hiking, music, cooking, photography"
                          value={buddyForm.interests}
                          onChange={(e) => setBuddyForm({ ...buddyForm, interests: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Find My Buddy
                      </Button>
                    </form>
                  </Card>
                )}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
                  <a
                    href="https://milan.esn.it/events"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all ESN events
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-4">
                  {upcomingEvents.map((event, idx) => (
                    <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-foreground">{event.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                              event.free ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            }`}>
                              {event.free ? 'Free' : 'Paid'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                            <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                              {event.type}
                            </span>
                          </div>
                        </div>
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button variant="outline" size="sm">
                            Learn More
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* ESN and Club Links */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Student Organizations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="https://milan.esn.it/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                      <h4 className="font-medium text-foreground group-hover:text-primary mb-1">ESN Milano</h4>
                      <p className="text-xs text-muted-foreground">Erasmus Student Network - trips, parties, cultural events</p>
                    </a>
                    <a
                      href="https://www.polimi.it/en/international-prospective-students/student-life/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors group"
                    >
                      <h4 className="font-medium text-foreground group-hover:text-secondary mb-1">Polimi Student Clubs</h4>
                      <p className="text-xs text-muted-foreground">Sports, cultural, and academic clubs at Politecnico</p>
                    </a>
                    <a
                      href="https://www.unimib.it/en/students/student-services/campus-life"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors group"
                    >
                      <h4 className="font-medium text-foreground group-hover:text-accent mb-1">UniMi Student Life</h4>
                      <p className="text-xs text-muted-foreground">University of Milan student activities</p>
                    </a>
                    <a
                      href="https://www.meetup.com/cities/it/milan/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors group"
                    >
                      <h4 className="font-medium text-foreground mb-1">Meetup Milan</h4>
                      <p className="text-xs text-muted-foreground">Find hobby groups and local meetups</p>
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default SocialIntegration;
