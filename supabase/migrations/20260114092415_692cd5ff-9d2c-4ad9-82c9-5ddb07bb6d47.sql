-- Drop the existing policy that allows everyone to view messages
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.task_messages;

-- Create new policy that requires authentication to view messages
CREATE POLICY "Messages are viewable by authenticated users" 
  ON public.task_messages 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);