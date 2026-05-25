'use client';

import { Clock } from 'lucide-react';
import { cn, daysUntilDeadline, isDeadlinePast, formatDate } from '@/lib/utils';

interface DeadlineCountdownProps {
  deadline: string;
  className?: string;
}

export function DeadlineCountdown({ deadline, className }: DeadlineCountdownProps) {
  const past = isDeadlinePast(deadline);
  const days = daysUntilDeadline(deadline);

  if (past) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
        <Clock className="h-3 w-3" />
        Deadline passed ({formatDate(deadline)})
      </span>
    );
  }

  const isUrgent = days <= 7;
  const isClose = days <= 14;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        isUrgent && 'text-red-600 dark:text-red-400',
        isClose && !isUrgent && 'text-yellow-600 dark:text-yellow-400',
        !isClose && 'text-green-600 dark:text-green-400',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      {days === 0
        ? 'Due today!'
        : days === 1
        ? '1 day left'
        : `${days} days left`}
    </span>
  );
}
