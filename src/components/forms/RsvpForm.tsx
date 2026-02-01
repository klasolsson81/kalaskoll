'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllergyCheckboxes } from '@/components/forms/AllergyCheckboxes';
import { rsvpSchema } from '@/lib/utils/validation';
import { useConfetti } from '@/hooks/useConfetti';

interface RsvpDefaultValues {
  childName?: string;
  attending?: boolean;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string;
  message?: string | null;
  allergies?: string[];
  otherDietary?: string | null;
}

interface RsvpFormProps {
  token: string;
  childName: string;
  mode?: 'create' | 'edit';
  editToken?: string;
  defaultValues?: RsvpDefaultValues;
}

export function RsvpForm({ token, childName, mode = 'create', editToken, defaultValues }: RsvpFormProps) {
  const [attending, setAttending] = useState<boolean | null>(defaultValues?.attending ?? null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { fireConfettiCannon } = useConfetti();

  const isEdit = mode === 'edit';
  const emailLocked = isEdit || !!defaultValues?.parentEmail;

  // Fire confetti on successful attending submission
  useEffect(() => {
    if (submitted && attending) {
      const timer = setTimeout(() => fireConfettiCannon(), 300);
      return () => clearTimeout(timer);
    }
  }, [submitted, attending, fireConfettiCannon]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (attending === null) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const allergies: string[] = [];
    formData.getAll('allergies').forEach((v) => allergies.push(v as string));

    const baseBody = {
      childName: formData.get('childName') as string,
      attending,
      parentName: (formData.get('parentName') as string) || undefined,
      parentPhone: (formData.get('parentPhone') as string) || undefined,
      parentEmail: formData.get('parentEmail') as string,
      message: (formData.get('message') as string) || undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      otherDietary: (formData.get('otherDietary') as string) || undefined,
      allergyConsent: formData.get('allergyConsent') === 'true',
    };

    // Client-side validation before sending
    const validated = rsvpSchema.safeParse(baseBody);
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      setLoading(false);
      return;
    }

    const url = isEdit ? '/api/rsvp/edit' : '/api/rsvp';
    const body = isEdit
      ? { ...baseBody, editToken }
      : { ...baseBody, token };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError(data.error || 'Du har redan svarat. Kolla din e-post för en länk att ändra.');
        } else {
          setError(data.error || 'Något gick fel');
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('RSVP submit error:', err);
      setError('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-0 glass-card">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl">
            {attending ? '🎉' : '👋'}
          </div>
          <p className="text-2xl font-bold font-display">
            {isEdit
              ? 'Ditt svar har uppdaterats!'
              : attending
                ? 'Tack! Vi ses på kalaset!'
                : 'Tack för ditt svar!'}
          </p>
          <p className="mt-2 text-muted-foreground">
            {attending
              ? `Vi ser fram emot att fira med ${childName}!`
              : 'Hoppas vi ses en annan gång!'}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Kolla din e-post för en bekräftelse och länk att ändra ditt svar.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Du kan nu stänga den här sidan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Attending toggle */}
      <Card className="border-0 glass-card">
        <CardHeader>
          <CardTitle className="font-display">Kan ni komma?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAttending(true)}
              aria-pressed={attending === true}
              className={`rounded-xl border-2 p-5 text-center transition-all ${
                attending === true
                  ? 'border-success bg-success/5 text-success shadow-sm'
                  : 'border-border hover:border-success/50 hover:bg-success/5'
              }`}
            >
              <span className="block text-2xl">✓</span>
              <span className="mt-1 block text-base font-semibold">Ja, vi kommer!</span>
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              aria-pressed={attending === false}
              className={`rounded-xl border-2 p-5 text-center transition-all ${
                attending === false
                  ? 'border-destructive bg-destructive/5 text-destructive shadow-sm'
                  : 'border-border hover:border-destructive/50 hover:bg-destructive/5'
              }`}
            >
              <span className="block text-2xl">✗</span>
              <span className="mt-1 block text-base font-semibold">Nej, tyvärr</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {attending !== null && (
        <>
          {/* Email (required identifier) */}
          <Card className="border-0 glass-card">
            <CardHeader>
              <CardTitle className="font-display">Din e-postadress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">E-post</Label>
                <Input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  required
                  placeholder="din@email.se"
                  defaultValue={defaultValues?.parentEmail ?? ''}
                  readOnly={emailLocked}
                  className={`h-12 text-base ${emailLocked ? 'bg-muted' : ''}`}
                />
                {!emailLocked && (
                  <p className="text-xs text-muted-foreground">
                    Hit skickar vi en bekräftelse och en länk om du vill ändra ditt svar.
                  </p>
                )}
                {emailLocked && (
                  <p className="text-xs text-muted-foreground">
                    E-postadressen kan inte ändras.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Child info */}
          <Card className="border-0 glass-card">
            <CardHeader>
              <CardTitle className="font-display">Om barnet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Barnets namn</Label>
                <Input
                  id="childName"
                  name="childName"
                  required
                  placeholder="Barnets namn"
                  defaultValue={defaultValues?.childName ?? ''}
                  className="h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent info */}
          <Card className="border-0 glass-card">
            <CardHeader>
              <CardTitle className="font-display">Kontaktuppgifter (valfritt)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Förälders namn</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  placeholder="Ditt namn"
                  defaultValue={defaultValues?.parentName ?? ''}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Telefon</Label>
                <Input
                  id="parentPhone"
                  name="parentPhone"
                  type="tel"
                  placeholder="070 123 4567"
                  defaultValue={defaultValues?.parentPhone ?? ''}
                  className="h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Allergies (only if attending) */}
          {attending && (
            <Card className="border-0 glass-card">
              <CardHeader>
                <CardTitle className="font-display">Allergier & specialkost</CardTitle>
              </CardHeader>
              <CardContent>
                <AllergyCheckboxes
                  initialSelected={defaultValues?.allergies}
                  initialOtherDietary={defaultValues?.otherDietary ?? undefined}
                />
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <Card className="border-0 glass-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="message">Meddelande (valfritt)</Label>
                <textarea
                  id="message"
                  name="message"
                  rows={2}
                  placeholder="Vi ser fram emot det!"
                  defaultValue={defaultValues?.message ?? ''}
                  className="placeholder:text-muted-foreground border-input w-full min-h-[60px] rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold gradient-celebration text-white shadow-warm"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Skickar...' : isEdit ? 'Uppdatera svar' : 'Skicka svar'}
          </Button>
        </>
      )}
    </form>
  );
}
