'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { StudentProfile, User } from '@/types';

interface ProfileCompletionBarProps {
  user: Partial<User>;
  profile: Partial<StudentProfile>;
  className?: string;
}

function calculateCompletion(user: Partial<User>, profile: Partial<StudentProfile>): { percentage: number; missing: string[] } {
  const checks: { label: string; done: boolean }[] = [
    { label: 'Full name', done: !!user.full_name },
    { label: 'School name', done: !!user.school_name },
    { label: 'Grade', done: !!user.grade },
    { label: 'Bio', done: !!user.bio },
    { label: 'Location', done: !!user.location },
    { label: 'GPA', done: !!profile.gpa },
    { label: 'Major interest', done: !!profile.major_interest },
    { label: 'Target country', done: !!profile.target_country },
    { label: 'Target university', done: !!profile.target_university },
    { label: 'Skills (at least 1)', done: (profile.skills?.length ?? 0) > 0 },
    { label: 'Languages (at least 1)', done: (profile.languages?.length ?? 0) > 0 },
    { label: 'Resume uploaded', done: !!profile.resume_url },
  ];

  const done = checks.filter((c) => c.done);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  return {
    percentage: Math.round((done.length / checks.length) * 100),
    missing,
  };
}

export function ProfileCompletionBar({ user, profile, className }: ProfileCompletionBarProps) {
  const { percentage, missing } = calculateCompletion(user, profile);

  const getColor = () => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Profile Completion</span>
        <span className={cn('font-semibold', getColor())}>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      {missing.length > 0 && percentage < 100 && (
        <p className="text-xs text-muted-foreground">
          Missing:{' '}
          <span className="text-foreground">{missing.slice(0, 3).join(', ')}
          {missing.length > 3 ? ` and ${missing.length - 3} more` : ''}</span>
        </p>
      )}
    </div>
  );
}
