import type { ComponentMeta } from '../registry'

export const meta: ComponentMeta = {
  name: 'ServiceCompactTile',
  description:
    'Compact tile for grid views (e.g. 24-up of every PICC service). 160px cover image (or section-tint chip when missing) above a body with name, optional description, and optional staff/clients metric strap. Drop into any grid; pairs with EL v2 picc:slot:service-<slug> photos.',
  pencilFile: 'picc-almanac-web.pen',
  pencilNodeId: 'C64BFX',
  category: 'almanac',
  implementations: ['web', 'pdf'],
  sortOrder: 35,
}
