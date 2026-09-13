// Agents Office — configuration (Beta).
// office.config.json is the shipped default; office.config.local.json (gitignored) overrides it;
// environment variables override both: AO_NAME, AO_BRAIN, PORT, AO_MODEL.
// V3.1 keys: mcp { allow, deny, departments } · tools { web } · timeout (seconds per agent run) — see mcp.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const envFile of ['.env', '.env.local']) {
    try {
      const p = path.join(ROOT, envFile);
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq > 0) {
            const k = trimmed.slice(0, eq).trim();
            const v = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[k]) process.env[k] = v;
          }
        }
      }
    } catch {}
  }
}
loadEnv();

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

export function loadConfig() {
  const base = readJSON(path.join(ROOT, 'office.config.json'));
  const local = readJSON(path.join(ROOT, 'office.config.local.json'));
  const c = { name: 'Agents Office', brain: './brain', port: 4520, model: 'gemini-2.5-flash', provider: 'gemini', ...base, ...local }; // V3.6: model = sonnet · opus · fable · gemini
  c.mcp = { allow: [], deny: [], departments: {}, ...(base.mcp || {}), ...(local.mcp || {}) };
  c.tools = { web: true, ...(base.tools || {}), ...(local.tools || {}) };
  if (process.env.AO_NAME) c.name = process.env.AO_NAME;
  if (process.env.AO_BRAIN) c.brain = process.env.AO_BRAIN;
  if (process.env.PORT) c.port = +process.env.PORT;
  if (process.env.AO_MODEL) c.model = process.env.AO_MODEL;
  if (process.env.AO_PROVIDER) c.provider = process.env.AO_PROVIDER;
  c.port = +c.port || 4520;
  c.brainPath = path.resolve(ROOT, c.brain);
  return c;
}
