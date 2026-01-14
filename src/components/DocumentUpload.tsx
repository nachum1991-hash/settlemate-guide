import { useState, useRef, useCallback } from 'react';
import { Upload, File, X, Loader2, Eye, Trash2, CheckCircle, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DocumentUpload as DocumentUploadType } from '@/hooks/useDocumentUploads';
import { format } from 'date-fns';

interface DocumentUploadProps {
  documentId: string;
  upload?: DocumentUploadType;
  isUploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onView: () => Promise<void>;
  onDownload: () => Promise<void>;
  onPrint: () => Promise<void>;
  disabled?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentUploadComponent = ({
  documentId,
  upload,
  isUploading,
  onUpload,
  onDelete,
  onView,
  onDownload,
  onPrint,
  disabled = false,
}: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await onUpload(files[0]);
    }
  }, [disabled, isUploading, onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onUpload(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUpload]);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const handleViewClick = async () => {
    await onView();
  };

  const handleDownloadClick = async () => {
    await onDownload();
  };

  const handlePrintClick = async () => {
    await onPrint();
  };

  if (upload) {
    // Show uploaded file
    return (
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Your Document</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{upload.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(upload.file_size)} • Uploaded {format(new Date(upload.uploaded_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewClick}
              className="h-8 px-2"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadClick}
              className="h-8 px-2"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrintClick}
              className="h-8 px-2"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 px-2 text-destructive hover:text-destructive"
              title="Delete"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show upload zone
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Upload className="h-4 w-4" />
        <span>Upload Your Document</span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Drop your file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">PDF, JPG, PNG • Max 10MB</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadComponent;
