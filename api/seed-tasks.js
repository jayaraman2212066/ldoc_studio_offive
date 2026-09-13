// Pre-bundled strategic seed tasks and completed deliverables for LDOC Studio
// Guarantees 100% persistence on Vercel serverless cold starts.

export const SEED_TASKS = [
  {
    id: "task-ldoc-marketing",
    dept: "marketing",
    agent: "mlead",
    title: "Show HN Launch Campaign Pack: LDoc Studio — Documents That Compute, React & Evolve (.ldocx)",
    text: "Formulate the official HackerNews Show HN & Developer Launch Pack for LDOC Studio (https://ldoc-studios.vercel.app/). Focus on replacing static 1993 PDFs with 3D WebGL spatial viewports, reactive WASM code execution, and Spec v2.5.0.",
    plan: [
      "Analyze PDF limitations vs living .ldocx containers",
      "Draft Show HN title, timing, and founder submission comment",
      "Formulate interactive demo walkthrough and discussion hooks"
    ],
    eta: 20,
    state: "done",
    addedAt: 1789291800000,
    doneAt: 1789292400000,
    result: `# Show HN: LDOC Studio – Open 3D, executable alternative to 1993 PDFs (.ldocx)

**Founder:** Jayaraman | **Target Launch:** https://ldoc-studios.vercel.app/

### Submission Title:
\`Show HN: LDOC Studio – The Living 3D Alternative to 1993 PDFs (.ldocx)\`

### Target Timing:
Tuesday or Wednesday at 08:30 AM EST (optimal HackerNews velocity window).

### Official Founder Comment (by Jayaraman):
Hey HN, I'm Jayaraman, creator of LDOC Studio.

In 1993, Adobe designed the PDF to replicate frozen ink on physical paper. Thirty-three years later, modern engineering teams still use flat, static PDFs to document dynamic 3D assemblies, complex math, and interactive scientific data.

We built **LDOC Studio** and the open **\`.ldocx\` (Living Document Format, Spec v2.5.0)** to replace page emulators with local-first, reactive computational containers.

### What makes \`.ldocx\` different?
* **Native 3D & WebGL Canvas:** Embed live 3D CAD models, point clouds, and interactive simulation viewports directly alongside text. Orbit, inspect layers, and slice cross-sections at 60 FPS without installing bulky proprietary viewers.
* **Reactive Computational Blocks:** Powered by sandboxed WebAssembly, code snippets execute deterministically inside the document. Adjust an input parameter, and associated equations, charts, and 3D visualizers recalculate instantly via local CRDT state.
* **Strict Zero-Telemetry Air-Gapping:** Built for defense, aerospace, and high-security enterprise environments. The viewer makes zero outbound network requests. Ever. Documents are 100% self-contained and offline-first.
* **Open Standard Specification (v2.5.0):** Open container standard (ZIP/JSON/WASM/glTF). No vendor lock-in, zero Adobe licensing fees, and full programmatic generation via CLI.

### Live Links:
* **Document Workspace:** https://ldoc-studios.vercel.app/live-studio
* **Specification & Format:** https://ldoc-studios.vercel.app/format
* **Pro License ($19 Lifetime):** https://jay-app.lemonsqueezy.com/buy/2096502

We'd love HN's candid feedback on CAD file imports and browser memory footprints when handling large 3D assemblies!`,
    tools: ["gemini-ai", "github-intel", "hive-delegation"],
    used: ["Google Gemini Pro", "HIVE Handoff (SCOUT)"],
    hiveTrail: [
      { from: "mlead", to: "scout", act: "request", hops: 1 },
      { from: "scout", to: "mlead", act: "inform", hops: 2 }
    ]
  },
  {
    id: "task-ldoc-delivery",
    dept: "delivery",
    agent: "dlead",
    title: "Technical Evaluation of /live-studio & Production Feedback Embed Code",
    text: "Perform a comprehensive technical evaluation of the Live Document Workspace at https://ldoc-studios.vercel.app/live-studio. Audit Spec v2.5.0 container serialization and formulate the production feedback embed snippet.",
    plan: [
      "Evaluate live studio WebGL canvas performance",
      "Verify container export & CRDT state integrity",
      "Build live feedback webhook embed script for ldoc-studios.vercel.app"
    ],
    eta: 20,
    state: "done",
    addedAt: 1789291800000,
    doneAt: 1789292400000,
    result: `# Technical Audit: Live Document Workspace & Feedback Integration

**App Target:** https://ldoc-studios.vercel.app/live-studio
**Format Spec:** .ldocx v2.5.0 Container Standard

### 1. Technical Evaluation Summary:
* **3D Canvas Rendering:** Three.js / WebGL viewport renders 60 FPS spatial models with smooth orbit controls and directional lighting.
* **State Management:** Reactive document model isolates computational blocks and prevents cascade memory leaks.
* **Container Packaging:** \`.ldocx\` packages JSON manifest, WebAssembly binaries, glTF 3D meshes, and Markdown layers into a single portable container.

### 2. Live Feedback Webhook Embed Snippet:
To connect user feedback and bug reports directly from \`ldoc-studios.vercel.app\` to our company's QA and Customer Mail agents, embed this script into the HTML header or footer of \`ldoc-studios.vercel.app\`:

\`\`\`html
<!-- LDOC Studio HQ Live Inbound Feedback Pipeline -->
<script>
  window.sendHQFeedback = async function(email, feedback, type = 'User Feedback') {
    return fetch('https://ldoc-studio-company.vercel.app/api/webhook/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, feedback, type, timestamp: new Date().toISOString() })
    }).then(r => r.json());
  };
</script>
\`\`\`

When a user submits feedback or reports a bug, it instantly creates an urgent task in our company command center!`,
    tools: ["gemini-ai", "github-intel", "hive-delegation"],
    used: ["Google Gemini Pro", "HIVE Handoff (QA)"],
    hiveTrail: [
      { from: "dlead", to: "qa", act: "request", hops: 1 },
      { from: "qa", to: "dlead", act: "inform", hops: 2 }
    ]
  },
  {
    id: "task-ldoc-sales",
    dept: "sales",
    agent: "lexi",
    title: "LemonSqueezy Conversion Optimization ($19 Pro) & Aerospace Outbound Playbook",
    text: "Construct the commercial conversion strategy for LDOC Studio: optimize the $19 Lifetime Pro license funnel on LemonSqueezy (https://jay-app.lemonsqueezy.com/buy/2096502) and draft the Enterprise Air-Gapped Fleet Tier ($499/seat/yr) proposal.",
    plan: [
      "Analyze LemonSqueezy checkout conversion flow",
      "Structure Enterprise Air-Gapped Fleet Tier ($499/seat/yr)",
      "Build aerospace & defense CAD documentation battlecard"
    ],
    eta: 20,
    state: "done",
    addedAt: 1789291800000,
    doneAt: 1789292400000,
    result: `# Commercial Sales Strategy & Conversion Playbook

**Target Checkout:** https://jay-app.lemonsqueezy.com/buy/2096502

### 1. LemonSqueezy Checkout Optimization ($19 Lifetime Pro):
* **Value Proposition:** Unlock unlimited 3D block embeds, WASM computation exports, and commercial distribution rights for \`.ldocx\` files.
* **Conversion Boosters:**
  - Embed a "Test Drive 3D Document" banner on the LemonSqueezy checkout page.
  - Add instant cryptographic license key issuance via email.
  - Provide 14-day zero-risk satisfaction guarantee.

### 2. Enterprise Air-Gapped Fleet Tier ($499/seat/year):
* **Ideal Customer Profile:** Aerospace & defense engineering teams (NASA JPL, Lockheed, Raytheon, Boeing), automotive CAD designers, medical device researchers.
* **Core Value Driver:** Strict zero-telemetry guarantee. Defense teams cannot allow sensitive CAD documentation to communicate with cloud servers. \`.ldocx\` containers run 100% offline.
* **Fleet Features:** Hardware-locked activation, cryptographically verified container signatures, dedicated on-premise CLI compiler, and SOC2 / NIST 800-171 compliance sheets.`,
    tools: ["gemini-ai", "github-intel"],
    used: ["Google Gemini Pro", "Corporate Sales Ladder"]
  },
  {
    id: "task-ldoc-emails",
    dept: "emails",
    agent: "elead",
    title: "3-Part Customer Onboarding & Activation Drip Campaign for Early Adopters",
    text: "Formulate the 3-part Customer Onboarding & Activation Drip Campaign for LDOC Studio early adopters: Email 1 (Create your first 3D WebGL living document), Email 2 (Executing code inside containers), and Email 3 (Zero-telemetry air-gapping).",
    plan: [
      "Design onboarding lifecycle for studio visitors",
      "Draft Email 1: 60-second quickstart",
      "Draft Email 2: Reactive WASM execution",
      "Draft Email 3: Enterprise air-gapped security"
    ],
    eta: 20,
    state: "done",
    addedAt: 1789291800000,
    doneAt: 1789292400000,
    result: `# Customer Onboarding & Activation Sequence

**Target:** Early adopters on https://ldoc-studios.vercel.app/ and LemonSqueezy license holders.

### Email 1 (Day 0 - Immediate): Welcome to the Post-PDF Era
**Subject:** Welcome to LDOC Studio — Your first 3D living document in 60 seconds
> Hi {{name}},
>
> For 30 years, PDFs have forced interactive ideas onto frozen virtual paper. Today, that changes.
> You now have access to LDOC Studio. In under 60 seconds, you can:
> 1. Open the Live Workspace: https://ldoc-studios.vercel.app/live-studio
> 2. Insert a 3D WebGL CAD block (/3d)
> 3. Export your first standalone \`.ldocx\` file
> Reply to this email anytime — our engineering team reads every message!

### Email 2 (Day 3): Making Documents Reactive with Code
**Subject:** Documents that compute: Running sandboxed code in .ldocx
> Hi {{name}},
> Static numbers get outdated the moment they're exported. With \`.ldocx\`, formulas and data models remain alive.
> You can embed sandboxed Python/WASM snippets that calculate live outputs directly inside your report.
> Check out the live interactive showcase: https://ldoc-studios.vercel.app/

### Email 3 (Day 7): Strict Zero-Telemetry & Air-Gapped Compliance
**Subject:** Why defense and engineering teams trust .ldocx for classified docs
> Hi {{name}},
> When sharing proprietary CAD designs or technical specs, cloud document links introduce security vulnerabilities.
> Every \`.ldocx\` container is 100% self-contained and makes zero outbound network calls.
> Explore the full format specification: https://ldoc-studios.vercel.app/format`,
    tools: ["gemini-ai", "github-intel"],
    used: ["Google Gemini Pro", "SLA Pipeline Engine"]
  },
  {
    id: "task-ldoc-fin",
    dept: "fin",
    agent: "alead",
    title: "LemonSqueezy Webhook Integration & $10,000 ARR Revenue Milestone Roadmap",
    text: "Architect the LemonSqueezy Webhook Integration (/api/webhook/lemonsqueezy) and revenue tracking model for LDOC Studio. Define automated license key fulfillment and financial milestones.",
    plan: [
      "Specify webhook event handler for LemonSqueezy orders",
      "Model unit economics for $19 Pro Lifetime vs $499 Fleet",
      "Build roadmap from 0 to $10,000 ARR"
    ],
    eta: 20,
    state: "done",
    addedAt: 1789291800000,
    doneAt: 1789292400000,
    result: `# Financial Model, Webhook Integration & Revenue Roadmap

**Monetization Engine:** LemonSqueezy (\`jay-app.lemonsqueezy.com/buy/2096502\`)

### 1. LemonSqueezy Webhook Handler (\`POST /api/webhook/lemonsqueezy\`):
* **Trigger Event:** \`order_created\` / \`order_refunded\`
* **Payload Ingestion:** Capture customer email, order ID, product variant ($19 Pro Lifetime or $499 Fleet), and license key.
* **Fulfillment Pipeline:**
  - Ingest transaction into company ledger.
  - Automatically send license activation key via email.
  - Trigger \`cmail\` welcome sequence.

### 2. Unit Economics & Margins:
* **Free Community Tier:** $0 (Local-first browser execution, zero server compute cost).
* **Pro Lifetime Tier ($19 one-off):**
  - LemonSqueezy fee: 5% + $0.50 = $1.45
  - Net Margin per sale: $17.55 (92.4% net margin)
* **Enterprise Fleet Tier ($499/seat/yr):**
  - Payment processing: ~3.5% = $17.46
  - Net Margin per seat: $481.54 (96.5% net margin)

### 3. $10,000 ARR Milestones:
* **Milestone 1 ($1,000 ARR):** 52 Pro Lifetime licenses sold via Show HN launch.
* **Milestone 2 ($5,000 ARR):** 200 Pro licenses + 2 Enterprise Fleet pilots (4 seats each).
* **Milestone 3 ($10,000 ARR):** 350 Pro licenses + 7 Enterprise Fleet seats.`,
    tools: ["gemini-ai", "github-intel"],
    used: ["Google Gemini Pro", "Financial Projections Engine"]
  },
  {
    id: "task-ldoc-ops",
    dept: "ops",
    agent: "olead",
    title: "Living Document Format (.ldocx) Spec v2.5 Open Governance & Moat Framework",
    text: "Formulate the Open Living Document Format (.ldocx) Spec v2.5 Governance Standard & IP Protection memo under Apache 2.0. Map technical defensibility against PDF, Notion, and Jupyter.",
    plan: [
      "Document .ldocx container architecture under Apache 2.0",
      "Construct competitive defensibility matrix",
      "Establish enterprise trust framework"
    ],
    eta: 20,
    state: "done",
    addedAt: 1789291800000,
    doneAt: 1789292400000,
    result: `# Open Container Specification v2.5 (.ldocx) & Moat Strategy

**Format Standard:** Living Document Format (.ldocx)
**Governance License:** Apache 2.0 (Open Standard)

### 1. The .ldocx Container Architecture:
* **Archive Structure:** Standard ZIP package containing:
  - \`manifest.json\`: Document schema, cryptographic signatures, permissions
  - \`content.md\`: Structured markdown textual layout
  - \`assets/\`: WebGL 3D models (.gltf, .glb), textures, point clouds
  - \`compute/\`: Sandboxed deterministic WebAssembly modules (.wasm)
* **Open Standard Guarantee:** By licensing the container specification under Apache 2.0, enterprise clients are guaranteed that their documents will never be held hostage by proprietary reader licensing (unlike Adobe Acrobat).

### 2. Competitive Moat Analysis:
* **vs. Adobe PDF (1993):** PDF cannot execute code or render interactive 60 FPS 3D WebGL viewports. \`.ldocx\` is dynamic, computational, and modern.
* **vs. Notion / Google Docs:** Cloud-locked proprietary silos that require continuous network access. Cannot function inside classified air-gapped SCIF environments. \`.ldocx\` is 100% offline-first.
* **vs. Jupyter Notebooks:** Jupyter is a development runtime, not a presentation-grade document standard. It cannot be emailed as an immutable, self-rendering report. \`.ldocx\` delivers publication-grade layout with embedded compute.`,
    tools: ["gemini-ai", "github-intel"],
    used: ["Google Gemini Pro", "Algolia Tech Trends Engine"]
  }
];
