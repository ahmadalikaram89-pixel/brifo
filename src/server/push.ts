import webpush from 'web-push';
import { ConfigError } from './errors.js';
import { kvGet, kvSet, kvDel, kvSadd, kvSrem, kvSmembers, kvMarkSentOnce } from './kv.js';

const DEVICES_SET = 'push:devices';
const subKey = (deviceId: string) => `push:sub:${deviceId}`;
const remindersKey = (deviceId: string) => `push:reminders:${deviceId}`;
const sentKey = (deviceId: string, eventId: string, offsetMin: number) => `push:sent:${deviceId}:${eventId}:${offsetMin}`;

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface ReminderEvent {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
}

interface DeviceReminders {
  events: ReminderEvent[];
  /** Minutes before the event's assumed time (see eventAnchorUtcMs). */
  offsets: number[];
  lang: 'ar' | 'de';
}

let vapidConfigured = false;

function configureWebPush(): void {
  if (vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new ConfigError('VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT must be set');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export function getVapidPublicKey(): string {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) throw new ConfigError('VAPID_PUBLIC_KEY is not set');
  return publicKey;
}

export async function saveSubscription(deviceId: string, subscription: PushSubscriptionInput): Promise<void> {
  await kvSet(subKey(deviceId), subscription);
  await kvSadd(DEVICES_SET, deviceId);
}

export async function removeSubscription(deviceId: string): Promise<void> {
  await kvDel(subKey(deviceId));
  await kvDel(remindersKey(deviceId));
  await kvSrem(DEVICES_SET, deviceId);
}

export async function syncReminders(deviceId: string, events: ReminderEvent[], offsets: number[], lang: 'ar' | 'de'): Promise<void> {
  await kvSet(remindersKey(deviceId), { events, offsets, lang } satisfies DeviceReminders);
}

/** Europe/Vienna's UTC offset (minutes) on a given date, DST-aware. Probed at
 * noon UTC so the offset lookup never straddles a day boundary. */
function viennaOffsetMinutes(dateStr: string): number {
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vienna',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(probe).map((p) => [p.type, p.value])) as Record<string, string>;
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - probe.getTime()) / 60000);
}

/** Calendar events only carry a date, not a time — 08:00 Europe/Vienna is
 * used as every event's assumed appointment time so "an hour before" means
 * something. Exported for the cron route's own due-window math. */
export function eventAnchorUtcMs(dateStr: string): number {
  const offsetMin = viennaOffsetMinutes(dateStr);
  return Date.parse(`${dateStr}T00:00:00Z`) + (8 * 60 - offsetMin) * 60000;
}

function offsetLabel(offsetMin: number, lang: 'ar' | 'de'): string {
  if (lang === 'de') {
    if (offsetMin >= 1440) return 'Termin morgen';
    if (offsetMin >= 60) return 'Termin in einer Stunde';
    return 'Termin in Kürze';
  }
  if (offsetMin >= 1440) return 'موعدك بكرا';
  if (offsetMin >= 60) return 'موعدك بعد ساعة';
  return 'موعدك قريباً';
}

type SendResult = 'sent' | 'gone' | 'error';

async function sendPush(subscription: PushSubscriptionInput, payload: unknown): Promise<SendResult> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return 'sent';
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) return 'gone';
    console.error('[push] sendNotification failed:', err);
    return 'error';
  }
}

export interface RunDueRemindersResult {
  checked: number;
  sent: number;
  removed: number;
}

/** Scans every subscribed device's reminders and sends a push for anything
 * whose (event time − offset) fell inside the last `windowMinutes` — wide
 * enough to cover the gap between cron runs without re-sending (dedup via
 * kvMarkSentOnce). */
export async function runDueReminders(windowMinutes: number): Promise<RunDueRemindersResult> {
  configureWebPush();
  const deviceIds = await kvSmembers(DEVICES_SET);
  const now = Date.now();
  let checked = 0;
  let sent = 0;
  let removed = 0;

  for (const deviceId of deviceIds) {
    const subscription = await kvGet<PushSubscriptionInput>(subKey(deviceId));
    const reminders = await kvGet<DeviceReminders>(remindersKey(deviceId));
    if (!subscription || !reminders) continue;

    let deviceGone = false;
    for (const event of reminders.events) {
      if (deviceGone) break;
      const anchor = eventAnchorUtcMs(event.date);
      for (const offsetMin of reminders.offsets) {
        checked++;
        const fireAt = anchor - offsetMin * 60000;
        if (fireAt > now || fireAt < now - windowMinutes * 60000) continue;

        // Claimed before sending so two overlapping cron runs can't double-send.
        // A transient failure releases the claim again so the next run retries
        // it instead of silently dropping it for the rest of the dedupe TTL.
        const claimKey = sentKey(deviceId, event.id, offsetMin);
        const claimed = await kvMarkSentOnce(claimKey, 60 * 60 * 24 * 14);
        if (!claimed) continue;

        const result = await sendPush(subscription, {
          title: event.title,
          body: offsetLabel(offsetMin, reminders.lang),
          tag: `${event.id}:${offsetMin}`,
          url: '/calendar',
        });
        if (result === 'error') {
          await kvDel(claimKey);
          continue;
        }
        if (result === 'sent') sent++;
        if (result === 'gone') {
          await removeSubscription(deviceId);
          removed++;
          deviceGone = true;
          break;
        }
      }
    }
  }

  return { checked, sent, removed };
}
