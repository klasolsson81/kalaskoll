# Databasschema och RLS

> Senast uppdaterad: 2026-01-31
>
> Databas: Supabase (PostgreSQL), EU-region

---

## Tabeller

### profiles

Utökar Supabase `auth.users`. Skapas automatiskt vid registrering via trigger.

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Refererar till `auth.users(id)`, CASCADE |
| `full_name` | TEXT | Ja | Användarens namn |
| `phone` | TEXT | Ja | Telefonnummer |
| `created_at` | TIMESTAMPTZ | Nej | Auto |
| `updated_at` | TIMESTAMPTZ | Nej | Auto via trigger |

**RLS:** Användare kan bara se/ändra sin egen profil.

---

### children

Sparade barn per användare (återanvänds vid kalas-skapande).

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `owner_id` | UUID (FK) | Nej | Refererar till `profiles(id)`, CASCADE |
| `name` | TEXT | Nej | Barnets namn |
| `birth_date` | DATE | Nej | Födelsedatum |
| `photo_url` | TEXT | Ja | Barnfoto (Supabase Storage URL eller base64 data-URL) |
| `photo_frame` | TEXT | Ja | Ram: `circle`, `star`, `heart`, `diamond` (default: `circle`) |
| `created_at` | TIMESTAMPTZ | Nej | Auto |
| `updated_at` | TIMESTAMPTZ | Nej | Auto |

**RLS:** Ägare har full CRUD-access.

**Index:** `idx_children_owner` på `owner_id`.

---

### parties

Kalas. Ägs av en användare.

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `owner_id` | UUID (FK) | Nej | Refererar till `profiles(id)`, CASCADE |
| `child_name` | TEXT | Nej | Barnets namn |
| `child_age` | INTEGER | Nej | Ålder (1-19) |
| `child_id` | UUID (FK) | Ja | Refererar till `children(id)`, SET NULL |
| `party_date` | DATE | Nej | Kalasdatum |
| `party_time` | TIME | Nej | Starttid |
| `party_time_end` | TIME | Ja | Sluttid |
| `venue_name` | TEXT | Nej | Platsnamn |
| `venue_address` | TEXT | Ja | Adress |
| `description` | TEXT | Ja | Beskrivning |
| `theme` | TEXT | Ja | Tema (dinosaurier, prinsessor etc) |
| `invitation_image_url` | TEXT | Ja | AI-genererad inbjudningsbild |
| `invitation_template` | TEXT | Ja | Mallnamn (t.ex. `dinosaurier`) |
| `child_photo_url` | TEXT | Ja | Barnfoto (Supabase Storage URL eller base64 data-URL) |
| `child_photo_frame` | TEXT | Ja | Ram: `circle`, `star`, `heart`, `diamond` (default: `circle`) |
| `rsvp_deadline` | DATE | Ja | Sista OSA-datum |
| `max_guests` | INTEGER | Ja | Max antal gäster |
| `created_at` | TIMESTAMPTZ | Nej | Auto |
| `updated_at` | TIMESTAMPTZ | Nej | Auto via trigger |

**RLS:** Ägare har full CRUD-access.

**Index:** `idx_parties_owner` på `owner_id`.

**Constraint:** `child_age > 0 AND child_age < 20`.

---

### invitations

QR-kodtokens. En per kalas, skapas automatiskt vid kalas-skapande.

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `party_id` | UUID (FK) | Nej | Refererar till `parties(id)`, CASCADE |
| `token` | VARCHAR(8) | Nej | Unik kort token för QR-URL |
| `created_at` | TIMESTAMPTZ | Nej | Auto |

**RLS:**
- Ägare kan hantera (ALL)
- Alla kan läsa (SELECT) — token valideras i applikationen

**Index:** `idx_invitations_party`, `idx_invitations_token`.

---

### rsvp_responses

OSA-svar. Flera svar per inbjudan (identifieras via `parent_email`).

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `invitation_id` | UUID (FK) | Nej | Refererar till `invitations(id)`, CASCADE |
| `child_name` | TEXT | Nej | Barnets namn |
| `attending` | BOOLEAN | Nej | Kommer/kommer inte |
| `parent_name` | TEXT | Ja | Förälders namn |
| `parent_phone` | TEXT | Ja | Telefonnummer |
| `parent_email` | TEXT | Nej | E-post (identifierare) |
| `message` | TEXT | Ja | Meddelande |
| `edit_token` | VARCHAR(64) | Nej | Kryptografisk token för redigering (UNIQUE) |
| `responded_at` | TIMESTAMPTZ | Nej | Auto |
| `updated_at` | TIMESTAMPTZ | Nej | Auto via trigger |

**RLS:**
- Ägare kan läsa (SELECT)
- Alla kan infoga (INSERT) — rate limit i API
- Alla kan uppdatera (UPDATE) — token valideras i applikationen

**Constraints:** `UNIQUE(invitation_id, parent_email)`.

**Index:** `idx_rsvp_invitation`, `idx_rsvp_edit_token`, `idx_rsvp_email_lower`.

---

### allergy_data

GDPR-skyddad hälsodata. Separat tabell med auto-radering.

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `rsvp_id` | UUID (FK) | Nej | Refererar till `rsvp_responses(id)`, CASCADE |
| `allergies` | JSONB | Ja | `["laktos", "gluten", "nötter"]` |
| `other_dietary` | TEXT | Ja | Fritext |
| `consent_given_at` | TIMESTAMPTZ | Nej | GDPR-samtycke |
| `auto_delete_at` | TIMESTAMPTZ | Nej | `party_date + 7 dagar` |

**RLS:**
- **Endast** ägare kan läsa (SELECT via JOIN parties → invitations → rsvp)
- Alla kan infoga **om** `consent_given_at IS NOT NULL`

**Index:** `idx_allergy_delete` på `auto_delete_at`.

**GDPR:**
- Krypteras med AES-256-GCM vid insättning (`src/lib/utils/crypto.ts`)
- Raderas automatiskt via pg_cron jobb dagligen kl 03:00 UTC (migration `00014`)
- Edge Function fallback finns som backup

---

### party_images

AI-genererade bilder per kalas. Max 5 per kalas (admins obegränsade).

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `party_id` | UUID (FK) | Nej | Refererar till `parties(id)`, CASCADE |
| `image_url` | TEXT | Nej | URL till genererad bild |
| `is_selected` | BOOLEAN | Nej | Om bilden är aktiv (default: `false`) |
| `created_at` | TIMESTAMPTZ | Nej | Auto |

**RLS:** Ägare kan hantera (ALL via JOIN parties).

---

### audit_log

Händelselogg för säkerhet och felsökning. Rensas automatiskt efter 90 dagar.

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `user_id` | UUID | Ja | Användare (null för anonyma händelser) |
| `action` | TEXT | Nej | Händelse (t.ex. `rsvp.submit`, `party.create`) |
| `resource_type` | TEXT | Ja | Resurstyp (t.ex. `rsvp`, `party`) |
| `resource_id` | TEXT | Ja | Resurs-ID |
| `metadata` | JSONB | Ja | Extra data |
| `created_at` | TIMESTAMPTZ | Nej | Auto |

**RLS:** Användare kan läsa egna loggposter. Alla kan infoga.

**Cleanup:** pg_cron jobb raderar poster äldre än 90 dagar dagligen kl 04:00 UTC.

---

### invited_guests

Spårar skickade inbjudningar (e-post och SMS).

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `party_id` | UUID (FK) | Nej | Refererar till `parties(id)`, CASCADE |
| `email` | TEXT | Ja | E-postadress (nullable för SMS-gäster) |
| `phone` | TEXT | Ja | Telefonnummer E.164 (nullable för e-postgäster) |
| `invite_method` | TEXT | Nej | `'email'` eller `'sms'` (default: `'email'`) |
| `name` | TEXT | Ja | Gästens namn |
| `invited_at` | TIMESTAMPTZ | Nej | Auto |

**RLS:** Ägare kan hantera (ALL via JOIN parties).

**Constraints:**
- `CHECK (email IS NOT NULL OR phone IS NOT NULL)` — minst en kontaktmetod
- `UNIQUE(party_id, email)` — en per e-post per kalas
- `UNIQUE(party_id, phone) WHERE phone IS NOT NULL` — en per telefon per kalas (partial index)

**Index:** `idx_invited_guests_party`, `idx_invited_guests_party_phone`.

---

### sms_usage

Spårar SMS-förbrukning per användare och månad. Överlever kalas-radering (`ON DELETE SET NULL`).

| Kolumn | Typ | Nullable | Beskrivning |
|--------|-----|----------|-------------|
| `id` | UUID (PK) | Nej | Auto-genererad |
| `user_id` | UUID (FK) | Nej | Refererar till `profiles(id)`, CASCADE |
| `party_id` | UUID (FK) | Ja | Refererar till `parties(id)`, SET NULL |
| `sms_count` | INTEGER | Nej | Antal skickade SMS (default: 0) |
| `month` | VARCHAR(7) | Nej | `YYYY-MM` format |
| `created_at` | TIMESTAMPTZ | Nej | Auto |
| `updated_at` | TIMESTAMPTZ | Nej | Auto |

**RLS:** Användare kan bara se/ändra sin egen rad.

**Constraints:** `UNIQUE(user_id, month)` — en rad per användare per månad.

**Anti-fusk:**
- Max 15 SMS per kalas (kontrolleras i API)
- Max 1 kalas med SMS per månad (kontrolleras i API)
- Om kalas raderas sätts `party_id` till NULL, men raden finns kvar → kan inte återanvända SMS

**Index:** `idx_sms_usage_user_month`.

---

## Migrationer

| Nr | Fil | Beskrivning |
|----|-----|-------------|
| 1 | `00001_create_profiles.sql` | profiles-tabell, RLS, auto-create trigger |
| 2 | `00002_create_parties_invitations.sql` | parties + invitations, RLS, index |
| 3 | `00003_create_rsvp_allergy.sql` | rsvp_responses + allergy_data, RLS, GDPR |
| 4 | `00004_multiple_rsvp_per_invitation.sql` | UNIQUE(invitation_id, parent_email) |
| 5 | `00005_add_edit_token.sql` | edit_token kolumn med backfill |
| 6 | `00006_add_party_time_end.sql` | party_time_end kolumn |
| 7 | `00007_create_invited_guests.sql` | invited_guests-tabell, RLS |
| 8 | `00008_create_children.sql` | children-tabell, child_id FK på parties |
| 9 | `00009_add_sms_support.sql` | sms_usage-tabell, phone/invite_method på invited_guests |
| 10 | `00010_create_party_images.sql` | party_images-tabell med RLS |
| 11 | `00011_add_invitation_template.sql` | invitation_template kolumn på parties |
| 12 | `00012_party_child_photo.sql` | child_photo_url + child_photo_frame på parties |
| 13 | `00013_child_photo.sql` | photo_url + photo_frame på children |
| 14 | `00014_allergy_auto_delete_cron.sql` | pg_cron jobb för allergidata-radering (03:00 UTC) |
| 15 | `00015_tighten_rsvp_update_rls.sql` | Striktare UPDATE RLS-policy på rsvp_responses |
| 16 | `00016_audit_log.sql` | audit_log-tabell, RLS, pg_cron cleanup (90 dagar) |
| 17 | `00017_child_photo_storage.sql` | child-photos Storage bucket med RLS-policies |

---

## ER-diagram (förenklat)

```
auth.users
    │
    ▼ (1:1)
profiles ──── children (1:N)
    │
    ▼ (1:N)
parties ──── invitations (1:1)
    │              │
    │              ▼ (1:N)
    │         rsvp_responses ──── allergy_data (1:1, krypterad)
    │
    ├──── party_images (1:N)
    ├──── invited_guests (1:N)
    │
    └──── sms_usage (via user_id, N:1 till profiles)

audit_log (fristående, 90 dagars retention)
```

---

## Triggers

| Trigger | Tabell | Beskrivning |
|---------|--------|-------------|
| `on_auth_user_created` | `auth.users` | Skapar profil automatiskt vid registrering |
| `profiles_updated_at` | `profiles` | Uppdaterar `updated_at` vid ändring |
| `parties_updated_at` | `parties` | Uppdaterar `updated_at` vid ändring |
| `rsvp_responses_updated_at` | `rsvp_responses` | Uppdaterar `updated_at` vid ändring |
