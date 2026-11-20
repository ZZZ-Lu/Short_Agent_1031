# 任务运行追踪明细（共 11 轮）：提取第四场资产
- **最终目标**：读取剧本第四场正文，提取其中角色/场景/道具资产并建档（已有资产增量追加出处），最终核验无遗漏后结案。
- **任务状态**：completed · **总耗时**：123.0 s
- **最新进展**：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）、查重、场景「二楼六个卧室」与道具「智能手环」第4场出处追加，并逐段核验确认无遗漏，全部计划步骤完成，已调用 sys.endTask 成功结案。（小目标：全局核验上一阶段执行结果并推进下一步或结案）
- **缓存命中汇总**：主循环命中 24448 / 46847 tokens (52.2%) · 状态节点命中 7552 / 16210 tokens (46.6%)

---
## 第 1 轮（耗时：4682 ms (4.68 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 1169 tokens · 缓存命中 896 (76.6%) · 输出 195

### [第 1 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断, 写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属或关键取舍存在客观歧义时，主动通过 user.ask 简明征询用户意见；在目标明确时保持自主执行。
3. 通用四段式输出协议：每次回复都必须严格依次输出以下 4 个完整区块：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行逻辑推演、意图识别与参数核对}
   - 工具调用：{严格按双花括号格式输出指令：{{调用 工具名称, {"参数名": "参数值"}}}，无参数简写为 {{调用 工具名称}}}
   - 用户沟通：{常规中间推进轮次输出“- 对用户说的话（简版）”（30字以内）；只有输出长内容时填入完整版内容，一般情况直接忽略，不写}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，核心职责是按以下闭环推进任务：
0. 意图识别：结合用户输入与当前聚焦目标判断诉求——若可直接作答则回复并调用 sys.endTask 结束；若意图模糊或边界不清则调用 user.ask 确认；若为明确可执行任务则进入下方流程；
1. 检索同类任务经验：初启时调用 experience.search（可与 sys.selectContext 同轮并发）；
2. 探查与制定计划：探查数据分布，动态重规划“当前计划”（将任务拆解为首批读取+创建、后续读取+增量更新闭环步骤）；
3. 实施：成套装载工具切入执行；
4. 验收：确认全部达成后调用 sys.endTask 结案。

# 输出格式
状态检查：
{盘点认知状态、本轮工具事实、意图判断与原计划完成度}
思考：
{内心独白：1. 意图识别与策略推演；2. 制定或更新当前计划步骤（[x]/[ ]）；3. 下一步行动与重点参数}
工具调用：
{按格式输出本轮要调用的工具指令}
用户沟通：
{
- 对用户说的话（简版）：“...”
思考：{是否必须输出长内容，再无其它办法}
- 对用户说的话（完整版）：“（按需选填）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；仅在识别出明确可执行任务且尚未检索经验时调用，可与首次展开工具分类的 sys.selectContext 同轮并发调用；日常寒暄、能力咨询或待用户澄清意图时不调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 可装载的工具分类（传 categories 展开对应候选工具简表）
- script（剧本工具箱）：读取分集目录、编辑目录条目（重命名/增删/拆分/合并/调整顺序）、分页读取剧本正文、搜索关键词
- asset（资产工具箱）：查询、新增、修改、删除角色/场景/道具资产，检索与锚定剧本出处，绑定资产图
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

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
当前收到明确任务“提取第四场的全部资产”，聚焦目标为资产面板容器。尚未检索经验、未探查剧本结构，需先检索同类任务经验并装载工具。
思考：
1. 意图识别：明确可执行任务——读取剧本第四场正文，提取其中角色/场景/道具资产并建档。
2. 制定计划：[ ] 检索经验并装载工具；[ ] 定位第四场正文；[ ] 提取资产清单；[ ] 创建/更新资产；[ ] 验收结案。
3. 下一步：并发检索经验与展开工具分类。
工具调用：
{{调用 experience.search, {"query": "提取剧本某一场次的全部资产并建档"}}}
{{调用 sys.selectContext, {"categories": ["script", "asset"]}}}
用户沟通：
- 对用户说的话（简版）：“我先查经验并装载工具，随后定位第四场提取资产。”
```

### [第 1 轮] 工具调用记录（共 2 个）
#### 🛠️ 工具 1：`experience.search` (succeeded)
**工具输入 (Input)**：
```json
{
  "query": "提取剧本某一场次的全部资产并建档"
}
```
**工具输出 (Output)**：
```json
{
  "query": "提取剧本某一场次的全部资产并建档",
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
    "asset"
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
    "asset"
  ],
  "transition": "expand_categories"
}
```

---
## 第 2 轮（耗时：4115 ms (4.12 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 2336 tokens · 缓存命中 1152 (49.3%) · 输出 234

### [第 2 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断, 写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属或关键取舍存在客观歧义时，主动通过 user.ask 简明征询用户意见；在目标明确时保持自主执行。
3. 通用四段式输出协议：每次回复都必须严格依次输出以下 4 个完整区块：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行逻辑推演、意图识别与参数核对}
   - 工具调用：{严格按双花括号格式输出指令：{{调用 工具名称, {"参数名": "参数值"}}}，无参数简写为 {{调用 工具名称}}}
   - 用户沟通：{常规中间推进轮次输出“- 对用户说的话（简版）”（30字以内）；只有输出长内容时填入完整版内容，一般情况直接忽略，不写}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，核心职责是按以下闭环推进任务：
0. 意图识别：结合用户输入与当前聚焦目标判断诉求——若可直接作答则回复并调用 sys.endTask 结束；若意图模糊或边界不清则调用 user.ask 确认；若为明确可执行任务则进入下方流程；
1. 检索同类任务经验：初启时调用 experience.search（可与 sys.selectContext 同轮并发）；
2. 探查与制定计划：探查数据分布，动态重规划“当前计划”（将任务拆解为首批读取+创建、后续读取+增量更新闭环步骤）；
3. 实施：成套装载工具切入执行；
4. 验收：确认全部达成后调用 sys.endTask 结案。

# 输出格式
状态检查：
{盘点认知状态、本轮工具事实、意图判断与原计划完成度}
思考：
{内心独白：1. 意图识别与策略推演；2. 制定或更新当前计划步骤（[x]/[ ]）；3. 下一步行动与重点参数}
工具调用：
{按格式输出本轮要调用的工具指令}
用户沟通：
{
- 对用户说的话（简版）：“...”
思考：{是否必须输出长内容，再无其它办法}
- 对用户说的话（完整版）：“（按需选填）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；仅在识别出明确可执行任务且尚未检索经验时调用，可与首次展开工具分类的 sys.selectContext 同轮并发调用；日常寒暄、能力咨询或待用户澄清意图时不调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset]）
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（附每集/场次字数与单批字数上限建议）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

## 其它未展开的工具分类（可传 categories 补充展开）
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档。
当前计划：[x] 检索经验并装载工具
[ ] 定位第四场正文
[ ] 提取资产清单
[ ] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成经验检索与工具分类展开，尚未定位第四场正文或提取资产，整体处于计划制定后的初始阶段。

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

【工具 sys.selectContext 执行成功】已展开工具分类 [script, asset] 的候选工具简表（请从上方候选简表中按需挑选本次执行所需的具体工具 ID 填入 tools，调用 sys.selectContext({"tools": [...]}) 进入局部执行阶段）
```

### [第 2 轮] 模型原始输出
```text
状态检查：
- 已检索到同类任务最佳实践经验，已展开 script/asset 工具分类。
- 尚未定位第四场正文，未提取资产，未创建资产。
- 意图明确：提取第四场全部资产，进入执行流程。

思考：
1. 意图识别：用户要求提取第四场全部资产，属明确可执行任务。
2. 当前计划：
   - [x] 检索经验并装载工具
   - [ ] 定位第四场正文（先读目录确认场次 ID 与字数）
   - [ ] 提取资产清单
   - [ ] 创建/更新资产
   - [ ] 验收结案
3. 下一步：先装载 script.directory、script.read、asset.list、asset.create、asset.update，读取目录定位第四场，并查重现有资产。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.directory", "script.read", "asset.list", "asset.create", "asset.update"]}}}

用户沟通：
- 对用户说的话（简版）：“先定位第四场并查重现有资产。”
```

### [第 2 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.directory",
    "script.read",
    "asset.list",
    "asset.create",
    "asset.update"
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
    "script.read",
    "asset.list",
    "asset.create",
    "asset.update"
  ],
  "prompts": [
    "script",
    "assets"
  ],
  "categories": [
    "script",
    "asset"
  ],
  "transition": "enter_execution"
}
```

---
## 第 3 轮（耗时：4102 ms (4.10 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (7)：`sys.selectContext, script.directory, script.read, asset.list, asset.create, asset.update, user.ask`
- **Token 与缓存**：Prompt 3516 tokens · 缓存命中 3072 (87.4%) · 输出 186

### [第 3 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 须基于 script.read 已读出的剧本正文创建资产（多场次分步执行时，首场读完调用 asset.create 建卡，后续场次读完调用 asset.update 增量追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属、防混淆辨识特征及相关背景信息；appearance（或 visualDetails/atmosphere/materialAndState）仅记录当前已读场次正文中明确写出的外貌、服饰或状态事实（若当前已读场次未描写具体服饰或配饰，保持客观基础描述，勿凭角色职业或身份提前预设未读场次的装束）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），在 versions 数组中传入对应版本并分别绑定各自造型的 provenances 与 aliases，或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处段落锚点）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”（相关背景信息归入 description）；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，再将核实为“是”的序号传入 sceneTitle 与 paragraphIndices: [1, 2, 3]（若单次读取返回了多个同名子场次，可在 provenances 数组中按各自完整场次标题分别并列提交），系统会自动映射行号与原文，无需重复手填 evidenceText。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }
- asset.update：按资产 ID 或版本 ID 修改属性、追加新版本（versions）或补充出处（provenances）。规则：① 按场次判定造型版本并对号入座：主卡顶层 provenances 对应资产首次建卡时的初始默认造型/状态（如默认常服、默认日夜或初始形态），当所读场次中资产仍为或回归该初始默认造型/状态时，直接向主卡 ID 顶层传 provenances 增量追加出处（或向已有对应版本的 ID 传 provenances 追加）；当所读场次中资产呈现出尚未建立的新视觉造型或状态（如新的年龄阶段、新的具体服装造型、新的日夜或形态状态）时，通过 versions 数组传入以该具体视觉特征命名的新版本对象（含 name、description、appearance、aliases，且该新版本的 provenances 仅绑定属于该新造型的场次；同一轮支持顶层 provenances 与 versions 同时传入，系统会自动将顶层出处归入原主造型并与各新版本并列保留）；② provenances（画面出处）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，将判定为“是”的序号按各自场次所属造型分别传入顶层 provenances 或对应 versions 项的 provenances 中；③ 合并语义：mode 默认 "append" 增量保留已有版本与出处（全量覆盖传 "overwrite"）；顶层文本字段（如 description、appearance）传入即替换原值，仅追加出处或版本时无需传顶层文本字段。
  参数：{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", provenances?: Array<{ sceneTitle: string, paragraphIndices: number[] }>, versions?: Array<同 asset.create.versions>, name?: string, description?: string, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档。
当前计划：[x] 检索经验并装载工具
[ ] 读取目录定位第四场正文并查重现有资产
[ ] 提取资产清单
[ ] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：读取剧本目录定位第四场正文，并查重现有资产
当前进度：已完成经验检索与工具装载，尚未读取目录或正文，未定位第四场，未提取或创建资产，整体处于执行阶段起点。

# 工具执行结果
【工具 sys.selectContext 执行成功】已进入局部执行阶段，当前已装载工具：script.directory, script.read, asset.list, asset.create, asset.update
```

### [第 3 轮] 模型原始输出
```text
状态检查：
- 当前执行计划第 2 步“读取目录定位第四场正文并查重现有资产”，尚未读取任何目录或正文。
- 本轮 sys.selectContext 返回成功，工具已装载完毕，处于可执行状态。
- 重点笔记：需先确认“第四场”指哪一集哪一场（可能是第一集第4场，也可能目录中有多个“4”编号），并查重现有资产避免重复建卡。

思考：
先调用 script.directory 读取剧本目录概览，定位“第四场”对应的唯一场次 ID 与字数，同时后续需用 asset.list 查重。本轮先读目录，拿到真实场次信息后再决定读取正文与查重顺序。

工具调用：
{{调用 script.directory}}

用户沟通：
- 对用户说的话（简版）：正在读取剧本目录，定位第四场位置～
```

### [第 3 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.directory` (succeeded)
**工具输入 (Input)**：
```json
{}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "total": 1,
  "offset": 0,
  "entries": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "二",
      "title": "第二集：雷在谁身上（Who's Stepping on the Mine?）",
      "sceneCount": 23,
      "paragraphCount": 280,
      "charCount": 32667,
      "scenes": [
        {
          "index": 1,
          "id": "scene-3-41",
          "sceneNumber": "第1场",
          "title": "第1场 一号排练室 帮Marcus改歌",
          "locationName": "一号排练室 帮Marcus改歌",
          "paragraphCount": 10,
          "charCount": 1269
        },
        {
          "index": 2,
          "id": "scene-15-1342",
          "sceneNumber": "第2场",
          "title": "第2场 二号排练室 帮Remy删高音",
          "locationName": "二号排练室 帮Remy删高音",
          "paragraphCount": 9,
          "charCount": 1158
        },
        {
          "index": 3,
          "id": "scene-26-2530",
          "sceneNumber": "第3场",
          "title": "第3场 凌晨两点 埋雷",
          "locationName": "凌晨两点 埋雷",
          "paragraphCount": 9,
          "charCount": 547
        },
        {
          "index": 4,
          "id": "scene-37-3100",
          "sceneNumber": "第4场",
          "title": "第4场 午夜红光惊魂",
          "locationName": "午夜红光惊魂",
          "paragraphCount": 5,
          "charCount": 255
        },
        {
          "index": 5,
          "id": "scene-44-3373",
          "sceneNumber": "第5场",
          "title": "第5场 镜头穿梭六个房间",
          "locationName": "镜头穿梭六个房间",
          "paragraphCount": 5,
          "charCount": 713
        },
        {
          "index": 6,
          "id": "scene-50-4104",
          "sceneNumber": "第6场",
          "title": "第6场 现场 一楼大厅",
          "locationName": "现场 一楼大厅",
          "paragraphCount": 11,
          "charCount": 524
        },
        {
          "index": 7,
          "id": "scene-65-4655",
          "sceneNumber": "第7场",
          "title": "第7场 宿舍餐厅暴风眼早餐桌",
          "locationName": "宿舍餐厅暴风眼早餐桌",
          "characterNames": [
            "12位选手"
          ],
          "paragraphCount": 19,
          "charCount": 2870
        },
        {
          "index": 8,
          "id": "scene-90-7576",
          "sceneNumber": "第8场",
          "title": "第8场 后采-小黑屋Wren独白",
          "locationName": "后采-小黑屋Wren独白",
          "paragraphCount": 3,
          "charCount": 369
        },
        {
          "index": 9,
          "id": "scene-95-7967",
          "sceneNumber": "第9场",
          "title": "第9场 现场-餐桌另一头Ines套话Nico",
          "locationName": "现场-餐桌另一头Ines套话Nico",
          "paragraphCount": 8,
          "charCount": 1500
        },
        {
          "index": 10,
          "id": "scene-106-9500",
          "sceneNumber": "第10场",
          "title": "第10场 咖啡机旁 前任组暗中交锋",
          "locationName": "咖啡机旁 前任组暗中交锋",
          "paragraphCount": 4,
          "charCount": 809
        },
        {
          "index": 11,
          "id": "scene-111-10331",
          "sceneNumber": "第11场",
          "title": "第11场 现场-Avery求助Juno",
          "locationName": "现场-Avery求助Juno",
          "paragraphCount": 10,
          "charCount": 1919
        },
        {
          "index": 12,
          "id": "scene-125-12285",
          "sceneNumber": "第12场",
          "title": "第12场 地下金库商店排雷",
          "locationName": "地下金库商店排雷",
          "characterNames": [
            "Marcus",
            "Remy",
            "Diego",
            "Ines",
            "Val",
            "Juno",
            "Bennett",
            "Ruth"
          ],
          "paragraphCount": 13,
          "charCount": 1542
        },
        {
          "index": 13,
          "id": "scene-143-13907",
          "sceneNumber": "第13场",
          "title": "第13场 全息高定衣橱区",
          "locationName": "全息高定衣橱区",
          "paragraphCount": 20,
          "charCount": 2713
        },
        {
          "index": 14,
          "id": "scene-168-16660",
          "sceneNumber": "第16场",
          "title": "第16场",
          "characterNames": [
            "Wren",
            "Nico",
            "Ines",
            "Marcus"
          ],
          "paragraphCount": 18,
          "charCount": 2209
        },
        {
          "index": 15,
          "id": "scene-190-18920",
          "sceneNumber": "第17场",
          "title": "第17场",
          "paragraphCount": 5,
          "charCount": 498
        },
        {
          "index": 16,
          "id": "scene-197-19430",
          "sceneNumber": "第18场",
          "title": "第18场",
          "paragraphCount": 22,
          "charCount": 1576
        },
        {
          "index": 17,
          "id": "scene-224-21040",
          "sceneNumber": "第20场",
          "title": "第20场 请君入瓮 押当闭麦权",
          "locationName": "请君入瓮 押当闭麦权",
          "characterNames": [
            "Wren",
            "Diego",
            "Marcus",
            "Ruth",
            "Bennett"
          ],
          "paragraphCount": 20,
          "charCount": 2605
        },
        {
          "index": 18,
          "id": "scene-249-23721",
          "sceneNumber": "第21场",
          "title": "第21场 储物间交易",
          "locationName": "储物间交易",
          "paragraphCount": 34,
          "charCount": 3975
        },
        {
          "index": 19,
          "id": "scene-289-27753",
          "sceneNumber": "第24场",
          "title": "第24场 傍晚晚饭时分 攻击与保护锁死",
          "locationName": "傍晚晚饭时分 攻击与保护锁死",
          "paragraphCount": 14,
          "charCount": 1697
        },
        {
          "index": 20,
          "id": "scene-306-29486",
          "sceneNumber": "第25场",
          "title": "第25场 厨房洗碗戏 Bennett偷走Ruth伤疤",
          "locationName": "厨房洗碗戏 Bennett偷走Ruth伤疤",
          "paragraphCount": 17,
          "charCount": 1960
        },
        {
          "index": 21,
          "id": "scene-325-31493",
          "sceneNumber": "第26场",
          "title": "第26场 午夜十二点 万人竞演前夜",
          "locationName": "午夜十二点 万人竞演前夜",
          "paragraphCount": 5,
          "charCount": 575
        },
        {
          "index": 22,
          "id": "scene-333-32093",
          "sceneNumber": "第27场",
          "title": "第27场 深夜一楼琴房 Avery的破音",
          "locationName": "深夜一楼琴房 Avery的破音",
          "paragraphCount": 8,
          "charCount": 519
        },
        {
          "index": 23,
          "id": "scene-343-32643",
          "sceneNumber": "第28场",
          "title": "第28场 次日万人体育馆最后一次联排",
          "locationName": "次日万人体育馆最后一次联排",
          "paragraphCount": 11,
          "charCount": 865
        }
      ]
    }
  ],
  "nextOffset": null,
  "totalScenes": 23,
  "totalParagraphs": 280,
  "totalChars": 32667,
  "recommendedBatchMaxChars": 2500,
  "scenesSummary": [
    "第1场 一号排练室 帮Marcus改歌 (10段/1269字)",
    "第2场 二号排练室 帮Remy删高音 (9段/1158字)",
    "第3场 凌晨两点 埋雷 (9段/547字)",
    "第4场 午夜红光惊魂 (5段/255字)",
    "第5场 镜头穿梭六个房间 (5段/713字)",
    "第6场 现场 一楼大厅 (11段/524字)",
    "第7场 宿舍餐厅暴风眼早餐桌 (19段/2870字)",
    "第8场 后采-小黑屋Wren独白 (3段/369字)",
    "第9场 现场-餐桌另一头Ines套话Nico (8段/1500字)",
    "第10场 咖啡机旁 前任组暗中交锋 (4段/809字)",
    "第11场 现场-Avery求助Juno (10段/1919字)",
    "第12场 地下金库商店排雷 (13段/1542字)",
    "第13场 全息高定衣橱区 (20段/2713字)",
    "第16场 (18段/2209字)",
    "第17场 (5段/498字)",
    "第18场 (22段/1576字)",
    "第20场 请君入瓮 押当闭麦权 (20段/2605字)",
    "第21场 储物间交易 (34段/3975字)",
    "第24场 傍晚晚饭时分 攻击与保护锁死 (14段/1697字)",
    "第25场 厨房洗碗戏 Bennett偷走Ruth伤疤 (17段/1960字)",
    "第26场 午夜十二点 万人竞演前夜 (5段/575字)",
    "第27场 深夜一楼琴房 Avery的破音 (8段/519字)",
    "第28场 次日万人体育馆最后一次联排 (11段/865字)"
  ]
}
```

---
## 第 4 轮（耗时：4149 ms (4.15 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (7)：`sys.selectContext, script.directory, script.read, asset.list, asset.create, asset.update, user.ask`
- **Token 与缓存**：Prompt 4975 tokens · 缓存命中 3200 (64.3%) · 输出 227

### [第 4 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 须基于 script.read 已读出的剧本正文创建资产（多场次分步执行时，首场读完调用 asset.create 建卡，后续场次读完调用 asset.update 增量追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属、防混淆辨识特征及相关背景信息；appearance（或 visualDetails/atmosphere/materialAndState）仅记录当前已读场次正文中明确写出的外貌、服饰或状态事实（若当前已读场次未描写具体服饰或配饰，保持客观基础描述，勿凭角色职业或身份提前预设未读场次的装束）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），在 versions 数组中传入对应版本并分别绑定各自造型的 provenances 与 aliases，或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处段落锚点）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”（相关背景信息归入 description）；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，再将核实为“是”的序号传入 sceneTitle 与 paragraphIndices: [1, 2, 3]（若单次读取返回了多个同名子场次，可在 provenances 数组中按各自完整场次标题分别并列提交），系统会自动映射行号与原文，无需重复手填 evidenceText。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }
- asset.update：按资产 ID 或版本 ID 修改属性、追加新版本（versions）或补充出处（provenances）。规则：① 按场次判定造型版本并对号入座：主卡顶层 provenances 对应资产首次建卡时的初始默认造型/状态（如默认常服、默认日夜或初始形态），当所读场次中资产仍为或回归该初始默认造型/状态时，直接向主卡 ID 顶层传 provenances 增量追加出处（或向已有对应版本的 ID 传 provenances 追加）；当所读场次中资产呈现出尚未建立的新视觉造型或状态（如新的年龄阶段、新的具体服装造型、新的日夜或形态状态）时，通过 versions 数组传入以该具体视觉特征命名的新版本对象（含 name、description、appearance、aliases，且该新版本的 provenances 仅绑定属于该新造型的场次；同一轮支持顶层 provenances 与 versions 同时传入，系统会自动将顶层出处归入原主造型并与各新版本并列保留）；② provenances（画面出处）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，将判定为“是”的序号按各自场次所属造型分别传入顶层 provenances 或对应 versions 项的 provenances 中；③ 合并语义：mode 默认 "append" 增量保留已有版本与出处（全量覆盖传 "overwrite"）；顶层文本字段（如 description、appearance）传入即替换原值，仅追加出处或版本时无需传顶层文本字段。
  参数：{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", provenances?: Array<{ sceneTitle: string, paragraphIndices: number[] }>, versions?: Array<同 asset.create.versions>, name?: string, description?: string, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档。
当前计划：[x] 检索经验并装载工具
[ ] 读取目录定位第四场正文并查重现有资产
[ ] 提取资产清单
[ ] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：解析目录返回的场次ID与场次编号对应关系，定位“第四场”的唯一场次ID，并查重现有资产
当前进度：已完成经验检索与工具装载，并成功读取剧本目录（1集23场280段），但尚未从目录中明确解析出“第四场”对应的唯一场次ID，未读取正文，未提取或创建资产，整体仍处于执行阶段第2步。

# 工具执行结果
【工具 script.directory 执行成功】（共 1 个集数条目 | 场次总计: 23 | 段落总计: 280 | 正文字数: 32667 字 | 每轮建议上限: 2500 字）
{"total":1,"offset":0,"entries":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":23,"paragraphCount":280,"charCount":32667,"scenes":[{"index":1,"id":"scene-3-41","sceneNumber":"第1场","title":"第1场 一号排练室 帮Marcus改歌","locationName":"一号排练室 帮Marcus改歌","paragraphCount":10,"charCount":1269},{"index":2,"id":"scene-15-1342","sceneNumber":"第2场","title":"第2场 二号排练室 帮Remy删高音","locationName":"二号排练室 帮Remy删高音","paragraphCount":9,"charCount":1158},{"index":3,"id":"scene-26-2530","sceneNumber":"第3场","title":"第3场 凌晨两点 埋雷","locationName":"凌晨两点 埋雷","paragraphCount":9,"charCount":547},{"index":4,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255},{"index":5,"id":"scene-44-3373","sceneNumber":"第5场","title":"第5场 镜头穿梭六个房间","locationName":"镜头穿梭六个房间","paragraphCount":5,"charCount":713},{"index":6,"id":"scene-50-4104","sceneNumber":"第6场","title":"第6场 现场 一楼大厅","locationName":"现场 一楼大厅","paragraphCount":11,"charCount":524},{"index":7,"id":"scene-65-4655","sceneNumber":"第7场","title":"第7场 宿舍餐厅暴风眼早餐桌","locationName":"宿舍餐厅暴风眼早餐桌","characterNames":["12位选手"],"paragraphCount":19,"charCount":2870},{"index":8,"id":"scene-90-7576","sceneNumber":"第8场","title":"第8场 后采-小黑屋Wren独白","locationName":"后采-小黑屋Wren独白","paragraphCount":3,"charCount":369},{"index":9,"id":"scene-95-7967","sceneNumber":"第9场","title":"第9场 现场-餐桌另一头Ines套话Nico","locationName":"现场-餐桌另一头Ines套话Nico","paragraphCount":8,"charCount":1500},{"index":10,"id":"scene-106-9500","sceneNumber":"第10场","title":"第10场 咖啡机旁 前任组暗中交锋","locationName":"咖啡机旁 前任组暗中交锋","paragraphCount":4,"charCount":809},{"index":11,"id":"scene-111-10331","sceneNumber":"第11场","title":"第11场 现场-Avery求助Juno","locationName":"现场-Avery求助Juno","paragraphCount":10,"charCount":1919},{"index":12,"id":"scene-125-12285","sceneNumber":"第12场","title":"第12场 地下金库商店排雷","locationName":"地下金库商店排雷","characterNames":["Marcus","Remy","Diego","Ines","Val","Juno","Bennett","Ruth"],"paragraphCount":13,"charCount":1542},{"index":13,"id":"scene-143-13907","sceneNumber":"第13场","title":"第13场 全息高定衣橱区","locationName":"全息高定衣橱区","paragraphCount":20,"charCount":2713},{"index":14,"id":"scene-168-16660","sceneNumber":"第16场","title":"第16场","characterNames":["Wren","Nico","Ines","Marcus"],"paragraphCount":18,"charCount":2209},{"index":15,"id":"scene-190-18920","sceneNumber":"第17场","title":"第17场","paragraphCount":5,"charCount":498},{"index":16,"id":"scene-197-19430","sceneNumber":"第18场","title":"第18场","paragraphCount":22,"charCount":1576},{"index":17,"id":"scene-224-21040","sceneNumber":"第20场","title":"第20场 请君入瓮 押当闭麦权","locationName":"请君入瓮 押当闭麦权","characterNames":["Wren","Diego","Marcus","Ruth","Bennett"],"paragraphCount":20,"charCount":2605},{"index":18,"id":"scene-249-23721","sceneNumber":"第21场","title":"第21场 储物间交易","locationName":"储物间交易","paragraphCount":34,"charCount":3975},{"index":19,"id":"scene-289-27753","sceneNumber":"第24场","title":"第24场 傍晚晚饭时分 攻击与保护锁死","locationName":"傍晚晚饭时分 攻击与保护锁死","paragraphCount":14,"charCount":1697},{"index":20,"id":"scene-306-29486","sceneNumber":"第25场","title":"第25场 厨房洗碗戏 Bennett偷走Ruth伤疤","locationName":"厨房洗碗戏 Bennett偷走Ruth伤疤","paragraphCount":17,"charCount":1960},{"index":21,"id":"scene-325-31493","sceneNumber":"第26场","title":"第26场 午夜十二点 万人竞演前夜","locationName":"午夜十二点 万人竞演前夜","paragraphCount":5,"charCount":575},{"index":22,"id":"scene-333-32093","sceneNumber":"第27场","title":"第27场 深夜一楼琴房 Avery的破音","locationName":"深夜一楼琴房 Avery的破音","paragraphCount":8,"charCount":519},{"index":23,"id":"scene-343-32643","sceneNumber":"第28场","title":"第28场 次日万人体育馆最后一次联排","locationName":"次日万人体育馆最后一次联排","paragraphCount":11,"charCount":865}]}],"totalScenes":23,"totalParagraphs":280,"totalChars":32667,"recommendedBatchMaxChars":2500}
```

### [第 4 轮] 模型原始输出
```text
状态检查：
- 当前执行第2步“读取目录定位第四场正文并查重现有资产”的定位子任务。
- 本轮 script.directory 返回：第二集共23场，其中“第4场 午夜红光惊魂”唯一对应场次 ID `scene-37-3100`，5段、255字。
- 尚未读取正文，未查重资产，未提取或创建资产。

思考：
- 目录中“第4场”唯一，ID 为 scene-37-3100，标题“第4场 午夜红光惊魂”，仅255字，可一次读完。
- 下一步应读取该场正文，同时按关键词查重现有角色/场景/道具资产，避免重复建卡。
- 本轮先读正文，再据正文内容做资产查重与提取。

工具调用：
{{调用 script.read, {"episode": 1, "scene": "scene-37-3100"}}}

用户沟通：
- 对用户说的话（简版）：已定位第4场，正在读取正文。
```

### [第 4 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": 1,
  "scene": "scene-37-3100"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "total": 359,
  "offset": 37,
  "startLine": 37,
  "endLine": 43,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 1,
  "paragraphCount": 5,
  "charCount": 255,
  "recommendedBatchMaxChars": 2500,
  "hasVolumeWarning": false,
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "二",
      "title": "第二集：雷在谁身上（Who's Stepping on the Mine?）",
      "sceneCount": 1,
      "paragraphCount": 5,
      "charCount": 255,
      "scenes": [
        {
          "index": 1,
          "id": "scene-37-3100",
          "sceneNumber": "第4场",
          "title": "第4场 午夜红光惊魂",
          "locationName": "午夜红光惊魂",
          "paragraphCount": 5,
          "charCount": 255,
          "paragraphs": [
            {
              "index": 1,
              "text": "4.▲（大场面·午夜红光惊魂）"
            },
            {
              "index": 2,
              "text": "▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！"
            },
            {
              "index": 3,
              "text": "▲“嗡——嗡——嗡——嗡——！”"
            },
            {
              "index": 4,
              "text": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字："
            },
            {
              "index": 5,
              "text": "【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）"
            }
          ]
        }
      ]
    }
  ],
  "content": "第4场 午夜红光惊魂\n4.▲（大场面·午夜红光惊魂）\n▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！\n▲“嗡——嗡——嗡——嗡——！”\n▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）\n "
}
```

---
## 第 5 轮（耗时：5282 ms (5.28 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (7)：`sys.selectContext, script.directory, script.read, asset.list, asset.create, asset.update, user.ask`
- **Token 与缓存**：Prompt 5359 tokens · 缓存命中 3200 (59.7%) · 输出 650

### [第 5 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 须基于 script.read 已读出的剧本正文创建资产（多场次分步执行时，首场读完调用 asset.create 建卡，后续场次读完调用 asset.update 增量追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属、防混淆辨识特征及相关背景信息；appearance（或 visualDetails/atmosphere/materialAndState）仅记录当前已读场次正文中明确写出的外貌、服饰或状态事实（若当前已读场次未描写具体服饰或配饰，保持客观基础描述，勿凭角色职业或身份提前预设未读场次的装束）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），在 versions 数组中传入对应版本并分别绑定各自造型的 provenances 与 aliases，或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处段落锚点）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”（相关背景信息归入 description）；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，再将核实为“是”的序号传入 sceneTitle 与 paragraphIndices: [1, 2, 3]（若单次读取返回了多个同名子场次，可在 provenances 数组中按各自完整场次标题分别并列提交），系统会自动映射行号与原文，无需重复手填 evidenceText。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }
- asset.update：按资产 ID 或版本 ID 修改属性、追加新版本（versions）或补充出处（provenances）。规则：① 按场次判定造型版本并对号入座：主卡顶层 provenances 对应资产首次建卡时的初始默认造型/状态（如默认常服、默认日夜或初始形态），当所读场次中资产仍为或回归该初始默认造型/状态时，直接向主卡 ID 顶层传 provenances 增量追加出处（或向已有对应版本的 ID 传 provenances 追加）；当所读场次中资产呈现出尚未建立的新视觉造型或状态（如新的年龄阶段、新的具体服装造型、新的日夜或形态状态）时，通过 versions 数组传入以该具体视觉特征命名的新版本对象（含 name、description、appearance、aliases，且该新版本的 provenances 仅绑定属于该新造型的场次；同一轮支持顶层 provenances 与 versions 同时传入，系统会自动将顶层出处归入原主造型并与各新版本并列保留）；② provenances（画面出处）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，将判定为“是”的序号按各自场次所属造型分别传入顶层 provenances 或对应 versions 项的 provenances 中；③ 合并语义：mode 默认 "append" 增量保留已有版本与出处（全量覆盖传 "overwrite"）；顶层文本字段（如 description、appearance）传入即替换原值，仅追加出处或版本时无需传顶层文本字段。
  参数：{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", provenances?: Array<{ sceneTitle: string, paragraphIndices: number[] }>, versions?: Array<同 asset.create.versions>, name?: string, description?: string, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档。
当前计划：[x] 检索经验并装载工具
[ ] 读取目录定位第四场正文并查重现有资产
[ ] 提取资产清单
[ ] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：基于已读取的第四场正文，查重现有角色/场景/道具资产并提取资产清单
当前进度：已完成经验检索、工具装载与目录定位，并成功读取第四场正文（scene-37-3100，5段），但尚未查重现有资产、未提取或创建资产，整体处于执行阶段第2步末/第3步前。

# 工具执行结果
【工具 script.directory 执行成功】（共 1 个集数条目 | 场次总计: 23 | 段落总计: 280 | 正文字数: 32667 字 | 每轮建议上限: 2500 字）
{"total":1,"offset":0,"entries":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":23,"paragraphCount":280,"charCount":32667,"scenes":[{"index":1,"id":"scene-3-41","sceneNumber":"第1场","title":"第1场 一号排练室 帮Marcus改歌","locationName":"一号排练室 帮Marcus改歌","paragraphCount":10,"charCount":1269},{"index":2,"id":"scene-15-1342","sceneNumber":"第2场","title":"第2场 二号排练室 帮Remy删高音","locationName":"二号排练室 帮Remy删高音","paragraphCount":9,"charCount":1158},{"index":3,"id":"scene-26-2530","sceneNumber":"第3场","title":"第3场 凌晨两点 埋雷","locationName":"凌晨两点 埋雷","paragraphCount":9,"charCount":547},{"index":4,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255},{"index":5,"id":"scene-44-3373","sceneNumber":"第5场","title":"第5场 镜头穿梭六个房间","locationName":"镜头穿梭六个房间","paragraphCount":5,"charCount":713},{"index":6,"id":"scene-50-4104","sceneNumber":"第6场","title":"第6场 现场 一楼大厅","locationName":"现场 一楼大厅","paragraphCount":11,"charCount":524},{"index":7,"id":"scene-65-4655","sceneNumber":"第7场","title":"第7场 宿舍餐厅暴风眼早餐桌","locationName":"宿舍餐厅暴风眼早餐桌","characterNames":["12位选手"],"paragraphCount":19,"charCount":2870},{"index":8,"id":"scene-90-7576","sceneNumber":"第8场","title":"第8场 后采-小黑屋Wren独白","locationName":"后采-小黑屋Wren独白","paragraphCount":3,"charCount":369},{"index":9,"id":"scene-95-7967","sceneNumber":"第9场","title":"第9场 现场-餐桌另一头Ines套话Nico","locationName":"现场-餐桌另一头Ines套话Nico","paragraphCount":8,"charCount":1500},{"index":10,"id":"scene-106-9500","sceneNumber":"第10场","title":"第10场 咖啡机旁 前任组暗中交锋","locationName":"咖啡机旁 前任组暗中交锋","paragraphCount":4,"charCount":809},{"index":11,"id":"scene-111-10331","sceneNumber":"第11场","title":"第11场 现场-Avery求助Juno","locationName":"现场-Avery求助Juno","paragraphCount":10,"charCount":1919},{"index":12,"id":"scene-125-12285","sceneNumber":"第12场","title":"第12场 地下金库商店排雷","locationName":"地下金库商店排雷","characterNames":["Marcus","Remy","Diego","Ines","Val","Juno","Bennett","Ruth"],"paragraphCount":13,"charCount":1542},{"index":13,"id":"scene-143-13907","sceneNumber":"第13场","title":"第13场 全息高定衣橱区","locationName":"全息高定衣橱区","paragraphCount":20,"charCount":2713},{"index":14,"id":"scene-168-16660","sceneNumber":"第16场","title":"第16场","characterNames":["Wren","Nico","Ines","Marcus"],"paragraphCount":18,"charCount":2209},{"index":15,"id":"scene-190-18920","sceneNumber":"第17场","title":"第17场","paragraphCount":5,"charCount":498},{"index":16,"id":"scene-197-19430","sceneNumber":"第18场","title":"第18场","paragraphCount":22,"charCount":1576},{"index":17,"id":"scene-224-21040","sceneNumber":"第20场","title":"第20场 请君入瓮 押当闭麦权","locationName":"请君入瓮 押当闭麦权","characterNames":["Wren","Diego","Marcus","Ruth","Bennett"],"paragraphCount":20,"charCount":2605},{"index":18,"id":"scene-249-23721","sceneNumber":"第21场","title":"第21场 储物间交易","locationName":"储物间交易","paragraphCount":34,"charCount":3975},{"index":19,"id":"scene-289-27753","sceneNumber":"第24场","title":"第24场 傍晚晚饭时分 攻击与保护锁死","locationName":"傍晚晚饭时分 攻击与保护锁死","paragraphCount":14,"charCount":1697},{"index":20,"id":"scene-306-29486","sceneNumber":"第25场","title":"第25场 厨房洗碗戏 Bennett偷走Ruth伤疤","locationName":"厨房洗碗戏 Bennett偷走Ruth伤疤","paragraphCount":17,"charCount":1960},{"index":21,"id":"scene-325-31493","sceneNumber":"第26场","title":"第26场 午夜十二点 万人竞演前夜","locationName":"午夜十二点 万人竞演前夜","paragraphCount":5,"charCount":575},{"index":22,"id":"scene-333-32093","sceneNumber":"第27场","title":"第27场 深夜一楼琴房 Avery的破音","locationName":"深夜一楼琴房 Avery的破音","paragraphCount":8,"charCount":519},{"index":23,"id":"scene-343-32643","sceneNumber":"第28场","title":"第28场 次日万人体育馆最后一次联排","locationName":"次日万人体育馆最后一次联排","paragraphCount":11,"charCount":865}]}],"totalScenes":23,"totalParagraphs":280,"totalChars":32667,"recommendedBatchMaxChars":2500}

【工具 script.read 执行成功】（按“集数 -> 场次 -> 段落”三层结构返回 | 集数: 1 | 场次数: 1 | 段落数: 5 | 字数: 255 字 | 每轮建议上限: 2500 字 | 行范围: 第 37～43 行 | nextOffset: null）
{"episodes":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":1,"paragraphCount":5,"charCount":255,"scenes":[{"index":1,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255,"paragraphs":[{"index":1,"text":"4.▲（大场面·午夜红光惊魂）"},{"index":2,"text":"▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！"},{"index":3,"text":"▲“嗡——嗡——嗡——嗡——！”"},{"index":4,"text":"▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字："},{"index":5,"text":"【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）"}]}]}]}
```

### [第 5 轮] 模型原始输出
```text
状态检查：
- 当前执行第2步“读取目录定位第四场正文并查重现有资产”的查重环节；第四场正文（scene-37-3100，5段，255字）已读取完成。
- 本轮工具返回：第四场为“午夜红光惊魂”，内容为午夜红光警报爆发，涉及整栋建筑网络、二楼六个卧室、十二张床铺、十二只智能手环、血红色数据流与系统警报文字。
- 尚未查重现有资产，未提取或创建资产。重点笔记：第四场为纯氛围/大场面段落，无明确角色出场，核心资产为“智能手环”“六个卧室/二楼”“系统警报”，需先查重再决定新建或追加。

思考：
- 逐段核验资产出处：
  - 段[1]「4.▲（大场面·午夜红光惊魂）」→ 问题：智能手环/卧室是否必须出现在画面中？→ 分析：仅为场次标题，无具体资产描写 → 判定：否
  - 段[2]「▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！」→ 问题：建筑网络/二楼六个卧室是否必须出现？→ 分析：血红色数据流炸向二楼六个卧室，画面需呈现建筑与卧室 → 判定：是
  - 段[3]「▲“嗡——嗡——嗡——嗡——！”」→ 问题：智能手环是否必须出现？→ 分析：仅音效，无实体 → 判定：否
  - 段[4]「▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：」→ 问题：智能手环/床铺/卧室是否必须出现？→ 分析：明确描写十二只智能手环爆发红光、床铺、房间 → 判定：是
  - 段[5]「【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】…」→ 问题：系统警报界面是否必须出现？→ 分析：屏幕跳出血字警报，需呈现手环屏幕文字 → 判定：是
- 结论：本场核心资产为“智能手环”（道具，含血红色强光/警报屏幕状态）、“二楼六个卧室”（场景，午夜夜景区）。需先查重现有资产，再决定新建或追加。本轮先调用 asset.list 查重道具与场景。

工具调用：
{{调用 asset.list, {"type": "props", "query": "手环"}}}
{{调用 asset.list, {"type": "locations", "query": "卧室"}}}

用户沟通：
- 对用户说的话（简版）：第四场正文已读，正在查重手环与卧室资产
```

### [第 5 轮] 工具调用记录（共 2 个）
#### 🛠️ 工具 1：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "props",
  "query": "手环"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "type": "props",
  "total": 1,
  "offset": 0,
  "items": [
    {
      "id": "prop_1795137635564_88utc_3",
      "name": "智能手环",
      "owner": "通用",
      "description": "剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。",
      "materialAndState": "腕戴式智能手环，屏幕泛红光，显示余额与确认界面",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635564_88utc_3_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_4_3866",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3866,
          "lineNumber": 48
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_5_3983",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3983,
          "lineNumber": 49
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_2_4129",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "evidenceText": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "anchorText": "厅\n6.▲【现场】一楼大厅\n▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4129,
          "lineNumber": 53
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_7_4297",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
          "evidenceText": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
          "anchorText": "地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4297,
          "lineNumber": 58
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_8_4366",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "evidenceText": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "anchorText": "认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4366,
          "lineNumber": 59
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    }
  ],
  "nextOffset": null
}
```
#### 🛠️ 工具 2：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "locations",
  "query": "卧室"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "type": "locations",
  "total": 1,
  "offset": 0,
  "items": [
    {
      "id": "loc_1795137603722_5hjfl_0",
      "name": "二楼六个卧室",
      "type": "INT",
      "timeOfDay": "日景",
      "description": "首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。",
      "verifiedProvenance": [
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_1_3386",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "5.▲镜头极速穿梭于六个炸锅的房间：",
          "evidenceText": "5.▲镜头极速穿梭于六个炸锅的房间：",
          "anchorText": "第5场 镜头穿梭六个房间\n5.▲镜头极速穿梭于六个炸锅的房间：\n￮Ruth & Marcu",
          "offsetInAnchor": 13,
          "fallbackCharIndex": 3386,
          "lineNumber": 45
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_4_3866",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3866,
          "lineNumber": 48
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_5_3983",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3983,
          "lineNumber": 49
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    }
  ],
  "nextOffset": null
}
```

---
## 第 6 轮（耗时：8972 ms (8.97 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (7)：`sys.selectContext, script.directory, script.read, asset.list, asset.create, asset.update, user.ask`
- **Token 与缓存**：Prompt 5918 tokens · 缓存命中 3200 (54.1%) · 输出 778

### [第 6 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 须基于 script.read 已读出的剧本正文创建资产（多场次分步执行时，首场读完调用 asset.create 建卡，后续场次读完调用 asset.update 增量追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属、防混淆辨识特征及相关背景信息；appearance（或 visualDetails/atmosphere/materialAndState）仅记录当前已读场次正文中明确写出的外貌、服饰或状态事实（若当前已读场次未描写具体服饰或配饰，保持客观基础描述，勿凭角色职业或身份提前预设未读场次的装束）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），在 versions 数组中传入对应版本并分别绑定各自造型的 provenances 与 aliases，或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处段落锚点）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”（相关背景信息归入 description）；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，再将核实为“是”的序号传入 sceneTitle 与 paragraphIndices: [1, 2, 3]（若单次读取返回了多个同名子场次，可在 provenances 数组中按各自完整场次标题分别并列提交），系统会自动映射行号与原文，无需重复手填 evidenceText。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }
- asset.update：按资产 ID 或版本 ID 修改属性、追加新版本（versions）或补充出处（provenances）。规则：① 按场次判定造型版本并对号入座：主卡顶层 provenances 对应资产首次建卡时的初始默认造型/状态（如默认常服、默认日夜或初始形态），当所读场次中资产仍为或回归该初始默认造型/状态时，直接向主卡 ID 顶层传 provenances 增量追加出处（或向已有对应版本的 ID 传 provenances 追加）；当所读场次中资产呈现出尚未建立的新视觉造型或状态（如新的年龄阶段、新的具体服装造型、新的日夜或形态状态）时，通过 versions 数组传入以该具体视觉特征命名的新版本对象（含 name、description、appearance、aliases，且该新版本的 provenances 仅绑定属于该新造型的场次；同一轮支持顶层 provenances 与 versions 同时传入，系统会自动将顶层出处归入原主造型并与各新版本并列保留）；② provenances（画面出处）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，将判定为“是”的序号按各自场次所属造型分别传入顶层 provenances 或对应 versions 项的 provenances 中；③ 合并语义：mode 默认 "append" 增量保留已有版本与出处（全量覆盖传 "overwrite"）；顶层文本字段（如 description、appearance）传入即替换原值，仅追加出处或版本时无需传顶层文本字段。
  参数：{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", provenances?: Array<{ sceneTitle: string, paragraphIndices: number[] }>, versions?: Array<同 asset.create.versions>, name?: string, description?: string, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档。
当前计划：[x] 检索经验并装载工具
[x] 读取目录定位第四场正文并查重现有资产
[ ] 提取资产清单
[ ] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：基于已读取的第四场正文与查重结果，提取资产清单并决定对已有资产进行追加或关联。
当前进度：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）及道具/场景查重（智能手环、二楼六个卧室均存在），尚未提取资产清单或创建/更新资产，整体处于执行阶段第2步末/第3步前。

# 工具执行结果
【工具 script.directory 执行成功】（共 1 个集数条目 | 场次总计: 23 | 段落总计: 280 | 正文字数: 32667 字 | 每轮建议上限: 2500 字）
{"total":1,"offset":0,"entries":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":23,"paragraphCount":280,"charCount":32667,"scenes":[{"index":1,"id":"scene-3-41","sceneNumber":"第1场","title":"第1场 一号排练室 帮Marcus改歌","locationName":"一号排练室 帮Marcus改歌","paragraphCount":10,"charCount":1269},{"index":2,"id":"scene-15-1342","sceneNumber":"第2场","title":"第2场 二号排练室 帮Remy删高音","locationName":"二号排练室 帮Remy删高音","paragraphCount":9,"charCount":1158},{"index":3,"id":"scene-26-2530","sceneNumber":"第3场","title":"第3场 凌晨两点 埋雷","locationName":"凌晨两点 埋雷","paragraphCount":9,"charCount":547},{"index":4,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255},{"index":5,"id":"scene-44-3373","sceneNumber":"第5场","title":"第5场 镜头穿梭六个房间","locationName":"镜头穿梭六个房间","paragraphCount":5,"charCount":713},{"index":6,"id":"scene-50-4104","sceneNumber":"第6场","title":"第6场 现场 一楼大厅","locationName":"现场 一楼大厅","paragraphCount":11,"charCount":524},{"index":7,"id":"scene-65-4655","sceneNumber":"第7场","title":"第7场 宿舍餐厅暴风眼早餐桌","locationName":"宿舍餐厅暴风眼早餐桌","characterNames":["12位选手"],"paragraphCount":19,"charCount":2870},{"index":8,"id":"scene-90-7576","sceneNumber":"第8场","title":"第8场 后采-小黑屋Wren独白","locationName":"后采-小黑屋Wren独白","paragraphCount":3,"charCount":369},{"index":9,"id":"scene-95-7967","sceneNumber":"第9场","title":"第9场 现场-餐桌另一头Ines套话Nico","locationName":"现场-餐桌另一头Ines套话Nico","paragraphCount":8,"charCount":1500},{"index":10,"id":"scene-106-9500","sceneNumber":"第10场","title":"第10场 咖啡机旁 前任组暗中交锋","locationName":"咖啡机旁 前任组暗中交锋","paragraphCount":4,"charCount":809},{"index":11,"id":"scene-111-10331","sceneNumber":"第11场","title":"第11场 现场-Avery求助Juno","locationName":"现场-Avery求助Juno","paragraphCount":10,"charCount":1919},{"index":12,"id":"scene-125-12285","sceneNumber":"第12场","title":"第12场 地下金库商店排雷","locationName":"地下金库商店排雷","characterNames":["Marcus","Remy","Diego","Ines","Val","Juno","Bennett","Ruth"],"paragraphCount":13,"charCount":1542},{"index":13,"id":"scene-143-13907","sceneNumber":"第13场","title":"第13场 全息高定衣橱区","locationName":"全息高定衣橱区","paragraphCount":20,"charCount":2713},{"index":14,"id":"scene-168-16660","sceneNumber":"第16场","title":"第16场","characterNames":["Wren","Nico","Ines","Marcus"],"paragraphCount":18,"charCount":2209},{"index":15,"id":"scene-190-18920","sceneNumber":"第17场","title":"第17场","paragraphCount":5,"charCount":498},{"index":16,"id":"scene-197-19430","sceneNumber":"第18场","title":"第18场","paragraphCount":22,"charCount":1576},{"index":17,"id":"scene-224-21040","sceneNumber":"第20场","title":"第20场 请君入瓮 押当闭麦权","locationName":"请君入瓮 押当闭麦权","characterNames":["Wren","Diego","Marcus","Ruth","Bennett"],"paragraphCount":20,"charCount":2605},{"index":18,"id":"scene-249-23721","sceneNumber":"第21场","title":"第21场 储物间交易","locationName":"储物间交易","paragraphCount":34,"charCount":3975},{"index":19,"id":"scene-289-27753","sceneNumber":"第24场","title":"第24场 傍晚晚饭时分 攻击与保护锁死","locationName":"傍晚晚饭时分 攻击与保护锁死","paragraphCount":14,"charCount":1697},{"index":20,"id":"scene-306-29486","sceneNumber":"第25场","title":"第25场 厨房洗碗戏 Bennett偷走Ruth伤疤","locationName":"厨房洗碗戏 Bennett偷走Ruth伤疤","paragraphCount":17,"charCount":1960},{"index":21,"id":"scene-325-31493","sceneNumber":"第26场","title":"第26场 午夜十二点 万人竞演前夜","locationName":"午夜十二点 万人竞演前夜","paragraphCount":5,"charCount":575},{"index":22,"id":"scene-333-32093","sceneNumber":"第27场","title":"第27场 深夜一楼琴房 Avery的破音","locationName":"深夜一楼琴房 Avery的破音","paragraphCount":8,"charCount":519},{"index":23,"id":"scene-343-32643","sceneNumber":"第28场","title":"第28场 次日万人体育馆最后一次联排","locationName":"次日万人体育馆最后一次联排","paragraphCount":11,"charCount":865}]}],"totalScenes":23,"totalParagraphs":280,"totalChars":32667,"recommendedBatchMaxChars":2500}

【工具 script.read 执行成功】（按“集数 -> 场次 -> 段落”三层结构返回 | 集数: 1 | 场次数: 1 | 段落数: 5 | 字数: 255 字 | 每轮建议上限: 2500 字 | 行范围: 第 37～43 行 | nextOffset: null）
{"episodes":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":1,"paragraphCount":5,"charCount":255,"scenes":[{"index":1,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255,"paragraphs":[{"index":1,"text":"4.▲（大场面·午夜红光惊魂）"},{"index":2,"text":"▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！"},{"index":3,"text":"▲“嗡——嗡——嗡——嗡——！”"},{"index":4,"text":"▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字："},{"index":5,"text":"【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）"}]}]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"props","total":1,"offset":0,"items":[{"id":"prop_1795137635564_88utc_3","name":"智能手环","owner":"通用","description":"剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。","materialAndState":"腕戴式智能手环，屏幕泛红光，显示余额与确认界面","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":3,"lines":[46,48,49]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[53,58,59]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"locations","total":1,"offset":0,"items":[{"id":"loc_1795137603722_5hjfl_0","name":"二楼六个卧室","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":5,"lines":[45,46,47,48,49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]}]}
```

### [第 6 轮] 模型原始输出
```text
状态检查：
- 当前执行第3步「提取资产清单」，基于已读取的第4场正文（scene-37-3100，5段）与查重结果推进。
- 本轮工具返回：第4场正文5段已读取；道具「智能手环」已存在（prop_1795137635564_88utc_3）；场景「二楼六个卧室」已存在（loc_1795137603722_5hjfl_0）。
- 当前处于「已读取待写入落盘」状态：需为这两个已有资产追加第4场出处。
- 重点笔记：第4场无新角色出场（仅群体手腕与手环），资产清单为：场景「二楼六个卧室」、道具「智能手环」，均需增量追加出处。

思考：
逐段核验第4场5段原文：
段[1]「4.▲（大场面·午夜红光惊魂）」→ 问题：二楼六个卧室/智能手环是否必须出现在画面中？→ 分析：仅为场次标题标注，无具体画面元素 → 判定：否
段[2]「▲"轰——！"交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！」→ 问题：二楼六个卧室是否必须出现？→ 分析：红光炸向二楼六个卧室，场景必须呈现 → 判定：是
段[3]「▲"嗡——嗡——嗡——嗡——！"」→ 问题：两资产是否必须出现？→ 分析：仅音效拟声，无画面实体 → 判定：否
段[4]「▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：」→ 问题：二楼六个卧室与智能手环是否必须出现？→ 分析：六个房间为场景，智能手环爆发红光为道具核心呈现 → 判定：是（两者皆是）
段[5]「【全员二级警报：全场唯一"暗雷"刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）」→ 问题：两资产是否必须出现？→ 分析：为手环屏幕文字内容，需手环呈现 → 判定：是（智能手环）；场景否
结论：场景「二楼六个卧室」出处段[2][4]；道具「智能手环」出处段[4][5]。均为已有资产，调用 asset.update 增量追加出处。

工具调用：
{{调用 asset.update, {"id": "loc_1795137603722_5hjfl_0", "type": "locations", "provenances": [{"sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂", "paragraphIndices": [2, 4]}]}}}
{{调用 asset.update, {"id": "prop_1795137635564_88utc_3", "type": "props", "provenances": [{"sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂", "paragraphIndices": [4, 5]}]}}}

用户沟通：
- 对用户说的话（简版）：第4场资产已确认，正为场景和手环追加出处。
```

### [第 6 轮] 工具调用记录（共 2 个）
#### 🛠️ 工具 1：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "loc_1795137603722_5hjfl_0",
  "type": "locations",
  "provenances": [
    {
      "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
      "paragraphIndices": [
        2,
        4
      ]
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "locations",
  "id": "loc_1795137603722_5hjfl_0",
  "verifiedCount": 7,
  "sourceScenes": [
    "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
    "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"
  ],
  "item": {
    "id": "loc_1795137603722_5hjfl_0",
    "name": "二楼六个卧室",
    "type": "INT",
    "timeOfDay": "日景",
    "description": "首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。",
    "verifiedProvenance": [
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_2_3127",
        "sceneId": "sc-36-3100",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
        "matchedTerm": "▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！",
        "evidenceText": "▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！",
        "anchorText": "▲（大场面·午夜红光惊魂）\n▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！\n▲“嗡——嗡——嗡——嗡—",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3127,
        "lineNumber": 39
      },
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_4_3194",
        "sceneId": "sc-36-3100",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
        "matchedTerm": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
        "evidenceText": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
        "anchorText": "——嗡——嗡——嗡——！”\n▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3194,
        "lineNumber": 41
      },
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_1_3386",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "5.▲镜头极速穿梭于六个炸锅的房间：",
        "evidenceText": "5.▲镜头极速穿梭于六个炸锅的房间：",
        "anchorText": "第5场 镜头穿梭六个房间\n5.▲镜头极速穿梭于六个炸锅的房间：\n￮Ruth & Marcu",
        "offsetInAnchor": 13,
        "fallbackCharIndex": 3386,
        "lineNumber": 45
      },
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_2_3405",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
        "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
        "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3405,
        "lineNumber": 46
      },
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_3_3699",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
        "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
        "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3699,
        "lineNumber": 47
      },
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_4_3866",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
        "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
        "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3866,
        "lineNumber": 48
      },
      {
        "id": "vp_loc_1795137603722_5hjfl_0_para_5_3983",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
        "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
        "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3983,
        "lineNumber": 49
      }
    ],
    "provenanceStatus": "verified",
    "verifiedScriptHash": "33543:1br6fs9",
    "sourceScenes": [
      "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
      "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"
    ]
  },
  "message": "成功更新资产 [二楼六个卧室]（当前累计确认 7 处真实出场）。"
}
```
#### 🛠️ 工具 2：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "prop_1795137635564_88utc_3",
  "type": "props",
  "provenances": [
    {
      "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
      "paragraphIndices": [
        4,
        5
      ]
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "props",
  "id": "prop_1795137635564_88utc_3",
  "verifiedCount": 8,
  "sourceScenes": [
    "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
    "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
    "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"
  ],
  "item": {
    "id": "prop_1795137635564_88utc_3",
    "name": "智能手环",
    "owner": "通用",
    "description": "剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。",
    "materialAndState": "腕戴式智能手环，屏幕泛红光，显示余额与确认界面",
    "verifiedProvenance": [
      {
        "id": "vp_prop_1795137635564_88utc_3_para_4_3194",
        "sceneId": "sc-36-3100",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
        "matchedTerm": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
        "evidenceText": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
        "anchorText": "——嗡——嗡——嗡——！”\n▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3194,
        "lineNumber": 41
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_5_3271",
        "sceneId": "sc-36-3100",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
        "matchedTerm": "【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）",
        "evidenceText": "【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）",
        "anchorText": "出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）\n \n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3271,
        "lineNumber": 42
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_2_3405",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
        "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
        "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3405,
        "lineNumber": 46
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_4_3866",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
        "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
        "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3866,
        "lineNumber": 48
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_5_3983",
        "sceneId": "sc-43-3373",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
        "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
        "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 3983,
        "lineNumber": 49
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_2_4129",
        "sceneId": "sc-50-4105",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
        "matchedTerm": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
        "evidenceText": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
        "anchorText": "厅\n6.▲【现场】一楼大厅\n▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 4129,
        "lineNumber": 53
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_7_4297",
        "sceneId": "sc-50-4105",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
        "matchedTerm": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
        "evidenceText": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
        "anchorText": "地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 4297,
        "lineNumber": 58
      },
      {
        "id": "vp_prop_1795137635564_88utc_3_para_8_4366",
        "sceneId": "sc-50-4105",
        "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
        "matchedTerm": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
        "evidenceText": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
        "anchorText": "认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 4366,
        "lineNumber": 59
      }
    ],
    "provenanceStatus": "verified",
    "verifiedScriptHash": "33543:1br6fs9",
    "sourceScenes": [
      "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
      "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
      "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"
    ]
  },
  "message": "成功更新资产 [智能手环]（当前累计确认 8 处真实出场）。"
}
```

---
## 第 7 轮（耗时：6365 ms (6.37 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (7)：`sys.selectContext, script.directory, script.read, asset.list, asset.create, asset.update, user.ask`
- **Token 与缓存**：Prompt 4425 tokens · 缓存命中 3200 (72.3%) · 输出 222

### [第 7 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 须基于 script.read 已读出的剧本正文创建资产（多场次分步执行时，首场读完调用 asset.create 建卡，后续场次读完调用 asset.update 增量追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属、防混淆辨识特征及相关背景信息；appearance（或 visualDetails/atmosphere/materialAndState）仅记录当前已读场次正文中明确写出的外貌、服饰或状态事实（若当前已读场次未描写具体服饰或配饰，保持客观基础描述，勿凭角色职业或身份提前预设未读场次的装束）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），在 versions 数组中传入对应版本并分别绑定各自造型的 provenances 与 aliases，或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处段落锚点）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”（相关背景信息归入 description）；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，再将核实为“是”的序号传入 sceneTitle 与 paragraphIndices: [1, 2, 3]（若单次读取返回了多个同名子场次，可在 provenances 数组中按各自完整场次标题分别并列提交），系统会自动映射行号与原文，无需重复手填 evidenceText。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }
- asset.update：按资产 ID 或版本 ID 修改属性、追加新版本（versions）或补充出处（provenances）。规则：① 按场次判定造型版本并对号入座：主卡顶层 provenances 对应资产首次建卡时的初始默认造型/状态（如默认常服、默认日夜或初始形态），当所读场次中资产仍为或回归该初始默认造型/状态时，直接向主卡 ID 顶层传 provenances 增量追加出处（或向已有对应版本的 ID 传 provenances 追加）；当所读场次中资产呈现出尚未建立的新视觉造型或状态（如新的年龄阶段、新的具体服装造型、新的日夜或形态状态）时，通过 versions 数组传入以该具体视觉特征命名的新版本对象（含 name、description、appearance、aliases，且该新版本的 provenances 仅绑定属于该新造型的场次；同一轮支持顶层 provenances 与 versions 同时传入，系统会自动将顶层出处归入原主造型并与各新版本并列保留）；② provenances（画面出处）：判定标准为“根据段落内容，如果该资产必须出现在画面中才能呈现该段落，则判定该段落为出处”；核实出处时须在思考中从第1段至末段按连续序号逐段输出（包含判定为“是”与“否”的每一个段落），格式为“段[序号]「<一字不差完整复制该段全部原文>」→ 问题： [目标资产名]是否必须出现在画面中？→ 分析：<依据分析> → 判定：[是/否]”，将判定为“是”的序号按各自场次所属造型分别传入顶层 provenances 或对应 versions 项的 provenances 中；③ 合并语义：mode 默认 "append" 增量保留已有版本与出处（全量覆盖传 "overwrite"）；顶层文本字段（如 description、appearance）传入即替换原值，仅追加出处或版本时无需传顶层文本字段。
  参数：{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", provenances?: Array<{ sceneTitle: string, paragraphIndices: number[] }>, versions?: Array<同 asset.create.versions>, name?: string, description?: string, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档（已有资产增量追加出处）。
当前计划：[x] 检索经验并装载工具
[x] 读取目录定位第四场正文并查重现有资产
[x] 提取资产清单
[x] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：基于已读取的第四场正文与查重结果，提取资产清单并决定对已有资产进行追加或关联。
当前进度：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）及查重，并成功为场景「二楼六个卧室」与道具「智能手环」追加第4场出处，整体处于执行阶段第4步完成、待验收结案。

# 工具执行结果
【工具 asset.update 执行成功】
{"success":true,"type":"locations","id":"loc_1795137603722_5hjfl_0","verifiedCount":7,"sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"],"item":{"id":"loc_1795137603722_5hjfl_0","name":"二楼六个卧室","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[39,41]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":5,"lines":[45,46,47,48,49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},"message":"成功更新资产 [二楼六个卧室]（当前累计确认 7 处真实出场）。"}

【工具 asset.update 执行成功】
{"success":true,"type":"props","id":"prop_1795137635564_88utc_3","verifiedCount":8,"sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"],"item":{"id":"prop_1795137635564_88utc_3","name":"智能手环","owner":"通用","description":"剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。","materialAndState":"腕戴式智能手环，屏幕泛红光，显示余额与确认界面","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[41,42]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":3,"lines":[46,48,49]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[53,58,59]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},"message":"成功更新资产 [智能手环]（当前累计确认 8 处真实出场）。"}
```

### [第 7 轮] 模型原始输出
```text
状态检查：
- 当前计划第4步「创建/更新资产」已通过两次 asset.update 成功落盘（场景「二楼六个卧室」累计7处、道具「智能手环」累计8处，均含第4场出处），第5步「验收结案」尚未完成。
- 本轮工具返回均为成功，资产状态已生效，无需回查。
- 重点笔记：第4场（scene-37-3100）资产提取已全部落盘，可进入验收结案。

思考：
- 第4步所有写入已完成并确认成功，当前计划仅剩「验收结案」未标记。
- 按流程，所有计划步骤完成后应无参调用 sys.selectContext 返回全局计划与验收阶段，由全局阶段统一验收汇报。
- 因此本轮将第5步标记为 [x] 并调用 sys.selectContext。

工具调用：
{{调用 sys.selectContext}}

用户沟通：
- 对用户说的话（简版）：第四场资产已全部提取落盘，进入验收结案。
```

### [第 7 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "categories": [],
  "tools": [],
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
    "asset"
  ],
  "transition": "return_to_plan"
}
```

---
## 第 8 轮（耗时：7440 ms (7.44 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 2550 tokens · 缓存命中 1280 (50.2%) · 输出 269

### [第 8 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断, 写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属或关键取舍存在客观歧义时，主动通过 user.ask 简明征询用户意见；在目标明确时保持自主执行。
3. 通用四段式输出协议：每次回复都必须严格依次输出以下 4 个完整区块：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行逻辑推演、意图识别与参数核对}
   - 工具调用：{严格按双花括号格式输出指令：{{调用 工具名称, {"参数名": "参数值"}}}，无参数简写为 {{调用 工具名称}}}
   - 用户沟通：{常规中间推进轮次输出“- 对用户说的话（简版）”（30字以内）；只有输出长内容时填入完整版内容，一般情况直接忽略，不写}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，核心职责是按以下闭环推进任务：
0. 意图识别：结合用户输入与当前聚焦目标判断诉求——若可直接作答则回复并调用 sys.endTask 结束；若意图模糊或边界不清则调用 user.ask 确认；若为明确可执行任务则进入下方流程；
1. 检索同类任务经验：初启时调用 experience.search（可与 sys.selectContext 同轮并发）；
2. 探查与制定计划：探查数据分布，动态重规划“当前计划”（将任务拆解为首批读取+创建、后续读取+增量更新闭环步骤）；
3. 实施：成套装载工具切入执行；
4. 验收：确认全部达成后调用 sys.endTask 结案。

# 输出格式
状态检查：
{盘点认知状态、本轮工具事实、意图判断与原计划完成度}
思考：
{内心独白：1. 意图识别与策略推演；2. 制定或更新当前计划步骤（[x]/[ ]）；3. 下一步行动与重点参数}
工具调用：
{按格式输出本轮要调用的工具指令}
用户沟通：
{
- 对用户说的话（简版）：“...”
思考：{是否必须输出长内容，再无其它办法}
- 对用户说的话（完整版）：“（按需选填）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；仅在识别出明确可执行任务且尚未检索经验时调用，可与首次展开工具分类的 sys.selectContext 同轮并发调用；日常寒暄、能力咨询或待用户澄清意图时不调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset]）
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（附每集/场次字数与单批字数上限建议）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

## 其它未展开的工具分类（可传 categories 补充展开）
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档（已有资产增量追加出处）。
当前计划：[x] 检索经验并装载工具
[x] 读取目录定位第四场正文并查重现有资产
[x] 提取资产清单
[x] 创建/更新资产
[ ] 验收结案
重点笔记：暂无笔记
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）及查重，并成功为场景「二楼六个卧室」与道具「智能手环」追加第4场出处，整体处于执行阶段第4步完成、待验收结案。

# 工具执行结果
【工具 asset.update 执行成功】
{"success":true,"type":"locations","id":"loc_1795137603722_5hjfl_0","verifiedCount":7,"sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"],"item":{"id":"loc_1795137603722_5hjfl_0","name":"二楼六个卧室","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[39,41]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":5,"lines":[45,46,47,48,49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},"message":"成功更新资产 [二楼六个卧室]（当前累计确认 7 处真实出场）。"}

【工具 asset.update 执行成功】
{"success":true,"type":"props","id":"prop_1795137635564_88utc_3","verifiedCount":8,"sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"],"item":{"id":"prop_1795137635564_88utc_3","name":"智能手环","owner":"通用","description":"剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。","materialAndState":"腕戴式智能手环，屏幕泛红光，显示余额与确认界面","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[41,42]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":3,"lines":[46,48,49]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[53,58,59]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},"message":"成功更新资产 [智能手环]（当前累计确认 8 处真实出场）。"}

【工具 sys.selectContext 执行成功】已返回全局计划与验收阶段（局部执行工具已卸载；此前已展开分类 [script, asset] 的候选工具简表已在上方就绪，如需进入下一阶段执行可直接从中挑选 tools；若所有目标已全部完成，请调用 sys.endTask 结束任务）
```

### [第 8 轮] 模型原始输出
```text
状态检查：
- 已完成：经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）、资产查重、场景「二楼六个卧室」与道具「智能手环」的第4场出处追加。
- 本轮工具事实：两次 asset.update 均返回 success，verifiedCount 分别为 7 与 8，第4场出处已写入。
- 意图判断：用户要求“提取第四场的全部资产”，需核验第四场是否还有其他角色/道具/场景未建档。
- 原计划完成度：前4步完成，待验收结案。

思考：
1. 意图识别：需确认第四场全部资产是否已覆盖，避免遗漏角色等资产。
2. 计划步骤：[x] 检索经验并装载工具 [x] 读取目录定位第四场 [x] 提取资产清单 [x] 创建/更新资产 [ ] 验收结案。
3. 下一步：重新读取第四场正文核对资产清单完整性，确认无遗漏后结案。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.read", "asset.list"]}}}

用户沟通：
- 对用户说的话（简版）：“正在核验第四场资产是否齐全，稍等。”
```

### [第 8 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.read",
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
    "script.read",
    "asset.list"
  ],
  "prompts": [
    "script",
    "assets"
  ],
  "categories": [
    "script",
    "asset"
  ],
  "transition": "enter_execution"
}
```

---
## 第 9 轮（耗时：5628 ms (5.63 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.list, user.ask`
- **Token 与缓存**：Prompt 3305 tokens · 缓存命中 1920 (58.1%) · 输出 251

### [第 9 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }

## 候选工具简表
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档（已有资产增量追加出处），最终核验无遗漏后结案。
当前计划：[x] 检索经验并装载工具
[x] 读取目录定位第四场正文并查重现有资产
[x] 提取资产清单
[x] 创建/更新资产
[ ] 重新读取第四场正文与资产列表核验完整性并结案
重点笔记：暂无笔记
当前小目标：读取第四场正文与现有资产列表，核对资产清单完整性，确认无遗漏后结案
当前进度：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）、查重及场景「二楼六个卧室」与道具「智能手环」第4场出处追加；本轮仅重新装载读取工具，尚未执行核验读取，整体处于第4步完成、第5步验收待执行状态。

# 工具执行结果
【工具 asset.update 执行成功】
{"success":true,"type":"locations","id":"loc_1795137603722_5hjfl_0","verifiedCount":7,"sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"],"item":{"id":"loc_1795137603722_5hjfl_0","name":"二楼六个卧室","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[39,41]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":5,"lines":[45,46,47,48,49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},"message":"成功更新资产 [二楼六个卧室]（当前累计确认 7 处真实出场）。"}

【工具 asset.update 执行成功】
{"success":true,"type":"props","id":"prop_1795137635564_88utc_3","verifiedCount":8,"sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"],"item":{"id":"prop_1795137635564_88utc_3","name":"智能手环","owner":"通用","description":"剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。","materialAndState":"腕戴式智能手环，屏幕泛红光，显示余额与确认界面","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[41,42]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":3,"lines":[46,48,49]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[53,58,59]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},"message":"成功更新资产 [智能手环]（当前累计确认 8 处真实出场）。"}

【工具 sys.selectContext 执行成功】已进入局部执行阶段，当前已装载工具：script.read, asset.list
```

### [第 9 轮] 模型原始输出
```text
状态检查：
- 当前正在执行第5步「重新读取第四场正文与资产列表核验完整性并结案」。
- 本轮工具返回：场景「二楼六个卧室」已追加第4场出处（累计7处），道具「智能手环」已追加第4场出处（累计8处）；读取工具已装载。
- 尚未执行核验读取，处于待核验状态。需重新读取第四场正文与资产列表比对。

思考：
- 第4场为 scene-37-3100（5段），需重新读取正文，逐项核对角色/场景/道具是否全部建档。
- 同时读取现有资产列表，确认第四场出现的资产均已覆盖，无遗漏。
- 先读取正文，再读取资产列表进行比对。

工具调用：
{{调用 script.read, {"scene": "scene-37-3100"}}}
{{调用 asset.list, {"type": "characters"}}}
{{调用 asset.list, {"type": "locations"}}}
{{调用 asset.list, {"type": "props"}}}

用户沟通：
- 对用户说的话（简版）：正在重新读取第四场正文与资产列表做最终核验。
```

### [第 9 轮] 工具调用记录（共 4 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "scene": "scene-37-3100"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "total": 359,
  "offset": 37,
  "startLine": 37,
  "endLine": 43,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 1,
  "paragraphCount": 5,
  "charCount": 255,
  "recommendedBatchMaxChars": 2500,
  "hasVolumeWarning": false,
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "二",
      "title": "第二集：雷在谁身上（Who's Stepping on the Mine?）",
      "sceneCount": 1,
      "paragraphCount": 5,
      "charCount": 255,
      "scenes": [
        {
          "index": 1,
          "id": "scene-37-3100",
          "sceneNumber": "第4场",
          "title": "第4场 午夜红光惊魂",
          "locationName": "午夜红光惊魂",
          "paragraphCount": 5,
          "charCount": 255,
          "paragraphs": [
            {
              "index": 1,
              "text": "4.▲（大场面·午夜红光惊魂）"
            },
            {
              "index": 2,
              "text": "▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！"
            },
            {
              "index": 3,
              "text": "▲“嗡——嗡——嗡——嗡——！”"
            },
            {
              "index": 4,
              "text": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字："
            },
            {
              "index": 5,
              "text": "【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）"
            }
          ]
        }
      ]
    }
  ],
  "content": "第4场 午夜红光惊魂\n4.▲（大场面·午夜红光惊魂）\n▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！\n▲“嗡——嗡——嗡——嗡——！”\n▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）\n "
}
```
#### 🛠️ 工具 2：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "characters"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "type": "characters",
  "total": 9,
  "offset": 0,
  "items": [
    {
      "id": "char_1795137572013_hs1bw_0",
      "name": "Marcus",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，选手之一，与Ruth同住二楼卧室。凌晨被手环红光震醒，惊慌质问谁买了暗雷。",
      "appearance": "男性选手，睡在床上被惊醒，额头冒冷汗",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572013_hs1bw_0_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "char_1795137572015_iymf5_1",
      "name": "Ruth",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，选手之一，与Marcus同住二楼卧室。冷静，看挂钟判断时间。",
      "appearance": "女性选手，皱眉坐起身",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572015_iymf5_1_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "char_1795137572016_c1fnc_2",
      "name": "Remy",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，19岁选手，与Simone同住二楼卧室。胆小，被红光吓得抱枕跳床。",
      "appearance": "19岁，脸色惨白，抱着枕头",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572016_c1fnc_2_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "char_1795137572016_itbvw_3",
      "name": "Simone",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，41岁选手，与Remy同住二楼卧室。失眠下楼泡安神茶，暗中用手机录下大厅一幕。",
      "appearance": "41岁，披着米色开衫，手持智能手机",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572016_itbvw_3_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        },
        {
          "id": "vp_char_1795137572016_itbvw_3_para_11_4533",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "evidenceText": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "anchorText": "刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！\n \n\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4533,
          "lineNumber": 62
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "char_1795137572016_d2dq2_4",
      "name": "Ines",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，选手之一，与Val同住二楼卧室。冷静，按灭手环。",
      "appearance": "女性选手，冷冷按灭手环",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572016_d2dq2_4_para_4_3866",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3866,
          "lineNumber": 48
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "char_1795137572016_0qoag_5",
      "name": "Val",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，选手之一，与Ines同住二楼卧室。睡梦中纹丝不动。",
      "appearance": "女性选手，躺在床上纹丝不动",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572016_0qoag_5_para_4_3866",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3866,
          "lineNumber": 48
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "char_1795137572016_6xhwa_6",
      "name": "Avery",
      "role": "剧中角色",
      "description": "第二集第5场首次出场，选手之一，与Juno同住二楼卧室。被震醒后毫无防备继续睡，成为暗雷目标。",
      "appearance": "女性选手，迷迷糊糊抬腕看红光",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572016_6xhwa_6_para_5_3983",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3983,
          "lineNumber": 49
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "char_1795137572017_h19zc_7",
      "name": "Juno",
      "role": "剧中角色",
      "description": "第二集第6场首次出场，选手之一，与Avery同住二楼卧室。深夜在一楼大厅买下暗雷，被Diego撞见。",
      "appearance": "女性选手，手环余额仅剩200 SC，神情慌张",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572017_h19zc_7_para_2_4129",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "evidenceText": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "anchorText": "厅\n6.▲【现场】一楼大厅\n▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4129,
          "lineNumber": 53
        },
        {
          "id": "vp_char_1795137572017_h19zc_7_para_5_4228",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 浑身汗毛倒竖，猛地僵在原地！",
          "evidenceText": "▲Juno 浑身汗毛倒竖，猛地僵在原地！",
          "anchorText": "，一盏昏黄的壁灯突然亮了！\n▲Juno 浑身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Di",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4228,
          "lineNumber": 56
        },
        {
          "id": "vp_char_1795137572017_h19zc_7_para_7_4297",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
          "evidenceText": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
          "anchorText": "地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4297,
          "lineNumber": 58
        },
        {
          "id": "vp_char_1795137572017_h19zc_7_para_9_4426",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "Diego（声音轻柔）：还没睡啊，Juno？晚安。（Still up, Juno? Goodnight.）",
          "evidenceText": "Diego（声音轻柔）：还没睡啊，Juno？晚安。（Still up, Juno? Goodnight.）",
          "anchorText": "端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还没睡啊，Juno？晚安。（Still up, Juno? Goodnight.）\n▲Diego 端着水杯慢条",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4426,
          "lineNumber": 60
        },
        {
          "id": "vp_char_1795137572017_h19zc_7_para_10_4480",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "evidenceText": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "anchorText": "? Goodnight.）\n▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4480,
          "lineNumber": 61
        },
        {
          "id": "vp_char_1795137572017_h19zc_7_para_11_4533",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "evidenceText": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "anchorText": "刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！\n \n\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4533,
          "lineNumber": 62
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "char_1795137572017_a68hn_8",
      "name": "Diego",
      "role": "剧中角色",
      "description": "第二集第6场首次出场，选手之一。深夜穿睡袍到厨房接水，撞见Juno却不动声色。",
      "appearance": "穿着丝绸睡袍，端着水杯",
      "verifiedProvenance": [
        {
          "id": "vp_char_1795137572017_a68hn_8_para_6_4249",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "evidenceText": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "anchorText": "身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4249,
          "lineNumber": 57
        },
        {
          "id": "vp_char_1795137572017_a68hn_8_para_8_4366",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "evidenceText": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "anchorText": "认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4366,
          "lineNumber": 59
        },
        {
          "id": "vp_char_1795137572017_a68hn_8_para_9_4426",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "Diego（声音轻柔）：还没睡啊，Juno？晚安。（Still up, Juno? Goodnight.）",
          "evidenceText": "Diego（声音轻柔）：还没睡啊，Juno？晚安。（Still up, Juno? Goodnight.）",
          "anchorText": "端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还没睡啊，Juno？晚安。（Still up, Juno? Goodnight.）\n▲Diego 端着水杯慢条",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4426,
          "lineNumber": 60
        },
        {
          "id": "vp_char_1795137572017_a68hn_8_para_10_4480",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "evidenceText": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "anchorText": "? Goodnight.）\n▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4480,
          "lineNumber": 61
        },
        {
          "id": "vp_char_1795137572017_a68hn_8_para_11_4533",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "evidenceText": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "anchorText": "刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！\n \n\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4533,
          "lineNumber": 62
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    }
  ],
  "nextOffset": null
}
```
#### 🛠️ 工具 3：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "locations"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "type": "locations",
  "total": 4,
  "offset": 0,
  "items": [
    {
      "id": "loc_1795137603722_5hjfl_0",
      "name": "二楼六个卧室",
      "type": "INT",
      "timeOfDay": "日景",
      "description": "首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。",
      "verifiedProvenance": [
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_2_3127",
          "sceneId": "sc-36-3100",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
          "matchedTerm": "▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！",
          "evidenceText": "▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！",
          "anchorText": "▲（大场面·午夜红光惊魂）\n▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！\n▲“嗡——嗡——嗡——嗡—",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3127,
          "lineNumber": 39
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_4_3194",
          "sceneId": "sc-36-3100",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
          "matchedTerm": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
          "evidenceText": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
          "anchorText": "——嗡——嗡——嗡——！”\n▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3194,
          "lineNumber": 41
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_1_3386",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "5.▲镜头极速穿梭于六个炸锅的房间：",
          "evidenceText": "5.▲镜头极速穿梭于六个炸锅的房间：",
          "anchorText": "第5场 镜头穿梭六个房间\n5.▲镜头极速穿梭于六个炸锅的房间：\n￮Ruth & Marcu",
          "offsetInAnchor": 13,
          "fallbackCharIndex": 3386,
          "lineNumber": 45
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_4_3866",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3866,
          "lineNumber": 48
        },
        {
          "id": "vp_loc_1795137603722_5hjfl_0_para_5_3983",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3983,
          "lineNumber": 49
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"
      ]
    },
    {
      "id": "loc_1795137603722_9du4y_1",
      "name": "一楼大厅",
      "type": "INT",
      "timeOfDay": "日景",
      "description": "首次出场于第二集第6场，别墅一楼大厅，连接二楼楼梯与开放式厨房，侧后方有厨房，另有通往二楼的消防楼梯铁门。",
      "verifiedProvenance": [
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_1_4117",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "6.▲【现场】一楼大厅",
          "evidenceText": "6.▲【现场】一楼大厅",
          "anchorText": "第6场 现场 一楼大厅\n6.▲【现场】一楼大厅\n▲Juno 看着自己手环上",
          "offsetInAnchor": 12,
          "fallbackCharIndex": 4117,
          "lineNumber": 52
        },
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_2_4129",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "evidenceText": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "anchorText": "厅\n6.▲【现场】一楼大厅\n▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4129,
          "lineNumber": 53
        },
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_4_4201",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！",
          "evidenceText": "▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！",
          "anchorText": "逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！\n▲Juno 浑身汗毛倒竖，",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4201,
          "lineNumber": 55
        },
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_6_4249",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "evidenceText": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "anchorText": "身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4249,
          "lineNumber": 57
        },
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_8_4366",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "evidenceText": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "anchorText": "认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4366,
          "lineNumber": 59
        },
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_10_4480",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "evidenceText": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "anchorText": "? Goodnight.）\n▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4480,
          "lineNumber": 61
        },
        {
          "id": "vp_loc_1795137603722_9du4y_1_para_11_4533",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "evidenceText": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "anchorText": "刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！\n \n\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4533,
          "lineNumber": 62
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "loc_1795137603722_b8a3s_2",
      "name": "开放式厨房",
      "type": "INT",
      "timeOfDay": "日景",
      "description": "首次出场于第二集第6场，位于一楼大厅侧后方的开放式厨房，内有厨房岛台与昏黄壁灯。",
      "verifiedProvenance": [
        {
          "id": "vp_loc_1795137603722_b8a3s_2_para_4_4201",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！",
          "evidenceText": "▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！",
          "anchorText": "逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！\n▲Juno 浑身汗毛倒竖，",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4201,
          "lineNumber": 55
        },
        {
          "id": "vp_loc_1795137603722_b8a3s_2_para_6_4249",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "evidenceText": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "anchorText": "身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4249,
          "lineNumber": 57
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "loc_1795137603723_p2xut_3",
      "name": "楼梯拐角",
      "type": "INT",
      "timeOfDay": "日景",
      "description": "首次出场于第二集第5场，二楼通往一楼大厅的楼梯拐角阴影处，Simone 曾在此目睹并录像；第6场消防楼梯铁门门缝后亦为 Simone 藏身处。",
      "verifiedProvenance": [
        {
          "id": "vp_loc_1795137603723_p2xut_3_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        },
        {
          "id": "vp_loc_1795137603723_p2xut_3_para_11_4533",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "evidenceText": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "anchorText": "刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！\n \n\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4533,
          "lineNumber": 62
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    }
  ],
  "nextOffset": null
}
```
#### 🛠️ 工具 4：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "props"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1794973206015",
  "source": "project",
  "type": "props",
  "total": 9,
  "offset": 0,
  "items": [
    {
      "id": "prop_1795137635562_hq7y9_0",
      "name": "挂钟",
      "owner": "通用",
      "description": "Ruth & Marcus 房间墙上的挂钟，第5场首次出场，用于显示凌晨两点的时间。",
      "materialAndState": "挂在墙上的钟表，显示凌晨两点",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635562_hq7y9_0_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "prop_1795137635563_98oa6_1",
      "name": "枕头",
      "owner": "通用",
      "description": "Simone & Remy 房间床上的枕头，第5场首次出场，Remy 惊慌中抱住枕头跳下床。",
      "materialAndState": "床上枕头，被 Remy 一把抱住",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635563_98oa6_1_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "prop_1795137635563_ts9zt_2",
      "name": "米色开衫",
      "owner": "通用",
      "description": "Simone 披着的米色开衫，第5场首次出场，Simone 失眠披衣下楼泡安神茶。",
      "materialAndState": "米色针织开衫，披在 Simone 身上",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635563_ts9zt_2_para_3_3699",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "evidenceText": "￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）",
          "anchorText": "ill sunrise.）\n￮ Simone & Remy 房：19岁的 Remy 吓得脸色惨白，一把抱住枕头跳下床去推 Simone 的床铺——却发现 Simone 的床上空无一人！（原来失眠的 Simone 两分钟前就已经披着米色开衫下楼去茶水间泡安神茶了，此刻正站在二楼通往一楼大厅的楼梯拐角阴影里，从头到尾目睹并举着手机录下了大厅角落里的 Juno。）\n￮Ines & Val 房",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3699,
          "lineNumber": 47
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"
      ]
    },
    {
      "id": "prop_1795137635564_88utc_3",
      "name": "智能手环",
      "owner": "通用",
      "description": "剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。",
      "materialAndState": "腕戴式智能手环，屏幕泛红光，显示余额与确认界面",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635564_88utc_3_para_4_3194",
          "sceneId": "sc-36-3100",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
          "matchedTerm": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
          "evidenceText": "▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：",
          "anchorText": "——嗡——嗡——嗡——！”\n▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3194,
          "lineNumber": 41
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_5_3271",
          "sceneId": "sc-36-3100",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂",
          "matchedTerm": "【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）",
          "evidenceText": "【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）",
          "anchorText": "出一行令人毛骨悚然的血字：\n【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）\n \n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3271,
          "lineNumber": 42
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_2_3405",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "evidenceText": "￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）",
          "anchorText": "极速穿梭于六个炸锅的房间：\n￮Ruth & Marcus 房：Marcus 像被电击一样猛地从床上弹坐起来，看着手腕上的红光，额头冷汗瞬间冒了出来：“操！真有人花五百块买了？！谁买的？！是不是 Wren 那个疯女人？！”（Fuck! Someone actually dropped five hundred on it?! Who bought it?! Was it Wren?!）旁边的 Ruth 皱眉坐起身，看了一眼墙上的挂钟：“凌晨两点……这人连天亮都等不及啊。”（Two in the morning... Whoever it is couldn't even wait till sunrise.）\n￮ Simone & Re",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3405,
          "lineNumber": 46
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_4_3866",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "evidenceText": "￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）",
          "anchorText": "大厅角落里的 Juno。）\n￮Ines & Val 房：Ines 冷冷地按灭手环震动，看了一眼对面床上纹丝不动的 Val：“看来明早的金库要热闹了。”（Looks like the vault’s gonna be fun tomorrow morning.）\n￮Avery & Juno",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3866,
          "lineNumber": 48
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_5_3983",
          "sceneId": "sc-43-3373",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
          "matchedTerm": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "evidenceText": "￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。",
          "anchorText": "row morning.）\n￮Avery & Juno 房：床上的 Avery 被震醒，迷迷糊糊地抬起手腕看了一眼红光，嘴里嘟囔了一句“谁这么狠啊……”，转头看了一眼空着的隔壁床铺，只当 Juno 去洗手间了，因为心里笃定自己跟谁都没仇，翻了个身又毫无防备地睡了过去。\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 3983,
          "lineNumber": 49
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_2_4129",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "evidenceText": "▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——",
          "anchorText": "厅\n6.▲【现场】一楼大厅\n▲Juno 看着自己手环上仅剩的 200 SC 余额，心脏跳得快要从嗓子眼蹦出来。她慌忙想要按灭自己的手环屏幕，转身逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4129,
          "lineNumber": 53
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_7_4297",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
          "evidenceText": "▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！",
          "anchorText": "地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来得及关掉的手环屏幕上，【埋雷成功！目标已锁定：Avery · 顶配交响乐队】的红色确认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4297,
          "lineNumber": 58
        },
        {
          "id": "vp_prop_1795137635564_88utc_3_para_8_4366",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "evidenceText": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "anchorText": "认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4366,
          "lineNumber": 59
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间",
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"
      ]
    },
    {
      "id": "prop_1795137635564_pce71_4",
      "name": "壁灯",
      "owner": "通用",
      "description": "一楼大厅侧后方开放式厨房的壁灯，第6场首次出场，昏黄灯光突然亮起。",
      "materialAndState": "昏黄壁灯，突然亮起",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635564_pce71_4_para_4_4201",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！",
          "evidenceText": "▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！",
          "anchorText": "逃回二楼——\n▲“啪嗒。”\n▲大厅侧后方的开放式厨房里，一盏昏黄的壁灯突然亮了！\n▲Juno 浑身汗毛倒竖，",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4201,
          "lineNumber": 55
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "prop_1795137635565_i2y5j_5",
      "name": "丝绸睡袍",
      "owner": "通用",
      "description": "Diego 穿着的丝绸睡袍，第6场首次出场，Diego 深夜在厨房出现时的装束。",
      "materialAndState": "丝绸材质睡袍，穿在 Diego 身上",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635565_i2y5j_5_para_6_4249",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "evidenceText": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "anchorText": "身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4249,
          "lineNumber": 57
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "prop_1795137635565_03l8n_6",
      "name": "水杯",
      "owner": "通用",
      "description": "Diego 手中的水杯，第6场首次出场，装着刚接好的温水。",
      "materialAndState": "盛有温水的杯子，被 Diego 端着",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635565_03l8n_6_para_6_4249",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "evidenceText": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "anchorText": "身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4249,
          "lineNumber": 57
        },
        {
          "id": "vp_prop_1795137635565_03l8n_6_para_8_4366",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "evidenceText": "▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：",
          "anchorText": "认界面，正泛着刺眼的红光！\n▲Diego 经过她身边时，目光在她还没来得及关掉的手环屏幕上停顿了一秒，却什么都没问，只是端着水杯对她温和地笑了笑：\nDiego（声音轻柔）：还",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4366,
          "lineNumber": 59
        },
        {
          "id": "vp_prop_1795137635565_03l8n_6_para_10_4480",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "evidenceText": "▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。",
          "anchorText": "? Goodnight.）\n▲Diego 端着水杯慢条斯理地走上楼梯。Juno 僵在原地，心里根本拿不准他刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4480,
          "lineNumber": 61
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "prop_1795137635566_d93jk_7",
      "name": "厨房岛台",
      "owner": "通用",
      "description": "一楼大厅开放式厨房的岛台，第6场首次出场，Diego 从岛台后走出。",
      "materialAndState": "开放式厨房岛台",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635566_d93jk_7_para_6_4249",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "evidenceText": "▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。",
          "anchorText": "身汗毛倒竖，猛地僵在原地！\n▲只见穿着丝绸睡袍的 Diego，手里端着一杯刚接好的温水，不紧不慢地从厨房岛台后面走了出来。\n▲而此时，Juno 还没来",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4249,
          "lineNumber": 57
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    },
    {
      "id": "prop_1795137635566_avj8m_8",
      "name": "智能手机",
      "owner": "通用",
      "description": "Simone 手中的智能手机，第6场首次出场，用于偷录大厅发生的一幕。",
      "materialAndState": "智能手机，摄像头开启录像",
      "verifiedProvenance": [
        {
          "id": "vp_prop_1795137635566_avj8m_8_para_11_4533",
          "sceneId": "sc-50-4105",
          "sceneTitle": "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅",
          "matchedTerm": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "evidenceText": "▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！",
          "anchorText": "刚才那一眼到底看见了多少。\n▲Juno 瘫软地靠住墙面，大口大口地喘着粗气——但她和 Diego 谁也没有发现，在二楼通往一楼大厅的消防楼梯铁门门缝后，41岁的 Simone 正静静地站在黑暗里，手里举着的智能手机摄像头，将刚才大厅里发生的一幕完完整整地录了下来！\n \n\n\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 4533,
          "lineNumber": 62
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "33543:1br6fs9",
      "sourceScenes": [
        "第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"
      ]
    }
  ],
  "nextOffset": null
}
```

---
## 第 10 轮（耗时：10467 ms (10.47 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.list, user.ask`
- **Token 与缓存**：Prompt 7007 tokens · 缓存命中 2048 (29.2%) · 输出 444

### [第 10 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断、写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据，将工具成功返回作为生效准绳，不把预期动作提前当作已完成事实。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属、版本划分或关键取舍存在客观歧义且无法仅凭项目数据自证时，主动通过 user.ask 简明征询用户意见后再推进；在目标与事实明确时保持连贯自主执行，避免无谓打断。
3. 通用四段式输出协议：无论处于哪一阶段，每次回复都必须严格依次输出以下 4 个完整区块（区块名须保持原样，不得省略或改名）：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行严密逻辑推演与参数核对，形成确定性的行动依据}
   - 工具调用：{严格按双花括号格式输出本轮要调用的工具指令：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）}
   - 用户沟通：{按当前阶段【输出格式】规定输出对用户说的话：常规中间推进轮次仅输出“- 对用户说的话（简版）”（口语化介绍当前进展，控制在30字以内；注意调用工具不等于完成任务）；仅在当前阶段【输出格式】规定的需补充完整说明场景下，同时输出“- 对用户说的话（简版）”与“- 对用户说的话（完整版）”}

# 当前阶段职责与工作指南
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。
1. 事实依据与步骤闭环（读写落盘 vs 只读核验显式分流）：
   - 所有写入、修改、生成或核验结论必须基于已读取的真实项目数据或已观察到的页面/卡片事实；
   - 若当前计划步骤属于“创建/修改/生成/绑定/标注”等写操作步骤：每个子步骤均按“先调用读取工具获取该单元明细 → 下一轮立即基于【工具执行结果】中的原始明细核验并调用创建或增量更新工具落盘”的两步闭环推进；仅当该单元落盘完成后该子步骤才算完成（[x]）并推进下一未完成步骤（[ ]），不跨多轮连续只读囤积数据后再集中汇总写入；
   - 若当前计划步骤属于“纯查询/读取/画面比对核验”等无需调用写入工具的只读核验步骤：在读取或观察工具返回真实数据并在思考中完成逐项比对核验后，该子步骤即算完成（[x]）；
2. 工具契约与确定性真值：
   - 严格遵循已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；
3. 连续流转与退出时机：
   - 所需工具已在【当前可直接调用】中时，直接连续调用推进下一待办步骤（[ ]）；仅在需补充工具或所有计划步骤全部完成（全部标为 [x]）时无参调用 sys.selectContext 返回全局计划与验收阶段（由全局阶段统一验收并向用户作最终汇报）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前子步骤处于“已读取待写入落盘”、“已写入落盘完成”还是“纯只读核验已完成”状态？
- 重点笔记盘点：本轮有哪些后续步骤或返回全局阶段汇报仍需引用的关键事实、核验结论、实体 ID 或未落盘线索？结合本轮执行，你对任务有哪些新的理解、总结了什么当轮经验，或对后续步骤有什么主观感受与自我提醒？}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演：
- 1. 逐项核验与参数推演：若当前处于“已读取待写入落盘”状态，必须立即基于刚读出的原始明细调用创建或更新工具完成本批落盘（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中从首段至末段逐段完整输出）；若当前为无需写入的只读核验步骤，基于工具返回的真实数据或图像完成严密比对并记录明确核验结论；
- 2. 计划状态更新与下一步行动：更新“当前计划”各步骤状态（[x] / [ ]）与当前进度，确定本轮要调用的具体工具与参数（若当前计划所有步骤均已完成 [x]，必须无参调用 sys.selectContext 返回全局计划阶段进行最终汇报）。}
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
- script.read：按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber，每集/场次均附带正文字数 charCount）。传 scene 筛选场次时：① 若场次编号在目录中唯一（如 "1-2"），可直接传编号；② 若多个子场次共用同一编号（例如目录下有多个 "1-5"），禁止只传未区分的 "1-5"，必须传目录返回的唯一场次 ID（如 "scene-39-1953"）或带地点/内外景的精准标识（如 "1-5 娜塔莉亚家"、"1-5内"、"1-5外"），确保单批总字数控制在 recommendedBatchMaxChars（2500 字）内（勿自行拼接虚构括号后缀如 "1-5（家）"）。支持按 episode、scene、paragraph（序号或区间）或 startLine/endLine/offset/limit 定向读取。
  参数：{ episode?: string | number, scene?: string | number | Array<string | number>, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }

## 候选工具简表
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档（已有资产增量追加出处），最终核验无遗漏后结案。
当前计划：[x] 检索经验并装载工具
[x] 读取目录定位第四场正文并查重现有资产
[x] 提取资产清单
[x] 创建/更新资产
[ ] 重新读取第四场正文与资产列表核验完整性并结案
重点笔记：暂无笔记
当前小目标：比对第四场正文与角色/场景/道具资产列表，确认所有资产均已建档且出处完整，无遗漏后结案
当前进度：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）、查重及场景「二楼六个卧室」与道具「智能手环」第4场出处追加；本轮已重新读取第四场正文及三类资产列表，但尚未完成逐项比对核验，整体处于第5步核验执行中。

# 工具执行结果
【工具 script.read 执行成功】（按“集数 -> 场次 -> 段落”三层结构返回 | 集数: 1 | 场次数: 1 | 段落数: 5 | 字数: 255 字 | 每轮建议上限: 2500 字 | 行范围: 第 37～43 行 | nextOffset: null）
{"episodes":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":1,"paragraphCount":5,"charCount":255,"scenes":[{"index":1,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255,"paragraphs":[{"index":1,"text":"4.▲（大场面·午夜红光惊魂）"},{"index":2,"text":"▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！"},{"index":3,"text":"▲“嗡——嗡——嗡——嗡——！”"},{"index":4,"text":"▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字："},{"index":5,"text":"【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）"}]}]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"characters","total":9,"offset":0,"items":[{"id":"char_1795137572013_hs1bw_0","name":"Marcus","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Ruth同住二楼卧室。凌晨被手环红光震醒，惊慌质问谁买了暗雷。","appearance":"男性选手，睡在床上被惊醒，额头冒冷汗","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[46]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572015_iymf5_1","name":"Ruth","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Marcus同住二楼卧室。冷静，看挂钟判断时间。","appearance":"女性选手，皱眉坐起身","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[46]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_c1fnc_2","name":"Remy","role":"剧中角色","description":"第二集第5场首次出场，19岁选手，与Simone同住二楼卧室。胆小，被红光吓得抱枕跳床。","appearance":"19岁，脸色惨白，抱着枕头","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_itbvw_3","name":"Simone","role":"剧中角色","description":"第二集第5场首次出场，41岁选手，与Remy同住二楼卧室。失眠下楼泡安神茶，暗中用手机录下大厅一幕。","appearance":"41岁，披着米色开衫，手持智能手机","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"char_1795137572016_d2dq2_4","name":"Ines","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Val同住二楼卧室。冷静，按灭手环。","appearance":"女性选手，冷冷按灭手环","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[48]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_0qoag_5","name":"Val","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Ines同住二楼卧室。睡梦中纹丝不动。","appearance":"女性选手，躺在床上纹丝不动","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[48]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_6xhwa_6","name":"Avery","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Juno同住二楼卧室。被震醒后毫无防备继续睡，成为暗雷目标。","appearance":"女性选手，迷迷糊糊抬腕看红光","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572017_h19zc_7","name":"Juno","role":"剧中角色","description":"第二集第6场首次出场，选手之一，与Avery同住二楼卧室。深夜在一楼大厅买下暗雷，被Diego撞见。","appearance":"女性选手，手环余额仅剩200 SC，神情慌张","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":6,"lines":[53,56,58,60,61,62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"char_1795137572017_a68hn_8","name":"Diego","role":"剧中角色","description":"第二集第6场首次出场，选手之一。深夜穿睡袍到厨房接水，撞见Juno却不动声色。","appearance":"穿着丝绸睡袍，端着水杯","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":5,"lines":[57,59,60,61,62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"locations","total":4,"offset":0,"items":[{"id":"loc_1795137603722_5hjfl_0","name":"二楼六个卧室","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[39,41]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":5,"lines":[45,46,47,48,49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},{"id":"loc_1795137603722_9du4y_1","name":"一楼大厅","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第6场，别墅一楼大厅，连接二楼楼梯与开放式厨房，侧后方有厨房，另有通往二楼的消防楼梯铁门。","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":7,"lines":[52,53,55,57,59,61,62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"loc_1795137603722_b8a3s_2","name":"开放式厨房","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第6场，位于一楼大厅侧后方的开放式厨房，内有厨房岛台与昏黄壁灯。","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":2,"lines":[55,57]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"loc_1795137603723_p2xut_3","name":"楼梯拐角","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，二楼通往一楼大厅的楼梯拐角阴影处，Simone 曾在此目睹并录像；第6场消防楼梯铁门门缝后亦为 Simone 藏身处。","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"props","total":9,"offset":0,"items":[{"id":"prop_1795137635562_hq7y9_0","name":"挂钟","owner":"通用","description":"Ruth & Marcus 房间墙上的挂钟，第5场首次出场，用于显示凌晨两点的时间。","materialAndState":"挂在墙上的钟表，显示凌晨两点","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[46]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"prop_1795137635563_98oa6_1","name":"枕头","owner":"通用","description":"Simone & Remy 房间床上的枕头，第5场首次出场，Remy 惊慌中抱住枕头跳下床。","materialAndState":"床上枕头，被 Remy 一把抱住","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"prop_1795137635563_ts9zt_2","name":"米色开衫","owner":"通用","description":"Simone 披着的米色开衫，第5场首次出场，Simone 失眠披衣下楼泡安神茶。","materialAndState":"米色针织开衫，披在 Simone 身上","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"prop_1795137635564_88utc_3","name":"智能手环","owner":"通用","description":"剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。","materialAndState":"腕戴式智能手环，屏幕泛红光，显示余额与确认界面","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[41,42]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":3,"lines":[46,48,49]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[53,58,59]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},{"id":"prop_1795137635564_pce71_4","name":"壁灯","owner":"通用","description":"一楼大厅侧后方开放式厨房的壁灯，第6场首次出场，昏黄灯光突然亮起。","materialAndState":"昏黄壁灯，突然亮起","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[55]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635565_i2y5j_5","name":"丝绸睡袍","owner":"通用","description":"Diego 穿着的丝绸睡袍，第6场首次出场，Diego 深夜在厨房出现时的装束。","materialAndState":"丝绸材质睡袍，穿在 Diego 身上","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[57]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635565_03l8n_6","name":"水杯","owner":"通用","description":"Diego 手中的水杯，第6场首次出场，装着刚接好的温水。","materialAndState":"盛有温水的杯子，被 Diego 端着","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[57,59,61]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635566_d93jk_7","name":"厨房岛台","owner":"通用","description":"一楼大厅开放式厨房的岛台，第6场首次出场，Diego 从岛台后走出。","materialAndState":"开放式厨房岛台","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[57]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635566_avj8m_8","name":"智能手机","owner":"通用","description":"Simone 手中的智能手机，第6场首次出场，用于偷录大厅发生的一幕。","materialAndState":"智能手机，摄像头开启录像","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}
```

### [第 10 轮] 模型原始输出
```text
状态检查：
- 当前执行第5步「重新读取第四场正文与资产列表核验完整性并结案」，本轮已取得第四场正文（scene-37-3100，5段）及角色/场景/道具三类资产列表。
- 处于纯只读核验阶段，需逐项比对后判定是否无遗漏。
- 重点笔记：第四场正文仅涉及「二楼六个卧室」（第39、41行）、「智能手环」（第41、42行）两项实体，无具名角色出场（仅"十二只手腕"泛指选手）。

思考：
逐段核验第四场正文（行37-43）：
- 段1「4.▲（大场面·午夜红光惊魂）」：场次标题，无实体。
- 段2「血红色数据流…炸向二楼的六个卧室」：场景「二楼六个卧室」——已建档 loc_1795137603722_5hjfl_0，出处含 sc-36-3100 第39、41行 ✓。
- 段3「嗡——」：拟声，无实体。
- 段4「六个房间、十二张床铺…十二只手腕上的智能手环…血字」：道具「智能手环」——已建档 prop_1795137635564_88utc_3，出处含 sc-36-3100 第41、42行 ✓；「床铺」为场景内陈设，已含于场景描述，无需单列。
- 段5「全员二级警报…暗雷…」：系统警报文字，无新增实体。
角色：第四场无具名角色出场，现有9个角色均标注第5/6场首次出场，无需为第4场追加出处。
结论：第四场全部资产（场景1项、道具1项）均已建档且出处完整，无遗漏。所有计划步骤完成，返回全局阶段结案。

工具调用：
{{调用 sys.selectContext}}

用户沟通：
- 对用户说的话（简版）：第四场资产核验完毕，无遗漏，已结案。
```

### [第 10 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "categories": [],
  "tools": [],
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
    "asset"
  ],
  "transition": "return_to_plan"
}
```

---
## 第 11 轮（耗时：11190 ms (11.19 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (4)：`sys.selectContext, sys.endTask, user.ask, experience.search`
- **Token 与缓存**：Prompt 6287 tokens · 缓存命中 1280 (20.4%) · 输出 391

### [第 11 轮] 实际发送 Prompt
```text
=== [SYSTEM] ===
# 角色与通用准则
你位于一个短剧协作平台中，负责协助用户完成从剧本拆解、资产建档到分镜生图与视频生成的全流程创作任务，你的名字是“七七”。称用户为“你”，沟通口吻亲和、自然、清晰。
1. 事实依据与后台优先底线：处理项目数据时优先使用后台工具直接读取与持久化，需要演示或核验界面时再使用 UI 工具。所有判断, 写入、状态更新与结案结论，都必须严格以【工具执行结果 / 页面观察】返回与当前聚焦目标中的真实事实为依据。
2. 清晰协同与边界确认原则：当用户的任务边界、资产归属或关键取舍存在客观歧义时，主动通过 user.ask 简明征询用户意见；在目标明确时保持自主执行。
3. 通用四段式输出协议：每次回复都必须严格依次输出以下 4 个完整区块：
   - 状态检查：{客观盘点当前认知状态、本轮工具返回事实与下一步准备}
   - 思考：{使用内心独白进行逻辑推演、意图识别与参数核对}
   - 工具调用：{严格按双花括号格式输出指令：{{调用 工具名称, {"参数名": "参数值"}}}，无参数简写为 {{调用 工具名称}}}
   - 用户沟通：{常规中间推进轮次输出“- 对用户说的话（简版）”（30字以内）；只有输出长内容时填入完整版内容，一般情况直接忽略，不写}

# 当前阶段职责与工作指南
当前你处于【全局计划与验收阶段】，核心职责是按以下闭环推进任务：
0. 意图识别：结合用户输入与当前聚焦目标判断诉求——若可直接作答则回复并调用 sys.endTask 结束；若意图模糊或边界不清则调用 user.ask 确认；若为明确可执行任务则进入下方流程；
1. 检索同类任务经验：初启时调用 experience.search（可与 sys.selectContext 同轮并发）；
2. 探查与制定计划：探查数据分布，动态重规划“当前计划”（将任务拆解为首批读取+创建、后续读取+增量更新闭环步骤）；
3. 实施：成套装载工具切入执行；
4. 验收：确认全部达成后调用 sys.endTask 结案。

# 输出格式
状态检查：
{盘点认知状态、本轮工具事实、意图判断与原计划完成度}
思考：
{内心独白：1. 意图识别与策略推演；2. 制定或更新当前计划步骤（[x]/[ ]）；3. 下一步行动与重点参数}
工具调用：
{按格式输出本轮要调用的工具指令}
用户沟通：
{
- 对用户说的话（简版）：“...”
思考：{是否必须输出长内容，再无其它办法}
- 对用户说的话（完整版）：“（按需选填）”
}

# 可用工具
## 当前可直接调用
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- experience.search：在全局计划阶段检索同类任务的最佳实践经验（返回“搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收”四步走作业标准与关键防漏要点；仅在识别出明确可执行任务且尚未检索经验时调用，可与首次展开工具分类的 sys.selectContext 同轮并发调用；日常寒暄、能力咨询或待用户澄清意图时不调用）。
  参数：{ query: string }
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段：① 传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合当前计划从候选简表中成套挑选工具 ID 传 {"tools": [...]} 进入局部执行阶段（涉及分步提取须同时装配 [script.read, asset.create, asset.update] 读写套件；探查期推荐同时装载 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset]）
- script.directory：读取剧本分集与场次目录概览（含唯一场次 ID、段落数、正文字数与每轮字数建议）
- script.editDirectory：编辑剧本目录条目（重命名、新增、删除、拆分、合并或移动分集/场次标题，同步更新正文与目录并持久化）
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（附每集/场次字数与单批字数上限建议）
- script.search：在剧本指定集数范围中搜索关键词并返回匹配行及命中场次字数分布
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定已读剧本的出处段落（多批次分步提取时用于首批读取后创建主卡，后续批次用 asset.update 增量追加）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如不同年龄阶段或不同服装造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落（含场次字数统计）
- asset.commitProvenance：提交核验通过的资产出处段落锚点
- asset.bindImage：将画布图像卡片或生成结果绑定为资产（或二级版本）的资产图，或设为主图/解绑

## 其它未展开的工具分类（可传 categories 补充展开）
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

=== [USER] ===
# 用户指令
## 初始任务指令
提取第四场的全部资产
## 当前聚焦目标
【当前聚焦目标：assets.panel.container】

# 认知状态
任务标题：提取第四场资产
最终目标：读取剧本第四场正文，提取其中角色/场景/道具资产并建档（已有资产增量追加出处），最终核验无遗漏后结案。
当前计划：[x] 检索经验并装载工具
[x] 读取目录定位第四场正文并查重现有资产
[x] 提取资产清单
[x] 创建/更新资产
[x] 重新读取第四场正文与资产列表核验完整性并结案
重点笔记：暂无笔记
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成经验检索、工具装载、目录定位、第四场正文读取（scene-37-3100，5段）、查重、场景「二楼六个卧室」与道具「智能手环」第4场出处追加，并逐段核验确认无遗漏，全部计划步骤完成，已结案。

# 工具执行结果
【工具 script.read 执行成功】（按“集数 -> 场次 -> 段落”三层结构返回 | 集数: 1 | 场次数: 1 | 段落数: 5 | 字数: 255 字 | 每轮建议上限: 2500 字 | 行范围: 第 37～43 行 | nextOffset: null）
{"episodes":[{"index":1,"id":"episode-1","number":"二","title":"第二集：雷在谁身上（Who's Stepping on the Mine?）","sceneCount":1,"paragraphCount":5,"charCount":255,"scenes":[{"index":1,"id":"scene-37-3100","sceneNumber":"第4场","title":"第4场 午夜红光惊魂","locationName":"午夜红光惊魂","paragraphCount":5,"charCount":255,"paragraphs":[{"index":1,"text":"4.▲（大场面·午夜红光惊魂）"},{"index":2,"text":"▲“轰——！”交易确认的同一毫秒，一道刺目的血红色数据流顺着整栋建筑的网络轰然炸向二楼的六个卧室！"},{"index":3,"text":"▲“嗡——嗡——嗡——嗡——！”"},{"index":4,"text":"▲漆黑的夜色中，六个房间、十二张床铺上，十二只手腕上的智能手环在同一秒爆发出妖异的血红色强光，发疯般剧烈震动起来！屏幕齐刷刷跳出一行令人毛骨悚然的血字："},{"index":5,"text":"【全员二级警报：全场唯一“暗雷”刚刚已被售出并埋入！演出当晚引爆！】（[SYSTEM ALERT: THE LANDMINE HAS JUST BEEN PURCHASED & PLANTED!]）"}]}]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"characters","total":9,"offset":0,"items":[{"id":"char_1795137572013_hs1bw_0","name":"Marcus","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Ruth同住二楼卧室。凌晨被手环红光震醒，惊慌质问谁买了暗雷。","appearance":"男性选手，睡在床上被惊醒，额头冒冷汗","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[46]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572015_iymf5_1","name":"Ruth","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Marcus同住二楼卧室。冷静，看挂钟判断时间。","appearance":"女性选手，皱眉坐起身","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[46]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_c1fnc_2","name":"Remy","role":"剧中角色","description":"第二集第5场首次出场，19岁选手，与Simone同住二楼卧室。胆小，被红光吓得抱枕跳床。","appearance":"19岁，脸色惨白，抱着枕头","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_itbvw_3","name":"Simone","role":"剧中角色","description":"第二集第5场首次出场，41岁选手，与Remy同住二楼卧室。失眠下楼泡安神茶，暗中用手机录下大厅一幕。","appearance":"41岁，披着米色开衫，手持智能手机","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"char_1795137572016_d2dq2_4","name":"Ines","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Val同住二楼卧室。冷静，按灭手环。","appearance":"女性选手，冷冷按灭手环","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[48]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_0qoag_5","name":"Val","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Ines同住二楼卧室。睡梦中纹丝不动。","appearance":"女性选手，躺在床上纹丝不动","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[48]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572016_6xhwa_6","name":"Avery","role":"剧中角色","description":"第二集第5场首次出场，选手之一，与Juno同住二楼卧室。被震醒后毫无防备继续睡，成为暗雷目标。","appearance":"女性选手，迷迷糊糊抬腕看红光","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"char_1795137572017_h19zc_7","name":"Juno","role":"剧中角色","description":"第二集第6场首次出场，选手之一，与Avery同住二楼卧室。深夜在一楼大厅买下暗雷，被Diego撞见。","appearance":"女性选手，手环余额仅剩200 SC，神情慌张","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":6,"lines":[53,56,58,60,61,62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"char_1795137572017_a68hn_8","name":"Diego","role":"剧中角色","description":"第二集第6场首次出场，选手之一。深夜穿睡袍到厨房接水，撞见Juno却不动声色。","appearance":"穿着丝绸睡袍，端着水杯","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":5,"lines":[57,59,60,61,62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"locations","total":4,"offset":0,"items":[{"id":"loc_1795137603722_5hjfl_0","name":"二楼六个卧室","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，别墅二楼并排的六个卧室，镜头极速穿梭其间。含 Ruth & Marcus 房、Simone & Remy 房、Ines & Val 房、Avery & Juno 房等，各房内设床铺、挂钟等。","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[39,41]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":5,"lines":[45,46,47,48,49]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},{"id":"loc_1795137603722_9du4y_1","name":"一楼大厅","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第6场，别墅一楼大厅，连接二楼楼梯与开放式厨房，侧后方有厨房，另有通往二楼的消防楼梯铁门。","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":7,"lines":[52,53,55,57,59,61,62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"loc_1795137603722_b8a3s_2","name":"开放式厨房","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第6场，位于一楼大厅侧后方的开放式厨房，内有厨房岛台与昏黄壁灯。","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":2,"lines":[55,57]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"loc_1795137603723_p2xut_3","name":"楼梯拐角","type":"INT","timeOfDay":"日景","description":"首次出场于第二集第5场，二楼通往一楼大厅的楼梯拐角阴影处，Simone 曾在此目睹并录像；第6场消防楼梯铁门门缝后亦为 Simone 藏身处。","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1794973206015","source":"project","type":"props","total":9,"offset":0,"items":[{"id":"prop_1795137635562_hq7y9_0","name":"挂钟","owner":"通用","description":"Ruth & Marcus 房间墙上的挂钟，第5场首次出场，用于显示凌晨两点的时间。","materialAndState":"挂在墙上的钟表，显示凌晨两点","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[46]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"prop_1795137635563_98oa6_1","name":"枕头","owner":"通用","description":"Simone & Remy 房间床上的枕头，第5场首次出场，Remy 惊慌中抱住枕头跳下床。","materialAndState":"床上枕头，被 Remy 一把抱住","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"prop_1795137635563_ts9zt_2","name":"米色开衫","owner":"通用","description":"Simone 披着的米色开衫，第5场首次出场，Simone 失眠披衣下楼泡安神茶。","materialAndState":"米色针织开衫，披在 Simone 身上","verifiedProvenance":[{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":1,"lines":[47]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间"]},{"id":"prop_1795137635564_88utc_3","name":"智能手环","owner":"通用","description":"剧中人物佩戴的智能手环，可显示红光、震动、SC 余额与埋雷确认界面，第5场首次出场。","materialAndState":"腕戴式智能手环，屏幕泛红光，显示余额与确认界面","verifiedProvenance":[{"sceneId":"sc-36-3100","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂","count":2,"lines":[41,42]},{"sceneId":"sc-43-3373","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","count":3,"lines":[46,48,49]},{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[53,58,59]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第5场 镜头穿梭六个房间","第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","第二集：雷在谁身上（Who's Stepping on the Mine?） 第4场 午夜红光惊魂"]},{"id":"prop_1795137635564_pce71_4","name":"壁灯","owner":"通用","description":"一楼大厅侧后方开放式厨房的壁灯，第6场首次出场，昏黄灯光突然亮起。","materialAndState":"昏黄壁灯，突然亮起","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[55]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635565_i2y5j_5","name":"丝绸睡袍","owner":"通用","description":"Diego 穿着的丝绸睡袍，第6场首次出场，Diego 深夜在厨房出现时的装束。","materialAndState":"丝绸材质睡袍，穿在 Diego 身上","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[57]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635565_03l8n_6","name":"水杯","owner":"通用","description":"Diego 手中的水杯，第6场首次出场，装着刚接好的温水。","materialAndState":"盛有温水的杯子，被 Diego 端着","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":3,"lines":[57,59,61]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635566_d93jk_7","name":"厨房岛台","owner":"通用","description":"一楼大厅开放式厨房的岛台，第6场首次出场，Diego 从岛台后走出。","materialAndState":"开放式厨房岛台","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[57]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]},{"id":"prop_1795137635566_avj8m_8","name":"智能手机","owner":"通用","description":"Simone 手中的智能手机，第6场首次出场，用于偷录大厅发生的一幕。","materialAndState":"智能手机，摄像头开启录像","verifiedProvenance":[{"sceneId":"sc-50-4105","sceneTitle":"第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅","count":1,"lines":[62]}],"provenanceStatus":"verified","sourceScenes":["第二集：雷在谁身上（Who's Stepping on the Mine?） 第6场 现场 一楼大厅"]}]}

【工具 sys.selectContext 执行成功】已返回全局计划与验收阶段（局部执行工具已卸载；此前已展开分类 [script, asset] 的候选工具简表已在上方就绪，如需进入下一阶段执行可直接从中挑选 tools；若所有目标已全部完成，请调用 sys.endTask 结束任务）
```

### [第 11 轮] 模型原始输出
```text
状态检查：
- 第四场正文（scene-37-3100，5段）已读取：内容为午夜红光惊魂，涉及二楼六个卧室、十二只智能手环、血红色数据流与警报文字。
- 现有资产列表已核对：场景「二楼六个卧室」已含第4场出处（lines 39,41）；道具「智能手环」已含第4场出处（lines 41,42）。
- 第四场无具体角色出场（仅"十二只手腕"泛指），无新增角色资产。
- 计划全部步骤已完成，可结案。

思考：
1. 意图识别：用户要求"提取第四场的全部资产"，已逐段核验第四场5段文本，资产仅涉及场景「二楼六个卧室」与道具「智能手环」，二者均已建档并追加第4场出处，无遗漏。
2. 计划核对：[x] 检索经验 [x] 定位第四场 [x] 提取清单 [x] 创建/更新 [x] 核验结案。
3. 下一步：调用 sys.endTask 结案并汇报。

工具调用：
{{调用 sys.endTask, {"success": true}}}

用户沟通：
- 对用户说的话（简版）：“第四场资产已提取核验完毕，无遗漏，已结案。”
- 对用户说的话（完整版）：“第四场（第4场 午夜红光惊魂）资产提取完成，核验结果如下：
【场景】二楼六个卧室 —— 已追加第4场出处（第39、41行）
【道具】智能手环 —— 已追加第4场出处（第41、42行）
【角色】本场无具体角色出场（仅泛指"十二只手腕"），无需新建。
全部资产均已建档且出处完整，无遗漏，任务结案。”
```

### [第 11 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.endTask` (succeeded)
**工具输入 (Input)**：
```json
{
  "success": true
}
```
**工具输出 (Output)**：
```json
任务已结束
```
