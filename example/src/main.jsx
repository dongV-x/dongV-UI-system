import React from "react";
import { createRoot } from "react-dom/client";
import { AppDialogProvider, ContributionDonutChart, DataTable, Drawer, EmptyState, ErrorState, LoadingState, Modal, PageHeader, PageTabs, Select, StatusBadge, Toast, TrendAreaChart, useAppDialog } from "../../src/index.js";
import "../../src/tokens.css";
import "../../src/components.css";
import "./example.css";

const trend = [
  { label: "周一", value: 48, display: "48" }, { label: "周二", value: 58, display: "58" },
  { label: "周三", value: 54, display: "54" }, { label: "周四", value: 72, display: "72" },
  { label: "周五", value: 68, display: "68" }, { label: "周六", value: 81, display: "81" },
];
const donut = [
  { key: "a", label: "自然流量", value: 56, color: "#e1261c", meta: "稳定" },
  { key: "b", label: "活动流量", value: 31, color: "#d99a2b", meta: "增长" },
  { key: "c", label: "其他", value: 13, color: "#6d7684", meta: "正常" },
];

function Demo() {
  const dialog = useAppDialog();
  const [theme, setTheme] = React.useState("light");
  const [range, setRange] = React.useState("week");
  const [modal, setModal] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  React.useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return <main className="demo-shell">
    <PageHeader>
      <div><h1>经营工作台</h1><p>同一套 Token、CSS 与 React 组件</p></div>
      <div className="demo-actions">
        <button id="theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "切换暗色" : "切换亮色"}</button>
        <button id="open-modal" type="button" onClick={() => setModal(true)}>打开 Modal</button>
        <button id="open-drawer" type="button" onClick={() => setDrawer(true)}>打开 Drawer</button>
        <button id="open-dialog" type="button" onClick={() => dialog.confirm({ title: "确认发布", description: "这是可键盘操作的 AppDialog。" })}>打开 Dialog</button>
      </div>
    </PageHeader>
    <PageTabs aria-label="演示页签"><button className="active" type="button">总览</button><button type="button">明细</button></PageTabs>
    <section className="demo-toolbar"><Select ariaLabel="统计周期" contentWidth options={[{ value: "week", label: "本周" }, { value: "month", label: "本月" }]} value={range} onChange={setRange}/><StatusBadge tone="success">数据正常</StatusBadge></section>
    <section className="demo-grid">
      <article className="demo-panel"><h2>趋势</h2><TrendAreaChart series={[{ key: "orders", label: "订单", color: "#e1261c", points: trend }]}/></article>
      <article className="demo-panel"><h2>构成</h2><ContributionDonutChart items={donut} centerLabel="流量"/></article>
    </section>
    <section className="demo-panel"><h2>三档表格</h2><div className="demo-table-wrap"><DataTable density="standard"><thead><tr><th>对象</th><th>状态</th><th>负责人</th><th>更新时间</th></tr></thead><tbody><tr><td>示例商品 A</td><td><StatusBadge tone="success">正常</StatusBadge></td><td>成员甲</td><td>今天</td></tr><tr><td>示例商品 B</td><td><StatusBadge tone="warning">关注</StatusBadge></td><td>成员乙</td><td>昨天</td></tr></tbody></DataTable></div></section>
    <section className="demo-states"><LoadingState>加载中…</LoadingState><EmptyState>暂无数据</EmptyState><ErrorState>加载失败，请重试</ErrorState><Toast>保存成功</Toast></section>
    <Modal open={modal} onClose={() => setModal(false)} title="Modal 示例"><div className="overlay-body"><p>按 Esc 关闭，Tab 不会离开弹窗。</p><button data-autofocus type="button" onClick={() => setModal(false)}>完成</button></div></Modal>
    <Drawer open={drawer} onClose={() => setDrawer(false)} ariaLabel="Drawer 示例"><div className="overlay-body"><h2>Drawer 示例</h2><p>关闭后焦点回到原按钮。</p><button data-autofocus type="button" onClick={() => setDrawer(false)}>关闭</button></div></Drawer>
  </main>;
}
createRoot(document.getElementById("root")).render(<AppDialogProvider><Demo/></AppDialogProvider>);
