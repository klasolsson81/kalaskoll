import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { GradientMeshBg } from '@/components/landing/GradientMeshBg';
import { Balloons3DLoader } from '@/components/landing/Balloons3DLoader';
import { ConfettiTrigger } from '@/components/landing/ConfettiTrigger';
import { APP_URL } from '@/lib/constants';

export default function HomePage() {
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KalasKoll',
    description:
      'Skapa inbjudningar för barnkalas med AI-genererade kort och digital OSA-hantering',
    url: APP_URL,
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
      'Enkel OSA via e-post, länk och QR-kod',
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
        name: 'Hur skickar jag inbjudningar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Du kan skicka via e-post eller dela en länk direkt. Vill du ge fysiska inbjudningar? Varje kalas har en unik QR-kod du kan skriva ut. Med Guldkalas kan du även skicka via SMS. Gästerna svarar direkt via mobilen – inget konto krävs.',
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
      {
        '@type': 'Question',
        name: 'Vem ligger bakom KalasKoll?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KalasKoll är skapat av Klas Olsson i Göteborg. Idén föddes ur ett verkligt behov – att bjuda in 20 förskolebarn till ett kalas utan kaos med papperslappar och SMS. Allt nödvändigt är gratis, utan reklam.',
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
        <header className="sticky top-0 z-50 border-b border-white/30 bg-white/30 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
                KalasKoll
              </span>
            </Link>
            <nav className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-medium hover:bg-primary/10 hover:text-primary">
                  Logga in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="gradient-celebration font-semibold text-white shadow-warm hover:shadow-lg">
                  Kom igång gratis
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative flex-1">
          {/* Animated gradient mesh — covers entire page */}
          <GradientMeshBg />
          {/* 3D floating balloons */}
          <Balloons3DLoader />

          {/* All content above gradient + balloons */}
          <div className="relative z-[2]">

          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
              <div className="mx-auto max-w-3xl glass-card rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
                <ScrollReveal>
                  <p className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    Gratis att börja
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={100}>
                  <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    Smarta inbjudningar
                    <br />
                    <span className="bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
                      för barnkalas
                    </span>
                  </h1>
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80 sm:text-xl">
                    Skapa inbjudningar och dela via e-post, länk eller QR-utskrift.
                    Gästerna svarar direkt via mobilen.
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={300}>
                  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/register">
                      <Button size="lg" className="relative h-12 overflow-hidden px-8 text-base font-semibold gradient-celebration text-white shadow-warm hover:shadow-lg">
                        Skapa ditt första kalas
                        <span
                          aria-hidden="true"
                          className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          style={{
                            animation: 'shimmer-sweep 3s ease-in-out infinite',
                          }}
                        />
                      </Button>
                    </Link>
                    <a href="#hur-det-fungerar">
                      <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white/60 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                        Se hur det fungerar
                      </Button>
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="hur-det-fungerar" className="relative py-20">
            <div className="mx-auto max-w-5xl px-4">
              <ScrollReveal>
                <div className="mb-12 text-center">
                  <h2 className="font-display text-3xl font-bold tracking-tight">Så här fungerar KalasKoll</h2>
                </div>
              </ScrollReveal>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    step: '1',
                    icon: '🎨',
                    title: 'Skapa kalas',
                    description:
                      'Fyll i datum, plats och tema. Välj en gratis mall eller låt AI generera ett unikt inbjudningskort.',
                    glow: 'shadow-[0_0_20px_oklch(0.55_0.19_255/0.15)]',
                    color: 'bg-primary/10 text-primary',
                  },
                  {
                    step: '2',
                    icon: '📱',
                    title: 'Dela inbjudan',
                    description:
                      'Skicka inbjudan via e-post eller dela en länk. Vill du ge lappar? Skriv ut med QR-kod.',
                    glow: 'shadow-[0_0_20px_oklch(0.65_0.13_175/0.15)]',
                    color: 'bg-secondary/10 text-secondary',
                  },
                  {
                    step: '3',
                    icon: '✅',
                    title: 'Samla svar',
                    description:
                      'Gästerna öppnar länken och svarar direkt på mobilen. Du ser svaren i realtid.',
                    glow: 'shadow-[0_0_20px_oklch(0.80_0.14_75/0.15)]',
                    color: 'bg-accent/10 text-accent-foreground',
                  },
                ].map((feature, i) => (
                  <ScrollReveal key={feature.step} delay={i * 120}>
                    <Card className="glass-card relative overflow-hidden border-0 h-full">
                      <CardContent className="pt-8 pb-6">
                        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${feature.color} ${feature.glow}`}>
                          {feature.icon}
                        </div>
                        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Steg {feature.step}
                        </div>
                        <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="relative py-20">
            <div className="mx-auto max-w-5xl px-4">
              <ScrollReveal>
                <div className="mb-12 text-center">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground/70">
                    Funktioner
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight">Allt du behöver för kalaset</h2>
                </div>
              </ScrollReveal>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    icon: '🎨',
                    title: 'AI-genererade inbjudningar',
                    description: 'Välj mellan 9 illustrerade mallar eller skapa en unik AI-genererad inbjudan med ditt eget tema.',
                    gradient: 'bg-gradient-to-br from-primary/15 to-indigo-400/15',
                  },
                  {
                    icon: '📱',
                    title: 'Enkel OSA via mobilen',
                    description: 'Gästerna klickar på länken i mailet eller scannar QR-koden — och svarar direkt. Inget konto krävs.',
                    gradient: 'bg-gradient-to-br from-secondary/15 to-teal-400/15',
                  },
                  {
                    icon: '🛡️',
                    title: 'Allergihantering med GDPR',
                    description:
                      'Samla in allergiinfo säkert med samtycke. Data raderas automatiskt 7 dagar efter kalaset.',
                    gradient: 'bg-gradient-to-br from-emerald-400/15 to-green-400/15',
                  },
                  {
                    icon: '⚡',
                    title: 'Gästlista i realtid',
                    description:
                      'Se direkt när någon svarar. Full överblick över vilka som kommer, allergier och kontaktuppgifter.',
                    gradient: 'bg-gradient-to-br from-amber-400/15 to-orange-400/15',
                  },
                ].map((feature, i) => (
                  <ScrollReveal key={feature.title} delay={i * 100}>
                    <Card className="glass-card border-0 h-full">
                      <CardContent className="flex gap-4 pt-6">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${feature.gradient}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="mb-1 font-bold">{feature.title}</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="relative py-20">
            <div className="mx-auto max-w-3xl px-4">
              <ScrollReveal>
                <div className="mb-12 text-center">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground/70">
                    Vanliga frågor
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight">Vanliga frågor</h2>
                </div>
              </ScrollReveal>
              <div className="space-y-4">
                {[
                  {
                    q: 'Kostar det något att använda KalasKoll?',
                    a: 'Grundfunktionerna är helt gratis. Premium-funktioner som AI-genererade inbjudningar kostar 49 kr per kalas.',
                  },
                  {
                    q: 'Hur skickar jag inbjudningar?',
                    a: 'Du kan skicka via e-post eller dela en länk direkt. Vill du ge fysiska inbjudningar? Varje kalas har en unik QR-kod du kan skriva ut. Med Guldkalas kan du även skicka via SMS. Gästerna svarar direkt via mobilen – inget konto krävs.',
                  },
                  {
                    q: 'Är allergiinformationen säker?',
                    a: 'Ja. Allergidata lagras separat och krypterat, kräver samtycke, och raderas automatiskt 7 dagar efter kalaset i enlighet med GDPR.',
                  },
                  {
                    q: 'Kan jag se gästlistan i realtid?',
                    a: 'Ja! Så snart en gäst svarar uppdateras din gästlista direkt. Du ser vilka som kommer, allergier och kontaktuppgifter.',
                  },
                  {
                    q: 'Vem ligger bakom KalasKoll?',
                    a: 'KalasKoll är skapat av Klas Olsson i Göteborg. Idén föddes ur ett verkligt behov \u2013 att bjuda in 20 förskolebarn till ett kalas utan kaos med papperslappar och SMS. Allt nödvändigt är gratis, utan reklam.',
                  },
                ].map((faq, i) => (
                  <ScrollReveal key={faq.q} delay={i * 80}>
                    <Card className="glass-card border-0">
                      <CardContent className="pt-6">
                        <h3 className="mb-2 font-bold">{faq.q}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <ConfettiTrigger>
            <section className="relative overflow-hidden py-20 text-center">
              <div className="relative mx-auto max-w-2xl px-4">
                <ScrollReveal>
                  <div className="glass-card rounded-3xl px-6 py-12 sm:px-12">
                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Redo att planera kalas?</h2>
                    <p className="mt-4 text-lg text-foreground/80">
                      Skapa ditt konto gratis och ha full koll på nästa barnkalas.
                    </p>
                    <div className="mt-8">
                      <Link href="/register">
                        <Button size="lg" className="relative h-12 overflow-hidden px-8 text-base font-semibold gradient-celebration text-white shadow-warm hover:shadow-lg">
                          Kom igång gratis
                          <span
                            aria-hidden="true"
                            className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            style={{
                              animation: 'shimmer-sweep 3s ease-in-out infinite',
                            }}
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          </ConfettiTrigger>

          </div>{/* end content z-[2] wrapper */}
        </main>

      </div>
    </>
  );
}
