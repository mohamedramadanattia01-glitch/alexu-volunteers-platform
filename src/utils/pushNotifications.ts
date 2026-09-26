// System Push & Background Notification Helper for PWA & Mobile Web

export interface PushNotificationPayload {
  title: string;
  body: string;
  type?: 'task' | 'alert' | 'sos' | 'announcement' | 'eval' | 'complaint' | 'achievement' | 'event' | string;
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
 * Dispatch system level push notification (visible outside the browser / on phone lockscreen)
 */
export async function sendSystemPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  const {
    title,
    body,
    type = 'announcement',
    icon = '/logo.png',
    badge = '/logo.png',
    image = '/logo.png',
    tag = `notif-${Date.now()}`,
    data = {}
  } = payload;

  // Vibration pattern based on severity
  const vibratePattern = (type === 'sos' || type === 'alert')
    ? [300, 100, 300, 100, 500]
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

  const notificationOptions: NotificationOptions = {
    body,
    icon: icon || '/logo.png',
    badge: badge || '/logo.png',
    // @ts-ignore - Chrome / Android / Windows rich preview image
    image: image || icon || '/logo.png',
    tag,
    data: {
      url: window.location.href,
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

  // 1. First priority: Dispatch through Service Worker Registration (works in background & mobile phone)
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
