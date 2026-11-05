import { useEffect, useRef } from 'react'

// SkyRiders of the Velvet Sunset: an original flap-and-collide arcade game with a 70s airbrushed van-mural look.
// A hero on a winged horse battles sorcerers on griffins above a molten lake. Whoever is higher when they meet wins.
// When nobody is playing it runs an attract mode where the hero flies itself.
//
// The game fills whatever box it is given. The world is 500 units tall on wide screens and 400 units wide on tall
// ones, and stretches along the other side to match the screen, so nothing is cropped or letterboxed.

const GRAVITY = 0.22
const FLAP = -4.2

type Rider = { x: number; y: number; vx: number; vy: number; dir: number; wing: number; alive: boolean; safe: number }
type Mode = 'attract' | 'play' | 'over'
type Platform = { x: number; y: number; w: number }

// Ledges as fractions of the world, so they spread out on any screen shape.
const LEDGES = [
  { fx: 0.1, fy: 0.72, fw: 0.2 },
  { fx: 0.7, fy: 0.72, fw: 0.2 },
  { fx: 0.375, fy: 0.5, fw: 0.25 },
  { fx: 0.05, fy: 0.3, fw: 0.18 },
  { fx: 0.77, fy: 0.3, fw: 0.18 },
]

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
    let platforms: Platform[] = []

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
      platforms = LEDGES.map((l) => ({ x: l.fx * W, y: l.fy * H, w: Math.max(90, l.fw * W) }))
      // draw at the screen's real resolution so the art stays crisp
      const scale = (cw / W) * (window.devicePixelRatio || 1)
      canvas.width = Math.round(W * scale)
      canvas.height = Math.round(H * scale)
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
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
      startWave()
    }
    reset()

    const flap = (r: Rider) => {
      r.vy = FLAP
      r.wing = 8
      if (r === player && mode === 'play') beep(220, 0.05)
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
          beep(110)
        } else if (player.y < e.y) {
          e.alive = false
          score += 500
          beep(660, 0.15, 'triangle')
        } else if (player.safe === 0) {
          loseLife()
          return
        }
      }
    }

    // ---- drawing: 70s airbrushed van-mural look ----
    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#2b0a4a')
      g.addColorStop(0.45, '#9b2f7a')
      g.addColorStop(0.75, '#ff7a3d')
      g.addColorStop(1, '#ffd166')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // stars in the upper sky
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      const starCount = Math.round(W / 20)
      for (let i = 0; i < starCount; i++) {
        const sx = (i * 197) % W
        const sy = (i * 83) % (H * 0.32)
        if ((i + Math.floor(t / 30)) % 7) ctx.fillRect(sx, sy, 2, 2)
      }

      const sunY = H * 0.66
      const sun = ctx.createRadialGradient(W / 2, sunY, 10, W / 2, sunY, 170)
      sun.addColorStop(0, 'rgba(255,240,180,0.95)')
      sun.addColorStop(1, 'rgba(255,120,60,0)')
      ctx.fillStyle = sun
      ctx.beginPath()
      ctx.arc(W / 2, sunY, 170, 0, Math.PI * 2)
      ctx.fill()

      // a pale ringed planet
      const px = W * 0.81
      const py = H * 0.16
      ctx.fillStyle = 'rgba(190,225,255,0.55)'
      ctx.beginPath()
      ctx.arc(px, py, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,230,200,0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(px, py, 60, 12, -0.3, 0, Math.PI * 2)
      ctx.stroke()

      // misty mountains
      ctx.fillStyle = '#3a1450'
      ctx.beginPath()
      ctx.moveTo(0, LAVA_Y)
      for (let x = 0; x <= W + 80; x += 80) ctx.lineTo(x, LAVA_Y - 60 - Math.sin(x * 0.02) * 40)
      ctx.lineTo(W, LAVA_Y)
      ctx.fill()
    }

    const drawLava = () => {
      const g = ctx.createLinearGradient(0, LAVA_Y, 0, H)
      g.addColorStop(0, '#ff4d00')
      g.addColorStop(1, '#7a0000')
      ctx.fillStyle = g
      ctx.fillRect(0, LAVA_Y + Math.sin(t * 0.05) * 2, W, 50)
    }

    const drawPlatforms = () => {
      for (const p of platforms) {
        const g = ctx.createLinearGradient(0, p.y, 0, p.y + 12)
        g.addColorStop(0, '#e0e0ff')
        g.addColorStop(1, '#6a4c93')
        ctx.fillStyle = g
        ctx.fillRect(p.x, p.y, p.w, 12)
      }
    }

    // Hero: a pale winged horse with a cyan-cloaked rider. Foes: bronze griffins with crimson sorcerers.
    const drawRider = (r: Rider, hero: boolean) => {
      if (!r.alive) return
      if (hero && r.safe > 0 && Math.floor(t / 4) % 2) return // blink while protected after a respawn
      ctx.save()
      ctx.translate(r.x, r.y)
      ctx.scale(r.dir, 1)
      ctx.fillStyle = hero ? '#fdf6e3' : '#6b4a2b'
      ctx.beginPath()
      ctx.ellipse(0, 4, 16, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(12, -4, 6, 8) // neck and head
      ctx.fillStyle = hero ? '#ffe9a8' : '#b07a3b'
      const up = r.wing > 0 ? -18 : -6
      ctx.beginPath()
      ctx.moveTo(-4, 0)
      ctx.lineTo(-14, up)
      ctx.lineTo(6, 0)
      ctx.fill()
      ctx.fillStyle = hero ? '#00e5ff' : '#c0392b'
      ctx.fillRect(-3, -14, 6, 12)
      ctx.strokeStyle = hero ? '#ffffff' : '#ffb3f0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(3, -8)
      ctx.lineTo(20, -12)
      ctx.stroke()
      ctx.restore()
    }

    // Centered title text that shrinks to fit narrow screens.
    const title = (s: string, y: number, size = 28) => {
      let px = size
      ctx.font = `bold ${px}px Georgia, serif`
      const max = W - 40
      const width = ctx.measureText(s).width
      if (width > max) {
        px = Math.max(12, Math.floor((size * max) / width))
        ctx.font = `bold ${px}px Georgia, serif`
      }
      ctx.textAlign = 'center'
      ctx.fillStyle = '#2b0a4a'
      ctx.fillText(s, W / 2 + 3, y + 3)
      ctx.fillStyle = '#ffe066'
      ctx.fillText(s, W / 2, y)
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

      drawSky()
      drawPlatforms()
      drawLava()
      enemies.forEach((e) => drawRider(e, false))
      drawRider(player, true)

      const top = H * 0.2
      if (mode === 'play') {
        ctx.font = '16px monospace'
        ctx.textAlign = 'left'
        ctx.fillStyle = '#fff'
        ctx.fillText(`SCORE ${score}   LIVES ${lives}   WAVE ${wave}`, 16, 28)
      } else if (mode === 'attract') {
        title('SKYRIDERS OF THE VELVET SUNSET', top, 34)
        if (Math.floor(t / 40) % 2) title('Press SPACE or tap to ride', top + 44, 20)
      } else {
        title('GAME OVER', H * 0.4, 44)
        title(`Score ${score}  ·  tap or press SPACE`, H * 0.4 + 50, 20)
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
