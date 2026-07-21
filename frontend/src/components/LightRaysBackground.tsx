"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useCapability } from "./three/useCapability";
import { useReducedMotion } from "./three/useReducedMotion";
import type { LightRaysProps } from "./three/LightRays";

/** CSS beams — the fallback for reduced-motion, low-power devices and SSR. */
function RaysFallback() {
  return <div aria-hidden className="beam-fallback grain absolute inset-0" />;
}

// Client-only + code-split: Three.js stays out of the first-paint bundle.
const RaysScene = dynamic(() => import("./three/RaysScene"), {
  ssr: false,
  loading: () => <RaysFallback />,
});

/**
 * The light rays behind the hero heading. Decorative → aria-hidden, no pointer
 * events. Pauses its render loop once scrolled past, and fades as the hero
 * leaves so the beams never bleed into the sections below.
 */
export function LightRaysBackground(props: LightRaysProps) {
  const reduced = useReducedMotion();
  const cap = useCapability();
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const showScene = cap === "capable" && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.7)));
        el.style.opacity = String(1 - p);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {showScene ? <RaysScene paused={paused} {...props} /> : <RaysFallback />}
      {/* Grounds the beams so they don't float over the section boundary. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
