import { useState } from "react";
import { 
  MapPin, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Lightbulb,
  ExternalLink,
  Globe,
  Building,
  MessageCircle,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
  Info,
  CheckCircle,
  Upload,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskChat } from "./TaskChat";
import { TaskFAQ } from "./TaskFAQ";
import type { Step, OfficialResource, Partner } from "./BureaucracyTimeline";
import { useCity } from "@/contexts/CityContext";
import { getDocumentsForStep, type ArrivalDocument } from "@/data/arrivalDocuments";
import { cn } from "@/lib/utils";
import { useDocumentUploads } from "@/hooks/useDocumentUploads";
import { DocumentUploadComponent } from "./DocumentUpload";
import { useAuth } from "@/contexts/AuthContext";

// Community groups for each step - verified links to official resources and real Facebook groups
const communityGroups: Record<string, { name: string; url: string; platform: string }[]> = {
  codice: [
    { name: "PoliNetwork Student Hub", url: "https://linktr.ee/polinetwork", platform: "Multi-platform" },
    { name: "Expats Living in Italy", url: "https://www.facebook.com/groups/expatslivinginitaly", platform: "Facebook" }
  ],
  sim: [
    { name: "Expats in Milano", url: "https://www.facebook.com/groups/expatsinmilano", platform: "Facebook" }
  ],
  permesso: [
    { name: "Portale Immigrazione (Official)", url: "https://www.portaleimmigrazione.it/", platform: "Website" },
    { name: "Expats Living in Italy", url: "https://www.facebook.com/groups/expatslivinginitaly", platform: "Facebook" }
  ],
  atm: [
    { name: "ATM Milano Official", url: "https://www.atm.it/", platform: "Website" }
  ],
  bank: [
    { name: "Expats in Milano", url: "https://www.facebook.com/groups/expatsinmilano", platform: "Facebook" }
  ],
  housing: [
    { name: "Milan Housing - Expats", url: "https://www.facebook.com/groups/expatsinmilano", platform: "Facebook" },
    { name: "PoliNetwork Groups", url: "https://linktr.ee/polinetwork", platform: "Multi-platform" }
  ]
};

// Map step IDs to document keys
const stepToDocumentKey: Record<string, string> = {
  'codice': 'codice-fiscale',
  'permesso': 'residence-permit'
};

interface BureaucracyDetailProps {
  step: Step;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

// Expandable Document Card Component
interface DocumentCardProps {
  doc: ArrivalDocument;
  selectedCity: string;
  isUploaded: boolean;
  upload?: ReturnType<typeof useDocumentUploads>['uploads'][string];
  isUploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onView: () => Promise<void>;
  onDownload: () => Promise<void>;
  onPrint: () => Promise<void>;
  isAuthenticated: boolean;
  isReady: boolean;
  onToggleReady: () => void;
}

const DocumentCard = ({ 
  doc, 
  selectedCity, 
  isUploaded, 
  upload,
  isUploading,
  onUpload,
  onDelete,
  onView,
  onDownload,
  onPrint,
  isAuthenticated,
  isReady,
  onToggleReady
}: DocumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { details } = doc;

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
      {/* Document Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors text-left"
      >
        {/* Document Image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center border border-border/30">
          <img 
            src={doc.image} 
            alt={doc.name}
            className="w-full h-full object-contain p-1"
          />
        </div>
        
        {/* Document Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h6 className="font-semibold text-sm sm:text-base text-foreground">{doc.name}</h6>
            {isReady && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Ready</span>
              </span>
            )}
            {isUploaded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Uploaded</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
        </div>
        
        {/* Chevron */}
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Separator className="mb-4" />
          
          {/* Key Info Box */}
          {details.keyInfo && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Key Information</span>
                  <p className="text-sm text-foreground mt-1">{details.keyInfo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Acceptance Rules - Stacked Cards for Clarity */}
          {details.acceptanceRules && (
            <div className="space-y-3">
              {/* What's Accepted Card */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-800 dark:text-green-300">What's Accepted</span>
                </div>
                <ul className="space-y-2">
                  {details.acceptanceRules.valid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-200">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's NOT Accepted Card */}
              {details.acceptanceRules.invalid && details.acceptanceRules.invalid.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-red-800 dark:text-red-300">NOT Accepted</span>
                  </div>
                  <ul className="space-y-2">
                    {details.acceptanceRules.invalid.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
                        <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Common Mistakes */}
          {details.commonMistakes && details.commonMistakes.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Common Mistakes to Avoid</span>
              </div>
              <ul className="space-y-2">
                {details.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
                    <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to Obtain */}
          {details.howToObtain && (
            <div className="p-4 bg-muted/40 rounded-xl">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wide">How to Obtain</span>
                  <p className="text-sm text-muted-foreground mt-1">{details.howToObtain}</p>
                </div>
              </div>
            </div>
          )}

          {/* City-Specific Links */}
          {details.citySpecificLinks && details.citySpecificLinks[selectedCity as keyof typeof details.citySpecificLinks] && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary capitalize">{selectedCity} Resources</span>
              </div>
              <div className="space-y-2">
                {details.citySpecificLinks[selectedCity as keyof typeof details.citySpecificLinks]?.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/60 hover:bg-background border border-border/30 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">{link.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official Links */}
          {details.officialLinks && details.officialLinks.length > 0 && (
            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Official Resources</span>
              </div>
              <div className="space-y-2">
                {details.officialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/60 hover:bg-background border border-border/30 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors block">{link.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tips */}
          {details.tips && details.tips.length > 0 && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-sm font-semibold text-accent">Pro Tips</span>
              </div>
              <ul className="space-y-2">
                {details.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-accent flex-shrink-0">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Document Upload Section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Your Upload</span>
            </div>
            {isAuthenticated ? (
              <DocumentUploadComponent
                documentId={doc.id}
                upload={upload}
                isUploading={isUploading}
                onUpload={onUpload}
                onDelete={onDelete}
                onView={onView}
                onDownload={onDownload}
                onPrint={onPrint}
                disabled={false}
              />
            ) : (
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Sign in to upload and track your documents</p>
              </div>
            )}
          </div>

          {/* Mark as Ready Button */}
          <div className="pt-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReady();
              }}
              variant={isReady ? "outline" : "default"}
              className="w-full gap-2"
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Marked as Ready
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Mark as Ready
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const BureaucracyDetail = ({ step, isCompleted, onToggleComplete }: BureaucracyDetailProps) => {
  const { selectedCity } = useCity();
  const { user } = useAuth();
  const groups = communityGroups[step.id] || [];
  
  // Get detailed documents for this step
  const documentKey = stepToDocumentKey[step.id] || step.id;
  const detailedDocuments = getDocumentsForStep(documentKey);
  
  // Track document ready status (local state, like Visa Wizard)
  const [documentReadyStatus, setDocumentReadyStatus] = useState<Record<string, boolean>>({});
  
  const toggleDocumentReady = (docId: string) => {
    setDocumentReadyStatus(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };
  
  // Document uploads hook
  const { 
    uploads, 
    uploading, 
    uploadDocument, 
    deleteDocument, 
    getViewUrl,
    isUploaded,
    getUpload
  } = useDocumentUploads('arrival');

  const handleUpload = async (documentId: string, file: File) => {
    return await uploadDocument(documentId, file);
  };

  const handleDelete = async (documentId: string) => {
    return await deleteDocument(documentId);
  };

  const handleView = async (documentId: string) => {
    // Open window immediately (synchronous with click) to avoid popup blocker
    const newWindow = window.open('about:blank', '_blank');
    
    if (!newWindow) {
      const { toast } = await import('sonner');
      toast.error("Popup blocked. Please allow popups for this site.");
      return;
    }

    // Show loading state in the new window
    newWindow.document.write('<html><head><title>Loading...</title></head><body style="font-family: system-ui; padding: 20px;"><p>Loading document...</p></body></html>');
    
    const url = await getViewUrl(documentId);
    if (url) {
      newWindow.location.href = url;
    } else {
      newWindow.close();
      const { toast } = await import('sonner');
      toast.error("Couldn't generate view link. Please try again.");
    }
  };

  const handleDownload = async (documentId: string) => {
    const url = await getViewUrl(documentId);
    if (!url) {
      const { toast } = await import('sonner');
      toast.error("Couldn't generate download link. Please try again.");
      return;
    }

    try {
      // Use fetch + blob approach to avoid popup issues
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const upload = getUpload(documentId);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = upload?.file_name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const { toast } = await import('sonner');
      toast.error("Couldn't download file. Please try again.");
    }
  };

  const handlePrint = async (documentId: string) => {
    // Open window immediately (synchronous with click) to avoid popup blocker
    const printWindow = window.open('about:blank', '_blank');
    
    if (!printWindow) {
      const { toast } = await import('sonner');
      toast.error("Popup blocked. Please allow popups to print documents.");
      return;
    }

    printWindow.document.write('<html><head><title>Preparing print...</title></head><body style="font-family: system-ui; padding: 20px;"><p>Preparing document for print...</p></body></html>');
    
    const url = await getViewUrl(documentId);
    if (url) {
      printWindow.location.href = url;
      // Wait for load then trigger print
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
      };
    } else {
      printWindow.close();
      const { toast } = await import('sonner');
      toast.error("Couldn't generate print link. Please try again.");
    }
  };

  return (
    <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-top-2 duration-500 overflow-hidden w-full">
      <Separator />
      
      {/* Location */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h5 className="font-semibold text-xs sm:text-sm text-foreground">Location</h5>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground pl-6 sm:pl-8">{step.details.location}</p>
      </div>

      {/* Documents needed - Now with expandable cards */}
      <div className="w-full">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
          <h5 className="font-semibold text-xs sm:text-sm text-foreground">
            Documents Needed 
            <span className="font-normal text-muted-foreground ml-1">(tap to expand)</span>
          </h5>
        </div>
        
        {detailedDocuments.length > 0 ? (
          <div className="space-y-3 max-w-2xl mx-auto">
            {detailedDocuments.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
                selectedCity={selectedCity}
                isUploaded={isUploaded(doc.id)}
                upload={getUpload(doc.id)}
                isUploading={uploading === doc.id}
                onUpload={(file) => handleUpload(doc.id, file)}
                onDelete={() => handleDelete(doc.id)}
                onView={() => handleView(doc.id)}
                onDownload={() => handleDownload(doc.id)}
                onPrint={() => handlePrint(doc.id)}
                isAuthenticated={!!user}
                isReady={documentReadyStatus[doc.id] || false}
                onToggleReady={() => toggleDocumentReady(doc.id)}
              />
            ))}
          </div>
        ) : (
          // Fallback to simple list if no detailed documents available
          <ul className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
            {step.details.documents.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <FileText className="w-5 h-5 text-secondary" />
                <span className="text-sm text-foreground font-medium">{doc}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Process */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
          <h5 className="font-semibold text-xs sm:text-sm text-foreground">Step-by-Step Process</h5>
        </div>
        <ol className="space-y-2 pl-6 sm:pl-8">
          {step.details.process.map((processStep, idx) => (
            <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
              <span className="font-medium text-accent flex-shrink-0 text-xs sm:text-sm">{idx + 1}.</span>
              <span className="break-words">{processStep}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Cost */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
          <h5 className="font-semibold text-xs sm:text-sm text-foreground">Cost</h5>
        </div>
        <p className="text-xs sm:text-sm font-medium text-warning pl-6 sm:pl-8">{step.details.cost}</p>
      </div>

      {/* Tips */}
      <div className="w-full max-w-2xl mx-auto p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h5 className="font-semibold text-xs sm:text-sm text-foreground">Pro Tips</h5>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">{step.details.tips}</p>
      </div>

      {/* Official Resources */}
      {step.details.officialResources && step.details.officialResources.length > 0 && (
        <div className="w-full max-w-2xl mx-auto p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            <h5 className="font-semibold text-xs sm:text-sm text-foreground">Official Resources</h5>
          </div>
          <ul className="space-y-2">
            {step.details.officialResources.map((resource, idx) => (
              <li key={idx}>
                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/60 hover:bg-background border border-border/30 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5 group-hover:text-secondary/80" />
                  <div>
                    <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors block">{resource.name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Partners */}
      {step.details.partners && step.details.partners.length > 0 && (
        <div className="w-full max-w-2xl mx-auto p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <h5 className="font-semibold text-xs sm:text-sm text-foreground">Recommended Partners</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.details.partners.map((partner, idx) => (
              <a 
                key={idx}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-3 rounded-lg bg-background/50 hover:bg-background transition-colors border border-border/50 hover:border-accent/30 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{partner.name}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-accent" />
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full w-fit mb-1">{partner.category}</span>
                <p className="text-xs text-muted-foreground">{partner.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="w-full max-w-2xl mx-auto">
        <Button 
          onClick={onToggleComplete}
          variant={isCompleted ? "outline" : "default"}
          className="w-full text-sm sm:text-base"
        >
          {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>
      </div>

      {/* FAQ and Chat Tabs */}
      <div className="w-full max-w-2xl mx-auto">
        <Tabs defaultValue="faq" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="chat">Community Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="faq" className="mt-4">
            <TaskFAQ taskId={`${step.id}-${selectedCity}`} phase="phase-2" />
          </TabsContent>
          <TabsContent value="chat" className="mt-4">
            {/* External community groups */}
            {groups.length > 0 && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Join External Groups</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groups.map((group, idx) => (
                    <a
                      key={idx}
                      href={group.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-full transition-colors"
                    >
                      {group.name}
                      <span className="text-[10px] text-primary/70">({group.platform})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  These are community-run groups. Please follow their rules.
                </p>
              </div>
            )}
            <TaskChat taskId={`${step.id}-${selectedCity}`} phase="phase-2" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BureaucracyDetail;
