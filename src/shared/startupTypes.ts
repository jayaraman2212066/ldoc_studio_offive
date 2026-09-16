/**
 * Startup Products, Dossiers, and Promotion Campaigns — Universal Company Engine.
 *
 * Shared data structures across Electron main and React renderer.
 */

export type StartupCategory =
  | 'ai'
  | 'devtools'
  | 'saas'
  | 'fintech'
  | 'ecommerce'
  | 'crypto'
  | 'health'
  | 'mobile'
  | 'other';

export type StartupStatus =
  | 'connected'
  | 'analyzing'
  | 'ready'
  | 'campaign_active'
  | 'archived';

export interface ProductDossier {
  /** High-level executive elevator pitch (1-2 sentences). */
  elevatorPitch: string;
  /** Comprehensive summary of what the product does. */
  summary: string;
  /** Primary Unique Selling Proposition (USP). */
  valueProposition: string;
  /** Target customer personas / markets. */
  targetAudience: string[];
  /** Core feature highlights. */
  keyFeatures: string[];
  /** Notable market alternatives or competitors. */
  competitors: string[];
  /** Core tags for categorization and search. */
  tags: string[];
  /** Pain points solved for users. */
  painPointsSolved?: string[];
  /** Recommended promotional angles. */
  promotionAngles?: string[];
}

export interface StartupProduct {
  id: string;
  name: string;
  tagline: string;
  websiteUrl?: string;
  repoUrl?: string;
  category: StartupCategory;
  status: StartupStatus;
  connectedAt: number;
  updatedAt: number;
  dossier?: ProductDossier;
  rawInput?: string;
  metrics: {
    campaignsRun: number;
    totalAssetsGenerated: number;
    lastPromotedAt?: number;
  };
}

export type CampaignType =
  | 'launch'
  | 'feature_drop'
  | 'viral_thread'
  | 'press_release'
  | 'technical_deep_dive';

export type CampaignStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'executing'
  | 'completed';

export type CampaignChannel =
  | 'product_hunt'
  | 'twitter_x'
  | 'linkedin'
  | 'hacker_news'
  | 'reddit'
  | 'blog'
  | 'press';

export interface CampaignAsset {
  id: string;
  channel: CampaignChannel;
  title: string;
  /** Production-ready markdown or plain text copy. */
  content: string;
  /** Visual guidelines, screenshot checklist, or banner prompts. */
  mediaSuggestions?: string[];
  status: 'draft' | 'approved' | 'published';
  createdAt: number;
}

export interface PromotionCampaign {
  id: string;
  startupId: string;
  startupName: string;
  title: string;
  type: CampaignType;
  status: CampaignStatus;
  createdAt: number;
  updatedAt: number;
  channels: CampaignChannel[];
  assets: CampaignAsset[];
  assignedAgent?: string;
  /** High-level goal or custom prompt from CEO. */
  directive?: string;
}

export interface StartupEvent {
  id: string;
  startupId: string;
  startupName: string;
  type:
    | 'product_connected'
    | 'dossier_generated'
    | 'campaign_created'
    | 'asset_approved'
    | 'promotion_dispatched'
    | 'startup_milestone';
  title: string;
  description: string;
  ts: number;
  meta?: Record<string, unknown>;
}

export interface CeoCompanyOverview {
  companyName: string;
  connectedStartupsCount: number;
  activeCampaignsCount: number;
  assetsGeneratedCount: number;
  activeAgentsCount: number;
  departments: {
    name: string;
    lead: string;
    activeTaskCount: number;
    status: 'operational' | 'busy' | 'needs_attention';
    headline: string;
  }[];
  recentEvents: StartupEvent[];
  executiveSummary: string;
}
