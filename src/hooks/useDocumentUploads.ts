import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DocumentUpload {
  id: string;
  document_id: string;
  phase: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export const useDocumentUploads = (phase: string) => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<Record<string, DocumentUpload>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const loadUploads = useCallback(async () => {
    if (!user) {
      setUploads({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('user_id', user.id)
        .eq('phase', phase);

      if (error) throw error;

      const uploadsMap: Record<string, DocumentUpload> = {};
      data?.forEach((upload) => {
        uploadsMap[upload.document_id] = upload as DocumentUpload;
      });
      setUploads(uploadsMap);
    } catch (error) {
      console.error('Error loading document uploads:', error);
    } finally {
      setLoading(false);
    }
  }, [user, phase]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, JPG, or PNG files only.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.';
    }
    return null;
  };

  const uploadDocument = async (documentId: string, file: File): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to upload documents');
      return false;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    setUploading(documentId);

    try {
      // Create file path: user_id/document_id/filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${documentId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Check if there's an existing upload for this document
      const existingUpload = uploads[documentId];
      
      if (existingUpload) {
        // Delete old file from storage
        await supabase.storage
          .from('user-documents')
          .remove([existingUpload.file_path]);

        // Update database record
        const { error: updateError } = await supabase
          .from('document_uploads')
          .update({
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            uploaded_at: new Date().toISOString(),
          })
          .eq('id', existingUpload.id);

        if (updateError) throw updateError;
      } else {
        // Insert new database record
        const { error: insertError } = await supabase
          .from('document_uploads')
          .insert({
            user_id: user.id,
            document_id: documentId,
            phase,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          });

        if (insertError) throw insertError;
      }

      toast.success('Document uploaded successfully');
      await loadUploads();
      return true;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
      return false;
    } finally {
      setUploading(null);
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to delete documents');
      return false;
    }

    const upload = uploads[documentId];
    if (!upload) return false;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([upload.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('document_uploads')
        .delete()
        .eq('id', upload.id);

      if (dbError) throw dbError;

      toast.success('Document deleted');
      await loadUploads();
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete document');
      return false;
    }
  };

  const getViewUrl = async (documentId: string): Promise<string | null> => {
    const upload = uploads[documentId];
    if (!upload) return null;

    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(upload.file_path, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting view URL:', error);
      return null;
    }
  };

  const isUploaded = (documentId: string): boolean => {
    return !!uploads[documentId];
  };

  const getUpload = (documentId: string): DocumentUpload | undefined => {
    return uploads[documentId];
  };

  return {
    uploads,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    getViewUrl,
    isUploaded,
    getUpload,
  };
};
