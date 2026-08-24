# Gold-Finger

Gold-Finger 是一个面向个人的月度财务复盘工具，用于低频记录现金流和资产快照，了解资金如何流动以及净资产是否持续增长。

## 项目状态

仓库当前已实现 MVP 月度闭环：首次资产录入、月度更新、复盘结果、固定投资分类汇总和历史趋势。当前 MVP 仅面向桌面端，手机端适配不在范围内。详细信息见[产品范围](docs/product-scope.md)、[MVP Backlog](docs/mvp-backlog.md) 和[人工验收记录](docs/mvp-acceptance.md)。

第一版是本地单用户应用，不包含登录、云同步或远程服务。默认数据文件位于 `data/gold-finger.db`，该目录下的数据库文件不会提交到 Git。

## 快速体验 Demo

仓库自带一组可公开展示的虚拟财务数据。安装依赖后执行：

```bash
npm install
npm run dev:demo
```

然后访问 [http://localhost:3001](http://localhost:3001)。macOS 用户也可以双击项目根目录下的 `Gold-Finger-Demo.command`。

Demo 会展示截至当前月份的连续 6 个月数据，覆盖投资盈利与亏损、申购与赎回、负债变化以及多种投资分类。每次重新启动 Demo 都会恢复同一组虚拟金额，适合功能演示和 README 截图；运行期间仍可正常修改数据、体验完整保存流程。

虚拟数据源位于 `src/features/demo/demo-data.ts`，随仓库公开且可以直接审阅。启动时，应用会根据这份数据在本地生成 `data/gold-finger-demo.db`，而不是提交难以审阅的 SQLite 二进制文件。

Demo 模式固定使用独立数据库和 `3001` 端口。即使 `.env.local` 配置了个人 `DATABASE_FILE`，Demo 也不会读取或覆盖该文件。Next.js 不允许同一项目同时运行两个开发服务器；如果日常模式正在运行，请先在其终端按 `Ctrl+C` 停止，再启动 Demo。

## 技术栈

- Node.js 24 LTS 与 npm
- Next.js App Router、React、严格 TypeScript
- Tailwind CSS
- SQLite、Drizzle ORM 与 Drizzle Kit
- ESLint、Prettier、Vitest

## 本地启动

请先安装 Node.js 24 和 npm，然后在项目根目录执行：

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。默认配置不含密钥；如需更换本地数据库位置，可修改 `.env.local` 中的 `DATABASE_FILE`。

macOS 用户完成依赖安装和环境配置后，也可以双击项目根目录下的 `Gold-Finger.command`。普通模式与 Demo 模式的双击入口分别为 `Gold-Finger.command` 和 `Gold-Finger-Demo.command`。

如需以生产模式运行：

```bash
npm run build
npm run start
```

## 如何使用

### 1. 首次录入

首次打开应用时，当前月份还没有财务记录。确认“记录月份”正确后，依次填写：

1. 本月现金流：收入、支出和投资净投入。
2. 现金资产：应急备用金、目标准备金和日常现金的当前余额。
3. 基金资产：新月份会带出最近一次持有的基金；填写名称、固定分类、当前市值和本月净投入，没有基金时可以留空。
4. 负债：当前花呗余额。

本月净投入中申购填正数、赎回填负数，同时发生时填写净额；其他金额必须不小于 0。所有金额最多保留两位小数。填写完成后选择“保存月度记录”。保存成功后，页面会立即显示本月资金分配、净资产、资产结构和投资组合分类。

### 2. 每月更新

月末复盘时，在“记录月份”中选择目标月份并选择“载入月份”。如果该月份还没有记录，填写完整数据后保存；如果已经存在记录，表单会载入原数据，修改后选择“更新月度记录”。

每个月只有一份快照，重复保存同一个月份会更新原记录，不会创建重复月份。

### 3. 查看复盘结果

选择月份后，“本月结果”会展示：

- 收入、支出、投资净投入和月度结余。
- 现金、投资、负债与当前净资产。
- 现金和投资占总资产的比例。
- 基金按固定分类汇总后的当前市值与本月净投入。

月度结余的计算方式是“收入 − 支出 − 投资净投入”；净投入为负时，赎回资金会增加月度结余。净资产的计算方式是“现金 + 投资 − 负债”。

### 4. 查看历史变化

“已有月份”会列出所有已保存的月份。选择一个月份后点击“查看复盘”，即可查看该月的完整数据。

“月度变化”按时间顺序展示净资产、月度结余、现金资产、投资资产和负债，并与上一份已保存记录比较。没有记录的月份不会被自动补值。当前按桌面端布局展示全部指标。

### 5. 遇到错误时

- 输入错误：根据字段下方提示修改后重新保存，已填写内容会保留。
- 保存失败：确认数据库文件所在目录可写，然后重新提交。
- 无法读取数据库：确认 `DATABASE_FILE` 指向正确且可读写的文件，再选择“重新载入”。

## 常用命令

| 命令                   | 用途                           |
| ---------------------- | ------------------------------ |
| `npm run dev`          | 启动本地开发服务器             |
| `npm run dev:demo`     | 重置虚拟数据并启动演示服务器   |
| `npm run build`        | 创建生产构建                   |
| `npm run start`        | 启动生产构建                   |
| `npm run format`       | 格式化代码和项目文档           |
| `npm run format:check` | 检查格式                       |
| `npm run lint`         | 运行 ESLint                    |
| `npm run typecheck`    | 运行 TypeScript 类型检查       |
| `npm test`             | 运行基础测试                   |
| `npm run test:watch`   | 以监听模式运行测试             |
| `npm run check`        | 依次检查格式、lint、类型和测试 |
| `npm run db:generate`  | 根据数据库 schema 生成迁移     |
| `npm run db:migrate`   | 应用已生成的数据库迁移         |

## 项目结构

```text
Gold-Finger/
├── README.md                  项目介绍、使用说明与数据安全指南
├── CONTRIBUTING.md            开发和贡献约定
├── LICENSE                    MIT 许可证
├── Gold-Finger.command        macOS 普通模式启动器
├── Gold-Finger-Demo.command   macOS Demo 模式启动器
├── docs/
│   ├── product-scope.md       产品目标、MVP 范围与验收标准
│   ├── mvp-backlog.md         MVP 开发任务与完成状态
│   ├── mvp-acceptance.md      人工验收记录
│   ├── designs/               已确认的设计记录
│   └── plans/                 历史实施计划
├── drizzle/                   生成并审阅后的 SQL 迁移
├── scripts/                   仓库级启动工具及其测试
└── src/
    ├── app/                   Next.js 路由、布局和路由级界面
    ├── db/                    SQLite 连接与数据库 schema
    └── features/              按业务能力纵向组织的功能
        ├── demo/              公开演示数据
        ├── monthly-snapshots/ 月度记录、计算、持久化与界面
        └── theme/             主题配置与切换
```

目录仅在有实际内容时创建；业务代码优先放在所属 feature 中，跨功能工具只在确有共享需求时进入 `src/lib`。仓库级脚本放在根目录 `scripts`，不与应用源代码混放。

## 数据隐私、备份与恢复

默认数据库文件是项目根目录下的 `data/gold-finger.db`。如果 `.env.local` 中设置了 `DATABASE_FILE`，应用会改用该位置；相对路径从项目根目录解析。Git 默认忽略 `data` 目录下常见的 `.db`、`.sqlite` 和 `.sqlite3` 数据库及其伴生文件。自定义数据库应放在项目目录之外；如必须放在项目内且使用其他文件名，请先把对应路径加入 `.gitignore` 或本机的 `.git/info/exclude`，避免真实财务数据被提交。

Gold-Finger 不包含登录、云同步或远程财务服务。数据默认只保存在本机，但使用者仍需自行保护数据库文件、备份和设备访问权限。提交 Issue 或 Pull Request 时，请勿附带真实数据库、账单、截图或可识别个人财务状况的信息。

演示数据库固定为 `data/gold-finger-demo.db`，由 `npm run dev:demo` 自动重建。不要把个人数据写入 `src/features/demo/demo-data.ts`；该文件会随公开仓库提交。

### 清空数据并重新录入

清空操作会永久删除全部月度记录。先停止开发或生产服务器，确认 `DATABASE_FILE` 指向的实际数据库文件，再删除该文件。使用默认路径时执行：

```bash
rm data/gold-finger.db
npm run dev
```

应用重新启动时会创建空数据库并自动执行已有迁移。打开页面后应看到首次录入的空状态；如果仍显示历史数据，请检查 `.env.local` 是否配置了其他 `DATABASE_FILE`。数据库文件及 SQLite 伴生文件应保持在 Git 忽略范围内，不要提交真实财务数据。

### 备份

先停止开发或生产服务器，避免复制正在写入的数据库，然后把实际数据库文件复制到项目目录之外。例如使用默认路径时：

```bash
mkdir -p "$HOME/Documents/Gold-Finger Backups"
cp data/gold-finger.db "$HOME/Documents/Gold-Finger Backups/gold-finger-$(date +%F).db"
```

### 恢复

同样先停止服务器，先保留当前文件，再用选定备份替换数据库并重新启动应用：

```bash
cp data/gold-finger.db data/gold-finger.before-restore.db
cp "$HOME/Documents/Gold-Finger Backups/gold-finger-2026-08-20.db" data/gold-finger.db
npm run dev
```

如果使用自定义 `DATABASE_FILE`，请把上述 `data/gold-finger.db` 替换为该文件的实际路径。恢复后先载入一个已有月份确认数据无误，再决定是否删除 `data/gold-finger.before-restore.db`。

## 架构边界

- 路由负责组合界面和业务操作，不直接包含 SQL。
- 浏览器端代码不得导入数据库模块。
- 财务计算保持为无框架依赖的纯 TypeScript 函数。
- 新功能优先放在对应 feature 内，不为尚未出现的需求添加通用层或依赖。

## 参与贡献

环境准备、项目边界、数据库迁移和提交前检查见 [CONTRIBUTING.md](CONTRIBUTING.md)。提出改动前请先确认它符合当前产品范围，并确保不包含任何真实财务数据。

## 许可证

Gold-Finger 使用 [MIT License](LICENSE)。
