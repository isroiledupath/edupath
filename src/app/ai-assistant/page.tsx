import { Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AIChat } from '@/components/shared/ai-chat';

export default async function AIAssistantPage() {
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

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="container-page py-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">EduPath AI Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Your personal advisor for studying abroad and finding opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 container-page py-4">
          <div className="max-w-3xl mx-auto h-full">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
              <AIChat user={userProfile} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
