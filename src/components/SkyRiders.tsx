import { useEffect, useRef } from 'react'

// SkyRiders of the Velvet Sunset: an original flap-and-collide arcade game with a 70s van-mural sunset,
// drawn in a 16-bit console style. A hero on a winged horse battles sorcerers on griffins above a molten lake.
// Whoever is higher when they meet wins. When nobody is playing it runs an attract mode where the hero flies itself.
//
// How the 16-bit look works: everything is drawn into a small low-resolution buffer (about 240 pixels tall on a
// wide screen), then scaled up with hard square pixels. The painted scenery, the sprites and the lettering are drawn
// once, then snapped to a fixed palette, with checkerboard dithering on the scenery and dark outlines on the sprites.
// Stars, lava, sparks and glints are drawn pixel by pixel every frame.
//
// The game fills whatever box it is given. The game world is 500 units tall on wide screens and 400 units wide on
// tall ones, and stretches along the other side to match the screen, so nothing is cropped or letterboxed.

const GRAVITY = 0.22
const FLAP = -4.2
const SPRITE_SCALE = 1.3

type Rider = { x: number; y: number; vx: number; vy: number; dir: number; wing: number; alive: boolean; safe: number }
type Mode = 'attract' | 'play' | 'over'
type Platform = { x: number; y: number; w: number; rocks: number[] }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
type Star = { x: number; y: number; phase: number; burst: boolean }
type Frame = { img: HTMLCanvasElement; ox: number; oy: number }
type Label = { img: HTMLCanvasElement; base: number; half: number }
type Draw = CanvasRenderingContext2D

// Ledges as fractions of the world, so they spread out on any screen shape.
const LEDGES = [
  { fx: 0.1, fy: 0.72, fw: 0.2 },
  { fx: 0.7, fy: 0.72, fw: 0.2 },
  { fx: 0.375, fy: 0.5, fw: 0.25 },
  { fx: 0.05, fy: 0.3, fw: 0.18 },
  { fx: 0.77, fy: 0.3, fw: 0.18 },
]

// The fixed palette everything snaps to, like the limited colour sets of 16-bit consoles.
const PALETTE = [
  '#0d0221', '#1a0629', '#2b0a4a', '#3b0f5c', '#4e1a72', '#6a2a86', '#8e2a7e', '#b03a86', '#d4508a', '#e8506a',
  '#ff6f5a', '#ff8a3d', '#ffa94d', '#ffc65c', '#ffe08a', '#fff6c8', '#ffffff', '#c46a8a', '#a05a98', '#8a4f9e',
  '#5a2a7a', '#7a52b8', '#a98cf0', '#d7c4ff', '#9fdcff', '#5aa8ff', '#2a6ad8', '#29f0ff', '#1fb8e0', '#c9fff6',
  '#e8b46a', '#d0964a', '#9a5a2a', '#6b3d1c', '#4a1f10', '#ff3b6b', '#c0102a', '#6d0a2e', '#ff3d7f', '#ffd56b',
  '#e8dcc8', '#cdbfe0', '#8a9bc8', '#4b3a8f', '#a9b8ff', '#f4f0ff', '#ff9de2', '#b388ff', '#ff5a1f', '#e8250f',
  '#4a0218',
]
const rgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const PAL = PALETTE.map(rgb)
const OUTLINE = rgb('#1a0629')
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

const nearest = (r: number, g: number, b: number) => {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < PAL.length; i++) {
    const [pr, pg, pb] = PAL[i]
    const d = 2 * (r - pr) ** 2 + 4 * (g - pg) ** 2 + 3 * (b - pb) ** 2
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

// Snap a canvas to the palette. Soft edges become hard, `dither` adds the checkerboard blend between colours,
// and `outline` rings every shape with a dark one-pixel border.
const quantize = (cv: HTMLCanvasElement, dither: number, outline: boolean) => {
  const g = cv.getContext('2d')
  const { width: w, height: h } = cv
  if (!g || !w || !h) return
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  const solid = new Uint8Array(w * h)
  const memo = new Map<number, number>()
  const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      const i = p * 4
      if (d[i + 3] < 128) {
        d[i + 3] = 0
        continue
      }
      solid[p] = 1
      const off = dither ? (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * dither : 0
      const r = clamp(d[i] + off)
      const gg = clamp(d[i + 1] + off)
      const b = clamp(d[i + 2] + off)
      const key = ((r >> 2) << 12) | ((gg >> 2) << 6) | (b >> 2)
      let best = memo.get(key)
      if (best === undefined) {
        best = nearest(r, gg, b)
        memo.set(key, best)
      }
      const c = PAL[best]
      d[i] = c[0]
      d[i + 1] = c[1]
      d[i + 2] = c[2]
      d[i + 3] = 255
    }
  }
  if (outline) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x
        if (solid[p]) continue
        const near =
          (x > 0 && solid[p - 1]) || (x < w - 1 && solid[p + 1]) || (y > 0 && solid[p - w]) || (y < h - 1 && solid[p + w])
        if (!near) continue
        const i = p * 4
        d[i] = OUTLINE[0]
        d[i + 1] = OUTLINE[1]
        d[i + 2] = OUTLINE[2]
        d[i + 3] = 255
      }
    }
  }
  g.putImageData(img, 0, 0)
}

// Repeatable pseudo-random numbers, so the mountains and stars look the same on every visit.
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// ---- sprite art, drawn as shapes and then pixelated ----

// A feathered wing; `lift` raises it for a flap or lowers it for a glide.
const wing = (c: Draw, lift: number, light: string, dark: string, tip: string) => {
  for (let k = 0; k < 4; k++) {
    const g = c.createLinearGradient(0, -4, -30, lift - 10)
    g.addColorStop(0, light)
    g.addColorStop(0.7, dark)
    g.addColorStop(1, tip)
    c.fillStyle = g
    c.beginPath()
    c.moveTo(4 - k * 3, -2)
    c.quadraticCurveTo(-6 - k * 4, lift - 18 + k * 4, -24 + k * 3, lift - 10 + k * 6)
    c.quadraticCurveTo(-10 - k * 2, lift - 2 + k * 3, 2 - k * 3, 2)
    c.closePath()
    c.fill()
  }
}

// Hero: a pale winged horse with a golden mane and a rider in a flowing cyan cape.
const drawHero = (c: Draw, lift: number, gallop: number) => {
  c.strokeStyle = '#ffd56b'
  c.lineWidth = 4
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(-15, 2)
  c.quadraticCurveTo(-26, -2 + gallop, -32, 9)
  c.stroke()
  c.strokeStyle = '#e8dcc8'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(-8, 8)
  c.lineTo(-12, 15 + gallop)
  c.moveTo(8, 8)
  c.lineTo(12, 14 - gallop)
  c.stroke()
  const body = c.createLinearGradient(0, -6, 0, 12)
  body.addColorStop(0, '#ffffff')
  body.addColorStop(1, '#cdbfe0')
  c.fillStyle = body
  c.beginPath()
  c.ellipse(0, 3, 17, 8, 0, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.moveTo(10, -1)
  c.quadraticCurveTo(17, -10, 21, -14)
  c.lineTo(27, -11)
  c.quadraticCurveTo(28, -8, 25, -7)
  c.lineTo(20, -6)
  c.quadraticCurveTo(18, 2, 13, 6)
  c.closePath()
  c.fill()
  c.fillStyle = '#2b0a4a'
  c.fillRect(21.5, -12.5, 2.5, 2.5)
  c.strokeStyle = '#ffc65c'
  c.lineWidth = 3.5
  c.beginPath()
  c.moveTo(20, -14)
  c.quadraticCurveTo(13, -12 + gallop * 0.5, 9, -3)
  c.stroke()
  c.fillStyle = '#29f0ff'
  c.beginPath()
  c.moveTo(-1, -16)
  c.quadraticCurveTo(-14, -14 + gallop, -24, -6 + gallop)
  c.quadraticCurveTo(-12, -6, 1, -6)
  c.closePath()
  c.fill()
  c.fillStyle = '#1fb8e0'
  c.fillRect(-3, -15, 7, 11)
  const helm = c.createRadialGradient(0, -20, 0, 1, -18, 5)
  helm.addColorStop(0, '#ffffff')
  helm.addColorStop(1, '#8a9bc8')
  c.fillStyle = helm
  c.beginPath()
  c.arc(1, -18, 4.5, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#ffffff'
  c.lineWidth = 2.5
  c.beginPath()
  c.moveTo(3, -9)
  c.lineTo(24, -16)
  c.stroke()
  wing(c, lift, '#ffffff', '#ffe08a', '#ff9de2')
}

// Foe: a bronze griffin with an eagle head, ridden by a hooded sorcerer with a glowing staff.
const drawFoe = (c: Draw, lift: number) => {
  c.strokeStyle = '#6b3d1c'
  c.lineWidth = 2.5
  c.beginPath()
  c.moveTo(-15, 2)
  c.quadraticCurveTo(-25, 6, -28, -2)
  c.stroke()
  const body = c.createLinearGradient(0, -6, 0, 12)
  body.addColorStop(0, '#d0964a')
  body.addColorStop(1, '#6b3d1c')
  c.fillStyle = body
  c.beginPath()
  c.ellipse(0, 3, 16, 8, 0, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#f4f0ff'
  c.beginPath()
  c.arc(16, -6, 6, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#ffa94d'
  c.beginPath()
  c.moveTo(21, -8)
  c.quadraticCurveTo(28, -7, 25, -2)
  c.lineTo(21, -4)
  c.closePath()
  c.fill()
  c.fillStyle = '#c0102a'
  c.fillRect(16.5, -8.5, 2.5, 2.5)
  const robe = c.createLinearGradient(0, -24, 0, -2)
  robe.addColorStop(0, '#ff3b6b')
  robe.addColorStop(1, '#6d0a2e')
  c.fillStyle = robe
  c.beginPath()
  c.moveTo(1, -26)
  c.lineTo(8, -3)
  c.lineTo(-7, -3)
  c.closePath()
  c.fill()
  c.fillStyle = '#1a0629'
  c.beginPath()
  c.arc(1.5, -16, 3, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#4a1f10'
  c.lineWidth = 2.5
  c.beginPath()
  c.moveTo(6, -4)
  c.lineTo(12, -24)
  c.stroke()
  c.fillStyle = '#b388ff'
  c.beginPath()
  c.arc(12, -26, 4.5, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#ffffff'
  c.fillRect(11, -27.5, 2, 2)
  wing(c, lift, '#e8b46a', '#9a5a2a', '#4a1f10')
}

// Wing positions for the animation frames: a flap, then three glide poses.
const POSES: [number, number][] = [
  [-15, 0],
  [5, 2],
  [2, 0],
  [-1, -2],
]

export default function SkyRiders({ className = 'block h-full w-full' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const buffer = document.createElement('canvas')
    const b = buffer.getContext('2d')
    if (!ctx || !b) return
    canvas.style.imageRendering = 'pixelated'

    // ---- sizes: the game world, the low-res buffer, and how big each buffer pixel is on screen ----
    let W = 800
    let H = 500
    let LAVA_Y = H - 40
    let LW = 360 // buffer width and height in pixels
    let LH = 225
    let k = LH / H // world units to buffer pixels
    let pixel = 4 // screen pixels per buffer pixel
    let platforms: Platform[] = []
    let stars: Star[] = []
    let heroFrames: Frame[] = []
    let foeFrames: Frame[] = []
    const backdrop = document.createElement('canvas')
    const labels = new Map<string, Label>()

    const X = (wx: number) => Math.round(wx * k)

    // ---- the painted scenery, drawn once per screen size and then pixelated with dithering ----
    const paintBackdrop = () => {
      const c = backdrop.getContext('2d')
      if (!c) return
      c.setTransform(k, 0, 0, k, 0, 0)
      const horizon = LAVA_Y - 40

      const sky = c.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, '#0d0221')
      sky.addColorStop(0.3, '#3b0f5c')
      sky.addColorStop(0.55, '#8e2a7e')
      sky.addColorStop(0.78, '#e8506a')
      sky.addColorStop(0.92, '#ff8a3d')
      sky.addColorStop(1, '#ffc65c')
      c.fillStyle = sky
      c.fillRect(0, 0, W, H)

      // the big striped sunset sun, with a halo behind it
      const sunR = Math.min(W, H) * 0.24
      const sunX = W / 2
      const sunY = horizon - sunR * 0.35
      const halo = c.createRadialGradient(sunX, sunY, sunR * 0.6, sunX, sunY, sunR * 2.2)
      halo.addColorStop(0, 'rgba(255,200,120,0.55)')
      halo.addColorStop(1, 'rgba(255,110,120,0)')
      c.fillStyle = halo
      c.fillRect(0, 0, W, H)
      const sg = c.createLinearGradient(0, sunY - sunR, 0, sunY + sunR)
      sg.addColorStop(0, '#fff6c8')
      sg.addColorStop(0.45, '#ffc65c')
      sg.addColorStop(0.75, '#ff8a3d')
      sg.addColorStop(1, '#ff3d7f')
      c.save()
      c.beginPath()
      c.arc(sunX, sunY, sunR, 0, Math.PI * 2)
      c.clip()
      c.fillStyle = sg
      c.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2)
      // the stripes across the sun, thicker and closer together toward the bottom, sized in whole buffer pixels
      c.fillStyle = '#d4508a'
      for (let i = 0, y = sunY - sunR * 0.72; i < 7 && y < sunY + sunR; i++) {
        const rows = 1 + Math.floor(i / 2)
        c.fillRect(sunX - sunR, Math.round(y * k) / k, sunR * 2, rows / k)
        y += (rows + Math.max(2, 5 - i)) / k
      }
      c.restore()

      // a ringed planet and a small moon
      const px = W * 0.8
      const py = H * 0.17
      const pr = 30
      c.save()
      c.translate(px, py)
      c.rotate(-0.35)
      c.strokeStyle = '#c46a8a'
      c.lineWidth = 5
      c.beginPath()
      c.ellipse(0, 0, pr * 2, pr * 0.42, 0, Math.PI, Math.PI * 2)
      c.stroke()
      const pg = c.createRadialGradient(-pr * 0.4, -pr * 0.45, pr * 0.1, 0, 0, pr)
      pg.addColorStop(0, '#f4f0ff')
      pg.addColorStop(0.5, '#a9b8ff')
      pg.addColorStop(1, '#4b3a8f')
      c.fillStyle = pg
      c.beginPath()
      c.arc(0, 0, pr, 0, Math.PI * 2)
      c.fill()
      c.strokeStyle = '#ffc65c'
      c.beginPath()
      c.ellipse(0, 0, pr * 2, pr * 0.42, 0, 0, Math.PI)
      c.stroke()
      c.restore()
      const mg = c.createRadialGradient(W * 0.14 - 4, H * 0.12 - 4, 1, W * 0.14, H * 0.12, 12)
      mg.addColorStop(0, '#ffffff')
      mg.addColorStop(1, '#a05a98')
      c.fillStyle = mg
      c.beginPath()
      c.arc(W * 0.14, H * 0.12, 12, 0, Math.PI * 2)
      c.fill()

      // long clouds lit from below
      const rand = seeded(11)
      for (let i = 0; i < 6; i++) {
        const cx = rand() * W
        const cy = horizon * (0.45 + rand() * 0.4)
        const cw = W * (0.18 + rand() * 0.25)
        const ch = 6 + rand() * 4
        c.fillStyle = '#d4508a'
        c.beginPath()
        c.ellipse(cx, cy, cw / 2, ch, 0, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = '#ffa94d'
        c.beginPath()
        c.ellipse(cx + cw * 0.05, cy + ch * 0.45, cw * 0.4, ch * 0.45, 0, 0, Math.PI * 2)
        c.fill()
      }

      // two ranges of jagged mountains, each with a lit rim
      const range = (seed: number, base: number, height: number, step: number, top: string, low: string, rim: string) => {
        const r = seeded(seed)
        const pts: [number, number][] = []
        for (let x = -step; x <= W + step; x += step) pts.push([x + (r() - 0.5) * step * 0.6, base - height * (0.35 + r() * 0.65)])
        const g = c.createLinearGradient(0, base - height, 0, base)
        g.addColorStop(0, top)
        g.addColorStop(1, low)
        c.fillStyle = g
        c.beginPath()
        c.moveTo(-step, H)
        for (const [x, y] of pts) c.lineTo(x, y)
        c.lineTo(W + step, H)
        c.closePath()
        c.fill()
        c.strokeStyle = rim
        c.lineWidth = 1.6 / k
        c.beginPath()
        pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
        c.stroke()
      }
      range(3, horizon + 10, 150, 70, '#8a4f9e', '#c46a8a', '#ffa94d')
      range(5, LAVA_Y + 4, 95, 55, '#3b0f5c', '#1a0629', '#ff6f5a')

      // floating islands: a polished top with jagged rock hanging underneath
      for (const p of platforms) {
        const depth = 26
        const rock = c.createLinearGradient(0, p.y, 0, p.y + depth)
        rock.addColorStop(0, '#a05a98')
        rock.addColorStop(1, '#3b0f5c')
        c.fillStyle = rock
        c.beginPath()
        c.moveTo(p.x - 2, p.y + 6)
        const n = p.rocks.length
        for (let i = 0; i < n; i++) {
          const fx = (i + 0.5) / n
          const centre = 1 - Math.abs(fx - 0.5) * 2
          c.lineTo(p.x + fx * p.w, p.y + 8 + (depth - 8) * centre * (0.5 + p.rocks[i] * 0.5))
        }
        c.lineTo(p.x + p.w + 2, p.y + 6)
        c.closePath()
        c.fill()
        const top = c.createLinearGradient(0, p.y, 0, p.y + 10)
        top.addColorStop(0, '#ffffff')
        top.addColorStop(0.35, '#d7c4ff')
        top.addColorStop(1, '#7a52b8')
        c.fillStyle = top
        c.fillRect(p.x - 3, p.y, p.w + 6, 10)
      }

      c.setTransform(1, 0, 0, 1, 0, 0)
      quantize(backdrop, 44, false)
      // the dark outline along the top edge of each island, after pixelating so it stays one pixel thick
      c.fillStyle = '#ffffff'
      for (const p of platforms) c.fillRect(X(p.x - 3) + 1, X(p.y), X(p.w + 6) - 2, 1)
    }

    // Sprites are drawn as shapes into a small canvas at buffer resolution, then pixelated with an outline.
    const makeFrame = (draw: (c: Draw) => void): Frame => {
      const sc = k * SPRITE_SCALE
      const cv = document.createElement('canvas')
      cv.width = Math.ceil(100 * sc) + 2
      cv.height = Math.ceil(80 * sc) + 2
      const ox = Math.round(52 * sc) + 1
      const oy = Math.round(46 * sc) + 1
      const c = cv.getContext('2d')
      if (c) {
        c.setTransform(sc, 0, 0, sc, ox, oy)
        draw(c)
      }
      quantize(cv, 0, true)
      return { img: cv, ox, oy }
    }

    // Lettering is drawn once at buffer resolution and pixelated, then reused until the text changes.
    const label = (key: string, size: number, draw: (c: Draw, px: number, base: number) => number, dither = 0): Label => {
      const cached = labels.get(key)
      if (cached) return cached
      if (labels.size > 40) labels.clear()
      const px = Math.max(9, Math.round(size * k))
      const cv = document.createElement('canvas')
      cv.width = LW
      cv.height = Math.ceil(px * 1.9)
      const base = Math.round(px * 1.3)
      const c = cv.getContext('2d')
      const half = c ? draw(c, px, base) : 0
      quantize(cv, dither, false)
      const made = { img: cv, base, half }
      labels.set(key, made)
      return made
    }

    // Chrome lettering in the van-mural style: sky reflected on top, a dark horizon line, warm ground below.
    const chrome = (s: string, size: number) =>
      label(
        `chrome|${s}|${size}`,
        size,
        (c, px, base) => {
          const face = (n: number) => `italic 900 ${n}px Georgia, 'Times New Roman', serif`
          c.font = face(px)
          const max = LW - 16
          const width = c.measureText(s).width
          if (width > max) {
            px = Math.max(10, Math.floor((px * max) / width))
            c.font = face(px)
          }
          c.textAlign = 'center'
          const g = c.createLinearGradient(0, base - px * 0.8, 0, base + px * 0.05)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(0.35, '#9fdcff')
          g.addColorStop(0.5, '#2b0a4a')
          g.addColorStop(0.53, '#ff8a3d')
          g.addColorStop(0.8, '#ffe08a')
          g.addColorStop(1, '#ffffff')
          c.lineJoin = 'round'
          c.lineWidth = Math.max(3, px * 0.18)
          c.strokeStyle = '#1a0629'
          c.shadowColor = 'rgba(255,80,200,0.85)'
          c.shadowBlur = px * 0.45
          c.strokeText(s, LW / 2, base)
          c.shadowBlur = 0
          c.fillStyle = g
          c.fillText(s, LW / 2, base)
          return Math.min(c.measureText(s).width, max) / 2
        },
        30,
      )

    // Smaller text with a dark outline so it reads over any part of the sky.
    const caption = (s: string, size: number, align: CanvasTextAlign = 'center') =>
      label(`caption|${s}|${size}|${align}`, size, (c, px, base) => {
        c.font = `italic 700 ${px}px Georgia, serif`
        c.textAlign = align
        const x = align === 'left' ? 6 : align === 'right' ? LW - 6 : LW / 2
        c.lineJoin = 'round'
        c.lineWidth = 3
        c.strokeStyle = '#1a0629'
        c.strokeText(s, x, base)
        c.fillStyle = '#fff6c8'
        c.fillText(s, x, base)
        return c.measureText(s).width / 2
      })

    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      const cw = Math.max(1, rect.width)
      const ch = Math.max(1, rect.height)
      const wide = cw >= ch
      pixel = Math.max(2, Math.round(wide ? ch / 240 : cw / 256))
      LW = Math.ceil(cw / pixel)
      LH = Math.ceil(ch / pixel)
      if (wide) {
        H = 500
        W = Math.round((500 * LW) / LH)
        k = LH / H
      } else {
        W = 400
        H = Math.round((400 * LH) / LW)
        k = LW / W
      }
      LAVA_Y = H - 40
      const rand = seeded(7)
      platforms = LEDGES.map((l) => {
        const w = Math.max(90, l.fw * W)
        return { x: l.fx * W, y: l.fy * H, w, rocks: Array.from({ length: 7 }, () => rand()) }
      })
      stars = Array.from({ length: Math.round(W / 9) }, () => ({
        x: rand() * W,
        y: rand() * H * 0.42,
        phase: rand() * Math.PI * 2,
        burst: rand() < 0.08,
      }))
      canvas.width = LW * pixel
      canvas.height = LH * pixel
      buffer.width = LW
      buffer.height = LH
      backdrop.width = LW
      backdrop.height = LH
      labels.clear()
      paintBackdrop()
      heroFrames = POSES.map(([lift, gallop]) => makeFrame((c) => drawHero(c, lift, gallop)))
      foeFrames = POSES.map(([lift]) => makeFrame((c) => drawFoe(c, lift)))
    }
    fit()

    let audio: AudioContext | null = null
    const beep = (freq: number, dur = 0.08, type: OscillatorType = 'square') => {
      if (!audio) return
      const o = audio.createOscillator()
      const g = audio.createGain()
      o.type = type
      o.frequency.value = freq
      g.gain.setValueAtTime(0.06, audio.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur)
      o.connect(g).connect(audio.destination)
      o.start()
      o.stop(audio.currentTime + dur)
    }

    const keys: Record<string, boolean> = {}
    let steer = 0 // -1, 0 or 1 while a finger or mouse is held on the left or right of the screen
    let mode: Mode = 'attract'
    let score = 0
    let lives = 3
    let wave = 1
    let t = 0
    let raf = 0
    let sparks: Spark[] = []
    let comet = { x: -100, y: 0, life: 0 }

    const burst = (x: number, y: number, n: number, colors: string[], speed = 3, size = 2.5) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const v = speed * (0.3 + Math.random())
        const max = 30 + Math.random() * 30
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 1,
          life: max,
          max,
          color: colors[i % colors.length],
          size: size * (0.5 + Math.random()),
        })
      }
    }

    const newRider = (x: number, y: number): Rider => ({ x, y, vx: 0, vy: 0, dir: 1, wing: 0, alive: true, safe: 0 })
    const spawnHero = () => {
      const r = newRider(W / 2, H * 0.4)
      r.safe = 90
      return r
    }
    let player = spawnHero()
    let enemies: Rider[] = []

    const startWave = () => {
      const count = Math.min(2 + wave, 7)
      enemies = Array.from({ length: count }, (_, i) => newRider(((i + 0.5) / count) * W, 50))
    }
    const reset = () => {
      player = spawnHero()
      score = 0
      lives = 3
      wave = 1
      sparks = []
      startWave()
    }
    reset()

    const flap = (r: Rider) => {
      r.vy = FLAP
      r.wing = 8
      if (r === player) {
        burst(r.x - r.dir * 10, r.y + 4, 3, ['#fff6c8', '#ff9de2'], 1, 1.6)
        if (mode === 'play') beep(220, 0.05)
      }
    }

    const physics = (r: Rider) => {
      r.vy += GRAVITY
      r.vx = Math.max(-5, Math.min(5, r.vx * 0.98))
      r.x += r.vx
      r.y += r.vy
      if (r.x < -20) r.x = W + 20
      if (r.x > W + 20) r.x = -20
      if (r.y < 12) {
        r.y = 12
        r.vy = 1
      }
      for (const p of platforms) {
        if (r.vy > 0 && r.x > p.x && r.x < p.x + p.w && r.y + 14 > p.y && r.y + 14 < p.y + 12) {
          r.y = p.y - 14
          r.vy = 0
        }
      }
      if (r.wing > 0) r.wing--
      if (r.safe > 0) r.safe--
    }

    const enemyAI = (e: Rider) => {
      const target = Math.min(player.y - 20, LAVA_Y - 80)
      if (e.y > target && Math.random() < 0.08) flap(e)
      e.vx += Math.sign(player.x - e.x) * 0.05
      e.dir = Math.sign(e.vx) || 1
    }

    // The hero flies itself in attract mode: get above the nearest sorcerer, then dive on them.
    const demoAI = () => {
      const foe = enemies.find((e) => e.alive)
      if (!foe) return
      if ((player.y > foe.y - 25 || player.y > LAVA_Y - 70) && Math.random() < 0.14) flap(player)
      player.vx += Math.sign(foe.x - player.x) * 0.08
      player.dir = Math.sign(player.vx) || 1
    }

    const loseLife = () => {
      beep(80, 0.4, 'sawtooth')
      burst(player.x, Math.min(player.y, LAVA_Y), 26, ['#ffa94d', '#ff5a1f', '#ffe08a'], 3.5, 3)
      if (mode !== 'play') {
        reset()
        return
      }
      lives--
      player = spawnHero()
      if (lives <= 0) mode = 'over'
    }

    const collide = () => {
      for (const e of enemies) {
        if (!e.alive || Math.hypot(e.x - player.x, e.y - player.y) > 30) continue
        if (Math.abs(e.y - player.y) < 5) {
          // dead even: both bounce off
          player.vx = -player.vx * 1.5 || -3
          e.vx = -e.vx * 1.5 || 3
          burst((e.x + player.x) / 2, (e.y + player.y) / 2, 8, ['#ffffff', '#9fdcff'], 2, 1.8)
          beep(110)
        } else if (player.y < e.y) {
          e.alive = false
          score += 500
          burst(e.x, e.y, 30, ['#ffe08a', '#ff9de2', '#b388ff', '#ffffff'], 3.2, 2.6)
          beep(660, 0.15, 'triangle')
        } else if (player.safe === 0) {
          loseLife()
          return
        }
      }
    }

    // ---- per-frame drawing, all in buffer pixels ----

    // a four-pointed pixel glint
    const glint = (x: number, y: number, arm: number) => {
      b.fillStyle = '#ff9de2'
      b.fillRect(x - arm, y, arm * 2 + 1, 1)
      b.fillRect(x, y - arm, 1, arm * 2 + 1)
      b.fillStyle = '#ffffff'
      b.fillRect(x - 1, y, 3, 1)
      b.fillRect(x, y - 1, 1, 3)
    }

    const drawStars = () => {
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.05 + s.phase)
        const x = X(s.x)
        const y = X(s.y)
        if (s.burst) glint(x, y, tw > 0.6 ? 2 : 1)
        else {
          b.fillStyle = tw > 0.75 ? '#ffffff' : tw > 0.4 ? '#d7c4ff' : '#8a4f9e'
          b.fillRect(x, y, 1, 1)
        }
      }
      // an occasional shooting star
      if (comet.life <= 0 && Math.random() < 0.004) comet = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.2, life: 40 }
      if (comet.life > 0) {
        comet.life--
        comet.x += 9
        comet.y += 3
        const trail = ['#ffffff', '#fff6c8', '#ffe08a', '#ff9de2', '#a98cf0', '#6a2a86']
        trail.forEach((col, i) => {
          b.fillStyle = col
          b.fillRect(X(comet.x) - i * 3, X(comet.y) - i, 3, 1)
        })
      }
    }

    // the molten lake, drawn column by column in hard bands of colour
    const LAVA_BANDS: [string, number][] = [
      ['#fff6c8', 1],
      ['#ffe08a', 1],
      ['#ffa94d', 2],
      ['#ff8a3d', 2],
      ['#ff5a1f', 3],
      ['#e8250f', 4],
      ['#c0102a', 5],
      ['#6d0a2e', 6],
      ['#4a0218', 99],
    ]
    const surfaceY: number[] = []
    const drawLava = () => {
      for (let x = 0; x < LW; x++) {
        const wx = x / k
        surfaceY[x] = Math.round((LAVA_Y + Math.sin(wx * 0.04 + t * 0.06) * 3 + Math.sin(wx * 0.013 - t * 0.03) * 2) * k)
      }
      // embers flickering just above the surface
      b.fillStyle = '#ff5a1f'
      for (let x = 0; x < LW; x++) if ((x * 7 + (t >> 2)) % 11 === 0) b.fillRect(x, surfaceY[x] - 2, 1, 1)
      let depth = 0
      for (const [col, len] of LAVA_BANDS) {
        b.fillStyle = col
        for (let x = 0; x < LW; x++) b.fillRect(x, surfaceY[x] + depth, 1, len)
        // a checkerboard row where each band meets the next, the 16-bit way to blend
        if (len < 99) for (let x = (depth + (t >> 4)) & 1; x < LW; x += 2) b.fillRect(x, surfaceY[x] + depth + len, 1, 1)
        depth += len
      }
      // rising bubbles
      for (let i = 0; i < 6; i++) {
        const cycle = (t * 0.6 + i * 53) % 120
        const bx = ((i * 137 + Math.floor((t * 0.6 + i * 53) / 120) * 71) % LW) | 0
        const size = cycle < 90 ? 1 + Math.floor(cycle / 45) : 3
        b.fillStyle = cycle < 90 ? '#ffe08a' : '#fff6c8'
        b.fillRect(bx, surfaceY[bx] + 3 - Math.floor(Math.min(cycle, 90) / 30), size, size)
      }
    }

    // crystals glowing under each island
    const drawCrystals = () => {
      for (const p of platforms) {
        const cx = X(p.x + p.w * (0.3 + p.rocks[0] * 0.4))
        const cy = X(p.y + 15)
        const bright = Math.sin(t * 0.07 + p.x) > 0
        if (bright) {
          b.fillStyle = '#1fb8e0'
          b.fillRect(cx - 2, cy, 5, 1)
          b.fillRect(cx, cy - 3, 1, 7)
        }
        b.fillStyle = bright ? '#c9fff6' : '#29f0ff'
        b.fillRect(cx, cy - 2, 1, 5)
        b.fillRect(cx - 1, cy - 1, 3, 3)
      }
    }

    const drawRider = (r: Rider, hero: boolean) => {
      if (!r.alive) return
      if (hero && r.safe > 0 && Math.floor(t / 4) % 2) return // blink while protected after a respawn
      const frames = hero ? heroFrames : foeFrames
      const f = r.wing > 0 ? frames[0] : frames[1 + Math.floor(((Math.sin(t * 0.12 + r.x * 0.02) + 1) / 2) * 2.999)]
      b.save()
      b.translate(X(r.x), X(r.y))
      b.scale(r.dir, 1)
      b.drawImage(f.img, -f.ox, -f.oy)
      b.restore()
      // a glint running along the hero's sword, and a pulse on each sorcerer's orb
      if (hero && Math.floor(t / 20) % 3 === 0) glint(X(r.x + r.dir * 24 * SPRITE_SCALE), X(r.y - 16 * SPRITE_SCALE), 2)
      if (!hero && Math.sin(t * 0.15 + r.x) > 0.3) glint(X(r.x + r.dir * 12 * SPRITE_SCALE), X(r.y - 26 * SPRITE_SCALE), 1)
    }

    const drawSparks = () => {
      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08
        s.vx *= 0.97
        s.life--
        // sparks shrink, then blink out
        if (s.life < 10 && s.life % 2) continue
        b.fillStyle = s.color
        const n = s.size > 2.2 && s.life > s.max / 2 ? 2 : 1
        b.fillRect(X(s.x), X(s.y), n, n)
      }
      sparks = sparks.filter((s) => s.life > 0)
    }

    const place = (l: Label, worldY: number) => b.drawImage(l.img, 0, X(worldY) - l.base)

    const loop = () => {
      t++
      if (mode === 'play') {
        const dx = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0) + steer
        if (dx) {
          player.vx += 0.15 * Math.sign(dx)
          player.dir = Math.sign(dx)
        }
      } else if (mode === 'attract') demoAI()

      if (mode !== 'over') {
        physics(player)
        for (const e of enemies) {
          if (!e.alive) continue
          enemyAI(e)
          physics(e)
        }
        collide()
        if (player.y > LAVA_Y) loseLife()
        if (enemies.every((e) => !e.alive)) {
          wave++
          startWave()
        }
      }

      b.drawImage(backdrop, 0, 0)
      drawStars()
      drawCrystals()
      drawLava()
      enemies.forEach((e) => drawRider(e, false))
      drawRider(player, true)
      drawSparks()

      const top = H * 0.2
      if (mode === 'play') {
        place(caption(`Score ${score}`, 17, 'left'), 32)
        place(caption(`Wave ${wave}   ${'♥'.repeat(Math.max(0, lives))}`, 17, 'right'), 32)
      } else if (mode === 'attract') {
        const title = chrome('SkyRiders', 64)
        place(title, top)
        const swing = Math.floor(t / 30) % 2
        glint(Math.round(LW / 2 + title.half - 6), X(top - 46), swing ? 3 : 2)
        glint(Math.round(LW / 2 - title.half + 10), X(top - 6), swing ? 1 : 2)
        place(caption('of the Velvet Sunset', 22), top + 36)
        if (Math.floor(t / 40) % 2) place(caption('Press SPACE or tap to ride', 17), top + 76)
      } else {
        place(chrome('Game Over', 56), H * 0.38)
        place(caption(`Score ${score}  ·  tap or press SPACE`, 19), H * 0.38 + 46)
      }

      // scale the little buffer up to the screen with hard, square pixels
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(buffer, 0, 0, LW * pixel, LH * pixel)
      raf = requestAnimationFrame(loop)
    }

    const action = () => {
      audio ??= new AudioContext()
      if (mode !== 'play') {
        mode = 'play'
        reset()
        beep(440, 0.2, 'triangle')
      } else flap(player)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
      if (e.code === 'Space') {
        e.preventDefault()
        action()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }
    // On touch screens: tapping anywhere flaps, and holding the left or right third also steers that way.
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const fx = (e.clientX - rect.left) / rect.width
      steer = mode === 'play' ? (fx < 1 / 3 ? -1 : fx > 2 / 3 ? 1 : 0) : 0
      action()
    }
    const onPointerUp = () => {
      steer = 0
    }
    // Keep riders on screen if the window changes shape.
    const onResize = () => {
      fit()
      for (const r of [player, ...enemies]) {
        r.x = Math.min(r.x, W)
        r.y = Math.min(r.y, LAVA_Y - 60)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('resize', onResize)

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('resize', onResize)
      void audio?.close()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-label="SkyRiders of the Velvet Sunset, a small arcade game. Press space or tap to play."
      className={`touch-none select-none ${className}`}
    />
  )
}
