# 🎨 KALASKOLL UI/UX REFACTOR MASTERPLAN

> **Master Prompt för Claude Code Opus 4.5**
> Agera som ett team av seniora UI/UX-experter, frontend-arkitekter och SEO-specialister.
> Senast uppdaterad: 2026-01-31

---

## 🎯 UPPDRAGSBESKRIVNING

Du är nu ett team bestående av:
- **Sofia** — Senior UI Designer med 15 års erfarenhet av skandinavisk design
- **Marcus** — UX Lead specialiserad på mobile-first och micro-interactions
- **Emma** — Frontend-arkitekt expert på React, Next.js och animationer
- **Erik** — SEO/GEO-specialist med fokus på AI-sökmotorer och structured data

**Ert uppdrag:** Transformera KalasKoll från en funktionell app till en **visuellt unik, wow-ingivande upplevelse** som svenska föräldrar kommer älska och dela med varandra. Designen ska vara distinctiv — INTE se ut som "ännu en SaaS-template".

---

## 🌟 DESIGN-FILOSOFI: "FESTLIG SKANDINAVISK MINIMALISM"

### Kärnprincip: Lagom med Gnista

KalasKoll ska kännas som en **festlig överraskning inpackad i skandinavisk elegans**. 

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   85% LUGN NORDISK BAS  +  15% FESTLIG MAGI = WOW          │
│                                                             │
│   • Mjuka, varma vita bakgrunder                           │
│   • Generöst whitespace                                     │
│   • Subtila skuggor och djup                               │
│   • EXPLOSIONER av färg och animation vid rätt tillfällen  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### De 5 Wow-Principerna

1. **Överraskningsögonblick** — Animationer som triggas vid viktiga milstolpar (kalas skapat, RSVP bekräftat)
2. **Taktil Känsla** — Soft UI/Neumorphism på interaktiva element så de känns "klickbara"
3. **Storytelling Scrollning** — Parallax och scroll-triggade animationer som guidar användaren
4. **Personlig Touch** — Dynamiska element som reagerar på användarens data (barnets namn, tema)
5. **Micro-Delights** — Små överraskningar: konfetti, studsande ikoner, pulserande knappar

---

## 🎨 VISUELL IDENTITET

### Färgpalett (Implementera i globals.css med CSS Custom Properties)

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ═══════════════════════════════════════════════════════════
       KALASKOLL DESIGN SYSTEM - "Festlig Skandinavisk Minimalism"
       ═══════════════════════════════════════════════════════════ */
    
    /* --- FOUNDATION: Warm Nordic Base --- */
    --background: 40 20% 98%;           /* Varm off-white #FAF9F7 */
    --foreground: 220 15% 20%;          /* Mjuk kolgrå #2E3338 */
    
    /* --- SURFACES --- */
    --card: 0 0% 100%;                  /* Ren vit för kort */
    --card-foreground: 220 15% 20%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 15% 20%;
    
    /* --- MUTED TONES --- */
    --muted: 40 10% 94%;                /* Ljusgrå med värme */
    --muted-foreground: 220 10% 45%;
    
    /* --- PRIMARY: Konfetti Rosa (Huvudfärg) --- */
    --primary: 340 85% 65%;             /* Livlig rosa #F25C84 */
    --primary-foreground: 0 0% 100%;
    
    /* --- SECONDARY: Ballong Turkos --- */
    --secondary: 175 60% 45%;           /* Lekfull turkos #2DB3A3 */
    --secondary-foreground: 0 0% 100%;
    
    /* --- ACCENT: Celebration Gold --- */
    --accent: 45 95% 58%;               /* Festligt guld #F4C430 */
    --accent-foreground: 220 15% 20%;
    
    /* --- CELEBRATION PALETTE (för animationer) --- */
    --confetti-pink: 340 85% 65%;
    --confetti-blue: 200 80% 60%;
    --confetti-yellow: 45 95% 58%;
    --confetti-green: 150 60% 50%;
    --confetti-purple: 280 70% 60%;
    
    /* --- SEMANTIC COLORS --- */
    --success: 150 60% 45%;             /* Kommer! Grön */
    --success-foreground: 0 0% 100%;
    --warning: 35 90% 55%;              /* Väntar - Amber */
    --warning-foreground: 220 15% 20%;
    --destructive: 0 75% 55%;           /* Kommer inte - Röd */
    --destructive-foreground: 0 0% 100%;
    
    /* --- BORDER & RINGS --- */
    --border: 40 15% 88%;
    --input: 40 15% 88%;
    --ring: 340 85% 65%;
    
    /* --- RADIUS: Mjuka, lekfulla former --- */
    --radius: 1rem;                     /* 16px - generöst rundade */
    
    /* --- SHADOWS: Soft UI/Neumorphism --- */
    --shadow-soft: 0 4px 20px -2px hsl(220 15% 20% / 0.08);
    --shadow-medium: 0 8px 30px -4px hsl(220 15% 20% / 0.12);
    --shadow-lifted: 0 12px 40px -6px hsl(220 15% 20% / 0.15);
    --shadow-inner: inset 0 2px 4px hsl(220 15% 20% / 0.05);
    
    /* --- GRADIENTS --- */
    --gradient-celebration: linear-gradient(135deg, hsl(340 85% 65%), hsl(280 70% 60%));
    --gradient-warm: linear-gradient(180deg, hsl(40 20% 98%), hsl(40 15% 95%));
    --gradient-card-hover: linear-gradient(145deg, hsl(0 0% 100%), hsl(40 10% 97%));
  }
  
  .dark {
    --background: 220 20% 10%;
    --foreground: 40 10% 95%;
    --card: 220 18% 13%;
    --muted: 220 15% 18%;
    --muted-foreground: 220 10% 60%;
    /* ... fortsätt med dark mode värden */
  }
}
```

### Typografi (Inter + Playful Display)

```css
/* globals.css - fortsättning */

@layer base {
  /* Import Inter (skapad av svensken Rasmus Andersson!) */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  /* Playful display font för rubriker - valfritt alternativ */
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap');
  
  body {
    @apply font-sans antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11"; /* Inter stilistiska set */
  }
  
  /* Rubriker med personality */
  h1, h2, h3 {
    @apply font-bold tracking-tight;
    /* Använd Nunito för extra lekfullhet på stora rubriker */
  }
  
  /* Celebration headings - för viktiga ögonblick */
  .heading-celebration {
    @apply text-transparent bg-clip-text;
    background-image: var(--gradient-celebration);
  }
}

/* Type Scale */
:root {
  --text-xs: clamp(0.75rem, 1.5vw, 0.75rem);
  --text-sm: clamp(0.875rem, 1.8vw, 0.875rem);
  --text-base: clamp(1rem, 2vw, 1rem);           /* 16px min för iOS */
  --text-lg: clamp(1.125rem, 2.2vw, 1.25rem);
  --text-xl: clamp(1.25rem, 2.5vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 3vw, 2rem);
  --text-3xl: clamp(2rem, 4vw, 2.5rem);
  --text-4xl: clamp(2.5rem, 5vw, 3.5rem);        /* Hero text */
}
```

---

## 🚀 KRITISKA ANIMATIONER & MICRO-INTERACTIONS

### Installera Dependencies

```bash
pnpm add framer-motion @lottiefiles/react-lottie-player canvas-confetti
```

### Animation Utility Library

Skapa fil: `src/lib/animations.ts`

```typescript
// src/lib/animations.ts
import { Variants, Transition } from 'framer-motion';

// ═══════════════════════════════════════════════════════════
// KALASKOLL ANIMATION LIBRARY
// ═══════════════════════════════════════════════════════════

// --- SPRING PHYSICS (naturliga, lekfulla rörelser) ---
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 15,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

// --- FADE IN VARIANTS ---
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
    }
  },
};

export const fadeInScale: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: springGentle,
  },
};

// --- STAGGER CHILDREN ---
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: springGentle,
  },
};

// --- HOVER & TAP (för knappar och kort) ---
export const tapScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: springSnappy,
};

export const liftOnHover = {
  whileHover: { 
    y: -4, 
    boxShadow: "var(--shadow-lifted)",
  },
  transition: springGentle,
};

// --- CELEBRATION ANIMATIONS ---
export const celebrationPop: Variants = {
  hidden: { 
    scale: 0, 
    rotate: -180,
    opacity: 0,
  },
  visible: { 
    scale: 1, 
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 12,
    },
  },
};

export const confettiBurst: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.6, 1],
      ease: "easeOut",
    },
  },
};

// --- PAGE TRANSITIONS ---
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// --- SKELETON SHIMMER ---
export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};

// --- PULSE FOR ATTENTION ---
export const pulseAttention: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// --- SHAKE FOR ERRORS ---
export const shakeError: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// --- FLOATING ANIMATION (för dekorativa element) ---
export const floatingElement: Variants = {
  animate: {
    y: [0, -10, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
```

### Confetti Celebration Hook

Skapa fil: `src/hooks/useConfetti.ts`

```typescript
// src/hooks/useConfetti.ts
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireConfetti = () => {
    // Burst från mitten
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F25C84', '#2DB3A3', '#F4C430', '#8B5CF6', '#3B82F6'],
    });
  };

  const fireConfettiCannon = () => {
    // Kanoner från båda sidor
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#F25C84', '#2DB3A3', '#F4C430'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const fireStars = () => {
    // Stjärnor som faller ner
    confetti({
      particleCount: 50,
      spread: 360,
      ticks: 100,
      gravity: 0.5,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['#F4C430', '#FFD700', '#FFA500'],
    });
  };

  return { fireConfetti, fireConfettiCannon, fireStars };
}
```

---

## 📱 SIDA-FÖR-SIDA SPECIFIKATIONER

### 1. LOGIN & REGISTER SIDOR

**Mål:** Välkomnande första intryck med subtil wow-faktor.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     [Floating Balloons Animation - subtil bakgrund]        │
│                                                             │
│         ┌─────────────────────────────────────┐            │
│         │                                     │            │
│         │      🎈 KalasKoll                   │            │
│         │                                     │            │
│         │      Välkommen tillbaka!            │            │
│         │      Logga in för att planera       │            │
│         │      magiska kalas                  │            │
│         │                                     │            │
│         │      ┌───────────────────────┐     │            │
│         │      │ E-post                │     │            │
│         │      └───────────────────────┘     │            │
│         │                                     │            │
│         │      ┌───────────────────────┐     │            │
│         │      │ Lösenord              │     │            │
│         │      └───────────────────────┘     │            │
│         │                                     │            │
│         │      [====== Logga in ======]      │  ← Gradient
│         │                                     │            │
│         │      ─────── eller ───────         │            │
│         │                                     │            │
│         │      [G] Fortsätt med Google       │            │
│         │                                     │            │
│         │      Har du inget konto?           │            │
│         │      Skapa konto →                 │            │
│         │                                     │            │
│         └─────────────────────────────────────┘            │
│                                                             │
│         Floating confetti particles (sparse)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Fil:** `src/app/(auth)/login/page.tsx`

```tsx
// src/app/(auth)/login/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FloatingParticles } from '@/components/decorative/FloatingParticles';
import { Logo } from '@/components/shared/Logo';
import { fadeInScale, staggerContainer, staggerItem, tapScale } from '@/lib/animations';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-warm" />
      <FloatingParticles />
      
      {/* Login Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInScale}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-lifted border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center space-y-4 pb-2">
            <motion.div 
              className="mx-auto"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Logo className="h-16 w-auto" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Välkommen tillbaka!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Logga in för att planera magiska kalas
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <motion.form 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  className="h-12 text-base" // Förhindrar iOS zoom
                />
              </motion.div>
              
              <motion.div variants={staggerItem} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Lösenord</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Glömt lösenord?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 text-base"
                />
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <motion.div {...tapScale}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Logga in'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div variants={staggerItem} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-muted-foreground">
                    eller
                  </span>
                </div>
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    {/* Google icon SVG */}
                  </svg>
                  Fortsätt med Google
                </Button>
              </motion.div>
            </motion.form>
            
            <motion.p 
              variants={staggerItem}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              Har du inget konto?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Skapa konto →
              </Link>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
```

**Floating Particles Component:**

```tsx
// src/components/decorative/FloatingParticles.tsx
'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const PARTICLE_COLORS = [
  'bg-primary/20',
  'bg-secondary/20',
  'bg-accent/20',
  'bg-purple-400/20',
];

export function FloatingParticles({ count = 15 }: { count?: number }) {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.color} blur-xl`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
```

---

### 2. DASHBOARD

**Mål:** Känslan av att öppna en festlig present — informativt men glädjefyllt.

**Layout & Wow-element:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ 🎈 KalasKoll          Mina kalas   Klas    [Logga ut]         │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ HERO WELCOME (personlig)                                            │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │                                                               │   │
│ │   Hej Klas! 👋                                               │   │
│ │                                                               │   │
│ │   Du har 1 kalas på gång                                     │   │
│ │   Alexander fyller 6 år om 56 dagar! 🎂                      │   │
│ │                                                               │   │
│ │   [✨ Skapa nytt kalas]                                      │   │
│ │                                                               │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ STATISTIK (Bento Grid med animation)                                │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│ │   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │        │
│ │   │ 🎉 1    │   │ │   │ ✅ 8    │   │ │   │ ⏳ 12   │   │        │
│ │   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │        │
│ │   Kommande      │ │   Har svarat    │ │   Väntar svar   │        │
│ │   kalas         │ │   JA!           │ │                 │        │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                      │
│ MINA BARN (Horisontell scroll med kort)                             │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Mina barn                              [+ Lägg till barn]     │   │
│ │                                                               │   │
│ │ ┌───────────┐ ┌───────────┐ ┌ ─ ─ ─ ─ ─┐                    │   │
│ │ │   👦      │ │   👧      │ │           │                    │   │
│ │ │ Alexander │ │   Emma    │ │   + Nytt  │                    │   │
│ │ │   5 år    │ │   3 år    │ │    barn   │                    │   │
│ │ └───────────┘ └───────────┘ └ ─ ─ ─ ─ ─┘                    │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ MINA KALAS (Lista med rika kort)                                    │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Mina kalas                                                    │   │
│ │                                                               │   │
│ │ ┌─────────────────────────────────────────────────────────┐  │   │
│ │ │ ┌─────────┐                                             │  │   │
│ │ │ │ [TEMA]  │  Alexanders kalas              🟢 Kommande  │  │   │
│ │ │ │  BILD   │  📅 28 mars 2026 · 12:00-15:00              │  │   │
│ │ │ │         │  📍 Leo's Lekland                           │  │   │
│ │ │ └─────────┘                                             │  │   │
│ │ │                                                         │  │   │
│ │ │  ┌────────┐ ┌────────┐ ┌────────┐                      │  │   │
│ │ │  │ ✅ 8   │ │ ❌ 2   │ │ ⏳ 10  │   [Se detaljer →]    │  │   │
│ │ │  │ Kommer │ │ Nej    │ │ Väntar │                      │  │   │
│ │ │  └────────┘ └────────┘ └────────┘                      │  │   │
│ │ └─────────────────────────────────────────────────────────┘  │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Fil:** `src/app/(dashboard)/dashboard/page.tsx`

```tsx
// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, MapPin, Plus, PartyPopper, Users, Clock } from 'lucide-react';
import { 
  staggerContainer, 
  staggerItem, 
  fadeInUp, 
  liftOnHover,
  tapScale 
} from '@/lib/animations';
import { CountUpNumber } from '@/components/shared/CountUpNumber';

export default function DashboardPage() {
  // Data skulle komma från server/hooks
  const user = { name: 'Klas' };
  const stats = { upcoming: 1, attending: 8, pending: 12 };
  const children = [{ name: 'Alexander', age: 5 }];
  const parties = [
    {
      id: '1',
      childName: 'Alexander',
      theme: 'disco',
      date: '28 mars 2026',
      time: '12:00-15:00',
      location: "Leo's Lekland",
      stats: { attending: 8, declined: 2, pending: 10 },
      daysUntil: 56,
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8 pb-12"
    >
      {/* Hero Welcome Section */}
      <motion.section variants={fadeInUp} className="relative overflow-hidden">
        <Card className="border-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Hej {user.name}! 
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    👋
                  </motion.span>
                </motion.h1>
                <p className="text-lg text-muted-foreground">
                  Du har <span className="font-semibold text-foreground">{stats.upcoming} kalas</span> på gång
                </p>
                {parties[0] && (
                  <motion.p 
                    className="text-base flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="text-2xl">🎂</span>
                    {parties[0].childName} fyller {children[0].age + 1} år om{' '}
                    <span className="font-bold text-primary">{parties[0].daysUntil} dagar</span>!
                  </motion.p>
                )}
              </div>
              
              <motion.div {...tapScale}>
                <Button 
                  asChild
                  size="lg" 
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/kalas/new">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Skapa nytt kalas
                  </Link>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Stats Bento Grid */}
      <motion.section variants={staggerItem}>
        <div className="grid grid-cols-3 gap-4">
          <StatCard 
            icon={<PartyPopper className="w-6 h-6" />}
            value={stats.upcoming}
            label="Kommande kalas"
            color="primary"
          />
          <StatCard 
            icon={<Users className="w-6 h-6" />}
            value={stats.attending}
            label="Har svarat JA!"
            color="success"
          />
          <StatCard 
            icon={<Clock className="w-6 h-6" />}
            value={stats.pending}
            label="Väntar svar"
            color="warning"
          />
        </div>
      </motion.section>

      {/* Children Section */}
      <motion.section variants={staggerItem} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mina barn</h2>
          <Button variant="ghost" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Lägg till barn
          </Button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
          {children.map((child, index) => (
            <motion.div
              key={child.name}
              variants={staggerItem}
              {...liftOnHover}
              className="snap-start"
            >
              <Card className="w-[140px] flex-shrink-0 cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-3 flex items-center justify-center text-3xl">
                    {index === 0 ? '👦' : '👧'}
                  </div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-muted-foreground">{child.age} år</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {/* Add Child Card */}
          <motion.div variants={staggerItem} className="snap-start">
            <Card className="w-[140px] flex-shrink-0 border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nytt barn</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Parties List */}
      <motion.section variants={staggerItem} className="space-y-4">
        <h2 className="text-xl font-semibold">Mina kalas</h2>
        
        <motion.div variants={staggerContainer} className="space-y-4">
          {parties.map((party) => (
            <motion.div 
              key={party.id} 
              variants={staggerItem}
              {...liftOnHover}
            >
              <PartyCard party={party} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  color: 'primary' | 'success' | 'warning';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <div className="text-3xl font-bold">
          <CountUpNumber value={value} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

// Party Card Component  
function PartyCard({ party }: { party: any }) {
  return (
    <Card className="overflow-hidden hover:border-primary/30 transition-colors">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Theme Image */}
          <div className="w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20 relative">
            {/* Här kommer temabilden */}
            <Badge className="absolute top-2 right-2 md:top-auto md:bottom-2 md:right-2">
              {party.theme}
            </Badge>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{party.childName}s kalas</h3>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Kommande
                  </Badge>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {party.date} · {party.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {party.location}
                  </span>
                </div>
              </div>
              
              {/* Stats Mini */}
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{party.stats.attending}</div>
                  <div className="text-xs text-muted-foreground">Kommer</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-destructive">{party.stats.declined}</div>
                  <div className="text-xs text-muted-foreground">Nej</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">{party.stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Väntar</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button asChild variant="ghost">
                <Link href={`/kalas/${party.id}`}>
                  Se detaljer →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**CountUp Number Component:**

```tsx
// src/components/shared/CountUpNumber.tsx
'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function CountUpNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
```

---

### 3. SKAPA NYTT KALAS (Multi-Step Wizard)

**Mål:** Guidad upplevelse som känns som att packa upp presenter, steg för steg.

**Fil:** `src/app/(dashboard)/kalas/new/page.tsx`

Se separat implementation med:
- Progress indicator med animerade steg
- Smooth transitions mellan steg
- Validering med visuell feedback
- Celebration animation när komplett

---

### 4. PUBLIK RSVP-SIDA (KRITISK - 99% MOBIL)

**Mål:** Under 10 sekunder att svara. Wow-känsla utan att sakta ner.

```
┌─────────────────────────────────────┐
│                                     │
│    [HERO BILD MED TEMA - 35vh]     │
│                                     │
│    ┌─────────────────────────┐     │
│    │  🎂 Alexanders          │     │
│    │     6-årskalas!         │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📅  Lördag 28 mars                │
│      kl 12:00 - 15:00              │
│                                     │
│  📍  Leo's Lekland                 │
│      Mölndalvägen 95, Göteborg     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Ditt namn                          │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kan ni komma?                      │
│                                     │
│  ┌───────────────┐ ┌───────────┐   │
│  │               │ │           │   │
│  │   ✓ JA!      │ │   ✗ NEJ   │   │
│  │   Vi kommer! │ │  Tyvärr   │   │
│  │               │ │           │   │
│  │   [GRÖN]     │ │  [GRÅ]    │   │
│  └───────────────┘ └───────────────┘   │
│                                     │
│  [Om JA vald - slide down]         │
│  Hur många barn kommer?            │
│  ┌──────────────────────────────┐  │
│  │  [ - ]    2 barn    [ + ]    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  + Lägg till allergier       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │       SKICKA SVAR ✓          │  │← 56px, full bredd
│  │                              │  │
│  └──────────────────────────────┘  │
│                                     │
│  ─────────────────────────────────  │
│  Powered by KalasKoll              │
│                                     │
└─────────────────────────────────────┘
```

**SUCCESS STATE (efter inskick):**

```
┌─────────────────────────────────────┐
│                                     │
│         [CONFETTI ANIMATION]        │
│                                     │
│              ✓                      │
│                                     │
│         Tack för ditt svar!         │
│                                     │
│    Vi har meddelat Alexanders       │
│    föräldrar att ni kommer!         │
│                                     │
│    ──────────────────────────       │
│                                     │
│    📅 Lördag 28 mars, 12:00        │
│    📍 Leo's Lekland                 │
│                                     │
│    ┌────────────────────────┐      │
│    │ 📅 Lägg till i kalender │      │
│    └────────────────────────┘      │
│                                     │
│    ┌────────────────────────┐      │
│    │ 📤 Dela med familjen   │      │
│    └────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Fil:** `src/app/r/[token]/page.tsx`

```tsx
// src/app/r/[token]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RsvpForm } from '@/components/forms/RsvpForm';
import { getPartyByToken } from '@/lib/supabase/queries';

// Dynamisk metadata för SEO och delning
export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const party = await getPartyByToken(params.token);
  
  if (!party) return { title: 'Inbjudan hittades inte' };

  return {
    title: `${party.child_name}s kalas - OSA`,
    description: `Du är inbjuden till ${party.child_name}s ${party.child_age}-årskalas! Svara på inbjudan här.`,
    openGraph: {
      title: `🎂 ${party.child_name}s ${party.child_age}-årskalas!`,
      description: `${party.date_formatted} på ${party.location}`,
      images: [party.theme_image_url || '/og-rsvp-default.png'],
    },
    robots: {
      index: false, // Privata inbjudningar ska inte indexeras
    },
  };
}

export default async function RsvpPage({ params }: { params: { token: string } }) {
  const party = await getPartyByToken(params.token);
  
  if (!party) {
    notFound();
  }

  // Structured Data för SEO (Event schema)
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${party.child_name}s ${party.child_age}-årskalas`,
    startDate: party.start_datetime,
    endDate: party.end_datetime,
    location: {
      '@type': 'Place',
      name: party.location,
      address: party.address,
    },
    organizer: {
      '@type': 'Person',
      name: party.parent_name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <RsvpForm party={party} token={params.token} />
    </>
  );
}
```

**RsvpForm Component:**

```tsx
// src/components/forms/RsvpForm.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Check, X, Plus, Minus, Loader2 } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { 
  fadeInUp, 
  staggerContainer, 
  staggerItem, 
  tapScale,
  celebrationPop 
} from '@/lib/animations';
import { cn } from '@/lib/utils';

interface RsvpFormProps {
  party: {
    child_name: string;
    child_age: number;
    date_formatted: string;
    time_formatted: string;
    location: string;
    address?: string;
    theme: string;
    theme_image_url?: string;
    description?: string;
  };
  token: string;
}

type RsvpStatus = 'idle' | 'submitting' | 'success' | 'error';

export function RsvpForm({ party, token }: RsvpFormProps) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [childCount, setChildCount] = useState(1);
  const [showAllergies, setShowAllergies] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [status, setStatus] = useState<RsvpStatus>('idle');
  const { fireConfettiCannon } = useConfetti();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || attending === null) return;

    setStatus('submitting');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name,
          attending,
          child_count: attending ? childCount : 0,
          allergies: attending ? allergies : null,
        }),
      });

      if (!response.ok) throw new Error('Något gick fel');

      setStatus('success');
      
      // Celebration!
      if (attending) {
        setTimeout(() => fireConfettiCannon(), 300);
      }
    } catch (error) {
      setStatus('error');
    }
  };

  // Success State
  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <motion.div 
          className="flex-1 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Card className="w-full max-w-md text-center shadow-lifted">
            <CardContent className="py-12 px-6">
              <motion.div variants={celebrationPop}>
                <div className={cn(
                  "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
                  attending ? "bg-success/20" : "bg-muted"
                )}>
                  {attending ? (
                    <Check className="w-10 h-10 text-success" />
                  ) : (
                    <X className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-2xl font-bold mb-2"
              >
                Tack för ditt svar!
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-muted-foreground mb-8"
              >
                {attending 
                  ? `Vi har meddelat ${party.child_name}s föräldrar att ni kommer!`
                  : `Vi har meddelat ${party.child_name}s föräldrar.`
                }
              </motion.p>

              {attending && (
                <motion.div variants={staggerContainer} className="space-y-4">
                  <motion.div 
                    variants={fadeInUp}
                    className="p-4 bg-muted/50 rounded-xl text-left"
                  >
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{party.date_formatted}, {party.time_formatted}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{party.location}</span>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp}>
                    <Button variant="outline" className="w-full h-12">
                      <Calendar className="w-4 h-4 mr-2" />
                      Lägg till i kalender
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <footer className="py-4 text-center text-sm text-muted-foreground">
          Powered by <span className="font-medium">KalasKoll</span>
        </footer>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Image */}
      <div 
        className="h-[35vh] min-h-[200px] relative bg-cover bg-center"
        style={{ 
          backgroundImage: party.theme_image_url 
            ? `url(${party.theme_image_url})` 
            : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg opacity-90">Du är inbjuden till</p>
            <h1 className="text-3xl md:text-4xl font-bold">
              {party.child_name}s {party.child_age}-årskalas! 🎂
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <motion.div 
        className="flex-1 bg-background -mt-4 rounded-t-3xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-md mx-auto p-6">
          {/* Party Details */}
          <div className="flex flex-col gap-2 mb-8 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{party.date_formatted}</p>
                <p className="text-muted-foreground">{party.time_formatted}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">{party.location}</p>
                {party.address && (
                  <p className="text-muted-foreground">{party.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Ditt namn</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anna Svensson"
                className="h-14 text-base"
                required
              />
            </div>

            {/* Attending Selection */}
            <div className="space-y-3">
              <Label className="text-base">Kan ni komma?</Label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={cn(
                    "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                    attending === true
                      ? "border-success bg-success/10 text-success"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">✓</span>
                  <span className="font-semibold">Ja, vi kommer!</span>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={cn(
                    "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                    attending === false
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">✗</span>
                  <span className="font-semibold">Tyvärr, nej</span>
                </motion.button>
              </div>
            </div>

            {/* Conditional Fields (when attending) */}
            <AnimatePresence>
              {attending === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  {/* Child Count */}
                  <div className="space-y-3">
                    <Label className="text-base">Hur många barn kommer?</Label>
                    <div className="flex items-center justify-center gap-6 p-4 bg-muted/50 rounded-xl">
                      <motion.button
                        type="button"
                        onClick={() => setChildCount(Math.max(1, childCount - 1))}
                        className="w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center"
                        whileTap={{ scale: 0.9 }}
                        disabled={childCount <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </motion.button>
                      <span className="text-2xl font-bold min-w-[80px] text-center">
                        {childCount} barn
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => setChildCount(Math.min(10, childCount + 1))}
                        className="w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center"
                        whileTap={{ scale: 0.9 }}
                        disabled={childCount >= 10}
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Allergies Toggle */}
                  <div>
                    {!showAllergies ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAllergies(true)}
                        className="w-full h-12 border border-dashed"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Lägg till allergier/önskemål
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="allergies">Allergier/önskemål (valfritt)</Label>
                        <Textarea
                          id="allergies"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder="T.ex. nötallergi, glutenfri..."
                          className="min-h-[80px]"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div {...tapScale}>
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500"
                disabled={!name || attending === null || status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Skicka svar
                    <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>

            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-center text-sm"
              >
                Något gick fel. Försök igen.
              </motion.p>
            )}
          </form>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        Powered by <span className="font-medium text-foreground">KalasKoll</span>
      </footer>
    </div>
  );
}
```

---

## 🔍 SEO & GEO/AIO OPTIMERING

### Structured Data (JSON-LD)

Skapa fil: `src/lib/seo/structured-data.ts`

```typescript
// src/lib/seo/structured-data.ts

// WebSite Schema (för huvudsidan)
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KalasKoll',
    url: 'https://kalaskoll.se',
    description: 'Svensk webapp för att hantera barnkalas-inbjudningar med AI-genererade kort och QR-kod OSA.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kalaskoll.se/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

// Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KalasKoll',
    url: 'https://kalaskoll.se',
    logo: 'https://kalaskoll.se/logo.png',
    sameAs: [
      'https://instagram.com/kalaskoll',
      'https://facebook.com/kalaskoll',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hej@kalaskoll.se',
      contactType: 'customer service',
      availableLanguage: 'Swedish',
    },
  };
}

// SoftwareApplication Schema (för app-listningar)
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KalasKoll',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };
}

// Event Schema (för kalas)
export function generateEventSchema(party: {
  childName: string;
  childAge: number;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${party.childName}s ${party.childAge}-årskalas`,
    startDate: party.startDate,
    endDate: party.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: party.location,
      address: party.address,
    },
    description: party.description || `Barnkalas för ${party.childName} som fyller ${party.childAge} år.`,
  };
}

// FAQ Schema (för landningssidan)
export function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Hur fungerar KalasKoll?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KalasKoll låter dig skapa digitala inbjudningar med QR-kod. Gästerna skannar koden och svarar direkt via mobilen. Du ser alla svar i realtid.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kostar KalasKoll något?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KalasKoll är gratis att använda för grundfunktionerna. Premium-funktioner som AI-genererade bilder finns tillgängliga mot kostnad.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hur hanteras allergier?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gäster kan ange allergier vid OSA. All allergiinformation lagras GDPR-kompatibelt med samtycke och raderas automatiskt efter kalaset.',
        },
      },
    ],
  };
}

// HowTo Schema (för guide-sidor)
export function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så planerar du ett barnkalas med KalasKoll',
    description: 'Steg-för-steg guide för att skapa och hantera barnkalas-inbjudningar.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Skapa konto',
        text: 'Registrera dig gratis på KalasKoll med e-post eller Google.',
      },
      {
        '@type': 'HowToStep',
        name: 'Lägg till ditt barn',
        text: 'Fyll i barnets namn och ålder i din profil.',
      },
      {
        '@type': 'HowToStep',
        name: 'Skapa kalas',
        text: 'Välj tema, datum, plats och skapa din inbjudan.',
      },
      {
        '@type': 'HowToStep',
        name: 'Dela inbjudan',
        text: 'Skriv ut QR-koden eller skicka via SMS/e-post.',
      },
      {
        '@type': 'HowToStep',
        name: 'Samla in svar',
        text: 'Se alla OSA-svar i realtid i din dashboard.',
      },
    ],
  };
}
```

### Metadata Configuration

Uppdatera: `src/app/layout.tsx`

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { generateWebsiteSchema, generateOrganizationSchema, generateSoftwareApplicationSchema } from '@/lib/seo/structured-data';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kalaskoll.se'),
  title: {
    default: 'KalasKoll – Smarta barnkalas-inbjudningar med QR-kod',
    template: '%s | KalasKoll',
  },
  description: 'Skapa digitala barnkalas-inbjudningar med QR-kod. Gäster svarar via mobilen, du ser OSA i realtid. Hantera allergier GDPR-säkert. Gratis att börja!',
  keywords: [
    'barnkalas',
    'inbjudningar',
    'kalas',
    'barnkalas inbjudan',
    'QR-kod inbjudan',
    'OSA barnkalas',
    'kalas-app',
    'digital inbjudan',
    'barnkalas planering',
    'födelsedagskalas',
    'allergi kalas',
  ],
  authors: [{ name: 'KalasKoll' }],
  creator: 'KalasKoll',
  publisher: 'KalasKoll',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://kalaskoll.se',
    siteName: 'KalasKoll',
    title: 'KalasKoll – Smarta barnkalas-inbjudningar',
    description: 'Skapa digitala barnkalas-inbjudningar med QR-kod. Gästerna svarar via mobilen!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KalasKoll - Digitala barnkalas-inbjudningar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KalasKoll – Smarta barnkalas-inbjudningar',
    description: 'Skapa digitala inbjudningar med QR-kod. Gästerna svarar via mobilen!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kalaskoll.se',
    languages: {
      'sv-SE': 'https://kalaskoll.se',
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className={inter.variable}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSoftwareApplicationSchema()),
          }}
        />
        
        {/* Preconnect för prestanda */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### GEO/AIO Content Optimization

**Principer för AI-vänligt innehåll:**

1. **Semantisk HTML struktur**
```tsx
// Använd alltid semantiska element
<article>
  <header>
    <h1>Huvudrubrik</h1>
    <p className="lead">Sammanfattning i första 100 orden</p>
  </header>
  <section>
    <h2>Delrubrik</h2>
    <p>Innehåll...</p>
  </section>
</article>
```

2. **Lead med svaret först**
```tsx
// Landningssida - första stycket ska svara på "Vad är KalasKoll?"
<p className="text-xl">
  KalasKoll är en svensk webapp som gör det enkelt att hantera 
  barnkalas-inbjudningar med QR-kod och digital OSA-hantering.
</p>
```

3. **FAQ-sektioner med Schema**
```tsx
// Inkludera FAQ som både synlig och JSON-LD
<section>
  <h2>Vanliga frågor</h2>
  <dl>
    <dt>Hur fungerar KalasKoll?</dt>
    <dd>Du skapar en inbjudan, skriver ut QR-koden...</dd>
  </dl>
</section>
```

---

## 📋 IMPLEMENTATION ROADMAP

### Fas 1: Foundation (Vecka 1)
- [ ] Installera dependencies (framer-motion, canvas-confetti)
- [ ] Implementera design tokens i globals.css
- [ ] Skapa animations.ts utility library
- [ ] Skapa FloatingParticles component
- [ ] Skapa CountUpNumber component
- [ ] Uppdatera shadcn/ui components med nya stilar

### Fas 2: Kritiska Sidor (Vecka 2)
- [ ] RSVP-sida (högst prioritet - 99% mobil)
- [ ] Login/Register med animationer
- [ ] Dashboard med Bento-grid och statistik
- [ ] useConfetti hook

### Fas 3: Kärnfunktioner (Vecka 3)
- [ ] Skapa kalas wizard med multi-step
- [ ] Template picker med animationer
- [ ] Kalas-detaljsida med delning
- [ ] Gästlista med realtidsuppdateringar

### Fas 4: Polish & SEO (Vecka 4)
- [ ] Structured data implementation
- [ ] Metadata optimization
- [ ] Loading skeletons
- [ ] Error states med animationer
- [ ] Accessibility audit (WCAG 2.2 AA)
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Reduced motion support

---

## 🧪 TESTNING & VALIDERING

### Checklista före deploy

```markdown
## ✅ UI/UX Checklista

### Responsivitet
- [ ] Mobil (375px): Alla element är touch-vänliga (44px minimum)
- [ ] Tablet (768px): Layout anpassas korrekt
- [ ] Desktop (1024px+): Utnyttjar bredden väl

### Animationer
- [ ] Alla animationer är under 300ms
- [ ] prefers-reduced-motion respekteras
- [ ] Inga janky/laggy animationer

### Formulär
- [ ] Alla inputs är minst 16px (ingen iOS zoom)
- [ ] Validering ger tydlig feedback
- [ ] Error states är synliga och tydliga

### Tillgänglighet
- [ ] Kontrast 4.5:1 för text
- [ ] Fokusindikatorer synliga
- [ ] Screen reader-vänlig markup

### Prestanda
- [ ] Lighthouse Performance 90+
- [ ] RSVP-sida laddas under 2 sekunder på 3G
- [ ] Bilder är optimerade (WebP)

### SEO
- [ ] Alla sidor har unika title/description
- [ ] Structured data validerar i Google Rich Results Test
- [ ] sitemap.xml och robots.txt fungerar
```

---

## 🎉 SAMMANFATTNING

Denna refactor-plan transformerar KalasKoll från en funktionell app till en **minnesvärd upplevelse** som:

1. **Visuellt sticker ut** med festlig skandinavisk design
2. **Känns magisk** genom genomtänkta micro-interactions
3. **Konverterar besökare** med optimerad RSVP-upplevelse
4. **Rankas bra** i både traditionella och AI-sökmotorer
5. **Fungerar perfekt** på alla enheter

**Kom ihåg:** Varje animation, varje färgval, varje pixel ska tjäna ett syfte — att göra kalasplanering roligare för svenska föräldrar.

---

*Lycka till med implementationen! 🎈*
