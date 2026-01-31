'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useConfetti } from '@/hooks/useConfetti';

export default function ConfirmedPage() {
  const { fireConfettiCannon } = useConfetti();

  useEffect(() => {
    const timer = setTimeout(() => fireConfettiCannon(), 300);
    return () => clearTimeout(timer);
  }, [fireConfettiCannon]);

  return (
    <Card className="border-0 shadow-lifted text-center">
      <CardHeader className="space-y-4 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl">
          ✅
        </div>
        <CardTitle className="text-2xl">Konto verifierat!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Ditt konto är nu aktiverat. Du kan börja planera ditt första kalas!
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
