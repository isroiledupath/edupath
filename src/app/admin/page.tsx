import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { formatDate } from '@/lib/utils';
import { AdminActions } from './admin-actions';

export default async function AdminPage() {
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

  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const [
    { data: pendingVolunteer },
    { data: pendingInternships },
    { data: allUsers },
    { data: recentApplications },
  ] = await Promise.all([
    supabase
      .from('volunteer_listings')
      .select('*, organizer:users(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('internship_listings')
      .select('*, company:users(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('applications')
      .select('*, applicant:users(full_name, email)')
      .order('applied_at', { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 container-page py-8">
        <div className="mb-8">
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage listings, users, and platform content</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Volunteer', value: pendingVolunteer?.length ?? 0, color: 'text-orange-600' },
            { label: 'Pending Internships', value: pendingInternships?.length ?? 0, color: 'text-blue-600' },
            { label: 'Total Users', value: allUsers?.length ?? 0, color: 'text-green-600' },
            { label: 'Applications', value: recentApplications?.length ?? 0, color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="volunteer">
          <TabsList className="mb-6">
            <TabsTrigger value="volunteer">
              Volunteer{' '}
              {pendingVolunteer && pendingVolunteer.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">{pendingVolunteer.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="internships">
              Internships{' '}
              {pendingInternships && pendingInternships.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">{pendingInternships.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          {/* Pending volunteer listings */}
          <TabsContent value="volunteer">
            <Card>
              <CardHeader>
                <CardTitle>Pending Volunteer Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {!pendingVolunteer || pendingVolunteer.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending listings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingVolunteer.map((listing) => (
                      <div key={listing.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{listing.title}</h3>
                            {listing.is_verified && <VerifiedBadge size="sm" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            by {listing.organizer?.full_name} • {formatDate(listing.created_at)}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {listing.description}
                          </p>
                        </div>
                        <AdminActions listingId={listing.id} type="volunteer" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending internship listings */}
          <TabsContent value="internships">
            <Card>
              <CardHeader>
                <CardTitle>Pending Internship Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {!pendingInternships || pendingInternships.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending listings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingInternships.map((listing) => (
                      <div key={listing.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            by {listing.company?.full_name} • {formatDate(listing.created_at)}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {listing.description}
                          </p>
                        </div>
                        <AdminActions listingId={listing.id} type="internship" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentApplications?.map((app) => (
                    <div key={app.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{app.applicant?.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {app.listing_type} • {formatDate(app.applied_at)}
                        </div>
                      </div>
                      <Badge variant={
                        app.status === 'approved' ? 'default' :
                        app.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
