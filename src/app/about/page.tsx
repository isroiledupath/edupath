import Link from 'next/link';
import { ArrowRight, Target, Heart, Lightbulb, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  {
    icon: Target,
    title: 'Purposeful',
    description: 'Every feature on EduPath is designed with one goal: helping Uzbek students succeed internationally.',
  },
  {
    icon: Heart,
    title: 'Inclusive',
    description: 'We believe every student deserves access to world-class opportunities, regardless of their background.',
  },
  {
    icon: Lightbulb,
    title: 'Innovative',
    description: "We use cutting-edge AI technology to give students the kind of personalized guidance that was previously only available to the privileged few.",
  },
  {
    icon: Globe,
    title: 'Global',
    description: 'We connect local talent with global opportunities, bridging the gap between Uzbekistan and the world.',
  },
];

const team = [
  { name: 'Jahongir Yusupov', role: 'Founder & CEO', school: 'Former student, now at Stanford' },
  { name: 'Malika Tashkentova', role: 'Head of Partnerships', school: 'Oxford University Graduate' },
  { name: 'Rustam Nazarov', role: 'Lead Engineer', school: 'MIT Computer Science' },
];

export default async function AboutPage() {
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
        {/* Hero */}
        <section className="gradient-hero border-b">
          <div className="container-page section-padding text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-5xl font-extrabold">
                About{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EduPath
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We&apos;re on a mission to make world-class education opportunities accessible to every talented student in Uzbekistan.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding">
          <div className="container-page">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="space-y-4">
                <h2>Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EduPath was founded because we saw a gap: talented Uzbek students with big dreams but limited access to the guidance and opportunities needed to achieve them.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We built a platform where students can find real volunteer opportunities and internships, connect with mentors who&apos;ve already walked the path, and get personalized AI-powered guidance for university applications — all in one place.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you dream of studying at MIT, Oxford, or anywhere else in the world — EduPath is here to help you get there.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '10,000+', label: 'Students Helped' },
                  { value: '500+', label: 'Opportunities Listed' },
                  { value: '200+', label: 'Active Mentors' },
                  { value: '50+', label: 'Partner Organizations' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center p-4 rounded-xl bg-muted/50">
                    <div className="text-3xl font-bold text-primary">{value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-muted/30">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="mb-4">Our Values</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="text-center">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="mb-4">Built by Students, for Students</h2>
              <p className="text-muted-foreground">
                Our team consists of Uzbek students and alumni who&apos;ve personally navigated the path to international universities.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {team.map(({ name, role, school }) => (
                <Card key={name} className="text-center">
                  <CardContent className="p-6 space-y-2">
                    <div className="text-4xl mb-3">👤</div>
                    <h3 className="font-semibold">{name}</h3>
                    <p className="text-sm text-primary font-medium">{role}</p>
                    <p className="text-xs text-muted-foreground">{school}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-primary text-primary-foreground">
          <div className="container-page text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-white">Join the EduPath Community</h2>
            <p className="text-primary-foreground/80">
              Whether you&apos;re a student, a mentor, an organization, or a company — there&apos;s a place for you on EduPath.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-base px-8">
              <Link href="/auth/register">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
