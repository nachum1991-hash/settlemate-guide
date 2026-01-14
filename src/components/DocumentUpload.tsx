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
      <div className="rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <File className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium truncate">{upload.file_name}</p>
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(upload.file_size)} • Uploaded {format(new Date(upload.uploaded_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewClick}
              className="h-11 min-h-[44px] px-3 justify-center sm:h-9 sm:min-h-0 sm:px-3"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span>View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadClick}
              className="h-11 min-h-[44px] px-3 justify-center sm:h-9 sm:min-h-0 sm:px-3"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintClick}
              className="h-11 min-h-[44px] px-3 justify-center sm:h-9 sm:min-h-0 sm:px-3"
            >
              <Printer className="h-4 w-4 mr-2" />
              <span>Print</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-11 min-h-[44px] px-3 justify-center sm:h-9 sm:min-h-0 sm:px-3 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show upload zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all',
        isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
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
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            <span className="hidden sm:inline">Drop your file here or click to browse</span>
            <span className="sm:hidden">Tap to select file</span>
          </p>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG • Max 10MB</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadComponent;
