'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check, Sparkles } from 'lucide-react';
import { isStandaloneApp, isIOS, triggerHaptic } from '@/lib/mobile-utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = isStandaloneApp();
    setIsStandalone(standalone);
    setIsIOSDevice(isIOS());

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('gymbro_pwa_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 3 * 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }

    // Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show if we have deferred prompt OR on iOS
  if (!deferredPrompt && !isIOSDevice) {
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic('medium');

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIOSDevice) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    setIsDismissed(true);
    localStorage.setItem('gymbro_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Non-intrusive Mobile Banner */}
      <div className="fixed top-16 inset-x-3 z-30 lg:hidden animate-slide-down">
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-emerald-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 truncate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/icons/icon.svg" 
              alt="GymBro App Icon" 
              className="w-10 h-10 rounded-xl shrink-0 ring-1 ring-emerald-500/40"
            />
            <div className="truncate">
              <div className="text-xs font-black text-white flex items-center gap-1">
                Install GymBro App
                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                  PWA
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                Full-screen experience with quick logging
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Add GymBro to Home Screen</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Install GymBro on your iPhone for the full native mobile app experience without going to the App Store:
            </p>

            <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  Tap the <span className="font-bold text-white flex-inline items-center gap-1">Share button <Share className="w-3 h-3 inline text-sky-400" /></span> at the bottom of Safari.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  Scroll down and tap <span className="font-bold text-white">Add to Home Screen <PlusSquare className="w-3 h-3 inline text-emerald-400" /></span>.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  Tap <span className="font-bold text-emerald-400">Add</span> in the top right. Launch GymBro anytime from your app drawer!
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
