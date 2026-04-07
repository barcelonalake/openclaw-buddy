// OpenClaw agent configuration
// Maps OpenClaw Gateway events to desktop pet states

module.exports = {
  id: "openclaw",
  name: "OpenClaw",
  processNames: {
    win: ["openclaw.exe"],
    mac: ["openclaw"],
    linux: ["openclaw"]
  },
  // node.exe running openclaw CLI
  nodeCommandPatterns: ["openclaw"],
  eventSource: "websocket", // OpenClaw uses WebSocket instead of hooks
  gatewayUrl: "ws://localhost:18789/events", // OpenClaw Gateway default port

  // Map OpenClaw Gateway events to pet states
  // Event names based on OpenClaw 2026.3.7+ Event Bus system
  eventMap: {
    "session.start": "idle",
    "session.end": "sleeping",
    "session.idle_timeout": "sleeping",
    "user.prompt_submit": "thinking",
    "tool.pre_use": "working",
    "tool.post_use": "working",
    "tool.post_use_failure": "error",
    "session.stop": "attention",
    "session.stop_failure": "error",
    "subagent.spawn": "juggling",
    "subagent.stop": "working",
    "notification": "notification",
    "compact.pre": "sweeping",
    "compact.post": "attention",
  },

  capabilities: {
    websocket: true, // Uses WebSocket instead of HTTP hooks
    permissionApproval: false, // OpenClaw handles permissions internally
    sessionEnd: true,
    subagent: true,
  },

  pidField: "openclaw_pid",
};
