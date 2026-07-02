import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  ExternalLink, 
  Globe,
  GraduationCap,
  Flag,
  MapPin,
  Clock,
  MessagesSquare
} from "lucide-react";
import CitySelector from "@/components/CitySelector";
import { useCity } from "@/contexts/CityContext";
import { universityGroupsByCity, eventsByCity, cityData } from "@/data/cityData";
import { TaskChat } from "@/components/TaskChat";

// Nationality groups (same across all cities) - Links to official embassy/consulate student pages and verified Facebook groups
const nationalityGroups = [
  { name: "Israeli Students in Italy", url: "https://www.facebook.com/groups/israelisinmilan", platform: "Facebook", flag: "🇮🇱" },
  { name: "Indians in Italy", url: "https://www.facebook.com/groups/indiansinitaly", platform: "Facebook", flag: "🇮🇳" },
  { name: "Iranians in Milan", url: "https://www.facebook.com/groups/iraniansinmilan", platform: "Facebook", flag: "🇮🇷" },
  { name: "Turkish Community Italy", url: "https://www.facebook.com/groups/turkishcommunityitaly", platform: "Facebook", flag: "🇹🇷" },
  { name: "Chinese Students Italy", url: "https://www.facebook.com/groups/chinesestudentsitaly", platform: "Facebook", flag: "🇨🇳" },
  { name: "Brasileiros na Italia", url: "https://www.facebook.com/groups/brasileirosnaitalia", platform: "Facebook", flag: "🇧🇷" }
];

const SocialIntegration = () => {
  const { selectedCity, cityInfo } = useCity();

  const universityGroups = universityGroupsByCity[selectedCity] || [];
  const upcomingEvents = eventsByCity[selectedCity] || [];
  const currentCityData = cityData[selectedCity];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="py-6 sm:py-8 md:py-12 px-2 sm:px-3 md:px-6 lg:px-8 flex-1">

        <div className="w-full max-w-6xl mx-auto">
          <Card className="p-3 sm:p-5 md:p-8 shadow-elevated border-2 border-accent/20 w-full">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-accent/10 rounded-xl">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Social Integration</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Build your community and feel at home in Italy</p>
              </div>
            </div>
            
            <CitySelector />
            
            <Tabs defaultValue="groups" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="groups" className="text-xs sm:text-sm">
                  <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Groups</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="text-xs sm:text-sm">
                  <MessagesSquare className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Community</span>
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
                              {group.members && <span className="text-xs text-primary/70">({group.members})</span>}
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
                      href={currentCityData.esnChapter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground group-hover:text-accent transition-colors">{currentCityData.esnChapter.name}</span>
                        <p className="text-xs text-muted-foreground">Erasmus Student Network - events, trips, support</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                    </a>
                    <a
                      href={selectedCity === 'milano' ? 'https://www.facebook.com/groups/expatsinmilano' : 
                            selectedCity === 'roma' ? 'https://www.facebook.com/groups/expatsinroma' :
                            selectedCity === 'torino' ? 'https://www.facebook.com/groups/expatsintorino' :
                            'https://www.facebook.com/groups/expatslivinginitaly'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground group-hover:text-accent transition-colors">Expats in {cityInfo.name}</span>
                        <p className="text-xs text-muted-foreground">Large community of internationals in {cityInfo.name}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                    </a>
                  </div>
                </div>
              </TabsContent>


              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Upcoming Events in {cityInfo.name}</h3>
                  <a
                    href={`${currentCityData.esnChapter.url}events`}
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
                      href={currentCityData.esnChapter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                      <h4 className="font-medium text-foreground group-hover:text-primary mb-1">{currentCityData.esnChapter.name}</h4>
                      <p className="text-xs text-muted-foreground">Erasmus Student Network - trips, parties, cultural events</p>
                    </a>
                    {selectedCity === 'milano' && (
                      <>
                        <a
                          href="https://www.polimi.it/en/international-prospective-students/student-life/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors group"
                        >
                          <h4 className="font-medium text-foreground group-hover:text-secondary mb-1">Polimi Student Life</h4>
                          <p className="text-xs text-muted-foreground">Official Politecnico di Milano student activities</p>
                        </a>
                        <a
                          href="https://linktr.ee/polinetwork"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors group"
                        >
                          <h4 className="font-medium text-foreground group-hover:text-accent mb-1">PoliNetwork</h4>
                          <p className="text-xs text-muted-foreground">Student-run network with Telegram/Facebook groups</p>
                        </a>
                      </>
                    )}
                    {selectedCity === 'roma' && (
                      <>
                        <a
                          href="https://sapienzastudents.net/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors group"
                        >
                          <h4 className="font-medium text-foreground group-hover:text-secondary mb-1">Sapienza Students Network</h4>
                          <p className="text-xs text-muted-foreground">Student hub with Telegram groups and Discord</p>
                        </a>
                        <a
                          href="https://www.uniroma1.it/en/pagina/hello-international-student-help-desk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors group"
                        >
                          <h4 className="font-medium text-foreground group-hover:text-accent mb-1">Sapienza Student Life</h4>
                          <p className="text-xs text-muted-foreground">Official university student services</p>
                        </a>
                      </>
                    )}
                    {selectedCity === 'torino' && (
                      <a
                        href="https://www.polito.it/en/education/international-students"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors group"
                      >
                        <h4 className="font-medium text-foreground group-hover:text-secondary mb-1">PoliTo International</h4>
                        <p className="text-xs text-muted-foreground">Official Politecnico di Torino student services</p>
                      </a>
                    )}
                    {selectedCity === 'pavia' && (
                      <a
                        href="https://en.unipv.it/en/international-students"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors group"
                      >
                        <h4 className="font-medium text-foreground group-hover:text-secondary mb-1">UniPV International</h4>
                        <p className="text-xs text-muted-foreground">Official University of Pavia student services</p>
                      </a>
                    )}
                    <a
                      href={`https://www.meetup.com/find/?location=it--${cityInfo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors group"
                    >
                      <h4 className="font-medium text-foreground mb-1">Meetup {cityInfo.name}</h4>
                      <p className="text-xs text-muted-foreground">Find hobby groups and local meetups</p>
                    </a>
                  </div>
                </div>
              </TabsContent>

              {/* Community Chat Tab */}
              <TabsContent value="community" className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessagesSquare className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Community Chat - {cityInfo.name}</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect with other students in {cityInfo.name}. Share tips, ask questions, and build your network!
                  </p>
                </div>

                <Card className="p-4 bg-accent/5 border-accent/20 mb-4">
                  <p className="text-sm text-foreground font-medium mb-2">👋 New here? Try starting with:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    <li>"Hi everyone, I'm starting at {cityInfo.name} this semester — any tips?"</li>
                    <li>"Looking for a flatmate / housing recs near campus"</li>
                    <li>"Anyone want to meet up for coffee or an aperitivo this week?"</li>
                  </ul>
                </Card>

                <Card className="border-2 border-accent/20 overflow-hidden" style={{ height: '500px' }}>
                  <TaskChat
                    taskId={`social-${selectedCity}`}
                    phase="social-integration"
                  />
                </Card>
              </TabsContent>

            </Tabs>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SocialIntegration;
