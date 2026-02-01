import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BetaBanner } from '@/components/beta/BetaBanner';
import { BetaRegisterForm } from './BetaRegisterForm';
import { WaitlistForm } from '@/components/forms/WaitlistForm';
import { createClient } from '@/lib/supabase/server';
import { BETA_CONFIG } from '@/lib/beta-config';

export default async function RegisterPage() {
  const supabase = await createClient();

  const { count: testerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'tester');

  const totalTesters = testerCount || 0;
  const spotsRemaining = Math.max(0, BETA_CONFIG.maxTesters - totalTesters);
  const percentFull = Math.round((totalTesters / BETA_CONFIG.maxTesters) * 100);
  const isFull = spotsRemaining <= 0;

  const stats = { totalTesters, spotsRemaining, percentFull };

  return (
    <Card className="border-0 shadow-lifted">
      <CardHeader className="text-center space-y-3 pb-2">
        <Link href="/" className="mx-auto block">
          <span className="text-3xl font-extrabold tracking-tight text-primary">
            KalasKoll
          </span>
        </Link>
        <div>
          <CardTitle className="text-2xl">
            {isFull ? 'Gå med i väntelistan' : 'Skapa beta-konto'}
          </CardTitle>
          <CardDescription className="mt-1 text-base">
            {isFull
              ? 'Alla platser är tagna — skriv upp dig!'
              : 'Testa KalasKoll gratis som beta-testare'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <BetaBanner stats={stats} />

        {isFull ? (
          <WaitlistForm />
        ) : (
          <BetaRegisterForm spotsRemaining={spotsRemaining} />
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">eller</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Har du redan ett konto?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Logga in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
