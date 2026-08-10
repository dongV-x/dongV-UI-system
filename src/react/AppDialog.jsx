import React from "react";
import { createPortal } from "react-dom";

const AppDialogContext = React.createContext(null);

export function AppDialogProvider({ children }) {
  const [dialog, setDialog] = React.useState(null);
  const resolverRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const cancelRef = React.useRef(null);
  const confirmRef = React.useRef(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const close = React.useCallback((accepted) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    resolve?.(accepted);
    window.requestAnimationFrame(() => previousFocusRef.current?.focus?.());
  }, []);

  const open = React.useCallback((options) => new Promise((resolve) => {
    resolverRef.current?.(false);
    resolverRef.current = resolve;
    previousFocusRef.current = document.activeElement;
    setDialog({
      title: "请确认",
      description: "",
      note: "",
      cancelLabel: "取消",
      confirmLabel: "确认",
      tone: "primary",
      cancelable: true,
      ...options,
    });
  }), []);

  const confirm = React.useCallback((options) => open(options), [open]);
  const showInfo = React.useCallback((options) => open({ cancelable: false, confirmLabel: "知道了", ...options }), [open]);

  React.useEffect(() => () => resolverRef.current?.(false), []);
  React.useEffect(() => {
    if (!dialog) return undefined;
    const initial = dialog.cancelable ? cancelRef.current : confirmRef.current;
    initial?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && dialog.cancelable) {
        event.preventDefault();
        close(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') || []);
      if (!focusable.length) return;
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, dialog]);

  const value = React.useMemo(() => ({ confirm, showInfo }), [confirm, showInfo]);
  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {dialog && createPortal(
        <div className={`youpu-dialog-backdrop${dialog.portalTarget ? " is-contained" : ""}`}>
          <section
            ref={panelRef}
            className="youpu-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={dialog.description ? descriptionId : undefined}
          >
            <header>
              <h2 id={titleId}>{dialog.title}</h2>
            </header>
            {dialog.description && <p id={descriptionId}>{dialog.description}</p>}
            {dialog.note && <div className="youpu-dialog-note">{dialog.note}</div>}
            <footer>
              {dialog.cancelable && <button ref={cancelRef} className="youpu-dialog-cancel" type="button" onClick={() => close(false)}>{dialog.cancelLabel}</button>}
              <button ref={confirmRef} className={`youpu-dialog-confirm is-${dialog.tone}`} type="button" onClick={() => close(true)}>{dialog.confirmLabel}</button>
            </footer>
          </section>
        </div>,
        dialog.portalTarget || document.body,
      )}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const value = React.useContext(AppDialogContext);
  if (!value) throw new Error("useAppDialog 必须在 AppDialogProvider 内使用");
  return value;
}
