-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create task_messages table for chat
CREATE TABLE public.task_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_messages;

-- Messages policies
CREATE POLICY "Messages are viewable by everyone" 
  ON public.task_messages FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create messages" 
  ON public.task_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON public.task_messages FOR DELETE 
  USING (auth.uid() = user_id);

-- Create task_faqs table
CREATE TABLE public.task_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_faqs ENABLE ROW LEVEL SECURITY;

-- FAQ policies (read-only for users)
CREATE POLICY "FAQs are viewable by everyone" 
  ON public.task_faqs FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_task_messages_task_id ON public.task_messages(task_id);
CREATE INDEX idx_task_messages_created_at ON public.task_messages(created_at DESC);
CREATE INDEX idx_task_faqs_task_id ON public.task_faqs(task_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer) VALUES
  ('codice-fiscale', 'phase-2', 'How long does it take to get a Codice Fiscale?', 'Typically 15-30 minutes at the Agenzia delle Entrate office. During peak times (September-October), expect 1-2 hours of waiting.'),
  ('codice-fiscale', 'phase-2', 'Do I need an appointment?', 'No appointment needed! Just walk in with your passport and admission letter during office hours (usually 8:30 AM - 12:30 PM, Monday to Friday).'),
  ('codice-fiscale', 'phase-2', 'Is it free?', 'Yes, obtaining your Codice Fiscale is completely free.'),
  ('sim-card', 'phase-2', 'Which provider is best for students?', 'Iliad and ho.Mobile offer the best value for students with unlimited calls/texts and 150-200GB for €7-10/month. No contract required.'),
  ('sim-card', 'phase-2', 'Do I need a Codice Fiscale first?', 'Yes! You need your Codice Fiscale to register any Italian SIM card.'),
  ('residence-permit', 'phase-2', 'When should I apply?', 'You MUST apply within 8 working days of arrival in Italy. This is a strict legal deadline!'),
  ('residence-permit', 'phase-2', 'How much does it cost?', 'Total cost is approximately €90-120: €16 marca da bollo, €30.46 postal fee, €40 electronic residence permit, plus photocopies.'),
  ('bank-account', 'phase-2', 'Can I open a bank account without Italian?', 'Yes! Many banks like Intesa Sanpaolo and UniCredit have English-speaking staff at university branches. Online banks like N26 and Revolut are also available in English.'),
  ('visa', 'phase-1', 'How long does visa processing take?', 'Processing times vary by country: Israel 2-3 weeks, India 4-6 weeks, Iran 6-8 weeks, Turkey 3-4 weeks, China 4-6 weeks. Apply at least 2 months before departure.'),
  ('visa', 'phase-1', 'Do I need travel insurance?', 'Yes, travel/health insurance covering your entire stay in Italy is mandatory for the visa application.'),
  ('pre-departure', 'phase-1', 'Should I bring cash or use cards?', 'Bring €300-500 in cash for immediate expenses. Most places accept cards, but small shops and post offices may be cash-only.');
