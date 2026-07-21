"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Volumetric light rays.
 *
 * A fullscreen quad; the shader builds beams from noise sampled in *angular*
 * space around a source above the viewport, so the shafts converge the way real
 * god rays do.
 *
 * The light is ambient and self-contained: it drifts on its own slow cycle and
 * ignores the pointer. Sunlight through a window does not follow the cursor,
 * and in a workspace app that kind of tracking reads as a toy.
 *
 * Tuned to be noticed only if looked for: motion slow enough to read as light
 * rather than animation, a gaussian cone with no visible edge, and a dithered
 * output because near-black gradients band badly on 8-bit displays.
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
  uniform float uSharp;     // beam contrast, 0-1
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

  // Three octaves is plenty at this scale and a third cheaper than four.
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

    // Two angular layers: a few broad shafts with finer structure threaded
    // through. The second axis drifts slowly along the beam as well as across
    // it, so the light breathes down its length instead of only sliding.
    float coarse = fbm(vec2(angle * 5.2, uTime * 0.016 - dist * 0.22));
    float fine = fbm(vec2(angle * 14.0, uTime * 0.027 + 13.0));
    float beams = coarse * 0.68 + fine * 0.32;

    // Real shafts diverge and blur as they travel: lift the floor and flatten
    // contrast with distance so they dissolve rather than stop.
    float soften = smoothstep(0.05, 1.35, dist);
    beams = mix(beams, beams * 0.42 + 0.3, soften);

    // Gentle contrast. A wide smoothstep keeps the shafts soft-edged — hard
    // separation is what makes this kind of effect look cheap.
    beams = smoothstep(0.34 - uSharp * 0.1, 1.0, beams);

    // Gaussian spread: no visible cone edge at any width.
    float cone = exp(-(angle * angle) / (2.0 * uSpread * uSpread));

    // Inverse-square-ish attenuation with the far tail cut, so the beams never
    // haze the section below.
    float falloff = 1.0 / (1.0 + dist * dist * uFalloff);
    falloff *= smoothstep(2.1, 0.45, dist);

    // Soft bloom where the shafts originate.
    float core = exp(-dist * dist * 2.6) * 0.22;

    // Very slow global breath, shallow enough to feel like light rather than a
    // pulsing element.
    float breath = 0.92 + 0.08 * sin(uTime * 0.12);

    float intensity = (beams * cone * falloff + core * cone) * uIntensity * breath;

    // Ordered-ish dither. Near-black gradients band hard on 8-bit displays, and
    // one bit of noise below the quantisation step removes it entirely.
    float dither = (hash(gl_FragCoord.xy) - 0.5) * 0.0055;

    // Ceiling: this sits behind type and must never compete with it.
    intensity = clamp(intensity + dither, 0.0, 0.5);

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
  /** How far the source drifts from centre, in viewport widths. */
  drift?: number;
}

export function LightRays({
  intensity = 1,
  spread = 0.5,
  falloff = 0.5,
  sharpness = 0.4,
  drift = 0.28,
}: LightRaysProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uIntensity: { value: intensity },
      uSpread: { value: spread },
      uFalloff: { value: falloff },
      uSharp: { value: sharpness },
      uOrigin: { value: new THREE.Vector2(0, 1.24) },
    }),
    [intensity, spread, falloff, sharpness],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    // Clamp: a backgrounded tab resumes with a huge delta, which would jump the
    // source across the screen on the first frame back.
    const dt = Math.min(delta, 0.05);
    const aspect = viewport.width / viewport.height;

    material.uniforms.uTime.value += dt;
    material.uniforms.uAspect.value = aspect;

    // Two detuned sines: the period never repeats cleanly, so the drift reads as
    // wandering rather than as a loop.
    const t = material.uniforms.uTime.value;
    const offset = Math.sin(t * 0.043) * 0.7 + Math.sin(t * 0.027) * 0.3;

    material.uniforms.uOrigin.value.set(offset * drift * aspect, 1.24);
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
