"use client";

import { useSyncExternalStore } from "react";

export type Capability = "unknown" | "capable" | "fallback";

let cached: Capability | null = null;

/** Probes once per page load; the result can't change without a reload. */
function probe(): Capability {
  if (cached) return cached;

  let gl: WebGLRenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    gl =
      (canvas.getContext("webgl2") as WebGLRenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
  } catch {
    gl = null;
  }
  if (!gl) {
    cached = "fallback";
    return cached;
  }

  // Screen out low-power devices — they get the cheap CSS field instead.
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 640;
  const lowPower = cores <= 3 || memory <= 3 || (coarse && smallScreen);

  cached = lowPower ? "fallback" : "capable";
  return cached;
}

// The probe result is immutable, so there is nothing to subscribe to.
const noopSubscribe = () => () => {};

/**
 * GPU/device gate for the WebGL signature. SSR-safe: returns "unknown" until
 * mounted, so the fallback renders first and Three.js stays out of first paint.
 */
export function useCapability(): Capability {
  return useSyncExternalStore(noopSubscribe, probe, () => "unknown" as const);
}
