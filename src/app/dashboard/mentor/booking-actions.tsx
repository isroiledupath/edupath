'use client';

import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface BookingActionsProps {
  bookingId: string;
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const [loading, setLoading] = useState<'confirm' | 'cancel' | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleAction = async (action: 'confirm' | 'cancel') => {
    if (action === 'confirm' && !showLinkInput) {
      setShowLinkInput(true);
      return;
    }

    setLoading(action);
    const supabase = createClient();

    const update =
      action === 'confirm'
        ? { status: 'confirmed', meeting_link: meetingLink || null }
        : { status: 'cancelled' };

    const { error } = await supabase
      .from('mentor_bookings')
      .update(update)
      .eq('id', bookingId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update booking.', variant: 'destructive' });
    } else {
      toast({
        title: action === 'confirm' ? '✅ Session confirmed' : '❌ Session cancelled',
        description: action === 'confirm' ? 'The student has been notified.' : 'The booking has been cancelled.',
      });
      router.refresh();
    }

    setLoading(null);
  };

  if (showLinkInput) {
    return (
      <div className="space-y-2 w-48">
        <Input
          placeholder="Meeting link (optional)"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          className="h-8 text-xs"
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => handleAction('confirm')}
            disabled={!!loading}
          >
            {loading === 'confirm' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setShowLinkInput(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs text-green-600 border-green-200"
        onClick={() => handleAction('confirm')}
        disabled={!!loading}
      >
        <Check className="h-3 w-3 mr-1" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs text-destructive border-red-200"
        onClick={() => handleAction('cancel')}
        disabled={!!loading}
      >
        {loading === 'cancel' ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
      </Button>
    </div>
  );
}
