# Project

Gold-Finger 是本地单用户的月度财务复盘 MVP。产品范围以 `PROJECT.md` 为准。技术栈为 Node.js 24、npm、Next.js App Router、React、严格 TypeScript、Tailwind CSS、SQLite/Drizzle 和 Vitest。

# Structure

- `src/app`：路由、布局和路由级 UI。
- `src/db`：数据库连接与 schema。
- `src/features`：按业务能力纵向组织的功能，确有内容时再创建。
- `src/lib`：仅存放真正跨功能共享的纯 TypeScript 工具。
- `drizzle`：生成并审阅后的 SQL 迁移。

# Commands

- 开发：`npm run dev`
- 格式检查：`npm run format:check`
- Lint：`npm run lint`
- 类型检查：`npm run typecheck`
- 测试：`npm test`
- 生产构建：`npm run build`
- 全部常规检查：`npm run check`

# Rules

- 路由和客户端组件不得包含 SQL 或导入服务端数据库模块；财务计算写成纯 TypeScript。
- 文件优先放在所属 feature 内，保持职责单一；只在出现真实共享需求时抽取公共代码。
- 保持最小修改，不做无关重构，不为假设需求增加抽象。
- 当前 MVP 仅面向桌面端；除非用户明确提出新需求，不新增手机端适配、移动端响应式布局或窄屏验收要求。
- 仅当当前任务确实使用且现有平台无法简单解决时新增依赖，并提交 `package-lock.json`。
- 计算使用单元测试；持久化使用内存或临时 SQLite 数据库；只有真实交互才添加 UI 测试。
- 完成任务前必须运行 `npm run format:check`、`npm run lint`、`npm run typecheck` 和 `npm test`。源代码或构建配置有变化时还要运行 `npm run build`。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
