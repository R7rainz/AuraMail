import { describe, expect, it } from "vitest";
import { DEMO_FRAMES, demoFrame, demoMail } from "./demoData";

const hours = (ids: string[]) => ids.map((id) => demoMail[id].hours);
const isSorted = (xs: number[]) => xs.every((x, i) => i === 0 || xs[i - 1] <= x);

describe("demoFrame", () => {
  it("starts sorted and ends with every email sorted", () => {
    expect(isSorted(hours(demoFrame(0).order))).toBe(true);
    const last = demoFrame(DEMO_FRAMES - 1);
    expect(last.order).toHaveLength(6);
    expect(isSorted(hours(last.order))).toBe(true);
  });

  it("puts an arrival on top, then sorts it into place", () => {
    const arrived = demoFrame(1);
    expect(arrived.order[0]).toBe(arrived.active);
    const sorted = demoFrame(2);
    expect(sorted.active).toBe(arrived.active);
    expect(isSorted(hours(sorted.order))).toBe(true);
    expect(sorted.order).toHaveLength(arrived.order.length);
  });
});
