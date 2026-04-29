import type { ComponentMeta } from '../registry'

export const meta: ComponentMeta = {
  name: 'VideoOverlayCard',
  description:
    'Single flexible video card covering the 6 Pencil treatments via three knobs: surface (shell / midnight / ocean), captionPosition (below the media or overlaid bottom), and aspect (16:9 / 1:1 / 9:16 / 4:3). Pairs with EL v2 picc:slot:video-<scene> via getVideoOverlay(scene). Renders poster as fallback when video can\'t play; section-tint placeholder when neither.',
  pencilFile: 'picc-almanac-web.pen',
  pencilNodeId: 'GMfEM',
  category: 'almanac',
  implementations: ['web', 'pdf'],
  sortOrder: 60,
}
