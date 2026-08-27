# Gold-Finger UI System Redesign Design

## 1. 背景与目标

Gold-Finger 是本地单用户的月度财务复盘 MVP。当前功能闭环、数据语义、表单错误处理和桌面最大宽度已经可用，但视觉系统依赖多主题、渐变背景、玻璃表面、大型圆角面板、边框与嵌套卡片来建立层级。页面因此具有较强的 dashboard 模板感，品牌气质随主题切换而变化，组件状态也难以长期统一维护。

本次重构采用已确认的 **Warm Editorial Finance** 方向：温暖纸白、墨色正文、固定深朱砂 Accent，通过 Typography、Spacing、Alignment、Proportion、Contrast 和 Rhythm 建立高级感。最终界面应安静、精确、自然、成熟，不以装饰效果吸引注意力。

### 目标

- 完整移除用户主题色切换能力及仅服务于它的代码。
- 建立单一、固定、语义化的 Design Token 系统。
- 重构 Header、页面容器、结果、趋势、录入和数据安全区域的桌面视觉层级。
- 统一按钮、输入、选择、状态、展开区、表格和危险操作的样式与交互状态。
- 减少 Card、Border、Background、Radius、Shadow 和 Accent 的使用频率。
- 保留现有业务逻辑、数据流、路由、持久化、表单行为与可访问性基础。
- 在 1280、1366、1440、1512、1600、1920px 桌面宽度下保持稳定比例。

### 非目标

- 不新增 Sidebar、移动导航、汉堡菜单或手机端专项组件。
- 不重构财务计算、数据库 schema、备份格式或路由结构。
- 不新增图表类型、财务建议、健康评分、预算或其他产品能力。
- 不引入新的 UI 框架、字体包、动画库或图标库。
- 不为了未来需求建立抽象层或第二套主题系统。

## 2. 设计原则

1. **Typography first**：先通过文字层级和数字比例表达信息，再考虑容器。
2. **Whitespace groups**：同组内容优先用间距和对齐组织，只有真正独立或可交互的对象使用 Surface。
3. **Accent as punctuation**：Accent 只用于主行动、选择态、焦点和极少数关键强调，不用于大面积背景或所有标题。
4. **One signal per state**：Active、warning、error 等状态只使用足够的 1–2 个视觉信号，避免颜色、边框、阴影和字重叠加。
5. **Numbers are content**：金额使用 tabular numerals、稳定对齐和清晰正负语义，不依赖 Badge 装饰。
6. **Material by restraint**：材质感来自非纯白色阶、低对比表面与极轻阴影，不使用 glassmorphism、glow 或明显渐变。
7. **Desktop first, future-safe**：只验收桌面，不主动删除现有不会妨碍桌面的响应式结构。

## 3. 信息架构与页面结构

产品继续使用单页流程，不新增 Sidebar 或新路由。页面自上而下调整为：

1. Global Header
2. Page Heading + Month Navigation
3. Current Month Summary
4. Monthly Review Details
5. Historical Trends
6. Monthly Entry
7. Local Data Safety

### Global Header

- 高度固定为 64px。
- 左侧保留 `Gold-Finger` 品牌名和 `月度财务复盘` 产品语境。
- 删除 ThemeSettings、色板、分组、Local Storage 和初始化脚本后，右侧保持为空，不增加占位动作。
- 使用温暖背景上的单条低对比分隔线；不使用 blur、glass surface 或 shadow。

### Page Heading + Month Navigation

- 月份从结果面板内部提升为页面级上下文。
- 左侧显示小型 metadata `YYYY 年 M 月` 与页面标题 `月度复盘`。
- 右侧放置上一月、当前月份、下一月导航。
- 月份切换按钮为 40×40px 方形控制，不做 Pill，不添加阴影。

### Current Month Summary

- 净资产是首屏唯一主视觉锚点。
- 有数据时显示 `当前净资产`、金额和主要动作 `更新数据`；`删除本月` 为低权重危险文字动作。
- 空月份显示简洁说明和一个 `新建数据` 主行动，不使用装饰性空状态图标。
- 总览区域允许使用一个轻 Surface，但内部不再切成多层卡片。

### Monthly Review Details

- `跨月一致性` 降级为紧凑复核区，保留完整文案和差额，但不再与核心指标拥有同等视觉体量。
- `资金分配` 使用三列数据行；`资产结构` 使用四列数据行。列之间只用细分隔线，不给每个指标独立卡片。
- `总资产构成` 保留单条比例条与简洁图例。
- `投资组合分类` 保留 drilldown 行为，采用列表行、对齐的比例和单色 chevron；只在 hover/active 时显示轻背景。

### Historical Trends

- 趋势区是完整 section，不再被大型外层 Card 包裹。
- 两个图表之间用 48px section gap 或一条细分隔线组织。
- 图表画布保留必要的 y 轴网格线，降低线条对比度；图例与 toggle 保持紧凑。
- Segmented toggle 可以使用 Pill 语法，因为它属于紧凑选择控件；不使用阴影。
- 可展开数据表保留，summary 采用 tertiary control 样式。

### Monthly Entry

- 保留折叠入口、现有事件、保存成功回流和错误聚焦逻辑。
- 展开入口不再是一张完整卡片；使用 section heading、说明和右侧按钮。
- 四个录入步骤保留编号，但移除贯穿全表单的装饰性垂直轨道。编号作为 24px 小型 metadata 标记。
- 各步骤之间用 48px 间距与细分隔线组织。
- 基金行是可交互信息单元，可以使用低对比 Surface；不使用明显阴影和大圆角。
- 表单底部 actions 保持明确：保存为 Primary，取消/收起为 Secondary 或 Tertiary。

### Local Data Safety

- 该区域视觉权重低于日常复盘与录入。
- `导出备份` 是明确主要动作。
- `从备份恢复` 是低频危险操作，使用次要 Surface 和 Secondary control；只有进入确认状态后才显示 Error 语义。
- 两者仍可在桌面端使用两列布局，但不使用等权大卡片；说明文字和动作位置体现主次。

## 4. Design Tokens

Token 继续通过 `src/app/globals.css` 的 `:root` CSS variables 提供，不建立独立 Theme Provider。

### Color

```css
--background-primary: #f5f2ec;
--background-secondary: #eee9e1;
--surface-primary: #fbf9f5;
--surface-subtle: #f1ede6;
--surface-elevated: #fffdfa;

--text-primary: #26241f;
--text-secondary: #625e55;
--text-tertiary: #817b70;
--text-inverse: #fffdfa;

--border-subtle: rgb(38 36 31 / 11%);
--border-strong: rgb(38 36 31 / 22%);

--accent-primary: #98473b;
--accent-hover: #81392f;
--accent-active: #6c2f28;
--accent-soft: #f3e5e1;
--focus-ring: rgb(152 71 59 / 32%);

--success: #35644d;
--success-soft: #e8f0ea;
--warning: #8a5b22;
--warning-soft: #f5ecdc;
--error: #a13d34;
--error-soft: #f6e5e2;
```

规则：

- 页面中 90% 以上面积来自 neutral token。
- `accent-primary` 不作为普通标题颜色。
- Error 与 Accent 数值接近但语义不同：Accent 用于交互，Error 用于失败、危险和业务负向状态。
- 图表序列使用低饱和的墨色、矿物蓝绿与暖灰紫，不复用高饱和 UI 颜色。

### Typography

继续使用系统字体栈，不新增网络字体。中文字形优先 `PingFang SC`，数字使用系统 UI 字体并启用 `font-variant-numeric: tabular-nums`。

| Token         | Size / Line Height | Weight | 用途                     |
| ------------- | ------------------ | ------ | ------------------------ |
| Display       | 40 / 48            | 600    | 当前净资产等单一关键数字 |
| Heading 1     | 32 / 40            | 600    | 页面标题                 |
| Heading 2     | 24 / 32            | 600    | 一级内容区               |
| Section title | 18 / 28            | 600    | 区域与表单步骤标题       |
| Body          | 15 / 24            | 400    | 正文和说明               |
| Secondary     | 14 / 22            | 400    | 辅助说明                 |
| Metadata      | 13 / 20            | 500    | 月份、分类、状态上下文   |
| Caption       | 12 / 18            | 400    | 图表轴、输入提示         |

只使用 400、500、600 三档字重。普通内容不使用 700 或更重字重。

### Spacing

统一使用：`4, 8, 12, 16, 24, 32, 48, 64, 96px`。

- Control internal：8 / 12 / 16px。
- Component gap：12 / 16 / 24px。
- Section gap：48 / 64px。
- Page top and bottom：48 / 96px。
- 不新增 13、19、27、37px 等 one-off spacing。

### Radius

```css
--radius-control: 8px;
--radius-panel: 12px;
--radius-modal: 16px;
--radius-compact: 6px;
```

Pill 只用于状态、Tag 与 Segmented Control。普通按钮、输入和面板不使用 `9999px`。

### Shadow

```css
--shadow-subtle: 0 1px 2px rgb(38 36 31 / 5%);
--shadow-floating: 0 16px 40px rgb(38 36 31 / 10%);
```

- 页面静态区默认无 Shadow。
- `shadow-subtle` 只用于需要与背景分离的轻 Surface。
- `shadow-floating` 仅用于 Modal、Popover、Dropdown 等浮层；当前页面若无浮层则不消费。

### Motion

```css
--motion-fast: 120ms;
--motion-normal: 180ms;
--motion-slow: 240ms;
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
```

- Hover、focus、颜色变化使用 fast 或 normal。
- 展开区使用 opacity + translate，最多 240ms。
- Press 可使用 `transform: scale(0.99)`。
- `prefers-reduced-motion: reduce` 下禁用非必要 transition、scroll behavior 和 transform。

## 5. 基础组件规范

### Button

- Primary：Accent 实色、inverse 文本、8px radius，无 glow、无 gradient、无默认 shadow。
- Secondary：透明或 Surface 背景、subtle border、primary text。
- Tertiary：无边框背景，hover 时显示 surface-subtle。
- Destructive：默认使用 tertiary error；仅确认不可逆操作时使用 error 实色。
- 高度：40px；紧凑控制 36px；最小点击目标 40×40px。
- Focus：2px 可见 focus ring + 2px offset，不能只依赖颜色变化。

### Input / Select / File Input

- 高度 44px，8px radius，默认 surface-primary + subtle border。
- Hover 只加强 border；focus 使用 accent border + focus ring。
- Error 使用 error border、error text 和 `aria-invalid`；不能只使用红色背景。
- Label 使用 14px/22 medium；placeholder 使用 tertiary text。
- Disabled 降低前景对比并使用 neutral background，同时保留可识别边界。

### Status / Badge

- 只用于真正的状态、错误摘要、确认与紧凑 metadata。
- 默认使用 soft semantic background + semantic text，不使用多色彩虹 Badge。
- 金额正负通过文本颜色与正负号表达，不强制包裹 Badge。

### Table / Data Grid

- 表头使用 metadata 字体和 secondary text。
- 行高 48–52px，只使用横向分隔线。
- 数字右对齐并启用 tabular numerals。
- Hover 使用极轻 surface-subtle；链接与可交互行具备 focus-visible。

### Floating Surfaces

- Dropdown、Popover、Modal 使用 surface-elevated、1px subtle border、shadow-floating。
- Radius 分别使用 panel 或 modal；动画为 180–240ms opacity + translate/scale。

## 6. 组件与代码架构

### Theme Cleanup

删除：

- `src/features/theme/theme-settings.tsx`
- `src/features/theme/theme.ts`
- `src/features/theme/theme.test.ts`
- `src/app/layout.tsx` 中的 theme imports、bootstrap script、`data-theme` 与 hydration suppression
- `src/app/page.tsx` 中的 `ThemeSettings`
- `globals.css` 中全部 `:root[data-theme]` 分支与 theme selector

不保留兼容层、隐藏入口、旧 Local Storage 迁移或主题配置占位。旧的 `gold-finger-theme-v1` 即使仍在浏览器存储中，也不会再被读取或影响界面。

### CSS Architecture

在不引入新依赖的前提下，将 `globals.css` 按以下顺序重组：

1. Tailwind import
2. Semantic tokens
3. Reset and global element rules
4. App shell and page layout
5. Base controls and shared states
6. Monthly review
7. Trends and table
8. Monthly entry form
9. Data safety and error/loading states
10. Desktop breakpoints and reduced motion

若单文件整理后仍明显过大，可将 feature-owned CSS 移入与组件同目录的 CSS Module；只有能显著改善职责边界时才拆分，不为拆分而拆分。

### React Components

- 保留 Server Component 页面数据流：`page.tsx` 读取月份与快照后传入各 feature 组件。
- 保留 `MonthlyReview`、`MonthlyHistory`、`MonthlySnapshotForm` 和 `DataSafetyPanel` 的业务职责。
- 允许从 `monthly-review.tsx` 提取纯展示组件，但不能改变计算输入或把财务计算搬进 UI。
- 不创建通用组件库目录；只有至少两个真实消费者时才抽取 Button、SectionHeading 等共享结构。
- 所有新增纯逻辑必须置于 feature 内并遵循 TDD；纯视觉 CSS 通过 DOM 结构测试和浏览器 QA 验证。

## 7. 数据流、交互与错误处理

- 月份路由参数、数据库加载、计算模型和 Server Actions 保持不变。
- 更新/新建入口继续触发现有 `OPEN_MONTHLY_ENTRY_EVENT`，确保首屏 CTA 与表单折叠入口行为一致。
- 保存错误继续打开表单、显示错误摘要、聚焦首个错误字段并保留已输入内容。
- 保存成功继续收起表单、刷新结果并把焦点带回结果标题。
- 全零月份、删除月份和恢复备份继续使用明确确认，不改变危险操作授权边界。
- Loading、Error、Empty、Success、Confirmation 状态必须消费统一 token，并与正常页面保持相同 Header 与内容宽度。

## 8. Accessibility

- 文本和交互对比度以 WCAG 2.2 AA 为最低目标；正文 4.5:1，大文本和 UI 边界至少满足适用要求。
- 所有可交互元素必须具有可见 `:focus-visible`，键盘操作不依赖 hover。
- 标题级别、region label、form label、error association 和 chart accessible name 保持或改善。
- 点击目标至少 40×40px；紧凑文字链接需要足够的块级 padding 或明确 focus 区域。
- 状态变化继续使用 `aria-live` / `role=alert`；颜色不是唯一状态信号。
- 图表保留可展开数据表作为非视觉替代。
- 视觉 QA 不能声明完整无障碍合规；实现后还需键盘、缩放、对比度与减少动效检查。

## 9. Desktop Layout

- Header content 与 page content 使用同一中心线。
- 主容器 `max-width: 1184px`。
- 1280px 时左右页边距至少 32px；大于容器宽度后空间平均留在两侧。
- 页面纵向间距使用 48/64/96px 体系。
- 结果和趋势可以占满容器；长说明文字最大宽度约 68ch；表单字段根据任务使用 2–4 列网格，不因 1920px 无限加宽。
- 保留不会妨碍桌面的现有 breakpoint；不新增 mobile menu、drawer、card-table 转换或窄屏专项交互。

## 10. Testing and Verification

### Automated

- 先写失败测试，证明 ThemeSettings 与主题 bootstrap 不再出现在输出中，再删除实现。
- 更新受 Header、空状态、section 结构影响的组件测试，断言用户可见语义与行为，不依赖脆弱的视觉 class 名。
- 保留并运行所有财务计算、repository、save、delete、backup 和 route 测试。
- 每个 TDD 循环都先确认测试因缺失的新行为而失败，再写最小实现通过。

### Required project checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

### Browser QA

- 宽度：1280、1366、1440、1512、1600、1920px。
- 状态：已保存月份、空月份、表单展开、基金列表、趋势切换、数据表展开、validation error、save success、delete confirm、restore confirm、loading、error。
- 交互：Tab 顺序、focus-visible、月份导航、主要 CTA、表单展开/收起、图表 toggle、drilldown、文件输入与危险确认。
- 视觉：最大宽度、列对齐、数字对齐、section rhythm、Card/Border/Accent 使用频率、1920px 空白比例、横向溢出。
- 动效：正常模式与 `prefers-reduced-motion`。

## 11. 完成标准

- 用户无法从任何 UI 或存储逻辑切换 Accent Theme。
- 产品只存在一套固定 Warm Editorial Finance 视觉主题。
- Header 移除主题入口后仍平衡且无占位元素。
- 净资产是首屏唯一主要视觉重点；每个页面区域不超过 1–2 个明显重点。
- 普通分组不再默认使用 Card；可通过留白、排版、对齐或 divider 解决的边界已删除。
- 基础控件和状态具有一致 default、hover、active、focus、disabled、loading 表达。
- 业务功能、数据流与财务计算行为不变。
- 所有项目检查通过，桌面目标宽度完成浏览器证据验收。
