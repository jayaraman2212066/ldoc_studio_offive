/**
 * Durable agent role vs live status.
 *
 * Hive `registry.json` stores `role` (job / hire one-liner). The floor roster
 * stores the same string as `description`. Live run-state belongs on
 * `status` / `action` — never on role. Pause, idle, and Cursor "standby"
 * captions are status, not a job.
 */

const TRANSIENT_ROLE_RE = /^(on\s+)?standby$|^(idle|awaiting|paused|resumed|working|thinking|archived|starting up|reconnecting…?|running the floor|a fresh harness)$/i;

/**
 * Standard corporate roles for Universal Company.
 */
export const UNIVERSAL_COMPANY_ROLES = [
  { id: 'ceo', name: 'Chief Executive Officer (CEO)', department: 'Executive', isGod: true, description: "Runs the floor, sets strategy, coordinates departments and unblocks the team." },
  { id: 'cgo', name: 'Chief Growth Officer (CGO)', department: 'Growth', description: "Oversees marketing, launch campaigns, viral distribution, and startup promotion." },
  { id: 'cto', name: 'Chief Technology Officer (CTO)', department: 'Engineering', description: "Leads technical architecture, integrations, APIs, and infrastructure." },
  { id: 'product_lead', name: 'Head of Product', department: 'Product', description: "Profiles startups, crafts product dossiers, analyzes competitors, and refines USPs." },
  { id: 'content_strategist', name: 'Content Strategist & Copywriter', department: 'Growth', description: "Writes viral Twitter/X threads, LinkedIn founder posts, press releases, and articles." },
  { id: 'pr_specialist', name: 'PR & Community Lead', department: 'Growth', description: "Manages ProductHunt submissions, directory listings, outreach, and community engagement." },
  { id: 'lead_dev', name: 'Senior Full-Stack Engineer', department: 'Engineering', description: "Builds product integrations, webhooks, SDKs, and code repositories." },
  { id: 'devrel', name: 'DevRel & Technical Writer', department: 'Engineering', description: "Creates technical deep dives, tutorials, and documentation for startup APIs." },
] as const;

export function isDurableRole(text: string | undefined | null): boolean {
  const value = (text ?? '').trim();
  if (!value) return false;
  return !TRANSIENT_ROLE_RE.test(value);
}

/**
 * Pick the job string that should survive a respawn or roster/registry sync.
 * A real hire role always beats a status-like caption. When both are durable,
 * `candidate` wins (the value the operator just set).
 */
export function preferredAgentRole(
  candidate: string | undefined | null,
  fallback: string | undefined | null,
  isGod = false
): string {
  const incoming = (candidate ?? '').trim();
  const existing = (fallback ?? '').trim();
  if (isDurableRole(incoming)) return incoming;
  if (isDurableRole(existing)) return existing;
  if (incoming) return incoming;
  if (existing) return existing;
  return isGod ? 'orchestrator (god)' : 'agent';
}

/** Role to send on spawn/restart. Omit a transient roster caption so the hive
 *  registry can keep the last real hire role. */
export function roleForHiveSpawn(agent: {
  description?: string;
  isGod?: boolean;
  isAssistant?: boolean;
}): string | undefined {
  if (agent.isGod) return preferredAgentRole(agent.description, 'orchestrator (god)', true);
  if (agent.isAssistant) {
    return preferredAgentRole(agent.description, "Executive Strategy Assistant");
  }
  const role = agent.description?.trim();
  return role && isDurableRole(role) ? role : undefined;
}

