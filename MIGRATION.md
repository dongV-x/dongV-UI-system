# 迁移与升级

## 从优谱 `ui-kit/` 迁移

1. 安装 Release tgz。
2. 引入 `tokens.css` 和 `components.css`。
3. 旧页面仍使用 `--yp-*` 时，再引入 `compat/youpu.css`。
4. 原本从本地共享组件导入的文件改成薄转发：`export * from "dongv-ui-system/react"`。
5. 删除薄转发文件中的组件实现和样式副本，只保留兼容入口。
6. 运行项目测试、生产构建和 960/1440 亮暗主题验收。

## V1 兼容决定

React 组件内部继续输出 `youpu-*` 等已存在 class，避免优谱业务样式一次性大改。它们在 V1 内视为兼容契约；新的公共 Token 只使用 `--dv-*`。

## 升级规则

```mermaid
flowchart TD
    A[读取 CHANGELOG] --> B[安装新版本]
    B --> C[运行测试与生产构建]
    C --> D[检查代表页面和键盘操作]
    D --> E{是否有破坏性变化}
    E -->|否| F[提交依赖升级]
    E -->|是| G[按迁移说明修改后再验收]
```

## 1.0.2 焦点样式

- 公共组件焦点由品牌红光圈改为中性焦点线。
- `PageTabs`、`Select` 和 `SingleSelect` 不再把焦点或悬停显示成粉红底色；真实选中态仍通过文字、下划线或中性底色辨认。
- 宿主项目若有局部 `:focus` / `:focus-visible` 品牌色规则，应同步改为中性边框或中性焦点线。


## 1.0.4 状态与安全间距

- `DataTable` 的 `th/td` 默认使用横向 `10px`、纵向 `6px` 内边距并垂直居中；多行内容可在单元格设置 `data-vertical-align="top"`。紧凑业务页可覆盖两个 padding 变量，但不得压到零。
- `LoadingState`、`EmptyState`、`ErrorState` 新增 `scope="inline|table|section|page"`。默认 `section`；表格空状态使用 `table`，整页加载或错误使用 `page`，紧邻控件的短状态使用 `inline`。
- 公共状态组件现在默认负责 padding、居中和最小高度。旧页面若已有完整状态布局，应删除重复规则或确认其没有把公共 padding 压成零。
