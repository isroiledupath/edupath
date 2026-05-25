import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { DeadlineCountdown } from '@/components/shared/deadline-countdown';
import { formatDate } from '@/lib/utils';
import { ApplyButton } from './apply-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VolunteerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: listing },
    { data: { user: authUser } },
  ] = await Promise.all([
    supabase
      .from('volunteer_listings')
      .select('*, organizer:users(full_name, avatar_url, bio, location)')
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!listing) notFound();

  let userProfile = null;
  let hasApplied = false;

  if (authUser) {
    const [profileResult, applicationResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', authUser.id).single(),
      supabase
        .from('applications')
        .select('id, status')
        .eq('applicant_id', authUser.id)
        .eq('listing_id', id)
        .single(),
    ]);
    userProfile = profileResult.data;
    hasApplied = !!applicationResult.data;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userProfile} />

      <main className="flex-1 container-page py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/volunteer">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Opportunities
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">🤝 Volunteer</Badge>
                {listing.category && (
                  <Badge variant="outline">{listing.category}</Badge>
                )}
                {listing.is_verified && <VerifiedBadge showLabel />}
              </div>

              <h1 className="text-3xl font-bold">{listing.title}</h1>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                {listing.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </span>
                )}
                {listing.spots_available !== null && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {listing.spots_available} spots available
                  </span>
                )}
                {listing.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <DeadlineCountdown deadline={listing.deadline} />
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">About This Opportunity</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {listing.requirements && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Requirements</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {listing.requirements}
                </p>
              </div>
            )}

            {listing.eligibility_criteria && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Eligibility Criteria</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {listing.eligibility_criteria}
                </p>
              </div>
            )}

            {listing.benefits && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">What You&apos;ll Get</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {listing.benefits}
                </p>
              </div>
            )}

            {listing.disqualifications && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Disqualifications
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {listing.disqualifications}
                </p>
              </div>
            )}

            {/* Age requirement */}
            {(listing.min_age || listing.max_age) && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">
                  Age requirement:{' '}
                  <strong>
                    {listing.min_age && listing.max_age
                      ? `${listing.min_age}–${listing.max_age} years`
                      : listing.min_age
                      ? `${listing.min_age}+ years`
                      : `Up to ${listing.max_age} years`}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {listing.deadline && (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Application Deadline</div>
                    <div className="font-semibold">{formatDate(listing.deadline)}</div>
                    <DeadlineCountdown deadline={listing.deadline} className="justify-center mt-1" />
                  </div>
                )}

                <ApplyButton
                  listingId={listing.id}
                  listingType="volunteer"
                  hasApplied={hasApplied}
                  isLoggedIn={!!authUser}
                  requiresResume={false}
                  requiresEssay={false}
                />
              </CardContent>
            </Card>

            {/* Organizer info */}
            {listing.organizer && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Posted by</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="font-medium">{listing.organizer.full_name}</div>
                  {listing.organizer.location && (
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {listing.organizer.location}
                    </div>
                  )}
                  {listing.organizer.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {listing.organizer.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Info card */}
            <Card>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span>{formatDate(listing.created_at)}</span>
                </div>
                {listing.spots_available !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spots</span>
                    <span>{listing.spots_available} available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
