'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().optional(),
  location: z.string().optional(),
  min_age: z.string().optional(),
  max_age: z.string().optional(),
  spots_available: z.string().optional(),
  deadline: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  eligibility_criteria: z.string().optional(),
  disqualifications: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  'Education', 'Environment', 'Health', 'Community',
  'Arts & Culture', 'Sports', 'Technology', 'Animal Welfare'
];

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('volunteer_listings').insert({
      organizer_id: user.id,
      title: data.title,
      description: data.description,
      category: data.category || null,
      location: data.location || null,
      min_age: data.min_age ? parseInt(data.min_age) : null,
      max_age: data.max_age ? parseInt(data.max_age) : null,
      spots_available: data.spots_available ? parseInt(data.spots_available) : null,
      deadline: data.deadline || null,
      requirements: data.requirements || null,
      benefits: data.benefits || null,
      eligibility_criteria: data.eligibility_criteria || null,
      disqualifications: data.disqualifications || null,
      status: 'pending',
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create listing.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({
      title: 'Listing submitted!',
      description: 'Your listing will be reviewed by our team and published shortly.',
    });
    router.push('/dashboard/organizer');
  };

  return (
    <div className="min-h-screen container-page py-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/dashboard/organizer">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1>Post a Volunteer Opportunity</h1>
        <p className="text-muted-foreground mt-1">
          Your listing will be reviewed and approved by our team before going live.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Community Garden Volunteer" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Describe the opportunity in detail..." className="h-32" {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Education, Environment..." list="categories" {...register('category')} />
                <datalist id="categories">
                  {CATEGORIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Tashkent, Uzbekistan" {...register('location')} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spots_available">Spots Available</Label>
                <Input id="spots_available" type="number" min="1" placeholder="10" {...register('spots_available')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_age">Min Age</Label>
                <Input id="min_age" type="number" min="13" placeholder="15" {...register('min_age')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_age">Max Age</Label>
                <Input id="max_age" type="number" max="25" placeholder="22" {...register('max_age')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input id="deadline" type="date" {...register('deadline')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" placeholder="What skills or qualifications are needed?" className="h-24" {...register('requirements')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
              <Textarea id="eligibility_criteria" placeholder="Who can apply?" className="h-24" {...register('eligibility_criteria')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea id="benefits" placeholder="What will volunteers gain from this experience?" className="h-24" {...register('benefits')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disqualifications">Disqualifications</Label>
              <Textarea id="disqualifications" placeholder="Any reasons that would disqualify applicants?" className="h-20" {...register('disqualifications')} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
          ) : (
            'Submit for Review'
          )}
        </Button>
      </form>
    </div>
  );
}
