import React, { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "./YoupuUI.jsx";

const rates = new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const hasNumber = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));

function niceScaleMax(value, minimum = 1) {
  const target = Math.max(Math.abs(Number(value) || 0), minimum);
  const roughStep = target / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  const step = factor * magnitude;
  return step * Math.ceil(target / step);
}

function axisLabel(value, valueKind) {
  const numeric = Number(value) || 0;
  if (numeric === 0) return "0";
  if (valueKind === "rate") return `${rates.format(numeric * 100)}%`;
  if (valueKind === "ratio") return rates.format(numeric);
  if (valueKind === "integer") return Math.round(numeric).toLocaleString("zh-CN");
  const absolute = Math.abs(numeric);
  if (absolute >= 100000000) return `${rates.format(numeric / 100000000)}亿`;
  if (absolute >= 10000) return `${rates.format(numeric / 10000)}万`;
  return rates.format(numeric);
}

function pointLabel(value) {
  return hasNumber(value) ? rates.format(Number(value)) : "—";
}

function clampControl(value, start, end) {
  return Math.min(Math.max(value, Math.min(start, end)), Math.max(start, end));
}

export default function TrendAreaChart({
  series = [],
  label = "趋势",
  axisStep = 1,
  animate = false,
  valueKind = "number",
  showYAxis = false,
  className = "",
  emptyMessage = "当前没有可展示的趋势数据",
  portalTarget,
}) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const gradientPrefix = useId().replaceAll(":", "");
  const usable = series.filter((item) => item.points?.some((point) => hasNumber(point.value)));
  const count = Math.max(0, ...usable.map((item) => item.points.length));
  const allValues = usable.flatMap((item) => item.points.filter((point) => hasNumber(point.value)).map((point) => Number(point.value)));
  if (!allValues.length) return <div className="trend-area-chart-empty chart-empty">{emptyMessage}</div>;

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const minimumScale = valueKind === "rate" ? .04 : valueKind === "ratio" ? 1 : 4;
  const min = rawMin >= 0 ? 0 : -niceScaleMax(Math.abs(rawMin), minimumScale);
  const baseMax = rawMax > 0 ? niceScaleMax(rawMax, minimumScale) : rawMin < 0 ? 0 : niceScaleMax(0, minimumScale);
  const max = valueKind === "amount" && rawMax > 0 ? baseMax * 1.25 : baseMax;
  const axisTickCount = 5;
  const range = max - min || 1;
  const plotTop = 30;
  const plotBottom = 228;
  const x = (index) => 8 + (700 * index) / Math.max(1, count - 1);
  const y = (value) => plotBottom - ((plotBottom - plotTop) * (Number(value) - min)) / range;
  const axisTicks = Array.from({ length: axisTickCount }, (_, index) => max - ((max - min) * index) / (axisTickCount - 1));
  const segments = (points) => {
    const result = [];
    let current = [];
    points.forEach((point, index) => {
      if (!hasNumber(point.value)) {
        if (current.length) result.push(current);
        current = [];
      } else current.push({ ...point, index });
    });
    if (current.length) result.push(current);
    return result;
  };
  const path = (points) => points.map((point, index) => `${index ? "L" : "M"} ${x(point.index)} ${y(point.value)}`).join(" ");
  const smoothPath = (points) => {
    if (points.length < 3) return path(points);
    const coords = points.map((point) => ({ x: x(point.index), y: y(point.value) }));
    return coords.reduce((result, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = coords[index - 1];
      const previousPrevious = coords[index - 2] || previous;
      const next = coords[index + 1] || point;
      const controlOne = { x: previous.x + (point.x - previousPrevious.x) * .16, y: clampControl(previous.y + (point.y - previousPrevious.y) * .16, previous.y, point.y) };
      const controlTwo = { x: point.x - (next.x - previous.x) * .16, y: clampControl(point.y - (next.y - previous.y) * .16, previous.y, point.y) };
      return `${result} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${point.x} ${point.y}`;
    }, "");
  };
  const baselineY = y(min <= 0 && max >= 0 ? 0 : min);
  const area = (points) => `${smoothPath(points)} L ${x(points.at(-1).index)} ${baselineY} L ${x(points[0].index)} ${baselineY} Z`;
  const activeIndex = hover?.index;
  const rows = activeIndex === undefined ? [] : usable.map((item) => ({ ...item, point: item.points[activeIndex] })).filter((item) => item.point && hasNumber(item.point.value));
  const points = usable[0]?.points || [];
  const showAxisLabel = (index) => index === 0 || index === points.length - 1 || index % axisStep === 0;
  const setHoverIndex = (index, clientX, clientY, box = svgRef.current?.getBoundingClientRect()) => {
    if (!box) return;
    setHover({ index, markerRx: 5 * 720 / box.width, markerRy: 5 * 260 / box.height, x: Math.min(window.innerWidth - 112, Math.max(112, clientX)), y: clientY });
  };

  const target = portalTarget === undefined ? document.body : portalTarget;
  return <div className={`trend-area-chart chart-wrap-live ${animate ? "home-chart-transition " : ""}${showYAxis ? "has-y-axis " : ""}${className}`.trim()} onMouseLeave={() => setHover(null)}>
    {showYAxis && <div aria-hidden="true" className="trend-area-chart-y chart-y-axis">{axisTicks.map((tick) => <span key={tick}>{axisLabel(tick, valueKind)}</span>)}</div>}
    <svg ref={svgRef} className="trend-area-chart-svg daily-smooth-chart home-trend-chart" preserveAspectRatio="none" viewBox="0 0 720 260" aria-label={`${label}趋势面积图`} role="img" onMouseMove={(event) => {
      const box = event.currentTarget.getBoundingClientRect();
      const index = Math.round(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) * Math.max(0, count - 1));
      setHoverIndex(index, event.clientX, event.clientY, box);
    }}>
      {showYAxis && <defs>{usable.map((item) => <linearGradient id={`${gradientPrefix}-${item.key}`} key={item.key} x1="0" x2="0" y1={plotTop} y2={plotBottom} gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor={item.color} stopOpacity=".16" /><stop offset="100%" stopColor={item.color} stopOpacity="0" /></linearGradient>)}</defs>}
      <g className="grid">{showYAxis ? axisTicks.map((tick) => <line key={tick} x1="8" x2="708" y1={y(tick)} y2={y(tick)} />) : <><line x1="12" x2="708" y1="30" y2="30" /><line x1="12" x2="708" y1="96" y2="96" /><line x1="12" x2="708" y1="162" y2="162" /><line x1="12" x2="708" y1="228" y2="228" /></>}</g>
      {usable.flatMap((item) => segments(item.points).map((segment, segmentIndex) => <g key={`${item.key}-${segmentIndex}`} style={{ "--chart-color": item.color }}>{segment.length > 1 && <path className="area" d={area(segment)} style={showYAxis ? { fill: `url(#${gradientPrefix}-${item.key})`, opacity: 1 } : undefined} />}<path className="line" d={smoothPath(segment)} pathLength="1" /></g>))}
      {activeIndex !== undefined && <line className="hover-guide" x1={x(activeIndex)} x2={x(activeIndex)} y1="30" y2="228" />}
      {activeIndex !== undefined && rows.map((item) => <ellipse className="active-point" cx={x(activeIndex)} cy={y(item.point.value)} key={item.key} rx={hover.markerRx} ry={hover.markerRy} style={{ fill: item.color }} vectorEffect="non-scaling-stroke" />)}
      {points.map((point, index) => <rect className="hover-zone" key={`${point.label}-${index}`} x={Math.max(0, x(index) - 350 / Math.max(1, count - 1))} y={plotTop} width={700 / Math.max(1, count - 1)} height={plotBottom - plotTop} tabIndex="0" aria-label={`${point.tooltipTitle || point.label} ${point.display || pointLabel(point.value)}`} onFocus={(event) => { const box = svgRef.current?.getBoundingClientRect(); if (box) setHoverIndex(index, box.left + box.width * x(index) / 720, box.top + box.height * y(point.value || 0) / 260, box); }} onBlur={() => setHover(null)} />)}
    </svg>
    <div className="trend-area-chart-x chart-x-axis home-chart-x-axis">{points.map((item, index) => <span className={showAxisLabel(index) ? "" : "is-hidden"} key={`${item.label}-${index}`}>{showAxisLabel(index) ? item.label : "·"}</span>)}</div>
    {activeIndex !== undefined && rows.length > 0 && target && createPortal(<Tooltip as="div" className="trend-area-chart-tooltip live-chart-tooltip" style={{ left: hover.x, top: hover.y }}><strong>{rows[0].point.tooltipTitle || rows[0].point.label}</strong>{rows.map((item) => <span key={item.key}><i style={{ background: item.color }} />{item.label}<b>{item.point.display || pointLabel(item.point.value)}</b></span>)}{rows[0].point.note && <small>{rows[0].point.note}</small>}</Tooltip>, target)}
  </div>;
}
