#!/bin/bash
# Interactive OpenClaw Buddy Control Panel

SESSION_ID="interactive-$(date +%s)"

send_event() {
  local event_type=$1
  local event_name=$2

  # Create WebSocket message (we'll use a simple Node script)
  node -e "
    const WebSocket = require('ws');
    const ws = new WebSocket('ws://localhost:18789/events');
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: '$event_type',
        sessionId: '$SESSION_ID',
        timestamp: new Date().toISOString(),
        data: {}
      }));
      console.log('✅ Sent: $event_name');
      setTimeout(() => ws.close(), 100);
    });
  "
}

show_menu() {
  clear
  echo "╔═══════════════════════════════════════════════╗"
  echo "║  🦞 OpenClaw Buddy - Interactive Control     ║"
  echo "║  Current Health: WEAK (slow + desaturated)   ║"
  echo "╠═══════════════════════════════════════════════╣"
  echo "║                                                ║"
  echo "║  Choose a state to trigger:                   ║"
  echo "║                                                ║"
  echo "║  1. 💭 Thinking          (user asks question) ║"
  echo "║  2. 🔨 Working           (using tools)        ║"
  echo "║  3. 🤹 Juggling          (multi-tasking)      ║"
  echo "║  4. ❌ Error             (something failed)   ║"
  echo "║  5. 🎉 Attention         (task complete!)     ║"
  echo "║  6. 📦 Carrying          (moving files)       ║"
  echo "║  7. 🧹 Sweeping          (cleaning up)        ║"
  echo "║  8. 😴 Sleeping          (session end)        ║"
  echo "║                                                ║"
  echo "║  9. 🎬 Run full demo                          ║"
  echo "║  q. Quit                                       ║"
  echo "║                                                ║"
  echo "╚═══════════════════════════════════════════════╝"
  echo ""
  echo -n "Your choice: "
}

while true; do
  show_menu
  read -n 1 choice
  echo ""
  echo ""

  case $choice in
    1)
      send_event "user.prompt_submit" "Thinking"
      ;;
    2)
      send_event "tool.pre_use" "Working"
      ;;
    3)
      send_event "subagent.spawn" "Juggling"
      ;;
    4)
      send_event "tool.post_use_failure" "Error"
      ;;
    5)
      send_event "session.idle" "Attention"
      ;;
    6)
      send_event "worktree.create" "Carrying"
      ;;
    7)
      send_event "session.pre_compact" "Sweeping"
      ;;
    8)
      send_event "session.end" "Sleeping"
      ;;
    9)
      echo "🎬 Running full demo..."
      node demo-states.js
      ;;
    q|Q)
      echo "👋 Goodbye!"
      exit 0
      ;;
    *)
      echo "❌ Invalid choice. Try again."
      ;;
  esac

  echo ""
  echo "Press Enter to continue..."
  read
done
