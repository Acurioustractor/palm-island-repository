# Media Assets Management System
## Palm Island Community Repository

### Overview
This media management system provides secure, organized storage for photos, videos, and audio files with proper cultural protocols and Supabase integration for Indigenous data sovereignty.

### Directory Structure
```
media-assets/
├── 📁 photos/
│   ├── 📁 community-events/
│   ├── 📁 cultural-activities/
│   ├── 📁 historical-images/
│   ├── 📁 elders-stories/
│   ├── 📁 youth-programs/
│   ├── 📁 environmental/
│   └── 📁 archive/
├── 📁 videos/
│   ├── 📁 community-stories/
│   ├── 📁 elder-interviews/
│   ├── 📁 cultural-practices/
│   ├── 📁 educational/
│   └── 📁 archive/
├── 📁 audio/
│   ├── 📁 elder-stories/
│   ├── 📁 traditional-music/
│   ├── 📁 language-recordings/
│   ├── 📁 community-meetings/
│   └── 📁 archive/
└── 📁 metadata/
    ├── 📄 photo-catalog.json
    ├── 📄 video-catalog.json
    ├── 📄 audio-catalog.json
    └── 📄 permissions-log.json
```

### File Naming Convention
Use consistent naming that includes date, category, and description:

**Format:** `YYYY-MM-DD_category_description_contributor`

**Examples:**
- `2024-03-15_community-event_sports-day_mary-johnson.jpg`
- `2024-02-10_elder-story_fishing-traditions_uncle-bob.mp4`
- `2024-01-20_cultural-practice_traditional-weaving_aunty-sue.mp3`

### Cultural Access Levels

#### 🌊 **Public Access** (`public/`)
- Community celebrations and achievements
- Educational content approved for sharing
- Historical images with proper permissions
- **Storage:** Supabase public bucket with community attribution

#### 🌿 **Community Access** (`community/`)
- Internal community events and activities
- Family gatherings and community meetings
- Youth programs and educational activities
- **Storage:** Supabase private bucket with community-only access

#### 🔥 **Restricted Access** (`restricted/`)
- Elder stories and traditional knowledge
- Cultural practices and ceremonies
- Sacred or sensitive content
- **Storage:** Encrypted Supabase bucket with role-based access

#### 📚 **Archive Access** (`archive/`)
- Historical preservation materials
- Research and documentation
- Long-term cultural preservation
- **Storage:** Secure backup with metadata preservation

### Media Metadata Schema

Each media file requires associated metadata stored in JSON format:

```json
{
  "file_name": "2024-03-15_community-event_sports-day_mary-johnson.jpg",
  "title": "Annual Palm Island Sports Day",
  "description": "Community members participating in traditional and modern sports",
  "contributor": {
    "name": "Mary Johnson",
    "contact": "mary.j@palmisland.com",
    "relationship": "Community member and event organizer"
  },
  "date_created": "2024-03-15",
  "date_added": "2024-03-16",
  "location": "Palm Island Sports Grounds",
  "category": "community-event",
  "access_level": "public",
  "cultural_protocols": {
    "requires_permission": false,
    "elder_approval": false,
    "family_consent": true,
    "cultural_sensitivity": "low"
  },
  "people": [
    {
      "name": "John Smith",
      "consent": true,
      "relationship": "participant"
    }
  ],
  "permissions": {
    "can_share_publicly": true,
    "can_use_in_reports": true,
    "attribution_required": true,
    "commercial_use": false
  },
  "technical": {
    "file_size": "2.5MB",
    "resolution": "1920x1080",
    "format": "JPEG",
    "quality": "high"
  },
  "supabase": {
    "bucket": "palm-island-public",
    "path": "community-events/2024/sports-day/",
    "url": "https://[supabase-url]/storage/v1/object/public/...",
    "backup_status": "completed"
  }
}
```

### Supabase Integration

#### Storage Buckets
```javascript
// Public bucket for community-approved content
const publicBucket = 'palm-island-public'

// Private bucket for community-only content  
const communityBucket = 'palm-island-community'

// Restricted bucket for cultural/elder content
const restrictedBucket = 'palm-island-restricted'

// Archive bucket for historical preservation
const archiveBucket = 'palm-island-archive'
```

#### Row Level Security (RLS) Policies
```sql
-- Public access for approved content
CREATE POLICY "Public read access" ON media_files 
FOR SELECT USING (access_level = 'public');

-- Community member access
CREATE POLICY "Community member access" ON media_files 
FOR SELECT USING (
  access_level IN ('public', 'community') 
  AND auth.role() = 'community_member'
);

-- Elder/Cultural advisor access
CREATE POLICY "Cultural advisor access" ON media_files 
FOR ALL USING (auth.role() = 'cultural_advisor');

-- Restricted access requires special permissions
CREATE POLICY "Restricted access" ON media_files 
FOR SELECT USING (
  access_level = 'restricted' 
  AND has_permission(auth.uid(), file_id)
);
```

### Upload Process

#### 1. Pre-Upload Checklist
- [ ] **Permission confirmed** from all people in media
- [ ] **Cultural sensitivity** assessed
- [ ] **Access level** determined
- [ ] **Attribution** information complete
- [ ] **File quality** meets standards
- [ ] **Backup plan** confirmed

#### 2. Upload Steps
1. **File Preparation**
   - Rename file following naming convention
   - Optimize file size for web/storage
   - Create metadata JSON file

2. **Cultural Review** (if required)
   - Submit to cultural advisor
   - Get elder approval (if needed)
   - Confirm community consent

3. **Supabase Upload**
   - Upload to appropriate bucket
   - Set correct permissions/policies
   - Generate secure URLs
   - Create database entry

4. **Quality Check**
   - Verify upload integrity
   - Test access permissions
   - Confirm metadata accuracy
   - Document in catalog

### Usage Guidelines

#### For Photos
- **Resolution:** Minimum 1080p for important images
- **Format:** JPEG for photos, PNG for graphics with transparency
- **Consent:** Required from all identifiable people
- **Cultural:** Check for sacred/ceremonial elements

#### For Videos
- **Quality:** HD minimum (1080p) for preservation
- **Format:** MP4 (H.264) for compatibility
- **Length:** Consider file size for storage/bandwidth
- **Audio:** Ensure clear audio for elder interviews

#### For Audio
- **Quality:** 44.1kHz, 16-bit minimum for archival
- **Format:** WAV for preservation, MP3 for sharing
- **Background Noise:** Minimize for elder recordings
- **Language:** Document language(s) spoken

### Backup and Preservation

#### Backup Strategy
1. **Primary:** Supabase cloud storage
2. **Secondary:** Local community server backup
3. **Archive:** External drive for long-term preservation
4. **Cultural:** Special handling for restricted content

#### Long-term Preservation
- Regular format migration for obsolete formats
- Metadata preservation across system changes
- Cultural protocols documentation
- Access permission inheritance

### Access Management

#### User Roles
- **Community Member:** Access to public and community content
- **Cultural Advisor:** Full access with responsibility for protocols
- **Elder Council:** Access to all elder/restricted content
- **Youth Coordinator:** Access to youth and educational content
- **Archive Manager:** Technical access for preservation

#### Permission Requests
1. Submit request through community channels
2. Cultural advisor review (if needed)
3. Elder approval (for restricted content)
4. Access granted with specific permissions
5. Usage tracked and monitored

---

### Quick Start Guide

#### Adding New Media
1. Use appropriate template from `/templates/`
2. Follow naming convention
3. Create metadata file
4. Check cultural protocols
5. Upload to correct folder/bucket
6. Update catalog files
7. Verify access and permissions

#### Finding Media
1. Check catalog files in `/metadata/`
2. Search by date, category, or contributor
3. Respect access level restrictions
4. Follow attribution requirements
5. Document usage in annual reports

---

*This media system ensures that our visual and audio stories are preserved securely while maintaining cultural protocols and community control over our narrative.*