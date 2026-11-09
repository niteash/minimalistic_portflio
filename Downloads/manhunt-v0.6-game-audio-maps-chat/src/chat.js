// A room-wide channel helps two-player matches communicate.
// Team channels remain distinct and must be authorized by Firestore rules.
export const CHANNELS = Object.freeze(['all', 'team']);

export function chatCollectionSegments(roomId, channel, team) {
  if (!/^[A-Z2-9]{8}$/.test(roomId || '')) throw new Error('Invalid room code');
  if (channel === 'all') return ['rooms', roomId, 'publicMessages'];
  if (channel === 'team' && ['hunter', 'runner'].includes(team)) {
    return ['rooms', roomId, 'teamMessages', team, 'messages'];
  }
  throw new Error('A valid team is required for team chat');
}

export function channelAudience(players, channel, team) {
  if (!Array.isArray(players)) return 0;
  return channel === 'all' ? players.length : players.filter(p => p.team === team).length;
}
