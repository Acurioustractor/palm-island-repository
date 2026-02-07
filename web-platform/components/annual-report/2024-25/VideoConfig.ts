/**
 * Video Configuration for Annual Report 2024-25
 *
 * Each slot sits as a full-screen snap between two content sections.
 * - Empty url → dark gradient placeholder with caption text
 * - MP4/WebM path → autoplay muted loop video (e.g. '/video/clip.mp4')
 * - YouTube/Vimeo URL → embedded player
 *
 * To add video: drop an MP4 into public/video/, set the url below, redeploy.
 */

export interface VideoSlot {
  url: string;
  caption: string;
  subcaption?: string;
  poster: string;
}

export const VIDEO_SLOTS: Record<string, VideoSlot> = {
  // After Acknowledgment of Country → before CEO Message
  leadership: {
    url: '',
    caption: 'Our Leadership',
    subcaption: 'Guiding Palm Island forward',
    poster: '',
  },

  // After Chair Message → before Impact Numbers
  communityLife: {
    url: '',
    caption: 'Community Life',
    subcaption: 'The heart of Palm Island',
    poster: '',
  },

  // After Impact Numbers → before Services
  servicesIntro: {
    url: '',
    caption: 'Our Services in Action',
    subcaption: '33 programs, one community',
    poster: '',
  },

  // After Service Map → before Innovation
  onCountry: {
    url: '',
    caption: 'On Country',
    subcaption: 'Delivering services where they matter',
    poster: '',
  },

  // After Innovation → before Data Visualizations
  innovation: {
    url: '',
    caption: 'Innovation on Palm Island',
    subcaption: 'Building the future, our way',
    poster: '',
  },

  // After Financial Summary → before Board of Directors
  governance: {
    url: '',
    caption: 'Our People',
    subcaption: 'Community-controlled, community-led',
    poster: '',
  },

  // After Board → before Elder Portraits
  elders: {
    url: '',
    caption: 'Our Elders',
    subcaption: 'Wisdom, strength, culture',
    poster: '',
  },

  // After Elder Portraits → before Community Stories
  voices: {
    url: '',
    caption: 'Community Voices',
    subcaption: 'Stories from Palm Island',
    poster: '',
  },

  // After Community Stories → before Photo Gallery
  gallery: {
    url: '',
    caption: 'A Year in Pictures',
    subcaption: '2024–25',
    poster: '',
  },

  // After Photo Gallery → before Road to 20 Years / CTA
  lookingForward: {
    url: '',
    caption: 'Looking Forward',
    subcaption: 'The road to 20 years',
    poster: '',
  },
};
