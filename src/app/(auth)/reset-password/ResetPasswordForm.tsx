'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfetti } from '@/hooks/useConfetti';
import { createClient } from '@/lib/supabase/client';
import { passwordSchema } from '@/lib/utils/validation';

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const { fireConfettiCannon } = useConfetti();

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      setChecking(false);
    }
    checkSession();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const parsed = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => fireConfettiCannon(), 300);
  }

  if (checking) {
    return (
      <Card className="border-0 glass-card text-center">
        <CardContent className="py-12">
          <p className="text-muted-foreground">Laddar...</p>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="border-0 glass-card text-center">
        <CardHeader className="space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl">
            ✅
          </div>
          <CardTitle className="text-2xl font-display">Lösenord uppdaterat!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ditt lösenord har ändrats. Du kan nu fortsätta använda KalasKoll.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="font-semibold gradient-celebration text-white shadow-warm">
                Gå till dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 glass-card">
      <CardHeader className="text-center space-y-3 pb-2">
        <span className="mx-auto block text-3xl font-extrabold tracking-tight text-primary font-display">
          KalasKoll
        </span>
        <CardTitle className="text-2xl font-display">Nytt lösenord</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ange ditt nya lösenord nedan.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nytt lösenord</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minst 6 tecken"
              required
              minLength={6}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Samma lösenord igen"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-semibold gradient-celebration text-white"
            disabled={loading}
          >
            {loading ? 'Sparar...' : 'Spara nytt lösenord'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
