# Mira Agent Prompt 结构与 Prefix Cache 缓存优化方案

本文档基于现网代码链路（`server.ts`、`src/agent/systemPrompt.txt`、`src/agent/systemPromptExecution.txt`、`src/agent/stateNodePrompt.txt`、`src/agent/traceExport.ts`）及 13 轮「提取娜塔莉亚角色」完整 Trace 的实证分析，系统化制定了以**最大化命中模型 Prefix Cache（前缀缓存）**为目标的工程优化方案与验收标准。

---

## 一、 现状瓶颈与根因诊断

在大模型（如 DeepSeek / OpenAI 兼容端点）的 Prefix Cache 机制中（DeepSeek 按 64 tokens 为最小缓存块严格前缀逐字匹配），提示词能否命中缓存取决于两件事：**静态内容前置**、**前缀字节级完全一致**。现网存在四大瓶颈：

### 1. 主循环 `splitPromptForPrefixCache` 正则失效（`server.ts`）
- 原正则 `^(?=# (?:背景|用户指令|...|页面观察)\b)/m` 在中文标题与换行符 `\n` 之间使用了 `\b`（词边界）。
- JS 正则中中文字符与 `\n` 均属于 `\W`，`\b` 永远不会匹配，导致 `rawPrompt.split(...)` 恒返回长度为 1 的数组并走入兜底分支 `{ systemPrompt: '', userPrompt: rawPrompt }`。
- 结果：主循环请求始终退化为单条 `role: 'user'` 消息，未发生 `system / user` 动静分离。

### 2. 主模板将动态 `# 用户指令` 放在第 2 段落
- 原模板顺序：`# 背景`（约 70 字 / ~35–40 tokens，不足 64-token 最小缓存块）→ `# 用户指令（{{cardContext}} + {{userMessage}}）` → `# 工作指南` → `# 输出格式` → `# 可用工具` → `# 认知状态`。
- 只要任务目标不同或中途更新资产导致 `cardContext` 变化（例如建卡后角色数变化），第 35~40 token 处即断流，后续数千 token 的规则与工具定义全部无法跨任务或跨资产变动轮次复用。

### 3. 每轮必调的 `update-state-node` 完全逆序（`stateNodePrompt.txt`）
- 原实现中 `messages[0] (system)` 仅有一句话（约 20 tokens < 64 tokens，无法成块），而约 1,300+ 字符的固定职责定义与 `【输出格式（严格输出合法 JSON）】` Schema 被放置在 `messages[1] (user)` 最末尾、紧跟每轮必变的旧认知状态和 `lastTurnOutput` 之后。
- 每轮耗时调用的状态节点几乎 **0 缓存命中**。

### 4. 缓存命中率缺乏真实可观测性
- `parseChatCompletionResponse` 未采集接口返回的 `usage`（流式模式下也未按需请求 `include_usage`），`traceExport.ts` 导出 Prompt 时也将多条 messages 合并展示而未区分 `[SYSTEM]` / `[USER]`，难以在复盘 Trace 时量化真实缓存命中率。

---

## 二、 分级优化方案（P0 → P1 → P2）

### P0：立即生效的核心修复（零行为风险）

1. **P0-1 修复 `splitPromptForPrefixCache`（抽离至纯函数模块 `src/agent/promptCache.ts`）**
   - 放弃依赖 `\b` 的正则拆分，改为**基于顶层白名单标题整行精确匹配的逐行扫描器**（识别 `# 角色与通用准则`、`# 背景`、`# 当前阶段职责与工作指南`、`# 工作指南`、`# 输出格式`、`# 可用工具`、`# 用户指令`、`# 认知状态`、`# 工具执行结果`、`# 页面观察`）。
   - 对 `cardContextInjection` 或剧本正文中自带的 `# 标题`（如 `# 目标卡片上下文信息`）天然免疫，绝不误拆。
   - 尾部追加的动态 `【⚠️ 系统重要提示：本轮必须调用工具】` 显式剥离并归入 `userPrompt`，确保 `systemPrompt` 100% 纯净。
2. **P0-2 重排主模板与兜底模板默认段落顺序**
   - `src/agent/systemPrompt.txt`、`src/agent/systemPromptExecution.txt` 及 `server.ts` 兜底模板统一调整为：
     `静态前缀区（# 角色与通用准则 → # 当前阶段职责与工作指南 → # 输出格式 → # 可用工具）` → `动态输入区（# 用户指令 → # 认知状态 → # 工具执行结果 → # 页面观察 → 尾部提醒）`。
   - 即使自定义模板或某些降级链路未走拆分，前缀几千 token 仍稳定前置。
3. **P0-3 重构 `update-state-node` 的 `system` / `user` 拆分（`src/agent/stateNodePrompt.txt` & `server.ts`）**
   - 将固定角色职责 + `【输出格式（严格输出合法 JSON）】` Schema（约 600–700 tokens）全部移入 `messages[0] (system)`。
   - 将 `【当前认知状态（上一轮旧状态）】` 与 `【本轮最新输入与主循环输出】` 放入 `messages[1] (user)`。
   - 兼容用户自定义状态节点 Prompt：若模板中仍将 `【输出格式】` 置于后方，`splitStateNodePromptForPrefixCache` 亦自动抽取固定职责与 `【输出格式】` 组成 `systemPrompt`。

### P1：精细压榨 `user` 前段与跨阶段（0 级 ↔ 1 级）缓存

4. **P1-1 `messages[1] (user)` 内部按“最稳在前、最变在后”排序**
   - **`# 用户指令` 内部**：`## 初始任务指令`（任务周期全程不变）前置 → `## 当前聚焦目标 ({{cardContext}})` → `## 多轮对话与最新回复`（仅触发 `user.ask` 时动态追加）。
   - **`# 认知状态` 内部**：`任务标题` → `最终目标` → `当前计划` → `重点笔记` → `当前小目标` → `当前进度`。
   - **尾部动态观察区**：`# 工具执行结果` → `# 页面观察` → 强制调用工具提醒。
5. **P1-2 主循环 0 级与 1 级抽取跨阶段共享静态头**
   - 在 `systemPrompt.txt`（0 级）与 `systemPromptExecution.txt`（1 级）最顶部写入**字面量逐字符完全一致**的 `# 角色与通用准则`（含身份定位、沟通口吻、事实推进底线与通用 4 区块输出协议，约 180+ tokens，跨越多个 64-token 缓存块）。
   - **严守认知隔离原则（SSOT & 物理隔离）**：仅共享跨阶段真正通用的准则与输出框架；0 级规划/重规划指引与 1 级分步执行指引、以及按阶段装载的工具集仍保持物理隔离，绝不因凑缓存而破坏工具按需暴露。
6. **P1-3 `# 可用工具` 内部固定排序优化**
   - 保留遍历 `AGENT_TOOL_REGISTRY` 固定顺序过滤已启用业务工具的机制（使同工具集跨轮/跨任务字节级一致）。
   - 将 0 级与 1 级描述完全一致的控制工具 `user.ask` 置于 `sys.selectContext` 之前，进一步延长工具段共享前缀。

### P2：真实 Cache Usage 观测与防回退防线

7. **P2-1 打通真实 Token & Prefix Cache 指标采集与导出**
   - 流式与非流式调用统一解析供应商返回的 `usage`（兼容 DeepSeek `prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` 与 OpenAI `prompt_tokens_details.cached_tokens`）；流式请求按需附加 `stream_options: { include_usage: true }`（并在遇不支持该字段的兼容端点时自动降级重试）。
   - 主循环通过 `debug.response.usage` 透传，状态节点通过响应字段 `usage` 透传至 `stateNodeTrace.usage`。
   - `src/agent/traceExport.ts` 导出时显式标注 `=== [SYSTEM] ===` 与 `=== [USER] ===` 分界，并展示每轮及全任务缓存命中统计。
8. **P2-2 同步旧 Prompt 失效校验与自动化单测**
   - 同步更新 `server.ts`（`isObsoleteMainPrompt` 与 `update-state-node` 校验）及 `src/utils/promptPersistence.ts`（`isObsoletePromptText`），使 `.data/user_saved_prompts.json` 与 `localStorage` 旧缓存自动切换至新结构。
   - 新增 `src/agent/promptCache.test.ts` 覆盖拆分逻辑、动静隔离断言、抗 `# 标题` 干扰、共享静态头一致性、状态节点拆分与 usage 归一化。

---

## 三、 13 轮「提取娜塔莉亚角色」Trace 预期收益对照

| 环节 / 轮次 | 运行特征 | 优化前 | 优化后预期 |
| :--- | :--- | :--- | :--- |
| **主循环 第 1 轮** | 0 级，未展开分类 | `system` 为空，第 ~35 token 即断流 | 写入 0 级基础 `system`（跨新任务首轮共享） |
| **主循环 第 2 轮** | 0 级，展开 `[script, asset]` | 仅命中开头 ~35 token | **命中共享静态头 + `user` 初始指令/`cardContext`**；写入 `[script, asset]` 候选简表缓存 |
| **主循环 第 3 轮** | 1 级，探查套件 3 工具 | 0→1 切换，全量重算 | **命中共享静态头 + `user` 前端**；写入探查套件 1 级 `system` |
| **主循环 第 4 轮** | 0 级，退回重规划 | 全量重算 | **100% 命中第 2 轮 0 级 `system`** |
| **主循环 第 5 轮** | 1 级，读写套件 3 工具 | 全量重算 | **命中共享静态头**；写入 ~3,000+ tokens 读写套件 1 级 `system` |
| **主循环 第 6～12 轮** | 1 级，连续 7 轮同工具 | 因工具结果/`cardContext` 变，几乎 0 命中 | **连续 7 轮 100% 命中 ~3,000+ tokens 完整 `system`**，只读间隔轮叠加命中 `user` 前端 |
| **主循环 第 13 轮** | 0 级，验收与 `sys.endTask` | 全量重算 | **100% 命中第 2 / 第 4 轮 0 级 `system`** |
| **状态节点 第 1～13 次** | 每轮 1 次增量 JSON 合并 | `system` < 64 tokens，Schema 垫底 0 命中 | 第 1 次写入 ~650 tokens `system`，**第 2～13 次 100% 命中** |

---

## 四、 17 轮实测复盘与第二轮迭代优化（P3）

### 1. 第一轮实测数据（17 轮「提取娜塔莉亚角色」）
- **主循环总命中**：`30,848 / 78,502 tokens`（**39.3%**）；核心执行期第 6～12 轮稳定命中 `2,304 ~ 2,816 tokens`（最高 **75.5%**）。
- **状态节点总命中**：`12,544 / 35,804 tokens`（**35.0%**）；第 2～17 轮稳定命中固定 Schema `~784 tokens/轮`。
- **实测暴露的新瓶颈**：
  1. `cleanToolOutputForPrompt` 仍对 `verifiedProvenance` 保留全量中英双语 `evidenceText`，且当资产含 `versions` 时主卡顶层与版本层重复输出两份出处，致使第 11～17 轮动态 `# 工具执行结果` 膨胀 2,500～3,500 tokens/轮，拉高总分母；同时无 `sceneId` 标记亦增加同号场次（如两个 `1-5`）混淆风险。
  2. `# 角色与通用准则` 原仅 417 字符（~180 tokens），`0↔1` 切换时仅命中前 2 块（`128` tokens），第 3 块被 `# 当前阶段职责与工作指南` 截断。
  3. 状态节点 `user` 首段放置了每轮变化的 `【当前认知状态（上一轮旧状态）】`，使后方恒定的 `userMessage` / `cardContext` 无法命中。

### 2. 第二轮已实施优化
1. **P3-1 工具返回值出处按场次聚合与多版本去重（`src/agent/contextPolicy.ts`）**：
   - 将 `verifiedProvenance` 聚合成 `{ sceneId, sceneTitle, count, lines }` 轻量数组（既保留场次唯一 ID 区分同号场次、保留行号供核验，又彻底裁剪冗长双语正文）。
   - 当资产对象存在带 `verifiedProvenance` 的 `versions` 时，主卡顶层仅保留 `verifiedProvenanceCount`，消除双份重复序列化。
2. **P3-2 跨阶段共享头跨过 4 个缓存块边界（`systemPrompt.txt` / `systemPromptExecution.txt` / `server.ts`）**：
   - 将跨阶段通用的 `# 角色与通用准则` 充实至 ~660+ 字符（稳过 256 tokens = 4 个 64-token 缓存块），保持 0 级与 1 级字节级一致且严守职责隔离。
3. **P3-3 状态节点 `user` 段恒定前缀前置（`stateNodePrompt.txt` / `src/constants/prompts.ts` / `src/agent/promptCache.ts` / `server.ts`）**：
   - 在 `【输出格式】` 之后先输出恒定/低频变化的 `【任务背景与聚焦目标】`（`{{userMessage}}` + `{{cardContext}}`），再输出 `【当前认知状态（上一轮旧状态）】` 与 `【本轮最新流向与主循环输出】`，并更新 `splitStateNodePromptForPrefixCache` 以 `【任务背景与聚焦目标】` 为起点切分 `user`。

