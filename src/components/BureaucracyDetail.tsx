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
  ChevronUp,
  AlertTriangle,
  Check,
  X,
  Info,
  CheckCircle
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
  isAuthenticated
}: DocumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { details } = doc;

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50">
      {/* Document Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img 
            src={doc.image} 
            alt={doc.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h6 className="font-semibold text-sm sm:text-base text-foreground">{doc.name}</h6>
            {isUploaded && (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{doc.description}</p>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Separator />
          
          {/* Key Info Box */}
          {details.keyInfo && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{details.keyInfo}</p>
              </div>
            </div>
          )}

          {/* Acceptance Rules */}
          {details.acceptanceRules && (
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
              {/* What's Accepted */}
              <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">What's Accepted</span>
                </div>
                <ul className="space-y-1.5">
                  {details.acceptanceRules.valid.map((item, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's NOT Accepted */}
              {details.acceptanceRules.invalid && details.acceptanceRules.invalid.length > 0 && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">NOT Accepted</span>
                  </div>
                  <ul className="space-y-1.5">
                    {details.acceptanceRules.invalid.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <X className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
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
            <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-warning">Common Mistakes to Avoid</span>
              </div>
              <ul className="space-y-1.5">
                {details.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-warning">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to Obtain */}
          {details.howToObtain && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-semibold text-foreground block mb-1">How to Obtain</span>
                  <p className="text-xs text-muted-foreground">{details.howToObtain}</p>
                </div>
              </div>
            </div>
          )}

          {/* City-Specific Links */}
          {details.citySpecificLinks && details.citySpecificLinks[selectedCity as keyof typeof details.citySpecificLinks] && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary capitalize">{selectedCity} Resources</span>
              </div>
              <div className="grid gap-2">
                {details.citySpecificLinks[selectedCity as keyof typeof details.citySpecificLinks]?.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 rounded-md bg-background/50 hover:bg-background transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official Links */}
          {details.officialLinks && details.officialLinks.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-secondary" />
                Official Resources
              </span>
              <div className="grid gap-2">
                {details.officialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 rounded-md bg-secondary/5 hover:bg-secondary/10 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors">{link.label}</span>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tips */}
          {details.tips && details.tips.length > 0 && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Pro Tips</span>
              </div>
              <ul className="space-y-1.5">
                {details.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-accent">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Document Upload Section */}
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
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Sign in to upload and track your documents
              </p>
            </div>
          )}
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
    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <Separator />
      
      {/* Location */}
      <div className="flex items-start gap-2 sm:gap-3">
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1">Location</h5>
          <p className="text-xs sm:text-sm text-muted-foreground">{step.details.location}</p>
        </div>
      </div>

      {/* Documents needed - Now with expandable cards */}
      <div className="flex items-start gap-2 sm:gap-3">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-2 sm:mb-3">
            Documents Needed 
            <span className="font-normal text-muted-foreground ml-1">(tap to expand)</span>
          </h5>
          
          {detailedDocuments.length > 0 ? (
            <div className="space-y-2">
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
                />
              ))}
            </div>
          ) : (
            // Fallback to simple list if no detailed documents available
            <ul className="space-y-2 sm:space-y-3">
              {step.details.documents.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <FileText className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-foreground font-medium">{doc}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Process */}
      <div className="flex items-start gap-2 sm:gap-3">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2">Step-by-Step Process</h5>
          <ol className="space-y-1.5 sm:space-y-2">
            {step.details.process.map((processStep, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                <span className="font-medium text-accent flex-shrink-0 text-xs sm:text-sm">{idx + 1}.</span>
                <span className="break-words">{processStep}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Cost */}
      <div className="flex items-start gap-2 sm:gap-3">
        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1">Cost</h5>
          <p className="text-xs sm:text-sm font-medium text-warning">{step.details.cost}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-1">Pro Tips</h5>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">{step.details.tips}</p>
          </div>
        </div>
      </div>

      {/* Official Resources */}
      {step.details.officialResources && step.details.officialResources.length > 0 && (
        <div className="p-3 sm:p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-2 sm:mb-3">Official Resources</h5>
              <ul className="space-y-2">
                {step.details.officialResources.map((resource, idx) => (
                  <li key={idx}>
                    <a 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-secondary/10 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5 group-hover:text-secondary/80" />
                      <div>
                        <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors">{resource.name}</span>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Partners */}
      {step.details.partners && step.details.partners.length > 0 && (
        <div className="p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-foreground mb-2 sm:mb-3">Recommended Partners</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </div>
        </div>
      )}

      {/* Action button */}
      <Button 
        onClick={onToggleComplete}
        variant={isCompleted ? "outline" : "default"}
        className="w-full text-sm sm:text-base"
      >
        {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
      </Button>

      {/* FAQ and Chat Tabs */}
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
  );
};

export default BureaucracyDetail;
