# 画布 3 种分批加载机制完善方案 (Canvas Batch Loading Modes Plan)

## 一、三种加载模式的目标行为契约

| 维度 | 1. 即时分批加载 (`immediate`) | 2. 懒分批加载 (`lazy`) | 3. 混合分批加载 (`hybrid`) |
| :--- | :--- | :--- | :--- |
| **核心设计目标** | **视野所及、边动边载**：平移或缩放过程中，视口内新进入的卡片按离视口中心由近及远平滑、不间断地逐张挂载。 | **极致跟手、动时零挂载**：平移或缩放过程中完全冻结 DOM 卡片增删与 LOD 升格，100% 依靠 `NanoLodCanvas` 轻量预览维持满帧；停下或触发左键意图后再分批挂载。 | **视觉焦点优先（Foveated Loading）**：手势移动或悬停时，**优先且仅挂载鼠标指针焦圈内**的卡片，焦圈外卡片保持 `NanoLodCanvas` 轻量预览；手势停止后再补齐焦圈外其余可见卡片。 |
| **手势期视口裁剪** | 每 `80ms` 增量更新可见集合 | **完全冻结**（手势结束后一次性计算） | 每 `80ms` 增量更新可见集合 |
| **手势期跨 `0.40` LOD 升格** | 实时越过 `0.40` 即激活 DOM 队列 | **冻结在 Nano LOD**，直至手势停止或左键点击才升格 DOM | 实时激活 DOM 队列，但手势期**仅准入焦圈内卡片** |
| **手势期挂载队列行为** | 按视口中心向外连续消费，**新卡入视口只更新待处理池，绝不中断当前正在挂载的卡片** | 立即暂停队列，零新卡挂载 | 动态挑选焦圈内待挂载卡片优先上屏；鼠标移动时实时唤醒 |

---

## 二、具体代码级完善措施

### 1. 将 `runCenterOutMountQueue` 改造为「非中断式动态优先队列」
- **涉及文件**：`src/App.tsx`
- **改进内容**：
  - **在途任务保护（In-Flight Protection）**：当 `isQueueProcessingRef.current === true` 且未因切入 `NanoLOD` 或 `lazy` 手势暂停时，`visibleCards` 刷新只卸载移出视口的卡片并唤醒等待池，不再调用 `mountQueueAbortRef.current.cancel()` 中断正在执行的单卡挂载。
  - **动态优先级重算（Dynamic Next-Card Selection）**：每完成 1 张卡片挂载与 `card-painted` 确认后，下一轮循环实时从最新 `visibleCardsRef.current` 与 `renderedCardIdsRef.current` 中筛选未挂载卡片，动态计算距离（`immediate` 按视口中心距离，`hybrid` 手势期按鼠标指针距离）取出最优卡片。
  - **移除中键平移起手时的无条件中断**：`startCanvasMiddlePan` 仅在 `lazy` 模式下派发 `abort-mount-queue`。

### 2. 重构 `hybrid`（混合分批加载）焦圈判定、锁存与鼠标唤醒机制
- **涉及文件**：`src/utils/canvasPerformance.ts`、`src/App.tsx`
- **改进内容**：
  - **合理化自适应焦圈半径**：将基础半径提升至 `Math.max(160, Math.min(320, shortSide * 0.9))`（配合 `300 / 380` 迟滞防抖），适应平移速度。
  - **入队即锁存（Latch on Pick）**：一旦卡片在焦圈内被选中进入 `scheduleCanvasSurface`，回调执行时仅校验其是否仍在视口内（`stillVisible.has(id)`），不再因几帧间的相对位移撤销挂载。
  - **鼠标移动实时唤醒（Pointer Wakeup）**：`pointermove` 在 `hybrid` 模式下以 `50ms` 节流派发 `canvas-hybrid-pointer-wake` 事件，立即唤醒等待焦圈内卡片的挂载循环与表面绘制队列。

### 3. 加固 `lazy`（懒分批加载）手势期跨 LOD 阈值冻结
- **涉及文件**：`src/App.tsx`
- **改进内容**：
  - 在 `tScale.on('change')` 中，若当前处于手势中且为 `lazy` 模式，从 `< 0.40` 放大跨越阈值时暂不将 `isNanoLod / isMicroLod` 切换为 `false`，保持 `NanoLodCanvas` 持久降级渲染，直到 `restoreCanvasStyles`（手势停止或左键点击意图恢复）时再统一升格。

### 4. 补齐 `ProgressiveGenerationCard` 的响应式订阅源
- **涉及文件**：`src/components/ProgressiveGenerationCard.tsx`
- **改进内容**：
  - 订阅 `subscribeCanvasLoadingMode`、`canvas-styles-restored`、`canvas-gesture-start` 与 `canvas-hybrid-pointer-wake`，确保模式切换、手势恢复与焦圈逼近时准入快照即时更新。

### 5. 优化 `SettingsPage.tsx` 加载模式切换控件的视觉反馈
- **涉及文件**：`src/components/SettingsPage.tsx`
- **改进内容**：
  - 为三种开启模式提供各自清晰的语义化激活态配色（`immediate` 紫罗兰色、`lazy` 琥珀色、`hybrid` 翠绿色），解决切换到 `lazy` 或 `hybrid` 时文案显示“（开启）”但按钮呈灰色禁用态的矛盾。
