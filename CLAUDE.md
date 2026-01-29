# CLAUDE.md – KalasFix

> **Instruktionsfil för Claude Code**
> Senast uppdaterad: 2026-01-29

---

## 📋 Projektöversikt

**KalasFix** är en svensk webapp för att hantera barnkalas-inbjudningar med AI-genererade inbjudningskort, QR-kod-baserad OSA-hantering och allergiinformation.

### Vision
Förenkla kalasplanering för svenska föräldrar genom att eliminera kaos med pappersinbjudningar, SMS och WhatsApp-meddelanden.

### MVP-deadline
**27 mars 2026** – Klas sons kalas på Leo's Lekland

### Kärnflöde
```
1. Förälder skapar konto → "Kolla din e-post"-sida
2. Klickar verifieringslänk → /auth/callback → /confirmed
3. Loggar in → Dashboard
4. Skapar nytt kalas med AI-genererad inbjudan
5. Skriver ut inbjudan med QR-kod
6. Gäster scannar QR → Mobil OSA-sida
7. Gäster svarar ja/nej + allergiinfo
8. Förälder ser alla svar i realtid
```

---

## 🛠 Tech Stack

| Område | Teknologi | Version |
|--------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Språk | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI-komponenter | shadcn/ui | latest |
| Databas | Supabase (PostgreSQL) | – |
| Auth | Supabase Auth | – |
| QR-koder | qrcode.react | latest |
| AI-bilder | Ideogram API / OpenAI | – |
| Hosting | Vercel | – |
| Testing | Vitest + Playwright | – |

---

## 📁 Projektstruktur

```
kalasfix/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
├── docs/
│   ├── CHANGELOG.md               # Alla ändringar per version
│   ├── API.md                     # API-dokumentation
│   ├── DATABASE.md                # Databasschema och RLS
│   └── DEPLOYMENT.md              # Deploy-instruktioner
├── public/
│   ├── og-image.png               # Open Graph bild
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── check-email/page.tsx   # Visas efter registrering
│   │   │   ├── confirmed/page.tsx     # Visas efter e-postverifiering
│   │   │   └── layout.tsx
│   │   ├── auth/
│   │   │   └── callback/route.ts      # Hanterar e-postverifieringslänk
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── kalas/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   ├── [id]/guests/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── DeleteAccountButton.tsx # Tillfällig – för testning
│   │   │   └── layout.tsx
│   │   ├── r/[token]/page.tsx     # Publik RSVP-sida
│   │   ├── api/
│   │   │   ├── rsvp/route.ts
│   │   │   ├── invitation/
│   │   │   │   └── generate/route.ts
│   │   │   └── webhooks/
│   │   │       └── supabase/route.ts
│   │   ├── layout.tsx             # Root layout med metadata
│   │   ├── page.tsx               # Landing page
│   │   ├── sitemap.ts             # Dynamisk sitemap
│   │   └── robots.ts              # robots.txt
│   ├── components/
│   │   ├── ui/                    # shadcn/ui komponenter
│   │   ├── forms/
│   │   │   ├── RsvpForm.tsx
│   │   │   ├── PartyForm.tsx
│   │   │   └── AllergyCheckboxes.tsx
│   │   ├── cards/
│   │   │   ├── InvitationCard.tsx
│   │   │   └── GuestCard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── shared/
│   │       ├── QRCode.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client
│   │   │   ├── admin.ts           # Admin client (service role)
│   │   │   ├── middleware.ts      # Auth middleware
│   │   │   └── types.ts           # Generated types
│   │   ├── ai/
│   │   │   ├── ideogram.ts        # Ideogram API wrapper
│   │   │   └── openai.ts          # OpenAI fallback
│   │   ├── utils/
│   │   │   ├── format.ts          # Datum, telefon etc
│   │   │   ├── validation.ts      # Zod schemas
│   │   │   └── seo.ts             # SEO helpers
│   │   └── constants.ts           # App-wide constants
│   ├── hooks/
│   │   ├── useParty.ts
│   │   ├── useGuests.ts
│   │   └── useRealtime.ts
│   ├── types/
│   │   ├── database.ts            # Supabase generated
│   │   ├── api.ts                 # API request/response
│   │   └── index.ts               # Shared types
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/                # SQL migrations
│   ├── seed.sql                   # Test data
│   └── config.toml
├── tests/
│   ├── unit/                      # Vitest unit tests
│   ├── integration/               # API tests
│   └── e2e/                       # Playwright E2E
├── .env.example                   # Env template (INGEN SECRETS!)
├── .env.local                     # Lokal utveckling (gitignored)
├── .gitignore
├── CLAUDE.md                      # Denna fil
├── README.md                      # Publik readme
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## ⚙️ Utvecklingsprinciper

### Clean Code & Arkitektur

```typescript
// ✅ RÄTT: Single Responsibility Principle (SRP)
// Varje funktion/komponent gör EN sak

// lib/utils/format.ts
export function formatPhoneNumber(phone: string): string { /* ... */ }
export function formatDate(date: Date, locale = 'sv-SE'): string { /* ... */ }

// ✅ RÄTT: DRY - Don't Repeat Yourself
// Extrahera gemensam logik till återanvändbara funktioner/hooks

// hooks/useParty.ts
export function useParty(partyId: string) {
  // All party-relaterad logik på ett ställe
}

// ❌ FEL: Duplicerad kod i flera komponenter
```

### Kodstandard

| Regel | Beskrivning |
|-------|-------------|
| **Namngivning** | camelCase för variabler/funktioner, PascalCase för komponenter/typer |
| **Funktioner** | Max 20-30 rader, tydligt namn som beskriver vad den gör |
| **Komponenter** | Max 150 rader, bryt ut till subkomponenter vid behov |
| **Typer** | Alltid explicit TypeScript-typer, undvik `any` |
| **Kommentarer** | Kod ska vara självdokumenterande, kommentera endast "varför" |
| **Felhantering** | Alltid try/catch för async, meningsfulla felmeddelanden |

### Säkerhet

```typescript
// ✅ ALLTID: Validera all input med Zod
import { z } from 'zod';

const RsvpSchema = z.object({
  childName: z.string().min(1).max(100),
  attending: z.boolean(),
  parentPhone: z.string().regex(/^(\+46|0)[0-9]{6,12}$/),
  allergies: z.array(z.string()).optional(),
});

// ✅ ALLTID: Sanitera output
import DOMPurify from 'isomorphic-dompurify';
const safeHtml = DOMPurify.sanitize(userInput);

// ✅ ALLTID: Rate limiting på API-routes
// Implementera via Vercel Edge Middleware eller upstash/ratelimit

// ❌ ALDRIG: Exponera känslig data i client-side kod
// ❌ ALDRIG: SQL-queries utan parametrisering (Supabase hanterar detta)
// ❌ ALDRIG: Lagra secrets i kod eller .env.example
```

### GDPR-krav (KRITISKT)

```typescript
// Allergidata = hälsodata = särskild kategori under GDPR artikel 9

// ✅ KRAV 1: Separat samtycke för allergidata
const AllergyConsent = () => (
  <Checkbox 
    id="allergy-consent"
    required
    label="Jag samtycker till att allergiinformation lagras..."
  />
);

// ✅ KRAV 2: Auto-radera allergidata efter kalas
// Supabase scheduled function: party_date + 7 dagar

// ✅ KRAV 3: Kryptera hälsodata
// Använd Supabase Vault eller pgcrypto

// ✅ KRAV 4: RLS - endast partyOwner kan se allergidata
```

---

## 🗄 Databasschema

### Tabeller

```sql
-- profiles (utökar Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- parties (kalas)
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL CHECK (child_age > 0 AND child_age < 20),
  party_date DATE NOT NULL,
  party_time TIME NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  description TEXT,
  theme TEXT,                          -- dinosaurier, prinsessor, etc
  invitation_image_url TEXT,           -- AI-genererad bild
  rsvp_deadline DATE,
  max_guests INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- invitations (unika QR-koder)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(8) UNIQUE NOT NULL,    -- kort token för QR-URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- rsvp_responses (OSA-svar)
CREATE TABLE rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  attending BOOLEAN NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  message TEXT,                        -- "Vi kommer gärna!"
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invitation_id)                -- ett svar per inbjudan
);

-- allergy_data (SEPARAT för GDPR - hälsodata)
CREATE TABLE allergy_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID REFERENCES rsvp_responses(id) ON DELETE CASCADE NOT NULL,
  allergies JSONB,                     -- ['laktos', 'gluten', 'nötter']
  other_dietary TEXT,                  -- fritext
  consent_given_at TIMESTAMPTZ NOT NULL,
  auto_delete_at TIMESTAMPTZ NOT NULL, -- party_date + 7 days
  UNIQUE(rsvp_id)
);

-- Indexes
CREATE INDEX idx_parties_owner ON parties(owner_id);
CREATE INDEX idx_invitations_party ON invitations(party_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_rsvp_invitation ON rsvp_responses(invitation_id);
CREATE INDEX idx_allergy_delete ON allergy_data(auto_delete_at);
```

### Row Level Security (RLS)

```sql
-- Aktivera RLS på alla tabeller
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergy_data ENABLE ROW LEVEL SECURITY;

-- profiles: användare ser bara sin egen
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- parties: ägare har full access
CREATE POLICY "Owners can CRUD own parties"
  ON parties FOR ALL
  USING (auth.uid() = owner_id);

-- invitations: ägare kan hantera, alla kan läsa via token
CREATE POLICY "Owners can manage invitations"
  ON invitations FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM parties WHERE id = party_id));

CREATE POLICY "Anyone can read invitation by token"
  ON invitations FOR SELECT
  USING (true);  -- Token valideras i applikationen

-- rsvp_responses: ägare kan läsa, gäster kan skriva
CREATE POLICY "Owners can read responses"
  ON rsvp_responses FOR SELECT
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    WHERE i.id = invitation_id
  ));

CREATE POLICY "Anyone can insert response"
  ON rsvp_responses FOR INSERT
  WITH CHECK (true);  -- Rate limit i API

CREATE POLICY "Token holder can update own response"
  ON rsvp_responses FOR UPDATE
  USING (true);  -- Token valideras i applikationen

-- allergy_data: ENDAST ägare kan läsa (hälsodata!)
CREATE POLICY "Only owners can read allergy data"
  ON allergy_data FOR SELECT
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    JOIN rsvp_responses r ON r.invitation_id = i.id
    WHERE r.id = rsvp_id
  ));

CREATE POLICY "Anyone can insert allergy data with consent"
  ON allergy_data FOR INSERT
  WITH CHECK (consent_given_at IS NOT NULL);
```

### Scheduled Cleanup (Supabase Edge Function)

```typescript
// supabase/functions/cleanup-allergy-data/index.ts
// Körs dagligen via cron

import { createClient } from '@supabase/supabase-js';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { error } = await supabase
    .from('allergy_data')
    .delete()
    .lt('auto_delete_at', new Date().toISOString());

  if (error) {
    console.error('Cleanup failed:', error);
    return new Response('Error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
```

---

## 🧪 Teststrategi

### Testpyramid

```
        /\
       /  \     E2E (Playwright) - 10%
      /----\    Kritiska flöden: registrering, skapa kalas, RSVP
     /      \
    /--------\  Integration (Vitest) - 30%
   /          \ API-routes, Supabase queries, hooks
  /------------\
 /              \ Unit (Vitest) - 60%
/________________\ Utils, validation, formatering, komponenter
```

### Namnkonvention

```
tests/
├── unit/
│   ├── utils/
│   │   └── format.test.ts        # describe('formatPhoneNumber', ...)
│   └── components/
│       └── QRCode.test.tsx       # describe('QRCode', ...)
├── integration/
│   └── api/
│       └── rsvp.test.ts          # describe('POST /api/rsvp', ...)
└── e2e/
    └── rsvp-flow.spec.ts         # test('guest can RSVP via QR code', ...)
```

### Testkommandon

```bash
# Unit & Integration
pnpm test              # Kör alla tester
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage rapport

# E2E
pnpm test:e2e          # Headless
pnpm test:e2e:ui       # Med Playwright UI
```

### Minimum Coverage

| Område | Krav |
|--------|------|
| Utils/Lib | 80% |
| API Routes | 70% |
| Komponenter | 60% |
| Total | 70% |

---

## 🔍 SEO & AIO (AI Optimization)

### Metadata (app/layout.tsx)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://kalasfix.se'),
  title: {
    default: 'KalasFix – Smarta inbjudningar för barnkalas',
    template: '%s | KalasFix',
  },
  description: 'Skapa snygga inbjudningskort med AI, hantera OSA och allergier digitalt. Perfekt för barnkalas!',
  keywords: ['barnkalas', 'inbjudningar', 'kalas', 'OSA', 'födelsedagskalas', 'allergi'],
  authors: [{ name: 'KalasFix' }],
  creator: 'KalasFix',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://kalasfix.se',
    siteName: 'KalasFix',
    title: 'KalasFix – Smarta inbjudningar för barnkalas',
    description: 'Skapa snygga inbjudningskort med AI, hantera OSA och allergier digitalt.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KalasFix – Smarta inbjudningar för barnkalas',
    description: 'Skapa snygga inbjudningskort med AI, hantera OSA och allergier digitalt.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### Structured Data (JSON-LD)

```typescript
// app/page.tsx (Landing page)
export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KalasFix',
    description: 'Skapa inbjudningar för barnkalas med AI-genererade kort och digital OSA-hantering',
    url: 'https://kalasfix.se',
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### AIO-principer (AI Optimization)

```typescript
// Gör innehållet lätt för AI-modeller att förstå och citera

// ✅ Tydliga, beskrivande headings
<h1>Skapa inbjudningar för barnkalas</h1>
<h2>Så här fungerar KalasFix</h2>

// ✅ Strukturerad FAQ med schema
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Kostar det något att använda KalasFix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Grundfunktionerna är helt gratis. Premium-funktioner som AI-genererade inbjudningar kostar 49 kr per kalas.',
      },
    },
    // ...fler frågor
  ],
};

// ✅ Semantisk HTML
<article>
  <header>
    <h1>Guide: Planera barnkalas utan stress</h1>
    <time dateTime="2026-01-29">29 januari 2026</time>
  </header>
  <main>...</main>
</article>
```

### Sitemap & Robots

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kalasfix.se', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://kalasfix.se/om-oss', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kalasfix.se/priser', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kalasfix.se/kontakt', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}

// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard/', '/r/'] },
    ],
    sitemap: 'https://kalasfix.se/sitemap.xml',
  };
}
```

---

## 📦 Git Workflow

### Branch-strategi

```
main              # Produktion (auto-deploy till Vercel)
  └── develop     # Integration branch
       ├── feature/auth-setup
       ├── feature/party-crud
       ├── feature/rsvp-flow
       └── fix/qr-code-size
```

### Commit-konvention

```bash
# Format: <type>(<scope>): <subject>

# Types
feat:     Ny funktionalitet
fix:      Buggfix
docs:     Dokumentation
style:    Formatering (ingen kodändring)
refactor: Omstrukturering
test:     Tester
chore:    Build, config, dependencies

# Exempel
feat(rsvp): add allergy checkboxes with GDPR consent
fix(qr): increase minimum size for better scanning
docs(api): document rate limiting on RSVP endpoint
test(rsvp): add integration tests for POST /api/rsvp
```

### Pre-commit Checklista

```markdown
## Innan varje commit, verifiera:
- [ ] Kod kompilerar utan errors: `pnpm build`
- [ ] Linting passerar: `pnpm lint`
- [ ] Tester passerar: `pnpm test`
- [ ] Dokumentation uppdaterad (om relevant)
- [ ] CHANGELOG.md uppdaterad (för features/fixes)
- [ ] Inga secrets i koden
- [ ] TypeScript-typer är korrekta (ingen `any`)
```

### Push-rutin

```bash
# 1. Kör quality checks
pnpm lint && pnpm test && pnpm build

# 2. Uppdatera docs om relevant
# - docs/CHANGELOG.md
# - docs/API.md (om API ändrats)
# - README.md (om setup ändrats)

# 3. Commit med konventionellt meddelande
git add .
git commit -m "feat(party): add theme selection for invitations"

# 4. Push till remote
git push origin feature/party-themes

# 5. Skapa PR till develop (om feature branch)
```

---

## 🔐 Environment Variables

### .env.example (COMMITAS)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
IDEOGRAM_API_KEY=your-ideogram-key
OPENAI_API_KEY=your-openai-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=KalasFix

# 🎭 Mock Mode (sätt till 'false' för riktiga AI-anrop)
NEXT_PUBLIC_MOCK_AI=true

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### Vercel Environment Variables

| Variable | Environment | Beskrivning |
|----------|-------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Server-side Supabase access |
| `IDEOGRAM_API_KEY` | Production, Preview | AI-bildgenerering |
| `OPENAI_API_KEY` | Production, Preview | Fallback AI |

> ⚠️ **ALDRIG** commita `.env.local` eller faktiska secrets!

---

## 🚀 Implementation Plan (MVP)

### Fas 1: Projektsetup (Dag 1)
```markdown
- [ ] 1.1 Skapa Next.js projekt med TypeScript
- [ ] 1.2 Konfigurera Tailwind CSS + shadcn/ui
- [ ] 1.3 Sätt upp Supabase projekt (EU region!)
- [ ] 1.4 Konfigurera GitHub repo + Vercel
- [ ] 1.5 Skapa grundläggande mappstruktur
- [ ] 1.6 Lägg till ESLint + Prettier config
- [ ] 1.7 Sätt upp Vitest + Playwright
- [ ] 1.8 Commita: "chore: initial project setup"
```

### Fas 2: Auth & Profiler (Dag 2)
```markdown
- [ ] 2.1 Implementera Supabase Auth (email/password)
- [ ] 2.2 Skapa login/register sidor
- [ ] 2.3 Skapa profiles tabell + RLS
- [ ] 2.4 Implementera auth middleware
- [ ] 2.5 Skapa protected dashboard layout
- [ ] 2.6 Testa auth-flöde
- [ ] 2.7 Commita: "feat(auth): implement Supabase authentication"
```

### Fas 3: Kalas CRUD (Dag 3-4)
```markdown
- [ ] 3.1 Skapa parties + invitations tabeller
- [ ] 3.2 Implementera RLS policies
- [ ] 3.3 Skapa PartyForm komponent
- [ ] 3.4 Implementera skapa kalas
- [ ] 3.5 Implementera visa kalas
- [ ] 3.6 Implementera redigera kalas
- [ ] 3.7 Implementera ta bort kalas
- [ ] 3.8 Skapa gästlista-vy
- [ ] 3.9 Testa CRUD-operationer
- [ ] 3.10 Commita: "feat(party): implement party CRUD operations"
```

### Fas 4: QR & RSVP (Dag 5-6)
```markdown
- [ ] 4.1 Skapa rsvp_responses + allergy_data tabeller
- [ ] 4.2 Implementera QRCode komponent
- [ ] 4.3 Skapa publik RSVP-sida (r/[token])
- [ ] 4.4 Implementera RsvpForm med validering
- [ ] 4.5 Implementera AllergyCheckboxes med samtycke
- [ ] 4.6 Skapa POST /api/rsvp endpoint
- [ ] 4.7 Implementera rate limiting
- [ ] 4.8 Testa RSVP-flöde E2E
- [ ] 4.9 Commita: "feat(rsvp): implement QR code RSVP flow"
```

### Fas 5: Realtid & Dashboard (Dag 7)
```markdown
- [ ] 5.1 Implementera Supabase Realtime subscriptions
- [ ] 5.2 Skapa useGuests hook med realtime
- [ ] 5.3 Uppdatera dashboard med live-data
- [ ] 5.4 Visa allergiinfo för party owner
- [ ] 5.5 Implementera gäststatus-räknare
- [ ] 5.6 Testa realtime-uppdateringar
- [ ] 5.7 Commita: "feat(realtime): add live guest updates"
```

### Fas 6: AI-inbjudningar med MOCK (Dag 8-9)
```markdown
- [ ] 6.1 Skapa mock-bilder i /public/mock/
- [ ] 6.2 Implementera generateInvitationImage med MOCK_MODE
- [ ] 6.3 Skapa tema-väljare komponent
- [ ] 6.4 Implementera InvitationCard med QR-overlay (använder mock)
- [ ] 6.5 Implementera PDF-export för utskrift
- [ ] 6.6 Lägg till DevBadge för visuell mock-indikator
- [ ] 6.7 Testa hela flödet med placeholder-bilder
- [ ] 6.8 Commita: "feat(ai): add invitation generator with mock support"
```

### Fas 7: Landing & SEO (Dag 10)
```markdown
- [ ] 7.1 Skapa landing page
- [ ] 7.2 Implementera all metadata
- [ ] 7.3 Lägg till JSON-LD structured data
- [ ] 7.4 Skapa sitemap.ts + robots.ts
- [ ] 7.5 Optimera Core Web Vitals
- [ ] 7.6 Skapa OG-bild
- [ ] 7.7 Commita: "feat(seo): add landing page and SEO optimization"
```

### Fas 8: Polish & Launch (Dag 11-12)
```markdown
- [ ] 8.1 Fixa alla TODO:s
- [ ] 8.2 Kör full testsvit
- [ ] 8.3 Lighthouse audit (mål: 90+ alla kategorier)
- [ ] 8.4 Säkerhetsgranskning
- [ ] 8.5 Uppdatera all dokumentation
- [ ] 8.6 🎭→🚀 BYT TILL RIKTIGA AI-ANROP:
      - [ ] Sätt NEXT_PUBLIC_MOCK_AI=false i Vercel
      - [ ] Testa Ideogram API med 3-5 riktiga genereringar
      - [ ] Verifiera bildkvalitet och text-rendering
      - [ ] Testa fallback till OpenAI om Ideogram misslyckas
- [ ] 8.7 Merge till main
- [ ] 8.8 Verifiera produktionsdeploy
- [ ] 8.9 Commita: "chore: prepare v1.0.0 release"
```

---

## 🔧 Utvecklingskommandon

```bash
# Installation
pnpm install

# Utveckling
pnpm dev                    # Starta dev server (localhost:3000)
pnpm build                  # Bygg för produktion
pnpm start                  # Kör produktionsbygge lokalt

# Kodkvalitet
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint med autofix
pnpm format                 # Prettier
pnpm typecheck              # TypeScript typkontroll

# Tester
pnpm test                   # Unit & integration
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage rapport
pnpm test:e2e               # Playwright E2E

# Databas
pnpm db:generate            # Generera Supabase types
pnpm db:migrate             # Kör migrations
pnpm db:seed                # Seed testdata
pnpm db:reset               # Reset databas

# Övrigt
pnpm analyze                # Bundle analyzer
```

---

## 📝 Dokumentationsrutin

### Uppdatera vid varje PR

| Fil | När |
|-----|-----|
| `docs/CHANGELOG.md` | Alltid för feat/fix |
| `docs/API.md` | Vid API-ändringar |
| `docs/DATABASE.md` | Vid schemaändringar |
| `README.md` | Vid setup-ändringar |
| `CLAUDE.md` | Vid processändringar |

### CHANGELOG-format

```markdown
## [Unreleased]

### Added
- Ny funktion X (#123)

### Changed
- Ändrade Y för bättre Z (#124)

### Fixed
- Fixade bugg i Q (#125)

## [1.0.0] - 2026-03-01

### Added
- Initial release med kärnfunktionalitet
```

---

## 🚨 Viktiga påminnelser för Claude Code

1. **ALLTID** kör `pnpm lint && pnpm test` innan commit
2. **ALLTID** uppdatera relevanta docs innan push
3. **ALDRIG** commita .env.local eller secrets
4. **ALLTID** använd TypeScript-typer (ingen `any`)
5. **ALLTID** validera input med Zod
6. **ALLTID** tänk på GDPR vid allergidata
7. **ALLTID** testa på mobil (99% av RSVP kommer vara mobil)
8. **ALLTID** commita med konventionella commit-meddelanden
9. **ALLTID** push till GitHub efter varje betydande milestone
10. **ALLTID** verifiera att Vercel-preview fungerar
11. **🎭 ALDRIG** anropa riktiga AI-APIer under utveckling – använd MOCK_MODE!
12. **🎭 FÖRST** när alla features är klara och UI godkänt → byt till riktiga API-anrop

---

## 🎭 Mock-First Utveckling (VIKTIGT!)

> **Princip:** Använd ALDRIG riktiga AI API-anrop under utveckling. Spara API-kostnader genom att mocka allt tills MVP är feature-complete och UI är godkänt.

### Varför Mock-First?

| Anledning | Beskrivning |
|-----------|-------------|
| 💰 **Kostnad** | Ideogram/OpenAI kostar ~0,30-1,70 kr per bild |
| ⚡ **Hastighet** | Mockar är instant, API-anrop tar 5-30 sekunder |
| 🔄 **Iteration** | Kan testa UI hundratals gånger utan kostnad |
| 🧪 **Tester** | Unit/integration-tester ska aldrig anropa externa API:er |

### Implementation

#### 1. Placeholder-bilder för inbjudningar

```typescript
// lib/ai/invitation-generator.ts

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AI === 'true';

// Placeholder-bilder (lokala eller från Unsplash)
const MOCK_IMAGES: Record<string, string> = {
  dinosaurier: '/mock/invitation-dino.jpg',
  prinsessor: '/mock/invitation-princess.jpg',
  superhjältar: '/mock/invitation-superhero.jpg',
  fotboll: '/mock/invitation-football.jpg',
  default: '/mock/invitation-default.jpg',
};

export async function generateInvitationImage(
  theme: string,
  partyDetails: PartyDetails
): Promise<string> {
  // 🎭 MOCK MODE: Returnera placeholder direkt
  if (MOCK_MODE) {
    console.log('[MOCK] Returning placeholder image for theme:', theme);
    // Simulera lite latency för realistisk UX-testning
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_IMAGES[theme] || MOCK_IMAGES.default;
  }

  // 🚀 PRODUCTION: Anropa riktig API
  return await ideogramGenerate(theme, partyDetails);
}
```

#### 2. Fast test-QR-kod

```typescript
// lib/constants.ts

// Under utveckling: använd alltid samma test-token
export const TEST_INVITATION_TOKEN = 'test1234';
export const TEST_RSVP_URL = `${process.env.NEXT_PUBLIC_APP_URL}/r/${TEST_INVITATION_TOKEN}`;

// lib/invitation/generate-token.ts
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AI === 'true';

export function generateInvitationToken(): string {
  if (MOCK_MODE) {
    // Alltid samma token under utveckling för enkla tester
    return TEST_INVITATION_TOKEN;
  }
  
  // Produktion: generera unikt token
  return crypto.randomUUID().slice(0, 8);
}
```

#### 3. Mock-bilder att använda

Lägg dessa i `/public/mock/`:

```
public/
└── mock/
    ├── invitation-default.jpg    # Generisk kalas-bild
    ├── invitation-dino.jpg       # Dinosaurie-tema
    ├── invitation-princess.jpg   # Prinsess-tema
    ├── invitation-superhero.jpg  # Superhjälte-tema
    ├── invitation-football.jpg   # Fotbolls-tema
    └── qr-placeholder.svg        # QR-kod placeholder
```

> 💡 **Tips:** Använd gratis bilder från Unsplash eller generera några testbilder en gång och återanvänd.

#### 4. Environment-flagga

```bash
# .env.local (utveckling)
NEXT_PUBLIC_MOCK_AI=true

# .env.production (eller Vercel Production)
NEXT_PUBLIC_MOCK_AI=false
```

#### 5. Visuell indikator i dev

```typescript
// components/shared/DevBadge.tsx
export function DevBadge() {
  if (process.env.NODE_ENV === 'production') return null;
  if (process.env.NEXT_PUBLIC_MOCK_AI !== 'true') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold z-50">
      🎭 MOCK MODE
    </div>
  );
}

// Lägg till i app/layout.tsx
<DevBadge />
```

### Test-flöde under utveckling

```
1. Skapa kalas → Får placeholder-bild + test-QR (test1234)
2. Öppna /r/test1234 i mobilen → Testa RSVP-flödet
3. Iterera på UI tills det är perfekt
4. Repetera för alla features

FÖRST NÄR ALLT ÄR KLART:
5. Sätt NEXT_PUBLIC_MOCK_AI=false
6. Testa AI-generering med 2-3 riktiga bilder
7. Verifiera att allt fungerar
8. Deploya till produktion
```

### Checklista innan riktiga API-anrop

```markdown
## ✅ Redo för riktiga AI-bilder?

- [ ] Alla UI-komponenter är klara och godkända
- [ ] RSVP-flödet fungerar E2E med mock
- [ ] Dashboard visar gästlista korrekt
- [ ] PDF-export fungerar med placeholder
- [ ] Alla tester passerar
- [ ] Lighthouse score 90+ (med mock-bilder)
- [ ] Kunden (Klas) har godkänt designen

Om alla är ✅ → Byt till NEXT_PUBLIC_MOCK_AI=false
```

### Kostnadsexempel

| Scenario | Antal bilder | Kostnad |
|----------|--------------|---------|
| Utveckling utan mock | ~200 iterationer | ~60-340 kr |
| Utveckling med mock | 0 | 0 kr |
| Sluttest | 5-10 bilder | ~1,50-17 kr |
| **Besparing** | | **~58-323 kr** |

---

## 🔗 Länkar

- **GitHub**: https://github.com/klasolsson81/kalasfix
- **Vercel**: (sätts upp efter första deploy)
- **Supabase**: (sätts upp i Fas 1)
- **Ideogram API**: https://ideogram.ai/api
- **shadcn/ui**: https://ui.shadcn.com

---

*Denna fil är källan till sanning för KalasFix-projektet. Håll den uppdaterad!*
