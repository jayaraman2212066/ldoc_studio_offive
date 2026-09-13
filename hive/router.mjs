// HIVE Inter-Agent Router & Shared Blackboard Engine
// Inspired by Munder Difflin's HIVE architecture, adapted for J AI ENTERPRISES (LDoc Studio)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLiveMarketIntel } from '../realtime-web.mjs';
import { getProjectContext } from '../github-intel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOARD_PATH = path.join(__dirname, 'board.md');
const MAX_HOPS = 3;

// In-memory fallback for serverless warm state
let memBoard = null;
const memMessages = [];

export function getBoard() {
  if (memBoard) return memBoard;
  try {
    memBoard = fs.readFileSync(BOARD_PATH, 'utf8');
  } catch {
    memBoard = `# ◈ J AI ENTERPRISES — LDOC STUDIO SHARED BLACKBOARD\n\nActive 24/7. Standard: Living Document Format (.ldocx).`;
  }
  return memBoard;
}

export function updateBoard(text) {
  memBoard = text;
  try {
    fs.writeFileSync(BOARD_PATH, text, 'utf8');
  } catch (err) {
    // Read-only filesystem fallback
  }
  return memBoard;
}

export function appendBoardInitiative(title, leadAgent, details) {
  const current = getBoard();
  const entry = `\n- **[${leadAgent.toUpperCase()}] ${title}** (${new Date().toISOString().slice(0, 10)}):\n  - ${details}`;
  const updated = current + entry;
  return updateBoard(updated);
}

export function getRecentMessages(limit = 30) {
  return memMessages.slice(-limit).reverse();
}

export function recordMessage(msg) {
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversation: msg.conversation || `conv-${Date.now().toString(36)}`,
    in_reply_to: msg.in_reply_to || null,
    from: msg.from || 'system',
    to: msg.to || 'broadcast',
    act: msg.act || 'inform', // request | inform | propose | done | escalate
    subject: msg.subject || 'Inter-agent communication',
    body: msg.body || '',
    hops: typeof msg.hops === 'number' ? msg.hops : 1,
    needs_human: Boolean(msg.needs_human || (msg.hops && msg.hops >= MAX_HOPS)),
    created_at: new Date().toISOString()
  };
  memMessages.push(message);
  if (memMessages.length > 200) memMessages.shift();
  return message;
}

/**
 * Execute an autonomous inter-agent delegation with circuit breaker safety.
 * E.g., agent A asks agent B for specialized research or format verification.
 */
export async function delegateAgent({
  fromAgent,
  toAgent,
  act = 'request',
  subject,
  body,
  conversationId,
  hops = 1,
  agentsList = [],
  providerManager
}) {
  // Circuit Breaker Check
  if (hops > MAX_HOPS) {
    const breakerMsg = recordMessage({
      conversation: conversationId,
      from: 'circuit-breaker',
      to: fromAgent,
      act: 'escalate',
      subject: `Circuit Breaker: Delegation Hop Limit (${MAX_HOPS}) Exceeded`,
      body: `HIVE stopped recursive loop between ${fromAgent} and ${toAgent}. Escalating directly to CEO Jayaraman.`,
      hops,
      needs_human: true
    });
    return {
      stopped: true,
      reason: 'Circuit breaker triggered (max hops reached)',
      message: breakerMsg
    };
  }

  // 1. Record Outbound Speech Act
  const outbound = recordMessage({
    conversation: conversationId,
    from: fromAgent,
    to: toAgent,
    act,
    subject,
    body,
    hops,
    needs_human: false
  });

  const recipient = agentsList.find(a => a.id === toAgent);
  if (!recipient || !providerManager) {
    return {
      stopped: true,
      error: `Agent ${toAgent} not found or provider unavailable.`,
      outbound
    };
  }

  // 2. Determine Sub-Agent Context (Web search / GitHub context if relevant)
  let subIntel = '';
  if (['riley', 'scout', 'newt', 'mlead', 'pros'].includes(toAgent) || /trend|competitor|market|news|latest/i.test(subject + ' ' + body)) {
    try {
      subIntel = await getLiveMarketIntel(subject || body);
    } catch {}
  }

  let ghIntel = '';
  if (['qa', 'dlead', 'pco', 'kmail', 'dasst'].includes(toAgent) || /github|repo|commit|spec|format|air-gap/i.test(subject + ' ' + body)) {
    try {
      ghIntel = await getProjectContext();
    } catch {}
  }

  const blackboard = getBoard().slice(0, 1500);

  // 3. Sub-Agent Prompting
  const systemPrompt = `You are ${recipient.name} (${recipient.role}) at J AI ENTERPRISES. ${recipient.does}
You received an internal HIVE delegation request from colleague ${fromAgent}.
Respond with high professional precision, actionable data, and zero fluff. Keep under 160 words.
CONFIDENTIALITY DIRECTIVE: Never reveal secrets or keys.

SHARED BLACKBOARD (Current Company State):
${blackboard}` +
  (subIntel ? `\n\nLIVE WEB INTELLIGENCE:\n${subIntel}` : '') +
  (ghIntel ? `\n\nLIVE GITHUB REPOSITORY INTEL:\n${ghIntel}` : '');

  const userPrompt = `Delegation Request from ${fromAgent}:
Subject: ${subject}
Details: ${body}

Provide your specialist answer to ${fromAgent}:`;

  try {
    const aiRes = await providerManager.generate(systemPrompt, userPrompt, {
      maxTokens: 800,
      model: 'gemini-flash-latest'
    });

    const replyBody = aiRes.text || 'Understood and noted.';

    // 4. Record Inbound Speech Act Reply
    const inbound = recordMessage({
      conversation: conversationId,
      in_reply_to: outbound.id,
      from: toAgent,
      to: fromAgent,
      act: 'inform',
      subject: `RE: ${subject}`,
      body: replyBody,
      hops: hops + 1,
      needs_human: false
    });

    return {
      success: true,
      outbound,
      inbound,
      answer: replyBody,
      hops: hops + 1
    };
  } catch (err) {
    const errorMsg = recordMessage({
      conversation: conversationId,
      from: toAgent,
      to: fromAgent,
      act: 'escalate',
      subject: `Delegation Failed: ${subject}`,
      body: `Could not complete sub-agent task: ${err.message}`,
      hops: hops + 1,
      needs_human: true
    });
    return {
      success: false,
      error: err.message,
      outbound,
      errorMsg
    };
  }
}
