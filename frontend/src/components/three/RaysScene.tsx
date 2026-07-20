"use client";

import { Canvas } from "@react-three/fiber";
import { LightRays, type LightRaysProps } from "./LightRays";

/**
 * Canvas for the light rays. Transparent over the black page and DPR-capped at
 * 1.5 — the shader is fill-rate bound, and past 1.5 the extra pixels buy nothing
 * visible on a soft gradient. No post-processing: the shader already produces
 * its own falloff, and Bloom would only wash out the type in front.
 *
 * Default export so next/dynamic can code-split Three.js out of first paint.
 */
export default function RaysScene({
  paused = false,
  ...rays
}: { paused?: boolean } & LightRaysProps) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0, 1], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <LightRays {...rays} />
    </Canvas>
  );
}
