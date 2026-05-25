import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { BookingActions } from './booking-actions';

export default async function MentorDashboard() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users').select('*').eq('id', authUser.id).single();

  if (!profile || profile.role !== 'mentor') redirect('/dashboard');

  const [{ data: mentorProfile }, { data: bookings }] = await Promise.all([
    supabase.from('mentor_profiles').select('*').eq('user_id', authUser.id).single(),
    supabase
      .from('mentor_bookings')
      .select('*, student:users(full_name, email, avatar_url)')
      .eq('mentor_id', authUser.id)
      .order('scheduled_at', { ascending: true }),
  ]);

  const upcomingBookings = bookings?.filter(
    (b) => new Date(b.scheduled_at) > new Date() && b.status !== 'cancelled'
  ) ?? [];
  const pendingBookings = bookings?.filter((b) => b.status === 'pending') ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 container-page py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Mentor Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {mentorProfile
                ? `You have ${upcomingBookings.length} upcoming sessions`
                : 'Complete your mentor profile to get started'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile">Edit Profile</Link>
          </Button>
        </div>

        {!mentorProfile && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-6">
              <h3 className="font-semibold">Complete Your Mentor Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your university, expertise areas, and availability so students can find and book you.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/dashboard/mentor/setup">Setup Mentor Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: mentorProfile?.total_sessions ?? 0 },
            { label: 'Upcoming', value: upcomingBookings.length },
            { label: 'Pending', value: pendingBookings.length },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Session Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {!bookings || bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No bookings yet. Complete your profile and students will find you!
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{booking.student?.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(booking.scheduled_at)} • {booking.duration_minutes} min
                      </div>
                      {booking.topic && (
                        <div className="text-sm mt-1 text-muted-foreground">
                          Topic: {booking.topic}
                        </div>
                      )}
                      {booking.meeting_link && (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 block"
                        >
                          Join Meeting →
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge
                        variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'completed' ? 'outline' :
                          'destructive'
                        }
                      >
                        {booking.status}
                      </Badge>
                      {booking.status === 'pending' && (
                        <BookingActions bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
