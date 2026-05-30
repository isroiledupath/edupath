'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle, Mail, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// ─── Step schemas ────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type Step = 'email' | 'otp' | 'password' | 'done';

// ─── OTP input component ─────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(8, '').split('').slice(0, 8);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const newDigits = [...digits];
    newDigits[index] = char.slice(-1);
    const next = newDigits.join('');
    onChange(next);
    if (char && index < 7) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 7) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    onChange(pasted.padEnd(8, '').slice(0, 8));
    const focusIndex = Math.min(pasted.length, 7);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 8 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'w-11 h-14 text-center text-xl font-semibold rounded-lg border-2 bg-background',
            'focus:outline-none focus:border-primary transition-colors',
            digits[i] ? 'border-primary' : 'border-border'
          )}
        />
      ))}
    </div>
  );
}

// ─── Step indicators ─────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'otp', label: 'Verify', icon: KeyRound },
  { key: 'password', label: 'Password', icon: Lock },
];

function StepIndicator({ current }: { current: Step }) {
  const stepIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors',
                done && 'bg-primary text-primary-foreground',
                active && 'bg-primary/15 text-primary border-2 border-primary',
                !done && !active && 'bg-muted text-muted-foreground'
              )}
            >
              {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px w-6', done ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  // ── Step 1: send OTP ──────────────────────────────────────────────────────

  const sendOtp = async (emailAddress: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: { shouldCreateUser: false },
    });
    if (error) throw error;

    // Start 60s resend cooldown
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const onEmailSubmit = async (data: EmailForm) => {
    setLoading(true);
    try {
      await sendOtp(data.email);
      setEmail(data.email);
      setStep('otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      // Supabase returns an error for unknown emails — show a generic message
      // so we don't leak whether an account exists
      if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('user')) {
        setEmail(data.email);
        setStep('otp'); // still advance — don't reveal email existence
      } else {
        toast({ title: 'Error', description: message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────

  const onVerifyOtp = async () => {
    if (otp.length !== 8) {
      toast({ title: 'Enter all 8 digits', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) {
      toast({
        title: 'Invalid code',
        description: 'The code is incorrect or has expired. Please try again.',
        variant: 'destructive',
      });
      setOtp('');
      setLoading(false);
      return;
    }
    setStep('password');
    setLoading(false);
  };

  // ── Step 3: set new password ──────────────────────────────────────────────

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    setStep('done');
    setLoading(false);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <span className="text-2xl">🎓</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EduPath
            </span>
          </Link>
        </div>

        <Card>
          {/* ── Email step ── */}
          {step === 'email' && (
            <>
              <CardHeader className="space-y-2">
                <StepIndicator current="email" />
                <CardTitle className="text-2xl text-center">Forgot your password?</CardTitle>
                <CardDescription className="text-center">
                  Enter your email and we&apos;ll send an 8-digit verification code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoFocus
                      {...emailForm.register('email')}
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending code...</>
                    ) : (
                      'Send Code'
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </>
          )}

          {/* ── OTP step ── */}
          {step === 'otp' && (
            <>
              <CardHeader className="space-y-2">
                <StepIndicator current="otp" />
                <CardTitle className="text-2xl text-center">Enter the code</CardTitle>
                <CardDescription className="text-center">
                  We sent an 8-digit code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <OtpInput value={otp} onChange={setOtp} />

                <Button
                  className="w-full"
                  onClick={onVerifyOtp}
                  disabled={loading || otp.length !== 8}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive it?{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-muted-foreground">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await sendOtp(email);
                            toast({ title: 'Code resent!', description: `Sent a new code to ${email}` });
                          } catch {
                            toast({ title: 'Failed to resend', variant: 'destructive' });
                          }
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                  <button
                    onClick={() => { setStep('email'); setOtp(''); }}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change email
                  </button>
                </div>
              </CardContent>
            </>
          )}

          {/* ── Password step ── */}
          {step === 'password' && (
            <>
              <CardHeader className="space-y-2">
                <StepIndicator current="password" />
                <CardTitle className="text-2xl text-center">Set new password</CardTitle>
                <CardDescription className="text-center">
                  Choose a strong password for your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      autoFocus
                      {...passwordForm.register('password')}
                    />
                    {passwordForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      {...passwordForm.register('confirmPassword')}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* ── Done step ── */}
          {step === 'done' && (
            <CardContent className="py-10 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Password updated!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting you to your dashboard…
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
