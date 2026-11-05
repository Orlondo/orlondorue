import { useEffect, useState } from 'react'
import Head from 'next/head'
import { JetBrains_Mono, Manrope } from 'next/font/google'
import RandomBackground from '@/components/RandomBackground'
import SkyRiders from '@/components/SkyRiders'

const sans = Manrope({ subsets: ['latin'], weight: ['300'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['300'], variable: '--font-mono-face' })

type Face = 'sans' | 'mono'
const FACE_KEY = 'orlondorue:face'

// The name switches between the two faces on every visit (the first visit picks at random).
function nextFace(): Face {
  let last: string | null = null
  try {
    last = window.localStorage.getItem(FACE_KEY)
  } catch {}
  const next: Face = last === 'sans' ? 'mono' : last === 'mono' ? 'sans' : Math.random() < 0.5 ? 'sans' : 'mono'
  try {
    window.localStorage.setItem(FACE_KEY, next)
  } catch {}
  return next
}

export default function Home() {
  const [face, setFace] = useState<Face | null>(null)
  useEffect(() => setFace(nextFace()), [])
  const family = face === 'mono' ? 'font-[family-name:var(--font-mono-face)]' : 'font-[family-name:var(--font-sans)]'

  return (
    <>
      <Head>
        <title>Orlondo Rue</title>
        <meta name="description" content="Orlondo Rue. Calm images, video and the software behind them." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0c0f" />
        <link rel="icon" href="/favicon.ico" />
        <script>window.dataLayer = window.dataLayer || [];</script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-WZT5FT');
            `,
          }}
        />
      </Head>
      <main className={`${sans.variable} ${mono.variable} relative h-dvh w-full overflow-hidden bg-[#0b0c0f] text-white`}>
        <RandomBackground />
        {/* a small arcade window over the rotating media, playing itself until someone taps in */}
        <div className="rise absolute inset-x-7 top-7 overflow-hidden rounded-xl border border-white/15 shadow-2xl shadow-black/50 sm:inset-x-auto sm:top-auto sm:right-10 sm:bottom-10 sm:w-[min(420px,40vw)]">
          <SkyRiders />
        </div>
        <div
          className={`${face ? 'rise' : 'opacity-0'} ${family} absolute inset-x-7 bottom-8 sm:inset-x-10 sm:bottom-10`}
        >
          <h1 className="text-sm font-light uppercase tracking-[0.4em] text-white/80 sm:text-lg">
            Orlondo Rue
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed tracking-wide text-white/40">
            I make calm things with AI: images, video and the software behind them.
          </p>
        </div>
      </main>
    </>
  )
}
