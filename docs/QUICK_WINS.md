# Quick Wins — KalasKoll

**Datum:** 2026-01-31
**Kontext:** Enkla fixar som förbättrar mycket. Sorterade efter impact/effort-ratio.

---

## 5-minutersfixar

### QW-01: Ändra SMS-default till `false`
**Fil:** `src/app/(dashboard)/kalas/[id]/SendInvitationsSection.tsx`
**Rad:** ~171-173
**Ändring:** `smsAllowed = smsUsage?.allowed ?? true` → `?? false`
**Varför:** Fail-closed istället för fail-open. Förhindrar oavsiktliga SMS-kostnader.

### QW-02: Server-only guard på admin-client
**Fil:** `src/lib/supabase/admin.ts`
**Lägg till i toppen:**
```typescript
if (typeof window !== 'undefined') {
  throw new Error('Admin client can only be used server-side');
}
```
**Varför:** Förhindrar att service role key läcker till klienten.

### QW-03: Flytta admin-e-post till miljövariabel
**Fil:** `src/lib/constants.ts`
**Ändring:**
```typescript
// Före:
export const ADMIN_EMAILS = ['klasolsson81@gmail.com', 'zeback_@hotmail.com'];
// Efter:
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
```
**Varför:** Exponerar inte privilegierade konton i öppen källkod.

---

## 15-minutersfixar

### QW-04: Error handling på delete account
**Fil:** `src/app/api/auth/delete-account/route.ts`
**Ändring:** Wrappa raderingen i try/catch, returnera `{ error: 'Kunde inte radera kontot' }` vid fel.
**Varför:** Förhindrar delvis raderade konton.

### QW-05: Zod-scheman på select-image och select-template
**Fil:** `src/app/api/invitation/select-image/route.ts`, `select-template/route.ts`
**Ändring:** Ersätt manuell strängvalidering med `.safeParse()`.
**Varför:** Konsekvent med resten av kodbasen, bättre felmeddelanden.

### QW-06: Validera OpenAI API-response
**Fil:** `src/lib/ai/openai.ts`
**Ändring:** Lägg till Zod-schema:
```typescript
const schema = z.object({ data: z.array(z.object({ url: z.string().url() })) });
const parsed = schema.safeParse(data);
```
**Varför:** Förhindrar runtime-krasch om API-svaret ändras.

### QW-07: Validera 46elks API-response
**Fil:** `src/lib/sms/elks.ts`
**Ändring:** Ersätt `as ElksResponse` med Zod-parse.
**Varför:** Tyst fel → tydligt fel vid API-ändringar.

---

## 30-minutersfixar

### QW-08: HTML-escapa användarinput i e-postmallar
**Fil:** `src/lib/email/resend.ts`
**Ändring:** Skapa utility:
```typescript
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```
Applicera på alla `${...}` i HTML-mallar.
**Varför:** Eliminerar XSS/HTML-injection i e-postinbjudningar.

### QW-09: RSVP-deadline-kontroll
**Fil:** `src/app/api/rsvp/route.ts` + `src/app/r/[token]/page.tsx`
**API-ändring:** Kontrollera `party.rsvp_deadline` mot `new Date()`. Returnera 400 om förbi.
**UI-ändring:** Visa "Sista svarsdatum har passerat" + kontakta-arrangören text.
**Varför:** Klas sätter deadline av en anledning.

### QW-10: Loading state på RSVP-sida
**Fil:** Skapa `src/app/r/[token]/loading.tsx`
**Ändring:**
```typescript
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4 text-muted-foreground">Laddar inbjudan...</p>
      </div>
    </div>
  );
}
```
**Varför:** Eliminerar blank skärm för 99% av besökarna.

### QW-11: Bättre felmeddelande vid ogiltig QR-kod
**Fil:** `src/app/r/[token]/page.tsx`
**Ändring:** Ersätt `notFound()` med en hjälpsam sida:
```typescript
if (!invitation) {
  return (
    <div className="text-center py-20">
      <h1>Inbjudan hittades inte</h1>
      <p>QR-koden verkar vara ogiltig eller har gått ut. Kontakta den som bjöd in dig.</p>
    </div>
  );
}
```
**Varför:** En generisk 404 hjälper ingen. Kontektuellt meddelande hjälper gästen.

### QW-12: Error boundaries på dashboard
**Fil:** `src/app/(dashboard)/dashboard/page.tsx`
**Ändring:** Wrappa `Promise.all()` i try/catch. Vid fel, rendera fallback med "Kunde inte ladda data. Försök igen."
**Varför:** En Supabase-hicka ska inte krascha hela sidan.

### QW-13: Timeout på externa API-anrop
**Fil:** `src/lib/ai/replicate.ts`, `openai.ts`, `src/lib/sms/elks.ts`
**Ändring:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);
try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
```
**Varför:** Förhindrar att serverless-funktioner hänger.

### QW-14: Ownership-checks på 4 API-routes
**Fil:** `generate`, `select-image`, `select-template`, `upload-photo`
**Ändring:** Lägg till efter party-fetch:
```typescript
if (party.owner_id !== user.id) {
  return NextResponse.json({ error: 'Åtkomst nekad' }, { status: 403 });
}
```
**Varför:** Defense-in-depth. RLS skyddar men explicit kontroll är bättre.

---

## Impact/Effort-matris

```
             IMPACT
        Hög ─────────── Låg
  Snabb │ QW-01  QW-08  │ QW-02
  (S)   │ QW-04  QW-09  │ QW-03
        │ QW-10  QW-11  │ QW-05
        │───────────────│
  Medel │ QW-12  QW-14  │ QW-06
  (M)   │ QW-13         │ QW-07
        └───────────────┘
```

**Rekommendation:** Gör QW-01 till QW-11 i ordning. De ger mest förbättring per minut.
