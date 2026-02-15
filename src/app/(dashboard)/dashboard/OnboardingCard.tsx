import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    number: '1',
    title: 'Skapa ett kalas',
    description: 'Fyll i datum, tid, plats och barnets namn. Välj ett tema eller skapa en egen AI-genererad inbjudan.',
  },
  {
    number: '2',
    title: 'Skicka inbjudningar',
    description: 'Dela via länk, QR-kod, e-post eller SMS. Gästerna svarar direkt i mobilen.',
  },
  {
    number: '3',
    title: 'Följ svaren',
    description: 'Se i realtid vilka som kommer, allergier och meddelanden — allt samlat på ett ställe.',
  },
];

export function OnboardingCard() {
  return (
    <Card className="border-0 glass-card overflow-hidden">
      <div className="h-1.5 gradient-celebration" />
      <CardContent className="py-8 px-6 sm:px-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-4 flex justify-center text-5xl">
            🎈
          </div>
          <h2 className="text-xl font-bold font-display sm:text-2xl">
            Välkommen till KalasKoll!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Tre enkla steg till ett perfekt planerat barnkalas.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl bg-muted/50 p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/kalas/new">
            <Button size="lg" className="font-semibold gradient-celebration text-white shadow-warm">
              Skapa ditt första kalas
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
