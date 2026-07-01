import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useCity } from '@/contexts/CityContext';
import { useToast } from '@/hooks/use-toast';
import { onboardingCountries, universities, universityToCity } from '@/data/onboardingOptions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: Props) => {
  const { profile, updateProfile } = useProfile();
  const { setSelectedCity } = useCity();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (profile && open) {
      setFullName(profile.full_name ?? '');
      setCountry(profile.origin_country ?? '');
      setUniversity(profile.university ?? '');
      setArrivalDate(profile.arrival_date ? new Date(profile.arrival_date) : undefined);
    }
  }, [profile, open]);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      full_name: trimmedName,
      origin_country: country || null,
      university: university || null,
      arrival_date: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    const city = universityToCity(university);
    if (city) setSelectedCity(city);
    toast({ title: 'Profile updated' });
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your details</DialogTitle>
          <DialogDescription>Update your country, university and arrival date.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-fullname">Display name</Label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={60}
              placeholder="Your name"
            />
            <p className="text-xs text-muted-foreground">
              This is the name shown on your chat messages.
            </p>
          </div>
          <div className="space-y-2">

            <Label>Country of origin</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
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
          <div className="space-y-2">
            <Label>University</Label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
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
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
