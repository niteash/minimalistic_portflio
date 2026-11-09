// Pure rules for a small, private, walking-only Manhunt game.
export const MAX_PLAYERS = 8;
export const ROLE_REVEAL_MS = 8000;

export function canStartMatch(players) {
  return Array.isArray(players) &&
    players.length >= 2 && players.length <= MAX_PLAYERS &&
    players.every(p => p.ready === true && p.team === 'unassigned');
}

// Casual, client-run randomization: NOT tamper-resistant or cryptographically fair.
// The role is assigned by the host just before the match begins.
export function assignRandomRoles(players, random = Math.random) {
  if (!canStartMatch(players)) throw new Error('Need 2–8 ready, unassigned players.');
  const shuffled = players.map(p => p.uid);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const r = random();
    if (!Number.isFinite(r) || r < 0 || r >= 1) throw new Error('Invalid random source.');
    const j = Math.floor(r * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const hunterCount = shuffled.length < 6 ? 1 : 2;
  const assignments = {};
  shuffled.forEach((uid, index) => { assignments[uid] = index < hunterCount ? 'hunter' : 'runner'; });
  return assignments;
}

export function getMatchOutcome(room, players, now) {
  // startedAt includes the short role-reveal period. Match clock starts afterward.
  const secondsLeft = room?.startedAt
    ? Math.max(0, Math.ceil((room.startedAt + (room.durationSeconds ?? 1800) * 1000 - now) / 1000))
    : (room?.durationSeconds ?? 1800);
  const runners = players.filter(p => p.team === 'runner');
  const allCaught = runners.length > 0 && runners.every(p => p.caught === true);
  const timeout = room?.status === 'active' && secondsLeft === 0;
  const completed = room?.status === 'finished' ||
    (room?.status === 'active' && (timeout || allCaught));
  const finishReason = room?.finishReason ||
    (room?.status === 'active' && allCaught ? 'all_caught' : timeout ? 'timeout' : null);
  const winner = completed
    ? (finishReason === 'all_caught' ? 'HUNTERS' : finishReason === 'timeout' ? 'RUNNERS' : null)
    : null;
  return { secondsLeft, allCaught, timeout, completed, finishReason, winner };
}
