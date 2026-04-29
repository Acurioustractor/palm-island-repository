import type { ComponentMeta } from '../registry'

export const meta: ComponentMeta = {
  name: 'StatHero',
  description:
    'Big-number treatment for headline almanac stats. Fraunces 72/700 value, all-caps eyebrow label, optional caption + icon. Tint via section room (health/family/youth/justice/economic/education/governance) or brand colour.',
  pencilFile: 'picc-almanac-web.pen',
  pencilNodeId: 'XhjFb',
  category: 'almanac',
  implementations: ['web', 'pdf'],
  sortOrder: 20,
}
