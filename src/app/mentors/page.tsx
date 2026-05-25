import { Suspense } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MentorCard } from '@/components/shared/mentor-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const SESSION_TYPES = ['All', 'Free', 'Paid'];
const EXPERTISE = [
  'Computer Science',
  'Business',
  'Medicine',
  'Engineering',
  'Law',
  'Arts',
  'Economics',
];

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

async function MentorGrid({ q, type }: { q?: string; type?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from('mentor_profiles')
    .select(`
      *,
      user:users(id, full_name, email, avatar_url, bio, location)
    `)
    .eq('verified', true)
    .order('rating', { ascending: false });

  if (type && type !== 'All') {
    query = query.eq('session_type', type.toLowerCase());
  }

  const { data: mentors } = await query.limit(24);

  if (!mentors || mentors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">👨‍🏫</div>
        <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
        <p className="text-muted-foreground">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.user_id}
          mentor={{ ...mentor.user, mentor_profiles: mentor }}
        />
      ))}
    </div>
  );
}

export default async function MentorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
    userProfile = data;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userProfile} />

      <main className="flex-1">
        <section className="gradient-hero border-b">
          <div className="container-page py-12">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h1>Find Your Mentor 👨‍🏫</h1>
              <p className="text-muted-foreground text-lg">
                Connect with students and alumni from top universities around the world for personalized guidance.
              </p>

              <form className="flex gap-2 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Search by university, expertise..."
                    defaultValue={params.q}
                    className="pl-9"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>
          </div>
        </section>

        <div className="container-page py-8">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex gap-2">
              {SESSION_TYPES.map((t) => (
                <a
                  key={t}
                  href={t === 'All' ? '/mentors' : `/mentors?type=${t}`}
                >
                  <Badge
                    variant={
                      (params.type === t || (!params.type && t === 'All'))
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    {t === 'Free' ? '🆓 ' : t === 'Paid' ? '💳 ' : ''}{t}
                  </Badge>
                </a>
              ))}
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            }
          >
            <MentorGrid q={params.q} type={params.type} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
