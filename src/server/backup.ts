/** Cloud copy of a device's app data, keyed by a user-held recovery code
 * instead of a device id — the whole point is surviving the loss of
 * everything stored on the device itself (e.g. deleting the iOS home-screen
 * icon, which wipes its isolated storage container including any device id
 * we'd otherwise rely on). Kept dependency-free of src/lib (client code) for
 * the same cold-start reason push.ts avoids it — see errors.ts. */
import { kvGet, kvSet } from './kv.js';

const CODE_RE = /^[A-Z0-9]{8,20}$/;
const backupKey = (code: string) => `cloudbackup:${code}`;

export interface CloudBackupPayload {
  updatedAt: string;
  data: unknown;
}

export function isValidRecoveryCode(code: unknown): code is string {
  return typeof code === 'string' && CODE_RE.test(code);
}

export async function saveCloudBackup(code: string, data: unknown): Promise<void> {
  await kvSet(backupKey(code), { updatedAt: new Date().toISOString(), data } satisfies CloudBackupPayload);
}

export async function loadCloudBackup(code: string): Promise<CloudBackupPayload | null> {
  return kvGet<CloudBackupPayload>(backupKey(code));
}
