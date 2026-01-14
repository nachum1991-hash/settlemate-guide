-- Create a private storage bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false);

-- RLS policy: Users can upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create document_uploads tracking table
CREATE TABLE public.document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_id, phase)
);

-- Enable RLS
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_uploads
CREATE POLICY "Users can view their own uploads"
ON public.document_uploads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
ON public.document_uploads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
ON public.document_uploads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
ON public.document_uploads FOR DELETE
USING (auth.uid() = user_id);