"use client";

import { useEffect, useRef } from "react";

/* ─── Vertex shader — full-screen triangle strip ─── */
const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/* ─── Fragment shader — domain-warped FBM fluid ─── */
const FRAG = `
precision mediump float;

uniform float u_time;
uniform vec2  u_res;

/* Gradient noise hash */
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

/* Smooth gradient noise */
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i),              f              ),
        dot(hash2(i + vec2(1,0)), f - vec2(1,0)  ), u.x),
    mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)  ),
        dot(hash2(i + vec2(1,1)), f - vec2(1,1)  ), u.x),
    u.y
  );
}

/* Fractal Brownian Motion — 5 octaves */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2  m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p  = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x   *= u_res.x / u_res.y;          /* correct aspect ratio */

  float t = u_time * 0.09;

  /* ── Domain warping (Inigo Quilez technique) ── */
  vec2 p = uv * 1.6;
  vec2 q = vec2(
    fbm(p                           + t),
    fbm(p + vec2(5.2, 1.3)         + t * 0.8)
  );
  vec2 r = vec2(
    fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.55),
    fbm(p + 2.2 * q + vec2(8.3, 2.8) + t * 0.50)
  );
  float f = fbm(p + 3.0 * r + t * 0.28);
  f = clamp(0.5 + 0.5 * f, 0.0, 1.0);

  /* ── Color palette — deep navy → blue → electric purple ── */
  vec3 c0 = vec3(0.008, 0.012, 0.055);  /* void navy       */
  vec3 c1 = vec3(0.020, 0.055, 0.200);  /* dark ocean blue */
  vec3 c2 = vec3(0.080, 0.180, 0.620);  /* electric blue   */
  vec3 c3 = vec3(0.350, 0.060, 0.520);  /* deep violet     */
  vec3 c4 = vec3(0.520, 0.020, 0.380);  /* vivid magenta   */

  vec3 col = c0;
  col = mix(col, c1, smoothstep(0.15, 0.40, f));
  col = mix(col, c2, smoothstep(0.38, 0.62, f));
  col = mix(col, c3, smoothstep(0.58, 0.80, f));
  col = mix(col, c4, smoothstep(0.75, 0.95, f));

  /* ── Soft center glow ── */
  vec2 cUv = gl_FragCoord.xy / u_res - 0.5;
  float glow = exp(-dot(cUv, cUv) * 3.5);
  col += vec3(0.04, 0.06, 0.20) * glow;

  /* ── Edge vignette ── */
  float vig = 1.0 - smoothstep(0.35, 1.1, length(cUv) * 1.9);
  col *= 0.80 + 0.20 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    /* compile helper */
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* full-screen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]),
      gl.STATIC_DRAW
    );
    const aPOS = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPOS);
    gl.vertexAttribPointer(aPOS, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_res");

    /* resize */
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* render loop */
    let raf: number;
    const t0 = performance.now();
    const tick = () => {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uRes,  canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
