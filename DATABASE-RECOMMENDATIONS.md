# Database Architecture Recommendations
## Palm Island Community Repository

## ✅ Current Architecture: EXCELLENT

Your PostgreSQL + Supabase setup is **world-class** and perfectly aligned with Indigenous data sovereignty principles.

---

## 🎯 Recommended Enhancements (Not Changes)

### 1. **Hybrid Storage Strategy**

```yaml
Hot Data (Supabase Cloud):
  - Active stories (last 2 years)
  - User profiles
  - Recent media metadata
  - Search indices
  - Fast access for web platform

Cold Storage (On-Island Server):
  - Full archive (all years)
  - Original media files
  - Complete data sovereignty
  - Disaster recovery backup

Sync Strategy:
  - Nightly sync from cloud → on-island
  - Cloud is working copy
  - On-island is source of truth
```

**Implementation:**
- Keep current Supabase setup for live platform
- Add weekly PostgreSQL dump to on-island server
- Use Supabase Storage sync to local NAS/server

---

### 2. **Performance Optimizations**

#### **Add Database Indices**

```sql
-- Story search performance
CREATE INDEX idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_status_access ON stories(status, access_level);
CREATE INDEX idx_stories_published ON stories(published_at DESC);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);

-- Full-text search
CREATE INDEX idx_stories_search ON stories
  USING GIN(to_tsvector('english', title || ' ' || content));

-- Vector search (when AI implemented)
CREATE INDEX idx_stories_embedding ON stories
  USING ivfflat(content_embedding vector_cosine_ops);

-- Media lookups
CREATE INDEX idx_story_media_story ON story_media(story_id);
CREATE INDEX idx_story_media_type ON story_media(media_type);

-- Engagement tracking
CREATE INDEX idx_engagement_profile ON engagement_activities(profile_id);
CREATE INDEX idx_engagement_date ON engagement_activities(created_at DESC);
```

#### **Add Database Views for Common Queries**

```sql
-- View: Published stories with storyteller info
CREATE VIEW published_stories_view AS
SELECT
  s.id,
  s.title,
  s.content,
  s.category,
  s.access_level,
  s.published_at,
  s.views,
  s.likes,
  p.full_name,
  p.preferred_name,
  p.storyteller_type,
  array_agg(DISTINCT sm.media_type) as media_types,
  count(DISTINCT sm.id) as media_count
FROM stories s
LEFT JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN story_media sm ON s.id = sm.story_id
WHERE s.status = 'published'
GROUP BY s.id, p.id;

-- View: Story impact metrics
CREATE VIEW story_impact_metrics AS
SELECT
  s.id as story_id,
  s.title,
  s.category,
  count(DISTINCT ii.id) as impact_count,
  count(DISTINCT ea.id) as engagement_count,
  s.people_affected,
  s.views,
  s.shares
FROM stories s
LEFT JOIN impact_indicators ii ON s.id = ii.story_id
LEFT JOIN engagement_activities ea ON s.id = ea.target_id
GROUP BY s.id;

-- View: Service effectiveness dashboard
CREATE VIEW service_effectiveness_view AS
SELECT
  ssl.service_name,
  count(DISTINCT s.id) as story_count,
  count(DISTINCT s.storyteller_id) as unique_storytellers,
  sum(s.people_affected) as total_people_affected,
  avg(s.views) as avg_views,
  count(DISTINCT ii.id) as impact_indicators_count
FROM service_story_links ssl
LEFT JOIN stories s ON ssl.story_id = s.id
LEFT JOIN impact_indicators ii ON s.id = ii.story_id
WHERE s.status = 'published'
GROUP BY ssl.service_name;
```

---

### 3. **Data Backup & Recovery Strategy**

#### **Automated Backups**

```bash
#!/bin/bash
# /home/palm-island/backup-database.sh

# Daily backup to on-island server
pg_dump "postgresql://postgres.yvnuayzslukamizrlhwb:PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" \
  --format=custom \
  --file="/mnt/palm-island-storage/backups/palm-island-$(date +%Y%m%d).dump"

# Keep last 90 days
find /mnt/palm-island-storage/backups -name "palm-island-*.dump" -mtime +90 -delete

# Weekly full archive (compressed)
if [ $(date +%u) -eq 7 ]; then
  pg_dump "postgresql://..." \
    --format=custom \
    --file="/mnt/palm-island-storage/archives/palm-island-$(date +%Y%m%d)-weekly.dump"
fi
```

**Schedule with cron:**
```bash
# Run daily at 2 AM AEST
0 2 * * * /home/palm-island/backup-database.sh
```

#### **Point-in-Time Recovery**

Supabase Pro tier enables:
- Point-in-time recovery (restore to any second in last 7 days)
- Worth considering once platform is critical infrastructure

---

### 4. **Cultural Data Protection Enhancements**

#### **Row-Level Security (RLS) Policies**

```sql
-- Public stories: anyone can read
CREATE POLICY "Public stories are viewable by everyone"
  ON stories FOR SELECT
  USING (access_level = 'public' AND status = 'published');

-- Community stories: authenticated users only
CREATE POLICY "Community stories for authenticated users"
  ON stories FOR SELECT
  USING (
    access_level = 'community'
    AND status = 'published'
    AND auth.role() = 'authenticated'
  );

-- Restricted stories: elders and cultural advisors only
CREATE POLICY "Restricted stories for elders only"
  ON stories FOR SELECT
  USING (
    access_level = 'restricted'
    AND status = 'published'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_elder = TRUE OR is_cultural_advisor = TRUE)
    )
  );

-- Story creation: authenticated users only
CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = storyteller_id);

-- Story editing: own stories only, unless cultural advisor
CREATE POLICY "Users can edit own stories"
  ON stories FOR UPDATE
  USING (
    auth.uid() = storyteller_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_cultural_advisor = TRUE
    )
  );
```

#### **Audit Logging for Sensitive Content**

```sql
-- Track who accesses restricted cultural knowledge
CREATE TABLE cultural_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accessed_by UUID REFERENCES profiles(id),
  story_id UUID REFERENCES stories(id),
  access_type TEXT, -- view, download, share
  access_reason TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Function to log access to restricted stories
CREATE OR REPLACE FUNCTION log_restricted_access()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_level = 'restricted' THEN
    INSERT INTO cultural_access_log (accessed_by, story_id, access_type)
    VALUES (auth.uid(), NEW.id, 'view');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 5. **Storage Bucket Organization**

```yaml
Supabase Storage Buckets:

story-images:
  path: /{year}/{month}/{story-id}/{filename}
  access: public for public stories, authenticated for community
  max_size: 10MB per image
  allowed: jpg, png, webp

story-videos:
  path: /{year}/{month}/{story-id}/{filename}
  access: authenticated
  max_size: 100MB per video
  allowed: mp4, webm, mov

story-audio:
  path: /{year}/{month}/{story-id}/{filename}
  access: authenticated
  max_size: 50MB per audio
  allowed: mp3, m4a, wav

profile-images:
  path: /profiles/{profile-id}/{filename}
  access: public for directory-listed profiles
  max_size: 5MB
  allowed: jpg, png, webp

cultural-archives:
  path: /restricted/{year}/{elder-id}/{filename}
  access: restricted (elders + cultural advisors only)
  max_size: 500MB (for high-quality cultural documentation)
  allowed: all formats
  encryption: at-rest encryption enabled
```

**Storage Policies:**
```sql
-- Public story images (for public stories)
CREATE POLICY "Public story images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images' AND
    EXISTS (
      SELECT 1 FROM stories s
      JOIN story_media sm ON s.id = sm.story_id
      WHERE sm.file_path = name
      AND s.access_level = 'public'
      AND s.status = 'published'
    )
  );

-- Restricted cultural archives (elders only)
CREATE POLICY "Cultural archives for elders only"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cultural-archives' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_elder = TRUE OR is_cultural_advisor = TRUE)
    )
  );
```

---

## 📊 Migration Path to On-Island Hosting

When ready to move to complete on-island sovereignty:

### **Phase 1: Hybrid (Current)**
- Supabase cloud for live platform
- Nightly backups to on-island server

### **Phase 2: Dual-Primary**
- PostgreSQL on Palm Island server
- Supabase as read replica
- All writes to on-island, sync to cloud

### **Phase 3: Full Sovereignty**
- On-island as primary
- Cloud as disaster recovery only
- Community has complete control

### **Required Infrastructure:**
```yaml
On-Island Server Requirements:
  Hardware:
    - Server: Intel/AMD x64 or Raspberry Pi 4+ cluster
    - RAM: 8GB minimum, 16GB recommended
    - Storage: 500GB SSD (expandable)
    - Network: Reliable connection, UPS backup

  Software:
    - PostgreSQL 15+
    - pgvector extension
    - PostgREST (for API)
    - MinIO or similar (for file storage)
    - Nginx (reverse proxy)

  Maintenance:
    - 1-2 hours/month for updates
    - PICC Digital Service Centre can manage
    - Youth Tech Hub members as backup
```

---

## 🎯 Recommendation Summary

### **Keep Current Architecture** ✅

1. **PostgreSQL + Supabase** - Perfect choice
2. **Empathy Ledger Schema** - Comprehensive and well-designed
3. **Storage Buckets** - Appropriate for media

### **Add These Enhancements** 🔧

1. **Database indices** (5 minutes to implement)
2. **Backup automation** (1 hour to set up)
3. **RLS policies** (already partially done, complete them)
4. **Storage organization** (follow bucket structure above)

### **Future Considerations** 🔮

1. **Redis caching** (when you have 1000+ daily users)
2. **Read replicas** (when serving other communities)
3. **On-island primary** (when Digital Service Centre is ready)

---

## 💡 Next Actions

1. **Immediate**: Add database indices for performance
2. **This week**: Set up automated backups
3. **This month**: Complete RLS policies
4. **Next quarter**: Plan on-island server infrastructure

---

Your database architecture is **world-class** and perfectly suited for Indigenous data sovereignty while maintaining technical excellence. No fundamental changes needed - just optimize and protect what you've built.
