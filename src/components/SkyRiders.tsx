import { useEffect, useRef } from 'react'

// SkyRiders of the Velvet Sunset: an original flap-and-collide arcade game with a 70s van-mural sunset,
// drawn as a 16-bit pixel-art piece. A hero on a winged horse battles sorcerers on griffins above a molten lake.
// Whoever is higher when they meet wins. When nobody is playing it runs an attract mode where the hero flies itself.
//
// How the 16-bit look works: everything is drawn into a small low-resolution buffer (about 300 pixels tall on a
// wide screen), then scaled up with hard square pixels. The scenery, islands, clouds, sprites and lettering are
// painted once as shapes and then snapped to a fixed palette, with checkerboard dithering and one-pixel outlines.
// Stars, lava, lavafalls, sparks and glints are drawn pixel by pixel every frame.
//
// The game fills whatever box it is given. The game world is 500 units tall on wide screens and 400 units wide on
// tall ones, and stretches along the other side to match the screen, so nothing is cropped or letterboxed.

const GRAVITY = 0.22
const FLAP = -4.2
const SPRITE_SCALE = 1.45

type Rider = { x: number; y: number; vx: number; vy: number; dir: number; wing: number; alive: boolean; safe: number }
type Mode = 'attract' | 'play' | 'over'
type Platform = { x: number; y: number; w: number; rocks: number[] }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
type Star = { x: number; y: number; phase: number; burst: boolean }
type Frame = { img: HTMLCanvasElement; ox: number; oy: number }
type Label = { img: HTMLCanvasElement; base: number; half: number }
type Cloud = { img: HTMLCanvasElement; x: number; y: number; speed: number; w: number }
type Fall = { x: number; top: number }
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
  '#4a0218', '#14325a', '#1f6a8a', '#3d2a6a',
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

// Repeatable pseudo-random numbers, so the scenery looks the same on every visit.
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const linear = (c: Draw, y0: number, y1: number, stops: [number, string][]) => {
  const g = c.createLinearGradient(0, y0, 0, y1)
  for (const [at, col] of stops) g.addColorStop(at, col)
  return g
}

// ---- sprite art, drawn as shapes and then pixelated ----

// A feathered wing; `lift` raises it for a flap or lowers it for a glide. Each feather gets a darker edge.
const wing = (c: Draw, lift: number, light: string, dark: string, tip: string, edge: string) => {
  for (let k = 0; k < 5; k++) {
    const g = c.createLinearGradient(0, -4, -32, lift - 10)
    g.addColorStop(0, light)
    g.addColorStop(0.6, dark)
    g.addColorStop(1, tip)
    c.fillStyle = g
    c.beginPath()
    c.moveTo(5 - k * 3, -3)
    c.quadraticCurveTo(-6 - k * 4, lift - 20 + k * 4, -27 + k * 3.5, lift - 11 + k * 5.5)
    c.quadraticCurveTo(-10 - k * 2, lift - 2 + k * 3, 3 - k * 3, 2)
    c.closePath()
    c.fill()
    c.strokeStyle = edge
    c.lineWidth = 1.2
    c.stroke()
  }
  // the covert feathers along the top of the wing
  c.fillStyle = light
  c.beginPath()
  c.moveTo(6, -3)
  c.quadraticCurveTo(-4, lift - 12, -14, lift - 8)
  c.quadraticCurveTo(-4, lift - 2, 4, 2)
  c.closePath()
  c.fill()
}

// Hero: a white winged horse with a golden mane, a red saddle cloth and an armoured rider in a cyan cape.
const drawHero = (c: Draw, lift: number, gallop: number) => {
  // the far wing sits behind everything, in shadow
  c.save()
  c.translate(3, -2)
  wing(c, lift - 3, '#cdbfe0', '#a98cf0', '#8e2a7e', '#5a2a7a')
  c.restore()
  // tail
  c.lineCap = 'round'
  c.strokeStyle = '#e8b46a'
  c.lineWidth = 5
  c.beginPath()
  c.moveTo(-15, 1)
  c.quadraticCurveTo(-27, -3 + gallop, -33, 9)
  c.stroke()
  c.strokeStyle = '#ffe08a'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(-16, 0)
  c.quadraticCurveTo(-26, -4 + gallop, -31, 6)
  c.stroke()
  // far legs, darker
  c.strokeStyle = '#a98cf0'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(-10, 7)
  c.lineTo(-15, 13 + gallop)
  c.lineTo(-12, 17 + gallop)
  c.moveTo(10, 7)
  c.lineTo(15, 12 - gallop)
  c.lineTo(19, 13 - gallop)
  c.stroke()
  // body with a sheen on the shoulder and shade on the belly
  c.fillStyle = linear(c, -6, 12, [
    [0, '#ffffff'],
    [0.55, '#e8dcc8'],
    [1, '#a98cf0'],
  ])
  c.beginPath()
  c.ellipse(0, 3, 17, 8.5, 0, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = 'rgba(255,255,255,0.9)'
  c.beginPath()
  c.ellipse(7, 0, 6, 3, -0.3, 0, Math.PI * 2)
  c.fill()
  // neck and head
  c.fillStyle = linear(c, -16, 6, [
    [0, '#ffffff'],
    [1, '#e8dcc8'],
  ])
  c.beginPath()
  c.moveTo(10, -1)
  c.quadraticCurveTo(17, -10, 20, -15)
  c.lineTo(23, -17)
  c.lineTo(28, -12)
  c.quadraticCurveTo(30, -8, 26, -7)
  c.lineTo(21, -6)
  c.quadraticCurveTo(18, 2, 13, 6)
  c.closePath()
  c.fill()
  c.fillStyle = '#cdbfe0'
  c.beginPath()
  c.ellipse(27, -9, 2.6, 2.2, 0, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#ffffff'
  c.beginPath()
  c.moveTo(20, -15)
  c.lineTo(21, -21)
  c.lineTo(23, -16)
  c.fill()
  c.fillStyle = '#2b0a4a'
  c.fillRect(22, -13.5, 2.4, 2.4)
  // flowing mane in three locks
  const mane = ['#ffc65c', '#ffe08a', '#e8b46a']
  mane.forEach((col, i) => {
    c.strokeStyle = col
    c.lineWidth = 3
    c.beginPath()
    c.moveTo(21 - i * 2, -16 + i * 2)
    c.quadraticCurveTo(13 - i * 2, -14 + gallop * 0.5 + i * 3, 8 - i, -4 + i * 2)
    c.stroke()
  })
  // near legs with dark hooves
  c.strokeStyle = '#f4f0ff'
  c.lineWidth = 3.4
  c.beginPath()
  c.moveTo(-7, 8)
  c.lineTo(-11, 14 + gallop)
  c.lineTo(-8, 18 + gallop)
  c.moveTo(7, 8)
  c.lineTo(12, 13 - gallop)
  c.lineTo(16, 15 - gallop)
  c.stroke()
  c.fillStyle = '#3d2a6a'
  c.fillRect(-9.5, 17 + gallop, 4, 2.6)
  c.fillRect(15, 14 - gallop, 4, 2.6)
  // saddle cloth with gold trim
  c.fillStyle = '#c0102a'
  c.beginPath()
  c.moveTo(-8, -4)
  c.lineTo(7, -4)
  c.lineTo(5, 6)
  c.lineTo(-6, 6)
  c.closePath()
  c.fill()
  c.strokeStyle = '#ffc65c'
  c.lineWidth = 1.5
  c.beginPath()
  c.moveTo(-6, 6)
  c.lineTo(5, 6)
  c.stroke()
  // cape streaming behind the rider
  c.fillStyle = linear(c, -18, 0, [
    [0, '#29f0ff'],
    [1, '#2a6ad8'],
  ])
  c.beginPath()
  c.moveTo(-1, -17)
  c.quadraticCurveTo(-15, -15 + gallop, -27, -6 + gallop)
  c.lineTo(-22, -3 + gallop)
  c.quadraticCurveTo(-12, -6, 1, -6)
  c.closePath()
  c.fill()
  // armoured torso, belt and arm
  c.fillStyle = linear(c, -16, -4, [
    [0, '#c9fff6'],
    [0.5, '#9fdcff'],
    [1, '#5aa8ff'],
  ])
  c.fillRect(-3.5, -16, 8, 11)
  c.fillStyle = '#ffc65c'
  c.fillRect(-3.5, -7, 8, 2)
  c.strokeStyle = '#9fdcff'
  c.lineWidth = 2.6
  c.beginPath()
  c.moveTo(2, -13)
  c.lineTo(6, -9)
  c.stroke()
  // helmet with a visor slit and a pink plume
  c.fillStyle = linear(c, -24, -15, [
    [0, '#ffffff'],
    [1, '#8a9bc8'],
  ])
  c.beginPath()
  c.arc(1, -19, 4.8, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#2b0a4a'
  c.fillRect(1.5, -19.5, 4, 1.4)
  c.strokeStyle = '#ff3d7f'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(0, -23)
  c.quadraticCurveTo(-6, -29, -12, -24 + gallop * 0.5)
  c.stroke()
  // sword: gold crossguard and a long bright blade
  c.strokeStyle = '#ffc65c'
  c.lineWidth = 2.4
  c.beginPath()
  c.moveTo(6.5, -12.5)
  c.lineTo(5, -7)
  c.stroke()
  c.strokeStyle = '#f4f0ff'
  c.lineWidth = 2.4
  c.beginPath()
  c.moveTo(6, -10)
  c.lineTo(27, -17)
  c.stroke()
  c.strokeStyle = '#9fdcff'
  c.lineWidth = 0.9
  c.beginPath()
  c.moveTo(8, -10.2)
  c.lineTo(26, -16.4)
  c.stroke()
  // the near wing over the top
  wing(c, lift, '#ffffff', '#ffe08a', '#ff9de2', '#d7c4ff')
}

// Foe: a bronze griffin with a white feathered head and talons, ridden by a hooded sorcerer with a glowing staff.
const drawFoe = (c: Draw, lift: number) => {
  c.save()
  c.translate(3, -2)
  wing(c, lift - 3, '#9a5a2a', '#6b3d1c', '#4a1f10', '#4a1f10')
  c.restore()
  // lion tail with a dark tuft
  c.lineCap = 'round'
  c.strokeStyle = '#9a5a2a'
  c.lineWidth = 2.4
  c.beginPath()
  c.moveTo(-15, 2)
  c.quadraticCurveTo(-25, 8, -29, -2)
  c.stroke()
  c.fillStyle = '#4a1f10'
  c.beginPath()
  c.ellipse(-29, -3, 3, 2.4, 0.6, 0, Math.PI * 2)
  c.fill()
  // hind legs with paws
  c.strokeStyle = '#9a5a2a'
  c.lineWidth = 3.4
  c.beginPath()
  c.moveTo(-9, 7)
  c.lineTo(-13, 14)
  c.moveTo(-4, 8)
  c.lineTo(-6, 15)
  c.stroke()
  // body: tawny lion back blending into a feathered chest
  c.fillStyle = linear(c, -6, 12, [
    [0, '#e8b46a'],
    [0.6, '#d0964a'],
    [1, '#6b3d1c'],
  ])
  c.beginPath()
  c.ellipse(0, 3, 16, 8.5, 0, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#e8dcc8'
  c.beginPath()
  c.ellipse(11, 2, 7, 6.5, 0, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#cdbfe0'
  c.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    c.beginPath()
    c.arc(11, -1 + i * 3, 4, 0.2, Math.PI - 0.2)
    c.stroke()
  }
  // yellow talons reaching forward
  c.strokeStyle = '#ffc65c'
  c.lineWidth = 2.6
  c.beginPath()
  c.moveTo(12, 7)
  c.lineTo(17, 13)
  c.lineTo(21, 12)
  c.moveTo(8, 8)
  c.lineTo(11, 15)
  c.lineTo(15, 15)
  c.stroke()
  // eagle head, ear tufts and hooked beak
  c.fillStyle = linear(c, -13, 0, [
    [0, '#ffffff'],
    [1, '#e8dcc8'],
  ])
  c.beginPath()
  c.arc(16, -6, 6.5, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#d0964a'
  c.beginPath()
  c.moveTo(12, -10)
  c.lineTo(9, -17)
  c.lineTo(15, -12)
  c.fill()
  c.fillStyle = '#ffa94d'
  c.beginPath()
  c.moveTo(21, -9)
  c.quadraticCurveTo(29, -8, 26, -1)
  c.lineTo(21, -4)
  c.closePath()
  c.fill()
  c.fillStyle = '#c0102a'
  c.fillRect(16.5, -9, 2.6, 2.6)
  // sorcerer: crimson robe with a gold hem, sleeves and a deep hood with glowing eyes
  c.fillStyle = linear(c, -28, -2, [
    [0, '#ff3b6b'],
    [0.6, '#c0102a'],
    [1, '#6d0a2e'],
  ])
  c.beginPath()
  c.moveTo(0, -29)
  c.quadraticCurveTo(3, -22, 9, -3)
  c.lineTo(-8, -3)
  c.quadraticCurveTo(-3, -20, 0, -29)
  c.closePath()
  c.fill()
  c.strokeStyle = '#ffc65c'
  c.lineWidth = 1.6
  c.beginPath()
  c.moveTo(-8, -3.5)
  c.lineTo(9, -3.5)
  c.stroke()
  c.fillStyle = '#1a0629'
  c.beginPath()
  c.ellipse(1.5, -19, 3.4, 3.8, 0, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#29f0ff'
  c.fillRect(1.5, -20, 1.6, 1.6)
  c.fillRect(4, -20, 1.6, 1.6)
  c.strokeStyle = '#c0102a'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(2, -14)
  c.lineTo(7, -10)
  c.stroke()
  // a gnarled staff topped with a violet orb
  c.strokeStyle = '#4a1f10'
  c.lineWidth = 2.4
  c.beginPath()
  c.moveTo(6, -3)
  c.lineTo(10, -16)
  c.lineTo(12, -25)
  c.stroke()
  c.fillStyle = 'rgba(179,136,255,0.55)'
  c.beginPath()
  c.arc(12, -28, 6.5, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#b388ff'
  c.beginPath()
  c.arc(12, -28, 4, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#ffffff'
  c.fillRect(10.5, -30, 2.2, 2.2)
  wing(c, lift, '#e8b46a', '#9a5a2a', '#4a1f10', '#6b3d1c')
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
    let LW = 480 // buffer width and height in pixels
    let LH = 300
    let k = LH / H // world units to buffer pixels
    let pixel = 3 // screen pixels per buffer pixel
    let platforms: Platform[] = []
    let stars: Star[] = []
    let clouds: Cloud[] = []
    let falls: Fall[] = []
    let heroFrames: Frame[] = []
    let foeFrames: Frame[] = []
    const backdrop = document.createElement('canvas')
    const islands = document.createElement('canvas')
    const labels = new Map<string, Label>()

    const X = (wx: number) => Math.round(wx * k)

    // ---- the painted scenery behind everything, drawn once per screen size ----
    const paintBackdrop = () => {
      const c = backdrop.getContext('2d')
      if (!c) return
      c.setTransform(k, 0, 0, k, 0, 0)
      const horizon = LAVA_Y - 40
      const rand = seeded(11)

      // sky: deep space at the top, through violet and rose, to a gold glow at the horizon
      const sky = linear(c, 0, horizon, [
        [0, '#0d0221'],
        [0.18, '#2b0a4a'],
        [0.36, '#4e1a72'],
        [0.55, '#8e2a7e'],
        [0.7, '#d4508a'],
        [0.8, '#e8506a'],
        [0.9, '#ff8a3d'],
        [1, '#ffc65c'],
      ])
      c.fillStyle = sky
      c.fillRect(0, 0, W, H)

      // nebula clouds in the high sky
      const blob = (fx: number, fy: number, r: number, col: string) => {
        c.save()
        c.translate(fx * W, fy * H)
        c.scale(1.6, 0.6)
        const g = c.createRadialGradient(0, 0, 0, 0, 0, r)
        g.addColorStop(0, col)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        c.fillStyle = g
        c.fillRect(-r, -r, r * 2, r * 2)
        c.restore()
      }
      blob(0.28, 0.1, 160, 'rgba(255,61,127,0.28)')
      blob(0.62, 0.06, 140, 'rgba(41,240,255,0.16)')
      blob(0.5, 0.2, 120, 'rgba(179,136,255,0.24)')
      blob(0.85, 0.24, 100, 'rgba(255,61,127,0.18)')

      // an aurora ribbon rippling across the sky
      for (const [col, off, width] of [
        ['rgba(41,240,255,0.16)', 0, 18],
        ['rgba(255,157,226,0.14)', 10, 10],
      ] as [string, number, number][]) {
        c.strokeStyle = col
        c.lineWidth = width
        c.beginPath()
        for (let x = -20; x <= W + 20; x += 8) {
          const y = H * 0.16 + off + Math.sin(x * 0.012) * 18 + Math.sin(x * 0.031) * 7
          if (x === -20) c.moveTo(x, y)
          else c.lineTo(x, y)
        }
        c.stroke()
      }

      // the sun: rays fanning up from it, halo rings, then the striped disc
      const sunR = Math.min(W, H) * 0.24
      const sunX = W / 2
      const sunY = horizon - sunR * 0.35
      c.save()
      c.beginPath()
      c.rect(0, 0, W, horizon)
      c.clip()
      for (let i = 0; i < 14; i++) {
        const a0 = Math.PI + (i / 14) * Math.PI
        const a1 = a0 + Math.PI / 30
        c.fillStyle = i % 2 ? 'rgba(255,214,140,0.1)' : 'rgba(255,157,226,0.06)'
        c.beginPath()
        c.moveTo(sunX, sunY)
        c.lineTo(sunX + Math.cos(a0) * W, sunY + Math.sin(a0) * W)
        c.lineTo(sunX + Math.cos(a1) * W, sunY + Math.sin(a1) * W)
        c.closePath()
        c.fill()
      }
      c.restore()
      const halo = c.createRadialGradient(sunX, sunY, sunR * 0.6, sunX, sunY, sunR * 2.4)
      halo.addColorStop(0, 'rgba(255,200,120,0.6)')
      halo.addColorStop(1, 'rgba(255,110,120,0)')
      c.fillStyle = halo
      c.fillRect(0, 0, W, H)
      for (const [rr, a] of [
        [1.22, 0.22],
        [1.45, 0.14],
        [1.72, 0.09],
      ]) {
        c.strokeStyle = `rgba(255,230,170,${a})`
        c.lineWidth = 5
        c.beginPath()
        c.arc(sunX, sunY, sunR * rr, 0, Math.PI * 2)
        c.stroke()
      }
      c.save()
      c.beginPath()
      c.arc(sunX, sunY, sunR, 0, Math.PI * 2)
      c.clip()
      c.fillStyle = linear(c, sunY - sunR, sunY + sunR, [
        [0, '#fff6c8'],
        [0.4, '#ffe08a'],
        [0.6, '#ffc65c'],
        [0.8, '#ff8a3d'],
        [1, '#ff3d7f'],
      ])
      c.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2)
      // stripes across the sun, thicker and closer together toward the bottom, in whole buffer pixels
      c.fillStyle = '#d4508a'
      for (let i = 0, y = sunY - sunR * 0.72; i < 8 && y < sunY + sunR; i++) {
        const rows = 1 + Math.floor(i / 2)
        c.fillRect(sunX - sunR, Math.round(y * k) / k, sunR * 2, rows / k)
        y += (rows + Math.max(2, 5 - i)) / k
      }
      c.restore()

      // a banded gas planet with a tilted ring, and a cratered moon
      const px = W * 0.8
      const py = H * 0.16
      const pr = 32
      c.save()
      c.translate(px, py)
      c.rotate(-0.35)
      c.strokeStyle = '#c46a8a'
      c.lineWidth = 6
      c.beginPath()
      c.ellipse(0, 0, pr * 2.05, pr * 0.42, 0, Math.PI, Math.PI * 2)
      c.stroke()
      c.save()
      c.beginPath()
      c.arc(0, 0, pr, 0, Math.PI * 2)
      c.clip()
      const pg = c.createRadialGradient(-pr * 0.4, -pr * 0.45, pr * 0.1, 0, 0, pr)
      pg.addColorStop(0, '#f4f0ff')
      pg.addColorStop(0.5, '#a9b8ff')
      pg.addColorStop(1, '#4b3a8f')
      c.fillStyle = pg
      c.fillRect(-pr, -pr, pr * 2, pr * 2)
      for (const [y, h, col] of [
        [-14, 4, 'rgba(255,157,226,0.45)'],
        [-4, 6, 'rgba(75,58,143,0.45)'],
        [6, 3, 'rgba(255,157,226,0.35)'],
        [13, 5, 'rgba(61,42,106,0.5)'],
      ] as [number, number, string][]) {
        c.fillStyle = col
        c.fillRect(-pr, y, pr * 2, h)
      }
      // the night side
      const shade = c.createLinearGradient(-pr, 0, pr, 0)
      shade.addColorStop(0.45, 'rgba(13,2,33,0)')
      shade.addColorStop(1, 'rgba(13,2,33,0.55)')
      c.fillStyle = shade
      c.fillRect(-pr, -pr, pr * 2, pr * 2)
      c.restore()
      c.strokeStyle = '#ffc65c'
      c.lineWidth = 6
      c.beginPath()
      c.ellipse(0, 0, pr * 2.05, pr * 0.42, 0, 0, Math.PI)
      c.stroke()
      c.strokeStyle = '#ffe08a'
      c.lineWidth = 2
      c.beginPath()
      c.ellipse(0, 0, pr * 1.8, pr * 0.34, 0, 0.2, Math.PI - 0.2)
      c.stroke()
      c.restore()
      const mx = W * 0.14
      const my = H * 0.12
      const mg = c.createRadialGradient(mx - 5, my - 5, 1, mx, my, 14)
      mg.addColorStop(0, '#ffffff')
      mg.addColorStop(0.6, '#d7c4ff')
      mg.addColorStop(1, '#8a4f9e')
      c.fillStyle = mg
      c.beginPath()
      c.arc(mx, my, 14, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = 'rgba(138,79,158,0.7)'
      for (const [dx, dy, r] of [
        [-4, 2, 3],
        [4, -3, 2.2],
        [3, 6, 2],
      ]) {
        c.beginPath()
        c.arc(mx + dx, my + dy, r, 0, Math.PI * 2)
        c.fill()
      }

      // mountain ranges: a lit side facing the sun, a shaded side away from it, rock streaks and a glowing rim
      const range = (
        seed: number,
        base: number,
        height: number,
        step: number,
        colours: { top: string; low: string; shade: string; rim: string; streak?: string },
      ) => {
        const r = seeded(seed)
        const pts: [number, number][] = []
        let i = 0
        for (let x = -step; x <= W + step; x += step / 2, i++) {
          const peak = i % 2 === 0
          pts.push([x + (r() - 0.5) * step * 0.3, base - height * (peak ? 0.55 + r() * 0.45 : 0.25 + r() * 0.3)])
        }
        c.fillStyle = linear(c, base - height, base, [
          [0, colours.top],
          [1, colours.low],
        ])
        c.beginPath()
        c.moveTo(-step, H)
        for (const [x, y] of pts) c.lineTo(x, y)
        c.lineTo(W + step, H)
        c.closePath()
        c.fill()
        for (let j = 0; j < pts.length; j += 2) {
          const [x, y] = pts[j]
          // the side facing away from the sun falls into shadow
          const away = x < W / 2 ? pts[j - 1] : pts[j + 1]
          if (!away) continue
          c.fillStyle = colours.shade
          c.beginPath()
          c.moveTo(x, y)
          c.lineTo(away[0], away[1])
          c.lineTo(away[0], H)
          c.lineTo(x, H)
          c.closePath()
          c.fill()
          if (colours.streak) {
            c.strokeStyle = colours.streak
            c.lineWidth = 1 / k
            for (let s = 0; s < 3; s++) {
              const sx = x + (r() - 0.5) * step * 0.4
              const sy = y + 6 + r() * 10
              c.beginPath()
              c.moveTo(sx, sy)
              c.lineTo(sx + (r() - 0.5) * 14, sy + 14 + r() * 22)
              c.stroke()
            }
          }
        }
        c.strokeStyle = colours.rim
        c.lineWidth = 1.4 / k
        c.beginPath()
        pts.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y)))
        c.stroke()
        return pts
      }
      const farthest = range(2, horizon - 4, 125, 130, { top: '#c46a8a', low: '#e8506a', shade: 'rgba(160,90,152,0.35)', rim: '#ffc65c' })

      // a castle on the far ridge, its towers lit by the sunset
      const castleX = W * 0.86
      let ridge = horizon
      for (let j = 1; j < farthest.length; j++) {
        const [x0, y0] = farthest[j - 1]
        const [x1, y1] = farthest[j]
        if (castleX >= x0 && castleX <= x1) ridge = y0 + ((castleX - x0) / (x1 - x0)) * (y1 - y0)
      }
      const towers: [number, number, number][] = [
        [-16, 26, 6],
        [-6, 40, 7],
        [5, 32, 6],
        [14, 22, 5],
      ]
      c.fillStyle = '#a05a98'
      c.fillRect(castleX - 18, ridge - 14, 36, 18)
      for (const [dx, h, w] of towers) {
        c.fillStyle = '#a05a98'
        c.fillRect(castleX + dx - w / 2, ridge - h, w, h)
        c.fillStyle = '#8e2a7e'
        c.beginPath()
        c.moveTo(castleX + dx - w / 2 - 1.5, ridge - h)
        c.lineTo(castleX + dx, ridge - h - w * 1.6)
        c.lineTo(castleX + dx + w / 2 + 1.5, ridge - h)
        c.fill()
      }

      range(4, horizon + 8, 95, 90, {
        top: '#8a4f9e',
        low: '#b03a86',
        shade: 'rgba(78,26,114,0.45)',
        rim: '#ff8a3d',
        streak: 'rgba(78,26,114,0.6)',
      })
      const near = range(6, LAVA_Y + 6, 68, 70, {
        top: '#3b0f5c',
        low: '#1a0629',
        shade: 'rgba(13,2,33,0.5)',
        rim: '#ff6f5a',
        streak: 'rgba(106,42,134,0.8)',
      })

      // lavafalls pour from two clefts in the near range (drawn each frame, so just remember where)
      const clefts = near.filter((_, j) => j % 2 === 1).filter(([x]) => x > W * 0.12 && x < W * 0.88 && Math.abs(x - W / 2) > W * 0.08)
      falls = [clefts[1], clefts[clefts.length - 2]].filter(Boolean).map(([x, y]) => ({ x, top: y }))

      // dark spires rising from the lava at both edges, lit from below
      for (const side of [0, 1]) {
        const flip = (x: number) => (side ? W - x : x)
        const pts: [number, number][] = [
          [-4, LAVA_Y + 10],
          [-4, LAVA_Y - 150],
          [10, LAVA_Y - 168],
          [22, LAVA_Y - 120],
          [30, LAVA_Y - 128],
          [42, LAVA_Y - 60],
          [52, LAVA_Y + 10],
        ]
        c.fillStyle = linear(c, LAVA_Y - 170, LAVA_Y, [
          [0, '#2b0a4a'],
          [0.7, '#1a0629'],
          [1, '#6d0a2e'],
        ])
        c.beginPath()
        pts.forEach(([x, y], j) => (j ? c.lineTo(flip(x), y) : c.moveTo(flip(x), y)))
        c.closePath()
        c.fill()
        c.strokeStyle = '#ff6f5a'
        c.lineWidth = 1.4 / k
        c.beginPath()
        c.moveTo(flip(30), LAVA_Y - 128)
        c.lineTo(flip(42), LAVA_Y - 60)
        c.lineTo(flip(52), LAVA_Y + 10)
        c.stroke()
        // crystals growing from the tips
        c.fillStyle = '#29f0ff'
        for (const [x, y, h] of [
          [10, LAVA_Y - 168, 16],
          [30, LAVA_Y - 128, 11],
        ]) {
          c.beginPath()
          c.moveTo(flip(x - 3), y + 2)
          c.lineTo(flip(x), y - h)
          c.lineTo(flip(x + 3), y + 2)
          c.fill()
        }
      }

      c.setTransform(1, 0, 0, 1, 0, 0)
      quantize(backdrop, 40, false)

      // single-pixel details added after pixelating, so they stay crisp
      const img = c.getImageData(0, 0, LW, LH)
      const dark = (x: number, y: number) => {
        const i = (y * LW + x) * 4
        return img.data[i] + img.data[i + 1] + img.data[i + 2] < 260
      }
      // a dust of faint background stars, only where the sky is dark
      for (let s = 0; s < LW * LH * 0.004; s++) {
        const x = Math.floor(rand() * LW)
        const y = Math.floor(rand() * LH * 0.5)
        if (!dark(x, y)) continue
        c.fillStyle = rand() < 0.25 ? '#a98cf0' : '#6a2a86'
        c.fillRect(x, y, 1, 1)
      }
      // lit windows in the castle towers
      c.fillStyle = '#ffe08a'
      for (const [dx, h] of towers) {
        for (let wy = 0; wy < 2; wy++) c.fillRect(X(castleX + dx), X(ridge - h + 6 + wy * 10), 1, 1)
      }
      c.fillRect(X(castleX - 10), X(ridge - 7), 1, 1)
      c.fillRect(X(castleX + 9), X(ridge - 7), 1, 1)
    }

    // ---- floating islands, painted as their own layer so the clouds can drift behind them ----
    const paintIslands = () => {
      const c = islands.getContext('2d')
      if (!c) return
      c.clearRect(0, 0, LW, LH)
      c.setTransform(k, 0, 0, k, 0, 0)
      for (const p of platforms) {
        const r = seeded(Math.round(p.x * 13 + p.y))
        const depth = 34
        // the rock outline: a jagged wedge hanging below the top
        const rock: [number, number][] = [[p.x - 2, p.y + 6]]
        const n = p.rocks.length
        for (let i = 0; i < n; i++) {
          const fx = (i + 0.5) / n
          const centre = 1 - Math.abs(fx - 0.5) * 2
          rock.push([p.x + fx * p.w, p.y + 9 + (depth - 9) * centre * (0.45 + p.rocks[i] * 0.55)])
        }
        rock.push([p.x + p.w + 2, p.y + 6])
        c.save()
        c.beginPath()
        rock.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
        c.closePath()
        c.fillStyle = linear(c, p.y, p.y + depth, [
          [0, '#8a4f9e'],
          [0.5, '#5a2a7a'],
          [1, '#2b0a4a'],
        ])
        c.fill()
        c.clip()
        // layered strata and cracks
        for (let y = p.y + 10, band = 0; y < p.y + depth; y += 5, band++) {
          c.fillStyle = band % 2 ? 'rgba(26,6,41,0.35)' : 'rgba(255,157,226,0.12)'
          c.fillRect(p.x - 4, y, p.w + 8, 2.4)
        }
        c.strokeStyle = 'rgba(26,6,41,0.7)'
        c.lineWidth = 1 / k
        for (let i = 0; i < 4; i++) {
          const x = p.x + r() * p.w
          c.beginPath()
          c.moveTo(x, p.y + 8)
          c.lineTo(x + (r() - 0.5) * 10, p.y + 16 + r() * 10)
          c.stroke()
        }
        // sunset light catching the side facing the sun
        c.fillStyle = 'rgba(255,138,61,0.35)'
        const lit = p.x + p.w / 2 < W / 2 ? p.x + p.w * 0.6 : p.x
        c.fillRect(lit, p.y + 6, p.w * 0.4, depth)
        c.restore()
        // glowing roots trailing down
        c.lineWidth = 1.2 / k
        for (let i = 0; i < 4; i++) {
          const rx = p.x + p.w * (0.15 + r() * 0.7)
          const fx = (rx - p.x) / p.w
          const bottom = p.y + 9 + (depth - 9) * (1 - Math.abs(fx - 0.5) * 2) * 0.5
          const len = 10 + r() * 16
          c.strokeStyle = '#1f6a8a'
          c.beginPath()
          c.moveTo(rx, bottom)
          c.quadraticCurveTo(rx + (r() - 0.5) * 8, bottom + len * 0.5, rx + (r() - 0.5) * 6, bottom + len)
          c.stroke()
          c.fillStyle = '#29f0ff'
          c.fillRect(rx - 1, bottom + len - 1, 2.2 / k, 2.2 / k)
        }
        // the polished top, with seams on its front face
        c.fillStyle = linear(c, p.y, p.y + 10, [
          [0, '#ffffff'],
          [0.3, '#d7c4ff'],
          [0.7, '#a98cf0'],
          [1, '#7a52b8'],
        ])
        c.beginPath()
        c.roundRect(p.x - 3, p.y, p.w + 6, 10, 3)
        c.fill()
        c.strokeStyle = '#7a52b8'
        c.lineWidth = 1 / k
        for (let x = p.x + 10 + r() * 6; x < p.x + p.w - 4; x += 14 + r() * 8) {
          c.beginPath()
          c.moveTo(x, p.y + 4)
          c.lineTo(x, p.y + 10)
          c.stroke()
        }
        // a cluster of crystals standing on one end
        const cx = p.x + (p.x + p.w / 2 < W / 2 ? p.w - 12 : 10)
        for (const [dx, h, col] of [
          [-4, 9, '#1fb8e0'],
          [0, 14, '#29f0ff'],
          [4, 7, '#c9fff6'],
        ] as [number, number, string][]) {
          c.fillStyle = col
          c.beginPath()
          c.moveTo(cx + dx - 2.4, p.y + 1)
          c.lineTo(cx + dx, p.y - h)
          c.lineTo(cx + dx + 2.4, p.y + 1)
          c.fill()
        }
      }
      c.setTransform(1, 0, 0, 1, 0, 0)
      quantize(islands, 14, true)
      // a bright pixel line along each top edge
      c.fillStyle = '#ffffff'
      for (const p of platforms) c.fillRect(X(p.x - 1), X(p.y) + 1, X(p.w + 2), 1)
    }

    // ---- drifting clouds lit from below by the sunset ----
    const makeClouds = () => {
      const horizon = LAVA_Y - 40
      const r = seeded(23)
      clouds = Array.from({ length: Math.max(4, Math.round(W / 130)) }, () => {
        const w = 70 + r() * 90
        const h = 16 + r() * 10
        const cv = document.createElement('canvas')
        cv.width = Math.ceil((w + 10) * k)
        cv.height = Math.ceil((h + 10) * k)
        const c = cv.getContext('2d')
        if (c) {
          c.setTransform(k, 0, 0, k, 5 * k, 5 * k)
          c.fillStyle = linear(c, 0, h, [
            [0, '#6a2a86'],
            [0.45, '#b03a86'],
            [0.75, '#ff6f5a'],
            [1, '#ffc65c'],
          ])
          c.beginPath()
          const puffs = 4 + Math.floor(r() * 3)
          for (let i = 0; i < puffs; i++) {
            const fx = (i + 0.5) / puffs
            const pr = h * (0.35 + (1 - Math.abs(fx - 0.5) * 2) * 0.35 + r() * 0.1)
            c.moveTo(fx * w + pr, h - pr * 0.9)
            c.arc(fx * w, h - pr * 0.9, pr, 0, Math.PI * 2)
          }
          c.rect(w * 0.08, h * 0.55, w * 0.84, h * 0.45)
          c.fill()
        }
        quantize(cv, 26, false)
        return { img: cv, x: r() * W, y: H * 0.2 + r() * Math.max(10, horizon - 190 - H * 0.2), speed: 0.04 + r() * 0.06, w: w + 10 }
      })
    }

    // Sprites are drawn as shapes into a small canvas at buffer resolution, then pixelated with an outline.
    const makeFrame = (draw: (c: Draw) => void): Frame => {
      const sc = k * SPRITE_SCALE
      const cv = document.createElement('canvas')
      cv.width = Math.ceil(100 * sc) + 2
      cv.height = Math.ceil(84 * sc) + 2
      const ox = Math.round(52 * sc) + 1
      const oy = Math.round(50 * sc) + 1
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
      pixel = Math.max(2, Math.round(wide ? ch / 290 : cw / 200))
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
      for (const cv of [buffer, backdrop, islands]) {
        cv.width = LW
        cv.height = LH
      }
      labels.clear()
      paintBackdrop()
      paintIslands()
      makeClouds()
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

    const drawClouds = () => {
      for (const cl of clouds) {
        cl.x += cl.speed
        if (cl.x > W + 10) cl.x = -cl.w
        b.drawImage(cl.img, X(cl.x), X(cl.y))
      }
    }

    // molten rock pouring down from the clefts in the near mountains
    const FALL_COLOURS = ['#fff6c8', '#ffe08a', '#ffa94d', '#ff8a3d', '#ff5a1f', '#ffa94d']
    const drawFalls = () => {
      for (const f of falls) {
        const x0 = X(f.x) - 2
        const top = X(f.top)
        const bottom = X(LAVA_Y)
        for (let y = top; y < bottom; y++) {
          for (let dx = 0; dx < 5; dx++) {
            const phase = (y * 2 - t + dx * 5) >> 2
            b.fillStyle = dx === 2 ? FALL_COLOURS[((phase % 4) + 4) % 4] : FALL_COLOURS[(((phase + dx) % 6) + 6) % 6]
            b.fillRect(x0 + dx, y, 1, 1)
          }
          // the fall widens a little as it drops
          if (y > top + (bottom - top) * 0.6 && (y + (t >> 2)) % 3 === 0) {
            b.fillStyle = '#ff5a1f'
            b.fillRect(x0 - 1, y, 1, 1)
            b.fillRect(x0 + 5, y, 1, 1)
          }
        }
        // a splash where it meets the lake
        b.fillStyle = (t >> 3) % 2 ? '#fff6c8' : '#ffe08a'
        b.fillRect(x0 - 2, bottom - 1 - ((t >> 2) % 2), 1, 1)
        b.fillRect(x0 + 6, bottom - 2 + ((t >> 2) % 2), 1, 1)
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
      for (let x = 0; x < LW; x++) if ((x * 7 + (t >> 2)) % 11 === 0) b.fillRect(x, surfaceY[x] - 2 - ((x + (t >> 3)) % 3), 1, 1)
      let depth = 0
      for (const [col, len] of LAVA_BANDS) {
        b.fillStyle = col
        for (let x = 0; x < LW; x++) b.fillRect(x, surfaceY[x] + depth, 1, len)
        // a checkerboard row where each band meets the next, the 16-bit way to blend
        if (len < 99) for (let x = (depth + (t >> 4)) & 1; x < LW; x += 2) b.fillRect(x, surfaceY[x] + depth + len, 1, 1)
        depth += len
      }
      // bright currents sliding along under the crust
      b.fillStyle = '#ffa94d'
      for (let i = 0; i < 8; i++) {
        const cx = Math.floor(((i * 97 + t * (0.3 + (i % 3) * 0.15)) % (LW + 30)) - 15)
        const row = 6 + (i % 4) * 3
        for (let dx = 0; dx < 6 + (i % 3) * 3; dx++) {
          const x = cx + dx
          if (x >= 0 && x < LW) b.fillRect(x, surfaceY[x] + row, 1, 1)
        }
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

    // the crystal under each island pulses
    const drawCrystals = () => {
      for (const p of platforms) {
        const cx = X(p.x + p.w * (0.3 + p.rocks[0] * 0.4))
        const cy = X(p.y + 18)
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
      if (hero && Math.floor(t / 20) % 3 === 0) glint(X(r.x + r.dir * 27 * SPRITE_SCALE), X(r.y - 17 * SPRITE_SCALE), 2)
      if (!hero && Math.sin(t * 0.15 + r.x) > 0.3) glint(X(r.x + r.dir * 12 * SPRITE_SCALE), X(r.y - 28 * SPRITE_SCALE), 1)
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
      drawClouds()
      drawFalls()
      b.drawImage(islands, 0, 0)
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
