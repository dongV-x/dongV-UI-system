# 组件清单（自动生成，勿手改）

由 `npm run manifest` 从 `src/react/*.jsx` 生成。**新增组件前先查这里**，不要因为「没找到」就写原生标签。

共 23 个导出组件。

| 组件 | props | 说明 |
|---|---|---|
| **AppDialogProvider** | `children` |  |
| **Button** | `variant`="secondary"、`size`="medium"、`loading`=false、`disabled`=false、`icon`、`type`="button"、`onClick`、`className`=""、`children` + 透传 |  |
| **ClassificationTag** | `as`="span"、`tone`="normal"、`icon`、`className`=""、`children` + 透传 |  |
| **ContributionDonutChart** | `items`=[]、`centerLabel`="全部"、`formatValue`=defaultValue、`selectedKey`=""、`onSelect`、`className`=""、`footer`=null、`emptyMessage`="暂无构成数据" |  |
| **DataTable** | `density`="standard"、`className`="" + 透传 |  |
| **Drawer** | `open`=true、`onClose`、`ariaLabel`、`ariaLabelledby`、`overlayClassName`=""、`className`=""、`portalTarget`、`children` |  |
| **EmptyState** | `className`="" + 透传 |  |
| **ErrorState** | `className`="" + 透传 |  |
| **Field** | `label`、`required`=false、`error`、`hint`、`htmlFor`、`className`=""、`children` |  |
| **HelpPopover** | `as`="aside"、`className`="" + 透传 |  |
| **Input** | `invalid`=false、`size`="medium"、`prefix`、`suffix`、`className`="" + 透传 |  |
| **LoadingState** | `className`="" + 透传 |  |
| **MetaTag** | `tone`="neutral"、`className`="" + 透传 |  |
| **Modal** | `open`=true、`onClose`、`title`、`ariaLabel`、`overlayClassName`=""、`className`=""、`width`、`closeLabel`="关闭"、`closeIcon`="×"、`portalTarget`、`children` |  |
| **PageHeader** | `as`="header"、`className`="" + 透传 |  |
| **PageTabs** | `className`="" + 透传 |  |
| **Select** | `ariaLabel`、`className`=""、`compactTable`=false、`contentWidth`=false、`disabled`=false、`menuMinWidth`、`onChange`、`options`=[]、`placeholder`="请选择"、`value`="" |  |
| **SingleSelect** | `ariaLabel`、`className`=""、`disabled`=false、`id`、`onChange`、`options`、`value` |  |
| **StatusBadge** | `tone`="neutral"、`className`="" + 透传 |  |
| **TableToolbar** | `as`="div"、`className`="" + 透传 |  |
| **Toast** | `tone`="success"、`className`="" + 透传 |  |
| **Tooltip** | `as`="span"、`className`="" + 透传 |  |
| **TrendAreaChart** | `series`=[]、`label`="趋势"、`axisStep`=1、`animate`=false、`valueKind`="number"、`showYAxis`=false、`className`=""、`emptyMessage`="当前没有可展示的趋势数据"、`portalTarget` |  |

## 使用纪律

- 页面**不得**直接写 `<button>` / `<input>` / `<select>` / `<table>`——用上表组件。
- 需要新变体时在本包新增 variant，**不要**在业务侧写原生标签加 class。
- 组件样式一律取用 token；业务侧不得用 `style={{}}` 覆盖组件内部尺寸与颜色。
