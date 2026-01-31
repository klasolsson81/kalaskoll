import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckEmailPage() {
  return (
    <Card className="border-0 shadow-lifted text-center">
      <CardHeader className="space-y-4 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          ✉️
        </div>
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
            <Button variant="outline" className="font-medium">Tillbaka till inloggning</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
