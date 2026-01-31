# KalasKoll

Svensk webapp for att hantera barnkalas-inbjudningar med illustrerade inbjudningskort, QR-kod-baserad OSA-hantering och allergiinformation.

## Funktioner

- **Illustrerade inbjudningsmallar** — 9 teman (dinosaurier, prinsessor, rymden m.fl.) med AI-genererade bakgrundsbilder och CSS-textoverlay
- **AI-genererade inbjudningar** — Ideogram/OpenAI-genererade bilder som alternativ till mallar
- **QR-kod OSA** — Skriv ut inbjudan med QR-kod, gasterna skannar och svarar via mobilen
- **Realtids-gastlista** — Se svar live via Supabase Realtime
- **Manuell gasthantering** — Lagg till, redigera och ta bort gaster direkt pa gastlistan
- **Allergihantering** — GDPR-kompatibel lagring med samtycke och auto-radering
- **E-post och SMS** — Skicka inbjudningar via Resend (e-post) eller 46elks (SMS)
- **Sparade barn** — Spara barn pa profilen for snabbt kalasskapande

## Tech Stack

| Omrade | Teknologi |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Sprak | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui |
| Databas | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI-bilder | Ideogram API / OpenAI |
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
    (dashboard)/     # Dashboard, kalas CRUD, gastlista
    api/             # RSVP, invitation generate/send, auth
    r/[token]/       # Publik RSVP-sida (mobil)
  components/
    templates/       # TemplateCard, TemplatePicker, theme-configs
    cards/           # InvitationCard (AI-bilder)
    forms/           # RsvpForm, PartyForm, AllergyCheckboxes
  lib/
    supabase/        # Client, server, admin, middleware
    ai/              # Ideogram + OpenAI
    sms/             # 46elks
    email/           # Resend
    utils/           # Validation (Zod), format, SEO
public/
  assets/templates/  # 9 illustrerade bakgrundsbilder (PNG)
tests/
  unit/              # 122 tester (validation, format, schemas)
```

## Dokumentation

- [CLAUDE.md](./CLAUDE.md) — Fullstandig projektinstruktion for Claude Code
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) — Alla andringar
- [docs/API.md](./docs/API.md) — API-dokumentation
- [docs/DATABASE.md](./docs/DATABASE.md) — Databasschema och RLS

## Licens

Privat projekt.
