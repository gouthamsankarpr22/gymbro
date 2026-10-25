/**
 * Mobile Device, PWA, and Haptics Utilities for GymBro Mobile Experience
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Triggers native vibration haptic feedback when running on mobile devices.
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(24);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 40, 30]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      case 'error':
        navigator.vibrate([40, 60, 40, 60, 40]);
        break;
    }
  } catch {
    // Graceful fallback if permission is restricted
  }
}

/**
 * Checks whether the app is currently running in standalone PWA or native webview mode.
 */
export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari standalone flag
    ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

/**
 * Checks if client is an iOS device (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Checks if client is an Android device
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Native Web Share API helper with fallback
 */
export async function shareGymBroContent(options: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url || window.location.href,
      });
      triggerHaptic('success');
      return true;
    } catch {
      // User cancelled share
      return false;
    }
  }

  // Fallback to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${options.text} ${options.url || ''}`);
      triggerHaptic('light');
      alert('Link copied to clipboard!');
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Register the Service Worker in production / client
 */
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('GymBro PWA ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('ServiceWorker registration failed:', error);
        });
    });
  }
}
