import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCity } from '@/contexts/CityContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  onboardingCountries,
  universities,
  universityToCity,
} from '@/data/onboardingOptions';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { setSelectedCity } = useCity();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile?.onboarding_completed) navigate('/dashboard', { replace: true });
  }, [profile, navigate]);

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const canNext = () => {
    if (step === 0) return !!country;
    if (step === 1) return !!university;
    if (step === 2) return !!arrivalDate;
    return false;
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      origin_country: country,
      university,
      arrival_date: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : null,
      onboarding_completed: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    const city = universityToCity(university);
    if (city) setSelectedCity(city);
    toast({ title: 'All set! 🎉', description: 'Your personalized journey is ready.' });
    navigate('/visa-wizard', { replace: true });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>Welcome to SettleMate</span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="text-2xl">
            {step === 0 && 'Where are you coming from?'}
            {step === 1 && 'Which university will you attend?'}
            {step === 2 && 'When do you plan to arrive in Italy?'}
          </CardTitle>
          <CardDescription>
            {step === 0 && "We'll tailor your visa steps to your country."}
            {step === 1 && "We'll set your default city and bureaucracy info."}
            {step === 2 && "We'll build a countdown and personalized deadlines."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-2">
              <Label>Country of origin</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {onboardingCountries.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.flag} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label>University</Label>
              <Select value={university} onValueChange={setUniversity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Planned arrival date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !arrivalDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {arrivalDate ? format(arrivalDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                    defaultMonth={arrivalDate ?? new Date()}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 3}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>

              </Popover>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={saving}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button className="flex-1" disabled={!canNext() || saving} onClick={handleNext}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : step === totalSteps - 1 ? (
                'Finish'
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
