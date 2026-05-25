import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function VerifiedBadge({
  size = 'md',
  className,
  showLabel = false,
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-blue-600 dark:text-blue-400',
        className
      )}
      title="Verified"
    >
      <BadgeCheck className={cn(sizeMap[size], 'fill-blue-100 dark:fill-blue-900')} />
      {showLabel && (
        <span className="text-xs font-medium">Verified</span>
      )}
    </span>
  );
}
