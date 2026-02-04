import type { Metadata } from 'next';
import ProfileForm from './ProfileForm';

export const metadata: Metadata = {
  title: 'Profil',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileForm />;
}
