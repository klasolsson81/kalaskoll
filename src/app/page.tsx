import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KalasKoll',
    description:
      'Skapa inbjudningar för barnkalas med AI-genererade kort och digital OSA-hantering',
    url: 'https://kalaskoll.se',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Gratis grundfunktioner',
    },
    featureList: [
      'AI-genererade inbjudningskort',
      'QR-kod för enkel OSA',
      'Allergihantering',
      'Gästlista i realtid',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Kostar det något att använda KalasKoll?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Grundfunktionerna är helt gratis. Premium-funktioner som AI-genererade inbjudningar kostar 49 kr per kalas.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hur fungerar QR-koden?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Varje kalas får en unik QR-kod som du skriver ut på inbjudan. Gästerna scannar koden med sin mobil och kan svara direkt – inget konto krävs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Är allergiinformationen säker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja. Allergidata lagras separat och krypterat, kräver samtycke, och raderas automatiskt 7 dagar efter kalaset i enlighet med GDPR.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kan jag se gästlistan i realtid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja! Så snart en gäst svarar uppdateras din gästlista direkt. Du ser vilka som kommer, allergier och kontaktuppgifter.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-primary">
                KalasKoll
              </span>
            </Link>
            <nav className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Logga in</Button>
              </Link>
              <Link href="/register">
                <Button className="gradient-celebration font-semibold text-white shadow-warm">
                  Kom igång gratis
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
              <p className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Gratis att börja
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Smarta inbjudningar
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                  för barnkalas
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Skapa snygga inbjudningskort, skicka QR-koder och hantera OSA och allergier
                digitalt. Slipp kaos med papperslappar och SMS.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold gradient-celebration text-white shadow-warm">
                    Skapa ditt första kalas
                  </Button>
                </Link>
                <a href="#hur-det-fungerar">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Se hur det fungerar
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="hur-det-fungerar" className="border-t bg-muted/40 py-20">
            <div className="mx-auto max-w-5xl px-4">
              <div className="mb-12 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                  Enkelt som 1-2-3
                </p>
                <h2 className="text-3xl font-bold tracking-tight">Så här fungerar KalasKoll</h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    step: '1',
                    icon: '🎨',
                    title: 'Skapa kalas',
                    description:
                      'Fyll i datum, plats och tema. Välj en gratis mall eller låt AI generera ett unikt inbjudningskort.',
                    color: 'bg-primary/10 text-primary',
                  },
                  {
                    step: '2',
                    icon: '📱',
                    title: 'Dela inbjudan',
                    description:
                      'Skriv ut inbjudan med QR-kod och ge till barnen. Eller skicka via SMS och e-post.',
                    color: 'bg-secondary/10 text-secondary',
                  },
                  {
                    step: '3',
                    icon: '✅',
                    title: 'Samla svar',
                    description:
                      'Gästerna scannar QR-koden och svarar direkt på mobilen. Du ser allt i realtid.',
                    color: 'bg-accent/10 text-accent-foreground',
                  },
                ].map((feature) => (
                  <Card key={feature.step} className="relative overflow-hidden border-0 shadow-soft">
                    <CardContent className="pt-8 pb-6">
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${feature.color}`}>
                        {feature.icon}
                      </div>
                      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Steg {feature.step}
                      </div>
                      <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20">
            <div className="mx-auto max-w-5xl px-4">
              <div className="mb-12 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
                  Funktioner
                </p>
                <h2 className="text-3xl font-bold tracking-tight">Allt du behöver för kalaset</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    icon: '🎨',
                    title: 'AI-genererade inbjudningar',
                    description: 'Välj mellan 9 illustrerade mallar eller skapa en unik AI-genererad inbjudan med ditt eget tema.',
                  },
                  {
                    icon: '📱',
                    title: 'QR-kod för enkel OSA',
                    description: 'Gästerna behöver bara scanna QR-koden med mobilen. Inget konto krävs. Svaret tar under 30 sekunder.',
                  },
                  {
                    icon: '🛡️',
                    title: 'Allergihantering med GDPR',
                    description:
                      'Samla in allergiinfo säkert med samtycke. Data raderas automatiskt 7 dagar efter kalaset.',
                  },
                  {
                    icon: '⚡',
                    title: 'Gästlista i realtid',
                    description:
                      'Se direkt när någon svarar. Full överblick över vilka som kommer, allergier och kontaktuppgifter.',
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="border-0 shadow-soft transition-shadow hover:shadow-warm">
                    <CardContent className="flex gap-4 pt-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="mb-1 font-bold">{feature.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t bg-muted/40 py-20">
            <div className="mx-auto max-w-3xl px-4">
              <div className="mb-12 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                  FAQ
                </p>
                <h2 className="text-3xl font-bold tracking-tight">Vanliga frågor</h2>
              </div>
              <div className="space-y-4">
                {[
                  {
                    q: 'Kostar det något att använda KalasKoll?',
                    a: 'Grundfunktionerna är helt gratis. Premium-funktioner som AI-genererade inbjudningar kostar 49 kr per kalas.',
                  },
                  {
                    q: 'Hur fungerar QR-koden?',
                    a: 'Varje kalas får en unik QR-kod som du skriver ut på inbjudan. Gästerna scannar koden med sin mobil och kan svara direkt – inget konto krävs.',
                  },
                  {
                    q: 'Är allergiinformationen säker?',
                    a: 'Ja. Allergidata lagras separat och krypterat, kräver samtycke, och raderas automatiskt 7 dagar efter kalaset i enlighet med GDPR.',
                  },
                  {
                    q: 'Kan jag se gästlistan i realtid?',
                    a: 'Ja! Så snart en gäst svarar uppdateras din gästlista direkt. Du ser vilka som kommer, allergier och kontaktuppgifter.',
                  },
                ].map((faq) => (
                  <Card key={faq.q} className="border-0 shadow-soft">
                    <CardContent className="pt-6">
                      <h3 className="mb-2 font-bold">{faq.q}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden py-20 text-center">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
            <div className="relative mx-auto max-w-2xl px-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Redo att planera kalas?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Skapa ditt konto gratis och ha full koll på nästa barnkalas.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold gradient-celebration text-white shadow-warm">
                    Kom igång gratis
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} KalasKoll. Alla rättigheter förbehållna.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
