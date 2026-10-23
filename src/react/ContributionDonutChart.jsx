import React from "react";

const defaultValue = (value) => Number(value || 0).toLocaleString("zh-CN");

export default function ContributionDonutChart({
  items = [],
  centerLabel = "全部",
  formatValue = defaultValue,
  selectedKey = "",
  onSelect,
  selectedKeys,
  onSelectionChange,
  className = "",
  footer = null,
  emptyMessage = "暂无构成数据",
  layout = "standard",
}) {
  const [hoverKey, setHoverKey] = React.useState("");
  const usable = items.filter((item) => Number.isFinite(Number(item.value)) && Number(item.value) > 0);
  const total = usable.reduce((sum, item) => sum + Number(item.value), 0);
  if (!usable.length || total <= 0) return <div className={`contribution-donut-empty ${className}`.trim()}>{emptyMessage}</div>;

  const selected = selectedKeys ?? (selectedKey ? [selectedKey] : []);
  const activeKeys = hoverKey ? [hoverKey] : selected;
  const activeKey = hoverKey || (selected.length === 1 ? selected[0] : "");
  const activeItem = usable.find((item) => item.key === activeKey);
  let offset = 0;
  const segments = usable.map((item) => {
    const share = Number(item.value) / total;
    const percent = share * 100;
    const gap = usable.length > 1 ? Math.min(1.2, percent * .25) : 0;
    const angle = ((offset + percent / 2) * 3.6 - 90) * Math.PI / 180;
    const segment = {
      ...item,
      share,
      dasharray: `${Math.max(0, percent - gap)} ${100 - Math.max(0, percent - gap)}`,
      dashoffset: 25 - offset - gap / 2,
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };
    offset += percent;
    return segment;
  });

  const toggle = (item) => {
    if (selectedKeys !== undefined) onSelectionChange?.(selected.includes(item.key) ? selected.filter(key => key !== item.key) : [...selected, item.key]);
    else onSelect?.(selectedKey === item.key ? "" : item.key);
  };
  const keyDown = (event, item) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle(item);
  };

  // compact：圆环缩小、图例只留名称/金额/占比，窄栏（约 430px 起）也能把图例放在圆环右侧。
  const layoutClass = layout === "compact" ? " is-compact" : "";
  return <div className={`contribution-donut-chart${layoutClass} ${className}`.trim()}>
    <div className="contribution-donut-visual">
      <svg className="contribution-donut-svg" viewBox="0 0 190 190" aria-label={`${centerLabel}构成环形图`}>
        <circle className="contribution-donut-track" cx="95" cy="95" r="68" pathLength="100" />
        {segments.map((item) => {
          const active = activeKeys.includes(item.key);
          const segmentClass = active ? "donut-chart-segment is-active" : activeKeys.length ? "donut-chart-segment is-muted" : "donut-chart-segment";
          return <circle
            key={item.key}
            className={segmentClass}
            cx="95"
            cy="95"
            r="68"
            pathLength="100"
            role="button"
            aria-pressed={selected.includes(item.key)}
            tabIndex="0"
            aria-label={`${item.label}，${formatValue(item.value)}，${(item.share * 100).toFixed(1)}%`}
            stroke={item.color}
            strokeDasharray={item.dasharray}
            strokeDashoffset={item.dashoffset}
            style={{ "--donut-x": `${item.x}px`, "--donut-y": `${item.y}px` }}
            onMouseEnter={() => setHoverKey(item.key)}
            onMouseLeave={() => setHoverKey("")}
            onFocus={() => setHoverKey(item.key)}
            onBlur={() => setHoverKey("")}
            onClick={() => toggle(item)}
            onKeyDown={(event) => keyDown(event, item)}
          />;
        })}
      </svg>
      <div className="contribution-donut-center">
        <strong title={activeItem?.label || centerLabel}>{activeItem?.label || centerLabel}</strong>
        <b>{formatValue(activeItem?.value ?? total)}</b>
      </div>
    </div>
    <div className="contribution-donut-content">
      <div className="contribution-donut-list">
        {segments.map((item) => <button
          type="button"
          key={item.key}
          aria-pressed={selected.includes(item.key)}
          className={selected.includes(item.key) ? "contribution-donut-row is-selected" : "contribution-donut-row"}
          onMouseEnter={() => setHoverKey(item.key)}
          onMouseLeave={() => setHoverKey("")}
          onFocus={() => setHoverKey(item.key)}
          onBlur={() => setHoverKey("")}
          onClick={() => toggle(item)}
        >
          <span className="contribution-donut-name"><i style={{ background: item.color }} />{item.icon ? <span className="contribution-donut-icon" aria-hidden="true">{item.icon}</span> : null}<span><strong>{item.label}</strong>{item.meta && <small>{item.meta}</small>}</span></span>
          <span className="contribution-donut-bar"><i style={{ width: `${item.share * 100}%`, background: item.color }} /></span>
          <b className="contribution-donut-value">{formatValue(item.value)}</b>
          <strong className="contribution-donut-share">{(item.share * 100).toFixed(1)}%</strong>
        </button>)}
      </div>
      {footer}
    </div>
  </div>;
}
