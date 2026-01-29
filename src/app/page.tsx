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
        <header className="border-b">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <h1 className="text-xl font-bold">KalasKoll</h1>
            <nav className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Logga in</Button>
              </Link>
              <Link href="/register">
                <Button>Kom igång</Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="mx-auto max-w-5xl px-4 py-20 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Smarta inbjudningar
              <br />
              för barnkalas
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Skapa snygga inbjudningskort med AI, skicka QR-koder och hantera OSA och allergier
              digitalt. Slipp kaos med papperslappar och SMS.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Skapa ditt första kalas</Button>
              </Link>
            </div>
          </section>

          {/* How it works */}
          <section className="border-t bg-muted/50 py-20">
            <div className="mx-auto max-w-5xl px-4">
              <h3 className="mb-12 text-center text-2xl font-bold">Så här fungerar KalasKoll</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Skapa kalas',
                    description:
                      'Fyll i datum, plats och tema. AI genererar ett snyggt inbjudningskort åt dig.',
                  },
                  {
                    step: '2',
                    title: 'Skriv ut & dela',
                    description:
                      'Skriv ut inbjudan med QR-kod. Ge till barnen i skolan eller skicka digitalt.',
                  },
                  {
                    step: '3',
                    title: 'Samla svar',
                    description:
                      'Gästerna scannar QR-koden och svarar direkt på mobilen. Du ser allt i realtid.',
                  },
                ].map((feature) => (
                  <Card key={feature.step}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {feature.step}
                      </div>
                      <h4 className="mb-2 font-semibold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20">
            <div className="mx-auto max-w-5xl px-4">
              <h3 className="mb-12 text-center text-2xl font-bold">Allt du behöver</h3>
              <div className="grid gap-8 sm:grid-cols-2">
                {[
                  {
                    title: 'AI-genererade inbjudningar',
                    description: 'Välj tema och få en unik, professionell inbjudan genererad av AI.',
                  },
                  {
                    title: 'QR-kod för enkel OSA',
                    description: 'Gästerna behöver bara scanna QR-koden med mobilen. Inget konto krävs.',
                  },
                  {
                    title: 'Allergihantering med GDPR',
                    description:
                      'Samla in allergiinfo säkert med samtycke. Data raderas automatiskt efter kalaset.',
                  },
                  {
                    title: 'Gästlista i realtid',
                    description:
                      'Se direkt när någon svarar. Överblick över vilka som kommer och deras allergier.',
                  },
                ].map((feature) => (
                  <div key={feature.title} className="space-y-2">
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t bg-muted/50 py-20">
            <div className="mx-auto max-w-3xl px-4">
              <h3 className="mb-12 text-center text-2xl font-bold">Vanliga frågor</h3>
              <div className="space-y-6">
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
                  <div key={faq.q} className="space-y-2">
                    <h4 className="font-semibold">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 text-center">
            <div className="mx-auto max-w-2xl px-4">
              <h3 className="text-3xl font-bold">Redo att planera kalas?</h3>
              <p className="mt-4 text-muted-foreground">
                Skapa ditt konto gratis och ha full koll på nästa barnkalas.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg">Skapa konto gratis</Button>
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
