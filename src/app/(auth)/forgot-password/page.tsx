import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Glömt lösenord',
  description: 'Återställ ditt lösenord för KalasKoll. Ange din e-postadress så skickar vi en återställningslänk.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
