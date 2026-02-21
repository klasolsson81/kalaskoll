'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FooterModal } from './FooterModal';
import { ContactForm } from '@/components/forms/ContactForm';

type ModalId = 'om-oss' | 'priser' | 'kontakta-oss' | 'integritetspolicy' | 'anvandarvillkor' | 'cookiepolicy';

const MODALS: Record<ModalId, { title: string; content: React.ReactNode }> = {
  'om-oss': {
    title: 'Om KalasKoll',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          KalasKoll skapades av{' '}
          <a
            href="https://klasolsson.se"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Klas Olsson
          </a>
          , 45 år och bosatt i Göteborg. Klas studerar .NET-systemutveckling och byggde
          KalasKoll för att lösa ett helt vardagligt problem &ndash; hans son Alexander skulle
          fylla 6 år och bjuda in uppemot 20 barn från förskolan.
        </p>
        <p>
          Att hålla koll på vilka som kommer, allergier och kontaktuppgifter via SMS, lappar och
          anteckningar blev snabbt kaotiskt. Tanken med KalasKoll är enkel: skriv ut snygga
          inbjudningskort med en QR-kod, lägg dem i barnens fack, och låt varje vårdnadshavare
          svara ja eller nej smidigt via mobilen.
        </p>
        <p>
          <strong className="text-foreground">Syftet är aldrig att tjäna pengar.</strong> Allt
          nödvändigt ska vara gratis. Inga annonser, ingen prenumeration &ndash; bara en ren och
          enkel tjänst. En valfri premiumfunktion finns för den som vill ha lite extra, och den
          finns enbart för att täcka API-avgifter och drift.
        </p>
        <p>
          Vi tar integritet på allvar. All allergidata hanteras enligt GDPR, krypteras och
          raderas automatiskt 7 dagar efter kalaset. Läs mer i vår integritetspolicy.
        </p>
      </div>
    ),
  },
  priser: {
    title: 'Priser',
    content: (
      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h3 className="mb-2 text-base font-bold text-foreground">Gratis</h3>
          <ul className="list-inside list-disc space-y-1">
            <li>9 illustrerade inbjudningsmallar</li>
            <li>QR-kod för enkel OSA</li>
            <li>Digital gästlista i realtid</li>
            <li>Allergihantering med GDPR-samtycke</li>
            <li>Skicka inbjudningar via e-post</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-base font-bold text-foreground">
            Guldkalas &ndash; 49 kr/kalas
          </h3>
          <ul className="list-inside list-disc space-y-1">
            <li>AI-genererade inbjudningskort</li>
            <li>4 stilar: tecknat, 3D, akvarell, fotorealistiskt</li>
            <li>Skriv eget motiv och tema</li>
            <li>Skicka inbjudningar via SMS</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Alla priser inkluderar moms. Inga dolda avgifter, inga prenumerationer.
        </p>
      </div>
    ),
  },
  'kontakta-oss': {
    title: 'Kontakta oss',
    content: <ContactForm />,
  },
  integritetspolicy: {
    title: 'Integritetspolicy',
    content: (
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h3 className="mb-1 font-bold text-foreground">1. Inledning</h3>
          <p>
            KalasKoll (&quot;vi&quot;, &quot;oss&quot;) värnar om din integritet. Denna policy
            beskriver hur vi samlar in, använder och skyddar dina personuppgifter i enlighet med
            EU:s dataskyddsförordning (GDPR).
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">2. Uppgifter vi samlar in</h3>
          <p>
            Vi samlar in: namn, e-postadress, telefonnummer (valfritt), samt information om kalas
            (datum, plats, tema). För gäster som svarar via OSA samlar vi in barnets namn,
            kontaktuppgifter och eventuella allergier (med samtycke).
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">3. Hälsodata och allergier</h3>
          <p>
            Allergiinformation klassas som hälsodata under GDPR artikel 9 och kräver uttryckligt
            samtycke. Vi lagrar allergidata separat från övrig information och krypterar den med
            AES-256-GCM. All allergidata raderas automatiskt 7 dagar efter kalasets datum.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">4. Datalagring</h3>
          <p>
            All data lagras inom EU via Supabase (PostgreSQL). Vi använder krypterade anslutningar
            (TLS), AES-256-GCM-kryptering för hälsodata och Row Level Security för att säkerställa
            att data bara är tillgänglig för behöriga användare. Foton lagras i Supabase Storage
            med åtkomstkontroll.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">5. Dina rättigheter</h3>
          <p>
            Du har rätt att: begära tillgång till dina uppgifter, rätta felaktiga uppgifter, begära
            radering av dina uppgifter, återkalla samtycke, samt lämna klagomål till
            Integritetsskyddsmyndigheten (IMY).
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">6. Kontakt</h3>
          <p>
            Frågor om hur vi hanterar dina uppgifter? Kontakta oss via e-post:{' '}
            <span className="font-medium text-foreground">hej@kalaskoll.se</span>
          </p>
        </section>
      </div>
    ),
  },
  anvandarvillkor: {
    title: 'Användarvillkor',
    content: (
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h3 className="mb-1 font-bold text-foreground">1. Tjänsten</h3>
          <p>
            KalasKoll tillhandahåller en webbaserad plattform för att skapa digitala
            barnkalas-inbjudningar, hantera OSA-svar och samla in allergiinformation. Tjänsten
            erbjuds &quot;som den är&quot; och vi förbehåller oss rätten att uppdatera funktionalitet.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">2. Konto</h3>
          <p>
            Du måste vara minst 18 år för att skapa ett konto. Du ansvarar för att hålla dina
            inloggningsuppgifter säkra och för all aktivitet som sker via ditt konto.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">3. Tillåten användning</h3>
          <p>
            Tjänsten får enbart användas för att hantera privata barnkalas-inbjudningar. Det är
            förbjudet att använda tjänsten för spam, marknadsföring, eller annat ändamål som strider
            mot svensk lag.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">4. Innehåll</h3>
          <p>
            Du behåller rättigheterna till det innehåll du skapar (namn, texter, foton). AI-genererade
            bilder skapas via tredjepartstjänster och omfattas av deras respektive licensvillkor.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">5. Ansvarsbegränsning</h3>
          <p>
            KalasKoll ansvarar inte för skada som uppstår genom användning av tjänsten, inklusive
            men inte begränsat till felaktiga OSA-svar, förlorad data eller avbrott i tjänsten.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">6. Ändringar</h3>
          <p>
            Vi kan uppdatera dessa villkor. Väsentliga ändringar meddelas via e-post till
            registrerade användare minst 30 dagar innan de träder i kraft.
          </p>
        </section>
      </div>
    ),
  },
  cookiepolicy: {
    title: 'Cookiepolicy',
    content: (
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h3 className="mb-1 font-bold text-foreground">1. Vilka cookies använder vi?</h3>
          <p>
            KalasKoll använder enbart nödvändiga cookies som krävs för att tjänsten ska fungera. Vi
            använder inga spårningscookies, reklamcookies eller analyticscookies.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">2. Autentisering</h3>
          <p>
            Vi använder en sessions-cookie (via Supabase Auth) för att hålla dig inloggad. Denna
            cookie sätts när du loggar in och raderas när du loggar ut eller sessionen löper ut.
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-bold text-foreground">3. Tredjepartscookies</h3>
          <p>
            Vi sätter inga tredjepartscookies. Eftersom vi inte använder extern analys eller reklam
            delas ingen data med tredje part via cookies.
          </p>
        </section>
      </div>
    ),
  },
};

export function Footer() {
  const [activeModal, setActiveModal] = useState<ModalId | null>(null);

  return (
    <>
      <footer className="relative z-[2] border-t border-white/30 bg-white/55 backdrop-blur-2xl print:hidden">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {/* Brand — full width on mobile */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="text-lg font-extrabold tracking-tight text-primary hover:text-primary/80 transition-colors font-display">
                KalasKoll
              </Link>
              <p className="mt-1 text-sm text-foreground/80">
                Smarta inbjudningar för barnkalas
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground font-display">Navigation</p>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setActiveModal('om-oss')}
                    className="cursor-pointer text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Om oss
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('priser')}
                    className="cursor-pointer text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Priser
                  </button>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Vanliga frågor
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('kontakta-oss')}
                    className="cursor-pointer text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Kontakta oss
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground font-display">Juridiskt</p>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setActiveModal('integritetspolicy')}
                    className="cursor-pointer text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Integritetspolicy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('anvandarvillkor')}
                    className="cursor-pointer text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Användarvillkor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('cookiepolicy')}
                    className="cursor-pointer text-sm text-foreground/80 underline-offset-2 hover:text-foreground hover:underline transition-colors"
                  >
                    Cookiepolicy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright — extra bottom padding to clear feedback widget on mobile */}
          <div className="mt-6 border-t border-foreground/10 pt-4 pb-14 sm:pb-0 text-center text-xs text-foreground/60">
            &copy; {new Date().getFullYear()} KalasKoll. Alla rättigheter förbehållna.
          </div>
        </div>
      </footer>

      {activeModal && (
        <FooterModal
          title={MODALS[activeModal].title}
          onClose={() => setActiveModal(null)}
        >
          {MODALS[activeModal].content}
        </FooterModal>
      )}
    </>
  );
}
