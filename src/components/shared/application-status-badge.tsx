import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/types';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  under_review: { label: 'Under Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant as React.ComponentProps<typeof Badge>['variant']}>{config.label}</Badge>
  );
}
