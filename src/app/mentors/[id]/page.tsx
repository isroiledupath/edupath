import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, GraduationCap, Globe, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { getInitials } from '@/lib/utils';
import { BookingForm } from './booking-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default async function MentorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: mentorProfile },
    { data: { user: authUser } },
  ] = await Promise.all([
    supabase
      .from('mentor_profiles')
      .select('*, user:users(*)')
      .eq('user_id', id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!mentorProfile || !mentorProfile.verified) notFound();

  let userProfile = null;
  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
    userProfile = data;
  }

  const mentor = mentorProfile.user;
  const availability = mentorProfile.availability_schedule as Record<string, string[]>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userProfile} />

      <main className="flex-1 container-page py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/mentors">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Mentors
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mentor header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarImage src={mentor.avatar_url ?? ''} alt={mentor.full_name} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                  {getInitials(mentor.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{mentor.full_name}</h1>
                  {mentorProfile.verified && <VerifiedBadge size="lg" showLabel />}
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span>{mentorProfile.degree ? `${mentorProfile.degree} at ` : ''}{mentorProfile.university}</span>
                  {mentorProfile.graduation_year && (
                    <span className="text-sm">• Class of {mentorProfile.graduation_year}</span>
                  )}
                </div>

                {mentor.location && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Globe className="h-4 w-4" />
                    {mentor.location}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{mentorProfile.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({mentorProfile.total_sessions} sessions)
                    </span>
                  </div>
                  {mentorProfile.session_type === 'free' ? (
                    <Badge variant="success">Free Sessions</Badge>
                  ) : (
                    <Badge variant="secondary">${mentorProfile.price_per_session}/session</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {mentor.bio && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">About</h2>
                <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
              </div>
            )}

            {mentorProfile.expertise_areas.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Expertise Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.expertise_areas.map((area: string) => (
                    <Badge key={area} variant="secondary">{area}</Badge>
                  ))}
                </div>
              </div>
            )}

            {mentorProfile.languages_spoken.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.languages_spoken.map((lang: string) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {Object.keys(availability).length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Availability
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DAYS.map((day) => {
                    const slots = availability[day.toLowerCase()] ?? [];
                    if (slots.length === 0) return null;
                    return (
                      <div key={day} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="text-sm font-medium">{day}</div>
                        <div className="space-y-0.5">
                          {slots.map((slot: string) => (
                            <div key={slot} className="text-xs text-muted-foreground">{slot}</div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm
                  mentorId={id}
                  sessionType={mentorProfile.session_type}
                  pricePerSession={mentorProfile.price_per_session}
                  isLoggedIn={!!authUser}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
