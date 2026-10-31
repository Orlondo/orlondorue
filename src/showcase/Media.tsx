import { useState } from 'react'

type Props = { src: string; alt: string; kind?: 'image' | 'video'; label: string }

// Shows the file from /public/apps if it exists, and a quiet placeholder until it does.
export default function Media({ src, alt, kind = 'image', label }: Props) {
  const [missing, setMissing] = useState(false)
  const fill = 'block h-full w-full object-cover'
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#262b36] bg-[#171a21]">
      {missing ? (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-[#9aa3b5]">
          {label}
        </div>
      ) : kind === 'video' ? (
        <video className={fill} src={src} controls muted loop playsInline preload="metadata" onError={() => setMissing(true)} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={fill} src={src} alt={alt} loading="lazy" onError={() => setMissing(true)} />
      )}
    </div>
  )
}
