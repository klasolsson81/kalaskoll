'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllergyCheckboxes } from '@/components/forms/AllergyCheckboxes';
import { useConfetti } from '@/hooks/useConfetti';

interface ChildEntry {
  id?: string;
  childName: string;
  attending: boolean;
  allergies: string[];
  otherDietary: string;
  allergyConsent: boolean;
}

export interface RsvpMultiChildDefaults {
  children?: Array<{
    id?: string;
    childName: string;
    attending: boolean;
    allergies?: string[];
    otherDietary?: string | null;
  }>;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string;
  message?: string | null;
}

interface RsvpFormProps {
  token: string;
  childName: string;
  mode?: 'create' | 'edit';
  editToken?: string;
  defaultValues?: RsvpMultiChildDefaults;
}

const MAX_CHILDREN = 5;

export function RsvpForm({ token, childName, mode = 'create', editToken, defaultValues }: RsvpFormProps) {
  const [globalAttending, setGlobalAttending] = useState<boolean | null>(
    defaultValues?.children?.[0]?.attending ?? null,
  );
  const [children, setChildren] = useState<ChildEntry[]>(() => {
    if (defaultValues?.children && defaultValues.children.length > 0) {
      return defaultValues.children.map((c) => ({
        id: c.id,
        childName: c.childName,
        attending: c.attending,
        allergies: c.allergies ?? [],
        otherDietary: c.otherDietary ?? '',
        allergyConsent: false,
      }));
    }
    return [{ childName: '', attending: true, allergies: [], otherDietary: '', allergyConsent: false }];
  });
  const [parentEmail, setParentEmail] = useState(defaultValues?.parentEmail ?? '');
  const [parentName, setParentName] = useState(defaultValues?.parentName ?? '');
  const [parentPhone, setParentPhone] = useState(defaultValues?.parentPhone ?? '');
  const [message, setMessage] = useState(defaultValues?.message ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { fireConfettiCannon } = useConfetti();

  const isEdit = mode === 'edit';
  const emailLocked = isEdit || !!defaultValues?.parentEmail;

  // When globalAttending changes, update all children
  useEffect(() => {
    if (globalAttending !== null) {
      setChildren((prev) => prev.map((c) => ({ ...c, attending: globalAttending })));
    }
  }, [globalAttending]);

  // Fire confetti on successful attending submission
  useEffect(() => {
    if (submitted && globalAttending) {
      const timer = setTimeout(() => fireConfettiCannon(), 300);
      return () => clearTimeout(timer);
    }
  }, [submitted, globalAttending, fireConfettiCannon]);

  function addChild() {
    if (children.length >= MAX_CHILDREN) return;
    setChildren((prev) => [
      ...prev,
      {
        childName: '',
        attending: globalAttending ?? true,
        allergies: [],
        otherDietary: '',
        allergyConsent: false,
      },
    ]);
  }

  function removeChild(index: number) {
    if (children.length <= 1) return;
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }

  function updateChild(index: number, updates: Partial<ChildEntry>) {
    setChildren((prev) => prev.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  }

  const handleAllergyChange = useCallback(
    (index: number) => (data: { allergies: string[]; otherDietary: string; allergyConsent: boolean }) => {
      setChildren((prev) =>
        prev.map((c, i) =>
          i === index
            ? { ...c, allergies: data.allergies, otherDietary: data.otherDietary, allergyConsent: data.allergyConsent }
            : c,
        ),
      );
    },
    [],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (globalAttending === null) return;

    setLoading(true);
    setError(null);

    // Build payload
    const childrenPayload = children.map((c) => ({
      ...(c.id ? { id: c.id } : {}),
      childName: c.childName,
      attending: c.attending,
      allergies: c.allergies.length > 0 ? c.allergies : undefined,
      otherDietary: c.otherDietary || undefined,
      allergyConsent: c.allergyConsent || undefined,
    }));

    const payload = {
      children: childrenPayload,
      parentName: parentName || undefined,
      parentPhone: parentPhone || undefined,
      parentEmail,
      message: message || undefined,
      ...(isEdit ? { editToken } : { token }),
    };

    const url = isEdit ? '/api/rsvp/edit' : '/api/rsvp';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    const childNamesList = children.map((c) => c.childName).filter(Boolean);
    const displayNames = childNamesList.length > 1
      ? `${childNamesList.slice(0, -1).join(', ')} och ${childNamesList[childNamesList.length - 1]}`
      : childNamesList[0] || '';

    return (
      <Card className="border-0 glass-card">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl">
            {globalAttending ? '🎉' : '👋'}
          </div>
          <p className="text-2xl font-bold font-display">
            {isEdit
              ? 'Ditt svar har uppdaterats!'
              : globalAttending
                ? 'Tack! Vi ses på kalaset!'
                : 'Tack för ditt svar!'}
          </p>
          <p className="mt-2 text-muted-foreground">
            {globalAttending
              ? children.length > 1
                ? `Vi ser fram emot att fira med ${displayNames}!`
                : `Vi ser fram emot att fira med ${childName}!`
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
              onClick={() => setGlobalAttending(true)}
              aria-pressed={globalAttending === true}
              aria-label="Ja, vi kommer på kalaset"
              className={`rounded-xl border-2 p-5 text-center transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                globalAttending === true
                  ? 'border-success bg-success/5 text-success shadow-sm'
                  : 'border-border hover:border-success/50 hover:bg-success/5'
              }`}
            >
              <span className="block text-2xl">✓</span>
              <span className="mt-1 block text-base font-semibold">Ja, vi kommer!</span>
            </button>
            <button
              type="button"
              onClick={() => setGlobalAttending(false)}
              aria-pressed={globalAttending === false}
              aria-label="Nej, vi kan tyvärr inte komma"
              className={`rounded-xl border-2 p-5 text-center transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                globalAttending === false
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

      {globalAttending !== null && (
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
                  type="email"
                  required
                  placeholder="din@email.se"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
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

          {/* Children */}
          {children.map((child, index) => (
            <Card key={index} className="border-0 glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display">
                    {children.length > 1 ? `Barn ${index + 1}` : 'Om barnet'}
                  </CardTitle>
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`childName-${index}`}>Barnets namn</Label>
                  <Input
                    id={`childName-${index}`}
                    required
                    placeholder="Barnets namn"
                    value={child.childName}
                    onChange={(e) => updateChild(index, { childName: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>

                {/* Per-child attending toggle (only shown if multiple children) */}
                {children.length > 1 && (
                  <div className="space-y-2">
                    <Label>Kommer detta barn?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateChild(index, { attending: true })}
                        aria-pressed={child.attending}
                        className={`rounded-lg border p-3 text-center text-sm transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                          child.attending
                            ? 'border-success bg-success/5 text-success font-semibold'
                            : 'border-border hover:border-success/50'
                        }`}
                      >
                        Ja
                      </button>
                      <button
                        type="button"
                        onClick={() => updateChild(index, { attending: false })}
                        aria-pressed={!child.attending}
                        className={`rounded-lg border p-3 text-center text-sm transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                          !child.attending
                            ? 'border-destructive bg-destructive/5 text-destructive font-semibold'
                            : 'border-border hover:border-destructive/50'
                        }`}
                      >
                        Nej
                      </button>
                    </div>
                  </div>
                )}

                {/* Per-child allergies (only if attending) */}
                {child.attending && (
                  <AllergyCheckboxes
                    initialSelected={child.allergies}
                    initialOtherDietary={child.otherDietary}
                    onChange={handleAllergyChange(index)}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add sibling button */}
          {children.length < MAX_CHILDREN && (
            <button
              type="button"
              onClick={addChild}
              className="w-full rounded-xl border-2 border-dashed border-border p-4 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              + Lägg till syskon
            </button>
          )}

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
                  placeholder="Ditt namn"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Telefon</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="070 123 4567"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card className="border-0 glass-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="message">Meddelande (valfritt)</Label>
                <textarea
                  id="message"
                  rows={2}
                  placeholder="Vi ser fram emot det!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
