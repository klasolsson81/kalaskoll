# API-dokumentation

> Senast uppdaterad: 2026-01-30

Alla API-endpoints finns under `src/app/api/`. Autentisering sker via Supabase Auth (session cookie).

---

## RSVP

### POST /api/rsvp

Skicka OSA-svar (publikt, ingen auth krävs).

| Fält | Typ | Krävs | Beskrivning |
|------|-----|-------|-------------|
| `token` | string | Ja | Inbjudningstoken (från QR-kod) |
| `childName` | string | Ja | Barnets namn |
| `attending` | boolean | Ja | Kommer/kommer inte |
| `parentName` | string | Nej | Förälders namn |
| `parentPhone` | string | Nej | Telefonnummer (+46/0-format) |
| `parentEmail` | string | Ja | E-post (identifierare) |
| `message` | string | Nej | Meddelande (max 500 tecken) |
| `allergies` | string[] | Nej | Allergier |
| `otherDietary` | string | Nej | Övrig kost (fritext) |
| `allergyConsent` | boolean | Nej | GDPR-samtycke för allergidata |

**Svar:**
- `200` — `{ success: true, rsvpId: string }`
- `400` — Valideringsfel
- `409` — E-post redan registrerad (hänvisning till redigeringslänk i bekräftelsemail)
- `429` — Rate limit (10 req/min per IP)

**Beteende:**
- Genererar kryptografisk `edit_token` (64 hex-tecken)
- Sparar allergidata separat med auto-radering (kalasdatum + 7 dagar)
- Skickar bekräftelsemail via Resend (fire-and-forget)
- En unik kombination av `invitation_id + parent_email`

---

### GET /api/rsvp/edit

Hämta befintligt OSA-svar för redigering (publikt).

**Query-parametrar:**

| Fält | Typ | Krävs | Beskrivning |
|------|-----|-------|-------------|
| `editToken` | string | Ja | Edit-token från bekräftelsemail |

**Svar:**
```json
{
  "rsvp": {
    "childName": "string",
    "attending": true,
    "parentName": "string | null",
    "parentPhone": "string | null",
    "parentEmail": "string",
    "message": "string | null"
  },
  "allergies": ["string"],
  "otherDietary": "string | null",
  "invitationToken": "string | null"
}
```

---

### POST /api/rsvp/edit

Uppdatera befintligt OSA-svar (publikt, kräver edit-token).

Request body: samma som `POST /api/rsvp` men med `editToken` istället för `token`.

**Svar:**
- `200` — `{ success: true, rsvpId: string }`
- `400` — Valideringsfel
- `404` — Ogiltigt edit-token
- `429` — Rate limit (10 req/min per IP)

**Beteende:**
- Uppdaterar befintligt svar (tar bort gammal allergidata, lägger till ny)
- Skickar ny bekräftelsemail

---

## Inbjudningar

### POST /api/invitation/send

Skicka inbjudningar via e-post. **Kräver auth + kalas-ägarskap.**

| Fält | Typ | Krävs | Beskrivning |
|------|-----|-------|-------------|
| `partyId` | UUID | Ja | Kalas-ID |
| `emails` | array | Ja | Lista med `{ email: string, name?: string }` |

**Begränsningar:** Max 50 e-postadresser per anrop.

**Svar:**
```json
{
  "sent": 3,
  "failed": 0
}
```

**Beteende:**
- Verifierar kalas-ägarskap
- Sparar gäster i `invited_guests` (med `invite_method: 'email'`)
- Skickar HTML-mail via Resend parallellt
- Upsert på `(party_id, email)` — duplicater ignoreras

---

### POST /api/invitation/send-sms

Skicka inbjudningar via SMS (46elks). **Kräver auth + kalas-ägarskap.**

| Fält | Typ | Krävs | Beskrivning |
|------|-----|-------|-------------|
| `partyId` | UUID | Ja | Kalas-ID |
| `phones` | string[] | Ja | Telefonnummer (07x eller +46x) |

**Begränsningar:**
- Max 15 SMS per kalas
- Max 1 kalas med SMS per månad per användare
- Superadmins (`ADMIN_EMAILS`) undantas från alla gränser

**Svar:**
```json
{
  "sent": 3,
  "failed": 0,
  "remainingSmsThisParty": 12
}
```

**Felkoder:**
- `429` — `"Du har redan använt SMS-inbjudningar för ett annat kalas denna månad"`
- `429` — `"Max 15 SMS per kalas. Du har redan skickat X."`

**Beteende:**
- Normaliserar telefonnummer (07x till +467x)
- Sparar gäster i `invited_guests` (med `invite_method: 'sms'`)
- Skickar SMS parallellt via 46elks
- Spårar förbrukning i `sms_usage`-tabellen
- SMS-meddelande: `"{namn} fyller {ålder}! Kalas {datum} kl {tid}, {plats}. OSA: {url}"`
- Auto-förkortar om >160 tecken

---

### POST /api/invitation/generate

Generera AI-inbjudningsbild. **Kräver auth.**

| Fält | Typ | Krävs | Beskrivning |
|------|-----|-------|-------------|
| `partyId` | string | Ja | Kalas-ID |
| `theme` | string | Nej | Tema (override av partyns tema) |

**Svar:**
```json
{
  "imageUrl": "https://..."
}
```

**Beteende:**
- Mock mode (`NEXT_PUBLIC_MOCK_AI=true`): returnerar SVG-placeholder
- Superadmins: alltid riktiga API-anrop (Ideogram/OpenAI) oavsett mock mode
- Försöker Ideogram API först, fallback till OpenAI DALL-E
- Sparar genererad bild-URL på kalaset

---

## Auth

### POST /api/auth/logout

Logga ut användare. **Kräver auth.**

**Request body:** Inget.

**Svar:** `{ success: true }`

---

### POST /api/auth/delete-account

Ta bort användarkonto. **Kräver auth.** (Tillfällig endpoint för testning.)

**Request body:** Inget.

**Svar:**
- `200` — `{ success: true }`
- `401` — `{ error: "Not authenticated" }`

**Beteende:**
- Raderar användare via Supabase admin-klient
- Loggar ut användare efter radering
- CASCADE: all data (profil, kalas, inbjudningar, OSA-svar) raderas automatiskt
