import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  helpful_count: number;
}

interface TaskFAQProps {
  taskId: string;
  phase: string;
}

export const TaskFAQ = ({ taskId, phase }: TaskFAQProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, [taskId]);

  const fetchFAQs = async () => {
    const { data, error } = await supabase
      .from('task_faqs')
      .select('*')
      .eq('task_id', taskId)
      .eq('phase', phase)
      .order('helpful_count', { ascending: false });

    if (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
      return;
    }

    setFaqs(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading FAQs...</div>;
  }

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No FAQs available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Frequently Asked Questions</h3>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.id} value={`faq-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
