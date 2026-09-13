import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, ROOT } from '../config.mjs';
import { layoutGraph, readVault, readOfficeNotes } from '../graph-build.mjs';
import { DEPTS, DEPT_KEYS } from '../src/data.js';
import * as mcp from '../mcp.mjs';
import { loadRoster } from '../roster.mjs';
import { loadSkills } from '../skills.mjs';
import * as learn from '../learn.mjs';
import * as onboard from '../onboard.mjs';
import * as routines from '../routines.mjs';
import * as usage from '../usage.mjs';
import { ProviderManager } from '../providers.mjs';
import { normModel, modelFor, modelName, MODEL_KEYS, DEFAULT_MODEL, normEffort, effortFor, EFFORT_KEYS } from '../src/models.js';

const cfg = loadConfig();
const version = '3.6.1-ldoc';
const BRAIN = path.resolve(ROOT, cfg.brain || './brain');
const NOTES_DIR = path.join(BRAIN, 'Agents Office');

// Serverless storage fallback (use /tmp on serverless environments if ROOT is read-only)
let DATA = path.join(ROOT, 'data');
try {
  fs.mkdirSync(DATA, { recursive: true });
} catch {
  DATA = path.join('/tmp', 'agents-office-data');
  fs.mkdirSync(DATA, { recursive: true });
}
const FILE = path.join(DATA, 'tasks.json');

// In-memory cache for serverless invocation speed
let memTasks = null;
const loadTasks = () => {
  if (memTasks) return memTasks;
  try {
    memTasks = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    memTasks = [
      {
        id: 't-init',
        dept: 'marketing',
        agent: 'mlead',
        title: 'Launch the Death of the PDF viral campaign',
        text: 'Prepare side-by-side comparison of static PDF vs 3D living document format (.ldocx).',
        plan: ['Analyze PDF friction points', 'Highlight 3D WebGL & sandbox', 'Draft Show HN post'],
        eta: 15,
        state: 'done',
        addedAt: Date.now() - 3600000,
        doneAt: Date.now() - 1800000,
        result: '# Death of the PDF Campaign\n\nStatic PDFs are 30-year-old frozen digital paper. LDoc Studio replaces them with living, 3D-accelerated, air-gapped computational containers.'
      }
    ];
  }
  return memTasks;
};

const saveTasks = list => {
  memTasks = list;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    // Read-only filesystem in Vercel - in-memory retains state across warm invocations
  }
};

const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const roster = loadRoster(BRAIN);
const AGENTS = roster.agents;
let skills = loadSkills(BRAIN, AGENTS);

const providerManager = new ProviderManager({
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || cfg.gemini?.apiKey || '',
    model: process.env.GEMINI_MODEL || cfg.gemini?.model || 'gemini-flash-latest'
  }
});

let graph = { notes: 0, nodes: [], links: [], floor: [] };
try {
  graph = await layoutGraph(BRAIN);
} catch {}

function vaultIndex() {
  const { notes } = readVault(BRAIN);
  const m = new Map();
  for (const [name, n] of notes) m.set(name, n.text);
  for (const n of readOfficeNotes(BRAIN)) m.set(n.name, n.text);
  return m;
}

function businessContext(index) {
  const bits = [];
  for (const k of ['CLAUDE', 'index', 'business-model', 'voice', 'ldocx-spec', 'competitive-moat']) {
    if (index.has(k)) bits.push(`--- ${k}.md ---\n${index.get(k).slice(0, 1200)}`);
  }
  return bits.join('\n\n');
}

function relevantNotes(index, dept, text, n = 4) {
  const words = new Set(String(text).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
  const mocName = { emails: 'MOC-Emails', sales: 'MOC-Sales', marketing: 'MOC-Marketing', ops: 'MOC-Operations', fin: 'MOC-Finance', delivery: 'MOC-Delivery' }[dept];
  const scored = [];
  for (const [name, txt] of index) {
    if (['CLAUDE', 'index', 'log'].includes(name)) continue;
    const hay = (name + ' ' + txt.slice(0, 1500)).toLowerCase();
    let s = 0;
    for (const w of words) if (hay.includes(w)) s += name.toLowerCase().includes(w) ? 3 : 1;
    if (name === mocName) s += 2;
    if (s) scored.push([s, name]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  const picks = scored.slice(0, n).map(x => x[1]);
  if (mocName && index.has(mocName) && !picks.includes(mocName)) picks.push(mocName);
  return picks;
}

function contextText(index, names) {
  return names.map(n => `--- ${n}.md ---\n${(index.get(n) || '').slice(0, 1800)}`).join('\n\n');
}

const persona = a => `${a.name}${a.lead ? ' (lead)' : ''} · ${a.role} · ${a.does}`;
function rosterText(dept) {
  return AGENTS.filter(a => a.department === dept).map(a => `- ${a.id} · ${persona(a)}`).join('\n');
}

function agentBrief(a) {
  const lessons = learn.promptText(BRAIN, a);
  return (a.brief ? `\nSTANDING INSTRUCTIONS FROM THE OWNER\n${a.brief}\n` : '') + (skills.promptText(a) ? `\n${skills.promptText(a)}\n` : '') + (lessons ? `\n${lessons}\n` : '');
}

async function askAI(system, user, { maxTokens = 2000, model = 'gemini-flash-latest' } = {}) {
  const res = await providerManager.generate(system, user, { maxTokens, model });
  return res.text;
}

function parseJSON(text) {
  const s = text.replace(/```json|```/g, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)); } catch {}
  }
  return {};
}

async function routeTask(dept, text) {
  const d = DEPTS[dept];
  const system = `You are the executive routing officer for J AI ENTERPRISES (LDoc Studio). Pick the single best agent for the founder request and return ONLY JSON.`;
  const user = `Department: ${d.name}\nAgents:\n${rosterText(dept)}\n\nRequest: "${text}"\n\nReturn JSON: {"agent":"<id>","title":"<concise title>","plan":["<step1>","<step2>"],"eta_minutes":15,"why":"<reason>","needs_ok":false}`;
  try {
    const raw = await askAI(system, user, { maxTokens: 400, model: 'gemini-flash-latest' });
    const j = parseJSON(raw);
    const valid = AGENTS.find(a => a.id === j.agent && a.department === dept);
    const agent = valid ? valid.id : (AGENTS.find(a => a.department === dept && a.lead) || AGENTS.find(a => a.department === dept)).id;
    return {
      agent,
      title: String(j.title || text).slice(0, 90),
      plan: Array.isArray(j.plan) ? j.plan.slice(0, 4).map(String) : ['Analyze requirements', 'Execute deliverable'],
      eta: Number.isFinite(j.eta_minutes) ? j.eta_minutes : 20,
      why: String(j.why || 'Assigned to specialist'),
      needsOk: false
    };
  } catch {
    const agent = (AGENTS.find(a => a.department === dept && a.lead) || AGENTS.find(a => a.department === dept)).id;
    return { agent, title: text.slice(0, 80), plan: ['Execute task'], eta: 15, why: 'Direct assignment', needsOk: false };
  }
}

async function runTask(task, feedback) {
  const a = AGENTS.find(x => x.id === task.agent);
  const d = DEPTS[a.department];
  const index = vaultIndex();
  const read = relevantNotes(index, a.department, task.title + ' ' + task.text);
  const system = `You are ${a.name}, ${a.role}, in the ${d.name} department of J AI ENTERPRISES (LDoc Studio). ${a.does}\n${agentBrief(a)}\n` +
    'Write the finished deliverable itself, not a description. Plain text with clean markdown headings and bullets. At most 350 words. ' +
    `\n\nCOMPANY NOTES\n${businessContext(index)}\n\nRELEVANT NOTES\n${contextText(index, read)}`;
  const user = `Task: ${task.title}\nRequest: ${task.text}` + (feedback ? `\n\nFounder requested revision: ${feedback}` : '');
  const result = await askAI(system, user, { maxTokens: 2500, model: 'gemini-flash-latest' });
  return { result, read, tools: ['gemini-ai'], used: ['Google Gemini Pro / Flash API'] };
}

async function chatAgent(agentId, text, history) {
  const a = AGENTS.find(x => x.id === agentId);
  if (!a) throw new Error('unknown agent');
  const d = DEPTS[a.department];
  const index = vaultIndex();
  const read = relevantNotes(index, a.department, text, 3);
  const system = `You are ${a.name}, ${a.role}, at J AI ENTERPRISES (makers of LDoc Studio and the Living Document Format .ldocx). ${a.does}\n${agentBrief(a)}\n` +
    'You are speaking directly to founder/CEO Jayaraman. Answer in first person, with executive confidence, precision, and zero fluff. Keep under 150 words unless asked for technical breakdown.' +
    `\n\nCOMPANY CONTEXT\n${businessContext(index)}\n\nRELEVANT NOTES\n${contextText(index, read)}`;
  const convo = (history || []).slice(-6).map(m => `${m.who === 'user' ? 'Founder' : a.name}: ${m.text}`).join('\n');
  const user = (convo ? convo + '\n' : '') + `Founder: ${text}\n${a.name}:`;
  const reply = await askAI(system, user, { maxTokens: 1500, model: 'gemini-flash-latest' });
  return { reply, read, tools: ['gemini-ai'], used: ['Google Gemini API'] };
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  const json = (code, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = code;
    res.end(JSON.stringify(data));
  };

  const parseBody = () => {
    if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
    if (req.body && typeof req.body === 'string') {
      try { return Promise.resolve(JSON.parse(req.body)); } catch {}
    }
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); }
      });
    });
  };

  try {
    if (pathname === '/api/health') {
      return json(200, {
        ok: true,
        version,
        backend: 'gemini',
        name: 'LDoc Studio Command Centre',
        company: 'J AI ENTERPRISES',
        model: 'gemini-flash-latest',
        models: ['gemini-flash-latest', 'gemini-3.6-flash'],
        notes: graph.notes,
        depts: DEPT_KEYS,
        agents: AGENTS.map(a => ({ id: a.id, name: a.name, role: a.role, does: a.does, tools: a.tools, department: a.department, lead: a.lead })),
        skills: skills.summary(),
        tools: true
      });
    }

    if (pathname === '/api/agents') {
      return json(200, {
        agents: AGENTS.map(a => ({ id: a.id, name: a.name, role: a.role, does: a.does, tools: a.tools, department: a.department, lead: a.lead })),
        problems: [],
        files: ['office.agents.json']
      });
    }

    if (pathname === '/api/brain') {
      return json(200, graph);
    }

    if (pathname === '/api/skills') {
      return json(200, skills.summary());
    }

    if (pathname === '/api/usage') {
      return json(200, {
        ok: true,
        source: 'gemini',
        office: { window: { total: 100, used: 0, resetHours: 24 } },
        plan: 'Google Gemini Pro / Flash API (Free Active Tier)'
      });
    }

    if (pathname === '/api/tasks' && req.method === 'GET') {
      return json(200, loadTasks());
    }

    if (pathname === '/api/tasks' && req.method === 'POST') {
      const b = await parseBody();
      if (!b.text) return json(400, { error: 'empty task' });
      const dept = b.dept || 'marketing';
      const r = await routeTask(dept, b.text);
      const task = {
        id: nid(),
        dept,
        agent: r.agent,
        title: r.title,
        text: b.text,
        plan: r.plan,
        eta: r.eta,
        why: r.why,
        state: 'next',
        addedAt: Date.now(),
        by: 'you'
      };
      const list = loadTasks();
      list.push(task);
      saveTasks(list);
      return json(200, task);
    }

    const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)(?:\/(run|revise|approve|reject))?$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      const action = taskMatch[2];
      const list = loadTasks();
      const task = list.find(t => t.id === taskId);
      if (!task) return json(404, { error: 'no such task' });

      if (req.method === 'DELETE') {
        saveTasks(list.filter(t => t.id !== taskId));
        return json(200, { ok: true });
      }

      if (action === 'run' || action === 'revise') {
        const b = await parseBody();
        task.state = 'doing';
        task.startedAt = Date.now();
        saveTasks(list);

        try {
          const out = await runTask(task, b.feedback);
          task.state = 'done';
          task.doneAt = Date.now();
          task.result = out.result;
          task.read = out.read;
          task.tools = out.tools;
          task.used = out.used;
          task.error = false;
        } catch (e) {
          task.state = 'done';
          task.doneAt = Date.now();
          task.result = 'Could not complete task: ' + e.message;
          task.error = true;
        }
        saveTasks(list);
        return json(200, task);
      }

      if (action === 'approve') {
        task.state = 'done';
        task.approved = true;
        task.approvedAt = Date.now();
        saveTasks(list);
        return json(200, task);
      }
    }

    if (pathname === '/api/chat' && req.method === 'POST') {
      const b = await parseBody();
      if (!b.text) return json(400, { error: 'empty message' });
      const r = await chatAgent(b.agent, b.text, b.history);
      return json(200, { ...r, interview: false });
    }

    if (pathname === '/api/routines') {
      return json(200, { routines: [], depts: routines.ALLOWED, path: 'brain/Agents Office/routines.json' });
    }

    return json(404, { error: 'not found' });
  } catch (err) {
    console.error('API error:', err);
    return json(500, { error: err.message });
  }
}