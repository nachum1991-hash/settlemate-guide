import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ShieldCheck, Mail, FileUp, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Verify = () => {
  const { user, supabase } = useAuth();
  const { verified, pendingSubmission, rejectedReason, universityEmail, emailVerifiedAt, refetch, loading } = useVerification();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'email' | 'code' | 'letter' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Decide initial step
  useEffect(() => {
    if (loading) return;
    if (verified) { setStep('done'); return; }
    if (pendingSubmission) { setStep('done'); return; }
    if (emailVerifiedAt) { setStep('letter'); setEmail(universityEmail ?? ''); return; }
    setStep('email');
  }, [loading, verified, pendingSubmission, emailVerifiedAt, universityEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!email.trim()) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke('verify-send-otp', {
      body: { university_email: email.trim().toLowerCase() },
    });
    setSending(false);
    if (error || data?.error) {
      const msg = data?.error === 'email_already_used'
        ? 'This university email is already verified on another account.'
        : data?.error === 'rate_limited'
        ? 'Too many codes requested. Try again later.'
        : data?.error === 'cooldown'
        ? `Please wait ${data.retry_after}s before requesting another code.`
        : data?.error === 'invalid_email'
        ? 'That email looks invalid.'
        : 'Could not send code. Please try again.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      return;
    }
    toast({ title: 'Code sent', description: `We sent a 6-digit code to ${email}.` });
    setCooldown(30);
    setStep('code');
  };

  const confirmOtp = async () => {
    if (code.length !== 6) return;
    setConfirming(true);
    const { data, error } = await supabase.functions.invoke('verify-confirm-otp', {
      body: { university_email: email.trim().toLowerCase(), code },
    });
    setConfirming(false);
    if (error || data?.error) {
      const msg = data?.error === 'invalid_code' ? 'That code is incorrect.'
        : data?.error === 'expired_or_missing' ? 'Code expired. Request a new one.'
        : data?.error === 'too_many_attempts' ? 'Too many attempts. Request a new code.'
        : 'Could not verify code.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      return;
    }
    await refetch();
    if (data.verified) {
      toast({ title: 'Verified', description: 'You can now join the community chat.' });
      setStep('done');
    } else {
      toast({ title: 'Email confirmed', description: 'Now upload your acceptance letter to finish.' });
      setStep('letter');
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'PDF, JPG, or PNG only.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'Too large', description: 'Max 10MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `verification/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('user-documents').upload(path, file, { upsert: false });
    if (upErr) {
      setUploading(false);
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.functions.invoke('verify-submit-letter', { body: { file_path: path } });
    setUploading(false);
    if (error || data?.error) {
      toast({ title: 'Submission failed', description: data?.error || 'Try again.', variant: 'destructive' });
      return;
    }
    await refetch();
    toast({ title: 'Submitted', description: 'We will review your letter — usually within 48 hours.' });
    setStep('done');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Verify your student status</h1>
            <p className="text-sm text-muted-foreground">Required to join the community chat. Guides stay open to everyone.</p>
          </div>
        </div>

        <Card className="w-full border-2 shadow-elevated p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : step === 'email' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4" /> Step 1 of 2 — University email</div>
              <p className="text-sm text-muted-foreground">Enter the email your university gave you. This can be different from your login email.</p>
              <div className="space-y-2">
                <Label htmlFor="uni-email">University email</Label>
                <Input id="uni-email" type="email" autoComplete="email" placeholder="you@university.it"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button onClick={sendOtp} disabled={sending || !email.trim()} className="w-full min-h-[44px]">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send 6-digit code'}
              </Button>
            </div>
          ) : step === 'code' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4" /> Step 2 — Enter code</div>
              <p className="text-sm text-muted-foreground">We sent a code to <span className="font-medium text-foreground break-words">{email}</span>. It expires in 10 minutes.</p>
              <div className="flex justify-center py-2">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={confirmOtp} disabled={confirming || code.length !== 6} className="w-full min-h-[44px]">
                {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm code'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button className="text-muted-foreground underline" onClick={() => setStep('email')}>Change email</button>
                <button className="text-primary disabled:text-muted-foreground" disabled={cooldown > 0 || sending} onClick={sendOtp}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          ) : step === 'letter' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium"><FileUp className="h-4 w-4" /> Acceptance letter</div>
              <p className="text-sm text-muted-foreground">
                Your email domain isn't in our auto-verified list yet. Upload your university acceptance letter (PDF, JPG, or PNG, max 10MB). We delete the file as soon as an admin reviews it.
              </p>
              {rejectedReason && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <div className="font-medium">Previous submission rejected</div>
                  <div className="text-muted-foreground">{rejectedReason}</div>
                </div>
              )}
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} disabled={uploading} />
              {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</div>}
            </div>
          ) : (
            <div className="space-y-4 text-center py-4">
              {verified ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                  <h2 className="text-xl font-semibold">You're verified</h2>
                  <p className="text-sm text-muted-foreground">You can now post in the community chat.</p>
                  <Button onClick={() => navigate('/dashboard')} className="min-h-[44px]">Continue</Button>
                </>
              ) : pendingSubmission ? (
                <>
                  <Clock className="h-12 w-12 text-primary mx-auto" />
                  <h2 className="text-xl font-semibold">Under review</h2>
                  <p className="text-sm text-muted-foreground">We're reviewing your acceptance letter — usually within 48 hours. We'll delete the file the moment a decision is made.</p>
                  <Button variant="outline" onClick={() => navigate('/dashboard')} className="min-h-[44px]">Back to dashboard</Button>
                </>
              ) : null}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Verify;
