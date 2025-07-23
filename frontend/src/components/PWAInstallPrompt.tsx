import { useEffect, useState } from 'react';

import { Download, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installata');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-slate-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-cyan-400 font-semibold text-sm">
            Installa Giorgio
          </h3>
          <p className="text-slate-300 text-xs mt-1">
            Aggiungi Giorgio alla schermata home per un accesso rapido
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Download className="w-4 h-4 mr-1" />
            Installa
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
