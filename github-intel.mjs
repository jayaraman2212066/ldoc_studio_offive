// Agents Office — Real-Time GitHub Project Introspection Engine
// Allows agents (QA, Product, Dev, Marketing) to inspect live commits, issues, and files
// from jayaraman2212066/LDOCX-FORMAT-PROJECT-MARK1 and related repositories safely.

const DEFAULT_REPO = 'jayaraman2212066/LDOCX-FORMAT-PROJECT-MARK1';

function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LDocStudio-Autonomous-HQ/1.0'
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_PAT;
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
}

export async function getRecentCommits(repo = DEFAULT_REPO, limit = 5) {
  try {
    const url = `https://api.github.com/repos/${repo}/commits?per_page=${limit}`;
    const res = await fetch(url, { headers: getHeaders(), signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const commits = await res.json();
    return commits.map(c => ({
      sha: c.sha?.slice(0, 7),
      message: c.commit?.message?.split('\n')[0] || '',
      author: c.commit?.author?.name || '',
      date: c.commit?.author?.date?.slice(0, 10) || ''
    }));
  } catch (err) {
    console.warn('[GITHUB INTEL] Failed to fetch commits:', err.message);
    return [];
  }
}

export async function getOpenIssues(repo = DEFAULT_REPO, limit = 5) {
  try {
    const url = `https://api.github.com/repos/${repo}/issues?state=open&per_page=${limit}`;
    const res = await fetch(url, { headers: getHeaders(), signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const issues = await res.json();
    return issues.map(i => ({
      number: i.number,
      title: i.title,
      user: i.user?.login,
      comments: i.comments,
      updated_at: i.updated_at?.slice(0, 10),
      labels: (i.labels || []).map(l => l.name)
    }));
  } catch (err) {
    console.warn('[GITHUB INTEL] Failed to fetch issues:', err.message);
    return [];
  }
}

export async function getFile(path = 'package.json', repo = DEFAULT_REPO) {
  try {
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const res = await fetch(url, { headers: getHeaders(), signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    return null;
  } catch {
    return null;
  }
}

export async function getProjectContext(repo = DEFAULT_REPO) {
  const [commits, issues] = await Promise.all([
    getRecentCommits(repo, 4),
    getOpenIssues(repo, 4)
  ]);

  let intel = `PROJECT REPOSITORY: ${repo}\n`;
  if (commits.length) {
    intel += 'Recent Commits:\n' + commits.map(c => `  • [${c.sha}] ${c.message} (${c.author}, ${c.date})`).join('\n') + '\n';
  }
  if (issues.length) {
    intel += 'Active Issues/Tickets:\n' + issues.map(i => `  • #${i.number}: ${i.title} (${i.comments} comments, updated ${i.updated_at})`).join('\n') + '\n';
  }
  return intel;
}
