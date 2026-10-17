// The chat text scale, stored per browser so a phone and a laptop each keep
// their own size. Every window listens, so a change shows everywhere at once.

export const MIN_SCALE = 0.7;
export const MAX_SCALE = 2;
export const STEP = 0.1;
export const DEFAULT_SCALE = 1;

const STORAGE_KEY = "bb-plugin-chat-text-size:scale";
const CHANGE_EVENT = "bb-plugin-chat-text-size:change";

export function clampScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SCALE;
  const rounded = Math.round(value * 100) / 100;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, rounded));
}

// Used when the browser refuses storage, so the size still changes until
// the page reloads.
let memoryScale: number | null = null;

export function readScale(): number {
  if (memoryScale !== null) return memoryScale;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? DEFAULT_SCALE : clampScale(Number(raw));
  } catch {
    return DEFAULT_SCALE;
  }
}

export function writeScale(value: number): number {
  const next = clampScale(value);
  try {
    if (next === DEFAULT_SCALE) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, String(next));
    memoryScale = null;
  } catch {
    memoryScale = next;
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  return next;
}

export function stepScale(direction: 1 | -1): number {
  return writeScale(readScale() + direction * STEP);
}

export function resetScale(): number {
  return writeScale(DEFAULT_SCALE);
}

/** Calls `listener` whenever the scale changes in this window or another. */
export function onScaleChange(
  listener: (scale: number) => void,
  signal?: AbortSignal,
): () => void {
  const onLocal = () => listener(readScale());
  const onStorage = (event: StorageEvent) => {
    // A null key means another window cleared all storage.
    if (event.key === STORAGE_KEY || event.key === null) listener(readScale());
  };
  window.addEventListener(CHANGE_EVENT, onLocal, { signal });
  window.addEventListener("storage", onStorage, { signal });
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}

export function formatScale(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}
