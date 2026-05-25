import { Suspense } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { OpportunityCard } from '@/components/shared/opportunity-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { InternshipListing } from '@/types';

const FIELDS = [
  'All',
  'Technology',
  'Finance',
  'Marketing',
  'Engineering',
  'Design',
  'Research',
  'Healthcare',
  'Education',
  'Media',
];

interface PageProps {
  searchParams: Promise<{ q?: string; field?: string }>;
}

async function InternshipGrid({ q, field }: { q?: string; field?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from('internship_listings')
    .select('*')
    .eq('status', 'active')
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (field && field !== 'All') {
    query = query.eq('field', field);
  }

  const { data: listings } = await query.limit(24);

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">💼</div>
        <h3 className="text-lg font-semibold mb-2">No internships found</h3>
        <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing: InternshipListing) => (
        <OpportunityCard key={listing.id} listing={listing} type="internship" />
      ))}
    </div>
  );
}

export default async function InternshipsPage({ searchParams }: PageProps) {
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
              <h1>Internship Programs 💼</h1>
              <p className="text-muted-foreground text-lg">
                Gain real-world experience with internships designed for ambitious high school students.
              </p>

              <form className="flex gap-2 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Search internships..."
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
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            {FIELDS.map((f) => (
              <a
                key={f}
                href={f === 'All' ? '/internships' : `/internships?field=${encodeURIComponent(f)}`}
              >
                <Badge
                  variant={
                    (params.field === f || (!params.field && f === 'All'))
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {f}
                </Badge>
              </a>
            ))}
          </div>

          <Suspense
            fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            }
          >
            <InternshipGrid q={params.q} field={params.field} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
