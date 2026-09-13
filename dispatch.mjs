// Agents Office — Real-World Outbound Action Dispatcher
// Executes real actions when CEO Jayaraman approves a deliverable.

export async function dispatchApprovedTask(task) {
  const text = task.draft || task.result || task.text;
  const agent = task.agent || 'office';
  const title = task.title || 'Approved Company Action';
  const results = [];

  console.log(`🚀 [DISPATCH] Executing outbound action for task ${task.id} (${title})`);

  // 1. Discord Webhook Dispatch
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `LDoc Studio — ${agent.toUpperCase()}`,
          content: `**${title}**\n\n${text.slice(0, 1800)}`
        })
      });
      results.push({ target: 'discord', ok: res.ok, status: res.status });
    } catch (e) {
      results.push({ target: 'discord', ok: false, error: e.message });
    }
  }

  // 2. Telegram Bot Dispatch
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: `[LDoc Studio | ${agent}]\n${title}\n\n${text.slice(0, 3500)}`
        })
      });
      results.push({ target: 'telegram', ok: res.ok, status: res.status });
    } catch (e) {
      results.push({ target: 'telegram', ok: false, error: e.message });
    }
  }

  // 3. Generic Outbound Webhook (Zapier, Make.com, Buffer, Pipedream for X/Twitter)
  if (process.env.OUTBOUND_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.OUTBOUND_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'task_approved',
          timestamp: new Date().toISOString(),
          taskId: task.id,
          agent: task.agent,
          department: task.dept,
          title: task.title,
          content: text
        })
      });
      results.push({ target: 'webhook', ok: res.ok, status: res.status });
    } catch (e) {
      results.push({ target: 'webhook', ok: false, error: e.message });
    }
  }

  // Fallback: Local log if no webhooks configured yet
  if (!results.length) {
    results.push({
      target: 'ready_to_publish',
      ok: true,
      message: 'Approved and formatted. Add DISCORD_WEBHOOK_URL, TELEGRAM_BOT_TOKEN, or OUTBOUND_WEBHOOK_URL to auto-stream.'
    });
  }

  return results;
}