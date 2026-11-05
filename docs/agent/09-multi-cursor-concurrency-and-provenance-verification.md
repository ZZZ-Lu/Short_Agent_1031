# 多指针并发 Agent 架构与资产出处核验机制设计方案

> 状态：实施中
> 关联规范：[01-runtime-architecture.md](01-runtime-architecture.md) | [06-backend-first.md](06-backend-first.md) | [AGENTS.md](../../AGENTS.md)

## 1. 设计背景与核心原则

在多人协作、剧本频繁修改与复杂道具/角色指代（如资产名为「纯金钥匙」，而在剧本正文中简称为「钥匙」，同时其它场次又存在无关的汽车钥匙或台词比喻）的场景下，单纯依赖字面全文检索直接展示出处会产生漏检或误报；同时，若核验过程或其它任务阻塞用户当前操作，会破坏协作体验。

因此本方案确立两大核心架构原则：

1. **出处核验：全文候选检索 + 模型别名识别与逐条鉴别 + 上下文指纹锚点**
   - 保留底层极速全文检索机制，但**检索出的毛坯候选绝不直接上屏展示**；
   - 由 Agent 结合资产设定推断出全部可能别名（`aliases`），调用后台工具捞取包含前后文切片（`±100字`）的候选列表（`candidates`）；
   - 由模型逐一阅读每处候选的上下文语境，剔除同名异物与台词比喻，仅提交确认为真实出场的候选 ID；
   - 核验结果以**上下文指纹锚点（`anchorText` + `offsetInAnchor`）**形式持久化到资产数据中。前端渲染时基于指纹锚点 0ms 还原实时字符偏移与实际命中词长度，实现抗前文删改偏移与精准别名高亮。
2. **全具身多指针并发 Agent：无“隐形后台 Agent”，1 个任务 = 1 个带编号的 Agent 鼠标**
   - 废除看不见的“后台静默 Agent”概念。无论是**用户主动下达的任务**，还是**系统自行启动的任务**（如新资产提取后自动核验出处、资产改名重核、用户在出处浮层点击核验），全部在前端表现为具身可见的 `AgentCursor`；
   - 支持多任务并发执行：**一个任务对应一个独立的 Agent 鼠标实例**，鼠标指针**右上角显示数字角标（`1`、`2`、`3`...）**以区分不同任务；
   - 当 `Agent 1` 正在忙碌时，用户在任意画布卡片、剧本或资产条目上右键召唤或发起新指令，不打断 `Agent 1`，而是直接唤醒新的 `Agent 2` 鼠标响应用户。

---

## 2. 模块一：资产出处核验机制 (Provenance Verification Pipeline)

### 2.1 纯数据模型扩展 (`src/types/script.ts`)

遵循 **数据-DOM 解耦 (Data-DOM Decoupling)** 规范，所有核验状态与锚点均为纯 JSON 可序列化结构：

```ts
export type ProvenanceStatus = 'unverified' | 'verifying' | 'verified' | 'stale';

export interface VerifiedProvenanceAnchor {
  id: string;                 // 唯一锚点 ID，如 "vp_ep13_0"
  sceneId?: string;           // 关联的分集/场次 ID
  sceneTitle: string;         // 所属分集/场次标题，如 "第13集"
  matchedTerm: string;        // 正文中实际命中的词（原名"纯金钥匙"或别名"钥匙"）
  anchorText: string;         // 上下文指纹短语（命中词前后各约 12~16 字）
  offsetInAnchor: number;     // matchedTerm 在 anchorText 内的起始偏移
  fallbackCharIndex?: number; // 核验时刻的原始字符索引（兜底定位）
  lineNumber?: number;        // 核验时刻的行号
}
```

在 `ScriptCharacter`、`ScriptLocation`、`ScriptProp` 中统一包含：
- `aliases?: string[]`：模型识别或用户补充的别名/简称列表
- `provenanceStatus?: ProvenanceStatus`：当前出处核验状态
- `verifiedProvenance?: VerifiedProvenanceAnchor[]`：经模型逐条核验通过的上下文指纹锚点
- `verifiedScriptHash?: string`：核验完成时的剧本内容签名

### 2.2 候选检索与指纹锚点解析 (`src/utils/assetProvenance.ts`)

1. **`searchProvenanceCandidates(scriptText, tocItems, assetName, aliases, scopeEpisodeTitles?)`**：
   - 将 `[assetName, ...aliases]` 去重并按长度降序排列（优先匹配长词如 `"纯金钥匙"`，防止被短词 `"钥匙"` 重复切碎）；
   - 在全文或指定分集范围内扫描全部命中位置，生成结构化候选条目 `ProvenanceCandidateItem[]`：
     - `candidateId`：唯一候选标识（如 `"cand_0"`, `"cand_1"`）
     - `sceneId` / `sceneTitle` / `lineNumber` / `charIndex`
     - `matchedTerm`：实际命中的词
     - `contextSnippet`：命中处前后约 `±80` 字的上下文片段（命中词用 `【】` 标注，便于模型快速审阅）
     - `anchorText` 与 `offsetInAnchor`：用于核验通过后落盘的上下文指纹
2. **`resolveVerifiedProvenance(scriptText, tocItems, asset)`**：
   - 当资产已核验（`provenanceStatus === 'verified'` 且存在 `verifiedProvenance`）时：
     - 遍历 `verifiedProvenance`，优先在所属分集/场次切片内通过 `indexOf(anchor.anchorText)` + `anchor.offsetInAnchor` 计算当前最新的 `firstMatchCharIndex`；若分集标题微调则回退至全文查找 `anchorText`；
     - 返回包含 `matchedTerm` 的 `AssetProvenanceItem[]`，供前端 0ms 渲染出处胶囊、跳转正文并按 `matchedTerm.length` 精准高亮（例如正文写的是 `"钥匙"`，点击 `"纯金钥匙"` 即可精准高亮 `"钥匙"` 二字）。
   - 当资产未核验或正在核验时：
     - 不直接返回未经核验的全文匹配结果，避免误导用户。

### 2.3 Agent 核验工具链 (`src/agent/projectTools.ts` & `toolRegistry.ts`)

1. **`asset.searchProvenanceCandidates`（只读工具）**
   - 输入：`{ id?: string, name?: string, type?: "characters" | "locations" | "props", aliases?: string[] }`
   - 输出：返回该资产的基本设定摘要及全文检索到的 `candidates` 列表（含 `candidateId`、`sceneTitle`、`lineNumber`、`matchedTerm`、`contextSnippet`），引导 Agent 逐一检查上下文。
2. **`asset.commitProvenance`（写入工具）**
   - 输入：`{ id: string, type?: "characters" | "locations" | "props", aliases?: string[], verifiedCandidateIds: string[], summary?: string }`
   - 输出：将通过核验的 `verifiedCandidateIds` 转换为 ` VerifiedProvenanceAnchor[]` 写入资产的 `verifiedProvenance`，自动同步更新 `aliases`、去重后的 `sourceScenes` 及 `provenanceStatus = 'verified'`，并触发项目增量保存。

### 2.4 剧本圣经 UI 出处浮层交互 (`src/components/ProjectScriptBible.tsx`)

- **状态胶囊展示**：
  - `verifying`：显示紫色脉冲 `核验中...`
  - `unverified` / 无已核验数据：显示 `待核验`，展开浮层后提示“出处需经模型结合上下文逐条鉴别”并提供 **「让 Agent 核验出处」** 按钮；
  - `verified`：显示核验确认后的 `N 处`（及重新核验入口），点击条目跳转至正文对应位置并高亮实际命中的 `matchedTerm`。

---

## 3. 模块二：多指针具身 Agent 并发与自主启动架构

### 3.1 核心模型：1 Task ↔ 1 AgentCursor (`src/App.tsx` & `src/components/AgentCursor.tsx`)

- **右上角数字角标 (`badgeNumber`)**：
  - `AgentCursor` 组件新增 `badgeNumber?: number` 属性；
  - 当指针绑定了具体任务或存在并发任务时，在鼠标图标**右上角**渲染醒目的数字角标（`1`, `2`, `3`...），与任务序号一一对应。
- **并发任务指针池 (`taskCursors: Record<string, TaskCursorState>`)**：
  - 每个正在运行的 `RuntimeTask` 拥有专属的 `TaskCursorState`（独立维护 `x, y` 世界坐标、`cursorMode`、`isMoving`、`isRunning`、`isThinking`、`speak`、`focusedTargetId`、`badgeNumber`）；
  - 工具执行（`executeTool`）与任务状态变更（`onTaskChange`）严格按 `task.id` 更新该任务对应的鼠标实例，互不覆盖；
  - 保留一个主交互指针用于响应用户的右键召唤、拖拽与 `QuickInput` 输入；当用户提交新任务时，该任务立即获得编号并作为独立任务指针运行，用户在任务运行期间右键任何其它目标均可立即召唤新的待命输入框发起并发任务。
- **任务完成后的平滑消散**：
  - 当某个并发任务完成（`completed` / `failed` / `cancelled`）后，其专属鼠标保留最终汇报气泡约 `2.5 秒`，随后自动淡出销毁，最终画布仅保留 1 个待命主鼠标。

### 3.2 Agent 自行启动机制 (`spawnAutonomousAgentTask`)

- 支持系统或 UI 事件直接发起具身 Agent 任务（无需用户手敲输入框）：
  - 自动分配任务 ID 与右上角数字角标 `badgeNumber`；
  - 自动解析目标组件/资产条目（如 `assets.item.prop.<id>`）在画布世界坐标系下的锚点位置，驱动该任务专属的 `AgentCursor` 滑行停靠至目标旁；
  - **视口防抢占原则**：自行启动的任务或多任务并发期间，只移动各自的 `AgentCursor` 指针，绝不强制移动用户的画布相机（Camera），保证用户当前视野稳定。

---

## 4. 实施步骤清单

1. **Step 1**：扩展 `src/types/script.ts` 资产出处类型，升级 `src/utils/assetProvenance.ts` 实现 `searchProvenanceCandidates` 与 `resolveVerifiedProvenance`，并编写单元测试验证。
2. **Step 2**：在 `src/agent/protocol.ts`、`src/agent/toolRegistry.ts`、`src/agent/projectTools.ts`、`server.ts` 中注册并实现 `asset.searchProvenanceCandidates` 与 `asset.commitProvenance` 工具，编写工具层单元测试。
3. **Step 3**：升级 `src/components/ProjectScriptBible.tsx` 的出处浮层 `CandidateMatchesOverlay`、正文别名精确高亮及「让 Agent 核验出处」联动回调。
4. **Step 4**：升级 `src/components/AgentCursor.tsx` 支持右上角数字角标 `badgeNumber`，重构 `src/App.tsx` 实现多任务多指针并发池与 Agent 自行启动核验能力。
5. **Step 5**：执行单元测试、TypeScript 类型检查与构建验证。
