import { useEffect, useRef } from 'react'

// SkyRiders of the Velvet Sunset: an original flap-and-collide arcade game with a 70s airbrushed van-mural look.
// A hero on a winged horse battles sorcerers on griffins above a molten lake. Whoever is higher when they meet wins.
// When nobody is playing it runs an attract mode where the hero flies itself.
//
// The game fills whatever box it is given. The world is 500 units tall on wide screens and 400 units wide on tall
// ones, and stretches along the other side to match the screen, so nothing is cropped or letterboxed.
// The scenery that never moves (sky, sun, planets, mountains) is painted once into a backdrop whenever the size
// changes; only the riders, lava, stars and sparks are drawn every frame.

const GRAVITY = 0.22
const FLAP = -4.2

type Rider = { x: number; y: number; vx: number; vy: number; dir: number; wing: number; alive: boolean; safe: number }
type Mode = 'attract' | 'play' | 'over'
type Platform = { x: number; y: number; w: number; rocks: number[] }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
type Star = { x: number; y: number; r: number; phase: number; burst: boolean }

// Ledges as fractions of the world, so they spread out on any screen shape.
const LEDGES = [
  { fx: 0.1, fy: 0.72, fw: 0.2 },
  { fx: 0.7, fy: 0.72, fw: 0.2 },
  { fx: 0.375, fy: 0.5, fw: 0.25 },
  { fx: 0.05, fy: 0.3, fw: 0.18 },
  { fx: 0.77, fy: 0.3, fw: 0.18 },
]

// Repeatable pseudo-random numbers, so the mountains and stars look the same on every visit.
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

export default function SkyRiders({ className = 'block h-full w-full' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ---- world size, matched to the screen ----
    let W = 800
    let H = 500
    let LAVA_Y = H - 40
    let scale = 1
    let platforms: Platform[] = []
    let stars: Star[] = []
    const backdrop = document.createElement('canvas')

    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      const cw = Math.max(1, rect.width)
      const ch = Math.max(1, rect.height)
      if (cw >= ch) {
        H = 500
        W = Math.round((500 * cw) / ch)
      } else {
        W = 400
        H = Math.round((400 * ch) / cw)
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
        r: 0.6 + rand() * 1.4,
        phase: rand() * Math.PI * 2,
        burst: rand() < 0.08,
      }))
      // draw at the screen's real resolution so the art stays crisp
      scale = (cw / W) * Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * scale)
      canvas.height = Math.round(H * scale)
      backdrop.width = canvas.width
      backdrop.height = canvas.height
      paintBackdrop()
    }

    // ---- the painted backdrop: sky, striped sun, planets, clouds and two ranges of mountains ----
    const paintBackdrop = () => {
      const b = backdrop.getContext('2d')
      if (!b) return
      b.setTransform(scale, 0, 0, scale, 0, 0)
      const horizon = LAVA_Y - 40

      // sky: deep indigo at the top, through violet and magenta, to a hot gold glow at the horizon
      const sky = b.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, '#12052e')
      sky.addColorStop(0.3, '#3b0f5c')
      sky.addColorStop(0.55, '#8e2a7e')
      sky.addColorStop(0.78, '#e8506a')
      sky.addColorStop(0.92, '#ff8a3d')
      sky.addColorStop(1, '#ffc65c')
      b.fillStyle = sky
      b.fillRect(0, 0, W, H)

      // airbrushed haze bands
      for (let i = 0; i < 5; i++) {
        const y = horizon * (0.35 + i * 0.12)
        const g = b.createRadialGradient(W / 2, y, 0, W / 2, y, W * 0.7)
        g.addColorStop(0, i % 2 ? 'rgba(255,170,220,0.12)' : 'rgba(255,210,150,0.1)')
        g.addColorStop(1, 'rgba(255,170,220,0)')
        b.fillStyle = g
        b.save()
        b.translate(W / 2, y)
        b.scale(1, 0.12)
        b.translate(-W / 2, -y)
        b.fillRect(0, y - W * 0.7, W, W * 1.4)
        b.restore()
      }

      // the big striped sunset sun, with a soft halo behind it
      const sunR = Math.min(W, H) * 0.24
      const sunX = W / 2
      const sunY = horizon - sunR * 0.35
      const halo = b.createRadialGradient(sunX, sunY, sunR * 0.6, sunX, sunY, sunR * 2.4)
      halo.addColorStop(0, 'rgba(255,200,120,0.55)')
      halo.addColorStop(0.5, 'rgba(255,110,120,0.18)')
      halo.addColorStop(1, 'rgba(255,110,120,0)')
      b.fillStyle = halo
      b.fillRect(0, 0, W, H)

      const sun = document.createElement('canvas')
      const sz = Math.ceil(sunR * 2 * scale)
      sun.width = sz
      sun.height = sz
      const s = sun.getContext('2d')
      if (s) {
        s.setTransform(scale, 0, 0, scale, 0, 0)
        const sg = s.createLinearGradient(0, 0, 0, sunR * 2)
        sg.addColorStop(0, '#fff6c8')
        sg.addColorStop(0.45, '#ffc94d')
        sg.addColorStop(0.75, '#ff7a45')
        sg.addColorStop(1, '#ff3d7f')
        s.fillStyle = sg
        s.beginPath()
        s.arc(sunR, sunR, sunR, 0, Math.PI * 2)
        s.fill()
        // cut the stripes out of the lower half, getting thicker toward the bottom
        s.globalCompositeOperation = 'destination-out'
        for (let i = 0; i < 7; i++) {
          const y = sunR * (1.02 + i * 0.14)
          s.fillRect(0, y, sunR * 2, 1.2 + i * 1.4)
        }
      }
      b.drawImage(sun, sunX - sunR, sunY - sunR, sunR * 2, sunR * 2)

      // a pale ringed planet and a small moon, shaded like an airbrushed sphere
      const px = W * 0.8
      const py = H * 0.17
      const pr = 30
      b.save()
      b.translate(px, py)
      b.rotate(-0.35)
      b.strokeStyle = 'rgba(255,215,190,0.35)'
      b.lineWidth = 5
      b.beginPath()
      b.ellipse(0, 0, pr * 2, pr * 0.42, 0, Math.PI, Math.PI * 2)
      b.stroke()
      const pg = b.createRadialGradient(-pr * 0.4, -pr * 0.45, pr * 0.1, 0, 0, pr)
      pg.addColorStop(0, '#f4f0ff')
      pg.addColorStop(0.5, '#a9b8ff')
      pg.addColorStop(1, '#4b3a8f')
      b.fillStyle = pg
      b.beginPath()
      b.arc(0, 0, pr, 0, Math.PI * 2)
      b.fill()
      b.strokeStyle = 'rgba(255,225,200,0.55)'
      b.beginPath()
      b.ellipse(0, 0, pr * 2, pr * 0.42, 0, 0, Math.PI)
      b.stroke()
      b.restore()
      const mg = b.createRadialGradient(W * 0.14 - 4, H * 0.12 - 4, 1, W * 0.14, H * 0.12, 11)
      mg.addColorStop(0, '#ffe9f4')
      mg.addColorStop(1, '#9c5fa8')
      b.fillStyle = mg
      b.beginPath()
      b.arc(W * 0.14, H * 0.12, 11, 0, Math.PI * 2)
      b.fill()

      // long wispy clouds lit pink and gold from below
      const rand = seeded(11)
      for (let i = 0; i < 6; i++) {
        const cx = rand() * W
        const cy = horizon * (0.45 + rand() * 0.4)
        const cw = W * (0.18 + rand() * 0.25)
        const cg = b.createLinearGradient(0, cy - 6, 0, cy + 6)
        cg.addColorStop(0, 'rgba(255,190,230,0)')
        cg.addColorStop(0.6, 'rgba(255,170,200,0.28)')
        cg.addColorStop(1, 'rgba(255,220,140,0.4)')
        b.fillStyle = cg
        b.beginPath()
        b.ellipse(cx, cy, cw / 2, 5 + rand() * 4, 0, 0, Math.PI * 2)
        b.fill()
      }

      // two ranges of jagged mountains: misty far peaks, then darker near ones with a hot rim of light
      const range = (seed: number, base: number, height: number, step: number, fill: CanvasGradient, rim: string) => {
        const r = seeded(seed)
        const pts: [number, number][] = []
        for (let x = -step; x <= W + step; x += step) pts.push([x + (r() - 0.5) * step * 0.6, base - height * (0.35 + r() * 0.65)])
        b.fillStyle = fill
        b.beginPath()
        b.moveTo(-step, H)
        for (const [x, y] of pts) b.lineTo(x, y)
        b.lineTo(W + step, H)
        b.closePath()
        b.fill()
        b.strokeStyle = rim
        b.lineWidth = 1.5
        b.beginPath()
        pts.forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)))
        b.stroke()
      }
      const far = b.createLinearGradient(0, horizon - 150, 0, horizon)
      far.addColorStop(0, '#8a4f9e')
      far.addColorStop(1, '#c46a8a')
      range(3, horizon + 10, 150, 70, far, 'rgba(255,200,170,0.35)')
      const near = b.createLinearGradient(0, horizon - 90, 0, LAVA_Y)
      near.addColorStop(0, '#3a1352')
      near.addColorStop(1, '#170726')
      range(5, LAVA_Y + 4, 95, 55, near, 'rgba(255,140,90,0.6)')
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
        burst(r.x - r.dir * 10, r.y + 4, 3, ['#fff6d8', '#ffd6f2'], 1, 1.6)
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
      burst(player.x, Math.min(player.y, LAVA_Y), 26, ['#ffb347', '#ff5a1f', '#ffe08a'], 3.5, 3)
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
          burst((e.x + player.x) / 2, (e.y + player.y) / 2, 8, ['#ffffff', '#9fe8ff'], 2, 1.8)
          beep(110)
        } else if (player.y < e.y) {
          e.alive = false
          score += 500
          burst(e.x, e.y, 30, ['#ffe066', '#ff9de2', '#b388ff', '#ffffff'], 3.2, 2.6)
          beep(660, 0.15, 'triangle')
        } else if (player.safe === 0) {
          loseLife()
          return
        }
      }
    }

    // ---- per-frame drawing ----

    // a four-pointed airbrush sparkle, the classic glint on van-mural chrome
    const sparkle = (x: number, y: number, size: number, alpha = 1) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.3, 'rgba(255,240,220,0.6)')
      g.addColorStop(1, 'rgba(255,200,240,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size)
        ctx.lineTo(Math.cos(a + Math.PI / 4) * size * 0.14, Math.sin(a + Math.PI / 4) * size * 0.14)
      }
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const drawStars = () => {
      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.05 + s.phase)
        if (s.burst) sparkle(s.x, s.y, 5 + tw * 4, tw)
        else {
          ctx.fillStyle = `rgba(255,245,255,${0.35 + tw * 0.55})`
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // an occasional shooting star
      if (comet.life <= 0 && Math.random() < 0.004) comet = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.2, life: 40 }
      if (comet.life > 0) {
        comet.life--
        comet.x += 9
        comet.y += 3
        const g = ctx.createLinearGradient(comet.x - 60, comet.y - 20, comet.x, comet.y)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(1, `rgba(255,250,230,${comet.life / 40})`)
        ctx.strokeStyle = g
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(comet.x - 60, comet.y - 20)
        ctx.lineTo(comet.x, comet.y)
        ctx.stroke()
      }
    }

    const drawLava = () => {
      // heat glow rising off the surface
      const glow = ctx.createLinearGradient(0, LAVA_Y - 60, 0, LAVA_Y)
      glow.addColorStop(0, 'rgba(255,90,20,0)')
      glow.addColorStop(1, 'rgba(255,90,20,0.35)')
      ctx.fillStyle = glow
      ctx.fillRect(0, LAVA_Y - 60, W, 60)

      const surface = (x: number) => LAVA_Y + Math.sin(x * 0.04 + t * 0.06) * 3 + Math.sin(x * 0.013 - t * 0.03) * 2
      const g = ctx.createLinearGradient(0, LAVA_Y - 4, 0, H)
      g.addColorStop(0, '#ffe08a')
      g.addColorStop(0.15, '#ff8a1f')
      g.addColorStop(0.5, '#e8250f')
      g.addColorStop(1, '#4a0218')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, H)
      for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, surface(x))
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fill()

      // bright crust line and slow rising bubbles
      ctx.strokeStyle = 'rgba(255,245,190,0.8)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let x = 0; x <= W + 10; x += 10) (x ? ctx.lineTo(x, surface(x)) : ctx.moveTo(x, surface(x)))
      ctx.stroke()
      for (let i = 0; i < 6; i++) {
        const cycle = (t * 0.6 + i * 53) % 120
        const bx = ((i * 137 + Math.floor((t * 0.6 + i * 53) / 120) * 71) % W) + 0.5
        const r = cycle < 90 ? cycle / 30 : 3 + (cycle - 90) / 6
        ctx.fillStyle = cycle < 90 ? 'rgba(255,220,120,0.7)' : 'rgba(255,240,200,0.4)'
        ctx.beginPath()
        ctx.arc(bx, surface(bx) + 6 - Math.min(cycle, 90) / 30, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // floating islands: a polished lavender top with jagged rock hanging underneath and a glowing crystal
    const drawPlatforms = () => {
      for (const p of platforms) {
        const depth = 26
        const rock = ctx.createLinearGradient(0, p.y, 0, p.y + depth)
        rock.addColorStop(0, '#5a2a7a')
        rock.addColorStop(1, '#1c0930')
        ctx.fillStyle = rock
        ctx.beginPath()
        ctx.moveTo(p.x - 2, p.y + 6)
        const n = p.rocks.length
        for (let i = 0; i < n; i++) {
          const fx = (i + 0.5) / n
          const centre = 1 - Math.abs(fx - 0.5) * 2
          ctx.lineTo(p.x + fx * p.w, p.y + 8 + (depth - 8) * centre * (0.5 + p.rocks[i] * 0.5))
        }
        ctx.lineTo(p.x + p.w + 2, p.y + 6)
        ctx.closePath()
        ctx.fill()

        const top = ctx.createLinearGradient(0, p.y, 0, p.y + 9)
        top.addColorStop(0, '#ffffff')
        top.addColorStop(0.35, '#d7c4ff')
        top.addColorStop(1, '#7a52b8')
        ctx.fillStyle = top
        ctx.beginPath()
        ctx.roundRect(p.x - 3, p.y, p.w + 6, 9, 4)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,170,120,0.6)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(p.x, p.y + 8.5)
        ctx.lineTo(p.x + p.w, p.y + 8.5)
        ctx.stroke()

        // a crystal glowing under each island
        const cx = p.x + p.w * (0.3 + p.rocks[0] * 0.4)
        const cy = p.y + 14
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.07 + p.x)
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
        cg.addColorStop(0, `rgba(140,255,240,${0.7 * pulse})`)
        cg.addColorStop(1, 'rgba(140,255,240,0)')
        ctx.fillStyle = cg
        ctx.fillRect(cx - 12, cy - 12, 24, 24)
        ctx.fillStyle = '#c9fff6'
        ctx.beginPath()
        ctx.moveTo(cx, cy - 5)
        ctx.lineTo(cx + 3, cy)
        ctx.lineTo(cx, cy + 6)
        ctx.lineTo(cx - 3, cy)
        ctx.fill()
      }
    }

    // A feathered wing that lifts high on a flap and glides gently otherwise.
    const wing = (r: Rider, light: string, dark: string, tip: string) => {
      const lift = r.wing > 0 ? -16 + (8 - r.wing) * 0.5 : 2 + Math.sin(t * 0.12 + r.x * 0.02) * 3
      for (let k = 0; k < 4; k++) {
        const g = ctx.createLinearGradient(0, -4, -30, lift - 10)
        g.addColorStop(0, light)
        g.addColorStop(0.7, dark)
        g.addColorStop(1, tip)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(4 - k * 3, -2)
        ctx.quadraticCurveTo(-6 - k * 4, lift - 18 + k * 4, -24 + k * 3, lift - 10 + k * 6)
        ctx.quadraticCurveTo(-10 - k * 2, lift - 2 + k * 3, 2 - k * 3, 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    // Hero: a pale winged horse with a golden mane and a rider in a flowing cyan cape.
    const drawHero = (r: Rider) => {
      const gallop = Math.sin(t * 0.3) * 2
      // tail
      const tail = ctx.createLinearGradient(-16, 0, -34, 10)
      tail.addColorStop(0, '#ffd56b')
      tail.addColorStop(1, 'rgba(255,140,200,0)')
      ctx.strokeStyle = tail
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-15, 2)
      ctx.quadraticCurveTo(-26, -2 + gallop, -34, 10)
      ctx.stroke()
      // legs
      ctx.strokeStyle = '#e8dcc8'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(-8, 8)
      ctx.lineTo(-12, 15 + gallop)
      ctx.moveTo(8, 8)
      ctx.lineTo(12, 14 - gallop)
      ctx.stroke()
      // body
      const body = ctx.createLinearGradient(0, -6, 0, 12)
      body.addColorStop(0, '#ffffff')
      body.addColorStop(1, '#cdbfe0')
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.ellipse(0, 3, 17, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      // neck and head
      ctx.beginPath()
      ctx.moveTo(10, -1)
      ctx.quadraticCurveTo(17, -10, 21, -14)
      ctx.lineTo(27, -11)
      ctx.quadraticCurveTo(28, -8, 25, -7)
      ctx.lineTo(20, -6)
      ctx.quadraticCurveTo(18, 2, 13, 6)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#2b0a4a'
      ctx.fillRect(22, -12, 1.6, 1.6)
      // mane
      ctx.strokeStyle = '#ffcf4d'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(20, -14)
      ctx.quadraticCurveTo(13, -12 + gallop * 0.5, 9, -3)
      ctx.stroke()
      // cape
      const cape = ctx.createLinearGradient(0, -14, -22, 0)
      cape.addColorStop(0, '#29f0ff')
      cape.addColorStop(1, 'rgba(60,90,255,0.2)')
      ctx.fillStyle = cape
      ctx.beginPath()
      ctx.moveTo(-1, -16)
      ctx.quadraticCurveTo(-14, -14 + gallop, -24, -6 + gallop)
      ctx.quadraticCurveTo(-12, -6, 1, -6)
      ctx.closePath()
      ctx.fill()
      // rider and helmet
      ctx.fillStyle = '#1fb8e0'
      ctx.fillRect(-3, -15, 7, 11)
      const helm = ctx.createRadialGradient(0, -20, 0, 1, -18, 5)
      helm.addColorStop(0, '#ffffff')
      helm.addColorStop(1, '#8a9bc8')
      ctx.fillStyle = helm
      ctx.beginPath()
      ctx.arc(1, -18, 4.5, 0, Math.PI * 2)
      ctx.fill()
      // sword with a glint
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(3, -9)
      ctx.lineTo(24, -16)
      ctx.stroke()
      if (Math.floor(t / 20) % 3 === 0) sparkle(24, -16, 5)
      wing(r, '#ffffff', '#ffe6b0', '#ff9ed8')
    }

    // Foe: a bronze griffin with an eagle head, ridden by a hooded sorcerer with a glowing staff.
    const drawFoe = (r: Rider) => {
      // lion body and tail
      ctx.strokeStyle = '#7a4a22'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-15, 2)
      ctx.quadraticCurveTo(-25, 6, -28, -2)
      ctx.stroke()
      const body = ctx.createLinearGradient(0, -6, 0, 12)
      body.addColorStop(0, '#d0964a')
      body.addColorStop(1, '#6b3d1c')
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.ellipse(0, 3, 16, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      // eagle head and hooked beak
      ctx.fillStyle = '#f2e6d0'
      ctx.beginPath()
      ctx.arc(16, -6, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffb31a'
      ctx.beginPath()
      ctx.moveTo(21, -8)
      ctx.quadraticCurveTo(28, -7, 25, -2)
      ctx.lineTo(21, -4)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#c0102a'
      ctx.fillRect(17, -8, 1.6, 1.6)
      // sorcerer: crimson robe and pointed hood
      const robe = ctx.createLinearGradient(0, -24, 0, -2)
      robe.addColorStop(0, '#ff3b6b')
      robe.addColorStop(1, '#6d0a2e')
      ctx.fillStyle = robe
      ctx.beginPath()
      ctx.moveTo(1, -26)
      ctx.lineTo(7, -3)
      ctx.lineTo(-6, -3)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#1a0012'
      ctx.beginPath()
      ctx.arc(1.5, -16, 2.6, 0, Math.PI * 2)
      ctx.fill()
      // staff with a pulsing orb
      ctx.strokeStyle = '#3d1f0f'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.moveTo(6, -4)
      ctx.lineTo(12, -24)
      ctx.stroke()
      const pulse = 0.6 + 0.4 * Math.sin(t * 0.15 + r.x)
      const orb = ctx.createRadialGradient(12, -26, 0, 12, -26, 8)
      orb.addColorStop(0, '#ffffff')
      orb.addColorStop(0.3, `rgba(200,120,255,${pulse})`)
      orb.addColorStop(1, 'rgba(160,60,255,0)')
      ctx.fillStyle = orb
      ctx.beginPath()
      ctx.arc(12, -26, 8, 0, Math.PI * 2)
      ctx.fill()
      wing(r, '#e8b46a', '#9a5a2a', '#4a1f10')
    }

    const drawRider = (r: Rider, hero: boolean) => {
      if (!r.alive) return
      if (hero && r.safe > 0 && Math.floor(t / 4) % 2) return // blink while protected after a respawn
      ctx.save()
      ctx.translate(r.x, r.y)
      ctx.scale(r.dir * 1.3, 1.3)
      if (hero) drawHero(r)
      else drawFoe(r)
      ctx.restore()
    }

    const drawSparks = () => {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08
        s.vx *= 0.97
        s.life--
        ctx.globalAlpha = Math.max(0, s.life / s.max)
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * (0.4 + (0.6 * s.life) / s.max), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      sparks = sparks.filter((s) => s.life > 0)
    }

    // Chrome lettering in the van-mural style: sky reflected on top, a dark horizon line, warm ground below.
    const chrome = (s: string, y: number, size: number) => {
      let px = size
      const face = (n: number) => `italic 900 ${n}px Georgia, 'Times New Roman', serif`
      ctx.font = face(px)
      const max = W - 48
      const width = ctx.measureText(s).width
      if (width > max) {
        px = Math.max(12, Math.floor((size * max) / width))
        ctx.font = face(px)
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      const g = ctx.createLinearGradient(0, y - px * 0.8, 0, y + px * 0.05)
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.35, '#9fdcff')
      g.addColorStop(0.5, '#2a1660')
      g.addColorStop(0.53, '#ff9a3c')
      g.addColorStop(0.8, '#ffe9a8')
      g.addColorStop(1, '#ffffff')
      ctx.lineJoin = 'round'
      ctx.lineWidth = px * 0.16
      ctx.strokeStyle = '#1a0629'
      ctx.shadowColor = 'rgba(255,80,200,0.7)'
      ctx.shadowBlur = px * 0.6
      ctx.strokeText(s, W / 2, y)
      ctx.shadowBlur = 0
      ctx.fillStyle = g
      ctx.fillText(s, W / 2, y)
      const half = Math.min(ctx.measureText(s).width, max) / 2
      const glint = 0.5 + 0.5 * Math.sin(t * 0.06)
      sparkle(W / 2 + half - px * 0.3, y - px * 0.7, px * 0.5 * (0.6 + glint * 0.6), 0.6 + glint * 0.4)
      sparkle(W / 2 - half + px * 0.5, y - px * 0.1, px * 0.3 * (1.2 - glint * 0.6), 0.9 - glint * 0.4)
    }

    const caption = (s: string, y: number, size: number) => {
      ctx.font = `italic 600 ${size}px Georgia, serif`
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(40,0,60,0.9)'
      ctx.shadowBlur = 8
      ctx.fillStyle = '#fff1c9'
      ctx.fillText(s, W / 2, y)
      ctx.shadowBlur = 0
    }

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

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(backdrop, 0, 0)
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      drawStars()
      drawPlatforms()
      drawLava()
      enemies.forEach((e) => drawRider(e, false))
      drawRider(player, true)
      drawSparks()

      const top = H * 0.2
      if (mode === 'play') {
        ctx.font = 'italic 700 17px Georgia, serif'
        ctx.textAlign = 'left'
        ctx.shadowColor = 'rgba(40,0,60,0.9)'
        ctx.shadowBlur = 6
        ctx.fillStyle = '#fff1c9'
        ctx.fillText(`Score ${score}`, 18, 30)
        ctx.textAlign = 'right'
        ctx.fillText(`Wave ${wave}   ${'♥'.repeat(Math.max(0, lives))}`, W - 18, 30)
        ctx.shadowBlur = 0
      } else if (mode === 'attract') {
        chrome('SkyRiders', top, 64)
        caption('of the Velvet Sunset', top + 34, 22)
        if (Math.floor(t / 40) % 2) caption('Press SPACE or tap to ride', top + 72, 17)
      } else {
        chrome('Game Over', H * 0.38, 56)
        caption(`Score ${score}  ·  tap or press SPACE`, H * 0.38 + 44, 19)
      }
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
