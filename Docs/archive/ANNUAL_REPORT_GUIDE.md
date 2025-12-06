# 📸 Annual Report & Photo Gallery Guide

## 🎉 What You've Built

You now have a complete **Annual Report system** with a stunning photo gallery for PICC! Here's what's ready:

### ✅ Database Setup
- **16 PICC Services** (Youth, Cultural Centre, Elder Support, etc.)
- **6 Storytellers** linked as organization members
- **6 Published Stories** (one per service)
- **Story Images Table** for photo management
- **Supabase Storage Buckets** for image hosting
- **2024 Annual Report** ready to populate with photos

### ✅ React Components
- **StoryImageUpload** - Drag & drop photo upload
- **PhotoGallery** - Beautiful masonry gallery with lightbox
- **SimplePhotoGallery** - Compact version for smaller displays

---

## 🚀 Quick Start

### 1. Run the SQL Scripts

```bash
# If you haven't already, run these in order:
1. setup_image_storage.sql    # Sets up Supabase Storage
2. picc_complete_setup.sql    # Creates services, stories, members
3. create_2024_annual_report.sql  # Creates the 2024 report
```

### 2. Add Photos to Stories

Create a page to upload photos (e.g., `app/stories/[id]/edit/page.tsx`):

```tsx
import { StoryImageUpload } from '@/components/StoryImageUpload'

export default function EditStoryPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Add Photos to Story</h1>
      
      <StoryImageUpload
        storyId={params.id}
        organizationSlug="picc"
        serviceSlug="youth-services"
        onUploadComplete={(url, id) => {
          console.log('Image uploaded!', url, id)
        }}
        maxFiles={10}
      />
    </div>
  )
}
```

### 3. Display Photo Gallery

Create an annual report page (e.g., `app/reports/[year]/page.tsx`):

```tsx
import { PhotoGallery, GalleryImage } from '@/components/PhotoGallery'
import { createClient } from '@/lib/supabase/server'

export default async function AnnualReportPage({ params }: { params: { year: string } }) {
  const supabase = createClient()
  
  // Fetch report with stories and images
  const { data: report } = await supabase
    .from('annual_reports')
    .select(`
      *,
      stories:annual_report_stories(
        story:stories(
          *,
          storyteller:profiles(*),
          images:story_images(*)
        )
      )
    `)
    .eq('report_year', params.year)
    .single()
  
  // Transform images for gallery
  const galleryImages: GalleryImage[] = report.stories.flatMap(s => 
    s.story.images.map(img => ({
      id: img.id,
      url: img.public_url,
      alt: img.alt_text,
      caption: img.caption,
      photographer: img.photographer_name,
      location: img.photo_location,
      storyTitle: s.story.title,
      storytellerName: s.story.storyteller.full_name
    }))
  )
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">{report.title}</h1>
      <p className="text-xl text-gray-600 mb-8">{report.subtitle}</p>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Services" value="16" />
        <StatCard label="Stories" value={report.stories.length} />
        <StatCard label="People Served" value="3,500+" />
        <StatCard label="Photos" value={galleryImages.length} />
      </div>
      
      {/* Photo Gallery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">2024 in Pictures</h2>
        <PhotoGallery images={galleryImages} columns={3} gap={4} />
      </section>
      
      {/* Stories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Community Stories</h2>
        {report.stories.map(s => (
          <StoryCard key={s.story.id} story={s.story} />
        ))}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
```

---

## 📁 Storage Structure

Your images are organized in Supabase Storage like this:

```
story-images/
├── picc/
│   ├── youth-services/
│   │   ├── 1234567890-story-id.jpg
│   │   └── 1234567891-story-id.jpg
│   ├── cultural-centre/
│   ├── healing-service/
│   └── family-wellbeing/
└── profile-images/
    └── picc/
```

---

## 🎨 Photo Gallery Features

### Main Gallery (`PhotoGallery`)
- ✨ Responsive masonry grid (2, 3, or 4 columns)
- 🖼️ Full-screen lightbox with keyboard navigation
- ⬅️➡️ Arrow keys to navigate, ESC to close
- 📊 Image metadata display (photographer, location, date)
- 💾 Download button
- 📱 Mobile-friendly with touch gestures
- ⚡ Lazy loading for performance
- 🎭 Smooth animations with Framer Motion

### Simple Gallery (`SimplePhotoGallery`)
- Compact grid layout
- Perfect for smaller sections
- No lightbox, just displays images

---

## 🔥 Usage Examples

### Upload Photos

```tsx
<StoryImageUpload
  storyId="story-uuid-here"
  organizationSlug="picc"
  serviceSlug="youth-services"
  maxFiles={10}
  onUploadComplete={(url, id) => {
    // Do something after upload
  }}
/>
```

### Display Gallery

```tsx
<PhotoGallery
  images={images}
  columns={3}  // 2, 3, or 4
  gap={4}      // 2, 4, 6, or 8
/>
```

### Simple Gallery

```tsx
<SimplePhotoGallery images={images} />
```

---

## 📊 Database Queries

### Get all images for a story

```sql
SELECT * FROM get_story_images('story-uuid-here');
```

### Get stories with images for annual report

```sql
SELECT 
  s.title,
  p.full_name as storyteller,
  COUNT(si.id) as image_count,
  ARRAY_AGG(si.public_url) as image_urls
FROM stories s
JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN story_images si ON s.id = si.story_id
WHERE s.tenant_id = 'picc-tenant-id'
GROUP BY s.id, s.title, p.full_name;
```

### Set primary image for a story

```sql
SELECT set_primary_story_image('story-uuid', 'image-uuid');
```

---

## 🎯 Next Steps

1. **Add Photos**: Use the StoryImageUpload component to add photos to your 6 stories
2. **Create Report Page**: Build an annual report viewer page
3. **Style It**: Customize the gallery colors and layout to match PICC branding
4. **Add More Stories**: Create more stories for other services
5. **Publish Report**: Update report status from 'drafting' to 'published'

---

## 🌟 Tips

- **Image Optimization**: Images are stored at full resolution. Consider adding thumbnail generation
- **Cultural Sensitivity**: Use the `cultural_sensitivity_flag` field for sensitive images
- **Elder Approval**: Set `requires_elder_approval` for traditional knowledge photos
- **Captions**: Always add captions and photographer credits for context
- **Alt Text**: Add descriptive alt text for accessibility

---

## 🐛 Troubleshooting

**Upload fails?**
- Check Supabase Storage is enabled
- Verify bucket policies are set
- Ensure file size is under 10MB

**Images not showing?**
- Check bucket is set to public
- Verify public URL is correct
- Check browser console for CORS errors

**Gallery not responsive?**
- Ensure Tailwind CSS is configured
- Check for conflicting styles
- Verify framer-motion is installed

---

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)

---

**Built with ❤️ for Palm Island Community Company**
