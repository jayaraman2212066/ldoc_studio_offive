import fs from 'fs';
const p = 'd:/ANDROID_STD/New folder/MULTIAGENT/src/v1data.js';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  /co:\['Harbour City Roofing'.*?\],/,
  "co:['GitHub Community Team','Vercel Engineering Lab','Stripe Developer Platform','Raytheon Defense Air-Gap Unit','NASA Jet Propulsion Systems','Lockheed Martin SCIF Division','BioNTech Molecular Research','Three.js WebGL Creators','Supabase Developer Guild','Docker Engineering Hub','HuggingFace Model Hub','Substack Tech Authors','Epic Games Unreal Team','CERN Scientific Computing','Autodesk CAD Systems','Figma Plugins Group','Siemens Digital Industries','Ethereum Foundation Docs','Palantir Foundry Team','Boeing Avionics Lab'],"
);

c = c.replace(
  /plan:\['Starter','Growth','Scale','Enterprise'\],/,
  "plan:['Free Community','Studio Pro ($19 Lifetime)','Cloud Workspace ($8/mo)','Enterprise Fleet ($499/yr)'],"
);

c = c.replace(
  /competitor:\['CallForge','RingPilot','Quotient CRM','DialAxis','Velora'\],/,
  "competitor:['Adobe Acrobat PDF','Notion Workspace','Jupyter Notebooks','Google Docs Canvas','Obsidian Vault'],"
);

c = c.replaceAll("G'day AJ", "Hello Jayaraman");
c = c.replaceAll(" AJ ", " Jayaraman ");
c = c.replaceAll("AJ’s", "Jayaraman’s");
c = c.replaceAll("AJ's", "Jayaraman's");
c = c.replaceAll("for AJ", "for Jayaraman");
c = c.replaceAll("to AJ", "to Jayaraman");
c = c.replaceAll("by AJ", "by Jayaraman");
c = c.replaceAll("with AJ", "with Jayaraman");

fs.writeFileSync(p, c, 'utf8');
console.log('Successfully updated src/v1data.js with LDoc Studio company data.');