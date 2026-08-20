# Gold-Finger

Gold-Finger 是一个面向个人的月度财务复盘工具，用于低频记录现金流和资产快照，了解资金如何流动以及净资产是否持续增长。

## Current status

仓库当前已实现 MVP 月度闭环：首次资产录入、月度更新、复盘结果、固定投资分类汇总和历史趋势。产品范围见 `PROJECT.md`，开发状态见 `TASKS.md`，人工验收记录见 `docs/MVP_ACCEPTANCE.md`。

第一版是本地单用户应用，不包含登录、云同步或远程服务。默认数据文件位于 `data/gold-finger.db`，该目录下的数据库文件不会提交到 Git。

## Technical stack

- Node.js 24 LTS 与 npm
- Next.js App Router、React、严格 TypeScript
- Tailwind CSS
- SQLite、Drizzle ORM 与 Drizzle Kit
- ESLint、Prettier、Vitest

## Local setup

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。默认配置不含密钥；如需更换本地数据库位置，可修改 `DATABASE_FILE`。

## Commands

| Command                | Purpose                        |
| ---------------------- | ------------------------------ |
| `npm run dev`          | 启动本地开发服务器             |
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

## Project structure

```text
src/app/     Next.js 路由、布局和路由级界面
src/db/      SQLite 连接和数据库 schema
src/features 后续按业务能力纵向组织的功能
src/lib/     仅在确有共享需求时放置纯 TypeScript 工具
drizzle/     后续生成并提交的 SQL 迁移
```

目录仅在有实际内容时创建；业务代码优先放在所属 feature 中，跨功能工具只在确有共享需求时进入 `src/lib`。

## Local data and backup

默认数据库文件是项目根目录下的 `data/gold-finger.db`。如果 `.env.local` 中设置了 `DATABASE_FILE`，应用会改用该位置；相对路径从项目根目录解析。Git 只默认忽略 `data/*.db*`，因此自定义数据库应放在项目目录之外；如必须放在项目内，请先把对应路径加入 `.gitignore`，避免真实财务数据被提交。

备份前先停止开发或生产服务器，避免复制正在写入的数据库，然后把实际数据库文件复制到项目目录之外。例如使用默认路径时：

```bash
mkdir -p "$HOME/Documents/Gold-Finger Backups"
cp data/gold-finger.db "$HOME/Documents/Gold-Finger Backups/gold-finger-$(date +%F).db"
```

恢复时同样先停止服务器，先保留当前文件，再用选定备份替换数据库并重新启动应用：

```bash
cp data/gold-finger.db data/gold-finger.before-restore.db
cp "$HOME/Documents/Gold-Finger Backups/gold-finger-2026-08-20.db" data/gold-finger.db
npm run dev
```

如果使用自定义 `DATABASE_FILE`，请把上述 `data/gold-finger.db` 替换为该文件的实际路径。恢复后先载入一个已有月份确认数据无误，再决定是否删除 `data/gold-finger.before-restore.db`。

## Architecture boundaries

- 路由负责组合界面和业务操作，不直接包含 SQL。
- 浏览器端代码不得导入数据库模块。
- 财务计算保持为无框架依赖的纯 TypeScript 函数。
- 新功能优先放在对应 feature 内，不为尚未出现的需求添加通用层或依赖。
