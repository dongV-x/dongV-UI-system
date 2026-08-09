# 来源与单一事实源

- V1.0 来源：优谱正式 UI 基线，抽取点为有谱分支提交 `8c75a16`。
- 公开包唯一可编辑 Token 源：`src/tokens.json`。
- 公开包唯一可编辑共享组件源：`src/react/` 与 `src/components.css`。
- `src/tokens.css`、`compat/youpu.css`、`dist/` 和 Release tgz 都是生成物。
- 优谱回接后只保留薄转发层，不再维护第二份共享实现。

历史 `ui-kit/` 曾承担设计移交、参考页面、Arco 评估和截图证据，因此不能在未审计前直接删除。它后续只保留项目历史与迁移说明；共享代码以本仓库为准。
