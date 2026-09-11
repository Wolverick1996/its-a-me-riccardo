import { create } from "zustand";
import { apps } from "@/content/apps-registry";

interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowInstance extends Geometry {
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  restoreGeometry: Geometry | null;
}

interface WindowManagerState {
  windows: Record<string, WindowInstance>;
  /** Stable insertion order — drives the taskbar's button order and each new window's cascade offset, independent of focus/z-index changes. */
  openOrder: string[];
  focusedId: string | null;
  nextZIndex: number;

  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  /** Taskbar-button click semantics: focus if unfocused, minimize if already focused, restore-and-focus if minimized — distinct from focusWindow, which a window's own onMouseDown uses and should never minimize anything. */
  selectFromTaskbar: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateGeometry: (id: string, geometry: Partial<Geometry>) => void;
}

// Real px, read once per call from the live --xp-scale custom property — window geometry is plain numbers from here on, not a calc() string, so it has to be converted out of "reference px" up front rather than staying scale-reactive the way pure-CSS chrome does.
export function readScale(): number {
  const shell = document.querySelector(".win-xp-shell");
  if (!shell) return 1;
  const raw = getComputedStyle(shell).getPropertyValue("--xp-scale");
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function taskbarHeightPx(scale: number): number {
  return 30 * scale; // matches .taskbar's own reference height in desktop-shell.css
}

// The rect a maximized window fills — also what Window.tsx animates its maximize wireframe toward, so it has to match toggleMaximize's own math exactly rather than being approximated separately.
export function desktopWorkArea(): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const scale = readScale();
  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight - taskbarHeightPx(scale),
  };
}

function initialGeometry(
  appId: string,
  scale: number,
  cascadeIndex: number,
): Geometry {
  const app = apps.find((a) => a.id === appId);
  const size = app?.defaultWindowSize ?? { width: 640, height: 440 };
  const width = size.width * scale;
  const height = size.height * scale;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight - taskbarHeightPx(scale);
  // Same 24-reference-px-per-window stagger the old CSS-only cascade used, wrapped every 8 windows so a long session doesn't drift new windows off-screen entirely.
  const step = (cascadeIndex % 8) * 24 * scale;
  return {
    x: Math.max(0, (viewportWidth - width) / 2 + step),
    y: Math.max(0, (viewportHeight - height) / 2 + step),
    width,
    height,
  };
}

export const useWindowManagerStore = create<WindowManagerState>((set, get) => ({
  windows: {},
  openOrder: [],
  focusedId: null,
  nextZIndex: 10,

  openWindow: (id) => {
    const { windows, openOrder } = get();
    if (windows[id]) {
      get().focusWindow(id);
      return;
    }
    const scale = readScale();
    const geometry = initialGeometry(id, scale, openOrder.length);
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...geometry,
          zIndex: state.nextZIndex,
          isMinimized: false,
          isMaximized: false,
          restoreGeometry: null,
        },
      },
      openOrder: [...state.openOrder, id],
      focusedId: id,
      nextZIndex: state.nextZIndex + 1,
    }));
  },

  closeWindow: (id) => {
    set((state) => {
      const rest = Object.fromEntries(
        Object.entries(state.windows).filter(([existing]) => existing !== id),
      );
      const openOrder = state.openOrder.filter((existing) => existing !== id);
      const wasFocused = state.focusedId === id;
      // Hand focus to whichever remaining window is on top, rather than leaving nothing focused — closing the front window shouldn't dim every other open one along with it.
      const nextFocusedId = wasFocused
        ? (openOrder
            .filter((existing) => !rest[existing]?.isMinimized)
            .sort(
              (a, b) => (rest[b]?.zIndex ?? 0) - (rest[a]?.zIndex ?? 0),
            )[0] ?? null)
        : state.focusedId;
      return { windows: rest, openOrder, focusedId: nextFocusedId };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, zIndex: state.nextZIndex },
        },
        focusedId: id,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  selectFromTaskbar: (id) => {
    const { windows, focusedId } = get();
    const win = windows[id];
    if (!win) return;
    if (win.isMinimized || focusedId !== id) {
      set((state) => ({
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], isMinimized: false },
        },
      }));
      get().focusWindow(id);
    } else {
      get().minimizeWindow(id);
    }
  },

  minimizeWindow: (id) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [id]: { ...win, isMinimized: true } },
        focusedId: state.focusedId === id ? null : state.focusedId,
      };
    });
  },

  toggleMaximize: (id) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      if (win.isMaximized) {
        const restored = win.restoreGeometry ?? win;
        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              ...restored,
              isMaximized: false,
              restoreGeometry: null,
            },
          },
        };
      }
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            ...desktopWorkArea(),
            isMaximized: true,
            restoreGeometry: {
              x: win.x,
              y: win.y,
              width: win.width,
              height: win.height,
            },
          },
        },
      };
    });
  },

  updateGeometry: (id, geometry) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return { windows: { ...state.windows, [id]: { ...win, ...geometry } } };
    });
  },
}));
