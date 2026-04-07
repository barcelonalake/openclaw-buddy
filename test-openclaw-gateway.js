#!/usr/bin/env node
// Mock OpenClaw Gateway for testing
// Simulates WebSocket events that openclaw-buddy can receive

const http = require('http');
const WebSocket = require('ws');

const PORT = 18789;

// Create HTTP server for health check
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'mock-openclaw-gateway' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server on /events path
const wss = new WebSocket.Server({
  server: httpServer,
  path: '/events'
});

console.log('🚀 Mock OpenClaw Gateway starting...');

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('✅ New client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });

  // Send welcome event
  ws.send(JSON.stringify({
    type: 'session.start',
    sessionId: 'demo-session-001',
    timestamp: new Date().toISOString(),
    data: {}
  }));
});

// Broadcast event to all connected clients
function broadcast(event) {
  const message = JSON.stringify(event);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Simulate OpenClaw events sequence
let sessionId = 'demo-session-001';
let eventIndex = 0;

const eventSequence = [
  { delay: 3000, type: 'user.prompt_submit', name: 'User asks a question' },
  { delay: 1000, type: 'tool.pre_use', name: 'Reading files', data: { tool_name: 'Read' } },
  { delay: 2000, type: 'tool.post_use', name: 'Finished reading' },
  { delay: 1000, type: 'tool.pre_use', name: 'Searching code', data: { tool_name: 'Grep' } },
  { delay: 2000, type: 'tool.post_use', name: 'Finished searching' },
  { delay: 1000, type: 'subagent.spawn', name: 'Spawning subagent', data: { agent_type: 'Explore' } },
  { delay: 3000, type: 'subagent.stop', name: 'Subagent finished' },
  { delay: 500, type: 'tool.pre_use', name: 'Writing file', data: { tool_name: 'Write' } },
  { delay: 2000, type: 'tool.post_use', name: 'File written' },
  { delay: 1000, type: 'session.idle', name: 'Task completed!' },
  { delay: 5000, type: 'session.end', name: 'Session ended' },
];

function runEventSequence() {
  if (clients.size === 0) {
    console.log('⏸️  No clients connected, pausing event sequence...');
    setTimeout(runEventSequence, 5000);
    return;
  }

  const event = eventSequence[eventIndex];

  setTimeout(() => {
    const fullEvent = {
      type: event.type,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      data: event.data || {}
    };

    console.log(`📤 Broadcasting: ${event.name} (${event.type})`);
    broadcast(fullEvent);

    eventIndex = (eventIndex + 1) % eventSequence.length;

    // If sequence completed, start new session after a pause
    if (eventIndex === 0) {
      console.log('\n🔄 Event sequence completed. Starting new session in 8 seconds...\n');
      sessionId = `demo-session-${Date.now()}`;
      setTimeout(runEventSequence, 8000);
    } else {
      runEventSequence();
    }
  }, event.delay);
}

httpServer.listen(PORT, 'localhost', () => {
  console.log(`✅ Mock OpenClaw Gateway listening on http://localhost:${PORT}`);
  console.log(`✅ WebSocket endpoint: ws://localhost:${PORT}/events`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('\n🎬 Will start event sequence when client connects...\n');

  // Start event sequence after first client connects
  const checkInterval = setInterval(() => {
    if (clients.size > 0) {
      clearInterval(checkInterval);
      console.log('🎬 Starting event sequence...\n');
      runEventSequence();
    }
  }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Mock OpenClaw Gateway...');
  wss.close(() => {
    httpServer.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});
