import { PRIVACY_POLICY_VERSION } from '../data/privacyPolicy';

const CONSENT_KEY = 'brifo_privacy_consent';

interface ConsentRecord {
  accepted: boolean;
  version: number;
  acceptedAt: string;
}

/** Bumping PRIVACY_POLICY_VERSION invalidates every prior acceptance, so
 * existing users are re-prompted the next time the policy materially changes. */
export function hasAcceptedPrivacyPolicy(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as ConsentRecord;
    return parsed.accepted === true && parsed.version === PRIVACY_POLICY_VERSION;
  } catch {
    return false;
  }
}

export function acceptPrivacyPolicy(): void {
  const record: ConsentRecord = { accepted: true, version: PRIVACY_POLICY_VERSION, acceptedAt: new Date().toISOString() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}
