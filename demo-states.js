// Auto-demo different states
const WebSocket = require('ws');

const states = [
  { delay: 2000, type: 'user.prompt_submit', name: '💭 Thinking' },
  { delay: 3000, type: 'tool.pre_use', name: '🔨 Working', data: { tool_name: 'Read' } },
  { delay: 3000, type: 'subagent.spawn', name: '🤹 Juggling', data: { agent_type: 'Explore' } },
  { delay: 3000, type: 'tool.post_use_failure', name: '❌ Error' },
  { delay: 3000, type: 'session.idle', name: '🎉 Attention (Happy!)' },
  { delay: 3000, type: 'worktree.create', name: '📦 Carrying' },
  { delay: 3000, type: 'session.pre_compact', name: '🧹 Sweeping' },
  { delay: 3000, type: 'session.end', name: '😴 Sleeping' },
];

console.log('🎮 Starting interactive state demo...\n');

const ws = new WebSocket('ws://localhost:18789/events');
const sessionId = 'demo-interactive-' + Date.now();
let index = 0;

ws.on('open', () => {
  console.log('✅ Connected to OpenClaw Gateway\n');
  console.log('🎬 Watch your desktop pet as it changes states!\n');
  console.log('════════════════════════════════════════════════\n');

  function sendNext() {
    if (index >= states.length) {
      console.log('\n════════════════════════════════════════════════');
      console.log('✅ Demo complete! The pet will return to idle.\n');
      ws.close();
      process.exit(0);
      return;
    }

    const state = states[index];

    setTimeout(() => {
      const event = {
        type: state.type,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        data: state.data || {}
      };

      ws.send(JSON.stringify(event));
      console.log(`📤 [${index + 1}/${states.length}] ${state.name}`);
      console.log(`   Event: ${state.type}`);
      console.log(`   Health Effect: WEAK (slow + desaturated)\n`);

      index++;
      sendNext();
    }, state.delay);
  }

  sendNext();
});

ws.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
