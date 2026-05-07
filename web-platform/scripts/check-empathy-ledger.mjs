#!/usr/bin/env node
/**
 * Empathy Ledger v2 connection smoke-test.
 *
 * Reads .env.local, then hits every EL surface PICC depends on and
 * reports pass/fail with row counts. Exit code = number of failures.
 *
 *   node scripts/check-empathy-ledger.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m',
};
const ok = (s) => `${c.green}✓${c.reset} ${s}`;
const bad = (s) => `${c.red}✗${c.reset} ${s}`;
const warn = (s) => `${c.yellow}⚠${c.reset} ${s}`;

function loadEnv() {
  const p = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(p)) return {};
  const env = {};
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[trimmed.slice(0, eq).trim()] = v;
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };

const EL_V2_URL = (env.EL_V2_API_URL || '').replace(/\/$/, '');
const EL_V2_KEY = env.EL_V2_API_KEY || '';
const EL_INTAKE_URL = (env.EMPATHY_LEDGER_API_URL || EL_V2_URL).replace(/\/$/, '');
const EL_INTAKE_KEY = env.EMPATHY_LEDGER_INTAKE_KEY || '';
const EL_API_KEY = env.EMPATHY_LEDGER_API_KEY || '';
const EL_PUBLIC_URL = (env.NEXT_PUBLIC_EL_V2_URL || '').replace(/\/$/, '');

let failures = 0;

console.log(`\n${c.cyan}Empathy Ledger v2 connection check${c.reset}`);
console.log(`${c.dim}EL_V2_API_URL:        ${EL_V2_URL || '(unset)'}${c.reset}`);
console.log(`${c.dim}EMPATHY_LEDGER_API_URL: ${EL_INTAKE_URL || '(unset)'}${c.reset}`);
console.log(`${c.dim}NEXT_PUBLIC_EL_V2_URL:  ${EL_PUBLIC_URL || '(unset, falls back to picc.empathyledger.com)'}${c.reset}\n`);

if (!EL_V2_URL || !EL_V2_KEY) {
  console.log(bad('EL_V2_API_URL or EL_V2_API_KEY missing — read-side EL is offline. PICC will fall back to static data.'));
  failures++;
}

async function check(label, url, headers = {}, expectJson = true) {
  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    const text = await res.text();
    let body = text;
    let count = null;
    if (expectJson) {
      try {
        const json = JSON.parse(text);
        body = json;
        count = json.count ?? json.total ?? (Array.isArray(json.services) && json.services.length) ?? (Array.isArray(json.photos) && json.photos.length) ?? (Array.isArray(json.voices) && json.voices.length) ?? null;
      } catch {}
    }
    if (res.ok) {
      const suffix = count !== null ? ` ${c.dim}(${count} rows)${c.reset}` : '';
      console.log(ok(`${label} ${c.dim}${res.status}${c.reset}${suffix}`));
      return true;
    }
    console.log(bad(`${label} ${c.dim}${res.status}${c.reset} ${typeof body === 'string' ? body.slice(0, 120) : JSON.stringify(body).slice(0, 200)}`));
    return false;
  } catch (err) {
    console.log(bad(`${label} ${c.dim}network${c.reset} ${err.message}`));
    return false;
  }
}

console.log(`${c.cyan}Read-side (powers PICC pages + PDFs)${c.reset}`);
const reads = [
  ['/api/photos?limit=1', '/api/photos?limit=1'],
  ['/api/picc/services?status=active', '/api/picc/services?status=active'],
  ['/api/picc/coverage', '/api/picc/coverage'],
  ['/api/picc/voices-pool', '/api/picc/voices-pool'],
];
if (EL_V2_URL && EL_V2_KEY) {
  for (const [label, p] of reads) {
    if (!(await check(label, `${EL_V2_URL}${p}`, { 'x-picc-api-key': EL_V2_KEY }))) failures++;
  }

  // Slot inventory — surface what slot names actually exist + their counts
  // so any code referencing a slot can be sanity-checked here.
  try {
    const res = await fetch(`${EL_V2_URL}/api/photos?limit=500`, {
      headers: { 'x-picc-api-key': EL_V2_KEY },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const slots = data?.bySlot ?? {};
      const counts = Object.entries(slots).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]);
      counts.sort((a, b) => b[1] - a[1]);
      console.log(`  ${c.dim}slot inventory:${c.reset}`);
      for (const [slot, n] of counts.slice(0, 12)) {
        console.log(`    ${c.dim}${String(n).padStart(3)} ${c.reset}${slot}`);
      }
      if (counts.length > 12) {
        console.log(`    ${c.dim}+ ${counts.length - 12} more slots${c.reset}`);
      }
    }
  } catch {
    /* slot inventory is decorative; failure here doesn't gate */
  }
} else {
  console.log(warn('skipped — set EL_V2_API_URL and EL_V2_API_KEY in .env.local'));
}

console.log(`\n${c.cyan}Intake (lib/empathy-ledger/el-api-client.ts)${c.reset}`);
if (EL_INTAKE_URL && EL_INTAKE_KEY) {
  // Probe with an obviously-bad payload — we just want to confirm auth passes.
  try {
    const res = await fetch(`${EL_INTAKE_URL}/api/intake/create-storyteller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Intake-Key': EL_INTAKE_KEY },
      body: JSON.stringify({ profile_id: 'smoke-test', display_name: 'smoke-test' }),
    });
    if (res.status === 401 || res.status === 403) {
      console.log(bad(`intake auth rejected ${c.dim}${res.status}${c.reset} — EMPATHY_LEDGER_INTAKE_KEY may be rotated`));
      failures++;
    } else {
      console.log(ok(`intake auth accepted ${c.dim}${res.status}${c.reset} (handler response not validated)`));
    }
  } catch (err) {
    console.log(bad(`intake probe failed: ${err.message}`));
    failures++;
  }
} else {
  console.log(warn('skipped — set EMPATHY_LEDGER_API_URL and EMPATHY_LEDGER_INTAKE_KEY to enable intake'));
}

console.log(`\n${c.cyan}Syndication (content-hub)${c.reset}`);
if (EL_INTAKE_URL && EL_API_KEY) {
  // GET with a known-bad UUID — auth should pass, handler will 4xx/5xx on the body.
  try {
    const res = await fetch(`${EL_INTAKE_URL}/api/v1/content-hub/syndicate?contentId=00000000-0000-0000-0000-000000000000`, {
      headers: { 'X-API-Key': EL_API_KEY },
    });
    if (res.status === 401 || res.status === 403) {
      console.log(bad(`syndication auth rejected ${c.dim}${res.status}${c.reset} — EMPATHY_LEDGER_API_KEY may be rotated`));
      failures++;
    } else {
      console.log(ok(`syndication auth accepted ${c.dim}${res.status}${c.reset}`));
    }
  } catch (err) {
    console.log(bad(`syndication probe failed: ${err.message}`));
    failures++;
  }
} else {
  console.log(warn('skipped — set EMPATHY_LEDGER_API_KEY to enable syndication'));
}

console.log(`\n${c.cyan}Public surface (NEXT_PUBLIC_EL_V2_URL — outbound links, embed iframe)${c.reset}`);
const publicTarget = EL_PUBLIC_URL || 'https://picc.empathyledger.com';
try {
  const res = await fetch(publicTarget, { redirect: 'manual' });
  if (res.status >= 200 && res.status < 400) {
    console.log(ok(`${publicTarget} reachable ${c.dim}${res.status}${c.reset}`));
  } else {
    console.log(warn(`${publicTarget} returned ${res.status}`));
  }
} catch (err) {
  console.log(bad(`${publicTarget} unreachable: ${err.message}`));
  failures++;
}

console.log('');
if (failures === 0) {
  console.log(`${c.green}All Empathy Ledger surfaces look healthy.${c.reset}\n`);
  process.exit(0);
} else {
  console.log(`${c.red}${failures} check(s) failed.${c.reset}\n`);
  process.exit(failures);
}
