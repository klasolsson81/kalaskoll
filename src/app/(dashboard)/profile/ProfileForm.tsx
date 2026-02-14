'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { updateProfile, type ProfileActionResult } from './actions';

interface ProfileFormProps {
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
}

export default function ProfileForm({ defaultName, defaultPhone, defaultEmail }: ProfileFormProps) {
  const [state, formAction] = useActionState<ProfileActionResult, FormData>(updateProfile, {});
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            &larr; Tillbaka
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-display">Profil</h1>
      </div>

      <form action={formAction} className="space-y-6">
        {state.error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
            {state.successMessage || 'Profilen har uppdaterats!'}
          </div>
        )}

        {/* Personal details */}
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="font-display">Personuppgifter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Namn</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                defaultValue={defaultName}
                placeholder="Ditt namn"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (valfritt)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaultPhone}
                placeholder="070 123 4567"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={defaultEmail}
                placeholder="din@email.se"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Om du ändrar e-post skickas en bekräftelselänk till den nya adressen.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Password change (expandable) */}
        <Card className="border-0 glass-card">
          <CardHeader>
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="flex w-full items-center justify-between"
            >
              <CardTitle className="font-display">Ändra lösenord</CardTitle>
              {showPasswordChange ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {showPasswordChange && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nytt lösenord</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={6}
                  placeholder="Minst 6 tecken"
                  className="h-11"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  placeholder="Skriv lösenordet igen"
                  className="h-11"
                  autoComplete="new-password"
                />
                {state.fieldError && (
                  <p className="text-sm text-destructive">{state.fieldError}</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Current password confirmation */}
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="font-display">Bekräfta med lösenord</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                placeholder="Skriv ditt nuvarande lösenord"
                className="h-11"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Krävs för att bekräfta ändringar.
              </p>
            </div>
          </CardContent>
        </Card>

        <SubmitButton className="w-full h-12 text-base font-semibold gradient-celebration text-white shadow-warm" size="lg">
          Spara ändringar
        </SubmitButton>
      </form>
    </div>
  );
}
