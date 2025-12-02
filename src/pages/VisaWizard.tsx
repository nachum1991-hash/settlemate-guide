import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Country-specific data
const countries = [
  { value: "israel", label: "Israel", processingWeeks: "4-6" },
  { value: "india", label: "India", processingWeeks: "6-8" },
  { value: "iran", label: "Iran", processingWeeks: "8-12" },
  { value: "turkey", label: "Turkey", processingWeeks: "4-6" },
  { value: "china", label: "China", processingWeeks: "6-10" },
  { value: "brazil", label: "Brazil", processingWeeks: "5-7" },
  { value: "pakistan", label: "Pakistan", processingWeeks: "8-10" },
  { value: "other", label: "Other", processingWeeks: "6-8" }
];

const baseDocuments = [
  {
    id: "passport",
    name: "Valid Passport",
    description: "Must be valid for at least 3 months after visa expiry date",
    required: true
  },
  {
    id: "admission",
    name: "University Admission Letter",
    description: "Official acceptance from Politecnico di Milano or your Italian university",
    required: true
  },
  {
    id: "insurance",
    name: "Health Insurance",
    description: "Coverage for entire visa period (minimum €30,000)",
    required: true
  },
  {
    id: "accommodation",
    name: "Proof of Accommodation",
    description: "Rental contract, university housing letter, or declaration of hospitality",
    required: true
  },
  {
    id: "financial",
    name: "Proof of Financial Means",
    description: "Bank statements showing €460/month or sponsorship letter",
    required: true
  },
  {
    id: "photos",
    name: "Passport Photos",
    description: "2 recent passport-sized photos (35x40mm, white background)",
    required: true
  },
  {
    id: "application",
    name: "Completed Visa Application Form",
    description: "Fill out the national D-visa application form for Italy",
    required: true
  },
  {
    id: "fee",
    name: "Visa Fee Payment",
    description: "€116 (varies by country and processing speed)",
    required: true
  }
];

// Additional documents for specific countries
const countrySpecificDocs: Record<string, any[]> = {
  india: [
    {
      id: "pcc",
      name: "Police Clearance Certificate",
      description: "Required for applicants over 18 years old",
      required: true
    }
  ],
  iran: [
    {
      id: "birth",
      name: "Birth Certificate (translated)",
      description: "Official translation in Italian or English",
      required: true
    }
  ],
  china: [
    {
      id: "travel",
      name: "Previous Travel History",
      description: "Copies of previous Schengen visas if applicable",
      required: false
    }
  ]
};

const VisaWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    university: "polimi",
    intendedArrival: ""
  });
  const [documentStatus, setDocumentStatus] = useState<Record<string, boolean>>({});

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Get documents based on selected country
  const getDocuments = () => {
    const docs = [...baseDocuments];
    if (formData.country && countrySpecificDocs[formData.country]) {
      docs.push(...countrySpecificDocs[formData.country]);
    }
    return docs;
  };

  const documents = getDocuments();
  const completedDocs = Object.values(documentStatus).filter(Boolean).length;
  const selectedCountryData = countries.find(c => c.value === formData.country);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
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
      case 1:
        return formData.fullName && formData.email;
      case 2:
        return formData.country;
      case 3:
        return true; // Can always proceed from checklist
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-6 px-4 shadow-elevated">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Italian Student Visa Wizard
          </h1>
          <p className="text-primary-foreground/90 mt-2">
            Step-by-step guidance for your D-Visa application
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-muted/50 py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { num: 1, label: "Personal Info" },
              { num: 2, label: "Country" },
              { num: 3, label: "Documents" },
              { num: 4, label: "Timeline" }
            ].map((step) => (
              <div
                key={step.num}
                className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                  currentStep === step.num && "bg-primary/10",
                  currentStep > step.num && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    currentStep === step.num && "bg-primary text-primary-foreground",
                    currentStep > step.num && "bg-success text-success-foreground",
                    currentStep < step.num && "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-xs text-center font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 shadow-elevated">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
                  <p className="text-muted-foreground">Let's start with your basic details</p>
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
                    Select where you'll be applying from - this determines embassy processing times and requirements
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
                )}

                {formData.country && countrySpecificDocs[formData.country] && (
                  <Card className="p-6 bg-secondary/5 border-secondary/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Additional Requirements for {selectedCountryData?.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          Applicants from {selectedCountryData?.label} need {countrySpecificDocs[formData.country].length} additional document(s).
                          You'll see these in the next step.
                        </p>
                      </div>
                    </div>
                  </Card>
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
                        "p-4 cursor-pointer transition-all hover:shadow-md",
                        documentStatus[doc.id] && "bg-success/5 border-success/30"
                      )}
                      onClick={() => toggleDocument(doc.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={documentStatus[doc.id] || false}
                          onCheckedChange={() => toggleDocument(doc.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{doc.name}</h4>
                            {doc.required && (
                              <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                          {documentStatus[doc.id] ? (
                            <CheckCircle2 className="w-6 h-6 text-success" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-6 bg-accent/5 border-accent/20">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
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
                      <Button
                        onClick={() => navigate("/")}
                        className="w-full"
                      >
                        Return to Dashboard
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => navigate("/")}>
                  Finish
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisaWizard;
