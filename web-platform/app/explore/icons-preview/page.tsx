import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon'

const sections: { title: string; icons: { name: string; id: BespokeIconName }[] }[] = [
  {
    title: 'Services',
    icons: [
      { name: 'Health', id: 'health' },
      { name: 'Family', id: 'family' },
      { name: 'Children', id: 'children' },
      { name: 'Justice', id: 'justice' },
      { name: 'Crisis', id: 'crisis' },
      { name: 'Digital', id: 'digital' },
      { name: 'Economic', id: 'economic' },
      { name: 'Education', id: 'education' },
      { name: 'Youth', id: 'youth' },
      { name: 'Aged Care', id: 'aged-care' },
      { name: 'Community', id: 'community' },
      { name: 'Governance', id: 'governance' },
      { name: 'Housing', id: 'housing' },
      { name: 'Sport', id: 'sport' },
      { name: 'Mental Health', id: 'mental-health' },
      { name: 'Disability', id: 'disability' },
    ],
  },
  {
    title: 'Media Types',
    icons: [
      { name: 'Photo', id: 'photo' },
      { name: 'Video', id: 'video' },
      { name: 'Audio', id: 'audio' },
      { name: 'Story', id: 'story' },
      { name: 'Person', id: 'person' },
      { name: 'Collection', id: 'collection' },
    ],
  },
  {
    title: 'Sentiments',
    icons: [
      { name: 'Positive', id: 'positive' },
      { name: 'Inspiring', id: 'inspiring' },
      { name: 'Reflective', id: 'reflective' },
      { name: 'Grateful', id: 'grateful' },
      { name: 'Hopeful', id: 'hopeful' },
      { name: 'Determined', id: 'determined' },
      { name: 'Proud', id: 'proud' },
    ],
  },
  {
    title: 'Cultural Protocols',
    icons: [
      { name: 'Traditional Knowledge', id: 'traditional-knowledge' },
      { name: 'Public', id: 'public' },
      { name: 'Community Only', id: 'community-only' },
      { name: 'Restricted', id: 'restricted' },
    ],
  },
  {
    title: 'General',
    icons: [
      { name: 'Land', id: 'land' },
      { name: 'Culture', id: 'culture' },
      { name: 'Knowledge', id: 'knowledge' },
      { name: 'Timeline', id: 'timeline' },
      { name: 'Quote', id: 'quote' },
      { name: 'Vision', id: 'vision' },
      { name: 'Campfire', id: 'campfire' },
      { name: 'Ocean', id: 'ocean' },
      { name: 'Search', id: 'search' },
    ],
  },
]

const allIcons = sections.flatMap(s => s.icons)

export default function IconsPreview() {
  return (
    <div className="min-h-screen bg-white p-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">PICC Bespoke Icons</h1>
      <p className="text-gray-500 mb-12">
        {allIcons.length} icons — ochre line art, hand-drawn feel, single colour
      </p>

      {sections.map(section => (
        <div key={section.title} className="mb-14">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2">
            {section.title}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
            {section.icons.map(icon => (
              <div key={icon.id} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-stone-50 border border-stone-100">
                  <BespokeIcon name={icon.id} size={40} />
                </div>
                <span className="text-[11px] text-gray-500 text-center leading-tight">{icon.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-14">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2">
          Size Comparison
        </h2>
        {[20, 28, 40, 64].map(size => (
          <div key={size} className="flex items-center gap-4 mb-4">
            <span className="text-xs text-gray-400 w-10 text-right font-mono">{size}px</span>
            <div className="flex gap-3 items-center flex-wrap">
              {allIcons.slice(0, 10).map(icon => (
                <BespokeIcon key={icon.id} name={icon.id} size={size} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-14">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2">
          On Dark Background
        </h2>
        <div className="bg-[#1a1612] rounded-2xl p-8">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
            {allIcons.map(icon => (
              <div key={icon.id} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  <BespokeIcon name={icon.id} size={36} darkMode />
                </div>
                <span className="text-[10px] text-white/40 text-center leading-tight">{icon.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-14">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2">
          Inline with Text
        </h2>
        <div className="space-y-2 max-w-xl">
          {sections[0].icons.slice(0, 6).map(icon => (
            <div key={icon.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200">
              <BespokeIcon name={icon.id} size={24} />
              <span className="text-[15px] text-gray-800">{icon.name} Services</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
