# Gold-Finger

Gold-Finger 是一个面向个人的月度财务复盘工具，用于低频记录现金流和资产快照，了解资金如何流动以及净资产是否持续增长。

## Current status

仓库当前仅包含可运行的 MVP 工程骨架和本地 SQLite 基础设施，尚未实现财务录入、计算或展示流程。产品范围见 `PROJECT.md`，后续开发顺序见 `TASKS.md`。

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

只会在目录有实际内容时创建它，因此 `src/features`、`src/lib` 和 `drizzle` 将由对应业务任务按需建立。

## Architecture boundaries

- 路由负责组合界面和业务操作，不直接包含 SQL。
- 浏览器端代码不得导入数据库模块。
- 财务计算保持为无框架依赖的纯 TypeScript 函数。
- 新功能优先放在对应 feature 内，不为尚未出现的需求添加通用层或依赖。
