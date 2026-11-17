# 任务运行追踪明细（共 4 轮）：资产清单整理
- **最终目标**：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）
- **任务状态**：waiting_user · **总耗时**：24.5 s
- **最新进展**：已完成经验检索、工具装载及剧本目录与角色资产读取，摸清项目现状（40集75场1303段、2个角色、场景0道具0），并已向用户发起意图确认，当前处于等待用户回复阶段，分批建档计划尚未制定。（小目标：等待用户回复确认建档方向（补全场景/道具、完善角色或仅查看），再据此制定分批计划）
- **缓存命中汇总**：主循环命中 7680 / 21318 tokens (36.0%) · 状态节点命中 2432 / 6143 tokens (39.6%)

---
## 第 1 轮（耗时：3070 ms (3.07 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 2341 tokens · 缓存命中 2048 (87.5%) · 输出 370

### [第 1 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“Mira”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前场景输出对用户说的话：常规中间执行轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在调用 sys.endTask 结案汇报、调用 user.ask 向用户提问或无需调工具直接回复时，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、检索同类任务经验、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。
执行任务通用规范——严格遵循“检索经验 + 四步走”闭环推进（搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收）：
0. 检索同类任务经验（初次规划必做）：收到新任务尚未检索经验时，优先调用 experience.search（传入任务类型关键词，如“提取角色”、“核验出处”等；可与首次展开工具分类的 sys.selectContext({"categories": [...]}) 同轮并发调用），获取该类任务的四步走最佳实践指南；
1. 搜集足够的信息（探查期，数据未知时）：在尚未掌握目标数据分布与现有状态前，先制定宏观探查计划；首次展开分类时一次性展开任务涉及的全部工具箱分类，探查期结合所获经验装载只读探查工具建立全局视野、搜集足够的信息，不提前装载写入或修改工具；
2. 制定足够清晰的计划（获知数据分布后动态重规划）：当探查结果返回了数据分布概览或触发数据量预警时，必须对照 experience.search 返回的计划制定标准与探查结果，在“当前计划”中将宏观任务拆解为边界明确、分批推进的具体子步骤（结合各场次/集数字数 charCount 规划合批，每轮合批总字数控制在工具建议上限 recommendedBatchMaxChars 内，重头戏大场次独立成批；若涉及多版本/造型演进，先从目录人物表与检索命中切片中梳理完整造型版本清单，并将每一批需创建或追加的具体版本动作显式写进计划步骤标题）；每个子步骤必须定义为“读取该批数据并立即完成创建或增量更新落盘”的完整读写闭环（即使操作对象为单个目标实体，也必须按“首批读取并调用创建工具建档落盘 → 后续每批读取并调用更新工具增量追加”拆解，不规划无写入动作的纯读取步骤或留到最后一步才汇总创建）；
3. 实施（成套装载工具切入执行）：计划明确后，在 tools 参数中同时成套装载所需的读取、创建与更新工具 ID 切入执行阶段，按计划步骤随读随写完成每一批闭环；
4. 验收（全局核验与结案）：从执行阶段返回后，对照“最终目标”与“当前计划”逐项验收所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。

# 输出格式
状态检查：
{回顾并检查下面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 本轮执行结果与事实盘点：上一步工具返回了哪些具体结果？是否已获取同类任务经验（experience.search）？是否获知了数据分布概览或触发了数据量预警？
- 原计划完成度核对：对照现有“当前计划”，哪些步骤已真实达成（[x]），哪些尚待推进（[ ]）？最终目标是否已全部达成？
- 工具箱分类与工具准备：若尚未检索经验，本轮需调用 experience.search；为执行接下来的计划，需要先展开哪些工具箱分类（categories，首次展开时可与 experience.search 同轮并发调用，一次性展开任务涉及的全部工具箱分类），或成套装载哪些具体读写工具（tools）进入执行阶段？}
思考：
{使用内心独白的方式，围绕全局目标、计划拆解与工具准备进行逻辑推演：
- 1. 拆解策略推演：分析当前任务进展、已获取的同类任务经验（experience.search）与本轮返回的数据规模及分布结构，思考接下来的推进策略（若处于初次规划尚未检索经验，决定同轮并发调用 experience.search 与 sys.selectContext 展开分类；若已获知探查数据分布或触发数据量预警，严格对照同类任务经验中的“制定足够清晰的计划”标准，先从探查数据中梳理关键状态/版本清单，再拆分为合理的“首批读取+创建、后续每批读取+增量更新”读写批次）；
- 2. 制定或更新“当前计划”（显式列出完整步骤列表，标记 [x] 已完成、[ ] 待推进）：
  * 初次规划（数据未知时）：按“四步走”列出宏观阶段计划（如：[ ] 1. 搜集足够的信息（探查项目数据现状）；[ ] 2. 制定足够清晰的计划并分批实施目标操作；[ ] 3. 全局验收结案）；
  * 动态重规划（获知数据分布或触发数据量预警时）：直接将旧宏观步骤替换为按经验标准与数据分布拆解的“首批读取+创建、后续每批读取+增量更新”闭环子步骤列表（在步骤标题中写明唯一场次 ID 与本批需创建/追加的具体版本动作）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）；
- 3. 下一步小目标与重点笔记盘点：若所有步骤均已真实达成，决定调用 sys.endTask 结案；若未完成，明确下一步要推进的具体步骤与“当前小目标”，确定本轮调用的工具与参数，并盘点本轮有哪些跨轮次仍需引用的关键事实、实体 ID、预判的造型版本清单或待办线索，以及你对任务的新理解、总结了什么经验，或对接下来的推进有什么直观感受与自我提醒。}
工具调用：
{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
用户沟通：
{
- 对用户说的话（简版）：“口语化介绍当前状态、阶段进展、汇报结论或向用户提问，控制在30字以内（每轮必填；注意调用工具不等于完成任务）”
- 对用户说的话（完整版）：“（按需选填：仅在调用 sys.endTask 结案汇总、调用 user.ask 提问需补充背景依据或无需调用工具直接回答用户时输出；若本轮仅调用 experience.search / sys.selectContext 推进中间步骤，无需输出完整版）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；收到新任务尚未检索经验时可与 sys.selectContext 同轮并发调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 可装载的工具分类（传 categories 展开对应候选工具简表）
- script（剧本工具箱）：读取分集目录、分页读取剧本正文、搜索关键词
- asset（资产工具箱）：查询、新增、修改、删除角色/场景/道具资产，检索与锚定剧本出处
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

=== [USER] ===
# 用户指令
## 初始任务指令
你好
## 当前聚焦目标
【当前聚焦目标：资产清单面板 (assets.panel)】
- 角色数量: 2
- 场景数量: 0
- 道具数量: 0

# 认知状态
任务标题：尚未命名
最终目标：暂无
当前计划：暂无计划
重点笔记：暂无笔记
当前小目标：暂未设定
当前进度：刚刚开始
```

### [第 1 轮] 模型原始输出
```text
状态检查：
- 最终目标：暂无（用户仅打招呼，当前聚焦资产清单面板，已有 2 个角色、0 场景、0 道具）
- 本轮执行结果与事实盘点：尚未调用任何工具，未检索经验，未获知数据分布
- 原计划完成度核对：暂无计划
- 工具箱分类与工具准备：需先检索同类任务经验，并展开全部工具箱分类建立全局视野

思考：
- 1. 拆解策略推演：用户仅说“你好”，但聚焦目标指向资产清单面板，说明任务大概率围绕资产建档/整理展开。按四步走规范，初次规划必须先检索经验并一次性展开全部工具箱分类，探查项目数据现状（角色、场景、道具分布与剧本结构），再制定清晰计划。
- 2. 制定或更新“当前计划”：
  * [ ] 1. 搜集足够的信息（检索经验 + 展开工具箱分类 + 探查项目数据现状）
  * [ ] 2. 制定足够清晰的计划并分批实施目标操作
  * [ ] 3. 全局验收结案
- 3. 下一步小目标：同轮并发调用 experience.search 与 sys.selectContext 展开 script/asset/card/ui 四类工具，获取经验与工具全貌。重点笔记：当前资产仅 2 个角色，场景与道具为空，需确认用户具体意图。

工具调用：
{{调用 experience.search, {"query": "资产清单整理 角色场景道具建档"}}}
{{调用 sys.selectContext, {"categories": ["script", "asset", "card", "ui"]}}}

用户沟通：
- 对用户说的话（简版）：你好！我先了解下项目现状，稍等～
```

### [第 1 轮] 工具调用记录（共 2 个）
#### 🛠️ 工具 1：`experience.search` (succeeded)
**工具输入 (Input)**：
```json
{
  "query": "资产清单整理 角色场景道具建档"
}
```
**工具输出 (Output)**：
```json
{
  "query": "资产清单整理 角色场景道具建档",
  "matchedCount": 1,
  "experiences": [
    {
      "id": "script_asset_extraction",
      "title": "剧本角色/场景/道具资产提取与多版本建档经验",
      "taskTypes": [
        "提取角色",
        "提取场景",
        "提取道具",
        "资产建档",
        "剧本拆解提取"
      ],
      "keywords": [
        "提取",
        "角色",
        "人物",
        "场景",
        "道具",
        "资产",
        "建档",
        "创建资产",
        "造型",
        "版本",
        "出处",
        "剧本",
        "character",
        "scene",
        "prop",
        "asset"
      ],
      "summary": "适用于从指定剧本集数或场次中提取角色、场景、道具资产卡片，完整收录各造型/状态版本与真实画面出处。",
      "steps": {
        "gatherInfo": "首次展开 [\"script\", \"asset\"] 分类后，装载并同轮并发调用 script.directory（传目标集数）、script.search（必填目标集数 episode 与实体名称 query）及 asset.list（查重），一次性拿齐场次字数分布、各场人物表、正文中所有命中段落切片及现有资产状态。",
        "makePlan": "（成败关键）在制定分批计划前，必须先通读探查返回的数据完成以下 3 项设计：\n  1. 预判完整造型/状态演进清单：对照 script.directory 各场人物表（是否标注了不同年龄/时期）与 script.search 返回的各场 matches 原文切片（是否描写了新的服装穿搭、职业装束、标志性配饰/眼镜、场景日夜切换或道具形态改变），先在思考与重点笔记中梳理出目标实体在本集中的全部造型/状态清单；\n  2. 大场次独立成批：小场次可合并（单批总字数 ≤ 2500 字），但单场正文字数接近或超过 1800 字（或段落数 ≥ 25 段）的重头戏场次必须单独拆为独立批次，避免多场混读导致新造型或出处漏判；\n  3. 将具体造型版本动作直接写进计划步骤标题：每个批次步骤不仅要写明唯一场次 ID（sceneId），还必须把步骤 1 预判出的版本动作显式锚定在步骤标题中（例如：“[ ] 1. 读取 scene-A、scene-B，核验出处并调用 asset.create 创建主卡（初始默认造型）并同步建立「[某年龄/时期]」版本”；“[ ] 2. 读取 scene-C（单大场独立成批），核验出处并调用 asset.update 在 versions 中新增「[某场合新服装造型]」版本并绑定该场出处”），不写笼统的“增量追加出处”。",
        "execute": "成套装载 [\"script.read\", \"asset.create\", \"asset.update\"] 切入执行阶段：\n  1. 首批建主卡克制原则：调用 asset.create 时，顶层 appearance 仅客观记录当前已精读场次中明确写出的初始体貌与状态（未写具体服饰时保持基础特征描述，不提前透支未读场次的服装）；若首批已读场次包含另一年龄/造型，同步在 versions 数组中传入；\n  2. 后续批次严格兑现新版本建档：每批调用 script.read 精读全文后，严格按工具规则逐段摘录中文原文核验出处；若该场次原文出现了前序批次未建立的新服装穿搭、标志性配饰、年龄阶段、场景日夜或道具形态变化，调用 asset.update 时必须通过 versions 数组传入新版本对象并将该场 provenances 绑定在新版本下。",
        "verify": "所有批次均完成落盘后，通过 asset.list 回查核对已创建的资产数量、各造型版本（versions）及累计出处条数是否完整无误，确认全部真实达成后调用 sys.endTask 结案汇报。"
      }
    }
  ]
}
```
#### 🛠️ 工具 2：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "categories": [
    "script",
    "asset",
    "card",
    "ui"
  ],
  "level": 0
}
```
**工具输出 (Output)**：
```json
{
  "level": 0,
  "tools": [],
  "prompts": [],
  "categories": [
    "script",
    "asset",
    "card",
    "ui"
  ],
  "transition": "expand_categories"
}
```

---
## 第 2 轮（耗时：3775 ms (3.77 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 3608 tokens · 缓存命中 1920 (53.2%) · 输出 378

### [第 2 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“Mira”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前场景输出对用户说的话：常规中间执行轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在调用 sys.endTask 结案汇报、调用 user.ask 向用户提问或无需调工具直接回复时，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、检索同类任务经验、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。
执行任务通用规范——严格遵循“检索经验 + 四步走”闭环推进（搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收）：
0. 检索同类任务经验（初次规划必做）：收到新任务尚未检索经验时，优先调用 experience.search（传入任务类型关键词，如“提取角色”、“核验出处”等；可与首次展开工具分类的 sys.selectContext({"categories": [...]}) 同轮并发调用），获取该类任务的四步走最佳实践指南；
1. 搜集足够的信息（探查期，数据未知时）：在尚未掌握目标数据分布与现有状态前，先制定宏观探查计划；首次展开分类时一次性展开任务涉及的全部工具箱分类，探查期结合所获经验装载只读探查工具建立全局视野、搜集足够的信息，不提前装载写入或修改工具；
2. 制定足够清晰的计划（获知数据分布后动态重规划）：当探查结果返回了数据分布概览或触发数据量预警时，必须对照 experience.search 返回的计划制定标准与探查结果，在“当前计划”中将宏观任务拆解为边界明确、分批推进的具体子步骤（结合各场次/集数字数 charCount 规划合批，每轮合批总字数控制在工具建议上限 recommendedBatchMaxChars 内，重头戏大场次独立成批；若涉及多版本/造型演进，先从目录人物表与检索命中切片中梳理完整造型版本清单，并将每一批需创建或追加的具体版本动作显式写进计划步骤标题）；每个子步骤必须定义为“读取该批数据并立即完成创建或增量更新落盘”的完整读写闭环（即使操作对象为单个目标实体，也必须按“首批读取并调用创建工具建档落盘 → 后续每批读取并调用更新工具增量追加”拆解，不规划无写入动作的纯读取步骤或留到最后一步才汇总创建）；
3. 实施（成套装载工具切入执行）：计划明确后，在 tools 参数中同时成套装载所需的读取、创建与更新工具 ID 切入执行阶段，按计划步骤随读随写完成每一批闭环；
4. 验收（全局核验与结案）：从执行阶段返回后，对照“最终目标”与“当前计划”逐项验收所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。

# 输出格式
状态检查：
{回顾并检查下面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 本轮执行结果与事实盘点：上一步工具返回了哪些具体结果？是否已获取同类任务经验（experience.search）？是否获知了数据分布概览或触发了数据量预警？
- 原计划完成度核对：对照现有“当前计划”，哪些步骤已真实达成（[x]），哪些尚待推进（[ ]）？最终目标是否已全部达成？
- 工具箱分类与工具准备：若尚未检索经验，本轮需调用 experience.search；为执行接下来的计划，需要先展开哪些工具箱分类（categories，首次展开时可与 experience.search 同轮并发调用，一次性展开任务涉及的全部工具箱分类），或成套装载哪些具体读写工具（tools）进入执行阶段？}
思考：
{使用内心独白的方式，围绕全局目标、计划拆解与工具准备进行逻辑推演：
- 1. 拆解策略推演：分析当前任务进展、已获取的同类任务经验（experience.search）与本轮返回的数据规模及分布结构，思考接下来的推进策略（若处于初次规划尚未检索经验，决定同轮并发调用 experience.search 与 sys.selectContext 展开分类；若已获知探查数据分布或触发数据量预警，严格对照同类任务经验中的“制定足够清晰的计划”标准，先从探查数据中梳理关键状态/版本清单，再拆分为合理的“首批读取+创建、后续每批读取+增量更新”读写批次）；
- 2. 制定或更新“当前计划”（显式列出完整步骤列表，标记 [x] 已完成、[ ] 待推进）：
  * 初次规划（数据未知时）：按“四步走”列出宏观阶段计划（如：[ ] 1. 搜集足够的信息（探查项目数据现状）；[ ] 2. 制定足够清晰的计划并分批实施目标操作；[ ] 3. 全局验收结案）；
  * 动态重规划（获知数据分布或触发数据量预警时）：直接将旧宏观步骤替换为按经验标准与数据分布拆解的“首批读取+创建、后续每批读取+增量更新”闭环子步骤列表（在步骤标题中写明唯一场次 ID 与本批需创建/追加的具体版本动作）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）；
- 3. 下一步小目标与重点笔记盘点：若所有步骤均已真实达成，决定调用 sys.endTask 结案；若未完成，明确下一步要推进的具体步骤与“当前小目标”，确定本轮调用的工具与参数，并盘点本轮有哪些跨轮次仍需引用的关键事实、实体 ID、预判的造型版本清单或待办线索，以及你对任务的新理解、总结了什么经验，或对接下来的推进有什么直观感受与自我提醒。}
工具调用：
{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
用户沟通：
{
- 对用户说的话（简版）：“口语化介绍当前状态、阶段进展、汇报结论或向用户提问，控制在30字以内（每轮必填；注意调用工具不等于完成任务）”
- 对用户说的话（完整版）：“（按需选填：仅在调用 sys.endTask 结案汇总、调用 user.ask 提问需补充背景依据或无需调用工具直接回答用户时输出；若本轮仅调用 experience.search / sys.selectContext 推进中间步骤，无需输出完整版）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；收到新任务尚未检索经验时可与 sys.selectContext 同轮并发调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset, card, ui]）
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（附每集/场次字数与单批字数上限建议）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- guide.lookup：查询应用界面操作指南
- page.inspect：观察当前可见界面概览或指定组件区域内容
- card.inspect：查看指定卡片的图像、提示词、参考图及画幅参数
- card.detectLandmarks：对指定卡片画面进行元素空间定位与语义标注
- card.generate：触发生图或对已有卡片执行复刻衍生创建新卡
- ui.actAndObserve：在已观察到的可见目标上执行鼠标动作并返回新界面状态

=== [USER] ===
# 用户指令
## 初始任务指令
你好
## 当前聚焦目标
【当前聚焦目标：资产清单面板 (assets.panel)】
- 角色数量: 2
- 场景数量: 0
- 道具数量: 0

# 认知状态
任务标题：资产清单整理
最终目标：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）
当前计划：[ ] 搜集足够的信息（检索经验 + 展开工具箱分类 + 探查项目数据现状）
[ ] 制定足够清晰的计划并分批实施目标操作
[ ] 全局验收结案
重点笔记：- ① 当前聚焦资产清单面板：角色2个、场景0、道具0；② 已命中经验《剧本角色/场景/道具资产提取与多版本建档经验》；③ 已展开 script/asset/card/ui 四类工具（level=0）；④ 用户仅打招呼，具体意图待确认；⑤ 下一步需探查项目数据现状（角色/场景/道具分布与剧本结构）后再制定清晰计划。
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成经验检索与工具箱分类展开，尚未探查项目数据现状，整体处于全局规划阶段。

# 工具执行结果
【工具 experience.search 执行成功】
【同类任务最佳实践经验：剧本角色/场景/道具资产提取与多版本建档经验】
- 适用场景：适用于从指定剧本集数或场次中提取角色、场景、道具资产卡片，完整收录各造型/状态版本与真实画面出处。
- 第一步（搜集足够的信息）：首次展开 ["script", "asset"] 分类后，装载并同轮并发调用 script.directory（传目标集数）、script.search（必填目标集数 episode 与实体名称 query）及 asset.list（查重），一次性拿齐场次字数分布、各场人物表、正文中所有命中段落切片及现有资产状态。
- 第二步（制定足够清晰的计划）：
（成败关键）在制定分批计划前，必须先通读探查返回的数据完成以下 3 项设计：
  1. 预判完整造型/状态演进清单：对照 script.directory 各场人物表（是否标注了不同年龄/时期）与 script.search 返回的各场 matches 原文切片（是否描写了新的服装穿搭、职业装束、标志性配饰/眼镜、场景日夜切换或道具形态改变），先在思考与重点笔记中梳理出目标实体在本集中的全部造型/状态清单；
  2. 大场次独立成批：小场次可合并（单批总字数 ≤ 2500 字），但单场正文字数接近或超过 1800 字（或段落数 ≥ 25 段）的重头戏场次必须单独拆为独立批次，避免多场混读导致新造型或出处漏判；
  3. 将具体造型版本动作直接写进计划步骤标题：每个批次步骤不仅要写明唯一场次 ID（sceneId），还必须把步骤 1 预判出的版本动作显式锚定在步骤标题中（例如：“[ ] 1. 读取 scene-A、scene-B，核验出处并调用 asset.create 创建主卡（初始默认造型）并同步建立「[某年龄/时期]」版本”；“[ ] 2. 读取 scene-C（单大场独立成批），核验出处并调用 asset.update 在 versions 中新增「[某场合新服装造型]」版本并绑定该场出处”），不写笼统的“增量追加出处”。
- 第三步（实施）：
成套装载 ["script.read", "asset.create", "asset.update"] 切入执行阶段：
  1. 首批建主卡克制原则：调用 asset.create 时，顶层 appearance 仅客观记录当前已精读场次中明确写出的初始体貌与状态（未写具体服饰时保持基础特征描述，不提前透支未读场次的服装）；若首批已读场次包含另一年龄/造型，同步在 versions 数组中传入；
  2. 后续批次严格兑现新版本建档：每批调用 script.read 精读全文后，严格按工具规则逐段摘录中文原文核验出处；若该场次原文出现了前序批次未建立的新服装穿搭、标志性配饰、年龄阶段、场景日夜或道具形态变化，调用 asset.update 时必须通过 versions 数组传入新版本对象并将该场 provenances 绑定在新版本下。
- 第四步（验收）：所有批次均完成落盘后，通过 asset.list 回查核对已创建的资产数量、各造型版本（versions）及累计出处条数是否完整无误，确认全部真实达成后调用 sys.endTask 结案汇报。

【工具 sys.selectContext 执行成功】已展开工具分类 [script, asset, card, ui] 的候选工具简表（请从上方候选简表中按需挑选本次执行所需的具体工具 ID 填入 tools，调用 sys.selectContext({"tools": [...]}) 进入局部执行阶段）
```

### [第 2 轮] 模型原始输出
```text
状态检查：
- 最终目标：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）。
- 本轮执行结果：已成功检索同类任务经验（资产提取与多版本建档经验），已展开 script/asset/card/ui 四类工具简表；尚未探查项目数据现状。
- 原计划完成度：[ ] 搜集足够的信息（经验已检索，但项目数据现状未探查）；[ ] 制定清晰计划并实施；[ ] 全局验收结案。
- 工具箱准备：需装载只读探查工具（script.directory、asset.list）建立全局视野。

思考：
- 1. 拆解策略推演：当前用户仅打招呼，聚焦目标为资产清单面板（角色2、场景0、道具0）。经验已获取，但项目数据分布未知。按经验第一步，应先装载 script.directory 与 asset.list 探查剧本结构与现有资产状态，建立全局视野后再制定分批计划。
- 2. 当前计划（宏观阶段）：
  [ ] 1. 搜集足够的信息（探查剧本目录结构与现有资产状态）
  [ ] 2. 制定足够清晰的计划并分批实施目标操作
  [ ] 3. 全局验收结案
- 3. 下一步小目标：装载只读探查工具，读取剧本目录与现有资产清单，摸清数据分布。重点笔记：聚焦面板显示角色2个，需确认这2个角色的现有状态与剧本中实际涉及的角色/场景/道具是否匹配。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.directory", "asset.list"]}}}

用户沟通：
- 对用户说的话（简版）：你好！我先摸清剧本和现有资产情况，稍等。
```

### [第 2 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.directory",
    "asset.list"
  ],
  "level": 1
}
```
**工具输出 (Output)**：
```json
{
  "level": 1,
  "tools": [
    "script.directory",
    "asset.list"
  ],
  "prompts": [
    "script",
    "assets"
  ],
  "categories": [
    "script",
    "asset",
    "card",
    "ui"
  ],
  "transition": "enter_execution"
}
```

---
## 第 3 轮（耗时：2791 ms (2.79 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.directory, asset.list, user.ask`
- **Token 与缓存**：Prompt 2222 tokens · 缓存命中 1280 (57.6%) · 输出 251

### [第 3 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“Mira”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前场景输出对用户说的话：常规中间执行轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在调用 sys.endTask 结案汇报、调用 user.ask 向用户提问或无需调工具直接回复时，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与分步读写闭环：
   - 所有写入、修改或生成操作必须基于已读取的真实项目数据或已观察到的页面事实；
   - 多批次任务中，每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中，直接连续调用推进；仅在需补充工具或所有计划步骤全部完成时调用 sys.selectContext。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”还是“已写入落盘完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤仍需引用的关键事实、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已落盘完成，调用 sys.selectContext 返回全局计划阶段）。}
工具调用：
{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
用户沟通：
{
- 对用户说的话（简版）：“口语化介绍当前执行进展或向用户提问，控制在30字以内；注意调用工具不等于完成任务（局部执行阶段默认仅输出简版；仅在调用 user.ask 提问需补充背景依据时才额外输出‘- 对用户说的话（完整版）’）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- sys.selectContext：补充装载工具或退出局部执行返回全局计划阶段（后续步骤如需补充工具可传 {"tools": [...]} 增量合并装载；当前计划步骤全部执行完毕后，直接无参调用 {{调用 sys.selectContext}} 返回全局计划与验收阶段）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- script.directory：分页读取剧本分集与场次目录概览（集号可能跳号或重复，总集数按实际条目统计；可传 episode 如 "第一集"/1 限定目标集，或传 query 按标题/场次/角色筛选，返回各集与各场次的唯一场次 ID（id，如 "scene-39-1953"）、段落数 paragraphCount、正文字数 charCount 以及每轮合批建议上限 recommendedBatchMaxChars；若存在重名场次编号如多个 "1-5"，会标注各自 id 以便精准读取）。
  参数：{ episode?: string | number | Array<string | number>, query?: string, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }

## 候选工具简表
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（附每集/场次字数与单批字数上限建议）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- guide.lookup：查询应用界面操作指南
- page.inspect：观察当前可见界面概览或指定组件区域内容
- card.inspect：查看指定卡片的图像、提示词、参考图及画幅参数
- card.detectLandmarks：对指定卡片画面进行元素空间定位与语义标注
- card.generate：触发生图或对已有卡片执行复刻衍生创建新卡
- ui.actAndObserve：在已观察到的可见目标上执行鼠标动作并返回新界面状态

=== [USER] ===
# 用户指令
## 初始任务指令
你好
## 当前聚焦目标
【当前聚焦目标：资产清单面板 (assets.panel)】
- 角色数量: 2
- 场景数量: 0
- 道具数量: 0

# 认知状态
任务标题：资产清单整理
最终目标：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）
当前计划：[ ] 搜集足够的信息（检索经验 + 展开工具箱分类 + 探查项目数据现状）
[ ] 制定足够清晰的计划并分批实施目标操作
[ ] 全局验收结案
重点笔记：- ① 当前聚焦资产清单面板：角色2个、场景0、道具0；② 已命中经验《剧本角色/场景/道具资产提取与多版本建档经验》；③ 已展开 script/asset/card/ui 四类工具（level=0），并成功装载 script.directory、asset.list 只读探查工具（level=1）；④ 用户仅打招呼，具体意图待确认；⑤ 下一步需实际调用只读工具读取剧本目录与现有资产清单，确认2个角色的现有状态及剧本中实际涉及的角色/场景/道具是否匹配；⑥ 探查完成后再制定分批建档计划。
当前小目标：装载并调用 script.directory 与 asset.list 读取剧本目录结构与现有资产清单，摸清角色/场景/道具数据分布
当前进度：已完成经验检索与工具箱分类展开，并成功装载只读探查工具，但尚未实际读取剧本目录与资产清单，项目数据现状探查未完成。

# 工具执行结果
【工具 sys.selectContext 执行成功】已进入局部执行阶段，当前已装载工具：script.directory, asset.list
```

### [第 3 轮] 模型原始输出
```text
状态检查：
- 当前执行计划第1步“搜集足够的信息”，小目标为读取剧本目录与现有资产清单，摸清数据分布。
- 本轮 sys.selectContext 返回成功，已装载 script.directory 与 asset.list 两个只读探查工具，尚未实际读取任何项目数据。
- 重点笔记：聚焦面板显示角色2个、场景0、道具0；需先读取剧本目录与资产清单，确认现有2个角色状态及剧本实际涉及的角色/场景/道具，再制定建档计划。

思考：
- 现在处于“工具已装载、待读取”状态，应并行调用 script.directory 读取剧本分集场次概览，调用 asset.list 读取现有角色资产，先摸清项目现状。
- 两个读取互不依赖，可同轮发起；读取结果返回后再决定是否需要补充场景/道具查询及后续建档计划。

工具调用：
{{调用 script.directory, {"limit": 50}}}
{{调用 asset.list, {"type": "characters", "limit": 50}}}

用户沟通：
- 对用户说的话（简版）：“我先读取剧本目录和现有角色资产，摸清项目现状～”
```

### [第 3 轮] 工具调用记录（共 2 个）
#### 🛠️ 工具 1：`script.directory` (succeeded)
**工具输入 (Input)**：
```json
{
  "limit": 50
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 40,
  "offset": 0,
  "entries": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 6,
      "paragraphCount": 66,
      "charCount": 4935,
      "scenes": [
        {
          "index": 1,
          "id": "scene-2-4",
          "sceneNumber": "1-1",
          "title": "1-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "玛莉"
          ],
          "paragraphCount": 2,
          "charCount": 122
        },
        {
          "index": 2,
          "id": "scene-8-151",
          "sceneNumber": "1-2",
          "title": "1-2 日 内 医院办公室",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "医院办公室",
          "characterNames": [
            "娜塔莉亚"
          ],
          "paragraphCount": 6,
          "charCount": 494
        },
        {
          "index": 3,
          "id": "scene-17-679",
          "sceneNumber": "1-3",
          "title": "1-3 日 外 贫民窟门口",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "贫民窟门口",
          "characterNames": [
            "小娜塔莉亚（8岁）",
            "小玛莉（姐姐 13岁）",
            "养父",
            "养母"
          ],
          "paragraphCount": 9,
          "charCount": 633
        },
        {
          "index": 4,
          "id": "scene-28-1373",
          "sceneNumber": "1-4",
          "title": "1-4 日 内 医院办公室",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "医院办公室",
          "characterNames": [
            "娜塔莉亚"
          ],
          "paragraphCount": 7,
          "charCount": 544
        },
        {
          "index": 5,
          "id": "scene-39-1953",
          "sceneNumber": "1-5",
          "title": "1-5 日 内 娜塔莉亚家",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "娜塔莉亚家",
          "characterNames": [
            "娜塔莉亚",
            "焦恩"
          ],
          "paragraphCount": 10,
          "charCount": 785
        },
        {
          "index": 6,
          "id": "scene-52-2776",
          "sceneNumber": "1-5",
          "title": "1-5 日 外 布莱克伍德庄园",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "布莱克伍德庄园",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "女佣若干",
            "管家",
            "塞莱特斯"
          ],
          "paragraphCount": 32,
          "charCount": 2357
        }
      ]
    },
    {
      "index": 2,
      "id": "episode-88",
      "number": "二",
      "title": "第二集",
      "sceneCount": 1,
      "paragraphCount": 47,
      "charCount": 2788,
      "scenes": [
        {
          "index": 1,
          "id": "scene-89-5214",
          "sceneNumber": "2-1",
          "title": "2-1 日 外 布莱克伍德庄园",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "布莱克伍德庄园",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "女佣若干",
            "管家",
            "塞莱特斯",
            "戴安娜",
            "女佣"
          ],
          "paragraphCount": 47,
          "charCount": 2788
        }
      ]
    },
    {
      "index": 3,
      "id": "episode-140",
      "number": "三",
      "title": "第三集",
      "sceneCount": 4,
      "paragraphCount": 69,
      "charCount": 3597,
      "scenes": [
        {
          "index": 1,
          "id": "scene-141-8108",
          "sceneNumber": "3-1",
          "title": "3-1 日 外 布莱克伍德庄园",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "布莱克伍德庄园",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "女佣若干",
            "管家",
            "塞莱特斯",
            "戴安娜",
            "女佣"
          ],
          "paragraphCount": 25,
          "charCount": 1429
        },
        {
          "index": 2,
          "id": "scene-170-9617",
          "sceneNumber": "3-2",
          "title": "3-2 日 内 戴安娜的房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "戴安娜的房间",
          "characterNames": [
            "戴安娜",
            "娜塔莉亚"
          ],
          "paragraphCount": 7,
          "charCount": 276
        },
        {
          "index": 3,
          "id": "scene-181-9931",
          "sceneNumber": "3-3",
          "title": "3-3 日 外 花园",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "花园",
          "characterNames": [
            "娜塔莉亚",
            "管家"
          ],
          "paragraphCount": 21,
          "charCount": 1153
        },
        {
          "index": 4,
          "id": "scene-206-11132",
          "sceneNumber": "3-4",
          "title": "3-4 日 内 戴安娜房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "戴安娜房间",
          "characterNames": [
            "戴安娜",
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 16,
          "charCount": 739
        }
      ]
    },
    {
      "index": 4,
      "id": "episode-226",
      "number": "四",
      "title": "第四集",
      "sceneCount": 2,
      "paragraphCount": 40,
      "charCount": 2676,
      "scenes": [
        {
          "index": 1,
          "id": "scene-227-11930",
          "sceneNumber": "4-1",
          "title": "4-1 日 内 戴安娜的房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "戴安娜的房间",
          "characterNames": [
            "戴安娜",
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 32,
          "charCount": 1982
        },
        {
          "index": 2,
          "id": "scene-264-13979",
          "sceneNumber": "4-2",
          "title": "4-2 夜 内 保姆间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "保姆间",
          "characterNames": [
            "娜塔莉亚",
            "戴安娜"
          ],
          "paragraphCount": 8,
          "charCount": 694
        }
      ]
    },
    {
      "index": 5,
      "id": "episode-277",
      "number": "五",
      "title": "第五集",
      "sceneCount": 5,
      "paragraphCount": 43,
      "charCount": 2855,
      "scenes": [
        {
          "index": 1,
          "id": "scene-278-14714",
          "sceneNumber": "5-1",
          "title": "5-1 夜 内 保姆间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "保姆间",
          "characterNames": [
            "娜塔莉亚",
            "戴安娜"
          ],
          "paragraphCount": 7,
          "charCount": 285
        },
        {
          "index": 2,
          "id": "scene-289-15034",
          "sceneNumber": "5-2",
          "title": "5-2 夜 内 书房外",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "书房外",
          "characterNames": [
            "娜塔莉亚",
            "戴安娜"
          ],
          "paragraphCount": 6,
          "charCount": 485
        },
        {
          "index": 3,
          "id": "scene-299-15555",
          "sceneNumber": "5-3",
          "title": "5-3 夜 内 书房内",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "书房内",
          "characterNames": [
            "布拉姆"
          ],
          "paragraphCount": 4,
          "charCount": 330
        },
        {
          "index": 4,
          "id": "scene-307-15916",
          "sceneNumber": "5-4",
          "title": "5-4 夜 内 戴安娜房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "戴安娜房间",
          "characterNames": [
            "戴安娜",
            "娜塔莉亚"
          ],
          "paragraphCount": 22,
          "charCount": 1428
        },
        {
          "index": 5,
          "id": "scene-333-17397",
          "sceneNumber": "5-5",
          "title": "5-5 夜 内 楼梯口",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "楼梯口",
          "characterNames": [
            "安保",
            "娜塔莉亚",
            "管家"
          ],
          "paragraphCount": 4,
          "charCount": 327
        }
      ]
    },
    {
      "index": 6,
      "id": "episode-342",
      "number": "六",
      "title": "第六集",
      "sceneCount": 1,
      "paragraphCount": 24,
      "charCount": 1629,
      "scenes": [
        {
          "index": 1,
          "id": "scene-343-17769",
          "sceneNumber": "6-1",
          "title": "6-1 日 内 餐厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "餐厅",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "塞莱特斯"
          ],
          "paragraphCount": 24,
          "charCount": 1629
        }
      ]
    },
    {
      "index": 7,
      "id": "episode-371",
      "number": "七",
      "title": "第七集",
      "sceneCount": 1,
      "paragraphCount": 36,
      "charCount": 2129,
      "scenes": [
        {
          "index": 1,
          "id": "scene-372-19459",
          "sceneNumber": "7-1",
          "title": "7-1 日 内 餐厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "餐厅",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "塞莱特斯"
          ],
          "paragraphCount": 36,
          "charCount": 2129
        }
      ]
    },
    {
      "index": 8,
      "id": "episode-413",
      "number": "八",
      "title": "第八集",
      "sceneCount": 3,
      "paragraphCount": 51,
      "charCount": 2631,
      "scenes": [
        {
          "index": 1,
          "id": "scene-414-21662",
          "sceneNumber": "8-1",
          "title": "8-1 日 内 戴安娜房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "戴安娜房间",
          "characterNames": [
            "戴安娜",
            "娜塔莉亚"
          ],
          "paragraphCount": 25,
          "charCount": 1266
        },
        {
          "index": 2,
          "id": "scene-442-22983",
          "sceneNumber": "8-2",
          "title": "8-2 日 内 平民屋老房子",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "平民屋老房子",
          "characterNames": [
            "玛莉",
            "娜塔莉亚"
          ],
          "paragraphCount": 7,
          "charCount": 394
        },
        {
          "index": 3,
          "id": "scene-454-23414",
          "sceneNumber": "8-3",
          "title": "8-3 夜 内 走廊 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "走廊 地下室",
          "characterNames": [
            "娜塔莉亚",
            "塞莱特斯"
          ],
          "paragraphCount": 19,
          "charCount": 971
        }
      ]
    },
    {
      "index": 9,
      "id": "episode-477",
      "number": "九",
      "title": "第九集",
      "sceneCount": 1,
      "paragraphCount": 22,
      "charCount": 1678,
      "scenes": [
        {
          "index": 1,
          "id": "scene-478-24441",
          "sceneNumber": "9-1",
          "title": "9-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "娜塔莉亚",
            "塞莱特斯"
          ],
          "paragraphCount": 22,
          "charCount": 1678
        }
      ]
    },
    {
      "index": 10,
      "id": "episode-505",
      "number": "十",
      "title": "第十集",
      "sceneCount": 1,
      "paragraphCount": 27,
      "charCount": 2155,
      "scenes": [
        {
          "index": 1,
          "id": "scene-506-26176",
          "sceneNumber": "10-1",
          "title": "10-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "娜塔莉亚",
            "塞莱特斯",
            "布拉姆",
            "安保若干"
          ],
          "paragraphCount": 27,
          "charCount": 2155
        }
      ]
    },
    {
      "index": 11,
      "id": "episode-538",
      "number": "十一",
      "title": "第十一集",
      "sceneCount": 1,
      "paragraphCount": 17,
      "charCount": 929,
      "scenes": [
        {
          "index": 1,
          "id": "scene-539-28407",
          "sceneNumber": "11-1",
          "title": "11-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "娜塔莉亚",
            "塞莱特斯",
            "布拉姆",
            "安保若干"
          ],
          "paragraphCount": 17,
          "charCount": 929
        }
      ]
    },
    {
      "index": 12,
      "id": "episode-561",
      "number": "十二",
      "title": "第十二集",
      "sceneCount": 1,
      "paragraphCount": 20,
      "charCount": 1567,
      "scenes": [
        {
          "index": 1,
          "id": "scene-562-29402",
          "sceneNumber": "12-1",
          "title": "12-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "娜塔莉亚",
            "塞莱特斯",
            "布拉姆",
            "安保若干"
          ],
          "paragraphCount": 20,
          "charCount": 1567
        }
      ]
    },
    {
      "index": 13,
      "id": "episode-586",
      "number": "十三",
      "title": "第十三集",
      "sceneCount": 3,
      "paragraphCount": 48,
      "charCount": 3092,
      "scenes": [
        {
          "index": 1,
          "id": "scene-587-31037",
          "sceneNumber": "13-1",
          "title": "13-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "安保若干"
          ],
          "paragraphCount": 31,
          "charCount": 2162
        },
        {
          "index": 2,
          "id": "scene-621-33267",
          "sceneNumber": "13-2",
          "title": "13-2 （衔接10-1）",
          "locationName": "（衔接10-1）",
          "characterNames": [
            "娜塔莉亚",
            "塞莱特斯"
          ],
          "paragraphCount": 9,
          "charCount": 549
        },
        {
          "index": 3,
          "id": "scene-632-33856",
          "sceneNumber": "13-2",
          "title": "13-2 夜 内 塞莱特斯房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯房间",
          "characterNames": [
            "塞莱特斯",
            "布拉姆"
          ],
          "paragraphCount": 8,
          "charCount": 381
        }
      ]
    },
    {
      "index": 14,
      "id": "episode-645",
      "number": "十四",
      "title": "第十四集",
      "sceneCount": 2,
      "paragraphCount": 24,
      "charCount": 1494,
      "scenes": [
        {
          "index": 1,
          "id": "scene-646-34283",
          "sceneNumber": "14-1",
          "title": "14-1 夜 内 塞莱特斯房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯房间",
          "characterNames": [
            "塞莱特斯",
            "布拉姆"
          ],
          "paragraphCount": 21,
          "charCount": 1398
        },
        {
          "index": 2,
          "id": "scene-670-35733",
          "sceneNumber": "14-2",
          "title": "14-2 夜 内 走廊",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "走廊",
          "characterNames": [
            "娜塔莉"
          ],
          "paragraphCount": 3,
          "charCount": 96
        }
      ]
    },
    {
      "index": 15,
      "id": "episode-678",
      "number": "十五",
      "title": "第十五集",
      "sceneCount": 1,
      "paragraphCount": 22,
      "charCount": 1204,
      "scenes": [
        {
          "index": 1,
          "id": "scene-679-35861",
          "sceneNumber": "15-1",
          "title": "15-1 夜 内 塞莱特斯房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯房间",
          "characterNames": [
            "塞莱特斯",
            "布拉姆"
          ],
          "paragraphCount": 22,
          "charCount": 1204
        }
      ]
    },
    {
      "index": 16,
      "id": "episode-706",
      "number": "十六",
      "title": "第十六集",
      "sceneCount": 1,
      "paragraphCount": 24,
      "charCount": 1286,
      "scenes": [
        {
          "index": 1,
          "id": "scene-707-37125",
          "sceneNumber": "16-1",
          "title": "16-1 夜 内 走廊",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "走廊",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 24,
          "charCount": 1286
        }
      ]
    },
    {
      "index": 17,
      "id": "episode-736",
      "number": "十七",
      "title": "第十七集",
      "sceneCount": 1,
      "paragraphCount": 22,
      "charCount": 1250,
      "scenes": [
        {
          "index": 1,
          "id": "scene-737-38472",
          "sceneNumber": "17-1",
          "title": "17-1 夜 内 走廊",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "走廊",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 22,
          "charCount": 1250
        }
      ]
    },
    {
      "index": 18,
      "id": "episode-764",
      "number": "十八",
      "title": "第十八集",
      "sceneCount": 2,
      "paragraphCount": 35,
      "charCount": 1465,
      "scenes": [
        {
          "index": 1,
          "id": "scene-765-39781",
          "sceneNumber": "18-1",
          "title": "18-1 夜 内 戴安娜房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "戴安娜房间",
          "characterNames": [
            "戴安娜",
            "娜塔莉亚"
          ],
          "paragraphCount": 14,
          "charCount": 645
        },
        {
          "index": 2,
          "id": "scene-782-40473",
          "sceneNumber": "18-2",
          "title": "18-2 日 内 走廊",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "走廊",
          "characterNames": [
            "娜塔莉亚",
            "女佣",
            "布拉姆"
          ],
          "paragraphCount": 21,
          "charCount": 820
        }
      ]
    },
    {
      "index": 19,
      "id": "episode-808",
      "number": "十九",
      "title": "第十九集",
      "sceneCount": 2,
      "paragraphCount": 42,
      "charCount": 2232,
      "scenes": [
        {
          "index": 1,
          "id": "scene-809-41353",
          "sceneNumber": "19-1",
          "title": "19-1 日 内 走廊",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "走廊",
          "characterNames": [
            "娜塔莉亚",
            "女佣",
            "布拉姆"
          ],
          "paragraphCount": 17,
          "charCount": 856
        },
        {
          "index": 2,
          "id": "scene-829-42258",
          "sceneNumber": "18-2",
          "title": "18-2 日 内 塞莱特斯房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "塞莱特斯房间",
          "characterNames": [
            "塞莱特斯",
            "女佣"
          ],
          "paragraphCount": 25,
          "charCount": 1376
        }
      ]
    },
    {
      "index": 20,
      "id": "episode-859",
      "number": "二十",
      "title": "第二十集",
      "sceneCount": 3,
      "paragraphCount": 40,
      "charCount": 2292,
      "scenes": [
        {
          "index": 1,
          "id": "scene-860-43695",
          "sceneNumber": "20-1",
          "title": "20-1 日 内 塞莱特斯房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "塞莱特斯房间",
          "characterNames": [
            "布拉姆",
            "塞莱特斯",
            "管家"
          ],
          "paragraphCount": 7,
          "charCount": 522
        },
        {
          "index": 2,
          "id": "scene-870-44259",
          "sceneNumber": "20-2",
          "title": "20-2 日 内 宴会厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "宴会厅",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚",
            "塞莱特斯",
            "戴安娜",
            "宾客若干",
            "莱恩",
            "伊丽莎白"
          ],
          "paragraphCount": 29,
          "charCount": 1547
        },
        {
          "index": 3,
          "id": "scene-902-45893",
          "sceneNumber": "20-3",
          "title": "20-3 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 4,
          "charCount": 223
        }
      ]
    },
    {
      "index": 21,
      "id": "episode-911",
      "number": "二十一",
      "title": "第二十一集",
      "sceneCount": 3,
      "paragraphCount": 26,
      "charCount": 1544,
      "scenes": [
        {
          "index": 1,
          "id": "scene-912-46160",
          "sceneNumber": "21-1",
          "title": "21-1 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 5,
          "charCount": 384
        },
        {
          "index": 2,
          "id": "scene-920-46581",
          "sceneNumber": "21-2",
          "title": "21-2 日 内 宴会厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "宴会厅",
          "characterNames": [
            "塞莱特斯",
            "宾客若干",
            "莱恩",
            "伊丽莎白"
          ],
          "paragraphCount": 9,
          "charCount": 546
        },
        {
          "index": 3,
          "id": "scene-932-47179",
          "sceneNumber": "21-3",
          "title": "21-3 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "塞莱特斯",
            "宾客若干",
            "莱恩",
            "伊丽莎白",
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 12,
          "charCount": 614
        }
      ]
    },
    {
      "index": 22,
      "id": "episode-949",
      "number": "二十二",
      "title": "第二十二集",
      "sceneCount": 2,
      "paragraphCount": 27,
      "charCount": 1329,
      "scenes": [
        {
          "index": 1,
          "id": "scene-950-47869",
          "sceneNumber": "22-1",
          "title": "22-1 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "塞莱特斯",
            "宾客若干",
            "莱恩",
            "伊丽莎白",
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 4,
          "charCount": 103
        },
        {
          "index": 2,
          "id": "scene-956-48032",
          "sceneNumber": "22-2",
          "title": "22-2 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 23,
          "charCount": 1226
        }
      ]
    },
    {
      "index": 23,
      "id": "episode-985",
      "number": "二十三",
      "title": "第二十三集",
      "sceneCount": 1,
      "paragraphCount": 38,
      "charCount": 2214,
      "scenes": [
        {
          "index": 1,
          "id": "scene-986-49321",
          "sceneNumber": "23-1",
          "title": "23-1 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "塞莱特斯",
            "宾客若干",
            "莱恩",
            "伊丽莎白",
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 38,
          "charCount": 2214
        }
      ]
    },
    {
      "index": 24,
      "id": "episode-1029",
      "number": "二十四",
      "title": "第二十四集",
      "sceneCount": 2,
      "paragraphCount": 25,
      "charCount": 2078,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1030-51638",
          "sceneNumber": "24-1",
          "title": "24-1 日 内 布拉姆房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "布拉姆房间",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 13,
          "charCount": 898
        },
        {
          "index": 2,
          "id": "scene-1046-52581",
          "sceneNumber": "24-2",
          "title": "24-2 日 外 花园",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "花园",
          "characterNames": [
            "莱恩",
            "伊丽莎白",
            "塞莱特斯",
            "布拉姆",
            "管家"
          ],
          "paragraphCount": 12,
          "charCount": 1180
        }
      ]
    },
    {
      "index": 25,
      "id": "episode-1063",
      "number": "二十五",
      "title": "第二十五集",
      "sceneCount": 1,
      "paragraphCount": 20,
      "charCount": 1605,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1064-53824",
          "sceneNumber": "25-1",
          "title": "25-1 夜 内 宴会厅门口",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "宴会厅门口",
          "characterNames": [
            "塞莱特斯",
            "伊丽莎白",
            "下人若干",
            "莱恩",
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 20,
          "charCount": 1605
        }
      ]
    },
    {
      "index": 26,
      "id": "episode-1089",
      "number": "二十六",
      "title": "第二十六集",
      "sceneCount": 2,
      "paragraphCount": 17,
      "charCount": 1340,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1090-55510",
          "sceneNumber": "26-1",
          "title": "26-1 夜 内 宴会厅 走廊",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "宴会厅 走廊",
          "characterNames": [
            "塞莱特斯",
            "下人若干",
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 6,
          "charCount": 408
        },
        {
          "index": 2,
          "id": "scene-1099-55970",
          "sceneNumber": "26-2",
          "title": "26-2 夜 内 塞莱特斯房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯房间",
          "characterNames": [
            "女佣",
            "布拉姆",
            "塞莱特斯"
          ],
          "paragraphCount": 11,
          "charCount": 932
        }
      ]
    },
    {
      "index": 27,
      "id": "episode-1115",
      "number": "二十七",
      "title": "第二十七集",
      "sceneCount": 1,
      "paragraphCount": 46,
      "charCount": 2080,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1116-56961",
          "sceneNumber": "27-1",
          "title": "27-1 夜 内 塞莱特斯房间 走廊",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯房间 走廊",
          "characterNames": [
            "女佣",
            "布拉姆",
            "塞莱特斯",
            "娜塔莉亚",
            "戴安娜"
          ],
          "paragraphCount": 46,
          "charCount": 2080
        }
      ]
    },
    {
      "index": 28,
      "id": "episode-1167",
      "number": "二十八",
      "title": "第二十八集",
      "sceneCount": 3,
      "paragraphCount": 34,
      "charCount": 1196,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1168-59148",
          "sceneNumber": "28-1",
          "title": "28-1 夜 内 塞莱特斯房间 走廊",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯房间 走廊",
          "characterNames": [
            "女佣",
            "布拉姆",
            "塞莱特斯",
            "娜塔莉亚",
            "戴安娜"
          ],
          "paragraphCount": 11,
          "charCount": 358
        },
        {
          "index": 2,
          "id": "scene-1182-59570",
          "sceneNumber": "28-2",
          "title": "28-2 夜 内 戴安娜房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "戴安娜房间",
          "characterNames": [
            "戴安娜",
            "医生",
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 19,
          "charCount": 687
        },
        {
          "index": 3,
          "id": "scene-1204-60317",
          "sceneNumber": "28-4",
          "title": "28-4 夜 内 地下室门口",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室门口",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚"
          ],
          "paragraphCount": 4,
          "charCount": 151
        }
      ]
    },
    {
      "index": 29,
      "id": "episode-1214",
      "number": "二十九",
      "title": "第二十九集",
      "sceneCount": 1,
      "paragraphCount": 29,
      "charCount": 1790,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1215-60513",
          "sceneNumber": "29-1",
          "title": "29-1 夜 内 收藏室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "收藏室",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 29,
          "charCount": 1790
        }
      ]
    },
    {
      "index": 30,
      "id": "episode-1249",
      "number": "三十",
      "title": "第三十集",
      "sceneCount": 2,
      "paragraphCount": 27,
      "charCount": 1649,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1250-62371",
          "sceneNumber": "30-1",
          "title": "30-1 夜 内 画室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "画室",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆"
          ],
          "paragraphCount": 18,
          "charCount": 1240
        },
        {
          "index": 2,
          "id": "scene-1271-63657",
          "sceneNumber": "30-2",
          "title": "30-2 日 内 餐厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "餐厅",
          "characterNames": [
            "女佣",
            "娜塔莉亚",
            "塞莱特斯",
            "布拉姆",
            "女佣"
          ],
          "paragraphCount": 9,
          "charCount": 409
        }
      ]
    },
    {
      "index": 31,
      "id": "episode-1285",
      "number": "三十一",
      "title": "第三十一集",
      "sceneCount": 2,
      "paragraphCount": 23,
      "charCount": 1138,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1286-64123",
          "sceneNumber": "31-1",
          "title": "31-1 日 内 餐厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "餐厅",
          "characterNames": [
            "女佣",
            "娜塔莉亚",
            "塞莱特斯",
            "布拉姆"
          ],
          "paragraphCount": 21,
          "charCount": 1065
        },
        {
          "index": 2,
          "id": "scene-1310-65246",
          "sceneNumber": "31-2",
          "title": "31-2 夜 内 塞莱特斯的房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯的房间",
          "characterNames": [
            "塞莱特斯",
            "布拉姆"
          ],
          "paragraphCount": 2,
          "charCount": 73
        }
      ]
    },
    {
      "index": 32,
      "id": "episode-1317",
      "number": "三十二",
      "title": "第三十二集",
      "sceneCount": 1,
      "paragraphCount": 21,
      "charCount": 1682,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1318-65363",
          "sceneNumber": "32-1",
          "title": "32-1 夜 内 塞莱特斯的房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯的房间",
          "characterNames": [
            "塞莱特斯",
            "布拉姆"
          ],
          "paragraphCount": 21,
          "charCount": 1682
        }
      ]
    },
    {
      "index": 33,
      "id": "episode-1344",
      "number": "三十三",
      "title": "第三十三集",
      "sceneCount": 2,
      "paragraphCount": 31,
      "charCount": 1879,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1345-67108",
          "sceneNumber": "33-1",
          "title": "33-1 夜 内 塞莱特斯的房间",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "塞莱特斯的房间",
          "characterNames": [
            "娜塔莉亚",
            "布拉姆",
            "塞莱特斯"
          ],
          "paragraphCount": 7,
          "charCount": 585
        },
        {
          "index": 2,
          "id": "scene-1355-67739",
          "sceneNumber": "33-2",
          "title": "33-2 日 内 别墅走廊",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "别墅走廊",
          "characterNames": [
            "女佣",
            "布拉姆",
            "塞莱特斯",
            "娜塔莉亚"
          ],
          "paragraphCount": 24,
          "charCount": 1294
        }
      ]
    },
    {
      "index": 34,
      "id": "episode-1384",
      "number": "三十四",
      "title": "第三十四集",
      "sceneCount": 2,
      "paragraphCount": 27,
      "charCount": 1290,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1385-69104",
          "sceneNumber": "34-1",
          "title": "34-1 日 内 别墅走廊",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "别墅走廊",
          "characterNames": [
            "女佣",
            "布拉姆",
            "塞莱特斯",
            "娜塔莉亚"
          ],
          "paragraphCount": 19,
          "charCount": 892
        },
        {
          "index": 2,
          "id": "scene-1407-70054",
          "sceneNumber": "34-2",
          "title": "34-2 夜 外 海边",
          "type": "EXT",
          "timeOfDay": "夜",
          "locationName": "海边",
          "characterNames": [
            "布拉姆",
            "娜塔莉亚",
            "塞莱特斯",
            "神秘人"
          ],
          "paragraphCount": 8,
          "charCount": 398
        }
      ]
    },
    {
      "index": 35,
      "id": "episode-1420",
      "number": "三十五",
      "title": "第三十五集",
      "sceneCount": 1,
      "paragraphCount": 31,
      "charCount": 1683,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1421-70507",
          "sceneNumber": "35-1",
          "title": "35-1 夜 内 庄园客厅",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "庄园客厅",
          "characterNames": [
            "伊丽莎白",
            "莱恩",
            "娜塔莉亚",
            "布拉姆",
            "佣人安保若干",
            "女佣",
            "安保",
            "塞莱特斯",
            "神秘人（娜塔莉亚养父：焦恩）"
          ],
          "paragraphCount": 31,
          "charCount": 1683
        }
      ]
    },
    {
      "index": 36,
      "id": "episode-1457",
      "number": "三十六",
      "title": "第三十六集",
      "sceneCount": 1,
      "paragraphCount": 33,
      "charCount": 1442,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1458-72311",
          "sceneNumber": "36-1",
          "title": "36-1 夜 内 庄园客厅",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "庄园客厅",
          "characterNames": [
            "伊丽莎白",
            "莱恩",
            "娜塔莉亚",
            "布拉姆",
            "佣人安保若干",
            "女佣",
            "安保",
            "塞莱特斯",
            "神秘人（娜塔莉亚养父：焦恩）"
          ],
          "paragraphCount": 33,
          "charCount": 1442
        }
      ]
    },
    {
      "index": 37,
      "id": "episode-1496",
      "number": "三十七",
      "title": "第三十七集",
      "sceneCount": 2,
      "paragraphCount": 17,
      "charCount": 1029,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1497-73876",
          "sceneNumber": "37-1",
          "title": "37-1 夜 内 庄园客厅",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "庄园客厅",
          "characterNames": [
            "伊丽莎白",
            "莱恩",
            "娜塔莉亚",
            "布拉姆",
            "佣人安保若干",
            "女佣",
            "安保",
            "塞莱特斯",
            "神秘人（娜塔莉亚养父：焦恩）"
          ],
          "paragraphCount": 12,
          "charCount": 821
        },
        {
          "index": 2,
          "id": "scene-1512-74792",
          "sceneNumber": "37-2",
          "title": "37-2 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "伊丽莎白",
            "莱恩",
            "娜塔莉亚",
            "布拉姆",
            "佣人安保若干",
            "女佣",
            "安保",
            "塞莱特斯",
            "神秘人（娜塔莉亚养父：焦恩）",
            "玛莉"
          ],
          "paragraphCount": 5,
          "charCount": 208
        }
      ]
    },
    {
      "index": 38,
      "id": "episode-1522",
      "number": "三十八",
      "title": "第三十八集",
      "sceneCount": 1,
      "paragraphCount": 34,
      "charCount": 1990,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1523-75095",
          "sceneNumber": "38-1",
          "title": "38-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "伊丽莎白",
            "莱恩",
            "娜塔莉亚",
            "布拉姆",
            "佣人安保若干",
            "女佣",
            "安保",
            "塞莱特斯",
            "神秘人（娜塔莉亚养父：焦恩）"
          ],
          "paragraphCount": 34,
          "charCount": 1990
        }
      ]
    },
    {
      "index": 39,
      "id": "episode-1562",
      "number": "三十九",
      "title": "第三十九集",
      "sceneCount": 1,
      "paragraphCount": 32,
      "charCount": 2459,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1563-77206",
          "sceneNumber": "39-1",
          "title": "39-1 夜 内 地下室",
          "type": "INT",
          "timeOfDay": "夜",
          "locationName": "地下室",
          "characterNames": [
            "伊丽莎白",
            "莱恩",
            "娜塔莉亚",
            "布拉姆",
            "佣人安保若干",
            "女佣",
            "安保",
            "塞莱特斯",
            "神秘人（娜塔莉亚养父：焦恩）"
          ],
          "paragraphCount": 32,
          "charCount": 2459
        }
      ]
    },
    {
      "index": 40,
      "id": "episode-1600",
      "number": "四十",
      "title": "第四十集",
      "sceneCount": 2,
      "paragraphCount": 46,
      "charCount": 2212,
      "scenes": [
        {
          "index": 1,
          "id": "scene-1601-79783",
          "sceneNumber": "40-1",
          "title": "40-1 日 内 戴安娜的房间",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "戴安娜的房间",
          "characterNames": [
            "娜塔莉亚",
            "戴安娜",
            "玛莉"
          ],
          "paragraphCount": 22,
          "charCount": 933
        },
        {
          "index": 2,
          "id": "scene-1626-80773",
          "sceneNumber": "40-2",
          "title": "40-2 日 内 庄园客厅",
          "type": "INT",
          "timeOfDay": "日",
          "locationName": "庄园客厅",
          "characterNames": [
            "塞莱特斯",
            "娜塔莉亚",
            "戴安娜",
            "佛西",
            "焦恩",
            "玛莉"
          ],
          "paragraphCount": 24,
          "charCount": 1279
        }
      ]
    }
  ],
  "nextOffset": null,
  "totalScenes": 75,
  "totalParagraphs": 1303,
  "totalChars": 77513,
  "recommendedBatchMaxChars": 2500,
  "scenesSummary": [
    "1-1 夜 内 地下室 (2段/122字)",
    "1-2 日 内 医院办公室 (6段/494字)",
    "1-3 日 外 贫民窟门口 (9段/633字)",
    "1-4 日 内 医院办公室 (7段/544字)",
    "1-5 日 内 娜塔莉亚家 [id: scene-39-1953] (10段/785字)",
    "1-5 日 外 布莱克伍德庄园 [id: scene-52-2776] (32段/2357字)",
    "2-1 日 外 布莱克伍德庄园 (47段/2788字)",
    "3-1 日 外 布莱克伍德庄园 (25段/1429字)",
    "3-2 日 内 戴安娜的房间 (7段/276字)",
    "3-3 日 外 花园 (21段/1153字)",
    "3-4 日 内 戴安娜房间 (16段/739字)",
    "4-1 日 内 戴安娜的房间 (32段/1982字)",
    "4-2 夜 内 保姆间 (8段/694字)",
    "5-1 夜 内 保姆间 (7段/285字)",
    "5-2 夜 内 书房外 (6段/485字)",
    "5-3 夜 内 书房内 (4段/330字)",
    "5-4 夜 内 戴安娜房间 (22段/1428字)",
    "5-5 夜 内 楼梯口 (4段/327字)",
    "6-1 日 内 餐厅 (24段/1629字)",
    "7-1 日 内 餐厅 (36段/2129字)",
    "8-1 日 内 戴安娜房间 (25段/1266字)",
    "8-2 日 内 平民屋老房子 (7段/394字)",
    "8-3 夜 内 走廊 地下室 (19段/971字)",
    "9-1 夜 内 地下室 (22段/1678字)",
    "10-1 夜 内 地下室 (27段/2155字)",
    "11-1 夜 内 地下室 (17段/929字)",
    "12-1 夜 内 地下室 (20段/1567字)",
    "13-1 夜 内 地下室 (31段/2162字)",
    "13-2 （衔接10-1） [id: scene-621-33267] (9段/549字)",
    "13-2 夜 内 塞莱特斯房间 [id: scene-632-33856] (8段/381字)",
    "14-1 夜 内 塞莱特斯房间 (21段/1398字)",
    "14-2 夜 内 走廊 (3段/96字)",
    "15-1 夜 内 塞莱特斯房间 (22段/1204字)",
    "16-1 夜 内 走廊 (24段/1286字)",
    "17-1 夜 内 走廊 (22段/1250字)",
    "18-1 夜 内 戴安娜房间 (14段/645字)",
    "18-2 日 内 走廊 [id: scene-782-40473] (21段/820字)",
    "19-1 日 内 走廊 (17段/856字)",
    "18-2 日 内 塞莱特斯房间 [id: scene-829-42258] (25段/1376字)",
    "20-1 日 内 塞莱特斯房间 (7段/522字)",
    "20-2 日 内 宴会厅 (29段/1547字)",
    "20-3 日 内 布拉姆房间 (4段/223字)",
    "21-1 日 内 布拉姆房间 (5段/384字)",
    "21-2 日 内 宴会厅 (9段/546字)",
    "21-3 日 内 布拉姆房间 (12段/614字)",
    "22-1 日 内 布拉姆房间 (4段/103字)",
    "22-2 日 内 布拉姆房间 (23段/1226字)",
    "23-1 日 内 布拉姆房间 (38段/2214字)",
    "24-1 日 内 布拉姆房间 (13段/898字)",
    "24-2 日 外 花园 (12段/1180字)",
    "25-1 夜 内 宴会厅门口 (20段/1605字)",
    "26-1 夜 内 宴会厅 走廊 (6段/408字)",
    "26-2 夜 内 塞莱特斯房间 (11段/932字)",
    "27-1 夜 内 塞莱特斯房间 走廊 (46段/2080字)",
    "28-1 夜 内 塞莱特斯房间 走廊 (11段/358字)",
    "28-2 夜 内 戴安娜房间 (19段/687字)",
    "28-4 夜 内 地下室门口 (4段/151字)",
    "29-1 夜 内 收藏室 (29段/1790字)",
    "30-1 夜 内 画室 (18段/1240字)",
    "30-2 日 内 餐厅 (9段/409字)",
    "31-1 日 内 餐厅 (21段/1065字)",
    "31-2 夜 内 塞莱特斯的房间 (2段/73字)",
    "32-1 夜 内 塞莱特斯的房间 (21段/1682字)",
    "33-1 夜 内 塞莱特斯的房间 (7段/585字)",
    "33-2 日 内 别墅走廊 (24段/1294字)",
    "34-1 日 内 别墅走廊 (19段/892字)",
    "34-2 夜 外 海边 (8段/398字)",
    "35-1 夜 内 庄园客厅 (31段/1683字)",
    "36-1 夜 内 庄园客厅 (33段/1442字)",
    "37-1 夜 内 庄园客厅 (12段/821字)",
    "37-2 夜 内 地下室 (5段/208字)",
    "38-1 夜 内 地下室 (34段/1990字)",
    "39-1 夜 内 地下室 (32段/2459字)",
    "40-1 日 内 戴安娜的房间 (22段/933字)",
    "40-2 日 内 庄园客厅 (24段/1279字)"
  ],
  "duplicateSceneNumbers": [
    "1-5",
    "13-2",
    "18-2"
  ],
  "hasVolumeWarning": true,
  "notice": "我发现当前剧集目录包含 75 个场次共 1303 个段落（正文约 77513 字），内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议按场次或集数分批拆分为多轮计划处理，每轮合批读取处理的总字数建议不超过 2500 字（若单场本身超过 2500 字可单独作为一轮或按段落区间分段）。 注：目录存在重名场次编号（1-5、13-2、18-2），调用 script.read 精准读取单个子场次时请传唯一 id（如 \"scene-39-1953\"（1-5 日 内 娜塔莉亚家） / \"scene-52-2776\"（1-5 日 外 布莱克伍德庄园））或带地点/内外景的标识（如 \"1-5内\" / \"1-5外\"），勿只传未区分的 \"1-5\"。",
  "warning": "我发现当前剧集目录包含 75 个场次共 1303 个段落（正文约 77513 字），内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议按场次或集数分批拆分为多轮计划处理，每轮合批读取处理的总字数建议不超过 2500 字（若单场本身超过 2500 字可单独作为一轮或按段落区间分段）。 注：目录存在重名场次编号（1-5、13-2、18-2），调用 script.read 精准读取单个子场次时请传唯一 id（如 \"scene-39-1953\"（1-5 日 内 娜塔莉亚家） / \"scene-52-2776\"（1-5 日 外 布莱克伍德庄园））或带地点/内外景的标识（如 \"1-5内\" / \"1-5外\"），勿只传未区分的 \"1-5\"。",
  "autoReturnedToLevel0": true
}
```
#### 🛠️ 工具 2：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "characters",
  "limit": 50
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "type": "characters",
  "total": 2,
  "offset": 0,
  "items": [
    {
      "id": "char_1794652576078_d31r5_0",
      "name": "娜塔莉亚",
      "role": "心理医生（主角）",
      "description": "第一集核心角色，22岁心理医生。首次出场于1-2医院办公室，独自面对姐姐玛莉留下的血书与受虐照片，悲痛欲绝。姐姐玛莉幼年将收养机会让给她，二人约定重逢；成年后娜塔莉亚发现姐姐遭布莱克伍德家族折磨，决心潜入该家族营救姐姐。8岁前在贫民窟与姐姐相依为命，被养父母收养。",
      "appearance": "22岁成年女性，心理医生；第一集医院办公室场景中坐在椅子上捏着照片、握信落泪，未描写具体服饰。",
      "versions": [
        {
          "id": "char_1794652576078_d31r5_0",
          "name": "常服",
          "description": "第一集核心角色，22岁心理医生。首次出场于1-2医院办公室，独自面对姐姐玛莉留下的血书与受虐照片，悲痛欲绝。姐姐玛莉幼年将收养机会让给她，二人约定重逢；成年后娜塔莉亚发现姐姐遭布莱克伍德家族折磨，决心潜入该家族营救姐姐。8岁前在贫民窟与姐姐相依为命，被养父母收养。",
          "role": "心理医生（主角）",
          "appearance": "22岁成年女性，心理医生；第一集医院办公室场景中坐在椅子上捏着照片、握信落泪，未描写具体服饰。",
          "sourceScenes": [
            "第一集 1-2 日  内   医院办公室",
            "第一集 1-4 日  内   医院办公室"
          ],
          "provenanceStatus": "verified",
          "verifiedProvenance": [
            {
              "id": "vp_char_1794652576078_d31r5_0_para_2_193",
              "sceneId": "sc-7-151",
              "sceneTitle": "第一集 1-2 日  内   医院办公室",
              "matchedTerm": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]",
              "evidenceText": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]",
              "anchorText": "to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 193,
              "lineNumber": 12
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_para_4_526",
              "sceneId": "sc-7-151",
              "sceneTitle": "第一集 1-2 日  内   医院办公室",
              "matchedTerm": "▲娜塔莉亚死死握着书信，眼泪落在照片上。",
              "evidenceText": "▲娜塔莉亚死死握着书信，眼泪落在照片上。",
              "anchorText": "is hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 526,
              "lineNumber": 14
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_para_5_547",
              "sceneId": "sc-7-151",
              "sceneTitle": "第一集 1-2 日  内   医院办公室",
              "matchedTerm": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
              "evidenceText": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
              "anchorText": "握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 547,
              "lineNumber": 15
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_para_1_1401",
              "sceneId": "sc-27-1373",
              "sceneTitle": "第一集 1-4 日  内   医院办公室",
              "matchedTerm": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。",
              "evidenceText": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。",
              "anchorText": "公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1401,
              "lineNumber": 31
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_para_3_1636",
              "sceneId": "sc-27-1373",
              "sceneTitle": "第一集 1-4 日  内   医院办公室",
              "matchedTerm": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。",
              "evidenceText": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。",
              "anchorText": "ent through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（He",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1636,
              "lineNumber": 33
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_para_6_1726",
              "sceneId": "sc-27-1373",
              "sceneTitle": "第一集 1-4 日  内   医院办公室",
              "matchedTerm": "▲娜塔莉亚死死盯着那段小字。",
              "evidenceText": "▲娜塔莉亚死死盯着那段小字。",
              "anchorText": "救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1726,
              "lineNumber": 36
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_para_7_1741",
              "sceneId": "sc-27-1373",
              "sceneTitle": "第一集 1-4 日  内   医院办公室",
              "matchedTerm": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
              "evidenceText": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
              "anchorText": "娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1741,
              "lineNumber": 37
            }
          ],
          "verifiedScriptHash": "82128:gpb4h7"
        },
        {
          "id": "char_1794652576078_d31r5_0_charv_1",
          "name": "8岁幼年",
          "description": "娜塔莉亚8岁时的幼年形象，与姐姐小玛莉在贫民窟门口，被养父母收养，与姐姐分离。",
          "appearance": "8岁小女孩，穿着破烂的衣服，趴在养父肩膀上，落泪伸手想抓住姐姐。",
          "aliases": [
            "小娜塔莉亚"
          ],
          "verifiedProvenance": [
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_1_para_1_731",
              "sceneId": "sc-16-679",
              "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
              "matchedTerm": "▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。",
              "evidenceText": "▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。",
              "anchorText": " 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 731,
              "lineNumber": 19
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_1_para_3_853",
              "sceneId": "sc-16-679",
              "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
              "matchedTerm": "▲小玛莉一把将小娜塔莉亚推向了养父。",
              "evidenceText": "▲小玛莉一把将小娜塔莉亚推向了养父。",
              "anchorText": "one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 853,
              "lineNumber": 21
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_1_para_6_1022",
              "sceneId": "sc-16-679",
              "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
              "matchedTerm": "▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。",
              "evidenceText": "▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。",
              "anchorText": "d home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1022,
              "lineNumber": 24
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_1_para_8_1348",
              "sceneId": "sc-16-679",
              "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
              "matchedTerm": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
              "evidenceText": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
              "anchorText": "n someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1348,
              "lineNumber": 26
            }
          ],
          "provenanceStatus": "verified",
          "verifiedScriptHash": "82128:gpb4h7",
          "sourceScenes": [
            "第一集 1-3 贫民窟门口   日   外"
          ]
        },
        {
          "id": "char_1794652576078_d31r5_0_charv_2",
          "name": "居家日常",
          "description": "娜塔莉亚在家中收拾行李、与养父焦恩对话时的居家造型，准备前往布莱克伍德庄园应聘。",
          "appearance": "居家日常装束，收拾皮包、将衣物放入包中；握拳、看向镜中自己的脸，神情坚定。",
          "aliases": [
            "娜塔莉娅"
          ],
          "verifiedProvenance": [
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_1_1981",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "▲娜塔莉娅在收拾皮包，将衣物放进去。",
              "evidenceText": "▲娜塔莉娅在收拾皮包，将衣物放进去。",
              "anchorText": "家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1981,
              "lineNumber": 42
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_2_2000",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]",
              "evidenceText": "焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]",
              "anchorText": "在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2000,
              "lineNumber": 43
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_3_2306",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "▲娜塔莉亚握住了焦恩的手，坚定开口。",
              "evidenceText": "▲娜塔莉亚握住了焦恩的手，坚定开口。",
              "anchorText": "oster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2306,
              "lineNumber": 44
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_4_2325",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)",
              "evidenceText": "娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)",
              "anchorText": "握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2325,
              "lineNumber": 45
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_5_2450",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。",
              "evidenceText": "▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。",
              "anchorText": "ou can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2450,
              "lineNumber": 46
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_6_2474",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)",
              "evidenceText": "焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)",
              "anchorText": "件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2474,
              "lineNumber": 47
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_7_2617",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "▲娜塔莉亚拿着文件准备起身。",
              "evidenceText": "▲娜塔莉亚拿着文件准备起身。",
              "anchorText": "immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2617,
              "lineNumber": 48
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_8_2632",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。",
              "evidenceText": "▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。",
              "anchorText": "娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2632,
              "lineNumber": 49
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_2_para_9_2660",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)",
              "evidenceText": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)",
              "anchorText": "面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2660,
              "lineNumber": 50
            }
          ],
          "provenanceStatus": "verified",
          "verifiedScriptHash": "82128:gpb4h7",
          "sourceScenes": [
            "第一集 1-5 日  内  娜塔莉亚家"
          ]
        },
        {
          "id": "char_1794652576078_d31r5_0_charv_3",
          "name": "职业装+黑框眼镜应聘",
          "description": "娜塔莉亚前往布莱克伍德庄园应聘心理医生时的造型，穿职业装、戴黑框眼镜、抱着厚厚简历，主动站出来争取诊治小姐的机会。",
          "appearance": "穿着职业装，戴一副黑框眼镜，抱着厚厚的简历",
          "aliases": [
            "应聘者娜塔莉亚"
          ],
          "verifiedProvenance": [
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_2_2825",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]",
              "evidenceText": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]",
              "anchorText": "管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2825,
              "lineNumber": 56
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_3_3031",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")",
              "evidenceText": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")",
              "anchorText": "kwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 3031,
              "lineNumber": 57
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_5_3266",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)",
              "evidenceText": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)",
              "anchorText": "\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 3266,
              "lineNumber": 59
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_18_4354",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。",
              "evidenceText": "▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。",
              "anchorText": "oo, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4354,
              "lineNumber": 72
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_19_4380",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）",
              "evidenceText": "娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）",
              "anchorText": "主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4380,
              "lineNumber": 73
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_20_4427",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。",
              "evidenceText": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。",
              "anchorText": "ke the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4427,
              "lineNumber": 74
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_21_4456",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）",
              "evidenceText": "布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）",
              "anchorText": "布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4456,
              "lineNumber": 75
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_22_4525",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）",
              "evidenceText": "娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）",
              "anchorText": "g wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4525,
              "lineNumber": 76
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_23_4649",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "▲布拉姆打量着娜塔莉亚。",
              "evidenceText": "▲布拉姆打量着娜塔莉亚。",
              "anchorText": " the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（L",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4649,
              "lineNumber": 77
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_24_4662",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "布拉姆：抬起你的头来。（Lift your chin.）",
              "evidenceText": "布拉姆：抬起你的头来。（Lift your chin.）",
              "anchorText": "\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4662,
              "lineNumber": 78
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_25_4691",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "▲娜塔莉亚缓缓抬头。",
              "evidenceText": "▲娜塔莉亚缓缓抬头。",
              "anchorText": "t your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4691,
              "lineNumber": 79
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_26_4702",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）",
              "evidenceText": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）",
              "anchorText": ".）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4702,
              "lineNumber": 80
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_27_4807",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "▲娜塔莉亚紧张地握紧了简历。",
              "evidenceText": "▲娜塔莉亚紧张地握紧了简历。",
              "anchorText": "sed to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4807,
              "lineNumber": 81
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_28_4822",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）",
              "evidenceText": "娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）",
              "anchorText": "娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4822,
              "lineNumber": 82
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_29_4864",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）",
              "evidenceText": "布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）",
              "anchorText": "ow who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4864,
              "lineNumber": 83
            },
            {
              "id": "vp_char_1794652576078_d31r5_0_charv_3_para_30_4944",
              "sceneId": "sc-51-2776",
              "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
              "matchedTerm": "娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）",
              "evidenceText": "娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）",
              "anchorText": " you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 4944,
              "lineNumber": 84
            }
          ],
          "provenanceStatus": "verified",
          "verifiedScriptHash": "82128:gpb4h7",
          "sourceScenes": [
            "第一集 1-5 日 外 布莱克伍德庄园"
          ]
        }
      ],
      "verifiedProvenance": [
        {
          "id": "vp_char_1794652576078_d31r5_0_para_2_193",
          "sceneId": "sc-7-151",
          "sceneTitle": "第一集 1-2 日  内   医院办公室",
          "matchedTerm": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]",
          "evidenceText": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]",
          "anchorText": "to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 193,
          "lineNumber": 12
        },
        {
          "id": "vp_char_1794652576078_d31r5_0_para_4_526",
          "sceneId": "sc-7-151",
          "sceneTitle": "第一集 1-2 日  内   医院办公室",
          "matchedTerm": "▲娜塔莉亚死死握着书信，眼泪落在照片上。",
          "evidenceText": "▲娜塔莉亚死死握着书信，眼泪落在照片上。",
          "anchorText": "is hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 526,
          "lineNumber": 14
        },
        {
          "id": "vp_char_1794652576078_d31r5_0_para_5_547",
          "sceneId": "sc-7-151",
          "sceneTitle": "第一集 1-2 日  内   医院办公室",
          "matchedTerm": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
          "evidenceText": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
          "anchorText": "握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 547,
          "lineNumber": 15
        },
        {
          "id": "vp_char_1794652576078_d31r5_0_para_1_1401",
          "sceneId": "sc-27-1373",
          "sceneTitle": "第一集 1-4 日  内   医院办公室",
          "matchedTerm": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。",
          "evidenceText": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。",
          "anchorText": "公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1401,
          "lineNumber": 31
        },
        {
          "id": "vp_char_1794652576078_d31r5_0_para_3_1636",
          "sceneId": "sc-27-1373",
          "sceneTitle": "第一集 1-4 日  内   医院办公室",
          "matchedTerm": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。",
          "evidenceText": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。",
          "anchorText": "ent through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（He",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1636,
          "lineNumber": 33
        },
        {
          "id": "vp_char_1794652576078_d31r5_0_para_6_1726",
          "sceneId": "sc-27-1373",
          "sceneTitle": "第一集 1-4 日  内   医院办公室",
          "matchedTerm": "▲娜塔莉亚死死盯着那段小字。",
          "evidenceText": "▲娜塔莉亚死死盯着那段小字。",
          "anchorText": "救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1726,
          "lineNumber": 36
        },
        {
          "id": "vp_char_1794652576078_d31r5_0_para_7_1741",
          "sceneId": "sc-27-1373",
          "sceneTitle": "第一集 1-4 日  内   医院办公室",
          "matchedTerm": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
          "evidenceText": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
          "anchorText": "娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1741,
          "lineNumber": 37
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "82128:gpb4h7",
      "sourceScenes": [
        "第一集 1-2 日  内   医院办公室",
        "第一集 1-4 日  内   医院办公室",
        "第一集 1-3 贫民窟门口   日   外",
        "第一集 1-5 日  内  娜塔莉亚家",
        "第一集 1-5 日 外 布莱克伍德庄园"
      ]
    },
    {
      "id": "char_1794654458918_mk6wm_0",
      "name": "布拉姆",
      "role": "布莱克伍德家主/教父",
      "description": "布莱克伍德家主，权势滔天的教父，娜塔莉亚姐姐的丈夫，后迎娶贵族之女塞莱特斯。首次出场于第一集 1-5 日 外 布莱克伍德庄园，坐于主位主持心理医生招募。",
      "appearance": "衣着华丽，随意把玩着手中的手枪，坐于主位，目光扫视众人，指尖掠过娜塔莉亚脸颊。",
      "verifiedProvenance": [
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_2_2825",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]",
          "evidenceText": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]",
          "anchorText": "管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 2825,
          "lineNumber": 56
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_3_3031",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")",
          "evidenceText": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")",
          "anchorText": "kwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3031,
          "lineNumber": 57
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_4_3253",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "▲布拉姆的目光扫过众人。",
          "evidenceText": "▲布拉姆的目光扫过众人。",
          "anchorText": " Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3253,
          "lineNumber": 58
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_5_3266",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)",
          "evidenceText": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)",
          "anchorText": "\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3266,
          "lineNumber": 59
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_20_4427",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。",
          "evidenceText": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。",
          "anchorText": "ke the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4427,
          "lineNumber": 74
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_21_4456",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）",
          "evidenceText": "布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）",
          "anchorText": "布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4456,
          "lineNumber": 75
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_23_4649",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "▲布拉姆打量着娜塔莉亚。",
          "evidenceText": "▲布拉姆打量着娜塔莉亚。",
          "anchorText": " the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（L",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4649,
          "lineNumber": 77
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_24_4662",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "布拉姆：抬起你的头来。（Lift your chin.）",
          "evidenceText": "布拉姆：抬起你的头来。（Lift your chin.）",
          "anchorText": "\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4662,
          "lineNumber": 78
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_26_4702",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）",
          "evidenceText": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）",
          "anchorText": ".）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4702,
          "lineNumber": 80
        },
        {
          "id": "vp_char_1794654458918_mk6wm_0_para_29_4864",
          "sceneId": "sc-51-2776",
          "sceneTitle": "第一集 1-5 日 外 布莱克伍德庄园",
          "matchedTerm": "布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）",
          "evidenceText": "布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）",
          "anchorText": "ow who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4864,
          "lineNumber": 83
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "82128:gpb4h7",
      "sourceScenes": [
        "第一集 1-5 日 外 布莱克伍德庄园"
      ]
    }
  ],
  "nextOffset": null
}
```

---
## 第 4 轮（耗时：5520 ms (5.52 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 13147 tokens · 缓存命中 2432 (18.5%) · 输出 384

### [第 4 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“Mira”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前场景输出对用户说的话：常规中间执行轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在调用 sys.endTask 结案汇报、调用 user.ask 向用户提问或无需调工具直接回复时，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、检索同类任务经验、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。
执行任务通用规范——严格遵循“检索经验 + 四步走”闭环推进（搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收）：
0. 检索同类任务经验（初次规划必做）：收到新任务尚未检索经验时，优先调用 experience.search（传入任务类型关键词，如“提取角色”、“核验出处”等；可与首次展开工具分类的 sys.selectContext({"categories": [...]}) 同轮并发调用），获取该类任务的四步走最佳实践指南；
1. 搜集足够的信息（探查期，数据未知时）：在尚未掌握目标数据分布与现有状态前，先制定宏观探查计划；首次展开分类时一次性展开任务涉及的全部工具箱分类，探查期结合所获经验装载只读探查工具建立全局视野、搜集足够的信息，不提前装载写入或修改工具；
2. 制定足够清晰的计划（获知数据分布后动态重规划）：当探查结果返回了数据分布概览或触发数据量预警时，必须对照 experience.search 返回的计划制定标准与探查结果，在“当前计划”中将宏观任务拆解为边界明确、分批推进的具体子步骤（结合各场次/集数字数 charCount 规划合批，每轮合批总字数控制在工具建议上限 recommendedBatchMaxChars 内，重头戏大场次独立成批；若涉及多版本/造型演进，先从目录人物表与检索命中切片中梳理完整造型版本清单，并将每一批需创建或追加的具体版本动作显式写进计划步骤标题）；每个子步骤必须定义为“读取该批数据并立即完成创建或增量更新落盘”的完整读写闭环（即使操作对象为单个目标实体，也必须按“首批读取并调用创建工具建档落盘 → 后续每批读取并调用更新工具增量追加”拆解，不规划无写入动作的纯读取步骤或留到最后一步才汇总创建）；
3. 实施（成套装载工具切入执行）：计划明确后，在 tools 参数中同时成套装载所需的读取、创建与更新工具 ID 切入执行阶段，按计划步骤随读随写完成每一批闭环；
4. 验收（全局核验与结案）：从执行阶段返回后，对照“最终目标”与“当前计划”逐项验收所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。

# 输出格式
状态检查：
{回顾并检查下面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 本轮执行结果与事实盘点：上一步工具返回了哪些具体结果？是否已获取同类任务经验（experience.search）？是否获知了数据分布概览或触发了数据量预警？
- 原计划完成度核对：对照现有“当前计划”，哪些步骤已真实达成（[x]），哪些尚待推进（[ ]）？最终目标是否已全部达成？
- 工具箱分类与工具准备：若尚未检索经验，本轮需调用 experience.search；为执行接下来的计划，需要先展开哪些工具箱分类（categories，首次展开时可与 experience.search 同轮并发调用，一次性展开任务涉及的全部工具箱分类），或成套装载哪些具体读写工具（tools）进入执行阶段？}
思考：
{使用内心独白的方式，围绕全局目标、计划拆解与工具准备进行逻辑推演：
- 1. 拆解策略推演：分析当前任务进展、已获取的同类任务经验（experience.search）与本轮返回的数据规模及分布结构，思考接下来的推进策略（若处于初次规划尚未检索经验，决定同轮并发调用 experience.search 与 sys.selectContext 展开分类；若已获知探查数据分布或触发数据量预警，严格对照同类任务经验中的“制定足够清晰的计划”标准，先从探查数据中梳理关键状态/版本清单，再拆分为合理的“首批读取+创建、后续每批读取+增量更新”读写批次）；
- 2. 制定或更新“当前计划”（显式列出完整步骤列表，标记 [x] 已完成、[ ] 待推进）：
  * 初次规划（数据未知时）：按“四步走”列出宏观阶段计划（如：[ ] 1. 搜集足够的信息（探查项目数据现状）；[ ] 2. 制定足够清晰的计划并分批实施目标操作；[ ] 3. 全局验收结案）；
  * 动态重规划（获知数据分布或触发数据量预警时）：直接将旧宏观步骤替换为按经验标准与数据分布拆解的“首批读取+创建、后续每批读取+增量更新”闭环子步骤列表（在步骤标题中写明唯一场次 ID 与本批需创建/追加的具体版本动作）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）；
- 3. 下一步小目标与重点笔记盘点：若所有步骤均已真实达成，决定调用 sys.endTask 结案；若未完成，明确下一步要推进的具体步骤与“当前小目标”，确定本轮调用的工具与参数，并盘点本轮有哪些跨轮次仍需引用的关键事实、实体 ID、预判的造型版本清单或待办线索，以及你对任务的新理解、总结了什么经验，或对接下来的推进有什么直观感受与自我提醒。}
工具调用：
{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
用户沟通：
{
- 对用户说的话（简版）：“口语化介绍当前状态、阶段进展、汇报结论或向用户提问，控制在30字以内（每轮必填；注意调用工具不等于完成任务）”
- 对用户说的话（完整版）：“（按需选填：仅在调用 sys.endTask 结案汇总、调用 user.ask 提问需补充背景依据或无需调用工具直接回答用户时输出；若本轮仅调用 experience.search / sys.selectContext 推进中间步骤，无需输出完整版）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；收到新任务尚未检索经验时可与 sys.selectContext 同轮并发调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset, card, ui]）
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（附每集/场次字数与单批字数上限建议）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- guide.lookup：查询应用界面操作指南
- page.inspect：观察当前可见界面概览或指定组件区域内容
- card.inspect：查看指定卡片的图像、提示词、参考图及画幅参数
- card.detectLandmarks：对指定卡片画面进行元素空间定位与语义标注
- card.generate：触发生图或对已有卡片执行复刻衍生创建新卡
- ui.actAndObserve：在已观察到的可见目标上执行鼠标动作并返回新界面状态

=== [USER] ===
# 用户指令
## 初始任务指令
你好
## 当前聚焦目标
【当前聚焦目标：资产清单面板 (assets.panel)】
- 角色数量: 2
- 场景数量: 0
- 道具数量: 0

# 认知状态
任务标题：资产清单整理
最终目标：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）
当前计划：[x] 搜集足够的信息（检索经验 + 展开工具箱分类 + 探查项目数据现状）
[ ] 制定足够清晰的计划并分批实施目标操作
[ ] 全局验收结案
重点笔记：- ① 聚焦面板：角色2个、场景0、道具0；② 剧本目录：40集共75场1303段，分集场次概览已获取（如scene-2-4、scene-89-5214等）；③ 角色资产：娜塔莉亚(id:char_1794652576078_d31r5_0)含4个版本（常服、8岁幼年、居家日常、职业装+黑框眼镜应聘），布拉姆(id:char_1794654458918_mk6wm_0)无版本；④ 用户仅打招呼，具体意图待确认；⑤ 下一步需补充查询场景/道具资产，并基于剧本实际涉及的角色/场景/道具制定分批建档计划；⑥ 读取结果揭示剧本场次众多，建档需分批推进。
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成经验检索、工具装载及剧本目录与角色资产的实际读取，摸清项目现状（40集75场1303段、2个角色），但尚未制定分批建档计划，整体处于信息搜集完成待规划阶段。

# 工具执行结果
【工具 experience.search 执行成功】
【同类任务最佳实践经验：剧本角色/场景/道具资产提取与多版本建档经验】
- 适用场景：适用于从指定剧本集数或场次中提取角色、场景、道具资产卡片，完整收录各造型/状态版本与真实画面出处。
- 第一步（搜集足够的信息）：首次展开 ["script", "asset"] 分类后，装载并同轮并发调用 script.directory（传目标集数）、script.search（必填目标集数 episode 与实体名称 query）及 asset.list（查重），一次性拿齐场次字数分布、各场人物表、正文中所有命中段落切片及现有资产状态。
- 第二步（制定足够清晰的计划）：
（成败关键）在制定分批计划前，必须先通读探查返回的数据完成以下 3 项设计：
  1. 预判完整造型/状态演进清单：对照 script.directory 各场人物表（是否标注了不同年龄/时期）与 script.search 返回的各场 matches 原文切片（是否描写了新的服装穿搭、职业装束、标志性配饰/眼镜、场景日夜切换或道具形态改变），先在思考与重点笔记中梳理出目标实体在本集中的全部造型/状态清单；
  2. 大场次独立成批：小场次可合并（单批总字数 ≤ 2500 字），但单场正文字数接近或超过 1800 字（或段落数 ≥ 25 段）的重头戏场次必须单独拆为独立批次，避免多场混读导致新造型或出处漏判；
  3. 将具体造型版本动作直接写进计划步骤标题：每个批次步骤不仅要写明唯一场次 ID（sceneId），还必须把步骤 1 预判出的版本动作显式锚定在步骤标题中（例如：“[ ] 1. 读取 scene-A、scene-B，核验出处并调用 asset.create 创建主卡（初始默认造型）并同步建立「[某年龄/时期]」版本”；“[ ] 2. 读取 scene-C（单大场独立成批），核验出处并调用 asset.update 在 versions 中新增「[某场合新服装造型]」版本并绑定该场出处”），不写笼统的“增量追加出处”。
- 第三步（实施）：
成套装载 ["script.read", "asset.create", "asset.update"] 切入执行阶段：
  1. 首批建主卡克制原则：调用 asset.create 时，顶层 appearance 仅客观记录当前已精读场次中明确写出的初始体貌与状态（未写具体服饰时保持基础特征描述，不提前透支未读场次的服装）；若首批已读场次包含另一年龄/造型，同步在 versions 数组中传入；
  2. 后续批次严格兑现新版本建档：每批调用 script.read 精读全文后，严格按工具规则逐段摘录中文原文核验出处；若该场次原文出现了前序批次未建立的新服装穿搭、标志性配饰、年龄阶段、场景日夜或道具形态变化，调用 asset.update 时必须通过 versions 数组传入新版本对象并将该场 provenances 绑定在新版本下。
- 第四步（验收）：所有批次均完成落盘后，通过 asset.list 回查核对已创建的资产数量、各造型版本（versions）及累计出处条数是否完整无误，确认全部真实达成后调用 sys.endTask 结案汇报。

💡【数据量提醒 · 已处于 0 级全局阶段】我发现当前剧集目录包含 75 个场次共 1303 个段落（正文约 77513 字），内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议按场次或集数分批拆分为多轮计划处理，每轮合批读取处理的总字数建议不超过 2500 字（若单场本身超过 2500 字可单独作为一轮或按段落区间分段）。 注：目录存在重名场次编号（1-5、13-2、18-2），调用 script.read 精准读取单个子场次时请传唯一 id（如 "scene-39-1953"（1-5 日 内 娜塔莉亚家） / "scene-52-2776"（1-5 日 外 布莱克伍德庄园））或带地点/内外景的标识（如 "1-5内" / "1-5外"），勿只传未区分的 "1-5"。

【工具 script.directory 执行成功】（共 40 个集数条目 | 场次总计: 75 | 段落总计: 1303 | 正文字数: 77513 字 | 每轮建议上限: 2500 字）
{"total":40,"offset":0,"entries":[{"index":1,"id":"episode-1","number":"一","title":"第一集","sceneCount":6,"paragraphCount":66,"charCount":4935,"scenes":[{"index":1,"id":"scene-2-4","sceneNumber":"1-1","title":"1-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["玛莉"],"paragraphCount":2,"charCount":122},{"index":2,"id":"scene-8-151","sceneNumber":"1-2","title":"1-2 日 内 医院办公室","type":"INT","timeOfDay":"日","locationName":"医院办公室","characterNames":["娜塔莉亚"],"paragraphCount":6,"charCount":494},{"index":3,"id":"scene-17-679","sceneNumber":"1-3","title":"1-3 日 外 贫民窟门口","type":"EXT","timeOfDay":"日","locationName":"贫民窟门口","characterNames":["小娜塔莉亚（8岁）","小玛莉（姐姐 13岁）","养父","养母"],"paragraphCount":9,"charCount":633},{"index":4,"id":"scene-28-1373","sceneNumber":"1-4","title":"1-4 日 内 医院办公室","type":"INT","timeOfDay":"日","locationName":"医院办公室","characterNames":["娜塔莉亚"],"paragraphCount":7,"charCount":544},{"index":5,"id":"scene-39-1953","sceneNumber":"1-5","title":"1-5 日 内 娜塔莉亚家","type":"INT","timeOfDay":"日","locationName":"娜塔莉亚家","characterNames":["娜塔莉亚","焦恩"],"paragraphCount":10,"charCount":785},{"index":6,"id":"scene-52-2776","sceneNumber":"1-5","title":"1-5 日 外 布莱克伍德庄园","type":"EXT","timeOfDay":"日","locationName":"布莱克伍德庄园","characterNames":["娜塔莉亚","布拉姆","女佣若干","管家","塞莱特斯"],"paragraphCount":32,"charCount":2357}]},{"index":2,"id":"episode-88","number":"二","title":"第二集","sceneCount":1,"paragraphCount":47,"charCount":2788,"scenes":[{"index":1,"id":"scene-89-5214","sceneNumber":"2-1","title":"2-1 日 外 布莱克伍德庄园","type":"EXT","timeOfDay":"日","locationName":"布莱克伍德庄园","characterNames":["娜塔莉亚","布拉姆","女佣若干","管家","塞莱特斯","戴安娜","女佣"],"paragraphCount":47,"charCount":2788}]},{"index":3,"id":"episode-140","number":"三","title":"第三集","sceneCount":4,"paragraphCount":69,"charCount":3597,"scenes":[{"index":1,"id":"scene-141-8108","sceneNumber":"3-1","title":"3-1 日 外 布莱克伍德庄园","type":"EXT","timeOfDay":"日","locationName":"布莱克伍德庄园","characterNames":["娜塔莉亚","布拉姆","女佣若干","管家","塞莱特斯","戴安娜","女佣"],"paragraphCount":25,"charCount":1429},{"index":2,"id":"scene-170-9617","sceneNumber":"3-2","title":"3-2 日 内 戴安娜的房间","type":"INT","timeOfDay":"日","locationName":"戴安娜的房间","characterNames":["戴安娜","娜塔莉亚"],"paragraphCount":7,"charCount":276},{"index":3,"id":"scene-181-9931","sceneNumber":"3-3","title":"3-3 日 外 花园","type":"EXT","timeOfDay":"日","locationName":"花园","characterNames":["娜塔莉亚","管家"],"paragraphCount":21,"charCount":1153},{"index":4,"id":"scene-206-11132","sceneNumber":"3-4","title":"3-4 日 内 戴安娜房间","type":"INT","timeOfDay":"日","locationName":"戴安娜房间","characterNames":["戴安娜","娜塔莉亚","布拉姆"],"paragraphCount":16,"charCount":739}]},{"index":4,"id":"episode-226","number":"四","title":"第四集","sceneCount":2,"paragraphCount":40,"charCount":2676,"scenes":[{"index":1,"id":"scene-227-11930","sceneNumber":"4-1","title":"4-1 日 内 戴安娜的房间","type":"INT","timeOfDay":"日","locationName":"戴安娜的房间","characterNames":["戴安娜","娜塔莉亚","布拉姆"],"paragraphCount":32,"charCount":1982},{"index":2,"id":"scene-264-13979","sceneNumber":"4-2","title":"4-2 夜 内 保姆间","type":"INT","timeOfDay":"夜","locationName":"保姆间","characterNames":["娜塔莉亚","戴安娜"],"paragraphCount":8,"charCount":694}]},{"index":5,"id":"episode-277","number":"五","title":"第五集","sceneCount":5,"paragraphCount":43,"charCount":2855,"scenes":[{"index":1,"id":"scene-278-14714","sceneNumber":"5-1","title":"5-1 夜 内 保姆间","type":"INT","timeOfDay":"夜","locationName":"保姆间","characterNames":["娜塔莉亚","戴安娜"],"paragraphCount":7,"charCount":285},{"index":2,"id":"scene-289-15034","sceneNumber":"5-2","title":"5-2 夜 内 书房外","type":"INT","timeOfDay":"夜","locationName":"书房外","characterNames":["娜塔莉亚","戴安娜"],"paragraphCount":6,"charCount":485},{"index":3,"id":"scene-299-15555","sceneNumber":"5-3","title":"5-3 夜 内 书房内","type":"INT","timeOfDay":"夜","locationName":"书房内","characterNames":["布拉姆"],"paragraphCount":4,"charCount":330},{"index":4,"id":"scene-307-15916","sceneNumber":"5-4","title":"5-4 夜 内 戴安娜房间","type":"INT","timeOfDay":"夜","locationName":"戴安娜房间","characterNames":["戴安娜","娜塔莉亚"],"paragraphCount":22,"charCount":1428},{"index":5,"id":"scene-333-17397","sceneNumber":"5-5","title":"5-5 夜 内 楼梯口","type":"INT","timeOfDay":"夜","locationName":"楼梯口","characterNames":["安保","娜塔莉亚","管家"],"paragraphCount":4,"charCount":327}]},{"index":6,"id":"episode-342","number":"六","title":"第六集","sceneCount":1,"paragraphCount":24,"charCount":1629,"scenes":[{"index":1,"id":"scene-343-17769","sceneNumber":"6-1","title":"6-1 日 内 餐厅","type":"INT","timeOfDay":"日","locationName":"餐厅","characterNames":["娜塔莉亚","布拉姆","塞莱特斯"],"paragraphCount":24,"charCount":1629}]},{"index":7,"id":"episode-371","number":"七","title":"第七集","sceneCount":1,"paragraphCount":36,"charCount":2129,"scenes":[{"index":1,"id":"scene-372-19459","sceneNumber":"7-1","title":"7-1 日 内 餐厅","type":"INT","timeOfDay":"日","locationName":"餐厅","characterNames":["娜塔莉亚","布拉姆","塞莱特斯"],"paragraphCount":36,"charCount":2129}]},{"index":8,"id":"episode-413","number":"八","title":"第八集","sceneCount":3,"paragraphCount":51,"charCount":2631,"scenes":[{"index":1,"id":"scene-414-21662","sceneNumber":"8-1","title":"8-1 日 内 戴安娜房间","type":"INT","timeOfDay":"日","locationName":"戴安娜房间","characterNames":["戴安娜","娜塔莉亚"],"paragraphCount":25,"charCount":1266},{"index":2,"id":"scene-442-22983","sceneNumber":"8-2","title":"8-2 日 内 平民屋老房子","type":"INT","timeOfDay":"日","locationName":"平民屋老房子","characterNames":["玛莉","娜塔莉亚"],"paragraphCount":7,"charCount":394},{"index":3,"id":"scene-454-23414","sceneNumber":"8-3","title":"8-3 夜 内 走廊 地下室","type":"INT","timeOfDay":"夜","locationName":"走廊 地下室","characterNames":["娜塔莉亚","塞莱特斯"],"paragraphCount":19,"charCount":971}]},{"index":9,"id":"episode-477","number":"九","title":"第九集","sceneCount":1,"paragraphCount":22,"charCount":1678,"scenes":[{"index":1,"id":"scene-478-24441","sceneNumber":"9-1","title":"9-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["娜塔莉亚","塞莱特斯"],"paragraphCount":22,"charCount":1678}]},{"index":10,"id":"episode-505","number":"十","title":"第十集","sceneCount":1,"paragraphCount":27,"charCount":2155,"scenes":[{"index":1,"id":"scene-506-26176","sceneNumber":"10-1","title":"10-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["娜塔莉亚","塞莱特斯","布拉姆","安保若干"],"paragraphCount":27,"charCount":2155}]},{"index":11,"id":"episode-538","number":"十一","title":"第十一集","sceneCount":1,"paragraphCount":17,"charCount":929,"scenes":[{"index":1,"id":"scene-539-28407","sceneNumber":"11-1","title":"11-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["娜塔莉亚","塞莱特斯","布拉姆","安保若干"],"paragraphCount":17,"charCount":929}]},{"index":12,"id":"episode-561","number":"十二","title":"第十二集","sceneCount":1,"paragraphCount":20,"charCount":1567,"scenes":[{"index":1,"id":"scene-562-29402","sceneNumber":"12-1","title":"12-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["娜塔莉亚","塞莱特斯","布拉姆","安保若干"],"paragraphCount":20,"charCount":1567}]},{"index":13,"id":"episode-586","number":"十三","title":"第十三集","sceneCount":3,"paragraphCount":48,"charCount":3092,"scenes":[{"index":1,"id":"scene-587-31037","sceneNumber":"13-1","title":"13-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["娜塔莉亚","布拉姆","安保若干"],"paragraphCount":31,"charCount":2162},{"index":2,"id":"scene-621-33267","sceneNumber":"13-2","title":"13-2 （衔接10-1）","locationName":"（衔接10-1）","characterNames":["娜塔莉亚","塞莱特斯"],"paragraphCount":9,"charCount":549},{"index":3,"id":"scene-632-33856","sceneNumber":"13-2","title":"13-2 夜 内 塞莱特斯房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯房间","characterNames":["塞莱特斯","布拉姆"],"paragraphCount":8,"charCount":381}]},{"index":14,"id":"episode-645","number":"十四","title":"第十四集","sceneCount":2,"paragraphCount":24,"charCount":1494,"scenes":[{"index":1,"id":"scene-646-34283","sceneNumber":"14-1","title":"14-1 夜 内 塞莱特斯房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯房间","characterNames":["塞莱特斯","布拉姆"],"paragraphCount":21,"charCount":1398},{"index":2,"id":"scene-670-35733","sceneNumber":"14-2","title":"14-2 夜 内 走廊","type":"INT","timeOfDay":"夜","locationName":"走廊","characterNames":["娜塔莉"],"paragraphCount":3,"charCount":96}]},{"index":15,"id":"episode-678","number":"十五","title":"第十五集","sceneCount":1,"paragraphCount":22,"charCount":1204,"scenes":[{"index":1,"id":"scene-679-35861","sceneNumber":"15-1","title":"15-1 夜 内 塞莱特斯房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯房间","characterNames":["塞莱特斯","布拉姆"],"paragraphCount":22,"charCount":1204}]},{"index":16,"id":"episode-706","number":"十六","title":"第十六集","sceneCount":1,"paragraphCount":24,"charCount":1286,"scenes":[{"index":1,"id":"scene-707-37125","sceneNumber":"16-1","title":"16-1 夜 内 走廊","type":"INT","timeOfDay":"夜","locationName":"走廊","characterNames":["娜塔莉亚","布拉姆"],"paragraphCount":24,"charCount":1286}]},{"index":17,"id":"episode-736","number":"十七","title":"第十七集","sceneCount":1,"paragraphCount":22,"charCount":1250,"scenes":[{"index":1,"id":"scene-737-38472","sceneNumber":"17-1","title":"17-1 夜 内 走廊","type":"INT","timeOfDay":"夜","locationName":"走廊","characterNames":["娜塔莉亚","布拉姆"],"paragraphCount":22,"charCount":1250}]},{"index":18,"id":"episode-764","number":"十八","title":"第十八集","sceneCount":2,"paragraphCount":35,"charCount":1465,"scenes":[{"index":1,"id":"scene-765-39781","sceneNumber":"18-1","title":"18-1 夜 内 戴安娜房间","type":"INT","timeOfDay":"夜","locationName":"戴安娜房间","characterNames":["戴安娜","娜塔莉亚"],"paragraphCount":14,"charCount":645},{"index":2,"id":"scene-782-40473","sceneNumber":"18-2","title":"18-2 日 内 走廊","type":"INT","timeOfDay":"日","locationName":"走廊","characterNames":["娜塔莉亚","女佣","布拉姆"],"paragraphCount":21,"charCount":820}]},{"index":19,"id":"episode-808","number":"十九","title":"第十九集","sceneCount":2,"paragraphCount":42,"charCount":2232,"scenes":[{"index":1,"id":"scene-809-41353","sceneNumber":"19-1","title":"19-1 日 内 走廊","type":"INT","timeOfDay":"日","locationName":"走廊","characterNames":["娜塔莉亚","女佣","布拉姆"],"paragraphCount":17,"charCount":856},{"index":2,"id":"scene-829-42258","sceneNumber":"18-2","title":"18-2 日 内 塞莱特斯房间","type":"INT","timeOfDay":"日","locationName":"塞莱特斯房间","characterNames":["塞莱特斯","女佣"],"paragraphCount":25,"charCount":1376}]},{"index":20,"id":"episode-859","number":"二十","title":"第二十集","sceneCount":3,"paragraphCount":40,"charCount":2292,"scenes":[{"index":1,"id":"scene-860-43695","sceneNumber":"20-1","title":"20-1 日 内 塞莱特斯房间","type":"INT","timeOfDay":"日","locationName":"塞莱特斯房间","characterNames":["布拉姆","塞莱特斯","管家"],"paragraphCount":7,"charCount":522},{"index":2,"id":"scene-870-44259","sceneNumber":"20-2","title":"20-2 日 内 宴会厅","type":"INT","timeOfDay":"日","locationName":"宴会厅","characterNames":["布拉姆","娜塔莉亚","塞莱特斯","戴安娜","宾客若干","莱恩","伊丽莎白"],"paragraphCount":29,"charCount":1547},{"index":3,"id":"scene-902-45893","sceneNumber":"20-3","title":"20-3 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["布拉姆","娜塔莉亚"],"paragraphCount":4,"charCount":223}]},{"index":21,"id":"episode-911","number":"二十一","title":"第二十一集","sceneCount":3,"paragraphCount":26,"charCount":1544,"scenes":[{"index":1,"id":"scene-912-46160","sceneNumber":"21-1","title":"21-1 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["布拉姆","娜塔莉亚"],"paragraphCount":5,"charCount":384},{"index":2,"id":"scene-920-46581","sceneNumber":"21-2","title":"21-2 日 内 宴会厅","type":"INT","timeOfDay":"日","locationName":"宴会厅","characterNames":["塞莱特斯","宾客若干","莱恩","伊丽莎白"],"paragraphCount":9,"charCount":546},{"index":3,"id":"scene-932-47179","sceneNumber":"21-3","title":"21-3 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["塞莱特斯","宾客若干","莱恩","伊丽莎白","布拉姆","娜塔莉亚"],"paragraphCount":12,"charCount":614}]},{"index":22,"id":"episode-949","number":"二十二","title":"第二十二集","sceneCount":2,"paragraphCount":27,"charCount":1329,"scenes":[{"index":1,"id":"scene-950-47869","sceneNumber":"22-1","title":"22-1 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["塞莱特斯","宾客若干","莱恩","伊丽莎白","布拉姆","娜塔莉亚"],"paragraphCount":4,"charCount":103},{"index":2,"id":"scene-956-48032","sceneNumber":"22-2","title":"22-2 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["布拉姆","娜塔莉亚"],"paragraphCount":23,"charCount":1226}]},{"index":23,"id":"episode-985","number":"二十三","title":"第二十三集","sceneCount":1,"paragraphCount":38,"charCount":2214,"scenes":[{"index":1,"id":"scene-986-49321","sceneNumber":"23-1","title":"23-1 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["塞莱特斯","宾客若干","莱恩","伊丽莎白","布拉姆","娜塔莉亚"],"paragraphCount":38,"charCount":2214}]},{"index":24,"id":"episode-1029","number":"二十四","title":"第二十四集","sceneCount":2,"paragraphCount":25,"charCount":2078,"scenes":[{"index":1,"id":"scene-1030-51638","sceneNumber":"24-1","title":"24-1 日 内 布拉姆房间","type":"INT","timeOfDay":"日","locationName":"布拉姆房间","characterNames":["布拉姆","娜塔莉亚"],"paragraphCount":13,"charCount":898},{"index":2,"id":"scene-1046-52581","sceneNumber":"24-2","title":"24-2 日 外 花园","type":"EXT","timeOfDay":"日","locationName":"花园","characterNames":["莱恩","伊丽莎白","塞莱特斯","布拉姆","管家"],"paragraphCount":12,"charCount":1180}]},{"index":25,"id":"episode-1063","number":"二十五","title":"第二十五集","sceneCount":1,"paragraphCount":20,"charCount":1605,"scenes":[{"index":1,"id":"scene-1064-53824","sceneNumber":"25-1","title":"25-1 夜 内 宴会厅门口","type":"INT","timeOfDay":"夜","locationName":"宴会厅门口","characterNames":["塞莱特斯","伊丽莎白","下人若干","莱恩","布拉姆","娜塔莉亚"],"paragraphCount":20,"charCount":1605}]},{"index":26,"id":"episode-1089","number":"二十六","title":"第二十六集","sceneCount":2,"paragraphCount":17,"charCount":1340,"scenes":[{"index":1,"id":"scene-1090-55510","sceneNumber":"26-1","title":"26-1 夜 内 宴会厅 走廊","type":"INT","timeOfDay":"夜","locationName":"宴会厅 走廊","characterNames":["塞莱特斯","下人若干","布拉姆","娜塔莉亚"],"paragraphCount":6,"charCount":408},{"index":2,"id":"scene-1099-55970","sceneNumber":"26-2","title":"26-2 夜 内 塞莱特斯房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯房间","characterNames":["女佣","布拉姆","塞莱特斯"],"paragraphCount":11,"charCount":932}]},{"index":27,"id":"episode-1115","number":"二十七","title":"第二十七集","sceneCount":1,"paragraphCount":46,"charCount":2080,"scenes":[{"index":1,"id":"scene-1116-56961","sceneNumber":"27-1","title":"27-1 夜 内 塞莱特斯房间 走廊","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯房间 走廊","characterNames":["女佣","布拉姆","塞莱特斯","娜塔莉亚","戴安娜"],"paragraphCount":46,"charCount":2080}]},{"index":28,"id":"episode-1167","number":"二十八","title":"第二十八集","sceneCount":3,"paragraphCount":34,"charCount":1196,"scenes":[{"index":1,"id":"scene-1168-59148","sceneNumber":"28-1","title":"28-1 夜 内 塞莱特斯房间 走廊","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯房间 走廊","characterNames":["女佣","布拉姆","塞莱特斯","娜塔莉亚","戴安娜"],"paragraphCount":11,"charCount":358},{"index":2,"id":"scene-1182-59570","sceneNumber":"28-2","title":"28-2 夜 内 戴安娜房间","type":"INT","timeOfDay":"夜","locationName":"戴安娜房间","characterNames":["戴安娜","医生","娜塔莉亚","布拉姆"],"paragraphCount":19,"charCount":687},{"index":3,"id":"scene-1204-60317","sceneNumber":"28-4","title":"28-4 夜 内 地下室门口","type":"INT","timeOfDay":"夜","locationName":"地下室门口","characterNames":["布拉姆","娜塔莉亚"],"paragraphCount":4,"charCount":151}]},{"index":29,"id":"episode-1214","number":"二十九","title":"第二十九集","sceneCount":1,"paragraphCount":29,"charCount":1790,"scenes":[{"index":1,"id":"scene-1215-60513","sceneNumber":"29-1","title":"29-1 夜 内 收藏室","type":"INT","timeOfDay":"夜","locationName":"收藏室","characterNames":["娜塔莉亚","布拉姆"],"paragraphCount":29,"charCount":1790}]},{"index":30,"id":"episode-1249","number":"三十","title":"第三十集","sceneCount":2,"paragraphCount":27,"charCount":1649,"scenes":[{"index":1,"id":"scene-1250-62371","sceneNumber":"30-1","title":"30-1 夜 内 画室","type":"INT","timeOfDay":"夜","locationName":"画室","characterNames":["娜塔莉亚","布拉姆"],"paragraphCount":18,"charCount":1240},{"index":2,"id":"scene-1271-63657","sceneNumber":"30-2","title":"30-2 日 内 餐厅","type":"INT","timeOfDay":"日","locationName":"餐厅","characterNames":["女佣","娜塔莉亚","塞莱特斯","布拉姆","女佣"],"paragraphCount":9,"charCount":409}]},{"index":31,"id":"episode-1285","number":"三十一","title":"第三十一集","sceneCount":2,"paragraphCount":23,"charCount":1138,"scenes":[{"index":1,"id":"scene-1286-64123","sceneNumber":"31-1","title":"31-1 日 内 餐厅","type":"INT","timeOfDay":"日","locationName":"餐厅","characterNames":["女佣","娜塔莉亚","塞莱特斯","布拉姆"],"paragraphCount":21,"charCount":1065},{"index":2,"id":"scene-1310-65246","sceneNumber":"31-2","title":"31-2 夜 内 塞莱特斯的房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯的房间","characterNames":["塞莱特斯","布拉姆"],"paragraphCount":2,"charCount":73}]},{"index":32,"id":"episode-1317","number":"三十二","title":"第三十二集","sceneCount":1,"paragraphCount":21,"charCount":1682,"scenes":[{"index":1,"id":"scene-1318-65363","sceneNumber":"32-1","title":"32-1 夜 内 塞莱特斯的房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯的房间","characterNames":["塞莱特斯","布拉姆"],"paragraphCount":21,"charCount":1682}]},{"index":33,"id":"episode-1344","number":"三十三","title":"第三十三集","sceneCount":2,"paragraphCount":31,"charCount":1879,"scenes":[{"index":1,"id":"scene-1345-67108","sceneNumber":"33-1","title":"33-1 夜 内 塞莱特斯的房间","type":"INT","timeOfDay":"夜","locationName":"塞莱特斯的房间","characterNames":["娜塔莉亚","布拉姆","塞莱特斯"],"paragraphCount":7,"charCount":585},{"index":2,"id":"scene-1355-67739","sceneNumber":"33-2","title":"33-2 日 内 别墅走廊","type":"INT","timeOfDay":"日","locationName":"别墅走廊","characterNames":["女佣","布拉姆","塞莱特斯","娜塔莉亚"],"paragraphCount":24,"charCount":1294}]},{"index":34,"id":"episode-1384","number":"三十四","title":"第三十四集","sceneCount":2,"paragraphCount":27,"charCount":1290,"scenes":[{"index":1,"id":"scene-1385-69104","sceneNumber":"34-1","title":"34-1 日 内 别墅走廊","type":"INT","timeOfDay":"日","locationName":"别墅走廊","characterNames":["女佣","布拉姆","塞莱特斯","娜塔莉亚"],"paragraphCount":19,"charCount":892},{"index":2,"id":"scene-1407-70054","sceneNumber":"34-2","title":"34-2 夜 外 海边","type":"EXT","timeOfDay":"夜","locationName":"海边","characterNames":["布拉姆","娜塔莉亚","塞莱特斯","神秘人"],"paragraphCount":8,"charCount":398}]},{"index":35,"id":"episode-1420","number":"三十五","title":"第三十五集","sceneCount":1,"paragraphCount":31,"charCount":1683,"scenes":[{"index":1,"id":"scene-1421-70507","sceneNumber":"35-1","title":"35-1 夜 内 庄园客厅","type":"INT","timeOfDay":"夜","locationName":"庄园客厅","characterNames":["伊丽莎白","莱恩","娜塔莉亚","布拉姆","佣人安保若干","女佣","安保","塞莱特斯","神秘人（娜塔莉亚养父：焦恩）"],"paragraphCount":31,"charCount":1683}]},{"index":36,"id":"episode-1457","number":"三十六","title":"第三十六集","sceneCount":1,"paragraphCount":33,"charCount":1442,"scenes":[{"index":1,"id":"scene-1458-72311","sceneNumber":"36-1","title":"36-1 夜 内 庄园客厅","type":"INT","timeOfDay":"夜","locationName":"庄园客厅","characterNames":["伊丽莎白","莱恩","娜塔莉亚","布拉姆","佣人安保若干","女佣","安保","塞莱特斯","神秘人（娜塔莉亚养父：焦恩）"],"paragraphCount":33,"charCount":1442}]},{"index":37,"id":"episode-1496","number":"三十七","title":"第三十七集","sceneCount":2,"paragraphCount":17,"charCount":1029,"scenes":[{"index":1,"id":"scene-1497-73876","sceneNumber":"37-1","title":"37-1 夜 内 庄园客厅","type":"INT","timeOfDay":"夜","locationName":"庄园客厅","characterNames":["伊丽莎白","莱恩","娜塔莉亚","布拉姆","佣人安保若干","女佣","安保","塞莱特斯","神秘人（娜塔莉亚养父：焦恩）"],"paragraphCount":12,"charCount":821},{"index":2,"id":"scene-1512-74792","sceneNumber":"37-2","title":"37-2 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["伊丽莎白","莱恩","娜塔莉亚","布拉姆","佣人安保若干","女佣","安保","塞莱特斯","神秘人（娜塔莉亚养父：焦恩）","玛莉"],"paragraphCount":5,"charCount":208}]},{"index":38,"id":"episode-1522","number":"三十八","title":"第三十八集","sceneCount":1,"paragraphCount":34,"charCount":1990,"scenes":[{"index":1,"id":"scene-1523-75095","sceneNumber":"38-1","title":"38-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["伊丽莎白","莱恩","娜塔莉亚","布拉姆","佣人安保若干","女佣","安保","塞莱特斯","神秘人（娜塔莉亚养父：焦恩）"],"paragraphCount":34,"charCount":1990}]},{"index":39,"id":"episode-1562","number":"三十九","title":"第三十九集","sceneCount":1,"paragraphCount":32,"charCount":2459,"scenes":[{"index":1,"id":"scene-1563-77206","sceneNumber":"39-1","title":"39-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["伊丽莎白","莱恩","娜塔莉亚","布拉姆","佣人安保若干","女佣","安保","塞莱特斯","神秘人（娜塔莉亚养父：焦恩）"],"paragraphCount":32,"charCount":2459}]},{"index":40,"id":"episode-1600","number":"四十","title":"第四十集","sceneCount":2,"paragraphCount":46,"charCount":2212,"scenes":[{"index":1,"id":"scene-1601-79783","sceneNumber":"40-1","title":"40-1 日 内 戴安娜的房间","type":"INT","timeOfDay":"日","locationName":"戴安娜的房间","characterNames":["娜塔莉亚","戴安娜","玛莉"],"paragraphCount":22,"charCount":933},{"index":2,"id":"scene-1626-80773","sceneNumber":"40-2","title":"40-2 日 内 庄园客厅","type":"INT","timeOfDay":"日","locationName":"庄园客厅","characterNames":["塞莱特斯","娜塔莉亚","戴安娜","佛西","焦恩","玛莉"],"paragraphCount":24,"charCount":1279}]}],"totalScenes":75,"totalParagraphs":1303,"totalChars":77513,"recommendedBatchMaxChars":2500,"duplicateSceneNumbers":["1-5","13-2","18-2"]}

【工具 asset.list 执行成功】
{"projectId":"proj_1793879628309","source":"project","type":"characters","total":2,"offset":0,"items":[{"id":"char_1794652576078_d31r5_0","name":"娜塔莉亚","role":"心理医生（主角）","description":"第一集核心角色，22岁心理医生。首次出场于1-2医院办公室，独自面对姐姐玛莉留下的血书与受虐照片，悲痛欲绝。姐姐玛莉幼年将收养机会让给她，二人约定重逢；成年后娜塔莉亚发现姐姐遭布莱克伍德家族折磨，决心潜入该家族营救姐姐。8岁前在贫民窟与姐姐相依为命，被养父母收养。","appearance":"22岁成年女性，心理医生；第一集医院办公室场景中坐在椅子上捏着照片、握信落泪，未描写具体服饰。","versions":[{"id":"char_1794652576078_d31r5_0","name":"常服","description":"第一集核心角色，22岁心理医生。首次出场于1-2医院办公室，独自面对姐姐玛莉留下的血书与受虐照片，悲痛欲绝。姐姐玛莉幼年将收养机会让给她，二人约定重逢；成年后娜塔莉亚发现姐姐遭布莱克伍德家族折磨，决心潜入该家族营救姐姐。8岁前在贫民窟与姐姐相依为命，被养父母收养。","role":"心理医生（主角）","appearance":"22岁成年女性，心理医生；第一集医院办公室场景中坐在椅子上捏着照片、握信落泪，未描写具体服饰。","sourceScenes":["第一集 1-2 日  内   医院办公室","第一集 1-4 日  内   医院办公室"],"provenanceStatus":"verified","verifiedProvenance":[{"sceneId":"sc-7-151","sceneTitle":"第一集 1-2 日  内   医院办公室","count":3,"lines":[12,14,15]},{"sceneId":"sc-27-1373","sceneTitle":"第一集 1-4 日  内   医院办公室","count":4,"lines":[31,33,36,37]}]},{"id":"char_1794652576078_d31r5_0_charv_1","name":"8岁幼年","description":"娜塔莉亚8岁时的幼年形象，与姐姐小玛莉在贫民窟门口，被养父母收养，与姐姐分离。","appearance":"8岁小女孩，穿着破烂的衣服，趴在养父肩膀上，落泪伸手想抓住姐姐。","aliases":["小娜塔莉亚"],"verifiedProvenance":[{"sceneId":"sc-16-679","sceneTitle":"第一集 1-3 贫民窟门口   日   外","count":4,"lines":[19,21,24,26]}],"provenanceStatus":"verified","sourceScenes":["第一集 1-3 贫民窟门口   日   外"]},{"id":"char_1794652576078_d31r5_0_charv_2","name":"居家日常","description":"娜塔莉亚在家中收拾行李、与养父焦恩对话时的居家造型，准备前往布莱克伍德庄园应聘。","appearance":"居家日常装束，收拾皮包、将衣物放入包中；握拳、看向镜中自己的脸，神情坚定。","aliases":["娜塔莉娅"],"verifiedProvenance":[{"sceneId":"sc-38-1953","sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","count":9,"lines":[42,43,44,45,46,47,48,49,50]}],"provenanceStatus":"verified","sourceScenes":["第一集 1-5 日  内  娜塔莉亚家"]},{"id":"char_1794652576078_d31r5_0_charv_3","name":"职业装+黑框眼镜应聘","description":"娜塔莉亚前往布莱克伍德庄园应聘心理医生时的造型，穿职业装、戴黑框眼镜、抱着厚厚简历，主动站出来争取诊治小姐的机会。","appearance":"穿着职业装，戴一副黑框眼镜，抱着厚厚的简历","aliases":["应聘者娜塔莉亚"],"verifiedProvenance":[{"sceneId":"sc-51-2776","sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","count":16,"lines":[56,57,59,72,73,74,75,76,77,78,79,80,81,82,83,84]}],"provenanceStatus":"verified","sourceScenes":["第一集 1-5 日 外 布莱克伍德庄园"]}],"verifiedProvenanceCount":36,"provenanceStatus":"verified","sourceScenes":["第一集 1-2 日  内   医院办公室","第一集 1-4 日  内   医院办公室","第一集 1-3 贫民窟门口   日   外","第一集 1-5 日  内  娜塔莉亚家","第一集 1-5 日 外 布莱克伍德庄园"]},{"id":"char_1794654458918_mk6wm_0","name":"布拉姆","role":"布莱克伍德家主/教父","description":"布莱克伍德家主，权势滔天的教父，娜塔莉亚姐姐的丈夫，后迎娶贵族之女塞莱特斯。首次出场于第一集 1-5 日 外 布莱克伍德庄园，坐于主位主持心理医生招募。","appearance":"衣着华丽，随意把玩着手中的手枪，坐于主位，目光扫视众人，指尖掠过娜塔莉亚脸颊。","verifiedProvenance":[{"sceneId":"sc-51-2776","sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","count":10,"lines":[56,57,58,59,74,75,77,78,80,83]}],"provenanceStatus":"verified","sourceScenes":["第一集 1-5 日 外 布莱克伍德庄园"]}]}
```

### [第 4 轮] 模型原始输出
```text
状态检查：
- 最终目标：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）。
- 本轮执行结果：已获取同类任务经验；已读取剧本目录（40集75场1303段77513字，触发数据量提醒）与角色资产（娜塔莉亚含4版本、布拉姆无版本）；场景/道具资产尚未查询。
- 原计划完成度：[x] 搜集足够的信息；[ ] 制定清晰计划并分批实施；[ ] 全局验收结案。
- 工具箱准备：需补充查询场景/道具资产现状，并确认用户具体意图（当前用户仅打招呼，聚焦面板显示场景0、道具0）。

思考：
- 用户仅说“你好”，聚焦目标为资产清单面板，但具体意图（是补全场景/道具？还是继续角色建档？还是仅查看？）存在客观歧义，无法仅凭项目数据自证。
- 按边界确认原则，应先向用户确认意图，再制定分批计划，避免盲目建档。
- 当前计划保持宏观阶段，待用户回复后动态重规划。

工具调用：
{{调用 user.ask}}

用户沟通：
- 对用户说的话（简版）：“你好！想确认下这次要整理哪些资产？”
- 对用户说的话（完整版）：“你好，我是 Mira。我已查看了项目现状：剧本共40集75场，目前角色资产有2个（娜塔莉亚含4个造型版本、布拉姆暂无版本），场景和道具资产都还是0。想先跟你确认一下这次的目标——是想让我从剧本里补全场景和道具资产，还是继续完善角色（比如给布拉姆补造型版本），或者只是先看看现有清单？你告诉我方向，我就按批次推进建档。”
```

### [第 4 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`user.ask` (running)
**工具输入 (Input)**：
```json
{}
```
**工具输出 (Output)**：
```json
{
  "question": "你好，我是 Mira。我已查看了项目现状：剧本共40集75场，目前角色资产有2个（娜塔莉亚含4个造型版本、布拉姆暂无版本），场景和道具资产都还是0。想先跟你确认一下这次的目标——是想让我从剧本里补全场景和道具资产，还是继续完善角色（比如给布拉姆补造型版本），或者只是先看看现有清单？你告诉我方向，我就按批次推进建档。",
  "shortQuestion": "你好！想确认下这次要整理哪些资产？",
  "agentContext": "状态检查：\n- 最终目标：围绕资产清单面板完成角色/场景/道具的资产建档与整理（具体意图待用户确认后细化）。\n- 本轮执行结果：已获取同类任务经验；已读取剧本目录（40集75场1303段77513字，触发数据量提醒）与角色资产（娜塔莉亚含4版本、布拉姆无版本）；场景/道具资产尚未查询。\n- 原计划完成度：[x] 搜集足够的信息；[ ] 制定清晰计划并分批实施；[ ] 全局验收结案。\n- 工具箱准备：需补充查询场景/道具资产现状，并确认用户具体意图（当前用户仅打招呼，聚焦面板显示场景0、道具0）。\n\n思考：\n- 用户仅说“你好”，聚焦目标为资产清单面板，但具体意图（是补全场景/道具？还是继续角色建档？还是仅查看？）存在客观歧义，无法仅凭项目数据自证。\n- 按边界确认原则，应先向用户确认意图，再制定分批计划，避免盲目建档。\n- 当前计划保持宏观阶段，待用户回复后动态重规划。\n\n工具调用：",
  "status": "waiting_user"
}
```
