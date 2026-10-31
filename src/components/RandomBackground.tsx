import { useEffect, useState } from 'react'
import { backgrounds } from '@/data/backgrounds'

const LAST_KEY = 'orlondorue:last-background'

// A random one, and never the same as the last visit (when the browser lets us remember it).
function pickIndex(): number {
  let last = -1
  try {
    last = Number(window.localStorage.getItem(LAST_KEY) ?? -1)
  } catch {}
  let next = Math.floor(Math.random() * backgrounds.length)
  if (backgrounds.length > 1 && next === last) next = (next + 1) % backgrounds.length
  try {
    window.localStorage.setItem(LAST_KEY, String(next))
  } catch {}
  return next
}

export default function RandomBackground() {
  const [index, setIndex] = useState<number | null>(null)
  const [still, setStill] = useState(false)
  const [ready, setReady] = useState(false)

  // Chosen after the page loads, so every visitor gets a fresh pick and the server page can stay static.
  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setIndex(pickIndex())
    const showAnyway = window.setTimeout(() => setReady(true), 3000)
    return () => window.clearTimeout(showAnyway)
  }, [])

  const item = index === null ? null : backgrounds[index]
  const fill = `absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out ${
    ready ? 'opacity-100' : 'opacity-0'
  }`

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#0b0c0f]">
      {item?.type === 'video' && !still ? (
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
          src={item.type === 'video' ? item.poster : item.src}
          alt=""
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
        />
      ) : null}
      {/* soft darkening so the name stays readable on any picture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,6,8,0.4)_100%)]" />
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" />
    </div>
  )
}
