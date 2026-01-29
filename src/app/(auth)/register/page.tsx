'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { register, type AuthResult } from '@/app/(auth)/actions';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction] = useActionState<AuthResult, FormData>(
    async (_prev, formData) => register(formData),
    {},
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Skapa konto</CardTitle>
        <CardDescription>Kom igång med KalasKoll</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Namn</Label>
            <Input id="fullName" name="fullName" placeholder="Ditt namn" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input id="email" name="email" type="email" placeholder="din@email.se" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              placeholder="Minst 6 tecken"
              required
            />
          </div>
          <SubmitButton className="w-full">Skapa konto</SubmitButton>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Har du redan ett konto?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Logga in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
