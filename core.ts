// Pure helpers, kept free of the DOM and React so they are easy to test.
import { DEFAULT_SCALE } from "./scale";

// BB sizes text with these theme variables. Scaling them inside the chat
// timeline resizes every message without touching the rest of the app.
const TEXT_VARIABLES = [
  "--text-2xs",
  "--text-xs",
  "--text-sm",
  "--text-base",
  "--text-lg",
  "--text-xl",
  "--text-2xl",
  "--text-3xl",
];

// The chat column is 760px wide; it grows with the text so lines keep about
// the same number of words.
const CHAT_COLUMN = '[data-page-scroll-viewport] [class*="max-w-[760px]"]';
const CHAT_TEXT = "[data-timeline-row-list]";
const COMPOSER_TEXT = "[data-thread-window] .ProseMirror";

/** CSS that scales the chat by `scale`, given the theme's base text sizes. */
export function buildCss(
  scale: number,
  readVariable: (name: string) => string,
): string {
  if (scale === DEFAULT_SCALE) return "";
  const variables = TEXT_VARIABLES.flatMap((name) => {
    const base = readVariable(name).trim();
    return base ? [`  ${name}: calc(${base} * ${scale});`] : [];
  });
  return [
    `${CHAT_TEXT} {`,
    ...variables,
    "}",
    `${COMPOSER_TEXT} { font-size: calc(var(--text-sm, 0.8125rem) * ${scale}); }`,
    `${CHAT_COLUMN} { max-width: ${Math.round(760 * scale)}px; }`,
  ].join("\n");
}

export function isMacPlatform(platform: string): boolean {
  return /Mac|iPhone|iPad/.test(platform);
}

/**
 * Option+Command on a Mac, Ctrl+Alt elsewhere, with the physical keys where a
 * US keyboard has = / - / 0. Physical keys, because Option changes the
 * character a Mac key types.
 */
export function shortcutAction(
  event: Pick<KeyboardEvent, "code" | "metaKey" | "altKey" | "ctrlKey">,
  mac: boolean,
  altGraph = false,
): 1 | -1 | 0 | null {
  // AltGr reports as Ctrl+Alt on some layouts; it types characters, so leave it alone.
  if (altGraph) return null;
  const held = mac
    ? event.metaKey && event.altKey && !event.ctrlKey
    : event.ctrlKey && event.altKey && !event.metaKey;
  if (!held) return null;
  switch (event.code) {
    case "Equal":
    case "NumpadAdd":
      return 1;
    case "Minus":
    case "NumpadSubtract":
      return -1;
    case "Digit0":
    case "Numpad0":
      return 0;
    default:
      return null;
  }
}
