import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/utils/admin-guard';
import { FeedbackList } from './FeedbackList';
import { FeedbackAiSummary } from './FeedbackAiSummary';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default async function AdminFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Hantera och analysera användarfeedback
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Alla feedback</TabsTrigger>
          <TabsTrigger value="ai">AI-sammanfattning</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <FeedbackList />
        </TabsContent>
        <TabsContent value="ai">
          <FeedbackAiSummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
