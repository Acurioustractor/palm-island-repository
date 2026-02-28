import photoManifest from '@/content/photo-manifest.json'

export interface PhotoEntry {
  path: string
  year: string
  description: string
}

// Shorthand for archive photo paths
const A = (name: string) => `/archive-photos/${name}`

/**
 * Chapter hero images — hand-curated to match each era's theme.
 * Historical chapters use Queensland State Archives photos from Wikimedia Commons.
 * Modern chapters use PICC annual report photos.
 */
const CHAPTER_HERO_IMAGES: Record<string, string> = {
  // View from Mount Bentley showing Bwgcolman country
  manbarra: A('view-from-mount-bently-great-palm-island-bwgcolman.jpg'),
  // Settlement from the sea, c.1935 — the reserve as arrivals first saw it
  reserve: A('queensland-state-archives-1384-palm-island-an-aboriginals-settlement-from-the-sea-c-1935.png'),
  // Hull River settlement clearing towards sea and Dunk Island, c.1915
  'hull-river': A('mbhs-hull-river-clearing-towards-sea-1915.png'),
  // Dancers in traditional body paint, 1931 — many tribes, many cultures
  languages: A('queensland-state-archives-5797-dancers-palm-island-june-1931.png'),
  // Boys dormitory, Palm Island, June 1931
  dormitories: A('queensland-state-archives-5813-boys-dormitory-palm-island-june-1931.png'),
  // Residents of Palm Island, June 1931 — community solidarity
  'strike-1957': A('queensland-state-archives-5795-residents-of-palm-island-june-1931.png'),
  // Community gathering at sunset with liaison officers — memorial/justice
  mulrunji: '/annual-report-photos/2018-19/photo-009.jpg',
  // Man proudly standing next to PICC-branded vehicle — community ownership
  'self-determination': '/annual-report-photos/2011-12/photo-009.jpg',
  // Group of men standing together on coastal path — community today (modern)
  picc: '/annual-report-photos/2017-18/photo-006.jpg',
}

/**
 * Gallery photos per chapter — archive photos for historical chapters,
 * annual report photos for modern chapters.
 */
const CHAPTER_GALLERY_PHOTOS: Record<string, PhotoEntry[]> = {
  manbarra: [
    { path: A('view-of-palm-island-from-wallaby-point.jpg'), year: '1900', description: 'View of Palm Island from Wallaby Point' },
    { path: A('palm-island-north-east-bay.jpg'), year: '1900', description: 'Palm Island, North East Bay' },
    { path: A('palm-island.jpg'), year: '1900', description: 'Palm Island' },
    { path: A('fantome-and-orpheus-islands-taken-from-palm-island.jpg'), year: '1900', description: 'Fantome and Orpheus Islands taken from Palm Island' },
    { path: A('statelibqld-1-242268-on-the-beach-at-palm-island-in-north-queensland.jpg'), year: '1930', description: 'On the beach at Palm Island in North Queensland' },
    { path: A('palm-island-swimming-hole-palm-valley.jpg'), year: '1900', description: 'Palm Island swimming hole — Palm Valley' },
    { path: A('road-up-mount-bently-palm-island.jpg'), year: '1900', description: 'Road up Mount Bentley, Palm Island' },
    { path: A('palm-island-jetty.jpg'), year: '1900', description: 'Palm Island jetty' },
  ],
  reserve: [
    { path: A('queensland-state-archives-886-palm-island-north-queensland-c-1928.png'), year: '1928', description: 'Palm Island, North Queensland, c.1928 — Queensland State Archives' },
    { path: A('queensland-state-archives-917-palm-island-north-queensland-c-1931.png'), year: '1931', description: 'Palm Island, North Queensland, c.1931 — Queensland State Archives' },
    { path: A('queensland-state-archives-1357-palm-island-showing-guest-house-and-school-c-1935.png'), year: '1935', description: 'Palm Island showing guest house and school, c.1935' },
    { path: A('queensland-state-archives-1358-palm-island-showing-the-hospital-on-right-c-1935.png'), year: '1935', description: 'Palm Island showing the hospital on right, c.1935' },
    { path: A('queensland-state-archives-1362-main-street-palm-island-showing-mango-trees-and-palms-c-1935.png'), year: '1935', description: 'Main Street, Palm Island, showing mango trees and palms, c.1935' },
    { path: A('queensland-state-archives-1360-coconut-palm-avenue-palm-island-c-1935.png'), year: '1935', description: 'Coconut palm avenue, Palm Island, c.1935' },
    { path: A('queensland-state-archives-1355-palm-island-c-1935.png'), year: '1935', description: 'Palm Island, c.1935 — Queensland State Archives' },
    { path: A('queensland-state-archives-1385-huts-built-from-palm-leaves-and-roofed-with-grass-palm-island-c-1935.png'), year: '1935', description: 'Huts built from palm leaves and roofed with grass, Palm Island, c.1935' },
  ],
  'hull-river': [
    { path: A('mbhs-hull-river-settlement-group-1916.jpg'), year: '1916', description: 'Large group at Hull River Aboriginal Settlement, 1916' },
    { path: A('mbhs-kenny-family-hull-river-1914.jpg'), year: '1914', description: 'Superintendent Kenny family at Hull River, c.1914' },
    { path: A('slq-1918-cyclone-innisfail-panorama-1.png'), year: '1918', description: 'Cyclone damage panorama, Innisfail, March 1918 — State Library of Queensland' },
    { path: A('slq-1918-cyclone-innisfail-panorama-2.png'), year: '1918', description: 'Cyclone devastation, downtown Innisfail, 1918 — State Library of Queensland' },
    { path: A('slq-1918-cyclone-mackay-damage.png'), year: '1918', description: 'Cyclone damage, Mackay street, January 1918 — State Library of Queensland' },
    { path: A('mbhs-mija-memorial-hull-river.jpg'), year: '2000', description: 'Mija Memorial, Hull River — Mission Beach Historical Society' },
    { path: A('queensland-state-archives-1352-the-beach-palm-island-looking-south-c-1935.png'), year: '1935', description: 'The beach, Palm Island, looking south, c.1935' },
    { path: A('queensland-state-archives-1202-tourist-boat-off-palm-island-c-1931.png'), year: '1931', description: 'Tourist boat off Palm Island, c.1931' },
  ],
  languages: [
    { path: A('queensland-state-archives-5800-dancers-palm-island-june-1931.png'), year: '1931', description: 'Dancers, Palm Island, June 1931' },
    { path: A('queensland-state-archives-1366-a-native-preparing-for-a-war-dance-at-palm-island-c-1935.png'), year: '1935', description: 'A native preparing for a war dance at Palm Island, c.1935' },
    { path: A('queensland-state-archives-1380-palm-island-natives-in-war-paint-c-1935.png'), year: '1935', description: 'Palm Island natives in war paint, c.1935' },
    { path: A('queensland-state-archives-1350-a-typical-palm-island-native-c-1935.png'), year: '1935', description: 'A typical Palm Island native, c.1935' },
    { path: A('queensland-state-archives-5796-brass-band-palm-island-june-1931.png'), year: '1931', description: 'Brass band, Palm Island, June 1931' },
    { path: A('queensland-state-archives-1359-natives-mending-fishing-nets-at-palm-island-c-1935.png'), year: '1935', description: 'Natives mending fishing nets at Palm Island, c.1935' },
  ],
  dormitories: [
    { path: A('findandconnect-girls-home-palm-island-1933.jpg'), year: '1933', description: 'Girls\' Home, Palm Island Aboriginal Settlement, 1933 — Find and Connect / SLQ' },
    { path: A('findandconnect-boys-dormitory-palm-island-1931.jpg'), year: '1931', description: 'Boys Dormitory inspection, Palm Island, 1931 — Find and Connect / QSA' },
    { path: A('queensland-state-archives-5814-girls-dormitory-palm-island-june-1931.png'), year: '1931', description: 'Girls dormitory, Palm Island, June 1931' },
    { path: A('queensland-state-archives-1368-happy-moments-on-palm-island-c-1935.png'), year: '1935', description: 'Happy moments on Palm Island, c.1935' },
    { path: A('queensland-state-archives-5799-residents-of-palm-island-june-1931.png'), year: '1931', description: 'Residents of Palm Island, June 1931' },
    { path: A('queensland-state-archives-1357-palm-island-showing-guest-house-and-school-c-1935.png'), year: '1935', description: 'Palm Island showing guest house and school, c.1935' },
    { path: A('cricketonpi.jpg'), year: '1930', description: 'Cricket on Palm Island' },
    { path: A('queensland-state-archives-917-palm-island-north-queensland-c-1931.png'), year: '1931', description: 'Palm Island, North Queensland, c.1931' },
  ],
  'strike-1957': [
    { path: A('queensland-state-archives-5799-residents-of-palm-island-june-1931.png'), year: '1931', description: 'Residents of Palm Island, June 1931' },
    { path: A('queensland-state-archives-5795-residents-of-palm-island-june-1931.png'), year: '1931', description: 'Residents of Palm Island, June 1931' },
    { path: A('queensland-state-archives-5796-brass-band-palm-island-june-1931.png'), year: '1931', description: 'Brass band, Palm Island, June 1931' },
    { path: A('queensland-state-archives-1362-main-street-palm-island-showing-mango-trees-and-palms-c-1935.png'), year: '1935', description: 'Main Street, Palm Island, showing mango trees and palms, c.1935' },
    { path: A('queensland-state-archives-1359-natives-mending-fishing-nets-at-palm-island-c-1935.png'), year: '1935', description: 'Natives mending fishing nets at Palm Island, c.1935' },
    { path: A('queensland-state-archives-1355-palm-island-c-1935.png'), year: '1935', description: 'Palm Island, c.1935' },
  ],
  mulrunji: [
    { path: A('nma-protest-palm-island-2006.jpg'), year: '2006', description: 'Palm Island residents protest during Premier Beattie\'s visit, 2006 — National Museum of Australia' },
    { path: '/annual-report-photos/2018-19/photo-012.jpg', year: '2018', description: 'Community march — "Domestic Violence It\'s With Us!" banner' },
    { path: '/annual-report-photos/2023-24/photo-011.jpg', year: '2023', description: 'Woman speaking into microphone at community event' },
    { path: '/annual-report-photos/2017-18/photo-011.jpg', year: '2017', description: 'Elder woman with thoughtful expression' },
    { path: '/annual-report-photos/2013-14/photo-002.jpg', year: '2013', description: 'Young women on pier looking out to sea' },
    { path: '/annual-report-photos/2021-22/photo-005.jpg', year: '2021', description: 'Silhouette of pier at sunset' },
    { path: '/annual-report-photos/2018-19/photo-006.jpg', year: '2018', description: 'Men gathered by the water' },
  ],
  'self-determination': [
    { path: '/annual-report-photos/2009-10/photo-022.jpg', year: '2009', description: 'Man standing next to Palm Island Community Company logo' },
    { path: '/annual-report-photos/2012-13/photo-001.jpg', year: '2012', description: 'Community leaders at new playground project' },
    { path: '/annual-report-photos/2021-22/photo-052.jpg', year: '2021', description: 'Speaker addressing community at outdoor event' },
    { path: '/annual-report-photos/2015-16/photo-008.jpg', year: '2015', description: 'Three staff members in PICC shirts, thumbs up' },
    { path: '/annual-report-photos/2021-22/photo-078.jpg', year: '2021', description: 'Large group in Indigenous shirts' },
    { path: '/annual-report-photos/2013-14/photo-007.jpg', year: '2013', description: 'Women in Palm Island Community Shop' },
  ],
  picc: [
    { path: '/annual-report-photos/2017-18/photo-005.jpg', year: '2017', description: 'Children on rocks at beach' },
    { path: '/annual-report-photos/2015-16/photo-000.jpg', year: '2015', description: 'Women and children at railing' },
    { path: '/annual-report-photos/2022-23/photo-010.jpg', year: '2022', description: 'Kids jumping into turquoise ocean' },
    { path: '/annual-report-photos/2020-21/photo-047.jpg', year: '2020', description: 'Children playing in water' },
    { path: '/annual-report-photos/2013-14/photo-000.jpg', year: '2013', description: 'Family group portrait' },
    { path: '/annual-report-photos/2021-22/photo-069.jpg', year: '2021', description: 'Community event with inflatables' },
  ],
}

const WIKI_HUB_HERO = A('queensland-state-archives-1384-palm-island-an-aboriginals-settlement-from-the-sea-c-1935.png')
const HISTORY_INDEX_HERO = A('queensland-state-archives-917-palm-island-north-queensland-c-1931.png')

export function getChapterHeroImage(slug: string): string {
  return CHAPTER_HERO_IMAGES[slug] || WIKI_HUB_HERO
}

export function getWikiHubHero(): string {
  return WIKI_HUB_HERO
}

export function getHistoryIndexHero(): string {
  return HISTORY_INDEX_HERO
}

export function getChapterGalleryPhotos(slug: string): PhotoEntry[] {
  return CHAPTER_GALLERY_PHOTOS[slug] || []
}

export function getPhotosByYearRange(startYear: number, endYear: number): PhotoEntry[] {
  const allPhotos = photoManifest.hero_images as PhotoEntry[]
  return allPhotos.filter((photo) => {
    const yearStr = photo.year.split('-')[0]
    const year = parseInt(yearStr.length === 2 ? `20${yearStr}` : yearStr)
    return year >= startYear && year <= endYear
  })
}

export function getRandomCommunityPhotos(count: number): PhotoEntry[] {
  const allPhotos = photoManifest.hero_images as PhotoEntry[]
  const shuffled = [...allPhotos].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
