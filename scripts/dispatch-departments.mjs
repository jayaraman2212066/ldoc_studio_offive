// Script to dispatch aligned startup tasks to all departments on the live Vercel HQ
// and verify their deliverables and HIVE delegation.

const BASE_URL = 'https://ldoc-studio-company.vercel.app';

const DEPARTMENT_MISSIONS = [
  {
    dept: 'marketing',
    text: 'Draft the official Show HN: LDoc Studio — The Living 3D Alternative to PDF (.ldocx) launch post. Focus on replacing 1993 static PDFs with reactive 3D WebGL containers and zero-telemetry air-gapped security.'
  },
  {
    dept: 'sales',
    text: 'Draft the Enterprise Air-Gapped Fleet Tier ($499/seat/yr) security specification and proposal sheet for defense and aerospace engineering teams requiring offline .ldocx deployment.'
  },
  {
    dept: 'delivery',
    text: 'Create the technical side-by-side feature comparison matrix for our landing page: Legacy PDF (1993) vs Living .ldocx Container (2026). Cover WebGL rendering, CRDT state, offline security, and air-gapped compliance.'
  },
  {
    dept: 'emails',
    text: 'Formulate the 15-minute Rapid Response and Customer Onboarding Playbook for incoming user feedback and bug reports from ldoc-studios.vercel.app.'
  },
  {
    dept: 'fin',
    text: 'Structure the corporate revenue model and unit economics for LDoc Studio: Free Community Tier, $19 Studio Pro Lifetime, and $499/seat/yr Air-Gapped Enterprise Fleet.'
  },
  {
    dept: 'ops',
    text: 'Perform an intelligence scan on document tooling market dynamics (Typst, Notion, PDF.js, Excalidraw) and document our primary technical moat in the company brain.'
  }
];

async function runFleet() {
  console.log('◈ J AI ENTERPRISES: Dispatching aligned missions to all 6 departments...\n');

  for (const mission of DEPARTMENT_MISSIONS) {
    console.log(`\n======================================================`);
    console.log(`[DEPARTMENT: ${mission.dept.toUpperCase()}] Creating Task...`);
    
    // 1. Create Task
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mission)
    }).then(r => r.json());

    if (!createRes || !createRes.id) {
      console.error(`Failed to create task for ${mission.dept}:`, createRes);
      continue;
    }

    console.log(`✓ Task Created: "${createRes.title}"`);
    console.log(`  Assigned Agent: ${createRes.agent} | Estimated Time: ${createRes.eta} mins`);
    console.log(`  Routing Reason: ${createRes.why}`);

    // 2. Run Task on Live Server
    console.log(`  Executing task via Gemini Pro & HIVE Delegation...`);
    const runRes = await fetch(`${BASE_URL}/api/tasks/${createRes.id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }).then(r => r.json());

    if (runRes.error) {
      console.error(`  ✗ Error executing task:`, runRes.result);
    } else {
      console.log(`  ✓ Deliverable Completed!`);
      console.log(`  Tools Used: [${(runRes.tools || []).join(', ')}]`);
      console.log(`  Intelligence Sources: [${(runRes.used || []).join(', ')}]`);
      if (runRes.hiveTrail && runRes.hiveTrail.length) {
        console.log(`  ◈ HIVE Inter-Agent Delegation: ${runRes.hiveTrail[0].from} ➔ ${runRes.hiveTrail[0].to} (${runRes.hiveTrail[0].act} ➔ ${runRes.hiveTrail[1].act})`);
      }
      console.log(`  Result Snippet:\n  ` + (runRes.result || '').slice(0, 180).replace(/\n/g, '\n  ') + '...');
    }
  }

  console.log('\n======================================================');
  console.log('◈ All 6 departments have completed their strategic deliverables!');
  console.log('◈ All tasks are now waiting in the Command Center for CEO Jayaraman\'s approval.');
}

runFleet().catch(console.error);
