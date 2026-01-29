import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConfirmedPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Konto verifierat!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Ditt konto är nu aktiverat. Du kan börja planera ditt första kalas!
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button>Gå till dashboard</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
