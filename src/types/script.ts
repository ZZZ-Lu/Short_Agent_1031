export type ProvenanceStatus = 'unverified' | 'verifying' | 'verified' | 'stale';

export type ScriptAnnotationCategory = 'character' | 'location' | 'prop' | 'provenance' | 'search';

export interface ScriptAnnotation {
  id: string;
  from: number;
  to: number;
  category: ScriptAnnotationCategory;
  name?: string;
  badgeText?: string;
  badgeTooltip?: string;
  colorVariant?: 'blue' | 'purple' | 'amber' | 'emerald' | 'gray';
  active?: boolean;
  onClick?: () => void;
  meta?: Record<string, unknown>;
}

export interface VerifiedProvenanceAnchor {
  id: string;                 // 唯一锚点 ID，如 "vp_ep13_0"
  sceneId?: string;           // 关联的分集/场次 ID
  sceneTitle: string;         // 所属集/场标题，如 "第13集"
  matchedTerm: string;        // 正文中实际命中的词（原名或别名，如"钥匙"）
  anchorText: string;         // 命中的上下文指纹短语（前后各约12~16字）
  offsetInAnchor: number;     // matchedTerm 在 anchorText 内的起始偏移量
  fallbackCharIndex?: number; // 核验时刻的原始字符偏移（兜底用）
  lineNumber?: number;        // 核验时刻的行号
}

export interface ScriptAssetVersion {
  id: string;
  name: string; // 版本名称（如 "日景"、"夜景"、"常服版"、"晚礼服版"）
  description?: string; // 资产版本识别浅色描述（首次出场、服装/光影/状态区分特征）
  role?: string;
  appearance?: string;
  personality?: string;
  performanceNotes?: string;
  type?: 'INT' | 'EXT';
  timeOfDay?: string;
  atmosphere?: string;
  visualDetails?: string;
  owner?: string;
  materialAndState?: string;
  storySignificance?: string;
  aliases?: string[];
  sourceScenes?: string[];
  provenanceStatus?: ProvenanceStatus;
  verifiedProvenance?: VerifiedProvenanceAnchor[];
  verifiedScriptHash?: string;
  referenceImage?: string;
}

export interface ScriptCharacter {
  id: string;
  name: string;
  description?: string; // 资产识别浅色描述（首次出场、核心身份关系、多服装版本说明等防混淆信息）
  role: string; // 身份 / 角色设定
  age?: string;
  gender?: string;
  appearance: string; // 外貌与衣着特征
  personality?: string; // 性格与心理特征
  props?: string[]; // 随身道具 / 关联道具
  performanceNotes: string; // 镜头表演/情绪重点
  aliases?: string[]; // 别名或代称
  sourceScenes?: string[]; // 出现场次，如 ["第1场", "第3场"]
  provenanceStatus?: ProvenanceStatus;
  verifiedProvenance?: VerifiedProvenanceAnchor[];
  verifiedScriptHash?: string;
  referenceImage?: string; // 已生成的参考图
  versions?: ScriptAssetVersion[]; // 多服装/造型版本二级列表
}

export interface ScriptLocation {
  id: string;
  name: string;
  description?: string; // 资产识别浅色描述（首次出场、空间归属、日夜景区分等防混淆信息）
  type: 'INT' | 'EXT'; // 内景 / 外景
  timeOfDay: string; // 时间氛围（如 雨夜、黄昏）
  atmosphere: string; // 氛围与光影影调
  visualDetails: string; // 空间建筑与材质细节
  aliases?: string[]; // 场景简称或别名
  sourceScenes?: string[];
  provenanceStatus?: ProvenanceStatus;
  verifiedProvenance?: VerifiedProvenanceAnchor[];
  verifiedScriptHash?: string;
  referenceImage?: string;
  versions?: ScriptAssetVersion[]; // 日景/夜景等多光影状态版本二级列表
}

export interface ScriptProp {
  id: string;
  name: string;
  description?: string; // 资产识别浅色描述（首次出场、所属人、与相似道具的区分特征等防混淆信息）
  owner?: string; // 所属角色
  materialAndState: string; // 材质与物理状态
  storySignificance: string; // 剧情关键与特写表现
  aliases?: string[]; // 道具简称或别名（如 "钥匙"、"金钥匙"）
  sourceScenes?: string[];
  provenanceStatus?: ProvenanceStatus;
  verifiedProvenance?: VerifiedProvenanceAnchor[];
  verifiedScriptHash?: string;
  referenceImage?: string;
  versions?: ScriptAssetVersion[]; // 多状态版本二级列表
}

export interface ScriptParagraph {
  index: number;      // 场次内 1-based 连续段落序号（换行即为下一段落，没有换行就是一个段落）
  lineNumber: number; // 对应原剧本 1-based 行号
  text: string;       // 段落原文（单行无换行）
}

export interface SceneChunk {
  index: number;
  id?: string;
  episodeId?: string;
  episodeTitle?: string;
  sceneNumber?: string;
  title: string;
  type?: 'INT' | 'EXT' | 'MIXED';
  locationName?: string;
  timeOfDay?: string;
  characterNames?: string[];
  startLine?: number;
  endLine?: number;
  charIndex?: number;
  endCharIndex?: number;
  rawText: string;
  paragraphCount?: number;
  paragraphs?: ScriptParagraph[];
}

export interface ScriptTocConfig {
  tocPattern?: string;
  scenePattern?: string;
  flags?: string;
  patterns?: string[];
}

export type ExtractionModelType = 
  | 'auto' 
  | 'deepseek-flash'
  | 'deepseek-v4-flash' 
  | 'deepseek-v4-flash-low'
  | 'deepseek-v4-flash-high'
  | 'deepseek-v4-pro' 
  | 'deepseek-v4.1-flash-expires-on-0910'
  | 'qwen3.8-flash'
  | 'qwen3-vl-plus'
  | 'qwen-vl-plus'
  | 'doubao-seed-2-1-pro-260915'
  | 'doubao-seed-2.1-pro'
  | 'doubao-seed-2-1-pro'
  | 'glm-5.3-flash'
  | 'glm-5.3-flash-low'
  | 'glm-5.3-flash-high'
  | 'glm-5.3-flash-max'
  | 'ZHIPU/GLM-5.3-Flash'
  | 'ZHIPU/GLM-5.3-Flash-low'
  | 'ZHIPU/GLM-5.3-Flash-high'
  | 'ZHIPU/GLM-5.3-Flash-max'
  | 'deepseek'
  | 'heuristic';

export interface NodeModelConfig {
  agentModel: ExtractionModelType;
  tocInferModel: ExtractionModelType;
  changeAssessModel: ExtractionModelType;
  jsonAdapterModel?: ExtractionModelType;
  subjectLandmarksModel?: ExtractionModelType;
}

export const DEFAULT_NODE_MODELS: NodeModelConfig = {
  agentModel: 'deepseek-v4-flash',
  tocInferModel: 'deepseek-v4-flash',
  changeAssessModel: 'deepseek-v4-flash',
  jsonAdapterModel: 'deepseek-v4-flash',
  subjectLandmarksModel: 'deepseek-v4-flash'
};

export interface NodePromptConfig {
  tocInferSystemPrompt: string;
  changeAssessSystemPrompt: string;
  stateNodePrompt?: string;
  jsonAdapterPrompt?: string;
  subjectLandmarksPrompt?: string;
}

export { CODE_PIPELINE_PROMPTS as DEFAULT_NODE_PROMPTS } from '../constants/prompts';

export interface AssetPipelineOptions {
  modelType?: ExtractionModelType;
  nodeModels?: Partial<NodeModelConfig>;
  deepseekKey?: string;
  customPrompts?: Partial<NodePromptConfig>;
}

export interface ScriptUniverse {
  era: string; // 时代背景
  artStyle: string; // 画面艺术风格
  colorTone: string; // 影调与色彩系统
  cinematography: string; // 摄影机与镜头规范
  colorHexes?: string[]; // 主色卡
}

export interface ScriptProject {
  id: string;
  name: string;
  logline: string; // 一句话剧情梗概
  createdAt: number;
  updatedAt: number;
  scriptText: string;
  universe: ScriptUniverse;
  tocConfig?: ScriptTocConfig; // 持久化的目录与分场识别正则配置
  scenes?: SceneChunk[]; // 另存的智能分场切片信息
  characters: ScriptCharacter[];
  locations: ScriptLocation[];
  props: ScriptProp[];
  bible?: {
    characters?: ScriptCharacter[];
    locations?: ScriptLocation[];
    props?: ScriptProp[];
  };
  // NEW: Scene-based backend storage
  sceneItems?: SceneItem[]; // Strict scene separation
  activeMilestoneId?: string;
}

export type SceneChangeType = 
  | 'unmodified'  // 未修改
  | 'modified'    // 内部改动
  | 'added'       // 新增场次
  | 'deleted'     // 删除场次
  | 'renumbered'; // 仅编号顺延

export interface SceneDiffItem {
  sceneId: string;              
  changeType: SceneChangeType;
  oldIndex?: number;            
  newIndex?: number;            
  oldTitle?: string;
  newTitle?: string;
  lineRange: { start: number; end: number }; 
  charRange: { start: number; end: number }; 
  diffSummary: {
    addedLinesCount: number;
    deletedLinesCount: number;
    textDeltaPreview?: string;  
  };
}

export interface ScriptDiffResult {
  baselineVersionId: string;
  isDirty: boolean;
  totalScenesOld: number;
  totalScenesNew: number;
  changedScenesCount: number;
  details: SceneDiffItem[];
  timestamp: number;
}

export interface SceneItem {
  id: string;                 
  orderIndex: number;         
  heading: string;            
  content: string;            
  contentHash: string;        
  updatedAt: number;          
  versionCount: number;       
}

export interface ScriptMilestone {
  id: string;
  projectId: string;
  timestamp: number;
  name: string;
  description: string;
  sceneItems: SceneItem[];
}

export const DEFAULT_SCRIPT_TEXT = '';

export const EMPTY_PROJECT: ScriptProject = {
  id: 'proj_genshin',
  name: '原神',
  logline: '提瓦特大陆的奇幻冒险与元素物语',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  scriptText: '【第一场：风起之地 · 傍晚】\n夕阳西下，巨大的风起之树伫立于平原之上。风元素微粒在树冠间闪烁。旅行者与派蒙停下脚步，仰望浩瀚的天空。',
  universe: {
    era: '提瓦特幻想时代',
    artStyle: '二次元日系奇幻动漫风',
    colorTone: '通透高饱满发光色调，幻想二次元影调',
    cinematography: '动漫风宽银幕（16:9），大远景与元素特写',
    colorHexes: ['#38bdf8', '#818cf8', '#a7f3d0', '#fef08a']
  },
  scenes: [
    {
      index: 1,
      title: '第一场：风起之地 · 傍晚',
      type: 'EXT',
      locationName: '风起之地',
      timeOfDay: '傍晚',
      characterNames: ['旅行者', '派蒙'],
      rawText: '夕阳西下，巨大的风起之树伫立于平原之上。风元素微粒在树冠间闪烁。旅行者与派蒙停下脚步，仰望浩瀚的天空。'
    }
  ],
  characters: [
    {
      id: 'char_1',
      name: '旅行者',
      role: '主角 / 降临者',
      appearance: '金发少女/少年，身穿异世旅人披风与金属铠甲饰品，金黄色双眸',
      personality: '勇敢、沉稳、充满好奇心',
      performanceNotes: '神情坚定，手持单手剑',
      aliases: ['荧', '空']
    },
    {
      id: 'char_2',
      name: '派蒙',
      role: '向导 / 最佳伙伴',
      appearance: '身材小巧的飞行同伴，白发戴着星空发卡，身穿白色连衣短裙与小斗篷',
      personality: '活泼、贪吃、有些小傲娇',
      performanceNotes: '悬浮在空中，表情丰富动作夸张',
      aliases: ['应急食品']
    }
  ],
  locations: [
    {
      id: 'loc_1',
      name: '风起之地',
      type: 'EXT',
      timeOfDay: '黄昏/傍晚',
      atmosphere: '宁静祥和，风元素微粒飘荡',
      visualDetails: '巨大参天的七天神像大树，翠绿的草甸，温和的落日余晖'
    }
  ],
  props: [
    {
      id: 'prop_1',
      name: '风元素神之眼',
      materialAndState: '发光的晶莹宝石与青铜饰质底座',
      storySignificance: '引导元素力的核心道具'
    }
  ]
};

export const DEFAULT_PROJECT: ScriptProject = EMPTY_PROJECT;
