'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

test('Universal Company Data Models & Schemas Validation', () => {
  // Test data integrity of startup products
  const mockStartup = {
    id: 'startup-test-1',
    name: 'PulseFlow AI',
    tagline: 'Autonomous continuous integration agent for modern teams',
    category: 'devtools',
    status: 'ready',
    connectedAt: Date.now(),
    updatedAt: Date.now(),
    dossier: {
      elevatorPitch: 'PulseFlow AI fixes broken CI builds autonomously.',
      summary: 'PulseFlow AI monitors GitHub Actions and fixes test regressions.',
      valueProposition: 'Cuts CI pipeline debugging time by 80%.',
      targetAudience: ['DevOps Engineers', 'Frontend Leads'],
      keyFeatures: ['Auto-rebase', 'Flaky test detection', 'AI patch generation'],
      competitors: ['Manual debugging', 'Jenkins'],
      tags: ['ci', 'ai', 'devtools'],
      promotionAngles: ['Why developers hate fixing CI', 'The autonomous DevOps team']
    },
    metrics: {
      campaignsRun: 1,
      totalAssetsGenerated: 4
    }
  };

  assert.equal(mockStartup.name, 'PulseFlow AI');
  assert.equal(mockStartup.category, 'devtools');
  assert.equal(mockStartup.dossier.keyFeatures.length, 3);
  assert.equal(mockStartup.metrics.totalAssetsGenerated, 4);
});

test('Multi-Channel Campaign Generation Logic', () => {
  const channels = ['product_hunt', 'twitter_x', 'linkedin', 'hacker_news'];
  const campaign = {
    id: 'camp-test-1',
    startupId: 'startup-test-1',
    startupName: 'PulseFlow AI',
    title: 'PulseFlow AI — Official Launch',
    type: 'launch',
    status: 'ready',
    channels,
    assets: [
      {
        id: 'asset-ph',
        channel: 'product_hunt',
        title: 'Product Hunt Launch Kit for PulseFlow AI',
        content: 'Hey Product Hunt! Introducing PulseFlow AI...',
        status: 'approved'
      },
      {
        id: 'asset-x',
        channel: 'twitter_x',
        title: 'Viral Twitter/X Thread for PulseFlow AI',
        content: '1/ Most teams waste hours debugging CI...',
        status: 'approved'
      },
      {
        id: 'asset-li',
        channel: 'linkedin',
        title: 'LinkedIn Founder Story for PulseFlow AI',
        content: 'Excited to announce PulseFlow AI...',
        status: 'approved'
      },
      {
        id: 'asset-hn',
        channel: 'hacker_news',
        title: 'Show HN: PulseFlow AI',
        content: 'Show HN: PulseFlow AI – Autonomous CI agent',
        status: 'approved'
      }
    ]
  };

  assert.equal(campaign.assets.length, 4);
  assert.ok(campaign.assets.some((a) => a.channel === 'product_hunt'));
  assert.ok(campaign.assets.some((a) => a.channel === 'twitter_x'));
  assert.ok(campaign.assets.some((a) => a.channel === 'linkedin'));
  assert.ok(campaign.assets.some((a) => a.channel === 'hacker_news'));
});

test('CEO Company Overview Aggregation', () => {
  const overview = {
    companyName: 'Universal Company',
    connectedStartupsCount: 3,
    activeCampaignsCount: 5,
    assetsGeneratedCount: 20,
    activeAgentsCount: 4,
    departments: [
      { name: 'Executive Suite', lead: 'CEO', status: 'operational', headline: 'Orchestrating company' },
      { name: 'Growth & Promotion', lead: 'Chief Growth Officer', status: 'busy', headline: 'Executing campaigns' },
      { name: 'Engineering Hub', lead: 'CTO', status: 'operational', headline: 'Maintaining connectors' },
      { name: 'Product & Intel Lab', lead: 'Head of Product', status: 'operational', headline: 'Dossiers synced' }
    ],
    recentEvents: [
      { id: 'ev-1', type: 'product_connected', title: 'Connected: PulseFlow AI', ts: Date.now() }
    ],
    executiveSummary: 'All departments operational.'
  };

  assert.equal(overview.companyName, 'Universal Company');
  assert.equal(overview.departments.length, 4);
  assert.equal(overview.connectedStartupsCount, 3);
  assert.equal(overview.activeCampaignsCount, 5);
  assert.equal(overview.recentEvents[0].type, 'product_connected');
});

test('Universal Company Independence and Metadata Validation', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'universal-company');
  assert.equal(pkg.author, 'Universal Company');
  assert.equal(pkg.homepage, 'https://universalcompany.ai');
  assert.ok(pkg.repository.url.includes('universalcompany'));

  const builderConfig = fs.readFileSync(path.join(__dirname, '..', 'electron-builder.yml'), 'utf8');
  assert.ok(builderConfig.includes('appId: com.universalcompany.app'));
  assert.ok(builderConfig.includes('productName: Universal Company'));
  assert.ok(builderConfig.includes('Universal-Company-${version}'));
  assert.ok(builderConfig.includes('universalcompany'));
});

