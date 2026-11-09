// GPS precision is not sufficient for automatic 2-3m player tagging.
// We intentionally publish only an approximate position (~100m grid).
export function approximate(coords) {
  return {
    latitude: Math.round(coords.latitude * 1000) / 1000,
    longitude: Math.round(coords.longitude * 1000) / 1000,
  };
}

export function metersBetween(a, b) {
  const rad = x => x * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const angle = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(angle)));
}

export function createInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i += 1) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// Conservative rest-zone estimate using local (never published) GPS data.
// We cannot reliably infer 2–3m proximity or exact boundary crossings.
export function safeZoneStatus(position, center, radiusMeters = 25) {
  if (!position || !center || !Number.isFinite(position.latitude) ||
      !Number.isFinite(position.longitude) || !Number.isFinite(position.accuracy) ||
      position.accuracy < 0 || position.accuracy > 50 || radiusMeters <= 0) {
    return 'unknown';
  }
  const distance = metersBetween(position, center);
  if (distance + position.accuracy <= radiusMeters) return 'inside';
  if (distance - position.accuracy > radiusMeters) return 'outside';
  return 'uncertain';
}
