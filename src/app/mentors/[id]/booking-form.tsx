'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface BookingFormProps {
  mentorId: string;
  sessionType: 'free' | 'paid';
  pricePerSession?: number;
  isLoggedIn: boolean;
}

export function BookingForm({ mentorId, sessionType, pricePerSession, isLoggedIn }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [topic, setTopic] = useState('');
  const { toast } = useToast();

  if (!isLoggedIn) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to book a mentoring session.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Login to Book</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-4xl">🎉</div>
        <h3 className="font-semibold">Booking Requested!</h3>
        <p className="text-sm text-muted-foreground">
          The mentor will confirm your session shortly. You&apos;ll receive a notification.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('mentor_bookings').insert({
      student_id: user.id,
      mentor_id: mentorId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: 60,
      topic: topic || null,
      status: 'pending',
    });

    if (error) {
      toast({
        title: 'Booking failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Create notification for mentor
    await supabase.from('notifications').insert({
      user_id: mentorId,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `A student has requested a mentoring session for ${new Date(scheduledAt).toLocaleString()}.`,
    });

    setSubmitted(true);
    setLoading(false);
  };

  // Get min datetime (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Session duration</span>
        <span className="font-medium">60 minutes</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Session cost</span>
        {sessionType === 'free' ? (
          <Badge variant="success">Free</Badge>
        ) : (
          <span className="font-semibold">${pricePerSession}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_at">
          <Calendar className="h-4 w-4 inline mr-1.5" />
          Preferred Date & Time
        </Label>
        <Input
          id="scheduled_at"
          type="datetime-local"
          min={minDate}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic (optional)</Label>
        <Textarea
          id="topic"
          placeholder="What would you like to discuss? e.g. 'Help with Common App essays'"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-20"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || !scheduledAt}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Requesting...
          </>
        ) : (
          'Request Session'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        The mentor will confirm or suggest a different time.
      </p>
    </form>
  );
}
