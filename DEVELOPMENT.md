# OpenClaw Buddy - 开发文档

**版本**: v0.1.0-alpha
**发布日期**: 2026-04-07
**开发者**: barcelonalake
**框架**: Electron 41.0.2 + Node.js

---

## 📋 项目概述

OpenClaw Buddy 是一个桌面宠物应用，通过监控 OpenClaw 工作状态和 Oura Ring 健康数据，实时反映你的工作状态和身体状况。

### 核心概念

```
龙虾行为 = OpenClaw 状态（你在做什么） × Oura 健康（你的身体状况）
```

### 双维度状态系统

- **OpenClaw 维度** (6 种状态): idle, thinking, working, juggling, error, sleeping
- **健康维度** (3 种状态): HEALTHY, WEAK, OVERLOAD
- **总组合**: 6 × 3 = **18 种视觉效果**

---

## 🏗️ 系统架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Buddy                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │ OpenClaw     │        │ Oura Ring    │                   │
│  │ Gateway      │        │ API v2       │                   │
│  └──────┬───────┘        └──────┬───────┘                   │
│         │                       │                            │
│         │ WebSocket             │ HTTPS                      │
│         │ Events                │ REST API                   │
│         ▼                       ▼                            │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │ OpenClaw     │        │ Oura         │                   │
│  │ Monitor      │        │ Client       │                   │
│  │ (WS Client)  │        │ (HTTP Client)│                   │
│  └──────┬───────┘        └──────┬───────┘                   │
│         │                       │                            │
│         └───────┬───────────────┘                            │
│                 ▼                                             │
│         ┌──────────────┐                                     │
│         │ State        │                                     │
│         │ Machine      │                                     │
│         └──────┬───────┘                                     │
│                │                                              │
│                ▼                                              │
│         ┌──────────────┐                                     │
│         │ Renderer     │                                     │
│         │ (SVG + CSS)  │                                     │
│         └──────────────┘                                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 核心模块

| 模块 | 文件 | 职责 |
|------|------|------|
| **OpenClaw 监控** | `agents/openclaw-monitor.js` | WebSocket 连接、事件接收、会话追踪 |
| **Oura 客户端** | `services/oura-client.js` | API 调用、健康状态判定、数据缓存 |
| **状态机** | `src/state.js` | 状态管理、优先级处理、健康维度 |
| **渲染器** | `src/renderer.js` | SVG 显示、CSS 滤镜、动画控制 |
| **主进程** | `src/main.js` | Electron 主进程、IPC 通信、窗口管理 |
| **菜单系统** | `src/menu.js` | 托盘菜单、右键菜单、设置入口 |
| **设置 UI** | `src/oura-settings.html` | Oura Token 配置、健康状态显示 |

---

## 🔧 已实现功能

### 1. OpenClaw 集成 ✅

**功能**:
- WebSocket 连接到 OpenClaw Gateway (`ws://localhost:18789/events`)
- 自动重连机制（5 秒延迟）
- 心跳检测（每 30 秒）
- 会话追踪和事件映射

**事件映射**:

| OpenClaw 事件 | 桌宠状态 | 说明 |
|--------------|---------|------|
| `session.start` | idle | 会话开始 |
| `user.prompt_submit` | thinking | 用户提问 |
| `tool.pre_use` | working | 使用工具 |
| `tool.post_use_failure` | error | 工具失败 |
| `subagent.spawn` | juggling | 启动子任务 |
| `session.idle` | attention | 任务完成 |
| `worktree.create` | carrying | 移动文件 |
| `session.pre_compact` | sweeping | 清理中 |
| `session.end` | sleeping | 会话结束 |

**测试工具**:
- `test-openclaw-gateway.js` - 模拟 OpenClaw Gateway
- `trigger-state.sh` - 快速触发单个状态
- `demo-states.js` - 自动演示所有状态
- `interactive-control.sh` - 交互式控制面板

### 2. Oura Ring 集成 ✅

**功能**:
- 连接 Oura API v2
- 获取睡眠数据 (`/v2/usercollection/daily_sleep`)
- 获取 Readiness 数据 (`/v2/usercollection/daily_readiness`)
- 智能数据查找（最近 7 天）
- 数据缓存（1 小时）
- 每小时自动刷新

**健康状态判定**:

| 健康状态 | 条件 | 视觉效果 |
|---------|------|---------|
| **HEALTHY** | 睡眠 ≥ 80 且 恢复 ≥ 75 | 正常色彩，100% 速度 |
| **WEAK** | 睡眠 60-79 或 恢复 50-74 | 饱和度 50%，速度 60% |
| **OVERLOAD** | 睡眠 < 60 或 恢复 < 50 | 红色调 + 光晕，速度 30% |

**已测试真实数据**:
```
睡眠分数: 64
恢复分数: 60
健康状态: WEAK ✅
```

### 3. 设置 UI ✅

**功能**:
- Oura Token 配置界面
- 连接测试功能
- 实时健康状态显示
- 分数展示（睡眠 + 恢复）
- 最后更新时间

**访问方式**:
- 右键龙虾 → "Oura 设置…"
- 系统托盘 → "Oura 设置…"

### 4. 视觉效果系统 ✅

**CSS 滤镜实现** (`src/styles.css`):

```css
/* HEALTHY - 正常 */
.health-healthy #clawd {
  filter: none;
  animation-duration: 1s;
}

/* WEAK - 虚弱 */
.health-weak #clawd {
  filter: saturate(0.5) brightness(0.9);
  animation-duration: 1.67s; /* 60% 速度 */
}

/* OVERLOAD - 过载 */
.health-overload #clawd {
  filter: saturate(0.7) brightness(0.8) hue-rotate(-30deg)
          contrast(1.2) drop-shadow(0 0 8px rgba(255, 50, 50, 0.6));
  animation-duration: 3.33s; /* 30% 速度 */
}
```

---

## 📁 项目结构

```
openclaw-buddy/
├── agents/                      # Agent 配置
│   ├── openclaw.js             # OpenClaw 事件映射
│   └── openclaw-monitor.js     # WebSocket 监控器
├── services/                    # 服务模块
│   └── oura-client.js          # Oura API 客户端
├── src/                         # 主应用代码
│   ├── main.js                 # Electron 主进程
│   ├── state.js                # 状态机
│   ├── renderer.js             # 渲染逻辑
│   ├── menu.js                 # 菜单系统
│   ├── oura-settings.html      # Oura 设置界面
│   ├── preload.js              # IPC 预加载
│   ├── styles.css              # 全局样式
│   └── ...                     # 其他模块
├── assets/                      # 资源文件
│   ├── svg/                    # SVG 动画
│   └── sounds/                 # 音效文件
├── test-openclaw-gateway.js    # 模拟 OpenClaw Gateway
├── demo-states.js              # 状态演示脚本
├── trigger-state.sh            # 快速触发脚本
├── interactive-control.sh      # 交互式控制
├── package.json                # 依赖配置
└── README-OPENCLAW-BUDDY.md    # 项目说明
```

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置 Oura Token

方法 1：通过 UI 配置（推荐）
```bash
npm start
# 右键龙虾 → "Oura 设置…" → 输入 Token → 保存
```

方法 2：手动配置
```bash
mkdir -p ~/.openclaw-buddy
echo '{"ouraToken":"YOUR_TOKEN_HERE"}' > ~/.openclaw-buddy/config.json
```

获取 Token: https://cloud.ouraring.com/personal-access-tokens

### 启动应用

```bash
npm start
```

---

## 🧪 测试指南

### 1. 测试 Oura 集成

```bash
# 测试连接
node -e "
const OuraClient = require('./services/oura-client.js');
const client = new OuraClient();
client.testConnection().then(r => console.log(r));
"

# 获取健康数据
node -e "
const OuraClient = require('./services/oura-client.js');
const client = new OuraClient();
client.fetchUserHealthData().then(d => console.log(d));
"
```

### 2. 测试 OpenClaw 集成

**启动模拟 Gateway**:
```bash
node test-openclaw-gateway.js
```

**快速触发状态**:
```bash
./trigger-state.sh 1  # 思考
./trigger-state.sh 2  # 工作
./trigger-state.sh 3  # 多任务
./trigger-state.sh 4  # 错误
./trigger-state.sh 5  # 完成
```

**自动演示所有状态**:
```bash
node demo-states.js
```

**交互式控制**:
```bash
./interactive-control.sh
```

### 3. 测试健康状态切换

手动修改健康状态进行测试：

```javascript
// 在浏览器开发工具中（F12）执行
window.electronAPI.onHealthChange('HEALTHY');   // 正常
window.electronAPI.onHealthChange('WEAK');      // 虚弱
window.electronAPI.onHealthChange('OVERLOAD');  // 过载
```

---

## 🔌 API 参考

### Oura Client API

```javascript
const OuraClient = require('./services/oura-client.js');
const client = new OuraClient();

// 设置 Token
client.setToken('YOUR_TOKEN');

// 测试连接
const result = await client.testConnection();
// => { success: true, message: 'Connection successful' }

// 获取健康数据
const health = await client.fetchUserHealthData();
// => {
//   sleepScore: 64,
//   readinessScore: 60,
//   healthState: 'WEAK',
//   timestamp: '2026-04-07T...'
// }

// 判定健康状态
const state = client.determineHealthState(sleepScore, readinessScore);
// => 'HEALTHY' | 'WEAK' | 'OVERLOAD'
```

### IPC 事件

**主进程 → 渲染器**:
```javascript
// 状态变化
mainWindow.webContents.send('state-change', state, svg, healthState);

// 健康状态变化
mainWindow.webContents.send('health-change', healthState);
```

**渲染器 → 主进程**:
```javascript
// 获取 Oura Token
const token = await ipcRenderer.invoke('oura-get-token');

// 保存 Token
await ipcRenderer.invoke('oura-save-token', token);

// 测试连接
const result = await ipcRenderer.invoke('oura-test-connection', token);

// 获取健康数据
const health = await ipcRenderer.invoke('oura-get-health');
```

---

## 📊 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| **框架** | Electron | 41.0.2 |
| **运行时** | Node.js | 18+ |
| **WebSocket** | ws | 8.20.0 |
| **HTTP 客户端** | axios | 1.7.2 |
| **构建工具** | electron-builder | 26.8.1 |
| **前端** | HTML + CSS + JS | - |
| **动画** | SVG + CSS Filters | - |

---

## 🐛 已知问题

### 1. OpenClaw Gateway 连接

**问题**: 如果 OpenClaw 未启动，会不断重连。

**解决方案**:
- 应用会每 5 秒自动重试
- 不影响其他功能（Oura 仍正常工作）
- 启动 OpenClaw 后会自动连接

### 2. Oura 数据延迟

**问题**: Oura Ring 数据可能有延迟（通常早上同步）。

**解决方案**:
- 智能搜索最近 7 天的数据
- 缓存机制（1 小时）
- 如无数据，使用默认值

### 3. 动画资源

**当前状态**: 使用 clawd-on-desk 的原始动画。

**计划**:
- 设计 18 种龙虾动画（6 状态 × 3 健康）
- 支持主题切换

---

## 🔮 未来计划

### v0.2.0 (计划中)

- [ ] 18 种龙虾动画设计
- [ ] 托盘图标显示健康状态
- [ ] 手动刷新健康数据按钮
- [ ] 健康历史趋势图表
- [ ] 通知提醒（健康状态变化）

### v0.3.0 (计划中)

- [ ] 多主题支持
- [ ] 自定义动画
- [ ] 更多健康指标（HRV、体温等）
- [ ] 导出健康报告

### v1.0.0 (未来)

- [ ] 完整 OpenClaw 支持
- [ ] 生产环境测试
- [ ] 性能优化
- [ ] Windows/Linux 打包测试

---

## 🤝 贡献指南

### 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 2 空格缩进
- 函数注释使用 JSDoc 格式
- 提交信息遵循 Conventional Commits

---

## 📝 更新日志

### v0.1.0-alpha (2026-04-07)

**新功能**:
- ✅ OpenClaw WebSocket 集成
- ✅ Oura Ring API v2 集成
- ✅ 双维度状态系统
- ✅ 健康状态视觉效果
- ✅ Oura 设置 UI
- ✅ 测试工具套件

**测试验证**:
- ✅ 真实 Oura 数据（睡眠 64，恢复 60）
- ✅ 所有 8 种 OpenClaw 状态
- ✅ WEAK 健康效果应用

**已知问题**:
- ⚠️ 仅支持英文/中文
- ⚠️ 使用原始 clawd 动画
- ⚠️ 无健康历史记录

---

## 📞 支持

- **GitHub**: https://github.com/barcelonalake/openclaw-buddy
- **Issues**: https://github.com/barcelonalake/openclaw-buddy/issues
- **原始项目**: https://github.com/rullerzhou-afk/clawd-on-desk

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 🙏 致谢

- **clawd-on-desk** by rullerzhou-afk - 原始桌面宠物实现
- **OpenClaw** - AI 编程助手
- **Oura Ring** - 健康数据来源
- **Electron** - 跨平台桌面框架

---

**最后更新**: 2026-04-07
**维护者**: barcelonalake
**状态**: 🚧 开发中 (Alpha)
