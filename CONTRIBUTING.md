# Contributing

1. 先说明真实页面问题和复用证据。
2. Token 只改 `src/tokens.json`，然后运行 `npm run tokens`。
3. 组件变更同步测试、`DESIGN.md`、`CHANGELOG.md`；破坏性变化同步 `MIGRATION.md`。
4. 提交前运行：

```bash
npm ci
npm run check
```

V1 不接受业务页面、真实数据、Arco 核心依赖、Vue/Svelte/移动端和为了未来预留的空组件。
