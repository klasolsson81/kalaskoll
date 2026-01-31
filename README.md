# KalasKoll

Svensk webapp for att hantera barnkalas-inbjudningar med AI-genererade inbjudningskort, QR-kod-baserad OSA-hantering och allergiinformation.

## Funktioner

- **Illustrerade inbjudningsmallar** — 9 gratis teman (dinosaurier, prinsessor, rymden m.fl.) med AI-genererade bakgrundsbilder och CSS-textoverlay
- **AI-genererade inbjudningar (Guldkalas)** — Replicate Flux Schnell / OpenAI DALL-E 3 med val av stil (tecknat, 3D, akvarell, fotorealistisk), motiv och fritext
- **Fullbleed AI-kort** — AI-bild som bakgrund med mork gradient, vit text och textskugga
- **Barnfoto pa inbjudan** — Ladda upp och beskara foto med dekorativa ramar (cirkel, stjarna, hjarta, diamant)
- **QR-kod OSA** — Skriv ut inbjudan med QR-kod, gasterna skannar och svarar via mobilen
- **Realtids-gastlista** — Se svar live via Supabase Realtime
- **Manuell gasthantering** — Lagg till, redigera och ta bort gaster direkt pa gastlistan
- **Allergihantering** — GDPR-kompatibel lagring med AES-256-GCM kryptering, samtycke och auto-radering
- **E-post och SMS** — Skicka inbjudningar via Resend (e-post) eller 46elks (SMS), med automatisk forifyld e-post/telefon i OSA-formularet
- **Sparade barn** — Spara barn pa profilen med foto, auto-kopieras till nya kalas
- **Profilhantering** — Redigera namn, telefon och losenord

## Tech Stack

| Omrade | Teknologi |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Sprak | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui |
| Databas | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI-bilder | Replicate Flux / OpenAI |
| SMS | 46elks API |
| E-post | Resend |
| Hosting | Vercel |
| Tester | Vitest + Playwright |

## Kom igang

```bash
# Installera beroenden
pnpm install

# Kopiera environment-variabler
cp .env.example .env.local
# Fyll i dina Supabase/API-nycklar i .env.local

# Starta dev-server
pnpm dev
```

Oppna [http://localhost:3000](http://localhost:3000).

## Kommandon

```bash
pnpm dev          # Utvecklingsserver
pnpm build        # Produktionsbygge
pnpm lint         # ESLint
pnpm test         # Vitest (unit + integration)
pnpm test:e2e     # Playwright E2E
```

## Projektstruktur

```
src/
  app/
    (auth)/          # Login, register, check-email, confirmed
    (dashboard)/     # Dashboard, kalas CRUD, gastlista, profil
    api/             # RSVP, invitation generate/send/select, auth, children
    r/[token]/       # Publik RSVP-sida + redigera svar
  components/
    templates/       # TemplateCard, TemplatePicker, theme-configs
    cards/           # AiInvitationCard, InvitationCard, PartyHeader
    forms/           # RsvpForm, PartyForm, AllergyCheckboxes
    shared/          # PhotoFrame, PhotoCropDialog, QRCode, DevBadge
  lib/
    supabase/        # Client, server, admin, middleware
    ai/              # Replicate Flux + OpenAI DALL-E + promptbyggare
    sms/             # 46elks
    email/           # Resend
    utils/           # Validation (Zod), format, SEO, crypto, audit, storage
public/
  assets/templates/  # 9 illustrerade bakgrundsbilder (PNG)
tests/
  unit/              # 133 tester (validation, format, crypto, SMS, schemas)
```

## Dokumentation

- [CLAUDE.md](./CLAUDE.md) — Fullstandig projektinstruktion for Claude Code
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) — Alla andringar
- [docs/API.md](./docs/API.md) — API-dokumentation
- [docs/DATABASE.md](./docs/DATABASE.md) — Databasschema och RLS

## Licens

Privat projekt.
