// Agents Office — Real-Time Live Web Intelligence
// Provides real-time internet search, developer discussions, and competitor intel
// with zero-cost open endpoints (Algolia HackerNews, GitHub, and live web fetch).

export async function searchTechNews(query = 'document format OR PDF OR Notion', limit = 5) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'LDocStudio-ResearchAgent/1.0' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || []).map(h => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points || 0,
      comments: h.num_comments || 0,
      date: h.created_at?.slice(0, 10)
    }));
  } catch (err) {
    console.warn('Realtime search failed:', err.message);
    return [];
  }
}

export async function fetchLivePage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Strip scripts, styles, and tags
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 4000);
  } catch (err) {
    return null;
  }
}

export async function getLiveMarketIntel(topic = 'PDF Notion document format') {
  const stories = await searchTechNews(topic, 6);
  if (!stories.length) return '';
  return stories.map(s => `- **${s.title}** (${s.points} points, ${s.comments} comments)\n  Source: ${s.url} [${s.date}]`).join('\n');
}