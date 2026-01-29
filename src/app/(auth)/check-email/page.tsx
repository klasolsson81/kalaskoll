import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Kolla din e-post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Vi har skickat ett verifieringsmail till dig. Klicka på länken i mailet
          för att aktivera ditt konto.
        </p>
        <p className="text-sm text-muted-foreground">
          Hittar du inte mailet? Kolla din skräppost. Det kan ta någon minut
          innan det dyker upp.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline">Tillbaka till inloggning</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
