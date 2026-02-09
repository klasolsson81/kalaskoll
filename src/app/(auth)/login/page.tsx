import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Logga in',
  description: 'Logga in på KalasKoll för att hantera dina barnkalas-inbjudningar och se OSA-svar i realtid.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
