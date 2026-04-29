import type { ComponentMeta } from '../registry'

export const meta: ComponentMeta = {
  name: 'FinancialBars',
  description:
    'Horizontal bar chart for financial breakdowns. All-caps header, label + display value per row, bar tinted by section room.',
  pencilFile: 'picc-almanac-web.pen',
  pencilNodeId: 'jpeCB',
  category: 'almanac',
  implementations: ['web', 'pdf'],
  sortOrder: 70,
}
