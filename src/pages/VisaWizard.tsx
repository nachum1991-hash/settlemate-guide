import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Calendar, AlertCircle, ExternalLink, Info, Globe, ChevronDown, ChevronUp, Check, X, AlertTriangle, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskChat } from "@/components/TaskChat";
import { TaskFAQ } from "@/components/TaskFAQ";
import { FloatingChat, setStoredCountry } from "@/components/FloatingChat";

// Import document images
import passportImg from "@/assets/documents/passport.png";
import admissionImg from "@/assets/documents/admission-letter.png";
import insuranceImg from "@/assets/documents/insurance.png";
import accommodationImg from "@/assets/documents/accommodation.png";
import financialImg from "@/assets/documents/financial.png";
import photosImg from "@/assets/documents/photos.png";
import applicationImg from "@/assets/documents/application-form.png";
import paymentImg from "@/assets/documents/payment.png";

const countries = [
  { 
    value: "israel", 
    label: "Israel", 
    processingWeeks: "4-6", 
    embassyUrl: "https://ambtelaviv.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/isr/en/ita",
    passportRenewalUrl: "https://www.gov.il/en/service/biometric_passport",
    appointmentUrl: "https://prenotaonline.esteri.it/Login.aspx?cidsede=100046",
    apostilleInfo: "Required for sponsor letters - get from Ministry of Justice",
    paymentMethod: "Credit card or bank transfer at embassy"
  },
  { 
    value: "india", 
    label: "India", 
    processingWeeks: "6-8", 
    embassyUrl: "https://ambdelhi.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/ind/en/ita",
    passportRenewalUrl: "https://www.passportindia.gov.in/",
    appointmentUrl: "https://visa.vfsglobal.com/ind/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from MEA (Ministry of External Affairs)",
    paymentMethod: "Cash or demand draft at VFS center"
  },
  { 
    value: "iran", 
    label: "Iran", 
    processingWeeks: "8-12", 
    embassyUrl: "https://ambtehran.esteri.it/", 
    vfsUrl: null,
    passportRenewalUrl: "https://epolice.ir/",
    appointmentUrl: "https://prenotaonline.esteri.it/",
    apostilleInfo: "Required - get from Ministry of Foreign Affairs",
    paymentMethod: "Check with embassy for current payment methods"
  },
  { 
    value: "turkey", 
    label: "Turkey", 
    processingWeeks: "4-6", 
    embassyUrl: "https://ambankara.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/tur/en/ita",
    passportRenewalUrl: "https://www.nvi.gov.tr/",
    appointmentUrl: "https://visa.vfsglobal.com/tur/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from local notary or governorship",
    paymentMethod: "Cash at VFS center (Turkish Lira or Euro)"
  },
  { 
    value: "china", 
    label: "China", 
    processingWeeks: "6-10", 
    embassyUrl: "https://ambpechino.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/chn/en/ita",
    passportRenewalUrl: "https://www.nia.gov.cn/",
    appointmentUrl: "https://visa.vfsglobal.com/chn/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from local notary public office",
    paymentMethod: "Online payment or cash at VFS center (CNY)"
  },
  { 
    value: "brazil", 
    label: "Brazil", 
    processingWeeks: "5-7", 
    embassyUrl: "https://ambbrasilia.esteri.it/", 
    vfsUrl: null,
    passportRenewalUrl: "https://www.gov.br/pt-br/servicos/obter-passaporte-comum",
    appointmentUrl: "https://prenotaonline.esteri.it/",
    apostilleInfo: "Required - get from local cartório (notary office)",
    paymentMethod: "Bank transfer (check embassy website for details)"
  },
  { 
    value: "pakistan", 
    label: "Pakistan", 
    processingWeeks: "8-10", 
    embassyUrl: "https://ambislamabad.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/pak/en/ita",
    passportRenewalUrl: "https://www.dgip.gov.pk/",
    appointmentUrl: "https://visa.vfsglobal.com/pak/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from Ministry of Foreign Affairs",
    paymentMethod: "Cash at VFS center (PKR)"
  },
  { 
    value: "other", 
    label: "Other", 
    processingWeeks: "6-8", 
    embassyUrl: "https://www.esteri.it/en/ministero/la_rete_diplomatica/", 
    vfsUrl: null,
    passportRenewalUrl: null,
    appointmentUrl: "https://prenotaonline.esteri.it/",
    apostilleInfo: "Check with your local authorities for apostille requirements",
    paymentMethod: "Check with your local embassy for payment methods"
  }
];

interface DocumentDetails {
  keyInfo?: string;
  acceptanceRules?: {
    valid: string[];
    invalid?: string[];
  };
  commonMistakes?: string[];
  howToObtain?: string;
  officialLinks?: Array<{
    label: string;
    url: string;
    description: string;
  }>;
  tips?: string[];
}

interface VisaDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  image: string;
  details: DocumentDetails;
}

const baseDocuments: VisaDocument[] = [
  {
    id: "passport",
    name: "Valid Passport",
    description: "Must be valid for at least 3 months after visa expiry date",
    required: true,
    image: passportImg,
    details: {
      keyInfo: "Validity must extend 3+ months AFTER visa end date, not arrival date.",
      acceptanceRules: {
        valid: [
          "Valid 3+ months AFTER visa expiry date",
          "At least 2 blank pages for stamps"
        ],
        invalid: [
          "Temporary/emergency travel documents"
        ]
      },
      commonMistakes: [
        "Renewal takes 4-8 weeks - start early",
        "Validity must extend AFTER visa ends, not just after arrival"
      ],
      tips: [
        "If close to expiry, renew BEFORE starting visa process"
      ]
    }
  },
  {
    id: "admission",
    name: "University Acceptance Letter",
    description: "Official acceptance from your Italian university",
    required: true,
    image: admissionImg,
    details: {
      keyInfo: "Must be FINAL acceptance (not conditional) with program dates.",
      acceptanceRules: {
        valid: [
          "Final (unconditional) acceptance on official letterhead",
          "Includes program name, start date, and end date",
          "Official stamp and/or authorized signature"
        ],
        invalid: [
          "Conditional offers (pending language test, documents)",
          "UNIVERSITALY confirmation alone (need university letter too)"
        ]
      },
      howToObtain: "Download from your university portal. Politecnico: Online Services → Career → Enrollment Status → Download Documents.",
      officialLinks: [
        {
          label: "UNIVERSITALY Portal",
          url: "https://www.universitaly.it/",
          description: "Official pre-enrollment platform"
        }
      ]
    }
  },
  {
    id: "application",
    name: "Visa Application Form",
    description: "Fill out the national D-visa application form for Italy",
    required: true,
    image: applicationImg,
    details: {
      keyInfo: "Must select Type D (National), NOT Type C (Schengen/tourist).",
      acceptanceRules: {
        valid: [
          "Completed in CAPITAL LETTERS or typed",
          "Visa type: D (National) for Study/Studio",
          "Signed and dated in ink"
        ],
        invalid: [
          "Wrong visa type (C instead of D)",
          "Missing signature"
        ]
      },
      commonMistakes: [
        "Selecting Type C (Schengen) instead of Type D (National)",
        "Leaving 'Address in Italy' blank - use university address if unsure"
      ],
      officialLinks: [
        {
          label: "Official MAECI Visa Portal",
          url: "https://vistoperitalia.esteri.it/home/en",
          description: "Download Type D visa form"
        }
      ]
    }
  },
  {
    id: "insurance",
    name: "Health Insurance",
    description: "Coverage for entire visa period (minimum €30,000)",
    required: true,
    image: insuranceImg,
    details: {
      acceptanceRules: {
        valid: [
          "Minimum €30,000 coverage",
          "Covers ENTIRE visa period (entry to expiry)",
          "Valid in Italy and all Schengen countries"
        ],
        invalid: [
          "Travel insurance without medical coverage",
          "Dates don't match visa period exactly"
        ]
      },
      commonMistakes: [
        "Coverage dates not matching visa dates exactly"
      ],
      officialLinks: [
        {
          label: "SWISSCARE",
          url: "https://www.swisscare.com/",
          description: "Commonly accepted for Italian visas"
        },
        {
          label: "DR-WALTER EDUCARE24",
          url: "https://www.dr-walter.com/en/educare24.html",
          description: "Popular student choice"
        }
      ],
      tips: [
        "After arrival, enroll in SSN (Italian NHS) for €149.77/year"
      ]
    }
  },
  {
    id: "financial",
    name: "Proof of Financial Means",
    description: "Bank statements showing €506/month or sponsorship letter",
    required: true,
    image: financialImg,
    details: {
      keyInfo: "Minimum €6,079.45/year (€506.62/month × 12) - 2024/2025 rates.",
      acceptanceRules: {
        valid: [
          "Bank statements from last 3-6 months showing consistent balance",
          "Scholarship letter covering full amount",
          "Sponsor bank statement WITH notarized sponsorship letter"
        ],
        invalid: [
          "Banking app screenshots",
          "Sponsor letter without bank proof"
        ]
      },
      commonMistakes: [
        "Sponsor letter not notarized/apostilled"
      ],
      tips: [
        "€506.62/month is MINIMUM - showing more improves your application"
      ]
    }
  },
  {
    id: "accommodation",
    name: "Proof of Accommodation",
    description: "Rental contract, university housing letter, or declaration of hospitality",
    required: true,
    image: accommodationImg,
    details: {
      acceptanceRules: {
        valid: [
          "Signed rental contract with landlord details",
          "University dormitory confirmation",
          "Dichiarazione di Ospitalità (from Italian host)",
          "Hotel/Airbnb for first 2-4 weeks + statement of intent"
        ],
        invalid: [
          "Contracts missing landlord's codice fiscale"
        ]
      },
      commonMistakes: [
        "⚠️ SCAM: Never pay before verifying landlord/seeing property",
        "Contract missing landlord's codice fiscale (Italian tax code)"
      ],
      officialLinks: [
        {
          label: "Spotahome",
          url: "https://www.spotahome.com/",
          description: "Verified rentals"
        }
      ],
      tips: [
        "University housing deadlines often May/June - apply early"
      ]
    }
  },
  {
    id: "photos",
    name: "Passport Photos",
    description: "2 recent passport-sized photos (35x45mm, white background)",
    required: true,
    image: photosImg,
    details: {
      acceptanceRules: {
        valid: [
          "Size: 35mm × 45mm",
          "Taken within last 6 months",
          "White/light background",
          "No glasses (new rule at most embassies)"
        ]
      },
      tips: [
        "Bring 4 photos (embassy keeps 2, extras for other documents)"
      ]
    }
  },
  {
    id: "fee",
    name: "Visa Fee Payment",
    description: "€116 national visa fee (payment method varies by embassy)",
    required: true,
    image: paymentImg,
    details: {
      keyInfo: "€116 for National (D) visa - NON-REFUNDABLE even if denied.",
      commonMistakes: [
        "Bringing only card when embassy requires cash (or vice versa)",
        "VFS centers have additional service fees (€20-30)"
      ],
      officialLinks: [
        {
          label: "Find Your Embassy",
          url: "https://www.esteri.it/en/ministero/la_rete_diplomatica/",
          description: "Embassy payment requirements"
        }
      ]
    }
  }
];

const VisaWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    university: "polimi",
    intendedArrival: ""
  });
  const [documentStatus, setDocumentStatus] = useState<Record<string, boolean>>({});
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  const totalSteps = 5;
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  const documents = baseDocuments;
  const completedDocs = Object.values(documentStatus).filter(Boolean).length;
  const selectedCountryData = countries.find(c => c.value === formData.country);

  // Persist country selection to localStorage for other Phase 1 pages
  useEffect(() => {
    if (formData.country) {
      setStoredCountry(formData.country);
    }
  }, [formData.country]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const toggleDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentStatus(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const toggleExpanded = (docId: string) => {
    setExpandedDocument(prev => prev === docId ? null : docId);
  };

  // Generate country-specific links for each document
  const getCountrySpecificLinks = (documentId: string) => {
    if (!selectedCountryData) return [];
    
    const countryLinks: Array<{ label: string; url: string; description: string }> = [];
    
    switch (documentId) {
      case "passport":
        if (selectedCountryData.passportRenewalUrl) {
          countryLinks.push({
            label: `${selectedCountryData.label} Passport Services`,
            url: selectedCountryData.passportRenewalUrl,
            description: `Official passport renewal for ${selectedCountryData.label}`
          });
        }
        break;
      case "embassy-appointment":
        countryLinks.push({
          label: `Italian Embassy in ${selectedCountryData.label}`,
          url: selectedCountryData.embassyUrl,
          description: "Official embassy website"
        });
        if (selectedCountryData.vfsUrl) {
          countryLinks.push({
            label: `VFS Global ${selectedCountryData.label}`,
            url: selectedCountryData.vfsUrl,
            description: "Book your visa appointment"
          });
        }
        if (selectedCountryData.appointmentUrl) {
          countryLinks.push({
            label: "Book Appointment",
            url: selectedCountryData.appointmentUrl,
            description: "Direct appointment booking link"
          });
        }
        break;
      case "fee":
        countryLinks.push({
          label: `Embassy in ${selectedCountryData.label}`,
          url: selectedCountryData.embassyUrl,
          description: `Payment: ${selectedCountryData.paymentMethod}`
        });
        break;
      case "financial":
        if (selectedCountryData.apostilleInfo) {
          countryLinks.push({
            label: `Apostille in ${selectedCountryData.label}`,
            url: selectedCountryData.embassyUrl,
            description: selectedCountryData.apostilleInfo
          });
        }
        break;
    }
    
    return countryLinks;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.fullName && formData.email;
      case 2:
        return formData.country;
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-4 sm:py-6 px-4 shadow-elevated">
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
            Italian Student Visa Wizard
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/90 mt-1 sm:mt-2">
            Step-by-step guidance for your D-Visa application
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-muted/50 py-4 sm:py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {currentStep === 0 ? "Overview" : `Step ${currentStep} of ${totalSteps - 1}`}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5 sm:h-2" />
          
          {/* Step indicators */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-4 sm:mt-6">
            {[
              { num: 0, label: "Overview" },
              { num: 1, label: "Personal Info" },
              { num: 2, label: "Country" },
              { num: 3, label: "Documents" },
              { num: 4, label: "Timeline" }
            ].map((step) => (
              <div
                key={step.num}
                className={cn(
                  "flex flex-col items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg transition-all min-h-[44px]",
                  currentStep === step.num && "bg-primary/10",
                  currentStep > step.num && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
                    currentStep === step.num && "bg-primary text-primary-foreground",
                    currentStep > step.num && "bg-success text-success-foreground",
                    currentStep < step.num && "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.num ? <CheckCircle2 className="w-4 h-4 sm:w-4 sm:h-4" /> : step.num === 0 ? <Info className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-[10px] sm:text-xs text-center font-medium leading-tight">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-4 sm:p-6 md:p-8 shadow-elevated">
            {/* Step 0: Overview */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Understanding the Italian Student Visa</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Before we start your application, here's what you need to know about the D-Visa process.
                  </p>
                </div>

                {/* Visa Overview */}
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    What is the Italian Student Visa (D-Visa)?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Type D (National) visa is required for non-EU students planning to study in Italy for more than 90 days. 
                    This visa allows you to:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Stay in Italy for the duration of your studies
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Work part-time (up to 20 hours/week during semester)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Travel within the Schengen Area
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Apply for a Residence Permit (Permesso di Soggiorno) upon arrival
                    </li>
                  </ul>
                </Card>

                {/* Process Overview */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">The Application Process</h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Gather Documents", desc: "Collect all required documents (admission letter, passport, insurance, etc.)" },
                      { step: 2, title: "Book Embassy Appointment", desc: "Schedule your visa appointment at the Italian embassy/consulate" },
                      { step: 3, title: "Attend Interview", desc: "Submit documents and provide biometrics at your appointment" },
                      { step: 4, title: "Wait for Processing", desc: "Typical processing time is 4-12 weeks depending on your country" },
                      { step: 5, title: "Receive Visa", desc: "Collect your passport with the visa stamp and book your flight!" }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{item.step}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Resources */}
                <Card className="p-6 bg-secondary/5 border-secondary/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-secondary" />
                    Official Resources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://vistoperitalia.esteri.it/home/en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-secondary" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground group-hover:text-secondary">Official Visa Portal</span>
                        <p className="text-xs text-muted-foreground">vistoperitalia.esteri.it</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                    <a
                      href="https://www.esteri.it/en/ministero/la_rete_diplomatica/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-secondary" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground group-hover:text-secondary">Find Your Embassy</span>
                        <p className="text-xs text-muted-foreground">Italian diplomatic network</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  </div>
                </Card>

                <Button onClick={handleNext} className="w-full" size="lg">
                  Start Application Wizard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Personal Information</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Let's start with your basic details</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (as in passport)</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">Italian University</Label>
                    <Select value={formData.university} onValueChange={(value) => setFormData({ ...formData, university: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polimi">Politecnico di Milano</SelectItem>
                        <SelectItem value="unimi">University of Milano</SelectItem>
                        <SelectItem value="bocconi">Bocconi University</SelectItem>
                        <SelectItem value="sapienza">Sapienza University of Rome</SelectItem>
                        <SelectItem value="polito">Politecnico di Torino</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival">Intended Arrival Date</Label>
                    <Input
                      id="arrival"
                      type="date"
                      value={formData.intendedArrival}
                      onChange={(e) => setFormData({ ...formData, intendedArrival: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Country Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Country of Residence</h2>
                  <p className="text-muted-foreground">
                    Select where you'll be applying from - this determines embassy processing times
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Select Your Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.country && selectedCountryData && (
                  <>
                    <Card className="p-6 bg-primary/5 border-primary/20 animate-in fade-in duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Processing Time for {selectedCountryData.label}</h3>
                          <p className="text-2xl font-bold text-primary mb-2">{selectedCountryData.processingWeeks} weeks</p>
                          <p className="text-sm text-muted-foreground">
                            This is the typical processing time at the Italian embassy/consulate in {selectedCountryData.label}.
                            We recommend applying at least 2 months before your intended travel date.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Embassy Links */}
                    <Card className="p-6 bg-secondary/5 border-secondary/20">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-secondary" />
                        Embassy & Appointment Links
                      </h3>
                      <div className="space-y-3">
                        <a
                          href={selectedCountryData.embassyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 text-secondary" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                              Italian Embassy in {selectedCountryData.label}
                            </span>
                            <p className="text-xs text-muted-foreground">Official embassy website</p>
                          </div>
                        </a>
                        {selectedCountryData.vfsUrl && (
                          <a
                            href={selectedCountryData.vfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                          >
                            <ExternalLink className="w-4 h-4 text-secondary" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                                VFS Global - Book Appointment
                              </span>
                              <p className="text-xs text-muted-foreground">Schedule your visa appointment</p>
                            </div>
                          </a>
                        )}
                        <a
                          href="https://prenotaonline.esteri.it/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 text-secondary" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                              Prenota Online
                            </span>
                            <p className="text-xs text-muted-foreground">Alternative appointment booking system</p>
                          </div>
                        </a>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Document Checklist */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Document Checklist</h2>
                  <p className="text-muted-foreground">
                    Click on each document to see detailed instructions and requirements
                  </p>
                  <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">
                      {completedDocs} of {documents.length} documents ready
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className={cn(
                        "transition-all",
                        documentStatus[doc.id] && "bg-success/5 border-success/30",
                        expandedDocument === doc.id && "ring-2 ring-primary/20"
                      )}
                    >
                      {/* Card Header - Always visible */}
                      <div
                        className="p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleExpanded(doc.id)}
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          {/* Document Image */}
                          <div className="w-full sm:w-16 h-40 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30">
                            <img 
                              src={doc.image} 
                              alt={doc.name}
                              className="w-full h-full object-contain sm:object-cover"
                            />
                          </div>

                          <div className="flex items-start gap-3 w-full">
                            <div 
                              className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                              onClick={(e) => toggleDocument(doc.id, e)}
                            >
                              <Checkbox
                                checked={documentStatus[doc.id] || false}
                                onCheckedChange={() => {}}
                                className="flex-shrink-0"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold text-sm sm:text-base text-foreground">{doc.name}</h4>
                                {doc.required && (
                                  <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium whitespace-nowrap">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">{doc.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {documentStatus[doc.id] ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                              {expandedDocument === doc.id ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedDocument === doc.id && (
                        <div className="px-4 pb-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                          <div className="pt-4 space-y-4">
                            {/* Key Info */}
                            {doc.details.keyInfo && (
                              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <p className="text-sm text-foreground font-medium">
                                  {doc.details.keyInfo}
                                </p>
                              </div>
                            )}

                            {/* Acceptance Rules */}
                            {doc.details.acceptanceRules && (
                              <div className={`grid grid-cols-1 ${doc.details.acceptanceRules.invalid ? 'md:grid-cols-2' : ''} gap-4`}>
                                {/* Valid */}
                                <div className="space-y-2 p-3 bg-success/5 rounded-lg border border-success/20">
                                  <h5 className="text-sm font-semibold text-success flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    What's Accepted
                                  </h5>
                                  <ul className="space-y-1.5">
                                    {doc.details.acceptanceRules.valid.map((rule, idx) => (
                                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                        <Check className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
                                        {rule}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Invalid - only show if exists */}
                                {doc.details.acceptanceRules.invalid && doc.details.acceptanceRules.invalid.length > 0 && (
                                  <div className="space-y-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                                    <h5 className="text-sm font-semibold text-destructive flex items-center gap-2">
                                      <X className="w-4 h-4" />
                                      What's NOT Accepted
                                    </h5>
                                    <ul className="space-y-1.5">
                                      {doc.details.acceptanceRules.invalid.map((rule, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                          <X className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                                          {rule}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Common Mistakes */}
                            {doc.details.commonMistakes && doc.details.commonMistakes.length > 0 && (
                              <div className="space-y-2 p-3 bg-warning/5 rounded-lg border border-warning/20">
                                <h5 className="text-sm font-semibold text-warning flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Common Mistakes to Avoid
                                </h5>
                                <ul className="space-y-1.5">
                                  {doc.details.commonMistakes.map((mistake, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                                      {mistake}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* How to Obtain */}
                            {doc.details.howToObtain && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  How to Obtain
                                </h5>
                                <p className="text-sm text-muted-foreground pl-6">
                                  {doc.details.howToObtain}
                                </p>
                              </div>
                            )}

                            {/* Official Links */}
                            {(() => {
                              const countryLinks = getCountrySpecificLinks(doc.id);
                              const allLinks = [...countryLinks, ...(doc.details.officialLinks || [])];
                              
                              if (allLinks.length === 0) return null;
                              
                              return (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-secondary" />
                                    Official Links & Resources
                                    {countryLinks.length > 0 && selectedCountryData && (
                                      <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {selectedCountryData.label}
                                      </span>
                                    )}
                                  </h5>
                                  {!formData.country && (
                                    <p className="text-xs text-muted-foreground pl-6 italic">
                                      Select your country in Step 2 to see country-specific links
                                    </p>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                                    {allLinks.map((link, idx) => (
                                      <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                          "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-xs",
                                          idx < countryLinks.length ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                                        )}
                                      >
                                        <ExternalLink className={cn(
                                          "w-3 h-3 flex-shrink-0",
                                          idx < countryLinks.length ? "text-primary" : "text-secondary"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                          <span className="font-medium text-foreground group-hover:text-secondary block truncate">
                                            {link.label}
                                          </span>
                                          <span className="text-muted-foreground truncate block">
                                            {link.description}
                                          </span>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Tips */}
                            {doc.details.tips && doc.details.tips.length > 0 && (
                              <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <h5 className="text-sm font-semibold text-primary flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Pro Tips
                                </h5>
                                <ul className="space-y-1.5">
                                  {doc.details.tips.map((tip, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <Lightbulb className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Mark as Ready Button */}
                            <div className="pt-2">
                              <Button
                                variant={documentStatus[doc.id] ? "outline" : "default"}
                                size="sm"
                                onClick={(e) => toggleDocument(doc.id, e)}
                                className="w-full sm:w-auto"
                              >
                                {documentStatus[doc.id] ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Marked as Ready
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-4 h-4 mr-2" />
                                    Mark as Ready
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <Card className="p-6 bg-accent/5 border-accent/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Important Tips</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Make copies of all documents - bring both originals and copies to your appointment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>All documents in foreign languages must be officially translated to Italian or English</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Book your embassy appointment as soon as you have all required documents</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Timeline & Next Steps */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Your Visa Timeline</h2>
                  <p className="text-muted-foreground">
                    Here's what to expect and when
                  </p>
                </div>

                {/* Timeline visualization */}
                <div className="space-y-4">
                  <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Now: Prepare Documents</h3>
                      <p className="text-sm text-muted-foreground">
                        Gather all required documents. Most students need 1-2 weeks for this step.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Week 2: Book Embassy Appointment</h3>
                      <p className="text-sm text-muted-foreground">
                        Once documents are ready, book your appointment at the Italian embassy/consulate.
                        Appointment slots can fill up quickly during peak season (June-August).
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Week 3-4: Attend Appointment</h3>
                      <p className="text-sm text-muted-foreground">
                        Submit your application, documents, and biometrics at the embassy.
                        Your passport will be kept during processing.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-success" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">
                        Week {selectedCountryData ? selectedCountryData.processingWeeks.split('-')[0] : '6'}-
                        {selectedCountryData ? selectedCountryData.processingWeeks.split('-')[1] : '8'}: Receive Visa
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        After {selectedCountryData?.processingWeeks || '6-8'} weeks, collect your passport with the visa stamp.
                        You can then book your flight to Italy!
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="p-6 bg-success/5 border-success/30">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">You're All Set!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You now have a complete understanding of the visa process. Remember to start early and
                        keep copies of everything you submit.
                      </p>
                      
                      {/* FAQ and Chat Tabs */}
                      <Tabs defaultValue="faq" className="w-full mt-6">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="faq">FAQs</TabsTrigger>
                          <TabsTrigger value="chat">Community Chat</TabsTrigger>
                        </TabsList>
                        <TabsContent value="faq" className="mt-4">
                          <TaskFAQ taskId={formData.country ? `visa-${formData.country}` : 'visa-general'} phase="phase-1" />
                        </TabsContent>
                        <TabsContent value="chat" className="mt-4">
                          <TaskChat taskId={formData.country ? `visa-${formData.country}` : 'visa-general'} phase="phase-1" />
                        </TabsContent>
                      </Tabs>
                      
                      <Link to="/" className="block mt-6">
                        <Button className="w-full">
                          Return to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 sm:mt-8 pt-6 sm:pt-8 border-t gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">{currentStep === 0 ? "Start" : "Next Step"}</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              ) : (
                <Link to="/">
                  <Button className="text-sm sm:text-base">
                    Finish
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>

      {formData.country && (
        <FloatingChat 
          taskId={`visa-${formData.country}`} 
          phase="phase-1"
          label={`${countries.find(c => c.value === formData.country)?.label || formData.country} Community`}
        />
      )}
    </div>
  );
};

export default VisaWizard;
