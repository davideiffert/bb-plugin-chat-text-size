// Chat Text Size: makes the chat's text bigger or smaller while the sidebar,
// header, and menus keep their size. A small control in the thread header and
// a keyboard shortcut change it in one step.
import { useEffect, useState } from "react";
import { definePluginApp } from "@get-bb/plugin-sdk/app";
import { Button } from "@/components/ui/button";
import { buildCss, isMacPlatform, shortcutAction } from "./core";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  STEP,
  formatScale,
  onScaleChange,
  readScale,
  resetScale,
  stepScale,
  writeScale,
} from "./scale";

const STYLE_ID = "bb-plugin-chat-text-size";

function applyScale(scale: number) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = buildCss(scale, (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name),
  );
}

function useScale(): number {
  const [scale, setScale] = useState(readScale);
  useEffect(() => onScaleChange(setScale), []);
  return scale;
}

const shortcutHint = isMacPlatform(navigator.platform)
  ? "Option+Command"
  : "Ctrl+Alt";

/** The quiet header control: smaller, current size (click to reset), bigger. */
function HeaderControl({ isCompactViewport }: { isCompactViewport: boolean }) {
  const scale = useScale();
  const changed = scale !== DEFAULT_SCALE;
  const buttonClass =
    "inline-flex h-7 cursor-pointer items-center justify-center rounded-md font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";
  return (
    <div
      className={cn(
        "flex items-center transition-opacity",
        changed ? "opacity-100" : "opacity-60 hover:opacity-100 focus-within:opacity-100",
      )}
    >
      <button
        type="button"
        className={cn(buttonClass, "w-6 text-[11px]")}
        aria-label="Smaller chat text"
        title={`Smaller chat text (${shortcutHint} -)`}
        disabled={scale <= MIN_SCALE}
        onClick={() => stepScale(-1)}
      >
        A
      </button>
      {changed && !isCompactViewport ? (
        <button
          type="button"
          className={cn(buttonClass, "px-1 text-xs tabular-nums")}
          aria-label={`Chat text ${formatScale(scale)}, reset to 100%`}
          title={`Reset to 100% (${shortcutHint} 0)`}
          onClick={() => resetScale()}
        >
          {formatScale(scale)}
        </button>
      ) : null}
      <button
        type="button"
        className={cn(buttonClass, "w-6 text-[15px]")}
        aria-label="Bigger chat text"
        title={`Bigger chat text (${shortcutHint} =)`}
        disabled={scale >= MAX_SCALE}
        onClick={() => stepScale(1)}
      >
        A
      </button>
    </div>
  );
}

function SettingsSection() {
  const scale = useScale();
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={STEP}
          value={scale}
          aria-label="Chat text size"
          className="w-64 accent-primary"
          onChange={(event) => writeScale(Number(event.currentTarget.value))}
        />
        <span className="w-12 tabular-nums">{formatScale(scale)}</span>
        <Button variant="outline" size="sm" onClick={() => resetScale()}>
          Reset
        </Button>
      </div>
      <p className="text-muted-foreground">
        Shortcuts: {shortcutHint} with = for bigger, - for smaller, 0 to reset.
        Each device keeps its own size.
      </p>
    </div>
  );
}

export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "chat-text-size",
    mount({ signal }) {
      applyScale(readScale());
      onScaleChange(applyScale, signal);
      // The theme can change the base sizes; recompute when it does.
      const observer = new MutationObserver(() => applyScale(readScale()));
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme"],
      });
      const onKeyDown = (event: KeyboardEvent) => {
        const action = shortcutAction(
          event,
          isMacPlatform(navigator.platform),
          event.getModifierState?.("AltGraph") ?? false,
        );
        if (action === null) return;
        event.preventDefault();
        if (action === 0) resetScale();
        else stepScale(action);
      };
      document.addEventListener("keydown", onKeyDown, { signal, capture: true });
      return () => {
        observer.disconnect();
        document.getElementById(STYLE_ID)?.remove();
      };
    },
  });

  app.slots.experimental_threadHeaderAction({
    id: "chat-text-size",
    title: "Chat text size",
    component: HeaderControl,
  });

  app.slots.settingsSection({
    id: "chat-text-size",
    title: "Chat text size",
    description: "Make the chat text bigger or smaller without changing the rest of BB.",
    component: SettingsSection,
  });
});
