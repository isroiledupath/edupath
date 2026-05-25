'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, GraduationCap, Building2, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'organizer', 'company', 'mentor'] as const),
  school_name: z.string().optional(),
  grade: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const roles: {
  value: Exclude<UserRole, 'admin'>;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Find opportunities & apply to universities',
    icon: GraduationCap,
  },
  {
    value: 'organizer',
    label: 'Organizer',
    description: 'Post volunteer opportunities',
    icon: Users,
  },
  {
    value: 'company',
    label: 'Company',
    description: 'Post internship programs',
    icon: Building2,
  },
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Guide students with your experience',
    icon: BookOpen,
  },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultRole = (searchParams.get('role') as UserRole) ?? 'student';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole as Exclude<UserRole, 'admin'> },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
          school_name: data.school_name,
          grade: data.grade,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Account created!',
      description: 'Please check your email to verify your account.',
    });
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-lg space-y-6 py-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
            <span className="text-2xl">🎓</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EduPath
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join thousands of students building their futures</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Role selection */}
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map(({ value, label, description, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('role', value)}
                      className={cn(
                        'flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all',
                        selectedRole === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn('h-4 w-4', selectedRole === value ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn('text-sm font-medium', selectedRole === value && 'text-primary')}>
                          {label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Aziz Karimov"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {selectedRole === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="school_name">School (optional)</Label>
                    <Input
                      id="school_name"
                      placeholder="School name"
                      {...register('school_name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade (optional)</Label>
                    <Input
                      id="grade"
                      placeholder="e.g. 11th grade"
                      {...register('grade')}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By signing up you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
