import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelPanel } from '@/components/PixelPanel';
import { PixelButton } from '@/components/PixelButton';
import { SpritePortrait } from '@/components/SpritePortrait';
import { Icon } from '@/components/Icon';
import { useStore, type Agent } from '@/store/store';
import { AskMeTab } from '@/components/AskMeTab';
import { TriggersTab } from '@/components/triggers/TriggersTab';

type InboxSubTab = 'routed' | 'askme' | 'slack' | 'webhooks';

interface MessageFeedItem {
  id: string;
  from: string;
  to: string;
  act: string;
  subject: string;
  body: string;
  created_at: string;
}

const ACT_COLOR: Record<string, string> = {
  request: 'var(--cth-peach, #D99168)',
  inform: 'var(--cth-sky, #4F9FAF)',
  propose: 'var(--cth-lilac, #9482D3)',
  query: 'var(--cth-lemon, #DCAB3C)',
  agree: 'var(--cth-mint, #5CA97A)',
  refuse: 'var(--cth-coral, #D96A62)',
  done: 'var(--cth-mint, #5CA97A)'
};

export function ProInboxView() {
  const { t } = useTranslation();
  const agents = useStore((s) => s.agents);
  const orchestrator = agents.find((a) => a.isGod) || agents[0];
  const orchestratorName = orchestrator?.name || 'the orchestrator';

  const [subTab, setSubTab] = useState<InboxSubTab>('routed');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<MessageFeedItem[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(orchestrator?.id || '');
  const [composerText, setComposerText] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch inboxes for all agents to aggregate all routed messages
  const loadAllMessages = async () => {
    try {
      const all: MessageFeedItem[] = [];
      for (const a of agents) {
        try {
          const inbox = await window.cth.hiveInbox(a.id);
          if (Array.isArray(inbox)) {
            for (const m of inbox) {
              all.push({
                id: m.id || `${a.id}-${m.created_at}-${Math.random()}`,
                from: m.from || 'system',
                to: a.name || a.id,
                act: m.act || 'inform',
                subject: m.subject || '(no subject)',
                body: m.body || '',
                created_at: m.created_at || new Date().toISOString()
              });
            }
          }
        } catch {
          /* ignore */
        }
      }

      // Deduplicate by id and sort newest first
      const seen = new Set<string>();
      const deduped: MessageFeedItem[] = [];
      for (const m of all) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          deduped.push(m);
        }
      }
      deduped.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setMessages(deduped);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadAllMessages();
    const timer = setInterval(loadAllMessages, 4000);
    return () => clearInterval(timer);
  }, [agents]);

  // Listen to real-time live route events
  useEffect(() => {
    const unsub = window.cth.onHiveMessage?.((ev) => {
      setMessages((prev) => [
        {
          id: ev.id,
          from: ev.from,
          to: ev.to,
          act: ev.act,
          subject: ev.subject,
          body: `Routed message to ${ev.targets?.join(', ') || ev.to}`,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
    });
    return unsub;
  }, []);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.from.toLowerCase().includes(q) ||
        m.to.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = composerText.trim();
    if (!text || !selectedRecipientId) return;

    setSending(true);
    try {
      await window.cth.hiveSend(
        {
          to: selectedRecipientId,
          act: 'inform',
          conversation: `msg-${Date.now()}`,
          subject: text.slice(0, 40),
          body: text
        },
        'human'
      );
      setComposerText('');
      await loadAllMessages();
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Sub-navigation column (Matching Screenshot 2) */}
      <div
        style={{
          width: 260,
          background: 'var(--cth-paper-100)',
          borderRight: '1px solid var(--cth-ink-100)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid var(--cth-ink-100)' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              style={{
                width: '100%',
                padding: '6px 8px 6px 26px',
                background: 'var(--cth-cream-50)',
                border: '1px solid var(--cth-ink-300)',
                borderRadius: 4,
                fontFamily: 'var(--cth-font-ui)',
                fontSize: 12,
                color: 'var(--cth-ink-900)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: 11 }}>
              🔍
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* FOR YOU */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'var(--cth-font-display)',
                color: 'var(--cth-ink-500)',
                padding: '0 8px 6px',
                letterSpacing: '0.05em'
              }}
            >
              FOR YOU
            </div>
            <button
              onClick={() => setSubTab('askme')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: subTab === 'askme' ? 'var(--cth-cream-200)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="bell" />
                <span style={{ fontSize: 13, fontWeight: subTab === 'askme' ? 600 : 400, color: 'var(--cth-ink-900)' }}>
                  Ask me
                </span>
              </div>
            </button>
          </div>

          {/* YOUR TEAM */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'var(--cth-font-display)',
                color: 'var(--cth-ink-500)',
                padding: '0 8px 6px',
                letterSpacing: '0.05em'
              }}
            >
              YOUR TEAM
            </div>
            <button
              onClick={() => setSubTab('routed')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: subTab === 'routed' ? 'var(--cth-cream-200)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="sparkle" />
                <span style={{ fontSize: 13, fontWeight: subTab === 'routed' ? 600 : 400, color: 'var(--cth-ink-900)' }}>
                  All routed messages
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: 'var(--cth-cream-300)',
                  color: 'var(--cth-ink-700)'
                }}
              >
                {messages.length}
              </span>
            </button>
          </div>

          {/* OUTPOST */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'var(--cth-font-display)',
                color: 'var(--cth-ink-500)',
                padding: '0 8px 6px',
                letterSpacing: '0.05em'
              }}
            >
              OUTPOST
            </div>
            <button
              onClick={() => setSubTab('slack')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                background: subTab === 'slack' ? 'var(--cth-cream-200)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Icon name="web" />
              <span style={{ fontSize: 13, fontWeight: subTab === 'slack' ? 600 : 400, color: 'var(--cth-ink-900)' }}>
                Slack
              </span>
            </button>

            <button
              onClick={() => setSubTab('webhooks')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                background: subTab === 'webhooks' ? 'var(--cth-cream-200)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: 2
              }}
            >
              <Icon name="clock" />
              <span style={{ fontSize: 13, fontWeight: subTab === 'webhooks' ? 600 : 400, color: 'var(--cth-ink-900)' }}>
                Webhooks
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--cth-cream-50)' }}>
        {subTab === 'askme' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AskMeTab />
          </div>
        ) : subTab === 'webhooks' || subTab === 'slack' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <TriggersTab />
          </div>
        ) : (
          <>
            {/* Header (Matching Screenshot 2) */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--cth-ink-100)',
                background: 'var(--cth-cream-100)',
                flexShrink: 0
              }}
            >
              <div style={{ fontFamily: 'var(--cth-font-ui)', fontWeight: 700, fontSize: 16, color: 'var(--cth-ink-900)' }}>
                All routed messages
              </div>
              <div style={{ fontSize: 12, color: 'var(--cth-ink-500)', marginTop: 2 }}>
                Every message between every agent, routed by {orchestratorName}.
              </div>
            </div>

            {/* Message Feed */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredMessages.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--cth-ink-500)',
                    gap: 8
                  }}
                >
                  <Icon name="sparkle" />
                  <div>No messages between agents yet. Send one below!</div>
                </div>
              ) : (
                filteredMessages.map((m) => {
                  const fromAgent = agents.find((a) => a.id === m.from || a.name.toLowerCase() === m.from.toLowerCase());
                  const toAgent = agents.find((a) => a.id === m.to || a.name.toLowerCase() === m.to.toLowerCase());

                  return (
                    <div
                      key={m.id}
                      style={{
                        background: 'var(--cth-paper-100)',
                        border: '1px solid var(--cth-ink-100)',
                        borderRadius: 4,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: 'var(--cth-ink-900)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            {fromAgent?.character && <SpritePortrait character={fromAgent.character} scale={0.7} />}
                            {m.from}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--cth-ink-300)' }}>➔</span>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: 'var(--cth-ink-900)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            {toAgent?.character && <SpritePortrait character={toAgent.character} scale={0.7} />}
                            {m.to}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontFamily: 'var(--cth-font-display)',
                              padding: '2px 6px',
                              borderRadius: 2,
                              background: ACT_COLOR[m.act] || 'var(--cth-cream-300)',
                              color: '#fff'
                            }}
                          >
                            {m.act.toUpperCase()}
                          </span>
                        </div>

                        <span style={{ fontSize: 11, color: 'var(--cth-ink-500)' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {m.subject && m.subject !== '(no subject)' && (
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--cth-ink-700)' }}>{m.subject}</div>
                      )}

                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: '18px',
                          color: 'var(--cth-ink-700)',
                          background: 'var(--cth-cream-50)',
                          padding: '8px 12px',
                          borderRadius: 3,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Interactive Message Composer (Matching Screenshot 2) */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--cth-ink-100)',
                background: 'var(--cth-cream-100)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: 'var(--cth-ink-500)', fontWeight: 500 }}>To:</span>
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--cth-paper-100)',
                    border: '1px solid var(--cth-ink-300)',
                    borderRadius: 4,
                    fontFamily: 'var(--cth-font-ui)',
                    fontSize: 12,
                    color: 'var(--cth-ink-900)',
                    outline: 'none'
                  }}
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.isGod ? '(router)' : `(${a.description || 'agent'})`}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Write a message..."
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  background: 'var(--cth-paper-100)',
                  border: '1px solid var(--cth-ink-300)',
                  borderRadius: 4,
                  fontFamily: 'var(--cth-font-ui)',
                  fontSize: 13,
                  color: 'var(--cth-ink-900)',
                  outline: 'none'
                }}
              />

              <PixelButton type="submit" variant="primary" size="md" disabled={sending || !composerText.trim()}>
                {sending ? 'Sending...' : 'Send'}
              </PixelButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
