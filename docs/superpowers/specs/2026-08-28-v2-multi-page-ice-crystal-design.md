# Gold-Finger V2 Multi-Page Ice Crystal Design

## 1. 背景与决策

Gold-Finger V1 是本地单用户的月度财务复盘 MVP。当前 `main` 只有一个用户页面 `/`，月度复盘、趋势、录入和数据安全全部纵向排列在同一页面。V2 将这些职责拆为多个独立页面，并使用固定文字侧栏作为共享应用框架。

已确认的关键决策：

- V2 使用多个独立页面，不采用单页锚点导航。
- 不新增独立“资产管理”页面；现金、基金和负债只在“月度记录”中维护。
- 选定的月度复盘首页布局以会话中生成的方案 1 为结构参考。
- V2 同时升级为 **Ice Crystal Finance UI**，但保持 Gold-Finger 的产品身份、业务语义与核心组件尺寸。
- 当前 `main` 提交 `73ec8b0` 作为 V1 基线并标记 `v1.0.0`；V2 开发分支为 `codex/v2-multi-page-dashboard`。

## 2. 产品目标与范围

V2 继续服务个人用户的低频月末财务复盘，核心目标不变：

- 用户可在 5～10 分钟内完成一次月度更新。
- 用户可快速知道当前净资产、现金、投资和负债。
- 用户可看清收入、支出、投资净投入、投资损益和月度结余的关系。
- 用户可查看投资组合结构与历史变化。
- 数据仅保存在本机，并可导出、备份和恢复。

V2 本次只改变信息架构、路由、页面布局与视觉系统，不改变：

- SQLite / Drizzle schema。
- 月度记录、基金分类与备份 JSON 格式。
- 财务计算语义。
- 新月份继承和投资净投入重置规则。
- 保存、删除、恢复的安全确认。
- 桌面端 MVP 范围。

明确不增加：

- 资产管理独立页面。
- 账户体系、用户头像或个人资料。
- 预算、目标规划、财务建议或健康评分。
- 银行同步、交易流水或精确收益率。
- 手机端专项导航与布局。

## 3. 信息架构与路由

### 3.1 共享应用框架

所有 V2 页面使用同一 App Router 共享布局：

```text
┌──────────────────┬──────────────────────────────────────┐
│ 品牌              │ 页面标题、月份上下文、页面动作       │
│                   ├──────────────────────────────────────┤
│ 月度复盘          │                                      │
│ 月度记录          │ 当前路由的主内容                     │
│ 投资组合          │                                      │
│ 历史趋势          │                                      │
│                   │                                      │
│ 数据安全          │                                      │
│ V2                │                                      │
└──────────────────┴──────────────────────────────────────┘
```

侧栏默认展开且显示文字，不提供纯图标模式。品牌区固定在顶部，四个主要业务入口位于上部导航区，数据安全固定在底部工具区。V2 版本标识可作为非交互 metadata 显示在侧栏底部。

### 3.2 页面与职责

| 侧栏位置   | 页面     | 路由         | 职责                                           |
| ---------- | -------- | ------------ | ---------------------------------------------- |
| 主要功能 1 | 月度复盘 | `/`          | 当前月份总览、五项资金指标、趋势摘要、配置摘要 |
| 主要功能 2 | 月度记录 | `/records`   | 月份选择、新建/更新记录、删除本月              |
| 主要功能 3 | 投资组合 | `/portfolio` | 当前月份资产配置、基金与分类层级，只读分析     |
| 主要功能 4 | 历史趋势 | `/trends`    | 资产与收支趋势、历史数据表                     |
| 底部工具   | 数据安全 | `/data`      | 本地保存说明、导出与恢复                       |

不显示“资产管理”“设置中心”“预算管理”“目标管理”或账户入口。

### 3.3 月份上下文

月份继续由 URL 查询参数表达，不新增全局客户端状态或 Local Storage：

```text
/?month=2026-08
/records?month=2026-08
/portfolio?month=2026-08
/trends?month=2026-08
```

- 没有 `month` 时使用当前自然月。
- 非法月份通过现有 `resolveSelectedMonth` 规则回退。
- 从一个业务页面跳转到另一个页面时保留当前月份。
- `/data` 与月份无关，不携带 `month`。
- 历史趋势将所选月份作为趋势窗口的结束月份，默认展示最近六个已保存月份。

## 4. 页面设计

### 4.1 月度复盘 `/`

首页使用已确认的方案 1，并聚焦“现在怎样、这个月怎样、长期怎样、配置怎样”。

页面顺序：

1. 页面工具栏：`月度复盘`、月份切换、`更新数据`、更多操作。
2. 当前状态主卡：净资产、现金、投资、负债、较上月变化、跨月一致性。
3. 本月资金带：收入、支出、投资净投入、投资损益、月度结余。
4. 45:55 双栏分析区：左侧趋势摘要，右侧投资配置摘要。

要求：

- 当前净资产主卡的内部位置、尺寸、布局、按钮位置和结构沿用已选方案，不为视觉升级改变几何结构。
- `更新数据` 跳转到 `/records?month=YYYY-MM`。
- 删除操作不作为首页常驻动作；删除只在月度记录页出现。
- 趋势摘要只显示一张主要图和 `资产变化 / 收支变化` 切换。
- 投资配置摘要保留比例条和主要层级，并提供进入完整投资组合页的入口。
- 空月份显示净资产占位、简短说明和 `新建数据`，跳转到对应月度记录页。

### 4.2 月度记录 `/records`

月度记录是唯一的数据编辑入口。页面包含：

1. 页面标题和月份切换。
2. 当前月份状态：未记录、已有记录或保存失败。
3. 月度现金流：收入、支出、投资损益。
4. 现金资产：应急备用金、目标准备金、日常现金。
5. 基金资产：基金名称、固定分类、当前市值、本月净投入。
6. 负债：花呗余额。
7. 保存动作与错误摘要。
8. 删除本月及不可逆确认。

行为要求：

- 保留现有表单字段、验证、错误聚焦、全零确认和数据不丢失行为。
- 新月份只继承基金名称和固定分类；市值留空；本月净投入重置为零。
- 保存成功后跳转到 `/?month=YYYY-MM` 并显示更新后的结果。
- 删除成功后回到对应月份的空复盘状态。
- 删除保持低视觉权重，确认阶段才使用明确的危险语义。
- V1 的页面内 `gold-finger:open-monthly-entry` 自定义事件在 V2 删除，由路由导航替代。

### 4.3 投资组合 `/portfolio`

投资组合页是只读分析页面，不提供第二套资产编辑入口。包含：

- 页面标题和月份切换。
- 现金、投资、负债与投资损益摘要。
- 资产配置比例条和低饱和图例。
- 股票、市场、固定分类、基金和现金层级。
- 总体占比与父级占比。
- 当前市值与本月净投入。
- 无数据时跳转到 `/records?month=YYYY-MM` 的引导。

资产配置内部使用列表行，不把每一行做成独立卡片。

### 4.4 历史趋势 `/trends`

包含：

- 页面标题与结束月份切换。
- `资产变化 / 收支变化` 分段控件。
- 净资产、现金、投资、负债趋势。
- 收入与支出趋势。
- 最近六个月趋势数据表。
- 无历史记录时的录入引导。

图表优先保证坐标、图例、数据点和数值可读性，不使用装饰性玻璃背景或发光线条。

### 4.5 数据安全 `/data`

包含：

- 数据仅保存在本机的说明。
- 导出全部月份与最近成功导出时间。
- 选择备份文件。
- 恢复前校验与永久替换确认。
- 成功、失败和处理中状态。

页面不携带月份上下文。恢复成功后刷新数据并返回 `/`。

## 5. Ice Crystal Finance UI

### 5.1 视觉定义

整体方向为：

> Apple Liquid Glass + 浅色 Ice Crystal Glassmorphism + 高端金融 Dashboard + 克制 Ambient Light

目标关键词：`clean`、`calm`、`precise`、`premium`、`frosted`、`airy`、`financial`、`subtle`、`cold`、`minimal`。

目标感受接近 macOS、iCloud、Apple Wallet 与高端私人财富管理产品。最终应让用户感觉“这是原来的 Gold-Finger，但整体材质明显变高级了”，而不是完全换了一个网站。

禁止：

- 紫色科技风、Web3 或 Crypto Dashboard。
- 满屏霓虹、高饱和渐变或明显 glow。
- 每个元素都是透明玻璃。
- 大面积强 blur 或 glass-inside-glass。
- Dribbble Demo 式夸张视觉。
- 跟随鼠标光效、动态渐变、流光和强 spring 动画。

视觉强度比例：

- 70% 干净浅色金融 UI。
- 20% Ice Glass。
- 10% Liquid Glass interaction。

数据清晰度始终高于材质表现；宁可玻璃偏轻，也不能过度。

### 5.2 背景与环境光

基础背景：`#f3f7fb`，允许在最终校准时使用接近的 `#f4f8fc`。

```css
--bg-base: #f3f7fb;
--ambient-blue: rgb(174 213 235 / 22%);
--ambient-violet: rgb(205 210 242 / 14%);
--ambient-mint: rgb(184 223 219 / 10%);

background:
  radial-gradient(circle at 18% 12%, var(--ambient-blue), transparent 34%),
  radial-gradient(circle at 84% 15%, var(--ambient-violet), transparent 30%),
  radial-gradient(circle at 65% 55%, var(--ambient-mint), transparent 38%),
  var(--bg-base);
```

环境光必须非常柔和。若第一眼能识别蓝色、紫色或绿色圆形，说明强度过高。页面底部保持接近基础背景色。

### 5.3 三层 Surface

#### Level 1 — Base Surface

用于普通页面区域、数据密集区域、图表和资产配置内部行。

```css
--surface-base: rgb(255 255 255 / 36%);
```

- 允许保持透明。
- 无 `backdrop-filter`。
- 边框极淡，默认无阴影。
- 以阅读效率为优先。

#### Level 2 — Frosted Surface

用于净资产主卡、本月资金带、资产结构摘要和资产配置外层容器。

```css
--surface-frosted: rgb(255 255 255 / 62%);
--border-glass: rgb(255 255 255 / 70%);
--border-frosted-secondary: rgb(120 150 170 / 10%);
--shadow-card: 0 10px 35px rgb(60 90 115 / 5%);
--blur-frosted: 24px;
```

- `backdrop-filter: blur(var(--blur-frosted)) saturate(115%)`。
- 同时设置 `-webkit-backdrop-filter`。
- 用白色玻璃边和极淡冷灰蓝 secondary border 建立薄度。
- 不使用黑色重阴影，不让卡片显得高悬浮。

净资产主卡允许使用更强但仍克制的值：

```css
background: rgb(255 255 255 / 60%);
backdrop-filter: blur(28px) saturate(115%);
-webkit-backdrop-filter: blur(28px) saturate(115%);
border: 1px solid rgb(255 255 255 / 70%);
box-shadow:
  inset 0 1px 0 rgb(255 255 255 / 80%),
  0 14px 45px rgb(65 95 120 / 6%);
```

#### Level 3 — Liquid Control

只用于月份切换、箭头、更新数据、分段控件、Tooltip 和 Popover。

```css
--surface-liquid: rgb(255 255 255 / 68%);
--shadow-floating: 0 6px 20px rgb(60 90 115 / 7%);
--blur-liquid: 30px;
```

- `backdrop-filter: blur(var(--blur-liquid)) saturate(120%)`。
- `-webkit-backdrop-filter` 使用相同值。
- `border: 1px solid rgb(255 255 255 / 72%)`。
- `box-shadow` 可包含 `inset 0 1px 0 rgb(255 255 255 / 75%)`。
- 只让交互控件比内容容器更接近 Liquid Glass。

### 5.4 Fallback 与性能

- 不支持 `backdrop-filter` 时，Frosted 与 Liquid Surface 使用更高不透明度的接近实体浅色背景，不能退化为透明。
- `backdrop-filter` 仅用于主要 Frosted 容器和 Liquid Controls。
- 资产配置内部行、图表区域和嵌套内容不使用 blur。
- 不叠加多个重 blur 容器。
- 页面滚动不应出现明显掉帧。

## 6. 组件视觉规则

### 6.1 净资产主卡

- 保持已选方案中的位置、尺寸、布局、按钮位置和结构。
- 是页面最明显的 Frosted Surface，但不发光、不使用蓝色描边或卡片渐变。
- 金额使用接近 `#172330` 的深色，字重 650～700。
- 所有金额启用 `font-variant-numeric: tabular-nums` 和 `font-feature-settings: "tnum"`。

### 6.2 月份切换与更新数据

- 保持现有位置和控件尺寸。
- 三个月份切换元素形成统一的 Liquid Control 组。
- 更新数据保持半透明白、淡蓝灰文字、细边框和轻 inner highlight；不改成高饱和蓝色实心 CTA。
- Hover 只允许背景、边框和阴影轻微增强，以及 `translateY(-1px)`。
- Active 使用 `translateY(0)` 和 `scale(0.98)`。
- 动画 160～220ms `ease-out`，禁用强 spring。

### 6.3 删除本月

- 只在月度记录页显示，保持低视觉权重。
- 默认使用低饱和 muted red，例如 `#9a6262`。
- Hover 允许 `rgb(170 80 80 / 6%)` 背景。
- 不做成独立玻璃按钮，不与更新/保存动作竞争。

### 6.4 本月资金与资产结构

- 本月资金带使用五列：收入、支出、投资净投入、投资损益、月度结余。
- 资产结构摘要使用现金、投资、负债等现有业务指标。
- 容器使用轻 Frosted Surface，内部列不使用独立玻璃卡片。
- Divider 使用 `rgb(100 130 150 / 8%)` 左右的低存在感线条。
- 收入、支出和普通金额保持深色。
- Positive / Profit 使用 muted teal green，如 `#477a69`。
- Negative / Liability 使用 muted terracotta red，如 `#9a625e`。

### 6.5 资产配置与 Allocation Bar

- 外层容器可使用 Frosted Surface。
- 股票、美国市场、纳斯达克100、中国市场、债券、其他和现金保持 row 结构。
- Row 默认透明；Hover 使用 `rgb(255 255 255 / 34%)`，150～180ms，无阴影、无独立圆角卡片、无 blur。
- Allocation Bar 保持原有结构、比例与数据。
- Track 使用 `rgb(95 125 145 / 12%)`。
- 股票使用 muted steel blue；债券使用 sage gray；其他使用 muted gold；现金使用 ice gray / blue gray。
- 禁止高光条、霓虹、流光和明显渐变。

### 6.6 图表

- 图表区域主要使用 Base Surface 或透明背景，不使用明显玻璃。
- Grid line 使用 `rgb(80 110 130 / 10%)` 左右。
- Axis text 使用 muted blue-gray。
- Main line 使用 steel / slate blue；Secondary line 使用 cool gray / sage gray。
- 数据点只做轻度精致化，不发光。
- Tooltip 使用 Liquid Surface：约 68% 白色、28px blur、75% 白色边框和轻冷色阴影。

### 6.7 字体、边框、圆角与阴影

不更换现有系统字体栈。

```css
--text-primary: #182531;
--text-secondary: #60717e;
--text-muted: #82919c;
--positive: #477a69;
--negative: #9a625e;
--border-soft: rgb(90 120 140 / 10%);
--radius-large: 16px;
--radius-control: 12px;
```

- 不使用纯黑 `#000`。
- 大型容器圆角控制在 14～18px，小型控制器 10～14px。
- 不改变组件尺寸来迁就圆角。
- 静态 Card 阴影以 `0 10px 35px rgb(60 90 115 / 5%)` 为上限基准。
- Floating Control 以 `0 6px 20px rgb(60 90 115 / 7%)` 为上限基准。
- 页面主要依靠透明度、边框、环境光和材质产生层级，不依赖阴影。

## 7. 交互、动效与可访问性

- 交互 transition 统一为 160～220ms `ease-out`。
- Hover 只改变 opacity、background、border-color、shadow，最多 `translateY(-1px)`。
- Active 最多使用轻微下压与 `scale(0.98)`。
- `prefers-reduced-motion: reduce` 下禁用非必要 transform、平滑滚动和动效。
- 正文、金额、资产配置行和图表标签必须在实际叠加背景上保持足够对比度。
- 不能只使用颜色表达正负、选中、错误或警告；保留正负号、文字、结构或图标信号。
- `focus-visible` 使用可见轮廓，例如 `2px solid rgb(80 120 150 / 30%)` 和 `2px` offset；最终实现需在真实背景上确认对比度。
- 侧栏导航使用真实链接，当前页通过 `aria-current="page"` 暴露。
- 月份切换、分段控件、Tooltip 数据点、展开行和表单字段保留键盘可操作性和可读标签。
- DOM 阅读顺序与视觉顺序一致，不使用 CSS 将内容视觉重排到与语义相反的位置。

## 8. Design Token 架构

V2 优先在 `src/app/globals.css` 的 `:root` 建立集中 CSS Variables，不让组件散落不同 rgba 值：

```css
:root {
  --bg-base: #f3f7fb;
  --ambient-blue: rgb(174 213 235 / 22%);
  --ambient-violet: rgb(205 210 242 / 14%);
  --ambient-mint: rgb(184 223 219 / 10%);

  --surface-base: rgb(255 255 255 / 36%);
  --surface-frosted: rgb(255 255 255 / 62%);
  --surface-liquid: rgb(255 255 255 / 68%);

  --border-soft: rgb(90 120 140 / 10%);
  --border-glass: rgb(255 255 255 / 70%);
  --border-frosted-secondary: rgb(120 150 170 / 10%);

  --text-primary: #182531;
  --text-secondary: #60717e;
  --text-muted: #82919c;
  --positive: #477a69;
  --negative: #9a625e;

  --shadow-card: 0 10px 35px rgb(60 90 115 / 5%);
  --shadow-floating: 0 6px 20px rgb(60 90 115 / 7%);
  --blur-frosted: 24px;
  --blur-liquid: 30px;
}
```

现有资产和图表语义色 token 将映射到统一的低饱和色阶。具体数值可在浏览器视觉 QA 中微调，但必须保持本规格定义的角色、范围和禁止项。

## 9. 代码架构

计划使用 App Router Route Group 建立共享框架；实现前必须先阅读当前安装版本 `node_modules/next/dist/docs/` 中与 Layout、Route Groups、Link、searchParams 和 Server Components 相关的文档。

预期结构：

```text
src/app/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── records/page.tsx
│   ├── portfolio/page.tsx
│   ├── trends/page.tsx
│   └── data/page.tsx
├── app-sidebar.tsx
├── app-shell.tsx
└── globals.css
```

Feature 代码继续放在 `src/features/monthly-snapshots`，按真实页面职责拆分展示组件，不建立通用组件库：

- 纯月份解析与带月份链接构造保持纯 TypeScript。
- 页面继续作为 Server Component 加载数据。
- 仅真实交互组件使用 Client Component。
- 数据库模块不能进入客户端组件。
- 财务计算继续由纯 TypeScript model 提供。
- `MonthlySnapshotForm` 的表单状态与 Server Action 边界保留。
- 只在至少两个页面真实复用时提取共享展示组件。

## 10. 状态与错误处理

所有页面都必须定义：

- 加载状态：结构稳定，不用大面积发光 Skeleton。
- 空月份：明确所选月份没有记录，并提供前往月度记录的动作。
- 无历史：说明保存第一条记录后才会显示趋势。
- 数据库错误：沿用现有全局错误页，说明数据未被自动删除。
- 表单错误：摘要可定位到第一个错误字段，已填写内容不丢失。
- 保存成功：跳回复盘页并立即看到新数据。
- 删除失败：记录保留并显示明确错误。
- 恢复失败：现有数据不被替换。

视觉材质不能使错误、警告、禁用或 loading 状态难以识别。

## 11. 测试与验收

### 自动测试

- Shared Layout 与五个路由均可渲染。
- 侧栏链接、选中状态和底部数据安全位置。
- 月份参数在业务页面之间保留，`/data` 不携带月份。
- 复盘页包含净资产、五项资金指标、趋势摘要和配置摘要。
- 月度记录保存、错误聚焦、全零确认、删除和成功跳转。
- 投资组合空状态与完整层级。
- 历史趋势窗口、切换和数据表。
- 数据安全导出与恢复行为。
- Design Tokens、三层 Surface 规则、reduced motion 和 blur 使用边界。

### 必须运行

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

### 浏览器验收

桌面宽度：1280、1366、1440、1512、1600 和 1920px。

必须验证：

- 五个页面与侧栏均无水平溢出。
- 月份、标题和主动作的位置稳定。
- 环境光不可明显识别为渐变圆形。
- Frosted Surface 薄、轻、透，不高悬浮。
- Liquid Control 比内容 Surface 更强但不抢视觉焦点。
- 图表和资产配置行保持高可读性。
- 不出现 glass-inside-glass、重 blur、霓虹、明显 glow 或高饱和紫色科技感。
- Hover、active、focus-visible 与 reduced motion 正常。
- 浏览器不支持 `backdrop-filter` 时仍有可读的实体化 fallback。
- 滚动时无明显 blur 性能问题。

## 12. Git 与交付

- V1 标签：`v1.0.0` → `73ec8b0`。
- V2 分支：`codex/v2-multi-page-dashboard`。
- V2 worktree：`.worktrees/v2-multi-page-dashboard`。
- 不从已分叉的 `codex/ui-system-redesign` 继续开发。
- 设计规格、实施计划、结构改造、各页面和视觉校准分别提交，保持可审阅历史。
- V2 完整验收后才允许合并到 `main`；合并后的稳定提交标记 `v2.0.0`。
- 不推送、不合并、不删除旧分支，除非用户明确要求。

## 13. 完成定义

V2 只有同时满足以下条件才算完成：

- 五个独立页面和共享侧栏完整工作。
- 不存在独立资产管理或重复资产编辑入口。
- 月份上下文可跨业务页面保持。
- 现有财务计算、录入、删除、备份和恢复能力无回归。
- 月度复盘首页实现选定的方案 1 信息结构。
- Ice Crystal Finance UI 满足三层 Surface、轻 Ambient Light、克制 Liquid Control 与数据优先原则。
- 所有自动检查、生产构建和桌面浏览器验收通过。
- 用户审阅并接受最终 V2 结果。
