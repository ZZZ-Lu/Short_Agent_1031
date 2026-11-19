# 画布大比例缩小（500% -> 100% / 100% -> 10%）卡顿排查与修复方案

> 文档创建日期：2026-11-18  
> 适用范围：无限画布双击缩放、滚轮手动缩放及缩小时高分纹理回收与轻量画布绘制链路  
> 约束遵循：`AGENTS.md`（数据与 DOM 解耦 / 意图驱动懒恢复 / 增量存储不回退）

---

## 一、问题描述与实测性能基线

在包含 24 张 4K (`3840x2160`) 图像卡片的真实场景（`http://localhost:3000` + 无头 Chromium）下，执行缩小时卡顿复现（`500% -> 100%` 双击、`100% -> 10%` 双击及对应手动滚轮缩放），Trace 与 Long Animation Frame (LoAF) 实测基线如下：

| 场景 | 关键实测指标 | 主要耗时热点 |
| --- | --- | --- |
| **双击缩小 `500% -> 100%`** | `FunctionCall: 1335ms`、`EventDispatch: 500ms`（`pointerdown: 309ms`, `pointerup: 89ms`）、`performWorkUntilDeadline: 513ms + 204ms + 89ms` | 1) 空画布点击触发多次 `<App>` 全量重渲染并穿透 `<ProjectScriptBible>` 与 `<AgentCursor>`；2) 补间/滚轮跨过 `200%` 阈值瞬间，所有 4K 卡片在同一帧同步 `setShowOriginal(false)` 并摧毁/重绘 `<canvas>` |
| **双击缩小 `100% -> 10%`** | `FunctionCall: 433ms`、`EventDispatch: 399ms`、`MinorGC` + 多段 `performWorkUntilDeadline` | 空画布点击全量重渲染 + `NanoLodCanvas` 高 DPR + `'high'` 图像平滑重绘 + `mountEpoch` 冗余全树重渲染 |
| **手动滚轮缩小 `500% -> 100%`** | `maxGap: 1583ms`、`LoAF: dur=624ms, blk=276ms`（`performWorkUntilDeadline: 321ms, fsl=51`） | 滚轮连续触发跨过 `200%` 瞬间同步回收所有 4K backing store + 强制同步布局 (`fsl`) + 网格离屏 tile 每帧重建 |
| **手动滚轮缩小 `100% -> 10%`** | `maxGap: 1200ms`、`LoAF: dur=372ms`（`handleWheel: 55ms, fsl=54`、`NanoLodCanvas.draw: 54ms`） | `handleWheel` 写入 `data-zooming` 后立即调用 `getBoundingClientRect()` 强制同步样式重算 (`54ms`)；`NanoLodCanvas` 每帧以 `1.5x DPR` + `imageSmoothingQuality='high'` 绘制全视口卡片 (`54ms`) |

---

## 二、五大根因定位

1. **交互手势触发无意义的 `<App>` 同步全量重渲染（`EventDispatch: 399–500ms`）**
   - `App.tsx` 的 `onPointerDown` 每次点击空白画布都会无条件执行 `setSelectedCardIds([])`（即使本为空数组也会创建新引用）并立即 `setSelectionBox(...)`，`onPointerUp` 再置回 `null`，导致双击动作本身先触发 **4 次同步 React 重渲染**。
   - `hoveredCardId` 状态仅写入未消费，鼠标进出卡片仍不断触发 `<App>` 重渲染。
   - `<ProjectScriptBible>`（6000+ 行）虽包了 `React.memo`，但 `handleSelectProject` / `handleCreateProject` / `handleRenameProject` / `handleDeleteProject` / `handleUpdateCurrentProject` / `handleRequestGenerateAsset` 均为普通函数，每次 `<App>` 渲染都破坏 memo；`<AgentCursor>` 的 inline `onDragAgent` / `onDismissSpeak` / `quickInput` 同样破坏 memo。
   - `setMountEpoch` 仅为了触发 effect 调用 `runCenterOutMountQueue()`，额外制造了整树重渲染。

2. **缩小过程中（`500% -> 100%`）4K 画布在手势未结束时同步降级销毁与重绘（`321–513ms`）**
   - `GenerationCard.tsx` 在 `onZoom` / `onDrag` 检测到 `scale < 2.0` 时，未判断是否处于主动缩小手势或补间动画中，直接在手势半途同步调用 `setShowOriginal(false)`。
   - 24 张卡在同一帧内同时触发 `CardImageCanvas` 的 `useLayoutEffect` 将 `<canvas>` 从 4K (`3840x2160`) 缩回 `1200px` 代理尺寸并以 `'high'` 平滑重采样。实际上在缩小动画期间，GPU 合成层已经缓存了 4K 位图，直接通过 `transform` 缩放在 0 CPU 开销下更清晰且完全不卡。

3. **`handleWheel` 内部存在 DOM 写后读导致的强制同步布局（`fsl=54ms`）**
   - `handleWheel` 先对 `#canvas-workspace` 设置 `data-zooming="true"` 和 `data-gesture="true"`（使全画布大量节点样式失效），紧接着调用 `container.getBoundingClientRect()`，强迫 Chromium 主线程同步计算整棵 DOM 树的样式与布局，单次事件即耗时 `54ms`。

4. **`NanoLodCanvas` 在主动缩小手势期间仍保持高 DPR（`1.5x`）与高代价双三次重采样（`54ms/frame`）**
   - 与已经会在手势期间降级为 `1x DPR` 的背景点阵不同，`NanoLodCanvas.tsx` 在高速缩放/Nano 过渡期仍以 `1.5x DPR`（2.25 倍像素量）+ `imageSmoothingQuality = 'high'` 绘制所有可见卡片；且 `handleDomSurfaceEvent` 在未切入 Nano 时也可能频繁调度全屏重绘。

5. **点阵背景在大比例（`133% ~ 500%`）缩放期间逐帧重建离屏 Canvas Pattern**
   - `computeGridPatternSpec` 在 `deviceSpacing >= 64` 时令 `tileSize = Math.round(deviceSpacing)`，导致 `500% -> 100%` 动画每一帧 `tileSize` 都在变化，`CanvasGridBackground` 每帧都会改变离屏 `tile.width/height` 并重新调用 `createPattern`。

---

## 三、分模块修改方案（严格数据-DOM 解耦）

所有策略判定均沉淀为可独立单元测试的纯函数，React 与 DOM 仅作为渲染适配层：

1. **纯策略工具层（`src/utils/viewportCulling.ts` & `src/utils/canvasPerformance.ts`）**
   - **`shouldDeferOriginalTierDowngrade(scale, isGestureActive, isZoomingOut, isTweenZooming)`**：处于缩小/补间/手势期间返回 `true`，推迟 `showOriginal` 4K 降级至 `canvas-styles-restored` 空闲阶段，并通过 `scheduleCanvasSurface` 分帧平滑释放，避免所有卡在同一帧同时重绘。
   - **`scheduleOriginalImageDowngrade(...)`**：利用现有自适应画布帧预算队列（`scheduleCanvasSurface`）错峰回收 4K 缓冲区。
   - **`computeNanoCanvasRenderQuality(scale, isGestureActive, isZoomingOut, simplifyCard)`**：手势/快速缩小期间返回 `{ dprCap: 1, imageSmoothingQuality: 'low' }`，静止恢复 `{ dprCap: 1.5, imageSmoothingQuality: 'high' }`。
   - **`shouldSkipCardCanvasResizeDuringGesture(...)`**：保护 `CardImageCanvas` 在手势进行中不被顺手缩容清空既有高清缓冲，同时标记 `needsRestoreRedrawRef` 于静止后精确对齐。
   - **`computeGridPatternSpec` 稳定分档**：在保持圆点视觉半径恒定（`1.76 CSS px`）与间距随缩放单调变化的前提下，将 `tileSize` 收敛为稳定阶梯尺寸（如手势期间固定 `128`，静止时仅离散档位 `64 / 128 / 256 / 512`）并用 `pattern.setTransform` 完成无损缩放，彻底消除 `133% ~ 500%` 缩放期间逐帧重置离屏 tile 与 `createPattern`。

2. **交互状态与强制布局修复（`src/App.tsx`）**
   - **消除空白画布点击/双击重渲染**：
     - 在 `onPointerDown` 中使用 `pendingSelectionRef` 记录按下信息，**不**立即 `setSelectionBox` 与清空 `selectedCardIds`；仅当指针拖动位移 `> 3px` 时激活框选 `selectionBox`，或在单纯点击抬起且 `selectedCardIdsRef.current.length > 0` 时按需清空。
     - `onPointerMove` 框选仅在选中集合实际发生变化时调用 `setSelectedCardIds`。
     - 删除未使用的 `hoveredCardId` 状态与 `onHover` prop。
   - **修复 `React.memo` 穿透**：
     - 将 `handleSelectProject`、`handleCreateProject`、`handleRenameProject`、`handleDeleteProject`、`handleUpdateCurrentProject`、`handleRequestGenerateAsset` 通过 `useCallback` + Refs 稳定化，锁住 `<ProjectScriptBible>` 缓存。
     - 稳定化 `<AgentCursor>` 的 `onDragAgent`、`onDismissSpeak` 及 `quickInput`（含 `useMemo` 与稳定回调）。
     - 移除仅作信号用途的 `mountEpoch` React state，直接调用 `runCenterOutMountQueue()`。
   - **消除 `handleWheel` / `handleDoubleClick` 强制同步布局 (`fsl`)**：
     - 使用 `containerRectRef` + `ResizeObserver` / `resize` 缓存画布容器几何矩形；读取坐标优先走缓存或早于一切 `setAttribute('data-zooming' / 'data-gesture')` DOM 写操作。

3. **高分画布与轻量层优化（`GenerationCard.tsx`、`CardImageCanvas.tsx`、`NanoLodCanvas.tsx`、`CanvasGridBackground.tsx`）**
   - `GenerationCard.tsx`：手势/补间缩小期间保持现有 `showOriginal` 纹理不被销毁；在 `canvas-styles-restored` 时通过 `scheduleOriginalImageDowngrade` 按距离分批降级回收。
   - `CardImageCanvas.tsx`：手势活跃期跳过缩容性 `<canvas>` 尺寸重置，静止后通过 `canvas-styles-restored` 恢复目标尺寸。
   - `NanoLodCanvas.tsx`：结合 `computeNanoCanvasRenderQuality`，手势期间降级到 `1x DPR` + `'low'` 平滑并在静止恢复后重绘为 `1.5x DPR` + `'high'`；跳过无 DOM 更新需求下的冗余事件重绘。
   - `CanvasGridBackground.tsx`：基于阶梯化 `tileSize` 与手势容差避免逐帧重建 `createPattern`。

---

## 四、验收与回归验证标准

1. **单元测试**：在 `tests/canvas-performance/zoom-out-optimization.test.ts` 中覆盖所有新增纯策略函数，全部通过；`npm run test:storage` 通过。
2. **构建与静态检查**：`compile_applet` 与 `lint_applet` 联合零报错通过。
3. **无头浏览器实测回归（24 张 4K 场景）**：
   - `dbl_500_100` 与 `dbl_100_10` 触发前的 `EventDispatch` 与 `performWorkUntilDeadline` 峰值显著下降，不再出现空点击触发整树重渲染及全卡同帧销毁 4K 画布导致的 `300–500ms` 阻塞。
   - `wheel_500_100` 与 `wheel_100_10` 的 `fsl` 强制同步布局降至 `0`，`NanoLodCanvas` 单帧耗时与 `maxGap` 大幅下降，过程流畅无白屏闪烁；`500%` 静止后 4K 锐利画质、点阵视觉大小（`1.76px`）与零新增控制台报错全部保持正常。
