import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProfileCompletionBar } from '@/components/shared/profile-completion-bar';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth/login');

  const [{ data: profile }, { data: studentProfile }] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase.from('student_profiles').select('*').eq('user_id', authUser.id).single(),
  ]);

  if (!profile) redirect('/auth/login');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 container-page py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground mt-1">
              Complete your profile to get better-matched opportunities.
            </p>
          </div>

          {profile.role === 'student' && (
            <ProfileCompletionBar user={profile} profile={studentProfile ?? {}} />
          )}

          <ProfileForm user={profile} studentProfile={studentProfile} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
