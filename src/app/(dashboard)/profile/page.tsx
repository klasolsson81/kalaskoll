'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { updateProfile, type ProfileActionResult } from './actions';

export default function ProfilePage() {
  const [state, formAction] = useActionState<ProfileActionResult, FormData>(updateProfile, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            &larr; Tillbaka
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Ändra profil</h1>
      </div>

      <form action={formAction} className="space-y-6">
        {state.error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
            Profilen har uppdaterats!
          </div>
        )}

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Dina uppgifter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Namn</Label>
              <Input
                id="fullName"
                name="fullName"
                required
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
                placeholder="070 123 4567"
                className="h-11"
              />
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
