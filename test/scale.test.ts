// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_SCALE,
  MIN_SCALE,
  clampScale,
  formatScale,
  onScaleChange,
  readScale,
  resetScale,
  stepScale,
  writeScale,
} from "../scale";

beforeEach(() => window.localStorage.clear());

describe("scale", () => {
  it("starts at 100%", () => {
    expect(readScale()).toBe(1);
  });

  it("steps by 10% and remembers the size", () => {
    stepScale(1);
    stepScale(1);
    expect(readScale()).toBe(1.2);
    stepScale(-1);
    expect(readScale()).toBe(1.1);
  });

  it("stays between 70% and 200%", () => {
    writeScale(5);
    expect(readScale()).toBe(MAX_SCALE);
    writeScale(0.1);
    expect(readScale()).toBe(MIN_SCALE);
    expect(clampScale(Number("not a number"))).toBe(1);
  });

  it("ignores a damaged stored value", () => {
    window.localStorage.setItem("bb-plugin-chat-text-size:scale", "huge");
    expect(readScale()).toBe(1);
  });

  it("removes the stored value on reset", () => {
    writeScale(1.4);
    resetScale();
    expect(window.localStorage.length).toBe(0);
    expect(readScale()).toBe(1);
  });

  it("tells listeners about every change until stopped", () => {
    const listener = vi.fn();
    const stop = onScaleChange(listener);
    writeScale(1.3);
    expect(listener).toHaveBeenLastCalledWith(1.3);
    stop();
    writeScale(1.5);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("still changes size when the browser refuses storage", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const listener = vi.fn();
    const stop = onScaleChange(listener);
    expect(stepScale(1)).toBe(1.1);
    expect(listener).toHaveBeenLastCalledWith(1.1);
    expect(stepScale(1)).toBe(1.2);
    stop();
    setItem.mockRestore();
    resetScale();
  });

  it("follows another window clearing storage", () => {
    writeScale(1.4);
    const listener = vi.fn();
    const stop = onScaleChange(listener);
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(listener).toHaveBeenLastCalledWith(1);
    stop();
  });

  it("formats as a percentage", () => {
    expect(formatScale(1.3)).toBe("130%");
  });
});
