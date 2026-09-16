import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelPanel } from '@/components/PixelPanel';
import { PixelButton } from '@/components/PixelButton';
import { SpritePortrait } from '@/components/SpritePortrait';
import { Icon } from '@/components/Icon';
import { useStore, type Agent } from '@/store/store';
import type { HiveTask } from '@/components/TasksKanban';
import { realtimeAgentRunner } from '@/services/realtimeAgentRunner';

export interface NewTicketModalProps {
  agent: Agent;
  onClose: () => void;
  onCreated?: (task: HiveTask) => void;
}

export function NewTicketModal({ agent, onClose, onCreated }: NewTicketModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enqueueMessage = useStore((s) => s.enqueueMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setSubmitting(true);
    setError(null);

    try {
      const id = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const task: HiveTask = {
        id,
        title: cleanTitle,
        description: detail.trim() || undefined,
        assignee: agent.name,
        status: 'doing',
        dependsOn: [],
        priority: 3,
        createdAt: new Date().toISOString()
      };

      const res = await window.cth.hiveAddTask(task);
      if (!res.ok) {
        throw new Error(res.error || 'Failed to create task in hive ledger');
      }

      // Send inter-agent request message
      try {
        await window.cth.hiveSend(
          {
            to: agent.id,
            act: 'request',
            conversation: `ticket-${task.id}`,
            subject: task.title,
            body: task.description ? `${task.title}\n\n${task.description}` : task.title
          },
          'human'
        );
      } catch {
        /* best-effort messaging */
      }

      // Execute real-time agent work with live UI state synchronization
      void realtimeAgentRunner.dispatchAgentTask(agent, task);

      // If agent has active PTY, also queue to terminal for immediate dispatch
      if (agent.ptyId) {
        enqueueMessage(
          agent.id,
          `New assigned ticket [${task.title}]: ${task.description || 'Proceed with this task.'}`
        );
      }

      onCreated?.(task);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 19, 32, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
        <PixelPanel
          variant="dialog"
          title={`New Ticket for ${agent.name}`}
          noPadding
          style={{ overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--cth-cream-100)',
              borderBottom: '1px solid var(--cth-ink-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
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
                  overflow: 'hidden'
                }}
              >
                <SpritePortrait character={agent.character} scale={1} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--cth-font-ui)', fontWeight: 600, fontSize: 14, color: 'var(--cth-ink-900)' }}>
                  Assign work to {agent.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--cth-ink-500)' }}>
                  {agent.description || 'Agent on the floor'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--cth-ink-500)',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Close"
            >
              <Icon name="x" />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--cth-coral-light)',
                  border: '1px solid var(--cth-coral)',
                  color: 'var(--cth-ink-900)',
                  fontSize: 12,
                  borderRadius: 2
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--cth-font-display)',
                  fontSize: 9,
                  color: 'var(--cth-ink-700)',
                  marginBottom: 4,
                  letterSpacing: '0.05em'
                }}
              >
                TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing, in one line"
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--cth-paper-100)',
                  border: '1px solid var(--cth-ink-300)',
                  fontFamily: 'var(--cth-font-ui)',
                  fontSize: 13,
                  color: 'var(--cth-ink-900)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--cth-font-display)',
                  fontSize: 9,
                  color: 'var(--cth-ink-700)',
                  marginBottom: 4,
                  letterSpacing: '0.05em'
                }}
              >
                DETAIL
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={5}
                placeholder="Context, constraints, what 'done' looks like. Optional. Anything the agent cannot work out on its own. This writes a card into this board, assigns it to this agent and sends them a message about it."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--cth-paper-100)',
                  border: '1px solid var(--cth-ink-300)',
                  fontFamily: 'var(--cth-font-ui)',
                  fontSize: 13,
                  lineHeight: '18px',
                  color: 'var(--cth-ink-900)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--cth-ink-500)', lineHeight: '15px' }}>
                Context, constraints, what &apos;done&apos; looks like. Optional. Anything the agent cannot work out on its own.
                This writes a card into this board, assigns it to {agent.name} and sends {agent.name} a message about it. If the card cannot be written, nothing is sent.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <PixelButton type="button" variant="ghost" size="md" onClick={onClose} disabled={submitting}>
                cancel
              </PixelButton>
              <PixelButton type="submit" variant="primary" size="md" disabled={submitting || !title.trim()}>
                {submitting ? 'Creating...' : 'Create and send'}
              </PixelButton>
            </div>
          </form>
        </PixelPanel>
      </div>
    </div>
  );
}
