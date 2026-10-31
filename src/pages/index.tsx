import { useEffect, useState } from 'react'
import Head from 'next/head'
import { JetBrains_Mono, Manrope } from 'next/font/google'
import RandomBackground from '@/components/RandomBackground'

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
        <div
          className={`${face ? 'rise' : 'opacity-0'} ${family} absolute inset-x-6 bottom-10 sm:inset-x-12 sm:bottom-14`}
        >
          <h1 className="text-[clamp(2.75rem,9.5vw,7rem)] font-light leading-[0.95] tracking-tight">
            Orlondo Rue
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            I make calm things with AI: images, video and the software behind them.
          </p>
        </div>
      </main>
    </>
  )
}
