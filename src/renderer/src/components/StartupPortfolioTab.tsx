import { useEffect, useState } from 'react';
import { PixelPanel } from './PixelPanel';
import { PixelBadge } from './PixelBadge';
import { PixelButton } from './PixelButton';
import { Icon } from './Icon';
import type {
  StartupProduct,
  PromotionCampaign,
  CampaignAsset,
  CampaignChannel,
  CampaignType
} from '@shared/startupTypes';

interface StartupPortfolioTabProps {
  initialStartupId?: string;
  onOpenConnect?: () => void;
}

export function StartupPortfolioTab({ initialStartupId, onOpenConnect }: StartupPortfolioTabProps) {
  const [startups, setStartups] = useState<StartupProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialStartupId || null);
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'dossier' | 'campaigns' | 'launch'>('dossier');
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);

  // New Campaign state
  const [newCampType, setNewCampType] = useState<CampaignType>('launch');
  const [newCampChannels, setNewCampChannels] = useState<CampaignChannel[]>([
    'product_hunt',
    'twitter_x',
    'linkedin',
    'hacker_news'
  ]);
  const [newCampDirective, setNewCampDirective] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const loadStartups = async () => {
    try {
      if (window.cth?.startupsList) {
        const list = await window.cth.startupsList();
        setStartups(list);
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
        }
      }
    } catch (e) {
      console.error('[StartupPortfolio] Failed to load startups:', e);
    }
  };

  const loadCampaigns = async (startupId: string) => {
    try {
      if (window.cth?.campaignsList) {
        const list = await window.cth.campaignsList(startupId);
        setCampaigns(list);
      }
    } catch (e) {
      console.error('[StartupPortfolio] Failed to load campaigns:', e);
    }
  };

  useEffect(() => {
    loadStartups();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadCampaigns(selectedId);
    }
  }, [selectedId]);

  const selectedStartup = startups.find((s) => s.id === selectedId);

  const handleCopyAsset = (asset: CampaignAsset) => {
    navigator.clipboard.writeText(asset.content);
    setCopiedAssetId(asset.id);
    setTimeout(() => setCopiedAssetId(null), 2000);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) return;

    setIsLaunching(true);
    try {
      if (window.cth?.campaignsCreate) {
        await window.cth.campaignsCreate({
          startupId: selectedStartup.id,
          type: newCampType,
          channels: newCampChannels,
          directive: newCampDirective.trim() || undefined
        });

        setNewCampDirective('');
        setActiveSubTab('campaigns');
        await loadCampaigns(selectedStartup.id);
        await loadStartups();
      }
    } catch (err) {
      console.error('[StartupPortfolio] Failed to launch campaign:', err);
    } finally {
      setIsLaunching(false);
    }
  };

  const toggleChannel = (ch: CampaignChannel) => {
    if (newCampChannels.includes(ch)) {
      if (newCampChannels.length > 1) {
        setNewCampChannels(newCampChannels.filter((c) => c !== ch));
      }
    } else {
      setNewCampChannels([...newCampChannels, ch]);
    }
  };

  if (startups.length === 0) {
    return (
      <PixelPanel variant="default" title="STARTUP PRODUCTS PORTFOLIO">
        <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>🚀</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cth-ink-900)' }}>
            No Startup Products Connected Yet
          </div>
          <p style={{ margin: 0, maxWidth: 460, fontSize: 13, lineHeight: '20px', color: 'var(--cth-ink-700)' }}>
            Universal Company connects with any startup product or open-source tool. Connect a product to generate an automated Product Dossier, index it in the company Knowledge Graph, and run multi-channel promotional campaigns.
          </p>
          {onOpenConnect && (
            <PixelButton variant="primary" size="md" onClick={onOpenConnect}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="plus" /> Connect Your First Startup Product
              </span>
            </PixelButton>
          )}
        </div>
      </PixelPanel>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: '100%', minHeight: 0 }}>
      {/* Left Sidebar: Startup List */}
      <PixelPanel variant="default" title="CONNECTED STARTUPS" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, padding: 4 }}>
          {startups.map((s) => {
            const isSel = s.id === selectedId;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                style={{
                  padding: '8px 10px',
                  background: isSel ? 'var(--cth-gold, #F4D35E)' : 'var(--cth-paper-100)',
                  border: `1px solid ${isSel ? 'var(--cth-maroon, #6E1423)' : 'var(--cth-ink-300)'}`,
                  color: isSel ? 'var(--cth-maroon, #6E1423)' : 'var(--cth-ink-900)',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                  <span style={{
                    fontSize: 9, textTransform: 'uppercase', padding: '1px 4px',
                    borderRadius: 2, background: isSel ? 'rgba(0,0,0,0.1)' : 'var(--cth-ink-100)'
                  }}>
                    {s.category}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: isSel ? '#4a0e18' : 'var(--cth-ink-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.tagline}
                </div>
              </div>
            );
          })}
        </div>

        {onOpenConnect && (
          <div style={{ paddingTop: 8, borderTop: '1px solid var(--cth-ink-300)' }}>
            <PixelButton variant="secondary" size="sm" onClick={onOpenConnect} style={{ width: '100%' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="plus" /> Connect Another Product
              </span>
            </PixelButton>
          </div>
        )}
      </PixelPanel>

      {/* Right Column: Active Startup Dossier & Campaigns */}
      {selectedStartup ? (
        <PixelPanel variant="default" title={`PRODUCT: ${selectedStartup.name.toUpperCase()}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflowY: 'auto' }}>
            {/* Header info bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 12px', background: 'var(--cth-paper-100)', borderRadius: 4,
              border: '1px solid var(--cth-ink-300)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--cth-ink-900)' }}>
                    {selectedStartup.name}
                  </span>
                  <PixelBadge status="thinking" label={selectedStartup.category.toUpperCase()} />
                  <PixelBadge status="success" label={selectedStartup.status.toUpperCase()} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--cth-ink-700)', marginTop: 4 }}>
                  {selectedStartup.tagline}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 6 }}>
                  {selectedStartup.websiteUrl && (
                    <a href={selectedStartup.websiteUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--cth-maroon, #6E1423)' }}>
                      🌐 {selectedStartup.websiteUrl}
                    </a>
                  )}
                  {selectedStartup.repoUrl && (
                    <span style={{ color: 'var(--cth-ink-500)' }}>
                      📂 {selectedStartup.repoUrl}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <PixelButton
                  variant={activeSubTab === 'dossier' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveSubTab('dossier')}
                >
                  Product Dossier
                </PixelButton>
                <PixelButton
                  variant={activeSubTab === 'campaigns' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveSubTab('campaigns')}
                >
                  Campaigns ({campaigns.length})
                </PixelButton>
                <PixelButton
                  variant={activeSubTab === 'launch' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveSubTab('launch')}
                >
                  🚀 Launch Campaign
                </PixelButton>
              </div>
            </div>

            {/* SubTab 1: Product Dossier */}
            {activeSubTab === 'dossier' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <PixelPanel variant="inset" noPadding style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cth-maroon, #6E1423)', marginBottom: 4 }}>
                    ELEVATOR PITCH
                  </div>
                  <div style={{ fontSize: 13, lineHeight: '18px', color: 'var(--cth-ink-900)' }}>
                    {selectedStartup.dossier?.elevatorPitch}
                  </div>
                </PixelPanel>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <PixelPanel variant="inset" noPadding style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cth-maroon, #6E1423)', marginBottom: 6 }}>
                      KEY FEATURES
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: '18px' }}>
                      {selectedStartup.dossier?.keyFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </PixelPanel>

                  <PixelPanel variant="inset" noPadding style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cth-maroon, #6E1423)', marginBottom: 6 }}>
                      TARGET AUDIENCE
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: '18px' }}>
                      {selectedStartup.dossier?.targetAudience.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </PixelPanel>
                </div>

                <PixelPanel variant="inset" noPadding style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cth-maroon, #6E1423)', marginBottom: 6 }}>
                    PROMOTIONAL ANGLES & MARKETING HOOKS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: '20px' }}>
                    {selectedStartup.dossier?.promotionAngles?.map((p, i) => (
                      <li key={i}><strong>Angle #{i + 1}:</strong> {p}</li>
                    ))}
                  </ul>
                </PixelPanel>
              </div>
            )}

            {/* SubTab 2: Campaigns & Copywriter Assets */}
            {activeSubTab === 'campaigns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {campaigns.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--cth-ink-500)', fontSize: 13 }}>
                    No campaigns launched for {selectedStartup.name} yet. Click "Launch Campaign" to generate promotional copy!
                  </div>
                ) : (
                  campaigns.map((camp) => (
                    <PixelPanel key={camp.id} variant="default" title={camp.title.toUpperCase()}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--cth-ink-500)' }}>
                          <span>Channels: {camp.channels.join(' · ')}</span>
                          <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                        </div>

                        {camp.assets.map((asset) => (
                          <div
                            key={asset.id}
                            style={{
                              padding: 10,
                              background: 'var(--cth-paper-100)',
                              border: '1px solid var(--cth-ink-300)',
                              borderRadius: 4
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <PixelBadge status="thinking" label={asset.channel.toUpperCase()} />
                                <strong style={{ fontSize: 12 }}>{asset.title}</strong>
                              </div>
                              <PixelButton
                                variant={copiedAssetId === asset.id ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleCopyAsset(asset)}
                              >
                                {copiedAssetId === asset.id ? '✓ Copied!' : 'Copy Copy'}
                              </PixelButton>
                            </div>
                            <pre style={{
                              margin: 0, padding: 8, background: '#1e1e1e', color: '#d4d4d4',
                              borderRadius: 2, fontSize: 11, lineHeight: '16px',
                              overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: 180
                            }}>
                              {asset.content}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </PixelPanel>
                  ))
                )}
              </div>
            )}

            {/* SubTab 3: Launch New Campaign */}
            {activeSubTab === 'launch' && (
              <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <PixelPanel variant="inset" noPadding style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cth-maroon, #6E1423)', marginBottom: 8 }}>
                    DISPATCH PROMOTION SPRINT FOR {selectedStartup.name.toUpperCase()}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--cth-ink-700)', marginBottom: 12 }}>
                    The Universal Company Growth team (Chief Growth Officer & Content Strategist) will autonomously generate promotional copy and launch collateral across all selected channels.
                  </p>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      Campaign Type
                    </label>
                    <select
                      value={newCampType}
                      onChange={(e) => setNewCampType(e.target.value as CampaignType)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid var(--cth-ink-300)' }}
                    >
                      <option value="launch">Official Public Launch (Day 1 Blitz)</option>
                      <option value="viral_thread">Viral Twitter/X Thread & Story</option>
                      <option value="feature_drop">Major Feature Drop / Update</option>
                      <option value="press_release">Press Release & Media Kit</option>
                      <option value="technical_deep_dive">Technical Deep Dive & Architecture</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      Distribution Channels
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(['product_hunt', 'twitter_x', 'linkedin', 'hacker_news', 'blog'] as CampaignChannel[]).map((ch) => {
                        const active = newCampChannels.includes(ch);
                        return (
                          <button
                            type="button"
                            key={ch}
                            onClick={() => toggleChannel(ch)}
                            style={{
                              padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                              background: active ? 'var(--cth-maroon, #6E1423)' : 'var(--cth-paper-100)',
                              color: active ? '#fff' : 'var(--cth-ink-900)',
                              border: '1px solid var(--cth-ink-300)', borderRadius: 2
                            }}
                          >
                            {active ? '✓ ' : '+ '} {ch.replace('_', ' ').toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      CEO Strategic Directive (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={newCampDirective}
                      onChange={(e) => setNewCampDirective(e.target.value)}
                      placeholder="e.g. Focus on our 10x performance compared to incumbents, highlight developer simplicity, emphasize our free open source tier..."
                      style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid var(--cth-ink-300)', resize: 'vertical' }}
                    />
                  </div>

                  <PixelButton variant="primary" size="md" type="submit" disabled={isLaunching}>
                    {isLaunching ? 'Synthesizing Launch Copy...' : '🚀 Generate Multi-Channel Campaign'}
                  </PixelButton>
                </PixelPanel>
              </form>
            )}
          </div>
        </PixelPanel>
      ) : (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--cth-ink-500)' }}>
          Select a startup to view details.
        </div>
      )}
    </div>
  );
}
