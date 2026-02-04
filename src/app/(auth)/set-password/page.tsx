import type { Metadata } from 'next';
import SetPasswordForm from './SetPasswordForm';

export const metadata: Metadata = {
  title: 'Sätt lösenord',
  description: 'Välj ett lösenord för att aktivera ditt KalasKoll-konto.',
  robots: { index: false, follow: false },
};

export default function SetPasswordPage() {
  return <SetPasswordForm />;
}
