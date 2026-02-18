'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Camera, Send, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const NUDGE_MESSAGES = [
  'Hittade en bugg?',
  'Berätta vad du tycker!',
  'Vi lyssnar!',
  'Förslag? Tipsa oss!',
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [nudgeText, setNudgeText] = useState(NUDGE_MESSAGES[0]);
  const [nudgeVisible, setNudgeVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Rotate nudge text at gentle intervals
  const rotateNudge = useCallback(() => {
    setNudgeVisible(false);
    setTimeout(() => {
      setNudgeText((prev) => {
        const idx = NUDGE_MESSAGES.indexOf(prev);
        return NUDGE_MESSAGES[(idx + 1) % NUDGE_MESSAGES.length];
      });
      setNudgeVisible(true);
    }, 300);
  }, []);

  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(rotateNudge, 8000);
    return () => clearInterval(interval);
  }, [isOpen, rotateNudge]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          convertFileToBase64(file);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertFileToBase64(file);
    }
  };

  const convertFileToBase64 = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Bilden är för stor (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target?.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          screenshot,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          honeypot: honeypotRef.current?.value || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      setStatus('success');

      setTimeout(() => {
        setMessage('');
        setScreenshot(null);
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Kunde inte skicka feedback');
    }
  };

  return (
    <>
      {/* Floating feedback button — pill shape with animated gradient border */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-50',
          isOpen && 'hidden',
        )}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="group relative rounded-2xl p-[2px] transition-transform hover:scale-105 active:scale-95"
          aria-label="Skicka feedback"
        >
          {/* Animated gradient border */}
          <span className="absolute inset-0 rounded-2xl bg-[length:300%_300%] animate-[gradient-shift_4s_ease_infinite] bg-[linear-gradient(135deg,oklch(0.55_0.19_255),oklch(0.65_0.22_310),oklch(0.60_0.20_170),oklch(0.55_0.19_255))]" />

          {/* Inner content */}
          <span className="relative flex flex-col items-start gap-0.5 rounded-[14px] bg-white px-4 py-2.5 shadow-lg">
            <span className="text-sm font-semibold text-foreground">
              Skicka Feedback
            </span>
            <span
              className={cn(
                'text-[11px] text-muted-foreground transition-opacity duration-300',
                nudgeVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              {nudgeText}
            </span>
          </span>
        </button>
      </div>

      {/* Feedback panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 glass-card border rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-white/50">
            <h3 className="font-semibold font-display">Skicka feedback</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium">Tack för din feedback!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vi uppskattar att du hjälper oss bli bättre.
                </p>
              </div>
            ) : (
              <>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onPaste={handlePaste}
                  placeholder={'Beskriv vad du tycker, hittade en bugg, eller har ett förslag...\n\nTips: Klistra in en skärmdump med Ctrl+V / Cmd+V'}
                  className="min-h-[120px] resize-none"
                  disabled={status === 'submitting'}
                />
                {/* Honeypot — hidden from real users, bots fill it in */}
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
                />

                {/* Screenshot preview */}
                {screenshot && (
                  <div className="relative mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshot}
                      alt="Screenshot"
                      className="rounded-lg border max-h-32 w-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setScreenshot(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Error message */}
                {errorMessage && (
                  <p className="text-sm text-destructive mt-2">{errorMessage}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === 'submitting'}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Lägg till bild
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!message.trim() || status === 'submitting'}
                    className="flex-1"
                  >
                    {status === 'submitting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Skicka
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
