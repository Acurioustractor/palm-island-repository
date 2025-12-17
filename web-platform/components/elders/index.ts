/**
 * Elders Page Components
 *
 * This module exports all components used in the Elders page and related features.
 *
 * ## Adding New Content Types to Elder Profiles
 *
 * To add a new content type (e.g., "interviews", "gallery", "projects"):
 *
 * 1. Add the data type to ElderContentSections.tsx:
 *    ```typescript
 *    export interface MyNewContentData {
 *      id: string
 *      title: string
 *      // ... other fields
 *    }
 *    ```
 *
 * 2. Add to ElderContentData interface:
 *    ```typescript
 *    export interface ElderContentData {
 *      // ... existing
 *      myNewContent?: MyNewContentData[]
 *    }
 *    ```
 *
 * 3. Create a section component:
 *    ```typescript
 *    function MyNewContentSection({ items }: { items: MyNewContentData[] }) {
 *      // render your content
 *    }
 *    ```
 *
 * 4. Register in CONTENT_SECTIONS array:
 *    ```typescript
 *    {
 *      id: 'myNewContent',
 *      title: 'My New Content',
 *      icon: <MyIcon className="w-5 h-5" />,
 *      emptyMessage: 'No content yet.',
 *      getData: (data) => data.myNewContent,
 *      render: (items) => <MyNewContentSection items={items} />,
 *    }
 *    ```
 *
 * 5. Pass the data from the server component to EldersPageClient
 *
 * ## Component Summary
 *
 * - EldersPageClient: Main client component for the public elders page
 * - EldersTripMap: Interactive Leaflet map showing trip stops
 * - QuoteCard: Displays quotes in various layouts
 * - StoryCard: Displays story links
 * - ImageLightbox: Fullscreen image gallery with navigation
 * - ElderContentRenderer: Extensible content section system
 */

// Main page client
export { default as EldersPageClient } from './EldersPageClient'
export type { ElderCard } from './EldersPageClient'

// Map component
export { default as EldersTripMap } from './EldersTripMap'
export type { TripStop } from './EldersTripMap'

// Quote components
export { default as QuoteCard, QuotesByTheme } from './QuoteCard'
export type { QuoteData } from './QuoteCard'

// Story components
export { default as StoryCard, StoryList } from './StoryCard'
export type { StoryData } from './StoryCard'

// Lightbox
export { default as ImageLightbox, useLightbox } from './ImageLightbox'
export type { LightboxImage } from './ImageLightbox'

// Content sections system
export {
  ElderContentRenderer,
  CONTENT_SECTIONS,
  SECTION_IDS,
} from './ElderContentSections'
export type {
  ElderContentData,
  InterviewData,
  MediaGalleryData,
  ProjectData,
  EventData,
  ConnectionData,
} from './ElderContentSections'
