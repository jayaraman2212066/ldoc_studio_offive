import { useState, useMemo } from 'react';
import { PixelPanel } from '@/components/PixelPanel';
import { PixelButton } from '@/components/PixelButton';
import { PixelBadge } from '@/components/PixelBadge';
import { SpritePortrait } from '@/components/SpritePortrait';
import { Icon } from '@/components/Icon';
import { useStore, type Agent } from '@/store/store';
import { NewTicketModal } from './NewTicketModal';

export interface ProOrgChartViewProps {
  onOpenAgentTerminal?: (agentId: string) => void;
}

interface Department {
  id: string;
  name: string;
  badge: string;
  accent: string;
  description: string;
  keywords: string[];
}

const DEPARTMENTS: Department[] = [
  {
    id: 'executive',
    name: 'Executive Suite',
    badge: 'STRATEGY & OPS',
    accent: 'var(--cth-lemon)',
    description: 'Corporate leadership, resource allocation, unblocking agents, and overarching vision.',
    keywords: ['ceo', 'god', 'orchestrator', 'executive', 'director', 'strategy', 'founder']
  },
  {
    id: 'growth',
    name: 'Growth & Promotion',
    badge: 'MARKETING & PR',
    accent: 'var(--cth-peach)',
    description: 'Startup launch campaigns, Product Hunt submissions, Twitter/X threads, and media outreach.',
    keywords: ['cgo', 'growth', 'marketing', 'pr', 'content', 'social', 'writer', 'copy', 'sales']
  },
  {
    id: 'engineering',
    name: 'Engineering & DevRel',
    badge: 'TECH & PLATFORM',
    accent: 'var(--cth-sky)',
    description: 'Full-stack development, API integrations, webhooks, code repositories, and dev documentation.',
    keywords: ['cto', 'engineer', 'developer', 'devrel', 'backend', 'frontend', 'full-stack', 'quality', 'tech']
  },
  {
    id: 'product',
    name: 'Product & Intelligence',
    badge: 'ANALYSIS & DOSSIER',
    accent: 'var(--cth-mint)',
    description: 'Startup dossier compilation, competitor benchmarks, user personas, and feature roadmaps.',
    keywords: ['product', 'intelligence', 'analyst', 'research', 'dossier', 'compliance', 'finance', 'accounting']
  }
];

export function ProOrgChartView({ onOpenAgentTerminal }: ProOrgChartViewProps) {
  const agents = useStore((s) => s.agents);
  const setAddAgentOpen = useStore((s) => s.setAddAgentOpen);
  const select = useStore((s) => s.select);
  const [ticketAgent, setTicketAgent] = useState<Agent | null>(null);

  // Group agents into departments based on description/role/isGod
  const departmentAgents = useMemo(() => {
    const map = new Map<string, Agent[]>();
    for (const d of DEPARTMENTS) map.set(d.id, []);

    const assigned = new Set<string>();

    for (const agent of agents) {
      if (agent.isGod) {
        map.get('executive')!.push(agent);
        assigned.add(agent.id);
        continue;
      }

      const desc = `${agent.description || ''} ${agent.name || ''} ${agent.project || ''}`.toLowerCase();
      let foundDept = 'engineering'; // default fallback

      for (const d of DEPARTMENTS) {
        if (d.keywords.some((kw) => desc.includes(kw))) {
          foundDept = d.id;
          break;
        }
      }

      map.get(foundDept)!.push(agent);
      assigned.add(agent.id);
    }

    return map;
  }, [agents]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--cth-cream-50)', padding: 24, gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--cth-ink-100)',
          paddingBottom: 16
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--cth-font-ui)', fontWeight: 800, fontSize: 20, color: 'var(--cth-ink-900)' }}>
            Organizational Structure & Corporate Departments
          </div>
          <div style={{ fontSize: 13, color: 'var(--cth-ink-500)', marginTop: 4 }}>
            Autonomous departments powering Universal Company operations and multi-agent coordination.
          </div>
        </div>

        <PixelButton variant="primary" size="sm" onClick={() => setAddAgentOpen(true)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="plus" /> Add team member
          </span>
        </PixelButton>
      </div>

      {/* Departments Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {DEPARTMENTS.map((dept) => {
          const deptMembers = departmentAgents.get(dept.id) || [];

          return (
            <div
              key={dept.id}
              style={{
                background: 'var(--cth-paper-100)',
                border: '1px solid var(--cth-ink-300)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              {/* Department Header */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--cth-cream-100)',
                  borderBottom: '1px solid var(--cth-ink-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${dept.accent}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--cth-font-ui)', fontWeight: 700, fontSize: 15, color: 'var(--cth-ink-900)' }}>
                      {dept.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--cth-font-display)',
                        fontSize: 8,
                        padding: '2px 6px',
                        borderRadius: 2,
                        background: dept.accent,
                        color: 'var(--cth-ink-900)'
                      }}
                    >
                      {dept.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cth-ink-500)', marginTop: 2 }}>{dept.description}</div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cth-ink-700)' }}>
                  {deptMembers.length} member{deptMembers.length === 1 ? '' : 's'}
                </div>
              </div>

              {/* Members Row / Grid */}
              <div style={{ padding: 16 }}>
                {deptMembers.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--cth-ink-500)' }}>
                    No agents currently assigned to this department.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 12
                    }}
                  >
                    {deptMembers.map((agent) => (
                      <div
                        key={agent.id}
                        style={{
                          background: 'var(--cth-cream-50)',
                          border: '1px solid var(--cth-ink-100)',
                          borderRadius: 4,
                          padding: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              background: `var(--cth-${agent.accent}-light, var(--cth-cream-200))`,
                              boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)',
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0
                            }}
                          >
                            <SpritePortrait character={agent.character} scale={1} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--cth-ink-900)' }}>{agent.name}</div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--cth-ink-500)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {agent.description || 'Specialist'}
                            </div>
                          </div>

                          <PixelBadge status={agent.status} />
                        </div>

                        <div style={{ fontSize: 11, color: 'var(--cth-ink-700)', minHeight: 28, lineHeight: '14px' }}>
                          {agent.action || 'Ready for assignments.'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 'auto' }}>
                          <button
                            onClick={() => setTicketAgent(agent)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--cth-ink-700)',
                              padding: '2px 6px'
                            }}
                          >
                            + Ticket
                          </button>
                          <PixelButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              select(agent.id);
                              onOpenAgentTerminal?.(agent.id);
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="terminal" /> Open
                            </span>
                          </PixelButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {ticketAgent && <NewTicketModal agent={ticketAgent} onClose={() => setTicketAgent(null)} />}
    </div>
  );
}
