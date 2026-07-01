import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  ShieldCheck,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Step = 'chooser' | 'email' | 'code' | 'documents' | 'done';

const Verify = () => {
  const { user, supabase } = useAuth();
  const {
    verified,
    pendingSubmission,
    rejectedReason,
    universityEmail,
    emailVerifiedAt,
    refetch,
    loading,
  } = useVerification();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('chooser');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [notAllowlisted, setNotAllowlisted] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const OTP_STORAGE_KEY = 'settlemate-verify-otp';
  const OTP_TTL_MS = 10 * 60 * 1000;

  const clearSavedOtp = () => {
    try {
      localStorage.removeItem(OTP_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const saveOtpState = (savedEmail: string) => {
    try {
      localStorage.setItem(
        OTP_STORAGE_KEY,
        JSON.stringify({
          step: 'code',
          email: savedEmail,
          expiresAt: Date.now() + OTP_TTL_MS,
        }),
      );
    } catch {
      // ignore
    }
  };

  // Decide initial step once; afterwards only auto-advance to 'done'.
  const decidedRef = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (!decidedRef.current) {
      decidedRef.current = true;
      if (verified || pendingSubmission) {
        clearSavedOtp();
        setStep('done');
        return;
      }
      // Try to restore an in-flight OTP entry so a reload doesn't drop the user
      // back to the chooser after they leave to grab the code from email.
      try {
        const raw = localStorage.getItem(OTP_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as {
            step?: string;
            email?: string;
            expiresAt?: number;
          };
          if (
            saved?.step === 'code' &&
            typeof saved.email === 'string' &&
            typeof saved.expiresAt === 'number' &&
            saved.expiresAt > Date.now()
          ) {
            setEmail(saved.email);
            setStep('code');
            return;
          }
          clearSavedOtp();
        }
      } catch {
        clearSavedOtp();
      }
      if (emailVerifiedAt) {
        setEmail(universityEmail ?? '');
      }
      setStep('chooser');
      return;
    }
    if (verified || pendingSubmission) {
      clearSavedOtp();
      setStep('done');
    }
  }, [loading, verified, pendingSubmission, emailVerifiedAt, universityEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!email.trim()) return;
    setSending(true);
    setNotAllowlisted(false);
    const { data, error } = await supabase.functions.invoke('verify-send-otp', {
      body: { university_email: email.trim().toLowerCase() },
    });
    setSending(false);
    if (error || data?.error) {
      if (data?.error === 'not_allowlisted') {
        setNotAllowlisted(true);
        return;
      }
      const msg =
        data?.error === 'email_already_used'
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
    saveOtpState(email.trim().toLowerCase());
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
      const msg =
        data?.error === 'invalid_code'
          ? 'That code is incorrect.'
          : data?.error === 'expired_or_missing'
          ? 'Code expired. Request a new one.'
          : data?.error === 'too_many_attempts'
          ? 'Too many attempts. Request a new code.'
          : 'Could not verify code.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      return;
    }
    await refetch();
    clearSavedOtp();
    if (data.verified) {
      toast({ title: 'Verified', description: 'You can now join the community chat.' });
      setStep('done');
    } else {
      toast({
        title: 'Email confirmed',
        description: 'Please upload your acceptance letter and photo ID to finish.',
      });
      setStep('documents');
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'PDF, JPG, or PNG only.';
    if (file.size > MAX_FILE_SIZE) return 'Max 10MB.';
    return null;
  };

  const onLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      const err = validateFile(f);
      if (err) {
        toast({ title: 'Invalid file', description: err, variant: 'destructive' });
        e.target.value = '';
        return;
      }
    }
    setLetterFile(f);
  };

  const onIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      const err = validateFile(f);
      if (err) {
        toast({ title: 'Invalid file', description: err, variant: 'destructive' });
        e.target.value = '';
        return;
      }
    }
    setIdFile(f);
  };

  const submitDocuments = async () => {
    if (!user || !letterFile || !idFile) return;
    setSubmitting(true);
    try {
      const uploadOne = async (file: File, prefix: 'letter' | 'id') => {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
        const path = `verification/${user.id}/${prefix}-${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from('user-documents')
          .upload(path, file, { upsert: false });
        if (error) throw error;
        return path;
      };
      const letter_path = await uploadOne(letterFile, 'letter');
      const id_path = await uploadOne(idFile, 'id');

      const { data, error } = await supabase.functions.invoke('verify-submit-documents', {
        body: { letter_path, id_path },
      });
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Submission failed');
      }
      await refetch();
      toast({
        title: 'Submitted',
        description: 'We will review your documents — usually within 48 hours.',
      });
      setStep('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Try again.';
      toast({ title: 'Submission failed', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
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
            <p className="text-sm text-muted-foreground">
              Required to join the community chat. Guides stay open to everyone.
            </p>
          </div>
        </div>

        <Card className="w-full border-2 shadow-elevated p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : step === 'chooser' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to verify. Pick whichever is easier for you.
              </p>
              {rejectedReason && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <div className="font-medium">Previous submission rejected</div>
                  <div className="text-muted-foreground">{rejectedReason}</div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setNotAllowlisted(false);
                  setStep('email');
                }}
                className="w-full text-left rounded-2xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-colors p-4 sm:p-5 flex items-start gap-4 min-h-[44px]"
              >
                <div className="rounded-xl bg-primary/10 p-3 flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">Verify with your university email</div>
                  <div className="text-sm text-muted-foreground">
                    Fastest option. We send a 6-digit code to your university address.
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
              </button>

              <button
                type="button"
                onClick={() => setStep('documents')}
                className="w-full text-left rounded-2xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-colors p-4 sm:p-5 flex items-start gap-4 min-h-[44px]"
              >
                <div className="rounded-xl bg-secondary/10 p-3 flex-shrink-0">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">Upload documents</div>
                  <div className="text-sm text-muted-foreground">
                    Acceptance letter + photo ID. Reviewed by our team within 48 hours.
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
              </button>
            </div>
          ) : step === 'email' ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setNotAllowlisted(false);
                  setStep('chooser');
                }}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" /> University email
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the email your university gave you. It can be different from your login email.
              </p>
              <div className="space-y-2">
                <Label htmlFor="uni-email">University email</Label>
                <Input
                  id="uni-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.it"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNotAllowlisted(false);
                  }}
                />
              </div>

              {notAllowlisted && (
                <div className="rounded-md border border-warning/50 bg-warning/10 p-3 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      This email isn't recognized as a university email. Please verify by uploading
                      your acceptance letter and ID instead.
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setNotAllowlisted(false);
                      setStep('documents');
                    }}
                    className="w-full min-h-[44px]"
                  >
                    Upload documents instead
                  </Button>
                </div>
              )}

              {!notAllowlisted && (
                <Button
                  onClick={sendOtp}
                  disabled={sending || !email.trim()}
                  className="w-full min-h-[44px]"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send 6-digit code'}
                </Button>
              )}
            </div>
          ) : step === 'code' ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" /> Enter code
              </div>
              <p className="text-sm text-muted-foreground">
                We sent a code to{' '}
                <span className="font-medium text-foreground break-words">{email}</span>. It expires in
                10 minutes.
              </p>
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
              <Button
                onClick={confirmOtp}
                disabled={confirming || code.length !== 6}
                className="w-full min-h-[44px]"
              >
                {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm code'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button className="text-muted-foreground underline" onClick={() => setStep('email')}>
                  Change email
                </button>
                <button
                  className="text-primary disabled:text-muted-foreground"
                  disabled={cooldown > 0 || sending}
                  onClick={sendOtp}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          ) : step === 'documents' ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('chooser')}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" /> Upload documents
              </div>
              <p className="text-sm text-muted-foreground">
                Upload both files (PDF, JPG, or PNG — max 10MB each). We delete them as soon as an
                admin reviews your submission.
              </p>

              <div className="space-y-2">
                <Label htmlFor="letter-file">Acceptance letter</Label>
                <Input
                  id="letter-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={onLetterChange}
                  disabled={submitting}
                />
                {letterFile && (
                  <p className="text-xs text-muted-foreground break-words">
                    Selected: {letterFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id-file">Photo ID (passport or national ID)</Label>
                <Input
                  id="id-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={onIdChange}
                  disabled={submitting}
                />
                {idFile && (
                  <p className="text-xs text-muted-foreground break-words">Selected: {idFile.name}</p>
                )}
              </div>

              <Button
                onClick={submitDocuments}
                disabled={submitting || !letterFile || !idFile}
                className="w-full min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading…
                  </>
                ) : (
                  'Submit for review'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center py-4">
              {verified ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                  <h2 className="text-xl font-semibold">You're verified</h2>
                  <p className="text-sm text-muted-foreground">
                    You can now post in the community chat.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} className="min-h-[44px]">
                    Continue
                  </Button>
                </>
              ) : pendingSubmission ? (
                <>
                  <Clock className="h-12 w-12 text-primary mx-auto" />
                  <h2 className="text-xl font-semibold">Under review</h2>
                  <p className="text-sm text-muted-foreground">
                    We're reviewing your documents — usually within 48 hours. We'll delete the files
                    the moment a decision is made.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="min-h-[44px]"
                  >
                    Back to dashboard
                  </Button>
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
