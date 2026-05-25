import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VideoCard } from '@/components/shared/video-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { VideoCategory } from '@/types';

const CATEGORIES: { value: VideoCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📚' },
  { value: 'academics', label: 'Academics', emoji: '📖' },
  { value: 'leadership', label: 'Leadership', emoji: '🏆' },
  { value: 'skills', label: 'Skills', emoji: '⚡' },
  { value: 'university_guide', label: 'University Guide', emoji: '🎓' },
  { value: 'visa', label: 'Visa', emoji: '✈️' },
];

interface PageProps {
  searchParams: Promise<{ category?: string; tab?: string }>;
}

async function VideosSection({ category }: { category?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from('video_lessons')
    .select('*')
    .order('views', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data: videos } = await query.limit(12);

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎬</div>
        <p className="text-muted-foreground">No videos in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

async function ScholarshipsSection() {
  const supabase = await createClient();

  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .order('deadline', { ascending: true })
    .limit(12);

  if (!scholarships || scholarships.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎓</div>
        <p className="text-muted-foreground">No scholarships listed yet.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {scholarships.map((scholarship) => (
        <Card key={scholarship.id} className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base leading-snug">{scholarship.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{scholarship.provider}</p>
              </div>
              {scholarship.amount && (
                <Badge variant="success" className="shrink-0">{scholarship.amount}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {scholarship.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {scholarship.description}
              </p>
            )}

            {scholarship.eligibility && (
              <p className="text-xs text-muted-foreground">
                <strong>Eligibility:</strong> {scholarship.eligibility}
              </p>
            )}

            <div className="flex items-center justify-between">
              {scholarship.deadline && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Deadline: {formatDate(scholarship.deadline)}
                </span>
              )}

              {scholarship.target_country?.length > 0 && (
                <div className="flex gap-1">
                  {scholarship.target_country.slice(0, 2).map((c: string) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              )}
            </div>

            {scholarship.link && (
              <Button asChild size="sm" variant="outline" className="w-full">
                <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Apply / Learn More
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function ResourcesPage({ searchParams }: PageProps) {
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
          <div className="container-page py-12 text-center">
            <h1>Learning Resources 📚</h1>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
              Watch video lessons, find scholarships, and access guides for studying abroad.
            </p>
          </div>
        </section>

        <div className="container-page py-8">
          <Tabs defaultValue={params.tab ?? 'videos'}>
            <TabsList className="mb-6">
              <TabsTrigger value="videos">🎬 Videos</TabsTrigger>
              <TabsTrigger value="scholarships">🎓 Scholarships</TabsTrigger>
            </TabsList>

            <TabsContent value="videos">
              {/* Category filters for videos */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map(({ value, label, emoji }) => (
                  <a
                    key={value}
                    href={`/resources?category=${value}`}
                  >
                    <Badge
                      variant={
                        (params.category === value || (!params.category && value === 'all'))
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      {emoji} {label}
                    </Badge>
                  </a>
                ))}
              </div>

              <Suspense
                fallback={
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-video rounded-lg" />
                    ))}
                  </div>
                }
              >
                <VideosSection category={params.category} />
              </Suspense>
            </TabsContent>

            <TabsContent value="scholarships">
              <Suspense
                fallback={
                  <div className="grid md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-48 rounded-lg" />
                    ))}
                  </div>
                }
              >
                <ScholarshipsSection />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
