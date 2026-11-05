import { useEffect, useState } from 'react'
import { backgrounds, type Background } from '@/data/backgrounds'
import SkyRiders from '@/components/SkyRiders'

const LAST_KEY = 'orlondorue:last-background'

// A random one, and never the same as the last visit (when the browser lets us remember it).
// People who prefer less motion never get the game.
function pickIndex(still: boolean): number {
  let last = -1
  try {
    last = Number(window.localStorage.getItem(LAST_KEY) ?? -1)
  } catch {}
  const allowed = backgrounds.map((_, i) => i).filter((i) => !(still && backgrounds[i].type === 'game'))
  let pos = Math.floor(Math.random() * allowed.length)
  if (allowed.length > 1 && allowed[pos] === last) pos = (pos + 1) % allowed.length
  const next = allowed[pos]
  try {
    window.localStorage.setItem(LAST_KEY, String(next))
  } catch {}
  return next
}

// `onPick` tells the page which kind of background it got, so it can step aside for the game.
export default function RandomBackground({ onPick }: { onPick?: (type: Background['type']) => void }) {
  const [index, setIndex] = useState<number | null>(null)
  const [still, setStill] = useState(false)
  const [ready, setReady] = useState(false)

  // Chosen after the page loads, so every visitor gets a fresh pick and the server page can stay static.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setStill(reduce)
    // Adding ?bg=game to the address always shows the game, which is handy for checking it.
    const forceGame = new URLSearchParams(window.location.search).get('bg') === 'game'
    const gameIndex = backgrounds.findIndex((b) => b.type === 'game')
    const picked = forceGame && gameIndex >= 0 ? gameIndex : pickIndex(reduce)
    setIndex(picked)
    onPick?.(backgrounds[picked].type)
    if (backgrounds[picked].type === 'game') setReady(true)
    const showAnyway = window.setTimeout(() => setReady(true), 3000)
    return () => window.clearTimeout(showAnyway)
  }, []) // chosen once per visit

  const item = index === null ? null : backgrounds[index]
  const fill = `absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out ${
    ready ? 'opacity-100' : 'opacity-0'
  }`

  return (
    <div aria-hidden={item?.type === 'game' ? undefined : true} className="absolute inset-0 overflow-hidden bg-[#0b0c0f]">
      {item?.type === 'game' ? (
        <SkyRiders className={fill} />
      ) : item?.type === 'video' && !still ? (
        <video
          className={fill}
          src={item.src}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setReady(true)}
          onError={() => setReady(true)}
        />
      ) : item ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`${fill} ${still ? '' : 'bg-drift'}`}
          src={item.type === 'image' ? item.src : item.poster}
          alt=""
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
        />
      ) : null}
      {/* soft darkening so the name stays readable on any picture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,6,8,0.4)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" />
    </div>
  )
}
