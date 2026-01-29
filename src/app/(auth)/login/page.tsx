'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { login, type AuthResult } from '@/app/(auth)/actions';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useActionState<AuthResult, FormData>(
    async (_prev, formData) => login(formData),
    {},
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Logga in</CardTitle>
        <CardDescription>Logga in på ditt KalasFix-konto</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input id="email" name="email" type="email" placeholder="din@email.se" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <SubmitButton className="w-full">Logga in</SubmitButton>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Har du inget konto?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Skapa konto
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
