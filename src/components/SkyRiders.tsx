import { useEffect, useRef } from 'react'

// SkyRiders of the Velvet Sunset: an original flap-and-collide arcade game with a 70s van-mural sunset,
// drawn as a 16-bit pixel-art piece. A hero on a winged horse battles sorcerers on griffins above a molten lake.
// Whoever is higher when they meet wins. When nobody is playing it runs an attract mode where the hero flies itself.
//
// How the 16-bit look works: everything is drawn into a small buffer at a low fixed resolution (LINES tall on a
// wide screen), then scaled up with hard square pixels. The scenery, islands, clouds, sprites and lettering are
// painted once as shapes and then snapped to a fixed palette, with checkerboard dithering and one-pixel outlines.
// Stars, lava, lavafalls, sparks and glints are drawn pixel by pixel every frame.
// On top of that sit the touches a game made today would add: parallax scenery that slides as the hero moves,
// bloom and pools of light (drawn at the same console resolution, so they stay chunky), slowly turning light shafts, a colour grade, screen shake,
// a short freeze on hits, score popups and a shine sweeping across the logo.
//
// The game fills whatever box it is given. The game world is 500 units tall on wide screens and 400 units wide on
// tall ones, and stretches along the other side to match the screen, so nothing is cropped or letterboxed.

const GRAVITY = 0.22
const FLAP = -4.2
const SPRITE_SCALE = 1.35
// where a rider's hooves or paws are, and how close two riders must be to clash, both follow the drawn size
const FOOT = Math.round(17 * SPRITE_SCALE)
const REACH = Math.round(22 * SPRITE_SCALE)
// How many lines tall the picture is. Fewer lines means bigger, chunkier pixels on screen.
const LINES = 168

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

// The fixed 32-colour palette everything snaps to, like the limited colour sets of 16-bit consoles.
const PALETTE = [
  '#0d0221', '#1a0629', '#2b0a4a', '#3b0f5c', '#5a2a7a', '#8e2a7e', '#b03a86', '#d4508a',
  '#ff6f5a', '#ff8a3d', '#ffc65c', '#ffe08a', '#fff6c8', '#ffffff', '#c46a8a', '#8a4f9e',
  '#7a52b8', '#a98cf0', '#d7c4ff', '#9fdcff', '#2a6ad8', '#29f0ff', '#1f6a8a', '#e8b46a',
  '#9a5a2a', '#4a1f10', '#ff3b6b', '#c0102a', '#6d0a2e', '#e8dcc8', '#4b3a8f', '#ff5a1f',
]
const rgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const PAL = PALETTE.map(rgb)
const OUTLINE = rgb('#1a0629')
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

const nearest = (r: number, g: number, b: number, pal: number[][] = PAL) => {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < pal.length; i++) {
    const [pr, pg, pb] = pal[i]
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
const quantize = (cv: HTMLCanvasElement, dither: number, outline: boolean, pal: number[][] = PAL) => {
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
        best = nearest(r, gg, b, pal)
        memo.set(key, best)
      }
      const c = pal[best]
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

// Each character has its own small palette, the way 16-bit sprites did: muted, earthy, realistic colours.
const HERO_PAL = [
  '#0d0b10', '#1b1d24', '#30343f', '#4c5262', '#6e7587', '#959caf', '#c3c8d4', '#eef0f4', // steel and shadow
  '#e9e4d8', '#d8d2c6', '#b5ab9c', '#8c8273', '#5f574d', '#3d3731', // dapple-grey coat and wing feathers
  '#c9a46a', '#a07c45', '#6e5430', '#4a2e1c', '#6b4428', // mane, tack and leather
  '#1d3f46', '#2f6670', '#5a9496', // weathered teal cape
  '#5a1620', '#80222c', '#c8a24a', // burgundy cloth, plume and gold trim
].map(rgb)
const FOE_PAL = [
  '#0d0607', '#1c1210', '#2e1d16', '#45291b', '#5e3a22', '#7a4e2c', '#94653a', '#ad7f4c', '#c79c63', '#dcbc85',
  '#efd9a8', // eagle plumage and lion coat
  '#3a2a24', '#5a4a40', '#8a7a68', '#b8a090', // horn, bone and ash
  '#c9a227', '#e0b84a', // amber eye and cere
  '#14080a', '#2a0a0e', '#4a1218', '#6e1c22', // the sorcerer's near-black crimson robe
  '#2f6a60', '#7fd6c2', '#d8fff4', // a dim, sickly glow
].map(rgb)

// The finishing pass for a sprite: the lava lights every bottom edge hard from below, and a dark edge
// runs along the underside and sides only, not across the top, so the figure isn't boxed in by a cartoon outline.
const finishSprite = (cv: HTMLCanvasElement, rim: string, edge: string) => {
  const g = cv.getContext('2d')
  const { width: w, height: h } = cv
  if (!g || !w || !h) return
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  const solid = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) solid[i] = d[i * 4 + 3] > 0 ? 1 : 0
  const R = rgb(rim)
  const E = rgb(edge)
  const set = (p: number, c: number[]) => {
    d[p * 4] = c[0]
    d[p * 4 + 1] = c[1]
    d[p * 4 + 2] = c[2]
    d[p * 4 + 3] = 255
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      if (solid[p]) {
        // the true underside of the figure catches the lava's light: only where open air lies below,
        // not the small gaps between feathers
        let open = true
        for (let dy = 1; dy <= 4 && y + dy < h; dy++) if (solid[p + dy * w]) open = false
        if (open) set(p, R)
        continue
      }
      const below = y > 0 && solid[p - w] // this empty pixel sits just under the figure
      const beside = (x > 0 && solid[p - 1]) || (x < w - 1 && solid[p + 1])
      if (below || beside) set(p, E)
    }
  }
  g.putImageData(img, 0, 0)
}

// Repeatable pseudo-random numbers, so the scenery looks the same on every visit.
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// A natural ridgeline by midpoint displacement: n + 1 heights from 0 to 1, rougher as `rough` rises.
const ridgeLine = (seed: number, n: number, rough: number) => {
  const r = seeded(seed)
  const a = new Array<number>(n + 1).fill(0)
  a[0] = r()
  a[n] = r()
  let step = n
  let amp = 1
  while (step > 1) {
    const half = step / 2
    for (let i = half; i < n; i += step) a[i] = (a[i - half] + a[i + half]) / 2 + (r() - 0.5) * amp
    amp *= rough
    step = half
  }
  const lo = Math.min(...a)
  const hi = Math.max(...a)
  return a.map((v) => (v - lo) / (hi - lo || 1))
}

const mix = (a: number[], b: number[], f: number) => a.map((v, i) => Math.round(v + (b[i] - v) * f))
const css = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`

const linear = (c: Draw, y0: number, y1: number, stops: [number, string][]) => {
  const g = c.createLinearGradient(0, y0, 0, y1)
  for (const [at, col] of stops) g.addColorStop(at, col)
  return g
}

// ---- sprite art, drawn as shapes and then pixelated ----

// A great feathered wing: layered coverts near the shoulder, barred secondaries along the trailing edge, and long
// primaries splayed into separate "fingers" at the tip. `lift` raises it for the downstroke or lowers it to glide.
type WingTone = { primary: string; secondary: string; covert: string; bar: string; edge: string }
const bigWing = (c: Draw, lift: number, tone: WingTone, span = 1) => {
  const sx = 5
  const sy = -4 // shoulder
  const wx = -12 * span
  const wy = lift * 1.15 - 7 // wrist
  // primaries: six long flight feathers fanning out from the wrist
  for (let i = 5; i >= 0; i--) {
    const bx = wx + i * 1.7
    const by = wy + i * 1.4
    const tx = wx - 19 * span + i * 3.6
    const ty = wy - 6 + i * 4.4
    c.fillStyle = tone.primary
    c.beginPath()
    c.moveTo(bx, by - 1.3)
    c.quadraticCurveTo((bx + tx) / 2, (by + ty) / 2 - 2.2, tx, ty)
    c.quadraticCurveTo((bx + tx) / 2 + 1.2, (by + ty) / 2 + 1.4, bx + 1.6, by + 1.3)
    c.closePath()
    c.fill()
    c.strokeStyle = tone.bar
    c.lineWidth = 0.9
    c.beginPath()
    c.moveTo(bx + 0.8, by)
    c.lineTo((bx + tx) / 2, (by + ty) / 2)
    c.stroke()
  }
  // secondaries: the broad inner wing, its trailing edge scalloped feather by feather
  c.fillStyle = tone.secondary
  c.beginPath()
  c.moveTo(sx, sy)
  c.lineTo(wx, wy)
  c.lineTo(wx + 1, wy + 10)
  for (let i = 1; i <= 5; i++) {
    const f = i / 5
    const x = wx + 1 + (-3 - (wx + 1)) * f
    const y = wy + 10 + (5 - (wy + 10)) * f
    c.quadraticCurveTo(x - 1.5, y + 2.2, x, y)
  }
  c.lineTo(3, 3)
  c.closePath()
  c.fill()
  c.strokeStyle = tone.bar
  c.lineWidth = 1
  for (let i = 1; i <= 3; i++) {
    const f = i / 4
    c.beginPath()
    c.moveTo(sx - 2, sy + 4 * f + 1)
    c.lineTo(wx + 1, wy + 10 * f)
    c.stroke()
  }
  // coverts: the smaller feathers lying over the front of the wing
  c.fillStyle = tone.covert
  c.beginPath()
  c.moveTo(sx, sy)
  c.lineTo(wx, wy)
  c.lineTo(wx + 2.5, wy + 4.5)
  c.quadraticCurveTo(-3, (sy + wy) / 2 + 4.5, 3, 0.5)
  c.closePath()
  c.fill()
  c.strokeStyle = tone.edge
  c.lineWidth = 1.1
  c.beginPath()
  c.moveTo(sx, sy)
  c.lineTo(wx, wy)
  c.stroke()
}

// Hero: a knight in weathered plate and a great helm, on a dapple-grey warhorse with great grey-shaded wings.
const drawHero = (c: Draw, lift: number, gallop: number) => {
  c.lineCap = 'round'
  c.lineJoin = 'round'
  // the far wing, in shadow
  c.save()
  c.translate(3, -3)
  bigWing(c, lift - 3, { primary: '#3d3731', secondary: '#5f574d', covert: '#8c8273', bar: '#1b1d24', edge: '#b5ab9c' })
  c.restore()
  // a long tail streaming behind
  c.strokeStyle = '#4a2e1c'
  c.lineWidth = 4.5
  c.beginPath()
  c.moveTo(-17, -1)
  c.bezierCurveTo(-24, -3 + gallop, -29, 2 + gallop, -35, 10)
  c.stroke()
  c.strokeStyle = '#6e5430'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(-18, -2)
  c.bezierCurveTo(-24, -4 + gallop, -28, 0 + gallop, -33, 6)
  c.stroke()
  // far legs, darker: hind leg with its hock, foreleg with its knee
  c.strokeStyle = '#5f574d'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(-12, 6)
  c.lineTo(-17, 11 + gallop)
  c.lineTo(-15, 17 + gallop)
  c.moveTo(11, 7)
  c.lineTo(15, 11 - gallop)
  c.lineTo(20, 12 - gallop)
  c.stroke()
  // the body of a heavy warhorse: a deep chest, a broad, rounded rump and a strong back
  c.fillStyle = linear(c, -8, 12, [
    [0, '#d8d2c6'],
    [0.5, '#b5ab9c'],
    [1, '#5f574d'],
  ])
  c.beginPath()
  c.moveTo(-18, 3)
  c.bezierCurveTo(-19, -7, -10, -8, -2, -6)
  c.bezierCurveTo(4, -5, 9, -7, 13, -3)
  c.bezierCurveTo(17, 3, 15, 11, 9, 11)
  c.bezierCurveTo(3, 12.5, -6, 12.5, -11, 11)
  c.bezierCurveTo(-16, 10, -18, 8, -18, 3)
  c.closePath()
  c.fill()
  // dapples across the rump and flank
  c.fillStyle = '#8c8273'
  for (const [x, y, r] of [
    [-13, -1, 1.6],
    [-9, 2, 1.3],
    [-14, 4, 1.2],
    [-5, 0, 1.1],
    [-10, -4, 1.1],
  ]) {
    c.beginPath()
    c.ellipse(x, y, r * 1.3, r, 0, 0, Math.PI * 2)
    c.fill()
  }
  // muscle: shadow under the belly, behind the shoulder and across the stifle
  c.strokeStyle = '#3d3731'
  c.lineWidth = 1.3
  c.beginPath()
  c.moveTo(-10, 10)
  c.quadraticCurveTo(0, 12.5, 8, 9.5)
  c.moveTo(3, -4)
  c.quadraticCurveTo(1, 3, 4, 9)
  c.moveTo(-7, -5)
  c.quadraticCurveTo(-9, 2, -14, 7)
  c.stroke()
  // a thick, arched neck and a long, fine-boned head
  c.fillStyle = linear(c, -20, 6, [
    [0, '#e9e4d8'],
    [1, '#8c8273'],
  ])
  c.beginPath()
  c.moveTo(8, -5)
  c.bezierCurveTo(11, -13, 16, -18, 20, -19)
  c.lineTo(23, -18)
  c.lineTo(30, -10)
  c.quadraticCurveTo(31, -7, 28, -6.5)
  c.lineTo(23, -8)
  c.quadraticCurveTo(19, -4, 17, 4)
  c.quadraticCurveTo(14, 8, 11, 6)
  c.closePath()
  c.fill()
  // shadow under the jaw and down the throat
  c.strokeStyle = '#5f574d'
  c.lineWidth = 1.3
  c.beginPath()
  c.moveTo(23, -8)
  c.quadraticCurveTo(19, -5, 17, 3)
  c.stroke()
  // ear, eye and nostril
  c.fillStyle = '#b5ab9c'
  c.beginPath()
  c.moveTo(20, -19)
  c.lineTo(20.5, -23)
  c.lineTo(22.5, -19)
  c.fill()
  c.fillStyle = '#0d0b10'
  c.fillRect(22.5, -15, 1.8, 1.4)
  c.fillRect(28.4, -9, 1.2, 1.2)
  // bridle straps
  c.strokeStyle = '#4a2e1c'
  c.lineWidth = 0.9
  c.beginPath()
  c.moveTo(21, -17.5)
  c.lineTo(26.5, -8)
  c.moveTo(24.5, -13)
  c.lineTo(29, -9.5)
  c.stroke()
  // a heavy mane falling along the crest
  for (const [i, col] of [
    [0, '#4a2e1c'],
    [1, '#6e5430'],
    [2, '#a07c45'],
  ] as [number, string][]) {
    c.strokeStyle = col
    c.lineWidth = 2.6
    c.beginPath()
    c.moveTo(20 - i, -19 + i * 1.2)
    c.bezierCurveTo(15 - i, -16 + gallop * 0.4, 11 - i, -11 + i, 8 - i * 0.5, -5 + i)
    c.stroke()
  }
  // near legs: forearm, knee and cannon, ending in dark hooves with a little feathering above
  c.strokeStyle = '#b5ab9c'
  c.lineWidth = 3.6
  c.beginPath()
  c.moveTo(-8, 8)
  c.lineTo(-12, 13 + gallop)
  c.lineTo(-9, 18 + gallop)
  c.moveTo(8, 8)
  c.lineTo(12, 13 - gallop)
  c.lineTo(17, 15 - gallop)
  c.stroke()
  c.fillStyle = '#1b1d24'
  c.fillRect(-10.5, 17.5 + gallop, 4, 2.6)
  c.fillRect(16, 13.8 - gallop, 4, 2.6)
  // the near wing, rising from the horse's shoulder behind the rider
  bigWing(c, lift - 5, { primary: '#5f574d', secondary: '#b5ab9c', covert: '#e9e4d8', bar: '#3d3731', edge: '#eef0f4' }, 1.3)
  // tack: a burgundy saddle cloth with gold trim, a leather saddle and girth
  c.fillStyle = '#5a1620'
  c.beginPath()
  c.moveTo(-9, -5)
  c.lineTo(7, -5)
  c.lineTo(6, 7)
  c.lineTo(-8, 7)
  c.closePath()
  c.fill()
  c.strokeStyle = '#c8a24a'
  c.lineWidth = 1.1
  c.beginPath()
  c.moveTo(-8, 7)
  c.lineTo(6, 7)
  c.stroke()
  c.fillStyle = '#4a2e1c'
  c.fillRect(-6, -7, 10, 4)
  c.strokeStyle = '#4a2e1c'
  c.lineWidth = 1.4
  c.beginPath()
  c.moveTo(1, -3)
  c.lineTo(2, 9.5)
  c.stroke()
  // the cape, heavy and dark, its edge torn
  c.fillStyle = linear(c, -22, 0, [
    [0, '#2f6670'],
    [1, '#1d3f46'],
  ])
  c.beginPath()
  c.moveTo(-1, -20)
  c.quadraticCurveTo(-10, -16 + gallop, -19, -6 + gallop)
  c.lineTo(-16.5, -5 + gallop)
  c.lineTo(-17, -2 + gallop)
  c.lineTo(-13, -3 + gallop * 0.6)
  c.quadraticCurveTo(-6, -7, 0, -9)
  c.closePath()
  c.fill()
  // the knight: an armoured leg in the stirrup, a plate cuirass, a pauldron and a gauntleted arm
  c.strokeStyle = '#6e7587'
  c.lineWidth = 3.2
  c.beginPath()
  c.moveTo(0, -7)
  c.lineTo(2, 1)
  c.lineTo(1, 6)
  c.stroke()
  c.fillStyle = linear(c, -21, -6, [
    [0, '#c3c8d4'],
    [0.5, '#6e7587'],
    [1, '#30343f'],
  ])
  c.beginPath()
  c.moveTo(-3.5, -20)
  c.lineTo(4, -20)
  c.lineTo(4.5, -7)
  c.lineTo(-3, -7)
  c.closePath()
  c.fill()
  c.fillStyle = '#959caf'
  c.beginPath()
  c.ellipse(1.5, -18.5, 4, 2.8, -0.2, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#4a2e1c'
  c.fillRect(-3, -9, 7.5, 1.6)
  c.strokeStyle = '#6e7587'
  c.lineWidth = 2.6
  c.beginPath()
  c.moveTo(3, -16)
  c.lineTo(7, -12)
  c.stroke()
  // a great helm with a narrow eye slit and a dark red crest
  c.fillStyle = linear(c, -29, -19, [
    [0, '#eef0f4'],
    [0.6, '#959caf'],
    [1, '#4c5262'],
  ])
  c.beginPath()
  c.moveTo(-2.5, -20)
  c.lineTo(-2.5, -26)
  c.quadraticCurveTo(1, -29.5, 4.5, -26)
  c.lineTo(5, -20)
  c.closePath()
  c.fill()
  c.fillStyle = '#0d0b10'
  c.fillRect(1, -24.5, 4, 1.2)
  c.strokeStyle = '#80222c'
  c.lineWidth = 2.4
  c.beginPath()
  c.moveTo(1, -28.5)
  c.quadraticCurveTo(-5, -31, -11, -26 + gallop * 0.5)
  c.stroke()
  // a long sword, its blade catching the light along one edge
  c.strokeStyle = '#c8a24a'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(7.5, -14.5)
  c.lineTo(6.5, -9.5)
  c.stroke()
  c.strokeStyle = '#959caf'
  c.lineWidth = 2.2
  c.beginPath()
  c.moveTo(7, -12)
  c.lineTo(30, -19)
  c.stroke()
  c.strokeStyle = '#eef0f4'
  c.lineWidth = 0.8
  c.beginPath()
  c.moveTo(9, -12.8)
  c.lineTo(29, -19)
  c.stroke()
}

// Foe: a griffin, eagle in front and lion behind, lunging forward with its talons out and its head low,
// ridden by a gaunt sorcerer in a tattered, near-black robe.
const drawFoe = (c: Draw, lift: number) => {
  c.lineCap = 'round'
  c.lineJoin = 'round'
  // the far wing, raised high, in shadow
  c.save()
  c.translate(3, -3)
  bigWing(c, lift - 5, { primary: '#0d0607', secondary: '#1c1210', covert: '#2e1d16', bar: '#0d0607', edge: '#45291b' })
  c.restore()
  // a long lion's tail, lashing, with a dark tuft
  c.strokeStyle = '#7a4e2c'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(-16, 0)
  c.bezierCurveTo(-24, -1, -26, 9, -33, 5)
  c.stroke()
  c.fillStyle = '#1c1210'
  c.beginPath()
  c.ellipse(-34, 4, 3, 2, 0.9, 0, Math.PI * 2)
  c.fill()
  // far legs: a lion's hind leg bunched to spring, an eagle's foreleg reaching forward
  c.strokeStyle = '#45291b'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(-12, 6)
  c.lineTo(-18, 10)
  c.lineTo(-16, 15)
  c.moveTo(9, 6)
  c.lineTo(15, 8)
  c.lineTo(21, 7)
  c.stroke()
  // the lion's body: lean and long, ribs showing under a tawny coat, darker along the spine
  c.fillStyle = linear(c, -8, 12, [
    [0, '#94653a'],
    [0.45, '#ad7f4c'],
    [1, '#5e3a22'],
  ])
  c.beginPath()
  c.moveTo(-18, 2)
  c.bezierCurveTo(-19, -6, -10, -7, -2, -5.5)
  c.bezierCurveTo(4, -4.5, 8, -5.5, 11, -3.5)
  c.bezierCurveTo(13, 3, 11, 9, 5, 9.5)
  c.bezierCurveTo(-1, 10.5, -8, 10.5, -12, 9.5)
  c.bezierCurveTo(-16, 8.5, -18, 6, -18, 2)
  c.closePath()
  c.fill()
  c.strokeStyle = '#5e3a22'
  c.lineWidth = 1.6
  c.beginPath()
  c.moveTo(-17, -1)
  c.bezierCurveTo(-10, -6.5, 0, -6, 9, -4.5)
  c.stroke()
  c.strokeStyle = '#7a4e2c'
  c.lineWidth = 0.9
  for (let i = 0; i < 4; i++) {
    c.beginPath()
    c.moveTo(-6 + i * 3, -2)
    c.quadraticCurveTo(-7 + i * 3, 3, -5 + i * 3, 7.5)
    c.stroke()
  }
  // the haunch, tensed
  c.fillStyle = '#94653a'
  c.beginPath()
  c.ellipse(-11.5, 4, 5, 5.5, 0.4, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#45291b'
  c.lineWidth = 1.2
  c.beginPath()
  c.arc(-11.5, 4, 5, 1.6, 3.4)
  c.stroke()
  // near hind leg: a long hock and a heavy, clawed paw
  c.strokeStyle = '#94653a'
  c.lineWidth = 3.2
  c.beginPath()
  c.moveTo(-12, 8)
  c.lineTo(-18, 12)
  c.lineTo(-15, 17)
  c.stroke()
  c.fillStyle = '#5e3a22'
  c.beginPath()
  c.ellipse(-14, 17.5, 2.6, 1.4, 0, 0, Math.PI * 2)
  c.fill()
  // the eagle's chest and shoulders: barred feathers in overlapping rows
  c.fillStyle = linear(c, -10, 10, [
    [0, '#7a4e2c'],
    [1, '#45291b'],
  ])
  c.beginPath()
  c.moveTo(3, -7)
  c.bezierCurveTo(10, -10, 16, -5, 14, 3)
  c.bezierCurveTo(13, 8, 8, 9.5, 3, 8.5)
  c.quadraticCurveTo(1, 1, 3, -7)
  c.closePath()
  c.fill()
  c.strokeStyle = '#c79c63'
  c.lineWidth = 0.8
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      c.beginPath()
      c.arc(5 + col * 3 + (row % 2) * 1.5, -5 + row * 2.8, 1.4, 0.4, Math.PI - 0.4)
      c.stroke()
    }
  }
  // near foreleg, reaching: a feathered thigh, a scaled yellow leg and long black talons spread to strike
  c.fillStyle = '#45291b'
  c.beginPath()
  c.ellipse(11, 5, 3.4, 3, 0.2, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#c9a227'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(12.5, 6.5)
  c.lineTo(19, 9)
  c.stroke()
  c.strokeStyle = '#0d0607'
  c.lineWidth = 1.1
  c.beginPath()
  c.moveTo(19, 9)
  c.quadraticCurveTo(23, 7, 25, 9)
  c.moveTo(19, 9)
  c.quadraticCurveTo(23, 10, 24, 13)
  c.moveTo(19, 9)
  c.quadraticCurveTo(21, 12, 20, 15)
  c.moveTo(19, 9)
  c.quadraticCurveTo(16.5, 11, 16, 13.5)
  c.stroke()
  // a powerful neck held low and forward, its hackles raised
  c.fillStyle = '#7a4e2c'
  c.beginPath()
  c.moveTo(8, -6)
  c.quadraticCurveTo(13, -10, 18, -9)
  c.lineTo(20, -3)
  c.quadraticCurveTo(15, 1, 10, 2)
  c.closePath()
  c.fill()
  c.fillStyle = '#c79c63'
  c.beginPath()
  c.moveTo(9, -6)
  c.lineTo(10, -11)
  c.lineTo(12, -8.5)
  c.lineTo(13.5, -12.5)
  c.lineTo(15, -9.5)
  c.lineTo(17.5, -11.5)
  c.lineTo(18, -8)
  c.closePath()
  c.fill()
  // the head, true to an eagle's size: a flat crown, a heavy brow, a golden nape
  c.fillStyle = linear(c, -12, -2, [
    [0, '#c79c63'],
    [0.5, '#94653a'],
    [1, '#5e3a22'],
  ])
  c.beginPath()
  c.moveTo(16.5, -9)
  c.quadraticCurveTo(19.5, -11.5, 23, -9.5)
  c.quadraticCurveTo(24.5, -7.5, 23.5, -5)
  c.lineTo(19.5, -3)
  c.quadraticCurveTo(16.5, -4.5, 16.5, -9)
  c.closePath()
  c.fill()
  // the beak: a yellow cere, a horn-coloured bill, a dark hooked tip, open to scream
  c.fillStyle = '#e0b84a'
  c.fillRect(22.3, -8.6, 1.8, 2.6)
  c.fillStyle = '#8a7a68'
  c.beginPath()
  c.moveTo(24, -8.6)
  c.quadraticCurveTo(28.5, -8.4, 28.5, -4.8)
  c.lineTo(27, -5.6)
  c.lineTo(24, -6.4)
  c.closePath()
  c.fill()
  c.fillStyle = '#3a2a24'
  c.beginPath()
  c.moveTo(27, -7.6)
  c.quadraticCurveTo(28.8, -7, 28.5, -4.6)
  c.lineTo(27.2, -5.4)
  c.closePath()
  c.fill()
  c.strokeStyle = '#5a4a40'
  c.lineWidth = 0.9
  c.beginPath()
  c.moveTo(24, -5.4)
  c.lineTo(27, -4.2)
  c.stroke()
  // a small, hard amber eye under the brow ridge
  c.fillStyle = '#c9a227'
  c.fillRect(20.6, -8.2, 1.6, 1.3)
  c.fillStyle = '#0d0607'
  c.fillRect(21.2, -8, 0.8, 0.9)
  c.strokeStyle = '#2e1d16'
  c.lineWidth = 1.1
  c.beginPath()
  c.moveTo(19.5, -9)
  c.lineTo(23, -8.8)
  c.stroke()
  // the sorcerer: gaunt, hunched, in a ragged robe of near-black crimson
  c.fillStyle = linear(c, -30, -2, [
    [0, '#4a1218'],
    [0.5, '#2a0a0e'],
    [1, '#14080a'],
  ])
  c.beginPath()
  c.moveTo(-1, -30)
  c.quadraticCurveTo(4, -26, 6, -18)
  c.lineTo(8, -4)
  c.lineTo(6, -2)
  c.lineTo(4.5, -4.5)
  c.lineTo(2.5, -1.5)
  c.lineTo(0.5, -4.5)
  c.lineTo(-2, -1.5)
  c.lineTo(-4, -4.5)
  c.lineTo(-6.5, -2)
  c.lineTo(-7, -6)
  c.quadraticCurveTo(-5, -18, -1, -30)
  c.closePath()
  c.fill()
  // a deep hood, and only a faint glint where the eyes should be
  c.fillStyle = '#0d0607'
  c.beginPath()
  c.ellipse(1.6, -22.5, 2.8, 3.4, 0.2, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#7fd6c2'
  c.fillRect(2.4, -23.4, 1, 1)
  // a bony hand on the staff
  c.strokeStyle = '#4a1218'
  c.lineWidth = 2.4
  c.beginPath()
  c.moveTo(2, -17)
  c.lineTo(7, -13)
  c.stroke()
  c.fillStyle = '#b8a090'
  c.fillRect(6.4, -14, 2, 2)
  // the staff: gnarled dark wood, twisting up to a dim, sickly light
  c.strokeStyle = '#2e1d16'
  c.lineWidth = 1.8
  c.beginPath()
  c.moveTo(6, -1)
  c.lineTo(8, -10)
  c.lineTo(7, -17)
  c.lineTo(9, -25)
  c.stroke()
  c.strokeStyle = '#45291b'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(9, -25)
  c.lineTo(7, -28)
  c.moveTo(9, -25)
  c.lineTo(11, -28.5)
  c.stroke()
  c.fillStyle = '#2f6a60'
  c.beginPath()
  c.arc(9, -27.5, 2.6, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#7fd6c2'
  c.beginPath()
  c.arc(9, -27.5, 1.4, 0, Math.PI * 2)
  c.fill()
  // the near wing, huge and raised, golden along its leading edge
  bigWing(c, lift - 2, { primary: '#1c1210', secondary: '#45291b', covert: '#7a4e2c', bar: '#0d0607', edge: '#c79c63' }, 1.15)
}

// Wing positions for the animation frames: a full downstroke, then three gliding poses with the wings held up in a V.
const POSES: [number, number][] = [
  [-16, 0],
  [-7, 2],
  [-4, 0],
  [-10, -2],
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
    // The scenery is split into layers that slide at different speeds as the hero moves (parallax).
    // Each is a little wider than the screen, by M pixels on both sides, so the edges never show.
    const M = 18
    const backdrop = document.createElement('canvas') // the sky, sun and planets: the farthest layer
    const farLayer = document.createElement('canvas')
    const midLayer = document.createElement('canvas')
    const nearLayer = document.createElement('canvas')
    const LAYERS = [backdrop, farLayer, midLayer, nearLayer]
    const islands = document.createElement('canvas')
    const labels = new Map<string, Label>()

    const X = (wx: number) => Math.round(wx * k)

    // ---- the painted scenery behind everything, drawn once per screen size ----
    const paintBackdrop = () => {
      const first = backdrop.getContext('2d')
      if (!first) return
      let c: Draw = first
      // switch painting to another layer, with the same world coordinates and the side margin
      const useLayer = (cv: HTMLCanvasElement) => {
        const next = cv.getContext('2d')
        if (!next) return
        c = next
        c.setTransform(1, 0, 0, 1, 0, 0)
        c.clearRect(0, 0, cv.width, cv.height)
        c.setTransform(k, 0, 0, k, M, 0)
      }
      useLayer(backdrop)
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
      c.fillRect(-M / k, 0, W + (2 * M) / k, H)

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
      c.fillRect(-M / k, 0, W + (2 * M) / k, H)
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

      // small far-off islands drifting in the haze, each with a thread of falling mist
      for (const [fx, fy, size] of [
        [0.3, 0.42, 26],
        [0.66, 0.36, 18],
        [0.1, 0.5, 14],
      ]) {
        const ix = fx * W
        const iy = Math.min(fy * H, horizon - 150)
        c.fillStyle = '#8e2a7e'
        c.beginPath()
        c.moveTo(ix - size, iy)
        c.lineTo(ix + size, iy)
        c.lineTo(ix + size * 0.35, iy + size * 0.8)
        c.lineTo(ix - size * 0.1, iy + size * 1.2)
        c.lineTo(ix - size * 0.5, iy + size * 0.6)
        c.closePath()
        c.fill()
        c.fillStyle = '#c46a8a'
        c.fillRect(ix - size, iy - 2, size * 2, 3)
        // a tiny tree line on top
        c.fillStyle = '#7a52b8'
        for (let tx = ix - size * 0.8; tx < ix + size * 0.8; tx += 5) {
          c.beginPath()
          c.moveTo(tx - 2, iy - 1)
          c.lineTo(tx, iy - 5 - ((tx * 7) % 3))
          c.lineTo(tx + 2, iy - 1)
          c.fill()
        }
        const mist = c.createLinearGradient(0, iy, 0, iy + size * 3)
        mist.addColorStop(0, 'rgba(255,235,245,0.55)')
        mist.addColorStop(1, 'rgba(255,235,245,0)')
        c.fillStyle = mist
        c.fillRect(ix + size * 0.5, iy, 2.5, size * 3)
      }

      useLayer(farLayer)
      // mountain ranges with natural, eroded ridgelines. Every column is lit by how much its slope faces the
      // sun, roughened with a little noise for gullies, then faded into the haze the further away the range is.
      const range = (
        seed: number,
        base: number,
        height: number,
        rough: number,
        colours: { lit: string; shade: string; low: string; fog: string; fogAmount: number; rim?: string },
      ) => {
        const line = ridgeLine(seed, 256, rough)
        const noise = seeded(seed + 100)
        const ridgeAt = (x: number) => {
          const f = Math.max(0, Math.min(1, x / W)) * 256
          const i = Math.min(255, Math.floor(f))
          const u = f - i
          return base - height * (line[i] * (1 - u) + line[i + 1] * u)
        }
        const lit = rgb(colours.lit)
        const shade = rgb(colours.shade)
        const low = rgb(colours.low)
        const fog = rgb(colours.fog)
        const step = 1 / k
        let gully = 0
        for (let x = -M / k; x < W + M / k + step; x += step) {
          const y = ridgeAt(x)
          const slope = (ridgeAt(x + step * 5) - ridgeAt(x - step * 5)) / (step * 10)
          const facing = x < sunX ? slope : -slope
          gully = gully * 0.9 + (noise() - 0.5) * 0.06
          const light = Math.max(0, Math.min(1, 0.45 + facing * 1.2 + gully))
          const top = mix(mix(shade, lit, light), fog, colours.fogAmount)
          const bottom = mix(low, fog, colours.fogAmount * 0.6)
          const g = c.createLinearGradient(0, y, 0, base + 20)
          g.addColorStop(0, css(top))
          g.addColorStop(0.45, css(mix(top, bottom, 0.6)))
          g.addColorStop(1, css(bottom))
          c.fillStyle = g
          c.fillRect(x, y, step + 0.05, H - y)
          // a glowing rim where the ridge catches the sunset
          if (colours.rim && facing > 0.08) {
            c.fillStyle = colours.rim
            c.fillRect(x, y, step + 0.05, step)
          }
        }
        return ridgeAt
      }
      const farthest = range(2, horizon - 4, 120, 0.52, {
        lit: '#ff8a3d',
        shade: '#a05a98',
        low: '#e8506a',
        fog: '#e8506a',
        fogAmount: 0.5,
        rim: '#ffe08a',
      })

      // a castle on the far ridge, its towers catching the last light
      const castleX = W * 0.86
      const ridge = farthest(castleX) + 3
      const towers: [number, number, number][] = [
        [-18, 24, 6],
        [-8, 40, 7],
        [3, 32, 6],
        [12, 46, 5],
        [20, 20, 5],
      ]
      c.fillStyle = '#a05a98'
      c.fillRect(castleX - 22, ridge - 14, 46, 18)
      for (let bx = castleX - 22; bx < castleX + 24; bx += 4) c.fillRect(bx, ridge - 17, 2, 3)
      for (const [dx, h, w] of towers) {
        c.fillStyle = '#a05a98'
        c.fillRect(castleX + dx - w / 2, ridge - h, w, h)
        c.fillStyle = 'rgba(255,198,92,0.5)'
        c.fillRect(castleX + dx - w / 2, ridge - h, w * 0.35, h)
        c.fillStyle = '#8e2a7e'
        c.beginPath()
        c.moveTo(castleX + dx - w / 2 - 1.5, ridge - h)
        c.lineTo(castleX + dx, ridge - h - w * 1.8)
        c.lineTo(castleX + dx + w / 2 + 1.5, ridge - h)
        c.fill()
      }

      // a band of low mist lying between the far and middle ranges
      const mistBand = c.createLinearGradient(0, horizon - 70, 0, horizon + 10)
      mistBand.addColorStop(0, 'rgba(255,157,200,0)')
      mistBand.addColorStop(0.6, 'rgba(255,170,200,0.45)')
      mistBand.addColorStop(1, 'rgba(255,170,200,0)')
      c.fillStyle = mistBand
      c.fillRect(0, horizon - 70, W, 80)

      useLayer(midLayer)
      range(4, horizon + 10, 95, 0.5, {
        lit: '#e8506a',
        shade: '#6a2a86',
        low: '#4e1a72',
        fog: '#b03a86',
        fogAmount: 0.22,
        rim: '#ff8a3d',
      })
      useLayer(nearLayer)
      const nearRidge = range(6, LAVA_Y + 6, 70, 0.5, {
        lit: '#b03a86',
        shade: '#2b0a4a',
        low: '#1a0629',
        fog: '#1a0629',
        fogAmount: 0,
        rim: '#ff6f5a',
      })

      // lavafalls pour from the lowest clefts in the near range (drawn each frame, so just remember where)
      falls = [0.28, 0.72].map((fx) => {
        let best = fx * W
        for (let x = (fx - 0.07) * W; x < (fx + 0.07) * W; x += 2) if (nearRidge(x) > nearRidge(best)) best = x
        return { x: best, top: nearRidge(best) + 2 }
      })

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

      quantize(backdrop, 20, false)
      quantize(farLayer, 16, false)
      quantize(midLayer, 12, false)
      quantize(nearLayer, 8, false)

      // single-pixel details added after pixelating, so they stay crisp
      const skyC = backdrop.getContext('2d')
      const farC = farLayer.getContext('2d')
      if (!skyC || !farC) return
      const SW = backdrop.width
      const img = skyC.getImageData(0, 0, SW, LH)
      const dark = (x: number, y: number) => {
        const i = (y * SW + x) * 4
        return img.data[i] + img.data[i + 1] + img.data[i + 2] < 260
      }
      // a dust of faint background stars, only where the sky is dark
      for (let s = 0; s < SW * LH * 0.004; s++) {
        const x = Math.floor(rand() * SW)
        const y = Math.floor(rand() * LH * 0.5)
        if (!dark(x, y)) continue
        skyC.fillStyle = rand() < 0.25 ? '#a98cf0' : '#5a2a7a'
        skyC.fillRect(x, y, 1, 1)
      }
      // lit windows in the castle towers
      c = farC
      c.setTransform(1, 0, 0, 1, M, 0)
      c.fillStyle = '#ffe08a'
      for (const [dx, h] of towers) {
        for (let wy = 0; wy < 2; wy++) c.fillRect(X(castleX + dx), X(ridge - h + 6 + wy * 10), 1, 1)
      }
      c.fillRect(X(castleX - 12), X(ridge - 7), 1, 1)
      c.fillRect(X(castleX + 8), X(ridge - 7), 1, 1)
      // pennants on the two tallest spires
      c.fillStyle = '#ff3b6b'
      for (const [dx, h, w] of towers.filter(([, h]) => h >= 40)) c.fillRect(X(castleX + dx), X(ridge - h - w * 1.8) - 2, 2, 1)
    }

    // ---- floating islands, painted as their own layer so the clouds can drift behind them ----
    const paintIslands = () => {
      const c = islands.getContext('2d')
      if (!c) return
      c.clearRect(0, 0, LW, LH)
      c.setTransform(k, 0, 0, k, 0, 0)
      for (const p of platforms) {
        const r = seeded(Math.round(p.x * 13 + p.y))
        const depth = 40
        // the rock outline: an eroded, uneven wedge hanging below the top
        const edge = ridgeLine(Math.round(p.x + p.y * 7), 32, 0.6)
        const rock: [number, number][] = [[p.x - 3, p.y + 6]]
        for (let i = 0; i <= 32; i++) {
          const fx = i / 32
          const centre = Math.pow(1 - Math.abs(fx - 0.5) * 2, 0.8)
          rock.push([p.x - 3 + fx * (p.w + 6), p.y + 8 + (depth - 8) * centre * (0.35 + edge[i] * 0.65)])
        }
        rock.push([p.x + p.w + 3, p.y + 6])
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
        // pebbles and pits in the rock face
        for (let i = 0; i < p.w / 4; i++) {
          c.fillStyle = r() < 0.5 ? 'rgba(26,6,41,0.45)' : 'rgba(215,196,255,0.25)'
          c.fillRect(p.x + r() * p.w, p.y + 9 + r() * (depth - 10), 1.6 / k, 1.2 / k)
        }
        // sunset light catching the side facing the sun, fading across the rock
        const toSun = p.x + p.w / 2 < W / 2
        const glow = c.createLinearGradient(toSun ? p.x + p.w : p.x, 0, toSun ? p.x + p.w * 0.4 : p.x + p.w * 0.6, 0)
        glow.addColorStop(0, 'rgba(255,138,61,0.55)')
        glow.addColorStop(1, 'rgba(255,138,61,0)')
        c.fillStyle = glow
        c.fillRect(p.x - 4, p.y + 6, p.w + 8, depth)
        // and the lava's glow reaching up under the lowest islands
        const under = c.createLinearGradient(0, p.y + depth, 0, p.y + 10)
        under.addColorStop(0, `rgba(255,90,31,${p.y > H * 0.6 ? 0.45 : 0.15})`)
        under.addColorStop(1, 'rgba(255,90,31,0)')
        c.fillStyle = under
        c.fillRect(p.x - 4, p.y + 6, p.w + 8, depth)
        c.restore()
        // glowing roots trailing down
        c.lineWidth = 1.2 / k
        for (let i = 0; i < 4; i++) {
          const rx = p.x + p.w * (0.15 + r() * 0.7)
          const fx = (rx - p.x) / p.w
          const bottom = p.y + 8 + (depth - 8) * Math.pow(1 - Math.abs(fx - 0.5) * 2, 0.8) * 0.3
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
      quantize(islands, 0, true)
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
          // a flat-ish base, then billowing puffs; each puff is lit warm from the sun below and cool from the sky above
          const puffs: [number, number, number][] = []
          const count = 5 + Math.floor(r() * 4)
          for (let i = 0; i < count; i++) {
            const fx = 0.1 + (i / (count - 1)) * 0.8 + (r() - 0.5) * 0.08
            const pr = h * (0.3 + Math.pow(1 - Math.abs(fx - 0.5) * 2, 0.7) * 0.45 + r() * 0.12)
            puffs.push([fx * w, h - pr * 0.85, pr])
          }
          puffs.sort((a, b2) => b2[2] - a[2])
          for (const [px, py, pr] of puffs) {
            const g = c.createRadialGradient(px, py + pr * 0.9, pr * 0.1, px, py + pr * 0.2, pr * 1.5)
            g.addColorStop(0, '#ffe08a')
            g.addColorStop(0.3, '#ff8a3d')
            g.addColorStop(0.6, '#d4508a')
            g.addColorStop(1, '#5a2a7a')
            c.fillStyle = g
            c.beginPath()
            c.arc(px, py, pr, 0, Math.PI * 2)
            c.fill()
            c.fillStyle = 'rgba(215,196,255,0.3)'
            c.beginPath()
            c.arc(px - pr * 0.3, py - pr * 0.35, pr * 0.45, 0, Math.PI * 2)
            c.fill()
          }
          c.fillStyle = linear(c, h * 0.6, h, [
            [0, '#d4508a'],
            [0.7, '#ff8a3d'],
            [1, '#ffc65c'],
          ])
          c.fillRect(w * 0.12, h * 0.62, w * 0.76, h * 0.38)
        }
        quantize(cv, 10, false)
        return { img: cv, x: r() * W, y: H * 0.2 + r() * Math.max(10, horizon - 190 - H * 0.2), speed: 0.04 + r() * 0.06, w: w + 10 }
      })
    }

    // Sprites are drawn as shapes into a small canvas at buffer resolution, then pixelated with an outline.
    const makeFrame = (draw: (c: Draw) => void, pal: number[][], rim: string, edge: string): Frame => {
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
        // light the sprite like the scene: cool sky light on top, warm lava light from underneath
        c.setTransform(1, 0, 0, 1, 0, 0)
        c.globalCompositeOperation = 'source-atop'
        const light = c.createLinearGradient(0, oy - 30 * sc, 0, oy + 18 * sc)
        light.addColorStop(0, 'rgba(150,170,230,0.14)')
        light.addColorStop(0.6, 'rgba(0,0,0,0.12)')
        light.addColorStop(1, 'rgba(255,100,40,0.3)')
        c.fillStyle = light
        c.fillRect(0, 0, cv.width, cv.height)
        c.globalCompositeOperation = 'source-over'
      }
      quantize(cv, 0, false, pal)
      finishSprite(cv, rim, edge)
      return { img: cv, ox, oy }
    }

    // Lettering is drawn once at buffer resolution and pixelated, then reused until the text changes.
    const label = (key: string, size: number, draw: (c: Draw, px: number, base: number) => number, dither = 0): Label => {
      const cached = labels.get(key)
      if (cached) return cached
      if (labels.size > 40) labels.clear()
      const px = Math.max(8, Math.round(size * k))
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
        12,
      )

    // Smaller text with a dark outline so it reads over any part of the sky.
    const caption = (s: string, size: number, align: CanvasTextAlign = 'center') =>
      label(`caption|${s}|${size}|${align}`, size, (c, px, base) => {
        // a plain bold face keeps its shape at only a handful of pixels tall, like console text
        px = Math.max(10, px)
        c.font = `bold ${px}px Verdana, 'Trebuchet MS', Arial, sans-serif`
        c.textAlign = align
        const x = align === 'left' ? 6 : align === 'right' ? LW - 6 : LW / 2
        c.lineJoin = 'round'
        c.lineWidth = 2
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
      // The game always draws at a low, fixed resolution (LINES tall), stretched sideways to fill a wide screen;
      // a phone held upright gets the same pixel size across. Everything, lighting included, is drawn at that size
      // and the browser scales it up with hard pixels.
      pixel = 1
      const across = Math.round(LINES * 1.1)
      LH = wide ? LINES : Math.round((across * ch) / cw)
      LW = wide ? Math.round((LINES * cw) / ch) : across
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
      for (const cv of [buffer, islands]) {
        cv.width = LW
        cv.height = LH
      }
      for (const cv of LAYERS) {
        cv.width = LW + 2 * M
        cv.height = LH
      }
      labels.clear()
      paintBackdrop()
      paintIslands()
      makeClouds()
      heroFrames = POSES.map(([lift, gallop]) => makeFrame((c) => drawHero(c, lift, gallop), HERO_PAL, '#c9a46a', '#0d0b10'))
      foeFrames = POSES.map(([lift]) => makeFrame((c) => drawFoe(c, lift), FOE_PAL, '#dcbc85', '#0d0607'))
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
    // modern touches: a camera that eases after the hero (for parallax), screen shake, a brief freeze on hits,
    // and score popups
    let camX = 0
    let shake = 0
    let freeze = 0
    let popups: { x: number; y: number; text: string; life: number }[] = []

    // the bloom pass works on a half-size copy of the frame; check once that this browser applies canvas filters,
    // since without them the bloom would just wash the picture out
    const bloom = document.createElement('canvas')
    const bl = bloom.getContext('2d', { willReadFrequently: true })
    let canBloom = false
    if (bl && 'filter' in bl) {
      bloom.width = 2
      bloom.height = 1
      bl.fillStyle = '#ffffff'
      bl.fillRect(0, 0, 2, 1)
      bl.filter = 'brightness(0)'
      bl.drawImage(bloom, 0, 0)
      bl.filter = 'none'
      canBloom = bl.getImageData(0, 0, 1, 1).data[0] < 20
    }

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
        burst(r.x - r.dir * 10, r.y + 4, 3, ['#fff6c8', '#d7c4ff'], 1, 1.6)
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
        if (r.vy > 0 && r.x > p.x && r.x < p.x + p.w && r.y + FOOT > p.y && r.y + FOOT < p.y + 12) {
          r.y = p.y - FOOT
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
      shake = Math.max(shake, 9)
      burst(player.x, Math.min(player.y, LAVA_Y), 26, ['#ffc65c', '#ff5a1f', '#ffe08a'], 3.5, 3)
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
        if (!e.alive || Math.hypot(e.x - player.x, e.y - player.y) > REACH) continue
        if (Math.abs(e.y - player.y) < 5) {
          // dead even: both bounce off
          player.vx = -player.vx * 1.5 || -3
          e.vx = -e.vx * 1.5 || 3
          burst((e.x + player.x) / 2, (e.y + player.y) / 2, 8, ['#ffffff', '#9fdcff'], 2, 1.8)
          shake = Math.max(shake, 2)
          beep(110)
        } else if (player.y < e.y) {
          e.alive = false
          score += 500
          shake = Math.max(shake, 5)
          freeze = 4
          popups.push({ x: e.x, y: e.y - 20, text: '+500', life: 55 })
          burst(e.x, e.y, 30, ['#ffe08a', '#d7c4ff', '#a98cf0', '#ffffff'], 3.2, 2.6)
          beep(660, 0.15, 'triangle')
        } else if (player.safe === 0) {
          loseLife()
          return
        }
      }
    }

    // ---- per-frame drawing, all in buffer pixels ----

    // a repeatable 0..1 value for each (a, b, c), used to scatter shimmering pixels
    const hash = (a: number, b2: number, c2: number) => {
      const v = Math.sin(a * 127.1 + b2 * 311.7 + c2 * 74.7) * 43758.5453
      return v - Math.floor(v)
    }

    // a four-pointed pixel glint
    const glint = (x: number, y: number, arm: number) => {
      b.fillStyle = '#d7c4ff'
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
          const tint = s.phase > 5 ? '#9fdcff' : s.phase > 4.2 ? '#ffe08a' : '#ffffff'
          b.fillStyle = tw > 0.75 ? tint : tw > 0.4 ? '#d7c4ff' : '#8a4f9e'
          b.fillRect(x, y, 1, 1)
        }
      }
      // an occasional shooting star
      if (comet.life <= 0 && Math.random() < 0.004) comet = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.2, life: 40 }
      if (comet.life > 0) {
        comet.life--
        comet.x += 9
        comet.y += 3
        const trail = ['#ffffff', '#fff6c8', '#ffe08a', '#d7c4ff', '#a98cf0', '#5a2a7a']
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

    // Flocks of birds crossing the sunset in V formation, seen as distant silhouettes: dark against the sky,
    // with the light glowing through the trailing edges of their wings. Each bird beats its wings through
    // a full stroke, out of step with its neighbours, and now and then glides.
    const BIRD_LIFTS = [-7, -4, 0, 5, 2, -4]
    let birdFrames: HTMLCanvasElement[][] = []
    const makeBirds = () => {
      birdFrames = [1.8, 2.6].map((size) =>
        [...BIRD_LIFTS, -1].map((lift) => {
          const sc = k * size * 0.9
          const cv = document.createElement('canvas')
          cv.width = Math.ceil(30 * sc) + 2
          cv.height = Math.ceil(22 * sc) + 2
          const c = cv.getContext('2d')
          if (c) {
            c.setTransform(sc, 0, 0, sc, 15 * sc + 1, 11 * sc + 1)
            // seen from a little in front, as distant birds are: a small body and two long jointed wings.
            // Each wing bends at the wrist, so the silhouette sweeps from a high "M" to a low curve.
            for (const side of [-1, 1]) {
              const elbowY = lift * 0.55
              const tipY = lift
              c.fillStyle = '#2b0a4a'
              c.beginPath()
              c.moveTo(side * 1.5, -1)
              c.quadraticCurveTo(side * 4, elbowY - 2.2, side * 6.5, elbowY - 0.8)
              c.quadraticCurveTo(side * 10, tipY - 1, side * 13, tipY + 0.6)
              c.quadraticCurveTo(side * 9.5, tipY + 1.6, side * 6.5, elbowY + 1.4)
              c.quadraticCurveTo(side * 4, elbowY + 1.2, side * 1.5, 1.2)
              c.closePath()
              c.fill()
              // the sunset glowing through the trailing edge
              c.strokeStyle = '#d4508a'
              c.lineWidth = 0.9
              c.beginPath()
              c.moveTo(side * 13, tipY + 0.8)
              c.quadraticCurveTo(side * 9.5, tipY + 1.8, side * 6.5, elbowY + 1.6)
              c.stroke()
            }
            // body and head, with a short fanned tail
            c.fillStyle = '#1a0629'
            c.beginPath()
            c.ellipse(0, 0.3, 2, 2.6, 0, 0, Math.PI * 2)
            c.fill()
            c.beginPath()
            c.arc(0, -2.4, 1.3, 0, Math.PI * 2)
            c.fill()
            c.beginPath()
            c.moveTo(-1.4, 2)
            c.lineTo(0, 4.6)
            c.lineTo(1.4, 2)
            c.closePath()
            c.fill()
          }
          quantize(cv, 0, false)
          return cv
        }),
      )
    }
    makeBirds()

    const drawBirds = () => {
      const flocks = [
        { size: 0, count: 5, speed: 0.22, y: 0.3, phase: 300 },
        { size: 1, count: 3, speed: 0.34, y: 0.42, phase: 520 },
      ]
      for (const fl of flocks) {
        const frames = birdFrames[fl.size]
        if (!frames) continue
        const spacing = (fl.size ? 2.6 : 1.8) * 16
        const span = W + 300
        const lead = ((t * fl.speed + fl.phase) % span) - 60
        for (let i = 0; i < fl.count; i++) {
          // the V: each pair sits a step behind and to either side of the leader
          const rank = Math.ceil(i / 2)
          const side = i % 2 ? -1 : 1
          const wx = lead - rank * spacing
          const wy = H * fl.y + side * rank * spacing * 0.45 + Math.sin(t * 0.02 + i * 1.7) * 1.5
          const glide = ((t >> 6) + i) % 4 === 0
          const frame = glide ? frames[BIRD_LIFTS.length] : frames[Math.floor(t * 0.18 + i * 1.3) % BIRD_LIFTS.length]
          b.drawImage(frame, X(wx) - Math.round(frame.width / 2), X(wy) - Math.round(frame.height / 2))
        }
      }
    }

    // a thin glowing waterfall spilling off the central island, turning to steam where it meets the lava
    const steam: { x: number; y: number; life: number }[] = []
    const drawIslandFall = () => {
      const p = platforms[2]
      if (!p) return
      const x0 = X(p.x + p.w * 0.84)
      const top = X(p.y + 9)
      const bottom = X(LAVA_Y) - 1
      const water = ['#ffffff', '#9fdcff', '#29f0ff', '#ffffff']
      for (let y = top; y < bottom; y++) {
        const sway = Math.round(Math.sin((y + t * 0.5) * 0.08) * 0.6)
        for (let dx = 0; dx < 2; dx++) {
          b.fillStyle = water[(((y * 3 - t * 2 + dx * 7) >> 2) % 4 + 4) % 4]
          if ((y + dx + (t >> 1)) % 5 !== 0) b.fillRect(x0 + dx + sway, y, 1, 1)
        }
      }
      // steam rising where the water hits
      if (t % 3 === 0) steam.push({ x: x0 + Math.round((Math.random() - 0.5) * 6), y: bottom - 1, life: 40 + Math.random() * 30 })
      for (const s2 of steam) {
        s2.life--
        s2.y -= 0.35
        s2.x += Math.sin((s2.life + s2.y) * 0.15) * 0.3
        b.fillStyle = s2.life > 40 ? '#ffffff' : s2.life > 20 ? '#d7c4ff' : '#a98cf0'
        if (s2.life > 8 || s2.life % 2) b.fillRect(Math.round(s2.x), Math.round(s2.y), s2.life > 30 ? 2 : 1, 1)
      }
      while (steam.length && steam[0].life <= 0) steam.shift()
    }

    // molten rock pouring down from the clefts in the near mountains
    const FALL_COLOURS = ['#fff6c8', '#ffe08a', '#ffc65c', '#ff8a3d', '#ff5a1f', '#ffc65c']
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
      ['#ffc65c', 2],
      ['#ff8a3d', 2],
      ['#ff5a1f', 3],
      ['#c0102a', 4],
      ['#c0102a', 5],
      ['#6d0a2e', 6],
      ['#4a1f10', 99],
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
      // the sun reflected in the molten lake: a shimmering column that narrows with depth
      const sunCol = Math.round(LW / 2)
      const sr = Math.min(W, H) * 0.24 * k
      for (let d = 1; d < 22; d++) {
        const half = sr * 0.7 * (1 - d / 26)
        const count = Math.round(half * 0.5)
        for (let i = 0; i < count; i++) {
          const x = Math.round(sunCol + (hash(d, i, t >> 3) * 2 - 1) * half)
          if (x < 0 || x >= LW) continue
          b.fillStyle = hash(i, d, (t >> 3) + 1) > 0.5 ? '#fff6c8' : '#ffe08a'
          b.fillRect(x, surfaceY[x] + d, 1 + Math.round(hash(d, i, 7) * 2), 1)
        }
      }
      // bright currents sliding along under the crust
      b.fillStyle = '#ffc65c'
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
          b.fillStyle = '#29f0ff'
          b.fillRect(cx - 2, cy, 5, 1)
          b.fillRect(cx, cy - 3, 1, 7)
        }
        b.fillStyle = bright ? '#ffffff' : '#29f0ff'
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
      if (hero && Math.floor(t / 20) % 3 === 0) glint(X(r.x + r.dir * 30 * SPRITE_SCALE), X(r.y - 19 * SPRITE_SCALE), 2)
      if (!hero && Math.sin(t * 0.15 + r.x) > 0.6) {
        b.fillStyle = '#c9fff6'
        b.fillRect(X(r.x + r.dir * 9 * SPRITE_SCALE), X(r.y - 27.5 * SPRITE_SCALE), 1, 1)
      }
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

    // the logo's shine is composed on its own small canvas each frame
    const shine = document.createElement('canvas')
    const sh = shine.getContext('2d')

    const drawLayer = (cv: HTMLCanvasElement, off: number) => b.drawImage(cv, -M + off, 0)
    const shifted = (off: number, draw: () => void) => {
      b.save()
      b.translate(off, 0)
      draw()
      b.restore()
    }

    const drawPopups = () => {
      for (const p of popups) {
        p.life--
        p.y -= 0.6
        if (p.life < 12 && p.life % 2) continue
        const l = caption(p.text, 14, 'left')
        b.drawImage(l.img, X(p.x) - 6 - Math.round(l.half), X(p.y) - l.base)
      }
      popups = popups.filter((p) => p.life > 0)
    }

    // The logo floats gently, and a bright band sweeps across its chrome every few seconds.
    const drawLogo = (worldY: number) => {
      const title = chrome('SkyRiders', 64)
      const bob = Math.round(Math.sin(t * 0.04) * 2)
      const y = X(worldY) - title.base + bob
      let img: HTMLCanvasElement = title.img
      const sweep = (t % 240) * 4 - 60
      if (sh && sweep < LW + 60) {
        if (shine.width !== title.img.width || shine.height !== title.img.height) {
          shine.width = title.img.width
          shine.height = title.img.height
        }
        sh.globalCompositeOperation = 'source-over'
        sh.clearRect(0, 0, shine.width, shine.height)
        sh.drawImage(title.img, 0, 0)
        sh.globalCompositeOperation = 'source-atop'
        for (const [dx, w, col] of [
          [0, 6, '#fff6c8'],
          [2, 2, '#ffffff'],
          [10, 2, '#fff6c8'],
        ] as [number, number, string][]) {
          sh.fillStyle = col
          sh.beginPath()
          sh.moveTo(sweep + dx, 0)
          sh.lineTo(sweep + dx + w, 0)
          sh.lineTo(sweep + dx + w - shine.height * 0.6, shine.height)
          sh.lineTo(sweep + dx - shine.height * 0.6, shine.height)
          sh.fill()
        }
        img = shine
      }
      b.drawImage(img, 0, y)
      const swing = Math.floor(t / 30) % 2
      glint(Math.round(LW / 2 + title.half - 6), y + title.base - X(46), swing ? 3 : 2)
      glint(Math.round(LW / 2 - title.half + 10), y + title.base - X(6), swing ? 1 : 2)
    }

    // ---- the modern pass: lighting over the pixel art, at the same console resolution ----
    const post = (sx: number, sy: number, offs: { sky: number; near: number }) => {
      const S = pixel
      const fullW = LW * S
      const fullH = LH * S
      // bloom: the bright parts of the frame, blurred and added back as a soft glow
      if (canBloom && bl) {
        const bw = Math.ceil(LW / 2)
        const bh = Math.ceil(LH / 2)
        if (bloom.width !== bw || bloom.height !== bh) {
          bloom.width = bw
          bloom.height = bh
        }
        bl.filter = 'brightness(0.55) contrast(3.2) blur(1px)'
        bl.clearRect(0, 0, bw, bh)
        bl.drawImage(buffer, 0, 0, bw, bh)
        bl.filter = 'none'
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.32
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(bloom, sx, sy, fullW, fullH)
        ctx.restore()
      }
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      // slow light shafts turning out from the sun
      const sunR = Math.min(W, H) * 0.24
      const horizon = LAVA_Y - 40
      const cx = (LW / 2 + offs.sky) * S + sx
      const cy = (horizon - sunR * 0.35) * k * S + sy
      const reach = Math.max(fullW, fullH)
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + 0.3 + i * 0.4 + Math.sin(t * 0.004 + i) * 0.08
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.7)
        g.addColorStop(0, 'rgba(255,200,140,0.10)')
        g.addColorStop(1, 'rgba(255,200,140,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a - 0.05) * reach, cy + Math.sin(a - 0.05) * reach)
        ctx.lineTo(cx + Math.cos(a + 0.05) * reach, cy + Math.sin(a + 0.05) * reach)
        ctx.closePath()
        ctx.fill()
      }
      // the lava lights the air above it, breathing slowly
      const lavaTop = LAVA_Y * k * S + sy
      const breathe = 0.16 + Math.sin(t * 0.03) * 0.04
      const lg = ctx.createLinearGradient(0, lavaTop - 160 * (S / 4), 0, fullH + sy)
      lg.addColorStop(0, 'rgba(255,90,30,0)')
      lg.addColorStop(0.6, `rgba(255,90,30,${breathe})`)
      lg.addColorStop(1, `rgba(255,140,40,${breathe * 1.4})`)
      ctx.fillStyle = lg
      ctx.fillRect(sx, lavaTop - 160 * (S / 4), fullW, fullH)
      // little pools of light: crystals, sorcerers' orbs, lavafalls and the waterfall
      const light = (wx: number, wy: number, r: number, col: string, a: number, shift = 0) => {
        const x = (X(wx) + shift) * S + sx
        const y = X(wy) * S + sy
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * S)
        g.addColorStop(0, col.replace('A', String(a)))
        g.addColorStop(1, col.replace('A', '0'))
        ctx.fillStyle = g
        ctx.fillRect(x - r * S, y - r * S, r * S * 2, r * S * 2)
      }
      for (const p of platforms) light(p.x + p.w * (0.3 + p.rocks[0] * 0.4), p.y + 18, 10, 'rgba(41,240,255,A)', 0.22 + Math.sin(t * 0.07 + p.x) * 0.08)
      for (const e of enemies) if (e.alive) light(e.x + e.dir * 9 * SPRITE_SCALE, e.y - 27.5 * SPRITE_SCALE, 7, 'rgba(127,214,194,A)', 0.22)
      for (const f of falls) light(f.x, LAVA_Y - 6, 16, 'rgba(255,140,40,A)', 0.3, offs.near)
      const isle = platforms[2]
      if (isle) light(isle.x + isle.w * 0.84, LAVA_Y - 4, 12, 'rgba(201,255,246,A)', 0.25)
      ctx.restore()
      // a cinematic grade: cool sky, warm ground
      ctx.save()
      ctx.globalCompositeOperation = 'soft-light'
      const grade = ctx.createLinearGradient(0, sy, 0, fullH + sy)
      grade.addColorStop(0, 'rgba(70,90,220,0.35)')
      grade.addColorStop(0.55, 'rgba(255,255,255,0)')
      grade.addColorStop(1, 'rgba(255,120,50,0.35)')
      ctx.fillStyle = grade
      ctx.fillRect(sx, sy, fullW, fullH)
      ctx.restore()
    }

    const loop = () => {
      t++
      // a few frames of freeze on a hit give it weight; everything still draws
      const frozen = freeze > 0
      if (frozen) freeze--
      if (!frozen) {
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
      }

      // the camera eases after the hero; each scenery layer slides by a different amount for depth
      camX += ((player.x - W / 2) * 0.16 - camX) * 0.04
      const off = (f: number) => Math.max(-M, Math.min(M, Math.round(-camX * f * k)))
      const offs = { sky: off(0.12), far: off(0.22), clouds: off(0.3), mid: off(0.36), near: off(0.55) }

      drawLayer(backdrop, offs.sky)
      shifted(offs.sky, drawStars)
      drawLayer(farLayer, offs.far)
      shifted(offs.far, drawBirds)
      drawLayer(midLayer, offs.mid)
      shifted(offs.clouds, drawClouds)
      drawLayer(nearLayer, offs.near)
      shifted(offs.near, drawFalls)
      b.drawImage(islands, 0, 0)
      drawCrystals()
      drawLava()
      drawIslandFall()
      enemies.forEach((e) => drawRider(e, false))
      drawRider(player, true)
      drawSparks()
      drawPopups()

      const top = H * 0.2
      if (mode === 'play') {
        place(caption(`Score ${score}`, 17, 'left'), 32)
        place(caption(`Wave ${wave}   ${'♥'.repeat(Math.max(0, lives))}`, 17, 'right'), 32)
      } else if (mode === 'attract') {
        drawLogo(top)
        place(caption('of the Velvet Sunset', 22), top + 40)
        if (Math.floor(t / 40) % 2) place(caption('Press SPACE or tap to ride', 17), top + 82)
      } else {
        place(chrome('Game Over', 56), H * 0.38)
        place(caption(`Score ${score}  ·  tap or press SPACE`, 19), H * 0.38 + 46)
      }

      // scale the little buffer up with hard square pixels; a shake moves it in whole pixels
      const sx = shake > 0.5 ? Math.round((Math.random() - 0.5) * shake) * pixel : 0
      const sy = shake > 0.5 ? Math.round((Math.random() - 0.5) * shake) * pixel : 0
      shake *= 0.85
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      if (sx || sy) {
        ctx.fillStyle = '#0d0221'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(buffer, sx, sy, LW * pixel, LH * pixel)
      post(sx, sy, offs)
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
      makeBirds()
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
