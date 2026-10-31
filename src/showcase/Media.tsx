import { useState } from 'react'
import styles from './apps.module.css'

type Props = { src: string; alt: string; kind?: 'image' | 'video'; label: string }

// Shows the file from /public/apps if it exists, and a quiet placeholder until it does.
export default function Media({ src, alt, kind = 'image', label }: Props) {
  const [missing, setMissing] = useState(false)
  return (
    <div className={styles.shot}>
      {missing ? (
        <div className={styles.placeholder}>{label}</div>
      ) : kind === 'video' ? (
        <video src={src} controls muted loop playsInline preload="metadata" onError={() => setMissing(true)} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" onError={() => setMissing(true)} />
      )}
    </div>
  )
}
