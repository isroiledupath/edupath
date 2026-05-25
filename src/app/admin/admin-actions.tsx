'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminActionsProps {
  listingId: string;
  type: 'volunteer' | 'internship';
}

export function AdminActions({ listingId, type }: AdminActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action);
    const supabase = createClient();

    const table = type === 'volunteer' ? 'volunteer_listings' : 'internship_listings';
    const update = action === 'approve'
      ? { status: 'active', is_verified: true }
      : { status: 'closed' };

    const { error } = await supabase
      .from(table)
      .update(update)
      .eq('id', listingId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update listing.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: action === 'approve' ? '✅ Listing approved' : '❌ Listing rejected',
        description: action === 'approve'
          ? 'The listing is now live and visible to students.'
          : 'The listing has been rejected.',
      });
      router.refresh();
    }

    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        size="sm"
        variant="outline"
        className="text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => handleAction('approve')}
        disabled={!!loading}
      >
        {loading === 'approve' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive border-red-200 hover:bg-red-50"
        onClick={() => handleAction('reject')}
        disabled={!!loading}
      >
        {loading === 'reject' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        Reject
      </Button>
    </div>
  );
}
