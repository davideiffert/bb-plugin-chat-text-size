import { describe, expect, it } from "vitest";
import { buildCss, isMacPlatform, shortcutAction } from "../core";

const theme: Record<string, string> = {
  "--text-xs": ".75rem",
  "--text-sm": ".8125rem",
  "--text-base": ".9375rem",
};
const read = (name: string) => theme[name] ?? "";

describe("buildCss", () => {
  it("adds nothing at 100%", () => {
    expect(buildCss(1, read)).toBe("");
  });

  it("scales each theme text size inside the chat timeline only", () => {
    const css = buildCss(1.3, read);
    expect(css).toContain("[data-timeline-row-list] {");
    expect(css).toContain("--text-sm: calc(.8125rem * 1.3);");
    expect(css).toContain("--text-base: calc(.9375rem * 1.3);");
    expect(css).not.toContain("--text-2xl");
  });

  it("scales the message box text and widens the chat column", () => {
    const css = buildCss(1.5, read);
    expect(css).toContain(".ProseMirror { font-size: calc(var(--text-sm, 0.8125rem) * 1.5); }");
    expect(css).toContain("max-width: 1140px;");
  });
});

describe("shortcutAction", () => {
  const key = (code: string, mods: Partial<KeyboardEvent> = {}) => ({
    code,
    metaKey: false,
    altKey: false,
    ctrlKey: false,
    ...mods,
  });

  it("uses Option+Command on a Mac", () => {
    expect(shortcutAction(key("Equal", { metaKey: true, altKey: true }), true)).toBe(1);
    expect(shortcutAction(key("Minus", { metaKey: true, altKey: true }), true)).toBe(-1);
    expect(shortcutAction(key("Digit0", { metaKey: true, altKey: true }), true)).toBe(0);
  });

  it("uses Ctrl+Alt elsewhere", () => {
    expect(shortcutAction(key("NumpadAdd", { ctrlKey: true, altKey: true }), false)).toBe(1);
    expect(shortcutAction(key("Equal", { metaKey: true, altKey: true }), false)).toBeNull();
  });

  it("leaves the browser's own zoom shortcuts alone", () => {
    expect(shortcutAction(key("Equal", { metaKey: true }), true)).toBeNull();
    expect(shortcutAction(key("Equal", { ctrlKey: true }), false)).toBeNull();
    expect(shortcutAction(key("KeyA", { metaKey: true, altKey: true }), true)).toBeNull();
  });

  it("ignores AltGr, which types characters on some layouts", () => {
    expect(shortcutAction(key("Digit0", { ctrlKey: true, altKey: true }), false, true)).toBeNull();
  });

  it("recognizes Apple platforms", () => {
    expect(isMacPlatform("MacIntel")).toBe(true);
    expect(isMacPlatform("iPhone")).toBe(true);
    expect(isMacPlatform("Linux x86_64")).toBe(false);
  });
});
