#!/bin/bash
# Quick state trigger: ./trigger-state.sh <number>

SESSION_ID="quick-demo-$(date +%s)"

case $1 in
  1) TYPE="user.prompt_submit"; NAME="💭 Thinking" ;;
  2) TYPE="tool.pre_use"; NAME="🔨 Working" ;;
  3) TYPE="subagent.spawn"; NAME="🤹 Juggling" ;;
  4) TYPE="tool.post_use_failure"; NAME="❌ Error" ;;
  5) TYPE="session.idle"; NAME="🎉 Attention" ;;
  6) TYPE="worktree.create"; NAME="📦 Carrying" ;;
  7) TYPE="session.pre_compact"; NAME="🧹 Sweeping" ;;
  8) TYPE="session.end"; NAME="😴 Sleeping" ;;
  *) echo "Usage: $0 <1-8>"; exit 1 ;;
esac

node -e "
  const WebSocket = require('ws');
  const ws = new WebSocket('ws://localhost:18789/events');
  ws.on('open', () => {
    ws.send(JSON.stringify({
      type: '$TYPE',
      sessionId: '$SESSION_ID',
      timestamp: new Date().toISOString(),
      data: {}
    }));
    console.log('✅ Triggered: $NAME ($TYPE)');
    setTimeout(() => { ws.close(); process.exit(0); }, 200);
  });
  ws.on('error', (e) => { console.error('Error:', e.message); process.exit(1); });
"
