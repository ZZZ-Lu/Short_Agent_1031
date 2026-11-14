# Mira Agent 经验沉淀、自定义经验角色（Persona）与跨任务触发闭环设计规范

本文档定义了 Mira Agent 从**“单次任务动态重点笔记（`task.notes`）”**向**“跨任务永久经验沉淀、自定义经验角色养成（Experience Persona）、一键导入导出分享与运行期伴随式零损耗触发”**演进的完整架构方案。

---

## 一、 设计背景与核心原则

在复杂任务（如跨场次剧本资产提取、多版本造型拆解、分镜生图等）中，Agent 在单次任务内通过 `# 认知状态 -> 重点笔记` 形成的高价值经验（如跨场次新造型版本预判、同名子场次区分、工具返回结果 `sourceScenes` 账实核对等），不应随着单次任务结束而消失，而应沉淀为**可在未来任意同类任务中自动唤醒的永久经验**。

同时，为了避免传统 Agent 记忆系统的三大常见陷阱：
1. **全局提示词堆积陷阱**：把所有历史经验无差别塞入全局 System Prompt，导致注意力稀释与 DeepSeek Prefix Cache 失效；
2. **具体剧本实例污染陷阱**：未剥离单次任务的剧名、角色名、临时 ID，导致换剧或换角色时发生认知串台；
3. **主动查询工具遗忘与耗时陷阱**：做成 `memory.lookup` 工具让模型主动调用，模型常因“不知道自己不知道”而漏调，或白白多耗费 1 轮推理时间（5～15 秒）。

本方案遵循 `AGENTS.md` 六大认知可靠性法则，采用**「结案去实例化提纯 + 按阶段与工具作用域胶囊化绑定 + 自定义经验角色打包（支持导入导出）+ 伴随 `sys.selectContext` 零轮次自动挂载」**的闭环架构。

---

## 二、 核心数据模型：自定义经验角色（Experience Persona）

用户通过多次实战任务「总结」积累的经验集合，组织为可命名、可切换、可独立导出与导入的**「自定义经验角色包（Experience Persona）」**（如：`短剧资产精拆专家`、`高精分镜复刻导演`）。

### 1. TypeScript 接口定义

```ts
export type ExperienceStage = 'level0_planning' | 'level1_execution';

export interface AgentExperienceRule {
  id: string;                  // 规则唯一 ID，如 "rule_1794500001_abc"
  stage: ExperienceStage;      // 生效阶段：0 级全局规划期 | 1 级局部执行期
  triggerScope: string[];      // 触发作用域：
                               // - level0_planning 存展开的分类组合，如 ["script", "asset"]
                               // - level1_execution 存装载的工具组合，如 ["script.read", "asset.create", "asset.update"]
  content: string;             // 纯正向、去实例化的通用经验法则（1～2 句话，严禁含具体剧名/角色名/临时ID）
  sourceTaskTitle?: string;    // 溯源信息：提炼自哪次任务（如 "提取娜塔莉亚建档 (16轮)"）
  enabled: boolean;            // 是否启用（支持单条精细开关）
  createdAt: number;
  updatedAt: number;
}

export interface AgentExperiencePersona {
  schemaVersion: '1.0.0';      // 导入导出协议版本号，保证向后兼容
  id: string;                  // 角色唯一标识，如 "persona_script_asset_expert"
  name: string;                // 自定义角色名称，如 "短剧资产精拆专家"
  description: string;         // 角色简介与适用任务场景说明
  author?: string;             // 创建者署名（可选，方便团队分享溯源）
  createdAt: number;
  updatedAt: number;
  rules: AgentExperienceRule[]; // 该角色下挂载的分层经验胶囊列表
}

export interface AgentExperienceStore {
  activePersonaId: string | null; // 当前激活的经验角色 ID（为 null 时代表纯净默认模式）
  personas: AgentExperiencePersona[];
  summarizedTraceIds: string[];   // 已执行过经验总结的任务 Trace ID 列表（用于 UI 状态标记）
}
```

### 2. 存储位置与持久化策略
- **服务端持久化**：保存在 `.data/agent_personas.json`（与 `.data/user_saved_prompts.json` 同级，不含任何 API Key 或用户私密剧本正文）；
- **前端本地镜像**：同步缓存于 `localStorage`（`mira_agent_experience_store_v1`），支持离线读取与即时切换。

---

## 三、 完整功能闭环的四个核心环节

### 环节 1：【采集与提纯】运行追踪列表右侧的「总结」按钮

1. **UI 入口位置（`AgentRuntimeTracePanel.tsx`）**
   - 在「运行追踪（Runtime Trace）」左侧任务列表卡片的**右半部分**（与右上角的 `复制日志` 按钮并列或置于右下角状态行右侧），新增常驻/悬浮可见的 **「✨ 总结」** 按钮；
   - 若该任务已在 `summarizedTraceIds` 中，按钮显示为 `✓ 已总结`（仍支持点击重新提炼）。

2. **提纯输入（提取任务轨迹高信噪比摘要）**
   点击「总结」后，前端提取该任务的精炼轨迹发送至 `POST /api/agent/distill-experience`：
   - 任务最终目标（`goal`）与最终计划步骤（`plan`）；
   - 各轮次 `状态检查` 与 `思考` 中的**重点笔记演进链**（以及最终 `task.notes`）；
   - 实际调用的 0 级分类（`categories`）与 1 级工具组合（`tools`）；
   - 任务中途是否发生过参数校验拦截或自我修正（`failureSummaries` / `scriptValidatorTrace`）；
   - 当前激活角色在相同 `triggerScope` 下**已有的经验列表**（用于对比去重）。

3. **去实例化蒸馏准则（由 `deepseek-v4-flash` 驱动）**
   提纯节点严格遵守 `AGENTS.md` 法则一：
   - **剥离单次实例名词**：彻底去除具体剧名、角色名（如“娜塔莉亚”）、具体场次名（如“1-5 布莱克伍德庄园”）、具体造型名（如“职业装黑框眼镜”）和临时实体 ID（如 `char_xxx`）；
   - **提炼纯正向通用句式**：转化为领域通用的结构化判准与行动指南（如*“角色处于不同年龄阶段或不同服装造型、场景处于不同日夜状态、道具处于不同形态状态”*）；
   - **智能增量合并决策（`add` / `merge` / `skip`）**：
     - `add`：发现当前角色尚未覆盖的新实战技巧，新增条目（单作用域上限控制在 3～5 条以内）；
     - `merge`：对已有某条经验的完善升级，输出合并精炼后的文本替换原条目；
     - `skip`：当前角色已有经验已完全覆盖本次任务要点，提示无需重复添加。

4. **预览确认弹窗（人机协同把关）**
   - 提纯返回后，在界面弹出轻量确认框，展示拟新增/合并的 0 级规划经验与 1 级执行经验；
   - 用户可直接微调文字、选择目标归档角色（默认归入当前激活角色，若尚无自定义角色则引导一键创建），点击「确认入库」即刻生效。

---

### 环节 2：【养成与管理】自定义经验角色工作台

在调试台（`运行追踪` 顶部工具栏或专属角色管理抽屉）提供直观的角色管理能力：
1. **当前激活角色切换器（Active Persona Selector）**
   - 下拉快速切换：`纯净默认模式（不挂载额外经验）` 或任意已创建的自定义角色（显示已启用经验条数，如 `短剧资产精拆专家 (5 条经验)`）；
2. **角色的增删改查**
   - 支持新建自定义角色（设置角色名称、简介、署名）、重命名、复制角色或删除角色；
3. **角色内经验胶囊精细管理**
   - 按 **「0 级规划经验（绑定工具箱分类）」** 与 **「1 级执行经验（绑定读写工具集）」** 分组展示；
   - 每条经验展示其触发作用域标签（如 `script + asset`）、经验正文、来源任务名称，支持随时点击编辑文本、单条启用/禁用开关或删除。

---

### 环节 3：【分享与流转】角色包一键导出与导入协议

为了支持用户将长期打磨成熟的经验打包分享给他人，内置标准化的导入导出能力：

1. **一键导出（Export Persona）**
   - 点击当前角色的「导出角色」按钮，生成并下载 `.mira-persona.json` 文件（文件名示例：`Mira角色_短剧资产精拆专家_v1.json`）；
   - 导出内容仅包含角色元数据（`name`、`description`、`author`、`schemaVersion`）与 `rules` 通用经验列表，**零私钥、零项目隐私数据**，安全可跨团队分发。

2. **一键导入（Import Persona）**
   - 点击「导入角色」上传 `.mira-persona.json` 文件，校验 JSON 结构与字段合法性后，提供两种导入模式：
     - **模式 A：作为独立新角色导入** —— 在本地角色列表中新增该角色并可立即激活使用；
     - **模式 B：合并入当前选中角色** —— 将导入包中的 `rules` 按 `stage + triggerScope` 与当前角色的规则智能去重合并，实现多份经验包融合。

---

### 环节 4：【触发与生效】运行期伴随 `sys.selectContext` 的零轮次自动挂载

当用户在画布发起任意新任务且当前激活了某个自定义经验角色时，**无需 Agent 额外调用任何查询工具**，由 `/api/agent/turn` 结合 `resolveContext` 自动按阶段匹配挂载：

1. **0 级全局规划期触发（按展开的 `categories` 匹配）**
   - 当 Agent 在 0 级调用 `sys.selectContext({ categories: ["script", "asset"] })` 展开工具箱分类时；
   - 后端匹配当前激活角色中 `enabled === true`、`stage === 'level0_planning'` 且 `triggerScope` 子集命中当前 `categories` 的经验条目；
   - 自动注入到 0 级 `# 可用工具` 候选简表下方的 `【当前角色规划经验（<角色名>）】` 区块中，指导 Agent 完成并发只读探查与分批读写计划拆解。

2. **1 级局部执行期触发（按装载的 `tools` 匹配 + 100% 命中 Prefix Cache）**
   - 当 Agent 调用 `sys.selectContext({ tools: ["script.read", "asset.create", "asset.update"] })` 进入 1 级局部执行阶段时；
   - 后端自动卸载 0 级经验，匹配当前激活角色中 `enabled === true`、`stage === 'level1_execution'` 且 `triggerScope` 命中当前已装载 `tools` 的经验条目；
   - 自动挂载至 `system` 静态前缀的 `# 可用工具` 区块末尾（`【当前角色执行经验（<角色名>）】`）。
   - **性能保障**：由于挂载在 `messages[0] (role: "system")` 静态前缀内，在 1 级连续多轮读写循环中 **100% 稳定命中 DeepSeek 官方 Prefix Cache**，实现**零额外轮次开销、零首字延迟增加、零跨领域注意力污染**。
