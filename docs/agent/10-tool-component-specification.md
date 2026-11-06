# 10-Mira Agent 工具组件开发与注册规范 (Tool Component Specification)

本文档定义了 Mira Agent 系统中工具组件（Tool Component）从**命名、注册、描述编写、参数设计、执行方法实现到返回值脱水**的完整工程规范。未来新增或重构任何 Agent 工具时，必须以此规范为唯一参考标准。

---

## 1. 核心设计哲学

1. **后台工具优先与数据解耦（Backend-First & Data-DOM Decoupling）**
   - 读写项目数据（剧本、资产、卡片状态）的工具必须直接操作纯数据模型（`ProjectData` / `CardData`），严禁依赖 DOM 节点、React 实例或屏幕坐标。
   - 仅当用户要求界面演示、核对视觉状态或后台工具不具备对应能力时，才使用 `page.inspect` 与 `ui.actAndObserve`。
2. **规则内聚与零冗余（Inline Rules & Zero Redundancy）**
   - **禁止**在提示词中维护独立的“工作指南（Prompt Modules）”长文段落。
   - 工具的业务规则、边界条件、默认值与正反例约束必须**直接内聚在该工具的 `description` 中**，做到“工具注入即规则注入，工具卸载即零 Token 占用”。
3. **跨轮次上下文脱水（Prompt Dehydration）**
   - 工具可以向前端业务层返回完整的数据结构（含内部校验哈希、字符偏移量等），但在注入 `# 工具执行结果` 喂给大模型前，必须经过脱水清洗，剔除对模型推理无意义的机器内部字段。

---

## 2. 命名与分类规范

### 2.1 工具 ID 命名（`<domain>.<action>`）
所有工具 ID 必须采用 `领域前缀.小驼峰动词` 格式，并在 `src/agent/protocol.ts` 的 `AgentToolName` 联合类型中声明：

| 领域前缀 | 所属工具箱 (`category`) | 职责边界 | 示例 |
| :--- | :--- | :--- | :--- |
| `sys.*` / `user.*` | 系统控制 (`CONTROL_TOOLS`) | 思考层级切换、向用户提问、结束任务（0 级与 1 级常驻） | `sys.selectContext`, `user.ask`, `sys.endTask` |
| `script.*` | `script`（剧本工具箱） | 分集目录查询、正文按行分页读取、全文关键词检索 | `script.directory`, `script.read`, `script.search` |
| `asset.*` | `asset`（资产工具箱） | 角色/场景/道具 CRUD、跨集候选出处检索、出处锚点提交 | `asset.list`, `asset.create`, `asset.update`, `asset.delete`, `asset.searchProvenanceCandidates`, `asset.commitProvenance` |
| `card.*` | `card`（画布与生图工具箱） | 卡片属性与多模态图像查看、画面元素空间标注、生图与复刻衍生 | `card.inspect`, `card.detectLandmarks`, `card.generate` |
| `page.*` / `ui.*` / `guide.*` | `ui`（界面观察与操作） | 可见界面结构观察、鼠标动作执行、界面操作说明查询 | `page.inspect`, `ui.actAndObserve`, `guide.lookup` |

### 2.2 动态装载分类映射（`src/agent/contextPolicy.ts`）
- **系统控制工具**（`CONTROL_TOOLS`）在 Level 0 与 Level 1 全程常驻。
- **业务工具**必须归入 `TOOL_CATEGORIES` 的四大分类之一（`script` | `asset` | `card` | `ui`）。当 Agent 在第 1 轮调用 `sys.selectContext({ level: 1, categories: ["script", "asset"] })` 时，系统自动展开对应分类下的全部业务工具。

---

## 3. 工具注册表与提示词渲染格式

### 3.1 注册表结构（`src/agent/toolRegistry.ts`）
每个工具必须在 `AGENT_TOOL_REGISTRY` 中注册完整的 `AgentToolDefinition`：

```typescript
export interface AgentToolDefinition {
  id: AgentToolName;       // 唯一工具标识，如 'asset.update'
  category: ToolCategory;  // UI 设置面板分组：'剧本与资产' | '页面观察' | '页面交互' | '操作知识' | '系统控制'
  description: string;     // 注入提示词的精炼职责与内聚规则（单行纯文本，不含换行）
  input: string;           // 注入提示词的 TypeScript 风格参数签名
  output: string;          // 供设置面板展示的返回值简述
  mouse: boolean;          // 是否驱动画布/界面虚拟光标动画
  risk: ToolRisk;          // '只读' | '交互动作' | '内部状态'
}
```

### 3.2 提示词统一双行渲染格式（`server.ts`）
在组装 `# 可用工具 -> ## 当前可直接调用` 时，所有控制工具与业务工具严格采用统一的**双行缩进格式**：

```markdown
- <tool.id>：<tool.description>
  参数：<tool.input>
```

**禁止**混用单行拼接或额外的多级缩进，确保模型解析工具表时的视觉与结构一致性。

---

## 4. 工具描述 (`description`) 编写规范

工具描述是模型正确调用工具的核心依据，编写时必须遵守**三段式结构**与**字数红线**：

### 4.1 三段式编写模板
1. **核心动作与对象（必选）**：开门见山说明“按什么条件、对什么数据、执行什么操作”（如：`按资产 ID 或版本 ID 修改已有资产的属性、二级版本列表（versions）或直接补充已读剧本的出场原句（provenances）。`）。
2. **联用关系或触发边界（按需）**：说明与其他工具的配合关系或免调用条件（如：`可配合 script.directory 返回的 startLine 传入 offset 定向读取目标集`；或 `已读并锚定的集数无需调用`）。
3. **核心业务约束与默认行为（按需）**：
   - 若只有 1~2 条轻量规则，使用括号补充：`（更新属性时保留已有设定仅修订差异；更新出处时 mode 默认 "append" 增量追加并保留旧集数出处，全量重设传 "overwrite"）`。
   - 若包含多条强约束，使用 `规则：① ...；② ...；③ ...。` 紧凑编号。

### 4.2 编写红线
- **禁止空泛套话**：不写“这是一个非常重要且强大的工具”、“请务必仔细思考后调用”等废话。
- **默认值必须显式声明**：凡是带有 `mode`、`action`、`autoStart` 等默认值的参数，必须在 `description` 中写明默认行为（例如 `asset.update` 的 `mode` 默认 `"append"`，而 `card.detectLandmarks` 的 `mode` 默认 `"overwrite"`）。
- **单条描述长度控制**：普通只读工具控制在 **30~60 字**；复杂写入工具（含内聚业务规范）控制在 **80~160 字**以内。

---

## 5. 参数签名 (`input`) 设计规范

为降低模型的记忆负担，跨工具的同类参数必须使用**完全一致的字段名与类型约定**：

### 5.1 通用参数命名准则

| 场景 | 标准参数签名 | 规范说明 |
| :--- | :--- | :--- |
| **分页读取与筛选** | `{ query?: string, offset?: number, limit?: number }` | `offset` 从 `0` 开始计，返回值必须包含 `{ total, offset, nextOffset }` |
| **按类型过滤资产** | `{ type?: "characters" | "locations" | "props" }` | 实现层需兼容单数形式（`"character"` -> `"characters"`） |
| **单条与批量操作** | `{ id?: string, ids?: string[], items?: array }` | 删除支持 `id` / `ids`；新增支持单对象属性或 `items` 批量数组 |
| **增量与覆盖模式** | `{ mode?: "append" | "overwrite" }` | 严禁自造 `isReplace`、`mergeMode` 等同义异名字段 |
| **画布卡片标识** | `{ cardId: string }` 或 `{ targetCardId?: "new" | string }` | 实现层必须自动剥离 `"canvas.card."` 前缀，兼容模型传入 UI 组件 ID 或纯卡片 ID |

### 5.2 参数容错解析（Defensive Parsing）
在工具实现层（`src/agent/projectTools.ts` 或 `src/App.tsx`）读取 `call.arguments` 时，必须做容错归一化：
- **ID 别名兼容**：例如同时兼容 `args.id || args.assetId || args.targetId`。
- **类型单复数兼容**：例如同时兼容 `character` 与 `characters`。
- **明确抛错提示**：当必填参数缺失或目标 ID 不存在时，抛出带修复指引的中文 `Error`（如：`未找到 ID 为 xxx 的资产，请先通过 asset.list 核对已有资产 ID`）。

---

## 6. 方法实现与返回值规范

### 6.1 纯数据工具 vs 界面交互工具

| 类型 | 实现位置 | 架构要求 |
| :--- | :--- | :--- |
| **项目数据只读工具** | `src/agent/projectTools.ts` -> `executeProjectReadTool` | 纯函数，输入 `(name, args, project: ProjectData)`，返回纯 JSON 数据，无任何副作用，支持在 `node:test` 下直接单测。 |
| **项目数据写入工具** | `src/agent/projectTools.ts` -> `executeProjectAssetMutation` | 纯函数，输入 `(name, args, project: ProjectData)`，以**不可变方式（Immutable）**返回 `{ updatedProject, output }`，再由调用方统一触发持久化保存。 |
| **画布/UI 交互工具** | `src/App.tsx` -> `executeAgentTool` | 驱动 `agentFocusManager` 光标动画与画布/页面状态变更；涉及卡片重绘时严格遵守 **Fork（复刻）保护机制**，严禁覆盖资产卡或已出图卡片。 |

### 6.2 返回值结构与上下文脱水（`cleanToolOutputForPrompt`）
1. **结构化精简返回**：写入类工具返回 `{ status: "created" | "updated" | "deleted" | "committed", ... }` 及必要的确认摘要。
2. **自动脱水过滤**：在 `src/agent/contextPolicy.ts` 的 `cleanToolOutputForPrompt` 中：
   - 自动剥离 `verifiedScriptHash` 等内部校验哈希。
   - 自动将 `verifiedProvenance` 锚点数组裁剪为 `{ sceneTitle, lineNumber, evidenceText, versionId?, versionName? }`，剔除 `id`、`rawSpan`、`fallbackCharIndex`、`verifiedAt` 等高熵定位字段。
   - 若未来新增工具在返回对象中携带了仅供前端渲染使用的巨型字段（如 Base64 原始数据、长数组缓存），必须在 `cleanToolOutputForPrompt` 中同步注册裁剪规则。
3. **执行后状态同步**：Runtime（`src/agent/runtime.ts`）保证在 `runTool` 执行完毕后，才将本轮工具的真实执行摘要（`executedTools`）传给 `/api/agent/update-state-node`，并在下一轮 `# 工具执行结果` 中给出明确回执。

---

## 7. 新增工具标准开发清单（6 步 Checklist）

每当需要为 Mira Agent 开发一个新工具时，按以下 6 步依次完成并验证：

1. **声明协议类型**：在 `src/agent/protocol.ts` 的 `AgentToolName` 中添加新工具的 `<domain>.<action>` 名称。
2. **注册工具定义**：在 `src/agent/toolRegistry.ts` 的 `AGENT_TOOL_REGISTRY` 中添加工具条目，按第 4、5 节规范编写内聚规则的 `description` 与统一风格的 `input`。
3. **归入动态分类**：在 `src/agent/contextPolicy.ts` 的 `TOOL_CATEGORIES` 对应分类（`script` / `asset` / `card` / `ui`）的 `tools` 数组中加入该工具 ID。
4. **实现执行方法**：
   - 若为项目数据工具，在 `src/agent/projectTools.ts` 中以纯函数实现，并在 `src/App.tsx` 的 `executeAgentTool` 中挂载转发。
   - 若返回结果含有面向前端的内部冗余大字段，在 `cleanToolOutputForPrompt` 中添加脱水规则。
5. **编写单元测试**：在 `src/agent/projectTools.test.ts` 或 `src/agent/contextPolicy.test.ts` 中编写无 DOM 依赖的 `node:test` 用例。
6. **执行构建与校验**：运行单元测试、`npm run lint` 与 `npm run build` 确认零报错。
