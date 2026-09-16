import { useEffect, useState } from 'react';
import { PixelPanel } from './PixelPanel';
import { PixelBadge } from './PixelBadge';
import { PixelButton } from './PixelButton';
import { Icon } from './Icon';
import type { CeoCompanyOverview, StartupCategory, StartupProduct } from '@shared/startupTypes';

interface CeoDashboardPanelProps {
  onOpenStartup?: (startupId: string) => void;
  onConnectClick?: () => void;
}

export function CeoDashboardPanel({ onOpenStartup, onConnectClick }: CeoDashboardPanelProps) {
  const [overview, setOverview] = useState<CeoCompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New startup form state
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [category, setCategory] = useState<StartupCategory>('ai');
  const [rawInput, setRawInput] = useState('');

  const loadOverview = async () => {
    try {
      if (window.cth?.startupsCompanyOverview) {
        const data = await window.cth.startupsCompanyOverview();
        setOverview(data);
      }
    } catch (e) {
      console.error('[CeoDashboard] Failed to load overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    const interval = setInterval(loadOverview, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim()) return;

    setIsSubmitting(true);
    try {
      if (window.cth?.startupsConnect) {
        const created = await window.cth.startupsConnect({
          name: name.trim(),
          tagline: tagline.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          repoUrl: repoUrl.trim() || undefined,
          category,
          rawInput: rawInput.trim() || undefined
        });

        // Reset form
        setName('');
        setTagline('');
        setWebsiteUrl('');
        setRepoUrl('');
        setRawInput('');
        setShowConnectModal(false);

        await loadOverview();
        if (created && onOpenStartup) {
          onOpenStartup(created.id);
        }
      }
    } catch (err) {
      console.error('[CeoDashboard] Error connecting startup:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
      {/* Top CEO Executive Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--cth-paper-100)',
        border: '1px solid var(--cth-ink-300)',
        borderRadius: 4
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--cth-maroon, #6E1423)',
            color: 'var(--cth-gold, #F4D35E)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: 16
          }}>
            U
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--cth-ink-900)' }}>
              UNIVERSAL COMPANY — CEO EXECUTIVE OVERVIEW
            </div>
            <div style={{ fontSize: 11, color: 'var(--cth-ink-500)' }}>
              Autonomous Startup Acceleration & Multi-Agent Operations
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <PixelButton
            variant="primary"
            size="sm"
            onClick={() => {
              if (onConnectClick) onConnectClick();
              else setShowConnectModal(true);
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="plus" /> Connect Startup Product
            </span>
          </PixelButton>
          <PixelButton variant="secondary" size="sm" onClick={loadOverview}>
            <Icon name="clock" /> Refresh
          </PixelButton>
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(244, 211, 94, 0.15)',
        borderLeft: '4px solid var(--cth-gold, #F4D35E)',
        fontSize: 12,
        lineHeight: '18px',
        color: 'var(--cth-ink-900)'
      }}>
        <strong>Executive Briefing:</strong> {overview?.executiveSummary || 'Loading company status...'}
      </div>

      {/* Executive Key Performance Indicators (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <PixelPanel variant="inset" noPadding style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--cth-ink-500)', fontWeight: 600 }}>
            Connected Startups
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cth-ink-900)', marginTop: 4 }}>
            {overview?.connectedStartupsCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--cth-ink-500)', marginTop: 2 }}>In Product Portfolio</div>
        </PixelPanel>

        <PixelPanel variant="inset" noPadding style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--cth-ink-500)', fontWeight: 600 }}>
            Active Campaigns
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cth-maroon, #6E1423)', marginTop: 4 }}>
            {overview?.activeCampaignsCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--cth-ink-500)', marginTop: 2 }}>Promoting Live</div>
        </PixelPanel>

        <PixelPanel variant="inset" noPadding style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--cth-ink-500)', fontWeight: 600 }}>
            Assets Generated
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cth-mint, #2a9d8f)', marginTop: 4 }}>
            {overview?.assetsGeneratedCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--cth-ink-500)', marginTop: 2 }}>Social, PR & Launch Copy</div>
        </PixelPanel>

        <PixelPanel variant="inset" noPadding style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--cth-ink-500)', fontWeight: 600 }}>
            Active Fleet
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cth-ink-900)', marginTop: 4 }}>
            {overview?.activeAgentsCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--cth-ink-500)', marginTop: 2 }}>Autonomous Agents</div>
        </PixelPanel>
      </div>

      {/* Two Column Layout: Departmental Radar & Real-Time Events Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Department Operational Radar */}
        <PixelPanel variant="default" title="COMPANY DEPARTMENTS (OPERATIONAL RADAR)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {overview?.departments.map((dept, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  background: 'var(--cth-paper-100)',
                  border: '1px solid var(--cth-ink-300)',
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--cth-ink-900)' }}>
                    {dept.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PixelBadge
                      status={dept.status === 'operational' ? 'success' : dept.status === 'busy' ? 'working' : 'idle'}
                      label={dept.status.toUpperCase()}
                    />
                    <span style={{ fontSize: 11, color: 'var(--cth-ink-500)' }}>
                      Lead: {dept.lead}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--cth-ink-700)' }}>
                  {dept.headline}
                </div>
              </div>
            ))}
          </div>
        </PixelPanel>

        {/* What's Happening Now — Real-Time Stream */}
        <PixelPanel variant="default" title="WHAT'S HAPPENING NOW (LIVE COMPANY RADAR)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, maxHeight: 320, overflowY: 'auto' }}>
            {overview?.recentEvents.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--cth-ink-500)', fontSize: 12 }}>
                No recent company events recorded. Connect a startup product to initiate activity!
              </div>
            ) : (
              overview?.recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: '8px 10px',
                    background: 'var(--cth-paper-100)',
                    borderLeft: '3px solid var(--cth-maroon, #6E1423)',
                    border: '1px solid var(--cth-ink-300)',
                    borderRadius: 2
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--cth-ink-900)' }}>
                      {ev.title}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--cth-ink-500)' }}>
                      {new Date(ev.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cth-ink-700)', marginTop: 2 }}>
                    {ev.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </PixelPanel>
      </div>

      {/* Connect Startup Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ width: 480, maxWidth: '90%' }}>
            <PixelPanel variant="dialog" title="CONNECT STARTUP PRODUCT TO UNIVERSAL COMPANY">
              <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SuperFastDB, AI Design Copilot"
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: 13,
                      border: '1px solid var(--cth-ink-300)', borderRadius: 2
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Tagline / One-Liner *
                  </label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Blazing fast database for AI agents"
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: 13,
                      border: '1px solid var(--cth-ink-300)', borderRadius: 2
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://myproduct.com"
                      style={{
                        width: '100%', padding: '6px 8px', fontSize: 12,
                        border: '1px solid var(--cth-ink-300)', borderRadius: 2
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as StartupCategory)}
                      style={{
                        width: '100%', padding: '6px 8px', fontSize: 12,
                        border: '1px solid var(--cth-ink-300)', borderRadius: 2
                      }}
                    >
                      <option value="ai">AI / Machine Learning</option>
                      <option value="devtools">Developer Tools</option>
                      <option value="saas">B2B SaaS</option>
                      <option value="fintech">Fintech</option>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="mobile">Mobile App</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    GitHub Repository (Optional)
                  </label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="github.com/my-org/my-repo"
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: 12,
                      border: '1px solid var(--cth-ink-300)', borderRadius: 2
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Product Details / Pitch / README Notes
                  </label>
                  <textarea
                    rows={4}
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="Paste your product pitch, key value props, or launch goals here..."
                    style={{
                      width: '100%', padding: '6px 8px', fontSize: 12,
                      border: '1px solid var(--cth-ink-300)', borderRadius: 2, resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <PixelButton variant="secondary" size="md" type="button" onClick={() => setShowConnectModal(false)}>
                    Cancel
                  </PixelButton>
                  <PixelButton variant="primary" size="md" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Connecting...' : 'Connect & Index Product'}
                  </PixelButton>
                </div>
              </form>
            </PixelPanel>
          </div>
        </div>
      )}
    </div>
  );
}
