import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelPanel } from '@/components/PixelPanel';
import { PixelButton } from '@/components/PixelButton';
import { PixelBadge } from '@/components/PixelBadge';
import { SpritePortrait } from '@/components/SpritePortrait';
import { Icon } from '@/components/Icon';
import { useStore, type Agent } from '@/store/store';
import { NewTicketModal } from './NewTicketModal';
import { parseTasks, type HiveTask } from '@/components/TasksKanban';
import { realtimeAgentRunner } from '@/services/realtimeAgentRunner';

export interface ProTasksBoardProps {
  onOpenAgentTerminal?: (agentId: string) => void;
}

export function ProTasksBoard({ onOpenAgentTerminal }: ProTasksBoardProps) {
  const { t } = useTranslation();
  const agents = useStore((s) => s.agents);
  const setAddAgentOpen = useStore((s) => s.setAddAgentOpen);
  const select = useStore((s) => s.select);

  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<HiveTask[]>([]);
  const [ticketAgent, setTicketAgent] = useState<Agent | null>(null);

  const fetchTasks = async () => {
    try {
      const raw = await window.cth.hiveTasks();
      setTasks(parseTasks(raw));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.action && a.action.toLowerCase().includes(q))
    );
  }, [agents, searchQuery]);

  // Map tasks by assignee (matches agent name or agent id)
  const tasksByAgent = useMemo(() => {
    const map = new Map<string, HiveTask[]>();
    for (const task of tasks) {
      if (!task.assignee) continue;
      const key = task.assignee.toLowerCase();
      const existing = map.get(key) ?? [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  const workingCount = agents.filter((a) => a.status === 'working' || a.status === 'thinking').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--cth-cream-50)' }}>
      {/* Top Header Controls (Matching Screenshot 1) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--cth-ink-100)',
          background: 'var(--cth-cream-100)',
          flexShrink: 0,
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--cth-font-ui)', fontWeight: 700, fontSize: 16, color: 'var(--cth-ink-900)' }}>
            Agents
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              background: 'var(--cth-cream-300)',
              fontSize: 12,
              color: 'var(--cth-ink-700)',
              fontWeight: 500
            }}
          >
            {agents.length} agents • {workingCount} active
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 500, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents, tasks, roles..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                background: 'var(--cth-paper-100)',
                border: '1px solid var(--cth-ink-300)',
                borderRadius: 4,
                fontFamily: 'var(--cth-font-ui)',
                fontSize: 12,
                color: 'var(--cth-ink-900)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none', fontSize: 11 }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: 'var(--cth-ink-500)'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {searchQuery && (
            <PixelButton variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              Clear filter
            </PixelButton>
          )}

          <PixelButton variant="primary" size="sm" onClick={() => setAddAgentOpen(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="plus" /> Add an agent
            </span>
          </PixelButton>
        </div>
      </div>

      {/* Grid of Agent Work Cards */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
          alignContent: 'start'
        }}
      >
        {filteredAgents.map((agent) => {
          const agentTasks = tasksByAgent.get(agent.name.toLowerCase()) || tasksByAgent.get(agent.id.toLowerCase()) || [];
          const activeTask = agentTasks.find((t) => t.status === 'doing') || agentTasks.find((t) => t.status === 'todo');

          const pct = Math.min(8, Math.max(0, agent.progress ?? 0)) / 8 * 100;
          const gaugeColor =
            (agent.progress ?? 0) >= 7
              ? 'var(--cth-coral)'
              : (agent.progress ?? 0) >= 6
              ? 'var(--cth-lemon)'
              : `var(--cth-${agent.accent})`;

          return (
            <div
              key={agent.id}
              style={{
                background: 'var(--cth-paper-100)',
                border: '1px solid var(--cth-ink-300)',
                boxShadow: 'var(--cth-shadow-hard)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative'
              }}
            >
              {/* Agent Card Header */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--cth-cream-100)',
                  borderBottom: '1px solid var(--cth-ink-100)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: `var(--cth-${agent.accent}-light, var(--cth-cream-200))`,
                    boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <SpritePortrait character={agent.character} scale={1.1} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'var(--cth-font-ui)',
                        fontWeight: 700,
                        fontSize: 14,
                        color: 'var(--cth-ink-900)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {agent.name}
                    </span>
                    {agent.isGod && (
                      <span
                        style={{
                          fontFamily: 'var(--cth-font-display)',
                          fontSize: 7,
                          padding: '2px 4px',
                          background: 'var(--cth-ink-900)',
                          color: '#fff'
                        }}
                      >
                        ORCHESTRATOR
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--cth-ink-500)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 1
                    }}
                  >
                    {agent.description || 'Corporate Multi-Agent Worker'}
                  </div>
                </div>

                <PixelBadge status={agent.status} />
              </div>

              {/* Current Doing / Task Body */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ minHeight: 64 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--cth-font-display)', color: 'var(--cth-ink-500)' }}>
                      CURRENT TICKET / OBJECTIVE
                    </span>
                    {agent.status === 'working' && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--cth-mint-dark, #2E7D32)',
                        background: 'var(--cth-mint-light, #E8F5E9)',
                        padding: '1px 6px',
                        border: '1px solid var(--cth-mint, #81C784)'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }} />
                        EXECUTING LIVE
                      </span>
                    )}
                  </div>

                  {activeTask ? (
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'var(--cth-cream-50)',
                        border: '1px solid var(--cth-ink-100)',
                        borderLeft: `3px solid var(--cth-${activeTask.status === 'doing' ? 'lemon' : 'sky'})`,
                        fontSize: 12,
                        color: 'var(--cth-ink-900)'
                      }}
                    >
                      <div style={{ fontWeight: 600, lineHeight: '16px' }}>{activeTask.title}</div>
                      {activeTask.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--cth-ink-700)',
                            marginTop: 4,
                            lineHeight: '15px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {activeTask.description}
                        </div>
                      )}
                      {agent.action && agent.status === 'working' && (
                        <div style={{ fontSize: 11, color: 'var(--cth-ink-700)', marginTop: 6, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: 'var(--cth-mint, #2E7D32)' }}>▶</span> {agent.action}
                        </div>
                      )}
                      {activeTask.status === 'todo' && agent.status !== 'working' && !realtimeAgentRunner.isAgentBusy(agent.id) && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            onClick={() => {
                              void realtimeAgentRunner.dispatchAgentTask(agent, activeTask);
                            }}
                            style={{
                              background: 'var(--cth-mint-light, #E8F5E9)',
                              color: 'var(--cth-mint-dark, #2E7D32)',
                              border: '1px solid var(--cth-mint, #81C784)',
                              borderRadius: 2,
                              padding: '3px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <span>▶</span> Run Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'var(--cth-cream-50)',
                        border: agent.status === 'working' ? '1px solid var(--cth-mint)' : '1px dashed var(--cth-ink-300)',
                        fontSize: 12,
                        color: agent.status === 'working' ? 'var(--cth-ink-900)' : 'var(--cth-ink-500)',
                        fontStyle: agent.status === 'working' ? 'normal' : 'italic'
                      }}
                    >
                      {agent.action ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {agent.status === 'working' && <span style={{ color: '#2E7D32' }}>▶</span>}
                          <span>{agent.action}</span>
                        </div>
                      ) : (
                        'Idle. Ready to receive next ticket.'
                      )}
                    </div>
                  )}
                </div>

                {/* Telemetry / Model / Context Info */}
                <div
                  style={{
                    padding: '6px 8px',
                    background: 'var(--cth-paper-200)',
                    fontSize: 11,
                    color: 'var(--cth-ink-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto'
                  }}
                >
                  <span>
                    Model: <strong>{agent.model || 'Default CLI'}</strong>
                  </span>
                  <span>
                    {agent.contextTokens ? `${Math.round(agent.contextTokens / 1000)}k tokens` : '0 tokens'}
                  </span>
                </div>

                {/* Context Gauge Bar */}
                <div
                  style={{
                    width: '100%',
                    height: 3,
                    background: 'var(--cth-cream-200)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ width: `${pct}%`, height: '100%', background: gaugeColor, transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Action Buttons (Matching Screenshot 1) */}
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--cth-cream-100)',
                  borderTop: '1px solid var(--cth-ink-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}
              >
                <button
                  onClick={() => setTicketAgent(agent)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--cth-font-ui)',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--cth-ink-700)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    borderRadius: 2
                  }}
                >
                  <span style={{ fontSize: 14 }}>+</span> Add a ticket
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
                    <Icon name="terminal" /> Prompt
                  </span>
                </PixelButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Ticket Modal */}
      {ticketAgent && (
        <NewTicketModal
          agent={ticketAgent}
          onClose={() => setTicketAgent(null)}
          onCreated={() => {
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
