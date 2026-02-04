import type { Metadata } from 'next';
import ConfirmedContent from './ConfirmedContent';

export const metadata: Metadata = {
  title: 'Konto verifierat',
  description: 'Ditt KalasKoll-konto är nu verifierat och redo att använda.',
  robots: { index: false, follow: false },
};

export default function ConfirmedPage() {
  return <ConfirmedContent />;
}
