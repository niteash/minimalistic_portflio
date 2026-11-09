import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Static sanity checks only. These are NOT a Firestore Security Rules Emulator test.
const rules = readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');
assert.match(rules, /match \/teamMessages\/\{team\}\/messages\/\{messageId\}/);
assert.match(rules, /get\(playerPath\(id, request\.auth\.uid\)\)\.data\.team == team/);
assert.match(rules, /allow update, delete: if false/);
assert.match(rules, /request.resource.data.sharingEnabled == false/);
assert.match(rules, /request.resource.data.sharingEnabled is bool/);
assert.match(rules, /request.resource.data.location == null \|\| request.resource.data.sharingEnabled == true/);
assert.doesNotMatch(rules, /allow (read|write|create|update|delete|get|list)\s*(,\s*\w+)?\s*:\s*if true\s*;/);
assert.ok(rules.includes('allow create: if signed()'));
console.log('v0.5 rules static safety checks passed (not a live rules test).');
