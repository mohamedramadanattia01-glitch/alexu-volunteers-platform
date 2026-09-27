// System Push & Background Notification Helper for PWA, Mobile Web & Desktop OS

export interface PushNotificationPayload {
  title: string;
  body: string;
  type?: 'task' | 'alert' | 'sos' | 'announcement' | 'eval' | 'complaint' | 'achievement' | 'event' | 'voice' | string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  sound?: boolean;
}

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return Notification.permission;
  }
}

/**
 * Play a web chime sound using Web Audio API synthesis (100% works without external sound files)
 */
export function playWebAudioChime(type: 'sos' | 'task' | 'announcement' | 'success' | 'alert' | string = 'announcement') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'sos' || type === 'alert') {
      // Siren dual-tone pulse
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.linearRampToValueAtTime(587.33, now + 0.15);
      osc1.frequency.linearRampToValueAtTime(880, now + 0.30);
      osc1.frequency.linearRampToValueAtTime(587.33, now + 0.45);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.linearRampToValueAtTime(293.66, now + 0.15);
      osc2.frequency.linearRampToValueAtTime(440, now + 0.30);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else if (type === 'task' || type === 'achievement' || type === 'success') {
      // Upward melodic chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.25, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.25);
      });
    } else {
      // Elegant crystal notification bell (F5 -> A5)
      const freqs = [698.46, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    }
  } catch {
    // ignore audio autoplay policy errors
  }
}

/**
 * Dispatch system level push notification (visible on Mobile Lockscreen / Windows Action Center / Android Notification Tray)
 */
export async function sendSystemPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  const {
    title,
    body,
    type = 'announcement',
    icon = '/logo.png',
    badge = '/logo.png',
    image,
    tag = `notif-${Date.now()}`,
    data = {}
  } = payload;

  // Sound chime
  playWebAudioChime(type);

  // Vibration pattern based on severity
  const vibratePattern = (type === 'sos' || type === 'alert')
    ? [300, 100, 300, 100, 500, 100, 500]
    : [200, 100, 200];

  // Try physical device vibration if in foreground
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(vibratePattern);
    }
  } catch {
    // ignore
  }

  if (!isNotificationSupported()) {
    return false;
  }

  // If permission not granted, return false
  if (Notification.permission !== 'granted') {
    return false;
  }

  const defaultUrl = typeof window !== 'undefined' ? window.location.href : '/';
  const targetUrl = data.url || defaultUrl;

  const notificationOptions: NotificationOptions = {
    body,
    icon: icon || '/logo.png',
    badge: badge || '/logo.png',
    // @ts-ignore - Chrome / Android / Windows rich preview image
    image: image || undefined,
    tag,
    data: {
      url: targetUrl,
      type,
      ...data
    },
    // @ts-ignore - Chrome / Android PWA supported properties
    vibrate: vibratePattern,
    requireInteraction: type === 'sos' || type === 'alert',
    renotify: true,
    silent: false,
    dir: 'rtl',
    lang: 'ar'
  };

  // 1. First priority: Dispatch through Service Worker Registration (works in background & locked mobile phone)
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }
  } catch (err) {
    console.warn('SW registration showNotification fallback to Window Notification:', err);
  }

  // 2. Second fallback: Standard Window Notification API
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (targetUrl && targetUrl !== window.location.href) {
        window.location.href = targetUrl;
      }
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Window Notification failed:', err);
  }

  // 3. Third fallback: Post message to active SW
  try {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: notificationOptions
      });
      return true;
    }
  } catch (err) {
    console.warn('SW postMessage failed:', err);
  }

  return false;
}
