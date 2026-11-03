# 08-分层思考与工具/提示词动态剪枝架构规范 (Hierarchical Thinking & Dynamic Tool Pruning)

## 1. 核心背景与设计目标

随着 Mira Agent 工具库与专家能力的迅速扩展，若在每一轮 ReAct 循环中全量注入所有的后台工具定义 (Tool Definitions) 与完整的长文本 Prompt，将面临以下痛点：
1. **Token 爆炸与响应延迟**：数十个工具模式 (Schema) 与冗长规约会急剧消耗上下文 Token，拖慢推理速度。
2. **工具误选与注意力分散**：模型在拥有过多同类或跨领域工具时，更容易发生函数调用冲突或参数误填。
3. **全局与局部失焦**：缺少显式“思考层级”时，Agent 容易在微观细节（如特定卡片标注）中迷失全局目标（如整个剧本分集出图进度）。

本架构提出 **“分层思考 + 意图驱动工具动态剪枝”** 机制：
- **Level 0 (Meta-Cognition & Strategic Layer / 宏观战略层)**：负责整体目标评估、任务拆解、全局 Plan / Notes 维护及下阶段策略调度。默认仅注入 **Meta-Catalog 工具元信息目录**（不注入具体 API 细节），极大节省 Token 并保持宏观视角。
- **Level 1 (Tactical Execution Layer / 微观执行层)**：在确定具体任务域（如 `剧本读取`、`资产管理`、`生图控制`、`UI 观察`）后，仅向 Agent 注入当前领域所需的**受限工具掩码 (Tool Mask)** 与**领域专精提示词**。

---

## 2. 思考层级与状态转移状态机

### 2.1 层级定义

| 层级 | 名称 | 职责 | 注入的 Prompt 范围 | 注入的 Tool 范围 |
|---|---|---|---|---|
| **Level 0** | 宏观战略层 (Meta-Cognition) | 识别用户总目标、梳理全局计划、评估完成度、调度 Level 1 领域 | 全局系统提示词 + 状态节点 (Plan/Notes) + 工具分类元目录 | 仅注入控制层工具 (`sys.setThinkingLevel`, `sys.endTask`, `guide.lookup`) |
| **Level 1** | 微观执行层 (Tactical Execution) | 单点高频操作（如快速检索正文、批量生成构想卡、精确空间标注） | 全局通用约束 + 当前 `domain` 专精 Prompt + 当前 Task State | 仅注入 `requestedCategories` 对应的受限 Tool Mask |

### 2.2 状态转移图 (State Transition Flow)

```text
       ┌──────────────────────────────┐
       │   Agent 初始化 (初始为 Level 0) │
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │     Level 0: 宏观规划/拆解     │
       │ (评估目标, 更新 Plan & Notes) │
       └──────────────┬───────────────┘
                      │
           声明需要进入 Level 1 
     与所需的 requestedCategories
                      │
                      ▼
       ┌──────────────────────────────┐
       │ Level 1: 专精工具调用/密集执行  │
       │  (仅装载选定分类的 Tool Mask)  │
       └──────────────┬───────────────┘
                      │
             微观任务完成 / 遇到阻塞 
            (调用 setThinkingLevel(0))
                      │
                      ▼
       ┌──────────────────────────────┐
       │ Level 0: 总结成果, 重新校准Plan │
       └──────────────────────────────┘
```

---

## 3. 工具分类元目录 (Meta-Catalog Index)

在 Level 0 时，Agent 将接收以下轻量级分类索引，而非完整的 JSON Schema 定义：

```typescript
export interface ToolCategoryMeta {
  id: string;
  name: string;
  description: string;
  toolIds: string[];
}

export const TOOL_CATEGORIES: Record<string, ToolCategoryMeta> = {
  script: {
    id: "script",
    name: "剧本数据工具箱",
    description: "后台直接读取剧本元数据、目录分集、提取正文及关键字检索",
    toolIds: ["script.readMetadata", "script.readDirectory", "script.readEpisode", "script.search"]
  },
  asset: {
    id: "asset",
    name: "资产与实体提取",
    description: "角色卡、场景卡、道具卡提取与列表获取",
    toolIds: ["asset.extractElements", "asset.list"]
  },
  card: {
    id: "card",
    name: "画布与分镜卡片控制",
    description: "批量创建卡片、生图/复刻控制、深入探针查看、元素空间标注",
    toolIds: ["card.batchCreate", "card.generate", "card.inspect", "card.detectLandmarks", "card.annotateElements"]
  },
  ui: {
    id: "ui",
    name: "页面观察与交互操作",
    description: "页面结构观察 (page.inspect) 与底层真实 GUI 鼠标手势交互",
    toolIds: ["page.inspect", "gui.mouse", "gui.keyboard"]
  },
  system: {
    id: "system",
    name: "系统与任务调度",
    description: "指导查询、层级切换与任务收尾",
    toolIds: ["guide.lookup", "sys.setThinkingLevel", "sys.endTask"]
  }
};
```

---

## 4. State Node 与 Runtime 运行追踪集成

### 4.1 State Node 增强提取

在每一轮响应后，后台提取节点 (`/api/agent/update-state-node`) 将同步抽取 Agent 的层级意图：

```json
{
  "focus": "聚焦于解构剧本第二集，并准备批量生成画幅构想卡片",
  "thinkingLevel": 1,
  "domain": "剧本拆解与构想",
  "requestedCategories": ["script", "card"],
  "plan": [
    { "step": 1, "text": "读取第二集正文", "status": "completed" },
    { "step": 2, "text": "提取分镜镜头并批量创建卡片", "status": "in_progress" }
  ],
  "notes": "第二集包含主打角色金发女郎"
}
```

### 4.2 设置页面运行追踪面板 (AgentRuntimeTracePanel)

在应用设置中的 `AgentRuntimeTracePanel` 中，追踪数据增加以下指标可视化：
1. **Thinking Level Badge**：高亮显示当前轮次属于 `Level 0 (Meta)` 还是 `Level 1 (Tactical)`。
2. **Domain Tag**：展示当前激活的领域上下文。
3. **Injected Tool Mask Filter**：清晰标明当前轮次被允许调用的工具类别及遮蔽过滤后的实际 Token 优化率。

---

## 5. 验收标准

1. **零功能回退**：在 Level 0 与 Level 1 切换期间，已注册的工具均能按需动态注入与调用。
2. **Token 削减率 > 50%**：Level 0 阶段由于工具 JSON Schema 被裁剪，系统提示词体积显著减少。
3. **追踪精准可查**：设置页面的运行追踪面板能够实时呈现每一轮次的 `thinkingLevel`、`requestedCategories` 和 `domain` 标签。
