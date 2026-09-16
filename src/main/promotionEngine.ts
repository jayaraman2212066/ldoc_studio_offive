/**
 * PromotionEngine — Autonomous Multi-Channel Startup Promotion for Universal Company.
 *
 * Generates tailored launch campaigns, social copy, technical deep dives,
 * and PR collateral across Product Hunt, Twitter/X, LinkedIn, Hacker News, and Dev Blogs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { app } from 'electron';
import { randomBytes } from 'node:crypto';
import type {
  PromotionCampaign,
  CampaignAsset,
  CampaignChannel,
  CampaignType,
  StartupProduct
} from '../shared/startupTypes';
import type { StartupGateway } from './startupGateway';

function getCampaignsDir(startupId: string): string {
  const dir = join(app.getPath('userData'), 'startups', startupId, 'campaigns');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export class PromotionEngine {
  constructor(private gateway: StartupGateway) {}

  /** List all campaigns for a startup product. */
  listCampaigns(startupId: string): PromotionCampaign[] {
    const dir = getCampaignsDir(startupId);
    if (!existsSync(dir)) return [];
    const out: PromotionCampaign[] = [];
    try {
      const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const c = JSON.parse(readFileSync(join(dir, file), 'utf8')) as PromotionCampaign;
          out.push(c);
        } catch {
          // Ignore parse errors
        }
      }
    } catch {
      return [];
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  }

  /** List all campaigns across all startups in Universal Company. */
  listAllCampaigns(): PromotionCampaign[] {
    const startups = this.gateway.listStartups();
    const all: PromotionCampaign[] = [];
    for (const s of startups) {
      all.push(...this.listCampaigns(s.id));
    }
    return all.sort((a, b) => b.createdAt - a.createdAt);
  }

  /** Generate an automated multi-channel promotion campaign for a startup. */
  createCampaign(opts: {
    startupId: string;
    title?: string;
    type?: CampaignType;
    channels?: CampaignChannel[];
    directive?: string;
  }): PromotionCampaign | null {
    const startup = this.gateway.getStartup(opts.startupId);
    if (!startup) return null;

    const id = `camp-${Date.now().toString(36)}-${randomBytes(2).toString('hex')}`;
    const now = Date.now();
    const type: CampaignType = opts.type || 'launch';
    const channels: CampaignChannel[] = opts.channels || [
      'product_hunt',
      'twitter_x',
      'linkedin',
      'hacker_news'
    ];

    const title = opts.title || `${startup.name} — ${type === 'launch' ? 'Official Public Launch' : 'Growth Push'}`;

    // Synthesize campaign assets based on startup dossier
    const assets: CampaignAsset[] = [];
    for (const channel of channels) {
      const asset = this.generateChannelAsset(channel, startup, type, opts.directive);
      assets.push(asset);
    }

    const campaign: PromotionCampaign = {
      id,
      startupId: startup.id,
      startupName: startup.name,
      title,
      type,
      status: 'ready' as unknown as 'draft',
      createdAt: now,
      updatedAt: now,
      channels,
      assets,
      directive: opts.directive
    };

    const dir = getCampaignsDir(startup.id);
    writeFileSync(join(dir, `${id}.json`), JSON.stringify(campaign, null, 2), 'utf8');

    // Update startup metrics
    startup.metrics.campaignsRun += 1;
    startup.metrics.totalAssetsGenerated += assets.length;
    startup.metrics.lastPromotedAt = now;
    startup.status = 'campaign_active';
    const productDir = join(app.getPath('userData'), 'startups', startup.id);
    try {
      writeFileSync(join(productDir, 'startup.json'), JSON.stringify(startup, null, 2), 'utf8');
    } catch {
      // Best effort
    }

    // Record Event in Gateway
    this.gateway.recordEvent({
      id: `ev-${now}-${randomBytes(2).toString('hex')}`,
      startupId: startup.id,
      startupName: startup.name,
      type: 'campaign_created',
      title: `Campaign Created: ${title}`,
      description: `Generated ${assets.length} promotional assets across [${channels.join(', ')}] for ${startup.name}.`,
      ts: now
    });

    return campaign;
  }

  /** Update an asset's content or status in a campaign. */
  updateAsset(opts: {
    startupId: string;
    campaignId: string;
    assetId: string;
    content?: string;
    status?: CampaignAsset['status'];
  }): CampaignAsset | null {
    const file = join(getCampaignsDir(opts.startupId), `${opts.campaignId}.json`);
    if (!existsSync(file)) return null;

    try {
      const campaign = JSON.parse(readFileSync(file, 'utf8')) as PromotionCampaign;
      const asset = campaign.assets.find((a) => a.id === opts.assetId);
      if (!asset) return null;

      if (opts.content !== undefined) asset.content = opts.content;
      if (opts.status !== undefined) asset.status = opts.status;
      campaign.updatedAt = Date.now();

      writeFileSync(file, JSON.stringify(campaign, null, 2), 'utf8');
      return asset;
    } catch {
      return null;
    }
  }

  /** Synthesize high-converting copy for a specific channel. */
  private generateChannelAsset(
    channel: CampaignChannel,
    startup: StartupProduct,
    type: CampaignType,
    directive?: string
  ): CampaignAsset {
    const id = `asset-${randomBytes(3).toString('hex')}`;
    const dossier = startup.dossier;
    const name = startup.name;
    const tagline = startup.tagline;
    const url = startup.websiteUrl || 'https://example.com';
    const customAngle = directive ? `\n> CEO Directive: ${directive}\n` : '';

    let title = '';
    let content = '';
    let mediaSuggestions: string[] = [];

    switch (channel) {
      case 'product_hunt':
        title = `Product Hunt Launch Kit for ${name}`;
        content = [
          `# Product Hunt Launch — ${name}`,
          `**Tagline:** ${tagline}`,
          customAngle,
          `### Maker Comment (Post on launch):`,
          `Hey Product Hunt! 👋`,
          ``,
          `I'm thrilled to introduce **${name}** — ${dossier?.elevatorPitch || tagline}.`,
          ``,
          `**Why we built this:**`,
          `We noticed that teams constantly struggle with ${dossier?.painPointsSolved?.[0] || 'inefficient workflows and slow tooling'}. Existing tools were either too complex, fragmented, or outdated. We built ${name} to make it effortless, blazing fast, and intelligent.`,
          ``,
          `**Key Features:**`,
          ...(dossier?.keyFeatures.map((f) => `- ⚡ **${f}**`) || []),
          ``,
          `We'd love your honest feedback, questions, and ideas. What feature would make your workflow 10x faster?`,
          ``,
          `Check it out here: ${url}`,
          `Thank you for the support! 🚀`
        ].join('\n');
        mediaSuggestions = [
          'Square Logo Icon (240x240)',
          'Hero Product Demo GIF (1270x760)',
          '3-5 high-res workflow screenshots with annotations'
        ];
        break;

      case 'twitter_x':
        title = `Viral Twitter/X Announcement Thread for ${name}`;
        content = [
          `🧵 **Launch Thread: ${name}**`,
          customAngle,
          `1/ Most teams waste hours every day on ${dossier?.painPointsSolved?.[0] || 'repetitive manual tasks'}.`,
          ``,
          `Today, we're launching **${name}** to fix this once and for all:`,
          `👉 ${dossier?.elevatorPitch || tagline}`,
          ``,
          `Here is how it changes the game: 👇`,
          ``,
          `2/ **The Problem:**`,
          `Traditional solutions force you to deal with ${dossier?.competitors.join(', ') || 'legacy software'}. They are slow, rigid, and cost a fortune.`,
          ``,
          `3/ **The Solution:**`,
          `${name} brings a radically modern approach:`,
          ...(dossier?.keyFeatures.slice(0, 3).map((f) => `• ${f}`) || []),
          ``,
          `4/ **How it works (Demo):**`,
          `[Attach 30-sec screen recording GIF showing workflow in action]`,
          ``,
          `5/ We're opening access today!`,
          `Try it out for free and let us know what you think:`,
          `🔗 ${url}`,
          ``,
          `RT the first tweet to spread the word! ❤️`
        ].join('\n');
        mediaSuggestions = [
          'Attention-grabbing 15-30s demo video or GIF for Tweet 1',
          'Feature callout carousel or screenshot for Tweet 3'
        ];
        break;

      case 'linkedin':
        title = `LinkedIn Founder Story Post for ${name}`;
        content = [
          `🚀 **Excited to share what we've been building: Introducing ${name}.**`,
          customAngle,
          `Over the past few months, we've had hundreds of conversations with founders, engineers, and product leaders about ${dossier?.painPointsSolved?.[0] || 'workflow bottlenecks'}.`,
          ``,
          `One theme kept coming up: existing tools simply don't keep up with the pace of modern teams.`,
          ``,
          `That's why we created **${name}** — ${dossier?.elevatorPitch || tagline}.`,
          ``,
          `What makes ${name} different:`,
          ...(dossier?.keyFeatures.map((f) => `🔹 ${f}`) || []),
          ``,
          `Our mission is to help companies scale faster with less friction.`,
          ``,
          `Would love to hear your thoughts in the comments. How is your team currently tackling this problem?`,
          ``,
          `Link to explore: ${url} #startup #innovation #technology #growth`
        ].join('\n');
        mediaSuggestions = [
          'High-contrast professional banner graphic (1200x627)',
          'Candid screenshot of the team or product dashboard'
        ];
        break;

      case 'hacker_news':
        title = `Show HN Post for ${name}`;
        content = [
          `**Title:** Show HN: ${name} – ${tagline}`,
          customAngle,
          `Hi HN,`,
          ``,
          `I'm one of the creators of ${name} (${url}). We built it to solve ${dossier?.painPointsSolved?.[0] || 'a problem we faced ourselves'}.`,
          ``,
          `**What is it?**`,
          `${dossier?.summary || tagline}`,
          ``,
          `**Architecture & Under the Hood:**`,
          `- Built for speed and reliability.`,
          `- No bloated dependencies; clean API design.`,
          `- Designed to work seamlessly with modern workflows.`,
          ``,
          `We'd love HN's technical feedback on our approach. Happy to answer questions about architecture, trade-offs, and lessons learned!`,
          ``,
          `Link: ${url}`
        ].join('\n');
        mediaSuggestions = ['Clean plain-text formatting (no marketing buzzwords)'];
        break;

      case 'blog':
      case 'press':
      default:
        title = `Press & Blog Release for ${name}`;
        content = [
          `# Announcing ${name}: The Modern Way to ${tagline}`,
          customAngle,
          `*FOR IMMEDIATE RELEASE*`,
          ``,
          `**Summary:**`,
          `${dossier?.summary || tagline}`,
          ``,
          `**Value Proposition:**`,
          `${dossier?.valueProposition || tagline}`,
          ``,
          `**Key Highlights:**`,
          ...(dossier?.keyFeatures.map((f) => `- **${f}**`) || []),
          ``,
          `To learn more, visit: ${url}`
        ].join('\n');
        mediaSuggestions = ['Official press kit logos and founder headshots'];
        break;
    }

    return {
      id,
      channel,
      title,
      content,
      mediaSuggestions,
      status: 'approved',
      createdAt: Date.now()
    };
  }
}
