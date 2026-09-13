async function check() {
  const [tasks, board, hive, project] = await Promise.all([
    fetch('https://ldoc-studio-company.vercel.app/api/tasks').then(r => r.json()),
    fetch('https://ldoc-studio-company.vercel.app/api/board').then(r => r.json()),
    fetch('https://ldoc-studio-company.vercel.app/api/hive/messages').then(r => r.json()),
    fetch('https://ldoc-studio-company.vercel.app/api/project/status').then(r => r.json())
  ]);

  console.log('=== TASKS SUMMARY ===');
  console.log('Total Tasks:', tasks.length);
  tasks.slice(0, 10).forEach(t => {
    console.log('[' + t.state.toUpperCase() + '] ' + t.dept + '/' + t.agent + ': ' + t.title + ' (by: ' + (t.by || 'system') + ')');
    if (t.result) console.log('  Result preview: ' + t.result.slice(0, 120).replace(/\n/g, ' ') + '...');
  });

  console.log('\n=== RECENT HIVE MESSAGES ===');
  console.log('Messages Count:', hive.messages?.length || 0);
  (hive.messages || []).slice(0, 5).forEach(m => {
    console.log('[' + m.act.toUpperCase() + '] ' + m.from + ' -> ' + m.to + ' (Hop ' + m.hops + '/3): ' + m.subject);
  });

  console.log('\n=== PROJECT STATUS ===');
  console.log('Repo:', project.repo);
  console.log('Authenticated:', project.authenticated);
  console.log('Recent Commits Count:', project.commits?.length || 0);
  (project.commits || []).slice(0, 3).forEach(c => {
    console.log('  * ' + (c.sha ? c.sha.slice(0, 7) : '') + ': ' + (c.message ? c.message.split('\n')[0] : ''));
  });

  console.log('\n=== BLACKBOARD SNIPPET ===');
  console.log((board.content || '').slice(0, 350) + '...');
}
check().catch(console.error);
