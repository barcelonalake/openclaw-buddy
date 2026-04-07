// OpenClaw Gateway WebSocket monitor
// Connects to OpenClaw Gateway ws://localhost:18789/events
// Maps events to desktop pet states

const WebSocket = require("ws");
const http = require("http");

const DEFAULT_GATEWAY_URL = "ws://localhost:18789/events";
const RECONNECT_DELAY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 30000;

class OpenClawMonitor {
  /**
   * @param {object} agentConfig - openclaw.js config
   * @param {function} onStateChange - (sessionId, state, event, extra) => void
   */
  constructor(agentConfig, onStateChange) {
    this._config = agentConfig;
    this._onStateChange = onStateChange;
    this._ws = null;
    this._reconnectTimer = null;
    this._heartbeatTimer = null;
    this._isRunning = false;
    this._gatewayUrl = agentConfig.gatewayUrl || DEFAULT_GATEWAY_URL;
    this._activeSessions = new Map(); // sessionId -> { state, timestamp }
  }

  /**
   * Check if OpenClaw Gateway is reachable
   */
  async checkGatewayAvailable() {
    return new Promise((resolve) => {
      // Parse WebSocket URL to HTTP URL for health check
      const url = this._gatewayUrl.replace("ws://", "http://").replace("/events", "/health");

      const timeout = setTimeout(() => {
        resolve(false);
      }, 2000);

      http.get(url, (res) => {
        clearTimeout(timeout);
        resolve(res.statusCode === 200);
      }).on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * Start monitoring OpenClaw Gateway
   */
  async start() {
    if (this._isRunning) return;
    this._isRunning = true;

    console.log("[OpenClaw Monitor] Starting...");

    // Check if Gateway is available
    const available = await this.checkGatewayAvailable();
    if (!available) {
      console.log("[OpenClaw Monitor] Gateway not available at", this._gatewayUrl);
      console.log("[OpenClaw Monitor] Will retry in", RECONNECT_DELAY_MS / 1000, "seconds");
      this._scheduleReconnect();
      return;
    }

    this._connect();
  }

  /**
   * Stop monitoring
   */
  stop() {
    this._isRunning = false;

    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }

    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }

    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }

    console.log("[OpenClaw Monitor] Stopped");
  }

  /**
   * Connect to OpenClaw Gateway WebSocket
   */
  _connect() {
    console.log("[OpenClaw Monitor] Connecting to", this._gatewayUrl);

    this._ws = new WebSocket(this._gatewayUrl);

    this._ws.on("open", () => {
      console.log("[OpenClaw Monitor] Connected to OpenClaw Gateway");
      this._startHeartbeat();
    });

    this._ws.on("message", (data) => {
      try {
        const event = JSON.parse(data.toString());
        this._handleEvent(event);
      } catch (error) {
        console.error("[OpenClaw Monitor] Failed to parse event:", error.message);
      }
    });

    this._ws.on("error", (error) => {
      console.error("[OpenClaw Monitor] WebSocket error:", error.message);
    });

    this._ws.on("close", () => {
      console.log("[OpenClaw Monitor] Connection closed");
      this._stopHeartbeat();

      if (this._isRunning) {
        this._scheduleReconnect();
      }
    });
  }

  /**
   * Handle incoming OpenClaw event
   */
  _handleEvent(event) {
    // OpenClaw events typically have: { type, sessionId, data, timestamp }
    const eventType = event.type || event.event || event.name;
    const sessionId = event.sessionId || event.session_id || "default";
    const eventData = event.data || {};

    console.log("[OpenClaw Monitor] Event:", eventType, "Session:", sessionId);

    // Map OpenClaw event to pet state using agent config
    const state = this._config.eventMap[eventType];

    if (!state) {
      // Unknown event, log it but don't update state
      console.log("[OpenClaw Monitor] Unmapped event:", eventType);
      return;
    }

    // Track active session
    this._activeSessions.set(sessionId, {
      state,
      timestamp: Date.now(),
      eventType
    });

    // Build extra data
    const extra = {
      agent_id: "openclaw",
      event: eventType,
      cwd: eventData.cwd || eventData.directory || process.cwd(),
      source_pid: eventData.pid || null,
      ...eventData
    };

    // Notify state change
    this._onStateChange(sessionId, state, eventType, extra);

    // Handle session end - clean up
    if (eventType === "session.end" || eventType === "session.idle_timeout") {
      // Remove session after a delay to allow final animation
      setTimeout(() => {
        this._activeSessions.delete(sessionId);
      }, 5000);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  _scheduleReconnect() {
    if (this._reconnectTimer) return;

    this._reconnectTimer = setTimeout(async () => {
      this._reconnectTimer = null;

      if (!this._isRunning) return;

      console.log("[OpenClaw Monitor] Attempting to reconnect...");

      const available = await this.checkGatewayAvailable();
      if (available) {
        this._connect();
      } else {
        this._scheduleReconnect();
      }
    }, RECONNECT_DELAY_MS);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  _startHeartbeat() {
    this._heartbeatTimer = setInterval(() => {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        // Send ping frame
        this._ws.ping();
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Stop heartbeat
   */
  _stopHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this._activeSessions.keys());
  }

  /**
   * Get session state
   */
  getSessionState(sessionId) {
    return this._activeSessions.get(sessionId);
  }
}

module.exports = OpenClawMonitor;
