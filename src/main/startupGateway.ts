/**
 * Universal Startup Gateway — Ingest and manage startup products for Universal Company.
 *
 * Provides persistent storage, dossier generation, and knowledge indexing
 * for connected startups and product promotion.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { app } from 'electron';
import { randomBytes } from 'node:crypto';
import type {
  StartupProduct,
  ProductDossier,
  StartupEvent,
  CeoCompanyOverview,
  PromotionCampaign
} from '../shared/startupTypes';
import type { KnowledgeManager } from './knowledge';

function getStartupsDir(): string {
  const dir = join(app.getPath('userData'), 'startups');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getEventsPath(): string {
  return join(getStartupsDir(), 'startup-events.json');
}

export class StartupGateway {
  constructor(private knowledge?: KnowledgeManager) {}

  /** List all registered startup products. */
  listStartups(): StartupProduct[] {
    const root = getStartupsDir();
    const out: StartupProduct[] = [];
    try {
      const entries = readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const productFile = join(root, entry.name, 'startup.json');
          if (existsSync(productFile)) {
            try {
              const data = JSON.parse(readFileSync(productFile, 'utf8')) as StartupProduct;
              out.push(data);
            } catch {
              // Ignore corrupted product files
            }
          }
        }
      }
    } catch {
      return [];
    }
    return out.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /** Retrieve a startup product by ID. */
  getStartup(id: string): StartupProduct | undefined {
    const file = join(getStartupsDir(), id, 'startup.json');
    if (!existsSync(file)) return undefined;
    try {
      return JSON.parse(readFileSync(file, 'utf8')) as StartupProduct;
    } catch {
      return undefined;
    }
  }

  /** Connect a new startup product. */
  connectStartup(input: {
    name: string;
    tagline: string;
    websiteUrl?: string;
    repoUrl?: string;
    category?: StartupProduct['category'];
    rawInput?: string;
    dossier?: Partial<ProductDossier>;
  }): StartupProduct {
    const id = `startup-${Date.now().toString(36)}-${randomBytes(2).toString('hex')}`;
    const now = Date.now();
    const productDir = join(getStartupsDir(), id);
    mkdirSync(productDir, { recursive: true });

    // Synthesize an initial dossier if not completely supplied
    const dossier: ProductDossier = {
      elevatorPitch: input.dossier?.elevatorPitch || `${input.name}: ${input.tagline}`,
      summary: input.dossier?.summary || input.rawInput || `${input.name} is an innovative product in the ${input.category || 'tech'} space focused on ${input.tagline}.`,
      valueProposition: input.dossier?.valueProposition || input.tagline,
      targetAudience: input.dossier?.targetAudience || ['Developers', 'Startups', 'Tech Enthusiasts'],
      keyFeatures: input.dossier?.keyFeatures || [input.tagline, 'Seamless Integration', 'Scalable Performance'],
      competitors: input.dossier?.competitors || ['Traditional incumbents', 'Manual tooling'],
      tags: input.dossier?.tags || [input.category || 'startup', 'innovation', 'product'],
      painPointsSolved: input.dossier?.painPointsSolved || ['Slow execution', 'High overhead', 'Fragmented workflows'],
      promotionAngles: input.dossier?.promotionAngles || [
        'How this startup cuts development time in half',
        'The modern alternative for fast-moving teams',
        'Show HN / Product Hunt launch angle'
      ]
    };

    const startup: StartupProduct = {
      id,
      name: input.name,
      tagline: input.tagline,
      websiteUrl: input.websiteUrl,
      repoUrl: input.repoUrl,
      category: input.category || 'ai',
      status: 'ready',
      connectedAt: now,
      updatedAt: now,
      dossier,
      rawInput: input.rawInput,
      metrics: {
        campaignsRun: 0,
        totalAssetsGenerated: 0
      }
    };

    writeFileSync(join(productDir, 'startup.json'), JSON.stringify(startup, null, 2), 'utf8');

    // Index product into Knowledge Graph if enabled
    this.indexToKnowledgeGraph(startup);

    // Record Event
    this.recordEvent({
      id: `ev-${now}-${randomBytes(2).toString('hex')}`,
      startupId: id,
      startupName: startup.name,
      type: 'product_connected',
      title: `Connected: ${startup.name}`,
      description: `New startup product connected under category ${startup.category}: "${startup.tagline}"`,
      ts: now
    });

    return startup;
  }

  /** Update an existing startup's dossier. */
  updateStartupDossier(id: string, dossier: ProductDossier): StartupProduct | null {
    const startup = this.getStartup(id);
    if (!startup) return null;

    startup.dossier = dossier;
    startup.updatedAt = Date.now();

    const productDir = join(getStartupsDir(), id);
    writeFileSync(join(productDir, 'startup.json'), JSON.stringify(startup, null, 2), 'utf8');

    this.indexToKnowledgeGraph(startup);

    this.recordEvent({
      id: `ev-${Date.now()}-${randomBytes(2).toString('hex')}`,
      startupId: id,
      startupName: startup.name,
      type: 'dossier_generated',
      title: `Dossier Updated: ${startup.name}`,
      description: `Product intelligence and promotional angles updated for ${startup.name}.`,
      ts: Date.now()
    });

    return startup;
  }

  /** Remove a startup product. */
  removeStartup(id: string): boolean {
    const productDir = join(getStartupsDir(), id);
    if (!existsSync(productDir)) return false;
    try {
      rmSync(productDir, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }

  /** Automatically index startup dossier into the enterprise knowledge graph. */
  private indexToKnowledgeGraph(startup: StartupProduct): void {
    if (!this.knowledge || !this.knowledge.active()) return;
    try {
      const content = [
        `# Startup Product Dossier: ${startup.name}`,
        `Tagline: ${startup.tagline}`,
        `Category: ${startup.category}`,
        startup.websiteUrl ? `Website: ${startup.websiteUrl}` : '',
        startup.repoUrl ? `Repository: ${startup.repoUrl}` : '',
        '',
        `## Elevator Pitch`,
        startup.dossier?.elevatorPitch || startup.tagline,
        '',
        `## Product Summary`,
        startup.dossier?.summary || '',
        '',
        `## Value Proposition`,
        startup.dossier?.valueProposition || '',
        '',
        `## Key Features`,
        ...(startup.dossier?.keyFeatures.map((f) => `- ${f}`) || []),
        '',
        `## Target Personas`,
        ...(startup.dossier?.targetAudience.map((a) => `- ${a}`) || []),
        '',
        `## Promotion Angles`,
        ...(startup.dossier?.promotionAngles?.map((p) => `- ${p}`) || [])
      ].filter(Boolean).join('\n');

      this.knowledge.ingestText(content, {
        title: `Startup: ${startup.name}`,
        tags: ['startup', startup.category, `startup:${startup.id}`, ...(startup.dossier?.tags || [])]
      });
    } catch (e) {
      console.error('[StartupGateway] Failed to index to Knowledge Graph:', e);
    }
  }

  /** Record a company startup event. */
  recordEvent(event: StartupEvent): void {
    const path = getEventsPath();
    let events: StartupEvent[] = [];
    try {
      if (existsSync(path)) {
        events = JSON.parse(readFileSync(path, 'utf8')) as StartupEvent[];
      }
    } catch {
      events = [];
    }
    events.unshift(event);
    if (events.length > 200) events = events.slice(0, 200);
    try {
      writeFileSync(path, JSON.stringify(events, null, 2), 'utf8');
    } catch (e) {
      console.error('[StartupGateway] Failed to write event:', e);
    }
  }

  /** List recent startup events. */
  listEvents(limit = 50): StartupEvent[] {
    const path = getEventsPath();
    if (!existsSync(path)) return [];
    try {
      const events = JSON.parse(readFileSync(path, 'utf8')) as StartupEvent[];
      return events.slice(0, limit);
    } catch {
      return [];
    }
  }

  /** Generate real-time executive company status for the CEO. */
  getCompanyOverview(activeAgentsCount = 0): CeoCompanyOverview {
    const startups = this.listStartups();
    const events = this.listEvents(15);
    const totalAssets = startups.reduce((sum, s) => sum + (s.metrics.totalAssetsGenerated || 0), 0);
    const totalCampaigns = startups.reduce((sum, s) => sum + (s.metrics.campaignsRun || 0), 0);

    const departments: CeoCompanyOverview['departments'] = [
      {
        name: 'Executive Suite',
        lead: 'CEO',
        activeTaskCount: 1,
        status: 'operational',
        headline: 'Orchestrating company strategy & reviewing startup campaigns'
      },
      {
        name: 'Growth & Promotion',
        lead: 'Chief Growth Officer',
        activeTaskCount: totalCampaigns > 0 ? 2 : 0,
        status: totalCampaigns > 0 ? 'busy' : 'operational',
        headline: totalCampaigns > 0 ? 'Executing multi-channel promotion sprints' : 'Ready to launch new startup campaigns'
      },
      {
        name: 'Engineering Hub',
        lead: 'CTO / Lead Dev',
        activeTaskCount: 1,
        status: 'operational',
        headline: 'Maintaining Universal API connectors and automated webhooks'
      },
      {
        name: 'Product & Intelligence Lab',
        lead: 'Head of Product',
        activeTaskCount: startups.length,
        status: 'operational',
        headline: `Managing dossiers for ${startups.length} connected startup products`
      }
    ];

    const executiveSummary = startups.length === 0
      ? 'Welcome, CEO. Universal Company is ready. Connect your first startup product or launch a growth campaign to activate the floor.'
      : `Universal Company is actively managing ${startups.length} startup products with ${totalCampaigns} campaigns created. All departments operational.`;

    return {
      companyName: 'Universal Company',
      connectedStartupsCount: startups.length,
      activeCampaignsCount: totalCampaigns,
      assetsGeneratedCount: totalAssets,
      activeAgentsCount,
      departments,
      recentEvents: events,
      executiveSummary
    };
  }
}
