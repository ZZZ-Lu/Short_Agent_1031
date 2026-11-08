# 任务运行追踪明细（共 28 轮）：提取娜塔莉亚资产
- **最终目标**：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色2/场景0/道具0），并完成全局验收结案。
- **任务状态**：completed · **总耗时**：469.8 s
- **最新进展**：已完成第一集场次结构探查（6场66段）；已确认资产库无娜塔莉亚（total=0）；已通过 script.search 获取40条命中跨5场；已创建娜塔莉亚角色资产（ID: char_1794137305183_eqhut_0）；已追加1-2段落2、4、5出处；已追加1-3贫民窟门口幼年出处及幼年设定；已追加1-4医院办公室出处及设定；已追加1-5娜塔莉亚家出处及设定；已核准1-5布莱克伍德庄园娜塔莉亚本人段落号为2、3、5、18、19、22、25、27、28、30；已执行 asset.update 成功重设完整 description（涵盖1-2至1-5各场）并追加布莱克伍德庄园 provenance；已执行 asset.list 核验，确认 sourceScenes 已覆盖1-2、1-3、1-4、1-5娜塔莉亚家、1-5布莱克伍德庄园全部五场，description 完整保留各场设定，provenanceStatus=verified，资产状态满足目标；已执行 sys.endTask 成功结案。（小目标：全局核验上一阶段执行结果并推进下一步或结案）

---
## 第 1 轮（耗时：3791 ms (3.79 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 1 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色1/场景0/道具0）。
- 当前计划（初次规划，尚未接触数据）：
  [ ] 1. 探查剧本目录与第一集正文，定位娜塔莉亚相关出场信息
  [ ] 2. 核查资产库中是否已存在娜塔莉亚，提取/创建角色资产
  [ ] 3. 全局核验资产清单是否满足目标（角色1）
- 是否全部达成：否
- 接下来：先展开 script 与 asset 分类，装载只读探查工具（剧本目录、剧本搜索、资产查询）进入探查阶段。
- 需展开分类：script、asset

思考：
刚接手任务，还没有任何项目数据。第一集是明确的边界，但集数结构与娜塔莉亚的出场分布未知，所以先只装只读探查工具——读目录确认第一集范围、搜索“娜塔莉亚”定位出处、查资产库避免重复创建。写入工具（asset.create/update）要等探查结果出来、判断数据规模后再重规划装载。

工具调用：
{{调用 sys.selectContext, {"categories": ["script", "asset"]}}}

用户沟通：
{
- 对用户说的话：“我先去翻翻剧本目录和第一集正文，看看娜塔莉亚在哪些场次出场，同时查一下资产库里是不是已经有她了，避免重复创建。”
- 对用户说的话（简版）：“我先查第一集剧本和现有资产，定位娜塔莉亚的出场情况～”
}
```

### [第 1 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (called)
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

---
## 第 2 轮（耗时：3135 ms (3.13 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 2 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色1/场景0/道具0）
- 当前计划：
  * 初次规划：
    [ ] 1. 探查剧本目录与第一集正文，定位娜塔莉亚相关出场信息
    [ ] 2. 核查资产库中是否已存在娜塔莉亚，提取/创建角色资产
    [ ] 3. 全局核验资产清单是否满足目标（角色1）
- 最终目标与当前计划要求尚未达成。
- 当前小目标：进入执行阶段，探查剧本目录与第一集正文，定位娜塔莉亚相关出场信息，同时核查资产库现状。
- 需装载只读探查工具：script.directory、script.read、script.search、asset.list（探查阶段严禁装载写入工具）。
- 重点笔记暂无关键结论，待探查后补充。

思考：
任务刚开始，尚未接触任何数据。我需要先探查剧本目录了解分集结构，读取第一集正文，搜索娜塔莉亚的出场段落，同时查一下资产库里是否已有这个角色。现在装载这四个只读工具进入执行阶段，拿到真实数据分布后再决定是否需要写入操作。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.directory", "script.read", "script.search", "asset.list"]}}}

用户沟通：
{
- 对用户说的话：“我先去看一下剧本第一集的结构和娜塔莉亚的出场情况，顺便查查资产库里有没有她，拿到结果就跟你同步～”
- 对用户说的话（简版）：“我先探查第一集剧本和现有资产库，找到娜塔莉亚的出场信息～”
}
```

### [第 2 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (called)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.directory",
    "script.read",
    "script.search",
    "asset.list"
  ],
  "level": 1
}
```

---
## 第 3 轮（耗时：3096 ms (3.10 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (6)：`sys.selectContext, script.directory, script.read, script.search, asset.list, user.ask`

### [第 3 轮] 模型原始输出
```text
状态检查：
- 当前计划第一步：探查剧本目录与第一集正文，定位娜塔莉亚相关出场信息。当前尚未读取任何数据。
- 本轮工具返回：工具装载成功，已就绪 script.directory、script.read、script.search、asset.list。
- 后续待推进：读取第一集内容 → 核查资产库 → 创建/更新资产 → 全局核验。
- 下一步：先调用 script.directory 查看第一集场次结构，同时并行检索娜塔莉亚关键词。

思考：
先获取剧本目录了解第一集的场次分布与行号范围，再用 search 精确定位“娜塔莉亚”的出场段落，最后用 asset.list 核查是否已有该角色。先走目录探查。

工具调用：
{{调用 script.directory, {"query": "第一集"}}}

用户沟通：
- 对用户说的话（完整版）：“我先看一下剧本第一集的场次结构，并检索娜塔莉亚的出场位置，同时确认资产库里有没有现成的角色条目。”
- 对用户说的话（简版）：“我先查第一集的场次结构和娜塔莉亚的出场位置～”
```

### [第 3 轮] 工具调用记录（共 1 个）
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
  "projectId": "proj_1793879628309",
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
            "小娜塔莉亚",
            "8岁",
            "小玛莉（姐姐",
            "13岁）",
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

---
## 第 4 轮（耗时：5287 ms (5.29 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 4 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色1/场景0/道具0）
- 当前计划（动态重规划，因触发数据量预警 autoReturnedToLevel0）：
  - [x] 1. 探查剧本目录结构（已完成：6场66段，1-1至1-5场）
  - [ ] 2. 核查资产库是否已有娜塔莉亚（asset.list 检索）
  - [ ] 3. 检索第一集娜塔莉亚出场段落范围（script.search，聚焦 1-2、1-4、1-5家、1-5庄园）
  - [ ] 4. 精读相关场次正文（script.read 逐场），提取娜塔莉亚角色属性与外貌描写
  - [ ] 5. 创建/更新娜塔莉亚角色资产并绑定第一集出处段落
  - [ ] 6. 全局核验资产清单是否满足目标（角色1）
- 是否全部达成：否。注意：1-3 场出现“小娜塔莉亚（8岁）”，需判断是否作为同一角色的别名/幼年版归并，先读取正文再定。
- 下一步：先核查资产库现状、检索娜塔莉亚关键词并读相关场次正文。因当前处于 Stage 0，先装载只读探查工具推进第2-3步。
- 需装载工具：asset.list、asset.searchProvenanceCandidates、script.search、script.read
- 重点笔记更新：第一集场次分布已确认，娜塔莉亚出现在 1-2、1-4、1-5(家)、1-5(庄园)，1-3 为小娜塔莉亚幼年回忆；写入工具待探查后重规划装载。

思考：
目录已经拿到了，6场66段确实不少，但娜塔莉亚的出场集中在大部分场次。我先把只读探查做完：查资产库有没有现成的娜塔莉亚、检索台词/段落锚点、再精读含她的场次正文，拿到外貌与性格事实后再决定创建还是更新。写入工具这轮先不装，避免踩探查阶段提前装载的坑。

{{调用 sys.selectContext, {"tools": ["asset.list", "asset.searchProvenanceCandidates", "script.search", "script.read"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“第一集结构我摸清楚了：共6个场次，娜塔莉亚主要出现在1-2医院办公室、1-4医院办公室、1-5娜塔莉亚家、1-5布莱克伍德庄园，另外1-3贫民窟门口是‘小娜塔莉亚（8岁）’的幼年回忆场面。我先去资产库看有没有现成的娜塔莉亚，再逐场读正文抓她的外貌和性格细节，然后决定是新建还是补充现有资产。”
- 对用户说的话（简版）：“第一集6场已摸清，娜塔莉亚集中在1-2/1-4/1-5，我这就查资产库并读正文抓细节～”
}
```

### [第 4 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "asset.list",
    "asset.searchProvenanceCandidates",
    "script.search",
    "script.read"
  ],
  "level": 1
}
```
**工具输出 (Output)**：
```json
{
  "level": 1,
  "tools": [
    "asset.list",
    "asset.searchProvenanceCandidates",
    "script.search",
    "script.read"
  ],
  "prompts": [
    "assets",
    "script"
  ],
  "categories": [
    "script",
    "asset"
  ],
  "transition": "enter_execution"
}
```

---
## 第 5 轮（耗时：2496 ms (2.50 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (6)：`sys.selectContext, script.read, script.search, asset.list, asset.searchProvenanceCandidates, user.ask`

### [第 5 轮] 模型原始输出
```text
状态检查：
- 当前计划第2步“核查资产库是否已有娜塔莉亚”尚未执行；第1步已完成（6场66段）。
- 本轮仅有目录探查结果，尚未做资产库核查和关键词检索。
- 关键线索：娜塔莉亚出现在1-2、1-4、1-5娜塔莉亚家、1-5布莱克伍德庄园；1-3为“小娜塔莉亚（8岁）”幼年回忆。
- 下一步：先调用 asset.list 检索是否已有娜塔莉亚资产。

思考：
先查资产库，避免重复创建。用 query "娜塔莉亚" 检索 characters。

工具调用：
{{调用 asset.list, {"type": "characters", "query": "娜塔莉亚"}}}

用户沟通：
{
- 对用户说的话（完整版）：“我先核查一下资产库里是否已经有娜塔莉亚这个角色，避免重复创建，然后再去第一集正文里定位她的出场段落。”
- 对用户说的话（简版）：“先查查资产库有没有娜塔莉亚～”
}
```

### [第 5 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.list` (succeeded)
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
  "projectId": "proj_1793879628309",
  "source": "project",
  "type": "characters",
  "total": 0,
  "offset": 0,
  "items": [],
  "nextOffset": null
}
```

---
## 第 6 轮（耗时：2979 ms (2.98 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (6)：`sys.selectContext, script.read, script.search, asset.list, asset.searchProvenanceCandidates, user.ask`

### [第 6 轮] 模型原始输出
```text
状态检查：
- 当前正在执行第2步“核查资产库是否已有娜塔莉亚”，本轮 asset.list 已返回结果：角色库中 total=0，无“娜塔莉亚”资产，确认需要新建。
- 第2步完成；后续待推进：第3步检索出场段落（script.search）、第4步精读正文、第5步创建资产并绑定出处、第6步全局核验。
- 关键事实：资产库无娜塔莉亚，需新建；已确认其在 1-2、1-4、1-5家、1-5庄园出场，1-3为幼年回忆（8岁）待正文核实。
- 下一步：调用 script.search 检索“娜塔莉亚”在第一集的候选段落。

思考：
资产库确认无该角色，可放心新建。先用 script.search 限定第一集搜索“娜塔莉亚”，获取全部命中行号与段落内容，作为出场范围与台词/动作归属的第一手依据；再据此精读相关场次。

工具调用：
{{调用 script.search, {"query": "娜塔莉亚", "episode": "第一集"}}}

用户沟通：
{
- 对用户说的话（完整版）：“资产库里还没有娜塔莉亚，我这就去第一集剧本里把她的出场段落都搜出来，逐一核对台词和动作描写。”
- 对用户说的话（简版）：“资产库没有娜塔莉亚，我先搜她第一集的出场段落。”
}
```

### [第 6 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.search` (succeeded)
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
  "projectId": "proj_1793879628309",
  "source": "project",
  "scope": {
    "episode": "第一集"
  },
  "total": 40,
  "hasVolumeWarning": true,
  "warning": "我发现检索到 40 条匹配，跨越 5 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "scenesSummary": [
    {
      "sceneId": "scene-8-151",
      "sceneNumber": "1-2",
      "sceneTitle": "1-2 日 内 医院办公室",
      "matchCount": 5,
      "matchIndices": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "sceneId": "scene-17-679",
      "sceneNumber": "1-3",
      "sceneTitle": "1-3 日 外 贫民窟门口",
      "matchCount": 6,
      "matchIndices": [
        6,
        7,
        8,
        9,
        10,
        11
      ]
    },
    {
      "sceneId": "scene-28-1373",
      "sceneNumber": "1-4",
      "sceneTitle": "1-4 日 内 医院办公室",
      "matchCount": 6,
      "matchIndices": [
        12,
        13,
        14,
        15,
        16,
        17
      ]
    },
    {
      "sceneId": "scene-39-1953",
      "sceneNumber": "1-5",
      "sceneTitle": "1-5 日 内 娜塔莉亚家",
      "matchCount": 9,
      "matchIndices": [
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26
      ]
    },
    {
      "sceneId": "scene-52-2776",
      "sceneNumber": "1-5",
      "sceneTitle": "1-5 日 外 布莱克伍德庄园",
      "matchCount": 14,
      "matchIndices": [
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40
      ]
    }
  ],
  "matches": [
    {
      "index": 1,
      "snippet": "人物  娜塔莉亚",
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 2,
      "snippet": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]",
      "paragraphIndex": 2,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 3,
      "snippet": "玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）",
      "paragraphIndex": 3,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 4,
      "snippet": "▲娜塔莉亚死死握着书信，眼泪落在照片上。",
      "paragraphIndex": 4,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 5,
      "snippet": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
      "paragraphIndex": 5,
      "sceneTitle": "1-2 日 内 医院办公室"
    },
    {
      "index": 6,
      "snippet": "人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母",
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 7,
      "snippet": "▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。",
      "paragraphIndex": 1,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 8,
      "snippet": "▲小玛莉一把将小娜塔莉亚推向了养父。",
      "paragraphIndex": 3,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 9,
      "snippet": "▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。",
      "paragraphIndex": 6,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 10,
      "snippet": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
      "paragraphIndex": 7,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 11,
      "snippet": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
      "paragraphIndex": 8,
      "sceneTitle": "1-3 日 外 贫民窟门口"
    },
    {
      "index": 12,
      "snippet": "人物  娜塔莉亚",
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 13,
      "snippet": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。",
      "paragraphIndex": 1,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 14,
      "snippet": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
      "paragraphIndex": 2,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 15,
      "snippet": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。",
      "paragraphIndex": 3,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 16,
      "snippet": "▲娜塔莉亚死死盯着那段小字。",
      "paragraphIndex": 6,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 17,
      "snippet": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)",
      "paragraphIndex": 7,
      "sceneTitle": "1-4 日 内 医院办公室"
    },
    {
      "index": 18,
      "snippet": "日  内  娜塔莉亚家",
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 19,
      "snippet": "人物 娜塔莉亚  焦恩",
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 20,
      "snippet": "焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Fa",
      "paragraphIndex": 2,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 21,
      "snippet": "▲娜塔莉亚握住了焦恩的手，坚定开口。",
      "paragraphIndex": 3,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 22,
      "snippet": "娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)",
      "paragraphIndex": 4,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 23,
      "snippet": "▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。",
      "paragraphIndex": 5,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 24,
      "snippet": "▲娜塔莉亚拿着文件准备起身。",
      "paragraphIndex": 7,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 25,
      "snippet": "▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。",
      "paragraphIndex": 8,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 26,
      "snippet": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)",
      "paragraphIndex": 9,
      "sceneTitle": "1-5 日 内 娜塔莉亚家"
    },
    {
      "index": 27,
      "snippet": "人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯",
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 28,
      "snippet": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]",
      "paragraphIndex": 2,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 29,
      "snippet": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")",
      "paragraphIndex": 3,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 30,
      "snippet": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)",
      "paragraphIndex": 5,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 31,
      "snippet": "▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。",
      "paragraphIndex": 18,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 32,
      "snippet": "娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）",
      "paragraphIndex": 19,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 33,
      "snippet": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。",
      "paragraphIndex": 20,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 34,
      "snippet": "娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）",
      "paragraphIndex": 22,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 35,
      "snippet": "▲布拉姆打量着娜塔莉亚。",
      "paragraphIndex": 23,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 36,
      "snippet": "▲娜塔莉亚缓缓抬头。",
      "paragraphIndex": 25,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 37,
      "snippet": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）",
      "paragraphIndex": 26,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 38,
      "snippet": "▲娜塔莉亚紧张地握紧了简历。",
      "paragraphIndex": 27,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 39,
      "snippet": "娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）",
      "paragraphIndex": 28,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    },
    {
      "index": 40,
      "snippet": "娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）",
      "paragraphIndex": 30,
      "sceneTitle": "1-5 日 外 布莱克伍德庄园"
    }
  ],
  "autoReturnedToLevel0": true
}
```

---
## 第 7 轮（耗时：7737 ms (7.74 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 7 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色1/场景0/道具0）。
- 当前计划（动态重规划，已触发数据量预警 autoReturnedToLevel0，将宏观探查细化为分场次精读）：
  [x] 1. 探查剧本目录结构（已完成：6场66段）
  [x] 2. 核查资产库是否已有娜塔莉亚（asset.list 确认 total=0，需新建）
  [x] 3. 检索第一集娜塔莉亚出场段落范围（script.search 已返回 40 条命中，跨 5 场）
  [ ] 4. 精读 1-2 医院办公室正文，提取娜塔莉亚首次出场描写与属性
  [ ] 5. 精读 1-3 贫民窟门口正文，判定“小娜塔莉亚（8岁）”是否作为幼年别名归并
  [ ] 6. 精读 1-4 医院办公室正文，补充角色属性与出处
  [ ] 7. 精读 1-5 娜塔莉亚家正文，补充角色属性与出处
  [ ] 8. 精读 1-5 布莱克伍德庄园正文，补充外貌/职业装/黑框眼镜等描写
  [ ] 9. 创建娜塔莉亚角色资产并绑定第一集全部出处段落
  [ ] 10. 全局核验资产清单是否满足目标（角色1）
- 是否全部达成：否。当前计划第 4-10 步待推进。
- 接下来推进：第 4-8 步逐场精读正文，提取角色属性与出处段落；随后第 9 步写入资产；第 10 步核验。
- 工具准备：探查阶段已装载 script.read、asset.searchProvenanceCandidates，可继续只读精读；写入工具待精读完成后于重规划阶段装载。
- 重点笔记补充：娜塔莉亚核心设定已从命中片段浮现——心理医生、22岁、姐姐玛莉（13岁时为救她将她送养）、养父焦恩；外貌有“黑框眼镜/职业装”；幼年小娜塔莉亚8岁可归并为同一角色幼年版别名。

思考：
检索结果已给出 40 条命中的关键片段，角色轮廓清晰，但须精读各场正文获取完整外貌与属性描写，尤其 1-2 首次亮相与 1-5 庄园的外貌特写。1-3 的“小娜塔莉亚（8岁）”需读正文确认归并策略。现在先逐场 script.read 精读，暂不装载写入工具；待精读完成、属性齐备后再重规划并装载 asset.create 写入。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.read", "asset.searchProvenanceCandidates"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“我已经在第一集里检索到娜塔莉亚的 40 处出场，横跨 5 个场次（1-2、1-3、1-4、1-5 娜塔莉亚家、1-5 庄园）。接下来我会逐场精读正文，把她的外貌、职业、关系和出处段落整理齐，再建成角色资产。1-3 里有个‘小娜塔莉亚 8 岁’的幼年回忆，我会先读正文判断是否作为她的幼年版别名归并到同一角色。”
- 对用户说的话（简版）：“已锁定娜塔莉亚5个场次出场，正逐场精读提取属性，随后建资产。”
}
```

### [第 7 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.read",
    "asset.searchProvenanceCandidates"
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
    "asset.searchProvenanceCandidates"
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
## 第 8 轮（耗时：5159 ms (5.16 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.searchProvenanceCandidates, user.ask`

### [第 8 轮] 模型原始输出
```text
状态检查：
- 当前正在执行“精读 1-2 医院办公室正文”这一步。
- 本轮 script.search 已返回 40 条命中，涵盖 5 场；但这是检索片段，尚未完成逐场正文精读。当前步骤未完成。
- 关键事实：1-2 有 5 条命中（段落 2、3、4、5 及人物表），1-3 有 6 条，1-4 有 6 条，1-5 娜塔莉亚家 9 条，1-5 布莱克伍德庄园 14 条。
- 后续步骤：1-2 → 1-3 → 1-4 → 1-5 家 → 1-5 庄园 → 创建资产 → 全局核验。
- 下一步：使用 script.read 精读 1-2 正文，获取完整出场描写与台词原文，以便随后调用 asset.create 落地资产。

思考：
我需要先读取 1-2 的完整正文，才能准确提取娜塔莉亚首次出场的视觉描写（照片、血书、职业装等）与台词，作为 asset.create 的 description 与 provenances 依据。先读 1-2。

工具调用：
{{调用 script.read, {"episode": "第一集", "scene": "1-2"}}}

用户沟通：
{
- 对用户说的话（完整版）：“我先精读第一集 1-2 医院办公室的正文，把娜塔莉亚的首次出场描写和台词原文核清楚，随后立即建立角色资产并逐场追加出处。”
- 对用户说的话（简版）：“正在精读1-2医院办公室，随后落地娜塔莉亚资产。”
}
```

### [第 8 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": "第一集",
  "scene": "1-2"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 1653,
  "offset": 1,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 1,
  "paragraphCount": 6,
  "hasVolumeWarning": false,
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 1,
      "paragraphCount": 6,
      "scenes": [
        {
          "index": 1,
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
          "paragraphs": [
            {
              "index": 1,
              "text": "（to制作：照片定格转场）"
            },
            {
              "index": 2,
              "text": "▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]"
            },
            {
              "index": 3,
              "text": "玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）"
            },
            {
              "index": 4,
              "text": "▲娜塔莉亚死死握着书信，眼泪落在照片上。"
            },
            {
              "index": 5,
              "text": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）"
            },
            {
              "index": 6,
              "text": "【闪回】"
            }
          ]
        }
      ]
    }
  ],
  "content": "第一集\n1-1\n夜  内   地下室\n人物  玛莉\n▲空荡的地下室里，玛莉双手被铁链绑着，跪在地上，她头发散乱瘦骨嶙峋，脸上带着血迹，一只手从黑暗中伸出来，捏住了玛莉的下巴，逼迫她抬头，玛莉恐惧地看向了镜头。\n玛莉（哀求）：救救我…… （Please... somebody help me...）\n\n1-2\n日  内   医院办公室\n人物  娜塔莉亚 \n（to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n1-3 贫民窟门口   日   外 \n人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n1-4\n日  内   医院办公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（Help me)\n玛莉（旁白）：救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n1-5\n日  内  娜塔莉亚家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）\n1-5\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)\n▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。\n管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)\n▲众人唏嘘。\n管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)\n▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。\n管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)\n▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。\n管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)\n应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)\n应聘者2：我也放弃 (Me too, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】\n塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）\n\n第二集\n2-1日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲娜塔莉亚打量着塞莱特斯。\n娜塔莉亚OS：她就是布拉姆的现任妻子塞莱特斯，王室的后裔，母亲是财阀之女，传闻是一位骄矜傲慢的贵族千金。（So this is Bram’s current wife, Celeste. Royal bloodline, heiress to a mega-corporation... as spoiled and arrogant as the rumors say.）\n▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。\n布拉姆：够了，塞莱特斯，别无理取闹了！（Enough, Celeste! Stop making a scene!）\n塞莱特斯（冷冽）：布拉姆，你许诺过只爱我一个人，（指着娜塔莉亚）为什么要让这个女人踏入家门？（Bram, you promised I'd be the only woman in your life! So why are you bringing her into our home?!）\n布拉姆（无奈）：她只是女儿的心理医生，难道，连给孩子看病的人，你都无法容忍吗？（She’s just our daughter’s therapist! Can’t you even allow someone to help our sick child?）\n▲塞莱特斯鄙夷地瞥了一眼娜塔莉亚。\n塞莱特斯（冷冽）：我绝不允许她踏进这个家！（I will NEVER let her step foot in this house!）\n▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。\n布拉姆：当初你明知道我有妻子，依旧主动靠近我，如今却要剥夺我女儿治病的权利，你未免太冷酷了！（When we met, you knew I was already married, yet you still threw yourself at me. And now you're keeping my daughter from getting the help she needs? Don't you think you're being a little too heartless?!）\n▲塞莱特斯愣住了，娜塔莉亚抬头打量着二人。\n娜塔莉亚OS：是塞莱特斯主动向布拉姆示好？（打量塞莱特斯）莫非是她？(Celeste was the one who went after Bram? Was it her?)\n▲娜塔莉亚握紧了拳头。\n娜塔莉亚（恨）OS：如果她是真凶，我会亲手撕碎她的一切，逼迫她说出姐姐的下落！(If she's the monster behind this... I will tear her life to pieces and force her to tell me where my sister is!)\n▲娜塔莉亚上前一步，递出自己的简历。\n娜塔莉亚（恭敬）：夫人，我是持证的儿童心理医生，这是我的简历，请您予以信任……(Ma'am, I am a certified pediatric therapist. Here is my resume. Please, allow me to prove my worth...)\n▲娜塔莉亚的话还没说完，塞莱特斯一把将简历摔在了娜塔莉亚脸上，纸张漫天飞舞。\n塞莱特斯（命令）：别以为我看不出来你的心思！立刻给我滚出去！【4】(I know exactly what you're up to. Now get out!)\n▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。\n布拉姆：塞莱特斯！克制你的行为！（看娜塔莉亚）你离开吧，我会支付一笔钱作为补偿。(Celeste, that's enough! You can go. I'll pay you for your trouble.)\n▲娜塔莉亚惊愕地抬头，塞莱特斯。\n娜塔莉亚OS：不，我绝不能就这样离开！(No... I can't walk away now!)\n▲就在这时，一个孩子光脚跑了出来，她拿着一个花瓶砸坏了门口的装饰，踩坏了花圃。\n女佣（追逐）：小姐！快回来，该吃药了！(Miss Diana! Please stop, it's time for your medicine!)\n▲娜塔莉亚看向了孩子。\n娜塔莉亚（惊愕）OS：那就是姐姐的女儿？(Is that... Mary's daughter?)\n▲戴安娜突然飞快跑向了关着饿狼的笼子。【5】\n布拉姆（呵斥）：戴安娜！停下！(Diana! Stop right there!)\n▲娜塔莉亚飞快冲了过去，一把抱住了戴安娜。\n娜塔莉亚：别靠近！那里很危险！(Get back! It's dangerous!)\n戴安娜（挣扎）：放开我！ (Let go of me! Get off!)\n▲戴安娜发病举起花瓶砸向了娜塔莉亚的脑袋。【6】\n女佣（惊呼）：小心！(Watch out!)\n▲娜塔莉亚一把握住了戴安娜的手，另一只手轻轻拍她的背安抚。\n娜塔莉娅：放下吧。（let it go,一语双关，辛苦本土化老师确认是否可以这样翻译 (可以的，这样说挺地道的）（见黛安娜放下花瓶，松了口气）你做的很好。(Just let it go... You did so good.)\n娜塔莉娅：（看着管家，低声说）快把帘子盖上。（Cover the cage. Now.）\n▲管家立刻盖上帘子遮住野狼。\n娜塔莉娅：都退开些，别刺激她！（Everyone step back. Don't crowd her!）\n▲布拉姆一抬手，众人立刻退开。\n▲娜塔莉亚解开脖子上的丝巾铺在地上，让黛安娜的双脚踩上去。\n娜塔莉娅：你这样太过危险，要不要玩一些更有意思的游戏？比如，吹蜡烛，像我这样……（Walking bare-foot is way too dangerous, sweetie. How about we play a fun game instead? Like... blowing out birthday candles. Look at me...）\n▲娜塔莉娅举起黛安娜的一根手指当作蜡烛，深呼吸然后吐气，黛安娜学着娜塔莉娅的样子也深呼吸起来，情绪得到了稳定。\n▲戴安娜的情绪像是得到了安抚，对着娜塔莉亚笑了起来。\n女佣（捂嘴）：哦，上帝啊，我从未见过小姐这么快平复情绪！（Oh my god... I've never seen  Miss Diana calm down so fast!）\n娜塔莉娅：小姐，别怕，你安全了。（It's ok. You're safe now.）\n黛安娜（凑到娜塔莉娅耳边）：你也安全了。（So are you.）\n▲娜塔莉娅一惊。\n\n\n第三集\n3-1\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲戴安娜拽住了娜塔莉亚的衣摆，看向了布拉姆。\n戴安娜：爸爸，我要她陪我玩儿！(Daddy, I want her to play with me!)\n▲布拉姆摸了摸戴安娜的头。\n布拉姆：如你所愿。（看娜塔莉亚）既然孩子接纳你，你可以留下。（威胁）但是……(Whatever you want. If Diana wants you here, you can stay. But...)\n▲布拉姆的目光看向了狼笼的方向，娜塔莉亚也跟着他的目光看了过去。\n娜塔莉亚（鞠躬）：我明白您的意思，我会照顾好小姐的，请您放心。(I understand, sir. I'll take good care of Miss Diana. You have my word.)\n布拉姆（满意）：带小姐去休息吧。(Take her to her room to rest.)\n▲娜塔莉亚将光脚的戴安娜抱了起来。\n娜塔莉亚：是。(Yes, sir)\n▲娜塔莉亚心中疑惑。\n娜塔莉亚（疑惑）OS：教父看起来非常疼爱戴安娜，为什么姐姐会称这里是牢笼？(The Godfather dotes on Diana so much... So why did my sister call this place a hellhole?)\n▲塞莱特斯死死握着拳头，在和娜塔莉亚擦肩而过时，压低声音警告。\n塞莱特斯（小声）：你会为你今天的决定付出代价的！(You're gonna regret this!)\n娜塔莉亚（温和）：夫人，我只是一个心理医生，听不懂你在说什么。(I'm just a therapist, ma'am. I'm afraid I don't know what you mean.)\n▲娜塔莉亚收回目光，抱着戴安娜一步一步走向了大门，大门打开，屋内富丽堂皇的装饰映入眼帘。\n娜塔莉亚OS：我的姐姐就这里，我不但要找到她的下落！还要保护戴安娜，还要让姐姐和戴安娜合法继承所有财产！【7】(My sister is here. I'll find out what happened to her, protect Diana, and make sure they both get their rightful share of the inheritance!)\n▲布拉姆轻轻抚摸了一下塞莱特斯的头发。\n布拉姆：不过是一个心理医生而已，没必要将她放在心上。(She’s just a shrink, babe. No need to waste your energy on her.)\n▲塞莱特斯下意识后退了一步，看向了娜塔莉亚的背影。\n塞莱特斯：是吗？(Is that so?)\n布拉姆（安抚）：好了，塞莱特斯，你的身体欠佳，回去休养吧。(Come on, Celeste. You're not feeling well. Go get some rest.)\n▲布拉姆也随着她的目光看向了娜塔莉亚的背影。\n布拉姆OS：又一个有趣的猎物，送上门来了！(Well, well...Another little mouse walked right into my trap.)\n▲布拉姆看了一眼管家。\n布拉姆：加强庄园守卫，没有我的命令，任何人都不许出去！【8】(Double the security. No one leaves this estate without my permission!)\n\n3-2\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  \n▲公主房内，戴安娜躺在华丽的公主床上，闭上眼睛，娜塔莉亚给她读故事。\n娜塔莉亚（温柔）：最后，公主和王子拥有了属于他们的幸福生活……(And in the end, the prince and princess lived happily ever after...)\n▲这时，花园传来微弱的呼救。\n（画外音，女声惨叫）vo：啊——救命——(Aah! Somebody help me!)\n▲娜塔莉亚惊愕看向了外面。\n娜塔莉亚OS：呼救？是姐姐吗？(A scream for help? Was that... my sister?!)\n▲娜塔莉亚连忙起身出门。\n\n3-3\n日  外  花园\n人物  娜塔莉亚  管家\n▲娜塔莉亚悄悄在花园里面走，花园里面装饰与建筑物遮挡视线，墙角站着持枪的安保，娜塔莉亚微微弯腰，躲避安保的视线。\n娜塔莉亚（自言自语）：奇怪，呼救声明明是从这里传出来的！(That’s weird. I swear that scream came from right around here!)\n▲突然一只手拍了一下娜塔莉亚的后背，娜塔莉亚惊恐回头，只见管家冷着脸站在她身后。\n管家（冷漠）：你在干什么？(What do you think you’re doing?)\n娜塔莉亚：我，我随便走走……(I—I was just taking a walk, getting some fresh air...)\n▲管家冷脸将文件夹递给娜塔莉亚。\n管家：这是庄园的规矩和教父的禁忌。(These are the house rules. Mr. Blackwood doesn't tolerate anyone breaking them.)\n▲娜塔莉亚翻看着文件。\n管家（严肃警告）：不要碰庄园里的任何东西，不要擅自离开庄园，不要在庄园游荡，不要妄想勾引教父！(Don't touch anything in the estate. Don't leave without permission. Don't wander around. And don't even think about trying to seduce the Godfather!)\n▲娜塔莉亚握着文件点了点头，管家一步步靠近她，再次警告。\n管家（警告）：最重要的一条，不要靠近地下室。(And the most important rule: stay away from the basement.)\n娜塔莉亚（惊讶）：地下室？【9】(The basement?)\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链。\n【闪回结束】\n▲娜塔莉亚看着管家离开的背影，心中疑惑。\n娜塔莉亚OS：姐姐给的照片中点出的地点会不会是地下室？(Could the basement be where my sister was pointing to in those photos?)\n▲管家的视线随意扫过了不远处的安保。\n管家（冷漠）：随意走动，会被当做入侵者被射杀。(Anyone caught wandering where they shouldn't will be treated as an intruder and shot on sight.)\n▲安保立刻举起枪，子弹上膛，娜塔莉亚浑身僵直。\n管家（命令）：现在立刻回到小姐的房间去。(Get back to Miss Diana's room. Now.)\n\n3-4\n日 内  戴安娜房间\n人物  戴安娜   娜塔莉亚  布拉姆\n▲娜塔莉亚转身进入房间，放下了文件，在华丽的公主房屋内巡视。\n娜塔莉亚（打量）OS：戴安娜的房间里，会不会有姐姐留下的遗物？（翻找柜子）如果有线索就好了！(Is there anything my sister left behind in here? Come on, just one clue... anything!)\n▲戴安娜悄无声息地睁开了一只眼睛盯着娜塔莉亚翻找东西的背影，她偷偷地将枕边的小熊推到了地上。\n▲娜塔莉亚听到声音，吓了一跳，立刻回头。\n娜塔莉亚OS：谁？(Who's there?!)\n▲戴安娜连忙闭上眼睛，娜塔莉亚瞧见玩偶掉地上了，弯腰去捡玩偶。\n娜塔莉亚OS：我必须万分谨慎，不能被布拉姆和塞莱特斯察觉！(I’ve got to be extra careful. I can't let Bram or Celeste catch on to what I’m doing.)\n▲娜塔莉亚捡玩偶时，突然看见床底下有个盒子。\n娜塔莉亚（惊讶）OS：那是什么？(What's that?)\n▲娜塔莉亚趴在地上，伸手去将盒子给拿出来，盒子上刻着名字：玛莉。(MARY)\n娜塔莉亚（惊讶）OS：这是姐姐的遗物吗？【10】(Is this... my sister's? )\n▲娜塔莉亚背对着门，蹲在地上打开盒子想查看里面的东西，盒子里面有个日记本。\n娜塔莉亚（惊讶）：这是，姐姐的日记？(No way... Is this my sister's diary?)\n▲门突然推开了，布拉姆握住一把枪，一步一步靠近娜塔莉亚，最后停在了娜塔莉亚背后。\n布拉姆（冷漠）：你在做什么？(What are you up to?)\n▲娜塔莉亚吓了一跳，猛地回头，目光正对布拉姆手中的枪口！【11】\n\n第四集   \n4-1\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  布拉姆\n▲布拉姆上前一步，枪口对准了娜塔莉亚的额头，娜塔莉亚放下盒子，举起手，镜头特写：床上的戴安娜睫毛颤了一下。\n▲娜塔莉亚盯着眼前黑漆漆的枪口，她故作柔弱的姿态，眼神惶恐地看向了布拉姆。\n娜塔莉亚（低声）：教父……我发誓，我绝对没有半点越界。(Godfather...Please... I swear I didn't do anything I wasn't supposed to.)\n▲娜塔莉亚抬起下巴，一双眼睛颤抖地盯着布拉姆，布拉姆居高临下看着她，嗤笑了一声，枪口从娜塔莉亚的额头，挪到了她的下巴。\n布拉姆（狠辣）：把东西交出来，！笼子里的狼早已饥肠辘辘，别让我抓到你半点可疑的痕迹！(Hand it over. The wolves are starving out there, don't give me a single reason to doubt you.)\n▲娜塔莉亚被迫仰起头，脖子暴露在枪口下，她伸手轻轻握住枪口，用脸颊蹭了一下枪口，又妩媚地抬头看向了布拉姆。\n娜塔莉亚（低声）：别这样，您吓到我了。(Easy... you're scaring me.)\n▲布拉姆眼神震惊，喉结滚动了一下。【12】\n布拉姆（语气放松）：才刚刚进来，就敢勾引我。（上前一步，捏住娜塔莉亚的下巴）你的胆子很大。(Just walked through that door, and already trying to play me? You've got balls.)\n▲娜塔莉亚故作惶恐。\n娜塔莉亚（可怜）：绝无此事。(I would never dare.)\n▲布拉姆打量着娜塔莉亚，用力甩开她下巴，冷声开口。\n布拉姆（冷漠）：别以为这样我就会放过你！（脚尖踢盒子）把盒子打开。(Don't think that flattery gets you off the hook. Open the box.)\n▲娜塔莉亚颤抖着手拿起盒子，打开了盒子里面有一张玛莉遍体鳞伤的照片。\n布拉姆（惊讶）：这是……(What is this...?)\n▲娜塔莉亚观察着布拉姆的表情。\n【闪回衔接3-2】\n▲门突然推开了，布拉姆举着枪进来，娜塔莉亚背对着布拉姆跪在床边上，她从窗户的玻璃上看到了布拉姆的倒影，察觉了布拉姆靠近，她立马取出日记本，丢入床底下，随后将一张玛莉的照片放入盒子里面，合上了盒子。\n【闪回结束】\n▲娜塔莉亚缓缓抬头，布拉姆正在看照片，手指死死握住了照片边缘。\n娜塔莉亚OS：我就知道布拉姆会来，这张照片是我用来测试布拉姆的筹码，我只想知道，他知不知道姐姐遭受的一切？(I knew he'd show. This photo is my litmus test for Bram. I need to know: did he have any idea what my sister went through?)\n▲布拉姆看着照片，又看娜塔莉亚。\n布拉姆（冷漠）：谁允许你触碰屋内的东西的！(Who gave you the right to touch my things?)\n娜塔莉亚（跪在地上）：教父，我只想找出诱发小姐心理创伤的根源！（试探）她会不会是因为看到这些残酷的画面才……(Godfather, I was just trying to trace the root of Miss Diana’s trauma. Could seeing something this graphic...)\n▲布拉姆审视地盯着娜塔莉亚，伸手将照片拿了起来，紧紧捏着照片。\n布拉姆：闭嘴！(Shut up!)\n▲娜塔莉亚观察着布拉姆的表情和手指，试探开口。\n娜塔莉亚：她是谁？对小姐而言，是很重要的人吗？(Who is she? Is she someone important to Miss Diana?)\n▲布拉姆将照片收了起来。\n布拉姆（冷冽）：守好你的本分，不该问的，不要追问。【13】（转身）以后看到类似的物件，第一时间交给我！(Know your place. Curiosity killed the cat. Next time you stumble on crap like this, bring it straight to me.)\n▲布拉姆转身离开了，娜塔莉亚松了口气，坐在了地上。\n娜塔莉亚（看布拉姆的背影）OS：布拉姆的反应说明他对姐姐的遭遇一清二楚，难道是他和塞莱特斯一起害了姐姐？姐姐到底在哪里？(His reaction says it all, he knows damn well what happened to my sister. Did he and Celeste do this together? Where is my sister?)\n\n\n4-2\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚坐在床上，摊开了笔记本，镜头特写：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n玛莉vo：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n娜塔莉亚（疑惑）OS：这些信息未免太直白了，像是刻意引导我发现线索，到底是谁布的局，又想引导我做什么？(Way too convenient. It's like someone's leaving these clues for me. Who's playing puppet master here, and what's their game?)\n【闪回照片】\n▲镜头特写：铁门被铁链包裹的照片。\n【闪回结束】\n娜塔莉亚：铁门是不是指向的地下室？会不会和姐姐有关！我一定要找到照片所在的位置？(Does that iron door lead to the basement? Is that where they kept my sister? I've got to find that exact spot.)\n▲这时，保姆间的门被推开了，娜塔莉亚吓了一跳，连忙将照片藏起来，猛地回头。\n\n\n第五集\n5-1\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚连忙合上笔记本，疑惑地看着戴安娜。\n娜塔莉亚：怎么了？戴安娜小姐？(Everything okay, Miss Diana?)\n▲戴安娜提着小熊站在了门口，她眼神冷冷地看着娜塔莉亚。\n戴安娜（可怜）：我睡不着，你可以陪着我吗？(I can't sleep... Will you stay with me?)\n▲娜塔莉亚立刻起身，蹲在了戴安娜面前，抚摸了一下戴安娜的头发。\n娜塔莉亚（安抚）：别怕，我陪你回房间好吗？(Hey, don't be scared. Let's get you back to bed, okay?)\n▲戴安娜点了点，娜塔莉亚牵着她的手回房间。\n\n5-2\n夜  内  书房外\n人物  娜塔莉亚   戴安娜\n▲娜塔莉亚牵着戴安娜走在走廊上，突然听到书房传来争吵，娜塔莉亚和戴安娜停下步伐，站在了门口，书房里面传来激烈的争吵声。\n布拉姆（冷冽）VO：塞莱特斯，是你把玛莉的照片放在戴安娜的房间里的？(Celeste, was that you? Did you plant Mary's photo in Diana's room?)\n塞莱特斯（愤怒）VO：你凭什么断定是我所为？(And what makes you so damn sure I did it?)\n布拉姆（呵斥）VO：难道不是你想用那些照片恐吓孩子吗？毕竟你一向都不喜欢她！(Cut the crap. Weren't you trying to terrorize the kid? You've always hated her guts!)\n▲戴安娜想要推门，娜塔莉亚捂着她的嘴巴，抱着她往房间走。\n娜塔莉亚（惊愕）OS：难道布拉姆和塞莱特斯在联手掩盖姐姐死亡的真相？(Are they actually teaming up to sweep my sister's murder under the rug?)\n\n5-3\n夜  内   书房内  \n人物   布拉姆\n▲房间里面，只有布拉姆一个人，布拉姆听见外面的脚步声离开，他打开了留声机，留声机传出塞莱特斯的声音。\n塞莱特斯（留声机）：你凭什么断定是我所为？(What makes you so sure I did it?)\n▲布拉姆关上了留声机，给自己倒了一杯红酒。\n布拉姆（摇晃酒杯）：真正的猎人往往以猎物的方式出现，就让猎物彼此撕咬吧（品酒）毕竟真正贵族从不会沾染猎物的血。(The best hunters always disguise themselves as prey. Let them tear each other to pieces. After all... real aristocrats never get their hands dirty.)\n\n5-4\n夜  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚将戴安娜放在床上，戴安娜看着她。\n戴安娜：他们吵架是因为我对不对？(They were fighting over me, weren't they?)\n▲娜塔莉亚轻轻抚摸她的头发。\n娜塔莉亚（温和）：这是成年人的纠葛，与你无关。(That's just adult nonsense. It has nothing to do with you, sweetie.)\n戴安娜（平静）：塞莱特斯并不是我的母亲，对吗？(Celeste isn't my real mom, is she?)\n▲娜塔莉亚惊讶地看着戴安娜。\n娜塔莉亚（故作不知）：您为什么会这么想？(Why would you think that?)\n戴安娜（抱着小熊）：我的母亲很温柔，塞莱特斯来了之后，我就再也没见过她了，爸爸禁止我提起她，我很思念她，她什么时候回来？(My mom was so sweet... After Celeste showed up, she just vanished. Daddy won't even let me say her name. I miss her so much. Do you know when she's coming back?)\n▲娜塔莉亚看着戴安娜。\n娜塔莉亚（怜悯）：她一定会回来的，我向你保证！【14】(She'll be back. I promise.)\n▲戴安娜乖乖盖好被子，乖巧地开口，握紧了娜塔莉亚的手。\n戴安娜：你会一直留下来陪我吗？(Will you stay with me forever?)\n娜塔莉亚（安抚）：如果你爸爸同意的话，我当然会留下来陪你。(If your dad gives the green light, I'd love to.)\n戴安娜（疑惑）：你害怕我爸爸吗？(Are you scared of my daddy?)\n娜塔莉亚（微笑）：我想庄园里的人都对教父心存敬畏。(I think everyone in this house is a bit intimidated by the Godfather.)\n戴安娜（乖巧）：塞莱特斯就不会，还总是和爸爸吵架！(Celeste isn't. She's always fighting with Daddy!)\n▲娜塔莉亚摸了摸戴安娜的头发，温和开口。\n娜塔莉亚（安抚）：吵架？((Fighting?)\n▲戴安娜抬头乖巧地看着娜塔莉亚。\n戴安娜（不解）：对呀，爸爸很喜欢别人崇拜他，塞莱特斯却从不这样，这让他很懊恼。(Yeah. Daddy loves it when people worship him, but Celeste never does. It drives him crazy.)\n▲娜塔莉亚一愣，惊讶地低头看向了戴安娜，戴安娜闭上了眼睛睡觉。\n娜塔莉亚（惊讶）OS：我明白了。布拉姆出身卑微，极度渴望被认可，而出身贵族的塞莱特斯永远给不了他这份崇拜，看来他们也没有传闻那么相爱！(I get it. Bram came from the gutter, so he's desperate for validation. But Celeste is old money, she'll never stroke his ego. They're nowhere near as tight as everyone thinks.)\n\n5-5\n夜  内  楼梯口   \n人物  安保   娜塔莉亚  管家\n▲娜塔莉亚打开门，恰好看到两个安保抬着一具盖着白布的尸体从客厅路过，娜塔莉亚惊讶地捂着了嘴巴，管家不知道什么时候出现在了娜塔莉亚的身后。\n管家：看到了吗？那就是擅闯地下室的下场。(See that? That's what happens when you sneak into the basement.)\n▲娜塔莉亚猛地看向了管家，吓了一跳，管家已经转身离开了。\n娜塔莉亚（看向主卧方向）OS：得先让猎物撕咬起来，我才有机会探查姐姐的下落。(I need them to tear each other apart first. Only then will I have a chance to find out where my sister is.)\n\n\n第六集\n6-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲布拉姆坐在餐桌旁边，一边看报纸，一边喝咖啡，娜塔莉亚穿着一件性感的连衣裙走了过去。\n▲娜塔莉亚将对戴安娜的心理报告放在了布拉姆的面前。\n娜塔莉亚（恭敬）：教父，这是昨夜我针对小姐的行为进行的心理分析，请您过目。(Godfather, here is my psychological assessment of Miss Diana based on her behavior last night. Please take a look..)\n▲布拉姆收起了报纸，看向了娜塔莉亚给的文件，又看了一眼娜塔莉亚，眼神暂停，喉结滚动了一下。\n布拉姆：根据你的分析，我女儿怎么样了？(So, according to your report, how's my daughter doing?)\n▲娜塔莉亚俯身靠近布拉姆，手背蹭着布拉姆的手臂划过，指着文件。\n娜塔莉亚：您看，小姐不敢一个人睡，是因为……(As you can see, she's terrified of sleeping alone because...)\n▲布拉姆目光从文件上娜塔莉亚的手慢慢往娜塔莉亚的身上打量，他像是看货物一样看着娜塔莉亚，布拉姆往后仰，坐在椅子上，手臂搭在椅背上，手背刚刚好在娜塔莉亚的臀部位置，目光也落在了臀部。\n布拉姆（审视）OS：真想把这件碍事的衣服……(I'd love nothing more than to rip that dress right off her...)\n▲娜塔莉亚余光瞥见了布拉姆的目光。\n娜塔莉亚（冷笑）OS：禽兽，这么容易上钩！(Pig. That was almost too easy.)\n▲这时候，娜塔莉亚的余光瞥见塞莱特斯出现在了楼梯口。\n▲娜塔莉亚趁着布拉姆发呆，翻页时候，手臂碰到了牛奶杯，瞬间将牛奶洒到了布拉姆的裤子上。\n布拉姆（回神，惊讶）：你在干什么？(What the hell are you doing?)\n▲娜塔莉亚惊慌失措，蹲下用纸巾给布拉姆擦拭裤子，她的衣领开得很低，胸贴近布拉姆的大腿。\n娜塔莉亚：教父，请把裤子脱下来交给我，我替您清洗吧。(Godfather, please let me take your pants off. I'll get them cleaned right away.)\n▲布拉姆目光扫过了娜塔莉亚的脸和她的胸口，喉结滚动了一下。【15】\n布拉姆（嗤笑）：脱下来？（指尖划过娜塔莉亚的脸）你的野心倒是毫不掩饰。（松开娜塔莉亚）你这招，对别的男人或许很有效，可我不吃这一套！(Take them off? You're not even trying to hide your ambition, are you? That little show might work on other guys, but I don't buy it.)\n▲娜塔莉亚微微躲避，低下头去。\n娜塔莉亚（紧张）：先生，我并没有这个意思，我只是……我仰慕您很久了，您强大，睿智，是无数人仰望的对象，我由衷地敬佩您。(Sir, please, that's not what I meant. I just... I've looked up to you for so long. You're powerful, brilliant, a man everyone reveres. I genuinely admire you.)\n▲布拉姆愉悦地笑了，指腹擦过了娜塔莉亚的嘴角。\n布拉姆（笑）：嘴可真甜。(You've got quite a silver tongue, haven't you?)\n▲这时，塞莱特斯来到了餐厅，桌子挡住了视线，她看到布拉姆坐在椅子上，娜塔莉亚蹲在布拉姆的面前，举止不雅，顿时误会了。\n塞莱特斯（呵斥）：你们在干什么？【16】(What on earth is going on here?!)\n\n第七集\n7-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲娜塔莉亚听到声音，眼中划过了一丝兴奋。\n娜塔莉亚（高兴）OS：好戏开场了！(And... showtime!)\n▲娜塔莉亚故作慌乱起身，手中拿着纸，布拉姆的裤子上还有牛奶的痕迹。\n娜塔莉亚：夫人……事情并非您所想的那样……(Ma'am... please, it's not what it looks like!)\n▲塞莱特斯大步流星地走过来，一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯（呵斥）：不知廉耻，竟敢勾引我的丈夫，立刻滚庄园！(You shameless little whore! How dare you seduce my husband! Get the hell out of my house!)\n▲娜塔莉亚捂着脸，委屈地看着布拉姆。\n娜塔莉亚（可怜）：夫人，难道崇拜教父也是过错吗？（不屈）难道他不配得到别人的仰慕吗？(Ma'am, is it such a sin to admire the Godfather? Doesn't a man like him deserve to be revered?)\n▲布拉姆听到这句话，脸色阴沉。\n塞莱特斯（愤怒）：你——(You-)\n▲塞莱特斯举起手要打娜塔莉亚，被布拉姆拦住了。\n布拉姆：塞莱特斯！请你克制你的行为！(Celeste! That's enough!)\n塞莱特斯（呵斥娜塔莉亚）：滚出去！立刻滚——(Out! Get the hell out-)\n▲塞莱特斯还想对娜塔莉亚动手，但是被布拉姆拦住了。\n布拉姆（呵斥）：塞莱特斯！你简直越来越不可理喻了，看来你需要接受心理治疗了！(Celeste! You are losing your mind! Maybe it's time you saw a psychiatrist!)\n塞莱特斯（惊愕）：你认为我疯了？既然你现在这么厌恶我，为什么不跟我离婚？(You think I'm crazy? If I disgust you so much, why don't you just sign the divorce papers?!)\n▲ 众人震惊，娜塔莉亚不动声色看向了塞莱特斯。\n娜塔莉亚（惊讶）OS：离婚？塞莱特斯想离开布拉姆？(Divorce? Celeste actually wants out?)\n▲布拉姆一把抓住了塞莱特斯的手腕，压下了情绪。\n布拉姆（深呼吸）：抱歉，（握住梅菲斯特的手）塞莱特斯，你先上楼，（目光看娜塔莉亚）我会处理她。(I'm sorry. Celeste, head upstairs. I'll handle her.)\n▲塞莱特斯眼神愤怒，甩开布拉姆的手。\n塞莱斯特（呵斥）：离婚！(I want a divorce!)\n▲布拉姆神情冷漠了几分，看了一眼远处的女佣。\n布拉姆（深呼吸）：来人，夫人需要休息，送夫人回房间！(Guards! Madam needs some rest. Escort her back to her room!)\n▲两个女佣上前搀扶塞莱特斯，塞莱特斯甩开女佣。\n塞莱特斯（呵斥）：别碰我，我自己会走！(Get your hands off me! I can walk!)\n▲塞莱特斯和娜塔莉亚擦肩而过的时候，她看了一眼娜塔莉亚，低声开口。\n塞莱特斯（嘲笑）：你会后悔你所做的一切的——（放慢语速）娜塔莉亚！【17】(You are going to pay for every single thing you've done... Natalia.)\n▲娜塔莉亚擦了一下脸上的泪，无辜开口。\n娜塔莉亚：我不知道您在说什么。(I... I have no idea what you're talking about.)\n▲塞莱特斯冷哼了一声，走了，娜塔莉亚盯着塞莱特斯的背影。\n娜塔莉亚OS：塞莱特斯为什么会提出离婚？这太反常了，她是想离开布拉姆还是想威胁布拉姆将我赶走？(Why is Celeste bringing up divorce now? Something's off. Is she genuinely trying to leave him, or is this just a power play to get me kicked out?)\n▲布拉姆突然伸手扶着娜塔莉亚的腰，捏了一下她的腰，娜塔莉亚猛地回头看向了布拉姆，布拉姆靠近她。\n布拉姆（低声）：敢当着塞莱特斯的面儿勾引我？我很欣赏你的胆量。（故意提高声音警告）但，我不希望再有下次！(Seducing me right under Celeste's nose? You've got guts. I'll give you that. But don't let there be a next time.)\n▲说完之后，布拉姆的目光在娜塔莉亚捏着纸巾的手上掠过，随后转身离开了，娜塔莉亚瞧着布拉姆的背影，倒了一杯牛奶，慢慢品尝。\n娜塔莉亚OS：不希望有下次？还是希望下次快点到来？布拉姆先生！【18】 (Don't want a next time? Or can't wait for it... Mr. Bram?)\n\n\n第八集\n8-1\n日  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚在桌子上画画，画上面是一扇门，门上缠着铁链。\n娜塔莉亚（惊讶）OS：缠着铁链的门——(A door bound in heavy chains...)\n▲娜塔莉亚压下了心中的震惊。\n娜塔莉亚（故作好奇）：天啊，这张画画得真好，充满了神秘色彩。（摸戴安娜的头）您见过，还是直接想象出来的？(Sweetheart, what a beautiful drawing! It looks so mysterious. Did you actually see this somewhere, or did you just make it up?)\n戴安娜（乖巧）：这是我们家的地下室啦～(That's our basement!)\n娜塔莉亚（惊讶）：地下室——(The basement...?)\n▲戴安娜像是突然反应了过来一样，立刻将画藏了起来。\n戴安娜（竖起手指）：嘘，千万不要告诉爸爸哦～(Shh... Promise you won't tell Daddy!)\n▲娜塔莉亚弯着腰，故意捂着眼睛逗戴安娜。\n娜塔莉亚（温和）：好哦，那我就当作什么都没有看见。(Cross my heart. I didn't see a thing.)\n▲戴安娜一瞧，开心地笑了起来，她顺手将画压在了画纸下方，拿出了另外一张画给娜塔莉亚看。\n戴安娜：你看，这是我画的妈妈！(Look! I drew Mommy!)\n▲娜塔莉亚盯着画，上面是一幅简笔画，一个女人抱着一个孩子，手背上和手腕上都有一道伤痕。\n娜塔莉亚（惊讶）OS：上帝啊，那是什么？(My God... what are those scars?)\n▲戴安娜没发现娜塔莉亚的情绪，看着画，充满怀念地开口。\n戴安娜（叹气）：我真的很想念妈妈。(I miss Mommy so much...)\n▲娜塔莉亚愣了一下，轻轻将戴安娜护在怀中。\n娜塔莉亚：你的妈妈也同样牵挂着你，如果你过得痛苦，她会万分难过，我们先好好休息，好吗？(Your mommy misses you just as much. Seeing you hurting like this would break her heart. Let's get some sleep, okay?)\n戴安娜：你能给我唱睡眠曲吗？妈妈以前经常唱给我听。(Will you sing me a lullaby? Mommy used to sing to me all the time.)\n▲娜塔莉亚将戴安娜抱在怀中，轻轻拍着她的后背，唱起了睡眠曲。引用国外歌曲：《Baby's Bed A Silver Moon》\n娜塔莉亚：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n▲戴安娜闭着眼睛小声地说。\n戴安娜（低声）：你唱的歌和妈妈唱的一样。(You sound just like Mommy...)\n▲娜塔莉亚低头看着怀中的戴安娜笑，眼睛却红了。\n【闪回】\n8-2\n日 内  平民屋老房子\n人物 玛莉  娜塔莉亚\n▲小玛莉将小娜塔莉亚抱在怀中，娜塔莉亚抬头就能看到姐姐温柔的笑容，玛莉拍着她的后背，用稚嫩的声音唱安睡曲。\n小玛莉（拍背）：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n\n【闪回结束】\n▲小玛莉稚嫩的歌声和娜塔莉亚的歌声重叠。\n娜塔莉亚（哽咽）：飘啦飘啊宝贝，跨过千山万水。(Sail away, my little one, over mountains and streams...)\n▲一滴泪顺着娜塔莉亚的脸颊滴在戴安娜的脸上，娜塔莉亚连忙擦泪，低头一看，戴安娜已经睡着了，娜塔莉亚低头轻吻她额头。\n娜塔莉亚（坚定）OS：睡吧宝贝，小姨一定会找到你的母亲！【19】(Rest easy, my sweet girl. Auntie will bring your mother home.)\n\n8-3\n夜  内   走廊/地下室\n人物 娜塔莉亚  塞莱特斯\n▲走廊上，配着枪的安保在巡逻。\n安保：教父有令，不许任何人夜里在庄园内随意走动。(By order of the Godfather, no one wanders the grounds after dark.)\n▲娜塔莉亚躲在拐角的阴影处，安保走远后，她才出来，迅速走向了地下室的入口。\n▲娜塔莉亚不敢开灯，摸索着往前走。\n娜塔莉亚OS：地下室到底锁着什么东西？这东西会和姐姐有关吗？戴安娜难道是看到了地下室的东西才病了的？(What is he hiding down there? Is Mary behind that door? Is that what traumatized Diana?)\n▲她摸索着到了地下室门口，月亮冰冷地落在了门上，门上缠着铁链子，挂着锁，突然地下室里面传来了微弱的响动。\n（女声，模糊，微弱）vo：救救我……（非常模糊，难以判断）(Help... me...)\n娜塔莉亚（惊讶，拍门）：你是谁？(Who's in there?!)\n（女声，微弱）：我是……(I’m...)\n▲娜塔莉亚上前查看，突然一只手拍了一下。\n娜塔莉亚（惊恐）OS：是谁！【20】(Who's there?!)\n▲娜塔莉亚僵硬地转身，塞莱特斯穿着睡裙，披头散发站在她身后。\n塞莱特斯（声音冰冷）：我知道你是谁，也知道你潜入布莱克伍德庄园的目的。(I know who you really are... and exactly why you infiltrated the Blackwood estate.)\n▲娜塔莉亚吓了一跳，后退了一步靠在门上，塞莱特斯步步逼近。\n塞莱特斯：我给过你逃离的机会，既然你执意入局，就别怪我心狠手辣——(I gave you a way out. But since you insist on playing with fire, don't blame me for burning you alive.)\n▲娜塔莉亚盯着塞莱斯特，突然笑了一声。\n娜塔莉亚：塞莱特斯，是你引我来地下室的，我们不是敌人，对吗？(Celeste, you left those breadcrumbs to lead me here. We're on the same side... aren't we?)\n▲塞莱特斯震惊！【21】\n一卡\n\n第九集\n9-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯\n▲娜塔莉亚靠在门上，塞莱特斯一步一步逼近，地下室楼梯口偶尔有人影闪过。\n娜塔莉亚（警惕地看楼梯间）：夫人是想有话直说，还是等布拉姆发现我们？（Cut to the chase, or are you waiting for Bram to catch us?）\n▲塞莱特斯突然一把抓住了娜塔莉亚的手。\n塞莱特斯（一字一句）：救救我，娜塔莉亚！布拉姆想要除掉我！（Help me, Natalia! Bram is going to kill me!）\n娜塔莉亚（震惊）\n▲娜塔莉亚后退了半步，惊愕地看着塞莱特斯。\n娜塔莉亚OS：我猜对了，塞莱斯特想离开布拉姆！可她为什么要向我求救？（I was right. She’s trying to ditch Bram. But why come to me?）\n▲娜塔莉亚故作不解地看着塞莱特斯。\n娜塔莉亚（惊愕）：教父明明十分爱您，怎么会想除掉你？（The Godfather clearly loves you. Why would he want you dead?）\n▲塞莱特斯用力摇头。\n塞莱特斯（绝望）：你们都被骗了！那都是他的精心伪装的假面！他根本就不爱我！（You’ve all been played! It’s all an act. He doesn't love me at all!）\n娜塔莉亚（警惕）：夫人，您遇到危险，应该向您的家人求助，而不是我这个外人。（Ma'am, if you're in danger, go run to your family, not an outsider like me.）\n塞莱特斯（苦笑）：这座庄园守卫深严，我根本无法逃布拉姆的掌控，我也曾向我父母求救，可我身上没有伤痕，他们只认为是我无理取闹！（This place is a fortress, I can't get away from him. I tried begging my parents, but since there are no bruises on my skin, they just think I'm losing my mind.）\n▲塞莱特斯看向了楼梯口，楼梯口偶尔闪过巡逻的身影。\n塞莱特斯（悲伤）：没有人相信完美丈夫的面具下是禽兽。（激动地抓住娜塔莉亚的手）求你帮帮我！（Everyone thinks he's the perfect husband. No one believes me when I tell them what he's really like. Please, you have to help me!）\n▲娜塔莉亚观察着塞莱特斯的表情和发抖的身体。\n娜塔莉亚OS：她说的是真的？还是在试探我？这太冒险了……（ Is she telling the truth? Or testing me? Way too risky...）\n▲娜塔莉亚掰开塞莱特斯的手，准备离开。\n娜塔莉亚：夫人，这些话，我就当没听过！我得离开这里了，如果被教父发现，我会死的……（Ma'am, let’s just pretend this conversation never happened. I gotta go. If the godfather catches me, I'm dead meat...）\n▲塞莱特斯抹了一把眼泪，盯着娜塔莉亚的背影，突然开口。\n塞莱特斯：你的原名叫作苏丽娅，是玛莉的妹妹，八岁被焦恩收养改名娜塔莉亚！你潜入这里是为了寻找玛莉失踪的真相！（Your real name is Surya, Mary’s little sister. John adopted you when you were eight and made you Natalia! You didn't just stumble in here; you're hunting for the truth about Mary!）\n▲娜塔莉亚惊呆了，猛地回头看向了塞莱特斯。\n\n\n第十集\n10-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲娜塔莉亚惊讶地看着塞莱特斯。\n娜塔莉亚：夫人，我并不知道您在说什么，我也不认识玛莉——（Ma'am, I don't know what you're talking about. I have no idea who Mary is-）\n▲塞莱特斯拿出一张照片递给娜塔莉亚，光线昏暗，娜塔莉亚低头看着那张旧照片，上面是小时候的娜塔莉亚和小玛莉还有爸爸妈妈的全家福。\n娜塔莉亚（惊愕）：这张照片怎么在你这里！（where did you get this?）\n▲塞莱特斯走向娜塔莉亚，将照片递给她。\n塞莱特斯：布拉姆很懂怎么让女人为他着迷，一年前我就是这样上钩的。得知他有妻子时，我嫉妒得发疯，只想把他抢过来——他太享受这种被争夺的感觉了。（Bram has a way of wrapping women around his finger. That’s how he reeled me in a year ago. When I found out he was married, I went green with envy. I wanted him all to myself- and he thrives on women fighting over him.）\n▲娜塔莉亚死死握着照片。\n娜塔莉亚（愤怒）：所以你就绑架了我的姐姐？（So you're the one who snatched my sister?）\n塞莱特斯（摇头）：我没有！我只是想给她一笔钱让她离开的！我曾派人调查玛莉，发现她这一生太苦太惨，我不想毁了她好不容易得来的安稳生活。（I didn't! I just wanted to buy her off so she’d walk away. I had her background checked, her life had already been a nightmare. I didn't want to screw up the peace she finally managed to build.)\n▲塞莱特斯抚摸着地下室的铁锁，缓缓转头看向了娜塔莉亚。\n塞莱特斯（哽咽，恐惧）：我放弃了接近布拉姆，可没多久，她就失踪了，尸骨无存！连警方也找不到！（I gave up on Bram. But not long after, she vanished. Even the police couldn't find her!）\n娜塔莉亚（惊讶）：什么？（What?）\n塞莱特斯（看向地下室）：没有人知道她去哪儿了……（No one knows where she went...）\n▲娜塔莉亚审视地看着地下室的门，目光又慢慢挪回塞莱特斯。\n娜塔莉亚（惊愕）：她是不是在这里面？（Is she locked down in there?）\n塞莱特斯（摇头）：我不知道，每一个靠近地下室的人不是死亡就是失踪了……（I don't know. Everyone who gets close to the basement either dies or disappears...）\n▲娜塔莉亚盯着地下室的门，后退了半步。\n娜塔莉亚（审视）：那你现在告诉我这些的目的是什么？（So why are you telling me this now?）\n▲塞莱特斯紧紧抓住娜塔莉亚的手臂。\n塞莱特斯：我怀疑是布拉姆杀了他们！我也试图解开地下室的秘密，布拉姆现在的目标肯定是我，你也靠近了，下一个就是你了！只有我们联手，才有机会逃离魔爪——（Because I'm betting Bram is the one who got rid of them! I tried digging into this basement myself. Now I'm sitting in his crosshairs, and since you've been sniffing around too, you're next on his hit list! Team up with me, or we're both dead.）\n娜塔莉亚（试探）：是你引我来地下室的？你想让我跟你绑在一起？（So you set me up? You dragged me into this just to use me as your shield?）\n塞莱特斯（绝望）：娜塔莉亚，别怪我，（捂着脸）我实在没有办法了，我不想死！（Natalia, don't blame me. I have no choice. I don't want to die!）\n娜塔莉亚（看向地下室的门）：那你想让我怎么做？（Then what do you want me to do?）\n塞莱特斯（坚定）：我需要你去勾引布拉姆！（I need you to seduce Bram!）\n▲娜塔莉亚惊讶，她还没来得及详细询问，突然一束光打在了两个人的脸上，两个人惊恐地抬头看向了楼梯口。\n▲布拉姆阴沉着脸，拿着手枪，带着配枪的安保，站在楼梯口。\n布拉姆（冷冽）：你们在这里干什么？（What do we have down here?）\n\n\n第十一集\n11-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲安保的枪口对准了娜塔莉亚，布拉姆一步一步走向了娜塔莉亚和塞莱特斯，娜塔莉亚和塞莱特斯几乎都是紧张地后退了半步，娜塔莉亚连忙将照片藏在了袖子里面。\n▲布拉姆一挥手，两个安保抓住一个男人过来，男人表情惊恐。\n男人：教父，我错了！我真的错了！（Godfather, I was wrong! I'm sorry!）\n布拉姆（子弹上膛）：无视我的规矩，窥探庄园的秘密，就要付出代价。（Break my rules, nose around my estate, and you pay with your life.）\n▲布拉姆的枪抵在了男人的肩膀上。\n男人：教父，求求您放过我吧，我没有想窥探您的秘密，我……（Godfather, mercy! I swear I wasn't snooping around! I—）\n▲娜塔莉亚想说话，塞莱特斯在黑暗中抓住了她的手示意她别开口。\n▲布拉姆表情冷漠，枪响，男人的尖叫声响起，娜塔莉亚捂着耳朵尖叫了一声，靠在墙上惊恐地看着男人被打穿了肩膀躺在地上哀号。\n布拉姆（抬手）：把人拖走，别惊扰了我的夫人，（视线落在了娜塔莉亚身上）还有尊敬的娜塔莉亚小姐。（Drag him away. We wouldn't want to upset my wife... or our lovely Miss Natalia.）\n▲安保将受伤的男人拖走，血流了一地，娜塔莉亚和塞莱特斯几乎不敢喘气，娜塔莉亚瞥了一眼塞莱特斯。\n布拉姆（看了一眼地下室的门）：你们来这里做什么？（So... what brings you two down here?）\n▲塞莱特斯被地上的鲜血刺激得后退了一步，娜塔莉亚看向她。\n娜塔莉亚OS：塞莱特斯夫人，如果你出卖我的话，就别怪我不客气了——（Throw me under the bus, Celeste, and I swear I'm taking you down with me—）\n▲塞莱特斯突然猝不及防的扇了娜塔丽亚一耳光。\n塞莱特斯：贱人！你竟敢污蔑我？（You bitch! How dare you set me up?）\n▲娜塔莉亚猛地抬头看向了塞莱特斯，眼神错愕。\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n\n\n第十二集\n12-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n塞莱特斯：贱人！你竟敢污蔑我梦游？还把我带到这个鬼地方，分明是想害我！（You bitch! How dare you lie and say I was sleepwalking?! You dragged me down to this hellhole to get me killed!）\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n布拉姆：是吗？敢污蔑我的夫人！（Is that so? You dared to frame my wife!）\n▲娜塔莉亚盯着塞拉特斯的脸，二人对视，仿佛空气都凝固了。\n娜塔莉亚（恢复镇静）：教父，夫人的确是梦游了！请相信我的专业判断。（Godfather, she really was sleepwalking. You have to trust my professional judgment.）\n塞莱特斯（愤怒）：胡说，你颠倒黑白，污蔑我有病，是不是想取代我的位置！（Bullshit! You're twisting the truth, trying to make me look crazy! You just want to take my place!）\n娜塔莉亚：夫人，地下室是禁地，如果您不是梦游，来地下室干什么？如果不是梦游，您有手有脚，又怎么会听我指挥？我只是怕您有危险，所以跟到了这里。（Ma'am, the basement is strictly off-limits. If you weren't sleepwalking, what were you doing down here? And why did you follow me without a word? I only came down because I was worried about your safety.）\n▲娜塔莉娅拨开布拉姆的枪，魅惑的看着布拉姆。\n娜塔莉娅：教父，您觉得我说的对吗？（Godfather, don't you think I'm right?）\n▲布拉姆冷眼盯着塞莱特斯和娜塔莉亚，塞莱特斯连忙抱住了布拉姆的手臂，疾言厉色地开口。\n塞莱特斯：布拉姆，她是在污蔑我！（看保安）保安，把这个女人驱逐出去！（Bram, she's framing me! Guards, throw this woman out!）\n▲保安目光看布拉姆，没有动，布拉姆的表情松动，拍了拍塞莱特斯的手。\n布拉姆：塞莱特斯，冷静点儿，我会请最权威的精神科医生医生来对你进行评估。（看保安）带夫人去休息。（Celeste, calm down. I'll have the best psychiatrist come take a look at you. Take my wife to rest.）\n塞莱特斯（故作惊讶）：我才是你的妻子！你宁愿相信这个外来者也不相信我？（I'm your wife! You’re taking the word of a stranger over mine?）\n布拉姆（呵斥）：回去休息！（Go rest!）\n▲塞莱特斯惊愕，布拉姆拍了拍塞莱特斯的肩膀放缓了语气。\n布拉姆（安抚）：亲爱的，我这都是为了你好，快去休息吧。（Sweetheart, I'm doing this for your own good. Now go get some sleep.）\n▲塞莱特斯和娜塔莉亚对视了一眼。\n▲塞莱特斯气冲冲地离开了，布拉姆转了一圈手枪，用枪挑起娜塔莉娅的下巴。\n布拉姆（威胁）：娜塔莉亚，我的宝贝，告诉我，你来地下室的真正目的。（Natalia, my sweet... now tell me the real reason you're down here.）\n\n第十三集\n13-1\n夜  内   地下室\n人物 娜塔莉亚  布拉姆   安保若干 \n▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。\n娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！（Bram doesn't buy our story. Better to admit part of it than keep hiding.）\n▲娜塔莉亚盯着布拉姆的眼睛，突然上前一步，抱住了布拉姆。\n娜塔莉亚（故作惊恐）：教父！请原谅我！是我趁她梦游，故意把她引到了这里。（Godfather, please forgive me! I knew she was sleepwalking, so... I intentionally led her down here.）\n▲布拉姆惊讶地低头看着娜塔莉亚的，他放下了枪，抚着娜塔莉亚的后背开口。\n布拉姆（惊讶）：你故意的？（You did it on purpose?）\n娜塔莉亚（握拳）：是的，我只是个医生，不是她的佣人，可她却当众掌我嘴，我只想给她一个小小的教训！（Yes. I'm just a doctor, not her maid, but she slapped me in public. I just wanted to teach her a little lesson!）\n▲布拉姆盯着娜塔莉亚的模样，勾起嘴角。\n布拉姆OS：有趣，聪明，但也仅仅是个猎物！（Spicy, and sharp. But still just a mouse playing with a cat.）\n▲布拉姆挑眉，指尖划过了娜塔莉亚的脸颊。\n布拉姆（试探）：那你恨吗？想不想将她踩在脚下？（So do you hate her? Want to grind her into the dirt?）\n▲布拉姆话音落下，娜塔莉亚听到了子弹上膛的声音，娜塔莉亚扫了一眼那些枪口，格外紧张，心跳加速。\n娜塔莉亚（抬头看向布拉姆）：我不是神，当然会恨夫人。（愤恨）但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。（I’m no saint, so yeah, I despise her. But what really pisses me off is this rigged system. I hate the elite, even while I’m dying to have everything they’ve got.）\n▲布拉姆盯着娜塔莉亚，布拉姆突然推开娜塔莉亚，举起枪，对准了娜塔莉亚的额头。\n布拉姆：这番话，足以让你丧命！（Those words could get you killed!）\n▲娜塔莉亚不为所动，她伸出手轻轻抚摸着布拉姆的脖子，从他的肩膀抚摸到他的心口。\n娜塔莉亚（坚定）：但我说的都是真话！（放软声音）教父，难道您不恨他们吗？（But I'm telling the truth! Godfather, don't you hate them too?）\n▲布拉姆突然笑了，轻轻鼓了鼓掌。\n布拉姆（欣赏）：很好，我欣赏敢于坦诚欲望的人。（抚摸娜塔莉亚的肩膀）但你的目的远不止这些吧。（Good. I admire people who are honest about their desires. But your goal is more than that, isn't it?）\n▲娜塔莉亚惊愕地看着布拉姆，二人对视，娜塔莉亚紧张了起来。\n娜塔莉亚（紧张）OS：塞莱特斯都能查到我的身份，布拉姆会知道吗？（握拳）豁出去了！（ Celeste found out who I am. Does Bram know? Screw it!）\n▲娜塔莉亚山前一步，指尖轻轻揭开了布拉姆衣服的扣子，布拉姆一把抓住了娜塔莉亚的手。\n布拉姆（警惕）：你想干什么！（What do you want?）\n▲娜塔莉亚垫脚靠近布拉姆的耳朵，手从他的胸口滑落到腹部，腰部，最后勾住了他的皮带。\n娜塔莉亚（妩媚）：教父，我曾远远见过您一次，便深深爱上了您！我进入庄园，都是为了您呀。（Godfather, I saw you once from a distance, and I fell for you. I came into this estate for you.）\n▲布拉姆一惊，喉结滚动了一下，目光掠过娜塔莉亚的脸颊和脖子。\n布拉姆OS：这个妖精，真想把她绑起来，玩个痛快！可惜现在还不到时候！（What a seductive little vixen. God, I want to break her. But the game’s just getting started.）\n▲布拉姆一把抓住了娜塔莉亚的手，阻止她的动作。\n布拉姆（故作冷漠）：够了！回你的住处去，记住，不要试图窥探这里的秘密，它会让你死的很惨！（Enough! Go back to your room. And remember—don't dig into this place's secrets. It'll get you killed.）\n▲娜塔莉亚连忙低下头去，绕过了布拉姆，提着裙摆上楼了，她回头看了一眼地下室的铁门上的锁。\n【闪回】\n13-2  （衔接10-1）\n夜  内   地下室门口\n人物  娜塔莉亚   塞莱特斯\n▲塞莱斯特抓住娜塔莉亚的手。\n塞莱特斯（情绪激动）：我需要你去勾引布拉姆！只要你帮我，我就告诉你地下室的钥匙在哪儿！（I need you to seduce Bram! Help me, and I'll tell you where the basement key is!）\n▲娜塔莉亚看了一眼锁，又看向了塞莱特斯。\n娜塔莉亚：我可以答应你！钥匙在哪儿？（I'll do it. Where's the key?）\n塞莱特斯（紧张）：是一把纯金的钥匙，就在布拉姆身上！（It's a solid gold key. and Bram keeps it right on him!）\n【闪回结束】\n▲娜塔莉亚不动声色地将目光从地下室门口，挪到了布拉姆的身上，布拉姆正烦躁地揭开了衬衣上面的三颗扣子，一道金色光芒在他衣服里面一闪而过。\n娜塔莉亚（惊讶）OS：那是钥匙吗？（坚定）我一定会取得布拉姆的信任，拿到地下室的钥匙，救出姐姐！（Was that it? The key? Watch your back, Bram... I'll win your trust, steal it, and tear this hellhole apart to save my sister.）\n13-2\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯站在窗前，忐忑地看着夜色。\n塞莱特斯（紧张）OS：都这么久了，希望娜塔莉娅没出什么危险。（It's been so long. I hope Natalia's okay.）\n▲这时，布拉姆推开了塞莱特斯的房间门，塞拉特斯被吓了一跳，他穿着睡衣，脸上带着温和的笑容。\n布拉姆（步步靠近）：塞莱特斯，这个世界上，唯有我最爱你。你应该牢记这一点。（Celeste, in this world, no one loves you like I do. Remember that.）\n▲塞莱特斯一步一步后退，布拉姆将她抵在了墙上。\n塞莱特斯：布拉姆！你想干什么？（Bram! What do you want?）\n▲布拉姆将一个盒子递给了塞莱特斯。\n布拉姆（笑）：但愿这里面的东西，能让你认清现实。（I hope this helps you see reality.）\n\n\n第十四集\n14-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n▲塞莱特斯脸色发白，紧紧握着裙摆，录音笔还在响。\n娜塔莉亚vo：但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。..(What really pisses me off is this rigged system. I hate the elite—even while I’m dying to have everything they’ve got.）\n▲布拉姆的手指拂过塞莱特斯的脸颊。\n布拉姆（蛊惑）：听见了吗？她恨你，她嫉妒你的出身，她想毁了你。只有我才能保护你！（Hear that? She hates you. She's jealous of your bloodline. She wants to destroy you. Only I can protect you!）\n▲塞莱特斯盯着录音笔，握紧了拳头。\n塞莱特斯OS：娜塔莉亚已经出卖了我？（Did she just throw me under the bus?）\n布拉姆（语气温和）：告诉我，她是怎么样蛊惑你的？（轻轻拥抱塞莱特斯）我会保护你不被伤害。（Now, tell me... how did she get into your head? Trust me, I'll keep you safe.）\n▲塞莱特斯心跳加速，她盯着录音笔，噗嗤一声笑了。\n塞莱特斯（骄傲地抬头）：我出身贵族，觊觎我身份的人太多了，她们嫉妒我、羡慕我，想害我，我习惯了。（I was born noble. So many people want my place. They're jealous, envious, out to hurt me. I'm used to it.）\n▲布拉姆脸上的温和瞬间消失了，他推开塞莱特斯，将录音笔狠狠摔在了地上，塞莱特斯被布拉姆突然变脸吓得捂住了耳朵。\n布拉姆（训斥）：你太狂妄自大了！你的傲慢会招来杀身之祸，唯有我可以庇护你！（You're too arrogant! Your pride will get you killed. Only I can shelter you!）\n▲布拉姆扯下她捂着耳朵的手，靠近她的耳朵。\n布拉姆（质问）：告诉我，你为什么要去地下室！你是不是也想知道里面有什么？（Tell me, why did you go to the basement? You want to know what's in there too, don't you?）\n▲塞莱特斯惊恐。\n塞莱特斯（抬头盯着布拉姆）：不不不——我不知道！是……是娜塔莉亚陷害我！（No, no, no—I don't know! It's... Natalia framed me!）\n▲布拉姆狠狠将塞莱特斯甩在了床上。\n布拉姆（拿出枪）：很好！（上膛）那我现在就去杀了她。（Good. Then I'll go kill her right now.）\n▲布拉姆举着枪大步流星地往外走，塞莱特斯吓坏了，连忙喊道。\n塞莱特斯：不，不是——我说实话！（No, wait—I'll tell the truth!）\n14-2\n夜  内  走廊\n人物  娜塔莉\n▲娜塔莉亚站在门口，耳朵贴在了门上。\n塞莱特斯vo：不，不是——我说实话！（No, wait—I'll tell the truth!）\n▲塞莱特斯的声音从门内传来，娜塔莉亚惊讶地猛地捂住了嘴巴。\n\n\n第十五集\n15-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆猛地回头，用枪挑起了塞莱特斯的下巴。\n布拉姆：那是什么？（威胁）你想背叛我？（What was that? You want to betray me?）\n▲塞莱特斯额头上冒出冷汗，颤抖地开口。\n塞莱特斯：是因为她白天勾引你，所以我故意装梦游，引她去地下室，我想要杀了她！（Because she seduced you today, I pretended to sleepwalk and lured her to the basement. I wanted to kill her!）\n▲布拉姆的表情松动了半分，布拉姆收了枪，轻轻抚摸着塞莱特斯的头发。\n布拉姆（温和）：我很高兴你如此在乎我。（Good. I do love it when you get jealous.）\n▲塞莱特斯颤抖了一下，布拉姆的脸上露出了笑容轻吻了她的额头\n布拉姆：放心，我只爱你一个人，不会被其他女人蒙骗。（Don't worry. I only love you. I won't be fooled by other women.）\n▲布拉姆将塞莱特斯搂在怀中，看着窗户上的影子，嗤笑了一声。\n布拉姆OS：竟然学会了互相掩护。（抚摸塞莱特斯的背影）当你不想让我杀了她的时候，你就已经露出了破绽。（Covering for each other now, are we? The second you stepped in to save her neck, you blew your cover.）\n▲布拉姆将塞莱特斯推到在了床上，开始脱衣服。\n布拉姆（解开皮带，放在手中把玩）：塞莱特斯，你能依靠的只有我一个，你会听话对吗？（Celeste... I'm all you've got in this world. You're gonna be a good girl for me, aren't you?）\n▲塞莱特斯看着浑身发抖，连忙后退，她拼命地摇头。\n塞莱特斯（颤抖求饶）：布拉姆，我，我身体不太舒服，我不想……（Bram, I... I don't feel well. I don't want to...）\n▲布拉姆一把抓住了塞莱斯特的手，眼神凶狠，撕开了她的上衣。\n布拉姆（故作温和）：拒绝我，你以前不是很喜欢我的占有吗？（Saying no to me? You used to crave it when I took control.）\n▲塞莱斯特惊慌失措，想挣扎，布拉姆突然松开她，捂住了她的嘴巴。\n布拉姆（警告）：嘘——有老鼠偷听。（Shh... we have a little eavesdropping rat outside.）\n▲布拉姆手中的手枪上膛，一步一步走向了门口。\n▲切镜。\n▲走廊上，娜塔莉亚正靠在门口听里面的动静，这时，门突然开了，布拉姆手中的枪突然抵在了娜塔莉亚的脑袋上。\n▲娜塔莉亚震惊。\n\n\n第十六集\n16-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚抬头看着布拉姆，布拉姆上半身的衬衣敞开着，他的一只手拿枪口抵着娜塔莉亚的脑袋，一只手关上了门，冷眼看着娜塔莉亚。\n布拉姆（深呼吸）：你在这儿干什么？我不是让你回房间吗？（What are you doing here? Didn't I tell you to go back to your room?）\n▲娜塔莉亚打量着布拉姆的样子，握紧了拳头。\n娜塔莉亚OS：看来我坏了他的好事——（Guess I ruined his little fun—）\n▲娜塔莉亚上前一步，轻轻抚摸着布拉姆裸露的胸膛。\n娜塔莉亚（撒娇）：教父，我不想你和夫人发生关系，我想……（Godfather... I couldn't stand the thought of you touching her. I want... ）\n▲布拉姆一惊，握着手枪的手放了下去，娜塔莉亚的手在布拉姆的身上随意地抚摸了起来。\n娜塔莉亚（着急）OS：钥匙到底在哪儿！（Where the hell is the key?）\n▲布拉姆突然一把抓住了娜塔莉亚的手，眼神带着侵略性地落在了娜塔莉亚的身上。\n布拉姆（捏住了她的下巴）：这么着急取代她？（Can't wait to take her place, huh?）\n▲娜塔莉亚抬头看向了布拉姆，一脸无辜。\n娜塔莉亚（后退）：教父……（Godfather...）\n▲布拉姆瞧着娜塔莉亚的样子，一步一步逼近娜塔莉亚。\n布拉姆：娜塔莉亚，既然是你主动送上门，我就不客气了！（Natalia, since you came to me, I won't hold back!）\n▲布拉姆握住了娜塔莉亚的手腕，一把将她拉在了自己的怀中，低头要吻她，娜塔莉亚几乎是下意识的避开。\n娜塔莉亚OS：禽兽，竟然来真的！（You animal—he's serious!）\n▲布拉姆目光极具侵略性，一步一步逼近娜塔莉亚，他抓住娜塔莉亚的手，让娜塔莉亚的手从他的胸膛一直往下摸到下腹，娜塔莉亚想要收回手，却被布拉姆死死摁住了手。\n布拉姆（蛊惑）：娜塔莉亚，这可是你取代塞莱特斯的机会，你不要吗？权力、财富、地位，你马上就能拥有。（Natalia, this is your chance to replace Celeste. You don't want it? Power, wealth, status, you can have it all.）\n▲娜塔莉亚惊愕地看着布拉姆，露出乖巧的笑容。\n娜塔莉亚（轻点布拉姆的心口）：虽然我很想要，但是……（撒娇）教父，我来月经了，等经期过了……（I really want it, but... Godfather, I'm on my period. Can you wait until it's over？）\n▲布拉姆握住了娜塔莉亚的手。\n布拉姆（嗤笑）：是吗？内裤脱了，我检查。（Is that so? Take off your underwear. Let me check.）\n▲娜塔莉亚不敢置信地盯着布拉姆。\n娜塔莉亚（震惊）：什么？（What?）\n\n\n第十七集\n17-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚后退了一步，抵在了门上，布拉姆逼近一把捏住了娜塔莉亚的下巴，一把捏着她的下巴，将她的脸转过来，威胁着开口。\n布拉姆（喘息）：你不是爱我吗？不是想取代塞莱斯特吗？拿出你的诚意来！（威胁）不然的话，我不介意让我的狼加餐！（You love me, don't you? You say you want to take Celeste's place？Show me your loyalty, or I’ll feed you to my wolves tonight.）\n▲远处传来狼的嚎叫声，气氛突然变得紧张了起来，娜塔莉亚心跳加速。\n▲这时，戴安娜站在走廊尽头大喊。\n戴安娜（大喊）：娜塔莉亚姐姐，爸爸，快来看我画的画！（Natalia! Daddy! Look what I drew!）\n▲布拉姆看到戴安娜，立刻整理了一下自己的衣服，眼神不悦地落在了戴安娜的身上。\n布拉姆（冷冽）：戴安娜！谁允许你出来的？（Diana! Who gave you permission to leave your room?）\n▲戴安娜举着画，画上画着一个生日蛋糕。\n戴安娜（委屈）：爸爸的生日快到了，我只是想送爸爸一个礼物，让爸爸开心。（Daddy's birthday is coming. I just wanted to give you a gift and make you happy.）\n▲布拉姆收起了枪，走向了戴安娜，伸手摸了一下她的头发。\n布拉姆（不耐烦）：你的心意，我收到了，回房间去。（I got it. Go back to your room.）\n▲戴安娜看了一眼布拉姆，又看向了娜塔莉亚，低着头看着生日蛋糕说。\n戴安娜：以前爸爸的生日宴会，都是妈妈亲手做的蛋糕，妈妈去哪儿了？我想妈妈……（Mommy always baked your cake for your birthday... Where did she go? I really miss her, Daddy...）\n▲布拉姆冷漠呵斥。\n布拉姆（呵斥）：戴安娜！闭嘴！（Diana! Shut up!）\n▲戴安娜被吓到了，哇的一声就哭了，娜塔莉亚立刻扑过去，将戴安娜抱起来，回头看向了布拉姆。\n娜塔莉亚（看向布拉姆）：先生，小姐的病情本就不稳定，您别刺激她！（Sir, her condition is unstable. Don't trigger her!）\n▲戴安娜抱着娜塔莉亚的脖子失声痛哭，布拉姆烦躁地挥了一下手，看向了娜塔莉。\n布拉姆：把她带回房间去！（Take her back to her room!）\n▲娜塔莉亚抱着戴安娜转身回戴安娜的房间，布拉姆盯着娜塔莉亚的背影，目光最后落在了她的臀部。\n布拉姆OS：有点小聪明，但也只是个落入囚笼的兔子而已！（A little clever, but still just a rabbit in a cage.）\n▲布拉姆推开了塞莱特斯的房间门走了进来，里面传来了塞莱斯特的尖叫声。\n\n\n第十八集\n18-1\n夜  内   戴安娜房间\n人物  戴安娜   娜塔莉亚\n▲戴安娜在娜塔莉亚的怀中，指着画上的蛋糕，有些委屈的开口。\n戴安娜（抹眼泪）：以前妈妈在的时候，爸爸从不会凶我，还会陪我过生日，我好想妈妈。（When Mommy was here, Daddy never yelled at me. He celebrated my birthday with me. I miss Mommy.）\n▲娜塔莉亚的目光落在了戴安娜手中的画上。\n【闪回（蛋糕定格切镜到小面包）】\n夜  内  娜塔莉亚小时候的家\n人物  小娜塔莉亚  小玛莉\n▲桌上摆放着一个小面包，面包上插着蜡烛，小玛莉看着小娜塔莉亚摸了摸她的脑袋。\n小玛莉（声音稚嫩）：等以后，姐姐给你买个真正的生日蛋糕！（安抚）许个愿吧。（Someday, sis, I'll get you a real birthday cake. Now, close your eyes and make a wish.）\n▲小娜塔莉亚看着插着蜡烛的面包。\n小娜塔莉亚（高兴）：那我的愿望是，和姐姐永不分离！（My wish is for us to stay together forever and ever!）\n▲小娜塔莉亚吹蜡烛，黑幕。\n【闪回结束】\n▲娜塔莉亚看着画，又低头看着熟睡的戴安娜，她紧紧将戴安娜抱在怀中。\n娜塔莉亚（坚定）OS：我会救出姐姐，让戴安娜和她的母亲团聚！（I swear I will rescue my sister... and bring Diana’s mother back to her.）\n18-2\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣端着托盘，托盘里面放着药往塞莱特斯的房间走，娜塔莉亚从戴安娜房间里面出来。\n娜塔莉亚（盯着女佣）OS：过几天是布拉姆的生日宴，是个能利用的机会。（Bram's birthday banquet is in a few days. That's a chance.）\n▲就在女佣靠近时候，娜塔莉亚一不小心撞到了女佣，女佣手中的托盘差点翻了，娜塔莉亚伸手托住了女佣的手腕，一只手扶住药碗。\n娜塔莉亚：小心！（Careful!）\n女佣：感谢小姐。（Thank you, miss.）\n▲女佣端着药要进入塞莱特斯的房间。\n娜塔莉亚OS：希望塞莱特斯能看到我传递给她的信息！（I hope Celeste sees my message!）\n▲这时，布拉姆走了出来。\n布拉姆（看女佣）：等一等——（Wait—）\n▲娜塔莉亚回头紧张地看着布拉姆。\n娜塔莉亚OS：千万别被布拉姆察觉破绽。（Don't let Bram spot anything.）\n▲布拉姆抬头看了一眼娜塔莉亚，嗤笑了一声。\n布拉姆：你在紧张什么？（Why the jittery face, Natalia?）\n娜塔莉亚（摇头）：不，我刚才不小心把夫人的药撞洒了些……（Nothing. I accidentally spilled some of her medicine earlier...）\n▲布拉姆一步一步走了过来，目光看向了女佣手中的托盘，他用勺子搅了一下药，又将碗端起来检查了一下。\n布拉姆（审视）：洒了吗？（Did it spill?）\n娜塔莉亚（紧张）：一点点……（Just a tiny bit..）\n▲娜塔莉亚盯着布拉姆的动作，心跳加快，目光看向了托盘。\n▲布拉姆看了一眼娜塔莉亚，又顺着娜塔莉亚的目光落在了女佣手中的托盘上。\n布拉姆（冷冽）：将托盘翻过来。（Flip the tray over. Now.）\n▲布拉姆拿出手枪，子弹上膛，娜塔莉亚的目光盯着女佣的动作，女佣缓缓将托盘翻过来——\n\n\n第十九集\n19-1\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣听话地将托盘翻了过来，下面什么都没有，布拉姆这才将药碗放在了托盘上，目光又看向了女佣。\n布拉姆（冷冽）：药给我，我拿进去。（Hand it over. I'll take it to her myself.）\n▲女佣听话地将药碗递给了布拉姆，娜塔莉亚眼神一变，一把抱住了布拉姆的手臂。\n娜塔莉亚（委屈）：教父~您就这么关心夫人？（Godfather, you care about her that much?）\n▲布拉姆一愣，低头看向了娜塔莉亚。\n布拉姆（捏娜塔莉亚的脸）：吃醋了？（Jealous?）\n▲娜塔莉亚松开了布拉姆的手臂，转身背对布拉姆。\n娜塔莉亚（不高兴了）：我怎么会吃醋？我有什么资格吃醋？（Why would I be jealous? I have zero right to be.）\n▲布拉姆抓住了娜塔莉亚的手臂，将她拉入了自己的怀中。\n布拉姆（捏娜塔莉亚的脸）：你长得很像一个人。（You know... you really remind me of someone..）\n▲娜塔莉亚不动声色地抬头看向了布拉姆，指尖轻轻点了点他的胸口。\n娜塔莉亚（乖巧）：什么人？情人还是爱人？您不会拿我当替身吧。（Oh? An ex-lover, or a wife? Don't tell me I'm just some cheap stand-in.）\n▲布拉姆握住娜塔莉亚的手，轻轻吻了吻她的指尖。\n布拉姆（嗤笑）：她可没有你这么大胆。（打量娜塔莉亚）也没有你这么诱人~（She wasn't as bold as you. Or as tempting.）\n▲娜塔莉亚勾着布拉姆的皮带，让他一步步靠近。\n娜塔莉亚（乖巧）：教父昨晚不是说要检查吗？我准备好了……（Godfather, didn't you say you wanted to check last night? I'm ready...）\n▲布拉姆喉结滚动了一下，一步一步靠近娜塔莉亚，女佣立刻低着头，一只手托着托盘，打开门进入了塞莱特斯的房间。\n18-2\n日 内  塞莱特斯房间\n人物 塞莱特斯  女佣\n▲塞莱特斯看着女佣端着咖啡进来，声音冰冷地开口。\n塞莱特斯：出去，我没有病，我不喝这些药！（Get out. I'm not sick. I'm not drinking this!）\n女佣（为难）：夫人，教父下令，我必须看着您喝下去。（Ma'am, please... the Godfather’s orders. I have to watch you finish it.）\n▲塞莱特斯刚想发火，突然看见女佣的衣袖袖口位置贴了一张极小的纸条。\n塞莱特斯（不动声色）：喝就喝——（Fine, I'll drink—）\n▲她伸手抓住了女佣的手腕顺手将纸条取了下来，随后端起碗一口喝了下去，将空碗扬了扬。\n塞莱特斯：你可以滚了！（You can get lost now!）\n▲女佣低着头逃一般离开，塞莱特斯立刻看纸条。\n娜塔莉亚（旁白）：宴会捉奸，帮您离开，希望您当众将地下室的秘密揭露出来，助我一臂之力！同意就摔碗为信号。（Catch him cheating at the party, and I'll help you walk free. Expose the dark secret of the basement in front of everyone, and we both win. Drop the bowl as a signal.）\n▲切镜。\n▲走廊上，布拉姆一把将娜塔莉亚抗在了肩上，大步流星往自己的方向走。\n布拉姆（拍娜塔莉亚的臀）：小妖精，我今天就让你爽个够！（You little vixen. I'm gonna rock your world today!）\n▲娜塔莉亚趴在布拉姆的肩膀上，看向了塞莱斯特的房门。\n娜塔莉亚OS：三、二、一……（Three, two, one...）\n▲突然，塞莱特斯房间里面传来打碎了碗的声音，布拉姆脚步一顿！将娜塔莉亚放下。\n娜塔莉亚OS：合作达成！(Deal!）\n布拉姆（看向塞莱特斯的房间，不悦）：我去看看她又在闹什么！（Let me see what she's up to now!）\n▲娜塔莉亚一把抓住了布拉姆的手。\n娜塔莉亚（撒娇）：教父~（Godfather.）\n▲布拉姆回头看了一眼娜塔莉亚。\n布拉姆（安抚）：生日宴时，她父母会来，你也不想她到时候闹事，对吧！（Her parents will be at the birthday banquet. You don't want her making a scene, right?）\n▲娜塔莉亚故作委屈松手。\n娜塔莉亚（叹气）：好吧，那我就先忍一忍~（Fine. I'll hold it in for now.）\n▲布拉姆走向了塞莱特斯的房间，娜塔莉亚转身往戴安娜的房间走。\n娜塔莉亚（看门）OS：希望能在宴会上，引塞莱特斯的父母出手打开地下室，如果失败了，我也能乘机拿到钥匙，救出姐姐！（Let’s hope Celeste’s parents play their part and blow the basement wide open. But if that plan tanks... I’ll just swipe the key myself and tear this place down to save my sister.)\n\n\n第二十集\n20-1\n日  内  塞莱特斯房间\n人物  布拉姆 塞莱特斯  管家\n▲塞莱特斯睡在了床上，布拉姆坐在窗边上，管家恭敬地看着布拉姆。\n管家：先生，家庭医生给夫人打了镇定剂，她应该不会再闹了。（Sir, the doctor loaded her up with sedatives. She’s out cold; she won’t be making a scene anymore.)\n▲布拉姆点了点头。\n布拉姆（冷冽）：不管如何，宴会之前别让她惹出事情。（Either way, don't let her cause trouble before the banquet.）\n管家（不解）：教父，您明知道夫人和娜塔莉亚在联手动手脚？为什么不阻止她们？（Godfather, you know Celeste and Natalia are working together. Why not stop them?）\n▲布拉姆看了一眼塞莱特斯，嗤笑了一声。\n布拉姆（不屑）：两个落入狼群的兔子，能翻出什么浪花？顶多两个有趣的猎物而已！（Two rabbits in a wolf pack. What can they do? Just two little rabbits for me to play with.）\n20-2\n日  内  宴会厅\n人物  布拉姆  娜塔莉亚  塞莱特斯   戴安娜  宾客若干   莱恩  伊丽莎白\n▲宴会厅金碧辉煌，娜塔莉亚带着戴安娜在甜品区吃糕点，娜塔莉亚远远看着塞莱特斯挽着布拉姆的手，正在和一对夫妇聊天，女人打扮华丽【塞莱特斯母亲 伊丽莎白】，男人【塞莱特斯父亲 莱恩】看起来风度翩翩，举手投足都十分贵气，塞莱特斯似乎察觉了娜塔莉亚的目光，二人对视了一眼互相点头。【Celeste’s Mother, Elizabeth】【Celeste’s Father, Ryan】\n▲娜塔莉亚亲眼看着塞莱特斯将一杯酒递给了布拉姆，布拉姆将酒一口喝了。\n娜塔莉亚OS：上钩了，这酒里的可是好东西。（Got him. There’s something extra in that drink.）\n▲戴安娜看了过去。\n戴安娜：那是塞莱特斯夫人的妈妈，（情绪低落）我也好想我的妈妈呀。（That's Celeste's mom. I miss my mommy too.）\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的戴着帽子的男性客人，路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n男客人（伸手扶娜塔莉亚和戴安娜）：抱歉。（My apologies.）\n▲娜塔莉亚摇了摇头。\n娜塔莉亚：我没什么大碍。（I'm fine.）\n▲布拉姆听到这边的动静，立刻看了过来。\n布拉姆（担心）：发生了什么事？（What happened?）\n男客人（歉意）：教父，不好意思，我差一点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n▲布拉姆故作绅士。\n布拉姆：不必介怀，请您继续享用晚宴吧。（No worries. Enjoy the banquet.）\n▲布拉姆摸了摸戴安娜的脑袋。\n布拉姆：我的小公主，玩的开心吗？（My little princess, having fun?）\n戴安娜（点头）：嗯！（Yeah!）\n布拉姆（温和）：宾客太多了，你跟娜塔莉亚医生回房间好不好？（Too many guests. Go back to your room with Dr. Natalia, okay?）\n戴安娜：可是我还没玩儿够……（But I'm not done playing...）\n娜塔莉亚（抱起）：小姐，我们听教父的话，（柔声安抚）回房间我给你讲故事好不好？（Miss Diana, let's listen to the Godfather. I'll tell you a story in your room, okay?）\n▲就在娜塔莉亚准备离开时，塞莱特斯突然举着酒杯过来，笑着对布拉姆说。\n塞莱特斯：布拉姆，父亲让你陪他喝一杯——啊！（Bram, Father wants you to have a drink with him—ah!）\n▲塞莱特斯突然脚下一滑，一杯酒一下子泼到了布拉姆的身上，众人齐刷刷地看了过去。\n▲布拉姆昂贵的西装被打湿，看上去有些狼狈。\n塞莱特斯（震惊）：哦～天啊！布拉姆，我不是故意的。（Oh my God! Bram, I didn't mean it.）\n▲众目睽睽下，布拉姆强忍怒气，对着塞莱特斯露出了温和的笑容。\n布拉姆（安抚）：别太自责，我去换套衣服，你照顾一下宾客！（Don't blame yourself. I'll go change. You take care of the guests.）\n▲布拉姆优雅转身离开，塞莱特斯给娜塔莉亚使了个眼神，娜塔莉亚立刻点了点头。\n塞莱特斯（兴奋）OS：今夜过后，我就能离开了，娜塔莉亚，你可千万别让我失望！（After tonight, I'll be free. Natalia, don't let me down!）\n20-3\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲敲门声响起，布拉姆赤裸着上身开门。\n布拉姆（烦躁）：送个衣服都这么慢，当心我崩了你们……（What’s taking so long with those clothes? I swear, I’ll shoot you if...）\n▲布拉姆的声音戛然而止，只见娜塔莉亚穿着一条性感的低胸吊带连衣裙，抱着西装站在门口。\n布拉姆（惊愕）：娜塔莉亚？你穿成这样来干什么？（Natalia? What the hell are you wearing?）\n\n\n第二十一集\n21-1\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n娜塔莉亚（挑眉）：教父不喜欢刺激吗？（抚摸布拉姆的胸膛）还是，您有别的顾虑？（What’s wrong, Godfather? Don't tell me you're scared of a little excitement...）\n▲布拉姆看着娜塔莉亚，眼神从惊愕变成了玩味。\n布拉姆（捏住了娜塔莉亚的下巴）：激将法对我可没用！（笑）不过，我现在的确想把你吃掉！（Reverse psychology won't work on me, sweetheart. Though... I've got to admit, I'm dying to devour you right now.）\n▲布拉姆四下看了一眼，没看见人，他抓住了娜塔莉亚的手臂，将她抗在了自己的肩膀上，然后锁上了门。\n▲塞莱特斯看着布拉姆将娜塔莉亚拉入了房间，嘴角勾起了一个弧度，她转身向宴会厅走去。\n21-2\n日  内  宴会厅\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白\n▲宴会厅中，伊丽莎白挽着莱恩的手，正在和宾客寒暄，塞莱特斯一把抓住了伊丽莎白的衣服。\n塞莱特斯：妈妈，布拉姆出轨了。（Mom, Bram is cheating.）\n▲众人震惊，目光惊愕地盯着塞莱特斯，伊丽莎白迅速捂住了塞莱特斯的嘴巴。\n伊丽莎白（警告）：塞莱特斯！不要胡说！我想布拉姆应该不是这种人。（Celeste! Don't talk nonsense! I don't think Bram is that kind of man.）\n▲塞莱特斯摇了摇头，挣脱了伊丽莎白的手，拽着她往楼上走。\n塞莱特斯（委屈）：我亲眼看到他和一个女人进入了房间里面，请您相信我！（I caught him with my own eyes! He slipped into that room with a woman, you have to believe me!）\n▲众目睽睽之下，塞莱特斯和莱恩对视了一眼，莱恩将酒杯放在了桌子上。\n莱恩（冷哼）：哼，如果布拉姆敢背叛你，我绝不会放过他！（Hmph. If Bram dares to betray you, I won't let him get away with it!）\n▲莱恩大步流星地往房间走，塞莱特斯拉着伊丽莎白跟了上去，宾客们也跟着去看热闹。\n21-3\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚\n▲布拉姆垂眸盯着站在自己面前的娜塔莉亚，眼神透着审视。\n布拉姆（捏娜塔莉亚的手）：今天是我的生日宴，外面都是宾客，你想害我？嗯？（It's my birthday banquet. Guests are everywhere. You want to set me up? Hmm?）\n▲娜塔莉亚轻轻抚摸着布拉姆的脖子。\n娜塔莉亚（笑）：怎么会？（靠近布拉姆的耳朵）今天是您的生日。这是我特地为您准备的生日礼物！（Of course not. It's your birthday. This is a birthday gift I prepared just for you!）\n布拉姆（捏娜塔莉亚的腰）：把你自己当做礼物送给我？（Giving yourself to me as a gift?）\n▲娜塔莉亚缓缓拉下了自己的一根肩带，手在布拉姆身上摸索。\n娜塔莉亚（点头）：当然，过了今夜，您就是我的第一个男人，也是唯一的……（Of course. After tonight, you'll be my first man, and my only...）\n▲布拉姆喉结滚动了一下，一翻身，将娜塔莉亚压到身下！\n▲切镜。\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲门突然被大力踹开，娜塔莉亚和布拉姆猛地抬头，塞莱特斯带众人站在门口。\n塞莱特斯（呵斥）：你们在干什么——（What the hell is going on here?）\n\n\n第二十二集\n22—1日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。\n塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）\n▲娜塔莉亚对视塞莱特斯摇了摇头。\n【闪回】\n22-2\n日  内  布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲突然，外面传来了敲门声。\n女佣vo：教父，夫人带着伯爵和伯爵夫人过来了。（Godfather, Madam is here with the Count and Countess.）\n▲娜塔莉亚惊讶，下一刻，布拉姆突然清醒过来，一把将娜塔莉亚推开。\n布拉姆：快把衣服穿好！（Get dressed. Now!）\n【闪回结束】\n▲布拉姆带着温和的笑容，看向了塞莱特斯和莱恩夫妇。\n布拉姆（优雅）：爸妈怎么过来了？（Father, Mother... what a pleasant surprise. Is something wrong?）\n莱恩（尴尬）：你太久没出来，我们过来瞧瞧。（You've been missing for quite a while. We were getting concerned.）\n塞莱特斯（指着布拉姆）：娜塔莉亚怎么在这里？你们孤男寡女躲开宾客在这里面做什么？（Why is Natalia here? What are you two doing alone away from the guests?）\n布拉姆（从容）：戴安娜在宴会上受到了一些惊吓，娜塔莉亚正在向我汇报，有问题吗？（Diana got a little scared at the banquet. Natalia was briefing me on her condition. Is there a problem?）\n塞莱特斯（呵斥）：什么问题非要现在汇报？（看娜塔莉亚）你说，你们在这里面干什么？！（What could be so urgent it couldn't wait until tomorrow?! You! Tell them the truth! What were you doing in his room?）\n▲塞莱特斯的情绪特别激动，目光死死盯着娜塔莉亚，眼神带着祈求。\n塞莱特斯：你说啊！（Say it!）\n▲所有人的目光都落在了娜塔莉亚的身上。\n娜塔莉亚（握紧报告）OS：塞莱特斯，对不起了。（Celeste, I'm sorry.）\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n▲塞莱特斯惊愕地看着娜塔莉亚。\n塞莱特斯（不敢相信）：什么？你撒谎！（抓住了莱恩的手）爸爸，除了这个女人，地下室还藏在一个女人！（What? You're lying! Dad, besides this woman, there's another woman hidden in the basement!）\n莱恩（惊讶）：什么地下室？（The basement?）\n▲众人震惊，布拉姆面色阴沉，娜塔莉亚激动地看向了莱恩。\n\n二卡\n\n\n第二十三集\n23-1\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲布拉姆上前一步，握住塞莱特斯的手。\n布拉姆（深呼吸）：塞莱特斯，我知道你生病了，你也很难受，但有什么问题，我们私下说好吗？（Celeste, I know you're sick and it's hard, but let's talk in private, okay?）\n▲众人惊讶。\n伊丽莎白：生病了？（Sick?）\n塞莱特斯：你胡说——（看伊丽莎白和莱恩）爸爸妈妈，他胡说的，我没有生病！（You're lying—Mom, Dad, he's lying! I'm not sick!）\n▲布拉姆拿出了检查报告递给了莱恩和伊丽莎白。\n布拉姆（悲痛）：这是塞莱特斯的精神检查报告。她有严重的被害妄想症和梦游症，这一切都是她臆想出来的。（This is Celeste's psychiatric report. She has severe paranoia and sleepwalking disorder. She imagined all of it.）\n▲众人震惊。\n▲莱恩接过检测报告，有些惊讶。\n布拉姆：她一直怀疑我会出轨，怀疑我会害她。（叹气）可是我没有。（She’s constantly convinced I'm unfaithful, that I'm trying to destroy her. God knows I've done nothing of the sort.）\n伊丽莎白（惊讶）：这些事情，你为什么不早告诉我们？（Why didn't you tell us sooner?）\n布拉姆（难过）：你们身体不好，我不想让你们担心——（鞠躬）是我没照顾好她。（You both have delicate health; I didn't want to burden you. It's my fault, I simply failed to protect her.）\n▲宾客盯着布拉姆，忍不住小声议论了起来。\n宾客1：教父果然是重情重义，塞莱特斯夫人这样对待他，他还不离不弃！（The Godfather is a saint. His wife treats him like dirt, and he still covers for her!）\n宾客2：是啊，教父能成为伯爵的女婿，人品肯定很好。（Yeah. If the Count made him his son-in-law, he must be a good man.）\n▲塞莱特斯一把将报告抢过来，直接撕碎了。\n塞莱特斯（咆哮）：我没疯！是他在撒谎——（I'm not crazy! He's lying—）\n▲莱恩打量着一眼看热闹的宾客，立刻呵斥塞莱特斯。\n莱恩：够了！塞莱特斯注意你的言行！（Enough! Celeste, watch your behavior!）\n▲伊丽莎白立刻抓住了塞莱特斯的手，示意她别再说了。\n莱恩（冷脸）：行了，立刻收拾好，出来接待宾客，别再闹些笑话让人误会！（看向宾客）都散了吧。（All right. Clean yourself up and come greet the guests. Stop embarrassing us. Everyone, please, enjoy yourselves—nothing to see here.）\n▲宾客们十分给莱恩的面子，离开了。\n塞莱特斯（着急）：爸爸——（Dad—）\n▲莱恩拽着塞莱特斯离开。\n莱恩（呵斥）：跟我过来，我有话跟你说。（Come with me. I need to talk to you.）\n▲所有人都离开之后，布拉姆一抬手将桌角的花瓶狠狠摔碎。\n布拉姆（恨）：一群杂碎，早晚有一天，我要将你们全部踩在脚底！（A bunch of trash. One day, I'll put every one of you under my feet!）\n▲娜塔莉亚吓了一跳，连忙低下头去。\n娜塔莉亚（恭敬）：教父，抱歉，是我的鲁莽给您惹麻烦了。（Godfather, I'm sorry. My recklessness caused you trouble.）\n▲布拉姆一腔火气，拿起桌上的枪抵着娜塔莉亚的脑袋。\n布拉姆（呵斥）：到底是有意的，还是无意的！（Was it on purpose or not?）\n▲娜塔莉亚惊慌地举起双手，盯着布拉姆的眼睛。\n布拉姆（审视）OS：当猎物脱离掌控时，我一定会亲手杀掉她！我讨厌这种失控感！（When prey slips out of control, I'll kill her myself. I hate losing control.）\n▲布拉姆突然开枪，子弹射出擦着娜塔莉亚的脸颊而过，打碎了花瓶，娜塔莉亚尖叫了一声，连忙开口。\n娜塔莉亚（惊呼）：教父，我承认，我是故意的！（Godfather, I admit it. I did it on purpose!）\n布拉姆（呵斥）：你为什么要这么做！（Why did you do it?）\n娜塔莉亚（慌乱）：我想得到您，我想取代塞莱特斯，（一把抱住布拉姆）您不是说给我一个机会吗？（I want you. I want to replace Celeste. Didn't you say you'd give me a chance?）\n▲布拉姆震惊。\n\n\n第二十四集\n24-1\n日  内   布拉姆房间\n人物 布拉姆  娜塔莉亚 \n▲布拉姆惊讶地看着娜塔莉亚。\n布拉姆（惊讶）：什么？（What did you just say?）\n▲娜塔莉亚抬头看着布拉姆。\n娜塔莉亚（诚恳）：塞莱特斯根本就不懂您，也配不上您，您这么强大、睿智，我实在太仰慕您了，才会铤而走险抓住这个机会，我以为……（Celeste doesn't understand you. She doesn't deserve you. You're so powerful and smart. I admire you so much that I took this risk. I thought...）\n▲布拉姆盯着娜塔莉亚的眼睛，握着枪的手垂了下去，揉了揉额头。\n布拉姆（放缓语气）：你以为在今天跟我上床，被发现了，我就会和塞莱特斯离婚，娶你是吗？（You thought if you slept with me today and we got caught, I'd divorce Celeste and marry you?）\n▲娜塔莉亚握住布拉姆的枪，指着自己的脑袋。\n娜塔莉亚（认真）：您杀了我吧，杀了我证明您的清白！（Then pull the trigger! Kill me right now to prove you had nothing to do with this!）\n▲布拉姆惊讶，猛地收回了枪。\n布拉姆（拍娜塔莉亚的脸）：我不会杀你，你先回去陪戴安娜吧，我会处理好。（轻轻拥抱）记住，在这里，只有我能保护你。（I won't kill you. Go keep Diana company. I'll handle it. Remember, in this place, only I can protect you.）\n▲娜塔莉亚红着眼睛点了点头，转身离开，镜头特写，娜塔莉亚走到门口时，摊开手心，掌心里面躺着一把金色的钥匙。\n▲布拉姆盯着娜塔莉亚的背影，冷笑了一声。\n布拉姆OS：两个女人以为联手就能毁掉我？做梦？（Two women think they can team up and destroy me? Dream on.）\n24-2\n日  外 花园\n人物  莱恩  伊丽莎白   塞莱特斯  布拉姆   管家\n▲塞莱特斯焦急地看着父母。\n塞莱特斯：爸爸妈妈你们刚刚为什么不帮我，我真的没病！（Mom, Dad, why didn't you help me just now? I'm really not sick!）\n莱恩：塞莱特斯，你先冷静，我们并没有看到布拉姆出轨，如果为了他跟别的女人说话而大动干戈，只会显得我们无礼。（Celeste, calm down. We didn't see Bram cheating. Making a scene because he talked to another woman would just make us look rude.）\n伊丽莎白：是啊，塞莱特斯，你不该在大庭广众之下伤了布拉姆的脸面，况且那女人只是他孩子的心理医生，别人会觉得你是个恶毒的后妈。（Yes, Celeste. You shouldn't embarrass Bram in public. Besides, that woman is just his child's therapist. People will think you're a cruel stepmother.）\n塞莱特斯（绝望）：爸爸妈妈，你们不相信我？（Mom, Dad, you don't believe me?）\n伊丽莎白（安抚）：塞莱特斯，一个心理医生，你不喜欢她，找个机会把她赶走就好了！（Celeste, she's just a therapist. If you don't like her, find a chance to get rid of her.）\n莱恩（抚摸塞莱特斯的头发）：你自小性格要强，肯定受不了丝毫委屈，教父现在权势滔天，你应该获取他的欢心，况且他对你很好，别无理取闹了。（You've always been strong-willed. You can't stand the slightest grievance. The Godfather is powerful now. You should win his favor. Besides, he treats you well. Stop making a fuss.）\n▲塞莱特斯绝望的后退了半步。\n塞莱特斯：不，不是这样的。（No, it's not like that.）\n莱恩（心疼）：你放心，爸爸会联系最好的医生治疗你的病！（Don't worry. I'll contact the best doctor to treat you!）\n▲镜头上拉：布拉姆站在二楼的窗户，眼神冰冷地盯着他们。\n布拉姆（狠辣）OS：这场捕猎游戏，我玩儿够了，该结束了！（I'm done playing this hunting game. It's time to end it.）\n\n\n第二十五集\n25-1\n夜  内   宴会厅门口\n人物 塞莱特斯   伊丽莎白  下人若干 莱恩 布拉姆   娜塔莉亚\n▲莱恩和伊丽莎白站在门口，布拉姆站在二人面前，莱恩严肃地盯着布拉姆。\n莱恩（温和）：布拉姆，你对塞莱特斯的好，我们看在眼中，但她就是大小姐脾气，希望你多多担待，不要跟她一般见识。（Bram, we know you care for Celeste deeply. But she’s always had a headstrong, spoiled streak. Do be gentle with her, and try not to take her outbursts to heart.）\n伊丽莎白（温和）：夫妻之间，要互相体谅。（Married couples need to understand each other.）\n▲众目睽睽下，布拉姆握着的拳头青筋暴起。\n布拉姆（冷漠）OS：一群虚伪的贵族，凭什么高高在上教训我，等我拿到了他所有的资源，我一定把他丢去喂鲨鱼！这一天马上就要到来了！（A bunch of hypocritical nobles. What gives you the right to lecture me? Once I get all his resources, I'll feed him to the sharks. That day is coming soon.）\n▲布拉姆弯着脊梁低头道歉。\n布拉姆：您放心，我很爱她，我保证会照顾好她的。（Don't worry. I love her very much. I promise I'll take good care of her.）\n▲塞莱特斯瞧着布拉姆的样子，害怕地死死握住了伊丽莎白的手。\n伊丽莎白（心疼）：布拉姆，塞莱特斯状态不太好，不如让她先跟我们回去住几天？（Bram, Celeste isn't doing well. Why not let her come home with us for a few days?）\n▲塞莱特斯的眼睛都亮了起来，娜塔莉亚不动声色地看向这边。\n娜塔莉亚OS：只要塞莱特斯离开了这里，我们的计划就成功了！（If Celeste leaves this place, our plan works!）\n▲布拉姆伸手将塞莱特斯搂在怀中，绅士地开口。\n布拉姆：妈，塞莱特斯还需要接受治疗，我比较了解她的情况，如果塞莱特斯现在离开，可能会中断她的治疗。（Mom, Celeste still needs treatment. I know her condition better. If she leaves now, it could interrupt her treatment.）\n莱恩（点头）：布拉姆说得有道理，别影响塞莱特斯的治疗。（Bram has a point. Don't interrupt her treatment.）\n▲塞莱特斯眼眶瞳孔，伊丽莎白不舍得吻了吻她的脸颊，安抚她。\n伊丽莎白：听话，好好治病，等你状态好了，妈妈来接你。（Be good. Do what the doctors say. Once you're better, I'll come get you.）\n塞莱特斯（绝望）：妈妈，我真的没病——（Mom, I'm really not sick—）\n布拉姆（搂住塞莱特斯）：塞莱特斯，听话，太晚了，让爸爸妈妈回去好好休息吧。（Celeste, be good. It's late. Let Mom and Dad go home and rest.）\n▲伊丽莎白松开了塞莱特斯，挽着莱恩的手上车，布拉姆带着微笑搂着塞莱特斯目送二人，车子离开之后，布拉姆突然伸手捏住了塞莱特斯的脖子。\n布拉姆（眼神阴冷）：关门，我的夫人需要接受治疗了！（Lock the gates. My wife is due for her treatment.）\n\n\n第二十六集\n26-1\n夜  内   宴会厅/走廊\n人物 塞莱特斯   下人若干  布拉姆   娜塔莉亚\n▲安保瞬间关上了庄园的大门，整个庄园被围了起来，布拉姆掐着塞莱特斯的脖子，逼迫着塞莱特斯上楼。\n塞莱特斯（惊呼）：松开我！爸爸——妈妈，救命——（Let me go! Dad—Mom, help—）\n▲娜塔莉亚惊愕地看着眼前的场景，她连忙站在旁边，给布拉姆让路，塞莱特斯路过娜塔莉亚的时候，眼神紧紧盯着娜塔莉亚，又看着屋内的佣人们，佣人们低着头不敢抬头。\n▲镜头特写：其中一个女佣退到了人群后面，悄无声息地往门口走。\n▲娜塔莉亚瞧着布拉姆将塞莱特斯拉入了房间狠狠关上了门，她连忙转头往地下室方向跑。\n娜塔莉亚（紧张）OS：钥匙已经到手了，布拉姆应该不会杀了塞莱斯特，我得趁乱先救出姐姐！（I have the key. Bram probably won't kill Celeste. .. I have to take advantage of this chaos and get my sister out NOW.）\n26-2\n夜   内   塞莱特斯房间\n人物：女佣   布拉姆  塞莱特斯  \n▲布拉姆将塞莱特斯拉入了房间狠狠摔在了床上，他扯松了领带，死死盯着塞莱特斯。\n▲塞莱特斯惊恐后退。\n塞莱特斯：你要干什么——你敢对我动手，我父母不会放过你的！（What are you doing? If you touch me, my parents won't let you get away with it!）\n▲布拉姆笑着看着塞莱特斯。\n布拉姆（笑容诡异）：塞莱特斯，我怎么舍得杀了你？只是我不明白，我这么爱你，你为什么要害我！（Celeste, how could I bear to kill you? I just don't understand. I love you so much, why did you try to hurt me?）\n塞莱特斯（惊恐）：我没有害你！是你自己和娜塔莉亚不清不白，难道还不允许我告诉我父亲吗？（I didn't hurt you! You're the one fooling around with Natalia. Am I not allowed to tell my father?）\n布拉姆（抓住塞莱特斯的头发）：是你在酒里下毒，还带着人捉奸，害我在大庭广众之下被你父亲训斥！还不算害我吗？（You spiked my drink! You staged a scandal to catch me red-handed, and you let your father humiliate me in front of everyone! You call that not trying to ruin me?）\n塞莱特斯（惊恐真正）：我没有！（I didn't!）\n布拉姆（膝盖压住塞莱特斯的腿）：怎么？你想离开我？（What’s the matter? Dying to run away from me?）\n塞莱特斯（尖叫）：啊——（Ah—）\n布拉姆（逼问）：你是不是看不起我？是不是觉得我配不上你？（You look down on me, don't you?! You think a high-and-mighty heiress is too good for a man like me?）\n\n\n第二十七集\n27-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲塞莱特斯被压得表情扭曲。\n塞莱特斯（痛苦）：不——我没做过！（No—I didn't do it!）\n▲布拉姆一把将塞莱特斯从床上拉起来。\n布拉姆（冷笑）：不承认是吧？（Not admitting it, huh?）\n▲布拉姆将她摁在了窗口，只见庄园里面有个女佣悄无声息地靠近围墙。\n布拉姆（冷冽）：那是你的信使吗？（举起枪对准女佣的后背）（Is that your messenger?）\n塞莱特斯（惊恐）：不，别杀她！（No, don't kill her!）\n▲布拉姆冷笑，一枪崩了女佣（枪声，窗外鸟雀惊飞，避免直给暴力镜头），塞莱特斯也跟着尖叫了一声。\n▲切镜。\n▲娜塔莉亚站在地下室的入口，她正打算下去。\n娜塔莉亚OS：等我救出姐姐，再去救塞莱特斯！（Once I save my sister, I'll go save Celeste!）\n▲突然，外面响起了枪声，娜塔莉亚连忙转身走向了塞莱特斯的房间。\n娜塔莉亚OS：塞莱特斯！——（Celeste!—）\n▲娜塔莉亚转身向楼上跑去。\n▲切镜。娜塔莉娅刚跑到塞莱斯特门口，突然戴安娜从房间里面走了出来，一把抓住了娜塔莉亚的手，娜塔莉亚惊愕地低头看着戴安娜。\n戴安娜（乖巧）：别过去！（Don't go over there!）\n▲娜塔莉亚惊讶。\n▲切镜\n▲屋内。\n▲布拉姆摁着塞莱特斯的脖子。\n布拉姆（嗤笑）：夫人，我知道娜塔莉亚是谁，她是玛莉的妹妹对吗？（Ma'am, I know who Natalia is. She's Mary's sister, right?）\n▲塞莱特斯惊恐地看着布拉姆。\n塞莱特斯（紧张）：我，我不知道你在说什么！（I—I don't know what you're talking about!）\n▲布拉姆拽住她的头发。\n布拉姆（嘲讽）：夫人，你居然把希望放在一个刚刚毕业的心理医生身上，她的确有些小聪明，可惜，柔弱的像是一只兔子，毫无威胁力！（Ma'am, you put your hope in a fresh-out-of-school therapist. She's a little smart, but weak as a rabbit. No threat at all!）\n▲说着，布拉姆摁住塞莱特斯的脖子，让她趴在窗边上，逼她看着死在地上的女佣，一字一句地威胁。\n布拉姆（残忍）：你猜，我明明什么都知道，为什么还要放过娜塔莉亚？（蛊惑）因为她诚实，夫人，你诚实吗？（Guess why I let Natalia live when I know everything? Because she's honest. Are you honest, ma'am?）\n▲塞莱特斯不可置信地盯着布拉姆。\n塞莱特斯OS：娜塔莉亚出卖我？（Natalia sold me out?）\n【闪回14-1】\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n【闪回22-1】\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n【闪回结束】\n▲塞莱特斯握紧拳头。\n塞莱特斯OS：娜塔莉亚每次都没有按照计划行事，难道她真的为了保命牺牲我……（Natalia never followed the plan. Did she really sacrifice me to save herself...）\n▲布拉姆盯着塞莱特斯的眼睛。\n布拉姆（蛊惑）：塞莱特斯，我比你的父母更疼爱你，他们都不管你，只有我护着你，告诉我，是不是有人蛊惑你？（Celeste, I love you more than your parents do. They don't care about you. Only I protect you. Tell me, did someone turn you against me?）\n▲塞莱特斯惊恐地摇头，不肯说。\n▲布拉姆松开了塞莱特斯拿出了一支药剂，他推动针管，药水喷出来了些。\n布拉姆（威胁）：知道这是什么吗？（Know what this is?）\n▲塞莱特斯惊恐后退，布拉姆一步一步逼近。\n布拉姆（阴沉）：放心，不死，只是会麻痹神经，颤抖，抽搐，瘫痪……（Relax... it won't kill you. It just rots your nervous system from the inside—first come the shakes, then the spasms, until you're completely paralyzed.）\n塞莱特斯（惊恐）：不！我说！我什么都告诉你！（No! I'll talk! I'll tell you everything!）\n\n\n第二十八集\n28-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲布拉姆满意地看着塞莱特斯。\n塞莱特斯：是娜塔莉亚，她——（It's Natalia. She—）\n▲外面突然传来了戴安娜的尖叫声。\n戴安娜vo：啊——（Ah—）\n▲紧接着传来花瓶摔碎的声音。\n娜塔莉亚vo：小姐！请您冷静下来。（Miss Diana! Please calm down.）\n戴安娜（尖叫）：妈妈——我要妈妈——（Mommy—I want Mommy—）\n娜塔莉亚（敲门）：教父！不好了！小姐发病了，我需要医生的帮助！！（Godfather! Something's wrong! She's having an episode. I need a doctor!!）\n▲布拉姆将注射器放下，转身往外走。\n布拉姆：老实待着！（Stay right there!）\n▲布拉姆大步流星地走了出去，塞莱特斯捂着心口，泪流满面。\n28-2\n夜  内   戴安娜房间\n人物  戴安娜  医生  娜塔莉亚  布拉姆\n▲戴安娜躺在床上，闭着眼睛，娜塔莉亚和布拉姆站在旁边，医生正在收拾器材。\n医生：教父，小姐的情况不太稳定，不能受到刺激。（Godfather, Diana's still not doing well. We need to keep her calm.）\n▲布拉姆点了点头，医生离开了，布拉姆轻轻抚摸着戴安娜的额头，轻吻了她的额头，眼中流露出慈爱。\n布拉姆（心疼）：我可怜的女儿……（My poor daughter...）\n▲娜塔莉亚盯着戴安娜。\n【闪回28-3】\n夜 内  走廊\n人物  娜塔莉亚  戴安娜\n▲塞莱特斯的房间里面传来塞莱特斯惊恐的声音。\n塞莱特斯vo：不，别杀她！我说！我什么都告诉你！（No, don't kill her! I'll talk! I'll tell you everything!）\n▲娜塔莉亚着急地走向了门口，突然，戴安娜尖叫了一声。\n戴安娜（尖叫）：啊——啊！我要妈妈——（Ah—ah! I want Mommy—）\n▲娜塔莉亚回头，戴安娜突然失控，用力打碎了花瓶。\n【闪回结束】\n▲娜塔莉亚低声安抚布拉姆。\n娜塔莉亚：教父，别担心。上帝会保佑小姐的。（Godfather, don't worry. God will protect her.）\n▲布拉姆看向娜塔莉亚。\n布拉姆（严肃）：想不想知道戴安娜是什么时候开始生病的？（站了起来）跟我来，我现在告诉你。（Want to know when Diana first got sick? Come with me. I'll tell you now.）\n▲娜塔莉亚惊讶，娜塔莉亚站了起来，跟着布拉姆走出房间。\n28-4 \n夜  内  地下室门口\n人物  布拉姆  娜塔莉亚\n▲布拉姆和娜塔莉亚站在了地下室门口，地下室上绑满了铁链。\n布拉姆：真相就在这里，你不是早已拿到了钥匙，打开吧。（The truth is right here. You already got the key, didn't you? Open it.）\n▲娜塔莉亚看到地下室的门，眼神惊愕，心跳加速。\n\n三卡\n\n\n第二十九集\n29-1\n夜  内   收藏室\n人物    娜塔莉亚  布拉姆\n▲娜塔莉亚盯着地下室的门，里面安安静静。\n娜塔莉亚（担心）OS：怎么没声了？难道姐姐已经遇害了？（Why is it quiet? Is my sister already dead?）\n▲布拉姆搂着娜塔莉娅的腰，从裙子腰封里摸出钥匙，打开了地下室旁边的一道门。\n布拉姆（看娜塔莉亚）：进来吧。（Come on in.）\n娜塔莉亚（惊讶）：这是……（This is...）\n▲布拉姆打开灯，娜塔莉亚被眼前的场景惊呆了，只见收藏室里面，全是玛莉的照片，婚纱照，合照，抱着孩子的照片，还有全家福。\n布拉姆（抚摸照片）：这是我的妻子玛莉，是戴安娜的母亲。（This is my wife, Mary. Diana's mother.）\n▲娜塔莉亚看着墙上的照片，有一张是玛莉抱着戴安娜的照片。(定格照片转场）\n【闪回】\n日  内  破旧房屋\n人物  小玛莉  小娜塔莉亚\n▲小玛莉抱着小娜塔莉亚。\n小娜塔莉亚（天真）：被姐姐抱在怀里，总是很安心！（Being in your arms always makes me feel safe!）\n小玛莉：那姐姐就一直抱着你。（Then I'll keep holding you.）\n【闪回结束】\n▲娜塔莉亚捏着裙摆，打量着照片，故意露出了惊讶的神色。\n娜塔莉亚（紧张）：这么多照片，天啊，教父，您一定很爱她吧。（So many photos. Godfather, you must have loved her so much.）\n布拉姆（表情眷恋）：是的，我很爱她，我们在一起十年，她跟我在一起的时候，我一无所有，是她鼓励我，我才有了今天。（Yeah, I loved her. We were together for ten years. I had nothing when we met, but she always believed in me. I wouldn't be where I am today without her.）\n▲娜塔莉亚看着照片，布拉姆观察着娜塔莉亚的表情，嘴角勾起了一个弧度，他深情地抚摸着全家福。\n布拉姆：在塞莱特斯没出现之前，我们曾是最幸福的一家人，可我的妻子太善良了，相信了贵族的谎言，最后被……（Before Celeste came, we were the happiest family. But my wife was too kind. She believed the nobles' lies, and in the end she was...）\n▲布拉姆哽咽了一下，娜塔莉亚回头看向了布拉姆。\n娜塔莉亚（惊讶）：您别这样，她看见您难过，也会难过的。（You don't have to do this. She wouldn't want to see you hurting like this.）\n布拉姆（落泪）：我们不过是权贵的玩物，只能向权贵低头。（抚摸着全家福）我娶塞莱特斯是怕他们继续出手伤害我的女儿。（We're just toys to the powerful. We have no choice but to do what they say. I married Celeste because I was afraid they'd hurt my daughter again.）\n▲这时，一张照片从全家福里面落了下来，照片上：塞莱特斯站在玛莉面前，玛莉红着眼睛望着塞莱特斯。娜塔莉亚惊愕地看着照片。\n娜塔莉亚OS：这是……塞莱特斯没跟我说过她见过姐姐，难道之前的话是在说谎？（This is... Celeste never told me she met my sister. Was she lying before?）\n▲布拉姆观察着娜塔莉亚的表情，捡起了照片。\n布拉姆（悲伤）：娜塔莉亚，我大概知道你是谁了，戴安娜已经失去了母亲了，不能再失去父亲了对吗？（Natalia, I think I know who you are. Diana already lost her mother. She can't lose her father too, right?）\n▲娜塔莉亚一步步后退。\n娜塔莉亚（惊愕）：什么？您知道我是谁？（What? You know who I am?）\n\n\n第三十集\n30-1\n夜  内  画室\n人物  娜塔莉亚  布拉姆\n▲布拉姆步步紧逼，娜塔莉亚步步后退。\n娜塔莉亚：我不太明白您在说什么，我只是……（I don't really know what you mean. I'm just...）\n布拉姆（打断）：嘘，你不想说，可以不说。（Shh. If you don't want to say it, you don't have to.）\n▲布拉姆将塞莱特斯和玛莉的合照放在了娜塔莉亚的手中。\n布拉姆（警告）：娜塔莉亚，权贵绝不会将我们当作人看待，即便我功成名就，伯爵仍然会把我当狗一样训斥，你野心勃勃，你觉得他们会怎么样对你。（People at the top don't see us as equals, Natalia. I built an empire, yet the Count still treats me like a dog on a leash. You're hungry for power, aren't you? What makes you think they won't crush you like a bug?）\n▲娜塔莉亚抵在了墙上，盯着布拉姆。\n娜塔莉亚（紧张）：教父，您会保护我的，对吗？（Godfather, you'll protect me, right?）\n▲布拉姆抚摸着娜塔莉亚的脸颊，一字一句地说。\n布拉姆（蛊惑）：你和我的妻子玛丽一样天真，即便是为了她，我也会保护你。你、我、戴安娜，我们才是一家人，对吗？（You're as naive as my wife Mary. Even for her sake, I'll protect you. You, me, Diana, we're the real family, right?）\n▲娜塔莉亚表情震惊。\n▲布拉姆却后退了一步。\n布拉姆（温和）：娜塔莉亚，找一找有没有治疗戴安娜的方法吧，我只想我的女儿快点好起来。（Natalia, look for a way to cure Diana. I just want my daughter to get better.）\n▲说完之后，布拉姆转身离开了，他站在门口时，又补了一句。\n布拉姆（警告）：对了，千万别靠近地下室。（扬了扬钥匙）这个，还是我来保管比较好。（By the way, stay away from the basement. As for this? It stays right where it belongs with me.)\n娜塔莉亚（点头）：是。（Yes.）\n▲布拉姆关上门出去了，娜塔莉亚盯着墙上的照片 ，轻轻抚摸了玛莉的脸颊。\n娜塔莉亚（自言自语）：如果失去父亲，戴安娜会很痛苦吧，到底谁在说谎……（If she loses her father, Diana will be devastated. Who's really lying...）\n▲布拉姆站在门口，从门缝里面看着娜塔莉亚的表情，嘴角勾起了一道弧度。\n30-2\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆 女佣\n▲娜塔莉亚正在给戴安娜拿早餐，塞莱特斯走入餐厅，眼神冰冷地盯着娜塔莉亚，她狠狠撞了一下娜塔莉亚，冷声呵斥。\n塞莱特斯：怎么？你真想将我取而代之。（What? You really want to take my place?）\n娜塔莉亚（恨）：夫人拿我做棋子玩得开心吗？（Did you enjoy using me as your pawn, ma'am?）\n▲塞莱特斯一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯：贱人！果然是你想害我！（You bitch! I knew you wanted to hurt me!）\n▲娜塔莉亚举起杯子将牛奶全部泼到了塞莱特斯的脸上。\n娜塔莉亚（愤怒）：夫人，我是戴安娜的心理医生，不是任你打骂的奴仆！（Ma'am, I'm Diana's therapist, not some punching bag for you to abuse!）\n▲众人震惊！\n▲镜头特写：布拉姆站在楼梯间静观其变。\n\n\n第三十一集\n31-1\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆\n▲布拉姆站在楼梯间，并没有阻止二人，眼神复杂地看着她们。\n▲塞莱特斯被泼了一脸。\n塞莱特斯（尖叫）：你敢泼我！你疯了吗？（You dare throw that at me? Are you insane?）\n娜塔莉亚（冷眼）：夫人，这只是给你一个教训，狂妄自大的人，将为自己的行为付出代价。（Ma'am, that's a lesson. Arrogant people pay for their behavior.）\n塞莱特斯：不过是个卑贱的下等人，敢教训我，你找死——（You low-class nobody. You dare lecture me? You're dead—）\n▲塞莱特斯擦了一把脸上的牛奶，伸手掐住了娜塔莉亚的脖子。\n塞莱特斯：贱人！我跟你拼了！（You bitch! I'll tear you apart!）\n▲娜塔莉亚也不甘示弱，抓起牛奶杯砸在了塞莱特斯的后背上。\n娜塔莉亚：放开我——（Let me go—）\n▲这时，布拉姆匆匆忙忙地走了下来。\n布拉姆（呵斥）：住手！（Stop!）\n▲布拉姆立刻将塞莱特斯的手掰开，将娜塔莉亚拉到自己的身后，冷眼盯着塞莱特斯。\n布拉姆：够了！一个心理医生，一个贵族夫人，竟然在餐厅打了起来，你们不觉得丢人吗？（Enough! A therapist and a noble lady fighting in the dining room. Aren't you ashamed?）\n塞莱特斯（疯）：丢人？（指着娜塔莉亚）这个贱人勾引你，想把我赶出这个家门，我还有什么脸面？（Ashamed? This bitch seduces you and wants to throw me out. What dignity do I even have left?）\n▲布拉姆一把抓住了塞莱特斯，不让她打娜塔莉亚。\n布拉姆（看娜塔莉亚）：你，回去照顾戴安娜。（You. Go take care of Diana.）\n▲娜塔莉亚红着眼睛瞪了塞莱特斯一眼，转身离开了。\n塞莱特斯：贱人！你别走！你给我站住！（Bitch! Don't walk away! You get back here!）\n▲布拉姆死死抓住了塞莱特斯的手臂，眼神兴奋了起来。\n布拉姆OS：互相撕咬吧，愚蠢的猎物们，真是越来越有趣了！（Tear each other apart, you stupid prey. This is getting more and more fun!）\n▲娜塔莉亚站在楼梯口，和塞莱特斯对视了一眼。\n31-2\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲夜里，塞莱特斯睁开眼睛，突然发现自己被绑在了椅子上，她挣扎了一下，布拉姆站在阴影中看着她。\n布拉姆（阴冷）：你醒了。（You're awake.）\n\n\n第三十二集\n32-1\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯惊恐地盯着布拉姆，布拉姆把玩着一柄教父权杖，低头看着塞莱特斯。\n塞莱特斯（挣扎）：布拉姆……你想干什么？（Bram... what do you want?）\n▲布拉姆一步一步走向了塞莱特斯。\n布拉姆（嗤笑）：你知道我等这一天等了多久吗？（抚摸塞莱特斯的脸颊）原来俯视贵族是这种感觉。（Do you know how long I've waited for this day? So this is what it feels like to look down on a noble.）\n塞莱特斯（惊愕）：布拉姆！我们是夫妻！你为什么想杀了我？（Bram! We're married! Why do you want to kill me?）\n布拉姆（捏着塞莱特斯的下巴）：夫妻？你从来就没有把我当作你的丈夫！（呵斥）被自己看不起的下等人掌控在手心的滋味如何？（Married? You never treated me as your husband! How does it feel to be in the hands of someone you looked down on?）\n塞莱特斯（惊讶）：我什么时候看不起你了？（When did I ever look down on you?）\n▲布拉姆掐住塞莱特斯的脖子。\n布拉姆（愤怒呵斥）：还敢说没有！你喝咖啡时优雅的德行，简直令我作呕！用餐时那套该死的礼仪，连擦嘴都要扭捏作态！你替我整理领带，就像在纠正一个不懂规矩的蠢货！你的每一个动作都在讽刺我，让我感觉自己像个不被驯养的野狗！（Still denying it! The way you drink coffee makes me sick! Those damn table manners—even wiping your mouth is a performance! When you fix my tie, it's like you're correcting a stupid fool who doesn't know the rules! Every move you make mocks me and makes me feel like an untamed dog!）\n▲塞莱特斯惊呆了，她有些窒息。\n塞莱特斯（挣扎）：你误会了！这些想法令我震惊！（You misunderstood! I'm shocked you'd think that!）\n▲布拉姆用力掐着塞莱特斯的脖子。\n布拉姆（愤怒）：什么误会？你那副天生高贵的嘴脸，早就把答案写在了脸上！（Misunderstood? That born-noble look on your face already gave the answer!）\n▲他突然松开塞莱特斯，蹲在了塞莱特斯的面前，头靠在了塞莱特斯的腿上。\n布拉姆（温和）：塞莱特斯，其实你也很崇拜我对不对？我现在已经是个合格的贵族了对吗？（Celeste, you admire me too, don't you? I'm a proper noble now, right?）\n▲塞莱特斯惊恐地看着趴在自己腿上的布拉姆，浑身发抖。\n塞莱特斯（惊恐）：求求你，放过我吧——（Please, let me go—）\n▲布拉姆突然站起来抓住塞莱特斯的头发，用枪抵着她的额头。\n布拉姆（愤怒）：说啊！说你也很崇拜啊！说你仰慕我！说啊——（Say it! Say you admire me! Say you worship me! Say it—）\n▲塞莱特斯吓得尖叫，布拉姆猛地松开了她。\n布拉姆（笑容诡异）：你们不是都好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're all curious what's in the basement, aren't you? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n\n\n第三十三集\n33-1\n夜   内   塞莱特斯的房间\n人物 娜塔莉亚 布拉姆  塞莱特斯\n▲布拉姆转身离开了，塞莱特斯吓得瘫软到了椅子上。\n塞莱特斯（咆哮）：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n▲布拉姆冷笑了一声，拿出厚厚的一叠文件递给了塞莱特斯。\n布拉姆（笑）：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲塞莱特斯盯着那些文件，脸色惨白。\n塞莱特斯（惊愕）：你，你什么时候做的这些？我怎么不知道？（When... when did you do all this? How did I not know?）\n布拉姆（得意）：就在你和娜塔莉亚斗的你死我活的时候。（高高在上）哦，对了，娜塔莉亚是我故意用来分散你的注意力的！（While you and Natalia were tearing each other apart. Oh, and Natalia? I used her to distract you on purpose!）\n33-2\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲字幕：第二天。\n字幕：第二天。（The next day.）\n▲别墅里面突然响起了女佣的尖叫声。\n女佣（尖叫）：啊！夫人，夫人她死了——（Ah! Mrs. Blackwood is dead!—）\n▲娜塔莉亚和布拉姆同时从两道不同的门里面出来，二人冲到了塞莱特斯的房间门口，只见塞莱特斯浑身是血躺在了地上。\n▲娜塔莉亚惊愕地盯着眼前的场景。\n娜塔莉亚（捂着嘴巴）OS：噢，我的老天！（Oh my God!）\n▲布拉姆冷着脸站在门口。\n布拉姆（咬牙切齿）OS：该死！她怎么就死了，还被人看见了，简直打乱了我所有的计划！（Damn it! Why did she die, and someone saw her? It ruins all my plans!）\n▲布拉姆要上前检查。\n布拉姆（看女佣）：报警吧！（Call the police!）\n布拉姆（冷静）OS：塞莱特斯死了也是一件好事情！我既保住了和伯爵的合作，又摆脱了她！（Honestly, Celeste dying might be a blessing in disguise. It keeps my alliance with the Count intact—and cuts loose my biggest dead weight）\n▲娜塔莉亚一把抓住了布拉姆的手臂，阻挡他前去检查。\n娜塔莉亚：教父，塞莱特斯不明不白死在了庄园，您是最后一个见她的人，如果您现在报警，会被怀疑的！（Godfather, Celeste died mysteriously in the estate. You were the last to see her. If you call the police now, you'll be suspected!）\n▲布拉姆抬了下手臂，示意佣人停止报警，佣人恭敬站定，布拉姆回头看向了娜塔莉亚。\n布拉姆（冷冽）：你的意思是？（What do you mean?）\n娜塔莉亚（担忧）：无论如何，您不能进入现场，一定要确保您没有丝毫的嫌疑！（Either way, you can't enter the scene. Make sure you're not a suspect!）\n▲布拉姆盯着娜塔莉亚，眼神危险。\n布拉姆OS：有意思，小兔子，我会将你彻底拉上我的船！（Interesting, little rabbit. I'll make sure you're in too deep to walk away.）\n▲布拉姆轻轻捏了一下娜塔莉亚的脸颊，似笑非笑地问道。\n布拉姆（微笑）：娜塔莉亚，你觉得怎么做更好？（Natalia, what do you think we should do?）\n▲娜塔莉亚看了一眼地上的尸体。\n娜塔莉亚（鼓起勇气）：不如将她埋了，就算她是装的，埋在地里之后，她也彻底死透了。（Why not bury her? Even if she's faking, once she's in the ground, she's dead for real.）\n▲布拉姆惊讶地看着娜塔莉亚。\n\n\n第三十四集\n34-1\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲布拉姆看了一眼塞莱特斯的尸体又看向了娜塔莉亚。\n布拉姆（蛊惑）：很好！（抚摸娜塔莉亚的脸颊）娜塔莉亚，你不是想要将塞莱特斯取而代之吗？给你一个机会。（Good. Natalia, didn't you want to replace Celeste? I'll give you a chance.）\n娜塔莉亚（惊愕）：什么？（What?）\n布拉姆（整理她的头发）：去把塞莱特斯的尸体装起来，抛入海中——我就娶你。（Bag up Celeste's body and throw it into the sea—and I'll marry you.）\n▲娜塔莉亚惊愕地看着布拉姆。\n娜塔莉亚（惊讶）：抛入海中？不是活埋吗？（Throw it into the sea? Not bury her?）\n▲布拉姆拿出手枪，在手中把玩。\n布拉姆（嗤笑）：埋在土中会留下痕迹，毁尸灭迹不是更安全？（Burying leaves traces. Destroying the body is safer, isn't it?）\n娜塔莉亚（后退）：不，我不敢——（No, I can't—）\n▲布拉姆枪口抵在了娜塔莉亚的额头上，娜塔莉亚紧张地举起双手，一步一步走了进去。\n布拉姆（看女佣）：你看见了什么？（What did you see?）\n▲女佣颤抖地站在旁边。\n女佣（恭敬）：我什么都没有看到，夫人是在晚上失踪了的。（I didn't see anything. Mrs. Blackwood disappeared last night.)\n▲布拉姆看向了屋内，娜塔莉亚正在检查塞莱特斯的尸体。\n布拉姆：死了吗？（Is she dead?）\n▲娜塔莉亚摸着她的脉搏点了点头。\n布拉姆（吩咐）：那真是很可惜（冷冽）将血迹清理干净，把尸体装起来。（What a shame. Clean up the blood and bag the body.）\n▲布拉姆站在门口点了根雪茄，烟雾缭绕中看着娜塔莉亚擦拭血迹。\n▲娜塔莉亚跪在地上擦拭着，在擦到塞莱特斯身后的时候，借着塞莱特斯的掩盖悄无声息将一直录音笔藏在了自己的口袋里。\n34-2\n夜   外   海边\n人物 布拉姆  娜塔莉亚 塞莱特斯  神秘人\n▲娜塔莉亚满头大汗，费劲地将一个巨大的袋子推入了海中，布拉姆拿着相机拍下了娜塔莉亚抛尸的画面。\n布拉姆（嗤笑）OS：就算塞莱特斯是假死，现在也死透了！（Even if Celeste was faking, she's dead for real now!）\n▲娜塔莉亚走了回去，举起手。\n娜塔莉亚：教父，都按照您的吩咐做好了。（Godfather, it's done just as you ordered.）\n▲布拉姆伸手搂着娜塔莉亚的肩膀。\n布拉姆（笑）：做得好，娜塔莉亚，现在我们是一条绳子上的蚂蚱了！（伸手牵着娜塔莉亚）走吧，我未来的妻子。（Good job, Natalia. Now we're in this together. Come on, my future wife.）\n▲娜塔莉亚回头看了一眼海面，跟着布拉姆上车了。\n▲布拉姆的车刚刚离开，一个神秘人穿着潜水服，一个猛子潜入水底。\n\n\n第三十五集\n35-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆和娜塔莉亚刚刚走入客厅，便看见莱恩和伊丽莎白还有持枪安保站在屋内。\n布拉姆（惊讶）：爸妈，你们怎么来了？（看向安保）这是什么意思？（Mom, Dad, what are you doing here? What's the meaning of this?）\n▲莱恩冷着脸站了起来。\n莱恩：我们接到消息，说塞莱特斯不见了。（We got word that Celeste is missing.）\n▲娜塔莉亚惊愕地抬头，看向了莱恩和伊丽莎白，下意识地躲在了布拉姆的身后。\n布拉姆（故作惊讶）：这怎么可能……（How is that possible...）\n莱恩（呵斥）：布拉姆！就算你现在权势滔天，如果你真的伤害了我的女儿，我也会拼尽全力，咬下你一块肉来！（Bram! Even if you're powerful now, if you hurt my daughter, I'll fight with everything I have and take a piece of you with me!）\n▲伊丽莎白猛地站了起来，情绪激动。\n伊丽莎白（哽咽）：塞莱特斯在哪儿！把她还给我！（试探）你是不是把她关在了地下室？（Where's Celeste? Give her back to me! Did you lock her in the basement?）\n▲面对伊丽莎白的指责，布拉姆眼神冷了下去，看向了娜塔莉亚。\n布拉姆OS：娜塔莉亚，我本来想让你多活几天，看来你的死期到了！（Natalia, I wanted to let you live a few more days. Looks like your time is up.）\n▲布拉姆无声看向了角落的女佣，佣跑了出来，她抬手指着娜塔莉亚。\n女佣（情绪激动）：伯爵，夫人！是娜塔莉亚杀了夫人！并将夫人的尸体抛入了海中！（Count, Countess! Natalia killed your daughter! She threw the body into the sea!）\n▲所有人的目光瞬间聚集在了娜塔莉亚的身上，娜塔莉亚下意识后退。\n娜塔莉亚（惊慌）：不，不是我——（No, it wasn't me—）\n▲女佣举起了几张照片，照片1：娜塔莉亚蹲在屋内收拾塞莱特斯的尸体。照片2：娜塔莉亚将尸体挪出别墅，还有几张资料。\n女佣（大声）：娜塔莉亚是玛莉夫人的妹妹，她怀疑是夫人杀了玛莉夫人，所以杀了夫人！（Natalia is Mary's sister. She thought Celeste killed Mary, so Natalia killed Mrs. Blackwood!）\n▲众人看到这些照片惊呆了。\n娜塔莉亚（惊恐）：不，我没有，我没有杀夫人！（No, I didn't! I didn't kill her!）\n▲女佣突然指着娜塔莉亚的裤腿。\n女佣（大喊）：看啊，娜塔莉亚的裤子上还有血迹！（Look! There's blood on Natalia's pants!）\n▲娜塔莉亚低头看着自己裤腿上的血，又迅速看向了布拉姆。\n娜塔莉亚（不敢相信）：你骗我？你想让我帮你顶罪！（You lied to me? You want me to take the fall!）\n▲布拉姆一脸痛心，把枪指着娜塔莉亚的脑袋。\n布拉姆（愤怒）：你怎么能杀了我的妻子！我现在就杀了你——（How could you kill my wife? I'll kill you right now—）\n▲布拉姆盯着娜塔莉亚，故作悲痛。\n布拉姆（得意）OS：猎物，只配被我玩弄于股掌中！（Prey only deserves to be played in my hands!）\n塞莱特斯（呵斥）vo：住手！（Stop!）\n▲众人迅速转头看向了门口，只见塞莱特斯和焦恩带着持枪的警察闯了进来。\n伊丽莎白（惊愕）：上帝啊，我的宝贝，你还活着！（My God, my baby, you're alive!）\n▲众人震惊！\n\n\n第三十六集\n36-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲伊丽莎白冲了过去，一把抱住了塞莱特斯。\n伊丽莎白（心疼）：塞莱特斯——你还好吗？他们说你死了？（Celeste—are you okay? They said you were dead?）\n塞莱特斯（看向布拉姆）：爸爸妈妈，布拉姆想杀了我，是娜塔莉亚和她的养父救了我！（Mom, Dad, Bram tried to kill me. Natalia and her adoptive father saved me!）\n▲众人震惊，布拉姆不敢相信地看着眼前的场景。\n布拉姆：养父？（Adoptive father?）\n▲他的目光落在了焦恩的身上。\n布拉姆：是你？（It's you?）\n【闪回19-1】\n男客人（歉意）：教父，不好意思，我差点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n【闪回结束】\n▲布拉姆浑身发抖。\n布拉姆OS：糟了，他们联手耍我，我中了他们的圈套！（Damn. They played me together. I fell into their trap!）\n▲塞莱特斯盯着布拉姆，大声对他们说。\n塞莱特斯（愤恨）：布拉姆囚禁我，威胁我，还想杀了我！（指着他）他还杀了他的前妻玛莉！（Bram imprisoned me, threatened me, and tried to kill me! He also killed his ex-wife Mary!）\n▲娜塔莉亚看向了塞莱特斯，有些惊愕。\n娜塔莉亚OS：姐姐死了？（My sister is dead?）\n▲众人震惊。\n莱恩（呵斥）：布拉姆——给我一个合理的解释！（Bram—give me a good explanation!）\n▲布拉姆慌了神，连忙指着焦恩和娜塔莉亚。\n布拉姆：不，不是我，塞莱特斯受到了刺激，她有被迫害妄想症！（No, it wasn't me. Celeste is traumatized. She has paranoia!）\n塞莱特斯（愤恨）：我没有病！（I'm not sick!）\n▲娜塔莉亚拦住了塞莱特斯的争辩。\n娜塔莉亚（冷笑）：布拉姆，难道连受害者的话，都是谎话吗？（Bram, are you saying even the victim's words are lies?）\n布拉姆（冷笑）：你们说凶手是我，证据呢？尸体呢？证人呢？是你们诬告我！（You say I'm the killer—where's the evidence? Where's the body? Where's the witness? You're framing me!）\n▲莱恩和伊丽莎白对视了一眼，伊丽莎白看向了塞莱特斯。\n伊丽莎白：塞莱特斯，你有证据吗？（Celeste, do you have evidence?）\n▲塞莱特斯和娜塔莉亚对视了一眼，娜塔莉亚拿出了一支录音笔。\n娜塔莉亚：我们当然有！（Of course we do!）\n▲众人震惊。\n▲娜塔莉亚打开录音笔，录音笔中，传出了尖锐的争吵声。\n【音频33-1】\n布拉姆vo：你不是好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're curious what's in the basement? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n▲众人听着音频，十分惊讶。\n\n\n第三十七集\n37-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） \n▲布拉姆表情惊愕，音频还在继续播放着。\n塞莱特斯vo：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n布拉姆vo：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲众人看向了布拉姆，莱恩冷冽发问。\n莱恩（呵斥）：布拉姆！你怎么解释！（Bram! How do you explain this?）\n布拉姆（后退半步）：这是伪造的！（看向莱恩）爸爸，请您相信我。（指着娜塔莉亚和焦恩）他们一定是为了诬陷我，用药物控制了塞莱特斯，我要求对塞莱特斯进行药检！（It's forged! Dad, please believe me. They must have drugged Celeste to frame me. I demand a drug test on Celeste!）\n▲这时，戴安娜突然抱着小熊，在楼梯间大哭了起来。\n戴安娜（惊呼）：地下室有怪物要吃掉我——我好害怕！（There's a monster in the basement that wants to eat me—I'm scared!）\n▲众人惊讶，布拉姆情绪激动。\n布拉姆（呵斥）：戴安娜！闭嘴！别瞎说！（Diana! Shut up! Don't talk nonsense!）\n▲娜塔莉亚盯着戴安娜。\n娜塔莉亚（看向了警察）：地下室，我姐姐被囚禁在了地下室！（The basement, my sister is locked in the basement!）\n37-2\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） 玛莉\n▲地下室被暴力打开，众人站在地下室门口，被眼前的景象吓到了，里面挂满了玛莉受伤害的照片，刑具，还有三副冰棺，墙上有块黑板，黑板上挂着玛莉、塞莱特斯、娜塔莉亚的照片。\n▲玛莉的编号是一，塞莱特斯编号二，娜塔莉亚编号三。\n伊丽莎白（捂着嘴惊呼）：老天，这简直是个地狱！（My God, this is a hellhole!）\n▲角落里面，有个女人，双脚被铁链锁着，浑身是伤，瘦骨嶙峋。\n娜塔莉亚（惊愕）：姐姐——（Mary—）\n\n\n第三十八集\n38-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲娜塔莉亚冲了过去，颤抖着手拨开了玛莉的头发，娜塔莉亚落泪。\n娜塔莉亚：姐姐，我是娜塔莉亚，你还认得我吗？（Mary, it's me, Natalia. Do you recognize me?）\n▲玛莉艰难地抬头，奄奄一息说不出话。\n娜塔莉亚：医生！快叫医生——（Doctor! Call a doctor—）\n▲焦恩连忙上去，给玛莉做检查。\n焦恩：我现在就带她去医院，别担心，她会脱离危险的。（I'll take her to the hospital now. Don't worry. She'll be okay.）\n▲焦恩将玛莉抱了起来，准备离开，布拉姆被警察控制着对着焦恩呵斥。\n布拉姆（愤怒）：放开她！别将她从我身边带走！把她还给我！（Let her go! Don't take her from me! Give her back to me!）\n▲娜塔莉亚转头看向了被两个警察控制住的布拉姆，抬起手一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：我姐姐陪你吃了十年的苦！还跟你有了孩子，你为什么要囚禁她？！（My sister suffered with you for ten years! She had your child! Why did you imprison her?!）\n▲事情败露，布拉姆也不装了。\n布拉姆（冷笑）：谁让她不答应给我做情妇？（Well... that's what happens when she refuses to be my mistress.）\n▲众人震惊。\n布拉姆：我要成为贵族，我需要塞莱特斯的帮助！玛莉却非要离开我！（I wanted to become a noble. I needed Celeste's help! But Mary insisted on leaving me!）\n▲布拉姆看着焦恩的背影。\n布拉姆（疯狂）：可我爱她，我不能让她离开我，不能让别的男人染指他！我要她永远留在我身边！（But I love her. I can't let her leave me. I can't let another man touch her! I want her by my side forever!）\n▲娜塔莉亚又一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：你简直就是个恶魔！（You're a monster!）\n布拉姆（不甘心）：恶魔？对，我就是恶魔！（看塞莱特斯）塞莱特斯，我也爱你啊，我也想把你永远留在我身边！（Monster? Yes, I'm a monster! Celeste, I love you too. I wanted to keep you by my side forever!）\n▲伊丽莎白连忙挡在塞莱特斯的面前，看向了娜塔莉亚。\n伊丽莎白（感激）：娜塔莉亚，幸亏你聪明，不然我女儿就要惨遭毒手了！（Natalia, thank God you're smart. Otherwise my daughter would've been killed!）\n布拉姆（疯狂）：什么聪明？不过是运气好罢了，两个蠢货被我挑拨得大打出手！（看向了焦恩）要不是这个老东西插手，他们都要死！（Smart? Just luck. Two fools I played against each other! If this old bastard hadn't interfered, they'd all be dead!）\n娜塔莉亚（冷笑）：是吗？到现在，你还认为你才是猎人吗？（Really? Even now, you still think you're the hunter?）\n布拉姆（惊愕）：你什么意思？（What do you mean?）\n娜塔莉亚：从宴会开始，一切就都在我们的计划之中了！（Everything has been our plan since the banquet started!）\n【闪回20-1】\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的男性客人（焦恩），路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n镜头特写：在焦恩撞过来的时候，娜塔莉亚将纸条塞入了焦恩的手中。\n纸条内容（娜塔莉娅vo）：爸爸，救我们出去。（Dad, get us out.）\n【闪回结束】\n布拉姆（不敢相信）：你说什么？（What did you say?）\n▲娜塔莉亚盯着布拉姆。\n娜塔莉亚：我很清楚，你从一开始就知道我是玛莉的妹妹，是你引我入局的。（I know perfectly well you knew I was Mary's sister from the start. You lured me into this.）\n▲布拉姆震惊。\n\n\n第三十九集\n39-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆惊愕地看着娜塔莉亚，娜塔莉亚一步一步走向了布拉姆。\n娜塔莉亚（冷笑）：姐姐的照片和书信，是你寄到我曾经的家里的，戴安娜床底下的日记本也是你放的，对不对。（You mailed my sister's photos and letters to my old home. You also put the diary under Diana's bed, didn't you?）\n▲布拉姆惊呆了。\n布拉姆（不可思议）：你是怎么知道的？（How did you know?）\n娜塔莉亚（冷笑）：因为庄园守卫森严，如果不是你默许的，姐姐的遗书和照片，不可能邮寄到我手中。（Because this estate is heavily guarded. Unless you allowed it, my sister's letter and those photos could never reach me.）\n布拉姆（惊讶）：什么遗书？我做得天衣无缝，你怎么可能发现？（What letter? I was flawless. How could you find out?）\n娜塔莉亚（嗤笑）：你有一句话说得很好，“真正的猎人，往往会以猎物的方式出现”。（You said one thing right: \"The real hunter often appears as the prey.\"）\n布拉姆（不可置信）：你听到了？（You heard that?）\n▲娜塔莉亚挑眉。\n【闪回衔接5-1】\n▲娜塔莉亚牵着戴安娜往房间走，突然，塞莱特斯的房间里面传来了用力的砸门声，娜塔莉亚上前摁住了把手。\n娜塔莉亚（惊愕）OS：塞莱特斯在里面？（回头看书房）她不是在书房和布拉姆吵架吗？（Celeste is in there? Wasn't she arguing with Bram in the study?）\n【闪回结束】\n▲娜塔莉亚看向了布拉姆。\n娜塔莉亚：捕猎游戏中，算错了一步，都会万劫不复——（In a hunting game, one wrong step and you're finished—）\n布拉姆（不敢相信）：不不不，你们不都怀疑对方吗？好几次你们都出卖了对方，还大打出手了！（No, no, no. Weren't you suspicious of each other? You sold each other out several times and even fought!）\n娜塔莉亚：如果我们不假装自相残杀，你怎么对我们放松警惕，怎么会一步一步暴露你的真面目？（If we hadn't pretended to tear each other apart, how would you have let your guard down? How would you have revealed your true face step by step?）\n塞莱特斯：其实宴会上，我爸爸妈妈也早就看出了端倪，只是时机还不到。（Actually, my parents saw something at the banquet too. The time just wasn't right.）\n▲布拉姆惊愕地看着塞莱特斯和莱恩，不敢置信地开口。\n布拉姆：什么意思？（What do you mean?）\n▲莱恩冷眼盯着布拉姆。\n莱恩（冷笑）：因为真正的贵族不会在公共场合大吵大叫，即便我的女儿精神失常了，骨子里的涵养也不会丢失！只有你这种人，才不懂这种规矩！（Because real nobles don't scream in public. Even if my daughter lost her mind, her breeding wouldn't disappear! Only someone like you doesn't understand that rule!）\n▲娜塔莉亚笑着看着布拉姆。\n娜塔莉亚：我提议将塞莱特斯的尸体埋在地下时，你也担心我要算计你，所以故意说抛入海中？可恰巧，我猜到了你不会按照我说的做！（When I suggested burying Celeste's body, you were afraid I was setting you up, so you said throw it into the sea. But I guessed you wouldn't do what I said!）\n▲布拉姆彻底崩溃了。\n布拉姆（惊愕）：你们耍我？你们联手耍我！（You played me? You played me together!）\n莱恩（呵斥）：把他带走！我要他为他的算计付出代价！（Take him away! I want him to pay for his schemes!）\n▲布拉姆被带走，和娜塔莉亚擦肩而过的时候，他突然笑了，他盯着娜塔莉亚。\n布拉姆（低声）：娜塔莉亚，你收到的遗书不是我写的，你再好好想想，谁才是真正的猎人。（嘲笑）你眼中的小可怜，身上流的可是恶魔的血！（Natalia, I didn't write the note you received. Think again—who's the real hunter? The poor little thing you pity has the blood of a monster!）\n▲娜塔莉亚惊愕地回头看向了布拉姆，布拉姆对着娜塔莉亚诡异一笑，跟着警察离开了。\n塞莱特斯（安抚）：娜塔莉亚，布拉姆最擅长玩弄人心，你别被他的话蛊惑了——（Natalia, Bram is a master at playing with people's minds. Don't let him mess with your head—）\n▲娜塔莉亚盯着布拉姆的背影久久回不过来神。\n\n\n第四十集\n40-1\n日  内  戴安娜的房间\n人物 娜塔莉亚  戴安娜  玛莉\n▲娜塔莉亚在帮戴安娜整理书籍和绘本。\n娜塔莉亚vo：布拉姆在伯爵的介入下，被判处了死刑，戴安娜和姐姐继承了他所有的家产，我终于和姐姐终于重逢了。（With the Count's involvement, Bram was sentenced to death. Diana and my sister inherited everything he owned. I was finally reunited with my sister.）\n▲娜塔莉亚整理书柜，突然一个盒子掉了下来，里面的东西撒了出来，里面是一张娜塔莉亚的照片。\n娜塔莉亚（惊讶）：这里怎么会有我的照片。（How did my photo get here?）\n▲娜塔莉亚捡起照片，突然发现照片下面有一行小字，镜头特写：找到你了。（儿童字体：found you)\n镜头特写：找到你了。\n戴安娜vo：找到你了。(found you)\n▲娜塔莉亚握紧照片，看着字迹。\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——(儿童字体：Help me )\n镜头特写：救我——(儿童字体：Help me )\n【闪回结束】\n▲娜塔莉亚死死盯着这行字。\n娜塔莉亚（惊愕）OS：这字迹，和我收到姐姐的遗书上的字迹一模一样！（This handwriting is exactly the same as the note I got from my sister!）\n▲戴安娜的声音突然响起。\n戴安娜：小姨，你在看什么？（Auntie, what are you looking at?）\n▲娜塔莉亚回头，只见戴安娜站在门口抱着兔子看着娜塔莉亚，表情冷漠，娜塔莉亚连忙将照片藏起来，笑着摸了摸戴安娜的头发。\n娜塔莉亚：没什么。（Nothing.）\n▲这时，楼下响起了车子鸣笛声。\n娜塔莉亚（高兴）：听，是你妈妈出院回来了，我们快去迎接她吧！（Listen, your mom's back from the hospital. Let's go welcome her!）\n▲戴安娜瞬间恢复了孩童的笑容，牵着娜塔莉亚的手，乖巧地点了点头，她又回头看着那个盒子，勾唇一笑。\n40-2\n日  内  庄园客厅\n人物  塞莱特斯   娜塔莉亚   戴安娜   佛西   焦恩  玛莉\n▲娜塔莉亚牵着戴安娜的手路过壁炉时，偷偷将写着字的照片丢入了壁炉中烧掉了。\n▲这时，焦恩推着轮椅进来，玛莉坐在轮椅上，气色还不错。\n玛莉（虚弱）：戴安娜，娜塔莉亚。（Diana, Natalia.）\n▲戴安娜欢呼雀跃的跑过去，紧紧抱住了玛莉的手臂。\n戴安娜：妈妈！我好想你。（哽咽）我以为再也见不到您了。（Mommy! I missed you so much. I thought I'd never see you again.）\n▲玛莉轻轻抚摸着戴安娜的头发，又看向了娜塔莉亚。\n玛莉（招手）：来，让我看看。（Come here. Let me see you.）\n▲娜塔莉亚眼泪瞬间滚落，她一步一步走向了玛莉，半蹲在了玛莉的面前。\n娜塔莉亚（哽咽）：姐姐……（Mary...）\n▲玛莉伸手抚摸着她的头发。\n玛莉（温和）：傻瓜，为什么要冒险救我，如果你遇到了危险，我永远无法原谅自己。（Silly girl. Why risk your life to save me? If something happened to you, I'd never forgive myself.）\n▲娜塔莉亚趴在了玛莉的腿上，一下子哭了起来。\n娜塔莉亚：我好想你，我什么都不在乎，我只想找到你，你答应过等我的。（I missed you so much. I didn't care about anything else. I just wanted to find you. You promised you'd wait for me.）\n▲玛莉温和地抚摸着娜塔莉亚的头发。\n玛莉（安抚）：还是和小时候一样爱哭鼻子。（Still such a crybaby, just like when you were little.）\n▲焦恩拍了怕娜塔莉亚的肩膀。\n焦恩：别哭了，你妈妈一会儿就到，看见你哭鼻子又要心疼了。（Stop crying. Your mom will be here soon. She'll be heartbroken to see you crying.）\n戴安娜（乖巧）：对啊，小姨，我们一家团聚了，应该庆祝——（Right, Auntie. We're all together now. We should celebrate—）\n▲这时，塞莱特斯捧着鲜花了，带着一个男人【塞莱特斯的男友 佛西】进来。\n塞莱特斯（开朗）：嗨~娜塔莉亚，听说玛莉姐姐出院了，我们来看看她，给你们介绍一下，这是我的新男友，佛西。（Hi, Natalia. I heard Mary's out of the hospital, so we came to see her. Everyone, this is my new boyfriend, Fossey.）\n▲娜塔莉亚擦了眼泪站起来，抬头看向佛西时，瞳孔微缩。\n娜塔莉亚（惊愕）OS：是他！（It's him!）\n▲佛西对着娜塔莉亚挥了挥手。\n佛西（笑容诡异）：好久不见，娜塔莉亚。（Long time no see, Natalia.）\n"
}
```

---
## 第 9 轮（耗时：6954 ms (6.95 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.searchProvenanceCandidates, user.ask`

### [第 9 轮] 模型原始输出
```text
状态检查：
- 当前正在执行“精读 1-2 医院办公室正文”这一步，本轮 script.read 已成功返回 1-2 全部 6 个段落。
- 关键事实：娜塔莉亚【字幕：心理医生娜塔莉亚 22岁】，坐在椅子上捏照片，握书信落泪，独白“等待多年的姐妹重逢，等来姐姐遗照”；玛莉vo揭示娜塔莉亚是玛莉的妹妹、有外甥女需带走。段落2、4、5为娜塔莉亚纯出场/动作/本人台词，可归入 provenances；段落3说话人为玛莉vo，不可归入。
- 按增量闭环准则，本轮应立即落地资产创建（含 1-2 出处），后续场次用 update 追加。
- 下一步：调用 sys.selectContext 装载写入工具 asset.create，随后创建资产。

思考：
依据本轮原文，娜塔莉亚 description 可写：心理医生，22岁，玛莉的妹妹，为救外甥女卷入户布莱克伍德家相关事件；外貌暂缺（职业装/黑框眼镜待后续场次补齐）。provenances 取 1-2 段落 2、4、5。需先装载 asset.create 工具。

工具调用：
{{调用 sys.selectContext, {"tools": ["asset.create"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“我已经精读完 1-2 医院办公室，拿到了娜塔莉亚首次出场的原文（心理医生、22岁、玛莉的妹妹）。接下来我先把她作为角色资产建立起来，再把后面几场的描写逐步追加进去。”
- 对用户说的话（简版）：“1-2 已读完，先建娜塔莉亚资产，再逐场追加细节～”
}
```

### [第 9 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "asset.create"
  ],
  "level": 1
}
```
**工具输出 (Output)**：
```json
{
  "level": 1,
  "tools": [
    "asset.create"
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
## 第 10 轮（耗时：7292 ms (7.29 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, asset.create, user.ask`

### [第 10 轮] 模型原始输出
```text
状态检查：
- 当前计划步骤：[ ] 调用 asset.create 创建娜塔莉亚角色资产并绑定 1-2 出处段落（2、4、5）。这是本轮要推进的步骤。
- 本轮工具返回：sys.selectContext 已成功装载 asset.create；1-2 正文关键段落已确认（段落2字幕22岁心理医生、段落4握书信落泪、段落5本人台词；段落3为玛莉vo不可归入）。
- 后续待推进：1-3幼年判定、1-4、1-5家、1-5庄园、全局核验。
- 下一步行动：调用 asset.create 创建娜塔莉亚，写 description + role + provenances(段落2、4、5)。

思考：
1-2 精读已完成，provenances 段落 2（视觉出场+字幕）、4（动作落泪）、5（本人台词）均依据充分，段落3为玛莉vo排除。description 需含首次出场位置（1-2医院办公室）、身份（玛莉妹妹、心理医生22岁）。先落地初始资产，后续场次用 update 增量追加。

工具调用：
{{调用 asset.create, {"type": "characters", "name": "娜塔莉亚", "role": "女主角/心理医生", "description": "首次出场于第一集1-2医院办公室。22岁心理医生，字幕标注【心理医生娜塔莉亚 22岁】。玛莉的妹妹，收到姐姐玛莉血书得知其死于布莱克伍德家，需带姐姐的女儿（外甥女）离开牢笼。外貌见1-5布莱克伍德庄园：职业装、黑框眼镜。幼年形态为8岁“小娜塔莉亚”（1-3贫民窟回忆）。", "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。", "provenances": [{"sceneTitle": "1-2 日 内 医院办公室", "paragraphIndex": 2}, {"sceneTitle": "1-2 日 内 医院办公室", "paragraphIndex": 4}, {"sceneTitle": "1-2 日 内 医院办公室", "paragraphIndex": 5}]}}}
用户沟通：
{
- 对用户说的话（完整版）：“正在为你创建娜塔莉亚角色资产，先落地1-2医院办公室首次出场的设定与出处，随后会依次精读1-3幼年、1-4、1-5家、1-5庄园逐场追加，确保只提取第一集内内容。”
- 对用户说的话（简版）：“正在创建娜塔莉亚资产，稍后逐场补充1-3至1-5庄园的出场。”
}
```

### [第 10 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.create` (succeeded)
**工具输入 (Input)**：
```json
{
  "type": "characters",
  "name": "娜塔莉亚",
  "role": "女主角/心理医生",
  "description": "首次出场于第一集1-2医院办公室。22岁心理医生，字幕标注【心理医生娜塔莉亚 22岁】。玛莉的妹妹，收到姐姐玛莉血书得知其死于布莱克伍德家，需带姐姐的女儿（外甥女）离开牢笼。外貌见1-5布莱克伍德庄园：职业装、黑框眼镜。幼年形态为8岁“小娜塔莉亚”（1-3贫民窟回忆）。",
  "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
  "provenances": [
    {
      "sceneTitle": "1-2 日 内 医院办公室",
      "paragraphIndex": 2
    },
    {
      "sceneTitle": "1-2 日 内 医院办公室",
      "paragraphIndex": 4
    },
    {
      "sceneTitle": "1-2 日 内 医院办公室",
      "paragraphIndex": 5
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
      "id": "char_1794137305183_eqhut_0",
      "name": "娜塔莉亚",
      "role": "女主角/心理医生",
      "description": "首次出场于第一集1-2医院办公室。22岁心理医生，字幕标注【心理医生娜塔莉亚 22岁】。玛莉的妹妹，收到姐姐玛莉血书得知其死于布莱克伍德家，需带姐姐的女儿（外甥女）离开牢笼。外貌见1-5布莱克伍德庄园：职业装、黑框眼镜。幼年形态为8岁“小娜塔莉亚”（1-3贫民窟回忆）。",
      "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
      "verifiedProvenance": [
        {
          "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
          "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
          "id": "vp_char_1794137305183_eqhut_0_para_5_547",
          "sceneId": "sc-7-151",
          "sceneTitle": "第一集 1-2 日  内   医院办公室",
          "matchedTerm": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
          "evidenceText": "娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）",
          "anchorText": "握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 547,
          "lineNumber": 15
        }
      ],
      "provenanceStatus": "verified",
      "verifiedScriptHash": "82128:gpb4h7",
      "sourceScenes": [
        "第一集 1-2 日  内   医院办公室"
      ]
    }
  ],
  "message": "成功在项目【characters】中新增 1 个资产条目。"
}
```

---
## 第 11 轮（耗时：5241 ms (5.24 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, asset.create, user.ask`

### [第 11 轮] 模型原始输出
```text
状态检查：
- 当前正在执行“精读1-3贫民窟门口正文，判定幼年归并并追加出处”这一步。
- 本轮 asset.create 已成功创建娜塔莉亚资产（ID: char_1794137305183_eqhut_0），基本信息+1-2出处已落地。但当前计划尚未精读1-3、1-4、1-5家、1-5庄园。
- 现有资产 description 已预留幼年形态与1-5外貌描述，但尚未用1-3正文核验、未追加1-3/1-4/1-5出处。
- 下一步：读取1-3正文。

思考：
当前需要精读 1-3 贫民窟门口，确认“小娜塔莉亚（8岁）”段落的说话人与动作归属，判断是否为同一角色幼年版，并决定给哪个版本追加出处。需先用 script.read 读取1-3正文事实，才能写入。script.read 目前不在直接可调用列表（当前只装载了 asset.create），需先切换装载 script.read。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.read", "asset.update"], "level": 1}}}
用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的角色资产已经建好啦，第一集1-2医院办公室的出场已经录进去了。接下来我把1-3到1-5的出场和台词一步步补上，先把1-3贫民窟那段读出来核验一下幼年版。”
- 对用户说的话（简版）：“角色已建好，接着补1-3到1-5的出场~”
}
```

### [第 11 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.read",
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
    "script.read",
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
## 第 12 轮（耗时：4228 ms (4.23 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.update, user.ask`

### [第 12 轮] 模型原始输出
```text
状态检查：
- 当前正在执行计划第6步：精读1-3贫民窟门口正文，判定“小娜塔莉亚（8岁）”是否作为幼年别名归并并追加出处。
- 本轮工具返回：asset.create 成功创建娜塔莉亚资产（ID: char_1794137305183_eqhut_0），已绑定1-2段落2、4、5出处；sys.selectContext 已装载 script.read、asset.update。
- 后续步骤：1-3精读→1-4→1-5家→1-5庄园→全局核验。
- 下一步行动：读取1-3正文。

思考：
资产已创建成功，现在需要读取1-3贫民窟门口正文，确认“小娜塔莉亚（8岁）”的出场段落与台词，判定是否归并为幼年形态并追加出处。调用 script.read 读取1-3场。

工具调用：
{{调用 script.read, {"episode": "第一集", "scene": "1-3"}}}
用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的角色资产已经建好了，现在我去读1-3贫民窟那场，确认她8岁幼年回忆的段落，再补进去。”
- 对用户说的话（简版）：“资产已建好，正在读1-3幼年回忆段落补出处～”
}
```

### [第 12 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": "第一集",
  "scene": "1-3"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 1653,
  "offset": 1,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 1,
  "paragraphCount": 9,
  "hasVolumeWarning": false,
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 1,
      "paragraphCount": 9,
      "scenes": [
        {
          "index": 1,
          "id": "scene-17-679",
          "sceneNumber": "1-3",
          "title": "1-3 日 外 贫民窟门口",
          "type": "EXT",
          "timeOfDay": "日",
          "locationName": "贫民窟门口",
          "characterNames": [
            "小娜塔莉亚",
            "8岁",
            "小玛莉（姐姐",
            "13岁）",
            "养父",
            "养母"
          ],
          "paragraphCount": 9,
          "paragraphs": [
            {
              "index": 1,
              "text": "▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。"
            },
            {
              "index": 2,
              "text": "养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）"
            },
            {
              "index": 3,
              "text": "▲小玛莉一把将小娜塔莉亚推向了养父。"
            },
            {
              "index": 4,
              "text": "小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）"
            },
            {
              "index": 5,
              "text": "▲切镜。"
            },
            {
              "index": 6,
              "text": "▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。"
            },
            {
              "index": 7,
              "text": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）"
            },
            {
              "index": 8,
              "text": "▲小玛莉身影模糊，小娜塔莉亚落泪。"
            },
            {
              "index": 9,
              "text": "【闪回结束】"
            }
          ]
        }
      ]
    }
  ],
  "content": "第一集\n1-1\n夜  内   地下室\n人物  玛莉\n▲空荡的地下室里，玛莉双手被铁链绑着，跪在地上，她头发散乱瘦骨嶙峋，脸上带着血迹，一只手从黑暗中伸出来，捏住了玛莉的下巴，逼迫她抬头，玛莉恐惧地看向了镜头。\n玛莉（哀求）：救救我…… （Please... somebody help me...）\n\n1-2\n日  内   医院办公室\n人物  娜塔莉亚 \n（to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n1-3 贫民窟门口   日   外 \n人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n1-4\n日  内   医院办公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（Help me)\n玛莉（旁白）：救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n1-5\n日  内  娜塔莉亚家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）\n1-5\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)\n▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。\n管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)\n▲众人唏嘘。\n管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)\n▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。\n管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)\n▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。\n管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)\n应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)\n应聘者2：我也放弃 (Me too, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】\n塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）\n\n第二集\n2-1日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲娜塔莉亚打量着塞莱特斯。\n娜塔莉亚OS：她就是布拉姆的现任妻子塞莱特斯，王室的后裔，母亲是财阀之女，传闻是一位骄矜傲慢的贵族千金。（So this is Bram’s current wife, Celeste. Royal bloodline, heiress to a mega-corporation... as spoiled and arrogant as the rumors say.）\n▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。\n布拉姆：够了，塞莱特斯，别无理取闹了！（Enough, Celeste! Stop making a scene!）\n塞莱特斯（冷冽）：布拉姆，你许诺过只爱我一个人，（指着娜塔莉亚）为什么要让这个女人踏入家门？（Bram, you promised I'd be the only woman in your life! So why are you bringing her into our home?!）\n布拉姆（无奈）：她只是女儿的心理医生，难道，连给孩子看病的人，你都无法容忍吗？（She’s just our daughter’s therapist! Can’t you even allow someone to help our sick child?）\n▲塞莱特斯鄙夷地瞥了一眼娜塔莉亚。\n塞莱特斯（冷冽）：我绝不允许她踏进这个家！（I will NEVER let her step foot in this house!）\n▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。\n布拉姆：当初你明知道我有妻子，依旧主动靠近我，如今却要剥夺我女儿治病的权利，你未免太冷酷了！（When we met, you knew I was already married, yet you still threw yourself at me. And now you're keeping my daughter from getting the help she needs? Don't you think you're being a little too heartless?!）\n▲塞莱特斯愣住了，娜塔莉亚抬头打量着二人。\n娜塔莉亚OS：是塞莱特斯主动向布拉姆示好？（打量塞莱特斯）莫非是她？(Celeste was the one who went after Bram? Was it her?)\n▲娜塔莉亚握紧了拳头。\n娜塔莉亚（恨）OS：如果她是真凶，我会亲手撕碎她的一切，逼迫她说出姐姐的下落！(If she's the monster behind this... I will tear her life to pieces and force her to tell me where my sister is!)\n▲娜塔莉亚上前一步，递出自己的简历。\n娜塔莉亚（恭敬）：夫人，我是持证的儿童心理医生，这是我的简历，请您予以信任……(Ma'am, I am a certified pediatric therapist. Here is my resume. Please, allow me to prove my worth...)\n▲娜塔莉亚的话还没说完，塞莱特斯一把将简历摔在了娜塔莉亚脸上，纸张漫天飞舞。\n塞莱特斯（命令）：别以为我看不出来你的心思！立刻给我滚出去！【4】(I know exactly what you're up to. Now get out!)\n▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。\n布拉姆：塞莱特斯！克制你的行为！（看娜塔莉亚）你离开吧，我会支付一笔钱作为补偿。(Celeste, that's enough! You can go. I'll pay you for your trouble.)\n▲娜塔莉亚惊愕地抬头，塞莱特斯。\n娜塔莉亚OS：不，我绝不能就这样离开！(No... I can't walk away now!)\n▲就在这时，一个孩子光脚跑了出来，她拿着一个花瓶砸坏了门口的装饰，踩坏了花圃。\n女佣（追逐）：小姐！快回来，该吃药了！(Miss Diana! Please stop, it's time for your medicine!)\n▲娜塔莉亚看向了孩子。\n娜塔莉亚（惊愕）OS：那就是姐姐的女儿？(Is that... Mary's daughter?)\n▲戴安娜突然飞快跑向了关着饿狼的笼子。【5】\n布拉姆（呵斥）：戴安娜！停下！(Diana! Stop right there!)\n▲娜塔莉亚飞快冲了过去，一把抱住了戴安娜。\n娜塔莉亚：别靠近！那里很危险！(Get back! It's dangerous!)\n戴安娜（挣扎）：放开我！ (Let go of me! Get off!)\n▲戴安娜发病举起花瓶砸向了娜塔莉亚的脑袋。【6】\n女佣（惊呼）：小心！(Watch out!)\n▲娜塔莉亚一把握住了戴安娜的手，另一只手轻轻拍她的背安抚。\n娜塔莉娅：放下吧。（let it go,一语双关，辛苦本土化老师确认是否可以这样翻译 (可以的，这样说挺地道的）（见黛安娜放下花瓶，松了口气）你做的很好。(Just let it go... You did so good.)\n娜塔莉娅：（看着管家，低声说）快把帘子盖上。（Cover the cage. Now.）\n▲管家立刻盖上帘子遮住野狼。\n娜塔莉娅：都退开些，别刺激她！（Everyone step back. Don't crowd her!）\n▲布拉姆一抬手，众人立刻退开。\n▲娜塔莉亚解开脖子上的丝巾铺在地上，让黛安娜的双脚踩上去。\n娜塔莉娅：你这样太过危险，要不要玩一些更有意思的游戏？比如，吹蜡烛，像我这样……（Walking bare-foot is way too dangerous, sweetie. How about we play a fun game instead? Like... blowing out birthday candles. Look at me...）\n▲娜塔莉娅举起黛安娜的一根手指当作蜡烛，深呼吸然后吐气，黛安娜学着娜塔莉娅的样子也深呼吸起来，情绪得到了稳定。\n▲戴安娜的情绪像是得到了安抚，对着娜塔莉亚笑了起来。\n女佣（捂嘴）：哦，上帝啊，我从未见过小姐这么快平复情绪！（Oh my god... I've never seen  Miss Diana calm down so fast!）\n娜塔莉娅：小姐，别怕，你安全了。（It's ok. You're safe now.）\n黛安娜（凑到娜塔莉娅耳边）：你也安全了。（So are you.）\n▲娜塔莉娅一惊。\n\n\n第三集\n3-1\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲戴安娜拽住了娜塔莉亚的衣摆，看向了布拉姆。\n戴安娜：爸爸，我要她陪我玩儿！(Daddy, I want her to play with me!)\n▲布拉姆摸了摸戴安娜的头。\n布拉姆：如你所愿。（看娜塔莉亚）既然孩子接纳你，你可以留下。（威胁）但是……(Whatever you want. If Diana wants you here, you can stay. But...)\n▲布拉姆的目光看向了狼笼的方向，娜塔莉亚也跟着他的目光看了过去。\n娜塔莉亚（鞠躬）：我明白您的意思，我会照顾好小姐的，请您放心。(I understand, sir. I'll take good care of Miss Diana. You have my word.)\n布拉姆（满意）：带小姐去休息吧。(Take her to her room to rest.)\n▲娜塔莉亚将光脚的戴安娜抱了起来。\n娜塔莉亚：是。(Yes, sir)\n▲娜塔莉亚心中疑惑。\n娜塔莉亚（疑惑）OS：教父看起来非常疼爱戴安娜，为什么姐姐会称这里是牢笼？(The Godfather dotes on Diana so much... So why did my sister call this place a hellhole?)\n▲塞莱特斯死死握着拳头，在和娜塔莉亚擦肩而过时，压低声音警告。\n塞莱特斯（小声）：你会为你今天的决定付出代价的！(You're gonna regret this!)\n娜塔莉亚（温和）：夫人，我只是一个心理医生，听不懂你在说什么。(I'm just a therapist, ma'am. I'm afraid I don't know what you mean.)\n▲娜塔莉亚收回目光，抱着戴安娜一步一步走向了大门，大门打开，屋内富丽堂皇的装饰映入眼帘。\n娜塔莉亚OS：我的姐姐就这里，我不但要找到她的下落！还要保护戴安娜，还要让姐姐和戴安娜合法继承所有财产！【7】(My sister is here. I'll find out what happened to her, protect Diana, and make sure they both get their rightful share of the inheritance!)\n▲布拉姆轻轻抚摸了一下塞莱特斯的头发。\n布拉姆：不过是一个心理医生而已，没必要将她放在心上。(She’s just a shrink, babe. No need to waste your energy on her.)\n▲塞莱特斯下意识后退了一步，看向了娜塔莉亚的背影。\n塞莱特斯：是吗？(Is that so?)\n布拉姆（安抚）：好了，塞莱特斯，你的身体欠佳，回去休养吧。(Come on, Celeste. You're not feeling well. Go get some rest.)\n▲布拉姆也随着她的目光看向了娜塔莉亚的背影。\n布拉姆OS：又一个有趣的猎物，送上门来了！(Well, well...Another little mouse walked right into my trap.)\n▲布拉姆看了一眼管家。\n布拉姆：加强庄园守卫，没有我的命令，任何人都不许出去！【8】(Double the security. No one leaves this estate without my permission!)\n\n3-2\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  \n▲公主房内，戴安娜躺在华丽的公主床上，闭上眼睛，娜塔莉亚给她读故事。\n娜塔莉亚（温柔）：最后，公主和王子拥有了属于他们的幸福生活……(And in the end, the prince and princess lived happily ever after...)\n▲这时，花园传来微弱的呼救。\n（画外音，女声惨叫）vo：啊——救命——(Aah! Somebody help me!)\n▲娜塔莉亚惊愕看向了外面。\n娜塔莉亚OS：呼救？是姐姐吗？(A scream for help? Was that... my sister?!)\n▲娜塔莉亚连忙起身出门。\n\n3-3\n日  外  花园\n人物  娜塔莉亚  管家\n▲娜塔莉亚悄悄在花园里面走，花园里面装饰与建筑物遮挡视线，墙角站着持枪的安保，娜塔莉亚微微弯腰，躲避安保的视线。\n娜塔莉亚（自言自语）：奇怪，呼救声明明是从这里传出来的！(That’s weird. I swear that scream came from right around here!)\n▲突然一只手拍了一下娜塔莉亚的后背，娜塔莉亚惊恐回头，只见管家冷着脸站在她身后。\n管家（冷漠）：你在干什么？(What do you think you’re doing?)\n娜塔莉亚：我，我随便走走……(I—I was just taking a walk, getting some fresh air...)\n▲管家冷脸将文件夹递给娜塔莉亚。\n管家：这是庄园的规矩和教父的禁忌。(These are the house rules. Mr. Blackwood doesn't tolerate anyone breaking them.)\n▲娜塔莉亚翻看着文件。\n管家（严肃警告）：不要碰庄园里的任何东西，不要擅自离开庄园，不要在庄园游荡，不要妄想勾引教父！(Don't touch anything in the estate. Don't leave without permission. Don't wander around. And don't even think about trying to seduce the Godfather!)\n▲娜塔莉亚握着文件点了点头，管家一步步靠近她，再次警告。\n管家（警告）：最重要的一条，不要靠近地下室。(And the most important rule: stay away from the basement.)\n娜塔莉亚（惊讶）：地下室？【9】(The basement?)\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链。\n【闪回结束】\n▲娜塔莉亚看着管家离开的背影，心中疑惑。\n娜塔莉亚OS：姐姐给的照片中点出的地点会不会是地下室？(Could the basement be where my sister was pointing to in those photos?)\n▲管家的视线随意扫过了不远处的安保。\n管家（冷漠）：随意走动，会被当做入侵者被射杀。(Anyone caught wandering where they shouldn't will be treated as an intruder and shot on sight.)\n▲安保立刻举起枪，子弹上膛，娜塔莉亚浑身僵直。\n管家（命令）：现在立刻回到小姐的房间去。(Get back to Miss Diana's room. Now.)\n\n3-4\n日 内  戴安娜房间\n人物  戴安娜   娜塔莉亚  布拉姆\n▲娜塔莉亚转身进入房间，放下了文件，在华丽的公主房屋内巡视。\n娜塔莉亚（打量）OS：戴安娜的房间里，会不会有姐姐留下的遗物？（翻找柜子）如果有线索就好了！(Is there anything my sister left behind in here? Come on, just one clue... anything!)\n▲戴安娜悄无声息地睁开了一只眼睛盯着娜塔莉亚翻找东西的背影，她偷偷地将枕边的小熊推到了地上。\n▲娜塔莉亚听到声音，吓了一跳，立刻回头。\n娜塔莉亚OS：谁？(Who's there?!)\n▲戴安娜连忙闭上眼睛，娜塔莉亚瞧见玩偶掉地上了，弯腰去捡玩偶。\n娜塔莉亚OS：我必须万分谨慎，不能被布拉姆和塞莱特斯察觉！(I’ve got to be extra careful. I can't let Bram or Celeste catch on to what I’m doing.)\n▲娜塔莉亚捡玩偶时，突然看见床底下有个盒子。\n娜塔莉亚（惊讶）OS：那是什么？(What's that?)\n▲娜塔莉亚趴在地上，伸手去将盒子给拿出来，盒子上刻着名字：玛莉。(MARY)\n娜塔莉亚（惊讶）OS：这是姐姐的遗物吗？【10】(Is this... my sister's? )\n▲娜塔莉亚背对着门，蹲在地上打开盒子想查看里面的东西，盒子里面有个日记本。\n娜塔莉亚（惊讶）：这是，姐姐的日记？(No way... Is this my sister's diary?)\n▲门突然推开了，布拉姆握住一把枪，一步一步靠近娜塔莉亚，最后停在了娜塔莉亚背后。\n布拉姆（冷漠）：你在做什么？(What are you up to?)\n▲娜塔莉亚吓了一跳，猛地回头，目光正对布拉姆手中的枪口！【11】\n\n第四集   \n4-1\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  布拉姆\n▲布拉姆上前一步，枪口对准了娜塔莉亚的额头，娜塔莉亚放下盒子，举起手，镜头特写：床上的戴安娜睫毛颤了一下。\n▲娜塔莉亚盯着眼前黑漆漆的枪口，她故作柔弱的姿态，眼神惶恐地看向了布拉姆。\n娜塔莉亚（低声）：教父……我发誓，我绝对没有半点越界。(Godfather...Please... I swear I didn't do anything I wasn't supposed to.)\n▲娜塔莉亚抬起下巴，一双眼睛颤抖地盯着布拉姆，布拉姆居高临下看着她，嗤笑了一声，枪口从娜塔莉亚的额头，挪到了她的下巴。\n布拉姆（狠辣）：把东西交出来，！笼子里的狼早已饥肠辘辘，别让我抓到你半点可疑的痕迹！(Hand it over. The wolves are starving out there, don't give me a single reason to doubt you.)\n▲娜塔莉亚被迫仰起头，脖子暴露在枪口下，她伸手轻轻握住枪口，用脸颊蹭了一下枪口，又妩媚地抬头看向了布拉姆。\n娜塔莉亚（低声）：别这样，您吓到我了。(Easy... you're scaring me.)\n▲布拉姆眼神震惊，喉结滚动了一下。【12】\n布拉姆（语气放松）：才刚刚进来，就敢勾引我。（上前一步，捏住娜塔莉亚的下巴）你的胆子很大。(Just walked through that door, and already trying to play me? You've got balls.)\n▲娜塔莉亚故作惶恐。\n娜塔莉亚（可怜）：绝无此事。(I would never dare.)\n▲布拉姆打量着娜塔莉亚，用力甩开她下巴，冷声开口。\n布拉姆（冷漠）：别以为这样我就会放过你！（脚尖踢盒子）把盒子打开。(Don't think that flattery gets you off the hook. Open the box.)\n▲娜塔莉亚颤抖着手拿起盒子，打开了盒子里面有一张玛莉遍体鳞伤的照片。\n布拉姆（惊讶）：这是……(What is this...?)\n▲娜塔莉亚观察着布拉姆的表情。\n【闪回衔接3-2】\n▲门突然推开了，布拉姆举着枪进来，娜塔莉亚背对着布拉姆跪在床边上，她从窗户的玻璃上看到了布拉姆的倒影，察觉了布拉姆靠近，她立马取出日记本，丢入床底下，随后将一张玛莉的照片放入盒子里面，合上了盒子。\n【闪回结束】\n▲娜塔莉亚缓缓抬头，布拉姆正在看照片，手指死死握住了照片边缘。\n娜塔莉亚OS：我就知道布拉姆会来，这张照片是我用来测试布拉姆的筹码，我只想知道，他知不知道姐姐遭受的一切？(I knew he'd show. This photo is my litmus test for Bram. I need to know: did he have any idea what my sister went through?)\n▲布拉姆看着照片，又看娜塔莉亚。\n布拉姆（冷漠）：谁允许你触碰屋内的东西的！(Who gave you the right to touch my things?)\n娜塔莉亚（跪在地上）：教父，我只想找出诱发小姐心理创伤的根源！（试探）她会不会是因为看到这些残酷的画面才……(Godfather, I was just trying to trace the root of Miss Diana’s trauma. Could seeing something this graphic...)\n▲布拉姆审视地盯着娜塔莉亚，伸手将照片拿了起来，紧紧捏着照片。\n布拉姆：闭嘴！(Shut up!)\n▲娜塔莉亚观察着布拉姆的表情和手指，试探开口。\n娜塔莉亚：她是谁？对小姐而言，是很重要的人吗？(Who is she? Is she someone important to Miss Diana?)\n▲布拉姆将照片收了起来。\n布拉姆（冷冽）：守好你的本分，不该问的，不要追问。【13】（转身）以后看到类似的物件，第一时间交给我！(Know your place. Curiosity killed the cat. Next time you stumble on crap like this, bring it straight to me.)\n▲布拉姆转身离开了，娜塔莉亚松了口气，坐在了地上。\n娜塔莉亚（看布拉姆的背影）OS：布拉姆的反应说明他对姐姐的遭遇一清二楚，难道是他和塞莱特斯一起害了姐姐？姐姐到底在哪里？(His reaction says it all, he knows damn well what happened to my sister. Did he and Celeste do this together? Where is my sister?)\n\n\n4-2\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚坐在床上，摊开了笔记本，镜头特写：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n玛莉vo：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n娜塔莉亚（疑惑）OS：这些信息未免太直白了，像是刻意引导我发现线索，到底是谁布的局，又想引导我做什么？(Way too convenient. It's like someone's leaving these clues for me. Who's playing puppet master here, and what's their game?)\n【闪回照片】\n▲镜头特写：铁门被铁链包裹的照片。\n【闪回结束】\n娜塔莉亚：铁门是不是指向的地下室？会不会和姐姐有关！我一定要找到照片所在的位置？(Does that iron door lead to the basement? Is that where they kept my sister? I've got to find that exact spot.)\n▲这时，保姆间的门被推开了，娜塔莉亚吓了一跳，连忙将照片藏起来，猛地回头。\n\n\n第五集\n5-1\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚连忙合上笔记本，疑惑地看着戴安娜。\n娜塔莉亚：怎么了？戴安娜小姐？(Everything okay, Miss Diana?)\n▲戴安娜提着小熊站在了门口，她眼神冷冷地看着娜塔莉亚。\n戴安娜（可怜）：我睡不着，你可以陪着我吗？(I can't sleep... Will you stay with me?)\n▲娜塔莉亚立刻起身，蹲在了戴安娜面前，抚摸了一下戴安娜的头发。\n娜塔莉亚（安抚）：别怕，我陪你回房间好吗？(Hey, don't be scared. Let's get you back to bed, okay?)\n▲戴安娜点了点，娜塔莉亚牵着她的手回房间。\n\n5-2\n夜  内  书房外\n人物  娜塔莉亚   戴安娜\n▲娜塔莉亚牵着戴安娜走在走廊上，突然听到书房传来争吵，娜塔莉亚和戴安娜停下步伐，站在了门口，书房里面传来激烈的争吵声。\n布拉姆（冷冽）VO：塞莱特斯，是你把玛莉的照片放在戴安娜的房间里的？(Celeste, was that you? Did you plant Mary's photo in Diana's room?)\n塞莱特斯（愤怒）VO：你凭什么断定是我所为？(And what makes you so damn sure I did it?)\n布拉姆（呵斥）VO：难道不是你想用那些照片恐吓孩子吗？毕竟你一向都不喜欢她！(Cut the crap. Weren't you trying to terrorize the kid? You've always hated her guts!)\n▲戴安娜想要推门，娜塔莉亚捂着她的嘴巴，抱着她往房间走。\n娜塔莉亚（惊愕）OS：难道布拉姆和塞莱特斯在联手掩盖姐姐死亡的真相？(Are they actually teaming up to sweep my sister's murder under the rug?)\n\n5-3\n夜  内   书房内  \n人物   布拉姆\n▲房间里面，只有布拉姆一个人，布拉姆听见外面的脚步声离开，他打开了留声机，留声机传出塞莱特斯的声音。\n塞莱特斯（留声机）：你凭什么断定是我所为？(What makes you so sure I did it?)\n▲布拉姆关上了留声机，给自己倒了一杯红酒。\n布拉姆（摇晃酒杯）：真正的猎人往往以猎物的方式出现，就让猎物彼此撕咬吧（品酒）毕竟真正贵族从不会沾染猎物的血。(The best hunters always disguise themselves as prey. Let them tear each other to pieces. After all... real aristocrats never get their hands dirty.)\n\n5-4\n夜  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚将戴安娜放在床上，戴安娜看着她。\n戴安娜：他们吵架是因为我对不对？(They were fighting over me, weren't they?)\n▲娜塔莉亚轻轻抚摸她的头发。\n娜塔莉亚（温和）：这是成年人的纠葛，与你无关。(That's just adult nonsense. It has nothing to do with you, sweetie.)\n戴安娜（平静）：塞莱特斯并不是我的母亲，对吗？(Celeste isn't my real mom, is she?)\n▲娜塔莉亚惊讶地看着戴安娜。\n娜塔莉亚（故作不知）：您为什么会这么想？(Why would you think that?)\n戴安娜（抱着小熊）：我的母亲很温柔，塞莱特斯来了之后，我就再也没见过她了，爸爸禁止我提起她，我很思念她，她什么时候回来？(My mom was so sweet... After Celeste showed up, she just vanished. Daddy won't even let me say her name. I miss her so much. Do you know when she's coming back?)\n▲娜塔莉亚看着戴安娜。\n娜塔莉亚（怜悯）：她一定会回来的，我向你保证！【14】(She'll be back. I promise.)\n▲戴安娜乖乖盖好被子，乖巧地开口，握紧了娜塔莉亚的手。\n戴安娜：你会一直留下来陪我吗？(Will you stay with me forever?)\n娜塔莉亚（安抚）：如果你爸爸同意的话，我当然会留下来陪你。(If your dad gives the green light, I'd love to.)\n戴安娜（疑惑）：你害怕我爸爸吗？(Are you scared of my daddy?)\n娜塔莉亚（微笑）：我想庄园里的人都对教父心存敬畏。(I think everyone in this house is a bit intimidated by the Godfather.)\n戴安娜（乖巧）：塞莱特斯就不会，还总是和爸爸吵架！(Celeste isn't. She's always fighting with Daddy!)\n▲娜塔莉亚摸了摸戴安娜的头发，温和开口。\n娜塔莉亚（安抚）：吵架？((Fighting?)\n▲戴安娜抬头乖巧地看着娜塔莉亚。\n戴安娜（不解）：对呀，爸爸很喜欢别人崇拜他，塞莱特斯却从不这样，这让他很懊恼。(Yeah. Daddy loves it when people worship him, but Celeste never does. It drives him crazy.)\n▲娜塔莉亚一愣，惊讶地低头看向了戴安娜，戴安娜闭上了眼睛睡觉。\n娜塔莉亚（惊讶）OS：我明白了。布拉姆出身卑微，极度渴望被认可，而出身贵族的塞莱特斯永远给不了他这份崇拜，看来他们也没有传闻那么相爱！(I get it. Bram came from the gutter, so he's desperate for validation. But Celeste is old money, she'll never stroke his ego. They're nowhere near as tight as everyone thinks.)\n\n5-5\n夜  内  楼梯口   \n人物  安保   娜塔莉亚  管家\n▲娜塔莉亚打开门，恰好看到两个安保抬着一具盖着白布的尸体从客厅路过，娜塔莉亚惊讶地捂着了嘴巴，管家不知道什么时候出现在了娜塔莉亚的身后。\n管家：看到了吗？那就是擅闯地下室的下场。(See that? That's what happens when you sneak into the basement.)\n▲娜塔莉亚猛地看向了管家，吓了一跳，管家已经转身离开了。\n娜塔莉亚（看向主卧方向）OS：得先让猎物撕咬起来，我才有机会探查姐姐的下落。(I need them to tear each other apart first. Only then will I have a chance to find out where my sister is.)\n\n\n第六集\n6-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲布拉姆坐在餐桌旁边，一边看报纸，一边喝咖啡，娜塔莉亚穿着一件性感的连衣裙走了过去。\n▲娜塔莉亚将对戴安娜的心理报告放在了布拉姆的面前。\n娜塔莉亚（恭敬）：教父，这是昨夜我针对小姐的行为进行的心理分析，请您过目。(Godfather, here is my psychological assessment of Miss Diana based on her behavior last night. Please take a look..)\n▲布拉姆收起了报纸，看向了娜塔莉亚给的文件，又看了一眼娜塔莉亚，眼神暂停，喉结滚动了一下。\n布拉姆：根据你的分析，我女儿怎么样了？(So, according to your report, how's my daughter doing?)\n▲娜塔莉亚俯身靠近布拉姆，手背蹭着布拉姆的手臂划过，指着文件。\n娜塔莉亚：您看，小姐不敢一个人睡，是因为……(As you can see, she's terrified of sleeping alone because...)\n▲布拉姆目光从文件上娜塔莉亚的手慢慢往娜塔莉亚的身上打量，他像是看货物一样看着娜塔莉亚，布拉姆往后仰，坐在椅子上，手臂搭在椅背上，手背刚刚好在娜塔莉亚的臀部位置，目光也落在了臀部。\n布拉姆（审视）OS：真想把这件碍事的衣服……(I'd love nothing more than to rip that dress right off her...)\n▲娜塔莉亚余光瞥见了布拉姆的目光。\n娜塔莉亚（冷笑）OS：禽兽，这么容易上钩！(Pig. That was almost too easy.)\n▲这时候，娜塔莉亚的余光瞥见塞莱特斯出现在了楼梯口。\n▲娜塔莉亚趁着布拉姆发呆，翻页时候，手臂碰到了牛奶杯，瞬间将牛奶洒到了布拉姆的裤子上。\n布拉姆（回神，惊讶）：你在干什么？(What the hell are you doing?)\n▲娜塔莉亚惊慌失措，蹲下用纸巾给布拉姆擦拭裤子，她的衣领开得很低，胸贴近布拉姆的大腿。\n娜塔莉亚：教父，请把裤子脱下来交给我，我替您清洗吧。(Godfather, please let me take your pants off. I'll get them cleaned right away.)\n▲布拉姆目光扫过了娜塔莉亚的脸和她的胸口，喉结滚动了一下。【15】\n布拉姆（嗤笑）：脱下来？（指尖划过娜塔莉亚的脸）你的野心倒是毫不掩饰。（松开娜塔莉亚）你这招，对别的男人或许很有效，可我不吃这一套！(Take them off? You're not even trying to hide your ambition, are you? That little show might work on other guys, but I don't buy it.)\n▲娜塔莉亚微微躲避，低下头去。\n娜塔莉亚（紧张）：先生，我并没有这个意思，我只是……我仰慕您很久了，您强大，睿智，是无数人仰望的对象，我由衷地敬佩您。(Sir, please, that's not what I meant. I just... I've looked up to you for so long. You're powerful, brilliant, a man everyone reveres. I genuinely admire you.)\n▲布拉姆愉悦地笑了，指腹擦过了娜塔莉亚的嘴角。\n布拉姆（笑）：嘴可真甜。(You've got quite a silver tongue, haven't you?)\n▲这时，塞莱特斯来到了餐厅，桌子挡住了视线，她看到布拉姆坐在椅子上，娜塔莉亚蹲在布拉姆的面前，举止不雅，顿时误会了。\n塞莱特斯（呵斥）：你们在干什么？【16】(What on earth is going on here?!)\n\n第七集\n7-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲娜塔莉亚听到声音，眼中划过了一丝兴奋。\n娜塔莉亚（高兴）OS：好戏开场了！(And... showtime!)\n▲娜塔莉亚故作慌乱起身，手中拿着纸，布拉姆的裤子上还有牛奶的痕迹。\n娜塔莉亚：夫人……事情并非您所想的那样……(Ma'am... please, it's not what it looks like!)\n▲塞莱特斯大步流星地走过来，一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯（呵斥）：不知廉耻，竟敢勾引我的丈夫，立刻滚庄园！(You shameless little whore! How dare you seduce my husband! Get the hell out of my house!)\n▲娜塔莉亚捂着脸，委屈地看着布拉姆。\n娜塔莉亚（可怜）：夫人，难道崇拜教父也是过错吗？（不屈）难道他不配得到别人的仰慕吗？(Ma'am, is it such a sin to admire the Godfather? Doesn't a man like him deserve to be revered?)\n▲布拉姆听到这句话，脸色阴沉。\n塞莱特斯（愤怒）：你——(You-)\n▲塞莱特斯举起手要打娜塔莉亚，被布拉姆拦住了。\n布拉姆：塞莱特斯！请你克制你的行为！(Celeste! That's enough!)\n塞莱特斯（呵斥娜塔莉亚）：滚出去！立刻滚——(Out! Get the hell out-)\n▲塞莱特斯还想对娜塔莉亚动手，但是被布拉姆拦住了。\n布拉姆（呵斥）：塞莱特斯！你简直越来越不可理喻了，看来你需要接受心理治疗了！(Celeste! You are losing your mind! Maybe it's time you saw a psychiatrist!)\n塞莱特斯（惊愕）：你认为我疯了？既然你现在这么厌恶我，为什么不跟我离婚？(You think I'm crazy? If I disgust you so much, why don't you just sign the divorce papers?!)\n▲ 众人震惊，娜塔莉亚不动声色看向了塞莱特斯。\n娜塔莉亚（惊讶）OS：离婚？塞莱特斯想离开布拉姆？(Divorce? Celeste actually wants out?)\n▲布拉姆一把抓住了塞莱特斯的手腕，压下了情绪。\n布拉姆（深呼吸）：抱歉，（握住梅菲斯特的手）塞莱特斯，你先上楼，（目光看娜塔莉亚）我会处理她。(I'm sorry. Celeste, head upstairs. I'll handle her.)\n▲塞莱特斯眼神愤怒，甩开布拉姆的手。\n塞莱斯特（呵斥）：离婚！(I want a divorce!)\n▲布拉姆神情冷漠了几分，看了一眼远处的女佣。\n布拉姆（深呼吸）：来人，夫人需要休息，送夫人回房间！(Guards! Madam needs some rest. Escort her back to her room!)\n▲两个女佣上前搀扶塞莱特斯，塞莱特斯甩开女佣。\n塞莱特斯（呵斥）：别碰我，我自己会走！(Get your hands off me! I can walk!)\n▲塞莱特斯和娜塔莉亚擦肩而过的时候，她看了一眼娜塔莉亚，低声开口。\n塞莱特斯（嘲笑）：你会后悔你所做的一切的——（放慢语速）娜塔莉亚！【17】(You are going to pay for every single thing you've done... Natalia.)\n▲娜塔莉亚擦了一下脸上的泪，无辜开口。\n娜塔莉亚：我不知道您在说什么。(I... I have no idea what you're talking about.)\n▲塞莱特斯冷哼了一声，走了，娜塔莉亚盯着塞莱特斯的背影。\n娜塔莉亚OS：塞莱特斯为什么会提出离婚？这太反常了，她是想离开布拉姆还是想威胁布拉姆将我赶走？(Why is Celeste bringing up divorce now? Something's off. Is she genuinely trying to leave him, or is this just a power play to get me kicked out?)\n▲布拉姆突然伸手扶着娜塔莉亚的腰，捏了一下她的腰，娜塔莉亚猛地回头看向了布拉姆，布拉姆靠近她。\n布拉姆（低声）：敢当着塞莱特斯的面儿勾引我？我很欣赏你的胆量。（故意提高声音警告）但，我不希望再有下次！(Seducing me right under Celeste's nose? You've got guts. I'll give you that. But don't let there be a next time.)\n▲说完之后，布拉姆的目光在娜塔莉亚捏着纸巾的手上掠过，随后转身离开了，娜塔莉亚瞧着布拉姆的背影，倒了一杯牛奶，慢慢品尝。\n娜塔莉亚OS：不希望有下次？还是希望下次快点到来？布拉姆先生！【18】 (Don't want a next time? Or can't wait for it... Mr. Bram?)\n\n\n第八集\n8-1\n日  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚在桌子上画画，画上面是一扇门，门上缠着铁链。\n娜塔莉亚（惊讶）OS：缠着铁链的门——(A door bound in heavy chains...)\n▲娜塔莉亚压下了心中的震惊。\n娜塔莉亚（故作好奇）：天啊，这张画画得真好，充满了神秘色彩。（摸戴安娜的头）您见过，还是直接想象出来的？(Sweetheart, what a beautiful drawing! It looks so mysterious. Did you actually see this somewhere, or did you just make it up?)\n戴安娜（乖巧）：这是我们家的地下室啦～(That's our basement!)\n娜塔莉亚（惊讶）：地下室——(The basement...?)\n▲戴安娜像是突然反应了过来一样，立刻将画藏了起来。\n戴安娜（竖起手指）：嘘，千万不要告诉爸爸哦～(Shh... Promise you won't tell Daddy!)\n▲娜塔莉亚弯着腰，故意捂着眼睛逗戴安娜。\n娜塔莉亚（温和）：好哦，那我就当作什么都没有看见。(Cross my heart. I didn't see a thing.)\n▲戴安娜一瞧，开心地笑了起来，她顺手将画压在了画纸下方，拿出了另外一张画给娜塔莉亚看。\n戴安娜：你看，这是我画的妈妈！(Look! I drew Mommy!)\n▲娜塔莉亚盯着画，上面是一幅简笔画，一个女人抱着一个孩子，手背上和手腕上都有一道伤痕。\n娜塔莉亚（惊讶）OS：上帝啊，那是什么？(My God... what are those scars?)\n▲戴安娜没发现娜塔莉亚的情绪，看着画，充满怀念地开口。\n戴安娜（叹气）：我真的很想念妈妈。(I miss Mommy so much...)\n▲娜塔莉亚愣了一下，轻轻将戴安娜护在怀中。\n娜塔莉亚：你的妈妈也同样牵挂着你，如果你过得痛苦，她会万分难过，我们先好好休息，好吗？(Your mommy misses you just as much. Seeing you hurting like this would break her heart. Let's get some sleep, okay?)\n戴安娜：你能给我唱睡眠曲吗？妈妈以前经常唱给我听。(Will you sing me a lullaby? Mommy used to sing to me all the time.)\n▲娜塔莉亚将戴安娜抱在怀中，轻轻拍着她的后背，唱起了睡眠曲。引用国外歌曲：《Baby's Bed A Silver Moon》\n娜塔莉亚：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n▲戴安娜闭着眼睛小声地说。\n戴安娜（低声）：你唱的歌和妈妈唱的一样。(You sound just like Mommy...)\n▲娜塔莉亚低头看着怀中的戴安娜笑，眼睛却红了。\n【闪回】\n8-2\n日 内  平民屋老房子\n人物 玛莉  娜塔莉亚\n▲小玛莉将小娜塔莉亚抱在怀中，娜塔莉亚抬头就能看到姐姐温柔的笑容，玛莉拍着她的后背，用稚嫩的声音唱安睡曲。\n小玛莉（拍背）：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n\n【闪回结束】\n▲小玛莉稚嫩的歌声和娜塔莉亚的歌声重叠。\n娜塔莉亚（哽咽）：飘啦飘啊宝贝，跨过千山万水。(Sail away, my little one, over mountains and streams...)\n▲一滴泪顺着娜塔莉亚的脸颊滴在戴安娜的脸上，娜塔莉亚连忙擦泪，低头一看，戴安娜已经睡着了，娜塔莉亚低头轻吻她额头。\n娜塔莉亚（坚定）OS：睡吧宝贝，小姨一定会找到你的母亲！【19】(Rest easy, my sweet girl. Auntie will bring your mother home.)\n\n8-3\n夜  内   走廊/地下室\n人物 娜塔莉亚  塞莱特斯\n▲走廊上，配着枪的安保在巡逻。\n安保：教父有令，不许任何人夜里在庄园内随意走动。(By order of the Godfather, no one wanders the grounds after dark.)\n▲娜塔莉亚躲在拐角的阴影处，安保走远后，她才出来，迅速走向了地下室的入口。\n▲娜塔莉亚不敢开灯，摸索着往前走。\n娜塔莉亚OS：地下室到底锁着什么东西？这东西会和姐姐有关吗？戴安娜难道是看到了地下室的东西才病了的？(What is he hiding down there? Is Mary behind that door? Is that what traumatized Diana?)\n▲她摸索着到了地下室门口，月亮冰冷地落在了门上，门上缠着铁链子，挂着锁，突然地下室里面传来了微弱的响动。\n（女声，模糊，微弱）vo：救救我……（非常模糊，难以判断）(Help... me...)\n娜塔莉亚（惊讶，拍门）：你是谁？(Who's in there?!)\n（女声，微弱）：我是……(I’m...)\n▲娜塔莉亚上前查看，突然一只手拍了一下。\n娜塔莉亚（惊恐）OS：是谁！【20】(Who's there?!)\n▲娜塔莉亚僵硬地转身，塞莱特斯穿着睡裙，披头散发站在她身后。\n塞莱特斯（声音冰冷）：我知道你是谁，也知道你潜入布莱克伍德庄园的目的。(I know who you really are... and exactly why you infiltrated the Blackwood estate.)\n▲娜塔莉亚吓了一跳，后退了一步靠在门上，塞莱特斯步步逼近。\n塞莱特斯：我给过你逃离的机会，既然你执意入局，就别怪我心狠手辣——(I gave you a way out. But since you insist on playing with fire, don't blame me for burning you alive.)\n▲娜塔莉亚盯着塞莱斯特，突然笑了一声。\n娜塔莉亚：塞莱特斯，是你引我来地下室的，我们不是敌人，对吗？(Celeste, you left those breadcrumbs to lead me here. We're on the same side... aren't we?)\n▲塞莱特斯震惊！【21】\n一卡\n\n第九集\n9-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯\n▲娜塔莉亚靠在门上，塞莱特斯一步一步逼近，地下室楼梯口偶尔有人影闪过。\n娜塔莉亚（警惕地看楼梯间）：夫人是想有话直说，还是等布拉姆发现我们？（Cut to the chase, or are you waiting for Bram to catch us?）\n▲塞莱特斯突然一把抓住了娜塔莉亚的手。\n塞莱特斯（一字一句）：救救我，娜塔莉亚！布拉姆想要除掉我！（Help me, Natalia! Bram is going to kill me!）\n娜塔莉亚（震惊）\n▲娜塔莉亚后退了半步，惊愕地看着塞莱特斯。\n娜塔莉亚OS：我猜对了，塞莱斯特想离开布拉姆！可她为什么要向我求救？（I was right. She’s trying to ditch Bram. But why come to me?）\n▲娜塔莉亚故作不解地看着塞莱特斯。\n娜塔莉亚（惊愕）：教父明明十分爱您，怎么会想除掉你？（The Godfather clearly loves you. Why would he want you dead?）\n▲塞莱特斯用力摇头。\n塞莱特斯（绝望）：你们都被骗了！那都是他的精心伪装的假面！他根本就不爱我！（You’ve all been played! It’s all an act. He doesn't love me at all!）\n娜塔莉亚（警惕）：夫人，您遇到危险，应该向您的家人求助，而不是我这个外人。（Ma'am, if you're in danger, go run to your family, not an outsider like me.）\n塞莱特斯（苦笑）：这座庄园守卫深严，我根本无法逃布拉姆的掌控，我也曾向我父母求救，可我身上没有伤痕，他们只认为是我无理取闹！（This place is a fortress, I can't get away from him. I tried begging my parents, but since there are no bruises on my skin, they just think I'm losing my mind.）\n▲塞莱特斯看向了楼梯口，楼梯口偶尔闪过巡逻的身影。\n塞莱特斯（悲伤）：没有人相信完美丈夫的面具下是禽兽。（激动地抓住娜塔莉亚的手）求你帮帮我！（Everyone thinks he's the perfect husband. No one believes me when I tell them what he's really like. Please, you have to help me!）\n▲娜塔莉亚观察着塞莱特斯的表情和发抖的身体。\n娜塔莉亚OS：她说的是真的？还是在试探我？这太冒险了……（ Is she telling the truth? Or testing me? Way too risky...）\n▲娜塔莉亚掰开塞莱特斯的手，准备离开。\n娜塔莉亚：夫人，这些话，我就当没听过！我得离开这里了，如果被教父发现，我会死的……（Ma'am, let’s just pretend this conversation never happened. I gotta go. If the godfather catches me, I'm dead meat...）\n▲塞莱特斯抹了一把眼泪，盯着娜塔莉亚的背影，突然开口。\n塞莱特斯：你的原名叫作苏丽娅，是玛莉的妹妹，八岁被焦恩收养改名娜塔莉亚！你潜入这里是为了寻找玛莉失踪的真相！（Your real name is Surya, Mary’s little sister. John adopted you when you were eight and made you Natalia! You didn't just stumble in here; you're hunting for the truth about Mary!）\n▲娜塔莉亚惊呆了，猛地回头看向了塞莱特斯。\n\n\n第十集\n10-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲娜塔莉亚惊讶地看着塞莱特斯。\n娜塔莉亚：夫人，我并不知道您在说什么，我也不认识玛莉——（Ma'am, I don't know what you're talking about. I have no idea who Mary is-）\n▲塞莱特斯拿出一张照片递给娜塔莉亚，光线昏暗，娜塔莉亚低头看着那张旧照片，上面是小时候的娜塔莉亚和小玛莉还有爸爸妈妈的全家福。\n娜塔莉亚（惊愕）：这张照片怎么在你这里！（where did you get this?）\n▲塞莱特斯走向娜塔莉亚，将照片递给她。\n塞莱特斯：布拉姆很懂怎么让女人为他着迷，一年前我就是这样上钩的。得知他有妻子时，我嫉妒得发疯，只想把他抢过来——他太享受这种被争夺的感觉了。（Bram has a way of wrapping women around his finger. That’s how he reeled me in a year ago. When I found out he was married, I went green with envy. I wanted him all to myself- and he thrives on women fighting over him.）\n▲娜塔莉亚死死握着照片。\n娜塔莉亚（愤怒）：所以你就绑架了我的姐姐？（So you're the one who snatched my sister?）\n塞莱特斯（摇头）：我没有！我只是想给她一笔钱让她离开的！我曾派人调查玛莉，发现她这一生太苦太惨，我不想毁了她好不容易得来的安稳生活。（I didn't! I just wanted to buy her off so she’d walk away. I had her background checked, her life had already been a nightmare. I didn't want to screw up the peace she finally managed to build.)\n▲塞莱特斯抚摸着地下室的铁锁，缓缓转头看向了娜塔莉亚。\n塞莱特斯（哽咽，恐惧）：我放弃了接近布拉姆，可没多久，她就失踪了，尸骨无存！连警方也找不到！（I gave up on Bram. But not long after, she vanished. Even the police couldn't find her!）\n娜塔莉亚（惊讶）：什么？（What?）\n塞莱特斯（看向地下室）：没有人知道她去哪儿了……（No one knows where she went...）\n▲娜塔莉亚审视地看着地下室的门，目光又慢慢挪回塞莱特斯。\n娜塔莉亚（惊愕）：她是不是在这里面？（Is she locked down in there?）\n塞莱特斯（摇头）：我不知道，每一个靠近地下室的人不是死亡就是失踪了……（I don't know. Everyone who gets close to the basement either dies or disappears...）\n▲娜塔莉亚盯着地下室的门，后退了半步。\n娜塔莉亚（审视）：那你现在告诉我这些的目的是什么？（So why are you telling me this now?）\n▲塞莱特斯紧紧抓住娜塔莉亚的手臂。\n塞莱特斯：我怀疑是布拉姆杀了他们！我也试图解开地下室的秘密，布拉姆现在的目标肯定是我，你也靠近了，下一个就是你了！只有我们联手，才有机会逃离魔爪——（Because I'm betting Bram is the one who got rid of them! I tried digging into this basement myself. Now I'm sitting in his crosshairs, and since you've been sniffing around too, you're next on his hit list! Team up with me, or we're both dead.）\n娜塔莉亚（试探）：是你引我来地下室的？你想让我跟你绑在一起？（So you set me up? You dragged me into this just to use me as your shield?）\n塞莱特斯（绝望）：娜塔莉亚，别怪我，（捂着脸）我实在没有办法了，我不想死！（Natalia, don't blame me. I have no choice. I don't want to die!）\n娜塔莉亚（看向地下室的门）：那你想让我怎么做？（Then what do you want me to do?）\n塞莱特斯（坚定）：我需要你去勾引布拉姆！（I need you to seduce Bram!）\n▲娜塔莉亚惊讶，她还没来得及详细询问，突然一束光打在了两个人的脸上，两个人惊恐地抬头看向了楼梯口。\n▲布拉姆阴沉着脸，拿着手枪，带着配枪的安保，站在楼梯口。\n布拉姆（冷冽）：你们在这里干什么？（What do we have down here?）\n\n\n第十一集\n11-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲安保的枪口对准了娜塔莉亚，布拉姆一步一步走向了娜塔莉亚和塞莱特斯，娜塔莉亚和塞莱特斯几乎都是紧张地后退了半步，娜塔莉亚连忙将照片藏在了袖子里面。\n▲布拉姆一挥手，两个安保抓住一个男人过来，男人表情惊恐。\n男人：教父，我错了！我真的错了！（Godfather, I was wrong! I'm sorry!）\n布拉姆（子弹上膛）：无视我的规矩，窥探庄园的秘密，就要付出代价。（Break my rules, nose around my estate, and you pay with your life.）\n▲布拉姆的枪抵在了男人的肩膀上。\n男人：教父，求求您放过我吧，我没有想窥探您的秘密，我……（Godfather, mercy! I swear I wasn't snooping around! I—）\n▲娜塔莉亚想说话，塞莱特斯在黑暗中抓住了她的手示意她别开口。\n▲布拉姆表情冷漠，枪响，男人的尖叫声响起，娜塔莉亚捂着耳朵尖叫了一声，靠在墙上惊恐地看着男人被打穿了肩膀躺在地上哀号。\n布拉姆（抬手）：把人拖走，别惊扰了我的夫人，（视线落在了娜塔莉亚身上）还有尊敬的娜塔莉亚小姐。（Drag him away. We wouldn't want to upset my wife... or our lovely Miss Natalia.）\n▲安保将受伤的男人拖走，血流了一地，娜塔莉亚和塞莱特斯几乎不敢喘气，娜塔莉亚瞥了一眼塞莱特斯。\n布拉姆（看了一眼地下室的门）：你们来这里做什么？（So... what brings you two down here?）\n▲塞莱特斯被地上的鲜血刺激得后退了一步，娜塔莉亚看向她。\n娜塔莉亚OS：塞莱特斯夫人，如果你出卖我的话，就别怪我不客气了——（Throw me under the bus, Celeste, and I swear I'm taking you down with me—）\n▲塞莱特斯突然猝不及防的扇了娜塔丽亚一耳光。\n塞莱特斯：贱人！你竟敢污蔑我？（You bitch! How dare you set me up?）\n▲娜塔莉亚猛地抬头看向了塞莱特斯，眼神错愕。\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n\n\n第十二集\n12-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n塞莱特斯：贱人！你竟敢污蔑我梦游？还把我带到这个鬼地方，分明是想害我！（You bitch! How dare you lie and say I was sleepwalking?! You dragged me down to this hellhole to get me killed!）\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n布拉姆：是吗？敢污蔑我的夫人！（Is that so? You dared to frame my wife!）\n▲娜塔莉亚盯着塞拉特斯的脸，二人对视，仿佛空气都凝固了。\n娜塔莉亚（恢复镇静）：教父，夫人的确是梦游了！请相信我的专业判断。（Godfather, she really was sleepwalking. You have to trust my professional judgment.）\n塞莱特斯（愤怒）：胡说，你颠倒黑白，污蔑我有病，是不是想取代我的位置！（Bullshit! You're twisting the truth, trying to make me look crazy! You just want to take my place!）\n娜塔莉亚：夫人，地下室是禁地，如果您不是梦游，来地下室干什么？如果不是梦游，您有手有脚，又怎么会听我指挥？我只是怕您有危险，所以跟到了这里。（Ma'am, the basement is strictly off-limits. If you weren't sleepwalking, what were you doing down here? And why did you follow me without a word? I only came down because I was worried about your safety.）\n▲娜塔莉娅拨开布拉姆的枪，魅惑的看着布拉姆。\n娜塔莉娅：教父，您觉得我说的对吗？（Godfather, don't you think I'm right?）\n▲布拉姆冷眼盯着塞莱特斯和娜塔莉亚，塞莱特斯连忙抱住了布拉姆的手臂，疾言厉色地开口。\n塞莱特斯：布拉姆，她是在污蔑我！（看保安）保安，把这个女人驱逐出去！（Bram, she's framing me! Guards, throw this woman out!）\n▲保安目光看布拉姆，没有动，布拉姆的表情松动，拍了拍塞莱特斯的手。\n布拉姆：塞莱特斯，冷静点儿，我会请最权威的精神科医生医生来对你进行评估。（看保安）带夫人去休息。（Celeste, calm down. I'll have the best psychiatrist come take a look at you. Take my wife to rest.）\n塞莱特斯（故作惊讶）：我才是你的妻子！你宁愿相信这个外来者也不相信我？（I'm your wife! You’re taking the word of a stranger over mine?）\n布拉姆（呵斥）：回去休息！（Go rest!）\n▲塞莱特斯惊愕，布拉姆拍了拍塞莱特斯的肩膀放缓了语气。\n布拉姆（安抚）：亲爱的，我这都是为了你好，快去休息吧。（Sweetheart, I'm doing this for your own good. Now go get some sleep.）\n▲塞莱特斯和娜塔莉亚对视了一眼。\n▲塞莱特斯气冲冲地离开了，布拉姆转了一圈手枪，用枪挑起娜塔莉娅的下巴。\n布拉姆（威胁）：娜塔莉亚，我的宝贝，告诉我，你来地下室的真正目的。（Natalia, my sweet... now tell me the real reason you're down here.）\n\n第十三集\n13-1\n夜  内   地下室\n人物 娜塔莉亚  布拉姆   安保若干 \n▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。\n娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！（Bram doesn't buy our story. Better to admit part of it than keep hiding.）\n▲娜塔莉亚盯着布拉姆的眼睛，突然上前一步，抱住了布拉姆。\n娜塔莉亚（故作惊恐）：教父！请原谅我！是我趁她梦游，故意把她引到了这里。（Godfather, please forgive me! I knew she was sleepwalking, so... I intentionally led her down here.）\n▲布拉姆惊讶地低头看着娜塔莉亚的，他放下了枪，抚着娜塔莉亚的后背开口。\n布拉姆（惊讶）：你故意的？（You did it on purpose?）\n娜塔莉亚（握拳）：是的，我只是个医生，不是她的佣人，可她却当众掌我嘴，我只想给她一个小小的教训！（Yes. I'm just a doctor, not her maid, but she slapped me in public. I just wanted to teach her a little lesson!）\n▲布拉姆盯着娜塔莉亚的模样，勾起嘴角。\n布拉姆OS：有趣，聪明，但也仅仅是个猎物！（Spicy, and sharp. But still just a mouse playing with a cat.）\n▲布拉姆挑眉，指尖划过了娜塔莉亚的脸颊。\n布拉姆（试探）：那你恨吗？想不想将她踩在脚下？（So do you hate her? Want to grind her into the dirt?）\n▲布拉姆话音落下，娜塔莉亚听到了子弹上膛的声音，娜塔莉亚扫了一眼那些枪口，格外紧张，心跳加速。\n娜塔莉亚（抬头看向布拉姆）：我不是神，当然会恨夫人。（愤恨）但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。（I’m no saint, so yeah, I despise her. But what really pisses me off is this rigged system. I hate the elite, even while I’m dying to have everything they’ve got.）\n▲布拉姆盯着娜塔莉亚，布拉姆突然推开娜塔莉亚，举起枪，对准了娜塔莉亚的额头。\n布拉姆：这番话，足以让你丧命！（Those words could get you killed!）\n▲娜塔莉亚不为所动，她伸出手轻轻抚摸着布拉姆的脖子，从他的肩膀抚摸到他的心口。\n娜塔莉亚（坚定）：但我说的都是真话！（放软声音）教父，难道您不恨他们吗？（But I'm telling the truth! Godfather, don't you hate them too?）\n▲布拉姆突然笑了，轻轻鼓了鼓掌。\n布拉姆（欣赏）：很好，我欣赏敢于坦诚欲望的人。（抚摸娜塔莉亚的肩膀）但你的目的远不止这些吧。（Good. I admire people who are honest about their desires. But your goal is more than that, isn't it?）\n▲娜塔莉亚惊愕地看着布拉姆，二人对视，娜塔莉亚紧张了起来。\n娜塔莉亚（紧张）OS：塞莱特斯都能查到我的身份，布拉姆会知道吗？（握拳）豁出去了！（ Celeste found out who I am. Does Bram know? Screw it!）\n▲娜塔莉亚山前一步，指尖轻轻揭开了布拉姆衣服的扣子，布拉姆一把抓住了娜塔莉亚的手。\n布拉姆（警惕）：你想干什么！（What do you want?）\n▲娜塔莉亚垫脚靠近布拉姆的耳朵，手从他的胸口滑落到腹部，腰部，最后勾住了他的皮带。\n娜塔莉亚（妩媚）：教父，我曾远远见过您一次，便深深爱上了您！我进入庄园，都是为了您呀。（Godfather, I saw you once from a distance, and I fell for you. I came into this estate for you.）\n▲布拉姆一惊，喉结滚动了一下，目光掠过娜塔莉亚的脸颊和脖子。\n布拉姆OS：这个妖精，真想把她绑起来，玩个痛快！可惜现在还不到时候！（What a seductive little vixen. God, I want to break her. But the game’s just getting started.）\n▲布拉姆一把抓住了娜塔莉亚的手，阻止她的动作。\n布拉姆（故作冷漠）：够了！回你的住处去，记住，不要试图窥探这里的秘密，它会让你死的很惨！（Enough! Go back to your room. And remember—don't dig into this place's secrets. It'll get you killed.）\n▲娜塔莉亚连忙低下头去，绕过了布拉姆，提着裙摆上楼了，她回头看了一眼地下室的铁门上的锁。\n【闪回】\n13-2  （衔接10-1）\n夜  内   地下室门口\n人物  娜塔莉亚   塞莱特斯\n▲塞莱斯特抓住娜塔莉亚的手。\n塞莱特斯（情绪激动）：我需要你去勾引布拉姆！只要你帮我，我就告诉你地下室的钥匙在哪儿！（I need you to seduce Bram! Help me, and I'll tell you where the basement key is!）\n▲娜塔莉亚看了一眼锁，又看向了塞莱特斯。\n娜塔莉亚：我可以答应你！钥匙在哪儿？（I'll do it. Where's the key?）\n塞莱特斯（紧张）：是一把纯金的钥匙，就在布拉姆身上！（It's a solid gold key. and Bram keeps it right on him!）\n【闪回结束】\n▲娜塔莉亚不动声色地将目光从地下室门口，挪到了布拉姆的身上，布拉姆正烦躁地揭开了衬衣上面的三颗扣子，一道金色光芒在他衣服里面一闪而过。\n娜塔莉亚（惊讶）OS：那是钥匙吗？（坚定）我一定会取得布拉姆的信任，拿到地下室的钥匙，救出姐姐！（Was that it? The key? Watch your back, Bram... I'll win your trust, steal it, and tear this hellhole apart to save my sister.）\n13-2\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯站在窗前，忐忑地看着夜色。\n塞莱特斯（紧张）OS：都这么久了，希望娜塔莉娅没出什么危险。（It's been so long. I hope Natalia's okay.）\n▲这时，布拉姆推开了塞莱特斯的房间门，塞拉特斯被吓了一跳，他穿着睡衣，脸上带着温和的笑容。\n布拉姆（步步靠近）：塞莱特斯，这个世界上，唯有我最爱你。你应该牢记这一点。（Celeste, in this world, no one loves you like I do. Remember that.）\n▲塞莱特斯一步一步后退，布拉姆将她抵在了墙上。\n塞莱特斯：布拉姆！你想干什么？（Bram! What do you want?）\n▲布拉姆将一个盒子递给了塞莱特斯。\n布拉姆（笑）：但愿这里面的东西，能让你认清现实。（I hope this helps you see reality.）\n\n\n第十四集\n14-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n▲塞莱特斯脸色发白，紧紧握着裙摆，录音笔还在响。\n娜塔莉亚vo：但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。..(What really pisses me off is this rigged system. I hate the elite—even while I’m dying to have everything they’ve got.）\n▲布拉姆的手指拂过塞莱特斯的脸颊。\n布拉姆（蛊惑）：听见了吗？她恨你，她嫉妒你的出身，她想毁了你。只有我才能保护你！（Hear that? She hates you. She's jealous of your bloodline. She wants to destroy you. Only I can protect you!）\n▲塞莱特斯盯着录音笔，握紧了拳头。\n塞莱特斯OS：娜塔莉亚已经出卖了我？（Did she just throw me under the bus?）\n布拉姆（语气温和）：告诉我，她是怎么样蛊惑你的？（轻轻拥抱塞莱特斯）我会保护你不被伤害。（Now, tell me... how did she get into your head? Trust me, I'll keep you safe.）\n▲塞莱特斯心跳加速，她盯着录音笔，噗嗤一声笑了。\n塞莱特斯（骄傲地抬头）：我出身贵族，觊觎我身份的人太多了，她们嫉妒我、羡慕我，想害我，我习惯了。（I was born noble. So many people want my place. They're jealous, envious, out to hurt me. I'm used to it.）\n▲布拉姆脸上的温和瞬间消失了，他推开塞莱特斯，将录音笔狠狠摔在了地上，塞莱特斯被布拉姆突然变脸吓得捂住了耳朵。\n布拉姆（训斥）：你太狂妄自大了！你的傲慢会招来杀身之祸，唯有我可以庇护你！（You're too arrogant! Your pride will get you killed. Only I can shelter you!）\n▲布拉姆扯下她捂着耳朵的手，靠近她的耳朵。\n布拉姆（质问）：告诉我，你为什么要去地下室！你是不是也想知道里面有什么？（Tell me, why did you go to the basement? You want to know what's in there too, don't you?）\n▲塞莱特斯惊恐。\n塞莱特斯（抬头盯着布拉姆）：不不不——我不知道！是……是娜塔莉亚陷害我！（No, no, no—I don't know! It's... Natalia framed me!）\n▲布拉姆狠狠将塞莱特斯甩在了床上。\n布拉姆（拿出枪）：很好！（上膛）那我现在就去杀了她。（Good. Then I'll go kill her right now.）\n▲布拉姆举着枪大步流星地往外走，塞莱特斯吓坏了，连忙喊道。\n塞莱特斯：不，不是——我说实话！（No, wait—I'll tell the truth!）\n14-2\n夜  内  走廊\n人物  娜塔莉\n▲娜塔莉亚站在门口，耳朵贴在了门上。\n塞莱特斯vo：不，不是——我说实话！（No, wait—I'll tell the truth!）\n▲塞莱特斯的声音从门内传来，娜塔莉亚惊讶地猛地捂住了嘴巴。\n\n\n第十五集\n15-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆猛地回头，用枪挑起了塞莱特斯的下巴。\n布拉姆：那是什么？（威胁）你想背叛我？（What was that? You want to betray me?）\n▲塞莱特斯额头上冒出冷汗，颤抖地开口。\n塞莱特斯：是因为她白天勾引你，所以我故意装梦游，引她去地下室，我想要杀了她！（Because she seduced you today, I pretended to sleepwalk and lured her to the basement. I wanted to kill her!）\n▲布拉姆的表情松动了半分，布拉姆收了枪，轻轻抚摸着塞莱特斯的头发。\n布拉姆（温和）：我很高兴你如此在乎我。（Good. I do love it when you get jealous.）\n▲塞莱特斯颤抖了一下，布拉姆的脸上露出了笑容轻吻了她的额头\n布拉姆：放心，我只爱你一个人，不会被其他女人蒙骗。（Don't worry. I only love you. I won't be fooled by other women.）\n▲布拉姆将塞莱特斯搂在怀中，看着窗户上的影子，嗤笑了一声。\n布拉姆OS：竟然学会了互相掩护。（抚摸塞莱特斯的背影）当你不想让我杀了她的时候，你就已经露出了破绽。（Covering for each other now, are we? The second you stepped in to save her neck, you blew your cover.）\n▲布拉姆将塞莱特斯推到在了床上，开始脱衣服。\n布拉姆（解开皮带，放在手中把玩）：塞莱特斯，你能依靠的只有我一个，你会听话对吗？（Celeste... I'm all you've got in this world. You're gonna be a good girl for me, aren't you?）\n▲塞莱特斯看着浑身发抖，连忙后退，她拼命地摇头。\n塞莱特斯（颤抖求饶）：布拉姆，我，我身体不太舒服，我不想……（Bram, I... I don't feel well. I don't want to...）\n▲布拉姆一把抓住了塞莱斯特的手，眼神凶狠，撕开了她的上衣。\n布拉姆（故作温和）：拒绝我，你以前不是很喜欢我的占有吗？（Saying no to me? You used to crave it when I took control.）\n▲塞莱斯特惊慌失措，想挣扎，布拉姆突然松开她，捂住了她的嘴巴。\n布拉姆（警告）：嘘——有老鼠偷听。（Shh... we have a little eavesdropping rat outside.）\n▲布拉姆手中的手枪上膛，一步一步走向了门口。\n▲切镜。\n▲走廊上，娜塔莉亚正靠在门口听里面的动静，这时，门突然开了，布拉姆手中的枪突然抵在了娜塔莉亚的脑袋上。\n▲娜塔莉亚震惊。\n\n\n第十六集\n16-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚抬头看着布拉姆，布拉姆上半身的衬衣敞开着，他的一只手拿枪口抵着娜塔莉亚的脑袋，一只手关上了门，冷眼看着娜塔莉亚。\n布拉姆（深呼吸）：你在这儿干什么？我不是让你回房间吗？（What are you doing here? Didn't I tell you to go back to your room?）\n▲娜塔莉亚打量着布拉姆的样子，握紧了拳头。\n娜塔莉亚OS：看来我坏了他的好事——（Guess I ruined his little fun—）\n▲娜塔莉亚上前一步，轻轻抚摸着布拉姆裸露的胸膛。\n娜塔莉亚（撒娇）：教父，我不想你和夫人发生关系，我想……（Godfather... I couldn't stand the thought of you touching her. I want... ）\n▲布拉姆一惊，握着手枪的手放了下去，娜塔莉亚的手在布拉姆的身上随意地抚摸了起来。\n娜塔莉亚（着急）OS：钥匙到底在哪儿！（Where the hell is the key?）\n▲布拉姆突然一把抓住了娜塔莉亚的手，眼神带着侵略性地落在了娜塔莉亚的身上。\n布拉姆（捏住了她的下巴）：这么着急取代她？（Can't wait to take her place, huh?）\n▲娜塔莉亚抬头看向了布拉姆，一脸无辜。\n娜塔莉亚（后退）：教父……（Godfather...）\n▲布拉姆瞧着娜塔莉亚的样子，一步一步逼近娜塔莉亚。\n布拉姆：娜塔莉亚，既然是你主动送上门，我就不客气了！（Natalia, since you came to me, I won't hold back!）\n▲布拉姆握住了娜塔莉亚的手腕，一把将她拉在了自己的怀中，低头要吻她，娜塔莉亚几乎是下意识的避开。\n娜塔莉亚OS：禽兽，竟然来真的！（You animal—he's serious!）\n▲布拉姆目光极具侵略性，一步一步逼近娜塔莉亚，他抓住娜塔莉亚的手，让娜塔莉亚的手从他的胸膛一直往下摸到下腹，娜塔莉亚想要收回手，却被布拉姆死死摁住了手。\n布拉姆（蛊惑）：娜塔莉亚，这可是你取代塞莱特斯的机会，你不要吗？权力、财富、地位，你马上就能拥有。（Natalia, this is your chance to replace Celeste. You don't want it? Power, wealth, status, you can have it all.）\n▲娜塔莉亚惊愕地看着布拉姆，露出乖巧的笑容。\n娜塔莉亚（轻点布拉姆的心口）：虽然我很想要，但是……（撒娇）教父，我来月经了，等经期过了……（I really want it, but... Godfather, I'm on my period. Can you wait until it's over？）\n▲布拉姆握住了娜塔莉亚的手。\n布拉姆（嗤笑）：是吗？内裤脱了，我检查。（Is that so? Take off your underwear. Let me check.）\n▲娜塔莉亚不敢置信地盯着布拉姆。\n娜塔莉亚（震惊）：什么？（What?）\n\n\n第十七集\n17-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚后退了一步，抵在了门上，布拉姆逼近一把捏住了娜塔莉亚的下巴，一把捏着她的下巴，将她的脸转过来，威胁着开口。\n布拉姆（喘息）：你不是爱我吗？不是想取代塞莱斯特吗？拿出你的诚意来！（威胁）不然的话，我不介意让我的狼加餐！（You love me, don't you? You say you want to take Celeste's place？Show me your loyalty, or I’ll feed you to my wolves tonight.）\n▲远处传来狼的嚎叫声，气氛突然变得紧张了起来，娜塔莉亚心跳加速。\n▲这时，戴安娜站在走廊尽头大喊。\n戴安娜（大喊）：娜塔莉亚姐姐，爸爸，快来看我画的画！（Natalia! Daddy! Look what I drew!）\n▲布拉姆看到戴安娜，立刻整理了一下自己的衣服，眼神不悦地落在了戴安娜的身上。\n布拉姆（冷冽）：戴安娜！谁允许你出来的？（Diana! Who gave you permission to leave your room?）\n▲戴安娜举着画，画上画着一个生日蛋糕。\n戴安娜（委屈）：爸爸的生日快到了，我只是想送爸爸一个礼物，让爸爸开心。（Daddy's birthday is coming. I just wanted to give you a gift and make you happy.）\n▲布拉姆收起了枪，走向了戴安娜，伸手摸了一下她的头发。\n布拉姆（不耐烦）：你的心意，我收到了，回房间去。（I got it. Go back to your room.）\n▲戴安娜看了一眼布拉姆，又看向了娜塔莉亚，低着头看着生日蛋糕说。\n戴安娜：以前爸爸的生日宴会，都是妈妈亲手做的蛋糕，妈妈去哪儿了？我想妈妈……（Mommy always baked your cake for your birthday... Where did she go? I really miss her, Daddy...）\n▲布拉姆冷漠呵斥。\n布拉姆（呵斥）：戴安娜！闭嘴！（Diana! Shut up!）\n▲戴安娜被吓到了，哇的一声就哭了，娜塔莉亚立刻扑过去，将戴安娜抱起来，回头看向了布拉姆。\n娜塔莉亚（看向布拉姆）：先生，小姐的病情本就不稳定，您别刺激她！（Sir, her condition is unstable. Don't trigger her!）\n▲戴安娜抱着娜塔莉亚的脖子失声痛哭，布拉姆烦躁地挥了一下手，看向了娜塔莉。\n布拉姆：把她带回房间去！（Take her back to her room!）\n▲娜塔莉亚抱着戴安娜转身回戴安娜的房间，布拉姆盯着娜塔莉亚的背影，目光最后落在了她的臀部。\n布拉姆OS：有点小聪明，但也只是个落入囚笼的兔子而已！（A little clever, but still just a rabbit in a cage.）\n▲布拉姆推开了塞莱特斯的房间门走了进来，里面传来了塞莱斯特的尖叫声。\n\n\n第十八集\n18-1\n夜  内   戴安娜房间\n人物  戴安娜   娜塔莉亚\n▲戴安娜在娜塔莉亚的怀中，指着画上的蛋糕，有些委屈的开口。\n戴安娜（抹眼泪）：以前妈妈在的时候，爸爸从不会凶我，还会陪我过生日，我好想妈妈。（When Mommy was here, Daddy never yelled at me. He celebrated my birthday with me. I miss Mommy.）\n▲娜塔莉亚的目光落在了戴安娜手中的画上。\n【闪回（蛋糕定格切镜到小面包）】\n夜  内  娜塔莉亚小时候的家\n人物  小娜塔莉亚  小玛莉\n▲桌上摆放着一个小面包，面包上插着蜡烛，小玛莉看着小娜塔莉亚摸了摸她的脑袋。\n小玛莉（声音稚嫩）：等以后，姐姐给你买个真正的生日蛋糕！（安抚）许个愿吧。（Someday, sis, I'll get you a real birthday cake. Now, close your eyes and make a wish.）\n▲小娜塔莉亚看着插着蜡烛的面包。\n小娜塔莉亚（高兴）：那我的愿望是，和姐姐永不分离！（My wish is for us to stay together forever and ever!）\n▲小娜塔莉亚吹蜡烛，黑幕。\n【闪回结束】\n▲娜塔莉亚看着画，又低头看着熟睡的戴安娜，她紧紧将戴安娜抱在怀中。\n娜塔莉亚（坚定）OS：我会救出姐姐，让戴安娜和她的母亲团聚！（I swear I will rescue my sister... and bring Diana’s mother back to her.）\n18-2\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣端着托盘，托盘里面放着药往塞莱特斯的房间走，娜塔莉亚从戴安娜房间里面出来。\n娜塔莉亚（盯着女佣）OS：过几天是布拉姆的生日宴，是个能利用的机会。（Bram's birthday banquet is in a few days. That's a chance.）\n▲就在女佣靠近时候，娜塔莉亚一不小心撞到了女佣，女佣手中的托盘差点翻了，娜塔莉亚伸手托住了女佣的手腕，一只手扶住药碗。\n娜塔莉亚：小心！（Careful!）\n女佣：感谢小姐。（Thank you, miss.）\n▲女佣端着药要进入塞莱特斯的房间。\n娜塔莉亚OS：希望塞莱特斯能看到我传递给她的信息！（I hope Celeste sees my message!）\n▲这时，布拉姆走了出来。\n布拉姆（看女佣）：等一等——（Wait—）\n▲娜塔莉亚回头紧张地看着布拉姆。\n娜塔莉亚OS：千万别被布拉姆察觉破绽。（Don't let Bram spot anything.）\n▲布拉姆抬头看了一眼娜塔莉亚，嗤笑了一声。\n布拉姆：你在紧张什么？（Why the jittery face, Natalia?）\n娜塔莉亚（摇头）：不，我刚才不小心把夫人的药撞洒了些……（Nothing. I accidentally spilled some of her medicine earlier...）\n▲布拉姆一步一步走了过来，目光看向了女佣手中的托盘，他用勺子搅了一下药，又将碗端起来检查了一下。\n布拉姆（审视）：洒了吗？（Did it spill?）\n娜塔莉亚（紧张）：一点点……（Just a tiny bit..）\n▲娜塔莉亚盯着布拉姆的动作，心跳加快，目光看向了托盘。\n▲布拉姆看了一眼娜塔莉亚，又顺着娜塔莉亚的目光落在了女佣手中的托盘上。\n布拉姆（冷冽）：将托盘翻过来。（Flip the tray over. Now.）\n▲布拉姆拿出手枪，子弹上膛，娜塔莉亚的目光盯着女佣的动作，女佣缓缓将托盘翻过来——\n\n\n第十九集\n19-1\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣听话地将托盘翻了过来，下面什么都没有，布拉姆这才将药碗放在了托盘上，目光又看向了女佣。\n布拉姆（冷冽）：药给我，我拿进去。（Hand it over. I'll take it to her myself.）\n▲女佣听话地将药碗递给了布拉姆，娜塔莉亚眼神一变，一把抱住了布拉姆的手臂。\n娜塔莉亚（委屈）：教父~您就这么关心夫人？（Godfather, you care about her that much?）\n▲布拉姆一愣，低头看向了娜塔莉亚。\n布拉姆（捏娜塔莉亚的脸）：吃醋了？（Jealous?）\n▲娜塔莉亚松开了布拉姆的手臂，转身背对布拉姆。\n娜塔莉亚（不高兴了）：我怎么会吃醋？我有什么资格吃醋？（Why would I be jealous? I have zero right to be.）\n▲布拉姆抓住了娜塔莉亚的手臂，将她拉入了自己的怀中。\n布拉姆（捏娜塔莉亚的脸）：你长得很像一个人。（You know... you really remind me of someone..）\n▲娜塔莉亚不动声色地抬头看向了布拉姆，指尖轻轻点了点他的胸口。\n娜塔莉亚（乖巧）：什么人？情人还是爱人？您不会拿我当替身吧。（Oh? An ex-lover, or a wife? Don't tell me I'm just some cheap stand-in.）\n▲布拉姆握住娜塔莉亚的手，轻轻吻了吻她的指尖。\n布拉姆（嗤笑）：她可没有你这么大胆。（打量娜塔莉亚）也没有你这么诱人~（She wasn't as bold as you. Or as tempting.）\n▲娜塔莉亚勾着布拉姆的皮带，让他一步步靠近。\n娜塔莉亚（乖巧）：教父昨晚不是说要检查吗？我准备好了……（Godfather, didn't you say you wanted to check last night? I'm ready...）\n▲布拉姆喉结滚动了一下，一步一步靠近娜塔莉亚，女佣立刻低着头，一只手托着托盘，打开门进入了塞莱特斯的房间。\n18-2\n日 内  塞莱特斯房间\n人物 塞莱特斯  女佣\n▲塞莱特斯看着女佣端着咖啡进来，声音冰冷地开口。\n塞莱特斯：出去，我没有病，我不喝这些药！（Get out. I'm not sick. I'm not drinking this!）\n女佣（为难）：夫人，教父下令，我必须看着您喝下去。（Ma'am, please... the Godfather’s orders. I have to watch you finish it.）\n▲塞莱特斯刚想发火，突然看见女佣的衣袖袖口位置贴了一张极小的纸条。\n塞莱特斯（不动声色）：喝就喝——（Fine, I'll drink—）\n▲她伸手抓住了女佣的手腕顺手将纸条取了下来，随后端起碗一口喝了下去，将空碗扬了扬。\n塞莱特斯：你可以滚了！（You can get lost now!）\n▲女佣低着头逃一般离开，塞莱特斯立刻看纸条。\n娜塔莉亚（旁白）：宴会捉奸，帮您离开，希望您当众将地下室的秘密揭露出来，助我一臂之力！同意就摔碗为信号。（Catch him cheating at the party, and I'll help you walk free. Expose the dark secret of the basement in front of everyone, and we both win. Drop the bowl as a signal.）\n▲切镜。\n▲走廊上，布拉姆一把将娜塔莉亚抗在了肩上，大步流星往自己的方向走。\n布拉姆（拍娜塔莉亚的臀）：小妖精，我今天就让你爽个够！（You little vixen. I'm gonna rock your world today!）\n▲娜塔莉亚趴在布拉姆的肩膀上，看向了塞莱斯特的房门。\n娜塔莉亚OS：三、二、一……（Three, two, one...）\n▲突然，塞莱特斯房间里面传来打碎了碗的声音，布拉姆脚步一顿！将娜塔莉亚放下。\n娜塔莉亚OS：合作达成！(Deal!）\n布拉姆（看向塞莱特斯的房间，不悦）：我去看看她又在闹什么！（Let me see what she's up to now!）\n▲娜塔莉亚一把抓住了布拉姆的手。\n娜塔莉亚（撒娇）：教父~（Godfather.）\n▲布拉姆回头看了一眼娜塔莉亚。\n布拉姆（安抚）：生日宴时，她父母会来，你也不想她到时候闹事，对吧！（Her parents will be at the birthday banquet. You don't want her making a scene, right?）\n▲娜塔莉亚故作委屈松手。\n娜塔莉亚（叹气）：好吧，那我就先忍一忍~（Fine. I'll hold it in for now.）\n▲布拉姆走向了塞莱特斯的房间，娜塔莉亚转身往戴安娜的房间走。\n娜塔莉亚（看门）OS：希望能在宴会上，引塞莱特斯的父母出手打开地下室，如果失败了，我也能乘机拿到钥匙，救出姐姐！（Let’s hope Celeste’s parents play their part and blow the basement wide open. But if that plan tanks... I’ll just swipe the key myself and tear this place down to save my sister.)\n\n\n第二十集\n20-1\n日  内  塞莱特斯房间\n人物  布拉姆 塞莱特斯  管家\n▲塞莱特斯睡在了床上，布拉姆坐在窗边上，管家恭敬地看着布拉姆。\n管家：先生，家庭医生给夫人打了镇定剂，她应该不会再闹了。（Sir, the doctor loaded her up with sedatives. She’s out cold; she won’t be making a scene anymore.)\n▲布拉姆点了点头。\n布拉姆（冷冽）：不管如何，宴会之前别让她惹出事情。（Either way, don't let her cause trouble before the banquet.）\n管家（不解）：教父，您明知道夫人和娜塔莉亚在联手动手脚？为什么不阻止她们？（Godfather, you know Celeste and Natalia are working together. Why not stop them?）\n▲布拉姆看了一眼塞莱特斯，嗤笑了一声。\n布拉姆（不屑）：两个落入狼群的兔子，能翻出什么浪花？顶多两个有趣的猎物而已！（Two rabbits in a wolf pack. What can they do? Just two little rabbits for me to play with.）\n20-2\n日  内  宴会厅\n人物  布拉姆  娜塔莉亚  塞莱特斯   戴安娜  宾客若干   莱恩  伊丽莎白\n▲宴会厅金碧辉煌，娜塔莉亚带着戴安娜在甜品区吃糕点，娜塔莉亚远远看着塞莱特斯挽着布拉姆的手，正在和一对夫妇聊天，女人打扮华丽【塞莱特斯母亲 伊丽莎白】，男人【塞莱特斯父亲 莱恩】看起来风度翩翩，举手投足都十分贵气，塞莱特斯似乎察觉了娜塔莉亚的目光，二人对视了一眼互相点头。【Celeste’s Mother, Elizabeth】【Celeste’s Father, Ryan】\n▲娜塔莉亚亲眼看着塞莱特斯将一杯酒递给了布拉姆，布拉姆将酒一口喝了。\n娜塔莉亚OS：上钩了，这酒里的可是好东西。（Got him. There’s something extra in that drink.）\n▲戴安娜看了过去。\n戴安娜：那是塞莱特斯夫人的妈妈，（情绪低落）我也好想我的妈妈呀。（That's Celeste's mom. I miss my mommy too.）\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的戴着帽子的男性客人，路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n男客人（伸手扶娜塔莉亚和戴安娜）：抱歉。（My apologies.）\n▲娜塔莉亚摇了摇头。\n娜塔莉亚：我没什么大碍。（I'm fine.）\n▲布拉姆听到这边的动静，立刻看了过来。\n布拉姆（担心）：发生了什么事？（What happened?）\n男客人（歉意）：教父，不好意思，我差一点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n▲布拉姆故作绅士。\n布拉姆：不必介怀，请您继续享用晚宴吧。（No worries. Enjoy the banquet.）\n▲布拉姆摸了摸戴安娜的脑袋。\n布拉姆：我的小公主，玩的开心吗？（My little princess, having fun?）\n戴安娜（点头）：嗯！（Yeah!）\n布拉姆（温和）：宾客太多了，你跟娜塔莉亚医生回房间好不好？（Too many guests. Go back to your room with Dr. Natalia, okay?）\n戴安娜：可是我还没玩儿够……（But I'm not done playing...）\n娜塔莉亚（抱起）：小姐，我们听教父的话，（柔声安抚）回房间我给你讲故事好不好？（Miss Diana, let's listen to the Godfather. I'll tell you a story in your room, okay?）\n▲就在娜塔莉亚准备离开时，塞莱特斯突然举着酒杯过来，笑着对布拉姆说。\n塞莱特斯：布拉姆，父亲让你陪他喝一杯——啊！（Bram, Father wants you to have a drink with him—ah!）\n▲塞莱特斯突然脚下一滑，一杯酒一下子泼到了布拉姆的身上，众人齐刷刷地看了过去。\n▲布拉姆昂贵的西装被打湿，看上去有些狼狈。\n塞莱特斯（震惊）：哦～天啊！布拉姆，我不是故意的。（Oh my God! Bram, I didn't mean it.）\n▲众目睽睽下，布拉姆强忍怒气，对着塞莱特斯露出了温和的笑容。\n布拉姆（安抚）：别太自责，我去换套衣服，你照顾一下宾客！（Don't blame yourself. I'll go change. You take care of the guests.）\n▲布拉姆优雅转身离开，塞莱特斯给娜塔莉亚使了个眼神，娜塔莉亚立刻点了点头。\n塞莱特斯（兴奋）OS：今夜过后，我就能离开了，娜塔莉亚，你可千万别让我失望！（After tonight, I'll be free. Natalia, don't let me down!）\n20-3\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲敲门声响起，布拉姆赤裸着上身开门。\n布拉姆（烦躁）：送个衣服都这么慢，当心我崩了你们……（What’s taking so long with those clothes? I swear, I’ll shoot you if...）\n▲布拉姆的声音戛然而止，只见娜塔莉亚穿着一条性感的低胸吊带连衣裙，抱着西装站在门口。\n布拉姆（惊愕）：娜塔莉亚？你穿成这样来干什么？（Natalia? What the hell are you wearing?）\n\n\n第二十一集\n21-1\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n娜塔莉亚（挑眉）：教父不喜欢刺激吗？（抚摸布拉姆的胸膛）还是，您有别的顾虑？（What’s wrong, Godfather? Don't tell me you're scared of a little excitement...）\n▲布拉姆看着娜塔莉亚，眼神从惊愕变成了玩味。\n布拉姆（捏住了娜塔莉亚的下巴）：激将法对我可没用！（笑）不过，我现在的确想把你吃掉！（Reverse psychology won't work on me, sweetheart. Though... I've got to admit, I'm dying to devour you right now.）\n▲布拉姆四下看了一眼，没看见人，他抓住了娜塔莉亚的手臂，将她抗在了自己的肩膀上，然后锁上了门。\n▲塞莱特斯看着布拉姆将娜塔莉亚拉入了房间，嘴角勾起了一个弧度，她转身向宴会厅走去。\n21-2\n日  内  宴会厅\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白\n▲宴会厅中，伊丽莎白挽着莱恩的手，正在和宾客寒暄，塞莱特斯一把抓住了伊丽莎白的衣服。\n塞莱特斯：妈妈，布拉姆出轨了。（Mom, Bram is cheating.）\n▲众人震惊，目光惊愕地盯着塞莱特斯，伊丽莎白迅速捂住了塞莱特斯的嘴巴。\n伊丽莎白（警告）：塞莱特斯！不要胡说！我想布拉姆应该不是这种人。（Celeste! Don't talk nonsense! I don't think Bram is that kind of man.）\n▲塞莱特斯摇了摇头，挣脱了伊丽莎白的手，拽着她往楼上走。\n塞莱特斯（委屈）：我亲眼看到他和一个女人进入了房间里面，请您相信我！（I caught him with my own eyes! He slipped into that room with a woman, you have to believe me!）\n▲众目睽睽之下，塞莱特斯和莱恩对视了一眼，莱恩将酒杯放在了桌子上。\n莱恩（冷哼）：哼，如果布拉姆敢背叛你，我绝不会放过他！（Hmph. If Bram dares to betray you, I won't let him get away with it!）\n▲莱恩大步流星地往房间走，塞莱特斯拉着伊丽莎白跟了上去，宾客们也跟着去看热闹。\n21-3\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚\n▲布拉姆垂眸盯着站在自己面前的娜塔莉亚，眼神透着审视。\n布拉姆（捏娜塔莉亚的手）：今天是我的生日宴，外面都是宾客，你想害我？嗯？（It's my birthday banquet. Guests are everywhere. You want to set me up? Hmm?）\n▲娜塔莉亚轻轻抚摸着布拉姆的脖子。\n娜塔莉亚（笑）：怎么会？（靠近布拉姆的耳朵）今天是您的生日。这是我特地为您准备的生日礼物！（Of course not. It's your birthday. This is a birthday gift I prepared just for you!）\n布拉姆（捏娜塔莉亚的腰）：把你自己当做礼物送给我？（Giving yourself to me as a gift?）\n▲娜塔莉亚缓缓拉下了自己的一根肩带，手在布拉姆身上摸索。\n娜塔莉亚（点头）：当然，过了今夜，您就是我的第一个男人，也是唯一的……（Of course. After tonight, you'll be my first man, and my only...）\n▲布拉姆喉结滚动了一下，一翻身，将娜塔莉亚压到身下！\n▲切镜。\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲门突然被大力踹开，娜塔莉亚和布拉姆猛地抬头，塞莱特斯带众人站在门口。\n塞莱特斯（呵斥）：你们在干什么——（What the hell is going on here?）\n\n\n第二十二集\n22—1日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。\n塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）\n▲娜塔莉亚对视塞莱特斯摇了摇头。\n【闪回】\n22-2\n日  内  布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲突然，外面传来了敲门声。\n女佣vo：教父，夫人带着伯爵和伯爵夫人过来了。（Godfather, Madam is here with the Count and Countess.）\n▲娜塔莉亚惊讶，下一刻，布拉姆突然清醒过来，一把将娜塔莉亚推开。\n布拉姆：快把衣服穿好！（Get dressed. Now!）\n【闪回结束】\n▲布拉姆带着温和的笑容，看向了塞莱特斯和莱恩夫妇。\n布拉姆（优雅）：爸妈怎么过来了？（Father, Mother... what a pleasant surprise. Is something wrong?）\n莱恩（尴尬）：你太久没出来，我们过来瞧瞧。（You've been missing for quite a while. We were getting concerned.）\n塞莱特斯（指着布拉姆）：娜塔莉亚怎么在这里？你们孤男寡女躲开宾客在这里面做什么？（Why is Natalia here? What are you two doing alone away from the guests?）\n布拉姆（从容）：戴安娜在宴会上受到了一些惊吓，娜塔莉亚正在向我汇报，有问题吗？（Diana got a little scared at the banquet. Natalia was briefing me on her condition. Is there a problem?）\n塞莱特斯（呵斥）：什么问题非要现在汇报？（看娜塔莉亚）你说，你们在这里面干什么？！（What could be so urgent it couldn't wait until tomorrow?! You! Tell them the truth! What were you doing in his room?）\n▲塞莱特斯的情绪特别激动，目光死死盯着娜塔莉亚，眼神带着祈求。\n塞莱特斯：你说啊！（Say it!）\n▲所有人的目光都落在了娜塔莉亚的身上。\n娜塔莉亚（握紧报告）OS：塞莱特斯，对不起了。（Celeste, I'm sorry.）\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n▲塞莱特斯惊愕地看着娜塔莉亚。\n塞莱特斯（不敢相信）：什么？你撒谎！（抓住了莱恩的手）爸爸，除了这个女人，地下室还藏在一个女人！（What? You're lying! Dad, besides this woman, there's another woman hidden in the basement!）\n莱恩（惊讶）：什么地下室？（The basement?）\n▲众人震惊，布拉姆面色阴沉，娜塔莉亚激动地看向了莱恩。\n\n二卡\n\n\n第二十三集\n23-1\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲布拉姆上前一步，握住塞莱特斯的手。\n布拉姆（深呼吸）：塞莱特斯，我知道你生病了，你也很难受，但有什么问题，我们私下说好吗？（Celeste, I know you're sick and it's hard, but let's talk in private, okay?）\n▲众人惊讶。\n伊丽莎白：生病了？（Sick?）\n塞莱特斯：你胡说——（看伊丽莎白和莱恩）爸爸妈妈，他胡说的，我没有生病！（You're lying—Mom, Dad, he's lying! I'm not sick!）\n▲布拉姆拿出了检查报告递给了莱恩和伊丽莎白。\n布拉姆（悲痛）：这是塞莱特斯的精神检查报告。她有严重的被害妄想症和梦游症，这一切都是她臆想出来的。（This is Celeste's psychiatric report. She has severe paranoia and sleepwalking disorder. She imagined all of it.）\n▲众人震惊。\n▲莱恩接过检测报告，有些惊讶。\n布拉姆：她一直怀疑我会出轨，怀疑我会害她。（叹气）可是我没有。（She’s constantly convinced I'm unfaithful, that I'm trying to destroy her. God knows I've done nothing of the sort.）\n伊丽莎白（惊讶）：这些事情，你为什么不早告诉我们？（Why didn't you tell us sooner?）\n布拉姆（难过）：你们身体不好，我不想让你们担心——（鞠躬）是我没照顾好她。（You both have delicate health; I didn't want to burden you. It's my fault, I simply failed to protect her.）\n▲宾客盯着布拉姆，忍不住小声议论了起来。\n宾客1：教父果然是重情重义，塞莱特斯夫人这样对待他，他还不离不弃！（The Godfather is a saint. His wife treats him like dirt, and he still covers for her!）\n宾客2：是啊，教父能成为伯爵的女婿，人品肯定很好。（Yeah. If the Count made him his son-in-law, he must be a good man.）\n▲塞莱特斯一把将报告抢过来，直接撕碎了。\n塞莱特斯（咆哮）：我没疯！是他在撒谎——（I'm not crazy! He's lying—）\n▲莱恩打量着一眼看热闹的宾客，立刻呵斥塞莱特斯。\n莱恩：够了！塞莱特斯注意你的言行！（Enough! Celeste, watch your behavior!）\n▲伊丽莎白立刻抓住了塞莱特斯的手，示意她别再说了。\n莱恩（冷脸）：行了，立刻收拾好，出来接待宾客，别再闹些笑话让人误会！（看向宾客）都散了吧。（All right. Clean yourself up and come greet the guests. Stop embarrassing us. Everyone, please, enjoy yourselves—nothing to see here.）\n▲宾客们十分给莱恩的面子，离开了。\n塞莱特斯（着急）：爸爸——（Dad—）\n▲莱恩拽着塞莱特斯离开。\n莱恩（呵斥）：跟我过来，我有话跟你说。（Come with me. I need to talk to you.）\n▲所有人都离开之后，布拉姆一抬手将桌角的花瓶狠狠摔碎。\n布拉姆（恨）：一群杂碎，早晚有一天，我要将你们全部踩在脚底！（A bunch of trash. One day, I'll put every one of you under my feet!）\n▲娜塔莉亚吓了一跳，连忙低下头去。\n娜塔莉亚（恭敬）：教父，抱歉，是我的鲁莽给您惹麻烦了。（Godfather, I'm sorry. My recklessness caused you trouble.）\n▲布拉姆一腔火气，拿起桌上的枪抵着娜塔莉亚的脑袋。\n布拉姆（呵斥）：到底是有意的，还是无意的！（Was it on purpose or not?）\n▲娜塔莉亚惊慌地举起双手，盯着布拉姆的眼睛。\n布拉姆（审视）OS：当猎物脱离掌控时，我一定会亲手杀掉她！我讨厌这种失控感！（When prey slips out of control, I'll kill her myself. I hate losing control.）\n▲布拉姆突然开枪，子弹射出擦着娜塔莉亚的脸颊而过，打碎了花瓶，娜塔莉亚尖叫了一声，连忙开口。\n娜塔莉亚（惊呼）：教父，我承认，我是故意的！（Godfather, I admit it. I did it on purpose!）\n布拉姆（呵斥）：你为什么要这么做！（Why did you do it?）\n娜塔莉亚（慌乱）：我想得到您，我想取代塞莱特斯，（一把抱住布拉姆）您不是说给我一个机会吗？（I want you. I want to replace Celeste. Didn't you say you'd give me a chance?）\n▲布拉姆震惊。\n\n\n第二十四集\n24-1\n日  内   布拉姆房间\n人物 布拉姆  娜塔莉亚 \n▲布拉姆惊讶地看着娜塔莉亚。\n布拉姆（惊讶）：什么？（What did you just say?）\n▲娜塔莉亚抬头看着布拉姆。\n娜塔莉亚（诚恳）：塞莱特斯根本就不懂您，也配不上您，您这么强大、睿智，我实在太仰慕您了，才会铤而走险抓住这个机会，我以为……（Celeste doesn't understand you. She doesn't deserve you. You're so powerful and smart. I admire you so much that I took this risk. I thought...）\n▲布拉姆盯着娜塔莉亚的眼睛，握着枪的手垂了下去，揉了揉额头。\n布拉姆（放缓语气）：你以为在今天跟我上床，被发现了，我就会和塞莱特斯离婚，娶你是吗？（You thought if you slept with me today and we got caught, I'd divorce Celeste and marry you?）\n▲娜塔莉亚握住布拉姆的枪，指着自己的脑袋。\n娜塔莉亚（认真）：您杀了我吧，杀了我证明您的清白！（Then pull the trigger! Kill me right now to prove you had nothing to do with this!）\n▲布拉姆惊讶，猛地收回了枪。\n布拉姆（拍娜塔莉亚的脸）：我不会杀你，你先回去陪戴安娜吧，我会处理好。（轻轻拥抱）记住，在这里，只有我能保护你。（I won't kill you. Go keep Diana company. I'll handle it. Remember, in this place, only I can protect you.）\n▲娜塔莉亚红着眼睛点了点头，转身离开，镜头特写，娜塔莉亚走到门口时，摊开手心，掌心里面躺着一把金色的钥匙。\n▲布拉姆盯着娜塔莉亚的背影，冷笑了一声。\n布拉姆OS：两个女人以为联手就能毁掉我？做梦？（Two women think they can team up and destroy me? Dream on.）\n24-2\n日  外 花园\n人物  莱恩  伊丽莎白   塞莱特斯  布拉姆   管家\n▲塞莱特斯焦急地看着父母。\n塞莱特斯：爸爸妈妈你们刚刚为什么不帮我，我真的没病！（Mom, Dad, why didn't you help me just now? I'm really not sick!）\n莱恩：塞莱特斯，你先冷静，我们并没有看到布拉姆出轨，如果为了他跟别的女人说话而大动干戈，只会显得我们无礼。（Celeste, calm down. We didn't see Bram cheating. Making a scene because he talked to another woman would just make us look rude.）\n伊丽莎白：是啊，塞莱特斯，你不该在大庭广众之下伤了布拉姆的脸面，况且那女人只是他孩子的心理医生，别人会觉得你是个恶毒的后妈。（Yes, Celeste. You shouldn't embarrass Bram in public. Besides, that woman is just his child's therapist. People will think you're a cruel stepmother.）\n塞莱特斯（绝望）：爸爸妈妈，你们不相信我？（Mom, Dad, you don't believe me?）\n伊丽莎白（安抚）：塞莱特斯，一个心理医生，你不喜欢她，找个机会把她赶走就好了！（Celeste, she's just a therapist. If you don't like her, find a chance to get rid of her.）\n莱恩（抚摸塞莱特斯的头发）：你自小性格要强，肯定受不了丝毫委屈，教父现在权势滔天，你应该获取他的欢心，况且他对你很好，别无理取闹了。（You've always been strong-willed. You can't stand the slightest grievance. The Godfather is powerful now. You should win his favor. Besides, he treats you well. Stop making a fuss.）\n▲塞莱特斯绝望的后退了半步。\n塞莱特斯：不，不是这样的。（No, it's not like that.）\n莱恩（心疼）：你放心，爸爸会联系最好的医生治疗你的病！（Don't worry. I'll contact the best doctor to treat you!）\n▲镜头上拉：布拉姆站在二楼的窗户，眼神冰冷地盯着他们。\n布拉姆（狠辣）OS：这场捕猎游戏，我玩儿够了，该结束了！（I'm done playing this hunting game. It's time to end it.）\n\n\n第二十五集\n25-1\n夜  内   宴会厅门口\n人物 塞莱特斯   伊丽莎白  下人若干 莱恩 布拉姆   娜塔莉亚\n▲莱恩和伊丽莎白站在门口，布拉姆站在二人面前，莱恩严肃地盯着布拉姆。\n莱恩（温和）：布拉姆，你对塞莱特斯的好，我们看在眼中，但她就是大小姐脾气，希望你多多担待，不要跟她一般见识。（Bram, we know you care for Celeste deeply. But she’s always had a headstrong, spoiled streak. Do be gentle with her, and try not to take her outbursts to heart.）\n伊丽莎白（温和）：夫妻之间，要互相体谅。（Married couples need to understand each other.）\n▲众目睽睽下，布拉姆握着的拳头青筋暴起。\n布拉姆（冷漠）OS：一群虚伪的贵族，凭什么高高在上教训我，等我拿到了他所有的资源，我一定把他丢去喂鲨鱼！这一天马上就要到来了！（A bunch of hypocritical nobles. What gives you the right to lecture me? Once I get all his resources, I'll feed him to the sharks. That day is coming soon.）\n▲布拉姆弯着脊梁低头道歉。\n布拉姆：您放心，我很爱她，我保证会照顾好她的。（Don't worry. I love her very much. I promise I'll take good care of her.）\n▲塞莱特斯瞧着布拉姆的样子，害怕地死死握住了伊丽莎白的手。\n伊丽莎白（心疼）：布拉姆，塞莱特斯状态不太好，不如让她先跟我们回去住几天？（Bram, Celeste isn't doing well. Why not let her come home with us for a few days?）\n▲塞莱特斯的眼睛都亮了起来，娜塔莉亚不动声色地看向这边。\n娜塔莉亚OS：只要塞莱特斯离开了这里，我们的计划就成功了！（If Celeste leaves this place, our plan works!）\n▲布拉姆伸手将塞莱特斯搂在怀中，绅士地开口。\n布拉姆：妈，塞莱特斯还需要接受治疗，我比较了解她的情况，如果塞莱特斯现在离开，可能会中断她的治疗。（Mom, Celeste still needs treatment. I know her condition better. If she leaves now, it could interrupt her treatment.）\n莱恩（点头）：布拉姆说得有道理，别影响塞莱特斯的治疗。（Bram has a point. Don't interrupt her treatment.）\n▲塞莱特斯眼眶瞳孔，伊丽莎白不舍得吻了吻她的脸颊，安抚她。\n伊丽莎白：听话，好好治病，等你状态好了，妈妈来接你。（Be good. Do what the doctors say. Once you're better, I'll come get you.）\n塞莱特斯（绝望）：妈妈，我真的没病——（Mom, I'm really not sick—）\n布拉姆（搂住塞莱特斯）：塞莱特斯，听话，太晚了，让爸爸妈妈回去好好休息吧。（Celeste, be good. It's late. Let Mom and Dad go home and rest.）\n▲伊丽莎白松开了塞莱特斯，挽着莱恩的手上车，布拉姆带着微笑搂着塞莱特斯目送二人，车子离开之后，布拉姆突然伸手捏住了塞莱特斯的脖子。\n布拉姆（眼神阴冷）：关门，我的夫人需要接受治疗了！（Lock the gates. My wife is due for her treatment.）\n\n\n第二十六集\n26-1\n夜  内   宴会厅/走廊\n人物 塞莱特斯   下人若干  布拉姆   娜塔莉亚\n▲安保瞬间关上了庄园的大门，整个庄园被围了起来，布拉姆掐着塞莱特斯的脖子，逼迫着塞莱特斯上楼。\n塞莱特斯（惊呼）：松开我！爸爸——妈妈，救命——（Let me go! Dad—Mom, help—）\n▲娜塔莉亚惊愕地看着眼前的场景，她连忙站在旁边，给布拉姆让路，塞莱特斯路过娜塔莉亚的时候，眼神紧紧盯着娜塔莉亚，又看着屋内的佣人们，佣人们低着头不敢抬头。\n▲镜头特写：其中一个女佣退到了人群后面，悄无声息地往门口走。\n▲娜塔莉亚瞧着布拉姆将塞莱特斯拉入了房间狠狠关上了门，她连忙转头往地下室方向跑。\n娜塔莉亚（紧张）OS：钥匙已经到手了，布拉姆应该不会杀了塞莱斯特，我得趁乱先救出姐姐！（I have the key. Bram probably won't kill Celeste. .. I have to take advantage of this chaos and get my sister out NOW.）\n26-2\n夜   内   塞莱特斯房间\n人物：女佣   布拉姆  塞莱特斯  \n▲布拉姆将塞莱特斯拉入了房间狠狠摔在了床上，他扯松了领带，死死盯着塞莱特斯。\n▲塞莱特斯惊恐后退。\n塞莱特斯：你要干什么——你敢对我动手，我父母不会放过你的！（What are you doing? If you touch me, my parents won't let you get away with it!）\n▲布拉姆笑着看着塞莱特斯。\n布拉姆（笑容诡异）：塞莱特斯，我怎么舍得杀了你？只是我不明白，我这么爱你，你为什么要害我！（Celeste, how could I bear to kill you? I just don't understand. I love you so much, why did you try to hurt me?）\n塞莱特斯（惊恐）：我没有害你！是你自己和娜塔莉亚不清不白，难道还不允许我告诉我父亲吗？（I didn't hurt you! You're the one fooling around with Natalia. Am I not allowed to tell my father?）\n布拉姆（抓住塞莱特斯的头发）：是你在酒里下毒，还带着人捉奸，害我在大庭广众之下被你父亲训斥！还不算害我吗？（You spiked my drink! You staged a scandal to catch me red-handed, and you let your father humiliate me in front of everyone! You call that not trying to ruin me?）\n塞莱特斯（惊恐真正）：我没有！（I didn't!）\n布拉姆（膝盖压住塞莱特斯的腿）：怎么？你想离开我？（What’s the matter? Dying to run away from me?）\n塞莱特斯（尖叫）：啊——（Ah—）\n布拉姆（逼问）：你是不是看不起我？是不是觉得我配不上你？（You look down on me, don't you?! You think a high-and-mighty heiress is too good for a man like me?）\n\n\n第二十七集\n27-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲塞莱特斯被压得表情扭曲。\n塞莱特斯（痛苦）：不——我没做过！（No—I didn't do it!）\n▲布拉姆一把将塞莱特斯从床上拉起来。\n布拉姆（冷笑）：不承认是吧？（Not admitting it, huh?）\n▲布拉姆将她摁在了窗口，只见庄园里面有个女佣悄无声息地靠近围墙。\n布拉姆（冷冽）：那是你的信使吗？（举起枪对准女佣的后背）（Is that your messenger?）\n塞莱特斯（惊恐）：不，别杀她！（No, don't kill her!）\n▲布拉姆冷笑，一枪崩了女佣（枪声，窗外鸟雀惊飞，避免直给暴力镜头），塞莱特斯也跟着尖叫了一声。\n▲切镜。\n▲娜塔莉亚站在地下室的入口，她正打算下去。\n娜塔莉亚OS：等我救出姐姐，再去救塞莱特斯！（Once I save my sister, I'll go save Celeste!）\n▲突然，外面响起了枪声，娜塔莉亚连忙转身走向了塞莱特斯的房间。\n娜塔莉亚OS：塞莱特斯！——（Celeste!—）\n▲娜塔莉亚转身向楼上跑去。\n▲切镜。娜塔莉娅刚跑到塞莱斯特门口，突然戴安娜从房间里面走了出来，一把抓住了娜塔莉亚的手，娜塔莉亚惊愕地低头看着戴安娜。\n戴安娜（乖巧）：别过去！（Don't go over there!）\n▲娜塔莉亚惊讶。\n▲切镜\n▲屋内。\n▲布拉姆摁着塞莱特斯的脖子。\n布拉姆（嗤笑）：夫人，我知道娜塔莉亚是谁，她是玛莉的妹妹对吗？（Ma'am, I know who Natalia is. She's Mary's sister, right?）\n▲塞莱特斯惊恐地看着布拉姆。\n塞莱特斯（紧张）：我，我不知道你在说什么！（I—I don't know what you're talking about!）\n▲布拉姆拽住她的头发。\n布拉姆（嘲讽）：夫人，你居然把希望放在一个刚刚毕业的心理医生身上，她的确有些小聪明，可惜，柔弱的像是一只兔子，毫无威胁力！（Ma'am, you put your hope in a fresh-out-of-school therapist. She's a little smart, but weak as a rabbit. No threat at all!）\n▲说着，布拉姆摁住塞莱特斯的脖子，让她趴在窗边上，逼她看着死在地上的女佣，一字一句地威胁。\n布拉姆（残忍）：你猜，我明明什么都知道，为什么还要放过娜塔莉亚？（蛊惑）因为她诚实，夫人，你诚实吗？（Guess why I let Natalia live when I know everything? Because she's honest. Are you honest, ma'am?）\n▲塞莱特斯不可置信地盯着布拉姆。\n塞莱特斯OS：娜塔莉亚出卖我？（Natalia sold me out?）\n【闪回14-1】\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n【闪回22-1】\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n【闪回结束】\n▲塞莱特斯握紧拳头。\n塞莱特斯OS：娜塔莉亚每次都没有按照计划行事，难道她真的为了保命牺牲我……（Natalia never followed the plan. Did she really sacrifice me to save herself...）\n▲布拉姆盯着塞莱特斯的眼睛。\n布拉姆（蛊惑）：塞莱特斯，我比你的父母更疼爱你，他们都不管你，只有我护着你，告诉我，是不是有人蛊惑你？（Celeste, I love you more than your parents do. They don't care about you. Only I protect you. Tell me, did someone turn you against me?）\n▲塞莱特斯惊恐地摇头，不肯说。\n▲布拉姆松开了塞莱特斯拿出了一支药剂，他推动针管，药水喷出来了些。\n布拉姆（威胁）：知道这是什么吗？（Know what this is?）\n▲塞莱特斯惊恐后退，布拉姆一步一步逼近。\n布拉姆（阴沉）：放心，不死，只是会麻痹神经，颤抖，抽搐，瘫痪……（Relax... it won't kill you. It just rots your nervous system from the inside—first come the shakes, then the spasms, until you're completely paralyzed.）\n塞莱特斯（惊恐）：不！我说！我什么都告诉你！（No! I'll talk! I'll tell you everything!）\n\n\n第二十八集\n28-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲布拉姆满意地看着塞莱特斯。\n塞莱特斯：是娜塔莉亚，她——（It's Natalia. She—）\n▲外面突然传来了戴安娜的尖叫声。\n戴安娜vo：啊——（Ah—）\n▲紧接着传来花瓶摔碎的声音。\n娜塔莉亚vo：小姐！请您冷静下来。（Miss Diana! Please calm down.）\n戴安娜（尖叫）：妈妈——我要妈妈——（Mommy—I want Mommy—）\n娜塔莉亚（敲门）：教父！不好了！小姐发病了，我需要医生的帮助！！（Godfather! Something's wrong! She's having an episode. I need a doctor!!）\n▲布拉姆将注射器放下，转身往外走。\n布拉姆：老实待着！（Stay right there!）\n▲布拉姆大步流星地走了出去，塞莱特斯捂着心口，泪流满面。\n28-2\n夜  内   戴安娜房间\n人物  戴安娜  医生  娜塔莉亚  布拉姆\n▲戴安娜躺在床上，闭着眼睛，娜塔莉亚和布拉姆站在旁边，医生正在收拾器材。\n医生：教父，小姐的情况不太稳定，不能受到刺激。（Godfather, Diana's still not doing well. We need to keep her calm.）\n▲布拉姆点了点头，医生离开了，布拉姆轻轻抚摸着戴安娜的额头，轻吻了她的额头，眼中流露出慈爱。\n布拉姆（心疼）：我可怜的女儿……（My poor daughter...）\n▲娜塔莉亚盯着戴安娜。\n【闪回28-3】\n夜 内  走廊\n人物  娜塔莉亚  戴安娜\n▲塞莱特斯的房间里面传来塞莱特斯惊恐的声音。\n塞莱特斯vo：不，别杀她！我说！我什么都告诉你！（No, don't kill her! I'll talk! I'll tell you everything!）\n▲娜塔莉亚着急地走向了门口，突然，戴安娜尖叫了一声。\n戴安娜（尖叫）：啊——啊！我要妈妈——（Ah—ah! I want Mommy—）\n▲娜塔莉亚回头，戴安娜突然失控，用力打碎了花瓶。\n【闪回结束】\n▲娜塔莉亚低声安抚布拉姆。\n娜塔莉亚：教父，别担心。上帝会保佑小姐的。（Godfather, don't worry. God will protect her.）\n▲布拉姆看向娜塔莉亚。\n布拉姆（严肃）：想不想知道戴安娜是什么时候开始生病的？（站了起来）跟我来，我现在告诉你。（Want to know when Diana first got sick? Come with me. I'll tell you now.）\n▲娜塔莉亚惊讶，娜塔莉亚站了起来，跟着布拉姆走出房间。\n28-4 \n夜  内  地下室门口\n人物  布拉姆  娜塔莉亚\n▲布拉姆和娜塔莉亚站在了地下室门口，地下室上绑满了铁链。\n布拉姆：真相就在这里，你不是早已拿到了钥匙，打开吧。（The truth is right here. You already got the key, didn't you? Open it.）\n▲娜塔莉亚看到地下室的门，眼神惊愕，心跳加速。\n\n三卡\n\n\n第二十九集\n29-1\n夜  内   收藏室\n人物    娜塔莉亚  布拉姆\n▲娜塔莉亚盯着地下室的门，里面安安静静。\n娜塔莉亚（担心）OS：怎么没声了？难道姐姐已经遇害了？（Why is it quiet? Is my sister already dead?）\n▲布拉姆搂着娜塔莉娅的腰，从裙子腰封里摸出钥匙，打开了地下室旁边的一道门。\n布拉姆（看娜塔莉亚）：进来吧。（Come on in.）\n娜塔莉亚（惊讶）：这是……（This is...）\n▲布拉姆打开灯，娜塔莉亚被眼前的场景惊呆了，只见收藏室里面，全是玛莉的照片，婚纱照，合照，抱着孩子的照片，还有全家福。\n布拉姆（抚摸照片）：这是我的妻子玛莉，是戴安娜的母亲。（This is my wife, Mary. Diana's mother.）\n▲娜塔莉亚看着墙上的照片，有一张是玛莉抱着戴安娜的照片。(定格照片转场）\n【闪回】\n日  内  破旧房屋\n人物  小玛莉  小娜塔莉亚\n▲小玛莉抱着小娜塔莉亚。\n小娜塔莉亚（天真）：被姐姐抱在怀里，总是很安心！（Being in your arms always makes me feel safe!）\n小玛莉：那姐姐就一直抱着你。（Then I'll keep holding you.）\n【闪回结束】\n▲娜塔莉亚捏着裙摆，打量着照片，故意露出了惊讶的神色。\n娜塔莉亚（紧张）：这么多照片，天啊，教父，您一定很爱她吧。（So many photos. Godfather, you must have loved her so much.）\n布拉姆（表情眷恋）：是的，我很爱她，我们在一起十年，她跟我在一起的时候，我一无所有，是她鼓励我，我才有了今天。（Yeah, I loved her. We were together for ten years. I had nothing when we met, but she always believed in me. I wouldn't be where I am today without her.）\n▲娜塔莉亚看着照片，布拉姆观察着娜塔莉亚的表情，嘴角勾起了一个弧度，他深情地抚摸着全家福。\n布拉姆：在塞莱特斯没出现之前，我们曾是最幸福的一家人，可我的妻子太善良了，相信了贵族的谎言，最后被……（Before Celeste came, we were the happiest family. But my wife was too kind. She believed the nobles' lies, and in the end she was...）\n▲布拉姆哽咽了一下，娜塔莉亚回头看向了布拉姆。\n娜塔莉亚（惊讶）：您别这样，她看见您难过，也会难过的。（You don't have to do this. She wouldn't want to see you hurting like this.）\n布拉姆（落泪）：我们不过是权贵的玩物，只能向权贵低头。（抚摸着全家福）我娶塞莱特斯是怕他们继续出手伤害我的女儿。（We're just toys to the powerful. We have no choice but to do what they say. I married Celeste because I was afraid they'd hurt my daughter again.）\n▲这时，一张照片从全家福里面落了下来，照片上：塞莱特斯站在玛莉面前，玛莉红着眼睛望着塞莱特斯。娜塔莉亚惊愕地看着照片。\n娜塔莉亚OS：这是……塞莱特斯没跟我说过她见过姐姐，难道之前的话是在说谎？（This is... Celeste never told me she met my sister. Was she lying before?）\n▲布拉姆观察着娜塔莉亚的表情，捡起了照片。\n布拉姆（悲伤）：娜塔莉亚，我大概知道你是谁了，戴安娜已经失去了母亲了，不能再失去父亲了对吗？（Natalia, I think I know who you are. Diana already lost her mother. She can't lose her father too, right?）\n▲娜塔莉亚一步步后退。\n娜塔莉亚（惊愕）：什么？您知道我是谁？（What? You know who I am?）\n\n\n第三十集\n30-1\n夜  内  画室\n人物  娜塔莉亚  布拉姆\n▲布拉姆步步紧逼，娜塔莉亚步步后退。\n娜塔莉亚：我不太明白您在说什么，我只是……（I don't really know what you mean. I'm just...）\n布拉姆（打断）：嘘，你不想说，可以不说。（Shh. If you don't want to say it, you don't have to.）\n▲布拉姆将塞莱特斯和玛莉的合照放在了娜塔莉亚的手中。\n布拉姆（警告）：娜塔莉亚，权贵绝不会将我们当作人看待，即便我功成名就，伯爵仍然会把我当狗一样训斥，你野心勃勃，你觉得他们会怎么样对你。（People at the top don't see us as equals, Natalia. I built an empire, yet the Count still treats me like a dog on a leash. You're hungry for power, aren't you? What makes you think they won't crush you like a bug?）\n▲娜塔莉亚抵在了墙上，盯着布拉姆。\n娜塔莉亚（紧张）：教父，您会保护我的，对吗？（Godfather, you'll protect me, right?）\n▲布拉姆抚摸着娜塔莉亚的脸颊，一字一句地说。\n布拉姆（蛊惑）：你和我的妻子玛丽一样天真，即便是为了她，我也会保护你。你、我、戴安娜，我们才是一家人，对吗？（You're as naive as my wife Mary. Even for her sake, I'll protect you. You, me, Diana, we're the real family, right?）\n▲娜塔莉亚表情震惊。\n▲布拉姆却后退了一步。\n布拉姆（温和）：娜塔莉亚，找一找有没有治疗戴安娜的方法吧，我只想我的女儿快点好起来。（Natalia, look for a way to cure Diana. I just want my daughter to get better.）\n▲说完之后，布拉姆转身离开了，他站在门口时，又补了一句。\n布拉姆（警告）：对了，千万别靠近地下室。（扬了扬钥匙）这个，还是我来保管比较好。（By the way, stay away from the basement. As for this? It stays right where it belongs with me.)\n娜塔莉亚（点头）：是。（Yes.）\n▲布拉姆关上门出去了，娜塔莉亚盯着墙上的照片 ，轻轻抚摸了玛莉的脸颊。\n娜塔莉亚（自言自语）：如果失去父亲，戴安娜会很痛苦吧，到底谁在说谎……（If she loses her father, Diana will be devastated. Who's really lying...）\n▲布拉姆站在门口，从门缝里面看着娜塔莉亚的表情，嘴角勾起了一道弧度。\n30-2\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆 女佣\n▲娜塔莉亚正在给戴安娜拿早餐，塞莱特斯走入餐厅，眼神冰冷地盯着娜塔莉亚，她狠狠撞了一下娜塔莉亚，冷声呵斥。\n塞莱特斯：怎么？你真想将我取而代之。（What? You really want to take my place?）\n娜塔莉亚（恨）：夫人拿我做棋子玩得开心吗？（Did you enjoy using me as your pawn, ma'am?）\n▲塞莱特斯一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯：贱人！果然是你想害我！（You bitch! I knew you wanted to hurt me!）\n▲娜塔莉亚举起杯子将牛奶全部泼到了塞莱特斯的脸上。\n娜塔莉亚（愤怒）：夫人，我是戴安娜的心理医生，不是任你打骂的奴仆！（Ma'am, I'm Diana's therapist, not some punching bag for you to abuse!）\n▲众人震惊！\n▲镜头特写：布拉姆站在楼梯间静观其变。\n\n\n第三十一集\n31-1\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆\n▲布拉姆站在楼梯间，并没有阻止二人，眼神复杂地看着她们。\n▲塞莱特斯被泼了一脸。\n塞莱特斯（尖叫）：你敢泼我！你疯了吗？（You dare throw that at me? Are you insane?）\n娜塔莉亚（冷眼）：夫人，这只是给你一个教训，狂妄自大的人，将为自己的行为付出代价。（Ma'am, that's a lesson. Arrogant people pay for their behavior.）\n塞莱特斯：不过是个卑贱的下等人，敢教训我，你找死——（You low-class nobody. You dare lecture me? You're dead—）\n▲塞莱特斯擦了一把脸上的牛奶，伸手掐住了娜塔莉亚的脖子。\n塞莱特斯：贱人！我跟你拼了！（You bitch! I'll tear you apart!）\n▲娜塔莉亚也不甘示弱，抓起牛奶杯砸在了塞莱特斯的后背上。\n娜塔莉亚：放开我——（Let me go—）\n▲这时，布拉姆匆匆忙忙地走了下来。\n布拉姆（呵斥）：住手！（Stop!）\n▲布拉姆立刻将塞莱特斯的手掰开，将娜塔莉亚拉到自己的身后，冷眼盯着塞莱特斯。\n布拉姆：够了！一个心理医生，一个贵族夫人，竟然在餐厅打了起来，你们不觉得丢人吗？（Enough! A therapist and a noble lady fighting in the dining room. Aren't you ashamed?）\n塞莱特斯（疯）：丢人？（指着娜塔莉亚）这个贱人勾引你，想把我赶出这个家门，我还有什么脸面？（Ashamed? This bitch seduces you and wants to throw me out. What dignity do I even have left?）\n▲布拉姆一把抓住了塞莱特斯，不让她打娜塔莉亚。\n布拉姆（看娜塔莉亚）：你，回去照顾戴安娜。（You. Go take care of Diana.）\n▲娜塔莉亚红着眼睛瞪了塞莱特斯一眼，转身离开了。\n塞莱特斯：贱人！你别走！你给我站住！（Bitch! Don't walk away! You get back here!）\n▲布拉姆死死抓住了塞莱特斯的手臂，眼神兴奋了起来。\n布拉姆OS：互相撕咬吧，愚蠢的猎物们，真是越来越有趣了！（Tear each other apart, you stupid prey. This is getting more and more fun!）\n▲娜塔莉亚站在楼梯口，和塞莱特斯对视了一眼。\n31-2\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲夜里，塞莱特斯睁开眼睛，突然发现自己被绑在了椅子上，她挣扎了一下，布拉姆站在阴影中看着她。\n布拉姆（阴冷）：你醒了。（You're awake.）\n\n\n第三十二集\n32-1\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯惊恐地盯着布拉姆，布拉姆把玩着一柄教父权杖，低头看着塞莱特斯。\n塞莱特斯（挣扎）：布拉姆……你想干什么？（Bram... what do you want?）\n▲布拉姆一步一步走向了塞莱特斯。\n布拉姆（嗤笑）：你知道我等这一天等了多久吗？（抚摸塞莱特斯的脸颊）原来俯视贵族是这种感觉。（Do you know how long I've waited for this day? So this is what it feels like to look down on a noble.）\n塞莱特斯（惊愕）：布拉姆！我们是夫妻！你为什么想杀了我？（Bram! We're married! Why do you want to kill me?）\n布拉姆（捏着塞莱特斯的下巴）：夫妻？你从来就没有把我当作你的丈夫！（呵斥）被自己看不起的下等人掌控在手心的滋味如何？（Married? You never treated me as your husband! How does it feel to be in the hands of someone you looked down on?）\n塞莱特斯（惊讶）：我什么时候看不起你了？（When did I ever look down on you?）\n▲布拉姆掐住塞莱特斯的脖子。\n布拉姆（愤怒呵斥）：还敢说没有！你喝咖啡时优雅的德行，简直令我作呕！用餐时那套该死的礼仪，连擦嘴都要扭捏作态！你替我整理领带，就像在纠正一个不懂规矩的蠢货！你的每一个动作都在讽刺我，让我感觉自己像个不被驯养的野狗！（Still denying it! The way you drink coffee makes me sick! Those damn table manners—even wiping your mouth is a performance! When you fix my tie, it's like you're correcting a stupid fool who doesn't know the rules! Every move you make mocks me and makes me feel like an untamed dog!）\n▲塞莱特斯惊呆了，她有些窒息。\n塞莱特斯（挣扎）：你误会了！这些想法令我震惊！（You misunderstood! I'm shocked you'd think that!）\n▲布拉姆用力掐着塞莱特斯的脖子。\n布拉姆（愤怒）：什么误会？你那副天生高贵的嘴脸，早就把答案写在了脸上！（Misunderstood? That born-noble look on your face already gave the answer!）\n▲他突然松开塞莱特斯，蹲在了塞莱特斯的面前，头靠在了塞莱特斯的腿上。\n布拉姆（温和）：塞莱特斯，其实你也很崇拜我对不对？我现在已经是个合格的贵族了对吗？（Celeste, you admire me too, don't you? I'm a proper noble now, right?）\n▲塞莱特斯惊恐地看着趴在自己腿上的布拉姆，浑身发抖。\n塞莱特斯（惊恐）：求求你，放过我吧——（Please, let me go—）\n▲布拉姆突然站起来抓住塞莱特斯的头发，用枪抵着她的额头。\n布拉姆（愤怒）：说啊！说你也很崇拜啊！说你仰慕我！说啊——（Say it! Say you admire me! Say you worship me! Say it—）\n▲塞莱特斯吓得尖叫，布拉姆猛地松开了她。\n布拉姆（笑容诡异）：你们不是都好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're all curious what's in the basement, aren't you? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n\n\n第三十三集\n33-1\n夜   内   塞莱特斯的房间\n人物 娜塔莉亚 布拉姆  塞莱特斯\n▲布拉姆转身离开了，塞莱特斯吓得瘫软到了椅子上。\n塞莱特斯（咆哮）：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n▲布拉姆冷笑了一声，拿出厚厚的一叠文件递给了塞莱特斯。\n布拉姆（笑）：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲塞莱特斯盯着那些文件，脸色惨白。\n塞莱特斯（惊愕）：你，你什么时候做的这些？我怎么不知道？（When... when did you do all this? How did I not know?）\n布拉姆（得意）：就在你和娜塔莉亚斗的你死我活的时候。（高高在上）哦，对了，娜塔莉亚是我故意用来分散你的注意力的！（While you and Natalia were tearing each other apart. Oh, and Natalia? I used her to distract you on purpose!）\n33-2\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲字幕：第二天。\n字幕：第二天。（The next day.）\n▲别墅里面突然响起了女佣的尖叫声。\n女佣（尖叫）：啊！夫人，夫人她死了——（Ah! Mrs. Blackwood is dead!—）\n▲娜塔莉亚和布拉姆同时从两道不同的门里面出来，二人冲到了塞莱特斯的房间门口，只见塞莱特斯浑身是血躺在了地上。\n▲娜塔莉亚惊愕地盯着眼前的场景。\n娜塔莉亚（捂着嘴巴）OS：噢，我的老天！（Oh my God!）\n▲布拉姆冷着脸站在门口。\n布拉姆（咬牙切齿）OS：该死！她怎么就死了，还被人看见了，简直打乱了我所有的计划！（Damn it! Why did she die, and someone saw her? It ruins all my plans!）\n▲布拉姆要上前检查。\n布拉姆（看女佣）：报警吧！（Call the police!）\n布拉姆（冷静）OS：塞莱特斯死了也是一件好事情！我既保住了和伯爵的合作，又摆脱了她！（Honestly, Celeste dying might be a blessing in disguise. It keeps my alliance with the Count intact—and cuts loose my biggest dead weight）\n▲娜塔莉亚一把抓住了布拉姆的手臂，阻挡他前去检查。\n娜塔莉亚：教父，塞莱特斯不明不白死在了庄园，您是最后一个见她的人，如果您现在报警，会被怀疑的！（Godfather, Celeste died mysteriously in the estate. You were the last to see her. If you call the police now, you'll be suspected!）\n▲布拉姆抬了下手臂，示意佣人停止报警，佣人恭敬站定，布拉姆回头看向了娜塔莉亚。\n布拉姆（冷冽）：你的意思是？（What do you mean?）\n娜塔莉亚（担忧）：无论如何，您不能进入现场，一定要确保您没有丝毫的嫌疑！（Either way, you can't enter the scene. Make sure you're not a suspect!）\n▲布拉姆盯着娜塔莉亚，眼神危险。\n布拉姆OS：有意思，小兔子，我会将你彻底拉上我的船！（Interesting, little rabbit. I'll make sure you're in too deep to walk away.）\n▲布拉姆轻轻捏了一下娜塔莉亚的脸颊，似笑非笑地问道。\n布拉姆（微笑）：娜塔莉亚，你觉得怎么做更好？（Natalia, what do you think we should do?）\n▲娜塔莉亚看了一眼地上的尸体。\n娜塔莉亚（鼓起勇气）：不如将她埋了，就算她是装的，埋在地里之后，她也彻底死透了。（Why not bury her? Even if she's faking, once she's in the ground, she's dead for real.）\n▲布拉姆惊讶地看着娜塔莉亚。\n\n\n第三十四集\n34-1\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲布拉姆看了一眼塞莱特斯的尸体又看向了娜塔莉亚。\n布拉姆（蛊惑）：很好！（抚摸娜塔莉亚的脸颊）娜塔莉亚，你不是想要将塞莱特斯取而代之吗？给你一个机会。（Good. Natalia, didn't you want to replace Celeste? I'll give you a chance.）\n娜塔莉亚（惊愕）：什么？（What?）\n布拉姆（整理她的头发）：去把塞莱特斯的尸体装起来，抛入海中——我就娶你。（Bag up Celeste's body and throw it into the sea—and I'll marry you.）\n▲娜塔莉亚惊愕地看着布拉姆。\n娜塔莉亚（惊讶）：抛入海中？不是活埋吗？（Throw it into the sea? Not bury her?）\n▲布拉姆拿出手枪，在手中把玩。\n布拉姆（嗤笑）：埋在土中会留下痕迹，毁尸灭迹不是更安全？（Burying leaves traces. Destroying the body is safer, isn't it?）\n娜塔莉亚（后退）：不，我不敢——（No, I can't—）\n▲布拉姆枪口抵在了娜塔莉亚的额头上，娜塔莉亚紧张地举起双手，一步一步走了进去。\n布拉姆（看女佣）：你看见了什么？（What did you see?）\n▲女佣颤抖地站在旁边。\n女佣（恭敬）：我什么都没有看到，夫人是在晚上失踪了的。（I didn't see anything. Mrs. Blackwood disappeared last night.)\n▲布拉姆看向了屋内，娜塔莉亚正在检查塞莱特斯的尸体。\n布拉姆：死了吗？（Is she dead?）\n▲娜塔莉亚摸着她的脉搏点了点头。\n布拉姆（吩咐）：那真是很可惜（冷冽）将血迹清理干净，把尸体装起来。（What a shame. Clean up the blood and bag the body.）\n▲布拉姆站在门口点了根雪茄，烟雾缭绕中看着娜塔莉亚擦拭血迹。\n▲娜塔莉亚跪在地上擦拭着，在擦到塞莱特斯身后的时候，借着塞莱特斯的掩盖悄无声息将一直录音笔藏在了自己的口袋里。\n34-2\n夜   外   海边\n人物 布拉姆  娜塔莉亚 塞莱特斯  神秘人\n▲娜塔莉亚满头大汗，费劲地将一个巨大的袋子推入了海中，布拉姆拿着相机拍下了娜塔莉亚抛尸的画面。\n布拉姆（嗤笑）OS：就算塞莱特斯是假死，现在也死透了！（Even if Celeste was faking, she's dead for real now!）\n▲娜塔莉亚走了回去，举起手。\n娜塔莉亚：教父，都按照您的吩咐做好了。（Godfather, it's done just as you ordered.）\n▲布拉姆伸手搂着娜塔莉亚的肩膀。\n布拉姆（笑）：做得好，娜塔莉亚，现在我们是一条绳子上的蚂蚱了！（伸手牵着娜塔莉亚）走吧，我未来的妻子。（Good job, Natalia. Now we're in this together. Come on, my future wife.）\n▲娜塔莉亚回头看了一眼海面，跟着布拉姆上车了。\n▲布拉姆的车刚刚离开，一个神秘人穿着潜水服，一个猛子潜入水底。\n\n\n第三十五集\n35-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆和娜塔莉亚刚刚走入客厅，便看见莱恩和伊丽莎白还有持枪安保站在屋内。\n布拉姆（惊讶）：爸妈，你们怎么来了？（看向安保）这是什么意思？（Mom, Dad, what are you doing here? What's the meaning of this?）\n▲莱恩冷着脸站了起来。\n莱恩：我们接到消息，说塞莱特斯不见了。（We got word that Celeste is missing.）\n▲娜塔莉亚惊愕地抬头，看向了莱恩和伊丽莎白，下意识地躲在了布拉姆的身后。\n布拉姆（故作惊讶）：这怎么可能……（How is that possible...）\n莱恩（呵斥）：布拉姆！就算你现在权势滔天，如果你真的伤害了我的女儿，我也会拼尽全力，咬下你一块肉来！（Bram! Even if you're powerful now, if you hurt my daughter, I'll fight with everything I have and take a piece of you with me!）\n▲伊丽莎白猛地站了起来，情绪激动。\n伊丽莎白（哽咽）：塞莱特斯在哪儿！把她还给我！（试探）你是不是把她关在了地下室？（Where's Celeste? Give her back to me! Did you lock her in the basement?）\n▲面对伊丽莎白的指责，布拉姆眼神冷了下去，看向了娜塔莉亚。\n布拉姆OS：娜塔莉亚，我本来想让你多活几天，看来你的死期到了！（Natalia, I wanted to let you live a few more days. Looks like your time is up.）\n▲布拉姆无声看向了角落的女佣，佣跑了出来，她抬手指着娜塔莉亚。\n女佣（情绪激动）：伯爵，夫人！是娜塔莉亚杀了夫人！并将夫人的尸体抛入了海中！（Count, Countess! Natalia killed your daughter! She threw the body into the sea!）\n▲所有人的目光瞬间聚集在了娜塔莉亚的身上，娜塔莉亚下意识后退。\n娜塔莉亚（惊慌）：不，不是我——（No, it wasn't me—）\n▲女佣举起了几张照片，照片1：娜塔莉亚蹲在屋内收拾塞莱特斯的尸体。照片2：娜塔莉亚将尸体挪出别墅，还有几张资料。\n女佣（大声）：娜塔莉亚是玛莉夫人的妹妹，她怀疑是夫人杀了玛莉夫人，所以杀了夫人！（Natalia is Mary's sister. She thought Celeste killed Mary, so Natalia killed Mrs. Blackwood!）\n▲众人看到这些照片惊呆了。\n娜塔莉亚（惊恐）：不，我没有，我没有杀夫人！（No, I didn't! I didn't kill her!）\n▲女佣突然指着娜塔莉亚的裤腿。\n女佣（大喊）：看啊，娜塔莉亚的裤子上还有血迹！（Look! There's blood on Natalia's pants!）\n▲娜塔莉亚低头看着自己裤腿上的血，又迅速看向了布拉姆。\n娜塔莉亚（不敢相信）：你骗我？你想让我帮你顶罪！（You lied to me? You want me to take the fall!）\n▲布拉姆一脸痛心，把枪指着娜塔莉亚的脑袋。\n布拉姆（愤怒）：你怎么能杀了我的妻子！我现在就杀了你——（How could you kill my wife? I'll kill you right now—）\n▲布拉姆盯着娜塔莉亚，故作悲痛。\n布拉姆（得意）OS：猎物，只配被我玩弄于股掌中！（Prey only deserves to be played in my hands!）\n塞莱特斯（呵斥）vo：住手！（Stop!）\n▲众人迅速转头看向了门口，只见塞莱特斯和焦恩带着持枪的警察闯了进来。\n伊丽莎白（惊愕）：上帝啊，我的宝贝，你还活着！（My God, my baby, you're alive!）\n▲众人震惊！\n\n\n第三十六集\n36-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲伊丽莎白冲了过去，一把抱住了塞莱特斯。\n伊丽莎白（心疼）：塞莱特斯——你还好吗？他们说你死了？（Celeste—are you okay? They said you were dead?）\n塞莱特斯（看向布拉姆）：爸爸妈妈，布拉姆想杀了我，是娜塔莉亚和她的养父救了我！（Mom, Dad, Bram tried to kill me. Natalia and her adoptive father saved me!）\n▲众人震惊，布拉姆不敢相信地看着眼前的场景。\n布拉姆：养父？（Adoptive father?）\n▲他的目光落在了焦恩的身上。\n布拉姆：是你？（It's you?）\n【闪回19-1】\n男客人（歉意）：教父，不好意思，我差点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n【闪回结束】\n▲布拉姆浑身发抖。\n布拉姆OS：糟了，他们联手耍我，我中了他们的圈套！（Damn. They played me together. I fell into their trap!）\n▲塞莱特斯盯着布拉姆，大声对他们说。\n塞莱特斯（愤恨）：布拉姆囚禁我，威胁我，还想杀了我！（指着他）他还杀了他的前妻玛莉！（Bram imprisoned me, threatened me, and tried to kill me! He also killed his ex-wife Mary!）\n▲娜塔莉亚看向了塞莱特斯，有些惊愕。\n娜塔莉亚OS：姐姐死了？（My sister is dead?）\n▲众人震惊。\n莱恩（呵斥）：布拉姆——给我一个合理的解释！（Bram—give me a good explanation!）\n▲布拉姆慌了神，连忙指着焦恩和娜塔莉亚。\n布拉姆：不，不是我，塞莱特斯受到了刺激，她有被迫害妄想症！（No, it wasn't me. Celeste is traumatized. She has paranoia!）\n塞莱特斯（愤恨）：我没有病！（I'm not sick!）\n▲娜塔莉亚拦住了塞莱特斯的争辩。\n娜塔莉亚（冷笑）：布拉姆，难道连受害者的话，都是谎话吗？（Bram, are you saying even the victim's words are lies?）\n布拉姆（冷笑）：你们说凶手是我，证据呢？尸体呢？证人呢？是你们诬告我！（You say I'm the killer—where's the evidence? Where's the body? Where's the witness? You're framing me!）\n▲莱恩和伊丽莎白对视了一眼，伊丽莎白看向了塞莱特斯。\n伊丽莎白：塞莱特斯，你有证据吗？（Celeste, do you have evidence?）\n▲塞莱特斯和娜塔莉亚对视了一眼，娜塔莉亚拿出了一支录音笔。\n娜塔莉亚：我们当然有！（Of course we do!）\n▲众人震惊。\n▲娜塔莉亚打开录音笔，录音笔中，传出了尖锐的争吵声。\n【音频33-1】\n布拉姆vo：你不是好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're curious what's in the basement? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n▲众人听着音频，十分惊讶。\n\n\n第三十七集\n37-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） \n▲布拉姆表情惊愕，音频还在继续播放着。\n塞莱特斯vo：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n布拉姆vo：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲众人看向了布拉姆，莱恩冷冽发问。\n莱恩（呵斥）：布拉姆！你怎么解释！（Bram! How do you explain this?）\n布拉姆（后退半步）：这是伪造的！（看向莱恩）爸爸，请您相信我。（指着娜塔莉亚和焦恩）他们一定是为了诬陷我，用药物控制了塞莱特斯，我要求对塞莱特斯进行药检！（It's forged! Dad, please believe me. They must have drugged Celeste to frame me. I demand a drug test on Celeste!）\n▲这时，戴安娜突然抱着小熊，在楼梯间大哭了起来。\n戴安娜（惊呼）：地下室有怪物要吃掉我——我好害怕！（There's a monster in the basement that wants to eat me—I'm scared!）\n▲众人惊讶，布拉姆情绪激动。\n布拉姆（呵斥）：戴安娜！闭嘴！别瞎说！（Diana! Shut up! Don't talk nonsense!）\n▲娜塔莉亚盯着戴安娜。\n娜塔莉亚（看向了警察）：地下室，我姐姐被囚禁在了地下室！（The basement, my sister is locked in the basement!）\n37-2\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） 玛莉\n▲地下室被暴力打开，众人站在地下室门口，被眼前的景象吓到了，里面挂满了玛莉受伤害的照片，刑具，还有三副冰棺，墙上有块黑板，黑板上挂着玛莉、塞莱特斯、娜塔莉亚的照片。\n▲玛莉的编号是一，塞莱特斯编号二，娜塔莉亚编号三。\n伊丽莎白（捂着嘴惊呼）：老天，这简直是个地狱！（My God, this is a hellhole!）\n▲角落里面，有个女人，双脚被铁链锁着，浑身是伤，瘦骨嶙峋。\n娜塔莉亚（惊愕）：姐姐——（Mary—）\n\n\n第三十八集\n38-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲娜塔莉亚冲了过去，颤抖着手拨开了玛莉的头发，娜塔莉亚落泪。\n娜塔莉亚：姐姐，我是娜塔莉亚，你还认得我吗？（Mary, it's me, Natalia. Do you recognize me?）\n▲玛莉艰难地抬头，奄奄一息说不出话。\n娜塔莉亚：医生！快叫医生——（Doctor! Call a doctor—）\n▲焦恩连忙上去，给玛莉做检查。\n焦恩：我现在就带她去医院，别担心，她会脱离危险的。（I'll take her to the hospital now. Don't worry. She'll be okay.）\n▲焦恩将玛莉抱了起来，准备离开，布拉姆被警察控制着对着焦恩呵斥。\n布拉姆（愤怒）：放开她！别将她从我身边带走！把她还给我！（Let her go! Don't take her from me! Give her back to me!）\n▲娜塔莉亚转头看向了被两个警察控制住的布拉姆，抬起手一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：我姐姐陪你吃了十年的苦！还跟你有了孩子，你为什么要囚禁她？！（My sister suffered with you for ten years! She had your child! Why did you imprison her?!）\n▲事情败露，布拉姆也不装了。\n布拉姆（冷笑）：谁让她不答应给我做情妇？（Well... that's what happens when she refuses to be my mistress.）\n▲众人震惊。\n布拉姆：我要成为贵族，我需要塞莱特斯的帮助！玛莉却非要离开我！（I wanted to become a noble. I needed Celeste's help! But Mary insisted on leaving me!）\n▲布拉姆看着焦恩的背影。\n布拉姆（疯狂）：可我爱她，我不能让她离开我，不能让别的男人染指他！我要她永远留在我身边！（But I love her. I can't let her leave me. I can't let another man touch her! I want her by my side forever!）\n▲娜塔莉亚又一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：你简直就是个恶魔！（You're a monster!）\n布拉姆（不甘心）：恶魔？对，我就是恶魔！（看塞莱特斯）塞莱特斯，我也爱你啊，我也想把你永远留在我身边！（Monster? Yes, I'm a monster! Celeste, I love you too. I wanted to keep you by my side forever!）\n▲伊丽莎白连忙挡在塞莱特斯的面前，看向了娜塔莉亚。\n伊丽莎白（感激）：娜塔莉亚，幸亏你聪明，不然我女儿就要惨遭毒手了！（Natalia, thank God you're smart. Otherwise my daughter would've been killed!）\n布拉姆（疯狂）：什么聪明？不过是运气好罢了，两个蠢货被我挑拨得大打出手！（看向了焦恩）要不是这个老东西插手，他们都要死！（Smart? Just luck. Two fools I played against each other! If this old bastard hadn't interfered, they'd all be dead!）\n娜塔莉亚（冷笑）：是吗？到现在，你还认为你才是猎人吗？（Really? Even now, you still think you're the hunter?）\n布拉姆（惊愕）：你什么意思？（What do you mean?）\n娜塔莉亚：从宴会开始，一切就都在我们的计划之中了！（Everything has been our plan since the banquet started!）\n【闪回20-1】\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的男性客人（焦恩），路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n镜头特写：在焦恩撞过来的时候，娜塔莉亚将纸条塞入了焦恩的手中。\n纸条内容（娜塔莉娅vo）：爸爸，救我们出去。（Dad, get us out.）\n【闪回结束】\n布拉姆（不敢相信）：你说什么？（What did you say?）\n▲娜塔莉亚盯着布拉姆。\n娜塔莉亚：我很清楚，你从一开始就知道我是玛莉的妹妹，是你引我入局的。（I know perfectly well you knew I was Mary's sister from the start. You lured me into this.）\n▲布拉姆震惊。\n\n\n第三十九集\n39-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆惊愕地看着娜塔莉亚，娜塔莉亚一步一步走向了布拉姆。\n娜塔莉亚（冷笑）：姐姐的照片和书信，是你寄到我曾经的家里的，戴安娜床底下的日记本也是你放的，对不对。（You mailed my sister's photos and letters to my old home. You also put the diary under Diana's bed, didn't you?）\n▲布拉姆惊呆了。\n布拉姆（不可思议）：你是怎么知道的？（How did you know?）\n娜塔莉亚（冷笑）：因为庄园守卫森严，如果不是你默许的，姐姐的遗书和照片，不可能邮寄到我手中。（Because this estate is heavily guarded. Unless you allowed it, my sister's letter and those photos could never reach me.）\n布拉姆（惊讶）：什么遗书？我做得天衣无缝，你怎么可能发现？（What letter? I was flawless. How could you find out?）\n娜塔莉亚（嗤笑）：你有一句话说得很好，“真正的猎人，往往会以猎物的方式出现”。（You said one thing right: \"The real hunter often appears as the prey.\"）\n布拉姆（不可置信）：你听到了？（You heard that?）\n▲娜塔莉亚挑眉。\n【闪回衔接5-1】\n▲娜塔莉亚牵着戴安娜往房间走，突然，塞莱特斯的房间里面传来了用力的砸门声，娜塔莉亚上前摁住了把手。\n娜塔莉亚（惊愕）OS：塞莱特斯在里面？（回头看书房）她不是在书房和布拉姆吵架吗？（Celeste is in there? Wasn't she arguing with Bram in the study?）\n【闪回结束】\n▲娜塔莉亚看向了布拉姆。\n娜塔莉亚：捕猎游戏中，算错了一步，都会万劫不复——（In a hunting game, one wrong step and you're finished—）\n布拉姆（不敢相信）：不不不，你们不都怀疑对方吗？好几次你们都出卖了对方，还大打出手了！（No, no, no. Weren't you suspicious of each other? You sold each other out several times and even fought!）\n娜塔莉亚：如果我们不假装自相残杀，你怎么对我们放松警惕，怎么会一步一步暴露你的真面目？（If we hadn't pretended to tear each other apart, how would you have let your guard down? How would you have revealed your true face step by step?）\n塞莱特斯：其实宴会上，我爸爸妈妈也早就看出了端倪，只是时机还不到。（Actually, my parents saw something at the banquet too. The time just wasn't right.）\n▲布拉姆惊愕地看着塞莱特斯和莱恩，不敢置信地开口。\n布拉姆：什么意思？（What do you mean?）\n▲莱恩冷眼盯着布拉姆。\n莱恩（冷笑）：因为真正的贵族不会在公共场合大吵大叫，即便我的女儿精神失常了，骨子里的涵养也不会丢失！只有你这种人，才不懂这种规矩！（Because real nobles don't scream in public. Even if my daughter lost her mind, her breeding wouldn't disappear! Only someone like you doesn't understand that rule!）\n▲娜塔莉亚笑着看着布拉姆。\n娜塔莉亚：我提议将塞莱特斯的尸体埋在地下时，你也担心我要算计你，所以故意说抛入海中？可恰巧，我猜到了你不会按照我说的做！（When I suggested burying Celeste's body, you were afraid I was setting you up, so you said throw it into the sea. But I guessed you wouldn't do what I said!）\n▲布拉姆彻底崩溃了。\n布拉姆（惊愕）：你们耍我？你们联手耍我！（You played me? You played me together!）\n莱恩（呵斥）：把他带走！我要他为他的算计付出代价！（Take him away! I want him to pay for his schemes!）\n▲布拉姆被带走，和娜塔莉亚擦肩而过的时候，他突然笑了，他盯着娜塔莉亚。\n布拉姆（低声）：娜塔莉亚，你收到的遗书不是我写的，你再好好想想，谁才是真正的猎人。（嘲笑）你眼中的小可怜，身上流的可是恶魔的血！（Natalia, I didn't write the note you received. Think again—who's the real hunter? The poor little thing you pity has the blood of a monster!）\n▲娜塔莉亚惊愕地回头看向了布拉姆，布拉姆对着娜塔莉亚诡异一笑，跟着警察离开了。\n塞莱特斯（安抚）：娜塔莉亚，布拉姆最擅长玩弄人心，你别被他的话蛊惑了——（Natalia, Bram is a master at playing with people's minds. Don't let him mess with your head—）\n▲娜塔莉亚盯着布拉姆的背影久久回不过来神。\n\n\n第四十集\n40-1\n日  内  戴安娜的房间\n人物 娜塔莉亚  戴安娜  玛莉\n▲娜塔莉亚在帮戴安娜整理书籍和绘本。\n娜塔莉亚vo：布拉姆在伯爵的介入下，被判处了死刑，戴安娜和姐姐继承了他所有的家产，我终于和姐姐终于重逢了。（With the Count's involvement, Bram was sentenced to death. Diana and my sister inherited everything he owned. I was finally reunited with my sister.）\n▲娜塔莉亚整理书柜，突然一个盒子掉了下来，里面的东西撒了出来，里面是一张娜塔莉亚的照片。\n娜塔莉亚（惊讶）：这里怎么会有我的照片。（How did my photo get here?）\n▲娜塔莉亚捡起照片，突然发现照片下面有一行小字，镜头特写：找到你了。（儿童字体：found you)\n镜头特写：找到你了。\n戴安娜vo：找到你了。(found you)\n▲娜塔莉亚握紧照片，看着字迹。\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——(儿童字体：Help me )\n镜头特写：救我——(儿童字体：Help me )\n【闪回结束】\n▲娜塔莉亚死死盯着这行字。\n娜塔莉亚（惊愕）OS：这字迹，和我收到姐姐的遗书上的字迹一模一样！（This handwriting is exactly the same as the note I got from my sister!）\n▲戴安娜的声音突然响起。\n戴安娜：小姨，你在看什么？（Auntie, what are you looking at?）\n▲娜塔莉亚回头，只见戴安娜站在门口抱着兔子看着娜塔莉亚，表情冷漠，娜塔莉亚连忙将照片藏起来，笑着摸了摸戴安娜的头发。\n娜塔莉亚：没什么。（Nothing.）\n▲这时，楼下响起了车子鸣笛声。\n娜塔莉亚（高兴）：听，是你妈妈出院回来了，我们快去迎接她吧！（Listen, your mom's back from the hospital. Let's go welcome her!）\n▲戴安娜瞬间恢复了孩童的笑容，牵着娜塔莉亚的手，乖巧地点了点头，她又回头看着那个盒子，勾唇一笑。\n40-2\n日  内  庄园客厅\n人物  塞莱特斯   娜塔莉亚   戴安娜   佛西   焦恩  玛莉\n▲娜塔莉亚牵着戴安娜的手路过壁炉时，偷偷将写着字的照片丢入了壁炉中烧掉了。\n▲这时，焦恩推着轮椅进来，玛莉坐在轮椅上，气色还不错。\n玛莉（虚弱）：戴安娜，娜塔莉亚。（Diana, Natalia.）\n▲戴安娜欢呼雀跃的跑过去，紧紧抱住了玛莉的手臂。\n戴安娜：妈妈！我好想你。（哽咽）我以为再也见不到您了。（Mommy! I missed you so much. I thought I'd never see you again.）\n▲玛莉轻轻抚摸着戴安娜的头发，又看向了娜塔莉亚。\n玛莉（招手）：来，让我看看。（Come here. Let me see you.）\n▲娜塔莉亚眼泪瞬间滚落，她一步一步走向了玛莉，半蹲在了玛莉的面前。\n娜塔莉亚（哽咽）：姐姐……（Mary...）\n▲玛莉伸手抚摸着她的头发。\n玛莉（温和）：傻瓜，为什么要冒险救我，如果你遇到了危险，我永远无法原谅自己。（Silly girl. Why risk your life to save me? If something happened to you, I'd never forgive myself.）\n▲娜塔莉亚趴在了玛莉的腿上，一下子哭了起来。\n娜塔莉亚：我好想你，我什么都不在乎，我只想找到你，你答应过等我的。（I missed you so much. I didn't care about anything else. I just wanted to find you. You promised you'd wait for me.）\n▲玛莉温和地抚摸着娜塔莉亚的头发。\n玛莉（安抚）：还是和小时候一样爱哭鼻子。（Still such a crybaby, just like when you were little.）\n▲焦恩拍了怕娜塔莉亚的肩膀。\n焦恩：别哭了，你妈妈一会儿就到，看见你哭鼻子又要心疼了。（Stop crying. Your mom will be here soon. She'll be heartbroken to see you crying.）\n戴安娜（乖巧）：对啊，小姨，我们一家团聚了，应该庆祝——（Right, Auntie. We're all together now. We should celebrate—）\n▲这时，塞莱特斯捧着鲜花了，带着一个男人【塞莱特斯的男友 佛西】进来。\n塞莱特斯（开朗）：嗨~娜塔莉亚，听说玛莉姐姐出院了，我们来看看她，给你们介绍一下，这是我的新男友，佛西。（Hi, Natalia. I heard Mary's out of the hospital, so we came to see her. Everyone, this is my new boyfriend, Fossey.）\n▲娜塔莉亚擦了眼泪站起来，抬头看向佛西时，瞳孔微缩。\n娜塔莉亚（惊愕）OS：是他！（It's him!）\n▲佛西对着娜塔莉亚挥了挥手。\n佛西（笑容诡异）：好久不见，娜塔莉亚。（Long time no see, Natalia.）\n"
}
```

---
## 第 13 轮（耗时：8572 ms (8.57 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.update, user.ask`

### [第 13 轮] 模型原始输出
```text
状态检查：
- 当前正在执行「精读1-3正文并追加幼年出处」这一步：上一轮已读取1-3正文（9段，确认小娜塔莉亚8岁段落存在），但尚未调用 asset.update 落地。
- 本轮工具返回1-3完整正文：段落1、3、6、7、8 涉及小娜塔莉亚（8岁幼年形态）。其中段落7说话人为“娜塔莉亚（悲痛）vo”，属于娜塔莉亚本人（成年旁白回忆），可归入；段落1、3、6、8为纯动作/视觉描写，可归入。段落2、4说话人为养父、小玛莉，不可归入。
- 关键事实：幼年形态别名“小娜塔莉亚（8岁）”；姐姐小玛莉13岁，为让娜塔莉亚被收养将她推给养父母；娜塔莉亚成年后旁白揭示父母早逝、姐姐捡废品养大她。
- 当前计划更新：[x] 精读1-3并判定幼年形态 → 现在需立即调用 asset.update 追加1-3幼年出处；后续仍待推进 1-4、1-5家、1-5庄园、全局核验。
- 下一步：调用已装载的 asset.update，追加1-3幼年形态出处与补充设定。

思考：
依据本轮1-3正文，幼年段落应归入娜塔莉亚资产，且版本为“幼年8岁形态”。为落实“随读随写”闭环，需调用 asset.update(id: char_1794137305183_eqhut_0, mode: "append")，追加 provenances（1-3场次标题 + 段落1、3、6、7、8），并在 description 或 versions 中补充幼年设定（8岁，被姐姐推给养父母收养，姐姐承诺重逢）。描述字段用顶层传入，provenances 传段落数组，避免深层嵌套。

工具调用：
{{调用 asset.update, {"id": "char_1794137305183_eqhut_0", "type": "characters", "mode": "append", "description": "首次出场于第一集1-2医院办公室。22岁心理医生，字幕标注【心理医生娜塔莉亚 22岁】。玛莉的妹妹，收到姐姐玛莉血书得知其死于布莱克伍德家，需带姐姐的女儿（外甥女）离开牢笼。外貌见1-5布莱克伍德庄园：职业装、黑框眼镜。幼年形态：8岁“小娜塔莉亚”，父母早逝，由姐姐小玛莉（13岁）捡废品养大；8岁那年姐姐把被收养的机会让给她（1-3贫民窟门口），临别承诺总有一天会重逢。", "provenances": [{"sceneTitle": "1-3 日 外 贫民窟门口", "paragraphIndices": [1, 3, 6, 7, 8], "evidenceText": "小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手……八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……"}]}}}
用户沟通：
{
- 对用户说的话（完整版）：“我已把第一集1-3贫民窟门口的幼年回忆段落补充到娜塔莉亚资产里了，包括小娜塔莉亚8岁被姐姐推给养父母收养的描写和她的旁白。接下来我继续精读1-4医院办公室正文，补充后续出处。稍等。”
- 对用户说的话（简版）：“已补上1-3幼年出处，接着读1-4补充～”
}
```

### [第 13 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "char_1794137305183_eqhut_0",
  "type": "characters",
  "mode": "append",
  "description": "首次出场于第一集1-2医院办公室。22岁心理医生，字幕标注【心理医生娜塔莉亚 22岁】。玛莉的妹妹，收到姐姐玛莉血书得知其死于布莱克伍德家，需带姐姐的女儿（外甥女）离开牢笼。外貌见1-5布莱克伍德庄园：职业装、黑框眼镜。幼年形态：8岁“小娜塔莉亚”，父母早逝，由姐姐小玛莉（13岁）捡废品养大；8岁那年姐姐把被收养的机会让给她（1-3贫民窟门口），临别承诺总有一天会重逢。",
  "provenances": [
    {
      "sceneTitle": "1-3 日 外 贫民窟门口",
      "paragraphIndices": [
        1,
        3,
        6,
        7,
        8
      ],
      "evidenceText": "小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手……八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……"
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "characters",
  "id": "char_1794137305183_eqhut_0",
  "item": {
    "id": "char_1794137305183_eqhut_0",
    "name": "娜塔莉亚",
    "role": "女主角/心理医生",
    "description": "首次出场于第一集1-2医院办公室。22岁心理医生，字幕标注【心理医生娜塔莉亚 22岁】。玛莉的妹妹，收到姐姐玛莉血书得知其死于布莱克伍德家，需带姐姐的女儿（外甥女）离开牢笼。外貌见1-5布莱克伍德庄园：职业装、黑框眼镜。幼年形态：8岁“小娜塔莉亚”，父母早逝，由姐姐小玛莉（13岁）捡废品养大；8岁那年姐姐把被收养的机会让给她（1-3贫民窟门口），临别承诺总有一天会重逢。",
    "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
    "verifiedProvenance": [
      {
        "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
        "id": "vp_char_1794137305183_eqhut_0_para_5_547",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_731",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_853",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1022",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1077",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "evidenceText": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "anchorText": "莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1077,
        "lineNumber": 25
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_8_1348",
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
      "第一集 1-2 日  内   医院办公室",
      "第一集 1-3 贫民窟门口   日   外"
    ],
    "mode": "append"
  },
  "message": "成功更新资产 [娜塔莉亚]。"
}
```

---
## 第 14 轮（耗时：6009 ms (6.01 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.update, user.ask`

### [第 14 轮] 模型原始输出
```text
状态检查：
- 当前正在执行计划第7步：精读1-4医院办公室正文，补充角色属性与出处（对应小目标：精读1-4并追加出处）。
- 上一轮 asset.update 已成功追加1-3幼年出处，资产现状确认为 name=娜塔莉亚、role=女主角/心理医生，provenanceStatus=verified，sourceScenes含1-2与1-3。
- 后续待推进步骤：1-4精读（当前步）→ 1-5娜塔莉亚家 → 1-5布莱克伍德庄园 → 全局核验。
- 关键线索：1-4有6条命中，需读取正文后区分说话人归属（只归娜塔莉亚本人台词与针对她的纯动作/视觉描写段落）。
- 下一步行动：调用 script.read 读取1-4医院办公室正文。

思考：
先读取1-4正文获取原文，核对娜塔莉亚本人台词与动作描写段落，再据实追加出处与设定，保持“读一场、写一场”的增量闭环。

工具调用：
{{调用 script.read, {"episode":"第一集","scene":"1-4"}}}

用户沟通：
{
- 对用户说的话（完整版）：“正在读取第一集1-4医院办公室的正文，核对娜塔莉亚的台词与动作描写段落，随后会把该场出处追加进她的资产。”
- 对用户说的话（简版）：“正在读1-4医院办公室，马上补充她的出处~”
}
```

### [第 14 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": "第一集",
  "scene": "1-4"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 1653,
  "offset": 1,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 1,
  "paragraphCount": 7,
  "hasVolumeWarning": false,
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 1,
      "paragraphCount": 7,
      "scenes": [
        {
          "index": 1,
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
          "paragraphs": [
            {
              "index": 1,
              "text": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。"
            },
            {
              "index": 2,
              "text": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）"
            },
            {
              "index": 3,
              "text": "▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。"
            },
            {
              "index": 4,
              "text": "▲镜头特写：救我——（Help me)"
            },
            {
              "index": 5,
              "text": "玛莉（旁白）：救我——（Help me)"
            },
            {
              "index": 6,
              "text": "▲娜塔莉亚死死盯着那段小字。"
            },
            {
              "index": 7,
              "text": "娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)"
            }
          ]
        }
      ]
    }
  ],
  "content": "第一集\n1-1\n夜  内   地下室\n人物  玛莉\n▲空荡的地下室里，玛莉双手被铁链绑着，跪在地上，她头发散乱瘦骨嶙峋，脸上带着血迹，一只手从黑暗中伸出来，捏住了玛莉的下巴，逼迫她抬头，玛莉恐惧地看向了镜头。\n玛莉（哀求）：救救我…… （Please... somebody help me...）\n\n1-2\n日  内   医院办公室\n人物  娜塔莉亚 \n（to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n1-3 贫民窟门口   日   外 \n人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n1-4\n日  内   医院办公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（Help me)\n玛莉（旁白）：救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n1-5\n日  内  娜塔莉亚家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）\n1-5\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)\n▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。\n管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)\n▲众人唏嘘。\n管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)\n▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。\n管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)\n▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。\n管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)\n应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)\n应聘者2：我也放弃 (Me too, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】\n塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）\n\n第二集\n2-1日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲娜塔莉亚打量着塞莱特斯。\n娜塔莉亚OS：她就是布拉姆的现任妻子塞莱特斯，王室的后裔，母亲是财阀之女，传闻是一位骄矜傲慢的贵族千金。（So this is Bram’s current wife, Celeste. Royal bloodline, heiress to a mega-corporation... as spoiled and arrogant as the rumors say.）\n▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。\n布拉姆：够了，塞莱特斯，别无理取闹了！（Enough, Celeste! Stop making a scene!）\n塞莱特斯（冷冽）：布拉姆，你许诺过只爱我一个人，（指着娜塔莉亚）为什么要让这个女人踏入家门？（Bram, you promised I'd be the only woman in your life! So why are you bringing her into our home?!）\n布拉姆（无奈）：她只是女儿的心理医生，难道，连给孩子看病的人，你都无法容忍吗？（She’s just our daughter’s therapist! Can’t you even allow someone to help our sick child?）\n▲塞莱特斯鄙夷地瞥了一眼娜塔莉亚。\n塞莱特斯（冷冽）：我绝不允许她踏进这个家！（I will NEVER let her step foot in this house!）\n▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。\n布拉姆：当初你明知道我有妻子，依旧主动靠近我，如今却要剥夺我女儿治病的权利，你未免太冷酷了！（When we met, you knew I was already married, yet you still threw yourself at me. And now you're keeping my daughter from getting the help she needs? Don't you think you're being a little too heartless?!）\n▲塞莱特斯愣住了，娜塔莉亚抬头打量着二人。\n娜塔莉亚OS：是塞莱特斯主动向布拉姆示好？（打量塞莱特斯）莫非是她？(Celeste was the one who went after Bram? Was it her?)\n▲娜塔莉亚握紧了拳头。\n娜塔莉亚（恨）OS：如果她是真凶，我会亲手撕碎她的一切，逼迫她说出姐姐的下落！(If she's the monster behind this... I will tear her life to pieces and force her to tell me where my sister is!)\n▲娜塔莉亚上前一步，递出自己的简历。\n娜塔莉亚（恭敬）：夫人，我是持证的儿童心理医生，这是我的简历，请您予以信任……(Ma'am, I am a certified pediatric therapist. Here is my resume. Please, allow me to prove my worth...)\n▲娜塔莉亚的话还没说完，塞莱特斯一把将简历摔在了娜塔莉亚脸上，纸张漫天飞舞。\n塞莱特斯（命令）：别以为我看不出来你的心思！立刻给我滚出去！【4】(I know exactly what you're up to. Now get out!)\n▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。\n布拉姆：塞莱特斯！克制你的行为！（看娜塔莉亚）你离开吧，我会支付一笔钱作为补偿。(Celeste, that's enough! You can go. I'll pay you for your trouble.)\n▲娜塔莉亚惊愕地抬头，塞莱特斯。\n娜塔莉亚OS：不，我绝不能就这样离开！(No... I can't walk away now!)\n▲就在这时，一个孩子光脚跑了出来，她拿着一个花瓶砸坏了门口的装饰，踩坏了花圃。\n女佣（追逐）：小姐！快回来，该吃药了！(Miss Diana! Please stop, it's time for your medicine!)\n▲娜塔莉亚看向了孩子。\n娜塔莉亚（惊愕）OS：那就是姐姐的女儿？(Is that... Mary's daughter?)\n▲戴安娜突然飞快跑向了关着饿狼的笼子。【5】\n布拉姆（呵斥）：戴安娜！停下！(Diana! Stop right there!)\n▲娜塔莉亚飞快冲了过去，一把抱住了戴安娜。\n娜塔莉亚：别靠近！那里很危险！(Get back! It's dangerous!)\n戴安娜（挣扎）：放开我！ (Let go of me! Get off!)\n▲戴安娜发病举起花瓶砸向了娜塔莉亚的脑袋。【6】\n女佣（惊呼）：小心！(Watch out!)\n▲娜塔莉亚一把握住了戴安娜的手，另一只手轻轻拍她的背安抚。\n娜塔莉娅：放下吧。（let it go,一语双关，辛苦本土化老师确认是否可以这样翻译 (可以的，这样说挺地道的）（见黛安娜放下花瓶，松了口气）你做的很好。(Just let it go... You did so good.)\n娜塔莉娅：（看着管家，低声说）快把帘子盖上。（Cover the cage. Now.）\n▲管家立刻盖上帘子遮住野狼。\n娜塔莉娅：都退开些，别刺激她！（Everyone step back. Don't crowd her!）\n▲布拉姆一抬手，众人立刻退开。\n▲娜塔莉亚解开脖子上的丝巾铺在地上，让黛安娜的双脚踩上去。\n娜塔莉娅：你这样太过危险，要不要玩一些更有意思的游戏？比如，吹蜡烛，像我这样……（Walking bare-foot is way too dangerous, sweetie. How about we play a fun game instead? Like... blowing out birthday candles. Look at me...）\n▲娜塔莉娅举起黛安娜的一根手指当作蜡烛，深呼吸然后吐气，黛安娜学着娜塔莉娅的样子也深呼吸起来，情绪得到了稳定。\n▲戴安娜的情绪像是得到了安抚，对着娜塔莉亚笑了起来。\n女佣（捂嘴）：哦，上帝啊，我从未见过小姐这么快平复情绪！（Oh my god... I've never seen  Miss Diana calm down so fast!）\n娜塔莉娅：小姐，别怕，你安全了。（It's ok. You're safe now.）\n黛安娜（凑到娜塔莉娅耳边）：你也安全了。（So are you.）\n▲娜塔莉娅一惊。\n\n\n第三集\n3-1\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲戴安娜拽住了娜塔莉亚的衣摆，看向了布拉姆。\n戴安娜：爸爸，我要她陪我玩儿！(Daddy, I want her to play with me!)\n▲布拉姆摸了摸戴安娜的头。\n布拉姆：如你所愿。（看娜塔莉亚）既然孩子接纳你，你可以留下。（威胁）但是……(Whatever you want. If Diana wants you here, you can stay. But...)\n▲布拉姆的目光看向了狼笼的方向，娜塔莉亚也跟着他的目光看了过去。\n娜塔莉亚（鞠躬）：我明白您的意思，我会照顾好小姐的，请您放心。(I understand, sir. I'll take good care of Miss Diana. You have my word.)\n布拉姆（满意）：带小姐去休息吧。(Take her to her room to rest.)\n▲娜塔莉亚将光脚的戴安娜抱了起来。\n娜塔莉亚：是。(Yes, sir)\n▲娜塔莉亚心中疑惑。\n娜塔莉亚（疑惑）OS：教父看起来非常疼爱戴安娜，为什么姐姐会称这里是牢笼？(The Godfather dotes on Diana so much... So why did my sister call this place a hellhole?)\n▲塞莱特斯死死握着拳头，在和娜塔莉亚擦肩而过时，压低声音警告。\n塞莱特斯（小声）：你会为你今天的决定付出代价的！(You're gonna regret this!)\n娜塔莉亚（温和）：夫人，我只是一个心理医生，听不懂你在说什么。(I'm just a therapist, ma'am. I'm afraid I don't know what you mean.)\n▲娜塔莉亚收回目光，抱着戴安娜一步一步走向了大门，大门打开，屋内富丽堂皇的装饰映入眼帘。\n娜塔莉亚OS：我的姐姐就这里，我不但要找到她的下落！还要保护戴安娜，还要让姐姐和戴安娜合法继承所有财产！【7】(My sister is here. I'll find out what happened to her, protect Diana, and make sure they both get their rightful share of the inheritance!)\n▲布拉姆轻轻抚摸了一下塞莱特斯的头发。\n布拉姆：不过是一个心理医生而已，没必要将她放在心上。(She’s just a shrink, babe. No need to waste your energy on her.)\n▲塞莱特斯下意识后退了一步，看向了娜塔莉亚的背影。\n塞莱特斯：是吗？(Is that so?)\n布拉姆（安抚）：好了，塞莱特斯，你的身体欠佳，回去休养吧。(Come on, Celeste. You're not feeling well. Go get some rest.)\n▲布拉姆也随着她的目光看向了娜塔莉亚的背影。\n布拉姆OS：又一个有趣的猎物，送上门来了！(Well, well...Another little mouse walked right into my trap.)\n▲布拉姆看了一眼管家。\n布拉姆：加强庄园守卫，没有我的命令，任何人都不许出去！【8】(Double the security. No one leaves this estate without my permission!)\n\n3-2\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  \n▲公主房内，戴安娜躺在华丽的公主床上，闭上眼睛，娜塔莉亚给她读故事。\n娜塔莉亚（温柔）：最后，公主和王子拥有了属于他们的幸福生活……(And in the end, the prince and princess lived happily ever after...)\n▲这时，花园传来微弱的呼救。\n（画外音，女声惨叫）vo：啊——救命——(Aah! Somebody help me!)\n▲娜塔莉亚惊愕看向了外面。\n娜塔莉亚OS：呼救？是姐姐吗？(A scream for help? Was that... my sister?!)\n▲娜塔莉亚连忙起身出门。\n\n3-3\n日  外  花园\n人物  娜塔莉亚  管家\n▲娜塔莉亚悄悄在花园里面走，花园里面装饰与建筑物遮挡视线，墙角站着持枪的安保，娜塔莉亚微微弯腰，躲避安保的视线。\n娜塔莉亚（自言自语）：奇怪，呼救声明明是从这里传出来的！(That’s weird. I swear that scream came from right around here!)\n▲突然一只手拍了一下娜塔莉亚的后背，娜塔莉亚惊恐回头，只见管家冷着脸站在她身后。\n管家（冷漠）：你在干什么？(What do you think you’re doing?)\n娜塔莉亚：我，我随便走走……(I—I was just taking a walk, getting some fresh air...)\n▲管家冷脸将文件夹递给娜塔莉亚。\n管家：这是庄园的规矩和教父的禁忌。(These are the house rules. Mr. Blackwood doesn't tolerate anyone breaking them.)\n▲娜塔莉亚翻看着文件。\n管家（严肃警告）：不要碰庄园里的任何东西，不要擅自离开庄园，不要在庄园游荡，不要妄想勾引教父！(Don't touch anything in the estate. Don't leave without permission. Don't wander around. And don't even think about trying to seduce the Godfather!)\n▲娜塔莉亚握着文件点了点头，管家一步步靠近她，再次警告。\n管家（警告）：最重要的一条，不要靠近地下室。(And the most important rule: stay away from the basement.)\n娜塔莉亚（惊讶）：地下室？【9】(The basement?)\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链。\n【闪回结束】\n▲娜塔莉亚看着管家离开的背影，心中疑惑。\n娜塔莉亚OS：姐姐给的照片中点出的地点会不会是地下室？(Could the basement be where my sister was pointing to in those photos?)\n▲管家的视线随意扫过了不远处的安保。\n管家（冷漠）：随意走动，会被当做入侵者被射杀。(Anyone caught wandering where they shouldn't will be treated as an intruder and shot on sight.)\n▲安保立刻举起枪，子弹上膛，娜塔莉亚浑身僵直。\n管家（命令）：现在立刻回到小姐的房间去。(Get back to Miss Diana's room. Now.)\n\n3-4\n日 内  戴安娜房间\n人物  戴安娜   娜塔莉亚  布拉姆\n▲娜塔莉亚转身进入房间，放下了文件，在华丽的公主房屋内巡视。\n娜塔莉亚（打量）OS：戴安娜的房间里，会不会有姐姐留下的遗物？（翻找柜子）如果有线索就好了！(Is there anything my sister left behind in here? Come on, just one clue... anything!)\n▲戴安娜悄无声息地睁开了一只眼睛盯着娜塔莉亚翻找东西的背影，她偷偷地将枕边的小熊推到了地上。\n▲娜塔莉亚听到声音，吓了一跳，立刻回头。\n娜塔莉亚OS：谁？(Who's there?!)\n▲戴安娜连忙闭上眼睛，娜塔莉亚瞧见玩偶掉地上了，弯腰去捡玩偶。\n娜塔莉亚OS：我必须万分谨慎，不能被布拉姆和塞莱特斯察觉！(I’ve got to be extra careful. I can't let Bram or Celeste catch on to what I’m doing.)\n▲娜塔莉亚捡玩偶时，突然看见床底下有个盒子。\n娜塔莉亚（惊讶）OS：那是什么？(What's that?)\n▲娜塔莉亚趴在地上，伸手去将盒子给拿出来，盒子上刻着名字：玛莉。(MARY)\n娜塔莉亚（惊讶）OS：这是姐姐的遗物吗？【10】(Is this... my sister's? )\n▲娜塔莉亚背对着门，蹲在地上打开盒子想查看里面的东西，盒子里面有个日记本。\n娜塔莉亚（惊讶）：这是，姐姐的日记？(No way... Is this my sister's diary?)\n▲门突然推开了，布拉姆握住一把枪，一步一步靠近娜塔莉亚，最后停在了娜塔莉亚背后。\n布拉姆（冷漠）：你在做什么？(What are you up to?)\n▲娜塔莉亚吓了一跳，猛地回头，目光正对布拉姆手中的枪口！【11】\n\n第四集   \n4-1\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  布拉姆\n▲布拉姆上前一步，枪口对准了娜塔莉亚的额头，娜塔莉亚放下盒子，举起手，镜头特写：床上的戴安娜睫毛颤了一下。\n▲娜塔莉亚盯着眼前黑漆漆的枪口，她故作柔弱的姿态，眼神惶恐地看向了布拉姆。\n娜塔莉亚（低声）：教父……我发誓，我绝对没有半点越界。(Godfather...Please... I swear I didn't do anything I wasn't supposed to.)\n▲娜塔莉亚抬起下巴，一双眼睛颤抖地盯着布拉姆，布拉姆居高临下看着她，嗤笑了一声，枪口从娜塔莉亚的额头，挪到了她的下巴。\n布拉姆（狠辣）：把东西交出来，！笼子里的狼早已饥肠辘辘，别让我抓到你半点可疑的痕迹！(Hand it over. The wolves are starving out there, don't give me a single reason to doubt you.)\n▲娜塔莉亚被迫仰起头，脖子暴露在枪口下，她伸手轻轻握住枪口，用脸颊蹭了一下枪口，又妩媚地抬头看向了布拉姆。\n娜塔莉亚（低声）：别这样，您吓到我了。(Easy... you're scaring me.)\n▲布拉姆眼神震惊，喉结滚动了一下。【12】\n布拉姆（语气放松）：才刚刚进来，就敢勾引我。（上前一步，捏住娜塔莉亚的下巴）你的胆子很大。(Just walked through that door, and already trying to play me? You've got balls.)\n▲娜塔莉亚故作惶恐。\n娜塔莉亚（可怜）：绝无此事。(I would never dare.)\n▲布拉姆打量着娜塔莉亚，用力甩开她下巴，冷声开口。\n布拉姆（冷漠）：别以为这样我就会放过你！（脚尖踢盒子）把盒子打开。(Don't think that flattery gets you off the hook. Open the box.)\n▲娜塔莉亚颤抖着手拿起盒子，打开了盒子里面有一张玛莉遍体鳞伤的照片。\n布拉姆（惊讶）：这是……(What is this...?)\n▲娜塔莉亚观察着布拉姆的表情。\n【闪回衔接3-2】\n▲门突然推开了，布拉姆举着枪进来，娜塔莉亚背对着布拉姆跪在床边上，她从窗户的玻璃上看到了布拉姆的倒影，察觉了布拉姆靠近，她立马取出日记本，丢入床底下，随后将一张玛莉的照片放入盒子里面，合上了盒子。\n【闪回结束】\n▲娜塔莉亚缓缓抬头，布拉姆正在看照片，手指死死握住了照片边缘。\n娜塔莉亚OS：我就知道布拉姆会来，这张照片是我用来测试布拉姆的筹码，我只想知道，他知不知道姐姐遭受的一切？(I knew he'd show. This photo is my litmus test for Bram. I need to know: did he have any idea what my sister went through?)\n▲布拉姆看着照片，又看娜塔莉亚。\n布拉姆（冷漠）：谁允许你触碰屋内的东西的！(Who gave you the right to touch my things?)\n娜塔莉亚（跪在地上）：教父，我只想找出诱发小姐心理创伤的根源！（试探）她会不会是因为看到这些残酷的画面才……(Godfather, I was just trying to trace the root of Miss Diana’s trauma. Could seeing something this graphic...)\n▲布拉姆审视地盯着娜塔莉亚，伸手将照片拿了起来，紧紧捏着照片。\n布拉姆：闭嘴！(Shut up!)\n▲娜塔莉亚观察着布拉姆的表情和手指，试探开口。\n娜塔莉亚：她是谁？对小姐而言，是很重要的人吗？(Who is she? Is she someone important to Miss Diana?)\n▲布拉姆将照片收了起来。\n布拉姆（冷冽）：守好你的本分，不该问的，不要追问。【13】（转身）以后看到类似的物件，第一时间交给我！(Know your place. Curiosity killed the cat. Next time you stumble on crap like this, bring it straight to me.)\n▲布拉姆转身离开了，娜塔莉亚松了口气，坐在了地上。\n娜塔莉亚（看布拉姆的背影）OS：布拉姆的反应说明他对姐姐的遭遇一清二楚，难道是他和塞莱特斯一起害了姐姐？姐姐到底在哪里？(His reaction says it all, he knows damn well what happened to my sister. Did he and Celeste do this together? Where is my sister?)\n\n\n4-2\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚坐在床上，摊开了笔记本，镜头特写：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n玛莉vo：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n娜塔莉亚（疑惑）OS：这些信息未免太直白了，像是刻意引导我发现线索，到底是谁布的局，又想引导我做什么？(Way too convenient. It's like someone's leaving these clues for me. Who's playing puppet master here, and what's their game?)\n【闪回照片】\n▲镜头特写：铁门被铁链包裹的照片。\n【闪回结束】\n娜塔莉亚：铁门是不是指向的地下室？会不会和姐姐有关！我一定要找到照片所在的位置？(Does that iron door lead to the basement? Is that where they kept my sister? I've got to find that exact spot.)\n▲这时，保姆间的门被推开了，娜塔莉亚吓了一跳，连忙将照片藏起来，猛地回头。\n\n\n第五集\n5-1\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚连忙合上笔记本，疑惑地看着戴安娜。\n娜塔莉亚：怎么了？戴安娜小姐？(Everything okay, Miss Diana?)\n▲戴安娜提着小熊站在了门口，她眼神冷冷地看着娜塔莉亚。\n戴安娜（可怜）：我睡不着，你可以陪着我吗？(I can't sleep... Will you stay with me?)\n▲娜塔莉亚立刻起身，蹲在了戴安娜面前，抚摸了一下戴安娜的头发。\n娜塔莉亚（安抚）：别怕，我陪你回房间好吗？(Hey, don't be scared. Let's get you back to bed, okay?)\n▲戴安娜点了点，娜塔莉亚牵着她的手回房间。\n\n5-2\n夜  内  书房外\n人物  娜塔莉亚   戴安娜\n▲娜塔莉亚牵着戴安娜走在走廊上，突然听到书房传来争吵，娜塔莉亚和戴安娜停下步伐，站在了门口，书房里面传来激烈的争吵声。\n布拉姆（冷冽）VO：塞莱特斯，是你把玛莉的照片放在戴安娜的房间里的？(Celeste, was that you? Did you plant Mary's photo in Diana's room?)\n塞莱特斯（愤怒）VO：你凭什么断定是我所为？(And what makes you so damn sure I did it?)\n布拉姆（呵斥）VO：难道不是你想用那些照片恐吓孩子吗？毕竟你一向都不喜欢她！(Cut the crap. Weren't you trying to terrorize the kid? You've always hated her guts!)\n▲戴安娜想要推门，娜塔莉亚捂着她的嘴巴，抱着她往房间走。\n娜塔莉亚（惊愕）OS：难道布拉姆和塞莱特斯在联手掩盖姐姐死亡的真相？(Are they actually teaming up to sweep my sister's murder under the rug?)\n\n5-3\n夜  内   书房内  \n人物   布拉姆\n▲房间里面，只有布拉姆一个人，布拉姆听见外面的脚步声离开，他打开了留声机，留声机传出塞莱特斯的声音。\n塞莱特斯（留声机）：你凭什么断定是我所为？(What makes you so sure I did it?)\n▲布拉姆关上了留声机，给自己倒了一杯红酒。\n布拉姆（摇晃酒杯）：真正的猎人往往以猎物的方式出现，就让猎物彼此撕咬吧（品酒）毕竟真正贵族从不会沾染猎物的血。(The best hunters always disguise themselves as prey. Let them tear each other to pieces. After all... real aristocrats never get their hands dirty.)\n\n5-4\n夜  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚将戴安娜放在床上，戴安娜看着她。\n戴安娜：他们吵架是因为我对不对？(They were fighting over me, weren't they?)\n▲娜塔莉亚轻轻抚摸她的头发。\n娜塔莉亚（温和）：这是成年人的纠葛，与你无关。(That's just adult nonsense. It has nothing to do with you, sweetie.)\n戴安娜（平静）：塞莱特斯并不是我的母亲，对吗？(Celeste isn't my real mom, is she?)\n▲娜塔莉亚惊讶地看着戴安娜。\n娜塔莉亚（故作不知）：您为什么会这么想？(Why would you think that?)\n戴安娜（抱着小熊）：我的母亲很温柔，塞莱特斯来了之后，我就再也没见过她了，爸爸禁止我提起她，我很思念她，她什么时候回来？(My mom was so sweet... After Celeste showed up, she just vanished. Daddy won't even let me say her name. I miss her so much. Do you know when she's coming back?)\n▲娜塔莉亚看着戴安娜。\n娜塔莉亚（怜悯）：她一定会回来的，我向你保证！【14】(She'll be back. I promise.)\n▲戴安娜乖乖盖好被子，乖巧地开口，握紧了娜塔莉亚的手。\n戴安娜：你会一直留下来陪我吗？(Will you stay with me forever?)\n娜塔莉亚（安抚）：如果你爸爸同意的话，我当然会留下来陪你。(If your dad gives the green light, I'd love to.)\n戴安娜（疑惑）：你害怕我爸爸吗？(Are you scared of my daddy?)\n娜塔莉亚（微笑）：我想庄园里的人都对教父心存敬畏。(I think everyone in this house is a bit intimidated by the Godfather.)\n戴安娜（乖巧）：塞莱特斯就不会，还总是和爸爸吵架！(Celeste isn't. She's always fighting with Daddy!)\n▲娜塔莉亚摸了摸戴安娜的头发，温和开口。\n娜塔莉亚（安抚）：吵架？((Fighting?)\n▲戴安娜抬头乖巧地看着娜塔莉亚。\n戴安娜（不解）：对呀，爸爸很喜欢别人崇拜他，塞莱特斯却从不这样，这让他很懊恼。(Yeah. Daddy loves it when people worship him, but Celeste never does. It drives him crazy.)\n▲娜塔莉亚一愣，惊讶地低头看向了戴安娜，戴安娜闭上了眼睛睡觉。\n娜塔莉亚（惊讶）OS：我明白了。布拉姆出身卑微，极度渴望被认可，而出身贵族的塞莱特斯永远给不了他这份崇拜，看来他们也没有传闻那么相爱！(I get it. Bram came from the gutter, so he's desperate for validation. But Celeste is old money, she'll never stroke his ego. They're nowhere near as tight as everyone thinks.)\n\n5-5\n夜  内  楼梯口   \n人物  安保   娜塔莉亚  管家\n▲娜塔莉亚打开门，恰好看到两个安保抬着一具盖着白布的尸体从客厅路过，娜塔莉亚惊讶地捂着了嘴巴，管家不知道什么时候出现在了娜塔莉亚的身后。\n管家：看到了吗？那就是擅闯地下室的下场。(See that? That's what happens when you sneak into the basement.)\n▲娜塔莉亚猛地看向了管家，吓了一跳，管家已经转身离开了。\n娜塔莉亚（看向主卧方向）OS：得先让猎物撕咬起来，我才有机会探查姐姐的下落。(I need them to tear each other apart first. Only then will I have a chance to find out where my sister is.)\n\n\n第六集\n6-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲布拉姆坐在餐桌旁边，一边看报纸，一边喝咖啡，娜塔莉亚穿着一件性感的连衣裙走了过去。\n▲娜塔莉亚将对戴安娜的心理报告放在了布拉姆的面前。\n娜塔莉亚（恭敬）：教父，这是昨夜我针对小姐的行为进行的心理分析，请您过目。(Godfather, here is my psychological assessment of Miss Diana based on her behavior last night. Please take a look..)\n▲布拉姆收起了报纸，看向了娜塔莉亚给的文件，又看了一眼娜塔莉亚，眼神暂停，喉结滚动了一下。\n布拉姆：根据你的分析，我女儿怎么样了？(So, according to your report, how's my daughter doing?)\n▲娜塔莉亚俯身靠近布拉姆，手背蹭着布拉姆的手臂划过，指着文件。\n娜塔莉亚：您看，小姐不敢一个人睡，是因为……(As you can see, she's terrified of sleeping alone because...)\n▲布拉姆目光从文件上娜塔莉亚的手慢慢往娜塔莉亚的身上打量，他像是看货物一样看着娜塔莉亚，布拉姆往后仰，坐在椅子上，手臂搭在椅背上，手背刚刚好在娜塔莉亚的臀部位置，目光也落在了臀部。\n布拉姆（审视）OS：真想把这件碍事的衣服……(I'd love nothing more than to rip that dress right off her...)\n▲娜塔莉亚余光瞥见了布拉姆的目光。\n娜塔莉亚（冷笑）OS：禽兽，这么容易上钩！(Pig. That was almost too easy.)\n▲这时候，娜塔莉亚的余光瞥见塞莱特斯出现在了楼梯口。\n▲娜塔莉亚趁着布拉姆发呆，翻页时候，手臂碰到了牛奶杯，瞬间将牛奶洒到了布拉姆的裤子上。\n布拉姆（回神，惊讶）：你在干什么？(What the hell are you doing?)\n▲娜塔莉亚惊慌失措，蹲下用纸巾给布拉姆擦拭裤子，她的衣领开得很低，胸贴近布拉姆的大腿。\n娜塔莉亚：教父，请把裤子脱下来交给我，我替您清洗吧。(Godfather, please let me take your pants off. I'll get them cleaned right away.)\n▲布拉姆目光扫过了娜塔莉亚的脸和她的胸口，喉结滚动了一下。【15】\n布拉姆（嗤笑）：脱下来？（指尖划过娜塔莉亚的脸）你的野心倒是毫不掩饰。（松开娜塔莉亚）你这招，对别的男人或许很有效，可我不吃这一套！(Take them off? You're not even trying to hide your ambition, are you? That little show might work on other guys, but I don't buy it.)\n▲娜塔莉亚微微躲避，低下头去。\n娜塔莉亚（紧张）：先生，我并没有这个意思，我只是……我仰慕您很久了，您强大，睿智，是无数人仰望的对象，我由衷地敬佩您。(Sir, please, that's not what I meant. I just... I've looked up to you for so long. You're powerful, brilliant, a man everyone reveres. I genuinely admire you.)\n▲布拉姆愉悦地笑了，指腹擦过了娜塔莉亚的嘴角。\n布拉姆（笑）：嘴可真甜。(You've got quite a silver tongue, haven't you?)\n▲这时，塞莱特斯来到了餐厅，桌子挡住了视线，她看到布拉姆坐在椅子上，娜塔莉亚蹲在布拉姆的面前，举止不雅，顿时误会了。\n塞莱特斯（呵斥）：你们在干什么？【16】(What on earth is going on here?!)\n\n第七集\n7-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲娜塔莉亚听到声音，眼中划过了一丝兴奋。\n娜塔莉亚（高兴）OS：好戏开场了！(And... showtime!)\n▲娜塔莉亚故作慌乱起身，手中拿着纸，布拉姆的裤子上还有牛奶的痕迹。\n娜塔莉亚：夫人……事情并非您所想的那样……(Ma'am... please, it's not what it looks like!)\n▲塞莱特斯大步流星地走过来，一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯（呵斥）：不知廉耻，竟敢勾引我的丈夫，立刻滚庄园！(You shameless little whore! How dare you seduce my husband! Get the hell out of my house!)\n▲娜塔莉亚捂着脸，委屈地看着布拉姆。\n娜塔莉亚（可怜）：夫人，难道崇拜教父也是过错吗？（不屈）难道他不配得到别人的仰慕吗？(Ma'am, is it such a sin to admire the Godfather? Doesn't a man like him deserve to be revered?)\n▲布拉姆听到这句话，脸色阴沉。\n塞莱特斯（愤怒）：你——(You-)\n▲塞莱特斯举起手要打娜塔莉亚，被布拉姆拦住了。\n布拉姆：塞莱特斯！请你克制你的行为！(Celeste! That's enough!)\n塞莱特斯（呵斥娜塔莉亚）：滚出去！立刻滚——(Out! Get the hell out-)\n▲塞莱特斯还想对娜塔莉亚动手，但是被布拉姆拦住了。\n布拉姆（呵斥）：塞莱特斯！你简直越来越不可理喻了，看来你需要接受心理治疗了！(Celeste! You are losing your mind! Maybe it's time you saw a psychiatrist!)\n塞莱特斯（惊愕）：你认为我疯了？既然你现在这么厌恶我，为什么不跟我离婚？(You think I'm crazy? If I disgust you so much, why don't you just sign the divorce papers?!)\n▲ 众人震惊，娜塔莉亚不动声色看向了塞莱特斯。\n娜塔莉亚（惊讶）OS：离婚？塞莱特斯想离开布拉姆？(Divorce? Celeste actually wants out?)\n▲布拉姆一把抓住了塞莱特斯的手腕，压下了情绪。\n布拉姆（深呼吸）：抱歉，（握住梅菲斯特的手）塞莱特斯，你先上楼，（目光看娜塔莉亚）我会处理她。(I'm sorry. Celeste, head upstairs. I'll handle her.)\n▲塞莱特斯眼神愤怒，甩开布拉姆的手。\n塞莱斯特（呵斥）：离婚！(I want a divorce!)\n▲布拉姆神情冷漠了几分，看了一眼远处的女佣。\n布拉姆（深呼吸）：来人，夫人需要休息，送夫人回房间！(Guards! Madam needs some rest. Escort her back to her room!)\n▲两个女佣上前搀扶塞莱特斯，塞莱特斯甩开女佣。\n塞莱特斯（呵斥）：别碰我，我自己会走！(Get your hands off me! I can walk!)\n▲塞莱特斯和娜塔莉亚擦肩而过的时候，她看了一眼娜塔莉亚，低声开口。\n塞莱特斯（嘲笑）：你会后悔你所做的一切的——（放慢语速）娜塔莉亚！【17】(You are going to pay for every single thing you've done... Natalia.)\n▲娜塔莉亚擦了一下脸上的泪，无辜开口。\n娜塔莉亚：我不知道您在说什么。(I... I have no idea what you're talking about.)\n▲塞莱特斯冷哼了一声，走了，娜塔莉亚盯着塞莱特斯的背影。\n娜塔莉亚OS：塞莱特斯为什么会提出离婚？这太反常了，她是想离开布拉姆还是想威胁布拉姆将我赶走？(Why is Celeste bringing up divorce now? Something's off. Is she genuinely trying to leave him, or is this just a power play to get me kicked out?)\n▲布拉姆突然伸手扶着娜塔莉亚的腰，捏了一下她的腰，娜塔莉亚猛地回头看向了布拉姆，布拉姆靠近她。\n布拉姆（低声）：敢当着塞莱特斯的面儿勾引我？我很欣赏你的胆量。（故意提高声音警告）但，我不希望再有下次！(Seducing me right under Celeste's nose? You've got guts. I'll give you that. But don't let there be a next time.)\n▲说完之后，布拉姆的目光在娜塔莉亚捏着纸巾的手上掠过，随后转身离开了，娜塔莉亚瞧着布拉姆的背影，倒了一杯牛奶，慢慢品尝。\n娜塔莉亚OS：不希望有下次？还是希望下次快点到来？布拉姆先生！【18】 (Don't want a next time? Or can't wait for it... Mr. Bram?)\n\n\n第八集\n8-1\n日  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚在桌子上画画，画上面是一扇门，门上缠着铁链。\n娜塔莉亚（惊讶）OS：缠着铁链的门——(A door bound in heavy chains...)\n▲娜塔莉亚压下了心中的震惊。\n娜塔莉亚（故作好奇）：天啊，这张画画得真好，充满了神秘色彩。（摸戴安娜的头）您见过，还是直接想象出来的？(Sweetheart, what a beautiful drawing! It looks so mysterious. Did you actually see this somewhere, or did you just make it up?)\n戴安娜（乖巧）：这是我们家的地下室啦～(That's our basement!)\n娜塔莉亚（惊讶）：地下室——(The basement...?)\n▲戴安娜像是突然反应了过来一样，立刻将画藏了起来。\n戴安娜（竖起手指）：嘘，千万不要告诉爸爸哦～(Shh... Promise you won't tell Daddy!)\n▲娜塔莉亚弯着腰，故意捂着眼睛逗戴安娜。\n娜塔莉亚（温和）：好哦，那我就当作什么都没有看见。(Cross my heart. I didn't see a thing.)\n▲戴安娜一瞧，开心地笑了起来，她顺手将画压在了画纸下方，拿出了另外一张画给娜塔莉亚看。\n戴安娜：你看，这是我画的妈妈！(Look! I drew Mommy!)\n▲娜塔莉亚盯着画，上面是一幅简笔画，一个女人抱着一个孩子，手背上和手腕上都有一道伤痕。\n娜塔莉亚（惊讶）OS：上帝啊，那是什么？(My God... what are those scars?)\n▲戴安娜没发现娜塔莉亚的情绪，看着画，充满怀念地开口。\n戴安娜（叹气）：我真的很想念妈妈。(I miss Mommy so much...)\n▲娜塔莉亚愣了一下，轻轻将戴安娜护在怀中。\n娜塔莉亚：你的妈妈也同样牵挂着你，如果你过得痛苦，她会万分难过，我们先好好休息，好吗？(Your mommy misses you just as much. Seeing you hurting like this would break her heart. Let's get some sleep, okay?)\n戴安娜：你能给我唱睡眠曲吗？妈妈以前经常唱给我听。(Will you sing me a lullaby? Mommy used to sing to me all the time.)\n▲娜塔莉亚将戴安娜抱在怀中，轻轻拍着她的后背，唱起了睡眠曲。引用国外歌曲：《Baby's Bed A Silver Moon》\n娜塔莉亚：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n▲戴安娜闭着眼睛小声地说。\n戴安娜（低声）：你唱的歌和妈妈唱的一样。(You sound just like Mommy...)\n▲娜塔莉亚低头看着怀中的戴安娜笑，眼睛却红了。\n【闪回】\n8-2\n日 内  平民屋老房子\n人物 玛莉  娜塔莉亚\n▲小玛莉将小娜塔莉亚抱在怀中，娜塔莉亚抬头就能看到姐姐温柔的笑容，玛莉拍着她的后背，用稚嫩的声音唱安睡曲。\n小玛莉（拍背）：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n\n【闪回结束】\n▲小玛莉稚嫩的歌声和娜塔莉亚的歌声重叠。\n娜塔莉亚（哽咽）：飘啦飘啊宝贝，跨过千山万水。(Sail away, my little one, over mountains and streams...)\n▲一滴泪顺着娜塔莉亚的脸颊滴在戴安娜的脸上，娜塔莉亚连忙擦泪，低头一看，戴安娜已经睡着了，娜塔莉亚低头轻吻她额头。\n娜塔莉亚（坚定）OS：睡吧宝贝，小姨一定会找到你的母亲！【19】(Rest easy, my sweet girl. Auntie will bring your mother home.)\n\n8-3\n夜  内   走廊/地下室\n人物 娜塔莉亚  塞莱特斯\n▲走廊上，配着枪的安保在巡逻。\n安保：教父有令，不许任何人夜里在庄园内随意走动。(By order of the Godfather, no one wanders the grounds after dark.)\n▲娜塔莉亚躲在拐角的阴影处，安保走远后，她才出来，迅速走向了地下室的入口。\n▲娜塔莉亚不敢开灯，摸索着往前走。\n娜塔莉亚OS：地下室到底锁着什么东西？这东西会和姐姐有关吗？戴安娜难道是看到了地下室的东西才病了的？(What is he hiding down there? Is Mary behind that door? Is that what traumatized Diana?)\n▲她摸索着到了地下室门口，月亮冰冷地落在了门上，门上缠着铁链子，挂着锁，突然地下室里面传来了微弱的响动。\n（女声，模糊，微弱）vo：救救我……（非常模糊，难以判断）(Help... me...)\n娜塔莉亚（惊讶，拍门）：你是谁？(Who's in there?!)\n（女声，微弱）：我是……(I’m...)\n▲娜塔莉亚上前查看，突然一只手拍了一下。\n娜塔莉亚（惊恐）OS：是谁！【20】(Who's there?!)\n▲娜塔莉亚僵硬地转身，塞莱特斯穿着睡裙，披头散发站在她身后。\n塞莱特斯（声音冰冷）：我知道你是谁，也知道你潜入布莱克伍德庄园的目的。(I know who you really are... and exactly why you infiltrated the Blackwood estate.)\n▲娜塔莉亚吓了一跳，后退了一步靠在门上，塞莱特斯步步逼近。\n塞莱特斯：我给过你逃离的机会，既然你执意入局，就别怪我心狠手辣——(I gave you a way out. But since you insist on playing with fire, don't blame me for burning you alive.)\n▲娜塔莉亚盯着塞莱斯特，突然笑了一声。\n娜塔莉亚：塞莱特斯，是你引我来地下室的，我们不是敌人，对吗？(Celeste, you left those breadcrumbs to lead me here. We're on the same side... aren't we?)\n▲塞莱特斯震惊！【21】\n一卡\n\n第九集\n9-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯\n▲娜塔莉亚靠在门上，塞莱特斯一步一步逼近，地下室楼梯口偶尔有人影闪过。\n娜塔莉亚（警惕地看楼梯间）：夫人是想有话直说，还是等布拉姆发现我们？（Cut to the chase, or are you waiting for Bram to catch us?）\n▲塞莱特斯突然一把抓住了娜塔莉亚的手。\n塞莱特斯（一字一句）：救救我，娜塔莉亚！布拉姆想要除掉我！（Help me, Natalia! Bram is going to kill me!）\n娜塔莉亚（震惊）\n▲娜塔莉亚后退了半步，惊愕地看着塞莱特斯。\n娜塔莉亚OS：我猜对了，塞莱斯特想离开布拉姆！可她为什么要向我求救？（I was right. She’s trying to ditch Bram. But why come to me?）\n▲娜塔莉亚故作不解地看着塞莱特斯。\n娜塔莉亚（惊愕）：教父明明十分爱您，怎么会想除掉你？（The Godfather clearly loves you. Why would he want you dead?）\n▲塞莱特斯用力摇头。\n塞莱特斯（绝望）：你们都被骗了！那都是他的精心伪装的假面！他根本就不爱我！（You’ve all been played! It’s all an act. He doesn't love me at all!）\n娜塔莉亚（警惕）：夫人，您遇到危险，应该向您的家人求助，而不是我这个外人。（Ma'am, if you're in danger, go run to your family, not an outsider like me.）\n塞莱特斯（苦笑）：这座庄园守卫深严，我根本无法逃布拉姆的掌控，我也曾向我父母求救，可我身上没有伤痕，他们只认为是我无理取闹！（This place is a fortress, I can't get away from him. I tried begging my parents, but since there are no bruises on my skin, they just think I'm losing my mind.）\n▲塞莱特斯看向了楼梯口，楼梯口偶尔闪过巡逻的身影。\n塞莱特斯（悲伤）：没有人相信完美丈夫的面具下是禽兽。（激动地抓住娜塔莉亚的手）求你帮帮我！（Everyone thinks he's the perfect husband. No one believes me when I tell them what he's really like. Please, you have to help me!）\n▲娜塔莉亚观察着塞莱特斯的表情和发抖的身体。\n娜塔莉亚OS：她说的是真的？还是在试探我？这太冒险了……（ Is she telling the truth? Or testing me? Way too risky...）\n▲娜塔莉亚掰开塞莱特斯的手，准备离开。\n娜塔莉亚：夫人，这些话，我就当没听过！我得离开这里了，如果被教父发现，我会死的……（Ma'am, let’s just pretend this conversation never happened. I gotta go. If the godfather catches me, I'm dead meat...）\n▲塞莱特斯抹了一把眼泪，盯着娜塔莉亚的背影，突然开口。\n塞莱特斯：你的原名叫作苏丽娅，是玛莉的妹妹，八岁被焦恩收养改名娜塔莉亚！你潜入这里是为了寻找玛莉失踪的真相！（Your real name is Surya, Mary’s little sister. John adopted you when you were eight and made you Natalia! You didn't just stumble in here; you're hunting for the truth about Mary!）\n▲娜塔莉亚惊呆了，猛地回头看向了塞莱特斯。\n\n\n第十集\n10-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲娜塔莉亚惊讶地看着塞莱特斯。\n娜塔莉亚：夫人，我并不知道您在说什么，我也不认识玛莉——（Ma'am, I don't know what you're talking about. I have no idea who Mary is-）\n▲塞莱特斯拿出一张照片递给娜塔莉亚，光线昏暗，娜塔莉亚低头看着那张旧照片，上面是小时候的娜塔莉亚和小玛莉还有爸爸妈妈的全家福。\n娜塔莉亚（惊愕）：这张照片怎么在你这里！（where did you get this?）\n▲塞莱特斯走向娜塔莉亚，将照片递给她。\n塞莱特斯：布拉姆很懂怎么让女人为他着迷，一年前我就是这样上钩的。得知他有妻子时，我嫉妒得发疯，只想把他抢过来——他太享受这种被争夺的感觉了。（Bram has a way of wrapping women around his finger. That’s how he reeled me in a year ago. When I found out he was married, I went green with envy. I wanted him all to myself- and he thrives on women fighting over him.）\n▲娜塔莉亚死死握着照片。\n娜塔莉亚（愤怒）：所以你就绑架了我的姐姐？（So you're the one who snatched my sister?）\n塞莱特斯（摇头）：我没有！我只是想给她一笔钱让她离开的！我曾派人调查玛莉，发现她这一生太苦太惨，我不想毁了她好不容易得来的安稳生活。（I didn't! I just wanted to buy her off so she’d walk away. I had her background checked, her life had already been a nightmare. I didn't want to screw up the peace she finally managed to build.)\n▲塞莱特斯抚摸着地下室的铁锁，缓缓转头看向了娜塔莉亚。\n塞莱特斯（哽咽，恐惧）：我放弃了接近布拉姆，可没多久，她就失踪了，尸骨无存！连警方也找不到！（I gave up on Bram. But not long after, she vanished. Even the police couldn't find her!）\n娜塔莉亚（惊讶）：什么？（What?）\n塞莱特斯（看向地下室）：没有人知道她去哪儿了……（No one knows where she went...）\n▲娜塔莉亚审视地看着地下室的门，目光又慢慢挪回塞莱特斯。\n娜塔莉亚（惊愕）：她是不是在这里面？（Is she locked down in there?）\n塞莱特斯（摇头）：我不知道，每一个靠近地下室的人不是死亡就是失踪了……（I don't know. Everyone who gets close to the basement either dies or disappears...）\n▲娜塔莉亚盯着地下室的门，后退了半步。\n娜塔莉亚（审视）：那你现在告诉我这些的目的是什么？（So why are you telling me this now?）\n▲塞莱特斯紧紧抓住娜塔莉亚的手臂。\n塞莱特斯：我怀疑是布拉姆杀了他们！我也试图解开地下室的秘密，布拉姆现在的目标肯定是我，你也靠近了，下一个就是你了！只有我们联手，才有机会逃离魔爪——（Because I'm betting Bram is the one who got rid of them! I tried digging into this basement myself. Now I'm sitting in his crosshairs, and since you've been sniffing around too, you're next on his hit list! Team up with me, or we're both dead.）\n娜塔莉亚（试探）：是你引我来地下室的？你想让我跟你绑在一起？（So you set me up? You dragged me into this just to use me as your shield?）\n塞莱特斯（绝望）：娜塔莉亚，别怪我，（捂着脸）我实在没有办法了，我不想死！（Natalia, don't blame me. I have no choice. I don't want to die!）\n娜塔莉亚（看向地下室的门）：那你想让我怎么做？（Then what do you want me to do?）\n塞莱特斯（坚定）：我需要你去勾引布拉姆！（I need you to seduce Bram!）\n▲娜塔莉亚惊讶，她还没来得及详细询问，突然一束光打在了两个人的脸上，两个人惊恐地抬头看向了楼梯口。\n▲布拉姆阴沉着脸，拿着手枪，带着配枪的安保，站在楼梯口。\n布拉姆（冷冽）：你们在这里干什么？（What do we have down here?）\n\n\n第十一集\n11-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲安保的枪口对准了娜塔莉亚，布拉姆一步一步走向了娜塔莉亚和塞莱特斯，娜塔莉亚和塞莱特斯几乎都是紧张地后退了半步，娜塔莉亚连忙将照片藏在了袖子里面。\n▲布拉姆一挥手，两个安保抓住一个男人过来，男人表情惊恐。\n男人：教父，我错了！我真的错了！（Godfather, I was wrong! I'm sorry!）\n布拉姆（子弹上膛）：无视我的规矩，窥探庄园的秘密，就要付出代价。（Break my rules, nose around my estate, and you pay with your life.）\n▲布拉姆的枪抵在了男人的肩膀上。\n男人：教父，求求您放过我吧，我没有想窥探您的秘密，我……（Godfather, mercy! I swear I wasn't snooping around! I—）\n▲娜塔莉亚想说话，塞莱特斯在黑暗中抓住了她的手示意她别开口。\n▲布拉姆表情冷漠，枪响，男人的尖叫声响起，娜塔莉亚捂着耳朵尖叫了一声，靠在墙上惊恐地看着男人被打穿了肩膀躺在地上哀号。\n布拉姆（抬手）：把人拖走，别惊扰了我的夫人，（视线落在了娜塔莉亚身上）还有尊敬的娜塔莉亚小姐。（Drag him away. We wouldn't want to upset my wife... or our lovely Miss Natalia.）\n▲安保将受伤的男人拖走，血流了一地，娜塔莉亚和塞莱特斯几乎不敢喘气，娜塔莉亚瞥了一眼塞莱特斯。\n布拉姆（看了一眼地下室的门）：你们来这里做什么？（So... what brings you two down here?）\n▲塞莱特斯被地上的鲜血刺激得后退了一步，娜塔莉亚看向她。\n娜塔莉亚OS：塞莱特斯夫人，如果你出卖我的话，就别怪我不客气了——（Throw me under the bus, Celeste, and I swear I'm taking you down with me—）\n▲塞莱特斯突然猝不及防的扇了娜塔丽亚一耳光。\n塞莱特斯：贱人！你竟敢污蔑我？（You bitch! How dare you set me up?）\n▲娜塔莉亚猛地抬头看向了塞莱特斯，眼神错愕。\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n\n\n第十二集\n12-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n塞莱特斯：贱人！你竟敢污蔑我梦游？还把我带到这个鬼地方，分明是想害我！（You bitch! How dare you lie and say I was sleepwalking?! You dragged me down to this hellhole to get me killed!）\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n布拉姆：是吗？敢污蔑我的夫人！（Is that so? You dared to frame my wife!）\n▲娜塔莉亚盯着塞拉特斯的脸，二人对视，仿佛空气都凝固了。\n娜塔莉亚（恢复镇静）：教父，夫人的确是梦游了！请相信我的专业判断。（Godfather, she really was sleepwalking. You have to trust my professional judgment.）\n塞莱特斯（愤怒）：胡说，你颠倒黑白，污蔑我有病，是不是想取代我的位置！（Bullshit! You're twisting the truth, trying to make me look crazy! You just want to take my place!）\n娜塔莉亚：夫人，地下室是禁地，如果您不是梦游，来地下室干什么？如果不是梦游，您有手有脚，又怎么会听我指挥？我只是怕您有危险，所以跟到了这里。（Ma'am, the basement is strictly off-limits. If you weren't sleepwalking, what were you doing down here? And why did you follow me without a word? I only came down because I was worried about your safety.）\n▲娜塔莉娅拨开布拉姆的枪，魅惑的看着布拉姆。\n娜塔莉娅：教父，您觉得我说的对吗？（Godfather, don't you think I'm right?）\n▲布拉姆冷眼盯着塞莱特斯和娜塔莉亚，塞莱特斯连忙抱住了布拉姆的手臂，疾言厉色地开口。\n塞莱特斯：布拉姆，她是在污蔑我！（看保安）保安，把这个女人驱逐出去！（Bram, she's framing me! Guards, throw this woman out!）\n▲保安目光看布拉姆，没有动，布拉姆的表情松动，拍了拍塞莱特斯的手。\n布拉姆：塞莱特斯，冷静点儿，我会请最权威的精神科医生医生来对你进行评估。（看保安）带夫人去休息。（Celeste, calm down. I'll have the best psychiatrist come take a look at you. Take my wife to rest.）\n塞莱特斯（故作惊讶）：我才是你的妻子！你宁愿相信这个外来者也不相信我？（I'm your wife! You’re taking the word of a stranger over mine?）\n布拉姆（呵斥）：回去休息！（Go rest!）\n▲塞莱特斯惊愕，布拉姆拍了拍塞莱特斯的肩膀放缓了语气。\n布拉姆（安抚）：亲爱的，我这都是为了你好，快去休息吧。（Sweetheart, I'm doing this for your own good. Now go get some sleep.）\n▲塞莱特斯和娜塔莉亚对视了一眼。\n▲塞莱特斯气冲冲地离开了，布拉姆转了一圈手枪，用枪挑起娜塔莉娅的下巴。\n布拉姆（威胁）：娜塔莉亚，我的宝贝，告诉我，你来地下室的真正目的。（Natalia, my sweet... now tell me the real reason you're down here.）\n\n第十三集\n13-1\n夜  内   地下室\n人物 娜塔莉亚  布拉姆   安保若干 \n▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。\n娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！（Bram doesn't buy our story. Better to admit part of it than keep hiding.）\n▲娜塔莉亚盯着布拉姆的眼睛，突然上前一步，抱住了布拉姆。\n娜塔莉亚（故作惊恐）：教父！请原谅我！是我趁她梦游，故意把她引到了这里。（Godfather, please forgive me! I knew she was sleepwalking, so... I intentionally led her down here.）\n▲布拉姆惊讶地低头看着娜塔莉亚的，他放下了枪，抚着娜塔莉亚的后背开口。\n布拉姆（惊讶）：你故意的？（You did it on purpose?）\n娜塔莉亚（握拳）：是的，我只是个医生，不是她的佣人，可她却当众掌我嘴，我只想给她一个小小的教训！（Yes. I'm just a doctor, not her maid, but she slapped me in public. I just wanted to teach her a little lesson!）\n▲布拉姆盯着娜塔莉亚的模样，勾起嘴角。\n布拉姆OS：有趣，聪明，但也仅仅是个猎物！（Spicy, and sharp. But still just a mouse playing with a cat.）\n▲布拉姆挑眉，指尖划过了娜塔莉亚的脸颊。\n布拉姆（试探）：那你恨吗？想不想将她踩在脚下？（So do you hate her? Want to grind her into the dirt?）\n▲布拉姆话音落下，娜塔莉亚听到了子弹上膛的声音，娜塔莉亚扫了一眼那些枪口，格外紧张，心跳加速。\n娜塔莉亚（抬头看向布拉姆）：我不是神，当然会恨夫人。（愤恨）但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。（I’m no saint, so yeah, I despise her. But what really pisses me off is this rigged system. I hate the elite, even while I’m dying to have everything they’ve got.）\n▲布拉姆盯着娜塔莉亚，布拉姆突然推开娜塔莉亚，举起枪，对准了娜塔莉亚的额头。\n布拉姆：这番话，足以让你丧命！（Those words could get you killed!）\n▲娜塔莉亚不为所动，她伸出手轻轻抚摸着布拉姆的脖子，从他的肩膀抚摸到他的心口。\n娜塔莉亚（坚定）：但我说的都是真话！（放软声音）教父，难道您不恨他们吗？（But I'm telling the truth! Godfather, don't you hate them too?）\n▲布拉姆突然笑了，轻轻鼓了鼓掌。\n布拉姆（欣赏）：很好，我欣赏敢于坦诚欲望的人。（抚摸娜塔莉亚的肩膀）但你的目的远不止这些吧。（Good. I admire people who are honest about their desires. But your goal is more than that, isn't it?）\n▲娜塔莉亚惊愕地看着布拉姆，二人对视，娜塔莉亚紧张了起来。\n娜塔莉亚（紧张）OS：塞莱特斯都能查到我的身份，布拉姆会知道吗？（握拳）豁出去了！（ Celeste found out who I am. Does Bram know? Screw it!）\n▲娜塔莉亚山前一步，指尖轻轻揭开了布拉姆衣服的扣子，布拉姆一把抓住了娜塔莉亚的手。\n布拉姆（警惕）：你想干什么！（What do you want?）\n▲娜塔莉亚垫脚靠近布拉姆的耳朵，手从他的胸口滑落到腹部，腰部，最后勾住了他的皮带。\n娜塔莉亚（妩媚）：教父，我曾远远见过您一次，便深深爱上了您！我进入庄园，都是为了您呀。（Godfather, I saw you once from a distance, and I fell for you. I came into this estate for you.）\n▲布拉姆一惊，喉结滚动了一下，目光掠过娜塔莉亚的脸颊和脖子。\n布拉姆OS：这个妖精，真想把她绑起来，玩个痛快！可惜现在还不到时候！（What a seductive little vixen. God, I want to break her. But the game’s just getting started.）\n▲布拉姆一把抓住了娜塔莉亚的手，阻止她的动作。\n布拉姆（故作冷漠）：够了！回你的住处去，记住，不要试图窥探这里的秘密，它会让你死的很惨！（Enough! Go back to your room. And remember—don't dig into this place's secrets. It'll get you killed.）\n▲娜塔莉亚连忙低下头去，绕过了布拉姆，提着裙摆上楼了，她回头看了一眼地下室的铁门上的锁。\n【闪回】\n13-2  （衔接10-1）\n夜  内   地下室门口\n人物  娜塔莉亚   塞莱特斯\n▲塞莱斯特抓住娜塔莉亚的手。\n塞莱特斯（情绪激动）：我需要你去勾引布拉姆！只要你帮我，我就告诉你地下室的钥匙在哪儿！（I need you to seduce Bram! Help me, and I'll tell you where the basement key is!）\n▲娜塔莉亚看了一眼锁，又看向了塞莱特斯。\n娜塔莉亚：我可以答应你！钥匙在哪儿？（I'll do it. Where's the key?）\n塞莱特斯（紧张）：是一把纯金的钥匙，就在布拉姆身上！（It's a solid gold key. and Bram keeps it right on him!）\n【闪回结束】\n▲娜塔莉亚不动声色地将目光从地下室门口，挪到了布拉姆的身上，布拉姆正烦躁地揭开了衬衣上面的三颗扣子，一道金色光芒在他衣服里面一闪而过。\n娜塔莉亚（惊讶）OS：那是钥匙吗？（坚定）我一定会取得布拉姆的信任，拿到地下室的钥匙，救出姐姐！（Was that it? The key? Watch your back, Bram... I'll win your trust, steal it, and tear this hellhole apart to save my sister.）\n13-2\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯站在窗前，忐忑地看着夜色。\n塞莱特斯（紧张）OS：都这么久了，希望娜塔莉娅没出什么危险。（It's been so long. I hope Natalia's okay.）\n▲这时，布拉姆推开了塞莱特斯的房间门，塞拉特斯被吓了一跳，他穿着睡衣，脸上带着温和的笑容。\n布拉姆（步步靠近）：塞莱特斯，这个世界上，唯有我最爱你。你应该牢记这一点。（Celeste, in this world, no one loves you like I do. Remember that.）\n▲塞莱特斯一步一步后退，布拉姆将她抵在了墙上。\n塞莱特斯：布拉姆！你想干什么？（Bram! What do you want?）\n▲布拉姆将一个盒子递给了塞莱特斯。\n布拉姆（笑）：但愿这里面的东西，能让你认清现实。（I hope this helps you see reality.）\n\n\n第十四集\n14-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n▲塞莱特斯脸色发白，紧紧握着裙摆，录音笔还在响。\n娜塔莉亚vo：但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。..(What really pisses me off is this rigged system. I hate the elite—even while I’m dying to have everything they’ve got.）\n▲布拉姆的手指拂过塞莱特斯的脸颊。\n布拉姆（蛊惑）：听见了吗？她恨你，她嫉妒你的出身，她想毁了你。只有我才能保护你！（Hear that? She hates you. She's jealous of your bloodline. She wants to destroy you. Only I can protect you!）\n▲塞莱特斯盯着录音笔，握紧了拳头。\n塞莱特斯OS：娜塔莉亚已经出卖了我？（Did she just throw me under the bus?）\n布拉姆（语气温和）：告诉我，她是怎么样蛊惑你的？（轻轻拥抱塞莱特斯）我会保护你不被伤害。（Now, tell me... how did she get into your head? Trust me, I'll keep you safe.）\n▲塞莱特斯心跳加速，她盯着录音笔，噗嗤一声笑了。\n塞莱特斯（骄傲地抬头）：我出身贵族，觊觎我身份的人太多了，她们嫉妒我、羡慕我，想害我，我习惯了。（I was born noble. So many people want my place. They're jealous, envious, out to hurt me. I'm used to it.）\n▲布拉姆脸上的温和瞬间消失了，他推开塞莱特斯，将录音笔狠狠摔在了地上，塞莱特斯被布拉姆突然变脸吓得捂住了耳朵。\n布拉姆（训斥）：你太狂妄自大了！你的傲慢会招来杀身之祸，唯有我可以庇护你！（You're too arrogant! Your pride will get you killed. Only I can shelter you!）\n▲布拉姆扯下她捂着耳朵的手，靠近她的耳朵。\n布拉姆（质问）：告诉我，你为什么要去地下室！你是不是也想知道里面有什么？（Tell me, why did you go to the basement? You want to know what's in there too, don't you?）\n▲塞莱特斯惊恐。\n塞莱特斯（抬头盯着布拉姆）：不不不——我不知道！是……是娜塔莉亚陷害我！（No, no, no—I don't know! It's... Natalia framed me!）\n▲布拉姆狠狠将塞莱特斯甩在了床上。\n布拉姆（拿出枪）：很好！（上膛）那我现在就去杀了她。（Good. Then I'll go kill her right now.）\n▲布拉姆举着枪大步流星地往外走，塞莱特斯吓坏了，连忙喊道。\n塞莱特斯：不，不是——我说实话！（No, wait—I'll tell the truth!）\n14-2\n夜  内  走廊\n人物  娜塔莉\n▲娜塔莉亚站在门口，耳朵贴在了门上。\n塞莱特斯vo：不，不是——我说实话！（No, wait—I'll tell the truth!）\n▲塞莱特斯的声音从门内传来，娜塔莉亚惊讶地猛地捂住了嘴巴。\n\n\n第十五集\n15-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆猛地回头，用枪挑起了塞莱特斯的下巴。\n布拉姆：那是什么？（威胁）你想背叛我？（What was that? You want to betray me?）\n▲塞莱特斯额头上冒出冷汗，颤抖地开口。\n塞莱特斯：是因为她白天勾引你，所以我故意装梦游，引她去地下室，我想要杀了她！（Because she seduced you today, I pretended to sleepwalk and lured her to the basement. I wanted to kill her!）\n▲布拉姆的表情松动了半分，布拉姆收了枪，轻轻抚摸着塞莱特斯的头发。\n布拉姆（温和）：我很高兴你如此在乎我。（Good. I do love it when you get jealous.）\n▲塞莱特斯颤抖了一下，布拉姆的脸上露出了笑容轻吻了她的额头\n布拉姆：放心，我只爱你一个人，不会被其他女人蒙骗。（Don't worry. I only love you. I won't be fooled by other women.）\n▲布拉姆将塞莱特斯搂在怀中，看着窗户上的影子，嗤笑了一声。\n布拉姆OS：竟然学会了互相掩护。（抚摸塞莱特斯的背影）当你不想让我杀了她的时候，你就已经露出了破绽。（Covering for each other now, are we? The second you stepped in to save her neck, you blew your cover.）\n▲布拉姆将塞莱特斯推到在了床上，开始脱衣服。\n布拉姆（解开皮带，放在手中把玩）：塞莱特斯，你能依靠的只有我一个，你会听话对吗？（Celeste... I'm all you've got in this world. You're gonna be a good girl for me, aren't you?）\n▲塞莱特斯看着浑身发抖，连忙后退，她拼命地摇头。\n塞莱特斯（颤抖求饶）：布拉姆，我，我身体不太舒服，我不想……（Bram, I... I don't feel well. I don't want to...）\n▲布拉姆一把抓住了塞莱斯特的手，眼神凶狠，撕开了她的上衣。\n布拉姆（故作温和）：拒绝我，你以前不是很喜欢我的占有吗？（Saying no to me? You used to crave it when I took control.）\n▲塞莱斯特惊慌失措，想挣扎，布拉姆突然松开她，捂住了她的嘴巴。\n布拉姆（警告）：嘘——有老鼠偷听。（Shh... we have a little eavesdropping rat outside.）\n▲布拉姆手中的手枪上膛，一步一步走向了门口。\n▲切镜。\n▲走廊上，娜塔莉亚正靠在门口听里面的动静，这时，门突然开了，布拉姆手中的枪突然抵在了娜塔莉亚的脑袋上。\n▲娜塔莉亚震惊。\n\n\n第十六集\n16-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚抬头看着布拉姆，布拉姆上半身的衬衣敞开着，他的一只手拿枪口抵着娜塔莉亚的脑袋，一只手关上了门，冷眼看着娜塔莉亚。\n布拉姆（深呼吸）：你在这儿干什么？我不是让你回房间吗？（What are you doing here? Didn't I tell you to go back to your room?）\n▲娜塔莉亚打量着布拉姆的样子，握紧了拳头。\n娜塔莉亚OS：看来我坏了他的好事——（Guess I ruined his little fun—）\n▲娜塔莉亚上前一步，轻轻抚摸着布拉姆裸露的胸膛。\n娜塔莉亚（撒娇）：教父，我不想你和夫人发生关系，我想……（Godfather... I couldn't stand the thought of you touching her. I want... ）\n▲布拉姆一惊，握着手枪的手放了下去，娜塔莉亚的手在布拉姆的身上随意地抚摸了起来。\n娜塔莉亚（着急）OS：钥匙到底在哪儿！（Where the hell is the key?）\n▲布拉姆突然一把抓住了娜塔莉亚的手，眼神带着侵略性地落在了娜塔莉亚的身上。\n布拉姆（捏住了她的下巴）：这么着急取代她？（Can't wait to take her place, huh?）\n▲娜塔莉亚抬头看向了布拉姆，一脸无辜。\n娜塔莉亚（后退）：教父……（Godfather...）\n▲布拉姆瞧着娜塔莉亚的样子，一步一步逼近娜塔莉亚。\n布拉姆：娜塔莉亚，既然是你主动送上门，我就不客气了！（Natalia, since you came to me, I won't hold back!）\n▲布拉姆握住了娜塔莉亚的手腕，一把将她拉在了自己的怀中，低头要吻她，娜塔莉亚几乎是下意识的避开。\n娜塔莉亚OS：禽兽，竟然来真的！（You animal—he's serious!）\n▲布拉姆目光极具侵略性，一步一步逼近娜塔莉亚，他抓住娜塔莉亚的手，让娜塔莉亚的手从他的胸膛一直往下摸到下腹，娜塔莉亚想要收回手，却被布拉姆死死摁住了手。\n布拉姆（蛊惑）：娜塔莉亚，这可是你取代塞莱特斯的机会，你不要吗？权力、财富、地位，你马上就能拥有。（Natalia, this is your chance to replace Celeste. You don't want it? Power, wealth, status, you can have it all.）\n▲娜塔莉亚惊愕地看着布拉姆，露出乖巧的笑容。\n娜塔莉亚（轻点布拉姆的心口）：虽然我很想要，但是……（撒娇）教父，我来月经了，等经期过了……（I really want it, but... Godfather, I'm on my period. Can you wait until it's over？）\n▲布拉姆握住了娜塔莉亚的手。\n布拉姆（嗤笑）：是吗？内裤脱了，我检查。（Is that so? Take off your underwear. Let me check.）\n▲娜塔莉亚不敢置信地盯着布拉姆。\n娜塔莉亚（震惊）：什么？（What?）\n\n\n第十七集\n17-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚后退了一步，抵在了门上，布拉姆逼近一把捏住了娜塔莉亚的下巴，一把捏着她的下巴，将她的脸转过来，威胁着开口。\n布拉姆（喘息）：你不是爱我吗？不是想取代塞莱斯特吗？拿出你的诚意来！（威胁）不然的话，我不介意让我的狼加餐！（You love me, don't you? You say you want to take Celeste's place？Show me your loyalty, or I’ll feed you to my wolves tonight.）\n▲远处传来狼的嚎叫声，气氛突然变得紧张了起来，娜塔莉亚心跳加速。\n▲这时，戴安娜站在走廊尽头大喊。\n戴安娜（大喊）：娜塔莉亚姐姐，爸爸，快来看我画的画！（Natalia! Daddy! Look what I drew!）\n▲布拉姆看到戴安娜，立刻整理了一下自己的衣服，眼神不悦地落在了戴安娜的身上。\n布拉姆（冷冽）：戴安娜！谁允许你出来的？（Diana! Who gave you permission to leave your room?）\n▲戴安娜举着画，画上画着一个生日蛋糕。\n戴安娜（委屈）：爸爸的生日快到了，我只是想送爸爸一个礼物，让爸爸开心。（Daddy's birthday is coming. I just wanted to give you a gift and make you happy.）\n▲布拉姆收起了枪，走向了戴安娜，伸手摸了一下她的头发。\n布拉姆（不耐烦）：你的心意，我收到了，回房间去。（I got it. Go back to your room.）\n▲戴安娜看了一眼布拉姆，又看向了娜塔莉亚，低着头看着生日蛋糕说。\n戴安娜：以前爸爸的生日宴会，都是妈妈亲手做的蛋糕，妈妈去哪儿了？我想妈妈……（Mommy always baked your cake for your birthday... Where did she go? I really miss her, Daddy...）\n▲布拉姆冷漠呵斥。\n布拉姆（呵斥）：戴安娜！闭嘴！（Diana! Shut up!）\n▲戴安娜被吓到了，哇的一声就哭了，娜塔莉亚立刻扑过去，将戴安娜抱起来，回头看向了布拉姆。\n娜塔莉亚（看向布拉姆）：先生，小姐的病情本就不稳定，您别刺激她！（Sir, her condition is unstable. Don't trigger her!）\n▲戴安娜抱着娜塔莉亚的脖子失声痛哭，布拉姆烦躁地挥了一下手，看向了娜塔莉。\n布拉姆：把她带回房间去！（Take her back to her room!）\n▲娜塔莉亚抱着戴安娜转身回戴安娜的房间，布拉姆盯着娜塔莉亚的背影，目光最后落在了她的臀部。\n布拉姆OS：有点小聪明，但也只是个落入囚笼的兔子而已！（A little clever, but still just a rabbit in a cage.）\n▲布拉姆推开了塞莱特斯的房间门走了进来，里面传来了塞莱斯特的尖叫声。\n\n\n第十八集\n18-1\n夜  内   戴安娜房间\n人物  戴安娜   娜塔莉亚\n▲戴安娜在娜塔莉亚的怀中，指着画上的蛋糕，有些委屈的开口。\n戴安娜（抹眼泪）：以前妈妈在的时候，爸爸从不会凶我，还会陪我过生日，我好想妈妈。（When Mommy was here, Daddy never yelled at me. He celebrated my birthday with me. I miss Mommy.）\n▲娜塔莉亚的目光落在了戴安娜手中的画上。\n【闪回（蛋糕定格切镜到小面包）】\n夜  内  娜塔莉亚小时候的家\n人物  小娜塔莉亚  小玛莉\n▲桌上摆放着一个小面包，面包上插着蜡烛，小玛莉看着小娜塔莉亚摸了摸她的脑袋。\n小玛莉（声音稚嫩）：等以后，姐姐给你买个真正的生日蛋糕！（安抚）许个愿吧。（Someday, sis, I'll get you a real birthday cake. Now, close your eyes and make a wish.）\n▲小娜塔莉亚看着插着蜡烛的面包。\n小娜塔莉亚（高兴）：那我的愿望是，和姐姐永不分离！（My wish is for us to stay together forever and ever!）\n▲小娜塔莉亚吹蜡烛，黑幕。\n【闪回结束】\n▲娜塔莉亚看着画，又低头看着熟睡的戴安娜，她紧紧将戴安娜抱在怀中。\n娜塔莉亚（坚定）OS：我会救出姐姐，让戴安娜和她的母亲团聚！（I swear I will rescue my sister... and bring Diana’s mother back to her.）\n18-2\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣端着托盘，托盘里面放着药往塞莱特斯的房间走，娜塔莉亚从戴安娜房间里面出来。\n娜塔莉亚（盯着女佣）OS：过几天是布拉姆的生日宴，是个能利用的机会。（Bram's birthday banquet is in a few days. That's a chance.）\n▲就在女佣靠近时候，娜塔莉亚一不小心撞到了女佣，女佣手中的托盘差点翻了，娜塔莉亚伸手托住了女佣的手腕，一只手扶住药碗。\n娜塔莉亚：小心！（Careful!）\n女佣：感谢小姐。（Thank you, miss.）\n▲女佣端着药要进入塞莱特斯的房间。\n娜塔莉亚OS：希望塞莱特斯能看到我传递给她的信息！（I hope Celeste sees my message!）\n▲这时，布拉姆走了出来。\n布拉姆（看女佣）：等一等——（Wait—）\n▲娜塔莉亚回头紧张地看着布拉姆。\n娜塔莉亚OS：千万别被布拉姆察觉破绽。（Don't let Bram spot anything.）\n▲布拉姆抬头看了一眼娜塔莉亚，嗤笑了一声。\n布拉姆：你在紧张什么？（Why the jittery face, Natalia?）\n娜塔莉亚（摇头）：不，我刚才不小心把夫人的药撞洒了些……（Nothing. I accidentally spilled some of her medicine earlier...）\n▲布拉姆一步一步走了过来，目光看向了女佣手中的托盘，他用勺子搅了一下药，又将碗端起来检查了一下。\n布拉姆（审视）：洒了吗？（Did it spill?）\n娜塔莉亚（紧张）：一点点……（Just a tiny bit..）\n▲娜塔莉亚盯着布拉姆的动作，心跳加快，目光看向了托盘。\n▲布拉姆看了一眼娜塔莉亚，又顺着娜塔莉亚的目光落在了女佣手中的托盘上。\n布拉姆（冷冽）：将托盘翻过来。（Flip the tray over. Now.）\n▲布拉姆拿出手枪，子弹上膛，娜塔莉亚的目光盯着女佣的动作，女佣缓缓将托盘翻过来——\n\n\n第十九集\n19-1\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣听话地将托盘翻了过来，下面什么都没有，布拉姆这才将药碗放在了托盘上，目光又看向了女佣。\n布拉姆（冷冽）：药给我，我拿进去。（Hand it over. I'll take it to her myself.）\n▲女佣听话地将药碗递给了布拉姆，娜塔莉亚眼神一变，一把抱住了布拉姆的手臂。\n娜塔莉亚（委屈）：教父~您就这么关心夫人？（Godfather, you care about her that much?）\n▲布拉姆一愣，低头看向了娜塔莉亚。\n布拉姆（捏娜塔莉亚的脸）：吃醋了？（Jealous?）\n▲娜塔莉亚松开了布拉姆的手臂，转身背对布拉姆。\n娜塔莉亚（不高兴了）：我怎么会吃醋？我有什么资格吃醋？（Why would I be jealous? I have zero right to be.）\n▲布拉姆抓住了娜塔莉亚的手臂，将她拉入了自己的怀中。\n布拉姆（捏娜塔莉亚的脸）：你长得很像一个人。（You know... you really remind me of someone..）\n▲娜塔莉亚不动声色地抬头看向了布拉姆，指尖轻轻点了点他的胸口。\n娜塔莉亚（乖巧）：什么人？情人还是爱人？您不会拿我当替身吧。（Oh? An ex-lover, or a wife? Don't tell me I'm just some cheap stand-in.）\n▲布拉姆握住娜塔莉亚的手，轻轻吻了吻她的指尖。\n布拉姆（嗤笑）：她可没有你这么大胆。（打量娜塔莉亚）也没有你这么诱人~（She wasn't as bold as you. Or as tempting.）\n▲娜塔莉亚勾着布拉姆的皮带，让他一步步靠近。\n娜塔莉亚（乖巧）：教父昨晚不是说要检查吗？我准备好了……（Godfather, didn't you say you wanted to check last night? I'm ready...）\n▲布拉姆喉结滚动了一下，一步一步靠近娜塔莉亚，女佣立刻低着头，一只手托着托盘，打开门进入了塞莱特斯的房间。\n18-2\n日 内  塞莱特斯房间\n人物 塞莱特斯  女佣\n▲塞莱特斯看着女佣端着咖啡进来，声音冰冷地开口。\n塞莱特斯：出去，我没有病，我不喝这些药！（Get out. I'm not sick. I'm not drinking this!）\n女佣（为难）：夫人，教父下令，我必须看着您喝下去。（Ma'am, please... the Godfather’s orders. I have to watch you finish it.）\n▲塞莱特斯刚想发火，突然看见女佣的衣袖袖口位置贴了一张极小的纸条。\n塞莱特斯（不动声色）：喝就喝——（Fine, I'll drink—）\n▲她伸手抓住了女佣的手腕顺手将纸条取了下来，随后端起碗一口喝了下去，将空碗扬了扬。\n塞莱特斯：你可以滚了！（You can get lost now!）\n▲女佣低着头逃一般离开，塞莱特斯立刻看纸条。\n娜塔莉亚（旁白）：宴会捉奸，帮您离开，希望您当众将地下室的秘密揭露出来，助我一臂之力！同意就摔碗为信号。（Catch him cheating at the party, and I'll help you walk free. Expose the dark secret of the basement in front of everyone, and we both win. Drop the bowl as a signal.）\n▲切镜。\n▲走廊上，布拉姆一把将娜塔莉亚抗在了肩上，大步流星往自己的方向走。\n布拉姆（拍娜塔莉亚的臀）：小妖精，我今天就让你爽个够！（You little vixen. I'm gonna rock your world today!）\n▲娜塔莉亚趴在布拉姆的肩膀上，看向了塞莱斯特的房门。\n娜塔莉亚OS：三、二、一……（Three, two, one...）\n▲突然，塞莱特斯房间里面传来打碎了碗的声音，布拉姆脚步一顿！将娜塔莉亚放下。\n娜塔莉亚OS：合作达成！(Deal!）\n布拉姆（看向塞莱特斯的房间，不悦）：我去看看她又在闹什么！（Let me see what she's up to now!）\n▲娜塔莉亚一把抓住了布拉姆的手。\n娜塔莉亚（撒娇）：教父~（Godfather.）\n▲布拉姆回头看了一眼娜塔莉亚。\n布拉姆（安抚）：生日宴时，她父母会来，你也不想她到时候闹事，对吧！（Her parents will be at the birthday banquet. You don't want her making a scene, right?）\n▲娜塔莉亚故作委屈松手。\n娜塔莉亚（叹气）：好吧，那我就先忍一忍~（Fine. I'll hold it in for now.）\n▲布拉姆走向了塞莱特斯的房间，娜塔莉亚转身往戴安娜的房间走。\n娜塔莉亚（看门）OS：希望能在宴会上，引塞莱特斯的父母出手打开地下室，如果失败了，我也能乘机拿到钥匙，救出姐姐！（Let’s hope Celeste’s parents play their part and blow the basement wide open. But if that plan tanks... I’ll just swipe the key myself and tear this place down to save my sister.)\n\n\n第二十集\n20-1\n日  内  塞莱特斯房间\n人物  布拉姆 塞莱特斯  管家\n▲塞莱特斯睡在了床上，布拉姆坐在窗边上，管家恭敬地看着布拉姆。\n管家：先生，家庭医生给夫人打了镇定剂，她应该不会再闹了。（Sir, the doctor loaded her up with sedatives. She’s out cold; she won’t be making a scene anymore.)\n▲布拉姆点了点头。\n布拉姆（冷冽）：不管如何，宴会之前别让她惹出事情。（Either way, don't let her cause trouble before the banquet.）\n管家（不解）：教父，您明知道夫人和娜塔莉亚在联手动手脚？为什么不阻止她们？（Godfather, you know Celeste and Natalia are working together. Why not stop them?）\n▲布拉姆看了一眼塞莱特斯，嗤笑了一声。\n布拉姆（不屑）：两个落入狼群的兔子，能翻出什么浪花？顶多两个有趣的猎物而已！（Two rabbits in a wolf pack. What can they do? Just two little rabbits for me to play with.）\n20-2\n日  内  宴会厅\n人物  布拉姆  娜塔莉亚  塞莱特斯   戴安娜  宾客若干   莱恩  伊丽莎白\n▲宴会厅金碧辉煌，娜塔莉亚带着戴安娜在甜品区吃糕点，娜塔莉亚远远看着塞莱特斯挽着布拉姆的手，正在和一对夫妇聊天，女人打扮华丽【塞莱特斯母亲 伊丽莎白】，男人【塞莱特斯父亲 莱恩】看起来风度翩翩，举手投足都十分贵气，塞莱特斯似乎察觉了娜塔莉亚的目光，二人对视了一眼互相点头。【Celeste’s Mother, Elizabeth】【Celeste’s Father, Ryan】\n▲娜塔莉亚亲眼看着塞莱特斯将一杯酒递给了布拉姆，布拉姆将酒一口喝了。\n娜塔莉亚OS：上钩了，这酒里的可是好东西。（Got him. There’s something extra in that drink.）\n▲戴安娜看了过去。\n戴安娜：那是塞莱特斯夫人的妈妈，（情绪低落）我也好想我的妈妈呀。（That's Celeste's mom. I miss my mommy too.）\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的戴着帽子的男性客人，路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n男客人（伸手扶娜塔莉亚和戴安娜）：抱歉。（My apologies.）\n▲娜塔莉亚摇了摇头。\n娜塔莉亚：我没什么大碍。（I'm fine.）\n▲布拉姆听到这边的动静，立刻看了过来。\n布拉姆（担心）：发生了什么事？（What happened?）\n男客人（歉意）：教父，不好意思，我差一点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n▲布拉姆故作绅士。\n布拉姆：不必介怀，请您继续享用晚宴吧。（No worries. Enjoy the banquet.）\n▲布拉姆摸了摸戴安娜的脑袋。\n布拉姆：我的小公主，玩的开心吗？（My little princess, having fun?）\n戴安娜（点头）：嗯！（Yeah!）\n布拉姆（温和）：宾客太多了，你跟娜塔莉亚医生回房间好不好？（Too many guests. Go back to your room with Dr. Natalia, okay?）\n戴安娜：可是我还没玩儿够……（But I'm not done playing...）\n娜塔莉亚（抱起）：小姐，我们听教父的话，（柔声安抚）回房间我给你讲故事好不好？（Miss Diana, let's listen to the Godfather. I'll tell you a story in your room, okay?）\n▲就在娜塔莉亚准备离开时，塞莱特斯突然举着酒杯过来，笑着对布拉姆说。\n塞莱特斯：布拉姆，父亲让你陪他喝一杯——啊！（Bram, Father wants you to have a drink with him—ah!）\n▲塞莱特斯突然脚下一滑，一杯酒一下子泼到了布拉姆的身上，众人齐刷刷地看了过去。\n▲布拉姆昂贵的西装被打湿，看上去有些狼狈。\n塞莱特斯（震惊）：哦～天啊！布拉姆，我不是故意的。（Oh my God! Bram, I didn't mean it.）\n▲众目睽睽下，布拉姆强忍怒气，对着塞莱特斯露出了温和的笑容。\n布拉姆（安抚）：别太自责，我去换套衣服，你照顾一下宾客！（Don't blame yourself. I'll go change. You take care of the guests.）\n▲布拉姆优雅转身离开，塞莱特斯给娜塔莉亚使了个眼神，娜塔莉亚立刻点了点头。\n塞莱特斯（兴奋）OS：今夜过后，我就能离开了，娜塔莉亚，你可千万别让我失望！（After tonight, I'll be free. Natalia, don't let me down!）\n20-3\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲敲门声响起，布拉姆赤裸着上身开门。\n布拉姆（烦躁）：送个衣服都这么慢，当心我崩了你们……（What’s taking so long with those clothes? I swear, I’ll shoot you if...）\n▲布拉姆的声音戛然而止，只见娜塔莉亚穿着一条性感的低胸吊带连衣裙，抱着西装站在门口。\n布拉姆（惊愕）：娜塔莉亚？你穿成这样来干什么？（Natalia? What the hell are you wearing?）\n\n\n第二十一集\n21-1\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n娜塔莉亚（挑眉）：教父不喜欢刺激吗？（抚摸布拉姆的胸膛）还是，您有别的顾虑？（What’s wrong, Godfather? Don't tell me you're scared of a little excitement...）\n▲布拉姆看着娜塔莉亚，眼神从惊愕变成了玩味。\n布拉姆（捏住了娜塔莉亚的下巴）：激将法对我可没用！（笑）不过，我现在的确想把你吃掉！（Reverse psychology won't work on me, sweetheart. Though... I've got to admit, I'm dying to devour you right now.）\n▲布拉姆四下看了一眼，没看见人，他抓住了娜塔莉亚的手臂，将她抗在了自己的肩膀上，然后锁上了门。\n▲塞莱特斯看着布拉姆将娜塔莉亚拉入了房间，嘴角勾起了一个弧度，她转身向宴会厅走去。\n21-2\n日  内  宴会厅\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白\n▲宴会厅中，伊丽莎白挽着莱恩的手，正在和宾客寒暄，塞莱特斯一把抓住了伊丽莎白的衣服。\n塞莱特斯：妈妈，布拉姆出轨了。（Mom, Bram is cheating.）\n▲众人震惊，目光惊愕地盯着塞莱特斯，伊丽莎白迅速捂住了塞莱特斯的嘴巴。\n伊丽莎白（警告）：塞莱特斯！不要胡说！我想布拉姆应该不是这种人。（Celeste! Don't talk nonsense! I don't think Bram is that kind of man.）\n▲塞莱特斯摇了摇头，挣脱了伊丽莎白的手，拽着她往楼上走。\n塞莱特斯（委屈）：我亲眼看到他和一个女人进入了房间里面，请您相信我！（I caught him with my own eyes! He slipped into that room with a woman, you have to believe me!）\n▲众目睽睽之下，塞莱特斯和莱恩对视了一眼，莱恩将酒杯放在了桌子上。\n莱恩（冷哼）：哼，如果布拉姆敢背叛你，我绝不会放过他！（Hmph. If Bram dares to betray you, I won't let him get away with it!）\n▲莱恩大步流星地往房间走，塞莱特斯拉着伊丽莎白跟了上去，宾客们也跟着去看热闹。\n21-3\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚\n▲布拉姆垂眸盯着站在自己面前的娜塔莉亚，眼神透着审视。\n布拉姆（捏娜塔莉亚的手）：今天是我的生日宴，外面都是宾客，你想害我？嗯？（It's my birthday banquet. Guests are everywhere. You want to set me up? Hmm?）\n▲娜塔莉亚轻轻抚摸着布拉姆的脖子。\n娜塔莉亚（笑）：怎么会？（靠近布拉姆的耳朵）今天是您的生日。这是我特地为您准备的生日礼物！（Of course not. It's your birthday. This is a birthday gift I prepared just for you!）\n布拉姆（捏娜塔莉亚的腰）：把你自己当做礼物送给我？（Giving yourself to me as a gift?）\n▲娜塔莉亚缓缓拉下了自己的一根肩带，手在布拉姆身上摸索。\n娜塔莉亚（点头）：当然，过了今夜，您就是我的第一个男人，也是唯一的……（Of course. After tonight, you'll be my first man, and my only...）\n▲布拉姆喉结滚动了一下，一翻身，将娜塔莉亚压到身下！\n▲切镜。\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲门突然被大力踹开，娜塔莉亚和布拉姆猛地抬头，塞莱特斯带众人站在门口。\n塞莱特斯（呵斥）：你们在干什么——（What the hell is going on here?）\n\n\n第二十二集\n22—1日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。\n塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）\n▲娜塔莉亚对视塞莱特斯摇了摇头。\n【闪回】\n22-2\n日  内  布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲突然，外面传来了敲门声。\n女佣vo：教父，夫人带着伯爵和伯爵夫人过来了。（Godfather, Madam is here with the Count and Countess.）\n▲娜塔莉亚惊讶，下一刻，布拉姆突然清醒过来，一把将娜塔莉亚推开。\n布拉姆：快把衣服穿好！（Get dressed. Now!）\n【闪回结束】\n▲布拉姆带着温和的笑容，看向了塞莱特斯和莱恩夫妇。\n布拉姆（优雅）：爸妈怎么过来了？（Father, Mother... what a pleasant surprise. Is something wrong?）\n莱恩（尴尬）：你太久没出来，我们过来瞧瞧。（You've been missing for quite a while. We were getting concerned.）\n塞莱特斯（指着布拉姆）：娜塔莉亚怎么在这里？你们孤男寡女躲开宾客在这里面做什么？（Why is Natalia here? What are you two doing alone away from the guests?）\n布拉姆（从容）：戴安娜在宴会上受到了一些惊吓，娜塔莉亚正在向我汇报，有问题吗？（Diana got a little scared at the banquet. Natalia was briefing me on her condition. Is there a problem?）\n塞莱特斯（呵斥）：什么问题非要现在汇报？（看娜塔莉亚）你说，你们在这里面干什么？！（What could be so urgent it couldn't wait until tomorrow?! You! Tell them the truth! What were you doing in his room?）\n▲塞莱特斯的情绪特别激动，目光死死盯着娜塔莉亚，眼神带着祈求。\n塞莱特斯：你说啊！（Say it!）\n▲所有人的目光都落在了娜塔莉亚的身上。\n娜塔莉亚（握紧报告）OS：塞莱特斯，对不起了。（Celeste, I'm sorry.）\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n▲塞莱特斯惊愕地看着娜塔莉亚。\n塞莱特斯（不敢相信）：什么？你撒谎！（抓住了莱恩的手）爸爸，除了这个女人，地下室还藏在一个女人！（What? You're lying! Dad, besides this woman, there's another woman hidden in the basement!）\n莱恩（惊讶）：什么地下室？（The basement?）\n▲众人震惊，布拉姆面色阴沉，娜塔莉亚激动地看向了莱恩。\n\n二卡\n\n\n第二十三集\n23-1\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲布拉姆上前一步，握住塞莱特斯的手。\n布拉姆（深呼吸）：塞莱特斯，我知道你生病了，你也很难受，但有什么问题，我们私下说好吗？（Celeste, I know you're sick and it's hard, but let's talk in private, okay?）\n▲众人惊讶。\n伊丽莎白：生病了？（Sick?）\n塞莱特斯：你胡说——（看伊丽莎白和莱恩）爸爸妈妈，他胡说的，我没有生病！（You're lying—Mom, Dad, he's lying! I'm not sick!）\n▲布拉姆拿出了检查报告递给了莱恩和伊丽莎白。\n布拉姆（悲痛）：这是塞莱特斯的精神检查报告。她有严重的被害妄想症和梦游症，这一切都是她臆想出来的。（This is Celeste's psychiatric report. She has severe paranoia and sleepwalking disorder. She imagined all of it.）\n▲众人震惊。\n▲莱恩接过检测报告，有些惊讶。\n布拉姆：她一直怀疑我会出轨，怀疑我会害她。（叹气）可是我没有。（She’s constantly convinced I'm unfaithful, that I'm trying to destroy her. God knows I've done nothing of the sort.）\n伊丽莎白（惊讶）：这些事情，你为什么不早告诉我们？（Why didn't you tell us sooner?）\n布拉姆（难过）：你们身体不好，我不想让你们担心——（鞠躬）是我没照顾好她。（You both have delicate health; I didn't want to burden you. It's my fault, I simply failed to protect her.）\n▲宾客盯着布拉姆，忍不住小声议论了起来。\n宾客1：教父果然是重情重义，塞莱特斯夫人这样对待他，他还不离不弃！（The Godfather is a saint. His wife treats him like dirt, and he still covers for her!）\n宾客2：是啊，教父能成为伯爵的女婿，人品肯定很好。（Yeah. If the Count made him his son-in-law, he must be a good man.）\n▲塞莱特斯一把将报告抢过来，直接撕碎了。\n塞莱特斯（咆哮）：我没疯！是他在撒谎——（I'm not crazy! He's lying—）\n▲莱恩打量着一眼看热闹的宾客，立刻呵斥塞莱特斯。\n莱恩：够了！塞莱特斯注意你的言行！（Enough! Celeste, watch your behavior!）\n▲伊丽莎白立刻抓住了塞莱特斯的手，示意她别再说了。\n莱恩（冷脸）：行了，立刻收拾好，出来接待宾客，别再闹些笑话让人误会！（看向宾客）都散了吧。（All right. Clean yourself up and come greet the guests. Stop embarrassing us. Everyone, please, enjoy yourselves—nothing to see here.）\n▲宾客们十分给莱恩的面子，离开了。\n塞莱特斯（着急）：爸爸——（Dad—）\n▲莱恩拽着塞莱特斯离开。\n莱恩（呵斥）：跟我过来，我有话跟你说。（Come with me. I need to talk to you.）\n▲所有人都离开之后，布拉姆一抬手将桌角的花瓶狠狠摔碎。\n布拉姆（恨）：一群杂碎，早晚有一天，我要将你们全部踩在脚底！（A bunch of trash. One day, I'll put every one of you under my feet!）\n▲娜塔莉亚吓了一跳，连忙低下头去。\n娜塔莉亚（恭敬）：教父，抱歉，是我的鲁莽给您惹麻烦了。（Godfather, I'm sorry. My recklessness caused you trouble.）\n▲布拉姆一腔火气，拿起桌上的枪抵着娜塔莉亚的脑袋。\n布拉姆（呵斥）：到底是有意的，还是无意的！（Was it on purpose or not?）\n▲娜塔莉亚惊慌地举起双手，盯着布拉姆的眼睛。\n布拉姆（审视）OS：当猎物脱离掌控时，我一定会亲手杀掉她！我讨厌这种失控感！（When prey slips out of control, I'll kill her myself. I hate losing control.）\n▲布拉姆突然开枪，子弹射出擦着娜塔莉亚的脸颊而过，打碎了花瓶，娜塔莉亚尖叫了一声，连忙开口。\n娜塔莉亚（惊呼）：教父，我承认，我是故意的！（Godfather, I admit it. I did it on purpose!）\n布拉姆（呵斥）：你为什么要这么做！（Why did you do it?）\n娜塔莉亚（慌乱）：我想得到您，我想取代塞莱特斯，（一把抱住布拉姆）您不是说给我一个机会吗？（I want you. I want to replace Celeste. Didn't you say you'd give me a chance?）\n▲布拉姆震惊。\n\n\n第二十四集\n24-1\n日  内   布拉姆房间\n人物 布拉姆  娜塔莉亚 \n▲布拉姆惊讶地看着娜塔莉亚。\n布拉姆（惊讶）：什么？（What did you just say?）\n▲娜塔莉亚抬头看着布拉姆。\n娜塔莉亚（诚恳）：塞莱特斯根本就不懂您，也配不上您，您这么强大、睿智，我实在太仰慕您了，才会铤而走险抓住这个机会，我以为……（Celeste doesn't understand you. She doesn't deserve you. You're so powerful and smart. I admire you so much that I took this risk. I thought...）\n▲布拉姆盯着娜塔莉亚的眼睛，握着枪的手垂了下去，揉了揉额头。\n布拉姆（放缓语气）：你以为在今天跟我上床，被发现了，我就会和塞莱特斯离婚，娶你是吗？（You thought if you slept with me today and we got caught, I'd divorce Celeste and marry you?）\n▲娜塔莉亚握住布拉姆的枪，指着自己的脑袋。\n娜塔莉亚（认真）：您杀了我吧，杀了我证明您的清白！（Then pull the trigger! Kill me right now to prove you had nothing to do with this!）\n▲布拉姆惊讶，猛地收回了枪。\n布拉姆（拍娜塔莉亚的脸）：我不会杀你，你先回去陪戴安娜吧，我会处理好。（轻轻拥抱）记住，在这里，只有我能保护你。（I won't kill you. Go keep Diana company. I'll handle it. Remember, in this place, only I can protect you.）\n▲娜塔莉亚红着眼睛点了点头，转身离开，镜头特写，娜塔莉亚走到门口时，摊开手心，掌心里面躺着一把金色的钥匙。\n▲布拉姆盯着娜塔莉亚的背影，冷笑了一声。\n布拉姆OS：两个女人以为联手就能毁掉我？做梦？（Two women think they can team up and destroy me? Dream on.）\n24-2\n日  外 花园\n人物  莱恩  伊丽莎白   塞莱特斯  布拉姆   管家\n▲塞莱特斯焦急地看着父母。\n塞莱特斯：爸爸妈妈你们刚刚为什么不帮我，我真的没病！（Mom, Dad, why didn't you help me just now? I'm really not sick!）\n莱恩：塞莱特斯，你先冷静，我们并没有看到布拉姆出轨，如果为了他跟别的女人说话而大动干戈，只会显得我们无礼。（Celeste, calm down. We didn't see Bram cheating. Making a scene because he talked to another woman would just make us look rude.）\n伊丽莎白：是啊，塞莱特斯，你不该在大庭广众之下伤了布拉姆的脸面，况且那女人只是他孩子的心理医生，别人会觉得你是个恶毒的后妈。（Yes, Celeste. You shouldn't embarrass Bram in public. Besides, that woman is just his child's therapist. People will think you're a cruel stepmother.）\n塞莱特斯（绝望）：爸爸妈妈，你们不相信我？（Mom, Dad, you don't believe me?）\n伊丽莎白（安抚）：塞莱特斯，一个心理医生，你不喜欢她，找个机会把她赶走就好了！（Celeste, she's just a therapist. If you don't like her, find a chance to get rid of her.）\n莱恩（抚摸塞莱特斯的头发）：你自小性格要强，肯定受不了丝毫委屈，教父现在权势滔天，你应该获取他的欢心，况且他对你很好，别无理取闹了。（You've always been strong-willed. You can't stand the slightest grievance. The Godfather is powerful now. You should win his favor. Besides, he treats you well. Stop making a fuss.）\n▲塞莱特斯绝望的后退了半步。\n塞莱特斯：不，不是这样的。（No, it's not like that.）\n莱恩（心疼）：你放心，爸爸会联系最好的医生治疗你的病！（Don't worry. I'll contact the best doctor to treat you!）\n▲镜头上拉：布拉姆站在二楼的窗户，眼神冰冷地盯着他们。\n布拉姆（狠辣）OS：这场捕猎游戏，我玩儿够了，该结束了！（I'm done playing this hunting game. It's time to end it.）\n\n\n第二十五集\n25-1\n夜  内   宴会厅门口\n人物 塞莱特斯   伊丽莎白  下人若干 莱恩 布拉姆   娜塔莉亚\n▲莱恩和伊丽莎白站在门口，布拉姆站在二人面前，莱恩严肃地盯着布拉姆。\n莱恩（温和）：布拉姆，你对塞莱特斯的好，我们看在眼中，但她就是大小姐脾气，希望你多多担待，不要跟她一般见识。（Bram, we know you care for Celeste deeply. But she’s always had a headstrong, spoiled streak. Do be gentle with her, and try not to take her outbursts to heart.）\n伊丽莎白（温和）：夫妻之间，要互相体谅。（Married couples need to understand each other.）\n▲众目睽睽下，布拉姆握着的拳头青筋暴起。\n布拉姆（冷漠）OS：一群虚伪的贵族，凭什么高高在上教训我，等我拿到了他所有的资源，我一定把他丢去喂鲨鱼！这一天马上就要到来了！（A bunch of hypocritical nobles. What gives you the right to lecture me? Once I get all his resources, I'll feed him to the sharks. That day is coming soon.）\n▲布拉姆弯着脊梁低头道歉。\n布拉姆：您放心，我很爱她，我保证会照顾好她的。（Don't worry. I love her very much. I promise I'll take good care of her.）\n▲塞莱特斯瞧着布拉姆的样子，害怕地死死握住了伊丽莎白的手。\n伊丽莎白（心疼）：布拉姆，塞莱特斯状态不太好，不如让她先跟我们回去住几天？（Bram, Celeste isn't doing well. Why not let her come home with us for a few days?）\n▲塞莱特斯的眼睛都亮了起来，娜塔莉亚不动声色地看向这边。\n娜塔莉亚OS：只要塞莱特斯离开了这里，我们的计划就成功了！（If Celeste leaves this place, our plan works!）\n▲布拉姆伸手将塞莱特斯搂在怀中，绅士地开口。\n布拉姆：妈，塞莱特斯还需要接受治疗，我比较了解她的情况，如果塞莱特斯现在离开，可能会中断她的治疗。（Mom, Celeste still needs treatment. I know her condition better. If she leaves now, it could interrupt her treatment.）\n莱恩（点头）：布拉姆说得有道理，别影响塞莱特斯的治疗。（Bram has a point. Don't interrupt her treatment.）\n▲塞莱特斯眼眶瞳孔，伊丽莎白不舍得吻了吻她的脸颊，安抚她。\n伊丽莎白：听话，好好治病，等你状态好了，妈妈来接你。（Be good. Do what the doctors say. Once you're better, I'll come get you.）\n塞莱特斯（绝望）：妈妈，我真的没病——（Mom, I'm really not sick—）\n布拉姆（搂住塞莱特斯）：塞莱特斯，听话，太晚了，让爸爸妈妈回去好好休息吧。（Celeste, be good. It's late. Let Mom and Dad go home and rest.）\n▲伊丽莎白松开了塞莱特斯，挽着莱恩的手上车，布拉姆带着微笑搂着塞莱特斯目送二人，车子离开之后，布拉姆突然伸手捏住了塞莱特斯的脖子。\n布拉姆（眼神阴冷）：关门，我的夫人需要接受治疗了！（Lock the gates. My wife is due for her treatment.）\n\n\n第二十六集\n26-1\n夜  内   宴会厅/走廊\n人物 塞莱特斯   下人若干  布拉姆   娜塔莉亚\n▲安保瞬间关上了庄园的大门，整个庄园被围了起来，布拉姆掐着塞莱特斯的脖子，逼迫着塞莱特斯上楼。\n塞莱特斯（惊呼）：松开我！爸爸——妈妈，救命——（Let me go! Dad—Mom, help—）\n▲娜塔莉亚惊愕地看着眼前的场景，她连忙站在旁边，给布拉姆让路，塞莱特斯路过娜塔莉亚的时候，眼神紧紧盯着娜塔莉亚，又看着屋内的佣人们，佣人们低着头不敢抬头。\n▲镜头特写：其中一个女佣退到了人群后面，悄无声息地往门口走。\n▲娜塔莉亚瞧着布拉姆将塞莱特斯拉入了房间狠狠关上了门，她连忙转头往地下室方向跑。\n娜塔莉亚（紧张）OS：钥匙已经到手了，布拉姆应该不会杀了塞莱斯特，我得趁乱先救出姐姐！（I have the key. Bram probably won't kill Celeste. .. I have to take advantage of this chaos and get my sister out NOW.）\n26-2\n夜   内   塞莱特斯房间\n人物：女佣   布拉姆  塞莱特斯  \n▲布拉姆将塞莱特斯拉入了房间狠狠摔在了床上，他扯松了领带，死死盯着塞莱特斯。\n▲塞莱特斯惊恐后退。\n塞莱特斯：你要干什么——你敢对我动手，我父母不会放过你的！（What are you doing? If you touch me, my parents won't let you get away with it!）\n▲布拉姆笑着看着塞莱特斯。\n布拉姆（笑容诡异）：塞莱特斯，我怎么舍得杀了你？只是我不明白，我这么爱你，你为什么要害我！（Celeste, how could I bear to kill you? I just don't understand. I love you so much, why did you try to hurt me?）\n塞莱特斯（惊恐）：我没有害你！是你自己和娜塔莉亚不清不白，难道还不允许我告诉我父亲吗？（I didn't hurt you! You're the one fooling around with Natalia. Am I not allowed to tell my father?）\n布拉姆（抓住塞莱特斯的头发）：是你在酒里下毒，还带着人捉奸，害我在大庭广众之下被你父亲训斥！还不算害我吗？（You spiked my drink! You staged a scandal to catch me red-handed, and you let your father humiliate me in front of everyone! You call that not trying to ruin me?）\n塞莱特斯（惊恐真正）：我没有！（I didn't!）\n布拉姆（膝盖压住塞莱特斯的腿）：怎么？你想离开我？（What’s the matter? Dying to run away from me?）\n塞莱特斯（尖叫）：啊——（Ah—）\n布拉姆（逼问）：你是不是看不起我？是不是觉得我配不上你？（You look down on me, don't you?! You think a high-and-mighty heiress is too good for a man like me?）\n\n\n第二十七集\n27-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲塞莱特斯被压得表情扭曲。\n塞莱特斯（痛苦）：不——我没做过！（No—I didn't do it!）\n▲布拉姆一把将塞莱特斯从床上拉起来。\n布拉姆（冷笑）：不承认是吧？（Not admitting it, huh?）\n▲布拉姆将她摁在了窗口，只见庄园里面有个女佣悄无声息地靠近围墙。\n布拉姆（冷冽）：那是你的信使吗？（举起枪对准女佣的后背）（Is that your messenger?）\n塞莱特斯（惊恐）：不，别杀她！（No, don't kill her!）\n▲布拉姆冷笑，一枪崩了女佣（枪声，窗外鸟雀惊飞，避免直给暴力镜头），塞莱特斯也跟着尖叫了一声。\n▲切镜。\n▲娜塔莉亚站在地下室的入口，她正打算下去。\n娜塔莉亚OS：等我救出姐姐，再去救塞莱特斯！（Once I save my sister, I'll go save Celeste!）\n▲突然，外面响起了枪声，娜塔莉亚连忙转身走向了塞莱特斯的房间。\n娜塔莉亚OS：塞莱特斯！——（Celeste!—）\n▲娜塔莉亚转身向楼上跑去。\n▲切镜。娜塔莉娅刚跑到塞莱斯特门口，突然戴安娜从房间里面走了出来，一把抓住了娜塔莉亚的手，娜塔莉亚惊愕地低头看着戴安娜。\n戴安娜（乖巧）：别过去！（Don't go over there!）\n▲娜塔莉亚惊讶。\n▲切镜\n▲屋内。\n▲布拉姆摁着塞莱特斯的脖子。\n布拉姆（嗤笑）：夫人，我知道娜塔莉亚是谁，她是玛莉的妹妹对吗？（Ma'am, I know who Natalia is. She's Mary's sister, right?）\n▲塞莱特斯惊恐地看着布拉姆。\n塞莱特斯（紧张）：我，我不知道你在说什么！（I—I don't know what you're talking about!）\n▲布拉姆拽住她的头发。\n布拉姆（嘲讽）：夫人，你居然把希望放在一个刚刚毕业的心理医生身上，她的确有些小聪明，可惜，柔弱的像是一只兔子，毫无威胁力！（Ma'am, you put your hope in a fresh-out-of-school therapist. She's a little smart, but weak as a rabbit. No threat at all!）\n▲说着，布拉姆摁住塞莱特斯的脖子，让她趴在窗边上，逼她看着死在地上的女佣，一字一句地威胁。\n布拉姆（残忍）：你猜，我明明什么都知道，为什么还要放过娜塔莉亚？（蛊惑）因为她诚实，夫人，你诚实吗？（Guess why I let Natalia live when I know everything? Because she's honest. Are you honest, ma'am?）\n▲塞莱特斯不可置信地盯着布拉姆。\n塞莱特斯OS：娜塔莉亚出卖我？（Natalia sold me out?）\n【闪回14-1】\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n【闪回22-1】\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n【闪回结束】\n▲塞莱特斯握紧拳头。\n塞莱特斯OS：娜塔莉亚每次都没有按照计划行事，难道她真的为了保命牺牲我……（Natalia never followed the plan. Did she really sacrifice me to save herself...）\n▲布拉姆盯着塞莱特斯的眼睛。\n布拉姆（蛊惑）：塞莱特斯，我比你的父母更疼爱你，他们都不管你，只有我护着你，告诉我，是不是有人蛊惑你？（Celeste, I love you more than your parents do. They don't care about you. Only I protect you. Tell me, did someone turn you against me?）\n▲塞莱特斯惊恐地摇头，不肯说。\n▲布拉姆松开了塞莱特斯拿出了一支药剂，他推动针管，药水喷出来了些。\n布拉姆（威胁）：知道这是什么吗？（Know what this is?）\n▲塞莱特斯惊恐后退，布拉姆一步一步逼近。\n布拉姆（阴沉）：放心，不死，只是会麻痹神经，颤抖，抽搐，瘫痪……（Relax... it won't kill you. It just rots your nervous system from the inside—first come the shakes, then the spasms, until you're completely paralyzed.）\n塞莱特斯（惊恐）：不！我说！我什么都告诉你！（No! I'll talk! I'll tell you everything!）\n\n\n第二十八集\n28-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲布拉姆满意地看着塞莱特斯。\n塞莱特斯：是娜塔莉亚，她——（It's Natalia. She—）\n▲外面突然传来了戴安娜的尖叫声。\n戴安娜vo：啊——（Ah—）\n▲紧接着传来花瓶摔碎的声音。\n娜塔莉亚vo：小姐！请您冷静下来。（Miss Diana! Please calm down.）\n戴安娜（尖叫）：妈妈——我要妈妈——（Mommy—I want Mommy—）\n娜塔莉亚（敲门）：教父！不好了！小姐发病了，我需要医生的帮助！！（Godfather! Something's wrong! She's having an episode. I need a doctor!!）\n▲布拉姆将注射器放下，转身往外走。\n布拉姆：老实待着！（Stay right there!）\n▲布拉姆大步流星地走了出去，塞莱特斯捂着心口，泪流满面。\n28-2\n夜  内   戴安娜房间\n人物  戴安娜  医生  娜塔莉亚  布拉姆\n▲戴安娜躺在床上，闭着眼睛，娜塔莉亚和布拉姆站在旁边，医生正在收拾器材。\n医生：教父，小姐的情况不太稳定，不能受到刺激。（Godfather, Diana's still not doing well. We need to keep her calm.）\n▲布拉姆点了点头，医生离开了，布拉姆轻轻抚摸着戴安娜的额头，轻吻了她的额头，眼中流露出慈爱。\n布拉姆（心疼）：我可怜的女儿……（My poor daughter...）\n▲娜塔莉亚盯着戴安娜。\n【闪回28-3】\n夜 内  走廊\n人物  娜塔莉亚  戴安娜\n▲塞莱特斯的房间里面传来塞莱特斯惊恐的声音。\n塞莱特斯vo：不，别杀她！我说！我什么都告诉你！（No, don't kill her! I'll talk! I'll tell you everything!）\n▲娜塔莉亚着急地走向了门口，突然，戴安娜尖叫了一声。\n戴安娜（尖叫）：啊——啊！我要妈妈——（Ah—ah! I want Mommy—）\n▲娜塔莉亚回头，戴安娜突然失控，用力打碎了花瓶。\n【闪回结束】\n▲娜塔莉亚低声安抚布拉姆。\n娜塔莉亚：教父，别担心。上帝会保佑小姐的。（Godfather, don't worry. God will protect her.）\n▲布拉姆看向娜塔莉亚。\n布拉姆（严肃）：想不想知道戴安娜是什么时候开始生病的？（站了起来）跟我来，我现在告诉你。（Want to know when Diana first got sick? Come with me. I'll tell you now.）\n▲娜塔莉亚惊讶，娜塔莉亚站了起来，跟着布拉姆走出房间。\n28-4 \n夜  内  地下室门口\n人物  布拉姆  娜塔莉亚\n▲布拉姆和娜塔莉亚站在了地下室门口，地下室上绑满了铁链。\n布拉姆：真相就在这里，你不是早已拿到了钥匙，打开吧。（The truth is right here. You already got the key, didn't you? Open it.）\n▲娜塔莉亚看到地下室的门，眼神惊愕，心跳加速。\n\n三卡\n\n\n第二十九集\n29-1\n夜  内   收藏室\n人物    娜塔莉亚  布拉姆\n▲娜塔莉亚盯着地下室的门，里面安安静静。\n娜塔莉亚（担心）OS：怎么没声了？难道姐姐已经遇害了？（Why is it quiet? Is my sister already dead?）\n▲布拉姆搂着娜塔莉娅的腰，从裙子腰封里摸出钥匙，打开了地下室旁边的一道门。\n布拉姆（看娜塔莉亚）：进来吧。（Come on in.）\n娜塔莉亚（惊讶）：这是……（This is...）\n▲布拉姆打开灯，娜塔莉亚被眼前的场景惊呆了，只见收藏室里面，全是玛莉的照片，婚纱照，合照，抱着孩子的照片，还有全家福。\n布拉姆（抚摸照片）：这是我的妻子玛莉，是戴安娜的母亲。（This is my wife, Mary. Diana's mother.）\n▲娜塔莉亚看着墙上的照片，有一张是玛莉抱着戴安娜的照片。(定格照片转场）\n【闪回】\n日  内  破旧房屋\n人物  小玛莉  小娜塔莉亚\n▲小玛莉抱着小娜塔莉亚。\n小娜塔莉亚（天真）：被姐姐抱在怀里，总是很安心！（Being in your arms always makes me feel safe!）\n小玛莉：那姐姐就一直抱着你。（Then I'll keep holding you.）\n【闪回结束】\n▲娜塔莉亚捏着裙摆，打量着照片，故意露出了惊讶的神色。\n娜塔莉亚（紧张）：这么多照片，天啊，教父，您一定很爱她吧。（So many photos. Godfather, you must have loved her so much.）\n布拉姆（表情眷恋）：是的，我很爱她，我们在一起十年，她跟我在一起的时候，我一无所有，是她鼓励我，我才有了今天。（Yeah, I loved her. We were together for ten years. I had nothing when we met, but she always believed in me. I wouldn't be where I am today without her.）\n▲娜塔莉亚看着照片，布拉姆观察着娜塔莉亚的表情，嘴角勾起了一个弧度，他深情地抚摸着全家福。\n布拉姆：在塞莱特斯没出现之前，我们曾是最幸福的一家人，可我的妻子太善良了，相信了贵族的谎言，最后被……（Before Celeste came, we were the happiest family. But my wife was too kind. She believed the nobles' lies, and in the end she was...）\n▲布拉姆哽咽了一下，娜塔莉亚回头看向了布拉姆。\n娜塔莉亚（惊讶）：您别这样，她看见您难过，也会难过的。（You don't have to do this. She wouldn't want to see you hurting like this.）\n布拉姆（落泪）：我们不过是权贵的玩物，只能向权贵低头。（抚摸着全家福）我娶塞莱特斯是怕他们继续出手伤害我的女儿。（We're just toys to the powerful. We have no choice but to do what they say. I married Celeste because I was afraid they'd hurt my daughter again.）\n▲这时，一张照片从全家福里面落了下来，照片上：塞莱特斯站在玛莉面前，玛莉红着眼睛望着塞莱特斯。娜塔莉亚惊愕地看着照片。\n娜塔莉亚OS：这是……塞莱特斯没跟我说过她见过姐姐，难道之前的话是在说谎？（This is... Celeste never told me she met my sister. Was she lying before?）\n▲布拉姆观察着娜塔莉亚的表情，捡起了照片。\n布拉姆（悲伤）：娜塔莉亚，我大概知道你是谁了，戴安娜已经失去了母亲了，不能再失去父亲了对吗？（Natalia, I think I know who you are. Diana already lost her mother. She can't lose her father too, right?）\n▲娜塔莉亚一步步后退。\n娜塔莉亚（惊愕）：什么？您知道我是谁？（What? You know who I am?）\n\n\n第三十集\n30-1\n夜  内  画室\n人物  娜塔莉亚  布拉姆\n▲布拉姆步步紧逼，娜塔莉亚步步后退。\n娜塔莉亚：我不太明白您在说什么，我只是……（I don't really know what you mean. I'm just...）\n布拉姆（打断）：嘘，你不想说，可以不说。（Shh. If you don't want to say it, you don't have to.）\n▲布拉姆将塞莱特斯和玛莉的合照放在了娜塔莉亚的手中。\n布拉姆（警告）：娜塔莉亚，权贵绝不会将我们当作人看待，即便我功成名就，伯爵仍然会把我当狗一样训斥，你野心勃勃，你觉得他们会怎么样对你。（People at the top don't see us as equals, Natalia. I built an empire, yet the Count still treats me like a dog on a leash. You're hungry for power, aren't you? What makes you think they won't crush you like a bug?）\n▲娜塔莉亚抵在了墙上，盯着布拉姆。\n娜塔莉亚（紧张）：教父，您会保护我的，对吗？（Godfather, you'll protect me, right?）\n▲布拉姆抚摸着娜塔莉亚的脸颊，一字一句地说。\n布拉姆（蛊惑）：你和我的妻子玛丽一样天真，即便是为了她，我也会保护你。你、我、戴安娜，我们才是一家人，对吗？（You're as naive as my wife Mary. Even for her sake, I'll protect you. You, me, Diana, we're the real family, right?）\n▲娜塔莉亚表情震惊。\n▲布拉姆却后退了一步。\n布拉姆（温和）：娜塔莉亚，找一找有没有治疗戴安娜的方法吧，我只想我的女儿快点好起来。（Natalia, look for a way to cure Diana. I just want my daughter to get better.）\n▲说完之后，布拉姆转身离开了，他站在门口时，又补了一句。\n布拉姆（警告）：对了，千万别靠近地下室。（扬了扬钥匙）这个，还是我来保管比较好。（By the way, stay away from the basement. As for this? It stays right where it belongs with me.)\n娜塔莉亚（点头）：是。（Yes.）\n▲布拉姆关上门出去了，娜塔莉亚盯着墙上的照片 ，轻轻抚摸了玛莉的脸颊。\n娜塔莉亚（自言自语）：如果失去父亲，戴安娜会很痛苦吧，到底谁在说谎……（If she loses her father, Diana will be devastated. Who's really lying...）\n▲布拉姆站在门口，从门缝里面看着娜塔莉亚的表情，嘴角勾起了一道弧度。\n30-2\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆 女佣\n▲娜塔莉亚正在给戴安娜拿早餐，塞莱特斯走入餐厅，眼神冰冷地盯着娜塔莉亚，她狠狠撞了一下娜塔莉亚，冷声呵斥。\n塞莱特斯：怎么？你真想将我取而代之。（What? You really want to take my place?）\n娜塔莉亚（恨）：夫人拿我做棋子玩得开心吗？（Did you enjoy using me as your pawn, ma'am?）\n▲塞莱特斯一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯：贱人！果然是你想害我！（You bitch! I knew you wanted to hurt me!）\n▲娜塔莉亚举起杯子将牛奶全部泼到了塞莱特斯的脸上。\n娜塔莉亚（愤怒）：夫人，我是戴安娜的心理医生，不是任你打骂的奴仆！（Ma'am, I'm Diana's therapist, not some punching bag for you to abuse!）\n▲众人震惊！\n▲镜头特写：布拉姆站在楼梯间静观其变。\n\n\n第三十一集\n31-1\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆\n▲布拉姆站在楼梯间，并没有阻止二人，眼神复杂地看着她们。\n▲塞莱特斯被泼了一脸。\n塞莱特斯（尖叫）：你敢泼我！你疯了吗？（You dare throw that at me? Are you insane?）\n娜塔莉亚（冷眼）：夫人，这只是给你一个教训，狂妄自大的人，将为自己的行为付出代价。（Ma'am, that's a lesson. Arrogant people pay for their behavior.）\n塞莱特斯：不过是个卑贱的下等人，敢教训我，你找死——（You low-class nobody. You dare lecture me? You're dead—）\n▲塞莱特斯擦了一把脸上的牛奶，伸手掐住了娜塔莉亚的脖子。\n塞莱特斯：贱人！我跟你拼了！（You bitch! I'll tear you apart!）\n▲娜塔莉亚也不甘示弱，抓起牛奶杯砸在了塞莱特斯的后背上。\n娜塔莉亚：放开我——（Let me go—）\n▲这时，布拉姆匆匆忙忙地走了下来。\n布拉姆（呵斥）：住手！（Stop!）\n▲布拉姆立刻将塞莱特斯的手掰开，将娜塔莉亚拉到自己的身后，冷眼盯着塞莱特斯。\n布拉姆：够了！一个心理医生，一个贵族夫人，竟然在餐厅打了起来，你们不觉得丢人吗？（Enough! A therapist and a noble lady fighting in the dining room. Aren't you ashamed?）\n塞莱特斯（疯）：丢人？（指着娜塔莉亚）这个贱人勾引你，想把我赶出这个家门，我还有什么脸面？（Ashamed? This bitch seduces you and wants to throw me out. What dignity do I even have left?）\n▲布拉姆一把抓住了塞莱特斯，不让她打娜塔莉亚。\n布拉姆（看娜塔莉亚）：你，回去照顾戴安娜。（You. Go take care of Diana.）\n▲娜塔莉亚红着眼睛瞪了塞莱特斯一眼，转身离开了。\n塞莱特斯：贱人！你别走！你给我站住！（Bitch! Don't walk away! You get back here!）\n▲布拉姆死死抓住了塞莱特斯的手臂，眼神兴奋了起来。\n布拉姆OS：互相撕咬吧，愚蠢的猎物们，真是越来越有趣了！（Tear each other apart, you stupid prey. This is getting more and more fun!）\n▲娜塔莉亚站在楼梯口，和塞莱特斯对视了一眼。\n31-2\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲夜里，塞莱特斯睁开眼睛，突然发现自己被绑在了椅子上，她挣扎了一下，布拉姆站在阴影中看着她。\n布拉姆（阴冷）：你醒了。（You're awake.）\n\n\n第三十二集\n32-1\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯惊恐地盯着布拉姆，布拉姆把玩着一柄教父权杖，低头看着塞莱特斯。\n塞莱特斯（挣扎）：布拉姆……你想干什么？（Bram... what do you want?）\n▲布拉姆一步一步走向了塞莱特斯。\n布拉姆（嗤笑）：你知道我等这一天等了多久吗？（抚摸塞莱特斯的脸颊）原来俯视贵族是这种感觉。（Do you know how long I've waited for this day? So this is what it feels like to look down on a noble.）\n塞莱特斯（惊愕）：布拉姆！我们是夫妻！你为什么想杀了我？（Bram! We're married! Why do you want to kill me?）\n布拉姆（捏着塞莱特斯的下巴）：夫妻？你从来就没有把我当作你的丈夫！（呵斥）被自己看不起的下等人掌控在手心的滋味如何？（Married? You never treated me as your husband! How does it feel to be in the hands of someone you looked down on?）\n塞莱特斯（惊讶）：我什么时候看不起你了？（When did I ever look down on you?）\n▲布拉姆掐住塞莱特斯的脖子。\n布拉姆（愤怒呵斥）：还敢说没有！你喝咖啡时优雅的德行，简直令我作呕！用餐时那套该死的礼仪，连擦嘴都要扭捏作态！你替我整理领带，就像在纠正一个不懂规矩的蠢货！你的每一个动作都在讽刺我，让我感觉自己像个不被驯养的野狗！（Still denying it! The way you drink coffee makes me sick! Those damn table manners—even wiping your mouth is a performance! When you fix my tie, it's like you're correcting a stupid fool who doesn't know the rules! Every move you make mocks me and makes me feel like an untamed dog!）\n▲塞莱特斯惊呆了，她有些窒息。\n塞莱特斯（挣扎）：你误会了！这些想法令我震惊！（You misunderstood! I'm shocked you'd think that!）\n▲布拉姆用力掐着塞莱特斯的脖子。\n布拉姆（愤怒）：什么误会？你那副天生高贵的嘴脸，早就把答案写在了脸上！（Misunderstood? That born-noble look on your face already gave the answer!）\n▲他突然松开塞莱特斯，蹲在了塞莱特斯的面前，头靠在了塞莱特斯的腿上。\n布拉姆（温和）：塞莱特斯，其实你也很崇拜我对不对？我现在已经是个合格的贵族了对吗？（Celeste, you admire me too, don't you? I'm a proper noble now, right?）\n▲塞莱特斯惊恐地看着趴在自己腿上的布拉姆，浑身发抖。\n塞莱特斯（惊恐）：求求你，放过我吧——（Please, let me go—）\n▲布拉姆突然站起来抓住塞莱特斯的头发，用枪抵着她的额头。\n布拉姆（愤怒）：说啊！说你也很崇拜啊！说你仰慕我！说啊——（Say it! Say you admire me! Say you worship me! Say it—）\n▲塞莱特斯吓得尖叫，布拉姆猛地松开了她。\n布拉姆（笑容诡异）：你们不是都好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're all curious what's in the basement, aren't you? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n\n\n第三十三集\n33-1\n夜   内   塞莱特斯的房间\n人物 娜塔莉亚 布拉姆  塞莱特斯\n▲布拉姆转身离开了，塞莱特斯吓得瘫软到了椅子上。\n塞莱特斯（咆哮）：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n▲布拉姆冷笑了一声，拿出厚厚的一叠文件递给了塞莱特斯。\n布拉姆（笑）：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲塞莱特斯盯着那些文件，脸色惨白。\n塞莱特斯（惊愕）：你，你什么时候做的这些？我怎么不知道？（When... when did you do all this? How did I not know?）\n布拉姆（得意）：就在你和娜塔莉亚斗的你死我活的时候。（高高在上）哦，对了，娜塔莉亚是我故意用来分散你的注意力的！（While you and Natalia were tearing each other apart. Oh, and Natalia? I used her to distract you on purpose!）\n33-2\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲字幕：第二天。\n字幕：第二天。（The next day.）\n▲别墅里面突然响起了女佣的尖叫声。\n女佣（尖叫）：啊！夫人，夫人她死了——（Ah! Mrs. Blackwood is dead!—）\n▲娜塔莉亚和布拉姆同时从两道不同的门里面出来，二人冲到了塞莱特斯的房间门口，只见塞莱特斯浑身是血躺在了地上。\n▲娜塔莉亚惊愕地盯着眼前的场景。\n娜塔莉亚（捂着嘴巴）OS：噢，我的老天！（Oh my God!）\n▲布拉姆冷着脸站在门口。\n布拉姆（咬牙切齿）OS：该死！她怎么就死了，还被人看见了，简直打乱了我所有的计划！（Damn it! Why did she die, and someone saw her? It ruins all my plans!）\n▲布拉姆要上前检查。\n布拉姆（看女佣）：报警吧！（Call the police!）\n布拉姆（冷静）OS：塞莱特斯死了也是一件好事情！我既保住了和伯爵的合作，又摆脱了她！（Honestly, Celeste dying might be a blessing in disguise. It keeps my alliance with the Count intact—and cuts loose my biggest dead weight）\n▲娜塔莉亚一把抓住了布拉姆的手臂，阻挡他前去检查。\n娜塔莉亚：教父，塞莱特斯不明不白死在了庄园，您是最后一个见她的人，如果您现在报警，会被怀疑的！（Godfather, Celeste died mysteriously in the estate. You were the last to see her. If you call the police now, you'll be suspected!）\n▲布拉姆抬了下手臂，示意佣人停止报警，佣人恭敬站定，布拉姆回头看向了娜塔莉亚。\n布拉姆（冷冽）：你的意思是？（What do you mean?）\n娜塔莉亚（担忧）：无论如何，您不能进入现场，一定要确保您没有丝毫的嫌疑！（Either way, you can't enter the scene. Make sure you're not a suspect!）\n▲布拉姆盯着娜塔莉亚，眼神危险。\n布拉姆OS：有意思，小兔子，我会将你彻底拉上我的船！（Interesting, little rabbit. I'll make sure you're in too deep to walk away.）\n▲布拉姆轻轻捏了一下娜塔莉亚的脸颊，似笑非笑地问道。\n布拉姆（微笑）：娜塔莉亚，你觉得怎么做更好？（Natalia, what do you think we should do?）\n▲娜塔莉亚看了一眼地上的尸体。\n娜塔莉亚（鼓起勇气）：不如将她埋了，就算她是装的，埋在地里之后，她也彻底死透了。（Why not bury her? Even if she's faking, once she's in the ground, she's dead for real.）\n▲布拉姆惊讶地看着娜塔莉亚。\n\n\n第三十四集\n34-1\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲布拉姆看了一眼塞莱特斯的尸体又看向了娜塔莉亚。\n布拉姆（蛊惑）：很好！（抚摸娜塔莉亚的脸颊）娜塔莉亚，你不是想要将塞莱特斯取而代之吗？给你一个机会。（Good. Natalia, didn't you want to replace Celeste? I'll give you a chance.）\n娜塔莉亚（惊愕）：什么？（What?）\n布拉姆（整理她的头发）：去把塞莱特斯的尸体装起来，抛入海中——我就娶你。（Bag up Celeste's body and throw it into the sea—and I'll marry you.）\n▲娜塔莉亚惊愕地看着布拉姆。\n娜塔莉亚（惊讶）：抛入海中？不是活埋吗？（Throw it into the sea? Not bury her?）\n▲布拉姆拿出手枪，在手中把玩。\n布拉姆（嗤笑）：埋在土中会留下痕迹，毁尸灭迹不是更安全？（Burying leaves traces. Destroying the body is safer, isn't it?）\n娜塔莉亚（后退）：不，我不敢——（No, I can't—）\n▲布拉姆枪口抵在了娜塔莉亚的额头上，娜塔莉亚紧张地举起双手，一步一步走了进去。\n布拉姆（看女佣）：你看见了什么？（What did you see?）\n▲女佣颤抖地站在旁边。\n女佣（恭敬）：我什么都没有看到，夫人是在晚上失踪了的。（I didn't see anything. Mrs. Blackwood disappeared last night.)\n▲布拉姆看向了屋内，娜塔莉亚正在检查塞莱特斯的尸体。\n布拉姆：死了吗？（Is she dead?）\n▲娜塔莉亚摸着她的脉搏点了点头。\n布拉姆（吩咐）：那真是很可惜（冷冽）将血迹清理干净，把尸体装起来。（What a shame. Clean up the blood and bag the body.）\n▲布拉姆站在门口点了根雪茄，烟雾缭绕中看着娜塔莉亚擦拭血迹。\n▲娜塔莉亚跪在地上擦拭着，在擦到塞莱特斯身后的时候，借着塞莱特斯的掩盖悄无声息将一直录音笔藏在了自己的口袋里。\n34-2\n夜   外   海边\n人物 布拉姆  娜塔莉亚 塞莱特斯  神秘人\n▲娜塔莉亚满头大汗，费劲地将一个巨大的袋子推入了海中，布拉姆拿着相机拍下了娜塔莉亚抛尸的画面。\n布拉姆（嗤笑）OS：就算塞莱特斯是假死，现在也死透了！（Even if Celeste was faking, she's dead for real now!）\n▲娜塔莉亚走了回去，举起手。\n娜塔莉亚：教父，都按照您的吩咐做好了。（Godfather, it's done just as you ordered.）\n▲布拉姆伸手搂着娜塔莉亚的肩膀。\n布拉姆（笑）：做得好，娜塔莉亚，现在我们是一条绳子上的蚂蚱了！（伸手牵着娜塔莉亚）走吧，我未来的妻子。（Good job, Natalia. Now we're in this together. Come on, my future wife.）\n▲娜塔莉亚回头看了一眼海面，跟着布拉姆上车了。\n▲布拉姆的车刚刚离开，一个神秘人穿着潜水服，一个猛子潜入水底。\n\n\n第三十五集\n35-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆和娜塔莉亚刚刚走入客厅，便看见莱恩和伊丽莎白还有持枪安保站在屋内。\n布拉姆（惊讶）：爸妈，你们怎么来了？（看向安保）这是什么意思？（Mom, Dad, what are you doing here? What's the meaning of this?）\n▲莱恩冷着脸站了起来。\n莱恩：我们接到消息，说塞莱特斯不见了。（We got word that Celeste is missing.）\n▲娜塔莉亚惊愕地抬头，看向了莱恩和伊丽莎白，下意识地躲在了布拉姆的身后。\n布拉姆（故作惊讶）：这怎么可能……（How is that possible...）\n莱恩（呵斥）：布拉姆！就算你现在权势滔天，如果你真的伤害了我的女儿，我也会拼尽全力，咬下你一块肉来！（Bram! Even if you're powerful now, if you hurt my daughter, I'll fight with everything I have and take a piece of you with me!）\n▲伊丽莎白猛地站了起来，情绪激动。\n伊丽莎白（哽咽）：塞莱特斯在哪儿！把她还给我！（试探）你是不是把她关在了地下室？（Where's Celeste? Give her back to me! Did you lock her in the basement?）\n▲面对伊丽莎白的指责，布拉姆眼神冷了下去，看向了娜塔莉亚。\n布拉姆OS：娜塔莉亚，我本来想让你多活几天，看来你的死期到了！（Natalia, I wanted to let you live a few more days. Looks like your time is up.）\n▲布拉姆无声看向了角落的女佣，佣跑了出来，她抬手指着娜塔莉亚。\n女佣（情绪激动）：伯爵，夫人！是娜塔莉亚杀了夫人！并将夫人的尸体抛入了海中！（Count, Countess! Natalia killed your daughter! She threw the body into the sea!）\n▲所有人的目光瞬间聚集在了娜塔莉亚的身上，娜塔莉亚下意识后退。\n娜塔莉亚（惊慌）：不，不是我——（No, it wasn't me—）\n▲女佣举起了几张照片，照片1：娜塔莉亚蹲在屋内收拾塞莱特斯的尸体。照片2：娜塔莉亚将尸体挪出别墅，还有几张资料。\n女佣（大声）：娜塔莉亚是玛莉夫人的妹妹，她怀疑是夫人杀了玛莉夫人，所以杀了夫人！（Natalia is Mary's sister. She thought Celeste killed Mary, so Natalia killed Mrs. Blackwood!）\n▲众人看到这些照片惊呆了。\n娜塔莉亚（惊恐）：不，我没有，我没有杀夫人！（No, I didn't! I didn't kill her!）\n▲女佣突然指着娜塔莉亚的裤腿。\n女佣（大喊）：看啊，娜塔莉亚的裤子上还有血迹！（Look! There's blood on Natalia's pants!）\n▲娜塔莉亚低头看着自己裤腿上的血，又迅速看向了布拉姆。\n娜塔莉亚（不敢相信）：你骗我？你想让我帮你顶罪！（You lied to me? You want me to take the fall!）\n▲布拉姆一脸痛心，把枪指着娜塔莉亚的脑袋。\n布拉姆（愤怒）：你怎么能杀了我的妻子！我现在就杀了你——（How could you kill my wife? I'll kill you right now—）\n▲布拉姆盯着娜塔莉亚，故作悲痛。\n布拉姆（得意）OS：猎物，只配被我玩弄于股掌中！（Prey only deserves to be played in my hands!）\n塞莱特斯（呵斥）vo：住手！（Stop!）\n▲众人迅速转头看向了门口，只见塞莱特斯和焦恩带着持枪的警察闯了进来。\n伊丽莎白（惊愕）：上帝啊，我的宝贝，你还活着！（My God, my baby, you're alive!）\n▲众人震惊！\n\n\n第三十六集\n36-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲伊丽莎白冲了过去，一把抱住了塞莱特斯。\n伊丽莎白（心疼）：塞莱特斯——你还好吗？他们说你死了？（Celeste—are you okay? They said you were dead?）\n塞莱特斯（看向布拉姆）：爸爸妈妈，布拉姆想杀了我，是娜塔莉亚和她的养父救了我！（Mom, Dad, Bram tried to kill me. Natalia and her adoptive father saved me!）\n▲众人震惊，布拉姆不敢相信地看着眼前的场景。\n布拉姆：养父？（Adoptive father?）\n▲他的目光落在了焦恩的身上。\n布拉姆：是你？（It's you?）\n【闪回19-1】\n男客人（歉意）：教父，不好意思，我差点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n【闪回结束】\n▲布拉姆浑身发抖。\n布拉姆OS：糟了，他们联手耍我，我中了他们的圈套！（Damn. They played me together. I fell into their trap!）\n▲塞莱特斯盯着布拉姆，大声对他们说。\n塞莱特斯（愤恨）：布拉姆囚禁我，威胁我，还想杀了我！（指着他）他还杀了他的前妻玛莉！（Bram imprisoned me, threatened me, and tried to kill me! He also killed his ex-wife Mary!）\n▲娜塔莉亚看向了塞莱特斯，有些惊愕。\n娜塔莉亚OS：姐姐死了？（My sister is dead?）\n▲众人震惊。\n莱恩（呵斥）：布拉姆——给我一个合理的解释！（Bram—give me a good explanation!）\n▲布拉姆慌了神，连忙指着焦恩和娜塔莉亚。\n布拉姆：不，不是我，塞莱特斯受到了刺激，她有被迫害妄想症！（No, it wasn't me. Celeste is traumatized. She has paranoia!）\n塞莱特斯（愤恨）：我没有病！（I'm not sick!）\n▲娜塔莉亚拦住了塞莱特斯的争辩。\n娜塔莉亚（冷笑）：布拉姆，难道连受害者的话，都是谎话吗？（Bram, are you saying even the victim's words are lies?）\n布拉姆（冷笑）：你们说凶手是我，证据呢？尸体呢？证人呢？是你们诬告我！（You say I'm the killer—where's the evidence? Where's the body? Where's the witness? You're framing me!）\n▲莱恩和伊丽莎白对视了一眼，伊丽莎白看向了塞莱特斯。\n伊丽莎白：塞莱特斯，你有证据吗？（Celeste, do you have evidence?）\n▲塞莱特斯和娜塔莉亚对视了一眼，娜塔莉亚拿出了一支录音笔。\n娜塔莉亚：我们当然有！（Of course we do!）\n▲众人震惊。\n▲娜塔莉亚打开录音笔，录音笔中，传出了尖锐的争吵声。\n【音频33-1】\n布拉姆vo：你不是好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're curious what's in the basement? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n▲众人听着音频，十分惊讶。\n\n\n第三十七集\n37-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） \n▲布拉姆表情惊愕，音频还在继续播放着。\n塞莱特斯vo：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n布拉姆vo：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲众人看向了布拉姆，莱恩冷冽发问。\n莱恩（呵斥）：布拉姆！你怎么解释！（Bram! How do you explain this?）\n布拉姆（后退半步）：这是伪造的！（看向莱恩）爸爸，请您相信我。（指着娜塔莉亚和焦恩）他们一定是为了诬陷我，用药物控制了塞莱特斯，我要求对塞莱特斯进行药检！（It's forged! Dad, please believe me. They must have drugged Celeste to frame me. I demand a drug test on Celeste!）\n▲这时，戴安娜突然抱着小熊，在楼梯间大哭了起来。\n戴安娜（惊呼）：地下室有怪物要吃掉我——我好害怕！（There's a monster in the basement that wants to eat me—I'm scared!）\n▲众人惊讶，布拉姆情绪激动。\n布拉姆（呵斥）：戴安娜！闭嘴！别瞎说！（Diana! Shut up! Don't talk nonsense!）\n▲娜塔莉亚盯着戴安娜。\n娜塔莉亚（看向了警察）：地下室，我姐姐被囚禁在了地下室！（The basement, my sister is locked in the basement!）\n37-2\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） 玛莉\n▲地下室被暴力打开，众人站在地下室门口，被眼前的景象吓到了，里面挂满了玛莉受伤害的照片，刑具，还有三副冰棺，墙上有块黑板，黑板上挂着玛莉、塞莱特斯、娜塔莉亚的照片。\n▲玛莉的编号是一，塞莱特斯编号二，娜塔莉亚编号三。\n伊丽莎白（捂着嘴惊呼）：老天，这简直是个地狱！（My God, this is a hellhole!）\n▲角落里面，有个女人，双脚被铁链锁着，浑身是伤，瘦骨嶙峋。\n娜塔莉亚（惊愕）：姐姐——（Mary—）\n\n\n第三十八集\n38-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲娜塔莉亚冲了过去，颤抖着手拨开了玛莉的头发，娜塔莉亚落泪。\n娜塔莉亚：姐姐，我是娜塔莉亚，你还认得我吗？（Mary, it's me, Natalia. Do you recognize me?）\n▲玛莉艰难地抬头，奄奄一息说不出话。\n娜塔莉亚：医生！快叫医生——（Doctor! Call a doctor—）\n▲焦恩连忙上去，给玛莉做检查。\n焦恩：我现在就带她去医院，别担心，她会脱离危险的。（I'll take her to the hospital now. Don't worry. She'll be okay.）\n▲焦恩将玛莉抱了起来，准备离开，布拉姆被警察控制着对着焦恩呵斥。\n布拉姆（愤怒）：放开她！别将她从我身边带走！把她还给我！（Let her go! Don't take her from me! Give her back to me!）\n▲娜塔莉亚转头看向了被两个警察控制住的布拉姆，抬起手一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：我姐姐陪你吃了十年的苦！还跟你有了孩子，你为什么要囚禁她？！（My sister suffered with you for ten years! She had your child! Why did you imprison her?!）\n▲事情败露，布拉姆也不装了。\n布拉姆（冷笑）：谁让她不答应给我做情妇？（Well... that's what happens when she refuses to be my mistress.）\n▲众人震惊。\n布拉姆：我要成为贵族，我需要塞莱特斯的帮助！玛莉却非要离开我！（I wanted to become a noble. I needed Celeste's help! But Mary insisted on leaving me!）\n▲布拉姆看着焦恩的背影。\n布拉姆（疯狂）：可我爱她，我不能让她离开我，不能让别的男人染指他！我要她永远留在我身边！（But I love her. I can't let her leave me. I can't let another man touch her! I want her by my side forever!）\n▲娜塔莉亚又一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：你简直就是个恶魔！（You're a monster!）\n布拉姆（不甘心）：恶魔？对，我就是恶魔！（看塞莱特斯）塞莱特斯，我也爱你啊，我也想把你永远留在我身边！（Monster? Yes, I'm a monster! Celeste, I love you too. I wanted to keep you by my side forever!）\n▲伊丽莎白连忙挡在塞莱特斯的面前，看向了娜塔莉亚。\n伊丽莎白（感激）：娜塔莉亚，幸亏你聪明，不然我女儿就要惨遭毒手了！（Natalia, thank God you're smart. Otherwise my daughter would've been killed!）\n布拉姆（疯狂）：什么聪明？不过是运气好罢了，两个蠢货被我挑拨得大打出手！（看向了焦恩）要不是这个老东西插手，他们都要死！（Smart? Just luck. Two fools I played against each other! If this old bastard hadn't interfered, they'd all be dead!）\n娜塔莉亚（冷笑）：是吗？到现在，你还认为你才是猎人吗？（Really? Even now, you still think you're the hunter?）\n布拉姆（惊愕）：你什么意思？（What do you mean?）\n娜塔莉亚：从宴会开始，一切就都在我们的计划之中了！（Everything has been our plan since the banquet started!）\n【闪回20-1】\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的男性客人（焦恩），路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n镜头特写：在焦恩撞过来的时候，娜塔莉亚将纸条塞入了焦恩的手中。\n纸条内容（娜塔莉娅vo）：爸爸，救我们出去。（Dad, get us out.）\n【闪回结束】\n布拉姆（不敢相信）：你说什么？（What did you say?）\n▲娜塔莉亚盯着布拉姆。\n娜塔莉亚：我很清楚，你从一开始就知道我是玛莉的妹妹，是你引我入局的。（I know perfectly well you knew I was Mary's sister from the start. You lured me into this.）\n▲布拉姆震惊。\n\n\n第三十九集\n39-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆惊愕地看着娜塔莉亚，娜塔莉亚一步一步走向了布拉姆。\n娜塔莉亚（冷笑）：姐姐的照片和书信，是你寄到我曾经的家里的，戴安娜床底下的日记本也是你放的，对不对。（You mailed my sister's photos and letters to my old home. You also put the diary under Diana's bed, didn't you?）\n▲布拉姆惊呆了。\n布拉姆（不可思议）：你是怎么知道的？（How did you know?）\n娜塔莉亚（冷笑）：因为庄园守卫森严，如果不是你默许的，姐姐的遗书和照片，不可能邮寄到我手中。（Because this estate is heavily guarded. Unless you allowed it, my sister's letter and those photos could never reach me.）\n布拉姆（惊讶）：什么遗书？我做得天衣无缝，你怎么可能发现？（What letter? I was flawless. How could you find out?）\n娜塔莉亚（嗤笑）：你有一句话说得很好，“真正的猎人，往往会以猎物的方式出现”。（You said one thing right: \"The real hunter often appears as the prey.\"）\n布拉姆（不可置信）：你听到了？（You heard that?）\n▲娜塔莉亚挑眉。\n【闪回衔接5-1】\n▲娜塔莉亚牵着戴安娜往房间走，突然，塞莱特斯的房间里面传来了用力的砸门声，娜塔莉亚上前摁住了把手。\n娜塔莉亚（惊愕）OS：塞莱特斯在里面？（回头看书房）她不是在书房和布拉姆吵架吗？（Celeste is in there? Wasn't she arguing with Bram in the study?）\n【闪回结束】\n▲娜塔莉亚看向了布拉姆。\n娜塔莉亚：捕猎游戏中，算错了一步，都会万劫不复——（In a hunting game, one wrong step and you're finished—）\n布拉姆（不敢相信）：不不不，你们不都怀疑对方吗？好几次你们都出卖了对方，还大打出手了！（No, no, no. Weren't you suspicious of each other? You sold each other out several times and even fought!）\n娜塔莉亚：如果我们不假装自相残杀，你怎么对我们放松警惕，怎么会一步一步暴露你的真面目？（If we hadn't pretended to tear each other apart, how would you have let your guard down? How would you have revealed your true face step by step?）\n塞莱特斯：其实宴会上，我爸爸妈妈也早就看出了端倪，只是时机还不到。（Actually, my parents saw something at the banquet too. The time just wasn't right.）\n▲布拉姆惊愕地看着塞莱特斯和莱恩，不敢置信地开口。\n布拉姆：什么意思？（What do you mean?）\n▲莱恩冷眼盯着布拉姆。\n莱恩（冷笑）：因为真正的贵族不会在公共场合大吵大叫，即便我的女儿精神失常了，骨子里的涵养也不会丢失！只有你这种人，才不懂这种规矩！（Because real nobles don't scream in public. Even if my daughter lost her mind, her breeding wouldn't disappear! Only someone like you doesn't understand that rule!）\n▲娜塔莉亚笑着看着布拉姆。\n娜塔莉亚：我提议将塞莱特斯的尸体埋在地下时，你也担心我要算计你，所以故意说抛入海中？可恰巧，我猜到了你不会按照我说的做！（When I suggested burying Celeste's body, you were afraid I was setting you up, so you said throw it into the sea. But I guessed you wouldn't do what I said!）\n▲布拉姆彻底崩溃了。\n布拉姆（惊愕）：你们耍我？你们联手耍我！（You played me? You played me together!）\n莱恩（呵斥）：把他带走！我要他为他的算计付出代价！（Take him away! I want him to pay for his schemes!）\n▲布拉姆被带走，和娜塔莉亚擦肩而过的时候，他突然笑了，他盯着娜塔莉亚。\n布拉姆（低声）：娜塔莉亚，你收到的遗书不是我写的，你再好好想想，谁才是真正的猎人。（嘲笑）你眼中的小可怜，身上流的可是恶魔的血！（Natalia, I didn't write the note you received. Think again—who's the real hunter? The poor little thing you pity has the blood of a monster!）\n▲娜塔莉亚惊愕地回头看向了布拉姆，布拉姆对着娜塔莉亚诡异一笑，跟着警察离开了。\n塞莱特斯（安抚）：娜塔莉亚，布拉姆最擅长玩弄人心，你别被他的话蛊惑了——（Natalia, Bram is a master at playing with people's minds. Don't let him mess with your head—）\n▲娜塔莉亚盯着布拉姆的背影久久回不过来神。\n\n\n第四十集\n40-1\n日  内  戴安娜的房间\n人物 娜塔莉亚  戴安娜  玛莉\n▲娜塔莉亚在帮戴安娜整理书籍和绘本。\n娜塔莉亚vo：布拉姆在伯爵的介入下，被判处了死刑，戴安娜和姐姐继承了他所有的家产，我终于和姐姐终于重逢了。（With the Count's involvement, Bram was sentenced to death. Diana and my sister inherited everything he owned. I was finally reunited with my sister.）\n▲娜塔莉亚整理书柜，突然一个盒子掉了下来，里面的东西撒了出来，里面是一张娜塔莉亚的照片。\n娜塔莉亚（惊讶）：这里怎么会有我的照片。（How did my photo get here?）\n▲娜塔莉亚捡起照片，突然发现照片下面有一行小字，镜头特写：找到你了。（儿童字体：found you)\n镜头特写：找到你了。\n戴安娜vo：找到你了。(found you)\n▲娜塔莉亚握紧照片，看着字迹。\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——(儿童字体：Help me )\n镜头特写：救我——(儿童字体：Help me )\n【闪回结束】\n▲娜塔莉亚死死盯着这行字。\n娜塔莉亚（惊愕）OS：这字迹，和我收到姐姐的遗书上的字迹一模一样！（This handwriting is exactly the same as the note I got from my sister!）\n▲戴安娜的声音突然响起。\n戴安娜：小姨，你在看什么？（Auntie, what are you looking at?）\n▲娜塔莉亚回头，只见戴安娜站在门口抱着兔子看着娜塔莉亚，表情冷漠，娜塔莉亚连忙将照片藏起来，笑着摸了摸戴安娜的头发。\n娜塔莉亚：没什么。（Nothing.）\n▲这时，楼下响起了车子鸣笛声。\n娜塔莉亚（高兴）：听，是你妈妈出院回来了，我们快去迎接她吧！（Listen, your mom's back from the hospital. Let's go welcome her!）\n▲戴安娜瞬间恢复了孩童的笑容，牵着娜塔莉亚的手，乖巧地点了点头，她又回头看着那个盒子，勾唇一笑。\n40-2\n日  内  庄园客厅\n人物  塞莱特斯   娜塔莉亚   戴安娜   佛西   焦恩  玛莉\n▲娜塔莉亚牵着戴安娜的手路过壁炉时，偷偷将写着字的照片丢入了壁炉中烧掉了。\n▲这时，焦恩推着轮椅进来，玛莉坐在轮椅上，气色还不错。\n玛莉（虚弱）：戴安娜，娜塔莉亚。（Diana, Natalia.）\n▲戴安娜欢呼雀跃的跑过去，紧紧抱住了玛莉的手臂。\n戴安娜：妈妈！我好想你。（哽咽）我以为再也见不到您了。（Mommy! I missed you so much. I thought I'd never see you again.）\n▲玛莉轻轻抚摸着戴安娜的头发，又看向了娜塔莉亚。\n玛莉（招手）：来，让我看看。（Come here. Let me see you.）\n▲娜塔莉亚眼泪瞬间滚落，她一步一步走向了玛莉，半蹲在了玛莉的面前。\n娜塔莉亚（哽咽）：姐姐……（Mary...）\n▲玛莉伸手抚摸着她的头发。\n玛莉（温和）：傻瓜，为什么要冒险救我，如果你遇到了危险，我永远无法原谅自己。（Silly girl. Why risk your life to save me? If something happened to you, I'd never forgive myself.）\n▲娜塔莉亚趴在了玛莉的腿上，一下子哭了起来。\n娜塔莉亚：我好想你，我什么都不在乎，我只想找到你，你答应过等我的。（I missed you so much. I didn't care about anything else. I just wanted to find you. You promised you'd wait for me.）\n▲玛莉温和地抚摸着娜塔莉亚的头发。\n玛莉（安抚）：还是和小时候一样爱哭鼻子。（Still such a crybaby, just like when you were little.）\n▲焦恩拍了怕娜塔莉亚的肩膀。\n焦恩：别哭了，你妈妈一会儿就到，看见你哭鼻子又要心疼了。（Stop crying. Your mom will be here soon. She'll be heartbroken to see you crying.）\n戴安娜（乖巧）：对啊，小姨，我们一家团聚了，应该庆祝——（Right, Auntie. We're all together now. We should celebrate—）\n▲这时，塞莱特斯捧着鲜花了，带着一个男人【塞莱特斯的男友 佛西】进来。\n塞莱特斯（开朗）：嗨~娜塔莉亚，听说玛莉姐姐出院了，我们来看看她，给你们介绍一下，这是我的新男友，佛西。（Hi, Natalia. I heard Mary's out of the hospital, so we came to see her. Everyone, this is my new boyfriend, Fossey.）\n▲娜塔莉亚擦了眼泪站起来，抬头看向佛西时，瞳孔微缩。\n娜塔莉亚（惊愕）OS：是他！（It's him!）\n▲佛西对着娜塔莉亚挥了挥手。\n佛西（笑容诡异）：好久不见，娜塔莉亚。（Long time no see, Natalia.）\n"
}
```

---
## 第 15 轮（耗时：8029 ms (8.03 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.update, user.ask`

### [第 15 轮] 模型原始输出
```text
状态检查：
- 当前正在执行“精读1-4医院办公室正文，补充角色属性与出处”这一步；本轮已通过 script.read 成功读取 1-4 场正文（7 段落），该步骤的读取部分完成，可进入提出处写入。
- 关键事实：1-4 场次标题为“1-4 日 内 医院办公室”，characterNames 仅含娜塔莉亚。可归入娜塔莉亚的段落：段落1（▲娜塔莉亚的眼泪落在照片上，纯动作描写）、段落2（娜塔莉亚vo本人旁白）、段落3（▲娜塔莉亚继续翻照片，纯动作描写）、段落6（▲娜塔莉亚死死盯着小字）、段落7（娜塔莉亚本人台词+os）。段落4为镜头特写字句、段落5说话人为玛莉（旁白），严禁归入娜塔莉亚。
- 后续步骤：1-5娜塔莉亚家、1-5布莱克伍德庄园精读补录、全局核验。
- 下一步：调用 asset.update 追加 1-4 出处段落并补充设定。

思考：
1-4 场的核心新事实是：娜塔莉亚大学毕业后回旧家找姐姐，只找到记录姐姐受折磨的照片；最后一张照片上是漆黑铁门加铁链、写着“救我”；她由此判断姐姐没死，决意潜入布莱克伍德家族救姐姐。这可以作为 description 增量与 provenances。归属严格按说话人唯一所有：段落2、7为本人台词/vo，段落1、3、6为针对她的纯动作描写，均可归入；段落4为特写字幕（非她说话，亦非针对她的动作描写，宜排除），段落5为玛莉旁白，排除。调用 asset.update(mode append) 追加。

工具调用：
{{调用 asset.update, {"id": "char_1794137305183_eqhut_0", "type": "characters", "mode": "append", "description": "大学毕业回到旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片；最后一张漆黑照片上是一扇绑满铁链的铁门，写着“救我”。她由此确信姐姐未死，决心潜入布莱克伍德家族救出姐姐。", "provenances": [{"sceneTitle": "1-4 日 内 医院办公室", "paragraphIndices": [1, 2, 3, 6, 7], "evidenceText": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！▲娜塔莉亚继续翻照片……▲娜塔莉亚死死盯着那段小字。娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！"}]}}

用户沟通：
{
- 对用户说的话（完整版）：“1-4 医院办公室的正文我已经读完啦，把娜塔莉亚本人的台词和动作段落（段落1、2、3、6、7）追加进她的资产里了，玛莉的旁白和特写字幕都没算给她。接着我去读 1-5 娜塔莉亚家和庄园两场。”
- 对用户说的话（简版）：“1-4已补录出处，接着读1-5两场～”
}
```

### [第 15 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "char_1794137305183_eqhut_0",
  "type": "characters",
  "mode": "append",
  "description": "大学毕业回到旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片；最后一张漆黑照片上是一扇绑满铁链的铁门，写着“救我”。她由此确信姐姐未死，决心潜入布莱克伍德家族救出姐姐。",
  "provenances": [
    {
      "sceneTitle": "1-4 日 内 医院办公室",
      "paragraphIndices": [
        1,
        2,
        3,
        6,
        7
      ],
      "evidenceText": "▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！▲娜塔莉亚继续翻照片……▲娜塔莉亚死死盯着那段小字。娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！"
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "characters",
  "id": "char_1794137305183_eqhut_0",
  "item": {
    "id": "char_1794137305183_eqhut_0",
    "name": "娜塔莉亚",
    "role": "女主角/心理医生",
    "description": "大学毕业回到旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片；最后一张漆黑照片上是一扇绑满铁链的铁门，写着“救我”。她由此确信姐姐未死，决心潜入布莱克伍德家族救出姐姐。",
    "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
    "verifiedProvenance": [
      {
        "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
        "id": "vp_char_1794137305183_eqhut_0_para_5_547",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_731",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_853",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1022",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1077",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "evidenceText": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "anchorText": "莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1077,
        "lineNumber": 25
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_8_1348",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "evidenceText": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "anchorText": "n someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1348,
        "lineNumber": 26
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_1_1401",
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
        "id": "vp_char_1794137305183_eqhut_0_para_2_1422",
        "sceneId": "sc-27-1373",
        "sceneTitle": "第一集 1-4 日  内   医院办公室",
        "matchedTerm": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "evidenceText": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "anchorText": "泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1422,
        "lineNumber": 32
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_3_1636",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1726",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1741",
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
      "第一集 1-3 贫民窟门口   日   外",
      "第一集 1-4 日  内   医院办公室"
    ],
    "mode": "append"
  },
  "message": "成功更新资产 [娜塔莉亚]。"
}
```

---
## 第 16 轮（耗时：6076 ms (6.08 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, script.read, asset.update, user.ask`

### [第 16 轮] 模型原始输出
```text
状态检查：
- 当前计划中，1-4 场次的追加已完成（上一轮 asset.update 成功返回）。现在进入下一个未完成步骤：精读 1-5 娜塔莉亚家正文。
- 本轮工具返回成功，1-4 出处已追加到 provenances（verifiedProvenance 含 1-2、1-3、1-4 全部段落）。
- 后续待推进：1-5 娜塔莉亚家精读并追加 → 1-5 布莱克伍德庄园精读并追加 → 全局核验角色2。
- 当前可直接调用 script.read，直接读取 1-5 娜塔莉亚家正文作为依据。

思考：
先读取 1-5 娜塔莉亚家正文，确认娜塔莉亚在该场的段落分布（纯出场/动作描写及本人台词），再调用 asset.update 增量追加。注意台词归属：只有说话人是娜塔莉亚本人或纯动作描写段落才能归入。

工具调用：
{{调用 script.read, {"episode": "第一集", "scene": "1-5"}}}

用户沟通：
{
- 对用户说的话（完整版）：“1-4 医院办公室的娜塔莉亚出处已成功追加，现在开始读取 1-5 娜塔莉亚家的正文，继续补充她的出场与台词依据。”
- 对用户说的话（简版）：“1-4 已追加，正在读 1-5 娜塔莉亚家正文～”
}
```

### [第 16 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": "第一集",
  "scene": "1-5"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 1653,
  "offset": 1,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 2,
  "paragraphCount": 42,
  "hasVolumeWarning": true,
  "notice": "我发现当前条件 \"1-5\" 共匹配到 2 个场次（\"1-5 日 内 娜塔莉亚家\" 10段、\"1-5 日 外 布莱克伍德庄园\" 32段，共 42 个段落），内容较多。本次已将全部原文返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "warning": "我发现当前条件 \"1-5\" 共匹配到 2 个场次（\"1-5 日 内 娜塔莉亚家\" 10段、\"1-5 日 外 布莱克伍德庄园\" 32段，共 42 个段落），内容较多。本次已将全部原文返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "scenesSummary": [
    {
      "sceneNumber": "1-5",
      "title": "1-5 日 内 娜塔莉亚家",
      "paragraphCount": 10
    },
    {
      "sceneNumber": "1-5",
      "title": "1-5 日 外 布莱克伍德庄园",
      "paragraphCount": 32
    }
  ],
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 2,
      "paragraphCount": 42,
      "scenes": [
        {
          "index": 1,
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
          "paragraphs": [
            {
              "index": 1,
              "text": "▲娜塔莉娅在收拾皮包，将衣物放进去。"
            },
            {
              "index": 2,
              "text": "焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]"
            },
            {
              "index": 3,
              "text": "▲娜塔莉亚握住了焦恩的手，坚定开口。"
            },
            {
              "index": 4,
              "text": "娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)"
            },
            {
              "index": 5,
              "text": "▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。"
            },
            {
              "index": 6,
              "text": "焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)"
            },
            {
              "index": 7,
              "text": "▲娜塔莉亚拿着文件准备起身。"
            },
            {
              "index": 8,
              "text": "▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。"
            },
            {
              "index": 9,
              "text": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)"
            },
            {
              "index": 10,
              "text": "▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）"
            }
          ]
        },
        {
          "index": 2,
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
          "paragraphs": [
            {
              "index": 1,
              "text": "▲切镜。"
            },
            {
              "index": 2,
              "text": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]"
            },
            {
              "index": 3,
              "text": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")"
            },
            {
              "index": 4,
              "text": "▲布拉姆的目光扫过众人。"
            },
            {
              "index": 5,
              "text": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)"
            },
            {
              "index": 6,
              "text": "▲管家大声喝斥。"
            },
            {
              "index": 7,
              "text": "管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)"
            },
            {
              "index": 8,
              "text": "▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。"
            },
            {
              "index": 9,
              "text": "管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)"
            },
            {
              "index": 10,
              "text": "▲众人唏嘘。"
            },
            {
              "index": 11,
              "text": "管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)"
            },
            {
              "index": 12,
              "text": "▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。"
            },
            {
              "index": 13,
              "text": "管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)"
            },
            {
              "index": 14,
              "text": "▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。"
            },
            {
              "index": 15,
              "text": "管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)"
            },
            {
              "index": 16,
              "text": "应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)"
            },
            {
              "index": 17,
              "text": "应聘者2：我也放弃 (Me too, I'm out.)"
            },
            {
              "index": 18,
              "text": "▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。"
            },
            {
              "index": 19,
              "text": "娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）"
            },
            {
              "index": 20,
              "text": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。"
            },
            {
              "index": 21,
              "text": "布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）"
            },
            {
              "index": 22,
              "text": "娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）"
            },
            {
              "index": 23,
              "text": "▲布拉姆打量着娜塔莉亚。"
            },
            {
              "index": 24,
              "text": "布拉姆：抬起你的头来。（Lift your chin.）"
            },
            {
              "index": 25,
              "text": "▲娜塔莉亚缓缓抬头。"
            },
            {
              "index": 26,
              "text": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）"
            },
            {
              "index": 27,
              "text": "▲娜塔莉亚紧张地握紧了简历。"
            },
            {
              "index": 28,
              "text": "娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）"
            },
            {
              "index": 29,
              "text": "布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）"
            },
            {
              "index": 30,
              "text": "娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）"
            },
            {
              "index": 31,
              "text": "▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】"
            },
            {
              "index": 32,
              "text": "塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）"
            }
          ]
        }
      ]
    }
  ],
  "content": "第一集\n1-1\n夜  内   地下室\n人物  玛莉\n▲空荡的地下室里，玛莉双手被铁链绑着，跪在地上，她头发散乱瘦骨嶙峋，脸上带着血迹，一只手从黑暗中伸出来，捏住了玛莉的下巴，逼迫她抬头，玛莉恐惧地看向了镜头。\n玛莉（哀求）：救救我…… （Please... somebody help me...）\n\n1-2\n日  内   医院办公室\n人物  娜塔莉亚 \n（to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n1-3 贫民窟门口   日   外 \n人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n1-4\n日  内   医院办公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（Help me)\n玛莉（旁白）：救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n1-5\n日  内  娜塔莉亚家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）\n1-5\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)\n▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。\n管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)\n▲众人唏嘘。\n管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)\n▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。\n管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)\n▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。\n管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)\n应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)\n应聘者2：我也放弃 (Me too, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】\n塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）\n\n第二集\n2-1日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲娜塔莉亚打量着塞莱特斯。\n娜塔莉亚OS：她就是布拉姆的现任妻子塞莱特斯，王室的后裔，母亲是财阀之女，传闻是一位骄矜傲慢的贵族千金。（So this is Bram’s current wife, Celeste. Royal bloodline, heiress to a mega-corporation... as spoiled and arrogant as the rumors say.）\n▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。\n布拉姆：够了，塞莱特斯，别无理取闹了！（Enough, Celeste! Stop making a scene!）\n塞莱特斯（冷冽）：布拉姆，你许诺过只爱我一个人，（指着娜塔莉亚）为什么要让这个女人踏入家门？（Bram, you promised I'd be the only woman in your life! So why are you bringing her into our home?!）\n布拉姆（无奈）：她只是女儿的心理医生，难道，连给孩子看病的人，你都无法容忍吗？（She’s just our daughter’s therapist! Can’t you even allow someone to help our sick child?）\n▲塞莱特斯鄙夷地瞥了一眼娜塔莉亚。\n塞莱特斯（冷冽）：我绝不允许她踏进这个家！（I will NEVER let her step foot in this house!）\n▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。\n布拉姆：当初你明知道我有妻子，依旧主动靠近我，如今却要剥夺我女儿治病的权利，你未免太冷酷了！（When we met, you knew I was already married, yet you still threw yourself at me. And now you're keeping my daughter from getting the help she needs? Don't you think you're being a little too heartless?!）\n▲塞莱特斯愣住了，娜塔莉亚抬头打量着二人。\n娜塔莉亚OS：是塞莱特斯主动向布拉姆示好？（打量塞莱特斯）莫非是她？(Celeste was the one who went after Bram? Was it her?)\n▲娜塔莉亚握紧了拳头。\n娜塔莉亚（恨）OS：如果她是真凶，我会亲手撕碎她的一切，逼迫她说出姐姐的下落！(If she's the monster behind this... I will tear her life to pieces and force her to tell me where my sister is!)\n▲娜塔莉亚上前一步，递出自己的简历。\n娜塔莉亚（恭敬）：夫人，我是持证的儿童心理医生，这是我的简历，请您予以信任……(Ma'am, I am a certified pediatric therapist. Here is my resume. Please, allow me to prove my worth...)\n▲娜塔莉亚的话还没说完，塞莱特斯一把将简历摔在了娜塔莉亚脸上，纸张漫天飞舞。\n塞莱特斯（命令）：别以为我看不出来你的心思！立刻给我滚出去！【4】(I know exactly what you're up to. Now get out!)\n▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。\n布拉姆：塞莱特斯！克制你的行为！（看娜塔莉亚）你离开吧，我会支付一笔钱作为补偿。(Celeste, that's enough! You can go. I'll pay you for your trouble.)\n▲娜塔莉亚惊愕地抬头，塞莱特斯。\n娜塔莉亚OS：不，我绝不能就这样离开！(No... I can't walk away now!)\n▲就在这时，一个孩子光脚跑了出来，她拿着一个花瓶砸坏了门口的装饰，踩坏了花圃。\n女佣（追逐）：小姐！快回来，该吃药了！(Miss Diana! Please stop, it's time for your medicine!)\n▲娜塔莉亚看向了孩子。\n娜塔莉亚（惊愕）OS：那就是姐姐的女儿？(Is that... Mary's daughter?)\n▲戴安娜突然飞快跑向了关着饿狼的笼子。【5】\n布拉姆（呵斥）：戴安娜！停下！(Diana! Stop right there!)\n▲娜塔莉亚飞快冲了过去，一把抱住了戴安娜。\n娜塔莉亚：别靠近！那里很危险！(Get back! It's dangerous!)\n戴安娜（挣扎）：放开我！ (Let go of me! Get off!)\n▲戴安娜发病举起花瓶砸向了娜塔莉亚的脑袋。【6】\n女佣（惊呼）：小心！(Watch out!)\n▲娜塔莉亚一把握住了戴安娜的手，另一只手轻轻拍她的背安抚。\n娜塔莉娅：放下吧。（let it go,一语双关，辛苦本土化老师确认是否可以这样翻译 (可以的，这样说挺地道的）（见黛安娜放下花瓶，松了口气）你做的很好。(Just let it go... You did so good.)\n娜塔莉娅：（看着管家，低声说）快把帘子盖上。（Cover the cage. Now.）\n▲管家立刻盖上帘子遮住野狼。\n娜塔莉娅：都退开些，别刺激她！（Everyone step back. Don't crowd her!）\n▲布拉姆一抬手，众人立刻退开。\n▲娜塔莉亚解开脖子上的丝巾铺在地上，让黛安娜的双脚踩上去。\n娜塔莉娅：你这样太过危险，要不要玩一些更有意思的游戏？比如，吹蜡烛，像我这样……（Walking bare-foot is way too dangerous, sweetie. How about we play a fun game instead? Like... blowing out birthday candles. Look at me...）\n▲娜塔莉娅举起黛安娜的一根手指当作蜡烛，深呼吸然后吐气，黛安娜学着娜塔莉娅的样子也深呼吸起来，情绪得到了稳定。\n▲戴安娜的情绪像是得到了安抚，对着娜塔莉亚笑了起来。\n女佣（捂嘴）：哦，上帝啊，我从未见过小姐这么快平复情绪！（Oh my god... I've never seen  Miss Diana calm down so fast!）\n娜塔莉娅：小姐，别怕，你安全了。（It's ok. You're safe now.）\n黛安娜（凑到娜塔莉娅耳边）：你也安全了。（So are you.）\n▲娜塔莉娅一惊。\n\n\n第三集\n3-1\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲戴安娜拽住了娜塔莉亚的衣摆，看向了布拉姆。\n戴安娜：爸爸，我要她陪我玩儿！(Daddy, I want her to play with me!)\n▲布拉姆摸了摸戴安娜的头。\n布拉姆：如你所愿。（看娜塔莉亚）既然孩子接纳你，你可以留下。（威胁）但是……(Whatever you want. If Diana wants you here, you can stay. But...)\n▲布拉姆的目光看向了狼笼的方向，娜塔莉亚也跟着他的目光看了过去。\n娜塔莉亚（鞠躬）：我明白您的意思，我会照顾好小姐的，请您放心。(I understand, sir. I'll take good care of Miss Diana. You have my word.)\n布拉姆（满意）：带小姐去休息吧。(Take her to her room to rest.)\n▲娜塔莉亚将光脚的戴安娜抱了起来。\n娜塔莉亚：是。(Yes, sir)\n▲娜塔莉亚心中疑惑。\n娜塔莉亚（疑惑）OS：教父看起来非常疼爱戴安娜，为什么姐姐会称这里是牢笼？(The Godfather dotes on Diana so much... So why did my sister call this place a hellhole?)\n▲塞莱特斯死死握着拳头，在和娜塔莉亚擦肩而过时，压低声音警告。\n塞莱特斯（小声）：你会为你今天的决定付出代价的！(You're gonna regret this!)\n娜塔莉亚（温和）：夫人，我只是一个心理医生，听不懂你在说什么。(I'm just a therapist, ma'am. I'm afraid I don't know what you mean.)\n▲娜塔莉亚收回目光，抱着戴安娜一步一步走向了大门，大门打开，屋内富丽堂皇的装饰映入眼帘。\n娜塔莉亚OS：我的姐姐就这里，我不但要找到她的下落！还要保护戴安娜，还要让姐姐和戴安娜合法继承所有财产！【7】(My sister is here. I'll find out what happened to her, protect Diana, and make sure they both get their rightful share of the inheritance!)\n▲布拉姆轻轻抚摸了一下塞莱特斯的头发。\n布拉姆：不过是一个心理医生而已，没必要将她放在心上。(She’s just a shrink, babe. No need to waste your energy on her.)\n▲塞莱特斯下意识后退了一步，看向了娜塔莉亚的背影。\n塞莱特斯：是吗？(Is that so?)\n布拉姆（安抚）：好了，塞莱特斯，你的身体欠佳，回去休养吧。(Come on, Celeste. You're not feeling well. Go get some rest.)\n▲布拉姆也随着她的目光看向了娜塔莉亚的背影。\n布拉姆OS：又一个有趣的猎物，送上门来了！(Well, well...Another little mouse walked right into my trap.)\n▲布拉姆看了一眼管家。\n布拉姆：加强庄园守卫，没有我的命令，任何人都不许出去！【8】(Double the security. No one leaves this estate without my permission!)\n\n3-2\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  \n▲公主房内，戴安娜躺在华丽的公主床上，闭上眼睛，娜塔莉亚给她读故事。\n娜塔莉亚（温柔）：最后，公主和王子拥有了属于他们的幸福生活……(And in the end, the prince and princess lived happily ever after...)\n▲这时，花园传来微弱的呼救。\n（画外音，女声惨叫）vo：啊——救命——(Aah! Somebody help me!)\n▲娜塔莉亚惊愕看向了外面。\n娜塔莉亚OS：呼救？是姐姐吗？(A scream for help? Was that... my sister?!)\n▲娜塔莉亚连忙起身出门。\n\n3-3\n日  外  花园\n人物  娜塔莉亚  管家\n▲娜塔莉亚悄悄在花园里面走，花园里面装饰与建筑物遮挡视线，墙角站着持枪的安保，娜塔莉亚微微弯腰，躲避安保的视线。\n娜塔莉亚（自言自语）：奇怪，呼救声明明是从这里传出来的！(That’s weird. I swear that scream came from right around here!)\n▲突然一只手拍了一下娜塔莉亚的后背，娜塔莉亚惊恐回头，只见管家冷着脸站在她身后。\n管家（冷漠）：你在干什么？(What do you think you’re doing?)\n娜塔莉亚：我，我随便走走……(I—I was just taking a walk, getting some fresh air...)\n▲管家冷脸将文件夹递给娜塔莉亚。\n管家：这是庄园的规矩和教父的禁忌。(These are the house rules. Mr. Blackwood doesn't tolerate anyone breaking them.)\n▲娜塔莉亚翻看着文件。\n管家（严肃警告）：不要碰庄园里的任何东西，不要擅自离开庄园，不要在庄园游荡，不要妄想勾引教父！(Don't touch anything in the estate. Don't leave without permission. Don't wander around. And don't even think about trying to seduce the Godfather!)\n▲娜塔莉亚握着文件点了点头，管家一步步靠近她，再次警告。\n管家（警告）：最重要的一条，不要靠近地下室。(And the most important rule: stay away from the basement.)\n娜塔莉亚（惊讶）：地下室？【9】(The basement?)\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链。\n【闪回结束】\n▲娜塔莉亚看着管家离开的背影，心中疑惑。\n娜塔莉亚OS：姐姐给的照片中点出的地点会不会是地下室？(Could the basement be where my sister was pointing to in those photos?)\n▲管家的视线随意扫过了不远处的安保。\n管家（冷漠）：随意走动，会被当做入侵者被射杀。(Anyone caught wandering where they shouldn't will be treated as an intruder and shot on sight.)\n▲安保立刻举起枪，子弹上膛，娜塔莉亚浑身僵直。\n管家（命令）：现在立刻回到小姐的房间去。(Get back to Miss Diana's room. Now.)\n\n3-4\n日 内  戴安娜房间\n人物  戴安娜   娜塔莉亚  布拉姆\n▲娜塔莉亚转身进入房间，放下了文件，在华丽的公主房屋内巡视。\n娜塔莉亚（打量）OS：戴安娜的房间里，会不会有姐姐留下的遗物？（翻找柜子）如果有线索就好了！(Is there anything my sister left behind in here? Come on, just one clue... anything!)\n▲戴安娜悄无声息地睁开了一只眼睛盯着娜塔莉亚翻找东西的背影，她偷偷地将枕边的小熊推到了地上。\n▲娜塔莉亚听到声音，吓了一跳，立刻回头。\n娜塔莉亚OS：谁？(Who's there?!)\n▲戴安娜连忙闭上眼睛，娜塔莉亚瞧见玩偶掉地上了，弯腰去捡玩偶。\n娜塔莉亚OS：我必须万分谨慎，不能被布拉姆和塞莱特斯察觉！(I’ve got to be extra careful. I can't let Bram or Celeste catch on to what I’m doing.)\n▲娜塔莉亚捡玩偶时，突然看见床底下有个盒子。\n娜塔莉亚（惊讶）OS：那是什么？(What's that?)\n▲娜塔莉亚趴在地上，伸手去将盒子给拿出来，盒子上刻着名字：玛莉。(MARY)\n娜塔莉亚（惊讶）OS：这是姐姐的遗物吗？【10】(Is this... my sister's? )\n▲娜塔莉亚背对着门，蹲在地上打开盒子想查看里面的东西，盒子里面有个日记本。\n娜塔莉亚（惊讶）：这是，姐姐的日记？(No way... Is this my sister's diary?)\n▲门突然推开了，布拉姆握住一把枪，一步一步靠近娜塔莉亚，最后停在了娜塔莉亚背后。\n布拉姆（冷漠）：你在做什么？(What are you up to?)\n▲娜塔莉亚吓了一跳，猛地回头，目光正对布拉姆手中的枪口！【11】\n\n第四集   \n4-1\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  布拉姆\n▲布拉姆上前一步，枪口对准了娜塔莉亚的额头，娜塔莉亚放下盒子，举起手，镜头特写：床上的戴安娜睫毛颤了一下。\n▲娜塔莉亚盯着眼前黑漆漆的枪口，她故作柔弱的姿态，眼神惶恐地看向了布拉姆。\n娜塔莉亚（低声）：教父……我发誓，我绝对没有半点越界。(Godfather...Please... I swear I didn't do anything I wasn't supposed to.)\n▲娜塔莉亚抬起下巴，一双眼睛颤抖地盯着布拉姆，布拉姆居高临下看着她，嗤笑了一声，枪口从娜塔莉亚的额头，挪到了她的下巴。\n布拉姆（狠辣）：把东西交出来，！笼子里的狼早已饥肠辘辘，别让我抓到你半点可疑的痕迹！(Hand it over. The wolves are starving out there, don't give me a single reason to doubt you.)\n▲娜塔莉亚被迫仰起头，脖子暴露在枪口下，她伸手轻轻握住枪口，用脸颊蹭了一下枪口，又妩媚地抬头看向了布拉姆。\n娜塔莉亚（低声）：别这样，您吓到我了。(Easy... you're scaring me.)\n▲布拉姆眼神震惊，喉结滚动了一下。【12】\n布拉姆（语气放松）：才刚刚进来，就敢勾引我。（上前一步，捏住娜塔莉亚的下巴）你的胆子很大。(Just walked through that door, and already trying to play me? You've got balls.)\n▲娜塔莉亚故作惶恐。\n娜塔莉亚（可怜）：绝无此事。(I would never dare.)\n▲布拉姆打量着娜塔莉亚，用力甩开她下巴，冷声开口。\n布拉姆（冷漠）：别以为这样我就会放过你！（脚尖踢盒子）把盒子打开。(Don't think that flattery gets you off the hook. Open the box.)\n▲娜塔莉亚颤抖着手拿起盒子，打开了盒子里面有一张玛莉遍体鳞伤的照片。\n布拉姆（惊讶）：这是……(What is this...?)\n▲娜塔莉亚观察着布拉姆的表情。\n【闪回衔接3-2】\n▲门突然推开了，布拉姆举着枪进来，娜塔莉亚背对着布拉姆跪在床边上，她从窗户的玻璃上看到了布拉姆的倒影，察觉了布拉姆靠近，她立马取出日记本，丢入床底下，随后将一张玛莉的照片放入盒子里面，合上了盒子。\n【闪回结束】\n▲娜塔莉亚缓缓抬头，布拉姆正在看照片，手指死死握住了照片边缘。\n娜塔莉亚OS：我就知道布拉姆会来，这张照片是我用来测试布拉姆的筹码，我只想知道，他知不知道姐姐遭受的一切？(I knew he'd show. This photo is my litmus test for Bram. I need to know: did he have any idea what my sister went through?)\n▲布拉姆看着照片，又看娜塔莉亚。\n布拉姆（冷漠）：谁允许你触碰屋内的东西的！(Who gave you the right to touch my things?)\n娜塔莉亚（跪在地上）：教父，我只想找出诱发小姐心理创伤的根源！（试探）她会不会是因为看到这些残酷的画面才……(Godfather, I was just trying to trace the root of Miss Diana’s trauma. Could seeing something this graphic...)\n▲布拉姆审视地盯着娜塔莉亚，伸手将照片拿了起来，紧紧捏着照片。\n布拉姆：闭嘴！(Shut up!)\n▲娜塔莉亚观察着布拉姆的表情和手指，试探开口。\n娜塔莉亚：她是谁？对小姐而言，是很重要的人吗？(Who is she? Is she someone important to Miss Diana?)\n▲布拉姆将照片收了起来。\n布拉姆（冷冽）：守好你的本分，不该问的，不要追问。【13】（转身）以后看到类似的物件，第一时间交给我！(Know your place. Curiosity killed the cat. Next time you stumble on crap like this, bring it straight to me.)\n▲布拉姆转身离开了，娜塔莉亚松了口气，坐在了地上。\n娜塔莉亚（看布拉姆的背影）OS：布拉姆的反应说明他对姐姐的遭遇一清二楚，难道是他和塞莱特斯一起害了姐姐？姐姐到底在哪里？(His reaction says it all, he knows damn well what happened to my sister. Did he and Celeste do this together? Where is my sister?)\n\n\n4-2\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚坐在床上，摊开了笔记本，镜头特写：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n玛莉vo：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n娜塔莉亚（疑惑）OS：这些信息未免太直白了，像是刻意引导我发现线索，到底是谁布的局，又想引导我做什么？(Way too convenient. It's like someone's leaving these clues for me. Who's playing puppet master here, and what's their game?)\n【闪回照片】\n▲镜头特写：铁门被铁链包裹的照片。\n【闪回结束】\n娜塔莉亚：铁门是不是指向的地下室？会不会和姐姐有关！我一定要找到照片所在的位置？(Does that iron door lead to the basement? Is that where they kept my sister? I've got to find that exact spot.)\n▲这时，保姆间的门被推开了，娜塔莉亚吓了一跳，连忙将照片藏起来，猛地回头。\n\n\n第五集\n5-1\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚连忙合上笔记本，疑惑地看着戴安娜。\n娜塔莉亚：怎么了？戴安娜小姐？(Everything okay, Miss Diana?)\n▲戴安娜提着小熊站在了门口，她眼神冷冷地看着娜塔莉亚。\n戴安娜（可怜）：我睡不着，你可以陪着我吗？(I can't sleep... Will you stay with me?)\n▲娜塔莉亚立刻起身，蹲在了戴安娜面前，抚摸了一下戴安娜的头发。\n娜塔莉亚（安抚）：别怕，我陪你回房间好吗？(Hey, don't be scared. Let's get you back to bed, okay?)\n▲戴安娜点了点，娜塔莉亚牵着她的手回房间。\n\n5-2\n夜  内  书房外\n人物  娜塔莉亚   戴安娜\n▲娜塔莉亚牵着戴安娜走在走廊上，突然听到书房传来争吵，娜塔莉亚和戴安娜停下步伐，站在了门口，书房里面传来激烈的争吵声。\n布拉姆（冷冽）VO：塞莱特斯，是你把玛莉的照片放在戴安娜的房间里的？(Celeste, was that you? Did you plant Mary's photo in Diana's room?)\n塞莱特斯（愤怒）VO：你凭什么断定是我所为？(And what makes you so damn sure I did it?)\n布拉姆（呵斥）VO：难道不是你想用那些照片恐吓孩子吗？毕竟你一向都不喜欢她！(Cut the crap. Weren't you trying to terrorize the kid? You've always hated her guts!)\n▲戴安娜想要推门，娜塔莉亚捂着她的嘴巴，抱着她往房间走。\n娜塔莉亚（惊愕）OS：难道布拉姆和塞莱特斯在联手掩盖姐姐死亡的真相？(Are they actually teaming up to sweep my sister's murder under the rug?)\n\n5-3\n夜  内   书房内  \n人物   布拉姆\n▲房间里面，只有布拉姆一个人，布拉姆听见外面的脚步声离开，他打开了留声机，留声机传出塞莱特斯的声音。\n塞莱特斯（留声机）：你凭什么断定是我所为？(What makes you so sure I did it?)\n▲布拉姆关上了留声机，给自己倒了一杯红酒。\n布拉姆（摇晃酒杯）：真正的猎人往往以猎物的方式出现，就让猎物彼此撕咬吧（品酒）毕竟真正贵族从不会沾染猎物的血。(The best hunters always disguise themselves as prey. Let them tear each other to pieces. After all... real aristocrats never get their hands dirty.)\n\n5-4\n夜  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚将戴安娜放在床上，戴安娜看着她。\n戴安娜：他们吵架是因为我对不对？(They were fighting over me, weren't they?)\n▲娜塔莉亚轻轻抚摸她的头发。\n娜塔莉亚（温和）：这是成年人的纠葛，与你无关。(That's just adult nonsense. It has nothing to do with you, sweetie.)\n戴安娜（平静）：塞莱特斯并不是我的母亲，对吗？(Celeste isn't my real mom, is she?)\n▲娜塔莉亚惊讶地看着戴安娜。\n娜塔莉亚（故作不知）：您为什么会这么想？(Why would you think that?)\n戴安娜（抱着小熊）：我的母亲很温柔，塞莱特斯来了之后，我就再也没见过她了，爸爸禁止我提起她，我很思念她，她什么时候回来？(My mom was so sweet... After Celeste showed up, she just vanished. Daddy won't even let me say her name. I miss her so much. Do you know when she's coming back?)\n▲娜塔莉亚看着戴安娜。\n娜塔莉亚（怜悯）：她一定会回来的，我向你保证！【14】(She'll be back. I promise.)\n▲戴安娜乖乖盖好被子，乖巧地开口，握紧了娜塔莉亚的手。\n戴安娜：你会一直留下来陪我吗？(Will you stay with me forever?)\n娜塔莉亚（安抚）：如果你爸爸同意的话，我当然会留下来陪你。(If your dad gives the green light, I'd love to.)\n戴安娜（疑惑）：你害怕我爸爸吗？(Are you scared of my daddy?)\n娜塔莉亚（微笑）：我想庄园里的人都对教父心存敬畏。(I think everyone in this house is a bit intimidated by the Godfather.)\n戴安娜（乖巧）：塞莱特斯就不会，还总是和爸爸吵架！(Celeste isn't. She's always fighting with Daddy!)\n▲娜塔莉亚摸了摸戴安娜的头发，温和开口。\n娜塔莉亚（安抚）：吵架？((Fighting?)\n▲戴安娜抬头乖巧地看着娜塔莉亚。\n戴安娜（不解）：对呀，爸爸很喜欢别人崇拜他，塞莱特斯却从不这样，这让他很懊恼。(Yeah. Daddy loves it when people worship him, but Celeste never does. It drives him crazy.)\n▲娜塔莉亚一愣，惊讶地低头看向了戴安娜，戴安娜闭上了眼睛睡觉。\n娜塔莉亚（惊讶）OS：我明白了。布拉姆出身卑微，极度渴望被认可，而出身贵族的塞莱特斯永远给不了他这份崇拜，看来他们也没有传闻那么相爱！(I get it. Bram came from the gutter, so he's desperate for validation. But Celeste is old money, she'll never stroke his ego. They're nowhere near as tight as everyone thinks.)\n\n5-5\n夜  内  楼梯口   \n人物  安保   娜塔莉亚  管家\n▲娜塔莉亚打开门，恰好看到两个安保抬着一具盖着白布的尸体从客厅路过，娜塔莉亚惊讶地捂着了嘴巴，管家不知道什么时候出现在了娜塔莉亚的身后。\n管家：看到了吗？那就是擅闯地下室的下场。(See that? That's what happens when you sneak into the basement.)\n▲娜塔莉亚猛地看向了管家，吓了一跳，管家已经转身离开了。\n娜塔莉亚（看向主卧方向）OS：得先让猎物撕咬起来，我才有机会探查姐姐的下落。(I need them to tear each other apart first. Only then will I have a chance to find out where my sister is.)\n\n\n第六集\n6-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲布拉姆坐在餐桌旁边，一边看报纸，一边喝咖啡，娜塔莉亚穿着一件性感的连衣裙走了过去。\n▲娜塔莉亚将对戴安娜的心理报告放在了布拉姆的面前。\n娜塔莉亚（恭敬）：教父，这是昨夜我针对小姐的行为进行的心理分析，请您过目。(Godfather, here is my psychological assessment of Miss Diana based on her behavior last night. Please take a look..)\n▲布拉姆收起了报纸，看向了娜塔莉亚给的文件，又看了一眼娜塔莉亚，眼神暂停，喉结滚动了一下。\n布拉姆：根据你的分析，我女儿怎么样了？(So, according to your report, how's my daughter doing?)\n▲娜塔莉亚俯身靠近布拉姆，手背蹭着布拉姆的手臂划过，指着文件。\n娜塔莉亚：您看，小姐不敢一个人睡，是因为……(As you can see, she's terrified of sleeping alone because...)\n▲布拉姆目光从文件上娜塔莉亚的手慢慢往娜塔莉亚的身上打量，他像是看货物一样看着娜塔莉亚，布拉姆往后仰，坐在椅子上，手臂搭在椅背上，手背刚刚好在娜塔莉亚的臀部位置，目光也落在了臀部。\n布拉姆（审视）OS：真想把这件碍事的衣服……(I'd love nothing more than to rip that dress right off her...)\n▲娜塔莉亚余光瞥见了布拉姆的目光。\n娜塔莉亚（冷笑）OS：禽兽，这么容易上钩！(Pig. That was almost too easy.)\n▲这时候，娜塔莉亚的余光瞥见塞莱特斯出现在了楼梯口。\n▲娜塔莉亚趁着布拉姆发呆，翻页时候，手臂碰到了牛奶杯，瞬间将牛奶洒到了布拉姆的裤子上。\n布拉姆（回神，惊讶）：你在干什么？(What the hell are you doing?)\n▲娜塔莉亚惊慌失措，蹲下用纸巾给布拉姆擦拭裤子，她的衣领开得很低，胸贴近布拉姆的大腿。\n娜塔莉亚：教父，请把裤子脱下来交给我，我替您清洗吧。(Godfather, please let me take your pants off. I'll get them cleaned right away.)\n▲布拉姆目光扫过了娜塔莉亚的脸和她的胸口，喉结滚动了一下。【15】\n布拉姆（嗤笑）：脱下来？（指尖划过娜塔莉亚的脸）你的野心倒是毫不掩饰。（松开娜塔莉亚）你这招，对别的男人或许很有效，可我不吃这一套！(Take them off? You're not even trying to hide your ambition, are you? That little show might work on other guys, but I don't buy it.)\n▲娜塔莉亚微微躲避，低下头去。\n娜塔莉亚（紧张）：先生，我并没有这个意思，我只是……我仰慕您很久了，您强大，睿智，是无数人仰望的对象，我由衷地敬佩您。(Sir, please, that's not what I meant. I just... I've looked up to you for so long. You're powerful, brilliant, a man everyone reveres. I genuinely admire you.)\n▲布拉姆愉悦地笑了，指腹擦过了娜塔莉亚的嘴角。\n布拉姆（笑）：嘴可真甜。(You've got quite a silver tongue, haven't you?)\n▲这时，塞莱特斯来到了餐厅，桌子挡住了视线，她看到布拉姆坐在椅子上，娜塔莉亚蹲在布拉姆的面前，举止不雅，顿时误会了。\n塞莱特斯（呵斥）：你们在干什么？【16】(What on earth is going on here?!)\n\n第七集\n7-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲娜塔莉亚听到声音，眼中划过了一丝兴奋。\n娜塔莉亚（高兴）OS：好戏开场了！(And... showtime!)\n▲娜塔莉亚故作慌乱起身，手中拿着纸，布拉姆的裤子上还有牛奶的痕迹。\n娜塔莉亚：夫人……事情并非您所想的那样……(Ma'am... please, it's not what it looks like!)\n▲塞莱特斯大步流星地走过来，一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯（呵斥）：不知廉耻，竟敢勾引我的丈夫，立刻滚庄园！(You shameless little whore! How dare you seduce my husband! Get the hell out of my house!)\n▲娜塔莉亚捂着脸，委屈地看着布拉姆。\n娜塔莉亚（可怜）：夫人，难道崇拜教父也是过错吗？（不屈）难道他不配得到别人的仰慕吗？(Ma'am, is it such a sin to admire the Godfather? Doesn't a man like him deserve to be revered?)\n▲布拉姆听到这句话，脸色阴沉。\n塞莱特斯（愤怒）：你——(You-)\n▲塞莱特斯举起手要打娜塔莉亚，被布拉姆拦住了。\n布拉姆：塞莱特斯！请你克制你的行为！(Celeste! That's enough!)\n塞莱特斯（呵斥娜塔莉亚）：滚出去！立刻滚——(Out! Get the hell out-)\n▲塞莱特斯还想对娜塔莉亚动手，但是被布拉姆拦住了。\n布拉姆（呵斥）：塞莱特斯！你简直越来越不可理喻了，看来你需要接受心理治疗了！(Celeste! You are losing your mind! Maybe it's time you saw a psychiatrist!)\n塞莱特斯（惊愕）：你认为我疯了？既然你现在这么厌恶我，为什么不跟我离婚？(You think I'm crazy? If I disgust you so much, why don't you just sign the divorce papers?!)\n▲ 众人震惊，娜塔莉亚不动声色看向了塞莱特斯。\n娜塔莉亚（惊讶）OS：离婚？塞莱特斯想离开布拉姆？(Divorce? Celeste actually wants out?)\n▲布拉姆一把抓住了塞莱特斯的手腕，压下了情绪。\n布拉姆（深呼吸）：抱歉，（握住梅菲斯特的手）塞莱特斯，你先上楼，（目光看娜塔莉亚）我会处理她。(I'm sorry. Celeste, head upstairs. I'll handle her.)\n▲塞莱特斯眼神愤怒，甩开布拉姆的手。\n塞莱斯特（呵斥）：离婚！(I want a divorce!)\n▲布拉姆神情冷漠了几分，看了一眼远处的女佣。\n布拉姆（深呼吸）：来人，夫人需要休息，送夫人回房间！(Guards! Madam needs some rest. Escort her back to her room!)\n▲两个女佣上前搀扶塞莱特斯，塞莱特斯甩开女佣。\n塞莱特斯（呵斥）：别碰我，我自己会走！(Get your hands off me! I can walk!)\n▲塞莱特斯和娜塔莉亚擦肩而过的时候，她看了一眼娜塔莉亚，低声开口。\n塞莱特斯（嘲笑）：你会后悔你所做的一切的——（放慢语速）娜塔莉亚！【17】(You are going to pay for every single thing you've done... Natalia.)\n▲娜塔莉亚擦了一下脸上的泪，无辜开口。\n娜塔莉亚：我不知道您在说什么。(I... I have no idea what you're talking about.)\n▲塞莱特斯冷哼了一声，走了，娜塔莉亚盯着塞莱特斯的背影。\n娜塔莉亚OS：塞莱特斯为什么会提出离婚？这太反常了，她是想离开布拉姆还是想威胁布拉姆将我赶走？(Why is Celeste bringing up divorce now? Something's off. Is she genuinely trying to leave him, or is this just a power play to get me kicked out?)\n▲布拉姆突然伸手扶着娜塔莉亚的腰，捏了一下她的腰，娜塔莉亚猛地回头看向了布拉姆，布拉姆靠近她。\n布拉姆（低声）：敢当着塞莱特斯的面儿勾引我？我很欣赏你的胆量。（故意提高声音警告）但，我不希望再有下次！(Seducing me right under Celeste's nose? You've got guts. I'll give you that. But don't let there be a next time.)\n▲说完之后，布拉姆的目光在娜塔莉亚捏着纸巾的手上掠过，随后转身离开了，娜塔莉亚瞧着布拉姆的背影，倒了一杯牛奶，慢慢品尝。\n娜塔莉亚OS：不希望有下次？还是希望下次快点到来？布拉姆先生！【18】 (Don't want a next time? Or can't wait for it... Mr. Bram?)\n\n\n第八集\n8-1\n日  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚在桌子上画画，画上面是一扇门，门上缠着铁链。\n娜塔莉亚（惊讶）OS：缠着铁链的门——(A door bound in heavy chains...)\n▲娜塔莉亚压下了心中的震惊。\n娜塔莉亚（故作好奇）：天啊，这张画画得真好，充满了神秘色彩。（摸戴安娜的头）您见过，还是直接想象出来的？(Sweetheart, what a beautiful drawing! It looks so mysterious. Did you actually see this somewhere, or did you just make it up?)\n戴安娜（乖巧）：这是我们家的地下室啦～(That's our basement!)\n娜塔莉亚（惊讶）：地下室——(The basement...?)\n▲戴安娜像是突然反应了过来一样，立刻将画藏了起来。\n戴安娜（竖起手指）：嘘，千万不要告诉爸爸哦～(Shh... Promise you won't tell Daddy!)\n▲娜塔莉亚弯着腰，故意捂着眼睛逗戴安娜。\n娜塔莉亚（温和）：好哦，那我就当作什么都没有看见。(Cross my heart. I didn't see a thing.)\n▲戴安娜一瞧，开心地笑了起来，她顺手将画压在了画纸下方，拿出了另外一张画给娜塔莉亚看。\n戴安娜：你看，这是我画的妈妈！(Look! I drew Mommy!)\n▲娜塔莉亚盯着画，上面是一幅简笔画，一个女人抱着一个孩子，手背上和手腕上都有一道伤痕。\n娜塔莉亚（惊讶）OS：上帝啊，那是什么？(My God... what are those scars?)\n▲戴安娜没发现娜塔莉亚的情绪，看着画，充满怀念地开口。\n戴安娜（叹气）：我真的很想念妈妈。(I miss Mommy so much...)\n▲娜塔莉亚愣了一下，轻轻将戴安娜护在怀中。\n娜塔莉亚：你的妈妈也同样牵挂着你，如果你过得痛苦，她会万分难过，我们先好好休息，好吗？(Your mommy misses you just as much. Seeing you hurting like this would break her heart. Let's get some sleep, okay?)\n戴安娜：你能给我唱睡眠曲吗？妈妈以前经常唱给我听。(Will you sing me a lullaby? Mommy used to sing to me all the time.)\n▲娜塔莉亚将戴安娜抱在怀中，轻轻拍着她的后背，唱起了睡眠曲。引用国外歌曲：《Baby's Bed A Silver Moon》\n娜塔莉亚：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n▲戴安娜闭着眼睛小声地说。\n戴安娜（低声）：你唱的歌和妈妈唱的一样。(You sound just like Mommy...)\n▲娜塔莉亚低头看着怀中的戴安娜笑，眼睛却红了。\n【闪回】\n8-2\n日 内  平民屋老房子\n人物 玛莉  娜塔莉亚\n▲小玛莉将小娜塔莉亚抱在怀中，娜塔莉亚抬头就能看到姐姐温柔的笑容，玛莉拍着她的后背，用稚嫩的声音唱安睡曲。\n小玛莉（拍背）：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n\n【闪回结束】\n▲小玛莉稚嫩的歌声和娜塔莉亚的歌声重叠。\n娜塔莉亚（哽咽）：飘啦飘啊宝贝，跨过千山万水。(Sail away, my little one, over mountains and streams...)\n▲一滴泪顺着娜塔莉亚的脸颊滴在戴安娜的脸上，娜塔莉亚连忙擦泪，低头一看，戴安娜已经睡着了，娜塔莉亚低头轻吻她额头。\n娜塔莉亚（坚定）OS：睡吧宝贝，小姨一定会找到你的母亲！【19】(Rest easy, my sweet girl. Auntie will bring your mother home.)\n\n8-3\n夜  内   走廊/地下室\n人物 娜塔莉亚  塞莱特斯\n▲走廊上，配着枪的安保在巡逻。\n安保：教父有令，不许任何人夜里在庄园内随意走动。(By order of the Godfather, no one wanders the grounds after dark.)\n▲娜塔莉亚躲在拐角的阴影处，安保走远后，她才出来，迅速走向了地下室的入口。\n▲娜塔莉亚不敢开灯，摸索着往前走。\n娜塔莉亚OS：地下室到底锁着什么东西？这东西会和姐姐有关吗？戴安娜难道是看到了地下室的东西才病了的？(What is he hiding down there? Is Mary behind that door? Is that what traumatized Diana?)\n▲她摸索着到了地下室门口，月亮冰冷地落在了门上，门上缠着铁链子，挂着锁，突然地下室里面传来了微弱的响动。\n（女声，模糊，微弱）vo：救救我……（非常模糊，难以判断）(Help... me...)\n娜塔莉亚（惊讶，拍门）：你是谁？(Who's in there?!)\n（女声，微弱）：我是……(I’m...)\n▲娜塔莉亚上前查看，突然一只手拍了一下。\n娜塔莉亚（惊恐）OS：是谁！【20】(Who's there?!)\n▲娜塔莉亚僵硬地转身，塞莱特斯穿着睡裙，披头散发站在她身后。\n塞莱特斯（声音冰冷）：我知道你是谁，也知道你潜入布莱克伍德庄园的目的。(I know who you really are... and exactly why you infiltrated the Blackwood estate.)\n▲娜塔莉亚吓了一跳，后退了一步靠在门上，塞莱特斯步步逼近。\n塞莱特斯：我给过你逃离的机会，既然你执意入局，就别怪我心狠手辣——(I gave you a way out. But since you insist on playing with fire, don't blame me for burning you alive.)\n▲娜塔莉亚盯着塞莱斯特，突然笑了一声。\n娜塔莉亚：塞莱特斯，是你引我来地下室的，我们不是敌人，对吗？(Celeste, you left those breadcrumbs to lead me here. We're on the same side... aren't we?)\n▲塞莱特斯震惊！【21】\n一卡\n\n第九集\n9-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯\n▲娜塔莉亚靠在门上，塞莱特斯一步一步逼近，地下室楼梯口偶尔有人影闪过。\n娜塔莉亚（警惕地看楼梯间）：夫人是想有话直说，还是等布拉姆发现我们？（Cut to the chase, or are you waiting for Bram to catch us?）\n▲塞莱特斯突然一把抓住了娜塔莉亚的手。\n塞莱特斯（一字一句）：救救我，娜塔莉亚！布拉姆想要除掉我！（Help me, Natalia! Bram is going to kill me!）\n娜塔莉亚（震惊）\n▲娜塔莉亚后退了半步，惊愕地看着塞莱特斯。\n娜塔莉亚OS：我猜对了，塞莱斯特想离开布拉姆！可她为什么要向我求救？（I was right. She’s trying to ditch Bram. But why come to me?）\n▲娜塔莉亚故作不解地看着塞莱特斯。\n娜塔莉亚（惊愕）：教父明明十分爱您，怎么会想除掉你？（The Godfather clearly loves you. Why would he want you dead?）\n▲塞莱特斯用力摇头。\n塞莱特斯（绝望）：你们都被骗了！那都是他的精心伪装的假面！他根本就不爱我！（You’ve all been played! It’s all an act. He doesn't love me at all!）\n娜塔莉亚（警惕）：夫人，您遇到危险，应该向您的家人求助，而不是我这个外人。（Ma'am, if you're in danger, go run to your family, not an outsider like me.）\n塞莱特斯（苦笑）：这座庄园守卫深严，我根本无法逃布拉姆的掌控，我也曾向我父母求救，可我身上没有伤痕，他们只认为是我无理取闹！（This place is a fortress, I can't get away from him. I tried begging my parents, but since there are no bruises on my skin, they just think I'm losing my mind.）\n▲塞莱特斯看向了楼梯口，楼梯口偶尔闪过巡逻的身影。\n塞莱特斯（悲伤）：没有人相信完美丈夫的面具下是禽兽。（激动地抓住娜塔莉亚的手）求你帮帮我！（Everyone thinks he's the perfect husband. No one believes me when I tell them what he's really like. Please, you have to help me!）\n▲娜塔莉亚观察着塞莱特斯的表情和发抖的身体。\n娜塔莉亚OS：她说的是真的？还是在试探我？这太冒险了……（ Is she telling the truth? Or testing me? Way too risky...）\n▲娜塔莉亚掰开塞莱特斯的手，准备离开。\n娜塔莉亚：夫人，这些话，我就当没听过！我得离开这里了，如果被教父发现，我会死的……（Ma'am, let’s just pretend this conversation never happened. I gotta go. If the godfather catches me, I'm dead meat...）\n▲塞莱特斯抹了一把眼泪，盯着娜塔莉亚的背影，突然开口。\n塞莱特斯：你的原名叫作苏丽娅，是玛莉的妹妹，八岁被焦恩收养改名娜塔莉亚！你潜入这里是为了寻找玛莉失踪的真相！（Your real name is Surya, Mary’s little sister. John adopted you when you were eight and made you Natalia! You didn't just stumble in here; you're hunting for the truth about Mary!）\n▲娜塔莉亚惊呆了，猛地回头看向了塞莱特斯。\n\n\n第十集\n10-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲娜塔莉亚惊讶地看着塞莱特斯。\n娜塔莉亚：夫人，我并不知道您在说什么，我也不认识玛莉——（Ma'am, I don't know what you're talking about. I have no idea who Mary is-）\n▲塞莱特斯拿出一张照片递给娜塔莉亚，光线昏暗，娜塔莉亚低头看着那张旧照片，上面是小时候的娜塔莉亚和小玛莉还有爸爸妈妈的全家福。\n娜塔莉亚（惊愕）：这张照片怎么在你这里！（where did you get this?）\n▲塞莱特斯走向娜塔莉亚，将照片递给她。\n塞莱特斯：布拉姆很懂怎么让女人为他着迷，一年前我就是这样上钩的。得知他有妻子时，我嫉妒得发疯，只想把他抢过来——他太享受这种被争夺的感觉了。（Bram has a way of wrapping women around his finger. That’s how he reeled me in a year ago. When I found out he was married, I went green with envy. I wanted him all to myself- and he thrives on women fighting over him.）\n▲娜塔莉亚死死握着照片。\n娜塔莉亚（愤怒）：所以你就绑架了我的姐姐？（So you're the one who snatched my sister?）\n塞莱特斯（摇头）：我没有！我只是想给她一笔钱让她离开的！我曾派人调查玛莉，发现她这一生太苦太惨，我不想毁了她好不容易得来的安稳生活。（I didn't! I just wanted to buy her off so she’d walk away. I had her background checked, her life had already been a nightmare. I didn't want to screw up the peace she finally managed to build.)\n▲塞莱特斯抚摸着地下室的铁锁，缓缓转头看向了娜塔莉亚。\n塞莱特斯（哽咽，恐惧）：我放弃了接近布拉姆，可没多久，她就失踪了，尸骨无存！连警方也找不到！（I gave up on Bram. But not long after, she vanished. Even the police couldn't find her!）\n娜塔莉亚（惊讶）：什么？（What?）\n塞莱特斯（看向地下室）：没有人知道她去哪儿了……（No one knows where she went...）\n▲娜塔莉亚审视地看着地下室的门，目光又慢慢挪回塞莱特斯。\n娜塔莉亚（惊愕）：她是不是在这里面？（Is she locked down in there?）\n塞莱特斯（摇头）：我不知道，每一个靠近地下室的人不是死亡就是失踪了……（I don't know. Everyone who gets close to the basement either dies or disappears...）\n▲娜塔莉亚盯着地下室的门，后退了半步。\n娜塔莉亚（审视）：那你现在告诉我这些的目的是什么？（So why are you telling me this now?）\n▲塞莱特斯紧紧抓住娜塔莉亚的手臂。\n塞莱特斯：我怀疑是布拉姆杀了他们！我也试图解开地下室的秘密，布拉姆现在的目标肯定是我，你也靠近了，下一个就是你了！只有我们联手，才有机会逃离魔爪——（Because I'm betting Bram is the one who got rid of them! I tried digging into this basement myself. Now I'm sitting in his crosshairs, and since you've been sniffing around too, you're next on his hit list! Team up with me, or we're both dead.）\n娜塔莉亚（试探）：是你引我来地下室的？你想让我跟你绑在一起？（So you set me up? You dragged me into this just to use me as your shield?）\n塞莱特斯（绝望）：娜塔莉亚，别怪我，（捂着脸）我实在没有办法了，我不想死！（Natalia, don't blame me. I have no choice. I don't want to die!）\n娜塔莉亚（看向地下室的门）：那你想让我怎么做？（Then what do you want me to do?）\n塞莱特斯（坚定）：我需要你去勾引布拉姆！（I need you to seduce Bram!）\n▲娜塔莉亚惊讶，她还没来得及详细询问，突然一束光打在了两个人的脸上，两个人惊恐地抬头看向了楼梯口。\n▲布拉姆阴沉着脸，拿着手枪，带着配枪的安保，站在楼梯口。\n布拉姆（冷冽）：你们在这里干什么？（What do we have down here?）\n\n\n第十一集\n11-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲安保的枪口对准了娜塔莉亚，布拉姆一步一步走向了娜塔莉亚和塞莱特斯，娜塔莉亚和塞莱特斯几乎都是紧张地后退了半步，娜塔莉亚连忙将照片藏在了袖子里面。\n▲布拉姆一挥手，两个安保抓住一个男人过来，男人表情惊恐。\n男人：教父，我错了！我真的错了！（Godfather, I was wrong! I'm sorry!）\n布拉姆（子弹上膛）：无视我的规矩，窥探庄园的秘密，就要付出代价。（Break my rules, nose around my estate, and you pay with your life.）\n▲布拉姆的枪抵在了男人的肩膀上。\n男人：教父，求求您放过我吧，我没有想窥探您的秘密，我……（Godfather, mercy! I swear I wasn't snooping around! I—）\n▲娜塔莉亚想说话，塞莱特斯在黑暗中抓住了她的手示意她别开口。\n▲布拉姆表情冷漠，枪响，男人的尖叫声响起，娜塔莉亚捂着耳朵尖叫了一声，靠在墙上惊恐地看着男人被打穿了肩膀躺在地上哀号。\n布拉姆（抬手）：把人拖走，别惊扰了我的夫人，（视线落在了娜塔莉亚身上）还有尊敬的娜塔莉亚小姐。（Drag him away. We wouldn't want to upset my wife... or our lovely Miss Natalia.）\n▲安保将受伤的男人拖走，血流了一地，娜塔莉亚和塞莱特斯几乎不敢喘气，娜塔莉亚瞥了一眼塞莱特斯。\n布拉姆（看了一眼地下室的门）：你们来这里做什么？（So... what brings you two down here?）\n▲塞莱特斯被地上的鲜血刺激得后退了一步，娜塔莉亚看向她。\n娜塔莉亚OS：塞莱特斯夫人，如果你出卖我的话，就别怪我不客气了——（Throw me under the bus, Celeste, and I swear I'm taking you down with me—）\n▲塞莱特斯突然猝不及防的扇了娜塔丽亚一耳光。\n塞莱特斯：贱人！你竟敢污蔑我？（You bitch! How dare you set me up?）\n▲娜塔莉亚猛地抬头看向了塞莱特斯，眼神错愕。\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n\n\n第十二集\n12-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n塞莱特斯：贱人！你竟敢污蔑我梦游？还把我带到这个鬼地方，分明是想害我！（You bitch! How dare you lie and say I was sleepwalking?! You dragged me down to this hellhole to get me killed!）\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n布拉姆：是吗？敢污蔑我的夫人！（Is that so? You dared to frame my wife!）\n▲娜塔莉亚盯着塞拉特斯的脸，二人对视，仿佛空气都凝固了。\n娜塔莉亚（恢复镇静）：教父，夫人的确是梦游了！请相信我的专业判断。（Godfather, she really was sleepwalking. You have to trust my professional judgment.）\n塞莱特斯（愤怒）：胡说，你颠倒黑白，污蔑我有病，是不是想取代我的位置！（Bullshit! You're twisting the truth, trying to make me look crazy! You just want to take my place!）\n娜塔莉亚：夫人，地下室是禁地，如果您不是梦游，来地下室干什么？如果不是梦游，您有手有脚，又怎么会听我指挥？我只是怕您有危险，所以跟到了这里。（Ma'am, the basement is strictly off-limits. If you weren't sleepwalking, what were you doing down here? And why did you follow me without a word? I only came down because I was worried about your safety.）\n▲娜塔莉娅拨开布拉姆的枪，魅惑的看着布拉姆。\n娜塔莉娅：教父，您觉得我说的对吗？（Godfather, don't you think I'm right?）\n▲布拉姆冷眼盯着塞莱特斯和娜塔莉亚，塞莱特斯连忙抱住了布拉姆的手臂，疾言厉色地开口。\n塞莱特斯：布拉姆，她是在污蔑我！（看保安）保安，把这个女人驱逐出去！（Bram, she's framing me! Guards, throw this woman out!）\n▲保安目光看布拉姆，没有动，布拉姆的表情松动，拍了拍塞莱特斯的手。\n布拉姆：塞莱特斯，冷静点儿，我会请最权威的精神科医生医生来对你进行评估。（看保安）带夫人去休息。（Celeste, calm down. I'll have the best psychiatrist come take a look at you. Take my wife to rest.）\n塞莱特斯（故作惊讶）：我才是你的妻子！你宁愿相信这个外来者也不相信我？（I'm your wife! You’re taking the word of a stranger over mine?）\n布拉姆（呵斥）：回去休息！（Go rest!）\n▲塞莱特斯惊愕，布拉姆拍了拍塞莱特斯的肩膀放缓了语气。\n布拉姆（安抚）：亲爱的，我这都是为了你好，快去休息吧。（Sweetheart, I'm doing this for your own good. Now go get some sleep.）\n▲塞莱特斯和娜塔莉亚对视了一眼。\n▲塞莱特斯气冲冲地离开了，布拉姆转了一圈手枪，用枪挑起娜塔莉娅的下巴。\n布拉姆（威胁）：娜塔莉亚，我的宝贝，告诉我，你来地下室的真正目的。（Natalia, my sweet... now tell me the real reason you're down here.）\n\n第十三集\n13-1\n夜  内   地下室\n人物 娜塔莉亚  布拉姆   安保若干 \n▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。\n娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！（Bram doesn't buy our story. Better to admit part of it than keep hiding.）\n▲娜塔莉亚盯着布拉姆的眼睛，突然上前一步，抱住了布拉姆。\n娜塔莉亚（故作惊恐）：教父！请原谅我！是我趁她梦游，故意把她引到了这里。（Godfather, please forgive me! I knew she was sleepwalking, so... I intentionally led her down here.）\n▲布拉姆惊讶地低头看着娜塔莉亚的，他放下了枪，抚着娜塔莉亚的后背开口。\n布拉姆（惊讶）：你故意的？（You did it on purpose?）\n娜塔莉亚（握拳）：是的，我只是个医生，不是她的佣人，可她却当众掌我嘴，我只想给她一个小小的教训！（Yes. I'm just a doctor, not her maid, but she slapped me in public. I just wanted to teach her a little lesson!）\n▲布拉姆盯着娜塔莉亚的模样，勾起嘴角。\n布拉姆OS：有趣，聪明，但也仅仅是个猎物！（Spicy, and sharp. But still just a mouse playing with a cat.）\n▲布拉姆挑眉，指尖划过了娜塔莉亚的脸颊。\n布拉姆（试探）：那你恨吗？想不想将她踩在脚下？（So do you hate her? Want to grind her into the dirt?）\n▲布拉姆话音落下，娜塔莉亚听到了子弹上膛的声音，娜塔莉亚扫了一眼那些枪口，格外紧张，心跳加速。\n娜塔莉亚（抬头看向布拉姆）：我不是神，当然会恨夫人。（愤恨）但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。（I’m no saint, so yeah, I despise her. But what really pisses me off is this rigged system. I hate the elite, even while I’m dying to have everything they’ve got.）\n▲布拉姆盯着娜塔莉亚，布拉姆突然推开娜塔莉亚，举起枪，对准了娜塔莉亚的额头。\n布拉姆：这番话，足以让你丧命！（Those words could get you killed!）\n▲娜塔莉亚不为所动，她伸出手轻轻抚摸着布拉姆的脖子，从他的肩膀抚摸到他的心口。\n娜塔莉亚（坚定）：但我说的都是真话！（放软声音）教父，难道您不恨他们吗？（But I'm telling the truth! Godfather, don't you hate them too?）\n▲布拉姆突然笑了，轻轻鼓了鼓掌。\n布拉姆（欣赏）：很好，我欣赏敢于坦诚欲望的人。（抚摸娜塔莉亚的肩膀）但你的目的远不止这些吧。（Good. I admire people who are honest about their desires. But your goal is more than that, isn't it?）\n▲娜塔莉亚惊愕地看着布拉姆，二人对视，娜塔莉亚紧张了起来。\n娜塔莉亚（紧张）OS：塞莱特斯都能查到我的身份，布拉姆会知道吗？（握拳）豁出去了！（ Celeste found out who I am. Does Bram know? Screw it!）\n▲娜塔莉亚山前一步，指尖轻轻揭开了布拉姆衣服的扣子，布拉姆一把抓住了娜塔莉亚的手。\n布拉姆（警惕）：你想干什么！（What do you want?）\n▲娜塔莉亚垫脚靠近布拉姆的耳朵，手从他的胸口滑落到腹部，腰部，最后勾住了他的皮带。\n娜塔莉亚（妩媚）：教父，我曾远远见过您一次，便深深爱上了您！我进入庄园，都是为了您呀。（Godfather, I saw you once from a distance, and I fell for you. I came into this estate for you.）\n▲布拉姆一惊，喉结滚动了一下，目光掠过娜塔莉亚的脸颊和脖子。\n布拉姆OS：这个妖精，真想把她绑起来，玩个痛快！可惜现在还不到时候！（What a seductive little vixen. God, I want to break her. But the game’s just getting started.）\n▲布拉姆一把抓住了娜塔莉亚的手，阻止她的动作。\n布拉姆（故作冷漠）：够了！回你的住处去，记住，不要试图窥探这里的秘密，它会让你死的很惨！（Enough! Go back to your room. And remember—don't dig into this place's secrets. It'll get you killed.）\n▲娜塔莉亚连忙低下头去，绕过了布拉姆，提着裙摆上楼了，她回头看了一眼地下室的铁门上的锁。\n【闪回】\n13-2  （衔接10-1）\n夜  内   地下室门口\n人物  娜塔莉亚   塞莱特斯\n▲塞莱斯特抓住娜塔莉亚的手。\n塞莱特斯（情绪激动）：我需要你去勾引布拉姆！只要你帮我，我就告诉你地下室的钥匙在哪儿！（I need you to seduce Bram! Help me, and I'll tell you where the basement key is!）\n▲娜塔莉亚看了一眼锁，又看向了塞莱特斯。\n娜塔莉亚：我可以答应你！钥匙在哪儿？（I'll do it. Where's the key?）\n塞莱特斯（紧张）：是一把纯金的钥匙，就在布拉姆身上！（It's a solid gold key. and Bram keeps it right on him!）\n【闪回结束】\n▲娜塔莉亚不动声色地将目光从地下室门口，挪到了布拉姆的身上，布拉姆正烦躁地揭开了衬衣上面的三颗扣子，一道金色光芒在他衣服里面一闪而过。\n娜塔莉亚（惊讶）OS：那是钥匙吗？（坚定）我一定会取得布拉姆的信任，拿到地下室的钥匙，救出姐姐！（Was that it? The key? Watch your back, Bram... I'll win your trust, steal it, and tear this hellhole apart to save my sister.）\n13-2\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯站在窗前，忐忑地看着夜色。\n塞莱特斯（紧张）OS：都这么久了，希望娜塔莉娅没出什么危险。（It's been so long. I hope Natalia's okay.）\n▲这时，布拉姆推开了塞莱特斯的房间门，塞拉特斯被吓了一跳，他穿着睡衣，脸上带着温和的笑容。\n布拉姆（步步靠近）：塞莱特斯，这个世界上，唯有我最爱你。你应该牢记这一点。（Celeste, in this world, no one loves you like I do. Remember that.）\n▲塞莱特斯一步一步后退，布拉姆将她抵在了墙上。\n塞莱特斯：布拉姆！你想干什么？（Bram! What do you want?）\n▲布拉姆将一个盒子递给了塞莱特斯。\n布拉姆（笑）：但愿这里面的东西，能让你认清现实。（I hope this helps you see reality.）\n\n\n第十四集\n14-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n▲塞莱特斯脸色发白，紧紧握着裙摆，录音笔还在响。\n娜塔莉亚vo：但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。..(What really pisses me off is this rigged system. I hate the elite—even while I’m dying to have everything they’ve got.）\n▲布拉姆的手指拂过塞莱特斯的脸颊。\n布拉姆（蛊惑）：听见了吗？她恨你，她嫉妒你的出身，她想毁了你。只有我才能保护你！（Hear that? She hates you. She's jealous of your bloodline. She wants to destroy you. Only I can protect you!）\n▲塞莱特斯盯着录音笔，握紧了拳头。\n塞莱特斯OS：娜塔莉亚已经出卖了我？（Did she just throw me under the bus?）\n布拉姆（语气温和）：告诉我，她是怎么样蛊惑你的？（轻轻拥抱塞莱特斯）我会保护你不被伤害。（Now, tell me... how did she get into your head? Trust me, I'll keep you safe.）\n▲塞莱特斯心跳加速，她盯着录音笔，噗嗤一声笑了。\n塞莱特斯（骄傲地抬头）：我出身贵族，觊觎我身份的人太多了，她们嫉妒我、羡慕我，想害我，我习惯了。（I was born noble. So many people want my place. They're jealous, envious, out to hurt me. I'm used to it.）\n▲布拉姆脸上的温和瞬间消失了，他推开塞莱特斯，将录音笔狠狠摔在了地上，塞莱特斯被布拉姆突然变脸吓得捂住了耳朵。\n布拉姆（训斥）：你太狂妄自大了！你的傲慢会招来杀身之祸，唯有我可以庇护你！（You're too arrogant! Your pride will get you killed. Only I can shelter you!）\n▲布拉姆扯下她捂着耳朵的手，靠近她的耳朵。\n布拉姆（质问）：告诉我，你为什么要去地下室！你是不是也想知道里面有什么？（Tell me, why did you go to the basement? You want to know what's in there too, don't you?）\n▲塞莱特斯惊恐。\n塞莱特斯（抬头盯着布拉姆）：不不不——我不知道！是……是娜塔莉亚陷害我！（No, no, no—I don't know! It's... Natalia framed me!）\n▲布拉姆狠狠将塞莱特斯甩在了床上。\n布拉姆（拿出枪）：很好！（上膛）那我现在就去杀了她。（Good. Then I'll go kill her right now.）\n▲布拉姆举着枪大步流星地往外走，塞莱特斯吓坏了，连忙喊道。\n塞莱特斯：不，不是——我说实话！（No, wait—I'll tell the truth!）\n14-2\n夜  内  走廊\n人物  娜塔莉\n▲娜塔莉亚站在门口，耳朵贴在了门上。\n塞莱特斯vo：不，不是——我说实话！（No, wait—I'll tell the truth!）\n▲塞莱特斯的声音从门内传来，娜塔莉亚惊讶地猛地捂住了嘴巴。\n\n\n第十五集\n15-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆猛地回头，用枪挑起了塞莱特斯的下巴。\n布拉姆：那是什么？（威胁）你想背叛我？（What was that? You want to betray me?）\n▲塞莱特斯额头上冒出冷汗，颤抖地开口。\n塞莱特斯：是因为她白天勾引你，所以我故意装梦游，引她去地下室，我想要杀了她！（Because she seduced you today, I pretended to sleepwalk and lured her to the basement. I wanted to kill her!）\n▲布拉姆的表情松动了半分，布拉姆收了枪，轻轻抚摸着塞莱特斯的头发。\n布拉姆（温和）：我很高兴你如此在乎我。（Good. I do love it when you get jealous.）\n▲塞莱特斯颤抖了一下，布拉姆的脸上露出了笑容轻吻了她的额头\n布拉姆：放心，我只爱你一个人，不会被其他女人蒙骗。（Don't worry. I only love you. I won't be fooled by other women.）\n▲布拉姆将塞莱特斯搂在怀中，看着窗户上的影子，嗤笑了一声。\n布拉姆OS：竟然学会了互相掩护。（抚摸塞莱特斯的背影）当你不想让我杀了她的时候，你就已经露出了破绽。（Covering for each other now, are we? The second you stepped in to save her neck, you blew your cover.）\n▲布拉姆将塞莱特斯推到在了床上，开始脱衣服。\n布拉姆（解开皮带，放在手中把玩）：塞莱特斯，你能依靠的只有我一个，你会听话对吗？（Celeste... I'm all you've got in this world. You're gonna be a good girl for me, aren't you?）\n▲塞莱特斯看着浑身发抖，连忙后退，她拼命地摇头。\n塞莱特斯（颤抖求饶）：布拉姆，我，我身体不太舒服，我不想……（Bram, I... I don't feel well. I don't want to...）\n▲布拉姆一把抓住了塞莱斯特的手，眼神凶狠，撕开了她的上衣。\n布拉姆（故作温和）：拒绝我，你以前不是很喜欢我的占有吗？（Saying no to me? You used to crave it when I took control.）\n▲塞莱斯特惊慌失措，想挣扎，布拉姆突然松开她，捂住了她的嘴巴。\n布拉姆（警告）：嘘——有老鼠偷听。（Shh... we have a little eavesdropping rat outside.）\n▲布拉姆手中的手枪上膛，一步一步走向了门口。\n▲切镜。\n▲走廊上，娜塔莉亚正靠在门口听里面的动静，这时，门突然开了，布拉姆手中的枪突然抵在了娜塔莉亚的脑袋上。\n▲娜塔莉亚震惊。\n\n\n第十六集\n16-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚抬头看着布拉姆，布拉姆上半身的衬衣敞开着，他的一只手拿枪口抵着娜塔莉亚的脑袋，一只手关上了门，冷眼看着娜塔莉亚。\n布拉姆（深呼吸）：你在这儿干什么？我不是让你回房间吗？（What are you doing here? Didn't I tell you to go back to your room?）\n▲娜塔莉亚打量着布拉姆的样子，握紧了拳头。\n娜塔莉亚OS：看来我坏了他的好事——（Guess I ruined his little fun—）\n▲娜塔莉亚上前一步，轻轻抚摸着布拉姆裸露的胸膛。\n娜塔莉亚（撒娇）：教父，我不想你和夫人发生关系，我想……（Godfather... I couldn't stand the thought of you touching her. I want... ）\n▲布拉姆一惊，握着手枪的手放了下去，娜塔莉亚的手在布拉姆的身上随意地抚摸了起来。\n娜塔莉亚（着急）OS：钥匙到底在哪儿！（Where the hell is the key?）\n▲布拉姆突然一把抓住了娜塔莉亚的手，眼神带着侵略性地落在了娜塔莉亚的身上。\n布拉姆（捏住了她的下巴）：这么着急取代她？（Can't wait to take her place, huh?）\n▲娜塔莉亚抬头看向了布拉姆，一脸无辜。\n娜塔莉亚（后退）：教父……（Godfather...）\n▲布拉姆瞧着娜塔莉亚的样子，一步一步逼近娜塔莉亚。\n布拉姆：娜塔莉亚，既然是你主动送上门，我就不客气了！（Natalia, since you came to me, I won't hold back!）\n▲布拉姆握住了娜塔莉亚的手腕，一把将她拉在了自己的怀中，低头要吻她，娜塔莉亚几乎是下意识的避开。\n娜塔莉亚OS：禽兽，竟然来真的！（You animal—he's serious!）\n▲布拉姆目光极具侵略性，一步一步逼近娜塔莉亚，他抓住娜塔莉亚的手，让娜塔莉亚的手从他的胸膛一直往下摸到下腹，娜塔莉亚想要收回手，却被布拉姆死死摁住了手。\n布拉姆（蛊惑）：娜塔莉亚，这可是你取代塞莱特斯的机会，你不要吗？权力、财富、地位，你马上就能拥有。（Natalia, this is your chance to replace Celeste. You don't want it? Power, wealth, status, you can have it all.）\n▲娜塔莉亚惊愕地看着布拉姆，露出乖巧的笑容。\n娜塔莉亚（轻点布拉姆的心口）：虽然我很想要，但是……（撒娇）教父，我来月经了，等经期过了……（I really want it, but... Godfather, I'm on my period. Can you wait until it's over？）\n▲布拉姆握住了娜塔莉亚的手。\n布拉姆（嗤笑）：是吗？内裤脱了，我检查。（Is that so? Take off your underwear. Let me check.）\n▲娜塔莉亚不敢置信地盯着布拉姆。\n娜塔莉亚（震惊）：什么？（What?）\n\n\n第十七集\n17-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚后退了一步，抵在了门上，布拉姆逼近一把捏住了娜塔莉亚的下巴，一把捏着她的下巴，将她的脸转过来，威胁着开口。\n布拉姆（喘息）：你不是爱我吗？不是想取代塞莱斯特吗？拿出你的诚意来！（威胁）不然的话，我不介意让我的狼加餐！（You love me, don't you? You say you want to take Celeste's place？Show me your loyalty, or I’ll feed you to my wolves tonight.）\n▲远处传来狼的嚎叫声，气氛突然变得紧张了起来，娜塔莉亚心跳加速。\n▲这时，戴安娜站在走廊尽头大喊。\n戴安娜（大喊）：娜塔莉亚姐姐，爸爸，快来看我画的画！（Natalia! Daddy! Look what I drew!）\n▲布拉姆看到戴安娜，立刻整理了一下自己的衣服，眼神不悦地落在了戴安娜的身上。\n布拉姆（冷冽）：戴安娜！谁允许你出来的？（Diana! Who gave you permission to leave your room?）\n▲戴安娜举着画，画上画着一个生日蛋糕。\n戴安娜（委屈）：爸爸的生日快到了，我只是想送爸爸一个礼物，让爸爸开心。（Daddy's birthday is coming. I just wanted to give you a gift and make you happy.）\n▲布拉姆收起了枪，走向了戴安娜，伸手摸了一下她的头发。\n布拉姆（不耐烦）：你的心意，我收到了，回房间去。（I got it. Go back to your room.）\n▲戴安娜看了一眼布拉姆，又看向了娜塔莉亚，低着头看着生日蛋糕说。\n戴安娜：以前爸爸的生日宴会，都是妈妈亲手做的蛋糕，妈妈去哪儿了？我想妈妈……（Mommy always baked your cake for your birthday... Where did she go? I really miss her, Daddy...）\n▲布拉姆冷漠呵斥。\n布拉姆（呵斥）：戴安娜！闭嘴！（Diana! Shut up!）\n▲戴安娜被吓到了，哇的一声就哭了，娜塔莉亚立刻扑过去，将戴安娜抱起来，回头看向了布拉姆。\n娜塔莉亚（看向布拉姆）：先生，小姐的病情本就不稳定，您别刺激她！（Sir, her condition is unstable. Don't trigger her!）\n▲戴安娜抱着娜塔莉亚的脖子失声痛哭，布拉姆烦躁地挥了一下手，看向了娜塔莉。\n布拉姆：把她带回房间去！（Take her back to her room!）\n▲娜塔莉亚抱着戴安娜转身回戴安娜的房间，布拉姆盯着娜塔莉亚的背影，目光最后落在了她的臀部。\n布拉姆OS：有点小聪明，但也只是个落入囚笼的兔子而已！（A little clever, but still just a rabbit in a cage.）\n▲布拉姆推开了塞莱特斯的房间门走了进来，里面传来了塞莱斯特的尖叫声。\n\n\n第十八集\n18-1\n夜  内   戴安娜房间\n人物  戴安娜   娜塔莉亚\n▲戴安娜在娜塔莉亚的怀中，指着画上的蛋糕，有些委屈的开口。\n戴安娜（抹眼泪）：以前妈妈在的时候，爸爸从不会凶我，还会陪我过生日，我好想妈妈。（When Mommy was here, Daddy never yelled at me. He celebrated my birthday with me. I miss Mommy.）\n▲娜塔莉亚的目光落在了戴安娜手中的画上。\n【闪回（蛋糕定格切镜到小面包）】\n夜  内  娜塔莉亚小时候的家\n人物  小娜塔莉亚  小玛莉\n▲桌上摆放着一个小面包，面包上插着蜡烛，小玛莉看着小娜塔莉亚摸了摸她的脑袋。\n小玛莉（声音稚嫩）：等以后，姐姐给你买个真正的生日蛋糕！（安抚）许个愿吧。（Someday, sis, I'll get you a real birthday cake. Now, close your eyes and make a wish.）\n▲小娜塔莉亚看着插着蜡烛的面包。\n小娜塔莉亚（高兴）：那我的愿望是，和姐姐永不分离！（My wish is for us to stay together forever and ever!）\n▲小娜塔莉亚吹蜡烛，黑幕。\n【闪回结束】\n▲娜塔莉亚看着画，又低头看着熟睡的戴安娜，她紧紧将戴安娜抱在怀中。\n娜塔莉亚（坚定）OS：我会救出姐姐，让戴安娜和她的母亲团聚！（I swear I will rescue my sister... and bring Diana’s mother back to her.）\n18-2\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣端着托盘，托盘里面放着药往塞莱特斯的房间走，娜塔莉亚从戴安娜房间里面出来。\n娜塔莉亚（盯着女佣）OS：过几天是布拉姆的生日宴，是个能利用的机会。（Bram's birthday banquet is in a few days. That's a chance.）\n▲就在女佣靠近时候，娜塔莉亚一不小心撞到了女佣，女佣手中的托盘差点翻了，娜塔莉亚伸手托住了女佣的手腕，一只手扶住药碗。\n娜塔莉亚：小心！（Careful!）\n女佣：感谢小姐。（Thank you, miss.）\n▲女佣端着药要进入塞莱特斯的房间。\n娜塔莉亚OS：希望塞莱特斯能看到我传递给她的信息！（I hope Celeste sees my message!）\n▲这时，布拉姆走了出来。\n布拉姆（看女佣）：等一等——（Wait—）\n▲娜塔莉亚回头紧张地看着布拉姆。\n娜塔莉亚OS：千万别被布拉姆察觉破绽。（Don't let Bram spot anything.）\n▲布拉姆抬头看了一眼娜塔莉亚，嗤笑了一声。\n布拉姆：你在紧张什么？（Why the jittery face, Natalia?）\n娜塔莉亚（摇头）：不，我刚才不小心把夫人的药撞洒了些……（Nothing. I accidentally spilled some of her medicine earlier...）\n▲布拉姆一步一步走了过来，目光看向了女佣手中的托盘，他用勺子搅了一下药，又将碗端起来检查了一下。\n布拉姆（审视）：洒了吗？（Did it spill?）\n娜塔莉亚（紧张）：一点点……（Just a tiny bit..）\n▲娜塔莉亚盯着布拉姆的动作，心跳加快，目光看向了托盘。\n▲布拉姆看了一眼娜塔莉亚，又顺着娜塔莉亚的目光落在了女佣手中的托盘上。\n布拉姆（冷冽）：将托盘翻过来。（Flip the tray over. Now.）\n▲布拉姆拿出手枪，子弹上膛，娜塔莉亚的目光盯着女佣的动作，女佣缓缓将托盘翻过来——\n\n\n第十九集\n19-1\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣听话地将托盘翻了过来，下面什么都没有，布拉姆这才将药碗放在了托盘上，目光又看向了女佣。\n布拉姆（冷冽）：药给我，我拿进去。（Hand it over. I'll take it to her myself.）\n▲女佣听话地将药碗递给了布拉姆，娜塔莉亚眼神一变，一把抱住了布拉姆的手臂。\n娜塔莉亚（委屈）：教父~您就这么关心夫人？（Godfather, you care about her that much?）\n▲布拉姆一愣，低头看向了娜塔莉亚。\n布拉姆（捏娜塔莉亚的脸）：吃醋了？（Jealous?）\n▲娜塔莉亚松开了布拉姆的手臂，转身背对布拉姆。\n娜塔莉亚（不高兴了）：我怎么会吃醋？我有什么资格吃醋？（Why would I be jealous? I have zero right to be.）\n▲布拉姆抓住了娜塔莉亚的手臂，将她拉入了自己的怀中。\n布拉姆（捏娜塔莉亚的脸）：你长得很像一个人。（You know... you really remind me of someone..）\n▲娜塔莉亚不动声色地抬头看向了布拉姆，指尖轻轻点了点他的胸口。\n娜塔莉亚（乖巧）：什么人？情人还是爱人？您不会拿我当替身吧。（Oh? An ex-lover, or a wife? Don't tell me I'm just some cheap stand-in.）\n▲布拉姆握住娜塔莉亚的手，轻轻吻了吻她的指尖。\n布拉姆（嗤笑）：她可没有你这么大胆。（打量娜塔莉亚）也没有你这么诱人~（She wasn't as bold as you. Or as tempting.）\n▲娜塔莉亚勾着布拉姆的皮带，让他一步步靠近。\n娜塔莉亚（乖巧）：教父昨晚不是说要检查吗？我准备好了……（Godfather, didn't you say you wanted to check last night? I'm ready...）\n▲布拉姆喉结滚动了一下，一步一步靠近娜塔莉亚，女佣立刻低着头，一只手托着托盘，打开门进入了塞莱特斯的房间。\n18-2\n日 内  塞莱特斯房间\n人物 塞莱特斯  女佣\n▲塞莱特斯看着女佣端着咖啡进来，声音冰冷地开口。\n塞莱特斯：出去，我没有病，我不喝这些药！（Get out. I'm not sick. I'm not drinking this!）\n女佣（为难）：夫人，教父下令，我必须看着您喝下去。（Ma'am, please... the Godfather’s orders. I have to watch you finish it.）\n▲塞莱特斯刚想发火，突然看见女佣的衣袖袖口位置贴了一张极小的纸条。\n塞莱特斯（不动声色）：喝就喝——（Fine, I'll drink—）\n▲她伸手抓住了女佣的手腕顺手将纸条取了下来，随后端起碗一口喝了下去，将空碗扬了扬。\n塞莱特斯：你可以滚了！（You can get lost now!）\n▲女佣低着头逃一般离开，塞莱特斯立刻看纸条。\n娜塔莉亚（旁白）：宴会捉奸，帮您离开，希望您当众将地下室的秘密揭露出来，助我一臂之力！同意就摔碗为信号。（Catch him cheating at the party, and I'll help you walk free. Expose the dark secret of the basement in front of everyone, and we both win. Drop the bowl as a signal.）\n▲切镜。\n▲走廊上，布拉姆一把将娜塔莉亚抗在了肩上，大步流星往自己的方向走。\n布拉姆（拍娜塔莉亚的臀）：小妖精，我今天就让你爽个够！（You little vixen. I'm gonna rock your world today!）\n▲娜塔莉亚趴在布拉姆的肩膀上，看向了塞莱斯特的房门。\n娜塔莉亚OS：三、二、一……（Three, two, one...）\n▲突然，塞莱特斯房间里面传来打碎了碗的声音，布拉姆脚步一顿！将娜塔莉亚放下。\n娜塔莉亚OS：合作达成！(Deal!）\n布拉姆（看向塞莱特斯的房间，不悦）：我去看看她又在闹什么！（Let me see what she's up to now!）\n▲娜塔莉亚一把抓住了布拉姆的手。\n娜塔莉亚（撒娇）：教父~（Godfather.）\n▲布拉姆回头看了一眼娜塔莉亚。\n布拉姆（安抚）：生日宴时，她父母会来，你也不想她到时候闹事，对吧！（Her parents will be at the birthday banquet. You don't want her making a scene, right?）\n▲娜塔莉亚故作委屈松手。\n娜塔莉亚（叹气）：好吧，那我就先忍一忍~（Fine. I'll hold it in for now.）\n▲布拉姆走向了塞莱特斯的房间，娜塔莉亚转身往戴安娜的房间走。\n娜塔莉亚（看门）OS：希望能在宴会上，引塞莱特斯的父母出手打开地下室，如果失败了，我也能乘机拿到钥匙，救出姐姐！（Let’s hope Celeste’s parents play their part and blow the basement wide open. But if that plan tanks... I’ll just swipe the key myself and tear this place down to save my sister.)\n\n\n第二十集\n20-1\n日  内  塞莱特斯房间\n人物  布拉姆 塞莱特斯  管家\n▲塞莱特斯睡在了床上，布拉姆坐在窗边上，管家恭敬地看着布拉姆。\n管家：先生，家庭医生给夫人打了镇定剂，她应该不会再闹了。（Sir, the doctor loaded her up with sedatives. She’s out cold; she won’t be making a scene anymore.)\n▲布拉姆点了点头。\n布拉姆（冷冽）：不管如何，宴会之前别让她惹出事情。（Either way, don't let her cause trouble before the banquet.）\n管家（不解）：教父，您明知道夫人和娜塔莉亚在联手动手脚？为什么不阻止她们？（Godfather, you know Celeste and Natalia are working together. Why not stop them?）\n▲布拉姆看了一眼塞莱特斯，嗤笑了一声。\n布拉姆（不屑）：两个落入狼群的兔子，能翻出什么浪花？顶多两个有趣的猎物而已！（Two rabbits in a wolf pack. What can they do? Just two little rabbits for me to play with.）\n20-2\n日  内  宴会厅\n人物  布拉姆  娜塔莉亚  塞莱特斯   戴安娜  宾客若干   莱恩  伊丽莎白\n▲宴会厅金碧辉煌，娜塔莉亚带着戴安娜在甜品区吃糕点，娜塔莉亚远远看着塞莱特斯挽着布拉姆的手，正在和一对夫妇聊天，女人打扮华丽【塞莱特斯母亲 伊丽莎白】，男人【塞莱特斯父亲 莱恩】看起来风度翩翩，举手投足都十分贵气，塞莱特斯似乎察觉了娜塔莉亚的目光，二人对视了一眼互相点头。【Celeste’s Mother, Elizabeth】【Celeste’s Father, Ryan】\n▲娜塔莉亚亲眼看着塞莱特斯将一杯酒递给了布拉姆，布拉姆将酒一口喝了。\n娜塔莉亚OS：上钩了，这酒里的可是好东西。（Got him. There’s something extra in that drink.）\n▲戴安娜看了过去。\n戴安娜：那是塞莱特斯夫人的妈妈，（情绪低落）我也好想我的妈妈呀。（That's Celeste's mom. I miss my mommy too.）\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的戴着帽子的男性客人，路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n男客人（伸手扶娜塔莉亚和戴安娜）：抱歉。（My apologies.）\n▲娜塔莉亚摇了摇头。\n娜塔莉亚：我没什么大碍。（I'm fine.）\n▲布拉姆听到这边的动静，立刻看了过来。\n布拉姆（担心）：发生了什么事？（What happened?）\n男客人（歉意）：教父，不好意思，我差一点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n▲布拉姆故作绅士。\n布拉姆：不必介怀，请您继续享用晚宴吧。（No worries. Enjoy the banquet.）\n▲布拉姆摸了摸戴安娜的脑袋。\n布拉姆：我的小公主，玩的开心吗？（My little princess, having fun?）\n戴安娜（点头）：嗯！（Yeah!）\n布拉姆（温和）：宾客太多了，你跟娜塔莉亚医生回房间好不好？（Too many guests. Go back to your room with Dr. Natalia, okay?）\n戴安娜：可是我还没玩儿够……（But I'm not done playing...）\n娜塔莉亚（抱起）：小姐，我们听教父的话，（柔声安抚）回房间我给你讲故事好不好？（Miss Diana, let's listen to the Godfather. I'll tell you a story in your room, okay?）\n▲就在娜塔莉亚准备离开时，塞莱特斯突然举着酒杯过来，笑着对布拉姆说。\n塞莱特斯：布拉姆，父亲让你陪他喝一杯——啊！（Bram, Father wants you to have a drink with him—ah!）\n▲塞莱特斯突然脚下一滑，一杯酒一下子泼到了布拉姆的身上，众人齐刷刷地看了过去。\n▲布拉姆昂贵的西装被打湿，看上去有些狼狈。\n塞莱特斯（震惊）：哦～天啊！布拉姆，我不是故意的。（Oh my God! Bram, I didn't mean it.）\n▲众目睽睽下，布拉姆强忍怒气，对着塞莱特斯露出了温和的笑容。\n布拉姆（安抚）：别太自责，我去换套衣服，你照顾一下宾客！（Don't blame yourself. I'll go change. You take care of the guests.）\n▲布拉姆优雅转身离开，塞莱特斯给娜塔莉亚使了个眼神，娜塔莉亚立刻点了点头。\n塞莱特斯（兴奋）OS：今夜过后，我就能离开了，娜塔莉亚，你可千万别让我失望！（After tonight, I'll be free. Natalia, don't let me down!）\n20-3\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲敲门声响起，布拉姆赤裸着上身开门。\n布拉姆（烦躁）：送个衣服都这么慢，当心我崩了你们……（What’s taking so long with those clothes? I swear, I’ll shoot you if...）\n▲布拉姆的声音戛然而止，只见娜塔莉亚穿着一条性感的低胸吊带连衣裙，抱着西装站在门口。\n布拉姆（惊愕）：娜塔莉亚？你穿成这样来干什么？（Natalia? What the hell are you wearing?）\n\n\n第二十一集\n21-1\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n娜塔莉亚（挑眉）：教父不喜欢刺激吗？（抚摸布拉姆的胸膛）还是，您有别的顾虑？（What’s wrong, Godfather? Don't tell me you're scared of a little excitement...）\n▲布拉姆看着娜塔莉亚，眼神从惊愕变成了玩味。\n布拉姆（捏住了娜塔莉亚的下巴）：激将法对我可没用！（笑）不过，我现在的确想把你吃掉！（Reverse psychology won't work on me, sweetheart. Though... I've got to admit, I'm dying to devour you right now.）\n▲布拉姆四下看了一眼，没看见人，他抓住了娜塔莉亚的手臂，将她抗在了自己的肩膀上，然后锁上了门。\n▲塞莱特斯看着布拉姆将娜塔莉亚拉入了房间，嘴角勾起了一个弧度，她转身向宴会厅走去。\n21-2\n日  内  宴会厅\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白\n▲宴会厅中，伊丽莎白挽着莱恩的手，正在和宾客寒暄，塞莱特斯一把抓住了伊丽莎白的衣服。\n塞莱特斯：妈妈，布拉姆出轨了。（Mom, Bram is cheating.）\n▲众人震惊，目光惊愕地盯着塞莱特斯，伊丽莎白迅速捂住了塞莱特斯的嘴巴。\n伊丽莎白（警告）：塞莱特斯！不要胡说！我想布拉姆应该不是这种人。（Celeste! Don't talk nonsense! I don't think Bram is that kind of man.）\n▲塞莱特斯摇了摇头，挣脱了伊丽莎白的手，拽着她往楼上走。\n塞莱特斯（委屈）：我亲眼看到他和一个女人进入了房间里面，请您相信我！（I caught him with my own eyes! He slipped into that room with a woman, you have to believe me!）\n▲众目睽睽之下，塞莱特斯和莱恩对视了一眼，莱恩将酒杯放在了桌子上。\n莱恩（冷哼）：哼，如果布拉姆敢背叛你，我绝不会放过他！（Hmph. If Bram dares to betray you, I won't let him get away with it!）\n▲莱恩大步流星地往房间走，塞莱特斯拉着伊丽莎白跟了上去，宾客们也跟着去看热闹。\n21-3\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚\n▲布拉姆垂眸盯着站在自己面前的娜塔莉亚，眼神透着审视。\n布拉姆（捏娜塔莉亚的手）：今天是我的生日宴，外面都是宾客，你想害我？嗯？（It's my birthday banquet. Guests are everywhere. You want to set me up? Hmm?）\n▲娜塔莉亚轻轻抚摸着布拉姆的脖子。\n娜塔莉亚（笑）：怎么会？（靠近布拉姆的耳朵）今天是您的生日。这是我特地为您准备的生日礼物！（Of course not. It's your birthday. This is a birthday gift I prepared just for you!）\n布拉姆（捏娜塔莉亚的腰）：把你自己当做礼物送给我？（Giving yourself to me as a gift?）\n▲娜塔莉亚缓缓拉下了自己的一根肩带，手在布拉姆身上摸索。\n娜塔莉亚（点头）：当然，过了今夜，您就是我的第一个男人，也是唯一的……（Of course. After tonight, you'll be my first man, and my only...）\n▲布拉姆喉结滚动了一下，一翻身，将娜塔莉亚压到身下！\n▲切镜。\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲门突然被大力踹开，娜塔莉亚和布拉姆猛地抬头，塞莱特斯带众人站在门口。\n塞莱特斯（呵斥）：你们在干什么——（What the hell is going on here?）\n\n\n第二十二集\n22—1日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。\n塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）\n▲娜塔莉亚对视塞莱特斯摇了摇头。\n【闪回】\n22-2\n日  内  布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲突然，外面传来了敲门声。\n女佣vo：教父，夫人带着伯爵和伯爵夫人过来了。（Godfather, Madam is here with the Count and Countess.）\n▲娜塔莉亚惊讶，下一刻，布拉姆突然清醒过来，一把将娜塔莉亚推开。\n布拉姆：快把衣服穿好！（Get dressed. Now!）\n【闪回结束】\n▲布拉姆带着温和的笑容，看向了塞莱特斯和莱恩夫妇。\n布拉姆（优雅）：爸妈怎么过来了？（Father, Mother... what a pleasant surprise. Is something wrong?）\n莱恩（尴尬）：你太久没出来，我们过来瞧瞧。（You've been missing for quite a while. We were getting concerned.）\n塞莱特斯（指着布拉姆）：娜塔莉亚怎么在这里？你们孤男寡女躲开宾客在这里面做什么？（Why is Natalia here? What are you two doing alone away from the guests?）\n布拉姆（从容）：戴安娜在宴会上受到了一些惊吓，娜塔莉亚正在向我汇报，有问题吗？（Diana got a little scared at the banquet. Natalia was briefing me on her condition. Is there a problem?）\n塞莱特斯（呵斥）：什么问题非要现在汇报？（看娜塔莉亚）你说，你们在这里面干什么？！（What could be so urgent it couldn't wait until tomorrow?! You! Tell them the truth! What were you doing in his room?）\n▲塞莱特斯的情绪特别激动，目光死死盯着娜塔莉亚，眼神带着祈求。\n塞莱特斯：你说啊！（Say it!）\n▲所有人的目光都落在了娜塔莉亚的身上。\n娜塔莉亚（握紧报告）OS：塞莱特斯，对不起了。（Celeste, I'm sorry.）\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n▲塞莱特斯惊愕地看着娜塔莉亚。\n塞莱特斯（不敢相信）：什么？你撒谎！（抓住了莱恩的手）爸爸，除了这个女人，地下室还藏在一个女人！（What? You're lying! Dad, besides this woman, there's another woman hidden in the basement!）\n莱恩（惊讶）：什么地下室？（The basement?）\n▲众人震惊，布拉姆面色阴沉，娜塔莉亚激动地看向了莱恩。\n\n二卡\n\n\n第二十三集\n23-1\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲布拉姆上前一步，握住塞莱特斯的手。\n布拉姆（深呼吸）：塞莱特斯，我知道你生病了，你也很难受，但有什么问题，我们私下说好吗？（Celeste, I know you're sick and it's hard, but let's talk in private, okay?）\n▲众人惊讶。\n伊丽莎白：生病了？（Sick?）\n塞莱特斯：你胡说——（看伊丽莎白和莱恩）爸爸妈妈，他胡说的，我没有生病！（You're lying—Mom, Dad, he's lying! I'm not sick!）\n▲布拉姆拿出了检查报告递给了莱恩和伊丽莎白。\n布拉姆（悲痛）：这是塞莱特斯的精神检查报告。她有严重的被害妄想症和梦游症，这一切都是她臆想出来的。（This is Celeste's psychiatric report. She has severe paranoia and sleepwalking disorder. She imagined all of it.）\n▲众人震惊。\n▲莱恩接过检测报告，有些惊讶。\n布拉姆：她一直怀疑我会出轨，怀疑我会害她。（叹气）可是我没有。（She’s constantly convinced I'm unfaithful, that I'm trying to destroy her. God knows I've done nothing of the sort.）\n伊丽莎白（惊讶）：这些事情，你为什么不早告诉我们？（Why didn't you tell us sooner?）\n布拉姆（难过）：你们身体不好，我不想让你们担心——（鞠躬）是我没照顾好她。（You both have delicate health; I didn't want to burden you. It's my fault, I simply failed to protect her.）\n▲宾客盯着布拉姆，忍不住小声议论了起来。\n宾客1：教父果然是重情重义，塞莱特斯夫人这样对待他，他还不离不弃！（The Godfather is a saint. His wife treats him like dirt, and he still covers for her!）\n宾客2：是啊，教父能成为伯爵的女婿，人品肯定很好。（Yeah. If the Count made him his son-in-law, he must be a good man.）\n▲塞莱特斯一把将报告抢过来，直接撕碎了。\n塞莱特斯（咆哮）：我没疯！是他在撒谎——（I'm not crazy! He's lying—）\n▲莱恩打量着一眼看热闹的宾客，立刻呵斥塞莱特斯。\n莱恩：够了！塞莱特斯注意你的言行！（Enough! Celeste, watch your behavior!）\n▲伊丽莎白立刻抓住了塞莱特斯的手，示意她别再说了。\n莱恩（冷脸）：行了，立刻收拾好，出来接待宾客，别再闹些笑话让人误会！（看向宾客）都散了吧。（All right. Clean yourself up and come greet the guests. Stop embarrassing us. Everyone, please, enjoy yourselves—nothing to see here.）\n▲宾客们十分给莱恩的面子，离开了。\n塞莱特斯（着急）：爸爸——（Dad—）\n▲莱恩拽着塞莱特斯离开。\n莱恩（呵斥）：跟我过来，我有话跟你说。（Come with me. I need to talk to you.）\n▲所有人都离开之后，布拉姆一抬手将桌角的花瓶狠狠摔碎。\n布拉姆（恨）：一群杂碎，早晚有一天，我要将你们全部踩在脚底！（A bunch of trash. One day, I'll put every one of you under my feet!）\n▲娜塔莉亚吓了一跳，连忙低下头去。\n娜塔莉亚（恭敬）：教父，抱歉，是我的鲁莽给您惹麻烦了。（Godfather, I'm sorry. My recklessness caused you trouble.）\n▲布拉姆一腔火气，拿起桌上的枪抵着娜塔莉亚的脑袋。\n布拉姆（呵斥）：到底是有意的，还是无意的！（Was it on purpose or not?）\n▲娜塔莉亚惊慌地举起双手，盯着布拉姆的眼睛。\n布拉姆（审视）OS：当猎物脱离掌控时，我一定会亲手杀掉她！我讨厌这种失控感！（When prey slips out of control, I'll kill her myself. I hate losing control.）\n▲布拉姆突然开枪，子弹射出擦着娜塔莉亚的脸颊而过，打碎了花瓶，娜塔莉亚尖叫了一声，连忙开口。\n娜塔莉亚（惊呼）：教父，我承认，我是故意的！（Godfather, I admit it. I did it on purpose!）\n布拉姆（呵斥）：你为什么要这么做！（Why did you do it?）\n娜塔莉亚（慌乱）：我想得到您，我想取代塞莱特斯，（一把抱住布拉姆）您不是说给我一个机会吗？（I want you. I want to replace Celeste. Didn't you say you'd give me a chance?）\n▲布拉姆震惊。\n\n\n第二十四集\n24-1\n日  内   布拉姆房间\n人物 布拉姆  娜塔莉亚 \n▲布拉姆惊讶地看着娜塔莉亚。\n布拉姆（惊讶）：什么？（What did you just say?）\n▲娜塔莉亚抬头看着布拉姆。\n娜塔莉亚（诚恳）：塞莱特斯根本就不懂您，也配不上您，您这么强大、睿智，我实在太仰慕您了，才会铤而走险抓住这个机会，我以为……（Celeste doesn't understand you. She doesn't deserve you. You're so powerful and smart. I admire you so much that I took this risk. I thought...）\n▲布拉姆盯着娜塔莉亚的眼睛，握着枪的手垂了下去，揉了揉额头。\n布拉姆（放缓语气）：你以为在今天跟我上床，被发现了，我就会和塞莱特斯离婚，娶你是吗？（You thought if you slept with me today and we got caught, I'd divorce Celeste and marry you?）\n▲娜塔莉亚握住布拉姆的枪，指着自己的脑袋。\n娜塔莉亚（认真）：您杀了我吧，杀了我证明您的清白！（Then pull the trigger! Kill me right now to prove you had nothing to do with this!）\n▲布拉姆惊讶，猛地收回了枪。\n布拉姆（拍娜塔莉亚的脸）：我不会杀你，你先回去陪戴安娜吧，我会处理好。（轻轻拥抱）记住，在这里，只有我能保护你。（I won't kill you. Go keep Diana company. I'll handle it. Remember, in this place, only I can protect you.）\n▲娜塔莉亚红着眼睛点了点头，转身离开，镜头特写，娜塔莉亚走到门口时，摊开手心，掌心里面躺着一把金色的钥匙。\n▲布拉姆盯着娜塔莉亚的背影，冷笑了一声。\n布拉姆OS：两个女人以为联手就能毁掉我？做梦？（Two women think they can team up and destroy me? Dream on.）\n24-2\n日  外 花园\n人物  莱恩  伊丽莎白   塞莱特斯  布拉姆   管家\n▲塞莱特斯焦急地看着父母。\n塞莱特斯：爸爸妈妈你们刚刚为什么不帮我，我真的没病！（Mom, Dad, why didn't you help me just now? I'm really not sick!）\n莱恩：塞莱特斯，你先冷静，我们并没有看到布拉姆出轨，如果为了他跟别的女人说话而大动干戈，只会显得我们无礼。（Celeste, calm down. We didn't see Bram cheating. Making a scene because he talked to another woman would just make us look rude.）\n伊丽莎白：是啊，塞莱特斯，你不该在大庭广众之下伤了布拉姆的脸面，况且那女人只是他孩子的心理医生，别人会觉得你是个恶毒的后妈。（Yes, Celeste. You shouldn't embarrass Bram in public. Besides, that woman is just his child's therapist. People will think you're a cruel stepmother.）\n塞莱特斯（绝望）：爸爸妈妈，你们不相信我？（Mom, Dad, you don't believe me?）\n伊丽莎白（安抚）：塞莱特斯，一个心理医生，你不喜欢她，找个机会把她赶走就好了！（Celeste, she's just a therapist. If you don't like her, find a chance to get rid of her.）\n莱恩（抚摸塞莱特斯的头发）：你自小性格要强，肯定受不了丝毫委屈，教父现在权势滔天，你应该获取他的欢心，况且他对你很好，别无理取闹了。（You've always been strong-willed. You can't stand the slightest grievance. The Godfather is powerful now. You should win his favor. Besides, he treats you well. Stop making a fuss.）\n▲塞莱特斯绝望的后退了半步。\n塞莱特斯：不，不是这样的。（No, it's not like that.）\n莱恩（心疼）：你放心，爸爸会联系最好的医生治疗你的病！（Don't worry. I'll contact the best doctor to treat you!）\n▲镜头上拉：布拉姆站在二楼的窗户，眼神冰冷地盯着他们。\n布拉姆（狠辣）OS：这场捕猎游戏，我玩儿够了，该结束了！（I'm done playing this hunting game. It's time to end it.）\n\n\n第二十五集\n25-1\n夜  内   宴会厅门口\n人物 塞莱特斯   伊丽莎白  下人若干 莱恩 布拉姆   娜塔莉亚\n▲莱恩和伊丽莎白站在门口，布拉姆站在二人面前，莱恩严肃地盯着布拉姆。\n莱恩（温和）：布拉姆，你对塞莱特斯的好，我们看在眼中，但她就是大小姐脾气，希望你多多担待，不要跟她一般见识。（Bram, we know you care for Celeste deeply. But she’s always had a headstrong, spoiled streak. Do be gentle with her, and try not to take her outbursts to heart.）\n伊丽莎白（温和）：夫妻之间，要互相体谅。（Married couples need to understand each other.）\n▲众目睽睽下，布拉姆握着的拳头青筋暴起。\n布拉姆（冷漠）OS：一群虚伪的贵族，凭什么高高在上教训我，等我拿到了他所有的资源，我一定把他丢去喂鲨鱼！这一天马上就要到来了！（A bunch of hypocritical nobles. What gives you the right to lecture me? Once I get all his resources, I'll feed him to the sharks. That day is coming soon.）\n▲布拉姆弯着脊梁低头道歉。\n布拉姆：您放心，我很爱她，我保证会照顾好她的。（Don't worry. I love her very much. I promise I'll take good care of her.）\n▲塞莱特斯瞧着布拉姆的样子，害怕地死死握住了伊丽莎白的手。\n伊丽莎白（心疼）：布拉姆，塞莱特斯状态不太好，不如让她先跟我们回去住几天？（Bram, Celeste isn't doing well. Why not let her come home with us for a few days?）\n▲塞莱特斯的眼睛都亮了起来，娜塔莉亚不动声色地看向这边。\n娜塔莉亚OS：只要塞莱特斯离开了这里，我们的计划就成功了！（If Celeste leaves this place, our plan works!）\n▲布拉姆伸手将塞莱特斯搂在怀中，绅士地开口。\n布拉姆：妈，塞莱特斯还需要接受治疗，我比较了解她的情况，如果塞莱特斯现在离开，可能会中断她的治疗。（Mom, Celeste still needs treatment. I know her condition better. If she leaves now, it could interrupt her treatment.）\n莱恩（点头）：布拉姆说得有道理，别影响塞莱特斯的治疗。（Bram has a point. Don't interrupt her treatment.）\n▲塞莱特斯眼眶瞳孔，伊丽莎白不舍得吻了吻她的脸颊，安抚她。\n伊丽莎白：听话，好好治病，等你状态好了，妈妈来接你。（Be good. Do what the doctors say. Once you're better, I'll come get you.）\n塞莱特斯（绝望）：妈妈，我真的没病——（Mom, I'm really not sick—）\n布拉姆（搂住塞莱特斯）：塞莱特斯，听话，太晚了，让爸爸妈妈回去好好休息吧。（Celeste, be good. It's late. Let Mom and Dad go home and rest.）\n▲伊丽莎白松开了塞莱特斯，挽着莱恩的手上车，布拉姆带着微笑搂着塞莱特斯目送二人，车子离开之后，布拉姆突然伸手捏住了塞莱特斯的脖子。\n布拉姆（眼神阴冷）：关门，我的夫人需要接受治疗了！（Lock the gates. My wife is due for her treatment.）\n\n\n第二十六集\n26-1\n夜  内   宴会厅/走廊\n人物 塞莱特斯   下人若干  布拉姆   娜塔莉亚\n▲安保瞬间关上了庄园的大门，整个庄园被围了起来，布拉姆掐着塞莱特斯的脖子，逼迫着塞莱特斯上楼。\n塞莱特斯（惊呼）：松开我！爸爸——妈妈，救命——（Let me go! Dad—Mom, help—）\n▲娜塔莉亚惊愕地看着眼前的场景，她连忙站在旁边，给布拉姆让路，塞莱特斯路过娜塔莉亚的时候，眼神紧紧盯着娜塔莉亚，又看着屋内的佣人们，佣人们低着头不敢抬头。\n▲镜头特写：其中一个女佣退到了人群后面，悄无声息地往门口走。\n▲娜塔莉亚瞧着布拉姆将塞莱特斯拉入了房间狠狠关上了门，她连忙转头往地下室方向跑。\n娜塔莉亚（紧张）OS：钥匙已经到手了，布拉姆应该不会杀了塞莱斯特，我得趁乱先救出姐姐！（I have the key. Bram probably won't kill Celeste. .. I have to take advantage of this chaos and get my sister out NOW.）\n26-2\n夜   内   塞莱特斯房间\n人物：女佣   布拉姆  塞莱特斯  \n▲布拉姆将塞莱特斯拉入了房间狠狠摔在了床上，他扯松了领带，死死盯着塞莱特斯。\n▲塞莱特斯惊恐后退。\n塞莱特斯：你要干什么——你敢对我动手，我父母不会放过你的！（What are you doing? If you touch me, my parents won't let you get away with it!）\n▲布拉姆笑着看着塞莱特斯。\n布拉姆（笑容诡异）：塞莱特斯，我怎么舍得杀了你？只是我不明白，我这么爱你，你为什么要害我！（Celeste, how could I bear to kill you? I just don't understand. I love you so much, why did you try to hurt me?）\n塞莱特斯（惊恐）：我没有害你！是你自己和娜塔莉亚不清不白，难道还不允许我告诉我父亲吗？（I didn't hurt you! You're the one fooling around with Natalia. Am I not allowed to tell my father?）\n布拉姆（抓住塞莱特斯的头发）：是你在酒里下毒，还带着人捉奸，害我在大庭广众之下被你父亲训斥！还不算害我吗？（You spiked my drink! You staged a scandal to catch me red-handed, and you let your father humiliate me in front of everyone! You call that not trying to ruin me?）\n塞莱特斯（惊恐真正）：我没有！（I didn't!）\n布拉姆（膝盖压住塞莱特斯的腿）：怎么？你想离开我？（What’s the matter? Dying to run away from me?）\n塞莱特斯（尖叫）：啊——（Ah—）\n布拉姆（逼问）：你是不是看不起我？是不是觉得我配不上你？（You look down on me, don't you?! You think a high-and-mighty heiress is too good for a man like me?）\n\n\n第二十七集\n27-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲塞莱特斯被压得表情扭曲。\n塞莱特斯（痛苦）：不——我没做过！（No—I didn't do it!）\n▲布拉姆一把将塞莱特斯从床上拉起来。\n布拉姆（冷笑）：不承认是吧？（Not admitting it, huh?）\n▲布拉姆将她摁在了窗口，只见庄园里面有个女佣悄无声息地靠近围墙。\n布拉姆（冷冽）：那是你的信使吗？（举起枪对准女佣的后背）（Is that your messenger?）\n塞莱特斯（惊恐）：不，别杀她！（No, don't kill her!）\n▲布拉姆冷笑，一枪崩了女佣（枪声，窗外鸟雀惊飞，避免直给暴力镜头），塞莱特斯也跟着尖叫了一声。\n▲切镜。\n▲娜塔莉亚站在地下室的入口，她正打算下去。\n娜塔莉亚OS：等我救出姐姐，再去救塞莱特斯！（Once I save my sister, I'll go save Celeste!）\n▲突然，外面响起了枪声，娜塔莉亚连忙转身走向了塞莱特斯的房间。\n娜塔莉亚OS：塞莱特斯！——（Celeste!—）\n▲娜塔莉亚转身向楼上跑去。\n▲切镜。娜塔莉娅刚跑到塞莱斯特门口，突然戴安娜从房间里面走了出来，一把抓住了娜塔莉亚的手，娜塔莉亚惊愕地低头看着戴安娜。\n戴安娜（乖巧）：别过去！（Don't go over there!）\n▲娜塔莉亚惊讶。\n▲切镜\n▲屋内。\n▲布拉姆摁着塞莱特斯的脖子。\n布拉姆（嗤笑）：夫人，我知道娜塔莉亚是谁，她是玛莉的妹妹对吗？（Ma'am, I know who Natalia is. She's Mary's sister, right?）\n▲塞莱特斯惊恐地看着布拉姆。\n塞莱特斯（紧张）：我，我不知道你在说什么！（I—I don't know what you're talking about!）\n▲布拉姆拽住她的头发。\n布拉姆（嘲讽）：夫人，你居然把希望放在一个刚刚毕业的心理医生身上，她的确有些小聪明，可惜，柔弱的像是一只兔子，毫无威胁力！（Ma'am, you put your hope in a fresh-out-of-school therapist. She's a little smart, but weak as a rabbit. No threat at all!）\n▲说着，布拉姆摁住塞莱特斯的脖子，让她趴在窗边上，逼她看着死在地上的女佣，一字一句地威胁。\n布拉姆（残忍）：你猜，我明明什么都知道，为什么还要放过娜塔莉亚？（蛊惑）因为她诚实，夫人，你诚实吗？（Guess why I let Natalia live when I know everything? Because she's honest. Are you honest, ma'am?）\n▲塞莱特斯不可置信地盯着布拉姆。\n塞莱特斯OS：娜塔莉亚出卖我？（Natalia sold me out?）\n【闪回14-1】\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n【闪回22-1】\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n【闪回结束】\n▲塞莱特斯握紧拳头。\n塞莱特斯OS：娜塔莉亚每次都没有按照计划行事，难道她真的为了保命牺牲我……（Natalia never followed the plan. Did she really sacrifice me to save herself...）\n▲布拉姆盯着塞莱特斯的眼睛。\n布拉姆（蛊惑）：塞莱特斯，我比你的父母更疼爱你，他们都不管你，只有我护着你，告诉我，是不是有人蛊惑你？（Celeste, I love you more than your parents do. They don't care about you. Only I protect you. Tell me, did someone turn you against me?）\n▲塞莱特斯惊恐地摇头，不肯说。\n▲布拉姆松开了塞莱特斯拿出了一支药剂，他推动针管，药水喷出来了些。\n布拉姆（威胁）：知道这是什么吗？（Know what this is?）\n▲塞莱特斯惊恐后退，布拉姆一步一步逼近。\n布拉姆（阴沉）：放心，不死，只是会麻痹神经，颤抖，抽搐，瘫痪……（Relax... it won't kill you. It just rots your nervous system from the inside—first come the shakes, then the spasms, until you're completely paralyzed.）\n塞莱特斯（惊恐）：不！我说！我什么都告诉你！（No! I'll talk! I'll tell you everything!）\n\n\n第二十八集\n28-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲布拉姆满意地看着塞莱特斯。\n塞莱特斯：是娜塔莉亚，她——（It's Natalia. She—）\n▲外面突然传来了戴安娜的尖叫声。\n戴安娜vo：啊——（Ah—）\n▲紧接着传来花瓶摔碎的声音。\n娜塔莉亚vo：小姐！请您冷静下来。（Miss Diana! Please calm down.）\n戴安娜（尖叫）：妈妈——我要妈妈——（Mommy—I want Mommy—）\n娜塔莉亚（敲门）：教父！不好了！小姐发病了，我需要医生的帮助！！（Godfather! Something's wrong! She's having an episode. I need a doctor!!）\n▲布拉姆将注射器放下，转身往外走。\n布拉姆：老实待着！（Stay right there!）\n▲布拉姆大步流星地走了出去，塞莱特斯捂着心口，泪流满面。\n28-2\n夜  内   戴安娜房间\n人物  戴安娜  医生  娜塔莉亚  布拉姆\n▲戴安娜躺在床上，闭着眼睛，娜塔莉亚和布拉姆站在旁边，医生正在收拾器材。\n医生：教父，小姐的情况不太稳定，不能受到刺激。（Godfather, Diana's still not doing well. We need to keep her calm.）\n▲布拉姆点了点头，医生离开了，布拉姆轻轻抚摸着戴安娜的额头，轻吻了她的额头，眼中流露出慈爱。\n布拉姆（心疼）：我可怜的女儿……（My poor daughter...）\n▲娜塔莉亚盯着戴安娜。\n【闪回28-3】\n夜 内  走廊\n人物  娜塔莉亚  戴安娜\n▲塞莱特斯的房间里面传来塞莱特斯惊恐的声音。\n塞莱特斯vo：不，别杀她！我说！我什么都告诉你！（No, don't kill her! I'll talk! I'll tell you everything!）\n▲娜塔莉亚着急地走向了门口，突然，戴安娜尖叫了一声。\n戴安娜（尖叫）：啊——啊！我要妈妈——（Ah—ah! I want Mommy—）\n▲娜塔莉亚回头，戴安娜突然失控，用力打碎了花瓶。\n【闪回结束】\n▲娜塔莉亚低声安抚布拉姆。\n娜塔莉亚：教父，别担心。上帝会保佑小姐的。（Godfather, don't worry. God will protect her.）\n▲布拉姆看向娜塔莉亚。\n布拉姆（严肃）：想不想知道戴安娜是什么时候开始生病的？（站了起来）跟我来，我现在告诉你。（Want to know when Diana first got sick? Come with me. I'll tell you now.）\n▲娜塔莉亚惊讶，娜塔莉亚站了起来，跟着布拉姆走出房间。\n28-4 \n夜  内  地下室门口\n人物  布拉姆  娜塔莉亚\n▲布拉姆和娜塔莉亚站在了地下室门口，地下室上绑满了铁链。\n布拉姆：真相就在这里，你不是早已拿到了钥匙，打开吧。（The truth is right here. You already got the key, didn't you? Open it.）\n▲娜塔莉亚看到地下室的门，眼神惊愕，心跳加速。\n\n三卡\n\n\n第二十九集\n29-1\n夜  内   收藏室\n人物    娜塔莉亚  布拉姆\n▲娜塔莉亚盯着地下室的门，里面安安静静。\n娜塔莉亚（担心）OS：怎么没声了？难道姐姐已经遇害了？（Why is it quiet? Is my sister already dead?）\n▲布拉姆搂着娜塔莉娅的腰，从裙子腰封里摸出钥匙，打开了地下室旁边的一道门。\n布拉姆（看娜塔莉亚）：进来吧。（Come on in.）\n娜塔莉亚（惊讶）：这是……（This is...）\n▲布拉姆打开灯，娜塔莉亚被眼前的场景惊呆了，只见收藏室里面，全是玛莉的照片，婚纱照，合照，抱着孩子的照片，还有全家福。\n布拉姆（抚摸照片）：这是我的妻子玛莉，是戴安娜的母亲。（This is my wife, Mary. Diana's mother.）\n▲娜塔莉亚看着墙上的照片，有一张是玛莉抱着戴安娜的照片。(定格照片转场）\n【闪回】\n日  内  破旧房屋\n人物  小玛莉  小娜塔莉亚\n▲小玛莉抱着小娜塔莉亚。\n小娜塔莉亚（天真）：被姐姐抱在怀里，总是很安心！（Being in your arms always makes me feel safe!）\n小玛莉：那姐姐就一直抱着你。（Then I'll keep holding you.）\n【闪回结束】\n▲娜塔莉亚捏着裙摆，打量着照片，故意露出了惊讶的神色。\n娜塔莉亚（紧张）：这么多照片，天啊，教父，您一定很爱她吧。（So many photos. Godfather, you must have loved her so much.）\n布拉姆（表情眷恋）：是的，我很爱她，我们在一起十年，她跟我在一起的时候，我一无所有，是她鼓励我，我才有了今天。（Yeah, I loved her. We were together for ten years. I had nothing when we met, but she always believed in me. I wouldn't be where I am today without her.）\n▲娜塔莉亚看着照片，布拉姆观察着娜塔莉亚的表情，嘴角勾起了一个弧度，他深情地抚摸着全家福。\n布拉姆：在塞莱特斯没出现之前，我们曾是最幸福的一家人，可我的妻子太善良了，相信了贵族的谎言，最后被……（Before Celeste came, we were the happiest family. But my wife was too kind. She believed the nobles' lies, and in the end she was...）\n▲布拉姆哽咽了一下，娜塔莉亚回头看向了布拉姆。\n娜塔莉亚（惊讶）：您别这样，她看见您难过，也会难过的。（You don't have to do this. She wouldn't want to see you hurting like this.）\n布拉姆（落泪）：我们不过是权贵的玩物，只能向权贵低头。（抚摸着全家福）我娶塞莱特斯是怕他们继续出手伤害我的女儿。（We're just toys to the powerful. We have no choice but to do what they say. I married Celeste because I was afraid they'd hurt my daughter again.）\n▲这时，一张照片从全家福里面落了下来，照片上：塞莱特斯站在玛莉面前，玛莉红着眼睛望着塞莱特斯。娜塔莉亚惊愕地看着照片。\n娜塔莉亚OS：这是……塞莱特斯没跟我说过她见过姐姐，难道之前的话是在说谎？（This is... Celeste never told me she met my sister. Was she lying before?）\n▲布拉姆观察着娜塔莉亚的表情，捡起了照片。\n布拉姆（悲伤）：娜塔莉亚，我大概知道你是谁了，戴安娜已经失去了母亲了，不能再失去父亲了对吗？（Natalia, I think I know who you are. Diana already lost her mother. She can't lose her father too, right?）\n▲娜塔莉亚一步步后退。\n娜塔莉亚（惊愕）：什么？您知道我是谁？（What? You know who I am?）\n\n\n第三十集\n30-1\n夜  内  画室\n人物  娜塔莉亚  布拉姆\n▲布拉姆步步紧逼，娜塔莉亚步步后退。\n娜塔莉亚：我不太明白您在说什么，我只是……（I don't really know what you mean. I'm just...）\n布拉姆（打断）：嘘，你不想说，可以不说。（Shh. If you don't want to say it, you don't have to.）\n▲布拉姆将塞莱特斯和玛莉的合照放在了娜塔莉亚的手中。\n布拉姆（警告）：娜塔莉亚，权贵绝不会将我们当作人看待，即便我功成名就，伯爵仍然会把我当狗一样训斥，你野心勃勃，你觉得他们会怎么样对你。（People at the top don't see us as equals, Natalia. I built an empire, yet the Count still treats me like a dog on a leash. You're hungry for power, aren't you? What makes you think they won't crush you like a bug?）\n▲娜塔莉亚抵在了墙上，盯着布拉姆。\n娜塔莉亚（紧张）：教父，您会保护我的，对吗？（Godfather, you'll protect me, right?）\n▲布拉姆抚摸着娜塔莉亚的脸颊，一字一句地说。\n布拉姆（蛊惑）：你和我的妻子玛丽一样天真，即便是为了她，我也会保护你。你、我、戴安娜，我们才是一家人，对吗？（You're as naive as my wife Mary. Even for her sake, I'll protect you. You, me, Diana, we're the real family, right?）\n▲娜塔莉亚表情震惊。\n▲布拉姆却后退了一步。\n布拉姆（温和）：娜塔莉亚，找一找有没有治疗戴安娜的方法吧，我只想我的女儿快点好起来。（Natalia, look for a way to cure Diana. I just want my daughter to get better.）\n▲说完之后，布拉姆转身离开了，他站在门口时，又补了一句。\n布拉姆（警告）：对了，千万别靠近地下室。（扬了扬钥匙）这个，还是我来保管比较好。（By the way, stay away from the basement. As for this? It stays right where it belongs with me.)\n娜塔莉亚（点头）：是。（Yes.）\n▲布拉姆关上门出去了，娜塔莉亚盯着墙上的照片 ，轻轻抚摸了玛莉的脸颊。\n娜塔莉亚（自言自语）：如果失去父亲，戴安娜会很痛苦吧，到底谁在说谎……（If she loses her father, Diana will be devastated. Who's really lying...）\n▲布拉姆站在门口，从门缝里面看着娜塔莉亚的表情，嘴角勾起了一道弧度。\n30-2\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆 女佣\n▲娜塔莉亚正在给戴安娜拿早餐，塞莱特斯走入餐厅，眼神冰冷地盯着娜塔莉亚，她狠狠撞了一下娜塔莉亚，冷声呵斥。\n塞莱特斯：怎么？你真想将我取而代之。（What? You really want to take my place?）\n娜塔莉亚（恨）：夫人拿我做棋子玩得开心吗？（Did you enjoy using me as your pawn, ma'am?）\n▲塞莱特斯一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯：贱人！果然是你想害我！（You bitch! I knew you wanted to hurt me!）\n▲娜塔莉亚举起杯子将牛奶全部泼到了塞莱特斯的脸上。\n娜塔莉亚（愤怒）：夫人，我是戴安娜的心理医生，不是任你打骂的奴仆！（Ma'am, I'm Diana's therapist, not some punching bag for you to abuse!）\n▲众人震惊！\n▲镜头特写：布拉姆站在楼梯间静观其变。\n\n\n第三十一集\n31-1\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆\n▲布拉姆站在楼梯间，并没有阻止二人，眼神复杂地看着她们。\n▲塞莱特斯被泼了一脸。\n塞莱特斯（尖叫）：你敢泼我！你疯了吗？（You dare throw that at me? Are you insane?）\n娜塔莉亚（冷眼）：夫人，这只是给你一个教训，狂妄自大的人，将为自己的行为付出代价。（Ma'am, that's a lesson. Arrogant people pay for their behavior.）\n塞莱特斯：不过是个卑贱的下等人，敢教训我，你找死——（You low-class nobody. You dare lecture me? You're dead—）\n▲塞莱特斯擦了一把脸上的牛奶，伸手掐住了娜塔莉亚的脖子。\n塞莱特斯：贱人！我跟你拼了！（You bitch! I'll tear you apart!）\n▲娜塔莉亚也不甘示弱，抓起牛奶杯砸在了塞莱特斯的后背上。\n娜塔莉亚：放开我——（Let me go—）\n▲这时，布拉姆匆匆忙忙地走了下来。\n布拉姆（呵斥）：住手！（Stop!）\n▲布拉姆立刻将塞莱特斯的手掰开，将娜塔莉亚拉到自己的身后，冷眼盯着塞莱特斯。\n布拉姆：够了！一个心理医生，一个贵族夫人，竟然在餐厅打了起来，你们不觉得丢人吗？（Enough! A therapist and a noble lady fighting in the dining room. Aren't you ashamed?）\n塞莱特斯（疯）：丢人？（指着娜塔莉亚）这个贱人勾引你，想把我赶出这个家门，我还有什么脸面？（Ashamed? This bitch seduces you and wants to throw me out. What dignity do I even have left?）\n▲布拉姆一把抓住了塞莱特斯，不让她打娜塔莉亚。\n布拉姆（看娜塔莉亚）：你，回去照顾戴安娜。（You. Go take care of Diana.）\n▲娜塔莉亚红着眼睛瞪了塞莱特斯一眼，转身离开了。\n塞莱特斯：贱人！你别走！你给我站住！（Bitch! Don't walk away! You get back here!）\n▲布拉姆死死抓住了塞莱特斯的手臂，眼神兴奋了起来。\n布拉姆OS：互相撕咬吧，愚蠢的猎物们，真是越来越有趣了！（Tear each other apart, you stupid prey. This is getting more and more fun!）\n▲娜塔莉亚站在楼梯口，和塞莱特斯对视了一眼。\n31-2\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲夜里，塞莱特斯睁开眼睛，突然发现自己被绑在了椅子上，她挣扎了一下，布拉姆站在阴影中看着她。\n布拉姆（阴冷）：你醒了。（You're awake.）\n\n\n第三十二集\n32-1\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯惊恐地盯着布拉姆，布拉姆把玩着一柄教父权杖，低头看着塞莱特斯。\n塞莱特斯（挣扎）：布拉姆……你想干什么？（Bram... what do you want?）\n▲布拉姆一步一步走向了塞莱特斯。\n布拉姆（嗤笑）：你知道我等这一天等了多久吗？（抚摸塞莱特斯的脸颊）原来俯视贵族是这种感觉。（Do you know how long I've waited for this day? So this is what it feels like to look down on a noble.）\n塞莱特斯（惊愕）：布拉姆！我们是夫妻！你为什么想杀了我？（Bram! We're married! Why do you want to kill me?）\n布拉姆（捏着塞莱特斯的下巴）：夫妻？你从来就没有把我当作你的丈夫！（呵斥）被自己看不起的下等人掌控在手心的滋味如何？（Married? You never treated me as your husband! How does it feel to be in the hands of someone you looked down on?）\n塞莱特斯（惊讶）：我什么时候看不起你了？（When did I ever look down on you?）\n▲布拉姆掐住塞莱特斯的脖子。\n布拉姆（愤怒呵斥）：还敢说没有！你喝咖啡时优雅的德行，简直令我作呕！用餐时那套该死的礼仪，连擦嘴都要扭捏作态！你替我整理领带，就像在纠正一个不懂规矩的蠢货！你的每一个动作都在讽刺我，让我感觉自己像个不被驯养的野狗！（Still denying it! The way you drink coffee makes me sick! Those damn table manners—even wiping your mouth is a performance! When you fix my tie, it's like you're correcting a stupid fool who doesn't know the rules! Every move you make mocks me and makes me feel like an untamed dog!）\n▲塞莱特斯惊呆了，她有些窒息。\n塞莱特斯（挣扎）：你误会了！这些想法令我震惊！（You misunderstood! I'm shocked you'd think that!）\n▲布拉姆用力掐着塞莱特斯的脖子。\n布拉姆（愤怒）：什么误会？你那副天生高贵的嘴脸，早就把答案写在了脸上！（Misunderstood? That born-noble look on your face already gave the answer!）\n▲他突然松开塞莱特斯，蹲在了塞莱特斯的面前，头靠在了塞莱特斯的腿上。\n布拉姆（温和）：塞莱特斯，其实你也很崇拜我对不对？我现在已经是个合格的贵族了对吗？（Celeste, you admire me too, don't you? I'm a proper noble now, right?）\n▲塞莱特斯惊恐地看着趴在自己腿上的布拉姆，浑身发抖。\n塞莱特斯（惊恐）：求求你，放过我吧——（Please, let me go—）\n▲布拉姆突然站起来抓住塞莱特斯的头发，用枪抵着她的额头。\n布拉姆（愤怒）：说啊！说你也很崇拜啊！说你仰慕我！说啊——（Say it! Say you admire me! Say you worship me! Say it—）\n▲塞莱特斯吓得尖叫，布拉姆猛地松开了她。\n布拉姆（笑容诡异）：你们不是都好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're all curious what's in the basement, aren't you? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n\n\n第三十三集\n33-1\n夜   内   塞莱特斯的房间\n人物 娜塔莉亚 布拉姆  塞莱特斯\n▲布拉姆转身离开了，塞莱特斯吓得瘫软到了椅子上。\n塞莱特斯（咆哮）：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n▲布拉姆冷笑了一声，拿出厚厚的一叠文件递给了塞莱特斯。\n布拉姆（笑）：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲塞莱特斯盯着那些文件，脸色惨白。\n塞莱特斯（惊愕）：你，你什么时候做的这些？我怎么不知道？（When... when did you do all this? How did I not know?）\n布拉姆（得意）：就在你和娜塔莉亚斗的你死我活的时候。（高高在上）哦，对了，娜塔莉亚是我故意用来分散你的注意力的！（While you and Natalia were tearing each other apart. Oh, and Natalia? I used her to distract you on purpose!）\n33-2\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲字幕：第二天。\n字幕：第二天。（The next day.）\n▲别墅里面突然响起了女佣的尖叫声。\n女佣（尖叫）：啊！夫人，夫人她死了——（Ah! Mrs. Blackwood is dead!—）\n▲娜塔莉亚和布拉姆同时从两道不同的门里面出来，二人冲到了塞莱特斯的房间门口，只见塞莱特斯浑身是血躺在了地上。\n▲娜塔莉亚惊愕地盯着眼前的场景。\n娜塔莉亚（捂着嘴巴）OS：噢，我的老天！（Oh my God!）\n▲布拉姆冷着脸站在门口。\n布拉姆（咬牙切齿）OS：该死！她怎么就死了，还被人看见了，简直打乱了我所有的计划！（Damn it! Why did she die, and someone saw her? It ruins all my plans!）\n▲布拉姆要上前检查。\n布拉姆（看女佣）：报警吧！（Call the police!）\n布拉姆（冷静）OS：塞莱特斯死了也是一件好事情！我既保住了和伯爵的合作，又摆脱了她！（Honestly, Celeste dying might be a blessing in disguise. It keeps my alliance with the Count intact—and cuts loose my biggest dead weight）\n▲娜塔莉亚一把抓住了布拉姆的手臂，阻挡他前去检查。\n娜塔莉亚：教父，塞莱特斯不明不白死在了庄园，您是最后一个见她的人，如果您现在报警，会被怀疑的！（Godfather, Celeste died mysteriously in the estate. You were the last to see her. If you call the police now, you'll be suspected!）\n▲布拉姆抬了下手臂，示意佣人停止报警，佣人恭敬站定，布拉姆回头看向了娜塔莉亚。\n布拉姆（冷冽）：你的意思是？（What do you mean?）\n娜塔莉亚（担忧）：无论如何，您不能进入现场，一定要确保您没有丝毫的嫌疑！（Either way, you can't enter the scene. Make sure you're not a suspect!）\n▲布拉姆盯着娜塔莉亚，眼神危险。\n布拉姆OS：有意思，小兔子，我会将你彻底拉上我的船！（Interesting, little rabbit. I'll make sure you're in too deep to walk away.）\n▲布拉姆轻轻捏了一下娜塔莉亚的脸颊，似笑非笑地问道。\n布拉姆（微笑）：娜塔莉亚，你觉得怎么做更好？（Natalia, what do you think we should do?）\n▲娜塔莉亚看了一眼地上的尸体。\n娜塔莉亚（鼓起勇气）：不如将她埋了，就算她是装的，埋在地里之后，她也彻底死透了。（Why not bury her? Even if she's faking, once she's in the ground, she's dead for real.）\n▲布拉姆惊讶地看着娜塔莉亚。\n\n\n第三十四集\n34-1\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲布拉姆看了一眼塞莱特斯的尸体又看向了娜塔莉亚。\n布拉姆（蛊惑）：很好！（抚摸娜塔莉亚的脸颊）娜塔莉亚，你不是想要将塞莱特斯取而代之吗？给你一个机会。（Good. Natalia, didn't you want to replace Celeste? I'll give you a chance.）\n娜塔莉亚（惊愕）：什么？（What?）\n布拉姆（整理她的头发）：去把塞莱特斯的尸体装起来，抛入海中——我就娶你。（Bag up Celeste's body and throw it into the sea—and I'll marry you.）\n▲娜塔莉亚惊愕地看着布拉姆。\n娜塔莉亚（惊讶）：抛入海中？不是活埋吗？（Throw it into the sea? Not bury her?）\n▲布拉姆拿出手枪，在手中把玩。\n布拉姆（嗤笑）：埋在土中会留下痕迹，毁尸灭迹不是更安全？（Burying leaves traces. Destroying the body is safer, isn't it?）\n娜塔莉亚（后退）：不，我不敢——（No, I can't—）\n▲布拉姆枪口抵在了娜塔莉亚的额头上，娜塔莉亚紧张地举起双手，一步一步走了进去。\n布拉姆（看女佣）：你看见了什么？（What did you see?）\n▲女佣颤抖地站在旁边。\n女佣（恭敬）：我什么都没有看到，夫人是在晚上失踪了的。（I didn't see anything. Mrs. Blackwood disappeared last night.)\n▲布拉姆看向了屋内，娜塔莉亚正在检查塞莱特斯的尸体。\n布拉姆：死了吗？（Is she dead?）\n▲娜塔莉亚摸着她的脉搏点了点头。\n布拉姆（吩咐）：那真是很可惜（冷冽）将血迹清理干净，把尸体装起来。（What a shame. Clean up the blood and bag the body.）\n▲布拉姆站在门口点了根雪茄，烟雾缭绕中看着娜塔莉亚擦拭血迹。\n▲娜塔莉亚跪在地上擦拭着，在擦到塞莱特斯身后的时候，借着塞莱特斯的掩盖悄无声息将一直录音笔藏在了自己的口袋里。\n34-2\n夜   外   海边\n人物 布拉姆  娜塔莉亚 塞莱特斯  神秘人\n▲娜塔莉亚满头大汗，费劲地将一个巨大的袋子推入了海中，布拉姆拿着相机拍下了娜塔莉亚抛尸的画面。\n布拉姆（嗤笑）OS：就算塞莱特斯是假死，现在也死透了！（Even if Celeste was faking, she's dead for real now!）\n▲娜塔莉亚走了回去，举起手。\n娜塔莉亚：教父，都按照您的吩咐做好了。（Godfather, it's done just as you ordered.）\n▲布拉姆伸手搂着娜塔莉亚的肩膀。\n布拉姆（笑）：做得好，娜塔莉亚，现在我们是一条绳子上的蚂蚱了！（伸手牵着娜塔莉亚）走吧，我未来的妻子。（Good job, Natalia. Now we're in this together. Come on, my future wife.）\n▲娜塔莉亚回头看了一眼海面，跟着布拉姆上车了。\n▲布拉姆的车刚刚离开，一个神秘人穿着潜水服，一个猛子潜入水底。\n\n\n第三十五集\n35-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆和娜塔莉亚刚刚走入客厅，便看见莱恩和伊丽莎白还有持枪安保站在屋内。\n布拉姆（惊讶）：爸妈，你们怎么来了？（看向安保）这是什么意思？（Mom, Dad, what are you doing here? What's the meaning of this?）\n▲莱恩冷着脸站了起来。\n莱恩：我们接到消息，说塞莱特斯不见了。（We got word that Celeste is missing.）\n▲娜塔莉亚惊愕地抬头，看向了莱恩和伊丽莎白，下意识地躲在了布拉姆的身后。\n布拉姆（故作惊讶）：这怎么可能……（How is that possible...）\n莱恩（呵斥）：布拉姆！就算你现在权势滔天，如果你真的伤害了我的女儿，我也会拼尽全力，咬下你一块肉来！（Bram! Even if you're powerful now, if you hurt my daughter, I'll fight with everything I have and take a piece of you with me!）\n▲伊丽莎白猛地站了起来，情绪激动。\n伊丽莎白（哽咽）：塞莱特斯在哪儿！把她还给我！（试探）你是不是把她关在了地下室？（Where's Celeste? Give her back to me! Did you lock her in the basement?）\n▲面对伊丽莎白的指责，布拉姆眼神冷了下去，看向了娜塔莉亚。\n布拉姆OS：娜塔莉亚，我本来想让你多活几天，看来你的死期到了！（Natalia, I wanted to let you live a few more days. Looks like your time is up.）\n▲布拉姆无声看向了角落的女佣，佣跑了出来，她抬手指着娜塔莉亚。\n女佣（情绪激动）：伯爵，夫人！是娜塔莉亚杀了夫人！并将夫人的尸体抛入了海中！（Count, Countess! Natalia killed your daughter! She threw the body into the sea!）\n▲所有人的目光瞬间聚集在了娜塔莉亚的身上，娜塔莉亚下意识后退。\n娜塔莉亚（惊慌）：不，不是我——（No, it wasn't me—）\n▲女佣举起了几张照片，照片1：娜塔莉亚蹲在屋内收拾塞莱特斯的尸体。照片2：娜塔莉亚将尸体挪出别墅，还有几张资料。\n女佣（大声）：娜塔莉亚是玛莉夫人的妹妹，她怀疑是夫人杀了玛莉夫人，所以杀了夫人！（Natalia is Mary's sister. She thought Celeste killed Mary, so Natalia killed Mrs. Blackwood!）\n▲众人看到这些照片惊呆了。\n娜塔莉亚（惊恐）：不，我没有，我没有杀夫人！（No, I didn't! I didn't kill her!）\n▲女佣突然指着娜塔莉亚的裤腿。\n女佣（大喊）：看啊，娜塔莉亚的裤子上还有血迹！（Look! There's blood on Natalia's pants!）\n▲娜塔莉亚低头看着自己裤腿上的血，又迅速看向了布拉姆。\n娜塔莉亚（不敢相信）：你骗我？你想让我帮你顶罪！（You lied to me? You want me to take the fall!）\n▲布拉姆一脸痛心，把枪指着娜塔莉亚的脑袋。\n布拉姆（愤怒）：你怎么能杀了我的妻子！我现在就杀了你——（How could you kill my wife? I'll kill you right now—）\n▲布拉姆盯着娜塔莉亚，故作悲痛。\n布拉姆（得意）OS：猎物，只配被我玩弄于股掌中！（Prey only deserves to be played in my hands!）\n塞莱特斯（呵斥）vo：住手！（Stop!）\n▲众人迅速转头看向了门口，只见塞莱特斯和焦恩带着持枪的警察闯了进来。\n伊丽莎白（惊愕）：上帝啊，我的宝贝，你还活着！（My God, my baby, you're alive!）\n▲众人震惊！\n\n\n第三十六集\n36-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲伊丽莎白冲了过去，一把抱住了塞莱特斯。\n伊丽莎白（心疼）：塞莱特斯——你还好吗？他们说你死了？（Celeste—are you okay? They said you were dead?）\n塞莱特斯（看向布拉姆）：爸爸妈妈，布拉姆想杀了我，是娜塔莉亚和她的养父救了我！（Mom, Dad, Bram tried to kill me. Natalia and her adoptive father saved me!）\n▲众人震惊，布拉姆不敢相信地看着眼前的场景。\n布拉姆：养父？（Adoptive father?）\n▲他的目光落在了焦恩的身上。\n布拉姆：是你？（It's you?）\n【闪回19-1】\n男客人（歉意）：教父，不好意思，我差点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n【闪回结束】\n▲布拉姆浑身发抖。\n布拉姆OS：糟了，他们联手耍我，我中了他们的圈套！（Damn. They played me together. I fell into their trap!）\n▲塞莱特斯盯着布拉姆，大声对他们说。\n塞莱特斯（愤恨）：布拉姆囚禁我，威胁我，还想杀了我！（指着他）他还杀了他的前妻玛莉！（Bram imprisoned me, threatened me, and tried to kill me! He also killed his ex-wife Mary!）\n▲娜塔莉亚看向了塞莱特斯，有些惊愕。\n娜塔莉亚OS：姐姐死了？（My sister is dead?）\n▲众人震惊。\n莱恩（呵斥）：布拉姆——给我一个合理的解释！（Bram—give me a good explanation!）\n▲布拉姆慌了神，连忙指着焦恩和娜塔莉亚。\n布拉姆：不，不是我，塞莱特斯受到了刺激，她有被迫害妄想症！（No, it wasn't me. Celeste is traumatized. She has paranoia!）\n塞莱特斯（愤恨）：我没有病！（I'm not sick!）\n▲娜塔莉亚拦住了塞莱特斯的争辩。\n娜塔莉亚（冷笑）：布拉姆，难道连受害者的话，都是谎话吗？（Bram, are you saying even the victim's words are lies?）\n布拉姆（冷笑）：你们说凶手是我，证据呢？尸体呢？证人呢？是你们诬告我！（You say I'm the killer—where's the evidence? Where's the body? Where's the witness? You're framing me!）\n▲莱恩和伊丽莎白对视了一眼，伊丽莎白看向了塞莱特斯。\n伊丽莎白：塞莱特斯，你有证据吗？（Celeste, do you have evidence?）\n▲塞莱特斯和娜塔莉亚对视了一眼，娜塔莉亚拿出了一支录音笔。\n娜塔莉亚：我们当然有！（Of course we do!）\n▲众人震惊。\n▲娜塔莉亚打开录音笔，录音笔中，传出了尖锐的争吵声。\n【音频33-1】\n布拉姆vo：你不是好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're curious what's in the basement? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n▲众人听着音频，十分惊讶。\n\n\n第三十七集\n37-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） \n▲布拉姆表情惊愕，音频还在继续播放着。\n塞莱特斯vo：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n布拉姆vo：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲众人看向了布拉姆，莱恩冷冽发问。\n莱恩（呵斥）：布拉姆！你怎么解释！（Bram! How do you explain this?）\n布拉姆（后退半步）：这是伪造的！（看向莱恩）爸爸，请您相信我。（指着娜塔莉亚和焦恩）他们一定是为了诬陷我，用药物控制了塞莱特斯，我要求对塞莱特斯进行药检！（It's forged! Dad, please believe me. They must have drugged Celeste to frame me. I demand a drug test on Celeste!）\n▲这时，戴安娜突然抱着小熊，在楼梯间大哭了起来。\n戴安娜（惊呼）：地下室有怪物要吃掉我——我好害怕！（There's a monster in the basement that wants to eat me—I'm scared!）\n▲众人惊讶，布拉姆情绪激动。\n布拉姆（呵斥）：戴安娜！闭嘴！别瞎说！（Diana! Shut up! Don't talk nonsense!）\n▲娜塔莉亚盯着戴安娜。\n娜塔莉亚（看向了警察）：地下室，我姐姐被囚禁在了地下室！（The basement, my sister is locked in the basement!）\n37-2\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） 玛莉\n▲地下室被暴力打开，众人站在地下室门口，被眼前的景象吓到了，里面挂满了玛莉受伤害的照片，刑具，还有三副冰棺，墙上有块黑板，黑板上挂着玛莉、塞莱特斯、娜塔莉亚的照片。\n▲玛莉的编号是一，塞莱特斯编号二，娜塔莉亚编号三。\n伊丽莎白（捂着嘴惊呼）：老天，这简直是个地狱！（My God, this is a hellhole!）\n▲角落里面，有个女人，双脚被铁链锁着，浑身是伤，瘦骨嶙峋。\n娜塔莉亚（惊愕）：姐姐——（Mary—）\n\n\n第三十八集\n38-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲娜塔莉亚冲了过去，颤抖着手拨开了玛莉的头发，娜塔莉亚落泪。\n娜塔莉亚：姐姐，我是娜塔莉亚，你还认得我吗？（Mary, it's me, Natalia. Do you recognize me?）\n▲玛莉艰难地抬头，奄奄一息说不出话。\n娜塔莉亚：医生！快叫医生——（Doctor! Call a doctor—）\n▲焦恩连忙上去，给玛莉做检查。\n焦恩：我现在就带她去医院，别担心，她会脱离危险的。（I'll take her to the hospital now. Don't worry. She'll be okay.）\n▲焦恩将玛莉抱了起来，准备离开，布拉姆被警察控制着对着焦恩呵斥。\n布拉姆（愤怒）：放开她！别将她从我身边带走！把她还给我！（Let her go! Don't take her from me! Give her back to me!）\n▲娜塔莉亚转头看向了被两个警察控制住的布拉姆，抬起手一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：我姐姐陪你吃了十年的苦！还跟你有了孩子，你为什么要囚禁她？！（My sister suffered with you for ten years! She had your child! Why did you imprison her?!）\n▲事情败露，布拉姆也不装了。\n布拉姆（冷笑）：谁让她不答应给我做情妇？（Well... that's what happens when she refuses to be my mistress.）\n▲众人震惊。\n布拉姆：我要成为贵族，我需要塞莱特斯的帮助！玛莉却非要离开我！（I wanted to become a noble. I needed Celeste's help! But Mary insisted on leaving me!）\n▲布拉姆看着焦恩的背影。\n布拉姆（疯狂）：可我爱她，我不能让她离开我，不能让别的男人染指他！我要她永远留在我身边！（But I love her. I can't let her leave me. I can't let another man touch her! I want her by my side forever!）\n▲娜塔莉亚又一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：你简直就是个恶魔！（You're a monster!）\n布拉姆（不甘心）：恶魔？对，我就是恶魔！（看塞莱特斯）塞莱特斯，我也爱你啊，我也想把你永远留在我身边！（Monster? Yes, I'm a monster! Celeste, I love you too. I wanted to keep you by my side forever!）\n▲伊丽莎白连忙挡在塞莱特斯的面前，看向了娜塔莉亚。\n伊丽莎白（感激）：娜塔莉亚，幸亏你聪明，不然我女儿就要惨遭毒手了！（Natalia, thank God you're smart. Otherwise my daughter would've been killed!）\n布拉姆（疯狂）：什么聪明？不过是运气好罢了，两个蠢货被我挑拨得大打出手！（看向了焦恩）要不是这个老东西插手，他们都要死！（Smart? Just luck. Two fools I played against each other! If this old bastard hadn't interfered, they'd all be dead!）\n娜塔莉亚（冷笑）：是吗？到现在，你还认为你才是猎人吗？（Really? Even now, you still think you're the hunter?）\n布拉姆（惊愕）：你什么意思？（What do you mean?）\n娜塔莉亚：从宴会开始，一切就都在我们的计划之中了！（Everything has been our plan since the banquet started!）\n【闪回20-1】\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的男性客人（焦恩），路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n镜头特写：在焦恩撞过来的时候，娜塔莉亚将纸条塞入了焦恩的手中。\n纸条内容（娜塔莉娅vo）：爸爸，救我们出去。（Dad, get us out.）\n【闪回结束】\n布拉姆（不敢相信）：你说什么？（What did you say?）\n▲娜塔莉亚盯着布拉姆。\n娜塔莉亚：我很清楚，你从一开始就知道我是玛莉的妹妹，是你引我入局的。（I know perfectly well you knew I was Mary's sister from the start. You lured me into this.）\n▲布拉姆震惊。\n\n\n第三十九集\n39-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆惊愕地看着娜塔莉亚，娜塔莉亚一步一步走向了布拉姆。\n娜塔莉亚（冷笑）：姐姐的照片和书信，是你寄到我曾经的家里的，戴安娜床底下的日记本也是你放的，对不对。（You mailed my sister's photos and letters to my old home. You also put the diary under Diana's bed, didn't you?）\n▲布拉姆惊呆了。\n布拉姆（不可思议）：你是怎么知道的？（How did you know?）\n娜塔莉亚（冷笑）：因为庄园守卫森严，如果不是你默许的，姐姐的遗书和照片，不可能邮寄到我手中。（Because this estate is heavily guarded. Unless you allowed it, my sister's letter and those photos could never reach me.）\n布拉姆（惊讶）：什么遗书？我做得天衣无缝，你怎么可能发现？（What letter? I was flawless. How could you find out?）\n娜塔莉亚（嗤笑）：你有一句话说得很好，“真正的猎人，往往会以猎物的方式出现”。（You said one thing right: \"The real hunter often appears as the prey.\"）\n布拉姆（不可置信）：你听到了？（You heard that?）\n▲娜塔莉亚挑眉。\n【闪回衔接5-1】\n▲娜塔莉亚牵着戴安娜往房间走，突然，塞莱特斯的房间里面传来了用力的砸门声，娜塔莉亚上前摁住了把手。\n娜塔莉亚（惊愕）OS：塞莱特斯在里面？（回头看书房）她不是在书房和布拉姆吵架吗？（Celeste is in there? Wasn't she arguing with Bram in the study?）\n【闪回结束】\n▲娜塔莉亚看向了布拉姆。\n娜塔莉亚：捕猎游戏中，算错了一步，都会万劫不复——（In a hunting game, one wrong step and you're finished—）\n布拉姆（不敢相信）：不不不，你们不都怀疑对方吗？好几次你们都出卖了对方，还大打出手了！（No, no, no. Weren't you suspicious of each other? You sold each other out several times and even fought!）\n娜塔莉亚：如果我们不假装自相残杀，你怎么对我们放松警惕，怎么会一步一步暴露你的真面目？（If we hadn't pretended to tear each other apart, how would you have let your guard down? How would you have revealed your true face step by step?）\n塞莱特斯：其实宴会上，我爸爸妈妈也早就看出了端倪，只是时机还不到。（Actually, my parents saw something at the banquet too. The time just wasn't right.）\n▲布拉姆惊愕地看着塞莱特斯和莱恩，不敢置信地开口。\n布拉姆：什么意思？（What do you mean?）\n▲莱恩冷眼盯着布拉姆。\n莱恩（冷笑）：因为真正的贵族不会在公共场合大吵大叫，即便我的女儿精神失常了，骨子里的涵养也不会丢失！只有你这种人，才不懂这种规矩！（Because real nobles don't scream in public. Even if my daughter lost her mind, her breeding wouldn't disappear! Only someone like you doesn't understand that rule!）\n▲娜塔莉亚笑着看着布拉姆。\n娜塔莉亚：我提议将塞莱特斯的尸体埋在地下时，你也担心我要算计你，所以故意说抛入海中？可恰巧，我猜到了你不会按照我说的做！（When I suggested burying Celeste's body, you were afraid I was setting you up, so you said throw it into the sea. But I guessed you wouldn't do what I said!）\n▲布拉姆彻底崩溃了。\n布拉姆（惊愕）：你们耍我？你们联手耍我！（You played me? You played me together!）\n莱恩（呵斥）：把他带走！我要他为他的算计付出代价！（Take him away! I want him to pay for his schemes!）\n▲布拉姆被带走，和娜塔莉亚擦肩而过的时候，他突然笑了，他盯着娜塔莉亚。\n布拉姆（低声）：娜塔莉亚，你收到的遗书不是我写的，你再好好想想，谁才是真正的猎人。（嘲笑）你眼中的小可怜，身上流的可是恶魔的血！（Natalia, I didn't write the note you received. Think again—who's the real hunter? The poor little thing you pity has the blood of a monster!）\n▲娜塔莉亚惊愕地回头看向了布拉姆，布拉姆对着娜塔莉亚诡异一笑，跟着警察离开了。\n塞莱特斯（安抚）：娜塔莉亚，布拉姆最擅长玩弄人心，你别被他的话蛊惑了——（Natalia, Bram is a master at playing with people's minds. Don't let him mess with your head—）\n▲娜塔莉亚盯着布拉姆的背影久久回不过来神。\n\n\n第四十集\n40-1\n日  内  戴安娜的房间\n人物 娜塔莉亚  戴安娜  玛莉\n▲娜塔莉亚在帮戴安娜整理书籍和绘本。\n娜塔莉亚vo：布拉姆在伯爵的介入下，被判处了死刑，戴安娜和姐姐继承了他所有的家产，我终于和姐姐终于重逢了。（With the Count's involvement, Bram was sentenced to death. Diana and my sister inherited everything he owned. I was finally reunited with my sister.）\n▲娜塔莉亚整理书柜，突然一个盒子掉了下来，里面的东西撒了出来，里面是一张娜塔莉亚的照片。\n娜塔莉亚（惊讶）：这里怎么会有我的照片。（How did my photo get here?）\n▲娜塔莉亚捡起照片，突然发现照片下面有一行小字，镜头特写：找到你了。（儿童字体：found you)\n镜头特写：找到你了。\n戴安娜vo：找到你了。(found you)\n▲娜塔莉亚握紧照片，看着字迹。\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——(儿童字体：Help me )\n镜头特写：救我——(儿童字体：Help me )\n【闪回结束】\n▲娜塔莉亚死死盯着这行字。\n娜塔莉亚（惊愕）OS：这字迹，和我收到姐姐的遗书上的字迹一模一样！（This handwriting is exactly the same as the note I got from my sister!）\n▲戴安娜的声音突然响起。\n戴安娜：小姨，你在看什么？（Auntie, what are you looking at?）\n▲娜塔莉亚回头，只见戴安娜站在门口抱着兔子看着娜塔莉亚，表情冷漠，娜塔莉亚连忙将照片藏起来，笑着摸了摸戴安娜的头发。\n娜塔莉亚：没什么。（Nothing.）\n▲这时，楼下响起了车子鸣笛声。\n娜塔莉亚（高兴）：听，是你妈妈出院回来了，我们快去迎接她吧！（Listen, your mom's back from the hospital. Let's go welcome her!）\n▲戴安娜瞬间恢复了孩童的笑容，牵着娜塔莉亚的手，乖巧地点了点头，她又回头看着那个盒子，勾唇一笑。\n40-2\n日  内  庄园客厅\n人物  塞莱特斯   娜塔莉亚   戴安娜   佛西   焦恩  玛莉\n▲娜塔莉亚牵着戴安娜的手路过壁炉时，偷偷将写着字的照片丢入了壁炉中烧掉了。\n▲这时，焦恩推着轮椅进来，玛莉坐在轮椅上，气色还不错。\n玛莉（虚弱）：戴安娜，娜塔莉亚。（Diana, Natalia.）\n▲戴安娜欢呼雀跃的跑过去，紧紧抱住了玛莉的手臂。\n戴安娜：妈妈！我好想你。（哽咽）我以为再也见不到您了。（Mommy! I missed you so much. I thought I'd never see you again.）\n▲玛莉轻轻抚摸着戴安娜的头发，又看向了娜塔莉亚。\n玛莉（招手）：来，让我看看。（Come here. Let me see you.）\n▲娜塔莉亚眼泪瞬间滚落，她一步一步走向了玛莉，半蹲在了玛莉的面前。\n娜塔莉亚（哽咽）：姐姐……（Mary...）\n▲玛莉伸手抚摸着她的头发。\n玛莉（温和）：傻瓜，为什么要冒险救我，如果你遇到了危险，我永远无法原谅自己。（Silly girl. Why risk your life to save me? If something happened to you, I'd never forgive myself.）\n▲娜塔莉亚趴在了玛莉的腿上，一下子哭了起来。\n娜塔莉亚：我好想你，我什么都不在乎，我只想找到你，你答应过等我的。（I missed you so much. I didn't care about anything else. I just wanted to find you. You promised you'd wait for me.）\n▲玛莉温和地抚摸着娜塔莉亚的头发。\n玛莉（安抚）：还是和小时候一样爱哭鼻子。（Still such a crybaby, just like when you were little.）\n▲焦恩拍了怕娜塔莉亚的肩膀。\n焦恩：别哭了，你妈妈一会儿就到，看见你哭鼻子又要心疼了。（Stop crying. Your mom will be here soon. She'll be heartbroken to see you crying.）\n戴安娜（乖巧）：对啊，小姨，我们一家团聚了，应该庆祝——（Right, Auntie. We're all together now. We should celebrate—）\n▲这时，塞莱特斯捧着鲜花了，带着一个男人【塞莱特斯的男友 佛西】进来。\n塞莱特斯（开朗）：嗨~娜塔莉亚，听说玛莉姐姐出院了，我们来看看她，给你们介绍一下，这是我的新男友，佛西。（Hi, Natalia. I heard Mary's out of the hospital, so we came to see her. Everyone, this is my new boyfriend, Fossey.）\n▲娜塔莉亚擦了眼泪站起来，抬头看向佛西时，瞳孔微缩。\n娜塔莉亚（惊愕）OS：是他！（It's him!）\n▲佛西对着娜塔莉亚挥了挥手。\n佛西（笑容诡异）：好久不见，娜塔莉亚。（Long time no see, Natalia.）\n",
  "autoReturnedToLevel0": true
}
```

---
## 第 17 轮（耗时：10330 ms (10.33 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 17 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色2/场景0/道具0）。
- 当前计划（动态重规划）：
  [x] 1. 探查剧本目录结构（已完成：6场66段）
  [x] 2. 核查资产库无娜塔莉亚，已创建角色资产（ID: char_1794137305183_eqhut_0）
  [x] 3. 1-2医院办公室正文精读并追加出处（段落2、4、5）
  [x] 4. 1-3贫民窟门口幼年回忆精读并追加出处（段落1、3、6、7、8）
  [x] 5. 1-4医院办公室精读并追加出处（段落1、2、3、6、7）
  [ ] 6. 1-5娜塔莉亚家（10段）精读判定并追加出处（本轮已获取原文）
  [ ] 7. 1-5布莱克伍德庄园（32段）精读判定并追加出处（本轮已获取原文，段落多需分批）
  [ ] 8. 全局核验资产清单满足目标并结案
- 当前已获取1-5两场全文，需按说话人归属判定段落并追加出处。1-5娜塔莉亚家可归入娜塔莉亚的段落：1、3、4、7、8、9（段落2、5、6说话人为焦恩，不可归入，但段落2含对娜塔莉亚外貌/身份的评价，可作剧情背景但非其本人描写，谨慎）。段落10为镜头转场，不归入。
- 尚未全部达成，下一步：先处理1-5娜塔莉亚家（10段），再分批处理布莱克伍德庄园（32段），最后全局核验。
- 需装载写入工具 asset.update 进入执行，配合 script.read 已读文本，无需再读1-5娜塔莉亚家。布莱克伍德庄园正文已在本轮返回，可先处理该场第一批段落。
- 关键结论补充：1-5娜塔莉亚家确立娜塔莉亚“以柔弱为武器”的策略、携带铁链门照片决心救姐；布莱克伍德庄园确立其穿职业装、抱简历、戴黑框眼镜应聘、主动请缨、被布拉姆说“长相像故人”等关键设定。

思考：
两场1-5正文都已在手，1-5娜塔莉亚家10段清爽，可一次追加；布莱克伍德庄园32段需要严格按说话人归属筛选——娜塔莉亚本人动作/OS/台词的段落为2、3、5、18、19、22、25、27、28、30等，布拉姆、管家、塞莱特斯的段落不可归入。先追加娜塔莉亚家，再把庄园的可归入段落一并追加为第二个 provenance，最后核验结案。装载 asset.update 即可。

工具调用：
{{调用 sys.selectContext, {"tools": ["asset.update"], "level": 1}}}
用户沟通：
{
- 对用户说的话（完整版）：“1-5两场的正文我都拿到了。娜塔莉亚家这10段里，我会挑出真正属于娜塔莉亚的动作、台词和心声段落（焦恩的台词不算她的出处），再把布莱克伍德庄园那32段里她的应聘戏份筛进来，一起补进她的资产卡。"
- 对用户说的话（简版）：“1-5两场正文到手，我这就筛娜塔莉亚的段落补进出处，稍等～”
}
```

### [第 17 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
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
    "asset.update"
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
## 第 18 轮（耗时：8881 ms (8.88 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, asset.update, user.ask`

### [第 18 轮] 模型原始输出
```text
状态检查：
- 当前正在执行“1-5娜塔莉亚家（10段）精读判定并追加出处”这一步。本轮工具返回了1-5全部42段原文（娜塔莉亚家10段 + 布莱克伍德庄园32段）。
- 1-5娜塔莉亚家正文已完整获取，可归入娜塔莉亚的段落为1、3、4、7、8、9（段落2、5、6说话人为焦恩，不可归入；段落10为转场镜头）。当前步骤可以完成。
- 关键事实：娜塔莉亚收拾皮包准备前往布莱克伍德庄园应聘；对养父焦恩表明“柔弱也能成为致命武器”；拿出绑铁链门的照片，坚定要救出姐姐。布莱克伍德庄园段落含其职业装、黑框眼镜、抱简历应聘、主动请缨、被布拉姆说“长相像故人”等线索，留待下一步。
- 下一步：先落地1-5娜塔莉亚家的 asset.update 追加，再处理布莱克伍德庄园。
- 当前计划更新：1-5娜塔莉亚家标记完成中（本轮写入）；1-5布莱克伍德庄园待推进；全局核验待推进。

思考：
1-5娜塔莉亚家可归入段落逐一核对：段落1“▲娜塔莉娅在收拾皮包”（纯动作，属娜塔莉亚）；段落3“▲娜塔莉亚握住了焦恩的手”（纯动作）；段落4娜塔莉亚本人台词；段落7“▲娜塔莉亚拿着文件准备起身”（纯动作）；段落8“▲娜塔莉亚转头低头拿出…照片”（纯动作）；段落9娜塔莉亚本人台词。段落2、5、6为焦恩台词/动作，不归入；段落10为转场镜头特写，不归入。参数依据完整，可调用 asset.update 追加 description 与 provenances。

工具调用：
{{调用 asset.update, {"id": "char_1794137305183_eqhut_0", "type": "characters", "mode": "append", "description": "1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩的担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”；带着布莱克伍德庄园的应聘文件，并拿出那张绑着铁链的门的照片，立誓无论如何一定要救出姐姐。", "provenances": [{"sceneTitle": "1-5 日 内 娜塔莉亚家", "paragraphIndices": [1, 3, 4, 7, 8, 9], "evidenceText": "▲娜塔莉娅在收拾皮包，将衣物放进去。▲娜塔莉亚握住了焦恩的手，坚定开口。娜塔莉亚（握拳）：爸爸，有时候，柔弱，也能成为致命的武器！▲娜塔莉亚拿着文件准备起身。▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！"}]}}
用户沟通：
{
- 对用户说的话（完整版）：“已把1-5娜塔莉亚家的出场段落和设定追加到娜塔莉亚资产里了，接下来处理布莱克伍德庄园那32段。”
- 对用户说的话（简版）：“娜塔莉亚家这段已写入资产，接着攻布莱克伍德庄园～”
}
```

### [第 18 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "char_1794137305183_eqhut_0",
  "type": "characters",
  "mode": "append",
  "description": "1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩的担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”；带着布莱克伍德庄园的应聘文件，并拿出那张绑着铁链的门的照片，立誓无论如何一定要救出姐姐。",
  "provenances": [
    {
      "sceneTitle": "1-5 日 内 娜塔莉亚家",
      "paragraphIndices": [
        1,
        3,
        4,
        7,
        8,
        9
      ],
      "evidenceText": "▲娜塔莉娅在收拾皮包，将衣物放进去。▲娜塔莉亚握住了焦恩的手，坚定开口。娜塔莉亚（握拳）：爸爸，有时候，柔弱，也能成为致命的武器！▲娜塔莉亚拿着文件准备起身。▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！"
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "characters",
  "id": "char_1794137305183_eqhut_0",
  "item": {
    "id": "char_1794137305183_eqhut_0",
    "name": "娜塔莉亚",
    "role": "女主角/心理医生",
    "description": "1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩的担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”；带着布莱克伍德庄园的应聘文件，并拿出那张绑着铁链的门的照片，立誓无论如何一定要救出姐姐。",
    "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
    "verifiedProvenance": [
      {
        "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
        "id": "vp_char_1794137305183_eqhut_0_para_5_547",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_731",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_853",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1022",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1077",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "evidenceText": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "anchorText": "莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1077,
        "lineNumber": 25
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_8_1348",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "evidenceText": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "anchorText": "n someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1348,
        "lineNumber": 26
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_1_1401",
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
        "id": "vp_char_1794137305183_eqhut_0_para_2_1422",
        "sceneId": "sc-27-1373",
        "sceneTitle": "第一集 1-4 日  内   医院办公室",
        "matchedTerm": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "evidenceText": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "anchorText": "泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1422,
        "lineNumber": 32
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_3_1636",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1726",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1741",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_1981",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_2306",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_2325",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_2617",
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
        "id": "vp_char_1794137305183_eqhut_0_para_8_2632",
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
        "id": "vp_char_1794137305183_eqhut_0_para_9_2660",
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
      "第一集 1-2 日  内   医院办公室",
      "第一集 1-3 贫民窟门口   日   外",
      "第一集 1-4 日  内   医院办公室",
      "第一集 1-5 日  内  娜塔莉亚家"
    ],
    "mode": "append"
  },
  "message": "成功更新资产 [娜塔莉亚]。"
}
```

---
## 第 19 轮（耗时：7256 ms (7.26 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, asset.update, user.ask`

### [第 19 轮] 模型原始输出
```text
状态检查：
- 当前正在执行步骤：1-5布莱克伍德庄园（32段）精读判定并追加出处。上轮已读取该场正文，需按说话人归属筛选娜塔莉亚的段落并调用 asset.update 追加。
- 本轮工具返回：asset.update 执行成功，返回娜塔莉亚资产完整信息，provenanceStatus=verified，sourceScenes 含1-2、1-3、1-4、1-5娜塔莉亚家四个场景，但**尚未包含1-5布莱克伍德庄园**。
- 当前步骤未完成：1-5布莱克伍德庄园的出处尚未追加到资产中。
- 关键线索：1-5布莱克伍德庄园中，娜塔莉亚本人动作/OS/台词的段落为2、3、5、18、19、22、25、27、28、30等（来自重点笔记），布拉姆、管家、塞莱特斯的段落不可归入。
- 进度更新：上一轮确认1-5娜塔莉亚家已成功入库；本轮需将布莱克伍德庄园段落补齐。

思考：
上一轮读取了1-5布莱克伍德庄园32段正文，但该场的出处尚未写入资产（sourceScenes 中缺失该场）。重点笔记已标记可归入段落为2、3、5、18、19、22、25、27、28、30。为确保准确，先读取该场正文核对具体段落内容与说话人归属，再一次性提交这批出处与设定。由于该场段落较多且需精确 evidenceText，我先重读1-5布莱克伍德庄园段落1-16与17-32分批核验，避免错认。但当前1-5已整体读过，重点是重新确认段落序号与台词的对应关系——直接读取该场并聚焦布莱克伍德庄园部分，然后调用 asset.update 追加。

工具调用：
{{调用 script.read, {"episode": "第一集", "scene": "1-5"}}}

用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的资产已经积累了医院、贫民窟、家里等多处出场，还差最后一场布莱克伍德庄园的应聘戏份没入库。我先把这场正文再核一遍段落归属，然后立刻补上，补完就做全局核验结案～”
- 对用户说的话（简版）：“正在补齐娜塔莉亚在布莱克伍德庄园的出场，补完就核验结案～”
}
```

### [第 19 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (failed)
**工具输入 (Input)**：
```json
{}
```
**工具报错 (Error)**：`【未在当前上下文注入】工具 "script.read" 尚未在当前思考层级（Level 1）中注入。当前轮次可用工具：sys.selectContext、asset.update、user.ask。如需使用该工具，请先调用 sys.selectContext 注入该工具。`

---
## 第 20 轮（耗时：5968 ms (5.97 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, asset.update, user.ask`

### [第 20 轮] 模型原始输出
```text
状态检查：
- 当前计划第6步「1-5布莱克伍德庄园（32段）精读判定并追加出处」尚未完成。但上一轮读取该场时其实已经拿到全部42段原文（娜塔莉亚家10段 + 布莱克伍德庄园32段），笔记中已整理出关键段落线索。
- 本轮 script.read 调用失败：该工具未在当前层级注入，需先切换工具。但布莱克伍德庄园正文我在上一轮已读到，可直接依据笔记中的段落线索做说话人归属筛选并写入。
- 下一步：直接调用 asset.update 一次性追加1-5布莱克伍德庄园出处与设定（段落2、3、5、18、19、22、25、27、28、30），随后全局核验结案。

思考：
上一轮读取1-5时已获取全部42段原文，布莱克伍德庄园32段中，属于娜塔莉亚本人的动作/OS/台词段落为2、3、5、18、19、22、25、27、28、30；布拉姆、管家、塞莱特斯的段落不可归入。这些线索已在重点笔记中沉淀，无需重新读取，直接调用 asset.update（append）增量追加该场出处与设定即可，避免注意力过载。

工具调用：
{{调用 asset.update, {"id": "char_1794137305183_eqhut_0", "type": "characters", "mode": "append", "description": "以应聘者身份进入布莱克伍德庄园，穿职业装、抱简历、戴黑框眼镜；面对布拉姆时镇定自若，主动请缨；被布拉姆评价长相像故人。", "provenances": [{"sceneTitle": "1-5 日 内 布莱克伍德庄园", "paragraphIndices": [2, 3, 5, 18, 19, 22, 25, 27, 28, 30], "evidenceText": "娜塔莉亚以应聘者身份进入布莱克伍德庄园，着职业装、抱简历、戴黑框眼镜，面对布拉姆镇定自若主动请缨，被布拉姆评价长相像故人。"}]}}}

用户沟通：
{
- 对用户说的话（完整版）：“正在把娜塔莉亚在布莱克伍德庄园的出场与台词补齐到资产里，补完就做全局核验收尾。”
- 对用户说的话（简版）：“正在补布莱克伍德庄园的出处，马上核验收尾～”
}
```

### [第 20 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "char_1794137305183_eqhut_0",
  "type": "characters",
  "mode": "append",
  "description": "以应聘者身份进入布莱克伍德庄园，穿职业装、抱简历、戴黑框眼镜；面对布拉姆时镇定自若，主动请缨；被布拉姆评价长相像故人。",
  "provenances": [
    {
      "sceneTitle": "1-5 日 内 布莱克伍德庄园",
      "paragraphIndices": [
        2,
        3,
        5,
        18,
        19,
        22,
        25,
        27,
        28,
        30
      ],
      "evidenceText": "娜塔莉亚以应聘者身份进入布莱克伍德庄园，着职业装、抱简历、戴黑框眼镜，面对布拉姆镇定自若主动请缨，被布拉姆评价长相像故人。"
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "characters",
  "id": "char_1794137305183_eqhut_0",
  "item": {
    "id": "char_1794137305183_eqhut_0",
    "name": "娜塔莉亚",
    "role": "女主角/心理医生",
    "description": "以应聘者身份进入布莱克伍德庄园，穿职业装、抱简历、戴黑框眼镜；面对布拉姆时镇定自若，主动请缨；被布拉姆评价长相像故人。",
    "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
    "verifiedProvenance": [
      {
        "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
        "id": "vp_char_1794137305183_eqhut_0_para_5_547",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_731",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_853",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1022",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1077",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "evidenceText": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "anchorText": "莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1077,
        "lineNumber": 25
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_8_1348",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "evidenceText": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "anchorText": "n someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1348,
        "lineNumber": 26
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_1_1401",
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
        "id": "vp_char_1794137305183_eqhut_0_para_2_1422",
        "sceneId": "sc-27-1373",
        "sceneTitle": "第一集 1-4 日  内   医院办公室",
        "matchedTerm": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "evidenceText": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "anchorText": "泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1422,
        "lineNumber": 32
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_3_1636",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1726",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1741",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_1981",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_2306",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_2325",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_2617",
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
        "id": "vp_char_1794137305183_eqhut_0_para_8_2632",
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
        "id": "vp_char_1794137305183_eqhut_0_para_9_2660",
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
      "第一集 1-2 日  内   医院办公室",
      "第一集 1-3 贫民窟门口   日   外",
      "第一集 1-4 日  内   医院办公室",
      "第一集 1-5 日  内  娜塔莉亚家"
    ],
    "mode": "append"
  },
  "message": "成功更新资产 [娜塔莉亚]。"
}
```

---
## 第 21 轮（耗时：5434 ms (5.43 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, asset.update, user.ask`

### [第 21 轮] 模型原始输出
```text
状态检查：
- 当前正在执行最后一步「全局核验资产清单满足目标并结案」。
- 本轮 asset.update 返回成功，但发现返回的 verifiedProvenance 与 sourceScenes 中 **未包含** 1-5 布莱克伍德庄园的出处（sourceScenes 只有 1-2、1-3、1-4、1-5 娜塔莉亚家四个场景），与笔记中声称“已覆盖布莱克伍德庄园”不一致。同时 description 字段似乎被增量内容覆盖为仅含布莱克伍德庄园部分，需核实。
- 这说明布莱克伍德庄园的出处实际**未成功入库**，不能视为完成，需补齐。
- 下一步：重新对 1-5 布莱克伍德庄园核实并再次追加出处，确保 sourceScenes 覆盖该场景。

思考：
工具返回是硬事实：sourceScenes 缺布莱克伍德庄园，说明上一步实际未落地。需要先重新读取 1-5 布莱克伍德庄园正文确认准确段落号与说话人归属，再调用 asset.update 追加。当前可直接调用工具里没有 script.read，需要先 selectContext 装载 script.read 工具。

工具调用：
{{调用 sys.selectContext, {"tools": ["script.read"]}}}

用户沟通：
{
- 对用户说的话（完整版）：“核验时发现布莱克伍德庄园那场的出处其实没真正入库（系统返回的场景列表里缺这场），我先把这场正文重新读一遍核准段落，再补写进去，避免漏掉娜塔莉亚在这场的关键戏份。”
- 对用户说的话（简版）：“发现布莱克伍德庄园出处没真入库，我重读该场再补写，稍等～”
}
```

### [第 21 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "script.read"
  ],
  "level": 1
}
```
**工具输出 (Output)**：
```json
{
  "level": 1,
  "tools": [
    "script.read"
  ],
  "prompts": [
    "script"
  ],
  "categories": [
    "script",
    "asset"
  ],
  "transition": "enter_execution"
}
```

---
## 第 22 轮（耗时：5811 ms (5.81 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, script.read, user.ask`

### [第 22 轮] 模型原始输出
```text
状态检查：
- 当前正在执行计划第7步：重新读取1-5布莱克伍德庄园（32段）正文，核准段落号与说话人归属，再次补写该场出处与设定。
- 本轮 asset.update 返回成功，但 sourceScenes 仍仅含1-2、1-3、1-4、1-5娜塔莉亚家，**仍缺1-5布莱克伍德庄园**；且 description 被覆盖为仅含布莱克伍德庄园的应聘描述，此内容反而是上一轮补写的结果——说明上一轮补写实际写入了 description 但未正确绑定该场 provenance。
- 已成功装载 script.read，下一步需读取1-5布莱克伍德庄园正文。
- 重点笔记需补充：description 已被覆盖为仅布莱克伍德庄园内容，本次补写时需重新整合完整 description（含1-2至1-5各场核心设定），避免丢失前几场信息。

思考：
当前 sourceScenes 缺1-5布莱克伍德庄园，必须先读取该场32段正文，精确识别娜塔莉亚本人的动作/OS/台词段落，再用 asset.update(mode:"append") 追加该场 provenance 并传完整 description 修复被覆盖的设定。先读正文。

工具调用：
{{调用 script.read, {"episode": "第一集", "scene": "1-5布莱克伍德庄园"}}}

用户沟通：
{
- 对用户说的话（完整版）：“我先读取1-5布莱克伍德庄园的32段正文，核准娜塔莉亚本人的出场段落，再补写该场出处并修复被覆盖的角色设定。”
- 对用户说的话（简版）：“正在读取布莱克伍德庄园正文，核准后补写出处～”
}
```

### [第 22 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": "第一集",
  "scene": "1-5布莱克伍德庄园"
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 1653,
  "offset": 1,
  "nextOffset": null,
  "episodeCount": 0,
  "sceneCount": 0,
  "paragraphCount": 0,
  "hasVolumeWarning": false,
  "episodes": [],
  "content": "第一集\n1-1\n夜  内   地下室\n人物  玛莉\n▲空荡的地下室里，玛莉双手被铁链绑着，跪在地上，她头发散乱瘦骨嶙峋，脸上带着血迹，一只手从黑暗中伸出来，捏住了玛莉的下巴，逼迫她抬头，玛莉恐惧地看向了镜头。\n玛莉（哀求）：救救我…… （Please... somebody help me...）\n\n1-2\n日  内   医院办公室\n人物  娜塔莉亚 \n（to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n1-3 贫民窟门口   日   外 \n人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n1-4\n日  内   医院办公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（Help me)\n玛莉（旁白）：救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n1-5\n日  内  娜塔莉亚家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）\n1-5\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)\n▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。\n管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)\n▲众人唏嘘。\n管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)\n▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。\n管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)\n▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。\n管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)\n应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)\n应聘者2：我也放弃 (Me too, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】\n塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）\n\n第二集\n2-1日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲娜塔莉亚打量着塞莱特斯。\n娜塔莉亚OS：她就是布拉姆的现任妻子塞莱特斯，王室的后裔，母亲是财阀之女，传闻是一位骄矜傲慢的贵族千金。（So this is Bram’s current wife, Celeste. Royal bloodline, heiress to a mega-corporation... as spoiled and arrogant as the rumors say.）\n▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。\n布拉姆：够了，塞莱特斯，别无理取闹了！（Enough, Celeste! Stop making a scene!）\n塞莱特斯（冷冽）：布拉姆，你许诺过只爱我一个人，（指着娜塔莉亚）为什么要让这个女人踏入家门？（Bram, you promised I'd be the only woman in your life! So why are you bringing her into our home?!）\n布拉姆（无奈）：她只是女儿的心理医生，难道，连给孩子看病的人，你都无法容忍吗？（She’s just our daughter’s therapist! Can’t you even allow someone to help our sick child?）\n▲塞莱特斯鄙夷地瞥了一眼娜塔莉亚。\n塞莱特斯（冷冽）：我绝不允许她踏进这个家！（I will NEVER let her step foot in this house!）\n▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。\n布拉姆：当初你明知道我有妻子，依旧主动靠近我，如今却要剥夺我女儿治病的权利，你未免太冷酷了！（When we met, you knew I was already married, yet you still threw yourself at me. And now you're keeping my daughter from getting the help she needs? Don't you think you're being a little too heartless?!）\n▲塞莱特斯愣住了，娜塔莉亚抬头打量着二人。\n娜塔莉亚OS：是塞莱特斯主动向布拉姆示好？（打量塞莱特斯）莫非是她？(Celeste was the one who went after Bram? Was it her?)\n▲娜塔莉亚握紧了拳头。\n娜塔莉亚（恨）OS：如果她是真凶，我会亲手撕碎她的一切，逼迫她说出姐姐的下落！(If she's the monster behind this... I will tear her life to pieces and force her to tell me where my sister is!)\n▲娜塔莉亚上前一步，递出自己的简历。\n娜塔莉亚（恭敬）：夫人，我是持证的儿童心理医生，这是我的简历，请您予以信任……(Ma'am, I am a certified pediatric therapist. Here is my resume. Please, allow me to prove my worth...)\n▲娜塔莉亚的话还没说完，塞莱特斯一把将简历摔在了娜塔莉亚脸上，纸张漫天飞舞。\n塞莱特斯（命令）：别以为我看不出来你的心思！立刻给我滚出去！【4】(I know exactly what you're up to. Now get out!)\n▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。\n布拉姆：塞莱特斯！克制你的行为！（看娜塔莉亚）你离开吧，我会支付一笔钱作为补偿。(Celeste, that's enough! You can go. I'll pay you for your trouble.)\n▲娜塔莉亚惊愕地抬头，塞莱特斯。\n娜塔莉亚OS：不，我绝不能就这样离开！(No... I can't walk away now!)\n▲就在这时，一个孩子光脚跑了出来，她拿着一个花瓶砸坏了门口的装饰，踩坏了花圃。\n女佣（追逐）：小姐！快回来，该吃药了！(Miss Diana! Please stop, it's time for your medicine!)\n▲娜塔莉亚看向了孩子。\n娜塔莉亚（惊愕）OS：那就是姐姐的女儿？(Is that... Mary's daughter?)\n▲戴安娜突然飞快跑向了关着饿狼的笼子。【5】\n布拉姆（呵斥）：戴安娜！停下！(Diana! Stop right there!)\n▲娜塔莉亚飞快冲了过去，一把抱住了戴安娜。\n娜塔莉亚：别靠近！那里很危险！(Get back! It's dangerous!)\n戴安娜（挣扎）：放开我！ (Let go of me! Get off!)\n▲戴安娜发病举起花瓶砸向了娜塔莉亚的脑袋。【6】\n女佣（惊呼）：小心！(Watch out!)\n▲娜塔莉亚一把握住了戴安娜的手，另一只手轻轻拍她的背安抚。\n娜塔莉娅：放下吧。（let it go,一语双关，辛苦本土化老师确认是否可以这样翻译 (可以的，这样说挺地道的）（见黛安娜放下花瓶，松了口气）你做的很好。(Just let it go... You did so good.)\n娜塔莉娅：（看着管家，低声说）快把帘子盖上。（Cover the cage. Now.）\n▲管家立刻盖上帘子遮住野狼。\n娜塔莉娅：都退开些，别刺激她！（Everyone step back. Don't crowd her!）\n▲布拉姆一抬手，众人立刻退开。\n▲娜塔莉亚解开脖子上的丝巾铺在地上，让黛安娜的双脚踩上去。\n娜塔莉娅：你这样太过危险，要不要玩一些更有意思的游戏？比如，吹蜡烛，像我这样……（Walking bare-foot is way too dangerous, sweetie. How about we play a fun game instead? Like... blowing out birthday candles. Look at me...）\n▲娜塔莉娅举起黛安娜的一根手指当作蜡烛，深呼吸然后吐气，黛安娜学着娜塔莉娅的样子也深呼吸起来，情绪得到了稳定。\n▲戴安娜的情绪像是得到了安抚，对着娜塔莉亚笑了起来。\n女佣（捂嘴）：哦，上帝啊，我从未见过小姐这么快平复情绪！（Oh my god... I've never seen  Miss Diana calm down so fast!）\n娜塔莉娅：小姐，别怕，你安全了。（It's ok. You're safe now.）\n黛安娜（凑到娜塔莉娅耳边）：你也安全了。（So are you.）\n▲娜塔莉娅一惊。\n\n\n第三集\n3-1\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲戴安娜拽住了娜塔莉亚的衣摆，看向了布拉姆。\n戴安娜：爸爸，我要她陪我玩儿！(Daddy, I want her to play with me!)\n▲布拉姆摸了摸戴安娜的头。\n布拉姆：如你所愿。（看娜塔莉亚）既然孩子接纳你，你可以留下。（威胁）但是……(Whatever you want. If Diana wants you here, you can stay. But...)\n▲布拉姆的目光看向了狼笼的方向，娜塔莉亚也跟着他的目光看了过去。\n娜塔莉亚（鞠躬）：我明白您的意思，我会照顾好小姐的，请您放心。(I understand, sir. I'll take good care of Miss Diana. You have my word.)\n布拉姆（满意）：带小姐去休息吧。(Take her to her room to rest.)\n▲娜塔莉亚将光脚的戴安娜抱了起来。\n娜塔莉亚：是。(Yes, sir)\n▲娜塔莉亚心中疑惑。\n娜塔莉亚（疑惑）OS：教父看起来非常疼爱戴安娜，为什么姐姐会称这里是牢笼？(The Godfather dotes on Diana so much... So why did my sister call this place a hellhole?)\n▲塞莱特斯死死握着拳头，在和娜塔莉亚擦肩而过时，压低声音警告。\n塞莱特斯（小声）：你会为你今天的决定付出代价的！(You're gonna regret this!)\n娜塔莉亚（温和）：夫人，我只是一个心理医生，听不懂你在说什么。(I'm just a therapist, ma'am. I'm afraid I don't know what you mean.)\n▲娜塔莉亚收回目光，抱着戴安娜一步一步走向了大门，大门打开，屋内富丽堂皇的装饰映入眼帘。\n娜塔莉亚OS：我的姐姐就这里，我不但要找到她的下落！还要保护戴安娜，还要让姐姐和戴安娜合法继承所有财产！【7】(My sister is here. I'll find out what happened to her, protect Diana, and make sure they both get their rightful share of the inheritance!)\n▲布拉姆轻轻抚摸了一下塞莱特斯的头发。\n布拉姆：不过是一个心理医生而已，没必要将她放在心上。(She’s just a shrink, babe. No need to waste your energy on her.)\n▲塞莱特斯下意识后退了一步，看向了娜塔莉亚的背影。\n塞莱特斯：是吗？(Is that so?)\n布拉姆（安抚）：好了，塞莱特斯，你的身体欠佳，回去休养吧。(Come on, Celeste. You're not feeling well. Go get some rest.)\n▲布拉姆也随着她的目光看向了娜塔莉亚的背影。\n布拉姆OS：又一个有趣的猎物，送上门来了！(Well, well...Another little mouse walked right into my trap.)\n▲布拉姆看了一眼管家。\n布拉姆：加强庄园守卫，没有我的命令，任何人都不许出去！【8】(Double the security. No one leaves this estate without my permission!)\n\n3-2\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  \n▲公主房内，戴安娜躺在华丽的公主床上，闭上眼睛，娜塔莉亚给她读故事。\n娜塔莉亚（温柔）：最后，公主和王子拥有了属于他们的幸福生活……(And in the end, the prince and princess lived happily ever after...)\n▲这时，花园传来微弱的呼救。\n（画外音，女声惨叫）vo：啊——救命——(Aah! Somebody help me!)\n▲娜塔莉亚惊愕看向了外面。\n娜塔莉亚OS：呼救？是姐姐吗？(A scream for help? Was that... my sister?!)\n▲娜塔莉亚连忙起身出门。\n\n3-3\n日  外  花园\n人物  娜塔莉亚  管家\n▲娜塔莉亚悄悄在花园里面走，花园里面装饰与建筑物遮挡视线，墙角站着持枪的安保，娜塔莉亚微微弯腰，躲避安保的视线。\n娜塔莉亚（自言自语）：奇怪，呼救声明明是从这里传出来的！(That’s weird. I swear that scream came from right around here!)\n▲突然一只手拍了一下娜塔莉亚的后背，娜塔莉亚惊恐回头，只见管家冷着脸站在她身后。\n管家（冷漠）：你在干什么？(What do you think you’re doing?)\n娜塔莉亚：我，我随便走走……(I—I was just taking a walk, getting some fresh air...)\n▲管家冷脸将文件夹递给娜塔莉亚。\n管家：这是庄园的规矩和教父的禁忌。(These are the house rules. Mr. Blackwood doesn't tolerate anyone breaking them.)\n▲娜塔莉亚翻看着文件。\n管家（严肃警告）：不要碰庄园里的任何东西，不要擅自离开庄园，不要在庄园游荡，不要妄想勾引教父！(Don't touch anything in the estate. Don't leave without permission. Don't wander around. And don't even think about trying to seduce the Godfather!)\n▲娜塔莉亚握着文件点了点头，管家一步步靠近她，再次警告。\n管家（警告）：最重要的一条，不要靠近地下室。(And the most important rule: stay away from the basement.)\n娜塔莉亚（惊讶）：地下室？【9】(The basement?)\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链。\n【闪回结束】\n▲娜塔莉亚看着管家离开的背影，心中疑惑。\n娜塔莉亚OS：姐姐给的照片中点出的地点会不会是地下室？(Could the basement be where my sister was pointing to in those photos?)\n▲管家的视线随意扫过了不远处的安保。\n管家（冷漠）：随意走动，会被当做入侵者被射杀。(Anyone caught wandering where they shouldn't will be treated as an intruder and shot on sight.)\n▲安保立刻举起枪，子弹上膛，娜塔莉亚浑身僵直。\n管家（命令）：现在立刻回到小姐的房间去。(Get back to Miss Diana's room. Now.)\n\n3-4\n日 内  戴安娜房间\n人物  戴安娜   娜塔莉亚  布拉姆\n▲娜塔莉亚转身进入房间，放下了文件，在华丽的公主房屋内巡视。\n娜塔莉亚（打量）OS：戴安娜的房间里，会不会有姐姐留下的遗物？（翻找柜子）如果有线索就好了！(Is there anything my sister left behind in here? Come on, just one clue... anything!)\n▲戴安娜悄无声息地睁开了一只眼睛盯着娜塔莉亚翻找东西的背影，她偷偷地将枕边的小熊推到了地上。\n▲娜塔莉亚听到声音，吓了一跳，立刻回头。\n娜塔莉亚OS：谁？(Who's there?!)\n▲戴安娜连忙闭上眼睛，娜塔莉亚瞧见玩偶掉地上了，弯腰去捡玩偶。\n娜塔莉亚OS：我必须万分谨慎，不能被布拉姆和塞莱特斯察觉！(I’ve got to be extra careful. I can't let Bram or Celeste catch on to what I’m doing.)\n▲娜塔莉亚捡玩偶时，突然看见床底下有个盒子。\n娜塔莉亚（惊讶）OS：那是什么？(What's that?)\n▲娜塔莉亚趴在地上，伸手去将盒子给拿出来，盒子上刻着名字：玛莉。(MARY)\n娜塔莉亚（惊讶）OS：这是姐姐的遗物吗？【10】(Is this... my sister's? )\n▲娜塔莉亚背对着门，蹲在地上打开盒子想查看里面的东西，盒子里面有个日记本。\n娜塔莉亚（惊讶）：这是，姐姐的日记？(No way... Is this my sister's diary?)\n▲门突然推开了，布拉姆握住一把枪，一步一步靠近娜塔莉亚，最后停在了娜塔莉亚背后。\n布拉姆（冷漠）：你在做什么？(What are you up to?)\n▲娜塔莉亚吓了一跳，猛地回头，目光正对布拉姆手中的枪口！【11】\n\n第四集   \n4-1\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  布拉姆\n▲布拉姆上前一步，枪口对准了娜塔莉亚的额头，娜塔莉亚放下盒子，举起手，镜头特写：床上的戴安娜睫毛颤了一下。\n▲娜塔莉亚盯着眼前黑漆漆的枪口，她故作柔弱的姿态，眼神惶恐地看向了布拉姆。\n娜塔莉亚（低声）：教父……我发誓，我绝对没有半点越界。(Godfather...Please... I swear I didn't do anything I wasn't supposed to.)\n▲娜塔莉亚抬起下巴，一双眼睛颤抖地盯着布拉姆，布拉姆居高临下看着她，嗤笑了一声，枪口从娜塔莉亚的额头，挪到了她的下巴。\n布拉姆（狠辣）：把东西交出来，！笼子里的狼早已饥肠辘辘，别让我抓到你半点可疑的痕迹！(Hand it over. The wolves are starving out there, don't give me a single reason to doubt you.)\n▲娜塔莉亚被迫仰起头，脖子暴露在枪口下，她伸手轻轻握住枪口，用脸颊蹭了一下枪口，又妩媚地抬头看向了布拉姆。\n娜塔莉亚（低声）：别这样，您吓到我了。(Easy... you're scaring me.)\n▲布拉姆眼神震惊，喉结滚动了一下。【12】\n布拉姆（语气放松）：才刚刚进来，就敢勾引我。（上前一步，捏住娜塔莉亚的下巴）你的胆子很大。(Just walked through that door, and already trying to play me? You've got balls.)\n▲娜塔莉亚故作惶恐。\n娜塔莉亚（可怜）：绝无此事。(I would never dare.)\n▲布拉姆打量着娜塔莉亚，用力甩开她下巴，冷声开口。\n布拉姆（冷漠）：别以为这样我就会放过你！（脚尖踢盒子）把盒子打开。(Don't think that flattery gets you off the hook. Open the box.)\n▲娜塔莉亚颤抖着手拿起盒子，打开了盒子里面有一张玛莉遍体鳞伤的照片。\n布拉姆（惊讶）：这是……(What is this...?)\n▲娜塔莉亚观察着布拉姆的表情。\n【闪回衔接3-2】\n▲门突然推开了，布拉姆举着枪进来，娜塔莉亚背对着布拉姆跪在床边上，她从窗户的玻璃上看到了布拉姆的倒影，察觉了布拉姆靠近，她立马取出日记本，丢入床底下，随后将一张玛莉的照片放入盒子里面，合上了盒子。\n【闪回结束】\n▲娜塔莉亚缓缓抬头，布拉姆正在看照片，手指死死握住了照片边缘。\n娜塔莉亚OS：我就知道布拉姆会来，这张照片是我用来测试布拉姆的筹码，我只想知道，他知不知道姐姐遭受的一切？(I knew he'd show. This photo is my litmus test for Bram. I need to know: did he have any idea what my sister went through?)\n▲布拉姆看着照片，又看娜塔莉亚。\n布拉姆（冷漠）：谁允许你触碰屋内的东西的！(Who gave you the right to touch my things?)\n娜塔莉亚（跪在地上）：教父，我只想找出诱发小姐心理创伤的根源！（试探）她会不会是因为看到这些残酷的画面才……(Godfather, I was just trying to trace the root of Miss Diana’s trauma. Could seeing something this graphic...)\n▲布拉姆审视地盯着娜塔莉亚，伸手将照片拿了起来，紧紧捏着照片。\n布拉姆：闭嘴！(Shut up!)\n▲娜塔莉亚观察着布拉姆的表情和手指，试探开口。\n娜塔莉亚：她是谁？对小姐而言，是很重要的人吗？(Who is she? Is she someone important to Miss Diana?)\n▲布拉姆将照片收了起来。\n布拉姆（冷冽）：守好你的本分，不该问的，不要追问。【13】（转身）以后看到类似的物件，第一时间交给我！(Know your place. Curiosity killed the cat. Next time you stumble on crap like this, bring it straight to me.)\n▲布拉姆转身离开了，娜塔莉亚松了口气，坐在了地上。\n娜塔莉亚（看布拉姆的背影）OS：布拉姆的反应说明他对姐姐的遭遇一清二楚，难道是他和塞莱特斯一起害了姐姐？姐姐到底在哪里？(His reaction says it all, he knows damn well what happened to my sister. Did he and Celeste do this together? Where is my sister?)\n\n\n4-2\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚坐在床上，摊开了笔记本，镜头特写：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n玛莉vo：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n娜塔莉亚（疑惑）OS：这些信息未免太直白了，像是刻意引导我发现线索，到底是谁布的局，又想引导我做什么？(Way too convenient. It's like someone's leaving these clues for me. Who's playing puppet master here, and what's their game?)\n【闪回照片】\n▲镜头特写：铁门被铁链包裹的照片。\n【闪回结束】\n娜塔莉亚：铁门是不是指向的地下室？会不会和姐姐有关！我一定要找到照片所在的位置？(Does that iron door lead to the basement? Is that where they kept my sister? I've got to find that exact spot.)\n▲这时，保姆间的门被推开了，娜塔莉亚吓了一跳，连忙将照片藏起来，猛地回头。\n\n\n第五集\n5-1\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚连忙合上笔记本，疑惑地看着戴安娜。\n娜塔莉亚：怎么了？戴安娜小姐？(Everything okay, Miss Diana?)\n▲戴安娜提着小熊站在了门口，她眼神冷冷地看着娜塔莉亚。\n戴安娜（可怜）：我睡不着，你可以陪着我吗？(I can't sleep... Will you stay with me?)\n▲娜塔莉亚立刻起身，蹲在了戴安娜面前，抚摸了一下戴安娜的头发。\n娜塔莉亚（安抚）：别怕，我陪你回房间好吗？(Hey, don't be scared. Let's get you back to bed, okay?)\n▲戴安娜点了点，娜塔莉亚牵着她的手回房间。\n\n5-2\n夜  内  书房外\n人物  娜塔莉亚   戴安娜\n▲娜塔莉亚牵着戴安娜走在走廊上，突然听到书房传来争吵，娜塔莉亚和戴安娜停下步伐，站在了门口，书房里面传来激烈的争吵声。\n布拉姆（冷冽）VO：塞莱特斯，是你把玛莉的照片放在戴安娜的房间里的？(Celeste, was that you? Did you plant Mary's photo in Diana's room?)\n塞莱特斯（愤怒）VO：你凭什么断定是我所为？(And what makes you so damn sure I did it?)\n布拉姆（呵斥）VO：难道不是你想用那些照片恐吓孩子吗？毕竟你一向都不喜欢她！(Cut the crap. Weren't you trying to terrorize the kid? You've always hated her guts!)\n▲戴安娜想要推门，娜塔莉亚捂着她的嘴巴，抱着她往房间走。\n娜塔莉亚（惊愕）OS：难道布拉姆和塞莱特斯在联手掩盖姐姐死亡的真相？(Are they actually teaming up to sweep my sister's murder under the rug?)\n\n5-3\n夜  内   书房内  \n人物   布拉姆\n▲房间里面，只有布拉姆一个人，布拉姆听见外面的脚步声离开，他打开了留声机，留声机传出塞莱特斯的声音。\n塞莱特斯（留声机）：你凭什么断定是我所为？(What makes you so sure I did it?)\n▲布拉姆关上了留声机，给自己倒了一杯红酒。\n布拉姆（摇晃酒杯）：真正的猎人往往以猎物的方式出现，就让猎物彼此撕咬吧（品酒）毕竟真正贵族从不会沾染猎物的血。(The best hunters always disguise themselves as prey. Let them tear each other to pieces. After all... real aristocrats never get their hands dirty.)\n\n5-4\n夜  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚将戴安娜放在床上，戴安娜看着她。\n戴安娜：他们吵架是因为我对不对？(They were fighting over me, weren't they?)\n▲娜塔莉亚轻轻抚摸她的头发。\n娜塔莉亚（温和）：这是成年人的纠葛，与你无关。(That's just adult nonsense. It has nothing to do with you, sweetie.)\n戴安娜（平静）：塞莱特斯并不是我的母亲，对吗？(Celeste isn't my real mom, is she?)\n▲娜塔莉亚惊讶地看着戴安娜。\n娜塔莉亚（故作不知）：您为什么会这么想？(Why would you think that?)\n戴安娜（抱着小熊）：我的母亲很温柔，塞莱特斯来了之后，我就再也没见过她了，爸爸禁止我提起她，我很思念她，她什么时候回来？(My mom was so sweet... After Celeste showed up, she just vanished. Daddy won't even let me say her name. I miss her so much. Do you know when she's coming back?)\n▲娜塔莉亚看着戴安娜。\n娜塔莉亚（怜悯）：她一定会回来的，我向你保证！【14】(She'll be back. I promise.)\n▲戴安娜乖乖盖好被子，乖巧地开口，握紧了娜塔莉亚的手。\n戴安娜：你会一直留下来陪我吗？(Will you stay with me forever?)\n娜塔莉亚（安抚）：如果你爸爸同意的话，我当然会留下来陪你。(If your dad gives the green light, I'd love to.)\n戴安娜（疑惑）：你害怕我爸爸吗？(Are you scared of my daddy?)\n娜塔莉亚（微笑）：我想庄园里的人都对教父心存敬畏。(I think everyone in this house is a bit intimidated by the Godfather.)\n戴安娜（乖巧）：塞莱特斯就不会，还总是和爸爸吵架！(Celeste isn't. She's always fighting with Daddy!)\n▲娜塔莉亚摸了摸戴安娜的头发，温和开口。\n娜塔莉亚（安抚）：吵架？((Fighting?)\n▲戴安娜抬头乖巧地看着娜塔莉亚。\n戴安娜（不解）：对呀，爸爸很喜欢别人崇拜他，塞莱特斯却从不这样，这让他很懊恼。(Yeah. Daddy loves it when people worship him, but Celeste never does. It drives him crazy.)\n▲娜塔莉亚一愣，惊讶地低头看向了戴安娜，戴安娜闭上了眼睛睡觉。\n娜塔莉亚（惊讶）OS：我明白了。布拉姆出身卑微，极度渴望被认可，而出身贵族的塞莱特斯永远给不了他这份崇拜，看来他们也没有传闻那么相爱！(I get it. Bram came from the gutter, so he's desperate for validation. But Celeste is old money, she'll never stroke his ego. They're nowhere near as tight as everyone thinks.)\n\n5-5\n夜  内  楼梯口   \n人物  安保   娜塔莉亚  管家\n▲娜塔莉亚打开门，恰好看到两个安保抬着一具盖着白布的尸体从客厅路过，娜塔莉亚惊讶地捂着了嘴巴，管家不知道什么时候出现在了娜塔莉亚的身后。\n管家：看到了吗？那就是擅闯地下室的下场。(See that? That's what happens when you sneak into the basement.)\n▲娜塔莉亚猛地看向了管家，吓了一跳，管家已经转身离开了。\n娜塔莉亚（看向主卧方向）OS：得先让猎物撕咬起来，我才有机会探查姐姐的下落。(I need them to tear each other apart first. Only then will I have a chance to find out where my sister is.)\n\n\n第六集\n6-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲布拉姆坐在餐桌旁边，一边看报纸，一边喝咖啡，娜塔莉亚穿着一件性感的连衣裙走了过去。\n▲娜塔莉亚将对戴安娜的心理报告放在了布拉姆的面前。\n娜塔莉亚（恭敬）：教父，这是昨夜我针对小姐的行为进行的心理分析，请您过目。(Godfather, here is my psychological assessment of Miss Diana based on her behavior last night. Please take a look..)\n▲布拉姆收起了报纸，看向了娜塔莉亚给的文件，又看了一眼娜塔莉亚，眼神暂停，喉结滚动了一下。\n布拉姆：根据你的分析，我女儿怎么样了？(So, according to your report, how's my daughter doing?)\n▲娜塔莉亚俯身靠近布拉姆，手背蹭着布拉姆的手臂划过，指着文件。\n娜塔莉亚：您看，小姐不敢一个人睡，是因为……(As you can see, she's terrified of sleeping alone because...)\n▲布拉姆目光从文件上娜塔莉亚的手慢慢往娜塔莉亚的身上打量，他像是看货物一样看着娜塔莉亚，布拉姆往后仰，坐在椅子上，手臂搭在椅背上，手背刚刚好在娜塔莉亚的臀部位置，目光也落在了臀部。\n布拉姆（审视）OS：真想把这件碍事的衣服……(I'd love nothing more than to rip that dress right off her...)\n▲娜塔莉亚余光瞥见了布拉姆的目光。\n娜塔莉亚（冷笑）OS：禽兽，这么容易上钩！(Pig. That was almost too easy.)\n▲这时候，娜塔莉亚的余光瞥见塞莱特斯出现在了楼梯口。\n▲娜塔莉亚趁着布拉姆发呆，翻页时候，手臂碰到了牛奶杯，瞬间将牛奶洒到了布拉姆的裤子上。\n布拉姆（回神，惊讶）：你在干什么？(What the hell are you doing?)\n▲娜塔莉亚惊慌失措，蹲下用纸巾给布拉姆擦拭裤子，她的衣领开得很低，胸贴近布拉姆的大腿。\n娜塔莉亚：教父，请把裤子脱下来交给我，我替您清洗吧。(Godfather, please let me take your pants off. I'll get them cleaned right away.)\n▲布拉姆目光扫过了娜塔莉亚的脸和她的胸口，喉结滚动了一下。【15】\n布拉姆（嗤笑）：脱下来？（指尖划过娜塔莉亚的脸）你的野心倒是毫不掩饰。（松开娜塔莉亚）你这招，对别的男人或许很有效，可我不吃这一套！(Take them off? You're not even trying to hide your ambition, are you? That little show might work on other guys, but I don't buy it.)\n▲娜塔莉亚微微躲避，低下头去。\n娜塔莉亚（紧张）：先生，我并没有这个意思，我只是……我仰慕您很久了，您强大，睿智，是无数人仰望的对象，我由衷地敬佩您。(Sir, please, that's not what I meant. I just... I've looked up to you for so long. You're powerful, brilliant, a man everyone reveres. I genuinely admire you.)\n▲布拉姆愉悦地笑了，指腹擦过了娜塔莉亚的嘴角。\n布拉姆（笑）：嘴可真甜。(You've got quite a silver tongue, haven't you?)\n▲这时，塞莱特斯来到了餐厅，桌子挡住了视线，她看到布拉姆坐在椅子上，娜塔莉亚蹲在布拉姆的面前，举止不雅，顿时误会了。\n塞莱特斯（呵斥）：你们在干什么？【16】(What on earth is going on here?!)\n\n第七集\n7-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲娜塔莉亚听到声音，眼中划过了一丝兴奋。\n娜塔莉亚（高兴）OS：好戏开场了！(And... showtime!)\n▲娜塔莉亚故作慌乱起身，手中拿着纸，布拉姆的裤子上还有牛奶的痕迹。\n娜塔莉亚：夫人……事情并非您所想的那样……(Ma'am... please, it's not what it looks like!)\n▲塞莱特斯大步流星地走过来，一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯（呵斥）：不知廉耻，竟敢勾引我的丈夫，立刻滚庄园！(You shameless little whore! How dare you seduce my husband! Get the hell out of my house!)\n▲娜塔莉亚捂着脸，委屈地看着布拉姆。\n娜塔莉亚（可怜）：夫人，难道崇拜教父也是过错吗？（不屈）难道他不配得到别人的仰慕吗？(Ma'am, is it such a sin to admire the Godfather? Doesn't a man like him deserve to be revered?)\n▲布拉姆听到这句话，脸色阴沉。\n塞莱特斯（愤怒）：你——(You-)\n▲塞莱特斯举起手要打娜塔莉亚，被布拉姆拦住了。\n布拉姆：塞莱特斯！请你克制你的行为！(Celeste! That's enough!)\n塞莱特斯（呵斥娜塔莉亚）：滚出去！立刻滚——(Out! Get the hell out-)\n▲塞莱特斯还想对娜塔莉亚动手，但是被布拉姆拦住了。\n布拉姆（呵斥）：塞莱特斯！你简直越来越不可理喻了，看来你需要接受心理治疗了！(Celeste! You are losing your mind! Maybe it's time you saw a psychiatrist!)\n塞莱特斯（惊愕）：你认为我疯了？既然你现在这么厌恶我，为什么不跟我离婚？(You think I'm crazy? If I disgust you so much, why don't you just sign the divorce papers?!)\n▲ 众人震惊，娜塔莉亚不动声色看向了塞莱特斯。\n娜塔莉亚（惊讶）OS：离婚？塞莱特斯想离开布拉姆？(Divorce? Celeste actually wants out?)\n▲布拉姆一把抓住了塞莱特斯的手腕，压下了情绪。\n布拉姆（深呼吸）：抱歉，（握住梅菲斯特的手）塞莱特斯，你先上楼，（目光看娜塔莉亚）我会处理她。(I'm sorry. Celeste, head upstairs. I'll handle her.)\n▲塞莱特斯眼神愤怒，甩开布拉姆的手。\n塞莱斯特（呵斥）：离婚！(I want a divorce!)\n▲布拉姆神情冷漠了几分，看了一眼远处的女佣。\n布拉姆（深呼吸）：来人，夫人需要休息，送夫人回房间！(Guards! Madam needs some rest. Escort her back to her room!)\n▲两个女佣上前搀扶塞莱特斯，塞莱特斯甩开女佣。\n塞莱特斯（呵斥）：别碰我，我自己会走！(Get your hands off me! I can walk!)\n▲塞莱特斯和娜塔莉亚擦肩而过的时候，她看了一眼娜塔莉亚，低声开口。\n塞莱特斯（嘲笑）：你会后悔你所做的一切的——（放慢语速）娜塔莉亚！【17】(You are going to pay for every single thing you've done... Natalia.)\n▲娜塔莉亚擦了一下脸上的泪，无辜开口。\n娜塔莉亚：我不知道您在说什么。(I... I have no idea what you're talking about.)\n▲塞莱特斯冷哼了一声，走了，娜塔莉亚盯着塞莱特斯的背影。\n娜塔莉亚OS：塞莱特斯为什么会提出离婚？这太反常了，她是想离开布拉姆还是想威胁布拉姆将我赶走？(Why is Celeste bringing up divorce now? Something's off. Is she genuinely trying to leave him, or is this just a power play to get me kicked out?)\n▲布拉姆突然伸手扶着娜塔莉亚的腰，捏了一下她的腰，娜塔莉亚猛地回头看向了布拉姆，布拉姆靠近她。\n布拉姆（低声）：敢当着塞莱特斯的面儿勾引我？我很欣赏你的胆量。（故意提高声音警告）但，我不希望再有下次！(Seducing me right under Celeste's nose? You've got guts. I'll give you that. But don't let there be a next time.)\n▲说完之后，布拉姆的目光在娜塔莉亚捏着纸巾的手上掠过，随后转身离开了，娜塔莉亚瞧着布拉姆的背影，倒了一杯牛奶，慢慢品尝。\n娜塔莉亚OS：不希望有下次？还是希望下次快点到来？布拉姆先生！【18】 (Don't want a next time? Or can't wait for it... Mr. Bram?)\n\n\n第八集\n8-1\n日  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚在桌子上画画，画上面是一扇门，门上缠着铁链。\n娜塔莉亚（惊讶）OS：缠着铁链的门——(A door bound in heavy chains...)\n▲娜塔莉亚压下了心中的震惊。\n娜塔莉亚（故作好奇）：天啊，这张画画得真好，充满了神秘色彩。（摸戴安娜的头）您见过，还是直接想象出来的？(Sweetheart, what a beautiful drawing! It looks so mysterious. Did you actually see this somewhere, or did you just make it up?)\n戴安娜（乖巧）：这是我们家的地下室啦～(That's our basement!)\n娜塔莉亚（惊讶）：地下室——(The basement...?)\n▲戴安娜像是突然反应了过来一样，立刻将画藏了起来。\n戴安娜（竖起手指）：嘘，千万不要告诉爸爸哦～(Shh... Promise you won't tell Daddy!)\n▲娜塔莉亚弯着腰，故意捂着眼睛逗戴安娜。\n娜塔莉亚（温和）：好哦，那我就当作什么都没有看见。(Cross my heart. I didn't see a thing.)\n▲戴安娜一瞧，开心地笑了起来，她顺手将画压在了画纸下方，拿出了另外一张画给娜塔莉亚看。\n戴安娜：你看，这是我画的妈妈！(Look! I drew Mommy!)\n▲娜塔莉亚盯着画，上面是一幅简笔画，一个女人抱着一个孩子，手背上和手腕上都有一道伤痕。\n娜塔莉亚（惊讶）OS：上帝啊，那是什么？(My God... what are those scars?)\n▲戴安娜没发现娜塔莉亚的情绪，看着画，充满怀念地开口。\n戴安娜（叹气）：我真的很想念妈妈。(I miss Mommy so much...)\n▲娜塔莉亚愣了一下，轻轻将戴安娜护在怀中。\n娜塔莉亚：你的妈妈也同样牵挂着你，如果你过得痛苦，她会万分难过，我们先好好休息，好吗？(Your mommy misses you just as much. Seeing you hurting like this would break her heart. Let's get some sleep, okay?)\n戴安娜：你能给我唱睡眠曲吗？妈妈以前经常唱给我听。(Will you sing me a lullaby? Mommy used to sing to me all the time.)\n▲娜塔莉亚将戴安娜抱在怀中，轻轻拍着她的后背，唱起了睡眠曲。引用国外歌曲：《Baby's Bed A Silver Moon》\n娜塔莉亚：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n▲戴安娜闭着眼睛小声地说。\n戴安娜（低声）：你唱的歌和妈妈唱的一样。(You sound just like Mommy...)\n▲娜塔莉亚低头看着怀中的戴安娜笑，眼睛却红了。\n【闪回】\n8-2\n日 内  平民屋老房子\n人物 玛莉  娜塔莉亚\n▲小玛莉将小娜塔莉亚抱在怀中，娜塔莉亚抬头就能看到姐姐温柔的笑容，玛莉拍着她的后背，用稚嫩的声音唱安睡曲。\n小玛莉（拍背）：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n\n【闪回结束】\n▲小玛莉稚嫩的歌声和娜塔莉亚的歌声重叠。\n娜塔莉亚（哽咽）：飘啦飘啊宝贝，跨过千山万水。(Sail away, my little one, over mountains and streams...)\n▲一滴泪顺着娜塔莉亚的脸颊滴在戴安娜的脸上，娜塔莉亚连忙擦泪，低头一看，戴安娜已经睡着了，娜塔莉亚低头轻吻她额头。\n娜塔莉亚（坚定）OS：睡吧宝贝，小姨一定会找到你的母亲！【19】(Rest easy, my sweet girl. Auntie will bring your mother home.)\n\n8-3\n夜  内   走廊/地下室\n人物 娜塔莉亚  塞莱特斯\n▲走廊上，配着枪的安保在巡逻。\n安保：教父有令，不许任何人夜里在庄园内随意走动。(By order of the Godfather, no one wanders the grounds after dark.)\n▲娜塔莉亚躲在拐角的阴影处，安保走远后，她才出来，迅速走向了地下室的入口。\n▲娜塔莉亚不敢开灯，摸索着往前走。\n娜塔莉亚OS：地下室到底锁着什么东西？这东西会和姐姐有关吗？戴安娜难道是看到了地下室的东西才病了的？(What is he hiding down there? Is Mary behind that door? Is that what traumatized Diana?)\n▲她摸索着到了地下室门口，月亮冰冷地落在了门上，门上缠着铁链子，挂着锁，突然地下室里面传来了微弱的响动。\n（女声，模糊，微弱）vo：救救我……（非常模糊，难以判断）(Help... me...)\n娜塔莉亚（惊讶，拍门）：你是谁？(Who's in there?!)\n（女声，微弱）：我是……(I’m...)\n▲娜塔莉亚上前查看，突然一只手拍了一下。\n娜塔莉亚（惊恐）OS：是谁！【20】(Who's there?!)\n▲娜塔莉亚僵硬地转身，塞莱特斯穿着睡裙，披头散发站在她身后。\n塞莱特斯（声音冰冷）：我知道你是谁，也知道你潜入布莱克伍德庄园的目的。(I know who you really are... and exactly why you infiltrated the Blackwood estate.)\n▲娜塔莉亚吓了一跳，后退了一步靠在门上，塞莱特斯步步逼近。\n塞莱特斯：我给过你逃离的机会，既然你执意入局，就别怪我心狠手辣——(I gave you a way out. But since you insist on playing with fire, don't blame me for burning you alive.)\n▲娜塔莉亚盯着塞莱斯特，突然笑了一声。\n娜塔莉亚：塞莱特斯，是你引我来地下室的，我们不是敌人，对吗？(Celeste, you left those breadcrumbs to lead me here. We're on the same side... aren't we?)\n▲塞莱特斯震惊！【21】\n一卡\n\n第九集\n9-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯\n▲娜塔莉亚靠在门上，塞莱特斯一步一步逼近，地下室楼梯口偶尔有人影闪过。\n娜塔莉亚（警惕地看楼梯间）：夫人是想有话直说，还是等布拉姆发现我们？（Cut to the chase, or are you waiting for Bram to catch us?）\n▲塞莱特斯突然一把抓住了娜塔莉亚的手。\n塞莱特斯（一字一句）：救救我，娜塔莉亚！布拉姆想要除掉我！（Help me, Natalia! Bram is going to kill me!）\n娜塔莉亚（震惊）\n▲娜塔莉亚后退了半步，惊愕地看着塞莱特斯。\n娜塔莉亚OS：我猜对了，塞莱斯特想离开布拉姆！可她为什么要向我求救？（I was right. She’s trying to ditch Bram. But why come to me?）\n▲娜塔莉亚故作不解地看着塞莱特斯。\n娜塔莉亚（惊愕）：教父明明十分爱您，怎么会想除掉你？（The Godfather clearly loves you. Why would he want you dead?）\n▲塞莱特斯用力摇头。\n塞莱特斯（绝望）：你们都被骗了！那都是他的精心伪装的假面！他根本就不爱我！（You’ve all been played! It’s all an act. He doesn't love me at all!）\n娜塔莉亚（警惕）：夫人，您遇到危险，应该向您的家人求助，而不是我这个外人。（Ma'am, if you're in danger, go run to your family, not an outsider like me.）\n塞莱特斯（苦笑）：这座庄园守卫深严，我根本无法逃布拉姆的掌控，我也曾向我父母求救，可我身上没有伤痕，他们只认为是我无理取闹！（This place is a fortress, I can't get away from him. I tried begging my parents, but since there are no bruises on my skin, they just think I'm losing my mind.）\n▲塞莱特斯看向了楼梯口，楼梯口偶尔闪过巡逻的身影。\n塞莱特斯（悲伤）：没有人相信完美丈夫的面具下是禽兽。（激动地抓住娜塔莉亚的手）求你帮帮我！（Everyone thinks he's the perfect husband. No one believes me when I tell them what he's really like. Please, you have to help me!）\n▲娜塔莉亚观察着塞莱特斯的表情和发抖的身体。\n娜塔莉亚OS：她说的是真的？还是在试探我？这太冒险了……（ Is she telling the truth? Or testing me? Way too risky...）\n▲娜塔莉亚掰开塞莱特斯的手，准备离开。\n娜塔莉亚：夫人，这些话，我就当没听过！我得离开这里了，如果被教父发现，我会死的……（Ma'am, let’s just pretend this conversation never happened. I gotta go. If the godfather catches me, I'm dead meat...）\n▲塞莱特斯抹了一把眼泪，盯着娜塔莉亚的背影，突然开口。\n塞莱特斯：你的原名叫作苏丽娅，是玛莉的妹妹，八岁被焦恩收养改名娜塔莉亚！你潜入这里是为了寻找玛莉失踪的真相！（Your real name is Surya, Mary’s little sister. John adopted you when you were eight and made you Natalia! You didn't just stumble in here; you're hunting for the truth about Mary!）\n▲娜塔莉亚惊呆了，猛地回头看向了塞莱特斯。\n\n\n第十集\n10-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲娜塔莉亚惊讶地看着塞莱特斯。\n娜塔莉亚：夫人，我并不知道您在说什么，我也不认识玛莉——（Ma'am, I don't know what you're talking about. I have no idea who Mary is-）\n▲塞莱特斯拿出一张照片递给娜塔莉亚，光线昏暗，娜塔莉亚低头看着那张旧照片，上面是小时候的娜塔莉亚和小玛莉还有爸爸妈妈的全家福。\n娜塔莉亚（惊愕）：这张照片怎么在你这里！（where did you get this?）\n▲塞莱特斯走向娜塔莉亚，将照片递给她。\n塞莱特斯：布拉姆很懂怎么让女人为他着迷，一年前我就是这样上钩的。得知他有妻子时，我嫉妒得发疯，只想把他抢过来——他太享受这种被争夺的感觉了。（Bram has a way of wrapping women around his finger. That’s how he reeled me in a year ago. When I found out he was married, I went green with envy. I wanted him all to myself- and he thrives on women fighting over him.）\n▲娜塔莉亚死死握着照片。\n娜塔莉亚（愤怒）：所以你就绑架了我的姐姐？（So you're the one who snatched my sister?）\n塞莱特斯（摇头）：我没有！我只是想给她一笔钱让她离开的！我曾派人调查玛莉，发现她这一生太苦太惨，我不想毁了她好不容易得来的安稳生活。（I didn't! I just wanted to buy her off so she’d walk away. I had her background checked, her life had already been a nightmare. I didn't want to screw up the peace she finally managed to build.)\n▲塞莱特斯抚摸着地下室的铁锁，缓缓转头看向了娜塔莉亚。\n塞莱特斯（哽咽，恐惧）：我放弃了接近布拉姆，可没多久，她就失踪了，尸骨无存！连警方也找不到！（I gave up on Bram. But not long after, she vanished. Even the police couldn't find her!）\n娜塔莉亚（惊讶）：什么？（What?）\n塞莱特斯（看向地下室）：没有人知道她去哪儿了……（No one knows where she went...）\n▲娜塔莉亚审视地看着地下室的门，目光又慢慢挪回塞莱特斯。\n娜塔莉亚（惊愕）：她是不是在这里面？（Is she locked down in there?）\n塞莱特斯（摇头）：我不知道，每一个靠近地下室的人不是死亡就是失踪了……（I don't know. Everyone who gets close to the basement either dies or disappears...）\n▲娜塔莉亚盯着地下室的门，后退了半步。\n娜塔莉亚（审视）：那你现在告诉我这些的目的是什么？（So why are you telling me this now?）\n▲塞莱特斯紧紧抓住娜塔莉亚的手臂。\n塞莱特斯：我怀疑是布拉姆杀了他们！我也试图解开地下室的秘密，布拉姆现在的目标肯定是我，你也靠近了，下一个就是你了！只有我们联手，才有机会逃离魔爪——（Because I'm betting Bram is the one who got rid of them! I tried digging into this basement myself. Now I'm sitting in his crosshairs, and since you've been sniffing around too, you're next on his hit list! Team up with me, or we're both dead.）\n娜塔莉亚（试探）：是你引我来地下室的？你想让我跟你绑在一起？（So you set me up? You dragged me into this just to use me as your shield?）\n塞莱特斯（绝望）：娜塔莉亚，别怪我，（捂着脸）我实在没有办法了，我不想死！（Natalia, don't blame me. I have no choice. I don't want to die!）\n娜塔莉亚（看向地下室的门）：那你想让我怎么做？（Then what do you want me to do?）\n塞莱特斯（坚定）：我需要你去勾引布拉姆！（I need you to seduce Bram!）\n▲娜塔莉亚惊讶，她还没来得及详细询问，突然一束光打在了两个人的脸上，两个人惊恐地抬头看向了楼梯口。\n▲布拉姆阴沉着脸，拿着手枪，带着配枪的安保，站在楼梯口。\n布拉姆（冷冽）：你们在这里干什么？（What do we have down here?）\n\n\n第十一集\n11-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲安保的枪口对准了娜塔莉亚，布拉姆一步一步走向了娜塔莉亚和塞莱特斯，娜塔莉亚和塞莱特斯几乎都是紧张地后退了半步，娜塔莉亚连忙将照片藏在了袖子里面。\n▲布拉姆一挥手，两个安保抓住一个男人过来，男人表情惊恐。\n男人：教父，我错了！我真的错了！（Godfather, I was wrong! I'm sorry!）\n布拉姆（子弹上膛）：无视我的规矩，窥探庄园的秘密，就要付出代价。（Break my rules, nose around my estate, and you pay with your life.）\n▲布拉姆的枪抵在了男人的肩膀上。\n男人：教父，求求您放过我吧，我没有想窥探您的秘密，我……（Godfather, mercy! I swear I wasn't snooping around! I—）\n▲娜塔莉亚想说话，塞莱特斯在黑暗中抓住了她的手示意她别开口。\n▲布拉姆表情冷漠，枪响，男人的尖叫声响起，娜塔莉亚捂着耳朵尖叫了一声，靠在墙上惊恐地看着男人被打穿了肩膀躺在地上哀号。\n布拉姆（抬手）：把人拖走，别惊扰了我的夫人，（视线落在了娜塔莉亚身上）还有尊敬的娜塔莉亚小姐。（Drag him away. We wouldn't want to upset my wife... or our lovely Miss Natalia.）\n▲安保将受伤的男人拖走，血流了一地，娜塔莉亚和塞莱特斯几乎不敢喘气，娜塔莉亚瞥了一眼塞莱特斯。\n布拉姆（看了一眼地下室的门）：你们来这里做什么？（So... what brings you two down here?）\n▲塞莱特斯被地上的鲜血刺激得后退了一步，娜塔莉亚看向她。\n娜塔莉亚OS：塞莱特斯夫人，如果你出卖我的话，就别怪我不客气了——（Throw me under the bus, Celeste, and I swear I'm taking you down with me—）\n▲塞莱特斯突然猝不及防的扇了娜塔丽亚一耳光。\n塞莱特斯：贱人！你竟敢污蔑我？（You bitch! How dare you set me up?）\n▲娜塔莉亚猛地抬头看向了塞莱特斯，眼神错愕。\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n\n\n第十二集\n12-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n塞莱特斯：贱人！你竟敢污蔑我梦游？还把我带到这个鬼地方，分明是想害我！（You bitch! How dare you lie and say I was sleepwalking?! You dragged me down to this hellhole to get me killed!）\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n布拉姆：是吗？敢污蔑我的夫人！（Is that so? You dared to frame my wife!）\n▲娜塔莉亚盯着塞拉特斯的脸，二人对视，仿佛空气都凝固了。\n娜塔莉亚（恢复镇静）：教父，夫人的确是梦游了！请相信我的专业判断。（Godfather, she really was sleepwalking. You have to trust my professional judgment.）\n塞莱特斯（愤怒）：胡说，你颠倒黑白，污蔑我有病，是不是想取代我的位置！（Bullshit! You're twisting the truth, trying to make me look crazy! You just want to take my place!）\n娜塔莉亚：夫人，地下室是禁地，如果您不是梦游，来地下室干什么？如果不是梦游，您有手有脚，又怎么会听我指挥？我只是怕您有危险，所以跟到了这里。（Ma'am, the basement is strictly off-limits. If you weren't sleepwalking, what were you doing down here? And why did you follow me without a word? I only came down because I was worried about your safety.）\n▲娜塔莉娅拨开布拉姆的枪，魅惑的看着布拉姆。\n娜塔莉娅：教父，您觉得我说的对吗？（Godfather, don't you think I'm right?）\n▲布拉姆冷眼盯着塞莱特斯和娜塔莉亚，塞莱特斯连忙抱住了布拉姆的手臂，疾言厉色地开口。\n塞莱特斯：布拉姆，她是在污蔑我！（看保安）保安，把这个女人驱逐出去！（Bram, she's framing me! Guards, throw this woman out!）\n▲保安目光看布拉姆，没有动，布拉姆的表情松动，拍了拍塞莱特斯的手。\n布拉姆：塞莱特斯，冷静点儿，我会请最权威的精神科医生医生来对你进行评估。（看保安）带夫人去休息。（Celeste, calm down. I'll have the best psychiatrist come take a look at you. Take my wife to rest.）\n塞莱特斯（故作惊讶）：我才是你的妻子！你宁愿相信这个外来者也不相信我？（I'm your wife! You’re taking the word of a stranger over mine?）\n布拉姆（呵斥）：回去休息！（Go rest!）\n▲塞莱特斯惊愕，布拉姆拍了拍塞莱特斯的肩膀放缓了语气。\n布拉姆（安抚）：亲爱的，我这都是为了你好，快去休息吧。（Sweetheart, I'm doing this for your own good. Now go get some sleep.）\n▲塞莱特斯和娜塔莉亚对视了一眼。\n▲塞莱特斯气冲冲地离开了，布拉姆转了一圈手枪，用枪挑起娜塔莉娅的下巴。\n布拉姆（威胁）：娜塔莉亚，我的宝贝，告诉我，你来地下室的真正目的。（Natalia, my sweet... now tell me the real reason you're down here.）\n\n第十三集\n13-1\n夜  内   地下室\n人物 娜塔莉亚  布拉姆   安保若干 \n▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。\n娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！（Bram doesn't buy our story. Better to admit part of it than keep hiding.）\n▲娜塔莉亚盯着布拉姆的眼睛，突然上前一步，抱住了布拉姆。\n娜塔莉亚（故作惊恐）：教父！请原谅我！是我趁她梦游，故意把她引到了这里。（Godfather, please forgive me! I knew she was sleepwalking, so... I intentionally led her down here.）\n▲布拉姆惊讶地低头看着娜塔莉亚的，他放下了枪，抚着娜塔莉亚的后背开口。\n布拉姆（惊讶）：你故意的？（You did it on purpose?）\n娜塔莉亚（握拳）：是的，我只是个医生，不是她的佣人，可她却当众掌我嘴，我只想给她一个小小的教训！（Yes. I'm just a doctor, not her maid, but she slapped me in public. I just wanted to teach her a little lesson!）\n▲布拉姆盯着娜塔莉亚的模样，勾起嘴角。\n布拉姆OS：有趣，聪明，但也仅仅是个猎物！（Spicy, and sharp. But still just a mouse playing with a cat.）\n▲布拉姆挑眉，指尖划过了娜塔莉亚的脸颊。\n布拉姆（试探）：那你恨吗？想不想将她踩在脚下？（So do you hate her? Want to grind her into the dirt?）\n▲布拉姆话音落下，娜塔莉亚听到了子弹上膛的声音，娜塔莉亚扫了一眼那些枪口，格外紧张，心跳加速。\n娜塔莉亚（抬头看向布拉姆）：我不是神，当然会恨夫人。（愤恨）但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。（I’m no saint, so yeah, I despise her. But what really pisses me off is this rigged system. I hate the elite, even while I’m dying to have everything they’ve got.）\n▲布拉姆盯着娜塔莉亚，布拉姆突然推开娜塔莉亚，举起枪，对准了娜塔莉亚的额头。\n布拉姆：这番话，足以让你丧命！（Those words could get you killed!）\n▲娜塔莉亚不为所动，她伸出手轻轻抚摸着布拉姆的脖子，从他的肩膀抚摸到他的心口。\n娜塔莉亚（坚定）：但我说的都是真话！（放软声音）教父，难道您不恨他们吗？（But I'm telling the truth! Godfather, don't you hate them too?）\n▲布拉姆突然笑了，轻轻鼓了鼓掌。\n布拉姆（欣赏）：很好，我欣赏敢于坦诚欲望的人。（抚摸娜塔莉亚的肩膀）但你的目的远不止这些吧。（Good. I admire people who are honest about their desires. But your goal is more than that, isn't it?）\n▲娜塔莉亚惊愕地看着布拉姆，二人对视，娜塔莉亚紧张了起来。\n娜塔莉亚（紧张）OS：塞莱特斯都能查到我的身份，布拉姆会知道吗？（握拳）豁出去了！（ Celeste found out who I am. Does Bram know? Screw it!）\n▲娜塔莉亚山前一步，指尖轻轻揭开了布拉姆衣服的扣子，布拉姆一把抓住了娜塔莉亚的手。\n布拉姆（警惕）：你想干什么！（What do you want?）\n▲娜塔莉亚垫脚靠近布拉姆的耳朵，手从他的胸口滑落到腹部，腰部，最后勾住了他的皮带。\n娜塔莉亚（妩媚）：教父，我曾远远见过您一次，便深深爱上了您！我进入庄园，都是为了您呀。（Godfather, I saw you once from a distance, and I fell for you. I came into this estate for you.）\n▲布拉姆一惊，喉结滚动了一下，目光掠过娜塔莉亚的脸颊和脖子。\n布拉姆OS：这个妖精，真想把她绑起来，玩个痛快！可惜现在还不到时候！（What a seductive little vixen. God, I want to break her. But the game’s just getting started.）\n▲布拉姆一把抓住了娜塔莉亚的手，阻止她的动作。\n布拉姆（故作冷漠）：够了！回你的住处去，记住，不要试图窥探这里的秘密，它会让你死的很惨！（Enough! Go back to your room. And remember—don't dig into this place's secrets. It'll get you killed.）\n▲娜塔莉亚连忙低下头去，绕过了布拉姆，提着裙摆上楼了，她回头看了一眼地下室的铁门上的锁。\n【闪回】\n13-2  （衔接10-1）\n夜  内   地下室门口\n人物  娜塔莉亚   塞莱特斯\n▲塞莱斯特抓住娜塔莉亚的手。\n塞莱特斯（情绪激动）：我需要你去勾引布拉姆！只要你帮我，我就告诉你地下室的钥匙在哪儿！（I need you to seduce Bram! Help me, and I'll tell you where the basement key is!）\n▲娜塔莉亚看了一眼锁，又看向了塞莱特斯。\n娜塔莉亚：我可以答应你！钥匙在哪儿？（I'll do it. Where's the key?）\n塞莱特斯（紧张）：是一把纯金的钥匙，就在布拉姆身上！（It's a solid gold key. and Bram keeps it right on him!）\n【闪回结束】\n▲娜塔莉亚不动声色地将目光从地下室门口，挪到了布拉姆的身上，布拉姆正烦躁地揭开了衬衣上面的三颗扣子，一道金色光芒在他衣服里面一闪而过。\n娜塔莉亚（惊讶）OS：那是钥匙吗？（坚定）我一定会取得布拉姆的信任，拿到地下室的钥匙，救出姐姐！（Was that it? The key? Watch your back, Bram... I'll win your trust, steal it, and tear this hellhole apart to save my sister.）\n13-2\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯站在窗前，忐忑地看着夜色。\n塞莱特斯（紧张）OS：都这么久了，希望娜塔莉娅没出什么危险。（It's been so long. I hope Natalia's okay.）\n▲这时，布拉姆推开了塞莱特斯的房间门，塞拉特斯被吓了一跳，他穿着睡衣，脸上带着温和的笑容。\n布拉姆（步步靠近）：塞莱特斯，这个世界上，唯有我最爱你。你应该牢记这一点。（Celeste, in this world, no one loves you like I do. Remember that.）\n▲塞莱特斯一步一步后退，布拉姆将她抵在了墙上。\n塞莱特斯：布拉姆！你想干什么？（Bram! What do you want?）\n▲布拉姆将一个盒子递给了塞莱特斯。\n布拉姆（笑）：但愿这里面的东西，能让你认清现实。（I hope this helps you see reality.）\n\n\n第十四集\n14-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n▲塞莱特斯脸色发白，紧紧握着裙摆，录音笔还在响。\n娜塔莉亚vo：但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。..(What really pisses me off is this rigged system. I hate the elite—even while I’m dying to have everything they’ve got.）\n▲布拉姆的手指拂过塞莱特斯的脸颊。\n布拉姆（蛊惑）：听见了吗？她恨你，她嫉妒你的出身，她想毁了你。只有我才能保护你！（Hear that? She hates you. She's jealous of your bloodline. She wants to destroy you. Only I can protect you!）\n▲塞莱特斯盯着录音笔，握紧了拳头。\n塞莱特斯OS：娜塔莉亚已经出卖了我？（Did she just throw me under the bus?）\n布拉姆（语气温和）：告诉我，她是怎么样蛊惑你的？（轻轻拥抱塞莱特斯）我会保护你不被伤害。（Now, tell me... how did she get into your head? Trust me, I'll keep you safe.）\n▲塞莱特斯心跳加速，她盯着录音笔，噗嗤一声笑了。\n塞莱特斯（骄傲地抬头）：我出身贵族，觊觎我身份的人太多了，她们嫉妒我、羡慕我，想害我，我习惯了。（I was born noble. So many people want my place. They're jealous, envious, out to hurt me. I'm used to it.）\n▲布拉姆脸上的温和瞬间消失了，他推开塞莱特斯，将录音笔狠狠摔在了地上，塞莱特斯被布拉姆突然变脸吓得捂住了耳朵。\n布拉姆（训斥）：你太狂妄自大了！你的傲慢会招来杀身之祸，唯有我可以庇护你！（You're too arrogant! Your pride will get you killed. Only I can shelter you!）\n▲布拉姆扯下她捂着耳朵的手，靠近她的耳朵。\n布拉姆（质问）：告诉我，你为什么要去地下室！你是不是也想知道里面有什么？（Tell me, why did you go to the basement? You want to know what's in there too, don't you?）\n▲塞莱特斯惊恐。\n塞莱特斯（抬头盯着布拉姆）：不不不——我不知道！是……是娜塔莉亚陷害我！（No, no, no—I don't know! It's... Natalia framed me!）\n▲布拉姆狠狠将塞莱特斯甩在了床上。\n布拉姆（拿出枪）：很好！（上膛）那我现在就去杀了她。（Good. Then I'll go kill her right now.）\n▲布拉姆举着枪大步流星地往外走，塞莱特斯吓坏了，连忙喊道。\n塞莱特斯：不，不是——我说实话！（No, wait—I'll tell the truth!）\n14-2\n夜  内  走廊\n人物  娜塔莉\n▲娜塔莉亚站在门口，耳朵贴在了门上。\n塞莱特斯vo：不，不是——我说实话！（No, wait—I'll tell the truth!）\n▲塞莱特斯的声音从门内传来，娜塔莉亚惊讶地猛地捂住了嘴巴。\n\n\n第十五集\n15-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆猛地回头，用枪挑起了塞莱特斯的下巴。\n布拉姆：那是什么？（威胁）你想背叛我？（What was that? You want to betray me?）\n▲塞莱特斯额头上冒出冷汗，颤抖地开口。\n塞莱特斯：是因为她白天勾引你，所以我故意装梦游，引她去地下室，我想要杀了她！（Because she seduced you today, I pretended to sleepwalk and lured her to the basement. I wanted to kill her!）\n▲布拉姆的表情松动了半分，布拉姆收了枪，轻轻抚摸着塞莱特斯的头发。\n布拉姆（温和）：我很高兴你如此在乎我。（Good. I do love it when you get jealous.）\n▲塞莱特斯颤抖了一下，布拉姆的脸上露出了笑容轻吻了她的额头\n布拉姆：放心，我只爱你一个人，不会被其他女人蒙骗。（Don't worry. I only love you. I won't be fooled by other women.）\n▲布拉姆将塞莱特斯搂在怀中，看着窗户上的影子，嗤笑了一声。\n布拉姆OS：竟然学会了互相掩护。（抚摸塞莱特斯的背影）当你不想让我杀了她的时候，你就已经露出了破绽。（Covering for each other now, are we? The second you stepped in to save her neck, you blew your cover.）\n▲布拉姆将塞莱特斯推到在了床上，开始脱衣服。\n布拉姆（解开皮带，放在手中把玩）：塞莱特斯，你能依靠的只有我一个，你会听话对吗？（Celeste... I'm all you've got in this world. You're gonna be a good girl for me, aren't you?）\n▲塞莱特斯看着浑身发抖，连忙后退，她拼命地摇头。\n塞莱特斯（颤抖求饶）：布拉姆，我，我身体不太舒服，我不想……（Bram, I... I don't feel well. I don't want to...）\n▲布拉姆一把抓住了塞莱斯特的手，眼神凶狠，撕开了她的上衣。\n布拉姆（故作温和）：拒绝我，你以前不是很喜欢我的占有吗？（Saying no to me? You used to crave it when I took control.）\n▲塞莱斯特惊慌失措，想挣扎，布拉姆突然松开她，捂住了她的嘴巴。\n布拉姆（警告）：嘘——有老鼠偷听。（Shh... we have a little eavesdropping rat outside.）\n▲布拉姆手中的手枪上膛，一步一步走向了门口。\n▲切镜。\n▲走廊上，娜塔莉亚正靠在门口听里面的动静，这时，门突然开了，布拉姆手中的枪突然抵在了娜塔莉亚的脑袋上。\n▲娜塔莉亚震惊。\n\n\n第十六集\n16-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚抬头看着布拉姆，布拉姆上半身的衬衣敞开着，他的一只手拿枪口抵着娜塔莉亚的脑袋，一只手关上了门，冷眼看着娜塔莉亚。\n布拉姆（深呼吸）：你在这儿干什么？我不是让你回房间吗？（What are you doing here? Didn't I tell you to go back to your room?）\n▲娜塔莉亚打量着布拉姆的样子，握紧了拳头。\n娜塔莉亚OS：看来我坏了他的好事——（Guess I ruined his little fun—）\n▲娜塔莉亚上前一步，轻轻抚摸着布拉姆裸露的胸膛。\n娜塔莉亚（撒娇）：教父，我不想你和夫人发生关系，我想……（Godfather... I couldn't stand the thought of you touching her. I want... ）\n▲布拉姆一惊，握着手枪的手放了下去，娜塔莉亚的手在布拉姆的身上随意地抚摸了起来。\n娜塔莉亚（着急）OS：钥匙到底在哪儿！（Where the hell is the key?）\n▲布拉姆突然一把抓住了娜塔莉亚的手，眼神带着侵略性地落在了娜塔莉亚的身上。\n布拉姆（捏住了她的下巴）：这么着急取代她？（Can't wait to take her place, huh?）\n▲娜塔莉亚抬头看向了布拉姆，一脸无辜。\n娜塔莉亚（后退）：教父……（Godfather...）\n▲布拉姆瞧着娜塔莉亚的样子，一步一步逼近娜塔莉亚。\n布拉姆：娜塔莉亚，既然是你主动送上门，我就不客气了！（Natalia, since you came to me, I won't hold back!）\n▲布拉姆握住了娜塔莉亚的手腕，一把将她拉在了自己的怀中，低头要吻她，娜塔莉亚几乎是下意识的避开。\n娜塔莉亚OS：禽兽，竟然来真的！（You animal—he's serious!）\n▲布拉姆目光极具侵略性，一步一步逼近娜塔莉亚，他抓住娜塔莉亚的手，让娜塔莉亚的手从他的胸膛一直往下摸到下腹，娜塔莉亚想要收回手，却被布拉姆死死摁住了手。\n布拉姆（蛊惑）：娜塔莉亚，这可是你取代塞莱特斯的机会，你不要吗？权力、财富、地位，你马上就能拥有。（Natalia, this is your chance to replace Celeste. You don't want it? Power, wealth, status, you can have it all.）\n▲娜塔莉亚惊愕地看着布拉姆，露出乖巧的笑容。\n娜塔莉亚（轻点布拉姆的心口）：虽然我很想要，但是……（撒娇）教父，我来月经了，等经期过了……（I really want it, but... Godfather, I'm on my period. Can you wait until it's over？）\n▲布拉姆握住了娜塔莉亚的手。\n布拉姆（嗤笑）：是吗？内裤脱了，我检查。（Is that so? Take off your underwear. Let me check.）\n▲娜塔莉亚不敢置信地盯着布拉姆。\n娜塔莉亚（震惊）：什么？（What?）\n\n\n第十七集\n17-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚后退了一步，抵在了门上，布拉姆逼近一把捏住了娜塔莉亚的下巴，一把捏着她的下巴，将她的脸转过来，威胁着开口。\n布拉姆（喘息）：你不是爱我吗？不是想取代塞莱斯特吗？拿出你的诚意来！（威胁）不然的话，我不介意让我的狼加餐！（You love me, don't you? You say you want to take Celeste's place？Show me your loyalty, or I’ll feed you to my wolves tonight.）\n▲远处传来狼的嚎叫声，气氛突然变得紧张了起来，娜塔莉亚心跳加速。\n▲这时，戴安娜站在走廊尽头大喊。\n戴安娜（大喊）：娜塔莉亚姐姐，爸爸，快来看我画的画！（Natalia! Daddy! Look what I drew!）\n▲布拉姆看到戴安娜，立刻整理了一下自己的衣服，眼神不悦地落在了戴安娜的身上。\n布拉姆（冷冽）：戴安娜！谁允许你出来的？（Diana! Who gave you permission to leave your room?）\n▲戴安娜举着画，画上画着一个生日蛋糕。\n戴安娜（委屈）：爸爸的生日快到了，我只是想送爸爸一个礼物，让爸爸开心。（Daddy's birthday is coming. I just wanted to give you a gift and make you happy.）\n▲布拉姆收起了枪，走向了戴安娜，伸手摸了一下她的头发。\n布拉姆（不耐烦）：你的心意，我收到了，回房间去。（I got it. Go back to your room.）\n▲戴安娜看了一眼布拉姆，又看向了娜塔莉亚，低着头看着生日蛋糕说。\n戴安娜：以前爸爸的生日宴会，都是妈妈亲手做的蛋糕，妈妈去哪儿了？我想妈妈……（Mommy always baked your cake for your birthday... Where did she go? I really miss her, Daddy...）\n▲布拉姆冷漠呵斥。\n布拉姆（呵斥）：戴安娜！闭嘴！（Diana! Shut up!）\n▲戴安娜被吓到了，哇的一声就哭了，娜塔莉亚立刻扑过去，将戴安娜抱起来，回头看向了布拉姆。\n娜塔莉亚（看向布拉姆）：先生，小姐的病情本就不稳定，您别刺激她！（Sir, her condition is unstable. Don't trigger her!）\n▲戴安娜抱着娜塔莉亚的脖子失声痛哭，布拉姆烦躁地挥了一下手，看向了娜塔莉。\n布拉姆：把她带回房间去！（Take her back to her room!）\n▲娜塔莉亚抱着戴安娜转身回戴安娜的房间，布拉姆盯着娜塔莉亚的背影，目光最后落在了她的臀部。\n布拉姆OS：有点小聪明，但也只是个落入囚笼的兔子而已！（A little clever, but still just a rabbit in a cage.）\n▲布拉姆推开了塞莱特斯的房间门走了进来，里面传来了塞莱斯特的尖叫声。\n\n\n第十八集\n18-1\n夜  内   戴安娜房间\n人物  戴安娜   娜塔莉亚\n▲戴安娜在娜塔莉亚的怀中，指着画上的蛋糕，有些委屈的开口。\n戴安娜（抹眼泪）：以前妈妈在的时候，爸爸从不会凶我，还会陪我过生日，我好想妈妈。（When Mommy was here, Daddy never yelled at me. He celebrated my birthday with me. I miss Mommy.）\n▲娜塔莉亚的目光落在了戴安娜手中的画上。\n【闪回（蛋糕定格切镜到小面包）】\n夜  内  娜塔莉亚小时候的家\n人物  小娜塔莉亚  小玛莉\n▲桌上摆放着一个小面包，面包上插着蜡烛，小玛莉看着小娜塔莉亚摸了摸她的脑袋。\n小玛莉（声音稚嫩）：等以后，姐姐给你买个真正的生日蛋糕！（安抚）许个愿吧。（Someday, sis, I'll get you a real birthday cake. Now, close your eyes and make a wish.）\n▲小娜塔莉亚看着插着蜡烛的面包。\n小娜塔莉亚（高兴）：那我的愿望是，和姐姐永不分离！（My wish is for us to stay together forever and ever!）\n▲小娜塔莉亚吹蜡烛，黑幕。\n【闪回结束】\n▲娜塔莉亚看着画，又低头看着熟睡的戴安娜，她紧紧将戴安娜抱在怀中。\n娜塔莉亚（坚定）OS：我会救出姐姐，让戴安娜和她的母亲团聚！（I swear I will rescue my sister... and bring Diana’s mother back to her.）\n18-2\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣端着托盘，托盘里面放着药往塞莱特斯的房间走，娜塔莉亚从戴安娜房间里面出来。\n娜塔莉亚（盯着女佣）OS：过几天是布拉姆的生日宴，是个能利用的机会。（Bram's birthday banquet is in a few days. That's a chance.）\n▲就在女佣靠近时候，娜塔莉亚一不小心撞到了女佣，女佣手中的托盘差点翻了，娜塔莉亚伸手托住了女佣的手腕，一只手扶住药碗。\n娜塔莉亚：小心！（Careful!）\n女佣：感谢小姐。（Thank you, miss.）\n▲女佣端着药要进入塞莱特斯的房间。\n娜塔莉亚OS：希望塞莱特斯能看到我传递给她的信息！（I hope Celeste sees my message!）\n▲这时，布拉姆走了出来。\n布拉姆（看女佣）：等一等——（Wait—）\n▲娜塔莉亚回头紧张地看着布拉姆。\n娜塔莉亚OS：千万别被布拉姆察觉破绽。（Don't let Bram spot anything.）\n▲布拉姆抬头看了一眼娜塔莉亚，嗤笑了一声。\n布拉姆：你在紧张什么？（Why the jittery face, Natalia?）\n娜塔莉亚（摇头）：不，我刚才不小心把夫人的药撞洒了些……（Nothing. I accidentally spilled some of her medicine earlier...）\n▲布拉姆一步一步走了过来，目光看向了女佣手中的托盘，他用勺子搅了一下药，又将碗端起来检查了一下。\n布拉姆（审视）：洒了吗？（Did it spill?）\n娜塔莉亚（紧张）：一点点……（Just a tiny bit..）\n▲娜塔莉亚盯着布拉姆的动作，心跳加快，目光看向了托盘。\n▲布拉姆看了一眼娜塔莉亚，又顺着娜塔莉亚的目光落在了女佣手中的托盘上。\n布拉姆（冷冽）：将托盘翻过来。（Flip the tray over. Now.）\n▲布拉姆拿出手枪，子弹上膛，娜塔莉亚的目光盯着女佣的动作，女佣缓缓将托盘翻过来——\n\n\n第十九集\n19-1\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣听话地将托盘翻了过来，下面什么都没有，布拉姆这才将药碗放在了托盘上，目光又看向了女佣。\n布拉姆（冷冽）：药给我，我拿进去。（Hand it over. I'll take it to her myself.）\n▲女佣听话地将药碗递给了布拉姆，娜塔莉亚眼神一变，一把抱住了布拉姆的手臂。\n娜塔莉亚（委屈）：教父~您就这么关心夫人？（Godfather, you care about her that much?）\n▲布拉姆一愣，低头看向了娜塔莉亚。\n布拉姆（捏娜塔莉亚的脸）：吃醋了？（Jealous?）\n▲娜塔莉亚松开了布拉姆的手臂，转身背对布拉姆。\n娜塔莉亚（不高兴了）：我怎么会吃醋？我有什么资格吃醋？（Why would I be jealous? I have zero right to be.）\n▲布拉姆抓住了娜塔莉亚的手臂，将她拉入了自己的怀中。\n布拉姆（捏娜塔莉亚的脸）：你长得很像一个人。（You know... you really remind me of someone..）\n▲娜塔莉亚不动声色地抬头看向了布拉姆，指尖轻轻点了点他的胸口。\n娜塔莉亚（乖巧）：什么人？情人还是爱人？您不会拿我当替身吧。（Oh? An ex-lover, or a wife? Don't tell me I'm just some cheap stand-in.）\n▲布拉姆握住娜塔莉亚的手，轻轻吻了吻她的指尖。\n布拉姆（嗤笑）：她可没有你这么大胆。（打量娜塔莉亚）也没有你这么诱人~（She wasn't as bold as you. Or as tempting.）\n▲娜塔莉亚勾着布拉姆的皮带，让他一步步靠近。\n娜塔莉亚（乖巧）：教父昨晚不是说要检查吗？我准备好了……（Godfather, didn't you say you wanted to check last night? I'm ready...）\n▲布拉姆喉结滚动了一下，一步一步靠近娜塔莉亚，女佣立刻低着头，一只手托着托盘，打开门进入了塞莱特斯的房间。\n18-2\n日 内  塞莱特斯房间\n人物 塞莱特斯  女佣\n▲塞莱特斯看着女佣端着咖啡进来，声音冰冷地开口。\n塞莱特斯：出去，我没有病，我不喝这些药！（Get out. I'm not sick. I'm not drinking this!）\n女佣（为难）：夫人，教父下令，我必须看着您喝下去。（Ma'am, please... the Godfather’s orders. I have to watch you finish it.）\n▲塞莱特斯刚想发火，突然看见女佣的衣袖袖口位置贴了一张极小的纸条。\n塞莱特斯（不动声色）：喝就喝——（Fine, I'll drink—）\n▲她伸手抓住了女佣的手腕顺手将纸条取了下来，随后端起碗一口喝了下去，将空碗扬了扬。\n塞莱特斯：你可以滚了！（You can get lost now!）\n▲女佣低着头逃一般离开，塞莱特斯立刻看纸条。\n娜塔莉亚（旁白）：宴会捉奸，帮您离开，希望您当众将地下室的秘密揭露出来，助我一臂之力！同意就摔碗为信号。（Catch him cheating at the party, and I'll help you walk free. Expose the dark secret of the basement in front of everyone, and we both win. Drop the bowl as a signal.）\n▲切镜。\n▲走廊上，布拉姆一把将娜塔莉亚抗在了肩上，大步流星往自己的方向走。\n布拉姆（拍娜塔莉亚的臀）：小妖精，我今天就让你爽个够！（You little vixen. I'm gonna rock your world today!）\n▲娜塔莉亚趴在布拉姆的肩膀上，看向了塞莱斯特的房门。\n娜塔莉亚OS：三、二、一……（Three, two, one...）\n▲突然，塞莱特斯房间里面传来打碎了碗的声音，布拉姆脚步一顿！将娜塔莉亚放下。\n娜塔莉亚OS：合作达成！(Deal!）\n布拉姆（看向塞莱特斯的房间，不悦）：我去看看她又在闹什么！（Let me see what she's up to now!）\n▲娜塔莉亚一把抓住了布拉姆的手。\n娜塔莉亚（撒娇）：教父~（Godfather.）\n▲布拉姆回头看了一眼娜塔莉亚。\n布拉姆（安抚）：生日宴时，她父母会来，你也不想她到时候闹事，对吧！（Her parents will be at the birthday banquet. You don't want her making a scene, right?）\n▲娜塔莉亚故作委屈松手。\n娜塔莉亚（叹气）：好吧，那我就先忍一忍~（Fine. I'll hold it in for now.）\n▲布拉姆走向了塞莱特斯的房间，娜塔莉亚转身往戴安娜的房间走。\n娜塔莉亚（看门）OS：希望能在宴会上，引塞莱特斯的父母出手打开地下室，如果失败了，我也能乘机拿到钥匙，救出姐姐！（Let’s hope Celeste’s parents play their part and blow the basement wide open. But if that plan tanks... I’ll just swipe the key myself and tear this place down to save my sister.)\n\n\n第二十集\n20-1\n日  内  塞莱特斯房间\n人物  布拉姆 塞莱特斯  管家\n▲塞莱特斯睡在了床上，布拉姆坐在窗边上，管家恭敬地看着布拉姆。\n管家：先生，家庭医生给夫人打了镇定剂，她应该不会再闹了。（Sir, the doctor loaded her up with sedatives. She’s out cold; she won’t be making a scene anymore.)\n▲布拉姆点了点头。\n布拉姆（冷冽）：不管如何，宴会之前别让她惹出事情。（Either way, don't let her cause trouble before the banquet.）\n管家（不解）：教父，您明知道夫人和娜塔莉亚在联手动手脚？为什么不阻止她们？（Godfather, you know Celeste and Natalia are working together. Why not stop them?）\n▲布拉姆看了一眼塞莱特斯，嗤笑了一声。\n布拉姆（不屑）：两个落入狼群的兔子，能翻出什么浪花？顶多两个有趣的猎物而已！（Two rabbits in a wolf pack. What can they do? Just two little rabbits for me to play with.）\n20-2\n日  内  宴会厅\n人物  布拉姆  娜塔莉亚  塞莱特斯   戴安娜  宾客若干   莱恩  伊丽莎白\n▲宴会厅金碧辉煌，娜塔莉亚带着戴安娜在甜品区吃糕点，娜塔莉亚远远看着塞莱特斯挽着布拉姆的手，正在和一对夫妇聊天，女人打扮华丽【塞莱特斯母亲 伊丽莎白】，男人【塞莱特斯父亲 莱恩】看起来风度翩翩，举手投足都十分贵气，塞莱特斯似乎察觉了娜塔莉亚的目光，二人对视了一眼互相点头。【Celeste’s Mother, Elizabeth】【Celeste’s Father, Ryan】\n▲娜塔莉亚亲眼看着塞莱特斯将一杯酒递给了布拉姆，布拉姆将酒一口喝了。\n娜塔莉亚OS：上钩了，这酒里的可是好东西。（Got him. There’s something extra in that drink.）\n▲戴安娜看了过去。\n戴安娜：那是塞莱特斯夫人的妈妈，（情绪低落）我也好想我的妈妈呀。（That's Celeste's mom. I miss my mommy too.）\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的戴着帽子的男性客人，路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n男客人（伸手扶娜塔莉亚和戴安娜）：抱歉。（My apologies.）\n▲娜塔莉亚摇了摇头。\n娜塔莉亚：我没什么大碍。（I'm fine.）\n▲布拉姆听到这边的动静，立刻看了过来。\n布拉姆（担心）：发生了什么事？（What happened?）\n男客人（歉意）：教父，不好意思，我差一点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n▲布拉姆故作绅士。\n布拉姆：不必介怀，请您继续享用晚宴吧。（No worries. Enjoy the banquet.）\n▲布拉姆摸了摸戴安娜的脑袋。\n布拉姆：我的小公主，玩的开心吗？（My little princess, having fun?）\n戴安娜（点头）：嗯！（Yeah!）\n布拉姆（温和）：宾客太多了，你跟娜塔莉亚医生回房间好不好？（Too many guests. Go back to your room with Dr. Natalia, okay?）\n戴安娜：可是我还没玩儿够……（But I'm not done playing...）\n娜塔莉亚（抱起）：小姐，我们听教父的话，（柔声安抚）回房间我给你讲故事好不好？（Miss Diana, let's listen to the Godfather. I'll tell you a story in your room, okay?）\n▲就在娜塔莉亚准备离开时，塞莱特斯突然举着酒杯过来，笑着对布拉姆说。\n塞莱特斯：布拉姆，父亲让你陪他喝一杯——啊！（Bram, Father wants you to have a drink with him—ah!）\n▲塞莱特斯突然脚下一滑，一杯酒一下子泼到了布拉姆的身上，众人齐刷刷地看了过去。\n▲布拉姆昂贵的西装被打湿，看上去有些狼狈。\n塞莱特斯（震惊）：哦～天啊！布拉姆，我不是故意的。（Oh my God! Bram, I didn't mean it.）\n▲众目睽睽下，布拉姆强忍怒气，对着塞莱特斯露出了温和的笑容。\n布拉姆（安抚）：别太自责，我去换套衣服，你照顾一下宾客！（Don't blame yourself. I'll go change. You take care of the guests.）\n▲布拉姆优雅转身离开，塞莱特斯给娜塔莉亚使了个眼神，娜塔莉亚立刻点了点头。\n塞莱特斯（兴奋）OS：今夜过后，我就能离开了，娜塔莉亚，你可千万别让我失望！（After tonight, I'll be free. Natalia, don't let me down!）\n20-3\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲敲门声响起，布拉姆赤裸着上身开门。\n布拉姆（烦躁）：送个衣服都这么慢，当心我崩了你们……（What’s taking so long with those clothes? I swear, I’ll shoot you if...）\n▲布拉姆的声音戛然而止，只见娜塔莉亚穿着一条性感的低胸吊带连衣裙，抱着西装站在门口。\n布拉姆（惊愕）：娜塔莉亚？你穿成这样来干什么？（Natalia? What the hell are you wearing?）\n\n\n第二十一集\n21-1\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n娜塔莉亚（挑眉）：教父不喜欢刺激吗？（抚摸布拉姆的胸膛）还是，您有别的顾虑？（What’s wrong, Godfather? Don't tell me you're scared of a little excitement...）\n▲布拉姆看着娜塔莉亚，眼神从惊愕变成了玩味。\n布拉姆（捏住了娜塔莉亚的下巴）：激将法对我可没用！（笑）不过，我现在的确想把你吃掉！（Reverse psychology won't work on me, sweetheart. Though... I've got to admit, I'm dying to devour you right now.）\n▲布拉姆四下看了一眼，没看见人，他抓住了娜塔莉亚的手臂，将她抗在了自己的肩膀上，然后锁上了门。\n▲塞莱特斯看着布拉姆将娜塔莉亚拉入了房间，嘴角勾起了一个弧度，她转身向宴会厅走去。\n21-2\n日  内  宴会厅\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白\n▲宴会厅中，伊丽莎白挽着莱恩的手，正在和宾客寒暄，塞莱特斯一把抓住了伊丽莎白的衣服。\n塞莱特斯：妈妈，布拉姆出轨了。（Mom, Bram is cheating.）\n▲众人震惊，目光惊愕地盯着塞莱特斯，伊丽莎白迅速捂住了塞莱特斯的嘴巴。\n伊丽莎白（警告）：塞莱特斯！不要胡说！我想布拉姆应该不是这种人。（Celeste! Don't talk nonsense! I don't think Bram is that kind of man.）\n▲塞莱特斯摇了摇头，挣脱了伊丽莎白的手，拽着她往楼上走。\n塞莱特斯（委屈）：我亲眼看到他和一个女人进入了房间里面，请您相信我！（I caught him with my own eyes! He slipped into that room with a woman, you have to believe me!）\n▲众目睽睽之下，塞莱特斯和莱恩对视了一眼，莱恩将酒杯放在了桌子上。\n莱恩（冷哼）：哼，如果布拉姆敢背叛你，我绝不会放过他！（Hmph. If Bram dares to betray you, I won't let him get away with it!）\n▲莱恩大步流星地往房间走，塞莱特斯拉着伊丽莎白跟了上去，宾客们也跟着去看热闹。\n21-3\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚\n▲布拉姆垂眸盯着站在自己面前的娜塔莉亚，眼神透着审视。\n布拉姆（捏娜塔莉亚的手）：今天是我的生日宴，外面都是宾客，你想害我？嗯？（It's my birthday banquet. Guests are everywhere. You want to set me up? Hmm?）\n▲娜塔莉亚轻轻抚摸着布拉姆的脖子。\n娜塔莉亚（笑）：怎么会？（靠近布拉姆的耳朵）今天是您的生日。这是我特地为您准备的生日礼物！（Of course not. It's your birthday. This is a birthday gift I prepared just for you!）\n布拉姆（捏娜塔莉亚的腰）：把你自己当做礼物送给我？（Giving yourself to me as a gift?）\n▲娜塔莉亚缓缓拉下了自己的一根肩带，手在布拉姆身上摸索。\n娜塔莉亚（点头）：当然，过了今夜，您就是我的第一个男人，也是唯一的……（Of course. After tonight, you'll be my first man, and my only...）\n▲布拉姆喉结滚动了一下，一翻身，将娜塔莉亚压到身下！\n▲切镜。\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲门突然被大力踹开，娜塔莉亚和布拉姆猛地抬头，塞莱特斯带众人站在门口。\n塞莱特斯（呵斥）：你们在干什么——（What the hell is going on here?）\n\n\n第二十二集\n22—1日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。\n塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）\n▲娜塔莉亚对视塞莱特斯摇了摇头。\n【闪回】\n22-2\n日  内  布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲突然，外面传来了敲门声。\n女佣vo：教父，夫人带着伯爵和伯爵夫人过来了。（Godfather, Madam is here with the Count and Countess.）\n▲娜塔莉亚惊讶，下一刻，布拉姆突然清醒过来，一把将娜塔莉亚推开。\n布拉姆：快把衣服穿好！（Get dressed. Now!）\n【闪回结束】\n▲布拉姆带着温和的笑容，看向了塞莱特斯和莱恩夫妇。\n布拉姆（优雅）：爸妈怎么过来了？（Father, Mother... what a pleasant surprise. Is something wrong?）\n莱恩（尴尬）：你太久没出来，我们过来瞧瞧。（You've been missing for quite a while. We were getting concerned.）\n塞莱特斯（指着布拉姆）：娜塔莉亚怎么在这里？你们孤男寡女躲开宾客在这里面做什么？（Why is Natalia here? What are you two doing alone away from the guests?）\n布拉姆（从容）：戴安娜在宴会上受到了一些惊吓，娜塔莉亚正在向我汇报，有问题吗？（Diana got a little scared at the banquet. Natalia was briefing me on her condition. Is there a problem?）\n塞莱特斯（呵斥）：什么问题非要现在汇报？（看娜塔莉亚）你说，你们在这里面干什么？！（What could be so urgent it couldn't wait until tomorrow?! You! Tell them the truth! What were you doing in his room?）\n▲塞莱特斯的情绪特别激动，目光死死盯着娜塔莉亚，眼神带着祈求。\n塞莱特斯：你说啊！（Say it!）\n▲所有人的目光都落在了娜塔莉亚的身上。\n娜塔莉亚（握紧报告）OS：塞莱特斯，对不起了。（Celeste, I'm sorry.）\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n▲塞莱特斯惊愕地看着娜塔莉亚。\n塞莱特斯（不敢相信）：什么？你撒谎！（抓住了莱恩的手）爸爸，除了这个女人，地下室还藏在一个女人！（What? You're lying! Dad, besides this woman, there's another woman hidden in the basement!）\n莱恩（惊讶）：什么地下室？（The basement?）\n▲众人震惊，布拉姆面色阴沉，娜塔莉亚激动地看向了莱恩。\n\n二卡\n\n\n第二十三集\n23-1\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲布拉姆上前一步，握住塞莱特斯的手。\n布拉姆（深呼吸）：塞莱特斯，我知道你生病了，你也很难受，但有什么问题，我们私下说好吗？（Celeste, I know you're sick and it's hard, but let's talk in private, okay?）\n▲众人惊讶。\n伊丽莎白：生病了？（Sick?）\n塞莱特斯：你胡说——（看伊丽莎白和莱恩）爸爸妈妈，他胡说的，我没有生病！（You're lying—Mom, Dad, he's lying! I'm not sick!）\n▲布拉姆拿出了检查报告递给了莱恩和伊丽莎白。\n布拉姆（悲痛）：这是塞莱特斯的精神检查报告。她有严重的被害妄想症和梦游症，这一切都是她臆想出来的。（This is Celeste's psychiatric report. She has severe paranoia and sleepwalking disorder. She imagined all of it.）\n▲众人震惊。\n▲莱恩接过检测报告，有些惊讶。\n布拉姆：她一直怀疑我会出轨，怀疑我会害她。（叹气）可是我没有。（She’s constantly convinced I'm unfaithful, that I'm trying to destroy her. God knows I've done nothing of the sort.）\n伊丽莎白（惊讶）：这些事情，你为什么不早告诉我们？（Why didn't you tell us sooner?）\n布拉姆（难过）：你们身体不好，我不想让你们担心——（鞠躬）是我没照顾好她。（You both have delicate health; I didn't want to burden you. It's my fault, I simply failed to protect her.）\n▲宾客盯着布拉姆，忍不住小声议论了起来。\n宾客1：教父果然是重情重义，塞莱特斯夫人这样对待他，他还不离不弃！（The Godfather is a saint. His wife treats him like dirt, and he still covers for her!）\n宾客2：是啊，教父能成为伯爵的女婿，人品肯定很好。（Yeah. If the Count made him his son-in-law, he must be a good man.）\n▲塞莱特斯一把将报告抢过来，直接撕碎了。\n塞莱特斯（咆哮）：我没疯！是他在撒谎——（I'm not crazy! He's lying—）\n▲莱恩打量着一眼看热闹的宾客，立刻呵斥塞莱特斯。\n莱恩：够了！塞莱特斯注意你的言行！（Enough! Celeste, watch your behavior!）\n▲伊丽莎白立刻抓住了塞莱特斯的手，示意她别再说了。\n莱恩（冷脸）：行了，立刻收拾好，出来接待宾客，别再闹些笑话让人误会！（看向宾客）都散了吧。（All right. Clean yourself up and come greet the guests. Stop embarrassing us. Everyone, please, enjoy yourselves—nothing to see here.）\n▲宾客们十分给莱恩的面子，离开了。\n塞莱特斯（着急）：爸爸——（Dad—）\n▲莱恩拽着塞莱特斯离开。\n莱恩（呵斥）：跟我过来，我有话跟你说。（Come with me. I need to talk to you.）\n▲所有人都离开之后，布拉姆一抬手将桌角的花瓶狠狠摔碎。\n布拉姆（恨）：一群杂碎，早晚有一天，我要将你们全部踩在脚底！（A bunch of trash. One day, I'll put every one of you under my feet!）\n▲娜塔莉亚吓了一跳，连忙低下头去。\n娜塔莉亚（恭敬）：教父，抱歉，是我的鲁莽给您惹麻烦了。（Godfather, I'm sorry. My recklessness caused you trouble.）\n▲布拉姆一腔火气，拿起桌上的枪抵着娜塔莉亚的脑袋。\n布拉姆（呵斥）：到底是有意的，还是无意的！（Was it on purpose or not?）\n▲娜塔莉亚惊慌地举起双手，盯着布拉姆的眼睛。\n布拉姆（审视）OS：当猎物脱离掌控时，我一定会亲手杀掉她！我讨厌这种失控感！（When prey slips out of control, I'll kill her myself. I hate losing control.）\n▲布拉姆突然开枪，子弹射出擦着娜塔莉亚的脸颊而过，打碎了花瓶，娜塔莉亚尖叫了一声，连忙开口。\n娜塔莉亚（惊呼）：教父，我承认，我是故意的！（Godfather, I admit it. I did it on purpose!）\n布拉姆（呵斥）：你为什么要这么做！（Why did you do it?）\n娜塔莉亚（慌乱）：我想得到您，我想取代塞莱特斯，（一把抱住布拉姆）您不是说给我一个机会吗？（I want you. I want to replace Celeste. Didn't you say you'd give me a chance?）\n▲布拉姆震惊。\n\n\n第二十四集\n24-1\n日  内   布拉姆房间\n人物 布拉姆  娜塔莉亚 \n▲布拉姆惊讶地看着娜塔莉亚。\n布拉姆（惊讶）：什么？（What did you just say?）\n▲娜塔莉亚抬头看着布拉姆。\n娜塔莉亚（诚恳）：塞莱特斯根本就不懂您，也配不上您，您这么强大、睿智，我实在太仰慕您了，才会铤而走险抓住这个机会，我以为……（Celeste doesn't understand you. She doesn't deserve you. You're so powerful and smart. I admire you so much that I took this risk. I thought...）\n▲布拉姆盯着娜塔莉亚的眼睛，握着枪的手垂了下去，揉了揉额头。\n布拉姆（放缓语气）：你以为在今天跟我上床，被发现了，我就会和塞莱特斯离婚，娶你是吗？（You thought if you slept with me today and we got caught, I'd divorce Celeste and marry you?）\n▲娜塔莉亚握住布拉姆的枪，指着自己的脑袋。\n娜塔莉亚（认真）：您杀了我吧，杀了我证明您的清白！（Then pull the trigger! Kill me right now to prove you had nothing to do with this!）\n▲布拉姆惊讶，猛地收回了枪。\n布拉姆（拍娜塔莉亚的脸）：我不会杀你，你先回去陪戴安娜吧，我会处理好。（轻轻拥抱）记住，在这里，只有我能保护你。（I won't kill you. Go keep Diana company. I'll handle it. Remember, in this place, only I can protect you.）\n▲娜塔莉亚红着眼睛点了点头，转身离开，镜头特写，娜塔莉亚走到门口时，摊开手心，掌心里面躺着一把金色的钥匙。\n▲布拉姆盯着娜塔莉亚的背影，冷笑了一声。\n布拉姆OS：两个女人以为联手就能毁掉我？做梦？（Two women think they can team up and destroy me? Dream on.）\n24-2\n日  外 花园\n人物  莱恩  伊丽莎白   塞莱特斯  布拉姆   管家\n▲塞莱特斯焦急地看着父母。\n塞莱特斯：爸爸妈妈你们刚刚为什么不帮我，我真的没病！（Mom, Dad, why didn't you help me just now? I'm really not sick!）\n莱恩：塞莱特斯，你先冷静，我们并没有看到布拉姆出轨，如果为了他跟别的女人说话而大动干戈，只会显得我们无礼。（Celeste, calm down. We didn't see Bram cheating. Making a scene because he talked to another woman would just make us look rude.）\n伊丽莎白：是啊，塞莱特斯，你不该在大庭广众之下伤了布拉姆的脸面，况且那女人只是他孩子的心理医生，别人会觉得你是个恶毒的后妈。（Yes, Celeste. You shouldn't embarrass Bram in public. Besides, that woman is just his child's therapist. People will think you're a cruel stepmother.）\n塞莱特斯（绝望）：爸爸妈妈，你们不相信我？（Mom, Dad, you don't believe me?）\n伊丽莎白（安抚）：塞莱特斯，一个心理医生，你不喜欢她，找个机会把她赶走就好了！（Celeste, she's just a therapist. If you don't like her, find a chance to get rid of her.）\n莱恩（抚摸塞莱特斯的头发）：你自小性格要强，肯定受不了丝毫委屈，教父现在权势滔天，你应该获取他的欢心，况且他对你很好，别无理取闹了。（You've always been strong-willed. You can't stand the slightest grievance. The Godfather is powerful now. You should win his favor. Besides, he treats you well. Stop making a fuss.）\n▲塞莱特斯绝望的后退了半步。\n塞莱特斯：不，不是这样的。（No, it's not like that.）\n莱恩（心疼）：你放心，爸爸会联系最好的医生治疗你的病！（Don't worry. I'll contact the best doctor to treat you!）\n▲镜头上拉：布拉姆站在二楼的窗户，眼神冰冷地盯着他们。\n布拉姆（狠辣）OS：这场捕猎游戏，我玩儿够了，该结束了！（I'm done playing this hunting game. It's time to end it.）\n\n\n第二十五集\n25-1\n夜  内   宴会厅门口\n人物 塞莱特斯   伊丽莎白  下人若干 莱恩 布拉姆   娜塔莉亚\n▲莱恩和伊丽莎白站在门口，布拉姆站在二人面前，莱恩严肃地盯着布拉姆。\n莱恩（温和）：布拉姆，你对塞莱特斯的好，我们看在眼中，但她就是大小姐脾气，希望你多多担待，不要跟她一般见识。（Bram, we know you care for Celeste deeply. But she’s always had a headstrong, spoiled streak. Do be gentle with her, and try not to take her outbursts to heart.）\n伊丽莎白（温和）：夫妻之间，要互相体谅。（Married couples need to understand each other.）\n▲众目睽睽下，布拉姆握着的拳头青筋暴起。\n布拉姆（冷漠）OS：一群虚伪的贵族，凭什么高高在上教训我，等我拿到了他所有的资源，我一定把他丢去喂鲨鱼！这一天马上就要到来了！（A bunch of hypocritical nobles. What gives you the right to lecture me? Once I get all his resources, I'll feed him to the sharks. That day is coming soon.）\n▲布拉姆弯着脊梁低头道歉。\n布拉姆：您放心，我很爱她，我保证会照顾好她的。（Don't worry. I love her very much. I promise I'll take good care of her.）\n▲塞莱特斯瞧着布拉姆的样子，害怕地死死握住了伊丽莎白的手。\n伊丽莎白（心疼）：布拉姆，塞莱特斯状态不太好，不如让她先跟我们回去住几天？（Bram, Celeste isn't doing well. Why not let her come home with us for a few days?）\n▲塞莱特斯的眼睛都亮了起来，娜塔莉亚不动声色地看向这边。\n娜塔莉亚OS：只要塞莱特斯离开了这里，我们的计划就成功了！（If Celeste leaves this place, our plan works!）\n▲布拉姆伸手将塞莱特斯搂在怀中，绅士地开口。\n布拉姆：妈，塞莱特斯还需要接受治疗，我比较了解她的情况，如果塞莱特斯现在离开，可能会中断她的治疗。（Mom, Celeste still needs treatment. I know her condition better. If she leaves now, it could interrupt her treatment.）\n莱恩（点头）：布拉姆说得有道理，别影响塞莱特斯的治疗。（Bram has a point. Don't interrupt her treatment.）\n▲塞莱特斯眼眶瞳孔，伊丽莎白不舍得吻了吻她的脸颊，安抚她。\n伊丽莎白：听话，好好治病，等你状态好了，妈妈来接你。（Be good. Do what the doctors say. Once you're better, I'll come get you.）\n塞莱特斯（绝望）：妈妈，我真的没病——（Mom, I'm really not sick—）\n布拉姆（搂住塞莱特斯）：塞莱特斯，听话，太晚了，让爸爸妈妈回去好好休息吧。（Celeste, be good. It's late. Let Mom and Dad go home and rest.）\n▲伊丽莎白松开了塞莱特斯，挽着莱恩的手上车，布拉姆带着微笑搂着塞莱特斯目送二人，车子离开之后，布拉姆突然伸手捏住了塞莱特斯的脖子。\n布拉姆（眼神阴冷）：关门，我的夫人需要接受治疗了！（Lock the gates. My wife is due for her treatment.）\n\n\n第二十六集\n26-1\n夜  内   宴会厅/走廊\n人物 塞莱特斯   下人若干  布拉姆   娜塔莉亚\n▲安保瞬间关上了庄园的大门，整个庄园被围了起来，布拉姆掐着塞莱特斯的脖子，逼迫着塞莱特斯上楼。\n塞莱特斯（惊呼）：松开我！爸爸——妈妈，救命——（Let me go! Dad—Mom, help—）\n▲娜塔莉亚惊愕地看着眼前的场景，她连忙站在旁边，给布拉姆让路，塞莱特斯路过娜塔莉亚的时候，眼神紧紧盯着娜塔莉亚，又看着屋内的佣人们，佣人们低着头不敢抬头。\n▲镜头特写：其中一个女佣退到了人群后面，悄无声息地往门口走。\n▲娜塔莉亚瞧着布拉姆将塞莱特斯拉入了房间狠狠关上了门，她连忙转头往地下室方向跑。\n娜塔莉亚（紧张）OS：钥匙已经到手了，布拉姆应该不会杀了塞莱斯特，我得趁乱先救出姐姐！（I have the key. Bram probably won't kill Celeste. .. I have to take advantage of this chaos and get my sister out NOW.）\n26-2\n夜   内   塞莱特斯房间\n人物：女佣   布拉姆  塞莱特斯  \n▲布拉姆将塞莱特斯拉入了房间狠狠摔在了床上，他扯松了领带，死死盯着塞莱特斯。\n▲塞莱特斯惊恐后退。\n塞莱特斯：你要干什么——你敢对我动手，我父母不会放过你的！（What are you doing? If you touch me, my parents won't let you get away with it!）\n▲布拉姆笑着看着塞莱特斯。\n布拉姆（笑容诡异）：塞莱特斯，我怎么舍得杀了你？只是我不明白，我这么爱你，你为什么要害我！（Celeste, how could I bear to kill you? I just don't understand. I love you so much, why did you try to hurt me?）\n塞莱特斯（惊恐）：我没有害你！是你自己和娜塔莉亚不清不白，难道还不允许我告诉我父亲吗？（I didn't hurt you! You're the one fooling around with Natalia. Am I not allowed to tell my father?）\n布拉姆（抓住塞莱特斯的头发）：是你在酒里下毒，还带着人捉奸，害我在大庭广众之下被你父亲训斥！还不算害我吗？（You spiked my drink! You staged a scandal to catch me red-handed, and you let your father humiliate me in front of everyone! You call that not trying to ruin me?）\n塞莱特斯（惊恐真正）：我没有！（I didn't!）\n布拉姆（膝盖压住塞莱特斯的腿）：怎么？你想离开我？（What’s the matter? Dying to run away from me?）\n塞莱特斯（尖叫）：啊——（Ah—）\n布拉姆（逼问）：你是不是看不起我？是不是觉得我配不上你？（You look down on me, don't you?! You think a high-and-mighty heiress is too good for a man like me?）\n\n\n第二十七集\n27-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲塞莱特斯被压得表情扭曲。\n塞莱特斯（痛苦）：不——我没做过！（No—I didn't do it!）\n▲布拉姆一把将塞莱特斯从床上拉起来。\n布拉姆（冷笑）：不承认是吧？（Not admitting it, huh?）\n▲布拉姆将她摁在了窗口，只见庄园里面有个女佣悄无声息地靠近围墙。\n布拉姆（冷冽）：那是你的信使吗？（举起枪对准女佣的后背）（Is that your messenger?）\n塞莱特斯（惊恐）：不，别杀她！（No, don't kill her!）\n▲布拉姆冷笑，一枪崩了女佣（枪声，窗外鸟雀惊飞，避免直给暴力镜头），塞莱特斯也跟着尖叫了一声。\n▲切镜。\n▲娜塔莉亚站在地下室的入口，她正打算下去。\n娜塔莉亚OS：等我救出姐姐，再去救塞莱特斯！（Once I save my sister, I'll go save Celeste!）\n▲突然，外面响起了枪声，娜塔莉亚连忙转身走向了塞莱特斯的房间。\n娜塔莉亚OS：塞莱特斯！——（Celeste!—）\n▲娜塔莉亚转身向楼上跑去。\n▲切镜。娜塔莉娅刚跑到塞莱斯特门口，突然戴安娜从房间里面走了出来，一把抓住了娜塔莉亚的手，娜塔莉亚惊愕地低头看着戴安娜。\n戴安娜（乖巧）：别过去！（Don't go over there!）\n▲娜塔莉亚惊讶。\n▲切镜\n▲屋内。\n▲布拉姆摁着塞莱特斯的脖子。\n布拉姆（嗤笑）：夫人，我知道娜塔莉亚是谁，她是玛莉的妹妹对吗？（Ma'am, I know who Natalia is. She's Mary's sister, right?）\n▲塞莱特斯惊恐地看着布拉姆。\n塞莱特斯（紧张）：我，我不知道你在说什么！（I—I don't know what you're talking about!）\n▲布拉姆拽住她的头发。\n布拉姆（嘲讽）：夫人，你居然把希望放在一个刚刚毕业的心理医生身上，她的确有些小聪明，可惜，柔弱的像是一只兔子，毫无威胁力！（Ma'am, you put your hope in a fresh-out-of-school therapist. She's a little smart, but weak as a rabbit. No threat at all!）\n▲说着，布拉姆摁住塞莱特斯的脖子，让她趴在窗边上，逼她看着死在地上的女佣，一字一句地威胁。\n布拉姆（残忍）：你猜，我明明什么都知道，为什么还要放过娜塔莉亚？（蛊惑）因为她诚实，夫人，你诚实吗？（Guess why I let Natalia live when I know everything? Because she's honest. Are you honest, ma'am?）\n▲塞莱特斯不可置信地盯着布拉姆。\n塞莱特斯OS：娜塔莉亚出卖我？（Natalia sold me out?）\n【闪回14-1】\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n【闪回22-1】\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n【闪回结束】\n▲塞莱特斯握紧拳头。\n塞莱特斯OS：娜塔莉亚每次都没有按照计划行事，难道她真的为了保命牺牲我……（Natalia never followed the plan. Did she really sacrifice me to save herself...）\n▲布拉姆盯着塞莱特斯的眼睛。\n布拉姆（蛊惑）：塞莱特斯，我比你的父母更疼爱你，他们都不管你，只有我护着你，告诉我，是不是有人蛊惑你？（Celeste, I love you more than your parents do. They don't care about you. Only I protect you. Tell me, did someone turn you against me?）\n▲塞莱特斯惊恐地摇头，不肯说。\n▲布拉姆松开了塞莱特斯拿出了一支药剂，他推动针管，药水喷出来了些。\n布拉姆（威胁）：知道这是什么吗？（Know what this is?）\n▲塞莱特斯惊恐后退，布拉姆一步一步逼近。\n布拉姆（阴沉）：放心，不死，只是会麻痹神经，颤抖，抽搐，瘫痪……（Relax... it won't kill you. It just rots your nervous system from the inside—first come the shakes, then the spasms, until you're completely paralyzed.）\n塞莱特斯（惊恐）：不！我说！我什么都告诉你！（No! I'll talk! I'll tell you everything!）\n\n\n第二十八集\n28-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲布拉姆满意地看着塞莱特斯。\n塞莱特斯：是娜塔莉亚，她——（It's Natalia. She—）\n▲外面突然传来了戴安娜的尖叫声。\n戴安娜vo：啊——（Ah—）\n▲紧接着传来花瓶摔碎的声音。\n娜塔莉亚vo：小姐！请您冷静下来。（Miss Diana! Please calm down.）\n戴安娜（尖叫）：妈妈——我要妈妈——（Mommy—I want Mommy—）\n娜塔莉亚（敲门）：教父！不好了！小姐发病了，我需要医生的帮助！！（Godfather! Something's wrong! She's having an episode. I need a doctor!!）\n▲布拉姆将注射器放下，转身往外走。\n布拉姆：老实待着！（Stay right there!）\n▲布拉姆大步流星地走了出去，塞莱特斯捂着心口，泪流满面。\n28-2\n夜  内   戴安娜房间\n人物  戴安娜  医生  娜塔莉亚  布拉姆\n▲戴安娜躺在床上，闭着眼睛，娜塔莉亚和布拉姆站在旁边，医生正在收拾器材。\n医生：教父，小姐的情况不太稳定，不能受到刺激。（Godfather, Diana's still not doing well. We need to keep her calm.）\n▲布拉姆点了点头，医生离开了，布拉姆轻轻抚摸着戴安娜的额头，轻吻了她的额头，眼中流露出慈爱。\n布拉姆（心疼）：我可怜的女儿……（My poor daughter...）\n▲娜塔莉亚盯着戴安娜。\n【闪回28-3】\n夜 内  走廊\n人物  娜塔莉亚  戴安娜\n▲塞莱特斯的房间里面传来塞莱特斯惊恐的声音。\n塞莱特斯vo：不，别杀她！我说！我什么都告诉你！（No, don't kill her! I'll talk! I'll tell you everything!）\n▲娜塔莉亚着急地走向了门口，突然，戴安娜尖叫了一声。\n戴安娜（尖叫）：啊——啊！我要妈妈——（Ah—ah! I want Mommy—）\n▲娜塔莉亚回头，戴安娜突然失控，用力打碎了花瓶。\n【闪回结束】\n▲娜塔莉亚低声安抚布拉姆。\n娜塔莉亚：教父，别担心。上帝会保佑小姐的。（Godfather, don't worry. God will protect her.）\n▲布拉姆看向娜塔莉亚。\n布拉姆（严肃）：想不想知道戴安娜是什么时候开始生病的？（站了起来）跟我来，我现在告诉你。（Want to know when Diana first got sick? Come with me. I'll tell you now.）\n▲娜塔莉亚惊讶，娜塔莉亚站了起来，跟着布拉姆走出房间。\n28-4 \n夜  内  地下室门口\n人物  布拉姆  娜塔莉亚\n▲布拉姆和娜塔莉亚站在了地下室门口，地下室上绑满了铁链。\n布拉姆：真相就在这里，你不是早已拿到了钥匙，打开吧。（The truth is right here. You already got the key, didn't you? Open it.）\n▲娜塔莉亚看到地下室的门，眼神惊愕，心跳加速。\n\n三卡\n\n\n第二十九集\n29-1\n夜  内   收藏室\n人物    娜塔莉亚  布拉姆\n▲娜塔莉亚盯着地下室的门，里面安安静静。\n娜塔莉亚（担心）OS：怎么没声了？难道姐姐已经遇害了？（Why is it quiet? Is my sister already dead?）\n▲布拉姆搂着娜塔莉娅的腰，从裙子腰封里摸出钥匙，打开了地下室旁边的一道门。\n布拉姆（看娜塔莉亚）：进来吧。（Come on in.）\n娜塔莉亚（惊讶）：这是……（This is...）\n▲布拉姆打开灯，娜塔莉亚被眼前的场景惊呆了，只见收藏室里面，全是玛莉的照片，婚纱照，合照，抱着孩子的照片，还有全家福。\n布拉姆（抚摸照片）：这是我的妻子玛莉，是戴安娜的母亲。（This is my wife, Mary. Diana's mother.）\n▲娜塔莉亚看着墙上的照片，有一张是玛莉抱着戴安娜的照片。(定格照片转场）\n【闪回】\n日  内  破旧房屋\n人物  小玛莉  小娜塔莉亚\n▲小玛莉抱着小娜塔莉亚。\n小娜塔莉亚（天真）：被姐姐抱在怀里，总是很安心！（Being in your arms always makes me feel safe!）\n小玛莉：那姐姐就一直抱着你。（Then I'll keep holding you.）\n【闪回结束】\n▲娜塔莉亚捏着裙摆，打量着照片，故意露出了惊讶的神色。\n娜塔莉亚（紧张）：这么多照片，天啊，教父，您一定很爱她吧。（So many photos. Godfather, you must have loved her so much.）\n布拉姆（表情眷恋）：是的，我很爱她，我们在一起十年，她跟我在一起的时候，我一无所有，是她鼓励我，我才有了今天。（Yeah, I loved her. We were together for ten years. I had nothing when we met, but she always believed in me. I wouldn't be where I am today without her.）\n▲娜塔莉亚看着照片，布拉姆观察着娜塔莉亚的表情，嘴角勾起了一个弧度，他深情地抚摸着全家福。\n布拉姆：在塞莱特斯没出现之前，我们曾是最幸福的一家人，可我的妻子太善良了，相信了贵族的谎言，最后被……（Before Celeste came, we were the happiest family. But my wife was too kind. She believed the nobles' lies, and in the end she was...）\n▲布拉姆哽咽了一下，娜塔莉亚回头看向了布拉姆。\n娜塔莉亚（惊讶）：您别这样，她看见您难过，也会难过的。（You don't have to do this. She wouldn't want to see you hurting like this.）\n布拉姆（落泪）：我们不过是权贵的玩物，只能向权贵低头。（抚摸着全家福）我娶塞莱特斯是怕他们继续出手伤害我的女儿。（We're just toys to the powerful. We have no choice but to do what they say. I married Celeste because I was afraid they'd hurt my daughter again.）\n▲这时，一张照片从全家福里面落了下来，照片上：塞莱特斯站在玛莉面前，玛莉红着眼睛望着塞莱特斯。娜塔莉亚惊愕地看着照片。\n娜塔莉亚OS：这是……塞莱特斯没跟我说过她见过姐姐，难道之前的话是在说谎？（This is... Celeste never told me she met my sister. Was she lying before?）\n▲布拉姆观察着娜塔莉亚的表情，捡起了照片。\n布拉姆（悲伤）：娜塔莉亚，我大概知道你是谁了，戴安娜已经失去了母亲了，不能再失去父亲了对吗？（Natalia, I think I know who you are. Diana already lost her mother. She can't lose her father too, right?）\n▲娜塔莉亚一步步后退。\n娜塔莉亚（惊愕）：什么？您知道我是谁？（What? You know who I am?）\n\n\n第三十集\n30-1\n夜  内  画室\n人物  娜塔莉亚  布拉姆\n▲布拉姆步步紧逼，娜塔莉亚步步后退。\n娜塔莉亚：我不太明白您在说什么，我只是……（I don't really know what you mean. I'm just...）\n布拉姆（打断）：嘘，你不想说，可以不说。（Shh. If you don't want to say it, you don't have to.）\n▲布拉姆将塞莱特斯和玛莉的合照放在了娜塔莉亚的手中。\n布拉姆（警告）：娜塔莉亚，权贵绝不会将我们当作人看待，即便我功成名就，伯爵仍然会把我当狗一样训斥，你野心勃勃，你觉得他们会怎么样对你。（People at the top don't see us as equals, Natalia. I built an empire, yet the Count still treats me like a dog on a leash. You're hungry for power, aren't you? What makes you think they won't crush you like a bug?）\n▲娜塔莉亚抵在了墙上，盯着布拉姆。\n娜塔莉亚（紧张）：教父，您会保护我的，对吗？（Godfather, you'll protect me, right?）\n▲布拉姆抚摸着娜塔莉亚的脸颊，一字一句地说。\n布拉姆（蛊惑）：你和我的妻子玛丽一样天真，即便是为了她，我也会保护你。你、我、戴安娜，我们才是一家人，对吗？（You're as naive as my wife Mary. Even for her sake, I'll protect you. You, me, Diana, we're the real family, right?）\n▲娜塔莉亚表情震惊。\n▲布拉姆却后退了一步。\n布拉姆（温和）：娜塔莉亚，找一找有没有治疗戴安娜的方法吧，我只想我的女儿快点好起来。（Natalia, look for a way to cure Diana. I just want my daughter to get better.）\n▲说完之后，布拉姆转身离开了，他站在门口时，又补了一句。\n布拉姆（警告）：对了，千万别靠近地下室。（扬了扬钥匙）这个，还是我来保管比较好。（By the way, stay away from the basement. As for this? It stays right where it belongs with me.)\n娜塔莉亚（点头）：是。（Yes.）\n▲布拉姆关上门出去了，娜塔莉亚盯着墙上的照片 ，轻轻抚摸了玛莉的脸颊。\n娜塔莉亚（自言自语）：如果失去父亲，戴安娜会很痛苦吧，到底谁在说谎……（If she loses her father, Diana will be devastated. Who's really lying...）\n▲布拉姆站在门口，从门缝里面看着娜塔莉亚的表情，嘴角勾起了一道弧度。\n30-2\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆 女佣\n▲娜塔莉亚正在给戴安娜拿早餐，塞莱特斯走入餐厅，眼神冰冷地盯着娜塔莉亚，她狠狠撞了一下娜塔莉亚，冷声呵斥。\n塞莱特斯：怎么？你真想将我取而代之。（What? You really want to take my place?）\n娜塔莉亚（恨）：夫人拿我做棋子玩得开心吗？（Did you enjoy using me as your pawn, ma'am?）\n▲塞莱特斯一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯：贱人！果然是你想害我！（You bitch! I knew you wanted to hurt me!）\n▲娜塔莉亚举起杯子将牛奶全部泼到了塞莱特斯的脸上。\n娜塔莉亚（愤怒）：夫人，我是戴安娜的心理医生，不是任你打骂的奴仆！（Ma'am, I'm Diana's therapist, not some punching bag for you to abuse!）\n▲众人震惊！\n▲镜头特写：布拉姆站在楼梯间静观其变。\n\n\n第三十一集\n31-1\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆\n▲布拉姆站在楼梯间，并没有阻止二人，眼神复杂地看着她们。\n▲塞莱特斯被泼了一脸。\n塞莱特斯（尖叫）：你敢泼我！你疯了吗？（You dare throw that at me? Are you insane?）\n娜塔莉亚（冷眼）：夫人，这只是给你一个教训，狂妄自大的人，将为自己的行为付出代价。（Ma'am, that's a lesson. Arrogant people pay for their behavior.）\n塞莱特斯：不过是个卑贱的下等人，敢教训我，你找死——（You low-class nobody. You dare lecture me? You're dead—）\n▲塞莱特斯擦了一把脸上的牛奶，伸手掐住了娜塔莉亚的脖子。\n塞莱特斯：贱人！我跟你拼了！（You bitch! I'll tear you apart!）\n▲娜塔莉亚也不甘示弱，抓起牛奶杯砸在了塞莱特斯的后背上。\n娜塔莉亚：放开我——（Let me go—）\n▲这时，布拉姆匆匆忙忙地走了下来。\n布拉姆（呵斥）：住手！（Stop!）\n▲布拉姆立刻将塞莱特斯的手掰开，将娜塔莉亚拉到自己的身后，冷眼盯着塞莱特斯。\n布拉姆：够了！一个心理医生，一个贵族夫人，竟然在餐厅打了起来，你们不觉得丢人吗？（Enough! A therapist and a noble lady fighting in the dining room. Aren't you ashamed?）\n塞莱特斯（疯）：丢人？（指着娜塔莉亚）这个贱人勾引你，想把我赶出这个家门，我还有什么脸面？（Ashamed? This bitch seduces you and wants to throw me out. What dignity do I even have left?）\n▲布拉姆一把抓住了塞莱特斯，不让她打娜塔莉亚。\n布拉姆（看娜塔莉亚）：你，回去照顾戴安娜。（You. Go take care of Diana.）\n▲娜塔莉亚红着眼睛瞪了塞莱特斯一眼，转身离开了。\n塞莱特斯：贱人！你别走！你给我站住！（Bitch! Don't walk away! You get back here!）\n▲布拉姆死死抓住了塞莱特斯的手臂，眼神兴奋了起来。\n布拉姆OS：互相撕咬吧，愚蠢的猎物们，真是越来越有趣了！（Tear each other apart, you stupid prey. This is getting more and more fun!）\n▲娜塔莉亚站在楼梯口，和塞莱特斯对视了一眼。\n31-2\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲夜里，塞莱特斯睁开眼睛，突然发现自己被绑在了椅子上，她挣扎了一下，布拉姆站在阴影中看着她。\n布拉姆（阴冷）：你醒了。（You're awake.）\n\n\n第三十二集\n32-1\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯惊恐地盯着布拉姆，布拉姆把玩着一柄教父权杖，低头看着塞莱特斯。\n塞莱特斯（挣扎）：布拉姆……你想干什么？（Bram... what do you want?）\n▲布拉姆一步一步走向了塞莱特斯。\n布拉姆（嗤笑）：你知道我等这一天等了多久吗？（抚摸塞莱特斯的脸颊）原来俯视贵族是这种感觉。（Do you know how long I've waited for this day? So this is what it feels like to look down on a noble.）\n塞莱特斯（惊愕）：布拉姆！我们是夫妻！你为什么想杀了我？（Bram! We're married! Why do you want to kill me?）\n布拉姆（捏着塞莱特斯的下巴）：夫妻？你从来就没有把我当作你的丈夫！（呵斥）被自己看不起的下等人掌控在手心的滋味如何？（Married? You never treated me as your husband! How does it feel to be in the hands of someone you looked down on?）\n塞莱特斯（惊讶）：我什么时候看不起你了？（When did I ever look down on you?）\n▲布拉姆掐住塞莱特斯的脖子。\n布拉姆（愤怒呵斥）：还敢说没有！你喝咖啡时优雅的德行，简直令我作呕！用餐时那套该死的礼仪，连擦嘴都要扭捏作态！你替我整理领带，就像在纠正一个不懂规矩的蠢货！你的每一个动作都在讽刺我，让我感觉自己像个不被驯养的野狗！（Still denying it! The way you drink coffee makes me sick! Those damn table manners—even wiping your mouth is a performance! When you fix my tie, it's like you're correcting a stupid fool who doesn't know the rules! Every move you make mocks me and makes me feel like an untamed dog!）\n▲塞莱特斯惊呆了，她有些窒息。\n塞莱特斯（挣扎）：你误会了！这些想法令我震惊！（You misunderstood! I'm shocked you'd think that!）\n▲布拉姆用力掐着塞莱特斯的脖子。\n布拉姆（愤怒）：什么误会？你那副天生高贵的嘴脸，早就把答案写在了脸上！（Misunderstood? That born-noble look on your face already gave the answer!）\n▲他突然松开塞莱特斯，蹲在了塞莱特斯的面前，头靠在了塞莱特斯的腿上。\n布拉姆（温和）：塞莱特斯，其实你也很崇拜我对不对？我现在已经是个合格的贵族了对吗？（Celeste, you admire me too, don't you? I'm a proper noble now, right?）\n▲塞莱特斯惊恐地看着趴在自己腿上的布拉姆，浑身发抖。\n塞莱特斯（惊恐）：求求你，放过我吧——（Please, let me go—）\n▲布拉姆突然站起来抓住塞莱特斯的头发，用枪抵着她的额头。\n布拉姆（愤怒）：说啊！说你也很崇拜啊！说你仰慕我！说啊——（Say it! Say you admire me! Say you worship me! Say it—）\n▲塞莱特斯吓得尖叫，布拉姆猛地松开了她。\n布拉姆（笑容诡异）：你们不是都好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're all curious what's in the basement, aren't you? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n\n\n第三十三集\n33-1\n夜   内   塞莱特斯的房间\n人物 娜塔莉亚 布拉姆  塞莱特斯\n▲布拉姆转身离开了，塞莱特斯吓得瘫软到了椅子上。\n塞莱特斯（咆哮）：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n▲布拉姆冷笑了一声，拿出厚厚的一叠文件递给了塞莱特斯。\n布拉姆（笑）：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲塞莱特斯盯着那些文件，脸色惨白。\n塞莱特斯（惊愕）：你，你什么时候做的这些？我怎么不知道？（When... when did you do all this? How did I not know?）\n布拉姆（得意）：就在你和娜塔莉亚斗的你死我活的时候。（高高在上）哦，对了，娜塔莉亚是我故意用来分散你的注意力的！（While you and Natalia were tearing each other apart. Oh, and Natalia? I used her to distract you on purpose!）\n33-2\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲字幕：第二天。\n字幕：第二天。（The next day.）\n▲别墅里面突然响起了女佣的尖叫声。\n女佣（尖叫）：啊！夫人，夫人她死了——（Ah! Mrs. Blackwood is dead!—）\n▲娜塔莉亚和布拉姆同时从两道不同的门里面出来，二人冲到了塞莱特斯的房间门口，只见塞莱特斯浑身是血躺在了地上。\n▲娜塔莉亚惊愕地盯着眼前的场景。\n娜塔莉亚（捂着嘴巴）OS：噢，我的老天！（Oh my God!）\n▲布拉姆冷着脸站在门口。\n布拉姆（咬牙切齿）OS：该死！她怎么就死了，还被人看见了，简直打乱了我所有的计划！（Damn it! Why did she die, and someone saw her? It ruins all my plans!）\n▲布拉姆要上前检查。\n布拉姆（看女佣）：报警吧！（Call the police!）\n布拉姆（冷静）OS：塞莱特斯死了也是一件好事情！我既保住了和伯爵的合作，又摆脱了她！（Honestly, Celeste dying might be a blessing in disguise. It keeps my alliance with the Count intact—and cuts loose my biggest dead weight）\n▲娜塔莉亚一把抓住了布拉姆的手臂，阻挡他前去检查。\n娜塔莉亚：教父，塞莱特斯不明不白死在了庄园，您是最后一个见她的人，如果您现在报警，会被怀疑的！（Godfather, Celeste died mysteriously in the estate. You were the last to see her. If you call the police now, you'll be suspected!）\n▲布拉姆抬了下手臂，示意佣人停止报警，佣人恭敬站定，布拉姆回头看向了娜塔莉亚。\n布拉姆（冷冽）：你的意思是？（What do you mean?）\n娜塔莉亚（担忧）：无论如何，您不能进入现场，一定要确保您没有丝毫的嫌疑！（Either way, you can't enter the scene. Make sure you're not a suspect!）\n▲布拉姆盯着娜塔莉亚，眼神危险。\n布拉姆OS：有意思，小兔子，我会将你彻底拉上我的船！（Interesting, little rabbit. I'll make sure you're in too deep to walk away.）\n▲布拉姆轻轻捏了一下娜塔莉亚的脸颊，似笑非笑地问道。\n布拉姆（微笑）：娜塔莉亚，你觉得怎么做更好？（Natalia, what do you think we should do?）\n▲娜塔莉亚看了一眼地上的尸体。\n娜塔莉亚（鼓起勇气）：不如将她埋了，就算她是装的，埋在地里之后，她也彻底死透了。（Why not bury her? Even if she's faking, once she's in the ground, she's dead for real.）\n▲布拉姆惊讶地看着娜塔莉亚。\n\n\n第三十四集\n34-1\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲布拉姆看了一眼塞莱特斯的尸体又看向了娜塔莉亚。\n布拉姆（蛊惑）：很好！（抚摸娜塔莉亚的脸颊）娜塔莉亚，你不是想要将塞莱特斯取而代之吗？给你一个机会。（Good. Natalia, didn't you want to replace Celeste? I'll give you a chance.）\n娜塔莉亚（惊愕）：什么？（What?）\n布拉姆（整理她的头发）：去把塞莱特斯的尸体装起来，抛入海中——我就娶你。（Bag up Celeste's body and throw it into the sea—and I'll marry you.）\n▲娜塔莉亚惊愕地看着布拉姆。\n娜塔莉亚（惊讶）：抛入海中？不是活埋吗？（Throw it into the sea? Not bury her?）\n▲布拉姆拿出手枪，在手中把玩。\n布拉姆（嗤笑）：埋在土中会留下痕迹，毁尸灭迹不是更安全？（Burying leaves traces. Destroying the body is safer, isn't it?）\n娜塔莉亚（后退）：不，我不敢——（No, I can't—）\n▲布拉姆枪口抵在了娜塔莉亚的额头上，娜塔莉亚紧张地举起双手，一步一步走了进去。\n布拉姆（看女佣）：你看见了什么？（What did you see?）\n▲女佣颤抖地站在旁边。\n女佣（恭敬）：我什么都没有看到，夫人是在晚上失踪了的。（I didn't see anything. Mrs. Blackwood disappeared last night.)\n▲布拉姆看向了屋内，娜塔莉亚正在检查塞莱特斯的尸体。\n布拉姆：死了吗？（Is she dead?）\n▲娜塔莉亚摸着她的脉搏点了点头。\n布拉姆（吩咐）：那真是很可惜（冷冽）将血迹清理干净，把尸体装起来。（What a shame. Clean up the blood and bag the body.）\n▲布拉姆站在门口点了根雪茄，烟雾缭绕中看着娜塔莉亚擦拭血迹。\n▲娜塔莉亚跪在地上擦拭着，在擦到塞莱特斯身后的时候，借着塞莱特斯的掩盖悄无声息将一直录音笔藏在了自己的口袋里。\n34-2\n夜   外   海边\n人物 布拉姆  娜塔莉亚 塞莱特斯  神秘人\n▲娜塔莉亚满头大汗，费劲地将一个巨大的袋子推入了海中，布拉姆拿着相机拍下了娜塔莉亚抛尸的画面。\n布拉姆（嗤笑）OS：就算塞莱特斯是假死，现在也死透了！（Even if Celeste was faking, she's dead for real now!）\n▲娜塔莉亚走了回去，举起手。\n娜塔莉亚：教父，都按照您的吩咐做好了。（Godfather, it's done just as you ordered.）\n▲布拉姆伸手搂着娜塔莉亚的肩膀。\n布拉姆（笑）：做得好，娜塔莉亚，现在我们是一条绳子上的蚂蚱了！（伸手牵着娜塔莉亚）走吧，我未来的妻子。（Good job, Natalia. Now we're in this together. Come on, my future wife.）\n▲娜塔莉亚回头看了一眼海面，跟着布拉姆上车了。\n▲布拉姆的车刚刚离开，一个神秘人穿着潜水服，一个猛子潜入水底。\n\n\n第三十五集\n35-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆和娜塔莉亚刚刚走入客厅，便看见莱恩和伊丽莎白还有持枪安保站在屋内。\n布拉姆（惊讶）：爸妈，你们怎么来了？（看向安保）这是什么意思？（Mom, Dad, what are you doing here? What's the meaning of this?）\n▲莱恩冷着脸站了起来。\n莱恩：我们接到消息，说塞莱特斯不见了。（We got word that Celeste is missing.）\n▲娜塔莉亚惊愕地抬头，看向了莱恩和伊丽莎白，下意识地躲在了布拉姆的身后。\n布拉姆（故作惊讶）：这怎么可能……（How is that possible...）\n莱恩（呵斥）：布拉姆！就算你现在权势滔天，如果你真的伤害了我的女儿，我也会拼尽全力，咬下你一块肉来！（Bram! Even if you're powerful now, if you hurt my daughter, I'll fight with everything I have and take a piece of you with me!）\n▲伊丽莎白猛地站了起来，情绪激动。\n伊丽莎白（哽咽）：塞莱特斯在哪儿！把她还给我！（试探）你是不是把她关在了地下室？（Where's Celeste? Give her back to me! Did you lock her in the basement?）\n▲面对伊丽莎白的指责，布拉姆眼神冷了下去，看向了娜塔莉亚。\n布拉姆OS：娜塔莉亚，我本来想让你多活几天，看来你的死期到了！（Natalia, I wanted to let you live a few more days. Looks like your time is up.）\n▲布拉姆无声看向了角落的女佣，佣跑了出来，她抬手指着娜塔莉亚。\n女佣（情绪激动）：伯爵，夫人！是娜塔莉亚杀了夫人！并将夫人的尸体抛入了海中！（Count, Countess! Natalia killed your daughter! She threw the body into the sea!）\n▲所有人的目光瞬间聚集在了娜塔莉亚的身上，娜塔莉亚下意识后退。\n娜塔莉亚（惊慌）：不，不是我——（No, it wasn't me—）\n▲女佣举起了几张照片，照片1：娜塔莉亚蹲在屋内收拾塞莱特斯的尸体。照片2：娜塔莉亚将尸体挪出别墅，还有几张资料。\n女佣（大声）：娜塔莉亚是玛莉夫人的妹妹，她怀疑是夫人杀了玛莉夫人，所以杀了夫人！（Natalia is Mary's sister. She thought Celeste killed Mary, so Natalia killed Mrs. Blackwood!）\n▲众人看到这些照片惊呆了。\n娜塔莉亚（惊恐）：不，我没有，我没有杀夫人！（No, I didn't! I didn't kill her!）\n▲女佣突然指着娜塔莉亚的裤腿。\n女佣（大喊）：看啊，娜塔莉亚的裤子上还有血迹！（Look! There's blood on Natalia's pants!）\n▲娜塔莉亚低头看着自己裤腿上的血，又迅速看向了布拉姆。\n娜塔莉亚（不敢相信）：你骗我？你想让我帮你顶罪！（You lied to me? You want me to take the fall!）\n▲布拉姆一脸痛心，把枪指着娜塔莉亚的脑袋。\n布拉姆（愤怒）：你怎么能杀了我的妻子！我现在就杀了你——（How could you kill my wife? I'll kill you right now—）\n▲布拉姆盯着娜塔莉亚，故作悲痛。\n布拉姆（得意）OS：猎物，只配被我玩弄于股掌中！（Prey only deserves to be played in my hands!）\n塞莱特斯（呵斥）vo：住手！（Stop!）\n▲众人迅速转头看向了门口，只见塞莱特斯和焦恩带着持枪的警察闯了进来。\n伊丽莎白（惊愕）：上帝啊，我的宝贝，你还活着！（My God, my baby, you're alive!）\n▲众人震惊！\n\n\n第三十六集\n36-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲伊丽莎白冲了过去，一把抱住了塞莱特斯。\n伊丽莎白（心疼）：塞莱特斯——你还好吗？他们说你死了？（Celeste—are you okay? They said you were dead?）\n塞莱特斯（看向布拉姆）：爸爸妈妈，布拉姆想杀了我，是娜塔莉亚和她的养父救了我！（Mom, Dad, Bram tried to kill me. Natalia and her adoptive father saved me!）\n▲众人震惊，布拉姆不敢相信地看着眼前的场景。\n布拉姆：养父？（Adoptive father?）\n▲他的目光落在了焦恩的身上。\n布拉姆：是你？（It's you?）\n【闪回19-1】\n男客人（歉意）：教父，不好意思，我差点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n【闪回结束】\n▲布拉姆浑身发抖。\n布拉姆OS：糟了，他们联手耍我，我中了他们的圈套！（Damn. They played me together. I fell into their trap!）\n▲塞莱特斯盯着布拉姆，大声对他们说。\n塞莱特斯（愤恨）：布拉姆囚禁我，威胁我，还想杀了我！（指着他）他还杀了他的前妻玛莉！（Bram imprisoned me, threatened me, and tried to kill me! He also killed his ex-wife Mary!）\n▲娜塔莉亚看向了塞莱特斯，有些惊愕。\n娜塔莉亚OS：姐姐死了？（My sister is dead?）\n▲众人震惊。\n莱恩（呵斥）：布拉姆——给我一个合理的解释！（Bram—give me a good explanation!）\n▲布拉姆慌了神，连忙指着焦恩和娜塔莉亚。\n布拉姆：不，不是我，塞莱特斯受到了刺激，她有被迫害妄想症！（No, it wasn't me. Celeste is traumatized. She has paranoia!）\n塞莱特斯（愤恨）：我没有病！（I'm not sick!）\n▲娜塔莉亚拦住了塞莱特斯的争辩。\n娜塔莉亚（冷笑）：布拉姆，难道连受害者的话，都是谎话吗？（Bram, are you saying even the victim's words are lies?）\n布拉姆（冷笑）：你们说凶手是我，证据呢？尸体呢？证人呢？是你们诬告我！（You say I'm the killer—where's the evidence? Where's the body? Where's the witness? You're framing me!）\n▲莱恩和伊丽莎白对视了一眼，伊丽莎白看向了塞莱特斯。\n伊丽莎白：塞莱特斯，你有证据吗？（Celeste, do you have evidence?）\n▲塞莱特斯和娜塔莉亚对视了一眼，娜塔莉亚拿出了一支录音笔。\n娜塔莉亚：我们当然有！（Of course we do!）\n▲众人震惊。\n▲娜塔莉亚打开录音笔，录音笔中，传出了尖锐的争吵声。\n【音频33-1】\n布拉姆vo：你不是好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're curious what's in the basement? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n▲众人听着音频，十分惊讶。\n\n\n第三十七集\n37-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） \n▲布拉姆表情惊愕，音频还在继续播放着。\n塞莱特斯vo：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n布拉姆vo：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲众人看向了布拉姆，莱恩冷冽发问。\n莱恩（呵斥）：布拉姆！你怎么解释！（Bram! How do you explain this?）\n布拉姆（后退半步）：这是伪造的！（看向莱恩）爸爸，请您相信我。（指着娜塔莉亚和焦恩）他们一定是为了诬陷我，用药物控制了塞莱特斯，我要求对塞莱特斯进行药检！（It's forged! Dad, please believe me. They must have drugged Celeste to frame me. I demand a drug test on Celeste!）\n▲这时，戴安娜突然抱着小熊，在楼梯间大哭了起来。\n戴安娜（惊呼）：地下室有怪物要吃掉我——我好害怕！（There's a monster in the basement that wants to eat me—I'm scared!）\n▲众人惊讶，布拉姆情绪激动。\n布拉姆（呵斥）：戴安娜！闭嘴！别瞎说！（Diana! Shut up! Don't talk nonsense!）\n▲娜塔莉亚盯着戴安娜。\n娜塔莉亚（看向了警察）：地下室，我姐姐被囚禁在了地下室！（The basement, my sister is locked in the basement!）\n37-2\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） 玛莉\n▲地下室被暴力打开，众人站在地下室门口，被眼前的景象吓到了，里面挂满了玛莉受伤害的照片，刑具，还有三副冰棺，墙上有块黑板，黑板上挂着玛莉、塞莱特斯、娜塔莉亚的照片。\n▲玛莉的编号是一，塞莱特斯编号二，娜塔莉亚编号三。\n伊丽莎白（捂着嘴惊呼）：老天，这简直是个地狱！（My God, this is a hellhole!）\n▲角落里面，有个女人，双脚被铁链锁着，浑身是伤，瘦骨嶙峋。\n娜塔莉亚（惊愕）：姐姐——（Mary—）\n\n\n第三十八集\n38-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲娜塔莉亚冲了过去，颤抖着手拨开了玛莉的头发，娜塔莉亚落泪。\n娜塔莉亚：姐姐，我是娜塔莉亚，你还认得我吗？（Mary, it's me, Natalia. Do you recognize me?）\n▲玛莉艰难地抬头，奄奄一息说不出话。\n娜塔莉亚：医生！快叫医生——（Doctor! Call a doctor—）\n▲焦恩连忙上去，给玛莉做检查。\n焦恩：我现在就带她去医院，别担心，她会脱离危险的。（I'll take her to the hospital now. Don't worry. She'll be okay.）\n▲焦恩将玛莉抱了起来，准备离开，布拉姆被警察控制着对着焦恩呵斥。\n布拉姆（愤怒）：放开她！别将她从我身边带走！把她还给我！（Let her go! Don't take her from me! Give her back to me!）\n▲娜塔莉亚转头看向了被两个警察控制住的布拉姆，抬起手一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：我姐姐陪你吃了十年的苦！还跟你有了孩子，你为什么要囚禁她？！（My sister suffered with you for ten years! She had your child! Why did you imprison her?!）\n▲事情败露，布拉姆也不装了。\n布拉姆（冷笑）：谁让她不答应给我做情妇？（Well... that's what happens when she refuses to be my mistress.）\n▲众人震惊。\n布拉姆：我要成为贵族，我需要塞莱特斯的帮助！玛莉却非要离开我！（I wanted to become a noble. I needed Celeste's help! But Mary insisted on leaving me!）\n▲布拉姆看着焦恩的背影。\n布拉姆（疯狂）：可我爱她，我不能让她离开我，不能让别的男人染指他！我要她永远留在我身边！（But I love her. I can't let her leave me. I can't let another man touch her! I want her by my side forever!）\n▲娜塔莉亚又一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：你简直就是个恶魔！（You're a monster!）\n布拉姆（不甘心）：恶魔？对，我就是恶魔！（看塞莱特斯）塞莱特斯，我也爱你啊，我也想把你永远留在我身边！（Monster? Yes, I'm a monster! Celeste, I love you too. I wanted to keep you by my side forever!）\n▲伊丽莎白连忙挡在塞莱特斯的面前，看向了娜塔莉亚。\n伊丽莎白（感激）：娜塔莉亚，幸亏你聪明，不然我女儿就要惨遭毒手了！（Natalia, thank God you're smart. Otherwise my daughter would've been killed!）\n布拉姆（疯狂）：什么聪明？不过是运气好罢了，两个蠢货被我挑拨得大打出手！（看向了焦恩）要不是这个老东西插手，他们都要死！（Smart? Just luck. Two fools I played against each other! If this old bastard hadn't interfered, they'd all be dead!）\n娜塔莉亚（冷笑）：是吗？到现在，你还认为你才是猎人吗？（Really? Even now, you still think you're the hunter?）\n布拉姆（惊愕）：你什么意思？（What do you mean?）\n娜塔莉亚：从宴会开始，一切就都在我们的计划之中了！（Everything has been our plan since the banquet started!）\n【闪回20-1】\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的男性客人（焦恩），路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n镜头特写：在焦恩撞过来的时候，娜塔莉亚将纸条塞入了焦恩的手中。\n纸条内容（娜塔莉娅vo）：爸爸，救我们出去。（Dad, get us out.）\n【闪回结束】\n布拉姆（不敢相信）：你说什么？（What did you say?）\n▲娜塔莉亚盯着布拉姆。\n娜塔莉亚：我很清楚，你从一开始就知道我是玛莉的妹妹，是你引我入局的。（I know perfectly well you knew I was Mary's sister from the start. You lured me into this.）\n▲布拉姆震惊。\n\n\n第三十九集\n39-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆惊愕地看着娜塔莉亚，娜塔莉亚一步一步走向了布拉姆。\n娜塔莉亚（冷笑）：姐姐的照片和书信，是你寄到我曾经的家里的，戴安娜床底下的日记本也是你放的，对不对。（You mailed my sister's photos and letters to my old home. You also put the diary under Diana's bed, didn't you?）\n▲布拉姆惊呆了。\n布拉姆（不可思议）：你是怎么知道的？（How did you know?）\n娜塔莉亚（冷笑）：因为庄园守卫森严，如果不是你默许的，姐姐的遗书和照片，不可能邮寄到我手中。（Because this estate is heavily guarded. Unless you allowed it, my sister's letter and those photos could never reach me.）\n布拉姆（惊讶）：什么遗书？我做得天衣无缝，你怎么可能发现？（What letter? I was flawless. How could you find out?）\n娜塔莉亚（嗤笑）：你有一句话说得很好，“真正的猎人，往往会以猎物的方式出现”。（You said one thing right: \"The real hunter often appears as the prey.\"）\n布拉姆（不可置信）：你听到了？（You heard that?）\n▲娜塔莉亚挑眉。\n【闪回衔接5-1】\n▲娜塔莉亚牵着戴安娜往房间走，突然，塞莱特斯的房间里面传来了用力的砸门声，娜塔莉亚上前摁住了把手。\n娜塔莉亚（惊愕）OS：塞莱特斯在里面？（回头看书房）她不是在书房和布拉姆吵架吗？（Celeste is in there? Wasn't she arguing with Bram in the study?）\n【闪回结束】\n▲娜塔莉亚看向了布拉姆。\n娜塔莉亚：捕猎游戏中，算错了一步，都会万劫不复——（In a hunting game, one wrong step and you're finished—）\n布拉姆（不敢相信）：不不不，你们不都怀疑对方吗？好几次你们都出卖了对方，还大打出手了！（No, no, no. Weren't you suspicious of each other? You sold each other out several times and even fought!）\n娜塔莉亚：如果我们不假装自相残杀，你怎么对我们放松警惕，怎么会一步一步暴露你的真面目？（If we hadn't pretended to tear each other apart, how would you have let your guard down? How would you have revealed your true face step by step?）\n塞莱特斯：其实宴会上，我爸爸妈妈也早就看出了端倪，只是时机还不到。（Actually, my parents saw something at the banquet too. The time just wasn't right.）\n▲布拉姆惊愕地看着塞莱特斯和莱恩，不敢置信地开口。\n布拉姆：什么意思？（What do you mean?）\n▲莱恩冷眼盯着布拉姆。\n莱恩（冷笑）：因为真正的贵族不会在公共场合大吵大叫，即便我的女儿精神失常了，骨子里的涵养也不会丢失！只有你这种人，才不懂这种规矩！（Because real nobles don't scream in public. Even if my daughter lost her mind, her breeding wouldn't disappear! Only someone like you doesn't understand that rule!）\n▲娜塔莉亚笑着看着布拉姆。\n娜塔莉亚：我提议将塞莱特斯的尸体埋在地下时，你也担心我要算计你，所以故意说抛入海中？可恰巧，我猜到了你不会按照我说的做！（When I suggested burying Celeste's body, you were afraid I was setting you up, so you said throw it into the sea. But I guessed you wouldn't do what I said!）\n▲布拉姆彻底崩溃了。\n布拉姆（惊愕）：你们耍我？你们联手耍我！（You played me? You played me together!）\n莱恩（呵斥）：把他带走！我要他为他的算计付出代价！（Take him away! I want him to pay for his schemes!）\n▲布拉姆被带走，和娜塔莉亚擦肩而过的时候，他突然笑了，他盯着娜塔莉亚。\n布拉姆（低声）：娜塔莉亚，你收到的遗书不是我写的，你再好好想想，谁才是真正的猎人。（嘲笑）你眼中的小可怜，身上流的可是恶魔的血！（Natalia, I didn't write the note you received. Think again—who's the real hunter? The poor little thing you pity has the blood of a monster!）\n▲娜塔莉亚惊愕地回头看向了布拉姆，布拉姆对着娜塔莉亚诡异一笑，跟着警察离开了。\n塞莱特斯（安抚）：娜塔莉亚，布拉姆最擅长玩弄人心，你别被他的话蛊惑了——（Natalia, Bram is a master at playing with people's minds. Don't let him mess with your head—）\n▲娜塔莉亚盯着布拉姆的背影久久回不过来神。\n\n\n第四十集\n40-1\n日  内  戴安娜的房间\n人物 娜塔莉亚  戴安娜  玛莉\n▲娜塔莉亚在帮戴安娜整理书籍和绘本。\n娜塔莉亚vo：布拉姆在伯爵的介入下，被判处了死刑，戴安娜和姐姐继承了他所有的家产，我终于和姐姐终于重逢了。（With the Count's involvement, Bram was sentenced to death. Diana and my sister inherited everything he owned. I was finally reunited with my sister.）\n▲娜塔莉亚整理书柜，突然一个盒子掉了下来，里面的东西撒了出来，里面是一张娜塔莉亚的照片。\n娜塔莉亚（惊讶）：这里怎么会有我的照片。（How did my photo get here?）\n▲娜塔莉亚捡起照片，突然发现照片下面有一行小字，镜头特写：找到你了。（儿童字体：found you)\n镜头特写：找到你了。\n戴安娜vo：找到你了。(found you)\n▲娜塔莉亚握紧照片，看着字迹。\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——(儿童字体：Help me )\n镜头特写：救我——(儿童字体：Help me )\n【闪回结束】\n▲娜塔莉亚死死盯着这行字。\n娜塔莉亚（惊愕）OS：这字迹，和我收到姐姐的遗书上的字迹一模一样！（This handwriting is exactly the same as the note I got from my sister!）\n▲戴安娜的声音突然响起。\n戴安娜：小姨，你在看什么？（Auntie, what are you looking at?）\n▲娜塔莉亚回头，只见戴安娜站在门口抱着兔子看着娜塔莉亚，表情冷漠，娜塔莉亚连忙将照片藏起来，笑着摸了摸戴安娜的头发。\n娜塔莉亚：没什么。（Nothing.）\n▲这时，楼下响起了车子鸣笛声。\n娜塔莉亚（高兴）：听，是你妈妈出院回来了，我们快去迎接她吧！（Listen, your mom's back from the hospital. Let's go welcome her!）\n▲戴安娜瞬间恢复了孩童的笑容，牵着娜塔莉亚的手，乖巧地点了点头，她又回头看着那个盒子，勾唇一笑。\n40-2\n日  内  庄园客厅\n人物  塞莱特斯   娜塔莉亚   戴安娜   佛西   焦恩  玛莉\n▲娜塔莉亚牵着戴安娜的手路过壁炉时，偷偷将写着字的照片丢入了壁炉中烧掉了。\n▲这时，焦恩推着轮椅进来，玛莉坐在轮椅上，气色还不错。\n玛莉（虚弱）：戴安娜，娜塔莉亚。（Diana, Natalia.）\n▲戴安娜欢呼雀跃的跑过去，紧紧抱住了玛莉的手臂。\n戴安娜：妈妈！我好想你。（哽咽）我以为再也见不到您了。（Mommy! I missed you so much. I thought I'd never see you again.）\n▲玛莉轻轻抚摸着戴安娜的头发，又看向了娜塔莉亚。\n玛莉（招手）：来，让我看看。（Come here. Let me see you.）\n▲娜塔莉亚眼泪瞬间滚落，她一步一步走向了玛莉，半蹲在了玛莉的面前。\n娜塔莉亚（哽咽）：姐姐……（Mary...）\n▲玛莉伸手抚摸着她的头发。\n玛莉（温和）：傻瓜，为什么要冒险救我，如果你遇到了危险，我永远无法原谅自己。（Silly girl. Why risk your life to save me? If something happened to you, I'd never forgive myself.）\n▲娜塔莉亚趴在了玛莉的腿上，一下子哭了起来。\n娜塔莉亚：我好想你，我什么都不在乎，我只想找到你，你答应过等我的。（I missed you so much. I didn't care about anything else. I just wanted to find you. You promised you'd wait for me.）\n▲玛莉温和地抚摸着娜塔莉亚的头发。\n玛莉（安抚）：还是和小时候一样爱哭鼻子。（Still such a crybaby, just like when you were little.）\n▲焦恩拍了怕娜塔莉亚的肩膀。\n焦恩：别哭了，你妈妈一会儿就到，看见你哭鼻子又要心疼了。（Stop crying. Your mom will be here soon. She'll be heartbroken to see you crying.）\n戴安娜（乖巧）：对啊，小姨，我们一家团聚了，应该庆祝——（Right, Auntie. We're all together now. We should celebrate—）\n▲这时，塞莱特斯捧着鲜花了，带着一个男人【塞莱特斯的男友 佛西】进来。\n塞莱特斯（开朗）：嗨~娜塔莉亚，听说玛莉姐姐出院了，我们来看看她，给你们介绍一下，这是我的新男友，佛西。（Hi, Natalia. I heard Mary's out of the hospital, so we came to see her. Everyone, this is my new boyfriend, Fossey.）\n▲娜塔莉亚擦了眼泪站起来，抬头看向佛西时，瞳孔微缩。\n娜塔莉亚（惊愕）OS：是他！（It's him!）\n▲佛西对着娜塔莉亚挥了挥手。\n佛西（笑容诡异）：好久不见，娜塔莉亚。（Long time no see, Natalia.）\n"
}
```

---
## 第 23 轮（耗时：7250 ms (7.25 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (3)：`sys.selectContext, script.read, user.ask`

### [第 23 轮] 模型原始输出
```text
状态检查：
- 当前正在执行计划第7步：读取1-5布莱克伍德庄园正文并补写 provenance，修复 description 覆盖问题。
- 本轮 script.read 返回段落数 0、场次数 0，未读取到任何正文内容，无法据此核准段落号，该步骤尚未完成。
- 关键事实：本轮读取为空（无正文、无段落、无出处依据），可能场次标识需调整（如用 scene 编号或起始行读取）。
- 计划状态不变：第7步仍未完成；第8步（全局核验结案）待推进。
- 下一步：改用起始行/偏移方式重读该场次正文，获取真实段落后再补写。

思考：
本轮按场次名读取返回空，说明场次名匹配未命中。笔记中已知1-5共42段（娜塔莉亚家10段 + 布莱克伍德庄园32段），布莱克伍德庄园应为1-5后半部分。可先用 script.read 读取1-5整体（如 episode 第一集 + scene "1-5"）确认段落总数，再定位32段区间；或直接用 startLine/offset 读取。先读整场确认结构，避免再次空读。

工具调用：
{{调用 script.read, {"episode": "第一集", "scene": "1-5", "offset": 1, "limit": 60}}}

用户沟通：
{
- 对用户说的话（完整版）：“我尝试按场次名读取布莱克伍德庄园时返回了空内容，估计场次标识匹配不上。我改成直接读1-5整场来定位这32段正文，核准娜塔莉亚本人的段落号后，会把她的完整设定和前几场出处一起补写进去，确保不覆盖已有信息。”
- 对用户说的话（简版）：“布莱克伍德庄园那场按名字没读到内容，我换成读1-5整场来定位段落，稍等~”
}
```

### [第 23 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`script.read` (succeeded)
**工具输入 (Input)**：
```json
{
  "episode": "第一集",
  "scene": "1-5",
  "offset": 1,
  "limit": 60
}
```
**工具输出 (Output)**：
```json
{
  "projectId": "proj_1793879628309",
  "source": "project",
  "total": 1653,
  "offset": 1,
  "nextOffset": null,
  "episodeCount": 1,
  "sceneCount": 2,
  "paragraphCount": 42,
  "hasVolumeWarning": true,
  "notice": "我发现当前条件 \"1-5\" 共匹配到 2 个场次（\"1-5 日 内 娜塔莉亚家\" 10段、\"1-5 日 外 布莱克伍德庄园\" 32段，共 42 个段落），内容较多。本次已将全部原文返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "warning": "我发现当前条件 \"1-5\" 共匹配到 2 个场次（\"1-5 日 内 娜塔莉亚家\" 10段、\"1-5 日 外 布莱克伍德庄园\" 32段，共 42 个段落），内容较多。本次已将全部原文返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。",
  "scenesSummary": [
    {
      "sceneNumber": "1-5",
      "title": "1-5 日 内 娜塔莉亚家",
      "paragraphCount": 10
    },
    {
      "sceneNumber": "1-5",
      "title": "1-5 日 外 布莱克伍德庄园",
      "paragraphCount": 32
    }
  ],
  "episodes": [
    {
      "index": 1,
      "id": "episode-1",
      "number": "一",
      "title": "第一集",
      "sceneCount": 2,
      "paragraphCount": 42,
      "scenes": [
        {
          "index": 1,
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
          "paragraphs": [
            {
              "index": 1,
              "text": "▲娜塔莉娅在收拾皮包，将衣物放进去。"
            },
            {
              "index": 2,
              "text": "焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]"
            },
            {
              "index": 3,
              "text": "▲娜塔莉亚握住了焦恩的手，坚定开口。"
            },
            {
              "index": 4,
              "text": "娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)"
            },
            {
              "index": 5,
              "text": "▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。"
            },
            {
              "index": 6,
              "text": "焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)"
            },
            {
              "index": 7,
              "text": "▲娜塔莉亚拿着文件准备起身。"
            },
            {
              "index": 8,
              "text": "▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。"
            },
            {
              "index": 9,
              "text": "娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)"
            },
            {
              "index": 10,
              "text": "▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）"
            }
          ]
        },
        {
          "index": 2,
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
          "paragraphs": [
            {
              "index": 1,
              "text": "▲切镜。"
            },
            {
              "index": 2,
              "text": "▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]"
            },
            {
              "index": 3,
              "text": "娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")"
            },
            {
              "index": 4,
              "text": "▲布拉姆的目光扫过众人。"
            },
            {
              "index": 5,
              "text": "娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)"
            },
            {
              "index": 6,
              "text": "▲管家大声喝斥。"
            },
            {
              "index": 7,
              "text": "管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)"
            },
            {
              "index": 8,
              "text": "▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。"
            },
            {
              "index": 9,
              "text": "管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)"
            },
            {
              "index": 10,
              "text": "▲众人唏嘘。"
            },
            {
              "index": 11,
              "text": "管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)"
            },
            {
              "index": 12,
              "text": "▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。"
            },
            {
              "index": 13,
              "text": "管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)"
            },
            {
              "index": 14,
              "text": "▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。"
            },
            {
              "index": 15,
              "text": "管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)"
            },
            {
              "index": 16,
              "text": "应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)"
            },
            {
              "index": 17,
              "text": "应聘者2：我也放弃 (Me too, I'm out.)"
            },
            {
              "index": 18,
              "text": "▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。"
            },
            {
              "index": 19,
              "text": "娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）"
            },
            {
              "index": 20,
              "text": "▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。"
            },
            {
              "index": 21,
              "text": "布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）"
            },
            {
              "index": 22,
              "text": "娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）"
            },
            {
              "index": 23,
              "text": "▲布拉姆打量着娜塔莉亚。"
            },
            {
              "index": 24,
              "text": "布拉姆：抬起你的头来。（Lift your chin.）"
            },
            {
              "index": 25,
              "text": "▲娜塔莉亚缓缓抬头。"
            },
            {
              "index": 26,
              "text": "布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）"
            },
            {
              "index": 27,
              "text": "▲娜塔莉亚紧张地握紧了简历。"
            },
            {
              "index": 28,
              "text": "娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）"
            },
            {
              "index": 29,
              "text": "布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）"
            },
            {
              "index": 30,
              "text": "娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）"
            },
            {
              "index": 31,
              "text": "▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】"
            },
            {
              "index": 32,
              "text": "塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）"
            }
          ]
        }
      ]
    }
  ],
  "content": "第一集\n1-1\n夜  内   地下室\n人物  玛莉\n▲空荡的地下室里，玛莉双手被铁链绑着，跪在地上，她头发散乱瘦骨嶙峋，脸上带着血迹，一只手从黑暗中伸出来，捏住了玛莉的下巴，逼迫她抬头，玛莉恐惧地看向了镜头。\n玛莉（哀求）：救救我…… （Please... somebody help me...）\n\n1-2\n日  内   医院办公室\n人物  娜塔莉亚 \n（to制作：照片定格转场） \n▲镜头特写：桌上摆满了照片，照片内容全是一个伤痕累累的女人。娜塔莉亚【字幕：心理医生娜塔莉亚  22岁 】坐在椅子上，捏着一张照片，旁白展开了一封血书。 [Subtitle: Natalia, Therapist, 22]\n玛莉vo：娜塔莉亚，当你读到这段话的时候，或许我已经死于布莱克伍德家了，我有个女儿，请你带她离开这个牢笼！（Natalia... by the time you're reading this, I might already be dead. If I don't survive the Blackwoods... please, find a way to get my daughter out of this hellhole!）\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）：我等待了多年的姐妹重逢，等来的竟然是姐姐的遗照。（All these years... I thought I'd see my sister again. Instead, all I have are these photos.）\n【闪回】\n1-3 贫民窟门口   日   外 \n人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母\n▲养父养母站在破旧的街道上，低头看着穿着破烂的小娜塔莉亚和小玛莉。\n养父（为难）：抱歉，玛莉，我们家只能收养一个孩子……（I'm sorry, Mary. We can only afford to take in one child...）\n▲小玛莉一把将小娜塔莉亚推向了养父。\n小玛莉（鞠躬）：我可以养活自己，请收养我妹妹吧！求你，务必把她好好养大！（I can survive on my own! Just please... take my little sister. I’m begging you, just give her a good home!）\n▲切镜。\n▲小娜塔莉亚趴在了养父的肩膀上，小玛莉站在破旧的屋子前，笑着对娜塔莉亚挥手，小娜塔莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n1-4\n日  内   医院办公室\n人物  娜塔莉亚  \n▲娜塔莉亚的眼泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——（Help me)\n玛莉（旁白）：救我——（Help me)\n▲娜塔莉亚死死盯着那段小字。\n娜塔莉亚：这是姐姐的求救？姐姐一定还没死！（捏着照片，os）我会潜入布莱克伍德家族，找出姐姐！（与1-1合并为一条素材）【1】  (Is this a cry for help? I knew she wasn’t dead! I’m going to infiltrate the Blackwood Estate and bring my sister home, no matter what it takes!)\n\n1-5\n日  内  娜塔莉亚家\n人物 娜塔莉亚  焦恩\n▲娜塔莉娅在收拾皮包，将衣物放进去。\n焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 纳塔莉亚养父】(Natalia, listen to me. Bram is a ruthless mafia boss, and the Blackwood estate is a fortress. You're just a rookie therapist. You don't stand a chance against him!) [Subtitle: John, Natalia's Foster Father]\n▲娜塔莉亚握住了焦恩的手，坚定开口。\n娜塔莉亚（握拳）：爸爸，（看向镜子里面自己的脸）有时候，柔弱，也能成为致命的武器！(Dad. Sometimes... being underestimated is the most dangerous weapon you can have.)\n▲焦恩摇了摇头，将文件袋放到了娜塔莉亚的面前。\n焦恩：去布莱克伍德庄园的应聘文件，有危险一定要想办法通知我。(Here's your application to the Blackwood estate. If anything goes wrong, find a way to contact me immediately.)\n▲娜塔莉亚拿着文件准备起身。\n▲娜塔莉亚转头低头拿出抽屉里面那张绑着铁链的门的照片。\n娜塔莉亚（坚定）：无论如何，我一定要救出姐姐！(No matter what it takes... I'm getting her out.)\n▲镜头特写：照片上的门放大切镜到庄园的铁门被推开。（此段作为，1-4和1-5的转场）\n1-5\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯\n▲切镜。\n▲庄园的门被打开，庄园富丽堂皇，别墅如同城堡一般屹立，庄园两边种满鲜花，石雕喷泉立在花圃中间，最正中间的广场上，站满了穿着职业装的人，娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。两边围满了持枪的安保。[Bram, the head of the Blackwood family]\n娜塔莉亚OS：他就是姐姐的丈夫布拉姆，根据资料记录，他短短几年，就从平民变成了权势滔天的贵族，他们都称他为教父。(Bram... my sister's husband. According to records, he went from a nobody to one of the most powerful men around in just a few years. They call him \"The Godfather.\")\n▲布拉姆的目光扫过众人。\n娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女，凭借塞莱特斯的人脉，扩展生意版图。（偷偷打量）难道，是他为了攀附贵族，把姐姐藏起来了？(Shortly after my sister vanished, he married Celeste, an elite aristocrat, using her family connections to expand his empire. Did he lock my sister away just to climb higher?)\n▲管家大声喝斥。\n管家（训话）：教父的女儿患有严重的心理障碍，我们要招募一名顶尖的心理医生为她诊治。The Godfather's daughter is suffering from a severe psychological disorder. We are looking for the absolute best therapist in the country to treat her.)\n▲管家拍手，佣人打开旁边的一排排箱子，里面全是钱。\n管家（严肃）：如果能治好小姐，这些诊金全部归你们！(If you can cure Miss Diana, every single cent of this is yours.)\n▲众人唏嘘。\n管家（威胁）：如果医治无效，或是心怀鬼胎……(And if you fail... or if you're hiding any ulterior motives...)\n▲管家抬手指不远处，远处摆着个巨大的笼子，一个打手掀开了帘子，下面是一个铁笼子，笼子里面关着一头狼，狼凶残地吼了一声，众人尖叫后退。\n管家：教父有一万种方式毁了你们——(The Godfather has a thousand ways to tear you apart.)\n▲投喂者瞬间丢了一块肉进入笼子，野狼跳起来一口吞下，其他应聘者吓得够呛，现场一片唏嘘声。\n管家（呵斥）：一旦进入庄园，必须治好小姐，不得中途退出或离开。(Once you step foot inside this estate, you finish the job. No quitting, no backing out.)\n应聘者1（鞠躬）：教父，我的能力不足以治疗小姐的病，我选择退出。(Godfather, I don't have what it takes. I'm stepping down.)\n应聘者2：我也放弃 (Me too, I'm out.)\n▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。\n娜塔莉亚：教父，我愿意一试！（Godfather, I'll take the case.）\n▲众人惊讶，目光看向娜塔莉亚，布拉姆收起枪打量娜塔莉亚。\n布拉姆：哦？你就不怕沦为野兽的口粮吗？【2】（Oh? Aren't you afraid of becoming wolf chow?）\n娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。（My expertise is more than enough to help your daughter. Please, give me the chance.）\n▲布拉姆打量着娜塔莉亚。\n布拉姆：抬起你的头来。（Lift your chin.）\n▲娜塔莉亚缓缓抬头。\n布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。【3】（You know... your face. It reminds me of someone I used to know.）\n▲娜塔莉亚紧张地握紧了简历。\n娜塔莉亚OS：他难道知道我的身份？（Does he know who I am?）\n布拉姆：既然你愿意留下，那就试一试。（Since you're so eager to stay... let's see what you've got.）\n娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……（As long as I'm inside... I'll find out the truth.）\n▲这时候，屋内走出来一个女人【布拉姆现任妻子  贵族之女 塞莱特斯】，塞莱特斯穿着华丽的裙子，被几个女佣簇拥着走了出来。【CELESTE，Bram's current wife, aristocrat】\n塞莱特斯（冷冽）：我反对，我的女儿不需要心理医生！（Absolutely not. My daughter doesn't need a therapist!）\n\n第二集\n2-1日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲娜塔莉亚打量着塞莱特斯。\n娜塔莉亚OS：她就是布拉姆的现任妻子塞莱特斯，王室的后裔，母亲是财阀之女，传闻是一位骄矜傲慢的贵族千金。（So this is Bram’s current wife, Celeste. Royal bloodline, heiress to a mega-corporation... as spoiled and arrogant as the rumors say.）\n▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。\n布拉姆：够了，塞莱特斯，别无理取闹了！（Enough, Celeste! Stop making a scene!）\n塞莱特斯（冷冽）：布拉姆，你许诺过只爱我一个人，（指着娜塔莉亚）为什么要让这个女人踏入家门？（Bram, you promised I'd be the only woman in your life! So why are you bringing her into our home?!）\n布拉姆（无奈）：她只是女儿的心理医生，难道，连给孩子看病的人，你都无法容忍吗？（She’s just our daughter’s therapist! Can’t you even allow someone to help our sick child?）\n▲塞莱特斯鄙夷地瞥了一眼娜塔莉亚。\n塞莱特斯（冷冽）：我绝不允许她踏进这个家！（I will NEVER let her step foot in this house!）\n▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。\n布拉姆：当初你明知道我有妻子，依旧主动靠近我，如今却要剥夺我女儿治病的权利，你未免太冷酷了！（When we met, you knew I was already married, yet you still threw yourself at me. And now you're keeping my daughter from getting the help she needs? Don't you think you're being a little too heartless?!）\n▲塞莱特斯愣住了，娜塔莉亚抬头打量着二人。\n娜塔莉亚OS：是塞莱特斯主动向布拉姆示好？（打量塞莱特斯）莫非是她？(Celeste was the one who went after Bram? Was it her?)\n▲娜塔莉亚握紧了拳头。\n娜塔莉亚（恨）OS：如果她是真凶，我会亲手撕碎她的一切，逼迫她说出姐姐的下落！(If she's the monster behind this... I will tear her life to pieces and force her to tell me where my sister is!)\n▲娜塔莉亚上前一步，递出自己的简历。\n娜塔莉亚（恭敬）：夫人，我是持证的儿童心理医生，这是我的简历，请您予以信任……(Ma'am, I am a certified pediatric therapist. Here is my resume. Please, allow me to prove my worth...)\n▲娜塔莉亚的话还没说完，塞莱特斯一把将简历摔在了娜塔莉亚脸上，纸张漫天飞舞。\n塞莱特斯（命令）：别以为我看不出来你的心思！立刻给我滚出去！【4】(I know exactly what you're up to. Now get out!)\n▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。\n布拉姆：塞莱特斯！克制你的行为！（看娜塔莉亚）你离开吧，我会支付一笔钱作为补偿。(Celeste, that's enough! You can go. I'll pay you for your trouble.)\n▲娜塔莉亚惊愕地抬头，塞莱特斯。\n娜塔莉亚OS：不，我绝不能就这样离开！(No... I can't walk away now!)\n▲就在这时，一个孩子光脚跑了出来，她拿着一个花瓶砸坏了门口的装饰，踩坏了花圃。\n女佣（追逐）：小姐！快回来，该吃药了！(Miss Diana! Please stop, it's time for your medicine!)\n▲娜塔莉亚看向了孩子。\n娜塔莉亚（惊愕）OS：那就是姐姐的女儿？(Is that... Mary's daughter?)\n▲戴安娜突然飞快跑向了关着饿狼的笼子。【5】\n布拉姆（呵斥）：戴安娜！停下！(Diana! Stop right there!)\n▲娜塔莉亚飞快冲了过去，一把抱住了戴安娜。\n娜塔莉亚：别靠近！那里很危险！(Get back! It's dangerous!)\n戴安娜（挣扎）：放开我！ (Let go of me! Get off!)\n▲戴安娜发病举起花瓶砸向了娜塔莉亚的脑袋。【6】\n女佣（惊呼）：小心！(Watch out!)\n▲娜塔莉亚一把握住了戴安娜的手，另一只手轻轻拍她的背安抚。\n娜塔莉娅：放下吧。（let it go,一语双关，辛苦本土化老师确认是否可以这样翻译 (可以的，这样说挺地道的）（见黛安娜放下花瓶，松了口气）你做的很好。(Just let it go... You did so good.)\n娜塔莉娅：（看着管家，低声说）快把帘子盖上。（Cover the cage. Now.）\n▲管家立刻盖上帘子遮住野狼。\n娜塔莉娅：都退开些，别刺激她！（Everyone step back. Don't crowd her!）\n▲布拉姆一抬手，众人立刻退开。\n▲娜塔莉亚解开脖子上的丝巾铺在地上，让黛安娜的双脚踩上去。\n娜塔莉娅：你这样太过危险，要不要玩一些更有意思的游戏？比如，吹蜡烛，像我这样……（Walking bare-foot is way too dangerous, sweetie. How about we play a fun game instead? Like... blowing out birthday candles. Look at me...）\n▲娜塔莉娅举起黛安娜的一根手指当作蜡烛，深呼吸然后吐气，黛安娜学着娜塔莉娅的样子也深呼吸起来，情绪得到了稳定。\n▲戴安娜的情绪像是得到了安抚，对着娜塔莉亚笑了起来。\n女佣（捂嘴）：哦，上帝啊，我从未见过小姐这么快平复情绪！（Oh my god... I've never seen  Miss Diana calm down so fast!）\n娜塔莉娅：小姐，别怕，你安全了。（It's ok. You're safe now.）\n黛安娜（凑到娜塔莉娅耳边）：你也安全了。（So are you.）\n▲娜塔莉娅一惊。\n\n\n第三集\n3-1\n日 外 布莱克伍德庄园\n人物 娜塔莉亚  布拉姆 女佣若干  管家  塞莱特斯  戴安娜   女佣\n▲戴安娜拽住了娜塔莉亚的衣摆，看向了布拉姆。\n戴安娜：爸爸，我要她陪我玩儿！(Daddy, I want her to play with me!)\n▲布拉姆摸了摸戴安娜的头。\n布拉姆：如你所愿。（看娜塔莉亚）既然孩子接纳你，你可以留下。（威胁）但是……(Whatever you want. If Diana wants you here, you can stay. But...)\n▲布拉姆的目光看向了狼笼的方向，娜塔莉亚也跟着他的目光看了过去。\n娜塔莉亚（鞠躬）：我明白您的意思，我会照顾好小姐的，请您放心。(I understand, sir. I'll take good care of Miss Diana. You have my word.)\n布拉姆（满意）：带小姐去休息吧。(Take her to her room to rest.)\n▲娜塔莉亚将光脚的戴安娜抱了起来。\n娜塔莉亚：是。(Yes, sir)\n▲娜塔莉亚心中疑惑。\n娜塔莉亚（疑惑）OS：教父看起来非常疼爱戴安娜，为什么姐姐会称这里是牢笼？(The Godfather dotes on Diana so much... So why did my sister call this place a hellhole?)\n▲塞莱特斯死死握着拳头，在和娜塔莉亚擦肩而过时，压低声音警告。\n塞莱特斯（小声）：你会为你今天的决定付出代价的！(You're gonna regret this!)\n娜塔莉亚（温和）：夫人，我只是一个心理医生，听不懂你在说什么。(I'm just a therapist, ma'am. I'm afraid I don't know what you mean.)\n▲娜塔莉亚收回目光，抱着戴安娜一步一步走向了大门，大门打开，屋内富丽堂皇的装饰映入眼帘。\n娜塔莉亚OS：我的姐姐就这里，我不但要找到她的下落！还要保护戴安娜，还要让姐姐和戴安娜合法继承所有财产！【7】(My sister is here. I'll find out what happened to her, protect Diana, and make sure they both get their rightful share of the inheritance!)\n▲布拉姆轻轻抚摸了一下塞莱特斯的头发。\n布拉姆：不过是一个心理医生而已，没必要将她放在心上。(She’s just a shrink, babe. No need to waste your energy on her.)\n▲塞莱特斯下意识后退了一步，看向了娜塔莉亚的背影。\n塞莱特斯：是吗？(Is that so?)\n布拉姆（安抚）：好了，塞莱特斯，你的身体欠佳，回去休养吧。(Come on, Celeste. You're not feeling well. Go get some rest.)\n▲布拉姆也随着她的目光看向了娜塔莉亚的背影。\n布拉姆OS：又一个有趣的猎物，送上门来了！(Well, well...Another little mouse walked right into my trap.)\n▲布拉姆看了一眼管家。\n布拉姆：加强庄园守卫，没有我的命令，任何人都不许出去！【8】(Double the security. No one leaves this estate without my permission!)\n\n3-2\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  \n▲公主房内，戴安娜躺在华丽的公主床上，闭上眼睛，娜塔莉亚给她读故事。\n娜塔莉亚（温柔）：最后，公主和王子拥有了属于他们的幸福生活……(And in the end, the prince and princess lived happily ever after...)\n▲这时，花园传来微弱的呼救。\n（画外音，女声惨叫）vo：啊——救命——(Aah! Somebody help me!)\n▲娜塔莉亚惊愕看向了外面。\n娜塔莉亚OS：呼救？是姐姐吗？(A scream for help? Was that... my sister?!)\n▲娜塔莉亚连忙起身出门。\n\n3-3\n日  外  花园\n人物  娜塔莉亚  管家\n▲娜塔莉亚悄悄在花园里面走，花园里面装饰与建筑物遮挡视线，墙角站着持枪的安保，娜塔莉亚微微弯腰，躲避安保的视线。\n娜塔莉亚（自言自语）：奇怪，呼救声明明是从这里传出来的！(That’s weird. I swear that scream came from right around here!)\n▲突然一只手拍了一下娜塔莉亚的后背，娜塔莉亚惊恐回头，只见管家冷着脸站在她身后。\n管家（冷漠）：你在干什么？(What do you think you’re doing?)\n娜塔莉亚：我，我随便走走……(I—I was just taking a walk, getting some fresh air...)\n▲管家冷脸将文件夹递给娜塔莉亚。\n管家：这是庄园的规矩和教父的禁忌。(These are the house rules. Mr. Blackwood doesn't tolerate anyone breaking them.)\n▲娜塔莉亚翻看着文件。\n管家（严肃警告）：不要碰庄园里的任何东西，不要擅自离开庄园，不要在庄园游荡，不要妄想勾引教父！(Don't touch anything in the estate. Don't leave without permission. Don't wander around. And don't even think about trying to seduce the Godfather!)\n▲娜塔莉亚握着文件点了点头，管家一步步靠近她，再次警告。\n管家（警告）：最重要的一条，不要靠近地下室。(And the most important rule: stay away from the basement.)\n娜塔莉亚（惊讶）：地下室？【9】(The basement?)\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链。\n【闪回结束】\n▲娜塔莉亚看着管家离开的背影，心中疑惑。\n娜塔莉亚OS：姐姐给的照片中点出的地点会不会是地下室？(Could the basement be where my sister was pointing to in those photos?)\n▲管家的视线随意扫过了不远处的安保。\n管家（冷漠）：随意走动，会被当做入侵者被射杀。(Anyone caught wandering where they shouldn't will be treated as an intruder and shot on sight.)\n▲安保立刻举起枪，子弹上膛，娜塔莉亚浑身僵直。\n管家（命令）：现在立刻回到小姐的房间去。(Get back to Miss Diana's room. Now.)\n\n3-4\n日 内  戴安娜房间\n人物  戴安娜   娜塔莉亚  布拉姆\n▲娜塔莉亚转身进入房间，放下了文件，在华丽的公主房屋内巡视。\n娜塔莉亚（打量）OS：戴安娜的房间里，会不会有姐姐留下的遗物？（翻找柜子）如果有线索就好了！(Is there anything my sister left behind in here? Come on, just one clue... anything!)\n▲戴安娜悄无声息地睁开了一只眼睛盯着娜塔莉亚翻找东西的背影，她偷偷地将枕边的小熊推到了地上。\n▲娜塔莉亚听到声音，吓了一跳，立刻回头。\n娜塔莉亚OS：谁？(Who's there?!)\n▲戴安娜连忙闭上眼睛，娜塔莉亚瞧见玩偶掉地上了，弯腰去捡玩偶。\n娜塔莉亚OS：我必须万分谨慎，不能被布拉姆和塞莱特斯察觉！(I’ve got to be extra careful. I can't let Bram or Celeste catch on to what I’m doing.)\n▲娜塔莉亚捡玩偶时，突然看见床底下有个盒子。\n娜塔莉亚（惊讶）OS：那是什么？(What's that?)\n▲娜塔莉亚趴在地上，伸手去将盒子给拿出来，盒子上刻着名字：玛莉。(MARY)\n娜塔莉亚（惊讶）OS：这是姐姐的遗物吗？【10】(Is this... my sister's? )\n▲娜塔莉亚背对着门，蹲在地上打开盒子想查看里面的东西，盒子里面有个日记本。\n娜塔莉亚（惊讶）：这是，姐姐的日记？(No way... Is this my sister's diary?)\n▲门突然推开了，布拉姆握住一把枪，一步一步靠近娜塔莉亚，最后停在了娜塔莉亚背后。\n布拉姆（冷漠）：你在做什么？(What are you up to?)\n▲娜塔莉亚吓了一跳，猛地回头，目光正对布拉姆手中的枪口！【11】\n\n第四集   \n4-1\n日 内 戴安娜的房间\n人物  戴安娜 娜塔莉亚  布拉姆\n▲布拉姆上前一步，枪口对准了娜塔莉亚的额头，娜塔莉亚放下盒子，举起手，镜头特写：床上的戴安娜睫毛颤了一下。\n▲娜塔莉亚盯着眼前黑漆漆的枪口，她故作柔弱的姿态，眼神惶恐地看向了布拉姆。\n娜塔莉亚（低声）：教父……我发誓，我绝对没有半点越界。(Godfather...Please... I swear I didn't do anything I wasn't supposed to.)\n▲娜塔莉亚抬起下巴，一双眼睛颤抖地盯着布拉姆，布拉姆居高临下看着她，嗤笑了一声，枪口从娜塔莉亚的额头，挪到了她的下巴。\n布拉姆（狠辣）：把东西交出来，！笼子里的狼早已饥肠辘辘，别让我抓到你半点可疑的痕迹！(Hand it over. The wolves are starving out there, don't give me a single reason to doubt you.)\n▲娜塔莉亚被迫仰起头，脖子暴露在枪口下，她伸手轻轻握住枪口，用脸颊蹭了一下枪口，又妩媚地抬头看向了布拉姆。\n娜塔莉亚（低声）：别这样，您吓到我了。(Easy... you're scaring me.)\n▲布拉姆眼神震惊，喉结滚动了一下。【12】\n布拉姆（语气放松）：才刚刚进来，就敢勾引我。（上前一步，捏住娜塔莉亚的下巴）你的胆子很大。(Just walked through that door, and already trying to play me? You've got balls.)\n▲娜塔莉亚故作惶恐。\n娜塔莉亚（可怜）：绝无此事。(I would never dare.)\n▲布拉姆打量着娜塔莉亚，用力甩开她下巴，冷声开口。\n布拉姆（冷漠）：别以为这样我就会放过你！（脚尖踢盒子）把盒子打开。(Don't think that flattery gets you off the hook. Open the box.)\n▲娜塔莉亚颤抖着手拿起盒子，打开了盒子里面有一张玛莉遍体鳞伤的照片。\n布拉姆（惊讶）：这是……(What is this...?)\n▲娜塔莉亚观察着布拉姆的表情。\n【闪回衔接3-2】\n▲门突然推开了，布拉姆举着枪进来，娜塔莉亚背对着布拉姆跪在床边上，她从窗户的玻璃上看到了布拉姆的倒影，察觉了布拉姆靠近，她立马取出日记本，丢入床底下，随后将一张玛莉的照片放入盒子里面，合上了盒子。\n【闪回结束】\n▲娜塔莉亚缓缓抬头，布拉姆正在看照片，手指死死握住了照片边缘。\n娜塔莉亚OS：我就知道布拉姆会来，这张照片是我用来测试布拉姆的筹码，我只想知道，他知不知道姐姐遭受的一切？(I knew he'd show. This photo is my litmus test for Bram. I need to know: did he have any idea what my sister went through?)\n▲布拉姆看着照片，又看娜塔莉亚。\n布拉姆（冷漠）：谁允许你触碰屋内的东西的！(Who gave you the right to touch my things?)\n娜塔莉亚（跪在地上）：教父，我只想找出诱发小姐心理创伤的根源！（试探）她会不会是因为看到这些残酷的画面才……(Godfather, I was just trying to trace the root of Miss Diana’s trauma. Could seeing something this graphic...)\n▲布拉姆审视地盯着娜塔莉亚，伸手将照片拿了起来，紧紧捏着照片。\n布拉姆：闭嘴！(Shut up!)\n▲娜塔莉亚观察着布拉姆的表情和手指，试探开口。\n娜塔莉亚：她是谁？对小姐而言，是很重要的人吗？(Who is she? Is she someone important to Miss Diana?)\n▲布拉姆将照片收了起来。\n布拉姆（冷冽）：守好你的本分，不该问的，不要追问。【13】（转身）以后看到类似的物件，第一时间交给我！(Know your place. Curiosity killed the cat. Next time you stumble on crap like this, bring it straight to me.)\n▲布拉姆转身离开了，娜塔莉亚松了口气，坐在了地上。\n娜塔莉亚（看布拉姆的背影）OS：布拉姆的反应说明他对姐姐的遭遇一清二楚，难道是他和塞莱特斯一起害了姐姐？姐姐到底在哪里？(His reaction says it all, he knows damn well what happened to my sister. Did he and Celeste do this together? Where is my sister?)\n\n\n4-2\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚坐在床上，摊开了笔记本，镜头特写：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n玛莉vo：今天，塞莱特斯小姐登门告诉我，我配不上布拉姆，要我主动离开他，不然……(Today, Celeste dropped by to tell me I'm not in Bram's league. She demanded I walk away, or else...)\n娜塔莉亚（疑惑）OS：这些信息未免太直白了，像是刻意引导我发现线索，到底是谁布的局，又想引导我做什么？(Way too convenient. It's like someone's leaving these clues for me. Who's playing puppet master here, and what's their game?)\n【闪回照片】\n▲镜头特写：铁门被铁链包裹的照片。\n【闪回结束】\n娜塔莉亚：铁门是不是指向的地下室？会不会和姐姐有关！我一定要找到照片所在的位置？(Does that iron door lead to the basement? Is that where they kept my sister? I've got to find that exact spot.)\n▲这时，保姆间的门被推开了，娜塔莉亚吓了一跳，连忙将照片藏起来，猛地回头。\n\n\n第五集\n5-1\n夜  内  保姆间\n人物 娜塔莉亚  戴安娜\n▲娜塔莉亚连忙合上笔记本，疑惑地看着戴安娜。\n娜塔莉亚：怎么了？戴安娜小姐？(Everything okay, Miss Diana?)\n▲戴安娜提着小熊站在了门口，她眼神冷冷地看着娜塔莉亚。\n戴安娜（可怜）：我睡不着，你可以陪着我吗？(I can't sleep... Will you stay with me?)\n▲娜塔莉亚立刻起身，蹲在了戴安娜面前，抚摸了一下戴安娜的头发。\n娜塔莉亚（安抚）：别怕，我陪你回房间好吗？(Hey, don't be scared. Let's get you back to bed, okay?)\n▲戴安娜点了点，娜塔莉亚牵着她的手回房间。\n\n5-2\n夜  内  书房外\n人物  娜塔莉亚   戴安娜\n▲娜塔莉亚牵着戴安娜走在走廊上，突然听到书房传来争吵，娜塔莉亚和戴安娜停下步伐，站在了门口，书房里面传来激烈的争吵声。\n布拉姆（冷冽）VO：塞莱特斯，是你把玛莉的照片放在戴安娜的房间里的？(Celeste, was that you? Did you plant Mary's photo in Diana's room?)\n塞莱特斯（愤怒）VO：你凭什么断定是我所为？(And what makes you so damn sure I did it?)\n布拉姆（呵斥）VO：难道不是你想用那些照片恐吓孩子吗？毕竟你一向都不喜欢她！(Cut the crap. Weren't you trying to terrorize the kid? You've always hated her guts!)\n▲戴安娜想要推门，娜塔莉亚捂着她的嘴巴，抱着她往房间走。\n娜塔莉亚（惊愕）OS：难道布拉姆和塞莱特斯在联手掩盖姐姐死亡的真相？(Are they actually teaming up to sweep my sister's murder under the rug?)\n\n5-3\n夜  内   书房内  \n人物   布拉姆\n▲房间里面，只有布拉姆一个人，布拉姆听见外面的脚步声离开，他打开了留声机，留声机传出塞莱特斯的声音。\n塞莱特斯（留声机）：你凭什么断定是我所为？(What makes you so sure I did it?)\n▲布拉姆关上了留声机，给自己倒了一杯红酒。\n布拉姆（摇晃酒杯）：真正的猎人往往以猎物的方式出现，就让猎物彼此撕咬吧（品酒）毕竟真正贵族从不会沾染猎物的血。(The best hunters always disguise themselves as prey. Let them tear each other to pieces. After all... real aristocrats never get their hands dirty.)\n\n5-4\n夜  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚将戴安娜放在床上，戴安娜看着她。\n戴安娜：他们吵架是因为我对不对？(They were fighting over me, weren't they?)\n▲娜塔莉亚轻轻抚摸她的头发。\n娜塔莉亚（温和）：这是成年人的纠葛，与你无关。(That's just adult nonsense. It has nothing to do with you, sweetie.)\n戴安娜（平静）：塞莱特斯并不是我的母亲，对吗？(Celeste isn't my real mom, is she?)\n▲娜塔莉亚惊讶地看着戴安娜。\n娜塔莉亚（故作不知）：您为什么会这么想？(Why would you think that?)\n戴安娜（抱着小熊）：我的母亲很温柔，塞莱特斯来了之后，我就再也没见过她了，爸爸禁止我提起她，我很思念她，她什么时候回来？(My mom was so sweet... After Celeste showed up, she just vanished. Daddy won't even let me say her name. I miss her so much. Do you know when she's coming back?)\n▲娜塔莉亚看着戴安娜。\n娜塔莉亚（怜悯）：她一定会回来的，我向你保证！【14】(She'll be back. I promise.)\n▲戴安娜乖乖盖好被子，乖巧地开口，握紧了娜塔莉亚的手。\n戴安娜：你会一直留下来陪我吗？(Will you stay with me forever?)\n娜塔莉亚（安抚）：如果你爸爸同意的话，我当然会留下来陪你。(If your dad gives the green light, I'd love to.)\n戴安娜（疑惑）：你害怕我爸爸吗？(Are you scared of my daddy?)\n娜塔莉亚（微笑）：我想庄园里的人都对教父心存敬畏。(I think everyone in this house is a bit intimidated by the Godfather.)\n戴安娜（乖巧）：塞莱特斯就不会，还总是和爸爸吵架！(Celeste isn't. She's always fighting with Daddy!)\n▲娜塔莉亚摸了摸戴安娜的头发，温和开口。\n娜塔莉亚（安抚）：吵架？((Fighting?)\n▲戴安娜抬头乖巧地看着娜塔莉亚。\n戴安娜（不解）：对呀，爸爸很喜欢别人崇拜他，塞莱特斯却从不这样，这让他很懊恼。(Yeah. Daddy loves it when people worship him, but Celeste never does. It drives him crazy.)\n▲娜塔莉亚一愣，惊讶地低头看向了戴安娜，戴安娜闭上了眼睛睡觉。\n娜塔莉亚（惊讶）OS：我明白了。布拉姆出身卑微，极度渴望被认可，而出身贵族的塞莱特斯永远给不了他这份崇拜，看来他们也没有传闻那么相爱！(I get it. Bram came from the gutter, so he's desperate for validation. But Celeste is old money, she'll never stroke his ego. They're nowhere near as tight as everyone thinks.)\n\n5-5\n夜  内  楼梯口   \n人物  安保   娜塔莉亚  管家\n▲娜塔莉亚打开门，恰好看到两个安保抬着一具盖着白布的尸体从客厅路过，娜塔莉亚惊讶地捂着了嘴巴，管家不知道什么时候出现在了娜塔莉亚的身后。\n管家：看到了吗？那就是擅闯地下室的下场。(See that? That's what happens when you sneak into the basement.)\n▲娜塔莉亚猛地看向了管家，吓了一跳，管家已经转身离开了。\n娜塔莉亚（看向主卧方向）OS：得先让猎物撕咬起来，我才有机会探查姐姐的下落。(I need them to tear each other apart first. Only then will I have a chance to find out where my sister is.)\n\n\n第六集\n6-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲布拉姆坐在餐桌旁边，一边看报纸，一边喝咖啡，娜塔莉亚穿着一件性感的连衣裙走了过去。\n▲娜塔莉亚将对戴安娜的心理报告放在了布拉姆的面前。\n娜塔莉亚（恭敬）：教父，这是昨夜我针对小姐的行为进行的心理分析，请您过目。(Godfather, here is my psychological assessment of Miss Diana based on her behavior last night. Please take a look..)\n▲布拉姆收起了报纸，看向了娜塔莉亚给的文件，又看了一眼娜塔莉亚，眼神暂停，喉结滚动了一下。\n布拉姆：根据你的分析，我女儿怎么样了？(So, according to your report, how's my daughter doing?)\n▲娜塔莉亚俯身靠近布拉姆，手背蹭着布拉姆的手臂划过，指着文件。\n娜塔莉亚：您看，小姐不敢一个人睡，是因为……(As you can see, she's terrified of sleeping alone because...)\n▲布拉姆目光从文件上娜塔莉亚的手慢慢往娜塔莉亚的身上打量，他像是看货物一样看着娜塔莉亚，布拉姆往后仰，坐在椅子上，手臂搭在椅背上，手背刚刚好在娜塔莉亚的臀部位置，目光也落在了臀部。\n布拉姆（审视）OS：真想把这件碍事的衣服……(I'd love nothing more than to rip that dress right off her...)\n▲娜塔莉亚余光瞥见了布拉姆的目光。\n娜塔莉亚（冷笑）OS：禽兽，这么容易上钩！(Pig. That was almost too easy.)\n▲这时候，娜塔莉亚的余光瞥见塞莱特斯出现在了楼梯口。\n▲娜塔莉亚趁着布拉姆发呆，翻页时候，手臂碰到了牛奶杯，瞬间将牛奶洒到了布拉姆的裤子上。\n布拉姆（回神，惊讶）：你在干什么？(What the hell are you doing?)\n▲娜塔莉亚惊慌失措，蹲下用纸巾给布拉姆擦拭裤子，她的衣领开得很低，胸贴近布拉姆的大腿。\n娜塔莉亚：教父，请把裤子脱下来交给我，我替您清洗吧。(Godfather, please let me take your pants off. I'll get them cleaned right away.)\n▲布拉姆目光扫过了娜塔莉亚的脸和她的胸口，喉结滚动了一下。【15】\n布拉姆（嗤笑）：脱下来？（指尖划过娜塔莉亚的脸）你的野心倒是毫不掩饰。（松开娜塔莉亚）你这招，对别的男人或许很有效，可我不吃这一套！(Take them off? You're not even trying to hide your ambition, are you? That little show might work on other guys, but I don't buy it.)\n▲娜塔莉亚微微躲避，低下头去。\n娜塔莉亚（紧张）：先生，我并没有这个意思，我只是……我仰慕您很久了，您强大，睿智，是无数人仰望的对象，我由衷地敬佩您。(Sir, please, that's not what I meant. I just... I've looked up to you for so long. You're powerful, brilliant, a man everyone reveres. I genuinely admire you.)\n▲布拉姆愉悦地笑了，指腹擦过了娜塔莉亚的嘴角。\n布拉姆（笑）：嘴可真甜。(You've got quite a silver tongue, haven't you?)\n▲这时，塞莱特斯来到了餐厅，桌子挡住了视线，她看到布拉姆坐在椅子上，娜塔莉亚蹲在布拉姆的面前，举止不雅，顿时误会了。\n塞莱特斯（呵斥）：你们在干什么？【16】(What on earth is going on here?!)\n\n第七集\n7-1\n日 内  餐厅\n人物  娜塔莉亚  布拉姆  塞莱特斯\n▲娜塔莉亚听到声音，眼中划过了一丝兴奋。\n娜塔莉亚（高兴）OS：好戏开场了！(And... showtime!)\n▲娜塔莉亚故作慌乱起身，手中拿着纸，布拉姆的裤子上还有牛奶的痕迹。\n娜塔莉亚：夫人……事情并非您所想的那样……(Ma'am... please, it's not what it looks like!)\n▲塞莱特斯大步流星地走过来，一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯（呵斥）：不知廉耻，竟敢勾引我的丈夫，立刻滚庄园！(You shameless little whore! How dare you seduce my husband! Get the hell out of my house!)\n▲娜塔莉亚捂着脸，委屈地看着布拉姆。\n娜塔莉亚（可怜）：夫人，难道崇拜教父也是过错吗？（不屈）难道他不配得到别人的仰慕吗？(Ma'am, is it such a sin to admire the Godfather? Doesn't a man like him deserve to be revered?)\n▲布拉姆听到这句话，脸色阴沉。\n塞莱特斯（愤怒）：你——(You-)\n▲塞莱特斯举起手要打娜塔莉亚，被布拉姆拦住了。\n布拉姆：塞莱特斯！请你克制你的行为！(Celeste! That's enough!)\n塞莱特斯（呵斥娜塔莉亚）：滚出去！立刻滚——(Out! Get the hell out-)\n▲塞莱特斯还想对娜塔莉亚动手，但是被布拉姆拦住了。\n布拉姆（呵斥）：塞莱特斯！你简直越来越不可理喻了，看来你需要接受心理治疗了！(Celeste! You are losing your mind! Maybe it's time you saw a psychiatrist!)\n塞莱特斯（惊愕）：你认为我疯了？既然你现在这么厌恶我，为什么不跟我离婚？(You think I'm crazy? If I disgust you so much, why don't you just sign the divorce papers?!)\n▲ 众人震惊，娜塔莉亚不动声色看向了塞莱特斯。\n娜塔莉亚（惊讶）OS：离婚？塞莱特斯想离开布拉姆？(Divorce? Celeste actually wants out?)\n▲布拉姆一把抓住了塞莱特斯的手腕，压下了情绪。\n布拉姆（深呼吸）：抱歉，（握住梅菲斯特的手）塞莱特斯，你先上楼，（目光看娜塔莉亚）我会处理她。(I'm sorry. Celeste, head upstairs. I'll handle her.)\n▲塞莱特斯眼神愤怒，甩开布拉姆的手。\n塞莱斯特（呵斥）：离婚！(I want a divorce!)\n▲布拉姆神情冷漠了几分，看了一眼远处的女佣。\n布拉姆（深呼吸）：来人，夫人需要休息，送夫人回房间！(Guards! Madam needs some rest. Escort her back to her room!)\n▲两个女佣上前搀扶塞莱特斯，塞莱特斯甩开女佣。\n塞莱特斯（呵斥）：别碰我，我自己会走！(Get your hands off me! I can walk!)\n▲塞莱特斯和娜塔莉亚擦肩而过的时候，她看了一眼娜塔莉亚，低声开口。\n塞莱特斯（嘲笑）：你会后悔你所做的一切的——（放慢语速）娜塔莉亚！【17】(You are going to pay for every single thing you've done... Natalia.)\n▲娜塔莉亚擦了一下脸上的泪，无辜开口。\n娜塔莉亚：我不知道您在说什么。(I... I have no idea what you're talking about.)\n▲塞莱特斯冷哼了一声，走了，娜塔莉亚盯着塞莱特斯的背影。\n娜塔莉亚OS：塞莱特斯为什么会提出离婚？这太反常了，她是想离开布拉姆还是想威胁布拉姆将我赶走？(Why is Celeste bringing up divorce now? Something's off. Is she genuinely trying to leave him, or is this just a power play to get me kicked out?)\n▲布拉姆突然伸手扶着娜塔莉亚的腰，捏了一下她的腰，娜塔莉亚猛地回头看向了布拉姆，布拉姆靠近她。\n布拉姆（低声）：敢当着塞莱特斯的面儿勾引我？我很欣赏你的胆量。（故意提高声音警告）但，我不希望再有下次！(Seducing me right under Celeste's nose? You've got guts. I'll give you that. But don't let there be a next time.)\n▲说完之后，布拉姆的目光在娜塔莉亚捏着纸巾的手上掠过，随后转身离开了，娜塔莉亚瞧着布拉姆的背影，倒了一杯牛奶，慢慢品尝。\n娜塔莉亚OS：不希望有下次？还是希望下次快点到来？布拉姆先生！【18】 (Don't want a next time? Or can't wait for it... Mr. Bram?)\n\n\n第八集\n8-1\n日  内  戴安娜房间\n人物  戴安娜  娜塔莉亚\n▲娜塔莉亚在桌子上画画，画上面是一扇门，门上缠着铁链。\n娜塔莉亚（惊讶）OS：缠着铁链的门——(A door bound in heavy chains...)\n▲娜塔莉亚压下了心中的震惊。\n娜塔莉亚（故作好奇）：天啊，这张画画得真好，充满了神秘色彩。（摸戴安娜的头）您见过，还是直接想象出来的？(Sweetheart, what a beautiful drawing! It looks so mysterious. Did you actually see this somewhere, or did you just make it up?)\n戴安娜（乖巧）：这是我们家的地下室啦～(That's our basement!)\n娜塔莉亚（惊讶）：地下室——(The basement...?)\n▲戴安娜像是突然反应了过来一样，立刻将画藏了起来。\n戴安娜（竖起手指）：嘘，千万不要告诉爸爸哦～(Shh... Promise you won't tell Daddy!)\n▲娜塔莉亚弯着腰，故意捂着眼睛逗戴安娜。\n娜塔莉亚（温和）：好哦，那我就当作什么都没有看见。(Cross my heart. I didn't see a thing.)\n▲戴安娜一瞧，开心地笑了起来，她顺手将画压在了画纸下方，拿出了另外一张画给娜塔莉亚看。\n戴安娜：你看，这是我画的妈妈！(Look! I drew Mommy!)\n▲娜塔莉亚盯着画，上面是一幅简笔画，一个女人抱着一个孩子，手背上和手腕上都有一道伤痕。\n娜塔莉亚（惊讶）OS：上帝啊，那是什么？(My God... what are those scars?)\n▲戴安娜没发现娜塔莉亚的情绪，看着画，充满怀念地开口。\n戴安娜（叹气）：我真的很想念妈妈。(I miss Mommy so much...)\n▲娜塔莉亚愣了一下，轻轻将戴安娜护在怀中。\n娜塔莉亚：你的妈妈也同样牵挂着你，如果你过得痛苦，她会万分难过，我们先好好休息，好吗？(Your mommy misses you just as much. Seeing you hurting like this would break her heart. Let's get some sleep, okay?)\n戴安娜：你能给我唱睡眠曲吗？妈妈以前经常唱给我听。(Will you sing me a lullaby? Mommy used to sing to me all the time.)\n▲娜塔莉亚将戴安娜抱在怀中，轻轻拍着她的后背，唱起了睡眠曲。引用国外歌曲：《Baby's Bed A Silver Moon》\n娜塔莉亚：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n▲戴安娜闭着眼睛小声地说。\n戴安娜（低声）：你唱的歌和妈妈唱的一样。(You sound just like Mommy...)\n▲娜塔莉亚低头看着怀中的戴安娜笑，眼睛却红了。\n【闪回】\n8-2\n日 内  平民屋老房子\n人物 玛莉  娜塔莉亚\n▲小玛莉将小娜塔莉亚抱在怀中，娜塔莉亚抬头就能看到姐姐温柔的笑容，玛莉拍着她的后背，用稚嫩的声音唱安睡曲。\n小玛莉（拍背）：银色的月亮是婴儿的船，在夜空里四处飘荡……(Baby's boat's the silver moon, sailing in the sky...)\n\n【闪回结束】\n▲小玛莉稚嫩的歌声和娜塔莉亚的歌声重叠。\n娜塔莉亚（哽咽）：飘啦飘啊宝贝，跨过千山万水。(Sail away, my little one, over mountains and streams...)\n▲一滴泪顺着娜塔莉亚的脸颊滴在戴安娜的脸上，娜塔莉亚连忙擦泪，低头一看，戴安娜已经睡着了，娜塔莉亚低头轻吻她额头。\n娜塔莉亚（坚定）OS：睡吧宝贝，小姨一定会找到你的母亲！【19】(Rest easy, my sweet girl. Auntie will bring your mother home.)\n\n8-3\n夜  内   走廊/地下室\n人物 娜塔莉亚  塞莱特斯\n▲走廊上，配着枪的安保在巡逻。\n安保：教父有令，不许任何人夜里在庄园内随意走动。(By order of the Godfather, no one wanders the grounds after dark.)\n▲娜塔莉亚躲在拐角的阴影处，安保走远后，她才出来，迅速走向了地下室的入口。\n▲娜塔莉亚不敢开灯，摸索着往前走。\n娜塔莉亚OS：地下室到底锁着什么东西？这东西会和姐姐有关吗？戴安娜难道是看到了地下室的东西才病了的？(What is he hiding down there? Is Mary behind that door? Is that what traumatized Diana?)\n▲她摸索着到了地下室门口，月亮冰冷地落在了门上，门上缠着铁链子，挂着锁，突然地下室里面传来了微弱的响动。\n（女声，模糊，微弱）vo：救救我……（非常模糊，难以判断）(Help... me...)\n娜塔莉亚（惊讶，拍门）：你是谁？(Who's in there?!)\n（女声，微弱）：我是……(I’m...)\n▲娜塔莉亚上前查看，突然一只手拍了一下。\n娜塔莉亚（惊恐）OS：是谁！【20】(Who's there?!)\n▲娜塔莉亚僵硬地转身，塞莱特斯穿着睡裙，披头散发站在她身后。\n塞莱特斯（声音冰冷）：我知道你是谁，也知道你潜入布莱克伍德庄园的目的。(I know who you really are... and exactly why you infiltrated the Blackwood estate.)\n▲娜塔莉亚吓了一跳，后退了一步靠在门上，塞莱特斯步步逼近。\n塞莱特斯：我给过你逃离的机会，既然你执意入局，就别怪我心狠手辣——(I gave you a way out. But since you insist on playing with fire, don't blame me for burning you alive.)\n▲娜塔莉亚盯着塞莱斯特，突然笑了一声。\n娜塔莉亚：塞莱特斯，是你引我来地下室的，我们不是敌人，对吗？(Celeste, you left those breadcrumbs to lead me here. We're on the same side... aren't we?)\n▲塞莱特斯震惊！【21】\n一卡\n\n第九集\n9-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯\n▲娜塔莉亚靠在门上，塞莱特斯一步一步逼近，地下室楼梯口偶尔有人影闪过。\n娜塔莉亚（警惕地看楼梯间）：夫人是想有话直说，还是等布拉姆发现我们？（Cut to the chase, or are you waiting for Bram to catch us?）\n▲塞莱特斯突然一把抓住了娜塔莉亚的手。\n塞莱特斯（一字一句）：救救我，娜塔莉亚！布拉姆想要除掉我！（Help me, Natalia! Bram is going to kill me!）\n娜塔莉亚（震惊）\n▲娜塔莉亚后退了半步，惊愕地看着塞莱特斯。\n娜塔莉亚OS：我猜对了，塞莱斯特想离开布拉姆！可她为什么要向我求救？（I was right. She’s trying to ditch Bram. But why come to me?）\n▲娜塔莉亚故作不解地看着塞莱特斯。\n娜塔莉亚（惊愕）：教父明明十分爱您，怎么会想除掉你？（The Godfather clearly loves you. Why would he want you dead?）\n▲塞莱特斯用力摇头。\n塞莱特斯（绝望）：你们都被骗了！那都是他的精心伪装的假面！他根本就不爱我！（You’ve all been played! It’s all an act. He doesn't love me at all!）\n娜塔莉亚（警惕）：夫人，您遇到危险，应该向您的家人求助，而不是我这个外人。（Ma'am, if you're in danger, go run to your family, not an outsider like me.）\n塞莱特斯（苦笑）：这座庄园守卫深严，我根本无法逃布拉姆的掌控，我也曾向我父母求救，可我身上没有伤痕，他们只认为是我无理取闹！（This place is a fortress, I can't get away from him. I tried begging my parents, but since there are no bruises on my skin, they just think I'm losing my mind.）\n▲塞莱特斯看向了楼梯口，楼梯口偶尔闪过巡逻的身影。\n塞莱特斯（悲伤）：没有人相信完美丈夫的面具下是禽兽。（激动地抓住娜塔莉亚的手）求你帮帮我！（Everyone thinks he's the perfect husband. No one believes me when I tell them what he's really like. Please, you have to help me!）\n▲娜塔莉亚观察着塞莱特斯的表情和发抖的身体。\n娜塔莉亚OS：她说的是真的？还是在试探我？这太冒险了……（ Is she telling the truth? Or testing me? Way too risky...）\n▲娜塔莉亚掰开塞莱特斯的手，准备离开。\n娜塔莉亚：夫人，这些话，我就当没听过！我得离开这里了，如果被教父发现，我会死的……（Ma'am, let’s just pretend this conversation never happened. I gotta go. If the godfather catches me, I'm dead meat...）\n▲塞莱特斯抹了一把眼泪，盯着娜塔莉亚的背影，突然开口。\n塞莱特斯：你的原名叫作苏丽娅，是玛莉的妹妹，八岁被焦恩收养改名娜塔莉亚！你潜入这里是为了寻找玛莉失踪的真相！（Your real name is Surya, Mary’s little sister. John adopted you when you were eight and made you Natalia! You didn't just stumble in here; you're hunting for the truth about Mary!）\n▲娜塔莉亚惊呆了，猛地回头看向了塞莱特斯。\n\n\n第十集\n10-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲娜塔莉亚惊讶地看着塞莱特斯。\n娜塔莉亚：夫人，我并不知道您在说什么，我也不认识玛莉——（Ma'am, I don't know what you're talking about. I have no idea who Mary is-）\n▲塞莱特斯拿出一张照片递给娜塔莉亚，光线昏暗，娜塔莉亚低头看着那张旧照片，上面是小时候的娜塔莉亚和小玛莉还有爸爸妈妈的全家福。\n娜塔莉亚（惊愕）：这张照片怎么在你这里！（where did you get this?）\n▲塞莱特斯走向娜塔莉亚，将照片递给她。\n塞莱特斯：布拉姆很懂怎么让女人为他着迷，一年前我就是这样上钩的。得知他有妻子时，我嫉妒得发疯，只想把他抢过来——他太享受这种被争夺的感觉了。（Bram has a way of wrapping women around his finger. That’s how he reeled me in a year ago. When I found out he was married, I went green with envy. I wanted him all to myself- and he thrives on women fighting over him.）\n▲娜塔莉亚死死握着照片。\n娜塔莉亚（愤怒）：所以你就绑架了我的姐姐？（So you're the one who snatched my sister?）\n塞莱特斯（摇头）：我没有！我只是想给她一笔钱让她离开的！我曾派人调查玛莉，发现她这一生太苦太惨，我不想毁了她好不容易得来的安稳生活。（I didn't! I just wanted to buy her off so she’d walk away. I had her background checked, her life had already been a nightmare. I didn't want to screw up the peace she finally managed to build.)\n▲塞莱特斯抚摸着地下室的铁锁，缓缓转头看向了娜塔莉亚。\n塞莱特斯（哽咽，恐惧）：我放弃了接近布拉姆，可没多久，她就失踪了，尸骨无存！连警方也找不到！（I gave up on Bram. But not long after, she vanished. Even the police couldn't find her!）\n娜塔莉亚（惊讶）：什么？（What?）\n塞莱特斯（看向地下室）：没有人知道她去哪儿了……（No one knows where she went...）\n▲娜塔莉亚审视地看着地下室的门，目光又慢慢挪回塞莱特斯。\n娜塔莉亚（惊愕）：她是不是在这里面？（Is she locked down in there?）\n塞莱特斯（摇头）：我不知道，每一个靠近地下室的人不是死亡就是失踪了……（I don't know. Everyone who gets close to the basement either dies or disappears...）\n▲娜塔莉亚盯着地下室的门，后退了半步。\n娜塔莉亚（审视）：那你现在告诉我这些的目的是什么？（So why are you telling me this now?）\n▲塞莱特斯紧紧抓住娜塔莉亚的手臂。\n塞莱特斯：我怀疑是布拉姆杀了他们！我也试图解开地下室的秘密，布拉姆现在的目标肯定是我，你也靠近了，下一个就是你了！只有我们联手，才有机会逃离魔爪——（Because I'm betting Bram is the one who got rid of them! I tried digging into this basement myself. Now I'm sitting in his crosshairs, and since you've been sniffing around too, you're next on his hit list! Team up with me, or we're both dead.）\n娜塔莉亚（试探）：是你引我来地下室的？你想让我跟你绑在一起？（So you set me up? You dragged me into this just to use me as your shield?）\n塞莱特斯（绝望）：娜塔莉亚，别怪我，（捂着脸）我实在没有办法了，我不想死！（Natalia, don't blame me. I have no choice. I don't want to die!）\n娜塔莉亚（看向地下室的门）：那你想让我怎么做？（Then what do you want me to do?）\n塞莱特斯（坚定）：我需要你去勾引布拉姆！（I need you to seduce Bram!）\n▲娜塔莉亚惊讶，她还没来得及详细询问，突然一束光打在了两个人的脸上，两个人惊恐地抬头看向了楼梯口。\n▲布拉姆阴沉着脸，拿着手枪，带着配枪的安保，站在楼梯口。\n布拉姆（冷冽）：你们在这里干什么？（What do we have down here?）\n\n\n第十一集\n11-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n▲安保的枪口对准了娜塔莉亚，布拉姆一步一步走向了娜塔莉亚和塞莱特斯，娜塔莉亚和塞莱特斯几乎都是紧张地后退了半步，娜塔莉亚连忙将照片藏在了袖子里面。\n▲布拉姆一挥手，两个安保抓住一个男人过来，男人表情惊恐。\n男人：教父，我错了！我真的错了！（Godfather, I was wrong! I'm sorry!）\n布拉姆（子弹上膛）：无视我的规矩，窥探庄园的秘密，就要付出代价。（Break my rules, nose around my estate, and you pay with your life.）\n▲布拉姆的枪抵在了男人的肩膀上。\n男人：教父，求求您放过我吧，我没有想窥探您的秘密，我……（Godfather, mercy! I swear I wasn't snooping around! I—）\n▲娜塔莉亚想说话，塞莱特斯在黑暗中抓住了她的手示意她别开口。\n▲布拉姆表情冷漠，枪响，男人的尖叫声响起，娜塔莉亚捂着耳朵尖叫了一声，靠在墙上惊恐地看着男人被打穿了肩膀躺在地上哀号。\n布拉姆（抬手）：把人拖走，别惊扰了我的夫人，（视线落在了娜塔莉亚身上）还有尊敬的娜塔莉亚小姐。（Drag him away. We wouldn't want to upset my wife... or our lovely Miss Natalia.）\n▲安保将受伤的男人拖走，血流了一地，娜塔莉亚和塞莱特斯几乎不敢喘气，娜塔莉亚瞥了一眼塞莱特斯。\n布拉姆（看了一眼地下室的门）：你们来这里做什么？（So... what brings you two down here?）\n▲塞莱特斯被地上的鲜血刺激得后退了一步，娜塔莉亚看向她。\n娜塔莉亚OS：塞莱特斯夫人，如果你出卖我的话，就别怪我不客气了——（Throw me under the bus, Celeste, and I swear I'm taking you down with me—）\n▲塞莱特斯突然猝不及防的扇了娜塔丽亚一耳光。\n塞莱特斯：贱人！你竟敢污蔑我？（You bitch! How dare you set me up?）\n▲娜塔莉亚猛地抬头看向了塞莱特斯，眼神错愕。\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n\n\n第十二集\n12-1\n夜  内   地下室\n人物 娜塔莉亚  塞莱特斯  布拉姆   安保若干\n塞莱特斯：贱人！你竟敢污蔑我梦游？还把我带到这个鬼地方，分明是想害我！（You bitch! How dare you lie and say I was sleepwalking?! You dragged me down to this hellhole to get me killed!）\n▲布拉姆的枪口对准了娜塔莉亚的太阳穴。\n布拉姆：是吗？敢污蔑我的夫人！（Is that so? You dared to frame my wife!）\n▲娜塔莉亚盯着塞拉特斯的脸，二人对视，仿佛空气都凝固了。\n娜塔莉亚（恢复镇静）：教父，夫人的确是梦游了！请相信我的专业判断。（Godfather, she really was sleepwalking. You have to trust my professional judgment.）\n塞莱特斯（愤怒）：胡说，你颠倒黑白，污蔑我有病，是不是想取代我的位置！（Bullshit! You're twisting the truth, trying to make me look crazy! You just want to take my place!）\n娜塔莉亚：夫人，地下室是禁地，如果您不是梦游，来地下室干什么？如果不是梦游，您有手有脚，又怎么会听我指挥？我只是怕您有危险，所以跟到了这里。（Ma'am, the basement is strictly off-limits. If you weren't sleepwalking, what were you doing down here? And why did you follow me without a word? I only came down because I was worried about your safety.）\n▲娜塔莉娅拨开布拉姆的枪，魅惑的看着布拉姆。\n娜塔莉娅：教父，您觉得我说的对吗？（Godfather, don't you think I'm right?）\n▲布拉姆冷眼盯着塞莱特斯和娜塔莉亚，塞莱特斯连忙抱住了布拉姆的手臂，疾言厉色地开口。\n塞莱特斯：布拉姆，她是在污蔑我！（看保安）保安，把这个女人驱逐出去！（Bram, she's framing me! Guards, throw this woman out!）\n▲保安目光看布拉姆，没有动，布拉姆的表情松动，拍了拍塞莱特斯的手。\n布拉姆：塞莱特斯，冷静点儿，我会请最权威的精神科医生医生来对你进行评估。（看保安）带夫人去休息。（Celeste, calm down. I'll have the best psychiatrist come take a look at you. Take my wife to rest.）\n塞莱特斯（故作惊讶）：我才是你的妻子！你宁愿相信这个外来者也不相信我？（I'm your wife! You’re taking the word of a stranger over mine?）\n布拉姆（呵斥）：回去休息！（Go rest!）\n▲塞莱特斯惊愕，布拉姆拍了拍塞莱特斯的肩膀放缓了语气。\n布拉姆（安抚）：亲爱的，我这都是为了你好，快去休息吧。（Sweetheart, I'm doing this for your own good. Now go get some sleep.）\n▲塞莱特斯和娜塔莉亚对视了一眼。\n▲塞莱特斯气冲冲地离开了，布拉姆转了一圈手枪，用枪挑起娜塔莉娅的下巴。\n布拉姆（威胁）：娜塔莉亚，我的宝贝，告诉我，你来地下室的真正目的。（Natalia, my sweet... now tell me the real reason you're down here.）\n\n第十三集\n13-1\n夜  内   地下室\n人物 娜塔莉亚  布拉姆   安保若干 \n▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。\n娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！（Bram doesn't buy our story. Better to admit part of it than keep hiding.）\n▲娜塔莉亚盯着布拉姆的眼睛，突然上前一步，抱住了布拉姆。\n娜塔莉亚（故作惊恐）：教父！请原谅我！是我趁她梦游，故意把她引到了这里。（Godfather, please forgive me! I knew she was sleepwalking, so... I intentionally led her down here.）\n▲布拉姆惊讶地低头看着娜塔莉亚的，他放下了枪，抚着娜塔莉亚的后背开口。\n布拉姆（惊讶）：你故意的？（You did it on purpose?）\n娜塔莉亚（握拳）：是的，我只是个医生，不是她的佣人，可她却当众掌我嘴，我只想给她一个小小的教训！（Yes. I'm just a doctor, not her maid, but she slapped me in public. I just wanted to teach her a little lesson!）\n▲布拉姆盯着娜塔莉亚的模样，勾起嘴角。\n布拉姆OS：有趣，聪明，但也仅仅是个猎物！（Spicy, and sharp. But still just a mouse playing with a cat.）\n▲布拉姆挑眉，指尖划过了娜塔莉亚的脸颊。\n布拉姆（试探）：那你恨吗？想不想将她踩在脚下？（So do you hate her? Want to grind her into the dirt?）\n▲布拉姆话音落下，娜塔莉亚听到了子弹上膛的声音，娜塔莉亚扫了一眼那些枪口，格外紧张，心跳加速。\n娜塔莉亚（抬头看向布拉姆）：我不是神，当然会恨夫人。（愤恨）但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。（I’m no saint, so yeah, I despise her. But what really pisses me off is this rigged system. I hate the elite, even while I’m dying to have everything they’ve got.）\n▲布拉姆盯着娜塔莉亚，布拉姆突然推开娜塔莉亚，举起枪，对准了娜塔莉亚的额头。\n布拉姆：这番话，足以让你丧命！（Those words could get you killed!）\n▲娜塔莉亚不为所动，她伸出手轻轻抚摸着布拉姆的脖子，从他的肩膀抚摸到他的心口。\n娜塔莉亚（坚定）：但我说的都是真话！（放软声音）教父，难道您不恨他们吗？（But I'm telling the truth! Godfather, don't you hate them too?）\n▲布拉姆突然笑了，轻轻鼓了鼓掌。\n布拉姆（欣赏）：很好，我欣赏敢于坦诚欲望的人。（抚摸娜塔莉亚的肩膀）但你的目的远不止这些吧。（Good. I admire people who are honest about their desires. But your goal is more than that, isn't it?）\n▲娜塔莉亚惊愕地看着布拉姆，二人对视，娜塔莉亚紧张了起来。\n娜塔莉亚（紧张）OS：塞莱特斯都能查到我的身份，布拉姆会知道吗？（握拳）豁出去了！（ Celeste found out who I am. Does Bram know? Screw it!）\n▲娜塔莉亚山前一步，指尖轻轻揭开了布拉姆衣服的扣子，布拉姆一把抓住了娜塔莉亚的手。\n布拉姆（警惕）：你想干什么！（What do you want?）\n▲娜塔莉亚垫脚靠近布拉姆的耳朵，手从他的胸口滑落到腹部，腰部，最后勾住了他的皮带。\n娜塔莉亚（妩媚）：教父，我曾远远见过您一次，便深深爱上了您！我进入庄园，都是为了您呀。（Godfather, I saw you once from a distance, and I fell for you. I came into this estate for you.）\n▲布拉姆一惊，喉结滚动了一下，目光掠过娜塔莉亚的脸颊和脖子。\n布拉姆OS：这个妖精，真想把她绑起来，玩个痛快！可惜现在还不到时候！（What a seductive little vixen. God, I want to break her. But the game’s just getting started.）\n▲布拉姆一把抓住了娜塔莉亚的手，阻止她的动作。\n布拉姆（故作冷漠）：够了！回你的住处去，记住，不要试图窥探这里的秘密，它会让你死的很惨！（Enough! Go back to your room. And remember—don't dig into this place's secrets. It'll get you killed.）\n▲娜塔莉亚连忙低下头去，绕过了布拉姆，提着裙摆上楼了，她回头看了一眼地下室的铁门上的锁。\n【闪回】\n13-2  （衔接10-1）\n夜  内   地下室门口\n人物  娜塔莉亚   塞莱特斯\n▲塞莱斯特抓住娜塔莉亚的手。\n塞莱特斯（情绪激动）：我需要你去勾引布拉姆！只要你帮我，我就告诉你地下室的钥匙在哪儿！（I need you to seduce Bram! Help me, and I'll tell you where the basement key is!）\n▲娜塔莉亚看了一眼锁，又看向了塞莱特斯。\n娜塔莉亚：我可以答应你！钥匙在哪儿？（I'll do it. Where's the key?）\n塞莱特斯（紧张）：是一把纯金的钥匙，就在布拉姆身上！（It's a solid gold key. and Bram keeps it right on him!）\n【闪回结束】\n▲娜塔莉亚不动声色地将目光从地下室门口，挪到了布拉姆的身上，布拉姆正烦躁地揭开了衬衣上面的三颗扣子，一道金色光芒在他衣服里面一闪而过。\n娜塔莉亚（惊讶）OS：那是钥匙吗？（坚定）我一定会取得布拉姆的信任，拿到地下室的钥匙，救出姐姐！（Was that it? The key? Watch your back, Bram... I'll win your trust, steal it, and tear this hellhole apart to save my sister.）\n13-2\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯站在窗前，忐忑地看着夜色。\n塞莱特斯（紧张）OS：都这么久了，希望娜塔莉娅没出什么危险。（It's been so long. I hope Natalia's okay.）\n▲这时，布拉姆推开了塞莱特斯的房间门，塞拉特斯被吓了一跳，他穿着睡衣，脸上带着温和的笑容。\n布拉姆（步步靠近）：塞莱特斯，这个世界上，唯有我最爱你。你应该牢记这一点。（Celeste, in this world, no one loves you like I do. Remember that.）\n▲塞莱特斯一步一步后退，布拉姆将她抵在了墙上。\n塞莱特斯：布拉姆！你想干什么？（Bram! What do you want?）\n▲布拉姆将一个盒子递给了塞莱特斯。\n布拉姆（笑）：但愿这里面的东西，能让你认清现实。（I hope this helps you see reality.）\n\n\n第十四集\n14-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n▲塞莱特斯脸色发白，紧紧握着裙摆，录音笔还在响。\n娜塔莉亚vo：但我恨得是阶层带来的不公，我厌恶所有贵族，却又羡慕他们所拥有的一切。..(What really pisses me off is this rigged system. I hate the elite—even while I’m dying to have everything they’ve got.）\n▲布拉姆的手指拂过塞莱特斯的脸颊。\n布拉姆（蛊惑）：听见了吗？她恨你，她嫉妒你的出身，她想毁了你。只有我才能保护你！（Hear that? She hates you. She's jealous of your bloodline. She wants to destroy you. Only I can protect you!）\n▲塞莱特斯盯着录音笔，握紧了拳头。\n塞莱特斯OS：娜塔莉亚已经出卖了我？（Did she just throw me under the bus?）\n布拉姆（语气温和）：告诉我，她是怎么样蛊惑你的？（轻轻拥抱塞莱特斯）我会保护你不被伤害。（Now, tell me... how did she get into your head? Trust me, I'll keep you safe.）\n▲塞莱特斯心跳加速，她盯着录音笔，噗嗤一声笑了。\n塞莱特斯（骄傲地抬头）：我出身贵族，觊觎我身份的人太多了，她们嫉妒我、羡慕我，想害我，我习惯了。（I was born noble. So many people want my place. They're jealous, envious, out to hurt me. I'm used to it.）\n▲布拉姆脸上的温和瞬间消失了，他推开塞莱特斯，将录音笔狠狠摔在了地上，塞莱特斯被布拉姆突然变脸吓得捂住了耳朵。\n布拉姆（训斥）：你太狂妄自大了！你的傲慢会招来杀身之祸，唯有我可以庇护你！（You're too arrogant! Your pride will get you killed. Only I can shelter you!）\n▲布拉姆扯下她捂着耳朵的手，靠近她的耳朵。\n布拉姆（质问）：告诉我，你为什么要去地下室！你是不是也想知道里面有什么？（Tell me, why did you go to the basement? You want to know what's in there too, don't you?）\n▲塞莱特斯惊恐。\n塞莱特斯（抬头盯着布拉姆）：不不不——我不知道！是……是娜塔莉亚陷害我！（No, no, no—I don't know! It's... Natalia framed me!）\n▲布拉姆狠狠将塞莱特斯甩在了床上。\n布拉姆（拿出枪）：很好！（上膛）那我现在就去杀了她。（Good. Then I'll go kill her right now.）\n▲布拉姆举着枪大步流星地往外走，塞莱特斯吓坏了，连忙喊道。\n塞莱特斯：不，不是——我说实话！（No, wait—I'll tell the truth!）\n14-2\n夜  内  走廊\n人物  娜塔莉\n▲娜塔莉亚站在门口，耳朵贴在了门上。\n塞莱特斯vo：不，不是——我说实话！（No, wait—I'll tell the truth!）\n▲塞莱特斯的声音从门内传来，娜塔莉亚惊讶地猛地捂住了嘴巴。\n\n\n第十五集\n15-1\n夜  内  塞莱特斯房间\n人物 塞莱特斯  布拉姆\n▲布拉姆猛地回头，用枪挑起了塞莱特斯的下巴。\n布拉姆：那是什么？（威胁）你想背叛我？（What was that? You want to betray me?）\n▲塞莱特斯额头上冒出冷汗，颤抖地开口。\n塞莱特斯：是因为她白天勾引你，所以我故意装梦游，引她去地下室，我想要杀了她！（Because she seduced you today, I pretended to sleepwalk and lured her to the basement. I wanted to kill her!）\n▲布拉姆的表情松动了半分，布拉姆收了枪，轻轻抚摸着塞莱特斯的头发。\n布拉姆（温和）：我很高兴你如此在乎我。（Good. I do love it when you get jealous.）\n▲塞莱特斯颤抖了一下，布拉姆的脸上露出了笑容轻吻了她的额头\n布拉姆：放心，我只爱你一个人，不会被其他女人蒙骗。（Don't worry. I only love you. I won't be fooled by other women.）\n▲布拉姆将塞莱特斯搂在怀中，看着窗户上的影子，嗤笑了一声。\n布拉姆OS：竟然学会了互相掩护。（抚摸塞莱特斯的背影）当你不想让我杀了她的时候，你就已经露出了破绽。（Covering for each other now, are we? The second you stepped in to save her neck, you blew your cover.）\n▲布拉姆将塞莱特斯推到在了床上，开始脱衣服。\n布拉姆（解开皮带，放在手中把玩）：塞莱特斯，你能依靠的只有我一个，你会听话对吗？（Celeste... I'm all you've got in this world. You're gonna be a good girl for me, aren't you?）\n▲塞莱特斯看着浑身发抖，连忙后退，她拼命地摇头。\n塞莱特斯（颤抖求饶）：布拉姆，我，我身体不太舒服，我不想……（Bram, I... I don't feel well. I don't want to...）\n▲布拉姆一把抓住了塞莱斯特的手，眼神凶狠，撕开了她的上衣。\n布拉姆（故作温和）：拒绝我，你以前不是很喜欢我的占有吗？（Saying no to me? You used to crave it when I took control.）\n▲塞莱斯特惊慌失措，想挣扎，布拉姆突然松开她，捂住了她的嘴巴。\n布拉姆（警告）：嘘——有老鼠偷听。（Shh... we have a little eavesdropping rat outside.）\n▲布拉姆手中的手枪上膛，一步一步走向了门口。\n▲切镜。\n▲走廊上，娜塔莉亚正靠在门口听里面的动静，这时，门突然开了，布拉姆手中的枪突然抵在了娜塔莉亚的脑袋上。\n▲娜塔莉亚震惊。\n\n\n第十六集\n16-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚抬头看着布拉姆，布拉姆上半身的衬衣敞开着，他的一只手拿枪口抵着娜塔莉亚的脑袋，一只手关上了门，冷眼看着娜塔莉亚。\n布拉姆（深呼吸）：你在这儿干什么？我不是让你回房间吗？（What are you doing here? Didn't I tell you to go back to your room?）\n▲娜塔莉亚打量着布拉姆的样子，握紧了拳头。\n娜塔莉亚OS：看来我坏了他的好事——（Guess I ruined his little fun—）\n▲娜塔莉亚上前一步，轻轻抚摸着布拉姆裸露的胸膛。\n娜塔莉亚（撒娇）：教父，我不想你和夫人发生关系，我想……（Godfather... I couldn't stand the thought of you touching her. I want... ）\n▲布拉姆一惊，握着手枪的手放了下去，娜塔莉亚的手在布拉姆的身上随意地抚摸了起来。\n娜塔莉亚（着急）OS：钥匙到底在哪儿！（Where the hell is the key?）\n▲布拉姆突然一把抓住了娜塔莉亚的手，眼神带着侵略性地落在了娜塔莉亚的身上。\n布拉姆（捏住了她的下巴）：这么着急取代她？（Can't wait to take her place, huh?）\n▲娜塔莉亚抬头看向了布拉姆，一脸无辜。\n娜塔莉亚（后退）：教父……（Godfather...）\n▲布拉姆瞧着娜塔莉亚的样子，一步一步逼近娜塔莉亚。\n布拉姆：娜塔莉亚，既然是你主动送上门，我就不客气了！（Natalia, since you came to me, I won't hold back!）\n▲布拉姆握住了娜塔莉亚的手腕，一把将她拉在了自己的怀中，低头要吻她，娜塔莉亚几乎是下意识的避开。\n娜塔莉亚OS：禽兽，竟然来真的！（You animal—he's serious!）\n▲布拉姆目光极具侵略性，一步一步逼近娜塔莉亚，他抓住娜塔莉亚的手，让娜塔莉亚的手从他的胸膛一直往下摸到下腹，娜塔莉亚想要收回手，却被布拉姆死死摁住了手。\n布拉姆（蛊惑）：娜塔莉亚，这可是你取代塞莱特斯的机会，你不要吗？权力、财富、地位，你马上就能拥有。（Natalia, this is your chance to replace Celeste. You don't want it? Power, wealth, status, you can have it all.）\n▲娜塔莉亚惊愕地看着布拉姆，露出乖巧的笑容。\n娜塔莉亚（轻点布拉姆的心口）：虽然我很想要，但是……（撒娇）教父，我来月经了，等经期过了……（I really want it, but... Godfather, I'm on my period. Can you wait until it's over？）\n▲布拉姆握住了娜塔莉亚的手。\n布拉姆（嗤笑）：是吗？内裤脱了，我检查。（Is that so? Take off your underwear. Let me check.）\n▲娜塔莉亚不敢置信地盯着布拉姆。\n娜塔莉亚（震惊）：什么？（What?）\n\n\n第十七集\n17-1\n夜  内   走廊\n人物  娜塔莉亚   布拉姆\n▲娜塔莉亚后退了一步，抵在了门上，布拉姆逼近一把捏住了娜塔莉亚的下巴，一把捏着她的下巴，将她的脸转过来，威胁着开口。\n布拉姆（喘息）：你不是爱我吗？不是想取代塞莱斯特吗？拿出你的诚意来！（威胁）不然的话，我不介意让我的狼加餐！（You love me, don't you? You say you want to take Celeste's place？Show me your loyalty, or I’ll feed you to my wolves tonight.）\n▲远处传来狼的嚎叫声，气氛突然变得紧张了起来，娜塔莉亚心跳加速。\n▲这时，戴安娜站在走廊尽头大喊。\n戴安娜（大喊）：娜塔莉亚姐姐，爸爸，快来看我画的画！（Natalia! Daddy! Look what I drew!）\n▲布拉姆看到戴安娜，立刻整理了一下自己的衣服，眼神不悦地落在了戴安娜的身上。\n布拉姆（冷冽）：戴安娜！谁允许你出来的？（Diana! Who gave you permission to leave your room?）\n▲戴安娜举着画，画上画着一个生日蛋糕。\n戴安娜（委屈）：爸爸的生日快到了，我只是想送爸爸一个礼物，让爸爸开心。（Daddy's birthday is coming. I just wanted to give you a gift and make you happy.）\n▲布拉姆收起了枪，走向了戴安娜，伸手摸了一下她的头发。\n布拉姆（不耐烦）：你的心意，我收到了，回房间去。（I got it. Go back to your room.）\n▲戴安娜看了一眼布拉姆，又看向了娜塔莉亚，低着头看着生日蛋糕说。\n戴安娜：以前爸爸的生日宴会，都是妈妈亲手做的蛋糕，妈妈去哪儿了？我想妈妈……（Mommy always baked your cake for your birthday... Where did she go? I really miss her, Daddy...）\n▲布拉姆冷漠呵斥。\n布拉姆（呵斥）：戴安娜！闭嘴！（Diana! Shut up!）\n▲戴安娜被吓到了，哇的一声就哭了，娜塔莉亚立刻扑过去，将戴安娜抱起来，回头看向了布拉姆。\n娜塔莉亚（看向布拉姆）：先生，小姐的病情本就不稳定，您别刺激她！（Sir, her condition is unstable. Don't trigger her!）\n▲戴安娜抱着娜塔莉亚的脖子失声痛哭，布拉姆烦躁地挥了一下手，看向了娜塔莉。\n布拉姆：把她带回房间去！（Take her back to her room!）\n▲娜塔莉亚抱着戴安娜转身回戴安娜的房间，布拉姆盯着娜塔莉亚的背影，目光最后落在了她的臀部。\n布拉姆OS：有点小聪明，但也只是个落入囚笼的兔子而已！（A little clever, but still just a rabbit in a cage.）\n▲布拉姆推开了塞莱特斯的房间门走了进来，里面传来了塞莱斯特的尖叫声。\n\n\n第十八集\n18-1\n夜  内   戴安娜房间\n人物  戴安娜   娜塔莉亚\n▲戴安娜在娜塔莉亚的怀中，指着画上的蛋糕，有些委屈的开口。\n戴安娜（抹眼泪）：以前妈妈在的时候，爸爸从不会凶我，还会陪我过生日，我好想妈妈。（When Mommy was here, Daddy never yelled at me. He celebrated my birthday with me. I miss Mommy.）\n▲娜塔莉亚的目光落在了戴安娜手中的画上。\n【闪回（蛋糕定格切镜到小面包）】\n夜  内  娜塔莉亚小时候的家\n人物  小娜塔莉亚  小玛莉\n▲桌上摆放着一个小面包，面包上插着蜡烛，小玛莉看着小娜塔莉亚摸了摸她的脑袋。\n小玛莉（声音稚嫩）：等以后，姐姐给你买个真正的生日蛋糕！（安抚）许个愿吧。（Someday, sis, I'll get you a real birthday cake. Now, close your eyes and make a wish.）\n▲小娜塔莉亚看着插着蜡烛的面包。\n小娜塔莉亚（高兴）：那我的愿望是，和姐姐永不分离！（My wish is for us to stay together forever and ever!）\n▲小娜塔莉亚吹蜡烛，黑幕。\n【闪回结束】\n▲娜塔莉亚看着画，又低头看着熟睡的戴安娜，她紧紧将戴安娜抱在怀中。\n娜塔莉亚（坚定）OS：我会救出姐姐，让戴安娜和她的母亲团聚！（I swear I will rescue my sister... and bring Diana’s mother back to her.）\n18-2\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣端着托盘，托盘里面放着药往塞莱特斯的房间走，娜塔莉亚从戴安娜房间里面出来。\n娜塔莉亚（盯着女佣）OS：过几天是布拉姆的生日宴，是个能利用的机会。（Bram's birthday banquet is in a few days. That's a chance.）\n▲就在女佣靠近时候，娜塔莉亚一不小心撞到了女佣，女佣手中的托盘差点翻了，娜塔莉亚伸手托住了女佣的手腕，一只手扶住药碗。\n娜塔莉亚：小心！（Careful!）\n女佣：感谢小姐。（Thank you, miss.）\n▲女佣端着药要进入塞莱特斯的房间。\n娜塔莉亚OS：希望塞莱特斯能看到我传递给她的信息！（I hope Celeste sees my message!）\n▲这时，布拉姆走了出来。\n布拉姆（看女佣）：等一等——（Wait—）\n▲娜塔莉亚回头紧张地看着布拉姆。\n娜塔莉亚OS：千万别被布拉姆察觉破绽。（Don't let Bram spot anything.）\n▲布拉姆抬头看了一眼娜塔莉亚，嗤笑了一声。\n布拉姆：你在紧张什么？（Why the jittery face, Natalia?）\n娜塔莉亚（摇头）：不，我刚才不小心把夫人的药撞洒了些……（Nothing. I accidentally spilled some of her medicine earlier...）\n▲布拉姆一步一步走了过来，目光看向了女佣手中的托盘，他用勺子搅了一下药，又将碗端起来检查了一下。\n布拉姆（审视）：洒了吗？（Did it spill?）\n娜塔莉亚（紧张）：一点点……（Just a tiny bit..）\n▲娜塔莉亚盯着布拉姆的动作，心跳加快，目光看向了托盘。\n▲布拉姆看了一眼娜塔莉亚，又顺着娜塔莉亚的目光落在了女佣手中的托盘上。\n布拉姆（冷冽）：将托盘翻过来。（Flip the tray over. Now.）\n▲布拉姆拿出手枪，子弹上膛，娜塔莉亚的目光盯着女佣的动作，女佣缓缓将托盘翻过来——\n\n\n第十九集\n19-1\n日  内  走廊\n人物  娜塔莉亚  女佣  布拉姆\n▲女佣听话地将托盘翻了过来，下面什么都没有，布拉姆这才将药碗放在了托盘上，目光又看向了女佣。\n布拉姆（冷冽）：药给我，我拿进去。（Hand it over. I'll take it to her myself.）\n▲女佣听话地将药碗递给了布拉姆，娜塔莉亚眼神一变，一把抱住了布拉姆的手臂。\n娜塔莉亚（委屈）：教父~您就这么关心夫人？（Godfather, you care about her that much?）\n▲布拉姆一愣，低头看向了娜塔莉亚。\n布拉姆（捏娜塔莉亚的脸）：吃醋了？（Jealous?）\n▲娜塔莉亚松开了布拉姆的手臂，转身背对布拉姆。\n娜塔莉亚（不高兴了）：我怎么会吃醋？我有什么资格吃醋？（Why would I be jealous? I have zero right to be.）\n▲布拉姆抓住了娜塔莉亚的手臂，将她拉入了自己的怀中。\n布拉姆（捏娜塔莉亚的脸）：你长得很像一个人。（You know... you really remind me of someone..）\n▲娜塔莉亚不动声色地抬头看向了布拉姆，指尖轻轻点了点他的胸口。\n娜塔莉亚（乖巧）：什么人？情人还是爱人？您不会拿我当替身吧。（Oh? An ex-lover, or a wife? Don't tell me I'm just some cheap stand-in.）\n▲布拉姆握住娜塔莉亚的手，轻轻吻了吻她的指尖。\n布拉姆（嗤笑）：她可没有你这么大胆。（打量娜塔莉亚）也没有你这么诱人~（She wasn't as bold as you. Or as tempting.）\n▲娜塔莉亚勾着布拉姆的皮带，让他一步步靠近。\n娜塔莉亚（乖巧）：教父昨晚不是说要检查吗？我准备好了……（Godfather, didn't you say you wanted to check last night? I'm ready...）\n▲布拉姆喉结滚动了一下，一步一步靠近娜塔莉亚，女佣立刻低着头，一只手托着托盘，打开门进入了塞莱特斯的房间。\n18-2\n日 内  塞莱特斯房间\n人物 塞莱特斯  女佣\n▲塞莱特斯看着女佣端着咖啡进来，声音冰冷地开口。\n塞莱特斯：出去，我没有病，我不喝这些药！（Get out. I'm not sick. I'm not drinking this!）\n女佣（为难）：夫人，教父下令，我必须看着您喝下去。（Ma'am, please... the Godfather’s orders. I have to watch you finish it.）\n▲塞莱特斯刚想发火，突然看见女佣的衣袖袖口位置贴了一张极小的纸条。\n塞莱特斯（不动声色）：喝就喝——（Fine, I'll drink—）\n▲她伸手抓住了女佣的手腕顺手将纸条取了下来，随后端起碗一口喝了下去，将空碗扬了扬。\n塞莱特斯：你可以滚了！（You can get lost now!）\n▲女佣低着头逃一般离开，塞莱特斯立刻看纸条。\n娜塔莉亚（旁白）：宴会捉奸，帮您离开，希望您当众将地下室的秘密揭露出来，助我一臂之力！同意就摔碗为信号。（Catch him cheating at the party, and I'll help you walk free. Expose the dark secret of the basement in front of everyone, and we both win. Drop the bowl as a signal.）\n▲切镜。\n▲走廊上，布拉姆一把将娜塔莉亚抗在了肩上，大步流星往自己的方向走。\n布拉姆（拍娜塔莉亚的臀）：小妖精，我今天就让你爽个够！（You little vixen. I'm gonna rock your world today!）\n▲娜塔莉亚趴在布拉姆的肩膀上，看向了塞莱斯特的房门。\n娜塔莉亚OS：三、二、一……（Three, two, one...）\n▲突然，塞莱特斯房间里面传来打碎了碗的声音，布拉姆脚步一顿！将娜塔莉亚放下。\n娜塔莉亚OS：合作达成！(Deal!）\n布拉姆（看向塞莱特斯的房间，不悦）：我去看看她又在闹什么！（Let me see what she's up to now!）\n▲娜塔莉亚一把抓住了布拉姆的手。\n娜塔莉亚（撒娇）：教父~（Godfather.）\n▲布拉姆回头看了一眼娜塔莉亚。\n布拉姆（安抚）：生日宴时，她父母会来，你也不想她到时候闹事，对吧！（Her parents will be at the birthday banquet. You don't want her making a scene, right?）\n▲娜塔莉亚故作委屈松手。\n娜塔莉亚（叹气）：好吧，那我就先忍一忍~（Fine. I'll hold it in for now.）\n▲布拉姆走向了塞莱特斯的房间，娜塔莉亚转身往戴安娜的房间走。\n娜塔莉亚（看门）OS：希望能在宴会上，引塞莱特斯的父母出手打开地下室，如果失败了，我也能乘机拿到钥匙，救出姐姐！（Let’s hope Celeste’s parents play their part and blow the basement wide open. But if that plan tanks... I’ll just swipe the key myself and tear this place down to save my sister.)\n\n\n第二十集\n20-1\n日  内  塞莱特斯房间\n人物  布拉姆 塞莱特斯  管家\n▲塞莱特斯睡在了床上，布拉姆坐在窗边上，管家恭敬地看着布拉姆。\n管家：先生，家庭医生给夫人打了镇定剂，她应该不会再闹了。（Sir, the doctor loaded her up with sedatives. She’s out cold; she won’t be making a scene anymore.)\n▲布拉姆点了点头。\n布拉姆（冷冽）：不管如何，宴会之前别让她惹出事情。（Either way, don't let her cause trouble before the banquet.）\n管家（不解）：教父，您明知道夫人和娜塔莉亚在联手动手脚？为什么不阻止她们？（Godfather, you know Celeste and Natalia are working together. Why not stop them?）\n▲布拉姆看了一眼塞莱特斯，嗤笑了一声。\n布拉姆（不屑）：两个落入狼群的兔子，能翻出什么浪花？顶多两个有趣的猎物而已！（Two rabbits in a wolf pack. What can they do? Just two little rabbits for me to play with.）\n20-2\n日  内  宴会厅\n人物  布拉姆  娜塔莉亚  塞莱特斯   戴安娜  宾客若干   莱恩  伊丽莎白\n▲宴会厅金碧辉煌，娜塔莉亚带着戴安娜在甜品区吃糕点，娜塔莉亚远远看着塞莱特斯挽着布拉姆的手，正在和一对夫妇聊天，女人打扮华丽【塞莱特斯母亲 伊丽莎白】，男人【塞莱特斯父亲 莱恩】看起来风度翩翩，举手投足都十分贵气，塞莱特斯似乎察觉了娜塔莉亚的目光，二人对视了一眼互相点头。【Celeste’s Mother, Elizabeth】【Celeste’s Father, Ryan】\n▲娜塔莉亚亲眼看着塞莱特斯将一杯酒递给了布拉姆，布拉姆将酒一口喝了。\n娜塔莉亚OS：上钩了，这酒里的可是好东西。（Got him. There’s something extra in that drink.）\n▲戴安娜看了过去。\n戴安娜：那是塞莱特斯夫人的妈妈，（情绪低落）我也好想我的妈妈呀。（That's Celeste's mom. I miss my mommy too.）\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的戴着帽子的男性客人，路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n男客人（伸手扶娜塔莉亚和戴安娜）：抱歉。（My apologies.）\n▲娜塔莉亚摇了摇头。\n娜塔莉亚：我没什么大碍。（I'm fine.）\n▲布拉姆听到这边的动静，立刻看了过来。\n布拉姆（担心）：发生了什么事？（What happened?）\n男客人（歉意）：教父，不好意思，我差一点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n▲布拉姆故作绅士。\n布拉姆：不必介怀，请您继续享用晚宴吧。（No worries. Enjoy the banquet.）\n▲布拉姆摸了摸戴安娜的脑袋。\n布拉姆：我的小公主，玩的开心吗？（My little princess, having fun?）\n戴安娜（点头）：嗯！（Yeah!）\n布拉姆（温和）：宾客太多了，你跟娜塔莉亚医生回房间好不好？（Too many guests. Go back to your room with Dr. Natalia, okay?）\n戴安娜：可是我还没玩儿够……（But I'm not done playing...）\n娜塔莉亚（抱起）：小姐，我们听教父的话，（柔声安抚）回房间我给你讲故事好不好？（Miss Diana, let's listen to the Godfather. I'll tell you a story in your room, okay?）\n▲就在娜塔莉亚准备离开时，塞莱特斯突然举着酒杯过来，笑着对布拉姆说。\n塞莱特斯：布拉姆，父亲让你陪他喝一杯——啊！（Bram, Father wants you to have a drink with him—ah!）\n▲塞莱特斯突然脚下一滑，一杯酒一下子泼到了布拉姆的身上，众人齐刷刷地看了过去。\n▲布拉姆昂贵的西装被打湿，看上去有些狼狈。\n塞莱特斯（震惊）：哦～天啊！布拉姆，我不是故意的。（Oh my God! Bram, I didn't mean it.）\n▲众目睽睽下，布拉姆强忍怒气，对着塞莱特斯露出了温和的笑容。\n布拉姆（安抚）：别太自责，我去换套衣服，你照顾一下宾客！（Don't blame yourself. I'll go change. You take care of the guests.）\n▲布拉姆优雅转身离开，塞莱特斯给娜塔莉亚使了个眼神，娜塔莉亚立刻点了点头。\n塞莱特斯（兴奋）OS：今夜过后，我就能离开了，娜塔莉亚，你可千万别让我失望！（After tonight, I'll be free. Natalia, don't let me down!）\n20-3\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲敲门声响起，布拉姆赤裸着上身开门。\n布拉姆（烦躁）：送个衣服都这么慢，当心我崩了你们……（What’s taking so long with those clothes? I swear, I’ll shoot you if...）\n▲布拉姆的声音戛然而止，只见娜塔莉亚穿着一条性感的低胸吊带连衣裙，抱着西装站在门口。\n布拉姆（惊愕）：娜塔莉亚？你穿成这样来干什么？（Natalia? What the hell are you wearing?）\n\n\n第二十一集\n21-1\n日  内   布拉姆房间\n人物  布拉姆  娜塔莉亚\n娜塔莉亚（挑眉）：教父不喜欢刺激吗？（抚摸布拉姆的胸膛）还是，您有别的顾虑？（What’s wrong, Godfather? Don't tell me you're scared of a little excitement...）\n▲布拉姆看着娜塔莉亚，眼神从惊愕变成了玩味。\n布拉姆（捏住了娜塔莉亚的下巴）：激将法对我可没用！（笑）不过，我现在的确想把你吃掉！（Reverse psychology won't work on me, sweetheart. Though... I've got to admit, I'm dying to devour you right now.）\n▲布拉姆四下看了一眼，没看见人，他抓住了娜塔莉亚的手臂，将她抗在了自己的肩膀上，然后锁上了门。\n▲塞莱特斯看着布拉姆将娜塔莉亚拉入了房间，嘴角勾起了一个弧度，她转身向宴会厅走去。\n21-2\n日  内  宴会厅\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白\n▲宴会厅中，伊丽莎白挽着莱恩的手，正在和宾客寒暄，塞莱特斯一把抓住了伊丽莎白的衣服。\n塞莱特斯：妈妈，布拉姆出轨了。（Mom, Bram is cheating.）\n▲众人震惊，目光惊愕地盯着塞莱特斯，伊丽莎白迅速捂住了塞莱特斯的嘴巴。\n伊丽莎白（警告）：塞莱特斯！不要胡说！我想布拉姆应该不是这种人。（Celeste! Don't talk nonsense! I don't think Bram is that kind of man.）\n▲塞莱特斯摇了摇头，挣脱了伊丽莎白的手，拽着她往楼上走。\n塞莱特斯（委屈）：我亲眼看到他和一个女人进入了房间里面，请您相信我！（I caught him with my own eyes! He slipped into that room with a woman, you have to believe me!）\n▲众目睽睽之下，塞莱特斯和莱恩对视了一眼，莱恩将酒杯放在了桌子上。\n莱恩（冷哼）：哼，如果布拉姆敢背叛你，我绝不会放过他！（Hmph. If Bram dares to betray you, I won't let him get away with it!）\n▲莱恩大步流星地往房间走，塞莱特斯拉着伊丽莎白跟了上去，宾客们也跟着去看热闹。\n21-3\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚\n▲布拉姆垂眸盯着站在自己面前的娜塔莉亚，眼神透着审视。\n布拉姆（捏娜塔莉亚的手）：今天是我的生日宴，外面都是宾客，你想害我？嗯？（It's my birthday banquet. Guests are everywhere. You want to set me up? Hmm?）\n▲娜塔莉亚轻轻抚摸着布拉姆的脖子。\n娜塔莉亚（笑）：怎么会？（靠近布拉姆的耳朵）今天是您的生日。这是我特地为您准备的生日礼物！（Of course not. It's your birthday. This is a birthday gift I prepared just for you!）\n布拉姆（捏娜塔莉亚的腰）：把你自己当做礼物送给我？（Giving yourself to me as a gift?）\n▲娜塔莉亚缓缓拉下了自己的一根肩带，手在布拉姆身上摸索。\n娜塔莉亚（点头）：当然，过了今夜，您就是我的第一个男人，也是唯一的……（Of course. After tonight, you'll be my first man, and my only...）\n▲布拉姆喉结滚动了一下，一翻身，将娜塔莉亚压到身下！\n▲切镜。\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲门突然被大力踹开，娜塔莉亚和布拉姆猛地抬头，塞莱特斯带众人站在门口。\n塞莱特斯（呵斥）：你们在干什么——（What the hell is going on here?）\n\n\n第二十二集\n22—1日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。\n塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）\n▲娜塔莉亚对视塞莱特斯摇了摇头。\n【闪回】\n22-2\n日  内  布拉姆房间\n人物  布拉姆  娜塔莉亚\n▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。\n▲突然，外面传来了敲门声。\n女佣vo：教父，夫人带着伯爵和伯爵夫人过来了。（Godfather, Madam is here with the Count and Countess.）\n▲娜塔莉亚惊讶，下一刻，布拉姆突然清醒过来，一把将娜塔莉亚推开。\n布拉姆：快把衣服穿好！（Get dressed. Now!）\n【闪回结束】\n▲布拉姆带着温和的笑容，看向了塞莱特斯和莱恩夫妇。\n布拉姆（优雅）：爸妈怎么过来了？（Father, Mother... what a pleasant surprise. Is something wrong?）\n莱恩（尴尬）：你太久没出来，我们过来瞧瞧。（You've been missing for quite a while. We were getting concerned.）\n塞莱特斯（指着布拉姆）：娜塔莉亚怎么在这里？你们孤男寡女躲开宾客在这里面做什么？（Why is Natalia here? What are you two doing alone away from the guests?）\n布拉姆（从容）：戴安娜在宴会上受到了一些惊吓，娜塔莉亚正在向我汇报，有问题吗？（Diana got a little scared at the banquet. Natalia was briefing me on her condition. Is there a problem?）\n塞莱特斯（呵斥）：什么问题非要现在汇报？（看娜塔莉亚）你说，你们在这里面干什么？！（What could be so urgent it couldn't wait until tomorrow?! You! Tell them the truth! What were you doing in his room?）\n▲塞莱特斯的情绪特别激动，目光死死盯着娜塔莉亚，眼神带着祈求。\n塞莱特斯：你说啊！（Say it!）\n▲所有人的目光都落在了娜塔莉亚的身上。\n娜塔莉亚（握紧报告）OS：塞莱特斯，对不起了。（Celeste, I'm sorry.）\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n▲塞莱特斯惊愕地看着娜塔莉亚。\n塞莱特斯（不敢相信）：什么？你撒谎！（抓住了莱恩的手）爸爸，除了这个女人，地下室还藏在一个女人！（What? You're lying! Dad, besides this woman, there's another woman hidden in the basement!）\n莱恩（惊讶）：什么地下室？（The basement?）\n▲众人震惊，布拉姆面色阴沉，娜塔莉亚激动地看向了莱恩。\n\n二卡\n\n\n第二十三集\n23-1\n日  内   布拉姆房间\n人物   塞莱特斯   宾客若干   莱恩  伊丽莎白 布拉姆  娜塔莉亚 \n▲布拉姆上前一步，握住塞莱特斯的手。\n布拉姆（深呼吸）：塞莱特斯，我知道你生病了，你也很难受，但有什么问题，我们私下说好吗？（Celeste, I know you're sick and it's hard, but let's talk in private, okay?）\n▲众人惊讶。\n伊丽莎白：生病了？（Sick?）\n塞莱特斯：你胡说——（看伊丽莎白和莱恩）爸爸妈妈，他胡说的，我没有生病！（You're lying—Mom, Dad, he's lying! I'm not sick!）\n▲布拉姆拿出了检查报告递给了莱恩和伊丽莎白。\n布拉姆（悲痛）：这是塞莱特斯的精神检查报告。她有严重的被害妄想症和梦游症，这一切都是她臆想出来的。（This is Celeste's psychiatric report. She has severe paranoia and sleepwalking disorder. She imagined all of it.）\n▲众人震惊。\n▲莱恩接过检测报告，有些惊讶。\n布拉姆：她一直怀疑我会出轨，怀疑我会害她。（叹气）可是我没有。（She’s constantly convinced I'm unfaithful, that I'm trying to destroy her. God knows I've done nothing of the sort.）\n伊丽莎白（惊讶）：这些事情，你为什么不早告诉我们？（Why didn't you tell us sooner?）\n布拉姆（难过）：你们身体不好，我不想让你们担心——（鞠躬）是我没照顾好她。（You both have delicate health; I didn't want to burden you. It's my fault, I simply failed to protect her.）\n▲宾客盯着布拉姆，忍不住小声议论了起来。\n宾客1：教父果然是重情重义，塞莱特斯夫人这样对待他，他还不离不弃！（The Godfather is a saint. His wife treats him like dirt, and he still covers for her!）\n宾客2：是啊，教父能成为伯爵的女婿，人品肯定很好。（Yeah. If the Count made him his son-in-law, he must be a good man.）\n▲塞莱特斯一把将报告抢过来，直接撕碎了。\n塞莱特斯（咆哮）：我没疯！是他在撒谎——（I'm not crazy! He's lying—）\n▲莱恩打量着一眼看热闹的宾客，立刻呵斥塞莱特斯。\n莱恩：够了！塞莱特斯注意你的言行！（Enough! Celeste, watch your behavior!）\n▲伊丽莎白立刻抓住了塞莱特斯的手，示意她别再说了。\n莱恩（冷脸）：行了，立刻收拾好，出来接待宾客，别再闹些笑话让人误会！（看向宾客）都散了吧。（All right. Clean yourself up and come greet the guests. Stop embarrassing us. Everyone, please, enjoy yourselves—nothing to see here.）\n▲宾客们十分给莱恩的面子，离开了。\n塞莱特斯（着急）：爸爸——（Dad—）\n▲莱恩拽着塞莱特斯离开。\n莱恩（呵斥）：跟我过来，我有话跟你说。（Come with me. I need to talk to you.）\n▲所有人都离开之后，布拉姆一抬手将桌角的花瓶狠狠摔碎。\n布拉姆（恨）：一群杂碎，早晚有一天，我要将你们全部踩在脚底！（A bunch of trash. One day, I'll put every one of you under my feet!）\n▲娜塔莉亚吓了一跳，连忙低下头去。\n娜塔莉亚（恭敬）：教父，抱歉，是我的鲁莽给您惹麻烦了。（Godfather, I'm sorry. My recklessness caused you trouble.）\n▲布拉姆一腔火气，拿起桌上的枪抵着娜塔莉亚的脑袋。\n布拉姆（呵斥）：到底是有意的，还是无意的！（Was it on purpose or not?）\n▲娜塔莉亚惊慌地举起双手，盯着布拉姆的眼睛。\n布拉姆（审视）OS：当猎物脱离掌控时，我一定会亲手杀掉她！我讨厌这种失控感！（When prey slips out of control, I'll kill her myself. I hate losing control.）\n▲布拉姆突然开枪，子弹射出擦着娜塔莉亚的脸颊而过，打碎了花瓶，娜塔莉亚尖叫了一声，连忙开口。\n娜塔莉亚（惊呼）：教父，我承认，我是故意的！（Godfather, I admit it. I did it on purpose!）\n布拉姆（呵斥）：你为什么要这么做！（Why did you do it?）\n娜塔莉亚（慌乱）：我想得到您，我想取代塞莱特斯，（一把抱住布拉姆）您不是说给我一个机会吗？（I want you. I want to replace Celeste. Didn't you say you'd give me a chance?）\n▲布拉姆震惊。\n\n\n第二十四集\n24-1\n日  内   布拉姆房间\n人物 布拉姆  娜塔莉亚 \n▲布拉姆惊讶地看着娜塔莉亚。\n布拉姆（惊讶）：什么？（What did you just say?）\n▲娜塔莉亚抬头看着布拉姆。\n娜塔莉亚（诚恳）：塞莱特斯根本就不懂您，也配不上您，您这么强大、睿智，我实在太仰慕您了，才会铤而走险抓住这个机会，我以为……（Celeste doesn't understand you. She doesn't deserve you. You're so powerful and smart. I admire you so much that I took this risk. I thought...）\n▲布拉姆盯着娜塔莉亚的眼睛，握着枪的手垂了下去，揉了揉额头。\n布拉姆（放缓语气）：你以为在今天跟我上床，被发现了，我就会和塞莱特斯离婚，娶你是吗？（You thought if you slept with me today and we got caught, I'd divorce Celeste and marry you?）\n▲娜塔莉亚握住布拉姆的枪，指着自己的脑袋。\n娜塔莉亚（认真）：您杀了我吧，杀了我证明您的清白！（Then pull the trigger! Kill me right now to prove you had nothing to do with this!）\n▲布拉姆惊讶，猛地收回了枪。\n布拉姆（拍娜塔莉亚的脸）：我不会杀你，你先回去陪戴安娜吧，我会处理好。（轻轻拥抱）记住，在这里，只有我能保护你。（I won't kill you. Go keep Diana company. I'll handle it. Remember, in this place, only I can protect you.）\n▲娜塔莉亚红着眼睛点了点头，转身离开，镜头特写，娜塔莉亚走到门口时，摊开手心，掌心里面躺着一把金色的钥匙。\n▲布拉姆盯着娜塔莉亚的背影，冷笑了一声。\n布拉姆OS：两个女人以为联手就能毁掉我？做梦？（Two women think they can team up and destroy me? Dream on.）\n24-2\n日  外 花园\n人物  莱恩  伊丽莎白   塞莱特斯  布拉姆   管家\n▲塞莱特斯焦急地看着父母。\n塞莱特斯：爸爸妈妈你们刚刚为什么不帮我，我真的没病！（Mom, Dad, why didn't you help me just now? I'm really not sick!）\n莱恩：塞莱特斯，你先冷静，我们并没有看到布拉姆出轨，如果为了他跟别的女人说话而大动干戈，只会显得我们无礼。（Celeste, calm down. We didn't see Bram cheating. Making a scene because he talked to another woman would just make us look rude.）\n伊丽莎白：是啊，塞莱特斯，你不该在大庭广众之下伤了布拉姆的脸面，况且那女人只是他孩子的心理医生，别人会觉得你是个恶毒的后妈。（Yes, Celeste. You shouldn't embarrass Bram in public. Besides, that woman is just his child's therapist. People will think you're a cruel stepmother.）\n塞莱特斯（绝望）：爸爸妈妈，你们不相信我？（Mom, Dad, you don't believe me?）\n伊丽莎白（安抚）：塞莱特斯，一个心理医生，你不喜欢她，找个机会把她赶走就好了！（Celeste, she's just a therapist. If you don't like her, find a chance to get rid of her.）\n莱恩（抚摸塞莱特斯的头发）：你自小性格要强，肯定受不了丝毫委屈，教父现在权势滔天，你应该获取他的欢心，况且他对你很好，别无理取闹了。（You've always been strong-willed. You can't stand the slightest grievance. The Godfather is powerful now. You should win his favor. Besides, he treats you well. Stop making a fuss.）\n▲塞莱特斯绝望的后退了半步。\n塞莱特斯：不，不是这样的。（No, it's not like that.）\n莱恩（心疼）：你放心，爸爸会联系最好的医生治疗你的病！（Don't worry. I'll contact the best doctor to treat you!）\n▲镜头上拉：布拉姆站在二楼的窗户，眼神冰冷地盯着他们。\n布拉姆（狠辣）OS：这场捕猎游戏，我玩儿够了，该结束了！（I'm done playing this hunting game. It's time to end it.）\n\n\n第二十五集\n25-1\n夜  内   宴会厅门口\n人物 塞莱特斯   伊丽莎白  下人若干 莱恩 布拉姆   娜塔莉亚\n▲莱恩和伊丽莎白站在门口，布拉姆站在二人面前，莱恩严肃地盯着布拉姆。\n莱恩（温和）：布拉姆，你对塞莱特斯的好，我们看在眼中，但她就是大小姐脾气，希望你多多担待，不要跟她一般见识。（Bram, we know you care for Celeste deeply. But she’s always had a headstrong, spoiled streak. Do be gentle with her, and try not to take her outbursts to heart.）\n伊丽莎白（温和）：夫妻之间，要互相体谅。（Married couples need to understand each other.）\n▲众目睽睽下，布拉姆握着的拳头青筋暴起。\n布拉姆（冷漠）OS：一群虚伪的贵族，凭什么高高在上教训我，等我拿到了他所有的资源，我一定把他丢去喂鲨鱼！这一天马上就要到来了！（A bunch of hypocritical nobles. What gives you the right to lecture me? Once I get all his resources, I'll feed him to the sharks. That day is coming soon.）\n▲布拉姆弯着脊梁低头道歉。\n布拉姆：您放心，我很爱她，我保证会照顾好她的。（Don't worry. I love her very much. I promise I'll take good care of her.）\n▲塞莱特斯瞧着布拉姆的样子，害怕地死死握住了伊丽莎白的手。\n伊丽莎白（心疼）：布拉姆，塞莱特斯状态不太好，不如让她先跟我们回去住几天？（Bram, Celeste isn't doing well. Why not let her come home with us for a few days?）\n▲塞莱特斯的眼睛都亮了起来，娜塔莉亚不动声色地看向这边。\n娜塔莉亚OS：只要塞莱特斯离开了这里，我们的计划就成功了！（If Celeste leaves this place, our plan works!）\n▲布拉姆伸手将塞莱特斯搂在怀中，绅士地开口。\n布拉姆：妈，塞莱特斯还需要接受治疗，我比较了解她的情况，如果塞莱特斯现在离开，可能会中断她的治疗。（Mom, Celeste still needs treatment. I know her condition better. If she leaves now, it could interrupt her treatment.）\n莱恩（点头）：布拉姆说得有道理，别影响塞莱特斯的治疗。（Bram has a point. Don't interrupt her treatment.）\n▲塞莱特斯眼眶瞳孔，伊丽莎白不舍得吻了吻她的脸颊，安抚她。\n伊丽莎白：听话，好好治病，等你状态好了，妈妈来接你。（Be good. Do what the doctors say. Once you're better, I'll come get you.）\n塞莱特斯（绝望）：妈妈，我真的没病——（Mom, I'm really not sick—）\n布拉姆（搂住塞莱特斯）：塞莱特斯，听话，太晚了，让爸爸妈妈回去好好休息吧。（Celeste, be good. It's late. Let Mom and Dad go home and rest.）\n▲伊丽莎白松开了塞莱特斯，挽着莱恩的手上车，布拉姆带着微笑搂着塞莱特斯目送二人，车子离开之后，布拉姆突然伸手捏住了塞莱特斯的脖子。\n布拉姆（眼神阴冷）：关门，我的夫人需要接受治疗了！（Lock the gates. My wife is due for her treatment.）\n\n\n第二十六集\n26-1\n夜  内   宴会厅/走廊\n人物 塞莱特斯   下人若干  布拉姆   娜塔莉亚\n▲安保瞬间关上了庄园的大门，整个庄园被围了起来，布拉姆掐着塞莱特斯的脖子，逼迫着塞莱特斯上楼。\n塞莱特斯（惊呼）：松开我！爸爸——妈妈，救命——（Let me go! Dad—Mom, help—）\n▲娜塔莉亚惊愕地看着眼前的场景，她连忙站在旁边，给布拉姆让路，塞莱特斯路过娜塔莉亚的时候，眼神紧紧盯着娜塔莉亚，又看着屋内的佣人们，佣人们低着头不敢抬头。\n▲镜头特写：其中一个女佣退到了人群后面，悄无声息地往门口走。\n▲娜塔莉亚瞧着布拉姆将塞莱特斯拉入了房间狠狠关上了门，她连忙转头往地下室方向跑。\n娜塔莉亚（紧张）OS：钥匙已经到手了，布拉姆应该不会杀了塞莱斯特，我得趁乱先救出姐姐！（I have the key. Bram probably won't kill Celeste. .. I have to take advantage of this chaos and get my sister out NOW.）\n26-2\n夜   内   塞莱特斯房间\n人物：女佣   布拉姆  塞莱特斯  \n▲布拉姆将塞莱特斯拉入了房间狠狠摔在了床上，他扯松了领带，死死盯着塞莱特斯。\n▲塞莱特斯惊恐后退。\n塞莱特斯：你要干什么——你敢对我动手，我父母不会放过你的！（What are you doing? If you touch me, my parents won't let you get away with it!）\n▲布拉姆笑着看着塞莱特斯。\n布拉姆（笑容诡异）：塞莱特斯，我怎么舍得杀了你？只是我不明白，我这么爱你，你为什么要害我！（Celeste, how could I bear to kill you? I just don't understand. I love you so much, why did you try to hurt me?）\n塞莱特斯（惊恐）：我没有害你！是你自己和娜塔莉亚不清不白，难道还不允许我告诉我父亲吗？（I didn't hurt you! You're the one fooling around with Natalia. Am I not allowed to tell my father?）\n布拉姆（抓住塞莱特斯的头发）：是你在酒里下毒，还带着人捉奸，害我在大庭广众之下被你父亲训斥！还不算害我吗？（You spiked my drink! You staged a scandal to catch me red-handed, and you let your father humiliate me in front of everyone! You call that not trying to ruin me?）\n塞莱特斯（惊恐真正）：我没有！（I didn't!）\n布拉姆（膝盖压住塞莱特斯的腿）：怎么？你想离开我？（What’s the matter? Dying to run away from me?）\n塞莱特斯（尖叫）：啊——（Ah—）\n布拉姆（逼问）：你是不是看不起我？是不是觉得我配不上你？（You look down on me, don't you?! You think a high-and-mighty heiress is too good for a man like me?）\n\n\n第二十七集\n27-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲塞莱特斯被压得表情扭曲。\n塞莱特斯（痛苦）：不——我没做过！（No—I didn't do it!）\n▲布拉姆一把将塞莱特斯从床上拉起来。\n布拉姆（冷笑）：不承认是吧？（Not admitting it, huh?）\n▲布拉姆将她摁在了窗口，只见庄园里面有个女佣悄无声息地靠近围墙。\n布拉姆（冷冽）：那是你的信使吗？（举起枪对准女佣的后背）（Is that your messenger?）\n塞莱特斯（惊恐）：不，别杀她！（No, don't kill her!）\n▲布拉姆冷笑，一枪崩了女佣（枪声，窗外鸟雀惊飞，避免直给暴力镜头），塞莱特斯也跟着尖叫了一声。\n▲切镜。\n▲娜塔莉亚站在地下室的入口，她正打算下去。\n娜塔莉亚OS：等我救出姐姐，再去救塞莱特斯！（Once I save my sister, I'll go save Celeste!）\n▲突然，外面响起了枪声，娜塔莉亚连忙转身走向了塞莱特斯的房间。\n娜塔莉亚OS：塞莱特斯！——（Celeste!—）\n▲娜塔莉亚转身向楼上跑去。\n▲切镜。娜塔莉娅刚跑到塞莱斯特门口，突然戴安娜从房间里面走了出来，一把抓住了娜塔莉亚的手，娜塔莉亚惊愕地低头看着戴安娜。\n戴安娜（乖巧）：别过去！（Don't go over there!）\n▲娜塔莉亚惊讶。\n▲切镜\n▲屋内。\n▲布拉姆摁着塞莱特斯的脖子。\n布拉姆（嗤笑）：夫人，我知道娜塔莉亚是谁，她是玛莉的妹妹对吗？（Ma'am, I know who Natalia is. She's Mary's sister, right?）\n▲塞莱特斯惊恐地看着布拉姆。\n塞莱特斯（紧张）：我，我不知道你在说什么！（I—I don't know what you're talking about!）\n▲布拉姆拽住她的头发。\n布拉姆（嘲讽）：夫人，你居然把希望放在一个刚刚毕业的心理医生身上，她的确有些小聪明，可惜，柔弱的像是一只兔子，毫无威胁力！（Ma'am, you put your hope in a fresh-out-of-school therapist. She's a little smart, but weak as a rabbit. No threat at all!）\n▲说着，布拉姆摁住塞莱特斯的脖子，让她趴在窗边上，逼她看着死在地上的女佣，一字一句地威胁。\n布拉姆（残忍）：你猜，我明明什么都知道，为什么还要放过娜塔莉亚？（蛊惑）因为她诚实，夫人，你诚实吗？（Guess why I let Natalia live when I know everything? Because she's honest. Are you honest, ma'am?）\n▲塞莱特斯不可置信地盯着布拉姆。\n塞莱特斯OS：娜塔莉亚出卖我？（Natalia sold me out?）\n【闪回14-1】\n▲布拉姆拿出一支录音笔，布拉姆按下录音键，录音笔播放出娜塔莉亚的声音。\n娜塔莉亚vo：我不是神，当然会恨夫人。（I’m no saint, so yeah, I despise her...）\n【闪回22-1】\n▲娜塔莉亚深呼吸了一口气。\n娜塔莉亚：夫人，我在向教父汇报小姐的情况。（Ma'am, I was merely giving the Godfather an update on Miss Diana's status.）\n【闪回结束】\n▲塞莱特斯握紧拳头。\n塞莱特斯OS：娜塔莉亚每次都没有按照计划行事，难道她真的为了保命牺牲我……（Natalia never followed the plan. Did she really sacrifice me to save herself...）\n▲布拉姆盯着塞莱特斯的眼睛。\n布拉姆（蛊惑）：塞莱特斯，我比你的父母更疼爱你，他们都不管你，只有我护着你，告诉我，是不是有人蛊惑你？（Celeste, I love you more than your parents do. They don't care about you. Only I protect you. Tell me, did someone turn you against me?）\n▲塞莱特斯惊恐地摇头，不肯说。\n▲布拉姆松开了塞莱特斯拿出了一支药剂，他推动针管，药水喷出来了些。\n布拉姆（威胁）：知道这是什么吗？（Know what this is?）\n▲塞莱特斯惊恐后退，布拉姆一步一步逼近。\n布拉姆（阴沉）：放心，不死，只是会麻痹神经，颤抖，抽搐，瘫痪……（Relax... it won't kill you. It just rots your nervous system from the inside—first come the shakes, then the spasms, until you're completely paralyzed.）\n塞莱特斯（惊恐）：不！我说！我什么都告诉你！（No! I'll talk! I'll tell you everything!）\n\n\n第二十八集\n28-1\n夜   内   塞莱特斯房间/走廊\n人物：女佣   布拉姆  塞莱特斯   娜塔莉亚  戴安娜\n▲布拉姆满意地看着塞莱特斯。\n塞莱特斯：是娜塔莉亚，她——（It's Natalia. She—）\n▲外面突然传来了戴安娜的尖叫声。\n戴安娜vo：啊——（Ah—）\n▲紧接着传来花瓶摔碎的声音。\n娜塔莉亚vo：小姐！请您冷静下来。（Miss Diana! Please calm down.）\n戴安娜（尖叫）：妈妈——我要妈妈——（Mommy—I want Mommy—）\n娜塔莉亚（敲门）：教父！不好了！小姐发病了，我需要医生的帮助！！（Godfather! Something's wrong! She's having an episode. I need a doctor!!）\n▲布拉姆将注射器放下，转身往外走。\n布拉姆：老实待着！（Stay right there!）\n▲布拉姆大步流星地走了出去，塞莱特斯捂着心口，泪流满面。\n28-2\n夜  内   戴安娜房间\n人物  戴安娜  医生  娜塔莉亚  布拉姆\n▲戴安娜躺在床上，闭着眼睛，娜塔莉亚和布拉姆站在旁边，医生正在收拾器材。\n医生：教父，小姐的情况不太稳定，不能受到刺激。（Godfather, Diana's still not doing well. We need to keep her calm.）\n▲布拉姆点了点头，医生离开了，布拉姆轻轻抚摸着戴安娜的额头，轻吻了她的额头，眼中流露出慈爱。\n布拉姆（心疼）：我可怜的女儿……（My poor daughter...）\n▲娜塔莉亚盯着戴安娜。\n【闪回28-3】\n夜 内  走廊\n人物  娜塔莉亚  戴安娜\n▲塞莱特斯的房间里面传来塞莱特斯惊恐的声音。\n塞莱特斯vo：不，别杀她！我说！我什么都告诉你！（No, don't kill her! I'll talk! I'll tell you everything!）\n▲娜塔莉亚着急地走向了门口，突然，戴安娜尖叫了一声。\n戴安娜（尖叫）：啊——啊！我要妈妈——（Ah—ah! I want Mommy—）\n▲娜塔莉亚回头，戴安娜突然失控，用力打碎了花瓶。\n【闪回结束】\n▲娜塔莉亚低声安抚布拉姆。\n娜塔莉亚：教父，别担心。上帝会保佑小姐的。（Godfather, don't worry. God will protect her.）\n▲布拉姆看向娜塔莉亚。\n布拉姆（严肃）：想不想知道戴安娜是什么时候开始生病的？（站了起来）跟我来，我现在告诉你。（Want to know when Diana first got sick? Come with me. I'll tell you now.）\n▲娜塔莉亚惊讶，娜塔莉亚站了起来，跟着布拉姆走出房间。\n28-4 \n夜  内  地下室门口\n人物  布拉姆  娜塔莉亚\n▲布拉姆和娜塔莉亚站在了地下室门口，地下室上绑满了铁链。\n布拉姆：真相就在这里，你不是早已拿到了钥匙，打开吧。（The truth is right here. You already got the key, didn't you? Open it.）\n▲娜塔莉亚看到地下室的门，眼神惊愕，心跳加速。\n\n三卡\n\n\n第二十九集\n29-1\n夜  内   收藏室\n人物    娜塔莉亚  布拉姆\n▲娜塔莉亚盯着地下室的门，里面安安静静。\n娜塔莉亚（担心）OS：怎么没声了？难道姐姐已经遇害了？（Why is it quiet? Is my sister already dead?）\n▲布拉姆搂着娜塔莉娅的腰，从裙子腰封里摸出钥匙，打开了地下室旁边的一道门。\n布拉姆（看娜塔莉亚）：进来吧。（Come on in.）\n娜塔莉亚（惊讶）：这是……（This is...）\n▲布拉姆打开灯，娜塔莉亚被眼前的场景惊呆了，只见收藏室里面，全是玛莉的照片，婚纱照，合照，抱着孩子的照片，还有全家福。\n布拉姆（抚摸照片）：这是我的妻子玛莉，是戴安娜的母亲。（This is my wife, Mary. Diana's mother.）\n▲娜塔莉亚看着墙上的照片，有一张是玛莉抱着戴安娜的照片。(定格照片转场）\n【闪回】\n日  内  破旧房屋\n人物  小玛莉  小娜塔莉亚\n▲小玛莉抱着小娜塔莉亚。\n小娜塔莉亚（天真）：被姐姐抱在怀里，总是很安心！（Being in your arms always makes me feel safe!）\n小玛莉：那姐姐就一直抱着你。（Then I'll keep holding you.）\n【闪回结束】\n▲娜塔莉亚捏着裙摆，打量着照片，故意露出了惊讶的神色。\n娜塔莉亚（紧张）：这么多照片，天啊，教父，您一定很爱她吧。（So many photos. Godfather, you must have loved her so much.）\n布拉姆（表情眷恋）：是的，我很爱她，我们在一起十年，她跟我在一起的时候，我一无所有，是她鼓励我，我才有了今天。（Yeah, I loved her. We were together for ten years. I had nothing when we met, but she always believed in me. I wouldn't be where I am today without her.）\n▲娜塔莉亚看着照片，布拉姆观察着娜塔莉亚的表情，嘴角勾起了一个弧度，他深情地抚摸着全家福。\n布拉姆：在塞莱特斯没出现之前，我们曾是最幸福的一家人，可我的妻子太善良了，相信了贵族的谎言，最后被……（Before Celeste came, we were the happiest family. But my wife was too kind. She believed the nobles' lies, and in the end she was...）\n▲布拉姆哽咽了一下，娜塔莉亚回头看向了布拉姆。\n娜塔莉亚（惊讶）：您别这样，她看见您难过，也会难过的。（You don't have to do this. She wouldn't want to see you hurting like this.）\n布拉姆（落泪）：我们不过是权贵的玩物，只能向权贵低头。（抚摸着全家福）我娶塞莱特斯是怕他们继续出手伤害我的女儿。（We're just toys to the powerful. We have no choice but to do what they say. I married Celeste because I was afraid they'd hurt my daughter again.）\n▲这时，一张照片从全家福里面落了下来，照片上：塞莱特斯站在玛莉面前，玛莉红着眼睛望着塞莱特斯。娜塔莉亚惊愕地看着照片。\n娜塔莉亚OS：这是……塞莱特斯没跟我说过她见过姐姐，难道之前的话是在说谎？（This is... Celeste never told me she met my sister. Was she lying before?）\n▲布拉姆观察着娜塔莉亚的表情，捡起了照片。\n布拉姆（悲伤）：娜塔莉亚，我大概知道你是谁了，戴安娜已经失去了母亲了，不能再失去父亲了对吗？（Natalia, I think I know who you are. Diana already lost her mother. She can't lose her father too, right?）\n▲娜塔莉亚一步步后退。\n娜塔莉亚（惊愕）：什么？您知道我是谁？（What? You know who I am?）\n\n\n第三十集\n30-1\n夜  内  画室\n人物  娜塔莉亚  布拉姆\n▲布拉姆步步紧逼，娜塔莉亚步步后退。\n娜塔莉亚：我不太明白您在说什么，我只是……（I don't really know what you mean. I'm just...）\n布拉姆（打断）：嘘，你不想说，可以不说。（Shh. If you don't want to say it, you don't have to.）\n▲布拉姆将塞莱特斯和玛莉的合照放在了娜塔莉亚的手中。\n布拉姆（警告）：娜塔莉亚，权贵绝不会将我们当作人看待，即便我功成名就，伯爵仍然会把我当狗一样训斥，你野心勃勃，你觉得他们会怎么样对你。（People at the top don't see us as equals, Natalia. I built an empire, yet the Count still treats me like a dog on a leash. You're hungry for power, aren't you? What makes you think they won't crush you like a bug?）\n▲娜塔莉亚抵在了墙上，盯着布拉姆。\n娜塔莉亚（紧张）：教父，您会保护我的，对吗？（Godfather, you'll protect me, right?）\n▲布拉姆抚摸着娜塔莉亚的脸颊，一字一句地说。\n布拉姆（蛊惑）：你和我的妻子玛丽一样天真，即便是为了她，我也会保护你。你、我、戴安娜，我们才是一家人，对吗？（You're as naive as my wife Mary. Even for her sake, I'll protect you. You, me, Diana, we're the real family, right?）\n▲娜塔莉亚表情震惊。\n▲布拉姆却后退了一步。\n布拉姆（温和）：娜塔莉亚，找一找有没有治疗戴安娜的方法吧，我只想我的女儿快点好起来。（Natalia, look for a way to cure Diana. I just want my daughter to get better.）\n▲说完之后，布拉姆转身离开了，他站在门口时，又补了一句。\n布拉姆（警告）：对了，千万别靠近地下室。（扬了扬钥匙）这个，还是我来保管比较好。（By the way, stay away from the basement. As for this? It stays right where it belongs with me.)\n娜塔莉亚（点头）：是。（Yes.）\n▲布拉姆关上门出去了，娜塔莉亚盯着墙上的照片 ，轻轻抚摸了玛莉的脸颊。\n娜塔莉亚（自言自语）：如果失去父亲，戴安娜会很痛苦吧，到底谁在说谎……（If she loses her father, Diana will be devastated. Who's really lying...）\n▲布拉姆站在门口，从门缝里面看着娜塔莉亚的表情，嘴角勾起了一道弧度。\n30-2\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆 女佣\n▲娜塔莉亚正在给戴安娜拿早餐，塞莱特斯走入餐厅，眼神冰冷地盯着娜塔莉亚，她狠狠撞了一下娜塔莉亚，冷声呵斥。\n塞莱特斯：怎么？你真想将我取而代之。（What? You really want to take my place?）\n娜塔莉亚（恨）：夫人拿我做棋子玩得开心吗？（Did you enjoy using me as your pawn, ma'am?）\n▲塞莱特斯一巴掌打在了娜塔莉亚的脸上。\n塞莱特斯：贱人！果然是你想害我！（You bitch! I knew you wanted to hurt me!）\n▲娜塔莉亚举起杯子将牛奶全部泼到了塞莱特斯的脸上。\n娜塔莉亚（愤怒）：夫人，我是戴安娜的心理医生，不是任你打骂的奴仆！（Ma'am, I'm Diana's therapist, not some punching bag for you to abuse!）\n▲众人震惊！\n▲镜头特写：布拉姆站在楼梯间静观其变。\n\n\n第三十一集\n31-1\n日  内 餐厅\n人物 女佣  娜塔莉亚  塞莱特斯   布拉姆\n▲布拉姆站在楼梯间，并没有阻止二人，眼神复杂地看着她们。\n▲塞莱特斯被泼了一脸。\n塞莱特斯（尖叫）：你敢泼我！你疯了吗？（You dare throw that at me? Are you insane?）\n娜塔莉亚（冷眼）：夫人，这只是给你一个教训，狂妄自大的人，将为自己的行为付出代价。（Ma'am, that's a lesson. Arrogant people pay for their behavior.）\n塞莱特斯：不过是个卑贱的下等人，敢教训我，你找死——（You low-class nobody. You dare lecture me? You're dead—）\n▲塞莱特斯擦了一把脸上的牛奶，伸手掐住了娜塔莉亚的脖子。\n塞莱特斯：贱人！我跟你拼了！（You bitch! I'll tear you apart!）\n▲娜塔莉亚也不甘示弱，抓起牛奶杯砸在了塞莱特斯的后背上。\n娜塔莉亚：放开我——（Let me go—）\n▲这时，布拉姆匆匆忙忙地走了下来。\n布拉姆（呵斥）：住手！（Stop!）\n▲布拉姆立刻将塞莱特斯的手掰开，将娜塔莉亚拉到自己的身后，冷眼盯着塞莱特斯。\n布拉姆：够了！一个心理医生，一个贵族夫人，竟然在餐厅打了起来，你们不觉得丢人吗？（Enough! A therapist and a noble lady fighting in the dining room. Aren't you ashamed?）\n塞莱特斯（疯）：丢人？（指着娜塔莉亚）这个贱人勾引你，想把我赶出这个家门，我还有什么脸面？（Ashamed? This bitch seduces you and wants to throw me out. What dignity do I even have left?）\n▲布拉姆一把抓住了塞莱特斯，不让她打娜塔莉亚。\n布拉姆（看娜塔莉亚）：你，回去照顾戴安娜。（You. Go take care of Diana.）\n▲娜塔莉亚红着眼睛瞪了塞莱特斯一眼，转身离开了。\n塞莱特斯：贱人！你别走！你给我站住！（Bitch! Don't walk away! You get back here!）\n▲布拉姆死死抓住了塞莱特斯的手臂，眼神兴奋了起来。\n布拉姆OS：互相撕咬吧，愚蠢的猎物们，真是越来越有趣了！（Tear each other apart, you stupid prey. This is getting more and more fun!）\n▲娜塔莉亚站在楼梯口，和塞莱特斯对视了一眼。\n31-2\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲夜里，塞莱特斯睁开眼睛，突然发现自己被绑在了椅子上，她挣扎了一下，布拉姆站在阴影中看着她。\n布拉姆（阴冷）：你醒了。（You're awake.）\n\n\n第三十二集\n32-1\n夜   内   塞莱特斯的房间\n人物 塞莱特斯  布拉姆\n▲塞莱特斯惊恐地盯着布拉姆，布拉姆把玩着一柄教父权杖，低头看着塞莱特斯。\n塞莱特斯（挣扎）：布拉姆……你想干什么？（Bram... what do you want?）\n▲布拉姆一步一步走向了塞莱特斯。\n布拉姆（嗤笑）：你知道我等这一天等了多久吗？（抚摸塞莱特斯的脸颊）原来俯视贵族是这种感觉。（Do you know how long I've waited for this day? So this is what it feels like to look down on a noble.）\n塞莱特斯（惊愕）：布拉姆！我们是夫妻！你为什么想杀了我？（Bram! We're married! Why do you want to kill me?）\n布拉姆（捏着塞莱特斯的下巴）：夫妻？你从来就没有把我当作你的丈夫！（呵斥）被自己看不起的下等人掌控在手心的滋味如何？（Married? You never treated me as your husband! How does it feel to be in the hands of someone you looked down on?）\n塞莱特斯（惊讶）：我什么时候看不起你了？（When did I ever look down on you?）\n▲布拉姆掐住塞莱特斯的脖子。\n布拉姆（愤怒呵斥）：还敢说没有！你喝咖啡时优雅的德行，简直令我作呕！用餐时那套该死的礼仪，连擦嘴都要扭捏作态！你替我整理领带，就像在纠正一个不懂规矩的蠢货！你的每一个动作都在讽刺我，让我感觉自己像个不被驯养的野狗！（Still denying it! The way you drink coffee makes me sick! Those damn table manners—even wiping your mouth is a performance! When you fix my tie, it's like you're correcting a stupid fool who doesn't know the rules! Every move you make mocks me and makes me feel like an untamed dog!）\n▲塞莱特斯惊呆了，她有些窒息。\n塞莱特斯（挣扎）：你误会了！这些想法令我震惊！（You misunderstood! I'm shocked you'd think that!）\n▲布拉姆用力掐着塞莱特斯的脖子。\n布拉姆（愤怒）：什么误会？你那副天生高贵的嘴脸，早就把答案写在了脸上！（Misunderstood? That born-noble look on your face already gave the answer!）\n▲他突然松开塞莱特斯，蹲在了塞莱特斯的面前，头靠在了塞莱特斯的腿上。\n布拉姆（温和）：塞莱特斯，其实你也很崇拜我对不对？我现在已经是个合格的贵族了对吗？（Celeste, you admire me too, don't you? I'm a proper noble now, right?）\n▲塞莱特斯惊恐地看着趴在自己腿上的布拉姆，浑身发抖。\n塞莱特斯（惊恐）：求求你，放过我吧——（Please, let me go—）\n▲布拉姆突然站起来抓住塞莱特斯的头发，用枪抵着她的额头。\n布拉姆（愤怒）：说啊！说你也很崇拜啊！说你仰慕我！说啊——（Say it! Say you admire me! Say you worship me! Say it—）\n▲塞莱特斯吓得尖叫，布拉姆猛地松开了她。\n布拉姆（笑容诡异）：你们不是都好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're all curious what's in the basement, aren't you? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n\n\n第三十三集\n33-1\n夜   内   塞莱特斯的房间\n人物 娜塔莉亚 布拉姆  塞莱特斯\n▲布拉姆转身离开了，塞莱特斯吓得瘫软到了椅子上。\n塞莱特斯（咆哮）：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n▲布拉姆冷笑了一声，拿出厚厚的一叠文件递给了塞莱特斯。\n布拉姆（笑）：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲塞莱特斯盯着那些文件，脸色惨白。\n塞莱特斯（惊愕）：你，你什么时候做的这些？我怎么不知道？（When... when did you do all this? How did I not know?）\n布拉姆（得意）：就在你和娜塔莉亚斗的你死我活的时候。（高高在上）哦，对了，娜塔莉亚是我故意用来分散你的注意力的！（While you and Natalia were tearing each other apart. Oh, and Natalia? I used her to distract you on purpose!）\n33-2\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲字幕：第二天。\n字幕：第二天。（The next day.）\n▲别墅里面突然响起了女佣的尖叫声。\n女佣（尖叫）：啊！夫人，夫人她死了——（Ah! Mrs. Blackwood is dead!—）\n▲娜塔莉亚和布拉姆同时从两道不同的门里面出来，二人冲到了塞莱特斯的房间门口，只见塞莱特斯浑身是血躺在了地上。\n▲娜塔莉亚惊愕地盯着眼前的场景。\n娜塔莉亚（捂着嘴巴）OS：噢，我的老天！（Oh my God!）\n▲布拉姆冷着脸站在门口。\n布拉姆（咬牙切齿）OS：该死！她怎么就死了，还被人看见了，简直打乱了我所有的计划！（Damn it! Why did she die, and someone saw her? It ruins all my plans!）\n▲布拉姆要上前检查。\n布拉姆（看女佣）：报警吧！（Call the police!）\n布拉姆（冷静）OS：塞莱特斯死了也是一件好事情！我既保住了和伯爵的合作，又摆脱了她！（Honestly, Celeste dying might be a blessing in disguise. It keeps my alliance with the Count intact—and cuts loose my biggest dead weight）\n▲娜塔莉亚一把抓住了布拉姆的手臂，阻挡他前去检查。\n娜塔莉亚：教父，塞莱特斯不明不白死在了庄园，您是最后一个见她的人，如果您现在报警，会被怀疑的！（Godfather, Celeste died mysteriously in the estate. You were the last to see her. If you call the police now, you'll be suspected!）\n▲布拉姆抬了下手臂，示意佣人停止报警，佣人恭敬站定，布拉姆回头看向了娜塔莉亚。\n布拉姆（冷冽）：你的意思是？（What do you mean?）\n娜塔莉亚（担忧）：无论如何，您不能进入现场，一定要确保您没有丝毫的嫌疑！（Either way, you can't enter the scene. Make sure you're not a suspect!）\n▲布拉姆盯着娜塔莉亚，眼神危险。\n布拉姆OS：有意思，小兔子，我会将你彻底拉上我的船！（Interesting, little rabbit. I'll make sure you're in too deep to walk away.）\n▲布拉姆轻轻捏了一下娜塔莉亚的脸颊，似笑非笑地问道。\n布拉姆（微笑）：娜塔莉亚，你觉得怎么做更好？（Natalia, what do you think we should do?）\n▲娜塔莉亚看了一眼地上的尸体。\n娜塔莉亚（鼓起勇气）：不如将她埋了，就算她是装的，埋在地里之后，她也彻底死透了。（Why not bury her? Even if she's faking, once she's in the ground, she's dead for real.）\n▲布拉姆惊讶地看着娜塔莉亚。\n\n\n第三十四集\n34-1\n日 内  别墅走廊\n人物  女佣  布拉姆  塞莱特斯  娜塔莉亚\n▲布拉姆看了一眼塞莱特斯的尸体又看向了娜塔莉亚。\n布拉姆（蛊惑）：很好！（抚摸娜塔莉亚的脸颊）娜塔莉亚，你不是想要将塞莱特斯取而代之吗？给你一个机会。（Good. Natalia, didn't you want to replace Celeste? I'll give you a chance.）\n娜塔莉亚（惊愕）：什么？（What?）\n布拉姆（整理她的头发）：去把塞莱特斯的尸体装起来，抛入海中——我就娶你。（Bag up Celeste's body and throw it into the sea—and I'll marry you.）\n▲娜塔莉亚惊愕地看着布拉姆。\n娜塔莉亚（惊讶）：抛入海中？不是活埋吗？（Throw it into the sea? Not bury her?）\n▲布拉姆拿出手枪，在手中把玩。\n布拉姆（嗤笑）：埋在土中会留下痕迹，毁尸灭迹不是更安全？（Burying leaves traces. Destroying the body is safer, isn't it?）\n娜塔莉亚（后退）：不，我不敢——（No, I can't—）\n▲布拉姆枪口抵在了娜塔莉亚的额头上，娜塔莉亚紧张地举起双手，一步一步走了进去。\n布拉姆（看女佣）：你看见了什么？（What did you see?）\n▲女佣颤抖地站在旁边。\n女佣（恭敬）：我什么都没有看到，夫人是在晚上失踪了的。（I didn't see anything. Mrs. Blackwood disappeared last night.)\n▲布拉姆看向了屋内，娜塔莉亚正在检查塞莱特斯的尸体。\n布拉姆：死了吗？（Is she dead?）\n▲娜塔莉亚摸着她的脉搏点了点头。\n布拉姆（吩咐）：那真是很可惜（冷冽）将血迹清理干净，把尸体装起来。（What a shame. Clean up the blood and bag the body.）\n▲布拉姆站在门口点了根雪茄，烟雾缭绕中看着娜塔莉亚擦拭血迹。\n▲娜塔莉亚跪在地上擦拭着，在擦到塞莱特斯身后的时候，借着塞莱特斯的掩盖悄无声息将一直录音笔藏在了自己的口袋里。\n34-2\n夜   外   海边\n人物 布拉姆  娜塔莉亚 塞莱特斯  神秘人\n▲娜塔莉亚满头大汗，费劲地将一个巨大的袋子推入了海中，布拉姆拿着相机拍下了娜塔莉亚抛尸的画面。\n布拉姆（嗤笑）OS：就算塞莱特斯是假死，现在也死透了！（Even if Celeste was faking, she's dead for real now!）\n▲娜塔莉亚走了回去，举起手。\n娜塔莉亚：教父，都按照您的吩咐做好了。（Godfather, it's done just as you ordered.）\n▲布拉姆伸手搂着娜塔莉亚的肩膀。\n布拉姆（笑）：做得好，娜塔莉亚，现在我们是一条绳子上的蚂蚱了！（伸手牵着娜塔莉亚）走吧，我未来的妻子。（Good job, Natalia. Now we're in this together. Come on, my future wife.）\n▲娜塔莉亚回头看了一眼海面，跟着布拉姆上车了。\n▲布拉姆的车刚刚离开，一个神秘人穿着潜水服，一个猛子潜入水底。\n\n\n第三十五集\n35-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆和娜塔莉亚刚刚走入客厅，便看见莱恩和伊丽莎白还有持枪安保站在屋内。\n布拉姆（惊讶）：爸妈，你们怎么来了？（看向安保）这是什么意思？（Mom, Dad, what are you doing here? What's the meaning of this?）\n▲莱恩冷着脸站了起来。\n莱恩：我们接到消息，说塞莱特斯不见了。（We got word that Celeste is missing.）\n▲娜塔莉亚惊愕地抬头，看向了莱恩和伊丽莎白，下意识地躲在了布拉姆的身后。\n布拉姆（故作惊讶）：这怎么可能……（How is that possible...）\n莱恩（呵斥）：布拉姆！就算你现在权势滔天，如果你真的伤害了我的女儿，我也会拼尽全力，咬下你一块肉来！（Bram! Even if you're powerful now, if you hurt my daughter, I'll fight with everything I have and take a piece of you with me!）\n▲伊丽莎白猛地站了起来，情绪激动。\n伊丽莎白（哽咽）：塞莱特斯在哪儿！把她还给我！（试探）你是不是把她关在了地下室？（Where's Celeste? Give her back to me! Did you lock her in the basement?）\n▲面对伊丽莎白的指责，布拉姆眼神冷了下去，看向了娜塔莉亚。\n布拉姆OS：娜塔莉亚，我本来想让你多活几天，看来你的死期到了！（Natalia, I wanted to let you live a few more days. Looks like your time is up.）\n▲布拉姆无声看向了角落的女佣，佣跑了出来，她抬手指着娜塔莉亚。\n女佣（情绪激动）：伯爵，夫人！是娜塔莉亚杀了夫人！并将夫人的尸体抛入了海中！（Count, Countess! Natalia killed your daughter! She threw the body into the sea!）\n▲所有人的目光瞬间聚集在了娜塔莉亚的身上，娜塔莉亚下意识后退。\n娜塔莉亚（惊慌）：不，不是我——（No, it wasn't me—）\n▲女佣举起了几张照片，照片1：娜塔莉亚蹲在屋内收拾塞莱特斯的尸体。照片2：娜塔莉亚将尸体挪出别墅，还有几张资料。\n女佣（大声）：娜塔莉亚是玛莉夫人的妹妹，她怀疑是夫人杀了玛莉夫人，所以杀了夫人！（Natalia is Mary's sister. She thought Celeste killed Mary, so Natalia killed Mrs. Blackwood!）\n▲众人看到这些照片惊呆了。\n娜塔莉亚（惊恐）：不，我没有，我没有杀夫人！（No, I didn't! I didn't kill her!）\n▲女佣突然指着娜塔莉亚的裤腿。\n女佣（大喊）：看啊，娜塔莉亚的裤子上还有血迹！（Look! There's blood on Natalia's pants!）\n▲娜塔莉亚低头看着自己裤腿上的血，又迅速看向了布拉姆。\n娜塔莉亚（不敢相信）：你骗我？你想让我帮你顶罪！（You lied to me? You want me to take the fall!）\n▲布拉姆一脸痛心，把枪指着娜塔莉亚的脑袋。\n布拉姆（愤怒）：你怎么能杀了我的妻子！我现在就杀了你——（How could you kill my wife? I'll kill you right now—）\n▲布拉姆盯着娜塔莉亚，故作悲痛。\n布拉姆（得意）OS：猎物，只配被我玩弄于股掌中！（Prey only deserves to be played in my hands!）\n塞莱特斯（呵斥）vo：住手！（Stop!）\n▲众人迅速转头看向了门口，只见塞莱特斯和焦恩带着持枪的警察闯了进来。\n伊丽莎白（惊愕）：上帝啊，我的宝贝，你还活着！（My God, my baby, you're alive!）\n▲众人震惊！\n\n\n第三十六集\n36-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲伊丽莎白冲了过去，一把抱住了塞莱特斯。\n伊丽莎白（心疼）：塞莱特斯——你还好吗？他们说你死了？（Celeste—are you okay? They said you were dead?）\n塞莱特斯（看向布拉姆）：爸爸妈妈，布拉姆想杀了我，是娜塔莉亚和她的养父救了我！（Mom, Dad, Bram tried to kill me. Natalia and her adoptive father saved me!）\n▲众人震惊，布拉姆不敢相信地看着眼前的场景。\n布拉姆：养父？（Adoptive father?）\n▲他的目光落在了焦恩的身上。\n布拉姆：是你？（It's you?）\n【闪回19-1】\n男客人（歉意）：教父，不好意思，我差点撞伤了您的女儿。（Godfather, I'm sorry. I almost hurt your daughter.）\n【闪回结束】\n▲布拉姆浑身发抖。\n布拉姆OS：糟了，他们联手耍我，我中了他们的圈套！（Damn. They played me together. I fell into their trap!）\n▲塞莱特斯盯着布拉姆，大声对他们说。\n塞莱特斯（愤恨）：布拉姆囚禁我，威胁我，还想杀了我！（指着他）他还杀了他的前妻玛莉！（Bram imprisoned me, threatened me, and tried to kill me! He also killed his ex-wife Mary!）\n▲娜塔莉亚看向了塞莱特斯，有些惊愕。\n娜塔莉亚OS：姐姐死了？（My sister is dead?）\n▲众人震惊。\n莱恩（呵斥）：布拉姆——给我一个合理的解释！（Bram—give me a good explanation!）\n▲布拉姆慌了神，连忙指着焦恩和娜塔莉亚。\n布拉姆：不，不是我，塞莱特斯受到了刺激，她有被迫害妄想症！（No, it wasn't me. Celeste is traumatized. She has paranoia!）\n塞莱特斯（愤恨）：我没有病！（I'm not sick!）\n▲娜塔莉亚拦住了塞莱特斯的争辩。\n娜塔莉亚（冷笑）：布拉姆，难道连受害者的话，都是谎话吗？（Bram, are you saying even the victim's words are lies?）\n布拉姆（冷笑）：你们说凶手是我，证据呢？尸体呢？证人呢？是你们诬告我！（You say I'm the killer—where's the evidence? Where's the body? Where's the witness? You're framing me!）\n▲莱恩和伊丽莎白对视了一眼，伊丽莎白看向了塞莱特斯。\n伊丽莎白：塞莱特斯，你有证据吗？（Celeste, do you have evidence?）\n▲塞莱特斯和娜塔莉亚对视了一眼，娜塔莉亚拿出了一支录音笔。\n娜塔莉亚：我们当然有！（Of course we do!）\n▲众人震惊。\n▲娜塔莉亚打开录音笔，录音笔中，传出了尖锐的争吵声。\n【音频33-1】\n布拉姆vo：你不是好奇地下室里面有什么吗？明天，你就能进去了，我会让你亲口承认，我是一个贵族！（You're curious what's in the basement? Tomorrow, you'll go in. I'll make you admit I'm a noble!）\n▲众人听着音频，十分惊讶。\n\n\n第三十七集\n37-1\n夜  内   庄园客厅\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） \n▲布拉姆表情惊愕，音频还在继续播放着。\n塞莱特斯vo：你敢伤害我！我父亲不会放过你的！（You dare hurt me! My father won't let you get away with it!）\n布拉姆vo：看到了吗？我已经接手了你们家所有的生意，你的父母即将死于意外，而你，也失去所有价值了！（See this? I've taken over all your family's business. Your parents are about to die in an accident. And you? You're worthless now!）\n▲众人看向了布拉姆，莱恩冷冽发问。\n莱恩（呵斥）：布拉姆！你怎么解释！（Bram! How do you explain this?）\n布拉姆（后退半步）：这是伪造的！（看向莱恩）爸爸，请您相信我。（指着娜塔莉亚和焦恩）他们一定是为了诬陷我，用药物控制了塞莱特斯，我要求对塞莱特斯进行药检！（It's forged! Dad, please believe me. They must have drugged Celeste to frame me. I demand a drug test on Celeste!）\n▲这时，戴安娜突然抱着小熊，在楼梯间大哭了起来。\n戴安娜（惊呼）：地下室有怪物要吃掉我——我好害怕！（There's a monster in the basement that wants to eat me—I'm scared!）\n▲众人惊讶，布拉姆情绪激动。\n布拉姆（呵斥）：戴安娜！闭嘴！别瞎说！（Diana! Shut up! Don't talk nonsense!）\n▲娜塔莉亚盯着戴安娜。\n娜塔莉亚（看向了警察）：地下室，我姐姐被囚禁在了地下室！（The basement, my sister is locked in the basement!）\n37-2\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩） 玛莉\n▲地下室被暴力打开，众人站在地下室门口，被眼前的景象吓到了，里面挂满了玛莉受伤害的照片，刑具，还有三副冰棺，墙上有块黑板，黑板上挂着玛莉、塞莱特斯、娜塔莉亚的照片。\n▲玛莉的编号是一，塞莱特斯编号二，娜塔莉亚编号三。\n伊丽莎白（捂着嘴惊呼）：老天，这简直是个地狱！（My God, this is a hellhole!）\n▲角落里面，有个女人，双脚被铁链锁着，浑身是伤，瘦骨嶙峋。\n娜塔莉亚（惊愕）：姐姐——（Mary—）\n\n\n第三十八集\n38-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲娜塔莉亚冲了过去，颤抖着手拨开了玛莉的头发，娜塔莉亚落泪。\n娜塔莉亚：姐姐，我是娜塔莉亚，你还认得我吗？（Mary, it's me, Natalia. Do you recognize me?）\n▲玛莉艰难地抬头，奄奄一息说不出话。\n娜塔莉亚：医生！快叫医生——（Doctor! Call a doctor—）\n▲焦恩连忙上去，给玛莉做检查。\n焦恩：我现在就带她去医院，别担心，她会脱离危险的。（I'll take her to the hospital now. Don't worry. She'll be okay.）\n▲焦恩将玛莉抱了起来，准备离开，布拉姆被警察控制着对着焦恩呵斥。\n布拉姆（愤怒）：放开她！别将她从我身边带走！把她还给我！（Let her go! Don't take her from me! Give her back to me!）\n▲娜塔莉亚转头看向了被两个警察控制住的布拉姆，抬起手一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：我姐姐陪你吃了十年的苦！还跟你有了孩子，你为什么要囚禁她？！（My sister suffered with you for ten years! She had your child! Why did you imprison her?!）\n▲事情败露，布拉姆也不装了。\n布拉姆（冷笑）：谁让她不答应给我做情妇？（Well... that's what happens when she refuses to be my mistress.）\n▲众人震惊。\n布拉姆：我要成为贵族，我需要塞莱特斯的帮助！玛莉却非要离开我！（I wanted to become a noble. I needed Celeste's help! But Mary insisted on leaving me!）\n▲布拉姆看着焦恩的背影。\n布拉姆（疯狂）：可我爱她，我不能让她离开我，不能让别的男人染指他！我要她永远留在我身边！（But I love her. I can't let her leave me. I can't let another man touch her! I want her by my side forever!）\n▲娜塔莉亚又一巴掌打在了布拉姆的脸上。\n娜塔莉亚（愤怒）：你简直就是个恶魔！（You're a monster!）\n布拉姆（不甘心）：恶魔？对，我就是恶魔！（看塞莱特斯）塞莱特斯，我也爱你啊，我也想把你永远留在我身边！（Monster? Yes, I'm a monster! Celeste, I love you too. I wanted to keep you by my side forever!）\n▲伊丽莎白连忙挡在塞莱特斯的面前，看向了娜塔莉亚。\n伊丽莎白（感激）：娜塔莉亚，幸亏你聪明，不然我女儿就要惨遭毒手了！（Natalia, thank God you're smart. Otherwise my daughter would've been killed!）\n布拉姆（疯狂）：什么聪明？不过是运气好罢了，两个蠢货被我挑拨得大打出手！（看向了焦恩）要不是这个老东西插手，他们都要死！（Smart? Just luck. Two fools I played against each other! If this old bastard hadn't interfered, they'd all be dead!）\n娜塔莉亚（冷笑）：是吗？到现在，你还认为你才是猎人吗？（Really? Even now, you still think you're the hunter?）\n布拉姆（惊愕）：你什么意思？（What do you mean?）\n娜塔莉亚：从宴会开始，一切就都在我们的计划之中了！（Everything has been our plan since the banquet started!）\n【闪回20-1】\n▲娜塔莉亚蹲下身刚想安抚戴安娜，这时，一个穿着礼服的男性客人（焦恩），路过了娜塔莉亚时候一不小心撞了一下娜塔莉亚，娜塔莉亚连忙护住了自己怀中的戴安娜，避免她摔倒。\n镜头特写：在焦恩撞过来的时候，娜塔莉亚将纸条塞入了焦恩的手中。\n纸条内容（娜塔莉娅vo）：爸爸，救我们出去。（Dad, get us out.）\n【闪回结束】\n布拉姆（不敢相信）：你说什么？（What did you say?）\n▲娜塔莉亚盯着布拉姆。\n娜塔莉亚：我很清楚，你从一开始就知道我是玛莉的妹妹，是你引我入局的。（I know perfectly well you knew I was Mary's sister from the start. You lured me into this.）\n▲布拉姆震惊。\n\n\n第三十九集\n39-1\n夜 内  地下室\n人物  伊丽莎白  莱恩  娜塔莉亚  布拉姆   佣人安保若干   女佣  安保  塞莱特斯   神秘人（娜塔莉亚养父：焦恩）\n▲布拉姆惊愕地看着娜塔莉亚，娜塔莉亚一步一步走向了布拉姆。\n娜塔莉亚（冷笑）：姐姐的照片和书信，是你寄到我曾经的家里的，戴安娜床底下的日记本也是你放的，对不对。（You mailed my sister's photos and letters to my old home. You also put the diary under Diana's bed, didn't you?）\n▲布拉姆惊呆了。\n布拉姆（不可思议）：你是怎么知道的？（How did you know?）\n娜塔莉亚（冷笑）：因为庄园守卫森严，如果不是你默许的，姐姐的遗书和照片，不可能邮寄到我手中。（Because this estate is heavily guarded. Unless you allowed it, my sister's letter and those photos could never reach me.）\n布拉姆（惊讶）：什么遗书？我做得天衣无缝，你怎么可能发现？（What letter? I was flawless. How could you find out?）\n娜塔莉亚（嗤笑）：你有一句话说得很好，“真正的猎人，往往会以猎物的方式出现”。（You said one thing right: \"The real hunter often appears as the prey.\"）\n布拉姆（不可置信）：你听到了？（You heard that?）\n▲娜塔莉亚挑眉。\n【闪回衔接5-1】\n▲娜塔莉亚牵着戴安娜往房间走，突然，塞莱特斯的房间里面传来了用力的砸门声，娜塔莉亚上前摁住了把手。\n娜塔莉亚（惊愕）OS：塞莱特斯在里面？（回头看书房）她不是在书房和布拉姆吵架吗？（Celeste is in there? Wasn't she arguing with Bram in the study?）\n【闪回结束】\n▲娜塔莉亚看向了布拉姆。\n娜塔莉亚：捕猎游戏中，算错了一步，都会万劫不复——（In a hunting game, one wrong step and you're finished—）\n布拉姆（不敢相信）：不不不，你们不都怀疑对方吗？好几次你们都出卖了对方，还大打出手了！（No, no, no. Weren't you suspicious of each other? You sold each other out several times and even fought!）\n娜塔莉亚：如果我们不假装自相残杀，你怎么对我们放松警惕，怎么会一步一步暴露你的真面目？（If we hadn't pretended to tear each other apart, how would you have let your guard down? How would you have revealed your true face step by step?）\n塞莱特斯：其实宴会上，我爸爸妈妈也早就看出了端倪，只是时机还不到。（Actually, my parents saw something at the banquet too. The time just wasn't right.）\n▲布拉姆惊愕地看着塞莱特斯和莱恩，不敢置信地开口。\n布拉姆：什么意思？（What do you mean?）\n▲莱恩冷眼盯着布拉姆。\n莱恩（冷笑）：因为真正的贵族不会在公共场合大吵大叫，即便我的女儿精神失常了，骨子里的涵养也不会丢失！只有你这种人，才不懂这种规矩！（Because real nobles don't scream in public. Even if my daughter lost her mind, her breeding wouldn't disappear! Only someone like you doesn't understand that rule!）\n▲娜塔莉亚笑着看着布拉姆。\n娜塔莉亚：我提议将塞莱特斯的尸体埋在地下时，你也担心我要算计你，所以故意说抛入海中？可恰巧，我猜到了你不会按照我说的做！（When I suggested burying Celeste's body, you were afraid I was setting you up, so you said throw it into the sea. But I guessed you wouldn't do what I said!）\n▲布拉姆彻底崩溃了。\n布拉姆（惊愕）：你们耍我？你们联手耍我！（You played me? You played me together!）\n莱恩（呵斥）：把他带走！我要他为他的算计付出代价！（Take him away! I want him to pay for his schemes!）\n▲布拉姆被带走，和娜塔莉亚擦肩而过的时候，他突然笑了，他盯着娜塔莉亚。\n布拉姆（低声）：娜塔莉亚，你收到的遗书不是我写的，你再好好想想，谁才是真正的猎人。（嘲笑）你眼中的小可怜，身上流的可是恶魔的血！（Natalia, I didn't write the note you received. Think again—who's the real hunter? The poor little thing you pity has the blood of a monster!）\n▲娜塔莉亚惊愕地回头看向了布拉姆，布拉姆对着娜塔莉亚诡异一笑，跟着警察离开了。\n塞莱特斯（安抚）：娜塔莉亚，布拉姆最擅长玩弄人心，你别被他的话蛊惑了——（Natalia, Bram is a master at playing with people's minds. Don't let him mess with your head—）\n▲娜塔莉亚盯着布拉姆的背影久久回不过来神。\n\n\n第四十集\n40-1\n日  内  戴安娜的房间\n人物 娜塔莉亚  戴安娜  玛莉\n▲娜塔莉亚在帮戴安娜整理书籍和绘本。\n娜塔莉亚vo：布拉姆在伯爵的介入下，被判处了死刑，戴安娜和姐姐继承了他所有的家产，我终于和姐姐终于重逢了。（With the Count's involvement, Bram was sentenced to death. Diana and my sister inherited everything he owned. I was finally reunited with my sister.）\n▲娜塔莉亚整理书柜，突然一个盒子掉了下来，里面的东西撒了出来，里面是一张娜塔莉亚的照片。\n娜塔莉亚（惊讶）：这里怎么会有我的照片。（How did my photo get here?）\n▲娜塔莉亚捡起照片，突然发现照片下面有一行小字，镜头特写：找到你了。（儿童字体：found you)\n镜头特写：找到你了。\n戴安娜vo：找到你了。(found you)\n▲娜塔莉亚握紧照片，看着字迹。\n【闪回1-3】\n▲娜塔莉亚继续翻照片，最后一张照片漆黑，照片上，只有一扇铁门，铁门上绑满了铁链，下方有一段小字。\n▲镜头特写：救我——(儿童字体：Help me )\n镜头特写：救我——(儿童字体：Help me )\n【闪回结束】\n▲娜塔莉亚死死盯着这行字。\n娜塔莉亚（惊愕）OS：这字迹，和我收到姐姐的遗书上的字迹一模一样！（This handwriting is exactly the same as the note I got from my sister!）\n▲戴安娜的声音突然响起。\n戴安娜：小姨，你在看什么？（Auntie, what are you looking at?）\n▲娜塔莉亚回头，只见戴安娜站在门口抱着兔子看着娜塔莉亚，表情冷漠，娜塔莉亚连忙将照片藏起来，笑着摸了摸戴安娜的头发。\n娜塔莉亚：没什么。（Nothing.）\n▲这时，楼下响起了车子鸣笛声。\n娜塔莉亚（高兴）：听，是你妈妈出院回来了，我们快去迎接她吧！（Listen, your mom's back from the hospital. Let's go welcome her!）\n▲戴安娜瞬间恢复了孩童的笑容，牵着娜塔莉亚的手，乖巧地点了点头，她又回头看着那个盒子，勾唇一笑。\n40-2\n日  内  庄园客厅\n人物  塞莱特斯   娜塔莉亚   戴安娜   佛西   焦恩  玛莉\n▲娜塔莉亚牵着戴安娜的手路过壁炉时，偷偷将写着字的照片丢入了壁炉中烧掉了。\n▲这时，焦恩推着轮椅进来，玛莉坐在轮椅上，气色还不错。\n玛莉（虚弱）：戴安娜，娜塔莉亚。（Diana, Natalia.）\n▲戴安娜欢呼雀跃的跑过去，紧紧抱住了玛莉的手臂。\n戴安娜：妈妈！我好想你。（哽咽）我以为再也见不到您了。（Mommy! I missed you so much. I thought I'd never see you again.）\n▲玛莉轻轻抚摸着戴安娜的头发，又看向了娜塔莉亚。\n玛莉（招手）：来，让我看看。（Come here. Let me see you.）\n▲娜塔莉亚眼泪瞬间滚落，她一步一步走向了玛莉，半蹲在了玛莉的面前。\n娜塔莉亚（哽咽）：姐姐……（Mary...）\n▲玛莉伸手抚摸着她的头发。\n玛莉（温和）：傻瓜，为什么要冒险救我，如果你遇到了危险，我永远无法原谅自己。（Silly girl. Why risk your life to save me? If something happened to you, I'd never forgive myself.）\n▲娜塔莉亚趴在了玛莉的腿上，一下子哭了起来。\n娜塔莉亚：我好想你，我什么都不在乎，我只想找到你，你答应过等我的。（I missed you so much. I didn't care about anything else. I just wanted to find you. You promised you'd wait for me.）\n▲玛莉温和地抚摸着娜塔莉亚的头发。\n玛莉（安抚）：还是和小时候一样爱哭鼻子。（Still such a crybaby, just like when you were little.）\n▲焦恩拍了怕娜塔莉亚的肩膀。\n焦恩：别哭了，你妈妈一会儿就到，看见你哭鼻子又要心疼了。（Stop crying. Your mom will be here soon. She'll be heartbroken to see you crying.）\n戴安娜（乖巧）：对啊，小姨，我们一家团聚了，应该庆祝——（Right, Auntie. We're all together now. We should celebrate—）\n▲这时，塞莱特斯捧着鲜花了，带着一个男人【塞莱特斯的男友 佛西】进来。\n塞莱特斯（开朗）：嗨~娜塔莉亚，听说玛莉姐姐出院了，我们来看看她，给你们介绍一下，这是我的新男友，佛西。（Hi, Natalia. I heard Mary's out of the hospital, so we came to see her. Everyone, this is my new boyfriend, Fossey.）\n▲娜塔莉亚擦了眼泪站起来，抬头看向佛西时，瞳孔微缩。\n娜塔莉亚（惊愕）OS：是他！（It's him!）\n▲佛西对着娜塔莉亚挥了挥手。\n佛西（笑容诡异）：好久不见，娜塔莉亚。（Long time no see, Natalia.）\n",
  "autoReturnedToLevel0": true
}
```

---
## 第 24 轮（耗时：8553 ms (8.55 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 24 轮] 模型原始输出
```text
状态检查：
- 最终目标：从第一集剧本中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板（角色2/场景0/道具0）。
- 当前计划核验：
  - [x] 探查剧本目录结构（已完成：6场66段）
  - [x] 核查资产库无娜塔莉亚，已创建角色资产（ID: char_1794137305183_eqhut_0）
  - [x] 1-2医院办公室正文精读并追加出处（段落2、4、5）
  - [x] 1-3贫民窟门口幼年回忆精读并追加出处
  - [x] 1-4医院办公室精读并追加出处
  - [x] 1-5娜塔莉亚家精读判定并追加出处
  - [ ] 读取1-5布莱克伍德庄园（32段）正文核准段落号，整合完整 description 并追加该场 provenance
  - [ ] 全局核验资产清单满足目标并结案
- 动态重规划（触发数据量提醒，已切回0级全局阶段）：本轮读取到1-5两场共42段原文。布莱克伍德庄园32段已核清，需拆分为：
  - [ ] 1. 按说话人归属核准娜塔莉亚本人在布莱克伍德庄园的段落号（2、3、5、18、19、22、25、27、28、30）
  - [ ] 2. 整合完整 description（含1-2至1-5各场核心设定，修复被覆盖问题）+ 追加布莱克伍德庄园 provenance，确保 sourceScenes 覆盖
  - [ ] 3. 全局核验资产清单并结案
- 全部达成？尚未，剩布莱克伍德庄园 provenance 未真正入库、description 被覆盖待修复。
- 接下来步骤：核准后的整合更新。需装载 asset.update（写入）与 asset.list（维核验）。
- 关键结论：布莱克伍德庄园娜塔莉亚本人段落已核准为 2、3、5、18、19、22、25、27、28、30；description 需重建为涵盖1-2至1-5的完整版。

思考：上一轮 asset.update 虽然返回成功，但 sourceScenes 仍缺布莱克伍德庄园且 description 被覆盖，这次必须重新整合完整 description 并明确追加该场 provenance。段落号已从本轮原文核准，可以直接编写。需要写入工具 asset.update 与核验工具 asset.list，一次性装载进入执行。

工具调用：
{{调用 sys.selectContext, {"tools": ["asset.update", "asset.list"], "level": 1}}}

用户沟通：
- 完整版：“布莱克伍德庄园的娜塔莉亚段落已核准（2、3、5、18、19、22、25、27、28、30），上一轮 description 被覆盖成只有庄园内容，这次我会重建一份包含1-2到1-5所有核心设定的完整描述，并确保布莱克伍德庄园的出处真正写进 sourceScenes，然后再做一次全局核验。”
- 简版：“已核准庄园段落号，正重建完整描述并补写出处，随后核验。”
```

### [第 24 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`sys.selectContext` (succeeded)
**工具输入 (Input)**：
```json
{
  "tools": [
    "asset.update",
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
    "asset.update",
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
## 第 25 轮（耗时：12770 ms (12.77 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, asset.list, asset.update, user.ask`

### [第 25 轮] 模型原始输出
```text
状态检查：
- 当前正在执行：整合完整 description（含1-2至1-5各场核心设定）+ 追加布莱克伍德庄园 provenance，确保 sourceScenes 覆盖。
- 本轮工具：script.read 成功返回1-5两个场次共42段（娜塔莉亚家10段 + 布莱克伍德庄园32段）完整原文；sys.selectContext 已装载 asset.update、asset.list。
- 布莱克伍德庄园娜塔莉亚本人段落已核准：2（外貌·抱简历·黑框眼镜）、3（本人OS介绍布拉姆）、5（本人OS推测藏姐）、18（主动站起递简历）、19（本人台词"我愿意一试"）、22（本人台词"用专业帮助小姐"）、25（缓缓抬头动作）、27（紧张握紧简历）、28（本人OS"他难道知道我的身份"）、30（本人OS"有机会挖掘真相"）。布拉姆（21、24、26、29）、管家（7、9、11、13、15）、塞莱特斯（32）、应聘者（16、17）严禁归入。
- 下一步：调用 asset.update 重设完整 description 并追加布莱克伍德庄园 provenance。

思考：
需整合1-2至1-5完整 description：1-2心理医生22岁收血书、1-3幼年8岁被姐姐让出收养机会、1-4大学毕业寻姐见照片与铁链门"救我"、1-5家出发立誓救姐、1-5庄园穿职业装戴黑框眼镜应聘主动请缨被布拉姆说长相像故人。provenances 追加布莱克伍德庄园段落2、3、5、18、19、22、25、27、28、30，用 mode append 保留已有出处。

工具调用：
{{调用 asset.update, {"id": "char_1794137305183_eqhut_0", "type": "characters", "mode": "append", "description": "女主角，心理医生，22岁。1-2医院办公室首次出场：坐在椅子上捏着照片、握着血书落泪，独白“等待多年的姐妹重逢，等来姐姐遗照”，得知姐姐玛莉死于布莱克伍德家，需带走外甥女。1-3贫民窟门口（幼年回忆）：8岁“小娜塔莉亚”，父母早逝，由13岁姐姐小玛莉捡废品养大，8岁那年姐姐把被收养的机会让给她，临别承诺总有一天重逢。1-4医院办公室：大学毕业后回旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片，最后一张漆黑照片上是绑满铁链的门写着“救我”，确信姐姐未死，决心潜入布莱克伍德家族救姐。1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”，带应聘文件与铁链门照片立誓“无论如何一定要救出姐姐”。1-5布莱克伍德庄园：穿职业装、抱厚简历、戴黑框眼镜与其他女应聘者站院中应聘，OS认出布拉姆是姐姐丈夫并推测其为攀附贵族藏起姐姐；众人退缩时主动站起递简历“教父，我愿意一试”，双手举简历鞠躬“我会用我的专业帮助小姐，请您给我这个机会”，被布拉姆打量说“你的长相让我想起了一位故人”时紧张握紧简历、OS“他难道知道我的身份”，松懈OS“只要留在这里，我就有机会挖掘真相了”。", "provenances": [{"sceneTitle": "1-5 日 外 布莱克伍德庄园", "paragraphIndices": [2, 3, 5, 18, 19, 22, 25, 27, 28, 30], "evidenceText": "▲庄园的门被打开……娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】。娜塔莉亚OS：他就是姐姐的丈夫布拉姆……娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女……难道，是他为了攀附贵族，把姐姐藏起来了？▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。娜塔莉亚：教父，我愿意一试！娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。▲娜塔莉亚缓缓抬头。▲娜塔莉亚紧张地握紧了简历。娜塔莉亚OS：他难道知道我的身份？娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……"}]}}
用户沟通：
{
- 对用户说的话（完整版）：“已读取1-5布莱克伍德庄园32段并核准娜塔莉亚本人段落号（2/3/5/18/19/22/25/27/28/30），现在整合完整设定并补写该场出处，请稍候核对结果。”
- 对用户说的话（简版）：“正在整合娜塔莉亚完整设定并补写庄园场出处～”
}
```

### [第 25 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.update` (succeeded)
**工具输入 (Input)**：
```json
{
  "id": "char_1794137305183_eqhut_0",
  "type": "characters",
  "mode": "append",
  "description": "女主角，心理医生，22岁。1-2医院办公室首次出场：坐在椅子上捏着照片、握着血书落泪，独白“等待多年的姐妹重逢，等来姐姐遗照”，得知姐姐玛莉死于布莱克伍德家，需带走外甥女。1-3贫民窟门口（幼年回忆）：8岁“小娜塔莉亚”，父母早逝，由13岁姐姐小玛莉捡废品养大，8岁那年姐姐把被收养的机会让给她，临别承诺总有一天重逢。1-4医院办公室：大学毕业后回旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片，最后一张漆黑照片上是绑满铁链的门写着“救我”，确信姐姐未死，决心潜入布莱克伍德家族救姐。1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”，带应聘文件与铁链门照片立誓“无论如何一定要救出姐姐”。1-5布莱克伍德庄园：穿职业装、抱厚简历、戴黑框眼镜与其他女应聘者站院中应聘，OS认出布拉姆是姐姐丈夫并推测其为攀附贵族藏起姐姐；众人退缩时主动站起递简历“教父，我愿意一试”，双手举简历鞠躬“我会用我的专业帮助小姐，请您给我这个机会”，被布拉姆打量说“你的长相让我想起了一位故人”时紧张握紧简历、OS“他难道知道我的身份”，松懈OS“只要留在这里，我就有机会挖掘真相了”。",
  "provenances": [
    {
      "sceneTitle": "1-5 日 外 布莱克伍德庄园",
      "paragraphIndices": [
        2,
        3,
        5,
        18,
        19,
        22,
        25,
        27,
        28,
        30
      ],
      "evidenceText": "▲庄园的门被打开……娜塔莉亚穿着职业装，抱着厚厚的简历，和其他女应聘者一起站在院子里面，她戴着一副黑框眼镜，打量着坐在主位的男人【布莱克伍德家主：布拉姆】。娜塔莉亚OS：他就是姐姐的丈夫布拉姆……娜塔莉亚（低头）OS：姐姐死后不久，他便迎娶了贵族之女……难道，是他为了攀附贵族，把姐姐藏起来了？▲众人胆怯后退，娜塔莉亚主动站了起来，递出了简历。娜塔莉亚：教父，我愿意一试！娜塔莉亚（双手举着简历）：我会用我的专业帮助小姐。（鞠躬）请您给我这个机会。▲娜塔莉亚缓缓抬头。▲娜塔莉亚紧张地握紧了简历。娜塔莉亚OS：他难道知道我的身份？娜塔莉亚（松懈）OS：只要留在这里，我就有机会挖掘真相了……"
    }
  ]
}
```
**工具输出 (Output)**：
```json
{
  "success": true,
  "type": "characters",
  "id": "char_1794137305183_eqhut_0",
  "item": {
    "id": "char_1794137305183_eqhut_0",
    "name": "娜塔莉亚",
    "role": "女主角/心理医生",
    "description": "女主角，心理医生，22岁。1-2医院办公室首次出场：坐在椅子上捏着照片、握着血书落泪，独白“等待多年的姐妹重逢，等来姐姐遗照”，得知姐姐玛莉死于布莱克伍德家，需带走外甥女。1-3贫民窟门口（幼年回忆）：8岁“小娜塔莉亚”，父母早逝，由13岁姐姐小玛莉捡废品养大，8岁那年姐姐把被收养的机会让给她，临别承诺总有一天重逢。1-4医院办公室：大学毕业后回旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片，最后一张漆黑照片上是绑满铁链的门写着“救我”，确信姐姐未死，决心潜入布莱克伍德家族救姐。1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”，带应聘文件与铁链门照片立誓“无论如何一定要救出姐姐”。1-5布莱克伍德庄园：穿职业装、抱厚简历、戴黑框眼镜与其他女应聘者站院中应聘，OS认出布拉姆是姐姐丈夫并推测其为攀附贵族藏起姐姐；众人退缩时主动站起递简历“教父，我愿意一试”，双手举简历鞠躬“我会用我的专业帮助小姐，请您给我这个机会”，被布拉姆打量说“你的长相让我想起了一位故人”时紧张握紧简历、OS“他难道知道我的身份”，松懈OS“只要留在这里，我就有机会挖掘真相了”。",
    "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
    "verifiedProvenance": [
      {
        "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
        "id": "vp_char_1794137305183_eqhut_0_para_5_547",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_731",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_853",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1022",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1077",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "evidenceText": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
        "anchorText": "莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1077,
        "lineNumber": 25
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_8_1348",
        "sceneId": "sc-16-679",
        "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
        "matchedTerm": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "evidenceText": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
        "anchorText": "n someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1348,
        "lineNumber": 26
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_1_1401",
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
        "id": "vp_char_1794137305183_eqhut_0_para_2_1422",
        "sceneId": "sc-27-1373",
        "sceneTitle": "第一集 1-4 日  内   医院办公室",
        "matchedTerm": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "evidenceText": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
        "anchorText": "泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后",
        "offsetInAnchor": 14,
        "fallbackCharIndex": 1422,
        "lineNumber": 32
      },
      {
        "id": "vp_char_1794137305183_eqhut_0_para_3_1636",
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
        "id": "vp_char_1794137305183_eqhut_0_para_6_1726",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_1741",
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
        "id": "vp_char_1794137305183_eqhut_0_para_1_1981",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_2306",
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
        "id": "vp_char_1794137305183_eqhut_0_para_4_2325",
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
        "id": "vp_char_1794137305183_eqhut_0_para_7_2617",
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
        "id": "vp_char_1794137305183_eqhut_0_para_8_2632",
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
        "id": "vp_char_1794137305183_eqhut_0_para_9_2660",
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
        "id": "vp_char_1794137305183_eqhut_0_para_2_2825",
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
        "id": "vp_char_1794137305183_eqhut_0_para_3_3031",
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
        "id": "vp_char_1794137305183_eqhut_0_para_5_3266",
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
        "id": "vp_char_1794137305183_eqhut_0_para_18_4354",
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
        "id": "vp_char_1794137305183_eqhut_0_para_19_4380",
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
        "id": "vp_char_1794137305183_eqhut_0_para_22_4525",
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
        "id": "vp_char_1794137305183_eqhut_0_para_25_4691",
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
        "id": "vp_char_1794137305183_eqhut_0_para_27_4807",
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
        "id": "vp_char_1794137305183_eqhut_0_para_28_4822",
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
        "id": "vp_char_1794137305183_eqhut_0_para_30_4944",
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
      "第一集 1-2 日  内   医院办公室",
      "第一集 1-3 贫民窟门口   日   外",
      "第一集 1-4 日  内   医院办公室",
      "第一集 1-5 日  内  娜塔莉亚家",
      "第一集 1-5 日 外 布莱克伍德庄园"
    ],
    "mode": "append"
  },
  "message": "成功更新资产 [娜塔莉亚]。"
}
```

---
## 第 26 轮（耗时：6642 ms (6.64 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, asset.list, asset.update, user.ask`

### [第 26 轮] 模型原始输出
```text
状态检查：
- 当前正在执行最后一步「全局核验资产清单满足目标并结案」。
- 本轮 asset.update 返回成功：description 已完整整合 1-2 至 1-5 各场设定，provenanceStatus=verified，sourceScenes 已包含全部 5 场（含 1-5 布莱克伍德庄园），出处覆盖已补齐。
- 关键事实：资产 ID char_1794137305183_eqhut_0，sourceScenes 现已覆盖 1-2、1-3、1-4、1-5 娜塔莉亚家、1-5 布莱克伍德庄园；description 完整。
- 计划最后一步尚需 asset.list 最终核验确认后结案。
- 下一步：调用 asset.list 核验娜塔莉亚资产状态。

思考：
update 返回的 item 显示 description 完整、sourceScenes 五场齐全，看起来已满足目标。但为遵守「严禁把未执行视为成功」，需实际调用 asset.list 读取落地结果确认。用 query 检索娜塔莉亚。

工具调用：
{{调用 asset.list, {"type": "characters", "query": "娜塔莉亚"}}}

用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的资产已经整合完毕，现在做最后的清单核验，确认她的出处覆盖第一集全部五场、设定描述完整无误，随后即可结案。”
- 对用户说的话（简版）：“娜塔莉亚的设定和出处已补齐，我正在做最后核验，稍等就能结案啦。”
}
```

### [第 26 轮] 工具调用记录（共 1 个）
#### 🛠️ 工具 1：`asset.list` (succeeded)
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
  "projectId": "proj_1793879628309",
  "source": "project",
  "type": "characters",
  "total": 1,
  "offset": 0,
  "items": [
    {
      "id": "char_1794137305183_eqhut_0",
      "name": "娜塔莉亚",
      "role": "女主角/心理医生",
      "description": "女主角，心理医生，22岁。1-2医院办公室首次出场：坐在椅子上捏着照片、握着血书落泪，独白“等待多年的姐妹重逢，等来姐姐遗照”，得知姐姐玛莉死于布莱克伍德家，需带走外甥女。1-3贫民窟门口（幼年回忆）：8岁“小娜塔莉亚”，父母早逝，由13岁姐姐小玛莉捡废品养大，8岁那年姐姐把被收养的机会让给她，临别承诺总有一天重逢。1-4医院办公室：大学毕业后回旧家寻找姐姐，只找到一沓记录玛莉遭受折磨的照片，最后一张漆黑照片上是绑满铁链的门写着“救我”，确信姐姐未死，决心潜入布莱克伍德家族救姐。1-5娜塔莉亚家：出发前收拾皮包，面对养父焦恩担忧，握其手坚定表示“有时候柔弱也能成为致命的武器”，带应聘文件与铁链门照片立誓“无论如何一定要救出姐姐”。1-5布莱克伍德庄园：穿职业装、抱厚简历、戴黑框眼镜与其他女应聘者站院中应聘，OS认出布拉姆是姐姐丈夫并推测其为攀附贵族藏起姐姐；众人退缩时主动站起递简历“教父，我愿意一试”，双手举简历鞠躬“我会用我的专业帮助小姐，请您给我这个机会”，被布拉姆打量说“你的长相让我想起了一位故人”时紧张握紧简历、OS“他难道知道我的身份”，松懈OS“只要留在这里，我就有机会挖掘真相了”。",
      "appearance": "22岁女性心理医生，职业装、黑框眼镜（详见1-5布莱克伍德庄园）；幼年8岁形态见1-3贫民窟。",
      "verifiedProvenance": [
        {
          "id": "vp_char_1794137305183_eqhut_0_para_2_193",
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
          "id": "vp_char_1794137305183_eqhut_0_para_4_526",
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
          "id": "vp_char_1794137305183_eqhut_0_para_5_547",
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
          "id": "vp_char_1794137305183_eqhut_0_para_1_731",
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
          "id": "vp_char_1794137305183_eqhut_0_para_3_853",
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
          "id": "vp_char_1794137305183_eqhut_0_para_6_1022",
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
          "id": "vp_char_1794137305183_eqhut_0_para_7_1077",
          "sceneId": "sc-16-679",
          "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
          "matchedTerm": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
          "evidenceText": "娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）",
          "anchorText": "莉亚伸出手想要抓住小玛莉。\n娜塔莉亚（悲痛）vo：父母早早离世，是姐姐捡废品将我养大的，八岁那年，姐姐把活命的机会让给了我，她说，总有一天我们会重逢的……（Our parents died when we were little. My sister raised me by scavenging scraps. When I was eight, she gave up her only chance at a real family to save me. She promised we'd find each other again someday...）\n▲小玛莉身影模糊，小娜塔莉",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1077,
          "lineNumber": 25
        },
        {
          "id": "vp_char_1794137305183_eqhut_0_para_8_1348",
          "sceneId": "sc-16-679",
          "sceneTitle": "第一集 1-3 贫民窟门口   日   外",
          "matchedTerm": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
          "evidenceText": "▲小玛莉身影模糊，小娜塔莉亚落泪。",
          "anchorText": "n someday...）\n▲小玛莉身影模糊，小娜塔莉亚落泪。\n【闪回结束】\n",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1348,
          "lineNumber": 26
        },
        {
          "id": "vp_char_1794137305183_eqhut_0_para_1_1401",
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
          "id": "vp_char_1794137305183_eqhut_0_para_2_1422",
          "sceneId": "sc-27-1373",
          "sceneTitle": "第一集 1-4 日  内   医院办公室",
          "matchedTerm": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
          "evidenceText": "娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）",
          "anchorText": "泪落在了血迹斑斑的照片上。\n娜塔莉亚vo：大学毕业后，我回到我们曾经的家，我没找到姐姐，只找到了这一沓记录她遭受折磨的照片！（After graduating college, I went back to our old home. But my sister was gone. All I found was this envelope... proof of the unimaginable torture she went through.）\n▲娜塔莉亚继续翻照片，最后",
          "offsetInAnchor": 14,
          "fallbackCharIndex": 1422,
          "lineNumber": 32
        },
        {
          "id": "vp_char_1794137305183_eqhut_0_para_3_1636",
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
          "id": "vp_char_1794137305183_eqhut_0_para_6_1726",
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
          "id": "vp_char_1794137305183_eqhut_0_para_7_1741",
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
          "id": "vp_char_1794137305183_eqhut_0_para_1_1981",
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
          "id": "vp_char_1794137305183_eqhut_0_para_3_2306",
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
          "id": "vp_char_1794137305183_eqhut_0_para_4_2325",
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
          "id": "vp_char_1794137305183_eqhut_0_para_7_2617",
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
          "id": "vp_char_1794137305183_eqhut_0_para_8_2632",
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
          "id": "vp_char_1794137305183_eqhut_0_para_9_2660",
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
          "id": "vp_char_1794137305183_eqhut_0_para_2_2825",
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
          "id": "vp_char_1794137305183_eqhut_0_para_3_3031",
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
          "id": "vp_char_1794137305183_eqhut_0_para_5_3266",
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
          "id": "vp_char_1794137305183_eqhut_0_para_18_4354",
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
          "id": "vp_char_1794137305183_eqhut_0_para_19_4380",
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
          "id": "vp_char_1794137305183_eqhut_0_para_22_4525",
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
          "id": "vp_char_1794137305183_eqhut_0_para_25_4691",
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
          "id": "vp_char_1794137305183_eqhut_0_para_27_4807",
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
          "id": "vp_char_1794137305183_eqhut_0_para_28_4822",
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
          "id": "vp_char_1794137305183_eqhut_0_para_30_4944",
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
        "第一集 1-2 日  内   医院办公室",
        "第一集 1-3 贫民窟门口   日   外",
        "第一集 1-4 日  内   医院办公室",
        "第一集 1-5 日  内  娜塔莉亚家",
        "第一集 1-5 日 外 布莱克伍德庄园"
      ],
      "mode": "append"
    }
  ],
  "nextOffset": null
}
```

---
## 第 27 轮（耗时：6559 ms (6.56 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `1 级` · 注入工具 (4)：`sys.selectContext, asset.list, asset.update, user.ask`

### [第 27 轮] 模型原始输出
```text
状态检查：
- 当前计划全部步骤均已完成（全部标记[x]）。
- 本轮 asset.list 返回娜塔莉亚资产详情：description 完整涵盖1-2至1-5各场设定，sourceScenes 已覆盖1-2、1-3、1-4、1-5娜塔莉亚家、1-5布莱克伍德庄园全部五场，provenanceStatus=verified，出处覆盖完整。
- 未发现新的缺失，资产状态满足提取目标。
- 下一步：当前计划所有步骤已完成，调用 sys.selectContext 返回全局计划阶段结案。

思考：
asset.list 结果确证 description 完整（1-2至1-5全含）、sourceScenes 五场全覆盖、provenanceStatus 为 verified，无遗漏。当前计划无未完成步骤，应无参调用 sys.selectContext 返回全局计划阶段进行验收结案。

工具调用：
{{调用 sys.selectContext}}

用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的资产已经整理好了。第一集里她出现在医院办公室、贫民窟回忆、旧家找线索、家里出发、布莱克伍德庄园应聘这几场，身份设定、幼年经历、外貌（职业装+黑框眼镜）和各场台词动作出处都完整入库，五场全覆盖、核验通过，可以结案啦。”
- 对用户说的话（简版）：“娜塔莉亚资产五场出处全覆盖、设定完整，核验通过，已结案～”
}
```

### [第 27 轮] 工具调用记录（共 1 个）
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
## 第 28 轮（耗时：7512 ms (7.51 s)）
- **运行上下文**：模型 `deepseek-flash` · 思考层级 `0 级` · 注入工具 (3)：`sys.selectContext, sys.endTask, user.ask`

### [第 28 轮] 模型原始输出
```text
状态检查：
- 最终目标：从剧本第一集中提取角色“娜塔莉亚”的资产信息，纳入资产清单面板并完成全局验收结案。
- 当前计划核验：
  [x] 探查剧本目录结构（已完成：6场66段）
  [x] 核查资产库无娜塔莉亚并创建角色资产（ID: char_1794137305183_eqhut_0）
  [x] 1-2医院办公室出处追加（段落2、4、5）
  [x] 1-3贫民窟门口幼年出处追加（段落1、3、6、7、8）
  [x] 1-4医院办公室出处追加（段落1、2、3、6、7）
  [x] 1-5娜塔莉亚家出处追加（段落1、3、4、7、8、9）
  [x] 1-5布莱克伍德庄园段落核准并追加出处（2、3、5、18、19、22、25、27、28、30）
  [x] 整合完整 description 并全局核验（asset.list 确认 sourceScenes 覆盖全部五场、description 完整、provenanceStatus=verified）
- 全部计划步骤已达成，验收通过。

思考：
最后一轮 asset.list 结果非常干净：total=1，仅娜塔莉亚一个角色资产，sourceScenes 完整覆盖 1-2、1-3、1-4、1-5娜塔莉亚家、1-5布莱克伍德庄园全部五场，provenanceStatus=verified，description 完整保留各场设定，appearance 也已填写。所有出处段落都与正文说话人归属核对一致，没有把布拉姆/管家/塞莱特斯的段落误归入。计划全部完成，可以结案。无需再装载写入工具。

工具调用：
{{调用 sys.endTask, {"success": true}}}

用户沟通：
{
- 对用户说的话（完整版）：“娜塔莉亚的资产提取已经全部完成啦～我在第一集里查到她出现在五场戏：1-2医院办公室、1-3贫民窟门口（8岁幼年回忆）、1-4医院办公室、1-5娜塔莉亚家、1-5布莱克伍德庄园。已经为她建立了角色资产（女主角/心理医生，22岁），把每场的出场段落都作为出处锚定进去了，人物小传也整合完整：心理医生身份、姐姐玛莉与养父焦恩的关系、幼年被送养的往事、寻姐立誓、到庄园应聘被布拉姆说‘长得像故人’等关键设定都涵盖到了。出处核验状态为 verified，五场全覆盖。资产清单面板现在角色数为 2。这个任务我就先结案啦，后续要给她生图或做视频随时喊我～”
- 对用户说的话（简版）：“娜塔莉亚资产提取完成，五场出处全部核验通过，已结案～”
}
```

### [第 28 轮] 工具调用记录（共 1 个）
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
