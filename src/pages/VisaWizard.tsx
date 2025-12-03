import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Calendar, AlertCircle, ExternalLink, Info, Globe } from "lucide-react";
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
  { value: "israel", label: "Israel", processingWeeks: "4-6", embassyUrl: "https://ambtelaviv.esteri.it/", vfsUrl: "https://visa.vfsglobal.com/isr/en/ita" },
  { value: "india", label: "India", processingWeeks: "6-8", embassyUrl: "https://ambdelhi.esteri.it/", vfsUrl: "https://visa.vfsglobal.com/ind/en/ita" },
  { value: "iran", label: "Iran", processingWeeks: "8-12", embassyUrl: "https://ambtehran.esteri.it/", vfsUrl: null },
  { value: "turkey", label: "Turkey", processingWeeks: "4-6", embassyUrl: "https://ambankara.esteri.it/", vfsUrl: "https://visa.vfsglobal.com/tur/en/ita" },
  { value: "china", label: "China", processingWeeks: "6-10", embassyUrl: "https://ambpechino.esteri.it/", vfsUrl: "https://visa.vfsglobal.com/chn/en/ita" },
  { value: "brazil", label: "Brazil", processingWeeks: "5-7", embassyUrl: "https://ambbrasilia.esteri.it/", vfsUrl: null },
  { value: "pakistan", label: "Pakistan", processingWeeks: "8-10", embassyUrl: "https://ambislamabad.esteri.it/", vfsUrl: "https://visa.vfsglobal.com/pak/en/ita" },
  { value: "other", label: "Other", processingWeeks: "6-8", embassyUrl: "https://www.esteri.it/en/ministero/la_rete_diplomatica/", vfsUrl: null }
];

const baseDocuments = [
  {
    id: "passport",
    name: "Valid Passport",
    description: "Must be valid for at least 3 months after visa expiry date",
    required: true,
    image: passportImg
  },
  {
    id: "admission",
    name: "University Admission Letter",
    description: "Official acceptance from Politecnico di Milano or your Italian university",
    required: true,
    image: admissionImg
  },
  {
    id: "insurance",
    name: "Health Insurance",
    description: "Coverage for entire visa period (minimum €30,000)",
    required: true,
    image: insuranceImg
  },
  {
    id: "accommodation",
    name: "Proof of Accommodation",
    description: "Rental contract, university housing letter, or declaration of hospitality",
    required: true,
    image: accommodationImg
  },
  {
    id: "financial",
    name: "Proof of Financial Means",
    description: "Bank statements showing €460/month or sponsorship letter",
    required: true,
    image: financialImg
  },
  {
    id: "photos",
    name: "Passport Photos",
    description: "2 recent passport-sized photos (35x40mm, white background)",
    required: true,
    image: photosImg
  },
  {
    id: "application",
    name: "Completed Visa Application Form",
    description: "Fill out the national D-visa application form for Italy",
    required: true,
    image: applicationImg
  },
  {
    id: "fee",
    name: "Visa Fee Payment",
    description: "€116 (varies by country and processing speed)",
    required: true,
    image: paymentImg
  }
];

const VisaWizard = () => {
  const [currentStep, setCurrentStep] = useState(0); // Start at overview (step 0)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    university: "polimi",
    intendedArrival: ""
  });
  const [documentStatus, setDocumentStatus] = useState<Record<string, boolean>>({});

  const totalSteps = 5; // Now 5 steps including overview
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  const documents = baseDocuments;
  const completedDocs = Object.values(documentStatus).filter(Boolean).length;
  const selectedCountryData = countries.find(c => c.value === formData.country);

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

  const toggleDocument = (docId: string) => {
    setDocumentStatus(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Overview
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
                    Check off documents as you prepare them
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
                        "p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md",
                        documentStatus[doc.id] && "bg-success/5 border-success/30"
                      )}
                      onClick={() => toggleDocument(doc.id)}
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
                          <div className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0">
                            <Checkbox
                              checked={documentStatus[doc.id] || false}
                              onCheckedChange={() => toggleDocument(doc.id)}
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
                          <div className="flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]">
                            {documentStatus[doc.id] ? (
                              <CheckCircle2 className="w-6 h-6 sm:w-6 sm:h-6 text-success" />
                            ) : (
                              <Circle className="w-6 h-6 sm:w-6 sm:h-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
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
                          <TaskFAQ taskId="visa" phase="phase-1" />
                        </TabsContent>
                        <TabsContent value="chat" className="mt-4">
                          <TaskChat taskId="visa" phase="phase-1" />
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
    </div>
  );
};

export default VisaWizard;
