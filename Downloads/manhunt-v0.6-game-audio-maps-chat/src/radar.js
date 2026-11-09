// A schematic, offline fallback. This is not a street map and is not
// accurate enough for capture decisions or route planning.
export function radarPoint(point, center, radiusMeters) {
  if (!point || !center || !Number.isFinite(radiusMeters) || radiusMeters <= 0) return null;
  const { latitude, longitude } = point;
  if (![latitude, longitude, center.latitude, center.longitude].every(Number.isFinite)) return null;
  const metresPerLatDegree = 111320;
  const north = (latitude - center.latitude) * metresPerLatDegree;
  const east = (longitude - center.longitude) * metresPerLatDegree *
    Math.cos(center.latitude * Math.PI / 180);
  return {
    x: Math.max(0.05, Math.min(0.95, 0.5 + (east / radiusMeters) * 0.43)),
    y: Math.max(0.05, Math.min(0.95, 0.5 - (north / radiusMeters) * 0.43)),
    distanceMeters: Math.hypot(east, north),
  };
}

export function visibleApproximatePings(players, now, status) {
  if (status !== 'active') return [];
  return players.filter(player => {
    const timestamp = player.location?.updatedAt;
    if (player.caught || player.sharingEnabled !== true || !Number.isFinite(timestamp)) return false;
    const ttl = player.team === 'hunter' ? 45000 : 60000;
    return timestamp <= now && now - timestamp < ttl &&
      Number.isFinite(player.location.latitude) && Number.isFinite(player.location.longitude);
  });
}
