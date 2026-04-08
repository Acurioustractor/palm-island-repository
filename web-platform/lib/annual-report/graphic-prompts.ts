/**
 * Gemini image generation prompts for annual report pages.
 *
 * Each prompt is crafted for PICC brand alignment:
 *   - Palm Island tropical setting
 *   - Warm golden light, teal ocean, ochre earth tones
 *   - Cinematic quality, culturally respectful
 *   - No stereotypical imagery — focus on strength, celebration, community
 */

export interface GraphicPrompt {
  pageKey: string
  filename: string
  aspectRatio: '16:9' | '3:4' | '1:1'
  prompt: string
  label: string
}

const BRAND_SUFFIX =
  'Palm Island tropical setting, warm golden light, teal ocean (#0B4F6C), ochre earth tones (#C8963E), cinematic photographic quality, culturally respectful, no stereotypical imagery, focus on strength and celebration.'

function withBrand(prompt: string): string {
  return `${prompt} ${BRAND_SUFFIX}`
}

export const GRAPHIC_PROMPTS: GraphicPrompt[] = [
  {
    pageKey: 'cover',
    filename: 'cover-hero.jpg',
    aspectRatio: '3:4',
    label: 'Cover Hero',
    prompt: withBrand(
      'Aerial golden-hour photograph of a lush tropical island surrounded by turquoise waters. Green hills covered in tropical vegetation, sandy beaches catching warm sunset light. Sweeping cinematic drone perspective looking down at the island, clouds tinged with orange and pink. No text or overlays.'
    ),
  },
  {
    pageKey: 'acknowledgement',
    filename: 'acknowledgement-art.jpg',
    aspectRatio: '16:9',
    label: 'Acknowledgement',
    prompt: withBrand(
      'Abstract art inspired by Indigenous Australian dot painting patterns featuring turtle and reef motifs. Rich palette of ochre (#C8963E), deep teal (#0B4F6C), coral (#E8600A), and warm gold (#F5A623) on a dark earthy background. Flowing organic shapes suggesting connection to sea and country. Contemporary Indigenous art style, respectful and celebratory. No text.'
    ),
  },
  {
    pageKey: 'contents',
    filename: 'palm-island-map-v2.jpg',
    aspectRatio: '3:4',
    label: 'Contents / Map',
    prompt: withBrand(
      'Illustrated watercolor-style map of a tropical island. Bird-eye view showing green hills, sandy beaches, small township buildings, a jetty, roads winding through palm trees. Warm watercolor palette with teal ocean surrounding the island. Artistic hand-drawn quality, soft edges. No text or labels.'
    ),
  },
  {
    pageKey: 'communityVoices',
    filename: 'community-gathering.jpg',
    aspectRatio: '16:9',
    label: 'Community Voices',
    prompt: withBrand(
      'Warm photograph of a diverse community gathering outdoors under palm trees on a tropical island. People of all ages smiling and conversing, some seated in a circle, dappled golden sunlight filtering through leaves. Genuine warmth and connection. Natural candid moment of celebration and togetherness. No text.'
    ),
  },
  {
    pageKey: 'youthVoices',
    filename: 'youth-energy.jpg',
    aspectRatio: '16:9',
    label: 'Youth Voices',
    prompt: withBrand(
      'Vibrant photograph of young Indigenous Australian children playing sport and doing arts outdoors on a tropical island. Energetic movement, bright colours, kids laughing and active under blue sky with palm trees. Captures joy, energy, and potential. Warm afternoon light. No text.'
    ),
  },
  {
    pageKey: 'governance',
    filename: 'governance-board.jpg',
    aspectRatio: '16:9',
    label: 'Governance',
    prompt: withBrand(
      'Professional photograph of a boardroom meeting in a tropical setting. Diverse group of professionals seated around a wooden table, warm natural light from large windows showing tropical greenery outside. Respectful authority, collaborative discussion. Modern community office environment. No text.'
    ),
  },
  {
    pageKey: 'services',
    filename: 'services-delivery.jpg',
    aspectRatio: '16:9',
    label: 'Services',
    prompt: withBrand(
      'Warm photograph of community service workers helping people in a tropical island setting. Healthcare and family support scene — a worker in professional attire assisting community members in a bright, modern community building. Genuine care and professionalism. Warm indoor lighting with tropical greenery visible through windows. No text.'
    ),
  },
  {
    pageKey: 'journey',
    filename: 'journey-timeline-v2.jpg',
    aspectRatio: '16:9',
    label: 'Journey Timeline',
    prompt: withBrand(
      'Aerial panoramic photograph of a tropical island at golden hour. Wide sweeping vista showing the entire island from high above — green hills meeting turquoise ocean, small township visible, golden light connecting past landscapes to the present. Epic cinematic scale, sense of deep history and continuity. No text.'
    ),
  },
  {
    pageKey: 'resilience',
    filename: 'next-20-sunrise.jpg',
    aspectRatio: '16:9',
    label: 'Next 20 Years',
    prompt: withBrand(
      'Dramatic sunrise over a tropical island, viewed from the shoreline. Stepping stones or a natural rock path leading into calm turquoise waters reflecting golden dawn light. Silhouette of tropical hills in the background. Hopeful, forward-looking atmosphere. Sense of a new beginning and bright future. No text.'
    ),
  },
  {
    pageKey: 'backCover',
    filename: 'back-cover-reef.jpg',
    aspectRatio: '3:4',
    label: 'Back Cover',
    prompt: withBrand(
      'Stylised underwater scene of a coral reef with a sea turtle gliding through clear tropical waters. Beautiful coral formations in teal, ochre, and warm gold. Shafts of sunlight penetrating the water from above. Artistic quality blending photorealism with painterly style. Sense of partnership with nature and protection of the reef. No text.'
    ),
  },
  {
    pageKey: 'highlights',
    filename: 'highlights-mosaic.jpg',
    aspectRatio: '16:9',
    label: 'Highlights',
    prompt: withBrand(
      'Colourful photographic mosaic showing vignettes of tropical island community life. Multiple small scenes: people cooking together, children at school, community events, sports, art workshops, nature. Arranged as an artistic collage with warm golden tones tying everything together. Celebratory and vibrant. No text.'
    ),
  },
  {
    pageKey: 'photos',
    filename: 'photo-spread-bg.jpg',
    aspectRatio: '16:9',
    label: 'Photo Spread Background',
    prompt: withBrand(
      'Soft abstract watercolour background in muted tropical tones — pale teal, soft ochre, sandy beige, gentle coral washes. Subtle organic shapes suggesting palm fronds and ocean waves. Very light and ethereal, designed as a backdrop for overlaying photographs. Minimal, no focal point, low contrast. No text.'
    ),
  },
]

/** Lookup a graphic prompt by page key */
export function getGraphicPrompt(pageKey: string): GraphicPrompt | undefined {
  return GRAPHIC_PROMPTS.find((p) => p.pageKey === pageKey)
}

/** All page keys that have graphic prompts */
export const GRAPHIC_PAGE_KEYS = GRAPHIC_PROMPTS.map((p) => p.pageKey)
