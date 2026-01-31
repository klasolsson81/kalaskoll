# Tech Debt Log — KalasKoll

**Datum:** 2026-01-31
**Kontext:** Issues som kan vänta men bör dokumenteras och åtgärdas efter MVP.

---

## Arkitektur & Kodkvalitet

### TD-01: InvitationSection är 400 rader med 11 state-variabler
**Plats:** `src/app/(dashboard)/kalas/[id]/InvitationSection.tsx`
**Problem:** Bryter Single Responsibility Principle. Hanterar template-val, AI-generering, bildval, fotouppladdning, och expand/collapse i en komponent.
**Rekommendation:** Dela upp i `InvitationModeSelector` + `InvitationImagePicker` + `InvitationPhotoManager`.
**Effort:** M (2h)

### TD-02: GuestListRealtime är 464 rader med 3 inlinead subkomponenter
**Plats:** `src/app/(dashboard)/kalas/[id]/guests/GuestListRealtime.tsx`
**Problem:** AddGuestForm, EditGuestForm, och GuestRow är definierade inline. `fetchGuests` återskapas vid varje render → minnesläcka i realtime-subscription.
**Rekommendation:** Extrahera subkomponenter till egna filer. Wrappa `fetchGuests` i `useCallback`.
**Effort:** M (1-1.5h)

### TD-03: Base64-bilder lagras direkt i PostgreSQL
**Plats:** `parties.child_photo_url`, `children.photo_url`
**Problem:** ~100KB base64-strängar i databasen. Ökar backup-storlek, långsammare queries, ingen CDN-cache.
**Rekommendation:** Migrera till Supabase Storage. Spara bara URL-referens i databasen.
**Effort:** L (3-4h)

### TD-04: PhotoCropDialog är 350 rader med blandad logik
**Plats:** `src/components/shared/PhotoCropDialog.tsx`
**Problem:** Koordinatmatematik, drag-logik, SVG-generering, och canvas-export blandat. Magic numbers (0.5523, 22%, 16%) utan kommentarer.
**Rekommendation:** Extrahera drag-logik till `useDragPan` hook, SVG till separat utility.
**Effort:** M (1.5h)

### TD-05: Formulär saknar client-side Zod-validering
**Plats:** `RsvpForm.tsx`, `PartyForm.tsx`
**Problem:** Formulär parsear `FormData` manuellt. Validering sker bara server-side. Dålig UX vid felaktig input.
**Rekommendation:** Integrera Zod-scheman med `useFormState` eller react-hook-form.
**Effort:** M (2h)

---

## Testning

### TD-06: Noll integrations- och E2E-tester
**Plats:** `tests/integration/`, `tests/e2e/`
**Problem:** 122 unit-tester men 0 integrations- och 0 E2E-tester. Testpyramiden är inverterad.
**Rekommendation:** Skriv E2E-tester för: registrering → skapa kalas → RSVP → gästlista. API-integrationstester för alla routes.
**Effort:** L (4-6h)

### TD-07: CI kör inte E2E-tester och saknar coverage-rapportering
**Plats:** `.github/workflows/ci.yml`
**Problem:** Playwright installerat men aldrig kört. Coverage konfigurerat men inte insamlat.
**Rekommendation:** Lägg till Playwright-steg och coverage upload till CI.
**Effort:** S (30 min)

---

## Säkerhet & GDPR

### TD-08: Allergidata okrypterad i databasen
**Plats:** `allergy_data.allergies` (JSONB)
**Problem:** Hälsodata (GDPR art. 9) lagras i klartext. RLS skyddar åtkomst men inte fysisk access.
**Rekommendation:** Implementera kolumnkryptering med Supabase Vault eller pgcrypto.
**Effort:** M (1.5h)

### TD-09: RSVP UPDATE RLS-policy för bred
**Plats:** Migration `00003`
**Problem:** `CREATE POLICY "Anyone can update response" USING (true)`. App-lagret validerar edit_token men RLS bör vara sista försvarslinjen.
**Rekommendation:** Använd `current_setting()` för att passa edit_token genom RLS.
**Effort:** M (1h)

### TD-10: Ingen audit trail
**Plats:** Generellt
**Problem:** Ingen loggning av: vem som tittade på allergidata, raderade konton, ändrade kalas.
**Rekommendation:** Implementera `audit_log`-tabell med triggers.
**Effort:** L (3h)

### TD-11: Ingen telefonnummerverifiering för SMS
**Plats:** `/api/invitation/send-sms`
**Problem:** Vem som helst kan skicka SMS till valfritt nummer (inom gränserna).
**Rekommendation:** Lägg till OTP-verifiering innan SMS-utskick tillåts.
**Effort:** L (2-3h)

---

## Konfiguration

### TD-12: Admin-e-postadresser hårdkodade
**Plats:** `src/lib/constants.ts:23`
**Problem:** `ADMIN_EMAILS` array i källkod exponerar privilegierade konton.
**Rekommendation:** Flytta till miljövariabel: `ADMIN_EMAILS=email1,email2`.
**Effort:** S (15 min)

### TD-13: SEO-domän hårdkodad
**Plats:** `src/app/layout.tsx`
**Problem:** `metadataBase: new URL('https://kalaskoll.se')` borde använda `NEXT_PUBLIC_APP_URL`.
**Effort:** S (5 min)

### TD-14: Admin-client saknar server-only guard
**Plats:** `src/lib/supabase/admin.ts`
**Problem:** Kan importeras client-side av misstag → exponerar service role key.
**Fix:** `if (typeof window !== 'undefined') throw new Error('Server-only')`.
**Effort:** S (5 min)

---

## API-robusthet

### TD-15: Ingen timeout på externa API-anrop
**Plats:** `replicate.ts`, `openai.ts`, `elks.ts`
**Problem:** Om extern tjänst hänger väntar servern i evighet. Serverless-funktion timeout:ar efter 10s på Vercel men användarupplevelsen är dålig.
**Rekommendation:** AbortController med 30s timeout.
**Effort:** S (30 min)

### TD-16: Externa API-responses valideras inte
**Plats:** `openai.ts:40`, `elks.ts:87`, `replicate.ts:53`
**Problem:** `as`-cast och direkt property access utan Zod-validering. Kraschar vid API-ändringar.
**Rekommendation:** Skapa Zod-scheman för alla externa API-responses.
**Effort:** S (30 min)

### TD-17: E-post/SMS-utskick loggas inte och har svag feedback
**Plats:** `resend.ts`, `elks.ts`
**Problem:** Misslyckade utskick ignoreras tyst. Användaren vet inte om inbjudan nådde fram.
**Rekommendation:** Returnera status till anroparen, visa i UI, logga för debugging.
**Effort:** M (1h)

---

## Tillgänglighet

### TD-18: Saknade ARIA-attribut
**Plats:** Formulär, modaler, QR-kod
**Problem:** `aria-live`, `aria-required`, `aria-label` saknas på flera ställen. FooterModal har ofullständig fokus-fälla.
**Rekommendation:** Genomgång av alla interaktiva komponenter.
**Effort:** M (2h)

### TD-19: Bilder saknar error fallbacks
**Plats:** Alla Image/img-komponenter
**Problem:** Inget `onError`-callback. Trasiga bilder → tom yta utan feedback.
**Rekommendation:** Lägg till fallback-placeholder på alla bildkomponenter.
**Effort:** S (30 min)

---

## Prioritering efter MVP

| Prio | Issue | Effort | Påverkan |
|------|-------|--------|----------|
| 1 | TD-06: Integrations/E2E-tester | L | Regressionsriskreduktion |
| 2 | TD-08: Kryptera allergidata | M | GDPR-compliance |
| 3 | TD-01: Refaktorera InvitationSection | M | Underhållbarhet |
| 4 | TD-02: Refaktorera GuestListRealtime | M | Minnesläcka + underhåll |
| 5 | TD-03: Migrera bilder till Storage | L | Prestanda |
| 6 | TD-18: Tillgänglighet (ARIA) | M | Inkludering |
| 7 | TD-09: Strama åt RSVP RLS | M | Djupförsvar |
| 8 | TD-10: Audit trail | L | Spårbarhet |
| 9 | TD-05: Client-side Zod | M | UX |
| 10 | Resterande | S-M | Kodkvalitet |
