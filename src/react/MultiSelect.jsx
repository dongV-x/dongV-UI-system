import React from "react";
import { Button } from "./YoupuUI.jsx";

/**
 * 多选：一次可选多项的统一样式与行为。
 *
 * 为什么是组件而不是各处自己写：下拉选择器只有单值（Select / SingleSelect），
 * 需要「同时勾选几项」的场景只能各自拼 Checkbox + 浮层，选中态、全选/清空、
 * 计数文案和关闭行为每次都不一样。
 *
 * 行为契约：
 * - `dropdown` 走草稿提交：改动只在内部，点确认才回调 onChange，取消/ESC/点外部回滚
 * - `inline` 即时生效：每次勾选立刻回调 onChange
 * - 两种形态都支持全选与清空；计数文案由 formatSelection 决定
 * - dropdown 关闭后焦点归还触发按钮
 * - 选中的选项才着色；未选中保持中性，避免"一片彩色"读不出选了哪些
 */
export function MultiSelect({
  label,
  value = [],
  options = [],
  onChange,
  variant = "dropdown",
  itemVariant = "plain",
  required = false,
  disabled = false,
  placeholder = "请选择",
  formatSelection,
  labels = {},
  className = "",
  id,
}) {
  const { all = "全选", clear = "清空", cancel = "取消", confirm = "确认" } = labels;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const triggerRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const reactId = React.useId();
  const baseId = id || `youpu-multi-${reactId.replace(/:/g, "")}`;
  const listId = `${baseId}-options`;

  const selected = options.filter((item) => value.includes(item.value));
  const countText = formatSelection
    ? formatSelection(selected, options)
    : !selected.length
      ? placeholder
      : selected.length === 1
        ? selected[0].label
        : `已选 ${selected.length} 项`;

  const allValues = options.map((item) => item.value);
  const isAll = (list) => options.length > 0 && list.length === options.length;
  const toggle = (list, key) => (list.includes(key) ? list.filter((item) => item !== key) : [...list, key]);

  const scrollToFirst = () => {
    const panel = panelRef.current;
    if (panel) panel.focus?.();
  };
  const closePanel = (focusBack = true) => {
    setDraft(value);
    setOpen(false);
    if (focusBack) triggerRef.current?.focus?.();
  };
  const commit = () => {
    if (!draft.length) return;
    onChange?.(draft);
    setOpen(false);
    triggerRef.current?.focus?.();
  };
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === "Escape") { event.stopPropagation(); closePanel(); } };
    const onPointer = (event) => { if (!panelRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) closePanel(); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onPointer);
    return () => { document.removeEventListener("keydown", onKey, true); document.removeEventListener("mousedown", onPointer); };
  }, [open, value]);
  React.useEffect(() => { if (open) scrollToFirst(); }, [open]);

  const renderOption = (item) => {
    const list = variant === "dropdown" ? draft : value;
    const checked = list.includes(item.value);
    const classes = ["youpu-multi-option", `is-${itemVariant}`, checked && "is-selected", item.disabled && "is-disabled"].filter(Boolean).join(" ");
    return <label className={classes} key={item.value} style={item.tone ? { "--youpu-multi-tone": item.tone } : undefined}>
      <input
        checked={checked}
        className="youpu-checkbox-control"
        disabled={disabled || item.disabled}
        onChange={() => (variant === "dropdown" ? setDraft((current) => toggle(current, item.value)) : onChange?.(toggle(value, item.value)))}
        type="checkbox"
      />
      {item.leading}
      <span className="youpu-multi-option-label">{item.label}</span>
    </label>;
  };

  const bulk = (list, apply) => options.length > 0 && <span className="youpu-multi-bulk">
    <Button disabled={disabled} onClick={() => apply(isAll(list) ? [] : allValues)} size="small" variant="ghost">{isAll(list) ? clear : all}</Button>
    {!isAll(list) && list.length > 0 && <Button disabled={disabled} onClick={() => apply([])} size="small" variant="ghost">{clear}</Button>}
  </span>;

  if (variant === "inline") {
    return <fieldset className={`youpu-multi is-inline ${className}`.trim()} disabled={disabled}>
      <legend className="youpu-multi-head">
        <span className="youpu-multi-title">{label}{required && <b aria-hidden="true" className="youpu-multi-required">*</b>}</span>
        <span className="youpu-multi-count">{countText}</span>
        {bulk(value, (next) => onChange?.(next))}
      </legend>
      <div className="youpu-multi-options" id={listId}>{options.map(renderOption)}</div>
    </fieldset>;
  }

  return <div className={`youpu-multi is-dropdown ${disabled ? "is-disabled" : ""} ${className}`.trim()}>
    {label && <span className="youpu-multi-title" id={`${baseId}-label`}>{label}{required && <b aria-hidden="true" className="youpu-multi-required">*</b>}</span>}
    <Button
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-labelledby={label ? `${baseId}-label` : undefined}
      disabled={disabled}
      onClick={() => (open ? closePanel() : (setDraft(value), setOpen(true)))}
      ref={triggerRef}
      type="button"
    >
      {selected.length === 1 && selected[0].leading}
      <b className={`youpu-multi-value${selected.length ? "" : " is-placeholder"}`}>{countText}</b>
      <span aria-hidden="true" className="youpu-multi-caret" />
    </Button>
    {open && !disabled && <div
      aria-label={label ? `${label}选项` : "选项"}
      className="youpu-multi-panel"
      ref={panelRef}
      role="dialog"
      tabIndex={-1}
    >
      <label className={`youpu-multi-option is-${itemVariant} is-all`}>
        <input checked={isAll(draft)} className="youpu-checkbox-control" onChange={() => setDraft(isAll(draft) ? [] : allValues)} type="checkbox" />
        <span className="youpu-multi-option-label">{all}</span>
      </label>
      <div className="youpu-multi-options" id={listId}>{options.map(renderOption)}</div>
      <div className="youpu-multi-footer">
        <Button onClick={() => closePanel()} type="button">{cancel}</Button>
        <Button className="primary-button" disabled={!draft.length} onClick={commit} type="button">{confirm}</Button>
      </div>
    </div>}
  </div>;
}

export default MultiSelect;
