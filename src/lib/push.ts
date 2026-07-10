/** Web push subscription — lets appointment reminders reach the device even
 * when Brifo is fully closed. The server (api/cron/send-reminders) has no
 * access to this browser's localStorage, so every event we want reminders
 * for has to be explicitly synced up via syncPushReminders. */

const DEVICE_ID_KEY = 'brifo_device_id';
const PUSH_ENABLED_KEY = 'brifo_push_enabled';

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function pushEnabled(): boolean {
  return localStorage.getItem(PUSH_ENABLED_KEY) === '1';
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Requests a push subscription and registers it with the server. Assumes
 * Notification permission has already been granted (see lib/reminders.ts). */
export async function subscribeToPush(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const keyRes = await fetch('/api/push-public-key');
    if (!keyRes.ok) return false;
    const { publicKey } = (await keyRes.json()) as { publicKey?: string };
    if (!publicKey) return false;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      }));

    const subRes = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), subscription: subscription.toJSON() }),
    });
    if (!subRes.ok) return false;

    localStorage.setItem(PUSH_ENABLED_KEY, '1');
    return true;
  } catch (err) {
    console.error('[push] subscribe failed:', err);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  localStorage.setItem(PUSH_ENABLED_KEY, '0');
  try {
    if (pushSupported()) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      await subscription?.unsubscribe();
    }
  } catch (err) {
    console.error('[push] unsubscribe failed:', err);
  }
  try {
    await fetch('/api/push-unsubscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId() }),
    });
  } catch {
    // Best-effort — the subscription is already torn down client-side.
  }
}

export interface SyncablePushEvent {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
}

export async function syncPushReminders(events: SyncablePushEvent[], offsets: number[], lang: 'ar' | 'de'): Promise<void> {
  if (!pushEnabled()) return;
  try {
    await fetch('/api/push-sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), events, offsets, lang }),
    });
  } catch (err) {
    console.error('[push] sync failed:', err);
  }
}
