export interface AgentExperiencePlaybook {
  id: string;
  title: string;
  taskTypes: string[];
  keywords: string[];
  summary: string;
  steps: {
    gatherInfo: string;
    makePlan: string;
    execute: string;
    verify: string;
  };
}

export const AGENT_EXPERIENCE_PLAYBOOKS: AgentExperiencePlaybook[] = [
  {
    id: 'script_asset_extraction',
    title: '剧本角色/场景/道具资产提取与多版本建档经验',
    taskTypes: ['提取角色', '提取场景', '提取道具', '资产建档', '剧本拆解提取'],
    keywords: [
      '提取', '角色', '人物', '场景', '道具', '资产', '建档', '创建资产',
      '造型', '版本', '出处', '剧本', 'character', 'scene', 'prop', 'asset',
    ],
    summary: '适用于从指定剧本集数或场次中提取角色、场景、道具资产卡片，完整收录各造型/状态版本与真实画面出处。',
    steps: {
      gatherInfo:
        '首次展开 ["script", "asset"] 分类后，装载并同轮并发调用 script.directory（传目标集数）、script.search（必填目标集数 episode 与实体名称 query）及 asset.list（查重），一次性拿齐场次字数分布、各场人物表、正文中所有命中段落切片及现有资产状态。',
      makePlan:
        '（成败关键）在制定分批计划前，必须先通读探查返回的数据完成以下 3 项设计：\n' +
        '  1. 预判完整造型/状态演进清单：对照 script.directory 各场人物表（是否标注了不同年龄/时期）与 script.search 返回的各场 matches 原文切片（是否描写了新的服装穿搭、职业装束、标志性配饰/眼镜、场景日夜切换或道具形态改变），先在思考与重点笔记中梳理出目标实体在本集中的全部造型/状态清单；\n' +
        '  2. 大场次独立成批：小场次可合并（单批总字数 ≤ 2500 字），但单场正文字数接近或超过 1800 字（或段落数 ≥ 25 段）的重头戏场次必须单独拆为独立批次，避免多场混读导致新造型或出处漏判；\n' +
        '  3. 将具体造型版本动作直接写进计划步骤标题：每个批次步骤不仅要写明唯一场次 ID（sceneId），还必须把步骤 1 预判出的版本动作显式锚定在步骤标题中（例如：“[ ] 1. 读取 scene-A、scene-B，核验出处并调用 asset.create 创建主卡（初始默认造型）并同步建立「[某年龄/时期]」版本”；“[ ] 2. 读取 scene-C（单大场独立成批），核验出处并调用 asset.update 在 versions 中新增「[某场合新服装造型]」版本并绑定该场出处”），不写笼统的“增量追加出处”。',
      execute:
        '成套装载 ["script.read", "asset.create", "asset.update"] 切入执行阶段：\n' +
        '  1. 首批建主卡克制原则：调用 asset.create 时，顶层 appearance 仅客观记录当前已精读场次中明确写出的初始体貌与状态（未写具体服饰时保持基础特征描述，不提前透支未读场次的服装）；若首批已读场次包含另一年龄/造型，同步在 versions 数组中传入；\n' +
        '  2. 后续批次严格兑现新版本建档：每批调用 script.read 精读全文后，严格按工具规则逐段摘录中文原文核验出处；若该场次原文出现了前序批次未建立的新服装穿搭、标志性配饰、年龄阶段、场景日夜或道具形态变化，调用 asset.update 时必须通过 versions 数组传入新版本对象并将该场 provenances 绑定在新版本下。',
      verify:
        'asset.create 与 asset.update 落盘返回即为最终真值；所有批次均完成落盘后调用 sys.selectContext 返回全局计划阶段，核对累计出处条数、覆盖场次及各造型版本均已落盘后，直接调用 sys.endTask 结案汇报（无需额外装载 asset.list 重复回查）。',
    },
  },
  {
    id: 'asset_provenance_verification',
    title: '已有资产卡片出处核验与修订经验',
    taskTypes: ['核验出处', '补充出处', '修订资产出处', '清洗错误出处'],
    keywords: [
      '出处', '核验', '核对', '补充', '修订', '检查出处', 'provenance', 'commitProvenance',
    ],
    summary: '适用于对已存在的资产卡片进行单集或跨集画面出处核验、补充遗漏出处或剔除未出场段落。',
    steps: {
      gatherInfo:
        '展开 ["script", "asset"] 分类，装载并并发调用 script.directory、script.search（必填目标集数 episode 与实体名称 query）与 asset.list（若目标卡片已在当前聚焦目标中可免调 asset.list），锁定目标实体涉及的全部场次 ID 与字数规模。',
      makePlan:
        '对照探查到的命中场次 charCount 与 matches 切片，按单批 ≤ 2500 字（接近或超过 1800 字的大场次独立成批）拆解为“读取指定 sceneId + 逐段核验并调用 asset.commitProvenance（或需同步补充造型版本时调用 asset.update）落盘”的读写闭环批次列表。',
      execute:
        '成套装载 ["script.read", "asset.commitProvenance", "asset.update"]，按批次精读场次全文，在思考区严格按工具规定的逐段中文原文核验模板判定是否必须入画，随读随写完成每一批出处落盘。',
      verify:
        '全部批次落盘后返回全局计划阶段，核对各场次有效出处段落与造型版本归属均已准确同步，直接调用 sys.endTask 结案。',
    },
  },
  {
    id: 'canvas_card_generation',
    title: '画布卡片生图、参考图挂载与复刻衍生经验',
    taskTypes: ['生成图片', '复刻卡片', '垫图生成', '修改提示词重绘', '挂载参考图'],
    keywords: [
      '生图', '生成', '图片', '画面', '复刻', '衍生', '参考图', '垫图', '重绘',
      '提示词', '比例', '分镜', 'generate', 'duplicate', 'reference', 'card',
    ],
    summary: '适用于在画布上创建、复刻、连接参考图或触发卡片 AI 生图/视频生成任务。',
    steps: {
      gatherInfo:
        '若目标卡片已在“当前聚焦目标”中且信息完整，无需额外探查；若涉及画布其他未聚焦卡片或需查找参考图卡片，先展开 ["card", "canvas"] 装载 card.query 或 canvas.Inspect 摸清目标卡片 ID 与连接关系。',
      makePlan:
        '明确规划卡片操作序列（如：[ ] 1. 复刻/创建目标卡片并配置提示词与参考图连接；[ ] 2. 触发生成并核验落盘状态），将需要串联执行的卡片工具规划在一次切入中完成。',
      execute:
        '一次性成套装载所需卡片工具（如 card.duplicate、card.updatePrompt、card.connectReference、card.generate 等），严格使用真实卡片 ID 执行操作。',
      verify:
        '核对工具返回的卡片最新状态、连接关系或生成结果无误后，返回全局计划阶段调用 sys.endTask 结案。',
    },
  },
  {
    id: 'card_spatial_landmarks',
    title: '卡片画面元素空间定位与局部语义标注经验',
    taskTypes: ['画面标注', '空间锚点', '局部定位', '鱼骨图分析', '视觉落点标记'],
    keywords: [
      '锚点', '空间', '定位', '标注', '标记', '鱼骨', '落点', '位置', 'landmark', 'annotate',
    ],
    summary: '适用于对图片卡片画面中的特定主体、道具或局部区域进行视觉空间定位与锚点标注。',
    steps: {
      gatherInfo:
        '确认当前聚焦卡片已包含有效图片；若需操作其他卡片，先通过 card.query 获取目标卡片 ID。',
      makePlan:
        '规划标注步骤（[ ] 1. 装载并调用 card.annotateLandmarks 传入待定位的目标语义标签列表完成视觉定位落盘；[ ] 2. 核验返回的归一化坐标点位并结案）。',
      execute:
        '展开 ["card"] 并装载 card.annotateLandmarks，传入清晰的 labels 数组执行视觉定位，工具返回即自动持久化至卡片。',
      verify:
        '核对返回的 landmarks 坐标与标签完整无误后，返回全局计划阶段调用 sys.endTask 结案。',
    },
  },
];

export interface ExperienceSearchResult {
  query: string;
  matchedCount: number;
  experiences: AgentExperiencePlaybook[];
}

export function searchExperiences(query?: string): ExperienceSearchResult {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) {
    return {
      query: '',
      matchedCount: AGENT_EXPERIENCE_PLAYBOOKS.length,
      experiences: AGENT_EXPERIENCE_PLAYBOOKS,
    };
  }

  const scored = AGENT_EXPERIENCE_PLAYBOOKS.map(playbook => {
    let score = 0;
    if (playbook.id.toLowerCase().includes(normalizedQuery)) score += 5;
    if (playbook.title.toLowerCase().includes(normalizedQuery)) score += 4;
    for (const taskType of playbook.taskTypes) {
      if (normalizedQuery.includes(taskType.toLowerCase()) || taskType.toLowerCase().includes(normalizedQuery)) {
        score += 4;
      }
    }
    for (const kw of playbook.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    return { playbook, score };
  })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const matched =
    scored.length > 0
      ? scored.map(item => item.playbook)
      : [AGENT_EXPERIENCE_PLAYBOOKS[0]];

  return {
    query: String(query || '').trim(),
    matchedCount: matched.length,
    experiences: matched.slice(0, 2),
  };
}

export function formatExperiencePlaybookForPrompt(result: ExperienceSearchResult): string {
  if (!result || !Array.isArray(result.experiences) || result.experiences.length === 0) {
    return '未匹配到特定任务经验，请按通用四步走规范（搜集足够的信息 → 制定足够清晰的计划 → 实施 → 验收）执行。';
  }
  const blocks = result.experiences.map(exp => [
    `【同类任务最佳实践经验：${exp.title}】`,
    `- 适用场景：${exp.summary}`,
    `- 第一步（搜集足够的信息）：${exp.steps.gatherInfo}`,
    `- 第二步（制定足够清晰的计划）：\n${exp.steps.makePlan}`,
    `- 第三步（实施）：\n${exp.steps.execute}`,
    `- 第四步（验收）：${exp.steps.verify}`,
  ].join('\n'));
  return blocks.join('\n\n');
}
