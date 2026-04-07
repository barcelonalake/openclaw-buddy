# OpenClaw Buddy 动画设计指南

**版本**: v0.1.0
**目标**: 设计 6 个基础龙虾动画（CSS 自动生成 18 种效果）

---

## 🎯 设计目标

### 基础动画（必需）

| 状态 | 动画名称 | 描述 | 关键特征 |
|------|---------|------|---------|
| **idle** | 待机 | 龙虾安静待机 | 轻微呼吸、偶尔眨眼、触须摆动 |
| **thinking** | 思考 | 龙虾在思考 | 眼睛转动、触须竖起、钳子托腮 |
| **working** | 工作 | 龙虾在工作 | 钳子快速敲击、专注的眼神 |
| **juggling** | 多任务 | 龙虾同时处理多个任务 | 多个钳子挥舞、快速切换 |
| **error** | 错误 | 出错了 | X 眼睛、冒烟、钳子下垂 |
| **sleeping** | 睡眠 | 龙虾睡着了 | Zzz、闭眼、身体放松 |

**CSS 滤镜会自动生成 3 种健康变体**：
- HEALTHY: 鲜艳、快速
- WEAK: 暗淡、缓慢（当前状态）
- OVERLOAD: 红色、极慢、发光

---

## 🛠️ 设计方案

### 方案 1：AI 生成 + 手工调整 ⭐（推荐）

#### 工具推荐

**AI 图像生成**:
1. **DALL-E 3** (ChatGPT Plus)
   - 提示词：`cute pixel art lobster character, transparent background, simple design, 32x32 pixels, gaming sprite`

2. **Midjourney**
   - 提示词：`cute lobster mascot, pixel art style, transparent background, simple animation frames --ar 1:1 --niji`

3. **Leonardo.ai** (免费)
   - 提示词：`adorable lobster character sprite, pixel art, transparent background, chibi style`

4. **Stable Diffusion** (本地免费)
   - 模型：Pixel Art Diffusion
   - 提示词：`cute lobster sprite, transparent background, 32x32, retro game style`

**矢量化工具**:
- **Vectorizer.ai** - 自动将 PNG 转为 SVG
- **Inkscape** - 免费矢量编辑器
- **Adobe Illustrator** - 专业工具

#### 工作流程

```bash
# 1. 生成基础龙虾图像
AI 生成 → PNG 格式

# 2. 矢量化
PNG → vectorizer.ai → SVG

# 3. 添加动画
SVG → Inkscape/Illustrator → 添加 CSS 动画

# 4. 测试
复制到 assets/svg/ → 启动应用测试
```

---

### 方案 2：使用现有像素艺术资源

#### 免费资源站点

1. **OpenGameArt.org**
   - 搜索：`lobster`, `crab`, `sea creature`
   - 许可证：CC0 或 CC-BY

2. **itch.io**
   - 搜索：`pixel art animal sprites`
   - 很多免费资源包

3. **Kenney.nl**
   - 免费像素艺术资源包
   - 可商用

4. **当前 clawd 动画**
   - 已有螃蟹动画在 `assets/svg/`
   - 可以修改颜色变成龙虾

#### 修改现有动画

```bash
# 1. 复制现有动画
cp assets/svg/clawd-idle-follow.svg assets/svg/lobster-idle.svg

# 2. 用 Inkscape 打开
# 修改颜色：螃蟹 → 龙虾红
# - 主体：#FF6B6B (龙虾红)
# - 钳子：#FF4444 (深红)
# - 眼睛：保持黑色
# - 触须：#FF8888 (浅红)

# 3. 调整细节
# - 加长触须
# - 调整身体比例
# - 添加龙虾特征
```

---

### 方案 3：使用 Emoji/Unicode 字符 ⚡（最简单）

如果时间紧迫，可以用 emoji 作为占位符：

```javascript
// 在代码中使用 emoji
const lobsterEmojis = {
  idle: '🦞',
  thinking: '🤔🦞',
  working: '⚒️🦞',
  juggling: '🤹🦞',
  error: '💥🦞',
  sleeping: '💤🦞',
};
```

优点：
- ✅ 零成本
- ✅ 立即可用
- ✅ 跨平台一致

缺点：
- ❌ 不够精致
- ❌ 无法自定义动画

---

## 📐 技术规格

### SVG 要求

```xml
<!-- 基础结构 -->
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 100 100"
     width="100" height="100">

  <!-- 可动画的元素需要 ID -->
  <g id="eyes-js">
    <!-- 眼睛，会被 JS 控制移动 -->
  </g>

  <g id="body-js">
    <!-- 身体，轻微跟随眼睛 -->
  </g>

  <ellipse id="shadow-js" opacity="0.3">
    <!-- 阴影，根据视角变形 -->
  </ellipse>

  <!-- CSS 动画 -->
  <style>
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    #body-js {
      animation: breathe 3s ease-in-out infinite;
    }
  </style>
</svg>
```

### 尺寸建议

- **画布**: 100×100 到 200×200
- **实际显示**: 200×200 (S), 280×280 (M), 360×360 (L)
- **导出**: SVG 矢量格式（自动适配任何尺寸）

### 颜色方案

**HEALTHY 配色**（基础色）:
```css
--lobster-primary: #FF6B6B;   /* 龙虾红 */
--lobster-claw: #FF4444;      /* 钳子深红 */
--lobster-eye: #000000;       /* 眼睛黑色 */
--lobster-highlight: #FFAAAA; /* 高光浅红 */
```

CSS 会自动处理：
- WEAK: 降低饱和度
- OVERLOAD: 偏移色相到更红，添加光晕

---

## 🎬 动画设计细节

### 1. idle - 待机动画

**特征**:
- 轻微呼吸（身体缩放 1.0 → 1.05）
- 偶尔眨眼（每 3-5 秒）
- 触须轻轻摆动
- 眼球追踪鼠标（已实现）

**CSS 动画**:
```css
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes antenna-sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

#body { animation: breathe 4s ease-in-out infinite; }
#antenna { animation: antenna-sway 2s ease-in-out infinite; }
```

---

### 2. thinking - 思考动画

**特征**:
- 眼睛上下转动
- 触须竖起（alert 状态）
- 钳子托腮姿势
- 可选：头顶问号

**关键帧**:
```css
@keyframes think {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-5px); }
  75% { transform: translateY(-3px); }
}

#eyes { animation: think 2s ease-in-out infinite; }
```

---

### 3. working - 工作动画

**特征**:
- 钳子快速上下移动（敲击键盘）
- 专注的眼神（不跟随鼠标）
- 身体微微前倾

**关键帧**:
```css
@keyframes claw-type {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

#left-claw { animation: claw-type 0.3s ease-in-out infinite; }
#right-claw { animation: claw-type 0.3s ease-in-out infinite 0.15s; }
```

---

### 4. juggling - 多任务动画

**特征**:
- 多个钳子同时挥舞
- 旋转效果
- 快速切换动作
- 可选：显示多个小球

**关键帧**:
```css
@keyframes juggle {
  0% { transform: rotate(-20deg) translateY(0); }
  25% { transform: rotate(0deg) translateY(-15px); }
  50% { transform: rotate(20deg) translateY(0); }
  75% { transform: rotate(0deg) translateY(-15px); }
  100% { transform: rotate(-20deg) translateY(0); }
}

#claws { animation: juggle 0.8s ease-in-out infinite; }
```

---

### 5. error - 错误动画

**特征**:
- X 眼睛（晕眩）
- 冒烟效果（可选）
- 钳子无力下垂
- 身体倾斜

**关键帧**:
```css
@keyframes error-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-5px) rotate(-2deg); }
  75% { transform: translateX(5px) rotate(2deg); }
}

@keyframes smoke {
  0% { opacity: 0.8; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(1.5); }
}

#body { animation: error-shake 0.5s ease-in-out 3; }
```

---

### 6. sleeping - 睡眠动画

**特征**:
- 闭眼
- Zzz 漂浮
- 均匀呼吸（慢）
- 身体完全放松

**关键帧**:
```css
@keyframes sleep-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes zzz-float {
  0% { opacity: 0; transform: translate(0, 0) scale(1); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(10px, -30px) scale(1.5); }
}

#body { animation: sleep-breathe 5s ease-in-out infinite; }
.zzz { animation: zzz-float 3s ease-in-out infinite; }
```

---

## 🎨 详细提示词（AI 生成）

### DALL-E 3 / ChatGPT Plus

**提示词模板**:
```
Create a cute pixel art lobster character sprite for a desktop pet application.

Style:
- Pixel art, 64x64 pixels
- Transparent background
- Retro gaming aesthetic
- Simple, clean design
- Friendly and adorable

Character details:
- Bright red lobster (hex #FF6B6B)
- Large expressive eyes
- Two prominent claws/pincers
- Long antennae
- Chibi/kawaii proportions (big head, small body)

Pose: [选择一个]
1. "Standing idle, breathing gently"
2. "Thinking pose, one claw on chin"
3. "Working at keyboard, claws typing"
4. "Juggling multiple objects with claws"
5. "Error state, dizzy with X eyes"
6. "Sleeping peacefully with Zzz above head"

Output: PNG with transparent background, suitable for conversion to SVG
```

### Midjourney

**提示词**:
```
cute chibi lobster mascot, pixel art style, transparent background,
bright red color (#FF6B6B), large expressive eyes, two claws,
long antennae, kawaii design, desktop pet sprite,
[idle/thinking/working/juggling/error/sleeping] pose,
simple animation frame, retro game aesthetic --ar 1:1 --niji 6
```

**参数说明**:
- `--ar 1:1`: 正方形画布
- `--niji 6`: 卡通/动漫风格
- `--style cute`: 可爱风格
- `--chaos 0`: 保持一致性

### Leonardo.ai

**提示词**:
```
adorable red lobster character sprite, pixel art, chibi style,
transparent background, desktop pet, gaming mascot,
bright red (#FF6B6B), big eyes, two pincers, antennae,
[pose: idle/thinking/working/juggling/error/sleeping],
32x32 or 64x64 pixels, retro game art style
```

**模型选择**:
- Leonardo Diffusion XL
- Pixel Art Diffusion
- Anime Pastel Dream

---

## 📝 快速开始步骤

### 第一步：选择方案

**时间充裕**？→ 方案 1（AI 生成）
**想要专业**？→ 方案 1 + 手工调整
**时间紧迫**？→ 方案 2（修改现有）
**只是测试**？→ 方案 3（Emoji）

### 第二步：生成 1 个测试动画

```bash
# 1. 生成/获取龙虾图片
[使用 AI 或下载素材]

# 2. 转换为 SVG
# 上传到 https://vectorizer.ai
# 下载 SVG 文件

# 3. 复制到项目
cp ~/Downloads/lobster.svg assets/svg/lobster-idle.svg

# 4. 测试
npm start
# 右键 → 查看效果
```

### 第三步：批量生成

```bash
# 为每个状态重复：
- lobster-idle.svg
- lobster-thinking.svg
- lobster-working.svg
- lobster-juggling.svg
- lobster-error.svg
- lobster-sleeping.svg
```

### 第四步：配置应用

编辑 `themes/clawd/theme.json`:
```json
{
  "states": {
    "idle": ["lobster-idle.svg"],
    "thinking": ["lobster-thinking.svg"],
    "working": ["lobster-working.svg"],
    "juggling": ["lobster-juggling.svg"],
    "error": ["lobster-error.svg"],
    "sleeping": ["lobster-sleeping.svg"]
  }
}
```

---

## 🎓 学习资源

### SVG 动画教程
- [MDN SVG Animation](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)
- [CSS-Tricks SVG Guide](https://css-tricks.com/lodge/svg/)
- [SVG.js Documentation](https://svgjs.dev/)

### 像素艺术教程
- [Pixel Art Tutorial](https://blog.studiominiboss.com/pixelart)
- [Lospec Tutorials](https://lospec.com/pixel-art-tutorials)

### 工具文档
- [Inkscape Manual](https://inkscape.org/doc/)
- [Vectorizer.ai Docs](https://vectorizer.ai/docs)

---

## 💡 设计建议

### 保持简单
- ✅ 清晰的轮廓
- ✅ 有限的颜色（3-5 种）
- ✅ 简单的动画（2-3 个关键帧）
- ❌ 避免过度复杂

### 保持一致
- ✅ 所有动画使用相同的龙虾比例
- ✅ 统一的颜色方案
- ✅ 相似的线条粗细

### 可读性
- ✅ 在小尺寸下清晰可见（200×200）
- ✅ 高对比度
- ✅ 明显的动作

---

## 🚀 进阶：动态生成

如果你想要更灵活的方案，可以用代码生成 SVG：

```javascript
// 示例：动态生成龙虾 SVG
function generateLobsterSVG(state, health) {
  const colors = {
    HEALTHY: '#FF6B6B',
    WEAK: '#CC5555',
    OVERLOAD: '#FF0000'
  };

  const animations = {
    idle: 'breathe 4s infinite',
    working: 'type 0.3s infinite',
    // ...
  };

  return `
    <svg viewBox="0 0 100 100">
      <style>
        #body { animation: ${animations[state]}; }
      </style>
      <ellipse id="body" cx="50" cy="60" rx="30" ry="25"
               fill="${colors[health]}" />
      <!-- 更多元素... -->
    </svg>
  `;
}
```

---

## 📞 需要帮助？

如果你在设计过程中遇到问题：

1. **看不懂 SVG**？→ 使用 Inkscape 可视化编辑
2. **不会动画**？→ 先用静态图，后续添加
3. **没有设计技能**？→ 使用 AI 生成 + 直接使用
4. **时间不够**？→ 先用 emoji，后续替换

---

**记住：完成比完美更重要！先用简单的方案跑起来，再逐步改进。** ✨

**现在去睡觉吧！明天精神好了再设计动画！** 💤🦞
