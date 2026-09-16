import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, selectedAgent, type Agent } from '@/store/store';
import { SpritePortrait } from '@/components/SpritePortrait';
import { PixelButton } from '@/components/PixelButton';
import { PixelBadge } from '@/components/PixelBadge';
import { Icon } from '@/components/Icon';
import { ProTasksBoard } from './ProTasksBoard';
import { ProInboxView } from './ProInboxView';
import { ProOrgChartView } from './ProOrgChartView';
import { StartupPortfolioTab } from '@/components/StartupPortfolioTab';
import { CeoDashboardPanel } from '@/components/CeoDashboardPanel';
import { TriggersTab } from '@/components/triggers/TriggersTab';
import { MemoryGraphPanel } from '@/components/MemoryGraphPanel';
import { AgentDetailPanel } from '@/components/AgentDetailPanel';
import brandLogo from '@brand/logo.png?url';

export type ProTab = 'tasks' | 'inbox' | 'startups' | 'ceo' | 'org' | 'automations' | 'memory';

export function ProWorkspace() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProTab>('tasks');
  const [rosterSearch, setRosterSearch] = useState('');
  const [terminalDrawerOpen, setTerminalDrawerOpen] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState<string | undefined>(undefined);

  const agents = useStore((s) => s.agents);
  const selected = useStore(selectedAgent);
  const select = useStore((s) => s.select);
  const setAddAgentOpen = useStore((s) => s.setAddAgentOpen);

  const orchestrator = agents.find((a) => a.isGod) || agents[0];
  const orchestratorName = orchestrator?.name || 'Orchestrator';

  const filteredRoster = useMemo(() => {
    const q = rosterSearch.toLowerCase().trim();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }, [agents, rosterSearch]);

  const navItems: { id: ProTab; label: string; icon: Parameters<typeof Icon>[0]['name']; badge?: number }[] = [
    { id: 'tasks', label: 'Tasks', icon: 'check' },
    { id: 'inbox', label: 'Inbox', icon: 'sparkle' },
    { id: 'startups', label: 'Startups', icon: 'web' },
    { id: 'ceo', label: 'CEO Radar', icon: 'sparkle' },
    { id: 'org', label: 'Org Chart', icon: 'mcp' },
    { id: 'automations', label: 'Automations', icon: 'clock' },
    { id: 'memory', label: 'Memory', icon: 'sparkle' }
  ];

  const handleOpenAgentTerminal = (agentId: string) => {
    select(agentId);
    setTerminalDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--cth-cream-50)' }}>
      {/* ── PRO LEFT SIDEBAR (Matching Screenshot 1 & 2) ────────────────── */}
      <div
        style={{
          width: 280,
          background: 'var(--cth-cream-100)',
          borderRight: '1px solid var(--cth-ink-100)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          userSelect: 'none'
        }}
      >
        {/* Company Header */}
        <div
          style={{
            padding: '16px 14px',
            borderBottom: '1px solid var(--cth-ink-100)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <img src={brandLogo} alt="Universal Company" style={{ height: 26, width: 'auto' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--cth-font-ui)',
                fontWeight: 800,
                fontSize: 14,
                color: 'var(--cth-ink-900)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Universal Company
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--cth-ink-500)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {orchestratorName} runs the floor
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, borderBottom: '1px solid var(--cth-ink-100)' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 4,
                  border: 'none',
                  background: isActive ? 'var(--cth-cream-200)' : 'transparent',
                  color: isActive ? 'var(--cth-ink-900)' : 'var(--cth-ink-700)',
                  fontFamily: 'var(--cth-font-ui)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease'
                }}
              >
                <Icon name={item.icon} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'var(--cth-coral)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Agents Roster Section Header */}
        <div
          style={{
            padding: '12px 14px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--cth-font-display)', fontSize: 9, color: 'var(--cth-ink-500)', letterSpacing: '0.05em' }}>
              AGENTS
            </span>
            <span style={{ fontSize: 10, color: 'var(--cth-ink-300)', fontWeight: 600 }}>
              {agents.length}
            </span>
          </div>

          <button
            onClick={() => setAddAgentOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--cth-ink-700)',
              padding: 2,
              display: 'flex',
              alignItems: 'center'
            }}
            title="Add Agent"
          >
            <Icon name="plus" />
          </button>
        </div>

        {/* Search Agents */}
        <div style={{ padding: '0 10px 8px' }}>
          <input
            type="text"
            value={rosterSearch}
            onChange={(e) => setRosterSearch(e.target.value)}
            placeholder="Search agents..."
            style={{
              width: '100%',
              padding: '4px 8px',
              background: 'var(--cth-paper-100)',
              border: '1px solid var(--cth-ink-300)',
              borderRadius: 3,
              fontFamily: 'var(--cth-font-ui)',
              fontSize: 11,
              color: 'var(--cth-ink-900)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Live Agents List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredRoster.map((agent) => {
            const isSelected = selected?.id === agent.id;
            const isWorking = agent.status === 'working' || agent.status === 'thinking';

            return (
              <div
                key={agent.id}
                onClick={() => {
                  select(agent.id);
                  setTerminalDrawerOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 4,
                  background: isSelected ? 'var(--cth-paper-100)' : 'transparent',
                  boxShadow: isSelected ? 'inset 0 0 0 1px var(--cth-ink-300)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    background: `var(--cth-${agent.accent}-light, var(--cth-cream-200))`,
                    boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <SpritePortrait character={agent.character} scale={0.8} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 12,
                        color: 'var(--cth-ink-900)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {agent.name}
                    </span>
                    {agent.isGod && (
                      <span style={{ fontSize: 8, fontFamily: 'var(--cth-font-display)', color: 'var(--cth-ink-500)' }}>
                        ★
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--cth-ink-500)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {agent.description || 'Worker'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isWorking ? 'var(--cth-mint)' : agent.status === 'blocked' ? 'var(--cth-coral)' : 'var(--cth-status-idle)'
                    }}
                  />
                  {agent.contextTokens !== undefined && (
                    <span style={{ fontSize: 9, color: 'var(--cth-ink-300)' }}>
                      {Math.round(agent.contextTokens / 1000)}k
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: CEO (You) */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--cth-ink-100)',
            background: 'var(--cth-cream-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cth-mint)' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--cth-ink-900)' }}>CEO (You)</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--cth-ink-500)' }}>Connected</span>
        </div>
      </div>

      {/* ── PRO MAIN WORKSPACE VIEW ─────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
          {activeTab === 'tasks' && <ProTasksBoard onOpenAgentTerminal={handleOpenAgentTerminal} />}
          {activeTab === 'inbox' && <ProInboxView />}
          {activeTab === 'startups' && (
            <StartupPortfolioTab
              initialStartupId={selectedStartupId}
              onOpenConnect={() => {
                setSelectedStartupId(undefined);
                setActiveTab('ceo');
              }}
            />
          )}
          {activeTab === 'ceo' && (
            <CeoDashboardPanel
              onOpenStartup={(id) => {
                setSelectedStartupId(id);
                setActiveTab('startups');
              }}
              onConnectClick={() => {
                setSelectedStartupId(undefined);
                setActiveTab('startups');
              }}
            />
          )}
          {activeTab === 'org' && <ProOrgChartView onOpenAgentTerminal={handleOpenAgentTerminal} />}
          {activeTab === 'automations' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <TriggersTab />
            </div>
          )}
          {activeTab === 'memory' && (
            <div style={{ height: '100%', overflow: 'hidden' }}>
              <MemoryGraphPanel
                godId={orchestrator?.id || 'god'}
                onJumpToMemory={(agentId) => handleOpenAgentTerminal(agentId)}
              />
            </div>
          )}
        </div>

        {/* ── PRO DOCKED AGENT WORKSPACE / TERMINAL DRAWER ──────────────── */}
        {terminalDrawerOpen && selected && (
          <div
            style={{
              width: 480,
              maxWidth: '50%',
              height: '100%',
              background: 'var(--cth-paper-100)',
              borderLeft: '1px solid var(--cth-ink-300)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Drawer Close Bar */}
            <div
              style={{
                padding: '4px 10px',
                background: 'var(--cth-cream-200)',
                borderBottom: '1px solid var(--cth-ink-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--cth-font-display)', fontSize: 8, color: 'var(--cth-ink-700)' }}>
                  TERMINAL DOCK
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cth-ink-900)' }}>
                  {selected.name}
                </span>
              </div>
              <button
                onClick={() => setTerminalDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--cth-ink-500)',
                  padding: 2
                }}
                title="Close Dock"
              >
                ✕
              </button>
            </div>

            {/* Agent Detail / Terminal View */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <AgentDetailPanel agent={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
