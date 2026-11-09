# 任务运行追踪明细（共 7 轮）：提取娜塔莉亚资产
- **最终目标**：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
- **任务状态**：completed · **总耗时**：62.2 s
- **最新进展**：已完成三路只读探查确认出场分布与资产库为空；已创建娜塔莉亚角色资产卡 char_1794216503373_y8oc3_0（charv_1 22岁心理医生职业装、charv_2 8岁童年闪回两版本），出处段落全部 verified 且覆盖第一集1-2、1-3、1-4、1-5家、1-5庄园共5场；全局核验通过并已调用 sys.endTask 结案，任务全部完成。（小目标：全局核验上一阶段执行结果并推进下一步或结案）

---
## 第 1 轮（耗时：3162 ms (3.16 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 1 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
默认优先使用后台工具读取项目数据；需要演示或核验界面时使用 UI。基于工具返回的事实推进，严禁把未执行视为成功。
进入执行阶段前，必须制定步骤化的“当前计划”，驱动执行阶段连续执行：
1. 探查期安全原则（数据未知时）：制定宏观探查计划，调用 sys.selectContext 仅装载只读探查工具（如 script.directory、script.search、asset.list），严禁提前装载写入工具；
2. 动态重规划原则（获知数据分布后）：当触发数据量预警或上一轮返回了场次分布概览（scenesSummary）时，必须在“当前计划”中将宏观任务细化为按场次/实体的具体子步骤（分步推进：首场建卡、后续场次追加）；切入执行时一次性装载所需的读写工具组（如 script.read, asset.create, asset.update），严禁盲目单步硬吞；
3. 工具装载与流转：结合“当前计划”所需工具，通过 sys.selectContext 展开分类或装载 tools 进入执行阶段；
4. 全局核验与结案：从执行阶段返回后，对照“最终目标”与“当前计划”核验所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。
称用户为“你”，口吻亲和随意；遇需用户决策事项在用户沟通中说明。工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 对照“当前计划”与“工具执行结果”核验推进：
  * 初次规划：列出宏观探查计划（如：[ ] 1. 探查数据现状；[ ] 2. 提取/创建资产；[ ] 3. 全局核验）；
  * 动态重规划：若触发数据量预警或已知场次分布，在此处将旧宏观步骤直接替换输出为细化后的分步子任务列表（标记 [x] 已完成、[ ] 待推进）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）。
- 最终目标与当前计划是否全部达成？若全部达成，准备调用 sys.endTask 结案；若未完成，下一步推进哪个步骤与小目标？
- 为执行当前计划，需要先展开哪些分类（categories），或挑选哪些具体工具（tools）进入执行阶段？
- 是否有关键结论需要沉淀到“重点笔记”？}
思考：
{使用内心独白的方式，围绕全局目标、计划制定与工具准备进行逻辑推演。如果需要展开分类、装载工具进入执行或结束任务，请调用对应工具，系统会自动执行你的操作。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前任务状态、汇报结果或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段。规则：① 需展开新工具分类时，传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合“当前计划”中的各个步骤，从已展开的候选简表中一次性挑选执行该计划所需的具体工具 ID 传 {"tools": [...]} 进入局部执行阶段（装配原则：工具须成组配套，若任务涉及资产提取且需分步追加，须同时装配 [asset.create, asset.update]；探查阶段推荐同时装载并并发调用 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 可装载的工具分类（传 categories 展开对应候选工具简表）
- script（剧本工具箱）：读取分集目录、分页读取剧本正文、搜索关键词
- asset（资产工具箱）：查询、新增、修改、删除角色/场景/道具资产，检索与锚定剧本出处
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

# 认知状态
任务标题：尚未命名
最终目标：暂无
当前小目标：暂未设定
当前进度：刚刚开始
当前计划：暂无计划
重点笔记：暂无笔记
```

### [第 1 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）。
- 初次规划：
  [ ] 1. 探查第一集剧本数据与现有资产库现状
  [ ] 2. 定位娜塔莉亚在第一集的出场与相关信息并提取
  [ ] 3. 创建/更新娜塔莉亚的角色资产卡片
  [ ] 4. 全局核验结案
- 当前进度：尚未执行任何工具，需先进入探查阶段。
- 下一步：展开 script 与 asset 分类，了解可用工具，先做只读探查。

思考：现在数据未知，不能贸然装载写入工具。先展开 script 和 asset 两类，看看候选工具简表，再决定装载哪些只读探查工具（目录、搜索、资产列表）。

工具调用：
{{调用 sys.selectContext, {"categories": ["script", "asset"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“收到，我来从第一集里把娜塔莉亚揪出来并落成角色资产。先摸一下剧本和资产库的底，稍等哈。”
- 对用户说的话（简版）：“收到，先探查剧本和资产库，稍等~”
}
```

### [第 1 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
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
## 第 2 轮（耗时：4123 ms (4.12 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 2 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
默认优先使用后台工具读取项目数据；需要演示或核验界面时使用 UI。基于工具返回的事实推进，严禁把未执行视为成功。
进入执行阶段前，必须制定步骤化的“当前计划”，驱动执行阶段连续执行：
1. 探查期安全原则（数据未知时）：制定宏观探查计划，调用 sys.selectContext 仅装载只读探查工具（如 script.directory、script.search、asset.list），严禁提前装载写入工具；
2. 动态重规划原则（获知数据分布后）：当触发数据量预警或上一轮返回了场次分布概览（scenesSummary）时，必须在“当前计划”中将宏观任务细化为按场次/实体的具体子步骤（分步推进：首场建卡、后续场次追加）；切入执行时一次性装载所需的读写工具组（如 script.read, asset.create, asset.update），严禁盲目单步硬吞；
3. 工具装载与流转：结合“当前计划”所需工具，通过 sys.selectContext 展开分类或装载 tools 进入执行阶段；
4. 全局核验与结案：从执行阶段返回后，对照“最终目标”与“当前计划”核验所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。
称用户为“你”，口吻亲和随意；遇需用户决策事项在用户沟通中说明。工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 对照“当前计划”与“工具执行结果”核验推进：
  * 初次规划：列出宏观探查计划（如：[ ] 1. 探查数据现状；[ ] 2. 提取/创建资产；[ ] 3. 全局核验）；
  * 动态重规划：若触发数据量预警或已知场次分布，在此处将旧宏观步骤直接替换输出为细化后的分步子任务列表（标记 [x] 已完成、[ ] 待推进）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）。
- 最终目标与当前计划是否全部达成？若全部达成，准备调用 sys.endTask 结案；若未完成，下一步推进哪个步骤与小目标？
- 为执行当前计划，需要先展开哪些分类（categories），或挑选哪些具体工具（tools）进入执行阶段？
- 是否有关键结论需要沉淀到“重点笔记”？}
思考：
{使用内心独白的方式，围绕全局目标、计划制定与工具准备进行逻辑推演。如果需要展开分类、装载工具进入执行或结束任务，请调用对应工具，系统会自动执行你的操作。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前任务状态、汇报结果或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段。规则：① 需展开新工具分类时，传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合“当前计划”中的各个步骤，从已展开的候选简表中一次性挑选执行该计划所需的具体工具 ID 传 {"tools": [...]} 进入局部执行阶段（装配原则：工具须成组配套，若任务涉及资产提取且需分步追加，须同时装配 [asset.create, asset.update]；探查阶段推荐同时装载并并发调用 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset]）
- script.directory：读取剧本分集与场次目录概览
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（支持场次数组一次性批量读取多场）
- script.search：在剧本指定范围（目标集/场次/行号区间）或全文中搜索关键词并返回匹配段落行（探查期建议与 directory、list 配合并发调用以建立全局视野）
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定剧本出处段落（若出处与版本已齐备推荐一次性全量录入一步到位建卡）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落
- asset.commitProvenance：提交核验通过的资产出处段落锚点

## 其它未展开的工具分类（可传 categories 补充展开）
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

# 认知状态
任务标题：提取娜塔莉亚资产
最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成工具分类展开（script、asset），尚未执行任何数据探查或写入操作
当前计划：[ ] 探查第一集剧本数据与现有资产库现状
[ ] 定位娜塔莉亚在第一集的出场与相关信息并提取
[ ] 创建/更新娜塔莉亚的角色资产卡片
[ ] 全局核验结案
重点笔记：- 已展开 script 与 asset 两类候选工具简表，可从中挑选只读探查工具。
- 尚未获取任何关于第一集剧本与现有资产库的具体信息。
- 策略：先做只读探查，再装载写入工具。

# 工具执行结果
【工具 sys.selectContext 执行成功】已展开工具分类 [script, asset] 的候选工具简表（请从上方候选简表中按需挑选本次执行所需的具体工具 ID 填入 tools，调用 sys.selectContext({"tools": [...]}) 进入局部执行阶段）
```

### [第 2 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应角色资产（如已有则核对补充）。
- 当前计划：
  [ ] 1. 探查第一集剧本数据与现有资产库现状
  [ ] 2. 定位娜塔莉亚在第一集的出场与相关信息并提取
  [ ] 3. 创建/更新娜塔莉亚的角色资产卡片
  [ ] 4. 全局核验结案
- 完成情况：分类已展开，尚未探查数据。下一步推进第 1 步：并发探查第一集目录、搜索“娜塔莉亚”以及检索现有资产库。
- 需装载工具：探查期只读组 script.directory、script.search、asset.list（同时装配读写配套待后续，本轮先探查）。
- 关键结论：仍属数据未知阶段，仅装载只读工具，严守探查期安全原则。

思考：
先要摸清第一集有哪些场次、娜塔莉亚出现在哪里、资产库里是否已有同名角色。用 directory 拿分集场次概览、search 全文搜“娜塔莉亚”、list 查现有角色资产，三路并发建立全局视野，再据结果细化重规划。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.directory", "script.search", "asset.list"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“我先并行探查一下第一集的分集场次目录、全文搜索‘娜塔莉亚’的出场位置，同时看看资产库里是不是已经有这个角色了，拿到结果后再决定是新建还是补充。”
- 对用户说的话（简版）：“先去扒第一集目录、搜娜塔莉亚出场，顺便查查资产库有没有她～”
}
```

### [第 2 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.directory",
    "script.search",
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
    "script.search",
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
## 第 3 轮（耗时：3912 ms (3.91 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (5)：`sys.selectContext, script.directory, script.search, asset.list, user.ask`

### [第 3 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定并持续存在的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
依据【认知状态 -> 当前计划】连续调用工具推进执行，严禁无依据猜测或把未执行视为成功。
1. 真实依据与出处正向单一判准（严格防误判）：
   - 调用工具必须基于上下文中的真实事实与原文段落，严禁凭空编造；
   - 提取角色出处（provenances）时，所选段落必须是该角色在画面中实质出场、动作或发话的客观段落；
   - 严禁将他人的台词/动作、纯画外音（vo）或纯心理活动（OS）作为该角色的出处段落（非出场的背景信息统一归入 description，不得录入 provenances）。
2. 随读随写增量闭环（严禁全读完再单次囤积写入）：
   - 执行多场次任务时遵循“处理一批、落地一批”：读完首场立即调用 asset.create 落地资产；后续场次读完核验后立即调用 asset.update(mode: "append") 或 asset.commitProvenance(mode: "append") 追加出处与补充设定。
   - 若单次 script.read 同时返回了多个子场次，当轮写入时在 provenances 数组中一次性并列提交各场次段落，无需拆成多轮重复读取。
3. 参数扁平化与多版本规范：
   - asset.update 支持在顶层直接传参（无需嵌套 updates 对象）；向已有资产追加新版本时直接传入 versions 数组（各版本仅录入属于该版本的特有出处，严禁将全量出处复制给子版本）；落盘返回即代表写入完成，无需冗余调用 asset.list 回查。
4. 连续推进与工具流转：
   - 当前步骤完成后紧接着推进“当前计划”中的下一个未完成步骤（[ ]）；
   - 所需工具已在【当前可直接调用】列表中，直接连续调用，无需频繁退回全局计划阶段；
   - 若需补充工具可从候选简表中调 sys.selectContext({"tools": [...]}) 补充装载；所有计划全部完成后无参调用 sys.selectContext 返回全局计划阶段结案。
称用户为“你”，口吻亲和随意；工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前步骤是否已经完成？“当前计划”中还有哪些后续步骤待推进？
- 本轮在“工具执行结果”中发现了哪些对后续步骤有用的关键事实、ID 或原文线索？（整理列出以便沉淀到“重点笔记”）
- 当前计划各步骤状态（[x] / [ ]）与当前进度需要更新为什么？
- 下一步行动判断：若计划未完成且工具已装载，下一步调用哪个工具继续推进？若需补充工具或计划全部完成，准备调用 sys.selectContext。}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演，核对参数依据是否完整就绪，确定本轮要调用的工具与具体参数。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前执行进展或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：补充装载工具或退出局部执行返回全局计划阶段（当前计划的后续步骤如需补充装载工具，可传 {"tools": [...]} 增量合并装载，已装载工具会自动保留；当“当前计划”中的所有步骤均已执行完毕后，直接无参调用 {{调用 sys.selectContext}} 返回全局计划与验收阶段）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- script.directory：分页读取剧本分集与场次目录概览（集号可能跳号或重复，总集数按实际条目统计；可传 query 按标题/场次/角色筛选，返回各集与各场次的起止行号及段落数 paragraphCount）。
  参数：{ query?: string, offset?: number, limit?: number }
- script.search：在剧本中搜索关键词并返回匹配行号与段落内容（可传 episode 如 "第一集"/1、scene 如 "1-5" 或 startLine/endLine 限定搜索范围；未传范围时默认搜索全文；探查期建议优先调用，以快速确认目标实体的出场场次分布与出场密度）。
  参数：{ query: string, episode?: string | number, scene?: string, startLine?: number, endLine?: number, limit?: number }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }

## 候选工具简表（后续步骤如需使用，可调 sys.selectContext 补充装载）
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（支持场次数组一次性批量读取多场）
- asset.create：新增角色、场景或道具资产并绑定剧本出处段落（若出处与版本已齐备推荐一次性全量录入一步到位建卡）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落
- asset.commitProvenance：提交核验通过的资产出处段落锚点

# 认知状态
任务标题：提取娜塔莉亚资产
最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
当前小目标：并发探查第一集剧本目录、全文搜索“娜塔莉亚”及检索现有资产库
当前进度：已完成工具装载（script.directory、script.search、asset.list），尚未执行任何数据探查或写入操作；下一轮将并发调用上述只读工具。
当前计划：[ ] 探查第一集剧本数据与现有资产库现状
[ ] 定位娜塔莉亚在第一集的出场与相关信息并提取
[ ] 创建/更新娜塔莉亚的角色资产卡片
[ ] 全局核验结案
重点笔记：- 已装载只读探查工具：script.directory（分集场次概览）、script.search（全文搜索“娜塔莉亚”）、asset.list（查询现有角色资产）。
- 尚未获取任何关于第一集剧本与现有资产库的具体信息。
- 策略：先并发只读探查建立全局视野，再据结果细化重规划；写入工具待探查后装配，严守探查期安全原则。

# 工具执行结果
【工具 sys.selectContext 执行成功】已进入局部执行阶段，当前已装载工具：script.directory, script.search, asset.list
```

### [第 3 轮] 模型原始输出
```text
状态检查：
- 当前正在执行计划第 1 步“探查第一集剧本数据与现有资产库现状”，对应小目标为并发探查第一集目录、全文搜索“娜塔莉亚”、检索现有资产库。
- 本轮仅完成工具装载（script.directory、script.search、asset.list 已可用），尚未实际执行任何探查，故第 1 步未完成。
- 后续步骤：定位娜塔莉亚出场并提取、创建/更新角色资产卡片、全局核验结案，均待推进。
- 本轮关键事实：三个只读探查工具已装载，无剧本或资产具体数据。
- 计划状态：[ ] 探查（进行中）、[ ] 定位提取、[ ] 建卡/更新、[ ] 结案。
- 下一步：并发调用 script.directory、script.search、asset.list 获取第一集剧本与现有资产信息。

思考：
现在工具都齐了，直接三路并发探一探：先 script.directory 看第一集场次结构，同时 script.search 搜“娜塔莉亚”确认出场分布，再用 asset.list 查资产库是否已有该角色，避免重复建卡。三个都是只读，安全。

工具调用：
{{调用 script.directory, {"query": "第一集"}}}
{{调用 script.search, {"query": "娜塔莉亚", "episode": "第一集"}}}
{{调用 asset.list, {"type": "characters", "query": "娜塔莉亚"}}}

用户沟通：
{
- 对用户说的话（完整版）：“我先并行查看第一集的场次目录、全文搜索‘娜塔莉亚’的出场位置，同时确认资产库里是否已经有这个角色，避免重复建卡。等结果回来我再继续提取。”
- 对用户说的话（简版）：“正在并行探查第一集剧本和现有娜塔莉亚资产，稍等～”
}
```

### [第 3 轮] 工具调用记录（共 3 个）
#### 🛠️ 工具 1：`script.directory` (succeeded)
**工具输入 (Input)**：
```json
{
  "query": "第一集"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793757827394",
  "source": "project",
  "total": 1,
  "offset": 0,
  "entries": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 6,
      "paragraphCount": 66,
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
          "paragraphCount": 2
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
          "paragraphCount": 6
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
          "paragraphCount": 9
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
          "paragraphCount": 7
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
          "paragraphCount": 10
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
          "paragraphCount": 32
        }
      ]
    }
  ],
  "nextOffset": null,
  "totalScenes": 6,
  "totalParagraphs": 66,
  "scenesSummary": [
    "1-1 夜 内 地下室 (2段)",
    "1-2 日 内 医院办公室 (6段)",
    "1-3 日 外 贫民窟门口 (9段)",
    "1-4 日 内 医院办公室 (7段)",
    "1-5 日 内 娜塔莉亚家 (10段)",
    "1-5 日 外 布莱克伍德庄园 (32段)"
  ],
  "hasVolumeWarning": true,
  "notice": "我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "warning": "我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "autoReturnedToLevel0": true
}
```
#### 🛠️ 工具 2：`script.search` (succeeded)
**工具输入 (Input)**：
```json
{
  "query": "娜塔莉亚",
  "episode": "第一集"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793757827394",
  "source": "project",
  "scope": {
    "episode": "第一集"
  },
  "total": 34,
  "hasVolumeWarning": true,
  "warning": "我发现检索到 34 条匹配，跨越 5 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "scenesSummary": [
    {
      "sceneId": "scene-8-151",
      "sceneNumber": "1-2",
      "sceneTitle": "1-2 日 内 医院办公室",
      "matchCount": 4,
      "matchIndices": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "sceneId": "scene-17-679",
      "sceneNumber": "1-3",
      "sceneTitle": "1-3 日 外 贫民窟门口",
      "matchCount": 5,
      "matchIndices": [
        5,
        6,
        7,
        8,
        9
      ]
    },
    {
      "sceneId": "scene-28-1373",
      "sceneNumber": "1-4",
      "sceneTitle": "1-4 日 内 医院办公室",
      "matchCount": 5,
      "matchIndices": [
        10,
        11,
        12,
        13,
        14
      ]
    },
    {
      "sceneId": "scene-39-1953",
      "sceneNumber": "1-5",
      "sceneTitle": "1-5 日 内 娜塔莉亚家",
      "matchCount": 7,
      "matchIndices": [
        15,
        16,
        17,
        18,
        19,
        20,
        21
      ]
    },
    {
      "sceneId": "scene-52-2776",
      "sceneNumber": "1-5",
      "sceneTitle": "1-5 日 外 布莱克伍德庄园",
      "matchCount": 13,
      "matchIndices": [
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34
      ]
    }
  ],
  "matches": [
    {
      "index": 1,
      "snippet": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]",
      "paragraphIndex": 2,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 2,
      "snippet": "玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）",
      "paragraphIndex": 3,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 3,
      "snippet": "▲娜塔莉亚死死握着书信，眼泪落在照片上。",
      "paragraphIndex": 4,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 4,
      "snippet": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
      "paragraphIndex": 5,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 5,
      "snippet": "▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。",
      "paragraphIndex": 1,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 6,
      "snippet": "▲小玛莉一把将小娜塔莉亚推向了养父。",
      "paragraphIndex": 3,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 7,
      "snippet": "▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。",
      "paragraphIndex": 6,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 8,
      "snippet": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
      "paragraphIndex": 7,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 9,
      "snippet": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
      "paragraphIndex": 8,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 10,
      "snippet": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。",
      "paragraphIndex": 1,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 11,
      "snippet": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
      "paragraphIndex": 2,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 12,
      "snippet": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。",
      "paragraphIndex": 3,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 13,
      "snippet": "▲娜塔莉亚死死盯着那段小字。",
      "paragraphIndex": 6,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 14,
      "snippet": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
      "paragraphIndex": 7,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 15,
      "snippet": "焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Fa",
      "paragraphIndex": 2,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 16,
      "snippet": "▲娜塔莉亚握住了焦恩的手，坚定开口。",
      "paragraphIndex": 3,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 17,
      "snippet": "娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)",
      "paragraphIndex": 4,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 18,
      "snippet": "▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。",
      "paragraphIndex": 5,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 19,
      "snippet": "▲娜塔莉亚拿着文件准备起身。",
      "paragraphIndex": 7,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 20,
      "snippet": "▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。",
      "paragraphIndex": 8,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 21,
      "snippet": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)",
      "paragraphIndex": 9,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 22,
      "snippet": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]",
      "paragraphIndex": 2,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 23,
      "snippet": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")",
      "paragraphIndex": 3,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 24,
      "snippet": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)",
      "paragraphIndex": 5,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 25,
      "snippet": "▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。",
      "paragraphIndex": 18,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 26,
      "snippet": "娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）",
      "paragraphIndex": 19,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 27,
      "snippet": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。",
      "paragraphIndex": 20,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 28,
      "snippet": "娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）",
      "paragraphIndex": 22,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 29,
      "snippet": "▲布拉姆打量着娜塔莉亚。",
      "paragraphIndex": 23,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 30,
      "snippet": "▲娜塔莉亚缓缓抬头。",
      "paragraphIndex": 25,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 31,
      "snippet": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）",
      "paragraphIndex": 26,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 32,
      "snippet": "▲娜塔莉亚紧张地握紧了简历。",
      "paragraphIndex": 27,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 33,
      "snippet": "娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）",
      "paragraphIndex": 28,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 34,
      "snippet": "娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）",
      "paragraphIndex": 30,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    }
  ]
}
```
#### 🛠️ 工具 3：`asset.list` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "characters",
  "query": "娜塔莉亚"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793757827394",
  "source": "project",
  "type": "characters",
  "total": 0,
  "offset": 0,
  "items": [],
  "nextOffset": null
}
```

---
## 第 4 轮（耗时：6913 ms (6.91 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 4 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
默认优先使用后台工具读取项目数据；需要演示或核验界面时使用 UI。基于工具返回的事实推进，严禁把未执行视为成功。
进入执行阶段前，必须制定步骤化的“当前计划”，驱动执行阶段连续执行：
1. 探查期安全原则（数据未知时）：制定宏观探查计划，调用 sys.selectContext 仅装载只读探查工具（如 script.directory、script.search、asset.list），严禁提前装载写入工具；
2. 动态重规划原则（获知数据分布后）：当触发数据量预警或上一轮返回了场次分布概览（scenesSummary）时，必须在“当前计划”中将宏观任务细化为按场次/实体的具体子步骤（分步推进：首场建卡、后续场次追加）；切入执行时一次性装载所需的读写工具组（如 script.read, asset.create, asset.update），严禁盲目单步硬吞；
3. 工具装载与流转：结合“当前计划”所需工具，通过 sys.selectContext 展开分类或装载 tools 进入执行阶段；
4. 全局核验与结案：从执行阶段返回后，对照“最终目标”与“当前计划”核验所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。
称用户为“你”，口吻亲和随意；遇需用户决策事项在用户沟通中说明。工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 对照“当前计划”与“工具执行结果”核验推进：
  * 初次规划：列出宏观探查计划（如：[ ] 1. 探查数据现状；[ ] 2. 提取/创建资产；[ ] 3. 全局核验）；
  * 动态重规划：若触发数据量预警或已知场次分布，在此处将旧宏观步骤直接替换输出为细化后的分步子任务列表（标记 [x] 已完成、[ ] 待推进）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）。
- 最终目标与当前计划是否全部达成？若全部达成，准备调用 sys.endTask 结案；若未完成，下一步推进哪个步骤与小目标？
- 为执行当前计划，需要先展开哪些分类（categories），或挑选哪些具体工具（tools）进入执行阶段？
- 是否有关键结论需要沉淀到“重点笔记”？}
思考：
{使用内心独白的方式，围绕全局目标、计划制定与工具准备进行逻辑推演。如果需要展开分类、装载工具进入执行或结束任务，请调用对应工具，系统会自动执行你的操作。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前任务状态、汇报结果或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段。规则：① 需展开新工具分类时，传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合“当前计划”中的各个步骤，从已展开的候选简表中一次性挑选执行该计划所需的具体工具 ID 传 {"tools": [...]} 进入局部执行阶段（装配原则：工具须成组配套，若任务涉及资产提取且需分步追加，须同时装配 [asset.create, asset.update]；探查阶段推荐同时装载并并发调用 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset]）
- script.directory：读取剧本分集与场次目录概览
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（支持场次数组一次性批量读取多场）
- script.search：在剧本指定范围（目标集/场次/行号区间）或全文中搜索关键词并返回匹配段落行（探查期建议与 directory、list 配合并发调用以建立全局视野）
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定剧本出处段落（若出处与版本已齐备推荐一次性全量录入一步到位建卡）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落
- asset.commitProvenance：提交核验通过的资产出处段落锚点

## 其它未展开的工具分类（可传 categories 补充展开）
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

# 认知状态
任务标题：提取娜塔莉亚资产
最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
当前小目标：根据三路探查结果定位娜塔莉亚在第一集的场次出场与相关信息并进行提取
当前进度：已完成工具装载并成功执行三路只读探查（第一集场次目录、全文搜索“娜塔莉亚”、资产库角色检索）；现进入基于探查结果定位与提取娜塔莉亚出场信息阶段。
当前计划：[x] 探查第一集剧本数据与现有资产库现状
[ ] 定位娜塔莉亚在第一集的出场与相关信息并提取
[ ] 创建/更新娜塔莉亚的角色资产卡片
[ ] 全局核验结案
重点笔记：- 已装载并成功执行只读探查工具：script.directory（第一集场次概览）、script.search（全文搜索“娜塔莉亚”）、asset.list（查询现有角色资产），三路均返回 succeeded。
- 探查结果的具体内容尚待从工具返回中读取整理；尚未获取娜塔莉亚出场分布与现有资产详情。
- 策略：基于探查结果细化场次定位与信息提取，确认是否需建卡或补充；写入工具待提取结果出来后装配，严守探查期安全原则。

# 工具执行结果
💡【数据量提醒 · 已处于 0 级全局阶段】我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。

【工具 script.directory 执行成功】（共 1 个集数条目 | 场次总计: 6 | 段落总计: 66 | 场次分布: 1-1 夜 内 地下室 (2段)、1-2 日 内 医院办公室 (6段)、1-3 日 外 贫民窟门口 (9段)、1-4 日 内 医院办公室 (7段)、1-5 日 内 娜塔莉亚家 (10段)、1-5 日 外 布莱克伍德庄园 (32段)）
{"projectId":"proj_1793757827394","source":"project","total":1,"offset":0,"entries":[{"index":1,"id":"episode-1","number":"一","title":"第一集","sceneCount":6,"paragraphCount":66,"scenes":[{"index":1,"id":"scene-2-4","sceneNumber":"1-1","title":"1-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["玛莉"],"paragraphCount":2},{"index":2,"id":"scene-8-151","sceneNumber":"1-2","title":"1-2 日 内 医院办公室","type":"INT","timeOfDay":"日","locationName":"医院办公室","characterNames":["娜塔莉亚"],"paragraphCount":6},{"index":3,"id":"scene-17-679","sceneNumber":"1-3","title":"1-3 日 外 贫民窟门口","type":"EXT","timeOfDay":"日","locationName":"贫民窟门口","characterNames":["小娜塔莉亚（8岁）","小玛莉（姐姐 13岁）","养父","养母"],"paragraphCount":9},{"index":4,"id":"scene-28-1373","sceneNumber":"1-4","title":"1-4 日 内 医院办公室","type":"INT","timeOfDay":"日","locationName":"医院办公室","characterNames":["娜塔莉亚"],"paragraphCount":7},{"index":5,"id":"scene-39-1953","sceneNumber":"1-5","title":"1-5 日 内 娜塔莉亚家","type":"INT","timeOfDay":"日","locationName":"娜塔莉亚家","characterNames":["娜塔莉亚","焦恩"],"paragraphCount":10},{"index":6,"id":"scene-52-2776","sceneNumber":"1-5","title":"1-5 日 外 布莱克伍德庄园","type":"EXT","timeOfDay":"日","locationName":"布莱克伍德庄园","characterNames":["娜塔莉亚","布拉姆","女佣若干","管家","塞莱特斯"],"paragraphCount":32}]}],"totalScenes":6,"totalParagraphs":66,"scenesSummary":["1-1 夜 内 地下室 (2段)","1-2 日 内 医院办公室 (6段)","1-3 日 外 贫民窟门口 (9段)","1-4 日 内 医院办公室 (7段)","1-5 日 内 娜塔莉亚家 (10段)","1-5 日 外 布莱克伍德庄园 (32段)"],"hasVolumeWarning":true,"notice":"我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。","warning":"我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。","autoReturnedToLevel0":true}

💡【数据量提醒】我发现检索到 34 条匹配，跨越 5 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。

【工具 script.search 执行成功】（匹配结果数: 34）
{"projectId":"proj_1793757827394","source":"project","scope":{"episode":"第一集"},"total":34,"hasVolumeWarning":true,"warning":"我发现检索到 34 条匹配，跨越 5 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。","scenesSummary":[{"sceneId":"scene-8-151","sceneNumber":"1-2","sceneTitle":"1-2 日 内 医院办公室","matchCount":4,"matchIndices":[1,2,3,4]},{"sceneId":"scene-17-679","sceneNumber":"1-3","sceneTitle":"1-3 日 外 贫民窟门口","matchCount":5,"matchIndices":[5,6,7,8,9]},{"sceneId":"scene-28-1373","sceneNumber":"1-4","sceneTitle":"1-4 日 内 医院办公室","matchCount":5,"matchIndices":[10,11,12,13,14]},{"sceneId":"scene-39-1953","sceneNumber":"1-5","sceneTitle":"1-5 日 内 娜塔莉亚家","matchCount":7,"matchIndices":[15,16,17,18,19,20,21]},{"sceneId":"scene-52-2776","sceneNumber":"1-5","sceneTitle":"1-5 日 外 布莱克伍德庄园","matchCount":13,"matchIndices":[22,23,24,25,26,27,28,29,30,31,32,33,34]}],"matches":[{"index":1,"snippet":"▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]","paragraphIndex":2,"sceneTitle":"1-2 日 内 医院办公室"},{"index":2,"snippet":"玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）","paragraphIndex":3,"sceneTitle":"1-2 日 内 医院办公室"},{"index":3,"snippet":"▲娜塔莉亚死死握着书信，眼泪落在照片上。","paragraphIndex":4,"sceneTitle":"1-2 日 内 医院办公室"},{"index":4,"snippet":"娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）","paragraphIndex":5,"sceneTitle":"1-2 日 内 医院办公室"},{"index":5,"snippet":"▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。","paragraphIndex":1,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":6,"snippet":"▲小玛莉一把将小娜塔莉亚推向了养父。","paragraphIndex":3,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":7,"snippet":"▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。","paragraphIndex":6,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":8,"snippet":"娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）","paragraphIndex":7,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":9,"snippet":"▲小玛莉身影模糊，小娜塔莉亚落泪。","paragraphIndex":8,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":10,"snippet":"▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。","paragraphIndex":1,"sceneTitle":"1-4 日 内 医院办公室"},{"index":11,"snippet":"娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）","paragraphIndex":2,"sceneTitle":"1-4 日 内 医院办公室"},{"index":12,"snippet":"▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。","paragraphIndex":3,"sceneTitle":"1-4 日 内 医院办公室"},{"index":13,"snippet":"▲娜塔莉亚死死盯着那段小字。","paragraphIndex":6,"sceneTitle":"1-4 日 内 医院办公室"},{"index":14,"snippet":"娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)","paragraphIndex":7,"sceneTitle":"1-4 日 内 医院办公室"},{"index":15,"snippet":"焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Fa","paragraphIndex":2,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":16,"snippet":"▲娜塔莉亚握住了焦恩的手，坚定开口。","paragraphIndex":3,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":17,"snippet":"娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)","paragraphIndex":4,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":18,"snippet":"▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。","paragraphIndex":5,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":19,"snippet":"▲娜塔莉亚拿着文件准备起身。","paragraphIndex":7,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":20,"snippet":"▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。","paragraphIndex":8,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":21,"snippet":"娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)","paragraphIndex":9,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":22,"snippet":"▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]","paragraphIndex":2,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":23,"snippet":"娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")","paragraphIndex":3,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":24,"snippet":"娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)","paragraphIndex":5,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":25,"snippet":"▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。","paragraphIndex":18,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":26,"snippet":"娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）","paragraphIndex":19,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":27,"snippet":"▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。","paragraphIndex":20,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":28,"snippet":"娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）","paragraphIndex":22,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":29,"snippet":"▲布拉姆打量着娜塔莉亚。","paragraphIndex":23,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":30,"snippet":"▲娜塔莉亚缓缓抬头。","paragraphIndex":25,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":31,"snippet":"布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）","paragraphIndex":26,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":32,"snippet":"▲娜塔莉亚紧张地握紧了简历。","paragraphIndex":27,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":33,"snippet":"娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）","paragraphIndex":28,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":34,"snippet":"娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）","paragraphIndex":30,"sceneTitle":"1-5 日 外 布莱克伍德庄园"}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1793757827394","source":"project","type":"characters","total":0,"offset":0}
```

### [第 4 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成/核对对应的角色资产
- 当前计划（动态重规划，因触发数据量预警与场次分布返回，细化为分场推进）：
  - [x] 1. 探查第一集场次目录、全文搜索“娜塔莉亚”、查询现有角色资产（已完成，结果已返回）
  - [x] 2. 定位娜塔莉亚在第一集的出场场次：1-2、1-3（小娜塔莉亚8岁）、1-4、1-5内（娜塔莉亚家）、1-5外（布莱克伍德庄园）——共5场，已有充足snippet足以归纳角色画像
  - [x] 3. 确认资产库现状：现有角色资产 total=0，需新建娜塔莉亚资产卡
  - [ ] 4. 基于第一集信息归纳娜塔莉亚角色资产属性与造型版本，创建资产卡并绑定出处段落
  - [ ] 5. 全局核验结案
- 是否全部达成：未完成。下一步推进第4步——创建娜塔莉亚角色资产卡（含两个造型版本：成年心理医生22岁 / 童年8岁），并绑定第一集相关出处段落。
- 需装载工具：asset.create（新建角色资产并绑定出处）——探查已完成，可进入写入阶段。
- 关键结论沉淀：娜塔莉亚22岁心理医生，姐姐玛莉遗书托孤；养父焦恩；潜伏布莱克伍德庄园寻姐救孤女；黑框眼镜职业装为潜入造型；8岁贫民窟童年形象为闪回造型。资产库当前为空需新建。

思考：
探查三路均已完成：目录显示第一集6场，其中5场涉及娜塔莉亚（1-2、1-3童年、1-4、1-5家、1-5庄园）；搜索34条匹配snippet信息足够归纳角色设定与造型；资产库角色为0，确认需新建。现在进入写入阶段，装载 asset.create 组套（含返回校验所需的 asset.list 可后续再读）。因需一步建卡并绑定多场出处，我先装载 asset.create，创建时一次性写入角色基础属性、两个年龄造型版本的核心描述与第一集出处段落。这里注意 create 支持绑定出处段落，符合"一步到位建卡"的策略。

工具调用：
{{调用 sys.selectContext, {"tools": ["asset.create", "asset.list"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“第一集里娜塔莉亚出现在 1-2、1-4、1-5（娜塔莉亚家）、1-5（布莱克伍德庄园）四场成年戏，加上 1-3 的童年闪回，合计 5 场。资产库里目前还没有她的角色卡，我这就按‘22岁心理医生’和‘8岁童年’两个造型版本新建一张卡片，并把第一集相关段落作为出处绑定上去。”
- 对用户说的话（简版）：“娜塔莉亚在5场出场，库里还没她，我这就新建卡。”
}
```

### [第 4 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "asset.create",
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
    "asset.create",
    "asset.list"
  ],
  "prompts": [
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
## 第 5 轮（耗时：9441 ms (9.44 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, asset.list, asset.create, user.ask`

### [第 5 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定并持续存在的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
依据【认知状态 -> 当前计划】连续调用工具推进执行，严禁无依据猜测或把未执行视为成功。
1. 真实依据与出处正向单一判准（严格防误判）：
   - 调用工具必须基于上下文中的真实事实与原文段落，严禁凭空编造；
   - 提取角色出处（provenances）时，所选段落必须是该角色在画面中实质出场、动作或发话的客观段落；
   - 严禁将他人的台词/动作、纯画外音（vo）或纯心理活动（OS）作为该角色的出处段落（非出场的背景信息统一归入 description，不得录入 provenances）。
2. 随读随写增量闭环（严禁全读完再单次囤积写入）：
   - 执行多场次任务时遵循“处理一批、落地一批”：读完首场立即调用 asset.create 落地资产；后续场次读完核验后立即调用 asset.update(mode: "append") 或 asset.commitProvenance(mode: "append") 追加出处与补充设定。
   - 若单次 script.read 同时返回了多个子场次，当轮写入时在 provenances 数组中一次性并列提交各场次段落，无需拆成多轮重复读取。
3. 参数扁平化与多版本规范：
   - asset.update 支持在顶层直接传参（无需嵌套 updates 对象）；向已有资产追加新版本时直接传入 versions 数组（各版本仅录入属于该版本的特有出处，严禁将全量出处复制给子版本）；落盘返回即代表写入完成，无需冗余调用 asset.list 回查。
4. 连续推进与工具流转：
   - 当前步骤完成后紧接着推进“当前计划”中的下一个未完成步骤（[ ]）；
   - 所需工具已在【当前可直接调用】列表中，直接连续调用，无需频繁退回全局计划阶段；
   - 若需补充工具可从候选简表中调 sys.selectContext({"tools": [...]}) 补充装载；所有计划全部完成后无参调用 sys.selectContext 返回全局计划阶段结案。
称用户为“你”，口吻亲和随意；工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前步骤是否已经完成？“当前计划”中还有哪些后续步骤待推进？
- 本轮在“工具执行结果”中发现了哪些对后续步骤有用的关键事实、ID 或原文线索？（整理列出以便沉淀到“重点笔记”）
- 当前计划各步骤状态（[x] / [ ]）与当前进度需要更新为什么？
- 下一步行动判断：若计划未完成且工具已装载，下一步调用哪个工具继续推进？若需补充工具或计划全部完成，准备调用 sys.selectContext。}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演，核对参数依据是否完整就绪，确定本轮要调用的工具与具体参数。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前执行进展或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：补充装载工具或退出局部执行返回全局计划阶段（当前计划的后续步骤如需补充装载工具，可传 {"tools": [...]} 增量合并装载，已装载工具会自动保留；当“当前计划”中的所有步骤均已执行完毕后，直接无参调用 {{调用 sys.selectContext}} 返回全局计划与验收阶段）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 最佳实践：若已通过批量读取掌握了全部出处段落与多版本特征，推荐在 versions 与 provenances 中一次性全部传入一步到位建卡（无需后续多轮 update 碎步追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属及防混淆辨识特征（未在画面中呈现、仅被提及的背景信息归入 description）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions，无需向用户提问是否单独建角色；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），必须在 versions 数组中同时传入初始版本与所有变体版本（确保 versions 数组长度至少为 2，且每个版本分别绑定各自造型的 provenances 与 aliases），或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处锚点）判定规则：根据段落内容，如果资产可能在画面中呈现出来，即判定该段落为出处（直接传入对应场次 sceneTitle 与段落序号 paragraphIndices: [1, 2, 3] 或 paragraphIndex: 1，系统会自动映射行号与原文，无需重复手填 evidenceText）。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表（后续步骤如需使用，可调 sys.selectContext 补充装载）
- script.directory：读取剧本分集与场次目录概览
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（支持场次数组一次性批量读取多场）
- script.search：在剧本指定范围（目标集/场次/行号区间）或全文中搜索关键词并返回匹配段落行（探查期建议与 directory、list 配合并发调用以建立全局视野）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落
- asset.commitProvenance：提交核验通过的资产出处段落锚点

# 认知状态
任务标题：提取娜塔莉亚资产
最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
当前小目标：创建娜塔莉亚角色资产卡（含22岁心理医生与8岁童年两个造型版本），并绑定第一集相关出处段落
当前进度：已完成三路只读探查并确认出场分布与资产库为空；已装载 asset.create/asset.list 进入写入阶段，正推进创建娜塔莉亚角色资产卡并绑定第一集出处段落。
当前计划：[x] 探查第一集场次目录、全文搜索“娜塔莉亚”、查询现有角色资产
[x] 定位娜塔莉亚在第一集的出场场次并归纳角色画像（1-2、1-3童年、1-4、1-5家、1-5庄园）
[x] 确认资产库现状（total=0，需新建娜塔莉亚资产卡）
[ ] 创建娜塔莉亚角色资产卡（22岁心理医生/8岁童年两个造型版本）并绑定第一集出处段落
[ ] 全局核验结案
重点笔记：- 娜塔莉亚：22岁心理医生；姐姐玛莉遗书托孤；养父焦恩；为寻姐救孤女潜伏布莱克伍德庄园；黑框眼镜职业装为潜入造型；8岁贫民窟童年形象为闪回造型。第一集出场共5场：1-2、1-4、1-5（娜塔莉亚家）、1-5（布莱克伍德庄园）成年戏，1-3童年闪回。搜索共34条匹配snippet信息足以归纳角色设定与造型。资产库现有角色 total=0，需新建资产卡。策略：用 asset.create 一步建卡并绑定多场出处段落，创建后可用 asset.list 校验。

# 工具执行结果
💡【数据量提醒 · 已处于 0 级全局阶段】我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。

【工具 script.directory 执行成功】（共 1 个集数条目 | 场次总计: 6 | 段落总计: 66 | 场次分布: 1-1 夜 内 地下室 (2段)、1-2 日 内 医院办公室 (6段)、1-3 日 外 贫民窟门口 (9段)、1-4 日 内 医院办公室 (7段)、1-5 日 内 娜塔莉亚家 (10段)、1-5 日 外 布莱克伍德庄园 (32段)）
{"projectId":"proj_1793757827394","source":"project","total":1,"offset":0,"entries":[{"index":1,"id":"episode-1","number":"一","title":"第一集","sceneCount":6,"paragraphCount":66,"scenes":[{"index":1,"id":"scene-2-4","sceneNumber":"1-1","title":"1-1 夜 内 地下室","type":"INT","timeOfDay":"夜","locationName":"地下室","characterNames":["玛莉"],"paragraphCount":2},{"index":2,"id":"scene-8-151","sceneNumber":"1-2","title":"1-2 日 内 医院办公室","type":"INT","timeOfDay":"日","locationName":"医院办公室","characterNames":["娜塔莉亚"],"paragraphCount":6},{"index":3,"id":"scene-17-679","sceneNumber":"1-3","title":"1-3 日 外 贫民窟门口","type":"EXT","timeOfDay":"日","locationName":"贫民窟门口","characterNames":["小娜塔莉亚（8岁）","小玛莉（姐姐 13岁）","养父","养母"],"paragraphCount":9},{"index":4,"id":"scene-28-1373","sceneNumber":"1-4","title":"1-4 日 内 医院办公室","type":"INT","timeOfDay":"日","locationName":"医院办公室","characterNames":["娜塔莉亚"],"paragraphCount":7},{"index":5,"id":"scene-39-1953","sceneNumber":"1-5","title":"1-5 日 内 娜塔莉亚家","type":"INT","timeOfDay":"日","locationName":"娜塔莉亚家","characterNames":["娜塔莉亚","焦恩"],"paragraphCount":10},{"index":6,"id":"scene-52-2776","sceneNumber":"1-5","title":"1-5 日 外 布莱克伍德庄园","type":"EXT","timeOfDay":"日","locationName":"布莱克伍德庄园","characterNames":["娜塔莉亚","布拉姆","女佣若干","管家","塞莱特斯"],"paragraphCount":32}]}],"totalScenes":6,"totalParagraphs":66,"scenesSummary":["1-1 夜 内 地下室 (2段)","1-2 日 内 医院办公室 (6段)","1-3 日 外 贫民窟门口 (9段)","1-4 日 内 医院办公室 (7段)","1-5 日 内 娜塔莉亚家 (10段)","1-5 日 外 布莱克伍德庄园 (32段)"],"hasVolumeWarning":true,"notice":"我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。","warning":"我发现当前剧集目录包含 6 个场次共 66 个段落，内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。","autoReturnedToLevel0":true}

💡【数据量提醒】我发现检索到 34 条匹配，跨越 5 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。

【工具 script.search 执行成功】（匹配结果数: 34）
{"projectId":"proj_1793757827394","source":"project","scope":{"episode":"第一集"},"total":34,"hasVolumeWarning":true,"warning":"我发现检索到 34 条匹配，跨越 5 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。","scenesSummary":[{"sceneId":"scene-8-151","sceneNumber":"1-2","sceneTitle":"1-2 日 内 医院办公室","matchCount":4,"matchIndices":[1,2,3,4]},{"sceneId":"scene-17-679","sceneNumber":"1-3","sceneTitle":"1-3 日 外 贫民窟门口","matchCount":5,"matchIndices":[5,6,7,8,9]},{"sceneId":"scene-28-1373","sceneNumber":"1-4","sceneTitle":"1-4 日 内 医院办公室","matchCount":5,"matchIndices":[10,11,12,13,14]},{"sceneId":"scene-39-1953","sceneNumber":"1-5","sceneTitle":"1-5 日 内 娜塔莉亚家","matchCount":7,"matchIndices":[15,16,17,18,19,20,21]},{"sceneId":"scene-52-2776","sceneNumber":"1-5","sceneTitle":"1-5 日 外 布莱克伍德庄园","matchCount":13,"matchIndices":[22,23,24,25,26,27,28,29,30,31,32,33,34]}],"matches":[{"index":1,"snippet":"▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]","paragraphIndex":2,"sceneTitle":"1-2 日 内 医院办公室"},{"index":2,"snippet":"玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）","paragraphIndex":3,"sceneTitle":"1-2 日 内 医院办公室"},{"index":3,"snippet":"▲娜塔莉亚死死握着书信，眼泪落在照片上。","paragraphIndex":4,"sceneTitle":"1-2 日 内 医院办公室"},{"index":4,"snippet":"娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）","paragraphIndex":5,"sceneTitle":"1-2 日 内 医院办公室"},{"index":5,"snippet":"▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。","paragraphIndex":1,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":6,"snippet":"▲小玛莉一把将小娜塔莉亚推向了养父。","paragraphIndex":3,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":7,"snippet":"▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。","paragraphIndex":6,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":8,"snippet":"娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）","paragraphIndex":7,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":9,"snippet":"▲小玛莉身影模糊，小娜塔莉亚落泪。","paragraphIndex":8,"sceneTitle":"1-3 日 外 贫民窟门口"},{"index":10,"snippet":"▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。","paragraphIndex":1,"sceneTitle":"1-4 日 内 医院办公室"},{"index":11,"snippet":"娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）","paragraphIndex":2,"sceneTitle":"1-4 日 内 医院办公室"},{"index":12,"snippet":"▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。","paragraphIndex":3,"sceneTitle":"1-4 日 内 医院办公室"},{"index":13,"snippet":"▲娜塔莉亚死死盯着那段小字。","paragraphIndex":6,"sceneTitle":"1-4 日 内 医院办公室"},{"index":14,"snippet":"娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)","paragraphIndex":7,"sceneTitle":"1-4 日 内 医院办公室"},{"index":15,"snippet":"焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Fa","paragraphIndex":2,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":16,"snippet":"▲娜塔莉亚握住了焦恩的手，坚定开口。","paragraphIndex":3,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":17,"snippet":"娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)","paragraphIndex":4,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":18,"snippet":"▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。","paragraphIndex":5,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":19,"snippet":"▲娜塔莉亚拿着文件准备起身。","paragraphIndex":7,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":20,"snippet":"▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。","paragraphIndex":8,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":21,"snippet":"娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)","paragraphIndex":9,"sceneTitle":"1-5 日 内 娜塔莉亚家"},{"index":22,"snippet":"▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]","paragraphIndex":2,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":23,"snippet":"娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")","paragraphIndex":3,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":24,"snippet":"娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)","paragraphIndex":5,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":25,"snippet":"▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。","paragraphIndex":18,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":26,"snippet":"娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）","paragraphIndex":19,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":27,"snippet":"▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。","paragraphIndex":20,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":28,"snippet":"娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）","paragraphIndex":22,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":29,"snippet":"▲布拉姆打量着娜塔莉亚。","paragraphIndex":23,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":30,"snippet":"▲娜塔莉亚缓缓抬头。","paragraphIndex":25,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":31,"snippet":"布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）","paragraphIndex":26,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":32,"snippet":"▲娜塔莉亚紧张地握紧了简历。","paragraphIndex":27,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":33,"snippet":"娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）","paragraphIndex":28,"sceneTitle":"1-5 日 外 布莱克伍德庄园"},{"index":34,"snippet":"娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）","paragraphIndex":30,"sceneTitle":"1-5 日 外 布莱克伍德庄园"}]}

【工具 asset.list 执行成功】
{"projectId":"proj_1793757827394","source":"project","type":"characters","total":0,"offset":0}

【工具 sys.selectContext 执行成功】已进入局部执行阶段，当前已装载工具：asset.create, asset.list
```

### [第 5 轮] 模型原始输出
```text
状态检查：
- 当前执行步骤：「创建娜塔莉亚角色资产卡（22岁心理医生/8岁童年两个造型版本）并绑定第一集出处段落」。
- 本轮工具返回：script.directory 拿到第一集 6 场次目录（1-2、1-3、1-4、1-5家、1-5庄园均涉及娜塔莉亚）；script.search 返回 34 条匹配、跨 5 场次的原始 snippet，含各场次段落序号；asset.list 确认角色库 total=0，需新建。
- 当前步骤是否完成？否——尚无 asset.create 落盘记录（历史上仅执行过只读探查）。
- 对后续步骤有用的关键事实：成年造型出场段落——1-2 段 2/3/4/5、1-4 段 1/2/3/6/7、1-5家 段 2/3/4/5/7/8/9、1-5庄园 段 2/3/5/18/19/20/22/23/25/26/27/28/30；童年闪回造型出场段落——1-3 段 1/3/6/7/8/9。角色画像：22岁心理医生，姐姐玛莉遗书托孤，养父焦恩；黑框眼镜职业装潜入造型；8岁贫民窟童年形象为闪回。
- 状态更新：第 4 步保持 [ ]，本轮推进写入；第 5 步 [ ] 待核验结案。
- 下一步行动：工具已装载，直接调用 asset.create 一步建卡，同时绑定两个版本与各自出处段落。

思考：
依据 search 原始数据核对：成年造型对应 22岁心理医生，1-2 段 2 有字幕「心理医生娜塔莉亚 22岁」明确坐实年龄与职业；1-5庄园 段 2 明确「穿着职业装…戴着一副黑框眼镜」为潜入造型视觉特征，可作为版本识别点。童年造型在 1-3 明确为「穿着破烂的小娜塔莉亚」（8岁），属视觉上不同年龄阶段，应作为同一角色的独立版本。两个版本出处分属不同场次，互不复制：versions 各绑定自身段落。provenances 段落序号均来自本轮 search 的真实返回（sceneTitle 与 paragraphIndex 对应），非画外音段落亦包含娜塔莉亚实质出场的动作段（如 ▲娜塔莉亚死死握着书信）。description 写清首次出场位置、身份归属与防混淆特征。参数齐备，直接建卡。

工具调用：
{{调用 asset.create, {"type": "characters", "name": "娜塔莉亚", "role": "心理医生（女主）", "description": "第一集 1-2 日 内 医院办公室首次出场，字幕标注「心理医生娜塔莉亚 22岁」。姐姐玛莉被布莱克伍德家族迫害，留下血书托孤；由养父焦恩抚养长大，8岁时被姐姐推向养父母、从此姐妹分离。为寻姐救孤女，以职业装+黑框眼镜的柔弱心理医生形象潜入布莱克伍德庄园应聘。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。", "versions": [{"name": "22岁心理医生（职业装造型）", "description": "22岁成年造型，心理医生。黑色职业装、黑框眼镜，抱厚厚简历，外表柔弱但内心坚定。", "aliases": ["娜塔莉亚", "Natalia", "心理医生娜塔莉亚"], "provenances": [{"sceneTitle": "1-2 日 内 医院办公室", "paragraphIndices": [2, 4, 5]}, {"sceneTitle": "1-4 日 内 医院办公室", "paragraphIndices": [1, 3, 6, 7]}, {"sceneTitle": "1-5 日 内 娜塔莉亚家", "paragraphIndices": [3, 4, 7, 8, 9]}, {"sceneTitle": "1-5 日 外 布莱克伍德庄园", "paragraphIndices": [2, 18, 19, 20, 22, 25, 27, 30]}]}, {"name": "8岁小娜塔莉亚（贫民窟童年闪回造型）", "description": "8岁童年闪回造型，穿破烂衣服的贫民窟女孩，与13岁姐姐小玛莉相依为命，被姐姐推向养父母得以活命。", "aliases": ["小娜塔莉亚", "小娜塔莉亚（8岁）", "童年娜塔莉亚"], "provenances": [{"sceneTitle": "1-3 日 外 贫民窟门口", "paragraphIndices": [1, 3, 6, 8, 9]}]}]}}
用户沟通：
{
- 对用户说的话（完整版）：“我按第一集剧本把娜塔莉亚建成了角色卡，分了两个造型版本：22岁心理医生（职业装+黑框眼镜）和8岁贫民窟童年闪回，出处段落都锚定在 1-2、1-3、1-4、1-5 两场对应位置。落盘后我会再核验一遍有没有漏场或串段。”
- 对用户说的话（简版）：“正在创建娜塔莉亚角色卡（两版造型），落盘后我复核一遍。”
}
```

### [第 5 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.create` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "characters",
  "name": "娜塔莉亚",
  "role": "心理医生（女主）",
  "description": "第一集 1-2 日 内 医院办公室首次出场，字幕标注「心理医生娜塔莉亚 22岁」。姐姐玛莉被布莱克伍德家族迫害，留下血书托孤；由养父焦恩抚养长大，8岁时被姐姐推向养父母、从此姐妹分离。为寻姐救孤女，以职业装+黑框眼镜的柔弱心理医生形象潜入布莱克伍德庄园应聘。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。",
  "versions": [
    {
      "name": "22岁心理医生（职业装造型）",
      "description": "22岁成年造型，心理医生。黑色职业装、黑框眼镜，抱厚厚简历，外表柔弱但内心坚定。",
      "aliases": [
        "娜塔莉亚",
        "Natalia",
        "心理医生娜塔莉亚"
      ],
      "provenances": [
        {
          "sceneTitle": "1-2 日 内 医院办公室",
          "paragraphIndices": [
            2,
            4,
            5
          ]
        },
        {
          "sceneTitle": "1-4 日 内 医院办公室",
          "paragraphIndices": [
            1,
            3,
            6,
            7
          ]
        },
        {
          "sceneTitle": "1-5 日 内 娜塔莉亚家",
          "paragraphIndices": [
            3,
            4,
            7,
            8,
            9
          ]
        },
        {
          "sceneTitle": "1-5 日 外 布莱克伍德庄园",
          "paragraphIndices": [
            2,
            18,
            19,
            20,
            22,
            25,
            27,
            30
          ]
        }
      ]
    },
    {
      "name": "8岁小娜塔莉亚（贫民窟童年闪回造型）",
      "description": "8岁童年闪回造型，穿破烂衣服的贫民窟女孩，与13岁姐姐小玛莉相依为命，被姐姐推向养父母得以活命。",
      "aliases": [
        "小娜塔莉亚",
        "小娜塔莉亚（8岁）",
        "童年娜塔莉亚"
      ],
      "provenances": [
        {
          "sceneTitle": "1-3 日 外 贫民窟门口",
          "paragraphIndices": [
            1,
            3,
            6,
            8,
            9
          ]
        }
      ]
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "characters",
  "createdCount": 1,
  "items": [
    {
      "id": "char_1794216503373_y8oc3_0",
      "name": "娜塔莉亚",
      "role": "心理医生（女主）",
      "description": "第一集 1-2 日 内 医院办公室首次出场，字幕标注「心理医生娜塔莉亚 22岁」。姐姐玛莉被布莱克伍德家族迫害，留下血书托孤；由养父焦恩抚养长大，8岁时被姐姐推向养父母、从此姐妹分离。为寻姐救孤女，以职业装+黑框眼镜的柔弱心理医生形象潜入布莱克伍德庄园应聘。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。",
      "versions": [
        {
          "id": "char_1794216503373_y8oc3_0_charv_1",
          "name": "22岁心理医生（职业装造型）",
          "description": "22岁成年造型，心理医生。黑色职业装、黑框眼镜，抱厚厚简历，外表柔弱但内心坚定。",
          "aliases": [
            "娜塔莉亚",
            "Natalia",
            "心理医生娜塔莉亚"
          ],
          "verifiedProvenance": [
            {
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_2_193",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_4_526",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_5_547",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_1_1401",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_3_1636",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_6_1726",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_7_1741",
              "sceneId": "sc-27-1373",
              "sceneTitle": "第一集 1-4 日  内   医院办公室",
              "matchedTerm": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
              "evidenceText": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
              "anchorText": "娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 1741,
              "lineNumber": 37
            },
            {
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_3_2306",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_4_2325",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_7_2617",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_8_2632",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_9_2660",
              "sceneId": "sc-38-1953",
              "sceneTitle": "第一集 1-5 日  内  娜塔莉亚家",
              "matchedTerm": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)",
              "evidenceText": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)",
              "anchorText": "面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大",
              "offsetInAnchor": 14,
              "fallbackCharIndex": 2660,
              "lineNumber": 50
            },
            {
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_2_2825",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_18_4354",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_19_4380",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_20_4427",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_22_4525",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_25_4691",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_27_4807",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_1_para_30_4944",
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
          "verifiedScriptHash": "82127:1mmekap",
          "sourceScenes": [
            "第一集 1-2 日  内   医院办公室",
            "第一集 1-4 日  内   医院办公室",
            "第一集 1-5 日  内  娜塔莉亚家",
            "第一集 1-5 日 外 布莱克伍德庄园"
          ]
        },
        {
          "id": "char_1794216503373_y8oc3_0_charv_2",
          "name": "8岁小娜塔莉亚（贫民窟童年闪回造型）",
          "description": "8岁童年闪回造型，穿破烂衣服的贫民窟女孩，与13岁姐姐小玛莉相依为命，被姐姐推向养父母得以活命。",
          "aliases": [
            "小娜塔莉亚",
            "小娜塔莉亚（8岁）",
            "童年娜塔莉亚"
          ],
          "verifiedProvenance": [
            {
              "id": "vp_char_1794216503373_y8oc3_0_charv_2_para_1_731",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_2_para_3_853",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_2_para_6_1022",
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
              "id": "vp_char_1794216503373_y8oc3_0_charv_2_para_8_1348",
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
          "verifiedScriptHash": "82127:1mmekap",
          "sourceScenes": [
            "第一集 1-3 贫民窟门口   日   外"
          ]
        }
      ],
      "sourceScenes": [
        "第一集 1-2 日  内   医院办公室",
        "第一集 1-4 日  内   医院办公室",
        "第一集 1-5 日  内  娜塔莉亚家",
        "第一集 1-5 日 外 布莱克伍德庄园",
        "第一集 1-3 贫民窟门口   日   外"
      ]
    }
  ],
  "message": "成功在项目【characters】中新增 1 个资产条目。"
}
```

---
## 第 6 轮（耗时：4154 ms (4.15 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, asset.list, asset.create, user.ask`

### [第 6 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定并持续存在的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
依据【认知状态 -> 当前计划】连续调用工具推进执行，严禁无依据猜测或把未执行视为成功。
1. 真实依据与出处正向单一判准（严格防误判）：
   - 调用工具必须基于上下文中的真实事实与原文段落，严禁凭空编造；
   - 提取角色出处（provenances）时，所选段落必须是该角色在画面中实质出场、动作或发话的客观段落；
   - 严禁将他人的台词/动作、纯画外音（vo）或纯心理活动（OS）作为该角色的出处段落（非出场的背景信息统一归入 description，不得录入 provenances）。
2. 随读随写增量闭环（严禁全读完再单次囤积写入）：
   - 执行多场次任务时遵循“处理一批、落地一批”：读完首场立即调用 asset.create 落地资产；后续场次读完核验后立即调用 asset.update(mode: "append") 或 asset.commitProvenance(mode: "append") 追加出处与补充设定。
   - 若单次 script.read 同时返回了多个子场次，当轮写入时在 provenances 数组中一次性并列提交各场次段落，无需拆成多轮重复读取。
3. 参数扁平化与多版本规范：
   - asset.update 支持在顶层直接传参（无需嵌套 updates 对象）；向已有资产追加新版本时直接传入 versions 数组（各版本仅录入属于该版本的特有出处，严禁将全量出处复制给子版本）；落盘返回即代表写入完成，无需冗余调用 asset.list 回查。
4. 连续推进与工具流转：
   - 当前步骤完成后紧接着推进“当前计划”中的下一个未完成步骤（[ ]）；
   - 所需工具已在【当前可直接调用】列表中，直接连续调用，无需频繁退回全局计划阶段；
   - 若需补充工具可从候选简表中调 sys.selectContext({"tools": [...]}) 补充装载；所有计划全部完成后无参调用 sys.selectContext 返回全局计划阶段结案。
称用户为“你”，口吻亲和随意；工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。
- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？
- 本轮工具返回了哪些具体结果？当前步骤是否已经完成？“当前计划”中还有哪些后续步骤待推进？
- 本轮在“工具执行结果”中发现了哪些对后续步骤有用的关键事实、ID 或原文线索？（整理列出以便沉淀到“重点笔记”）
- 当前计划各步骤状态（[x] / [ ]）与当前进度需要更新为什么？
- 下一步行动判断：若计划未完成且工具已装载，下一步调用哪个工具继续推进？若需补充工具或计划全部完成，准备调用 sys.selectContext。}
思考：
{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演，核对参数依据是否完整就绪，确定本轮要调用的工具与具体参数。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前执行进展或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：补充装载工具或退出局部执行返回全局计划阶段（当前计划的后续步骤如需补充装载工具，可传 {"tools": [...]} 增量合并装载，已装载工具会自动保留；当“当前计划”中的所有步骤均已执行完毕后，直接无参调用 {{调用 sys.selectContext}} 返回全局计划与验收阶段）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- asset.list：按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。
  参数：{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }
- asset.create：新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① 最佳实践：若已通过批量读取掌握了全部出处段落与多版本特征，推荐在 versions 与 provenances 中一次性全部传入一步到位建卡（无需后续多轮 update 碎步追加）；落盘返回成功即为真值，无需调用 asset.list 回查；② description（资产设定简介）须写清首次出场位置（集/场）、身份归属及防混淆辨识特征（未在画面中呈现、仅被提及的背景信息归入 description）；③ 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions，无需向用户提问是否单独建角色；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），必须在 versions 数组中同时传入初始版本与所有变体版本（确保 versions 数组长度至少为 2，且每个版本分别绑定各自造型的 provenances 与 aliases），或使用 parentId 为变体版本独立创建衍生卡片；④ provenances（出处锚点）判定规则：根据段落内容，如果资产可能在画面中呈现出来，即判定该段落为出处（直接传入对应场次 sceneTitle 与段落序号 paragraphIndices: [1, 2, 3] 或 paragraphIndex: 1，系统会自动映射行号与原文，无需重复手填 evidenceText）。
  参数：{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }

## 候选工具简表（后续步骤如需使用，可调 sys.selectContext 补充装载）
- script.directory：读取剧本分集与场次目录概览
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（支持场次数组一次性批量读取多场）
- script.search：在剧本指定范围（目标集/场次/行号区间）或全文中搜索关键词并返回匹配段落行（探查期建议与 directory、list 配合并发调用以建立全局视野）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落
- asset.commitProvenance：提交核验通过的资产出处段落锚点

# 认知状态
任务标题：提取娜塔莉亚资产
最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
当前小目标：创建娜塔莉亚角色资产卡（含22岁心理医生与8岁童年两个造型版本），并绑定第一集相关出处段落
当前进度：已完成三路只读探查并确认出场分布与资产库为空；已成功调用 asset.create 创建娜塔莉亚角色资产卡（两个造型版本）并绑定第一集出处段落；第5步全局核验结案待执行。
当前计划：[x] 探查第一集场次目录、全文搜索“娜塔莉亚”、查询现有角色资产
[x] 定位娜塔莉亚在第一集的出场场次并归纳角色画像（1-2、1-3童年、1-4、1-5家、1-5庄园）
[x] 确认资产库现状（total=0，需新建娜塔莉亚资产卡）
[x] 创建娜塔莉亚角色资产卡（22岁心理医生/8岁童年两个造型版本）并绑定第一集出处段落
[ ] 全局核验结案
重点笔记：- 娜塔莉亚：22岁心理医生；姐姐玛莉遗书托孤；养父焦恩；为寻姐救孤女潜伏布莱克伍德庄园；黑框眼镜职业装为潜入造型；8岁贫民窟童年形象为闪回造型。第一集出场共5场：1-2、1-4、1-5（娜塔莉亚家）、1-5（布莱克伍德庄园）成年戏，1-3童年闪回。已通过 asset.create 创建角色卡，两版本出处段落：成年造型——1-2 段2/4/5、1-4 段1/3/6/7、1-5家 段3/4/7/8/9、1-5庄园 段2/18/19/20/22/25/27/30；童年闪回造型——1-3 段1/3/6/8/9。角色画像明确：1-2 段2 字幕「心理医生娜塔莉亚 22岁」坐实年龄职业；1-5庄园 段2 明确职业装+黑框眼镜为潜入造型视觉特征；1-3 段1/3 明确「穿着破烂的小娜塔莉亚」（8岁）为闪回童年。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。创建后可用 asset.list 校验核验结案。

# 工具执行结果
【工具 asset.create 执行成功】
{"success":true,"type":"characters","createdCount":1,"items":[{"id":"char_1794216503373_y8oc3_0","name":"娜塔莉亚","role":"心理医生（女主）","description":"第一集 1-2 日 内 医院办公室首次出场，字幕标注「心理医生娜塔莉亚 22岁」。姐姐玛莉被布莱克伍德家族迫害，留下血书托孤；由养父焦恩抚养长大，8岁时被姐姐推向养父母、从此姐妹分离。为寻姐救孤女，以职业装+黑框眼镜的柔弱心理医生形象潜入布莱克伍德庄园应聘。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。","versions":[{"id":"char_1794216503373_y8oc3_0_charv_1","name":"22岁心理医生（职业装造型）","description":"22岁成年造型，心理医生。黑色职业装、黑框眼镜，抱厚厚简历，外表柔弱但内心坚定。","aliases":["娜塔莉亚","Natalia","心理医生娜塔莉亚"],"verifiedProvenance":[{"sceneTitle":"第一集 1-2 日  内   医院办公室","evidenceText":"▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]"},{"sceneTitle":"第一集 1-2 日  内   医院办公室","evidenceText":"▲娜塔莉亚死死握着书信，眼泪落在照片上。"},{"sceneTitle":"第一集 1-2 日  内   医院办公室","evidenceText":"娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"▲娜塔莉亚死死盯着那段小字。"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"▲娜塔莉亚握住了焦恩的手，坚定开口。"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"▲娜塔莉亚拿着文件准备起身。"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲娜塔莉亚缓缓抬头。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲娜塔莉亚紧张地握紧了简历。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）"}],"provenanceStatus":"verified","sourceScenes":["第一集 1-2 日  内   医院办公室","第一集 1-4 日  内   医院办公室","第一集 1-5 日  内  娜塔莉亚家","第一集 1-5 日 外 布莱克伍德庄园"]},{"id":"char_1794216503373_y8oc3_0_charv_2","name":"8岁小娜塔莉亚（贫民窟童年闪回造型）","description":"8岁童年闪回造型，穿破烂衣服的贫民窟女孩，与13岁姐姐小玛莉相依为命，被姐姐推向养父母得以活命。","aliases":["小娜塔莉亚","小娜塔莉亚（8岁）","童年娜塔莉亚"],"verifiedProvenance":[{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。"},{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲小玛莉一把将小娜塔莉亚推向了养父。"},{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。"},{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲小玛莉身影模糊，小娜塔莉亚落泪。"}],"provenanceStatus":"verified","sourceScenes":["第一集 1-3 贫民窟门口   日   外"]}],"sourceScenes":["第一集 1-2 日  内   医院办公室","第一集 1-4 日  内   医院办公室","第一集 1-5 日  内  娜塔莉亚家","第一集 1-5 日 外 布莱克伍德庄园","第一集 1-3 贫民窟门口   日   外"]}],"message":"成功在项目【characters】中新增 1 个资产条目。"}
```

### [第 6 轮] 模型原始输出
```text
状态检查：
- 当前执行到「[ ] 全局核验结案」步骤，此前 4 步均已完成。
- 本轮 asset.create 返回成功：创建了角色「娜塔莉亚」（id: char_1794216503373_y8oc3_0），含两个版本：22岁心理医生职业装造型（charv_1）、8岁童年闪回造型（charv_2），出处段落均已 verified，sourceScenes 覆盖 1-2、1-3、1-4、1-5家、1-5庄园，与重点笔记一致。
- 当前计划仅剩核验结案步骤待推进。
- 关键事实：资产 ID、两版本 ID、出处状态均为 verified，无缺漏。
- 下一步：计划所有步骤已执行完毕，无参调用 sys.selectContext 返回全局计划阶段结案。

思考：
asset.create 落盘成功即代表写入完成，两个版本各自的出处段落均正确绑定且 verified，覆盖第一集全部 5 场出场段落，与预定画像吻合。所有计划步骤已完成，直接无参调用 sys.selectContext 结案，无需再冗余回查 asset.list。

工具调用：
{{调用 sys.selectContext}}

用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚角色卡已建好，包含22岁心理医生职业装和8岁童年闪回两个造型版本，第一集1-2、1-3、1-4、1-5（家/庄园）共5场出场段落全部绑定并核验通过，任务已结案。”
- 对用户说的话（简版）：“娜塔莉亚角色卡建好啦，两个造型版本都绑定好第一集出处，已结案～”
}
```

### [第 6 轮] 工具调用记录（共 1 个）
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
## 第 7 轮（耗时：5248 ms (5.25 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 7 轮] 实际发送 Prompt
```text
# 背景
你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。
当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。

# 用户指令
## 当前聚焦目标
【当前聚焦目标：oxay9ajfp】
## 用户输入原文
提取角色娜塔莉亚，只看第一集

# 工作指南
默认优先使用后台工具读取项目数据；需要演示或核验界面时使用 UI。基于工具返回的事实推进，严禁把未执行视为成功。
进入执行阶段前，必须制定步骤化的“当前计划”，驱动执行阶段连续执行：
1. 探查期安全原则（数据未知时）：制定宏观探查计划，调用 sys.selectContext 仅装载只读探查工具（如 script.directory、script.search、asset.list），严禁提前装载写入工具；
2. 动态重规划原则（获知数据分布后）：当触发数据量预警或上一轮返回了场次分布概览（scenesSummary）时，必须在“当前计划”中将宏观任务细化为按场次/实体的具体子步骤（分步推进：首场建卡、后续场次追加）；切入执行时一次性装载所需的读写工具组（如 script.read, asset.create, asset.update），严禁盲目单步硬吞；
3. 工具装载与流转：结合“当前计划”所需工具，通过 sys.selectContext 展开分类或装载 tools 进入执行阶段；
4. 全局核验与结案：从执行阶段返回后，对照“最终目标”与“当前计划”核验所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。
称用户为“你”，口吻亲和随意；遇需用户决策事项在用户沟通中说明。工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。

# 输出格式
状态检查：
{回顾并检查上面的“认知状态”。
- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）
- 对照“当前计划”与“工具执行结果”核验推进：
  * 初次规划：列出宏观探查计划（如：[ ] 1. 探查数据现状；[ ] 2. 提取/创建资产；[ ] 3. 全局核验）；
  * 动态重规划：若触发数据量预警或已知场次分布，在此处将旧宏观步骤直接替换输出为细化后的分步子任务列表（标记 [x] 已完成、[ ] 待推进）；
  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）。
- 最终目标与当前计划是否全部达成？若全部达成，准备调用 sys.endTask 结案；若未完成，下一步推进哪个步骤与小目标？
- 为执行当前计划，需要先展开哪些分类（categories），或挑选哪些具体工具（tools）进入执行阶段？
- 是否有关键结论需要沉淀到“重点笔记”？}
思考：
{使用内心独白的方式，围绕全局目标、计划制定与工具准备进行逻辑推演。如果需要展开分类、装载工具进入执行或结束任务，请调用对应工具，系统会自动执行你的操作。}
工具调用：
{{调用 工具名称, {"参数名": "参数值"}}}
用户沟通：
{
- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”
- 对用户说的话（简版）：“插入对用户说的话，介绍当前任务状态、汇报结果或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”
}

# 可用工具
## 当前可直接调用
- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段。规则：① 需展开新工具分类时，传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合“当前计划”中的各个步骤，从已展开的候选简表中一次性挑选执行该计划所需的具体工具 ID 传 {"tools": [...]} 进入局部执行阶段（装配原则：工具须成组配套，若任务涉及资产提取且需分步追加，须同时装配 [asset.create, asset.update]；探查阶段推荐同时装载并并发调用 [directory, search, list]）。
  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }
- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。
  参数：{ question?: string }
- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。
  参数：{ success?: boolean, paused?: boolean }

## 候选工具简表（已展开分类: [script, asset]）
- script.directory：读取剧本分集与场次目录概览
- script.read：按“集数 -> 场次 -> 段落”三层结构读取剧本正文（支持场次数组一次性批量读取多场）
- script.search：在剧本指定范围（目标集/场次/行号区间）或全文中搜索关键词并返回匹配段落行（探查期建议与 directory、list 配合并发调用以建立全局视野）
- asset.list：按类型分页读取或按名称/别名检索已有角色、场景和道具资产
- asset.create：新增角色、场景或道具资产并绑定剧本出处段落（若出处与版本已齐备推荐一次性全量录入一步到位建卡）
- asset.update：按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落
- asset.delete：按 ID 删除单个或批量资产/二级版本
- asset.searchProvenanceCandidates：跨集检索剧本中的资产字面匹配候选段落
- asset.commitProvenance：提交核验通过的资产出处段落锚点

## 其它未展开的工具分类（可传 categories 补充展开）
- card（画布与生图工具箱）：查看卡片详情、画面元素空间标注、生图与复刻衍生
- ui（界面观察与操作）：观察当前可见界面结构、查询操作说明、执行鼠标交互

# 认知状态
任务标题：提取娜塔莉亚资产
最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应的角色资产（如已有则核对、补充）
当前小目标：全局核验上一阶段执行结果并推进下一步或结案
当前进度：已完成三路只读探查并确认出场分布与资产库为空；已成功调用 asset.create 创建娜塔莉亚角色资产卡（char_1794216503373_y8oc3_0，含 charv_1 22岁心理医生职业装、charv_2 8岁童年闪回两个版本），出处段落全部 verified 并覆盖第一集 1-2、1-3、1-4、1-5（家/庄园）共5场；本轮已执行 sys.selectContext 退出局部执行，返回全局计划与验收阶段，待完成全局核验结案。
当前计划：[x] 探查第一集场次目录、全文搜索“娜塔莉亚”、查询现有角色资产
[x] 定位娜塔莉亚在第一集的出场场次并归纳角色画像（1-2、1-3童年、1-4、1-5家、1-5庄园）
[x] 确认资产库现状（total=0，需新建娜塔莉亚资产卡）
[x] 创建娜塔莉亚角色资产卡（22岁心理医生/8岁童年两个造型版本）并绑定第一集出处段落
[ ] 全局核验结案
重点笔记：- 娜塔莉亚角色卡已创建成功：资产ID char_1794216503373_y8oc3_0，含两个造型版本——charv_1（22岁心理医生职业装造型）、charv_2（8岁童年闪回造型）；两版本出处段落均已 verified，sourceScenes 覆盖 1-2、1-3、1-4、1-5（娜塔莉亚家）、1-5（布莱克伍德庄园），与画像一致。角色设定：22岁心理医生；姐姐玛莉遗书托孤；养父焦恩；为寻姐救孤女潜伏布莱克伍德庄园；黑框眼镜+职业装为潜入造型视觉特征，抱厚简历；8岁贫民窟童年为闪回造型。第一集共5场出场：1-2、1-4、1-5家、1-5庄园成年戏，1-3童年闪回。出处段落明细：成年造型——1-2 段2/4/5、1-4 段1/3/6/7、1-5家 段3/4/7/8/9、1-5庄园 段2/18/19/20/22/25/27/30；童年闪回造型——1-3 段1/3/6/8/9。角色画像依据：1-2 段2 字幕「心理医生娜塔莉亚 22岁」坐实年龄职业；1-5庄园 段2 明确职业装+黑框眼镜为潜入造型；1-3 段1/3 明确「穿着破烂的小娜塔莉亚」（8岁）为闪回童年。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。

# 工具执行结果
【工具 asset.create 执行成功】
{"success":true,"type":"characters","createdCount":1,"items":[{"id":"char_1794216503373_y8oc3_0","name":"娜塔莉亚","role":"心理医生（女主）","description":"第一集 1-2 日 内 医院办公室首次出场，字幕标注「心理医生娜塔莉亚 22岁」。姐姐玛莉被布莱克伍德家族迫害，留下血书托孤；由养父焦恩抚养长大，8岁时被姐姐推向养父母、从此姐妹分离。为寻姐救孤女，以职业装+黑框眼镜的柔弱心理医生形象潜入布莱克伍德庄园应聘。辨识特征：黑框眼镜、职业装、抱厚简历；区别于姐姐玛莉与贵族之女塞莱特斯。","versions":[{"id":"char_1794216503373_y8oc3_0_charv_1","name":"22岁心理医生（职业装造型）","description":"22岁成年造型，心理医生。黑色职业装、黑框眼镜，抱厚厚简历，外表柔弱但内心坚定。","aliases":["娜塔莉亚","Natalia","心理医生娜塔莉亚"],"verifiedProvenance":[{"sceneTitle":"第一集 1-2 日  内   医院办公室","evidenceText":"▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]"},{"sceneTitle":"第一集 1-2 日  内   医院办公室","evidenceText":"▲娜塔莉亚死死握着书信，眼泪落在照片上。"},{"sceneTitle":"第一集 1-2 日  内   医院办公室","evidenceText":"娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"▲娜塔莉亚死死盯着那段小字。"},{"sceneTitle":"第一集 1-4 日  内   医院办公室","evidenceText":"娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"▲娜塔莉亚握住了焦恩的手，坚定开口。"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"▲娜塔莉亚拿着文件准备起身。"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。"},{"sceneTitle":"第一集 1-5 日  内  娜塔莉亚家","evidenceText":"娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲娜塔莉亚缓缓抬头。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"▲娜塔莉亚紧张地握紧了简历。"},{"sceneTitle":"第一集 1-5 日 外 布莱克伍德庄园","evidenceText":"娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）"}],"provenanceStatus":"verified","sourceScenes":["第一集 1-2 日  内   医院办公室","第一集 1-4 日  内   医院办公室","第一集 1-5 日  内  娜塔莉亚家","第一集 1-5 日 外 布莱克伍德庄园"]},{"id":"char_1794216503373_y8oc3_0_charv_2","name":"8岁小娜塔莉亚（贫民窟童年闪回造型）","description":"8岁童年闪回造型，穿破烂衣服的贫民窟女孩，与13岁姐姐小玛莉相依为命，被姐姐推向养父母得以活命。","aliases":["小娜塔莉亚","小娜塔莉亚（8岁）","童年娜塔莉亚"],"verifiedProvenance":[{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。"},{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲小玛莉一把将小娜塔莉亚推向了养父。"},{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。"},{"sceneTitle":"第一集 1-3 贫民窟门口   日   外","evidenceText":"▲小玛莉身影模糊，小娜塔莉亚落泪。"}],"provenanceStatus":"verified","sourceScenes":["第一集 1-3 贫民窟门口   日   外"]}],"sourceScenes":["第一集 1-2 日  内   医院办公室","第一集 1-4 日  内   医院办公室","第一集 1-5 日  内  娜塔莉亚家","第一集 1-5 日 外 布莱克伍德庄园","第一集 1-3 贫民窟门口   日   外"]}],"message":"成功在项目【characters】中新增 1 个资产条目。"}

【工具 sys.selectContext 执行成功】已返回全局计划与验收阶段（局部执行工具已卸载；此前已展开分类 [script, asset] 的候选工具简表已在上方就绪，如需进入下一阶段执行可直接从中挑选 tools；若所有目标已全部完成，请调用 sys.endTask 结束任务）
```

### [第 7 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”，生成对应角色资产（已有则核对补充）。
- 对照计划核验：
  [x] 1. 探查第一集场次目录、全文搜索“娜塔莉亚”、查询现有角色资产
  [x] 2. 定位娜塔莉亚第一集出场场次并归纳画像（1-2、1-3童年、1-4、1-5家、1-5庄园）
  [x] 3. 确认资产库现状（total=0，需新建）
  [x] 4. 创建娜塔莉亚角色资产卡（22岁心理医生 / 8岁童年两版本）并绑定全部出处段落
  [x] 5. 全局核验结案
- 核验结论：asset.create 返回 success=true，资产卡 char_1794216503373_y8oc3_0 已创建；两个造型版本出处段落均 provenanceStatus=verified，sourceScenes 完整覆盖第一集 1-2、1-3、1-4、1-5家、1-5庄园 共5场，与角色画像一致。全部步骤真实达成。
- 下一步：调用 sys.endTask 结案。
- 需展开分类/工具：无，直接结案。
- 关键结论沉淀：已沉淀于重点笔记（资产ID、双版本、出处覆盖、辨识特征）。

思考：
上一阶段已成功创建娜塔莉亚角色资产卡，两个版本出处全部 verified 且覆盖第一集全部出场场次，与探查画像吻合。全局核验通过，无遗漏、无未执行项，可直接结案并向用户汇报成果。

工具调用：
{{调用 sys.endTask, {"success": true}}}

用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的资产提取完成啦～第一集里她一共出场5场（1-2、1-4、1-5家、1-5庄园的成年戏，加上1-3的童年闪回），我据此建好了角色卡 char_1794216503373_y8oc3_0，包含两个造型版本：①22岁心理医生（职业装+黑框眼镜、抱厚简历的潜入造型）②8岁小娜塔莉亚（贫民窟童年闪回造型）。每个版本都绑定了经核验的第一集出处段落，共5场全覆盖。后续要生图或做视频，直接基于这张卡推进就行～”
- 对用户说的话（简版）：“娜塔莉亚角色卡建好了，双版本出处已核验，第一集5场全覆盖，随时可生图～”
}
```

### [第 7 轮] 工具调用记录（共 1 个）
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
