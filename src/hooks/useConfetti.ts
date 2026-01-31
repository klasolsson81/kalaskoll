import confetti from 'canvas-confetti';

const COLORS = ['#F25C84', '#2DB3A3', '#F4C430', '#8B5CF6', '#3B82F6'];

export function useConfetti() {
  const fireConfetti = () => {
    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: COLORS,
    });
  };

  const fireConfettiCannon = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: COLORS,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: COLORS,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return { fireConfetti, fireConfettiCannon };
}
