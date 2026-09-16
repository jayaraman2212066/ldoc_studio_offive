/**
 * Browser Mock Bridge for Universal Company
 *
 * When the app is accessed directly from a web browser (e.g. http://localhost:5173/)
 * instead of inside the Electron desktop shell, `window.cth` is undefined.
 * This bridge safely populates `window.cth` with in-memory stores and default data
 * so that the user gets the full interactive PRO corporate workspace experience in
 * any browser without a blank screen or IPC crash.
 */

import type { HarnessConfig } from '@/store/config';
import type { HiveTask } from '@/components/TasksKanban';
import { useStore, type Agent } from '@/store/store';
import { DEFAULT_ORG_TRIGGER } from '@shared/triggers';
import type {
  StartupProduct,
  ProductDossier,
  PromotionCampaign,
  CeoCompanyOverview
} from '@shared/startupTypes';

export function installBrowserBridgeIfMock(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).cth) return; // Electron preload already exposed real IPC

  console.info('[Universal Company] Running in browser mode — installing browser mock bridge on window.cth');

  let config: HarnessConfig = {
    onboardingComplete: true,
    autoMode: true,
    harnessHome: 'C:\\UniversalCompany',
    freeflowEnabled: false,
    tvShowOffices: false,
    officeTheme: 'office',
    defaultModel: 'claude-3-7-sonnet-latest',
    godModel: 'claude-3-7-sonnet-latest',
    godProvider: 'claude',
    registeredRepos: ['universal-company/core'],
    webhookTriggers: [],
    orgTrigger: DEFAULT_ORG_TRIGGER,
    agentTokenCaps: {},
    defaultCommand: 'claude',
    semanticMemory: true,
    embeddingModel: 'minilm'
  };

  const configListeners = new Set<(c: HarnessConfig) => void>();
  const messageListeners = new Set<(e: any) => void>();

  let tasks: HiveTask[] = [
    {
      id: 't-1',
      title: 'Universal Accelerator Setup',
      description: 'Configure multi-channel promotional templates and startup dossiers for new applicants',
      assignee: 'Michael Scott',
      status: 'done',
      priority: 1,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      dependsOn: []
    },
    {
      id: 't-2',
      title: 'Launch Product Hunt Promotion Kit',
      description: 'Synthesize Product Hunt maker comment, tagline, and FAQ for newly connected startups',
      assignee: 'Ryan Howard',
      status: 'doing',
      priority: 2,
      createdAt: new Date().toISOString(),
      dependsOn: []
    },
    {
      id: 't-3',
      title: 'Viral Twitter/X Thread Generation',
      description: 'Draft 5-tweet launch thread with problem/solution breakdown and CTA link',
      assignee: 'Pam Beesly',
      status: 'doing',
      priority: 2,
      createdAt: new Date().toISOString(),
      dependsOn: []
    },
    {
      id: 't-4',
      title: 'Enterprise Knowledge Graph Indexing',
      description: 'Index startup technical capabilities and market competitors into shared graph',
      assignee: 'Jim Halpert',
      status: 'todo',
      priority: 3,
      createdAt: new Date().toISOString(),
      dependsOn: []
    }
  ];

  let messages: any[] = [
    {
      id: 'm-1',
      from: 'Ryan Howard',
      to: 'Michael Scott',
      act: 'inform',
      subject: 'Product Hunt Launch Assets Ready',
      body: 'I have compiled the initial Product Hunt kit for OmniFlow AI. Ready for your review in the Startups tab.',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'm-2',
      from: 'Pam Beesly',
      to: 'Ryan Howard',
      act: 'agree',
      subject: 'Reviewing Twitter Copy',
      body: 'The hook tweet looks great! Adding the animated GIF cue and hashtags now.',
      created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: 'm-3',
      from: 'Michael Scott',
      to: 'Jim Halpert',
      act: 'request',
      subject: 'Outreach to TechCrunch',
      body: 'Jim, please draft the founder outreach email for our upcoming startup cohort.',
      created_at: new Date(Date.now() - 300000).toISOString()
    }
  ];

  let startups: StartupProduct[] = [
    {
      id: 'sup-1',
      name: 'OmniFlow AI',
      tagline: 'Autonomous AI workflow orchestrator for modern dev teams',
      websiteUrl: 'https://omniflow.ai',
      category: 'devtools',
      status: 'ready',
      connectedAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      metrics: {
        campaignsRun: 1,
        totalAssetsGenerated: 3,
        lastPromotedAt: Date.now() - 3600000
      },
      dossier: {
        elevatorPitch: 'OmniFlow AI turns natural language specifications into verified production pull requests.',
        summary: 'A developer-first multi-agent harness that automates refactoring, bug fixes, and feature branches.',
        valueProposition: '10x faster sprint velocity with automated code review and test generation.',
        targetAudience: ['Engineering Leads', 'Full-Stack Developers', 'CTOs'],
        keyFeatures: ['Autonomous git branching', 'Test-driven synthesis', 'Continuous feedback loops'],
        competitors: ['Devin', 'Cursor', 'GitHub Copilot'],
        tags: ['AI', 'DevTools', 'Automation']
      }
    },
    {
      id: 'sup-2',
      name: 'DataPulse Cloud',
      tagline: 'Real-time database telemetry and instant query optimizer',
      websiteUrl: 'https://datapulse.dev',
      category: 'saas',
      status: 'ready',
      connectedAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
      metrics: {
        campaignsRun: 0,
        totalAssetsGenerated: 0
      },
      dossier: {
        elevatorPitch: 'Instant PostgreSQL and MySQL query performance tuning with AI-suggested indexes.',
        summary: 'Cloud telemetry agent that detects slow queries and provides 1-click execution plans.',
        valueProposition: 'Eliminate database bottlenecks before they impact end users.',
        targetAudience: ['Database Administrators', 'Backend Engineers', 'DevOps'],
        keyFeatures: ['Zero-overhead query capture', 'Index advisor', 'Slow query alerts'],
        competitors: ['Datadog', 'pganalyze', 'New Relic'],
        tags: ['Database', 'Telemetry', 'Performance']
      }
    }
  ];

  let campaigns: PromotionCampaign[] = [
    {
      id: 'cmp-1',
      startupId: 'sup-1',
      startupName: 'OmniFlow AI',
      title: 'OmniFlow AI Public Launch',
      type: 'launch',
      status: 'approved',
      channels: ['product_hunt', 'twitter_x', 'hacker_news'],
      assets: [
        {
          id: 'ast-1',
          channel: 'product_hunt',
          title: 'Product Hunt Launch Kit',
          content: '**Tagline:** Autonomous AI workflow orchestrator for modern dev teams\n\n**Maker Comment:**\nHey Product Hunt! 👋 We built OmniFlow AI because our team spent too much time writing boilerplate and fixing regressions. Today, we are excited to open access to all builders!\n\n**Key Highlights:**\n- 1-click GitHub repo connection\n- Autonomous PR generation\n- Full unit test coverage\n\nWe would love your feedback and questions!',
          status: 'approved',
          createdAt: Date.now()
        },
        {
          id: 'ast-2',
          channel: 'twitter_x',
          title: 'Twitter/X Viral Launch Thread',
          content: '🚀 Introducing OmniFlow AI — your team\'s 24/7 autonomous coding partner.\n\nStop spending hours on boilerplate and bug fixes. Here is how OmniFlow writes, tests, and opens PRs for you in minutes 🧵👇\n\n2/ The Problem: Context switching and PR reviews eat 40% of developer time.\n3/ The Solution: OmniFlow decomposes tickets into verified code changes with zero hallucinations.\n4/ Try it free today: https://omniflow.ai #AI #DevTools #BuildInPublic',
          status: 'approved',
          createdAt: Date.now()
        },
        {
          id: 'ast-3',
          channel: 'hacker_news',
          title: 'Show HN: OmniFlow AI — Autonomous multi-agent coding harness',
          content: 'Hi HN, I am one of the creators of OmniFlow AI.\n\nWe wanted a tool that does not just autocomplete snippets in an editor, but can actually understand entire repositories, plan multi-file changes, and verify code using local compiler and test suites.\n\nWe built this with local-first architecture and transparent agent logging. Would love to hear your feedback on the architecture: https://omniflow.ai',
          status: 'approved',
          createdAt: Date.now()
        }
      ],
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now()
    }
  ];

  const browserBridge = {
    isMockBridge: true,
    getConfig: async () => config,
    updateConfig: async (patch: Partial<HarnessConfig>) => {
      config = { ...config, ...patch };
      configListeners.forEach((fn) => fn(config));
      return config;
    },
    onConfigChanged: (cb: (c: HarnessConfig) => void) => {
      configListeners.add(cb);
      return () => configListeners.delete(cb);
    },
    onCloseRequested: () => () => {},
    onHireImport: () => () => {},
    drainPendingHires: async () => [],
    onHireError: () => () => {},
    onClosingTime: () => () => {},
    startClosingTime: async () => ({ ok: true }),
    cancelClosingTime: async () => {},
    listPtys: async () => [],
    realtimeHasOpenAiKey: async () => false,
    rosterReadSync: () => null,
    rosterWriteSync: () => {},

    // Task Kanban
    hiveTasks: async () => ({ tasks }),
    hiveAddTask: async (task: HiveTask) => {
      tasks.push(task);
      return { ok: true };
    },
    hivePatchTask: async (id: string, patch: Partial<Omit<HiveTask, 'id'>>) => {
      tasks = tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
      return { ok: true };
    },
    hiveDeleteTask: async (id: string) => {
      tasks = tasks.filter((t) => t.id !== id);
      return { ok: true };
    },

    // Hive Messaging & Inbox
    hiveInbox: async (agentId: string) => {
      return messages.filter((m) => m.to === agentId || m.from === agentId || m.to === 'all');
    },
    hiveSend: async (msg: any, from = 'human') => {
      const full = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: from === 'human' ? 'CEO (You)' : from,
        to: msg.to || 'all',
        act: msg.act || 'inform',
        subject: msg.subject || '(no subject)',
        body: msg.body || '',
        created_at: new Date().toISOString()
      };
      messages.unshift(full);
      messageListeners.forEach((fn) =>
        fn({
          id: full.id,
          from: full.from,
          to: full.to,
          act: full.act,
          subject: full.subject,
          targets: [full.to],
          needsHuman: false
        })
      );
      return { ok: true, message: full };
    },
    onHiveMessage: (cb: (e: any) => void) => {
      messageListeners.add(cb);
      return () => messageListeners.delete(cb);
    },
    onHiveHookEvent: () => () => {},
    onHiveContextUpdate: () => () => {},
    onHiveEnqueue: () => () => {},

    // Startups & Promotion Engine
    startupsList: async () => startups,
    startupsConnect: async (input: any) => {
      const id = `sup-${Date.now().toString(36)}`;
      const newStartup: StartupProduct = {
        id,
        name: input.name,
        tagline: input.tagline || 'Innovative software solution',
        websiteUrl: input.websiteUrl,
        repoUrl: input.repoUrl,
        category: (input.category as any) || 'devtools',
        status: 'ready',
        connectedAt: Date.now(),
        updatedAt: Date.now(),
        metrics: {
          campaignsRun: 0,
          totalAssetsGenerated: 0
        },
        dossier: {
          elevatorPitch: input.rawPitch || input.tagline || `${input.name} is an advanced startup platform.`,
          summary: `${input.name} solves key customer problems with automated workflows and user-centric design.`,
          valueProposition: 'High efficiency, speed to market, and seamless integration.',
          targetAudience: ['Founders', 'Product Teams', 'Developers'],
          keyFeatures: ['Automated setup', 'Real-time analytics', 'Universal connectivity'],
          competitors: ['Legacy market alternatives'],
          tags: ['Innovation', 'Startup']
        }
      };
      startups.unshift(newStartup);
      return newStartup;
    },
    startupsUpdateDossier: async (id: string, patch: Partial<ProductDossier>) => {
      startups = startups.map((s) => (s.id === id ? { ...s, dossier: { ...s.dossier!, ...patch } } : s));
      return { ok: true };
    },
    startupsRemove: async (id: string) => {
      startups = startups.filter((s) => s.id !== id);
      campaigns = campaigns.filter((c) => c.startupId !== id);
      return { ok: true };
    },
    startupsEvents: async () => [
      { id: 'ev-1', type: 'product_connected' as const, startupId: 'sup-1', startupName: 'OmniFlow AI', title: 'OmniFlow AI Connected', description: 'Dossier synthesized and knowledge graph updated', ts: Date.now() - 86400000 },
      { id: 'ev-2', type: 'campaign_created' as const, startupId: 'sup-1', startupName: 'OmniFlow AI', title: 'Launch Campaign Synthesized', description: '5 promotion assets generated', ts: Date.now() - 3600000 }
    ],
    startupsCompanyOverview: async (): Promise<CeoCompanyOverview> => {
      return {
        companyName: 'Universal Company',
        connectedStartupsCount: startups.length,
        activeCampaignsCount: campaigns.length,
        assetsGeneratedCount: campaigns.reduce((sum, c) => sum + c.assets.length, 0),
        activeAgentsCount: 6,
        departments: [
          { name: 'Executive Suite', lead: 'Michael Scott', activeTaskCount: 1, status: 'operational', headline: 'Coordinating departments and startup admissions' },
          { name: 'Growth & Promotion', lead: 'Jim Halpert', activeTaskCount: 2, status: 'busy', headline: 'Synthesizing launch threads and Product Hunt copy' },
          { name: 'Engineering & DevRel', lead: 'Ryan Howard', activeTaskCount: 1, status: 'operational', headline: 'Maintaining connectors, webhooks, and repository audits' },
          { name: 'Product & Intelligence', lead: 'Dwight Schrute', activeTaskCount: 0, status: 'busy', headline: 'Compiling startup competitor dossiers and USPs' }
        ],
        recentEvents: [
          { id: 'ev-1', type: 'product_connected' as const, startupId: 'sup-1', startupName: 'OmniFlow AI', title: 'OmniFlow AI Connected', description: 'Dossier synthesized and knowledge graph updated', ts: Date.now() - 86400000 },
          { id: 'ev-2', type: 'campaign_created' as const, startupId: 'sup-1', startupName: 'OmniFlow AI', title: 'Launch Campaign Synthesized', description: '3 promotion assets generated', ts: Date.now() - 3600000 }
        ],
        executiveSummary: 'Universal Company operations are healthy with active promotional pipelines.'
      };
    },

    // Campaigns
    campaignsList: async (startupId?: string) => {
      return startupId ? campaigns.filter((c) => c.startupId === startupId) : campaigns;
    },
    campaignsCreate: async (startupId: string) => {
      const sup = startups.find((s) => s.id === startupId);
      const name = sup ? sup.name : 'Startup';
      const newCampaign: PromotionCampaign = {
        id: `cmp-${Date.now().toString(36)}`,
        startupId,
        startupName: name,
        title: `${name} Growth Campaign`,
        type: 'launch',
        status: 'approved',
        channels: ['product_hunt', 'twitter_x', 'hacker_news'],
        assets: [
          { id: `ast-${Date.now()}-1`, channel: 'product_hunt', title: 'Product Hunt Launch Kit', content: `**Tagline:** ${sup?.tagline || 'The modern way to build'}\n\n**Maker Comment:**\nHey PH community! We are thrilled to introduce ${name}.\n\nBuilt to make life 10x easier for teams worldwide. Give it a spin and let us know what you think!`, status: 'approved', createdAt: Date.now() },
          { id: `ast-${Date.now()}-2`, channel: 'twitter_x', title: 'Twitter/X Announcement Thread', content: `🚨 Big news: ${name} is officially live!\n\nHere is why we built it and what it does for you 🧵👇\n\n1/ The status quo was broken.\n2/ ${name} solves this with elegant, autonomous tools.\n3/ Check it out at ${sup?.websiteUrl || 'our site'}!`, status: 'approved', createdAt: Date.now() }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      campaigns.unshift(newCampaign);
      return newCampaign;
    },
    campaignsUpdateAsset: async (_campaignId: string, _assetId: string, _patch: any) => ({ ok: true }),

    // Control & Terminal & System
    controlAutoDelivery: async () => ({ ok: true }),
    historyAdd: async () => ({ ok: true }),
    historySearch: async () => [],
    githubIssues: async () => [],
    gitIsRepo: async () => false,
    freeflowTranscribe: async () => ({ ok: false, error: 'Voice transcription not available in browser mode' }),
    spawnPty: async () => ({ ok: true, ptyId: 'mock-pty' }),
    writePty: async () => ({ ok: true }),
    killPty: async () => ({ ok: true }),
    resizePty: async () => ({ ok: true }),
    onPtyData: () => () => {},
    onPtyExit: () => () => {},
    controlSnapshot: async () => ({ ok: true }),
    slackReply: async () => ({ ok: true }),
    onSlackMessage: () => () => {},
    onBreakerState: () => () => {},
    onHiveTerminalHandoff: () => () => {},
    onHiveAgentSpawned: () => () => {},
    onHiveAgentArchived: () => () => {},
    onRealtimeEnqueue: () => () => {},
    onAutoCompact: () => () => {},
    changeHome: async () => ({ ok: true }),
    chooseFolder: async () => ({ ok: true, path: 'C:\\UniversalCompany' }),
    agentDirectory: async () => ({ godId: 'god', agents: [] }),
    agentContext: async () => ({ tokens: 14200, limit: 200000 }),
    hiveRegistry: async () => ({
      godId: 'god',
      agents: {
        god: {
          name: 'Michael Scott',
          role: 'Chief Executive Officer (CEO)',
          provider: 'claude',
          model: 'claude-3-7-sonnet-latest',
          status: 'working',
          cwd: 'C:\\UniversalCompany',
          owner: 'human',
          archived: false,
          created_at: new Date().toISOString(),
          lastSeen: Date.now()
        },
        jim: {
          name: 'Jim Halpert',
          role: 'Chief Growth Officer (CGO)',
          provider: 'claude',
          model: 'claude-3-7-sonnet-latest',
          status: 'working',
          cwd: 'C:\\UniversalCompany',
          owner: 'human',
          archived: false,
          created_at: new Date().toISOString(),
          lastSeen: Date.now()
        },
        pam: {
          name: 'Pam Beesly',
          role: 'PR & Community Lead',
          provider: 'claude',
          model: 'claude-3-7-sonnet-latest',
          status: 'working',
          cwd: 'C:\\UniversalCompany',
          owner: 'human',
          archived: false,
          created_at: new Date().toISOString(),
          lastSeen: Date.now()
        },
        ryan: {
          name: 'Ryan Howard',
          role: 'Senior Full-Stack Engineer & CTO',
          provider: 'claude',
          model: 'claude-3-7-sonnet-latest',
          status: 'working',
          cwd: 'C:\\UniversalCompany',
          owner: 'human',
          archived: false,
          created_at: new Date().toISOString(),
          lastSeen: Date.now()
        },
        dwight: {
          name: 'Dwight Schrute',
          role: 'Head of Product & Intelligence',
          provider: 'claude',
          model: 'claude-3-7-sonnet-latest',
          status: 'idle',
          cwd: 'C:\\UniversalCompany',
          owner: 'human',
          archived: false,
          created_at: new Date().toISOString(),
          lastSeen: Date.now()
        },
        kevin: {
          name: 'Kevin Malone',
          role: 'Finance & Compliance Officer',
          provider: 'claude',
          model: 'claude-3-7-sonnet-latest',
          status: 'idle',
          cwd: 'C:\\UniversalCompany',
          owner: 'human',
          archived: false,
          created_at: new Date().toISOString(),
          lastSeen: Date.now()
        }
      }
    }),
    hivePatchAgentRole: async () => ({ ok: true })
  };

  const safeBridge = new Proxy(browserBridge as any, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string') {
        if (prop in target) {
          return target[prop];
        }
        if (prop.startsWith('on')) {
          return () => () => {};
        }
        return async (...args: any[]) => {
          console.debug(`[browserBridge fallback] ${prop}`, args);
          return { ok: true };
        };
      }
      return Reflect.get(target, prop);
    }
  });

  (window as any).cth = safeBridge;

  try {
    window.localStorage.setItem('cth.skipHivePickerOnce', '1');
  } catch {}

  // Populate initial corporate agents in Zustand store if empty
  const state = useStore.getState();
  if (!state.agents || state.agents.length === 0) {
    const defaultAgents: Agent[] = [
      {
        id: 'god',
        name: 'Michael Scott',
        character: 'michael',
        accent: 'lemon',
        description: 'Chief Executive Officer (CEO)',
        project: 'Universal Company',
        tmuxTarget: 'god:0.0',
        cwd: 'C:\\UniversalCompany',
        status: 'working',
        action: 'Orchestrating departments and reviewing startup dossiers',
        progress: 3,
        contextTokens: 14200,
        contextLimit: 200000,
        isGod: true
      },
      {
        id: 'jim',
        name: 'Jim Halpert',
        character: 'jim',
        accent: 'sky',
        description: 'Chief Growth Officer (CGO)',
        project: 'Universal Company',
        tmuxTarget: 'jim:0.0',
        cwd: 'C:\\UniversalCompany',
        status: 'working',
        action: 'Crafting viral distribution and social launch campaigns',
        progress: 4,
        contextTokens: 28500,
        contextLimit: 200000
      },
      {
        id: 'pam',
        name: 'Pam Beesly',
        character: 'pam',
        accent: 'peach',
        description: 'PR & Community Lead',
        project: 'Universal Company',
        tmuxTarget: 'pam:0.0',
        cwd: 'C:\\UniversalCompany',
        status: 'working',
        action: 'Managing Product Hunt launch kits and media outreach',
        progress: 2,
        contextTokens: 9800,
        contextLimit: 200000
      },
      {
        id: 'ryan',
        name: 'Ryan Howard',
        character: 'ryan',
        accent: 'mint',
        description: 'Senior Full-Stack Engineer & CTO',
        project: 'Universal Company',
        tmuxTarget: 'ryan:0.0',
        cwd: 'C:\\UniversalCompany',
        status: 'working',
        action: 'Auditing code repositories and building API connectors',
        progress: 5,
        contextTokens: 42100,
        contextLimit: 200000
      },
      {
        id: 'dwight',
        name: 'Dwight Schrute',
        character: 'dwight',
        accent: 'coral',
        description: 'Head of Product & Intelligence',
        project: 'Universal Company',
        tmuxTarget: 'dwight:0.0',
        cwd: 'C:\\UniversalCompany',
        status: 'idle',
        action: 'Analyzing competitor pricing models and market dossiers',
        progress: 1,
        contextTokens: 5200,
        contextLimit: 200000
      },
      {
        id: 'kevin',
        name: 'Kevin Malone',
        character: 'kevin',
        accent: 'lilac',
        description: 'Finance & Compliance Officer',
        project: 'Universal Company',
        tmuxTarget: 'kevin:0.0',
        cwd: 'C:\\UniversalCompany',
        status: 'idle',
        action: 'Auditing operational metrics and token expenditures',
        progress: 1,
        contextTokens: 3100,
        contextLimit: 200000
      }
    ];

    defaultAgents.forEach((a) => state.addAgent(a));
    state.select('god');
  }
}

// Auto-install immediately when running in web browser
installBrowserBridgeIfMock();
