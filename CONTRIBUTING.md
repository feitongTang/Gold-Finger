# 参与贡献

感谢你关注 Gold-Finger。项目当前是一个本地单用户、桌面端优先的月度财务复盘 MVP。开始修改前，请先阅读 [产品范围](docs/product-scope.md)，避免把范围外功能混入小型改动。

## 开发环境

需要 Node.js 24 和 npm。克隆仓库后执行：

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

应用默认使用 `data/gold-finger.db`。请勿提交真实财务数据、环境文件或本地数据库；仓库的 `.gitignore` 已覆盖常见敏感数据格式。

如需体验公开演示数据，运行：

```bash
npm run dev:demo
```

Demo 固定使用 `data/gold-finger-demo.db` 和 `3001` 端口，每次启动都会重建虚拟数据。

## 项目边界

- `src/app` 只负责 Next.js 路由、布局和路由级界面，不直接包含 SQL。
- `src/db` 负责 SQLite 连接和 schema；客户端组件不得导入服务端数据库模块。
- `src/features` 按业务能力组织代码，文件优先放在所属 feature 内。
- 财务计算应保持为纯 TypeScript，并使用单元测试覆盖。
- `scripts` 只放仓库级开发或启动工具，不放应用运行时代码。
- 当前 MVP 只验收桌面端；不要在无独立需求的情况下增加移动端适配。
- 保持最小修改，不为尚未出现的需求增加抽象或依赖。

## 数据库迁移

修改 `src/db/schema.ts` 后执行：

```bash
npm run db:generate
```

提交生成并人工审阅过的 `drizzle/` 迁移文件。不要重命名或重写已经提交的迁移；持久化测试应使用内存或临时 SQLite 数据库。

## 提交前检查

所有改动至少需要通过：

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

源代码或构建配置发生变化时，还需要运行：

```bash
npm run build
```

也可以用 `npm run check` 一次执行格式、Lint、类型和测试检查。

## Pull Request

- 说明改动解决的问题和明确不包含的范围。
- 对计算或持久化变化补充测试；只有真实交互变化才添加 UI 测试。
- 若修改用户流程，同步更新 README、产品范围或验收记录中的相关内容。
- 不要在提交中包含个人数据库、账单、导入导出文件或其他真实财务信息。
