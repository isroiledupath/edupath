import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Calendar, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileCompletionBar } from '@/components/shared/profile-completion-bar';
import { ApplicationStatusBadge } from '@/components/shared/application-status-badge';
import { OpportunityCard } from '@/components/shared/opportunity-card';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth/login');

  const [{ data: profile }, { data: studentProfile }, { data: applications }, { data: notifications }, { data: recentListings }] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', authUser.id).single(),
      supabase.from('student_profiles').select('*').eq('user_id', authUser.id).single(),
      supabase
        .from('applications')
        .select('*')
        .eq('applicant_id', authUser.id)
        .order('applied_at', { ascending: false })
        .limit(5),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('volunteer_listings')
        .select('*')
        .eq('status', 'active')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

  if (!profile) redirect('/auth/login');

  // Role-specific redirects
  if (profile.role === 'organizer') redirect('/dashboard/organizer');
  if (profile.role === 'company') redirect('/dashboard/company');
  if (profile.role === 'mentor') redirect('/dashboard/mentor');
  if (profile.role === 'admin') redirect('/admin');

  const unreadCount = notifications?.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} unreadNotifications={unreadCount} />

      <main className="flex-1 container-page py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {profile.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your EduPath journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{applications?.length ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Applications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {applications?.filter((a) => a.status === 'approved').length ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Accepted</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Bell className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{unreadCount}</div>
                      <div className="text-xs text-muted-foreground">Notifications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Assistant CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Ask EduPath AI</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Get help with your motivation letter, university research, or any application question.
                    </p>
                    <Button asChild className="mt-3" size="sm">
                      <Link href="/ai-assistant">
                        Chat with AI <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent applications */}
            {applications && applications.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Applications</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/applications">View all</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {app.listing_type}
                          </Badge>
                          <span className="text-sm font-medium truncate">
                            Application #{app.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(app.applied_at)}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommended opportunities */}
            {recentListings && recentListings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recommended for You</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/volunteer">View all</Link>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentListings.map((listing) => (
                    <OpportunityCard
                      key={listing.id}
                      listing={listing}
                      type="volunteer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Profile completion */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfileCompletionBar
                  user={profile}
                  profile={studentProfile ?? {}}
                />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            {notifications && notifications.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Notifications</CardTitle>
                    <Badge variant="secondary">{unreadCount}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="space-y-0.5">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/notifications">View All</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { href: '/volunteer', label: '🤝 Browse Volunteer Opportunities' },
                  { href: '/internships', label: '💼 Find Internships' },
                  { href: '/mentors', label: '👨‍🏫 Book a Mentor' },
                  { href: '/resources', label: '📚 Learning Resources' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
