import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from './ProfileForm';

export const metadata: Metadata = {
  title: 'Profil',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  return (
    <ProfileForm
      defaultName={profile?.full_name || user.user_metadata?.full_name || ''}
      defaultPhone={profile?.phone || ''}
      defaultEmail={user.email || ''}
    />
  );
}
