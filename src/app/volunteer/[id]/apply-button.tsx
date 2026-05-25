'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ResumeUploader } from '@/components/shared/resume-uploader';
import { useToast } from '@/hooks/use-toast';
import type { ListingType } from '@/types';

interface ApplyButtonProps {
  listingId: string;
  listingType: ListingType;
  hasApplied: boolean;
  isLoggedIn: boolean;
  requiresResume?: boolean;
  requiresEssay?: boolean;
}

export function ApplyButton({
  listingId,
  listingType,
  hasApplied: initiallyApplied,
  isLoggedIn,
  requiresResume = false,
  requiresEssay = false,
}: ApplyButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(initiallyApplied);
  const [loading, setLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [essay, setEssay] = useState('');
  const { toast } = useToast();

  if (!isLoggedIn) {
    return (
      <Button asChild className="w-full">
        <Link href="/auth/login">Login to Apply</Link>
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button disabled className="w-full" variant="secondary">
        ✓ Application Submitted
      </Button>
    );
  }

  const handleApply = async () => {
    if (!showForm && (requiresResume || requiresEssay)) {
      setShowForm(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          listing_type: listingType,
          resume_url: resumeUrl || undefined,
          motivation_essay: essay || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to apply');
      }

      setHasApplied(true);
      setShowForm(false);
      toast({
        title: 'Application submitted!',
        description: 'You\'ll receive a notification when the organizer reviews your application.',
      });
    } catch (error) {
      toast({
        title: 'Application failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showForm && (
        <>
          {requiresResume && (
            <div className="space-y-2">
              <Label>Resume (PDF)</Label>
              <ResumeUploader onUpload={setResumeUrl} />
            </div>
          )}
          {requiresEssay && (
            <div className="space-y-2">
              <Label>Motivation Essay</Label>
              <Textarea
                placeholder="Tell us why you're interested in this opportunity..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          )}
        </>
      )}

      <Button className="w-full" onClick={handleApply} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : showForm ? (
          'Submit Application'
        ) : (
          'Apply Now'
        )}
      </Button>

      {showForm && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
