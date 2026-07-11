"use client";

import { useEffect, useRef } from "react";

const VERTEX_SRC = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Domain-warped simplex noise "fluid" field. Ashima's classic 3D simplex
// noise (public domain) drives fbm(); time is fed in as the z axis so the
// 2D field animates smoothly without any rotation-matrix bookkeeping.
const FRAGMENT_SRC = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uBase;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 5; i++) {
    sum += amp * snoise(p);
    p *= 1.95;
    amp *= 0.55;
  }
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  // Slow, large-scale drift — a handful of soft blobs, not a dense pattern.
  float t = uTime * 0.022;
  vec2 pp = p * 0.6;

  vec2 q = vec2(
    fbm(vec3(pp * 0.9, t)),
    fbm(vec3(pp * 0.9 + 4.7, t + 3.1))
  );
  vec2 r = vec2(
    fbm(vec3(pp * 1.1 + 0.9 * q + vec2(1.7, 9.2), t * 1.1)),
    fbm(vec3(pp * 1.1 + 0.9 * q + vec2(8.3, 2.8), t * 1.1 + 5.0))
  );
  float n = fbm(vec3(pp * 1.2 + 1.1 * r, t * 0.7));

  float band1 = smoothstep(0.0, 0.75, n);
  float band2 = smoothstep(0.25, 1.0, length(r));

  vec3 col = uBase;
  col = mix(col, uColorA, band1 * 0.16);
  col = mix(col, uColorB, band2 * 0.10);
  col = mix(col, uColorC, smoothstep(0.6, 1.0, n) * 0.07);

  // Strong vignette: colour only survives away from the very centre, so
  // text sitting mid-screen always reads against near-flat base colour.
  float vign = smoothstep(1.5, 0.35, length(p));
  col = mix(uBase, col, vign);

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.trim().replace("#", "");
  if (clean.length !== 6) return [0, 0, 0];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function readThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => {
    const value = style.getPropertyValue(name).trim();
    return hexToRgb01(value || fallback);
  };
  return {
    base: read("--aura-canvas", "#080a0d"),
    accent: read("--aura-accent-strong", "#2dd4bf"),
    secondary: read("--aura-secondary", "#8fb7ff"),
    tertiary: read("--aura-tertiary", "#a78bfa"),
  };
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.parentElement;
    if (!canvas || !root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const gl =
      (canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        premultipliedAlpha: false,
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "experimental-webgl",
      ) as WebGLRenderingContext | null);
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uColorA = gl.getUniformLocation(program, "uColorA");
    const uColorB = gl.getUniformLocation(program, "uColorB");
    const uColorC = gl.getUniformLocation(program, "uColorC");
    const uBase = gl.getUniformLocation(program, "uBase");

    let target = readThemeColors();
    const current = {
      base: [...target.base] as [number, number, number],
      accent: [...target.accent] as [number, number, number],
      secondary: [...target.secondary] as [number, number, number],
      tertiary: [...target.tertiary] as [number, number, number],
    };

    const onThemeChange = () => {
      target = readThemeColors();
    };
    window.addEventListener("auramail-theme-change", onThemeChange);

    // Render at a fraction of device pixels — the canvas is blurred in CSS
    // afterwards, so a soft, low-res source looks better and is cheaper
    // than rendering crisp detail just to blur it away.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
    const resize = () => {
      const width = Math.max(1, Math.round(root.clientWidth * dpr));
      const height = Math.max(1, Math.round(root.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const lerpColors = () => {
      const speed = 0.06;
      (["base", "accent", "secondary", "tertiary"] as const).forEach(
        (key) => {
          for (let i = 0; i < 3; i++) {
            current[key][i] += (target[key][i] - current[key][i]) * speed;
          }
        },
      );
    };

    let rafId = 0;
    let hidden = document.hidden;
    const start = performance.now();

    const draw = (now: number) => {
      lerpColors();
      const t = reducedMotion ? 12 : (now - start) / 1000;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform3fv(uColorA, current.accent);
      gl.uniform3fv(uColorB, current.secondary);
      gl.uniform3fv(uColorC, current.tertiary);
      gl.uniform3fv(uBase, current.base);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reducedMotion && !hidden) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden && !reducedMotion) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafId);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("auramail-theme-change", onThemeChange);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className="fluid-bg-root" aria-hidden="true">
      <canvas ref={canvasRef} className="fluid-bg-canvas" />
    </div>
  );
}
