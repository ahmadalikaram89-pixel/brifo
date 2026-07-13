/** Sends a copy of a locally-saved rating to the server so it's actually
 * reachable by the app owner (see screens/Admin.tsx) — DataContext's own
 * copy stays device-local, same as the rest of the app's data. */
export async function submitRatingToServer(stars: number, comment: string, lang: 'ar' | 'de'): Promise<void> {
  try {
    await fetch('/api/rating-submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stars, comment, lang }),
    });
  } catch (err) {
    console.error('[ratings] submit failed:', err);
  }
}
