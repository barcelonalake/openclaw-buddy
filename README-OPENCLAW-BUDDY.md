# 🦞 OpenClaw Buddy

A desktop pet for OpenClaw + Oura health monitoring. Your lobster buddy shows your work and health status in real-time.

## Project Status: 🚧 Work in Progress

This is a fork of [clawd-on-desk](https://github.com/rullerzhou-afk/clawd-on-desk) being adapted for OpenClaw and Oura Ring integration.

## Concept

```
Lobster Behavior = OpenClaw Status (what you're doing) × Oura Health (how you feel)
```

### Dual-Dimension State System

- **OpenClaw States** (6): idle, thinking, working, subagent, error, sleeping
- **Oura Health States** (3): HEALTHY, WEAK, OVERLOAD
- **Total Animations** 6 × 3 = **18 combinations**

### Examples

| OpenClaw | Health | Lobster Behavior |
|----------|--------|------------------|
| working  | HEALTHY | ⚡ Blazing fast claw movements |
| working  | WEAK | 😪 Slow claw movements, yawning |
| working  | OVERLOAD | 💨🩸 Slow claws + smoking + bleeding |
| thinking | HEALTHY | 👀 Quick eye movements |
| thinking | OVERLOAD | 💀 Dizzy, unfocused eyes |

## Architecture

### Key Components

- **`agents/openclaw.js`** - OpenClaw Gateway event mapping
- **`services/oura-client.js`** - Oura Ring API v2 client
- **`src/state.js`** - State machine (inherited from clawd-on-desk)
- **`src/server.js`** - HTTP server for event receiving

### Data Flow

```
OpenClaw Gateway (ws://localhost:18789/events)
  ↓ WebSocket events
agents/openclaw.js (event mapping)
  ↓ HTTP POST to localhost:23333
src/server.js
  ↓ State update
src/state.js (+ Oura health multiplier)
  ↓ IPC
src/renderer.js (SVG + CSS filters)
```

## Completed ✅

- [x] Fork clawd-on-desk
- [x] Rename project to openclaw-buddy
- [x] Create OpenClaw agent configuration
- [x] Implement Oura API client (JavaScript port from Swift)
- [x] Install dependencies

## TODO 📝

- [ ] Implement OpenClaw WebSocket monitor
- [ ] Integrate Oura health state into state machine
- [ ] Implement dual-dimension state mapping
- [ ] Design/acquire lobster animations (18 variants)
- [ ] Update UI for Oura token configuration
- [ ] Test with real OpenClaw instance
- [ ] Test with real Oura API
- [ ] Package and release

## Quick Start

### Prerequisites

- Node.js 18+
- OpenClaw running locally (Gateway on port 18789)
- Oura Ring + API Token (get from [cloud.ouraring.com](https://cloud.ouraring.com/personal-access-tokens))

### Installation

```bash
# Clone this repo
git clone https://github.com/barcelonalake/openclaw-buddy.git
cd openclaw-buddy

# Install dependencies
npm install

# Set your Oura token (will create ~/.openclaw-buddy/config.json)
# Or configure via UI after launch

# Start the app
npm start
```

## OpenClaw Integration

OpenClaw Buddy monitors your OpenClaw Gateway on `ws://localhost:18789/events`.

### Remote OpenClaw (SSH Tunnel)

If your OpenClaw is on a remote server:

```bash
# On your local machine
ssh -R 18789:localhost:18789 user@your-server.com

# Now openclaw-buddy can monitor remote OpenClaw events
```

## Oura API Setup

1. Visit [cloud.ouraring.com/personal-access-tokens](https://cloud.ouraring.com/personal-access-tokens)
2. Create a Personal Access Token
3. Configure in openclaw-buddy settings UI

The app will:
- Fetch yesterday's sleep data
- Fetch today's readiness data
- Update health state every hour
- Apply health multiplier to all animations

## Health States

| State | Criteria | Effects |
|-------|----------|---------|
| **HEALTHY** | Sleep ≥ 80, Readiness ≥ 75 | Normal colors, 100% animation speed |
| **WEAK** | Sleep 60-79 OR Readiness 50-74 | Desaturated, 60% speed |
| **OVERLOAD** | Sleep < 60 OR Readiness < 50 | Red glow, 30% speed, smoke effects |

## Technical Details

### Inherited from clawd-on-desk

- ✅ Transparent draggable window system
- ✅ Dual-window architecture (render + input)
- ✅ System tray integration
- ✅ Auto-updater
- ✅ Cross-platform support (macOS, Windows, Linux)

### New Features

- 🆕 OpenClaw WebSocket integration
- 🆕 Oura API v2 client
- 🆕 Dual-dimension state system
- 🆕 Dynamic CSS filters based on health
- 🆕 Health-based animation speed control

## Development

```bash
# Run in dev mode
npm start

# Run tests
npm test

# Build for your platform
npm run build:mac    # macOS DMG
npm run build        # Windows NSIS
npm run build:linux  # Linux AppImage + deb
```

## Credits

- Forked from [clawd-on-desk](https://github.com/rullerzhou-afk/clawd-on-desk) by rullerzhou-afk
- Built for [OpenClaw](https://github.com/openclaw/openclaw)
- Powered by [Oura Ring](https://ouraring.com/)

## License

MIT

---

**Status**: 🚧 Active Development

Current focus: Implementing OpenClaw WebSocket monitor and dual-dimension state system.
