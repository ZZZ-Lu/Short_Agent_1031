import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import dotenv from "dotenv";
import { AGENT_TOOL_REGISTRY } from './src/agent/toolRegistry';
import { initialAgentContext, PROMPT_MODULES, TOOL_CATEGORIES, resolveContext, CONTROL_TOOLS, cleanToolOutputForPrompt, mergeTaskNotes, type AgentContextSelection } from './src/agent/contextPolicy';
import { mcpRouter } from './src/server/mcpRouter';
import { autoCloseJsonString, robustParseJson } from './src/utils/jsonParser';
dotenv.config();
const defaultPromptFilePath = path.join(process.cwd(), "src/agent/systemPrompt.txt");
const defaultExecutionPromptFilePath = path.join(process.cwd(), "src/agent/systemPromptExecution.txt");
const defaultStatePromptFilePath = path.join(process.cwd(), "src/agent/stateNodePrompt.txt");
const defaultLandmarksPromptFilePath = path.join(process.cwd(), "src/agent/subjectLandmarksPrompt.txt");
const defaultJsonAdapterPromptFilePath = path.join(process.cwd(), "src/agent/jsonAdapterPrompt.txt");
const customPromptDir = path.join(process.cwd(), ".data");
const userSavedPromptsFilePath = path.join(customPromptDir, "user_saved_prompts.json");
const legacyCustomPromptFilePath = path.join(customPromptDir, "systemPrompt.txt");

type ManagedPromptType = 'main' | 'mainExecution' | 'state' | 'landmarks' | 'jsonAdapter';

interface SavedPromptEntry {
  prompt: string;
  updatedAt: number;
}

function getDefaultPromptPath(type: ManagedPromptType): string {
  return type === 'mainExecution'
    ? defaultExecutionPromptFilePath
    : type === 'state'
    ? defaultStatePromptFilePath
    : type === 'landmarks'
    ? defaultLandmarksPromptFilePath
    : type === 'jsonAdapter'
    ? defaultJsonAdapterPromptFilePath
    : defaultPromptFilePath;
}

function isObsoleteMainPrompt(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  return (
    text.includes('0 级负责宏观规划与架构分解') ||
    text.includes('即将传入的 description') ||
    text.includes('严格遵循“主体归属原则”区分资产设定简介') ||
    text.includes('当写入或修改类工具已返回完整执行结果与成功状态时') ||
    text.includes('专注解决“当前小目标”，并在该小目标完成后返回全局计划阶段') ||
    text.includes('若需调用业务工具推进下一步小目标，按两步准备工具') ||
    text.includes('3. 提取第1-3场幼年回忆并增量更新资产出处') ||
    text.includes('严禁将他人的台词/动作、纯画外音（vo）或纯心理活动（OS）') ||
    text.includes('随读随写增量闭环（严禁全读完再单次囤积写入）') ||
    text.includes('优先采用场次数组批量读取与一次性齐套建卡') ||
    text.includes('批量读取与齐套写入（最短路径闭环）') ||
    text.includes('逐条显式列出') ||
    text.includes('按序号逐条显式列出') ||
    text.includes('核对参数依据是否完整就绪，确定本轮要调用的工具与具体参数') ||
    text.includes('严禁跳段') ||
    text.includes('若该资产在当前画面中有明确可见的自身动作') ||
    text.includes('提取出处时须自上而下逐段核对剧本原文') ||
    text.includes('如果资产可能在画面中呈现出来') ||
    text.includes('出处（provenances）判定规则：') ||
    text.includes('核对参数依据与场次段落是否完整就绪，确定本轮要调用的工具与具体参数') ||
    text.includes('参数纯净与多版本规范：') ||
    text.includes('提取资产前必须先调用 script.read 读取目标场次的完整剧本正文')
  );
}

function readUserSavedPrompts(): Partial<Record<ManagedPromptType, SavedPromptEntry>> {
  try {
    // Clean up legacy tracked .data/systemPrompt.txt if present so it never overrides newer prompts
    if (fs.existsSync(legacyCustomPromptFilePath)) {
      try { fs.unlinkSync(legacyCustomPromptFilePath); } catch {}
    }
    if (!fs.existsSync(userSavedPromptsFilePath)) return {};
    const raw = fs.readFileSync(userSavedPromptsFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    let mutated = false;
    if (parsed.main && isObsoleteMainPrompt(parsed.main.prompt)) {
      delete parsed.main;
      mutated = true;
    }
    if (parsed.mainExecution && isObsoleteMainPrompt(parsed.mainExecution.prompt)) {
      delete parsed.mainExecution;
      mutated = true;
    }
    if (mutated) {
      try {
        fs.writeFileSync(userSavedPromptsFilePath, JSON.stringify(parsed, null, 2), "utf-8");
      } catch {}
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeUserSavedPrompt(type: ManagedPromptType, prompt: string, updatedAt = Date.now()): number {
  const defaultPath = getDefaultPromptPath(type);
  if (fs.existsSync(path.dirname(defaultPath))) {
    fs.writeFileSync(defaultPath, prompt, "utf-8");
  }
  if (!fs.existsSync(customPromptDir)) {
    fs.mkdirSync(customPromptDir, { recursive: true });
  }
  const existing = readUserSavedPrompts();
  existing[type] = { prompt, updatedAt };
  fs.writeFileSync(userSavedPromptsFilePath, JSON.stringify(existing, null, 2), "utf-8");
  return updatedAt;
}

function getPromptWithMeta(type: ManagedPromptType = 'main'): { prompt: string; updatedAt: number; source: 'user_saved' | 'default' } {
  try {
    const defaultPath = getDefaultPromptPath(type);
    const savedMap = readUserSavedPrompts();
    const savedEntry = savedMap[type];
    if (savedEntry && typeof savedEntry.prompt === 'string' && savedEntry.prompt.trim().length > 0) {
      // Auto-heal src/agent/*.txt if an AI Studio container snapshot sync reverted the tracked file
      try {
        if (fs.existsSync(defaultPath)) {
          const currentDefault = fs.readFileSync(defaultPath, "utf-8");
          if (currentDefault !== savedEntry.prompt) {
            fs.writeFileSync(defaultPath, savedEntry.prompt, "utf-8");
          }
        }
      } catch {}
      return {
        prompt: savedEntry.prompt,
        updatedAt: typeof savedEntry.updatedAt === 'number' ? savedEntry.updatedAt : Date.now(),
        source: 'user_saved',
      };
    }
    if (fs.existsSync(defaultPath)) {
      return {
        prompt: fs.readFileSync(defaultPath, "utf-8"),
        updatedAt: 0,
        source: 'default',
      };
    }
    return { prompt: "", updatedAt: 0, source: 'default' };
  } catch {
    return { prompt: "", updatedAt: 0, source: 'default' };
  }
}

function getPrompt(type: ManagedPromptType = 'main') {
  return getPromptWithMeta(type).prompt;
}

function getSystemPrompt() {
  return getPrompt('main');
}

const functionNameForTool = (toolId: string) => toolId.replaceAll('.', '_');

const parametersForTool = (toolId: string) => {
  const target = { type: 'string', description: '来自最近一次 page.inspect 的 visible components 的 targetId。' };
  const observationProperties = { scope: { type: 'string', description: 'overview 返回主要入口概览（默认，剧本正文不直接展开注入）；填可见组件 ID（如 "script.text"）申请查看该区域的可见内容。' }, offset: { type: 'integer', minimum: 0, description: '同一可见区域的返回分页偏移，不会滚动页面。' }, limit: { type: 'integer', minimum: 1, maximum: 100 } };
  const schemas: Record<string, { properties: Record<string, unknown>; required?: string[] }> = {
    'sys.selectContext': { properties: { level: { type: 'integer', enum: [0, 1] }, tools: { type: 'array', items: { type: 'string' } }, prompts: { type: 'array', items: { type: 'string' } } }, required: ['level', 'tools', 'prompts'] },
    'script.directory': { properties: { query: { type: 'string' }, offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: 200 } } },
    'script.read': {
      properties: {
        episode: { type: 'string', description: '可选，按分集筛选读取（如 "第一集"、"1"）' },
        scene: { type: 'string', description: '可选，按场次筛选读取（如 "1-2"、"1-5" 或场次序号）' },
        paragraph: { type: 'integer', minimum: 1, description: '可选，按场内 1-based 段落序号筛选读取' },
        startParagraph: { type: 'integer', minimum: 1, description: '可选，场内 1-based 起始段落序号（含）' },
        endParagraph: { type: 'integer', minimum: 1, description: '可选，场内 1-based 结束段落序号（含）' },
        startLine: { type: 'integer', minimum: 1, description: '可选，按剧本 1-based 起始行号筛选（含）' },
        endLine: { type: 'integer', minimum: 1, description: '可选，按剧本 1-based 结束行号筛选（含）' },
        offset: { type: 'integer', minimum: 0, description: '可选，按行分页起始行号（1-based）' },
        limit: { type: 'integer', minimum: 1, maximum: 200, description: '可选，按行分页最大行数' },
      },
    },
    'script.search': {
      properties: {
        query: { type: 'string', description: '搜索关键词（必填）' },
        episode: { type: 'string', description: '可选，限定搜索的分集或场次（如 "第一集"、"1"、"episode-1" 或 "1-5"）' },
        startLine: { type: 'integer', minimum: 1, description: '可选，限定搜索的 1-based 起始行号（含）' },
        endLine: { type: 'integer', minimum: 1, description: '可选，限定搜索的 1-based 结束行号（含）' },
        limit: { type: 'integer', minimum: 1, maximum: 200, description: '可选，最多返回匹配条数（默认 50）' },
      },
      required: ['query'],
    },
    'asset.list': {
      properties: {
        type: { type: 'string', enum: ['characters', 'locations', 'props'], description: '资产分类：characters（角色）、locations（场景）、props（道具）；若不填则返回全部' },
        query: { type: 'string', description: '按资产名称或描述进行关键词搜索' },
        offset: { type: 'integer', minimum: 0 },
        limit: { type: 'integer', minimum: 1, maximum: 100 }
      }
    },
    'asset.create': {
      properties: {
        type: { type: 'string', enum: ['characters', 'locations', 'props'], description: '资产类型（必填）：characters（角色）、locations（场景）、props（道具）' },
        parentId: { type: 'string', description: '可选，若向已有资产追加二级版本（如视觉上的不同造型、夜景版），填入父资产 ID' },
        name: { type: 'string', description: '资产名称（如"戴安娜"、"伯爵大厅"、"画（生日蛋糕）"）' },
        description: { type: 'string', description: '资产识别浅色描述（防混淆、防重复、防丢失必填）：道具写明首次出场、谁的、与相似道具区分点；场景写明首次出场、归属及日夜景区分；角色写明首次出场、核心身份关系与视觉上的不同造型区分' },
        role: { type: 'string', description: '角色身份设定（角色适用，如"女主/列车掌权者"）' },
        appearance: { type: 'string', description: '外貌、服装穿搭与细节特征（角色适用）' },
        age: { type: 'string', description: '角色年龄' },
        gender: { type: 'string', description: '角色性别' },
        personality: { type: 'string', description: '性格特征与心理状态' },
        performanceNotes: { type: 'string', description: '镜头表演与情绪重点' },
        locationType: { type: 'string', enum: ['INT', 'EXT'], description: '场景类型（场景适用）：INT（内景）、EXT（外景）' },
        timeOfDay: { type: 'string', description: '时间氛围（场景适用，如"雨夜"、"黄昏"、"日景"、"夜景"）' },
        atmosphere: { type: 'string', description: '空间氛围与光影影调（场景适用）' },
        visualDetails: { type: 'string', description: '空间结构、建筑材质与美术细节（场景适用）' },
        owner: { type: 'string', description: '道具所属角色（道具适用）' },
        materialAndState: { type: 'string', description: '材质与物理状态（道具适用）' },
        storySignificance: { type: 'string', description: '剧情关键作用与特写重点（道具适用）' },
        aliases: { type: 'array', items: { type: 'string' }, description: '该资产在剧本中的简称或别名列表' },
        sourceScenes: { type: 'array', items: { type: 'string' }, description: '该资产在剧本中出现的位置/场次出处列表（如 ["第1集第1场", "第2集第3场"]）' },
        provenances: {
          type: 'array',
          items: { type: 'object' },
          description: '剧本出处段落锚点列表（直接传 { sceneTitle: "1-5 日 外 布莱克伍德庄园", paragraphIndices: [2, 3, 5] } 即可自动还原原文）'
        },
        versions: {
          type: 'array',
          items: { type: 'object' },
          description: '多版本二级列表（场景若有日景和夜景须拆分为两个版本；角色若有视觉上的不同造型须按视觉上的不同造型区分版本；每项含 name、description、aliases、provenances 及对应外貌/光影/场次字段）'
        },
        items: { type: 'array', items: { type: 'object' }, description: '批量创建资产对象列表（每个对象可包含 name, description, provenances, versions, sourceScenes 及各分类属性）' }
      },
      required: ['type']
    },
    'asset.update': {
      properties: {
        id: { type: 'string', description: '要修改的目标资产 ID 或二级版本 ID（如 "char_xxx", "loc_xxx", "prop_xxx"）' },
        type: { type: 'string', enum: ['characters', 'locations', 'props'], description: '资产类型（可选）' },
        mode: { type: 'string', enum: ['append', 'overwrite'], description: '出处与版本更新模式：默认 "append"（增量追加合并 provenances 与 versions，保留已有其它集数出处）；传 "overwrite" 则清空旧出处全量重设' },
        updates: { type: 'object', description: '待更新的属性键值对（如 name, description, provenances, versions, appearance, role, sourceScenes 等）' },
        name: { type: 'string', description: '直接修改资产或版本名称' },
        description: { type: 'string', description: '修改资产识别浅色描述（注意：传入此字段会替换原 description，须保留已有核心设定并融合新增信息，若仅追加出处请勿传残缺的单场描述）' },
        role: { type: 'string', description: '直接修改角色身份' },
        appearance: { type: 'string', description: '直接修改角色外貌/服装' },
        atmosphere: { type: 'string', description: '直接修改场景氛围' },
        visualDetails: { type: 'string', description: '直接修改场景细节' },
        materialAndState: { type: 'string', description: '直接修改道具材质状态' },
        storySignificance: { type: 'string', description: '直接修改道具剧情作用' },
        sourceScenes: { type: 'array', items: { type: 'string' }, description: '直接更新或补充资产出现的位置/场次出处列表' },
        provenances: {
          type: 'array',
          items: { type: 'object' },
          description: '补充或重设的出处段落锚点列表（直接传 [{ sceneTitle: "1-5 日 外 布莱克伍德庄园", paragraphIndices: [2, 3] }] 即可自动还原原文）'
        },
        versions: { type: 'array', items: { type: 'object' }, description: '更新该资产的多版本二级列表（如角色按视觉上的不同造型区分版本、场景日景/夜景版本）' }
      },
      required: ['id']
    },
    'asset.delete': {
      properties: {
        id: { type: 'string', description: '待删除的目标资产 ID' },
        ids: { type: 'array', items: { type: 'string' }, description: '待批量删除的资产 ID 列表' },
        type: { type: 'string', enum: ['characters', 'locations', 'props'], description: '资产类型（可选）' }
      }
    },
    'asset.searchProvenanceCandidates': {
      properties: {
        id: { type: 'string', description: '目标资产 ID（如 "prop_xxx"、"char_xxx"、"loc_xxx"）' },
        name: { type: 'string', description: '目标资产名称（如 "布拉姆"、"纯金钥匙"）' },
        type: { type: 'string', enum: ['characters', 'locations', 'props'], description: '资产类型（可选）' },
        aliases: { type: 'array', items: { type: 'string' }, description: '该资产在剧本中可能出现的简称或别名列表（如 ["布拉姆", "教父"]）' },
        scopeScenes: { type: 'array', items: { type: 'string' }, description: '可选，限定检索的分集/场次标题列表（如 ["第二集", "2-1"]）' }
      }
    },
    'asset.commitProvenance': {
      properties: {
        id: { type: 'string', description: '目标资产 ID（如 "char_xxx"、"prop_xxx"）' },
        name: { type: 'string', description: '目标资产名称（可选）' },
        type: { type: 'string', enum: ['characters', 'locations', 'props'], description: '资产类型（可选）' },
        mode: {
          type: 'string',
          enum: ['append', 'overwrite'],
          description: '出处提交模式：默认 "append"（增量追加合并，自动保留已有其它集数/场次出处并去重排序）；仅当需要清空旧出处并全量重设时传 "overwrite"'
        },
        aliases: { type: 'array', items: { type: 'string' }, description: '确认有效的资产别名/简称列表' },
        verifiedCandidateIds: {
          type: 'array',
          items: { type: 'string' },
          description: '结合 contextSnippet 核验通过的 candidateId 列表（如 ["cand_L56_2825"]）'
        },
        provenances: {
          type: 'array',
          items: { type: 'object' },
          description: '直接提交核验通过的出处段落列表（可传 { sceneTitle: "第二集 2-1", paragraphIndices: [1, 3] }）'
        },
        summary: { type: 'string', description: '核验结论与排除说明摘要' }
      },
      required: ['id']
    },
    'ui.actAndObserve': { properties: { targetId: target, action: { type: 'string', enum: ['mouse.move', 'mouse.click', 'mouse.doubleClick', 'mouse.longPress', 'mouse.hover', 'mouse.drag', 'mouse.scroll', 'mouse.type', 'mouse.keyPress'] }, arguments: { type: 'object', description: '鼠标动作的附加参数。例如：mouse.scroll 可传 { delta: number }（正数向下，负数向上）；mouse.type 可传 { text: string, clear?: boolean }（输入文本，clear 为 true 时先清空原有内容）；mouse.keyPress 可传 { key: string, shiftKey?: boolean }（如 key="Enter"）' }, observe: { type: 'object', properties: observationProperties } }, required: ['targetId', 'action'] },
    'page.inspect': { properties: observationProperties },
    'guide.lookup': { properties: { query: { type: 'string' } }, required: ['query'] },
    'card.inspect': { properties: { cardId: { type: 'string', description: '需要深入查看的目标卡片 ID' }, includeImage: { type: 'boolean', description: '是否提取高清图像并注入多模态视觉上下文' }, includePrompt: { type: 'boolean', description: '是否提取提示词' }, includeReference: { type: 'boolean', description: '是否提取参考图列表' }, includeParameters: { type: 'boolean', description: '是否提取画幅、模型、渲染状态等参数' } }, required: ['cardId'] },
    'card.detectLandmarks': {
      properties: {
        cardId: { type: 'string', description: '需要进行画面元素空间标注的目标卡片 ID（例如 card_xxx 或 canvas.card.xxx）' },
        action: {
          type: 'string',
          enum: ['detect', 'list', 'update', 'delete', 'clear'],
          description: '操作动作：detect（默认，调用大模型空间定位与语义标注）、list（查询卡片已有标注列表）、update（修改指定标注）、delete（删除指定 ID 标注）、clear（清空卡片全部标注）'
        },
        requirement: { type: 'string', description: '具体标注要求（自然语言意图描述，如"标注主要角色手持的长剑与腰间玉佩"、"识别所有光源与反光表面"等，不限部位、不限数量）' },
        prompt: { type: 'string', description: '兼容参数，等同于 requirement' },
        mode: {
          type: 'string',
          enum: ['append', 'overwrite'],
          description: '合并模式：append（在卡片已有标注基础上追加新标注）、overwrite（覆写已有标注，默认）'
        },
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '要修改的标注元素 ID（如 elem_1）' },
              label: { type: 'string', description: '新的标签文本' },
              description: { type: 'string', description: '新的视觉外观细节描述' },
              category: { type: 'string', description: '元素类别' },
              point: {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                description: '新的归一化坐标百分比 (0~100)'
              },
              box: {
                type: 'array',
                items: { type: 'number' },
                description: '2D 归一化包围盒 [ymin, xmin, ymax, xmax]'
              }
            },
            required: ['id']
          },
          description: '更新项列表（action="update" 时生效）'
        },
        deleteIds: {
          type: 'array',
          items: { type: 'string' },
          description: '要删除的标注元素 ID 数组（action="delete" 时生效，如 ["elem_1"]）'
        },
        force: { type: 'boolean', description: '是否强制重新识别（默认为 true）' }
      },
      required: ['cardId']
    },
    'card.annotateElements': {
      properties: {
        cardId: { type: 'string', description: '目标卡片 ID（与 card.detectLandmarks 功能完全相同）' },
        action: {
          type: 'string',
          enum: ['detect', 'list', 'update', 'delete', 'clear'],
          description: '操作动作：detect（默认检测）、list（列表）、update（更新）、delete（删除）、clear（清空）'
        },
        requirement: { type: 'string', description: '具体标注要求描述' },
        prompt: { type: 'string', description: '兼容参数，等同于 requirement' },
        mode: { type: 'string', enum: ['append', 'overwrite'], description: '合并模式：append 追加或 overwrite 覆写' },
        updates: { type: 'array', items: { type: 'object' }, description: '更新项列表' },
        deleteIds: { type: 'array', items: { type: 'string' }, description: '删除 ID 数组' },
        force: { type: 'boolean', description: '是否强制重新识别' }
      },
      required: ['cardId']
    },
    'card.generate': { properties: { name: { type: 'string', description: '卡片名称（尽可能简短、辨识度高）' }, targetCardId: { type: 'string', description: '目标卡片 ID（"new" 表示新建衍生生图卡片，或已有卡片 ID）' }, prompt: { type: 'string', description: '正向生图提示词' }, aspectRatio: { type: 'string', description: '画幅比例，如 16:9, 9:16, 1:1 等' }, referenceCardIds: { type: 'array', items: { type: 'string' }, description: '参考图卡片 ID 列表' }, autoStart: { type: 'boolean', description: '是否直接排队启动生成（默认为 true）' }, forceOverwrite: { type: 'boolean', description: '是否强制在原卡片覆盖（慎用，默认已出图卡片会触发 Fork 衍生）' } }, required: ['name'] },
    'sys.updateState': { properties: { taskTitle: { type: 'string' }, goal: { type: 'string' }, subGoal: { type: 'string' }, progress: { type: 'string' }, notes: { type: 'string' }, notesMode: { type: 'string', enum: ['append', 'overwrite'], description: '重点笔记模式：append（追加，默认）或 overwrite（重写替换现有笔记）' }, plan: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, status: { type: 'string' } } } } } },
    'sys.endTask': { properties: { success: { type: 'boolean' }, waitForUser: { type: 'string' }, paused: { type: 'boolean', description: '若任务属于等待后台异步生图/排队渲染，设置为 true 挂起任务等待出图事件唤醒' } } },
    'user.ask': { properties: { question: { type: 'string' } }, required: ['question'] },
  };
  const schema = schemas[toolId] || { properties: {} };
  return { type: 'object', properties: schema.properties, ...(schema.required ? { required: schema.required } : {}) };
};

export { autoCloseJsonString, robustParseJson };

function trySanitizeAndParseJson(str: string): Record<string, any> | null {
  const result = robustParseJson(str);
  if (result && typeof result === 'object' && !Array.isArray(result)) return result;
  return null;
}

interface ModelConfig {
  endpoint: string;
  actualModel: string;
  apiKey: string;
  stream?: boolean;
  enableThinking?: boolean;
  reasoningEffort?: 'low' | 'high' | 'max';
}

function getModelConfig(modelType: string, userKey?: string): ModelConfig {
  let endpoint = 'https://api.deepseek.com/chat/completions';
  let actualModel = 'deepseek-flash';
  let apiKey = userKey || process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY || process.env.ZHIPU_API_KEY || process.env.SILICONFLOW_API_KEY;
  let stream = true;
  let enableThinking = false;
  let reasoningEffort: 'low' | 'high' | 'max' = 'max';

  if (modelType.toLowerCase().includes('gemini') || modelType === 'gemini-2.5-flash' || modelType === 'gemini-2.5-pro') {
    endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    actualModel = modelType.toLowerCase().includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    apiKey = userKey || process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY;
    stream = true;
  } else if (modelType === 'deepseek-v4-pro') {
    actualModel = 'deepseek-v4-pro';
    enableThinking = true;
    stream = true;
  } else if (
    modelType === 'deepseek-v4-flash' ||
    modelType === 'deepseek-v4.1-flash-expires-on-0910' ||
    modelType === 'deepseek-flash' ||
    modelType === 'deepseek' ||
    modelType === 'auto'
  ) {
    if (
      (modelType === 'auto' || modelType === 'deepseek-v4-flash') &&
      process.env.GEMINI_API_KEY &&
      !process.env.DEEPSEEK_API_KEY &&
      !userKey
    ) {
      endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      actualModel = 'gemini-2.5-flash';
      apiKey = process.env.GEMINI_API_KEY;
      enableThinking = false;
      stream = true;
    } else {
      actualModel = 'deepseek-flash';
      enableThinking = false;
      stream = true;
    }
  } else if (modelType === 'qwen3.8-flash') {
    endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    actualModel = 'qwen3.8-flash';
    apiKey = userKey || process.env.DASHSCOPE_API_KEY || process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY;
    stream = true;
  } else if (
    modelType === 'qwen3-vl-plus' ||
    modelType === 'qwen-vl-plus' ||
    modelType.toLowerCase().includes('qwen3-vl') ||
    modelType.toLowerCase().includes('vl-plus')
  ) {
    endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    actualModel = 'qwen3-vl-plus';
    apiKey = userKey || process.env.DASHSCOPE_API_KEY || process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY;
    stream = true;
  } else if (
    modelType === 'doubao-seed-2-1-pro-260915' ||
    modelType === 'doubao-seed-2.1-pro' ||
    modelType === 'doubao-seed-2-1-pro' ||
    modelType.toLowerCase().includes('doubao') ||
    modelType.toLowerCase().includes('seed-2-1') ||
    modelType.toLowerCase().includes('seed-2.1') ||
    modelType.toLowerCase().includes('volces') ||
    modelType.toLowerCase().includes('ark')
  ) {
    endpoint = process.env.ARK_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    actualModel = process.env.ARK_MODEL_NAME || 'doubao-seed-2-1-pro-260915';
    apiKey = userKey || process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY || process.env.GEMINI_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.DEEPSEEK_API_KEY;
    stream = true;
    enableThinking = false;
  } else if (
    modelType.toLowerCase().includes('5.3-flash') ||
    modelType.toLowerCase().includes('glm-5.3')
  ) {
    endpoint = process.env.GLM_API_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    actualModel = process.env.GLM_MODEL_NAME || process.env.ZHIPU_MODEL_NAME || 'ZHIPU/GLM-5.3-Flash';
    apiKey = userKey || process.env.DASHSCOPE_API_KEY || process.env.ZHIPU_API_KEY || process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY;
    stream = true;
    enableThinking = true;

    if (modelType.toLowerCase().endsWith('-low') || modelType.toLowerCase().includes('low')) {
      reasoningEffort = 'low';
    } else if (modelType.toLowerCase().endsWith('-high') || modelType.toLowerCase().includes('high')) {
      reasoningEffort = 'high';
    } else {
      reasoningEffort = 'max';
    }
  }

  if (!apiKey) throw new Error('未配置 API Key。请在 Settings > Secrets 面板中配置 GEMINI_API_KEY 或相关 API 密钥。');
  return { endpoint, actualModel, apiKey, stream, enableThinking, reasoningEffort };
}

async function parseChatCompletionResponse(response: Response, isStream: boolean): Promise<{ content: string; reasoning_content?: string }> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/event-stream') && !isStream) {
    const data = await response.json();
    const message = data.choices?.[0]?.message || {};
    return {
      content: message.content || '',
      reasoning_content: message.reasoning_content || message.reasoning || '',
    };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      const message = data.choices?.[0]?.message || {};
      return { content: message.content || '', reasoning_content: message.reasoning_content || '' };
    } catch {
      throw new Error('无法读取响应流内容');
    }
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let fullReasoning = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const chunk = JSON.parse(jsonStr);
          const delta = chunk.choices?.[0]?.delta;
          if (delta) {
            if (delta.content) {
              fullContent += delta.content;
            }
            if (delta.reasoning_content) {
              fullReasoning += delta.reasoning_content;
            } else if (delta.reasoning) {
              fullReasoning += delta.reasoning;
            }
          }
        } catch {
          // ignore incomplete JSON chunks
        }
      }
    }
  }

  if (buffer.trim().startsWith('data: ') && buffer.trim() !== 'data: [DONE]') {
    try {
      const chunk = JSON.parse(buffer.trim().slice(6));
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) fullContent += delta.content;
      if (delta?.reasoning_content) fullReasoning += delta.reasoning_content;
      else if (delta?.reasoning) fullReasoning += delta.reasoning;
    } catch {}
  }

  return { content: fullContent, reasoning_content: fullReasoning };
}

// Heuristic fallback for script TOC pattern recognition
function inferPatternHeuristically(sampleText: string): { tocPattern: string; scenePattern: string; flags: string; patternDescription: string } {
  const lines = sampleText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const bracketEpisodeMatch = lines.some(l => /^【\s*第?\s*[0-9一二三四五六七八九十百千]+\s*[集话回].*?】/i.test(l));
  const bracketSceneMatch = lines.some(l => /^【\s*(?:场|场景|场次)?\s*[0-9一二三四五六七八九十百千]+.*?】/i.test(l));
  const plainEpisodeMatch = lines.some(l => /^第?\s*[0-9一二三四五六七八九十百千]+\s*[集话回]/i.test(l));
  const dashSceneMatch = lines.some(l => /^\d+\s*[-—–]\s*\d+/i.test(l));
  const plainSceneMatch = lines.some(l => /^第\s*[0-9一二三四五六七八九十百千]+\s*[场幕]/i.test(l));
  const englishEpisodeMatch = lines.some(l => /^(?:EPISODE|EP|CHAPTER)\s*#?\s*\d+/i.test(l));
  const englishSceneMatch = lines.some(l => /^(?:SCENE\s*#?\s*\d+|(?:INT\.|EXT\.|内景|外景)\s+)/i.test(l));

  let epPattern = "";
  let scenePattern = "";
  let patternDescription = "";

  if (bracketEpisodeMatch) {
    epPattern = "^【\\s*第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回][^】]*】.*";
    patternDescription += "方括号集数格式";
  } else if (plainEpisodeMatch) {
    epPattern = "^第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回].*";
    patternDescription += "标准集数格式";
  } else if (englishEpisodeMatch) {
    epPattern = "^(?:EPISODE|EP|CHAPTER)\\s*#?\\s*\\d+.*";
    patternDescription += "英文Episode格式";
  }

  if (dashSceneMatch) {
    scenePattern = "^\\d+\\s*[-—–]\\s*\\d+.*";
    patternDescription += (patternDescription ? " + " : "") + "连字符分场格式(如1-1/22—1)";
  } else if (bracketSceneMatch) {
    scenePattern = "^【\\s*(?:场|场景|场次)?\\s*[0-9一二三四五六七八九十百千]+[^】]*】.*";
    patternDescription += (patternDescription ? " + " : "") + "方括号场次格式";
  } else if (plainSceneMatch) {
    scenePattern = "^第\\s*[0-9一二三四五六七八九十百千]+\\s*[场幕].*";
    patternDescription += (patternDescription ? " + " : "") + "标准场次格式";
  } else if (englishSceneMatch) {
    scenePattern = "^(?:SCENE\\s*#?\\s*\\d+|(?:INT\\.|EXT\\.|内景|外景)\\s+).*";
    patternDescription += (patternDescription ? " + " : "") + "英文Scene格式";
  }

  // Fallbacks
  if (!scenePattern) {
    scenePattern = "^(?:\\d+\\s*[-—–]\\s*\\d+|第\\s*[0-9一二三四五六七八九十百千]+\\s*[场幕]|【\\s*(?:场|场景|场次)?\\s*[0-9一二三四五六七八九十百千]+[^】]*】).*";
  }
  if (!epPattern) {
    epPattern = "^(?:【\\s*第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回][^】]*】|第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回]).*";
  }

  const tocPattern = epPattern && scenePattern ? `(?:${epPattern}|${scenePattern})` : (epPattern || scenePattern);

  return { tocPattern, scenePattern, flags: "gim", patternDescription };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // WorkRally MCP Proxy Routes
  app.use('/api/mcp/workrally', mcpRouter);
  app.use('/api/mcp', mcpRouter);

  // API Route for AI Episode / TOC Pattern Recognition
  app.post('/api/save-prompts', express.json(), (req, res) => {
    try {
      const { prompts } = req.body;
      if (!prompts) return res.status(400).json({ error: 'Missing prompts data' });
      const promptFileContent = `import { NodePromptConfig } from '../types/script';

/**
 * 全局统一的代码级管线与节点系统 Prompt 库
 */
export const CODE_PIPELINE_PROMPTS: NodePromptConfig = ${JSON.stringify(prompts, null, 2)};
`;
      fs.writeFileSync(path.join(process.cwd(), 'src/constants/prompts.ts'), promptFileContent, 'utf-8');
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/script-toc-pattern", async (req, res) => {
    const { sampleText, systemPrompt, modelType = 'auto', apiKey, deepseekKey } = req.body;
    if (!sampleText || typeof sampleText !== "string") {
      return res.status(400).json({ error: "Missing sampleText in request body" });
    }

    try {
      if (modelType !== 'heuristic') {
        const { endpoint, actualModel, apiKey: keyToUse, enableThinking } = getModelConfig(modelType, apiKey || deepseekKey);
        const requestPayload: Record<string, unknown> = {
          model: actualModel,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt || '分析剧本标题格式并返回 pattern、flags、patternDescription 的 JSON。' },
            { role: 'user', content: sampleText.slice(0, 4000) }
          ]
        };
        if (enableThinking) {
          requestPayload.enable_thinking = true;
          requestPayload.extra_body = { thinking: { type: 'enabled' } };
        } else {
          requestPayload.thinking = { type: 'disabled' };
          requestPayload.extra_body = { thinking: { type: 'disabled' } };
        }
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyToUse}` },
          body: JSON.stringify(requestPayload)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = await response.json();
        const parsed = robustParseJson(body.choices?.[0]?.message?.content || '{}') || {};
        if (parsed.scenePattern || parsed.pattern || parsed.tocPattern) {
          return res.json({ 
            ...parsed,
            confidence: 'ai' 
          });
        }
      }

    } catch (error: any) {
      console.warn("DeepSeek pattern recognition unavailable, falling back to heuristic engine:", error.message || error);
    }

    // Heuristic inference fallback when DeepSeek is unavailable or explicitly disabled.
    const fallbackResult = inferPatternHeuristically(sampleText);
    return res.json({
      tocPattern: fallbackResult.tocPattern,
      scenePattern: fallbackResult.scenePattern,
      flags: fallbackResult.flags,
      patternDescription: fallbackResult.patternDescription,
      confidence: "heuristic"
    });
  });

  // API Route for DeepSeek Generation
  app.post("/api/script/assess-change", async (req, res) => {
    try {
      const { action, affected_scene_orders, char_delta, before_snippet, after_snippet, apiKey, modelType = 'auto' } = req.body;
      const { endpoint, actualModel, apiKey: keyToUse, enableThinking } = getModelConfig(modelType, apiKey);

      const requestPayload: Record<string, unknown> = {
        model: actualModel,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: "system",
            content: '你是一个剧本版本意图判定助手。请仔细对比 before_snippet 和 after_snippet 评估修改级别(trivial/scene_edit/structural)。关键要求：summary 必须极其具体地说明改了什么内容。根据实际动作选择最贴切的句式，例如：删除操作用“删除了[某某剧情/词语]”；新增操作用“新增了[某某剧情/词语]”；替换操作用“将[原内容]改为[新内容]”。不要写“改台词”等模糊废话，也不要生硬套用替换句式。限制在15字以内。必须输出 JSON：{"scale":"trivial"|"scene_edit"|"structural", "summary":string}'
          },
          {
            role: "user",
            content: JSON.stringify({
              action,
              affected_scene_orders,
              char_delta,
              before_snippet,
              after_snippet
            })
          }
        ]
      };

      if (enableThinking) {
        requestPayload.enable_thinking = true;
        requestPayload.extra_body = { thinking: { type: 'enabled' } };
      } else {
        requestPayload.thinking = { type: 'disabled' };
        requestPayload.extra_body = { thinking: { type: 'disabled' } };
      }

      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${keyToUse}`,
        },
        body: JSON.stringify(requestPayload),
      };

      const response = await fetch(endpoint, fetchOptions);
      if (!response.ok) {
        throw new Error(`Model API error: HTTP ${response.status}`);
      }

      const body = await response.json();
      const resultText = body.choices?.[0]?.message?.content || '{}';
      const parsed = robustParseJson(resultText) || {};
      
      return res.json({
        scale: parsed.scale || 'trivial',
        should_version: parsed.should_version || false,
        summary: parsed.summary || ''
      });

    } catch (error: any) {
      console.error('Assess change error:', error);
      // Fallback
      return res.json({ scale: 'trivial', should_version: false, summary: '' });
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, apiKey, systemPrompt, modelType = 'auto' } = req.body;
      if (modelType === 'heuristic') return res.status(400).json({ error: '该节点不支持启发式模型。' });
      const { endpoint, actualModel, apiKey: keyToUse, stream, enableThinking, reasoningEffort } = getModelConfig(modelType, apiKey);

      const requestPayload: Record<string, unknown> = {
        model: actualModel,
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are an AI assistant that generates highly descriptive image prompts based on user input. Only reply with the prompt text."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      };

      if (stream) {
        requestPayload.stream = true;
      }
      if (enableThinking) {
        requestPayload.enable_thinking = true;
        requestPayload.reasoning_effort = reasoningEffort;
        requestPayload.extra_body = {
          enable_thinking: true,
          reasoning_effort: reasoningEffort,
          thinking: { type: 'enabled' },
        };
      } else {
        requestPayload.thinking = { type: 'disabled' };
        requestPayload.extra_body = {
          thinking: { type: 'disabled' },
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${keyToUse}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }
      const data = await parseChatCompletionResponse(response, !!stream);
      res.json({ result: data.content });
    } catch (error: any) {
      console.error("DeepSeek API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.get('/api/agent/prompt', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const reqType = String(req.query.type || 'main');
    const type: ManagedPromptType = 
      reqType === 'mainExecution' || reqType === 'main_execution' ? 'mainExecution' :
      reqType === 'state' ? 'state' :
      reqType === 'landmarks' || reqType === 'subject_landmarks' ? 'landmarks' :
      reqType === 'jsonAdapter' || reqType === 'json_adapter' ? 'jsonAdapter' : 'main';
    const meta = getPromptWithMeta(type);
    res.json({ prompt: meta.prompt, type, updatedAt: meta.updatedAt, source: meta.source });
  });

  app.post('/api/agent/prompt', express.json(), (req, res) => {
    try {
      const { prompt, type = 'main', updatedAt } = req.body;
      if (typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Invalid prompt content' });
      }
      const reqType = String(type);
      const targetType: ManagedPromptType =
        reqType === 'mainExecution' || reqType === 'main_execution' ? 'mainExecution' :
        reqType === 'state' ? 'state' :
        reqType === 'landmarks' || reqType === 'subject_landmarks' ? 'landmarks' :
        reqType === 'jsonAdapter' || reqType === 'json_adapter' ? 'jsonAdapter' : 'main';
      const ts = typeof updatedAt === 'number' && Number.isFinite(updatedAt) && updatedAt > 0
        ? updatedAt
        : Date.now();
      const savedAt = writeUserSavedPrompt(targetType, prompt, ts);
      res.json({ success: true, type: targetType, updatedAt: savedAt, source: 'user_saved' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/agent/turn', async (req, res) => {
    try {
      const { 
        userMessage, 
        history = [], 
        events = [], 
        observations = [], 
        project, 
        task, 
        apiKey, 
        modelType = 'deepseek-v4-flash', 
        enabledTools, 
        contextSelection,
        requireTool = false, 
        images = [], 
        cardContext,
        systemPrompt: customSystemPrompt,
        systemExecutionPrompt: customSystemExecutionPrompt,
        jsonAdapterModel,
        jsonAdapterKey,
        jsonAdapterPrompt: customJsonAdapterPrompt,
      } = req.body;
      const { endpoint, actualModel, apiKey: keyToUse, stream, enableThinking, reasoningEffort } = getModelConfig(modelType, apiKey);
      if (!userMessage || typeof userMessage !== 'string') return res.status(400).json({ error: '缺少用户消息。' });

      const allToolIds = new Set<string>(AGENT_TOOL_REGISTRY.map((tool) => tool.id));
      const configuredToolIds = Array.isArray(enabledTools)
        ? enabledTools.filter((tool): tool is string => typeof tool === 'string' && allToolIds.has(tool))
        : AGENT_TOOL_REGISTRY.map((tool) => tool.id);
      const savedCategories = Array.isArray(task?.requestedCategories) ? task.requestedCategories : [];
      const rawContext: AgentContextSelection = contextSelection && (contextSelection.level === 0 || contextSelection.level === 1) && (Array.isArray(contextSelection.tools) || Array.isArray(contextSelection.categories))
        ? {
            ...(contextSelection as AgentContextSelection),
            categories: Array.from(new Set([
              ...savedCategories,
              ...(Array.isArray(contextSelection.categories) ? contextSelection.categories : []),
            ])),
          }
        : {
            ...initialAgentContext(),
            categories: savedCategories,
          };
      const turnContext = resolveContext(rawContext, configuredToolIds);
      const enabledToolIds = new Set<string>(turnContext.tools);
      const isLevel1 = turnContext.level === 1;
      const controlToolLines = isLevel1
        ? [
            `- sys.selectContext：补充装载工具或退出局部执行返回全局计划阶段（当前计划的后续步骤如需补充装载工具，可传 {"tools": [...]} 增量合并装载，已装载工具会自动保留；当“当前计划”中的所有步骤均已执行完毕后，直接无参调用 {{调用 sys.selectContext}} 返回全局计划与验收阶段）。\n  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }`,
            `- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。\n  参数：{ question?: string }`,
          ]
        : [
            `- sys.selectContext：按需展开工具分类或装载具体工具进入执行阶段。规则：① 需展开新工具分类时，传 {"categories": [...]} 展开对应分类下的候选工具简表；② 结合“当前计划”中的各个步骤，从已展开的候选简表中一次性挑选执行该计划所需的具体工具 ID 传 {"tools": [...]} 进入局部执行阶段（装配原则：工具须成组配套，若任务涉及资产提取且需分步追加，须同时装配 [asset.create, asset.update]；探查阶段推荐同时装载并并发调用 [directory, search, list]）。\n  参数：{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }`,
            `- user.ask：向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。\n  参数：{ question?: string }`,
            `- sys.endTask：结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。\n  参数：{ success?: boolean, paused?: boolean }`,
          ];
      const injectedBusinessTools = AGENT_TOOL_REGISTRY
        .filter((tool) => enabledToolIds.has(tool.id) && !CONTROL_TOOLS.includes(tool.id))
        .map((tool) => `- ${tool.id}：${tool.description}\n  参数：${tool.input}`);
      const candidateToolLines = (turnContext.candidateTools || [])
        .map((tool) => `- ${tool.id}：${tool.summary}`);
      const remainingCandidateToolLines = (turnContext.candidateTools || [])
        .filter((tool) => !enabledToolIds.has(tool.id))
        .map((tool) => `- ${tool.id}：${tool.summary}`);
      const expandedCategorySet = new Set(turnContext.categories || []);
      const unexpandedCategoryLines = Object.values(TOOL_CATEGORIES)
        .filter(cat => !expandedCategorySet.has(cat.id) && cat.tools.some(t => configuredToolIds.includes(t)))
        .map(cat => `- ${cat.id}（${cat.label}）：${cat.description}`)
        .join('\n');
      const categoryLines = Object.values(TOOL_CATEGORIES)
        .filter(cat => cat.tools.some(t => configuredToolIds.includes(t)))
        .map(cat => `- ${cat.id}（${cat.label}）：${cat.description}`)
        .join('\n');
      const assembledToolSections: string[] = [
        `## 当前可直接调用`,
        ...controlToolLines,
        ...injectedBusinessTools,
      ];
      if (!isLevel1) {
        if (candidateToolLines.length > 0) {
          assembledToolSections.push(
            ``,
            `## 候选工具简表（已展开分类: [${turnContext.categories.join(', ')}]）`,
            ...candidateToolLines,
          );
          if (unexpandedCategoryLines) {
            assembledToolSections.push(
              ``,
              `## 其它未展开的工具分类（可传 categories 补充展开）`,
              unexpandedCategoryLines,
            );
          }
        } else {
          assembledToolSections.push(
            ``,
            `## 可装载的工具分类（传 categories 展开对应候选工具简表）`,
            categoryLines || '无',
          );
        }
      } else if (remainingCandidateToolLines.length > 0) {
        assembledToolSections.push(
          ``,
          `## 候选工具简表（后续步骤如需使用，可调 sys.selectContext 补充装载）`,
          ...remainingCandidateToolLines,
        );
      }
      const assembledToolPrompt = assembledToolSections.join('\n');

      const cleanToolOutput = (val: unknown, depth = 0): unknown => cleanToolOutputForPrompt(val, depth);

      const serializeCleanOutput = (output: any): string => {
        if (typeof output === 'string') return output;
        const cleaned = cleanToolOutput(output);
        return JSON.stringify(cleaned ?? {});
      };

      const cleanUserGoalText = (text: string): string => {
        if (!text) return '';
        let cleaned = text.replace(/# 目标卡片与拓扑上下文信息[\s\S]*?用户针对该卡片的指令[:：]\s*/gi, '');
        cleaned = cleaned.replace(/【当前右键聚焦的目标卡片信息】[\s\S]*?用户针对该卡片的指令[:：]\s*/gi, '');
        cleaned = cleaned.replace(/【当前聚焦的[\s\S]*?用户(?:针对该[^\n]*的)?指令[:：]\s*/gi, '');
        return cleaned.trim() || text.trim();
      };

      const negotiationLog = Array.isArray(task?.negotiationLog) ? task.negotiationLog : [];
      const userEntries = negotiationLog.filter((item: any) => item && item.role === 'user' && typeof item.content === 'string' && item.content.trim());
      const firstUserGoal = userEntries.length > 0 ? cleanUserGoalText(userEntries[0].content) : '';
      const hasMultiTurnDialogue = negotiationLog.length > 1 && userEntries.length > 1;
      let displayUserMessage = cleanUserGoalText(userMessage) || '（无新指令）';
      if (hasMultiTurnDialogue) {
        const dialogueLines = negotiationLog
          .map((entry: any, idx: number) => {
            const cleaned = cleanUserGoalText(String(entry?.content || ''));
            if (!cleaned) return '';
            if (entry.role === 'agent') {
              return `- Mira（提问）：${cleaned}`;
            }
            const isLatest = idx === negotiationLog.length - 1;
            return isLatest ? `- 用户（本轮最新回复）：${cleaned}` : `- 用户：${cleaned}`;
          })
          .filter(Boolean)
          .join('\n');
        displayUserMessage = `【初始任务指令】：${firstUserGoal || displayUserMessage}\n【多轮对话与最新回复】：\n${dialogueLines}\n（请结合初始任务指令与用户的最新回复，直接继续推进任务）`;
      }

      const hasNudgeObservation = Array.isArray(observations) && observations.some((obs: any) => obs?.content?.name === 'sys.nudge');
      const effectiveRequireTool = Boolean(requireTool || hasNudgeObservation);

      const formatObservations = (obsList: any[]) => {
        let pageObs: string[] = [];
        let toolObs: string[] = [];

        const formatPage = (page: any) => {
          let text = `【观察结果】 (区域: ${page.scope || 'overview'})\n`;
          if (page.notices && page.notices.length) {
            text += `页面提示：${page.notices.map((n: any) => n.label).join(' | ')}\n`;
          }
          if (page.canvas) {
            text += `画布状态：缩放比例 ${(page.canvas.scale * 100).toFixed(0)}% (LOD模式: ${page.canvas.lodMode}) | 画布卡片总数: ${page.canvas.totalCards} | 视口内可见卡片数: ${page.canvas.visibleCount}\n`;
            if (page.canvas.focusedCard) {
              const fc = page.canvas.focusedCard;
              text += `【聚焦卡片详情】ID: ${fc.id} | 标题: ${fc.title} | 状态: ${fc.state} | 比例: ${fc.ratio} | 分辨率: ${fc.resolution}\n- 提示词: "${fc.prompt || '无'}"\n`;
              if (fc.lastGeneratedPrompt && fc.lastGeneratedPrompt !== fc.prompt) {
                text += `- 历史生成提示词: "${fc.lastGeneratedPrompt}"\n`;
              }
              if (fc.model) text += `- 关联模型: ${fc.model}\n`;
              if (fc.referenceImagesCount) text += `- 参考图: ${fc.referenceImagesCount} 张\n`;
              if (fc.hasImage) text += `- 图像画面: 已生成可用\n`;
            }
          }
          if (page.script) {
            if (page.script.directory) {
              text += `目录滚动状态：[${page.script.directory.atTop ? '已到顶' : '未到顶'} | ${page.script.directory.atBottom ? '已到底' : '未到底'}]\n`;
            }
            if (page.script.search) {
              text += `搜索替换面板：[${page.script.search.isOpen ? '已展开' : '已收起'}]`;
              if (page.script.search.isOpen) {
                text += ` | 搜索词: "${page.script.search.searchText}" | 匹配状态: ${page.script.search.matchStatus} | 替换为: "${page.script.search.replaceText}" | 区分大小写: [${page.script.search.isCaseSensitive ? '开启' : '关闭'}]`;
                if (page.script.search.feedback) {
                  text += ` | 反馈提示: "${page.script.search.feedback}"`;
                }
              }
              text += '\n';
            }
            if (page.script.text?.status === 'visible') {
              if (page.script.text.visibleText) {
                text += `\n【剧本正文可见内容（已申请查看）】\n${page.script.text.visibleText}\n【正文滚动状态：${page.script.text.scroll?.atTop ? '已到顶' : '未到顶'} | ${page.script.text.scroll?.atBottom ? '已到底' : '未到底'}】\n`;
                if (page.script.text.hint) {
                  text += `提示：${page.script.text.hint}\n`;
                }
                text += '\n';
              } else if (page.script.text.hint) {
                text += `剧本正文提示：${page.script.text.hint}\n`;
              }
            }
          }
          if (page.components && page.components.length) {
            text += `可见组件列表：\n`;
            page.components.forEach((c: any) => {
              const actions = page.actionSets && page.actionSets[c.actionSet] ? page.actionSets[c.actionSet].join(', ') : '';
              const textSnippet = (c.id !== 'script.text' && c.text) ? ` | 文本: "${String(c.text).slice(0, 100)}"` : '';
              text += `- ID: ${c.id} | ${c.label || '无标签'}${textSnippet} | 可用动作: [${actions}]\n`;
            });
          } else {
            text += `无可见组件。\n`;
          }
          if (page.pagination?.truncated) {
            text += `\n注意：当前区域内容已被截断，请向下滚动或请求 nextOffset 继续查看。\n`;
          }
          return text.trim();
        };

        const formatWarningHeader = (out: any) => {
          if (!out || typeof out !== 'object' || !out.hasVolumeWarning) return '';
          const noticeText = out.notice || out.warning;
          if (!noticeText) return '';
          const isAutoReturned = Boolean(out.autoReturnedToLevel0);
          return `💡【数据量提醒${isAutoReturned ? ' · 已处于 0 级全局阶段' : ''}】${noticeText}\n\n`;
        };

        if (obsList && obsList.length) {
          obsList.forEach(obs => {
            if (obs.role !== 'tool' || !obs.content) return;
            const { name, status, output, error } = obs.content;
            // sys.nudge 统一由 Prompt 尾部的 effectiveRequireTool 提示呈现，避免双重警告
            if (name === 'sys.nudge') {
              return;
            }
            // sys.selectContext 成功时输出单行简明确认，明确区分“展开分类候选简表”、“进入局部执行阶段”与“返回全局计划与验收阶段”三种状态
            if (name === 'sys.selectContext' && status === 'succeeded') {
              const selOut = (output && typeof output === 'object') ? (output as any) : {};
              const level = selOut.level ?? 0;
              const tools = Array.isArray(selOut.tools) ? selOut.tools : [];
              const cats = Array.isArray(selOut.categories) ? selOut.categories : [];
              const transition = selOut.transition;
              if (transition === 'enter_execution' || (level === 1 && tools.length > 0)) {
                toolObs.push(`【工具 sys.selectContext 执行成功】已进入局部执行阶段，当前已装载工具：${tools.join(', ')}`);
              } else if (transition === 'expand_categories') {
                toolObs.push(`【工具 sys.selectContext 执行成功】已展开工具分类 [${cats.join(', ')}] 的候选工具简表（请从上方候选简表中按需挑选本次执行所需的具体工具 ID 填入 tools，调用 sys.selectContext({"tools": [...]}) 进入局部执行阶段）`);
              } else if (transition === 'return_to_plan') {
                const rememberedHint = cats.length > 0 ? `；此前已展开分类 [${cats.join(', ')}] 的候选工具简表已在上方就绪，如需进入下一阶段执行可直接从中挑选 tools` : '';
                toolObs.push(`【工具 sys.selectContext 执行成功】已返回全局计划与验收阶段（局部执行工具已卸载${rememberedHint}；若所有目标已全部完成，请调用 sys.endTask 结束任务）`);
              } else if (level === 0 && cats.length > 0 && tools.length === 0) {
                toolObs.push(`【工具 sys.selectContext 执行成功】已展开工具分类 [${cats.join(', ')}] 的候选工具简表（请从上方候选简表中按需挑选本次执行所需的具体工具 ID 填入 tools，调用 sys.selectContext({"tools": [...]}) 进入局部执行阶段）`);
              } else {
                toolObs.push(`【工具 sys.selectContext 执行成功】已返回全局计划与验收阶段（局部执行工具已卸载，请核对全局计划与上一阶段结果，确认全部完成后调用 sys.endTask 结束任务）`);
              }
              return;
            }
            if (status === 'failed') {
              toolObs.push(`【执行工具 ${name} 失败】\n原因：${error || '未知'}`);
              return;
            }
            
            if (name === 'page.inspect') {
              pageObs.push(formatPage(output as any));
            } else if (name === 'ui.actAndObserve') {
              const pageText = output.page ? formatPage(output.page) : '无最新页面数据。';
              pageObs.push(`【UI交互成功】动作 ${output.action} 作用于 ${output.targetId}。\n${pageText}`);
            } else if (name === 'guide.lookup') {
              toolObs.push(`【操作指南查询结果】\n查询词：${output.query || '未提供'}\n指南内容：${output.guidance}`);
            } else if (name === 'script.directory' && output && typeof output === 'object') {
              const dirOut = output as any;
              const warningHeader = formatWarningHeader(dirOut);
              const summaryLine = Array.isArray(dirOut.scenesSummary) && dirOut.scenesSummary.length > 0
                ? ` | 场次分布: ${dirOut.scenesSummary.join('、')}`
                : '';
              toolObs.push(
                `${warningHeader}【工具 script.directory 执行成功】（共 ${dirOut.total ?? 0} 个集数条目 | 场次总计: ${dirOut.totalScenes ?? '未知'} | 段落总计: ${dirOut.totalParagraphs ?? '未知'}${summaryLine}）\n${serializeCleanOutput(output)}`
              );
            } else if (name === 'script.read' && output && typeof output === 'object') {
              const readOut = output as any;
              const warningHeader = formatWarningHeader(readOut);
              if (Array.isArray(readOut.episodes)) {
                const { content: _omittedFlatContent, ...structuredReadOut } = readOut;
                toolObs.push(
                  `${warningHeader}【工具 script.read 执行成功】（按“集数 -> 场次 -> 段落”三层结构返回 | 集数: ${readOut.episodeCount ?? readOut.episodes.length} | 场次数: ${readOut.sceneCount ?? '未知'} | 段落数: ${readOut.paragraphCount ?? '未知'} | 行范围: 第 ${readOut.startLine ?? 1}～${readOut.endLine ?? 1} 行 | nextOffset: ${readOut.nextOffset ?? 'null'}）\n${serializeCleanOutput(structuredReadOut)}`
                );
              } else if (typeof readOut.content === 'string') {
                const startLineNum = typeof readOut.startLine === 'number' && readOut.startLine >= 1
                  ? Math.floor(readOut.startLine)
                  : (typeof readOut.offset === 'number' && Number.isFinite(readOut.offset) ? Math.max(1, Math.floor(readOut.offset)) : 1);
                const rawLines = String(readOut.content).split('\n');
                const numberedText = rawLines.map((line: string, idx: number) => `[第${startLineNum + idx}行] ${line}`).join('\n');
                const endLineNum = startLineNum + rawLines.length - 1;
                toolObs.push(`${warningHeader}【工具 script.read 执行成功】（总行数: ${readOut.total ?? '未知'} | 当前显示: 第 ${startLineNum}～${endLineNum} 行 | nextOffset: ${readOut.nextOffset ?? 'null'}）\n${numberedText}`);
              } else {
                toolObs.push(`${warningHeader}【工具 script.read 执行成功】\n${serializeCleanOutput(output)}`);
              }
            } else if (name === 'script.search' && output && typeof output === 'object') {
              const searchOut = output as any;
              const warningHeader = formatWarningHeader(searchOut);
              toolObs.push(`${warningHeader}【工具 script.search 执行成功】（匹配结果数: ${searchOut.total ?? (Array.isArray(searchOut.results) ? searchOut.results.length : 0)}）\n${serializeCleanOutput(output)}`);
            } else if (name === 'asset.searchProvenanceCandidates' && output && typeof output === 'object') {
              const candOut = output as any;
              const warningHeader = formatWarningHeader(candOut);
              toolObs.push(`${warningHeader}【工具 asset.searchProvenanceCandidates 执行成功】\n${serializeCleanOutput(output)}`);
            } else if (name === 'user.ask') {
              // 当 # 用户指令 已通过 negotiationLog 完整呈现多轮对话与最新回复时，不在 # 工具执行结果 中重复输出 user.ask
              if (hasMultiTurnDialogue) {
                return;
              }
              const askOut = output && typeof output === 'object' ? (output as any) : { answer: output };
              const qText = askOut.question || '向用户提问';
              const aText = askOut.answer ?? serializeCleanOutput(output);
              toolObs.push(`【工具 user.ask 执行成功（用户已回复）】\n提问内容：${qText}\n用户最新回答：${aText}`);
            } else {
              const warningHeader = formatWarningHeader(output);
              toolObs.push(`${warningHeader}【工具 ${name} 执行成功】\n${serializeCleanOutput(output)}`);
            }
          });
        }

        return {
          pageObservations: pageObs.length ? pageObs.join('\n\n') : '无',
          toolResults: toolObs.length ? toolObs.join('\n\n') : '无'
        };
      };

      const formatHistory = (histList: any[], eventList: any[]) => {
        let text = '';
        if (histList && histList.length) {
          const failures = histList.map(item => {
            if (item.role === 'agent' && item.content?.name === 'agent.failure_summary') return `【经验总结】${item.content.summary}`;
            if (item.role === 'tool' && item.content?.status === 'failed') return `【失败尝试】调用 ${item.content.name} 失败：${item.content.error || item.content.message}`;
            return '';
          }).filter(Boolean);
          if (failures.length) text += failures.join('\n') + '\n\n';
        }
        if (!eventList || !eventList.length) return text || '暂无。';
        const recentEvents = eventList.slice(-15);
        let currentTurn = '';
        recentEvents.forEach(ev => {
          if (ev.turnId && ev.turnId !== currentTurn) {
            currentTurn = ev.turnId;
            text += `\n[第 ${currentTurn.split(':').pop()} 轮]\n`;
          }
          if (ev.type === 'user') text += `用户指令：${ev.text}\n`;
          // 注意：思考过程（thought）不沉淀入 Agent 认知记录与历史上下文中，仅保留明确的事实和工具动作
          else if (ev.type === 'tool') {
            text += `执行动作：调用 ${ev.toolName}, 参数：${JSON.stringify(ev.input || {})}\n`;
            if (ev.status === 'succeeded') {
              if (ev.toolName === 'page.inspect') text += `执行结果：[已观察页面，详见当前最新观察]\n`;
              else if (ev.toolName === 'guide.lookup') text += `执行结果：[已查阅操作指南]\n`;
              else {
                let out = serializeCleanOutput(ev.output);
                if (out.length > 200) out = out.substring(0, 200) + '...';
                text += `执行结果：${out}\n`;
              }
            } else if (ev.status === 'failed') {
              text += `执行结果：[失败] ${ev.error}\n`;
            }
          }
        });
        return text.trim() || '暂无。';
      };

      const formatPlan = (plan: any[]) => {
        if (!Array.isArray(plan) || plan.length === 0) return '暂无计划';
        return plan.map(item => `[${item.status === 'completed' ? 'x' : ' '}] ${item.title}`).join('\n');
      };

      const formattedObs = formatObservations(observations);

      const effectiveCardContext = cardContext || task?.cardContext;
      let cardContextInjection = '';
      if (effectiveCardContext) {
        if (effectiveCardContext.markdownSummary) {
          cardContextInjection = effectiveCardContext.markdownSummary.trim();
        } else {
          const rawAnnotations = Array.isArray(effectiveCardContext.annotations)
            ? effectiveCardContext.annotations
            : (Array.isArray(effectiveCardContext.landmarks?.elements) ? effectiveCardContext.landmarks.elements : []);
          let annotationsText = '';
          if (rawAnnotations.length > 0) {
            annotationsText = `\n- 已有元素标注 (${rawAnnotations.length} 项):\n` +
              rawAnnotations.map((a: any) => `  * [${a.id}] ${a.label} (${a.category || '元素'}${a.point ? ` 坐标[${a.point.x},${a.point.y}]` : ''})${a.description ? ` - ${a.description}` : ''}`).join('\n');
          }
          cardContextInjection = `# 目标卡片上下文信息 (Selected Card Context)
- 卡片ID：${effectiveCardContext.cardId || effectiveCardContext.id || '未知'}
- 标题/分集：${effectiveCardContext.title || effectiveCardContext.fileName || '未命名卡片'}
- 卡片提示词：${effectiveCardContext.prompt || '无提示词'}
- 比例/分辨率：${effectiveCardContext.aspectRatio || effectiveCardContext.ratio || '默认'} (${effectiveCardContext.resolution || effectiveCardContext.res || '2K'})
${effectiveCardContext.imageUrl ? '- 图像数据：已随请求注入多模态视觉上下文' : ''}${annotationsText}`.trim();
        }
      }

      const effectiveTaskGoal = (typeof task?.goal === 'string' && task.goal.trim())
        ? cleanUserGoalText(task.goal)
        : '暂无';
      const hasToolResults = Boolean(formattedObs.toolResults && formattedObs.toolResults.trim() && formattedObs.toolResults.trim() !== '无');
      const hasPageObs = Boolean(formattedObs.pageObservations && formattedObs.pageObservations.trim() && formattedObs.pageObservations.trim() !== '无');

      const dedupedNotes = task?.notes ? mergeTaskNotes(undefined, task.notes, 'overwrite') : '';
      const defaultPlanningTemplate = [
        `# 背景`,
        `你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。`,
        `当前你处于【全局计划与验收阶段】，你的核心职责是：理解并锚定最终目标、制定传入执行阶段的“当前计划”、按需装载工具切入执行，并在计划全部达成后核验结案。`,
        ``,
        `# 用户指令`,
        `## 当前聚焦目标`,
        `{{cardContext}}`,
        `## 用户输入原文`,
        `{{userMessage}}`,
        ``,
        `# 工作指南`,
        `默认优先使用后台工具读取项目数据；需要演示或核验界面时使用 UI。基于工具返回的事实推进，严禁把未执行视为成功。`,
        `进入执行阶段前，必须制定步骤化的“当前计划”，驱动执行阶段连续执行：`,
        `1. 探查期安全原则（数据未知时）：制定宏观探查计划，调用 sys.selectContext 仅装载只读探查工具（建议 script.directory、script.search、asset.list 配套并发调用以建立全局视野），严禁提前装载写入工具；`,
        `2. 动态重规划原则（获知数据分布后）：当触发数据量预警或上一轮返回了场次分布概览（scenesSummary）时，必须在“当前计划”中将宏观任务细化为按场次/实体的具体子步骤（分步精读推进：首场读取正文并建卡、后续场次分步读取正文并增量追加）；切入执行时一次性成套装载所需的读写工具组（如 [script.read, asset.create, asset.update]），严禁跳过正文读取或单步盲目硬吞；`,
        `3. 工具装载与流转：结合“当前计划”所需工具，通过 sys.selectContext 展开分类或装载 tools 进入执行阶段；`,
        `4. 全局核验与结案：从执行阶段返回后，对照“最终目标”与“当前计划”核验所有步骤；确认全部真实达成后，调用 sys.endTask 结束任务并向用户汇报。`,
        `称用户为“你”，口吻亲和随意；遇需用户决策事项在用户沟通中说明。工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。`,
        ``,
        `# 输出格式`,
        `状态检查：`,
        `{回顾并检查上面的“认知状态”。`,
        `- 最终目标是什么？（若认知状态中为“暂无”，结合当前聚焦目标与用户输入归纳）`,
        `- 对照“当前计划”与“工具执行结果”核验推进：`,
        `  * 初次规划：列出宏观探查计划（如：[ ] 1. 探查数据现状；[ ] 2. 提取/创建资产；[ ] 3. 全局核验）；`,
        `  * 动态重规划：若触发数据量预警或已知场次分布，在此处将旧宏观步骤直接替换输出为细化后的分步子任务列表（标记 [x] 已完成、[ ] 待推进）；`,
        `  * 常规推进：列出当前计划各步骤完成状态（[x] / [ ]）。`,
        `- 最终目标与当前计划是否全部达成？若全部达成，准备调用 sys.endTask 结案；若未完成，下一步推进哪个步骤与小目标？`,
        `- 为执行当前计划，需要先展开哪些分类（categories），或挑选哪些具体工具（tools）进入执行阶段？`,
        `- 是否有关键结论需要沉淀到“重点笔记”？}`,
        `思考：`,
        `{使用内心独白的方式，围绕全局目标、计划制定与工具准备进行逻辑推演。如果需要展开分类、装载工具进入执行或结束任务，请调用对应工具，系统会自动执行你的操作。}`,
        `工具调用：`,
        `{{调用 工具名称, {"参数名": "参数值"}}}`,
        `用户沟通：`,
        `{`,
        `- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”`,
        `- 对用户说的话（简版）：“插入对用户说的话，介绍当前任务状态、汇报结果或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”`,
        `}`,
        ``,
        `# 可用工具`,
        `{{toolPrompt}}`,
        ``,
        `# 认知状态`,
        `任务标题：{{taskTitle}}`,
        `最终目标：{{taskGoal}}`,
        `当前小目标：{{taskSubGoal}}`,
        `当前进度：{{taskProgress}}`,
        `当前计划：{{taskPlan}}`,
        `重点笔记：{{taskNotes}}`,
      ].join('\n');

      const defaultExecutionTemplate = [
        `# 背景`,
        `你位于一个短剧协作平台中，负责协助用户从剧本到生图到视频的流程，你的名字是“Mira”。`,
        `当前你处于【局部执行阶段】，你的核心职责是：依据全局规划阶段制定并持续存在的“当前计划”，按步骤连续调用工具推进执行，直到计划中的所有步骤全部完成。`,
        ``,
        `# 用户指令`,
        `## 当前聚焦目标`,
        `{{cardContext}}`,
        `## 用户输入原文`,
        `{{userMessage}}`,
        ``,
        `# 工作指南`,
        `依据【认知状态 -> 当前计划】连续调用工具推进执行，基于工具返回的真实结果推进，不把未执行视为成功。`,
        `1. 事实依据原则：`,
        `   - 所有写入、修改或生成操作必须基于已读取的真实项目数据或已观察到的页面事实，按计划步骤先读取/观察、再执行写入或操作；`,
        `2. 分步执行与增量落盘：`,
        `   - 面对多批次或多步骤任务时，遵循“读取一批、核验一批、落盘一批”的增量闭环推进，避免跳过前置读取或单次囤积全量数据后再写入；`,
        `3. 工具契约与确定性真值：`,
        `   - 严格遵循当前已装载工具的参数格式与规则要求；写入或修改类工具返回成功即代表状态已落盘生效，无需额外调用查询工具重复回查；`,
        `4. 连续推进与工具流转：`,
        `   - 当前步骤完成后紧接着推进“当前计划”中的下一个未完成步骤（[ ]）；`,
        `   - 所需工具已在【当前可直接调用】列表中，直接连续调用，无需频繁退回全局计划阶段；`,
        `   - 若需补充工具可从候选简表中调 sys.selectContext({"tools": [...]}) 补充装载；所有计划全部完成后无参调用 sys.selectContext 返回全局计划阶段结案。`,
        `称用户为“你”，口吻亲和随意；工具调用统一采用标准 JSON 参数格式：{{调用 工具名称, {"参数名": "参数值"}}}（无参数可简写为 {{调用 工具名称}}）。`,
        ``,
        `# 输出格式`,
        `状态检查：`,
        `{回顾并检查上面的“认知状态”与本轮“工具执行结果 / 页面观察”。`,
        `- 对照“当前计划”，当前正在执行哪一步骤（以及对应的“当前小目标”）？`,
        `- 本轮工具返回了哪些具体结果？当前步骤是否已经完成？“当前计划”中还有哪些后续步骤待推进？`,
        `- 本轮在“工具执行结果”中发现了哪些对后续步骤有用的关键事实、ID 或原文线索？（整理列出以便沉淀到“重点笔记”）`,
        `- 当前计划各步骤状态（[x] / [ ]）与当前进度需要更新为什么？`,
        `- 下一步行动判断：若计划未完成且工具已装载，下一步调用哪个工具继续推进？若需补充工具或计划全部完成，准备调用 sys.selectContext。}`,
        `思考：`,
        `{使用内心独白的方式，结合当前【工具执行结果】中的原始明细数据、【认知状态 -> 当前计划】与已装载工具的参数说明进行逻辑推演（若本轮拟调用的工具在规则中规定了逐项核验格式，必须严格按该工具规则在思考中完整输出，不得缩写省略），确定本轮要调用的工具与具体参数。}`,
        `工具调用：`,
        `{{调用 工具名称, {"参数名": "参数值"}}}`,
        `用户沟通：`,
        `{`,
        `- 对用户说的话（完整版）：“如果需要，此处插入完整的描述，但也要尽可能简洁，注意，调用了工具不等于完成任务，要等工具返回结果并检查”`,
        `- 对用户说的话（简版）：“插入对用户说的话，介绍当前执行进展或向用户提问。需要用户回复时直接在此简版提问并调用 user.ask 挂起等待，无需在工具调用中重复回复，口语化，控制在30字以内”`,
        `}`,
        ``,
        `# 可用工具`,
        `{{toolPrompt}}`,
        ``,
        `# 认知状态`,
        `任务标题：{{taskTitle}}`,
        `最终目标：{{taskGoal}}`,
        `当前小目标：{{taskSubGoal}}`,
        `当前进度：{{taskProgress}}`,
        `当前计划：{{taskPlan}}`,
        `重点笔记：{{taskNotes}}`,
      ].join('\n');

      const rawCandidateTemplate = isLevel1
        ? (typeof customSystemExecutionPrompt === 'string' && !isObsoleteMainPrompt(customSystemExecutionPrompt)
            ? customSystemExecutionPrompt
            : getPrompt('mainExecution'))
        : (typeof customSystemPrompt === 'string' && !isObsoleteMainPrompt(customSystemPrompt)
            ? customSystemPrompt
            : getPrompt('main'));

      const activeTemplate = (rawCandidateTemplate && rawCandidateTemplate.trim().length > 0 && !isObsoleteMainPrompt(rawCandidateTemplate))
        ? rawCandidateTemplate.trim()
        : (isLevel1 ? defaultExecutionTemplate : defaultPlanningTemplate);

      const hasCardContextPlaceholder = activeTemplate.includes('{{cardContext}}');
      const userMessageReplacement = hasCardContextPlaceholder
        ? displayUserMessage
        : `## 当前聚焦目标\n${cardContextInjection || '无'}\n## 用户输入原文\n${displayUserMessage}`;

      let finalPrompt = activeTemplate
        .replaceAll('{{cardContext}}', () => cardContextInjection || '无')
        .replaceAll('{{userMessage}}', () => userMessageReplacement)
        .replaceAll('{{toolPrompt}}', () => assembledToolPrompt)
        .replaceAll('{{taskTitle}}', () => task?.title || '尚未命名')
        .replaceAll('{{taskGoal}}', () => effectiveTaskGoal)
        .replaceAll('{{taskSubGoal}}', () => task?.subGoal || '暂未设定')
        .replaceAll('{{taskProgress}}', () => task?.progress || '刚刚开始')
        .replaceAll('{{taskPlan}}', () => formatPlan(task?.plan))
        .replaceAll('{{taskNotes}}', () => dedupedNotes || '暂无笔记');

      if (finalPrompt.includes('{{toolResults}}')) {
        finalPrompt = finalPrompt.replaceAll('{{toolResults}}', () => formattedObs.toolResults);
      } else if (hasToolResults) {
        finalPrompt += `\n\n# 工具执行结果\n${formattedObs.toolResults}`;
      }

      if (finalPrompt.includes('{{pageObservations}}')) {
        finalPrompt = finalPrompt.replaceAll('{{pageObservations}}', () => formattedObs.pageObservations);
      } else if (hasPageObs) {
        finalPrompt += `\n\n# 页面观察\n${formattedObs.pageObservations}`;
      }

      if (effectiveRequireTool) {
        if (isLevel1) {
          finalPrompt += `\n\n【⚠️ 系统重要提示：本轮必须调用工具】上一轮未检测到任何 {{调用 ...}} 工具指令。当前处于【局部执行阶段】，请在【状态检查】与【思考】后，直接输出具体的业务工具调用指令推进“当前小目标”；若本阶段小目标已执行完毕，请调用 {{调用 sys.selectContext}} 返回全局计划阶段验收后再结束任务。严禁遗漏工具调用！\n`;
        } else {
          finalPrompt += `\n\n【⚠️ 系统重要提示：本轮必须调用工具】上一轮未检测到任何 {{调用 ...}} 工具指令，当前任务尚未结束。请在【状态检查】与【思考】后，务必直接输出具体的 {{调用 工具名, {参数}}} 指令推进任务。若所有目标已确实完成，请显式调用 {{调用 sys.endTask}}，结束汇报直接写在【用户沟通】中。严禁在【思考】后遗漏工具调用！\n`;
        }
      }

      const allImages: string[] = [
        ...(Array.isArray(images) ? images : []),
        ...(Array.isArray(task?.images) ? task.images : []),
        ...(Array.isArray(effectiveCardContext?.images) ? effectiveCardContext.images : []),
        ...(effectiveCardContext?.imageUrl ? [effectiveCardContext.imageUrl] : []),
      ].filter((img, idx, arr) => typeof img === 'string' && img.length > 0 && arr.indexOf(img) === idx);

      let userContent: any = finalPrompt;
      if (allImages.length > 0) {
        userContent = [
          { type: 'text', text: finalPrompt },
          ...allImages.map((img: string) => ({
            type: 'image_url',
            image_url: {
              url: img,
              detail: 'auto',
            }
          }))
        ];
      }

      const messages = [
        { role: 'user', content: userContent },
      ];
      const requestPayload: Record<string, unknown> = {
        model: actualModel,
        messages,
      };

      if (stream) {
        requestPayload.stream = true;
      }
      if (enableThinking) {
        requestPayload.thinking = { type: 'enabled' };
        requestPayload.enable_thinking = true;
        requestPayload.reasoning_effort = reasoningEffort;
        requestPayload.extra_body = {
          enable_thinking: true,
          reasoning_effort: reasoningEffort,
          thinking: { type: 'enabled' },
        };
      } else {
        requestPayload.thinking = { type: 'disabled' };
        requestPayload.extra_body = {
          thinking: { type: 'disabled' },
        };
      }

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keyToUse}` },
        body: JSON.stringify(requestPayload),
      });

      // If multimodal payload was rejected (e.g. text-only model or provider error), transparently retry with text-only payload
      if (!response.ok && Array.isArray(userContent)) {
        console.warn(`Vision payload rejected (${response.status}), retrying with text-only payload`);
        requestPayload.messages = [{ role: 'user', content: finalPrompt }];
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keyToUse}` },
          body: JSON.stringify(requestPayload),
        });
      }
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        const rawMsg = detail?.error?.message || detail?.message || `HTTP ${response.status}`;
        const isBalanceError = /insufficient\s*balance|quota|402|out\s*of\s*credit|余额不足|欠费/i.test(rawMsg);
        const isAuthError = /authentication\s*fails|invalid\s*api\s*key|unauthorized|401|api\s*key\s*is\s*invalid/i.test(rawMsg);
        const isUpstream500 = response.status >= 500 || /internal\s*server\s*error/i.test(rawMsg);
        
        const fallbackSystemKey = process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ZHIPU_API_KEY || process.env.SILICONFLOW_API_KEY;
        if (isBalanceError && fallbackSystemKey && keyToUse !== fallbackSystemKey) {
          console.warn(`User Key insufficient balance (${rawMsg}), retrying with system fallback API key...`);
          const retryRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fallbackSystemKey}` },
            body: JSON.stringify(requestPayload),
          });
          if (retryRes.ok) {
            response = retryRes;
          } else {
            throw new Error('API Key 账户余额不足 (Insufficient Balance)。请在设置页面更新有效的 API Key 或切换模型。');
          }
        } else if (isBalanceError) {
          throw new Error('API Key 账户余额不足 (Insufficient Balance)。请在设置页面更新有效的 API Key 或切换模型。');
        } else if (isAuthError) {
          throw new Error(`模型供应商鉴权失败 (401)：${rawMsg}。请在“设置 > API 密钥”中检查填写的 Key。`);
        } else if (isUpstream500) {
          throw new Error(`上游模型服务出现临时错误 (${response.status} Internal Server Error)：${rawMsg}。这通常是上游大模型服务商集群瞬时抖动，请重试或在设置中切换模型。`);
        } else {
          throw new Error(rawMsg);
        }
      }
      const message = await parseChatCompletionResponse(response, !!stream);
      
      const narration: string[] = [];
      let speakText = '';
      let fullAnswerText = '';

      if (message.reasoning_content && message.reasoning_content.trim()) {
        narration.push(message.reasoning_content.trim());
      }
      if (typeof message.content === 'string' && message.content.trim()) {
        const fullContent = message.content;

        // 1. Match short version: 对用户说的话（简版） or 对用户说的话(简版)
        const shortMatch = fullContent.match(/(?:-|\*|\+)?\s*对用户说的话\s*[（(]\s*简版\s*[）)]\s*[:：]\s*[“"']?([\s\S]*?)[”"']?(?=(?:(?:-|\*|\+)?\s*对用户说的话\s*[（(]\s*完整版\s*[）)]|\{\{|$))/i);
        if (shortMatch && shortMatch[1]) {
          speakText = shortMatch[1].replace(/^[“"'\s{]+|[”"'\s}]+$/g, '').trim();
        }

        // 2. Match full version: 对用户说的话（完整版） or 对用户说的话(完整版)
        const fullMatch = fullContent.match(/(?:-|\*|\+)?\s*对用户说的话\s*[（(]\s*完整版\s*[）)]\s*[:：]\s*[“"']?([\s\S]*?)[”"']?(?=(?:(?:-|\*|\+)?\s*对用户说的话\s*[（(]\s*简版\s*[）)]|\{\{|$))/i);
        if (fullMatch && fullMatch[1]) {
          fullAnswerText = fullMatch[1].replace(/^[“"'\s{]+|[”"'\s}]+$/g, '').trim();
        }

        // 3. Fallback for legacy format: 对用户说的话：...
        if (!speakText && !fullAnswerText) {
          const legacyMatch = fullContent.match(/(?:-|\*|\+)?\s*对用户说的话\s*[:：]\s*[“"']?([\s\S]*?)[”"']?(?=\{\{|$)/i);
          if (legacyMatch && legacyMatch[1]) {
            const raw = legacyMatch[1].replace(/^[“"'\s]+|[”"'\s]+$/g, '').trim();
            if (raw.length <= 40) {
              speakText = raw;
              fullAnswerText = raw;
            } else {
              speakText = raw.slice(0, 30) + '...';
              fullAnswerText = raw;
            }
          }
        }

        // 4. Fallback for "用户沟通：..." when model omits "对用户说的话" prefix
        if (!speakText && !fullAnswerText) {
          const commMatch = fullContent.match(/用户沟通\s*[:：]\s*\{?([\s\S]*?)\}?$/i);
          if (commMatch && commMatch[1]) {
            const rawComm = commMatch[1]
              .replace(/\{\{[\s\S]*?\}\}/g, '')
              .replace(/^[“"'\s{]+|[”"'\s}]+$/g, '')
              .trim();
            if (rawComm) {
              fullAnswerText = rawComm;
              const firstSentence = rawComm.split(/[。！？\n]/)[0] || rawComm;
              speakText = firstSentence.length > 30 ? firstSentence.slice(0, 28) + '...' : firstSentence;
            }
          }
        }

        // If only full version exists, extract first sentence for speakText
        if (!speakText && fullAnswerText) {
          const firstSentence = fullAnswerText.split(/[。！？\n]/)[0] || fullAnswerText;
          speakText = firstSentence.length > 30 ? firstSentence.slice(0, 28) + '...' : firstSentence;
        }
        // If only short version exists, fullAnswerText defaults to speakText
        if (!fullAnswerText && speakText) {
          fullAnswerText = speakText;
        }

        let cleanContent = fullContent
          .replace(/用户沟通\s*[:：]\s*\{?\s*(?:-|\*|\+)?\s*对用户说的话[\s\S]*$/gi, '')
          .replace(/(?:-|\*|\+)?\s*对用户说的话\s*[（(][^）)]*[）)]\s*[:：][\s\S]*?(?=(?:(?:-|\*|\+)?\s*对用户说的话|\{\{|$))/gi, '')
          .replace(/(?:-|\*|\+)?\s*对用户说的话\s*[:：][\s\S]*?(?=\{\{|$)/gi, '')
          .replace(/用户沟通\s*[:：][\s\S]*$/gi, '')
          .replace(/\{\{[\s\S]*?\}\}/g, '')
          .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
          .replace(/<thought>/g, '').replace(/<\/thought>/g, '')
          .trim();

        if (cleanContent) {
          narration.push(cleanContent);
        }
      }
      
      let parsed: any = {
        narration,
        speak: speakText,
        response: fullAnswerText || speakText || '',
        fullAnswer: fullAnswerText || speakText || '',
      };
      const allowedTools = enabledToolIds;
      const toolNameByFunction = new Map(AGENT_TOOL_REGISTRY.map((tool) => [functionNameForTool(tool.id), tool.id]));
      
      // ==========================================
      // 🚀 脚本直接校验与拦截引擎 (Script-Based Deterministic Validator)
      // 彻底移除中转转译大模型节点，Agent 主循环直接输出指令
      // 由纯 TypeScript 脚本执行 0ms 语法、权限与 Schema 校验
      // 正确就执行，有疑点或错误就拦截并报错反馈给主循环让其下一轮自愈调整
      // ==========================================
      const systemToolIds = new Set<string>([
        'sys.selectContext',
        'sys.updateState',
        'sys.endTask',
        'user.ask',
        'sys.setThinkingLevel'
      ]);
      const allKnownToolIds = new Set<string>([
        ...AGENT_TOOL_REGISTRY.map((t) => t.id),
        ...systemToolIds,
        'script.readMetadata',
        'script.readDirectory',
        'script.readEpisode',
        'asset.extractElements',
        'card.batchCreate'
      ]);

      const resolveNormalizedToolName = (rawName: string): string => {
        if (!rawName || typeof rawName !== 'string') return rawName;
        const trimmed = rawName.trim().replace(/^[`'"]+|[`'"]+$/g, '');
        if (allKnownToolIds.has(trimmed)) return trimmed;
        if (toolNameByFunction.has(trimmed)) return toolNameByFunction.get(trimmed)!;

        const norm = trimmed.toLowerCase().replaceAll('_', '').replaceAll('.', '');
        if (norm === 'endtask' || norm === 'sysendtask' || norm === 'finish' || norm === 'completetask') {
          return 'sys.endTask';
        }
        if (norm === 'selectcontext' || norm === 'sysselectcontext') {
          return 'sys.selectContext';
        }
        if (norm === 'updatestate' || norm === 'sysupdatestate') {
          return 'sys.updateState';
        }
        if (norm === 'userask' || norm === 'ask') {
          return 'user.ask';
        }
        for (const toolId of allKnownToolIds) {
          const toolNorm = toolId.toLowerCase().replaceAll('_', '').replaceAll('.', '');
          if (norm === toolNorm) return toolId;
        }
        return trimmed;
      };

      const rawExtractedCalls: Array<{ rawName: string; rawArgs: string; rawSpan: string }> = [];

      if (typeof message.content === 'string' && message.content.includes('{{')) {
        const text = message.content;
        let pos = 0;
        while (pos < text.length) {
          const startIdx = text.indexOf('{{', pos);
          if (startIdx === -1) break;

          let cursor = startIdx + 2;
          let curlyDepth = 0;
          let inString = false;
          let stringQuote = '';
          let escaped = false;
          let blockEnd = -1;

          while (cursor < text.length) {
            const char = text[cursor];

            if (escaped) {
              escaped = false;
              cursor++;
              continue;
            }

            if (char === '\\' && inString) {
              escaped = true;
              cursor++;
              continue;
            }

            if (inString) {
              if (char === stringQuote) {
                inString = false;
              }
              cursor++;
              continue;
            }

            if (char === '"' || char === "'") {
              inString = true;
              stringQuote = char;
              cursor++;
              continue;
            }

            if (char === '{') {
              curlyDepth++;
              cursor++;
              continue;
            }

            if (char === '}') {
              if (curlyDepth > 0) {
                curlyDepth--;
                cursor++;
                continue;
              } else if (text.startsWith('}}', cursor)) {
                blockEnd = cursor + 2;
                break;
              }
            }

            cursor++;
          }

          let inner = '';
          let rawSpan = '';

          if (blockEnd !== -1) {
            rawSpan = text.slice(startIdx, blockEnd);
            inner = text.slice(startIdx + 2, blockEnd - 2).trim();
            pos = blockEnd;
          } else {
            // Fallback for non-closed or imperfectly closed {{ block:
            // Find candidate boundary (before next {{ or next semantic section header)
            const remaining = text.slice(startIdx + 2);
            const nextBoundaryMatch = remaining.search(/\n\s*\{\{|\n\s*(?:用户沟通|状态检查|思考|小目标|全局核验|行动|进展)[:：]/);
            const candidateLen = nextBoundaryMatch !== -1 ? nextBoundaryMatch : remaining.length;
            const candidateChunk = remaining.slice(0, candidateLen).trimEnd();

            const lastDouble = candidateChunk.lastIndexOf('}}');
            if (lastDouble !== -1) {
              inner = candidateChunk.slice(0, lastDouble).trim();
              rawSpan = text.slice(startIdx, startIdx + 2 + lastDouble + 2);
              pos = startIdx + 2 + lastDouble + 2;
            } else {
              const lastSingle = candidateChunk.lastIndexOf('}');
              if (lastSingle !== -1) {
                inner = candidateChunk.slice(0, lastSingle).trim();
                rawSpan = text.slice(startIdx, startIdx + 2 + lastSingle + 1);
                pos = startIdx + 2 + lastSingle + 1;
              } else {
                inner = candidateChunk.trim();
                rawSpan = text.slice(startIdx, startIdx + 2 + candidateLen);
                pos = startIdx + 2 + candidateLen;
              }
            }
          }

          if (inner) {
            const callMatch = inner.match(/^(?:调用|call)\s*([a-zA-Z0-9_.]+)(?:[\s,，]+([\s\S]*))?$/i);
            if (callMatch) {
              rawExtractedCalls.push({
                rawName: callMatch[1].trim(),
                rawArgs: (callMatch[2] || '').trim(),
                rawSpan,
              });
            } else {
              const directMatch = inner.match(/^([a-zA-Z0-9_.]+)(?:[\s,，]+([\s\S]*))?$/);
              if (directMatch) {
                const possibleName = resolveNormalizedToolName(directMatch[1]);
                if (allKnownToolIds.has(possibleName)) {
                  rawExtractedCalls.push({
                    rawName: directMatch[1].trim(),
                    rawArgs: (directMatch[2] || '').trim(),
                    rawSpan,
                  });
                }
              }
            }
          }
        }
      }

      // Run deterministic 4-stage validation on every extracted command
      const validationErrors: Array<{ name: string; error: string; rawArgs?: string }> = [];
      const toolCalls: any[] = [];

      for (let i = 0; i < rawExtractedCalls.length; i++) {
        const item = rawExtractedCalls[i];
        const callId = `call_${Date.now()}_${i}`;
        const normalizedName = resolveNormalizedToolName(item.rawName);

        // 1. Tool Existence Check
        if (!allKnownToolIds.has(normalizedName)) {
          const err = `【工具不存在】系统不存在名为 "${item.rawName}" 的工具。可用工具请参考本轮上下文中的可用工具列表或可选工具目录。`;
          validationErrors.push({ name: item.rawName, error: err });
          toolCalls.push({ id: callId, name: item.rawName, arguments: {}, validationError: err });
          continue;
        }

        // 2. Context Injection / Permission Check
        const isSystemTool = systemToolIds.has(normalizedName);
        if (!isSystemTool && !enabledToolIds.has(normalizedName)) {
          const err = `【未在当前上下文注入】工具 "${normalizedName}" 尚未在当前思考层级（Level ${turnContext.level}）中注入。当前轮次可用工具：${[...enabledToolIds].join('、')}。如需使用该工具，请先调用 sys.selectContext 注入该工具。`;
          validationErrors.push({ name: normalizedName, error: err });
          toolCalls.push({ id: callId, name: normalizedName, arguments: {}, validationError: err });
          continue;
        }

        // 3. Arguments Syntax Parsing
        let argsObj: Record<string, any> = {};
        if (item.rawArgs) {
          const cleanedArgs = item.rawArgs.trim();
          if (cleanedArgs && cleanedArgs !== '{}') {
            const parsed = robustParseJson(cleanedArgs);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              argsObj = parsed;
            } else if (parsed && Array.isArray(parsed)) {
              argsObj = { items: parsed };
            } else if (normalizedName === 'user.ask') {
              const qStr = typeof parsed === 'string' ? parsed : cleanedArgs.replace(/^[“"'\s]+|[”"'\s]+$/g, '');
              argsObj = qStr ? { question: qStr } : {};
            } else {
              const snippet = cleanedArgs.length > 160 ? `${cleanedArgs.slice(0, 90)}...${cleanedArgs.slice(-70)}` : cleanedArgs;
              const err = `【参数语法错误】工具 "${normalizedName}" 调用参数解析失败（无法解析为合法的 JSON 对象）。当前输入片段：${snippet}。建议排查：1. 确认引号、花括号和方括号是否完整闭合；2. 建议扁平化传参（可直接传入顶层字段如 description、appearance、role、versions，无需包裹在 updates 对象中）；3. 若数据量较大，可拆分为精简单条分步提交。`;
              validationErrors.push({ name: normalizedName, error: err, rawArgs: cleanedArgs });
              toolCalls.push({ id: callId, name: normalizedName, arguments: {}, validationError: err });
              continue;
            }
          }
        }

        // 4. Semantic Schema & Constraint Validation
        let schemaError: string | null = null;

        if (normalizedName === 'sys.selectContext') {
          if (typeof argsObj.categories === 'string') {
            argsObj.categories = argsObj.categories.split(/[,，\s]+/).map((s: string) => s.trim()).filter(Boolean);
          }
          if (typeof argsObj.tools === 'string') {
            argsObj.tools = argsObj.tools.split(/[,，\s]+/).map((s: string) => s.trim()).filter(Boolean);
          }
          if (typeof argsObj.prompts === 'string') {
            argsObj.prompts = argsObj.prompts.split(/[,，\s]+/).map((s: string) => s.trim()).filter(Boolean);
          }
          if (argsObj.level !== undefined && argsObj.level !== 0 && argsObj.level !== 1) {
            schemaError = '【参数校验错误】sys.selectContext 参数 "level" 若提供则必须为 0（全局计划阶段）或 1（局部执行阶段）。';
          } else if (argsObj.categories !== undefined && !Array.isArray(argsObj.categories)) {
            schemaError = '【参数校验错误】sys.selectContext 参数 "categories" 必须为字符串数组，如 ["script", "asset"]。';
          } else if (argsObj.tools !== undefined && !Array.isArray(argsObj.tools)) {
            schemaError = '【参数校验错误】sys.selectContext 参数 "tools" 必须为字符串数组。';
          } else if (argsObj.prompts !== undefined && !Array.isArray(argsObj.prompts)) {
            schemaError = '【参数校验错误】sys.selectContext 参数 "prompts" 必须为提示词模块字符串数组。';
          } else {
            if (argsObj.categories === undefined && argsObj.tools === undefined) {
              argsObj.categories = [];
              argsObj.tools = [];
            }
            if (argsObj.level === undefined) {
              argsObj.level = (Array.isArray(argsObj.tools) && argsObj.tools.length > 0) ? 1 : 0;
            }
          }
        } else if (normalizedName === 'sys.endTask') {
          if (isLevel1) {
            schemaError = '【阶段权限拦截】当前处于局部执行阶段，不可直接调用 sys.endTask 结束任务。请先调用 {{调用 sys.selectContext}} 返回全局计划与验收阶段核对全局计划后，再调用 sys.endTask。';
          }
          delete argsObj.finalResponse;
          if (argsObj.success === undefined) {
            argsObj.success = true;
          }
        } else if (normalizedName === 'asset.create') {
          if (Array.isArray(argsObj.items)) {
            if (argsObj.items.length === 0) {
              schemaError = '【参数校验错误】asset.create 批量新增参数 "items" 数组不能为空。';
            }
          } else {
            const validTypes = ['characters', 'locations', 'props'];
            if (!argsObj.type || !validTypes.includes(String(argsObj.type))) {
              schemaError = '【参数校验错误】asset.create 缺少或无效参数 "type"，可选值必须为 "characters"（角色）、"locations"（场景）或 "props"（道具）之一。';
            } else if (!argsObj.name || typeof argsObj.name !== 'string' || !argsObj.name.trim()) {
              schemaError = '【参数校验错误】asset.create 缺少必需参数 "name"（资产名称）。';
            }
          }
        } else if (normalizedName === 'asset.update') {
          if (!argsObj.id || typeof argsObj.id !== 'string' || !argsObj.id.trim()) {
            schemaError = '【参数校验错误】asset.update 缺少必需参数 "id"（要修改的目标资产 ID）。';
          }
        } else if (normalizedName === 'asset.delete') {
          if (!argsObj.id && (!Array.isArray(argsObj.ids) || argsObj.ids.length === 0)) {
            schemaError = '【参数校验错误】asset.delete 缺少必需参数：请传入目标资产 "id"（单个）或 "ids"（批量删除数组）。';
          }
        } else if (normalizedName === 'script.search') {
          if (!argsObj.query || typeof argsObj.query !== 'string' || !argsObj.query.trim()) {
            schemaError = '【参数校验错误】script.search 缺少必需参数 "query"（检索关键词）。';
          }
        } else if (normalizedName === 'card.inspect') {
          if (!argsObj.cardId || typeof argsObj.cardId !== 'string' || !argsObj.cardId.trim()) {
            schemaError = '【参数校验错误】card.inspect 缺少必需参数 "cardId"（目标卡片 ID）。';
          }
        } else if (normalizedName === 'card.generate') {
          if (!argsObj.prompt && !argsObj.name) {
            schemaError = '【参数校验错误】card.generate 缺少必需参数：请至少提供卡片名称 "name" 或生图提示词 "prompt"。';
          }
        } else if (normalizedName === 'card.detectLandmarks' || normalizedName === 'card.annotateElements') {
          if (!argsObj.cardId || typeof argsObj.cardId !== 'string' || !argsObj.cardId.trim()) {
            schemaError = `【参数校验错误】${normalizedName} 缺少必需参数 "cardId"（目标卡片 ID）。`;
          }
        } else if (normalizedName === 'ui.actAndObserve') {
          if (!argsObj.targetId || typeof argsObj.targetId !== 'string' || !argsObj.targetId.trim()) {
            schemaError = '【参数校验错误】ui.actAndObserve 缺少必需参数 "targetId"（可见组件 ID）。';
          } else if (!argsObj.action || typeof argsObj.action !== 'string' || !argsObj.action.trim()) {
            schemaError = '【参数校验错误】ui.actAndObserve 缺少必需参数 "action"（鼠标动作名称）。';
          }
        }

        if (schemaError) {
          validationErrors.push({ name: normalizedName, error: schemaError, rawArgs: item.rawArgs });
          toolCalls.push({ id: callId, name: normalizedName, arguments: argsObj, validationError: schemaError });
          continue;
        }

        // Passed all 4 checks!
        toolCalls.push({ id: callId, name: normalizedName, arguments: argsObj });
      }

      const scriptValidatorTrace = {
        mode: 'script_validator',
        description: '命令脚本确定性校验器（纯 TypeScript 脚本，0ms 解析主模型返回文本，无二次 LLM 转译节点）',
        mainModelRawOutput: message.content,
        rawInputNote: '【说明】rawInput 是主 AI 模型（Main LLM）本轮返回的原始文本。主模型按 System Prompt 协议在输出工具指令前编写了【状态检查】与【思考】段落。脚本校验器以 0ms 纯代码提取其中的 {{调用 ...}} 指令。',
        rawInput: message.content,
        parsedOutput: toolCalls.map(c => ({ name: c.name, arguments: c.arguments, validationError: c.validationError })),
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        missingToolsWarning: (requireTool && toolCalls.length === 0) ? '【系统干预】本轮要求输出工具指令，但主模型未输出任何 {{调用 ...}} 指令' : undefined,
      };

      // Let the runtime execute sys.endTask so its completion/pause result is recorded.
      const isComplete = parsed.complete === true && toolCalls.length === 0;

      if (requireTool && toolCalls.length === 0 && !isComplete) {
        console.warn('Agent required a tool call but returned none:', JSON.stringify({ content: message.content }));
      }
      res.json({
        narration: Array.isArray(parsed.narration) ? parsed.narration.filter((item: unknown) => typeof item === 'string') : [],
        speak: typeof parsed.speak === 'string' ? parsed.speak : undefined,
        fullAnswer: typeof parsed.fullAnswer === 'string' ? parsed.fullAnswer : undefined,
        taskTitle: typeof parsed.taskTitle === 'string' ? parsed.taskTitle : undefined,
        goal: typeof parsed.goal === 'string' ? parsed.goal : undefined,
        subGoal: typeof parsed.subGoal === 'string' ? parsed.subGoal : undefined,
        progress: typeof parsed.progress === 'string' ? parsed.progress : undefined,
        failureSummaries: Array.isArray(parsed.failureSummaries) ? parsed.failureSummaries.filter((item: unknown) => typeof item === 'string' && item.trim()) : undefined,
        plan: Array.isArray(parsed.plan) ? parsed.plan.flatMap((item: any) => item && typeof item.id === 'string' && typeof item.title === 'string'
          ? [{ id: item.id, title: item.title, status: item.status === 'completed' ? 'completed' : 'pending' }]
          : []) : undefined,
        toolCalls,
        scriptValidatorTrace,
        jsonAdapterTrace: scriptValidatorTrace,
        response: typeof parsed.response === 'string' ? parsed.response : undefined,
        waitForUser: typeof parsed.waitForUser === 'string' ? parsed.waitForUser : undefined,
        complete: isComplete,
        // This is a local development endpoint. The browser debugging panel
        // receives the assembled model request and raw provider response, but
        // never API credentials.
        debug: {
          request: {
            model: actualModel,
            messages,
            tools: turnContext.tools,
            context: { level: turnContext.level, tools: turnContext.tools, prompts: [] },
          },
          response: {
            content: message.content ?? null,
            toolCalls: toolCalls,
          },
        },
      });
    } catch (error: any) {
      console.error('Agent turn error:', error);
      res.status(500).json({ error: error.message || 'Agent turn failed' });
    }
  });

  // Dedicated Lightweight Cognitive State Update Node
  app.post('/api/agent/update-state-node', async (req, res) => {
    try {
      const { currentTask, cardContext: topLevelCardContext, userMessage, lastTurnOutput, apiKey, model, statePrompt: customStatePrompt } = req.body || {};
      const { endpoint, actualModel, apiKey: keyToUse } = getModelConfig(model || 'deepseek-v4-flash', apiKey);

      const defaultDeltaMergeStatePrompt = `你是一个认知状态增量合并与整理节点。
你的职责是：对照【当前认知状态（上一轮旧状态）】，读取【本轮最新输入与主循环输出】，将主循环在“状态检查”和“思考”中产出的本轮增量变化，合并整理为最新的认知状态 JSON。

【当前认知状态（上一轮旧状态）】
- 任务标题: {{taskTitle}}
- 最终目标: {{taskGoal}}
- 当前小目标: {{taskSubGoal}}
- 当前进度: {{taskProgress}}
- 当前计划: {{taskPlan}}
- 重点笔记: {{taskNotes}}

【本轮最新输入与主循环输出】
- 阶段状态与下一轮去向: {{currentStage}}
- 当前聚焦目标实时状态:
{{cardContext}}
- 用户指令/回复: {{userMessage}}
- Agent 主循环输出:
{{lastTurnOutput}}

【输出格式（严格输出合法 JSON）】
请按以下字段顺序逐步核对并输出 JSON：
{
  "stateCheck": "一句话核对本轮增量：对照【本轮执行的工具动作】与【当前聚焦目标实时状态】，上一步小目标及关联的面板/数据更新是否已解决？本轮主循环在状态检查中提出了哪些进度/计划调整？发现了哪些需要并入重点笔记的新线索？",
  "taskTitle": "8字以内的任务简短标题（已有明确标题时保持不变）",
  "goal": "根据主循环在状态检查与思考中总结归纳出的最终目标（若处于多轮对话补充阶段，保留并融合已有最终目标）",
  "subGoal": "下一轮要推进的当前小目标（仅当【阶段状态与下一轮去向】明确显示本轮已实际执行 sys.selectContext 返回【全局计划与验收阶段】时，才更新为‘全局核验上一阶段执行结果并推进下一步或结案’；若下一轮仍处于【局部执行阶段】，必须保持为当前局部执行的具体小目标，严禁因主循环文字中预告‘完成后将返回全局阶段’而提前改为全局核验）",
  "progress": "更新后的当前进度（合并已完成事项与当前正在推进的事项）",
  "plan": [
    {"id": "1", "title": "计划步骤标题：若主循环提出了动态重规划（如根据数据量预警或 scenesSummary 场次分布细化为分步子任务列表），必须完整采纳并替换为该细化计划列表；若【本轮执行的工具动作】已完成某步数据落盘且【当前聚焦目标实时状态】已同步更新，应将对应步骤一并标为 completed", "status": "completed | pending"}
  ],
  "notes": "合并整理后的重点笔记：保留已记录的核心事实、资产ID、出处行号与人物结论（即使本轮是阶段切换轮也予以保留），在此基础上并入主循环本轮新发现的关键线索，剔除已过时的过程状态描述与冗余重复文本，保持精炼条理",
  "notesMode": "overwrite"
}`;

      let statePromptTemplate = (typeof customStatePrompt === 'string' && customStatePrompt.trim().length > 0)
        ? customStatePrompt
        : getPrompt('state');
      if (
        !statePromptTemplate ||
        !statePromptTemplate.trim() ||
        !statePromptTemplate.includes('根据主循环在状态检查与思考中总结归纳出的最终目标') ||
        !statePromptTemplate.includes('即使本轮是阶段切换轮') ||
        !statePromptTemplate.includes('阶段状态与下一轮去向') ||
        !statePromptTemplate.includes('{{cardContext}}') ||
        statePromptTemplate.includes('必须在 notes 中原样保留')
      ) {
        statePromptTemplate = defaultDeltaMergeStatePrompt;
      }

      const effectiveCardContext = topLevelCardContext || currentTask?.cardContext;
      let cardContextText = '无';
      if (effectiveCardContext && typeof effectiveCardContext === 'object') {
        if (typeof effectiveCardContext.markdownSummary === 'string' && effectiveCardContext.markdownSummary.trim()) {
          cardContextText = effectiveCardContext.markdownSummary.trim();
        } else {
          const { images: _imgs, imageUrl: _url, ...rest } = effectiveCardContext as Record<string, any>;
          cardContextText = JSON.stringify(rest);
        }
      }

      const executedToolList: any[] = (lastTurnOutput && typeof lastTurnOutput === 'object' && Array.isArray(lastTurnOutput.executedTools))
        ? lastTurnOutput.executedTools
        : [];
      const selectContextTool = executedToolList.find((t: any) => t && t.name === 'sys.selectContext' && t.status === 'succeeded');
      const nextThinkingLevel = currentTask?.thinkingLevel === 1 ? 1 : 0;

      let formattedLastTurnOutput = '';
      if (typeof lastTurnOutput === 'string') {
        formattedLastTurnOutput = lastTurnOutput;
      } else if (lastTurnOutput && typeof lastTurnOutput === 'object') {
        const narrationLines = Array.isArray(lastTurnOutput.narration)
          ? lastTurnOutput.narration.filter(Boolean).join('\n')
          : (typeof lastTurnOutput.narration === 'string' ? lastTurnOutput.narration : '');
        const commText = String(lastTurnOutput.response || lastTurnOutput.fullAnswer || lastTurnOutput.speak || '').trim();
        const toolsSummary = executedToolList.length > 0
          ? executedToolList
              .map((t: any) => {
                const summarySnippet = typeof t.summary === 'string' && t.summary.trim()
                  ? ` [${t.summary.trim().slice(0, 120)}]`
                  : '';
                return `${t.name}(${JSON.stringify(t.input || {})}) -> ${t.status}${summarySnippet}${t.error ? `: ${t.error}` : ''}`;
              })
              .join('；')
          : '无';
        formattedLastTurnOutput = [
          `  * 【状态检查与思考】：\n${narrationLines || '无'}`,
          `  * 【对用户说的话】：${commText || '无'}`,
          `  * 【本轮执行的工具动作】：${toolsSummary}`,
        ].join('\n');
      } else {
        formattedLastTurnOutput = '无';
      }

      let currentStageLabel: string;
      if (selectContextTool && nextThinkingLevel === 0) {
        const hasCategories = Array.isArray(selectContextTool.input?.categories) && selectContextTool.input.categories.length > 0;
        currentStageLabel = hasCategories
          ? '本轮在【全局计划与验收阶段】展开了工具分类，下一轮仍处于【全局计划与验收阶段】'
          : '本轮已实际执行 sys.selectContext 退出局部执行，下一轮返回【全局计划与验收阶段】';
      } else if (selectContextTool && nextThinkingLevel === 1) {
        currentStageLabel = '本轮已实际执行 sys.selectContext 装载业务工具，下一轮进入【局部执行阶段】';
      } else if (nextThinkingLevel === 1) {
        currentStageLabel = '本轮处于【局部执行阶段】执行了具体业务工具（尚未调用 sys.selectContext 退出），下一轮仍处于【局部执行阶段】';
      } else {
        currentStageLabel = '处于【全局计划与验收阶段】，下一轮仍处于【全局计划与验收阶段】';
      }

      const prompt = statePromptTemplate
        .replace('{{taskTitle}}', currentTask?.title || '尚未命名')
        .replace('{{taskGoal}}', (typeof currentTask?.goal === 'string' && currentTask.goal.trim()) ? currentTask.goal.trim() : '暂无')
        .replace('{{taskSubGoal}}', currentTask?.subGoal || '暂未设定')
        .replace('{{taskProgress}}', currentTask?.progress || '刚刚开始')
        .replace('{{taskPlan}}', JSON.stringify(currentTask?.plan || []))
        .replace('{{taskNotes}}', currentTask?.notes || '暂无笔记')
        .replace('{{currentStage}}', currentStageLabel)
        .replace('{{cardContext}}', () => cardContextText)
        .replace('{{userMessage}}', userMessage || '（无新指令）')
        .replace('{{lastTurnOutput}}', formattedLastTurnOutput);

      const requestPayload = {
        model: actualModel,
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        thinking: { type: 'disabled' },
        extra_body: { thinking: { type: 'disabled' } },
        messages: [
          { role: 'system', content: '你是一个严格输出 JSON 的认知状态增量合并与整理节点。' },
          { role: 'user', content: prompt }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keyToUse}` },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        const speakText = typeof lastTurnOutput === 'object' && (lastTurnOutput?.response || lastTurnOutput?.speak)
          ? String(lastTurnOutput.response || lastTurnOutput.speak)
          : '';
        const fallbackTitle = (userMessage || currentTask?.title || '任务运行').slice(0, 10);
        const fallbackSubGoal = speakText ? speakText.slice(0, 30) : (currentTask?.subGoal || userMessage || '正在推进任务');

        return res.status(200).json({
          taskTitle: fallbackTitle,
          goal: userMessage || currentTask?.goal,
          subGoal: fallbackSubGoal,
          progress: speakText ? '已完成本轮回答与分析' : (currentTask?.progress || '步骤运行中'),
          notes: speakText ? mergeTaskNotes(currentTask?.notes, speakText.slice(0, 100), 'append') : undefined,
          notesMode: 'overwrite',
          debugPrompt: prompt,
          fallbackNotice: `接口响应异常 (${response.status})，已启用启发式保底提炼机制`,
          apiError: errText,
        });
      }

      const data = await parseChatCompletionResponse(response, false);
      let parsed: any = robustParseJson(data.content || '{}');
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Failed to parse json from state node output:', data.content);
        parsed = {};
      }

      const resolvedNotesMode = parsed.notesMode === 'append' ? 'append' : 'overwrite';
      const consolidatedNotes = typeof parsed.notes === 'string' && parsed.notes.trim()
        ? mergeTaskNotes(currentTask?.notes, parsed.notes, resolvedNotesMode)
        : undefined;

      let resolvedSubGoal = typeof parsed.subGoal === 'string' && parsed.subGoal.trim() ? parsed.subGoal.trim() : undefined;
      if (nextThinkingLevel === 1 && resolvedSubGoal && /全局核验|返回全局/.test(resolvedSubGoal)) {
        resolvedSubGoal = (typeof currentTask?.subGoal === 'string' && currentTask.subGoal.trim())
          ? currentTask.subGoal.trim()
          : resolvedSubGoal;
      }

      res.json({
        stateCheck: typeof parsed.stateCheck === 'string' && parsed.stateCheck.trim() ? parsed.stateCheck.trim() : undefined,
        taskTitle: typeof parsed.taskTitle === 'string' && parsed.taskTitle.trim() ? parsed.taskTitle.trim() : undefined,
        goal: typeof parsed.goal === 'string' && parsed.goal.trim() ? parsed.goal.trim() : undefined,
        subGoal: resolvedSubGoal,
        progress: typeof parsed.progress === 'string' && parsed.progress.trim() ? parsed.progress.trim() : undefined,
        plan: Array.isArray(parsed.plan) ? parsed.plan : undefined,
        notes: consolidatedNotes,
        notesMode: 'overwrite',
        debugPrompt: prompt,
      });
    } catch (err: any) {
      console.error('Update state node error:', err);
      res.status(500).json({ error: err.message || 'State node update failed' });
    }
  });

  // Dedicated JSON Adapter Node (/api/agent/json-adapter)
  app.post('/api/agent/json-adapter', express.json(), async (req, res) => {
    try {
      const { sampleText, input, systemPrompt, modelType = 'deepseek-v4-flash', apiKey } = req.body;
      const rawInput = sampleText || input || '';
      const { endpoint, actualModel, apiKey: keyToUse } = getModelConfig(modelType, apiKey);

      const allTools = AGENT_TOOL_REGISTRY;
      const adapterToolPrompt = allTools
        .map((tool) => JSON.stringify({ name: tool.id, description: tool.description, parameters: parametersForTool(tool.id) }))
        .join('\n');

      const systemPromptTemplate = systemPrompt || getPrompt('jsonAdapter') || `你是一个极其精准的工具 JSON 转译节点。你的任务是将输入的伪代码、自然语言或非标指令，严格转译为符合 Schema 的标准 JSON 参数。\n\n【转译与提取准则】\n1. 完整保留对话与结束指令（核心）：\n   - 仅当输入明确包含 sys.endTask、endTask、end_task 等工具调用指令时，统一转换为 name: "sys.endTask"；严禁根据“完成任务意图”或普通对话语气自行生成 sys.endTask。\n   - 转译 sys.endTask 时直接输出 name: "sys.endTask"（无需 finalResponse 参数，结束信息在用户沟通中呈现）。\n2. Schema 自动对齐：依据【可用工具 Schema】自动映射参数（如 cardId, requirement, action），修复缺失引号、单引号或语法错误。\n3. 纯 JSON 输出：直接输出格式 {"tool_calls": [{"name": "工具名", "arguments": {...}}]}，严禁 Markdown 或多余文字。\n\n可用工具的 JSON Schema：\n{{adapterToolPrompt}}\n\n请输出严格的 JSON 格式，格式如下：\n{ "tool_calls": [{ "name": "工具名称", "arguments": { "参数名": "参数值" } }] }`;

      const finalPrompt = systemPromptTemplate.includes('{{adapterToolPrompt}}')
        ? systemPromptTemplate.replace('{{adapterToolPrompt}}', adapterToolPrompt)
        : systemPromptTemplate + `\n\n可用工具的 JSON Schema：\n${adapterToolPrompt}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keyToUse}` },
        body: JSON.stringify({
          model: actualModel,
          response_format: { type: 'json_object' },
          thinking: { type: 'disabled' },
          extra_body: { thinking: { type: 'disabled' } },
          messages: [
            { role: 'system', content: finalPrompt },
            { role: 'user', content: rawInput }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `JSON 转译节点请求失败: ${errText}` });
      }

      const data = await parseChatCompletionResponse(response, false);
      const parsed = robustParseJson(data.content || '{}') || {};
      res.json(parsed);
    } catch (err: any) {
      console.error('Json adapter error:', err);
      res.status(500).json({ error: err.message || 'Json adapter failed' });
    }
  });

  // Dedicated Ultra-Fast Visual Element Annotation Node (DeepSeek / Qwen / GLM / Doubao)
  app.post('/api/agent/detect-landmarks', async (req, res) => {
    try {
      const { imageUrl, slices, prompt, requirement, apiKey, model, ratio } = req.body || {};
      if (!imageUrl && (!Array.isArray(slices) || slices.length === 0)) {
        return res.status(400).json({ error: 'Missing imageUrl or slices' });
      }

      const effectiveRequirement = (typeof requirement === 'string' && requirement.trim()) ||
                                   (typeof prompt === 'string' && prompt.trim()) || '';
      if (!effectiveRequirement) {
        return res.status(400).json({
          error: '画面元素标注节点必须传入具体的标注要求 (requirement 或 prompt)，例如："标注画面中主要人物手持的武器与腰间饰品"'
        });
      }

      const { endpoint, actualModel, apiKey: keyToUse } = getModelConfig(model || 'deepseek-v4-flash', apiKey);

      const hasSlices = Array.isArray(slices) && slices.length > 1;

      let landmarksPromptTemplate = getPrompt('landmarks');
      if (!landmarksPromptTemplate || !landmarksPromptTemplate.trim() || landmarksPromptTemplate.includes('人体核心解剖部位必选清单')) {
        landmarksPromptTemplate = `你是一个具备卓越多模态视觉空间定位与语义解析能力的高级画面元素标注专家。
你的核心任务是：深入观察输入的图像，并严格根据调用方提出的【具体标注要求 (requirement)】，运用原生 Visual Grounding 空间感知能力，精准识别并定位符合要求的关键画面元素（不论是角色人物、肢体细节、服饰特征、武器道具、环境景观、建筑结构、光影氛围或微观纹理）。

【核心准则】
1. 意图驱动：一切标注严格以调用方传入的【具体标注要求】为准，切勿自作主张强行提取未要求的部位。
2. 数量自适应：严禁死板限制标注个数。若要求标注 1 个特定物体则精准输出 1 个；若要求密集标注全局道具，则按需输出全部符合的目标；若画面中不存在所要求的元素，则诚实返回空列表并于 summary 中说明，严禁凭空幻觉。
3. 空间包围盒：利用原生 Visual Grounding 为每个元素输出相对于全图画面的 2D 包围盒 "box_2d": [ymin, xmin, ymax, xmax]（0~1000 范围内的归一化整数，0为最顶/最左边缘，1000为最底/最右边缘），紧贴目标真实像素边缘。

【输出格式规范（严格返回合法 JSON 对象，严禁 Markdown）】
{
  "summary": "画面元素标注完成情况简述（说明识别到了哪些符合要求的元素，或未发现的原因）",
  "elements": [
    {
      "id": "elem_1",
      "label": "精准简短的元素标签（如'唐横刀'、'主光源'、'反光铜镜'、'腰间玉佩'）",
      "category": "prop | character | environment | lighting | anatomy | clothing | detail | other",
      "box_2d": [ymin, xmin, ymax, xmax],
      "importance": 0.95,
      "description": "该元素的视觉外观细节与特征描述"
    }
  ]
}`;
      }

      let userMessagesContent: any[] = [];

      if (hasSlices) {
        userMessagesContent.push({
          type: 'text',
          text: `这是一张纵向切分的长图，已沿纵向切分为 ${slices.length} 个局部高清切片：`
        });

        for (let i = 0; i < slices.length; i++) {
          const s = slices[i];
          userMessagesContent.push({
            type: 'text',
            text: `【切片 ${i} (sliceIndex: ${i}) / 共 ${slices.length} 个切片：${s.label}】（对应原图纵向区间: ${Math.round(s.yStartPercent)}% ~ ${Math.round(s.yStartPercent + s.heightPercent)}%）`
          });
          userMessagesContent.push({
            type: 'image_url',
            image_url: {
              url: s.dataUrl || s.imageUrl,
              detail: 'low'
            }
          });
        }

        userMessagesContent.push({
          type: 'text',
          text: `【画面元素标注任务要求】:
${effectiveRequirement}

【规范说明】:
1. 观察所有切片中的局部画面，严格依照上述要求精准定位对应的元素（若包含多个则全部提取，若画面中不存在则返回空列表并在 summary 中说明）；
2. 为每个识别出的元素标注所在切片编号 "sliceIndex": 0, 1, 2...；
3. 以及在该切片局部画面中的 2D 包围盒 "box_2d": [ymin, xmin, ymax, xmax]（0~1000 范围整数，紧贴目标像素边缘）；
4. 提供简明标签 label、category 及细节特征描述 description。
严格返回纯 JSON 格式。`
        });
      } else {
        const userTextPrompt = `请深入观察图像，并严格执行以下【具体标注要求】:
【具体标注要求】:
${effectiveRequirement}

【规范说明】:
1. 根据上述要求，定位图像中对应的关键画面元素，不要提取与要求无关的无关干扰，也绝不限制元素个数（按要求输出全部符合的元素，若无则输出空数组并在 summary 说明）；
2. 为每个元素输出精确紧贴边缘的 2D 归一化包围盒 "box_2d": [ymin, xmin, ymax, xmax]（0~1000 范围整数）；
3. 给出简短准确的标签 label、category 和视觉细节描述 description。
严格返回纯 JSON 格式。`;

        userMessagesContent = [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl || (slices && slices[0]?.dataUrl),
              detail: 'low'
            }
          },
          {
            type: 'text',
            text: userTextPrompt
          }
        ];
      }

      const requestPayload = {
        model: actualModel,
        response_format: { type: 'json_object' },
        thinking: { type: 'disabled' },
        extra_body: { thinking: { type: 'disabled' } },
        messages: [
          { role: 'system', content: landmarksPromptTemplate },
          {
            role: 'user',
            content: userMessagesContent
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.info(`[LandmarksNode] Model API returned status ${response.status}:`, errText);
        const fallback = generateFallbackLandmarks(effectiveRequirement);
        return res.json({
          ...fallback,
          requirement: effectiveRequirement,
          detectedAt: Date.now(),
          modelUsed: 'heuristic_fallback',
          fallbackNotice: `视觉接口响应异常 (${response.status})，已启用启发式保底定位`,
          apiError: errText,
        });
      }

      const data = await parseChatCompletionResponse(response, false);
      let parsed: any = robustParseJson(data.content || '{}');
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Failed to parse landmarks json:', data.content);
        parsed = generateFallbackLandmarks(effectiveRequirement);
      }

      // Process regions from model (supports both Object and Array structures)
      let rawRegions: Record<string, any> = {};
      if (Array.isArray(parsed.regions)) {
        for (const item of parsed.regions) {
          if (item && typeof item === 'object') {
            const key = String(item.label || item.id || item.type || item.name || '').trim().toLowerCase();
            if (key) {
              if (key.includes('head') || key.includes('头') || key.includes('面') || key.includes('face')) rawRegions.head = item;
              else if (key.includes('eye') || key.includes('眼')) rawRegions.eyes = item;
              else if (key.includes('chest') || key.includes('胸') || key.includes('领口') || key.includes('cleavage') || key.includes('neck') || key.includes('锁骨')) rawRegions.chest = item;
              else if (key.includes('leg') || key.includes('腿') || key.includes('knee') || key.includes('foot') || key.includes('feet') || key.includes('足') || key.includes('鞋')) rawRegions.legs = item;
              else if (key.includes('hand') || key.includes('手') || key.includes('arm')) {
                if (!rawRegions.hands) rawRegions.hands = [];
                rawRegions.hands.push(item);
              } else {
                rawRegions[key] = item;
              }
            }
          }
        }
      } else if (parsed.regions && typeof parsed.regions === 'object') {
        rawRegions = parsed.regions;
      }

      // Helper function to extract and transform coordinates based on slices
      function parseCentroidAndBox(item: any, fallbackType?: string): { x: number; y: number; box_2d?: [number, number, number, number]; _alreadyGlobal?: boolean } | null {
        if (!item || typeof item !== 'object') return null;

        // Parse sliceIndex robustly (handle number, string "0", "1", slice_index, slice)
        let rawIdx = item.sliceIndex ?? item.slice_index ?? item.slice;
        let sliceIdx: number | undefined = undefined;
        if (typeof rawIdx === 'number' && !isNaN(rawIdx)) {
          sliceIdx = rawIdx;
        } else if (typeof rawIdx === 'string') {
          const match = rawIdx.match(/\d+/);
          if (match) sliceIdx = parseInt(match[0], 10);
        }

        // Detect 1-based indexing if sliceIdx equals slices.length
        if (hasSlices && typeof sliceIdx === 'number') {
          if (sliceIdx >= slices.length && sliceIdx === slices.length) {
            sliceIdx = sliceIdx - 1; // Convert 1-based to 0-based
          } else if (sliceIdx < 0 || sliceIdx >= slices.length) {
            sliceIdx = undefined;
          }
        }

        // Semantic fallback if sliceIdx is missing
        if (hasSlices && sliceIdx === undefined) {
          const semantic = `${fallbackType || ''} ${item.id || ''} ${item.name || ''} ${item.label || ''} ${item.category || ''}`.toLowerCase();
          if (/head|face|eye|hair|头|面|眼|发|表情/.test(semantic)) {
            sliceIdx = 0;
          } else if (/neck|necklace|collar|chest|cleavage|bust|胸|领口|锁骨|深v/.test(semantic)) {
            sliceIdx = Math.min(1, slices.length - 1);
          } else if (/waist|hand|finger|hip|body|腰|手|指|腹|身/.test(semantic)) {
            sliceIdx = Math.min(slices.length > 3 ? 2 : 1, slices.length - 1);
          } else if (/leg|foot|feet|knee|ankle|shoe|skirt|dress|腿|足|脚|膝|踝|鞋|裙/.test(semantic)) {
            sliceIdx = slices.length - 1;
          } else {
            sliceIdx = 0;
          }
        }

        const slice = (hasSlices && typeof sliceIdx === 'number' && slices[sliceIdx]) ? slices[sliceIdx] : null;

        const rawBox = Array.isArray(item.box_2d) ? item.box_2d : (Array.isArray(item.box) ? item.box : null);
        if (rawBox && rawBox.length === 4) {
          const [b0, b1, b2, b3] = rawBox.map((v: any) => typeof v === 'number' ? v : parseFloat(v) || 0);
          const isThousandScale = Math.max(b0, b1, b2, b3) > 100;
          const scale = isThousandScale ? 10 : 1;

          let ymin = Math.min(b0, b2) / scale;
          let ymax = Math.max(b0, b2) / scale;
          let xmin = Math.min(b1, b3) / scale;
          let xmax = Math.max(b1, b3) / scale;

          if (slice) {
            ymin = slice.yStartPercent + ymin * (slice.heightPercent / 100);
            ymax = slice.yStartPercent + ymax * (slice.heightPercent / 100);
          }

          const cx = Math.round(((xmin + xmax) / 2) * 10) / 10;
          const cy = Math.round(((ymin + ymax) / 2) * 10) / 10;

          return {
            x: Math.max(0, Math.min(100, cx)),
            y: Math.max(0, Math.min(100, cy)),
            box_2d: [ymin, xmin, ymax, xmax],
            _alreadyGlobal: true,
          };
        }

        if (typeof item.x === 'number' && typeof item.y === 'number') {
          let px = item.x;
          let py = item.y;
          if (px > 100) px /= 10;
          if (py > 100) py /= 10;
          if (slice) {
            py = slice.yStartPercent + py * (slice.heightPercent / 100);
          }
          return {
            x: Math.max(0, Math.min(100, Math.round(px * 10) / 10)),
            y: Math.max(0, Math.min(100, Math.round(py * 10) / 10)),
            _alreadyGlobal: true,
          };
        }

        return null;
      }

      // Process elements using Grounding Centroid Calculation
      let rawElements = Array.isArray(parsed.elements) ? parsed.elements : (Array.isArray(parsed.interestPoints) ? parsed.interestPoints : []);
      let elements: any[] = [];
      const seenElemIds = new Set<string>();

      for (let i = 0; i < rawElements.length; i++) {
        const item = rawElements[i];
        if (!item || typeof item !== 'object') continue;
        const pos = parseCentroidAndBox(item, item.id || item.name || item.category || item.label);
        if (pos) {
          const rawId = String(item.id || item.name || `elem_${i}`).trim();
          let uniqueId = rawId;
          let counter = 1;
          while (seenElemIds.has(uniqueId)) {
            uniqueId = `${rawId}_${counter++}`;
          }
          seenElemIds.add(uniqueId);

          elements.push({
            id: uniqueId,
            label: item.label || item.name || `元素_${i + 1}`,
            category: item.category || 'detail',
            point: { x: pos.x, y: pos.y },
            box: pos.box_2d,
            description: item.description || item.label || '',
            importance: typeof item.importance === 'number' ? item.importance : 0.85,
            source: 'ai_detected',
            createdAt: Date.now(),
          });
        }
      }

      // Populate backward-compatible interestPoints from elements
      let interestPoints = elements.map(el => ({
        id: el.id,
        label: el.label,
        x: el.point.x,
        y: el.point.y,
        importance: el.importance,
        dwellSeconds: 1.8,
        transitPace: 'steady_flow',
        category: el.category,
        box: el.box,
        box_2d: el.box,
        _alreadyGlobal: true,
      }));

      // Synthesize regions for backward compatibility
      const regions: any = {};
      for (const el of elements) {
        const labelLower = (el.label + ' ' + (el.category || '')).toLowerCase();
        if (/head|face|头|面|眼/.test(labelLower) && !regions.head) {
          regions.head = { x: el.point.x, y: el.point.y, box_2d: el.box, _alreadyGlobal: true };
        } else if (/chest|bust|cleavage|胸|领口/.test(labelLower) && !regions.chest) {
          regions.chest = { x: el.point.x, y: el.point.y, box_2d: el.box, _alreadyGlobal: true };
        } else if (/leg|feet|foot|腿|足/.test(labelLower) && !regions.legs) {
          regions.legs = { x: el.point.x, y: el.point.y, box_2d: el.box, _alreadyGlobal: true };
        } else if (!regions.primaryObject) {
          regions.primaryObject = { label: el.label, x: el.point.x, y: el.point.y, box_2d: el.box, _alreadyGlobal: true };
        }
      }

      res.json({
        summary: parsed.summary || (elements.length > 0 ? `成功定位并标注 ${elements.length} 个画面元素` : '未在画面中检测到符合要求的元素'),
        requirement: effectiveRequirement,
        elements,
        interestPoints,
        regions,
        isGlobalCoordinates: true,
        detectedAt: Date.now(),
        modelUsed: actualModel,
      });
    } catch (err: any) {
      console.error('Detect landmarks error:', err);
      const fallback = generateFallbackLandmarks(req.body?.requirement || req.body?.prompt);
      res.json({
        ...fallback,
        detectedAt: Date.now(),
        modelUsed: 'heuristic_error_fallback',
        error: err.message
      });
    }
  });

  function generateFallbackLandmarks(reqText = '') {
    const elemLabel = (reqText || '').slice(0, 15).trim() || '画面核心元素';
    return {
      summary: reqText ? `根据标注要求【${reqText.slice(0, 30)}】完成保底标注` : '画面核心元素标注',
      requirement: reqText,
      elements: [
        {
          id: 'elem_fallback_1',
          label: elemLabel,
          category: 'highlight',
          point: { x: 50, y: 50 },
          box: [25, 25, 75, 75],
          description: `对应标注要求: ${reqText || '画面核心焦点'}`,
          importance: 0.9,
          source: 'ai_detected',
          createdAt: Date.now(),
        }
      ],
      interestPoints: [
        { id: 'elem_fallback_1', label: elemLabel, x: 50, y: 50, importance: 0.9, dwellSeconds: 1.8, transitPace: 'steady_flow', category: 'highlight', box_2d: [25, 25, 75, 75], _alreadyGlobal: true }
      ],
      regions: {
        primaryObject: { label: elemLabel, x: 50, y: 50, box_2d: [25, 25, 75, 75], _alreadyGlobal: true }
      }
    };
  }

  // Sub-Model Endpoint 1: High-Speed Verification of Cropped Image Patch
  app.post('/api/agent/verify-landmark-crop', async (req, res) => {
    try {
      const { cropDataUrl, label, description, apiKey, model } = req.body || {};
      if (!cropDataUrl || !label) {
        return res.status(400).json({ error: 'Missing cropDataUrl or label' });
      }

      const { endpoint, actualModel, apiKey: keyToUse } = getModelConfig(model || 'deepseek-v4-flash', apiKey);

      const verifySystemPrompt = `你是一个严谨的多模态视觉核验专家。
你的任务是：观察输入的目标局部裁剪图，判断画面中是否真实、明确地包含了所声明的目标主体【${label}】。
注意：
1. 若画面中明显包含该目标（哪怕只是特写或局部），判定为有效匹配 match: true；
2. 若画面中是一片空地、背景色块、无关杂物，或者目标主体严重缺失/与【${label}】明显不符，判定为 match: false；
3. 请以极高确定性输出 JSON：
{
  "match": true | false,
  "confidence": 0.0 ~ 1.0,
  "reason": "简短判定理由"
}
严格只返回合法 JSON，严禁任何额外解释。`;

      const requestPayload = {
        model: actualModel,
        response_format: { type: 'json_object' },
        thinking: { type: 'disabled' },
        extra_body: { thinking: { type: 'disabled' } },
        messages: [
          { role: 'system', content: verifySystemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: cropDataUrl, detail: 'low' }
              },
              {
                type: 'text',
                text: `核验目标：【${label}】${description ? `（特征参考：${description}）` : ''}。该局部画面中是否真实包含该目标？`
              }
            ]
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        // Fallback: if verification API fails, be permissive to avoid accidentally dropping valid items
        return res.json({ match: true, confidence: 0.8, reason: 'Verification API unavailable, defaulted to pass' });
      }

      const data = await parseChatCompletionResponse(response, false);
      const parsed = robustParseJson(data.content || '{}') || {};
      const match = parsed.match !== false && (parsed.valid !== false);
      const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.85;

      res.json({
        match,
        confidence,
        reason: parsed.reason || (match ? '核验通过' : '局部画面未匹配目标')
      });
    } catch (err: any) {
      console.warn('Verify landmark crop error:', err);
      res.json({ match: true, confidence: 0.8, reason: 'Self-check exception fallback to pass' });
    }
  });

  // Sub-Model Endpoint 2: High-Precision Single-Target Re-Annotation
  app.post('/api/agent/detect-single-landmark', async (req, res) => {
    try {
      const { imageUrl, label, description, apiKey, model } = req.body || {};
      if (!imageUrl || !label) {
        return res.status(400).json({ error: 'Missing imageUrl or label' });
      }

      const { endpoint, actualModel, apiKey: keyToUse } = getModelConfig(model || 'deepseek-v4-flash', apiKey);

      const singlePrompt = `你是一个单目标极高精度视觉定位定位专家。
你的唯一任务是：在全图画面中，全力聚焦搜寻单个指定目标【${label}】。
请仅输出这一个目标的紧密 2D 归一化包围盒 "box_2d": [ymin, xmin, ymax, xmax]（0~1000 范围整数，紧贴像素边缘）。
若画面中确实不存在该目标，请诚实返回 "box_2d": null。

输出格式规范（严格返回纯 JSON，严禁 Markdown）：
{
  "found": true | false,
  "label": "${label}",
  "box_2d": [ymin, xmin, ymax, xmax] | null,
  "confidence": 0.0 ~ 1.0,
  "description": "目标在画面中的位置与视觉特征简述"
}`;

      const requestPayload = {
        model: actualModel,
        response_format: { type: 'json_object' },
        thinking: { type: 'disabled' },
        extra_body: { thinking: { type: 'disabled' } },
        messages: [
          { role: 'system', content: singlePrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl, detail: 'low' }
              },
              {
                type: 'text',
                text: `请在全图中精准定位单一目标：【${label}】${description ? `（特征描述：${description}）` : ''}`
              }
            ]
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        return res.json({ found: false, box_2d: null, error: 'Model failed' });
      }

      const data = await parseChatCompletionResponse(response, false);
      const parsed = robustParseJson(data.content || '{}') || {};

      let box_2d: [number, number, number, number] | null = null;
      const rawBox = Array.isArray(parsed.box_2d) ? parsed.box_2d : (Array.isArray(parsed.box) ? parsed.box : null);
      if (rawBox && rawBox.length === 4) {
        const [b0, b1, b2, b3] = rawBox.map((v: any) => typeof v === 'number' ? v : parseFloat(v) || 0);
        const isThousandScale = Math.max(b0, b1, b2, b3) > 100;
        const scale = isThousandScale ? 10 : 1;
        const ymin = Math.min(b0, b2) / scale;
        const ymax = Math.max(b0, b2) / scale;
        const xmin = Math.min(b1, b3) / scale;
        const xmax = Math.max(b1, b3) / scale;
        box_2d = [ymin, xmin, ymax, xmax];
      }

      const found = (parsed.found !== false) && !!box_2d;

      res.json({
        found,
        label,
        box_2d,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
        description: parsed.description || label
      });
    } catch (err: any) {
      console.warn('Detect single landmark error:', err);
      res.json({ found: false, box_2d: null, error: err.message });
    }
  });

  // Catch-all 404 for unmatched /api routes - ALWAYS return JSON, never fallback to Vite SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.path}` });
  });

  // Global error handler for API routes - ALWAYS return JSON, never HTML
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error('[API Error]:', err);
    const rawStatus = typeof err.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500);
    // Cloud Run GFE intercepts 502/503/504 and replaces JSON with HTML error pages, so normalize to 500
    const safeStatus = (rawStatus === 502 || rawStatus === 503 || rawStatus === 504) ? 500 : rawStatus;
    res.status(safeStatus).json({
      success: false,
      error: err.message || 'Internal server error',
      details: err.details || undefined,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        // Keep the module cache current; HMR remains disabled above.
        watch: {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
