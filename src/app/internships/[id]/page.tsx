import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft, Briefcase, GraduationCap, Clock, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { DeadlineCountdown } from '@/components/shared/deadline-countdown';
import { formatDate } from '@/lib/utils';
import { ApplyButton } from '@/app/volunteer/[id]/apply-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InternshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: listing },
    { data: { user: authUser } },
  ] = await Promise.all([
    supabase
      .from('internship_listings')
      .select('*, company:users(full_name, avatar_url, bio, location)')
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
            <Link href="/internships">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Internships
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>💼 Internship</Badge>
                {listing.field && <Badge variant="outline">{listing.field}</Badge>}
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
                {listing.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {listing.duration}
                  </span>
                )}
                {listing.compensation && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    {listing.compensation}
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

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">About This Internship</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Requirements</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {listing.min_gpa && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Minimum GPA</div>
                      <div className="text-sm text-muted-foreground">{listing.min_gpa} or above</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Briefcase className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Resume</div>
                    <div className="text-sm text-muted-foreground">
                      {listing.resume_required ? 'Required' : 'Optional'}
                    </div>
                  </div>
                </div>
              </div>

              {listing.additional_requirements && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm mt-2">
                  {listing.additional_requirements}
                </p>
              )}
            </div>

            {listing.motivation_essay_required && (
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  📝 This internship requires a motivation essay
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Prepare a compelling essay explaining your interest and goals.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
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
                  listingType="internship"
                  hasApplied={hasApplied}
                  isLoggedIn={!!authUser}
                  requiresResume={listing.resume_required}
                  requiresEssay={listing.motivation_essay_required}
                />
              </CardContent>
            </Card>

            {listing.company && (
              <Card>
                <CardContent className="p-4">
                  <div className="font-medium text-sm mb-1">Posted by</div>
                  <div className="font-semibold">{listing.company.full_name}</div>
                  {listing.company.location && (
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {listing.company.location}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
