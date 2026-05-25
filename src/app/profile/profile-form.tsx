'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeUploader } from '@/components/shared/resume-uploader';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { User, StudentProfile } from '@/types';

const schema = z.object({
  full_name: z.string().min(2),
  school_name: z.string().optional(),
  grade: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  gpa: z.string().optional(),
  major_interest: z.string().optional(),
  target_country: z.string().optional(),
  target_university: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProfileFormProps {
  user: User;
  studentProfile: StudentProfile | null;
}

export function ProfileForm({ user, studentProfile }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>(studentProfile?.skills ?? []);
  const [languages, setLanguages] = useState<string[]>(studentProfile?.languages ?? []);
  const [resumeUrl, setResumeUrl] = useState(studentProfile?.resume_url ?? '');
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user.full_name,
      school_name: user.school_name ?? '',
      grade: user.grade ?? '',
      bio: user.bio ?? '',
      location: user.location ?? '',
      gpa: studentProfile?.gpa?.toString() ?? '',
      major_interest: studentProfile?.major_interest ?? '',
      target_country: studentProfile?.target_country ?? '',
      target_university: studentProfile?.target_university ?? '',
    },
  });

  const addItem = (item: string, list: string[], setter: (v: string[]) => void, clearInput: () => void) => {
    if (item.trim() && !list.includes(item.trim())) {
      setter([...list, item.trim()]);
      clearInput();
    }
  };

  const removeItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.filter((i) => i !== item));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();

    // Update user profile
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: data.full_name,
        school_name: data.school_name || null,
        grade: data.grade || null,
        bio: data.bio || null,
        location: data.location || null,
      })
      .eq('id', user.id);

    if (userError) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Update student profile if applicable
    if (user.role === 'student') {
      const studentData = {
        user_id: user.id,
        gpa: data.gpa ? parseFloat(data.gpa) : null,
        major_interest: data.major_interest || null,
        target_country: data.target_country || null,
        target_university: data.target_university || null,
        skills,
        languages,
        resume_url: resumeUrl || null,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('student_profiles')
        .upsert(studentData, { onConflict: 'user_id' });
    }

    toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">School</Label>
              <Input id="school_name" placeholder="Your school name" {...register('school_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" placeholder="e.g. 11th grade" {...register('grade')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="City, Country" {...register('location')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio <span className="text-muted-foreground text-xs">(max 500 chars)</span></Label>
            <Textarea
              id="bio"
              placeholder="Tell mentors and organizations about yourself..."
              {...register('bio')}
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student-specific */}
      {user.role === 'student' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Academic Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input id="gpa" type="number" step="0.01" min="0" max="4" placeholder="3.80" {...register('gpa')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major_interest">Major Interest</Label>
                  <Input id="major_interest" placeholder="Computer Science, Medicine..." {...register('major_interest')} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_country">Target Country</Label>
                  <Input id="target_country" placeholder="USA, UK, Germany..." {...register('target_country')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_university">Target University</Label>
                  <Input id="target_university" placeholder="MIT, Oxford..." {...register('target_university')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g. Python, Leadership)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(newSkill, skills, setSkills, () => setNewSkill(''));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addItem(newSkill, skills, setSkills, () => setNewSkill(''))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button type="button" onClick={() => removeItem(skill, skills, setSkills)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex gap-2">
                  <Input
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    placeholder="Add a language (e.g. Uzbek, English)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(newLang, languages, setLanguages, () => setNewLang(''));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addItem(newLang, languages, setLanguages, () => setNewLang(''))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="gap-1">
                        {lang}
                        <button type="button" onClick={() => removeItem(lang, languages, setLanguages)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUploader
                onUpload={setResumeUrl}
                currentUrl={resumeUrl}
              />
            </CardContent>
          </Card>
        </>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Profile'
        )}
      </Button>
    </form>
  );
}
