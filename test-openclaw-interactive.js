#!/usr/bin/env node
// Interactive OpenClaw Event Tester
// Send specific events to test different states

const WebSocket = require('ws');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let sessionId = 'interactive-session-' + Date.now();

// Event templates
const events = {
  '1': { type: 'user.prompt_submit', name: '💭 Thinking' },
  '2': { type: 'tool.pre_use', name: '🔨 Working (single task)', data: { tool_name: 'Read' } },
  '3': { type: 'subagent.spawn', name: '🤹 Juggling (multi-task)', data: { agent_type: 'Explore' } },
  '4': { type: 'tool.post_use_failure', name: '❌ Error' },
  '5': { type: 'session.idle', name: '🎉 Attention (happy!)' },
  '6': { type: 'session.end', name: '😴 Sleeping' },
  '7': { type: 'worktree.create', name: '📦 Carrying' },
  '8': { type: 'session.pre_compact', name: '🧹 Sweeping' },
};

function printMenu() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  OpenClaw Buddy - Interactive Event Tester   ║');
  console.log('╠═══════════════════════════════════════════════╣');
  console.log('║  Press a number to trigger an event:          ║');
  console.log('║                                                ║');
  Object.entries(events).forEach(([key, event]) => {
    console.log(`║  ${key}. ${event.name.padEnd(42)} ║`);
  });
  console.log('║                                                ║');
  console.log('║  q. Quit                                       ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
}

async function connectAndInteract() {
  console.log('🔌 Connecting to OpenClaw Gateway...');

  const ws = new WebSocket('ws://localhost:18789/events');

  ws.on('open', () => {
    console.log('✅ Connected!\n');
    printMenu();

    rl.on('line', (input) => {
      const choice = input.trim();

      if (choice === 'q' || choice === 'Q') {
        console.log('\n👋 Goodbye!\n');
        ws.close();
        rl.close();
        process.exit(0);
      }

      const event = events[choice];
      if (event) {
        const fullEvent = {
          type: event.type,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          data: event.data || {}
        };

        ws.send(JSON.stringify(fullEvent));
        console.log(`✅ Sent: ${event.name}\n`);
      } else {
        console.log('❌ Invalid choice. Try again.\n');
      }
    });
  });

  ws.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
    console.log('\n💡 Make sure the OpenClaw Gateway is running:');
    console.log('   node test-openclaw-gateway.js\n');
    process.exit(1);
  });

  ws.on('close', () => {
    console.log('🔌 Connection closed');
    rl.close();
  });
}

connectAndInteract();
