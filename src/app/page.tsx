import Link from 'next/link';
import { ArrowRight, Star, Users, BookOpen, Sparkles, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';

const stats = [
  { value: '500+', label: 'Opportunities', icon: BookOpen },
  { value: '200+', label: 'Mentors', icon: Users },
  { value: '50+', label: 'Partner Companies', icon: Globe },
  { value: '4.9/5', label: 'Student Rating', icon: Star },
];

const features = [
  {
    emoji: '🤝',
    title: 'Volunteer Opportunities',
    description:
      'Find meaningful volunteer projects that build your resume and make a real difference in communities.',
    href: '/volunteer',
  },
  {
    emoji: '💼',
    title: 'Internship Programs',
    description:
      'Connect with top companies offering internships perfect for high school students building their careers.',
    href: '/internships',
  },
  {
    emoji: '👨‍🏫',
    title: 'Expert Mentors',
    description:
      'Learn directly from students and alumni at top universities worldwide through 1-on-1 sessions.',
    href: '/mentors',
  },
  {
    emoji: '🤖',
    title: 'AI College Advisor',
    description:
      'Get personalized guidance on university applications, motivation letters, and study strategies from our AI.',
    href: '/ai-assistant',
  },
  {
    emoji: '🎓',
    title: 'Scholarship Database',
    description:
      'Discover scholarships specifically for Uzbek students applying to international universities.',
    href: '/resources',
  },
  {
    emoji: '📚',
    title: 'Learning Resources',
    description:
      'Watch video lessons on academics, leadership, visa processes, and university application tips.',
    href: '/resources',
  },
];

const testimonials = [
  {
    name: 'Zulfiya Rashidova',
    school: 'INHA University',
    content:
      'EduPath helped me find an amazing volunteer opportunity and book a mentor session with a Harvard student. Now I\'m applying to US universities with confidence!',
    rating: 5,
  },
  {
    name: 'Bekzod Tursunov',
    school: 'Westminster University Tashkent',
    content:
      'The AI assistant helped me rewrite my motivation letter completely. I got accepted to my dream university in Germany!',
    rating: 5,
  },
  {
    name: 'Nilufar Karimova',
    school: 'National University of Uzbekistan',
    content:
      'Found my first internship through EduPath. The application process was so smooth and the mentor I found gave me invaluable advice.',
    rating: 5,
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (authUser) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    userProfile = data;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userProfile} />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container-page section-padding text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="secondary" className="mx-auto text-sm px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Now with AI-powered college counseling
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Your Gateway to{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Global Opportunities
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              EduPath connects Uzbek high school students with volunteer opportunities, internships, expert mentors, and AI-powered guidance for international university applications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" asChild className="text-base px-8">
                <Link href={authUser ? '/dashboard' : '/auth/register'}>
                  {authUser ? 'Go to Dashboard' : 'Start for Free'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="/ai-assistant">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try AI Assistant
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Free to join • No credit card required • 10,000+ students already enrolled
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center space-y-1">
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg">
              From finding your first opportunity to applying to top universities — EduPath has you covered at every step.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ emoji, title, description, href }) => (
              <Card key={title} className="card-hover group">
                <CardContent className="p-6 space-y-3">
                  <div className="text-3xl">{emoji}</div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                  </p>
                  <Link
                    href={href}
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-muted/30">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="mb-4">How EduPath Works</h2>
            <p className="text-muted-foreground text-lg">
              Get started in minutes and find your perfect opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up as a student and complete your profile with your interests, skills, and academic goals.',
              },
              {
                step: '02',
                title: 'Discover Opportunities',
                description: 'Browse verified volunteer programs, internships, and mentors matched to your profile.',
              },
              {
                step: '03',
                title: 'Apply & Grow',
                description: 'Apply in one click, get AI-powered application tips, and track your progress to success.',
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="relative text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="mb-4">Students Love EduPath</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of Uzbek students already building their futures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, school, content, rating }) => (
              <Card key={name} className="card-hover">
                <CardContent className="p-6 space-y-4">
                  <div className="flex">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{content}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs text-muted-foreground">{school}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-page text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-white">Ready to Start Your Journey?</h2>
          <p className="text-primary-foreground/80 text-lg">
            Join EduPath today and take the first step toward your international education dream.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-base px-8">
              <Link href="/auth/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-primary-foreground/70">
            {['Free to join', 'Verified opportunities', 'AI-powered guidance'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
