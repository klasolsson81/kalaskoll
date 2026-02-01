# KalasKoll – Smarta barnkalas-inbjudningar med QR-kod

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-kalaskoll.se-10B981?style=for-the-badge&logo=vercel)](https://kalaskoll.se)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-133%20unit%20%2B%2041%20E2E-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![GDPR](https://img.shields.io/badge/GDPR-AES--256--GCM-blue?style=for-the-badge&logo=shieldsdotio)](https://gdpr.eu/)

**Digitala barnkalas-inbjudningar med AI-genererade kort, QR-kod-OSA och GDPR-sakrad allergihantering.**

[Live Demo](https://kalaskoll.se) | [Dokumentation](./CLAUDE.md) | [Changelog](./docs/CHANGELOG.md)

</div>

---

## Om Projektet

KalasKoll forenklar kalasplanering for svenska foraldrar. Istallet for papperslappar, SMS-grupper och WhatsApp-meddelanden skapar du en digital inbjudan med QR-kod — gasterna skannar och svarar direkt fran mobilen.

Projektet ar byggt av **Klas Olsson** som forberedelse for sin son Alexanders 7-arskalas (20 forskolebarn, Leo's Lekland).

### Hur det fungerar

```
1. Skapa konto och logga in
2. Skapa kalas — valj gratis mall eller AI-genererad inbjudan
3. Skriv ut inbjudan med QR-kod, lagg i facket pa forskolan
4. Gasterna skannar QR → svarar ja/nej + allergiinfo via mobilen
5. Du ser alla svar i realtid pa din dashboard
```

---

## Funktioner

### Inbjudningar
- **9 gratis illustrerade mallar** — dinosaurier, prinsessor, rymden, pirater m.fl.
- **AI-genererade inbjudningar (Guldkalas)** — Replicate Flux Schnell / OpenAI DALL-E 3
- **4 AI-stilar** — tecknat, 3D, akvarell, fotorealistisk
- **Barnfoto pa inbjudan** — upload, beskaring, dekorativa ramar (cirkel/stjarna/hjarta/diamant)
- **QR-kod** — genereras automatiskt, gasterna skannar med mobilen

### Gasthantering
- **Realtids-gastlista** — Supabase Realtime, uppdateras live
- **Manuell gasthantering** — lagg till, redigera, ta bort gaster
- **E-post och SMS-inbjudningar** — Resend + 46elks
- **OSA-redigering** — gaster kan andra sitt svar

### Sakerhet & GDPR
- **Allergidata krypterad** — AES-256-GCM (GDPR artikel 9, halsodata)
- **Separat samtycke** — for bade forvalda allergier och fritext
- **Auto-radering** — allergidata raderas automatiskt 7 dagar efter kalaset
- **Row Level Security** — Supabase RLS pa alla tabeller
- **Rate limiting** — Upstash Redis pa RSVP och AI-generering

### Ovriga funktioner
- **Sparade barn** — spara profil med foto, ateranvands i nya kalas
- **Profilhantering** — namn, telefon, losenord
- **SEO** — JSON-LD, sitemap, robots.txt, Open Graph
- **Tillganglighet** — ARIA-attribut, lang="sv", heading-hierarki

---

## Teknisk Stack

| Omrade | Teknologi |
|--------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Sprak** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
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

### Forutsattningar

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

Oppna [http://localhost:3000](http://localhost:3000).

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
│   ├── (dashboard)/         # Dashboard, kalas CRUD, gastlista, profil
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
Unit (Vitest):   133 tester across 9 testfiler
E2E (Playwright): 41 tester across 5 spec-filer
```

| Testfil | Tester | Tackningsomrade |
|---------|--------|-----------------|
| format.test.ts | 25 | Datum, telefon, formatering |
| validation.test.ts | 10 | Zod-schemas |
| rsvp-validation.test.ts | 28 | RSVP input-validering |
| party-validation.test.ts | 24 | Kalasformular-validering |
| sms-validation.test.ts | 13 | Telefonnummer, SMS-regler |
| crypto.test.ts | 7 | AES-256-GCM kryptering |
| guest-validation.test.ts | 16 | Gastformular-validering |
| child-validation.test.ts | 6 | Barnformular-validering |
| sms-message.test.ts | 4 | SMS-meddelandebyggare |

### E2E-tester (Playwright)

| Spec-fil | Tester | Tackningsomrade |
|----------|--------|-----------------|
| landing.spec.ts | 8 | Landing page, CTA, navigation |
| footer.spec.ts | 8 | Footer-modaler, brand link |
| auth.spec.ts | 7 | Login, register, verifiering |
| rsvp.spec.ts | 9 | RSVP-flode, allergi-samtycke, mobil |
| navigation.spec.ts | 9 | Skyddade routes, SEO, tillganglighet |

---

## Deployment

Projektet ar konfigurerat for automatisk deployment via Vercel:

1. Push till `main` → Vercel deployer automatiskt
2. Environment variables satts i Vercel Dashboard
3. Custom domain: **kalaskoll.se** med SSL

### Deployment-checklista

- Alla tester passar (`pnpm test`)
- Bygget lyckas (`pnpm build`)
- Lint ar rent (`pnpm lint`)
- Environment variables satta i Vercel
- CHANGELOG uppdaterad

---

## Sakerhet

| Atgard | Implementation |
|--------|---------------|
| **Input-validering** | Zod-schemas pa alla API-routes |
| **XSS-skydd** | DOMPurify-sanitering |
| **Allergi-kryptering** | AES-256-GCM (ALLERGY_ENCRYPTION_KEY) |
| **Rate limiting** | Upstash Redis (RSVP: 10/min, AI: 10/h) |
| **RLS** | Supabase Row Level Security pa alla tabeller |
| **Auth** | Supabase Auth med e-postverifiering |
| **Secrets** | Enbart i environment variables, aldrig i kod |
| **Auto-radering** | Allergidata raderas 7 dagar efter kalas |

---

## Dokumentation

| Fil | Innehall |
|-----|----------|
| [CLAUDE.md](./CLAUDE.md) | Projektinstruktion for Claude Code |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Alla andringar |
| [docs/API.md](./docs/API.md) | API-dokumentation |
| [docs/DATABASE.md](./docs/DATABASE.md) | Databasschema och RLS |

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
