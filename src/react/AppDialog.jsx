import React from "react";
import { createPortal } from "react-dom";
import { useOverlayFocus } from "./overlayFocus.js";

const AppDialogContext = React.createContext(null);

export function AppDialogProvider({ children }) {
  const [dialog, setDialog] = React.useState(null);
  const resolverRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const close = React.useCallback((accepted) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    resolve?.(accepted);
  }, []);

  const open = React.useCallback((options) => new Promise((resolve) => {
    resolverRef.current?.(false);
    resolverRef.current = resolve;
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
  useOverlayFocus(Boolean(dialog), dialog?.cancelable ? () => close(false) : undefined, panelRef);

  React.useEffect(() => () => resolverRef.current?.(false), []);

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
              {dialog.cancelable && <button className="youpu-dialog-cancel" type="button" onClick={() => close(false)}>{dialog.cancelLabel}</button>}
              <button className={`youpu-dialog-confirm is-${dialog.tone}`} type="button" onClick={() => close(true)}>{dialog.confirmLabel}</button>
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
