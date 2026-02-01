import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BetaEndedPage() {
  return (
    <Card className="border-0 glass-card text-center">
      <CardHeader className="space-y-4 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          &#127881;
        </div>
        <CardTitle className="text-2xl font-display">Betan har avslutats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Tack f&ouml;r att du testade KalasKoll! Betan st&auml;ngde 28 februari 2026.
        </p>
        <p className="text-sm text-muted-foreground">
          Vi jobbar p&aring; att lansera den riktiga versionen. N&auml;r vi &auml;r klara
          kan du registrera dig p&aring; nytt &mdash; alla gamla kalas rensas automatiskt.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link href="/register">
            <Button className="w-full font-semibold gradient-celebration text-white shadow-warm">
              Registrera dig igen
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Till startsidan
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
