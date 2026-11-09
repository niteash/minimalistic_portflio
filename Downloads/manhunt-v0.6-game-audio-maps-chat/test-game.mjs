import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('./src/game.js', import.meta.url), 'utf8');
const { canStartMatch, assignRandomRoles, MAX_PLAYERS, ROLE_REVEAL_MS, getMatchOutcome } =
  await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function readyPlayers(n) {
  return Array.from({ length: n }, (_, i) => ({
    uid: `player-${i+1}`, team: 'unassigned', ready: true, caught: false,
  }));
}
assert.equal(ROLE_REVEAL_MS, 8000);
assert.equal(MAX_PLAYERS, 8);
assert.equal(canStartMatch(readyPlayers(2)), true);
assert.equal(canStartMatch(readyPlayers(8)), true);
assert.equal(canStartMatch(readyPlayers(1)), false);
assert.equal(canStartMatch(readyPlayers(9)), false);
assert.equal(canStartMatch(readyPlayers(3).map((p,i)=>i===0?{...p,ready:false}:p)),false);
assert.equal(canStartMatch(readyPlayers(2).map((p,i)=>i===0?{...p,team:'hunter'}:p)),false);
assert.equal(canStartMatch([]), false);

// Deterministic test RNG makes role assignment repeatable for tests.
for (let n = 2; n <= MAX_PLAYERS; n++) {
  const roster = readyPlayers(n);
  const roles = assignRandomRoles(roster, () => 0.34);
  assert.deepEqual(Object.keys(roles).sort(), roster.map(p=>p.uid).sort());
  assert.equal(Object.values(roles).filter(t=>t==='hunter').length, n < 6 ? 1 : 2);
  assert.equal(Object.values(roles).filter(t=>t==='runner').length, n - (n < 6 ? 1 : 2));
}
assert.throws(() => assignRandomRoles(readyPlayers(1)));
assert.throws(() => assignRandomRoles(readyPlayers(2), () => 1));

const players = [
  { uid: 'hunter', team: 'hunter', ready: true, caught: false },
  { uid: 'runner', team: 'runner', ready: true, caught: false },
];
const startedAt = 1_000_000;
const room = { status: 'active', startedAt, durationSeconds: 1800, finishReason: '' };
assert.equal(getMatchOutcome(room, players, startedAt).secondsLeft, 1800);
assert.equal(getMatchOutcome(room, players, startedAt+1_800_001).winner, 'RUNNERS');
assert.equal(getMatchOutcome(room, players.map(p=>p.team==='runner'?{...p,caught:true}:p),startedAt+1000).winner,'HUNTERS');
assert.equal(getMatchOutcome({...room,status:'finished',finishReason:'host_stopped'}, players, startedAt+1000).winner,null);
assert.equal(getMatchOutcome({...room,status:'finished',finishReason:'timeout'}, players, startedAt+1000).winner,'RUNNERS');
console.log('v0.4 game logic + random roles unit tests passed.');
