import React from "react";
import { createPortal } from "react-dom";

function classNames(...names) {
  return names.filter(Boolean).join(" ");
}

const CONTROL_SIZES = new Set(["table", "small", "compact", "medium", "large"]);
const resolveControlSize = (size) => CONTROL_SIZES.has(size) ? size : "medium";

const FOCUSABLE_SELECTOR = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function useOverlayFocus(open, onClose, panelRef) {
  const previousFocusRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const focusInitial = window.requestAnimationFrame(() => {
      const autoFocus = panelRef.current?.querySelector("[autofocus], [data-autofocus]");
      const first = panelRef.current?.querySelector(FOCUSABLE_SELECTOR);
      (autoFocus || first || panelRef.current)?.focus?.();
    });
    const handleKeyDown = (event) => {
      if (!panelRef.current?.contains(document.activeElement)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current?.focus?.();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusInitial);
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => previousFocusRef.current?.focus?.());
    };
  }, [open, panelRef]);
}

function renderOverlay(content, portalTarget) {
  const target = portalTarget === undefined && typeof document !== "undefined" ? document.body : portalTarget;
  return target ? createPortal(content, target) : content;
}

/* Button / Input / Field 三个原子（1.1.0 新增）。
   加入原因：接入方实测有 436 处原生 <button>、67 处 <input> 无组件可用，
   规则再多也无处可落。这三个必须带行为契约，不能只是 className 壳——
   DataTable 那种「三行样式壳」的教训是：每个页面仍要自己重写行为，抽象等于没做。 */

export function Button({
  variant = "secondary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  type = "button",
  onClick,
  className = "",
  children,
  ...props
}) {
  const busyRef = React.useRef(false);
  const isDisabled = disabled || loading;
  const controlSize = resolveControlSize(size);

  // 防重复提交：异步 onClick 未完成前忽略后续点击。
  // 这是接入方 design.md 明文要求、却在 443 处手写按钮里逐个复制的行为。
  const handleClick = React.useCallback(async (event) => {
    if (isDisabled || busyRef.current) {
      event.preventDefault();
      return;
    }
    const result = onClick?.(event);
    if (result && typeof result.then === "function") {
      busyRef.current = true;
      try {
        await result;
      } finally {
        busyRef.current = false;
      }
    }
  }, [isDisabled, onClick]);

  return (
    <button
      type={type}
      className={classNames("youpu-button", `is-${variant}`, `is-${controlSize}`, loading && "is-loading", className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      {loading ? <span className="youpu-button-spinner" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

export function Input({
  invalid = false,
  size = "medium",
  prefix,
  suffix,
  className = "",
  ...props
}) {
  const controlSize = resolveControlSize(size);
  const control = (
    <input
      className={classNames("youpu-input-control", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
  if (!prefix && !suffix) {
    return <span className={classNames("youpu-input", `is-${controlSize}`, invalid && "is-invalid")}>{control}</span>;
  }
  return (
    <span className={classNames("youpu-input", `is-${controlSize}`, invalid && "is-invalid", "has-affix")}>
      {prefix ? <span className="youpu-input-affix">{prefix}</span> : null}
      {control}
      {suffix ? <span className="youpu-input-affix">{suffix}</span> : null}
    </span>
  );
}

const TEXTAREA_RESIZES = new Set(["none", "vertical", "horizontal", "both"]);

export function Textarea({
  invalid = false,
  rows = 3,
  resize = "vertical",
  size = "medium",
  className = "",
  ...props
}) {
  const controlSize = resolveControlSize(size);
  const resizeMode = TEXTAREA_RESIZES.has(resize) ? resize : "vertical";
  return (
    <textarea
      className={classNames("youpu-textarea", `is-${controlSize}`, `is-resize-${resizeMode}`, invalid && "is-invalid", className)}
      aria-invalid={invalid || undefined}
      rows={rows}
      {...props}
    />
  );
}

export function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  id,
  className = "",
  children,
  ...props
}) {
  const generatedId = React.useId().replaceAll(":", "");
  const inputId = id || `youpu-checkbox-${generatedId}`;
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const input = (
    <input
      {...props}
      ref={inputRef}
      className="youpu-checkbox-control"
      checked={checked}
      disabled={disabled}
      id={inputId}
      type="checkbox"
      aria-checked={indeterminate ? "mixed" : undefined}
    />
  );
  return children ? (
    <label className={classNames("youpu-checkbox", disabled && "is-disabled", indeterminate && "is-mixed", className)} htmlFor={inputId}>
      {input}
      <span className="youpu-checkbox-label">{children}</span>
    </label>
  ) : (
    <span className={classNames("youpu-checkbox", disabled && "is-disabled", indeterminate && "is-mixed", className)}>{input}</span>
  );
}

export function Field({ label, required = false, error, hint, htmlFor, className = "", children }) {
  const reactId = React.useId();
  const controlId = htmlFor || `youpu-field-${reactId}`;
  const errorId = error ? `${controlId}-error` : undefined;
  return (
    <div className={classNames("youpu-field", error && "is-invalid", className)}>
      {label ? (
        <label className="youpu-field-label" htmlFor={controlId}>
          {label}
          {required ? <b className="youpu-field-required" aria-label="必填">*</b> : null}
        </label>
      ) : null}
      {typeof children === "function" ? children({ id: controlId, "aria-describedby": errorId, "aria-invalid": Boolean(error) || undefined }) : children}
      {error ? <p className="youpu-field-error" id={errorId} role="alert">{error}</p> : null}
      {!error && hint ? <p className="youpu-field-hint">{hint}</p> : null}
    </div>
  );
}

export function PageHeader({ as: Element = "header", className = "", ...props }) {
  return <Element className={classNames("youpu-page-header", className)} {...props} />;
}

export function PageTabs({ className = "", ...props }) {
  return <nav className={classNames("youpu-page-tabs", className)} {...props} />;
}

export function Select({ ariaLabel, className = "", compactTable = false, contentWidth = false, disabled = false, menuMinWidth, onChange, options = [], placeholder = "请选择", size = "medium", value = "" }) {
  const id = React.useId().replaceAll(":", "");
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const optionRefs = React.useRef([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [position, setPosition] = React.useState(null);
  const selectedIndex = options.findIndex((option) => String(option.value) === String(value));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const updatePosition = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedHeight = Math.min(280, options.length * 34 + 8);
    const openUp = window.innerHeight - rect.bottom < estimatedHeight && rect.top > window.innerHeight - rect.bottom;
    const requestedMenuWidth = Number.parseFloat(menuMinWidth) || rect.width;
    const menuWidth = Math.max(rect.width, requestedMenuWidth);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
    setPosition({ left, width: rect.width, minWidth: menuMinWidth, ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }) });
  }, [menuMinWidth, options.length]);

  React.useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const closeOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open, updatePosition]);

  const enabledIndex = (start, direction) => {
    for (let index = start; index >= 0 && index < options.length; index += direction) {
      if (!options[index]?.disabled) return index;
    }
    return -1;
  };
  React.useEffect(() => {
    if (open && activeIndex >= 0) optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 && !options[selectedIndex]?.disabled ? selectedIndex : enabledIndex(0, 1));
    setOpen(true);
  };
  const choose = (index) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      if (open) event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      if (open && activeIndex >= 0) choose(activeIndex); else setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && activeIndex >= 0) choose(activeIndex); else openMenu();
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!open) openMenu();
      setActiveIndex(enabledIndex(event.key === "Home" ? 0 : options.length - 1, event.key === "Home" ? 1 : -1));
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = enabledIndex(activeIndex + direction, direction);
      if (next >= 0) setActiveIndex(next);
    }
  };

  const menu = open && position ? renderOverlay(
    <div ref={menuRef} className="youpu-select-menu" id={`${id}-listbox`} role="listbox" aria-label={ariaLabel} style={position}>
      {options.map((option, index) => <button
        aria-selected={open ? index === activeIndex : index === selectedIndex}
        className={classNames("youpu-select-option", index === activeIndex && "is-active", index === selectedIndex && "is-selected")}
        disabled={option.disabled}
        id={`${id}-option-${index}`}
        key={String(option.value)}
        onClick={() => choose(index)}
        onMouseEnter={() => !option.disabled && setActiveIndex(index)}
        ref={(element) => { optionRefs.current[index] = element; }}
        role="option"
        tabIndex={-1}
        type="button"
      >{option.label}</button>)}
    </div>,
  ) : null;

  const sizeClass = compactTable ? "" : `is-${resolveControlSize(size)}`;
  return <div className={classNames("youpu-select", sizeClass, contentWidth && "is-content-width", compactTable && "is-table-compact", open && "is-open", disabled && "is-disabled", className)}>
    <button
      aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
      aria-autocomplete="none"
      aria-controls={`${id}-listbox`}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
      className="youpu-select-trigger"
      disabled={disabled}
      onClick={() => open ? setOpen(false) : openMenu()}
      onKeyDown={handleKeyDown}
      ref={triggerRef}
      role="combobox"
      type="button"
    ><span className={selected ? "" : "is-placeholder"}>{selected?.label || placeholder}</span><span aria-hidden="true" className="youpu-select-chevron" /></button>
    {menu}
  </div>;
}

export function TableToolbar({ as: Element = "div", className = "", ...props }) {
  return <Element className={classNames("youpu-table-toolbar", className)} {...props} />;
}

export function DataTable({ density = "standard", className = "", ...props }) {
  return <table className={classNames("youpu-data-table", `is-${density}`, className)} {...props} />;
}

export function StatusBadge({ tone = "neutral", className = "", ...props }) {
  return <span className={classNames("youpu-status-badge", `is-${tone}`, className)} {...props} />;
}

export function ClassificationTag({ as: Element = "span", tone = "normal", icon, className = "", children, ...props }) {
  return <Element className={classNames("youpu-classification-tag", `is-${tone}`, className)} {...props}>{icon}{children}</Element>;
}

export function MetaTag({ tone = "neutral", className = "", ...props }) {
  return <span className={classNames("youpu-meta-tag", `is-${tone}`, className)} {...props} />;
}

export function SingleSelect({ ariaLabel, className = "", disabled = false, id, onChange, options, value }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const optionRefs = React.useRef([]);
  const listboxId = React.useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selected = options[selectedIndex];

  React.useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
    const closeOutside = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", closeOutside);
    return () => { window.cancelAnimationFrame(frame); document.removeEventListener("mousedown", closeOutside); };
  }, [open, selectedIndex]);

  const close = () => { setOpen(false); window.requestAnimationFrame(() => triggerRef.current?.focus()); };
  const choose = async (option) => { if (option.disabled) return; await onChange(option.value); close(); };
  const handleKeyDown = (event) => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !options.length) return;
    event.preventDefault();
    if (!open) { setOpen(true); return; }
    const current = optionRefs.current.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? (current + 1) % options.length : (current - 1 + options.length) % options.length;
    optionRefs.current[next]?.focus();
  };

  return <div className={classNames("youpu-single-select", className)} onKeyDown={handleKeyDown} ref={rootRef}>
    <button aria-controls={listboxId} aria-expanded={open} aria-haspopup="listbox" aria-label={ariaLabel} className="youpu-single-select-trigger" disabled={disabled} id={id} onClick={() => setOpen((current) => !current)} ref={triggerRef} type="button"><span>{selected?.label || "请选择"}</span><i aria-hidden="true" /></button>
    {open && <div aria-label={ariaLabel} className="youpu-single-select-menu" id={listboxId} role="listbox">{options.map((option, index) => <button aria-selected={option.value === value} className={option.value === value ? "is-selected" : ""} disabled={option.disabled} key={option.value} onClick={() => choose(option)} ref={(element) => { optionRefs.current[index] = element; }} role="option" type="button">{option.label}</button>)}</div>}
  </div>;
}

export function Modal({ open = true, onClose, title, ariaLabel, overlayClassName = "", className = "", width, closeLabel = "关闭", closeIcon = "×", portalTarget, children }) {
  const panelRef = React.useRef(null);
  useOverlayFocus(open, onClose, panelRef);
  if (!open) return null;
  return renderOverlay(
    <div className={classNames("youpu-modal-overlay", overlayClassName)} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section ref={panelRef} className={classNames("youpu-modal", className)} role="dialog" aria-modal="true" aria-label={ariaLabel || title} style={width ? { width, maxWidth: "calc(100vw - 32px)" } : undefined} tabIndex={-1}>
        {title && <header><h2>{title}</h2><button aria-label={closeLabel} type="button" onClick={onClose}>{closeIcon}</button></header>}
        {children}
      </section>
    </div>,
    portalTarget,
  );
}

export function Drawer({ open = true, onClose, ariaLabel, ariaLabelledby, overlayClassName = "", className = "", portalTarget, children }) {
  const panelRef = React.useRef(null);
  useOverlayFocus(open, onClose, panelRef);
  if (!open) return null;
  return renderOverlay(
    <div className={classNames("youpu-drawer-overlay", overlayClassName)} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <aside ref={panelRef} className={classNames("youpu-drawer", className)} role="dialog" aria-modal="true" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} tabIndex={-1}>{children}</aside>
    </div>,
    portalTarget,
  );
}

export function Tooltip({ as: Element = "span", className = "", ...props }) {
  return <Element className={classNames("youpu-tooltip", className)} role="tooltip" {...props} />;
}

export function HelpPopover({ as: Element = "aside", className = "", ...props }) {
  return <Element className={classNames("youpu-help-popover", className)} {...props} />;
}

function PageState({ as: Element = "div", className = "", scope = "section", ...props }) {
  return <Element {...props} className={className} data-scope={scope} />;
}

const LOADING_DENSITIES = new Set(["compact", "standard", "product"]);
const normalizeCount = (value, fallback) => {
  if (value === null || value === "" || typeof value === "boolean") return fallback;
  const count = Number(value);
  return Number.isInteger(count) ? Math.max(1, Math.min(20, count)) : fallback;
};

export function LoadingState({ as: Element = "div", ariaLabel = "正在加载", className = "", columns, density = "standard", rows, scope = "section", children, ...props }) {
  const resolvedDensity = LOADING_DENSITIES.has(density) ? density : "standard";
  const resolvedRows = normalizeCount(rows, 4);
  const resolvedColumns = normalizeCount(columns, 6);
  const showTableSkeleton = scope === "table" && (rows !== undefined || columns !== undefined || children == null);
  return (
    <PageState as={Element} {...props} className={classNames("youpu-loading-state", className)} scope={scope} role="status" aria-live="polite" aria-busy="true" aria-label={showTableSkeleton ? (props["aria-label"] || ariaLabel) : props["aria-label"]}>
      {showTableSkeleton ? (
        <div className={classNames("youpu-loading-skeleton", `is-${resolvedDensity}`)} style={{ "--youpu-loading-columns": resolvedColumns }} aria-hidden="true">
          {Array.from({ length: resolvedRows }, (_, rowIndex) => (
            <div className="youpu-loading-row" key={rowIndex}>
              {Array.from({ length: resolvedColumns }, (_, columnIndex) => <i className="youpu-loading-cell" key={columnIndex} />)}
            </div>
          ))}
        </div>
      ) : children}
    </PageState>
  );
}

export function EmptyState({ className = "", ...props }) {
  return <PageState {...props} className={classNames("youpu-empty-state", className)} role="status" />;
}

export function ErrorState({ className = "", ...props }) {
  return <PageState {...props} className={classNames("youpu-error-state", className)} role="alert" />;
}

export function Toast({ tone = "success", className = "", ...props }) {
  return <div className={classNames("youpu-toast", `is-${tone}`, className)} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} {...props} />;
}
