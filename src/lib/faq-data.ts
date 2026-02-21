export interface FaqItem {
  q: string;
  a: string;
  featured?: boolean;
  category: 'basics' | 'invitations' | 'security' | 'other';
}

export const faqItems: FaqItem[] = [
  {
    q: 'Kostar det något att använda KalasKoll?',
    a: 'Grundfunktionerna är helt gratis. Premium-funktioner som AI-genererade inbjudningar kostar 49 kr per kalas.',
    featured: true,
    category: 'basics',
  },
  {
    q: 'Hur skickar jag inbjudningar?',
    a: 'Du kan skicka via e-post eller dela en länk direkt. Vill du ge fysiska inbjudningar? Varje kalas har en unik QR-kod du kan skriva ut. Med Guldkalas kan du även skicka via SMS. Gästerna svarar direkt via mobilen – inget konto krävs.',
    featured: true,
    category: 'invitations',
  },
  {
    q: 'Är allergiinformationen säker?',
    a: 'Ja. Allergidata lagras separat och krypterat, kräver samtycke, och raderas automatiskt 7 dagar efter kalaset i enlighet med GDPR.',
    featured: true,
    category: 'security',
  },
  {
    q: 'Kan jag se gästlistan i realtid?',
    a: 'Ja! Så snart en gäst svarar uppdateras din gästlista direkt. Du ser vilka som kommer, allergier och kontaktuppgifter.',
    featured: true,
    category: 'basics',
  },
  {
    q: 'Hur många kalas kan jag ha samtidigt?',
    a: 'Du kan ha upp till 3 aktiva kalas samtidigt. När ett kalas passerat frigörs platsen automatiskt.',
    category: 'basics',
  },
  {
    q: 'Vad händer med mitt kalas efter kalasdagen?',
    a: 'Kalaset flyttas automatiskt till "Tidigare kalas" i din dashboard. Du kan se sammanfattningen i 30 dagar. Därefter raderas all data \u2014 inklusive gästlistor, OSA-svar och kontaktuppgifter \u2014 automatiskt i enlighet med GDPR.',
    category: 'other',
  },
  {
    q: 'Kan jag ta bort ett kalas själv?',
    a: 'Ja. Du kan ta bort ett kalas när som helst. Det hamnar i papperskorgen och försvinner helt efter 30 dagar.',
    category: 'other',
  },
  {
    q: 'Vad kostar SMS-inbjudningar?',
    a: 'SMS-inbjudningar ingår i Guldkalas. Du kan skicka upp till 15 SMS per kalas.',
    category: 'invitations',
  },
  {
    q: 'Vem ligger bakom KalasKoll?',
    a: 'KalasKoll är skapat av Klas Olsson i Göteborg. Idén föddes ur ett verkligt behov \u2013 att bjuda in 20 förskolebarn till ett kalas utan kaos med papperslappar och SMS. Allt nödvändigt är gratis, utan reklam.',
    category: 'other',
  },
];

export const faqCategories = [
  { id: 'basics' as const, label: 'Grundläggande' },
  { id: 'invitations' as const, label: 'Inbjudningar' },
  { id: 'security' as const, label: 'Säkerhet & GDPR' },
  { id: 'other' as const, label: 'Övrigt' },
];
