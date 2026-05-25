import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { ApplicationStatusBadge } from '@/components/shared/application-status-badge';
import { formatDate } from '@/lib/utils';

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile || profile.role !== 'organizer') redirect('/dashboard');

  const [{ data: listings }, { data: applications }] = await Promise.all([
    supabase
      .from('volunteer_listings')
      .select('*')
      .eq('organizer_id', authUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('applications')
      .select('*, applicant:users(full_name, email, avatar_url)')
      .in(
        'listing_id',
        (
          await supabase
            .from('volunteer_listings')
            .select('id')
            .eq('organizer_id', authUser.id)
        ).data?.map((l) => l.id) ?? []
      )
      .order('applied_at', { ascending: false })
      .limit(20),
  ]);

  const pendingCount = applications?.filter((a) => a.status === 'pending').length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 container-page py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Organizer Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your volunteer opportunities</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/organizer/new-listing">
              <Plus className="mr-2 h-4 w-4" />
              Post Opportunity
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: listings?.length ?? 0, color: 'text-blue-600' },
            { label: 'Active Listings', value: listings?.filter((l) => l.status === 'active').length ?? 0, color: 'text-green-600' },
            { label: 'Pending Applications', value: pendingCount, color: 'text-orange-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Listings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Listings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!listings || listings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No listings yet</p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/organizer/new-listing">Post Your First Opportunity</Link>
                  </Button>
                </div>
              ) : (
                listings.map((listing) => (
                  <div key={listing.id} className="flex items-start justify-between gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-medium text-sm truncate">{listing.title}</span>
                        {listing.is_verified && <VerifiedBadge size="sm" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(listing.created_at)}
                        {listing.deadline && ` • Due ${formatDate(listing.deadline)}`}
                      </div>
                    </div>
                    <Badge
                      variant={
                        listing.status === 'active' ? 'default' :
                        listing.status === 'pending' ? 'secondary' : 'outline'
                      }
                      className="shrink-0 text-xs"
                    >
                      {listing.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                Applications
                {pendingCount > 0 && (
                  <Badge variant="secondary">{pendingCount} pending</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!applications || applications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No applications yet</p>
              ) : (
                applications.slice(0, 8).map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{app.applicant?.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(app.applied_at)}
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
