import React from "react";

export const FOCUSABLE_SELECTOR = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/* 下拉面板的定位与层级。

   为什么必须 Portal 到 body：面板原来是控件里的 `position:absolute` 子节点，只要祖先里有一个
   `overflow:hidden/auto/clip`（弹窗正文、滚动容器、带裁切的页面根），面板就会被裁掉或跟着滚动跑。
   2026-09-18 有谱「库存查询」的虚拟仓下拉就是这么回事：15 个仓被裁到只剩一截，底部确认键整个丢失，
   使用者看到的是「选了仓没反应」。

   做法与已上线的 `Select` 一致：面板 Portal 到 body，用触发器的视口坐标做 `position:fixed` 定位，
   空间不够翻到上方，`maxHeight` 按可视空间给，长列表在面板内部滚动。 */
export const FLOATING_PANEL_GAP = 6;
export const FLOATING_PANEL_EDGE = 8;
export const FLOATING_PANEL_MIN_HEIGHT = 120;

export function useFloatingPanel({
  open,
  triggerRef,
  panelRef,
  estimatedHeight,
  minWidth,
  matchTriggerWidth = true,
  gap = FLOATING_PANEL_GAP,
  edge = FLOATING_PANEL_EDGE,
}) {
  const [position, setPosition] = React.useState(null);
  // 同一个几何结果不重复 setState：下面的「挂载后再量一次」会在每次渲染后跑，
  // 没有这道闸就会 setState -> 渲染 -> 再量 死循环。
  const lastKeyRef = React.useRef("");
  const update = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // 首帧只能靠预估：面板渲染出来后按真实尺寸再收一次，内容驱动的宽度也才不会被视口切掉。
    const measured = panelRef?.current?.getBoundingClientRect();
    const height = measured?.height || estimatedHeight;
    const below = window.innerHeight - rect.bottom - gap - edge;
    const above = rect.top - gap - edge;
    // 预估高度放不进下方且上方更宽敞时翻上去，避免面板顶到窗口底部后再也滚不到最后一项。
    const openUp = height > below && above > below;
    const maxHeight = Math.max(FLOATING_PANEL_MIN_HEIGHT, openUp ? above : below);
    const width = Math.max(matchTriggerWidth ? rect.width : measured?.width || 0, Number.parseFloat(minWidth) || 0);
    const left = Math.max(edge, Math.min(rect.left, window.innerWidth - width - edge));
    // 只写真正需要的内联值：多选面板让内容决定宽度（min-width 由 CSS 给），
    // 页面自定义面板宽度（width: max-content 之类）也才不会被内联样式压掉。
    const sizing = {
      ...(matchTriggerWidth ? { width: rect.width } : {}),
      ...(minWidth === undefined || minWidth === null || minWidth === "" ? {} : { minWidth }),
    };
    const next = openUp
      ? { left, ...sizing, maxHeight, bottom: window.innerHeight - rect.top + gap }
      : { left, ...sizing, maxHeight, top: rect.bottom + gap };
    const key = JSON.stringify(next);
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    setPosition(next);
  }, [edge, estimatedHeight, gap, matchTriggerWidth, minWidth, panelRef, triggerRef]);

  React.useEffect(() => {
    if (!open) {
      lastKeyRef.current = "";
      setPosition(null);
      return undefined;
    }
    update();
    const reposition = () => update();
    window.addEventListener("resize", reposition);
    // 捕获阶段监听：祖先滚动容器滚动时也要跟着走，面板才不会跟触发器脱开。
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, update]);

  /* 面板是「position 有值才渲染」，所以第一次定位量不到自己；等它进了 DOM 再量真实尺寸，
     并且盯着后续尺寸变化——页面 CSS 后到会让面板变宽，不重收就会从视口右边溢出去
     （2026-09-18 实测 1440 宽的经营总览店铺多选溢出 37px）。 */
  React.useEffect(() => {
    if (!open) return undefined;
    const node = panelRef?.current;
    if (!node) return undefined;
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => update());
    observer.observe(node);
    return () => observer.disconnect();
  });

  return position;
}

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
