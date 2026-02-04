import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/utils/admin-guard';
import { AdminStatsCards } from './AdminStatsCards';
import { AdminInviteForm } from './AdminInviteForm';
import { AdminUserList } from './AdminUserList';
import { AuditLogList } from './AuditLogList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Översikt och hantering av KalasKoll
        </p>
      </div>

      <AdminInviteForm />

      <AdminStatsCards />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Användare</TabsTrigger>
          <TabsTrigger value="audit">Auditlogg</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <AdminUserList />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
