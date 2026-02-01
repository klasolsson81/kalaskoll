import { BETA_CONFIG } from '@/lib/beta-config';
import { BetaProgressBar } from './BetaProgressBar';

interface BetaBannerProps {
  stats: {
    spotsRemaining: number;
    totalTesters: number;
    percentFull: number;
  };
}

export function BetaBanner({ stats }: BetaBannerProps) {
  const { spotsRemaining, totalTesters } = stats;
  const isFull = spotsRemaining <= 0;

  const getUrgencyClass = () => {
    if (spotsRemaining <= 5) return 'bg-red-50 border-red-200';
    if (spotsRemaining <= 20) return 'bg-amber-50 border-amber-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getUrgencyText = () => {
    if (isFull) return 'Alla platser är fyllda!';
    if (spotsRemaining <= 5) return `Nästan fullt! Bara ${spotsRemaining} platser kvar!`;
    if (spotsRemaining <= 20) return `Går snabbt! ${spotsRemaining} platser kvar.`;
    return `${spotsRemaining} av ${BETA_CONFIG.maxTesters} platser kvar.`;
  };

  return (
    <div className={`rounded-xl border p-4 mb-6 ${getUrgencyClass()}`}>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold">
          {isFull ? 'Beta är full' : 'Testa KalasKoll gratis'}
        </h2>
      </div>

      {isFull ? (
        <p className="text-sm text-muted-foreground">
          Alla {BETA_CONFIG.maxTesters} platser är tagna. Skriv upp dig på väntelistan
          så meddelar vi dig när fler platser öppnas!
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            Vi söker {BETA_CONFIG.maxTesters} föräldrar som vill prova KalasKoll
            inför sitt barns kalas. Det här är ingen demo
            &mdash; skapa riktiga inbjudningar, skicka dem till gästerna
            och samla in OSA-svar. Allt fungerar fullt ut!
          </p>

          <BetaProgressBar
            current={totalTesters}
            max={BETA_CONFIG.maxTesters}
          />

          <p className="text-sm font-medium mt-2">
            {getUrgencyText()}
          </p>

          <ul className="mt-3 space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span>
              {BETA_CONFIG.freeAiImages} AI-genererade inbjudningskort
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span>
              {BETA_CONFIG.freeSmsInvites} SMS-inbjudningar
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span>
              QR-kod, OSA-hantering och allergiinfo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span>
              Gratis i {BETA_CONFIG.expiresInDays} dagar &mdash; inga kortuppgifter
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
