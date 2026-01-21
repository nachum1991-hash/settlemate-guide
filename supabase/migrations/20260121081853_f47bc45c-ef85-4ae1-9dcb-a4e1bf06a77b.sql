-- Add reply_to_id column to task_messages table for reply threading
ALTER TABLE public.task_messages 
ADD COLUMN reply_to_id UUID REFERENCES public.task_messages(id) ON DELETE SET NULL;