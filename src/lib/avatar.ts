/**
 * Returns a deterministic cute-cat avatar URL for a given seed (email or uid).
 * Uses the cute-cat-avatars API — same seed always maps to the same illustrated cat.
 * 14 illustrated cats available: announcer, support, idea, bug, award, news, tv,
 * comic, book, art, gaming, general, groups, cat.
 */
export function getCatAvatar(seed: string | null | undefined): string {
  const safeSeed = encodeURIComponent(seed || 'user');
  return `https://cute-cat-avatars.laosing-cors.workers.dev/api/v1/${safeSeed}`;
}
