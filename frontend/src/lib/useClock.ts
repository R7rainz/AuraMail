"use client";

import { useSyncExternalStore } from "react";

/**
 * A ticking clock as an external store.
 *
 * Time is a client-only value: rendering Date.now() during SSR guarantees a
 * hydration mismatch. The server snapshot is null so markup matches, and the
 * real time arrives on the first tick after subscription.
 */
function createClock(intervalMs: number) {
  let snapshot: number | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();

  const tick = () => {
    snapshot = Date.now();
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (timer === undefined) {
        tick();
        timer = setInterval(tick, intervalMs);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => null,
  };
}

const clocks = new Map<number, ReturnType<typeof createClock>>();

/** Returns the current time, or null until the client has mounted. */
export function useClock(intervalMs = 30_000): Date | null {
  let clock = clocks.get(intervalMs);
  if (!clock) {
    clock = createClock(intervalMs);
    clocks.set(intervalMs, clock);
  }

  const ms = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    clock.getServerSnapshot,
  );

  return ms === null ? null : new Date(ms);
}
