/** Reconciles this device's state with the cloud copy so two devices sharing
 * one recovery code (e.g. both parents) converge instead of one device's
 * periodic push blindly overwriting the other's edits (see DataContext's
 * pull-and-merge effect). Records are never mutated in place across devices
 * except for a handful of known fields (paid, title/date/childId, done) —
 * everything else is create-once — so a per-record `updatedAt` is enough to
 * pick a winner, plus a tombstone list so a delete on one device doesn't get
 * silently resurrected by a stale copy from the other. */
import type { RestorableState } from './backup';
import type { Tombstone } from '../types/data';

const TOMBSTONE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

interface Identifiable {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

function mergeCollection<T extends Identifiable>(local: T[], remote: T[], tombstoneIds: Set<string>, preferLocal = false): T[] {
  const byId = new Map<string, T>();
  for (const item of remote) byId.set(item.id, item);
  for (const item of local) {
    const existing = byId.get(item.id);
    if (!existing || preferLocal) {
      byId.set(item.id, item);
      continue;
    }
    const existingTime = existing.updatedAt ?? existing.createdAt;
    const itemTime = item.updatedAt ?? item.createdAt;
    if (itemTime >= existingTime) byId.set(item.id, item);
  }
  return [...byId.values()].filter((item) => !tombstoneIds.has(item.id));
}

function mergeTombstones(local: Tombstone[], remote: Tombstone[]): Tombstone[] {
  const byId = new Map<string, Tombstone>();
  for (const t of [...remote, ...local]) {
    const existing = byId.get(t.id);
    if (!existing || t.deletedAt > existing.deletedAt) byId.set(t.id, t);
  }
  const cutoff = Date.now() - TOMBSTONE_MAX_AGE_MS;
  return [...byId.values()].filter((t) => new Date(t.deletedAt).getTime() >= cutoff);
}

export function mergeStoredState(local: RestorableState, remote: RestorableState): RestorableState {
  const tombstones = mergeTombstones(local.tombstones, remote.tombstones);
  const tombstoneIds = new Set(tombstones.map((t) => t.id));

  return {
    children: mergeCollection(local.children, remote.children, tombstoneIds),
    // Letters are never edited in place, and only the device that scanned one
    // has its photo — always keep the local copy on conflict so a merge never
    // clobbers a photo with a remote (photo-stripped) version of the same letter.
    letters: mergeCollection(local.letters, remote.letters, tombstoneIds, true),
    payments: mergeCollection(local.payments, remote.payments, tombstoneIds),
    events: mergeCollection(local.events, remote.events, tombstoneIds),
    todos: mergeCollection(local.todos, remote.todos, tombstoneIds),
    rating:
      !local.rating || !remote.rating
        ? (local.rating ?? remote.rating)
        : local.rating.updatedAt >= remote.rating.updatedAt
          ? local.rating
          : remote.rating,
    tombstones,
  };
}
