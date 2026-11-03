# Mira Agent 双模执行架构 (Dual-Mode Execution Architecture)

## 1. 架构动机与核心设计

为了在生产型任务中获得**极高的执行效率、降低 Token 消耗、避免 DOM 渲染阻塞**，同时在教学与引导场景中**保留直观的人机视效交互**，Mira Agent 采用双模执行架构：

- **后台高能模式 (Direct Data / Headless Mode)**：**默认主模式**。Agent 批量处理剧本、拆分集数、解析资产设定或创建构想卡片节点时，直接调用后台纯 API 工具（如 `script.readEpisode`, `script.readDirectory`, `asset.extractElements`, `card.batchCreate`）。该模式下 **0 延迟、100% 准确率、无 DOM 渲染与动画耗时**。
- **UI 演示模式 (Visual Demo / Walkthrough Mode)**：**辅助演示模式**。当任务目标涉及用户界面教学（“演示怎么在画布上操作”、“帮 me 在屏幕上找到XXX”）或页面调试时，Agent 触发视效与鼠标演示工具（`page.inspect`, `ui.actAndObserve`, `guide.lookup`），驱动真实的虚拟鼠标轨迹与视口聚焦。

---

## 2. 工具链分类 (Tool Taxonomy)

| 分类 | 工具标识 | 运行模式 | 说明 |
| :--- | :--- | :--- | :--- |
| **剧本数据** | `script.readMetadata` | 后台高能模式 | 获取剧本基本元数据（总字数、集数、首尾集概览） |
| | `script.readDirectory` | 后台高能模式 | 后台直接获取分集目录列表，支持翻页与检索 |
| | `script.readEpisode` | 后台高能模式 | 直接读取指定分集正文，支持指定行与摘要截取 |
| | `script.search` | 后台高能模式 | 剧本全文或单集关键字/正则极速检索 |
| **资产管理** | `asset.extractElements`| 后台高能模式 | 大模型智能提取剧本中的角色、场景、道具设定 |
| | `asset.list` | 后台高能模式 | 读取资产圣经中的角色卡/场景卡/道具卡属性 |
| | `card.batchCreate` | 后台高能模式 | 后台批量创建构想卡片节点并矩阵排布 |
| **页面观察** | `page.inspect` | UI 演示模式 | 观察当前视口/可见 DOM 组件事实 |
| | `card.inspect` | 混合模式 | 深入探针索取卡片的高清生成图像与元参数 |
| **页面交互** | `ui.actAndObserve` | UI 演示模式 | 驱动 Agent 鼠标模拟点击、拖拽、滚动等视觉动作 |
| | `card.detectLandmarks` | 混合模式 | 画面的空间定位与语义标注 CRUD |
| | `card.generate` | 混合模式 | 卡片配置生图/派生复刻 |
| **操作知识** | `guide.lookup` | 通用 | 查询界面操作路径与指导说明 |
| **系统控制** | `sys.endTask` / `user.ask` | 通用 | 任务闭环控制与用户沟通 |

---

## 3. 数据与 UI 同步契约 (Data-DOM Decoupling Sync)

1. **状态驱动 UI**：后台工具仅修改 Zustand/React Core Data 模型。模型更新后，React 视图平滑重绘，无需 Agent 手动点击 UI 刷新。
2. **无感平滑视口滚动**：当 Agent 在后台创建或修改节点后，应用层将自动联动滚动视口聚焦到最新的产物节点，保证用户界面时刻保持最新视野。
3. **渐进式 Token 保护**：在后台模式下，Agent 依然遵循按需读取原则，禁止将几百万字剧本全量灌入上下文，统一采用 `script.readEpisode` 逐集提取。
