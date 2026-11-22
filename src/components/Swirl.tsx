import { useEffect, useRef } from 'react'

// Full-screen painted swirl behind the table. Rendered at 1/6 resolution and upscaled with
// pixelated sampling, which gives the chunky look and keeps phones cool.
const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform vec3 c1, c2, c3;
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  float r = length(uv);
  float a = atan(uv.y, uv.x) + 2.2 * r - 0.12 * t;
  vec2 p = vec2(cos(a), sin(a)) * r * 3.5;
  for (int i = 0; i < 5; i++) p += 0.55 * vec2(sin(p.y * 1.3 + t * 0.21), cos(p.x * 1.1 - t * 0.17));
  float v = 0.5 + 0.5 * sin(p.x + p.y);
  float w = 0.5 + 0.5 * sin(length(p) * 1.4 - t * 0.3);
  vec3 col = mix(c1, c2, smoothstep(0.25, 0.75, v));
  col = mix(col, c3, smoothstep(0.6, 0.95, w) * 0.7);
  gl_FragColor = vec4(floor(col * 12.0) / 12.0, 1.0);
}`

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

export function Swirl({ colors }: { colors: [string, string, string] }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const key = colors.join()

  useEffect(() => {
    const el = canvas.current!
    const gl = el.getContext('webgl')
    if (!gl) return // the CSS background colour stays as the fallback
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}'))
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    key.split(',').forEach((hex, i) => gl.uniform3fv(gl.getUniformLocation(prog, `c${i + 1}`), rgb(hex)))
    const uRes = gl.getUniformLocation(prog, 'res')
    const uT = gl.getUniformLocation(prog, 't')

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const draw = (ms: number) => {
      const w = Math.ceil(innerWidth / 6)
      const h = Math.ceil(innerHeight / 6)
      if (el.width !== w || el.height !== h) {
        el.width = w
        el.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
      gl.uniform1f(uT, ms / 1000 + 40)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!still) frame = requestAnimationFrame(draw)
    }
    draw(0)
    const onResize = () => still && draw(0)
    addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('resize', onResize)
    }
  }, [key])

  // keyed so a palette change gets a fresh canvas and context
  return <canvas key={key} ref={canvas} aria-hidden className="swirl" />
}
