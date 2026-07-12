/** Cloud copy of app data keyed by a user-held recovery code — unlike
 * lib/push.ts's device id, this code is meant to be written down and
 * survive the device losing its own storage entirely (e.g. deleting the iOS
 * home-screen icon, which wipes the isolated storage container that a
 * device id would otherwise live in). */
import type { RestorableState } from './backup';

const RECOVERY_CODE_KEY = 'brifo_recovery_code';
// No 0/O/1/I/L — avoids characters that are easy to confuse when copied by hand.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 12;

function generateRawCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

/** The canonical, un-dashed code used for storage and network requests. */
export function getOrCreateRecoveryCode(): string {
  let code = localStorage.getItem(RECOVERY_CODE_KEY);
  if (!code) {
    code = generateRawCode();
    localStorage.setItem(RECOVERY_CODE_KEY, code);
  }
  return code;
}

export function formatCodeForDisplay(raw: string): string {
  return raw.match(/.{1,4}/g)!.join('-');
}

export function normalizeCodeInput(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function syncToCloud(state: RestorableState): Promise<void> {
  const code = getOrCreateRecoveryCode();
  try {
    await fetch('/api/backup-sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, data: state }),
    });
  } catch (err) {
    console.error('[cloudBackup] sync failed:', err);
  }
}

/** Fetches the backup for a code and, on success, adopts that code as this
 * device's own — so future edits keep syncing to the same slot instead of
 * the fresh one this device would otherwise have generated for itself. */
export async function restoreFromCloud(codeInput: string): Promise<RestorableState | null> {
  const code = normalizeCodeInput(codeInput);
  try {
    const res = await fetch('/api/backup-restore', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as { data?: RestorableState };
    if (!payload.data) return null;
    localStorage.setItem(RECOVERY_CODE_KEY, code);
    return payload.data;
  } catch (err) {
    console.error('[cloudBackup] restore failed:', err);
    return null;
  }
}
