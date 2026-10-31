import Head from 'next/head'
import Media from '@/showcase/Media'

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
      <div className="min-h-screen bg-[#0f1115] text-[#e8eaf0] font-sans leading-relaxed">
        <div className="mx-auto max-w-[1040px] px-4 pb-20">
          <header className="pt-[72px] pb-10">
            <h1 className="mb-3 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight">Apps</h1>
            <p className="max-w-[640px] text-lg text-[#9aa3b5]">
              Two tools I built to make calm, good-looking interior videos without a camera crew: one makes the
              pictures, the other turns them into a finished video.
            </p>
          </header>

          <section className="border-t border-[#262b36] py-12" id="interior-image-factory">
            <span className="text-sm uppercase tracking-widest text-[#8ab4ff]">App 1 · Images</span>
            <h2 className="mb-1.5 text-[1.7rem] font-semibold">Interior Image Factory</h2>
            <p className="mt-2 mb-6 max-w-[680px] text-[#9aa3b5]">
              Generates sets of AI interior photographs, room by room, in styles you choose. Ask for several angles
              of one room, or one house look carried across every room, so a set feels like a single place.
            </p>
            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
              <Media src="/apps/images-1.png" alt="Interior Image Factory setup screen" label="Screenshot: setup" />
              <Media src="/apps/images-2.png" alt="A generated set of rooms" label="Screenshot: a generated set" />
              <Media src="/apps/images-demo.mp4" kind="video" alt="" label="Short demo" />
            </div>
            <ul className="mb-2 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-6 gap-y-3 p-0 [&>li]:relative [&>li]:pl-[18px] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.65em] [&>li]:before:h-[7px] [&>li]:before:w-[7px] [&>li]:before:rounded-full [&>li]:before:bg-[#8ab4ff] [&>li]:before:content-['']">
              <li>Pick room types, styles and how many images you want</li>
              <li>Several angles of the same room</li>
              <li>One consistent house look across rooms</li>
              <li>Large sets run as a batch, to keep the cost down</li>
              <li>Shows the cost and the prompts before it starts</li>
            </ul>
          </section>

          <section className="border-t border-[#262b36] py-12" id="channel-studio">
            <span className="text-sm uppercase tracking-widest text-[#8ab4ff]">App 2 · Video</span>
            <h2 className="mb-1.5 text-[1.7rem] font-semibold">Channel Studio</h2>
            <p className="mt-2 mb-6 max-w-[680px] text-[#9aa3b5]">
              Takes a folder of images and makes a finished YouTube video: slow motion, soft dissolves, music, optional
              AI narration and captions, a thumbnail, and a checklist for the upload.
            </p>
            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
              <Media src="/apps/studio-1.png" alt="Channel Studio project screen" label="Screenshot: a project" />
              <Media src="/apps/studio-2.png" alt="Channel Studio clips step" label="Screenshot: room clips" />
              <Media src="/apps/studio-demo.mp4" kind="video" alt="" label="Short demo" />
            </div>
            <ul className="mb-2 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-6 gap-y-3 p-0 [&>li]:relative [&>li]:pl-[18px] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.65em] [&>li]:before:h-[7px] [&>li]:before:w-[7px] [&>li]:before:rounded-full [&>li]:before:bg-[#8ab4ff] [&>li]:before:content-['']">
              <li>Slow-motion images with crossfades, or short AI room clips</li>
              <li>Narration in AI voices, timed to each image</li>
              <li>Music, room sounds and automatic loudness</li>
              <li>Captions, titles and a thumbnail</li>
              <li>Spending tracker so costs stay visible</li>
              <li>Saved presets for each channel</li>
            </ul>
            <p className="mt-4 text-sm text-[#9aa3b5]">
              Videos made with these tools use AI-generated images, and are labelled that way.
            </p>
          </section>

          <footer className="border-t border-[#262b36] pt-6 text-sm text-[#9aa3b5] [&_a]:text-[#8ab4ff]">
            <a href="/">Home</a>
          </footer>
        </div>
      </div>
    </>
  )
}
