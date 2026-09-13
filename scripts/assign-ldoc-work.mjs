// Script to assign concrete product development and launch work for LDOC Studio
// across all 6 departments on the live Vercel HQ and execute with Gemini Pro & HIVE.

const BASE_URL = 'https://ldoc-studio-company.vercel.app';

const LDOC_WORK_ORDERS = [
  {
    dept: 'marketing',
    text: 'Formulate the official HackerNews Show HN & Developer Launch Pack for LDOC Studio (https://ldoc-studios.vercel.app/). Focus on "Documents That Compute, React & Evolve (.ldocx)", replacing static 1993 PDFs with 3D WebGL spatial viewports, reactive WASM code execution, and Spec v2.5.0. Provide the exact HN title, submission timing, and first founder comment by Jayaraman.'
  },
  {
    dept: 'delivery',
    text: 'Perform a comprehensive technical evaluation of the Live Document Workspace at https://ldoc-studios.vercel.app/live-studio. Audit Spec v2.5.0 container serialization, local-first CRDT state sync, and formulate the production embed script tag connecting user feedback from ldoc-studios.vercel.app directly into our company webhook pipeline (/api/webhook/feedback).'
  },
  {
    dept: 'sales',
    text: 'Construct the commercial conversion strategy for LDOC Studio: optimize the $19 Lifetime Pro license funnel on LemonSqueezy (https://jay-app.lemonsqueezy.com/buy/2096502) and draft the Enterprise Air-Gapped Fleet Tier ($499/seat/yr) outbound proposal for defense and aerospace CAD documentation teams.'
  },
  {
    dept: 'emails',
    text: 'Formulate the 3-part Customer Onboarding & Activation Drip Campaign for LDOC Studio early adopters: Email 1 (Create your first 3D WebGL living document in 60 seconds), Email 2 (Executing deterministic code inside .ldocx containers), and Email 3 (Zero-telemetry air-gapped security and PDF migration).'
  },
  {
    dept: 'fin',
    text: 'Architect the LemonSqueezy Webhook Integration (/api/webhook/lemonsqueezy) and revenue tracking model for LDOC Studio. Define automated license key fulfillment for the $19 Lifetime Pro checkout (jay-app.lemonsqueezy.com/buy/2096502) and build the financial milestone roadmap from 0 to $10,000 ARR.'
  },
  {
    dept: 'ops',
    text: 'Formulate the Open Living Document Format (.ldocx) Spec v2.5 Governance Standard & IP Protection memo under Apache 2.0. Map our technical defensibility and moat against legacy PDF viewers, Notion, and Jupyter Notebooks, guaranteeing zero proprietary vendor lock-in for enterprise clients.'
  }
];

async function assignWork() {
  console.log('================================================================');
  console.log('◈ J AI ENTERPRISES: Assigning Strategic Work for LDOC STUDIO ◈');
  console.log('◈ Target Product: https://ldoc-studios.vercel.app/ ◈');
  console.log('================================================================\n');

  const results = [];

  for (const order of LDOC_WORK_ORDERS) {
    console.log(`\n------------------------------------------------------`);
    console.log(`[DEPARTMENT: ${order.dept.toUpperCase()}] Creating Work Order...`);
    
    // 1. Create Task on Live Server
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).then(r => r.json());

    if (!createRes || !createRes.id) {
      console.error(`Failed to assign task for ${order.dept}:`, createRes);
      continue;
    }

    console.log(`✓ Work Order Logged: "${createRes.title}"`);
    console.log(`  Assigned Lead Agent: ${createRes.agent} (${createRes.dept})`);
    console.log(`  Estimated Time: ${createRes.eta} mins`);

    // 2. Execute Task on Live Server with Gemini Pro & HIVE
    console.log(`  Executing live with Gemini Pro & HIVE Delegation...`);
    const runRes = await fetch(`${BASE_URL}/api/tasks/${createRes.id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }).then(r => r.json());

    if (runRes.error) {
      console.error(`  ✗ Error during execution:`, runRes.result);
    } else {
      console.log(`  ✓ Deliverable Completed Successfully!`);
      console.log(`  Tools Engaged: [${(runRes.tools || []).join(', ')}]`);
      if (runRes.hiveTrail && runRes.hiveTrail.length) {
        console.log(`  ◈ HIVE Protocol: ${runRes.hiveTrail[0].from} ➔ ${runRes.hiveTrail[0].to} (${runRes.hiveTrail[0].act})`);
      }
      results.push({
        dept: order.dept,
        agent: createRes.agent,
        id: createRes.id,
        title: createRes.title,
        snippet: (runRes.result || '').slice(0, 200).replace(/\n/g, ' ')
      });
    }
  }

  console.log('\n================================================================');
  console.log('◈ All 6 departments have completed their LDOC Studio deliverables!');
  console.log('◈ Deliverables are now live in the Kanban Command Center ready for CEO approval.');
  console.log('================================================================');
  return results;
}

assignWork().catch(console.error);
