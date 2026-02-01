import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BetaBanner } from '@/components/beta/BetaBanner';
import { BetaRegisterForm } from './BetaRegisterForm';
import { WaitlistForm } from '@/components/forms/WaitlistForm';
import { createClient } from '@/lib/supabase/server';
import { BETA_CONFIG, isBetaEnded } from '@/lib/beta-config';

export default async function RegisterPage() {
  if (isBetaEnded()) {
    return (
      <Card className="border-0 shadow-lifted">
        <CardHeader className="text-center space-y-3 pb-2">
          <Link href="/" className="mx-auto block">
            <span className="text-3xl font-extrabold tracking-tight text-primary">
              KalasKoll
            </span>
          </Link>
          <div>
            <CardTitle className="text-2xl">Kommer snart!</CardTitle>
            <CardDescription className="mt-1 text-base">
              Betan avslutades 28 februari. Vi jobbar p&aring; att lansera den riktiga versionen.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground leading-relaxed text-center">
            <p className="mb-2">
              Tack till alla som testade! Vi &aring;terkommer snart med den fullst&auml;ndiga versionen av KalasKoll.
            </p>
            <p>
              Fr&aring;gor? Maila{' '}
              <a
                href="mailto:klasolsson81@gmail.com"
                className="font-semibold text-primary hover:underline"
              >
                klasolsson81@gmail.com
              </a>
            </p>
          </div>

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
          <>
            <div className="mb-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground leading-relaxed">
              <p className="mb-2">
                Just nu är alla testplatser bokade. Håll utkik — vi öppnar fler platser inom kort!
              </p>
              <p>
                Om du har ett riktigt barnkalas på gång och vill testa på riktigt, skicka ett mail
                till{' '}
                <a
                  href="mailto:klasolsson81@gmail.com"
                  className="font-semibold text-primary hover:underline"
                >
                  klasolsson81@gmail.com
                </a>{' '}
                så kanske Klas släpper in dig.
              </p>
            </div>
            <WaitlistForm />
          </>
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
