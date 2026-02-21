import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { GradientMeshBg } from '@/components/landing/GradientMeshBg';
import { faqItems, faqCategories } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'Vanliga frågor',
  description:
    'Svar på vanliga frågor om KalasKoll – priser, inbjudningar, GDPR, allergihantering och mer.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
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
          <GradientMeshBg />

          <div className="relative z-[2]">
            {/* Hero */}
            <section className="relative py-16 sm:py-20">
              <div className="mx-auto max-w-3xl px-4 text-center">
                <ScrollReveal>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                    FAQ
                  </p>
                  <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Vanliga frågor
                  </h1>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-foreground">
                    Allt du behöver veta om KalasKoll — från priser och inbjudningar till säkerhet och GDPR.
                  </p>
                </ScrollReveal>
              </div>
            </section>

            {/* FAQ categories */}
            <section className="relative pb-20">
              <div className="mx-auto max-w-3xl px-4">
                <div className="space-y-10">
                  {faqCategories.map((category, catIdx) => {
                    const categoryItems = faqItems.filter(
                      (item) => item.category === category.id
                    );
                    if (categoryItems.length === 0) return null;

                    return (
                      <ScrollReveal key={category.id} delay={catIdx * 100}>
                        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-sm sm:p-8">
                          <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">
                            {category.label}
                          </h2>
                          <Accordion type="single" collapsible>
                            {categoryItems.map((faq, i) => (
                              <AccordionItem
                                key={i}
                                value={`${category.id}-${i}`}
                                className="border-gray-200"
                              >
                                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline hover:text-primary">
                                  {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm leading-relaxed text-foreground">
                                  {faq.a}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="relative pb-20">
              <div className="mx-auto max-w-2xl px-4">
                <ScrollReveal>
                  <div className="rounded-3xl bg-white/90 backdrop-blur-sm px-6 py-12 text-center shadow-sm sm:px-12">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      Har du fler frågor?
                    </h2>
                    <p className="mt-3 text-foreground">
                      Hör av dig till oss så hjälper vi dig. Eller kom igång direkt — det är gratis.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
                      <a href={`mailto:hej@kalaskoll.se`}>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white/60 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                          Kontakta oss
                        </Button>
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
