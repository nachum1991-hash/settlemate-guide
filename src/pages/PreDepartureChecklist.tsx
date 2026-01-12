import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Circle, Download, Plane, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskChat } from "@/components/TaskChat";
import { TaskFAQ } from "@/components/TaskFAQ";
import { FloatingChat, getStoredCountry } from "@/components/FloatingChat";

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  deadline?: string;
  subtasks?: string[];
}

const checklistItems: ChecklistItem[] = [
  {
    id: "visa",
    category: "Documentation",
    title: "Complete Visa Application",
    description: "Submit your student visa application and receive approval",
    priority: "high",
    deadline: "2-3 months before departure",
    subtasks: [
      "Gather all required documents",
      "Submit application at embassy",
      "Attend visa interview",
      "Receive passport with visa stamp"
    ]
  },
  {
    id: "flight",
    category: "Travel",
    title: "Book Flight Tickets",
    description: "Reserve your one-way or round-trip flight to Milan/Rome",
    priority: "high",
    deadline: "1-2 months before departure",
    subtasks: [
      "Compare flight prices",
      "Check baggage allowance (usually 23kg + cabin bag)",
      "Book tickets",
      "Print boarding passes 24h before"
    ]
  },
  {
    id: "accommodation",
    category: "Housing",
    title: "Secure First Month Accommodation",
    description: "Arrange temporary or permanent housing for arrival",
    priority: "high",
    deadline: "1 month before departure",
    subtasks: [
      "Book university housing or temporary Airbnb",
      "Get rental contract or confirmation letter",
      "Note check-in time and address",
      "Save landlord/host contact info"
    ]
  },
  {
    id: "documents-translation",
    category: "Documentation",
    title: "Translate Official Documents",
    description: "Get certified translations of all important documents",
    priority: "high",
    deadline: "2-3 weeks before departure",
    subtasks: [
      "Birth certificate (if required)",
      "Academic transcripts and diplomas",
      "Medical records (if applicable)",
      "Use certified translator or Italian embassy"
    ]
  },
  {
    id: "documents-copies",
    category: "Documentation",
    title: "Make Document Copies",
    description: "Create multiple copies of all essential documents",
    priority: "high",
    deadline: "1 week before departure",
    subtasks: [
      "Passport (3 copies + photos)",
      "Visa page (3 copies)",
      "University admission letter (2 copies)",
      "Insurance documents (2 copies)",
      "Keep 1 set in carry-on, 1 in checked bag, 1 digital"
    ]
  },
  {
    id: "insurance",
    category: "Health & Safety",
    title: "Purchase Health Insurance",
    description: "Get comprehensive health insurance covering your entire stay",
    priority: "high",
    deadline: "1 month before departure",
    subtasks: [
      "Minimum €30,000 coverage required",
      "Covers entire visa period",
      "Print insurance certificate",
      "Save digital copy on phone"
    ]
  },
  {
    id: "bank",
    category: "Finance",
    title: "Notify Your Bank",
    description: "Inform your bank about international travel",
    priority: "high",
    deadline: "1-2 weeks before departure",
    subtasks: [
      "Notify bank of Italy travel dates",
      "Enable international transactions",
      "Check foreign transaction fees",
      "Get a credit/debit card with no foreign fees"
    ]
  },
  {
    id: "currency",
    category: "Finance",
    title: "Arrange Initial Currency",
    description: "Bring some Euros for immediate expenses",
    priority: "medium",
    deadline: "1 week before departure",
    subtasks: [
      "Exchange €200-500 at bank or currency exchange",
      "Keep small bills (€5, €10, €20)",
      "Avoid airport exchange (poor rates)",
      "Plan to withdraw more at Italian ATM"
    ]
  },
  {
    id: "pickup",
    category: "Travel",
    title: "Arrange Airport Pickup",
    description: "Plan transportation from airport to accommodation",
    priority: "medium",
    deadline: "1-2 weeks before departure",
    subtasks: [
      "Research airport to city transport (train/bus/taxi)",
      "Download ATM Milano app for tickets",
      "Or arrange pickup through university/landlord",
      "Save address and directions offline"
    ]
  },
  {
    id: "packing",
    category: "Travel",
    title: "Pack Essential Items",
    description: "Prepare luggage with climate-appropriate clothing",
    priority: "medium",
    deadline: "3-5 days before departure",
    subtasks: [
      "Check weather for arrival season",
      "Pack formal clothes for university",
      "Bring adapters (Type L plugs for Italy)",
      "Medicines with prescriptions",
      "Comfortable shoes for walking"
    ]
  },
  {
    id: "contacts",
    category: "Health & Safety",
    title: "Prepare Emergency Contacts",
    description: "Compile list of important contacts and addresses",
    priority: "high",
    deadline: "1 week before departure",
    subtasks: [
      "Embassy/consulate address and phone",
      "University international office contact",
      "Accommodation address and landlord contact",
      "Family doctor and insurance provider",
      "Save all contacts offline and share with family"
    ]
  },
  {
    id: "apps",
    category: "Technology",
    title: "Download Essential Apps",
    description: "Install useful apps for navigating Italy",
    priority: "low",
    deadline: "Before departure",
    subtasks: [
      "Google Maps (download Milan offline)",
      "Google Translate (download Italian offline)",
      "ATM Milano (public transport)",
      "Trenitalia (trains)",
      "WhatsApp (main communication app in Italy)"
    ]
  },
  {
    id: "prescriptions",
    category: "Health & Safety",
    title: "Stock Up on Medications",
    description: "Bring sufficient medication supply",
    priority: "medium",
    deadline: "2 weeks before departure",
    subtasks: [
      "Get 3-6 months supply of prescriptions",
      "Carry medications in original packaging",
      "Bring doctor's note in English/Italian",
      "Research Italian pharmacy equivalent names"
    ]
  },
  {
    id: "farewell",
    category: "Personal",
    title: "Say Goodbyes",
    description: "Spend quality time with family and friends",
    priority: "low",
    deadline: "Week before departure",
    subtasks: [
      "Plan farewell gathering",
      "Take photos",
      "Exchange contact info",
      "Promise to stay in touch!"
    ]
  }
];

const PreDepartureChecklist = () => {
  const { toast } = useToast();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCountry(getStoredCountry());
  }, []);

  const toggleItem = (itemId: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
        toast({
          title: "Task completed! 🎉",
          description: "Great progress on your relocation journey!",
        });
      }
      return newSet;
    });
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const completionPercentage = (completedItems.size / checklistItems.length) * 100;
  const highPriorityItems = checklistItems.filter(item => item.priority === "high");
  const completedHighPriority = highPriorityItems.filter(item => completedItems.has(item.id)).length;

  const downloadChecklist = () => {
    toast({
      title: "Checklist downloaded!",
      description: "Your pre-departure checklist is ready.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive bg-destructive/10";
      case "medium": return "text-warning bg-warning/10";
      case "low": return "text-muted-foreground bg-muted";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const categories = Array.from(new Set(checklistItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-accent py-4 sm:py-6 px-4 shadow-elevated">
        <div className="container mx-auto max-w-4xl">
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-3 sm:mb-4 text-primary-foreground hover:bg-primary-foreground/10 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary-foreground/10 rounded-xl">
              <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
                Pre-Departure Checklist
              </h1>
              <p className="text-sm sm:text-base text-primary-foreground/90 mt-1">
                Everything you need to prepare before flying to Italy
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="bg-muted/50 py-4 sm:py-6 px-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {/* Overall Progress */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Your Progress</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {completedItems.size} of {checklistItems.length} tasks completed
                </p>
              </div>
              <Button onClick={downloadChecklist} variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}% Complete
              </span>
              {completionPercentage === 100 && (
                <span className="text-sm font-medium text-success">All done! 🎉</span>
              )}
            </div>
          </Card>

          {/* High Priority Alert */}
          {completedHighPriority < highPriorityItems.length && (
            <Card className="p-4 bg-destructive/5 border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">High Priority Tasks</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    You have {highPriorityItems.length - completedHighPriority} critical tasks remaining.
                    Complete these first!
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="py-6 sm:py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {categories.map((category) => (
            <div key={category} className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                {category}
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                  ({checklistItems.filter(item => item.category === category && completedItems.has(item.id)).length}/
                  {checklistItems.filter(item => item.category === category).length})
                </span>
              </h2>

              <div className="space-y-3">
                {checklistItems
                  .filter(item => item.category === category)
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((item) => {
                    const isCompleted = completedItems.has(item.id);
                    const isExpanded = expandedItems.has(item.id);

                    return (
                      <Card
                        key={item.id}
                        className={cn(
                          "transition-all duration-300",
                          isCompleted && "bg-success/5 border-success/30"
                        )}
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Checkbox */}
                            <div className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => toggleItem(item.id)}
                                className="flex-shrink-0"
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className={cn(
                                    "text-base sm:text-lg font-semibold mb-1",
                                    isCompleted && "line-through text-muted-foreground"
                                  )}>
                                    {item.title}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                                <span className={cn(
                                  "text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0",
                                  getPriorityColor(item.priority)
                                )}>
                                  {item.priority}
                                </span>
                              </div>

                              {item.deadline && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  ⏰ {item.deadline}
                                </p>
                              )}

                              {/* Subtasks */}
                              {item.subtasks && (
                                <div className="mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpand(item.id)}
                                    className="h-auto p-0 text-xs sm:text-sm hover:bg-transparent min-h-[44px]"
                                  >
                                    {isExpanded ? "Hide" : "Show"} details ({item.subtasks.length} steps)
                                  </Button>

                                  {isExpanded && (
                                    <ul className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {item.subtasks.map((subtask, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                                          <Circle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                          <span>{subtask}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              
                              {/* FAQ and Chat for individual tasks */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t">
                                  <Tabs defaultValue="faq" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="faq">FAQs</TabsTrigger>
                                      <TabsTrigger value="chat">Chat</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="faq" className="mt-3">
                                      <TaskFAQ taskId={item.id} phase="phase-1" />
                                    </TabsContent>
                                    <TabsContent value="chat" className="mt-3">
                                      <TaskChat taskId={item.id} phase="phase-1" />
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Completion Card */}
          {completionPercentage === 100 && (
            <Card className="p-6 sm:p-8 bg-success/5 border-success/30 text-center animate-in fade-in scale-in duration-500">
              <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                You're All Set! 🎉
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                You've completed all pre-departure tasks. Have a safe flight to Italy!
              </p>
              <Link to="/">
                <Button size="lg" className="w-full sm:w-auto">
                  Continue to Arrival Phase
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      <FloatingChat 
        taskId={selectedCountry ? `pre-departure-${selectedCountry}` : 'pre-departure-general'} 
        phase="phase-1"
        label={selectedCountry ? `${selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)} Community` : 'General Community'}
      />
    </div>
  );
};

export default PreDepartureChecklist;
