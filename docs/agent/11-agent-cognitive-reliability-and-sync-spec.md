# Mira Agent 认知可靠性与全链路状态同步设计规范 (Cognitive Reliability & State Sync Spec)

本文档沉淀自“剧本角色提取与出处锚定”多轮迭代调优（从偶发漏检、13 轮折返重查，演进至连续 10 次 100% 准确率、稳定 9 轮理论最短路径结案），作为后续扩展场景/道具提取、分镜拆解、画布卡片联动及新工具开发的**强制性工程规范**。

---

## 规范一：机制优先于补丁——用“数据结构设计”消除模型认知幻觉 (Mechanism over Prompt Patching)

当模型出现漏检、跳号、跨集串味或边界算错时，优先审视并改造**工具的输入/输出数据结构**，而非在 Prompt 中堆砌“严禁漏掉、请仔细核对”。

1. **列表型输出必带连续序号 (`index: 1..N`)**
   - 凡是返回数组/列表的读取或搜索工具（如 `script.search`、`script.directory`、`asset.searchProvenanceCandidates`、分镜列表、画布卡片列表），必须在每个列表项顶层注入从 `1` 开始的连续整数 `index: 1..N` 及顶层 `total`。
   - **原理**：离散的业务行号（如 `56, 58, 74, 75, 77, 78, 80, 83`）在模型归纳压缩时极易发生跨号遗漏（如漏掉 `77`）；连续的 `index: 1..N` 为模型提供了显式的清点坐标系，从数据结构层面防漏。

2. **工具契约符合直觉且全局统一 (`1-based` 闭区间)**
   - 凡涉及行号、页码、场次序号的工具参数与返回值，统一采用 `1-based` 闭区间语义（例如 `script.directory` 返回 `startLine: 1, endLine: 87`，`script.read` 与 `script.search` 同样以 `1` 作为首行并包含 `endLine`），彻底消除“目录从 1 开始、读取从 0 开始”导致的边界差一错误（Off-by-one Error）。

3. **范围过滤下沉到工具层 (Scope-First Filtering)**
   - 搜索与查询工具必须原生提供范围收敛参数（如 `episode`、`scene`、`startLine`、`endLine`、`type`），由代码层 100% 精确裁剪后再返回给模型，避免将全量跨集数据抛入上下文靠模型注意力过滤。

---

## 规范二：指针化与全链路同步——杜绝“局部最新、旁路陈旧”的认知分裂 (Live Pointer & Symmetric State Sync)

多轮任务中，只要任何一个消费节点看到了过期的旧状态（如创建资产后面板计数仍显示 `0`），就会触发多余的“怀疑与折返复核轮次”。

1. **严格区分“不可变意图快照”与“可变环境真值”**
   - **不可变意图快照 (Immutable Intent)**：用户的初始指令（`initialGoal`）、划词文本片段（`scriptSelection`）、特殊任务声明（如定制化“出处核验”标题）在任务创建时冻结，不随环境变化被覆盖。
   - **可变环境真值 (Mutable Truth)**：聚焦面板的统计计数（`assets.panel` 的角色/场景/道具数量）、聚焦资产的属性（`assets.item.*` 的描述与场次）、聚焦画布卡片的状态（`canvas.card.*` 的 `prompt`、`landmarks` 标注、上下游谱系 `lineage`），在 `task.cardContext` 中以 `targetId` 指针为核心，每次消费前通过纯函数 `refreshTaskCardContext(cardContext, project, allCards)` 从唯一数据源（`ScriptProject` / `CardData[]`）实时派生。

2. **“写后即刷 + 读前必刷”的全链路对称同步**
   - **写后即刷 (Producer Hook)**：在 `executeAgentTool` 中，任何写入类工具（`asset.create`、`asset.update`、`asset.delete`、`asset.commitProvenance`、`card.*`）更新底层数据后，立即调用 `refreshTaskCardContext` 原地刷新 `task.cardContext`。
   - **读前必刷与对称分发 (Consumer Hook)**：所有状态消费入口——包括**主循环 (`requestTurn`)**、**认知状态节点 (`updateStateNode`)**、**UI 任务面板 (`onTaskChange`)** 与**运行追踪快照 (`RuntimeTrace`)**——必须在入口处读取同一份刷新后的 `task.cardContext`，并将本轮工具执行结果摘要同步传入 `stateNode`。
   - **模板槽位守卫 (Template Slot Guard)**：后端加载提示词模板（如 `statePromptTemplate`）时，必须校验 `{{cardContext}}` 等核心实时状态槽位是否存在；若发现缓存了缺失槽位的旧模板，自动升级至最新标准模板，从协议层杜绝静默丢包。

---

## 规范三：正向单一判准与信息分流——顺应模型认知规律编写 Prompt (Single Positive Criterion & Information Routing)

1. **用“唯一正向判准”替代负面禁令清单**
   - 提示词只写清晰的正向操作步骤与单一判定问题（例如：*“根据该行剧本描述，该资产是否直接出现在当前画面中”*），避免堆砌“禁止 A、不得 B、除外 C”导致注意力稀释或反向暗示。

2. **为被过滤的信息设计明确的“分流出口” (Information Routing)**
   - 当某条信息对理解角色/资产很有价值（如他人台词提及背景、OS 旁白回顾），但不属于目标字段 B（如 `provenances` 画面出处）时，必须明确指引其流向字段 A（如 `description` 识别描述）：
     - **归入 `description`**：角色身份背景、人物关系、首次出场位置、防混淆外观特征（含他人台词或 OS 中的背景线索）。
     - **归入 `provenances`**：该资产直接出现在当前画面中或当场说出台词的剧本原句。

---

## 规范四：分层认知与确定性阶段注入——控制单轮认知负荷 (Dual-Level Staged Cognition)

1. **0 级全局规划与 1 级局部执行严格解耦**
   - **0 级全局规划与验收 (`systemPrompt.txt`)**：仅暴露工具分类简表，负责拆解目标、挑选工具进入执行、以及核验成果后调用 `sys.endTask` 结案。
   - **1 级局部专注执行 (`systemPromptExecution.txt` + 按需挂载的领域指南)**：仅暴露当前装载的 1~3 个具体工具 Schema 与对应领域操作指南，专注完成“当前小目标”，完成后调用无参 `sys.selectContext` 退回 0 级。

2. **用 Runtime 确定性状态替代模型文字猜测**
   - 旁路认知状态节点（`stateNode`）判断阶段去向时，由 Runtime 根据本轮是否实际成功执行了 `sys.selectContext` 计算出确定性的 `currentStage` 并注入 Prompt，严禁仅因主循环文字中预告“完成后将返回全局阶段”而提前篡改 `subGoal`。

---

## 规范五：证据链驱动验证与最短路径基准测试 (Trace-Driven Verification)

1. **全链路可观测性 (`RuntimeTrace`)**
   - 任何新接入的工具、上下文槽位或状态节点，其完整的输入、输出、阶段切换与前后状态快照必须完整记录至 `trace.md`。
2. **最短路径基准测试 (Baseline Benchmarking)**
   - 复杂 Agent 功能的验收标准不仅是“最终结果正确”，还必须满足**“零冗余轮次、零折返重查”**。
   - 上线新能力时，先推算理论最短轮次（如单阶段读写任务 8~9 轮），再通过连续 3~5 次真实运行检验是否稳定收敛在最短路径上；一旦出现额外轮次，直接排查对应轮次 `requestTurn` 与 `stateNode` 的输入状态是否存在信息滞后或不一致。
