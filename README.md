# KalasKoll – Smarta barnkalas-inbjudningar med QR-kod

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-kalaskoll.se-10B981?style=for-the-badge&logo=vercel)](https://kalaskoll.se)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-133%20unit%20%2B%2041%20E2E-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![GDPR](https://img.shields.io/badge/GDPR-AES--256--GCM-blue?style=for-the-badge&logo=shieldsdotio)](https://gdpr.eu/)

**Digitala barnkalas-inbjudningar med AI-genererade kort, QR-kod-OSA och GDPR-säkrad allergihantering.**

[Live Demo](https://kalaskoll.se) | [Dokumentation](./CLAUDE.md) | [Changelog](./docs/CHANGELOG.md)

</div>

---

## Om Projektet

KalasKoll förenklar kalasplanering för svenska föräldrar. Istället för papperslappar, SMS-grupper och WhatsApp-meddelanden skapar du en digital inbjudan med QR-kod — gästerna skannar och svarar direkt från mobilen.

Projektet är byggt av **Klas Olsson** som förberedelse för sin son Alexanders 7-årskalas (20 förskolebarn, Leo's Lekland).

### Hur det fungerar

```
1. Skapa konto och logga in
2. Skapa kalas — välj gratis mall eller AI-genererad inbjudan
3. Skriv ut inbjudan med QR-kod, lägg i facket på förskolan
4. Gästerna skannar QR → svarar ja/nej + allergiinfo via mobilen
5. Du ser alla svar i realtid på din dashboard
```

---

## Funktioner

### Inbjudningar
- **9 gratis illustrerade mallar** — dinosaurier, prinsessor, rymden, pirater m.fl.
- **AI-genererade inbjudningar (Guldkalas)** — Replicate Flux Schnell / OpenAI DALL-E 3
- **4 AI-stilar** — tecknat, 3D, akvarell, fotorealistisk
- **Barnfoto på inbjudan** — upload, beskärning, dekorativa ramar (cirkel/stjärna/hjärta/diamant)
- **QR-kod** — genereras automatiskt, gästerna skannar med mobilen

### Gästhantering
- **Realtids-gästlista** — Supabase Realtime, uppdateras live
- **Manuell gästhantering** — lägg till, redigera, ta bort gäster
- **E-post och SMS-inbjudningar** — Resend + 46elks
- **OSA-redigering** — gäster kan ändra sitt svar

### Säkerhet & GDPR
- **Allergidata krypterad** — AES-256-GCM (GDPR artikel 9, hälsodata)
- **Separat samtycke** — för både förvalda allergier och fritext
- **Auto-radering** — allergidata raderas automatiskt 7 dagar efter kalaset
- **Row Level Security** — Supabase RLS på alla tabeller
- **Rate limiting** — Upstash Redis på RSVP och AI-generering

### Övriga funktioner
- **Sparade barn** — spara profil med foto, återanvänds i nya kalas
- **Profilhantering** — namn, telefon, lösenord
- **SEO** — JSON-LD, sitemap, robots.txt, Open Graph
- **Tillgänglighet** — ARIA-attribut, lang="sv", heading-hierarki

---

## Teknisk Stack

| Område | Teknologi |
|--------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Språk** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (glass-morphism) |
| **3D** | Three.js + React Three Fiber |
| **Databas** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Rate Limiting** | Upstash Redis |
| **AI-bilder** | Replicate Flux Schnell / OpenAI DALL-E 3 |
| **SMS** | 46elks API |
| **E-post** | Resend |
| **Hosting** | Vercel |
| **Tester** | Vitest + Playwright |
| **Kryptering** | AES-256-GCM (allergidata) |
| **CI/CD** | GitHub Actions |

---

## Snabbstart

### Förutsättningar

- **Node.js 18+** och pnpm
- **Supabase-projekt** (EU-region)
- API-nycklar: Replicate, OpenAI, Resend, 46elks, Upstash

### Installation

```bash
# Klona repot
git clone https://github.com/klasolsson81/kalaskoll.git
cd kalaskoll

# Installera beroenden
pnpm install

# Kopiera och fyll i environment-variabler
cp .env.example .env.local

# Starta dev-server
pnpm dev
```

Öppna [http://localhost:3000](http://localhost:3000).

---

## Kommandon

```bash
pnpm dev              # Utvecklingsserver
pnpm build            # Produktionsbygge
pnpm lint             # ESLint
pnpm test             # Unit + integration (Vitest)
pnpm test:e2e         # E2E (Playwright)
pnpm test:coverage    # Coverage-rapport
```

---

## Projektstruktur

```
src/
├── app/
│   ├── (auth)/              # Login, register, check-email, confirmed
│   ├── (dashboard)/         # Dashboard, kalas CRUD, gästlista, profil
│   ├── api/                 # RSVP, invitation, auth, children
│   └── r/[token]/           # Publik RSVP-sida + redigera svar
├── components/
│   ├── templates/           # TemplateCard, TemplatePicker, theme-configs
│   ├── cards/               # AiInvitationCard, InvitationCard, PartyHeader
│   ├── forms/               # RsvpForm, PartyForm, AllergyCheckboxes
│   ├── layout/              # Header, Footer, FooterModal, Sidebar
│   └── shared/              # PhotoFrame, PhotoCropDialog, QRCode
├── lib/
│   ├── supabase/            # Client, server, admin, middleware
│   ├── ai/                  # Replicate + OpenAI + promptbyggare
│   ├── sms/                 # 46elks
│   ├── email/               # Resend
│   └── utils/               # Validation, format, crypto, audit, storage
tests/
├── unit/                    # 133 tester (9 filer)
└── e2e/                     # 41 tester (5 spec-filer)
```

---

## Testning

### Testsvit

```
Unit (Vitest):    133 tester i 9 testfiler
E2E (Playwright):  41 tester i 5 spec-filer
```

| Testfil | Tester | Täckningsområde |
|---------|--------|-----------------|
| format.test.ts | 25 | Datum, telefon, formatering |
| validation.test.ts | 10 | Zod-schemas |
| rsvp-validation.test.ts | 28 | RSVP input-validering |
| party-validation.test.ts | 24 | Kalasformulär-validering |
| sms-validation.test.ts | 13 | Telefonnummer, SMS-regler |
| crypto.test.ts | 7 | AES-256-GCM kryptering |
| guest-validation.test.ts | 16 | Gästformulär-validering |
| child-validation.test.ts | 6 | Barnformulär-validering |
| sms-message.test.ts | 4 | SMS-meddelandebyggare |

### E2E-tester (Playwright)

| Spec-fil | Tester | Täckningsområde |
|----------|--------|-----------------|
| landing.spec.ts | 8 | Landing page, CTA, navigation |
| footer.spec.ts | 8 | Footer-modaler, brand link |
| auth.spec.ts | 7 | Login, register, verifiering |
| rsvp.spec.ts | 9 | RSVP-flöde, allergi-samtycke, mobil |
| navigation.spec.ts | 9 | Skyddade routes, SEO, tillgänglighet |

---

## Deployment

Projektet är konfigurerat för automatisk deployment via Vercel:

1. Push till `main` → Vercel deployer automatiskt
2. Environment variables sätts i Vercel Dashboard
3. Custom domain: **kalaskoll.se** med SSL

### Deployment-checklista

- Alla tester passerar (`pnpm test`)
- Bygget lyckas (`pnpm build`)
- Lint är rent (`pnpm lint`)
- Environment variables satta i Vercel
- CHANGELOG uppdaterad

---

## Säkerhet

| Åtgärd | Implementation |
|--------|---------------|
| **Input-validering** | Zod-schemas på alla API-routes |
| **XSS-skydd** | DOMPurify-sanitering |
| **Allergi-kryptering** | AES-256-GCM (ALLERGY_ENCRYPTION_KEY) |
| **Rate limiting** | Upstash Redis (RSVP: 10/min, AI: 10/h) |
| **RLS** | Supabase Row Level Security på alla tabeller |
| **Auth** | Supabase Auth med e-postverifiering |
| **Secrets** | Enbart i environment variables, aldrig i kod |
| **Auto-radering** | Allergidata raderas 7 dagar efter kalas |

---

## Dokumentation

| Fil | Innehåll |
|-----|----------|
| [CLAUDE.md](./CLAUDE.md) | Projektinstruktion för Claude Code |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Alla ändringar |
| [docs/API.md](./docs/API.md) | API-dokumentation |
| [docs/DATABASE.md](./docs/DATABASE.md) | Databasschema och RLS |

---

## Licens

Detta projekt är licensierat under **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Du får fritt studera och köra koden, men all modifierad eller härledd version som görs tillgänglig som nätverkstjänst måste publiceras under samma licens med fullständig källkod. Kommersiell användning utan att öppna källkoden är inte tillåten.

Se [LICENSE](./LICENSE) för fullständiga villkor.

---

## Kontakt

**Klas Olsson** — .NET/Fullstack-utvecklare

- Portfolio: [klasolsson.se](https://klasolsson.se)
- GitHub: [@klasolsson81](https://github.com/klasolsson81)
- LinkedIn: [linkedin.com/in/klasolsson81](https://www.linkedin.com/in/klasolsson81/)

---

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>
