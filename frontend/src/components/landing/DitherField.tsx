"use client";

import { useEffect, useRef } from "react";

/** Each dither cell is this many CSS pixels; the canvas is upscaled with `pixelated`. */
const CELL = 2;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Domain-warped fbm, thresholded per 3x2 block through a Bayer matrix and drawn as a short
// horizontal dash: a slow cloud of "runways" (4x2 CSS px dashes on a 6x4 grid).
const FRAG = `precision mediump float;
#define CELL ${CELL.toFixed(1)}
uniform vec2 uRes;uniform float uTime;uniform float uScroll;uniform float uScrollPx;uniform vec3 uInk;uniform float uAlpha;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
float b2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}
float b4(vec2 a){return b2(.5*a)*.25+b2(a);}
void main(){
  vec2 blk=floor(gl_FragCoord.xy/vec2(3.,2.));
  vec2 inb=gl_FragCoord.xy-blk*vec2(3.,2.);
  vec2 c=(blk+.5)*vec2(3.,2.);
  vec2 uv=c/uRes;
  vec2 q=vec2(uv.x*uRes.x/uRes.y,uv.y)*2.2;
  q.y+=uScroll*.55;
  float n=fbm(q+vec2(uTime*.03,-uTime*.02));
  n=fbm(q+n*1.7+vec2(-uTime*.015,uTime*.012));
  float glow=exp(-pow((uv.x-.8)*1.7,2.)-pow((1.-uv.y)*1.9,2.))+.7*exp(-pow((uv.x-.1)*2.,2.)-pow((uv.y-.2)*2.4,2.));
  float d=smoothstep(.4,.9,n)*(.18+.95*glow);
  // Keep the hero copy column clear (page coords, CSS px), and quiet the field past the hero.
  vec2 css=vec2(c.x,uRes.y-c.y)*CELL;
  float docY=uScrollPx+css.y;
  float col=1.-smoothstep(300.,480.,abs(css.x-uRes.x*CELL*.5));
  float band=smoothstep(110.,190.,docY)*(1.-smoothstep(620.,780.,docY));
  d*=(1.-col*band)*(1.-.55*smoothstep(.15,1.,uScroll));
  float dash=step(inb.x,2.)*step(inb.y,1.);
  float on=step(b4(blk)+.02,d)*dash;
  gl_FragColor=vec4(uInk,1.)*on*uAlpha;
}`;

function readInk(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--dither-ink");
  const [r = 77, g = 107, b = 153] = raw.split(",").map((v) => Number(v.trim()));
  return [r / 255, g / 255, b / 255];
}

/** Fills its wrapper; defaults to a fixed full-viewport backdrop. */
export function DitherField({ className = "fixed inset-0 z-0" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: true });
    if (!canvas || !gl) return; // No WebGL: the paper grain alone carries the texture.

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes"), uTime = u("uTime"), uScroll = u("uScroll"), uScrollPx = u("uScrollPx");
    const uInk = u("uInk"), uAlpha = u("uAlpha");

    const setInk = () => {
      gl.uniform3fv(uInk, readInk());
      gl.uniform1f(uAlpha, document.documentElement.dataset.theme === "dark" ? 0.42 : 0.5);
    };
    const box = canvas.parentElement!;
    const resize = () => {
      canvas.width = Math.max(1, Math.ceil(box.clientWidth / CELL));
      canvas.height = Math.max(1, Math.ceil(box.clientHeight / CELL));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    setInk();

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;
    const draw = () => {
      gl.uniform1f(uTime, reduce ? 12 : (performance.now() - start) / 1000);
      gl.uniform1f(uScroll, scrollY / innerHeight);
      gl.uniform1f(uScrollPx, scrollY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(frame);
      if (reduce) draw();
      else if (!document.hidden) loop();
    };
    const onResize = () => {
      resize();
      draw();
    };
    const onTheme = () => {
      setInk();
      draw();
    };

    resize();
    play();
    const observer = new ResizeObserver(onResize);
    observer.observe(box);
    if (reduce) addEventListener("scroll", draw, { passive: true });
    document.addEventListener("visibilitychange", play);
    window.addEventListener("auramail-theme-change", onTheme);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("scroll", draw);
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("auramail-theme-change", onTheme);
    };
  }, []);

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas
        ref={ref}
        className="dither-canvas absolute inset-0 size-full [image-rendering:pixelated]"
      />
      <div className="paper-grain absolute inset-0" />
    </div>
  );
}
