import Head from 'next/head'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import RandomBackground from '@/components/RandomBackground'

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['300'], variable: '--font-serif' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })

export default function Home() {
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
      <main className={`${serif.variable} ${sans.variable} relative h-dvh w-full overflow-hidden bg-[#0b0c0f] text-white`}>
        <RandomBackground />
        <div className="rise absolute inset-x-6 bottom-10 sm:inset-x-12 sm:bottom-14">
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(3rem,10vw,7.5rem)] font-light leading-[0.95] tracking-tight">
            Orlondo Rue
          </h1>
          <p className="mt-5 max-w-md font-[family-name:var(--font-sans)] text-sm leading-relaxed text-white/70 sm:text-base">
            I make calm things with AI: images, video and the software behind them.
          </p>
        </div>
      </main>
    </>
  )
}
