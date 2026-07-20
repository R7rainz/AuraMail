"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Volumetric light rays.
 *
 * A fullscreen quad; the shader builds beams from noise sampled in *angular*
 * space around a source above the viewport, so the shafts converge the way real
 * god rays do. The source tracks the pointer with heavy damping — the light
 * feels like it has weight rather than snapping around.
 *
 * Spread is a gaussian, not a smoothstep: the cone has no edge to see, which is
 * what makes the falloff read as light instead of as a masked gradient.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAspect;
  uniform float uIntensity;
  uniform float uSpread;    // gaussian cone width, radians
  uniform float uFalloff;   // distance attenuation
  uniform float uSharp;     // beam contrast
  uniform vec2  uOrigin;    // light source, aspect-corrected space

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Three octaves is enough at this scale and costs a third less than four.
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-corrected so beams keep their angle on any viewport.
    vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y);
    vec2 d = p - uOrigin;

    float dist = length(d);
    float angle = atan(d.x, -d.y);

    // Two angular noise layers drifting at different rates: a few broad shafts
    // with finer structure threaded through them.
    float coarse = fbm(vec2(angle * 6.0, uTime * 0.03));
    float fine = fbm(vec2(angle * 17.0, uTime * 0.052 + 13.0));
    float beams = coarse * 0.64 + fine * 0.36;

    // Real shafts diverge and blur as they travel — lift the floor and flatten
    // contrast with distance so they dissolve instead of ending.
    float soften = smoothstep(0.1, 1.5, dist);
    beams = mix(beams, beams * 0.5 + 0.25, soften);

    // Contrast into distinct shafts.
    beams = smoothstep(0.36 - uSharp * 0.12, 0.94, beams);

    // Gaussian spread: no visible cone edge at any width.
    float cone = exp(-(angle * angle) / (2.0 * uSpread * uSpread));

    // Inverse-square-ish attenuation, with the far tail cut so the beams don't
    // haze the whole section.
    float falloff = 1.0 / (1.0 + dist * dist * uFalloff);
    falloff *= smoothstep(2.1, 0.5, dist);

    // Soft bloom at the source.
    float core = exp(-dist * dist * 3.2) * 0.2;

    float intensity = (beams * cone * falloff + core * cone) * uIntensity;

    // Hard ceiling: this sits behind type and must never fight it.
    intensity = clamp(intensity, 0.0, 0.6);

    gl_FragColor = vec4(vec3(1.0), intensity);
  }
`;

export interface LightRaysProps {
  intensity?: number;
  /** Cone width in radians. Lower is a tighter shaft. */
  spread?: number;
  /** Distance attenuation. Higher fades sooner. */
  falloff?: number;
  /** Beam contrast, 0–1. Higher is more separated shafts. */
  sharpness?: number;
  /** How far the source slides with the pointer, in aspect-corrected units. */
  travel?: number;
  followPointer?: boolean;
}

export function LightRays({
  intensity = 1,
  spread = 0.42,
  falloff = 0.55,
  sharpness = 0.5,
  travel = 0.5,
  followPointer = true,
}: LightRaysProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  // Pointer lives in a ref: tracking must not re-render React each move.
  const target = useRef(0);
  const current = useRef(0);

  useEffect(() => {
    if (!followPointer) {
      target.current = 0;
      return;
    }
    const onMove = (e: PointerEvent) => {
      // -1 (left) → 1 (right), independent of viewport size.
      target.current = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [followPointer]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uIntensity: { value: intensity },
      uSpread: { value: spread },
      uFalloff: { value: falloff },
      uSharp: { value: sharpness },
      uOrigin: { value: new THREE.Vector2(0, 1.26) },
    }),
    [intensity, spread, falloff, sharpness],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const aspect = viewport.width / viewport.height;
    material.uniforms.uTime.value += delta;
    material.uniforms.uAspect.value = aspect;

    // Exponential damping — frame-rate independent, and slow enough that the
    // light lags the cursor instead of tracking it rigidly.
    const k = 1 - Math.exp(-delta * 2.4);
    current.current += (target.current - current.current) * k;

    // Source stays above the fold; only its x slides with the pointer.
    material.uniforms.uOrigin.value.set(current.current * travel * aspect * 0.5, 1.26);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
