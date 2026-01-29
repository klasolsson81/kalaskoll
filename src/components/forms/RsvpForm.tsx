'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllergyCheckboxes } from '@/components/forms/AllergyCheckboxes';

interface RsvpFormProps {
  token: string;
  childName: string;
}

export function RsvpForm({ token, childName }: RsvpFormProps) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (attending === null) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const allergies: string[] = [];
    formData.getAll('allergies').forEach((v) => allergies.push(v as string));

    const body = {
      token,
      childName: formData.get('childName') as string,
      attending,
      parentName: (formData.get('parentName') as string) || undefined,
      parentPhone: (formData.get('parentPhone') as string) || undefined,
      parentEmail: (formData.get('parentEmail') as string) || undefined,
      message: (formData.get('message') as string) || undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      otherDietary: (formData.get('otherDietary') as string) || undefined,
      allergyConsent: formData.get('allergyConsent') === 'true',
    };

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Något gick fel');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Kunde inte skicka svar. Försök igen.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-2xl font-bold">
            {attending ? 'Tack! Vi ses på kalaset!' : 'Tack för ditt svar!'}
          </p>
          <p className="mt-2 text-muted-foreground">
            {attending
              ? `Vi ser fram emot att fira med ${childName}!`
              : 'Hoppas vi ses en annan gång!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Attending toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Kan ni komma?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`rounded-lg border-2 p-4 text-center text-lg font-medium transition-colors ${
                attending === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-border hover:border-green-300'
              }`}
            >
              Ja, vi kommer!
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`rounded-lg border-2 p-4 text-center text-lg font-medium transition-colors ${
                attending === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-border hover:border-red-300'
              }`}
            >
              Nej, tyvärr
            </button>
          </div>
        </CardContent>
      </Card>

      {attending !== null && (
        <>
          {/* Child info */}
          <Card>
            <CardHeader>
              <CardTitle>Om barnet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Barnets namn</Label>
                <Input id="childName" name="childName" required placeholder="Barnets namn" />
              </div>
            </CardContent>
          </Card>

          {/* Parent info */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktuppgifter (valfritt)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Förälders namn</Label>
                <Input id="parentName" name="parentName" placeholder="Ditt namn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Telefon</Label>
                <Input
                  id="parentPhone"
                  name="parentPhone"
                  type="tel"
                  placeholder="070 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">E-post</Label>
                <Input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  placeholder="din@email.se"
                />
              </div>
            </CardContent>
          </Card>

          {/* Allergies (only if attending) */}
          {attending && (
            <Card>
              <CardHeader>
                <CardTitle>Allergier & specialkost</CardTitle>
              </CardHeader>
              <CardContent>
                <AllergyCheckboxes />
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="message">Meddelande (valfritt)</Label>
                <textarea
                  id="message"
                  name="message"
                  rows={2}
                  placeholder="Vi ser fram emot det!"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Skickar...' : 'Skicka svar'}
          </Button>
        </>
      )}
    </form>
  );
}
