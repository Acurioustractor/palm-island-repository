import { SectionOpener } from './web'

export const sampleProps = {
  eyebrow: 'CHILDREN & FAMILIES',
  title: 'A workforce of the place',
  subtitle: 'by the people of the place — built room by room over Year 17.',
  section: 'family' as const,
}

export default function Sample() {
  return <SectionOpener {...sampleProps} />
}
