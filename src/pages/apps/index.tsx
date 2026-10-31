import Head from 'next/head'
import Media from '@/showcase/Media'
import styles from '@/showcase/apps.module.css'

export default function Apps() {
  return (
    <>
      <Head>
        <title>Apps | Orlondo Rue</title>
        <meta
          name="description"
          content="Two tools for making calm interior-design videos: an AI interior image generator and a studio that turns images into finished YouTube videos."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.page}>
        <div className={styles.wrap}>
          <header className={styles.hero}>
            <h1>Apps</h1>
            <p>
              Two tools I built to make calm, good-looking interior videos without a camera crew: one makes the
              pictures, the other turns them into a finished video.
            </p>
          </header>

          <section className={styles.app} id="interior-image-factory">
            <span className={styles.tag}>App 1 · Images</span>
            <h2>Interior Image Factory</h2>
            <p className={styles.lead}>
              Generates sets of AI interior photographs, room by room, in styles you choose. Ask for several angles
              of one room, or one house look carried across every room, so a set feels like a single place.
            </p>
            <div className={styles.shots}>
              <Media src="/apps/images-1.png" alt="Interior Image Factory setup screen" label="Screenshot: setup" />
              <Media src="/apps/images-2.png" alt="A generated set of rooms" label="Screenshot: a generated set" />
              <Media src="/apps/images-demo.mp4" kind="video" alt="" label="Short demo" />
            </div>
            <ul className={styles.features}>
              <li>Pick room types, styles and how many images you want</li>
              <li>Several angles of the same room</li>
              <li>One consistent house look across rooms</li>
              <li>Large sets run as a batch, to keep the cost down</li>
              <li>Shows the cost and the prompts before it starts</li>
            </ul>
          </section>

          <section className={styles.app} id="channel-studio">
            <span className={styles.tag}>App 2 · Video</span>
            <h2>Channel Studio</h2>
            <p className={styles.lead}>
              Takes a folder of images and makes a finished YouTube video: slow motion, soft dissolves, music, optional
              AI narration and captions, a thumbnail, and a checklist for the upload.
            </p>
            <div className={styles.shots}>
              <Media src="/apps/studio-1.png" alt="Channel Studio project screen" label="Screenshot: a project" />
              <Media src="/apps/studio-2.png" alt="Channel Studio clips step" label="Screenshot: room clips" />
              <Media src="/apps/studio-demo.mp4" kind="video" alt="" label="Short demo" />
            </div>
            <ul className={styles.features}>
              <li>Slow-motion images with crossfades, or short AI room clips</li>
              <li>Narration in AI voices, timed to each image</li>
              <li>Music, room sounds and automatic loudness</li>
              <li>Captions, titles and a thumbnail</li>
              <li>Spending tracker so costs stay visible</li>
              <li>Saved presets for each channel</li>
            </ul>
            <p className={styles.note}>
              Videos made with these tools use AI-generated images, and are labelled that way.
            </p>
          </section>

          <footer className={styles.footer}>
            <a href="/">Home</a>
          </footer>
        </div>
      </div>
    </>
  )
}
