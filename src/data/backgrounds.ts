// The pictures and clips the homepage picks from, one at random per visit.
// Files live in /public/backgrounds. To add one, drop the file there and add a line here.
// A clip needs a poster: a still frame shown while it loads, and to people who prefer less motion.
// The game is the SkyRiders arcade game, filling the screen and playing itself until someone joins in.
// It is skipped for people who prefer less motion.
export type Background =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; poster: string }
  | { type: 'game' }

export const backgrounds: Background[] = [
  { type: 'image', src: '/backgrounds/liminal-02.jpg' },
  { type: 'image', src: '/backgrounds/liminal-06.jpg' },
  { type: 'image', src: '/backgrounds/liminal-09.jpg' },
  { type: 'image', src: '/backgrounds/liminal-10.jpg' },
  { type: 'image', src: '/backgrounds/liminal-12.jpg' },
  { type: 'image', src: '/backgrounds/liminal-16.jpg' },
  { type: 'image', src: '/backgrounds/liminal-b-01.jpg' },
  { type: 'image', src: '/backgrounds/liminal-b-05.jpg' },
  { type: 'image', src: '/backgrounds/liminal-b-09.jpg' },
  { type: 'image', src: '/backgrounds/living-01.jpg' },
  { type: 'image', src: '/backgrounds/living-03.jpg' },
  { type: 'video', src: '/backgrounds/clip-1.mp4', poster: '/backgrounds/clip-1-poster.jpg' },
  { type: 'game' },
]
