import React from "react";

export const FOCUSABLE_SELECTOR = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

const overlayStack = [];

function syncOverlayStack() {
  const activePanel = overlayStack.at(-1);
  overlayStack.forEach((panel) => {
    const active = panel === activePanel;
    panel.setAttribute("aria-modal", String(active));
    panel.inert = !active;
  });
}

export function useOverlayFocus(open, onClose, panelRef) {
  const previousFocusRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return undefined;
    previousFocusRef.current = document.activeElement;
    overlayStack.push(panel);
    syncOverlayStack();
    const focusInitial = window.requestAnimationFrame(() => {
      if (overlayStack.at(-1) !== panel) return;
      const autoFocus = panel.querySelector("[autofocus], [data-autofocus]");
      const first = panel.querySelector(FOCUSABLE_SELECTOR);
      (autoFocus || first || panel)?.focus?.();
    });
    const handleKeyDown = (event) => {
      if (overlayStack.at(-1) !== panel) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
      if (!focusable.length) {
        event.preventDefault();
        panel.focus?.();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      const wasTop = overlayStack.at(-1) === panel;
      window.cancelAnimationFrame(focusInitial);
      window.removeEventListener("keydown", handleKeyDown);
      const stackIndex = overlayStack.lastIndexOf(panel);
      if (stackIndex >= 0) overlayStack.splice(stackIndex, 1);
      panel.inert = false;
      syncOverlayStack();
      if (wasTop) window.requestAnimationFrame(() => {
        const activePanel = overlayStack.at(-1);
        const previous = previousFocusRef.current;
        if (previous?.isConnected && (!activePanel || activePanel.contains(previous))) previous.focus?.();
        else (activePanel?.querySelector(FOCUSABLE_SELECTOR) || activePanel)?.focus?.();
      });
    };
  }, [open, panelRef]);
}
