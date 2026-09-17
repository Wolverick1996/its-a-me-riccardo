"use client";

import { useEffect, useRef, useState } from "react";
import { getEnabledApps } from "@/content/apps-registry";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import { useWindowManagerStore } from "@/store/useWindowManagerStore";

const apps = getEnabledApps();

// Below any real click/drag movement — distinguishes "clicked without moving" (should still clear selection on mouseup/click) from an actual rubber-band drag.
const DRAG_THRESHOLD_PX = 4;

// Must match .desktop-icons' own `grid-template-rows: repeat(9, ...)` in desktop-shell.css — that's what actually renders the 9 rows.
const GRID_ROWS = 9;

interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IconPosition {
  col: number;
  row: number;
}

interface IconDragState {
  // The icon actually grabbed (its own original rect anchors the pointer math below) and, alongside it, every icon that moves with it — just itself, unless it was already part of a multi-selection when the drag started, in which case the whole selection drags as one group.
  anchorAppId: string;
  groupIds: string[];
  startX: number;
  startY: number;
  originLeft: number;
  originTop: number;
  width: number;
  height: number;
  dragging: boolean;
}

// The column-major fill `grid-auto-flow: column` used to produce on its own, back when placement came from DOM order alone — reproduced here so switching to explicit per-icon placement (needed for dragging) doesn't shuffle anything on first render.
function initialIconPositions(): Record<string, IconPosition> {
  const positions: Record<string, IconPosition> = {};
  apps.forEach((app, index) => {
    positions[app.id] = {
      col: Math.floor(index / GRID_ROWS),
      row: index % GRID_ROWS,
    };
  });
  return positions;
}

export default function Desktop() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(
    new Set(),
  );
  const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null);
  const [iconPositions, setIconPositions] =
    useState<Record<string, IconPosition>>(initialIconPositions);
  // The live offset of whichever icon(s) are mid-drag, for visual feedback only — real positions (iconPositions above) only update once, on drop. Every dragged icon shares the same dx/dy, moving as one rigid group.
  const [draggingIcon, setDraggingIcon] = useState<{
    ids: string[];
    dx: number;
    dy: number;
  } | null>(null);
  // Where a marquee drag started (client coordinates at mousedown) — null whenever no marquee drag is in progress. A ref, not state, since nothing needs to re-render off this value alone; only the derived marqueeRect/selection below do.
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  // Whether the in-progress marquee drag has moved past DRAG_THRESHOLD_PX yet — distinguishes a real rubber-band drag from a plain click that never moved, which should still just clear the selection.
  const didDragRef = useRef(false);
  // The full state of an in-progress icon (or multi-icon group) drag — null whenever no icon is being dragged.
  const iconDragRef = useRef<IconDragState | null>(null);
  // Whether the in-progress icon drag has moved past DRAG_THRESHOLD_PX yet — checked (then cleared) by the onSelect passed to DesktopIcon below, so the click a completed drag still fires afterward doesn't collapse a just-dragged multi-selection down to the single icon that was grabbed.
  const didDragIconRef = useRef(false);

  const openOrder = useWindowManagerStore((state) => state.openOrder);
  const focusedId = useWindowManagerStore((state) => state.focusedId);
  const openWindow = useWindowManagerStore((state) => state.openWindow);
  const closeWindow = useWindowManagerStore((state) => state.closeWindow);
  const selectFromTaskbar = useWindowManagerStore(
    (state) => state.selectFromTaskbar,
  );

  function openApp(id: string) {
    openWindow(id);
    setStartMenuOpen(false);
  }

  // Listens on `window`, not just this component's own div, so a fast drag that momentarily leaves the browser viewport (or passes over a window/the taskbar, which would otherwise swallow the bubbling mousemove) still updates the rectangle and still ends cleanly on mouseup. Icon dragging and the marquee are mutually exclusive — only one of iconDragRef/dragStartRef is ever set at a time, so each mousemove only ever does one of the two.
  useEffect(() => {
    // Reads the grid's real geometry at drop time (rather than trying to keep a live copy of it in state) to turn wherever the icon was let go of into a (col, row) cell for the anchor — the same approach Window.tsx's own wireframe drop takes for turning a pointer position into real layout, just against a grid instead of free pixels. Every other icon in the group moves by that same (col, row) delta, so the group keeps its shape rather than each member re-snapping to its own nearest cell independently.
    function dropIconGroupAt(
      drag: IconDragState,
      clientX: number,
      clientY: number,
    ) {
      const gridEl = document.querySelector<HTMLElement>(".desktop-icons");
      // `--icon-cell` isn't usable here: getComputedStyle only resolves *standard* properties (padding below included) to real px — reading a *custom* property back out returns its literal `calc(75 * var(--xp-scale))` text, not a number. A real rendered icon's own box is the resolved cell size instead.
      const sampleIcon = gridEl?.querySelector<HTMLElement>(".desktop-icon");
      if (!gridEl || !sampleIcon) return;
      const gridRect = gridEl.getBoundingClientRect();
      const cellRect = sampleIcon.getBoundingClientRect();
      const gridStyle = getComputedStyle(gridEl);
      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const centerX = drag.originLeft + drag.width / 2 + dx;
      const centerY = drag.originTop + drag.height / 2 + dy;
      const anchorCol = Math.max(
        0,
        Math.round(
          (centerX -
            gridRect.left -
            parseFloat(gridStyle.paddingLeft) -
            cellRect.width / 2) /
            cellRect.width,
        ),
      );
      const anchorRow = Math.min(
        GRID_ROWS - 1,
        Math.max(
          0,
          Math.round(
            (centerY -
              gridRect.top -
              parseFloat(gridStyle.paddingTop) -
              cellRect.height / 2) /
              cellRect.height,
          ),
        ),
      );

      setIconPositions((prev) => {
        const anchorOrigin = prev[drag.anchorAppId];
        if (!anchorOrigin) return prev;

        // Clamped once for the whole group (using every member's own bounds), not per icon — clamping each icon separately would let the group compress against an edge instead of just stopping.
        let minRowDelta = -Infinity;
        let maxRowDelta = Infinity;
        let minColDelta = -Infinity;
        for (const id of drag.groupIds) {
          const pos = prev[id];
          if (!pos) continue;
          minRowDelta = Math.max(minRowDelta, -pos.row);
          maxRowDelta = Math.min(maxRowDelta, GRID_ROWS - 1 - pos.row);
          minColDelta = Math.max(minColDelta, -pos.col);
        }
        const deltaRow = Math.min(
          maxRowDelta,
          Math.max(minRowDelta, anchorRow - anchorOrigin.row),
        );
        const deltaCol = Math.max(minColDelta, anchorCol - anchorOrigin.col);
        if (deltaCol === 0 && deltaRow === 0) return prev;

        const groupSet = new Set(drag.groupIds);
        const newPositions = new Map<string, IconPosition>();
        for (const id of drag.groupIds) {
          const pos = prev[id];
          if (!pos) continue;
          newPositions.set(id, {
            col: pos.col + deltaCol,
            row: pos.row + deltaRow,
          });
        }

        // If any target cell is already held by an icon outside the group, the whole group stays put — no swapping, no displacing whatever was already there. A cell a group member is itself vacating doesn't count as "occupied", so the group can still shift along a row/column it already fills.
        const newPositionList = Array.from(newPositions.values());
        const blocked = Object.entries(prev).some(
          ([id, pos]) =>
            !groupSet.has(id) &&
            newPositionList.some((n) => n.col === pos.col && n.row === pos.row),
        );
        if (blocked) return prev;

        const next = { ...prev };
        for (const [id, pos] of newPositions) next[id] = pos;
        return next;
      });
    }
    function handleMove(event: MouseEvent) {
      const iconDrag = iconDragRef.current;
      if (iconDrag) {
        // `event.buttons` (a live bitmask), not the mouseup event we're also listening for below — the button can be released outside the browser viewport entirely (over another app, or off-screen), where no mouseup ever reaches this page at all. Without this check that leaves iconDragRef permanently set, and every subsequent mousemove (button no longer held or not) keeps updating the icon's position to follow the cursor regardless.
        if ((event.buttons & 1) === 0) {
          iconDragRef.current = null;
          setDraggingIcon(null);
          return;
        }
        const dx = event.clientX - iconDrag.startX;
        const dy = event.clientY - iconDrag.startY;
        if (!iconDrag.dragging) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
          iconDrag.dragging = true;
          didDragIconRef.current = true;
        }
        setDraggingIcon({ ids: iconDrag.groupIds, dx, dy });
        return;
      }

      const start = dragStartRef.current;
      if (!start) return;
      if ((event.buttons & 1) === 0) {
        // Same self-healing reasoning as the icon-drag branch above.
        dragStartRef.current = null;
        setMarqueeRect(null);
        return;
      }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!didDragRef.current) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        didDragRef.current = true;
      }
      const rect: MarqueeRect = {
        x: Math.min(start.x, event.clientX),
        y: Math.min(start.y, event.clientY),
        width: Math.abs(dx),
        height: Math.abs(dy),
      };
      setMarqueeRect(rect);
      const next = new Set<string>();
      document.querySelectorAll("[data-app-id]").forEach((el) => {
        const iconRect = el.getBoundingClientRect();
        const intersects =
          iconRect.left < rect.x + rect.width &&
          iconRect.right > rect.x &&
          iconRect.top < rect.y + rect.height &&
          iconRect.bottom > rect.y;
        if (intersects) next.add(el.getAttribute("data-app-id")!);
      });
      setSelectedIconIds(next);
    }
    function handleUp(event: MouseEvent) {
      const iconDrag = iconDragRef.current;
      if (iconDrag) {
        iconDragRef.current = null;
        if (iconDrag.dragging) {
          dropIconGroupAt(iconDrag, event.clientX, event.clientY);
        }
        setDraggingIcon(null);
        return;
      }
      dragStartRef.current = null;
      setMarqueeRect(null);
    }
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  const openApps = openOrder
    .map((id) => apps.find((app) => app.id === id))
    .filter((app) => app !== undefined);

  return (
    <div
      className="win-xp-shell desktop-surface relative h-screen w-screen overflow-hidden"
      style={{ backgroundImage: "url(/wallpaper/Bliss.jpg)" }}
      onMouseDown={(event) => {
        if (event.button !== 0) return;
        const target = event.target as HTMLElement;
        const iconEl = target.closest<HTMLElement>(".desktop-icon");
        if (iconEl) {
          // Picking up an icon and drawing a marquee are mutually exclusive — this only ever arms a potential icon-drag (confirmed as one, past DRAG_THRESHOLD_PX, in the mousemove handler below); a plain click still reaches DesktopIcon's own onClick exactly as before.
          const appId = iconEl.getAttribute("data-app-id");
          if (appId) {
            // Dragging any icon that's already part of a multi-selection moves the whole selection together; grabbing an unselected icon drags just that one.
            const wasSelected = selectedIconIds.has(appId);
            const groupIds =
              wasSelected && selectedIconIds.size > 1
                ? Array.from(selectedIconIds)
                : [appId];
            // Real XP selects an icon the instant it's picked up, not only once the drag (or a plain click) finishes — grabbing an unselected icon and dragging it away used to leave it and its label looking completely untouched for the whole drag, only turning selected on drop when the trailing click fired.
            if (!wasSelected) {
              setSelectedIconIds(new Set([appId]));
            }
            const rect = iconEl.getBoundingClientRect();
            iconDragRef.current = {
              anchorAppId: appId,
              groupIds,
              startX: event.clientX,
              startY: event.clientY,
              originLeft: rect.left,
              originTop: rect.top,
              width: rect.width,
              height: rect.height,
              dragging: false,
            };
          }
          // Same reasoning as the marquee's own preventDefault below — stops the browser's native text-selection/image-drag gesture from starting alongside this one.
          event.preventDefault();
          return;
        }
        // Only empty desktop space starts a marquee — windows, the taskbar, and the start menu all handle their own mousedown.
        if (target.closest(".window-anim, .taskbar, .start-menu")) return;
        // Left unprevented, a mousedown-and-drag is the browser's own text selection gesture — it would run alongside the marquee rather than instead of it, highlighting icon labels with the browser's native selection color (not our own `.selected` styling) and, unlike the marquee's own selection, never clearing itself back out again as the rectangle moves past an icon.
        event.preventDefault();
        dragStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onClick={() => {
        setStartMenuOpen(false);
        if (didDragRef.current) {
          // A rubber-band drag just ended on this same element, which also fires a click — consume it once rather than let it immediately clear the selection the drag just made.
          didDragRef.current = false;
          return;
        }
        setSelectedIconIds(new Set());
      }}
    >
      <div className="desktop-icons">
        {apps.map((app) => {
          const position = iconPositions[app.id];
          const isDragging =
            draggingIcon !== null && draggingIcon.ids.includes(app.id);
          return (
            <DesktopIcon
              key={app.id}
              app={app}
              selected={selectedIconIds.has(app.id)}
              onSelect={(id) => {
                // A completed drag still fires a click on its target afterward — consumed here once so it doesn't collapse a multi-selection down to just the icon that was grabbed (same pattern as the marquee's own didDragRef, just scoped to icons instead of the desktop background).
                if (didDragIconRef.current) {
                  didDragIconRef.current = false;
                  return;
                }
                setSelectedIconIds(new Set([id]));
              }}
              onOpen={openApp}
              style={{
                gridColumn: position.col + 1,
                gridRow: position.row + 1,
                // A live-follows-the-cursor transform while dragging, on top of the (unchanged, until drop) grid placement above — the same "visual position vs. committed state" split Window.tsx's own drag uses, just via a plain CSS transform here instead of a wireframe standing in. Every dragged icon (the whole group, not just the one grabbed) shares the identical offset, so they visibly move together as one unit.
                transform: isDragging
                  ? `translate(${draggingIcon.dx}px, ${draggingIcon.dy}px)`
                  : undefined,
                zIndex: isDragging ? 1 : undefined,
              }}
            />
          );
        })}
      </div>
      {/* Real XP draws the rubber-band rectangle as part of the desktop itself, underneath any open window it's dragged across — a low, fixed z-index keeps it below every window's own (much higher) z-index from the store, rather than drawing over them. */}
      {marqueeRect && (
        <div
          className="xp-marquee"
          style={{
            left: marqueeRect.x,
            top: marqueeRect.y,
            width: marqueeRect.width,
            height: marqueeRect.height,
          }}
        />
      )}
      {/* Every open window stays mounted here regardless of isMinimized — Window itself animates and hides its own visual state when minimized (opacity, pointer-events, a transform parking it over its taskbar button) rather than unmounting, so restoring it later can animate back in instead of just reappearing instantly. Paint order doesn't depend on DOM order either way — each Window carries its own real z-index from the store. */}
      {openApps.map((app) => (
        <Window
          key={app.id}
          app={app}
          isFocused={app.id === focusedId}
          onClose={closeWindow}
        />
      ))}
      <Taskbar
        openApps={openApps}
        focusedId={focusedId}
        startMenuOpen={startMenuOpen}
        onToggleStart={() => setStartMenuOpen((open) => !open)}
        onSelectWindow={selectFromTaskbar}
      />
      {startMenuOpen && <StartMenu apps={apps} onSelect={openApp} />}
    </div>
  );
}
