# 七七 · 待机 / 思考 —— 完整交接包

紫色三角 Agent 的两个常态循环动画。**这份文档自带全部源码**，不依赖任何外部文件，读完即可重建整套东西。

技术栈：纯 SVG + SMIL。没有动画库、没有 CSS keyframes、没有构建步骤、没有依赖。任何一个能渲染 `<svg>` 的环境都能跑。

## 0. 快速接入

```js
QIQI.mk('idle', 88)              // → 字符串，塞进容器
QIQI.mount(el, 'think', 88)      // 直接挂载并把时间轴归零
QIQI.mk('idle', 96, '40.5 47 19 19', true)   // 局部特写：自定义 viewBox + 去掉整体摆动
```

保存下面的源码后，`window.QIQI` 即为此接口。

| 保存为                    | 在本文档的位置                         |
| ---------------------- | ------------------------------- |
| `qiqi-idle-think.html` | §7.1（自包含预览页，`<script>` 里就是生成代码） |
| `anim-idle.svg`        | §7.2（待机成品，可直接 `<img src>`）      |
| `anim-think.svg`       | §7.3（思考成品）                      |

---

## 1. 形象构成

一个圆角三角形（圆角半径 10）当身体，左上角延伸出去就是"鼠标指针尖"的方向感。  
脸上只有三样东西：两个白圆眼、一个同色瞳点、一条白嘴。

- 画布 `viewBox="0 0 100 100"`，所有坐标都在这个空间里
- 主体紫 `#8B7CE6`，面部白 `#FFFFFF`（只有这两色，瞳孔也用紫，不要黑）
- 三角路径：

```
M29.2 18 L70.8 36 Q80 40 73.3 47.4 L46.7 76.6 Q40 84 37.3 74.4 L22.7 23.6 Q20 14 29.2 18 Z
```

## 2. 关键坐标

| 项    | 值                           | 备注                               |
| ---- | --------------------------- | -------------------------------- |
| 两眼中心 | `x = 47.5 / 62.5`，`cy = 44` | 眼距 15，中间缝隙 5.2                   |
| 眼半径  | `4.9`                       | **眼长 9.8，这是后面所有尺寸的基准单位**         |
| 瞳点半径 | `1.85`                      | 偏移后必须留 >1.5 白边：`4.9 − 偏移 − 1.85` |
| 旋转轴心 | `(20, 14)`                  | 三角两条直边延长后的交点，即"针尖"               |
| 嘴    | `y ≈ 55.6–57.3`，视觉宽 `12.6`  | ≈1.29 个眼长                        |
| 嘴线宽  | `3.2`（思考 3.0）               | 和闭眼弧线 2.9 同一档                    |

**为什么轴心是 (20,14)**：TRI 路径的左上角做了圆角，视觉上的尖被切掉了。把圆角还原成直边，左边界 `(37.3,74.4)→(22.7,23.6)` 与上边界 `(29.2,18)→(70.8,36)` 延长后交于 `(19.94, 13.99)`。

## 3. 状态参数

### 待机 `idle`

| 部件 | 参数                                | 在演什么                             |
| -- | --------------------------------- | -------------------------------- |
| 眨眼 | 眼睑 3.2s：关 96ms · 停 96ms · 开 192ms | 紫色矩形**从上下覆盖**白眼球，不是把眼球压扁         |
| 眼神 | 7.6s 扫 4 次，单次 0.15s               | 是 saccade（停 → 猛跳 → 停），**不能平滑游移** |
| 呼吸 | 嘴 5.6s，顶点沉 0.65，两端钉住              | 只有下颌在自重下微沉；两端一动就读作咀嚼             |
| 摆动 | 绕针尖 ±0.55°，5.2s，正弦采样 8 段          | 几乎看不出的微摆，只为不是一张死图                |

注视路径（相对眼心，10 帧 = 5 个位置各一对停留首尾）：

```
右上 (0.95,-1) → 左 (-1.15,-0.75) → 右下 (1.25,0.55) → 下偏左 (-0.35,1.35) → 回右上
keyTimes: 0;0.16;0.18;0.44;0.46;0.68;0.70;0.86;0.88;1
```

白边核算：`4.9 − 偏移 − 1.85` 分别为左 1.68、右下 1.68、下偏左 1.66，都过了 1.5 底线。

### 思考 `think`

| 部件 | 参数                       | 在演什么                   |
| -- | ------------------------ | ---------------------- |
| 转瞳 | 瞳心绕眼心 r=2.25 转圈，0.9s / 圈 | 贴着眼白边缘转＝在脑子里翻找；慢转就只是发呆 |
| 抿嘴 | 宽度 6.8 → 5.7，2.8s        | 用力想是**抿紧变短**；拉长＝撇嘴，一定错 |
| 摆动 | 绕针尖 ±1.7°，1.9s           | 钟摆式缓慢左右                |

两个状态的区别不在"动得多快"，在**轨迹性质**：待机是点对点跳变（看），思考是绕圈（翻找）。

### 时序总表

| 项       | 待机              | 思考           |
| ------- | --------------- | ------------ |
| 眨眼      | 3.2s            | —（无眼睑）       |
| 眼神 / 转瞳 | 7.6s + 单次 0.15s | 0.9s / 圈     |
| 嘴       | 5.6s            | 2.8s         |
| 摆动      | 5.2s · ±0.55°   | 1.9s · ±1.7° |

四个周期（3.2 / 7.6 / 5.6 / 5.2）**互不整除**，所以四条节奏永远不会同时停、同时动。加状态时新周期也照这个原则挑。

## 4. 接口与数据

```js
QIQI = {
  mk(st, size, vb, noTilt),   // → SVG 字符串（vb 默认 "0 0 100 100"）
  mount(el, st, size, vb, noTilt),  // innerHTML + setCurrentTime(0)
  states: S,                   // 状态定义对象，可读可改
  tri: TRI,
  pivot: PIVOT
}
```

`S` 里每个状态的可选字段：

- `r`：眼半径
- `ry`：把眼球压成横椭圆（半闭眼，慎用，固定读作"困"）
- `pupil`：`{cx, cy, r}` 静止瞳 / `{gx, gy, gkt, gdur}` 二维轨迹 / `{r}` 配合 `orbit`
- `orbit`：`{r, dur}`，瞳点绕圈
- `lids`：眨眼周期（数字），加了才会画眼睑
- `tilt`：`{v, kt, dur}`，绕针尖旋转的关键帧
- `mouth`：`{ds, kt, w, dur, ws?}`，`ds` 是若干帧 `d`

## 5. 改之前必读的八个坑

1. **二次贝塞尔的顶点只走控制点位移的一半。** `t=0.5` 时 `y=(y0+2c+y2)/4`。把控制点 +4.6 当"张嘴 4.6"，实际只开了 1.7。
2. **眼睑必须 `clipPath` 到眼球本身。** 否则矩形会越过三角上右边缘，在轮廓上掏出一个缺口。clip id 要逐眼唯一（同页面多个实例共享 id 命名空间）。
3. **`attributeName="d"` 在 SMIL 里只吃 `calcMode="linear"`。** `keySplines` 对路径数据无效，缓入缓出只能靠非均匀 `keyTimes` + 中间帧。标量属性（`stroke-width`/`rx`/`ry`）才真能用 spline。
4. **同一个元素上只能有一个 `animateTransform`。** 两层旋转（整体歪头 + 脸部微摆）必须分层 `<g>`。
5. **绕针尖旋转时，角度按绕中心时的一半取。** 同样 12°，绕角旋转最远点的行程是绕中心的两倍——支点一换，同样的数字就快一倍。这里最大 3°，再加大会把右下角裁出 viewBox。
6. **嘴宽 ≤ 1.5 个眼长，线宽 ≤ 眼长 1/3。** 嘴宽 20（2 个眼长）时已经顶到外眼角，整条线占了下半张脸 60%，读作"嘴太大"；`stroke-width` 4 = 眼长 41%，比眼睛本身还抢眼，会从"一条线"变成"一块白"。
7. **瞳孔白边余量留 >1.5。** `r − 偏移 − 瞳半径`，否则会粘在眼眶上。
8. **嘴形帧之间必须同命令结构。** 都是 `M…Q…`，或都是 `M…L…`；帧数不同、指令不同都不能插值。

## 6. 加一个状态

复制 `S.think`，改 `tilt` / `mouth` / `pupil`，然后按第 5 节的约束自查三件事：

1. 新周期和已有的 3.2 / 7.6 / 5.6 / 5.2 都不整除
2. 嘴宽落在 1.2–1.5 个眼长之间（张嘴的帧可以到 1.6）
3. 场景里的表情必须有**语义动作**的差别（缩／开／垂／扬），不能只是同一条弧线改深浅——那样六个状态会读起来都像"匀速呼吸"

---

## 7. 完整源码

以下三段可直接保存为同名文件。代码即本文档正文，无需其他依赖。


### 7.1 `qiqi-idle-think.html`

自包含预览页。`<script>` 里是完整的生成代码（约 200 行），复制这一段即可，页面外壳只是演示网格。

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>七七 · 待机 / 思考</title>
<style>
  :root{
    --bg:#FBFBFD; --card:#FFFFFF; --line:#E9E6F2;
    --ink:#1D1B26; --ink2:#5B5670; --muted:#8E88A3; --brand:#8B7CE6;
  }
  *{box-sizing:border-box}
  body{margin:0;padding:40px 32px 56px;background:var(--bg);color:var(--ink);
    font:14px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
    -webkit-font-smoothing:antialiased}
  h1{margin:0 0 6px;font-size:19px;font-weight:600;letter-spacing:-.2px}
  .sub{margin:0 0 28px;color:var(--ink2);font-size:13px}
  .grid{display:flex;gap:24px;flex-wrap:wrap}
  .col{flex:1 1 320px;min-width:280px;background:var(--card);border:1px solid var(--line);
    border-radius:14px;padding:22px 20px 18px}
  .cap{font-size:13px;font-weight:600;margin-bottom:4px}
  .cap em{font-style:normal;color:var(--muted);font-weight:400;font-size:12px;margin-left:6px;
    font-family:ui-monospace,Consolas,monospace}
  .sizes{display:flex;align-items:flex-end;gap:22px;margin-top:16px;flex-wrap:wrap}
  .cell{display:flex;flex-direction:column;align-items:center;gap:8px}
  .tag{font-size:10.5px;color:var(--muted);font-family:ui-monospace,Consolas,monospace}
  .note{margin:26px 0 0;color:var(--muted);font-size:12px;line-height:1.8}
  .note b{color:var(--ink2);font-weight:500}
  code{font-family:ui-monospace,Consolas,monospace;background:#F3F0FA;padding:1px 5px;border-radius:4px;font-size:12px}
</style>
</head>
<body>

<h1>七七 · 待机 / 思考</h1>
<p class="sub">紫色三角 Agent 的两个常态循环。纯 SVG + SMIL，无 JS 动画库、无 CSS keyframes、无外部依赖。</p>

<div class="grid" id="grid"></div>

<p class="note">
  <b>接入：</b><code>QIQI.mk('idle', 88)</code> 返回一段 SVG 字符串，塞进容器即可。
  <b>节奏：</b>待机 = 眨眼 3.2s + 眼神扫视 7.6s + 呼吸 5.6s + 微摆 5.2s；思考 = 转瞳 0.9s + 抿嘴 2.8s + 摆动 1.9s。四组数字互不整除。
</p>

<script>
(function(){
  "use strict";

  /* ───────────────────────── 几何常量 ───────────────────────── */

  // 圆角三角形：三个角分别是左上（指针尖）、右、下。圆角半径 10。
  var TRI = "M29.2 18 L70.8 36 Q80 40 73.3 47.4 L46.7 76.6 Q40 84 37.3 74.4 L22.7 23.6 Q20 14 29.2 18 Z";

  // 眼：两只同尺寸，cy 固定 44，眼心 x 见下。眼半径 4.9 → 眼长 9.8，是后面所有尺寸的基准单位。
  var CX = [47.5, 62.5], CY = 44;

  // 只有两个色：主体紫、面部白。瞳孔与主体同色（不要黑色）。
  var BODY = "#8B7CE6", FACE = "#FFFFFF";

  // 三角两条直边延长后的交点 = 指针针尖，整体摆动绕它转（不是绕图形中心）
  var PIVOT = "20 14";

  var UID = 0;

  /* ───────────────────────── 状态定义 ───────────────────────── */
  // 每个状态 = 眼 + 瞳 + 眼睑 + 嘴 + 整体摆动，各自独立的周期。
  // 关键：四个周期互不整除，才不会有「同时停、同时动」的机械感。

  var S = {

    // 待机：眼睛左右张望（跳变扫视）、紫色眼睑覆盖眨眼、下颌随自重微沉、整块极慢微摆
    idle: {
      r: 4.9,
      pupil: {
        cx: 0.95, cy: -1, r: 1.85,
        // 注视路径：右上 → 左 → 右下 → 下偏左 → 回右上
        // 前 8 帧成对出现（停 → 跳 → 停），跳变只占 2% 时间，剩下 90% 全在停留
        gx: [0.95, 0.95, -1.15, -1.15, 1.25, 1.25, -0.35, -0.35, 0.95, 0.95],
        gy: [-1, -1, -0.75, -0.75, 0.55, 0.55, 1.35, 1.35, -1, -1],
        gkt: "0;0.16;0.18;0.44;0.46;0.68;0.70;0.86;0.88;1",
        gdur: 7.6
      },
      lids: 3.2,                       // 眨眼周期
      tilt: {                          // 绕针尖 ±0.55°，正弦采样 8 段
        v: "0;0.39;0.55;0.39;0;-0.39;-0.55;-0.39;0",
        kt: "0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1",
        dur: 5.2
      },
      mouth: {                         // 下颌沉 0.65，两端钉住（两端一动就读作咀嚼）
        ds: ["M45.3 55.8 Q50 58.9 54.7 55.6",
             "M45.3 55.8 Q50 58.9 54.7 55.6",
             "M45.3 55.8 Q50 60.2 54.7 55.6",
             "M45.3 55.8 Q50 58.9 54.7 55.6"],
        kt: "0;0.54;0.70;1", w: 3.2, dur: 5.6
      }
    },

    // 思考：瞳点贴着眼白边缘绕圈（在「翻找」，不是在「看」）、嘴抿紧变短、钟摆式摆动
    think: {
      r: 4.9,
      pupil: { r: 1.85 },
      orbit: { r: 2.25, dur: 0.9 },    // 瞳心绕眼心 2.25 半径转，0.9s 一圈
      tilt: {
        v: "0;1.2;1.7;1.2;0;-1.2;-1.7;-1.2;0",
        kt: "0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1",
        dur: 1.9
      },
      mouth: {                         // 宽度 6.8 → 5.7：用力想是抿紧，不是拉长
        ds: ["M47.2 57.3 L54.0 57.1",
             "M47.8 57.5 L53.5 57.1",
             "M47.8 57.5 L53.5 57.1",
             "M47.2 57.3 L54.0 57.1"],
        kt: "0;0.20;0.60;1", w: 3.0, dur: 2.8
      }
    }
  };

  /* ───────────────────────── 部件生成 ───────────────────────── */

  // 眨眼：两块紫色矩形从上下覆盖白色眼球（不是把眼球压扁）。
  // 必须 clip 到眼球本身，否则矩形会越过三角形上右边缘，在轮廓上掏出缺口。
  function lids(c){
    var ry = c.ry || c.r, lh = +(ry + 0.3).toFixed(2);
    var tOpen = -ry - lh - 0.6, tClose = -lh + 0.2;
    var bOpen = ry + 0.6,       bClose = -0.2;
    var k = "0;0.88;0.91;0.94;1", dur = c.lids + "s";   // 关 96ms · 停 96ms · 开 192ms
    var w = +(c.r * 2 + 1.2).toFixed(2), x = -(c.r + 0.6);
    function bar(from, to){
      return '<rect x="'+x+'" y="'+from+'" width="'+w+'" height="'+lh+'" fill="'+BODY+'">'
           + '<animate attributeName="y" values="'+from+';'+from+';'+to+';'+to+';'+from+'"'
           + ' keyTimes="'+k+'" dur="'+dur+'" repeatCount="indefinite" calcMode="linear"/></rect>';
    }
    return bar(tOpen, tClose) + bar(bOpen, bClose);
  }

  // 瞳点：三种形态——绕圈（思考）、二维轨迹扫视（待机）、静止（其余）
  function pupil(c){
    var p = c.pupil;
    if (c.orbit){
      return '<g><animateTransform attributeName="transform" type="rotate"'
           + ' values="0 0 0;360 0 0" dur="'+c.orbit.dur+'s" repeatCount="indefinite" calcMode="linear"/>'
           + '<circle cx="'+c.orbit.r+'" cy="0" r="'+p.r+'" fill="'+BODY+'"/></g>';
    }
    var s = '<circle cx="'+p.cx+'" cy="'+p.cy+'" r="'+p.r+'" fill="'+BODY+'">';
    if (p.gx){
      var d = p.gdur + "s";
      s += '<animate attributeName="cx" values="'+p.gx.join(";")+'" keyTimes="'+p.gkt+'" dur="'+d+'" repeatCount="indefinite" calcMode="linear"/>';
      s += '<animate attributeName="cy" values="'+p.gy.join(";")+'" keyTimes="'+p.gkt+'" dur="'+d+'" repeatCount="indefinite" calcMode="linear"/>';
    }
    return s + '</circle>';
  }

  // 单只眼：白眼球 + 瞳点 + 眼睑。有眼睑时套一层 clipPath（id 逐眼唯一）。
  function eye(c, x){
    var shape = c.ry
      ? '<ellipse cx="0" cy="0" rx="'+c.r+'" ry="'+c.ry+'" fill="'+FACE+'"/>'
      : '<circle cx="0" cy="0" r="'+c.r+'" fill="'+FACE+'"/>';
    var inner = shape + pupil(c) + (c.lids ? lids(c) : "");
    if (!c.lids) return '<g transform="translate('+x+' '+CY+')">' + inner + '</g>';
    var id = "cl" + (++UID);
    return '<g transform="translate('+x+' '+CY+')">'
         + '<defs><clipPath id="'+id+'"><circle cx="0" cy="0" r="'+c.r+'"/></clipPath></defs>'
         + '<g clip-path="url(#'+id+')">' + inner + '</g></g>';
  }

  var EASE = "0.35 0 0.65 1";       // ease-in-out，不带 overshoot（嘴是肌肉不是弹簧）
  function keySpl(n){ var a = []; for (var i = 1; i < n; i++) a.push(EASE); return a.join(";"); }
  function ktOf(n){ var a = []; for (var i = 0; i < n; i++) a.push(+(i / (n - 1)).toFixed(3)); return a.join(";"); }

  // 嘴：一条 stroke 路径在几帧之间插值。
  // 注意 SMIL 里 attributeName="d" 只吃 linear，缓入缓出只能靠非均匀 keyTimes + 中间帧；
  // 标量属性（stroke-width / rx / ry）才真正能用 calcMode="spline"。
  function mouth(c){
    var m = c.mouth, ds = m.ds, n = ds.length;
    var kt = m.kt || ktOf(n), dur = m.dur + "s";
    var out = '<path d="'+ds[0]+'" fill="none" stroke="'+FACE+'" stroke-width="'+m.w+'" stroke-linecap="round">'
            + '<animate attributeName="d" values="'+ds.join(";")+'" keyTimes="'+kt+'" dur="'+dur+'" repeatCount="indefinite" calcMode="linear"/>';
    if (m.ws)
      out += '<animate attributeName="stroke-width" values="'+m.ws.join(";")+'" keyTimes="'+(m.wkt || kt)+'" dur="'+dur
           + '" repeatCount="indefinite" calcMode="spline" keySplines="'+keySpl(m.ws.length)+'"/>';
    return out + '</path>';
  }

  // 整体摆动：绕针尖旋转。角度按「绕中心时」的一半取——支点在角上，同样角度的行程是绕中心的两倍。
  function tiltAnim(t){
    var vals = t.v.split(";").map(function(a){ return a + " " + PIVOT; }).join(";");
    return '<animateTransform attributeName="transform" type="rotate" values="'+vals
         + '" keyTimes="'+t.kt+'" dur="'+t.dur+'s" repeatCount="indefinite" calcMode="linear"/>';
  }

  /* ───────────────────────── 组装 ───────────────────────── */

  // mk('idle', 88) → 完整 SVG 字符串
  // vb 可传自定义 viewBox（做局部特写用）；noTilt 为 true 时去掉整体摆动
  function mk(st, size, vb, noTilt){
    var c = S[st] || S.idle;
    var face = eye(c, CX[0]) + eye(c, CX[1]) + mouth(c);
    var body = '<path d="'+TRI+'" fill="'+BODY+'"/>' + face;
    if (c.tilt && !noTilt) body = '<g>' + tiltAnim(c.tilt) + body + '</g>';
    return '![svg](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iJytzaXplKyciIGhlaWdodD0iJytzaXplKyciIHZpZXdCb3g9IicrKHZiIHx8ICIwIDAgMTAwIDEwMCIpKyciJwogICAgICAgICArICcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4nICsgYm9keSArICc8L3N2Zz4=)';
  }

  function mount(el, st, size, vb, noTilt){
    el.innerHTML = mk(st, size, vb, noTilt);
    var sv = el.querySelector("svg");
    if (sv && sv.setCurrentTime){ try { sv.setCurrentTime(0); } catch(e){} }
  }

  // 对外接口
  window.QIQI = { mk: mk, mount: mount, states: S, tri: TRI, pivot: PIVOT };

  /* ───────────────────────── 预览网格 ───────────────────────── */

  var cols = [["idle","待机","idle"],["think","思考","think"]];
  var grid = document.getElementById("grid");
  grid.innerHTML = cols.map(function(c){
    return '<div class="col"><div class="cap">'+c[1]+'<em>'+c[2]+'</em></div>'
         + '<div class="sizes">'
         + [160,88,40].map(function(sz){
             return '<div class="cell"><div data-st="'+c[0]+'" data-sz="'+sz+'"></div>'
                  + '<div class="tag">'+sz+'px</div></div>';
           }).join("")
         + '</div></div>';
  }).join("");
  grid.querySelectorAll("[data-st]").forEach(function(d){
    mount(d, d.getAttribute("data-st"), +d.getAttribute("data-sz"));
  });

})();
</script>

</body>
</html>
```

### 7.2 `anim-idle.svg`

待机成品。SMIL 内联，可直接 `<img src>` 或当作 CSS background。

```svg
![svg](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHRpdGxlPuS4g+S4gyDCtyDlvoXmnLo8L3RpdGxlPjxnPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgMjAgMTQ7MC4zOSAyMCAxNDswLjU1IDIwIDE0OzAuMzkgMjAgMTQ7MCAyMCAxNDstMC4zOSAyMCAxNDstMC41NSAyMCAxNDstMC4zOSAyMCAxNDswIDIwIDE0IiBrZXlUaW1lcz0iMDswLjEyNTswLjI1OzAuMzc1OzAuNTswLjYyNTswLjc1OzAuODc1OzEiIGR1cj0iNS4ycyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48cGF0aCBkPSJNMjkuMiAxOCBMNzAuOCAzNiBRODAgNDAgNzMuMyA0Ny40IEw0Ni43IDc2LjYgUTQwIDg0IDM3LjMgNzQuNCBMMjIuNyAyMy42IFEyMCAxNCAyOS4yIDE4IFoiIGZpbGw9IiM4QjdDRTYiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0Ny41IDQ0KSI+PGRlZnM+PGNsaXBQYXRoIGlkPSJlMCI+PGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjQuOSIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNlMCkiPjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0LjkiIGZpbGw9IiNGRkZGRkYiLz48Y2lyY2xlIGN4PSIwLjk1IiBjeT0iLTEiIHI9IjEuODUiIGZpbGw9IiM4QjdDRTYiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiB2YWx1ZXM9IjAuOTU7MC45NTstMS4xNTstMS4xNTsxLjI1OzEuMjU7LTAuMzU7LTAuMzU7MC45NTswLjk1IiBrZXlUaW1lcz0iMDswLjE2OzAuMTg7MC40NDswLjQ2OzAuNjg7MC43MDswLjg2OzAuODg7MSIgZHVyPSI3LjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgY2FsY01vZGU9ImxpbmVhciIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN5IiB2YWx1ZXM9Ii0xOy0xOy0wLjc1Oy0wLjc1OzAuNTU7MC41NTsxLjM1OzEuMzU7LTE7LTEiIGtleVRpbWVzPSIwOzAuMTY7MC4xODswLjQ0OzAuNDY7MC42ODswLjcwOzAuODY7MC44ODsxIiBkdXI9IjcuNnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBjYWxjTW9kZT0ibGluZWFyIi8+PC9jaXJjbGU+PHJlY3QgeD0iLTUuNSIgeT0iLTEwLjciIHdpZHRoPSIxMSIgaGVpZ2h0PSI1LjIiIGZpbGw9IiM4QjdDRTYiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkiIHZhbHVlcz0iLTEwLjc7LTEwLjc7LTU7LTU7LTEwLjciIGtleVRpbWVzPSIwOzAuODg7MC45MTswLjk0OzEiIGR1cj0iMy4ycyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48L3JlY3Q+PHJlY3QgeD0iLTUuNSIgeT0iNS41IiB3aWR0aD0iMTEiIGhlaWdodD0iNS4yIiBmaWxsPSIjOEI3Q0U2Ij48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5IiB2YWx1ZXM9IjUuNTs1LjU7LTAuMjstMC4yOzUuNSIga2V5VGltZXM9IjA7MC44ODswLjkxOzAuOTQ7MSIgZHVyPSIzLjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgY2FsY01vZGU9ImxpbmVhciIvPjwvcmVjdD48L2c+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYyLjUgNDQpIj48ZGVmcz48Y2xpcFBhdGggaWQ9ImUxIj48Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iNC45Ii8+PC9jbGlwUGF0aD48L2RlZnM+PGcgY2xpcC1wYXRoPSJ1cmwoI2UxKSI+PGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjQuOSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjAuOTUiIGN5PSItMSIgcj0iMS44NSIgZmlsbD0iIzhCN0NFNiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3giIHZhbHVlcz0iMC45NTswLjk1Oy0xLjE1Oy0xLjE1OzEuMjU7MS4yNTstMC4zNTstMC4zNTswLjk1OzAuOTUiIGtleVRpbWVzPSIwOzAuMTY7MC4xODswLjQ0OzAuNDY7MC42ODswLjcwOzAuODY7MC44ODsxIiBkdXI9IjcuNnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBjYWxjTW9kZT0ibGluZWFyIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIHZhbHVlcz0iLTE7LTE7LTAuNzU7LTAuNzU7MC41NTswLjU1OzEuMzU7MS4zNTstMTstMSIga2V5VGltZXM9IjA7MC4xNjswLjE4OzAuNDQ7MC40NjswLjY4OzAuNzA7MC44NjswLjg4OzEiIGR1cj0iNy42cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48L2NpcmNsZT48cmVjdCB4PSItNS41IiB5PSItMTAuNyIgd2lkdGg9IjExIiBoZWlnaHQ9IjUuMiIgZmlsbD0iIzhCN0NFNiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieSIgdmFsdWVzPSItMTAuNzstMTAuNzstNTstNTstMTAuNyIga2V5VGltZXM9IjA7MC44ODswLjkxOzAuOTQ7MSIgZHVyPSIzLjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgY2FsY01vZGU9ImxpbmVhciIvPjwvcmVjdD48cmVjdCB4PSItNS41IiB5PSI1LjUiIHdpZHRoPSIxMSIgaGVpZ2h0PSI1LjIiIGZpbGw9IiM4QjdDRTYiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkiIHZhbHVlcz0iNS41OzUuNTstMC4yOy0wLjI7NS41IiBrZXlUaW1lcz0iMDswLjg4OzAuOTE7MC45NDsxIiBkdXI9IjMuMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBjYWxjTW9kZT0ibGluZWFyIi8+PC9yZWN0PjwvZz48L2c+PHBhdGggZD0iTTQ1LjMgNTUuOCBRNTAgNTguOSA1NC43IDU1LjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzLjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iZCIgdmFsdWVzPSJNNDUuMyA1NS44IFE1MCA1OC45IDU0LjcgNTUuNjtNNDUuMyA1NS44IFE1MCA1OC45IDU0LjcgNTUuNjtNNDUuMyA1NS44IFE1MCA2MC4yIDU0LjcgNTUuNjtNNDUuMyA1NS44IFE1MCA1OC45IDU0LjcgNTUuNiIga2V5VGltZXM9IjA7MC41NDswLjcwOzEiIGR1cj0iNS42cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48L3BhdGg+PC9nPjwvc3ZnPg==)
```

### 7.3 `anim-think.svg`

思考成品。

```svg
![svg](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHRpdGxlPuS4g+S4gyDCtyDmgJ3ogIM8L3RpdGxlPjxnPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgMjAgMTQ7MS4yIDIwIDE0OzEuNyAyMCAxNDsxLjIgMjAgMTQ7MCAyMCAxNDstMS4yIDIwIDE0Oy0xLjcgMjAgMTQ7LTEuMiAyMCAxNDswIDIwIDE0IiBrZXlUaW1lcz0iMDswLjEyNTswLjI1OzAuMzc1OzAuNTswLjYyNTswLjc1OzAuODc1OzEiIGR1cj0iMS45cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48cGF0aCBkPSJNMjkuMiAxOCBMNzAuOCAzNiBRODAgNDAgNzMuMyA0Ny40IEw0Ni43IDc2LjYgUTQwIDg0IDM3LjMgNzQuNCBMMjIuNyAyMy42IFEyMCAxNCAyOS4yIDE4IFoiIGZpbGw9IiM4QjdDRTYiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0Ny41IDQ0KSI+PGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjQuOSIgZmlsbD0iI0ZGRkZGRiIvPjxnPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgMCAwOzM2MCAwIDAiIGR1cj0iMC45cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48Y2lyY2xlIGN4PSIyLjI1IiBjeT0iMCIgcj0iMS44NSIgZmlsbD0iIzhCN0NFNiIvPjwvZz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjIuNSA0NCkiPjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0LjkiIGZpbGw9IiNGRkZGRkYiLz48Zz48YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgdmFsdWVzPSIwIDAgMDszNjAgMCAwIiBkdXI9IjAuOXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBjYWxjTW9kZT0ibGluZWFyIi8+PGNpcmNsZSBjeD0iMi4yNSIgY3k9IjAiIHI9IjEuODUiIGZpbGw9IiM4QjdDRTYiLz48L2c+PC9nPjxwYXRoIGQ9Ik00Ny4yIDU3LjMgTDU0LjAgNTcuMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMuMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJkIiB2YWx1ZXM9Ik00Ny4yIDU3LjMgTDU0LjAgNTcuMTtNNDcuOCA1Ny41IEw1My41IDU3LjE7TTQ3LjggNTcuNSBMNTMuNSA1Ny4xO000Ny4yIDU3LjMgTDU0LjAgNTcuMSIga2V5VGltZXM9IjA7MC4yMDswLjYwOzEiIGR1cj0iMi44cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGNhbGNNb2RlPSJsaW5lYXIiLz48L3BhdGg+PC9nPjwvc3ZnPg==)
```
