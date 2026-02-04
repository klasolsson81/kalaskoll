import type { Metadata } from 'next';
import PasswordForm from './PasswordForm';

export const metadata: Metadata = {
  title: 'Ändra lösenord',
  robots: { index: false, follow: false },
};

export default function PasswordPage() {
  return <PasswordForm />;
}
